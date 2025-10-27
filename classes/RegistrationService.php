<?php
class RegistrationService {
    private $db;
    public function __construct($db) {
        $this->db = $db;
    }
    public function register($data) {
        $response = [
            'success' => false,
            'message' => '',
            'errors' => []
        ];
        // Sanitize input
        $firstname = User::sanitizeInput($data['firstname'] ?? '');
        $middlename = User::sanitizeInput($data['middlename'] ?? '');
        $lastname = User::sanitizeInput($data['lastname'] ?? '');
        $idnumber = User::sanitizeInput($data['idnumber'] ?? '');
        $email = User::sanitizeInput($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $confirmPassword = $data['confirmPassword'] ?? '';
        $verification = User::sanitizeInput($data['verification'] ?? '');
        // Validate required fields
        $required_fields = ['firstname', 'lastname', 'idnumber', 'email', 'password', 'confirmPassword', 'verification'];
        foreach ($required_fields as $field) {
            if (empty($data[$field])) {
                $response['errors'][] = ucfirst($field) . ' is required.';
            }
        }
        // Field-specific validation
        if (!preg_match("/^[a-zA-Z\s'-]+$/", $firstname)) {
            $response['errors'][] = 'First name can only contain letters, spaces, hyphens, and apostrophes.';
        }
        if (!preg_match("/^[a-zA-Z\s'-]+$/", $lastname)) {
            $response['errors'][] = 'Last name can only contain letters, spaces, hyphens, and apostrophes.';
        }
        if ($middlename && !preg_match("/^[a-zA-Z\s'-]+$/", $middlename)) {
            $response['errors'][] = 'Middle name can only contain letters, spaces, hyphens, and apostrophes.';
        }
        if (!User::validateStudentId($idnumber)) {
            $response['errors'][] = 'Invalid student ID format. Please use format: KLD-YY-XXXXXX';
        }
        if (!User::validateEmailFormat($email)) {
            $response['errors'][] = 'Invalid email format';
        }
        if (!User::validatePasswordStrength($password)) {
            $response['errors'][] = 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character';
        }
        if ($password !== $confirmPassword) {
            $response['errors'][] = 'Passwords do not match.';
        }
        // Verification code session check
        if (!isset($_SESSION['verification_code'], $_SESSION['verification_email'], $_SESSION['verification_time'])) {
            $response['errors'][] = 'No verification code found. Please request a code.';
        } elseif ($email !== $_SESSION['verification_email']) {
            $response['errors'][] = 'The email does not match the verified email.';
        } elseif ($verification !== $_SESSION['verification_code']) {
            $response['errors'][] = 'Invalid verification code.';
        } elseif (time() - $_SESSION['verification_time'] > 60) {
            $response['errors'][] = 'Verification code expired. Please request a new code.';
        }
        if (!empty($response['errors'])) {
            return $response;
        }
        // Create User instance
        $user = new User($this->db);
        $user->setFirstname($firstname);
        $user->setMiddlename($middlename);
        $user->setLastname($lastname);
        $user->setIdNumber($idnumber);
        $user->setEmail($email);
        $user->setPassword($password);
        // Validate user data
        $validationErrors = $user->getValidationErrors();
        if (!empty($validationErrors)) {
            $response['errors'] = array_merge($response['errors'], $validationErrors);
            return $response;
        }
        // Register user
        if ($user->register()) {
            // Mark the ID as used in authorized_ids
            $stmt = $this->db->prepare("UPDATE authorized_ids SET status = 'used' WHERE id_number = ?");
            $stmt->execute([$idnumber]);
            $response['success'] = true;
            $response['message'] = 'Registration successful! You can now login.';
            unset($_SESSION['verification_code'], $_SESSION['verification_email'], $_SESSION['verification_time']);
        } else {
            $response['errors'][] = 'Registration failed. Please try again.';
        }
        return $response;
    }
} 