<?php
/**
 * Get Newsfeed Posts
 * Fetches all posts for a specific class with reactions and comment counts
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
    error_log("get_newsfeed_posts.php - Unexpected output: " . substr($obContent, 0, 500));
    ob_start();
}

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$userId = (int)($_SESSION['user_id'] ?? 0);
$userRole = strtolower((string)($_SESSION['user_role'] ?? 'student'));
$classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : 0;

if ($classId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid class ID']);
    exit;
}

try {
    error_log("📰 [get_newsfeed_posts.php] Starting - Class ID: $classId, User ID: $userId, Role: $userRole");
    $db = (new Database())->getConnection();
    
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    error_log("📰 [get_newsfeed_posts.php] Database connected");
    
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
    
    // Check if class_posts table exists
    try {
        $tableCheck = $db->query("SHOW TABLES LIKE 'class_posts'");
        $tableExists = $tableCheck->rowCount() > 0;
        error_log("📰 [get_newsfeed_posts.php] Table check - class_posts exists: " . ($tableExists ? 'YES' : 'NO'));
    } catch (Exception $e) {
        error_log("⚠️ [get_newsfeed_posts.php] Error checking table: " . $e->getMessage());
        $tableExists = false;
    }
    
    if (!$tableExists) {
        error_log("⚠️ [get_newsfeed_posts.php] class_posts table does not exist!");
        // Return empty posts array instead of error
        echo json_encode([
            'success' => true,
            'posts' => [],
            'message' => 'Newsfeed tables not created yet. Please run create_newsfeed_tables.php'
        ]);
        exit;
    }
    
    error_log("📰 [get_newsfeed_posts.php] Fetching posts for class $classId");
    
    // Get all posts for this class with user info
    try {
        $postsStmt = $db->prepare("
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
            WHERE p.class_id = ?
            ORDER BY p.created_at DESC
        ");
        $postsStmt->execute([$classId]);
        $posts = $postsStmt->fetchAll(PDO::FETCH_ASSOC);
        error_log("📰 [get_newsfeed_posts.php] Found " . count($posts) . " posts");
    } catch (PDOException $e) {
        error_log("❌ [get_newsfeed_posts.php] Error fetching posts: " . $e->getMessage());
        error_log("❌ [get_newsfeed_posts.php] SQL Error Info: " . json_encode($e->errorInfo));
        // Return empty array on error
        echo json_encode([
            'success' => true,
            'posts' => [],
            'message' => 'Error fetching posts: ' . $e->getMessage()
        ]);
        exit;
    }
    
    // Get reactions and comment counts for each post
    $formattedPosts = [];
    foreach ($posts as $post) {
        $postId = $post['id'];
        
        // Get reactions count (with error handling)
        $likeCount = 0;
        $heartCount = 0;
        $userReactionType = null;
        
        try {
            $reactionsStmt = $db->prepare("
                SELECT 
                    reaction_type,
                    COUNT(*) as count
                FROM class_post_reactions
                WHERE post_id = ?
                GROUP BY reaction_type
            ");
            $reactionsStmt->execute([$postId]);
            $reactions = $reactionsStmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($reactions as $reaction) {
                if ($reaction['reaction_type'] === 'like') {
                    $likeCount = (int)$reaction['count'];
                } else if ($reaction['reaction_type'] === 'heart') {
                    $heartCount = (int)$reaction['count'];
                }
            }
            
            // Check if current user has reacted
            $userReactionStmt = $db->prepare("
                SELECT reaction_type
                FROM class_post_reactions
                WHERE post_id = ? AND user_id = ?
            ");
            $userReactionStmt->execute([$postId, $userId]);
            $userReaction = $userReactionStmt->fetch(PDO::FETCH_ASSOC);
            $userReactionType = $userReaction ? $userReaction['reaction_type'] : null;
        } catch (PDOException $e) {
            error_log("⚠️ [get_newsfeed_posts.php] Error fetching reactions for post $postId: " . $e->getMessage());
            // Continue with default values (0 counts, null reaction)
        }
        
        // Get comment count (with error handling)
        $commentCount = 0;
        try {
            $commentCountStmt = $db->prepare("
                SELECT COUNT(*) as count
                FROM class_post_comments
                WHERE post_id = ?
            ");
            $commentCountStmt->execute([$postId]);
            $commentCount = (int)$commentCountStmt->fetchColumn();
        } catch (PDOException $e) {
            error_log("⚠️ [get_newsfeed_posts.php] Error fetching comment count for post $postId: " . $e->getMessage());
            // Continue with default value (0)
        }
        
        // Format user name
        $fullName = trim(($post['firstname'] ?? '') . ' ' . ($post['middlename'] ?? '') . ' ' . ($post['lastname'] ?? ''));
        if (empty(trim($fullName))) {
            $fullName = 'Unknown User';
        }
        
        $formattedPosts[] = [
            'id' => (int)$post['id'],
            'class_id' => (int)$post['class_id'],
            'user_id' => (int)$post['user_id'],
            'user_name' => $fullName,
            'user_role' => $post['user_role'],
            'content' => $post['content'],
            'created_at' => $post['created_at'],
            'updated_at' => $post['updated_at'],
            'like_count' => $likeCount,
            'heart_count' => $heartCount,
            'user_reaction' => $userReactionType,
            'comment_count' => $commentCount
        ];
    }
    
    error_log("📰 [get_newsfeed_posts.php] Returning " . count($formattedPosts) . " formatted posts");
    
    echo json_encode([
        'success' => true,
        'posts' => $formattedPosts
    ]);
    
} catch (PDOException $e) {
    error_log("Database error in get_newsfeed_posts.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error occurred']);
} catch (Exception $e) {
    error_log("Error in get_newsfeed_posts.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An unexpected error occurred']);
}
exit;
?>

