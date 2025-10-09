<?php
class CSRFProtection {
    private static $tokenName = 'csrf_token';
    private static $sessionKey = 'csrf_tokens';
    
    /**
     * Generate a new CSRF token
     * @return string
     */
    public static function generateToken() {
        if (!isset($_SESSION[self::$sessionKey])) {
            $_SESSION[self::$sessionKey] = [];
        }
        
        $token = bin2hex(random_bytes(32));
        $_SESSION[self::$sessionKey][$token] = time();
        
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
        if (!isset($_SESSION[self::$sessionKey][$token])) {
            return false;
        }
        
        // Check if token is expired (1 hour)
        if (time() - $_SESSION[self::$sessionKey][$token] > 3600) {
            unset($_SESSION[self::$sessionKey][$token]);
            return false;
        }
        
        // Do NOT unset the token here; allow multi-use during session
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