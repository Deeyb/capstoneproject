<?php
// Teacher Materials API - handles teacher-only material CRUD operations
// Security: checks teacher role, course ownership, CSRF (for POST), and file validations

// CRITICAL: Set session path BEFORE any session_start() calls
$sessionPath = __DIR__ . '/sessions';
if (!is_dir($sessionPath)) {
    @mkdir($sessionPath, 0777, true);
}
if (is_dir($sessionPath) && is_writable($sessionPath)) {
    ini_set('session.save_path', $sessionPath);
}

// Set session name before starting
if (session_status() === PHP_SESSION_NONE) {
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

require_once __DIR__ . '/config/Database.php';
// No global helper used; rely on session
require_once __DIR__ . '/classes/CSRFProtection.php';
require_once __DIR__ . '/classes/CourseService.php';

header('Content-Type: application/json');

function respond($ok, $data = []){
    echo json_encode($ok ? array_merge(['success'=>true], $data) : array_merge(['success'=>false], $data));
    exit;
}

// Auth: must be logged-in teacher (or admin/coordinator allowed)
if (empty($_SESSION['user_id'])) { respond(false, ['message' => 'Unauthorized']); }
$sessionRole = strtolower((string)($_SESSION['user_role'] ?? ''));
// Allow teacher/admin/coordinator, but this API is intended for teachers
$isTeacher = in_array($sessionRole, ['teacher','instructor'], true);
$isAdminOrCoord = in_array($sessionRole, ['admin','coordinator'], true);
if (!$isTeacher && !$isAdminOrCoord) {
    respond(false, ['message' => 'Forbidden']);
}

$db = (new Database())->getConnection();
$svc = new CourseService($db);

$action = $_POST['action'] ?? $_GET['action'] ?? '';

// CSRF for mutating actions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action !== 'get_csrf_token') {
    if (!CSRFProtection::validateToken($_POST['csrf_token'] ?? '')) {
        respond(false, ['message' => 'Invalid CSRF token']);
    }
}

// Helper: verify lesson belongs to a course available to this teacher
function ensureTeacherCanAccessLesson(PDO $db, $lessonId, $userId){
    // Fetch course outline to find lesson
    try {
        $lessonId = (int)$lessonId;
        if ($lessonId <= 0) return false;
        // Find course via lesson
        $stmt = $db->prepare('SELECT m.course_id FROM course_lessons l JOIN course_modules m ON l.module_id = m.id WHERE l.id = ?');
        $stmt->execute([$lessonId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) return false;
        $courseId = (int)$row['course_id'];
        // Ensure course is assigned to teacher
        $stmt2 = $db->prepare('SELECT 1 FROM course_teachers WHERE course_id = ? AND user_id = ?');
        $stmt2->execute([$courseId, $userId]);
        return (bool)$stmt2->fetchColumn();
    } catch (Throwable $e) {
        return false;
    }
}

try {
    switch ($action) {
        case 'get_csrf_token':
            respond(true, ['csrf_token' => CSRFProtection::generateToken()]);

        case 'material_upload': {
            $lessonId = $_POST['lesson_id'] ?? null;
            $type = $_POST['type'] ?? 'file';
            $title = trim($_POST['title'] ?? '');
            if (!$lessonId || !ensureTeacherCanAccessLesson($db, $lessonId, (int)$_SESSION['user_id'])) {
                respond(false, ['message' => 'Forbidden']);
            }
            if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
                respond(false, ['message' => 'No file uploaded']);
            }
            // Delegate to CourseService to save uploaded file as material
            $saved = $svc->saveUploadedMaterial((int)$lessonId, $_FILES['file']);
            if (is_array($saved) && !empty($saved['success']) && !empty($saved['id'])) {
                respond(true, ['id' => $saved['id']]);
            }
            respond(false, ['message' => is_array($saved) ? ($saved['message'] ?? 'Upload failed') : 'Upload failed']);
        }

        case 'material_create': {
            $lessonId = $_POST['lesson_id'] ?? null;
            $type = $_POST['type'] ?? '';
            $title = trim($_POST['title'] ?? '');
            $url = trim($_POST['url'] ?? '');
            if (!$lessonId || !ensureTeacherCanAccessLesson($db, $lessonId, (int)$_SESSION['user_id'])) {
                respond(false, ['message' => 'Forbidden']);
            }
            if ($type === 'link' && !$url) {
                respond(false, ['message' => 'URL required']);
            }
            // Map title to filename column for display
            $filename = $title !== '' ? $title : null;
            $id = $svc->addMaterial((int)$lessonId, $type, $url ?: null, $filename, null);
            if ($id) respond(true, ['id' => $id]);
            respond(false, ['message' => 'Create failed']);
        }

        case 'material_update': {
            $materialId = (int)($_POST['material_id'] ?? 0);
            if ($materialId <= 0) respond(false, ['message' => 'Invalid id']);
            // Verify ownership via join
            $stmt = $db->prepare('SELECT lesson_id FROM lesson_materials WHERE id = ?');
            $stmt->execute([$materialId]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row || !ensureTeacherCanAccessLesson($db, $row['lesson_id'], (int)$_SESSION['user_id'])) {
                respond(false, ['message' => 'Forbidden']);
            }
            $data = [];
            if (isset($_POST['url'])) $data['url'] = trim($_POST['url']);
            if (isset($_POST['title'])) $data['filename'] = trim($_POST['title']);
            $ok = $svc->updateMaterial($materialId, $data);
            respond((bool)$ok);
        }

        case 'material_delete': {
            $materialId = (int)($_POST['material_id'] ?? 0);
            if ($materialId <= 0) respond(false, ['message' => 'Invalid id']);
            $stmt = $db->prepare('SELECT lesson_id FROM lesson_materials WHERE id = ?');
            $stmt->execute([$materialId]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row || !ensureTeacherCanAccessLesson($db, $row['lesson_id'], (int)$_SESSION['user_id'])) {
                respond(false, ['message' => 'Forbidden']);
            }
            $ok = $svc->deleteMaterial($materialId);
            respond((bool)$ok);
        }

        default:
            respond(false, ['message' => 'Unknown action']);
    }
} catch (Throwable $e) {
    respond(false, ['message' => 'Server error']);
}



