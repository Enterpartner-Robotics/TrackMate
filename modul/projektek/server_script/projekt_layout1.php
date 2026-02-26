<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

$felh_jog = $_SESSION['jogosultsag_id'];

$projekt_layout1_query="SELECT tmp.projekt_id, tmp.projekt_nev, tmp.hatarido,tmp.teljes_osszeg, tp.cegnev,tmp.munkaido,tmp.allapot_id, tmp.jog_csoport FROM TM_projekt tmp JOIN TORZS_partner tp ON tp.partner_id = tmp.partner_id WHERE tmp.aktiv = 1 ORDER BY tmp.hatarido DESC";
$projekt_layout1_eredmeny=kerdes($projekt_layout1_query);
$projekt_layout1_adatok = [];
if ($projekt_layout1_eredmeny->num_rows > 0) {
    while ($row = $projekt_layout1_eredmeny->fetch_assoc()) {
        $jogok = explode('|', $row['jog_csoport']);
        if ($felh_jog == 1) {
            $projekt_layout1_adatok[] = $row;
        }
        else if (in_array($felh_jog, $jogok)) {
            $projekt_layout1_adatok[] = $row;
        }
    }
}






echo json_encode([
    'data' => $projekt_layout1_adatok,
    'status' => 'success',
    'message' => 'Sikeresen elmentve'
]);










?>