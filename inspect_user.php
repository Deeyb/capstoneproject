<?php
require_once __DIR__ . '/config/Database.php';

$userId = $argc > 1 ? (int)$argv[1] : 21;

$db = (new Database())->getConnection();
$stmt = $db->prepare("SELECT id, firstname, lastname, role FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

print_r($user);




