<?php
/**
 * Create Newsfeed Post
 * Allows students and teachers to create posts in the newsfeed
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
header('Content-Type: application/json; charset=utf-8');
ob_start();

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

$obContent = ob_get_clean();
if (!empty($obContent) && trim($obContent) !== '') {
    error_log("create_newsfeed_post.php - Unexpected output: " . substr($obContent, 0, 500));
    ob_start();
}

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$userId = (int)($_SESSION['user_id'] ?? 0);
$userRole = strtolower((string)($_SESSION['user_role'] ?? 'student'));

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$classId = (int)($input['class_id'] ?? 0);
$content = trim($input['content'] ?? '');

if ($classId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid class ID']);
    exit;
}

if (empty($content)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Post content cannot be empty']);
    exit;
}

if (strlen($content) > 5000) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Post content is too long (max 5000 characters)']);
    exit;
}

try {
    $db = (new Database())->getConnection();
    
    // Verify user has access to this class
    if ($userRole === 'student') {
        // Check if student is enrolled and accepted
        $hasStatus = false;
        try {
            $checkStmt = $db->query("SHOW COLUMNS FROM class_students LIKE 'status'");
            $hasStatus = $checkStmt->rowCount() > 0;
        } catch (Exception $e) {}
        
        if ($hasStatus) {
            $enrollStmt = $db->prepare("SELECT status FROM class_students WHERE class_id = ? AND student_user_id = ?");
            $enrollStmt->execute([$classId, $userId]);
            $enrollment = $enrollStmt->fetch(PDO::FETCH_ASSOC);
            if (!$enrollment || $enrollment['status'] !== 'accepted') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Access denied. You are not enrolled or not accepted.']);
                exit;
            }
        } else {
            $enrollStmt = $db->prepare("SELECT id FROM class_students WHERE class_id = ? AND student_user_id = ?");
            $enrollStmt->execute([$classId, $userId]);
            if (!$enrollStmt->fetch()) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Access denied. You are not enrolled.']);
                exit;
            }
        }
    } else if ($userRole === 'teacher') {
        // Check if teacher owns this class
        $teacherStmt = $db->prepare("SELECT id FROM classes WHERE id = ? AND owner_user_id = ? AND status = 'active'");
        $teacherStmt->execute([$classId, $userId]);
        if (!$teacherStmt->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Access denied. You do not own this class.']);
            exit;
        }
    } else {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied. Invalid role.']);
        exit;
    }
    
    // Create the post
    $insertStmt = $db->prepare("
        INSERT INTO class_posts (class_id, user_id, content)
        VALUES (?, ?, ?)
    ");
    $insertStmt->execute([$classId, $userId, $content]);
    $postId = $db->lastInsertId();
    
    // Get the created post with user info
    $postStmt = $db->prepare("
        SELECT 
            p.id,
            p.class_id,
            p.user_id,
            p.content,
            p.created_at,
            p.updated_at,
            u.firstname,
            u.middlename,
            u.lastname,
            u.role as user_role
        FROM class_posts p
        INNER JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
    ");
    $postStmt->execute([$postId]);
    $post = $postStmt->fetch(PDO::FETCH_ASSOC);
    
    // Format user name
    $fullName = trim(($post['firstname'] ?? '') . ' ' . ($post['middlename'] ?? '') . ' ' . ($post['lastname'] ?? ''));
    if (empty(trim($fullName))) {
        $fullName = 'Unknown User';
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Post created successfully',
        'post' => [
            'id' => (int)$post['id'],
            'class_id' => (int)$post['class_id'],
            'user_id' => (int)$post['user_id'],
            'user_name' => $fullName,
            'user_role' => $post['user_role'],
            'content' => $post['content'],
            'created_at' => $post['created_at'],
            'updated_at' => $post['updated_at'],
            'like_count' => 0,
            'heart_count' => 0,
            'user_reaction' => null,
            'comment_count' => 0
        ]
    ]);
    
} catch (PDOException $e) {
    error_log("Database error in create_newsfeed_post.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error occurred']);
} catch (Exception $e) {
    error_log("Error in create_newsfeed_post.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An unexpected error occurred']);
}
exit;
?>


