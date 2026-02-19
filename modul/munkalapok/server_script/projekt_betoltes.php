<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

$felh_jog = $_SESSION['jogosultsag_id'];

if(isset($_GET['projekt_kereses'])){
    $projekt_kereses = $_GET['projekt_kereses'];
}else{
    $projekt_kereses = '';
}


$projekt_lekerdezes = "SELECT tmp.projekt_id, tmp.projekt_nev, tmp.hatarido, tmp.munkaido, ta.allapot_nev, tp.cegnev, tmp.jog_csoport
                       FROM TM_projekt tmp 
                       LEFT JOIN TORZS_allapot ta ON tmp.allapot_id = ta.allapot_id
                       LEFT JOIN TORZS_partner tp ON tmp.partner_id = tp.partner_id
                       WHERE tmp.aktiv = 1 AND tmp.projekt_nev LIKE '%$projekt_kereses%' ORDER BY tmp.projekt_id ASC;";
                       

$projekt_eredmeny = kerdes($projekt_lekerdezes); // Feltételezve, hogy ez a függvény visszaad egy eredményhalmazt
$projekt_adatok = [];



while ($sor = mysqli_fetch_assoc($projekt_eredmeny)) {
    $jogok = explode('|', $sor['jog_csoport']);
    if ($felh_jog == 1) {
        $projekt_adatok[] = [
            "projekt_id"    => $sor["projekt_id"],
            "projekt_nev"   => $sor["projekt_nev"],
            "hatarido"      => $sor["hatarido"],
            "munkaido"      => $sor["munkaido"],
            "allapot_nev"   => $sor["allapot_nev"],
            "cegnev"        => $sor["cegnev"]
            
        ];
    }
    else if (in_array($felh_jog, $jogok)) {
        $projekt_adatok[] = [
            "projekt_id"    => $sor["projekt_id"],
            "projekt_nev"   => $sor["projekt_nev"],
            "hatarido"      => $sor["hatarido"],
            "munkaido"      => $sor["munkaido"],
            "allapot_nev"   => $sor["allapot_nev"],
            "cegnev"        => $sor["cegnev"]
            
        ];
    }
}

$projekt_aktivitas_adatok = [];

foreach ($projekt_adatok as $index => $projekt) {
    $projekt_id = $projekt['projekt_id'];

    $projekt_aktivitas_lekerdezes = "SELECT COALESCE(MAX(ossz_ora), 0) as ossz_ora 
                                     FROM TM_projekt_aktivitas  
                                     WHERE projekt_id = $projekt_id";
    $projekt_aktivitas_eredmeny = kerdes($projekt_aktivitas_lekerdezes);
    $ossz_ora_sor = mysqli_fetch_assoc($projekt_aktivitas_eredmeny);
    
    // Hozzáadjuk az ossz_ora értéket a projekt adatokhoz
    $projekt_adatok[$index]['ossz_ora'] = $ossz_ora_sor['ossz_ora'];
    
    // Eltároljuk a projekt_id-t és a hozzá tartozó ossz_ora értéket
    $projekt_aktivitas_adatok[$projekt_id] = $ossz_ora_sor['ossz_ora'];
}

echo json_encode([
    'projekt_adatok' => $projekt_adatok,
    'projekt_aktivitas_adatok' => $projekt_aktivitas_adatok,
    'status' => 'success',
    'error' => false
]);




?>