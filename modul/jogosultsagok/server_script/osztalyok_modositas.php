<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if (!isset($_SESSION['felh'])) {
    header('Location: /index.php');  
    exit;
}

if (!isset($_POST['felh_id']) || !isset($_POST['osztaly_id'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Hiányzó adatok!'
    ]);
    exit;
}

$felh_id = $_POST['felh_id'];
$osztaly_id = $_POST['osztaly_id'];

if ($osztaly_id == 999) {
    $update_query = "UPDATE `SYS_felh` SET `osztaly_id` = NULL WHERE `felh_id` = $felh_id";

}else{
    $update_query = "UPDATE `SYS_felh` SET `osztaly_id` = $osztaly_id WHERE `felh_id` = $felh_id";
}


$jog_modositas=kerdes($update_query);


if ($jog_modositas) {
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
        'message' => 'Osztály sikeresen módosítva!'
    ]);

    
} else {
    // Hiba történt
    echo json_encode([
        'status' => 'error',
        'message' => 'Hiba történt az osztály módosítása során!'
    ]);
}


?>