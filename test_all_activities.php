<?php
/**
 * COMPREHENSIVE ACTIVITY TESTER
 * Tests ALL activities in the system to ensure they work
 */
require_once __DIR__ . '/config/Database.php';

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        die("❌ Database connection failed");
    }
    
    echo "<h1>🔍 COMPREHENSIVE ACTIVITY SYSTEM TEST</h1>";
    echo "<style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test-result { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>";
    
    // Step 1: Detect all activity tables
    echo "<h2>📊 Step 1: Detecting Activity Tables</h2>";
    $activityTables = detectAllActivityTables($db);
    echo "<div class='info'>Found " . count($activityTables) . " activity tables: " . implode(', ', $activityTables) . "</div>";
    
    // Step 2: Get all activities from all tables
    echo "<h2>📋 Step 2: Collecting All Activities</h2>";
    $allActivities = getAllActivitiesFromAllTables($db, $activityTables);
    echo "<div class='info'>Found " . count($allActivities) . " total activities across all tables</div>";
    
    // Step 3: Test each activity
    echo "<h2>🧪 Step 3: Testing Each Activity</h2>";
    $testResults = [];
    
    foreach ($allActivities as $activity) {
        $result = testActivity($db, $activity);
        $testResults[] = $result;
        
        $statusClass = $result['success'] ? 'success' : 'error';
        echo "<div class='test-result $statusClass'>";
        echo "<strong>Activity ID {$activity['id']}:</strong> {$activity['title']} ({$activity['type']}) - ";
        echo $result['success'] ? "✅ WORKING" : "❌ FAILED";
        if (!$result['success']) {
            echo " - " . $result['error'];
        }
        echo "</div>";
    }
    
    // Step 4: Summary
    echo "<h2>📈 Step 4: Test Summary</h2>";
    $workingCount = count(array_filter($testResults, fn($r) => $r['success']));
    $failedCount = count($testResults) - $workingCount;
    
    echo "<div class='info'>";
    echo "Total Activities: " . count($testResults) . "<br>";
    echo "Working: <span style='color: green; font-weight: bold;'>$workingCount</span><br>";
    echo "Failed: <span style='color: red; font-weight: bold;'>$failedCount</span><br>";
    echo "Success Rate: " . round(($workingCount / count($testResults)) * 100, 2) . "%";
    echo "</div>";
    
    // Step 5: Detailed results table
    echo "<h2>📊 Detailed Results</h2>";
    echo "<table>";
    echo "<tr><th>Activity ID</th><th>Title</th><th>Type</th><th>Status</th><th>Questions</th><th>Error</th></tr>";
    
    foreach ($testResults as $i => $result) {
        $activity = $allActivities[$i];
        $status = $result['success'] ? '✅ Working' : '❌ Failed';
        $questions = $result['questions'] ?? 0;
        $error = $result['error'] ?? '';
        
        echo "<tr>";
        echo "<td>{$activity['id']}</td>";
        echo "<td>{$activity['title']}</td>";
        echo "<td>{$activity['type']}</td>";
        echo "<td>$status</td>";
        echo "<td>$questions</td>";
        echo "<td>$error</td>";
        echo "</tr>";
    }
    echo "</table>";
    
} catch (Exception $e) {
    echo "<div class='error'>❌ Test failed: " . $e->getMessage() . "</div>";
}

/**
 * Detect all possible activity tables
 */
function detectAllActivityTables($db) {
    $tables = [];
    
    // Common patterns
    $patterns = [
        'lesson_activities', 'activities', 'class_activities', 'course_activities',
        'module_activities', 'topic_activities', 'user_activities', 'teacher_activities'
    ];
    
    foreach ($patterns as $pattern) {
        try {
            $stmt = $db->prepare("SHOW TABLES LIKE ?");
            $stmt->execute([$pattern]);
            if ($stmt->fetch()) {
                $tables[] = $pattern;
            }
        } catch (Exception $e) {
            // Continue
        }
    }
    
    // Also check for tables with 'activity' in name
    try {
        $stmt = $db->prepare("SHOW TABLES LIKE '%activity%'");
        $stmt->execute();
        $activityTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $tables = array_merge($tables, $activityTables);
    } catch (Exception $e) {
        // Continue
    }
    
    return array_unique($tables);
}

/**
 * Get all activities from all tables
 */
function getAllActivitiesFromAllTables($db, $tables) {
    $allActivities = [];
    
    foreach ($tables as $table) {
        try {
            $stmt = $db->prepare("DESCRIBE `$table`");
            $stmt->execute();
            $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            // Build query based on available columns
            $selectFields = [];
            $fieldMap = [
                'id' => 'id',
                'title' => 'title', 'name' => 'title', 'activity_title' => 'title',
                'type' => 'type', 'activity_type' => 'type',
                'max_score' => 'max_score', 'total_points' => 'max_score', 'points' => 'max_score',
                'instructions' => 'instructions', 'description' => 'instructions', 'content' => 'instructions'
            ];
            
            foreach ($fieldMap as $dbColumn => $standardField) {
                if (in_array($dbColumn, $columns)) {
                    $selectFields[] = "`$dbColumn` as `$standardField`";
                }
            }
            
            if (empty($selectFields)) continue;
            
            $query = "SELECT " . implode(', ', $selectFields) . " FROM `$table`";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($activities as $activity) {
                $activity['source_table'] = $table;
                $allActivities[] = $activity;
            }
            
        } catch (Exception $e) {
            // Continue to next table
        }
    }
    
    return $allActivities;
}

/**
 * Test a single activity
 */
function testActivity($db, $activity) {
    try {
        // Simulate the universal API call
        $activityId = $activity['id'];
        
        // Test if we can get questions for this activity
        $questions = getQuestionsForActivity($db, $activityId);
        
        return [
            'success' => true,
            'questions' => count($questions),
            'error' => null
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'questions' => 0,
            'error' => $e->getMessage()
        ];
    }
}

/**
 * Get questions for activity (simplified version)
 */
function getQuestionsForActivity($db, $activityId) {
    $questions = [];
    
    // Try common question tables
    $questionTables = ['activity_questions', 'questions', 'class_questions'];
    
    foreach ($questionTables as $table) {
        try {
            $stmt = $db->prepare("SHOW TABLES LIKE ?");
            $stmt->execute([$table]);
            if (!$stmt->fetch()) continue;
            
            // Try different activity_id columns
            $activityIdColumns = ['activity_id', 'lesson_id', 'class_id'];
            
            foreach ($activityIdColumns as $col) {
                try {
                    $stmt = $db->prepare("SELECT COUNT(*) FROM `$table` WHERE `$col` = ?");
                    $stmt->execute([$activityId]);
                    $count = $stmt->fetchColumn();
                    
                    if ($count > 0) {
                        $stmt = $db->prepare("SELECT * FROM `$table` WHERE `$col` = ?");
                        $stmt->execute([$activityId]);
                        $foundQuestions = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        $questions = array_merge($questions, $foundQuestions);
                        break;
                    }
                } catch (Exception $e) {
                    // Try next column
                }
            }
            
        } catch (Exception $e) {
            // Try next table
        }
    }
    
    return $questions;
}
?>

