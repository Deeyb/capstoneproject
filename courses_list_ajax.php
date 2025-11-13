<?php
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

header('Content-Type: application/json');

try {
    // Allow Coordinator or Admin to view courses list
    $role = isset($_SESSION['user_role']) ? strtoupper($_SESSION['user_role']) : '';
    if ($role !== 'COORDINATOR' && $role !== 'ADMIN') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }

    require_once __DIR__ . '/config/Database.php';
    require_once __DIR__ . '/classes/ActivityAttemptService.php';
    require_once __DIR__ . '/classes/CourseService.php';

    $db = (new Database())->getConnection();
    $service = new CourseService($db);

    $search = $_GET['search'] ?? '';
    $status = $_GET['status'] ?? '';
    $owner = $_GET['owner'] ?? '';
    $archived = isset($_GET['archived']) && (int)$_GET['archived'] === 1;
    $rows = $service->listCourses($search, $status, $owner, $archived);
    echo json_encode(['success' => true, 'data' => $rows]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log("courses_list_ajax.php error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>


