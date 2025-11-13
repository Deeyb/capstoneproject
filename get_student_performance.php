<?php
/**
 * GET STUDENT PERFORMANCE API
 * Returns detailed performance data for all students in a class
 */

// CRITICAL: Set error reporting to prevent any output before JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// CRITICAL: Set JSON header FIRST (before any output or buffering)
header('Content-Type: application/json; charset=utf-8');

// Start output buffering AFTER headers
ob_start();

// Manual session handling
$sessionPath = __DIR__ . '/sessions';
if (!is_dir($sessionPath)) {
    @mkdir($sessionPath, 0777, true);
}
if (is_dir($sessionPath) && is_writable($sessionPath)) {
    ini_set('session.save_path', $sessionPath);
}

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

// Clean any output
$obContent = ob_get_clean();
if (!empty($obContent) && trim($obContent) !== '') {
    error_log("get_student_performance.php - Unexpected output: " . substr($obContent, 0, 500));
    ob_start();
}

// Manual authentication check
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$userId = (int)($_SESSION['user_id'] ?? 0);
$userRole = strtolower((string)($_SESSION['user_role'] ?? 'student'));

if ($userRole !== 'teacher') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied. Teacher only.']);
    exit;
}

$classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : 0;

if ($classId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid class ID']);
    exit;
}

