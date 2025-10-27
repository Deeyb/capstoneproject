<?php
/**
 * UNIFIED CONFIGURATION
 * Single configuration file for the entire application
 */
class UnifiedConfig {
    // Database Configuration
    const DB_HOST = 'localhost';
    const DB_NAME = 'coderegal_db';
    const DB_USER = 'root';
    const DB_PASS = '';
    const DB_CHARSET = 'utf8mb4';
    
    // Security Configuration
    const PASSWORD_MIN_LENGTH = 8;
    const PASSWORD_REQUIRE_UPPERCASE = true;
    const PASSWORD_REQUIRE_LOWERCASE = true;
    const PASSWORD_REQUIRE_NUMBERS = true;
    const PASSWORD_REQUIRE_SPECIAL = true;
    
    // Session Configuration
    const SESSION_LIFETIME = 3600; // 1 hour
    const SESSION_REGENERATE_INTERVAL = 300; // 5 minutes
    const SESSION_SECURE_COOKIE = true;
    const SESSION_HTTP_ONLY = true;
    
    // CSRF Configuration
    const CSRF_TOKEN_LIFETIME = 3600; // 1 hour
    const CSRF_MAX_TOKENS = 10;
    
    // Rate Limiting Configuration
    const RATE_LIMIT_LOGIN_ATTEMPTS = 5;
    const RATE_LIMIT_LOGIN_LOCKOUT = 60; // 1 minute
    const RATE_LIMIT_API_REQUESTS = 100;
    const RATE_LIMIT_API_WINDOW = 3600; // 1 hour
    
    // File Upload Configuration
    const MAX_FILE_SIZE = 5242880; // 5MB
    const ALLOWED_FILE_TYPES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    // Application Configuration
    const APP_NAME = 'CodeRegal';
    const APP_VERSION = '2.0.0';
    const DEBUG_MODE = false;
    const LOG_ERRORS = true;
    
    // Role Configuration
    const ROLES = [
        'admin' => [
            'name' => 'Administrator',
            'permissions' => ['full'],
            'dashboard' => 'admin_panel.php'
        ],
        'coordinator' => [
            'name' => 'Coordinator',
            'permissions' => ['courses', 'activities', 'materials', 'reports'],
            'dashboard' => 'coordinator_dashboard.php'
        ],
        'teacher' => [
            'name' => 'Teacher',
            'permissions' => ['activities', 'materials'],
            'dashboard' => 'teacher_dashboard.php'
        ],
        'student' => [
            'name' => 'Student',
            'permissions' => ['read'],
            'dashboard' => 'student_dashboard.php'
        ]
    ];
    
    // Permission Configuration
    const PERMISSIONS = [
        'users' => [
            'admin' => 'full',
            'coordinator' => 'read',
            'teacher' => 'none',
            'student' => 'none'
        ],
        'courses' => [
            'admin' => 'full',
            'coordinator' => 'full',
            'teacher' => 'read',
            'student' => 'read'
        ],
        'activities' => [
            'admin' => 'full',
            'coordinator' => 'full',
            'teacher' => 'write',
            'student' => 'read'
        ],
        'materials' => [
            'admin' => 'full',
            'coordinator' => 'full',
            'teacher' => 'write',
            'student' => 'read'
        ],
        'reports' => [
            'admin' => 'full',
            'coordinator' => 'read',
            'teacher' => 'read',
            'student' => 'none'
        ],
        'settings' => [
            'admin' => 'full',
            'coordinator' => 'read',
            'teacher' => 'none',
            'student' => 'none'
        ]
    ];
    
    /**
     * Get configuration value
     */
    public static function get($key, $default = null) {
        return defined("self::{$key}") ? constant("self::{$key}") : $default;
    }
    
    /**
     * Get role configuration
     */
    public static function getRoleConfig($role) {
        return self::ROLES[$role] ?? null;
    }
    
    /**
     * Get permission for role and resource
     */
    public static function getPermission($role, $resource) {
        return self::PERMISSIONS[$resource][$role] ?? 'none';
    }
    
    /**
     * Check if role has permission
     */
    public static function hasPermission($role, $resource, $requiredPermission = 'read') {
        $userPermission = self::getPermission($role, $resource);
        
        $permissionLevels = [
            'none' => 0,
            'read' => 1,
            'write' => 2,
            'full' => 3
        ];
        
        $userLevel = $permissionLevels[$userPermission] ?? 0;
        $requiredLevel = $permissionLevels[$requiredPermission] ?? 0;
        
        return $userLevel >= $requiredLevel;
    }
    
    /**
     * Get dashboard URL for role
     */
    public static function getDashboardUrl($role) {
        $config = self::getRoleConfig($role);
        return $config['dashboard'] ?? 'index.php';
    }
    
    /**
     * Get all roles
     */
    public static function getAllRoles() {
        return array_keys(self::ROLES);
    }
    
    /**
     * Get all resources
     */
    public static function getAllResources() {
        return array_keys(self::PERMISSIONS);
    }
}

