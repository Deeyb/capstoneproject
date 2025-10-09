<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once __DIR__ . '/classes/auth_helpers.php';
Auth::requireAuth();

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/CourseService.php';

header('Content-Type: application/json');
header('Cache-Control: no-store');
// Ensure no stray output corrupts JSON
while (function_exists('ob_get_level') && ob_get_level() > 0) { @ob_end_clean(); }

try {
    $db = (new Database())->getConnection();
    $svc = new CourseService($db);
    // Allow Coordinator, Teacher, and Admin to read outline
    $stmt = $db->prepare("SELECT LOWER(TRIM(role)) FROM users WHERE id=? LIMIT 1");
    $stmt->execute([$_SESSION['user_id']]);
    $role = $stmt->fetchColumn() ?: '';
    if ($role !== 'coordinator' && $role !== 'teacher' && $role !== 'admin') { http_response_code(403); echo json_encode(['success'=>false,'message'=>'Forbidden']); exit; }
    $courseId = (int)($_GET['course_id'] ?? 0);
    if ($courseId <= 0) { echo json_encode(['success'=>false,'message'=>'Invalid course']); exit; }
    // Access control: only require authentication; any logged-in role can fetch outline
    $course = $svc->getCourse($courseId);
    if (!$course) { echo json_encode(['success'=>false,'message'=>'Course not found']); exit; }
    $outline = $svc->getCourseOutline($courseId);
    // Attach materials list for each lesson
    foreach ($outline as &$mod) {
        foreach ($mod['lessons'] as &$les) {
            $les['materials'] = $svc->listMaterials($les['id']);
            $les['activities'] = $svc->listActivities($les['id']);
        }
    }
    echo json_encode(['success'=>true,'data'=>$outline]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
?>


