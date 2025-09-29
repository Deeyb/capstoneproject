<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();

// Debug logging
error_log('Session data in recently registered: ' . print_r($_SESSION, true));

// Check if user is logged in and is an admin or coordinator (case-insensitive)
if (!isset($_SESSION['user_role']) || !in_array(strtoupper($_SESSION['user_role']), ['ADMIN', 'COORDINATOR'])) {
    http_response_code(403);
    error_log('Access denied. User role: ' . ($_SESSION['user_role'] ?? 'not set'));
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

header('Content-Type: application/json');
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/AdminService.php';

try {
    // Database connection
    $db = (new Database())->getConnection();
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    $adminService = new AdminService($db);
    
    // Get recent registrations (last 10)
    $recentRegistrations = $adminService->getRecentRegistrations(10);
    
    // Format the data for response
    $response = array_map(function($user) {
        $lastname = $user['lastname'] ?? '';
        $firstname = $user['firstname'] ?? '';
        $middlename = $user['middlename'] ?? '';
        $middle_initial = $middlename ? strtoupper(mb_substr(trim($middlename), 0, 1)) . '.' : '';
        return [
            'name' => trim($lastname . ', ' . $firstname . ' ' . $middle_initial),
            'role' => $user['role'],
            'time' => date('M j, Y g:i A', strtotime($user['created_at']))
        ];
    }, $recentRegistrations);
    
    echo json_encode($response);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
    error_log($e->getMessage());
} 