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

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Output buffering to prevent any stray output
ob_start();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        ob_clean();
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        exit;
    }

    if (!isset($_FILES['csv']) || $_FILES['csv']['error'] !== UPLOAD_ERR_OK) {
        $errorMsg = 'No CSV file uploaded';
        if (isset($_FILES['csv']['error'])) {
            switch ($_FILES['csv']['error']) {
                case UPLOAD_ERR_INI_SIZE:
                case UPLOAD_ERR_FORM_SIZE:
                    $errorMsg = 'File too large';
                    break;
                case UPLOAD_ERR_PARTIAL:
                    $errorMsg = 'File upload was incomplete';
                    break;
                case UPLOAD_ERR_NO_FILE:
                    $errorMsg = 'No file was uploaded';
                    break;
                case UPLOAD_ERR_NO_TMP_DIR:
                    $errorMsg = 'Missing temporary folder';
                    break;
                case UPLOAD_ERR_CANT_WRITE:
                    $errorMsg = 'Failed to write file to disk';
                    break;
                case UPLOAD_ERR_EXTENSION:
                    $errorMsg = 'File upload stopped by extension';
                    break;
            }
        }
        ob_clean();
        echo json_encode(['success' => false, 'message' => $errorMsg]);
        exit;
    }

    require_once __DIR__ . '/config/Database.php';
    require_once __DIR__ . '/classes/AuthorizedIdsService.php';
    $db = (new Database())->getConnection();
    $service = new AuthorizedIdsService($db);

    $tmp = $_FILES['csv']['tmp_name'];
    if (!file_exists($tmp)) {
        ob_clean();
        echo json_encode(['success' => false, 'message' => 'Uploaded file not found']);
        exit;
    }

    $result = $service->importFromCsv($tmp);
    
    // Check if any rows were actually processed
    if ($result['processed'] === 0 && $result['invalid'] === 0) {
        ob_clean();
        echo json_encode(['success' => false, 'message' => 'No valid data found in CSV. Please check the file format.']);
        exit;
    }
    
    $msg = "Processed {$result['processed']} row(s): {$result['inserted']} inserted, {$result['updated']} updated";
    if (!empty($result['unchanged'])) { $msg .= ", {$result['unchanged']} unchanged"; }
    if (!empty($result['invalid'])) { $msg .= ". Skipped {$result['invalid']} invalid"; }
    
    ob_clean();
    echo json_encode(['success' => true, 'message' => $msg, 'data' => $result]);
} catch (InvalidArgumentException $e) {
    ob_clean();
    error_log("Import CSV InvalidArgumentException: " . $e->getMessage());
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} catch (RuntimeException $e) {
    ob_clean();
    error_log("Import CSV RuntimeException: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'File processing error: ' . $e->getMessage()]);
} catch (Throwable $e) {
    ob_clean();
    error_log("Import CSV Error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>


