<?php
/**
 * Debug Newsfeed Loading Issue
 * Check if tables exist and test the API endpoint
 */

require_once __DIR__ . '/config/Database.php';

echo "<h2>Newsfeed Debug Tool</h2>";
echo "<pre>";

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        echo "❌ Database connection failed!\n";
        exit;
    }
    echo "✅ Database connected\n\n";
    
    // Check if tables exist
    echo "=== TABLE CHECK ===\n";
    $tables = ['class_posts', 'class_post_reactions', 'class_post_comments'];
    foreach ($tables as $table) {
        $check = $db->query("SHOW TABLES LIKE '$table'");
        if ($check->rowCount() > 0) {
            echo "✅ Table '$table' exists\n";
            
            // Show table structure
            $columns = $db->query("SHOW COLUMNS FROM $table");
            echo "   Columns: ";
            $colNames = [];
            while ($col = $columns->fetch(PDO::FETCH_ASSOC)) {
                $colNames[] = $col['Field'];
            }
            echo implode(', ', $colNames) . "\n";
        } else {
            echo "❌ Table '$table' does NOT exist\n";
        }
    }
    
    echo "\n=== SOLUTION ===\n";
    $allExist = true;
    foreach ($tables as $table) {
        $check = $db->query("SHOW TABLES LIKE '$table'");
        if ($check->rowCount() === 0) {
            $allExist = false;
        }
    }
    
    if (!$allExist) {
        echo "⚠️  Some tables are missing!\n";
        echo "📝 Please run: http://localhost/capstoneproject/create_newsfeed_tables.php\n";
    } else {
        echo "✅ All tables exist!\n\n";
        
        // Test query
        echo "=== TEST QUERY ===\n";
        $testStmt = $db->query("SELECT COUNT(*) as count FROM class_posts");
        $testResult = $testStmt->fetch(PDO::FETCH_ASSOC);
        echo "Total posts in database: " . $testResult['count'] . "\n";
        
        // Test with a class_id
        $classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : 0;
        if ($classId > 0) {
            echo "\n=== TEST FOR CLASS ID: $classId ===\n";
            $classStmt = $db->prepare("SELECT COUNT(*) as count FROM class_posts WHERE class_id = ?");
            $classStmt->execute([$classId]);
            $classResult = $classStmt->fetch(PDO::FETCH_ASSOC);
            echo "Posts for class $classId: " . $classResult['count'] . "\n";
        } else {
            echo "\n💡 Add ?class_id=X to URL to test specific class\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "</pre>";
?>


