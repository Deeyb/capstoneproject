<?php
/**
 * Get Post Comments
 * Fetches all comments for a specific post
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
    error_log("get_post_comments.php - Unexpected output: " . substr($obContent, 0, 500));
    ob_start();
}

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$userId = (int)($_SESSION['user_id'] ?? 0);
$userRole = strtolower((string)($_SESSION['user_role'] ?? 'student'));
$postId = isset($_GET['post_id']) ? (int)$_GET['post_id'] : 0;

if ($postId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid post ID']);
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
    
    // Get all comments for this post
    $commentsStmt = $db->prepare("
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
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
    ");
    $commentsStmt->execute([$postId]);
    $comments = $commentsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format comments
    $formattedComments = [];
    foreach ($comments as $comment) {
        $fullName = trim(($comment['firstname'] ?? '') . ' ' . ($comment['middlename'] ?? '') . ' ' . ($comment['lastname'] ?? ''));
        if (empty(trim($fullName))) {
            $fullName = 'Unknown User';
        }
        
        $formattedComments[] = [
            'id' => (int)$comment['id'],
            'post_id' => (int)$comment['post_id'],
            'user_id' => (int)$comment['user_id'],
            'user_name' => $fullName,
            'user_role' => $comment['user_role'],
            'content' => $comment['content'],
            'created_at' => $comment['created_at'],
            'updated_at' => $comment['updated_at']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'comments' => $formattedComments
    ]);
    
} catch (PDOException $e) {
    error_log("Database error in get_post_comments.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error occurred']);
} catch (Exception $e) {
    error_log("Error in get_post_comments.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An unexpected error occurred']);
}
exit;
?>


