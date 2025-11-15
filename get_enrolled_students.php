<?php
/**
 * Get Enrolled Students API
 * Returns list of all students enrolled in a class
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
    error_log("get_enrolled_students.php - Unexpected output: " . substr($obContent, 0, 500));
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

// Allow both teacher and admin
if ($userRole !== 'teacher' && $userRole !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied. Teacher or Admin only.']);
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
    
    // Verify teacher owns this class (skip for admin)
    if ($userRole !== 'admin') {
        $stmt = $db->prepare("SELECT id FROM classes WHERE id = ? AND owner_user_id = ? AND status = 'active'");
        $stmt->execute([$classId, $userId]);
        if (!$stmt->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Access denied']);
            exit;
        }
    } else {
        // For admin, just verify class exists and is active
        $stmt = $db->prepare("SELECT id FROM classes WHERE id = ? AND status = 'active'");
        $stmt->execute([$classId]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Class not found']);
            exit;
        }
    }
    
    // Get all enrolled students with status
    // Check if status column exists
    $hasStatus = false;
    try {
        $checkStmt = $db->query("SHOW COLUMNS FROM class_students LIKE 'status'");
        $hasStatus = $checkStmt->rowCount() > 0;
    } catch (Exception $e) {
        // Column doesn't exist
    }
    
    if ($hasStatus) {
        $studentsStmt = $db->prepare("
            SELECT 
                u.id as student_id,
                u.firstname,
                u.middlename,
                u.lastname,
                u.id_number,
                u.email,
                cs.joined_at as enrolled_at,
                cs.status
            FROM class_students cs
            INNER JOIN users u ON cs.student_user_id = u.id
            WHERE cs.class_id = ? AND u.status = 'active'
            ORDER BY 
                CASE cs.status 
                    WHEN 'pending' THEN 1 
                    WHEN 'accepted' THEN 2 
                    WHEN 'rejected' THEN 3 
                END,
                u.lastname, u.firstname
        ");
    } else {
        // Fallback for old schema
        $studentsStmt = $db->prepare("
            SELECT 
                u.id as student_id,
                u.firstname,
                u.middlename,
                u.lastname,
                u.id_number,
                u.email,
                cs.joined_at as enrolled_at,
                'accepted' as status
            FROM class_students cs
            INNER JOIN users u ON cs.student_user_id = u.id
            WHERE cs.class_id = ? AND u.status = 'active'
            ORDER BY u.lastname, u.firstname
        ");
    }
    $studentsStmt->execute([$classId]);
    $students = $studentsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format student data
    $formattedStudents = [];
    foreach ($students as $student) {
        $studentName = trim($student['firstname'] . ' ' . 
            (isset($student['middlename']) && $student['middlename'] ? substr($student['middlename'], 0, 1) . '. ' : '') . 
            $student['lastname']);
        
        $formattedStudents[] = [
            'student_id' => (int)$student['student_id'],
            'name' => $studentName,
            'id_number' => $student['id_number'] ?? '',
            'email' => $student['email'] ?? '',
            'enrolled_at' => $student['enrolled_at'],
            'status' => $student['status'] ?? 'accepted' // Default to accepted if column doesn't exist
        ];
    }
    
    // Clean output buffer before sending final response
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    echo json_encode([
        'success' => true,
        'data' => $formattedStudents,
        'count' => count($formattedStudents)
    ]);
    exit;
    
} catch (PDOException $e) {
    $errorInfo = $e->errorInfo ?? [];
    error_log("Database error in get_enrolled_students.php: " . $e->getMessage());
    error_log("SQL Error Info: " . json_encode($errorInfo));
    
    // Clean any output before sending error
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
    exit;
} catch (Exception $e) {
    error_log("Error getting enrolled students: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    // Clean any output before sending error
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'Failed to get enrolled students',
        'error' => $e->getMessage()
    ]);
    exit;
}
?>

