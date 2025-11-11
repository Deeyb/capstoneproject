<?php
/**
 * LOGOUT HANDLER
 * Properly destroys session and redirects to login
 */

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
} else {
    // Session already started, make sure we're using the right one
    $preferred = 'CodeRegalSession';
    $legacy = 'PHPSESSID';
    if (!empty($_COOKIE[$preferred]) && session_name() !== $preferred) {
        @session_write_close();
        session_name($preferred);
        @session_id($_COOKIE[$preferred]);
        @session_start();
    } elseif (!empty($_COOKIE[$legacy]) && session_name() !== $legacy) {
        @session_write_close();
        session_name($legacy);
        @session_id($_COOKIE[$legacy]);
        @session_start();
    }
}

require_once 'config/Database.php';
require_once 'classes/LoginService.php';

$db = (new Database())->getConnection();
$service = new LoginService($db);
$result = $service->logout();

header("Location: " . $result['redirect']);
exit();
?> 