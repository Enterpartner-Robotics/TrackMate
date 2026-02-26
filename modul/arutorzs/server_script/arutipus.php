<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

// A keresési kifejezés lekérése és tisztítása
$tipus_kereses = $_GET['tipus_kereses'] ?? '';
$tipus_kereses = trim($tipus_kereses);

// Ellenőrizzük, hogy a keresési kifejezés nem üres
if (empty($tipus_kereses)) {
    echo json_encode(['data' => []]); // Ha üres, küldünk egy üres tömböt
    exit;
}

// Az SQL lekérdezés közvetlenül a LIKE operátorral
$aru_tipus_lekerdezes = "SELECT `aru_tipus_id`, `tipus_megnevezes` FROM `TORZS_aru_tipus` WHERE `tipus_megnevezes` LIKE '$tipus_kereses%' LIMIT 10";

$eredmeny = kerdes($aru_tipus_lekerdezes);

// Ellenőrizzük, hogy van-e eredmény
if ($eredmeny) {
    $eredmeny_tomb = []; // Az eredmények tárolására
    while ($sor = mysqli_fetch_array($eredmeny)) {
        $eredmeny_tomb[] = [
            'aru_tipus_id' => $sor['aru_tipus_id'], // id is bekerül
            'tipus_megnevezes' => $sor['tipus_megnevezes']
        ]; 
    }
    echo json_encode(['data' => $eredmeny_tomb]); // Visszaküldjük az eredményeket
} else {
    echo json_encode(['data' => []]); // Ha nincs eredmény, üres tömböt küldünk
}
?>
