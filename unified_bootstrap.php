<?php
/**
 * UNIFIED BOOTSTRAP
 * Single entry point for the entire application
 * Include this file at the top of every PHP file
 */
require_once __DIR__ . '/classes/UnifiedInit.php';

// Initialize the unified system
UnifiedInit::init();

// Make unified systems globally available
$GLOBALS['auth'] = UnifiedInit::getAuth();
$GLOBALS['csrf'] = UnifiedInit::getCSRF();
$GLOBALS['errorHandler'] = UnifiedInit::getErrorHandler();
$GLOBALS['security'] = UnifiedInit::getSecurity();
$GLOBALS['api'] = UnifiedInit::getAPI();

// Global helper functions
function requireAuth($roles = null) {
    return UnifiedInit::requireAuth($roles);
}

function requireRole($role) {
    return UnifiedInit::requireRole($role);
}

function requirePermission($resource, $permission = 'read') {
    return UnifiedInit::requirePermission($resource, $permission);
}

function apiResponse($success, $data = [], $message = '') {
    return UnifiedInit::apiResponse($success, $data, $message);
}

function getCSRFToken() {
    return UnifiedInit::getCSRFToken();
}

function sanitize($input, $type = 'string') {
    return UnifiedInit::sanitize($input, $type);
}

function validate($input, $rules) {
    return UnifiedInit::validate($input, $rules);
}

// Global error handling
function handleError($errno, $errstr, $errfile, $errline) {
    return $GLOBALS['errorHandler']->logError($errstr, [
        'file' => $errfile,
        'line' => $errline,
        'errno' => $errno
    ]);
}

function handleException(Throwable $e) {
    return $GLOBALS['errorHandler']->handleException($e);
}

