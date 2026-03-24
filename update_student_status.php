<?php
/**
 * Update Student Status API
 * Allows teacher to accept/reject students in their class
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
    error_log("update_student_status.php - Unexpected output: " . substr($obContent, 0, 500));
    ob_start();
}

// Manual authentication check
if (empty($_SESSION['user_id'])) {
    if (ob_get_level()) {
        ob_clean();
    }
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$userId = (int)($_SESSION['user_id'] ?? 0);
$userRole = strtolower((string)($_SESSION['user_role'] ?? 'student'));

if ($userRole !== 'teacher') {
    if (ob_get_level()) {
        ob_clean();
    }
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied. Teacher only.']);
    exit;
}

// Get input
$input = json_decode(file_get_contents('php://input'), true);
$classId = isset($input['class_id']) ? (int)$input['class_id'] : 0;
$studentId = isset($input['student_id']) ? (int)$input['student_id'] : 0;
$status = isset($input['status']) ? trim($input['status']) : '';
$studentIdsInput = $input['student_ids'] ?? [];
$bulkStudentIds = [];

if (is_array($studentIdsInput)) {
    foreach ($studentIdsInput as $sid) {
        $sid = (int)$sid;
        if ($sid > 0) {
            $bulkStudentIds[] = $sid;
        }
    }
}

$targetStudentIds = $bulkStudentIds;
if (empty($targetStudentIds) && $studentId > 0) {
    $targetStudentIds = [$studentId];
}
$isBulkOperation = count($targetStudentIds) > 1;

if ($classId <= 0 || empty($targetStudentIds)) {
    if (ob_get_level()) {
        ob_clean();
    }
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid class ID or student ID(s)']);
    exit;
}

if (!in_array($status, ['pending', 'accepted', 'rejected'], true)) {
    if (ob_get_level()) {
        ob_clean();
    }
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid status. Must be: pending, accepted, or rejected']);
    exit;
}

try {
    $db = (new Database())->getConnection();
    
    // Verify teacher owns this class
    $stmt = $db->prepare("SELECT id FROM classes WHERE id = ? AND owner_user_id = ? AND status = 'active'");
    $stmt->execute([$classId, $userId]);
    if (!$stmt->fetch()) {
        if (ob_get_level()) {
            ob_clean();
        }
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }
    
    // Check if status column exists
    $hasStatus = false;
    try {
        $checkStmt = $db->query("SHOW COLUMNS FROM class_students LIKE 'status'");
        $hasStatus = $checkStmt->rowCount() > 0;
    } catch (Exception $e) {
        // Column doesn't exist
    }
    
    if (!$hasStatus) {
        if (ob_get_level()) {
            ob_clean();
        }
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Status column not found. Please run migration script: add_student_status_field.php'
        ]);
        exit;
    }
    
    // Verify student(s) is enrolled in this class
    $placeholders = implode(',', array_fill(0, count($targetStudentIds), '?'));
    $verifyStmt = $db->prepare("
        SELECT student_user_id 
        FROM class_students 
        WHERE class_id = ? AND student_user_id IN ($placeholders)
    ");
    $verifyStmt->execute(array_merge([$classId], $targetStudentIds));
    $foundIds = $verifyStmt->fetchAll(PDO::FETCH_COLUMN);
    $foundIds = array_map('intval', $foundIds);
    
    if (empty($foundIds)) {
        if (ob_get_level()) {
            ob_clean();
        }
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Student(s) not found in this class']);
        exit;
    }
    
    // Use only the IDs that actually belong to the class
    $targetStudentIds = $foundIds;
    $isBulkOperation = count($targetStudentIds) > 1;
    $placeholders = implode(',', array_fill(0, count($targetStudentIds), '?'));
    
    $affectedRows = 0;
    if ($status === 'rejected') {
        // Remove rejected students from the class entirely
        $deleteStmt = $db->prepare("
            DELETE FROM class_students 
            WHERE class_id = ? AND student_user_id IN ($placeholders)
        ");
        $deleteStmt->execute(array_merge([$classId], $targetStudentIds));
        $affectedRows = $deleteStmt->rowCount();
    } else {
        $statusFilter = '';
        if ($status === 'accepted') {
            $statusFilter = " AND status = 'pending'";
        }
        $updateStmt = $db->prepare("
            UPDATE class_students 
            SET status = ? 
            WHERE class_id = ? AND student_user_id IN ($placeholders)
            $statusFilter
        ");
        $updateStmt->execute(array_merge([$status, $classId], $targetStudentIds));
        $affectedRows = $updateStmt->rowCount();
    }
    
    // Log the action
    $targetList = implode(',', $targetStudentIds);
    error_log("Teacher {$userId} updated student(s) {$targetList} status to '{$status}' in class {$classId}");
    
    if (ob_get_level()) {
        ob_clean();
    }
    
    echo json_encode([
        'success' => true,
        'message' => $isBulkOperation 
            ? "Student statuses updated to '{$status}'"
            : "Student status updated to '{$status}'",
        'status' => $status,
        'updated_count' => $affectedRows,
        'removed_ids' => $status === 'rejected' ? $targetStudentIds : null
    ]);
    exit;
    
} catch (PDOException $e) {
    error_log("Database error in update_student_status.php: " . $e->getMessage());
    
    if (ob_get_level()) {
        ob_clean();
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
    error_log("Error updating student status: " . $e->getMessage());
    
    if (ob_get_level()) {
        ob_clean();
    }
    
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update student status',
        'error' => $e->getMessage()
    ]);
    exit;
}
?>


