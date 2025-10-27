<?php
class UserManager {
    private $db;
    private $conn;
    private $usersTable = "users";
    private $authorizedTable = "authorized_ids";

    public function __construct($db) {
        $this->db = $db;
        $this->conn = $db;
    }

    public function getAllUsers($search = '', $role_filter = '', $status_filter = '', $offset = 0, $limit = 50, $sortBy = 'firstname', $sortDir = 'ASC') {
        try {
            $sql = "SELECT u.*, COALESCE(u.status, 'Active') as status, a.status as id_status 
                   FROM users u 
                   LEFT JOIN authorized_ids a ON u.id_number = a.id_number 
                   WHERE 1=1";
            $params = [];

            if (!empty($search)) {
                $sql .= " AND (u.firstname LIKE ? OR u.lastname LIKE ? OR u.email LIKE ? OR u.id_number LIKE ?)";
                $searchTerm = "%$search%";
                $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
            }

            if (!empty($role_filter)) {
                $sql .= " AND UPPER(u.role) = UPPER(?)";
                $params[] = $role_filter;
            }

            if (!empty($status_filter)) {
                // Treat NULL as 'Active' for backward compatibility
                $sql .= " AND COALESCE(u.status, 'Active') = ?";
                $params[] = $status_filter;
            }

            // Sorting whitelist
            $allowedSort = [
                'firstname' => 'u.firstname',
                'lastname' => 'u.lastname',
                'role' => 'u.role',
                'email' => 'u.email',
                'id_number' => 'u.id_number',
                'status' => 'u.status',
                'created_at' => 'u.created_at'
            ];
            $column = $allowedSort[strtolower($sortBy)] ?? 'u.firstname';
            $direction = strtoupper($sortDir) === 'DESC' ? 'DESC' : 'ASC';
            $sql .= " ORDER BY $column $direction";

            // Pagination
            $offset = max(0, (int)$offset);
            $limit = max(1, (int)$limit);
            $sql .= " LIMIT $offset, $limit";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error getting users: " . $e->getMessage());
            return [];
        }
    }

    public function getUsersCount($search = '', $role_filter = '', $status_filter = '') {
        try {
            $sql = "SELECT COUNT(*) as cnt
                    FROM users u
                    LEFT JOIN authorized_ids a ON u.id_number = a.id_number
                    WHERE 1=1";
            $params = [];
            if (!empty($search)) {
                $sql .= " AND (u.firstname LIKE ? OR u.lastname LIKE ? OR u.email LIKE ? OR u.id_number LIKE ?)";
                $searchTerm = "%$search%";
                $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
            }
            if (!empty($role_filter)) {
                $sql .= " AND UPPER(u.role) = UPPER(?)";
                $params[] = $role_filter;
            }
            if (!empty($status_filter)) {
                $sql .= " AND COALESCE(u.status, 'Active') = ?";
                $params[] = $status_filter;
            }
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return (int)($row['cnt'] ?? 0);
        } catch (Exception $e) {
            error_log("Error counting users: " . $e->getMessage());
            return 0;
        }
    }

