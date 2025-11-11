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
    echo 'Unauthorized';
    exit;
}
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/AuthorizedIdsService.php';
$db = (new Database())->getConnection();
$service = new AuthorizedIdsService($db);
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$sortBy = isset($_GET['sortBy']) ? $_GET['sortBy'] : 'id_number';
$sortDir = isset($_GET['sortDir']) ? $_GET['sortDir'] : 'ASC';
$statusFilter = isset($_GET['status']) ? trim($_GET['status']) : '';
$rows = $service->search($search, $sortBy, $sortDir, 10000, $statusFilter !== '' ? $statusFilter : null);
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="authorized_ids_export.csv"');
$out = fopen('php://output', 'w');
fputcsv($out, ['id', 'id_number', 'status', 'created_at', 'updated_at']);
foreach ($rows as $r) {
    fputcsv($out, [
        $r['id'] ?? '',
        $r['id_number'] ?? '',
        $r['status'] ?? '',
        $r['created_at'] ?? '',
        $r['updated_at'] ?? ''
    ]);
}
fclose($out);






