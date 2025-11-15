<?php
require_once 'CSRFProtection.php';
require_once 'RateLimiter.php';
require_once __DIR__ . '/AuditLogService.php';

class LoginService {
    private $db;
    private $rateLimiter;
    
    public function __construct($db) {
        $this->db = $db;
        $this->rateLimiter = new RateLimiter($db);
    }
    
    public function login($data) {
        $response = [
            'success' => false,
            'message' => '',
            'redirect' => '',
            'errors' => []
        ];
        
        // CSRF Protection
        if (!$this->validateCSRFToken($data)) {
            $response['errors'][] = 'Invalid request. Please refresh the page and try again.';
            return $response;
        }
        
        // Rate limiting for login attempts
        $clientIP = $this->getClientIP();
        if (!$this->rateLimiter->isAllowed($clientIP, 'login_attempt', 5, 60)) { // 5 attempts per 1 minute
            $timeUntilReset = $this->rateLimiter->getTimeUntilReset($clientIP, 'login_attempt', 60);
            $response['errors'][] = "Too many login attempts. Please try again in " . ceil($timeUntilReset / 60) . " minute(s).";
            return $response;
        }
        
        // Sanitize input
        $email = User::sanitizeInput($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $rememberMe = isset($data['rememberMe']);
        
        // Validate required fields
        if (empty($email)) {
            $response['errors'][] = 'Please enter your email address.';
        }
        
        if (empty($password)) {
            $response['errors'][] = 'Please enter your password.';
        }
        
        if (!empty($response['errors'])) {
            $this->rateLimiter->recordAttempt($clientIP, 'login_attempt');
            return $response;
        }
        
        // Validate email format
        if (!User::validateEmailFormat($email)) {
            $response['errors'][] = 'Please enter a valid email address format.';
            $this->rateLimiter->recordAttempt($clientIP, 'login_attempt');
            return $response;
        }
        
        // Validate KLD email domain
        if (!preg_match('/^[a-zA-Z0-9._%+\-]+@kld\.edu\.ph$/', $email)) {
            $response['errors'][] = 'Please use your KLD email address (@kld.edu.ph).';
            $this->rateLimiter->recordAttempt($clientIP, 'login_attempt');
            return $response;
        }
        
        // Validate password length (consistent with registration)
        if (strlen($password) < 8) {
            $response['errors'][] = 'Password must be at least 8 characters long.';
            $this->rateLimiter->recordAttempt($clientIP, 'login_attempt');
            return $response;
        }
        
        if (!empty($response['errors'])) {
            return $response;
        }
        
        try {
            // Create User instance and attempt login
            $user = new User($this->db);
            $loginResult = $user->login($email, $password);
            
            if ($loginResult) {
                // Regenerate session ID to prevent session fixation
                session_regenerate_id(true);
                
                // Set session variables
                $_SESSION['user_id'] = $user->getId();
                $_SESSION['user_email'] = $user->getEmail();
                $_SESSION['user_firstname'] = $user->getFirstname();
                $_SESSION['user_lastname'] = $user->getLastname();
                $_SESSION['user_middlename'] = $user->getMiddlename();
                $middleInitial = $_SESSION['user_middlename'] ? ' ' . strtoupper(mb_substr(trim($_SESSION['user_middlename']), 0, 1)) . '.' : '';
                $_SESSION['user_name'] = trim($_SESSION['user_lastname'] . ', ' . $_SESSION['user_firstname'] . $middleInitial);
                $_SESSION['user_role'] = $user->getRole();
                $_SESSION['login_time'] = time();
                $_SESSION['last_activity'] = time();
                
                // Handle "Remember Me" functionality
                if ($rememberMe) {
                    $this->setRememberMeCookie($user->getId());
                }
                
                // Determine redirect based on role
                $redirect = $this->getRedirectUrl($user->getRole());
                
                $response['success'] = true;
                $response['message'] = 'Login successful!';
                $response['redirect'] = $redirect;
                
                // Log successful login
                error_log("Login successful - User ID: " . $user->getId() . " - IP: " . $clientIP);
                
                // Audit login success
                try { (new AuditLogService($this->db))->log($user->getId(), 'auth.login_success', 'user', (string)$user->getId()); } catch (Throwable $e) {}

                // Reset rate limit on successful login
                $this->rateLimiter->resetAttempts($clientIP, 'login_attempt');
                
            } else {
                $response['errors'][] = 'Invalid email or password. Please try again.';
                $this->rateLimiter->recordAttempt($clientIP, 'login_attempt');
                error_log("Login failed - Invalid credentials for email: " . $email . " - IP: " . $clientIP);
            }
            
        } catch (Exception $e) {
            $response['errors'][] = 'An error occurred. Please try again later.';
            $this->rateLimiter->recordAttempt($clientIP, 'login_attempt');
            error_log("Login error: " . $e->getMessage() . " - IP: " . $clientIP);
        }
        
        return $response;
    }
    
    /**
     * Validate CSRF token
     * @param array $data
     * @return bool
     */
    private function validateCSRFToken($data) {
        // Ensure session is started
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
        
        $token = $data[CSRFProtection::getTokenName()] ?? '';
        
        // Debug logging
        error_log("CSRF Validation - Token received: " . (!empty($token) ? substr($token, 0, 10) . '...' : 'EMPTY'));
        error_log("CSRF Validation - Session name: " . session_name());
        error_log("CSRF Validation - Session ID: " . session_id());
        error_log("CSRF Validation - Session has tokens: " . (isset($_SESSION['csrf_tokens']) ? 'YES (' . count($_SESSION['csrf_tokens']) . ')' : 'NO'));
        if (isset($_SESSION['csrf_tokens'])) {
            error_log("CSRF Validation - Available tokens: " . implode(', ', array_map(function($t) { return substr($t, 0, 10) . '...'; }, array_keys($_SESSION['csrf_tokens']))));
        }
        
        if (empty($token)) {
            error_log("CSRF Validation - Token is empty");
            return false;
        }
        
        $isValid = CSRFProtection::validateToken($token);
        error_log("CSRF Validation - Result: " . ($isValid ? 'VALID' : 'INVALID'));
        
        return $isValid;
    }
    
    /**
     * Get client IP address
     * @return string
     */
    private function getClientIP() {
        $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (isset($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
    
    private function setRememberMeCookie($userId) {
        $token = bin2hex(random_bytes(32));
        $expires = time() + (30 * 24 * 60 * 60); // 30 days
        
        // Store token in database
        $stmt = $this->db->prepare("INSERT INTO remember_me_tokens (user_id, token, expires_at) VALUES (?, ?, FROM_UNIXTIME(?))");
        $stmt->execute([$userId, $token, $expires]);
        
        // Set secure cookie
        setcookie('remember_token', $token, $expires, '/', '', true, true);
    }
    
    private function getRedirectUrl($role) {
        $role = strtoupper($role);
        
        switch ($role) {
            case 'ADMIN':
                return 'admin_panel.php';
            case 'STUDENT':
                return 'student_dashboard.php?section=myclasses';
            case 'TEACHER':
                return 'teacher_dashboard.php?section=my-classes'; // Match actual filename
            case 'COORDINATOR':
                return 'coordinator_dashboard.php';
            default:
                return 'dashboard.php';
        }
    }
    
    public function logout() {
        // Ensure session is started
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
        
        // Audit logout before session clear
        try { 
            $uid = $_SESSION['user_id'] ?? null; 
            if ($uid) { 
                (new AuditLogService($this->db))->log($uid, 'auth.logout', 'user', (string)$uid); 
            } 
        } catch (Throwable $e) {
            error_log('Audit log error during logout: ' . $e->getMessage());
        }

        // Clear all session variables
        $_SESSION = [];
        
        // Clear remember me cookie
        if (isset($_COOKIE['remember_token'])) {
            $token = $_COOKIE['remember_token'];
            
            // Remove token from database
            try {
                $stmt = $this->db->prepare("DELETE FROM remember_me_tokens WHERE token = ?");
                $stmt->execute([$token]);
            } catch (Throwable $e) {
                error_log('Error deleting remember token: ' . $e->getMessage());
            }
            
            // Clear cookie
            setcookie('remember_token', '', time() - 3600, '/', '', false, true);
        }
        
        // Destroy session cookie
        if (isset($_COOKIE[session_name()])) {
            setcookie(session_name(), '', time() - 3600, '/');
        }
        
        // Destroy session
        @session_destroy();
        
        return [
            'success' => true,
            'message' => 'Logged out successfully.',
            'redirect' => 'login.php'
        ];
    }
    
    /**
     * Check if user is logged in
     * @return bool
     */
    public function isLoggedIn() {
        return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
    }
    
    /**
     * Get current user ID
     * @return int|null
     */
    public function getCurrentUserId() {
        return $_SESSION['user_id'] ?? null;
    }
    
    /**
     * Get current user role
     * @return string|null
     */
    public function getCurrentUserRole() {
        return $_SESSION['user_role'] ?? null;
    }
    
    /**
     * Update last activity time
     */
    public function updateLastActivity() {
        if ($this->isLoggedIn()) {
            $_SESSION['last_activity'] = time();
        }
    }
    
    /**
     * Check if session has expired (1 hour of inactivity)
     * @return bool
     */
    public function isSessionExpired() {
        if (!$this->isLoggedIn()) {
            return true;
        }
        
        $lastActivity = $_SESSION['last_activity'] ?? 0;
        $timeout = 60 * 60; // 1 hour (3600 seconds)
        
        return (time() - $lastActivity) > $timeout;
    }
} 