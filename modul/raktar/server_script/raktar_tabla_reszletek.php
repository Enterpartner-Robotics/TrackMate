<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

// Az aru_id paraméter lekérése a GET kérésből
$raktar_id = isset($_GET['raktar_id']) ? (int) $_GET['raktar_id'] : 0;

// Ellenőrizzük, hogy van-e valid aru_id
if ($raktar_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Érvénytelen aru ID']);
    exit;
}

// SQL lekérdezés a részletek lekérésére a raktar_bejegyzesek táblából
$query = "
   SELECT
        ta.aru_megnevezes,
        rb.darab,
        rb.beszerzesi_ar,
        rb.megjegyzes,
        fh.teljes_nev,
        rb.datum,
        bt.bejegyzes_nev_megjelenites,
        rsz.file_link as szamlaKepe,
        rb.file_link as bejegyzesKepe,
        fh.profil_kep_link,
        rb.bejegyzes_tipus_id,
        tm.megnevezes as munkalap_nev,
        rb.munkalap_id
    FROM 
        TM_raktar_bejegyzes rb 
        JOIN TORZS_aru ta ON rb.aru_id = ta.aru_id
        JOIN SYS_felh fh ON rb.felh_id = fh.felh_id 
        JOIN TORZS_bejegyzes_tipus bt ON rb.bejegyzes_tipus_id = bt.bejegyzes_tipus_id 
        LEFT JOIN TM_raktar_szamla rsz ON rb.szamla_id = rsz.szamla_id 
        LEFT JOIN TM_munkalap tm ON rb.munkalap_id = tm.munkalap_id
        WHERE rb.raktar_id = '$raktar_id' 
        ORDER BY rb.raktar_bejegyzes_id DESC;";

$result=kerdes($query);

// Ellenőrizzük, hogy van-e eredmény
if ($result && mysqli_num_rows($result) > 0) {
    $data = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
   
    echo json_encode(['success' => true, 'data' => $data]);
} else {
    // Ha nincs adat
    echo json_encode(['success' => false, 'message' => 'Nincsenek bejegyzések a termékhez']);
}
?>
