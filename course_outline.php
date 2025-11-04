<?php
// Read-only Course Outline endpoint
// Returns: { success: true, data: [ { id, title, lessons: [{ materials:[...], activities:[...] }] }, ... ] }

// Robust session bootstrap (supports legacy and alt cookie names)
if (session_status() === PHP_SESSION_NONE) {
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

header('Content-Type: application/json');

try {
	if (empty($_SESSION['user_id'])) {
		echo json_encode(['success'=>false,'message'=>'Unauthorized']);
		exit;
	}

	require_once __DIR__ . '/config/Database.php';
	require_once __DIR__ . '/classes/CourseService.php';
	$db = (new Database())->getConnection();
	$svc = new CourseService($db);

	$courseId = (int)($_GET['course_id'] ?? 0);
	if ($courseId <= 0) {
		echo json_encode(['success'=>false,'message'=>'Invalid course_id']);
		exit;
	}

	$outline = $svc->getCourseOutline($courseId);
	// Enrich each lesson with materials and activities for coordinator modal
	foreach ($outline as &$module) {
		if (!isset($module['lessons']) || !is_array($module['lessons'])) continue;
		foreach ($module['lessons'] as &$lesson) {
			$lessonId = (int)($lesson['id'] ?? 0);
			if ($lessonId <= 0) { $lesson['materials'] = []; $lesson['activities'] = []; continue; }
			try { $lesson['materials'] = $svc->listMaterials($lessonId); } catch (Throwable $e) { $lesson['materials'] = []; }
			try { $lesson['activities'] = $svc->listActivities($lessonId); } catch (Throwable $e) { $lesson['activities'] = []; }
		}
	}
	unset($module); unset($lesson);

	echo json_encode(['success'=>true,'data'=>$outline]);
	exit;
} catch (Throwable $e) {
	http_response_code(200);
	echo json_encode(['success'=>false,'message'=>'Server error']);
}
