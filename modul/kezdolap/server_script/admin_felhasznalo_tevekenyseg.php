<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

$felh_id = $_POST['felh_id'];

$tevekenyseg_query = "SELECT 
    tm.munkalap_id,
    tm.megnevezes as munkalap_nev,
    COALESCE(tmp.projekt_nev, 'Egyéb feladatok') as projekt_nev,
    COALESCE(tmp.hatarido, 'Nincs megadva') as hatarido, 
    SUM(tma.munkaido_felh) AS teljesitett_ora,
    MAX(tma.ossz_ora) as ossz_ora 
    
FROM TM_munkalap tm 
LEFT JOIN TM_projekt tmp ON tmp.projekt_id = tm.projekt_id
JOIN TM_munkalap_aktivitas tma ON tm.munkalap_id = tma.munkalap_id
WHERE tma.felh_id = $felh_id
GROUP BY tm.munkalap_id, tm.megnevezes, tmp.projekt_nev, tmp.hatarido, tm.munkaido";

$tevekenyseg_lekerdezese = kerdes($tevekenyseg_query);

// Projektek szerinti csoportosítás
$projektek = [];

foreach($tevekenyseg_lekerdezese as $row) {
    $projekt_nev = $row['projekt_nev'];
    
    // Ha még nem létezik ez a projekt, hozzuk létre
    if (!isset($projektek[$projekt_nev])) {
        $projektek[$projekt_nev] = [
            'projekt_nev' => $projekt_nev,
            'hatarido' => $row['hatarido'],
            'munkalapok' => []
        ];
    }
    
    // Munkalap adatok hozzáadása a projekthez
    $projektek[$projekt_nev]['munkalapok'][] = [
        'munkalap_id' => $row['munkalap_id'],
        'megnevezes' => $row['munkalap_nev'],
        'teljesitett_ora' => (float)$row['teljesitett_ora'],
        'ossz_ora' => (float)$row['ossz_ora']
    ];
}



echo json_encode([
    'status' => 'success',
    'projektek' => array_values($projektek)
]);
?>