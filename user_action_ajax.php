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
require_once __DIR__ . '/classes/RateLimiter.php';

header('Content-Type: application/json');

$db = (new Database())->getConnection();
$user = new User($db);
$rateLimiter = new RateLimiter($db);

// Helper function to get client IP
function getClientIP() {
    $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

// PUBLIC ENDPOINTS - Allow ID and email checks during registration (no auth required)
// SECURITY: Rate limited to prevent enumeration attacks
// Check ID number uniqueness (AJAX) - PUBLIC for registration
if (isset($_POST['check_id'])) {
    $clientIP = getClientIP();
    
    // Rate limiting: Max 20 checks per minute per IP to prevent abuse
    if (!$rateLimiter->isAllowed($clientIP, 'id_check', 20, 60)) {
        http_response_code(429); // Too Many Requests
        echo json_encode(['error' => 'Too many requests. Please wait a moment and try again.']);
        exit();
    }
    
    $rateLimiter->recordAttempt($clientIP, 'id_check');
    
    $idNumber = trim($_POST['check_id'] ?? '');
    if (empty($idNumber)) {
        echo json_encode(['id_used' => false, 'error' => 'ID number is required']);
        exit();
    }
    
    // Validate format before checking database
    if (!preg_match('/^KLD-\d{2}-\d{6}$/', $idNumber)) {
        echo json_encode(['id_used' => false, 'error' => 'Invalid ID format']);
        exit();
    }
    
    $user->setIdNumber($idNumber);
    $used = $user->idNumberExists();
    error_log('🔍 [ID Check] IP: ' . $clientIP . ' | ID: "' . $idNumber . '" - Used: ' . ($used ? 'YES' : 'NO'));
    echo json_encode(['id_used' => $used]);
    exit();
}

// Check email uniqueness (AJAX) - PUBLIC for registration
if (isset($_POST['check_email'])) {
    $clientIP = getClientIP();
    
    // Rate limiting: Max 20 checks per minute per IP to prevent abuse
    if (!$rateLimiter->isAllowed($clientIP, 'email_check', 20, 60)) {
        http_response_code(429); // Too Many Requests
        echo json_encode(['error' => 'Too many requests. Please wait a moment and try again.']);
        exit();
    }
    
    $rateLimiter->recordAttempt($clientIP, 'email_check');
    
    $email = trim($_POST['check_email'] ?? '');
    if (empty($email)) {
        echo json_encode(['email_used' => false, 'error' => 'Email is required']);
        exit();
    }
    
    // Validate format before checking database
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['email_used' => false, 'error' => 'Invalid email format']);
        exit();
    }
    
    $user->setEmail($email);
    $used = $user->emailExists();
    error_log('🔍 [Email Check] IP: ' . $clientIP . ' | Email: "' . $email . '" - Used: ' . ($used ? 'YES' : 'NO'));
    echo json_encode(['email_used' => $used]);
    exit();
}

// ADMIN-ONLY ENDPOINTS - Require admin authentication for other actions
$isAdmin = false;
if (isset($_SESSION['user_role']) && strtoupper($_SESSION['user_role']) === 'ADMIN') {
    $isAdmin = true;
}
if (!$isAdmin) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$adminService = new AdminService($db);
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

echo json_encode(['error' => 'Invalid request']); 