<?php
/**
 * TESTING SCRIPT: Delete Class and All Related Records
 * 
 * FOR TESTING PURPOSES ONLY
 * 
 * This script allows:
 * - Teachers to delete classes they created
 * - When a class is deleted, it also deletes:
 *   - All student enrollments (class_students)
 *   - All activity attempts for students in that class
 *   - All activity attempt items
 *   - Newsfeed posts for that class
 *   - Any other related records
 * 
 * Usage:
 * - Teacher: Access via browser, select class to delete
 * - Student: Will automatically be removed from deleted class
 */

// Start session
$sessionPath = __DIR__ . '/sessions';
if (!is_dir($sessionPath)) {
    @mkdir($sessionPath, 0777, true);
}
if (is_dir($sessionPath) && is_writable($sessionPath)) {
    ini_set('session.save_path', $sessionPath);
}

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
    
    if (empty($_SESSION['user_id'])) {
        $current = session_name();
        $alt = ($current === $preferred) ? $legacy : $preferred;
        if (!empty($_COOKIE[$alt])) {
            @session_write_close();
            session_name($alt);
            @session_id($_COOKIE[$alt]);
            @session_start();
        }
    }
}

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/auth_helpers.php';

// Check authentication
if (empty($_SESSION['user_id'])) {
    die('❌ Unauthorized. Please login first.');
}

$userId = (int)($_SESSION['user_id'] ?? 0);
$userRole = strtolower(trim($_SESSION['user_role'] ?? ''));

// Only teachers and admins can use this script
if (!in_array($userRole, ['teacher', 'admin'])) {
    die('❌ Access denied. Only teachers and admins can use this script.');
}

$db = (new Database())->getConnection();
if (!$db) {
    die('❌ Database connection failed.');
}

