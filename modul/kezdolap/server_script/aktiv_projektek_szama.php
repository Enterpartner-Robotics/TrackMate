<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if($_SERVER['REQUEST_METHOD'] == 'POST'){
    $felh_id=$_SESSION['felh_id'];
    if(!isset($felh_id)){
        echo json_encode(['status' => 'error','message' => 'Nincs bejelentkezve']);
        exit;
    }

    $sql="SELECT `projekt_id` FROM `TM_projekt_aktivitas` WHERE `felh_id` = $felh_id GROUP BY `projekt_id`";
    $result = kerdes($sql);
    $aktiv_projektek_szama = mysqli_num_rows($result);
    echo json_encode(['status' => 'success','aktiv_projektek_szama' => $aktiv_projektek_szama]);
}

?>