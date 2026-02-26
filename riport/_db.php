<?php
declare(strict_types=1);

@session_start();
header('Content-Type: application/json; charset=utf-8');

// Connector betöltés
require_once('/var/www/html/server_ini/connector.php');

// --- Helpers ---
function json_out($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function require_param(string $name): string {
    if (!isset($_GET[$name]) || trim((string)$_GET[$name]) === '') {
        json_out(['error' => "Missing parameter: $name"], 400);
    }
    return trim((string)$_GET[$name]);
}

function require_int(string $name): int {
    $v = require_param($name);
    if (!ctype_digit($v)) {
        json_out(['error' => "Invalid integer: $name"], 400);
    }
    return (int)$v;
}

function require_date(string $name): string {
    $v = require_param($name);
    // YYYY-MM-DD
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $v)) {
        json_out(['error' => "Invalid date format (YYYY-MM-DD): $name"], 400);
    }
    return $v;
}

function db_all(string $sql): array {
    $res = kerdes($sql);
    if ($res === false) {
        json_out(['error' => 'SQL error'], 500);
    }
    $rows = [];
    while ($row = mysqli_fetch_assoc($res)) {
        $rows[] = $row;
    }
    return $rows;
}

function db_one(string $sql): ?array {
    $rows = db_all($sql);
    return $rows[0] ?? null;
}

function esc($v): string {
    // a connectorben van escapeInput()
    return escapeInput((string)$v);
}
