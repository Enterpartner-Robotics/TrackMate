<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if(isset($_POST['bejegyzes_id']) && isset($_POST['messageText']) && isset($_POST['munkalap_id'])){
    $bejegyzes_id = $_POST['bejegyzes_id'];
    $messageText = $_POST['messageText'];
    $munkalap_id = $_POST['munkalap_id'];

    $update_bejegyzes_str = "UPDATE `TM_munkalap_bejegyzes` SET `megjegyzes`= '".$messageText."' WHERE `bejegyzes_id` = ".$bejegyzes_id.";";
    $update_bejegyzes_qry = kerdes($update_bejegyzes_str);
    if($update_bejegyzes_qry){
        echo json_encode(['status' => 'success', 'message' => 'Üzenet szerkesztve']);
    }
    else{
        echo json_encode(['status' => 'error', 'message' => 'Hiba történt a bejegyzés szerkesztése során']);
    }
    $updateData = array('update' => 'munkalap_chat', 'munkalap_id' => $munkalap_id);
     // A Node.js szerver URL-je
    $ch = curl_init(NODE_SERVER_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    $nodeResponse = curl_exec($ch);
    curl_close($ch);
}
else{
    echo json_encode(['status' => 'error', 'message' => 'Nincs bejegyzés ID vagy üzenet szöveg']);
}



?>