<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

$regisztracio_felhasznalonev = $_POST['regisztracio_felhasznalonev'];
$regisztracio_email = $_POST['regisztracio_email'];
$regisztracio_teljesnev = $_POST['regisztracio_teljesnev'];
$regisztracio_jelszo = $_POST['regisztracio_jelszo'];
$regisztracio_telefonszam = $_POST['regisztracio_telefonszam'];
$regisztracio_szuletesi_ido = str_replace('.', '-', $_POST['regisztracio_szuletesi_ido']);



$felh_valid = kerdes("SELECT * FROM `SYS_felh` WHERE `felh_nev` = '$regisztracio_felhasznalonev'");
$felh_valid_result = mysqli_num_rows($felh_valid);

$email_valid = kerdes("SELECT * FROM `SYS_felh` WHERE `email` = '$regisztracio_email'");
$email_valid_result = mysqli_num_rows($email_valid);

$telefonszam_valid = kerdes("SELECT * FROM `SYS_felh` WHERE `telefon` = '$regisztracio_telefonszam'");
$telefonszam_valid_result = mysqli_num_rows($telefonszam_valid);

if ($felh_valid_result > 0) {
    echo json_encode(['status' => 'error', 'message' => 'Ez a felhasználónév már foglalt.']);
    exit;
} elseif ($email_valid_result > 0) {
    echo json_encode(['status' => 'error', 'message' => 'Ez az email már regisztrálva van.']);
    exit;
} elseif ($telefonszam_valid_result > 0) {
    echo json_encode(['status' => 'error', 'message' => 'Ez a telefonszám már regisztrálva van.']);
    exit;
} else {
    $titkositott_jelszo = password_hash($regisztracio_jelszo, PASSWORD_DEFAULT);
    $belepes_ideje = date('Y-m-d');

    // 1. Létrehozza a felhasználót az adatbázisban, profilkép nélkül
    $regiszt_query = kerdes("
        INSERT INTO `SYS_felh` (`felh_id`, `felh_nev`, `teljes_nev`, `email`,`szuletesi_ido`, `jelszo`, `belepes_ideje`, `telefon`, `level`, `aktiv`, `profil_kep_link`,`jogosultsag_id`) 
        VALUES (NULL, '$regisztracio_felhasznalonev', '$regisztracio_teljesnev', '$regisztracio_email', '$regisztracio_szuletesi_ido', '$titkositott_jelszo', '$belepes_ideje', '$regisztracio_telefonszam', '1', '1', '', '3')
    ");

    if ($regiszt_query) {
        // 2. Lekéri az újonnan létrehozott felhasználó ID-ját
        $uj_felh_id_str = "SELECT `felh_id` FROM `SYS_felh` ORDER BY `felh_id` DESC LIMIT 1;";
        $uj_felh_id_qry = kerdes($uj_felh_id_str);
        $uj_felh_id = mysqli_fetch_array($uj_felh_id_qry);
        $felh_id = $uj_felh_id['felh_id'];
        $profile_picture_path = "../../assets/profil_icon.png"; // Alapértelmezett kép

        // 3. Ha van feltöltött kép, menti az egyedi felhasználói mappába
        if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] === UPLOAD_ERR_OK) {
            $file_tmp = $_FILES['profile_picture']['tmp_name'];
            $file_name = uniqid() . "_" . basename($_FILES['profile_picture']['name']);
            $target_dir = "/var/www/html/userfiles/profilkep/" . $felh_id . "/";

            // Mappa létrehozása, ha nem létezik
            if (!file_exists($target_dir)) {
                mkdir($target_dir, 0777, true);
            }

            $target_file = $target_dir . $file_name;

            // Ellenőrizzük, hogy valóban kép-e
            $check = getimagesize($file_tmp);
            if ($check !== false) {
                if (move_uploaded_file($file_tmp, $target_file)) {
                    $profile_picture_path = "/userfiles/profilkep/" . $felh_id . "/" . $file_name;
                    chmod($target_file, 0664);
                }
            }
        }

        // 4. Frissíti az adatbázist a profilkép elérési útvonalával
        kerdes("UPDATE `SYS_felh` SET `profil_kep_link` = '$profile_picture_path' WHERE `felh_id` = '$felh_id'");
        $updateData = array('update' => 'jog_tabla');
         // A Node.js szerver URL-je
        $ch = curl_init(NODE_SERVER_URL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        $nodeResponse = curl_exec($ch);
        curl_close($ch);
        echo json_encode(['status' => 'success', 'profile_picture' => $profile_picture_path]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Hiba történt a regisztráció során. Kérjük, próbálja meg újra.']);
    }
}
?>