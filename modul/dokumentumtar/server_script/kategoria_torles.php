<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if(!isset($_SESSION['felh_id'])){
        echo json_encode([
            'status' => 'error',
            'message' => 'Nincs bejelentkezve!'
        ]);
        exit;
    }
    if(!isset($_POST['kategoria_id'])){
        echo json_encode([
            'status' => 'error',
            'message' => 'Nincs kategória ID!'
        ]);
        exit;
    }
    $kategoria_id = $_POST['kategoria_id'];
    $update_kategoria_str = "UPDATE `TM_dokumentumtar_kategoria` SET `aktiv`= 0 WHERE `kategoria_id` = ".$kategoria_id."";
    $update_kategoria_result = kerdes($update_kategoria_str);
    if($update_kategoria_result){
        $updateData = array('update' => 'kategoria_baloldal');
        
        $ch = curl_init(NODE_SERVER_URL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        $nodeResponse = curl_exec($ch);
        curl_close($ch);
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Kategória sikeresen törölve!'
        ]);
    }
    else{
        echo json_encode([
            'status' => 'error',
            'message' => 'Hiba történt a kategória törlésekor!'
        ]);
    }
}


