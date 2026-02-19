<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if($_SERVER['REQUEST_METHOD'] == 'POST'){
    if(isset($_POST['munkalap_id']) && $_POST['munkalap_id'] != ''){
        $munkalap_id = $_POST['munkalap_id'];
    }else{
        echo json_encode(['error' => 'Munkalap ID nincs megadva']);
        exit;
    }
    $felh_id = $_SESSION['felh_id'];
    $pinelt_uzenetek_str = "SELECT
                                tmb.bejegyzes_id, tmb.megjegyzes, sf.profil_kep_link,
                                sf.teljes_nev, tmb.datum, tmb.felh_id, tmb.tipus_id
                            FROM
                                TM_munkalap_bejegyzes tmb
                                INNER JOIN SYS_felh sf ON tmb.felh_id = sf.felh_id
                            WHERE
                                tmb.munkalap_id = ".$munkalap_id." AND tmb.pin = 1
                            ORDER BY tmb.bejegyzes_id ASC";
    $pinelt_uzenetek_qry = kerdes($pinelt_uzenetek_str);
    $pinelt_uzenetek_tomb = [];
    while($pinelt_uzenetek_sor = mysqli_fetch_assoc($pinelt_uzenetek_qry)){
        $file_str = "SELECT * FROM TM_munkalap_bejegyzes_file WHERE bejegyzes_id = ".$pinelt_uzenetek_sor['bejegyzes_id']."";
        $file_qry = kerdes($file_str);
        $file_tomb = [];
        while($file_sor = mysqli_fetch_assoc($file_qry)){
            $file_tomb[] = $file_sor;
        }
        $pinelt_uzenetek_sor['fajlok'] = $file_tomb;
        
        if($pinelt_uzenetek_sor['felh_id'] == $felh_id){
            $pinelt_uzenetek_sor['sajat_uzenet'] = true;
        }else{
            $pinelt_uzenetek_sor['sajat_uzenet'] = false;
        }
        $pinelt_uzenetek_tomb[] = $pinelt_uzenetek_sor;
    }
    echo json_encode($pinelt_uzenetek_tomb);
}
?>