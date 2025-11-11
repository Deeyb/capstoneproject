<?php

class ClassService {
    private $db;

    public function __construct($db) {
        $this->db = $db;
        $this->ensureSchema();
    }

    private function ensureSchema() {
        try {
            $this->db->exec("CREATE TABLE IF NOT EXISTS classes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(20) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                course_id INT NULL,
                owner_user_id INT NOT NULL,
                status ENUM('active','archived') DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");


            $this->db->exec("CREATE TABLE IF NOT EXISTS class_students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                class_id INT NOT NULL,
                student_user_id INT NOT NULL,
                joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uniq_class_student (class_id, student_user_id),
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        } catch (Throwable $e) {
            // silent
        }
    }

    public function generateUniqueCode(int $length = 7, int $maxAttempts = 10): string {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I,O,0,1
        for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
            $code = 'CR-' . $this->randomString($length, $alphabet);
            if (!$this->codeExists($code)) {
                return $code;
            }
        }
        // fallback with timestamp suffix
        $fallback = 'CR-' . $this->randomString($length - 2, $alphabet) . substr((string)time(), -2);
        return $fallback;
    }

    private function randomString(int $length, string $alphabet): string {
        $result = '';
        $max = strlen($alphabet) - 1;
        for ($i = 0; $i < $length; $i++) {
            $idx = random_int(0, $max);
            $result .= $alphabet[$idx];
        }
        return $result;
    }

    private function codeExists(string $code): bool {
        $stmt = $this->db->prepare("SELECT id FROM classes WHERE code = ? LIMIT 1");
        $stmt->execute([$code]);
        return (bool)$stmt->fetchColumn();
    }

    public function createClass(int $ownerUserId, string $name, ?int $courseId, ?string $providedCode = null): array {
        $name = trim($name);
        if ($name === '') {
            return ['success' => false, 'message' => 'Class name is required'];
        }

        $code = $providedCode ? strtoupper(trim($providedCode)) : $this->generateUniqueCode();
        // Validate custom code format if provided
        if ($providedCode) {
            if (!preg_match('/^CR\-[A-Z0-9]{5,10}$/', $code)) {
                return ['success' => false, 'message' => 'Invalid code format. Use CR- followed by 5-10 A-Z/0-9'];
            }
            if ($this->codeExists($code)) {
                return ['success' => false, 'message' => 'Code already in use'];
            }
        } else {
            // Ensure uniqueness for auto-generated code (final check)
            $tries = 0;
            while ($this->codeExists($code) && $tries < 5) {
                $code = $this->generateUniqueCode();
                $tries++;
            }
        }

        $stmt = $this->db->prepare("INSERT INTO classes (code, name, course_id, owner_user_id) VALUES (?, ?, ?, ?)");
        $ok = $stmt->execute([$code, $name, $courseId, $ownerUserId]);
        if (!$ok) {
            return ['success' => false, 'message' => 'Failed to create class'];
        }
        $id = (int)$this->db->lastInsertId();
        return ['success' => true, 'id' => $id, 'code' => $code, 'name' => $name];
    }

    public function listTeacherClasses(int $ownerUserId): array {
        $stmt = $this->db->prepare("SELECT * FROM classes WHERE owner_user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 200");
        $stmt->execute([$ownerUserId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    public function getClassesByOwner(int $ownerUserId): array {
        // Get classes with student count and module count
        $stmt = $this->db->prepare("
            SELECT 
                c.*,
                /* Count only enrolled users that still exist and are Active */
                COUNT(DISTINCT CASE WHEN u.id IS NOT NULL AND UPPER(u.status) = 'ACTIVE' THEN cs.student_user_id END) AS student_count,
                COUNT(DISTINCT cm.id) as modules_count
            FROM classes c
            LEFT JOIN class_students cs ON c.id = cs.class_id
            LEFT JOIN users u ON u.id = cs.student_user_id
            LEFT JOIN courses co ON c.course_id = co.id
            LEFT JOIN course_modules cm ON co.id = cm.course_id
            WHERE c.owner_user_id = ? AND c.status = 'active'
            GROUP BY c.id
            ORDER BY c.created_at DESC
            LIMIT 200
        ");
        $stmt->execute([$ownerUserId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    public function listArchivedClasses(int $ownerUserId): array {
        $stmt = $this->db->prepare("SELECT * FROM classes WHERE owner_user_id = ? AND status = 'archived' ORDER BY updated_at DESC LIMIT 200");
        $stmt->execute([$ownerUserId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    public function getClassById(int $classId): ?array {
        $stmt = $this->db->prepare("SELECT c.*, CONCAT(u.firstname, ' ', u.lastname) AS teacher_name
                                     FROM classes c
                                     LEFT JOIN users u ON u.id = c.owner_user_id
                                     WHERE c.id = ? LIMIT 1");
        $stmt->execute([$classId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function getClassOverview(int $classId): array {
        // Placeholder values; replace with real computations when lesson/activity data available
        $lessonsTotal = 12;
        $lessonsCompleted = 0;
        $progress = $lessonsTotal > 0 ? (int)round(($lessonsCompleted / $lessonsTotal) * 100) : 0;
        return [
            'progress_percent' => $progress,
            'lessons_total' => $lessonsTotal,
            'lessons_completed' => $lessonsCompleted,
            'upcoming' => null,
            'recent' => []
        ];
    }

    public function listLessonsForClass(int $classId): array {
        // If a lessons mapping exists, join by course_id; for now, return placeholder list
        $stmt = $this->db->prepare("SELECT c.course_id FROM classes c WHERE c.id = ?");
        $stmt->execute([$classId]);
        $courseId = (int)($stmt->fetchColumn() ?: 0);
        if ($courseId <= 0) {
            return [];
        }

        // Attempt to read from course_lessons if exists
        try {
            $q = $this->db->prepare("SELECT l.id, l.title, l.summary, l.duration_minutes
                                     FROM course_lessons l
                                     JOIN course_modules m ON m.id = l.module_id
                                     WHERE m.course_id = ?
                                     ORDER BY l.position ASC, l.id ASC LIMIT 200");
            $q->execute([$courseId]);
            $rows = $q->fetchAll(PDO::FETCH_ASSOC) ?: [];
            return $rows;
        } catch (Throwable $e) {
            // Fallback placeholder
            return [
                ['id' => 1, 'title' => 'Introduction', 'created_at' => date('Y-m-d')],
                ['id' => 2, 'title' => 'Fundamentals', 'created_at' => date('Y-m-d')],
            ];
        }
    }

    public function deleteClass(int $classId, int $ownerUserId): bool {
        // soft delete via status if available, else hard delete
        try {
            $stmt = $this->db->prepare("DELETE FROM classes WHERE id = ? AND owner_user_id = ? LIMIT 1");
            return $stmt->execute([$classId, $ownerUserId]);
        } catch (Throwable $e) {
            return false;
        }
    }

    public function archiveClass(int $classId, int $ownerUserId): bool {
        try {
            $stmt = $this->db->prepare("UPDATE classes SET status='archived', updated_at=CURRENT_TIMESTAMP WHERE id=? AND owner_user_id=? LIMIT 1");
            $stmt->execute([$classId, $ownerUserId]);
            return $stmt->rowCount() > 0;
        } catch (Throwable $e) { return false; }
    }

    public function unarchiveClass(int $classId, int $ownerUserId): bool {
        try {
            $stmt = $this->db->prepare("UPDATE classes SET status='active', updated_at=CURRENT_TIMESTAMP WHERE id=? AND owner_user_id=? LIMIT 1");
            $stmt->execute([$classId, $ownerUserId]);
            return $stmt->rowCount() > 0;
        } catch (Throwable $e) { return false; }
    }
}



