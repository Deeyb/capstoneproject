<?php
/**
 * RESET STUDENT SCORES UTILITY
 * Allows resetting student scores for testing purposes
 * 
 * WARNING: This is a utility script for development/testing only!
 * Remove or secure this file in production.
 */

// CRITICAL: Set session path BEFORE any session_start() calls
$sessionPath = __DIR__ . '/sessions';
if (!is_dir($sessionPath)) {
    @mkdir($sessionPath, 0777, true);
}
if (is_dir($sessionPath) && is_writable($sessionPath)) {
    ini_set('session.save_path', $sessionPath);
}

// Set session name before starting
if (session_status() === PHP_SESSION_NONE) {
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
}

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/auth_helpers.php';

// Require admin or coordinator role
Auth::requireAuth();
$userRole = strtolower($_SESSION['user_role'] ?? '');
if (!in_array($userRole, ['admin', 'coordinator'])) {
    die('Access denied. Admin or Coordinator role required.');
}

$db = (new Database())->getConnection();
$message = '';
$error = '';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'reset_activity') {
        $activityId = (int)($_POST['activity_id'] ?? 0);
        $userId = (int)($_POST['user_id'] ?? 0);
        
        if ($activityId > 0 && $userId > 0) {
            try {
                // Delete all attempts for this user and activity
                $stmt = $db->prepare("DELETE FROM activity_attempt_items WHERE attempt_id IN (SELECT id FROM activity_attempts WHERE activity_id = ? AND user_id = ?)");
                $stmt->execute([$activityId, $userId]);
                
                $stmt = $db->prepare("DELETE FROM activity_attempts WHERE activity_id = ? AND user_id = ?");
                $stmt->execute([$activityId, $userId]);
                
                // Also clear draft progress
                $stmt = $db->prepare("DELETE FROM activity_progress WHERE activity_id = ? AND user_id = ?");
                $stmt->execute([$activityId, $userId]);
                
                $message = "Successfully reset scores for Activity ID: $activityId, User ID: $userId";
            } catch (Exception $e) {
                $error = "Error resetting scores: " . $e->getMessage();
            }
        } else {
            $error = "Invalid activity ID or user ID";
        }
    } elseif ($action === 'reset_all_user') {
        $userId = (int)($_POST['user_id'] ?? 0);
        
        if ($userId > 0) {
            try {
                // Delete all attempts for this user
                $stmt = $db->prepare("DELETE FROM activity_attempt_items WHERE attempt_id IN (SELECT id FROM activity_attempts WHERE user_id = ?)");
                $stmt->execute([$userId]);
                
                $stmt = $db->prepare("DELETE FROM activity_attempts WHERE user_id = ?");
                $stmt->execute([$userId]);
                
                // Also clear draft progress
                $stmt = $db->prepare("DELETE FROM activity_progress WHERE user_id = ?");
                $stmt->execute([$userId]);
                
                $message = "Successfully reset all scores for User ID: $userId";
            } catch (Exception $e) {
                $error = "Error resetting scores: " . $e->getMessage();
            }
        } else {
            $error = "Invalid user ID";
        }
    } elseif ($action === 'reset_activity_all') {
        $activityId = (int)($_POST['activity_id'] ?? 0);
        
        if ($activityId > 0) {
            try {
                // Delete all attempts for this activity (all users)
                $stmt = $db->prepare("DELETE FROM activity_attempt_items WHERE attempt_id IN (SELECT id FROM activity_attempts WHERE activity_id = ?)");
                $stmt->execute([$activityId]);
                
                $stmt = $db->prepare("DELETE FROM activity_attempts WHERE activity_id = ?");
                $stmt->execute([$activityId]);
                
                // Also clear draft progress
                $stmt = $db->prepare("DELETE FROM activity_progress WHERE activity_id = ?");
                $stmt->execute([$activityId]);
                
                $message = "Successfully reset all scores for Activity ID: $activityId (all users)";
            } catch (Exception $e) {
                $error = "Error resetting scores: " . $e->getMessage();
            }
        } else {
            $error = "Invalid activity ID";
        }
    }
}

// Get list of activities
$activitiesStmt = $db->query("SELECT id, title, max_score FROM lesson_activities ORDER BY id DESC LIMIT 50");
$activities = $activitiesStmt->fetchAll(PDO::FETCH_ASSOC);

