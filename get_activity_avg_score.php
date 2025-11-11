<?php
/**
 * Get average score for an activity (for teachers)
 */

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

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/auth_helpers.php';

header('Content-Type: application/json');

// Check authentication without redirecting (for API endpoints)
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized', 'avg_score' => 0]);
    exit;
}

// Only teachers and coordinators can view average scores
$userRole = strtoupper($_SESSION['user_role'] ?? '');
if ($userRole !== 'TEACHER' && $userRole !== 'COORDINATOR') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized', 'avg_score' => 0]);
    exit;
}

$activityId = isset($_GET['activity_id']) ? (int)$_GET['activity_id'] : 0;
if ($activityId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid activity ID', 'avg_score' => 0]);
    exit;
}

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    // Get average score for this activity
    $stmt = $db->prepare("
        SELECT 
            AVG(score) as avg_score,
            COUNT(*) as total_submissions
        FROM activity_progress 
        WHERE activity_id = ? AND score IS NOT NULL
    ");
    $stmt->execute([$activityId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $avgScore = $result && $result['avg_score'] ? round($result['avg_score'], 1) : 0;
    $totalSubmissions = $result ? (int)$result['total_submissions'] : 0;
    
    echo json_encode([
        'success' => true,
        'avg_score' => $avgScore,
        'total_submissions' => $totalSubmissions,
        'activity_id' => $activityId
    ]);
    
} catch (Exception $e) {
    error_log("Error getting average score: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching average score',
        'avg_score' => 0
    ]);
}
?>

