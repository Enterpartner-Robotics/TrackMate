<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if(isset($_POST['aru_tomb']) && count($_POST['aru_tomb']) > 0){
    $felh_id = $_SESSION['felh_id'];
    $munkalap_id = $_POST['munkalap_id'];
    $aru_tomb = $_POST['aru_tomb'];
    $timestamp = time();
    $datum = date('Y-m-d');
    $datum_ora = date('Y-m-d H:i:s');
    $aru_tipus_id = "NULL";
    $chat_uzenet_insert_str = "<b>".$_SESSION['teljes_nev']."</b> hozzáadta a következő árukat a munkalapra:<br><br>";
    foreach($aru_tomb as $aru){
        $aru_id = $aru['aru_id'];
        $darab = $aru['darab'];
        $darab_keszlet = $aru['darab_keszlet'];
        $raktar_id = $aru['raktar_id'];
        $uj_darab_keszlet = $darab_keszlet - $darab;


        
        $tm_raktar_update_str = "UPDATE TM_raktar SET darab= ".$uj_darab_keszlet." WHERE raktar_id = ".$raktar_id."";
        kerdes($tm_raktar_update_str);

        $tm_aru_update_str = "SELECT aru_tipus_id, aru_megnevezes FROM TORZS_aru WHERE aru_id = ".$aru_id."";
        $tm_aru_update_result = kerdes($tm_aru_update_str);
        if(mysqli_num_rows($tm_aru_update_result) > 0){
            $sor = mysqli_fetch_assoc($tm_aru_update_result);
            if($sor['aru_tipus_id'] == ""){
                $aru_tipus_id = "NULL";
            }
            else{
                $aru_tipus_id = $sor['aru_tipus_id'];
            }
            $aru_megnevezes = $sor['aru_megnevezes'];
        }
        

        $tm_raktar_bejegy_insert_str = "INSERT INTO `TM_raktar_bejegyzes`(`raktar_bejegyzes_id`, `felh_id`, `aru_id`, `aru_tipus_id`, `raktar_id`, `bejegyzes_tipus_id`,`munkalap_id`, `szamla_id`, `darab`, `beszerzesi_ar`, `megjegyzes`, `file_link`, `felvetel_datum`, `datum`) VALUES (NULL,".$felh_id.",".$aru_id.",".$aru_tipus_id.",".$raktar_id.", 3, ".$munkalap_id.", NULL, ".$darab.", NULL, NULL, NULL, ".$timestamp.", '".$datum."')";
        kerdes($tm_raktar_bejegy_insert_str); 
        $chat_uzenet_insert_str .= "<b>".$aru_megnevezes."</b> ".$darab." db<br>";
    }
    $chat_uzenet_insert_str = "INSERT INTO `TM_munkalap_bejegyzes`(`bejegyzes_id`, `munkalap_id`, `felh_id`, `megjegyzes`, `datum`, `tipus_id`, `pin`, `aktiv`) VALUES (NULL, ".$munkalap_id.", 0, '".$chat_uzenet_insert_str."', '".$datum_ora."', 1, 0, 1)";
    kerdes($chat_uzenet_insert_str);


    $updateData = array('update' => 'raktar_tabla');
     // A Node.js szerver URL-je
    $ch = curl_init(NODE_SERVER_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    $nodeResponse = curl_exec($ch);
    curl_close($ch);



    $updateData = array('update' => 'munkalap_chat', 'munkalap_id' => $munkalap_id);
    
    $ch = curl_init(NODE_SERVER_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    $nodeResponse = curl_exec($ch);
    curl_close($ch);



    echo json_encode([
        'status' => 'success',
        'message' => 'Áru hozzáadva a munkalapra',
        'error' => false
    ]);
}
else{
    echo json_encode([
        'status' => 'error',
        'message' => 'Nincs áru megadva',
        'error' => true
    ]);
}

?>