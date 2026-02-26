<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

$projekt_id = $_POST['projekt_id'];

$projekt_munkalapok_query = "SELECT tmm.munkalap_id,allapot.allapot_nev,tmm.megnevezes,tmm.munkaido AS max_ora, tmm.munkalap_osszeg,
                             (SELECT max(ossz_ora) FROM TM_munkalap_aktivitas WHERE munkalap_id = tmm.munkalap_id) AS teljesitett_ora FROM TM_munkalap tmm 
                             JOIN TORZS_allapot allapot ON tmm.allapot_id = allapot.allapot_id 
                             WHERE tmm.projekt_id = $projekt_id AND tmm.aktiv = 1 ORDER BY tmm.allapot_id ASC, teljesitett_ora DESC";
$projekt_munkalapok_lekerdezes=kerdes($projekt_munkalapok_query);


if($projekt_munkalapok_lekerdezes){   
    $projekt_munkalapok_adatok=$projekt_munkalapok_lekerdezes->fetch_all(MYSQLI_ASSOC);
    echo json_encode([
        'status'=> 'success',
        'data'=> $projekt_munkalapok_adatok
    ]);
}else{
    echo json_encode([
        'status'=> 'error',
        'error'=>'Nincs adat'
    ]);
}



?>