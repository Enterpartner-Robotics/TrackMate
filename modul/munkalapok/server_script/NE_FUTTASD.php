<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');


$query_str = "SELECT * FROM `TM_munkalap_aktivitas` WHERE `munkalap_allapot` = 2";
$query = kerdes($query_str);
while($sor = mysqli_fetch_assoc($query))
{
    $result[] = $sor;
}

echo"<pre>";print_r($result);echo"</pre>";

?>