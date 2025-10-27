<?php
require_once __DIR__ . "/../config/Database.php";
require_once __DIR__ . "/User.php";
require_once __DIR__ . "/SessionManager.php";

class Auth {
    /**
     * Enhanced authentication check with session validation
     */
    public static function requireAuth() {
        requireValidSession();
    }
    
    /**
     * Check if user is logged in with valid session
     */
    public static function isLoggedIn() {
        return validateSession();
    }
    
    /**
     * Get current user data
     */
    public static function getCurrentUser() {
        return getCurrentUser();
    }
    
    /**
     * Get current user ID
     */
    public static function getCurrentUserId() {
        return $_SESSION["user_id"] ?? null;
    }
    
    /**
     * Get current user role
     */
    public static function getCurrentUserRole() {
        return $_SESSION["user_role"] ?? null;
    }
    
    /**
     * Require specific role
     */
    public static function requireRole($requiredRole) {
        self::requireAuth();
        
        $currentRole = strtolower(self::getCurrentUserRole());
        $requiredRole = strtolower($requiredRole);
        
        if ($currentRole !== $requiredRole) {
            header("Location: login.php");
            exit();
        }
    }
    
    /**
     * Redirect if already logged in
     */
    public static function redirectIfLoggedIn() {
        if (self::isLoggedIn()) {
            $role = strtolower(self::getCurrentUserRole());
            
            switch ($role) {
                case "admin":
                    header("Location: admin_panel.php");
                    break;
                case "teacher":
                    header("Location: teacher_dashboard.php?section=my-classes");
                    break;
                case "coordinator":
                    header("Location: coordinator_dashboard.php");
                    break;
                case "student":
                default:
                    header("Location: student_dashboard.php?section=myclasses");
                    break;
            }
            exit();
        }
    }
    
    /**
     * Logout user
     */
    public static function logout() {
        // Clear remember me cookie if exists
        if (isset($_COOKIE["remember_token"])) {
            setcookie("remember_token", "", time() - 3600, "/");
        }
        
        // Clear session
        session_unset();
        session_destroy();
        
        // Redirect to login
        header("Location: login.php");
        exit();
    }
    
    /**
     * Update last activity
     */
    public static function updateActivity() {
        updateLastActivity();
    }
}
?>