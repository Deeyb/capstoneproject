// registration.js
(function() {
    // Auto-focus on first field when page loads
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('firstname').focus();
        // Registration form submit
        const regForm = document.getElementById('registrationForm');
        if (regForm) {
            regForm.addEventListener('submit', handleSubmit);
        }
        // Send verification code button
        const sendCodeBtn = document.getElementById('sendCodeBtn');
        if (sendCodeBtn) {
            sendCodeBtn.addEventListener('click', sendVerificationCode);
        }
        // Attach real-time validation listeners
        Object.keys(validationRules).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => validateField(fieldId, validationRules[fieldId]));
                field.addEventListener('blur', () => validateField(fieldId, validationRules[fieldId]));
            }
        });
        // Attach password checklist and strength bar listeners
        const passwordField = document.getElementById('password');
        const confirmPasswordField = document.getElementById('confirmPassword');
        if (passwordField && confirmPasswordField) {
            passwordField.addEventListener('input', validatePassword);
            confirmPasswordField.addEventListener('input', validatePassword);
            passwordField.addEventListener('blur', validatePassword);
            confirmPasswordField.addEventListener('blur', validatePassword);
        }
        // Attach Terms and Privacy link listeners
        const termsLink = document.querySelector('.terms-link');
        if (termsLink) {
            termsLink.addEventListener('click', function(e) {
                e.preventDefault();
                showTerms();
            });
        }
        const privacyLink = document.querySelector('.privacy-link');
        if (privacyLink) {
            privacyLink.addEventListener('click', function(e) {
                e.preventDefault();
                showPrivacy();
            });
        }
    });

    // Global variables
    let isSubmitting = false;
    let verificationCodeSent = false;
    let validationTimers = {};
    let idnumberAjaxValid = null;
    let emailAjaxValid = null;
    let idnumberAjaxTimer = null;
    let emailAjaxTimer = null;

    // Terms and Privacy functions
    window.showTerms = function() {
        showAlert('Terms and Conditions: By creating an account, you agree to follow all CodeRegal platform rules and guidelines. You are responsible for maintaining the confidentiality of your account and password.', 'info', 8000);
    }
    window.showPrivacy = function() {
        showAlert('Privacy Policy: Your personal information is collected and used in accordance with our privacy policy. We do not share your data with third parties without your consent.', 'info', 8000);
    }

    // Dynamic Alert System
    window.showAlert = function(message, type = 'info', duration = 5000) {
        const alertContainer = document.getElementById('alertContainer');
        const alertId = 'alert-' + Date.now();
        const alertHtml = `
            <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="fa fa-${getAlertIcon(type)} me-2"></i>
                ${message}
                <button type="button" class="btn-close" onclick="removeAlert('${alertId}')"></button>
            </div>
        `;
        alertContainer.insertAdjacentHTML('beforeend', alertHtml);
        setTimeout(() => removeAlert(alertId), duration);
        return alertId;
    }
    window.removeAlert = function(alertId) {
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

    // Real-time validation rules with better error messages
    const validationRules = {
        firstname: [
            { test: (value) => value.length >= 2, message: 'First name must be at least 2 characters long' },
            { test: (value) => /^[a-zA-Z\s\'-]+$/.test(value), message: 'First name can only contain letters, spaces, hyphens, and apostrophes' }
        ],
        lastname: [
            { test: (value) => value.length >= 2, message: 'Last name must be at least 2 characters long' },
            { test: (value) => /^[a-zA-Z\s\'-]+$/.test(value), message: 'Last name can only contain letters, spaces, hyphens, and apostrophes' }
        ],
        middlename: [
            { test: (value) => value === '' || /^[a-zA-Z\s\'-]+$/.test(value), message: 'Middle name can only contain letters, spaces, hyphens, and apostrophes' }
        ],
        idnumber: [
            { test: (value) => /^KLD-\d{2}-\d{6}$/.test(value), message: 'ID number must be in format KLD-YY-XXXXXX (e.g., KLD-22-000123)' }
        ],
        email: [
            { test: (value) => /^[a-zA-Z0-9._%+\-]+@kld\.edu\.ph$/.test(value), message: 'Please enter a valid KLD email address (@kld.edu.ph)' }
        ]
    };

    // Enhanced Validation System
    window.validateField = function(fieldId, validationRules) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(fieldId + 'Error');
        const icon = document.getElementById(fieldId + 'Icon');
        const value = field.value.trim();
        if (fieldId === 'idnumber') {
            idnumberAjaxValid = null;
            field.classList.remove('is-invalid');
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
            if (icon) icon.innerHTML = '<i class="fa fa-circle text-muted"></i>';
            clearTimeout(idnumberAjaxTimer);
            idnumberAjaxTimer = setTimeout(validateIdNumber, 400);
            return;
        }
        if (fieldId === 'email') {
            emailAjaxValid = null;
            field.classList.remove('is-invalid');
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
            if (icon) icon.innerHTML = '<i class="fa fa-circle text-muted"></i>';
            clearTimeout(emailAjaxTimer);
            emailAjaxTimer = setTimeout(validateEmail, 400);
            return;
        }
        clearTimeout(validationTimers[fieldId]);
        validationTimers[fieldId] = setTimeout(() => {
            let isValid = true;
            let errorMessage = '';
            for (const rule of validationRules) {
                if (!rule.test(value)) {
                    isValid = false;
                    errorMessage = rule.message;
                    break;
                }
            }
            updateFieldValidation(fieldId, isValid, errorMessage);
        }, 300);
    }
    window.updateFieldValidation = function(fieldId, isValid, errorMessage = '') {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(fieldId + 'Error');
        const icon = document.getElementById(fieldId + 'Icon');
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
            if (icon) {
                icon.innerHTML = '<i class="fa fa-check text-success"></i>';
            }
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = 'block';
            if (icon) {
                icon.innerHTML = '<i class="fa fa-times text-danger"></i>';
            }
        }
    }
    window.validateIdNumber = function() {
        const field = document.getElementById('idnumber');
        const icon = document.getElementById('idnumberIcon');
        const errorDiv = document.getElementById('idnumberError');
        const idnumber = field.value.trim();
        if (!/^KLD-\d{2}-\d{6}$/.test(idnumber)) {
            field.classList.remove('is-valid', 'is-invalid');
            if (icon) icon.innerHTML = '<i class="fa fa-circle text-muted"></i>';
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
            return;
        }
        setFieldChecking('idnumber');
        fetch('user_action_ajax.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `check_id=${encodeURIComponent(idnumber)}`
        })
        .then(response => response.json())
        .then(data => {
            idnumberAjaxValid = !data.id_used;
            if (idnumberAjaxValid) {
                field.classList.remove('is-invalid');
                field.classList.add('is-valid');
                errorDiv.textContent = '';
                errorDiv.style.display = 'none';
                if (icon) icon.innerHTML = '<i class="fa fa-check text-success"></i>';
            } else {
                field.classList.remove('is-valid');
                field.classList.add('is-invalid');
                errorDiv.textContent = 'This ID number is already registered';
                errorDiv.style.display = 'block';
                if (icon) icon.innerHTML = '<i class="fa fa-times text-danger"></i>';
            }
        })
        .catch(error => {
            idnumberAjaxValid = null;
            field.classList.remove('is-valid', 'is-invalid');
            if (icon) icon.innerHTML = '<i class="fa fa-circle text-muted"></i>';
            errorDiv.textContent = 'Unable to validate ID number. Please try again.';
            errorDiv.style.display = 'block';
        });
    }
    window.validateEmail = function() {
        const field = document.getElementById('email');
        const icon = document.getElementById('emailIcon');
        const errorDiv = document.getElementById('emailError');
        const email = field.value.trim();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            field.classList.remove('is-valid', 'is-invalid');
            if (icon) icon.innerHTML = '<i class="fa fa-circle text-muted"></i>';
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
            return;
        }
        setFieldChecking('email');
        fetch('user_action_ajax.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `check_email=${encodeURIComponent(email)}`
        })
        .then(response => response.json())
        .then(data => {
            emailAjaxValid = !data.email_used;
            if (emailAjaxValid) {
                field.classList.remove('is-invalid');
                field.classList.add('is-valid');
                errorDiv.textContent = '';
                errorDiv.style.display = 'none';
                if (icon) icon.innerHTML = '<i class="fa fa-check text-success"></i>';
            } else {
                field.classList.remove('is-valid');
                field.classList.add('is-invalid');
                errorDiv.textContent = 'This email is already registered';
                errorDiv.style.display = 'block';
                if (icon) icon.innerHTML = '<i class="fa fa-times text-danger"></i>';
            }
        })
        .catch(error => {
            emailAjaxValid = null;
            field.classList.remove('is-valid', 'is-invalid');
            if (icon) icon.innerHTML = '<i class="fa fa-circle text-muted"></i>';
            errorDiv.textContent = 'Unable to validate email. Please try again.';
            errorDiv.style.display = 'block';
        });
    }
    function setFieldChecking(fieldId) {
        const icon = document.getElementById(fieldId + 'Icon');
        if (icon) icon.innerHTML = '<i class="fa fa-spinner fa-spin text-secondary"></i>';
    }

    // Password checklist and strength bar validation
    function validatePassword() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const checklist = document.getElementById('passwordChecklist');
        const strengthBar = document.getElementById('strengthBar');
        if (password) {
            checklist.classList.remove('hide');
            const requirements = {
                length: password.length >= 8,
                upper: /[A-Z]/.test(password),
                lower: /[a-z]/.test(password),
                number: /[0-9]/.test(password),
                special: /[^A-Za-z0-9]/.test(password)
            };
            // Update checklist items
            Object.keys(requirements).forEach(req => {
                const li = document.getElementById(`pw-${req}`);
                const icon = li.querySelector('i');
                if (requirements[req]) {
                    li.classList.add('valid');
                    icon.className = 'fa fa-check text-success';
                } else {
                    li.classList.remove('valid');
                    icon.className = 'fa fa-circle text-muted';
                }
            });
            // Calculate strength
            const strength = Object.values(requirements).filter(Boolean).length;
            const strengthPercent = (strength / 5) * 100;
            strengthBar.style.width = strengthPercent + '%';
            strengthBar.className = 'strength-bar ' + getStrengthClass(strength);
            // Validate confirm password
            if (confirmPassword) {
                const isValid = password === confirmPassword;
                updateFieldValidation('confirmPassword', isValid, isValid ? '' : 'Passwords do not match');
            }
        } else {
            checklist.classList.add('hide');
        }
    }
    function getStrengthClass(strength) {
        if (strength <= 2) return 'weak';
        if (strength <= 3) return 'medium';
        if (strength <= 4) return 'good';
        return 'strong';
    }

    // --- Additions for full functionality ---
    function handleSubmit(event) {
        event.preventDefault();
        if (isSubmitting) return false;
        // Check Terms and Conditions
        const termsChecked = document.getElementById('termsConditions').checked;
        if (!termsChecked) {
            showAlert('Please agree to the Terms and Conditions and Privacy Policy to continue.', 'warning');
            document.getElementById('termsConditions').focus();
            return false;
        }
        // Validate all fields
        const requiredFields = ['firstname', 'lastname', 'idnumber', 'email', 'password', 'confirmPassword', 'verification'];
        let isValid = true;
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const value = field.value.trim();
            if (!value) {
                updateFieldValidation(fieldId, false, 'This field is required');
                isValid = false;
            }
        });
        if (!isValid) {
            showAlert('Please fill in all required fields correctly', 'warning');
            return false;
        }
        // Check if verification code was sent
        if (!verificationCodeSent) {
            showAlert('Please send and enter the verification code first', 'warning');
            return false;
        }
        // Show loading state
        setLoadingState(true);
        // Submit form
        const formData = new FormData(document.getElementById('registrationForm'));
        fetch('process_registration.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            setLoadingState(false);
            if (data.success) {
                showAlert('Registration successful! Redirecting to login...', 'success');
                setTimeout(() => {
                    window.location.href = 'login.php';
                }, 2000);
            } else {
                showAlert(data.message || 'Registration failed. Please try again.', 'danger');
                if (data.errors && Array.isArray(data.errors)) {
                    data.errors.forEach(err => showAlert(err, 'danger', 6000));
                }
            }
        })
        .catch(error => {
            setLoadingState(false);
            console.error('Error:', error);
            showAlert('An error occurred. Please try again.', 'danger');
        });
        return false;
    }
    function sendVerificationCode() {
        console.log('[SEND CODE] Starting verification code request...');
        const email = document.getElementById('email').value.trim();
        const sendBtn = document.getElementById('sendCodeBtn');
        const btnText = sendBtn.querySelector('.btn-text');
        const btnLoading = sendBtn.querySelector('.btn-loading');
        if (!email) {
            showAlert('Please enter your email address first', 'warning');
            document.getElementById('email').focus();
            return;
        }
        if (!/^[a-zA-Z0-9._%+\-]+@kld\.edu\.ph$/.test(email)) {
            showAlert('Please enter a valid KLD email address (@kld.edu.ph)', 'warning');
            document.getElementById('email').focus();
            return;
        }
        // Show loading state
        btnText.classList.add('d-none');
        btnLoading.classList.remove('d-none');
        sendBtn.disabled = true;
        // Get CSRF token
        const csrfToken = document.querySelector('input[name="csrf_token"]')?.value;
        let body = `email=${encodeURIComponent(email)}`;
        if (csrfToken) {
            body += `&csrf_token=${encodeURIComponent(csrfToken)}`;
        }
        // Build absolute URL to avoid path issues
        const verificationUrl = new URL('send_verification.php', window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/'));
        console.log('[SEND CODE] Fetching from:', verificationUrl.toString());
        
        fetch(verificationUrl.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body,
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) {
                showAlert('Server error: ' + response.status + ' ' + response.statusText, 'danger');
                throw new Error('Server error: ' + response.status);
            }
            return response.json().catch(e => {
                showAlert('Invalid JSON response from server.', 'danger');
                console.error('JSON parse error:', e);
                throw e;
            });
        })
        .then(data => {
            btnText.classList.remove('d-none');
            btnLoading.classList.add('d-none');
            sendBtn.disabled = false;
            if (data.success) {
                verificationCodeSent = true;
                showAlert('Verification code sent successfully! Check your email inbox.', 'success');
                updateFieldValidation('email', true);
            } else {
                showAlert(data.message || 'Failed to send verification code. Please try again.', 'danger');
                if (data.errors && Array.isArray(data.errors)) {
                    data.errors.forEach(err => showAlert(err, 'danger', 6000));
                }
                if (data.debug) {
                    console.error('Debug info:', data.debug);
                }
            }
        })
        .catch(error => {
            btnText.classList.remove('d-none');
            btnLoading.classList.add('d-none');
            sendBtn.disabled = false;
            showAlert('Network or server error. See console for details.', 'danger');
            console.error('Fetch error:', error);
        });
    }
    function setLoadingState(loading) {
        isSubmitting = loading;
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        if (loading) {
            btnText.classList.add('d-none');
            btnLoading.classList.remove('d-none');
            submitBtn.disabled = true;
        } else {
            btnText.classList.remove('d-none');
            btnLoading.classList.add('d-none');
            submitBtn.disabled = false;
        }
    }
    // Eye toggle for password fields
    window.togglePassword = function(fieldId, iconId) {
        const field = document.getElementById(fieldId);
        const icon = document.getElementById(iconId);
        if (field.type === 'password') {
            field.type = 'text';
            icon.className = 'fa fa-eye-slash';
        } else {
            field.type = 'password';
            icon.className = 'fa fa-eye';
        }
    }
})(); 