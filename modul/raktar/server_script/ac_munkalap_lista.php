<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');
if($_SERVER['REQUEST_METHOD']=='POST'){
    if(!isset($_SESSION['felh_id'])){
        echo json_encode([
            "status"=>"error",
            "error"=>"Nincs bejelentkezve"
        ]);
        exit;

    }
    $projekt_nev=$_POST['term'];

    $projekt_lekerdezes="SELECT munkalap_id,megnevezes FROM TM_munkalap WHERE megnevezes LIKE '%$projekt_nev%' AND aktiv=1";
    $projekt_eredmeny=kerdes($projekt_lekerdezes);

    $projekt_adatok=[];

    while($sor=mysqli_fetch_assoc($projekt_eredmeny)){
        $projekt_adatok[]=[
            "munkalap_id"=>$sor["munkalap_id"],
            "munkalap_nev"=>$sor["megnevezes"]
        ];
    }

    echo json_encode([
        "projekt_adatok"=>$projekt_adatok,
        "status"=>"success",
        "error"=>false

    ]);
}

?>