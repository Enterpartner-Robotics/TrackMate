<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if(!isset($_SESSION['felh_id'])){
        echo json_encode([
            'status' => 'error',
            'message' => 'Nincs bejelentkezve felhasználó!'
        ]);
        exit;
    }
    $hely_id = $_POST['hely_id'];
    $torles_qry = kerdes("UPDATE TM_raktar_aru_helye SET aktiv = 0 WHERE hely_id = $hely_id");
    if($torles_qry){
        $updateData = array('update' => 'raktar_tabla');
         // A Node.js szerver URL-je
        $ch = curl_init(NODE_SERVER_URL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        $nodeResponse = curl_exec($ch);
        curl_close($ch);
        echo json_encode([
            'status' => 'success',
            'message' => 'Hely törölve!'
        ]);
    }
    else{
        echo json_encode([
            'status' => 'error',
            'message' => 'Hely törlése sikertelen!'
        ]);
    }
}
?>