<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');


$projekt_id = $_POST['projekt_id'];

$projekt_ido_intervallum_query = "SELECT hatarido,datum,szoftver_osszeg FROM TM_projekt WHERE projekt_id = $projekt_id";
$projekt_ido_intervallum_result = kerdes($projekt_ido_intervallum_query);

$projekt_ido_intervallum_data = array();

while ($row = mysqli_fetch_assoc($projekt_ido_intervallum_result)) {
    $projekt_ido_intervallum_data[] = $row;
}

$projekt_aktivitas_info="SELECT MAX(ossz_ora) as ossz_ora,datum FROM TM_projekt_aktivitas WHERE projekt_id = $projekt_id GROUP BY datum";
$projekt_aktivitas_info_result = kerdes($projekt_aktivitas_info);

$projekt_aktivitas_info_data = array();

while ($row = mysqli_fetch_assoc($projekt_aktivitas_info_result)) {
    $projekt_aktivitas_info_data[] = $row;
}




echo json_encode([
    'status' => 'success',
    'projekt_ido_intervallum_data' => $projekt_ido_intervallum_data,
    'projekt_aktivitas_info_data' => $projekt_aktivitas_info_data
    
]);



?>