<?php
// Start session first, before any other includes
if (session_status() === PHP_SESSION_NONE) {
    // Robust session name detection to support legacy pages that started PHPSESSID
    $preferred = 'CodeRegalSession';
    $legacy = 'PHPSESSID';
    if (!empty($_COOKIE[$preferred])) { session_name($preferred); }
    elseif (!empty($_COOKIE[$legacy])) { session_name($legacy); }
    else { session_name($preferred); }
    session_start();
    // If user_id is still missing and the alternate cookie exists, switch to that session
    if (empty($_SESSION['user_id'])) {
        $current = session_name();
        $alt = ($current === $preferred) ? $legacy : $preferred;
        if (!empty($_COOKIE[$alt])) {
            @session_write_close();
            session_name($alt);
            @session_id($_COOKIE[$alt]);
            @session_start();
        }
    }
}

// Now include config after session is started
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/classes/auth_helpers.php';
require_once __DIR__ . '/classes/CSRFProtection.php';
require_once __DIR__ . '/classes/RateLimiter.php';

// Validation functions
function validateActivityData($data) {
    $errors = [];
    
    // Title validation
    if (empty($data['title']) || strlen($data['title']) > 255) {
        $errors[] = 'Title is required and must be 255 characters or less';
    }
    
    // Type validation
    if (!in_array($data['type'], ['coding', 'quiz', 'multiple_choice', 'identification', 'essay'])) {
        $errors[] = 'Invalid activity type';
    }
    
    // Max score validation
    if (isset($data['max_score']) && (!is_numeric($data['max_score']) || $data['max_score'] < 1 || $data['max_score'] > 1000)) {
        $errors[] = 'Max score must be between 1 and 1000';
    }
    
    return $errors;
}

function validateCodingData($instructions) {
    $errors = [];
    $meta = json_decode($instructions, true);
    
    if (!$meta) {
        $errors[] = 'Invalid instructions format';
        return $errors;
    }
    
    // Language validation
    if (!in_array($meta['language'] ?? '', ['cpp', 'java', 'python'])) {
        $errors[] = 'Language must be cpp, java, or python';
    }
    
    // Instructions length
    if (strlen($meta['instructions'] ?? '') > 5000) {
        $errors[] = 'Instructions must be 5000 characters or less';
    }
    
    // Problem statement length
    if (strlen($meta['problemStatement'] ?? '') > 5000) {
        $errors[] = 'Problem statement must be 5000 characters or less';
    }
    
    // Starter code length
    if (strlen($meta['starterCode'] ?? '') > 10000) {
        $errors[] = 'Starter code must be 10000 characters or less';
    }
    
    return $errors;
}

function validateTestCases($testCases) {
    $errors = [];
    
    if (!is_array($testCases)) {
        $errors[] = 'Test cases must be an array';
        return $errors;
    }
    
    foreach ($testCases as $i => $tc) {
        if (strlen($tc['input_text'] ?? '') > 2000) {
            $errors[] = "Test case " . ($i + 1) . " input must be 2000 characters or less";
        }
        if (strlen($tc['expected_output_text'] ?? '') > 2000) {
            $errors[] = "Test case " . ($i + 1) . " expected output must be 2000 characters or less";
        }
        if (isset($tc['time_limit_ms']) && (!is_numeric($tc['time_limit_ms']) || $tc['time_limit_ms'] < 100 || $tc['time_limit_ms'] > 30000)) {
            $errors[] = "Test case " . ($i + 1) . " time limit must be between 100ms and 30000ms";
        }
    }
    
    return $errors;
}

header('Content-Type: application/json');
header('Cache-Control: no-store');
if (function_exists('ob_get_level')) { while (ob_get_level() > 0) { @ob_end_clean(); } }

// Manual auth check to avoid HTML redirects
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success'=>false,'message'=>'Not authenticated - Session user_id missing']);
    exit;
}

// CSRF validation for POST requests (skip for token fetch action)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $earlyAction = $_POST['action'] ?? '';
    if ($earlyAction !== 'get_csrf_token') {
        $csrfToken = $_POST[CSRFProtection::getTokenName()] ?? '';
        error_log("CSRF Debug - Action: $earlyAction, Token: " . substr($csrfToken, 0, 10) . "...");
        if (!CSRFProtection::validateToken($csrfToken)) {
            error_log("CSRF Debug - Token validation failed for action: $earlyAction");
            echo json_encode(['success'=>false,'message'=>'Invalid CSRF token']);
            exit;
        }
        error_log("CSRF Debug - Token validation passed for action: $earlyAction");
    }
}

// Debug session info (only log if we have a user_id)
if (isset($_SESSION['user_id'])) {
    error_log("Session debug - user_id: " . $_SESSION['user_id'] . ", session_id: " . session_id() . ", session_name: " . session_name());
} else {
    error_log("Session debug - NO user_id found, session_id: " . session_id() . ", session_name: " . session_name());
}

