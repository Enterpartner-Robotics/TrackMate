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

    function atalakitott_string($szoveg) {
        $szoveg = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $szoveg);
        $szoveg = strtolower($szoveg);
        $szoveg = str_replace(' ', '_', $szoveg);
        $szoveg = preg_replace('/[^a-z0-9_]/', '', $szoveg);
        return $szoveg;
    }


    $dokumentum_id = $_POST['dokumentum_id'];
    $dokumentum_nev_input = $_POST['dokumentum_nev'];
    $dokumentum_kiterjesztes = $_POST['dokumentum_kiterjesztes'];

    if($dokumentum_nev_input == '' || $dokumentum_kiterjesztes == '' || $dokumentum_id == ''){
        echo json_encode([
            'status' => 'error',
            'message' => 'Minden mezőt ki kell tölteni!'
        ]);
        exit;
    }

    // 1. Lekérjük a régi fájl nevét és a kategória ID-t
    $dokumentum_adatok_query = "SELECT dokumentum_nev, kategoria_id FROM TM_dokumentumtar WHERE dokumentum_id = ".$dokumentum_id;
    $dokumentum_adatok_result = kerdes($dokumentum_adatok_query);

    if(mysqli_num_rows($dokumentum_adatok_result) == 0){
        echo json_encode([
            'status' => 'error',
            'message' => 'A dokumentum nem található!'
        ]);
        exit;
    }

    $row = mysqli_fetch_assoc($dokumentum_adatok_result);
    $regi_dokumentum_nev = $row['dokumentum_nev'];
    $kategoria_id = $row['kategoria_id'];

    // 2. Lekérjük a kategória nevét
    $kategoria_nev_str = "SELECT kategoria_nev FROM TM_dokumentumtar_kategoria WHERE kategoria_id = ".$kategoria_id;
    $kategoria_nev_result = kerdes($kategoria_nev_str);

    if(mysqli_num_rows($kategoria_nev_result) == 0){
        echo json_encode([
            'status' => 'error',
            'message' => 'Kategória nem található!'
        ]);
        exit;
    }

    $kategoria_nev_row = mysqli_fetch_assoc($kategoria_nev_result);
    $kategoria_nev = $kategoria_nev_row['kategoria_nev'];
    $kategoria_nev = atalakitott_string($kategoria_nev);

    // 3. Átnevezzük a fájlt
    $regi_ut = "/var/www/html/userfiles/dokumentumtar/" . $kategoria_nev . "/" . $regi_dokumentum_nev;
    $uj_dokumentum_nev = $dokumentum_nev_input . '.' . $dokumentum_kiterjesztes;
    $uj_ut = "/var/www/html/userfiles/dokumentumtar/" . $kategoria_nev . "/" . $uj_dokumentum_nev;
    $uj_link = "/userfiles/dokumentumtar/" . $kategoria_nev . "/" . $uj_dokumentum_nev;

    if (!file_exists($regi_ut)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'A fájl nem található a szerveren: '.$regi_ut
        ]);
        exit;
    }

    if (!rename($regi_ut, $uj_ut)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'A fájl átnevezése nem sikerült!'
        ]);
        exit;
    }

    // 4. Módosítjuk az adatbázisban a nevet
    $dokumentum_nev_modosit_str = "UPDATE TM_dokumentumtar SET dokumentum_nev = '".$uj_dokumentum_nev."', dokumentum_link = '".$uj_link."' WHERE dokumentum_id = ".$dokumentum_id;
    $dokumentum_nev_modosit_result = kerdes($dokumentum_nev_modosit_str);

    if($dokumentum_nev_modosit_result){
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
            'message' => 'Sikeres módosítás!'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Az adatbázis frissítése nem sikerült!'
        ]);
    }
}
?>
