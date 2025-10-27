<?php
/**
 * GET MY CLASSES API
 * Fetches classes that the current student is enrolled in
 */

// Configure session cookie parameters for JavaScript access
session_set_cookie_params([
    'lifetime' => 0, // Session cookie expires when browser closes
    'path' => '/',
    'domain' => '', // Empty for localhost
    'secure' => false, // Set to true for HTTPS
    'httponly' => false, // Allow JavaScript access for fetch requests
    'samesite' => 'Lax' // Allow same-origin requests
]);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Include only necessary files without debug output
require_once 'classes/auth_helpers.php';
require_once 'config/Database.php';
require_once 'classes/ClassEnrollmentService.php';

// Check if user is logged in using the same pattern as student_dashboard.php
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Not logged in',
        'classes' => []
    ]);
    exit;
}

// Check if user is a student
if (strtolower($_SESSION['user_role']) !== 'student') {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Access denied. Student role required.',
        'classes' => []
    ]);
    exit;
}

header('Content-Type: application/json');

try {
    $studentId = $_SESSION['user_id'];
    $studentRole = $_SESSION['user_role'];
    error_log("Get My Classes - Student ID: " . $studentId);
    
    // Start timing
    $startTime = microtime(true);
    
    $db = (new Database())->getConnection();
    $enrollmentService = new ClassEnrollmentService($db);
    
    // Set student information
    $enrollmentService->setStudent($studentId, $studentRole);
    
    // Get student's classes using OOP service
    $classes = $enrollmentService->getStudentClasses();
    
    // End timing
    $endTime = microtime(true);
    $executionTime = round(($endTime - $startTime) * 1000, 2);
    
    error_log("Get My Classes - Found " . count($classes) . " classes for student " . $studentId . " in " . $executionTime . "ms");
    
    // Format the data
    $formattedClasses = array_map(function($class) {
        $teacherName = trim($class['teacher_firstname'] . ' ' . $class['teacher_lastname']);
        if ($class['teacher_middlename']) {
            $middleInitial = strtoupper(substr(trim($class['teacher_middlename']), 0, 1)) . '.';
            $teacherName = trim($class['teacher_firstname'] . ' ' . $middleInitial . ' ' . $class['teacher_lastname']);
        }
        
        return [
            'id' => $class['id'],
            'name' => $class['class_name'],
            'code' => $class['class_code'],
            'description' => 'No description available',
            'teacher_name' => $teacherName ?: 'Unknown Teacher',
            'student_count' => (int)$class['student_count'],
            'created_at' => $class['created_at']
        ];
    }, $classes);
    
    echo json_encode([
        'success' => true,
        'classes' => $formattedClasses,
        'count' => count($formattedClasses)
    ]);
    
} catch (Exception $e) {
    error_log("Get my classes error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to load classes',
        'classes' => []
    ]);
} catch (Error $e) {
    error_log("Get my classes error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error',
        'classes' => []
    ]);
}
?>
