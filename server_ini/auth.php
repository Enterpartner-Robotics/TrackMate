<?php
session_start();
$key = substr(hash('sha256', getenv('ENCRYPTION_KEY'), true), 0, 32); 

if (empty($_SESSION) && isset($_COOKIE['session_data'])) {
    
    $cookie_value = base64_decode($_COOKIE['session_data']);

    
    $iv = substr($cookie_value, 0, 12); 
    $tag = substr($cookie_value, 12, 16); 
    $ciphertext = substr($cookie_value, 28); 

  
    $decrypted_data = openssl_decrypt(
        $ciphertext,
        'aes-256-gcm',
        $key,
        OPENSSL_RAW_DATA,
        $iv,
        $tag
    );

    if ($decrypted_data === false) {
        echo 'Sikertelen visszafejtés!';
    } else {
       
        $data = json_decode($decrypted_data, true);

        if (is_array($data)) {
            
           
            $_SESSION['felh_id'] = $data['felh_id'] ?? null;
            $_SESSION['felh'] = $data['felh'] ?? null;
            $_SESSION['teljes_nev'] = $data['teljes_nev'] ?? null;
            $_SESSION['jogosultsag_id'] = $data['jogosultsag_id'] ?? null;
        }
    }
}



if (isset($_SESSION['felh_id'])) {
    echo json_encode([
        'status' => 'valid',
        'message' => 'Érvényes session'
    ]);
} else {
    echo json_encode([
        'status' => 'invalid',
        'message' => 'Nincs érvényes session'
    ]);
}

exit;
?>