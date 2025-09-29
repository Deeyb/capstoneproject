# CodeRegal Security Documentation

## Overview

This document outlines the security features implemented in the CodeRegal login system to ensure robust protection against common web application vulnerabilities.

## Security Features Implemented

### 1. CSRF Protection

**Implementation**: `classes/CSRFProtection.php`

**Features**:
- Generates cryptographically secure random tokens
- One-time use tokens (invalidated after use)
- 1-hour expiration time
- Automatic cleanup of expired tokens
- Session-based token storage

**Usage**:
```php
// Generate token for form
echo CSRFProtection::getTokenField();

// Validate token in form submission
if (!CSRFProtection::validateToken($_POST['csrf_token'])) {
    // Handle invalid token
}
```

**Protection Against**: Cross-Site Request Forgery attacks

### 2. Rate Limiting

**Implementation**: `classes/RateLimiter.php`

**Features**:
- IP-based rate limiting
- Email-based rate limiting
- Configurable limits and time windows
- Automatic cleanup of old records
- Database-backed storage

**Current Limits**:
- Login attempts: 5 per 5 minutes per IP
- Verification code requests: 3 per 15 minutes per IP, 2 per 15 minutes per email

**Usage**:
```php
$rateLimiter = new RateLimiter($db);

// Check if action is allowed
if (!$rateLimiter->isAllowed($ip, 'login_attempt', 5, 300)) {
    // Handle rate limit exceeded
}

// Record an attempt
$rateLimiter->recordAttempt($ip, 'login_attempt');
```

**Protection Against**: Brute force attacks, spam, and abuse

### 3. Session Security

**Features**:
- Session ID regeneration on login (prevents session fixation)
- Session timeout after 30 minutes of inactivity
- Secure session configuration
- Session data validation

**Implementation**:
```php
// Regenerate session ID on login
session_regenerate_id(true);

// Check session expiration
if ($loginService->isSessionExpired()) {
    // Redirect to login
}
```

**Protection Against**: Session fixation, session hijacking

### 4. Password Security

**Features**:
- Strong password requirements (8+ chars, uppercase, lowercase, numbers, special chars)
- Secure password hashing using `password_hash()` with cost factor 12
- Password verification using `password_verify()`
- Common password blacklist
- Consistent password validation across registration and login

**Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Not in common password list

### 5. Input Validation and Sanitization

**Features**:
- Server-side validation for all inputs
- Client-side validation with real-time feedback
- Input sanitization using `htmlspecialchars()`
- Prepared statements for all database queries
- Email format validation
- KLD domain restriction

**Implementation**:
```php
// Sanitize input
$email = User::sanitizeInput($_POST['email']);

// Validate email format and domain
if (!User::validateEmailFormat($email) || !preg_match('/@kld\.edu\.ph$/', $email)) {
    // Handle invalid email
}
```

**Protection Against**: SQL injection, XSS, data corruption

### 6. Remember Me Functionality

**Features**:
- Cryptographically secure random tokens (64 characters)
- Database storage with expiration
- HTTP-only, secure cookies
- Automatic cleanup of expired tokens
- Single-use tokens

**Implementation**:
```php
// Generate secure token
$token = bin2hex(random_bytes(32));
$expires = time() + (30 * 24 * 60 * 60); // 30 days

// Store in database
$stmt = $db->prepare("INSERT INTO remember_me_tokens (user_id, token, expires_at) VALUES (?, ?, FROM_UNIXTIME(?))");

// Set secure cookie
setcookie('remember_token', $token, $expires, '/', '', true, true);
```

### 7. Error Handling and Logging

**Features**:
- Generic error messages to users (no sensitive information)
- Detailed error logging for administrators
- Graceful handling of exceptions
- No information disclosure in error messages

**Implementation**:
```php
try {
    // Database operation
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage() . " - IP: " . $clientIP);
    $response['errors'][] = 'An error occurred. Please try again later.';
}
```

### 8. Access Control

**Features**:
- Role-based access control
- Session-based authentication
- Automatic logout on session expiration
- Secure redirect handling

**Implementation**:
```php
// Check user role
if ($user->isAdmin()) {
    // Admin functionality
}

// Check if logged in
if (!$loginService->isLoggedIn()) {
    // Redirect to login
}
```

## Database Security

### Required Tables

1. **users** table:
```sql
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN reset_token_expires DATETIME NULL;
ALTER TABLE users ADD COLUMN last_login DATETIME NULL;
```

2. **remember_me_tokens** table:
```sql
CREATE TABLE remember_me_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);
```

3. **rate_limits** table (auto-created by RateLimiter class):
```sql
CREATE TABLE rate_limits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_identifier_action (identifier, action),
    INDEX idx_created_at (created_at)
);
```

## Maintenance

### Cleanup Script

**File**: `scripts/cleanup_tokens.php`

**Features**:
- Cleans up expired remember me tokens
- Cleans up expired password reset tokens
- Cleans up old rate limit records
- Archives old logs (if applicable)

**Usage**:
```bash
# Run manually
php scripts/cleanup_tokens.php

# Set up cron job (recommended: daily at 2 AM)
0 2 * * * /usr/bin/php /path/to/your/project/scripts/cleanup_tokens.php
```

### Testing

**File**: `tests/login_test.php`

**Features**:
- Comprehensive test suite for all security features
- Tests edge cases and error conditions
- Validates security implementations
- Provides detailed test results

**Usage**:
```bash
php tests/login_test.php
```

## Security Headers

Add these headers to your web server configuration:

```apache
# Apache (.htaccess)
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' cdn.jsdelivr.net cdnjs.cloudflare.com; img-src 'self' data:; font-src 'self' cdnjs.cloudflare.com;"
```

```nginx
# Nginx
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' cdn.jsdelivr.net cdnjs.cloudflare.com; img-src 'self' data:; font-src 'self' cdnjs.cloudflare.com;";
```

## Accessibility and Security

### ARIA Attributes

- Proper ARIA labels for screen readers
- Keyboard navigation support
- Focus indicators for keyboard users
- Screen reader announcements for alerts

### Security Considerations

- All interactive elements are keyboard accessible
- No sensitive information in ARIA labels
- Proper focus management
- Skip links for keyboard users

## Monitoring and Alerts

### Log Monitoring

Monitor these log entries for security events:
- Failed login attempts
- Rate limit violations
- CSRF token failures
- Session timeouts
- Database errors

### Recommended Monitoring

1. **Failed Login Attempts**: Alert on multiple failures from same IP
2. **Rate Limit Violations**: Monitor for potential attacks
3. **CSRF Failures**: Investigate potential CSRF attacks
4. **Database Errors**: Monitor for potential injection attempts

## Best Practices

1. **Regular Updates**: Keep PHP, MySQL, and all dependencies updated
2. **Backup Strategy**: Regular database backups with encryption
3. **SSL/TLS**: Always use HTTPS in production
4. **Environment Variables**: Store sensitive configuration in environment variables
5. **Principle of Least Privilege**: Database user should have minimal required permissions
6. **Regular Security Audits**: Run security tests regularly
7. **Incident Response Plan**: Have a plan for security incidents

## Compliance

This implementation follows:
- OWASP Top 10 security guidelines
- WCAG 2.1 accessibility standards
- GDPR data protection requirements
- PCI DSS security standards (if applicable)

## Support

For security-related issues or questions:
1. Review this documentation
2. Run the test suite
3. Check the logs for detailed error information
4. Contact the development team

---

**Last Updated**: December 2024
**Version**: 1.0 