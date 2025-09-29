<?php

class CourseService {
    private $db;
    private $jdoodleClientId;
    private $jdoodleClientSecret;

    public function __construct($db) {
        $this->db = $db;
        $this->ensureSchema();
        // JDoodle config via env
        $this->jdoodleClientId = getenv('JDOODLE_CLIENT_ID') ?: '';
        $this->jdoodleClientSecret = getenv('JDOODLE_CLIENT_SECRET') ?: '';
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
                type ENUM('pdf','video','link','code','file') NOT NULL,
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
                type ENUM('lecture','laboratory','quiz','assignment','coding','multiple_choice','true_false','matching','identification') NOT NULL DEFAULT 'lecture',
                title VARCHAR(255) NOT NULL,
                instructions MEDIUMTEXT NULL,
                due_at DATETIME NULL,
                max_score INT DEFAULT 100,
                position INT NOT NULL DEFAULT 1,
                FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
            // Ensure new activity types for legacy installs
            try { $this->db->exec("ALTER TABLE lesson_activities MODIFY COLUMN type ENUM('lecture','laboratory','quiz','assignment','coding','multiple_choice','true_false','matching','identification') NOT NULL DEFAULT 'lecture'"); } catch (Throwable $e) {}

            // Test cases for coding activities
            $this->db->exec("CREATE TABLE IF NOT EXISTS activity_test_cases (
                id INT AUTO_INCREMENT PRIMARY KEY,
                activity_id INT NOT NULL,
                is_sample TINYINT(1) DEFAULT 0,
                input_text MEDIUMTEXT NULL,
                expected_output_text MEDIUMTEXT NULL,
                time_limit_ms INT DEFAULT 2000,
                position INT NOT NULL DEFAULT 1,
                FOREIGN KEY (activity_id) REFERENCES lesson_activities(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            // MCQ schema (questions and choices)
            $this->db->exec("CREATE TABLE IF NOT EXISTS activity_questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                activity_id INT NOT NULL,
                question_text MEDIUMTEXT NOT NULL,
                position INT NOT NULL DEFAULT 1,
                points INT NOT NULL DEFAULT 1,
                FOREIGN KEY (activity_id) REFERENCES lesson_activities(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
            $this->db->exec("CREATE TABLE IF NOT EXISTS question_choices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                question_id INT NOT NULL,
                choice_text MEDIUMTEXT NOT NULL,
                is_correct TINYINT(1) NOT NULL DEFAULT 0,
                position INT NOT NULL DEFAULT 1,
                FOREIGN KEY (question_id) REFERENCES activity_questions(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        } catch (Throwable $e) {
            // Fail silently in ensure step
        }
    }

    public function listCourses($search = '', $status = '', $owner = '', $archived = false) {
        $sql = "SELECT c.*, 
                (SELECT COUNT(*) FROM course_modules m WHERE m.course_id=c.id) AS modules_count,
                (SELECT COUNT(*) FROM course_lessons l JOIN course_modules m2 ON l.module_id=m2.id WHERE m2.course_id=c.id) AS lessons_count
                FROM courses c WHERE c.archived = ?";
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
            'pdf','mp4','mov','mkv','avi','zip','rar','7z','txt','doc','docx','ppt','pptx','xls','xlsx','png','jpg','jpeg','gif','webp','csv','cpp','c','h','hpp','java','py'
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
        $type = 'file';
        if ($ext === 'pdf') $type = 'pdf';
        else if (in_array($ext, ['mp4','mov','mkv','avi'], true)) $type = 'video';
        else if (in_array($ext, ['cpp','c','h','hpp','java','py'], true)) $type = 'code';
        $relativePath = 'material_download.php?f=' . rawurlencode($unique);
        $id = $this->addMaterial($lessonId, $type, $relativePath, $original, (int)($file['size'] ?? 0));
        return $id > 0 ? ['success' => true, 'id' => $id, 'url' => $relativePath] : ['success' => false, 'message' => 'DB save failed'];
    }

    // === Activities (Coding) ===
    public function listActivities(int $lessonId): array {
        $stmt = $this->db->prepare("SELECT * FROM lesson_activities WHERE lesson_id=? ORDER BY position ASC, id ASC");
        $stmt->execute([$lessonId]);
        $activities = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        if (!$activities) return [];
        $caseStmt = $this->db->prepare("SELECT * FROM activity_test_cases WHERE activity_id=? ORDER BY position ASC, id ASC");
        $qStmt = $this->db->prepare("SELECT * FROM activity_questions WHERE activity_id=? ORDER BY position ASC, id ASC");
        $cStmt = $this->db->prepare("SELECT * FROM question_choices WHERE question_id=? ORDER BY position ASC, id ASC");
        foreach ($activities as &$a) {
            $caseStmt->execute([$a['id']]);
            $a['test_cases'] = $caseStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
            if (in_array($a['type'], ['multiple_choice','quiz'], true)) {
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

    public function getActivity(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM lesson_activities WHERE id=?");
        $stmt->execute([$id]);
        $a = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$a) return null;
        // Attach test cases for coding
        $caseStmt = $this->db->prepare("SELECT * FROM activity_test_cases WHERE activity_id=? ORDER BY position ASC, id ASC");
        $caseStmt->execute([$id]);
        $a['test_cases'] = $caseStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        // Attach questions/choices for MCQ/quiz
        if (in_array($a['type'], ['multiple_choice','quiz'], true)) {
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
        return $a;
    }

    public function createActivity(int $lessonId, string $title, string $instructions = null, string $type = 'lecture', $dueAt = null, int $maxScore = 100): int {
        $pos = (int)$this->db->query("SELECT COALESCE(MAX(position),0)+1 FROM lesson_activities WHERE lesson_id=" . (int)$lessonId)->fetchColumn();
        $allowedTypes = ['lecture','laboratory','quiz','assignment','coding','multiple_choice','true_false','matching','identification'];
        if (!in_array($type, $allowedTypes, true)) { $type = 'lecture'; }
        $stmt = $this->db->prepare("INSERT INTO lesson_activities (lesson_id, type, title, instructions, due_at, max_score, position) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $ok = $stmt->execute([$lessonId, $type, $title, $instructions, $dueAt, $maxScore, $pos]);
        return $ok ? (int)$this->db->lastInsertId() : 0;
    }

    public function updateActivity(int $id, array $data): bool {
        $allowedTypes = ['lecture','laboratory','quiz','assignment','coding','multiple_choice','true_false','matching','identification'];
        $type = $data['type'] ?? 'lecture'; if (!in_array($type, $allowedTypes, true)) { $type = 'lecture'; }
        $stmt = $this->db->prepare("UPDATE lesson_activities SET type=?, title=?, instructions=?, due_at=?, max_score=? WHERE id=?");
        return $stmt->execute([
            $type,
            $data['title'] ?? '',
            $data['instructions'] ?? null,
            $data['due_at'] ?? null,
            (int)($data['max_score'] ?? 100),
            $id
        ]);
    }

    // === MCQ helpers ===
    public function addQuestion(int $activityId, string $text, int $points = 1): int {
        $pos = (int)$this->db->query("SELECT COALESCE(MAX(position),0)+1 FROM activity_questions WHERE activity_id=" . (int)$activityId)->fetchColumn();
        $stmt = $this->db->prepare("INSERT INTO activity_questions (activity_id, question_text, position, points) VALUES (?, ?, ?, ?)");
        $ok = $stmt->execute([$activityId, $text, $pos, max(1,$points)]);
        return $ok ? (int)$this->db->lastInsertId() : 0;
    }
    public function updateQuestion(int $id, array $data): bool {
        $stmt = $this->db->prepare("UPDATE activity_questions SET question_text=?, points=? WHERE id=?");
        return $stmt->execute([$data['question_text'] ?? '', (int)($data['points'] ?? 1), $id]);
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

    public function addTestCase(int $activityId, bool $isSample, string $inputText = null, string $expectedText = null, int $timeLimitMs = 2000): int {
        $pos = (int)$this->db->query("SELECT COALESCE(MAX(position),0)+1 FROM activity_test_cases WHERE activity_id=" . (int)$activityId)->fetchColumn();
        $stmt = $this->db->prepare("INSERT INTO activity_test_cases (activity_id, is_sample, input_text, expected_output_text, time_limit_ms, position) VALUES (?, ?, ?, ?, ?, ?)");
        $ok = $stmt->execute([$activityId, $isSample ? 1 : 0, $inputText, $expectedText, $timeLimitMs, $pos]);
        return $ok ? (int)$this->db->lastInsertId() : 0;
    }

    public function updateTestCase(int $id, array $data): bool {
        $stmt = $this->db->prepare("UPDATE activity_test_cases SET is_sample=?, input_text=?, expected_output_text=?, time_limit_ms=? WHERE id=?");
        return $stmt->execute([
            !empty($data['is_sample']) ? 1 : 0,
            $data['input_text'] ?? null,
            $data['expected_output_text'] ?? null,
            (int)($data['time_limit_ms'] ?? 2000),
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
        $results = [];
        foreach ($testCases as $idx => $tc) {
            $payload = [
                'clientId' => $this->jdoodleClientId,
                'clientSecret' => $this->jdoodleClientSecret,
                'script' => $sourceCode,
                'language' => $language,
                'versionIndex' => '0',
                'stdin' => $tc['input_text'] ?? ''
            ];
            $res = $this->jdoodleRequest($payload);
            $results[] = $res;
        }
        return $results;
    }

    // Back-compat for older callers defaulting to C++
    public function runCppWithJDoodle(string $sourceCode, array $testCases): array {
        return $this->runWithJDoodle('cpp', $sourceCode, $testCases);
    }

    private function jdoodleRequest(array $payload): array {
        $url = 'https://api.jdoodle.com/v1/execute';
        $ch = curl_init($url);
        $headers = ['Content-Type: application/json'];
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        $response = curl_exec($ch);
        if ($response === false) {
            $err = curl_error($ch);
            $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            return ['success'=>false,'status'=>$status,'error'=>'cURL error','message'=>$err];
        }
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $data = json_decode($response, true);
        if ($data === null && trim((string)$response) !== 'null') {
            // Not JSON; include raw for debugging
            return ['success'=>($status>=200 && $status<300), 'status'=>$status, 'raw'=>$response];
        }
        if ($status >= 200 && $status < 300) {
            return ['success'=>true,'data'=>$data];
        }
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
}

?>


