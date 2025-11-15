<?php
/**
 * Environment Loader Class
 * Securely loads environment variables from .env file
 */
class EnvironmentLoader {
    private static $loaded = false;
    private static $envFile = '.env';
    
    /**
     * Load environment variables from .env file
     */
    public static function load() {
        if (self::$loaded) return;

        $envPath = __DIR__ . '/../' . self::$envFile;
        
        // Check debug mode without calling self::get() to avoid circular dependency
        // Check $_ENV, $_SERVER, and getenv() directly
        $appDebug = $_ENV['APP_DEBUG'] ?? $_SERVER['APP_DEBUG'] ?? getenv('APP_DEBUG');
        $appEnv = $_ENV['APP_ENV'] ?? $_SERVER['APP_ENV'] ?? getenv('APP_ENV');
        $isDebug = ($appDebug === 'true') || ($appEnv === 'development');
        
        // Only log in debug mode (not in production)
        if ($isDebug) {
            error_log('ENV PATH: ' . $envPath);
            error_log('ENV EXISTS: ' . (file_exists($envPath) ? 'YES' : 'NO'));
        }
        
        if (!file_exists($envPath)) {
            self::$loaded = true; // Mark as loaded even if file doesn't exist
            return;
        }

        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            // Only log in debug mode (never log actual values in production)
            if ($isDebug) {
                error_log('ENV LINE: ' . $line);
            }
            if (strpos(trim($line), '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                if (preg_match('/^(["\"])(.*)\1$/', $value, $matches)) {
                    $value = $matches[2];
                }
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
                putenv("$key=$value");
            }
        }
        self::$loaded = true;
    }
    
    /**
     * Get environment variable with fallback
     */
    public static function get($key, $default = null) {
        self::load();
        if (isset($_ENV[$key])) return $_ENV[$key];
        if (isset($_SERVER[$key])) return $_SERVER[$key];
        $val = getenv($key);
        return $val !== false ? $val : $default;
    }
    
    /**
     * Check if environment variable exists
     */
    public static function has($key) {
        self::load();
        return isset($_ENV[$key]) || isset($_SERVER[$key]) || getenv($key) !== false;
    }
    
    /**
     * Validate required environment variables
     */
    public static function validateRequired($required = []) {
        $missing = [];
        
        foreach ($required as $key) {
            if (!self::has($key)) {
                $missing[] = $key;
            }
        }
        
        if (!empty($missing)) {
            throw new Exception("Missing required environment variables: " . implode(', ', $missing));
        }
    }
}
?> 