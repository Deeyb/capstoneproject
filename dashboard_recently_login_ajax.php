<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();

// Debug logging
error_log('Session data in recently login: ' . print_r($_SESSION, true));

// Check if user is logged in and is an admin or coordinator (case-insensitive)
if (!isset($_SESSION['user_role']) || !in_array(strtoupper($_SESSION['user_role']), ['ADMIN', 'COORDINATOR'])) {
    http_response_code(403);
    error_log('Access denied. User role: ' . ($_SESSION['user_role'] ?? 'not set'));
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