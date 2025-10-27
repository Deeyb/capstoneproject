<?php
/**
 * TEACHER CLASS API - OOP Version
 * Handle class-specific modules, lessons, topics, and materials
 */
session_start();

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/CSRFProtection.php';
require_once __DIR__ . '/classes/TeacherClassService.php';

header('Content-Type: application/json');

function out($ok, $data = []){ 
    echo json_encode($ok ? array_merge(['success'=>true], $data) : array_merge(['success'=>false], $data)); 
    exit; 
}

// Authentication check
if (empty($_SESSION['user_id'])) { 
    out(false, ['message'=>'Unauthorized']); 
}

$userId = (int)($_SESSION['user_id']);

try {
    $db = (new Database())->getConnection();
    $service = new TeacherClassService($db);
} catch (Exception $e) {
    out(false, ['message' => 'Database connection failed']);
}
$role = strtolower((string)($_SESSION['user_role'] ?? ''));

if (!in_array($role, ['teacher','instructor','coordinator','admin'], true)) { 
    out(false, ['message'=>'Forbidden']); 
}

$db = (new Database())->getConnection();
$action = $_POST['action'] ?? $_GET['action'] ?? '';

// Validate CSRF for mutating actions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action !== 'get_csrf_token') {
    if (!CSRFProtection::validateToken($_POST['csrf_token'] ?? '')) {
        out(false, ['message'=>'Invalid CSRF token']);
    }
}

