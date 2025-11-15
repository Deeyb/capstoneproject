# 🚀 LIVE HOSTING DEPLOYMENT CHECKLIST

## 📋 PRE-DEPLOYMENT PREPARATION

### ✅ 1. Code Review
- [ ] All test/debug files removed (already done ✅)
- [ ] No hardcoded localhost URLs in code
- [ ] All console.log() statements reviewed (keep only essential ones)
- [ ] Error reporting set to production mode

### ✅ 2. Database Backup
- [ ] Export current database: `coderegal_db.sql`
- [ ] Test database import on local environment
- [ ] Verify all tables exist and have correct structure

### ✅ 3. File Permissions Check
- [ ] Review `.gitignore` to ensure sensitive files are excluded
- [ ] Verify `env.example` has all required variables
- [ ] Check that `config.php` and `config/Database.php` are in `.gitignore`

### ✅ 4. Environment Variables List
Prepare these values for live hosting:
- [ ] Database host, user, password, name
- [ ] Google OAuth Client ID & Secret (for live domain)
- [ ] SMTP credentials (email service)
- [ ] JDoodle API credentials
- [ ] Live domain URL

---

## 🔧 DEPLOYMENT STEPS

### Step 1: Upload Files to Server
```bash
# Via FTP/SFTP or Git
# Upload all files EXCEPT:
# - .env (create manually)
# - uploads/ (create manually)
# - sessions/ (create manually)
# - config.php (if contains sensitive data)
```

### Step 2: Create Required Directories
```bash
# On live server, create these directories:
mkdir -p uploads/materials/pages
mkdir -p uploads/activity_submissions
mkdir -p uploads/profile_photos
mkdir -p sessions

# Set permissions (Linux/Unix):
chmod 755 uploads sessions
chmod 777 uploads/materials uploads/activity_submissions uploads/profile_photos sessions
```

### Step 3: Create .env File
```bash
# On live server:
cp env.example .env
# Then edit .env with your live hosting credentials
```

**Required .env Variables:**
```env
# Database (LIVE HOSTING VALUES)
DB_HOST=your_live_db_host
DB_USER=your_live_db_user
DB_PASS=your_live_db_password
DB_NAME=your_live_db_name

# Application (LIVE DOMAIN)
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Google OAuth (UPDATE WITH LIVE DOMAIN)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/google_callback.php

# SMTP (LIVE EMAIL SERVICE)
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_ENCRYPTION=tls
SMTP_USERNAME=your_email@domain.com
SMTP_PASSWORD=your_email_password
SMTP_FROM_NAME=Code Regal

# JDoodle API
JDOODLE_CLIENT_ID=your_jdoodle_client_id
JDOODLE_CLIENT_SECRET=your_jdoodle_client_secret

# Security (GENERATE NEW RANDOM VALUES)
SESSION_SECRET=generate_random_string_here
CSRF_SECRET=generate_random_string_here
```

### Step 4: Create config.php (if needed)
```php
<?php
// Set timezone
date_default_timezone_set('Asia/Manila');

// Initialize security configuration
require_once __DIR__ . '/classes/SecurityConfig.php';
SecurityConfig::initialize();

// Database configuration (loaded from .env)
$db_host = SecurityConfig::get('DB_HOST', 'localhost');
$db_user = SecurityConfig::get('DB_USER', 'root');
$db_pass = SecurityConfig::get('DB_PASS', '');
$db_name = SecurityConfig::get('DB_NAME', 'coderegal_db');

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset
$conn->set_charset("utf8mb4");
?>
```

### Step 5: Create config/Database.php (if needed)
```php
<?php
require_once __DIR__ . '/../classes/EnvironmentLoader.php';
EnvironmentLoader::load();

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;

    public function __construct() {
        $this->host = getenv('DB_HOST') ?: 'localhost';
        $this->db_name = getenv('DB_NAME') ?: 'coderegal_db';
        $this->username = getenv('DB_USER') ?: 'root';
        $this->password = getenv('DB_PASS') ?: '';
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch(PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            throw $e;
        }
        return $this->conn;
    }
}
?>
```

### Step 6: Import Database
```bash
# Via phpMyAdmin or command line:
mysql -u your_db_user -p your_db_name < coderegal_db.sql

# Or via phpMyAdmin:
# 1. Select database
# 2. Go to Import tab
# 3. Choose coderegal_db.sql file
# 4. Click Go
```

