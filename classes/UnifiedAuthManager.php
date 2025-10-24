<?php
/**
 * UNIFIED AUTHENTICATION MANAGER
 * Single system for all authentication across the entire application
 */
class UnifiedAuthManager {
    private static $instance = null;
    private $db;
    private $sessionStarted = false;
    
    // Unified role constants
    const ROLE_ADMIN = 'admin';
    const ROLE_COORDINATOR = 'coordinator';
    const ROLE_TEACHER = 'teacher';
    const ROLE_STUDENT = 'student';
    
    // Unified permission levels
    const PERMISSION_FULL = 'full';
    const PERMISSION_READ = 'read';
    const PERMISSION_WRITE = 'write';
    const PERMISSION_NONE = 'none';
    
    private function __construct() {
        // Load dependencies first
        require_once __DIR__ . '/../config/Database.php';
        require_once __DIR__ . '/../classes/AuditLogService.php';
        
        $this->db = (new Database())->getConnection();
        $this->startSession();
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * UNIFIED SESSION MANAGEMENT
     */
    private function startSession() {
        if (!$this->sessionStarted && session_status() === PHP_SESSION_NONE) {
            session_start();
            $this->sessionStarted = true;
        }
    }
    
    /**
     * UNIFIED AUTHENTICATION CHECK
     */
    public function requireAuth($requiredRoles = null) {
        if (!$this->isAuthenticated()) {
            $this->redirectToLogin();
        }
        
        if ($requiredRoles !== null) {
            if (!$this->hasRole($requiredRoles)) {
                $this->redirectToUnauthorized();
            }
        }
    }
    
    /**
     * UNIFIED ROLE CHECKING
     */
    public function hasRole($roles) {
        $userRole = $this->getUserRole();
        
        if (is_string($roles)) {
            return $userRole === $roles;
        }
        
        if (is_array($roles)) {
            return in_array($userRole, $roles, true);
        }
        
        return false;
    }
    
    /**
     * UNIFIED PERMISSION CHECKING
     */
    public function hasPermission($resource, $action = self::PERMISSION_READ) {
        $userRole = $this->getUserRole();
        
        // Define unified permission matrix
        $permissions = [
            self::ROLE_ADMIN => [
                'users' => self::PERMISSION_FULL,
                'courses' => self::PERMISSION_FULL,
                'activities' => self::PERMISSION_FULL,
                'materials' => self::PERMISSION_FULL,
                'reports' => self::PERMISSION_FULL,
                'settings' => self::PERMISSION_FULL
            ],
            self::ROLE_COORDINATOR => [
                'users' => self::PERMISSION_READ,
                'courses' => self::PERMISSION_FULL,
                'activities' => self::PERMISSION_FULL,
                'materials' => self::PERMISSION_FULL,
                'reports' => self::PERMISSION_READ,
                'settings' => self::PERMISSION_READ
            ],
            self::ROLE_TEACHER => [
                'users' => self::PERMISSION_NONE,
                'courses' => self::PERMISSION_READ,
                'activities' => self::PERMISSION_WRITE,
                'materials' => self::PERMISSION_WRITE,
                'reports' => self::PERMISSION_READ,
                'settings' => self::PERMISSION_NONE
            ],
            self::ROLE_STUDENT => [
                'users' => self::PERMISSION_NONE,
                'courses' => self::PERMISSION_READ,
                'activities' => self::PERMISSION_READ,
                'materials' => self::PERMISSION_READ,
                'reports' => self::PERMISSION_NONE,
                'settings' => self::PERMISSION_NONE
            ]
        ];
        
        $userPermission = $permissions[$userRole][$resource] ?? self::PERMISSION_NONE;
        
        return $this->comparePermissions($userPermission, $action);
    }
    
    /**
     * UNIFIED USER DATA
     */
    public function isAuthenticated() {
        return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
    }
    
    public function getUserId() {
        return $_SESSION['user_id'] ?? null;
    }
    
    public function getUserRole() {
        return $_SESSION['user_role'] ?? self::ROLE_STUDENT;
    }
    
    public function getUserData() {
        if (!$this->isAuthenticated()) {
            return null;
        }
        
        return [
            'id' => $this->getUserId(),
            'role' => $this->getUserRole(),
            'name' => $_SESSION['user_name'] ?? 'Unknown',
            'email' => $_SESSION['user_email'] ?? 'unknown@example.com'
        ];
    }
    
    /**
     * UNIFIED LOGOUT
     */
    public function logout() {
        // Log logout event
        try {
            if ($this->isAuthenticated()) {
                $audit = new AuditLogService($this->db);
                $audit->log($this->getUserId(), 'auth.logout', 'user', (string)$this->getUserId());
            }
        } catch (Throwable $e) {
            // Log error but don't fail logout
            error_log('Audit log error during logout: ' . $e->getMessage());
        }
        
        // Clear session
        session_destroy();
        $this->sessionStarted = false;
    }
    
    /**
     * UNIFIED REDIRECTS
     */
    private function redirectToLogin() {
        header('Location: login.php');
        exit;
    }
    
    private function redirectToUnauthorized() {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
        exit;
    }
    
    /**
     * UNIFIED PERMISSION COMPARISON
     */
    private function comparePermissions($userPermission, $requiredPermission) {
        $permissionLevels = [
            self::PERMISSION_NONE => 0,
            self::PERMISSION_READ => 1,
            self::PERMISSION_WRITE => 2,
            self::PERMISSION_FULL => 3
        ];
        
        $userLevel = $permissionLevels[$userPermission] ?? 0;
        $requiredLevel = $permissionLevels[$requiredPermission] ?? 0;
        
        return $userLevel >= $requiredLevel;
    }
    
    /**
     * UNIFIED API RESPONSE
     */
    public function apiResponse($success, $data = [], $message = '') {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => $success,
            'data' => $data,
            'message' => $message,
            'user' => $this->getUserData()
        ]);
        exit;
    }
}
