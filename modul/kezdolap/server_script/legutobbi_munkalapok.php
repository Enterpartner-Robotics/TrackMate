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
    $sql = "SELECT
        tma.munkalap_id, tm.megnevezes,
        tp.projekt_nev, tm.munkaido,
        tp.hatarido,
        (SELECT SUM(tmab.munkaido_felh) FROM TM_munkalap_aktivitas tmab WHERE tmab.munkalap_id = tma.munkalap_id) as felh_ossz_ora
    FROM 
        TM_munkalap_aktivitas tma
        INNER JOIN TM_munkalap tm ON tma.munkalap_id = tm.munkalap_id
        INNER JOIN TM_projekt tp ON tm.projekt_id = tp.projekt_id
    WHERE 
        tma.felh_id = $felh_id
        AND tm.allapot_id = 2
    GROUP BY 
        munkalap_id
    ORDER BY 
        munkalap_aktivitas_id DESC 
    LIMIT 3";

    $result = kerdes($sql);
    while($row = mysqli_fetch_assoc($result)){
        $data[] = $row;
    }
    if($result){
        echo json_encode(['status' => 'success','data' => $data]);
    }else{
        echo json_encode(['status' => 'error','message' => 'Hiba a lekérdezésben']);
    }

}




?>