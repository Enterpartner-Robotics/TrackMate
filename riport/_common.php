<?php
declare(strict_types=1);

// Session + connector (ugyanaz, mint az indexben)
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}
include_once('/var/www/html/server_ini/connector.php');

// Debug (ha kell)
error_reporting(E_ALL);
ini_set('display_errors', '1');

header('Content-Type: application/json; charset=utf-8');

function json_out($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function require_login(): void {
    // Nálatok az index logikája alapján: ha nincs session, akkor nincs jogosultság.
    if (!isset($_SESSION['felh_id']) || (int)$_SESSION['felh_id'] <= 0) {
        json_out(['error' => 'Not authenticated'], 401);
    }
}

function require_int(string $key): int {
    if (!isset($_GET[$key]) || $_GET[$key] === '') json_out(['error' => "Missing: $key"], 400);
    if (!ctype_digit((string)$_GET[$key])) json_out(['error' => "Invalid int: $key"], 400);
    return (int)$_GET[$key];
}

function require_date(string $key): string {
    if (!isset($_GET[$key]) || $_GET[$key] === '') json_out(['error' => "Missing: $key"], 400);
    $v = (string)$_GET[$key];
    $dt = DateTime::createFromFormat('Y-m-d', $v);
    if (!$dt || $dt->format('Y-m-d') !== $v) json_out(['error' => "Invalid date (Y-m-d): $key"], 400);
    return $v;
}

function db_mode(): string {
    global $pdo, $conn;
    if (isset($pdo) && $pdo instanceof PDO) return 'pdo';
    if (isset($conn) && $conn instanceof mysqli) return 'mysqli';
    json_out(['error' => 'DB connector not found ($pdo or $conn).'], 500);
    return 'none';
}
