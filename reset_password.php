<?php
// reset_password.php
session_start();
// Set PHP timezone to UTC
date_default_timezone_set('UTC');
$token = $_GET['token'] ?? '';
$feedback = isset($_SESSION['reset_feedback']) ? $_SESSION['reset_feedback'] : '';
unset($_SESSION['reset_feedback']);

// Debug block: only show if ?debug=1 is in the URL
if (isset($_GET['debug']) && $_GET['debug'] == '1') {
    echo '<div style="background:#fee;border:2px solid #c00;padding:10px;margin:10px 0;">';
    echo '<b>DEBUG MODE ENABLED</b><br>';
    echo 'Token from URL: <code>' . htmlspecialchars($token) . '</code><br>';
    require_once __DIR__ . '/config/Database.php';
    require_once __DIR__ . '/classes/User.php';
    $db = (new Database())->getConnection();
    if ($db) {
        echo 'DB Connection: <span style="color:green">OK</span><br>';
        $user = User::findByResetToken($db, $token);
        if ($user) {
            echo 'User found for token: <span style="color:green">YES</span><br>';
            echo 'User email: ' . htmlspecialchars($user->getEmail()) . '<br>';
            echo 'Token is valid and not expired.<br>';
        } else {
            echo 'User found for token: <span style="color:red">NO</span><br>';
            // Check if token exists but is expired
            $stmt = $db->prepare("SELECT reset_token, reset_token_expires, email FROM users WHERE reset_token = ?");
            $stmt->execute([$token]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                echo 'Token exists in DB for email: ' . htmlspecialchars($row['email']) . '<br>';
                echo 'Token expiry: ' . htmlspecialchars($row['reset_token_expires']) . '<br>';
                echo 'Current server time: ' . date('Y-m-d H:i:s') . '<br>';
                if (strtotime($row['reset_token_expires']) < time()) {
                    echo '<span style="color:red">Token is expired.</span><br>';
                } else {
                    echo '<span style="color:orange">Token is not expired, but user not found (possible logic error).</span><br>';
                }
            } else {
                echo 'Token does not exist in DB.<br>';
            }
        }
    } else {
        echo 'DB Connection: <span style="color:red">FAILED</span><br>';
    }
    echo '</div>';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password | CodeRegal</title>
    <link rel="stylesheet" href="assets/css/login.css">
    <link rel="stylesheet" href="assets/css/forgot_reset.css">
    <link rel="icon" type="image/svg+xml" href="Photos/CodeRegal.svg">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <div class="reset-card">
            <div class="text-center mb-3">
                <img src="Photos/CodeRegal.svg" alt="Logo" class="img-logo" style="width:180px;">
                <h1 class="reset-title mt-3 mb-2">Reset Password</h1>
                <p class="reset-subtitle">Enter your new password below. Password must be at least 8 characters, with uppercase, lowercase, number, and special character.</p>
            </div>
            <?php if ($feedback): ?>
                <div class="alert alert-info text-center" role="alert" aria-live="polite"><?php echo htmlspecialchars($feedback); ?></div>
            <?php endif; ?>
            <form action="process_reset_password.php" method="POST" id="resetForm" autocomplete="on" onsubmit="return handleResetSubmit(event)">
                <input type="hidden" name="token" value="<?php echo htmlspecialchars($token); ?>">
                <div class="mb-3 position-relative">
                    <label for="password" class="form-label">New Password<span class="text-danger">*</span></label>
                    <div class="input-group">
                        <input type="password" class="form-control" id="password" name="password" placeholder="Enter new password" required autocomplete="new-password" aria-label="New Password">
                        <button type="button" class="input-group-text password-toggle-eye" aria-label="Show or hide password" onclick="togglePassword('password', 'togglePasswordIcon')"><i id="togglePasswordIcon" class="fa fa-eye" aria-hidden="true"></i></button>
                    </div>
                    <div id="passwordError" class="error-message" role="alert" aria-live="polite"></div>
                </div>
                <div class="mb-3 position-relative">
                    <label for="confirmPassword" class="form-label">Confirm New Password<span class="text-danger">*</span></label>
                    <div class="input-group">
                        <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" placeholder="Confirm new password" required autocomplete="new-password" aria-label="Confirm New Password">
                        <button type="button" class="input-group-text password-toggle-eye" aria-label="Show or hide confirm password" onclick="togglePassword('confirmPassword', 'toggleConfirmPasswordIcon')"><i id="toggleConfirmPasswordIcon" class="fa fa-eye" aria-hidden="true"></i></button>
                    </div>
                    <div id="confirmPasswordError" class="error-message" role="alert" aria-live="polite"></div>
                </div>
                <button type="submit" class="btn btn-success w-100" id="resetBtn">
                    <span class="btn-text">Reset Password</span>
                    <span class="btn-loading d-none"><i class="fa fa-spinner fa-spin"></i> Resetting...</span>
                </button>
            </form>
            <div class="text-center mt-3">
                <a href="login.php" class="signin-link">Back to Login</a>
            </div>
        </div>
    </div>
    <script src="assets/js/forgot_reset.js"></script>
</body>
</html> 