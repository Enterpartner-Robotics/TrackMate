<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if(!isset($_SESSION['felh_id'])){
        echo json_encode([
            'status' => 'error',
            'message' => 'Nincs bejelentkezve!'
        ]);
        exit;
    }
    function formatFileSize($bytes) {
        if ($bytes < 1024) {
            return $bytes . ' B';
        } elseif ($bytes < 1048576) {
            return round($bytes / 1024, 2) . ' KB';
        } elseif ($bytes < 1073741824) {
            return round($bytes / 1048576, 2) . ' MB';
        } else {
            return round($bytes / 1073741824, 2) . ' GB';
        }
    }
    $kategoria_id = $_POST['kategoria_id'];
    $kereses_szoveg = $_POST['kereses_szoveg'];
    $rendezes = $_POST['rendezes'];
    $tipus = $_POST['tipus'];


    if($rendezes == 'datum'){
        $rendezes_sql = 'ORDER BY td.datum DESC';
    }
    else if($rendezes == 'nev'){
        $rendezes_sql = 'ORDER BY td.dokumentum_nev ASC';
    }
    else if($rendezes == 'meret'){
        $rendezes_sql = 'ORDER BY td.meret DESC';
    }
    else if($rendezes == 'tipus'){
        $rendezes_sql = 'ORDER BY td.tipus_nev ASC';
    }
    else{
        $rendezes_sql = 'ORDER BY td.dokumentum_id DESC';
    }

    if($tipus == 'PDF'){
        $tipus_sql = 'AND td.tipus_nev = "pdf"';
    }
    else if($tipus == 'Word'){
        $tipus_sql = 'AND (td.tipus_nev = "docx" OR td.tipus_nev = "doc")';
    }
    else if($tipus == 'Excel'){
        $tipus_sql = 'AND (td.tipus_nev = "xlsx" OR td.tipus_nev = "xls" OR td.tipus_nev = "csv")';
    }
    else if($tipus == 'Image'){
        $tipus_sql = 'AND (td.tipus_nev = "jpg" OR td.tipus_nev = "jpeg" OR td.tipus_nev = "png" OR td.tipus_nev = "gif" OR td.tipus_nev = "webp")';
    }
    else{
        $tipus_sql = '';
    }


    
    if($kereses_szoveg != ''){
        $kereses_szoveg = " AND (td.dokumentum_nev LIKE '%$kereses_szoveg%' OR td.datum LIKE '%$kereses_szoveg%')";
    }
    else{
        $kereses_szoveg = '';
    }

    if($kategoria_id == '' || $kategoria_id == '0'){
        $query = "SELECT
                        td.dokumentum_id, td.dokumentum_nev, td.dokumentum_link, td.meret, td.tipus_nev, tdk.kategoria_nev, td.datum, td.kategoria_id
                    FROM
                        TM_dokumentumtar td
                        LEFT JOIN TM_dokumentumtar_kategoria tdk ON td.kategoria_id = tdk.kategoria_id
                    WHERE 1=1
                        $kereses_szoveg
                        $tipus_sql
                    $rendezes_sql";
    }
    else{
        $query = "SELECT
                        td.dokumentum_id, td.dokumentum_nev, td.dokumentum_link, td.meret, td.tipus_nev, tdk.kategoria_nev, td.datum, td.kategoria_id
                    FROM
                        TM_dokumentumtar td
                        LEFT JOIN TM_dokumentumtar_kategoria tdk ON td.kategoria_id = tdk.kategoria_id
                    WHERE
                        td.kategoria_id = '$kategoria_id'
                        $kereses_szoveg
                        $tipus_sql
                    $rendezes_sql";
    }
    $result = kerdes($query);
    $dokumentum_lista = [];
    while($row = mysqli_fetch_assoc($result)){
        $row['meret'] = formatFileSize($row['meret']);
        $row['tipus_nev'] = strtoupper($row['tipus_nev']);
        $dokumentum_lista[] = $row;
    }
    echo json_encode([
        'status' => 'success',
        'dokumentum_lista' => $dokumentum_lista
    ]);
}




?>