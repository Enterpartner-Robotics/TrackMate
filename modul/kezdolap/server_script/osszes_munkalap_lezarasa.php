<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

date_default_timezone_set('Europe/Budapest');

$now_dt     = date('Y-m-d H:i:s');
$today      = date('Y-m-d');
$time_stamp = time();

// 1) Minden nyitott (állapot=1) aktivitás lekérdezése, projekttel és indító felhasználóval
$q = "
SELECT 
    tma.munkalap_aktivitas_id,
    tma.munkalap_id,
    tma.kezdes_ido,
    tma.felh_id            AS indito_felh_id,
    tm.projekt_id
FROM TM_munkalap_aktivitas tma
JOIN TM_munkalap tm ON tm.munkalap_id = tma.munkalap_id
WHERE tma.munkalap_allapot = 1
ORDER BY tma.munkalap_aktivitas_id ASC
";
$rs = kerdes($q);
if (!$rs) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Lekérdezési hiba a nyitott munkalapoknál.',
        'error'   => true
    ]);
    exit();
}

if (mysqli_num_rows($rs) === 0) {
    echo json_encode([
        'status'       => 'error',
        'closed_count' => 0,
        'message'      => 'Nincs lezárandó nyitott munkalap-aktivitás.'
    ]);
    exit();
}

$closedCount = 0;
$errors      = [];

while ($row = mysqli_fetch_assoc($rs)) {
    $munkalapAktId  = $row['munkalap_aktivitas_id'];
    $munkalapId     = $row['munkalap_id'];
    $kezdesIdo      = $row['kezdes_ido'];
    $inditoFelhId   = $row['indito_felh_id'];  // IDE ÍRUNK majd a projekt összesítőbe
    $projektId      = $row['projekt_id'];

    // 2) Időkülönbség számítás (tizedes óra)
    try {
        if (!$kezdesIdo) { throw new Exception('Hiányzik a kezdes_ido.'); }
        $kezdes = new DateTime($kezdesIdo);
        $zaras  = new DateTime($now_dt);
        $diff   = $zaras->diff($kezdes);

        $teljesOra  = ($diff->days * 24) + $diff->h;
        $perc       = $diff->i;
        $oraTizedes = $teljesOra + ($perc / 60);

        if ($oraTizedes < 0) { $oraTizedes = 0; }
    } catch (Throwable $e) {
        $errors[] = [
            'munkalap_aktivitas_id' => $munkalapAktId,
            'reason' => 'Dátum hiba: ' . $e->getMessage()
        ];
        continue;
    }

    // 3) Tranzakció indítása
    kerdes("START TRANSACTION");

    // 3/a) Utolsó lezárt sor alapján az adott munkalap kumulált órája
    $oraSumQ = "
        SELECT ossz_ora 
        FROM TM_munkalap_aktivitas
        WHERE munkalap_id = '$munkalapId'
          AND munkalap_allapot = 2
        ORDER BY munkalap_aktivitas_id DESC
        LIMIT 1
    ";
    $oraSumRs  = kerdes($oraSumQ);
    $elozoOssz = 0.0;
    if ($oraSumRs && ($o = mysqli_fetch_assoc($oraSumRs)) && $o['ossz_ora'] !== null) {
        $elozoOssz = (float)$o['ossz_ora'];
    }
    $ujOsszOra = number_format($elozoOssz + (float)$oraTizedes, 4, '.', '');

    // 3/b) Nyitott sor lezárása
    $upd = "
        UPDATE TM_munkalap_aktivitas
           SET zaras_ido        = '$now_dt',
               munkalap_allapot = 2,
               ossz_ora         = '$ujOsszOra',
               munkaido_felh    = '" . number_format($oraTizedes, 4, '.', '') . "'
         WHERE munkalap_aktivitas_id = '$munkalapAktId'
           AND munkalap_allapot = 1
        LIMIT 1
    ";
    $okUpd = kerdes($upd);
    if (!$okUpd) {
        kerdes("ROLLBACK");
        $errors[] = [
            'munkalap_aktivitas_id' => $munkalapAktId,
            'reason' => 'Frissítési hiba TM_munkalap_aktivitas táblában.'
        ];
        continue;
    }

    // 3/c) Projekt összesítők (ha van projekt)
    if ($projektId !== '' && $projektId !== null) {
        // Projekt össz-óra (utolsó érték)
        $projSumQ = "
            SELECT ossz_ora
            FROM TM_projekt_aktivitas
            WHERE projekt_id = '$projektId'
            ORDER BY projekt_aktivitas_id DESC
            LIMIT 1
        ";
        $projSumRs = kerdes($projSumQ);
        $projOssz  = 0.0;
        if ($projSumRs && ($p = mysqli_fetch_assoc($projSumRs)) && $p['ossz_ora'] !== null) {
            $projOssz = (float)$p['ossz_ora'];
        }
        $projOsszUj = number_format($projOssz + (float)$oraTizedes, 4, '.', '');

        // Felhasználó szerinti kumulált órája a projektben (INDÍTÓ felhasználó!)
        $projFelhSumQ = "
            SELECT munkaido_felh
            FROM TM_projekt_aktivitas
            WHERE projekt_id = '$projektId'
              AND felh_id = '$inditoFelhId'
            ORDER BY projekt_aktivitas_id DESC
            LIMIT 1
        ";
        $projFelhSumRs = kerdes($projFelhSumQ);
        $projFelhOssz  = 0.0;
        if ($projFelhSumRs && ($pf = mysqli_fetch_assoc($projFelhSumRs)) && $pf['munkaido_felh'] !== null) {
            $projFelhOssz = (float)$pf['munkaido_felh'];
        }
        $projFelhOsszUj = number_format($projFelhOssz + (float)$oraTizedes, 4, '.', '');

        // Bejegyzés az összesítő táblába az INDÍTÓ felhasználó ID-jével
        $insProj = "
            INSERT INTO TM_projekt_aktivitas
                (projekt_aktivitas_id, felh_id, projekt_id, munkaido_felh, ossz_ora, felvetel_datum, datum)
            VALUES
                (NULL, '$inditoFelhId', '$projektId', '$projFelhOsszUj', '$projOsszUj', '$time_stamp', '$today')
        ";
        $okIns = kerdes($insProj);
        if (!$okIns) {
            kerdes("ROLLBACK");
            $errors[] = [
                'munkalap_aktivitas_id' => $munkalapAktId,
                'reason' => 'Feltöltési hiba TM_projekt_aktivitas táblába.'
            ];
            continue;
        }
    }

    kerdes("COMMIT");
    $closedCount++;
}

// 4) Válasz
if (!empty($errors)) {
    echo json_encode([
        'status'       => 'partial',
        'closed_count' => $closedCount,
        'errors'       => $errors,
        'message'      => 'Néhány aktivitás lezárása nem sikerült. A többi lezárva.'
    ]);
} else {
    echo json_encode([
        'status'       => 'ok',
        'closed_count' => $closedCount,
        'message'      => 'Minden nyitott aktivitás sikeresen lezárva.'
    ]);
}
