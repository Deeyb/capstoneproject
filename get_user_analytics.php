<?php
session_start();

// Check if user is logged in and is an admin
if (!isset($_SESSION['user_role']) || strtoupper($_SESSION['user_role']) !== 'ADMIN') {
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
    
    // Get the analytics type from request
    $type = $_GET['type'] ?? 'overview';
    $days = (int)($_GET['days'] ?? 30);
    $months = (int)($_GET['months'] ?? 12);
    
    $response = [];
    
    switch ($type) {
        case 'overview':
            $response = $userManager->getUserEngagementMetrics();
            break;
            
        case 'registration_trends':
            $response = $userManager->getUserRegistrationTrends($days);
            break;
            
        case 'registration_by_role':
            $response = $userManager->getUserRegistrationTrendsByRole($days);
            break;
            
        case 'login_frequency':
            $response = $userManager->getLoginFrequencyAnalysis($days);
            break;
            
        case 'monthly_stats':
            $response = $userManager->getMonthlyUserStats($months);
            break;
            
        case 'activity_summary':
            $response = $userManager->getUserActivitySummary($days);
            break;
            
        case 'top_active':
            $limit = (int)($_GET['limit'] ?? 10);
            $response = $userManager->getTopActiveUsers($limit);
            break;
            
        case 'status_trends':
            $response = $userManager->getUserStatusTrends($days);
            break;
            
        default:
            $response = ['error' => 'Invalid analytics type'];
            break;
    }
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
    error_log("Analytics error: " . $e->getMessage());
}
?> 