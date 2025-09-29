<?php
// Google OAuth Configuration
// Load environment variables securely
require_once __DIR__ . '/../classes/SecurityConfig.php';

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
define('GOOGLE_SCOPES', 'email profile');

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
    curl_close($ch);
    
    return json_decode($response, true);
}

// Function to get user info from Google
function getGoogleUserInfo($access_token) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, GOOGLE_USERINFO_URL . '?access_token=' . $access_token);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $access_token
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}
?> 