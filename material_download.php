<?php
// Start output buffering to prevent any stray output
ob_start();

session_start();
require_once __DIR__ . '/classes/auth_helpers.php';
require_once __DIR__ . '/config/Database.php';

Auth::requireAuth();

try {
    // Clean any output before headers
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    $db = (new Database())->getConnection();
    // Only Teacher or Coordinator can access
    $stmt = $db->prepare("SELECT LOWER(TRIM(role)) FROM users WHERE id=? LIMIT 1");
    $stmt->execute([$_SESSION['user_id']]);
    $role = $stmt->fetchColumn() ?: '';
    if ($role !== 'teacher' && $role !== 'coordinator') {
        http_response_code(403);
        header('Content-Type: text/plain');
        echo 'Forbidden';
        exit;
    }

    $f = isset($_GET['f']) ? $_GET['f'] : '';
    $view = isset($_GET['view']) ? $_GET['view'] : 'false';
    if (!preg_match('/^[0-9]{8}_[0-9]{6}_[0-9A-Fa-f]{8}_.+\.[A-Za-z0-9]+$/', $f)) {
        http_response_code(400);
        header('Content-Type: text/plain');
        echo 'Invalid file';
        exit;
    }

    $baseDir = realpath(__DIR__ . '/uploads/materials');
    if ($baseDir === false) { 
        http_response_code(404); 
        header('Content-Type: text/plain');
        echo 'Not found'; 
        exit; 
    }
    $path = $baseDir . DIRECTORY_SEPARATOR . $f;
    if (!is_file($path)) { 
        http_response_code(404); 
        header('Content-Type: text/plain');
        echo 'Not found'; 
        exit; 
    }

    // Derive original filename from stored unique name
    $downloadName = preg_replace('/^[0-9]{8}_[0-9]{6}_[0-9A-Fa-f]{8}_/','', $f);

    // Detect file type and set proper MIME type
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    $mime = 'application/octet-stream';
    
    // Set proper MIME type for PDF
    if ($ext === 'pdf') {
        $mime = 'application/pdf';
    } else if (function_exists('mime_content_type')) {
        $mime = mime_content_type($path) ?: $mime;
    }
    
    // Set headers
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . filesize($path));
    header('Cache-Control: private, max-age=0, must-revalidate');
    header('Pragma: public');
    
    // Set disposition based on view parameter
    if ($view === 'true' || $view === '1') {
        // For viewing in browser (inline) - CRITICAL for PDF rendering in iframe
        header('Content-Disposition: inline; filename="' . rawurldecode($downloadName) . '"');
    } else {
        // For downloading (attachment)
        header('Content-Disposition: attachment; filename="' . rawurldecode($downloadName) . '"');
    }
    
    header('X-Content-Type-Options: nosniff');
    
    // Ensure no output before file
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    // Stream file
    readfile($path);
    exit;
} catch (Throwable $e) {
    // Clean output before error
    while (ob_get_level()) {
        ob_end_clean();
    }
    http_response_code(500);
    header('Content-Type: text/plain');
    echo 'Server error';
    error_log('Material download error: ' . $e->getMessage());
    exit;
}
?>
