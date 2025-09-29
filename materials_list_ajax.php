<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
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
    echo json_encode(['success'=>true,'data'=>$rows]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Server error']);
}
?>




