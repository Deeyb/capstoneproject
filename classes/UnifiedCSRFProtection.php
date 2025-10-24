<?php
/**
 * UNIFIED CSRF PROTECTION
 * Single system for all CSRF protection across the entire application
 */
class UnifiedCSRFProtection {
    private static $instance = null;
    private $tokenName = 'csrf_token';
    private $sessionKey = 'csrf_tokens';
    private $maxTokens = 10;
    private $tokenLifetime = 3600; // 1 hour
    
    private function __construct() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * UNIFIED TOKEN GENERATION
     */
    public function generateToken() {
        $token = bin2hex(random_bytes(32));
        $timestamp = time();
        
        // Initialize tokens array if not exists
        if (!isset($_SESSION[$this->sessionKey])) {
            $_SESSION[$this->sessionKey] = [];
        }
        
        // Clean old tokens
        $this->cleanOldTokens();
        
        // Add new token
        $_SESSION[$this->sessionKey][$token] = $timestamp;
        
        // Limit number of tokens
        if (count($_SESSION[$this->sessionKey]) > $this->maxTokens) {
            $oldestToken = array_keys($_SESSION[$this->sessionKey], min($_SESSION[$this->sessionKey]));
            unset($_SESSION[$this->sessionKey][$oldestToken[0]]);
        }
        
        return $token;
    }
    
    /**
     * UNIFIED TOKEN VALIDATION
     */
    public function validateToken($token) {
        if (empty($token)) {
            return false;
        }
        
        if (!isset($_SESSION[$this->sessionKey][$token])) {
            return false;
        }
        
        $timestamp = $_SESSION[$this->sessionKey][$token];
        
        // Check if token is expired
        if (time() - $timestamp > $this->tokenLifetime) {
            unset($_SESSION[$this->sessionKey][$token]);
            return false;
        }
        
        // Remove token after use (one-time use)
        unset($_SESSION[$this->sessionKey][$token]);
        return true;
    }
    
    /**
     * UNIFIED TOKEN FOR FORMS
     */
    public function getTokenForForm() {
        return $this->generateToken();
    }
    
    /**
     * UNIFIED TOKEN FOR AJAX
     */
    public function getTokenForAjax() {
        return $this->generateToken();
    }
    
    /**
     * UNIFIED TOKEN CLEANUP
     */
    private function cleanOldTokens() {
        $currentTime = time();
        foreach ($_SESSION[$this->sessionKey] as $token => $timestamp) {
            if ($currentTime - $timestamp > $this->tokenLifetime) {
                unset($_SESSION[$this->sessionKey][$token]);
            }
        }
    }
    
    /**
     * UNIFIED API TOKEN HANDLING
     */
    public function handleApiRequest($action) {
        // Skip CSRF for certain actions
        $skipActions = ['get_csrf_token', 'login', 'logout', 'check_session'];
        
        if (in_array($action, $skipActions)) {
            return true;
        }
        
        // Validate CSRF token for POST requests
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $token = $_POST[$this->tokenName] ?? '';
            if (!$this->validateToken($token)) {
                http_response_code(403);
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'Invalid CSRF token']);
                exit;
            }
        }
        
        return true;
    }
    
    /**
     * UNIFIED TOKEN FOR API RESPONSE
     */
    public function getApiToken() {
        return [
            'csrf_token' => $this->generateToken(),
            'timestamp' => time()
        ];
    }
}

