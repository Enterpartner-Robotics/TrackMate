<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    if(!isset($_SESSION['felh_id'])){
        echo json_encode([
            'status' => 'error',
            'message' => 'Nincs bejelentkezve!'
        ]);
        exit;
    }

    $kategoria_id = isset($_POST['kategoria_id']) ? trim($_POST['kategoria_id']) : null;
    $kategoria_nev = isset($_POST['kategoria_nev']) ? trim($_POST['kategoria_nev']) : null;

    if (empty($kategoria_id) || empty($kategoria_nev)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Minden mezőt ki kell tölteni!'
        ]);
        exit;
    }

    $van_e = kerdes("SELECT aktiv, kategoria_id FROM `TM_dokumentumtar_kategoria` WHERE `kategoria_nev` = '$kategoria_nev'");
    $van_e_result = mysqli_fetch_assoc($van_e);
    if($van_e_result){
        echo json_encode([
            'status' => 'error',
            'message' => 'A kategória már létezik!'
        ]);
        exit;
    }

    $query = "UPDATE `TM_dokumentumtar_kategoria` SET `kategoria_nev` = '$kategoria_nev' WHERE `kategoria_id` = '$kategoria_id'";
    $result = kerdes($query);

    if ($result) {
        $updateData = array('update' => 'kategoria_baloldal');
        
        $ch = curl_init(NODE_SERVER_URL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        $nodeResponse = curl_exec($ch);
        curl_close($ch);
        echo json_encode([
            'status' => 'success',
            'message' => 'Kategória sikeresen szerkesztve!'
        ]);
    }
    else{
        echo json_encode([
            'status' => 'error',
            'message' => 'Hiba történt a kategória szerkesztésekor!'
        ]);
    }
}
?>