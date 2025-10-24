<?php
/**
 * SAVE ACTIVITY PROGRESS API
 * Saves student progress for activities to the database
 */
require_once __DIR__ . '/config/Database.php';

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
    $progressPercentage = (int)($input['progress_percentage'] ?? 0);
    $lastUpdated = $input['last_updated'] ?? date('Y-m-d H:i:s');
    
    if ($activityId <= 0) {
        throw new Exception('Invalid activity ID');
    }
    
    // Create or update progress record
    $stmt = $db->prepare("
        INSERT INTO activity_progress (
            activity_id, 
            user_id, 
            answers, 
            progress_percentage, 
            last_updated, 
            created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            answers = VALUES(answers),
            progress_percentage = VALUES(progress_percentage),
            last_updated = VALUES(last_updated),
            updated_at = NOW()
    ");
    
    $answersJson = json_encode($answers);
    
    $result = $stmt->execute([
        $activityId,
        $userId,
        $answersJson,
        $progressPercentage,
        $lastUpdated
    ]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Progress saved successfully',
            'data' => [
                'activity_id' => $activityId,
                'user_id' => $userId,
                'progress_percentage' => $progressPercentage,
                'answers_count' => count($answers)
            ]
        ]);
    } else {
        throw new Exception('Failed to save progress');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>

