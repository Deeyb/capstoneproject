<?php
session_start();
require_once 'config.php';
require_once 'classes/auth_helpers.php';

// Check if user is logged in (allow all roles: admin, coordinator, teacher, student)
Auth::requireAuth();

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/UserManager.php';
require_once __DIR__ . '/classes/ProfileService.php';

header('Content-Type: application/json');

$db = (new Database())->getConnection();
$userManager = new UserManager($db);
$profileService = new ProfileService($db);

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$userId = $_SESSION['user_id'];

try {
    switch ($action) {
        case 'update_personal_info':
            $firstname = trim($_POST['firstname'] ?? '');
            $middlename = trim($_POST['middlename'] ?? '');
            $lastname = trim($_POST['lastname'] ?? '');
            // Email is readonly in UI; keep existing value in DB/session
            $email = $_SESSION['user_email'] ?? '';
            if (empty($email)) {
                // Fallback to DB if session email is missing
                $stmt = $db->prepare("SELECT email FROM users WHERE id = ?");
                $stmt->execute([$userId]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                $email = $row['email'] ?? '';
                if (!empty($email)) {
                    $_SESSION['user_email'] = $email;
                }
            }
            
            if (empty($firstname) || empty($lastname)) {
                echo json_encode(['success' => false, 'message' => 'First name and last name are required']);
                exit;
            }
            
            // Update only name fields; leave email unchanged
            $stmt = $db->prepare("UPDATE users SET firstname = ?, middlename = ?, lastname = ? WHERE id = ?");
            $result = $stmt->execute([$firstname, $middlename, $lastname, $userId]);
            
            if ($result) {
                // Update session variables
                $_SESSION['user_firstname'] = $firstname;
                $_SESSION['user_middlename'] = $middlename;
                $_SESSION['user_lastname'] = $lastname;
                // keep current email in session (may have been populated above)
                
                echo json_encode(['success' => true, 'message' => 'Personal information updated successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to update personal information']);
            }
            break;
            
        case 'change_password':
            $currentPassword = $_POST['current_password'] ?? '';
            $newPassword = $_POST['new_password'] ?? '';
            $confirmPassword = $_POST['confirm_password'] ?? '';
            
            
            if (empty($currentPassword) || empty($newPassword)) {
                echo json_encode(['success' => false, 'message' => 'Current password and new password are required']);
                exit;
            }
            
            // Validate password confirmation (only if provided)
            if (!empty($confirmPassword) && $newPassword !== $confirmPassword) {
                echo json_encode(['success' => false, 'message' => 'New passwords do not match']);
                exit;
            }
            
            // Check if new password is same as current password
            if ($currentPassword === $newPassword) {
                echo json_encode(['success' => false, 'message' => 'New password must be different from current password']);
                exit;
            }
            
            // Verify current password
            $stmt = $db->prepare("SELECT password FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
            
            if (!$user || !password_verify($currentPassword, $user['password'])) {
                echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
                exit;
            }
            
            // Validate new password strength
            if (strlen($newPassword) < 8 || 
                !preg_match('/[A-Z]/', $newPassword) || 
                !preg_match('/[a-z]/', $newPassword) || 
                !preg_match('/\d/', $newPassword) || 
                !preg_match('/[!@#$%^&*(),.?":{}|<>]/', $newPassword)) {
                echo json_encode(['success' => false, 'message' => 'Password does not meet requirements']);
                exit;
            }
            
            // Update password
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            $stmt = $db->prepare("UPDATE users SET password = ? WHERE id = ?");
            $result = $stmt->execute([$hashedPassword, $userId]);
            
            if ($result) {
                // Log password change (non-fatal)
                try {
                    $stmt = $db->prepare("INSERT INTO user_activity_log (user_id, action, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, NOW())");
                    $stmt->execute([$userId, 'Password Changed', $_SERVER['REMOTE_ADDR'] ?? '', $_SERVER['HTTP_USER_AGENT'] ?? '']);
                } catch (Exception $logErr) {
                    // Silently ignore logging errors
                }
                echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to change password']);
            }
            break;
            
        case 'update_preferences':
            $theme = $_POST['theme'] ?? 'light';
            $refreshRate = intval($_POST['refresh_rate'] ?? 10);
            $showNotifications = isset($_POST['show_notifications']) ? 1 : 0;
            $emailNotifications = isset($_POST['email_notifications']) ? 1 : 0;
            
            // Create or update user preferences
            $stmt = $db->prepare("INSERT INTO user_preferences (user_id, theme, refresh_rate, show_notifications, email_notifications) 
                                 VALUES (?, ?, ?, ?, ?) 
                                 ON DUPLICATE KEY UPDATE 
                                 theme = VALUES(theme), 
                                 refresh_rate = VALUES(refresh_rate), 
                                 show_notifications = VALUES(show_notifications), 
                                 email_notifications = VALUES(email_notifications)");
            
            $result = $stmt->execute([$userId, $theme, $refreshRate, $showNotifications, $emailNotifications]);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Preferences updated successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to update preferences']);
            }
            break;
            
        case 'get_preferences':
            $stmt = $db->prepare("SELECT * FROM user_preferences WHERE user_id = ?");
            $stmt->execute([$userId]);
            $preferences = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$preferences) {
                // Return default preferences
                $preferences = [
                    'theme' => 'light',
                    'refresh_rate' => 10,
                    'show_notifications' => true,
                    'email_notifications' => true
                ];
            } else {
                $preferences['show_notifications'] = (bool)$preferences['show_notifications'];
                $preferences['email_notifications'] = (bool)$preferences['email_notifications'];
            }
            
            echo json_encode(['success' => true, 'preferences' => $preferences]);
            break;
            
        case 'get_login_activity':
            $stmt = $db->prepare("SELECT action, ip_address, user_agent, created_at 
                                 FROM user_activity_log 
                                 WHERE user_id = ? 
                                 ORDER BY created_at DESC 
                                 LIMIT 20");
            $stmt->execute([$userId]);
            $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format activities for display
            $formattedActivities = array_map(function($activity) {
                return [
                    'action' => $activity['action'],
                    'ip_address' => $activity['ip_address'],
                    'user_agent' => substr($activity['user_agent'], 0, 50) . '...',
                    'time' => date('M j, Y g:i A', strtotime($activity['created_at']))
                ];
            }, $activities);
            
            echo json_encode(['success' => true, 'activities' => $formattedActivities]);
            break;

        case 'get_profile':
            $profile = $profileService->getUserProfile($userId);
            if ($profile) {
                // Get profile photo URL
                $profile['photo_url'] = $profileService->getProfilePhotoUrl($userId);
                echo json_encode(['success' => true, 'data' => $profile]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to get profile data']);
            }
            break;

        case 'update_profile':
            $firstname = trim($_POST['firstname'] ?? '');
            $middlename = trim($_POST['middlename'] ?? '');
            $lastname = trim($_POST['lastname'] ?? '');
            $email = trim($_POST['email'] ?? '');
            
            if (empty($firstname) || empty($lastname) || empty($email)) {
                echo json_encode(['success' => false, 'message' => 'First name, last name, and email are required']);
                exit;
            }
            
            // Check if email is already used by another user
            if ($profileService->isEmailUsed($email, $userId)) {
                echo json_encode(['success' => false, 'message' => 'Email is already in use by another user']);
                exit;
            }
            
            $result = $profileService->updateProfile($userId, [
                'firstname' => $firstname,
                'middlename' => $middlename,
                'lastname' => $lastname,
                'email' => $email
            ]);
            
            echo json_encode($result);
            break;

        case 'upload_photo':
            error_log("Upload photo request received for user: " . $userId);
            if (!isset($_FILES['profile_photo'])) {
                error_log("No profile_photo file found in request");
                echo json_encode(['success' => false, 'message' => 'No photo uploaded']);
                exit;
            }
            
            error_log("Profile photo file found: " . print_r($_FILES['profile_photo'], true));
            $result = $profileService->uploadProfilePhoto($userId, $_FILES['profile_photo']);
            error_log("Upload result: " . print_r($result, true));
            echo json_encode($result);
            break;

        case 'remove_photo':
            error_log("Remove photo request received for user: " . $userId);
            $result = $profileService->removeProfilePhoto($userId);
            error_log("Remove result: " . print_r($result, true));
            echo json_encode($result);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            break;
    }
} catch (Exception $e) {
    error_log("Profile action error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'An error occurred while processing your request']);
}
?> 