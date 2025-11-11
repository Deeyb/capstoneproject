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

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/AdminService.php';
require_once __DIR__ . '/classes/User.php';
require_once __DIR__ . '/classes/AuditLogService.php';
require_once __DIR__ . '/classes/PasswordResetController.php';

header('Content-Type: application/json');

$isAdmin = false;
if (isset($_SESSION['user_role']) && strtoupper($_SESSION['user_role']) === 'ADMIN') {
    $isAdmin = true;
}
if (!$isAdmin) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$db = (new Database())->getConnection();
$adminService = new AdminService($db);
$user = new User($db);
$audit = new AuditLogService($db);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    // Handle send reset password
    if ($_POST['action'] === 'send_reset_password') {
        $email = $_POST['email'] ?? '';
        if (empty($email)) {
            echo json_encode(['success' => false, 'message' => 'Email is required']);
            exit;
        }
        
        $controller = new PasswordResetController();
        $result = $controller->sendResetLink(['email' => $email]);
        
        // Log the action
        $audit->log(
            $_SESSION['user_id'] ?? null,
            'user.send_reset_password',
            'user',
            $email,
            ['admin_initiated' => true]
        );
        
        echo json_encode($result);
        exit;
    }
    
    // Handle bulk archive/unarchive
    if (isset($_POST['action']) && in_array($_POST['action'], ['bulk_archive','bulk_unarchive'], true)) {
        $payload = json_decode($_POST['id_numbers'] ?? '[]', true) ?: [];
        if (!is_array($payload)) { $payload = []; }
        foreach ($payload as $idnum) {
            if ($_POST['action'] === 'bulk_archive') {
                $adminService->archiveUser($idnum);
                $audit->log($_SESSION['user_id'] ?? null, 'user.bulk_archive', 'user', $idnum);
            } else {
                $adminService->unarchiveUser($idnum);
                $audit->log($_SESSION['user_id'] ?? null, 'user.bulk_unarchive', 'user', $idnum);
            }
        }
        echo json_encode(['success' => true]);
        exit;
    }

    $result = $adminService->handleUserAction($_POST);
    // Best-effort audit based on action
    $action = $_POST['action'] ?? '';
    $targetId = $_POST['id'] ?? null;
    $idNumber = $_POST['id_number'] ?? null;
    $email = $_POST['email'] ?? null;
    $audit->log(
        $_SESSION['user_id'] ?? null,
        'user.' . $action,
        'user',
        (string)($targetId ?: $idNumber ?: $email ?: ''),
        ['payload_keys' => array_keys($_POST)]
    );
    if ($result !== null) {
        echo $result;
        exit;
    }
}

// Check ID number uniqueness (AJAX)
if (isset($_POST['check_id'])) {
    $user->setIdNumber($_POST['check_id']);
    $used = $user->idNumberExists();
    echo json_encode(['id_used' => $used]);
    exit();
}

// Check email uniqueness (AJAX)
if (isset($_POST['check_email'])) {
    $user->setEmail($_POST['check_email']);
    $used = $user->emailExists();
    echo json_encode(['email_used' => $used]);
    exit();
}

echo json_encode(['error' => 'Invalid request']); 