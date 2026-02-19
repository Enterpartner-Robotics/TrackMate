<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

// Lekérjük a beküldött adatokat
$modositott_osztalyok_json = $_POST['modositott_osztalyok'] ?? '[]';
$uj_osztalyok_json = $_POST['uj_osztalyok'] ?? '[]';

// Dekódoljuk a JSON adatokat
$modositott_osztalyok = json_decode($modositott_osztalyok_json, true);
$uj_osztalyok = json_decode($uj_osztalyok_json, true);

$sikeres_frissites = true;
$sikeres_beszuras = true;
$hibauzenet = '';
$aktualis_timestamp = time(); // Unix timestamp
// Frissítjük a módosított osztályokat
if (!empty($modositott_osztalyok)) {
    foreach ($modositott_osztalyok as $osztaly) {
        $osztaly_id = intval($osztaly['osztaly_id']);
        $osztaly_nev = $osztaly['osztaly_nev'];
        
        $frissites_query = "UPDATE SYS_osztaly SET osztaly_nev = '$osztaly_nev' WHERE osztaly_id = $osztaly_id";
        $frissites_eredmeny = kerdes($frissites_query);
        
        if (!$frissites_eredmeny) {
            $sikeres_frissites = false;
            $hibauzenet .= "Hiba a(z) $osztaly_id azonosítójú osztály frissítésekor. ";
        }
    }
}

// Beszúrjuk az új osztályokat
if (!empty($uj_osztalyok)) {
    foreach ($uj_osztalyok as $osztaly) {
        $osztaly_nev = $osztaly['osztaly_nev'];
        
        // Ellenőrizzük, hogy létezik-e már ilyen nevű osztály
        $ellenorzes_query = "SELECT osztaly_id, aktiv FROM SYS_osztaly WHERE osztaly_nev = '$osztaly_nev'";
        $ellenorzes_eredmeny = kerdes($ellenorzes_query);
        
        if (mysqli_num_rows($ellenorzes_eredmeny) > 0) {
            $meglevo_osztaly = mysqli_fetch_assoc($ellenorzes_eredmeny);
            
            // Ha aktív osztály, akkor hibaüzenet
            if ($meglevo_osztaly['aktiv'] == 1) {
                $sikeres_beszuras = false;
                $hibauzenet .= "A(z) '$osztaly_nev' nevű osztály már létezik! ";
                continue; // Ugrunk a következő iterációra
            } 
            // Ha inaktív osztály, akkor visszaállítjuk aktívra
            else {
                $visszaallitas_query = "UPDATE SYS_osztaly SET aktiv = 1 WHERE osztaly_id = " . $meglevo_osztaly['osztaly_id'];
                $visszaallitas_eredmeny = kerdes($visszaallitas_query);
                
                if (!$visszaallitas_eredmeny) {
                    $sikeres_beszuras = false;
                    $hibauzenet .= "Hiba a(z) '$osztaly_nev' osztály visszaállításakor. ";
                }
            }
        } 
        // Ha nem létezik, akkor új beszúrás
        else {
            $beszuras_query = "INSERT INTO SYS_osztaly (osztaly_nev, aktiv, felvetel_datum) 
                              VALUES ('$osztaly_nev', 1, $aktualis_timestamp)";
            $beszuras_eredmeny = kerdes($beszuras_query);
            
            if (!$beszuras_eredmeny) {
                $sikeres_beszuras = false;
                $hibauzenet .= "Hiba a(z) '$osztaly_nev' osztály beszúrásakor. ";
            }
        }
    }
}

// Visszaküldjük az eredményt
if ($sikeres_frissites && $sikeres_beszuras) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Az osztályok sikeresen mentve!'
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Hiba történt: ' . $hibauzenet
    ]);
}
?>