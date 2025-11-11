<?php
// CRITICAL: Set session path BEFORE any session_start() calls
$sessionPath = __DIR__ . '/sessions';
if (!is_dir($sessionPath)) {
    @mkdir($sessionPath, 0777, true);
}
if (is_dir($sessionPath) && is_writable($sessionPath)) {
    ini_set('session.save_path', $sessionPath);
}

// Set session name before starting
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
}

header('Content-Type: application/json');

if (!isset($_SESSION['user_role']) || strtoupper($_SESSION['user_role']) !== 'ADMIN') {
    http_response_code(403);
    echo json_encode(['success'=>false,'message'=>'Unauthorized']);
    exit;
}

require_once __DIR__ . '/config/Database.php';

try {
    $db = (new Database())->getConnection();
    $q = isset($_GET['q']) ? trim($_GET['q']) : '';
    $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
    $actionPrefix = isset($_GET['action']) ? trim($_GET['action']) : '';
    $from = isset($_GET['from']) ? trim($_GET['from']) : '';
    $to = isset($_GET['to']) ? trim($_GET['to']) : '';
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $pageSize = isset($_GET['pageSize']) ? max(5, min(100, (int)$_GET['pageSize'])) : 20; // Cap at 100 for safety
    $sortBy = isset($_GET['sortBy']) ? $_GET['sortBy'] : 'id';
    $sortDir = isset($_GET['sortDir']) ? $_GET['sortDir'] : 'DESC';
    $offset = ($page - 1) * $pageSize;

    // Validate sortBy to prevent SQL injection
    $allowedSorts = ['id', 'created_at', 'user_id', 'action', 'entity_type', 'entity_id'];
    if (!in_array($sortBy, $allowedSorts)) $sortBy = 'id';
    $sortDir = strtoupper($sortDir) === 'ASC' ? 'ASC' : 'DESC';

    $sql = "SELECT id, user_id, action, entity_type, entity_id, ip, user_agent, created_at
            FROM audit_logs WHERE 1=1";
    $params = [];
    if ($q !== '') {
        $sql .= " AND (action LIKE ? OR entity_type LIKE ? OR entity_id LIKE ?)";
        $like = "%$q%"; array_push($params, $like,$like,$like);
    }
    if ($userId > 0) { $sql .= " AND user_id = ?"; $params[] = $userId; }
    if ($actionPrefix !== '') { $sql .= " AND action LIKE ?"; $params[] = $actionPrefix . '%'; }
    if ($from !== '') { $sql .= " AND created_at >= ?"; $params[] = $from . ' 00:00:00'; }
    if ($to !== '') { $sql .= " AND created_at <= ?"; $params[] = $to . ' 23:59:59'; }
    
    // Get total count for pagination
    $countSql = str_replace("SELECT id, user_id, action, entity_type, entity_id, ip, user_agent, created_at", "SELECT COUNT(*)", $sql);
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($params);
    $totalCount = $countStmt->fetchColumn();
    
    // Sanitize LIMIT and OFFSET (already integers, but ensure they're safe)
    $pageSize = (int)$pageSize;
    $offset = (int)$offset;
    $sql .= " ORDER BY $sortBy $sortDir LIMIT $pageSize OFFSET $offset";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    $totalPages = max(1, (int)ceil($totalCount / $pageSize));
    echo json_encode([
        'success'=>true,
        'data'=>$rows,
        'pagination'=>[
            'page'=>$page,
            'pageSize'=>$pageSize,
            'totalCount'=>$totalCount,
            'totalPages'=>$totalPages
        ]
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Server error']);
}
?>


