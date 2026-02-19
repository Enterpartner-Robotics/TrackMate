<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

$aru_nev=$_GET['term'];

$aru_str = "SELECT ta.aru_id,tr.raktar_id ,ta.aru_megnevezes, tr.darab FROM TM_raktar tr INNER JOIN TORZS_aru ta ON tr.aru_id = ta.aru_id WHERE ta.aru_megnevezes LIKE '%$aru_nev%'";
$aru_eredmeny=kerdes($aru_str);
if($aru_eredmeny){
    $aru_adatok=[];

    while($sor=mysqli_fetch_assoc($aru_eredmeny)){
        $aru_adatok[]=[
            "aru_id"=>$sor["aru_id"],
            "raktar_id"=>$sor["raktar_id"],
            "aru_nev"=>$sor["aru_megnevezes"],
            "darab"=>$sor["darab"]
        ];
    }

    echo json_encode([
        "aru_adatok"=>$aru_adatok,
        "status"=>"success",
        "error"=>false
    ]);

}
else{
    echo json_encode([
        "status"=>"success",
        "aru_adatok"=>[],
        "error"=>false
    ]);
}
?>