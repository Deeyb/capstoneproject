// login.js
(function() {
    // Global variables
    let isSubmitting = false;

    // --- Section: DOM Ready ---
    document.addEventListener('DOMContentLoaded', function() {
        // Auto-focus on email field
        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.focus();
        }
        
        // Login form submit
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLoginSubmit);
            
            // Real-time validation
            loginForm.addEventListener('input', handleRealTimeValidation);
        }
        
        // Google login button
        const googleLoginBtn = document.getElementById('googleLoginBtn');
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', handleGoogleLogin);
        }
        
        // Password toggle eye icon
        const passwordToggle = document.querySelector('.password-toggle-eye');
        if (passwordToggle) {
            passwordToggle.addEventListener('click', function() {
                togglePassword('password', 'togglePasswordIcon');
            });
            passwordToggle.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    togglePassword('password', 'togglePasswordIcon');
                }
            });
        }
        
        // Show error alert if present (from PHP session)
        const errorMsg = document.querySelector('meta[name="error-message"]');
        if (errorMsg && errorMsg.content) {
            showAlert(errorMsg.content, 'danger');
        }
        
        // Initialize accessibility features
        initializeAccessibility();
    });

    // --- Section: Accessibility ---
    function initializeAccessibility() {
        // Add skip link for keyboard users
        const skipLink = document.createElement('a');
        skipLink.href = '#loginForm';
        skipLink.textContent = 'Skip to login form';
        skipLink.className = 'skip-link visually-hidden-focusable';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
            z-index: 1000;
        `;
        skipLink.addEventListener('focus', function() {
            this.style.top = '6px';
        });
        skipLink.addEventListener('blur', function() {
            this.style.top = '-40px';
        });
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add focus indicators
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', function() {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    // --- Section: Real-time Validation ---
    function handleRealTimeValidation(event) {
        const field = event.target;
        const fieldId = field.id;
        
        if (fieldId === 'email') {
            validateEmailField(field);
        } else if (fieldId === 'password') {
            validatePasswordField(field);
        }
    }
    
    function validateEmailField(field) {
        const email = field.value.trim();
        const isValid = validateEmail(email);
        
        field.setAttribute('aria-invalid', isValid ? 'false' : 'true');
        
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
        }
    }
    
    function validatePasswordField(field) {
        const password = field.value;
        const isValid = validatePassword(password);
        
        field.setAttribute('aria-invalid', isValid ? 'false' : 'true');
        
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
        }
    }

    // --- Section: Alert System ---
    function showAlert(message, type = 'info', duration = 5000) {
        const alertContainer = document.getElementById('alertContainer');
        const alertId = 'alert-' + Date.now() + Math.floor(Math.random() * 1000);
        const icon = getAlertIcon(type);
        let bgColor = '#d4edda', textColor = '#155724', borderColor = '#28a745';
        if (type === 'danger') { bgColor = '#f8d7da'; textColor = '#721c24'; borderColor = '#dc3545'; }
        if (type === 'warning') { bgColor = '#fff3cd'; textColor = '#856404'; borderColor = '#ffc107'; }
        if (type === 'info') { bgColor = '#d1ecf1'; textColor = '#0c5460'; borderColor = '#17a2b8'; }
        
        const alertHtml = `
            <div id="${alertId}" class="custom-toast-alert" style="background:${bgColor};color:${textColor};border-left-color:${borderColor};" role="alert" aria-live="assertive">
                <i class="fa fa-${icon}" aria-hidden="true"></i>
                <div style="flex:1;">${message}</div>
                <button type="button" class="btn-close" onclick="removeAlert('${alertId}')" aria-label="Close alert">&times;</button>
            </div>
        `;
        alertContainer.insertAdjacentHTML('beforeend', alertHtml);
        
        // Announce to screen readers
        announceToScreenReader(message);
        
        setTimeout(() => removeAlert(alertId), duration);
        return alertId;
    }

    function removeAlert(alertId) {
        const alert = document.getElementById(alertId);
        if (alert) {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 150);
        }
    }

    function getAlertIcon(type) {
        const icons = {
            'success': 'check-circle',
            'danger': 'exclamation-triangle',
            'warning': 'exclamation-circle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // --- Section: Password Toggle ---
    window.togglePassword = function(fieldId, iconId) {
        const field = document.getElementById(fieldId);
        const icon = document.getElementById(iconId);
        const toggleButton = icon.closest('.password-toggle-eye');
        
        if (field.type === 'password') {
            field.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
            toggleButton.setAttribute('aria-pressed', 'true');
            toggleButton.setAttribute('aria-label', 'Hide password');
        } else {
            field.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
            toggleButton.setAttribute('aria-pressed', 'false');
            toggleButton.setAttribute('aria-label', 'Show password');
        }
        
        // Focus back to the password field for better UX
        field.focus();
    };

    // --- Section: Form Validation ---
    function validateEmail(email) {
        if (!email) {
            return false;
        }
        
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            return false;
        }
        
        if (!/^[a-zA-Z0-9._%+\-]+@kld\.edu\.ph$/.test(email)) {
            return false;
        }
        
        return true;
    }

    function validatePassword(password) {
        if (!password) {
            return false;
        }
        
        if (password.length < 8) {
            return false;
        }
        
        return true;
    }

    // --- Section: Form Submission ---
    function handleLoginSubmit(event) {
        event.preventDefault();
        
        if (isSubmitting) {
            return false;
        }

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Validate fields
        const emailError = validateEmail(email) ? null : 'Please enter a valid KLD email address.';
        const passwordError = validatePassword(password) ? null : 'Password must be at least 8 characters long.';

        if (emailError) {
            showAlert(emailError, 'warning');
            document.getElementById('email').focus();
            return false;
        }

        if (passwordError) {
            showAlert(passwordError, 'warning');
            document.getElementById('password').focus();
            return false;
        }

        // Show loading state
        setLoadingState(true);

        // Submit form via AJAX
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        if (rememberMe) {
            formData.append('rememberMe', '1');
        }
        // Add CSRF token
        const csrfToken = document.querySelector('input[name="csrf_token"]')?.value;
        if (csrfToken) {
            formData.append('csrf_token', csrfToken);
        }

        fetch('login_process.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            setLoadingState(false);
            
            if (data.success) {
                showAlert(data.message || 'Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = data.redirect || 'dashboard.php';
                }, 1500);
            } else {
                if (data.errors && data.errors.length > 0) {
                    data.errors.forEach(error => {
                        showAlert(error, 'danger');
                    });
                } else {
                    showAlert(data.message || 'Login failed. Please try again.', 'danger');
                }
            }
        })
        .catch(error => {
            setLoadingState(false);
            console.error('Error:', error);
            showAlert('Network error. Please check your connection and try again.', 'danger');
        });

        return false;
    }

    function setLoadingState(loading) {
        isSubmitting = loading;
        const submitBtn = document.getElementById('signInBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        if (loading) {
            btnText.classList.add('d-none');
            btnLoading.classList.remove('d-none');
            submitBtn.disabled = true;
            submitBtn.setAttribute('aria-busy', 'true');
        } else {
            btnText.classList.remove('d-none');
            btnLoading.classList.add('d-none');
            submitBtn.disabled = false;
            submitBtn.setAttribute('aria-busy', 'false');
        }
    }

    // --- Section: Google Login ---
    function handleGoogleLogin(event) {
        const button = event.currentTarget;
        
        // Prevent multiple clicks
        if (button.classList.contains('loading')) {
            event.preventDefault();
            return;
        }
        
        // Show loading state
        button.classList.add('loading');
        button.querySelector('.btn-text').style.opacity = '0';
        button.querySelector('.btn-loading').classList.remove('d-none');
        
        // Show connecting message
        showAlert('Connecting to Google...', 'info', 3000);
        
        // The actual redirect will happen automatically via the href
        // We just need to show the loading state
    }

    // --- Section: Global Functions ---
    window.showAlert = showAlert;
    window.removeAlert = removeAlert;

})(); 