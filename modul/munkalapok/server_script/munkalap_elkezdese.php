<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if(isset($_POST['munkalap_id'])){
    $munkalap_id = $_POST['munkalap_id'];
}else{
    echo json_encode([
        'status' => 'error',
        'message' => 'Nincs munkalap azonosító megadva',
        'error' => true
    ]);
    exit;
}

$elo_munkalap_str = "SELECT * FROM `TM_munkalap_aktivitas` WHERE `felh_id` = ".$_SESSION['felh_id']." AND `munkalap_allapot` = 1";
$elo_munkalap_eredmeny = kerdes($elo_munkalap_str);
if(mysqli_num_rows($elo_munkalap_eredmeny) > 0){
    echo json_encode([
        'status' => 'error',
        'message' => 'Már van egy munkalapod amin aktívan dolgozol!<br>Kérlek fejezd be az előző munkalapodat és próbáld meg újra!',
        'error' => true
    ]);
    exit;
}


if($munkalap_id != ''){
    $datum_kezdese = date('Y-m-d H:i:s');
    $felh_id = $_SESSION['felh_id'];
    $teljes_nev = $_SESSION['teljes_nev'];
    $insert_munkalap_aktivitas = "INSERT INTO `TM_munkalap_aktivitas`(`munkalap_aktivitas_id`, `felh_id`, `munkalap_id`, `kezdes_ido`, `zaras_ido`, `munkaido_felh`, `ossz_ora`, `munkalap_allapot`) VALUES (NULL,'$felh_id','$munkalap_id','$datum_kezdese',NULL,NULL,NULL,'1')";
    kerdes($insert_munkalap_aktivitas);

    $munkalap_allapot_query = "SELECT allapot_id,projekt_id FROM TM_munkalap WHERE munkalap_id = $munkalap_id";
    $munkalap_allapot_eredmeny = kerdes($munkalap_allapot_query);
    $munkalap_allapot = mysqli_fetch_assoc($munkalap_allapot_eredmeny);

    $projekt_allapot_query = "SELECT allapot_id FROM TM_projekt WHERE projekt_id = ".$munkalap_allapot['projekt_id'];
    $projekt_allapot_eredmeny = kerdes($projekt_allapot_query);
    $projekt_allapot = mysqli_fetch_assoc($projekt_allapot_eredmeny);
    
    if($projekt_allapot['allapot_id'] != 2){
        $projekt_allapot_update = "UPDATE `TM_projekt` SET `allapot_id` = '2' WHERE `projekt_id` = ".$munkalap_allapot['projekt_id'];
        kerdes($projekt_allapot_update);
    }

    if($munkalap_allapot['allapot_id'] != 2){

        $munkalap_allapot_update = "UPDATE `TM_munkalap` SET `allapot_id` = '2' WHERE `munkalap_id` = $munkalap_id";
        kerdes($munkalap_allapot_update);

        $munkalap_nev_query = "SELECT megnevezes FROM TM_munkalap WHERE munkalap_id = $munkalap_id";
        $munkalap_nev_eredmeny = kerdes($munkalap_nev_query);
        $munkalap_nev = mysqli_fetch_assoc($munkalap_nev_eredmeny);

        $munkalap_bejegyzes_string = "<b>".$teljes_nev."</b> elindította a(z) <b>".$munkalap_nev['megnevezes']."</b> munkalapot.";
        $munkalap_bejegyzes_insert = "INSERT INTO `TM_munkalap_bejegyzes`(`bejegyzes_id`, `munkalap_id`, `felh_id`, `megjegyzes`, `datum`, `tipus_id`, `pin`, `aktiv`) VALUES (NULL, $munkalap_id, 0, '$munkalap_bejegyzes_string', '$datum_kezdese', 0, 0, 1)";
        kerdes($munkalap_bejegyzes_insert);

        $updateData = array('update' => 'munkalap_jobboldal', 'munkalap_id' => $munkalap_id);
         // A Node.js szerver URL-je
        $ch = curl_init(NODE_SERVER_URL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        $nodeResponse = curl_exec($ch);
        curl_close($ch);
    
        $updateData = array('update' => 'munkalap_baloldal');
         // A Node.js szerver URL-je
        $ch = curl_init(NODE_SERVER_URL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        $nodeResponse = curl_exec($ch);
        curl_close($ch);
    }
   

}
else{
    echo json_encode([
        'status' => 'error',
        'message' => 'Nincs munkalap azonosító megadva',
        'error' => true
    ]);
}

$munkalap_elkezdese_lekerdezes = "SELECT megnevezes, munkalap_id FROM TM_munkalap WHERE munkalap_id = $munkalap_id";
$munkalap_elkezdese_eredmeny = kerdes($munkalap_elkezdese_lekerdezes);
$munkalap_elkezdese_adatok = [];

while($sor = mysqli_fetch_assoc($munkalap_elkezdese_eredmeny)){
    $munkalap_elkezdese_adatok[] = $sor;
}

if($munkalap_elkezdese_eredmeny){   

    echo json_encode([
        'megnevezes' => $munkalap_elkezdese_adatok[0]['megnevezes'],
        'munkalap_id' => $munkalap_elkezdese_adatok[0]['munkalap_id'],
        'datum_kezdese' => $datum_kezdese,
        'status' => 'success',
        'error' => false
    ]);
}else{
    echo json_encode([
        'status' => 'error',
        'error' => true
    ]);
}



    

?>