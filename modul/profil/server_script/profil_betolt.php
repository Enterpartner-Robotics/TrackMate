<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $response = array('status' => 'error', 'message' => 'Ismeretlen hiba történt.');
    $felh_id = intval($_SESSION['felh_id']);
    
    $query = "SELECT `felh_nev`, `teljes_nev`, `szuletesi_ido`, `email`, `telefon`, `profil_kep_link` FROM `SYS_felh` WHERE `felh_id` = ".$felh_id.";";
    $result = kerdes($query);
    $sor = mysqli_fetch_array($result);
    $response = array(
        'status'      => 'success',
        'data'        => array(
            'felh_nev'    => $sor['felh_nev'],
            'teljes_nev'  => $sor['teljes_nev'],
            'szuletesi_ido'  => $sor['szuletesi_ido'],
            'email'       => $sor['email'],
            'telefon'     => $sor['telefon'],
            'profil_kep_link'     => $sor['profil_kep_link'],
        ),
    );

    header('Content-Type: application/json');
    echo json_encode($response);
}
?>