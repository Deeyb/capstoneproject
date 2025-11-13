<?php
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
    error_log("get_student_enrollment_status.php - Unexpected output: " . substr($obContent, 0, 500));
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

if ($userRole !== 'student') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied. Student only.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

$classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : 0;

if ($classId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid class_id']);
    exit;
}

try {
    $db = (new Database())->getConnection();
    
    // Check if status column exists
    $hasStatus = false;
    try {
        $checkStmt = $db->query("SHOW COLUMNS FROM class_students LIKE 'status'");
        $hasStatus = $checkStmt->rowCount() > 0;
    } catch (Exception $e) {
        // Column doesn't exist
    }
    
    if ($hasStatus) {
        // Get student enrollment status
        $stmt = $db->prepare("SELECT status FROM class_students WHERE class_id = ? AND student_user_id = ?");
        $stmt->execute([$classId, $userId]);
        $enrollment = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$enrollment) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Student not enrolled in this class']);
            exit;
        }
        
        $status = $enrollment['status'] ?? 'accepted';
        
        // Clean output buffer before sending final response
        while (ob_get_level()) {
            ob_end_clean();
        }
        echo json_encode([
            'success' => true,
            'status' => $status,
            'is_accepted' => $status === 'accepted',
            'is_pending' => $status === 'pending',
            'is_rejected' => $status === 'rejected'
        ]);
        exit;
    } else {
        // Fallback for old schema - assume accepted
        while (ob_get_level()) {
            ob_end_clean();
        }
        echo json_encode([
            'success' => true,
            'status' => 'accepted',
            'is_accepted' => true,
            'is_pending' => false,
            'is_rejected' => false
        ]);
        exit;
    }
    
} catch (PDOException $e) {
    $errorInfo = $e->errorInfo ?? [];
    error_log("Database error in get_student_enrollment_status.php: " . $e->getMessage());
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
    error_log("Error getting student enrollment status: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    // Clean any output before sending error
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'Failed to get student enrollment status',
        'error' => $e->getMessage()
    ]);
    exit;
}
?>


