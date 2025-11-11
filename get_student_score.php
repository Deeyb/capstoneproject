<?php
/**
 * GET STUDENT SCORE API
 * Gets the student's best/final score from activity_attempts (not draft progress)
 */

// CRITICAL: Set session path BEFORE any session_start() calls
$sessionPath = __DIR__ . '/sessions';
if (!is_dir($sessionPath)) {
    @mkdir($sessionPath, 0777, true);
}
if (is_dir($sessionPath) && is_writable($sessionPath)) {
    ini_set('session.save_path', $sessionPath);
}

// Start session if not already started - use same logic as main app
if (session_status() === PHP_SESSION_NONE) {
    // Try to use the same session name as the main app
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
    
    // If still no user_id, try alternate session name
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

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/auth_helpers.php';
require_once __DIR__ . '/classes/ActivityAttemptService.php';

header('Content-Type: application/json');

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        throw new Exception('Database connection failed');
    }
    
    // Check authentication without redirecting (for API endpoints)
    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'score' => 0,
            'message' => 'Unauthorized'
        ]);
        exit;
    }
    
    $userId = (int)($_SESSION['user_id'] ?? 0);
    if ($userId <= 0) {
        throw new Exception('User not authenticated');
    }
    
    $activityId = (int)($_GET['activity_id'] ?? 0);
    if ($activityId <= 0) {
        throw new Exception('Invalid activity ID');
    }
    
    // Get best attempt score from ActivityAttemptService
    $attemptService = new ActivityAttemptService($db);
    $bestAttempt = $attemptService->getUserBestAttempt($activityId, $userId);
    
    if ($bestAttempt && $bestAttempt['score'] !== null) {
        echo json_encode([
            'success' => true,
            'score' => (float)$bestAttempt['score'],
            'attempt_id' => $bestAttempt['id'],
            'submitted_at' => $bestAttempt['submitted_at']
        ]);
    } else {
        // No submitted attempt yet, return 0
        echo json_encode([
            'success' => true,
            'score' => 0,
            'attempt_id' => null,
            'submitted_at' => null
        ]);
    }
    
} catch (Exception $e) {
    error_log("Get student score error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'score' => 0,
        'message' => $e->getMessage()
    ]);
}
?>

