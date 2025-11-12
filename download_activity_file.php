<?php
/**
 * DOWNLOAD ACTIVITY FILE
 * Secure file download for activity submissions
 */
require_once __DIR__ . '/unified_bootstrap.php';
require_once __DIR__ . '/config/Database.php';

try {
    // Ensure session is started
    if (session_status() === PHP_SESSION_NONE) {
        $sessionPath = __DIR__ . '/sessions';
        if (!is_dir($sessionPath)) {
            @mkdir($sessionPath, 0777, true);
        }
        if (is_dir($sessionPath) && is_writable($sessionPath)) {
            ini_set('session.save_path', $sessionPath);
        }
        
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
    
    // Require authentication
    requireAuth();
    $userId = (int)($_SESSION['user_id'] ?? 0);
    if ($userId <= 0) {
        error_log("Download file error: User not authenticated. Session user_id: " . ($_SESSION['user_id'] ?? 'not set'));
        throw new Exception('User not authenticated');
    }
    
    // Get file parameter
    $filename = $_GET['f'] ?? '';
    if (empty($filename)) {
        throw new Exception('File not specified');
    }
    
    // Sanitize filename (prevent directory traversal)
    $filename = basename($filename);
    $filepath = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'activity_submissions' . DIRECTORY_SEPARATOR . $filename;
    
    // Check if file exists
    if (!file_exists($filepath) || !is_file($filepath)) {
        error_log("Download file error: File not found. Path: {$filepath}, Exists: " . (file_exists($filepath) ? 'yes' : 'no') . ", Is file: " . (is_file($filepath) ? 'yes' : 'no'));
        throw new Exception('File not found');
    }
    
    // Check if user has permission to download
    // Extract user ID and activity ID from filename (format: YYYYMMDD_HHMMSS_hex_userId_activityId_filename.ext)
    $parts = explode('_', $filename);
    if (count($parts) >= 5) {
        // Format: YYYYMMDD_HHMMSS_hex_userId_activityId_filename.ext
        // parts[0] = YYYYMMDD (date)
        // parts[1] = HHMMSS (time)
        // parts[2] = hex (random hex string)
        // parts[3] = userId
        // parts[4] = activityId
        // parts[5+] = filename (may contain underscores)
        $fileUserId = (int)$parts[3];
        $fileActivityId = (int)$parts[4];
        
        // User can download their own files
        // Teachers/Coordinators can download any file for their activities
        $canDownload = false;
        
        if ($fileUserId === $userId) {
            $canDownload = true;
        } else {
            // Check if user is teacher/coordinator for this activity
            $db = (new Database())->getConnection();
            $roleStmt = $db->prepare("SELECT LOWER(TRIM(role)) FROM users WHERE id=? LIMIT 1");
            $roleStmt->execute([$userId]);
            $role = $roleStmt->fetchColumn() ?: '';
            
            if (in_array($role, ['teacher', 'coordinator', 'admin'], true)) {
                // Check if user owns a class that contains this activity
                $checkStmt = $db->prepare("
                    SELECT c.id 
                    FROM classes c
                    INNER JOIN course_modules cm ON cm.course_id = c.course_id
                    INNER JOIN course_lessons cl ON cl.module_id = cm.id
                    INNER JOIN lesson_activities la ON la.lesson_id = cl.id
                    WHERE la.id = ? AND (c.owner_user_id = ? OR ? = 'admin' OR ? = 'coordinator')
                    LIMIT 1
                ");
                $checkStmt->execute([$fileActivityId, $userId, $role, $role]);
                if ($checkStmt->fetch()) {
                    $canDownload = true;
                }
            }
        }
        
        if (!$canDownload) {
            error_log("Download file error: Permission denied. User ID: {$userId}, File User ID: {$fileUserId}, File Activity ID: {$fileActivityId}, User Role: {$role}");
            throw new Exception('Permission denied');
        }
    } else {
        error_log("Download file error: Could not parse filename. Filename: {$filename}, Parts count: " . count($parts));
    }
    
    // Get file info
    $originalName = $filename;
    // Try to extract original filename from the stored filename
    // Format: YYYYMMDD_HHMMSS_hex_userId_activityId_filename.ext
    // Extract everything after the 5th underscore (parts[0-4] are metadata)
    $parts = explode('_', $filename);
    if (count($parts) >= 6) {
        // Rejoin parts[5] onwards to get the original filename (may contain underscores)
        $originalName = implode('_', array_slice($parts, 5));
    } else if (preg_match('/_\d+_\d+_[a-f0-9]+_\d+_\d+_(.+)$/', $filename, $matches)) {
        // Fallback regex: date_time_hex_userId_activityId_filename
        $originalName = $matches[1];
    }
    
    // Determine content type and disposition based on file extension
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $contentType = 'application/octet-stream';
    $disposition = 'attachment'; // Default: download
    
    // Set appropriate content type for viewable files
    $viewableTypes = [
        'pdf' => 'application/pdf',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
        'webp' => 'image/webp'
    ];
    
    if (isset($viewableTypes[$ext])) {
        $contentType = $viewableTypes[$ext];
        // For PDFs and images, allow inline viewing if opened in new tab
        // Check if user wants to view (via query parameter) or browser will handle it
        $view = $_GET['view'] ?? '';
        if ($view === '1' || $view === 'true') {
            $disposition = 'inline';
        } else {
            // Default: allow inline for PDFs/images (browser will display if opened in new tab)
            // But still allow download if user right-clicks
            $disposition = 'inline';
        }
    }
    
    // Set headers
    header('Content-Type: ' . $contentType);
    header('Content-Disposition: ' . $disposition . '; filename="' . addslashes($originalName) . '"');
    header('Content-Length: ' . filesize($filepath));
    header('Cache-Control: private, max-age=0, must-revalidate');
    header('Pragma: public');
    
    // Output file
    readfile($filepath);
    exit;
    
} catch (Exception $e) {
    error_log("Download activity file error: " . $e->getMessage());
    http_response_code(403);
    echo "File not found or access denied";
}
?>

