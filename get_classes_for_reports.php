<?php
/**
 * GET CLASSES FOR REPORTS API
 * Returns list of classes based on user role (Admin, Coordinator, Teacher)
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');
ob_start();

// Session handling
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

require_once __DIR__ . '/classes/auth_helpers.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/ClassService.php';

Auth::requireAuth();

$db = (new Database())->getConnection();
$userId = $_SESSION['user_id'] ?? 0;
$userRole = strtolower(trim($_SESSION['user_role'] ?? ''));

// Permission check
if (!in_array($userRole, ['admin', 'coordinator', 'teacher'])) {
    ob_clean();
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied']);
    exit;
}

try {
    $service = new ClassService($db);
    $classes = [];

    if ($userRole === 'teacher') {
        // Teachers see only their classes
        $classes = $service->getClassesByOwner($userId);
    } else {
        // Admin and Coordinator see all classes
        $stmt = $db->query("
            SELECT 
                c.*,
                co.code as course_code,
                co.title as course_title,
                COUNT(DISTINCT cs.student_user_id) as student_count
            FROM classes c
            INNER JOIN courses co ON c.course_id = co.id
            LEFT JOIN class_students cs ON c.id = cs.class_id AND cs.status = 'accepted'
            WHERE c.status = 'active'
            GROUP BY c.id
            ORDER BY c.created_at DESC
            LIMIT 200
        ");
        $classes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Format classes
    $formattedClasses = array_map(function($class) {
        return [
            'id' => (int)$class['id'],
            'name' => $class['name'] ?? "Class {$class['id']}",
            'code' => $class['code'] ?? '',
            'course_code' => $class['course_code'] ?? '',
            'course_title' => $class['course_title'] ?? '',
            'student_count' => (int)($class['student_count'] ?? 0)
        ];
    }, $classes);

    ob_clean();
    echo json_encode(['success' => true, 'classes' => $formattedClasses]);

} catch (Throwable $e) {
    ob_clean();
    error_log("❌ [get_classes_for_reports] Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>

