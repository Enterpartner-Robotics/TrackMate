<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $file_path = '/var/www/html/';
    $file_path .= $_POST['file_path'];
    $aru_id = $_POST['aru_id'];

    if (file_exists($file_path)) {
        if (unlink($file_path)) {
            kerdes("UPDATE `TORZS_aru` SET file_link = '' WHERE aru_id = '$aru_id'");
            echo json_encode(["status" => "success", "message" => "A fájl törölve lett."]);
        } else {
            echo json_encode(["status" => "error", "message" => "A fájl törlése sikertelen."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "A fájl nem található."]);
    }
}



?>