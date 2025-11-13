<?php
/**
 * Fix Student Status Default
 * Ensures new students get 'pending' status by default
 */

require_once __DIR__ . '/config/Database.php';

try {
    $db = (new Database())->getConnection();
    
    // Check if column exists
    $checkStmt = $db->query("SHOW COLUMNS FROM class_students LIKE 'status'");
    if ($checkStmt->rowCount() === 0) {
        echo "❌ Status column does not exist. Please run add_student_status_field.php first.\n";
        exit(1);
    }
    
    // Force set DEFAULT to 'pending'
    $db->exec("
        ALTER TABLE class_students 
        MODIFY COLUMN status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending'
    ");
    
    echo "✅ Successfully set DEFAULT to 'pending' for status column.\n";
    echo "✅ New students joining will now have 'pending' status by default.\n";
    
    // Verify
    $verifyStmt = $db->query("SHOW COLUMNS FROM class_students WHERE Field = 'status'");
    $col = $verifyStmt->fetch(PDO::FETCH_ASSOC);
    echo "✅ Verified: Default is now '" . ($col['Default'] ?? 'NULL') . "'\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>


