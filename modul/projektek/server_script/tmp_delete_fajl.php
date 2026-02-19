<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

$felh_id = isset($_SESSION['felh_id']) ? $_SESSION['felh_id'] : null;
if (!$felh_id) {
    echo json_encode(['status' => 'error', 'message' => 'Nincs bejelentkezve.']);
    exit;
}

if (!isset($_POST['filepath'])) {
    echo json_encode(['status' => 'error', 'message' => 'Nincs fájlútvonal megadva.']);
    exit;
}

$filepath = $_POST['filepath']; // Például: /userfiles/projekt_modul/tmp_1/filename.jpg

// Biztosítjuk, hogy csak a bejelentkezett felhasználó tmp mappájából törölhetünk
if (strpos($filepath, "/tmp_" . $felh_id . "/") === false) {
    echo json_encode(['status' => 'error', 'message' => 'Jogosulatlan fájl törlés.']);
    exit;
}

// A teljes elérési útvonal kialakítása
$documentRoot = '/var/www/html';
$fullPath = $documentRoot . $filepath;

if (file_exists($fullPath)) {
    if (unlink($fullPath)) {
        $response = ['status' => 'success', 'message' => 'Fájl sikeresen törölve.'];
        
        // Ellenőrizzük, hogy a mappa üres-e, majd töröljük azt is, ha igen.
        $folderRelative = dirname($filepath); // Pl.: /userfiles/projekt_modul/tmp_1
        $folderFull = $documentRoot . $folderRelative;
        
        // Lekérjük a mappa tartalmát, kivéve a . és ..
        if (is_dir($folderFull)) {
            $files = array_diff(scandir($folderFull), array('.', '..'));
            if (empty($files)) {
                if (rmdir($folderFull)) {
                    $response['folder_deleted'] = 'Mappa is törölve, mert üres volt.';
                } else {
                    $response['folder_deleted'] = 'Mappa üres, de nem sikerült törölni.';
                }
            }
        }
        
        echo json_encode($response);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Fájl törlése sikertelen.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Fájl nem található.']);
}
?>
