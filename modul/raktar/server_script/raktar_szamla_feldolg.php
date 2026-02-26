<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if (!isset($_SESSION['felh_id'])) {
    echo json_encode(["status" => "error", "message" => "Nincs bejelentkezett felhasználó."]);
    exit;
}

$felh_id = $_SESSION['felh_id'];
$felvetel_datum = time();



$query = "INSERT INTO `TM_raktar_szamla` (`szamla_azon`, `felvetel_datum`) VALUES (".$_POST['szamla_szam'].", '".$felvetel_datum."')";
$result = kerdes($query);

if (!$result) {
    echo json_encode(["status" => "error", "message" => "Hiba történt a számla adatainak mentésekor."]);
    exit;
}

$szamla_id_query = "SELECT `szamla_id` FROM `TM_raktar_szamla` ORDER BY `szamla_id` DESC LIMIT 1;";
$szamla_id_result = kerdes($szamla_id_query);
$szamla_id = mysqli_fetch_array($szamla_id_result);
$szamla_id = $szamla_id['szamla_id'];

if (!isset($_FILES['szamla_kep']) || $_FILES['szamla_kep']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["status" => "error", "message" => "Nem sikerült a fájl feltöltése."]);
    exit;
}

$file_tmp = $_FILES['szamla_kep']['tmp_name'];
$file_info = getimagesize($file_tmp);
if ($file_info === false) {
    echo json_encode(["status" => "error", "message" => "Csak képfájlok tölthetők fel!"]);
    exit;
}

$target_dir = "/var/www/html/userfiles/raktar_szamla_kep/" . $szamla_id . "/";
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0777, true);
}

$file_name = uniqid() . "_" . basename($_FILES['szamla_kep']['name']);
$target_file = $target_dir . $file_name;


if (!move_uploaded_file($file_tmp, $target_file)) {
    echo json_encode(["status" => "error", "message" => "Nem sikerült a fájl mentése."]);
    exit;
}

$file_link = "/userfiles/raktar_szamla_kep/" . $szamla_id . "/" . $file_name;
$update_query = "UPDATE `TM_raktar_szamla` SET `file_link` = '".$file_link."' WHERE `szamla_id` = ".$szamla_id."";
$update_stmt = kerdes($update_query);

if ($update_stmt) {
    echo json_encode(["status" => "success", "message" => "Számla sikeresen feltöltve!", "szamla_id" => $szamla_id]);
} else {
    echo json_encode(["status" => "error", "message" => "Hiba történt a fájl útvonalának mentésekor."]);
}









?>