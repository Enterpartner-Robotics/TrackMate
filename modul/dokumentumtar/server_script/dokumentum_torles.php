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
    $dokumentum_id = $_POST['dokumentum_id'];
    if(!$dokumentum_id){
        echo json_encode([
            'status' => 'error',
            'message' => 'Nincs dokumentum_id!'
        ]);
        exit;
    }
    $dokumentum_query = "SELECT dokumentum_link FROM TM_dokumentumtar WHERE dokumentum_id = '$dokumentum_id'";
    $dokumentum_result = kerdes($dokumentum_query);
    $dokumentum = mysqli_fetch_assoc($dokumentum_result);
    $fajl_link = "/var/www/html" . $dokumentum['dokumentum_link'];
    $fajl_nev = basename($fajl_link);
    $mappa = dirname($fajl_link);

    if (file_exists($fajl_link)) {
        unlink($fajl_link);

        // Ellenőrizzük, hogy a mappa üres-e
        if (is_dir($mappa)) {
            $files = array_diff(scandir($mappa), ['.', '..']);
            if (empty($files)) {
                rmdir($mappa); // csak akkor törli, ha üres
            }
        }
    }
    else{
        echo json_encode([
            'status' => 'error',
            'message' => 'A fájl nem található!'
        ]);
        exit;
    }
    $query = "DELETE FROM TM_dokumentumtar WHERE dokumentum_id = '$dokumentum_id'";
    $result = kerdes($query);
    $updateData = array('update' => 'dokumentumtar_jobboldal');
    
    $ch = curl_init(NODE_SERVER_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    $nodeResponse = curl_exec($ch);
    curl_close($ch);
    echo json_encode([
        'status' => 'success',
        'message' => 'Dokumentum törölve!'
    ]);
}
?>