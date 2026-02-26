<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

// Pagination és rendezés paraméterek
$per_page = isset($_POST['per_page']) ? (int)$_POST['per_page'] : 10;
$page = isset($_POST['page']) ? (int)$_POST['page'] : 1;
$searchterm = isset($_POST['searchterm']) ? $_POST['searchterm'] : '';
$oszlop = isset($_POST['oszlop']) ? $_POST['oszlop'] : 'teljes_nev';
$rendezes = isset($_POST['rendezes']) ? $_POST['rendezes'] : 'asc';

// Biztonsági ellenőrzés a rendezési oszlopokra
$megengedett_oszlopok = ['teljes_nev', 'email', 'telefon', 'felh_id', 'osztaly_nev'];
if (!in_array($oszlop, $megengedett_oszlopok)) {
    $oszlop = 'teljes_nev'; // Alapértelmezett rendezési oszlop
}

// Biztonsági ellenőrzés a rendezési irányra
if ($rendezes != 'asc' && $rendezes != 'desc') {
    $rendezes = 'asc'; // Alapértelmezett rendezési irány
}

// Keresési feltétel
$search_condition = $searchterm ? " AND (teljes_nev LIKE '%$searchterm%' OR email LIKE '%$searchterm%')" : '';

// Összes rekord számának lekérdezése a keresési feltétellel
$count_query = "SELECT COUNT(*) as total FROM `SYS_felh` WHERE `aktiv` = 1 AND (jogosultsag_id = 1 OR jogosultsag_id = 2) $search_condition";
$count_result = kerdes($count_query);
$count_row = $count_result->fetch_assoc();
$total_records = $count_row['total'];

// Offset számítása a lapozáshoz
$offset = ($page - 1) * $per_page;

// A meglévő lekérdezés módosítása a keresés, rendezés és lapozás támogatásához
$aktiv_felhasznalo_query = "SELECT felh.felh_id, felh.teljes_nev, felh.email, felh.telefon, felh.profil_kep_link, osztaly.osztaly_nev 
                           FROM SYS_felh felh 
                           LEFT JOIN SYS_osztaly osztaly ON felh.osztaly_id = osztaly.osztaly_id
                           WHERE felh.aktiv = 1 AND (felh.jogosultsag_id = 1 OR felh.jogosultsag_id = 2) $search_condition
                           ORDER BY $oszlop $rendezes
                           LIMIT $offset, $per_page";

$aktiv_felhasznalo_lekerdezese = kerdes($aktiv_felhasznalo_query);

if ($aktiv_felhasznalo_lekerdezese) {
   $aktiv_felhasznalo_eredmeny = array();
   while ($row = $aktiv_felhasznalo_lekerdezese->fetch_assoc()) {
      $aktiv_felhasznalo_eredmeny[] = $row;
   }
}

// Pagination információk hozzáadása a válaszhoz
echo json_encode([
    'status' => 'success',
    'adat' => $aktiv_felhasznalo_eredmeny,
    'pagination' => [
        'current_page' => $page,
        'total_pages' => ceil($total_records / $per_page),
        'total' => $total_records
    ]
]);
?>