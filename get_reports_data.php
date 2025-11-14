<?php
/**
 * GET REPORTS DATA API
 * Returns report data with filtering options for Admin, Coordinator, and Teacher
 */

// CRITICAL: Start output buffering FIRST (always, even when included, to prevent any output)
if (ob_get_level() == 0) {
    ob_start();
}

// Check if this file is being included or called directly
$isDirectCall = !defined('REPORTS_INCLUDED');

// Only execute API logic if called directly (not included)
if ($isDirectCall) {
    error_reporting(E_ALL);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);

    // CRITICAL: Set JSON header AFTER output buffering
    header('Content-Type: application/json; charset=utf-8');
}

// CRITICAL: Always load required files (needed for functions even when included)
require_once __DIR__ . '/classes/auth_helpers.php';
require_once __DIR__ . '/config/Database.php';

// Session handling (always needed for functions)
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

// Only execute API logic if called directly
if ($isDirectCall) {
    Auth::requireAuth();

    $db = (new Database())->getConnection();
    $userId = $_SESSION['user_id'] ?? 0;
    $userRole = strtolower(trim($_SESSION['user_role'] ?? ''));

    // Get filter parameters
    $reportType = $_GET['type'] ?? 'overview'; // overview, class, student, activity
    $classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : 0;
    $studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : 0;
    $activityId = isset($_GET['activity_id']) ? (int)$_GET['activity_id'] : 0;
    $dateFrom = $_GET['date_from'] ?? null;
    $dateTo = $_GET['date_to'] ?? null;
    $activityType = $_GET['activity_type'] ?? null; // quiz, coding, essay, upload_based

    try {
        $response = ['success' => false, 'data' => [], 'message' => ''];
        
        // Permission check
        if (!in_array($userRole, ['admin', 'coordinator', 'teacher'])) {
            while (ob_get_level()) {
                ob_end_clean();
            }
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Access denied']);
            exit;
        }
        
        switch ($reportType) {
            case 'overview':
                // Overview report - summary statistics
                $response = getOverviewReport($db, $userId, $userRole, $classId, $dateFrom, $dateTo);
                break;
                
            case 'class':
                // Class-specific report
                if ($classId <= 0) {
                    $response = ['success' => false, 'message' => 'Class ID required'];
                    break;
                }
                $response = getClassReport($db, $userId, $userRole, $classId, $dateFrom, $dateTo);
                break;
                
            case 'student':
                // Student-specific report
                if ($studentId <= 0) {
                    $response = ['success' => false, 'message' => 'Student ID required'];
                    break;
                }
                $response = getStudentReport($db, $userId, $userRole, $studentId, $classId, $dateFrom, $dateTo);
                break;
                
            case 'activity':
                // Activity-specific report
                if ($activityId <= 0) {
                    $response = ['success' => false, 'message' => 'Activity ID required'];
                    break;
                }
                $response = getActivityReport($db, $userId, $userRole, $activityId, $classId, $dateFrom, $dateTo);
                break;
                
            default:
                $response = ['success' => false, 'message' => 'Invalid report type'];
        }
        
        // Debug logging before sending response
        error_log("📊 [get_reports_data] Report Type: $reportType");
    error_log("📊 [get_reports_data] Response success: " . ($response['success'] ? 'true' : 'false'));
    if (isset($response['data'])) {
        error_log("📊 [get_reports_data] Data type: " . gettype($response['data']));
        if (is_array($response['data'])) {
            error_log("📊 [get_reports_data] Data keys: " . implode(', ', array_keys($response['data'])));
            if (isset($response['data']['student_performance'])) {
                error_log("📊 [get_reports_data] student_performance count: " . count($response['data']['student_performance']));
            }
            if (isset($response['data']['class_info'])) {
                error_log("📊 [get_reports_data] class_info exists");
                error_log("📊 [get_reports_data] class_info keys: " . implode(', ', array_keys($response['data']['class_info'])));
            }
            if (isset($response['data']['statistics'])) {
                error_log("📊 [get_reports_data] statistics exists");
                error_log("📊 [get_reports_data] statistics keys: " . implode(', ', array_keys($response['data']['statistics'])));
            }
        } else {
            error_log("📊 [get_reports_data] Data is not an array: " . var_export($response['data'], true));
        }
    } else {
        error_log("📊 [get_reports_data] No 'data' key in response");
    }
    
    // SUPER DEEP DEBUG: Log the entire response structure
    error_log("📊 [get_reports_data] FULL RESPONSE STRUCTURE: " . json_encode($response, JSON_PRETTY_PRINT));
    
    // CRITICAL: Clean ALL output buffers and ensure only JSON is sent
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    // Ensure no output before JSON
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit;
    
} catch (Throwable $e) {
    // CRITICAL: Clean ALL output buffers before error response
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    error_log("❌ [get_reports_data] Error: " . $e->getMessage());
    error_log("❌ [get_reports_data] Stack: " . $e->getTraceAsString());
    
    // Ensure JSON header even for errors
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit;
    }
} // End of if ($isDirectCall) block

