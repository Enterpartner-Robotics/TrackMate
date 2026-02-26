<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

$munkalap_id = $_POST['munkalap_id'];

$datum = date('Y-m-d H:i:s');

$projekt_id_lekerdezes = "SELECT projekt_id FROM TM_munkalap WHERE munkalap_id = $munkalap_id";
$projekt_id_eredmeny = kerdes($projekt_id_lekerdezes);
$projekt_id = mysqli_fetch_assoc($projekt_id_eredmeny);
$projekt_id = $projekt_id['projekt_id'];

$projekt_ellenorzes_query = "SELECT COUNT(munkalap_id) AS munkalap_db FROM TM_munkalap WHERE projekt_id = $projekt_id  AND (allapot_id = 1 OR allapot_id = 2)";
$projekt_ellenorzes_eredmeny = kerdes($projekt_ellenorzes_query);
$projekt_ellenorzes_adat = mysqli_fetch_assoc($projekt_ellenorzes_eredmeny);
$projekt_szam = $projekt_ellenorzes_adat['munkalap_db'];
if($projekt_ellenorzes_eredmeny){
    if($projekt_szam == 0){
        $projekt_ujrainditas_query = "UPDATE TM_projekt SET allapot_id = 2 WHERE projekt_id = $projekt_id";
        $projekt_ujrainditas_eredmeny = kerdes($projekt_ujrainditas_query);

        if($projekt_ujrainditas_eredmeny){

            $projekt_nev_lekerdezes = "SELECT projekt_nev FROM TM_projekt WHERE projekt_id = $projekt_id";
            $projekt_nev_eredmeny = kerdes($projekt_nev_lekerdezes);
            $projekt_nev = mysqli_fetch_assoc($projekt_nev_eredmeny);

            $bejegyzes_string = "<b>".$_SESSION['teljes_nev']."</b> újraindította a(z) <b>".$projekt_nev['projekt_nev'] . "</b> projektet.";

            $munkalap_foreach_query = "SELECT munkalap_id FROM TM_munkalap WHERE projekt_id = $projekt_id";
            $munkalap_foreach_eredmeny = kerdes($munkalap_foreach_query);
        
            while ($munkalap = mysqli_fetch_assoc($munkalap_foreach_eredmeny)) {
                $bejegyzes_query = "INSERT INTO TM_munkalap_bejegyzes (bejegyzes_id, munkalap_id, felh_id, megjegyzes, datum, tipus_id, pin, aktiv) VALUES (NULL, ".$munkalap['munkalap_id'].", 0, '$bejegyzes_string', '$datum', 0, 0, 1)";
                $bejegyzes_eredmeny = kerdes($bejegyzes_query);
            }
        }
    }

    $munkalap_ujrainditas_str = "UPDATE TM_munkalap SET allapot_id = 2 WHERE munkalap_id = $munkalap_id";
    $munkalap_ujrainditas_qry = kerdes($munkalap_ujrainditas_str);
}


if($munkalap_ujrainditas_qry){


    $munkalap_nev_lekerdezes = "SELECT megnevezes FROM TM_munkalap WHERE munkalap_id = $munkalap_id";
    $munkalap_nev_eredmeny = kerdes($munkalap_nev_lekerdezes);
    $munkalap_nev = mysqli_fetch_assoc($munkalap_nev_eredmeny);
    $bejegyzes_string = "<b>".$_SESSION['teljes_nev']."</b> újraindította a(z) <b>".$munkalap_nev['megnevezes'] . "</b> munkalapot.";
    $munkalap_ujrainditas_bejegyzes = "INSERT INTO TM_munkalap_bejegyzes (bejegyzes_id,munkalap_id, felh_id, megjegyzes,datum,tipus_id,pin,aktiv) VALUES (NULL,$munkalap_id, 0,  '$bejegyzes_string', '$datum',0,0,1)";
    $munkalap_ujrainditas_bejegyzes_eredmeny = kerdes($munkalap_ujrainditas_bejegyzes);


   


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


    echo json_encode([
        'status' => 'success',
        'message' => 'A munkalap sikeresen újraindítva lett'
    ]);
}




?>