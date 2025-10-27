<?php
/**
 * CHECK EMAIL EXISTS API - OOP Version
 * Checks if an email exists in the system
 */
header('Content-Type: application/json');
require_once 'config/Database.php';
require_once 'classes/EmailService.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new InvalidArgumentException('Invalid request method');
    }
    
    $email = trim($_POST['email'] ?? '');
    
    // Initialize database and service
    $db = (new Database())->getConnection();
    $emailService = new EmailService($db);
    
    // Check email using OOP service
    $result = $emailService->checkEmailExists($email);
    
    echo json_encode([
        'exists' => $result['exists'],
        'message' => $result['exists'] ? 'Email found' : 'Email not found',
        'user' => $result['user']
    ]);
    
} catch (InvalidArgumentException $e) {
    echo json_encode([
        'exists' => false,
        'message' => $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'exists' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?> 