<?php
/**
 * Test JDoodle Connection
 * This script helps debug JDoodle API connection issues
 */

require_once __DIR__ . '/classes/EnvironmentLoader.php';

// Load environment variables
EnvironmentLoader::load();

// Get credentials from multiple sources
$clientId1 = getenv('JDOODLE_CLIENT_ID');
$clientSecret1 = getenv('JDOODLE_CLIENT_SECRET');

$clientId2 = EnvironmentLoader::get('JDOODLE_CLIENT_ID');
$clientSecret2 = EnvironmentLoader::get('JDOODLE_CLIENT_SECRET');

$clientId3 = $_SERVER['JDOODLE_CLIENT_ID'] ?? null;
$clientSecret3 = $_SERVER['JDOODLE_CLIENT_SECRET'] ?? null;

// Read from .htaccess directly
$htaccessPath = __DIR__ . '/.htaccess';
$htaccessClientId = null;
$htaccessClientSecret = null;
if (file_exists($htaccessPath)) {
    $htaccessContent = file_get_contents($htaccessPath);
    if (preg_match('/SetEnv\s+JDOODLE_CLIENT_ID\s+"([^"]*)"/', $htaccessContent, $matches)) {
        $htaccessClientId = $matches[1];
    }
    if (preg_match('/SetEnv\s+JDOODLE_CLIENT_SECRET\s+"([^"]*)"/', $htaccessContent, $matches)) {
        $htaccessClientSecret = $matches[1];
    }
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>JDoodle Connection Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 900px; margin: 20px auto; padding: 20px; }
        .section { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .info { color: #17a2b8; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #e9ecef; }
        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        .btn:hover { background: #0056b3; }
    </style>
</head>
<body>
    <h1>🔍 JDoodle Connection Test</h1>
    
    <div class="section">
        <h2>1. Credential Sources</h2>
        <table>
            <tr>
                <th>Source</th>
                <th>Client ID</th>
                <th>Client Secret</th>
                <th>Status</th>
            </tr>
            <tr>
                <td><code>getenv()</code></td>
                <td><?php echo $clientId1 ? substr($clientId1, 0, 20) . '...' : '<span class="error">Not found</span>'; ?></td>
                <td><?php echo $clientSecret1 ? substr($clientSecret1, 0, 20) . '...' : '<span class="error">Not found</span>'; ?></td>
                <td><?php echo ($clientId1 && $clientSecret1) ? '<span class="success">✓ Found</span>' : '<span class="error">✗ Missing</span>'; ?></td>
            </tr>
            <tr>
                <td><code>EnvironmentLoader</code></td>
                <td><?php echo $clientId2 ? substr($clientId2, 0, 20) . '...' : '<span class="error">Not found</span>'; ?></td>
                <td><?php echo $clientSecret2 ? substr($clientSecret2, 0, 20) . '...' : '<span class="error">Not found</span>'; ?></td>
                <td><?php echo ($clientId2 && $clientSecret2) ? '<span class="success">✓ Found</span>' : '<span class="error">✗ Missing</span>'; ?></td>
            </tr>
            <tr>
                <td><code>$_SERVER</code></td>
                <td><?php echo $clientId3 ? substr($clientId3, 0, 20) . '...' : '<span class="error">Not found</span>'; ?></td>
                <td><?php echo $clientSecret3 ? substr($clientSecret3, 0, 20) . '...' : '<span class="error">Not found</span>'; ?></td>
                <td><?php echo ($clientId3 && $clientSecret3) ? '<span class="success">✓ Found</span>' : '<span class="error">✗ Missing</span>'; ?></td>
            </tr>
            <tr>
                <td><code>.htaccess</code> (raw)</td>
                <td><?php echo $htaccessClientId ? substr($htaccessClientId, 0, 20) . '...' : '<span class="error">Not found</span>'; ?></td>
                <td><?php echo $htaccessClientSecret ? substr($htaccessClientSecret, 0, 20) . '...' : '<span class="error">Not found</span>'; ?></td>
                <td><?php echo ($htaccessClientId && $htaccessClientSecret) ? '<span class="success">✓ Found</span>' : '<span class="error">✗ Missing</span>'; ?></td>
            </tr>
        </table>
    </div>
    
    <div class="section">
        <h2>2. Active Credentials (Used by System)</h2>
        <?php
        // Use the same method as CourseService
        $activeClientId = getenv('JDOODLE_CLIENT_ID') ?: '';
        $activeClientSecret = getenv('JDOODLE_CLIENT_SECRET') ?: '';
        
        if (empty($activeClientId) || empty($activeClientSecret)) {
            echo '<p class="error"><strong>❌ ERROR:</strong> Credentials not found! The system cannot read JDoodle credentials.</p>';
            echo '<p><strong>Possible causes:</strong></p>';
            echo '<ul>';
            echo '<li>Apache/XAMPP not restarted after updating .htaccess</li>';
            echo '<li>Credentials not set in .htaccess file</li>';
            echo '<li>Apache mod_env not enabled</li>';
            echo '</ul>';
        } else {
            echo '<p class="success"><strong>✓ Credentials found:</strong></p>';
            echo '<pre>Client ID: ' . htmlspecialchars($activeClientId) . "\n";
            echo 'Client Secret: ' . htmlspecialchars(substr($activeClientSecret, 0, 30)) . '...' . '</pre>';
        }
        ?>
    </div>
    
    <div class="section">
        <h2>3. API Connection Test</h2>
        <?php
        if (empty($activeClientId) || empty($activeClientSecret)) {
            echo '<p class="error">Cannot test API connection - credentials not available.</p>';
        } else {
            echo '<p>Testing connection to JDoodle API...</p>';
            
            $payload = [
                'clientId' => $activeClientId,
                'clientSecret' => $activeClientSecret,
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
            $curlError = curl_error($ch);
            curl_close($ch);
            
            echo '<h3>Request Details:</h3>';
            echo '<pre>' . htmlspecialchars(json_encode($payload, JSON_PRETTY_PRINT)) . '</pre>';
            
            echo '<h3>Response:</h3>';
            if ($curlError) {
                echo '<p class="error"><strong>❌ cURL Error:</strong> ' . htmlspecialchars($curlError) . '</p>';
            } else {
                echo '<p><strong>HTTP Status:</strong> ' . $httpCode . '</p>';
                echo '<pre>' . htmlspecialchars($response) . '</pre>';
                
                $data = json_decode($response, true);
                if ($data) {
                    if (isset($data['output']) && $data['output'] === 'Hello World') {
                        echo '<p class="success"><strong>✅ SUCCESS!</strong> JDoodle API is working correctly.</p>';
                    } elseif (isset($data['error'])) {
                        echo '<p class="error"><strong>❌ API Error:</strong> ' . htmlspecialchars($data['error']) . '</p>';
                        if (strpos($data['error'], 'Invalid') !== false || strpos($data['error'], 'credentials') !== false) {
                            echo '<p class="warning"><strong>⚠️ This usually means:</strong></p>';
                            echo '<ul>';
                            echo '<li>Client ID or Client Secret is incorrect</li>';
                            echo '<li>Credentials have expired (JDoodle free tier has limits)</li>';
                            echo '<li>Credentials were revoked or changed</li>';
                            echo '</ul>';
                        }
                    } else {
                        echo '<p class="warning"><strong>⚠️ Unexpected response format</strong></p>';
                    }
                } else {
                    echo '<p class="error"><strong>❌ Failed to parse JSON response</strong></p>';
                }
            }
        }
        ?>
    </div>
    
    <div class="section">
        <h2>4. Recommendations</h2>
        <ol>
            <li><strong>If credentials not found:</strong>
                <ul>
                    <li>Check if `.htaccess` file exists and has correct format</li>
                    <li>Restart Apache/XAMPP</li>
                    <li>Verify Apache `mod_env` is enabled</li>
                </ul>
            </li>
            <li><strong>If API test fails:</strong>
                <ul>
                    <li>Verify credentials in JDoodle dashboard: <a href="https://www.jdoodle.com/api-compiler" target="_blank">https://www.jdoodle.com/api-compiler</a></li>
                    <li>Check if credentials have expired (free tier has daily limits)</li>
                    <li>Generate new credentials if needed</li>
                </ul>
            </li>
            <li><strong>To update credentials:</strong>
                <ul>
                    <li>Use: <a href="update_jdoodle_credentials.php">update_jdoodle_credentials.php</a></li>
                    <li>Or manually edit `.htaccess` file</li>
                    <li><strong>Always restart Apache after updating!</strong></li>
                </ul>
            </li>
        </ol>
    </div>
    
    <div style="margin-top: 20px; text-align: center;">
        <a href="update_jdoodle_credentials.php" class="btn">Update Credentials</a>
        <button class="btn" onclick="location.reload()">Refresh Test</button>
    </div>
</body>
</html>

