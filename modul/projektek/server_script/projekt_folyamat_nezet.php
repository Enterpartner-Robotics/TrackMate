<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');


$projekt_id = $_POST['projekt_id'];

$projekt_folyamat_nezet_query = "SELECT tmp.projekt_nev, tmp.hatarido,tmp.oradij,tmp.munkaido,tmp.szoftver_osszeg,tmp.hardver_osszeg,tmp.teljes_osszeg,tmp.datum AS kezdes_datum, ta.allapot_nev, ta.allapot_id
FROM TM_projekt tmp
JOIN TORZS_allapot ta ON tmp.allapot_id = ta.allapot_id
WHERE tmp.projekt_id = $projekt_id";



$projekt_folyamat_lekerdezes = kerdes($projekt_folyamat_nezet_query);
$projekt_folyamat_adatok = $projekt_folyamat_lekerdezes->fetch_assoc();


$projekt_ossz_ora_query="SELECT MAX(`ossz_ora`) AS ossz_ora FROM TM_projekt_aktivitas WHERE `projekt_id` = $projekt_id";
$projekt_ossz_ora_eredmeny = kerdes($projekt_ossz_ora_query);
$projekt_ossz_ora_adat = mysqli_fetch_assoc($projekt_ossz_ora_eredmeny);
$aktualis_szoftver_osszeg = $projekt_ossz_ora_adat['ossz_ora']*$projekt_folyamat_adatok['oradij'];


$hardver_osszeg_query = "SELECT tmrb.darab as darab,tmr.beszerzesi_ar as beszerzesi_ar FROM TM_raktar_bejegyzes tmrb
                         JOIN TM_munkalap tmm ON tmrb.munkalap_id=tmm.munkalap_id 
                         JOIN TM_raktar tmr ON tmrb.raktar_id=tmr.raktar_id
                         WHERE tmm.projekt_id= $projekt_id AND tmrb.bejegyzes_tipus_id=3";

$hardver_osszeg_eredmeny=kerdes($hardver_osszeg_query);

$aktualis_hardver_osszeg=0;
while($hardver_osszeg_adat = mysqli_fetch_assoc($hardver_osszeg_eredmeny)){
    $aktualis_hardver_osszeg+=$hardver_osszeg_adat['darab']*$hardver_osszeg_adat['beszerzesi_ar'];
    
}


echo json_encode([
    'status' => 'success',
    'projekt_folyamat_adatok' => $projekt_folyamat_adatok,
    'aktualis_szoftver_osszeg' => $aktualis_szoftver_osszeg,
    'aktualis_hardver_osszeg' => $aktualis_hardver_osszeg
]);



?>