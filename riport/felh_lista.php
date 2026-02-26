<?php
declare(strict_types=1);
require_once __DIR__ . '/_db.php';

// Itt a view neve legyen az, amit tényleg létrehoztatok:
$VIEW = 'VW_tm_aktivitas_riport_1';

$sql = "
SELECT DISTINCT
  felh_id,
  teljes_nev,
  osztaly_id,
  osztalyTXT,
  gyakorlatiNapok
FROM {$VIEW}
WHERE osztaly_id is not null
ORDER BY teljes_nev
";

json_out(db_all($sql));
