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
    
    if (empty($username) || empty($password)) {
        return [
            'success' => false,
            'message' => 'SMTP credentials not configured'
        ];
    }
    
    try {
        require_once __DIR__ . '/PHPMailer/src/Exception.php';
        require_once __DIR__ . '/PHPMailer/src/PHPMailer.php';
        require_once __DIR__ . '/PHPMailer/src/SMTP.php';
        
        $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = $host;
        $mail->SMTPAuth = true;
        $mail->Username = $username;
        $mail->Password = $password;
        $mail->SMTPSecure = $encryption;
        $mail->Port = $port;
        $mail->Timeout = 10; // 10 second timeout
        
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
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'SMTP connection failed: ' . $e->getMessage()
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






