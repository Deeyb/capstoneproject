<?php
// CSV import endpoint for authorized_ids

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

// Admin-only
if (!isset($_SESSION['user_role']) || strtoupper($_SESSION['user_role']) !== 'ADMIN') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Invalid request']);
        exit;
    }

    if (!isset($_FILES['csv']) || $_FILES['csv']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['success' => false, 'message' => 'No CSV uploaded']);
        exit;
    }

    require_once __DIR__ . '/config/Database.php';
    require_once __DIR__ . '/classes/AuthorizedIdsService.php';
    $db = (new Database())->getConnection();
    $service = new AuthorizedIdsService($db);

    $tmp = $_FILES['csv']['tmp_name'];
    $result = $service->importFromCsv($tmp);
    $msg = "Processed {$result['processed']} row(s): {$result['inserted']} inserted, {$result['updated']} updated";
    if (!empty($result['unchanged'])) { $msg .= ", {$result['unchanged']} unchanged"; }
    if (!empty($result['invalid'])) { $msg .= ". Skipped {$result['invalid']} invalid"; }
    echo json_encode(['success' => true, 'message' => $msg]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>


