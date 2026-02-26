<?php
declare(strict_types=1);
require_once __DIR__ . '/_db.php';

$felh_id = require_int('felh_id');
$from = require_date('from'); // inclusive
$to   = require_date('to');   // exclusive (következő hónap első napja)

$VIEW = 'VW_tm_aktivitas_riport_1';

$felh_id_sql = esc((string)$felh_id);
$from_sql = esc($from);
$to_sql   = esc($to);
$sql = "
SELECT
  n.datum AS nap,
  n.tipus,
  n.is_munkanap,
  n.megjegyzes,
  a.elso_kezdes,
  a.utolso_zaras,
  a.ossz_nyers_ora,
  a.hibas_zaras_db,
  a.ossz_db,

  CASE
    WHEN n.is_munkanap = 1
     AND a.elso_kezdes IS NOT NULL
     AND TIME(a.elso_kezdes) > '07:00:00'
    THEN 1 ELSE 0
  END AS kesett,

  CASE
    WHEN n.is_munkanap = 1
     AND a.elso_kezdes IS NULL
    THEN 1 ELSE 0
  END AS hianyzik

FROM SYS_munkaido_naptar n

LEFT JOIN (
  SELECT
    DATE(kezdes_ido) AS nap,
    MIN(kezdes_ido) AS elso_kezdes,
    MAX(zaras_ido) AS utolso_zaras,
    ROUND(SUM(nyers_ora), 2) AS ossz_nyers_ora,
    SUM(CASE WHEN hibasZaras = 1 THEN 1 ELSE 0 END) AS hibas_zaras_db,
    COUNT(*) AS ossz_db
  FROM {$VIEW}
  WHERE felh_id = '{$felh_id_sql}'
    AND kezdes_ido >= '{$from_sql} 00:00:00'
    AND kezdes_ido <  '{$to_sql} 00:00:00'
  GROUP BY DATE(kezdes_ido)
) a ON a.nap = n.datum

WHERE n.datum >= '{$from_sql}'
  AND n.datum <  '{$to_sql}'
ORDER BY n.datum
";


json_out(db_all($sql));
