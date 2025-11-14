<?php
/**
 * GET CERTIFICATION DATA API
 * Returns certification progress for all classes a student is enrolled in
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
require_once __DIR__ . '/classes/ClassEnrollmentService.php';

// Clean any output
$obContent = ob_get_clean();
if (!empty($obContent) && trim($obContent) !== '') {
    error_log("get_certification_data.php - Unexpected output: " . substr($obContent, 0, 500));
    ob_start();
}

try {
    // Check authentication
    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        if (ob_get_level()) {
            ob_clean();
        }
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized',
            'certifications' => []
        ]);
        exit;
    }
    
    $userId = (int)($_SESSION['user_id'] ?? 0);
    $userRole = strtolower($_SESSION['user_role'] ?? '');
    
    if ($userId <= 0 || $userRole !== 'student') {
        throw new Exception('Student access required');
    }
    
    $db = (new Database())->getConnection();
    
    // Get all classes the student is enrolled in
    $enrollmentService = new ClassEnrollmentService($db);
    $enrollmentService->setStudent($userId, $userRole);
    $classes = $enrollmentService->getStudentClasses();
    
    $certifications = [];
    
    foreach ($classes as $class) {
        $classId = (int)$class['id'];
        
        // Get course information from the class
        $courseStmt = $db->prepare("
            SELECT 
                c.id as course_id,
                c.title as course_title,
                c.code as course_code,
                c.language,
                c.description
            FROM classes cl
            INNER JOIN courses c ON cl.course_id = c.id
            WHERE cl.id = ? AND cl.status = 'active'
            LIMIT 1
        ");
        $courseStmt->execute([$classId]);
        $course = $courseStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$course) {
            continue; // Skip if no course found
        }
        
        // Get when the student joined this specific class
        $enrollmentStmt = $db->prepare("
            SELECT joined_at, status
            FROM class_students
            WHERE class_id = ? AND student_user_id = ?
            LIMIT 1
        ");
        $enrollmentStmt->execute([$classId, $userId]);
        $enrollment = $enrollmentStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$enrollment || $enrollment['status'] !== 'accepted') {
            continue; // Skip if student not properly enrolled
        }
        
        $joinedAt = $enrollment['joined_at'] ?? null;
        
        // Count total activities in this course (for this class)
        // Get course_id from class first, then count activities
        $totalActivitiesStmt = $db->prepare("
            SELECT COUNT(DISTINCT la.id) as total
            FROM lesson_activities la
            INNER JOIN course_lessons cl ON la.lesson_id = cl.id
            INNER JOIN course_modules cm ON cl.module_id = cm.id
            INNER JOIN classes c ON cm.course_id = c.course_id
            WHERE c.id = ? AND c.status = 'active'
        ");
        $totalActivitiesStmt->execute([$classId]);
        $totalActivities = (int)$totalActivitiesStmt->fetchColumn();
        
        // Count completed activities (submitted attempts with score)
        // CRITICAL: Only count activities completed AFTER the student joined this specific class
        // This ensures progress is per-class, not shared across classes with the same course
        $completedActivitiesParams = [$classId, $userId];
        $completedActivitiesWhere = "
            WHERE c.id = ? 
            AND aa.user_id = ?
            AND aa.role = 'student'
            AND aa.is_preview = 0
            AND aa.submitted_at IS NOT NULL
            AND aa.score IS NOT NULL
        ";
        
        // Only count activities completed after joining this class
        if ($joinedAt) {
            $completedActivitiesWhere .= " AND DATE(aa.submitted_at) >= DATE(?)";
            $completedActivitiesParams[] = $joinedAt;
        }
        
        $completedActivitiesStmt = $db->prepare("
            SELECT COUNT(DISTINCT aa.activity_id) as completed
            FROM activity_attempts aa
            INNER JOIN lesson_activities la ON aa.activity_id = la.id
            INNER JOIN course_lessons cl ON la.lesson_id = cl.id
            INNER JOIN course_modules cm ON cl.module_id = cm.id
            INNER JOIN classes c ON cm.course_id = c.course_id
            $completedActivitiesWhere
        ");
        $completedActivitiesStmt->execute($completedActivitiesParams);
        $completedActivities = (int)$completedActivitiesStmt->fetchColumn();
        
        error_log("get_certification_data.php - Class $classId, User $userId, Joined: $joinedAt - Total activities: $totalActivities, Completed: $completedActivities");
        
        // Calculate progress percentage
        $progress = $totalActivities > 0 ? round(($completedActivities / $totalActivities) * 100, 1) : 0;
        
        // Get course language (default to course code or title if no language)
        $language = $course['language'] ?? $course['course_code'] ?? $course['course_title'] ?? 'Programming';
        
        $certifications[] = [
            'class_id' => $classId,
            'class_name' => $class['class_name'],
            'class_code' => $class['class_code'],
            'course_id' => (int)$course['course_id'],
            'course_title' => $course['course_title'],
            'course_code' => $course['course_code'],
            'language' => $language,
            'description' => $course['description'] ?? '',
            'total_activities' => $totalActivities,
            'completed_activities' => $completedActivities,
            'progress' => $progress,
            'progress_text' => "{$completedActivities}/{$totalActivities}"
        ];
    }
    
    // Sort by progress (descending) then by course title
    usort($certifications, function($a, $b) {
        if ($a['progress'] == $b['progress']) {
            return strcmp($a['course_title'], $b['course_title']);
        }
        return $b['progress'] <=> $a['progress'];
    });
    
    error_log("get_certification_data.php - Returning " . count($certifications) . " certifications for user $userId");
    
    if (ob_get_level()) {
        ob_clean();
    }
    
    echo json_encode([
        'success' => true,
        'certifications' => $certifications,
        'count' => count($certifications)
    ]);
    
} catch (Exception $e) {
    error_log("Get certification data error: " . $e->getMessage());
    error_log("Get certification data error stack: " . $e->getTraceAsString());
    
    if (ob_get_level()) {
        ob_clean();
    }
    
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'certifications' => []
    ]);
    exit;
}
?>


