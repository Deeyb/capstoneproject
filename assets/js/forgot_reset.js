function togglePassword(fieldId, iconId) {
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

function handleResetSubmit(event) {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const btn = document.getElementById('resetBtn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');
    let valid = true;
    let errorMsg = '';
    if (password.length < 8) {
        errorMsg = 'Password must be at least 8 characters long.';
        valid = false;
    } else if (!/[A-Z]/.test(password)) {
        errorMsg = 'Password must contain at least one uppercase letter.';
        valid = false;
    } else if (!/[a-z]/.test(password)) {
        errorMsg = 'Password must contain at least one lowercase letter.';
        valid = false;
    } else if (!/[0-9]/.test(password)) {
        errorMsg = 'Password must contain at least one number.';
        valid = false;
    } else if (!/[^A-Za-z0-9]/.test(password)) {
        errorMsg = 'Password must contain at least one special character.';
        valid = false;
    } else if (password !== confirmPassword) {
        errorMsg = 'Passwords do not match.';
        valid = false;
    }
    document.getElementById('passwordError').textContent = '';
    document.getElementById('confirmPasswordError').textContent = '';
    if (!valid) {
        if (errorMsg.includes('match')) {
            document.getElementById('confirmPasswordError').textContent = errorMsg;
        } else {
            document.getElementById('passwordError').textContent = errorMsg;
        }
        event.preventDefault();
        return false;
    }
    btnText.classList.add('d-none');
    btnLoading.classList.remove('d-none');
    btn.disabled = true;
    return true;
}

function handleForgotSubmit(event) {
    const btn = document.getElementById('forgotBtn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');
    btnText.classList.add('d-none');
    btnLoading.classList.remove('d-none');
    btn.disabled = true;
    return true;
}

function showToast(message, type = 'info') {
    var toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    // Remove old toasts
    toastContainer.innerHTML = '';
    var toastDiv = document.createElement('div');
    toastDiv.className = 'toast align-items-center text-bg-' + (type === 'success' || type === 'info' ? 'info' : 'danger') + ' border-0';
    toastDiv.setAttribute('role', 'alert');
    toastDiv.setAttribute('aria-live', 'assertive');
    toastDiv.setAttribute('aria-atomic', 'true');
    toastDiv.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    toastContainer.appendChild(toastDiv);
    var toast = new bootstrap.Toast(toastDiv, { delay: 4000 });
    toast.show();
}

document.addEventListener('DOMContentLoaded', function() {
    var forgotForm = document.getElementById('forgotForm');
    var forgotBtn = document.getElementById('forgotBtn');
    var forgotFeedback = document.getElementById('forgotFeedback');
    var forgotModal = document.getElementById('forgotPasswordModal');

    // If modal exists, setup AJAX handler
    if (forgotForm && forgotModal) {
        // Insert feedback div if not present
        if (!forgotFeedback) {
            forgotFeedback = document.createElement('div');
            forgotFeedback.id = 'forgotFeedback';
            forgotFeedback.className = 'mt-2';
            forgotForm.parentNode.insertBefore(forgotFeedback, forgotForm);
        }

        forgotForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var emailInput = forgotForm.querySelector('input[name="email"]');
            var email = emailInput ? emailInput.value : '';
            var btnText = forgotBtn.querySelector('.btn-text');
            var btnLoading = forgotBtn.querySelector('.btn-loading');
            btnText.classList.add('d-none');
            btnLoading.classList.remove('d-none');
            forgotBtn.disabled = true;
            forgotFeedback.innerHTML = '';

            fetch('send_reset_link.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
                body: 'email=' + encodeURIComponent(email)
            })
            .then(res => res.json())
            .then(data => {
                btnText.classList.remove('d-none');
                btnLoading.classList.add('d-none');
                forgotBtn.disabled = false;
                // Show inline alert instead of toast
                forgotFeedback.innerHTML = '<div class="alert ' + (data.success ? 'alert-info' : 'alert-danger') + ' text-center" role="alert" aria-live="polite">' + data.message + '</div>';
                if (data.success) {
                    forgotForm.reset();
                }
            })
            .catch(() => {
                btnText.classList.remove('d-none');
                btnLoading.classList.add('d-none');
                forgotBtn.disabled = false;
                forgotFeedback.innerHTML = '<div class="alert alert-danger text-center" role="alert" aria-live="polite">An error occurred. Please try again.</div>';
            });
        });

        // Clear feedback when modal is closed
        var bsModal = bootstrap.Modal.getOrCreateInstance(forgotModal);
        forgotModal.addEventListener('hidden.bs.modal', function() {
            forgotFeedback.innerHTML = '';
            forgotForm.reset();
        });
    }
}); 