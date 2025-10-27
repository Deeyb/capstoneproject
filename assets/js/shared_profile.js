// Shared Profile Management JavaScript
// This file contains all profile functionality that can be used across all dashboards

// Ensure showNotification is available (should be provided by admin_panel.js)
if (typeof window.showNotification !== 'function') {
  console.error('showNotification not available! Make sure admin_panel.js is loaded first.');
  // Fallback to console logging
  window.showNotification = function(type, title, message) {
    console[type === 'error' ? 'error' : 'log']((title ? title + ': ' : '') + (message || ''));
  };
}

// Prevent double-submits across any pages that attach multiple listeners accidentally
let __cr_isPasswordChanging = false;
let __cr_isSavingPreferences = false;
let __cr_isRemovingPhoto = false;

// Update sidebar name in real-time
function updateSidebarName() {
  const firstname = document.getElementById('profileFirstname');
  const lastname = document.getElementById('profileLastname');
  const middlename = document.getElementById('profileMiddlename');
  
  if (firstname && lastname) {
    const middleInitial = middlename && middlename.value ? middlename.value.charAt(0).toUpperCase() + '.' : '';
    const fullName = `${lastname.value}, ${firstname.value} ${middleInitial}`.trim();
    
    const sidebarName = document.querySelector('.user-name');
    if (sidebarName) {
      sidebarName.textContent = fullName;
      console.log('✅ Sidebar name updated to:', fullName);
    } else {
      console.warn('⚠️ Sidebar name element not found');
    }
  } else {
    console.warn('⚠️ Profile name inputs not found');
  }
}

// Make updateSidebarName globally available
if (typeof window !== 'undefined') {
  window.updateSidebarName = updateSidebarName;
}

// ===== MODERN PHOTO MANAGEMENT FUNCTIONS =====

// Show photo preview and validate file
function showPhotoPreview(file) {
  // Client-side validation
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  if (file.size > maxSize) {
    showNotification('error', 'File Too Large', 'Please select an image smaller than 5MB.');
    return false;
  }
  
  if (!allowedTypes.includes(file.type)) {
    showNotification('error', 'Invalid File Type', 'Please select a JPG, PNG, or GIF image.');
    return false;
  }
  
  // Show preview
  const reader = new FileReader();
  reader.onload = function(e) {
    const avatarContainer = document.querySelector('.profile-avatar-large');
    if (avatarContainer) {
      // Create temporary preview
      const tempImg = document.createElement('img');
      tempImg.src = e.target.result;
      tempImg.className = 'profile-photo';
      tempImg.alt = 'Preview';
      tempImg.style.opacity = '0.7';
      
      // Replace current image or icon
      const currentImg = avatarContainer.querySelector('.profile-photo');
      const currentIcon = avatarContainer.querySelector('.fas.fa-user-circle');
      
      if (currentImg) {
        currentImg.src = e.target.result;
        currentImg.style.opacity = '0.7';
      } else if (currentIcon) {
        currentIcon.style.display = 'none';
        avatarContainer.insertBefore(tempImg, currentIcon);
      }
    }
  };
  reader.readAsDataURL(file);
  return true;
}

