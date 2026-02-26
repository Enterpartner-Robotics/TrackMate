<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if(isset($_POST['file_id'])){
    $file_id = $_POST['file_id'];
}else{
    echo json_encode(['error' => 'Nincs file_id']);
    exit;
}
if(isset($_POST['bejegyzes_id'])){
    $bejegyzes_id = $_POST['bejegyzes_id'];
}else{
    echo json_encode(['error' => 'Nincs bejegyzes_id']);
    exit;
}
if(isset($_POST['munkalap_id'])){
    $munkalap_id = $_POST['munkalap_id'];
}else{
    echo json_encode(['error' => 'Nincs munkalap_id']);
    exit;
}
$file_hely_str = "SELECT file_link FROM TM_munkalap_bejegyzes_file WHERE file_id = '$file_id'";
$file_hely_qry = kerdes($file_hely_str);
$file_hely = mysqli_fetch_assoc($file_hely_qry);
$file_hely = $file_hely['file_link'];
$file_hely = explode('/', $file_hely);
$file_hely = $file_hely[count($file_hely) - 1];
$file_hely = '/var/www/html/userfiles/munkalap_bejegyzes/'.$bejegyzes_id.'/'.$file_hely;

if(file_exists($file_hely)){
    unlink($file_hely);
}

$directory = '/var/www/html/userfiles/munkalap_bejegyzes/'.$bejegyzes_id;
if (is_dir($directory) && count(scandir($directory)) === 2) { 
    rmdir($directory); 
}

$file_str = "DELETE FROM TM_munkalap_bejegyzes_file WHERE file_id = '$file_id'";
$file_qry = kerdes($file_str);

if($file_qry){
    $updateData = array('update' => 'munkalap_chat', 'munkalap_id' => $munkalap_id);
     // A Node.js szerver URL-je
    $ch = curl_init(NODE_SERVER_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    $nodeResponse = curl_exec($ch);
    curl_close($ch);
    echo json_encode(['status' => 'success', 'message' => 'A fájl törlése sikeresen megtörtént.']);
}else{
    echo json_encode(['status' => 'error', 'message' => 'A fájl törlése sikertelen.']);
}






?>