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

$db = (new Database())->getConnection();
$sql = "SELECT COALESCE(status, 'Active') as status, COUNT(*) as count FROM users GROUP BY status";
$stmt = $db->prepare($sql);
$stmt->execute();
$result = $stmt->fetchAll(PDO::FETCH_ASSOC);

$stats = [];
foreach ($result as $row) {
    $stats[$row['status']] = (int)$row['count'];
}
echo json_encode($stats); 