<?php
session_start();
header('Content-Type: application/json');
require_once 'config/Database.php';
require_once 'classes/User.php';
require_once 'classes/LoginService.php';

$response = array('success' => false, 'message' => '', 'redirect' => '', 'errors' => array());

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $db = (new Database())->getConnection();
    $service = new LoginService($db);
    $response = $service->login($_POST);
}

echo json_encode($response); 