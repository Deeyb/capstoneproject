<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }
header('Content-Type: application/json');
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/auth_helpers.php';
require_once __DIR__ . '/classes/ClassService.php';
require_once __DIR__ . '/classes/CourseService.php';

try {
    Auth::requireAuth();
    $db = (new Database())->getConnection();
    if (!$db) { http_response_code(500); echo json_encode(['success'=>false,'message'=>'DB unavailable']); exit; }

    $service = new ClassService($db);
    $action = $_GET['action'] ?? 'get_details';
    // Accept either id or class_id; do not hard-require globally
    $classId = isset($_GET['id']) ? (int)$_GET['id'] : (isset($_GET['class_id']) ? (int)$_GET['class_id'] : 0);

    switch ($action) {
        case 'get_details':
            if ($classId <= 0) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'Invalid class id']); exit; }
            $cls = $service->getClassById($classId);
            if (!$cls) { http_response_code(404); echo json_encode(['success'=>false,'message'=>'Class not found']); exit; }
            echo json_encode(['success'=>true, 'class'=>$cls]);
            break;
        case 'get_overview':
            if ($classId <= 0) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'Invalid class id']); exit; }
            $overview = $service->getClassOverview($classId);
            echo json_encode(['success'=>true, 'overview'=>$overview]);
            break;
        case 'list_lessons':
            if ($classId <= 0) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'Invalid class id']); exit; }
            $lessons = $service->listLessonsForClass($classId);
            echo json_encode(['success'=>true, 'lessons'=>$lessons]);
            break;
        case 'list_topics':
            if ($classId <= 0) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'Invalid class id']); exit; }
            // Return all modules and their lessons for the class' selected course
            $cls = $service->getClassById($classId);
            if (!$cls) { http_response_code(404); echo json_encode(['success'=>false,'message'=>'Class not found']); exit; }
            $courseId = (int)($cls['course_id'] ?? 0);
            if ($courseId <= 0) { echo json_encode(['success'=>true,'modules'=>[]]); break; }
            try {
                // Get all modules for the course
                $mStmt = $db->prepare("SELECT id, title, position FROM course_modules WHERE course_id=? ORDER BY position ASC, id ASC");
                $mStmt->execute([$courseId]);
                $modules = $mStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
                
                // For each module, get its lessons
                $modulesWithLessons = [];
                foreach ($modules as $module) {
                    $lStmt = $db->prepare("SELECT id, title, summary, duration_minutes, position FROM course_lessons WHERE module_id=? ORDER BY position ASC, id ASC");
                    $lStmt->execute([$module['id']]);
                    $lessons = $lStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
                    $modulesWithLessons[] = [
                        'id' => $module['id'],
                        'title' => $module['title'],
                        'position' => $module['position'],
                        'lessons' => $lessons
                    ];
                }
                
                echo json_encode(['success'=>true,'modules'=>$modulesWithLessons]);
            } catch (Throwable $e) {
                echo json_encode(['success'=>true,'modules'=>[]]);
            }
            break;
        case 'get_lesson_details':
            $lessonId = isset($_GET['lesson_id']) ? (int)$_GET['lesson_id'] : 0;
            if ($lessonId <= 0) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'Invalid lesson id']); exit; }
            $courseSvc = new CourseService($db);
            $materials = [];
            $activities = [];
            try { $materials = $courseSvc->listMaterials($lessonId); } catch (Throwable $e) { $materials = []; }
            try { $activities = $courseSvc->listActivities($lessonId); } catch (Throwable $e) { $activities = []; }
            echo json_encode(['success'=>true, 'materials'=>$materials, 'activities'=>$activities]);
            break;
        case 'get_first_module':
            if ($classId <= 0) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'Invalid class id']); exit; }
            // Fetch course_id for the class then return first module title/position
            $cls = $service->getClassById($classId);
            if (!$cls) { http_response_code(404); echo json_encode(['success'=>false,'message'=>'Class not found']); exit; }
            $courseId = (int)($cls['course_id'] ?? 0);
            if ($courseId <= 0) { echo json_encode(['success'=>true,'module'=>null]); break; }
            try {
                $stmt = $db->prepare("SELECT id, title, position FROM course_modules WHERE course_id=? ORDER BY position ASC, id ASC LIMIT 1");
                $stmt->execute([$courseId]);
                $mod = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
                echo json_encode(['success'=>true,'module'=>$mod]);
            } catch (Throwable $e) {
                echo json_encode(['success'=>true,'module'=>null]);
            }
            break;
        default:
            http_response_code(400);
            echo json_encode(['success'=>false,'message'=>'Unknown action']);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Server error']);
}

