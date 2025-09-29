<?php

class CoordinatorService {
    private $db;
    private $conn;
    private $usersTable = 'users';

    public function __construct($db) {
        $this->db = $db;
        $this->conn = $db;
    }

    /**
     * Check if a table exists in the current database
     */
    private function tableExists($tableName) {
        try {
            $stmt = $this->conn->prepare("SHOW TABLES LIKE ?");
            $stmt->execute([$tableName]);
            return $stmt->rowCount() > 0;
        } catch (Throwable $e) {
            return false;
        }
    }

    /**
     * Get counts relevant for a coordinator dashboard
     */
    public function getCoordinatorCounts() {
        // Frontend expects snake_case keys
        $counts = [
            'total_students' => 0,
            'total_teachers' => 0,
            'active_courses' => 0,
            'draft_courses' => 0,
            'materials_uploaded' => 0,
        ];

        try {
            // Students
            $stmt = $this->conn->prepare("SELECT COUNT(*) AS total FROM {$this->usersTable} WHERE UPPER(role) = 'STUDENT'");
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $counts['total_students'] = (int)($row['total'] ?? 0);

            // Teachers
            $stmt = $this->conn->prepare("SELECT COUNT(*) AS total FROM {$this->usersTable} WHERE UPPER(role) = 'TEACHER'");
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $counts['total_teachers'] = (int)($row['total'] ?? 0);

            // Courses (optional table)
            if ($this->tableExists('courses')) {
                // Determine if archived column exists for filtering
                $hasArchived = false;
                try {
                    $chk = $this->conn->query("SHOW COLUMNS FROM courses LIKE 'archived'");
                    $hasArchived = $chk && $chk->rowCount() > 0;
                } catch (Throwable $e) { /* ignore */ }

                $archivedClause = $hasArchived ? " AND (archived = 0 OR archived IS NULL)" : '';

                // Active (published) courses
                $stmt = $this->conn->prepare("SELECT COUNT(*) AS total FROM courses WHERE status = 'published'" . $archivedClause);
                $stmt->execute();
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                $counts['active_courses'] = (int)($row['total'] ?? 0);

                // Draft courses
                $stmt = $this->conn->prepare("SELECT COUNT(*) AS total FROM courses WHERE status = 'draft'" . $archivedClause);
                $stmt->execute();
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                $counts['draft_courses'] = (int)($row['total'] ?? 0);
            }

            // Materials/Uploads (optional tables: materials or uploads)
            if ($this->tableExists('materials')) {
                $stmt = $this->conn->prepare("SELECT COUNT(*) AS total FROM materials");
                $stmt->execute();
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                $counts['materials_uploaded'] = (int)($row['total'] ?? 0);
            } elseif ($this->tableExists('uploads')) {
                $stmt = $this->conn->prepare("SELECT COUNT(*) AS total FROM uploads");
                $stmt->execute();
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                $counts['materials_uploaded'] = (int)($row['total'] ?? 0);
            }
        } catch (Throwable $e) {
            // Fail gracefully with defaults
        }

        return $counts;
    }

    /**
     * Recent registrations for specific roles
     */
    public function getRecentRegistrationsByRoles(array $roles, $limit = 10) {
        if (empty($roles)) return [];
        $placeholders = implode(',', array_fill(0, count($roles), '?'));
        $params = array_map(function($r) { return strtoupper($r); }, $roles);
        $limit = max(1, (int)$limit);

        try {
            $sql = "SELECT firstname, middlename, lastname, role, created_at
                    FROM {$this->usersTable}
                    WHERE UPPER(role) IN ($placeholders)
                    ORDER BY created_at DESC
                    LIMIT $limit";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Throwable $e) {
            return [];
        }
    }

    /**
     * Recent logins for specific roles
     */
    public function getRecentLoginsByRoles(array $roles, $limit = 10) {
        if (empty($roles)) return [];
        $placeholders = implode(',', array_fill(0, count($roles), '?'));
        $params = array_map(function($r) { return strtoupper($r); }, $roles);
        $limit = max(1, (int)$limit);

        try {
            $sql = "SELECT firstname, middlename, lastname, role, last_login
                    FROM {$this->usersTable}
                    WHERE last_login IS NOT NULL
                      AND UPPER(role) IN ($placeholders)
                    ORDER BY last_login DESC
                    LIMIT $limit";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Throwable $e) {
            return [];
        }
    }
}

?>


