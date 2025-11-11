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

require_once 'config/Database.php';
require_once 'classes/CourseService.php';

// Check if user is logged in and is a teacher
if (!isset($_SESSION['user_id']) || strtoupper($_SESSION['user_role']) !== 'TEACHER') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

$db = (new Database())->getConnection();
$courseService = new CourseService($db);
$action = $_GET['action'] ?? '';

header('Content-Type: application/json');

switch ($action) {
    case 'get_published_courses':
        $result = $courseService->getPublishedCoursesForTeachers();
        echo json_encode($result);
        break;
        
    case 'get_course_details':
        $courseId = $_GET['course_id'] ?? 0;
        if (!$courseId) {
            echo json_encode(['success' => false, 'message' => 'Course ID required']);
            break;
        }
        
        $result = $courseService->getCourseForTeacher($courseId);
        echo json_encode($result);
        break;
        
    case 'check_course_availability':
        $courseId = $_GET['course_id'] ?? 0;
        if (!$courseId) {
            echo json_encode(['success' => false, 'message' => 'Course ID required']);
            break;
        }
        
        $isAvailable = $courseService->isCourseAvailableForTeachers($courseId);
        echo json_encode([
            'success' => true,
            'available' => $isAvailable,
            'message' => $isAvailable ? 'Course is available' : 'Course is not available'
        ]);
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}
?>


