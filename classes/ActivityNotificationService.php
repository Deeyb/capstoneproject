<?php
/**
 * Activity Notification Service
 * Handles email notifications for activity-related events (unlock, due date reminders, etc.)
 */
class ActivityNotificationService {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    /**
     * Send email notification to students when activity is unlocked
     * 
     * @param int $activityId Activity ID
     * @param int $classId Class ID
     * @param string $startAt Activity start date/time
     * @param string $dueAt Activity due date/time
     * @return array Result with success status and details
     */
    public function notifyActivityUnlocked($activityId, $classId, $startAt, $dueAt) {
        try {
            // Get activity details
            $activity = $this->getActivityDetails($activityId);
            if (!$activity) {
                return [
                    'success' => false,
                    'message' => 'Activity not found'
                ];
            }
            
            // Get class details
            $class = $this->getClassDetails($classId);
            if (!$class) {
                return [
                    'success' => false,
                    'message' => 'Class not found'
                ];
            }
            
            // Get all accepted students in the class with email addresses
            $students = $this->getEnrolledStudents($classId);
            if (empty($students)) {
                return [
                    'success' => true,
                    'message' => 'No enrolled students to notify',
                    'sent_count' => 0
                ];
            }
            
            // Send email to each student
            $sentCount = 0;
            $failedCount = 0;
            $errors = [];
            
            foreach ($students as $student) {
                if (empty($student['email'])) {
                    continue; // Skip students without email
                }
                
                $sent = $this->sendActivityUnlockEmail(
                    $student['email'],
                    $student['firstname'],
                    $activity,
                    $class,
                    $startAt,
                    $dueAt
                );
                
                if ($sent) {
                    $sentCount++;
                } else {
                    $failedCount++;
                    $errors[] = "Failed to send to {$student['email']}";
                }
            }
            
            return [
                'success' => true,
                'message' => "Sent {$sentCount} notification(s), {$failedCount} failed",
                'sent_count' => $sentCount,
                'failed_count' => $failedCount,
                'errors' => $errors
            ];
            
        } catch (Exception $e) {
            error_log("ActivityNotificationService::notifyActivityUnlocked error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error sending notifications: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Get activity details
     */
    private function getActivityDetails($activityId) {
        $stmt = $this->db->prepare("
            SELECT 
                la.id,
                la.title,
                la.type,
                la.instructions,
                la.max_score,
                cl.title as lesson_title,
                cm.title as module_title
            FROM lesson_activities la
            INNER JOIN course_lessons cl ON la.lesson_id = cl.id
            INNER JOIN course_modules cm ON cl.module_id = cm.id
            WHERE la.id = ?
        ");
        $stmt->execute([$activityId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Get class details
     */
    private function getClassDetails($classId) {
        $stmt = $this->db->prepare("
            SELECT 
                c.id,
                c.name as class_name,
                c.code as class_code,
                u.firstname as teacher_firstname,
                u.lastname as teacher_lastname
            FROM classes c
            INNER JOIN users u ON c.owner_user_id = u.id
            WHERE c.id = ? AND c.status = 'active'
        ");
        $stmt->execute([$classId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Get enrolled students with email addresses (only accepted students)
     */
    private function getEnrolledStudents($classId) {
        // Check if status column exists
        $hasStatus = false;
        try {
            $checkStmt = $this->db->query("SHOW COLUMNS FROM class_students LIKE 'status'");
            $hasStatus = $checkStmt->rowCount() > 0;
        } catch (Exception $e) {
            // Column doesn't exist
        }
        
        if ($hasStatus) {
            $stmt = $this->db->prepare("
                SELECT 
                    u.id,
                    u.firstname,
                    u.lastname,
                    u.email
                FROM class_students cs
                INNER JOIN users u ON cs.student_user_id = u.id
                WHERE cs.class_id = ? 
                AND u.status = 'active' 
                AND cs.status = 'accepted'
                AND u.email IS NOT NULL
                AND u.email != ''
            ");
        } else {
            // Fallback for old schema
            $stmt = $this->db->prepare("
                SELECT 
                    u.id,
                    u.firstname,
                    u.lastname,
                    u.email
                FROM class_students cs
                INNER JOIN users u ON cs.student_user_id = u.id
                WHERE cs.class_id = ? 
                AND u.status = 'active'
                AND u.email IS NOT NULL
                AND u.email != ''
            ");
        }
        
        $stmt->execute([$classId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Send activity unlock email to a student
     */
    private function sendActivityUnlockEmail($toEmail, $studentName, $activity, $class, $startAt, $dueAt) {
        try {
            require_once __DIR__ . '/../PHPMailer/src/Exception.php';
            require_once __DIR__ . '/../PHPMailer/src/PHPMailer.php';
            require_once __DIR__ . '/../PHPMailer/src/SMTP.php';
            
            // Load environment variables
            if (!class_exists('EnvironmentLoader')) {
                require_once __DIR__ . '/EnvironmentLoader.php';
            }
            EnvironmentLoader::load();
            
            $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
            
            // SMTP Configuration
            $mail->isSMTP();
            $mail->Host       = EnvironmentLoader::get('SMTP_HOST', 'smtp.gmail.com');
            $mail->SMTPAuth   = true;
            $mail->Username   = EnvironmentLoader::get('SMTP_USERNAME');
            // Clean password (remove spaces) - important for Gmail App Passwords
            $password = trim(EnvironmentLoader::get('SMTP_PASSWORD'));
            $password = str_replace(' ', '', $password);
            $mail->Password   = $password;
            $mail->SMTPSecure = EnvironmentLoader::get('SMTP_ENCRYPTION', 'tls');
            $mail->Port       = (int)EnvironmentLoader::get('SMTP_PORT', 587);
            $mail->Timeout    = 15; // Increase timeout for reliability
            
            // Email settings
            $fromEmail = EnvironmentLoader::get('SMTP_USERNAME');
            $fromName  = EnvironmentLoader::get('SMTP_FROM_NAME', 'Code Regal');
            if ($fromEmail) {
                $mail->setFrom($fromEmail, $fromName);
            }
            $mail->addAddress($toEmail, $studentName);
            
            // Email content
            $mail->isHTML(true);
            $mail->Subject = 'New Activity Available: ' . htmlspecialchars($activity['title']);
            
            // Format dates
            $startDateFormatted = $this->formatDateTime($startAt);
            $dueDateFormatted = $this->formatDateTime($dueAt);
            
            // Get activity type display name
            $activityTypeDisplay = $this->getActivityTypeDisplay($activity['type']);
            
            // Build email body
            $mail->Body = $this->buildEmailBody($studentName, $activity, $class, $startDateFormatted, $dueDateFormatted, $activityTypeDisplay);
            
            // Send email
            $mail->send();
            error_log("Activity unlock email sent successfully to: {$toEmail}");
            return true;
            
        } catch (\PHPMailer\PHPMailer\Exception $e) {
            error_log("PHPMailer error sending to {$toEmail}: " . $e->getMessage());
            return false;
        } catch (Exception $e) {
            error_log("Error sending activity unlock email to {$toEmail}: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Format datetime for display
     */
    private function formatDateTime($datetime) {
        if (empty($datetime)) {
            return 'Not set';
        }
        
        try {
            $dt = new DateTime($datetime, new DateTimeZone('Asia/Manila'));
            return $dt->format('F d, Y h:i A');
        } catch (Exception $e) {
            return $datetime;
        }
    }
    
    /**
     * Get activity type display name
     */
    private function getActivityTypeDisplay($type) {
        $types = [
            'multiple_choice' => 'Multiple Choice',
            'mcq' => 'Multiple Choice',
            'quiz' => 'Quiz',
            'true_false' => 'True/False',
            'identification' => 'Identification',
            'matching' => 'Matching',
            'essay' => 'Essay',
            'upload_based' => 'File Upload',
            'coding' => 'Coding Activity'
        ];
        
        return $types[strtolower($type)] ?? ucfirst($type);
    }
    
    /**
     * Build HTML email body
     */
    private function buildEmailBody($studentName, $activity, $class, $startDate, $dueDate, $activityType) {
        $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://')
            . ($_SERVER['HTTP_HOST'] ?? 'localhost')
            . rtrim(dirname($_SERVER['PHP_SELF'] ?? '/'), '/');
        
        $classUrl = $baseUrl . '/class_dashboard.php?class_id=' . $class['id'];
        
        return "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>New Activity Available</title>
</head>
<body style='margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f5f5;'>
    <table role='presentation' style='width:100%;border-collapse:collapse;background-color:#f5f5f5;'>
        <tr>
            <td style='padding:20px 0;'>
                <table role='presentation' style='width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);'>
                    <!-- Header -->
                    <tr>
                        <td style='padding:30px;background-color:#1d9b3e;border-radius:8px 8px 0 0;text-align:center;'>
                            <h1 style='margin:0;color:#ffffff;font-size:24px;font-weight:600;'>New Activity Available</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style='padding:30px;'>
                            <p style='margin:0 0 20px 0;font-size:16px;color:#333333;line-height:1.6;'>
                                Hi <strong>{$studentName}</strong>,
                            </p>
                            
                            <p style='margin:0 0 20px 0;font-size:16px;color:#333333;line-height:1.6;'>
                                Your teacher has opened a new activity in <strong>{$class['class_name']}</strong>.
                            </p>
                            
                            <!-- Activity Details Card -->
                            <div style='background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0;'>
                                <h2 style='margin:0 0 15px 0;font-size:20px;color:#111827;font-weight:600;'>
                                    " . htmlspecialchars($activity['title']) . "
                                </h2>
                                
                                <table role='presentation' style='width:100%;border-collapse:collapse;'>
                                    <tr>
                                        <td style='padding:8px 0;font-size:14px;color:#6b7280;width:140px;'>Activity Type:</td>
                                        <td style='padding:8px 0;font-size:14px;color:#111827;font-weight:500;'>{$activityType}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding:8px 0;font-size:14px;color:#6b7280;'>Class:</td>
                                        <td style='padding:8px 0;font-size:14px;color:#111827;font-weight:500;'>" . htmlspecialchars($class['class_name']) . " ({$class['class_code']})</td>
                                    </tr>
                                    <tr>
                                        <td style='padding:8px 0;font-size:14px;color:#6b7280;'>Module:</td>
                                        <td style='padding:8px 0;font-size:14px;color:#111827;font-weight:500;'>" . htmlspecialchars($activity['module_title']) . "</td>
                                    </tr>
                                    <tr>
                                        <td style='padding:8px 0;font-size:14px;color:#6b7280;'>Lesson:</td>
                                        <td style='padding:8px 0;font-size:14px;color:#111827;font-weight:500;'>" . htmlspecialchars($activity['lesson_title']) . "</td>
                                    </tr>
                                    <tr>
                                        <td style='padding:8px 0;font-size:14px;color:#6b7280;'>Opens:</td>
                                        <td style='padding:8px 0;font-size:14px;color:#1d9b3e;font-weight:600;'>{$startDate}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding:8px 0;font-size:14px;color:#6b7280;'>Due Date:</td>
                                        <td style='padding:8px 0;font-size:14px;color:#dc3545;font-weight:600;'>{$dueDate}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding:8px 0;font-size:14px;color:#6b7280;'>Max Score:</td>
                                        <td style='padding:8px 0;font-size:14px;color:#111827;font-weight:500;'>" . number_format($activity['max_score'], 0) . " points</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style='margin:20px 0;font-size:16px;color:#333333;line-height:1.6;'>
                                Please make sure to complete this activity before the due date.
                            </p>
                            
                            <!-- CTA Button -->
                            <table role='presentation' style='width:100%;margin:30px 0;'>
                                <tr>
                                    <td style='text-align:center;'>
                                        <a href='{$classUrl}' style='display:inline-block;padding:14px 28px;background-color:#1d9b3e;color:#ffffff;text-decoration:none;border-radius:6px;font-size:16px;font-weight:600;'>
                                            View Activity
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style='margin:20px 0 0 0;font-size:14px;color:#6b7280;line-height:1.6;'>
                                This is an automated notification from Code Regal. If you have any questions, please contact your teacher.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='padding:20px 30px;background-color:#f9fafb;border-top:1px solid #e5e7eb;border-radius:0 0 8px 8px;text-align:center;'>
                            <p style='margin:0;font-size:12px;color:#6b7280;'>
                                © " . date('Y') . " Code Regal. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        ";
    }
}
?>

