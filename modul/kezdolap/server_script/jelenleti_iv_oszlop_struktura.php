<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if($_SERVER['REQUEST_METHOD'] == 'POST'){
    $felh_id=$_SESSION['felh_id'];
    if(!isset($felh_id)){
        echo json_encode(['status' => 'error','message' => 'Nincs bejelentkezve']);
        exit;
    }
    $datum = $_POST['datum'];
    if(!isset($datum)){
        echo json_encode(['status' => 'error','message' => 'Nincs dátum megadva']);
        exit;
    }
    $datum = str_replace('.', '-', $datum);
    $sql = "SELECT
                felh_id, teljes_nev 
            FROM 
                SYS_felh sf
                INNER JOIN SYS_osztaly so ON sf.osztaly_id = so.osztaly_id
            WHERE 
                (jogosultsag_id = 1 OR jogosultsag_id = 2) 
                AND sf.aktiv = 1 
                AND sf.felh_id != 7
            ORDER BY so.osztaly_id ASC, sf.teljes_nev ASC";
    $result = kerdes($sql);
    if($result){
        $data = [];
        while($row = mysqli_fetch_assoc($result)){
            $data[] = $row;
        }
        echo json_encode(['status' => 'success','message' => $data]);
    }else{
        echo json_encode(['status' => 'error','message' => 'Hiba történt a lekérdezés közben']);
    }
}



?>