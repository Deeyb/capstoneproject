<?php
session_start();
require_once 'config.php';
require_once 'classes/auth_helpers.php';
Auth::redirectIfLoggedIn();

if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
    $db = (new Database())->getConnection();
    $user = new User($db);
    // Load user data from DB
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
                header('Location: teacher_dashboard.php?section=my-classes');
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
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration - CodeRegal</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="assets/css/registration.css">
    <link rel="icon" type="image/svg+xml" href="Photos/CodeRegalWB.svg">
</head>
<body>
    <div class="container">
        <div class="registration-card">
            <div class="text-center mb-1">
                <img src="Photos/CodeRegal.svg" alt="CodeRegal Logo" class="img-logo">
                <h1 class="login-title mt-3 mb-2">Registration</h1>
                <p class="login-subtitle text-center mb-4">
                  <i class="fa-solid fa-user-plus me-1"></i>
                  Sign up to join <span class="brand-green">Code<span class="brand-gold">Regal</span></span>
                </p>
            </div>
            
            <!-- Dynamic Alert Container -->
            <div id="alertContainer" class="alert-container"></div>
            
            <form id="registrationForm">
                <?php require_once 'classes/CSRFProtection.php'; echo CSRFProtection::getTokenField(); ?>
                <div class="row g-3">
                    <div class="col-md-6">
                <div class="mb-3">
                            <label for="firstname" class="form-label">First Name<span class="text-danger">*</span></label>
                            <div class="input-group">
                    <input type="text" class="form-control" id="firstname" name="firstname" placeholder="Enter first name" required>
                                <span class="input-group-text validation-icon" id="firstnameIcon"><i class="fa fa-circle"></i></span>
                            </div>
                    <div id="firstnameError" class="error-message"></div>
                </div>
                <div class="mb-3">
                            <label for="middlename" class="form-label">Middle Name <span class="text-muted">(Optional)</span></label>
                            <div class="input-group">
                    <input type="text" class="form-control" id="middlename" name="middlename" placeholder="Enter middle name">
                                <span class="input-group-text validation-icon" id="middlenameIcon"><i class="fa fa-circle"></i></span>
                            </div>
                    <div id="middlenameError" class="error-message"></div>
                </div>
                <div class="mb-3">
                            <label for="lastname" class="form-label">Last Name<span class="text-danger">*</span></label>
                            <div class="input-group">
                    <input type="text" class="form-control" id="lastname" name="lastname" placeholder="Enter last name" required>
                                <span class="input-group-text validation-icon" id="lastnameIcon"><i class="fa fa-circle"></i></span>
                            </div>
                    <div id="lastnameError" class="error-message"></div>
                </div>
                <div class="mb-3">
                            <label for="idnumber" class="form-label">ID Number<span class="text-danger">*</span></label>
                            <div class="input-group">
                    <input type="text" class="form-control" id="idnumber" name="idnumber" placeholder="KLD-22-000123" pattern="KLD-\d{2}-\d{6}" required>
                                <span class="input-group-text validation-icon" id="idnumberIcon"><i class="fa fa-circle"></i></span>
                            </div>
                    <div id="idnumberError" class="error-message"></div>
                        </div>
                </div>
                    <div class="col-md-6">
                <div class="mb-3">
                            <label for="email" class="form-label">Email Address<span class="text-danger">*</span></label>
                            <div class="input-group">
                    <input type="email" class="form-control" id="email" name="email" placeholder="e.g., jdelacruz@kld.edu.ph" pattern="[a-zA-Z0-9._%+\-]+@kld\.edu\.ph" required>
                                <span class="input-group-text validation-icon" id="emailIcon"><i class="fa fa-circle"></i></span>
                            </div>
                    <div id="emailError" class="error-message"></div>
                </div>
                        <div class="mb-3 position-relative">
                            <label for="password" class="form-label">Password<span class="text-danger">*</span></label>
                            <div class="input-group">
                                <input type="password" class="form-control" id="password" name="password" placeholder="Create a strong password" required aria-describedby="passwordFeedback">
                                <span class="input-group-text password-toggle-eye" onclick="togglePassword('password', 'togglePasswordIcon')"><i id="togglePasswordIcon" class="fa fa-eye"></i></span>
                                <span class="input-group-text feedback-icon" id="passwordFeedback"><i class="fa fa-circle"></i></span>
                </div>
                    <div id="passwordError" class="error-message"></div>
                </div>
                        <div class="mb-3 position-relative">
                            <label for="confirmPassword" class="form-label">Confirm Password<span class="text-danger">*</span></label>
                            <div class="input-group">
                                <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" placeholder="Confirm your password" required aria-describedby="confirmPasswordFeedback">
                                <span class="input-group-text password-toggle-eye" onclick="togglePassword('confirmPassword', 'toggleConfirmPasswordIcon')"><i id="toggleConfirmPasswordIcon" class="fa fa-eye"></i></span>
                                <span class="input-group-text feedback-icon" id="confirmPasswordFeedback"><i class="fa fa-circle"></i></span>
                    </div>
                            <div id="confirmPasswordError" class="error-message"></div>
                            <div id="passwordChecklist" class="password-checklist hide">
                                <ul>
                                    <li id="pw-length"><i class="fa fa-circle"></i> At least 8 characters</li>
                                    <li id="pw-upper"><i class="fa fa-circle"></i> Uppercase letter</li>
                                    <li id="pw-lower"><i class="fa fa-circle"></i> Lowercase letter</li>
                                    <li id="pw-number"><i class="fa fa-circle"></i> Number</li>
                                    <li id="pw-special"><i class="fa fa-circle"></i> Special character</li>
                        </ul>
                                <div class="strength-bar-container">
                                    <div class="strength-bar" id="strengthBar"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <div class="mb-3 mt-2">
                            <label for="verification" class="form-label">Email Verification Code<span class="text-danger">*</span></label>
                            <div class="verification-flex">
                        <input type="text" class="form-control" id="verification" name="verification" placeholder="Enter verification code" required>
                                <button type="button" class="btn btn-outline-success" id="sendCodeBtn">
                                    <span class="btn-text">Send Code</span>
                                    <span class="btn-loading d-none"><i class="fa fa-spinner fa-spin"></i> Sending...</span>
                                </button>
                    </div>

                            <div class="verification-info mt-1"><small>A verification code will be sent to your email address</small></div>
                        </div>
                </div>
                </div>
                
                <!-- Terms and Conditions -->
                <div class="mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="termsConditions" name="termsConditions" required>
                        <label class="form-check-label" for="termsConditions">
                            I agree to the <a href="#" class="terms-link">Terms and Conditions</a> and <a href="#" class="privacy-link">Privacy Policy</a><span class="text-danger">*</span>
                        </label>
                    </div>
                    
                </div>
                
                <button type="submit" class="btn btn-success create-account-btn w-100" id="submitBtn">
                    <span class="btn-text">Create Account</span>
                    <span class="btn-loading d-none"><i class="fa fa-spinner fa-spin"></i> Creating Account...</span>
                </button>
            </form>
            <div class="text-center mt-3">
                Already have an account? <a href="login.php" class="signin-link">Sign in</a>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="assets/js/registration.js?v=<?php echo time(); ?>"></script>
</body>
</html>