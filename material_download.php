<?php
session_start();
require_once __DIR__ . '/classes/auth_helpers.php';
require_once __DIR__ . '/config/Database.php';

Auth::requireAuth();

try {
    $db = (new Database())->getConnection();
    // Only Teacher or Coordinator can access
    $stmt = $db->prepare("SELECT LOWER(TRIM(role)) FROM users WHERE id=? LIMIT 1");
    $stmt->execute([$_SESSION['user_id']]);
    $role = $stmt->fetchColumn() ?: '';
    if ($role !== 'teacher' && $role !== 'coordinator') {
        http_response_code(403);
        echo 'Forbidden';
        exit;
    }

    $f = isset($_GET['f']) ? $_GET['f'] : '';
    if (!preg_match('/^[0-9]{8}_[0-9A-Fa-f]{8}_.+\.[A-Za-z0-9]+$/', $f)) {
        http_response_code(400);
        echo 'Invalid file';
        exit;
    }

    $baseDir = realpath(__DIR__ . '/uploads/materials');
    if ($baseDir === false) { http_response_code(404); echo 'Not found'; exit; }
    $path = $baseDir . DIRECTORY_SEPARATOR . $f;
    if (!is_file($path)) { http_response_code(404); echo 'Not found'; exit; }

    // Derive original filename from stored unique name
    $downloadName = preg_replace('/^[0-9]{8}_[0-9A-Fa-f]{8}_/','', $f);

    // Stream file
    $mime = 'application/octet-stream';
    if (function_exists('mime_content_type')) {
        $mime = mime_content_type($path) ?: $mime;
    }
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . filesize($path));
    header('Content-Disposition: attachment; filename="' . rawurldecode($downloadName) . '"');
    header('X-Content-Type-Options: nosniff');
    readfile($path);
    exit;
} catch (Throwable $e) {
    http_response_code(500);
    echo 'Server error';
}
?>
