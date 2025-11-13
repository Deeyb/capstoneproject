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
$classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : 0;
if ($activityId <= 0 || $classId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid activity or class ID', 'avg_score' => 0]);
    exit;
}

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    // Ensure requester has access to this class
    $userId = (int)($_SESSION['user_id'] ?? 0);
    if ($userRole === 'TEACHER') {
        $ownerStmt = $db->prepare("SELECT id FROM classes WHERE id = ? AND owner_user_id = ?");
        $ownerStmt->execute([$classId, $userId]);
        if (!$ownerStmt->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Access denied', 'avg_score' => 0]);
            exit;
        }
    } else {
        $ownerStmt = $db->prepare("SELECT id FROM classes WHERE id = ?");
        $ownerStmt->execute([$classId]);
        if (!$ownerStmt->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Class not found', 'avg_score' => 0]);
            exit;
        }
    }
    
    // Check if status column exists in class_students
    $hasStatusColumn = false;
    try {
        $checkStmt = $db->query("SHOW COLUMNS FROM class_students LIKE 'status'");
        $hasStatusColumn = $checkStmt->rowCount() > 0;
    } catch (Exception $e) {
        // Column doesn't exist
    }
    
    // Get ALL enrolled (accepted) students in this class
    if ($hasStatusColumn) {
        $enrolledStmt = $db->prepare("
            SELECT DISTINCT cs.student_user_id as user_id
            FROM class_students cs
            INNER JOIN users u ON cs.student_user_id = u.id
            WHERE cs.class_id = ? 
            AND u.status = 'active' 
            AND cs.status = 'accepted'
        ");
    } else {
        // Fallback for old schema
        $enrolledStmt = $db->prepare("
            SELECT DISTINCT cs.student_user_id as user_id
            FROM class_students cs
            INNER JOIN users u ON cs.student_user_id = u.id
            WHERE cs.class_id = ? 
            AND u.status = 'active'
        ");
    }
    $enrolledStmt->execute([$classId]);
    $enrolledStudents = $enrolledStmt->fetchAll(PDO::FETCH_COLUMN);
    $totalEnrolled = count($enrolledStudents);
    
    if ($totalEnrolled === 0) {
        // No enrolled students
        echo json_encode([
            'success' => true,
            'avg_score' => 0,
            'total_submissions' => 0,
            'total_enrolled' => 0,
            'activity_id' => $activityId
        ]);
        exit;
    }
    
    // Get best score for each enrolled student for this activity
    // Students without submissions will have NULL/0 score
    $scoresStmt = $db->prepare("
        SELECT 
            cs.student_user_id as user_id,
            COALESCE(MAX(aa.score), 0) as best_score
        FROM class_students cs
        INNER JOIN users u ON cs.student_user_id = u.id
        LEFT JOIN activity_attempts aa ON (
            aa.user_id = cs.student_user_id 
            AND aa.activity_id = ?
            AND aa.role = 'student'
            AND aa.is_preview = 0
            AND aa.submitted_at IS NOT NULL
            AND aa.score IS NOT NULL
        )
        WHERE cs.class_id = ?
        AND u.status = 'active'
        " . ($hasStatusColumn ? "AND cs.status = 'accepted'" : "") . "
        GROUP BY cs.student_user_id
    ");
    $scoresStmt->execute([$activityId, $classId]);
    $studentScores = $scoresStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate average including all enrolled students (0 for those who didn't submit)
    $totalScore = 0;
    $studentsWithSubmissions = 0;
    foreach ($studentScores as $row) {
        $score = (float)($row['best_score'] ?? 0);
        $totalScore += $score;
        if ($score > 0) {
            $studentsWithSubmissions++;
        }
    }
    
    // Average = total score / total enrolled students (includes 0s for non-submitters)
    $avgScore = $totalEnrolled > 0 ? round($totalScore / $totalEnrolled, 1) : 0;
    
    echo json_encode([
        'success' => true,
        'avg_score' => $avgScore,
        'total_submissions' => $studentsWithSubmissions,
        'total_enrolled' => $totalEnrolled,
        'activity_id' => $activityId,
        'class_id' => $classId
    ]);
    
} catch (Exception $e) {
    error_log("Error getting average score: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching average score',
        'avg_score' => 0
    ]);
}
?>

