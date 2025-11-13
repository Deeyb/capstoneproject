<?php
/**
 * Create Post Comment
 * Allows users to comment on posts
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
    error_log("create_post_comment.php - Unexpected output: " . substr($obContent, 0, 500));
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
$postId = (int)($input['post_id'] ?? 0);
$content = trim($input['content'] ?? '');

if ($postId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid post ID']);
    exit;
}

if (empty($content)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Comment content cannot be empty']);
    exit;
}

if (strlen($content) > 2000) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Comment content is too long (max 2000 characters)']);
    exit;
}

try {
    $db = (new Database())->getConnection();
    
    // Verify post exists and user has access
    $postStmt = $db->prepare("
        SELECT p.id, p.class_id
        FROM class_posts p
        WHERE p.id = ?
    ");
    $postStmt->execute([$postId]);
    $post = $postStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$post) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Post not found']);
        exit;
    }
    
    $classId = (int)$post['class_id'];
    
    // Verify user has access to this class
    if ($userRole === 'student') {
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
                echo json_encode(['success' => false, 'message' => 'Access denied']);
                exit;
            }
        } else {
            $enrollStmt = $db->prepare("SELECT id FROM class_students WHERE class_id = ? AND student_user_id = ?");
            $enrollStmt->execute([$classId, $userId]);
            if (!$enrollStmt->fetch()) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Access denied']);
                exit;
            }
        }
    } else if ($userRole === 'teacher') {
        $teacherStmt = $db->prepare("SELECT id FROM classes WHERE id = ? AND owner_user_id = ? AND status = 'active'");
        $teacherStmt->execute([$classId, $userId]);
        if (!$teacherStmt->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Access denied']);
            exit;
        }
    } else {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }
    
    // Create the comment
    $insertStmt = $db->prepare("
        INSERT INTO class_post_comments (post_id, user_id, content)
        VALUES (?, ?, ?)
    ");
    $insertStmt->execute([$postId, $userId, $content]);
    $commentId = $db->lastInsertId();
    
    // Get the created comment with user info
    $commentStmt = $db->prepare("
        SELECT 
            c.id,
            c.post_id,
            c.user_id,
            c.content,
            c.created_at,
            c.updated_at,
            u.firstname,
            u.middlename,
            u.lastname,
            u.role as user_role
        FROM class_post_comments c
        INNER JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
    ");
    $commentStmt->execute([$commentId]);
    $comment = $commentStmt->fetch(PDO::FETCH_ASSOC);
    
    // Format user name
    $fullName = trim(($comment['firstname'] ?? '') . ' ' . ($comment['middlename'] ?? '') . ' ' . ($comment['lastname'] ?? ''));
    if (empty(trim($fullName))) {
        $fullName = 'Unknown User';
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Comment added successfully',
        'comment' => [
            'id' => (int)$comment['id'],
            'post_id' => (int)$comment['post_id'],
            'user_id' => (int)$comment['user_id'],
            'user_name' => $fullName,
            'user_role' => $comment['user_role'],
            'content' => $comment['content'],
            'created_at' => $comment['created_at'],
            'updated_at' => $comment['updated_at']
        ]
    ]);
    
} catch (PDOException $e) {
    error_log("Database error in create_post_comment.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error occurred']);
} catch (Exception $e) {
    error_log("Error in create_post_comment.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An unexpected error occurred']);
}
exit;
?>


