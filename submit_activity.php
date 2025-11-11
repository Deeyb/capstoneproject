<?php
/**
 * SUBMIT ACTIVITY API (OOP Version)
 * Handles final submission of student activities (moves from draft to final)
 * Leaderboard-ready with proper scoring and timing
 */
require_once __DIR__ . '/unified_bootstrap.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/ActivitySubmissionController.php';

header('Content-Type: application/json');

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        throw new Exception('Database connection failed');
    }
    
    // Require authentication
    requireAuth();
    $userId = (int)($_SESSION['user_id'] ?? 0);
    if ($userId <= 0) {
        throw new Exception('User not authenticated');
    }
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }
    
    // Use OOP controller
    $controller = new ActivitySubmissionController($db);
    $result = $controller->handleRequest($input, $userId);
    
    echo json_encode($result);
    
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} catch (RuntimeException $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Submit activity error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} catch (Error $e) {
    error_log("Submit activity fatal error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
}
?>

