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
    if (!isset($_SESSION['user_role']) || strtoupper($_SESSION['user_role']) !== 'COORDINATOR') {
        http_response_code(403);
        echo json_encode(['success'=>false,'message'=>'Unauthorized']);
        exit;
    }
    require_once __DIR__ . '/config/Database.php';
    require_once __DIR__ . '/classes/CourseService.php';
    $db = (new Database())->getConnection();
    $svc = new CourseService($db);
    $filters = [];
    if (isset($_GET['search'])) $filters['search'] = $_GET['search'];
    if (isset($_GET['course_id'])) $filters['course_id'] = (int)$_GET['course_id'];
    if (isset($_GET['module_id'])) $filters['module_id'] = (int)$_GET['module_id'];
    if (isset($_GET['lesson_id'])) $filters['lesson_id'] = (int)$_GET['lesson_id'];
    if (isset($_GET['archived'])) $filters['archived'] = (int)$_GET['archived'] ? 1 : 0;
    $rows = $svc->listAllMaterials($filters);
    error_log("🔍 [materials_list_ajax] Found " . count($rows) . " materials with filters: " . json_encode($filters));
    echo json_encode(['success'=>true,'data'=>$rows]);
} catch (Throwable $e) {
    error_log("❌ [materials_list_ajax] Error: " . $e->getMessage() . " | Trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Server error: ' . $e->getMessage()]);
}
?>




