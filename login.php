<?php
session_start();
require_once 'config.php';
require_once 'classes/auth_helpers.php';
Auth::redirectIfLoggedIn();
require_once 'classes/CSRFProtection.php';
require_once 'config/google_oauth.php';

if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
    // Role-based redirect
    require_once 'config/Database.php';
    $db = (new Database())->getConnection();
    $stmt = $db->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $role = isset($row['role']) ? strtolower($row['role']) : '';
    switch ($role) {
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
}

$errorMsg = isset($_SESSION['error']) ? $_SESSION['error'] : '';
unset($_SESSION['error']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login | Code Regal</title>
    <?php if (!empty($errorMsg)): ?>
    <meta name="error-message" content="<?php echo htmlspecialchars($errorMsg); ?>">
    <?php endif; ?>
    <link rel="stylesheet" href="assets/css/login.css">
    <link rel="icon" type="image/svg+xml" href="Photos/CodeRegal.svg">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div id="alertContainer" class="alert-container" role="alert" aria-live="polite" aria-atomic="true"></div>
    <div class="container">
        <div class="registration-card login-card">
            <div class="text-center mb-1">
                <img src="Photos/CodeRegal.svg" alt="CodeRegal Logo" class="img-logo">
                <h1 class="login-title mt-3 mb-2">Login</h1>
                <p class="login-subtitle text-center mb-4">
                  <i class="fa-solid fa-right-to-bracket me-1" aria-hidden="true"></i>
                  Sign in to continue to <span class="brand-green">Code<span class="brand-gold">Regal</span></span>
                </p>
    </div>
            <!-- Google Login Button -->
            <div class="mb-4">
                <a href="<?php echo getGoogleAuthUrl(); ?>" class="btn btn-google w-100" id="googleLoginBtn" style="background: #fff; color: #444; border: 1px solid #ddd; font-weight: 500;">
                    <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" style="height:20px;vertical-align:middle;margin-right:8px;">
                    <span class="btn-text">Continue with Google</span>
                    <span class="btn-loading d-none" aria-hidden="true">
                        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i> Connecting...
                    </span>
                </a>
            </div>
            <!-- Divider -->
            <div class="divider mb-4">
                <span class="divider-text">or</span>
            </div>
            
            <form id="loginForm" autocomplete="on" novalidate>
                <?php echo CSRFProtection::getTokenField(); ?>
                <div class="mb-3">
                    <label for="email" class="form-label">Email Address<span class="text-danger" aria-label="required">*</span></label>
                    <input 
                        type="email" 
                        class="form-control" 
                        id="email" 
                        name="email" 
                        placeholder="e.g., jdelacruz@kld.edu.ph" 
                        required 
                        autocomplete="username"
                        aria-describedby="emailHelp"
                        aria-invalid="false"
                    >
                    <div id="emailHelp" class="form-text visually-hidden">Enter your KLD email address</div>
                </div>
                <div class="mb-3 position-relative">
                    <label for="password" class="form-label">Password<span class="text-danger" aria-label="required">*</span></label>
                    <div class="input-group">
                        <input 
                            type="password" 
                            class="form-control" 
                            id="password" 
                            name="password" 
                            placeholder="Enter your password" 
                            required 
                            autocomplete="current-password"
                            aria-describedby="passwordHelp"
                            aria-invalid="false"
                        >
                        <span 
                            class="input-group-text password-toggle-eye" 
                            tabindex="0" 
                            role="button"
                            aria-label="Show or hide password"
                            aria-pressed="false"
                            aria-controls="password"
                        >
                            <i id="togglePasswordIcon" class="fa-solid fa-eye" aria-hidden="true"></i>
                    </span>
                </div>
                    <div id="passwordHelp" class="form-text visually-hidden">Enter your password (minimum 8 characters)</div>
                </div>
                <div class="mb-3">
                    <div class="form-check">
                        <input 
                            class="form-check-input" 
                            type="checkbox" 
                            id="rememberMe" 
                            name="rememberMe"
                            aria-describedby="rememberMeHelp"
                        >
                        <label class="form-check-label" for="rememberMe">
                            Remember me
                        </label>
                        <div id="rememberMeHelp" class="form-text visually-hidden">Stay logged in for 30 days</div>
                </div>
                </div>
                <div class="mb-3 text-end">
                    <button type="button" class="forgot-link btn btn-link p-0" data-bs-toggle="modal" data-bs-target="#forgotPasswordModal" aria-label="Forgot your password?">Forgot Password?</button>
                </div>
                <button 
                    type="submit" 
                    class="btn btn-success create-account-btn w-100" 
                    id="signInBtn"
                    aria-describedby="submitHelp"
                >
                    <span class="btn-text">Sign in</span>
                    <span class="btn-loading d-none" aria-hidden="true">
                        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i> Signing in...
                    </span>
                </button>
                <div id="submitHelp" class="form-text visually-hidden">Click to sign in to your account</div>
            </form>
            <div class="text-center mt-3">
                <span>Don't have an account? <a href="registration.php" class="signin-link" aria-label="Create a new account">Sign up!</a></span>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="assets/js/login.js"></script>
    <script src="assets/js/forgot_reset.js"></script>

    <!-- Forgot Password Modal -->
    <div class="modal fade" id="forgotPasswordModal" tabindex="-1" aria-labelledby="forgotPasswordModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title forgot-title" id="forgotPasswordModalLabel">Forgot Password</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="text-center mb-3">
              <img src="Photos/CodeRegal.svg" alt="Logo" class="img-logo" style="width:120px;">
              <p class="forgot-subtitle">Enter your email address and we'll send you a link to reset your password.</p>
            </div>
            <form action="send_reset_link.php" method="POST" id="forgotForm" autocomplete="on" onsubmit="return handleForgotSubmit(event)">
              <div class="mb-3">
                <label for="forgot_email" class="form-label">Email Address<span class="text-danger">*</span></label>
                <input type="email" class="form-control" id="forgot_email" name="email" placeholder="e.g., jdelacruz@kld.edu.ph" required autocomplete="username" aria-label="Email Address">
              </div>
              <button type="submit" class="btn btn-success w-100" id="forgotBtn">
                <span class="btn-text">Send Reset Link</span>
                <span class="btn-loading d-none"><i class="fa fa-spinner fa-spin"></i> Sending...</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    <!-- Toast Container for notifications -->
    <div class="position-fixed top-0 end-0 p-3" style="z-index: 1200">
      <div id="toastContainer" class="toast-container"></div>
    </div>
</body>
</html>