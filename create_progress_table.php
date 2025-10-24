<?php
/**
 * CREATE PROGRESS TABLE
 * Creates the activity_progress table to store student progress
 */
require_once __DIR__ . '/config/Database.php';

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        throw new Exception('Database connection failed');
    }
    
    // Create activity_progress table
    $sql = "
        CREATE TABLE IF NOT EXISTS activity_progress (
            id INT AUTO_INCREMENT PRIMARY KEY,
            activity_id INT NOT NULL,
            user_id INT NOT NULL,
            answers JSON,
            progress_percentage INT DEFAULT 0,
            last_updated DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_activity_user (activity_id, user_id),
            INDEX idx_activity_id (activity_id),
            INDEX idx_user_id (user_id),
            INDEX idx_progress_percentage (progress_percentage)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ";
    
    $result = $db->exec($sql);
    
    if ($result !== false) {
        echo "✅ Table 'activity_progress' created successfully!\n";
        echo "📊 Table structure:\n";
        echo "- id: Primary key\n";
        echo "- activity_id: Activity being attempted\n";
        echo "- user_id: Student attempting the activity\n";
        echo "- answers: JSON of student answers\n";
        echo "- progress_percentage: Completion percentage (0-100)\n";
        echo "- last_updated: When progress was last saved\n";
        echo "- created_at: When record was first created\n";
        echo "- updated_at: When record was last updated\n";
    } else {
        throw new Exception('Failed to create table');
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

