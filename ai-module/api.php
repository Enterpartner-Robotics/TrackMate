<?php
/**
 * TrackMate AI API végpont
 *
 * Használat (AJAX / fetch):
 *   POST /ai-module/api.php
 *   Body: action=reggeli_check&datum=2026-02-17&osztaly_id=7
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
set_time_limit(120);

require_once __DIR__ . '/TrackMateAI.php';

try {
    $ai     = new TrackMateAI();
    $action = $_POST['action'] ?? $_GET['action'] ?? '';
    $datum  = $_POST['datum']  ?? $_GET['datum']  ?? date('Y-m-d');

    switch ($action) {

        // =================================================================
        // 1. REGGELI CHECK
        // POST: action=reggeli_check [&datum=2026-02-17] [&osztaly_id=7]
        // =================================================================
        case 'reggeli_check':
            $osztalyId = !empty($_POST['osztaly_id']) ? (int) $_POST['osztaly_id'] : null;
            $eredmeny  = $ai->reggeliCheck($datum, $osztalyId);

            echo json_encode([
                'status'   => 'ok',
                'tipus'    => 'data',
                'eredmeny' => $eredmeny,
            ], JSON_UNESCAPED_UNICODE);
            break;

        // =================================================================
        // 2. NAP VÉGI ÖSSZEGZÉS
        // POST: action=nap_vege [&datum=...] [&felh_id=5] [&osztaly_id=7]
        // =================================================================
        case 'nap_vege':
            $felhId    = !empty($_POST['felh_id'])    ? (int) $_POST['felh_id']    : null;
            $osztalyId = !empty($_POST['osztaly_id']) ? (int) $_POST['osztaly_id'] : null;

            $eredmeny = $ai->napVegiOsszegzes($datum, $felhId, $osztalyId);
            echo json_encode([
                'status'   => 'ok',
                'tipus'    => 'ai_text',
                'eredmeny' => $eredmeny,
            ], JSON_UNESCAPED_UNICODE);
            break;

        // =================================================================
        // 3. FELADATJAVASLAT
        // POST: action=feladat_javaslat&felh_id=5 [&kontextus="backend"]
        // =================================================================
        case 'feladat_javaslat':
            $felhId    = (int) ($_POST['felh_id'] ?? 0);
            $kontextus = $_POST['kontextus'] ?? '';
            if (!$felhId) throw new Exception('Hiányzó felh_id');

            $eredmeny = $ai->feladatJavaslat($felhId, $kontextus);
            echo json_encode([
                'status'   => 'ok',
                'tipus'    => 'ai_text',
                'eredmeny' => $eredmeny,
            ], JSON_UNESCAPED_UNICODE);
            break;

        // =================================================================
        // 4. IDŐSZAKI RIPORT
        // POST: action=riport&datum_tol=2026-01-01&datum_ig=2026-01-31
        //       [&osztaly_id=7] [&felh_id=5]
        // =================================================================
        case 'riport':
            $tol       = $_POST['datum_tol'] ?? '';
            $ig        = $_POST['datum_ig']  ?? '';
            $osztalyId = !empty($_POST['osztaly_id']) ? (int) $_POST['osztaly_id'] : null;
            $felhId    = !empty($_POST['felh_id'])    ? (int) $_POST['felh_id']    : null;
            if (!$tol || !$ig) throw new Exception('Hiányzó dátumok');

            $eredmeny = $ai->idoszakiRiport($tol, $ig, $osztalyId, $felhId);
            echo json_encode([
                'status'   => 'ok',
                'tipus'    => 'ai_text',
                'eredmeny' => $eredmeny,
            ], JSON_UNESCAPED_UNICODE);
            break;

        // =================================================================
        // 5. HIÁNYZÁS-FIGYELŐ
        // POST: action=hianyzas [&datum=...] [&osztaly_id=7]
        // POST: action=hianyzas_riport&datum_tol=...&datum_ig=... [&osztaly_id=7]
        // =================================================================
        case 'hianyzas':
            $osztalyId = !empty($_POST['osztaly_id']) ? (int) $_POST['osztaly_id'] : null;
            $eredmeny  = $ai->hianyzasEllenorzes($datum, $osztalyId);

            echo json_encode([
                'status'   => 'ok',
                'tipus'    => 'data',
                'eredmeny' => $eredmeny,
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'hianyzas_riport':
            $tol       = $_POST['datum_tol'] ?? '';
            $ig        = $_POST['datum_ig']  ?? '';
            $osztalyId = !empty($_POST['osztaly_id']) ? (int) $_POST['osztaly_id'] : null;
            if (!$tol || !$ig) throw new Exception('Hiányzó dátumok');

            $eredmeny = $ai->hianyzasRiport($tol, $ig, $osztalyId);
            echo json_encode([
                'status'   => 'ok',
                'tipus'    => 'ai_text',
                'eredmeny' => $eredmeny,
            ], JSON_UNESCAPED_UNICODE);
            break;

        // =================================================================
        // 6. BEJEGYZÉS-MINŐSÉG
        // POST: action=bejegyzes_minoseg [&datum=...] [&osztaly_id=7]
        // =================================================================
        case 'bejegyzes_minoseg':
            $osztalyId = !empty($_POST['osztaly_id']) ? (int) $_POST['osztaly_id'] : null;
            $eredmeny  = $ai->bejegyzesMinoseg($datum, $osztalyId);

            echo json_encode([
                'status'   => 'ok',
                'tipus'    => 'ai_text',
                'eredmeny' => $eredmeny,
            ], JSON_UNESCAPED_UNICODE);
            break;

        // =================================================================
        // 7. PROJEKT ELŐREHALADÁS
        // POST: action=projekt_elorehaladas [&projekt_id=2]
        // =================================================================
        case 'projekt_elorehaladas':
            $projektId = !empty($_POST['projekt_id']) ? (int) $_POST['projekt_id'] : null;
            $eredmeny  = $ai->projektElorehaladas($projektId);

            echo json_encode([
                'status'   => 'ok',
                'tipus'    => 'ai_text',
                'eredmeny' => $eredmeny,
            ], JSON_UNESCAPED_UNICODE);
            break;

        // =================================================================
        // META: osztály és projekt listák a frontendnek
        // =================================================================
        case 'osztalyok':
            $db = new TrackMateDB();
            echo json_encode([
                'status'   => 'ok',
                'eredmeny' => $db->getOsztalyok(),
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'projektek':
            $db = new TrackMateDB();
            echo json_encode([
                'status'   => 'ok',
                'eredmeny' => $db->getAktivProjektek(),
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'diakok':
            $db = new TrackMateDB();
            $osztalyId = !empty($_POST['osztaly_id']) ? (int) $_POST['osztaly_id'] : null;
            echo json_encode([
                'status'   => 'ok',
                'eredmeny' => $db->getAktivDiakok($osztalyId),
            ], JSON_UNESCAPED_UNICODE);
            break;

        // =================================================================
        // 8. MUNKALAP AUTO-LEZÁRÁS
        // POST: action=auto_zaras [&datum=...] [&auto_close=1] [&zaras_ora=14:00]
        // POST: action=tulfuto_aktivitasok [&datum_tol=...] [&datum_ig=...]
        // =================================================================
        case 'auto_zaras':
            $autoClose = !empty($_POST['auto_close']) && $_POST['auto_close'] === '1';
            $zarasOra  = $_POST['zaras_ora'] ?? '14:00';

            $eredmeny = $ai->munkalapAutoZaras($datum, $autoClose, $zarasOra);
            echo json_encode([
                'status'   => 'ok',
                'tipus'    => 'data',
                'eredmeny' => $eredmeny,
            ], JSON_UNESCAPED_UNICODE);
            break;

        default:
            throw new Exception("Ismeretlen action: '$action'. Használható: reggeli_check, nap_vege, feladat_javaslat, riport, hianyzas, hianyzas_riport, bejegyzes_minoseg, projekt_elorehaladas, osztalyok, projektek, diakok");
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'hiba'   => $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
}
