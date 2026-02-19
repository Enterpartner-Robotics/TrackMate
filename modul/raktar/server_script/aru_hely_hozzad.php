<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if(!isset($_SESSION['felh_id'])){
        echo json_encode([
            'status' => 'error',
            'message' => 'Nincs bejelentkezve felhasználó!'
        ]);
        exit;
    }
    $raktar_id = $_POST['raktar_id'] ?? null;
    if(!$raktar_id){
        echo json_encode([
            'status' => 'error',
            'message' => 'Nincs raktár azonosító!'
        ]);
        exit;
    }
    $tarolas_helye = $_POST['tarolas_helye'] ?? null;
    $polc_fiok = $_POST['polc_fiok'] ?? null;

    $qry = "SELECT * FROM TM_raktar_aru_helye WHERE raktar_id = $raktar_id AND hely = '$tarolas_helye' AND pozicio = '$polc_fiok'";
    $res = kerdes($qry);
    $row = mysqli_fetch_array($res);
    if(mysqli_num_rows($res) > 0 && $row['aktiv'] == 0){
        $qry = "UPDATE TM_raktar_aru_helye SET aktiv = 1 WHERE hely_id = ".$row['hely_id']."";
        $res = kerdes($qry);
        echo json_encode([
            'status' => 'success',
            'message' => 'Hely hozzáadva'
        ]);
        exit;
    }
    if(mysqli_num_rows($res) > 0 && $row['aktiv'] == 1){
        echo json_encode([
            'status' => 'error',
            'message' => 'Hely már létezik'
        ]);
        exit;
    }
    $qry = "INSERT INTO TM_raktar_aru_helye (hely_id, raktar_id, hely, pozicio, aktiv) VALUES (NULL, '$raktar_id', '$tarolas_helye', '$polc_fiok', 1)";
    $res = kerdes($qry);
    if($res){
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
            'status' => 'success',
            'message' => 'Hely hozzáadva'
        ]);
    }
    else{
        echo json_encode([
            'status' => 'error',
            'message' => 'Nem sikerült hozzáadni a helyet'
        ]);
    }
}
    

?>