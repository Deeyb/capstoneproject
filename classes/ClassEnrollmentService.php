<?php
/**
 * Class Enrollment Service - OOP approach for class enrollment operations
 */
class ClassEnrollmentService {
    private $db;
    private $studentId;
    private $studentRole;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    /**
     * Set student information
     */
    public function setStudent($studentId, $studentRole) {
        $this->studentId = $studentId;
        $this->studentRole = $studentRole;
        
        if (strtolower($studentRole) !== 'student') {
            throw new InvalidArgumentException('Only students can enroll in classes');
        }
    }
    
    /**
     * Join a class using class code
     */
    public function joinClass($classCode) {
        // Validate input
        $this->validateClassCode($classCode);
        
        // Find the class
        $class = $this->findClassByCode($classCode);
        
        // Check if already enrolled
        $this->checkExistingEnrollment($class['id']);
        
        // Check class capacity
        $this->checkClassCapacity($class);
        
        // Enroll the student
        $this->enrollStudent($class);
        
        // Return success response
        return $this->formatSuccessResponse($class);
    }
    
    /**
     * Validate class code input
     */
    private function validateClassCode($classCode) {
        if (empty($classCode)) {
            throw new InvalidArgumentException('Class code cannot be empty');
        }
        
        if (strlen($classCode) < 3) {
            throw new InvalidArgumentException('Class code is too short');
        }
    }
    
    /**
     * Find class by code
     */
    private function findClassByCode($classCode) {
        $stmt = $this->db->prepare("
            SELECT c.*, u.firstname, u.lastname, u.middlename 
            FROM classes c 
            LEFT JOIN users u ON c.owner_user_id = u.id 
            WHERE c.code = ? AND c.status = 'active'
        ");
        $stmt->execute([$classCode]);
        $class = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$class) {
            throw new RuntimeException('Class not found or inactive');
        }
        
        return $class;
    }
    
    /**
     * Check if student is already enrolled
     */
    private function checkExistingEnrollment($classId) {
        $stmt = $this->db->prepare("
            SELECT id FROM class_students 
            WHERE class_id = ? AND student_user_id = ?
        ");
        $stmt->execute([$classId, $this->studentId]);
        $existingEnrollment = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existingEnrollment) {
            throw new RuntimeException('You are already enrolled in this class');
        }
    }
    
    /**
     * Check class capacity
     */
    private function checkClassCapacity($class) {
        if (isset($class['max_students']) && $class['max_students'] > 0) {
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as current_count 
                FROM class_students 
                WHERE class_id = ?
            ");
            $stmt->execute([$class['id']]);
            $currentCount = $stmt->fetch(PDO::FETCH_ASSOC)['current_count'];
            
            if ($currentCount >= $class['max_students']) {
                throw new RuntimeException('This class is full');
            }
        }
    }
    
    /**
     * Enroll student in class
     */
    private function enrollStudent($class) {
        // Check if status column exists, if not, use default
        $hasStatus = false;
        try {
            $checkStmt = $this->db->query("SHOW COLUMNS FROM class_students LIKE 'status'");
            $hasStatus = $checkStmt->rowCount() > 0;
        } catch (Exception $e) {
            // Column doesn't exist yet
        }
        
        if ($hasStatus) {
            // CRITICAL: Insert with pending status (requires teacher approval)
            // Explicitly set status to 'pending' - do not rely on DEFAULT
            $stmt = $this->db->prepare("
                INSERT INTO class_students (class_id, student_user_id, status, joined_at) 
                VALUES (?, ?, 'pending', NOW())
            ");
            $result = $stmt->execute([$class['id'], $this->studentId]);
            
            // Verify the status was set correctly
            if ($result) {
                $verifyStmt = $this->db->prepare("
                    SELECT status FROM class_students 
                    WHERE class_id = ? AND student_user_id = ?
                ");
                $verifyStmt->execute([$class['id'], $this->studentId]);
                $enrollment = $verifyStmt->fetch(PDO::FETCH_ASSOC);
                $actualStatus = $enrollment['status'] ?? 'unknown';
                
                if ($actualStatus !== 'pending') {
                    // Force update to pending if somehow it's not pending
                    $fixStmt = $this->db->prepare("
                        UPDATE class_students 
                        SET status = 'pending' 
                        WHERE class_id = ? AND student_user_id = ?
                    ");
                    $fixStmt->execute([$class['id'], $this->studentId]);
                    error_log("WARNING: Student {$this->studentId} status was '{$actualStatus}', forced to 'pending'");
                }
            }
        } else {
            // Fallback for old schema
            $stmt = $this->db->prepare("
                INSERT INTO class_students (class_id, student_user_id, joined_at) 
                VALUES (?, ?, NOW())
            ");
            $result = $stmt->execute([$class['id'], $this->studentId]);
        }
        
        if (!$result) {
            throw new RuntimeException('Failed to enroll in class');
        }
        
        // Log the enrollment
        error_log("Student {$this->studentId} joined class {$class['id']} ({$class['code']}) - Status: pending");
    }
    
    /**
     * Format success response
     */
    private function formatSuccessResponse($class) {
        $teacherName = trim($class['firstname'] . ' ' . $class['lastname']);
        if ($class['middlename']) {
            $middleInitial = strtoupper(substr(trim($class['middlename']), 0, 1)) . '.';
            $teacherName = trim($class['firstname'] . ' ' . $middleInitial . ' ' . $class['lastname']);
        }
        
        return [
            'success' => true,
            'message' => 'Successfully joined the class!',
            'class' => [
                'id' => $class['id'],
                'name' => $class['name'],
                'code' => $class['code'],
                'teacher' => $teacherName,
                'description' => $class['description'] ?? 'No description available'
            ]
        ];
    }
    
    /**
     * Get student's enrolled classes
     */
    public function getStudentClasses() {
        $stmt = $this->db->prepare("
            SELECT 
                c.id,
                c.name as class_name,
                c.code as class_code,
                c.created_at,
                u.firstname as teacher_firstname,
                u.lastname as teacher_lastname,
                u.middlename as teacher_middlename,
                COUNT(DISTINCT CASE WHEN su.id IS NOT NULL AND UPPER(su.status) = 'ACTIVE' THEN cs2.student_user_id END) as student_count
            FROM class_students cs
            JOIN classes c ON cs.class_id = c.id
            LEFT JOIN users u ON c.owner_user_id = u.id
            LEFT JOIN class_students cs2 ON c.id = cs2.class_id
            LEFT JOIN users su ON su.id = cs2.student_user_id
            WHERE cs.student_user_id = ? AND c.status = 'active'
            GROUP BY c.id, c.name, c.code, c.created_at, u.firstname, u.lastname, u.middlename
            ORDER BY c.created_at DESC
        ");
        $stmt->execute([$this->studentId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Check if student is enrolled in a specific class
     */
    public function isEnrolledInClass($classId) {
        $stmt = $this->db->prepare("
            SELECT id FROM class_students 
            WHERE class_id = ? AND student_user_id = ?
        ");
        $stmt->execute([$classId, $this->studentId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
    }
    
    /**
     * Leave a class
     */
    public function leaveClass($classId) {
        $stmt = $this->db->prepare("
            DELETE FROM class_students 
            WHERE class_id = ? AND student_user_id = ?
        ");
        $result = $stmt->execute([$classId, $this->studentId]);
        
        if (!$result) {
            throw new RuntimeException('Failed to leave class');
        }
        
        error_log("Student {$this->studentId} left class {$classId}");
        
        return [
            'success' => true,
            'message' => 'Successfully left the class'
        ];
    }
}
?>

