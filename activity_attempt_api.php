<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }
header('Content-Type: application/json');

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/auth_helpers.php';
require_once __DIR__ . '/classes/AttemptService.php';

try {
    Auth::requireAuth();
    $db = (new Database())->getConnection();
    if (!$db) { http_response_code(500); echo json_encode(['success'=>false,'message'=>'DB unavailable']); exit; }

    $attemptSvc = new AttemptService($db);
    $action = $_GET['action'] ?? 'start';

    switch ($action) {
        case 'start': {
            $activityId = isset($_POST['activity_id']) ? (int)$_POST['activity_id'] : 0;
            if ($activityId <= 0) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'Invalid activity']); exit; }
            $userId = (int)($_SESSION['user_id'] ?? 0);
            $result = $attemptSvc->startPreviewAttempt($activityId, $userId, 'teacher');
            echo json_encode(['success'=>true, 'attempt'=>$result]);
            break;
        }
        case 'submit': {
            $attemptId = isset($_POST['attempt_id']) ? (int)$_POST['attempt_id'] : 0;
            if ($attemptId <= 0) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'Invalid attempt']); exit; }
            $score = isset($_POST['score']) ? (float)$_POST['score'] : null;
            $timeMs = isset($_POST['time_spent_ms']) ? (int)$_POST['time_spent_ms'] : null;
            $ok = $attemptSvc->submitAttempt($attemptId, $score, $timeMs);
            echo json_encode(['success'=>$ok]);
            break;
        }
        case 'result': {
            $attemptId = isset($_GET['attempt_id']) ? (int)$_GET['attempt_id'] : 0;
            if ($attemptId <= 0) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'Invalid attempt']); exit; }
            $row = $attemptSvc->getResult($attemptId);
            echo json_encode(['success'=> (bool)$row, 'result'=>$row]);
            break;
        }
        default:
            http_response_code(400);
            echo json_encode(['success'=>false,'message'=>'Unknown action']);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Server error']);
}
?>



