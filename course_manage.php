<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header('Content-Type: application/json');
header('Cache-Control: no-store');

try {
    require_once __DIR__ . '/classes/auth_helpers.php';
    require_once __DIR__ . '/config/Database.php';
    require_once __DIR__ . '/classes/CourseService.php';
    Auth::requireAuth();

    // Allow both GET and POST for different actions
    if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        exit;
    }

    $db = (new Database())->getConnection();
    // Coordinator-only
    $stmt = $db->prepare("SELECT role FROM users WHERE id=? LIMIT 1");
    $stmt->execute([$_SESSION['user_id']]);
    $role = $stmt->fetchColumn() ?: '';
    $role = strtolower(trim($role));
    if ($role !== 'coordinator') { http_response_code(403); echo json_encode(['success'=>false,'message'=>'Unauthorized']); exit; }

    $courseService = new CourseService($db);
    $action = $_POST['action'] ?? $_GET['action'] ?? '';

    switch ($action) {
        case 'create': {
            $code = trim($_POST['code'] ?? '');
            $title = trim($_POST['title'] ?? '');
            $description = trim($_POST['description'] ?? '');
            $language = trim($_POST['language'] ?? '');
            
            // Validation
            if ($code === '' || $title === '') { 
                echo json_encode(['success'=>false,'message'=>'Course code and title are required']); 
                break; 
            }
            
            if (!preg_match('/^[A-Z0-9]{3,10}$/', $code)) {
                echo json_encode(['success'=>false,'message'=>'Course code must be 3-10 characters, letters and numbers only']);
                break;
            }
            
            if (strlen($title) < 5) {
                echo json_encode(['success'=>false,'message'=>'Course title must be at least 5 characters long']);
                break;
            }
            
            // Prevent duplicate code
            $chk = $db->prepare('SELECT id FROM courses WHERE code=? LIMIT 1');
            $chk->execute([$code]);
            if ($chk->fetchColumn()) { 
                echo json_encode(['success'=>false,'message'=>'Course code already exists']); 
                break; 
            }
            
            // Create course
            $id = $courseService->createCourse([
                'code' => $code,
                'title' => $title,
                'description' => $description,
                'language' => $language,
                'status' => 'draft',
                'owner_user_id' => $_SESSION['user_id'] ?? null,
            ]);
            
            if ($id > 0) {
                
                echo json_encode([
                    'success' => true, 
                    'id' => $id, 
                    'message' => 'Course created successfully'
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to create course']);
            }
            break;
        }
        case 'update': {
            $id = (int)$_POST['id'];
            $code = trim($_POST['code'] ?? '');
            $title = trim($_POST['title'] ?? '');
            $language = trim($_POST['language'] ?? '');
            $description = trim($_POST['description'] ?? '');
            
            if ($code === '' || $title === '') { 
                echo json_encode(['success'=>false,'message'=>'Code and title are required']); 
                break; 
            }
            
            if (!preg_match('/^[A-Z0-9]{3,10}$/', $code)) {
                echo json_encode(['success'=>false,'message'=>'Course code must be 3-10 characters, letters and numbers only']);
                break;
            }
            
            if (strlen($title) < 5) {
                echo json_encode(['success'=>false,'message'=>'Course title must be at least 5 characters long']);
                break;
            }
            
            $chk = $db->prepare('SELECT id FROM courses WHERE code=? AND id<>? LIMIT 1');
            $chk->execute([$code, $id]);
            if ($chk->fetchColumn()) { 
                echo json_encode(['success'=>false,'message'=>'Course code already exists']); 
                break; 
            }
            
            $ok = $courseService->updateCourse($id, [
                'code' => $code,
                'title' => $title,
                'language' => $language,
                'description' => $description,
                'owner_user_id' => $_SESSION['user_id'] ?? null,
            ]);
            echo json_encode(['success' => (bool)$ok, 'message' => $ok?'':'Update failed']);
            break;
        }
        case 'status': {
            $courseId = (int)$_POST['id'];
            $status = $_POST['status'] ?? 'draft';
            $userId = $_SESSION['user_id'];
            
            $result = $courseService->updateCourseStatus($courseId, $status, $userId);
            echo json_encode($result);
            break;
        }
        case 'archive': {
            $ok = $courseService->setCourseArchived((int)$_POST['id'], true);
            echo json_encode(['success' => (bool)$ok]);
            break;
        }
        case 'unarchive': {
            $ok = $courseService->setCourseArchived((int)$_POST['id'], false);
            echo json_encode(['success' => (bool)$ok]);
            break;
        }
        case 'delete': {
            $ok = $courseService->deleteCourse((int)$_POST['id']);
            echo json_encode(['success' => (bool)$ok]);
            break;
        }
        case 'get': {
            $id = (int)($_GET['id'] ?? $_POST['id'] ?? 0);
            if ($id <= 0) { echo json_encode(['success'=>false,'message'=>'Invalid course ID']); break; }
            $course = $courseService->getCourse($id);
            if (!$course) { echo json_encode(['success'=>false,'message'=>'Course not found']); break; }
            echo json_encode(['success' => true, 'course' => $course]);
            break;
        }
        default:
            echo json_encode(['success' => false, 'message' => 'Unknown action']);
    }
} catch (Throwable $e) {
    // Return error details to client so the UI can surface it
    http_response_code(200);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
