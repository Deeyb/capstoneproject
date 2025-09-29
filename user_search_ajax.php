<?php
session_start();
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/classes/auth_helpers.php';
Auth::requireAuth();
// Allow Admin or Coordinator to search
header('Content-Type: application/json');

try {
    $q = isset($_GET['q']) ? trim($_GET['q']) : '';
    $role = isset($_GET['role']) ? strtoupper(trim($_GET['role'])) : '';
    require_once __DIR__ . '/config/Database.php';
    require_once __DIR__ . '/classes/UserManager.php';
    $db = (new Database())->getConnection();
    $um = new UserManager($db);
    $limit = 25;
    $users = $um->getAllUsers($q, $role, '', 0, $limit, 'lastname', 'ASC');
    $data = array_map(function($u){
        return [
            'id' => (int)($u['id'] ?? 0),
            'firstname' => $u['firstname'] ?? '',
            'lastname' => $u['lastname'] ?? '',
            'email' => $u['email'] ?? '',
            'role' => $u['role'] ?? ''
        ];
    }, $users ?: []);
    echo json_encode(['success'=>true,'data'=>$data]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Server error']);
}
?>


