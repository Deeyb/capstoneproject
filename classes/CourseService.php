<?php

// Load required dependencies
require_once __DIR__ . '/ActivityAttemptService.php';

class CourseService {
    private $db;
    private $attemptService;
    private $scheduleTableExists = null;
    
    // JDoodle language mapping configuration
    private static $jdoodleConfig = [
        'cpp' => [
            'compilerId' => 1,
            // Use a newer JDoodle C++ version index to enable C++11/14 features (range-for, init lists)
            'versionIndex' => 4,
            'timeLimit' => 5000,
            'memoryLimit' => 256
        ],
        'java' => [
            'compilerId' => 3,
            'versionIndex' => 0,
            'timeLimit' => 5000,
            'memoryLimit' => 256
        ],
        'python' => [
            'compilerId' => 4,
            'versionIndex' => 0,
            'timeLimit' => 5000,
            'memoryLimit' => 256
        ]
    ];
    private $jdoodleClientId;
    private $jdoodleClientSecret;

    public function __construct($database) {
        $this->db = $database;
        $this->ensureSchema();
        $this->attemptService = new ActivityAttemptService($database);
        // JDoodle config via env
        $this->jdoodleClientId = getenv('JDOODLE_CLIENT_ID') ?: '';
        $this->jdoodleClientSecret = getenv('JDOODLE_CLIENT_SECRET') ?: '';
    }

    private function scheduleTableExists(): bool {
        if ($this->scheduleTableExists === null) {
            try {
                $stmt = $this->db->query("SHOW TABLES LIKE 'class_activity_schedules'");
                $this->scheduleTableExists = $stmt->rowCount() > 0;
            } catch (Throwable $e) {
                error_log('⚠️ [CourseService] Failed to check class_activity_schedules table: ' . $e->getMessage());
                $this->scheduleTableExists = false;
            }
        }
        return (bool)$this->scheduleTableExists;
    }
    
    /**
     * Get JDoodle configuration for a language
     */
    public static function getJDoodleConfig(string $language): array {
        $lang = strtolower($language);
        return self::$jdoodleConfig[$lang] ?? [
            'compilerId' => 1,
            'versionIndex' => 0,
            'timeLimit' => 5000,
            'memoryLimit' => 256
        ];
    }

