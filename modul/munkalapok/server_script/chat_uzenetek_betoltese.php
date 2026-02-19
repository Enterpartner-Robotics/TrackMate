<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');
if($_SERVER['REQUEST_METHOD'] == 'POST'){

    $felh_id = $_SESSION['felh_id'];

    if(!isset($felh_id)){
        echo json_encode(['error' => 'Nincs bejelentkezve']);
        exit;
    }

    if(isset($_POST['munkalap_id'])){
        $munkalap_id = $_POST['munkalap_id'];
    }else{
        $munkalap_id = '';
    }

    if(isset($_POST['tipus_id'])){
        $tipus_id = $_POST['tipus_id'];
    }else{
        $tipus_id = 999;
    }

    if($tipus_id == 999){
        $tipus_feltetel = "";
    }else{
        $tipus_feltetel = " AND tmb.tipus_id = '$tipus_id'";
    }

    $chat_uzenetek_str = "SELECT 
        tmb.bejegyzes_id, tmb.munkalap_id, tmb.megjegyzes, tmb.datum, tmb.felh_id, sf.felh_nev, sf.profil_kep_link, sf.teljes_nev, tmb.pin, tmb.tipus_id
    FROM 
        TM_munkalap_bejegyzes tmb
        INNER JOIN SYS_felh sf ON sf.felh_id = tmb.felh_id
    WHERE 
        tmb.munkalap_id = '$munkalap_id' AND tmb.aktiv = 1 $tipus_feltetel ORDER BY tmb.bejegyzes_id DESC";
    $chat_uzenetek_qry = kerdes($chat_uzenetek_str);
    $chat_uzenetek_tomb = [];
    while($chat_uzenetek_sor = mysqli_fetch_assoc($chat_uzenetek_qry)){
        $file_str = "SELECT * FROM TM_munkalap_bejegyzes_file WHERE bejegyzes_id = ".$chat_uzenetek_sor['bejegyzes_id']."";
        $file_qry = kerdes($file_str);
        $file_tomb = [];
        while($file_sor = mysqli_fetch_assoc($file_qry)){
            $file_tomb[] = $file_sor;
        }
        $chat_uzenetek_sor['fajlok'] = $file_tomb;
        if($chat_uzenetek_sor['felh_id'] == $felh_id){
            $chat_uzenetek_sor['sajat_uzenet'] = true;
        }else{
            $chat_uzenetek_sor['sajat_uzenet'] = false;
        }
        $chat_uzenetek_tomb[] = $chat_uzenetek_sor;
    }
    $chat_uzenetek_tomb = array_reverse($chat_uzenetek_tomb);

    if($chat_uzenetek_tomb){
        echo json_encode($chat_uzenetek_tomb);
    }else{
        echo json_encode(['error' => 'Nincs adat']);
    }

}

?>