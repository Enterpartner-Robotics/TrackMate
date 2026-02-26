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
    $kategoria_id = $_POST['kategoria_id'];
    $kategoria_nev = $_POST['kategoria_nev'];
    $fajlok = $_FILES['fajl'];

    if(!$fajlok){
        echo json_encode([
            'status' => 'error',
            'message' => 'Hiányzó adat!'
        ]);
        exit;
    }
    if(!$kategoria_nev || $kategoria_nev == 'Válassza ki a kategóriát!'){
        $kategoria_nev = 'egyeb1122';
        $kategoria_id = 'NULL';
    }

    $kategoria_nev = atalakitott_string($kategoria_nev);
    $feltoltesekSzama = count($_FILES['fajl']['name']);
    $celMappa = "/var/www/html/userfiles/dokumentumtar/" . $kategoria_nev;

    if (!is_dir($celMappa)) {
        mkdir($celMappa, 0777, true);
    }

    $sikeres = 0;
    $hibas = [];

    for ($i = 0; $i < $feltoltesekSzama; $i++) {
        $eredetiNev = $fajlok['name'][$i];
        $tmpFajl = $fajlok['tmp_name'][$i];
        $meret = $fajlok['size'][$i];
        $hiba = $fajlok['error'][$i];
        $file_type_parts = explode('.', $fajlok['name'][$i]);
        $file_type = end($file_type_parts);
        $link = "/userfiles/dokumentumtar/" . $kategoria_nev . "/" . $eredetiNev;

        $celUtvonal = $celMappa . '/' . basename($eredetiNev);

        if (file_exists($celUtvonal)) {
            $hibas[] = $eredetiNev . " (már létezik)";
            continue;
        }

        if ($hiba === UPLOAD_ERR_OK && is_uploaded_file($tmpFajl)) {
            if (move_uploaded_file($tmpFajl, $celUtvonal)) {
                $datum = date('Y-m-d H:i:s');
                $sql = "INSERT INTO `TM_dokumentumtar`(`dokumentum_id`, `kategoria_id`, `dokumentum_nev`, `dokumentum_link`, `meret`, `tipus_nev`, `datum`) 
                        VALUES (NULL, {$kategoria_id}, '{$eredetiNev}', '{$link}', {$meret}, '{$file_type}', '{$datum}')";
                kerdes($sql);
                $sikeres++;
            } else {
                $hibas[] = $eredetiNev . " (sikertelen feltöltés)";
            }
        } else {
            $hibas[] = $eredetiNev . " (hiba történt)";
        }
    }

    if ($sikeres > 0 && empty($hibas)) {
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
            'message' => "{$sikeres} fájl sikeresen feltöltve a(z) {$kategoria_nev} kategóriába."
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'A következő fájl(ok) nem kerültek feltöltésre:<br>' . implode('<br>', $hibas)
        ]);
    }


    
}

?>