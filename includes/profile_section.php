<?php
// Shared Profile Section Component
// This file contains the complete profile section that can be included in any dashboard

// Ensure required variables are available with fallbacks
if (!isset($userProfile)) {
    // Try to get profile data from ProfileService if available
    if (isset($profileService) && isset($_SESSION['user_id'])) {
        try {
            $userProfile = $profileService->getUserProfile($_SESSION['user_id']);
        } catch (Exception $e) {
            // Fallback to session data
            $userProfile = [
                'firstname' => $_SESSION['user_firstname'] ?? '',
                'lastname' => $_SESSION['user_lastname'] ?? '',
                'middlename' => $_SESSION['user_middlename'] ?? '',
                'email' => $_SESSION['user_email'] ?? '',
                'id_number' => $_SESSION['user_id_number'] ?? '',
                'role' => $_SESSION['user_role'] ?? 'USER'
            ];
        }
    } else {
        // Fallback to session data
        $userProfile = [
            'firstname' => $_SESSION['user_firstname'] ?? '',
            'lastname' => $_SESSION['user_lastname'] ?? '',
            'middlename' => $_SESSION['user_middlename'] ?? '',
            'email' => $_SESSION['user_email'] ?? '',
            'id_number' => $_SESSION['user_id_number'] ?? '',
            'role' => $_SESSION['user_role'] ?? 'USER'
        ];
    }
}

if (!isset($profilePhotoUrl)) {
    // Try to get profile photo from ProfileService if available
    if (isset($profileService) && isset($_SESSION['user_id'])) {
        try {
            $profilePhotoUrl = $profileService->getProfilePhotoUrl($_SESSION['user_id']);
        } catch (Exception $e) {
            $profilePhotoUrl = null;
        }
    } else {
        $profilePhotoUrl = null;
    }
}

if (!isset($user_role)) {
    $user_role = $_SESSION['user_role'] ?? 'USER';
}
?>

<!-- Profile Section Content -->
<h2 class="section-title">Profile Settings</h2>

  <div class="profile-container">
    <div class="profile-header">
      <div class="profile-avatar-large <?php echo $profilePhotoUrl ? 'has-photo' : ''; ?>">
        <?php if ($profilePhotoUrl): ?>
          <img src="<?php echo htmlspecialchars($profilePhotoUrl); ?>" alt="Profile Photo" class="profile-photo">
        <?php else: ?>
          <i class="fas fa-user-circle"></i>
        <?php endif; ?>
        <div class="photo-upload-overlay">
          <label for="profilePhotoInput" class="photo-upload-btn" title="Change Photo">
            <i class="fas fa-camera"></i>
          </label>
          <button type="button" class="photo-remove-btn" onclick="removeProfilePhoto()" title="Remove Photo" <?php echo !$profilePhotoUrl ? 'style="display: none;"' : ''; ?>>
            <i class="fas fa-trash"></i>
          </button>
          <input type="file" id="profilePhotoInput" accept="image/*" style="display: none;">
        </div>
      </div>
      <div class="profile-info">
        <h3><?php 
          $lastname = $userProfile['lastname'] ?? '';
          $firstname = $userProfile['firstname'] ?? '';
          $middlename = $userProfile['middlename'] ?? '';
          $middle_initial = $middlename ? strtoupper(mb_substr(trim($middlename), 0, 1)) . '.' : '';
          $user_name = trim($lastname . ', ' . $firstname . ' ' . $middle_initial);
          echo htmlspecialchars($user_name); 
        ?></h3>
        <p class="profile-role"><?php echo htmlspecialchars($userProfile['role'] ?? $user_role); ?></p>
        <p class="profile-email"><?php echo htmlspecialchars($userProfile['email'] ?? $_SESSION['user_email']); ?></p>
      </div>
    </div>

    <div class="profile-tabs">
      <div class="tab-buttons">
        <button class="tab-btn active" data-tab="personal">Personal Information</button>
        <button class="tab-btn" data-tab="security">Security</button>
        <button class="tab-btn" data-tab="preferences">Preferences</button>
      </div>

      <div class="tab-content active" id="personal">
        <div class="profile-form-section">
          <h4>Personal Details</h4>
          <form id="personalInfoForm" class="profile-form">
            <div class="form-row">
              <div class="form-group">
                <label>First Name</label>
                <input type="text" id="profileFirstname" name="firstname" value="<?php echo htmlspecialchars($userProfile['firstname'] ?? ''); ?>" required>
              </div>
              <div class="form-group">
                <label>Middle Name</label>
                <input type="text" id="profileMiddlename" name="middlename" value="<?php echo htmlspecialchars($userProfile['middlename'] ?? ''); ?>">
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <input type="text" id="profileLastname" name="lastname" value="<?php echo htmlspecialchars($userProfile['lastname'] ?? ''); ?>" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="profileEmail" name="email" value="<?php echo htmlspecialchars($userProfile['email'] ?? ''); ?>" readonly title="Email address cannot be changed. Contact administrator for updates.">
              </div>
              <div class="form-group">
                <label>ID Number</label>
                <input type="text" id="profileIdNumber" name="id_number" value="<?php echo htmlspecialchars($userProfile['id_number'] ?? ''); ?>" readonly>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Update Personal Information</button>
            </div>
          </form>
        </div>
      </div>

      <div class="tab-content" id="security">
        <div class="profile-form-section">
          <h4>Change Password</h4>
          <form id="changePasswordForm" class="profile-form">
            <div class="form-group">
              <label>Current Password</label>
              <div class="password-input-group">
                <input type="password" id="currentPassword" name="current_password" required>
                <span class="password-toggle" onclick="togglePassword('currentPassword')">
                  <i class="fas fa-eye"></i>
                </span>
              </div>
            </div>
            <div class="form-group">
              <label>New Password</label>
              <div class="password-input-group">
                <input type="password" id="newPassword" name="new_password" required>
                <span class="password-toggle" onclick="togglePassword('newPassword')">
                  <i class="fas fa-eye"></i>
                </span>
              </div>
              <div class="password-requirements">
                <small>Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.</small>
              </div>
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <div class="password-input-group">
                <input type="password" id="confirmPassword" name="confirm_password" required>
                <span class="password-toggle" onclick="togglePassword('confirmPassword')">
                  <i class="fas fa-eye"></i>
                </span>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Change Password</button>
            </div>
          </form>
        </div>
      </div>

      <div class="tab-content" id="preferences">
        <div class="profile-form-section">
          <h4>Display Preferences</h4>
          <form id="preferencesForm" class="profile-form">
            <div class="form-group">
              <label>Theme</label>
              <select id="themePreference" name="theme">
                <option value="light">Light Theme</option>
                <option value="dark">Dark Theme</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Dashboard Refresh Rate</label>
              <select id="refreshRate" name="refresh_rate">
                <option value="5">5 seconds</option>
                <option value="10" selected>10 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="0">Manual refresh only</option>
              </select>
            </div>
            <div class="form-group">
              <label>Notifications</label>
              <div class="checkbox-group">
                <input type="checkbox" id="emailNotifications" name="email_notifications" checked>
                <label for="emailNotifications">Email notifications</label>
              </div>
              <div class="checkbox-group">
                <input type="checkbox" id="pushNotifications" name="push_notifications" checked>
                <label for="pushNotifications">Push notifications</label>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Save Preferences</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

<!-- Confirmation modal is included in the main dashboard files -->
