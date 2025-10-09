<?php
session_start();
require_once 'config/Database.php';
require_once 'classes/LoginService.php';

$db = (new Database())->getConnection();
$service = new LoginService($db);
$result = $service->logout();

header("Location: " . $result['redirect']);
exit();
?> 