<?php

include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');




if (!isset($_SESSION['felh'])) {
    header('Location: /index.php');  
    exit;
}


$felhasznalok_lista_query=" SELECT felh_id, teljes_nev, email, telefon, 
                            jog.jogosultsag_nev, jog.jogosultsag_id, 
                            osztaly.osztaly_nev, felh.osztaly_id 
                            FROM SYS_felh felh
                            JOIN SYS_jogosultsag jog ON felh.jogosultsag_id = jog.jogosultsag_id
                            LEFT JOIN SYS_osztaly osztaly ON felh.osztaly_id = osztaly.osztaly_id
                            WHERE felh.aktiv = 1";
$felhasznalok_lista_eredmeny = kerdes($felhasznalok_lista_query);
$felhasznalok_lista = [];

while ($row = mysqli_fetch_assoc($felhasznalok_lista_eredmeny)) {
    $felhasznalok_lista[] = $row;
}

$jogosultsagok_query = "SELECT jogosultsag_id, jogosultsag_nev FROM SYS_jogosultsag WHERE jogosultsag_id != 3";
$jogosultsagok_eredmeny = kerdes($jogosultsagok_query);
$jogosultsagok = [];

while ($row = mysqli_fetch_assoc($jogosultsagok_eredmeny)) {
    $jogosultsagok[] = $row;
}

$osztalyok_query = "SELECT osztaly_id, osztaly_nev FROM SYS_osztaly WHERE aktiv = 1";
$osztalyok_eredmeny = kerdes($osztalyok_query);
$osztalyok = [];

while ($row = mysqli_fetch_assoc($osztalyok_eredmeny)) {
    $osztalyok[] = $row;
}









echo json_encode([
    'status' => 'success',
    'message' => 'Sikeresen lekérve a felhasználók listája',
    'felhasznalok_lista' => $felhasznalok_lista,
    'jogosultsagok' => $jogosultsagok,
    'osztalyok' => $osztalyok
]);



?>