// Upload profile photo
function uploadProfilePhoto(file) {
  console.log('📤 uploadProfilePhoto called with file:', file.name, file.size, file.type);
  const formData = new FormData();
  formData.append('action', 'upload_photo');
  formData.append('profile_photo', file);
  
  // Show loading state
  const uploadBtn = document.querySelector('.photo-upload-btn');
  if (uploadBtn) {
    console.log('✅ Upload button found, showing loading state');
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    uploadBtn.style.pointerEvents = 'none';
  } else {
    console.error('❌ Upload button not found');
  }
  
  console.log('🌐 Sending upload request...');
  fetch('profile_action.php', {
    method: 'POST',
    body: formData,
    credentials: 'same-origin'
  })
  .then(response => response.json())
  .then(data => {
    console.log('📤 Upload response:', data);
    if (data.success) {
      showNotification('success', 'Success', 'Profile photo uploaded successfully!');
      console.log('✅ Upload successful, calling updateProfilePhotos with filename:', data.filename);
      updateProfilePhotos(data.filename);
    } else {
      console.error('❌ Upload failed:', data.message);
      showNotification('error', 'Upload Failed', data.message || 'Unknown error occurred');
      // Clean up preview on error
      const avatarContainer = document.querySelector('.profile-avatar-large');
      if (avatarContainer) {
        const tempImg = avatarContainer.querySelector('.profile-photo[style*="opacity: 0.7"]');
        if (tempImg) {
          tempImg.remove();
        }
        const hiddenIcon = avatarContainer.querySelector('.fas.fa-user-circle[style*="display: none"]');
        if (hiddenIcon) {
          hiddenIcon.style.display = '';
        }
      }
    }
  })
  .catch(error => {
    console.error('Upload error:', error);
    showNotification('error', 'Upload Failed', 'Network error. Please try again.');
    // Clean up preview on error
    const avatarContainer = document.querySelector('.profile-avatar-large');
    if (avatarContainer) {
      const tempImg = avatarContainer.querySelector('.profile-photo[style*="opacity: 0.7"]');
      if (tempImg) {
        tempImg.remove();
      }
      const hiddenIcon = avatarContainer.querySelector('.fas.fa-user-circle[style*="display: none"]');
      if (hiddenIcon) {
        hiddenIcon.style.display = '';
      }
    }
  })
  .finally(() => {
    // Reset upload button
    if (uploadBtn) {
      uploadBtn.innerHTML = '<i class="fas fa-camera"></i>';
      uploadBtn.style.pointerEvents = '';
    }
  });
}

// Update profile photos after upload/remove
function updateProfilePhotos(filename) {
  console.log('🔄 updateProfilePhotos called with filename:', filename);
  console.log('🔄 Filename type:', typeof filename);
  console.log('🔄 Filename length:', filename ? filename.length : 'null');
  console.log('🔄 Filename characters:', filename ? filename.split('').map(c => c.charCodeAt(0)) : 'null');
  
  const avatarContainer = document.querySelector('.profile-avatar-large');
  if (!avatarContainer) {
    console.error('❌ .profile-avatar-large container not found!');
    return;
  }
  
  console.log('✅ Found avatar container:', avatarContainer);
  
  if (filename) {
    // Photo uploaded - show photo and remove button
    const timestamp = Date.now();
    const photoUrl = `uploads/profile_photos/${filename}?t=${timestamp}`;
    
    console.log('📸 Setting photo URL:', photoUrl);
    console.log('📸 Photo URL characters:', photoUrl.split('').map(c => c.charCodeAt(0)));
    
    // Test if the image loads
    const testImg = new Image();
    testImg.onload = function() {
      console.log('✅ Image loaded successfully:', photoUrl);
    };
    testImg.onerror = function() {
      console.error('❌ Image failed to load:', photoUrl);
    };
    testImg.src = photoUrl;
    
    avatarContainer.innerHTML = `
      <img src="${photoUrl}" alt="Profile Photo" class="profile-photo">
      <div class="photo-upload-overlay">
        <button type="button" class="photo-remove-btn" onclick="removeProfilePhoto()" title="Remove Photo">
          <i class="fas fa-trash"></i>
        </button>
        <input type="file" id="profilePhotoInput" accept="image/*" style="display: none;">
      </div>`;
    
    // Add has-photo class to show overlay
    avatarContainer.classList.add('has-photo');
    
    console.log('✅ Updated avatar container HTML');
    console.log('🔍 Avatar container after update:', avatarContainer.innerHTML);
    
    // Reattach event listener
    const newInput = avatarContainer.querySelector('#profilePhotoInput');
    if (newInput) {
      newInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
          if (showPhotoPreview(file)) {
            uploadProfilePhoto(file);
          } else {
            e.target.value = '';
          }
        }
      });
      console.log('✅ Reattached file input event listener');
    } else {
      console.error('❌ Could not find new file input after HTML update');
    }
    
    // Update sidebar avatar
    const sidebarAvatar = document.querySelector('.user-avatar');
    if (sidebarAvatar) {
      sidebarAvatar.innerHTML = `<img src="${photoUrl}" alt="Profile Photo" class="profile-photo">`;
      console.log('✅ Updated sidebar avatar');
    } else {
      console.warn('⚠️ Sidebar avatar not found');
    }
    
    togglePhotoButtons(true);
    console.log('✅ Photo upload process completed');
  } else {
    // Photo removed - show default icon and upload button
    avatarContainer.innerHTML = `
      <i class="fas fa-user-circle"></i>
      <div class="photo-upload-overlay">
        <label for="profilePhotoInput" class="photo-upload-btn" title="Change Photo">
          <i class="fas fa-camera"></i>
        </label>
        <input type="file" id="profilePhotoInput" accept="image/*" style="display: none;">
      </div>`;
    
    // Remove has-photo class to hide overlay
    avatarContainer.classList.remove('has-photo');
    
    // Reattach event listener
    const newInput = avatarContainer.querySelector('#profilePhotoInput');
    if (newInput) {
      newInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
          if (showPhotoPreview(file)) {
            uploadProfilePhoto(file);
          } else {
            e.target.value = '';
          }
        }
      });
    }
    
    // Update sidebar avatar
    const sidebarAvatar = document.querySelector('.user-avatar');
    if (sidebarAvatar) {
      sidebarAvatar.innerHTML = '<i class="fas fa-user-circle"></i>';
    }
    
    togglePhotoButtons(false);
  }
}

