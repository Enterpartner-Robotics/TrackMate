<?php
include_once('/var/www/html/server_ini/connector.php');

error_reporting(E_ALL);
ini_set("display_errors", '1');

// Oszlopok, amelyeken szűrhetünk
$oszlopok = ['r.raktar_id', 'ta.aru_megnevezes', 'tt.tipus_megnevezes', 'r.beszerzesi_ar', 'rb.megjegyzes', 'rb.datum', 'rsz.szamla_azon'];


$sort_field = isset($_GET['sort']) ? $_GET['sort'][0]['field'] : 'raktar_id';
$sort_direction = isset($_GET['sort']) ? $_GET['sort'][0]['dir'] : 'desc';
$page = isset($_GET['page']) ? (int) $_GET['page'] : 1;  
$size = isset($_GET['size']) ? (int) $_GET['size'] : 10; 
$search = isset($_GET['search']) ? $_GET['search'] : ''; 


$kereses_szures = "WHERE ta.aktiv = 1";


if ($search) {
    $kereses_feltetelek = [];

    
    foreach ($oszlopok as $oszlop) {
        $kereses_feltetelek[] = "$oszlop LIKE '%" . $search . "%'";
    }


    $kereses_szures = "WHERE ta.aktiv = 1 AND (" . implode(' OR ', $kereses_feltetelek) . ")";
}


$raktar_lekerdezes = "SELECT 
                            r.raktar_id, 
                            ta.aru_megnevezes, 
                            r.darab, 
                            r.beszerzesi_ar, 
                            r.megjegyzes, 
                            rsz.szamla_azon, 
                            ta.file_link aru_kep
                        FROM
                            TM_raktar r
                            JOIN TORZS_aru ta ON r.aru_id = ta.aru_id
                            LEFT JOIN TORZS_aru_tipus tt ON ta.aru_tipus_id = tt.aru_tipus_id
                            INNER JOIN TM_raktar_bejegyzes rb ON r.raktar_id = rb.raktar_id
                            LEFT JOIN TM_raktar_szamla rsz ON rsz.szamla_id = rb.szamla_id
                       $kereses_szures
                       GROUP BY r.raktar_id
                       ORDER BY " . $sort_field . " " . $sort_direction . " 
                       LIMIT " . ($page - 1) * $size . ", " . $size;


//echo
//$raktar_lekerdezes = "SELECT * FROM TM_raktar_tabla_view";

$raktar_eredmeny = kerdes($raktar_lekerdezes);

if (!$raktar_eredmeny) {
    die('SQL hiba: rossz a query');
}

$data = [];
$hely_string = "";
if ($raktar_eredmeny->num_rows > 0) {
    while ($row = $raktar_eredmeny->fetch_assoc()) {
        
        $hely_qry = "SELECT `hely`, `pozicio` FROM `TM_raktar_aru_helye` WHERE `raktar_id` = ".$row['raktar_id']." AND `aktiv` = 1";
        $hely_eredmeny = kerdes($hely_qry);
        while ($hely_row = $hely_eredmeny->fetch_assoc()) {
            $hely_string .= $hely_row['hely'] . "/" . $hely_row['pozicio'] . ", ";
        }
        if($hely_string !== ""){
            $hely_string = substr($hely_string, 0, -2);
        }
        $row['hely'] = $hely_string;
        $data[] = $row;
        $hely_string = "";
    }
}

$total_result = kerdes("SELECT COUNT(*) AS total FROM `TM_raktar`");
$total_row = $total_result->fetch_assoc();
$total_records = $total_row['total'];
$lastPage = ceil($total_records / $size);


$response = [
    'current_page' => $page,
    'total_pages' => ceil($total_records / $size),
    'total_records' => $total_records,
    'last_page' => $lastPage,
    'data' => $data
];

echo json_encode($response);
?>
