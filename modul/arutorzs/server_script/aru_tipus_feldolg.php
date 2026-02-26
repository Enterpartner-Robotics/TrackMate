<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

// Ellenőrizzük, hogy érkezett-e POST kérelem
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Adatok beolvasása a POST-ból
    $aru_tipus_nev = isset($_POST['aru_tipus_nev']) ? trim($_POST['aru_tipus_nev']) : null;
    

    if (empty($aru_tipus_nev)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Minden mezőt ki kell tölteni!'
        ]);
        exit;
    }

    $validacio_query = "SELECT * FROM `TORZS_aru_tipus` WHERE `tipus_megnevezes` = '".$aru_tipus_nev."'";
    $validacio_eredmeny = kerdes($validacio_query);
    if($validacio_eredmeny && mysqli_num_rows($validacio_eredmeny) > 0){
        echo json_encode([
            'status' => 'error',
            'message' => 'Már létezik ez a típus!'
        ]);
        exit;
    }


    $query = "INSERT INTO `TORZS_aru_tipus` 
              (`aru_tipus_id`, `tipus_megnevezes`) 
              VALUES 
              (NULL, '$aru_tipus_nev')";

    // Adatok mentése az adatbázisba
    $result = kerdes($query);

    if ($result) {
        echo json_encode([
            'status' => 'success',
            'message' => $aru_tipus_nev.' nevű típus hozzáadva!'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Hiba történt az áru típus hozzáadásakor.'
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Érvénytelen kérés'
    ]);
}
?>