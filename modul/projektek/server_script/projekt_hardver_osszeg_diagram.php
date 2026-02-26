<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');


$projekt_id = $_POST['projekt_id'];

$projekt_ido_intervallum_query = "SELECT hatarido,datum,hardver_osszeg FROM TM_projekt WHERE projekt_id = $projekt_id";
$projekt_ido_intervallum_result = kerdes($projekt_ido_intervallum_query);

$projekt_ido_intervallum_data = array();

while ($row = mysqli_fetch_assoc($projekt_ido_intervallum_result)) {
    $projekt_ido_intervallum_data[] = $row;
}


$projekt_hardver_query="SELECT SUM(tmrb.darab) as darab,tmr.beszerzesi_ar,tmrb.datum FROM TM_raktar_bejegyzes tmrb
                        LEFT JOIN TM_munkalap tmm ON tmrb.munkalap_id=tmm.munkalap_id
                        JOIN TM_raktar tmr ON tmrb.raktar_id=tmr.raktar_id
                        WHERE tmm.projekt_id = $projekt_id AND tmrb.bejegyzes_tipus_id=3
                        GROUP BY tmrb.datum, tmrb.raktar_id";
$projekt_hardver_result = kerdes($projekt_hardver_query);
$projekt_hardver_data = array();

while ($row = mysqli_fetch_assoc($projekt_hardver_result)) {
    $projekt_hardver_data[] = $row;
}


echo json_encode([
    'status' => 'success',
    'projekt_ido_intervallum_data' => $projekt_ido_intervallum_data,
    'projekt_hardver_data' => $projekt_hardver_data
]);



?>