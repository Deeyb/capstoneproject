<?php
// Teacher Outline API: create/update/delete modules and lessons for courses assigned to the teacher

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
// auth_helpers not required; we'll check session directly
require_once __DIR__ . '/classes/CSRFProtection.php';
require_once __DIR__ . '/classes/CourseService.php';

header('Content-Type: application/json');

function out($ok, $data = []){ echo json_encode($ok ? array_merge(['success'=>true], $data) : array_merge(['success'=>false], $data)); exit; }

if (empty($_SESSION['user_id'])) { out(false, ['message'=>'Unauthorized']); }
$userId = (int)($_SESSION['user_id']);
$role = strtolower((string)($_SESSION['user_role'] ?? ''));
if (!in_array($role, ['teacher','instructor','coordinator','admin'], true)) { out(false, ['message'=>'Forbidden']); }

$db = (new Database())->getConnection();
$svc = new CourseService($db);

$action = $_POST['action'] ?? $_GET['action'] ?? '';

// Validate CSRF for mutating actions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action !== 'get_csrf_token') {
    if (!CSRFProtection::validateToken($_POST['csrf_token'] ?? '')) {
        out(false, ['message'=>'Invalid CSRF token']);
    }
}

function teacherHasCourse($pdo, $courseId, $userId){
    try {
        $stmt = $pdo->prepare('SELECT 1 FROM course_teachers WHERE course_id=? AND user_id=?');
        $stmt->execute([(int)$courseId, (int)$userId]);
        return (bool)$stmt->fetchColumn();
    } catch (Throwable $e) { return false; }
}

function ensureTeacherHasCourse(PDO $pdo, int $courseId, int $userId): bool {
    // If already mapped, ok
    try {
        $chk = $pdo->prepare('SELECT 1 FROM course_teachers WHERE course_id=? AND user_id=?');
        $chk->execute([$courseId, $userId]);
        if ($chk->fetchColumn()) return true;
    } catch (Throwable $e) { /* fallthrough */ }
    // Allow auto-map if course is published
    try {
        $st = $pdo->prepare("SELECT status FROM courses WHERE id=? AND archived=0");
        $st->execute([$courseId]);
        $status = strtolower((string)$st->fetchColumn());
        if ($status === 'published') {
            $ins = $pdo->prepare('INSERT IGNORE INTO course_teachers (course_id, user_id) VALUES (?, ?)');
            $ins->execute([$courseId, $userId]);
            return true;
        }
    } catch (Throwable $e) { /* ignore */ }
    return false;
}