// Handle delete action
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_class'])) {
    $classId = (int)($_POST['class_id'] ?? 0);
    
    if ($classId <= 0) {
        die(json_encode(['success' => false, 'message' => 'Invalid class ID']));
    }
    
    // Verify class exists and user owns it (or is admin)
    $stmt = $db->prepare("SELECT id, name, code, owner_user_id FROM classes WHERE id = ?");
    $stmt->execute([$classId]);
    $class = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$class) {
        die(json_encode(['success' => false, 'message' => 'Class not found']));
    }
    
    // Check ownership (unless admin)
    if ($userRole !== 'admin' && (int)$class['owner_user_id'] !== $userId) {
        die(json_encode(['success' => false, 'message' => 'You can only delete your own classes']));
    }
    
    // Start transaction
    $db->beginTransaction();
    
    try {
        $deletedRecords = [];
        
        // 1. Get all students in this class
        $studentsStmt = $db->prepare("SELECT student_user_id FROM class_students WHERE class_id = ?");
        $studentsStmt->execute([$classId]);
        $studentIds = $studentsStmt->fetchAll(PDO::FETCH_COLUMN);
        $deletedRecords['students'] = count($studentIds);
        
        // 2. Get all activity IDs for this class (through course)
        $courseStmt = $db->prepare("SELECT course_id FROM classes WHERE id = ?");
        $courseStmt->execute([$classId]);
        $courseId = (int)$courseStmt->fetchColumn();
        
        $activityIds = [];
        if ($courseId > 0) {
            $activitiesStmt = $db->prepare("
                SELECT la.id 
                FROM lesson_activities la
                INNER JOIN course_lessons cl ON la.lesson_id = cl.id
                INNER JOIN course_modules cm ON cl.module_id = cm.id
                WHERE cm.course_id = ?
            ");
            $activitiesStmt->execute([$courseId]);
            $activityIds = $activitiesStmt->fetchAll(PDO::FETCH_COLUMN);
        }
        $deletedRecords['activities'] = count($activityIds);
        
        // 3. Delete activity attempt items for students in this class
        if (!empty($studentIds) && !empty($activityIds)) {
            $studentPlaceholders = implode(',', array_fill(0, count($studentIds), '?'));
            $activityPlaceholders = implode(',', array_fill(0, count($activityIds), '?'));
            
            // Delete attempt items
            $deleteItemsStmt = $db->prepare("
                DELETE aai FROM activity_attempt_items aai
                INNER JOIN activity_attempts aa ON aai.attempt_id = aa.id
                WHERE aa.user_id IN ($studentPlaceholders)
                AND aa.activity_id IN ($activityPlaceholders)
            ");
            $deleteItemsStmt->execute(array_merge($studentIds, $activityIds));
            $deletedRecords['attempt_items'] = $deleteItemsStmt->rowCount();
            
            // Delete activity attempts
            $deleteAttemptsStmt = $db->prepare("
                DELETE FROM activity_attempts
                WHERE user_id IN ($studentPlaceholders)
                AND activity_id IN ($activityPlaceholders)
            ");
            $deleteAttemptsStmt->execute(array_merge($studentIds, $activityIds));
            $deletedRecords['attempts'] = $deleteAttemptsStmt->rowCount();
        }
        
        // 4. Delete newsfeed posts for this class (try both table names)
        $deletedRecords['newsfeed_posts'] = 0;
        try {
            $deleteNewsfeedStmt = $db->prepare("DELETE FROM newsfeed_posts WHERE class_id = ?");
            $deleteNewsfeedStmt->execute([$classId]);
            $deletedRecords['newsfeed_posts'] = $deleteNewsfeedStmt->rowCount();
        } catch (Exception $e) {
            // Try alternative table name
            try {
                $deleteNewsfeedStmt = $db->prepare("DELETE FROM class_posts WHERE class_id = ?");
                $deleteNewsfeedStmt->execute([$classId]);
                $deletedRecords['newsfeed_posts'] = $deleteNewsfeedStmt->rowCount();
            } catch (Exception $e2) {
                // Table might not exist, skip
            }
        }
        
        // 5. Delete class activity schedules
        try {
            $deleteSchedulesStmt = $db->prepare("DELETE FROM class_activity_schedules WHERE class_id = ?");
            $deleteSchedulesStmt->execute([$classId]);
            $deletedRecords['activity_schedules'] = $deleteSchedulesStmt->rowCount();
        } catch (Exception $e) {
            // Table might not exist, skip
            $deletedRecords['activity_schedules'] = 0;
        }
        
        // 6. Delete class students (enrollments)
        $deleteEnrollmentsStmt = $db->prepare("DELETE FROM class_students WHERE class_id = ?");
        $deleteEnrollmentsStmt->execute([$classId]);
        $deletedRecords['enrollments'] = $deleteEnrollmentsStmt->rowCount();
        
        // 7. Finally, delete the class itself
        $deleteClassStmt = $db->prepare("DELETE FROM classes WHERE id = ?");
        $deleteClassStmt->execute([$classId]);
        $deletedRecords['class'] = $deleteClassStmt->rowCount();
        
        // Commit transaction
        $db->commit();
        
        // Return success
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'Class and all related records deleted successfully',
            'deleted' => $deletedRecords
        ]);
        exit;
        
    } catch (Exception $e) {
        $db->rollBack();
        error_log("Error deleting class: " . $e->getMessage());
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error deleting class: ' . $e->getMessage()
        ]);
        exit;
    }
}

