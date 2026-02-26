<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

$projekt_nev=$_GET['term'];

$projekt_lekerdezes="SELECT projekt_id,projekt_nev FROM TM_projekt WHERE projekt_nev LIKE '%$projekt_nev%' AND aktiv=1";
$projekt_eredmeny=kerdes($projekt_lekerdezes);

$projekt_adatok=[];

while($sor=mysqli_fetch_assoc($projekt_eredmeny)){
    $projekt_adatok[]=[
        "projekt_id"=>$sor["projekt_id"],
        "projekt_nev"=>$sor["projekt_nev"]
    ];
}

echo json_encode([
    "projekt_adatok"=>$projekt_adatok,
    "status"=>"success",
    "error"=>false

]);

?>