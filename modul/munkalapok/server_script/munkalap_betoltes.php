<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');


$projekt_id=$_GET['projekt_id'];

//Modositani kell a lekérdezést úgy hogy lekérje a munkalap állapotát is, és aszerint a js-ben megjeleniteni a munkalapokat (rendezve állapot szerint) úgy mint a projekteknél. 
// ha ez megvan akkor kell kezelni  a munkalap_aktivitas tablat.

$munkalap_lekerdezes="SELECT 
                        tmm.munkalap_id,tmm.megnevezes,
                        tmm.munkaido,ta.allapot_id
                      FROM 
                        TM_munkalap tmm 
                        LEFT JOIN TORZS_allapot ta on tmm.allapot_id=ta.allapot_id
    WHERE `projekt_id` = $projekt_id ORDER BY munkalap_id";
$munkalap_eredmeny = kerdes($munkalap_lekerdezes);
$munkalap_adatok = [];

while ($sor = mysqli_fetch_assoc($munkalap_eredmeny)) {
    $munkalap_adatok[] = [
       "munkalap_id" => $sor["munkalap_id"],
       "megnevezes" => $sor["megnevezes"],
       "munkaido" => $sor["munkaido"],
       "allapot_id" => $sor["allapot_id"]
    ];
}


echo json_encode([
    
    'munkalap_adatok' => $munkalap_adatok,
    //'munkalap_aktivitas_adatok' => $munkalap_aktivitas_adatok,
    
    'status' => 'success',
    'error' => false
]);

?>