<?php
/**
 * UNIFIED LOGIN PROCESS
 * Now uses the unified system for consistent authentication
 */
// Suppress all output except JSON
ob_start();

// CRITICAL: Set session path BEFORE any session_start() calls
$sessionPath = __DIR__ . '/sessions';
if (!is_dir($sessionPath)) {
    @mkdir($sessionPath, 0777, true);
}
if (is_dir($sessionPath) && is_writable($sessionPath)) {
    ini_set('session.save_path', $sessionPath);
}

// Start session if not already started - use same logic as main app
if (session_status() === PHP_SESSION_NONE) {
    // Try to use the same session name as the main app
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
    
    // If still no csrf_tokens, try alternate session name
    if (empty($_SESSION['csrf_tokens'])) {
        $current = session_name();
        $alt = ($current === $preferred) ? $legacy : $preferred;
        if (!empty($_COOKIE[$alt])) {
            @session_write_close();
            session_name($alt);
            @session_id($_COOKIE[$alt]);
            @session_start();
        }
    }
}

header('Content-Type: application/json');
require_once 'config/Database.php';
require_once 'classes/User.php';
require_once 'classes/LoginService.php';

$response = array('success' => false, 'message' => '', 'redirect' => '', 'errors' => array());

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $db = (new Database())->getConnection();
        $service = new LoginService($db);
        $response = $service->login($_POST);
    } catch (Throwable $e) {
        $response = array(
            'success' => false, 
            'message' => 'Login failed. Please try again.',
            'redirect' => '',
            'errors' => array()
        );
        error_log('Login error: ' . $e->getMessage());
    }
}

// Clear any output buffer and send clean JSON
ob_clean();
echo json_encode($response);
exit; 