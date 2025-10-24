<?php
/**
 * UNIFIED SECURITY MANAGER
 * Single system for all security across the entire application
 */
class UnifiedSecurityManager {
    private static $instance = null;
    private $db;
    private $rateLimiter;
    private $maxLoginAttempts = 5;
    private $lockoutTime = 900; // 15 minutes
    
    private function __construct() {
        // Load dependencies first
        require_once __DIR__ . '/../config/Database.php';
        require_once __DIR__ . '/../classes/RateLimiter.php';
        
        $this->db = (new Database())->getConnection();
        $this->rateLimiter = new RateLimiter($this->db);
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * UNIFIED PASSWORD SECURITY
     */
    public function hashPassword($password) {
        return password_hash($password, PASSWORD_DEFAULT, ['cost' => 12]);
    }
    
    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    public function validatePasswordStrength($password) {
        $errors = [];
        
        if (strlen($password) < 8) {
            $errors[] = 'Password must be at least 8 characters long';
        }
        
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Password must contain at least one uppercase letter';
        }
        
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'Password must contain at least one lowercase letter';
        }
        
        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = 'Password must contain at least one number';
        }
        
        if (!preg_match('/[^A-Za-z0-9]/', $password)) {
            $errors[] = 'Password must contain at least one special character';
        }
        
        return empty($errors) ? true : $errors;
    }
    
    /**
     * UNIFIED INPUT SANITIZATION
     */
    public function sanitizeInput($input, $type = 'string') {
        // Handle arrays
        if (is_array($input)) {
            $sanitized = [];
            foreach ($input as $key => $value) {
                $sanitized[$key] = $this->sanitizeInput($value, $type);
            }
            return $sanitized;
        }
        
        // Handle strings
        if (!is_string($input)) {
            return $input;
        }
        
        switch ($type) {
            case 'email':
                return filter_var(trim($input), FILTER_SANITIZE_EMAIL);
            case 'int':
                return filter_var($input, FILTER_SANITIZE_NUMBER_INT);
            case 'float':
                return filter_var($input, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
            case 'url':
                return filter_var(trim($input), FILTER_SANITIZE_URL);
            case 'string':
            default:
                return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
        }
    }
    
    /**
     * UNIFIED INPUT VALIDATION
     */
    public function validateInput($input, $rules) {
        $errors = [];
        
        foreach ($rules as $field => $rule) {
            $value = $input[$field] ?? '';
            
            if (isset($rule['required']) && $rule['required'] && empty($value)) {
                $errors[$field] = ucfirst($field) . ' is required';
                continue;
            }
            
            if (empty($value) && !isset($rule['required'])) {
                continue; // Skip validation for empty optional fields
            }
            
            if (isset($rule['type'])) {
                switch ($rule['type']) {
                    case 'email':
                        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                            $errors[$field] = 'Invalid email format';
                        }
                        break;
                    case 'int':
                        if (!is_numeric($value) || (int)$value != $value) {
                            $errors[$field] = 'Must be a valid integer';
                        }
                        break;
                    case 'float':
                        if (!is_numeric($value)) {
                            $errors[$field] = 'Must be a valid number';
                        }
                        break;
                    case 'url':
                        if (!filter_var($value, FILTER_VALIDATE_URL)) {
                            $errors[$field] = 'Invalid URL format';
                        }
                        break;
                }
            }
            
            if (isset($rule['min_length']) && strlen($value) < $rule['min_length']) {
                $errors[$field] = 'Must be at least ' . $rule['min_length'] . ' characters';
            }
            
            if (isset($rule['max_length']) && strlen($value) > $rule['max_length']) {
                $errors[$field] = 'Must not exceed ' . $rule['max_length'] . ' characters';
            }
            
            if (isset($rule['pattern']) && !preg_match($rule['pattern'], $value)) {
                $errors[$field] = 'Invalid format';
            }
        }
        
        return empty($errors) ? true : $errors;
    }
    
    /**
     * UNIFIED RATE LIMITING
     */
    public function checkRateLimit($identifier, $action, $maxAttempts = null, $timeWindow = null) {
        $maxAttempts = $maxAttempts ?? $this->maxLoginAttempts;
        $timeWindow = $timeWindow ?? $this->lockoutTime;
        
        return $this->rateLimiter->checkLimit($identifier, $action, $maxAttempts, $timeWindow);
    }
    
    /**
     * UNIFIED LOGIN SECURITY
     */
    public function handleLoginAttempt($email, $success) {
        $identifier = $this->getClientIdentifier();
        
        if ($success) {
            $this->rateLimiter->clearAttempts($identifier, 'login');
            return true;
        }
        
        $this->rateLimiter->recordAttempt($identifier, 'login');
        
        if ($this->rateLimiter->isLocked($identifier, 'login', $this->maxLoginAttempts, $this->lockoutTime)) {
            $this->logSecurityEvent('login_lockout', [
                'email' => $email,
                'identifier' => $identifier,
                'attempts' => $this->rateLimiter->getAttempts($identifier, 'login')
            ]);
            
            return false;
        }
        
        return true;
    }
    
    /**
     * UNIFIED SECURITY LOGGING
     */
    public function logSecurityEvent($event, $context = []) {
        try {
            $audit = new AuditLogService($this->db);
            $userId = $_SESSION['user_id'] ?? null;
            
            $audit->log(
                $userId,
                "security.{$event}",
                'security',
                json_encode($context)
            );
        } catch (Throwable $e) {
            error_log('Security logging failed: ' . $e->getMessage());
        }
    }
    
    /**
     * UNIFIED CLIENT IDENTIFICATION
     */
    private function getClientIdentifier() {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        return hash('sha256', $ip . $userAgent);
    }
    
    /**
     * UNIFIED FILE UPLOAD SECURITY
     */
    public function validateFileUpload($file, $allowedTypes = [], $maxSize = 5242880) { // 5MB default
        $errors = [];
        
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors[] = 'File upload error: ' . $file['error'];
            return $errors;
        }
        
        if ($file['size'] > $maxSize) {
            $errors[] = 'File too large. Maximum size: ' . ($maxSize / 1024 / 1024) . 'MB';
        }
        
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!empty($allowedTypes) && !in_array($mimeType, $allowedTypes)) {
            $errors[] = 'Invalid file type. Allowed: ' . implode(', ', $allowedTypes);
        }
        
        // Check for malicious file extensions
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $dangerousExtensions = ['php', 'phtml', 'php3', 'php4', 'php5', 'pl', 'py', 'jsp', 'asp', 'sh', 'cgi'];
        
        if (in_array($extension, $dangerousExtensions)) {
            $errors[] = 'Dangerous file type not allowed';
        }
        
        return empty($errors) ? true : $errors;
    }
    
    /**
     * UNIFIED SQL INJECTION PROTECTION
     */
    public function prepareStatement($sql, $params = []) {
        try {
            $stmt = $this->db->prepare($sql);
            
            if (!empty($params)) {
                $stmt->execute($params);
            }
            
            return $stmt;
        } catch (PDOException $e) {
            $this->logSecurityEvent('sql_error', [
                'sql' => $sql,
                'params' => $params,
                'error' => $e->getMessage()
            ]);
            
            throw new Exception('Database error occurred');
        }
    }
    
    /**
     * UNIFIED XSS PROTECTION
     */
    public function preventXSS($input) {
        return htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
    
    /**
     * UNIFIED SESSION SECURITY
     */
    public function secureSession() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Regenerate session ID periodically
        if (!isset($_SESSION['last_regeneration'])) {
            $_SESSION['last_regeneration'] = time();
        } elseif (time() - $_SESSION['last_regeneration'] > 300) { // 5 minutes
            session_regenerate_id(true);
            $_SESSION['last_regeneration'] = time();
        }
        
        // Set secure session parameters
        ini_set('session.cookie_httponly', 1);
        ini_set('session.cookie_secure', isset($_SERVER['HTTPS']));
        ini_set('session.use_strict_mode', 1);
    }
}
