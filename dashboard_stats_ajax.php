<?php
session_start();

// Check if user is logged in and is an admin or coordinator (case-insensitive)
if (!isset($_SESSION['user_role']) || !in_array(strtoupper($_SESSION['user_role']), ['ADMIN', 'COORDINATOR'])) {
    http_response_code(403);
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
    
    // Get all statistics
    $response = $adminService->getDashboardStats();
    
    echo json_encode($response);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
    error_log($e->getMessage());
} 