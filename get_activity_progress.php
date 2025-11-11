<?php
/**
 * GET ACTIVITY PROGRESS API - OOP Version
 * Retrieves saved progress for a specific activity and user (draft storage)
 */
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
    
    // Use OOP controller
    $controller = new ActivityProgressController($db);
    $result = $controller->getProgress($activityId, $userId);
    
    echo json_encode($result);
    
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} catch (Error $e) {
    error_log("Get activity progress error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
}
?>

