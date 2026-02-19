<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');


date_default_timezone_set('Europe/Budapest'); //
$jelenlegi_ido = date('Y-m-d H:i:s');
$current_time = strtotime($jelenlegi_ido);

$felh_id=$_SESSION['felh_id'];

$feladat_utemezo_query="SELECT tmm.munkalap_id, tma.kezdes_ido, tmm.megnevezes FROM TM_munkalap_aktivitas tma
                        JOIN TM_munkalap tmm ON tmm.munkalap_id = tma.munkalap_id 
                        WHERE tma.felh_id = $felh_id AND munkalap_allapot = 1";

$feladat_utemezo_lekerdezes = kerdes($feladat_utemezo_query);
$feladat_utemezo_adat = mysqli_fetch_assoc($feladat_utemezo_lekerdezes);
if ($feladat_utemezo_adat) {
    $kezdes_ido = strtotime($feladat_utemezo_adat['kezdes_ido']);

    $eltelt_ido = $current_time - $kezdes_ido;








    echo json_encode([
        'status' => 'success',
        'aktualis_ido' => $current_time,
        'feladat_utemezo_adat' => $feladat_utemezo_adat,
        'eltelt_ido' => $eltelt_ido
    ]);
}else{
    echo json_encode([
        'status' => 'error',
        'message' => 'Nincs aktív feladat'
    ]);
}

?>