// Remove profile photo with confirmation
function removeProfilePhoto() {
  console.log('🗑️ removeProfilePhoto called');
  if (typeof window.showConfirmation === 'function') {
    showConfirmation(
      'Remove Profile Photo',
      'Are you sure you want to remove your profile photo? This action cannot be undone.',
      removePhotoAction
    );
  } else {
    if (window.confirm('Remove your profile photo? This action cannot be undone.')) {
      removePhotoAction();
    }
  }
}

// Action to remove photo
function removePhotoAction() {
  console.log('🗑️ removePhotoAction called');
  if (__cr_isRemovingPhoto) {
    console.log('🛑 removePhotoAction blocked: already in progress');
    return;
  }
  __cr_isRemovingPhoto = true;
  const formData = new FormData();
  formData.append('action', 'remove_photo');
  
  // Show loading state
  const removeBtn = document.querySelector('.photo-remove-btn');
  if (removeBtn) {
    console.log('✅ Remove button found, showing loading state');
    removeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    removeBtn.style.pointerEvents = 'none';
  } else {
    console.error('❌ Remove button not found');
  }
  
  console.log('🌐 Sending remove photo request...');
  fetch('profile_action.php', {
    method: 'POST',
    body: formData,
    credentials: 'same-origin'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showNotification('success', 'Success', 'Profile photo removed successfully!');
      updateProfilePhotos(null);
    } else {
      // Student-specific guard: if server says no photo but UI shows one, reconcile optimistically
      const isStudent = document.body && document.body.classList && document.body.classList.contains('student-dashboard');
      const avatarHasImg = !!document.querySelector('.profile-avatar-large img.profile-photo');
      if (isStudent && avatarHasImg && /no profile photo to remove/i.test(data.message || '')) {
        updateProfilePhotos(null);
        showNotification('success', 'Success', 'Profile photo removed successfully!');
      } else {
        showNotification('error', 'Remove Failed', data.message || 'Unknown error occurred');
      }
    }
  })
  .catch(error => {
    console.error('Remove error:', error);
    showNotification('error', 'Remove Failed', 'Network error. Please try again.');
  })
  .finally(() => {
    // Reset remove button
    if (removeBtn) {
      removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
      removeBtn.style.pointerEvents = '';
    }
    __cr_isRemovingPhoto = false;
  });
}

