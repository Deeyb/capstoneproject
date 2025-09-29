<?php
require_once __DIR__ . '/classes/EnvironmentLoader.php';
EnvironmentLoader::load();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
ob_start(); // Start output buffering for debug
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/classes/VerificationController.php';

$response = array('success' => false, 'message' => '', 'errors' => array(), 'debug' => array());

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $controller = new VerificationController();
    $response = $controller->sendVerification($_POST);
}

$response['debug']['session'] = $_SESSION;
// Log any output before JSON for debugging
// file_put_contents(__DIR__ . '/last_output.txt', ob_get_contents());
echo json_encode($response);

/**
 * Get client IP address
 * @return string
 */
function getClientIP() {
    $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
    
    foreach ($ipKeys as $key) {
        if (isset($_SERVER[$key])) {
            $ip = $_SERVER[$key];
            if (strpos($ip, ',') !== false) {
                $ip = trim(explode(',', $ip)[0]);
            }
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}
?> 