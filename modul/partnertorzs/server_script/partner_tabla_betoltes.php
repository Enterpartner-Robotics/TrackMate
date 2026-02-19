<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');


$oszlopok= ['partner_id','cegnev','szekhely','telefonszam','cegadoszam','datum'];

$sort_field = isset($_GET['sort']) ? $_GET['sort'][0]['field'] : 'partner_id';
$sort_direction = isset($_GET['sort']) ? $_GET['sort'][0]['dir'] : 'desc';
$page = isset($_GET['page']) ? (int) $_GET['page'] : 1;  
$size = isset($_GET['size']) ? (int) $_GET['size'] : 10; 
$search = isset($_GET['search']) ? $_GET['search'] : '';  



$kereses_szures = "WHERE `aktiv` =1";
if ($search) {
    
    $kereses_feltetelek = [];

    foreach ($oszlopok as $oszlop) {
        $kereses_feltetelek[] = "`$oszlop` LIKE '%" .($search) . "%'";
    }

    $kereses_szures = "WHERE `aktiv` =1 AND (" . implode(' OR ', $kereses_feltetelek) . ")";
}


$partner_lekerdezes="SELECT * FROM `TORZS_partner` ".$kereses_szures." ORDER BY ". $sort_field ." ". $sort_direction ." LIMIT ". ($page - 1) * $size . ", ".$size;
$partner_eredmeny = kerdes($partner_lekerdezes);

if (!$partner_eredmeny) {
    die('SQL hiba: rossz a query');
}

$data = [];
if ($partner_eredmeny->num_rows > 0) {
    while ($row = $partner_eredmeny->fetch_assoc()) {
        $data[] = $row;
    }
}

$total_result = kerdes("SELECT COUNT(*) AS total FROM `TORZS_partner` WHERE `aktiv` =1");
$total_row = $total_result->fetch_assoc();
$total_records = $total_row['total'];
$lastPage = ceil($total_records / $size);

$response = [
    'current_page' => $page,
    'total_pages' => ceil($total_records / $size),
    'total_records' => $total_records,
    'last_page' => $lastPage, // Az utolsó oldal
    'data' => $data
];

echo json_encode($response);
?>