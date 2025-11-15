<?php
/**
 * QUICK DEBUG HELPER - FOR LIVE HOSTING TROUBLESHOOTING
 * 
 * ⚠️ SECURITY WARNING: DELETE THIS FILE AFTER DEBUGGING!
 * 
 * Usage: https://yourdomain.com/quick_debug.php?key=YOUR_SECRET_KEY
 * 
 * Set a strong password in the $debug_key variable below
 */

// ============================================
// CONFIGURATION - CHANGE THIS PASSWORD!
// ============================================
$debug_key = 'CHANGE_THIS_TO_RANDOM_STRING_12345'; // CHANGE THIS!

// Security check
if (!isset($_GET['key']) || $_GET['key'] !== $debug_key) {
    http_response_code(403);
    die('❌ Unauthorized. Invalid key.');
}

// Enable error display for this session only
error_reporting(E_ALL);
ini_set('display_errors', 1);

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔍 Quick Debug - Live Hosting</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #1a1a1a;
            color: #e0e0e0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: #2d2d2d;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        h1 {
            color: #4CAF50;
            margin-bottom: 20px;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 10px;
        }
        h2 {
            color: #2196F3;
            margin: 30px 0 15px 0;
            padding: 10px;
            background: #1e1e1e;
            border-left: 4px solid #2196F3;
        }
        .section {
            background: #1e1e1e;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border: 1px solid #444;
        }
        .success { color: #4CAF50; }
        .error { color: #f44336; }
        .warning { color: #ff9800; }
        .info { color: #2196F3; }
        pre {
            background: #0d0d0d;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border: 1px solid #444;
            font-size: 12px;
        }
        .status-ok { color: #4CAF50; font-weight: bold; }
        .status-fail { color: #f44336; font-weight: bold; }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
            margin: 15px 0;
        }
        .card {
            background: #252525;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #444;
        }
        .card-title {
            font-weight: bold;
            color: #2196F3;
            margin-bottom: 10px;
        }
        code {
            background: #0d0d0d;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        .warning-box {
            background: #ff9800;
            color: #000;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="warning-box">
            ⚠️ SECURITY WARNING: Delete this file after debugging! It exposes sensitive information.
        </div>
        
        <h1>🔍 Quick Debug - Live Hosting Diagnostic</h1>
        
        <?php
        // ============================================
        // 1. PHP INFORMATION
        // ============================================
        echo '<div class="section">';
        echo '<h2>📋 PHP Information</h2>';
        echo '<div class="grid">';
        echo '<div class="card"><div class="card-title">PHP Version</div><span class="status-ok">' . phpversion() . '</span></div>';
        echo '<div class="card"><div class="card-title">Server Software</div>' . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . '</div>';
        echo '<div class="card"><div class="card-title">Document Root</div><code>' . $_SERVER['DOCUMENT_ROOT'] . '</code></div>';
        echo '<div class="card"><div class="card-title">Script Path</div><code>' . __DIR__ . '</code></div>';
        echo '</div>';
        echo '</div>';
        
        // ============================================
        // 2. ENVIRONMENT CHECK
        // ============================================
        echo '<div class="section">';
        echo '<h2>🌍 Environment Configuration</h2>';
        
        $env_file = __DIR__ . '/.env';
        if (file_exists($env_file)) {
            echo '<p class="success">✅ .env file exists</p>';
            echo '<p><strong>File path:</strong> <code>' . $env_file . '</code></p>';
            echo '<p><strong>File readable:</strong> ' . (is_readable($env_file) ? '<span class="status-ok">Yes</span>' : '<span class="status-fail">No</span>') . '</p>';
            
            // Try to load environment
            if (file_exists(__DIR__ . '/classes/EnvironmentLoader.php')) {
                require_once __DIR__ . '/classes/EnvironmentLoader.php';
                EnvironmentLoader::load();
                
                echo '<h3 style="margin-top:15px; color:#ff9800;">Environment Variables (masked for security):</h3>';
                $env_vars = [
                    'DB_HOST' => getenv('DB_HOST'),
                    'DB_NAME' => getenv('DB_NAME'),
                    'DB_USER' => getenv('DB_USER'),
                    'DB_PASS' => getenv('DB_PASS') ? '***HIDDEN***' : null,
                    'APP_ENV' => getenv('APP_ENV'),
                    'APP_DEBUG' => getenv('APP_DEBUG'),
                    'APP_URL' => getenv('APP_URL'),
                ];
                echo '<pre>';
                foreach ($env_vars as $key => $value) {
                    echo "$key = " . ($value ?? '<span class="status-fail">NOT SET</span>') . "\n";
                }
                echo '</pre>';
            } else {
                echo '<p class="error">❌ EnvironmentLoader.php not found</p>';
            }
        } else {
            echo '<p class="error">❌ .env file NOT FOUND at: <code>' . $env_file . '</code></p>';
            echo '<p class="warning">⚠️ You need to create .env file from env.example</p>';
        }
        echo '</div>';
        
        // ============================================
        // 3. DATABASE CONNECTION
        // ============================================
        echo '<div class="section">';
        echo '<h2>🗄️ Database Connection</h2>';
        try {
            if (file_exists(__DIR__ . '/config/Database.php')) {
                require_once __DIR__ . '/config/Database.php';
                $db = (new Database())->getConnection();
                echo '<p class="success">✅ Database connection successful!</p>';
                
                // Test query
                $stmt = $db->query("SELECT COUNT(*) as count FROM users");
                $result = $stmt->fetch();
                echo '<p><strong>Users in database:</strong> ' . $result['count'] . '</p>';
                
                // Check tables
                $tables = ['users', 'classes', 'courses', 'lesson_materials', 'activity_attempts'];
                echo '<h3 style="margin-top:15px;">Database Tables:</h3>';
                echo '<pre>';
                foreach ($tables as $table) {
                    try {
                        $stmt = $db->query("SELECT COUNT(*) as count FROM $table");
                        $count = $stmt->fetch()['count'];
                        echo "✅ $table: $count records\n";
                    } catch (Exception $e) {
                        echo "❌ $table: " . $e->getMessage() . "\n";
                    }
                }
                echo '</pre>';
            } else {
                echo '<p class="error">❌ config/Database.php not found</p>';
            }
        } catch (Exception $e) {
            echo '<p class="error">❌ Database connection failed!</p>';
            echo '<pre>' . htmlspecialchars($e->getMessage()) . '</pre>';
            echo '<p class="warning">⚠️ Check your database credentials in .env file</p>';
        }
        echo '</div>';
        
        // ============================================
        // 4. DIRECTORY PERMISSIONS
        // ============================================
        echo '<div class="section">';
        echo '<h2>📁 Directory Permissions</h2>';
        $dirs = [
            'uploads' => 'User uploads',
            'uploads/materials' => 'PDF materials',
            'uploads/materials/pages' => 'Page content',
            'uploads/activity_submissions' => 'Activity files',
            'uploads/profile_photos' => 'Profile photos',
            'sessions' => 'Session files',
        ];
        
        echo '<pre>';
        foreach ($dirs as $dir => $description) {
            $path = __DIR__ . '/' . $dir;
            if (is_dir($path)) {
                $perms = substr(sprintf('%o', fileperms($path)), -4);
                $writable = is_writable($path);
                $status = $writable ? '✅' : '❌';
                echo "$status $dir ($description)\n";
                echo "   Path: $path\n";
                echo "   Permissions: $perms\n";
                echo "   Writable: " . ($writable ? 'Yes' : 'No') . "\n\n";
            } else {
                echo "❌ $dir ($description) - DOES NOT EXIST\n";
                echo "   Path: $path\n\n";
            }
        }
        echo '</pre>';
        echo '</div>';
        
        // ============================================
        // 5. SESSION CONFIGURATION
        // ============================================
        echo '<div class="section">';
        echo '<h2>🍪 Session Configuration</h2>';
        session_start();
        echo '<pre>';
        echo "Session ID: " . session_id() . "\n";
        echo "Session Name: " . session_name() . "\n";
        echo "Session Save Path: " . session_save_path() . "\n";
        echo "Session Status: " . (session_status() === PHP_SESSION_ACTIVE ? 'Active ✅' : 'Inactive ❌') . "\n";
        echo "Session Cookie Lifetime: " . ini_get('session.cookie_lifetime') . "\n";
        echo "Session GC Max Lifetime: " . ini_get('session.gc_maxlifetime') . "\n";
        echo '</pre>';
        echo '</div>';
        
        // ============================================
        // 6. PHP CONFIGURATION
        // ============================================
        echo '<div class="section">';
        echo '<h2>⚙️ PHP Configuration</h2>';
        echo '<pre>';
        echo "Upload Max Filesize: " . ini_get('upload_max_filesize') . "\n";
        echo "Post Max Size: " . ini_get('post_max_size') . "\n";
        echo "Max Execution Time: " . ini_get('max_execution_time') . " seconds\n";
        echo "Memory Limit: " . ini_get('memory_limit') . "\n";
        echo "Error Reporting: " . (error_reporting() ? 'Enabled' : 'Disabled') . "\n";
        echo "Display Errors: " . (ini_get('display_errors') ? 'On' : 'Off') . "\n";
        echo "Log Errors: " . (ini_get('log_errors') ? 'On' : 'Off') . "\n";
        if (ini_get('error_log')) {
            echo "Error Log: " . ini_get('error_log') . "\n";
        }
        echo '</pre>';
        echo '</div>';
        
        // ============================================
        // 7. FILE EXISTENCE CHECK
        // ============================================
        echo '<div class="section">';
        echo '<h2>📄 Critical Files Check</h2>';
        $critical_files = [
            'config.php',
            'config/Database.php',
            'classes/EnvironmentLoader.php',
            'classes/SecurityConfig.php',
            'classes/auth_helpers.php',
            'login.php',
            'material_download.php',
        ];
        
        echo '<pre>';
        foreach ($critical_files as $file) {
            $path = __DIR__ . '/' . $file;
            if (file_exists($path)) {
                echo "✅ $file\n";
            } else {
                echo "❌ $file - MISSING!\n";
            }
        }
        echo '</pre>';
        echo '</div>';
        
        // ============================================
        // 8. QUICK TESTS
        // ============================================
        echo '<div class="section">';
        echo '<h2>🧪 Quick Functionality Tests</h2>';
        echo '<pre>';
        
        // Test 1: Can write to uploads
        $test_file = __DIR__ . '/uploads/test_write.txt';
        if (is_writable(__DIR__ . '/uploads')) {
            @file_put_contents($test_file, 'test');
            if (file_exists($test_file)) {
                echo "✅ File upload test: Can write to uploads/\n";
                @unlink($test_file);
            } else {
                echo "❌ File upload test: Cannot write to uploads/\n";
            }
        } else {
            echo "❌ File upload test: uploads/ not writable\n";
        }
        
        // Test 2: Can write to sessions
        if (is_writable(__DIR__ . '/sessions')) {
            echo "✅ Session test: sessions/ directory is writable\n";
        } else {
            echo "❌ Session test: sessions/ directory NOT writable\n";
        }
        
        // Test 3: Check if .htaccess exists (for Apache)
        if (file_exists(__DIR__ . '/.htaccess')) {
            echo "✅ .htaccess file exists\n";
        } else {
            echo "⚠️ .htaccess file not found (may not be needed for Nginx)\n";
        }
        
        echo '</pre>';
        echo '</div>';
        
        // ============================================
        // 9. RECOMMENDATIONS
        // ============================================
        echo '<div class="section">';
        echo '<h2>💡 Recommendations</h2>';
        echo '<ul style="margin-left: 20px; color: #e0e0e0;">';
        
        if (!file_exists($env_file)) {
            echo '<li class="error">❌ Create .env file from env.example</li>';
        }
        
        if (!is_dir(__DIR__ . '/uploads')) {
            echo '<li class="error">❌ Create uploads/ directory</li>';
        }
        
        if (!is_dir(__DIR__ . '/sessions')) {
            echo '<li class="error">❌ Create sessions/ directory</li>';
        }
        
        if (getenv('APP_DEBUG') === 'true') {
            echo '<li class="warning">⚠️ APP_DEBUG is true - set to false for production</li>';
        }
        
        if (getenv('APP_ENV') !== 'production') {
            echo '<li class="warning">⚠️ APP_ENV is not set to "production"</li>';
        }
        
        if (ini_get('display_errors')) {
            echo '<li class="warning">⚠️ display_errors is ON - disable for production</li>';
        }
        
        echo '<li class="info">✅ Delete this file (quick_debug.php) after debugging!</li>';
        echo '</ul>';
        echo '</div>';
        ?>
        
        <div class="section" style="background: #f44336; color: white; text-align: center; font-weight: bold;">
            ⚠️ REMEMBER: DELETE THIS FILE AFTER DEBUGGING! ⚠️
        </div>
    </div>
</body>
</html>

