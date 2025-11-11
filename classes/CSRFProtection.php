<?php
class CSRFProtection {
    private static $tokenName = 'csrf_token';
    private static $sessionKey = 'csrf_tokens';
    
    /**
     * Generate a new CSRF token
     * @return string
     */
    public static function generateToken() {
        // Ensure session is started with proper path
        if (session_status() === PHP_SESSION_NONE) {
            // Set session path if not set
            $sessionPath = __DIR__ . '/../sessions';
            if (!is_dir($sessionPath)) {
                @mkdir($sessionPath, 0777, true);
            }
            if (is_dir($sessionPath) && is_writable($sessionPath)) {
                ini_set('session.save_path', $sessionPath);
            }
            
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
        }
        
        if (!isset($_SESSION[self::$sessionKey])) {
            $_SESSION[self::$sessionKey] = [];
        }
        
        $token = bin2hex(random_bytes(32));
        $_SESSION[self::$sessionKey][$token] = time();
        
        // Debug logging
        error_log("CSRF Generate - Token created: " . substr($token, 0, 10) . '...');
        error_log("CSRF Generate - Session name: " . session_name());
        error_log("CSRF Generate - Session ID: " . session_id());
        error_log("CSRF Generate - Total tokens in session: " . count($_SESSION[self::$sessionKey]));
        
        // Clean up old tokens (older than 1 hour)
        self::cleanupOldTokens();
        
        return $token;
    }
    
    /**
     * Validate a CSRF token
     * @param string $token
     * @return bool
     */
    public static function validateToken($token) {
        // Ensure session is started with proper path
        if (session_status() === PHP_SESSION_NONE) {
            // Set session path if not set
            $sessionPath = __DIR__ . '/../sessions';
            if (!is_dir($sessionPath)) {
                @mkdir($sessionPath, 0777, true);
            }
            if (is_dir($sessionPath) && is_writable($sessionPath)) {
                ini_set('session.save_path', $sessionPath);
            }
            
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
        }
        
        // Initialize csrf_tokens array if it doesn't exist
        if (!isset($_SESSION[self::$sessionKey])) {
            $_SESSION[self::$sessionKey] = [];
            error_log("CSRF Validate - No tokens array in session");
            return false;
        }
        
        if (empty($token)) {
            error_log("CSRF Validate - Token is empty");
            return false;
        }
        
        if (!isset($_SESSION[self::$sessionKey][$token])) {
            error_log("CSRF Validate - Token not found in session. Available tokens: " . count($_SESSION[self::$sessionKey]));
            return false;
        }
        
        // Check if token is expired (1 hour)
        if (time() - $_SESSION[self::$sessionKey][$token] > 3600) {
            unset($_SESSION[self::$sessionKey][$token]);
            error_log("CSRF Validate - Token expired");
            return false;
        }
        
        // Do NOT unset the token here; allow multi-use during session
        error_log("CSRF Validate - Token is VALID");
        return true;
    }
    
    /**
     * Get the token name for form fields
     * @return string
     */
    public static function getTokenName() {
        return self::$tokenName;
    }
    
    /**
     * Clean up expired tokens
     */
    private static function cleanupOldTokens() {
        if (!isset($_SESSION[self::$sessionKey])) {
            return;
        }
        
        $currentTime = time();
        foreach ($_SESSION[self::$sessionKey] as $token => $timestamp) {
            if ($currentTime - $timestamp > 3600) {
                unset($_SESSION[self::$sessionKey][$token]);
            }
        }
    }
    
    /**
     * Get HTML for hidden input field
     * @return string
     */
    public static function getTokenField() {
        $token = self::generateToken();
        return '<input type="hidden" name="' . self::$tokenName . '" value="' . htmlspecialchars($token) . '">';
    }
}
?> 