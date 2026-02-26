<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');


if(isset($_POST['projekt_id']) || isset($_GET['projekt_id'])){
    $projekt_id = isset($_POST['projekt_id']) ? $_POST['projekt_id'] : $_GET['projekt_id'];
}else{
    $projekt_id = '';
}


//
$projekt_munkalap_diagram_query="SELECT MAX(tma.ossz_ora) AS ossz_ora, tm.munkaido, tm.megnevezes AS munkalap_nev FROM TM_munkalap_aktivitas tma  JOIN TM_munkalap tm ON tma.munkalap_id = tm.munkalap_id WHERE tm.projekt_id = $projekt_id  AND tm.aktiv = 1  GROUP BY tm.munkalap_id";
$projekt_munkalap_diagram_eredmeny=kerdes($projekt_munkalap_diagram_query);
$projekt_munkalap_diagram_adatok = [];
if ($projekt_munkalap_diagram_eredmeny->num_rows > 0) {
    while ($row = $projekt_munkalap_diagram_eredmeny->fetch_assoc()) {
        $projekt_munkalap_diagram_adatok[] = $row;
    }
}





echo json_encode([
    'data' => $projekt_munkalap_diagram_adatok,
    'status' => 'success'
    
]);










?>