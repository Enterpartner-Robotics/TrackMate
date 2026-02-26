<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['felh_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Nincs bejelentkezve.']);
        exit;
    }

    $felh_id = intval($_SESSION['felh_id']);
    $felh_nev = trim($_POST['profil_felhasznalonev'] ?? '');
    $teljes_nev = trim($_POST['profil_teljesnev'] ?? '');
    $email = trim($_POST['profil_email'] ?? '');
    $telefon = trim($_POST['profil_telefonszam'] ?? '');
    $szuletesi_ido = trim($_POST['profil_szuletesi_ido'] ?? '');

    // Az aktuális felhasználói adatok lekérése
    $query = "SELECT felh_nev, teljes_nev, szuletesi_ido, email, telefon, profil_kep_link FROM SYS_felh WHERE felh_id = $felh_id";
    $result = kerdes($query);

    if (!$result || mysqli_num_rows($result) === 0) {
        echo json_encode(['status' => 'error', 'message' => 'Felhasználó nem található.']);
        exit;
    }

    $current_data = mysqli_fetch_assoc($result);
    $update_fields = [];

    if ($felh_nev !== '' && $felh_nev !== $current_data['felh_nev']) {
        $update_fields[] = "felh_nev = '" .  $felh_nev . "'";
    }
    if ($teljes_nev !== '' && $teljes_nev !== $current_data['teljes_nev']) {
        $update_fields[] = "teljes_nev = '" . $teljes_nev . "'";
    }
    if ($szuletesi_ido !== '' && $szuletesi_ido !== $current_data['szuletesi_ido']) {
        $update_fields[] = "szuletesi_ido = '" . $szuletesi_ido . "'";
    }
    if ($email !== '' && $email !== $current_data['email']) {
        $update_fields[] = "email = '" . $email . "'";
    }
    if ($telefon !== '' && $telefon !== $current_data['telefon']) {
        $update_fields[] = "telefon = '" . $telefon . "'";
    }

    // **Profilkép frissítése**
    if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] === UPLOAD_ERR_OK) {
        $target_dir = "/var/www/html/userfiles/profilkep/" . $felh_id . "/";
        $new_filename = uniqid() . "_" . basename($_FILES['profile_picture']['name']);
        $target_file = $target_dir . $new_filename;

        // Ha a mappa nem létezik, hozzuk létre
        if (!file_exists($target_dir)) {
            mkdir($target_dir, 0775, true);
        }

        // **Töröljük az előző profilképet, ha van és nem az alapértelmezett**
        if (!empty($current_data['profil_kep_link']) && file_exists("/var/www/html" . $current_data['profil_kep_link'])) {
            unlink("/var/www/html" . $current_data['profil_kep_link']);
        }

        // **Új kép feltöltése**
        if (move_uploaded_file($_FILES['profile_picture']['tmp_name'], $target_file)) {
            chmod($target_file, 0664);
            $new_profile_picture_path = "/userfiles/profilkep/" . $felh_id . "/" . $new_filename;
            $update_fields[] = "profil_kep_link = '" . $new_profile_picture_path . "'";
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Nem sikerült feltölteni a profilképet.']);
            exit;
        }
    }

    // **Ha van módosítás, frissítsük az adatbázist**
    if (!empty($update_fields)) {
        $update_query = "UPDATE SYS_felh SET " . implode(", ", $update_fields) . " WHERE felh_id = $felh_id";
        $update_result = kerdes($update_query);

        if ($update_result) {
            echo json_encode(['status' => 'success', 'message' => 'Adatok sikeresen frissítve.', 'profil_kep_link' => $new_profile_picture_path ?? $current_data['profil_kep_link']]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Hiba történt az adatok frissítése közben.']);
        }
    } else {
        echo json_encode(['status' => 'success', 'message' => 'Nincs módosítás.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Érvénytelen kérés.']);
}
?>
