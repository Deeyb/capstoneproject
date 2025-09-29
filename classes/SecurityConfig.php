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
            ini_set('session.cookie_httponly', 1);
            ini_set('session.cookie_secure', self::isHttps() ? 1 : 0);
            ini_set('session.cookie_samesite', 'Lax');
            ini_set('session.use_strict_mode', 1);
            ini_set('session.cookie_lifetime', 0); // Session cookie

            // Set session name
            session_name('CodeRegalSession');

            // Start session
            session_start();
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
        // Prevent clickjacking
        header('X-Frame-Options: DENY');
        
        // Prevent MIME type sniffing
        header('X-Content-Type-Options: nosniff');
        
        // Enable XSS protection
        header('X-XSS-Protection: 1; mode=block');
        
        // Referrer policy
        header('Referrer-Policy: strict-origin-when-cross-origin');
        
        // Content Security Policy (basic)
        $csp = "default-src 'self'; ";
        $csp .= "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; ";
        $csp .= "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com; ";
        $csp .= "font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; ";
        $csp .= "img-src 'self' data: https:; ";
        $csp .= "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com;";
        
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