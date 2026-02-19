$key = getenv('ENCRYPTION_KEY'); 

$felh_nev = $_POST['username'];
$password = $_POST['password'];

$felh_valid = kerdes("SELECT * FROM SYS_felh WHERE (felh_nev = '$felh_nev' OR email = '$felh_nev') AND aktiv = 1");
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
        $encrypted_data = openssl_encrypt($session_data, 'AES-128-ECB', $key);

        
        setcookie('session_data', $encrypted_data, [
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















$key = getenv('ENCRYPTION_KEY'); // Titkosító kulcs betöltése

if (empty($_SESSION) && isset($_COOKIE['session_data'])) {
    $decrypted_data = openssl_decrypt($_COOKIE['session_data'], 'AES-128-ECB', $key);
    $data = json_decode($decrypted_data, true);
    if (is_array($data)) {
        session_start();
        $_SESSION['felh_id'] = $data['felh_id'] ?? null;
        $_SESSION['felh'] = $data['felh'] ?? null;
        $_SESSION['teljes_nev'] = $data['teljes_nev'] ?? null;
        $_SESSION['jogosultsag_id'] = $data['jogosultsag_id'] ?? null;
    }
}