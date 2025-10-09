<?php
class RateLimiter {
    private $db;
    private $tableName = 'rate_limits';
    
    public function __construct($db) {
        $this->db = $db;
        $this->createTableIfNotExists();
    }
    
    /**
     * Check if an action is allowed for a given identifier
     * @param string $identifier (IP, email, user_id, etc.)
     * @param string $action (e.g., 'verification_code', 'login_attempt')
     * @param int $maxAttempts Maximum attempts allowed
     * @param int $windowSeconds Time window in seconds
     * @return bool
     */
    public function isAllowed($identifier, $action, $maxAttempts, $windowSeconds) {
        try {
            $this->cleanupExpiredRecords();
            
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as attempts 
                FROM {$this->tableName} 
                WHERE identifier = ? AND action = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)
            ");
            $stmt->execute([$identifier, $action, $windowSeconds]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $result['attempts'] < $maxAttempts;
        } catch (Exception $e) {
            error_log("Rate limiter error: " . $e->getMessage());
            return true; // Allow if rate limiter fails
        }
    }
    
    /**
     * Record an attempt
     * @param string $identifier
     * @param string $action
     * @return bool
     */
    public function recordAttempt($identifier, $action) {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO {$this->tableName} (identifier, action, created_at) 
                VALUES (?, ?, NOW())
            ");
            return $stmt->execute([$identifier, $action]);
        } catch (Exception $e) {
            error_log("Rate limiter record error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get remaining attempts for an identifier
     * @param string $identifier
     * @param string $action
     * @param int $maxAttempts
     * @param int $windowSeconds
     * @return int
     */
    public function getRemainingAttempts($identifier, $action, $maxAttempts, $windowSeconds) {
        try {
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as attempts 
                FROM {$this->tableName} 
                WHERE identifier = ? AND action = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)
            ");
            $stmt->execute([$identifier, $action, $windowSeconds]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return max(0, $maxAttempts - $result['attempts']);
        } catch (Exception $e) {
            error_log("Rate limiter get remaining error: " . $e->getMessage());
            return $maxAttempts;
        }
    }
    
    /**
     * Get time until next allowed attempt
     * @param string $identifier
     * @param string $action
     * @param int $windowSeconds
     * @return int Seconds until next allowed attempt
     */
    public function getTimeUntilReset($identifier, $action, $windowSeconds) {
        try {
            $stmt = $this->db->prepare("
                SELECT MAX(created_at) as last_attempt 
                FROM {$this->tableName} 
                WHERE identifier = ? AND action = ?
            ");
            $stmt->execute([$identifier, $action]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$result['last_attempt']) {
                return 0;
            }
            
            $lastAttempt = strtotime($result['last_attempt']);
            $resetTime = $lastAttempt + $windowSeconds;
            $timeUntilReset = $resetTime - time();
            
            return max(0, $timeUntilReset);
        } catch (Exception $e) {
            error_log("Rate limiter get time error: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Clean up expired records
     */
    private function cleanupExpiredRecords() {
        try {
            // Clean up records older than 24 hours
            $stmt = $this->db->prepare("
                DELETE FROM {$this->tableName} 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ");
            $stmt->execute();
        } catch (Exception $e) {
            error_log("Rate limiter cleanup error: " . $e->getMessage());
        }
    }
    
    /**
     * Create the rate_limits table if it doesn't exist
     */
    private function createTableIfNotExists() {
        try {
            $sql = "CREATE TABLE IF NOT EXISTS {$this->tableName} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                identifier VARCHAR(255) NOT NULL,
                action VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_identifier_action (identifier, action),
                INDEX idx_created_at (created_at)
            )";
            $this->db->exec($sql);
        } catch (Exception $e) {
            error_log("Rate limiter table creation error: " . $e->getMessage());
        }
    }
    
    /**
     * Reset attempts for an identifier (useful for testing or admin actions)
     * @param string $identifier
     * @param string $action
     * @return bool
     */
    public function resetAttempts($identifier, $action) {
        try {
            $stmt = $this->db->prepare("
                DELETE FROM {$this->tableName} 
                WHERE identifier = ? AND action = ?
            ");
            return $stmt->execute([$identifier, $action]);
        } catch (Exception $e) {
            error_log("Rate limiter reset error: " . $e->getMessage());
            return false;
        }
    }
}
?> 