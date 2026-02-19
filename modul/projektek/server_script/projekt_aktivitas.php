<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');


if(isset($_POST['projekt_id']) || isset($_GET['projekt_id'])){
    $projekt_id = isset($_POST['projekt_id']) ? $_POST['projekt_id'] : $_GET['projekt_id'];
}else{
    $projekt_id = '';
}
if($projekt_id != ''){


    $projekt_ido_lekerdezes="SELECT aktivitas.felh_id,projekt_id,munkaido_felh,ossz_ora FROM `TM_projekt_aktivitas` aktivitas JOIN SYS_felh felh ON felh.felh_id =aktivitas.felh_id
    WHERE `aktiv` =1 AND projekt_id = $projekt_id";
    $projekt_ido_eredmeny = kerdes($projekt_ido_lekerdezes);
    $projekt_ido_adatok = [];
    if ($projekt_ido_eredmeny->num_rows > 0) {
        while ($row = $projekt_ido_eredmeny->fetch_assoc()) {
            $projekt_ido_adatok[] = $row;
        }
    }


    if (!$projekt_ido_eredmeny) {
        die('SQL hiba: rossz a query');
    }


echo json_encode ([
    'status' => 'success',
    'message' => 'Sikeres',
    'projekt_ido_adatok' => $projekt_ido_adatok
]);



















}else{
    echo json_encode([
        'status' => 'error',
        'message' => 'Nincs munkalap azonosító megadva',
        'error' => true
    ]);
}

?>