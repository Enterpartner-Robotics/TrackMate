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
    $nev_keres_str = "SELECT `dokumentum_nev` FROM `TM_dokumentumtar` WHERE `dokumentum_id` = ".$dokumentum_id."";
    $nev_keres_result = kerdes($nev_keres_str);
    if(mysqli_num_rows($nev_keres_result) > 0){
        $nev_keres_row = mysqli_fetch_assoc($nev_keres_result);
        $nev = $nev_keres_row['dokumentum_nev'];
        $nev = explode('.', $nev);
        $kiterjesztes = array_pop($nev);
        $nev = implode('.', $nev);
        echo json_encode([
            'status' => 'success',
            'dokumentum_nev' => $nev,
            'kiterjesztes' => $kiterjesztes
        ]);
    }
    else{
        echo json_encode([
            'status' => 'error',
            'message' => 'Nincs ilyen dokumentum!'
        ]);
    }
}


