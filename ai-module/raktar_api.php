<?php
/**
 * TrackMate Raktár - Képfelismerés API
 * 
 * Kép feltöltés → Léna felismeri az alkatrészt + darabszámot
 * Összeveti a TORZS_aru táblával (meglévő termékek)
 *
 * POST /ai-module/raktar_api.php
 *   - action: identify (felismerés) / confirm (bevételezés)
 *   - image: base64 kép VAGY file upload
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
set_time_limit(120);

require_once __DIR__ . '/GeminiAI.php';
require_once __DIR__ . '/config.php';

try {
    $action = $_POST['action'] ?? '';
    
    $db = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    switch ($action) {

        // =================================================================
        // KÉPFELISMERÉS
        // POST: action=identify, image=<base64> VAGY file upload
        // =================================================================
        case 'identify':
            // Kép fogadása (base64 vagy file upload)
            $imageData = '';
            $mimeType  = 'image/jpeg';

            if (!empty($_POST['image'])) {
                // Base64 (frontendről camera/canvas)
                $raw = $_POST['image'];
                // data:image/jpeg;base64,.... formátum kezelése
                if (preg_match('/^data:(image\/\w+);base64,(.+)$/', $raw, $m)) {
                    $mimeType  = $m[1];
                    $imageData = $m[2];
                } else {
                    $imageData = $raw;
                }
            } elseif (!empty($_FILES['image'])) {
                // File upload
                $file      = $_FILES['image'];
                $mimeType  = $file['type'] ?: 'image/jpeg';
                $imageData = base64_encode(file_get_contents($file['tmp_name']));
            } else {
                throw new Exception('Nincs kép! Küldj "image" mezőt (base64 vagy file).');
            }

            // Meglévő termékek lekérdezése a prompt-hoz
            $stmt = $db->query("
                SELECT a.aru_id, a.aru_megnevezes, t.tipus_megnevezes, a.file_link
                FROM TORZS_aru a
                LEFT JOIN TORZS_aru_tipus t ON t.aru_tipus_id = a.aru_tipus_id
                WHERE a.aktiv = 1
                ORDER BY a.aru_megnevezes
            ");
            $termekek = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $termekLista = "";
            foreach ($termekek as $t) {
                $termekLista .= "  - aru_id={$t['aru_id']}: {$t['aru_megnevezes']}";
                if ($t['tipus_megnevezes']) $termekLista .= " (típus: {$t['tipus_megnevezes']})";
                $termekLista .= "\n";
            }

            // AI prompt
            $systemPrompt = "Te Léna vagy, az Enterpartner Kft. raktári AI asszisztense.
A cég robotikával, elektronikával foglalkozik. Alkatrészeket, szervókat, kábeleket, csavarokat, tápegységeket tárol.";

            $prompt = "Nézd meg ezt a képet és azonosítsd a rajta lévő tárgyat/alkatrészt!

FELADAT:
1. Mi látható a képen? (részletes leírás)
2. Hány darab van belőle? (számold meg amennyire lehetséges)
3. Melyik meglévő raktári termékhez illik leginkább?

MEGLÉVŐ RAKTÁRI TERMÉKEK:
$termekLista

VÁLASZ FORMÁTUM (JSON):
{
  \"felismert_nev\": \"az alkatrész/tárgy neve magyarul\",
  \"leiras\": \"rövid leírás amit látsz\",
  \"darabszam\": 1,
  \"darabszam_biztos\": true,
  \"egyezo_aru_id\": null,
  \"egyezo_aru_nev\": null,
  \"egyezes_bizonyossag\": 0,
  \"javasolt_tipus\": \"Elektronikai eszköz\",
  \"megjegyzes\": \"egyéb megjegyzés\"
}

SZABÁLYOK:
- darabszam: amit megszámoltál (ha nem biztos, adj becslést)
- darabszam_biztos: true ha biztosan meg tudtad számolni, false ha becslés
- egyezo_aru_id: ha a meglévő listából felismered, írd be az aru_id-t. Ha nincs egyezés: null
- egyezes_bizonyossag: 0-100 közötti szám, mennyire vagy biztos az egyezésben
- javasolt_tipus: Elektronikai eszköz / Szerszám / Kábel / Csavar / Periféria / Szervó / Micro Szervó / Tápegység";

            $ai = new GeminiAI();
            $result = $ai->generateJsonWithImage($prompt, $imageData, $mimeType, $systemPrompt);

            // Egyezés ellenőrzés — ha van aru_id, hozzáírjuk a raktári adatokat
            if (!empty($result['egyezo_aru_id'])) {
                $stmt = $db->prepare("
                    SELECT a.aru_id, a.aru_megnevezes, a.file_link, t.tipus_megnevezes,
                           r.raktar_id, r.darab AS keszlet
                    FROM TORZS_aru a
                    LEFT JOIN TORZS_aru_tipus t ON t.aru_tipus_id = a.aru_tipus_id
                    LEFT JOIN TM_raktar r ON r.aru_id = a.aru_id
                    WHERE a.aru_id = ?
                ");
                $stmt->execute([$result['egyezo_aru_id']]);
                $raktarAdat = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($raktarAdat) {
                    $result['raktar'] = $raktarAdat;
                }
            }

            echo json_encode([
                'status'   => 'ok',
                'eredmeny' => $result,
            ], JSON_UNESCAPED_UNICODE);
            break;

        // =================================================================
        // BEVÉTELEZÉS (a felismerés után)
        // POST: action=confirm, aru_id=5, darab=10 [&megjegyzes=...] [&felh_id=1]
        // =================================================================
        case 'confirm':
            $aruId     = (int) ($_POST['aru_id'] ?? 0);
            $darab     = (int) ($_POST['darab'] ?? 0);
            $megjegyzes = $_POST['megjegyzes'] ?? 'AI képfelismerés - Léna';
            $felhId    = (int) ($_POST['felh_id'] ?? ($_SESSION['felh_id'] ?? 0));

            if (!$aruId || !$darab) {
                throw new Exception('Hiányzó aru_id vagy darab');
            }

            // Raktárkészlet frissítése
            $stmt = $db->prepare("SELECT raktar_id, darab FROM TM_raktar WHERE aru_id = ?");
            $stmt->execute([$aruId]);
            $raktar = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($raktar) {
                // Meglévő tétel → darab növelése
                $ujDarab = $raktar['darab'] + $darab;
                $stmt = $db->prepare("UPDATE TM_raktar SET darab = ? WHERE raktar_id = ?");
                $stmt->execute([$ujDarab, $raktar['raktar_id']]);
                $raktarId = $raktar['raktar_id'];
            } else {
                // Új tétel a raktárba
                $stmt = $db->prepare("INSERT INTO TM_raktar (aru_id, darab, megjegyzes) VALUES (?, ?, ?)");
                $stmt->execute([$aruId, $darab, $megjegyzes]);
                $raktarId = $db->lastInsertId();
            }

            // Bejegyzés a raktar_bejegyzes-be (bevételezés = 1)
            $stmt = $db->prepare("
                INSERT INTO TM_raktar_bejegyzes 
                    (felh_id, aru_id, raktar_id, bejegyzes_tipus_id, darab, megjegyzes, felvetel_datum, datum)
                VALUES (?, ?, ?, 1, ?, ?, ?, CURDATE())
            ");
            $stmt->execute([
                $felhId, $aruId, $raktarId, $darab, $megjegyzes, time()
            ]);

            echo json_encode([
                'status'   => 'ok',
                'eredmeny' => [
                    'aru_id'    => $aruId,
                    'darab'     => $darab,
                    'raktar_id' => $raktarId,
                    'uj_keszlet' => ($raktar ? $raktar['darab'] + $darab : $darab),
                    'uzenet'    => "Bevételezve: {$darab} db"
                ]
            ], JSON_UNESCAPED_UNICODE);
            break;

        // =================================================================
        // TERMÉKEK LISTÁJA (dropdown-hoz)
        // =================================================================
        case 'termekek':
            $stmt = $db->query("
                SELECT a.aru_id, a.aru_megnevezes, t.tipus_megnevezes, r.darab AS keszlet
                FROM TORZS_aru a
                LEFT JOIN TORZS_aru_tipus t ON t.aru_tipus_id = a.aru_tipus_id
                LEFT JOIN TM_raktar r ON r.aru_id = a.aru_id
                WHERE a.aktiv = 1
                ORDER BY a.aru_megnevezes
            ");
            echo json_encode([
                'status'   => 'ok',
                'eredmeny' => $stmt->fetchAll(PDO::FETCH_ASSOC),
            ], JSON_UNESCAPED_UNICODE);
            break;

        default:
            throw new Exception("Ismeretlen action: '$action'. Használható: identify, confirm, termekek");
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'hiba'   => $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
}
