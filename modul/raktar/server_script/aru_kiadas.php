<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", 1);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $felh_id = isset($_SESSION['felh_id']) ? $_SESSION['felh_id'] : null;
    if (!$felh_id) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Nincs bejelentkezve felhasználó!'
        ]);
        exit;
    }

    if(isset($_POST['aru_id']) && $_POST['aru_id'] != ""){
        $aru_id = $_POST['aru_id'];
    }
    else{
        echo json_encode([
            'status'  => 'error',
            'message' => 'Nincs áru ID kérlek használd az autocomplete-t'
        ]);
        exit;
    }
    if(isset($_POST['aru_kiadas_mennyiseg']) && $_POST['aru_kiadas_mennyiseg'] != ""){
        $aru_kiadas_mennyiseg = $_POST['aru_kiadas_mennyiseg'];
        $aru_kiadas_mennyiseg = str_replace(' ', '', $aru_kiadas_mennyiseg);
    }
    else{
        $aru_kiadas_mennyiseg = 0;
    }
    $aru_kiadas = $_POST['aru_kiadas'] ?? '';
    $munkalap_id = isset($_POST['munkalap_id']) && $_POST['munkalap_id'] != "" ? $_POST['munkalap_id'] : 'NULL';
    $megjegyzes_kiadas = isset($_POST['megjegyzes_kiadas']) && $_POST['megjegyzes_kiadas'] != "" ? $_POST['megjegyzes_kiadas'] : '';
    $felvetel_datum=time();
    $datum=date('Y-m-d');

  

    $raktar_lekerdezes_query="SELECT raktar_id, darab  FROM TM_raktar WHERE aru_id='".$aru_id."' ";
    $raktar_lekerdezes_eredmeny= kerdes($raktar_lekerdezes_query);
    $raktar_adatok = mysqli_fetch_assoc($raktar_lekerdezes_eredmeny);
    $aktualis_darab = $raktar_adatok['darab'];
        
    
        if ($aktualis_darab >= $aru_kiadas_mennyiseg) {
            $darab_frissites = $aktualis_darab - $aru_kiadas_mennyiseg;
        } else {
            echo json_encode([
                'status'  => 'error',
                'message' => 'Nincs elegendő készlet.'
            ]);
            exit;
        }
  
   

    $raktar_frissites_query = "UPDATE TM_raktar SET darab = '".$darab_frissites."' WHERE aru_id = '".$aru_id."' ";
    kerdes($raktar_frissites_query);


    $aru_tipus_query="SELECT arutipus.aru_tipus_id FROM TORZS_aru_tipus arutipus JOIN TORZS_aru torzsaru ON torzsaru.aru_tipus_id=arutipus.aru_tipus_id WHERE torzsaru.aru_id='".$aru_id."' AND torzsaru.aktiv = 1"; 
    $aru_tipus_eredmeny= kerdes($aru_tipus_query);
    if(mysqli_num_rows($aru_tipus_eredmeny)> 0){
        $aru_tipus_id = mysqli_fetch_assoc($aru_tipus_eredmeny);
    }else{
        $aru_tipus_id['aru_tipus_id'] = 'NULL';
    }

    $aru_kiadas_query = "INSERT INTO TM_raktar_bejegyzes (`raktar_bejegyzes_id`,`felh_id`,`aru_id`,`aru_tipus_id`,`raktar_id`,`bejegyzes_tipus_id`,`darab`,`megjegyzes`,`felvetel_datum`,`datum`,`munkalap_id`) VALUES (NULL,'".$felh_id."','".$aru_id."',".$aru_tipus_id['aru_tipus_id'].",'".$raktar_adatok['raktar_id']."',".$aru_kiadas.",'".$aru_kiadas_mennyiseg."','".$megjegyzes_kiadas."','".$felvetel_datum."','".$datum."',".$munkalap_id.") ";

    kerdes($aru_kiadas_query);

    if($aru_kiadas == '3'){
        $datum_ora = date('Y-m-d H:i:s');
        $aru_megnevezes_query = "SELECT aru_megnevezes FROM TORZS_aru WHERE aru_id = '".$aru_id."'";
        $aru_megnevezes_eredmeny = kerdes($aru_megnevezes_query);
        $aru_megnevezes = mysqli_fetch_assoc($aru_megnevezes_eredmeny);
        $chat_uzenet_insert_str = "<b>".$_SESSION['teljes_nev']."</b> kiadta a következő árukat a munkalapra:<br><br>";
        $chat_uzenet_insert_str .= "<b>".$aru_megnevezes['aru_megnevezes']."</b> ".$aru_kiadas_mennyiseg." db<br>";
        $chat_uzenet_insert_str = "INSERT INTO `TM_munkalap_bejegyzes`(`bejegyzes_id`, `munkalap_id`, `felh_id`, `megjegyzes`, `datum`, `tipus_id`, `pin`, `aktiv`) VALUES (NULL, ".$munkalap_id.", 0, '".$chat_uzenet_insert_str."', '".$datum_ora."', 1, 0, 1)";
        kerdes($chat_uzenet_insert_str);

        
        $updateData = array('update' => 'munkalap_chat', 'munkalap_id' => $munkalap_id);
        
        $ch = curl_init(NODE_SERVER_URL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        $nodeResponse = curl_exec($ch);
        curl_close($ch);
    }
    
    $kiadas_utolso_id = "SELECT raktar_bejegyzes_id FROM TM_raktar_bejegyzes ORDER BY raktar_bejegyzes_id DESC LIMIT 1";
    $kiadas_utolso_id_eredmeny = kerdes($kiadas_utolso_id);
    $kiadas_utolso_id_adat = mysqli_fetch_assoc($kiadas_utolso_id_eredmeny);
    $kiadas_utolso_id = $kiadas_utolso_id_adat['raktar_bejegyzes_id'];

    if (isset($_FILES['kiadas_file']) && $_FILES['kiadas_file']['error'] === UPLOAD_ERR_OK) {
        $file_tmp = $_FILES['kiadas_file']['tmp_name'];
        $file_info = getimagesize($file_tmp);
        if ($file_info === false) {
            echo json_encode(["status" => "error", "message" => "Csak képfájlok tölthetők fel!"]);
            exit;
        }
        
        $target_dir = "/var/www/html/userfiles/raktar_kiadas_kep/" . $kiadas_utolso_id . "/";
        if (!file_exists($target_dir)) {
            mkdir($target_dir, 0777, true);
        }
        
        $file_name = uniqid() . "_" . basename($_FILES['kiadas_file']['name']);
        $target_file = $target_dir . $file_name;
        
        
        if (!move_uploaded_file($file_tmp, $target_file)) {
            echo json_encode(["status" => "error", "message" => "Nem sikerült a fájl mentése."]);
            exit;
        }
        
        $file_link = "/userfiles/raktar_kiadas_kep/" . $kiadas_utolso_id . "/" . $file_name;
        $update_query = "UPDATE `TM_raktar_bejegyzes` SET `file_link` = '".$file_link."' WHERE `raktar_bejegyzes_id` = ".$kiadas_utolso_id."";
        $update_stmt = kerdes($update_query);
    }

    $updateData = array('update' => 'raktar_tabla');
     // A Node.js szerver URL-je
    $ch = curl_init(NODE_SERVER_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    $nodeResponse = curl_exec($ch);
    curl_close($ch);

    
    echo json_encode([
        'status'  => 'success',
        'message' => 'A Kiadás sikeres!'
    ]);
} else {
    
    echo json_encode([
        'status'  => 'error',
        'message' => 'A kiadás nem sikerült.'
    ]);
}
?>