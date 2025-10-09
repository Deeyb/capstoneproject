<?php
// process_reset_password.php
session_start();
require_once 'classes/PasswordResetController.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $controller = new PasswordResetController();
    $result = $controller->handle($_POST);
    $_SESSION['reset_feedback'] = $result['feedback'];
    header('Location: reset_password.php?token=' . urlencode($result['token']));
    exit();
} else {
    header('Location: forgot_password.php');
    exit();
} 