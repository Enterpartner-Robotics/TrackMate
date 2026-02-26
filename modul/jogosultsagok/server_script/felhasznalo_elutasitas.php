<?php

include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');


$felhasznalo_id=$_POST['felh_id'];

$felhasznalo_elutasitas_query="UPDATE `SYS_felh` SET `aktiv` =0 WHERE `felh_id` = $felhasznalo_id";
$felhasznalo_elutasitas=kerdes($felhasznalo_elutasitas_query);


if($felhasznalo_elutasitas){

    $updateData = array('update' => 'jog_tabla');
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
    'message' => 'Felhasználó törölve'
    
]);
}else{
    echo json_encode([
        'status' => 'error',
        'message' => 'Nem ló'
        
    ]);  
}

?>