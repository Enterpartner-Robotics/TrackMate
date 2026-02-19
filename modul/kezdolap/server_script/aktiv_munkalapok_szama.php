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
	tma.munkalap_id
    FROM
        TM_munkalap_aktivitas tma
        INNER JOIN TM_munkalap tm ON tma.munkalap_id = tm.munkalap_id
    WHERE
        tma.felh_id = $felh_id
        AND tm.allapot_id = 2
    GROUP BY tma.munkalap_id";
    $result = kerdes($sql);
    $aktiv_munkalapok_szama = mysqli_num_rows($result);
    echo json_encode(['status' => 'success','aktiv_munkalapok_szama' => $aktiv_munkalapok_szama]);
}
?>