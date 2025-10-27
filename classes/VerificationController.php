<?php
require_once __DIR__ . '/Verification.php';
require_once __DIR__ . '/CSRFProtection.php';
require_once __DIR__ . '/RateLimiter.php';
require_once __DIR__ . '/auth_helpers.php';
require_once __DIR__ . '/EnvironmentLoader.php';
require_once __DIR__ . '/../config/Database.php';

class VerificationController {
    private $db;
    private $rateLimiter;

    public function __construct() {
        EnvironmentLoader::load();
        $this->db = (new Database())->getConnection();
        $this->rateLimiter = new RateLimiter($this->db);
    }

    public function sendVerification($post) {
        $response = array('success' => false, 'message' => '', 'errors' => array(), 'debug' => array());
        // CSRF Protection
        $token = $post[CSRFProtection::getTokenName()] ?? '';
        $response['debug']['csrf_token'] = $token;
        if (!CSRFProtection::validateToken($token)) {
            $response['errors'][] = 'Invalid request. Please refresh the page and try again.';
            $response['debug']['stage'] = 'csrf_failed';
            return $response;
        }

        $clientIP = Auth::getClientIP();
        $email = $post['email'] ?? '';
        $response['debug']['client_ip'] = $clientIP;
        $response['debug']['email'] = $email;

        // Rate limiting: 3 verification requests per 1 minute per IP
        $response['debug']['ip_allowed'] = $this->rateLimiter->isAllowed($clientIP, 'verification_code', 3, 60);
        if (!$response['debug']['ip_allowed']) {
            $timeUntilReset = $this->rateLimiter->getTimeUntilReset($clientIP, 'verification_code', 60);
            $response['errors'][] = "Too many verification requests. Please try again in " . ceil($timeUntilReset / 60) . " minute(s).";
            $response['debug']['stage'] = 'ip_rate_limit';
            $response['debug']['ip_time_until_reset'] = $timeUntilReset;
            return $response;
        }

        // Rate limiting: 2 verification requests per 1 minute per email
        $response['debug']['email_allowed'] = $this->rateLimiter->isAllowed($email, 'verification_email', 2, 60);
        if (!$response['debug']['email_allowed']) {
            $timeUntilReset = $this->rateLimiter->getTimeUntilReset($email, 'verification_email', 60);
            $response['errors'][] = "Too many verification requests for this email. Please try again in " . ceil($timeUntilReset / 60) . " minute(s).";
            $response['debug']['stage'] = 'email_rate_limit';
            $response['debug']['email_time_until_reset'] = $timeUntilReset;
            return $response;
        }

        if (empty($email)) {
            $response['errors'][] = 'Email is required.';
            $response['debug']['stage'] = 'empty_email';
        } else {
            $verification = new Verification($this->db);
            $verification->setEmail($email);
            $response['debug']['email_valid'] = $verification->validateEmail();
            $response['debug']['email_exists'] = $verification->emailExists();
            if (!$response['debug']['email_valid']) {
                $response['errors'][] = 'Please use your KLD institutional email (@kld.edu.ph).';
                $response['debug']['stage'] = 'invalid_email';
            } elseif ($response['debug']['email_exists']) {
                $response['errors'][] = 'This email is already registered.';
                $response['debug']['stage'] = 'email_exists';
            } else {
                $code = $verification->generateCode();
                $verification->storeVerificationCode();
                $response['debug']['code'] = $code;
                $sendResult = $verification->sendVerificationEmail();
                $response['debug']['send_result'] = $sendResult;
                if ($sendResult) {
                    $response['success'] = true;
                    $response['message'] = 'Verification code sent to your email.';
                    $response['debug']['stage'] = 'success';
                    // Record the attempt for rate limiting
                    $this->rateLimiter->recordAttempt($clientIP, 'verification_code');
                    $this->rateLimiter->recordAttempt($email, 'verification_email');
                } else {
                    $response['errors'][] = 'Failed to send verification code. Please try again.';
                    $response['debug']['stage'] = 'send_failed';
                }
            }
        }
        $response['debug']['session'] = $_SESSION;
        return $response;
    }
} 