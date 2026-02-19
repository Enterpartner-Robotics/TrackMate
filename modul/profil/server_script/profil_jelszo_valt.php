<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['felh_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Nincs bejelentkezve.']);
        exit;
    }
    else{
        if(isset($_POST['regi_jelszo']) && isset($_POST['uj_jelszo'])){
            $regi_jelszo = $_POST['regi_jelszo'];
            $uj_jelszo = $_POST['uj_jelszo'];

            $query_str = "SELECT `jelszo` FROM `SYS_felh` WHERE `felh_id` = '".$_SESSION['felh_id']."'";
            $query = kerdes($query_str);
            $result = mysqli_fetch_assoc($query);
            if(!password_verify($regi_jelszo, $result['jelszo'])){
                echo json_encode(['status' => 'error', 'message' => 'A régi jelszó helytelen!']);
                exit;
            }
            $uj_titkositott_jelszo = password_hash($uj_jelszo, PASSWORD_DEFAULT);
            $update_query_str = "UPDATE `SYS_felh` SET `jelszo`= '".$uj_titkositott_jelszo."' WHERE `felh_id` = '".$_SESSION['felh_id']."'";
            $update_query = kerdes($update_query_str);
            if($update_query){
                echo json_encode(['status' => 'success', 'message' => 'Jelszó módosítva']);
            }
        }
        
    }

}

?>