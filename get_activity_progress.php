<?php
/**
 * GET ACTIVITY PROGRESS API
 * Retrieves saved progress for a specific activity and user
 */
require_once __DIR__ . '/config/Database.php';

header('Content-Type: application/json');

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        throw new Exception('Database connection failed');
    }
    
    $activityId = (int)($_GET['activity_id'] ?? 0);
    $userId = (int)($_GET['user_id'] ?? 0);
    
    if ($activityId <= 0) {
        throw new Exception('Invalid activity ID');
    }
    
    // Get progress for this activity and user
    $stmt = $db->prepare("
        SELECT 
            id,
            activity_id,
            user_id,
            answers,
            progress_percentage,
            last_updated,
            created_at,
            updated_at
        FROM activity_progress 
        WHERE activity_id = ? AND user_id = ?
        ORDER BY updated_at DESC
        LIMIT 1
    ");
    
    $stmt->execute([$activityId, $userId]);
    $progress = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($progress) {
        // Decode JSON answers
        $progress['answers'] = json_decode($progress['answers'], true) ?: [];
        
        echo json_encode([
            'success' => true,
            'message' => 'Progress found',
            'data' => $progress
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No progress found',
            'data' => null
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>

