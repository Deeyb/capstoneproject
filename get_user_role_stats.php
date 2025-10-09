<?php
session_start();
header('Content-Type: application/json');

// Admin-only
if (!isset($_SESSION['user_role']) || strtoupper($_SESSION['user_role']) !== 'ADMIN') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

require_once 'config/Database.php';
require_once 'classes/AdminService.php';

$db = (new Database())->getConnection();
$adminService = new AdminService($db);

// Output user role distribution as JSON
echo json_encode($adminService->getUserRoleDistribution()); 