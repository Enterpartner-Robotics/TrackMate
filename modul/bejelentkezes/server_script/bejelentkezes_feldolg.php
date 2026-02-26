<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');


$key = substr(hash('sha256', getenv('ENCRYPTION_KEY'), true), 0, 32); 
$felh_nev = $_POST['username'];
$password = $_POST['password'];

$felh_valid = kerdes("SELECT * FROM `SYS_felh` WHERE (`felh_nev` = '$felh_nev' OR `email` = '$felh_nev') AND `aktiv` = 1");
$felh_valid_result = mysqli_num_rows($felh_valid);

if ($felh_valid_result === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Ez a felhasználó nincs regisztrálva.']);
    exit;
} else {
    $jelszo_valid = mysqli_fetch_array($felh_valid, MYSQLI_ASSOC);
    if (password_verify($password, $jelszo_valid['jelszo'])) {
        
        $_SESSION['felh_id'] = $jelszo_valid['felh_id'];
        $_SESSION['felh']    = $jelszo_valid['felh_nev'];
        $_SESSION['teljes_nev'] = $jelszo_valid['teljes_nev'];
        $_SESSION['profilkep'] = $jelszo_valid['profil_kep_link'];
        $_SESSION['jogosultsag_id'] = $jelszo_valid['jogosultsag_id'];
        
        $session_data = json_encode([
            'felh_id' => $jelszo_valid['felh_id'],
            'felh' => $jelszo_valid['felh_nev'],
            'teljes_nev' => $jelszo_valid['teljes_nev'],
            'profilkep' => $jelszo_valid['profil_kep_link'],
            'jogosultsag_id' => $jelszo_valid['jogosultsag_id']

        ]);
        
        $iv = random_bytes(12); 
        $tag = null; 

        $ciphertext = openssl_encrypt(
            $session_data,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag 
        );

        $cookie_value = base64_encode($iv . $tag . $ciphertext);

        setcookie('session_data', $cookie_value, [
            'expires' => time() + (10 * 365 * 24 * 60 * 60),
            'path' => '/',
            'secure' => false,
            'httponly' => true,     
            'samesite' => 'Lax'      
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Sikeres bejelentkezés.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Hibás felhasználónév vagy jelszó!']);
        exit;
    }
}





?>