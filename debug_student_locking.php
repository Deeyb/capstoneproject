<?php
/**
 * DEBUGGING TOOL: Student Locking System
 * 
 * This script helps debug why Newsfeed and Leaderboards are not locking
 * for pending/rejected students.
 * 
 * Usage: 
 *   - Direct access: http://localhost/capstoneproject/debug_student_locking.php?class_id=21&user_id=86
 *   - Command line: php debug_student_locking.php 21 86
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config/Database.php';

// Get parameters
$classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : (isset($argv[1]) ? (int)$argv[1] : 21);
$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : (isset($argv[2]) ? (int)$argv[2] : null);

echo "<!DOCTYPE html>
<html>
<head>
    <title>Student Locking Debug Tool</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #f5f5f5; }
        .section { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .section h2 { margin-top: 0; color: #333; border-bottom: 2px solid #1d9b3e; padding-bottom: 5px; }
        .success { color: #1d9b3e; font-weight: bold; }
        .error { color: #dc2626; font-weight: bold; }
        .warning { color: #f59e0b; font-weight: bold; }
        .info { color: #3b82f6; }
        pre { background: #f9f9f9; padding: 10px; border-left: 3px solid #1d9b3e; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        table th, table td { padding: 8px; text-align: left; border: 1px solid #ddd; }
        table th { background: #1d9b3e; color: white; }
        .status-pending { background: #fef3c7; }
        .status-accepted { background: #d1fae5; }
        .status-rejected { background: #fee2e2; }
    </style>
</head>
<body>
    <h1>🔍 Student Locking Debug Tool</h1>
    <p><strong>Class ID:</strong> {$classId} | <strong>User ID:</strong> " . ($userId ?: 'Not specified - will check all students') . "</p>
    <hr>";

try {
    $db = (new Database())->getConnection();
    
    // ==================== SECTION 1: DATABASE CHECK ====================
    echo "<div class='section'>
        <h2>1️⃣ Database Status Check</h2>";
    
    // Check if status column exists
    $hasStatusColumn = false;
    try {
        $checkStmt = $db->query("SHOW COLUMNS FROM class_students LIKE 'status'");
        $hasStatusColumn = $checkStmt->rowCount() > 0;
        if ($hasStatusColumn) {
            echo "<p class='success'>✅ Status column exists in class_students table</p>";
        } else {
            echo "<p class='error'>❌ Status column does NOT exist in class_students table</p>";
        }
    } catch (Exception $e) {
        echo "<p class='error'>❌ Error checking status column: " . htmlspecialchars($e->getMessage()) . "</p>";
    }
    
    // Get student enrollment data
    if ($userId) {
        $stmt = $db->prepare("SELECT cs.*, u.firstname, u.lastname, u.email, u.role 
                              FROM class_students cs 
                              JOIN users u ON cs.student_user_id = u.id 
                              WHERE cs.class_id = ? AND cs.student_user_id = ?");
        $stmt->execute([$classId, $userId]);
        $enrollment = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($enrollment) {
            echo "<h3>Student Enrollment Data:</h3>";
            echo "<table>";
            echo "<tr><th>Field</th><th>Value</th></tr>";
            foreach ($enrollment as $key => $value) {
                $statusClass = '';
                if ($key === 'status') {
                    if ($value === 'pending') $statusClass = 'status-pending';
                    elseif ($value === 'accepted') $statusClass = 'status-accepted';
                    elseif ($value === 'rejected') $statusClass = 'status-rejected';
                }
                echo "<tr class='{$statusClass}'><td><strong>{$key}</strong></td><td>" . htmlspecialchars($value ?? 'NULL') . "</td></tr>";
            }
            echo "</table>";
            
            $studentStatus = $enrollment['status'] ?? 'accepted';
            echo "<p><strong>Current Status:</strong> <span class='" . ($studentStatus === 'pending' ? 'warning' : ($studentStatus === 'accepted' ? 'success' : 'error')) . "'>" . strtoupper($studentStatus) . "</span></p>";
        } else {
            echo "<p class='error'>❌ Student (ID: {$userId}) is NOT enrolled in class {$classId}</p>";
        }
    } else {
        // Show all students in class
        $stmt = $db->prepare("SELECT cs.*, u.firstname, u.lastname, u.email, u.role 
                              FROM class_students cs 
                              JOIN users u ON cs.student_user_id = u.id 
                              WHERE cs.class_id = ? 
                              ORDER BY cs.status, u.lastname");
        $stmt->execute([$classId]);
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<h3>All Students in Class {$classId}:</h3>";
        echo "<table>";
        echo "<tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined At</th></tr>";
        foreach ($students as $student) {
            $statusClass = '';
            if ($student['status'] === 'pending') $statusClass = 'status-pending';
            elseif ($student['status'] === 'accepted') $statusClass = 'status-accepted';
            elseif ($student['status'] === 'rejected') $statusClass = 'status-rejected';
            
            echo "<tr class='{$statusClass}'>";
            echo "<td>{$student['student_user_id']}</td>";
            echo "<td>{$student['firstname']} {$student['lastname']}</td>";
            echo "<td>{$student['email']}</td>";
            echo "<td>{$student['role']}</td>";
            echo "<td><strong>" . strtoupper($student['status'] ?? 'NULL') . "</strong></td>";
            echo "<td>{$student['joined_at']}</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
    
    echo "</div>";
    
    // ==================== SECTION 2: PHP CONDITION SIMULATION ====================
    echo "<div class='section'>
        <h2>2️⃣ PHP Condition Simulation</h2>";
    
    if ($userId && isset($enrollment)) {
        $userRole = strtolower($enrollment['role'] ?? 'student');
        $studentStatus = $enrollment['status'] ?? 'accepted';
        
        echo "<h3>Variables:</h3>";
        echo "<pre>";
        echo "userRole = '{$userRole}'\n";
        echo "studentStatus = '{$studentStatus}'\n";
        echo "</pre>";
        
        echo "<h3>Condition Checks:</h3>";
        echo "<pre>";
        
        $check1 = ($userRole === 'student');
        echo "1. userRole === 'student': " . ($check1 ? '✅ TRUE' : '❌ FALSE') . "\n";
        
        $check2 = isset($studentStatus);
        echo "2. isset(studentStatus): " . ($check2 ? '✅ TRUE' : '❌ FALSE') . "\n";
        
        $check3 = ($studentStatus !== 'accepted');
        echo "3. studentStatus !== 'accepted': " . ($check3 ? '✅ TRUE' : '❌ FALSE') . "\n";
        
        $isStudentPending = ($userRole === 'student' && isset($studentStatus) && $studentStatus !== 'accepted');
        echo "\n4. FINAL: isStudentPending = (check1 && check2 && check3)\n";
        echo "   isStudentPending = " . ($isStudentPending ? '✅ TRUE (SHOULD LOCK)' : '❌ FALSE (WILL NOT LOCK)') . "\n";
        
        echo "</pre>";
        
        // Newsfeed check
        $newsfeedIsLocked = ($userRole === 'student' && isset($studentStatus) && $studentStatus !== 'accepted');
        echo "<p><strong>Newsfeed Locked:</strong> <span class='" . ($newsfeedIsLocked ? 'warning' : 'success') . "'>" . ($newsfeedIsLocked ? 'YES ✅' : 'NO ❌') . "</span></p>";
        
        // Leaderboards check
        $leaderboardsIsLocked = ($userRole === 'student' && isset($studentStatus) && $studentStatus !== 'accepted');
        echo "<p><strong>Leaderboards Locked:</strong> <span class='" . ($leaderboardsIsLocked ? 'warning' : 'success') . "'>" . ($leaderboardsIsLocked ? 'YES ✅' : 'NO ❌') . "</span></p>";
        
    } else {
        echo "<p class='warning'>⚠️ Cannot simulate - student enrollment data not found</p>";
    }
    
    echo "</div>";
    
    // ==================== SECTION 3: SESSION CHECK ====================
    echo "<div class='section'>
        <h2>3️⃣ Session Check</h2>";
    
    // Manual session handling
    $sessionPath = __DIR__ . '/sessions';
    if (!is_dir($sessionPath)) {
        @mkdir($sessionPath, 0777, true);
    }
    if (is_dir($sessionPath) && is_writable($sessionPath)) {
        ini_set('session.save_path', $sessionPath);
    }
    
    $preferred = 'CodeRegalSession';
    $legacy = 'PHPSESSID';
    if (!empty($_COOKIE[$preferred])) { 
        session_name($preferred); 
    } elseif (!empty($_COOKIE[$legacy])) { 
        session_name($legacy); 
    } else { 
        session_name($preferred); 
    }
    @session_start();
    
    echo "<h3>Session Data:</h3>";
    if (empty($_SESSION)) {
        echo "<p class='warning'>⚠️ No session data found. User may not be logged in.</p>";
    } else {
        echo "<pre>";
        echo "Session Name: " . session_name() . "\n";
        echo "Session ID: " . session_id() . "\n\n";
        echo "Session Variables:\n";
        foreach ($_SESSION as $key => $value) {
            if (in_array($key, ['user_id', 'user_role', 'user_email'])) {
                echo "  {$key} = " . (is_array($value) ? json_encode($value) : htmlspecialchars($value)) . "\n";
            }
        }
        echo "</pre>";
        
        $sessionUserId = $_SESSION['user_id'] ?? null;
        $sessionUserRole = strtolower($_SESSION['user_role'] ?? '');
        
        if ($userId && $sessionUserId && $sessionUserId != $userId) {
            echo "<p class='warning'>⚠️ Mismatch: Requested user_id ({$userId}) != Session user_id ({$sessionUserId})</p>";
        }
    }
    
    echo "</div>";
    
    // ==================== SECTION 4: JAVASCRIPT VARIABLE CHECK ====================
    echo "<div class='section'>
        <h2>4️⃣ JavaScript Variable Check</h2>";
    
    if ($userId && isset($enrollment)) {
        $studentStatus = $enrollment['status'] ?? 'accepted';
        $userRole = strtolower($enrollment['role'] ?? 'student');
        
        echo "<h3>Expected JavaScript Variables:</h3>";
        echo "<pre>";
        echo "&lt;script&gt;\n";
        echo "  window.__STUDENT_STATUS__ = " . json_encode($studentStatus) . ";\n";
        echo "  window.__USER_ROLE__ = " . json_encode($userRole) . ";\n";
        echo "  window.__CLASS_ID__ = " . json_encode($classId) . ";\n";
        echo "&lt;/script&gt;\n";
        echo "</pre>";
        
        echo "<h3>JavaScript Condition Check:</h3>";
        echo "<pre>";
        echo "const studentStatus = window.__STUDENT_STATUS__ || 'accepted';\n";
        echo "const userRole = (window.__USER_ROLE__ || '').toLowerCase();\n";
        echo "const isStudentPending = userRole === 'student' && (studentStatus === 'pending' || studentStatus === 'rejected');\n\n";
        echo "Result: " . ($userRole === 'student' && ($studentStatus === 'pending' || $studentStatus === 'rejected') ? '✅ TRUE (SHOULD LOCK)' : '❌ FALSE (WILL NOT LOCK)') . "\n";
        echo "</pre>";
    }
    
    echo "</div>";
    
    // ==================== SECTION 5: RECOMMENDATIONS ====================
    echo "<div class='section'>
        <h2>5️⃣ Recommendations</h2>";
    
    if ($userId && isset($enrollment)) {
        $studentStatus = $enrollment['status'] ?? 'accepted';
        $userRole = strtolower($enrollment['role'] ?? 'student');
        
        if ($userRole !== 'student') {
            echo "<p class='error'>❌ User role is '{$userRole}', not 'student'. Locking only applies to students.</p>";
        } elseif ($studentStatus === 'accepted') {
            echo "<p class='warning'>⚠️ Student status is 'accepted'. To test locking, set status to 'pending' or 'rejected'.</p>";
            echo "<p class='info'>💡 Run: <code>UPDATE class_students SET status = 'pending' WHERE class_id = {$classId} AND student_user_id = {$userId};</code></p>";
        } elseif ($studentStatus === 'pending' || $studentStatus === 'rejected') {
            echo "<p class='success'>✅ Student status is '{$studentStatus}'. Locking should work.</p>";
            echo "<p class='info'>💡 If locking still doesn't work, check:</p>";
            echo "<ul>";
            echo "<li>Browser console for JavaScript errors</li>";
            echo "<li>PHP error logs for rendering issues</li>";
            echo "<li>Network tab to see if API calls are being made</li>";
            echo "<li>Check if JavaScript is checking the correct variables</li>";
            echo "</ul>";
        }
    } else {
        echo "<p class='warning'>⚠️ Cannot provide recommendations - student data not found</p>";
    }
    
    echo "</div>";
    
    // ==================== SECTION 6: QUICK FIX COMMANDS ====================
    echo "<div class='section'>
        <h2>6️⃣ Quick Fix Commands</h2>";
    
    if ($userId) {
        echo "<h3>Set Student to Pending:</h3>";
        echo "<pre>";
        echo "UPDATE class_students SET status = 'pending' WHERE class_id = {$classId} AND student_user_id = {$userId};\n";
        echo "</pre>";
        
        echo "<h3>Set Student to Accepted:</h3>";
        echo "<pre>";
        echo "UPDATE class_students SET status = 'accepted' WHERE class_id = {$classId} AND student_user_id = {$userId};\n";
        echo "</pre>";
        
        echo "<h3>Set Student to Rejected:</h3>";
        echo "<pre>";
        echo "UPDATE class_students SET status = 'rejected' WHERE class_id = {$classId} AND student_user_id = {$userId};\n";
        echo "</pre>";
    }
    
    echo "</div>";
    
} catch (Exception $e) {
    echo "<div class='section'>";
    echo "<h2 class='error'>❌ Error</h2>";
    echo "<p class='error'>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
    echo "</div>";
}

echo "</body></html>";
?>


