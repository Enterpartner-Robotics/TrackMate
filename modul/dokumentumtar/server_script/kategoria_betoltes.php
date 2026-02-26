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
    $query = "SELECT `kategoria_id`, `kategoria_nev` FROM `TM_dokumentumtar_kategoria` WHERE `aktiv` = '1' ORDER BY `kategoria_id` ASC";
    $result = kerdes($query);
    if($result){
        $kategoria_lista = [];
        while($row = mysqli_fetch_assoc($result)){
            $kategoria_lista[] = $row;
        }
        echo json_encode([
            'status' => 'success',
            'kategoria_lista' => $kategoria_lista
        ]);
    }
    else{
        echo json_encode([
            'status' => 'error',
            'message' => 'Hiba történt a kategóriák betöltésekor.'
        ]);
    }
}


?>