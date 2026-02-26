<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $felh_id = isset($_SESSION['felh_id']) ? $_SESSION['felh_id'] : null;
    
    if (!$felh_id) {
        echo json_encode(['status' => 'error', 'message' => 'Nincs bejelentkezve.']);
        exit;
    }

    if(isset($_POST['file_link']) && !empty($_POST['file_link'])){
        $file_link = $_POST['file_link'];
        $baseDir = '/var/www/html';
        $file_path = realpath($baseDir . $file_link);

        // Ha a fájl nem található, visszaadunk egy hibát
        if (!$file_path || !file_exists($file_path)) {
            echo json_encode(['status' => 'error', 'message' => 'A fájl nem található.']);
            exit;
        }

        // Fájl törlése
        if (!unlink($file_path)) {
            echo json_encode(['status' => 'error', 'message' => 'A fájl törlése sikertelen.']);
            exit;
        }

        // Ellenőrizzük, hogy a fájlt tartalmazó mappa üres-e
        $dir = dirname($file_path);
        if (is_dir($dir)) {
            // Kivesszük a pontokat ('.' és '..')
            $files = array_diff(scandir($dir), array('.', '..'));
            if (empty($files)) {
                // Ha a mappa üres, megpróbáljuk törölni
                if (!rmdir($dir)) {
                    echo json_encode(['status' => 'warning', 'message' => 'A fájl törölve, de a mappa nem törölhető.']);
                    exit;
                }
            }
        }

        echo json_encode(['status' => 'success', 'message' => 'Fájl törölve, és a mappa is eltávolítva, ha üres volt.']);

        
    }
    else{
        echo json_encode(['status' => 'success', 'message' => 'Nem volt fájl link megadva.']);
    }
}
?>