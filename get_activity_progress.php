<?php
/**
 * GET ACTIVITY PROGRESS API - OOP Version
 * Retrieves saved progress for a specific activity and user (draft storage)
 */
// Start output buffering to prevent any output before JSON
ob_start();

// Suppress any warnings/notices that might break JSON output
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/ActivityProgressController.php';

header('Content-Type: application/json');

try {
    // Initialize database connection
    $db = null;
    try {
        $db = (new Database())->getConnection();
    } catch (Throwable $dbError) {
        error_log("Database connection error: " . $dbError->getMessage() . " | Trace: " . $dbError->getTraceAsString());
        throw new Exception('Database connection failed: ' . $dbError->getMessage());
    }
    
    if (!$db) {
        throw new Exception('Database connection returned null');
    }
    
    $activityId = (int)($_GET['activity_id'] ?? 0);
    $userId = (int)($_GET['user_id'] ?? 0);
    
    if ($activityId <= 0 || $userId <= 0) {
        throw new InvalidArgumentException('Invalid activity_id or user_id');
    }
    
    // Use OOP controller
    $controller = null;
    try {
        $controller = new ActivityProgressController($db);
    } catch (Throwable $controllerError) {
        error_log("ActivityProgressController initialization error: " . $controllerError->getMessage() . " | Trace: " . $controllerError->getTraceAsString());
        throw new Exception('Failed to initialize controller: ' . $controllerError->getMessage());
    }
    
    if (!$controller) {
        throw new Exception('Controller initialization returned null');
    }
    
    // Get progress
    $result = null;
    try {
        $result = $controller->getProgress($activityId, $userId);
    } catch (Throwable $progressError) {
        error_log("Get progress error: " . $progressError->getMessage() . " | Trace: " . $progressError->getTraceAsString());
        throw new Exception('Failed to get progress: ' . $progressError->getMessage());
    }
    
    if ($result === null) {
        throw new Exception('Controller returned null result');
    }
    
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
        'message' => 'Internal server error: ' . $e->getMessage()
    ]);
    exit;
} catch (Throwable $e) {
    ob_clean();
    error_log("Get activity progress throwable error: " . $e->getMessage() . " | Trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error: ' . $e->getMessage()
    ]);
    exit;
}
?>

