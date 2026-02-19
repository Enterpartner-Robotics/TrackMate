<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');
if($_SERVER['REQUEST_METHOD'] == 'POST'){
    $uzenet_timestamp = time();
    if(isset($_POST['bejegyzes_id']) && isset($_POST['munkalap_id'])){
        $bejegyzes_id = $_POST['bejegyzes_id'];
        $munkalap_id = $_POST['munkalap_id'];
    }
    else{
        echo json_encode(['status' => 'error', 'message' => 'Nincs bejegyzés ID vagy munkalap ID']);
        exit;
    }
    if($_FILES['chat_szerkesztes_fajl_feltoltes']['name'] != '' && $_FILES['chat_szerkesztes_fajl_feltoltes']['error'] == UPLOAD_ERR_OK){
        $file_name = $_FILES['chat_szerkesztes_fajl_feltoltes']['name'];
        $file_path = $_FILES['chat_szerkesztes_fajl_feltoltes']['tmp_name'];
        $destination_dir = '/var/www/html/userfiles/munkalap_bejegyzes/' . $bejegyzes_id;
        if (!is_dir($destination_dir)) {
            mkdir($destination_dir, 0777, true);
        }
        $filename = basename($file_name);
        $destination = $destination_dir . '/' . $filename;
        if (move_uploaded_file($file_path, $destination)) {
            $bejegyzes_file_path = '/userfiles/munkalap_bejegyzes/' . $bejegyzes_id . '/' . $filename;
        }
        $bejegyzes_file_insert_str = "INSERT INTO 
        `TM_munkalap_bejegyzes_file`
        (`file_id`, `munkalap_id`, `bejegyzes_id`, `file_link`, `felvetel_datum`)
        VALUES 
        (NULL,".$munkalap_id.",".$bejegyzes_id.",'".$bejegyzes_file_path."',".$uzenet_timestamp.")";
        kerdes($bejegyzes_file_insert_str);
        $file_id_str = "SELECT `file_id` FROM `TM_munkalap_bejegyzes_file` ORDER BY `file_id` DESC LIMIT 1";
        $file_id_result = kerdes($file_id_str);
        $file_id_row = mysqli_fetch_assoc($file_id_result);
        $file_id = $file_id_row['file_id'];


        $updateData = array('update' => 'munkalap_chat', 'munkalap_id' => $munkalap_id);
         // A Node.js szerver URL-je
        $ch = curl_init(NODE_SERVER_URL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        $nodeResponse = curl_exec($ch);
        curl_close($ch);


        
        echo json_encode(['status' => 'success', 'message' => 'Fájl sikeresen feltöltve', 'file_id' => $file_id, 'bejegyzes_id' => $bejegyzes_id, 'munkalap_id' => $munkalap_id, 'file_name' => $file_name, 'file_link' => $bejegyzes_file_path]);
    }
    else{
        echo json_encode(['status' => 'error', 'message' => 'Nincs fájl kiválasztva']);
        exit;
    }
}



?>