    public function getRoles() {
        $stmt = $this->db->query("SELECT DISTINCT role FROM users");
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    public function addUser($data) {
        // Normalize role to uppercase for consistency in analytics/queries
        $normalizedRole = strtoupper($data['role']);
        $stmt = $this->db->prepare("INSERT INTO users (firstname, middlename, lastname, id_number, email, role, status, password, created_at) VALUES (?, ?, ?, ?, ?, ?, 'Active', ?, NOW())");
        $hashed = password_hash($data['password'], PASSWORD_DEFAULT);
        $ok = $stmt->execute([
            $data['firstname'],
            $data['middlename'],
            $data['lastname'],
            $data['id_number'],
            $data['email'],
            $normalizedRole,
            $hashed
        ]);
        // Insert or update status in authorized_ids
        if ($ok) {
            $id_number = $data['id_number'];
            // When a user is created, mark the authorized ID as 'used' by default
            $authStatus = 'used';
            // Check if already exists
            $check = $this->db->prepare("SELECT id FROM authorized_ids WHERE id_number = ?");
            $check->execute([$id_number]);
            if ($check->fetch()) {
                $this->db->prepare("UPDATE authorized_ids SET status = ? WHERE id_number = ?")
                    ->execute([$authStatus, $id_number]);
            } else {
                $this->db->prepare("INSERT INTO authorized_ids (id_number, status) VALUES (?, ?)")
                    ->execute([$id_number, $authStatus]);
            }
        }
        return $ok;
    }

    // New method for admin to add users - bypasses authorized_ids restriction
    public function addUserByAdmin($data) {
        try {
            // Start transaction
            $this->db->beginTransaction();
            
            // Check if user already exists
            $checkUser = $this->db->prepare("SELECT id FROM users WHERE id_number = ? OR email = ?");
            $checkUser->execute([$data['id_number'], $data['email']]);
            if ($checkUser->fetch()) {
                $this->db->rollBack();
                return ['success' => false, 'message' => 'User with this ID number or email already exists'];
            }
            
            // Insert user (if invite mode, set a random temporary password and force reset via token later)
            $stmt = $this->db->prepare("INSERT INTO users (firstname, middlename, lastname, id_number, email, role, status, password, created_at) VALUES (?, ?, ?, ?, ?, ?, 'Active', ?, NOW())");
            $passwordForInsert = $data['password'] ?? '';
            if (!$passwordForInsert) {
                // Generate random strong temporary password (16 chars)
                $passwordForInsert = bin2hex(random_bytes(8));
            }
            $hashed = password_hash($passwordForInsert, PASSWORD_DEFAULT);
            $normalizedRole = strtoupper($data['role']);
            $ok = $stmt->execute([
                $data['firstname'],
                $data['middlename'],
                $data['lastname'],
                $data['id_number'],
                $data['email'],
                $normalizedRole,
                $hashed
            ]);
            
            if ($ok) {
                // Add to authorized_ids if it doesn't exist, or update status if it does
                // When creating a concrete user, the authorized ID becomes 'used'
                $status = 'used';
                $id_number = $data['id_number'];
                
                $checkAuth = $this->db->prepare("SELECT id FROM authorized_ids WHERE id_number = ?");
                $checkAuth->execute([$id_number]);
                
                if ($checkAuth->fetch()) {
                    // Update existing record
                    $this->db->prepare("UPDATE authorized_ids SET status = ? WHERE id_number = ?")
                        ->execute([$status, $id_number]);
                } else {
                    // Insert new record
                    $this->db->prepare("INSERT INTO authorized_ids (id_number, status) VALUES (?, ?)")
                        ->execute([$id_number, $status]);
                }
                
                $this->db->commit();

                // Optional: send invite link for the user to set their own password
                if (!empty($data['invite']) && (string)$data['invite'] !== '0') {
                    try {
                        require_once __DIR__ . '/PasswordResetController.php';
                        $prc = new PasswordResetController();
                        // Reuse existing reset-link flow which sets token and sends the email
                        $inviteResult = $prc->sendResetLink(['email' => $data['email']]);
                        if (!empty($inviteResult['success'])) {
                            return ['success' => true, 'message' => 'User added and invite email sent'];
                        }
                    } catch (Exception $e) {
                        // If mail fails, still succeed adding the user
                    }
                }

                return ['success' => true, 'message' => 'User added successfully'];
            } else {
                $this->db->rollBack();
                return ['success' => false, 'message' => 'Failed to add user'];
            }
            
        } catch (Exception $e) {
            $this->db->rollBack();
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }

    public function updateUser($id, $data) {
        $sql = "UPDATE users SET firstname=?, middlename=?, lastname=?, id_number=?, email=?, role=? WHERE id=?";
        $params = [
            $data['firstname'],
            $data['middlename'],
            $data['lastname'],
            $data['id_number'],
            $data['email'],
            strtoupper($data['role']),
            $id
        ];
        return $this->db->prepare($sql)->execute($params);
    }

    public function archiveUser($id_number) {
        try {
            $this->db->beginTransaction();
            
            // Update user status in users table
            $updateUser = $this->db->prepare("UPDATE users SET status = 'Archived' WHERE id_number = ?");
            $updateUser->execute([$id_number]);
            
            // Update authorized_ids status
            $updateAuth = $this->db->prepare("UPDATE authorized_ids SET status = 'archived' WHERE id_number = ?");
            $updateAuth->execute([$id_number]);
            
            $this->db->commit();
            return ['success' => true, 'message' => 'User archived successfully'];
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Error archiving user: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to archive user'];
        }
    }

    public function unarchiveUser($id_number) {
        try {
            $this->db->beginTransaction();
            
            // Update user status in users table
            $updateUser = $this->db->prepare("UPDATE users SET status = 'Active' WHERE id_number = ?");
            $updateUser->execute([$id_number]);
            
            // Update authorized_ids status
            $updateAuth = $this->db->prepare("UPDATE authorized_ids SET status = 'used' WHERE id_number = ?");
            $updateAuth->execute([$id_number]);
            
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Error unarchiving user: " . $e->getMessage());
            return false;
        }
    }

    public function deleteUser($id) {
        try {
            // Start transaction
            $this->db->beginTransaction();
            
            // First get the user's ID number
            $stmt = $this->db->prepare("SELECT id_number FROM users WHERE id = ?");
            $stmt->execute([$id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                // Delete the user
                $deleteStmt = $this->db->prepare("DELETE FROM users WHERE id = ?");
                $deleteResult = $deleteStmt->execute([$id]);
                
                if ($deleteResult) {
                    // Update the ID number status back to active
                    $updateStmt = $this->db->prepare("UPDATE authorized_ids SET status = 'active' WHERE id_number = ?");
                    $updateStmt->execute([$user['id_number']]);
                    
                    $this->db->commit();
                    return true;
                }
            }
            
            $this->db->rollBack();
            return false;
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Error deleting user: " . $e->getMessage());
            return false;
        }
    }

    // Get total number of users
    public function getTotalUsers() {
        $query = "SELECT COUNT(*) as total FROM " . $this->usersTable;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total'];
    }

    // Get total users by role
    public function getTotalUsersByRole($role) {
        $query = "SELECT COUNT(*) as total FROM " . $this->usersTable . " WHERE UPPER(role) = :role";
        $stmt = $this->conn->prepare($query);
        $upperRole = strtoupper($role);
        $stmt->bindParam(":role", $upperRole);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total'];
    }

    // Get number of active courses
    public function getActiveCourses() {
        try {
            // First check if the courses table exists
            $checkTableQuery = "SHOW TABLES LIKE 'courses'";
            $checkStmt = $this->conn->prepare($checkTableQuery);
            $checkStmt->execute();
            
            if ($checkStmt->rowCount() == 0) {
                // Table doesn't exist, return 0
                return 0;
            }
            
            // Table exists, now check for active courses
            $query = "SELECT COUNT(DISTINCT course_name) as total FROM courses WHERE status = 'active'";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row['total'] ?? 0;
        } catch (PDOException $e) {
            // If any error occurs, return 0
            return 0;
        }
    }

    // Get recent activities
    public function getRecentActivities() {
        try {
            $activities = [];
            
            // Get recent user registrations
            $query = "SELECT firstname, lastname, role, created_at FROM " . $this->usersTable . " 
                     ORDER BY created_at DESC LIMIT 5";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $lastname = $row['lastname'] ?? '';
                $firstname = $row['firstname'] ?? '';
                $fullName = trim($lastname . ', ' . $firstname);
                $activities[] = [
                    'type' => 'user',
                    'icon' => 'fa-user-plus',
                    'title' => 'New User Registration',
                    'description' => $fullName . ' registered as ' . $row['role'],
                    'time' => $this->timeAgo($row['created_at'])
                ];
            }
            
            // If no recent registrations, add some sample activities
            if (empty($activities)) {
                $activities = [
                    [
                        'type' => 'system',
                        'icon' => 'fa-cog',
                        'title' => 'System Update',
                        'description' => 'Database backup completed successfully',
                        'time' => '2 hours ago'
                    ],
                    [
                        'type' => 'login',
                        'icon' => 'fa-sign-in-alt',
                        'title' => 'User Login',
                        'description' => 'Admin user logged into the system',
                        'time' => '3 hours ago'
                    ]
                ];
            }
            
            return $activities;
            
        } catch (PDOException $e) {
            return [];
        }
    }

    // Get notifications
    public function getNotifications() {
        try {
            $notifications = [];
            
            // Check for new user registrations (last 24 hours)
            $query = "SELECT COUNT(*) as count FROM " . $this->usersTable . " 
                     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($row['count'] > 0) {
                $notifications[] = [
                    'type' => 'info',
                    'icon' => 'fa-user-plus',
                    'title' => 'New Registrations',
                    'message' => $row['count'] . ' new user(s) registered in the last 24 hours',
                    'time' => '1 hour ago',
                    'unread' => true
                ];
            }
            
            // Add system notifications
            $notifications[] = [
                'type' => 'success',
                'icon' => 'fa-check-circle',
                'title' => 'System Status',
                'message' => 'All systems are running smoothly',
                'time' => '2 hours ago',
                'unread' => false
            ];
            
            $notifications[] = [
                'type' => 'warning',
                'icon' => 'fa-exclamation-triangle',
                'title' => 'Database Maintenance',
                'message' => 'Scheduled maintenance in 2 days',
                'time' => '1 day ago',
                'unread' => true
            ];
            
            return $notifications;
            
        } catch (PDOException $e) {
            return [];
        }
    }

    // Helper function to format time ago
    private function timeAgo($datetime) {
        $time = strtotime($datetime);
        $now = time();
        $diff = $now - $time;
        
        if ($diff < 60) {
            return 'Just now';
        } elseif ($diff < 3600) {
            $minutes = floor($diff / 60);
            return $minutes . ' minute' . ($minutes > 1 ? 's' : '') . ' ago';
        } elseif ($diff < 86400) {
            $hours = floor($diff / 3600);
            return $hours . ' hour' . ($hours > 1 ? 's' : '') . ' ago';
        } else {
            $days = floor($diff / 86400);
            return $days . ' day' . ($days > 1 ? 's' : '') . ' ago';
        }
    }

    // Get recently registered users (latest 5)
    public function getRecentlyRegisteredUsers() {
        $users = [];
        try {
            $query = "SELECT firstname, lastname, role, created_at FROM " . $this->usersTable . " ORDER BY created_at DESC LIMIT 5";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $lastname = $row['lastname'] ?? '';
                $firstname = $row['firstname'] ?? '';
                $users[] = [
                    'name' => trim($lastname . ', ' . $firstname),
                    'role' => $row['role'],
                    'time' => $this->timeAgo($row['created_at'])
                ];
            }
        } catch (PDOException $e) {}
        return $users;
    }

    // Get recently login users (latest 5)
    public function getRecentlyLoginUsers() {
        $users = [];
        try {
            // Assumes users table has last_login column (DATETIME)
            $query = "SELECT firstname, lastname, role, last_login FROM " . $this->usersTable . " WHERE last_login IS NOT NULL ORDER BY last_login DESC LIMIT 5";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $lastname = $row['lastname'] ?? '';
                $firstname = $row['firstname'] ?? '';
                $users[] = [
                    'name' => trim($lastname . ', ' . $firstname),
                    'role' => $row['role'],
                    'time' => $this->timeAgo($row['last_login'])
                ];
            }
        } catch (PDOException $e) {}
        return $users;
    }

