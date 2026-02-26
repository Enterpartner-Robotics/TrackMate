<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

// Ellenőrizzük, hogy érkezett-e POST kérelem
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Adatok beolvasása a POST-ból
    $partner_id = isset($_POST['id']) ? trim($_POST['id']) : null;
    $cegnev = isset($_POST['partnerAdatok']['cegNev']) ? trim($_POST['partnerAdatok']['cegNev']) : null;
    $szekhely = isset($_POST['partnerAdatok']['szekhely']) ? trim($_POST['partnerAdatok']['szekhely']) : null;
    $telefonszam = isset($_POST['partnerAdatok']['telefonszam']) ? trim($_POST['partnerAdatok']['telefonszam']) : null;
    $adoszam = isset($_POST['partnerAdatok']['adoszam']) ? trim($_POST['partnerAdatok']['adoszam']) : null;
    

    // Alap validáció: Minden mező ki van-e töltve
    if (empty($cegnev) || empty($szekhely) || empty($telefonszam) || empty($adoszam)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Minden mezőt ki kell tölteni!'
        ]);
        exit;
    }

    // Aktuális dátum és idő beállítása
    $felvetel_datum = time();

    $query = "UPDATE `TORZS_partner` SET 
    `cegnev`='$cegnev',`szekhely`='$szekhely',`telefonszam`='$telefonszam',`cegadoszam`='$adoszam',`felvetel_datum`='$felvetel_datum' WHERE `partner_id` = '$partner_id'";

    // Adatok mentése az adatbázisba
    $result = kerdes($query);

    if ($result) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Partner sikeresen szerkesztve!'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Hiba történt a partner szerkesztésekor.'
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Érvénytelen kérés'
    ]);
}
?>