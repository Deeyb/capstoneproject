<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
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


