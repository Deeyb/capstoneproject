<?php
// Lightweight endpoint to compute total points for an activity
if (session_status() === PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/config/Database.php';
header('Content-Type: application/json');

try {
    $db = (new Database())->getConnection();
    $activityId = (int)($_GET['activity_id'] ?? 0);
    if ($activityId <= 0) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'Invalid id']); exit; }

    // Get base activity
    $stmt = $db->prepare('SELECT id, type, max_score FROM lesson_activities WHERE id=?');
    $stmt->execute([$activityId]);
    $act = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$act) { http_response_code(404); echo json_encode(['success'=>false,'message'=>'Not found']); exit; }

    $type = strtolower((string)($act['type'] ?? ''));
    if ($type === 'coding' || $type === 'upload_based') {
        $max = (int)($act['max_score'] ?? 0);
        echo json_encode(['success'=>true,'points'=>$max]);
        exit;
    }

    // Sum question points if present
    $qs = $db->prepare('SELECT COALESCE(SUM(points),0) AS total FROM activity_questions WHERE activity_id=?');
    $qs->execute([$activityId]);
    $row = $qs->fetch(PDO::FETCH_ASSOC);
    $total = (int)($row['total'] ?? 0);
    if ($total <= 0) { $total = (int)($act['max_score'] ?? 0); }

    echo json_encode(['success'=>true,'points'=>$total]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Server error']);
}
?>


