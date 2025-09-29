# 🔒 Security Setup Guide for CodeRegal LMS

## Overview
This guide will help you secure your Google OAuth and database credentials by using environment variables instead of hardcoded values.

## 🚨 CRITICAL: Secure Your Credentials

### Step 1: Create Your .env File

1. **Copy the example file:**
   ```bash
   cp env.example .env
   ```

2. **Edit the .env file** with your actual credentials:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_actual_db_user
   DB_PASS=your_actual_db_password
   DB_NAME=coderegal_db

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=1041166401684-ge9aca3l80qffvsgh7dv6pp9dl7prm4h.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=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
   GOOGLE_REDIRECT_URI=http://localhost/capstoneproject/google_callback.php

   # Application Configuration
   APP_ENV=development
   APP_DEBUG=true
   APP_URL=http://localhost/capstoneproject

   # Security Configuration
   SESSION_SECRET=your_random_session_secret_here
   CSRF_SECRET=your_random_csrf_secret_here
   ```

### Step 2: Generate Secure Secrets

**Generate random secrets for security:**
```bash
# For SESSION_SECRET (32 characters)
openssl rand -hex 16

# For CSRF_SECRET (32 characters)
openssl rand -hex 16
```

**Or use PHP to generate:**
```php
<?php
echo bin2hex(random_bytes(16)); // 32 character hex string
?>
```

### Step 3: Update Google Cloud Console

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Update OAuth 2.0 Client:**
   - Go to "APIs & Services" > "Credentials"
   - Edit your OAuth 2.0 Client ID
   - Update the redirect URI to match your .env file
   - Save changes

3. **Verify Scopes:**
   - Ensure you have the required scopes: `email profile`

## 🔐 Security Features Implemented

### 1. Environment Variable Protection
- ✅ Credentials moved from code to .env file
- ✅ .env file added to .gitignore (won't be committed)
- ✅ Automatic validation of required variables

### 2. Enhanced Security Headers
- ✅ X-Frame-Options: DENY (prevents clickjacking)
- ✅ X-Content-Type-Options: nosniff (prevents MIME sniffing)
- ✅ X-XSS-Protection: 1; mode=block (XSS protection)
- ✅ Content Security Policy (CSP) headers
- ✅ Referrer Policy: strict-origin-when-cross-origin

### 3. Secure Session Configuration
- ✅ HTTP-only cookies
- ✅ Secure cookies (when using HTTPS)
- ✅ SameSite=Strict
- ✅ Session regeneration every 5 minutes
- ✅ Strict session mode

### 4. Error Handling
- ✅ Production: Hide errors, log them
- ✅ Development: Show errors for debugging
- ✅ Generic error messages to users
- ✅ Detailed logging for administrators

## 🛡️ Additional Security Recommendations

### 1. HTTPS in Production
```apache
# .htaccess file for Apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 2. Database Security
```sql
-- Create a dedicated database user (not root)
CREATE USER 'coderegal_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON coderegal_db.* TO 'coderegal_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. File Permissions
```bash
# Set proper file permissions
chmod 644 .env
chmod 755 classes/
chmod 644 *.php
```

### 4. Regular Security Updates
- Keep PHP updated
- Keep dependencies updated
- Monitor security advisories
- Regular security audits

## 🚨 Security Checklist

Before going live, ensure:

- [ ] .env file is created with real credentials
- [ ] .env file is NOT committed to git
- [ ] Google OAuth redirect URI is correct
- [ ] Database user has minimal required permissions
- [ ] HTTPS is enabled in production
- [ ] Error reporting is disabled in production
- [ ] File permissions are set correctly
- [ ] Regular backups are configured
- [ ] Security headers are working
- [ ] Session security is enabled

## 🔍 Testing Security

### Test Environment Variables
```php
<?php
// Add this temporarily to test
require_once 'classes/SecurityConfig.php';
SecurityConfig::initialize();

echo "Google Client ID: " . (SecurityConfig::has('GOOGLE_CLIENT_ID') ? 'SET' : 'MISSING') . "\n";
echo "Google Client Secret: " . (SecurityConfig::has('GOOGLE_CLIENT_SECRET') ? 'SET' : 'MISSING') . "\n";
echo "Database Host: " . SecurityConfig::get('DB_HOST', 'NOT SET') . "\n";
?>
```

### Test Security Headers
```bash
# Check if security headers are set
curl -I http://localhost/capstoneproject/login.php
```

## 🆘 Troubleshooting

### Common Issues:

1. **"Google OAuth configuration is incomplete"**
   - Check if .env file exists
   - Verify all required variables are set
   - Check file permissions

2. **"Database connection failed"**
   - Verify database credentials in .env
   - Check if database server is running
   - Verify database user permissions

3. **"Session not working"**
   - Check if session directory is writable
   - Verify session configuration
   - Check for conflicting session settings

## 📞 Support

If you encounter issues:
1. Check the error logs
2. Verify all environment variables are set
3. Test with the provided debugging code
4. Ensure file permissions are correct

---

**Remember: Security is an ongoing process. Regularly review and update your security measures!** 