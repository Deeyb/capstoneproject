<?php
/**
 * CREATE CERTIFICATES TABLE
 * Creates a table to store certificate records with unique serial numbers
 */

require_once __DIR__ . '/config/Database.php';

try {
    $db = (new Database())->getConnection();
    
    // Create certificates table
    $db->exec("
        CREATE TABLE IF NOT EXISTS certificates (
            id INT AUTO_INCREMENT PRIMARY KEY,
            serial_number VARCHAR(50) NOT NULL UNIQUE,
            user_id INT NOT NULL,
            course_id INT NOT NULL,
            class_id INT NOT NULL,
            student_name VARCHAR(255) NOT NULL,
            course_title VARCHAR(255) NOT NULL,
            issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_course_id (course_id),
            INDEX idx_class_id (class_id),
            INDEX idx_serial_number (serial_number),
            INDEX idx_issued_at (issued_at),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
            FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    echo "Certificates table created successfully!\n";
    
} catch (Exception $e) {
    echo "Error creating certificates table: " . $e->getMessage() . "\n";
    exit(1);
}
?>

