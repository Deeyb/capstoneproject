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
    // Fallback to alternate cookie if session is empty
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

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/auth_helpers.php';
require_once __DIR__ . '/classes/ActivityTrackingService.php';

header('Content-Type: application/json');

// Check authentication without redirecting (for API endpoints)
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized', 'count' => 0]);
    exit;
}

// Only teachers and coordinators can view active student counts
$userRole = strtoupper($_SESSION['user_role'] ?? '');
if ($userRole !== 'TEACHER' && $userRole !== 'COORDINATOR') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized', 'count' => 0]);
    exit;
}

$lessonId = isset($_GET['lesson_id']) ? (int)$_GET['lesson_id'] : 0;
if ($lessonId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid lesson ID', 'count' => 0]);
    exit;
}

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    $trackingService = new ActivityTrackingService($db);
    
    // Track current user's activity (if student)
    $currentUserId = $_SESSION['user_id'] ?? 0;
    $currentUserRole = strtoupper($_SESSION['user_role'] ?? '');
    
    // If current user is a student viewing this lesson, update their activity
    if ($currentUserRole === 'STUDENT' && $currentUserId > 0) {
        $classId = $trackingService->getClassIdFromLesson($lessonId);
        $trackingService->trackActivity($currentUserId, $lessonId, $classId);
    }
    
    // Get count of active students (active within last 5 minutes)
    $activeCount = $trackingService->getActiveStudentCount($lessonId, 5);
    
    // Clean up old activity records (older than 1 hour)
    $trackingService->cleanupOldRecords(1);
    
    echo json_encode([
        'success' => true,
        'count' => $activeCount,
        'lesson_id' => $lessonId
    ]);
    
} catch (Exception $e) {
    error_log("Error getting active students: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching active students',
        'count' => 0
    ]);
}
?>

