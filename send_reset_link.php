<?php
// send_reset_link.php
session_start();
require_once __DIR__ . '/classes/PasswordResetController.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $controller = new PasswordResetController();
    $result = $controller->sendResetLink($_POST);
    // AJAX response
    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
        header('Content-Type: application/json');
        echo json_encode($result);
        exit();
    }
    // Fallback: old behavior
    $_SESSION['forgot_feedback'] = $result['message'];
    header('Location: forgot_password.php');
    exit();
} else {
    header('Location: forgot_password.php');
    exit();
} 