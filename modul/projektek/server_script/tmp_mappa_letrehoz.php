<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

$felh_id = isset($_SESSION['felh_id']) ? $_SESSION['felh_id'] : null;
if (!$felh_id) {
    echo json_encode(['status' => 'error', 'message' => 'Nincs bejelentkezve.']);
    exit;
}
if($_POST['confirm_mod'] == "specifikacio_kep"){
    $baseDir = '/var/www/html/userfiles/projekt_modul';
    $tmpDir = $baseDir . '/tmp_' . $felh_id;


    // Létrehozzuk a tmp mappát, ha még nem létezik
    if (!is_dir($tmpDir)) {
        if (!mkdir($tmpDir, 0777, true)) {
            echo json_encode(['status' => 'error', 'message' => 'Nem sikerült létrehozni a mappát.']);
            exit;
        }
    }

    // Ellenőrizzük, hogy megérkezett-e a fájl
    if (isset($_FILES['specifikacio_kep'])) {
        $file = $_FILES['specifikacio_kep'];
        $originalName = basename($file['name']);
        // Megkapjuk a file nevét, amit az űrlapon az aru_megnevezes input tartalmaz
        $customName = isset($_POST['specifikacio_kep_nev']) ? trim($_POST['specifikacio_kep_nev']) : '';
        if ($customName === '') {
            echo json_encode(['status' => 'error', 'message' => 'Nincs megadva fájl név.']);
            exit;
        }
        $customName = iconv('UTF-8', 'ASCII//TRANSLIT', $customName);
        // Csak alfanumerikus karakterek, alulvonás, kötőjel és szóköz engedélyezett – a szóközöket alulvonásra cseréljük
        $customName = preg_replace('/[^a-zA-Z0-9_\- ]/', '', $customName);
        $customName = str_replace(' ', '_', $customName);
        
        // Meghatározzuk a fájl kiterjesztését az eredeti fájlnév alapján
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        
        // Állítsuk be a cél útvonalat az új fájlnévvel
        $newFileName = $customName . ($extension ? '.' . $extension : '');
        $destination = $tmpDir . '/' . $newFileName;
        $show_route = '/userfiles/projekt_modul/tmp_' . $felh_id . '/' . $newFileName;
        
        if (move_uploaded_file($file['tmp_name'], $destination)) {
            echo json_encode(['status' => 'success', 'file' => $show_route]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'A fájl mozgatása sikertelen.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Nincs feltöltött fájl.']);
    }
}
?>
