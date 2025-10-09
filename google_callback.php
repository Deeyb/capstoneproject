<?php
session_start();
require_once 'config.php';
require_once 'config/google_oauth.php';
require_once 'config/Database.php';

try {
    // Check if we have an authorization code
    if (!isset($_GET['code'])) {
        throw new Exception('No authorization code received from Google');
    }
    
    $code = $_GET['code'];
    
    // Exchange authorization code for access token
    $token_data = getGoogleAccessToken($code);
    
    if (!isset($token_data['access_token'])) {
        throw new Exception('Failed to get access token from Google');
    }
    
    $access_token = $token_data['access_token'];
    
    // Get user information from Google
    $user_info = getGoogleUserInfo($access_token);
    
    if (!isset($user_info['email'])) {
        throw new Exception('Failed to get user information from Google');
    }
    
    // Connect to database
    $db = (new Database())->getConnection();
    
    // Check if user already exists by email
    $stmt = $db->prepare("SELECT id, email, firstname, lastname, role, google_id, status, middlename FROM users WHERE email = ?");
    $stmt->execute([$user_info['email']]);
    $existing_user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existing_user) {
        // User exists, update Google ID if not set
        if (empty($existing_user['google_id'])) {
            $stmt = $db->prepare("UPDATE users SET google_id = ? WHERE id = ?");
            $stmt->execute([$user_info['id'], $existing_user['id']]);
        }

        // Only allow login if user is active
        if (isset($existing_user['status']) && strtolower($existing_user['status']) !== 'active') {
            throw new Exception('Your account is not active. Please contact admin.');
        }

        // Set session (include real name)
        $_SESSION['user_id'] = $existing_user['id'];
        $_SESSION['user_email'] = $existing_user['email'];
        $_SESSION['user_role'] = $existing_user['role'];
        $_SESSION['user_firstname'] = $existing_user['firstname'];
        $_SESSION['user_lastname'] = $existing_user['lastname'];
        $_SESSION['user_middlename'] = $existing_user['middlename'] ?? '';
        $middle_initial = $_SESSION['user_middlename'] ? strtoupper(mb_substr(trim($_SESSION['user_middlename']), 0, 1)) . '.' : '';
        $_SESSION['user_name'] = trim($_SESSION['user_lastname'] . ', ' . $_SESSION['user_firstname'] . ' ' . $middle_initial);

        // Log the login
        $stmt = $db->prepare("INSERT INTO login_logs (user_id, login_method, ip_address, user_agent) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $existing_user['id'],
            'google_oauth',
            $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);
    } else {
        // User not found in database, do not allow login
        throw new Exception('Your account is not registered. Please contact the administrator.');
    }
    
    // Redirect based on role
    $role = $_SESSION['user_role'] ?? 'student';
    switch (strtolower($role)) {
        case 'admin':
            header('Location: admin_panel.php');
            break;
        case 'teacher':
            header('Location: Teacher_dashboard.php');
            break;
        case 'coordinator':
            header('Location: coordinator_dashboard.php');
            break;
        case 'student':
        default:
            header('Location: student_dashboard.php');
            break;
    }
    exit();
    
} catch (Exception $e) {
    // Log error
    error_log('Google OAuth Error: ' . $e->getMessage());
    
    // Set error message and redirect back to login
    $_SESSION['error'] = 'Google login failed: ' . $e->getMessage();
    header('Location: login.php');
    exit();
}
?> 