<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if($_SERVER['REQUEST_METHOD'] == 'POST'){
    $munkalap_id = $_POST['munkalap_id'];
    if($munkalap_id == ''){
        echo json_encode(['error' => 'Munkalap ID nincs megadva']);
        exit;
    }
    if($_POST['chat_textarea'] == ''){
        echo json_encode(['error' => 'Üzenet nem lehet üres']);
        exit;
    }
    if($_POST['bejegyzes_tipus'] == ''){
        $bejegyzes_tipus = 0;
    }
    else{
        $bejegyzes_tipus = $_POST['bejegyzes_tipus'];
    }
    $uzenet = $_POST['chat_textarea'];
    $uzenet = escapeInput($uzenet);

    
    $uzenet_timestamp = time();
    $uzenet_datum = date('Y-m-d H:i:s');
    $bejegyzes_insert_str = "INSERT INTO 
    `TM_munkalap_bejegyzes`
    (`bejegyzes_id`, `munkalap_id`, `felh_id`, `megjegyzes`, `datum`, `tipus_id`, `pin`, `aktiv`)
    VALUES (NULL,".$munkalap_id.",".$_SESSION['felh_id'].",'".$uzenet."','".$uzenet_datum."',".$bejegyzes_tipus.",0,1)";
    kerdes($bejegyzes_insert_str);

    $utolso_id_str = kerdes("SELECT bejegyzes_id FROM TM_munkalap_bejegyzes ORDER BY bejegyzes_id DESC LIMIT 1");
    $utolso_id_eredmeny = mysqli_fetch_assoc($utolso_id_str);
    $utolso_id = $utolso_id_eredmeny['bejegyzes_id'];

    foreach($_FILES as $file){
        if($file['name'] != '' && $file['error'] == UPLOAD_ERR_OK){
            $destination_dir = '/var/www/html/userfiles/munkalap_bejegyzes/' . $utolso_id;
            if (!is_dir($destination_dir)) {
                mkdir($destination_dir, 0777, true);
            }
            $filename = basename($file['name']);
            $destination = $destination_dir . '/' . $filename;
            if (move_uploaded_file($file['tmp_name'], $destination)) {
                // Relatív útvonal, melyet az adatbázisban tárolunk
                $bejegyzes_file_path = '/userfiles/munkalap_bejegyzes/' . $utolso_id . '/' . $filename;
            }
            $bejegyzes_file_insert_str = "INSERT INTO 
            `TM_munkalap_bejegyzes_file`
            (`file_id`, `munkalap_id`, `bejegyzes_id`, `file_link`, `felvetel_datum`)
            VALUES 
            (NULL,".$munkalap_id.",".$utolso_id.",'".$bejegyzes_file_path."',".$uzenet_timestamp.")";
            kerdes($bejegyzes_file_insert_str);
        }
    }
    $updateData = array('update' => 'munkalap_chat', 'munkalap_id' => $munkalap_id);
     // A Node.js szerver URL-je
    $ch = curl_init(NODE_SERVER_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    $nodeResponse = curl_exec($ch);
    curl_close($ch);

    echo json_encode(["status" => "success", "message" => "Üzenet sikeresen elküldve."]);
}

?>