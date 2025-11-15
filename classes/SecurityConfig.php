<?php
/**
 * Security Configuration Class
 * Centralizes security settings and provides additional protection
 */
class SecurityConfig {
    
    /**
     * Initialize security settings
     */
    public static function initialize() {
        // Load environment variables
        require_once __DIR__ . '/EnvironmentLoader.php';
        EnvironmentLoader::load();
        
        // Set secure session configuration
        self::configureSession();
        
        // Set secure headers
        self::setSecurityHeaders();
        
        // Configure error reporting based on environment
        self::configureErrorReporting();
    }
    
    /**
     * Configure secure session settings
     */
    private static function configureSession() {
        // Only set session ini settings if session is not active
        if (session_status() === PHP_SESSION_NONE) {
            // Fix session path permission issues on XAMPP
            // Only set if not already set (allows login.php to set it first)
            $currentSavePath = ini_get('session.save_path');
            if (empty($currentSavePath) || $currentSavePath === 'C:\\xampp\\tmp' || strpos($currentSavePath, 'xampp\\tmp') !== false) {
                $sessionPath = __DIR__ . '/../sessions';
                
                // Create sessions directory if it doesn't exist
                if (!is_dir($sessionPath)) {
                    @mkdir($sessionPath, 0777, true);
                }
                
                // Only set custom path if directory is writable
                if (is_dir($sessionPath) && is_writable($sessionPath)) {
                    ini_set('session.save_path', $sessionPath);
                }
            }
            
            // Set session name BEFORE starting (respect existing session name if set)
            $currentSessionName = session_name();
            if ($currentSessionName === 'PHPSESSID' || empty($currentSessionName)) {
                // Only change if it's the default or empty
                // Try to use existing cookie first
                $preferred = 'CodeRegalSession';
                $legacy = 'PHPSESSID';
                if (!empty($_COOKIE[$preferred])) { 
                    session_name($preferred); 
                } elseif (!empty($_COOKIE[$legacy])) { 
                    session_name($legacy); 
                } else { 
                    session_name($preferred); 
                }
            }
            
            ini_set('session.cookie_httponly', 1);
            ini_set('session.cookie_secure', self::isHttps() ? 1 : 0);
            ini_set('session.cookie_samesite', 'Lax');
            ini_set('session.use_strict_mode', 1);
            ini_set('session.cookie_lifetime', 0); // Session cookie
            ini_set('session.gc_maxlifetime', 7200); // 2 hours - prevent premature session deletion

            // Start session (suppress warnings for permission issues)
            @session_start();
        }

        // Regenerate session ID periodically for security
        if (isset($_SESSION) && !isset($_SESSION['last_regeneration'])) {
            $_SESSION['last_regeneration'] = time();
        } elseif (isset($_SESSION['last_regeneration']) && time() - $_SESSION['last_regeneration'] > 300) { // 5 minutes
            session_regenerate_id(true);
            $_SESSION['last_regeneration'] = time();
        }
    }
    
    /**
     * Set security headers
     */
    private static function setSecurityHeaders() {
        // Prevent clickjacking but allow same-origin embeds (needed for in-app material previews)
        header('X-Frame-Options: SAMEORIGIN');
        
        // Prevent MIME type sniffing
        header('X-Content-Type-Options: nosniff');
        
        // Enable XSS protection
        header('X-XSS-Protection: 1; mode=block');
        
        // Referrer policy
        header('Referrer-Policy: strict-origin-when-cross-origin');
        
        // Content Security Policy (enhanced for Monaco Editor and CDN resources)
        $csp = "default-src 'self'; ";
        $csp .= "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; ";
        $csp .= "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com; ";
        $csp .= "font-src 'self' data: blob: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.gstatic.com; ";
        $csp .= "img-src 'self' data: https:; ";
        $csp .= "worker-src 'self' blob: data: https://cdn.jsdelivr.net; "; // Allow web workers for Monaco Editor
        
        $frameSources = "'self' blob: https://*.youtube.com https://www.youtube.com https://youtu.be https://player.vimeo.com https://drive.google.com https://docs.google.com https://*.googleusercontent.com https://view.officeapps.live.com";
        $csp .= "child-src $frameSources; "; // Legacy directive for iframes
        $csp .= "frame-src $frameSources; "; // Explicit allow list for modern browsers
        $csp .= "frame-ancestors 'self'; "; // Modern directive controlling who can embed our pages
        $csp .= "connect-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com;";
        
        header("Content-Security-Policy: $csp");
    }
    
    /**
     * Configure error reporting based on environment
     */
    private static function configureErrorReporting() {
        $environment = EnvironmentLoader::get('APP_ENV', 'development');
        
        if ($environment === 'production') {
            // Hide errors in production
            error_reporting(0);
            ini_set('display_errors', 0);
            ini_set('log_errors', 1);
        } else {
            // Show errors in development
            error_reporting(E_ALL);
            ini_set('display_errors', 1);
            ini_set('log_errors', 1);
        }
    }
    
    /**
     * Check if the request is using HTTPS
     */
    private static function isHttps() {
        return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
               (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') ||
               (!empty($_SERVER['HTTP_X_FORWARDED_SSL']) && $_SERVER['HTTP_X_FORWARDED_SSL'] === 'on');
    }
    
    /**
     * Validate Google OAuth configuration
     */
    public static function validateGoogleOAuth() {
        $required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI'];
        
        foreach ($required as $key) {
            if (!EnvironmentLoader::has($key)) {
                throw new Exception("Missing required Google OAuth configuration: $key");
            }
        }
        
        // Validate redirect URI format
        $redirectUri = EnvironmentLoader::get('GOOGLE_REDIRECT_URI');
        if (!filter_var($redirectUri, FILTER_VALIDATE_URL)) {
            throw new Exception("Invalid Google OAuth redirect URI format");
        }
    }
    
    /**
     * Get secure configuration value
     */
    public static function get($key, $default = null) {
        return EnvironmentLoader::get($key, $default);
    }
    
    /**
     * Check if configuration exists
     */
    public static function has($key) {
        return EnvironmentLoader::has($key);
    }
}
?> 