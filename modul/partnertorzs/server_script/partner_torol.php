<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Adatok beolvasása a POST-ból
    $torol_partner_id = isset($_POST['torol_partner_id']) ? trim($_POST['torol_partner_id']) : null;
    echo
    $query = "UPDATE `TORZS_partner` SET 
    `aktiv`= 0 WHERE `partner_id` = '$torol_partner_id'";

    // Adatok mentése az adatbázisba
    $result = kerdes($query);

    if ($result) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Partner sikeresen törölve!'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Hiba történt a partner törlésében.'
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Érvénytelen kérés'
    ]);
}
?>