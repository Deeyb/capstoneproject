<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }
header('Content-Type: application/json');
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/auth_helpers.php';
require_once __DIR__ . '/classes/ClassService.php';

try {
    Auth::requireAuth();
    $db = (new Database())->getConnection();
    if (!$db) { http_response_code(500); echo json_encode(['success'=>false,'message'=>'DB unavailable']); exit; }

    $service = new ClassService($db);
    $action = $_GET['action'] ?? 'get_details';
    $classId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($classId <= 0) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'Invalid class id']); exit; }

    switch ($action) {
        case 'get_details':
            $cls = $service->getClassById($classId);
            if (!$cls) { http_response_code(404); echo json_encode(['success'=>false,'message'=>'Class not found']); exit; }
            echo json_encode(['success'=>true, 'class'=>$cls]);
            break;
        case 'get_overview':
            $overview = $service->getClassOverview($classId);
            echo json_encode(['success'=>true, 'overview'=>$overview]);
            break;
        case 'list_lessons':
            $lessons = $service->listLessonsForClass($classId);
            echo json_encode(['success'=>true, 'lessons'=>$lessons]);
            break;
        default:
            http_response_code(400);
            echo json_encode(['success'=>false,'message'=>'Unknown action']);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Server error']);
}

