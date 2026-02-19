<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

$osszes_projekt_query="SELECT COUNT(projekt_id) AS projekt_szam FROM `TM_projekt` WHERE `aktiv` = 1";
$osszes_projekt_lekerdezese=kerdes($osszes_projekt_query);

if ($osszes_projekt_lekerdezese) {
    $row = $osszes_projekt_lekerdezese->fetch_assoc(); // Eredmény lekérése
    $osszes_projekt_eredmeny = $row['projekt_szam']; // Helyes kulcs használata
}

$osszes_felhasznalo_query="SELECT COUNT(felh_id) AS felh_szam FROM `SYS_felh` WHERE `aktiv` = 1 AND `felh_id` !=0";
$osszes_felhasznalo_lekerdezese=kerdes($osszes_felhasznalo_query);

if ($osszes_felhasznalo_lekerdezese) {
    $row = $osszes_felhasznalo_lekerdezese->fetch_assoc(); // Eredmény lekérése
    $osszes_felhasznalo_eredmeny = $row['felh_szam']; // Helyes kulcs használata
}

$osszes_aktiv_munkalap_query="SELECT COUNT(`munkalap_aktivitas_id`) AS ossz_aktiv_munkalapok FROM `TM_munkalap_aktivitas` WHERE `munkalap_allapot` = 1;";
$osszes_aktiv_munkalap_lekerdezese=kerdes($osszes_aktiv_munkalap_query);
if ($osszes_aktiv_munkalap_lekerdezese) {
    $row = $osszes_aktiv_munkalap_lekerdezese->fetch_assoc(); // Eredmény lekérése
    $osszes_aktiv_munkalap_eredmeny = $row['ossz_aktiv_munkalapok']; // Helyes kulcs használata
}

$osszes_munkaora_query="SELECT SUM(max_ora) AS ossz_ora_osszesen
                        FROM (
                            SELECT MAX(ossz_ora) AS max_ora
                            FROM TM_projekt_aktivitas tmpa
                            JOIN TM_projekt tmp ON tmp.projekt_id = tmpa.projekt_id
                            WHERE tmp.aktiv = 1
                            GROUP BY tmpa.projekt_id
                         ) AS teljes_ossz_ora";
$osszes_munkaora_lekerdezese=kerdes($osszes_munkaora_query);

if ($osszes_munkaora_lekerdezese) {
    $row = $osszes_munkaora_lekerdezese->fetch_assoc(); // Eredmény lekérése
    $osszes_munkaora_eredmeny = $row['ossz_ora_osszesen']; // Helyes kulcs használata
}

$hatralevo_munkalapok_query="SELECT COUNT(munkalap_id) AS munkalap_szam FROM `TM_munkalap` WHERE `aktiv` = 1 AND (`allapot_id` = 1 OR `allapot_id` = 2)";
$hatralevo_munkalapok_lekerdezese=kerdes($hatralevo_munkalapok_query);

if ($hatralevo_munkalapok_lekerdezese) {
    $row = $hatralevo_munkalapok_lekerdezese->fetch_assoc(); // Eredmény lekérése
    $hatralevo_munkalapok_eredmeny = $row['munkalap_szam']; // Helyes kulcs használata
}


$felhasznalo_aktivitas_query = "SELECT felh_id, teljes_nev, profil_kep_link FROM SYS_felh WHERE aktiv = 1 AND (jogosultsag_id = 1 OR jogosultsag_id = 2)";
$felhasznalo_aktivitas_lekerdezese = kerdes($felhasznalo_aktivitas_query);

$felhasznalok = array();

if ($felhasznalo_aktivitas_lekerdezese) {
    while ($row = $felhasznalo_aktivitas_lekerdezese->fetch_assoc()) {
        $felhasznalok[] = array(
            'felh_id' => $row['felh_id'],
            'teljes_nev' => $row['teljes_nev'],
            'profil_kep_link' => $row['profil_kep_link']
        );
    }
}

echo json_encode([
    'status' => 'success',
    'osszes_projekt' => $osszes_projekt_eredmeny,
    'osszes_felhasznalo' => $osszes_felhasznalo_eredmeny,
    'osszes_aktiv_munkalap' => $osszes_aktiv_munkalap_eredmeny,
    'osszes_munkaora' => $osszes_munkaora_eredmeny,
    'hatralevo_munkalapok' => $hatralevo_munkalapok_eredmeny,
    'felhasznalok' => $felhasznalok  // Új, egyesített tömb
]);

?>