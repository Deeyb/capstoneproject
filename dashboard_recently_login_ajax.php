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

// Check if user is logged in and is an admin or coordinator (case-insensitive)
if (!isset($_SESSION['user_role']) || !in_array(strtoupper($_SESSION['user_role']), ['ADMIN', 'COORDINATOR'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

header('Content-Type: application/json');
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/UserManager.php';

try {
    // Database connection
    $db = (new Database())->getConnection();
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    $userManager = new UserManager($db);
    
    // Get recent logins (last 10)
    $recentLogins = $userManager->getRecentLogins(10);
    
    // Format the data for response
    $response = array_map(function($login) {
        // Middlename may not be present in this query; show Lastname, Firstname format
        $lastname = $login['lastname'] ?? '';
        $firstname = $login['firstname'] ?? '';
        return [
            'name' => trim($lastname . ', ' . $firstname),
            'role' => $login['role'],
            'time' => date('M j, Y g:i A', strtotime($login['last_login']))
        ];
    }, $recentLogins);
    
    echo json_encode($response);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
    error_log($e->getMessage());
} 