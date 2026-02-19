<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if(isset($_POST['munkalap_id'])){
    $munkalap_id = $_POST['munkalap_id'];
}else{
    $munkalap_id = '';
}
if($munkalap_id != ''){
    date_default_timezone_set('Europe/Budapest'); // Válaszd ki a megfelelő időzónát
    $datum_zaras = date('Y-m-d H:i:s');
    //$datum_zaras = "2025-03-12 21:35:00";
    $mai_datum = date('Y-m-d');
    $time_stamp = time();
    $felh_id = $_SESSION['felh_id'];



    $projekt_id_qry = kerdes("SELECT tm.projekt_id, tma.kezdes_ido FROM TM_munkalap_aktivitas tma INNER JOIN TM_munkalap tm ON tma.munkalap_id = tm.munkalap_id WHERE tma.munkalap_id = '$munkalap_id' AND tma.felh_id = '$felh_id' AND tma.munkalap_allapot = 1");
    $projekt_id_eredmeny = mysqli_fetch_assoc($projekt_id_qry);
    $projekt_id = $projekt_id_eredmeny['projekt_id'];
    $datum_kezdes = $projekt_id_eredmeny['kezdes_ido'];



    $kezdes = new DateTime($datum_kezdes);
    $zaras  = new DateTime($datum_zaras);
    $kulonbseg = $zaras->diff($kezdes);
    $teljesOra = $kulonbseg->days * 24 + $kulonbseg->h;
    $perc = $kulonbseg->i;
    $oraTizedes = $teljesOra + ($perc / 60);

    
    $ora_osszeg = "SELECT ossz_ora FROM TM_munkalap_aktivitas WHERE munkalap_id = '$munkalap_id' AND munkalap_allapot = 2 ORDER BY munkalap_aktivitas_id DESC LIMIT 1";
    $ora_osszeg_eredmeny = kerdes($ora_osszeg);
    $ora_osszeg_adat = mysqli_fetch_assoc($ora_osszeg_eredmeny);
    $ora_osszeg_adat['ossz_ora'];
    $ora_osszeg_ora = $ora_osszeg_adat['ossz_ora'];
    $ora_osszeg_ora = $ora_osszeg_ora + $oraTizedes;
    $ora_osszeg_ora = number_format($ora_osszeg_ora, 4, '.', '');
    $munkalap_aktivitas_id_qry = kerdes("SELECT munkalap_aktivitas_id FROM TM_munkalap_aktivitas WHERE munkalap_id = '$munkalap_id' AND felh_id = '$felh_id' AND munkalap_allapot = 1");
    $munkalap_aktivitas_id_eredmeny = mysqli_fetch_assoc($munkalap_aktivitas_id_qry);
    $munkalap_aktivitas_id = $munkalap_aktivitas_id_eredmeny['munkalap_aktivitas_id'];


    $update_munkalap_aktivitas = "UPDATE `TM_munkalap_aktivitas` SET `zaras_ido`='$datum_zaras',`munkalap_allapot`=2, `ossz_ora`='$ora_osszeg_ora', `munkaido_felh`='$oraTizedes' WHERE `munkalap_aktivitas_id` = '$munkalap_aktivitas_id'";
    $res = kerdes($update_munkalap_aktivitas);
    if(!$res)
    {
        echo json_encode([
            'status' => 'error',
            'message' => 'Frissítési hiba!',
            'error' => true
        ]);
        exit();
    }

    if($projekt_id != ''){
        $munkaido_osszesito_query="SELECT `ossz_ora` FROM TM_projekt_aktivitas WHERE `projekt_id` = '$projekt_id' ORDER BY `projekt_aktivitas_id` DESC LIMIT 1";
        $munkaido_osszesito_eredmeny=kerdes($munkaido_osszesito_query);
        $munka_osszesito_eredmeny = mysqli_fetch_assoc($munkaido_osszesito_eredmeny);

        $projekt_ossz_ora=$munka_osszesito_eredmeny['ossz_ora'] + $oraTizedes;
        $projekt_ossz_ora=number_format($projekt_ossz_ora, 4, '.', '');

        

        $munkaido_felh_query="SELECT `munkaido_felh` FROM TM_projekt_aktivitas WHERE `projekt_id` = '$projekt_id' AND `felh_id` = '$felh_id' ORDER BY `projekt_aktivitas_id` DESC LIMIT 1";
        $munkaido_felh_eredmeny=kerdes($munkaido_felh_query);
        $munkaido_felh_adat = mysqli_fetch_assoc($munkaido_felh_eredmeny);

        $munkaido_felh_osszeg = $munkaido_felh_adat['munkaido_felh'] + $oraTizedes;
        $munkaido_felh_osszeg=number_format($munkaido_felh_osszeg, 4, '.', '');

        

        

        $projekt_akt_insert ="INSERT INTO `TM_projekt_aktivitas`(`projekt_aktivitas_id`, `felh_id`, `projekt_id`, `munkaido_felh`,`ossz_ora`, `felvetel_datum`, `datum`) VALUES (NULL,'$felh_id','$projekt_id','$munkaido_felh_osszeg','$projekt_ossz_ora','$time_stamp','$mai_datum')";
        $res = kerdes($projekt_akt_insert);
        if(!$res)
        {
            echo json_encode([
                'status' => 'error',
                'message' => 'Feltöltési hiba!',
                'error' => true
            ]);
            exit();
        }
    }
}
else{
    echo json_encode([
        'status' => 'error',
        'message' => 'Nincs munkalap azonosító megadva',
        'error' => true
    ]);
}


?>