// Toggle photo buttons visibility
function togglePhotoButtons(hasPhoto) {
  const uploadBtn = document.querySelector('.photo-upload-btn');
  const removeBtn = document.querySelector('.photo-remove-btn');
  
  if (hasPhoto) {
    if (uploadBtn) uploadBtn.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'flex';
  } else {
    if (uploadBtn) uploadBtn.style.display = 'flex';
    if (removeBtn) removeBtn.style.display = 'none';
  }
}

// Custom confirmation modal functions
let originalBodyOverflow = '';

function showConfirmation(title, message, onConfirm, onCancel) {
  const modal = document.getElementById('confirmationModal');
  const titleEl = document.getElementById('confirmationTitle');
  const messageEl = document.getElementById('confirmationMessage');
  const confirmBtn = document.getElementById('confirmationConfirmBtn');
  const cancelBtn = document.getElementById('confirmationCancelBtn');
  
  if (!modal || !titleEl || !messageEl || !confirmBtn || !cancelBtn) {
    console.error('Confirmation modal elements not found');
    return;
  }
  
  // Store original overflow value
  originalBodyOverflow = document.body.style.overflow || '';
  
  // Set content
  titleEl.textContent = title;
  messageEl.textContent = message;
  
  // Clear previous event listeners by cloning buttons
  const newConfirmBtn = confirmBtn.cloneNode(true);
  const newCancelBtn = cancelBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
  
  // Add event listeners to new buttons
  newConfirmBtn.addEventListener('click', function() {
    hideConfirmation();
    if (onConfirm) onConfirm();
  });
  
  newCancelBtn.addEventListener('click', function() {
    hideConfirmation();
    if (onCancel) onCancel();
  });
  
  // Show modal
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Close on overlay click
  const overlay = modal.querySelector('.confirmation-overlay');
  if (overlay) {
    overlay.addEventListener('click', hideConfirmation);
  }
  
  // Close on Escape key
  const escapeHandler = function(e) {
    if (e.key === 'Escape') {
      hideConfirmation();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

function hideConfirmation() {
  const modal = document.getElementById('confirmationModal');
  if (modal) {
    modal.style.display = 'none';
    // Restore original overflow value
    document.body.style.overflow = originalBodyOverflow;
  }
}

// Initialize profile functionality
function initSharedProfile() {
  console.log('🔧 Initializing shared profile functionality...');
  
  // Guard against multiple initializations
  if (window.__profileInitialized) {
    console.log('⚠️ Profile already initialized, skipping...');
    return;
  }
  window.__profileInitialized = true;
  
  // Profile photo upload functionality
  const profilePhotoInput = document.getElementById('profilePhotoInput');
  if (profilePhotoInput) {
    console.log('✅ Profile photo input found');
    profilePhotoInput.addEventListener('change', function(e) {
      console.log('📸 Photo input changed');
      const file = e.target.files[0];
      if (file) {
        console.log('📁 File selected:', file.name, file.size, file.type);
        // Show preview before upload and validate
        if (showPhotoPreview(file)) {
          console.log('✅ Photo preview successful, uploading...');
          uploadProfilePhoto(file);
        } else {
          console.log('❌ Photo preview failed, resetting input');
          // Reset file input if validation failed
          e.target.value = '';
        }
      }
    });
  } else {
    console.error('❌ Profile photo input not found');
  }
  
  // Add direct click handler for photo upload button
  const photoUploadBtn = document.querySelector('.photo-upload-btn');
  if (photoUploadBtn) {
    console.log('✅ Photo upload button found');
    photoUploadBtn.addEventListener('click', function(e) {
      console.log('📸 Photo upload button clicked');
      e.preventDefault();
      if (profilePhotoInput) {
        profilePhotoInput.click();
      }
    });
  } else {
    console.error('❌ Photo upload button not found');
  }
  
  // Profile tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      
      // Remove active class from all tabs and buttons
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      this.classList.add('active');
      document.getElementById(tabId).classList.add('active');
      
      // Load preferences when preferences tab is activated
      if (tabId === 'preferences') {
        loadPreferences();
      }
    });
  });
  
  // Helper to apply theme instantly and persist in localStorage
  const applyThemeClass = (value) => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldDark = value === 'dark' || (value === 'auto' && prefersDark);
    document.body.classList.toggle('dark-mode', shouldDark);
    localStorage.setItem('adminTheme', shouldDark ? 'dark' : 'light');
  };

  // Live theme preview when selecting in Preferences
  const themeSelect = document.getElementById('themePreference');
  if (themeSelect) {
    applyThemeClass(themeSelect.value);
    themeSelect.addEventListener('change', function() {
      applyThemeClass(this.value);
      // If admin's native applier exists, call it too (keeps header/icon in sync)
      if (typeof window.applyThemePreference === 'function') {
        window.applyThemePreference();
      }
    });
  }

  // Profile form submissions
  const personalInfoForm = document.getElementById('personalInfoForm');
  if (personalInfoForm) {
    personalInfoForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData();
      formData.append('action', 'update_personal_info');
      formData.append('firstname', document.getElementById('profileFirstname').value);
      formData.append('middlename', document.getElementById('profileMiddlename').value);
      formData.append('lastname', document.getElementById('profileLastname').value);
      
      fetch('profile_action.php', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showNotification('success', 'Success', 'Profile updated successfully!');
          // Update sidebar name in real-time
          updateSidebarName();
        } else {
          showNotification('error', 'Error', data.message || 'Update failed');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showNotification('error', 'Error', 'An unexpected error occurred');
      });
    });
  }
  
  // Password change form
  let changePasswordForm = document.getElementById('changePasswordForm');
  if (changePasswordForm) {
    // Hard-remove any previously attached listeners by cloning the node
    const cloned = changePasswordForm.cloneNode(true);
    changePasswordForm.parentNode.replaceChild(cloned, changePasswordForm);
    changePasswordForm = cloned;

    changePasswordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (__cr_isPasswordChanging) return; // guard against duplicate submits

      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      // Client-side validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('error', 'Error', 'All password fields are required');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        showNotification('error', 'Error', 'New passwords do not match');
        return;
      }
      
      // Check if new password is same as current password
      if (currentPassword === newPassword) {
        showNotification('error', 'Error', 'New password must be different from current password');
        return;
      }
      
      const formData = new FormData();
      formData.append('action', 'change_password');
      formData.append('current_password', currentPassword);
      formData.append('new_password', newPassword);
      formData.append('confirm_password', confirmPassword);
      
      // Debug logging
      console.log('Password change attempt:', {
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      });
      
      __cr_isPasswordChanging = true;

      fetch('profile_action.php', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showNotification('success', 'Success', 'Password changed successfully!');
          changePasswordForm.reset();
        } else {
          showNotification('error', 'Error', data.message || 'Password change failed');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showNotification('error', 'Error', 'An unexpected error occurred');
      })
      .finally(() => { __cr_isPasswordChanging = false; });
    });
  }
  
  // Preferences form
  let preferencesForm = document.getElementById('preferencesForm');
  if (preferencesForm) {
    // Clear any pre-existing listeners by cloning
    const clonedPrefs = preferencesForm.cloneNode(true);
    preferencesForm.parentNode.replaceChild(clonedPrefs, preferencesForm);
    preferencesForm = clonedPrefs;

    preferencesForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (__cr_isSavingPreferences) return;
      
      const formData = new FormData();
      formData.append('action', 'update_preferences');

      const themeEl = document.getElementById('themePreference');
      if (themeEl) formData.append('theme', themeEl.value);

      const refreshEl = document.getElementById('refreshRate');
      if (refreshEl) formData.append('refresh_rate', refreshEl.value);

      const emailEl = document.getElementById('emailNotifications');
      if (emailEl) formData.append('email_notifications', emailEl.checked ? '1' : '0');
      // Maintain backward compat: also send show_notifications for server
      formData.append('show_notifications', emailEl && emailEl.checked ? '1' : '0');

      const pushEl = document.getElementById('pushNotifications');
      if (pushEl) formData.append('push_notifications', pushEl.checked ? '1' : '0');
      
      __cr_isSavingPreferences = true;
      fetch('profile_action.php', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showNotification('success', 'Success', 'Preferences saved successfully!');
          // Persist locally and apply immediately without full reload
          const themeCur = (document.getElementById('themePreference') && document.getElementById('themePreference').value) || 'light';
          const refreshCur = (document.getElementById('refreshRate') && document.getElementById('refreshRate').value) || '10';
          const emailCur = (document.getElementById('emailNotifications') && document.getElementById('emailNotifications').checked) ? 'true' : 'false';
          const pushCur = (document.getElementById('pushNotifications') && document.getElementById('pushNotifications').checked) ? 'true' : 'false';
          try {
            localStorage.setItem('theme', themeCur);
            localStorage.setItem('refreshRate', refreshCur);
            localStorage.setItem('emailNotifications', emailCur);
            localStorage.setItem('pushNotifications', pushCur);
          } catch (e) { /* storage optional */ }

          // Apply theme instantly
          if (typeof applyThemeClass === 'function') {
            applyThemeClass(themeCur);
          }
          if (typeof window.applyThemePreference === 'function') {
            window.applyThemePreference();
          }
        } else {
          showNotification('error', 'Error', data.message || 'Failed to save preferences');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showNotification('error', 'Error', 'An unexpected error occurred');
      })
      .finally(() => { __cr_isSavingPreferences = false; });
    });
  }
}

