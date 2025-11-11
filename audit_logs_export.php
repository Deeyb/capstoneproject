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

if (!isset($_SESSION['user_role']) || strtoupper($_SESSION['user_role']) !== 'ADMIN') {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['error'=>'Unauthorized']);
    exit;
}

require_once __DIR__ . '/config/Database.php';

$db = (new Database())->getConnection();
$q = isset($_GET['q']) ? trim($_GET['q']) : '';
$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
$actionPrefix = isset($_GET['action']) ? trim($_GET['action']) : '';
$from = isset($_GET['from']) ? trim($_GET['from']) : '';
$to = isset($_GET['to']) ? trim($_GET['to']) : '';

$sql = "SELECT id, created_at, user_id, action, entity_type, entity_id, ip, user_agent, details FROM audit_logs WHERE 1=1";
$params = [];
if ($q !== '') {
    $sql .= " AND (action LIKE ? OR entity_type LIKE ? OR entity_id LIKE ? OR details LIKE ?)";
    $like = "%$q%"; array_push($params, $like,$like,$like,$like);
}
if ($userId > 0) { $sql .= " AND user_id = ?"; $params[] = $userId; }
if ($actionPrefix !== '') { $sql .= " AND action LIKE ?"; $params[] = $actionPrefix . '%'; }
if ($from !== '') { $sql .= " AND created_at >= ?"; $params[] = $from . ' 00:00:00'; }
if ($to !== '') { $sql .= " AND created_at <= ?"; $params[] = $to . ' 23:59:59'; }
$sql .= " ORDER BY id DESC LIMIT 5000";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

$filename = 'audit_logs_' . date('Ymd_His') . '.csv';
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=' . $filename);
header('Pragma: no-cache');
header('Expires: 0');

$out = fopen('php://output', 'w');
fputcsv($out, ['ID','Time','User ID','Action','Entity','Entity ID','IP','User Agent','Details']);
foreach ($rows as $r) {
    fputcsv($out, [
        $r['id'] ?? '',
        $r['created_at'] ?? '',
        $r['user_id'] ?? '',
        $r['action'] ?? '',
        $r['entity_type'] ?? '',
        $r['entity_id'] ?? '',
        $r['ip'] ?? '',
        $r['user_agent'] ?? '',
        $r['details'] ?? ''
    ]);
}
fclose($out);
exit;
?>








