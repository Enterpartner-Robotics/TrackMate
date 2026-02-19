<?php
/**
 * TrackMate AI Modul - Konfiguráció
 * 
 * API kulcs: https://aistudio.google.com
 */

// Gemini API
define('GEMINI_API_KEY', 'API_KEY_HERE');//
define('GEMINI_MODEL', 'gemini-2.5-flash');//Gemini 2.5 Flash⚡ Nagyon jó  250 req/nap  10RPM		Legjobb ár/érték

// MySQL kapcsolat (TM_db)
define('DB_HOST', 'SERVER_ADDRESS');
define('DB_NAME', 'TM_db');
define('DB_USER', 'DB');
define('DB_PASS', 'DATABASE_PW');

// Munkaidő beállítások
define('MUNKA_KEZDES', '06:30');
define('MUNKA_VEGE', '14:00');
define('MIN_NAPI_ORA', 4.0);

// Bejegyzés minőség
define('MIN_BEJEGYZES_HOSSZ', 10);
