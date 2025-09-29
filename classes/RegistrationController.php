<?php
require_once __DIR__ . '/RegistrationService.php';
require_once __DIR__ . '/User.php';
require_once __DIR__ . '/../config/Database.php';

class RegistrationController {
    private $db;
    private $service;

    public function __construct() {
        $this->db = (new Database())->getConnection();
        $this->service = new RegistrationService($this->db);
    }

    public function checkId($id) {
        $user = new User($this->db);
        $user->setIdNumber($id);
        return ['id_used' => $user->idNumberExists()];
    }

    public function checkEmail($email) {
        $user = new User($this->db);
        $user->setEmail($email);
        return ['email_used' => $user->emailExists()];
    }

    public function register($post) {
        return $this->service->register($post);
    }
} 