try {
    switch ($action) {
        case 'get_csrf_token':
            out(true, ['csrf_token' => CSRFProtection::generateToken()]);

        case 'module_create': {
            $courseId = (int)($_POST['course_id'] ?? 0);
            $title = trim((string)($_POST['title'] ?? ''));
            if ($courseId <= 0 || $title === '') out(false, ['message'=>'Invalid payload']);
            if (!ensureTeacherHasCourse($db, $courseId, $userId)) out(false, ['message'=>'Forbidden']);
            $id = $svc->createModule($courseId, $title, '');
            out($id > 0, ['id'=>$id]);
        }

        case 'lesson_create': {
            $moduleId = (int)($_POST['module_id'] ?? 0);
            $title = trim((string)($_POST['title'] ?? ''));
            if ($moduleId <= 0 || $title === '') out(false, ['message'=>'Invalid payload']);
            // Verify module belongs to a course the teacher has
            $q = $db->prepare('SELECT course_id FROM course_modules WHERE id=?');
            $q->execute([$moduleId]);
            $courseId = (int)($q->fetchColumn() ?: 0);
            if ($courseId <= 0 || !teacherHasCourse($db, $courseId, $userId)) out(false, ['message'=>'Forbidden']);
            $id = $svc->createLesson($moduleId, $title);
            out($id > 0, ['id'=>$id]);
        }

        case 'module_update': {
            $moduleId = (int)($_POST['module_id'] ?? 0);
            $title = trim((string)($_POST['title'] ?? ''));
            if ($moduleId <= 0 || $title === '') out(false, ['message'=>'Invalid payload']);
            // Verify module belongs to a course the teacher has
            $q = $db->prepare('SELECT course_id FROM course_modules WHERE id=?');
            $q->execute([$moduleId]);
            $courseId = (int)($q->fetchColumn() ?: 0);
            if ($courseId <= 0 || !teacherHasCourse($db, $courseId, $userId)) out(false, ['message'=>'Forbidden']);
            $stmt = $db->prepare('UPDATE course_modules SET title = ? WHERE id = ?');
            $success = $stmt->execute([$title, $moduleId]);
            out($success);
        }

        case 'module_delete': {
            $moduleId = (int)($_POST['module_id'] ?? 0);
            if ($moduleId <= 0) out(false, ['message'=>'Invalid payload']);
            // Verify module belongs to a course the teacher has
            $q = $db->prepare('SELECT course_id FROM course_modules WHERE id=?');
            $q->execute([$moduleId]);
            $courseId = (int)($q->fetchColumn() ?: 0);
            if ($courseId <= 0 || !teacherHasCourse($db, $courseId, $userId)) out(false, ['message'=>'Forbidden']);
            $stmt = $db->prepare('DELETE FROM course_modules WHERE id = ?');
            $success = $stmt->execute([$moduleId]);
            out($success);
        }

        case 'lesson_update': {
            $lessonId = (int)($_POST['lesson_id'] ?? 0);
            $title = trim((string)($_POST['title'] ?? ''));
            if ($lessonId <= 0 || $title === '') out(false, ['message'=>'Invalid payload']);
            // Verify lesson belongs to a course the teacher has
            $q = $db->prepare('SELECT cm.course_id FROM course_lessons cl JOIN course_modules cm ON cl.module_id = cm.id WHERE cl.id=?');
            $q->execute([$lessonId]);
            $courseId = (int)($q->fetchColumn() ?: 0);
            if ($courseId <= 0 || !teacherHasCourse($db, $courseId, $userId)) out(false, ['message'=>'Forbidden']);
            $stmt = $db->prepare('UPDATE course_lessons SET title = ? WHERE id = ?');
            $success = $stmt->execute([$title, $lessonId]);
            out($success);
        }

        case 'lesson_delete': {
            $lessonId = (int)($_POST['lesson_id'] ?? 0);
            if ($lessonId <= 0) out(false, ['message'=>'Invalid payload']);
            // Verify lesson belongs to a course the teacher has
            $q = $db->prepare('SELECT cm.course_id FROM course_lessons cl JOIN course_modules cm ON cl.module_id = cm.id WHERE cl.id=?');
            $q->execute([$lessonId]);
            $courseId = (int)($q->fetchColumn() ?: 0);
            if ($courseId <= 0 || !teacherHasCourse($db, $courseId, $userId)) out(false, ['message'=>'Forbidden']);
            $stmt = $db->prepare('DELETE FROM course_lessons WHERE id = ?');
            $success = $stmt->execute([$lessonId]);
            out($success);
        }

        case 'topic_create': {
            $lessonId = (int)($_POST['lesson_id'] ?? 0);
            $title = trim((string)($_POST['title'] ?? ''));
            if ($lessonId <= 0 || $title === '') out(false, ['message'=>'Invalid payload']);
            // Verify lesson belongs to a course the teacher has
            $q = $db->prepare('SELECT cm.course_id FROM course_lessons cl JOIN course_modules cm ON cl.module_id = cm.id WHERE cl.id=?');
            $q->execute([$lessonId]);
            $courseId = (int)($q->fetchColumn() ?: 0);
            if ($courseId <= 0 || !teacherHasCourse($db, $courseId, $userId)) out(false, ['message'=>'Forbidden']);
            $stmt = $db->prepare('INSERT INTO course_topics (lesson_id, title, created_at) VALUES (?, ?, NOW())');
            $success = $stmt->execute([$lessonId, $title]);
            $id = $success ? $db->lastInsertId() : 0;
            out($success, ['id'=>$id]);
        }

        case 'topic_update': {
            $topicId = (int)($_POST['topic_id'] ?? 0);
            $title = trim((string)($_POST['title'] ?? ''));
            if ($topicId <= 0 || $title === '') out(false, ['message'=>'Invalid payload']);
            // Verify topic belongs to a course the teacher has
            $q = $db->prepare('SELECT cm.course_id FROM course_topics ct JOIN course_lessons cl ON ct.lesson_id = cl.id JOIN course_modules cm ON cl.module_id = cm.id WHERE ct.id=?');
            $q->execute([$topicId]);
            $courseId = (int)($q->fetchColumn() ?: 0);
            if ($courseId <= 0 || !teacherHasCourse($db, $courseId, $userId)) out(false, ['message'=>'Forbidden']);
            $stmt = $db->prepare('UPDATE course_topics SET title = ? WHERE id = ?');
            $success = $stmt->execute([$title, $topicId]);
            out($success);
        }

        case 'topic_delete': {
            $topicId = (int)($_POST['topic_id'] ?? 0);
            if ($topicId <= 0) out(false, ['message'=>'Invalid payload']);
            // Verify topic belongs to a course the teacher has
            $q = $db->prepare('SELECT cm.course_id FROM course_topics ct JOIN course_lessons cl ON ct.lesson_id = cl.id JOIN course_modules cm ON cl.module_id = cm.id WHERE ct.id=?');
            $q->execute([$topicId]);
            $courseId = (int)($q->fetchColumn() ?: 0);
            if ($courseId <= 0 || !teacherHasCourse($db, $courseId, $userId)) out(false, ['message'=>'Forbidden']);
            $stmt = $db->prepare('DELETE FROM course_topics WHERE id = ?');
            $success = $stmt->execute([$topicId]);
            out($success);
        }

        default:
            out(false, ['message'=>'Unknown action']);
    }
} catch (Throwable $e) {
    out(false, ['message'=>'Server error']);
}


