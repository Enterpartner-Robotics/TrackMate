<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if(isset($_GET['munkalap_id'])){
    $munkalap_id = $_GET['munkalap_id'];
}else{
    $munkalap_id = '';
}
$munkalap_felh_akt_tomb = [];
$munkalap_reszletes_str = "SELECT 
    tm.munkalap_id, tm.megnevezes, tm.munkaido, tm.datum, 
    tm.allapot_id, ta.allapot_nev,
    tp.projekt_nev, MAX(tma.ossz_ora) AS ossz_ora, tm.specifikacio_file
FROM 
    TM_munkalap tm
    INNER JOIN TORZS_allapot ta ON tm.allapot_id = ta.allapot_id
    LEFT JOIN TM_projekt tp ON tp.projekt_id = tm.projekt_id
    LEFT JOIN TM_munkalap_aktivitas tma ON tma.munkalap_id = tm.munkalap_id
WHERE 
    tm.aktiv = 1 AND tm.munkalap_id = $munkalap_id GROUP BY tm.munkalap_id ORDER BY munkalap_id DESC;";
$munkalap_reszletes_qry = kerdes($munkalap_reszletes_str);
$munkalap_reszletes_adat = mysqli_fetch_assoc($munkalap_reszletes_qry);

$munkalap_felh_akt_str = "SELECT 
                                sf.felh_id, sf.felh_nev, sf.profil_kep_link, SUM(tma.munkaido_felh) AS munkaido_felh
                            FROM 
                                TM_munkalap_aktivitas tma
                                INNER JOIN SYS_felh sf ON sf.felh_id = tma.felh_id
                            WHERE 
                                tma.munkalap_id = '$munkalap_id' AND tma.munkalap_allapot = 2
                            GROUP BY tma.felh_id ORDER BY munkaido_felh DESC";
$munkalap_felh_akt_qry = kerdes($munkalap_felh_akt_str);
while($munkalap_felh_akt_sor = mysqli_fetch_assoc($munkalap_felh_akt_qry)){
    $munkalap_felh_akt_tomb[] = $munkalap_felh_akt_sor;
}

if($munkalap_reszletes_adat){
    $munkalap_reszletes_adat["felh_akt"] = $munkalap_felh_akt_tomb;
    echo json_encode($munkalap_reszletes_adat);
}else{
    echo json_encode(['error' => 'Nincs adat']);
}

?>