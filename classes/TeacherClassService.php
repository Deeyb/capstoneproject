<?php
/**
 * Teacher Class Service - OOP approach for teacher class operations
 */
class TeacherClassService {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    /**
     * Get class modules
     */
    public function getClassModules($classId, $userId) {
        $this->validateClassId($classId);
        $this->validateUserId($userId);
        
        // Check if user owns the class
        $this->checkClassOwnership($classId, $userId);
        
        $stmt = $this->db->prepare("
            SELECT * FROM class_modules 
            WHERE class_id = ? 
            ORDER BY order_index ASC
        ");
        $stmt->execute([$classId]);
        $modules = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'modules' => $modules
        ];
    }
    
    /**
     * Create class module
     */
    public function createClassModule($classId, $userId, $data) {
        $this->validateClassId($classId);
        $this->validateUserId($userId);
        $this->validateModuleData($data);
        
        // Check if user owns the class
        $this->checkClassOwnership($classId, $userId);
        
        $stmt = $this->db->prepare("
            INSERT INTO class_modules (class_id, title, description, order_index, created_at) 
            VALUES (?, ?, ?, ?, NOW())
        ");
        $result = $stmt->execute([
            $classId,
            $data['title'],
            $data['description'],
            $data['order_index'] ?? 0
        ]);
        
        if (!$result) {
            throw new RuntimeException('Failed to create module');
        }
        
        return [
            'success' => true,
            'message' => 'Module created successfully',
            'module_id' => $this->db->lastInsertId()
        ];
    }
    
    /**
     * Update class module
     */
    public function updateClassModule($moduleId, $userId, $data) {
        $this->validateModuleId($moduleId);
        $this->validateUserId($userId);
        $this->validateModuleData($data);
        
        // Check if user owns the module's class
        $this->checkModuleOwnership($moduleId, $userId);
        
        $stmt = $this->db->prepare("
            UPDATE class_modules 
            SET title = ?, description = ?, order_index = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $result = $stmt->execute([
            $data['title'],
            $data['description'],
            $data['order_index'] ?? 0,
            $moduleId
        ]);
        
        if (!$result) {
            throw new RuntimeException('Failed to update module');
        }
        
        return [
            'success' => true,
            'message' => 'Module updated successfully'
        ];
    }
    
    /**
     * Delete class module
     */
    public function deleteClassModule($moduleId, $userId) {
        $this->validateModuleId($moduleId);
        $this->validateUserId($userId);
        
        // Check if user owns the module's class
        $this->checkModuleOwnership($moduleId, $userId);
        
        $stmt = $this->db->prepare("DELETE FROM class_modules WHERE id = ?");
        $result = $stmt->execute([$moduleId]);
        
        if (!$result) {
            throw new RuntimeException('Failed to delete module');
        }
        
        return [
            'success' => true,
            'message' => 'Module deleted successfully'
        ];
    }
    
    /**
     * Get module lessons
     */
    public function getModuleLessons($moduleId, $userId) {
        $this->validateModuleId($moduleId);
        $this->validateUserId($userId);
        
        // Check if user owns the module's class
        $this->checkModuleOwnership($moduleId, $userId);
        
        $stmt = $this->db->prepare("
            SELECT * FROM class_lessons 
            WHERE module_id = ? 
            ORDER BY order_index ASC
        ");
        $stmt->execute([$moduleId]);
        $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'lessons' => $lessons
        ];
    }
    
    /**
     * Create module lesson
     */
    public function createModuleLesson($moduleId, $userId, $data) {
        $this->validateModuleId($moduleId);
        $this->validateUserId($userId);
        $this->validateLessonData($data);
        
        // Check if user owns the module's class
        $this->checkModuleOwnership($moduleId, $userId);
        
        $stmt = $this->db->prepare("
            INSERT INTO class_lessons (module_id, title, content, order_index, created_at) 
            VALUES (?, ?, ?, ?, NOW())
        ");
        $result = $stmt->execute([
            $moduleId,
            $data['title'],
            $data['content'],
            $data['order_index'] ?? 0
        ]);
        
        if (!$result) {
            throw new RuntimeException('Failed to create lesson');
        }
        
        return [
            'success' => true,
            'message' => 'Lesson created successfully',
            'lesson_id' => $this->db->lastInsertId()
        ];
    }
    
    /**
     * Get lesson topics
     */
    public function getLessonTopics($lessonId, $userId) {
        $this->validateLessonId($lessonId);
        $this->validateUserId($userId);
        
        // Check if user owns the lesson's class
        $this->checkLessonOwnership($lessonId, $userId);
        
        $stmt = $this->db->prepare("
            SELECT * FROM class_topics 
            WHERE lesson_id = ? 
            ORDER BY order_index ASC
        ");
        $stmt->execute([$lessonId]);
        $topics = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'topics' => $topics
        ];
    }
    
    /**
     * Create lesson topic
     */
    public function createLessonTopic($lessonId, $userId, $data) {
        $this->validateLessonId($lessonId);
        $this->validateUserId($userId);
        $this->validateTopicData($data);
        
        // Check if user owns the lesson's class
        $this->checkLessonOwnership($lessonId, $userId);
        
        $stmt = $this->db->prepare("
            INSERT INTO class_topics (lesson_id, title, content, order_index, created_at) 
            VALUES (?, ?, ?, ?, NOW())
        ");
        $result = $stmt->execute([
            $lessonId,
            $data['title'],
            $data['content'],
            $data['order_index'] ?? 0
        ]);
        
        if (!$result) {
            throw new RuntimeException('Failed to create topic');
        }
        
        return [
            'success' => true,
            'message' => 'Topic created successfully',
            'topic_id' => $this->db->lastInsertId()
        ];
    }
    
    /**
     * Get topic materials
     */
    public function getTopicMaterials($topicId, $userId) {
        $this->validateTopicId($topicId);
        $this->validateUserId($userId);
        
        // Check if user owns the topic's class
        $this->checkTopicOwnership($topicId, $userId);
        
        $stmt = $this->db->prepare("
            SELECT * FROM class_materials 
            WHERE topic_id = ? 
            ORDER BY created_at ASC
        ");
        $stmt->execute([$topicId]);
        $materials = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'materials' => $materials
        ];
    }
    
    /**
     * Create topic material
     */
    public function createTopicMaterial($topicId, $userId, $data) {
        $this->validateTopicId($topicId);
        $this->validateUserId($userId);
        $this->validateMaterialData($data);
        
        // Check if user owns the topic's class
        $this->checkTopicOwnership($topicId, $userId);
        
        $stmt = $this->db->prepare("
            INSERT INTO class_materials (topic_id, title, description, file_path, material_type, created_at) 
            VALUES (?, ?, ?, ?, ?, NOW())
        ");
        $result = $stmt->execute([
            $topicId,
            $data['title'],
            $data['description'],
            $data['file_path'],
            $data['material_type']
        ]);
        
        if (!$result) {
            throw new RuntimeException('Failed to create material');
        }
        
        return [
            'success' => true,
            'message' => 'Material created successfully',
            'material_id' => $this->db->lastInsertId()
        ];
    }
    
    /**
     * Check class ownership
     */
    private function checkClassOwnership($classId, $userId) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM classes 
            WHERE id = ? AND owner_user_id = ?
        ");
        $stmt->execute([$classId, $userId]);
        
        if ($stmt->fetchColumn() == 0) {
            throw new RuntimeException('You do not own this class');
        }
    }
    
    /**
     * Check module ownership
     */
    private function checkModuleOwnership($moduleId, $userId) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM class_modules cm
            JOIN classes c ON cm.class_id = c.id
            WHERE cm.id = ? AND c.owner_user_id = ?
        ");
        $stmt->execute([$moduleId, $userId]);
        
        if ($stmt->fetchColumn() == 0) {
            throw new RuntimeException('You do not own this module');
        }
    }
    
    /**
     * Check lesson ownership
     */
    private function checkLessonOwnership($lessonId, $userId) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM class_lessons cl
            JOIN class_modules cm ON cl.module_id = cm.id
            JOIN classes c ON cm.class_id = c.id
            WHERE cl.id = ? AND c.owner_user_id = ?
        ");
        $stmt->execute([$lessonId, $userId]);
        
        if ($stmt->fetchColumn() == 0) {
            throw new RuntimeException('You do not own this lesson');
        }
    }
    
    /**
     * Check topic ownership
     */
    private function checkTopicOwnership($topicId, $userId) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM class_topics ct
            JOIN class_lessons cl ON ct.lesson_id = cl.id
            JOIN class_modules cm ON cl.module_id = cm.id
            JOIN classes c ON cm.class_id = c.id
            WHERE ct.id = ? AND c.owner_user_id = ?
        ");
        $stmt->execute([$topicId, $userId]);
        
        if ($stmt->fetchColumn() == 0) {
            throw new RuntimeException('You do not own this topic');
        }
    }
    
    /**
     * Validate class ID
     */
    private function validateClassId($classId) {
        if (!is_numeric($classId) || $classId <= 0) {
            throw new InvalidArgumentException('Invalid class ID');
        }
    }
    
    /**
     * Validate user ID
     */
    private function validateUserId($userId) {
        if (!is_numeric($userId) || $userId <= 0) {
            throw new InvalidArgumentException('Invalid user ID');
        }
    }
    
    /**
     * Validate module ID
     */
    private function validateModuleId($moduleId) {
        if (!is_numeric($moduleId) || $moduleId <= 0) {
            throw new InvalidArgumentException('Invalid module ID');
        }
    }
    
    /**
     * Validate lesson ID
     */
    private function validateLessonId($lessonId) {
        if (!is_numeric($lessonId) || $lessonId <= 0) {
            throw new InvalidArgumentException('Invalid lesson ID');
        }
    }
    
    /**
     * Validate topic ID
     */
    private function validateTopicId($topicId) {
        if (!is_numeric($topicId) || $topicId <= 0) {
            throw new InvalidArgumentException('Invalid topic ID');
        }
    }
    
    /**
     * Validate module data
     */
    private function validateModuleData($data) {
        if (empty($data['title'])) {
            throw new InvalidArgumentException('Module title is required');
        }
    }
    
    /**
     * Validate lesson data
     */
    private function validateLessonData($data) {
        if (empty($data['title'])) {
            throw new InvalidArgumentException('Lesson title is required');
        }
    }
    
    /**
     * Validate topic data
     */
    private function validateTopicData($data) {
        if (empty($data['title'])) {
            throw new InvalidArgumentException('Topic title is required');
        }
    }
    
    /**
     * Validate material data
     */
    private function validateMaterialData($data) {
        if (empty($data['title'])) {
            throw new InvalidArgumentException('Material title is required');
        }
        if (empty($data['file_path'])) {
            throw new InvalidArgumentException('File path is required');
        }
    }
}
?>