/**
 * Get overview report (summary statistics)
 */
function getOverviewReport($db, $userId, $userRole, $classId, $dateFrom, $dateTo) {
    $stats = [];
    
    // Build base WHERE clause (without date filters for student count)
    $baseWhereClause = "WHERE cs.status = 'accepted'";
    $baseParams = [];
    
    if ($userRole === 'teacher') {
        // Teachers see only their classes
        $baseWhereClause .= " AND c.owner_user_id = ?";
        $baseParams[] = $userId;
    } elseif ($userRole === 'coordinator') {
        // Coordinators see all classes
        // No additional filter
    } elseif ($userRole === 'admin') {
        // Admins see all classes
        // No additional filter
    }
    
    if ($classId > 0) {
        $baseWhereClause .= " AND c.id = ?";
        $baseParams[] = $classId;
    }
    
    // Build WHERE clause with date filters (for activity-related queries)
    $whereClause = $baseWhereClause;
    $params = $baseParams;
    
    // Date filter (only for activity-related queries)
    if ($dateFrom) {
        $whereClause .= " AND DATE(aa.submitted_at) >= ?";
        $params[] = $dateFrom;
    }
    if ($dateTo) {
        $whereClause .= " AND DATE(aa.submitted_at) <= ?";
        $params[] = $dateTo;
    }
    
    // Total students enrolled (no date filter, no activity_attempts table)
    $stmt = $db->prepare("
        SELECT COUNT(DISTINCT cs.student_user_id) as total_students
        FROM class_students cs
        INNER JOIN classes c ON cs.class_id = c.id
        $baseWhereClause
    ");
    $stmt->execute($baseParams);
    $stats['total_students'] = (int)$stmt->fetchColumn();
    
    // Total classes (no date filter needed)
    $classWhereClause = "WHERE 1=1";
    $classParams = [];
    if ($userRole === 'teacher') {
        $classWhereClause .= " AND c.owner_user_id = ?";
        $classParams[] = $userId;
    }
    if ($classId > 0) {
        $classWhereClause .= " AND c.id = ?";
        $classParams[] = $classId;
    }
    $stmt = $db->prepare("
        SELECT COUNT(DISTINCT c.id) as total_classes
        FROM classes c
        $classWhereClause
    ");
    $stmt->execute($classParams);
    $stats['total_classes'] = (int)$stmt->fetchColumn();
    
    // Build additional WHERE conditions (without WHERE keyword for use in existing WHERE clauses)
    $additionalWhere = str_replace("WHERE ", "AND ", $whereClause);
    
    // Total activities completed
    $stmt = $db->prepare("
        SELECT COUNT(DISTINCT aa.id) as total_completed
        FROM activity_attempts aa
        INNER JOIN class_students cs ON aa.user_id = cs.student_user_id
        INNER JOIN classes c ON cs.class_id = c.id
        INNER JOIN lesson_activities la ON aa.activity_id = la.id
        INNER JOIN course_lessons cl ON la.lesson_id = cl.id
        INNER JOIN course_modules cm ON cl.module_id = cm.id
        WHERE cm.course_id = c.course_id
        $additionalWhere
        AND aa.submitted_at IS NOT NULL
        AND aa.is_preview = 0
        AND aa.role = 'student'
    ");
    $stmt->execute($params);
    $stats['total_activities_completed'] = (int)$stmt->fetchColumn();
    
    // Average score across all activities
    $stmt = $db->prepare("
        SELECT AVG(aa.score) as avg_score
        FROM activity_attempts aa
        INNER JOIN class_students cs ON aa.user_id = cs.student_user_id
        INNER JOIN classes c ON cs.class_id = c.id
        INNER JOIN lesson_activities la ON aa.activity_id = la.id
        INNER JOIN course_lessons cl ON la.lesson_id = cl.id
        INNER JOIN course_modules cm ON cl.module_id = cm.id
        WHERE cm.course_id = c.course_id
        $additionalWhere
        AND aa.submitted_at IS NOT NULL
        AND aa.score IS NOT NULL
        AND aa.is_preview = 0
        AND aa.role = 'student'
    ");
    $stmt->execute($params);
    $avgScore = $stmt->fetchColumn();
    $stats['average_score'] = $avgScore ? round((float)$avgScore, 2) : 0;
    
    // Top performers (top 10 students)
    $stmt = $db->prepare("
        SELECT 
            u.id,
            u.firstname,
            u.middlename,
            u.lastname,
            u.id_number,
            AVG(aa.score) as avg_score,
            COUNT(aa.id) as activities_completed
        FROM users u
        INNER JOIN class_students cs ON u.id = cs.student_user_id
        INNER JOIN classes c ON cs.class_id = c.id
        LEFT JOIN activity_attempts aa ON aa.user_id = u.id
        LEFT JOIN lesson_activities la ON aa.activity_id = la.id
        LEFT JOIN course_lessons cl ON la.lesson_id = cl.id
        LEFT JOIN course_modules cm ON cl.module_id = cm.id
        WHERE (aa.id IS NULL OR cm.course_id = c.course_id)
            AND (aa.id IS NULL OR (aa.submitted_at IS NOT NULL
            AND aa.score IS NOT NULL
            AND aa.is_preview = 0
            AND aa.role = 'student'))
        $additionalWhere
        GROUP BY u.id, u.firstname, u.middlename, u.lastname, u.id_number
        HAVING activities_completed > 0
        ORDER BY avg_score DESC, activities_completed DESC
        LIMIT 10
    ");
    $stmt->execute($params);
    $stats['top_performers'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Class performance summary
    $stmt = $db->prepare("
        SELECT 
            c.id,
            c.name as class_name,
            co.code as course_code,
            co.title as course_title,
            COUNT(DISTINCT cs.student_user_id) as students_enrolled,
            COUNT(DISTINCT aa.id) as activities_completed,
            AVG(aa.score) as avg_score
        FROM classes c
        INNER JOIN courses co ON c.course_id = co.id
        LEFT JOIN class_students cs ON c.id = cs.class_id AND cs.status = 'accepted'
        LEFT JOIN activity_attempts aa ON aa.user_id = cs.student_user_id
        LEFT JOIN lesson_activities la ON aa.activity_id = la.id
        LEFT JOIN course_lessons cl ON la.lesson_id = cl.id
        LEFT JOIN course_modules cm ON cl.module_id = cm.id
        WHERE (aa.id IS NULL OR cm.course_id = co.id)
            AND (aa.id IS NULL OR (aa.submitted_at IS NOT NULL
            AND aa.score IS NOT NULL
            AND aa.is_preview = 0
            AND aa.role = 'student'))
        " . ($userRole === 'teacher' ? "AND c.owner_user_id = ?" : "") . "
        " . ($classId > 0 ? "AND c.id = ?" : "") . "
        GROUP BY c.id, c.name, co.code, co.title
        ORDER BY avg_score DESC
    ");
    $classParams = [];
    if ($userRole === 'teacher') {
        $classParams[] = $userId;
    }
    if ($classId > 0) {
        $classParams[] = $classId;
    }
    $stmt->execute($classParams);
    $stats['class_performance'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    return ['success' => true, 'data' => $stats];
}

/**
 * Get class-specific report
 */
function getClassReport($db, $userId, $userRole, $classId, $dateFrom, $dateTo) {
    error_log("🔍 [getClassReport] START - Class ID: $classId, User ID: $userId, Role: $userRole");
    
    try {
        // Verify class access
        $stmt = $db->prepare("SELECT c.*, co.code as course_code, co.title as course_title 
                              FROM classes c 
                              INNER JOIN courses co ON c.course_id = co.id 
                              WHERE c.id = ?");
        $stmt->execute([$classId]);
        $class = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$class) {
            error_log("❌ [getClassReport] Class not found: $classId");
            return ['success' => false, 'message' => 'Class not found'];
        }
        
        error_log("✅ [getClassReport] Class found: " . ($class['name'] ?? 'Unknown'));
        
        // Check teacher access
        if ($userRole === 'teacher' && (int)$class['owner_user_id'] !== $userId) {
            error_log("❌ [getClassReport] Access denied for teacher $userId");
            return ['success' => false, 'message' => 'Access denied'];
        }
        
        // Ensure class_info is properly set
        $report = [
            'class_info' => [
                'id' => $class['id'],
                'name' => $class['name'] ?? '',
                'code' => $class['code'] ?? '',
                'course_code' => $class['course_code'] ?? '',
                'course_title' => $class['course_title'] ?? ''
            ],
            'statistics' => [],
            'student_performance' => []
        ];
        
        error_log("✅ [getClassReport] Report structure initialized");
        
        // Get statistics
        $whereClause = "WHERE cs.class_id = ? AND cs.status = 'accepted'";
        $params = [$classId];
        
        if ($dateFrom) {
            $whereClause .= " AND DATE(aa.submitted_at) >= ?";
            $params[] = $dateFrom;
        }
        if ($dateTo) {
            $whereClause .= " AND DATE(aa.submitted_at) <= ?";
            $params[] = $dateTo;
        }
        
        // Students enrolled
        $stmt = $db->prepare("SELECT COUNT(*) FROM class_students WHERE class_id = ? AND status = 'accepted'");
        $stmt->execute([$classId]);
        $report['statistics']['students_enrolled'] = (int)$stmt->fetchColumn();
        
        // Build additional WHERE conditions for class report
        $classReportWhere = str_replace("WHERE ", "AND ", $whereClause);
        
        // Average grade
        $stmt = $db->prepare("
            SELECT AVG(aa.score) as avg_grade
            FROM activity_attempts aa
            INNER JOIN class_students cs ON aa.user_id = cs.student_user_id
            INNER JOIN lesson_activities la ON aa.activity_id = la.id
            INNER JOIN course_lessons cl ON la.lesson_id = cl.id
            INNER JOIN course_modules cm ON cl.module_id = cm.id
            INNER JOIN classes c ON cs.class_id = c.id
            WHERE cm.course_id = c.course_id
            $classReportWhere
            AND aa.submitted_at IS NOT NULL
            AND aa.score IS NOT NULL
            AND aa.is_preview = 0
            AND aa.role = 'student'
        ");
        $stmt->execute($params);
        $avgGrade = $stmt->fetchColumn();
        $report['statistics']['average_grade'] = $avgGrade ? round((float)$avgGrade, 2) : 0;
        
        // Activities completed
        $stmt = $db->prepare("
            SELECT COUNT(DISTINCT aa.id) as completed
            FROM activity_attempts aa
            INNER JOIN class_students cs ON aa.user_id = cs.student_user_id
            INNER JOIN lesson_activities la ON aa.activity_id = la.id
            INNER JOIN course_lessons cl ON la.lesson_id = cl.id
            INNER JOIN course_modules cm ON cl.module_id = cm.id
            INNER JOIN classes c ON cs.class_id = c.id
            WHERE cm.course_id = c.course_id
            $classReportWhere
            AND aa.submitted_at IS NOT NULL
            AND aa.is_preview = 0
            AND aa.role = 'student'
        ");
        $stmt->execute($params);
        $report['statistics']['activities_completed'] = (int)$stmt->fetchColumn();
        
        // Get student performance
        // Show ALL accepted students, but filter activities by date in CASE statements
        $studentParams = [$classId];
        
        // Build date condition for CASE statements
        $dateCondition = '';
        if ($dateFrom && $dateTo) {
            $dateCondition = " AND DATE(aa.submitted_at) >= ? AND DATE(aa.submitted_at) <= ?";
        } elseif ($dateFrom) {
            $dateCondition = " AND DATE(aa.submitted_at) >= ?";
        } elseif ($dateTo) {
            $dateCondition = " AND DATE(aa.submitted_at) <= ?";
        }
        
        // Build params: classId first, then date params repeated 4 times (once per CASE)
        $allParams = [$classId];
        if ($dateFrom || $dateTo) {
            for ($i = 0; $i < 4; $i++) { // 4 CASE statements
                if ($dateFrom) $allParams[] = $dateFrom;
                if ($dateTo) $allParams[] = $dateTo;
            }
        }
        
        $stmt = $db->prepare("
            SELECT 
                u.id,
                u.firstname,
                u.middlename,
                u.lastname,
                u.id_number,
                COUNT(DISTINCT CASE 
                    WHEN aa.id IS NOT NULL 
                        AND aa.submitted_at IS NOT NULL 
                        AND aa.score IS NOT NULL 
                        AND aa.is_preview = 0 
                        AND aa.role = 'student'
                        AND cm.course_id = c.course_id
                        $dateCondition
                    THEN aa.id 
                END) as activities_completed,
                AVG(CASE 
                    WHEN aa.id IS NOT NULL 
                        AND aa.submitted_at IS NOT NULL 
                        AND aa.score IS NOT NULL 
                        AND aa.is_preview = 0 
                        AND aa.role = 'student'
                        AND cm.course_id = c.course_id
                        $dateCondition
                    THEN aa.score 
                END) as avg_score,
                MAX(CASE 
                    WHEN aa.id IS NOT NULL 
                        AND aa.submitted_at IS NOT NULL 
                        AND aa.score IS NOT NULL 
                        AND aa.is_preview = 0 
                        AND aa.role = 'student'
                        AND cm.course_id = c.course_id
                        $dateCondition
                    THEN aa.score 
                END) as highest_score,
                MIN(CASE 
                    WHEN aa.id IS NOT NULL 
                        AND aa.submitted_at IS NOT NULL 
                        AND aa.score IS NOT NULL 
                        AND aa.is_preview = 0 
                        AND aa.role = 'student'
                        AND cm.course_id = c.course_id
                        $dateCondition
                    THEN aa.score 
                END) as lowest_score
            FROM users u
            INNER JOIN class_students cs ON u.id = cs.student_user_id
            INNER JOIN classes c ON cs.class_id = c.id
            LEFT JOIN activity_attempts aa ON aa.user_id = u.id
            LEFT JOIN lesson_activities la ON aa.activity_id = la.id
            LEFT JOIN course_lessons cl ON la.lesson_id = cl.id
            LEFT JOIN course_modules cm ON cl.module_id = cm.id
            WHERE cs.class_id = ? AND cs.status = 'accepted'
            GROUP BY u.id, u.firstname, u.middlename, u.lastname, u.id_number
            ORDER BY avg_score DESC
        ");
        
        try {
            $stmt->execute($allParams);
            $report['student_performance'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("❌ [getClassReport] SQL Error: " . $e->getMessage());
            error_log("❌ [getClassReport] Query: " . $stmt->queryString);
            error_log("❌ [getClassReport] Params: " . json_encode($allParams));
            $report['student_performance'] = [];
        }
        
        // Debug logging
        error_log("📊 [getClassReport] Class ID: $classId");
        error_log("📊 [getClassReport] Students found: " . count($report['student_performance']));
        error_log("📊 [getClassReport] Class info keys: " . implode(', ', array_keys($report['class_info'] ?? [])));
        error_log("📊 [getClassReport] Statistics keys: " . implode(', ', array_keys($report['statistics'] ?? [])));
        error_log("📊 [getClassReport] Report structure keys: " . implode(', ', array_keys($report)));
        
        $response = ['success' => true, 'data' => $report];
        error_log("✅ [getClassReport] Returning response. Data keys: " . implode(', ', array_keys($response['data'])));
        return $response;
        
    } catch (Throwable $e) {
        error_log("❌ [getClassReport] EXCEPTION: " . $e->getMessage());
        error_log("❌ [getClassReport] Stack trace: " . $e->getTraceAsString());
        return ['success' => false, 'message' => 'Error generating class report: ' . $e->getMessage()];
    }
}

/**
 * Get student-specific report
 */
function getStudentReport($db, $userId, $userRole, $studentId, $classId, $dateFrom, $dateTo) {
    error_log("🔍 [getStudentReport] Starting - studentId: $studentId, classId: $classId, userId: $userId, role: $userRole");
    
    // Verify student access
    $whereClause = "WHERE u.id = ?";
    $params = [$studentId];
    
    if ($classId > 0) {
        $whereClause .= " AND cs.class_id = ?";
        $params[] = $classId;
        error_log("🔍 [getStudentReport] Filtering by classId: $classId");
    }
    
    if ($userRole === 'teacher') {
        $whereClause .= " AND c.owner_user_id = ?";
        $params[] = $userId;
        error_log("🔍 [getStudentReport] Teacher access check - owner_user_id: $userId");
    }
    
    $sql = "
        SELECT u.*, cs.class_id, c.name as class_name, cs.status as enrollment_status
        FROM users u
        INNER JOIN class_students cs ON u.id = cs.student_user_id
        INNER JOIN classes c ON cs.class_id = c.id
        $whereClause
        AND cs.status = 'accepted'
        LIMIT 1
    ";
    
    error_log("🔍 [getStudentReport] SQL: " . $sql);
    error_log("🔍 [getStudentReport] Params: " . json_encode($params));
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$student) {
        // Debug: Check if student exists at all
        $checkStmt = $db->prepare("SELECT id, firstname, lastname FROM users WHERE id = ?");
        $checkStmt->execute([$studentId]);
        $studentExists = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        // Debug: Check if student is enrolled in any class
        $enrollStmt = $db->prepare("
            SELECT cs.class_id, cs.status, c.name as class_name, c.owner_user_id 
            FROM class_students cs 
            INNER JOIN classes c ON cs.class_id = c.id 
            WHERE cs.student_user_id = ?
        ");
        $enrollStmt->execute([$studentId]);
        $enrollments = $enrollStmt->fetchAll(PDO::FETCH_ASSOC);
        
        error_log("❌ [getStudentReport] Student not found!");
        error_log("❌ [getStudentReport] Student exists: " . ($studentExists ? 'YES' : 'NO'));
        if ($studentExists) {
            error_log("❌ [getStudentReport] Student name: " . ($studentExists['firstname'] ?? '') . ' ' . ($studentExists['lastname'] ?? ''));
        }
        error_log("❌ [getStudentReport] Enrollments: " . json_encode($enrollments));
        
        if ($classId > 0) {
            $classCheck = $db->prepare("SELECT id, name, owner_user_id FROM classes WHERE id = ?");
            $classCheck->execute([$classId]);
            $classInfo = $classCheck->fetch(PDO::FETCH_ASSOC);
            error_log("❌ [getStudentReport] Class info: " . json_encode($classInfo));
        }
        
        return ['success' => false, 'message' => 'Student not found or access denied'];
    }
    
    error_log("✅ [getStudentReport] Student found: " . ($student['firstname'] ?? '') . ' ' . ($student['lastname'] ?? ''));
    
    // Get student performance
    $report = [
        'student_info' => $student,
        'performance' => []
    ];
    
    // Get class course_id to filter activities
    $classStmt = $db->prepare("SELECT course_id FROM classes WHERE id = ?");
    $classStmt->execute([$student['class_id']]);
    $classData = $classStmt->fetch(PDO::FETCH_ASSOC);
    $courseId = $classData['course_id'] ?? 0;
    
    error_log("🔍 [getStudentReport] Course ID: $courseId, Class ID: " . $student['class_id']);
    
    // IMPORTANT: Include ALL submissions (even pending ones without scores)
    // NOTE: submitted_at can be NULL, so we check if there's a score or created_at instead
    $activityWhere = "WHERE aa.user_id = ? AND (aa.submitted_at IS NOT NULL OR aa.score IS NOT NULL OR aa.created_at IS NOT NULL) AND aa.is_preview = 0 AND aa.role = 'student'";
    $activityParams = [$studentId];
    
    if ($courseId > 0) {
        $activityWhere .= " AND EXISTS (
            SELECT 1 FROM lesson_activities la
            INNER JOIN course_lessons cl ON la.lesson_id = cl.id
            INNER JOIN course_modules cm ON cl.module_id = cm.id
            WHERE la.id = aa.activity_id AND cm.course_id = ?
        )";
        $activityParams[] = $courseId;
    }
    
    if ($dateFrom) {
        $activityWhere .= " AND DATE(COALESCE(aa.submitted_at, aa.created_at, aa.started_at)) >= ?";
        $activityParams[] = $dateFrom;
    }
    if ($dateTo) {
        $activityWhere .= " AND DATE(COALESCE(aa.submitted_at, aa.created_at, aa.started_at)) <= ?";
        $activityParams[] = $dateTo;
    }
    
    $sql = "
        SELECT 
            la.id as activity_id,
            la.title as activity_title,
            la.type as activity_type,
            aa.score,
            COALESCE(aa.submitted_at, aa.created_at, aa.started_at) as submitted_at,
            aa.id as attempt_id,
            CASE 
                WHEN aa.score IS NULL THEN 'Pending'
                ELSE 'Graded'
            END as status
        FROM activity_attempts aa
        INNER JOIN lesson_activities la ON aa.activity_id = la.id
        $activityWhere
        ORDER BY 
            CASE WHEN aa.score IS NULL THEN 1 ELSE 0 END,
            COALESCE(aa.submitted_at, aa.created_at, aa.started_at) DESC
    ";
    
    error_log("🔍 [getStudentReport] SQL: " . $sql);
    error_log("🔍 [getStudentReport] Params: " . json_encode($activityParams));
    
    try {
        $stmt = $db->prepare($sql);
        $stmt->execute($activityParams);
        $report['performance'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        error_log("✅ [getStudentReport] Found " . count($report['performance']) . " performance records");
    } catch (PDOException $e) {
        error_log("❌ [getStudentReport] SQL Error: " . $e->getMessage());
        error_log("❌ [getStudentReport] SQL Error Info: " . json_encode($e->errorInfo ?? []));
        $report['performance'] = [];
    }
    
    // Debug: Check if there are any submissions at all for this student
    if (count($report['performance']) === 0) {
        $debugStmt = $db->prepare("
            SELECT COUNT(*) as total
            FROM activity_attempts aa
            WHERE aa.user_id = ? 
                AND aa.submitted_at IS NOT NULL 
                AND aa.is_preview = 0 
                AND aa.role = 'student'
        ");
        $debugStmt->execute([$studentId]);
        $totalSubmissions = $debugStmt->fetchColumn();
        error_log("⚠️ [getStudentReport] No performance data found. Total submissions (all courses): $totalSubmissions");
        
        if ($courseId > 0) {
            $debugCourseStmt = $db->prepare("
                SELECT COUNT(*) as total
                FROM activity_attempts aa
                INNER JOIN lesson_activities la ON aa.activity_id = la.id
                INNER JOIN course_lessons cl ON la.lesson_id = cl.id
                INNER JOIN course_modules cm ON cl.module_id = cm.id
                WHERE aa.user_id = ? 
                    AND aa.submitted_at IS NOT NULL 
                    AND aa.is_preview = 0 
                    AND aa.role = 'student'
                    AND cm.course_id = ?
            ");
            $debugCourseStmt->execute([$studentId, $courseId]);
            $courseSubmissions = $debugCourseStmt->fetchColumn();
            error_log("⚠️ [getStudentReport] Submissions for course $courseId: $courseSubmissions");
        }
    }
    
    error_log("📊 [getStudentReport] Student ID: $studentId, Performance records: " . count($report['performance']));
    
    return ['success' => true, 'data' => $report];
}

/**
 * Get activity-specific report
 */
function getActivityReport($db, $userId, $userRole, $activityId, $classId, $dateFrom, $dateTo) {
    error_log("🔍 [getActivityReport] START - Activity ID: $activityId, Class ID: $classId, User ID: $userId, Role: $userRole");
    
    // FIRST: Check if activity exists and get basic info
    $stmt = $db->prepare("
        SELECT la.*, cl.id as lesson_id, cm.id as module_id, cm.course_id
        FROM lesson_activities la
        INNER JOIN course_lessons cl ON la.lesson_id = cl.id
        INNER JOIN course_modules cm ON cl.module_id = cm.id
        WHERE la.id = ?
        LIMIT 1
    ");
    $stmt->execute([$activityId]);
    $activity = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$activity) {
        error_log("❌ [getActivityReport] Activity not found: $activityId");
        return ['success' => false, 'message' => 'Activity not found'];
    }
    
    error_log("✅ [getActivityReport] Activity found: " . ($activity['title'] ?? 'Unknown') . " (Course ID: " . ($activity['course_id'] ?? 'N/A') . ")");
    
    // Check if class exists and verify access
    if ($classId > 0) {
        $classStmt = $db->prepare("SELECT c.*, co.id as course_id FROM classes c INNER JOIN courses co ON c.course_id = co.id WHERE c.id = ? LIMIT 1");
        $classStmt->execute([$classId]);
        $class = $classStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$class) {
            error_log("❌ [getActivityReport] Class not found: $classId");
            return ['success' => false, 'message' => 'Class not found'];
        }
        
        // Verify activity belongs to class's course
        if ((int)$class['course_id'] !== (int)$activity['course_id']) {
            error_log("❌ [getActivityReport] Activity course mismatch. Activity course: " . $activity['course_id'] . ", Class course: " . $class['course_id']);
            return ['success' => false, 'message' => 'Activity does not belong to this class'];
        }
        
        // Check teacher access
        if ($userRole === 'teacher' && (int)$class['owner_user_id'] !== $userId) {
            error_log("❌ [getActivityReport] Access denied for teacher $userId");
            return ['success' => false, 'message' => 'Access denied'];
        }
        
        $activity['class_id'] = $class['id'];
        $activity['class_name'] = $class['name'];
        error_log("✅ [getActivityReport] Class verified: " . ($class['name'] ?? 'Unknown'));
    }
    
    // DEBUG: Check total submissions for this activity (without class filter)
    $debugStmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM activity_attempts aa
        WHERE aa.activity_id = ?
            AND aa.submitted_at IS NOT NULL
            AND aa.score IS NOT NULL
            AND aa.is_preview = 0
            AND aa.role = 'student'
    ");
    $debugStmt->execute([$activityId]);
    $totalSubmissions = $debugStmt->fetchColumn();
    error_log("📊 [getActivityReport] Total submissions for activity $activityId (all classes): $totalSubmissions");
    
    // DEBUG: Check submissions for this activity in this class (if classId provided)
    if ($classId > 0) {
        $debugClassStmt = $db->prepare("
            SELECT COUNT(*) as total
            FROM activity_attempts aa
            INNER JOIN class_students cs ON aa.user_id = cs.student_user_id
            WHERE aa.activity_id = ?
                AND cs.class_id = ?
                AND cs.status = 'accepted'
                AND aa.submitted_at IS NOT NULL
                AND aa.score IS NOT NULL
                AND aa.is_preview = 0
                AND aa.role = 'student'
        ");
        $debugClassStmt->execute([$activityId, $classId]);
        $classSubmissions = $debugClassStmt->fetchColumn();
        error_log("📊 [getActivityReport] Submissions for activity $activityId in class $classId: $classSubmissions");
    }
    
    // Get activity performance
    $report = [
        'activity_info' => $activity,
        'performance' => []
    ];
    
    // Build WHERE clause for activity report
    // IMPORTANT: Include submissions even if score is NULL (pending grading)
    // NOTE: submitted_at can be NULL, so we check if there's a score or created_at instead
    $performanceParams = [$activityId];
    $whereConditions = "WHERE aa.activity_id = ? 
        AND (aa.submitted_at IS NOT NULL OR aa.score IS NOT NULL OR aa.created_at IS NOT NULL)
        AND aa.is_preview = 0 
        AND aa.role = 'student'
        AND cm.course_id = c.course_id
        AND cs.status = 'accepted'";
    
    if ($classId > 0) {
        $whereConditions .= " AND cs.class_id = ?";
        $performanceParams[] = $classId;
    }
    
    if ($dateFrom) {
        $whereConditions .= " AND DATE(COALESCE(aa.submitted_at, aa.created_at, aa.started_at)) >= ?";
        $performanceParams[] = $dateFrom;
    }
    if ($dateTo) {
        $whereConditions .= " AND DATE(COALESCE(aa.submitted_at, aa.created_at, aa.started_at)) <= ?";
        $performanceParams[] = $dateTo;
    }
    
    $query = "
        SELECT 
            u.id,
            u.firstname,
            u.middlename,
            u.lastname,
            u.id_number,
            aa.score,
            COALESCE(aa.submitted_at, aa.created_at, aa.started_at) as submitted_at,
            aa.id as attempt_id,
            CASE 
                WHEN aa.score IS NULL THEN 'Pending'
                ELSE 'Graded'
            END as status
        FROM activity_attempts aa
        INNER JOIN users u ON aa.user_id = u.id
        INNER JOIN class_students cs ON aa.user_id = cs.student_user_id
        INNER JOIN classes c ON cs.class_id = c.id
        INNER JOIN lesson_activities la ON aa.activity_id = la.id
        INNER JOIN course_lessons cl ON la.lesson_id = cl.id
        INNER JOIN course_modules cm ON cl.module_id = cm.id
        $whereConditions
        ORDER BY 
            CASE WHEN aa.score IS NULL THEN 1 ELSE 0 END,
            aa.score DESC, 
            COALESCE(aa.submitted_at, aa.created_at, aa.started_at) DESC
    ";
    
    error_log("📊 [getActivityReport] Final Query: " . $query);
    error_log("📊 [getActivityReport] Final Params: " . json_encode($performanceParams));
    
    $stmt = $db->prepare($query);
    
    try {
        $stmt->execute($performanceParams);
        $report['performance'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        error_log("📊 [getActivityReport] Activity ID: $activityId, Class ID: $classId, Performance records: " . count($report['performance']));
        
        if (count($report['performance']) === 0) {
            error_log("⚠️ [getActivityReport] No performance data found. Checking if there are any submissions at all...");
            
            // Additional debug: Check if there are submissions but they don't match the filters
            $checkStmt = $db->prepare("
                SELECT COUNT(*) as cnt
                FROM activity_attempts aa
                WHERE aa.activity_id = ?
                    AND aa.submitted_at IS NOT NULL
                    AND aa.is_preview = 0
                    AND aa.role = 'student'
            ");
            $checkStmt->execute([$activityId]);
            $totalWithSubmissions = $checkStmt->fetchColumn();
            error_log("📊 [getActivityReport] Total attempts with submissions (no score filter): $totalWithSubmissions");
            
            // Check submissions without score requirement
            $checkScoreStmt = $db->prepare("
                SELECT COUNT(*) as cnt
                FROM activity_attempts aa
                WHERE aa.activity_id = ?
                    AND aa.submitted_at IS NOT NULL
                    AND aa.score IS NOT NULL
                    AND aa.is_preview = 0
                    AND aa.role = 'student'
            ");
            $checkScoreStmt->execute([$activityId]);
            $totalWithScore = $checkScoreStmt->fetchColumn();
            error_log("📊 [getActivityReport] Total attempts with score: $totalWithScore");
            
            if ($classId > 0) {
                // Check if students are enrolled in this class
                $checkEnrolledStmt = $db->prepare("
                    SELECT COUNT(*) as cnt
                    FROM class_students cs
                    WHERE cs.class_id = ?
                        AND cs.status = 'accepted'
                ");
                $checkEnrolledStmt->execute([$classId]);
                $enrolledCount = $checkEnrolledStmt->fetchColumn();
                error_log("📊 [getActivityReport] Students enrolled in class $classId: $enrolledCount");
                
                // Check attempts in class without score filter
                $checkClassStmt = $db->prepare("
                    SELECT COUNT(*) as cnt
                    FROM activity_attempts aa
                    INNER JOIN class_students cs ON aa.user_id = cs.student_user_id
                    WHERE aa.activity_id = ?
                        AND cs.class_id = ?
                        AND cs.status = 'accepted'
                        AND aa.submitted_at IS NOT NULL
                        AND aa.is_preview = 0
                        AND aa.role = 'student'
                ");
                $checkClassStmt->execute([$activityId, $classId]);
                $classAttempts = $checkClassStmt->fetchColumn();
                error_log("📊 [getActivityReport] Attempts in class $classId (no score filter): $classAttempts");
                
                // Check if course matches
                $checkCourseStmt = $db->prepare("
                    SELECT la.id, cm.course_id as activity_course, c.course_id as class_course
                    FROM lesson_activities la
                    INNER JOIN course_lessons cl ON la.lesson_id = cl.id
                    INNER JOIN course_modules cm ON cl.module_id = cm.id
                    CROSS JOIN classes c
                    WHERE la.id = ? AND c.id = ?
                    LIMIT 1
                ");
                $checkCourseStmt->execute([$activityId, $classId]);
                $courseMatch = $checkCourseStmt->fetch(PDO::FETCH_ASSOC);
                if ($courseMatch) {
                    error_log("📊 [getActivityReport] Course check - Activity course: " . ($courseMatch['activity_course'] ?? 'N/A') . ", Class course: " . ($courseMatch['class_course'] ?? 'N/A'));
                }
            }
        }
    } catch (PDOException $e) {
        error_log("❌ [getActivityReport] SQL Error: " . $e->getMessage());
        error_log("❌ [getActivityReport] Query: " . $stmt->queryString);
        error_log("❌ [getActivityReport] Params: " . json_encode($performanceParams));
        error_log("❌ [getActivityReport] Error Code: " . $e->getCode());
        $report['performance'] = [];
    }
    
    // Calculate statistics
    // Only count graded submissions (with scores) for statistics
    $gradedSubmissions = array_filter($report['performance'], function($item) {
        return $item['score'] !== null;
    });
    $scores = array_column($gradedSubmissions, 'score');
    $pendingCount = count($report['performance']) - count($gradedSubmissions);
    
    $report['statistics'] = [
        'total_submissions' => count($report['performance']),
        'graded_submissions' => count($gradedSubmissions),
        'pending_submissions' => $pendingCount,
        'average_score' => count($scores) > 0 ? round(array_sum($scores) / count($scores), 2) : 0,
        'highest_score' => count($scores) > 0 ? max($scores) : 0,
        'lowest_score' => count($scores) > 0 ? min($scores) : 0
    ];
    
    error_log("📊 [getActivityReport] Statistics: " . json_encode($report['statistics']));
    error_log("📊 [getActivityReport] Activity info: " . json_encode($activity));
    
    return ['success' => true, 'data' => $report];
}
?>

