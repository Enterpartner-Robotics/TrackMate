<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

$oszlopok= ['TORZS_aru.aru_id','TORZS_aru.aru_megnevezes',' TORZS_aru_tipus.tipus_megnevezes'];

$sort_field = isset($_GET['sort']) ? $_GET['sort'][0]['field'] : 'aru_id';
$sort_direction = isset($_GET['sort']) ? $_GET['sort'][0]['dir'] : 'DESC';
$page = isset($_GET['page']) ? (int) $_GET['page'] : 1;  
$size = isset($_GET['size']) ? (int) $_GET['size'] : 10; 
$search = isset($_GET['search']) ? $_GET['search'] : '';  

$kereses_szures = "WHERE TORZS_aru.aktiv = 1";
if ($search) {
    
    $kereses_feltetelek = [];

    foreach ($oszlopok as $oszlop) {
        $kereses_feltetelek[] = "$oszlop LIKE '%" .($search) . "%'";
    }

    $kereses_szures = "WHERE TORZS_aru.aktiv = 1 AND (" . implode(' OR ', $kereses_feltetelek) . ")";
}
$aru_lekerdezes = "SELECT 
    TORZS_aru.aru_id, 
    TORZS_aru.aru_megnevezes,
     TORZS_aru.megjegyzes,
    TORZS_aru.file_link,
    TORZS_aru_tipus.tipus_megnevezes AS aru_tipus,
    TORZS_aru.aru_tipus_id AS aru_tipus_id
FROM 
    TORZS_aru 

LEFT JOIN 
    TORZS_aru_tipus 
ON 
    TORZS_aru.aru_tipus_id = TORZS_aru_tipus.aru_tipus_id 
" . $kereses_szures . " ORDER BY " . $sort_field . " " . $sort_direction . " LIMIT " . ($page - 1) * $size . ", " . $size;

$aru_eredmeny = kerdes($aru_lekerdezes);

if (!$aru_eredmeny) {
    die('SQL hiba: rossz a query');
}

$data = [];
if ($aru_eredmeny->num_rows > 0) {
    while ($row = $aru_eredmeny->fetch_assoc()) {
        $data[] = $row;
    }
}

$total_result = kerdes("SELECT COUNT(*) AS total FROM TORZS_aru WHERE aktiv = 1");
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
