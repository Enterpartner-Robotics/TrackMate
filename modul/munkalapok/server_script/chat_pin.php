<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');
if($_SERVER['REQUEST_METHOD'] == 'POST'){
    if(isset($_POST['bejegyzes_id']) && isset($_POST['munkalap_id'])){
        $bejegyzes_id = $_POST['bejegyzes_id'];
        $munkalap_id = $_POST['munkalap_id'];
        $pin_allapot_str = kerdes("SELECT `pin` FROM `TM_munkalap_bejegyzes` WHERE `bejegyzes_id` = ".$bejegyzes_id.";");
        $pin_allapot_eredmeny = mysqli_fetch_assoc($pin_allapot_str);
        $pin_allapot = $pin_allapot_eredmeny['pin'];
        if($pin_allapot == 0){
            $pin_str = "UPDATE `TM_munkalap_bejegyzes` SET `pin` = 1 WHERE `bejegyzes_id` = ".$bejegyzes_id.";";
            kerdes($pin_str);
            echo json_encode(['status' => 'success', 'message' => 'Bejegyzés sikeresen pinelve']);
        }
        else{
            $pin_str = "UPDATE `TM_munkalap_bejegyzes` SET `pin` = 0 WHERE `bejegyzes_id` = ".$bejegyzes_id.";";
            kerdes($pin_str);
            echo json_encode(['status' => 'success', 'message' => 'Bejegyzés sikeresen eltávolítva a pinlistáról']);
        }
        $updateData = array('update' => 'munkalap_chat', 'munkalap_id' => $munkalap_id);
        
        $ch = curl_init(NODE_SERVER_URL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        $nodeResponse = curl_exec($ch);
        curl_close($ch);
    }
    else{
            echo json_encode(['status' => 'error', 'message' => 'Nincs bejegyzés ID vagy munkalap ID']);
        }
}
else{
    echo json_encode(['status' => 'error', 'message' => 'Nincs POST kérés']);
}
