<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

// Ellenőrizzük, hogy érkezett-e POST kérelem
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Adatok beolvasása a POST-ból
    $aru_id = isset($_POST['aru_id']) && $_POST['aru_id'] !== "" ? trim($_POST['aru_id']) : null;
    $aru_megnevezes = isset($_POST['aru_megnevezes']) && $_POST['aru_megnevezes'] !== "" ? trim($_POST['aru_megnevezes']) : null;
    $aru_tipus_id = isset($_POST['aru_tipus_id']) && $_POST['aru_tipus_id'] !== "" ? trim($_POST['aru_tipus_id']) : "NULL";
    $megjegyzes = isset($_POST['megjegyzes']) && $_POST['megjegyzes'] !== "" ? trim($_POST['megjegyzes']) : null;
    

    // Alap validáció: Minden mező ki van-e töltve
    if (empty($aru_megnevezes)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Minden mezőt ki kell tölteni!'
        ]);
        exit;
    }

   
    $felvetel_datum = time();
    $query = "UPDATE `TORZS_aru` SET 
    `aru_megnevezes`='$aru_megnevezes',`aru_tipus_id` = $aru_tipus_id,`megjegyzes`='$megjegyzes', `felvetel_datum` = '$felvetel_datum' WHERE `aru_id` = '$aru_id'";

    // Adatok mentése az adatbázisba
    $result = kerdes($query);

    // Ha van feltöltött fájl, dolgozzuk fel
    if (isset($_FILES['aru_kep']) && $_FILES['aru_kep']['error'] === UPLOAD_ERR_OK) {
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

                // Kép elérési út frissítése az adatbázisban
                kerdes("UPDATE `TORZS_aru` SET `file_link` = '$aru_kep_path' WHERE `aru_id` = '$aru_id'");
            }
        }
    }
    if ($result) {
        
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
            'message' => 'Áru sikeresen szerkesztve!'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Hiba történt az áru szerkesztésekor.'
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Érvénytelen kérés'
    ]);
}
?>