// Get list of students
$studentsStmt = $db->query("SELECT id, firstname, lastname, middlename, email FROM users WHERE role = 'student' ORDER BY lastname, firstname LIMIT 100");
$students = $studentsStmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Student Scores - Utility</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 30px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .message {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        .section h2 {
            color: #495057;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            color: #495057;
            font-weight: 500;
        }
        select, input[type="number"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ced4da;
            border-radius: 4px;
            font-size: 14px;
        }
        button {
            background: #dc3545;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background 0.2s;
        }
        button:hover {
            background: #c82333;
        }
        button:disabled {
            background: #6c757d;
            cursor: not-allowed;
        }
        .info {
            background: #e7f3ff;
            border-left: 4px solid #2196F3;
            padding: 10px;
            margin-top: 10px;
            font-size: 13px;
            color: #0d47a1;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Reset Student Scores Utility</h1>
        <div class="warning">
            <strong>⚠️ WARNING:</strong> This utility will permanently delete student scores and attempts. Use with caution!
        </div>
        
        <?php if ($message): ?>
            <div class="message"><?php echo htmlspecialchars($message); ?></div>
        <?php endif; ?>
        
        <?php if ($error): ?>
            <div class="error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        
        <!-- Reset Specific Activity for Specific User -->
        <div class="section">
            <h2>Reset Activity Score for Specific Student</h2>
            <form method="POST">
                <input type="hidden" name="action" value="reset_activity">
                <div class="form-group">
                    <label>Activity:</label>
                    <select name="activity_id" required>
                        <option value="">Select Activity</option>
                        <?php foreach ($activities as $activity): ?>
                            <option value="<?php echo $activity['id']; ?>">
                                ID: <?php echo $activity['id']; ?> - <?php echo htmlspecialchars($activity['title']); ?> (Max: <?php echo $activity['max_score']; ?>)
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label>Student:</label>
                    <select name="user_id" required>
                        <option value="">Select Student</option>
                        <?php foreach ($students as $student): ?>
                            <option value="<?php echo $student['id']; ?>">
                                ID: <?php echo $student['id']; ?> - <?php echo htmlspecialchars(trim($student['lastname'] . ', ' . $student['firstname'] . ' ' . ($student['middlename'] ?? ''))); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <button type="submit" onclick="return confirm('Are you sure you want to reset this score? This cannot be undone!');">
                    Reset Score
                </button>
                <div class="info">
                    This will delete all attempts and draft progress for the selected student and activity.
                </div>
            </form>
        </div>
        
        <!-- Reset All Scores for Specific User -->
        <div class="section">
            <h2>Reset All Scores for Specific Student</h2>
            <form method="POST">
                <input type="hidden" name="action" value="reset_all_user">
                <div class="form-group">
                    <label>Student:</label>
                    <select name="user_id" required>
                        <option value="">Select Student</option>
                        <?php foreach ($students as $student): ?>
                            <option value="<?php echo $student['id']; ?>">
                                ID: <?php echo $student['id']; ?> - <?php echo htmlspecialchars(trim($student['lastname'] . ', ' . $student['firstname'] . ' ' . ($student['middlename'] ?? ''))); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <button type="submit" onclick="return confirm('Are you sure you want to reset ALL scores for this student? This cannot be undone!');">
                    Reset All Scores
                </button>
                <div class="info">
                    This will delete all attempts and draft progress for the selected student across all activities.
                </div>
            </form>
        </div>
        
        <!-- Reset All Scores for Specific Activity (All Users) -->
        <div class="section">
            <h2>Reset All Scores for Specific Activity (All Students)</h2>
            <form method="POST">
                <input type="hidden" name="action" value="reset_activity_all">
                <div class="form-group">
                    <label>Activity:</label>
                    <select name="activity_id" required>
                        <option value="">Select Activity</option>
                        <?php foreach ($activities as $activity): ?>
                            <option value="<?php echo $activity['id']; ?>">
                                ID: <?php echo $activity['id']; ?> - <?php echo htmlspecialchars($activity['title']); ?> (Max: <?php echo $activity['max_score']; ?>)
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <button type="submit" onclick="return confirm('Are you sure you want to reset ALL scores for this activity (all students)? This cannot be undone!');">
                    Reset All Scores for Activity
                </button>
                <div class="info">
                    This will delete all attempts and draft progress for the selected activity across all students.
                </div>
            </form>
        </div>
    </div>
</body>
</html>

