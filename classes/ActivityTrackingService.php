<?php
/**
 * ActivityTrackingService
 * Tracks and retrieves active student activity for lessons
 */
class ActivityTrackingService {
    private $db;
    private $tableName = 'activity_tracking';
    
    public function __construct($db) {
        $this->db = $db;
        $this->ensureTableExists();
    }
    
    /**
     * Ensure activity_tracking table exists
     */
    private function ensureTableExists() {
        try {
            $this->db->exec("CREATE TABLE IF NOT EXISTS {$this->tableName} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                lesson_id INT NOT NULL,
                class_id INT,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_lesson_user (lesson_id, user_id),
                INDEX idx_lesson_time (lesson_id, last_activity),
                INDEX idx_user (user_id),
                UNIQUE KEY idx_user_lesson (user_id, lesson_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        } catch (PDOException $e) {
            error_log("ActivityTrackingService: Table creation error - " . $e->getMessage());
        }
    }
    
    /**
     * Track student activity for a lesson
     * @param int $userId Student user ID
     * @param int $lessonId Lesson ID
     * @param int|null $classId Optional class ID
     * @return bool Success status
     */
    public function trackActivity(int $userId, int $lessonId, ?int $classId = null): bool {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO {$this->tableName} (user_id, lesson_id, class_id, last_activity)
                VALUES (?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE last_activity = NOW()
            ");
            return $stmt->execute([$userId, $lessonId, $classId]);
        } catch (PDOException $e) {
            error_log("ActivityTrackingService::trackActivity error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get count of active students for a lesson
     * Active = last activity within the specified minutes
     * @param int $lessonId Lesson ID
     * @param int $activeWindowMinutes Minutes to consider as "active" (default: 5)
     * @return int Active student count
     */
    public function getActiveStudentCount(int $lessonId, int $activeWindowMinutes = 5): int {
        try {
            $stmt = $this->db->prepare("
                SELECT COUNT(DISTINCT at.user_id) as active_count
                FROM {$this->tableName} at
                INNER JOIN users u ON at.user_id = u.id
                WHERE at.lesson_id = ?
                AND UPPER(u.role) = 'STUDENT'
                AND at.last_activity >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
            ");
            $stmt->execute([$lessonId, $activeWindowMinutes]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return (int)($result['active_count'] ?? 0);
        } catch (PDOException $e) {
            error_log("ActivityTrackingService::getActiveStudentCount error: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Get class ID from lesson ID
     * @param int $lessonId Lesson ID
     * @return int|null Class ID or null if not found
     */
    public function getClassIdFromLesson(int $lessonId): ?int {
        try {
            $stmt = $this->db->prepare("SELECT class_id FROM course_lessons WHERE id = ? LIMIT 1");
            $stmt->execute([$lessonId]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row && isset($row['class_id']) ? (int)$row['class_id'] : null;
        } catch (PDOException $e) {
            error_log("ActivityTrackingService::getClassIdFromLesson error: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Clean up old activity records
     * @param int $hoursOld Hours old to consider as "old" (default: 1)
     * @return int Number of records deleted
     */
    public function cleanupOldRecords(int $hoursOld = 1): int {
        try {
            $stmt = $this->db->prepare("
                DELETE FROM {$this->tableName} 
                WHERE last_activity < DATE_SUB(NOW(), INTERVAL ? HOUR)
            ");
            $stmt->execute([$hoursOld]);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("ActivityTrackingService::cleanupOldRecords error: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Get active students for multiple lessons
     * @param array $lessonIds Array of lesson IDs
     * @param int $activeWindowMinutes Minutes to consider as "active" (default: 5)
     * @return array Associative array [lesson_id => count]
     */
    public function getActiveStudentCounts(array $lessonIds, int $activeWindowMinutes = 5): array {
        if (empty($lessonIds)) {
            return [];
        }
        
        try {
            $placeholders = implode(',', array_fill(0, count($lessonIds), '?'));
            $stmt = $this->db->prepare("
                SELECT at.lesson_id, COUNT(DISTINCT at.user_id) as active_count
                FROM {$this->tableName} at
                INNER JOIN users u ON at.user_id = u.id
                WHERE at.lesson_id IN ($placeholders)
                AND UPPER(u.role) = 'STUDENT'
                AND at.last_activity >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
                GROUP BY at.lesson_id
            ");
            
            $params = array_merge($lessonIds, [$activeWindowMinutes]);
            $stmt->execute($params);
            
            $results = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $results[(int)$row['lesson_id']] = (int)$row['active_count'];
            }
            
            return $results;
        } catch (PDOException $e) {
            error_log("ActivityTrackingService::getActiveStudentCounts error: " . $e->getMessage());
            return [];
        }
    }
}
?>

