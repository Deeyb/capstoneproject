<?php
/**
 * Email Service - OOP approach for email operations
 */
class EmailService {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    /**
     * Check if email exists in the system
     */
    public function checkEmailExists($email) {
        $this->validateEmail($email);
        
        $stmt = $this->db->prepare("SELECT id, firstname, lastname FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return [
            'exists' => $user !== false,
            'user' => $user ? [
                'id' => $user['id'],
                'name' => $user['firstname'] . ' ' . $user['lastname']
            ] : null
        ];
    }
    
    /**
     * Send verification email
     */
    public function sendVerificationEmail($email, $userId) {
        $this->validateEmail($email);
        $this->validateUserId($userId);
        
        // Generate verification token
        $token = $this->generateVerificationToken();
        
        // Store token in database
        $this->storeVerificationToken($userId, $token);
        
        // Send email (implement actual email sending)
        $sent = $this->sendEmail($email, 'Email Verification', $this->getVerificationEmailBody($token));
        
        if ($sent) {
            return [
                'success' => true,
                'message' => 'Verification email sent successfully'
            ];
        } else {
            throw new RuntimeException('Failed to send verification email');
        }
    }
    
    /**
     * Send password reset email
     */
    public function sendPasswordResetEmail($email) {
        $this->validateEmail($email);
        
        // Check if user exists
        $emailCheck = $this->checkEmailExists($email);
        if (!$emailCheck['exists']) {
            throw new RuntimeException('Email not found in system');
        }
        
        // Generate reset token
        $token = $this->generateResetToken();
        
        // Store reset token
        $this->storeResetToken($emailCheck['user']['id'], $token);
        
        // Send reset email
        $sent = $this->sendEmail($email, 'Password Reset', $this->getResetEmailBody($token));
        
        if ($sent) {
            return [
                'success' => true,
                'message' => 'Password reset email sent successfully'
            ];
        } else {
            throw new RuntimeException('Failed to send password reset email');
        }
    }
    
    /**
     * Process password reset
     */
    public function processPasswordReset($token, $newPassword) {
        $this->validateToken($token);
        $this->validatePassword($newPassword);
        
        // Get user by token
        $user = $this->getUserByResetToken($token);
        if (!$user) {
            throw new RuntimeException('Invalid or expired reset token');
        }
        
        // Hash new password
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        
        // Update password
        $stmt = $this->db->prepare("UPDATE users SET password = ? WHERE id = ?");
        $result = $stmt->execute([$hashedPassword, $user['id']]);
        
        if (!$result) {
            throw new RuntimeException('Failed to update password');
        }
        
        // Clear reset token
        $this->clearResetToken($user['id']);
        
        return [
            'success' => true,
            'message' => 'Password reset successfully'
        ];
    }
    
    /**
     * Generate verification token
     */
    private function generateVerificationToken() {
        return bin2hex(random_bytes(32));
    }
    
    /**
     * Generate reset token
     */
    private function generateResetToken() {
        return bin2hex(random_bytes(32));
    }
    
    /**
     * Store verification token
     */
    private function storeVerificationToken($userId, $token) {
        $stmt = $this->db->prepare("
            INSERT INTO email_verification_tokens (user_id, token, expires_at) 
            VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))
            ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)
        ");
        $stmt->execute([$userId, $token]);
    }
    
    /**
     * Store reset token
     */
    private function storeResetToken($userId, $token) {
        $stmt = $this->db->prepare("
            INSERT INTO password_reset_tokens (user_id, token, expires_at) 
            VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))
            ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)
        ");
        $stmt->execute([$userId, $token]);
    }
    
    /**
     * Get user by reset token
     */
    private function getUserByResetToken($token) {
        $stmt = $this->db->prepare("
            SELECT u.id, u.email 
            FROM users u
            JOIN password_reset_tokens prt ON u.id = prt.user_id
            WHERE prt.token = ? AND prt.expires_at > NOW()
        ");
        $stmt->execute([$token]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Clear reset token
     */
    private function clearResetToken($userId) {
        $stmt = $this->db->prepare("DELETE FROM password_reset_tokens WHERE user_id = ?");
        $stmt->execute([$userId]);
    }
    
    /**
     * Send email (placeholder - implement actual email sending)
     */
    private function sendEmail($to, $subject, $body) {
        // This is a placeholder - implement actual email sending logic
        // You can use PHPMailer, SwiftMailer, or any other email library
        error_log("Email would be sent to: $to, Subject: $subject");
        return true; // Return true for now
    }
    
    /**
     * Get verification email body
     */
    private function getVerificationEmailBody($token) {
        $url = "http://localhost/capstoneproject/verify_email.php?token=" . $token;
        return "Please click the following link to verify your email: $url";
    }
    
    /**
     * Get reset email body
     */
    private function getResetEmailBody($token) {
        $url = "http://localhost/capstoneproject/reset_password.php?token=" . $token;
        return "Please click the following link to reset your password: $url";
    }
    
    /**
     * Validate email
     */
    private function validateEmail($email) {
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('Invalid email address');
        }
    }
    
    /**
     * Validate user ID
     */
    private function validateUserId($userId) {
        if (!is_numeric($userId) || $userId <= 0) {
            throw new InvalidArgumentException('Invalid user ID');
        }
    }
    
    /**
     * Validate token
     */
    private function validateToken($token) {
        if (empty($token) || strlen($token) < 10) {
            throw new InvalidArgumentException('Invalid token');
        }
    }
    
    /**
     * Validate password
     */
    private function validatePassword($password) {
        if (empty($password) || strlen($password) < 6) {
            throw new InvalidArgumentException('Password must be at least 6 characters long');
        }
    }
}
?>

