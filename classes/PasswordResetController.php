<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/User.php';
require_once __DIR__ . '/EnvironmentLoader.php';

class PasswordResetController {
    public function handle($post) {
        // Set PHP timezone to UTC
        date_default_timezone_set('UTC');
        $token = $post['token'] ?? '';
        $password = $post['password'] ?? '';
        $confirmPassword = $post['confirmPassword'] ?? '';
        $feedback = '';

        // Basic validation
        if (!$token || !$password || !$confirmPassword) {
            $feedback = 'All fields are required.';
        } elseif ($password !== $confirmPassword) {
            $feedback = 'Passwords do not match.';
        } elseif (strlen($password) < 8 ||
            !preg_match('/[A-Z]/', $password) ||
            !preg_match('/[a-z]/', $password) ||
            !preg_match('/[0-9]/', $password) ||
            !preg_match('/[^A-Za-z0-9]/', $password)) {
            $feedback = 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.';
        } else {
            try {
                $db = (new Database())->getConnection();
                $user = User::findByResetToken($db, $token);
                if ($user) {
                    if ($user->updatePasswordByToken($token, $password)) {
                        $feedback = 'Your password has been reset. You can now log in.';
                    } else {
                        $feedback = 'Failed to reset password. Please try again.';
                    }
                } else {
                    $feedback = 'Invalid or expired reset link.';
                }
            } catch (Exception $e) {
                $feedback = 'An error occurred. Please try again.';
            }
        }
        return [
            'feedback' => $feedback,
            'token' => $token
        ];
    }

    public function sendResetLink($post) {
        EnvironmentLoader::load();
        $email = filter_var($post['email'] ?? '', FILTER_SANITIZE_EMAIL);
        $feedback = 'If that email exists, a password reset link has been sent.';
        $success = true;

        if ($email) {
            try {
                $db = (new Database())->getConnection();
                $user = new User($db);
                $user->setEmail($email);

                // Set PHP timezone to UTC
                date_default_timezone_set('UTC');
                // Set MySQL session timezone to UTC
                $db->query("SET time_zone = '+00:00'");

                if ($user->emailExists()) {
                    // Generate secure token
                    $token = bin2hex(random_bytes(32));
                    $expires = date('Y-m-d H:i:s', time() + 60 * 5); // 5 minutes

                    // Store token and expiry in DB
                    $user->setResetToken($token, $expires);

                    // PHPMailer setup
                    require_once __DIR__ . '/../PHPMailer/src/Exception.php';
                    require_once __DIR__ . '/../PHPMailer/src/PHPMailer.php';
                    require_once __DIR__ . '/../PHPMailer/src/SMTP.php';
                    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
                    try {
                        $mail->isSMTP();
                        $mail->Host       = EnvironmentLoader::get('SMTP_HOST', 'smtp.gmail.com');
                        $mail->SMTPAuth   = true;
                        $mail->Username   = EnvironmentLoader::get('SMTP_USERNAME');
                        $mail->Password   = EnvironmentLoader::get('SMTP_PASSWORD');
                        $mail->SMTPSecure = EnvironmentLoader::get('SMTP_ENCRYPTION', 'tls');
                        $mail->Port       = (int)EnvironmentLoader::get('SMTP_PORT', 587);

                        $fromEmail = EnvironmentLoader::get('SMTP_USERNAME');
                        $fromName  = EnvironmentLoader::get('SMTP_FROM_NAME', 'Code Regal');
                        if ($fromEmail) {
                            $mail->setFrom($fromEmail, $fromName);
                        }
                        $mail->addAddress($email);

                        $mail->isHTML(true);
                        $mail->Subject = 'Code Regal Password Reset Link';
                        $resetLink = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://')
                            . ($_SERVER['HTTP_HOST'] ?? 'localhost')
                            . rtrim(dirname($_SERVER['PHP_SELF'] ?? '/'), '/')
                            . "/reset_password.php?token=$token";
                        $mail->Body    = "<h2>Password Reset Request</h2>"
                            . "<p>Click the link below to reset your password. This link will expire in 5 minutes.</p>"
                            . "<p><a href='$resetLink'>$resetLink</a></p>"
                            . "<p>If you did not request this, you can ignore this email.</p>";

                        if (!$mail->send()) {
                            $success = false;
                            $feedback = 'Unable to send reset email. Please check SMTP settings.';
                        }
                    } catch (\PHPMailer\PHPMailer\Exception $e) {
                        $success = false;
                        $feedback = 'Unable to send reset email. Please check SMTP settings.';
                    }
                }
            } catch (Exception $e) {
                $success = false;
                $feedback = 'An error occurred. Please try again later.';
            }
        } else {
            $success = false;
            $feedback = 'Please enter a valid email address.';
        }
        return ['success' => $success, 'message' => $feedback];
    }
} 