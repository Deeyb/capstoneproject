<?php
/**
 * Database Connection Class
 * Uses environment variables with fallback to localhost defaults for backward compatibility
 */
require_once __DIR__ . '/../classes/EnvironmentLoader.php';

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        // Load environment variables (with fallbacks for localhost development)
        EnvironmentLoader::load();
        $this->host = EnvironmentLoader::get('DB_HOST', 'localhost');
        $this->db_name = EnvironmentLoader::get('DB_NAME', 'coderegal_db');
        $this->username = EnvironmentLoader::get('DB_USER', 'root');
        $this->password = EnvironmentLoader::get('DB_PASS', '');
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            // Set session timezone to Philippines time
            $this->conn->exec("SET time_zone = '+08:00'");
            return $this->conn;
        } catch(PDOException $e) {
            error_log("Connection error: " . $e->getMessage());
            return null;
        }
    }
}
?> 