    // Get recent logins
    public function getRecentLogins($limit = 10) {
        try {
            $query = "SELECT firstname, lastname, role, last_login 
                     FROM " . $this->usersTable . "
                     WHERE last_login IS NOT NULL 
                     ORDER BY last_login DESC 
                     LIMIT :limit";
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting recent logins: " . $e->getMessage());
            return [];
        }
    }

    // Get recent registrations
    public function getRecentRegistrations($limit = 10) {
        try {
            $query = "SELECT firstname, lastname, role, created_at 
                     FROM " . $this->usersTable . "
                     ORDER BY created_at DESC 
                     LIMIT :limit";
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting recent registrations: " . $e->getMessage());
            return [];
        }
    }

    // Check if an ID number exists in the users table
    public function idNumberExists($idnumber) {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM users WHERE id_number = ?");
        $stmt->execute([$idnumber]);
        return $stmt->fetchColumn() > 0;
    }

    // Check if an email exists in the users table
    public function emailExists($email) {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetchColumn() > 0;
    }

    // Get user role distribution for dashboard pie chart
    public function getUserRoleDistribution() {
        $sql = "SELECT role, COUNT(*) as count FROM users GROUP BY role";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $distribution = [];
        foreach ($result as $row) {
            $distribution[$row['role']] = (int)$row['count'];
        }
        return $distribution;
    }

