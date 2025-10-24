<?php
/**
 * UNIFIED API HANDLER
 * Single system for all API requests across the entire application
 */
class UnifiedAPIHandler {
    private static $instance = null;
    private $auth;
    private $csrf;
    private $errorHandler;
    private $security;
    
    private function __construct() {
        // Load dependencies first
        require_once __DIR__ . '/UnifiedConfig.php';
        require_once __DIR__ . '/UnifiedErrorHandler.php';
        require_once __DIR__ . '/UnifiedCSRFProtection.php';
        require_once __DIR__ . '/UnifiedSecurityManager.php';
        require_once __DIR__ . '/UnifiedAuthManager.php';
        
        $this->auth = UnifiedAuthManager::getInstance();
        $this->csrf = UnifiedCSRFProtection::getInstance();
        $this->errorHandler = UnifiedErrorHandler::getInstance();
        $this->security = UnifiedSecurityManager::getInstance();
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * UNIFIED API REQUEST HANDLER
     */
    public function handleRequest($action, $requiredRoles = null, $requiredPermissions = []) {
        try {
            // Handle CSRF protection
            $this->csrf->handleApiRequest($action);
            
            // Handle authentication
            if ($requiredRoles !== null) {
                $this->auth->requireAuth($requiredRoles);
            }
            
            // Handle permissions
            foreach ($requiredPermissions as $resource => $permission) {
                if (!$this->auth->hasPermission($resource, $permission)) {
                    $this->errorHandler->permissionError("Insufficient permissions for {$resource}");
                }
            }
            
            // Route to appropriate handler
            return $this->routeRequest($action);
            
        } catch (Throwable $e) {
            return $this->errorHandler->handleException($e, ['action' => $action]);
        }
    }
    
    /**
     * UNIFIED REQUEST ROUTING
     */
    private function routeRequest($action) {
        switch ($action) {
            // Authentication actions
            case 'login':
                return $this->handleLogin();
            case 'logout':
                return $this->handleLogout();
            case 'check_session':
                return $this->handleCheckSession();
            case 'get_csrf_token':
                return $this->handleGetCSRFToken();
                
            // User management actions
            case 'get_users':
                return $this->handleGetUsers();
            case 'create_user':
                return $this->handleCreateUser();
            case 'update_user':
                return $this->handleUpdateUser();
            case 'delete_user':
                return $this->handleDeleteUser();
                
            // Course management actions
            case 'get_courses':
                return $this->handleGetCourses();
            case 'create_course':
                return $this->handleCreateCourse();
            case 'update_course':
                return $this->handleUpdateCourse();
            case 'delete_course':
                return $this->handleDeleteCourse();
                
            // Activity management actions
            case 'get_activities':
                return $this->handleGetActivities();
            case 'create_activity':
                return $this->handleCreateActivity();
            case 'update_activity':
                return $this->handleUpdateActivity();
            case 'delete_activity':
                return $this->handleDeleteActivity();
                
            // Material management actions
            case 'get_materials':
                return $this->handleGetMaterials();
            case 'create_material':
                return $this->handleCreateMaterial();
            case 'update_material':
                return $this->handleUpdateMaterial();
            case 'delete_material':
                return $this->handleDeleteMaterial();
                
            // Dashboard actions
            case 'get_dashboard_stats':
                return $this->handleGetDashboardStats();
            case 'get_recent_activities':
                return $this->handleGetRecentActivities();
                
            // Default
            default:
                $this->errorHandler->apiError("Unknown action: {$action}", 400);
        }
    }
    
    /**
     * UNIFIED LOGIN HANDLER
     */
    private function handleLogin() {
        $input = $this->security->sanitizeInput($_POST);
        
        $validation = $this->security->validateInput($input, [
            'email' => ['required' => true, 'type' => 'email'],
            'password' => ['required' => true, 'min_length' => 1]
        ]);
        
        if ($validation !== true) {
            $this->errorHandler->apiError('Validation failed', 400, $validation);
        }
        
        $email = $input['email'];
        $password = $input['password'];
        
        // Check rate limiting
        if (!$this->security->checkRateLimit($email, 'login')) {
            $this->errorHandler->apiError('Too many login attempts. Please try again later.', 429);
        }
        
        // Authenticate user
        $user = $this->authenticateUser($email, $password);
        
        if (!$user) {
            $this->security->handleLoginAttempt($email, false);
            $this->errorHandler->apiError('Invalid credentials', 401);
        }
        
        // Set session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        
        $this->security->handleLoginAttempt($email, true);
        
        $this->errorHandler->successResponse([
            'user' => $user,
            'redirect' => $this->getRedirectUrl($user['role'])
        ], 'Login successful');
    }
    
    /**
     * UNIFIED LOGOUT HANDLER
     */
    private function handleLogout() {
        $this->auth->logout();
        $this->errorHandler->successResponse([], 'Logout successful');
    }
    
    /**
     * UNIFIED SESSION CHECK
     */
    private function handleCheckSession() {
        if ($this->auth->isAuthenticated()) {
            $this->errorHandler->successResponse([
                'authenticated' => true,
                'user' => $this->auth->getUserData()
            ]);
        } else {
            $this->errorHandler->apiError('Not authenticated', 401);
        }
    }
    
    /**
     * UNIFIED CSRF TOKEN
     */
    private function handleGetCSRFToken() {
        $token = $this->csrf->getTokenForAjax();
        $this->errorHandler->successResponse(['csrf_token' => $token]);
    }
    
    /**
     * UNIFIED USER AUTHENTICATION
     */
    private function authenticateUser($email, $password) {
        try {
            $stmt = $this->security->prepareStatement(
                "SELECT id, name, email, password, role, status FROM users WHERE email = ? AND status = 'active'",
                [$email]
            );
            
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user || !$this->security->verifyPassword($password, $user['password'])) {
                return false;
            }
            
            unset($user['password']); // Remove password from response
            return $user;
            
        } catch (Throwable $e) {
            $this->errorHandler->logError('Authentication error', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
    
    /**
     * UNIFIED REDIRECT URL
     */
    private function getRedirectUrl($role) {
        switch ($role) {
            case 'admin':
                return 'admin_panel.php';
            case 'coordinator':
                return 'coordinator_dashboard.php';
            case 'teacher':
                return 'teacher_dashboard.php';
            case 'student':
                return 'student_dashboard.php';
            default:
                return 'index.php';
        }
    }
    
    /**
     * UNIFIED DASHBOARD STATS
     */
    private function handleGetDashboardStats() {
        $userRole = $this->auth->getUserRole();
        
        $stats = [];
        
        switch ($userRole) {
            case 'admin':
                $stats = $this->getAdminStats();
                break;
            case 'coordinator':
                $stats = $this->getCoordinatorStats();
                break;
            case 'teacher':
                $stats = $this->getTeacherStats();
                break;
            case 'student':
                $stats = $this->getStudentStats();
                break;
        }
        
        $this->errorHandler->successResponse($stats);
    }
    
    /**
     * UNIFIED STATS BY ROLE
     */
    private function getAdminStats() {
        // Admin-specific stats
        return [
            'total_users' => $this->getCount('users'),
            'total_courses' => $this->getCount('courses'),
            'total_activities' => $this->getCount('lesson_activities'),
            'active_sessions' => $this->getActiveSessions()
        ];
    }
    
    private function getCoordinatorStats() {
        // Coordinator-specific stats
        return [
            'total_courses' => $this->getCount('courses'),
            'total_activities' => $this->getCount('lesson_activities'),
            'total_materials' => $this->getCount('lesson_materials')
        ];
    }
    
    private function getTeacherStats() {
        // Teacher-specific stats
        return [
            'my_courses' => $this->getUserCourses(),
            'my_activities' => $this->getUserActivities(),
            'pending_submissions' => $this->getPendingSubmissions()
        ];
    }
    
    private function getStudentStats() {
        // Student-specific stats
        return [
            'enrolled_courses' => $this->getEnrolledCourses(),
            'completed_activities' => $this->getCompletedActivities(),
            'pending_activities' => $this->getPendingActivities()
        ];
    }
    
    /**
     * UNIFIED HELPER METHODS
     */
    private function getCount($table) {
        try {
            $stmt = $this->security->prepareStatement("SELECT COUNT(*) as count FROM {$table}");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['count'] ?? 0;
        } catch (Throwable $e) {
            return 0;
        }
    }
    
    private function getActiveSessions() {
        // Implementation for active sessions
        return 0;
    }
    
    private function getUserCourses() {
        // Implementation for user courses
        return [];
    }
    
    private function getUserActivities() {
        // Implementation for user activities
        return [];
    }
    
    private function getPendingSubmissions() {
        // Implementation for pending submissions
        return [];
    }
    
    private function getEnrolledCourses() {
        // Implementation for enrolled courses
        return [];
    }
    
    private function getCompletedActivities() {
        // Implementation for completed activities
        return [];
    }
    
    private function getPendingActivities() {
        // Implementation for pending activities
        return [];
    }
}
