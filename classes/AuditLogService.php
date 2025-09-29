<?php

class AuditLogService {
    private $db;

    public function __construct($db) {
        $this->db = $db;
        $this->ensureSchema();
    }

    private function ensureSchema() {
        try {
            $this->db->exec("CREATE TABLE IF NOT EXISTS audit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                action VARCHAR(64) NOT NULL,
                entity_type VARCHAR(64) NULL,
                entity_id VARCHAR(64) NULL,
                details TEXT NULL,
                ip VARCHAR(45) NULL,
                user_agent VARCHAR(255) NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        } catch (Throwable $e) {
            // silent
        }
    }

    public function log($userId, $action, $entityType = null, $entityId = null, array $details = []) {
        try {
            $ip = $this->getClientIP();
            $ua = isset($_SERVER['HTTP_USER_AGENT']) ? substr((string)$_SERVER['HTTP_USER_AGENT'], 0, 255) : null;
            $json = !empty($details) ? json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;
            $stmt = $this->db->prepare("INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $userId,
                $action,
                $entityType,
                $entityId,
                $json,
                $ip,
                $ua
            ]);
        } catch (Throwable $e) {
            // avoid throwing from logging path
        }
    }

    private function getClientIP() {
        $keys = ['HTTP_X_FORWARDED_FOR','HTTP_X_REAL_IP','HTTP_CLIENT_IP','REMOTE_ADDR'];
        foreach ($keys as $k) {
            if (!empty($_SERVER[$k])) {
                $ip = $_SERVER[$k];
                if (strpos($ip, ',') !== false) { $ip = trim(explode(',', $ip)[0]); }
                return substr($ip, 0, 45);
            }
        }
        return null;
    }
}

?>








