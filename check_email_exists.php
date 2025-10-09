<?php
header('Content-Type: application/json');
require_once 'config/Database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $email = trim($_POST['email'] ?? '');
        
        if (empty($email)) {
            echo json_encode(['exists' => false, 'message' => 'Email is required']);
            exit;
        }
        
        // Check if email exists in users table
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            echo json_encode(['exists' => true, 'message' => 'Email found']);
        } else {
            echo json_encode(['exists' => false, 'message' => 'Email not found']);
        }
        
        $stmt->close();
    } else {
        echo json_encode(['exists' => false, 'message' => 'Invalid request method']);
    }
    
} catch (Exception $e) {
    echo json_encode(['exists' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?> 