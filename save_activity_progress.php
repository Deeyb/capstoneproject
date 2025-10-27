<?php
/**
 * SAVE ACTIVITY PROGRESS API - OOP Version
 * Saves student progress for activities to the database
 */
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/ActivityProgressService.php';

header('Content-Type: application/json');

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        throw new Exception('Database connection failed');
    }
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }
    
    $activityId = (int)($input['activity_id'] ?? 0);
    $userId = (int)($input['user_id'] ?? 0);
    $answers = $input['answers'] ?? [];
    $score = $input['score'] ?? null;
    $completed = (bool)($input['completed'] ?? false);
    
    // Initialize service
    $progressService = new ActivityProgressService($db);
    
    // Save progress using OOP service
    $result = $progressService->saveActivityProgress($activityId, $userId, $answers, $score, $completed);
    
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
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} catch (Error $e) {
    error_log("Save activity progress error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
}
?>