// Get user's classes (for teachers) or all classes (for admins)
if ($userRole === 'admin') {
    $classesStmt = $db->prepare("
        SELECT c.id, c.name, c.code, c.created_at, 
               u.firstname, u.lastname, u.middlename,
               COUNT(DISTINCT cs.student_user_id) as student_count
        FROM classes c
        LEFT JOIN users u ON c.owner_user_id = u.id
        LEFT JOIN class_students cs ON c.id = cs.class_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
    ");
    $classesStmt->execute();
} else {
    $classesStmt = $db->prepare("
        SELECT c.id, c.name, c.code, c.created_at,
               COUNT(DISTINCT cs.student_user_id) as student_count
        FROM classes c
        LEFT JOIN class_students cs ON c.id = cs.class_id
        WHERE c.owner_user_id = ?
        GROUP BY c.id
        ORDER BY c.created_at DESC
    ");
    $classesStmt->execute([$userId]);
}

$classes = $classesStmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delete Class - Testing Tool</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            padding: 30px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            border-bottom: 3px solid #28a745;
            padding-bottom: 10px;
        }
        .warning {
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 20px;
            color: #856404;
        }
        .warning strong {
            color: #d9534f;
        }
        .class-list {
            margin-top: 20px;
        }
        .class-item {
            background: #f8f9fa;
            border: 2px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            transition: all 0.3s;
        }
        .class-item:hover {
            border-color: #28a745;
            box-shadow: 0 5px 15px rgba(40, 167, 69, 0.2);
        }
        .class-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .class-name {
            font-size: 1.3em;
            font-weight: bold;
            color: #28a745;
        }
        .class-code {
            color: #6c757d;
            font-size: 0.9em;
        }
        .class-info {
            display: flex;
            gap: 20px;
            margin-top: 10px;
            font-size: 0.9em;
            color: #6c757d;
        }
        .delete-btn {
            background: #dc3545;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
            transition: all 0.3s;
        }
        .delete-btn:hover {
            background: #c82333;
            transform: scale(1.05);
        }
        .delete-btn:disabled {
            background: #6c757d;
            cursor: not-allowed;
            transform: none;
        }
        .no-classes {
            text-align: center;
            padding: 40px;
            color: #6c757d;
            font-size: 1.1em;
        }
        .back-link {
            display: inline-block;
            margin-top: 20px;
            color: #28a745;
            text-decoration: none;
            font-weight: bold;
        }
        .back-link:hover {
            text-decoration: underline;
        }
        .loading {
            display: none;
            text-align: center;
            padding: 20px;
            color: #28a745;
        }
        .result {
            display: none;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
        .result.success {
            background: #d4edda;
            border: 2px solid #28a745;
            color: #155724;
        }
        .result.error {
            background: #f8d7da;
            border: 2px solid #dc3545;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🗑️ Delete Class - Testing Tool</h1>
        
        <div class="warning">
            <strong>⚠️ WARNING:</strong> This will permanently delete the class and ALL related data including:
            <ul style="margin: 10px 0 0 20px;">
                <li>All student enrollments</li>
                <li>All activity attempts and scores</li>
                <li>All activity attempt items</li>
                <li>All newsfeed posts</li>
                <li>The class itself</li>
            </ul>
            <strong>This action CANNOT be undone!</strong>
        </div>
        
        <div class="class-list">
            <?php if (empty($classes)): ?>
                <div class="no-classes">
                    <p>No classes found.</p>
                    <a href="teacher_dashboard.php" class="back-link">← Back to Dashboard</a>
                </div>
            <?php else: ?>
                <?php foreach ($classes as $class): ?>
                    <div class="class-item" data-class-id="<?php echo htmlspecialchars($class['id']); ?>">
                        <div class="class-header">
                            <div>
                                <div class="class-name"><?php echo htmlspecialchars($class['name']); ?></div>
                                <div class="class-code">Code: <?php echo htmlspecialchars($class['code']); ?></div>
                            </div>
                            <button class="delete-btn" onclick="deleteClass(<?php echo $class['id']; ?>, '<?php echo htmlspecialchars(addslashes($class['name'])); ?>')">
                                🗑️ Delete
                            </button>
                        </div>
                        <div class="class-info">
                            <span>📅 Created: <?php echo date('M d, Y', strtotime($class['created_at'])); ?></span>
                            <span>👥 Students: <?php echo (int)$class['student_count']; ?></span>
                            <?php if ($userRole === 'admin' && isset($class['firstname'])): ?>
                                <span>👤 Owner: <?php echo htmlspecialchars(trim(($class['firstname'] ?? '') . ' ' . ($class['lastname'] ?? ''))); ?></span>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
        
        <div class="loading" id="loading">
            <p>⏳ Deleting class and all related records...</p>
        </div>
        
        <div class="result" id="result"></div>
        
        <a href="<?php echo $userRole === 'admin' ? 'admin_panel.php' : 'teacher_dashboard.php'; ?>" class="back-link">← Back to Dashboard</a>
    </div>
    
    <script>
        async function deleteClass(classId, className) {
            if (!confirm(`⚠️ Are you absolutely sure you want to delete "${className}"?\n\nThis will PERMANENTLY delete:\n- The class\n- All student enrollments\n- All activity attempts and scores\n- All newsfeed posts\n\nThis action CANNOT be undone!`)) {
                return;
            }
            
            // Double confirmation
            if (!confirm(`🚨 FINAL CONFIRMATION:\n\nDelete "${className}" (ID: ${classId})?\n\nType "DELETE" in the next prompt to confirm.`)) {
                return;
            }
            
            const confirmation = prompt('Type "DELETE" to confirm:');
            if (confirmation !== 'DELETE') {
                alert('❌ Deletion cancelled. You must type "DELETE" exactly.');
                return;
            }
            
            // Show loading
            document.getElementById('loading').style.display = 'block';
            document.getElementById('result').style.display = 'none';
            
            // Disable all delete buttons
            document.querySelectorAll('.delete-btn').forEach(btn => btn.disabled = true);
            
            try {
                const formData = new FormData();
                formData.append('delete_class', '1');
                formData.append('class_id', classId);
                
                const response = await fetch('test_delete_class.php', {
                    method: 'POST',
                    body: formData,
                    credentials: 'same-origin'
                });
                
                const data = await response.json();
                
                // Hide loading
                document.getElementById('loading').style.display = 'none';
                
                // Show result
                const resultDiv = document.getElementById('result');
                resultDiv.style.display = 'block';
                
                if (data.success) {
                    resultDiv.className = 'result success';
                    let message = `✅ Class "${className}" deleted successfully!\n\n`;
                    message += `Deleted records:\n`;
                    message += `- Class: ${data.deleted.class || 0}\n`;
                    message += `- Enrollments: ${data.deleted.enrollments || 0}\n`;
                    message += `- Activity Attempts: ${data.deleted.attempts || 0}\n`;
                    message += `- Attempt Items: ${data.deleted.attempt_items || 0}\n`;
                    message += `- Newsfeed Posts: ${data.deleted.newsfeed_posts || 0}\n`;
                    message += `- Activity Schedules: ${data.deleted.activity_schedules || 0}\n`;
                    message += `- Students Affected: ${data.deleted.students || 0}\n`;
                    message += `- Activities: ${data.deleted.activities || 0}`;
                    resultDiv.innerHTML = '<pre>' + message + '</pre>';
                    
                    // Remove the class item from the list
                    const classItem = document.querySelector(`[data-class-id="${classId}"]`);
                    if (classItem) {
                        classItem.style.opacity = '0.5';
                        setTimeout(() => {
                            classItem.remove();
                            if (document.querySelectorAll('.class-item').length === 0) {
                                document.querySelector('.class-list').innerHTML = '<div class="no-classes"><p>No classes remaining.</p></div>';
                            }
                        }, 1000);
                    }
                    
                    // Reload page after 3 seconds
                    setTimeout(() => {
                        window.location.reload();
                    }, 3000);
                } else {
                    resultDiv.className = 'result error';
                    resultDiv.textContent = '❌ Error: ' + (data.message || 'Unknown error');
                    
                    // Re-enable buttons
                    document.querySelectorAll('.delete-btn').forEach(btn => btn.disabled = false);
                }
            } catch (error) {
                document.getElementById('loading').style.display = 'none';
                const resultDiv = document.getElementById('result');
                resultDiv.style.display = 'block';
                resultDiv.className = 'result error';
                resultDiv.textContent = '❌ Error: ' + error.message;
                
                // Re-enable buttons
                document.querySelectorAll('.delete-btn').forEach(btn => btn.disabled = false);
            }
        }
    </script>
</body>
</html>

