<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

$modulok = json_decode($_POST['modulok'], true);




$partner_id = $_POST['partner_id'];
$projekt_nev = $_POST['projekt_nev'];
$hatar_ido = $_POST['hatar_ido'];
$oradij = $_POST['oradij'];
$osszes_munkaido = $_POST['osszes_munkaido'];
$osszes_szoftver_osszeg = $_POST['osszes_szoftver_osszeg'] ? $_POST['osszes_szoftver_osszeg'] : 0;
$osszes_hardver_osszeg = $_POST['osszes_hardver_osszeg'] ? $_POST['osszes_hardver_osszeg'] : 0;
$teljes_osszeg = $osszes_szoftver_osszeg + $osszes_hardver_osszeg;
foreach($_POST as $key => $value){
    if(strpos($key, 'jog_csoport_') !== false){
        $jog_csoport_id = str_replace('jog_csoport_', '', $key);
        $jog_csoportok[] = $jog_csoport_id;
    }
}
$jog_csoportok = implode('|', $jog_csoportok);
$felvetel_datum = time();
$datum = date('Y-m-d');
$szerzodes_file_path = null;
$arajanlat_file_path = null;

$projekt_beszuras_query="INSERT INTO TM_projekt (projekt_id, partner_id,allapot_id, projekt_nev, hatarido, oradij, munkaido, szoftver_osszeg, hardver_osszeg, teljes_osszeg, megjegyzes, felvetel_datum, datum, arajanlat_file,szerzodes_file, jog_csoport, aktiv) VALUES (null, '$partner_id', '1', '$projekt_nev', '$hatar_ido', '$oradij', '$osszes_munkaido', '$osszes_szoftver_osszeg', '$osszes_hardver_osszeg', '$teljes_osszeg', null, '$felvetel_datum', '$datum', null, null, '$jog_csoportok', 1)";
$result = kerdes($projekt_beszuras_query);




if($result){
    $projekt_id_query="SELECT projekt_id FROM TM_projekt WHERE projekt_nev = '$projekt_nev' ORDER BY projekt_id DESC LIMIT 1";
    $projekt_id_eredmeny=kerdes($projekt_id_query);
    $projekt_id_tomb = mysqli_fetch_assoc($projekt_id_eredmeny);
    $projekt_id = $projekt_id_tomb['projekt_id'];





if (isset($_FILES['szerzodes_kep']) && $_FILES['szerzodes_kep']['error'] === UPLOAD_ERR_OK) {
    $szerzodes_file = $_FILES['szerzodes_kep'];
    $destination_dir = '/var/www/html/userfiles/projekt_szerzodes/' . $projekt_id;
    if (!is_dir($destination_dir)) {
        mkdir($destination_dir, 0777, true);
    }
    // Eredeti fájlnév, opcionálisan itt módosíthatod az elnevezést
    $filename = basename($szerzodes_file['name']);
    $destination = $destination_dir . '/' . $filename;
    if (move_uploaded_file($szerzodes_file['tmp_name'], $destination)) {
        // Relatív útvonal, melyet az adatbázisban tárolunk
        $szerzodes_file_path = '/userfiles/projekt_szerzodes/' . $projekt_id . '/' . $filename;
    }
}

// Árajánlat fájl feldolgozása
if (isset($_FILES['araajanlat_kep']) && $_FILES['araajanlat_kep']['error'] === UPLOAD_ERR_OK) {
    $araajanlat_file = $_FILES['araajanlat_kep'];
    $destination_dir = '/var/www/html/userfiles/projekt_arajanlat/' . $projekt_id;
    if (!is_dir($destination_dir)) {
        mkdir($destination_dir, 0777, true);
    }
    $filename = basename($araajanlat_file['name']);
    $destination = $destination_dir . '/' . $filename;
    if (move_uploaded_file($araajanlat_file['tmp_name'], $destination)) {
        $arajanlat_file_path = '/userfiles/projekt_arajanlat/' . $projekt_id . '/' . $filename;
    }
}

if ($szerzodes_file_path || $arajanlat_file_path) {
    $update_query = "UPDATE TM_projekt SET ";
    $updates = [];
    if ($szerzodes_file_path) {
        $updates[] = "szerzodes_file = '" . $szerzodes_file_path . "'";
    }
    if ($arajanlat_file_path) {
        $updates[] = "arajanlat_file = '" . $arajanlat_file_path . "'";
    }
    $update_query .= implode(', ', $updates);
    $update_query .= " WHERE projekt_id = ". $projekt_id ."";
    kerdes($update_query);
}






if(count($modulok) > 0){
    foreach ($modulok as $modul) {
        $modul_nev = $modul['modul_nev'];
        $munkalap_munkaido = $modul['munkaido'];
        $szoftver_osszeg = $modul['szoftver_osszeg'];
        $hardver_osszeg = $modul['hardver_osszeg'];
        $keret = $modul['keret'];
        if($modul['specifikacio_kep'] != ""){
            $specifikacio_file = $modul['specifikacio_kep'];
        }
        else{
            $specifikacio_file = null;
        }


        $munkalap_beszuras_query="INSERT INTO TM_munkalap (munkalap_id, projekt_id, megnevezes, munkaido, szoftver_osszeg, hardver_osszeg, munkalap_osszeg,allapot_id, aktiv,felvetel_datum,datum, jog_csoport, specifikacio_file) VALUES (null, '$projekt_id', '$modul_nev', '$munkalap_munkaido', '$szoftver_osszeg', '$hardver_osszeg', '$keret', 1, 1, '$felvetel_datum', '$datum', '$jog_csoportok', '$specifikacio_file')";



        kerdes($munkalap_beszuras_query);
    }
}



}



echo json_encode([
    'status' => 'success',
    'message' => 'Sikeresen elmentve'
]);




?>