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

        $res = $service->createClass($ownerId, $name, $courseId, $customCode, $classType);
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

    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Unknown action']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}



