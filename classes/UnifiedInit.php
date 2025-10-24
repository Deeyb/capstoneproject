<?php
/**
 * UNIFIED INITIALIZATION
 * Single initialization file for the entire application
 */
class UnifiedInit {
    private static $initialized = false;
    
    /**
     * Initialize the unified system
     */
    public static function init() {
        if (self::$initialized) {
            return;
        }
        
        // Load unified classes first
        self::initUnifiedSystems();
        
        // Set error reporting
        if (UnifiedConfig::get('DEBUG_MODE', false)) {
            error_reporting(E_ALL);
            ini_set('display_errors', 1);
        } else {
            error_reporting(0);
            ini_set('display_errors', 0);
        }
        
        // Set timezone
        date_default_timezone_set('Asia/Manila');
        
        // Set session configuration
        ini_set('session.cookie_lifetime', UnifiedConfig::get('SESSION_LIFETIME', 3600));
        ini_set('session.cookie_secure', UnifiedConfig::get('SESSION_SECURE_COOKIE', true));
        ini_set('session.cookie_httponly', UnifiedConfig::get('SESSION_HTTP_ONLY', true));
        ini_set('session.use_strict_mode', 1);
        
        // Set memory and execution limits
        ini_set('memory_limit', '256M');
        ini_set('max_execution_time', 30);
        
        // Set upload limits
        ini_set('upload_max_filesize', '10M');
        ini_set('post_max_size', '10M');
        ini_set('max_file_uploads', 20);
        
        self::$initialized = true;
    }
    
    /**
     * Initialize all unified systems
     */
    private static function initUnifiedSystems() {
        // Load required dependencies first
        require_once __DIR__ . '/../config/Database.php';
        require_once __DIR__ . '/../classes/AuditLogService.php';
        require_once __DIR__ . '/../classes/RateLimiter.php';
        
        // Load unified classes in correct order
        require_once __DIR__ . '/UnifiedConfig.php';
        require_once __DIR__ . '/UnifiedErrorHandler.php';
        require_once __DIR__ . '/UnifiedCSRFProtection.php';
        require_once __DIR__ . '/UnifiedSecurityManager.php';
        require_once __DIR__ . '/UnifiedAuthManager.php';
        require_once __DIR__ . '/UnifiedAPIHandler.php';
        
        // Initialize error handler
        set_error_handler([UnifiedErrorHandler::getInstance(), 'handleError']);
        set_exception_handler([UnifiedErrorHandler::getInstance(), 'handleException']);
        
        // Initialize security
        UnifiedSecurityManager::getInstance()->secureSession();
    }
    
    /**
     * Get unified auth manager
     */
    public static function getAuth() {
        self::init();
        return UnifiedAuthManager::getInstance();
    }
    
    /**
     * Get unified CSRF protection
     */
    public static function getCSRF() {
        self::init();
        return UnifiedCSRFProtection::getInstance();
    }
    
    /**
     * Get unified error handler
     */
    public static function getErrorHandler() {
        self::init();
        return UnifiedErrorHandler::getInstance();
    }
    
    /**
     * Get unified security manager
     */
    public static function getSecurity() {
        self::init();
        return UnifiedSecurityManager::getInstance();
    }
    
    /**
     * Get unified API handler
     */
    public static function getAPI() {
        self::init();
        return UnifiedAPIHandler::getInstance();
    }
    
    /**
     * Quick authentication check
     */
    public static function requireAuth($roles = null) {
        self::getAuth()->requireAuth($roles);
    }
    
    /**
     * Quick role check
     */
    public static function requireRole($role) {
        self::getAuth()->requireAuth([$role]);
    }
    
    /**
     * Quick permission check
     */
    public static function requirePermission($resource, $permission = 'read') {
        $auth = self::getAuth();
        $auth->requireAuth();
        
        if (!$auth->hasPermission($resource, $permission)) {
            self::getErrorHandler()->permissionError("Insufficient permissions for {$resource}");
        }
    }
    
    /**
     * Quick API response
     */
    public static function apiResponse($success, $data = [], $message = '') {
        if ($success) {
            self::getErrorHandler()->successResponse($data, $message);
        } else {
            self::getErrorHandler()->apiError($message, 400, $data);
        }
    }
    
    /**
     * Quick CSRF token
     */
    public static function getCSRFToken() {
        return self::getCSRF()->getTokenForAjax();
    }
    
    /**
     * Quick input sanitization
     */
    public static function sanitize($input, $type = 'string') {
        return self::getSecurity()->sanitizeInput($input, $type);
    }
    
    /**
     * Quick input validation
     */
    public static function validate($input, $rules) {
        return self::getSecurity()->validateInput($input, $rules);
    }
}
