<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

$felh_id=$_SESSION['felh_id'];

$osszes_munkaora_query="SELECT SUM(munkaido_felh) as dolgozott_ora FROM TM_munkalap_aktivitas WHERE felh_id = $felh_id";
$osszes_munkaora_lekerdezese=kerdes($osszes_munkaora_query);

if ($osszes_munkaora_lekerdezese) {
    $row = $osszes_munkaora_lekerdezese->fetch_assoc(); // Eredmény lekérése
    $osszes_munkaora_eredmeny = $row['dolgozott_ora']; // Helyes kulcs használata
}

echo json_encode([
    'status' => 'success',
    'dolgozott_ora' => $osszes_munkaora_eredmeny
]);





?>