<?php

class ProfileService {
    private $db;
    private $uploadDir = 'uploads/profile_photos/';
    private $maxFileSize = 5242880; // 5MB
    private $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    public function __construct($db) {
        $this->db = $db;
        $this->createUploadDirectory();
    }

    /**
     * Create upload directory if it doesn't exist
     */
    private function createUploadDirectory() {
        if (!file_exists($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    /**
     * Get user profile data from database
     */
    public function getUserProfile($userId) {
        try {
            $stmt = $this->db->prepare("
                SELECT id, firstname, middlename, lastname, email, id_number, role, profile_photo, created_at 
                FROM users 
                WHERE id = ?
            ");
            $stmt->execute([$userId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting user profile: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update user profile information
     */
    public function updateProfile($userId, $data) {
        try {
            // Prevent client from changing email: use current DB value
            $current = $this->getUserProfile($userId);
            $currentEmail = $current ? $current['email'] : ($data['email'] ?? '');

            $stmt = $this->db->prepare("
                UPDATE users 
                SET firstname = ?, middlename = ?, lastname = ?, email = ? 
                WHERE id = ?
            ");
            
            $result = $stmt->execute([
                $data['firstname'],
                $data['middlename'],
                $data['lastname'],
                $currentEmail,
                $userId
            ]);

            if ($result) {
                // Update session variables
                $_SESSION['user_firstname'] = $data['firstname'];
                $_SESSION['user_middlename'] = $data['middlename'];
                $_SESSION['user_lastname'] = $data['lastname'];
                $_SESSION['user_email'] = $currentEmail;
                
                return ['success' => true, 'message' => 'Profile updated successfully'];
            }
            
            return ['success' => false, 'message' => 'Failed to update profile'];
        } catch (PDOException $e) {
            error_log("Error updating profile: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error occurred'];
        }
    }

    /**
     * Upload profile photo
     */
    public function uploadProfilePhoto($userId, $file) {
        try {
            error_log("ProfileService: Upload attempt for user $userId");
            error_log("ProfileService: File info: " . print_r($file, true));
            
            // Validate file
            $validation = $this->validatePhotoFile($file);
            if (!$validation['success']) {
                error_log("ProfileService: Validation failed: " . $validation['message']);
                return $validation;
            }
            
            error_log("ProfileService: File validation passed");

            // Get old photo filename BEFORE updating database
            $oldPhotoFilename = null;
            $stmt = $this->db->prepare("SELECT profile_photo FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($result && $result['profile_photo']) {
                $oldPhotoFilename = $result['profile_photo'];
                error_log("ProfileService: Old photo filename: $oldPhotoFilename");
            }

            // Generate unique filename
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'profile_' . $userId . '_' . time() . '.' . $extension;
            $filepath = $this->uploadDir . $filename;

            // Move uploaded file
            error_log("ProfileService: Moving file to: $filepath");
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                error_log("ProfileService: Failed to move uploaded file");
                return ['success' => false, 'message' => 'Failed to save uploaded file'];
            }
            error_log("ProfileService: File moved successfully");

            // Update database first
            error_log("ProfileService: Updating database with filename: $filename");
            $stmt = $this->db->prepare("UPDATE users SET profile_photo = ? WHERE id = ?");
            $result = $stmt->execute([$filename, $userId]);

            if (!$result) {
                error_log("ProfileService: Database update failed");
                // If database update fails, remove the uploaded file
                unlink($filepath);
                return ['success' => false, 'message' => 'Failed to update database'];
            }
            error_log("ProfileService: Database updated successfully");

            // Delete old photo if exists (only after successful database update)
            if ($oldPhotoFilename && $oldPhotoFilename !== $filename) {
                $oldPhotoPath = $this->uploadDir . $oldPhotoFilename;
                if (file_exists($oldPhotoPath)) {
                    error_log("ProfileService: Deleting old photo: $oldPhotoPath");
                    unlink($oldPhotoPath);
                    error_log("ProfileService: Old photo deleted successfully");
                } else {
                    error_log("ProfileService: Old photo file not found: $oldPhotoPath");
                }
            } else if ($oldPhotoFilename === $filename) {
                error_log("ProfileService: WARNING - Old photo filename same as new filename, skipping deletion");
            }

            if ($result) {
                return [
                    'success' => true, 
                    'message' => 'Profile photo updated successfully',
                    'filename' => $filename,
                    'filepath' => $filepath
                ];
            }

            return ['success' => false, 'message' => 'Failed to update database'];
        } catch (Exception $e) {
            error_log("Error uploading profile photo: " . $e->getMessage());
            return ['success' => false, 'message' => 'Upload failed'];
        }
    }

    /**
     * Validate uploaded photo file
     */
    private function validatePhotoFile($file) {
        // Check if file was uploaded
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            return ['success' => false, 'message' => 'No file uploaded'];
        }

        // Check file size
        if ($file['size'] > $this->maxFileSize) {
            return ['success' => false, 'message' => 'File size too large. Maximum 5MB allowed'];
        }

        // Check file type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        // Also check the extension as a fallback
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

        if (!in_array($mimeType, $this->allowedTypes) && !in_array($extension, $allowedExtensions)) {
            return ['success' => false, 'message' => 'Invalid file type. Only JPG, PNG, and GIF allowed. Detected: ' . $mimeType . ' / ' . $extension];
        }

        return ['success' => true];
    }


    /**
     * Remove profile photo
     */
    public function removeProfilePhoto($userId) {
        try {
            // Get current photo filename
            $stmt = $this->db->prepare("SELECT profile_photo FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$result || !$result['profile_photo']) {
                return ['success' => false, 'message' => 'No profile photo to remove'];
            }

            // Delete photo file
            $photoPath = $this->uploadDir . $result['profile_photo'];
            if (file_exists($photoPath)) {
                unlink($photoPath);
            }

            // Update database to remove photo reference
            $stmt = $this->db->prepare("UPDATE users SET profile_photo = NULL WHERE id = ?");
            $result = $stmt->execute([$userId]);

            if ($result) {
                return [
                    'success' => true, 
                    'message' => 'Profile photo removed successfully'
                ];
            }

            return ['success' => false, 'message' => 'Failed to update database'];
        } catch (Exception $e) {
            error_log("Error removing profile photo: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to remove photo'];
        }
    }

    /**
     * Get profile photo URL
     */
    public function getProfilePhotoUrl($userId) {
        try {
            $stmt = $this->db->prepare("SELECT profile_photo FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($result && $result['profile_photo']) {
                return $this->uploadDir . $result['profile_photo'];
            }

            return null; // Return null if no photo
        } catch (PDOException $e) {
            error_log("Error getting profile photo: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Check if email is already used by another user
     */
    public function isEmailUsed($email, $excludeUserId = null) {
        try {
            $sql = "SELECT id FROM users WHERE email = ?";
            $params = [$email];

            if ($excludeUserId) {
                $sql .= " AND id != ?";
                $params[] = $excludeUserId;
            }

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetch() !== false;
        } catch (PDOException $e) {
            error_log("Error checking email: " . $e->getMessage());
            return false;
        }
    }
}
