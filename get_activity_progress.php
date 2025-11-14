<?php
/**
 * GET ACTIVITY PROGRESS API - OOP Version
 * Retrieves saved progress for a specific activity and user (draft storage)
 */
// Start output buffering to prevent any output before JSON
ob_start();

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/ActivityProgressController.php';

header('Content-Type: application/json');

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        throw new Exception('Database connection failed');
    }
    
    $activityId = (int)($_GET['activity_id'] ?? 0);
    $userId = (int)($_GET['user_id'] ?? 0);
    
    if ($activityId <= 0 || $userId <= 0) {
        throw new InvalidArgumentException('Invalid activity_id or user_id');
    }
    
    // Use OOP controller
    $controller = new ActivityProgressController($db);
    $result = $controller->getProgress($activityId, $userId);
    
    // Clean output buffer and send JSON
    ob_clean();
    echo json_encode($result);
    exit;
    
} catch (InvalidArgumentException $e) {
    ob_clean();
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    exit;
} catch (Exception $e) {
    ob_clean();
    error_log("Get activity progress error: " . $e->getMessage() . " | Trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error: ' . $e->getMessage()
    ]);
    exit;
} catch (Error $e) {
    ob_clean();
    error_log("Get activity progress fatal error: " . $e->getMessage() . " | Trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
    exit;
}
?>