try {
    $db = (new Database())->getConnection();
    
    // Verify teacher owns this class and get course_id
    $stmt = $db->prepare("SELECT id, course_id FROM classes WHERE id = ? AND owner_user_id = ? AND status = 'active'");
    $stmt->execute([$classId, $userId]);
    $classData = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$classData) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }
    
    $courseId = (int)($classData['course_id'] ?? 0);
    error_log("get_student_performance.php - Class $classId, Course ID: $courseId");
    
    if ($courseId <= 0) {
        error_log("get_student_performance.php - Class $classId has no course_id");
        // Return empty data if no course
        while (ob_get_level()) {
            ob_end_clean();
        }
        echo json_encode([
            'success' => true,
            'data' => [],
            'summary' => [
                'total_students' => 0,
                'total_activities' => 0,
                'total_topics' => 0
            ]
        ]);
        exit;
    }
    
    // Get all students in class
    try {
        // Check if status column exists in class_students
        $hasStatusColumn = false;
        try {
            $checkStmt = $db->query("SHOW COLUMNS FROM class_students LIKE 'status'");
            $hasStatusColumn = $checkStmt->rowCount() > 0;
        } catch (Exception $e) {
            // Column doesn't exist
        }
        
        // Fetch all ACCEPTED students in the class only
        if ($hasStatusColumn) {
            $studentsStmt = $db->prepare("
                SELECT 
                    u.id as student_id,
                    u.firstname,
                    u.middlename,
                    u.lastname,
                    u.id_number,
                    cs.joined_at as enrolled_at
                FROM class_students cs
                INNER JOIN users u ON cs.student_user_id = u.id
                WHERE cs.class_id = ? AND u.status = 'active' AND cs.status = 'accepted'
                ORDER BY u.lastname, u.firstname
            ");
        } else {
            // Fallback for old schema - include all students
            $studentsStmt = $db->prepare("
                SELECT 
                    u.id as student_id,
                    u.firstname,
                    u.middlename,
                    u.lastname,
                    u.id_number,
                    cs.joined_at as enrolled_at
                FROM class_students cs
                INNER JOIN users u ON cs.student_user_id = u.id
                WHERE cs.class_id = ? AND u.status = 'active'
                ORDER BY u.lastname, u.firstname
            ");
        }
        $studentsStmt->execute([$classId]);
        $students = $studentsStmt->fetchAll(PDO::FETCH_ASSOC);
        error_log("get_student_performance.php - Found " . count($students) . " students");
    } catch (PDOException $e) {
        error_log("get_student_performance.php - Error getting students: " . $e->getMessage());
        throw $e;
    }
    
    // Get all activities for this class (using course_id from class)
    try {
        $activitiesStmt = $db->prepare("
            SELECT la.id, la.title, la.max_score, la.type
            FROM lesson_activities la
            INNER JOIN course_lessons cl ON la.lesson_id = cl.id
            INNER JOIN course_modules cm ON cl.module_id = cm.id
            WHERE cm.course_id = ?
            ORDER BY la.id
        ");
        $activitiesStmt->execute([$courseId]);
        $activities = $activitiesStmt->fetchAll(PDO::FETCH_ASSOC);
        error_log("get_student_performance.php - Found " . count($activities) . " activities");
    } catch (PDOException $e) {
        error_log("get_student_performance.php - Error getting activities: " . $e->getMessage());
        error_log("get_student_performance.php - SQL Error Info: " . json_encode($e->errorInfo));
        throw $e;
    }
    
    // Get all lessons/topics for this class (using course_id from class)
    try {
        $lessonsStmt = $db->prepare("
            SELECT cl.id as lesson_id, cl.title as lesson_title
            FROM course_lessons cl
            INNER JOIN course_modules cm ON cl.module_id = cm.id
            WHERE cm.course_id = ?
        ");
        $lessonsStmt->execute([$courseId]);
        $lessons = $lessonsStmt->fetchAll(PDO::FETCH_ASSOC);
        error_log("get_student_performance.php - Found " . count($lessons) . " lessons");
    } catch (PDOException $e) {
        error_log("get_student_performance.php - Error getting lessons: " . $e->getMessage());
        error_log("get_student_performance.php - SQL Error Info: " . json_encode($e->errorInfo));
        throw $e;
    }
    
    // Calculate performance for each student
    $studentPerformance = [];
    
    // If no students, return empty data
    if (empty($students)) {
        while (ob_get_level()) {
            ob_end_clean();
        }
        echo json_encode([
            'success' => true,
            'data' => [],
            'summary' => [
                'total_students' => 0,
                'total_activities' => count($activities),
                'total_topics' => count($lessons)
            ]
        ]);
        exit;
    }
    
    foreach ($students as $student) {
        try {
            $studentId = (int)($student['student_id'] ?? 0);
            if ($studentId <= 0) {
                error_log("get_student_performance.php - Invalid student_id, skipping");
                continue;
            }
            
            $studentName = trim(($student['firstname'] ?? '') . ' ' . 
                (isset($student['middlename']) && $student['middlename'] ? substr($student['middlename'], 0, 1) . '. ' : '') . 
                ($student['lastname'] ?? ''));
            
            // Calculate overall grade
            $totalScore = 0;
            $totalMaxScore = 0;
            $completedActivities = 0;
            $pendingActivities = 0;
            $activityScores = [];
            
            foreach ($activities as $activity) {
                $activityId = $activity['id'];
                $maxScore = (int)$activity['max_score'];
                $activityType = $activity['type'];
                
                // Get best attempt score (use user_id, role='student', is_preview=0, and submitted_at IS NOT NULL)
                try {
                    $scoreStmt = $db->prepare("
                        SELECT MAX(score) as best_score, COUNT(*) as attempt_count
                        FROM activity_attempts
                        WHERE activity_id = ? 
                        AND user_id = ? 
                        AND role = 'student' 
                        AND is_preview = 0
                        AND submitted_at IS NOT NULL
                        AND score IS NOT NULL
                    ");
                    $scoreStmt->execute([$activityId, $studentId]);
                    $scoreData = $scoreStmt->fetch(PDO::FETCH_ASSOC);
                    
                    // Check if we have a valid result (even if score is 0, it's valid)
                    if ($scoreData && $scoreData['best_score'] !== null) {
                        $bestScore = (float)$scoreData['best_score'];
                        $hasAttempt = (int)($scoreData['attempt_count'] ?? 0) > 0;
                    } else {
                        $bestScore = null;
                        $hasAttempt = false;
                    }
                } catch (PDOException $e) {
                    error_log("Error getting score for activity $activityId, student $studentId: " . $e->getMessage());
                    $bestScore = null;
                    $hasAttempt = false;
                }
                
                // Check if submitted (for manual grading) - use user_id, role='student', is_preview=0
                try {
                    $submittedStmt = $db->prepare("
                        SELECT COUNT(*) as submitted_count
                        FROM activity_attempts
                        WHERE activity_id = ? 
                        AND user_id = ? 
                        AND role = 'student' 
                        AND is_preview = 0
                        AND submitted_at IS NOT NULL
                    ");
                    $submittedStmt->execute([$activityId, $studentId]);
                    $submittedData = $submittedStmt->fetch(PDO::FETCH_ASSOC);
                    $isSubmitted = $submittedData && (int)($submittedData['submitted_count'] ?? 0) > 0;
                } catch (PDOException $e) {
                    error_log("Error checking submission for activity $activityId, student $studentId: " . $e->getMessage());
                    $isSubmitted = false;
                }
                
                $activityScore = null;
                $status = 'not_started';
                
                if ($bestScore !== null) {
                    $activityScore = $bestScore;
                    $status = 'completed';
                    $completedActivities++;
                    $totalScore += $bestScore;
                    $totalMaxScore += $maxScore;
                } elseif ($isSubmitted && in_array($activityType, ['essay', 'upload_based'])) {
                    $status = 'pending';
                    $pendingActivities++;
                    $totalMaxScore += $maxScore; // Count max score even if pending
                } elseif ($hasAttempt) {
                    $status = 'in_progress';
                    $totalMaxScore += $maxScore;
                } else {
                    $status = 'not_started';
                    $totalMaxScore += $maxScore;
                }
                
                $activityScores[] = [
                    'activity_id' => $activityId,
                    'activity_title' => $activity['title'],
                    'score' => $activityScore,
                    'max_score' => $maxScore,
                    'status' => $status,
                    'percentage' => $activityScore !== null && $maxScore > 0 ? round(($activityScore / $maxScore) * 100, 1) : null
                ];
            }
            
            // Calculate overall grade percentage
            $overallGrade = null;
            if ($totalMaxScore > 0) {
                $overallGrade = round(($totalScore / $totalMaxScore) * 100, 1);
            }
            
            // Calculate topics completed
            $completedTopics = 0;
            foreach ($lessons as $lesson) {
                try {
                    $lessonId = $lesson['lesson_id'];
                    $completedStmt = $db->prepare("
                        SELECT COUNT(DISTINCT la.id) as completed
                        FROM lesson_activities la
                        INNER JOIN activity_attempts aa ON la.id = aa.activity_id
                        WHERE la.lesson_id = ? 
                        AND aa.user_id = ? 
                        AND aa.role = 'student' 
                        AND aa.is_preview = 0
                        AND aa.submitted_at IS NOT NULL
                        AND (aa.score IS NOT NULL OR la.type IN ('essay', 'upload_based'))
                    ");
                    $completedStmt->execute([$lessonId, $studentId]);
                    $completed = (int)$completedStmt->fetchColumn();
                    
                    if ($completed > 0) {
                        $completedTopics++;
                    }
                } catch (PDOException $e) {
                    error_log("Error checking lesson completion for lesson $lessonId, student $studentId: " . $e->getMessage());
                    // Continue with next lesson
                    continue;
                }
            }
            
            $topicsCompleted = count($lessons) > 0 ? round(($completedTopics / count($lessons)) * 100, 1) : 0;
            
            $studentPerformance[] = [
                'student_id' => $studentId,
                'name' => $studentName,
                'id_number' => $student['id_number'] ?? '',
                'enrolled_at' => $student['enrolled_at'],
                'overall_grade' => $overallGrade,
                'total_score' => $totalScore,
                'total_max_score' => $totalMaxScore,
                'completed_activities' => $completedActivities,
                'pending_activities' => $pendingActivities,
                'total_activities' => count($activities),
                'topics_completed' => $topicsCompleted,
                'total_topics' => count($lessons),
                'activity_scores' => $activityScores
            ];
        } catch (Exception $studentError) {
            error_log("Error processing student {$studentId}: " . $studentError->getMessage());
            error_log("Stack trace: " . $studentError->getTraceAsString());
            // Continue with next student instead of failing completely
            continue;
        }
    }
    
    // Clean output buffer before sending final response
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    echo json_encode([
        'success' => true,
        'data' => $studentPerformance,
        'summary' => [
            'total_students' => count($studentPerformance),
            'total_activities' => count($activities),
            'total_topics' => count($lessons)
        ]
    ]);
    exit;
    
} catch (PDOException $e) {
    $errorInfo = $e->errorInfo ?? [];
    error_log("Database error in get_student_performance.php: " . $e->getMessage());
    error_log("SQL Error Code: " . $e->getCode());
    error_log("SQL Error Info: " . json_encode($errorInfo));
    error_log("SQL State: " . ($errorInfo[0] ?? 'N/A'));
    error_log("Driver Error Code: " . ($errorInfo[1] ?? 'N/A'));
    error_log("Driver Error Message: " . ($errorInfo[2] ?? 'N/A'));
    
    // Clean any output before sending error
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage(),
        'error_code' => $e->getCode(),
        'sql_state' => $errorInfo[0] ?? null,
        'driver_error_code' => $errorInfo[1] ?? null,
        'driver_error_message' => $errorInfo[2] ?? null
    ]);
    exit;
} catch (Exception $e) {
    error_log("Error getting student performance: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    // Clean any output before sending error
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'Failed to get student performance',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
    exit;
} catch (Throwable $e) {
    error_log("Fatal error in get_student_performance.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    // Clean any output before sending error
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'Fatal error occurred',
        'error' => $e->getMessage()
    ]);
    exit;
}
?>

