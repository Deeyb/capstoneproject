<?php
/**
 * JOIN CLASS API - OOP Version
 * Handles student requests to join classes using class codes
 */

// Unified session bootstrap to match the rest of the app (prevents 401 on same-origin fetch)
if (session_status() === PHP_SESSION_NONE) {
    $sessionPath = __DIR__ . '/sessions';
    if (!is_dir($sessionPath)) { @mkdir($sessionPath, 0777, true); }
    if (is_dir($sessionPath) && is_writable($sessionPath)) {
        ini_set('session.save_path', $sessionPath);
    }
    $preferred = 'CodeRegalSession';
    $legacy = 'PHPSESSID';
    if (!empty($_COOKIE[$preferred])) { session_name($preferred); }
    elseif (!empty($_COOKIE[$legacy])) { session_name($legacy); }
    else { session_name($preferred); }
    @session_start();
    if (empty($_SESSION['user_id'])) {
        $current = session_name();
        $alt = ($current === $preferred) ? $legacy : $preferred;
        if (!empty($_COOKIE[$alt])) {
            @session_write_close();
            session_name($alt);
            @session_id($_COOKIE[$alt]);
            @session_start();
        }
    }
}

require_once 'classes/ClassEnrollmentService.php';
require_once 'config.php';
require_once 'classes/auth_helpers.php';
require_once 'config/Database.php';

// Check if user is logged in using the same pattern as other APIs
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Not logged in'
    ]);
    exit;
}

// Check if user is a student
if (strtolower($_SESSION['user_role']) !== 'student') {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Access denied. Student role required.'
    ]);
    exit;
}

header('Content-Type: application/json');

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['class_code'])) {
        throw new InvalidArgumentException('Class code is required');
    }
    
    $classCode = trim($input['class_code']);
    $studentId = $_SESSION['user_id'];
    $studentRole = $_SESSION['user_role'];
    
    // Initialize database and service
    $db = (new Database())->getConnection();
    $enrollmentService = new ClassEnrollmentService($db);
    
    // Set student information
    $enrollmentService->setStudent($studentId, $studentRole);
    
    // Join the class using OOP service
    $result = $enrollmentService->joinClass($classCode);
    
    echo json_encode($result);
    
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} catch (RuntimeException $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Join class error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
} catch (Error $e) {
    error_log("Join class error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
}
?>
