<?php
/**
 * TEST PAGE: Check if locked content is being rendered
 * 
 * This page simulates the exact conditions for a pending student
 * and shows what HTML should be rendered.
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config/Database.php';

// Get parameters
$classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : 21;
$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 91; // Default to Test Account

echo "<!DOCTYPE html>
<html>
<head>
    <title>Test Locked Content</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #f5f5f5; }
        .test-section { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .test-section h2 { margin-top: 0; color: #333; border-bottom: 2px solid #1d9b3e; padding-bottom: 5px; }
        .html-output { background: #f9f9f9; padding: 10px; border-left: 3px solid #1d9b3e; overflow-x: auto; font-size: 12px; }
        .success { color: #1d9b3e; font-weight: bold; }
        .error { color: #dc2626; font-weight: bold; }
        .warning { color: #f59e0b; font-weight: bold; }
        iframe { width: 100%; height: 600px; border: 2px solid #1d9b3e; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>🔍 Test Locked Content Rendering</h1>
    <p><strong>Class ID:</strong> {$classId} | <strong>User ID:</strong> {$userId}</p>
    <hr>";

try {
    $db = (new Database())->getConnection();
    
    // Get student status
    $stmt = $db->prepare("SELECT cs.status, u.firstname, u.lastname 
                         FROM class_students cs 
                         JOIN users u ON cs.student_user_id = u.id 
                         WHERE cs.class_id = ? AND cs.student_user_id = ?");
    $stmt->execute([$classId, $userId]);
    $enrollment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$enrollment) {
        echo "<p class='error'>❌ Student not found in class</p>";
        exit;
    }
    
    $studentStatus = $enrollment['status'] ?? 'accepted';
    $studentName = $enrollment['firstname'] . ' ' . $enrollment['lastname'];
    
    echo "<div class='test-section'>
        <h2>1️⃣ Student Information</h2>
        <p><strong>Name:</strong> {$studentName}</p>
        <p><strong>Status:</strong> <span class='" . ($studentStatus === 'pending' ? 'warning' : ($studentStatus === 'accepted' ? 'success' : 'error')) . "'>" . strtoupper($studentStatus) . "</span></p>
    </div>";
    
    // Simulate PHP variables
    $userRole = 'student';
    $newsfeedIsLocked = ($userRole === 'student' && isset($studentStatus) && $studentStatus !== 'accepted');
    $leaderboardsIsLocked = ($userRole === 'student' && isset($studentStatus) && $studentStatus !== 'accepted');
    
    echo "<div class='test-section'>
        <h2>2️⃣ Condition Check</h2>
        <pre>";
    echo "userRole = '{$userRole}'\n";
    echo "studentStatus = '{$studentStatus}'\n";
    echo "newsfeedIsLocked = " . ($newsfeedIsLocked ? 'TRUE ✅' : 'FALSE ❌') . "\n";
    echo "leaderboardsIsLocked = " . ($leaderboardsIsLocked ? 'TRUE ✅' : 'FALSE ❌') . "\n";
    echo "</pre>
    </div>";
    
    // Show what HTML should be rendered
    echo "<div class='test-section'>
        <h2>3️⃣ Expected HTML Output</h2>";
    
    if ($newsfeedIsLocked) {
        echo "<h3>Newsfeed Section (SHOULD BE LOCKED):</h3>
        <div class='html-output'>";
        echo htmlspecialchars('
<div id="newsfeed-locked-content" data-locked="true" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; padding: 60px 20px; text-align: center;">
  <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);">
    <i class="fas fa-lock" style="font-size: 40px; color: white;"></i>
  </div>
  <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 22px; font-weight: 600;">Newsfeed Locked</h3>
  <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; max-width: 400px;">
    Your enrollment is pending approval. Once accepted, you will be able to access the newsfeed.
  </p>
</div>');
        echo "</div>";
    } else {
        echo "<p class='error'>❌ Newsfeed should NOT be locked (status is '{$studentStatus}')</p>";
    }
    
    if ($leaderboardsIsLocked) {
        echo "<h3>Leaderboards Section (SHOULD BE LOCKED):</h3>
        <div class='html-output'>";
        echo htmlspecialchars('
<div id="leaderboards-locked-content" data-locked="true" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; padding: 60px 20px; text-align: center;">
  <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);">
    <i class="fas fa-lock" style="font-size: 40px; color: white;"></i>
  </div>
  <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 22px; font-weight: 600;">Leaderboards Locked</h3>
  <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; max-width: 400px;">
    Your enrollment is pending approval. Once accepted, you will be able to view the leaderboards.
  </p>
</div>');
        echo "</div>";
    } else {
        echo "<p class='error'>❌ Leaderboards should NOT be locked (status is '{$studentStatus}')</p>";
    }
    
    echo "</div>";
    
    // Show actual rendered page in iframe
    echo "<div class='test-section'>
        <h2>4️⃣ Actual Page Output (iframe)</h2>
        <p class='info'>💡 This shows the actual class_dashboard.php page. Check if locked content appears.</p>
        <iframe src='class_dashboard.php?class_id={$classId}&embedded=1'></iframe>
    </div>";
    
    // Check PHP error logs
    echo "<div class='test-section'>
        <h2>5️⃣ PHP Error Log Check</h2>
        <p class='info'>💡 Check your PHP error log file for these messages:</p>
        <pre>";
    echo "🔍 [class_dashboard.php] Student {$userId} in class {$classId} - Status: {$studentStatus}\n";
    echo "🔍 [NEWSFEED CHECK] userRole: student, studentStatus: {$studentStatus}, isset(studentStatus): YES\n";
    echo "🔍 [NEWSFEED CHECK] newsfeedIsLocked result: " . ($newsfeedIsLocked ? 'TRUE (WILL LOCK)' : 'FALSE (WILL NOT LOCK)') . "\n";
    echo "🔍 [LEADERBOARDS CHECK] userRole: student, studentStatus: {$studentStatus}, isset(studentStatus): YES\n";
    echo "🔍 [LEADERBOARDS CHECK] leaderboardsIsLocked result: " . ($leaderboardsIsLocked ? 'TRUE (WILL LOCK)' : 'FALSE (WILL NOT LOCK)') . "\n";
    echo "</pre>
        <p class='warning'>⚠️ If the logs show 'FALSE (WILL NOT LOCK)' but status is 'pending', there's a bug in the condition check.</p>
    </div>";
    
} catch (Exception $e) {
    echo "<div class='test-section'>
        <h2 class='error'>❌ Error</h2>
        <p class='error'>" . htmlspecialchars($e->getMessage()) . "</p>
    </div>";
}

echo "</body></html>";
?>


