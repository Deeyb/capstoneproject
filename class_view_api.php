<?php
/**
 * UNIFIED CLASS VIEW API
 * Now uses the unified system for consistent authentication and security
 */
require_once __DIR__ . '/unified_bootstrap.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/ClassService.php';
require_once __DIR__ . '/classes/CourseService.php';

try {
    $db = (new Database())->getConnection();
    if (!$db) { 
        $GLOBALS['errorHandler']->apiError('Database unavailable', 500);
    }

    $service = new ClassService($db);
    $action = $_GET['action'] ?? 'get_details';
    
    // Unified authentication handling
    $noAuthActions = ['get_activity', 'get_lesson_details', 'list_topics'];
    if (!in_array($action, $noAuthActions)) {
        requireAuth();
    }
    
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
                
                // For each module, get its lessons and their activities
                $modulesWithLessons = [];
                foreach ($modules as $module) {
                    $lStmt = $db->prepare("SELECT id, title, summary, duration_minutes, position FROM course_lessons WHERE module_id=? ORDER BY position ASC, id ASC");
                    $lStmt->execute([$module['id']]);
                    $lessons = $lStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
                    
                    // For each lesson, get its activities
                    foreach ($lessons as &$lesson) {
                        $aStmt = $db->prepare("SELECT id, title, type, max_score, instructions FROM lesson_activities WHERE lesson_id=? ORDER BY id ASC");
                        $aStmt->execute([$lesson['id']]);
                        $lesson['activities'] = $aStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
                    }
                    
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
            if ($lessonId <= 0) { 
                http_response_code(400); 
                echo json_encode(['success'=>false,'message'=>'Invalid lesson id']); 
                exit; 
            }
            $courseSvc = new CourseService($db);
            $materials = [];
            $activities = [];
            try { 
                $materials = $courseSvc->listMaterials($lessonId); 
                error_log("✅ Materials found: " . count($materials));
            } catch (Throwable $e) { 
                error_log("❌ Error getting materials: " . $e->getMessage());
                $materials = []; 
            }
            try { 
                $activities = $courseSvc->listActivities($lessonId); 
                error_log("✅ Activities found: " . count($activities));
            } catch (Throwable $e) { 
                error_log("❌ Error getting activities: " . $e->getMessage());
                $activities = []; 
            }
            $response = ['success'=>true, 'materials'=>$materials, 'activities'=>$activities];
            error_log("📤 Sending response: " . json_encode($response));
            echo json_encode($response);
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
        case 'get_activity':
            $activityId = (int)($_GET['id'] ?? 0);
            error_log("🔍 DEBUG: get_activity called with ID: " . $activityId);
            
            if ($activityId <= 0) { 
                error_log("🔍 DEBUG: Invalid activity ID: " . $activityId);
                http_response_code(400); 
                echo json_encode(['success'=>false,'message'=>'Invalid activity id']); 
                exit; 
            }
            
            try {
                error_log("🔍 DEBUG: Searching for activity ID: " . $activityId);
                
                // Get activity details - try multiple tables
                $activity = null;
                
                // Try lesson_activities table first
                $stmt = $db->prepare("
                    SELECT la.id, la.title, la.type, la.max_score, la.instructions
                    FROM lesson_activities la 
                    WHERE la.id = ?
                ");
                $stmt->execute([$activityId]);
                $activity = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // If not found, try activities table
                if (!$activity) {
                    error_log("🔍 DEBUG: Not found in lesson_activities, trying activities table");
                    $stmt = $db->prepare("
                        SELECT a.id, a.title, a.type, a.max_score, a.instructions
                        FROM activities a 
                        WHERE a.id = ?
                    ");
                    $stmt->execute([$activityId]);
                    $activity = $stmt->fetch(PDO::FETCH_ASSOC);
                }
                
                // If still not found, try class_activities table
                if (!$activity) {
                    error_log("🔍 DEBUG: Not found in activities, trying class_activities table");
                    $stmt = $db->prepare("
                        SELECT ca.id, ca.title, ca.type, ca.max_score, ca.instructions
                        FROM class_activities ca 
                        WHERE ca.id = ?
                    ");
                    $stmt->execute([$activityId]);
                    $activity = $stmt->fetch(PDO::FETCH_ASSOC);
                }
                
                error_log("🔍 DEBUG: Activity query result: " . json_encode($activity));
                
                if (!$activity) {
                    error_log("🔍 DEBUG: Activity not found in database for ID: " . $activityId);
                    
                    // Check if activity exists in any table
                    $checkStmt = $db->prepare("SHOW TABLES LIKE '%activity%'");
                    $checkStmt->execute();
                    $tables = $checkStmt->fetchAll(PDO::FETCH_COLUMN);
                    error_log("🔍 DEBUG: Available activity tables: " . json_encode($tables));
                    
                    http_response_code(404);
                    echo json_encode(['success'=>false,'message'=>'Activity not found in database']);
                    exit;
                }
                
                error_log("🔍 DEBUG: Activity found: " . json_encode($activity));
                
                // Debug: Show all activities in the database
                $debugStmt = $db->prepare("SELECT id, title, type FROM lesson_activities ORDER BY id DESC LIMIT 10");
                $debugStmt->execute();
                $allActivities = $debugStmt->fetchAll(PDO::FETCH_ASSOC);
                error_log("🔍 DEBUG: Recent activities in database: " . json_encode($allActivities));
                
                // Get questions for this activity - try multiple tables
                $questions = [];
                
                // Try activity_questions table first
                $stmt = $db->prepare("
                    SELECT aq.id, aq.question_text, aq.points, aq.position, aq.type
                    FROM activity_questions aq 
                    WHERE aq.activity_id = ? 
                    ORDER BY aq.position ASC, aq.id ASC
                ");
                $stmt->execute([$activityId]);
                $questions = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
                
                // If not found, try questions table
                if (empty($questions)) {
                    error_log("🔍 DEBUG: No questions in activity_questions, trying questions table");
                    $stmt = $db->prepare("
                        SELECT q.id, q.question_text, q.points, q.position, q.type
                        FROM questions q 
                        WHERE q.activity_id = ? 
                        ORDER BY q.position ASC, q.id ASC
                    ");
                    $stmt->execute([$activityId]);
                    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
                }
                
                // If still not found, try class_questions table
                if (empty($questions)) {
                    error_log("🔍 DEBUG: No questions in questions table, trying class_questions table");
                    $stmt = $db->prepare("
                        SELECT cq.id, cq.question_text, cq.points, cq.position, cq.type
                        FROM class_questions cq 
                        WHERE cq.activity_id = ? 
                        ORDER BY cq.position ASC, cq.id ASC
                    ");
                    $stmt->execute([$activityId]);
                    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
                }
                
                error_log("🔍 DEBUG: Questions found for activity " . $activityId . ": " . json_encode($questions));
                
                // Get choices for each question
                foreach ($questions as &$question) {
                    // If question doesn't have type, use activity type
                    if (!isset($question['type']) || empty($question['type'])) {
                        $question['type'] = $activity['type'];
                        error_log("🔍 DEBUG: Question " . $question['id'] . " using activity type: " . $activity['type']);
                    }
                    
                    // Try multiple choice tables
                    $choices = [];
                    
                    // Try question_choices table first
                    $stmt = $db->prepare("
                        SELECT id, choice_text, is_correct 
                        FROM question_choices 
                        WHERE question_id = ? 
                        ORDER BY id ASC
                    ");
                    $stmt->execute([$question['id']]);
                    $choices = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
                    
                    // If not found, try choices table
                    if (empty($choices)) {
                        $stmt = $db->prepare("
                            SELECT id, choice_text, is_correct 
                            FROM choices 
                            WHERE question_id = ? 
                            ORDER BY id ASC
                        ");
                        $stmt->execute([$question['id']]);
                        $choices = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
                    }
                    
                    // If still not found, try class_choices table
                    if (empty($choices)) {
                        $stmt = $db->prepare("
                            SELECT id, choice_text, is_correct 
                            FROM class_choices 
                            WHERE question_id = ? 
                            ORDER BY id ASC
                        ");
                        $stmt->execute([$question['id']]);
                        $choices = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
                    }
                    
                    $question['choices'] = $choices;
                }
                
                $activity['questions'] = $questions;
                
                error_log("🔍 DEBUG: Final activity data being returned: " . json_encode($activity));
                
                echo json_encode(['success'=>true, 'activity'=>$activity]);
                
            } catch (Throwable $e) {
                http_response_code(500);
                echo json_encode(['success'=>false,'message'=>'Database error: ' . $e->getMessage()]);
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

