<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

// Ellenőrizzük, hogy érkezett-e POST kérelem
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Adatok beolvasása a POST-ból
    $aru_megnevezes = isset($_POST['aru_megnevezes']) ? trim($_POST['aru_megnevezes']) : null;
    $aru_tipus_id = isset($_POST['aru_tipus_id']) ? trim($_POST['aru_tipus_id']) : null;
    $megjegyzes = isset($_POST['megjegyzes']) ? trim($_POST['megjegyzes']) : null;
    

    // Alap validáció: Minden mező ki van-e töltve
    if (empty($aru_megnevezes)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Minden mezőt ki kell tölteni!'
        ]);
        exit;
    }

    // Aktuális dátum és idő beállítása
    $felvetel_datum = time();

  
    $query = "INSERT INTO `TORZS_aru` 
              (`aru_id`,`aru_megnevezes`,`aru_tipus_id`, `megjegyzes`,  `felvetel_datum`, `aktiv`) 
              VALUES 
              (NULL,'$aru_megnevezes', '$aru_tipus_id', '$megjegyzes','$felvetel_datum', 1)";

    // Adatok mentése az adatbázisba
    $result = kerdes($query);

    if ($result) {
        $uj_aru_id_str = "SELECT `aru_id` FROM `TORZS_aru` ORDER BY `aru_id` DESC LIMIT 1;";
        $uj_aru_id_qry = kerdes($uj_aru_id_str);
        $uj_aru_id = mysqli_fetch_array($uj_aru_id_qry);
        $aru_id = $uj_aru_id['aru_id'];
        if (isset($_FILES['aru_kep']) && $_FILES['aru_kep']['error'] !== UPLOAD_ERR_NO_FILE) {
            if ($_FILES['aru_kep']['error'] !== UPLOAD_ERR_OK) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Fájl feltöltési hiba: ' . $_FILES['aru_kep']['error']
                ]);
                exit;
            }
            $file_tmp = $_FILES['aru_kep']['tmp_name'];

            $file_name = uniqid() . "_" . basename($_FILES['aru_kep']['name']);
            $target_dir = "/var/www/html/userfiles/aru_kepek/" . $aru_id . "/";


            // Mappa létrehozása, ha nem létezik
            if (!file_exists($target_dir)) {
                mkdir($target_dir, 0777, true);
            }

            $target_file = $target_dir . $file_name;

            // Ellenőrizzük, hogy valóban kép-e
            $check = getimagesize($file_tmp);
            if ($check !== false) {
                if (move_uploaded_file($file_tmp, $target_file)) {
                    $aru_kep_path = "/userfiles/aru_kepek/" . $aru_id . "/" . $file_name;
                    chmod($target_file, 0664);
                }
            }

            kerdes("UPDATE `TORZS_aru` SET `file_link` = '$aru_kep_path' WHERE `aru_id` = '$aru_id'");

        }

        $updateData = array('update' => 'aru_tabla');
         // A Node.js szerver URL-je
        $ch = curl_init(NODE_SERVER_URL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        $nodeResponse = curl_exec($ch);
        curl_close($ch);

        echo json_encode([
            'status' => 'success',
            'message' => 'Áru sikeresen hozzáadva!'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Hiba történt az áru hozzáadásakor.'
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Érvénytelen kérés'
    ]);
}
?>