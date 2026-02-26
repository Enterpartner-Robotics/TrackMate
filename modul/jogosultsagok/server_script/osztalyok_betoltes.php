<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

$osztalyok_betoltes_query = "SELECT osztaly_id, osztaly_nev FROM SYS_osztaly WHERE aktiv = 1";
$osztalyok_betoltes=kerdes($osztalyok_betoltes_query);

$osztalyok_array = [];
foreach ($osztalyok_betoltes as $osztaly) {
    $osztalyok_array[] = [
        'osztaly_id' => $osztaly['osztaly_id'],
        'osztaly_nev' => $osztaly['osztaly_nev']
    ];
}

echo json_encode([
    'status' => 'success',
    'osztalyok' => $osztalyok_array
]);

?>
