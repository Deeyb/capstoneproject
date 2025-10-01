<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/CourseService.php';
require_once __DIR__ . '/classes/RateLimiter.php';
require_once __DIR__ . '/classes/CSRFProtection.php';

header('Content-Type: application/json');

try {
    $db = (new Database())->getConnection();
    $svc = new CourseService($db);
    $rate = new RateLimiter($db);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Server error']);
    exit;
}

// CSRF validation for POST actions (no token needed for GET list)
$action = $_REQUEST['action'] ?? '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $earlyAction = $_POST['action'] ?? '';
    if ($earlyAction !== 'get_csrf_token') {
        $csrfToken = $_POST[CSRFProtection::getTokenName()] ?? '';
        if (!CSRFProtection::validateToken($csrfToken)) {
            echo json_encode(['success'=>false,'message'=>'Invalid CSRF token']);
            exit;
        }
    }
}

switch ($action) {
    case 'submit_attempt':
        if (empty($_SESSION['user_id'])) { echo json_encode(['success'=>false,'message'=>'Not authenticated']); break; }
        $userId = (int)$_SESSION['user_id'];
        $aid = (int)($_POST['activity_id'] ?? 0);
        $language = strtolower((string)($_POST['language'] ?? ''));
        $source = (string)($_POST['source'] ?? '');
        $results = json_decode($_POST['results'] ?? '[]', true) ?: [];
        $verdict = (string)($_POST['verdict'] ?? null);
        $score = isset($_POST['score']) ? (float)$_POST['score'] : null;
        $durationMs = isset($_POST['duration_ms']) ? (int)$_POST['duration_ms'] : null;

        if ($aid <= 0 || $language === '') { echo json_encode(['success'=>false,'message'=>'Invalid payload']); break; }

        // Basic rate limit: 20 submissions per 10 minutes per user
        $identifier = 'submit_'.$userId;
        if (!$rate->isAllowed($identifier, 'submit_attempt', 20, 600)) { echo json_encode(['success'=>false,'message'=>'Rate limit exceeded']); break; }

        $id = $svc->recordAttempt($aid, $userId, $language, $source, $results, $verdict, $score, $durationMs);
        if ($id > 0) { $rate->recordAttempt($identifier, 'submit_attempt'); echo json_encode(['success'=>true,'id'=>$id]); }
        else { echo json_encode(['success'=>false,'message'=>'Save failed']); }
        break;

    case 'list_attempts':
        // Teachers/Coordinators can view
        $role = strtolower((string)($_SESSION['user_role'] ?? ''));
        if (!in_array($role, ['teacher','coordinator','admin'])) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
        $aid = (int)($_GET['activity_id'] ?? 0);
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 25)));
        $offset = ($page-1) * $limit;
        $rows = $svc->listAttempts($aid, $offset, $limit);
        echo json_encode(['success'=>true,'data'=>$rows]);
        break;

    default:
        echo json_encode(['success'=>false,'message'=>'Unknown action']);
}
?>



