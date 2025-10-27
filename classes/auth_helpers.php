<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/User.php';

class Auth {
    public static function redirectIfLoggedIn() {
        if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
            $db = (new Database())->getConnection();
            $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($userData) {
                $user = new User($db, $userData);
                $role = strtolower($user->getRole());
                switch ($role) {
                    case 'admin':
                        header('Location: admin_panel.php');
                        break;
                    case 'teacher':
                        header('Location: Teacher_dashboard.php?section=my-classes');
                        break;
                    case 'coordinator':
                        header('Location: coordinator_dashboard.php');
                        break;
                    case 'student':
                    default:
                        header('Location: student_dashboard.php?section=myclasses');
                        break;
                }
                exit();
            }
        }
    }

    public static function requireAuth() {
        if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
            header('Location: login.php');
            exit();
        }
    }

    public static function requireRole($role) {
        if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
            header('Location: login.php');
            exit();
        }
        $db = (new Database())->getConnection();
        $stmt = $db->prepare("SELECT role FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $userRole = isset($row['role']) ? strtolower(trim($row['role'])) : '';
        if (strtolower(trim($role)) !== $userRole) {
            // Optionally, redirect to their dashboard or show an error
            header('Location: login.php?error=forbidden');
            exit();
        }
    }

    public static function getClientIP() {
        $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        foreach ($ipKeys as $key) {
            if (isset($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
} 