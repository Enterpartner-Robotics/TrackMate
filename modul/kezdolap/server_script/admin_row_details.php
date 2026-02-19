<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

$felh_id = $_POST['felh_id'];

$admin_rowdetails_query = "SELECT SUM(tma.munkaido_felh) AS munkaido_felh,MAX(tmm.munkaido) AS ossz_ora, allapot.allapot_nev, tmm.megnevezes,tmp.projekt_id, tmp.projekt_nev, tmp.hatarido 
                           FROM TM_munkalap_aktivitas tma 
                           JOIN TM_munkalap tmm ON tmm.munkalap_id = tma.munkalap_id 
                           JOIN SYS_felh felh ON felh.felh_id = tma.felh_id 
                           LEFT JOIN TM_projekt tmp ON tmm.projekt_id = tmp.projekt_id 
                           JOIN TORZS_allapot allapot ON tmm.allapot_id = allapot.allapot_id 
                           WHERE tmm.aktiv = 1 AND felh.aktiv = 1 AND (tmp.aktiv = 1 OR tmp.projekt_id IS NULL)  AND tma.felh_id = $felh_id 
                           GROUP BY tmm.munkalap_id ORDER BY tmm.allapot_id ASC, munkaido_felh DESC";

$admin_rowdetails_lekerdezes=kerdes($admin_rowdetails_query);


if($admin_rowdetails_lekerdezes){   
    $admin_rowdetails_adatok=$admin_rowdetails_lekerdezes->fetch_all(MYSQLI_ASSOC);
    echo json_encode([
        'status'=> 'success',
        'data'=> $admin_rowdetails_adatok
    ]);
}else{
    echo json_encode([
        'status'=> 'error',
        'error'=>'Nincs adat'
    ]);
}


