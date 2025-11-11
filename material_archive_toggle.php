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
    $id = (int)($_POST['id'] ?? 0);
    $archived = isset($_POST['archived']) ? (bool)$_POST['archived'] : false;
    if ($id <= 0) { echo json_encode(['success'=>false,'message'=>'Invalid id']); exit; }
    $ok = $svc->setMaterialArchived($id, $archived);
    echo json_encode(['success'=>(bool)$ok]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Server error']);
}
?>




