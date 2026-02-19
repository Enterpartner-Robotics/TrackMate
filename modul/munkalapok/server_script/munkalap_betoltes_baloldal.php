<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');
$felh_jog = $_SESSION['jogosultsag_id'];
if(isset($_GET['kereses'])){
    $kereses = $_GET['kereses'];
}else{
    $kereses = '';
}
$munkalapok_lekerdezes = 
"SELECT 
    tm.munkalap_id, tm.megnevezes, tm.munkaido, tm.datum, 
    tm.allapot_id, ta.allapot_nev,
    tp.projekt_nev, MAX(tma.ossz_ora) AS ossz_ora,
    tm.jog_csoport
FROM 
    TM_munkalap tm
    INNER JOIN TORZS_allapot ta ON tm.allapot_id = ta.allapot_id
    LEFT JOIN TM_projekt tp ON tp.projekt_id = tm.projekt_id
    LEFT JOIN TM_munkalap_aktivitas tma ON tma.munkalap_id = tm.munkalap_id
WHERE 
    tm.aktiv = 1 AND (tm.megnevezes LIKE '%$kereses%' OR tm.munkalap_id LIKE '%$kereses%' OR tp.projekt_nev LIKE '%$kereses%' OR tm.datum LIKE '%$kereses%' OR ta.allapot_nev LIKE '%$kereses%') GROUP BY tm.munkalap_id ORDER BY munkalap_id DESC;";
$munkalapok_eredmeny = kerdes($munkalapok_lekerdezes);
$munkalapok_adatok = [];

while($sor = mysqli_fetch_assoc($munkalapok_eredmeny)){
    $jogok = explode('|', $sor['jog_csoport']);
    if ($felh_jog == 1) {
        $munkalapok_adatok[] = $sor;
    }
    else if (in_array($felh_jog, $jogok)) {
        $munkalapok_adatok[] = $sor;
    }
}
echo json_encode([
    'munkalapok_adatok' => $munkalapok_adatok,
    'status' => 'success',
    'error' => false
]);


?>