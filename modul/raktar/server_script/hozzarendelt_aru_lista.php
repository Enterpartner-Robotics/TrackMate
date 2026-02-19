<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", 1);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $felh_id = isset($_SESSION['felh_id']) ? $_SESSION['felh_id'] : null;
    if (!$felh_id) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Nincs bejelentkezve felhasználó!'
        ]);
        exit;
    }
    $munkalap_id = $_POST['munkalap_id'];
    $query = "SELECT 
                trb.aru_id, 
                SUM(trb.darab) as darab,
                ta.aru_megnevezes,
                ta.aru_id
              FROM 
                TM_raktar_bejegyzes trb
                INNER JOIN TORZS_aru ta ON trb.aru_id = ta.aru_id
              WHERE trb.munkalap_id = '$munkalap_id'
              GROUP BY trb.aru_id
              ORDER BY ta.aru_id ASC
              ";
    $result = kerdes($query);
    $rows = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $rows[] = $row;
    }
    echo json_encode($rows);
    

}
?>