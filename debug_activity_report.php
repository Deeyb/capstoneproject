<?php
/**
 * DIAGNOSTIC SCRIPT FOR ACTIVITY REPORT
 * This script helps debug why Activity Report is not showing data
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/auth_helpers.php';

// Start session
session_start();

// Get parameters
$activityId = isset($_GET['activity_id']) ? (int)$_GET['activity_id'] : 0;
$classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : 0;

if (!$activityId) {
    die("Please provide activity_id parameter. Example: ?activity_id=248&class_id=22");
}

$db = (new Database())->getConnection();

echo "<h1>Activity Report Diagnostic</h1>";
echo "<p><strong>Activity ID:</strong> $activityId</p>";
echo "<p><strong>Class ID:</strong> " . ($classId > 0 ? $classId : 'Not provided') . "</p>";
echo "<hr>";

// 1. Check if activity exists
echo "<h2>1. Activity Check</h2>";
$stmt = $db->prepare("
    SELECT la.*, cl.id as lesson_id, cm.id as module_id, cm.course_id
    FROM lesson_activities la
    INNER JOIN course_lessons cl ON la.lesson_id = cl.id
    INNER JOIN course_modules cm ON cl.module_id = cm.id
    WHERE la.id = ?
    LIMIT 1
");
$stmt->execute([$activityId]);
$activity = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$activity) {
    die("<p style='color:red;'>❌ Activity not found!</p>");
}

echo "<p>✅ Activity found: <strong>" . htmlspecialchars($activity['title'] ?? 'Unknown') . "</strong></p>";
echo "<p>Course ID: <strong>" . ($activity['course_id'] ?? 'N/A') . "</strong></p>";
echo "<hr>";

// 2. Check if class exists and course matches
if ($classId > 0) {
    echo "<h2>2. Class Check</h2>";
    $stmt = $db->prepare("SELECT c.*, co.id as course_id FROM classes c INNER JOIN courses co ON c.course_id = co.id WHERE c.id = ? LIMIT 1");
    $stmt->execute([$classId]);
    $class = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$class) {
        echo "<p style='color:red;'>❌ Class not found!</p>";
    } else {
        echo "<p>✅ Class found: <strong>" . htmlspecialchars($class['name'] ?? 'Unknown') . "</strong></p>";
        echo "<p>Class Course ID: <strong>" . ($class['course_id'] ?? 'N/A') . "</strong></p>";
        
        if ((int)$class['course_id'] !== (int)$activity['course_id']) {
            echo "<p style='color:red;'>❌ Course mismatch! Activity course: " . $activity['course_id'] . ", Class course: " . $class['course_id'] . "</p>";
        } else {
            echo "<p style='color:green;'>✅ Course matches!</p>";
        }
    }
    echo "<hr>";
}

// 3. Check total submissions for this activity (all classes)
echo "<h2>3. Total Submissions (All Classes)</h2>";
$stmt = $db->prepare("
    SELECT COUNT(*) as total
    FROM activity_attempts aa
    WHERE aa.activity_id = ?
        AND aa.submitted_at IS NOT NULL
        AND aa.is_preview = 0
        AND aa.role = 'student'
");
$stmt->execute([$activityId]);
$totalAttempts = $stmt->fetchColumn();
echo "<p>Total attempts with submissions: <strong>$totalAttempts</strong></p>";

$stmt = $db->prepare("
    SELECT COUNT(*) as total
    FROM activity_attempts aa
    WHERE aa.activity_id = ?
        AND aa.submitted_at IS NOT NULL
        AND aa.score IS NOT NULL
        AND aa.is_preview = 0
        AND aa.role = 'student'
");
$stmt->execute([$activityId]);
$totalWithScore = $stmt->fetchColumn();
echo "<p>Total attempts with score: <strong>$totalWithScore</strong></p>";

if ($totalAttempts > 0 && $totalWithScore == 0) {
    echo "<p style='color:orange;'>⚠️ <strong>ISSUE FOUND:</strong> There are $totalAttempts submissions but NONE have scores! They might be pending grading.</p>";
}

echo "<hr>";

// 4. Check submissions in specific class
if ($classId > 0) {
    echo "<h2>4. Submissions in Class $classId</h2>";
    
    // Check enrolled students
    $stmt = $db->prepare("
        SELECT COUNT(*) as cnt
        FROM class_students cs
        WHERE cs.class_id = ?
            AND cs.status = 'accepted'
    ");
    $stmt->execute([$classId]);
    $enrolledCount = $stmt->fetchColumn();
    echo "<p>Students enrolled (accepted): <strong>$enrolledCount</strong></p>";
    
    // Check attempts in class (no filters)
    $stmt = $db->prepare("
        SELECT COUNT(*) as cnt
        FROM activity_attempts aa
        INNER JOIN class_students cs ON aa.user_id = cs.student_user_id
        WHERE aa.activity_id = ?
            AND cs.class_id = ?
            AND cs.status = 'accepted'
            AND aa.submitted_at IS NOT NULL
            AND aa.is_preview = 0
            AND aa.role = 'student'
    ");
    $stmt->execute([$activityId, $classId]);
    $classAttempts = $stmt->fetchColumn();
    echo "<p>Attempts in class (no score filter): <strong>$classAttempts</strong></p>";
    
    // Check attempts with score
    $stmt = $db->prepare("
        SELECT COUNT(*) as cnt
        FROM activity_attempts aa
        INNER JOIN class_students cs ON aa.user_id = cs.student_user_id
        WHERE aa.activity_id = ?
            AND cs.class_id = ?
            AND cs.status = 'accepted'
            AND aa.submitted_at IS NOT NULL
            AND aa.score IS NOT NULL
            AND aa.is_preview = 0
            AND aa.role = 'student'
    ");
    $stmt->execute([$activityId, $classId]);
    $classWithScore = $stmt->fetchColumn();
    echo "<p>Attempts in class with score: <strong>$classWithScore</strong></p>";
    
    if ($classAttempts > 0 && $classWithScore == 0) {
        echo "<p style='color:orange;'>⚠️ <strong>ISSUE FOUND:</strong> There are $classAttempts submissions in this class but NONE have scores!</p>";
    }
    
    echo "<hr>";
}

// 5. Show sample submissions (if any)
echo "<h2>5. Sample Submissions</h2>";
$stmt = $db->prepare("
    SELECT 
        aa.id,
        aa.user_id,
        aa.score,
        aa.submitted_at,
        aa.is_preview,
        aa.role,
        u.firstname,
        u.lastname,
        cs.class_id,
        cs.status as enrollment_status
    FROM activity_attempts aa
    LEFT JOIN users u ON aa.user_id = u.id
    LEFT JOIN class_students cs ON aa.user_id = cs.student_user_id AND cs.class_id = ?
    WHERE aa.activity_id = ?
        AND aa.submitted_at IS NOT NULL
        AND aa.is_preview = 0
        AND aa.role = 'student'
    ORDER BY aa.submitted_at DESC
    LIMIT 10
");
$stmt->execute([$classId > 0 ? $classId : 0, $activityId]);
$submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($submissions) === 0) {
    echo "<p style='color:red;'>❌ No submissions found at all!</p>";
} else {
    echo "<table border='1' cellpadding='5' style='border-collapse: collapse;'>";
    echo "<tr><th>User</th><th>Score</th><th>Submitted At</th><th>Class ID</th><th>Status</th><th>Issue</th></tr>";
    foreach ($submissions as $sub) {
        $issues = [];
        if ($sub['score'] === null) {
            $issues[] = "No score";
        }
        if ($classId > 0 && ($sub['class_id'] != $classId || $sub['enrollment_status'] != 'accepted')) {
            $issues[] = "Not in class or not accepted";
        }
        
        $issueText = count($issues) > 0 ? implode(', ', $issues) : 'OK';
        $rowColor = count($issues) > 0 ? 'background-color: #ffcccc;' : '';
        
        echo "<tr style='$rowColor'>";
        echo "<td>" . htmlspecialchars(($sub['firstname'] ?? '') . ' ' . ($sub['lastname'] ?? '')) . "</td>";
        echo "<td>" . ($sub['score'] !== null ? $sub['score'] : '<em>NULL</em>') . "</td>";
        echo "<td>" . htmlspecialchars($sub['submitted_at'] ?? 'N/A') . "</td>";
        echo "<td>" . ($sub['class_id'] ?? '<em>NULL</em>') . "</td>";
        echo "<td>" . htmlspecialchars($sub['enrollment_status'] ?? '<em>NULL</em>') . "</td>";
        echo "<td>" . htmlspecialchars($issueText) . "</td>";
        echo "</tr>";
    }
    echo "</table>";
}

echo "<hr>";
echo "<h2>6. Summary</h2>";
echo "<ul>";
if ($totalAttempts == 0) {
    echo "<li style='color:red;'>❌ <strong>No submissions found at all</strong> - Students haven't submitted this activity yet</li>";
} elseif ($totalWithScore == 0) {
    echo "<li style='color:orange;'>⚠️ <strong>Submissions exist but have no scores</strong> - They need to be graded first</li>";
} elseif ($classId > 0 && $classWithScore == 0) {
    echo "<li style='color:orange;'>⚠️ <strong>Submissions exist but not in this class or students not accepted</strong></li>";
} else {
    echo "<li style='color:green;'>✅ Data should be available. Check the query logic.</li>";
}
echo "</ul>";

echo "<hr>";
echo "<p><a href='javascript:history.back()'>← Back</a></p>";
?>



