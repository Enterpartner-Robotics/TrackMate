<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if($_SERVER['REQUEST_METHOD'] == 'POST'){
    if(isset($_POST['tipus']) && $_POST['tipus'] == "tipus_nev_megjelenites"){
        $altipusok_str = "SELECT tipus_nev_megjelenites, tipus_id FROM `TM_munkalap_bejegyzes_tipus` WHERE megjelen = 1";
    }else{
        $altipusok_str = "SELECT tipus_nev_megjelenites, tipus_id FROM `TM_munkalap_bejegyzes_tipus`";
    }
    $altipusok_result = kerdes($altipusok_str);
    while($altipusok_row = mysqli_fetch_assoc($altipusok_result)){
        $altipusok[] = array('tipus_nev_megjelenites' => $altipusok_row['tipus_nev_megjelenites'], 'tipus_id' => $altipusok_row['tipus_id']);
    }
    echo json_encode(['status' => 'success', 'altipusok' => $altipusok]);
}

?>