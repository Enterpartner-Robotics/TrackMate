<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

// A keresési kifejezés lekérése és tisztítása
$kereses = $_GET['term'] ?? ''; // Az "term" paramétert várjuk
$kereses = trim($kereses);

// Ellenőrizzük, hogy a keresési kifejezés nem üres
if (empty($kereses)) {
    echo json_encode([]); // Ha üres, üres tömböt küldünk
    exit;
}

// Az SQL lekérdezés, ha a kifejezés * karakter
if ($kereses === '*') {
    $partner_lekerdezes = "
        SELECT `partner_id`, `cegnev` 
        FROM `TORZS_partner`  WHERE `aktiv` = 1
        LIMIT 10
    ";
} else {
    // Normál keresési feltétel LIKE-kal
    $partner_lekerdezes = "
        SELECT `partner_id`, `cegnev` 
        FROM `TORZS_partner` 
        WHERE `cegnev` LIKE '$kereses%' AND `aktiv` =1
        LIMIT 10
    ";
}

$eredmeny = kerdes($partner_lekerdezes);

// Ellenőrizzük, hogy van-e eredmény
if ($eredmeny) {
    $eredmeny_tomb = []; // Az eredmények tárolására
    while ($sor = mysqli_fetch_array($eredmeny)) {
        $eredmeny_tomb[] = [
            'partner_id' => $sor['partner_id'], // ID is bekerül
            'cegnev' => $sor['cegnev'] // Megnevezés
        ]; 
    }
    echo json_encode($eredmeny_tomb); // Visszaküldjük az eredményeket
} else {
    echo json_encode([]); // Ha nincs eredmény, üres tömböt küldünk
}
?>
