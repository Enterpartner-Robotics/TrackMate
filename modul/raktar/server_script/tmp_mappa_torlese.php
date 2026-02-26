<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

// Ellenőrizzük, hogy a felhasználó be van-e jelentkezve
$felh_id = isset($_SESSION['felh_id']) ? $_SESSION['felh_id'] : null;
if (!$felh_id) {
    echo json_encode(['status' => 'error', 'message' => 'Nincs bejelentkezve.']);
    exit;
}

// A felhasználó tmp mappájának elérési útja
$tmpFolder = '/var/www/html/userfiles/aru_kepek/tmp_' . $felh_id;

// Ellenőrizzük, hogy a mappa létezik-e
if (!is_dir($tmpFolder)) {
    echo json_encode(['status' => 'success', 'message' => 'A tmp mappa nem található.']);
    exit;
}

// Minden fájl törlése a mappában
$files = glob($tmpFolder . '/*');
foreach ($files as $file) {
    if (is_file($file)) {
        unlink($file);
    }
}

// Végül töröljük magát a mappát
if (rmdir($tmpFolder)) {
    echo json_encode(['status' => 'success', 'message' => 'A tmp mappa és az összes fájl törölve.']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Nem sikerült törölni a tmp mappát.']);
}
?>