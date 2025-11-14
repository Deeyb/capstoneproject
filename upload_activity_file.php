<?php
/**
 * UPLOAD ACTIVITY FILE API
 * Handles file uploads for upload-based activities
 */
// Start output buffering to prevent any output before JSON
ob_start();

require_once __DIR__ . '/unified_bootstrap.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/CSRFProtection.php';

header('Content-Type: application/json');

try {
    // Require authentication
    requireAuth();
    $userId = (int)($_SESSION['user_id'] ?? 0);
    if ($userId <= 0) {
        throw new Exception('User not authenticated');
    }
    
    // Get activity ID first (needed for error logging)
    $activityId = (int)($_POST['activity_id'] ?? 0);
    
    // CSRF validation (only if token is provided)
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $csrfToken = $_POST[CSRFProtection::getTokenName()] ?? '';
        if (!empty($csrfToken)) {
            if (!CSRFProtection::validateToken($csrfToken)) {
                error_log("CSRF validation failed for upload. Token: " . substr($csrfToken, 0, 10) . '...');
                throw new Exception('Invalid CSRF token');
            }
        } else {
            // Log warning but don't fail - some requests might not have CSRF token
            error_log("Warning: No CSRF token provided for file upload. User ID: {$userId}, Activity ID: {$activityId}");
        }
    }
    
    // Check if file was uploaded
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        $uploadError = $_FILES['file']['error'] ?? 'unknown';
        error_log("File upload error: Error code {$uploadError} for user {$userId}, activity {$activityId}");
        throw new Exception('No file uploaded or upload error (code: ' . $uploadError . ')');
    }
    
    $file = $_FILES['file'];
    
    if ($activityId <= 0) {
        throw new Exception('Invalid activity ID');
    }
    
    // Validate file size (max 50MB)
    $maxBytes = 50 * 1024 * 1024;
    if ($file['size'] > $maxBytes) {
        throw new Exception('File too large (max 50MB)');
    }
    
    // Get activity to check accepted file types
    $db = null;
    try {
        $db = (new Database())->getConnection();
    } catch (Throwable $dbError) {
        error_log("Database connection error in upload: " . $dbError->getMessage() . " | Trace: " . $dbError->getTraceAsString());
        throw new Exception('Database connection failed: ' . $dbError->getMessage());
    }
    
    if (!$db) {
        throw new Exception('Database connection returned null');
    }
    
    require_once __DIR__ . '/classes/CourseService.php';
    
    $svc = null;
    try {
        $svc = new CourseService($db);
    } catch (Throwable $svcError) {
        error_log("CourseService initialization error: " . $svcError->getMessage() . " | Trace: " . $svcError->getTraceAsString());
        throw new Exception('Failed to initialize CourseService: ' . $svcError->getMessage());
    }
    
    $activity = null;
    try {
        $activity = $svc->getActivity($activityId);
    } catch (Throwable $activityError) {
        error_log("Get activity error: " . $activityError->getMessage() . " | Trace: " . $activityError->getTraceAsString());
        throw new Exception('Failed to get activity: ' . $activityError->getMessage());
    }
    
    if (!$activity) {
        throw new Exception('Activity not found (ID: ' . $activityId . ')');
    }
    
    // Parse accepted file types from activity
    $acceptedFiles = ['pdf', 'docx', 'pptx', 'jpg', 'png', 'txt', 'zip', 'xml', 'gif', 'bmp', 'svg'];
    $maxFileSize = 10; // MB
    
    if (!empty($activity['instructions'])) {
        try {
            $meta = json_decode($activity['instructions'], true);
            if (is_array($meta)) {
                if (!empty($meta['acceptedFiles'])) {
                    $acceptedFiles = is_array($meta['acceptedFiles']) ? $meta['acceptedFiles'] : explode(',', $meta['acceptedFiles']);
                }
                if (!empty($meta['maxFileSize'])) {
                    $maxFileSize = (int)$meta['maxFileSize'];
                }
            }
        } catch (Exception $e) {
            // Use defaults
            error_log("Error parsing activity instructions: " . $e->getMessage());
        }
    }
    
    // Check file extension
    $original = $file['name'] ?? 'upload.bin';
    $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
    $acceptedExts = array_map('strtolower', $acceptedFiles);
    
    if (!in_array($ext, $acceptedExts, true)) {
        throw new Exception('File type not allowed. Accepted: ' . implode(', ', $acceptedFiles));
    }
    
    // Create uploads directory
    $baseDir = realpath(__DIR__);
    if ($baseDir === false) {
        $baseDir = __DIR__;
    }
    $uploadDir = $baseDir . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'activity_submissions';
    
    // Ensure directory exists
    if (!is_dir($uploadDir)) {
        $mkdirResult = @mkdir($uploadDir, 0755, true);
        if (!$mkdirResult && !is_dir($uploadDir)) {
            error_log("Failed to create upload directory: {$uploadDir}");
            throw new Exception('Failed to create upload directory. Please check server permissions.');
        }
    }
    
    // Check if directory is writable
    if (!is_writable($uploadDir)) {
        error_log("Upload directory is not writable: {$uploadDir}");
        throw new Exception('Upload directory is not writable. Please check server permissions.');
    }
    
    // Generate unique filename
    $safeBase = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', pathinfo($original, PATHINFO_FILENAME));
    try {
        $unique = date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '_' . $userId . '_' . $activityId . '_' . $safeBase . '.' . $ext;
    } catch (Throwable $randomError) {
        error_log("Random bytes generation error: " . $randomError->getMessage());
        // Fallback to uniqid if random_bytes fails
        $unique = date('Ymd_His') . '_' . uniqid() . '_' . $userId . '_' . $activityId . '_' . $safeBase . '.' . $ext;
    }
    
    $target = $uploadDir . DIRECTORY_SEPARATOR . $unique;
    
    // Move uploaded file
    if (!@move_uploaded_file($file['tmp_name'], $target)) {
        $moveError = error_get_last();
        error_log("Failed to move uploaded file. Source: {$file['tmp_name']}, Target: {$target}, Error: " . ($moveError ? $moveError['message'] : 'unknown'));
        throw new Exception('Failed to store file. Please check server permissions and disk space.');
    }
    
    // Verify file was actually moved
    if (!file_exists($target)) {
        error_log("File move appeared successful but file does not exist: {$target}");
        throw new Exception('File upload verification failed.');
    }
    
    // Return file info
    $relativePath = 'download_activity_file.php?f=' . rawurlencode($unique);
    
    // Clean output buffer and send JSON
    ob_clean();
    echo json_encode([
        'success' => true,
        'file_path' => $relativePath,
        'file_name' => $original,
        'file_size' => $file['size'],
        'file_type' => $file['type']
    ]);
    exit;
    
} catch (InvalidArgumentException $e) {
    ob_clean();
    error_log("Upload activity file validation error: " . $e->getMessage() . " | Trace: " . $e->getTraceAsString());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    exit;
} catch (Exception $e) {
    ob_clean();
    error_log("Upload activity file error: " . $e->getMessage() . " | Trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    exit;
} catch (Error $e) {
    ob_clean();
    error_log("Upload activity file fatal error: " . $e->getMessage() . " | Trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error: ' . $e->getMessage()
    ]);
    exit;
} catch (Throwable $e) {
    ob_clean();
    error_log("Upload activity file throwable error: " . $e->getMessage() . " | Trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error: ' . $e->getMessage()
    ]);
    exit;
}
?>



