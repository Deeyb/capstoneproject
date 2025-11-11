<?php
// CRITICAL: Set session path BEFORE any session_start() calls
$sessionPath = __DIR__ . '/sessions';
if (!is_dir($sessionPath)) {
    @mkdir($sessionPath, 0777, true);
}
if (is_dir($sessionPath) && is_writable($sessionPath)) {
    ini_set('session.save_path', $sessionPath);
}

// Set session name before starting
if (session_status() === PHP_SESSION_NONE) {
    $preferred = 'CodeRegalSession';
    $legacy = 'PHPSESSID';
    if (!empty($_COOKIE[$preferred])) { 
        session_name($preferred); 
    } elseif (!empty($_COOKIE[$legacy])) { 
        session_name($legacy); 
    } else { 
        session_name($preferred); 
    }
    @session_start();
}

header('Content-Type: application/json');

try {
    if (!isset($_SESSION['user_role']) || strtoupper($_SESSION['user_role']) !== 'COORDINATOR') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }

    require_once __DIR__ . '/config/Database.php';
    require_once __DIR__ . '/classes/CoordinatorService.php';

    $db = (new Database())->getConnection();
    $service = new CoordinatorService($db);

    $roles = ['STUDENT', 'TEACHER'];
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $rows = $service->getRecentRegistrationsByRoles($roles, $limit);

    $response = array_map(function($u){
        $lastname = $u['lastname'] ?? '';
        $firstname = $u['firstname'] ?? '';
        $middlename = $u['middlename'] ?? '';
        $mi = $middlename ? strtoupper(mb_substr(trim($middlename), 0, 1)).'.' : '';
        return [
            'name' => trim($lastname . ', ' . $firstname . ' ' . $mi),
            'role' => $u['role'] ?? '',
            'time' => isset($u['created_at']) ? date('M j, Y g:i A', strtotime($u['created_at'])) : ''
        ];
    }, $rows);

    echo json_encode(['success' => true, 'data' => $response]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>


