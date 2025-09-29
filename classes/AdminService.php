<?php
require_once __DIR__ . '/UserManager.php';

class AdminService {
    private $userManager;

    public function __construct($db) {
        $this->userManager = new UserManager($db);
    }

    // Dashboard stats
    public function getDashboardStats() {
        return [
            'totalUsers' => $this->userManager->getTotalUsers(),
            'totalStudents' => $this->userManager->getTotalUsersByRole('STUDENT'),
            'totalTeachers' => $this->userManager->getTotalUsersByRole('TEACHER'),
            'totalCoordinators' => $this->userManager->getTotalUsersByRole('COORDINATOR'),
            'activeCourses' => $this->userManager->getActiveCourses(),
        ];
    }

    // Recent registrations (limit configurable)
    public function getRecentRegistrations($limit = 10) {
        return $this->userManager->getRecentRegistrations($limit);
    }

    // Recent logins (limit configurable)
    public function getRecentLogins($limit = 10) {
        return $this->userManager->getRecentLogins($limit);
    }

    // User CRUD (delegated)
    public function addUserByAdmin($data) {
        return $this->userManager->addUserByAdmin($data);
    }
    public function getAllUsers($search = '', $role = '', $status = '') {
        return $this->userManager->getAllUsers($search, $role, $status);
    }
    public function getRoles() {
        return $this->userManager->getRoles();
    }
    public function updateUser($id, $data) {
        return $this->userManager->updateUser($id, $data);
    }
    public function archiveUser($id_number) {
        return $this->userManager->archiveUser($id_number);
    }
    public function unarchiveUser($id_number) {
        return $this->userManager->unarchiveUser($id_number);
    }
    public function deleteUser($id) {
        return $this->userManager->deleteUser($id);
    }
    public function idNumberExists($idnumber) {
        return $this->userManager->idNumberExists($idnumber);
    }
    public function emailExists($email) {
        return $this->userManager->emailExists($email);
    }

    public function handleUserAction($post) {
        $action = $post['action'] ?? '';
        if ($action === 'edit') {
            $id = $post['id'];
            $data = [
                'firstname' => $post['firstname'],
                'middlename' => $post['middlename'],
                'lastname' => $post['lastname'],
                'id_number' => $post['id_number'],
                'email' => $post['email'],
                'role' => $post['role'],
            ];
            $this->updateUser($id, $data);
            return 'success';
        } elseif ($action === 'delete') {
            $id = $post['id'];
            $this->deleteUser($id);
            return 'success';
        } elseif ($action === 'archive') {
            $id_number = $post['id_number'];
            $this->archiveUser($id_number);
            return 'success';
        } elseif ($action === 'unarchive') {
            $id_number = $post['id_number'];
            $this->unarchiveUser($id_number);
            return 'success';
        } elseif ($action === 'check_id') {
            $idnumber = $post['idnumber'] ?? '';
            $exists = $this->idNumberExists($idnumber);
            // Check if authorized using UserManager method (no direct property access)
            $authorized = $this->userManager->isAuthorizedId($idnumber);
            return json_encode(['id_used' => $exists, 'authorized' => $authorized]);
        } elseif ($action === 'check_email') {
            $email = $post['email'] ?? '';
            $exists = $this->emailExists($email);
            return json_encode(['email_used' => $exists]);
        }
        return null;
    }

    // Get user role distribution for dashboard pie chart
    public function getUserRoleDistribution() {
        return $this->userManager->getUserRoleDistribution();
    }
} 