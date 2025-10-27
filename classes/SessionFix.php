<?php
/**
 * Session Fix - Ensures proper session handling
 */
class SessionFix {
    
    /**
     * Initialize session with proper settings
     */
    public static function init() {
        // Only start session if not already started
        if (session_status() === PHP_SESSION_NONE) {
            // Configure session settings
            ini_set('session.cookie_lifetime', 0); // Session cookie expires when browser closes
            ini_set('session.cookie_httponly', 1); // Prevent XSS
            ini_set('session.use_strict_mode', 1); // Prevent session fixation
            ini_set('session.cookie_samesite', 'Lax'); // CSRF protection
            ini_set('session.gc_maxlifetime', 3600); // 1 hour
            
            // Start session
            session_start();
            
            // Regenerate session ID for security (only once per session)
            if (!isset($_SESSION['session_regenerated'])) {
                session_regenerate_id(true);
                $_SESSION['session_regenerated'] = true;
            }
        }
    }
    
    /**
     * Check if user is properly logged in
     */
    public static function isLoggedIn() {
        self::init();
        return isset($_SESSION['user_id']) && 
               !empty($_SESSION['user_id']) && 
               isset($_SESSION['user_role']) && 
               !empty($_SESSION['user_role']);
    }
    
    /**
     * Get user ID safely
     */
    public static function getUserId() {
        self::init();
        return $_SESSION['user_id'] ?? null;
    }
    
    /**
     * Get user role safely
     */
    public static function getUserRole() {
        self::init();
        return $_SESSION['user_role'] ?? null;
    }
    
    /**
     * Set user session data
     */
    public static function setUserSession($userId, $userRole, $userData = []) {
        self::init();
        $_SESSION['user_id'] = $userId;
        $_SESSION['user_role'] = $userRole;
        $_SESSION['user_data'] = $userData;
        $_SESSION['login_time'] = time();
        $_SESSION['last_activity'] = time();
        
        // Regenerate session ID for security
        session_regenerate_id(true);
    }
    
    /**
     * Clear user session
     */
    public static function clearUserSession() {
        self::init();
        unset($_SESSION['user_id']);
        unset($_SESSION['user_role']);
        unset($_SESSION['user_data']);
        unset($_SESSION['login_time']);
        unset($_SESSION['last_activity']);
        unset($_SESSION['session_regenerated']);
    }
    
    /**
     * Check session timeout
     */
    public static function checkSessionTimeout($timeoutMinutes = 30) {
        self::init();
        
        if (isset($_SESSION['last_activity'])) {
            $timeSinceActivity = time() - $_SESSION['last_activity'];
            if ($timeSinceActivity > ($timeoutMinutes * 60)) {
                self::clearUserSession();
                return false;
            }
        }
        
        // Update last activity
        $_SESSION['last_activity'] = time();
        return true;
    }
    
    /**
     * Get session debug info
     */
    public static function getDebugInfo() {
        self::init();
        return [
            'session_id' => session_id(),
            'session_name' => session_name(),
            'session_status' => session_status(),
            'user_id' => $_SESSION['user_id'] ?? null,
            'user_role' => $_SESSION['user_role'] ?? null,
            'login_time' => $_SESSION['login_time'] ?? null,
            'last_activity' => $_SESSION['last_activity'] ?? null,
            'session_data' => $_SESSION,
            'cookies' => $_COOKIE
        ];
    }
}
?>

