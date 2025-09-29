<?php
// forgot_password.php
session_start();
require_once 'config.php';
require_once 'classes/auth_helpers.php';
Auth::redirectIfLoggedIn();

$feedback = isset($_SESSION['forgot_feedback']) ? $_SESSION['forgot_feedback'] : '';
unset($_SESSION['forgot_feedback']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password | CodeRegal</title>
    <link rel="stylesheet" href="assets/css/login.css">
    <link rel="stylesheet" href="assets/css/forgot_reset.css">
    <link rel="icon" type="image/svg+xml" href="Photos/CodeRegal.svg">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <div class="forgot-card">
            <div class="text-center mb-3">
                <img src="Photos/CodeRegal.svg" alt="Logo" class="img-logo" style="width:180px;">
                <h1 class="forgot-title mt-3 mb-2">Forgot Password</h1>
                <p class="forgot-subtitle">Enter your email address and we'll send you a link to reset your password.</p>
            </div>
            <?php if ($feedback): ?>
                <div class="alert alert-info text-center" role="alert" aria-live="polite"><?php echo htmlspecialchars($feedback); ?></div>
            <?php endif; ?>
            <form action="send_reset_link.php" method="POST" id="forgotForm" autocomplete="on" onsubmit="return handleForgotSubmit(event)">
                <div class="mb-3">
                    <label for="email" class="form-label">Email Address<span class="text-danger">*</span></label>
                    <input type="email" class="form-control" id="email" name="email" placeholder="e.g., jdelacruz@kld.edu.ph" required autocomplete="username" aria-label="Email Address">
                </div>
                <button type="submit" class="btn btn-success w-100" id="forgotBtn">
                    <span class="btn-text">Send Reset Link</span>
                    <span class="btn-loading d-none"><i class="fa fa-spinner fa-spin"></i> Sending...</span>
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