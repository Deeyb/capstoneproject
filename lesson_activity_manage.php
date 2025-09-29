<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/classes/auth_helpers.php';
if (session_status() === PHP_SESSION_NONE) {
    // Ensure we use the same session as the app to avoid cookie mismatches
    $preferred = 'CodeRegalSession';
    $legacy = 'PHPSESSID';
    if (!empty($_COOKIE[$preferred])) { session_name($preferred); }
    elseif (!empty($_COOKIE[$legacy])) { session_name($legacy); }
    else { session_name($preferred); }
    session_start();
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
// Avoid redirects for AJAX: manual auth check
if (empty($_SESSION['user_id'])) {
  header('Content-Type: application/json');
  header('Cache-Control: no-store');
  echo json_encode(['success'=>false,'message'=>'Unauthorized']);
  exit;
}
header('Content-Type: application/json');
header('Cache-Control: no-store');
if (function_exists('ob_get_level')) { while (ob_get_level() > 0) { @ob_end_clean(); } }

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['success'=>false,'message'=>'Invalid request']); exit; }
    require_once __DIR__ . '/config/Database.php';
    require_once __DIR__ . '/classes/CourseService.php';
    $db = (new Database())->getConnection();

    // Role check (allow coordinator and admin)
    $roleStmt = $db->prepare("SELECT LOWER(TRIM(role)) FROM users WHERE id=? LIMIT 1");
    $roleStmt->execute([$_SESSION['user_id'] ?? null]);
    $role = $roleStmt->fetchColumn() ?: '';
    if ($role !== 'coordinator' && $role !== 'admin') {
      http_response_code(403);
      echo json_encode(['success'=>false,'message'=>'Forbidden']);
      exit;
    }

    // Safer PDO error mode
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $svc = new CourseService($db);

    $action = $_POST['action'] ?? '';
    switch ($action) {
        case 'activity_create': {
            $lessonId = (int)($_POST['lesson_id'] ?? 0);
            $title = trim($_POST['title'] ?? '');
            $type = $_POST['type'] ?? 'lecture';
            // Pre-check: lesson must exist
            $chk = $db->prepare('SELECT id FROM course_lessons WHERE id = ? LIMIT 1');
            $chk->execute([$lessonId]);
            if (!$chk->fetchColumn()) { echo json_encode(['success'=>false,'message'=>'Lesson not found','debug'=>['lesson_id'=>$lessonId]]); break; }
            try {
              $id = $svc->createActivity($lessonId, $title, $_POST['instructions'] ?? null, $type, $_POST['due_at'] ?? null, (int)($_POST['max_score'] ?? 100));
              if ($id > 0) {
                  echo json_encode(['success'=>true,'id'=>$id]);
              } else {
                  echo json_encode(['success'=>false,'message'=>'Create failed','debug'=>['lesson_id'=>$lessonId,'type'=>$type,'title'=>$title]]);
              }
            } catch (Throwable $e) {
              echo json_encode(['success'=>false,'message'=>'DB error','debug'=>['error'=>$e->getMessage(),'lesson_id'=>$lessonId,'type'=>$type]]);
            }
            break;
        }
        case 'activity_update': {
            $ok = $svc->updateActivity((int)$_POST['id'], [
                'title' => $_POST['title'] ?? '',
                'instructions' => $_POST['instructions'] ?? null,
                'type' => $_POST['type'] ?? 'lecture',
                'due_at' => $_POST['due_at'] ?? null,
                'max_score' => (int)($_POST['max_score'] ?? 100)
            ]);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        }
        case 'activity_delete': {
            $ok = $svc->deleteActivity((int)$_POST['id']);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        }
        case 'activity_reorder': {
            $ids = json_decode($_POST['ordered_ids'] ?? '[]', true) ?: [];
            $ok = $svc->reorderActivities((int)$_POST['lesson_id'], $ids);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        }
        case 'case_create': {
            $id = $svc->addTestCase((int)$_POST['activity_id'], !empty($_POST['is_sample']), $_POST['input_text'] ?? null, $_POST['expected_output_text'] ?? null, (int)($_POST['time_limit_ms'] ?? 2000));
            echo json_encode(['success'=>$id>0,'id'=>$id]);
            break;
        }
        case 'case_update': {
            $ok = $svc->updateTestCase((int)$_POST['id'], [
                'is_sample' => !empty($_POST['is_sample']),
                'input_text' => $_POST['input_text'] ?? null,
                'expected_output_text' => $_POST['expected_output_text'] ?? null,
                'time_limit_ms' => (int)($_POST['time_limit_ms'] ?? 2000)
            ]);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        }
        case 'case_delete': {
            $ok = $svc->deleteTestCase((int)$_POST['id']);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        }
        case 'case_reorder': {
            $ids = json_decode($_POST['ordered_ids'] ?? '[]', true) ?: [];
            $ok = $svc->reorderTestCases((int)$_POST['activity_id'], $ids);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        }
        case 'run_activity': {
            $activityId = (int)($_POST['activity_id'] ?? 0);
            $source = (string)($_POST['source'] ?? '');
            if ($activityId <= 0 || $source === '') { echo json_encode(['success'=>false,'message'=>'Invalid payload']); break; }
            // Get test cases for activity
            $tests = $svc->listTestCases($activityId);
            // Prefer sample tests for Run, all tests later for Submit (future)
            $sample = array_values(array_filter($tests, function($t){ return !empty($t['is_sample']); }));
            $cases = $sample ?: $tests;
            // Default to C++ for this endpoint
            $result = $svc->runCppWithJDoodle($source, $cases);
            echo json_encode(['success'=>true,'results'=>$result]);
            break;
        }
        case 'activity_get': {
            $act = $svc->getActivity((int)($_POST['id'] ?? 0));
            echo json_encode(['success'=> (bool)$act, 'data'=> $act]);
            break;
        }
        // === MCQ CRUD ===
        case 'question_create': {
            $id = $svc->addQuestion((int)$_POST['activity_id'], trim($_POST['question_text'] ?? ''), (int)($_POST['points'] ?? 1));
            echo json_encode(['success'=>$id>0,'id'=>$id]);
            break;
        }
        case 'question_update': {
            $ok = $svc->updateQuestion((int)$_POST['id'], [
                'question_text' => $_POST['question_text'] ?? '',
                'points' => (int)($_POST['points'] ?? 1)
            ]);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        }
        case 'question_delete': {
            $ok = $svc->deleteQuestion((int)$_POST['id']);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        }
        case 'question_reorder': {
            $ids = json_decode($_POST['ordered_ids'] ?? '[]', true) ?: [];
            $ok = $svc->reorderQuestions((int)$_POST['activity_id'], $ids);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        }
        case 'choice_create': {
            $id = $svc->addChoice((int)$_POST['question_id'], trim($_POST['choice_text'] ?? ''), !empty($_POST['is_correct']));
            echo json_encode(['success'=>$id>0,'id'=>$id]);
            break;
        }
        case 'choice_update': {
            $ok = $svc->updateChoice((int)$_POST['id'], [
                'choice_text' => $_POST['choice_text'] ?? '',
                'is_correct' => !empty($_POST['is_correct'])
            ]);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        }
        case 'choice_delete': {
            $ok = $svc->deleteChoice((int)$_POST['id']);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        }
        case 'choice_reorder': {
            $ids = json_decode($_POST['ordered_ids'] ?? '[]', true) ?: [];
            $ok = $svc->reorderChoices((int)$_POST['question_id'], $ids);
            echo json_encode(['success'=>(bool)$ok]);
            break;
        }
        default:
            echo json_encode(['success'=>false,'message'=>'Unknown action']);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Server error']);
}
?>