    private function ensureSchema() {
        try {
            $this->db->exec("CREATE TABLE IF NOT EXISTS courses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) UNIQUE,
                title VARCHAR(255) NOT NULL,
                description TEXT NULL,
                language VARCHAR(50) NULL,
                cover_url VARCHAR(255) NULL,
                status ENUM('draft','published','archived') DEFAULT 'draft',
                visibility ENUM('assigned','all_teachers') DEFAULT 'assigned',
                owner_user_id INT NULL,
                published_at DATETIME NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                archived TINYINT(1) NOT NULL DEFAULT 0
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            // Ensure archived column exists for legacy installs
            try { $this->db->exec("ALTER TABLE courses ADD COLUMN archived TINYINT(1) NOT NULL DEFAULT 0"); } catch (Throwable $e) {}
            
            
            // Ensure language column exists for legacy installs
            try { $this->db->exec("ALTER TABLE courses ADD COLUMN language VARCHAR(50) NULL"); } catch (Throwable $e) {}

            $this->db->exec("CREATE TABLE IF NOT EXISTS course_modules (
                id INT AUTO_INCREMENT PRIMARY KEY,
                course_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description VARCHAR(500) NULL,
                position INT NOT NULL DEFAULT 1,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            // Ensure description column exists for legacy installs
            try { $this->db->exec("ALTER TABLE course_modules ADD COLUMN description VARCHAR(500) NULL"); } catch (Throwable $e) {}

            $this->db->exec("CREATE TABLE IF NOT EXISTS course_lessons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                module_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                summary TEXT NULL,
                duration_minutes INT NULL,
                position INT NOT NULL DEFAULT 1,
                FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            $this->db->exec("CREATE TABLE IF NOT EXISTS lesson_materials (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lesson_id INT NOT NULL,
                type ENUM('pdf','link','page') NOT NULL,
                url VARCHAR(255) NULL,
                filename VARCHAR(255) NULL,
                size_bytes BIGINT NULL,
                status ENUM('ok','processing','failed') DEFAULT 'ok',
                position INT NOT NULL DEFAULT 1,
                archived TINYINT(1) NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            // Ensure position column exists for legacy installs
            try { $this->db->exec("ALTER TABLE lesson_materials ADD COLUMN position INT NOT NULL DEFAULT 1"); } catch (Throwable $e) {}
            try { $this->db->exec("ALTER TABLE lesson_materials ADD COLUMN archived TINYINT(1) NOT NULL DEFAULT 0"); } catch (Throwable $e) {}
            try { $this->db->exec("ALTER TABLE lesson_materials ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"); } catch (Throwable $e) {}

            // Course teachers mapping
            $this->db->exec("CREATE TABLE IF NOT EXISTS course_teachers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                course_id INT NOT NULL,
                user_id INT NOT NULL,
                UNIQUE KEY uniq_course_user (course_id, user_id),
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            // Lesson activities (supports multiple types)
            $this->db->exec("CREATE TABLE IF NOT EXISTS lesson_activities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lesson_id INT NOT NULL,
                type ENUM('lecture','laboratory','quiz','assignment','coding','multiple_choice','true_false','matching','identification','upload_based') NOT NULL DEFAULT 'lecture',
                title VARCHAR(255) NOT NULL,
                instructions MEDIUMTEXT NULL,
                start_at DATETIME NULL,
                due_at DATETIME NULL,
                max_score INT DEFAULT 100,
                position INT NOT NULL DEFAULT 1,
                FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
            // Ensure new activity types for legacy installs
            try { 
                // Check if upload_based is already in the ENUM
                $result = $this->db->query("SHOW COLUMNS FROM lesson_activities LIKE 'type'")->fetch();
                if ($result && strpos($result['Type'], 'upload_based') === false) {
                    $this->db->exec("ALTER TABLE lesson_activities MODIFY COLUMN type ENUM('lecture','laboratory','quiz','assignment','coding','multiple_choice','true_false','matching','identification','upload_based') NOT NULL DEFAULT 'lecture'");
                }
            } catch (Throwable $e) {}

            // Ensure start_at column exists for activity availability
            try { 
                $this->db->exec("ALTER TABLE lesson_activities ADD COLUMN start_at DATETIME NULL AFTER instructions");
                error_log("[DB_SETUP] Added start_at column to lesson_activities");
            } catch (Throwable $e) {
                // Column might already exist, which is fine
                if (strpos($e->getMessage(), 'Duplicate column') === false) {
                    error_log("[DB_SETUP] Warning checking start_at column: " . $e->getMessage());
                }
            }

            // Ensure required_construct column exists for construct gating in coding activities
            try { 
                $this->db->exec("ALTER TABLE lesson_activities ADD COLUMN required_construct VARCHAR(32) NULL AFTER max_score");
                error_log("[DB_SETUP] Added required_construct column to lesson_activities");
            } catch (Throwable $e) {
                // Column might already exist, which is fine
                if (strpos($e->getMessage(), 'Duplicate column') === false) {
                    error_log("[DB_SETUP] Warning checking required_construct column: " . $e->getMessage());
                }
            }

            // Test cases for coding activities
            $this->db->exec("CREATE TABLE IF NOT EXISTS activity_test_cases (
                id INT AUTO_INCREMENT PRIMARY KEY,
                activity_id INT NOT NULL,
                is_sample TINYINT(1) DEFAULT 0,
                input_text MEDIUMTEXT NULL,
                expected_output_text MEDIUMTEXT NULL,
                time_limit_ms INT DEFAULT 2000,
                points INT DEFAULT 0,
                position INT NOT NULL DEFAULT 1,
                FOREIGN KEY (activity_id) REFERENCES lesson_activities(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            // Add points column to activity_test_cases for legacy installs
            try { $this->db->exec("ALTER TABLE activity_test_cases ADD COLUMN points INT DEFAULT 0"); } catch (Throwable $e) {}

            // MCQ schema (questions and choices)
            $this->db->exec("CREATE TABLE IF NOT EXISTS activity_questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                activity_id INT NOT NULL,
                question_text MEDIUMTEXT NOT NULL,
                explanation MEDIUMTEXT NULL,
                position INT NOT NULL DEFAULT 1,
                points INT NOT NULL DEFAULT 1,
                FOREIGN KEY (activity_id) REFERENCES lesson_activities(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
            // Ensure explanation column exists for legacy installs
            try { $this->db->exec("ALTER TABLE activity_questions ADD COLUMN explanation MEDIUMTEXT NULL AFTER question_text"); } catch (Throwable $e) {}
            $this->db->exec("CREATE TABLE IF NOT EXISTS question_choices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                question_id INT NOT NULL,
                choice_text MEDIUMTEXT NOT NULL,
                is_correct TINYINT(1) NOT NULL DEFAULT 0,
                position INT NOT NULL DEFAULT 1,
                FOREIGN KEY (question_id) REFERENCES activity_questions(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            // Attempts for coding activities (student submissions)
            $this->db->exec("CREATE TABLE IF NOT EXISTS activity_attempts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                activity_id INT NOT NULL,
                student_user_id INT NOT NULL,
                language VARCHAR(32) NOT NULL,
                source_code LONGTEXT NULL,
                verdict ENUM('passed','failed','compile_error','runtime_error') DEFAULT NULL,
                results_json LONGTEXT NULL,
                score DECIMAL(6,2) DEFAULT NULL,
                duration_ms INT DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_attempts_activity (activity_id),
                INDEX idx_attempts_student (student_user_id),
                FOREIGN KEY (activity_id) REFERENCES lesson_activities(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            try {
                $this->db->exec("CREATE TABLE IF NOT EXISTS class_activity_schedules (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    class_id INT NOT NULL,
                    activity_id INT NOT NULL,
                    start_at DATETIME NULL,
                    due_at DATETIME NULL,
                    UNIQUE KEY uniq_class_activity (class_id, activity_id),
                    INDEX idx_activity_id (activity_id),
                    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
                    FOREIGN KEY (activity_id) REFERENCES lesson_activities(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
                $this->scheduleTableExists = true;
            } catch (Throwable $e) {
                error_log('⚠️ Failed to ensure class_activity_schedules table: ' . $e->getMessage());
                $this->scheduleTableExists = false;
            }
        } catch (Throwable $e) {
            // Fail silently in ensure step
        }
    }

    public function listCourses($search = '', $status = '', $owner = '', $archived = false) {
        $sql = "SELECT c.*, 
                (SELECT COUNT(*) FROM course_modules m WHERE m.course_id=c.id) AS modules_count,
                (SELECT COUNT(*) FROM course_lessons l JOIN course_modules m2 ON l.module_id=m2.id WHERE m2.course_id=c.id) AS lessons_count
                FROM courses c WHERE COALESCE(c.archived, 0) = ?";
        $params = [$archived ? 1 : 0];
        if ($search !== '') { $sql .= " AND (c.title LIKE ? OR c.code LIKE ?)"; $term = "%$search%"; $params[]=$term; $params[]=$term; }
        if ($status !== '') { $sql .= " AND c.status = ?"; $params[] = $status; }
        if ($owner !== '') { $sql .= " AND c.owner_user_id = ?"; $params[] = $owner; }
        $sql .= " ORDER BY c.updated_at DESC LIMIT 200";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function setCourseArchived($id, $archived) {
        $stmt = $this->db->prepare("UPDATE courses SET archived = ? WHERE id = ?");
        return $stmt->execute([$archived ? 1 : 0, $id]);
    }

    public function createCourse($data) {
        $visibility = isset($data['visibility']) && in_array($data['visibility'], ['assigned','all_teachers'], true) ? $data['visibility'] : 'assigned';
        $status = isset($data['status']) && in_array($data['status'], ['draft','published'], true) ? $data['status'] : 'draft';
        
        $stmt = $this->db->prepare("INSERT INTO courses (code, title, description, language, cover_url, status, visibility, owner_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $ok = $stmt->execute([
            $data['code'], 
            $data['title'], 
            $data['description'] ?? null, 
            $data['language'] ?? null, 
            $data['cover_url'] ?? null, 
            $status, 
            $visibility, 
            $data['owner_user_id'] ?? null
        ]);
        return $ok ? (int)$this->db->lastInsertId() : 0;
    }
    
    public function createInitialModules($courseId, $modules) {
        if (empty($modules)) return;
        
        $stmt = $this->db->prepare("INSERT INTO course_modules (course_id, title, position) VALUES (?, ?, ?)");
        
        foreach ($modules as $index => $moduleTitle) {
            if (!empty(trim($moduleTitle))) {
                $stmt->execute([
                    $courseId,
                    trim($moduleTitle),
                    $index + 1
                ]);
            }
        }
    }

    public function updateCourse($id, $data) {
        $stmt = $this->db->prepare("UPDATE courses SET code=?, title=?, description=?, language=?, owner_user_id=? WHERE id=?");
        return $stmt->execute([
            $data['code'], $data['title'], $data['description'] ?? null, $data['language'] ?? null, $data['owner_user_id'] ?? null, $id
        ]);
    }

    public function setStatus($id, $status) {
        $status = in_array($status, ['draft','published','archived']) ? $status : 'draft';
        if ($status === 'published') {
            $stmt = $this->db->prepare("UPDATE courses SET status='published', published_at=NOW() WHERE id=?");
            return $stmt->execute([$id]);
        }
        $stmt = $this->db->prepare("UPDATE courses SET status=? WHERE id=?");
        return $stmt->execute([$status, $id]);
    }

    public function deleteCourse($id) {
        $this->db->beginTransaction();
        try {
            // Get all lesson IDs for this course to delete materials
            $lessonIds = [];
            $stmt = $this->db->prepare("
                SELECT l.id FROM course_lessons l 
                JOIN course_modules m ON l.module_id = m.id 
                WHERE m.course_id = ?
            ");
            $stmt->execute([$id]);
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $lessonIds[] = $row['id'];
            }
            
            // Delete materials for all lessons in this course
            if (!empty($lessonIds)) {
                $placeholders = str_repeat('?,', count($lessonIds) - 1) . '?';
                $stmt = $this->db->prepare("DELETE FROM lesson_materials WHERE lesson_id IN ($placeholders)");
                $stmt->execute($lessonIds);
            }
            
            // Delete activities for all lessons in this course
            if (!empty($lessonIds)) {
                $placeholders = str_repeat('?,', count($lessonIds) - 1) . '?';
                $stmt = $this->db->prepare("DELETE FROM lesson_activities WHERE lesson_id IN ($placeholders)");
                $stmt->execute($lessonIds);
            }
            
            // Delete test cases for activities in this course
            if (!empty($lessonIds)) {
                $placeholders = str_repeat('?,', count($lessonIds) - 1) . '?';
                $stmt = $this->db->prepare("
                    DELETE tc FROM activity_test_cases tc 
                    JOIN lesson_activities la ON tc.activity_id = la.id 
                    WHERE la.lesson_id IN ($placeholders)
                ");
                $stmt->execute($lessonIds);
            }
            
            // Delete lessons for all modules in this course
            $stmt = $this->db->prepare("
                DELETE l FROM course_lessons l 
                JOIN course_modules m ON l.module_id = m.id 
                WHERE m.course_id = ?
            ");
            $stmt->execute([$id]);
            
            // Delete modules for this course
            $stmt = $this->db->prepare("DELETE FROM course_modules WHERE course_id = ?");
            $stmt->execute([$id]);
            
            // Finally delete the course itself
            $stmt = $this->db->prepare("DELETE FROM courses WHERE id = ?");
            $stmt->execute([$id]);
            
            $this->db->commit();
            return true;
        } catch (Throwable $e) {
            $this->db->rollBack();
            error_log("Error deleting course: " . $e->getMessage());
            return false;
        }
    }

    // === Outline (Modules & Lessons) ===
    public function getCourse($id) {
        $stmt = $this->db->prepare("SELECT * FROM courses WHERE id=?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function getCourseOutline($courseId) {
        // Fetch modules
        $stmt = $this->db->prepare("SELECT * FROM course_modules WHERE course_id=? ORDER BY position ASC, id ASC");
        $stmt->execute([$courseId]);
        $modules = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (!$modules) return [];
        // Fetch lessons per module
        $lessonStmt = $this->db->prepare("SELECT * FROM course_lessons WHERE module_id=? ORDER BY position ASC, id ASC");
        foreach ($modules as &$m) {
            $lessonStmt->execute([$m['id']]);
            $m['lessons'] = $lessonStmt->fetchAll(PDO::FETCH_ASSOC);
            // Enrich each lesson with activities and materials when requested by caller
        }
        return $modules;
    }

    public function createModule($courseId, $title, $description = '') {
        // Determine next position
        $pos = (int)$this->db->query("SELECT COALESCE(MAX(position),0)+1 FROM course_modules WHERE course_id=" . (int)$courseId)->fetchColumn();
        $stmt = $this->db->prepare("INSERT INTO course_modules (course_id, title, description, position) VALUES (?, ?, ?, ?)");
        $ok = $stmt->execute([$courseId, $title, $description, $pos]);
        return $ok ? (int)$this->db->lastInsertId() : 0;
    }

    public function updateModule($id, $title) {
        $stmt = $this->db->prepare("UPDATE course_modules SET title=? WHERE id=?");
        return $stmt->execute([$title, $id]);
    }

    public function deleteModule($id) {
        $stmt = $this->db->prepare("DELETE FROM course_modules WHERE id=?");
        return $stmt->execute([$id]);
    }

    public function reorderModules($courseId, $orderedIds) {
        $this->db->beginTransaction();
        try {
            $pos = 1;
            $stmt = $this->db->prepare("UPDATE course_modules SET position=? WHERE id=? AND course_id=?");
            foreach ($orderedIds as $mid) {
                $stmt->execute([$pos++, $mid, $courseId]);
            }
            $this->db->commit();
            return true;
        } catch (Throwable $e) {
            $this->db->rollBack();
            return false;
        }
    }

    public function createLesson($moduleId, $title) {
        $pos = (int)$this->db->query("SELECT COALESCE(MAX(position),0)+1 FROM course_lessons WHERE module_id=" . (int)$moduleId)->fetchColumn();
        $stmt = $this->db->prepare("INSERT INTO course_lessons (module_id, title, position) VALUES (?, ?, ?)");
        $ok = $stmt->execute([$moduleId, $title, $pos]);
        return $ok ? (int)$this->db->lastInsertId() : 0;
    }

    public function updateLesson($id, $title) {
        $stmt = $this->db->prepare("UPDATE course_lessons SET title=? WHERE id=?");
        return $stmt->execute([$title, $id]);
    }

    public function deleteLesson($id) {
        $stmt = $this->db->prepare("DELETE FROM course_lessons WHERE id=?");
        return $stmt->execute([$id]);
    }

    public function reorderLessons($moduleId, $orderedIds) {
        $this->db->beginTransaction();
        try {
            $pos = 1;
            $stmt = $this->db->prepare("UPDATE course_lessons SET position=? WHERE id=? AND module_id=?");
            foreach ($orderedIds as $lid) {
                $stmt->execute([$pos++, $lid, $moduleId]);
            }
            $this->db->commit();
            return true;
        } catch (Throwable $e) {
            $this->db->rollBack();
            return false;
        }
    }

    // === Materials ===
    public function listMaterials($lessonId) {
        $stmt = $this->db->prepare("SELECT * FROM lesson_materials WHERE lesson_id=? ORDER BY position ASC, id ASC");
        $stmt->execute([$lessonId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * List materials across lessons/courses with optional filters.
     */
    public function listAllMaterials(array $filters = []) {
        $sql = "SELECT lm.*, l.title AS lesson_title, m.title AS module_title, c.id AS course_id, c.title AS course_title
                FROM lesson_materials lm
                JOIN course_lessons l ON l.id = lm.lesson_id
                JOIN course_modules m ON m.id = l.module_id
                JOIN courses c ON c.id = m.course_id
                WHERE 1=1";
        $params = [];
        if (!empty($filters['search'])) {
            $sql .= " AND (lm.filename LIKE ? OR lm.url LIKE ? OR l.title LIKE ? OR m.title LIKE ? OR c.title LIKE ?)";
            $term = '%' . $filters['search'] . '%';
            array_push($params, $term, $term, $term, $term, $term);
        }
        if (!empty($filters['course_id'])) { $sql .= " AND c.id = ?"; $params[] = (int)$filters['course_id']; }
        if (!empty($filters['module_id'])) { $sql .= " AND m.id = ?"; $params[] = (int)$filters['module_id']; }
        if (!empty($filters['lesson_id'])) { $sql .= " AND l.id = ?"; $params[] = (int)$filters['lesson_id']; }
        if (isset($filters['archived'])) { $sql .= " AND lm.archived = ?"; $params[] = !empty($filters['archived']) ? 1 : 0; }
        if (!empty($filters['type'])) { $sql .= " AND lm.type = ?"; $params[] = $filters['type']; }
        $sql .= " ORDER BY lm.created_at DESC, lm.id DESC LIMIT 500";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    public function setMaterialArchived(int $id, bool $archived): bool {
        $stmt = $this->db->prepare("UPDATE lesson_materials SET archived=? WHERE id=?");
        return $stmt->execute([$archived ? 1 : 0, $id]);
    }

    public function addMaterial($lessonId, $type, $url = null, $filename = null, $size = null) {
        $pos = (int)$this->db->query("SELECT COALESCE(MAX(position),0)+1 FROM lesson_materials WHERE lesson_id=" . (int)$lessonId)->fetchColumn();
        $stmt = $this->db->prepare("INSERT INTO lesson_materials (lesson_id, type, url, filename, size_bytes, status, position) VALUES (?, ?, ?, ?, ?, 'ok', ?)");
        $ok = $stmt->execute([$lessonId, $type, $url, $filename, $size, $pos]);
        return $ok ? (int)$this->db->lastInsertId() : 0;
    }

    public function updateMaterial($id, $data) {
        $stmt = $this->db->prepare("UPDATE lesson_materials SET type=?, url=?, filename=?, size_bytes=? WHERE id=?");
        return $stmt->execute([
            $data['type'] ?? 'link',
            $data['url'] ?? null,
            $data['filename'] ?? null,
            $data['size_bytes'] ?? null,
            $id
        ]);
    }

    public function deleteMaterial($id) {
        $stmt = $this->db->prepare("DELETE FROM lesson_materials WHERE id=?");
        return $stmt->execute([$id]);
    }

    public function reorderMaterials($lessonId, $orderedIds) {
        $this->db->beginTransaction();
        try {
            $pos = 1;
            $stmt = $this->db->prepare("UPDATE lesson_materials SET position=? WHERE id=? AND lesson_id=?");
            foreach ($orderedIds as $mid) {
                $stmt->execute([$pos++, $mid, $lessonId]);
            }
            $this->db->commit();
            return true;
        } catch (Throwable $e) {
            $this->db->rollBack();
            return false;
        }
    }

    // Course teachers feature removed

    // === Upload handling ===
    public function saveUploadedMaterial($lessonId, array $file) {
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            return ['success' => false, 'message' => 'Invalid upload'];
        }
        $maxBytes = 50 * 1024 * 1024; // 50MB
        if (!empty($file['size']) && $file['size'] > $maxBytes) {
            return ['success' => false, 'message' => 'File too large (max 50MB)'];
        }
        $original = $file['name'] ?? 'upload.bin';
        $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
        $allowedExt = [
            'pdf'
        ];
        if (!in_array($ext, $allowedExt, true)) {
            return ['success' => false, 'message' => 'File type not allowed'];
        }
        $baseDir = realpath(__DIR__ . '/..');
        if ($baseDir === false) { $baseDir = dirname(__DIR__); }
        $uploadDir = $baseDir . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'materials';
        if (!is_dir($uploadDir)) { @mkdir($uploadDir, 0755, true); }
        $safeBase = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', pathinfo($original, PATHINFO_FILENAME));
        $unique = date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '_' . $safeBase . '.' . $ext;
        $target = $uploadDir . DIRECTORY_SEPARATOR . $unique;
        if (!@move_uploaded_file($file['tmp_name'], $target)) {
            return ['success' => false, 'message' => 'Failed to store file'];
        }
        // Determine material type
        $type = 'pdf';
        $relativePath = 'material_download.php?f=' . rawurlencode($unique);
        $id = $this->addMaterial($lessonId, $type, $relativePath, $original, (int)($file['size'] ?? 0));
        return $id > 0 ? ['success' => true, 'id' => $id, 'url' => $relativePath] : ['success' => false, 'message' => 'DB save failed'];
    }

    /**
     * Download a remote file by URL and save as a lesson material.
     * Only http/https URLs are allowed. Enforces a max size and an allowlist of extensions/content types.
     */
    public function importMaterialFromUrl(int $lessonId, string $url): array {
        $url = trim($url);
        if ($url === '' || !preg_match('#^https?://#i', $url)) {
            return ['success' => false, 'message' => 'Invalid URL'];
        }
        $maxBytes = 50 * 1024 * 1024; // 50MB
        $allowedExt = [
            'pdf','mp4','m4v','mov','mkv','avi','webm','ogv','3gp','zip','rar','7z','txt','doc','docx','ppt','pptx','xls','xlsx','png','jpg','jpeg','gif','webp','csv','cpp','c','h','hpp','java','py','js','ts','php'
        ];
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 5,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 60,
            CURLOPT_USERAGENT => 'LMS Material Importer',
            CURLOPT_FILE => $tmp = fopen('php://temp', 'w+'),
        ]);
        $ok = curl_exec($ch);
        $http = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $clen = (int)curl_getinfo($ch, CURLINFO_CONTENT_LENGTH_DOWNLOAD);
        $ctype = (string)curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        $err = curl_error($ch);
        curl_close($ch);
        if ($ok === false || $http < 200 || $http >= 300) {
            return ['success' => false, 'message' => 'Download failed: ' . ($err ?: ('HTTP ' . $http))];
        }
        // Check size
        $size = ftell($tmp);
        if ($size <= 0 && $clen > 0) $size = $clen;
        if ($size > $maxBytes) { fclose($tmp); return ['success' => false, 'message' => 'File too large (max 50MB)']; }
        // Determine filename and extension
        $pathPart = parse_url($url, PHP_URL_PATH) ?: '';
        $basename = basename($pathPart) ?: 'downloaded';
        $ext = strtolower(pathinfo($basename, PATHINFO_EXTENSION));
        if ($ext === '' && preg_match('#/(pdf|mp4|m4v|mov|mkv|avi|webm|ogv|3gp|zip|rar|7z|txt|docx?|pptx?|xlsx?|png|jpe?g|gif|webp|csv|cpp|c|h|hpp|java|py|js|ts|php)(?:\b|$)#i', $ctype, $m)) {
            $ext = strtolower($m[1]);
        }
        if ($ext === '') $ext = 'bin';
        if (!in_array($ext, $allowedExt, true)) { fclose($tmp); return ['success' => false, 'message' => 'File type not allowed']; }
        // Persist to uploads/materials
        $baseDir = realpath(__DIR__ . '/..'); if ($baseDir === false) { $baseDir = dirname(__DIR__); }
        $uploadDir = $baseDir . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'materials';
        if (!is_dir($uploadDir)) { @mkdir($uploadDir, 0755, true); }
        $safeBase = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', pathinfo($basename, PATHINFO_FILENAME));
        $unique = date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '_' . $safeBase . '.' . $ext;
        $target = $uploadDir . DIRECTORY_SEPARATOR . $unique;
        rewind($tmp);
        $out = fopen($target, 'w');
        stream_copy_to_stream($tmp, $out);
        fclose($out); fclose($tmp);
        // Determine material type
        $type = 'file';
        if ($ext === 'pdf') $type = 'pdf';
        else if (in_array($ext, ['cpp','c','h','hpp','java','py','js','ts','php'], true)) $type = 'code';
        $relativePath = 'material_download.php?f=' . rawurlencode($unique);
        $id = $this->addMaterial($lessonId, $type, $relativePath, $basename, (int)$size);
        return $id > 0 ? ['success' => true, 'id' => $id, 'url' => $relativePath] : ['success' => false, 'message' => 'DB save failed'];
    }

    // === Activities (Coding) ===
    public function listActivities(int $lessonId, ?int $classId = null): array {
        // Try to use class-specific schedules if classId is provided and table exists
        if ($classId !== null && $this->scheduleTableExists()) {
            try {
                $stmt = $this->db->prepare("
                    SELECT la.*, cas.start_at AS class_start_at, cas.due_at AS class_due_at, cas.class_id AS schedule_class_id
                    FROM lesson_activities la
                    LEFT JOIN class_activity_schedules cas ON cas.activity_id = la.id AND cas.class_id = ?
                    WHERE la.lesson_id=?
                    ORDER BY la.position ASC, la.id ASC
                ");
                $stmt->execute([$classId, $lessonId]);
                $activities = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
                
                // Merge class-specific schedules into activity data
                foreach ($activities as &$act) {
                    if (!empty($act['schedule_class_id'])) {
                        // Class-specific schedule exists, use it
                        $act['original_start_at'] = $act['start_at'] ?? null;
                        $act['original_due_at'] = $act['due_at'] ?? null;
                        $act['start_at'] = $act['class_start_at'];
                        $act['due_at'] = $act['class_due_at'];
                    }
                    unset($act['class_start_at'], $act['class_due_at'], $act['schedule_class_id']);
                }
            } catch (Throwable $e) {
                error_log('⚠️ [listActivities] Error with class schedule, falling back to global: ' . $e->getMessage());
                // Fallback to global schedule
                $stmt = $this->db->prepare("SELECT * FROM lesson_activities WHERE lesson_id=? ORDER BY position ASC, id ASC");
                $stmt->execute([$lessonId]);
                $activities = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
            }
        } else {
            // No classId or table doesn't exist, use global schedule
            $stmt = $this->db->prepare("SELECT * FROM lesson_activities WHERE lesson_id=? ORDER BY position ASC, id ASC");
            $stmt->execute([$lessonId]);
            $activities = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        }
        
        error_log("🔍 [listActivities] Lesson $lessonId" . ($classId ? " (Class: $classId)" : "") . " - Found " . count($activities) . " activities");
        if (!$activities) return [];
        $caseStmt = $this->db->prepare("SELECT * FROM activity_test_cases WHERE activity_id=? ORDER BY position ASC, id ASC");
        $qStmt = $this->db->prepare("SELECT * FROM activity_questions WHERE activity_id=? ORDER BY position ASC, id ASC");
        $cStmt = $this->db->prepare("SELECT * FROM question_choices WHERE question_id=? ORDER BY position ASC, id ASC");
        foreach ($activities as &$a) {
            $caseStmt->execute([$a['id']]);
            $a['test_cases'] = $caseStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
            if (in_array($a['type'], ['multiple_choice','quiz','true_false','identification','essay','upload_based'], true)) {
                $qStmt->execute([$a['id']]);
                $questions = $qStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
                foreach ($questions as &$q) {
                    $cStmt->execute([$q['id']]);
                    $q['choices'] = $cStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
                }
                $a['questions'] = $questions;
            }
        }
        return $activities;
    }

    /**
     * Check if activity is available for students based on start_at and due_at dates
     * Returns: ['available' => bool, 'reason' => string, 'status' => 'locked'|'open'|'closed']
     */
    public function checkActivityAvailability(int $activityId, ?int $classId = null): array {
        $startAtRaw = null;
        $dueAtRaw = null;
        $hasSchedule = false;
        
        // Try to use class-specific schedule if classId is provided and table exists
        if ($classId !== null && $this->scheduleTableExists()) {
            try {
                $scheduleStmt = $this->db->prepare("SELECT start_at, due_at FROM class_activity_schedules WHERE class_id = ? AND activity_id = ? LIMIT 1");
                $scheduleStmt->execute([$classId, $activityId]);
                $schedule = $scheduleStmt->fetch(PDO::FETCH_ASSOC);
                if ($schedule) {
                    $hasSchedule = true;
                    $startAtRaw = $schedule['start_at'] ?? null;
                    $dueAtRaw = $schedule['due_at'] ?? null;
                }
            } catch (Throwable $e) {
                error_log('⚠️ [checkActivityAvailability] Error fetching class schedule, falling back to global: ' . $e->getMessage());
            }
        }
        
        // Fallback to global schedule if no class-specific schedule found
        if (!$hasSchedule) {
            $stmt = $this->db->prepare("SELECT start_at, due_at FROM lesson_activities WHERE id=?");
            $stmt->execute([$activityId]);
            $a = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$a) {
                return ['available' => false, 'reason' => 'Activity not found', 'status' => 'locked'];
            }
            $startAtRaw = $a['start_at'] ?? null;
            $dueAtRaw = $a['due_at'] ?? null;
        }
        
        $now = new DateTime();
        $startAt = $startAtRaw ? new DateTime($startAtRaw) : null;
        $dueAt = $dueAtRaw ? new DateTime($dueAtRaw) : null;
        
        // CRITICAL: If start_at is NULL, activity is LOCKED by default (teacher hasn't opened it yet)
        if (!$startAt) {
            return [
                'available' => false,
                'reason' => 'Activity is locked. Teacher will open it soon.',
                'status' => 'locked'
            ];
        }
        
        // If start_at is set and current time is before start_at, activity is locked
        if ($now < $startAt) {
            return [
                'available' => false,
                'reason' => 'Activity opens on ' . $startAt->format('M d, Y h:i A'),
                'status' => 'locked'
            ];
        }
        
        // CRITICAL: Require both start_at AND due_at to be set before allowing access
        if (!$dueAt) {
            return [
                'available' => false,
                'reason' => 'Activity is not yet configured. Teacher needs to set the end date.',
                'status' => 'locked'
            ];
        }
        
        // If due_at is set and current time is after due_at, activity is closed
        if ($now > $dueAt) {
            return [
                'available' => false,
                'reason' => 'Deadline passed on ' . $dueAt->format('M d, Y h:i A'),
                'status' => 'closed'
            ];
        }
        
        // Activity is open (start_at is set, due_at is set, current time >= start_at, and current time <= due_at)
        return [
            'available' => true,
            'reason' => 'Activity is available',
            'status' => 'open'
        ];
    }

    public function getActivity(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM lesson_activities WHERE id=?");
        $stmt->execute([$id]);
        $a = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$a) return null;
        // CRITICAL: Log all columns to verify required_construct exists
        error_log("[GET_ACTIVITY] Activity $id - All columns: " . implode(', ', array_keys($a)));
        error_log("[GET_ACTIVITY] Activity $id - required_construct: " . var_export($a['required_construct'] ?? 'NULL', true));
        error_log("[GET_ACTIVITY] Activity $id - required_construct type: " . gettype($a['required_construct'] ?? null));
        error_log("[GET_ACTIVITY] Activity $id - required_construct isset: " . (isset($a['required_construct']) ? 'YES' : 'NO'));
        // Attach test cases for coding
        $caseStmt = $this->db->prepare("SELECT * FROM activity_test_cases WHERE activity_id=? ORDER BY position ASC, id ASC");
        $caseStmt->execute([$id]);
        $a['test_cases'] = $caseStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        error_log("[GET_ACTIVITY] Activity $id - test cases count: " . count($a['test_cases']));
        foreach ($a['test_cases'] as $idx => $tc) {
            error_log("[GET_ACTIVITY] TC $idx: points=" . ($tc['points'] ?? 'NULL') . ", is_sample=" . ($tc['is_sample'] ?? 'NULL'));
        }
        // Attach questions/choices for MCQ/quiz/upload_based
        // Handle missing 'type' column gracefully
        $activityType = $a['type'] ?? 'multiple_choice'; // Default to multiple_choice if type column doesn't exist
        if (in_array($activityType, ['multiple_choice','quiz','true_false','identification','essay','upload_based'], true)) {
            $qStmt = $this->db->prepare("SELECT * FROM activity_questions WHERE activity_id=? ORDER BY position ASC, id ASC");
            $cStmt = $this->db->prepare("SELECT * FROM question_choices WHERE question_id=? ORDER BY position ASC, id ASC");
            $qStmt->execute([$id]);
            $questions = $qStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
            foreach ($questions as &$q) {
                $cStmt->execute([$q['id']]);
                $q['choices'] = $cStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
            }
            $a['questions'] = $questions;
        }
        // Ensure 'type' is set even if column doesn't exist
        if (!isset($a['type'])) {
            $a['type'] = 'multiple_choice'; // Default type
        }
        return $a;
    }

    public function createActivity(int $lessonId, string $title, string $instructions = null, string $type = 'lecture', $dueAt = null, int $maxScore = 100, $startAt = null): int {
        $pos = (int)$this->db->query("SELECT COALESCE(MAX(position),0)+1 FROM lesson_activities WHERE lesson_id=" . (int)$lessonId)->fetchColumn();
        $allowedTypes = ['lecture','laboratory','quiz','assignment','coding','multiple_choice','true_false','matching','identification','upload_based','essay'];
        if (!in_array($type, $allowedTypes, true)) { $type = 'lecture'; }
        $stmt = $this->db->prepare("INSERT INTO lesson_activities (lesson_id, type, title, instructions, start_at, due_at, max_score, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $ok = $stmt->execute([$lessonId, $type, $title, $instructions, $startAt, $dueAt, $maxScore, $pos]);
        return $ok ? (int)$this->db->lastInsertId() : 0;
    }

    public function updateActivity(int $id, array $data): bool {
        $allowedTypes = ['lecture','laboratory','quiz','assignment','coding','multiple_choice','true_false','matching','identification','upload_based','essay'];
        $type = $data['type'] ?? 'lecture'; if (!in_array($type, $allowedTypes, true)) { $type = 'lecture'; }
        $requiredConstruct = isset($data['required_construct']) ? (string)$data['required_construct'] : null;
        if ($requiredConstruct === '') $requiredConstruct = null; // Empty string -> null
        error_log("[UPDATE_ACTIVITY] Updating activity $id with required_construct: " . ($requiredConstruct ?: 'NULL'));
        $stmt = $this->db->prepare("UPDATE lesson_activities SET type=?, title=?, instructions=?, start_at=?, due_at=?, max_score=?, required_construct=? WHERE id=?");
        $result = $stmt->execute([
            $type,
            $data['title'] ?? '',
            $data['instructions'] ?? null,
            $data['start_at'] ?? null,
            $data['due_at'] ?? null,
            (int)($data['max_score'] ?? 100),
            $requiredConstruct,
            $id
        ]);
        if ($result) {
            error_log("[UPDATE_ACTIVITY] Successfully updated activity $id");
        } else {
            $errorInfo = $stmt->errorInfo();
            error_log("[UPDATE_ACTIVITY] Failed to update activity $id: " . json_encode($errorInfo));
        }
        return $result;
    }

    // === MCQ helpers ===
    public function addQuestion(int $activityId, string $text, int $points = 1, ?string $explanation = null): int {
        $pos = (int)$this->db->query("SELECT COALESCE(MAX(position),0)+1 FROM activity_questions WHERE activity_id=" . (int)$activityId)->fetchColumn();
        $stmt = $this->db->prepare("INSERT INTO activity_questions (activity_id, question_text, explanation, position, points) VALUES (?, ?, ?, ?, ?)");
        $ok = $stmt->execute([$activityId, $text, $explanation, $pos, max(1,$points)]);
        return $ok ? (int)$this->db->lastInsertId() : 0;
    }
    public function updateQuestion(int $id, array $data): bool {
        $stmt = $this->db->prepare("UPDATE activity_questions SET question_text=?, explanation=?, points=? WHERE id=?");
        return $stmt->execute([$data['question_text'] ?? '', $data['explanation'] ?? null, (int)($data['points'] ?? 1), $id]);
    }
    public function deleteQuestion(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM activity_questions WHERE id=?");
        return $stmt->execute([$id]);
    }
    public function reorderQuestions(int $activityId, array $ids): bool {
        $this->db->beginTransaction();
        try {
            $pos = 1; $stmt = $this->db->prepare("UPDATE activity_questions SET position=? WHERE id=? AND activity_id=?");
            foreach ($ids as $qid) { $stmt->execute([$pos++, $qid, $activityId]); }
            $this->db->commit(); return true;
        } catch (Throwable $e) { $this->db->rollBack(); return false; }
    }
    public function addChoice(int $questionId, string $text, bool $isCorrect = false): int {
        $pos = (int)$this->db->query("SELECT COALESCE(MAX(position),0)+1 FROM question_choices WHERE question_id=" . (int)$questionId)->fetchColumn();
        $stmt = $this->db->prepare("INSERT INTO question_choices (question_id, choice_text, is_correct, position) VALUES (?, ?, ?, ?)");
        $ok = $stmt->execute([$questionId, $text, $isCorrect?1:0, $pos]);
        return $ok ? (int)$this->db->lastInsertId() : 0;
    }
    public function updateChoice(int $id, array $data): bool {
        $stmt = $this->db->prepare("UPDATE question_choices SET choice_text=?, is_correct=? WHERE id=?");
        return $stmt->execute([$data['choice_text'] ?? '', !empty($data['is_correct'])?1:0, $id]);
    }
    public function deleteChoice(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM question_choices WHERE id=?");
        return $stmt->execute([$id]);
    }
    public function reorderChoices(int $questionId, array $ids): bool {
        $this->db->beginTransaction();
        try {
            $pos = 1; $stmt = $this->db->prepare("UPDATE question_choices SET position=? WHERE id=? AND question_id=?");
            foreach ($ids as $cid) { $stmt->execute([$pos++, $cid, $questionId]); }
            $this->db->commit(); return true;
        } catch (Throwable $e) { $this->db->rollBack(); return false; }
    }

    public function deleteActivity(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM lesson_activities WHERE id=?");
        return $stmt->execute([$id]);
    }

    public function reorderActivities(int $lessonId, array $orderedIds): bool {
        $this->db->beginTransaction();
        try {
            $pos = 1; $stmt = $this->db->prepare("UPDATE lesson_activities SET position=? WHERE id=? AND lesson_id=?");
            foreach ($orderedIds as $aid) { $stmt->execute([$pos++, $aid, $lessonId]); }
            $this->db->commit(); return true;
        } catch (Throwable $e) { $this->db->rollBack(); return false; }
    }

    // Test cases
    public function listTestCases(int $activityId): array {
        $stmt = $this->db->prepare("SELECT * FROM activity_test_cases WHERE activity_id=? ORDER BY position ASC, id ASC");
        $stmt->execute([$activityId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    public function addTestCase(int $activityId, bool $isSample, string $inputText = null, string $expectedText = null, int $timeLimitMs = 2000, int $points = 0): int {
        $pos = (int)$this->db->query("SELECT COALESCE(MAX(position),0)+1 FROM activity_test_cases WHERE activity_id=" . (int)$activityId)->fetchColumn();
        error_log("[ADD_TEST_CASE] Adding to activity $activityId: points=$points, is_sample=" . ($isSample ? '1' : '0') . ", input_length=" . strlen($inputText ?? ''));
        $stmt = $this->db->prepare("INSERT INTO activity_test_cases (activity_id, is_sample, input_text, expected_output_text, time_limit_ms, points, position) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $ok = $stmt->execute([$activityId, $isSample ? 1 : 0, $inputText, $expectedText, $timeLimitMs, $points, $pos]);
        if ($ok) {
            $newId = (int)$this->db->lastInsertId();
            error_log("[ADD_TEST_CASE] Successfully added test case ID: $newId");
            return $newId;
        } else {
            $errorInfo = $stmt->errorInfo();
            error_log("[ADD_TEST_CASE] Failed to add test case: " . json_encode($errorInfo));
            return 0;
        }
    }

    public function updateTestCase(int $id, array $data): bool {
        $stmt = $this->db->prepare("UPDATE activity_test_cases SET is_sample=?, input_text=?, expected_output_text=?, time_limit_ms=?, points=? WHERE id=?");
        return $stmt->execute([
            !empty($data['is_sample']) ? 1 : 0,
            $data['input_text'] ?? null,
            $data['expected_output_text'] ?? null,
            (int)($data['time_limit_ms'] ?? 2000),
            (int)($data['points'] ?? 0),
            $id
        ]);
    }

    public function deleteTestCase(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM activity_test_cases WHERE id=?");
        return $stmt->execute([$id]);
    }

    public function reorderTestCases(int $activityId, array $orderedIds): bool {
        $this->db->beginTransaction();
        try {
            $pos = 1; $stmt = $this->db->prepare("UPDATE activity_test_cases SET position=? WHERE id=? AND activity_id=?");
            foreach ($orderedIds as $cid) { $stmt->execute([$pos++, $cid, $activityId]); }
            $this->db->commit(); return true;
        } catch (Throwable $e) { $this->db->rollBack(); return false; }
    }

    // === JDoodle run (generic) ===
    public function runWithJDoodle(string $language, string $sourceCode, array $testCases): array {
        $config = self::getJDoodleConfig($language);
        $results = [];
        foreach ($testCases as $idx => $tc) {
			// Convert escaped sequences (\\n, \\r, \\t) into real characters for stdin
			$stdinRaw = $tc['input_text'] ?? '';
			$stdin = $this->unescapeTestInput($stdinRaw);
            $payload = [
                'clientId' => $this->jdoodleClientId,
                'clientSecret' => $this->jdoodleClientSecret,
                'script' => $sourceCode,
                'language' => $language,
                'versionIndex' => (string)$config['versionIndex'],
				'stdin' => $stdin
            ];
            $res = $this->jdoodleRequest($payload);
            // Normalize shape for frontend
            if (isset($res['data'])) {
                $results[] = $res['data'];
            } else {
                $results[] = $res;
            }
        }
        return $results;
    }

	/**
	 * Replace common escaped sequences with real characters for stdin handling.
	 */
	private function unescapeTestInput(string $text): string {
		// Handle CRLF first to avoid double replacements
		$text = str_replace(["\\r\\n"], ["\r\n"], $text);
		$text = str_replace(["\\n", "\\r", "\\t"], ["\n", "\r", "\t"], $text);
		return $text;
	}

    // Record a coding attempt
    public function recordAttempt(int $activityId, int $studentUserId, string $language, string $sourceCode, array $results, ?string $verdict = null, ?float $score = null, ?int $durationMs = null): int {
        $stmt = $this->db->prepare("INSERT INTO activity_attempts (activity_id, student_user_id, language, source_code, verdict, results_json, score, duration_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?)" );
        $ok = $stmt->execute([
            $activityId,
            $studentUserId,
            strtolower($language),
            $sourceCode,
            $verdict,
            json_encode($results, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),
            $score,
            $durationMs
        ]);
        return $ok ? (int)$this->db->lastInsertId() : 0;
    }

    // List attempts for teacher/coordinator
    public function listAttempts(int $activityId, int $offset = 0, int $limit = 50): array {
        $stmt = $this->db->prepare("SELECT * FROM activity_attempts WHERE activity_id=? ORDER BY id DESC LIMIT ?, ?");
        $stmt->bindValue(1, $activityId, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->bindValue(3, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    // Back-compat for older callers defaulting to C++
    public function runCppWithJDoodle(string $sourceCode, array $testCases): array {
        return $this->runWithJDoodle('cpp', $sourceCode, $testCases);
    }

    private function jdoodleRequest(array $payload): array {
        $url = 'https://api.jdoodle.com/v1/execute';
        
        // Debug logging - CREDIT TRACKING
        error_log(sprintf(
            "JDoodle Request [CREDIT USED]: language=%s, stdin_length=%d, code_length=%d, has_clientId=%s, timestamp=%s, call_stack=%s",
            $payload['language'] ?? 'unknown',
            strlen($payload['stdin'] ?? ''),
            strlen($payload['script'] ?? ''),
            !empty($payload['clientId']) ? 'yes' : 'no',
            date('Y-m-d H:i:s'),
            json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 3))
        ));
        
        $ch = curl_init($url);
        $headers = ['Content-Type: application/json'];
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        
        $response = curl_exec($ch);
        $curlError = curl_error($ch);
            $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
        
        if ($response === false || !empty($curlError)) {
            error_log("JDoodle cURL Error: " . $curlError);
            return ['success'=>false,'status'=>$status,'error'=>'cURL error','message'=>$curlError];
        }
        
        error_log("JDoodle HTTP Status: " . $status);
        error_log("JDoodle Response (first 500 chars): " . substr($response, 0, 500));
        
        $data = json_decode($response, true);
        if ($data === null && trim((string)$response) !== 'null') {
            // Not JSON; include raw for debugging
            error_log("JDoodle Non-JSON Response: " . substr($response, 0, 500));
            return ['success'=>($status>=200 && $status<300), 'status'=>$status, 'raw'=>$response];
        }
        
        if ($status >= 200 && $status < 300) {
            // Log successful response details
            if (isset($data['output'])) {
                error_log("JDoodle Output: " . substr($data['output'], 0, 200));
            }
            if (isset($data['error'])) {
                error_log("JDoodle Error: " . substr($data['error'], 0, 200));
            }
            if (isset($data['statusCode'])) {
                error_log("JDoodle StatusCode: " . $data['statusCode']);
            }
            return ['success'=>true,'data'=>$data];
        }
        
        error_log("JDoodle HTTP Error Response: " . json_encode($data));
        return ['success'=>false,'status'=>$status,'data'=>$data];
    }

    /**
     * Get courses available for teachers (published courses only)
     * @param string $classType Filter by course type (lecture, laboratory, or empty for all)
     * @return array List of published courses with statistics
     */
    public function getPublishedCoursesForTeachers() {
        try {
            $sql = "SELECT c.*,
                        COUNT(DISTINCT m.id) as modules_count,
                        COUNT(DISTINCT l.id) as lessons_count
                    FROM courses c
                    LEFT JOIN course_modules m ON c.id = m.course_id
                    LEFT JOIN course_lessons l ON m.id = l.module_id
                    WHERE c.status = 'published'
                    AND c.archived = 0
                    GROUP BY c.id ORDER BY c.title ASC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute();

            return [
                'success' => true,
                'data' => $stmt->fetchAll(PDO::FETCH_ASSOC),
                'message' => 'Published courses retrieved successfully'
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to fetch published courses: ' . $e->getMessage(),
                'data' => []
            ];
        }
    }

    /**
     * Get course details for teacher (only if published)
     * @param int $courseId Course ID
     * @return array Course details or error
     */
    public function getCourseForTeacher($courseId) {
        try {
            $sql = "SELECT c.*,
                        COUNT(DISTINCT m.id) as modules_count,
                        COUNT(DISTINCT l.id) as lessons_count
                    FROM courses c
                    LEFT JOIN course_modules m ON c.id = m.course_id
                    LEFT JOIN course_lessons l ON m.id = l.module_id
                    WHERE c.id = ?
                    AND c.status = 'published'
                    AND c.archived = 0
                    GROUP BY c.id";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([$courseId]);

            $course = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$course) {
                return [
                    'success' => false,
                    'message' => 'Course not found or not published',
                    'data' => null
                ];
            }

            return [
                'success' => true,
                'data' => $course,
                'message' => 'Course retrieved successfully'
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to fetch course: ' . $e->getMessage(),     
                'data' => null
            ];
        }
    }

    /**
     * Check if course is available for teachers (published)
     * @param int $courseId Course ID
     * @return bool True if course is published and available
     */
    public function isCourseAvailableForTeachers($courseId) {
        try {
            $sql = "SELECT COUNT(*) as count
                    FROM courses
                    WHERE id = ?
                    AND status = 'published'
                    AND archived = 0";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([$courseId]);

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['count'] > 0;

        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Update course status (coordinator/admin only)
     * @param int $courseId Course ID
     * @param string $status New status (draft, published, archived)
     * @param int $userId User ID making the change
     * @return array Success status and message
     */
    public function updateCourseStatus($courseId, $status, $userId) {
        try {
            $validStatuses = ['draft', 'published', 'archived'];
            if (!in_array($status, $validStatuses)) {
                return [
                    'success' => false,
                    'message' => 'Invalid status. Must be one of: ' . implode(', ', $validStatuses)
                ];
            }

            $sql = "UPDATE courses
                    SET status = ?, updated_at = NOW()
                    WHERE id = ? AND archived = 0";

            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([$status, $courseId]);

            if ($result && $stmt->rowCount() > 0) {
                return [
                    'success' => true,
                    'message' => 'Course status updated successfully'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Course not found or no changes made'
                ];
            }

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to update course status: ' . $e->getMessage()
            ];
        }
    }

    public function setActivitySchedule(int $classId, int $activityId, ?string $startAt, ?string $dueAt): bool {
        if (!$this->scheduleTableExists()) {
            // Fallback: update global lesson_activities
            $stmt = $this->db->prepare("UPDATE lesson_activities SET start_at = ?, due_at = ? WHERE id = ?");
            return $stmt->execute([$startAt ?: null, $dueAt ?: null, $activityId]);
        }
        $stmt = $this->db->prepare("INSERT INTO class_activity_schedules (class_id, activity_id, start_at, due_at)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE start_at = VALUES(start_at), due_at = VALUES(due_at)");
        return $stmt->execute([
            $classId,
            $activityId,
            $startAt ?: null,
            $dueAt ?: null
        ]);
    }
    
    public function getActivitySchedule(int $classId, int $activityId): ?array {
        if (!$this->scheduleTableExists()) {
            return null;
        }
        $stmt = $this->db->prepare("SELECT start_at, due_at FROM class_activity_schedules WHERE class_id = ? AND activity_id = ? LIMIT 1");
        $stmt->execute([$classId, $activityId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }
}

?>


