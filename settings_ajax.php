<?php
require_once __DIR__ . '/classes/auth_helpers.php';
require_once __DIR__ . '/classes/EnvironmentLoader.php';

// Admin-only access
Auth::requireAuth();
Auth::requireRole('admin');

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];
    
    try {
        switch ($action) {
            case 'test_smtp':
                $result = testSMTPConnection();
                break;
                
            case 'test_jdoodle':
                $result = testJDoodleConnection();
                break;
                
            case 'get_config':
                $result = getCurrentConfig();
                break;
                
            default:
                throw new Exception('Invalid action');
        }
        
        echo json_encode($result);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request'
    ]);
}

function testSMTPConnection() {
    EnvironmentLoader::load();
    
    $host = EnvironmentLoader::get('SMTP_HOST', 'smtp.gmail.com');
    $port = EnvironmentLoader::get('SMTP_PORT', 587);
    $username = EnvironmentLoader::get('SMTP_USERNAME');
    $password = EnvironmentLoader::get('SMTP_PASSWORD');
    $encryption = EnvironmentLoader::get('SMTP_ENCRYPTION', 'tls');
    
    // Debug: Log what we're getting (but don't log password)
    error_log("SMTP Test - Host: {$host}, Port: {$port}, Username: {$username}, Encryption: {$encryption}, Password length: " . strlen($password ?? ''));
    
    if (empty($username) || empty($password)) {
        return [
            'success' => false,
            'message' => 'SMTP credentials not configured. Please check your .env file.',
            'debug' => [
                'username_empty' => empty($username),
                'password_empty' => empty($password),
                'host' => $host,
                'port' => $port
            ]
        ];
    }
    
    try {
        require_once __DIR__ . '/PHPMailer/src/Exception.php';
        require_once __DIR__ . '/PHPMailer/src/PHPMailer.php';
        require_once __DIR__ . '/PHPMailer/src/SMTP.php';
        
        $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
        
        // Enable verbose debugging
        $mail->SMTPDebug = 0; // 0 = off, 1 = client messages, 2 = client and server messages
        $mail->Debugoutput = function($str, $level) {
            error_log("PHPMailer Debug: " . $str);
        };
        
        $mail->isSMTP();
        $mail->Host = $host;
        $mail->SMTPAuth = true;
        $mail->Username = $username;
        
        // CRITICAL: Remove any spaces from App Password (Gmail App Passwords sometimes have spaces)
        $password = trim($password);
        $password = str_replace(' ', '', $password); // Remove spaces from App Password
        $mail->Password = $password;
        
        $mail->SMTPSecure = $encryption;
        $mail->Port = $port;
        $mail->Timeout = 15; // Increase timeout to 15 seconds
        $mail->SMTPOptions = [
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ];
        
        // Test connection without sending
        $mail->smtpConnect();
        $mail->smtpClose();
        
        return [
            'success' => true,
            'message' => 'SMTP connection successful',
            'details' => [
                'host' => $host,
                'port' => $port,
                'encryption' => $encryption,
                'username' => $username
            ]
        ];
        
    } catch (\PHPMailer\PHPMailer\Exception $e) {
        $errorMessage = $e->getMessage();
        error_log("PHPMailer Exception: " . $errorMessage);
        error_log("PHPMailer Error Info: " . $e->getErrorInfo());
        
        // Provide more helpful error messages
        if (strpos($errorMessage, 'Authentication failed') !== false || strpos($errorMessage, '535') !== false) {
            return [
                'success' => false,
                'message' => 'Authentication failed. Please check: 1) Your email and App Password are correct, 2) 2-Step Verification is enabled, 3) App Password was generated correctly.',
                'error' => $errorMessage
            ];
        } elseif (strpos($errorMessage, 'Connection refused') !== false || strpos($errorMessage, 'Could not connect') !== false) {
            return [
                'success' => false,
                'message' => 'Cannot connect to SMTP server. Check: 1) SMTP_HOST is correct, 2) SMTP_PORT is correct, 3) Firewall is not blocking the connection.',
                'error' => $errorMessage
            ];
        } elseif (strpos($errorMessage, 'timeout') !== false) {
            return [
                'success' => false,
                'message' => 'Connection timeout. The SMTP server may be unreachable or blocked.',
                'error' => $errorMessage
            ];
        }
        
        return [
            'success' => false,
            'message' => 'SMTP connection failed: ' . $errorMessage,
            'error' => $errorMessage
        ];
    } catch (Exception $e) {
        error_log("General Exception in SMTP test: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'SMTP connection failed: ' . $e->getMessage(),
            'error' => $e->getMessage()
        ];
    }
}

function testJDoodleConnection() {
    EnvironmentLoader::load();
    
    $clientId = EnvironmentLoader::get('JDOODLE_CLIENT_ID');
    $clientSecret = EnvironmentLoader::get('JDOODLE_CLIENT_SECRET');
    
    if (empty($clientId) || empty($clientSecret)) {
        return [
            'success' => false,
            'message' => 'JDoodle API credentials not configured'
        ];
    }
    
    try {
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
            throw new Exception('cURL error: ' . $error);
        }
        
        if ($httpCode !== 200) {
            throw new Exception('HTTP ' . $httpCode . ': ' . $response);
        }
        
        $data = json_decode($response, true);
        
        if (isset($data['output']) && $data['output'] === 'Hello World') {
            return [
                'success' => true,
                'message' => 'JDoodle API connection successful',
                'details' => [
                    'clientId' => $clientId,
                    'test_output' => $data['output']
                ]
            ];
        } else {
            throw new Exception('Unexpected response: ' . json_encode($data));
        }
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'JDoodle connection failed: ' . $e->getMessage()
        ];
    }
}

function getCurrentConfig() {
    EnvironmentLoader::load();
    
    return [
        'success' => true,
        'config' => [
            'smtp' => [
                'host' => EnvironmentLoader::get('SMTP_HOST', 'smtp.gmail.com'),
                'port' => EnvironmentLoader::get('SMTP_PORT', 587),
                'username' => EnvironmentLoader::get('SMTP_USERNAME', ''),
                'encryption' => EnvironmentLoader::get('SMTP_ENCRYPTION', 'tls'),
                'from_name' => EnvironmentLoader::get('SMTP_FROM_NAME', 'Code Regal')
            ],
            'jdoodle' => [
                'clientId' => EnvironmentLoader::get('JDOODLE_CLIENT_ID', '') ? '***configured***' : '',
                'clientSecret' => EnvironmentLoader::get('JDOODLE_CLIENT_SECRET', '') ? '***configured***' : ''
            ],
            'database' => [
                'host' => EnvironmentLoader::get('DB_HOST', 'localhost'),
                'name' => EnvironmentLoader::get('DB_NAME', ''),
                'status' => 'connected' // We're here, so DB is working
            ]
        ]
    ];
}
?>






