<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

$adatok = [];
$felvetel_datum = time();
$datum = date('Y-m-d');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    foreach ($_POST as $key => $value) {
        // Check if the value is not set or is empty
        if (!isset($value) || trim($value) === '') {
            // Set the value to NULL
            $adatok[$key] = 'NULL';
        } else {
            // Otherwise, keep the original value
            $adatok[$key] = $value;
        }
        if(strpos($key, 'jog_csoport_') !== false){
            $jog_csoport_id = str_replace('jog_csoport_', '', $key);
            $jog_csoportok[] = $jog_csoport_id;
        }
    }
    $jog_csoportok = implode('|', $jog_csoportok);
    $van_mar_nev_str = "SELECT * FROM `TM_munkalap` WHERE `megnevezes` = '".$adatok['uj_munkalap_nev']."'";
    $van_mar_nev_eredmeny = kerdes($van_mar_nev_str);
    if(mysqli_num_rows($van_mar_nev_eredmeny) > 0){
        echo json_encode(["status" => "error", "message" => "Van már ilyen nevű munkalap."]);
        exit;
    }
    if($adatok['szoftverkoltseg'] != NULL){
        $adatok['szoftverkoltseg'] = str_replace(' ', '', $adatok['szoftverkoltseg']);
    }
    if($adatok['hardverkoltseg'] != NULL){
        $adatok['hardverkoltseg'] = str_replace(' ', '', $adatok['hardverkoltseg']);
    }
    if($adatok['osszkoltseg_hidden'] != NULL){
        $adatok['osszkoltseg_hidden'] = str_replace(' ', '', $adatok['osszkoltseg_hidden']);
    }

    $insert_str = "INSERT INTO 
                    `TM_munkalap`(`munkalap_id`, `projekt_id`, `allapot_id`, `megnevezes`, `munkaido`, `szoftver_osszeg`, `hardver_osszeg`, `munkalap_osszeg`, `aktiv`, `felvetel_datum`, `datum`, `jog_csoport`, `specifikacio_file`) 
                    VALUES 
                    (NULL,".$adatok['projekt_id'].",1,'".$adatok['uj_munkalap_nev']."',".$adatok['becsult_munkaido'].",".$adatok['szoftverkoltseg'].",".$adatok['hardverkoltseg'].",".$adatok['osszkoltseg_hidden'].",1,'".$felvetel_datum."','".$datum."','$jog_csoportok',NULL)";
    $result = kerdes($insert_str);
    if(!$result){
        echo json_encode(["status" => "error", "message" => "Nem sikerült a munkalap létrehozása."]);
        exit;
    }
    $munkalap_id_query="SELECT munkalap_id FROM TM_munkalap ORDER BY munkalap_id DESC LIMIT 1";
    $munkalap_id_eredmeny=kerdes($munkalap_id_query);
    $munkalap_id_tomb = mysqli_fetch_assoc($munkalap_id_eredmeny);
    $munkalap_id = $munkalap_id_tomb['munkalap_id'];





if (isset($_FILES['munkalap_specifikacio']) && $_FILES['munkalap_specifikacio']['error'] === UPLOAD_ERR_OK) {
    $munkalap_specifikacio = $_FILES['munkalap_specifikacio'];
    $destination_dir = '/var/www/html/userfiles/projekt_modul/' . $munkalap_id;
    if (!is_dir($destination_dir)) {
        mkdir($destination_dir, 0777, true);
    }
    // Eredeti fájlnév, opcionálisan itt módosíthatod az elnevezést
    $filename = basename($munkalap_specifikacio['name']);
    $destination = $destination_dir . '/' . $filename;
    if (move_uploaded_file($munkalap_specifikacio['tmp_name'], $destination)) {
        // Relatív útvonal, melyet az adatbázisban tárolunk
        $munkalap_specifikacio_file_path = '/userfiles/projekt_modul/' . $munkalap_id . '/' . $filename;
    }
    $update_query = "UPDATE TM_munkalap SET specifikacio_file = '$munkalap_specifikacio_file_path' WHERE munkalap_id = '$munkalap_id'";
    kerdes($update_query);
    if(!$update_query){
        echo json_encode(["status" => "error", "message" => "Nem sikerült a munkalap specifikációjának mentése."]);
        exit;
    }
}
echo json_encode(["status" => "success", "message" => "A munkalap sikeresen létrejött."]);



    
}

?>