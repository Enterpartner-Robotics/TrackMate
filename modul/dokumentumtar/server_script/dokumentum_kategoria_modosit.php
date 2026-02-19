<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['felh_id'])) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Nincs bejelentkezve!'
        ]);
        exit;
    }

    function atalakitott_string($szoveg) {
        $szoveg = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $szoveg);
        $szoveg = strtolower($szoveg);
        $szoveg = str_replace(' ', '_', $szoveg);
        $szoveg = preg_replace('/[^a-z0-9_]/', '', $szoveg);
        return $szoveg;
    }

    $kategoria_id = $_POST['kategoria_id'];
    $kategoria_nev = $_POST['kategoria_nev'];
    $dokumentum_id = $_POST['dokumentum_id'];

    if (!$dokumentum_id) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Hiányzó adatok!'
        ]);
        exit;
    }
    if (!$kategoria_id || $kategoria_nev == 'Válassza ki a kategóriát!') {
        $kategoria_id = 'NULL';
        $kategoria_nev = 'egyeb1122';
    }

    // Lekérjük a jelenlegi dokumentum nevet és a régi kategória ID-t
    $dokumentum_query = "SELECT dokumentum_nev, kategoria_id FROM TM_dokumentumtar WHERE dokumentum_id = '$dokumentum_id'";
    $dokumentum_result = kerdes($dokumentum_query);

    if (mysqli_num_rows($dokumentum_result) == 0) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Nem található a dokumentum!'
        ]);
        exit;
    }

    $dokumentum = mysqli_fetch_assoc($dokumentum_result);
    $fajl_nev = $dokumentum['dokumentum_nev'];
    $regi_kategoria_id = $dokumentum['kategoria_id'];

    // Lekérjük a régi kategória nevét
    $regi_kategoria_query = "SELECT kategoria_nev FROM TM_dokumentumtar_kategoria WHERE kategoria_id = '$regi_kategoria_id'";
    $regi_kategoria_result = kerdes($regi_kategoria_query);
    $regi_kategoria_nev = mysqli_fetch_assoc($regi_kategoria_result)['kategoria_nev'] ?? 'egyeb1122';

    // Átalakítjuk mindkét kategória nevet
    $regi_folder = atalakitott_string($regi_kategoria_nev);
    $uj_folder = atalakitott_string($kategoria_nev);

    $alap_utvonal = '/var/www/html/userfiles/dokumentumtar/';

    $regi_utvonal = $alap_utvonal . $regi_folder . '/' . $fajl_nev;
    $uj_utvonal = $alap_utvonal . $uj_folder . '/' . $fajl_nev;
    $uj_link = '/userfiles/dokumentumtar/' . $uj_folder . '/' . $fajl_nev;

    // Ha a fájl létezik, akkor áthelyezzük
    if (file_exists($regi_utvonal)) {
        // Ha az új mappa nem létezik, létrehozzuk
        if (!is_dir($alap_utvonal . $uj_folder)) {
            mkdir($alap_utvonal . $uj_folder, 0755, true);
        }

        if (!rename($regi_utvonal, $uj_utvonal)) {
            echo json_encode([
                'status' => 'error',
                'message' => 'A fájl áthelyezése nem sikerült!'
            ]);
            exit;
        }
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'A fájl nem található: ' . $regi_utvonal
        ]);
        exit;
    }

    // Frissítjük az adatbázist
    $update_query = "UPDATE TM_dokumentumtar SET kategoria_id = '$kategoria_id', dokumentum_link = '$uj_link' WHERE dokumentum_id = '$dokumentum_id'";
    $result = kerdes($update_query);

    $updateData = array('update' => 'dokumentumtar_jobboldal');
    
    $ch = curl_init(NODE_SERVER_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    $nodeResponse = curl_exec($ch);
    curl_close($ch);
    echo json_encode([
        'status' => 'success',
        'message' => 'Kategória és fájl hely sikeresen módosítva!'
    ]);
}
?>