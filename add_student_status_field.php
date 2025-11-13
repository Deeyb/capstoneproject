<?php
/**
 * Migration Script: Add status field to class_students table
 * Run this once to add the status column
 */

require_once __DIR__ . '/config/Database.php';

try {
    $db = (new Database())->getConnection();
    
    // Check if column already exists
    $checkStmt = $db->query("SHOW COLUMNS FROM class_students LIKE 'status'");
    if ($checkStmt->rowCount() > 0) {
        echo "Status column already exists. No changes needed.\n";
        exit;
    }
    
    // Add status column with DEFAULT 'pending'
    $db->exec("
        ALTER TABLE class_students 
        ADD COLUMN status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending' 
        AFTER student_user_id
    ");
    
    // Update existing records to 'accepted' (for backward compatibility)
    // Only update records that were created BEFORE this migration
    $db->exec("
        UPDATE class_students 
        SET status = 'accepted' 
        WHERE status = 'pending' OR status IS NULL
    ");
    
    // CRITICAL: Ensure DEFAULT is set to 'pending' for new records
    // Some MySQL versions might not respect the DEFAULT in ALTER TABLE
    $db->exec("
        ALTER TABLE class_students 
        ALTER COLUMN status SET DEFAULT 'pending'
    ");
    
    echo "✅ Successfully added status column to class_students table.\n";
    echo "✅ Existing records set to 'accepted' for backward compatibility.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>

