<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
header('Content-Type: application/json');

require_once 'classes/RegistrationController.php';

$response = array('success' => false, 'message' => '', 'errors' => array());
$controller = new RegistrationController();

if (isset($_POST['check_id'])) {
    echo json_encode($controller->checkId($_POST['check_id']));
    exit();
}
if (isset($_POST['check_email'])) {
    echo json_encode($controller->checkEmail($_POST['check_email']));
    exit();
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $response = $controller->register($_POST);
}
echo json_encode($response);
?> 