<?php
/**
 * GET USER STATUS STATS API - OOP Version
 * Gets user status statistics for admin dashboard
 */

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

try {
    $db = (new Database())->getConnection();
    $adminService = new AdminService($db);
    
    // Get user status statistics using OOP service
    $stats = $adminService->getUserStatusStats();
    
    echo json_encode($stats);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to get user status statistics',
        'message' => $e->getMessage()
    ]);
} 