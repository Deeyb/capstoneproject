<?php
require_once __DIR__ . '/config/Database.php';

$classId = $argc > 1 ? (int)$argv[1] : 22;

$db = (new Database())->getConnection();
$stmt = $db->prepare("SELECT id, name, owner_user_id FROM classes WHERE id = ?");
$stmt->execute([$classId]);
$class = $stmt->fetch(PDO::FETCH_ASSOC);

print_r($class);




