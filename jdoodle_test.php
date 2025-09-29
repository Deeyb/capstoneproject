<?php
header('Content-Type: application/json');

// Test JDoodle API integration
$clientId = getenv('JDOODLE_CLIENT_ID');
$clientSecret = getenv('JDOODLE_CLIENT_SECRET');

if (empty($clientId) || empty($clientSecret)) {
    echo json_encode([
        'success' => false,
        'message' => 'JDoodle credentials not configured',
        'clientId' => $clientId ? 'set' : 'missing',
        'clientSecret' => $clientSecret ? 'set' : 'missing'
    ]);
    exit;
}

// Test Python code execution
$payload = [
    'clientId' => $clientId,
    'clientSecret' => $clientSecret,
    'script' => 'print("Hello from JDoodle!")',
    'language' => 'python3',
    'versionIndex' => '0'
];

$ch = curl_init('https://api.jdoodle.com/v1/execute');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo json_encode([
    'success' => $httpCode === 200,
    'httpCode' => $httpCode,
    'response' => json_decode($response, true),
    'error' => $error,
    'message' => $httpCode === 200 ? 'JDoodle API test successful!' : 'JDoodle API test failed'
], JSON_PRETTY_PRINT);
?>