// Check if user is coordinator (full access) or admin (materials-only)
$stmt = null;
try {
    require_once __DIR__ . '/config/Database.php';
    $db = (new Database())->getConnection();
    $stmt = $db->prepare("SELECT LOWER(TRIM(role)) FROM users WHERE id=? LIMIT 1");
    $stmt->execute([$_SESSION['user_id']]);
    $role = $stmt->fetchColumn() ?: '';
    $isCoordinator = $role === 'coordinator';
    $isAdmin = $role === 'admin';
} catch (Exception $e) {
    echo json_encode(['success'=>false,'message'=>'Authentication error']);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['success'=>false,'message'=>'Invalid request']); exit; }
    require_once __DIR__ . '/config/Database.php';
    require_once __DIR__ . '/classes/CourseService.php';
    $db = (new Database())->getConnection();
    // Enable exceptions for deeper debugging and reliable error handling
    if ($db) { try { $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); } catch (Throwable $e) {} }
    $svc = new CourseService($db);
    $audit = null;
    $auditFile = __DIR__ . '/classes/AuditLogService.php';
    if (file_exists($auditFile)) {
        require_once $auditFile;
        if (class_exists('AuditLogService')) {
            try { $audit = new AuditLogService($db); } catch (Throwable $e) { $audit = null; }
        }
    }

    $action = $_POST['action'] ?? '';
    switch ($action) {
        case 'get_csrf_token':
            $token = CSRFProtection::generateToken();
            error_log("CSRF Debug - Generated new token: " . substr($token, 0, 10) . "...");
            echo json_encode(['success'=>true,'token'=>$token]);
            break;
        case 'module_create':
            if (!$isCoordinator) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $id = $svc->createModule((int)$_POST['course_id'], trim($_POST['title'] ?? ''));
            echo json_encode(['success' => $id > 0, 'id' => $id]);
            break;
        case 'module_update':
            if (!$isCoordinator) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $ok = $svc->updateModule((int)$_POST['id'], trim($_POST['title'] ?? ''));
            echo json_encode(['success' => (bool)$ok]);
            break;
        case 'module_delete':
            if (!$isCoordinator) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $ok = $svc->deleteModule((int)$_POST['id']);
            echo json_encode(['success' => (bool)$ok]);
            break;
        case 'module_reorder':
            if (!$isCoordinator) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $ids = json_decode($_POST['ordered_ids'] ?? '[]', true) ?: [];
            $ok = $svc->reorderModules((int)$_POST['course_id'], $ids);
            echo json_encode(['success' => (bool)$ok]);
            break;
        case 'lesson_create':
            if (!$isCoordinator) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $id = $svc->createLesson((int)$_POST['module_id'], trim($_POST['title'] ?? ''));
            echo json_encode(['success' => $id > 0, 'id' => $id]);
            break;
        case 'bulk_lesson_create':
            if (!$isCoordinator) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $moduleId = (int)($_POST['module_id'] ?? 0);
            $titles = json_decode($_POST['titles'] ?? '[]', true);
            if ($moduleId <= 0) { echo json_encode(['success'=>false,'message'=>'Invalid module']); break; }
            if (!is_array($titles) || empty($titles)) { echo json_encode(['success'=>false,'message'=>'Invalid lesson titles']); break; }
            $created = 0; $errors = [];
            foreach ($titles as $t) {
                $t = trim((string)$t);
                if ($t === '') continue;
                $lid = $svc->createLesson($moduleId, $t);
                if ($lid > 0) { $created++; } else { $errors[] = $t; }
            }
            if ($created > 0) {
                echo json_encode(['success'=>true,'created_count'=>$created,'errors'=>$errors]);
            } else {
                echo json_encode(['success'=>false,'message'=>'Failed to create any lessons']);
            }
            break;
        case 'lesson_update':
            if (!$isCoordinator) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $ok = $svc->updateLesson((int)$_POST['id'], trim($_POST['title'] ?? ''));
            echo json_encode(['success' => (bool)$ok]);
            break;
        case 'lesson_delete':
            if (!$isCoordinator) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $ok = $svc->deleteLesson((int)$_POST['id']);
            echo json_encode(['success' => (bool)$ok]);
            break;
        case 'lesson_reorder':
            if (!$isCoordinator) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $ids = json_decode($_POST['ordered_ids'] ?? '[]', true) ?: [];
            $ok = $svc->reorderLessons((int)$_POST['module_id'], $ids);
            echo json_encode(['success' => (bool)$ok]);
            break;
        // Materials
        case 'material_create':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $id = $svc->addMaterial((int)$_POST['lesson_id'], $_POST['type'] ?? 'link', $_POST['url'] ?? null, $_POST['filename'] ?? null, (int)($_POST['size_bytes'] ?? 0));
            if ($audit) { $audit->log($_SESSION['user_id'] ?? null, 'material.create', 'lesson_material', (string)$id, ['lesson_id'=>$_POST['lesson_id'] ?? null]); }
            echo json_encode(['success' => $id > 0, 'id' => $id]);
            break;
        case 'material_types':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            // Dynamic material types listing. For now, mirror DB enum values and keep labels.
            $types = [
                ['value'=>'pdf','label'=>'PDF'],
                ['value'=>'video','label'=>'Video'],
                ['value'=>'link','label'=>'Link'],
                ['value'=>'code','label'=>'Code'],
                ['value'=>'file','label'=>'General File'],
                ['value'=>'page','label'=>'Page']
            ];
            echo json_encode(['success'=>true,'types'=>$types]);
            break;
        case 'material_update':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $ok = $svc->updateMaterial((int)$_POST['id'], [
                'type' => $_POST['type'] ?? 'link',
                'url' => $_POST['url'] ?? null,
                'filename' => $_POST['filename'] ?? null,
                'size_bytes' => (int)($_POST['size_bytes'] ?? 0)
            ]);
            if ($audit) { $audit->log($_SESSION['user_id'] ?? null, 'material.update', 'lesson_material', (string)($_POST['id'] ?? ''), ['keys'=>array_keys($_POST)]); }
            echo json_encode(['success' => (bool)$ok]);
            break;
        case 'material_delete':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $ok = $svc->deleteMaterial((int)$_POST['id']);
            if ($audit) { $audit->log($_SESSION['user_id'] ?? null, 'material.delete', 'lesson_material', (string)($_POST['id'] ?? '')); }
            echo json_encode(['success' => (bool)$ok]);
            break;
        case 'material_get':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            try {
                $id = (int)($_POST['id'] ?? 0);
                $stmt = $db->prepare('SELECT * FROM lesson_materials WHERE id=? LIMIT 1');
                $stmt->execute([$id]);
                $m = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
                echo json_encode(['success'=> (bool)$m, 'data'=> $m]);
            } catch (Throwable $e) {
                echo json_encode(['success'=>false,'message'=>'DB error','error'=>$e->getMessage()]);
            }
            break;
        case 'material_reorder':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $ids = json_decode($_POST['ordered_ids'] ?? '[]', true) ?: [];
            $ok = $svc->reorderMaterials((int)$_POST['lesson_id'], $ids);
            if ($audit) { $audit->log($_SESSION['user_id'] ?? null, 'material.reorder', 'lesson_material', null, ['lesson_id'=>$_POST['lesson_id'] ?? null, 'order'=>$ids]); }
            echo json_encode(['success' => (bool)$ok]);
            break;
        case 'material_upload':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            if (!isset($_FILES['file'])) { echo json_encode(['success'=>false,'message'=>'No file']); break; }
            $lessonId = (int)($_POST['lesson_id'] ?? 0);
            $res = $svc->saveUploadedMaterial($lessonId, $_FILES['file']);
            if ($audit) { $audit->log($_SESSION['user_id'] ?? null, 'material.upload', 'lesson_material', null, ['lesson_id'=>$lessonId, 'success'=>$res['success'] ?? null]); }
            echo json_encode($res);
            break;
        case 'material_page_create':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $lessonId = (int)($_POST['lesson_id'] ?? 0);
            $title = trim($_POST['title'] ?? 'Content Page');
            $content = $_POST['content'] ?? '';
            $baseDir = realpath(__DIR__);
            if ($baseDir === false) { $baseDir = __DIR__; }
            $dir = $baseDir . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'materials' . DIRECTORY_SEPARATOR . 'pages';
            if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
            $unique = date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '_page.md';
            $path = $dir . DIRECTORY_SEPARATOR . $unique;
            $ok = @file_put_contents($path, $content);
            if ($ok === false) { echo json_encode(['success'=>false,'message'=>'Failed to save page']); break; }
            require_once __DIR__ . '/classes/CourseService.php';
            require_once __DIR__ . '/config/Database.php';
            $db2 = (new Database())->getConnection();
            $svc2 = new CourseService($db2);
            $url = 'material_page_view.php?f=' . rawurlencode($unique);
            $id = $svc2->addMaterial($lessonId, 'page', $url, $title, strlen($content));
            if ($audit) { $audit->log($_SESSION['user_id'] ?? null, 'material.page_create', 'lesson_material', (string)$id, ['lesson_id'=>$lessonId]); }
            echo json_encode(['success' => $id > 0, 'id' => $id]);
            break;
        case 'material_page_update':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $matId = (int)($_POST['id'] ?? 0);
            $content = (string)($_POST['content'] ?? '');
            $title = isset($_POST['title']) ? trim((string)$_POST['title']) : null;
            try {
                $stmt = $db->prepare('SELECT * FROM lesson_materials WHERE id=? LIMIT 1');
                $stmt->execute([$matId]);
                $m = $stmt->fetch(PDO::FETCH_ASSOC);
                if (!$m) { echo json_encode(['success'=>false,'message'=>'Material not found']); break; }
                $url = (string)($m['url'] ?? '');
                if (!preg_match('/material_page_view\.php\?f=([A-Za-z0-9_\.-]+)$/', $url, $mm)) { echo json_encode(['success'=>false,'message'=>'Not a Page material']); break; }
                $f = $mm[1];
                $path = __DIR__ . '/uploads/materials/pages/' . $f;
                if (!is_file($path)) { echo json_encode(['success'=>false,'message'=>'Page file missing']); break; }
                $ok = @file_put_contents($path, $content);
                if ($ok === false) { echo json_encode(['success'=>false,'message'=>'Failed to write file']); break; }
                if ($title !== null) {
                    $upd = $db->prepare('UPDATE lesson_materials SET filename=? WHERE id=?');
                    $upd->execute([$title, $matId]);
                }
                if ($audit) { $audit->log($_SESSION['user_id'] ?? null, 'material.page_update', 'lesson_material', (string)$matId); }
                echo json_encode(['success'=>true]);
            } catch (Throwable $e) {
                echo json_encode(['success'=>false,'message'=>'Update failed','error'=>$e->getMessage()]);
            }
            break;
        case 'material_import':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $lessonId = (int)($_POST['lesson_id'] ?? 0);
            $url = trim($_POST['url'] ?? '');
            if ($url === '') { echo json_encode(['success'=>false,'message'=>'No URL']); break; }
            $res = $svc->importMaterialFromUrl($lessonId, $url);
            if ($audit) { $audit->log($_SESSION['user_id'] ?? null, 'material.import', 'lesson_material', null, ['lesson_id'=>$lessonId, 'url'=>$url, 'success'=>$res['success'] ?? null]); }
            echo json_encode($res);
            break;
        // Activities
        case 'activity_create':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $lessonId = (int)($_POST['lesson_id'] ?? 0);
            $title = trim($_POST['title'] ?? '');
            $type = $_POST['type'] ?? 'coding';
            $instructions = $_POST['instructions'] ?? '';
            $maxScore = (int)($_POST['max_score'] ?? 100);
            
            // Validate activity data
            $activityData = ['title' => $title, 'type' => $type, 'max_score' => $maxScore];
            $errors = validateActivityData($activityData);
            
            // Validate coding-specific data
            if ($type === 'coding') {
                $codingErrors = validateCodingData($instructions);
                $errors = array_merge($errors, $codingErrors);
            }
            
            if (!empty($errors)) {
                echo json_encode(['success'=>false,'message'=>'Validation failed: ' . implode(', ', $errors)]);
                break;
            }
            
            // Check for duplicate activity (same lesson, type, and title)
            try {
                $dup = $db->prepare('SELECT id FROM lesson_activities WHERE lesson_id=? AND type=? AND title=? LIMIT 1');
                $dup->execute([$lessonId, $type, $title]);
                if ($dup->fetchColumn()) {
                    echo json_encode(['success'=>false,'message'=>'Activity with the same title already exists in this lesson.']);
                    break;
                }
            } catch (Throwable $e) {
                echo json_encode(['success'=>false,'message'=>'Duplicate check failed','error'=>$e->getMessage()]);
                break;
            }
            // Pre-check: lesson must exist (avoid FK failure returning generic 0 id)
            try {
                $chk = $db->prepare('SELECT id FROM course_lessons WHERE id = ? LIMIT 1');
                $chk->execute([$lessonId]);
                if (!$chk->fetchColumn()) { echo json_encode(['success'=>false,'message'=>'Lesson not found','debug'=>['lesson_id'=>$lessonId]]); break; }
            } catch (Throwable $e) {
                echo json_encode(['success'=>false,'message'=>'DB error (lesson lookup)','error'=>$e->getMessage()]);
                break;
            }
            try {
                $id = $svc->createActivity($lessonId, $title, $_POST['instructions'] ?? null, $type, $_POST['due_at'] ?? null, (int)($_POST['max_score'] ?? 100));
            } catch (Throwable $e) {
                echo json_encode(['success'=>false,'message'=>'Create failed','error'=>$e->getMessage(),'debug'=>['lesson_id'=>$lessonId,'type'=>$type,'title'=>$title]]);
                break;
            }
            if ($audit) { $audit->log($_SESSION['user_id'] ?? null, 'activity.create', 'lesson_activity', (string)$id, ['lesson_id'=>$lessonId, 'title'=>$title, 'type'=>$type]); }
            // Optionally seed coding test cases if provided as JSON
            if ($id > 0 && !empty($_POST['test_cases'])) {
                $seed = json_decode($_POST['test_cases'], true);
                if (is_array($seed)) {
                    foreach ($seed as $idx => $tc) {
                        $svc->addTestCase((int)$id, !empty($tc['is_sample']), (string)($tc['input_text'] ?? ''), (string)($tc['expected_output_text'] ?? ''), (int)($tc['time_limit_ms'] ?? 2000));
                    }
                }
            }
            echo json_encode(['success' => $id > 0, 'id' => $id, 'message' => $id>0 ? 'OK' : 'Insert failed']);
            break;
        case 'activity_update':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $ok = $svc->updateActivity((int)$_POST['id'], [
                'title' => $_POST['title'] ?? '',
                'instructions' => $_POST['instructions'] ?? null,
                'type' => $_POST['type'] ?? 'coding',
                'due_at' => $_POST['due_at'] ?? null,
                'max_score' => (int)($_POST['max_score'] ?? 100)
            ]);
            if ($audit) { $audit->log($_SESSION['user_id'] ?? null, 'activity.update', 'lesson_activity', (string)($_POST['id'] ?? ''), ['keys'=>array_keys($_POST)]); }
            echo json_encode(['success' => (bool)$ok]);
            break;
        case 'activity_delete':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $ok = $svc->deleteActivity((int)$_POST['id']);
            if ($audit) { $audit->log($_SESSION['user_id'] ?? null, 'activity.delete', 'lesson_activity', (string)($_POST['id'] ?? '')); }
            echo json_encode(['success' => (bool)$ok]);
            break;
        case 'activity_get':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $act = $svc->getActivity((int)($_POST['id'] ?? 0));
            echo json_encode(['success'=> (bool)$act, 'data'=> $act]);
            break;
        case 'activity_duplicate':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $srcId = (int)($_POST['id'] ?? 0);
            $stmt = $db->prepare("SELECT * FROM lesson_activities WHERE id=?");
            $stmt->execute([$srcId]);
            $src = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$src) { echo json_encode(['success'=>false,'message'=>'Activity not found']); break; }
            // create new activity in same lesson with copied fields
            $newId = $svc->createActivity((int)$src['lesson_id'], ($src['title'] ?? 'Copy of Activity'), ($src['instructions'] ?? null), ($src['type'] ?? 'coding'), ($src['due_at'] ?? null), (int)($src['max_score'] ?? 100));
            if ($newId <= 0) { echo json_encode(['success'=>false,'message'=>'Duplicate failed']); break; }
            // If MCQ/quiz: clone questions/choices
            $typeLower = strtolower((string)$src['type']);
            if ($typeLower === 'multiple_choice' || $typeLower === 'quiz') {
                $qStmt = $db->prepare("SELECT * FROM activity_questions WHERE activity_id=? ORDER BY position ASC, id ASC");
                $qStmt->execute([$srcId]);
                $questions = $qStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
                $insQ = $db->prepare("INSERT INTO activity_questions (activity_id, question_text, explanation, position, points) VALUES (?,?,?,?,?)");
                $selC = $db->prepare("SELECT * FROM question_choices WHERE question_id=? ORDER BY position ASC, id ASC");
                $insC = $db->prepare("INSERT INTO question_choices (question_id, choice_text, is_correct, position) VALUES (?,?,?,?)");
                foreach ($questions as $q) {
                    $insQ->execute([$newId, $q['question_text'], $q['explanation'] ?? null, $q['position'], $q['points']]);
                    $newQid = (int)$db->lastInsertId();
                    $selC->execute([$q['id']]);
                    $choices = $selC->fetchAll(PDO::FETCH_ASSOC) ?: [];
                    foreach ($choices as $c) { $insC->execute([$newQid, $c['choice_text'], (int)$c['is_correct'], $c['position']]); }
                }
            }
            // If coding: clone test cases
            if ($typeLower === 'coding') {
                $tcSel = $db->prepare("SELECT * FROM activity_test_cases WHERE activity_id=? ORDER BY position ASC, id ASC");
                $tcIns = $db->prepare("INSERT INTO activity_test_cases (activity_id, is_sample, input_text, expected_output_text, time_limit_ms, position) VALUES (?,?,?,?,?,?)");
                $tcSel->execute([$srcId]);
                foreach ($tcSel->fetchAll(PDO::FETCH_ASSOC) as $tc) {
                    $tcIns->execute([$newId, (int)$tc['is_sample'], $tc['input_text'], $tc['expected_output_text'], (int)$tc['time_limit_ms'], (int)$tc['position']]);
                }
            }
            echo json_encode(['success'=>true,'id'=>$newId]);
            break;
        // MCQ question/choice actions
        case 'question_create':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $qid = $svc->addQuestion((int)$_POST['activity_id'], trim($_POST['question_text'] ?? ''), (int)($_POST['points'] ?? 1));
            echo json_encode(['success'=>$qid>0,'id'=>$qid]);
            break;
        case 'question_update':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $ok = $svc->updateQuestion((int)$_POST['id'], [
                'question_text'=>$_POST['question_text'] ?? '',
                'explanation'=> $_POST['explanation'] ?? null,
                'points'=>(int)($_POST['points'] ?? 1)
            ]);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        case 'question_delete':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $ok = $svc->deleteQuestion((int)$_POST['id']);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        case 'question_reorder':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $ids = json_decode($_POST['ordered_ids'] ?? '[]', true) ?: [];
            $ok = $svc->reorderQuestions((int)$_POST['activity_id'], $ids);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        case 'choice_create':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $cid = $svc->addChoice((int)$_POST['question_id'], trim($_POST['choice_text'] ?? ''), !empty($_POST['is_correct']));
            echo json_encode(['success'=>$cid>0,'id'=>$cid]);
            break;
        case 'choice_update':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $ok = $svc->updateChoice((int)$_POST['id'], ['choice_text'=>$_POST['choice_text'] ?? '', 'is_correct'=>!empty($_POST['is_correct'])]);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        case 'choice_delete':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $ok = $svc->deleteChoice((int)$_POST['id']);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        case 'choice_reorder':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $ids = json_decode($_POST['ordered_ids'] ?? '[]', true) ?: [];
            $ok = $svc->reorderChoices((int)$_POST['question_id'], $ids);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        case 'run_activity':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            
            // Rate limiting for run_activity
            $rateLimiter = new RateLimiter($db);
            $userId = $_SESSION['user_id'] ?? 'anonymous';
            $userIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $identifier = $userId . '_' . $userIp;
            
            // Allow 10 runs per minute per user+IP
            if (!$rateLimiter->isAllowed($identifier, 'run_activity', 10, 60)) {
                echo json_encode(['success'=>false,'message'=>'Rate limit exceeded. Please wait before running again.']);
                break;
            }
            
            $activityId = (int)($_POST['activity_id'] ?? 0);
            $source = (string)($_POST['source'] ?? '');
            $quick = !empty($_POST['quick']);
            if ($activityId <= 0 || $source === '') { echo json_encode(['success'=>false,'message'=>'Invalid payload']); break; }
            try {
                // Determine language from activity metadata in instructions JSON
                $act = $svc->getActivity($activityId);
                $jdoodleLanguage = 'cpp'; // default to C++
                if ($act && !empty($act['instructions'])) {
                    $meta = json_decode($act['instructions'], true);
                    if (is_array($meta)) {
                        $lang = strtolower(trim((string)($meta['language'] ?? '')));
                        if ($lang === 'java') { $jdoodleLanguage = 'java'; }
                        elseif ($lang === 'python' || $lang === 'py' || $lang === 'python3') { $jdoodleLanguage = 'python3'; }
                        elseif ($lang === 'c++' || $lang === 'cpp' || $lang === 'cxx') { $jdoodleLanguage = 'cpp'; }
                        else if ($lang !== '') {
                            echo json_encode(['success'=>false,'message'=>'Unsupported language. Allowed: Java, Python, C++.']);
                            break;
                        }
                    }
                }

                $tests = $svc->listTestCases($activityId);
                $sample = array_values(array_filter($tests, function($t){ return !empty($t['is_sample']); }));
                $cases = $sample ?: $tests;
                if ($quick && !empty($cases)) { $cases = [ $cases[0] ]; }
            $startTime = microtime(true);
            $result = $svc->runWithJDoodle($jdoodleLanguage, $source, $cases);
            $endTime = microtime(true);
            $duration = round(($endTime - $startTime) * 1000, 2);
            
            // Structured logging
            error_log(sprintf(
                "COORDINATOR_RUN: userId=%s, action=run_activity, activityId=%d, language=%s, cases_run=%d, duration=%sms, status=success",
                $_SESSION['user_id'] ?? 'unknown',
                $activityId,
                $jdoodleLanguage,
                count($cases),
                $duration
            ));
            
            // Record successful rate limit attempt
            $rateLimiter->recordAttempt($identifier, 'run_activity');
            
            echo json_encode(['success'=>true,'results'=>$result]);
            } catch (Throwable $e) {
                // Structured logging for errors
                error_log(sprintf(
                    "COORDINATOR_RUN: userId=%s, action=run_activity, activityId=%d, language=%s, cases_run=%d, duration=0ms, status=error, error=%s",
                    $_SESSION['user_id'] ?? 'unknown',
                    $activityId,
                    $jdoodleLanguage ?? 'unknown',
                    count($cases ?? []),
                    $e->getMessage()
                ));
                echo json_encode(['success'=>false,'message'=>'Run failed','error'=>$e->getMessage()]);
            }
            break;
        case 'run_snippet':
            // Allow any authenticated user to run small snippets (rate-limited)
            try {
                $rateLimiter = new RateLimiter($db);
                $userId = $_SESSION['user_id'] ?? 'anonymous';
                $userIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
                $identifier = $userId . '_' . $userIp;
                if (!$rateLimiter->isAllowed($identifier, 'run_snippet', 15, 60)) {
                    echo json_encode(['success'=>false,'message'=>'Rate limit exceeded. Please wait before running again.']);
                    break;
                }
                $language = strtolower(trim((string)($_POST['language'] ?? 'cpp')));
                $source = (string)($_POST['source'] ?? '');
                $stdin = (string)($_POST['stdin'] ?? '');
                if ($source === '') { echo json_encode(['success'=>false,'message'=>'No source provided']); break; }
                // Normalize language to jdoodle key
                $lang = 'cpp';
                if (in_array($language, ['cpp','c++','cxx'], true)) $lang = 'cpp';
                elseif (in_array($language, ['python','py','python3'], true)) $lang = 'python3';
                elseif ($language === 'java') $lang = 'java';
                else { echo json_encode(['success'=>false,'message'=>'Unsupported language']); break; }

                $cases = [['input_text'=>$stdin]];
                $startTime = microtime(true);
                $result = $svc->runWithJDoodle($lang, $source, $cases);
                $duration = (int)round((microtime(true)-$startTime)*1000);
                $rateLimiter->recordAttempt($identifier, 'run_snippet');
                echo json_encode(['success'=>true,'results'=>$result,'duration_ms'=>$duration]);
            } catch (Throwable $e) {
                echo json_encode(['success'=>false,'message'=>'Run failed','error'=>$e->getMessage()]);
            }
            break;
        // Coding test case actions
        case 'testcase_create':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $aid = (int)($_POST['activity_id'] ?? 0);
            $tcid = $svc->addTestCase($aid, !empty($_POST['is_sample']), $_POST['input_text'] ?? null, $_POST['expected_output_text'] ?? null, (int)($_POST['time_limit_ms'] ?? 2000));
            echo json_encode(['success'=>$tcid>0,'id'=>$tcid]);
            break;
        case 'testcase_update':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $ok = $svc->updateTestCase((int)$_POST['id'], [
                'is_sample' => !empty($_POST['is_sample']),
                'input_text' => $_POST['input_text'] ?? null,
                'expected_output_text' => $_POST['expected_output_text'] ?? null,
                'time_limit_ms' => (int)($_POST['time_limit_ms'] ?? 2000)
            ]);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        case 'testcase_delete':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $ok = $svc->deleteTestCase((int)$_POST['id']);
            if ($audit) { $audit->log($_SESSION['user_id'] ?? null, 'testcase.delete', 'activity_test_case', (string)($_POST['id'] ?? '')); }
            echo json_encode(['success'=>(bool)$ok]);
            break;
        case 'testcase_reorder':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $ids = json_decode($_POST['ordered_ids'] ?? '[]', true) ?: [];
            $ok = $svc->reorderTestCases((int)$_POST['activity_id'], $ids);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        case 'testcases_rebuild':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            $aid = (int)($_POST['activity_id'] ?? 0);
            $raw = $_POST['test_cases'] ?? '[]';
            $list = json_decode($raw, true);
            if ($aid <= 0 || !is_array($list)) { echo json_encode(['success'=>false,'message'=>'Invalid payload']); break; }
            
            // Validate test cases
            $testCaseErrors = validateTestCases($list);
            if (!empty($testCaseErrors)) {
                echo json_encode(['success'=>false,'message'=>'Test case validation failed: ' . implode(', ', $testCaseErrors)]);
                break;
            }
            try {
                $db->beginTransaction();
                $del = $db->prepare('DELETE FROM activity_test_cases WHERE activity_id=?');
                $del->execute([$aid]);
                $pos = 1;
                foreach ($list as $tc) {
                    $svc->addTestCase($aid, !empty($tc['is_sample']), (string)($tc['input_text'] ?? ''), (string)($tc['expected_output_text'] ?? ''), (int)($tc['time_limit_ms'] ?? 2000));
                    $pos++;
                }
                $db->commit();
                if ($audit) { $audit->log($_SESSION['user_id'] ?? null, 'testcase.rebuild', 'activity_test_case', (string)$aid, ['count'=>count($list)]); }
                echo json_encode(['success'=>true]);
            } catch (Throwable $e) {
                $db->rollBack();
                echo json_encode(['success'=>false,'message'=>'Rebuild failed','error'=>$e->getMessage()]);
            }
            break;
        case 'activity_sync':
            if (!$isCoordinator && !$isAdmin) { echo json_encode(['success'=>false,'message'=>'Forbidden']); break; }
            try {
                $db->beginTransaction();
                $raw = $_POST['activity'] ?? $_POST['payload'] ?? '';
                $data = is_array($raw) ? $raw : json_decode($raw, true);
                if (!is_array($data)) { throw new Exception('Invalid payload'); }
                $id = isset($data['id']) ? (int)$data['id'] : 0;
                $lessonId = (int)($data['lesson_id'] ?? 0);
                $type = (string)($data['type'] ?? 'multiple_choice');
                $title = trim((string)($data['title'] ?? ''));
                $instructions = $data['instructions'] ?? null;
                $maxScore = (int)($data['max_score'] ?? 100);

                if ($lessonId <= 0 || $title === '') { throw new Exception('Missing lesson_id or title'); }

                if ($id > 0) {
                    $svc->updateActivity($id, [
                        'title'=>$title,
                        'instructions'=>$instructions,
                        'type'=>$type,
                        'due_at'=>null,
                        'max_score'=>$maxScore,
                    ]);
                    $activityId = $id;
                } else {
                    $activityId = $svc->createActivity($lessonId, $title, $instructions, $type, null, $maxScore);
                    if ($activityId <= 0) { throw new Exception('Create failed'); }
                }

                $lower = strtolower($type);
                if ($lower === 'coding') {
                    // Replace test cases atomically
                    $tests = is_array($data['test_cases'] ?? null) ? $data['test_cases'] : [];
                    $del = $db->prepare('DELETE FROM activity_test_cases WHERE activity_id=?');
                    $del->execute([$activityId]);
                    foreach ($tests as $tc) {
                        $svc->addTestCase(
                            $activityId,
                            !empty($tc['is_sample']),
                            (string)($tc['input_text'] ?? $tc['input'] ?? ''),
                            (string)($tc['expected_output_text'] ?? $tc['output'] ?? ''),
                            (int)($tc['time_limit_ms'] ?? 2000)
                        );
                    }
                } elseif ($lower === 'upload_based') {
                    // Handle upload-based activities - store tasks as questions
                    $qs = is_array($data['questions'] ?? null) ? $data['questions'] : [];
                    $delQ = $db->prepare('DELETE FROM activity_questions WHERE activity_id=?');
                    $delQ->execute([$activityId]);
                    foreach ($qs as $q) {
                        $qid = $svc->addQuestion($activityId, trim((string)($q['text'] ?? '')), (int)($q['points'] ?? 1), (isset($q['explanation']) ? (string)$q['explanation'] : null));
                        if ($qid <= 0) continue;
                        // For upload-based, store file type and size requirements as choices
                        $acceptedFiles = is_array($q['acceptedFiles'] ?? null) ? $q['acceptedFiles'] : ['PDF','DOCX','JPG','PNG','TXT','XML'];
                        $maxFileSize = (int)($q['maxFileSize'] ?? 5);
                        $svc->addChoice($qid, 'acceptedFiles:' . implode(',', $acceptedFiles), true);
                        $svc->addChoice($qid, 'maxFileSize:' . $maxFileSize, true);
                    }
                } else {
                    // Replace questions and choices atomically
                    $qs = is_array($data['questions'] ?? null) ? $data['questions'] : [];
                    $delQ = $db->prepare('DELETE FROM activity_questions WHERE activity_id=?');
                    $delQ->execute([$activityId]);
                    // Determine quiz subtype if any
                    $kind = null;
                    if (!empty($instructions)) {
                        try { $insArr = is_array($instructions) ? $instructions : json_decode((string)$instructions, true); $kind = strtolower((string)($insArr['kind'] ?? '')); } catch (Throwable $e) { $kind = null; }
                    }
                    foreach ($qs as $q) {
                        $qid = $svc->addQuestion($activityId, trim((string)($q['text'] ?? '')), (int)($q['points'] ?? 1), (isset($q['explanation']) ? (string)$q['explanation'] : null));
                        if ($qid <= 0) continue;
                        $choices = is_array($q['choices'] ?? null) ? $q['choices'] : [];
                        if ($lower === 'multiple_choice' || ($lower === 'quiz' && ($kind === '' || $kind === 'multiple_choice'))) {
                            foreach ($choices as $c) {
                                $svc->addChoice($qid, trim((string)($c['text'] ?? 'Option')), !empty($c['is_correct']) || !empty($c['correct']));
                            }
                        } elseif ($lower === 'quiz' && $kind === 'identification') {
                            $ans = (string)($q['answer'] ?? '');
                            if ($ans === '' && !empty($choices)) {
                                foreach ($choices as $c) { if (!empty($c['is_correct']) || !empty($c['correct'])) { $ans = (string)($c['text'] ?? ''); break; } }
                            }
                            if ($ans !== '') { $svc->addChoice($qid, $ans, true); }
                        } elseif ($lower === 'quiz' && $kind === 'true_false') {
                            $ans = strtolower((string)($q['answer'] ?? ''));
                            if ($ans === '' && !empty($choices)) {
                                foreach ($choices as $c) { if (!empty($c['is_correct']) || !empty($c['correct'])) { $ans = strtolower((string)($c['text'] ?? '')); break; } }
                            }
                            $svc->addChoice($qid, 'True', $ans === 'true');
                            $svc->addChoice($qid, 'False', $ans === 'false');
                        } else {
                            // essay and other: no choices persisted by current schema
                        }
                    }
                }

                $db->commit();
                $full = $svc->getActivity($activityId);
                echo json_encode(['success'=>true,'id'=>$activityId,'data'=>$full]);
            } catch (Throwable $e) {
                try { $db->rollBack(); } catch (Throwable $r) {}
                echo json_encode(['success'=>false,'message'=>'Sync failed','error'=>$e->getMessage()]);
            }
            break;
        // seed_sample removed on request
        // Teachers feature removed
        default:
            echo json_encode(['success'=>false,'message'=>'Unknown action']);
    }
} catch (Throwable $e) {
    http_response_code(200);
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
?>


