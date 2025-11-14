<?php
/**
 * ENHANCED SESSION CONFIGURATION
 * This file should be included at the start of every page that needs sessions
 */

// Only start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    // Configure session settings for better security and persistence
    ini_set("session.cookie_lifetime", 0); // Session cookie expires when browser closes
    ini_set("session.cookie_path", "/");
    ini_set("session.cookie_domain", "");
    ini_set("session.cookie_secure", false); // Set to true in production with HTTPS
    ini_set("session.cookie_httponly", true); // Prevent XSS attacks
    ini_set("session.use_strict_mode", true); // Prevent session fixation
    ini_set("session.use_only_cookies", true); // Only use cookies for session ID
    ini_set("session.cookie_samesite", "Strict"); // CSRF protection
    
    // Set session name
    session_name("CODEREGAL_SESSION");
    
    // Start the session
    session_start();
    
    // Regenerate session ID periodically for security
    if (!isset($_SESSION["last_regeneration"])) {
        $_SESSION["last_regeneration"] = time();
    } elseif (time() - $_SESSION["last_regeneration"] > 300) { // 5 minutes
        session_regenerate_id(true);
        $_SESSION["last_regeneration"] = time();
    }
    
    // Update last activity
    $_SESSION["last_activity"] = time();
    
    // Check for session timeout (1 hour of inactivity)
    // Allow 1 hour (3600 seconds) of inactivity before timeout
    $sessionTimeout = 3600; // 1 hour
    if (isset($_SESSION["last_activity"]) && (time() - $_SESSION["last_activity"] > $sessionTimeout)) {
        // Session expired due to inactivity
        session_unset();
        session_destroy();
        session_start();
    } else {
        // Update last activity on every request to keep session alive
        $_SESSION["last_activity"] = time();
    }
}

/**
 * SESSION VALIDATION FUNCTIONS
 */

function validateSession() {
    if (!isset($_SESSION["user_id"]) || empty($_SESSION["user_id"])) {
        return false;
    }
    
    // Check if user still exists in database
    try {
        require_once __DIR__ . "/config/Database.php";
        $db = (new Database())->getConnection();
        $stmt = $db->prepare("SELECT id, role, status FROM users WHERE id = ?");
        $stmt->execute([$_SESSION["user_id"]]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            // User no longer exists
            session_unset();
            session_destroy();
            return false;
        }
        
        if ($user["status"] !== "active") {
            // User account is not active
            session_unset();
            session_destroy();
            return false;
        }
        
        return true;
    } catch (Exception $e) {
        error_log("Session validation error: " . $e->getMessage());
        return false;
    }
}

function requireValidSession() {
    if (!validateSession()) {
        header("Location: login.php");
        exit();
    }
}

function getCurrentUser() {
    if (!validateSession()) {
        return null;
    }
    
    try {
        require_once __DIR__ . "/config/Database.php";
        $db = (new Database())->getConnection();
        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$_SESSION["user_id"]]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        error_log("Get current user error: " . $e->getMessage());
        return null;
    }
}

function updateLastActivity() {
    $_SESSION["last_activity"] = time();
}
?>