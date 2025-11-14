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
        throw new Exception('No file uploaded or upload error');
    }
    
    $file = $_FILES['file'];
    $activityId = (int)($_POST['activity_id'] ?? 0);
    
    if ($activityId <= 0) {
        throw new Exception('Invalid activity ID');
    }
    
    // Validate file size (max 50MB)
    $maxBytes = 50 * 1024 * 1024;
    if ($file['size'] > $maxBytes) {
        throw new Exception('File too large (max 50MB)');
    }
    
    // Get activity to check accepted file types
    $db = (new Database())->getConnection();
    require_once __DIR__ . '/classes/CourseService.php';
    $svc = new CourseService($db);
    $activity = $svc->getActivity($activityId);
    
    if (!$activity) {
        throw new Exception('Activity not found');
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
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0755, true);
    }
    
    // Generate unique filename
    $safeBase = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', pathinfo($original, PATHINFO_FILENAME));
    $unique = date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '_' . $userId . '_' . $activityId . '_' . $safeBase . '.' . $ext;
    $target = $uploadDir . DIRECTORY_SEPARATOR . $unique;
    
    // Move uploaded file
    if (!@move_uploaded_file($file['tmp_name'], $target)) {
        throw new Exception('Failed to store file');
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
    
} catch (Exception $e) {
    ob_clean();
    error_log("Upload activity file error: " . $e->getMessage() . " | Trace: " . $e->getTraceAsString());
    http_response_code(400);
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
        'message' => 'Internal server error'
    ]);
    exit;
}
?>



