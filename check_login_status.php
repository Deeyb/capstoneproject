<?php
// Lightweight ping to keep the session alive (used by editors)
if (isset($_GET['ping'])) {
    if (session_status() === PHP_SESSION_NONE) { session_start(); }
    // Extend server-side session GC lifetime a bit to avoid premature cleanup
    @ini_set('session.gc_maxlifetime', 7200); // 2 hours
    $_SESSION['last_activity'] = time();
    header('Content-Type: application/json');
    echo json_encode(['ok' => true, 'ts' => time()]);
    exit;
}

// COMPREHENSIVE USER LOGIN CHECKER
echo "<h1>🔍 USER LOGIN STATUS CHECKER</h1>";

session_start();

echo "<h2>1. SESSION STATUS</h2>";
echo "Session Status: " . session_status() . "<br>";
echo "Session ID: " . session_id() . "<br>";
echo "Session Name: " . session_name() . "<br>";

echo "<h2>2. LOGIN STATUS CHECK</h2>";

// Check if user is logged in
$isLoggedIn = false;
$userInfo = [];

if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
    echo "✅ User ID found in session: " . $_SESSION['user_id'] . "<br>";
    
    // Get additional session info
    if (isset($_SESSION['user_email'])) {
        echo "✅ User Email: " . $_SESSION['user_email'] . "<br>";
        $userInfo['email'] = $_SESSION['user_email'];
    }
    
    if (isset($_SESSION['user_name'])) {
        echo "✅ User Name: " . $_SESSION['user_name'] . "<br>";
        $userInfo['name'] = $_SESSION['user_name'];
    }
    
    if (isset($_SESSION['user_role'])) {
        echo "✅ User Role: " . $_SESSION['user_role'] . "<br>";
        $userInfo['role'] = $_SESSION['user_role'];
    }
    
    if (isset($_SESSION['login_time'])) {
        echo "✅ Login Time: " . date('Y-m-d H:i:s', $_SESSION['login_time']) . "<br>";
        $userInfo['login_time'] = $_SESSION['login_time'];
    }
    
    if (isset($_SESSION['last_activity'])) {
        echo "✅ Last Activity: " . date('Y-m-d H:i:s', $_SESSION['last_activity']) . "<br>";
        $userInfo['last_activity'] = $_SESSION['last_activity'];
    }
    
    // Verify with database
    echo "<h2>3. DATABASE VERIFICATION</h2>";
    try {
        require_once 'config/Database.php';
        $db = (new Database())->getConnection();
        $stmt = $db->prepare("SELECT id, email, firstname, lastname, role FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($userData) {
            echo "✅ User exists in database<br>";
            echo "Database Name: " . $userData['firstname'] . " " . $userData['lastname'] . "<br>";
            echo "Database Email: " . $userData['email'] . "<br>";
            echo "Database Role: " . $userData['role'] . "<br>";
            
            // Check if session matches database
            if (isset($_SESSION['user_email']) && $_SESSION['user_email'] === $userData['email']) {
                echo "✅ Session email matches database<br>";
            } else {
                if (!isset($_SESSION['user_email'])) {
                    echo "⚠️ Session email not set (login process issue)<br>";
                } else {
                    echo "❌ Session email does not match database<br>";
                }
            }
            
            if (strtolower($_SESSION['user_role']) === strtolower($userData['role'])) {
                echo "✅ Session role matches database<br>";
            } else {
                echo "❌ Session role does not match database<br>";
            }
            
            $isLoggedIn = true;
            $userInfo['db_verified'] = true;
            
        } else {
            echo "❌ User not found in database<br>";
            $userInfo['db_verified'] = false;
        }
        
    } catch (Exception $e) {
        echo "❌ Database verification error: " . $e->getMessage() . "<br>";
        $userInfo['db_verified'] = false;
    }
    
} else {
    echo "❌ No user ID in session<br>";
    echo "❌ User is NOT logged in<br>";
    $isLoggedIn = false;
}

echo "<h2>4. SESSION VALIDITY</h2>";
if (isset($_SESSION['last_activity'])) {
    $timeSinceActivity = time() - $_SESSION['last_activity'];
    echo "Time since last activity: " . $timeSinceActivity . " seconds<br>";
    
    if ($timeSinceActivity < 1800) { // 30 minutes
        echo "✅ Session is still valid (less than 30 minutes)<br>";
        $userInfo['session_valid'] = true;
    } else {
        echo "⚠️ Session might be expired (more than 30 minutes)<br>";
        $userInfo['session_valid'] = false;
    }
} else {
    echo "❌ No activity tracking in session<br>";
    $userInfo['session_valid'] = false;
}

echo "<h2>5. FINAL STATUS</h2>";
if ($isLoggedIn && $userInfo['db_verified'] && $userInfo['session_valid']) {
    echo "✅ <strong>USER IS PROPERLY LOGGED IN!</strong><br>";
    echo "✅ Session is valid<br>";
    echo "✅ Database verification passed<br>";
    echo "✅ User can access the system<br>";
    
    echo "<h2>6. USER ACCESS</h2>";
    $role = strtolower($userInfo['role']);
    switch ($role) {
        case 'admin':
            echo "✅ Admin access - Can access admin panel<br>";
            echo "<a href='admin_panel.php' target='_blank'>Go to Admin Panel</a><br>";
            break;
        case 'teacher':
            echo "✅ Teacher access - Can access teacher dashboard<br>";
            echo "<a href='teacher_dashboard.php' target='_blank'>Go to Teacher Dashboard</a><br>";
            break;
        case 'coordinator':
            echo "✅ Coordinator access - Can access coordinator dashboard<br>";
            echo "<a href='coordinator_dashboard.php' target='_blank'>Go to Coordinator Dashboard</a><br>";
            break;
        case 'student':
            echo "✅ Student access - Can access student dashboard<br>";
            echo "<a href='student_dashboard.php?section=myclasses' target='_blank'>Go to Student Dashboard</a><br>";
            break;
        default:
            echo "⚠️ Unknown role: " . $userInfo['role'] . "<br>";
    }
    
} else {
    echo "❌ <strong>USER IS NOT PROPERLY LOGGED IN</strong><br>";
    echo "❌ Please log in first<br>";
    echo "<a href='login.php' target='_blank'>Go to Login Page</a><br>";
}

echo "<h2>7. COMPLETE SESSION DATA</h2>";
echo "<pre>";
print_r($_SESSION);
echo "</pre>";

echo "<h2>8. QUICK ACTIONS</h2>";
if ($isLoggedIn) {
    echo "<a href='logout.php' style='background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;'>LOGOUT</a>";
} else {
    echo "<a href='login.php' style='background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;'>LOGIN</a>";
}
echo "<a href='check_login_status.php' style='background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>REFRESH CHECK</a>";
?>

