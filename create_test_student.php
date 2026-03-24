<?php
/**
 * CREATE TEST STUDENT ACCOUNT
 * Creates a test student account for testing purposes (bypasses email verification)
 * 
 * Usage: Run this file in browser or via command line
 * Example: z
 */

require_once __DIR__ . '/config/Database.php';

// Test account details (you can modify these)
$testStudent = [
    'firstname' => 'Test',
    'middlename' => 'Student',
    'lastname' => 'Account',
    'id_number' => 'KLD-25-999999', // Format: KLD-YY-XXXXXX
    'email' => 'test.student@kld.edu.ph', // Must end with @kld.edu.ph
    'password' => 'Test1234!', // Must meet password requirements
    'role' => 'Student'
];

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        throw new Exception('Database connection failed');
    }
    
    // Check if user already exists
    $checkStmt = $db->prepare("SELECT id, email, id_number FROM users WHERE email = ? OR id_number = ?");
    $checkStmt->execute([$testStudent['email'], $testStudent['id_number']]);
    $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existing) {
        echo "<h2>⚠️ Test Student Account Already Exists</h2>";
        echo "<p><strong>Account Details:</strong></p>";
        echo "<ul>";
        echo "<li><strong>ID:</strong> " . htmlspecialchars($existing['id']) . "</li>";
        echo "<li><strong>Email:</strong> " . htmlspecialchars($existing['email']) . "</li>";
        echo "<li><strong>ID Number:</strong> " . htmlspecialchars($existing['id_number']) . "</li>";
        echo "</ul>";
        echo "<p>You can use this account to login:</p>";
        echo "<ul>";
        echo "<li><strong>Email:</strong> " . htmlspecialchars($testStudent['email']) . "</li>";
        echo "<li><strong>Password:</strong> " . htmlspecialchars($testStudent['password']) . "</li>";
        echo "</ul>";
        exit;
    }
    
    // Hash password
    $hashedPassword = password_hash($testStudent['password'], PASSWORD_DEFAULT, ['cost' => 12]);
    
    // Insert test student account
    $stmt = $db->prepare("
        INSERT INTO users (
            firstname, 
            middlename, 
            lastname, 
            id_number, 
            email, 
            password, 
            role, 
            status,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', NOW())
    ");
    
    $result = $stmt->execute([
        $testStudent['firstname'],
        $testStudent['middlename'],
        $testStudent['lastname'],
        $testStudent['id_number'],
        $testStudent['email'],
        $hashedPassword,
        $testStudent['role']
    ]);
    
    if ($result) {
        $userId = $db->lastInsertId();
        
        echo "<h2>✅ Test Student Account Created Successfully!</h2>";
        echo "<div style='background:#d4edda;border:1px solid #c3e6cb;border-radius:8px;padding:20px;margin:20px 0;'>";
        echo "<h3>Account Details:</h3>";
        echo "<ul style='list-style:none;padding:0;'>";
        echo "<li style='margin:10px 0;'><strong>User ID:</strong> " . htmlspecialchars($userId) . "</li>";
        echo "<li style='margin:10px 0;'><strong>Name:</strong> " . htmlspecialchars($testStudent['firstname'] . ' ' . $testStudent['middlename'] . ' ' . $testStudent['lastname']) . "</li>";
        echo "<li style='margin:10px 0;'><strong>ID Number:</strong> " . htmlspecialchars($testStudent['id_number']) . "</li>";
        echo "<li style='margin:10px 0;'><strong>Email:</strong> " . htmlspecialchars($testStudent['email']) . "</li>";
        echo "<li style='margin:10px 0;'><strong>Role:</strong> " . htmlspecialchars($testStudent['role']) . "</li>";
        echo "</ul>";
        echo "</div>";
        
        echo "<div style='background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:20px;margin:20px 0;'>";
        echo "<h3>🔐 Login Credentials:</h3>";
        echo "<ul style='list-style:none;padding:0;'>";
        echo "<li style='margin:10px 0;'><strong>Email:</strong> <code style='background:#f8f9fa;padding:4px 8px;border-radius:4px;'>" . htmlspecialchars($testStudent['email']) . "</code></li>";
        echo "<li style='margin:10px 0;'><strong>Password:</strong> <code style='background:#f8f9fa;padding:4px 8px;border-radius:4px;'>" . htmlspecialchars($testStudent['password']) . "</code></li>";
        echo "</ul>";
        echo "</div>";
        
        echo "<div style='background:#d1ecf1;border:1px solid #bee5eb;border-radius:8px;padding:20px;margin:20px 0;'>";
        echo "<h3>📝 Next Steps:</h3>";
        echo "<ol>";
        echo "<li>Go to <a href='login.php' style='color:#0066cc;'>Login Page</a></li>";
        echo "<li>Use the email and password above to login</li>";
        echo "<li>You'll be redirected to the Student Dashboard</li>";
        echo "<li>Join a class or ask your teacher to add you to a class</li>";
        echo "</ol>";
        echo "</div>";
        
        echo "<p style='margin-top:20px;'><a href='login.php' style='display:inline-block;background:#1d9b3e;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;'>Go to Login Page →</a></p>";
        
    } else {
        throw new Exception('Failed to create test student account');
    }
    
} catch (PDOException $e) {
    echo "<h2>❌ Database Error</h2>";
    echo "<p style='color:red;'>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p>Make sure your database is running and the 'users' table exists.</p>";
} catch (Exception $e) {
    echo "<h2>❌ Error</h2>";
    echo "<p style='color:red;'>" . htmlspecialchars($e->getMessage()) . "</p>";
}
?>

<style>
    body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 800px;
        margin: 40px auto;
        padding: 20px;
        background: #f8f9fa;
    }
    h2 {
        color: #1d9b3e;
        margin-bottom: 20px;
    }
    h3 {
        color: #374151;
        margin-top: 0;
    }
    code {
        font-family: 'Courier New', monospace;
        font-size: 14px;
    }
    ul, ol {
        margin: 10px 0;
        padding-left: 20px;
    }
    a {
        text-decoration: none;
    }
    a:hover {
        text-decoration: underline;
    }
</style>


