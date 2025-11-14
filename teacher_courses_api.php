<?php
// CRITICAL: Start output buffering FIRST to catch any errors
ob_start();

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

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
require_once 'classes/ActivityAttemptService.php';
require_once 'classes/CourseService.php';

// Clean any output before processing
$obContent = ob_get_clean();
if (!empty($obContent) && trim($obContent) !== '') {
    error_log("teacher_courses_api.php - Unexpected output: " . substr($obContent, 0, 500));
    ob_start();
}

// Check if user is logged in and is a teacher
if (!isset($_SESSION['user_id']) || strtoupper($_SESSION['user_role']) !== 'TEACHER') {
    while (ob_get_level()) { ob_end_clean(); }
    http_response_code(401);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

try {
    $db = (new Database())->getConnection();
    $courseService = new CourseService($db);
    $action = $_GET['action'] ?? '';

    // Clean output buffer before sending response
    while (ob_get_level()) { ob_end_clean(); }
    header('Content-Type: application/json; charset=utf-8');

    switch ($action) {
        case 'get_published_courses':
            $result = $courseService->getPublishedCoursesForTeachers();
            echo json_encode($result);
            exit;
            
        case 'get_course_details':
            $courseId = $_GET['course_id'] ?? 0;
            if (!$courseId) {
                echo json_encode(['success' => false, 'message' => 'Course ID required']);
                exit;
            }
            
            $result = $courseService->getCourseForTeacher($courseId);
            echo json_encode($result);
            exit;
            
        case 'check_course_availability':
            $courseId = $_GET['course_id'] ?? 0;
            if (!$courseId) {
                echo json_encode(['success' => false, 'message' => 'Course ID required']);
                exit;
            }
            
            $isAvailable = $courseService->isCourseAvailableForTeachers($courseId);
            echo json_encode([
                'success' => true,
                'available' => $isAvailable,
                'message' => $isAvailable ? 'Course is available' : 'Course is not available'
            ]);
            exit;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            exit;
    }
} catch (Throwable $e) {
    error_log("❌ [teacher_courses_api] Error: " . $e->getMessage());
    error_log("❌ [teacher_courses_api] Stack trace: " . $e->getTraceAsString());
    
    while (ob_get_level()) { ob_end_clean(); }
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
    exit;
}
?>


