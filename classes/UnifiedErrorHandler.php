<?php
/**
 * UNIFIED ERROR HANDLER
 * Single system for all error handling across the entire application
 */
class UnifiedErrorHandler {
    private static $instance = null;
    private $db;
    private $debugMode = false;
    private $logErrors = true;
    
    private function __construct() {
        // Load dependencies first
        require_once __DIR__ . '/../config/Database.php';
        
        $this->db = (new Database())->getConnection();
        $this->debugMode = defined('DEBUG_MODE') ? DEBUG_MODE : false;
        $this->logErrors = defined('LOG_ERRORS') ? LOG_ERRORS : true;
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * UNIFIED ERROR LOGGING
     */
    public function logError($message, $context = [], $level = 'ERROR') {
        if (!$this->logErrors) {
            return;
        }
        
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'level' => $level,
            'message' => $message,
            'context' => $context,
            'user_id' => $_SESSION['user_id'] ?? null,
            'user_role' => $_SESSION['user_role'] ?? 'unknown',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ];
        
        // Log to file
        error_log(json_encode($logEntry));
        
        // Log to database if available
        try {
            $this->logToDatabase($logEntry);
        } catch (Throwable $e) {
            // Don't fail if database logging fails
            error_log('Database logging failed: ' . $e->getMessage());
        }
    }
    
    /**
     * UNIFIED ERROR HANDLING
     */
    public function handleError($errno, $errstr, $errfile, $errline) {
        $this->logError("PHP Error: {$errstr}", [
            'file' => $errfile,
            'line' => $errline,
            'errno' => $errno
        ], 'ERROR');
        
        return true; // Don't execute PHP internal error handler
    }
    
    /**
     * UNIFIED EXCEPTION HANDLING
     */
    public function handleException(Throwable $e, $context = []) {
        $this->logError(
            'Exception: ' . $e->getMessage(),
            array_merge($context, [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]),
            'EXCEPTION'
        );
        
        if ($this->debugMode) {
            return $this->getDebugResponse($e);
        }
        
        return $this->getUserFriendlyResponse();
    }
    
    /**
     * UNIFIED API ERROR RESPONSE
     */
    public function apiError($message, $code = 500, $context = []) {
        $this->logError($message, $context, 'API_ERROR');
        
        http_response_code($code);
        header('Content-Type: application/json');
        
        $response = [
            'success' => false,
            'message' => $this->debugMode ? $message : 'An error occurred',
            'timestamp' => time()
        ];
        
        if ($this->debugMode && !empty($context)) {
            $response['debug'] = $context;
        }
        
        echo json_encode($response);
        exit;
    }
    
    /**
     * UNIFIED VALIDATION ERROR
     */
    public function validationError($field, $message) {
        $this->logError("Validation error: {$field} - {$message}", ['field' => $field], 'VALIDATION');
        
        return [
            'success' => false,
            'message' => $message,
            'field' => $field
        ];
    }
    
    /**
     * UNIFIED DATABASE ERROR
     */
    public function databaseError($message, $query = null) {
        $context = [];
        if ($query) {
            $context['query'] = $query;
        }
        
        $this->logError("Database error: {$message}", $context, 'DATABASE');
        
        return $this->getUserFriendlyResponse();
    }
    
    /**
     * UNIFIED AUTHENTICATION ERROR
     */
    public function authError($message = 'Authentication required') {
        $this->logError("Auth error: {$message}", [], 'AUTH');
        
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => $message,
            'redirect' => 'login.php'
        ]);
        exit;
    }
    
    /**
     * UNIFIED PERMISSION ERROR
     */
    public function permissionError($message = 'Insufficient permissions') {
        $this->logError("Permission error: {$message}", [], 'PERMISSION');
        
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => $message
        ]);
        exit;
    }
    
    /**
     * UNIFIED SUCCESS RESPONSE
     */
    public function successResponse($data = [], $message = 'Success') {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'data' => $data,
            'message' => $message,
            'timestamp' => time()
        ]);
        exit;
    }
    
    /**
     * UNIFIED DEBUG RESPONSE
     */
    private function getDebugResponse(Throwable $e) {
        return [
            'success' => false,
            'message' => 'Debug mode: ' . $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ];
    }
    
    /**
     * UNIFIED USER-FRIENDLY RESPONSE
     */
    private function getUserFriendlyResponse() {
        return [
            'success' => false,
            'message' => 'An unexpected error occurred. Please try again.'
        ];
    }
    
    /**
     * UNIFIED DATABASE LOGGING
     */
    private function logToDatabase($logEntry) {
        if (!$this->db) {
            return;
        }
        
        try {
            $stmt = $this->db->prepare("
                INSERT INTO error_logs (timestamp, level, message, context, user_id, request_uri) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $logEntry['timestamp'],
                $logEntry['level'],
                $logEntry['message'],
                json_encode($logEntry['context']),
                $logEntry['user_id'],
                $logEntry['request_uri']
            ]);
        } catch (Throwable $e) {
            // Don't fail if database logging fails
            error_log('Database error logging failed: ' . $e->getMessage());
        }
    }
}
