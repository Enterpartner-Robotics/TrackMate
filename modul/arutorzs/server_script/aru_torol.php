<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Adatok beolvasása a POST-ból
    $torol_aru_id = isset($_POST['torol_aru_id']) ? trim($_POST['torol_aru_id']) : null;
    $query = "UPDATE `TORZS_aru` SET 
    `aktiv`= 0 WHERE `aru_id` = '$torol_aru_id'";

    // Adatok mentése az adatbázisba
    $result = kerdes($query);

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
            'message' => 'Áru sikeresen törölve!'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Hiba történt a áru törlésében.'
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Érvénytelen kérés'
    ]);
}
?>