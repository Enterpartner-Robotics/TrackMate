<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');
$sql = "SELECT `jogosultsag_id`,`jogosultsag_nev` FROM `SYS_jogosultsag` WHERE `aktiv` = 1 AND `jogosultsag_id` != 1 AND `jogosultsag_id` != 3;";
$result = kerdes($sql);
while($sor = mysqli_fetch_array($result)){
    $tomb[] = $sor;
}
echo json_encode($tomb);
?>