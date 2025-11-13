<?php
/**
 * Toggle Post Reaction
 * Allows users to like or heart a post (toggle on/off)
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
    error_log("toggle_post_reaction.php - Unexpected output: " . substr($obContent, 0, 500));
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
$reactionType = strtolower(trim($input['reaction_type'] ?? ''));

if ($postId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid post ID']);
    exit;
}

if (!in_array($reactionType, ['like', 'heart'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid reaction type. Must be "like" or "heart"']);
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
    
    // Check if user already has this reaction
    $existingStmt = $db->prepare("
        SELECT id, reaction_type
        FROM class_post_reactions
        WHERE post_id = ? AND user_id = ? AND reaction_type = ?
    ");
    $existingStmt->execute([$postId, $userId, $reactionType]);
    $existing = $existingStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existing) {
        // Remove reaction (toggle off)
        $deleteStmt = $db->prepare("DELETE FROM class_post_reactions WHERE id = ?");
        $deleteStmt->execute([$existing['id']]);
        $action = 'removed';
    } else {
        // Remove any other reaction from this user on this post first
        $deleteOtherStmt = $db->prepare("DELETE FROM class_post_reactions WHERE post_id = ? AND user_id = ?");
        $deleteOtherStmt->execute([$postId, $userId]);
        
        // Add reaction (toggle on)
        $insertStmt = $db->prepare("
            INSERT INTO class_post_reactions (post_id, user_id, reaction_type)
            VALUES (?, ?, ?)
        ");
        $insertStmt->execute([$postId, $userId, $reactionType]);
        $action = 'added';
    }
    
    // Get updated reaction counts
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
    
    $likeCount = 0;
    $heartCount = 0;
    foreach ($reactions as $reaction) {
        if ($reaction['reaction_type'] === 'like') {
            $likeCount = (int)$reaction['count'];
        } else if ($reaction['reaction_type'] === 'heart') {
            $heartCount = (int)$reaction['count'];
        }
    }
    
    // Get user's current reaction
    $userReactionStmt = $db->prepare("
        SELECT reaction_type
        FROM class_post_reactions
        WHERE post_id = ? AND user_id = ?
    ");
    $userReactionStmt->execute([$postId, $userId]);
    $userReaction = $userReactionStmt->fetch(PDO::FETCH_ASSOC);
    $userReactionType = $userReaction ? $userReaction['reaction_type'] : null;
    
    echo json_encode([
        'success' => true,
        'action' => $action,
        'like_count' => $likeCount,
        'heart_count' => $heartCount,
        'user_reaction' => $userReactionType
    ]);
    
} catch (PDOException $e) {
    error_log("Database error in toggle_post_reaction.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error occurred']);
} catch (Exception $e) {
    error_log("Error in toggle_post_reaction.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An unexpected error occurred']);
}
exit;
?>