    // === USER ANALYTICS METHODS ===

    // Get user registration trends over time
    public function getUserRegistrationTrends($days = 30) {
        try {
            $days = max(1, (int)$days);
            $sql = "SELECT DATE(created_at) as date, COUNT(*) as count 
                   FROM users 
                   WHERE created_at >= DATE_SUB(NOW(), INTERVAL $days DAY)
                   GROUP BY DATE(created_at)
                   ORDER BY date ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting registration trends: " . $e->getMessage());
            return [];
        }
    }

    // Get user registration trends by role
    public function getUserRegistrationTrendsByRole($days = 30) {
        try {
            $days = max(1, (int)$days);
            $sql = "SELECT DATE(created_at) as date, role, COUNT(*) as count 
                   FROM users 
                   WHERE created_at >= DATE_SUB(NOW(), INTERVAL $days DAY)
                   GROUP BY DATE(created_at), role
                   ORDER BY date ASC, role ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting registration trends by role: " . $e->getMessage());
            return [];
        }
    }

    // Get login frequency analysis
    public function getLoginFrequencyAnalysis($days = 30) {
        try {
            $days = max(1, (int)$days);
            $sql = "SELECT DATE(last_login) as date, COUNT(*) as count 
                   FROM users 
                   WHERE last_login IS NOT NULL 
                   AND last_login >= DATE_SUB(NOW(), INTERVAL $days DAY)
                   GROUP BY DATE(last_login)
                   ORDER BY date ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting login frequency: " . $e->getMessage());
            return [];
        }
    }

