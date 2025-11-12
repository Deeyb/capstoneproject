<?php
/**
 * Helper script to update JDoodle credentials
 * This updates both .htaccess and .env file
 */

require_once __DIR__ . '/classes/EnvironmentLoader.php';

// Only allow admin access
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    die('Access denied. Admin only.');
}

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $clientId = trim($_POST['client_id'] ?? '');
    $clientSecret = trim($_POST['client_secret'] ?? '');
    
    if (empty($clientId) || empty($clientSecret)) {
        echo json_encode([
            'success' => false,
            'message' => 'Client ID and Client Secret are required'
        ]);
        exit;
    }
    
    $errors = [];
    $success = [];
    
    // 1. Update .htaccess file
    $htaccessPath = __DIR__ . '/.htaccess';
    if (file_exists($htaccessPath)) {
        $htaccessContent = file_get_contents($htaccessPath);
        
        // Update JDOODLE_CLIENT_ID
        $htaccessContent = preg_replace(
            '/SetEnv\s+JDOODLE_CLIENT_ID\s+"[^"]*"/',
            'SetEnv JDOODLE_CLIENT_ID "' . addslashes($clientId) . '"',
            $htaccessContent
        );
        
        // Update JDOODLE_CLIENT_SECRET
        $htaccessContent = preg_replace(
            '/SetEnv\s+JDOODLE_CLIENT_SECRET\s+"[^"]*"/',
            'SetEnv JDOODLE_CLIENT_SECRET "' . addslashes($clientSecret) . '"',
            $htaccessContent
        );
        
        if (file_put_contents($htaccessPath, $htaccessContent) !== false) {
            $success[] = 'Updated .htaccess file';
        } else {
            $errors[] = 'Failed to update .htaccess file';
        }
    } else {
        $errors[] = '.htaccess file not found';
    }
    
    // 2. Update .env file
    $envPath = __DIR__ . '/.env';
    $envContent = '';
    
    if (file_exists($envPath)) {
        $envContent = file_get_contents($envPath);
    }
    
    // Update or add JDOODLE_CLIENT_ID
    if (preg_match('/^JDOODLE_CLIENT_ID\s*=/m', $envContent)) {
        $envContent = preg_replace(
            '/^JDOODLE_CLIENT_ID\s*=.*$/m',
            'JDOODLE_CLIENT_ID="' . addslashes($clientId) . '"',
            $envContent
        );
    } else {
        $envContent .= "\nJDOODLE_CLIENT_ID=\"" . addslashes($clientId) . "\"";
    }
    
    // Update or add JDOODLE_CLIENT_SECRET
    if (preg_match('/^JDOODLE_CLIENT_SECRET\s*=/m', $envContent)) {
        $envContent = preg_replace(
            '/^JDOODLE_CLIENT_SECRET\s*=.*$/m',
            'JDOODLE_CLIENT_SECRET="' . addslashes($clientSecret) . '"',
            $envContent
        );
    } else {
        $envContent .= "\nJDOODLE_CLIENT_SECRET=\"" . addslashes($clientSecret) . "\"";
    }
    
    if (file_put_contents($envPath, $envContent) !== false) {
        $success[] = 'Updated .env file';
    } else {
        $errors[] = 'Failed to update .env file';
    }
    
    // 3. Test the connection
    $testResult = null;
    try {
        // Clear environment cache
        EnvironmentLoader::load();
        
        $testClientId = EnvironmentLoader::get('JDOODLE_CLIENT_ID');
        $testClientSecret = EnvironmentLoader::get('JDOODLE_CLIENT_SECRET');
        
        if ($testClientId === $clientId && $testClientSecret === $clientSecret) {
            // Test actual API call
            $payload = [
                'clientId' => $clientId,
                'clientSecret' => $clientSecret,
                'script' => 'print("Hello World")',
                'language' => 'python3',
                'versionIndex' => '0'
            ];
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, 'https://api.jdoodle.com/v1/execute');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);
            
            if ($error) {
                $testResult = ['success' => false, 'message' => 'cURL error: ' . $error];
            } elseif ($httpCode !== 200) {
                $testResult = ['success' => false, 'message' => 'HTTP ' . $httpCode . ': ' . substr($response, 0, 200)];
            } else {
                $data = json_decode($response, true);
                if (isset($data['output']) && $data['output'] === 'Hello World') {
                    $testResult = ['success' => true, 'message' => 'JDoodle API connection successful!'];
                } else {
                    $testResult = ['success' => false, 'message' => 'Unexpected response: ' . json_encode($data)];
                }
            }
        } else {
            $testResult = ['success' => false, 'message' => 'Credentials updated but not loaded correctly. Please restart Apache.'];
        }
    } catch (Exception $e) {
        $testResult = ['success' => false, 'message' => 'Test failed: ' . $e->getMessage()];
    }
    
    echo json_encode([
        'success' => empty($errors),
        'message' => empty($errors) ? 'Credentials updated successfully' : 'Some errors occurred',
        'details' => [
            'success' => $success,
            'errors' => $errors,
            'test' => $testResult
        ]
    ]);
    
} else {
    // Show form
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Update JDoodle Credentials</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .form-group { margin-bottom: 20px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input[type="text"] { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
            button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
            button:hover { background: #0056b3; }
            .message { padding: 15px; margin: 20px 0; border-radius: 4px; }
            .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
            .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
    </head>
    <body>
        <h1>Update JDoodle Credentials</h1>
        
        <div class="info">
            <strong>⚠️ Important:</strong> After updating credentials, you need to <strong>restart Apache</strong> for changes to take effect.
            <br><br>
            <strong>Steps:</strong>
            <ol>
                <li>Update credentials below</li>
                <li>Restart Apache/XAMPP</li>
                <li>Test the connection</li>
            </ol>
        </div>
        
        <form id="updateForm">
            <div class="form-group">
                <label for="client_id">JDoodle Client ID:</label>
                <input type="text" id="client_id" name="client_id" required 
                       value="<?php echo htmlspecialchars(EnvironmentLoader::get('JDOODLE_CLIENT_ID', '')); ?>">
            </div>
            
            <div class="form-group">
                <label for="client_secret">JDoodle Client Secret:</label>
                <input type="text" id="client_secret" name="client_secret" required 
                       value="<?php echo htmlspecialchars(EnvironmentLoader::get('JDOODLE_CLIENT_SECRET', '')); ?>">
            </div>
            
            <button type="submit">Update Credentials</button>
        </form>
        
        <div id="result"></div>
        
        <script>
            document.getElementById('updateForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const resultDiv = document.getElementById('result');
                resultDiv.innerHTML = '<p>Updating...</p>';
                
                try {
                    const response = await fetch('update_jdoodle_credentials.php', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const data = await response.json();
                    
                    let html = '<div class="' + (data.success ? 'success' : 'error') + '">';
                    html += '<strong>' + data.message + '</strong>';
                    
                    if (data.details) {
                        if (data.details.success && data.details.success.length > 0) {
                            html += '<ul><li>' + data.details.success.join('</li><li>') + '</li></ul>';
                        }
                        if (data.details.errors && data.details.errors.length > 0) {
                            html += '<ul><li>' + data.details.errors.join('</li><li>') + '</li></ul>';
                        }
                        if (data.details.test) {
                            html += '<p><strong>Test Result:</strong> ';
                            html += '<span class="' + (data.details.test.success ? 'success' : 'error') + '">';
                            html += data.details.test.message;
                            html += '</span></p>';
                        }
                    }
                    
                    html += '</div>';
                    
                    if (!data.success || (data.details && data.details.test && !data.details.test.success)) {
                        html += '<div class="info">';
                        html += '<strong>Next Steps:</strong>';
                        html += '<ol>';
                        html += '<li>Restart Apache/XAMPP</li>';
                        html += '<li>Verify credentials are correct in JDoodle dashboard</li>';
                        html += '<li>Check if credentials have expired (JDoodle free tier has limits)</li>';
                        html += '</ol>';
                        html += '</div>';
                    }
                    
                    resultDiv.innerHTML = html;
                } catch (error) {
                    resultDiv.innerHTML = '<div class="error"><strong>Error:</strong> ' + error.message + '</div>';
                }
            });
        </script>
    </body>
    </html>
    <?php
}
?>

