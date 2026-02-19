<?php
session_start();

// 1. Session változók törlése
$_SESSION = [];

// 2. Session cookie törlése (natív PHPSESSID)
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

// 3. Ha van extra cookie (pl. session_data), azt is törölheted:
setcookie('session_data', '', time() - 42000, '/');

// 4. A session teljes megsemmisítése
session_destroy();

// 5. Válasz a kliensnek (JSON formátum, ha AJAX kérés)
echo json_encode(['status' => 'success', 'message' => 'Session törölve.']);
exit;
