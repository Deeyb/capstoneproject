<?php
// Read-only Course Outline endpoint
// Returns: { success: true, data: [ { id, title, lessons: [{ materials:[...], activities:[...] }] }, ... ] }

// CRITICAL: Start output buffering FIRST to prevent any output before JSON
ob_start();

// CRITICAL: Set error reporting to prevent any output before JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// CRITICAL: Set session path BEFORE any session_start() calls
$sessionPath = __DIR__ . '/sessions';
if (!is_dir($sessionPath)) {
    @mkdir($sessionPath, 0777, true);
}
if (is_dir($sessionPath) && is_writable($sessionPath)) {
    ini_set('session.save_path', $sessionPath);
}

// Robust session bootstrap (supports legacy and alt cookie names)
if (session_status() === PHP_SESSION_NONE) {
	$preferred = 'CodeRegalSession';
	$legacy = 'PHPSESSID';
	if (!empty($_COOKIE[$preferred])) { session_name($preferred); }
	elseif (!empty($_COOKIE[$legacy])) { session_name($legacy); }
	else { session_name($preferred); }
	@session_start();
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

// CRITICAL: Clean any output that might have been generated
$obContent = ob_get_clean();
if (!empty($obContent) && trim($obContent) !== '') {
    error_log("course_outline.php - Unexpected output before JSON: " . substr($obContent, 0, 500));
    ob_start();
}

// CRITICAL: Set JSON header AFTER output buffering
header('Content-Type: application/json; charset=utf-8');

try {
	if (empty($_SESSION['user_id'])) {
        // Clean output before sending response
        while (ob_get_level()) {
            ob_end_clean();
        }
		echo json_encode(['success'=>false,'message'=>'Unauthorized']);
		exit;
	}

	require_once __DIR__ . '/config/Database.php';
	require_once __DIR__ . '/classes/ActivityAttemptService.php';
	require_once __DIR__ . '/classes/CourseService.php';
	
	// Clean any output from includes
	$obContent = ob_get_clean();
	if (!empty($obContent) && trim($obContent) !== '') {
        error_log("course_outline.php - Unexpected output from includes: " . substr($obContent, 0, 500));
        ob_start();
    }
	
	$db = (new Database())->getConnection();
	if (!$db) {
        while (ob_get_level()) {
            ob_end_clean();
        }
        error_log("course_outline.php - Database connection failed");
		echo json_encode(['success'=>false,'message'=>'Database connection failed']);
		exit;
	}
	
	$svc = new CourseService($db);

	$courseId = (int)($_GET['course_id'] ?? 0);
	if ($courseId <= 0) {
        while (ob_get_level()) {
            ob_end_clean();
        }
        error_log("course_outline.php - Invalid course_id: " . ($_GET['course_id'] ?? 'null'));
		echo json_encode(['success'=>false,'message'=>'Invalid course_id']);
		exit;
	}

	error_log("course_outline.php - Fetching outline for course_id: " . $courseId);
	$outline = $svc->getCourseOutline($courseId);
	
	if (!is_array($outline)) {
        error_log("course_outline.php - getCourseOutline returned non-array: " . gettype($outline));
        $outline = [];
    }
	
	error_log("course_outline.php - Found " . count($outline) . " modules");
	
	// Enrich each lesson with materials and activities for coordinator modal
	foreach ($outline as &$module) {
		if (!isset($module['lessons']) || !is_array($module['lessons'])) continue;
		foreach ($module['lessons'] as &$lesson) {
			$lessonId = (int)($lesson['id'] ?? 0);
			if ($lessonId <= 0) { $lesson['materials'] = []; $lesson['activities'] = []; continue; }
			try { $lesson['materials'] = $svc->listMaterials($lessonId); } catch (Throwable $e) { 
                error_log("course_outline.php - Error loading materials for lesson $lessonId: " . $e->getMessage());
                $lesson['materials'] = []; 
            }
			try { $lesson['activities'] = $svc->listActivities($lessonId); } catch (Throwable $e) { 
                error_log("course_outline.php - Error loading activities for lesson $lessonId: " . $e->getMessage());
                $lesson['activities'] = []; 
            }
		}
	}
	unset($module); unset($lesson);

	// CRITICAL: Clean ALL output buffers before sending JSON
	while (ob_get_level()) {
		ob_end_clean();
	}
	
	error_log("course_outline.php - Returning success with " . count($outline) . " modules");
	echo json_encode(['success'=>true,'data'=>$outline]);
	exit;
} catch (Throwable $e) {
	error_log("course_outline.php - Exception: " . $e->getMessage());
	error_log("course_outline.php - Stack: " . $e->getTraceAsString());
	
	// CRITICAL: Clean ALL output buffers before sending error response
	while (ob_get_level()) {
		ob_end_clean();
	}
	
	http_response_code(200);
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode(['success'=>false,'message'=>'Server error: ' . $e->getMessage()]);
	exit;
}
