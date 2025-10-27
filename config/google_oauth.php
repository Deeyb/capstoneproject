<?php
// Google OAuth Configuration
// Load environment variables securely
require_once __DIR__ . '/../classes/SecurityConfig.php';

// Initialize SecurityConfig first
SecurityConfig::initialize();

// Validate Google OAuth configuration
try {
    SecurityConfig::validateGoogleOAuth();
} catch (Exception $e) {
    error_log("Google OAuth Configuration Error: " . $e->getMessage());
    die("Google OAuth configuration is incomplete. Please check your .env file.");
}

// Google OAuth Client ID (loaded from environment)
define('GOOGLE_CLIENT_ID', SecurityConfig::get('GOOGLE_CLIENT_ID'));

// Google OAuth Client Secret (loaded from environment)
define('GOOGLE_CLIENT_SECRET', SecurityConfig::get('GOOGLE_CLIENT_SECRET'));

// Redirect URI (loaded from environment)
define('GOOGLE_REDIRECT_URI', SecurityConfig::get('GOOGLE_REDIRECT_URI'));

// Google OAuth endpoints
define('GOOGLE_AUTH_URL', 'https://accounts.google.com/o/oauth2/v2/auth');
define('GOOGLE_TOKEN_URL', 'https://oauth2.googleapis.com/token');
define('GOOGLE_USERINFO_URL', 'https://www.googleapis.com/oauth2/v2/userinfo');

// Scopes we want to access
define('GOOGLE_SCOPES', 'openid email profile');

// Function to generate Google OAuth URL
function getGoogleAuthUrl() {
    $params = [
        'client_id' => GOOGLE_CLIENT_ID,
        'redirect_uri' => GOOGLE_REDIRECT_URI,
        'scope' => GOOGLE_SCOPES,
        'response_type' => 'code',
        'access_type' => 'offline',
        'prompt' => 'consent'
    ];
    
    return GOOGLE_AUTH_URL . '?' . http_build_query($params);
}

// Function to exchange authorization code for access token
function getGoogleAccessToken($code) {
    $data = [
        'client_id' => GOOGLE_CLIENT_ID,
        'client_secret' => GOOGLE_CLIENT_SECRET,
        'code' => $code,
        'grant_type' => 'authorization_code',
        'redirect_uri' => GOOGLE_REDIRECT_URI
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, GOOGLE_TOKEN_URL);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/x-www-form-urlencoded'
    ]);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);
    
    // Log for debugging
    error_log("Google Token Exchange - HTTP Code: $http_code, Response: $response");
    if ($curl_error) {
        error_log("Google Token Exchange cURL Error: $curl_error");
    }
    
    if ($http_code !== 200) {
        throw new Exception("Google token exchange returned HTTP $http_code: $response");
    }
    
    $token_data = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Failed to parse Google token response: " . json_last_error_msg());
    }
    
    return $token_data;
}

// Function to get user info from Google
function getGoogleUserInfo($access_token) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, GOOGLE_USERINFO_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $access_token
    ]);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);
    
    // Log for debugging
    error_log("Google UserInfo Response - HTTP Code: $http_code, Response: $response");
    if ($curl_error) {
        error_log("Google UserInfo cURL Error: $curl_error");
    }
    
    if ($http_code !== 200) {
        throw new Exception("Google API returned HTTP $http_code: $response");
    }
    
    $user_info = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Failed to parse Google API response: " . json_last_error_msg());
    }
    
    return $user_info;
}
?> 