// Load preferences from localStorage
function loadPreferences() {
  const theme = localStorage.getItem('theme') || 'light';
  const refreshRate = localStorage.getItem('refreshRate') || '10';
  const emailNotifications = localStorage.getItem('emailNotifications') !== 'false';
  const pushNotifications = localStorage.getItem('pushNotifications') !== 'false';
  
  const themeSelect = document.getElementById('themePreference');
  const refreshSelect = document.getElementById('refreshRate');
  const emailCheckbox = document.getElementById('emailNotifications');
  const pushCheckbox = document.getElementById('pushNotifications');
  
  if (themeSelect) themeSelect.value = theme;
  if (refreshSelect) refreshSelect.value = refreshRate;
  if (emailCheckbox) emailCheckbox.checked = emailNotifications;
  if (pushCheckbox) pushCheckbox.checked = pushNotifications;

  // Apply theme to body
  document.body.classList.remove('dark-mode');
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  }
}

// Toggle password visibility
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const toggle = input.parentElement.querySelector('.password-toggle i');
  
  if (input.type === 'password') {
    input.type = 'text';
    toggle.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    toggle.className = 'fas fa-eye';
  }
}

// Make functions globally available
window.uploadProfilePhoto = window.uploadProfilePhoto || uploadProfilePhoto;
// Do not overwrite if another dashboard already provided this
if (typeof window.removeProfilePhoto !== 'function') {
  window.removeProfilePhoto = removeProfilePhoto;
}
window.hideConfirmation = window.hideConfirmation || hideConfirmation;
window.initSharedProfile = window.initSharedProfile || initSharedProfile;
window.togglePassword = window.togglePassword || togglePassword;
window.showPhotoPreview = window.showPhotoPreview || showPhotoPreview;
window.updateSidebarName = window.updateSidebarName || updateSidebarName;
