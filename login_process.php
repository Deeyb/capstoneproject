<?php
/**
 * UNIFIED LOGIN PROCESS
 * Now uses the unified system for consistent authentication
 */
// Suppress all output except JSON
ob_start();

session_start();
header('Content-Type: application/json');
require_once 'config/Database.php';
require_once 'classes/User.php';
require_once 'classes/LoginService.php';

$response = array('success' => false, 'message' => '', 'redirect' => '', 'errors' => array());

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $db = (new Database())->getConnection();
        $service = new LoginService($db);
        $response = $service->login($_POST);
    } catch (Throwable $e) {
        $response = array(
            'success' => false, 
            'message' => 'Login failed. Please try again.',
            'redirect' => '',
            'errors' => array()
        );
        error_log('Login error: ' . $e->getMessage());
    }
}

// Clear any output buffer and send clean JSON
ob_clean();
echo json_encode($response);
exit; 