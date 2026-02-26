<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if($_SERVER['REQUEST_METHOD'] == 'POST'){
    if(isset($_POST['bejegyzes_id']) && isset($_POST['munkalap_id'])){
        $bejegyzes_id = $_POST['bejegyzes_id'];
        $munkalap_id = $_POST['munkalap_id'];
    }else{
        echo json_encode(['status' => 'error', 'error' => 'Nincs bejegyzes_id vagy munkalap_id']);
        exit;
    }
    $felh_id = $_SESSION['felh_id'];

    $torles_str = "UPDATE TM_munkalap_bejegyzes SET aktiv = 0 WHERE bejegyzes_id = '$bejegyzes_id' AND munkalap_id = '$munkalap_id' AND felh_id = '$felh_id'";
    $torles_qry = kerdes($torles_str);

    if($torles_qry){
        $updateData = array('update' => 'munkalap_chat', 'munkalap_id' => $munkalap_id);
         // A Node.js szerver URL-je
        $ch = curl_init(NODE_SERVER_URL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        $nodeResponse = curl_exec($ch);
        curl_close($ch);
        echo json_encode(['status' => 'success', 'message' => 'Üzenet törölve']);
    }else{
        echo json_encode(['status' => 'error', 'error' => 'Hiba történt a törlés során']);
        exit;
    }
}
