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
    $raktar_id = $_POST['raktar_id'];
    $pontos_hely = [];
    $helyek_qry = kerdes("SELECT * FROM TM_raktar_aru_helye WHERE raktar_id = $raktar_id AND aktiv = 1");
    while($helyek = mysqli_fetch_array($helyek_qry)){
        $pontos_hely[$helyek['hely_id']] = $helyek['hely'] . '/' . $helyek['pozicio'];
    }
    echo json_encode($pontos_hely);
}
?>