<?php
// var/www/html/config.php

// Database settings
define('DB_HOST', 'SERVER_ADDRESS');
define('DB_PORT', 3306);
define('DB_USER', 'DB_USER');
define('DB_PASS', 'DB_PASSWORD');
define('DB_NAME', 'TM_db');
define('DB_CHARSET', 'utf8');

// Server settings (was previously defined in connector.php)
define('LOCAL_SERVER_ADDRESS', 'SERVER_ADDRESS_HERE');
define('NODE_SERVER_URL', 'http://'.LOCAL_SERVER_ADDRESS.':8081/new-data');

// Session & other settings
define('SESSION_TIMEOUT', 3600); // seconds

// ------------ TrackMateAI related settings

// Munkaidő beállítások
define('MUNKA_KEZDES', '06:30');
define('MUNKA_VEGE', '14:00');
define('MIN_NAPI_ORA', 4.0);

// Bejegyzés minőség
define('MIN_BEJEGYZES_HOSSZ', 10);

// Gemini API
define('GEMINI_API_KEY', 'API_KEY_HERE');
define('GEMINI_MODEL', 'gemini-2.5-flash'); //Gemini 2.5 Flash⚡ Nagyon jó  250 req/nap  10RPM		Legjobb ár/érték
?>
