<?php
/**
 * Cleanup Script for CodeRegal
 * 
 * This script cleans up expired tokens and old data.
 * Run this script via cron job or manually.
 * 
 * Recommended cron schedule: 0 2 * * * (daily at 2 AM)
 */

require_once '../config/Database.php';

class CleanupService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Clean up expired remember me tokens
     * @return array
     */
    public function cleanupRememberMeTokens() {
        try {
            $stmt = $this->db->prepare("
                DELETE FROM remember_me_tokens 
                WHERE expires_at < NOW()
            ");
            $stmt->execute();
            $deletedCount = $stmt->rowCount();
            
            return [
                'success' => true,
                'message' => "Cleaned up {$deletedCount} expired remember me tokens",
                'count' => $deletedCount
            ];
        } catch (Exception $e) {
            error_log("Error cleaning up remember me tokens: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error cleaning up remember me tokens: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Clean up expired password reset tokens
     * @return array
     */
    public function cleanupPasswordResetTokens() {
        try {
            $stmt = $this->db->prepare("
                UPDATE users 
                SET reset_token = NULL, reset_token_expires = NULL 
                WHERE reset_token_expires < NOW()
            ");
            $stmt->execute();
            $updatedCount = $stmt->rowCount();
            
            return [
                'success' => true,
                'message' => "Cleaned up {$updatedCount} expired password reset tokens",
                'count' => $updatedCount
            ];
        } catch (Exception $e) {
            error_log("Error cleaning up password reset tokens: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error cleaning up password reset tokens: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Clean up old rate limit records
     * @return array
     */
    public function cleanupRateLimits() {
        try {
            $stmt = $this->db->prepare("
                DELETE FROM rate_limits 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ");
            $stmt->execute();
            $deletedCount = $stmt->rowCount();
            
            return [
                'success' => true,
                'message' => "Cleaned up {$deletedCount} old rate limit records",
                'count' => $deletedCount
            ];
        } catch (Exception $e) {
            error_log("Error cleaning up rate limits: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error cleaning up rate limits: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Clean up old session data (if using database sessions)
     * @return array
     */
    public function cleanupSessions() {
        try {
            // This assumes you're using database sessions
            // Adjust the table name and logic as needed
            $stmt = $this->db->prepare("
                DELETE FROM sessions 
                WHERE last_activity < DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ");
            $stmt->execute();
            $deletedCount = $stmt->rowCount();
            
            return [
                'success' => true,
                'message' => "Cleaned up {$deletedCount} expired sessions",
                'count' => $deletedCount
            ];
        } catch (Exception $e) {
            // Sessions table might not exist, which is fine
            return [
                'success' => true,
                'message' => 'No sessions table found (using file sessions)',
                'count' => 0
            ];
        }
    }
    
    /**
     * Archive old user activity logs (if you have them)
     * @return array
     */
    public function archiveOldLogs() {
        try {
            // Example: Archive logs older than 30 days
            $stmt = $this->db->prepare("
                INSERT INTO archived_logs 
                SELECT *, NOW() as archived_at 
                FROM user_activity_logs 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
            ");
            $stmt->execute();
            $archivedCount = $stmt->rowCount();
            
            if ($archivedCount > 0) {
                $deleteStmt = $this->db->prepare("
                    DELETE FROM user_activity_logs 
                    WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
                ");
                $deleteStmt->execute();
            }
            
            return [
                'success' => true,
                'message' => "Archived {$archivedCount} old log entries",
                'count' => $archivedCount
            ];
        } catch (Exception $e) {
            // Log table might not exist, which is fine
            return [
                'success' => true,
                'message' => 'No activity logs table found',
                'count' => 0
            ];
        }
    }
    
    /**
     * Run all cleanup tasks
     * @return array
     */
    public function runAllCleanup() {
        $results = [];
        
        $results['remember_me'] = $this->cleanupRememberMeTokens();
        $results['password_reset'] = $this->cleanupPasswordResetTokens();
        $results['rate_limits'] = $this->cleanupRateLimits();
        $results['sessions'] = $this->cleanupSessions();
        $results['logs'] = $this->archiveOldLogs();
        
        return $results;
    }
    
    /**
     * Get cleanup statistics
     * @return array
     */
    public function getCleanupStats() {
        $stats = [];
        
        try {
            // Count expired remember me tokens
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count 
                FROM remember_me_tokens 
                WHERE expires_at < NOW()
            ");
            $stmt->execute();
            $stats['expired_remember_me'] = $stmt->fetchColumn();
            
            // Count expired password reset tokens
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count 
                FROM users 
                WHERE reset_token_expires < NOW()
            ");
            $stmt->execute();
            $stats['expired_password_reset'] = $stmt->fetchColumn();
            
            // Count old rate limit records
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count 
                FROM rate_limits 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ");
            $stmt->execute();
            $stats['old_rate_limits'] = $stmt->fetchColumn();
            
        } catch (Exception $e) {
            error_log("Error getting cleanup stats: " . $e->getMessage());
        }
        
        return $stats;
    }
}

// CLI execution
if (php_sapi_name() === 'cli') {
    echo "CodeRegal Cleanup Script\n";
    echo "=======================\n\n";
    
    try {
        $db = (new Database())->getConnection();
        $cleanup = new CleanupService($db);
        
        echo "Getting cleanup statistics...\n";
        $stats = $cleanup->getCleanupStats();
        foreach ($stats as $type => $count) {
            echo "- {$type}: {$count}\n";
        }
        
        echo "\nRunning cleanup tasks...\n";
        $results = $cleanup->runAllCleanup();
        
        foreach ($results as $task => $result) {
            $status = $result['success'] ? '✓' : '✗';
            echo "{$status} {$task}: {$result['message']}\n";
        }
        
        echo "\nCleanup completed!\n";
        
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
        exit(1);
    }
}

// Web execution (for testing)
if (isset($_GET['run_cleanup']) && $_GET['run_cleanup'] === 'true') {
    header('Content-Type: application/json');
    
    try {
        $db = (new Database())->getConnection();
        $cleanup = new CleanupService($db);
        $results = $cleanup->runAllCleanup();
        
        echo json_encode([
            'success' => true,
            'results' => $results,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
}
?> 