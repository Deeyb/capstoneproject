<?php
// Unified session bootstrap (consistent with other endpoints)
// Ensure custom save path and honor existing cookie name
if (session_status() === PHP_SESSION_NONE) {
    $sessionPath = __DIR__ . '/sessions';
    if (!is_dir($sessionPath)) { @mkdir($sessionPath, 0777, true); }
    if (is_dir($sessionPath) && is_writable($sessionPath)) {
        ini_set('session.save_path', $sessionPath);
    }
    $preferred = 'CodeRegalSession';
    $legacy = 'PHPSESSID';
    if (!empty($_COOKIE[$preferred])) {
        session_name($preferred);
    } elseif (!empty($_COOKIE[$legacy])) {
        session_name($legacy);
    } else {
        session_name($preferred);
    }
    @session_start();
}

require_once __DIR__ . '/classes/auth_helpers.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/CourseService.php';

// Manual auth check to avoid HTML redirects
if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['success'=>false,'message'=>'Not authenticated']);
    exit;
}

$db = (new Database())->getConnection();
$stmt = $db->prepare("SELECT LOWER(TRIM(role)) FROM users WHERE id=? LIMIT 1");
$stmt->execute([$_SESSION['user_id']]);
$role = $stmt->fetchColumn() ?: '';
// Allow teacher, coordinator, and admin to access uploads manager
if ($role !== 'teacher' && $role !== 'coordinator' && $role !== 'admin') {
    http_response_code(403);
    echo json_encode(['success'=>false,'message'=>'Forbidden - Teacher, Coordinator, or Admin access required']);
    exit;
}

header('Content-Type: application/json');

try {
    $svc = new CourseService($db);
    $action = $_POST['action'] ?? $_GET['action'] ?? '';
    switch ($action) {
        case 'list': {
            $filters = [
                'search' => $_GET['search'] ?? '',
                'course_id' => isset($_GET['course_id']) ? (int)$_GET['course_id'] : null,
                'module_id' => isset($_GET['module_id']) ? (int)$_GET['module_id'] : null,
                'lesson_id' => isset($_GET['lesson_id']) ? (int)$_GET['lesson_id'] : null,
                'type' => $_GET['type'] ?? '',
                'archived' => isset($_GET['archived']) ? (int)$_GET['archived'] : 0,
            ];
            $rows = $svc->listAllMaterials($filters);
            echo json_encode(['success'=>true,'data'=>$rows]);
            break;
        }
        case 'archive': {
            $ok = $svc->setMaterialArchived((int)($_POST['id'] ?? 0), true);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        }
        case 'unarchive': {
            $ok = $svc->setMaterialArchived((int)($_POST['id'] ?? 0), false);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        }
        default:
            echo json_encode(['success'=>false,'message'=>'Unknown action']);
    }
} catch (Throwable $e) {
    http_response_code(200);
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
?>

