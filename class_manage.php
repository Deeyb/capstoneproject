<?php
session_start();
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/auth_helpers.php';
require_once __DIR__ . '/classes/ClassService.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? ($_POST['action'] ?? '');

// Require authentication for all actions
Auth::requireAuth();

// Build DB + service
$db = (new Database())->getConnection();
if ($db === null) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database not available']);
    exit;
}
$service = new ClassService($db);

try {
    if ($action === 'generate_code') {
        // Any authenticated role can request a code; typically teacher
        $code = $service->generateUniqueCode();
        echo json_encode(['success' => true, 'code' => $code]);
        exit;
    }

    if ($action === 'list') {
        // Only teachers can list their classes
        Auth::requireRole('teacher');
        
        $ownerId = (int)($_SESSION['user_id'] ?? 0);
        $classes = $service->getClassesByOwner($ownerId);
        
        echo json_encode(['success' => true, 'classes' => $classes]);
        exit;
    }

    if ($action === 'create') {
        // Only teachers can create classes
        Auth::requireRole('teacher');

        // Support JSON or form
        $input = [];
        $raw = file_get_contents('php://input');
        if (!empty($raw) && strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) {
            $input = json_decode($raw, true) ?: [];
        } else {
            $input = $_POST;
        }
        $name = trim($input['name'] ?? '');
        $courseId = isset($input['course_id']) && $input['course_id'] !== '' ? (int)$input['course_id'] : null;
        $customCode = isset($input['code']) && $input['code'] !== '' ? strtoupper(trim($input['code'])) : null;
        $ownerId = (int)($_SESSION['user_id'] ?? 0);

        if ($ownerId <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid user']);
            exit;
        }

        $res = $service->createClass($ownerId, $name, $courseId, $customCode);
        if (!empty($res['success'])) {
            echo json_encode($res);
            exit;
        }
        http_response_code(400);
        echo json_encode($res);
        exit;
    }

    if ($action === 'delete') {
        // Only teachers can delete their own classes (dev only)
        Auth::requireRole('teacher');
        $ownerId = (int)($_SESSION['user_id'] ?? 0);
        $classId = isset($_POST['id']) ? (int)$_POST['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);
        if ($ownerId <= 0 || $classId <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid request']);
            exit;
        }
        $ok = $service->deleteClass($classId, $ownerId);
        if ($ok) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Failed to delete class']);
        }
        exit;
    }

    if ($action === 'save_outline_overrides') {
        // Only teachers can save outline overrides for their classes
        Auth::requireRole('teacher');
        
        $input = [];
        $raw = file_get_contents('php://input');
        if (!empty($raw) && strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) {
            $input = json_decode($raw, true) ?: [];
        } else {
            $input = $_POST;
        }
        
        $classId = isset($input['class_id']) ? (int)$input['class_id'] : 0;
        $courseId = isset($input['course_id']) ? (int)$input['course_id'] : 0;
        $overrides = isset($input['overrides']) ? $input['overrides'] : null;
        $ownerId = (int)($_SESSION['user_id'] ?? 0);

        if ($ownerId <= 0 || $classId <= 0 || $courseId <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid request parameters']);
            exit;
        }

        // Verify teacher owns this class
        $stmt = $db->prepare("SELECT id FROM classes WHERE id = ? AND owner_user_id = ?");
        $stmt->execute([$classId, $ownerId]);
        if (!$stmt->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }

        // Verify course exists
        $stmt = $db->prepare("SELECT id FROM courses WHERE id = ?");
        $stmt->execute([$courseId]);
        if (!$stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Course not found']);
            exit;
        }

        try {
            $overridesJson = json_encode($overrides);
            $stmt = $db->prepare("INSERT INTO class_outline_overrides (class_id, course_id, overrides) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE overrides = VALUES(overrides), updated_at = CURRENT_TIMESTAMP");
            $stmt->execute([$classId, $courseId, $overridesJson]);
            
            echo json_encode(['success' => true, 'message' => 'Outline overrides saved successfully']);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to save overrides']);
            exit;
        }
    }

    if ($action === 'load_outline_overrides') {
        // Only teachers can load outline overrides for their classes
        Auth::requireRole('teacher');
        
        $classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : 0;
        $courseId = isset($_GET['course_id']) ? (int)$_GET['course_id'] : 0;
        $ownerId = (int)($_SESSION['user_id'] ?? 0);

        if ($ownerId <= 0 || $classId <= 0 || $courseId <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid request parameters']);
            exit;
        }

        // Verify teacher owns this class
        $stmt = $db->prepare("SELECT id FROM classes WHERE id = ? AND owner_user_id = ?");
        $stmt->execute([$classId, $ownerId]);
        if (!$stmt->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }

        try {
            $stmt = $db->prepare("SELECT overrides FROM class_outline_overrides WHERE class_id = ? AND course_id = ?");
            $stmt->execute([$classId, $courseId]);
            $result = $stmt->fetch();
            
            if ($result) {
                $overrides = json_decode($result['overrides'], true);
                echo json_encode(['success' => true, 'overrides' => $overrides]);
            } else {
                echo json_encode(['success' => true, 'overrides' => null]);
            }
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to load overrides']);
            exit;
        }
    }

    if ($action === 'add_lesson_to_class') {
        // Only teachers can add lessons to their classes
        Auth::requireRole('teacher');
        
        $input = [];
        $raw = file_get_contents('php://input');
        if (!empty($raw) && strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) {
            $input = json_decode($raw, true) ?: [];
        } else {
            $input = $_POST;
        }
        
        $classId = isset($input['class_id']) ? (int)$input['class_id'] : 0;
        $courseId = isset($input['course_id']) ? (int)$input['course_id'] : 0;
        $moduleId = isset($input['module_id']) ? (int)$input['module_id'] : 0;
        $lessonTitle = trim($input['lesson_title'] ?? '');
        $ownerId = (int)($_SESSION['user_id'] ?? 0);

        if ($ownerId <= 0 || $classId <= 0 || $courseId <= 0 || $moduleId <= 0 || empty($lessonTitle)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid request parameters']);
            exit;
        }

        // Verify teacher owns this class
        $stmt = $db->prepare("SELECT id FROM classes WHERE id = ? AND owner_user_id = ?");
        $stmt->execute([$classId, $ownerId]);
        if (!$stmt->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }

        try {
            // Get current overrides or create new ones
            $stmt = $db->prepare("SELECT overrides FROM class_outline_overrides WHERE class_id = ? AND course_id = ?");
            $stmt->execute([$classId, $courseId]);
            $result = $stmt->fetch();
            
            $overrides = $result ? json_decode($result['overrides'], true) : ['modules' => []];
            if (!isset($overrides['modules']) || !is_array($overrides['modules'])) {
                $overrides['modules'] = [];
            }

            // Find the module and add the lesson
            $moduleFound = false;
            foreach ($overrides['modules'] as &$module) {
                if ($module['id'] == $moduleId) {
                    if (!isset($module['lessons'])) $module['lessons'] = [];
                    $module['lessons'][] = [
                        'id' => null, // New lesson, no ID yet
                        'title' => $lessonTitle,
                        'topics' => []
                    ];
                    $moduleFound = true;
                    break;
                }
            }

            if (!$moduleFound) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Module not found']);
                exit;
            }

            // Save updated overrides
            $overridesJson = json_encode($overrides);
            $stmt = $db->prepare("INSERT INTO class_outline_overrides (class_id, course_id, overrides) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE overrides = VALUES(overrides), updated_at = CURRENT_TIMESTAMP");
            $stmt->execute([$classId, $courseId, $overridesJson]);
            
            echo json_encode(['success' => true, 'message' => 'Lesson added successfully']);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to add lesson']);
            exit;
        }
    }

    if ($action === 'add_topic_to_class') {
        // Only teachers can add topics to their classes
        Auth::requireRole('teacher');
        
        $input = [];
        $raw = file_get_contents('php://input');
        if (!empty($raw) && strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) {
            $input = json_decode($raw, true) ?: [];
        } else {
            $input = $_POST;
        }
        
        $classId = isset($input['class_id']) ? (int)$input['class_id'] : 0;
        $courseId = isset($input['course_id']) ? (int)$input['course_id'] : 0;
        $moduleId = isset($input['module_id']) ? (int)$input['module_id'] : 0;
        $lessonId = isset($input['lesson_id']) ? (int)$input['lesson_id'] : 0;
        $topicTitle = trim($input['topic_title'] ?? '');
        $ownerId = (int)($_SESSION['user_id'] ?? 0);

        if ($ownerId <= 0 || $classId <= 0 || $courseId <= 0 || $moduleId <= 0 || $lessonId <= 0 || empty($topicTitle)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid request parameters']);
            exit;
        }

        // Verify teacher owns this class
        $stmt = $db->prepare("SELECT id FROM classes WHERE id = ? AND owner_user_id = ?");
        $stmt->execute([$classId, $ownerId]);
        if (!$stmt->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }

        try {
            // Get current overrides or create new ones
            $stmt = $db->prepare("SELECT overrides FROM class_outline_overrides WHERE class_id = ? AND course_id = ?");
            $stmt->execute([$classId, $courseId]);
            $result = $stmt->fetch();
            
            $overrides = $result ? json_decode($result['overrides'], true) : ['modules' => []];
            if (!isset($overrides['modules']) || !is_array($overrides['modules'])) {
                $overrides['modules'] = [];
            }

            // Find the module and lesson, then add the topic
            $moduleFound = false;
            $lessonFound = false;
            foreach ($overrides['modules'] as &$module) {
                if ($module['id'] == $moduleId) {
                    $moduleFound = true;
                    if (!isset($module['lessons'])) $module['lessons'] = [];
                    foreach ($module['lessons'] as &$lesson) {
                        if ($lesson['id'] == $lessonId) {
                            if (!isset($lesson['topics'])) $lesson['topics'] = [];
                            $lesson['topics'][] = $topicTitle;
                            $lessonFound = true;
                            break 2;
                        }
                    }
                    break;
                }
            }

            if (!$moduleFound || !$lessonFound) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Module or lesson not found']);
                exit;
            }

            // Save updated overrides
            $overridesJson = json_encode($overrides);
            $stmt = $db->prepare("INSERT INTO class_outline_overrides (class_id, course_id, overrides) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE overrides = VALUES(overrides), updated_at = CURRENT_TIMESTAMP");
            $stmt->execute([$classId, $courseId, $overridesJson]);
            
            echo json_encode(['success' => true, 'message' => 'Topic added successfully']);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to add topic']);
            exit;
        }
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Unknown action']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}