    // Get user engagement metrics
    public function getUserEngagementMetrics() {
        try {
            $sql = "SELECT 
                      COUNT(*) as total_users,
                      COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as users_with_login,
                      COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_last_7_days,
                      COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as active_last_30_days,
                      COUNT(CASE WHEN last_login IS NULL THEN 1 END) as never_logged_in,
                      COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_users,
                      COUNT(CASE WHEN status = 'Archived' THEN 1 END) as archived_users
                   FROM users";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting engagement metrics: " . $e->getMessage());
            return [];
        }
    }

    // Get monthly user statistics
    public function getMonthlyUserStats($months = 12) {
        try {
            $months = max(1, (int)$months);
            $sql = "SELECT 
                      DATE_FORMAT(created_at, '%Y-%m') as month,
                      COUNT(*) as registrations,
                      SUM(CASE WHEN UPPER(role) = 'STUDENT' THEN 1 ELSE 0 END) as students,
                      SUM(CASE WHEN UPPER(role) = 'TEACHER' THEN 1 ELSE 0 END) as teachers,
                      SUM(CASE WHEN UPPER(role) = 'COORDINATOR' THEN 1 ELSE 0 END) as coordinators,
                      SUM(CASE WHEN UPPER(role) = 'ADMIN' THEN 1 ELSE 0 END) as admins
                   FROM users 
                   WHERE created_at >= DATE_SUB(NOW(), INTERVAL $months MONTH)
                   GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                   ORDER BY month ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting monthly stats: " . $e->getMessage());
            return [];
        }
    }

    // Get user activity summary
    public function getUserActivitySummary($days = 7) {
        try {
            $days = max(1, (int)$days);
            $sql = "SELECT 
                      role,
                      COUNT(*) as total_count,
                      COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as logged_in_count,
                      COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL $days DAY) THEN 1 END) as active_7_days,
                      COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as active_30_days,
                      AVG(CASE WHEN last_login IS NOT NULL THEN DATEDIFF(NOW(), last_login) END) as avg_days_since_login
                   FROM users 
                   GROUP BY role
                   ORDER BY total_count DESC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting activity summary: " . $e->getMessage());
            return [];
        }
    }

    // Get top active users
    public function getTopActiveUsers($limit = 10) {
        try {
            $sql = "SELECT 
                      CONCAT(lastname, ', ', firstname) as name,
                      role,
                      last_login,
                      created_at,
                      DATEDIFF(NOW(), last_login) as days_since_login
                   FROM users 
                   WHERE last_login IS NOT NULL
                   ORDER BY last_login DESC
                   LIMIT ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$limit]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting top active users: " . $e->getMessage());
            return [];
        }
    }

    // Get user status distribution over time
    public function getUserStatusTrends($days = 30) {
        try {
            $days = max(1, (int)$days);
            $sql = "SELECT 
                      DATE(created_at) as date,
                      COUNT(CASE WHEN status = 'Active' OR status IS NULL THEN 1 END) as active_count,
                      COUNT(CASE WHEN status = 'Archived' THEN 1 END) as archived_count
                   FROM users 
                   WHERE created_at >= DATE_SUB(NOW(), INTERVAL $days DAY)
                   GROUP BY DATE(created_at)
                   ORDER BY date ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting status trends: " . $e->getMessage());
            return [];
        }
    }

    // Check if an ID number exists in authorized_ids table (authorization pool)
    public function isAuthorizedId($idnumber) {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM authorized_ids WHERE id_number = ?");
        $stmt->execute([$idnumber]);
        return $stmt->fetchColumn() > 0;
    }
    
    // Get user status statistics
    public function getUserStatusStats() {
        $stmt = $this->db->prepare("SELECT COALESCE(status, 'Active') as status, COUNT(*) as count FROM users GROUP BY status");
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $stats = [];
        foreach ($result as $row) {
            $stats[$row['status']] = (int)$row['count'];
        }
        
        return $stats;
    }
}