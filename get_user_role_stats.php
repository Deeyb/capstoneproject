<?php
// CRITICAL: Set session path BEFORE any session_start() calls
$sessionPath = __DIR__ . '/sessions';
if (!is_dir($sessionPath)) {
    @mkdir($sessionPath, 0777, true);
}
if (is_dir($sessionPath) && is_writable($sessionPath)) {
    ini_set('session.save_path', $sessionPath);
}

// Set session name before starting
if (session_status() === PHP_SESSION_NONE) {
    $preferred = 'CodeRegalSession';
    $legacy = 'PHPSESSID';
    if (!empty($_COOKIE[$preferred])) { 
        session_name($preferred); 
    } elseif (!empty($_COOKIE[$legacy])) { 
        session_name($legacy); 
    } else { 
        session_name($preferred); 
    }
    @session_start();
}

header('Content-Type: application/json');

// Admin-only
if (!isset($_SESSION['user_role']) || strtoupper($_SESSION['user_role']) !== 'ADMIN') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

require_once 'config/Database.php';
require_once 'classes/AdminService.php';

$db = (new Database())->getConnection();
$adminService = new AdminService($db);

// Output user role distribution as JSON
echo json_encode($adminService->getUserRoleDistribution()); 