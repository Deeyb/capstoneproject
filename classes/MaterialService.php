<?php
/**
 * Material Service - OOP approach for material operations
 */
class MaterialService {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    /**
     * Download material file
     */
    public function downloadMaterial($materialId, $userId) {
        $this->validateMaterialId($materialId);
        $this->validateUserId($userId);
        
        // Get material details
        $material = $this->getMaterialById($materialId);
        if (!$material) {
            throw new RuntimeException('Material not found');
        }
        
        // Check user permissions
        $this->checkDownloadPermission($userId, $material);
        
        // Get file path
        $filePath = $this->getMaterialFilePath($material);
        if (!file_exists($filePath)) {
            throw new RuntimeException('File not found');
        }
        
        return [
            'success' => true,
            'file_path' => $filePath,
            'file_name' => $material['filename'],
            'content_type' => $this->getContentType($material['filename'])
        ];
    }
    
    /**
     * Toggle material archive status
     */
    public function toggleArchiveStatus($materialId, $userId) {
        $this->validateMaterialId($materialId);
        $this->validateUserId($userId);
        
        // Check user permissions
        $this->checkEditPermission($userId, $materialId);
        
        // Get current status
        $stmt = $this->db->prepare("SELECT archived FROM materials WHERE id = ?");
        $stmt->execute([$materialId]);
        $currentStatus = $stmt->fetchColumn();
        
        // Toggle status
        $newStatus = $currentStatus ? 0 : 1;
        $stmt = $this->db->prepare("UPDATE materials SET archived = ? WHERE id = ?");
        $result = $stmt->execute([$newStatus, $materialId]);
        
        if (!$result) {
            throw new RuntimeException('Failed to update material status');
        }
        
        return [
            'success' => true,
            'message' => $newStatus ? 'Material archived' : 'Material unarchived',
            'archived' => (bool)$newStatus
        ];
    }
    
    /**
     * Get materials list
     */
    public function getMaterialsList($userId, $filters = []) {
        $this->validateUserId($userId);
        
        // Build query based on user role and filters
        $query = $this->buildMaterialsQuery($userId, $filters);
        $stmt = $this->db->prepare($query['sql']);
        $stmt->execute($query['params']);
        $materials = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'materials' => $materials,
            'count' => count($materials)
        ];
    }
    
    /**
     * Get material by ID
     */
    private function getMaterialById($materialId) {
        $stmt = $this->db->prepare("
            SELECT m.*, u.firstname, u.lastname 
            FROM materials m
            LEFT JOIN users u ON m.uploaded_by = u.id
            WHERE m.id = ?
        ");
        $stmt->execute([$materialId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Check download permission
     */
    private function checkDownloadPermission($userId, $material) {
        // Get user role
        $stmt = $this->db->prepare("SELECT role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $role = strtolower($stmt->fetchColumn());
        
        // Check if user is teacher/coordinator or if material is public
        if (!in_array($role, ['teacher', 'coordinator']) && $material['visibility'] !== 'public') {
            throw new RuntimeException('Insufficient permissions to download this material');
        }
    }
    
    /**
     * Check edit permission
     */
    private function checkEditPermission($userId, $materialId) {
        // Get user role
        $stmt = $this->db->prepare("SELECT role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $role = strtolower($stmt->fetchColumn());
        
        // Only teachers and coordinators can edit
        if (!in_array($role, ['teacher', 'coordinator'])) {
            throw new RuntimeException('Insufficient permissions to edit materials');
        }
    }
    
    /**
     * Get material file path
     */
    private function getMaterialFilePath($material) {
        return __DIR__ . '/uploads/materials/' . $material['filename'];
    }
    
    /**
     * Get content type based on file extension
     */
    private function getContentType($filename) {
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        
        $contentTypes = [
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'ppt' => 'application/vnd.ms-powerpoint',
            'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'txt' => 'text/plain',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif'
        ];
        
        return $contentTypes[$extension] ?? 'application/octet-stream';
    }
    
    /**
     * Build materials query based on user role and filters
     */
    private function buildMaterialsQuery($userId, $filters) {
        // Get user role
        $stmt = $this->db->prepare("SELECT role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $role = strtolower($stmt->fetchColumn());
        
        $sql = "
            SELECT m.*, u.firstname, u.lastname,
                   CASE WHEN m.archived = 1 THEN 'Archived' ELSE 'Active' END as status
            FROM materials m
            LEFT JOIN users u ON m.uploaded_by = u.id
            WHERE 1=1
        ";
        $params = [];
        
        // Add role-based filters
        if ($role === 'student') {
            $sql .= " AND m.visibility = 'public'";
        }
        
        // Add custom filters
        if (isset($filters['archived'])) {
            $sql .= " AND m.archived = ?";
            $params[] = $filters['archived'] ? 1 : 0;
        }
        
        if (isset($filters['type'])) {
            $sql .= " AND m.type = ?";
            $params[] = $filters['type'];
        }
        
        $sql .= " ORDER BY m.created_at DESC";
        
        return ['sql' => $sql, 'params' => $params];
    }
    
    /**
     * Validate material ID
     */
    private function validateMaterialId($materialId) {
        if (!is_numeric($materialId) || $materialId <= 0) {
            throw new InvalidArgumentException('Invalid material ID');
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
}
?>


