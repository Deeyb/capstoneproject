<?php
session_start();
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/auth_helpers.php';
require_once __DIR__ . '/classes/ActivityTrackingService.php';

header('Content-Type: application/json');

// Require authentication
Auth::requireAuth();

// Only teachers and coordinators can view active student counts
$userRole = strtoupper($_SESSION['user_role'] ?? '');
if ($userRole !== 'TEACHER' && $userRole !== 'COORDINATOR') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
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

