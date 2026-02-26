<?php
declare(strict_types=1);
require_once __DIR__ . '/_db.php';

$felh_id = require_int('felh_id');
$nap = require_date('nap');

$VIEW = 'VW_tm_aktivitas_riport_1';

$felh_id_sql = esc((string)$felh_id);
$nap_sql = esc($nap);

// Napi összegzés a view alapján
$sumSql = "
SELECT
  '{$nap_sql}' AS nap,
  (SELECT is_munkanap FROM SYS_munkaido_naptar WHERE datum = '{$nap_sql}' LIMIT 1) AS is_munkanap,
  MIN(kezdes_ido) AS elso_kezdes,
  ROUND(SUM(nyers_ora), 2) AS ossz_nyers_ora,
  CASE
    WHEN MIN(kezdes_ido) IS NOT NULL AND TIME(MIN(kezdes_ido)) > '07:00:00' THEN 1 ELSE 0
  END AS kesett,
  CASE
    WHEN MIN(kezdes_ido) IS NULL THEN 1 ELSE 0
  END AS hianyzik
FROM {$VIEW}
WHERE felh_id = '{$felh_id_sql}'
  AND DATE(kezdes_ido) = '{$nap_sql}'
";

$day = db_one($sumSql);
if (!$day) {
    // ha nincs aktivitás, akkor is adjunk vissza day-et
    $is_munkanap = db_one("SELECT is_munkanap FROM SYS_munkaido_naptar WHERE datum = '{$nap_sql}' LIMIT 1");
    $day = [
        'nap' => $nap,
        'is_munkanap' => $is_munkanap ? $is_munkanap['is_munkanap'] : null,
        'elso_kezdes' => null,
        'ossz_nyers_ora' => null,
        'kesett' => 0,
        'hianyzik' => ($is_munkanap && (int)$is_munkanap['is_munkanap'] === 1) ? 1 : 0,
    ];
}

// Napi sorok
$rowsSql = "
SELECT
  munkalap_aktivitas_id,
  felh_id,
  teljes_nev,
  osztaly_id,
  osztalyTXT,
  gyakorlatiNapok,
  munkalap_id,
  munkalap_megnevezes,
  projekt_id,
  projekt_nev,
  kezdes_ido,
  zaras_ido,
  nap,
  nyers_ora,
  hibasZaras
FROM {$VIEW}
WHERE felh_id = '{$felh_id_sql}'
  AND nap = '{$nap_sql}'
ORDER BY kezdes_ido
";

$rows = db_all($rowsSql);

json_out([
    'day' => $day,
    'rows' => $rows
]);
