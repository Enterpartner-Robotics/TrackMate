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
    if($_SESSION['jogosultsag_id'] == 1){
        $sql = "SELECT `projekt_id`, `hatarido`, `projekt_nev` FROM `TM_projekt` WHERE `allapot_id` = 1 OR `allapot_id` = 2";
    }
    else{
        $sql = "SELECT `projekt_id`, `hatarido`, `projekt_nev` FROM `TM_projekt` WHERE (`allapot_id` = 1 OR `allapot_id` = 2) AND `jog_csoport` = ".$_SESSION['jogosultsag_id']."";
    }
    $result = kerdes($sql);
    while($row = mysqli_fetch_assoc($result)){
        $data[] = $row;
    }
    if($result){
        echo json_encode(['status' => 'success','data' => $data]);
    }else{
        echo json_encode(['status' => 'error','message' => 'Hiba a lekérdezésben']);
    }
}
?>