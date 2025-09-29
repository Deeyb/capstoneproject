<?php
// Set timezone to Philippines
date_default_timezone_set('Asia/Manila');

// Initialize security configuration
require_once __DIR__ . '/classes/SecurityConfig.php';
SecurityConfig::initialize();

// Database configuration (loaded from environment with fallbacks)
$db_host = SecurityConfig::get('DB_HOST', 'localhost');
$db_user = SecurityConfig::get('DB_USER', 'root');
$db_pass = SecurityConfig::get('DB_PASS', '');
$db_name = SecurityConfig::get('DB_NAME', 'coderegal_db');

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset to utf8mb4
$conn->set_charset("utf8mb4");

// Remember Me auto-login logic
if (!isset($_SESSION['user_id']) && isset($_COOKIE['remember_token'])) {
    require_once __DIR__ . '/config/Database.php';
    $db = (new Database())->getConnection();
    $token = $_COOKIE['remember_token'];
    $stmt = $db->prepare("SELECT user_id FROM remember_me_tokens WHERE token = ? AND expires_at > NOW()");
    $stmt->execute([$token]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        $_SESSION['user_id'] = $row['user_id'];
        // Optionally, refresh the token for security (not required for basic functionality)
    }
}
?> 