try {
    switch ($action) {
        case 'get_csrf_token':
            out(true, ['csrf_token' => CSRFProtection::generateToken()]);

        case 'class_modules_list': {
            $classId = (int)($_GET['class_id'] ?? 0);
            if ($classId <= 0) out(false, ['message'=>'Invalid class ID']);
            
            $result = $service->getClassModules($classId, $userId);
            out($result['success'], $result);
        }

        case 'class_module_create': {
            $classId = (int)($_POST['class_id'] ?? 0);
            $title = trim((string)($_POST['title'] ?? ''));
            if ($classId <= 0 || $title === '') out(false, ['message'=>'Invalid payload']);
            
            $data = [
                'title' => $title,
                'description' => $_POST['description'] ?? '',
                'order_index' => $_POST['order_index'] ?? 0
            ];
            
            $result = $service->createClassModule($classId, $userId, $data);
            out($result['success'], $result);
        }

        case 'class_module_update': {
            $moduleId = (int)($_POST['module_id'] ?? 0);
            $title = trim((string)($_POST['title'] ?? ''));
            if ($moduleId <= 0 || $title === '') out(false, ['message'=>'Invalid payload']);
            
            $data = [
                'title' => $title,
                'description' => $_POST['description'] ?? '',
                'order_index' => $_POST['order_index'] ?? 0
            ];
            
            $result = $service->updateClassModule($moduleId, $userId, $data);
            out($result['success'], $result);
        }

        case 'class_module_delete': {
            $moduleId = (int)($_POST['module_id'] ?? 0);
            if ($moduleId <= 0) out(false, ['message'=>'Invalid payload']);
            
            $result = $service->deleteClassModule($moduleId, $userId);
            out($result['success'], $result);
        }

        case 'class_lesson_create': {
            $classId = (int)($_POST['class_id'] ?? 0);
            $moduleId = (int)($_POST['module_id'] ?? 0);
            $title = trim((string)($_POST['title'] ?? ''));
            if ($classId <= 0 || $moduleId <= 0 || $title === '') out(false, ['message'=>'Invalid payload']);
            if (!teacherOwnsClass($db, $classId, $userId)) out(false, ['message'=>'Forbidden']);
            
            // Verify module belongs to class
            $stmt = $db->prepare('SELECT 1 FROM class_modules WHERE id = ? AND class_id = ?');
            $stmt->execute([$moduleId, $classId]);
            if (!$stmt->fetchColumn()) out(false, ['message'=>'Module not found']);
            
            // Get next position
            $stmt = $db->prepare('SELECT MAX(position) FROM class_lessons WHERE class_id = ? AND module_id = ?');
            $stmt->execute([$classId, $moduleId]);
            $nextPosition = (int)$stmt->fetchColumn() + 1;
            
            $stmt = $db->prepare('INSERT INTO class_lessons (class_id, module_id, title, position) VALUES (?, ?, ?, ?)');
            $success = $stmt->execute([$classId, $moduleId, $title, $nextPosition]);
            $id = $success ? $db->lastInsertId() : 0;
            out($success, ['id' => $id]);
        }

        case 'class_lesson_update': {
            $lessonId = (int)($_POST['lesson_id'] ?? 0);
            $title = trim((string)($_POST['title'] ?? ''));
            if ($lessonId <= 0 || $title === '') out(false, ['message'=>'Invalid payload']);
            
            // Verify ownership through class
            $stmt = $db->prepare('SELECT c.id FROM class_lessons cl JOIN classes c ON cl.class_id = c.id WHERE cl.id = ? AND c.owner_user_id = ?');
            $stmt->execute([$lessonId, $userId]);
            if (!$stmt->fetchColumn()) out(false, ['message'=>'Forbidden']);
            
            $stmt = $db->prepare('UPDATE class_lessons SET title = ? WHERE id = ?');
            $success = $stmt->execute([$title, $lessonId]);
            out($success);
        }

        case 'class_lesson_delete': {
            $lessonId = (int)($_POST['lesson_id'] ?? 0);
            if ($lessonId <= 0) out(false, ['message'=>'Invalid payload']);
            
            // Verify ownership through class
            $stmt = $db->prepare('SELECT c.id FROM class_lessons cl JOIN classes c ON cl.class_id = c.id WHERE cl.id = ? AND c.owner_user_id = ?');
            $stmt->execute([$lessonId, $userId]);
            if (!$stmt->fetchColumn()) out(false, ['message'=>'Forbidden']);
            
            $stmt = $db->prepare('DELETE FROM class_lessons WHERE id = ?');
            $success = $stmt->execute([$lessonId]);
            out($success);
        }

        case 'class_topic_create': {
            $classId = (int)($_POST['class_id'] ?? 0);
            $lessonId = (int)($_POST['lesson_id'] ?? 0);
            $title = trim((string)($_POST['title'] ?? ''));
            if ($classId <= 0 || $lessonId <= 0 || $title === '') out(false, ['message'=>'Invalid payload']);
            if (!teacherOwnsClass($db, $classId, $userId)) out(false, ['message'=>'Forbidden']);
            
            // Verify lesson belongs to class
            $stmt = $db->prepare('SELECT 1 FROM class_lessons WHERE id = ? AND class_id = ?');
            $stmt->execute([$lessonId, $classId]);
            if (!$stmt->fetchColumn()) out(false, ['message'=>'Lesson not found']);
            
            // Get next position
            $stmt = $db->prepare('SELECT MAX(position) FROM class_topics WHERE class_id = ? AND lesson_id = ?');
            $stmt->execute([$classId, $lessonId]);
            $nextPosition = (int)$stmt->fetchColumn() + 1;
            
            $stmt = $db->prepare('INSERT INTO class_topics (class_id, lesson_id, title, position) VALUES (?, ?, ?, ?)');
            $success = $stmt->execute([$classId, $lessonId, $title, $nextPosition]);
            $id = $success ? $db->lastInsertId() : 0;
            out($success, ['id' => $id]);
        }

        case 'class_topic_update': {
            $topicId = (int)($_POST['topic_id'] ?? 0);
            $title = trim((string)($_POST['title'] ?? ''));
            if ($topicId <= 0 || $title === '') out(false, ['message'=>'Invalid payload']);
            
            // Verify ownership through class
            $stmt = $db->prepare('SELECT c.id FROM class_topics ct JOIN classes c ON ct.class_id = c.id WHERE ct.id = ? AND c.owner_user_id = ?');
            $stmt->execute([$topicId, $userId]);
            if (!$stmt->fetchColumn()) out(false, ['message'=>'Forbidden']);
            
            $stmt = $db->prepare('UPDATE class_topics SET title = ? WHERE id = ?');
            $success = $stmt->execute([$title, $topicId]);
            out($success);
        }

        case 'class_topic_delete': {
            $topicId = (int)($_POST['topic_id'] ?? 0);
            if ($topicId <= 0) out(false, ['message'=>'Invalid payload']);
            
            // Verify ownership through class
            $stmt = $db->prepare('SELECT c.id FROM class_topics ct JOIN classes c ON ct.class_id = c.id WHERE ct.id = ? AND c.owner_user_id = ?');
            $stmt->execute([$topicId, $userId]);
            if (!$stmt->fetchColumn()) out(false, ['message'=>'Forbidden']);
            
            $stmt = $db->prepare('DELETE FROM class_topics WHERE id = ?');
            $success = $stmt->execute([$topicId]);
            out($success);
        }

        default:
            out(false, ['message'=>'Unknown action']);
    }
} catch (Throwable $e) {
    out(false, ['message'=>'Server error: ' . $e->getMessage()]);
}
?>