### Step 7: Update Google OAuth Settings
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Update authorized redirect URI to: `https://yourdomain.com/google_callback.php`
3. Update authorized JavaScript origins to: `https://yourdomain.com`

### Step 8: Test Database Connection
Create a test file `test_db.php` (DELETE AFTER TESTING):
```php
<?php
require_once __DIR__ . '/config/Database.php';
try {
    $db = (new Database())->getConnection();
    echo "✅ Database connection successful!";
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage();
}
?>
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

### 1. Basic Functionality
- [ ] Homepage loads
- [ ] Login page works
- [ ] Registration works
- [ ] Can login as Admin/Coordinator/Teacher/Student

### 2. File Uploads
- [ ] Can upload profile photos
- [ ] Can upload PDF materials
- [ ] Can upload activity files
- [ ] Files are saved in correct directories

### 3. Database Operations
- [ ] Can create courses
- [ ] Can create classes
- [ ] Can enroll students
- [ ] Can submit activities

### 4. Email Functionality
- [ ] Password reset emails work
- [ ] Verification emails work (if enabled)
- [ ] SMTP connection successful

### 5. External Services
- [ ] Google OAuth login works
- [ ] JDoodle API works (coding activities)

### 6. Security
- [ ] HTTPS enabled
- [ ] Session cookies work
- [ ] CSRF protection active
- [ ] File permissions correct

---

## 🐛 DEBUGGING TIPS FOR LIVE HOSTING

### 1. Enable Error Logging (NOT Display)
**In `.env`:**
```env
APP_ENV=production
APP_DEBUG=false  # NEVER set to true on live!
```

**In `classes/SecurityConfig.php` (already configured):**
- Production mode: Errors logged to file, not displayed
- Development mode: Errors displayed on screen

### 2. Check Error Logs
**PHP Error Log Location:**
```bash
# Common locations:
/var/log/apache2/error.log
/var/log/nginx/error.log
/home/username/logs/error.log
# Or check your hosting control panel
```

**Application Error Log:**
- Check `error_log()` entries in PHP
- Look for custom log files in project root

### 3. Create Debug Endpoint (FOR TESTING ONLY)
Create `debug_info.php` (DELETE AFTER DEBUGGING):
```php
<?php
// SECURITY: Add password protection!
$debug_password = 'your_secret_password_here';
if (!isset($_GET['key']) || $_GET['key'] !== $debug_password) {
    die('Unauthorized');
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>🔍 Debug Information</h2>";

// PHP Info
echo "<h3>PHP Version:</h3>";
echo phpversion();

// Environment
echo "<h3>Environment Variables:</h3>";
echo "<pre>";
print_r([
    'DB_HOST' => getenv('DB_HOST'),
    'DB_NAME' => getenv('DB_NAME'),
    'DB_USER' => getenv('DB_USER'),
    'APP_ENV' => getenv('APP_ENV'),
    'APP_DEBUG' => getenv('APP_DEBUG'),
    'APP_URL' => getenv('APP_URL'),
]);
echo "</pre>";

// Database Connection
echo "<h3>Database Connection:</h3>";
try {
    require_once __DIR__ . '/config/Database.php';
    $db = (new Database())->getConnection();
    echo "✅ Database connected successfully<br>";
    
    // Test query
    $stmt = $db->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "Users in database: " . $result['count'];
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage();
}

// File Permissions
echo "<h3>Directory Permissions:</h3>";
$dirs = ['uploads', 'sessions', 'uploads/materials', 'uploads/profile_photos'];
foreach ($dirs as $dir) {
    $path = __DIR__ . '/' . $dir;
    if (is_dir($path)) {
        $perms = substr(sprintf('%o', fileperms($path)), -4);
        $writable = is_writable($path) ? '✅ Writable' : '❌ Not Writable';
        echo "$dir: $perms - $writable<br>";
    } else {
        echo "$dir: ❌ Does not exist<br>";
    }
}

// Session Info
echo "<h3>Session Info:</h3>";
session_start();
echo "Session ID: " . session_id() . "<br>";
echo "Session Path: " . session_save_path() . "<br>";
echo "Session Status: " . (session_status() === PHP_SESSION_ACTIVE ? 'Active' : 'Inactive');
?>
```

**Usage:** `https://yourdomain.com/debug_info.php?key=your_secret_password_here`

### 4. Enable Detailed Logging
**Add to top of problematic PHP files (temporarily):**
```php
// TEMPORARY DEBUG - REMOVE AFTER FIXING
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't show on screen
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/debug.log');
```

### 5. Check Browser Console
- Open browser DevTools (F12)
- Check Console tab for JavaScript errors
- Check Network tab for failed requests
- Check if files are loading (404 errors)

### 6. Common Issues & Quick Fixes

**Issue: White screen / 500 error**
- Check PHP error log
- Verify `.env` file exists and is readable
- Check file permissions
- Verify database connection

**Issue: Database connection failed**
- Verify database credentials in `.env`
- Check if database exists
- Verify database user has proper permissions
- Check if database host is correct

**Issue: File uploads not working**
- Check directory permissions (must be 777 or 755)
- Verify `uploads/` directory exists
- Check PHP `upload_max_filesize` and `post_max_size`
- Check disk space on server

**Issue: Session not working**
- Check `sessions/` directory exists and is writable
- Verify session path in PHP config
- Check if cookies are being set
- Verify domain in session cookie settings

**Issue: 404 errors for assets**
- Check `.htaccess` file (if using Apache)
- Verify file paths are correct
- Check if mod_rewrite is enabled
- Verify base URL in `APP_URL`

**Issue: CORS errors**
- Check if domain matches in Google OAuth settings
- Verify `APP_URL` in `.env` matches actual domain
- Check Content-Security-Policy headers

### 7. Quick Debug Checklist
When something breaks:
1. ✅ Check browser console (F12) for JavaScript errors
2. ✅ Check PHP error log for server errors
3. ✅ Verify `.env` file exists and has correct values
4. ✅ Test database connection
5. ✅ Check file permissions
6. ✅ Verify all directories exist
7. ✅ Check if session is working
8. ✅ Test with `debug_info.php` (if created)

---

## 🔒 SECURITY CHECKLIST

### Before Going Live:
- [ ] `APP_DEBUG=false` in `.env`
- [ ] `APP_ENV=production` in `.env`
- [ ] All test/debug files removed
- [ ] `.env` file NOT in Git (check `.gitignore`)
- [ ] `config.php` and `config/Database.php` NOT in Git (if they contain sensitive data)
- [ ] HTTPS enabled
- [ ] Strong database passwords
- [ ] Session security configured
- [ ] CSRF protection enabled
- [ ] File upload restrictions in place
- [ ] Error messages don't expose sensitive info

### After Going Live:
- [ ] Delete `test_db.php` if created
- [ ] Delete `debug_info.php` if created
- [ ] Remove any temporary debug code
- [ ] Change default admin passwords
- [ ] Enable firewall rules
- [ ] Set up regular backups
- [ ] Monitor error logs regularly

---

## 📝 QUICK REFERENCE

### Essential Files to Create Manually:
1. `.env` (from `env.example`)
2. `config.php` (if not using .env for all config)
3. `config/Database.php` (if not using .env)
4. Directories: `uploads/`, `sessions/`, etc.

### Essential Files Already in Git:
- ✅ All PHP application files
- ✅ All JavaScript/CSS files
- ✅ `env.example` (template)
- ✅ Database schema (`coderegal_db.sql`)
- ✅ `.gitignore` (protects sensitive files)

### Files NEVER in Git (Protected by .gitignore):
- ❌ `.env` (sensitive credentials)
- ❌ `uploads/` (user files)
- ❌ `sessions/` (session data)
- ❌ `config.php` (if sensitive)
- ❌ `*.log` (log files)
- ❌ `backup_*.sql` (database backups)

---

## 🆘 EMERGENCY ROLLBACK

If something goes wrong:
1. **Revert code:** `git checkout previous-commit-hash`
2. **Restore database:** Import previous backup
3. **Check error logs:** Identify the issue
4. **Fix and redeploy:** Make corrections and redeploy

---

## 📞 SUPPORT CONTACTS

- **Hosting Support:** [Your hosting provider]
- **Database Issues:** Check hosting control panel
- **Domain Issues:** Check domain registrar

---

**Last Updated:** 2025-11-15
**Version:** 1.0

