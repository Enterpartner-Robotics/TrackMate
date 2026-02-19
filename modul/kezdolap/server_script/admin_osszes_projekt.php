<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');
$felh_jog = $_SESSION['jogosultsag_id'];

$sortColumn = $_POST['oszlop'];
$sortOrder = $_POST['rendezes'];
$kereses_ertek = isset($_POST['searchterm']) ? $_POST['searchterm'] : '';
$page = isset($_POST['page']) ? (int)$_POST['page'] : 1;
$per_page = isset($_POST['per_page']) ? (int)$_POST['per_page'] : 10;
$offset = ($page - 1) * $per_page;

if(isset($sortColumn) && $sortColumn == 'ossz_ora'){
    $sortColumn = 'tmpa.ossz_ora/tmp.munkaido';
}
$rendezes = "GROUP BY tmp.projekt_id ORDER BY $sortColumn $sortOrder";
$keresendo_oszlopok = ['tmp.projekt_nev', 'ta.allapot_nev', 'tmp.hatarido', 'tmp.teljes_osszeg'];



if ($kereses_ertek != '') {
    $keresesi_feltetelek = [];
    foreach ($keresendo_oszlopok as $oszlop) {
        $keresesi_feltetelek[] = "$oszlop LIKE '%$kereses_ertek%'";
    }
    $kereses = " AND (" . implode(' OR ', $keresesi_feltetelek) . ")";
} else {
    $kereses = "";
}

// Összes találat számának lekérdezése
$count_query = "SELECT COUNT(DISTINCT tmp.projekt_id) as total 
                FROM TM_projekt tmp 
                LEFT JOIN TM_projekt_aktivitas tmpa ON tmp.projekt_id = tmpa.projekt_id 
                JOIN TORZS_allapot ta ON tmp.allapot_id = ta.allapot_id
                WHERE tmp.aktiv = 1 $kereses";

$count_result = kerdes($count_query);
$total_records = $count_result->fetch_assoc()['total'];

// Projektek lekérdezése lapozással
$osszes_projekt_query = "SELECT tmp.projekt_id, tmp.projekt_nev, tmp.munkaido, tmp.hatarido, 
                        tmp.teljes_osszeg, MAX(tmpa.ossz_ora) as ossz_ora, ta.allapot_nev, tmp.jog_csoport
                        FROM TM_projekt tmp 
                        LEFT JOIN TM_projekt_aktivitas tmpa ON tmp.projekt_id = tmpa.projekt_id 
                        JOIN TORZS_allapot ta ON tmp.allapot_id = ta.allapot_id
                        WHERE tmp.aktiv = 1 $kereses $rendezes
                        LIMIT $offset, $per_page";

$osszes_projekt_lekerdezese = kerdes($osszes_projekt_query);

if ($osszes_projekt_lekerdezese) {
    $osszes_projekt_eredmeny = array();
    while ($row = $osszes_projekt_lekerdezese->fetch_assoc()) {
        $jogok = explode('|', $row['jog_csoport']);
        if ($felh_jog == 1) {
            $osszes_projekt_eredmeny[] = $row;
        }
        else if (in_array($felh_jog, $jogok)) {
            $osszes_projekt_eredmeny[] = $row;
        }
    }
}

echo json_encode([
    'status' => 'success',
    'adat' => $osszes_projekt_eredmeny,
    'pagination' => [
        'total' => $total_records,
        'per_page' => $per_page,
        'current_page' => $page,
        'total_pages' => ceil($total_records / $per_page)
    ]
]);
?>