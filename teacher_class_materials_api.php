<?php
// Teacher Class Materials API - handles class-specific material CRUD operations
session_start();

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/CSRFProtection.php';

header('Content-Type: application/json');

function respond($ok, $data = []){
    echo json_encode($ok ? array_merge(['success'=>true], $data) : array_merge(['success'=>false], $data));
    exit;
}

// Authentication check
if (empty($_SESSION['user_id'])) { 
    respond(false, ['message'=>'Unauthorized']); 
}

$userId = (int)$_SESSION['user_id'];
$role = strtolower((string)($_SESSION['user_role'] ?? ''));

if (!in_array($role, ['teacher','instructor','coordinator','admin'], true)) { 
    respond(false, ['message'=>'Forbidden']); 
}

$db = (new Database())->getConnection();
$action = $_POST['action'] ?? $_GET['action'] ?? '';

// Validate CSRF for mutating actions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action !== 'get_csrf_token') {
    if (!CSRFProtection::validateToken($_POST['csrf_token'] ?? '')) {
        respond(false, ['message'=>'Invalid CSRF token']);
    }
}

// Helper function to check if teacher owns the class
function teacherOwnsClass($pdo, $classId, $userId) {
    try {
        $stmt = $pdo->prepare('SELECT 1 FROM classes WHERE id = ? AND owner_user_id = ?');
        $stmt->execute([(int)$classId, (int)$userId]);
        return (bool)$stmt->fetchColumn();
    } catch (Throwable $e) { 
        return false; 
    }
}

// Helper function to check if lesson belongs to teacher's class
function ensureTeacherCanAccessClassLesson($pdo, $lessonId, $userId) {
    try {
        $lessonId = (int)$lessonId;
        if ($lessonId <= 0) return false;
        
        // Find class via lesson
        $stmt = $pdo->prepare('SELECT cl.class_id FROM class_lessons cl WHERE cl.id = ?');
        $stmt->execute([$lessonId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) return false;
        
        $classId = (int)$row['class_id'];
        return teacherOwnsClass($pdo, $classId, $userId);
    } catch (Throwable $e) {
        return false;
    }
}

try {
    switch ($action) {
        case 'get_csrf_token':
            respond(true, ['csrf_token' => CSRFProtection::generateToken()]);

        case 'class_material_upload': {
            $lessonId = $_POST['lesson_id'] ?? null;
            $type = $_POST['type'] ?? 'file';
            $title = trim($_POST['title'] ?? '');
            
            if (!$lessonId || !ensureTeacherCanAccessClassLesson($db, $lessonId, $userId)) {
                respond(false, ['message' => 'Forbidden - lesson not accessible']);
            }
            
            if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
                respond(false, ['message' => 'No file uploaded']);
            }
            
            // Create uploads directory if it doesn't exist
            $uploadsDir = __DIR__ . '/uploads/class_materials';
            if (!is_dir($uploadsDir)) {
                mkdir($uploadsDir, 0755, true);
            }
            
            // Generate unique filename
            $file = $_FILES['file'];
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = uniqid() . '_' . time() . '.' . $extension;
            $filepath = $uploadsDir . '/' . $filename;
            
            // Move uploaded file
            if (move_uploaded_file($file['tmp_name'], $filepath)) {
                // Save to database
                $stmt = $db->prepare('INSERT INTO class_materials (class_id, lesson_id, title, type, file_path, file_size) VALUES (?, ?, ?, ?, ?, ?)');
                
                // Get class_id from lesson
                $classStmt = $db->prepare('SELECT class_id FROM class_lessons WHERE id = ?');
                $classStmt->execute([$lessonId]);
                $classRow = $classStmt->fetch(PDO::FETCH_ASSOC);
                $classId = $classRow['class_id'];
                
                $success = $stmt->execute([
                    $classId,
                    $lessonId,
                    $title ?: $file['name'],
                    $type,
                    $filepath,
                    $file['size']
                ]);
                
                if ($success) {
                    $materialId = $db->lastInsertId();
                    respond(true, ['id' => $materialId]);
                } else {
                    respond(false, ['message' => 'Database save failed']);
                }
            } else {
                respond(false, ['message' => 'File upload failed']);
            }
        }

        case 'class_material_create': {
            $lessonId = $_POST['lesson_id'] ?? null;
            $type = $_POST['type'] ?? '';
            $title = trim($_POST['title'] ?? '');
            $url = trim($_POST['url'] ?? '');
            
            if (!$lessonId || !ensureTeacherCanAccessClassLesson($db, $lessonId, $userId)) {
                respond(false, ['message' => 'Forbidden - lesson not accessible']);
            }
            
            if ($type === 'link' && !$url) {
                respond(false, ['message' => 'URL required for link type']);
            }
            
            // Get class_id from lesson
            $classStmt = $db->prepare('SELECT class_id FROM class_lessons WHERE id = ?');
            $classStmt->execute([$lessonId]);
            $classRow = $classStmt->fetch(PDO::FETCH_ASSOC);
            $classId = $classRow['class_id'];
            
            $stmt = $db->prepare('INSERT INTO class_materials (class_id, lesson_id, title, type, url) VALUES (?, ?, ?, ?, ?)');
            $success = $stmt->execute([
                $classId,
                $lessonId,
                $title,
                $type,
                $url ?: null
            ]);
            
            if ($success) {
                $materialId = $db->lastInsertId();
                respond(true, ['id' => $materialId]);
            } else {
                respond(false, ['message' => 'Create failed']);
            }
        }

        case 'class_material_update': {
            $materialId = (int)($_POST['material_id'] ?? 0);
            if ($materialId <= 0) respond(false, ['message' => 'Invalid id']);
            
            // Verify ownership
            $stmt = $db->prepare('SELECT lesson_id FROM class_materials WHERE id = ?');
            $stmt->execute([$materialId]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row || !ensureTeacherCanAccessClassLesson($db, $row['lesson_id'], $userId)) {
                respond(false, ['message' => 'Forbidden']);
            }
            
            $data = [];
            if (isset($_POST['url'])) $data['url'] = trim($_POST['url']);
            if (isset($_POST['title'])) $data['title'] = trim($_POST['title']);
            
            $updateFields = [];
            $updateValues = [];
            foreach ($data as $field => $value) {
                $updateFields[] = "$field = ?";
                $updateValues[] = $value;
            }
            $updateValues[] = $materialId;
            
            if (!empty($updateFields)) {
                $stmt = $db->prepare('UPDATE class_materials SET ' . implode(', ', $updateFields) . ' WHERE id = ?');
                $success = $stmt->execute($updateValues);
                respond((bool)$success);
            } else {
                respond(true);
            }
        }

        case 'class_material_delete': {
            $materialId = (int)($_POST['material_id'] ?? 0);
            if ($materialId <= 0) respond(false, ['message' => 'Invalid id']);
            
            // Verify ownership
            $stmt = $db->prepare('SELECT lesson_id FROM class_materials WHERE id = ?');
            $stmt->execute([$materialId]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row || !ensureTeacherCanAccessClassLesson($db, $row['lesson_id'], $userId)) {
                respond(false, ['message' => 'Forbidden']);
            }
            
            $stmt = $db->prepare('DELETE FROM class_materials WHERE id = ?');
            $success = $stmt->execute([$materialId]);
            respond((bool)$success);
        }

        default:
            respond(false, ['message' => 'Unknown action']);
    }
} catch (Throwable $e) {
    respond(false, ['message' => 'Server error: ' . $e->getMessage()]);
}
?>

