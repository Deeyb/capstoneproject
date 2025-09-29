<?php
class User {
    private $db;
    private $id;
    private $firstname;
    private $middlename;
    private $lastname;
    private $idNumber;
    private $email;
    private $password;
    private $createdAt;
    private $role;

    public function __construct($db, $data = null) {
        $this->db = $db;
        
        if ($data && is_array($data)) {
            $this->hydrate($data);
        }
    }
    
    /**
     * Hydrate the user object with data
     * @param array $data
     */
    private function hydrate($data) {
        $this->id = $data['id'] ?? null;
        $this->firstname = $data['firstname'] ?? '';
        $this->middlename = $data['middlename'] ?? '';
        $this->lastname = $data['lastname'] ?? '';
        $this->idNumber = $data['id_number'] ?? '';
        $this->email = $data['email'] ?? '';
        $this->password = $data['password'] ?? '';
        $this->createdAt = $data['created_at'] ?? null;
        $this->role = $data['role'] ?? 'Student';
    }

    public function login($email, $password) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($userData && password_verify($password, $userData['password'])) {
                $this->hydrate($userData);
                
                // Update last_login time
                $updateStmt = $this->db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
                $updateStmt->execute([$this->id]);
                
                return true;
            }
            return false;
        } catch (PDOException $e) {
            error_log("Login error: " . $e->getMessage());
            return false;
        }
    }

    // Getters
    public function getId() { return $this->id; }
    public function getFirstname() { return $this->firstname; }
    public function getMiddlename() { return $this->middlename; }
    public function getLastname() { return $this->lastname; }
    public function getFullname() {
        return $this->firstname .
               ($this->middlename ? ' ' . $this->middlename : '') .
               ' ' . $this->lastname;
    }
    public function getIdNumber() { return $this->idNumber; }
    public function getEmail() { return $this->email; }
    public function getCreatedAt() { return $this->createdAt; }
    public function getPassword() { return $this->password; }
    public function getRole() { return $this->role; }

    // Setters
    public function setFirstname($firstname) { $this->firstname = $firstname; }
    public function setMiddlename($middlename) { $this->middlename = $middlename; }
    public function setLastname($lastname) { $this->lastname = $lastname; }
    public function setIdNumber($idNumber) { $this->idNumber = $idNumber; }
    public function setEmail($email) { $this->email = $email; }
    public function setPassword($password) { $this->password = $password; }
    public function setRole($role) { $this->role = $role; }

    public function save() {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO users (firstname, middlename, lastname, id_number, email, password, created_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ");
            $hashedPassword = password_hash($this->password, PASSWORD_DEFAULT);
            return $stmt->execute([
                $this->firstname,
                $this->middlename,
                $this->lastname,
                $this->idNumber,
                $this->email,
                $hashedPassword
            ]);
        } catch (PDOException $e) {
            error_log("Error saving user: " . $e->getMessage());
            return false;
        }
    }

    public function register() {
        try {
            $stmt = $this->db->prepare("INSERT INTO users (firstname, middlename, lastname, id_number, email, password, created_at, role) VALUES (?, ?, ?, ?, ?, ?, NOW(), 'Student')");
            $hashed_password = password_hash($this->password, PASSWORD_DEFAULT, ['cost' => 12]);
            $stmt->execute([
                $this->firstname,
                $this->middlename,
                $this->lastname,
                $this->idNumber,
                $this->email,
                $hashed_password
            ]);
            return true;
        } catch (PDOException $e) {
            error_log("Error saving user: " . $e->getMessage());
            return false;
        }
    }

    public static function findByEmail($db, $email) {
        try {
            $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($userData) {
                return new User($db, $userData);
            }
            return null;
        } catch (PDOException $e) {
            error_log("Error finding user by email: " . $e->getMessage());
            return null;
        }
    }

    public function validateIdNumber() {
        return !empty($this->getIdNumber());
    }

    public function validateEmail() {
        return filter_var($this->getEmail(), FILTER_VALIDATE_EMAIL) &&
               preg_match('/@kld\.edu\.ph$/', $this->getEmail());
    }

    public function validatePassword() {
        if (strlen($this->password) < 8) {
            return false;
        }
        $common_passwords = ['password123', 'admin123', '12345678', 'qwerty123'];
        if (in_array(strtolower($this->password), $common_passwords)) {
            return false;
        }
        $has_uppercase = preg_match('/[A-Z]/', $this->password);
        $has_lowercase = preg_match('/[a-z]/', $this->password);
        $has_numbers = preg_match('/[0-9]/', $this->password);
        $has_special_chars = preg_match('/[^A-Za-z0-9]/', $this->password);
        return $has_uppercase && $has_lowercase && $has_numbers && $has_special_chars;
    }

    public function emailExists() {
        try {
            $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$this->email]);
            $result = $stmt->fetch();
            error_log('emailExists: ' . $this->email . ' result: ' . print_r($result, true));
            return $result !== false;
        } catch (PDOException $e) {
            error_log("Error checking email: " . $e->getMessage());
            return false;
        }
    }

    public function isIdAuthorized() {
        try {
            $stmt = $this->db->prepare("SELECT * FROM authorized_ids WHERE id_number = ? AND status = 'active'");
            $stmt->execute([$this->idNumber]);
            return $stmt->fetch() !== false;
        } catch (PDOException $e) {
            error_log("Error checking authorized ID: " . $e->getMessage());
            return false;
        }
    }

    public function idNumberExists() {
        try {
            $stmt = $this->db->prepare("SELECT id FROM users WHERE id_number = ?");
            $stmt->execute([$this->idNumber]);
            $result = $stmt->fetch();
            error_log('idNumberExists: ' . $this->idNumber . ' result: ' . print_r($result, true));
            return $result !== false;
        } catch (PDOException $e) {
            error_log("Error checking ID number: " . $e->getMessage());
            return false;
        }
    }

    public function getValidationErrors() {
        $errors = [];
        if (empty($this->getFirstname())) {
            $errors[] = 'First name is required';
        }
        if (empty($this->getLastname())) {
            $errors[] = 'Last name is required';
        }
        if (!$this->validateIdNumber()) {
            $errors[] = 'ID number is required';
        } elseif (!$this->isIdAuthorized()) {
            $errors[] = 'This ID number is not authorized to register';
        }
        if (!$this->validateEmail()) {
            $errors[] = 'Please use your KLD institutional email (@kld.edu.ph)';
        }
        if (!$this->validatePassword()) {
            $errors[] = 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character';
        }
        if ($this->emailExists()) {
            $errors[] = 'Email already registered';
        }
        if ($this->idNumberExists()) {
            $errors[] = 'This ID number is already used.';
        }
        return $errors;
    }

    // Password Reset Methods
    public function setResetToken($token, $expires) {
        $stmt = $this->db->prepare("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?");
        return $stmt->execute([$token, $expires, $this->email]);
    }

    public static function findByResetToken($db, $token) {
        $stmt = $db->prepare("SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()");
        $stmt->execute([$token]);
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($userData) {
            return new User($db, $userData);
        }
        return null;
    }

    public function clearResetToken() {
        $stmt = $this->db->prepare("UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE email = ?");
        return $stmt->execute([$this->email]);
    }

    public function updatePasswordByToken($token, $newPassword) {
        $hashed = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $this->db->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = ? AND reset_token_expires > NOW()");
        return $stmt->execute([$hashed, $token]);
    }

    // Static validation methods
    public static function sanitizeInput($data) {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data);
        return $data;
    }
    public static function validateEmailFormat($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL);
    }
    public static function validateStudentId($student_id) {
        return preg_match('/^KLD-\d{2}-\d{6}$/', $student_id);
    }
    public static function validatePasswordStrength($password) {
        return strlen($password) >= 8 &&
               preg_match('/[A-Z]/', $password) &&
               preg_match('/[a-z]/', $password) &&
               preg_match('/[0-9]/', $password) &&
               preg_match('/[^A-Za-z0-9]/', $password);
    }
    
    /**
     * Check if user has a specific role
     * @param string $role
     * @return bool
     */
    public function hasRole($role) {
        return strtolower($this->role) === strtolower($role);
    }
    
    /**
     * Check if user is admin
     * @return bool
     */
    public function isAdmin() {
        return $this->hasRole('admin');
    }
    
    /**
     * Check if user is student
     * @return bool
     */
    public function isStudent() {
        return $this->hasRole('student');
    }
    
    /**
     * Check if user is teacher
     * @return bool
     */
    public function isTeacher() {
        return $this->hasRole('teacher');
    }
    
    /**
     * Check if user is coordinator
     * @return bool
     */
    public function isCoordinator() {
        return $this->hasRole('coordinator');
    }
    
    /**
     * Get user's display name
     * @return string
     */
    public function getDisplayName() {
        $middleInitial = !empty($this->middlename) ? ' ' . substr($this->middlename, 0, 1) . '.' : '';
        return $this->lastname . ', ' . $this->firstname . $middleInitial;
    }
    
    /**
     * Convert user to array
     * @return array
     */
    public function toArray() {
        return [
            'id' => $this->id,
            'firstname' => $this->firstname,
            'middlename' => $this->middlename,
            'lastname' => $this->lastname,
            'id_number' => $this->idNumber,
            'email' => $this->email,
            'role' => $this->role,
            'created_at' => $this->createdAt,
            'display_name' => $this->getDisplayName(),
            'full_name' => $this->getFullname()
        ];
    }
}
?> 