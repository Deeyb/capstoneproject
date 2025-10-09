<?php
session_start();

// Check if user is logged in and is a coordinator (case-insensitive)
if (!isset($_SESSION['user_role']) || strtoupper($_SESSION['user_role']) !== 'COORDINATOR') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

header('Content-Type: application/json');
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/CoordinatorService.php';

try {
    // Database connection
    $db = (new Database())->getConnection();
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    $coordinatorService = new CoordinatorService($db);
    
    // Get recent registrations for teachers and students only
    $recentRegistrations = $coordinatorService->getRecentRegistrationsByRoles(['TEACHER', 'STUDENT'], 10);
    
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

