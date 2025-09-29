<?php
class Verification {
    private $db;
    private $email;
    private $verification_code;

    public function __construct($db) {
        $this->db = $db;
    }

    public function setEmail($email) {
        $this->email = filter_var($email, FILTER_SANITIZE_EMAIL);
    }

    public function generateCode() {
        // Use cryptographically secure random_int
        $this->verification_code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        return $this->verification_code;
    }

    public function validateEmail() {
        return filter_var($this->email, FILTER_VALIDATE_EMAIL) && 
               preg_match('/@kld\.edu\.ph$/', $this->email);
    }

    public function emailExists() {
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bindParam(1, $this->email, PDO::PARAM_STR);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result !== false;
    }

    public function sendVerificationEmail() {
        if (!$this->validateEmail()) {
            return false;
        }

        $to = $this->email;
        $subject = "Code Regal - Email Verification";
        $message = "Your verification code is: " . $this->verification_code . "\n\n";
        $message .= "This code will expire in 15 minutes.\n";
        $message .= "If you didn't request this code, please ignore this email.";

        // For testing purposes, store the code in session
        $_SESSION['verification_code'] = $this->verification_code;
        $_SESSION['verification_email'] = $this->email;
        $_SESSION['verification_time'] = time();

        // Use PHPMailer to send the email
        require_once __DIR__ . '/../PHPMailer/src/PHPMailer.php';
        require_once __DIR__ . '/../PHPMailer/src/SMTP.php';
        require_once __DIR__ . '/../PHPMailer/src/Exception.php';
        
        try {
            $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host       = getenv('SMTP_HOST') ?: 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = getenv('SMTP_USERNAME');
            $mail->Password   = getenv('SMTP_PASSWORD');
            $mail->SMTPSecure = 'tls';
            $mail->Port       = getenv('SMTP_PORT') ?: 587;

            $mail->setFrom(getenv('SMTP_USERNAME'), getenv('SMTP_FROM_NAME') ?: 'Code Regal');
            $mail->addAddress($to);
            $mail->Subject = $subject;
            $mail->Body    = $message;

            $mail->send();
            return true;
        } catch (\PHPMailer\PHPMailer\Exception $e) {
            error_log('PHPMailer error: ' . $e->getMessage());
            return false;
        }
    }

    public function verifyCode($input_code) {
        if (!isset($_SESSION['verification_code']) || 
            !isset($_SESSION['verification_email']) || 
            !isset($_SESSION['verification_time'])) {
            return false;
        }

        // Check if code has expired (15 minutes)
        if (time() - $_SESSION['verification_time'] > 900) {
            return false;
        }

        // Check if email matches
        if ($_SESSION['verification_email'] !== $this->email) {
            return false;
        }

        return $input_code === $_SESSION['verification_code'];
    }

    public function storeVerificationCode() {
        $_SESSION['verification_code'] = $this->verification_code;
        $_SESSION['verification_email'] = $this->email;
        $_SESSION['verification_time'] = time();
    }

    public function clearVerificationCode() {
        unset($_SESSION['verification_code']);
        unset($_SESSION['verification_email']);
        unset($_SESSION['verification_time']);
    }
}
?> 