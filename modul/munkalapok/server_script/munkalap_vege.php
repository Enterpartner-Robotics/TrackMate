<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

$munkalap_id = $_POST['munkalap_id'];

$munkalap_ellenorzes_str = "SELECT munkalap_allapot FROM TM_munkalap_aktivitas WHERE munkalap_id = $munkalap_id ORDER BY munkalap_aktivitas_id";
$munkalap_ellenorzes_qry = kerdes($munkalap_ellenorzes_str);
$munkalap_ellenorzes_adat = mysqli_fetch_assoc($munkalap_ellenorzes_qry);

$datum=date('Y-m-d H:i:s');

$found = false;

while($munkalap_ellenorzes_adat){

    if ($munkalap_ellenorzes_adat['munkalap_allapot'] == 1) {
        $found = true;
        break;
    }

    $munkalap_ellenorzes_adat = mysqli_fetch_assoc($munkalap_ellenorzes_qry);

}


if($found == false){ 

    $munkalap_vege_lekerdezes = "UPDATE TM_munkalap SET allapot_id = 3 WHERE munkalap_id = $munkalap_id";
    $munkalap_vege_eredmeny = kerdes($munkalap_vege_lekerdezes);

    if($munkalap_vege_eredmeny){

        $munkalap_nev_lekerdezes = "SELECT megnevezes FROM TM_munkalap WHERE munkalap_id = $munkalap_id";
        $munkalap_nev_eredmeny = kerdes($munkalap_nev_lekerdezes);
        $munkalap_nev = mysqli_fetch_assoc($munkalap_nev_eredmeny);

        $bejegyzes_string = "<b>".$_SESSION['teljes_nev']."</b> lezárta a(z) <b>".$munkalap_nev['megnevezes'] . "</b> munkalapot.";
        $munkalap_vege_bejegyzes = "INSERT INTO TM_munkalap_bejegyzes (bejegyzes_id,munkalap_id, felh_id, megjegyzes,datum,tipus_id,pin,aktiv) VALUES (NULL,$munkalap_id, 0,  '$bejegyzes_string', '$datum',0,0,1)";
        $munkalap_vege_bejegyzes_eredmeny = kerdes($munkalap_vege_bejegyzes);



        $projekt_id_query = "SELECT projekt_id FROM TM_munkalap WHERE munkalap_id = $munkalap_id";
        $projekt_id_eredmeny = kerdes($projekt_id_query);
        $projekt_id_adat = mysqli_fetch_assoc($projekt_id_eredmeny);
        $projekt_id = $projekt_id_adat['projekt_id'];  // Itt használjuk a konkrét projekt_id értéket

        $projekt_ellenorzes_query = "SELECT COUNT(tmm.munkalap_id) AS munkalap_db FROM TM_munkalap tmm WHERE tmm.projekt_id = $projekt_id  AND (tmm.allapot_id = 1 OR tmm.allapot_id = 2)";
        $projekt_ellenorzes_eredmeny = kerdes($projekt_ellenorzes_query);
        $projekt_ellenorzes_adat = mysqli_fetch_assoc($projekt_ellenorzes_eredmeny);

        if($projekt_ellenorzes_adat['munkalap_db'] == 0){
            $projekt_lezaras_query="UPDATE TM_projekt SET allapot_id = 3 WHERE projekt_id = $projekt_id";
            $projekt_lezaras_eredmeny = kerdes($projekt_lezaras_query);

            

            if($projekt_lezaras_eredmeny){


                $projekt_nev_query = "SELECT projekt_nev FROM TM_projekt WHERE projekt_id = $projekt_id";    
                $projekt_nev_eredmeny = kerdes($projekt_nev_query);
                $projekt_nev = mysqli_fetch_assoc($projekt_nev_eredmeny);

                $bejegyzes_string = "<b>".$_SESSION['teljes_nev']."</b> befejezte a(z) <b>".$projekt_nev['projekt_nev'] . "</b> projektet.";

                $munkalap_foreach_query = "SELECT munkalap_id FROM TM_munkalap WHERE projekt_id = $projekt_id AND allapot_id = 3";
                $munkalap_foreach_eredmeny = kerdes($munkalap_foreach_query);
                
                while ($munkalap = mysqli_fetch_assoc($munkalap_foreach_eredmeny)) {
                    $bejegyzes_query = "INSERT INTO TM_munkalap_bejegyzes (bejegyzes_id, munkalap_id, felh_id, megjegyzes, datum, tipus_id, pin, aktiv) 
                                    VALUES (NULL, ".$munkalap['munkalap_id'].", 0, '$bejegyzes_string', '$datum', 0, 0, 1)";
                    $bejegyzes_eredmeny = kerdes($bejegyzes_query);
                }
            }
        }
           
        

        echo json_encode([
            'status' => 'success',
            'message' => 'A munkalap sikeresen lezárva lett'
        ]);



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
    
}else if($found == true){

    $munkalap_ellenorzes_str = "SELECT felh_id FROM TM_munkalap_aktivitas WHERE munkalap_id = $munkalap_id AND munkalap_allapot = 1";
    $munkalap_ellenorzes_qry = kerdes($munkalap_ellenorzes_str);
    
    $felhasznalok_tomb = [];
    while($munkalap_ellenorzes_adat = mysqli_fetch_assoc($munkalap_ellenorzes_qry)){
        $felhasznalok_tomb[] = $munkalap_ellenorzes_adat['felh_id'];
    }

    $kidolgozik_nev_tomb = [];
    foreach($felhasznalok_tomb as $felhasznalo){
        $kidolgozik_ellenorzes_str = "SELECT teljes_nev FROM SYS_felh WHERE felh_id = $felhasznalo";
        $kidolgozik_ellenorzes_qry = kerdes($kidolgozik_ellenorzes_str);
        if($kidolgozik_ellenorzes_qry){ 
            while($kidolgozik_ellenorzes_adat = mysqli_fetch_assoc($kidolgozik_ellenorzes_qry)){ 
                $kidolgozik_nev_tomb[] = $kidolgozik_ellenorzes_adat['teljes_nev'];
            }
        }
    }
    
    
    
    echo json_encode([
        'status' => 'error',
        'message' => 'A munkalap nem lezárt',
        'teljes_nev' => implode(', ', $kidolgozik_nev_tomb)
    ]);
}

  


?>