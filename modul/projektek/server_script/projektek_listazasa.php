<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');
$felh_jog = $_SESSION['jogosultsag_id'];
$projekt_ido_lekerdezes="SELECT projekt_nev,hatarido,jog_csoport FROM `TM_projekt` WHERE `aktiv` =1";
$projekt_ido_eredmeny = kerdes($projekt_ido_lekerdezes);
$projekt_ido_adatok = [];
if ($projekt_ido_eredmeny->num_rows > 0) {
    while ($row = $projekt_ido_eredmeny->fetch_assoc()) {
        $jogok = explode('|', $row['jog_csoport']);
        if ($felh_jog == 1) {
            $projekt_ido_adatok[] = $row;
        }
        else if (in_array($felh_jog, $jogok)) {
            $projekt_ido_adatok[] = $row;
        }
        
    }
}


if (!$projekt_ido_eredmeny) {
    die('SQL hiba: rossz a query');
}




echo json_encode($projekt_ido_adatok);


?>