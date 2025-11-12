<?php
/**
 * ADMIN PANEL
 * Using original auth system to avoid redirect loops
 */

// CRITICAL: Set session path BEFORE any session_start() calls
$sessionPath = __DIR__ . '/sessions';
if (!is_dir($sessionPath)) {
    @mkdir($sessionPath, 0777, true);
}
if (is_dir($sessionPath) && is_writable($sessionPath)) {
    ini_set('session.save_path', $sessionPath);
}

// Set session name before starting
if (session_status() === PHP_SESSION_NONE) {
    $preferred = 'CodeRegalSession';
    $legacy = 'PHPSESSID';
    if (!empty($_COOKIE[$preferred])) { 
        session_name($preferred); 
    } elseif (!empty($_COOKIE[$legacy])) { 
        session_name($legacy); 
    } else { 
        session_name($preferred); 
    }
}

@session_start();
require_once 'config.php';
require_once 'classes/auth_helpers.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/AdminService.php';
require_once __DIR__ . '/classes/ProfileService.php';

// Use original auth system
Auth::requireAuth();
Auth::requireRole('admin');

// Database connection
$db = (new Database())->getConnection();
$adminService = new AdminService($db);
$profileService = new ProfileService($db);

// Get user profile data from database
$userProfile = $profileService->getUserProfile($_SESSION['user_id']);
$profilePhotoUrl = $profileService->getProfilePhotoUrl($_SESSION['user_id']);

// Set user name and role from session
$lastname = $_SESSION['user_lastname'] ?? '';
$firstname = $_SESSION['user_firstname'] ?? '';
$middlename = $_SESSION['user_middlename'] ?? '';
$middle_initial = $middlename ? strtoupper(mb_substr(trim($middlename), 0, 1)) . '.' : '';
$user_name = trim($lastname . ', ' . $firstname . ' ' . $middle_initial);
if (!$user_name || $user_name === ',') $user_name = 'Admin';
$user_role = $_SESSION['user_role'] ?? 'ADMIN';

// Get dashboard statistics
$stats = $adminService->getDashboardStats();
$totalUsers = $stats['totalUsers'];
$totalStudents = $stats['totalStudents'];
$totalTeachers = $stats['totalTeachers'];
$totalCoordinators = $stats['totalCoordinators'];
$activeCourses = $stats['activeCourses'];

// Handle Add User POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_user'])) {
    // Debug: Log the POST data
    error_log("Add User POST received: " . print_r($_POST, true));
    
    $userData = [
        'firstname' => $_POST['firstname'],
        'middlename' => $_POST['middlename'],
        'lastname' => $_POST['lastname'],
        'id_number' => $_POST['id_number'],
        'email' => $_POST['email'],
        'role' => $_POST['role'],
        'status' => $_POST['status'],
        'password' => $_POST['password'] ?? '',
        'invite' => isset($_POST['invite']) ? $_POST['invite'] : '0',
    ];
    
    // Debug: Log the user data
    error_log("User data prepared: " . print_r($userData, true));
    
    $result = $adminService->addUserByAdmin($userData);
    
    // Debug: Log the result
    error_log("Add user result: " . print_r($result, true));
    
    // Return JSON for fetch handler
    header('Content-Type: application/json');
    echo json_encode($result);
    exit;
}

// Handle search and filter
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$role_filter = isset($_GET['role']) ? trim($_GET['role']) : '';
$users = $adminService->getAllUsers($search, $role_filter);
$roles = $adminService->getRoles();
// Ensure all standard roles are present in the filter regardless of current data
$standardRoles = ['ADMIN', 'TEACHER', 'COORDINATOR', 'STUDENT'];
$roles = array_unique(array_merge($standardRoles, array_map('strtoupper', $roles)));

require_once 'includes/header.php';
require_once 'includes/sidebar.php';
?>
<div class="main-content">
  <div id="dashboard" class="section-content active">
    <h2 class="section-title">Dashboard</h2>
    <div class="dashboard-stats">
      <div class="stat-card" data-target="users">
        <div class="stat-icon"><i class="fas fa-users"></i></div>
        <h3>Total Users</h3>
        <div class="number" id="statTotalUsers"><?php echo htmlspecialchars($totalUsers); ?></div>
      </div>
      <div class="stat-card" data-role="STUDENT">
        <div class="stat-icon"><i class="fas fa-user-graduate"></i></div>
        <h3>Total Students</h3>
        <div class="number" id="statTotalStudents"><?php echo htmlspecialchars($totalStudents); ?></div>
      </div>
      <div class="stat-card" data-role="TEACHER">
        <div class="stat-icon"><i class="fas fa-chalkboard-teacher"></i></div>
        <h3>Total Teachers</h3>
        <div class="number" id="statTotalTeachers"><?php echo htmlspecialchars($totalTeachers); ?></div>
      </div>
      <div class="stat-card" data-role="COORDINATOR">
        <div class="stat-icon"><i class="fas fa-user-tie"></i></div>
        <h3>Total Coordinators</h3>
        <div class="number" id="statTotalCoordinators"><?php echo htmlspecialchars($totalCoordinators); ?></div>
      </div>
      <div class="stat-card" data-target="courses">
        <div class="stat-icon"><i class="fas fa-book-open"></i></div>
        <h3>Active Courses</h3>
        <div class="number" id="statActiveCourses"><?php echo htmlspecialchars($activeCourses); ?></div>
      </div>
    </div>
    <div class="dashboard-charts-row">
      <div class="dashboard-widget">
        <h3>User Role Distribution</h3>
        <canvas id="userRoleChart" style="max-width: 400px; margin: auto;"></canvas>
      </div>
      <div class="dashboard-widget">
        <h3>User Status Overview</h3>
        <canvas id="userStatusChart" style="max-width: 400px; margin: auto;"></canvas>
      </div>
    </div>
    <div class="dashboard-widgets" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
      <!-- Recently Registered -->
      <div class="widget-panel">
        <h3 class="widget-title"><i class="fas fa-user-plus"></i> Recently Registered</h3>
        <div class="activity-list" id="recentlyRegisteredList">
          <div class="loading-spinner">Loading...</div>
        </div>
      </div>
      <!-- Recently Login -->
      <div class="widget-panel">
        <h3 class="widget-title"><i class="fas fa-sign-in-alt"></i> Recently Login</h3>
        <div class="activity-list" id="recentlyLoginList">
          <div class="loading-spinner">Loading...</div>
        </div>
      </div>
    </div>
  </div>
  <div id="users" class="section-content">
    <h2 class="section-title">User Management</h2>
    <div id="userSubTabs" style="display:flex; gap:8px; margin: -6px 0 12px; flex-wrap:wrap;">
      <button id="tabUsers" class="action-btn" style="background:#1d9b3e;color:#fff;">Users</button>
      <button id="tabUsersArchived" class="action-btn" style="background:#6c757d;color:#fff;">Archived Users</button>
      <button id="tabAuthorized" class="action-btn" style="background:#6c757d;color:#fff;">Authorized IDs</button>
      <button id="tabAuthorizedArchived" class="action-btn" style="background:#6c757d;color:#fff;">Archived IDs</button>
    </div>
    <div id="usersToolbar" style="display: flex; gap: 10px; align-items: center; margin-bottom: 20px; flex-wrap: wrap;">
      <form id="userFilterForm" method="get" style="display: flex; gap: 10px; align-items: center; flex-wrap:" onsubmit="return false;">
        <input type="hidden" name="section" value="users" />
        <input id="userSearchInput" type="text" name="search" placeholder="Search user..." value="<?= htmlspecialchars($search) ?>" style="padding: 7px 12px; border: 1px solid #ccc; border-radius: 5px; min-width: 180px;">
        <select id="userRoleSelect" name="role" style="padding: 7px 12px; border: 1px solid #ccc; border-radius: 5px;">
          <option value="">All Roles</option>
          <?php foreach ($roles as $role): $label = ucfirst(strtolower($role)); ?>
            <option value="<?= htmlspecialchars($role) ?>" <?= $role_filter === $role ? 'selected' : '' ?>><?= htmlspecialchars($label) ?></option>
          <?php endforeach; ?>
        </select>
        <select id="userStatusSelect" name="status" style="padding: 7px 12px; border: 1px solid #ccc; border-radius: 5px;">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Archived">Archived</option>
        </select>
        <button id="userFilterBtn" type="submit" style="padding: 7px 16px; background: #1d9b3e; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Filter</button>
      </form>
      <button onclick="document.getElementById('addUserModal').style.display='block'" style="margin-left: auto; padding: 7px 16px; background: #2196F3; color: #fff; border: none; border-radius: 5px; cursor: pointer;">+ Add User</button>
    </div>
    <div id="userTableWrapper" style="overflow-x:auto; min-height: 120px;">
      <!-- User table will be loaded here by JS -->
    </div>
    <div id="authIdsWrapper" style="display:none; overflow-x:auto; min-height: 120px;"></div>
    <?php require_once 'includes/modals.php'; ?>
  </div>
  <div id="analytics" class="section-content">
    <h2 class="section-title">User Analytics</h2>
    
    <!-- Analytics Controls -->
    <div class="analytics-controls" style="margin-bottom: 30px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
      <select id="analyticsTimeRange" style="padding: 8px 12px; border: 1px solid #ccc; border-radius: 5px;">
        <option value="1">Today</option>
        <option value="7">Last 7 Days</option>
        <option value="30" selected>Last 30 Days</option>
        <option value="90">Last 90 Days</option>
        <option value="365">Last Year</option>
      </select>
      <button id="refreshAnalytics" style="padding: 8px 16px; background: #1d9b3e; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
        <i class="fas fa-sync-alt"></i> Refresh
      </button>
    </div>

    <!-- Analytics Overview Cards -->
    <div class="analytics-overview">
      <div class="analytics-cards">
        <div class="analytics-card">
          <div class="analytics-icon"><i class="fas fa-users"></i></div>
          <div class="analytics-content">
            <h3>Total Users</h3>
            <div class="analytics-number" id="totalUsersAnalytics">0</div>
            <div class="analytics-subtitle">Registered users</div>
          </div>
        </div>
        <div class="analytics-card">
          <div class="analytics-icon"><i class="fas fa-sign-in-alt"></i></div>
          <div class="analytics-content">
            <h3>Active Users (7 days)</h3>
            <div class="analytics-number" id="activeUsers7Days">0</div>
            <div class="analytics-subtitle">Recently active</div>
          </div>
        </div>
        <div class="analytics-card">
          <div class="analytics-icon"><i class="fas fa-user-clock"></i></div>
          <div class="analytics-content">
            <h3>Active Users (30 days)</h3>
            <div class="analytics-number" id="activeUsers30Days">0</div>
            <div class="analytics-subtitle">Monthly active</div>
          </div>
        </div>
        <div class="analytics-card">
          <div class="analytics-icon"><i class="fas fa-user-times"></i></div>
          <div class="analytics-content">
            <h3>Never Logged In</h3>
            <div class="analytics-number" id="neverLoggedIn">0</div>
            <div class="analytics-subtitle">Inactive users</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Analytics Charts -->
    <div class="analytics-charts">
      <div class="analytics-chart-row">
        <div class="analytics-chart-container">
          <h3>User Registration Trends</h3>
          <canvas id="registrationTrendsChart"></canvas>
        </div>
        <div class="analytics-chart-container">
          <h3>Login Activity</h3>
          <canvas id="loginActivityChart"></canvas>
        </div>
      </div>
      <div class="analytics-chart-row">
        <div class="analytics-chart-container">
          <h3>Monthly User Statistics</h3>
          <canvas id="monthlyStatsChart"></canvas>
        </div>
        <div class="analytics-chart-container">
          <h3>User Activity by Role</h3>
          <canvas id="roleActivityChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Top Active Users -->
    <div class="analytics-widgets">
      <div class="analytics-widget">
        <h3 class="widget-title">
          <i class="fas fa-star"></i> Top Active Users
          <button class="refresh-btn" onclick="loadTopActiveUsers()">
            <i class="fas fa-sync-alt"></i>
          </button>
        </h3>
        <div class="analytics-list" id="topActiveUsersList">
          <div class="loading-spinner">Loading...</div>
        </div>
      </div>
      <div class="analytics-widget">
        <h3 class="widget-title">
          <i class="fas fa-chart-pie"></i> Role Activity Summary
          <button class="refresh-btn" onclick="loadRoleActivitySummary()">
            <i class="fas fa-sync-alt"></i>
          </button>
        </h3>
        <div class="analytics-list" id="roleActivitySummary">
          <div class="loading-spinner">Loading...</div>
        </div>
      </div>
    </div>
  </div>
  <div id="courses" class="section-content">
    <h2 class="section-title">Course Management</h2>
    <div style="display:flex; gap:10px; align-items:center; margin-bottom:12px; flex-wrap:wrap;">
      <input id="courseSearch" type="text" placeholder="Search title or code" style="padding:8px 12px; border:1px solid #ccc; border-radius:6px; min-width:220px;">
      <select id="courseStatusFilter" style="padding:8px 12px; border:1px solid #ccc; border-radius:6px;">
        <option value="">All Status</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>
      <button id="createCourseBtn" class="action-btn" style="background:#2196F3;color:#fff;">+ Create Course</button>
    </div>
    <div id="coursesTableWrapper" style="overflow-x:auto; min-height:120px;"></div>

    <!-- Create Course Modal -->
    <div id="createCourseModal" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.3); z-index:2150; align-items:center; justify-content:center;">
      <div style="background:#fff; padding:24px; border-radius:10px; max-width:460px; width:90%; margin:60px auto; position:relative;">
        <h3 style="margin-bottom:10px;">Create Course</h3>
        <form id="createCourseForm">
          <label style="display:block; font-size:13px; color:#555; margin-bottom:6px;">Course Code</label>
          <input type="text" id="createCourseCode" name="code" placeholder="e.g., CS101" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:8px;" required />
          <div style="height:8px"></div>
          <label style="display:block; font-size:13px; color:#555; margin-bottom:6px;">Course Title</label>
          <input type="text" id="createCourseTitle" name="title" placeholder="e.g., Introduction to Programming" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:8px;" required />
          <div id="createCourseError" class="error-message" style="margin-top:6px;"></div>
          <div style="display:flex; gap:8px; margin-top:12px; align-items:center;">
            <button type="submit" class="action-btn" style="background:#1d9b3e;color:#fff;">Create</button>
            <button type="button" class="action-btn" style="background:#6c757d;color:#fff;" onclick="document.getElementById('createCourseModal').style.display='none'">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Course Modal -->
    <div id="editCourseModal" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.3); z-index:2150; align-items:center; justify-content:center;">
      <div style="background:#fff; padding:24px; border-radius:10px; max-width:460px; width:90%; margin:60px auto; position:relative;">
        <h3 style="margin-bottom:10px;">Edit Course</h3>
        <form id="editCourseForm">
          <input type="hidden" id="editCourseId" name="id" />
          <label style="display:block; font-size:13px; color:#555; margin-bottom:6px;">Course Code</label>
          <input type="text" id="editCourseCode" name="code" placeholder="e.g., CS101" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:8px;" required />
          <div style="height:8px"></div>
          <label style="display:block; font-size:13px; color:#555; margin-bottom:6px;">Course Title</label>
          <input type="text" id="editCourseTitle" name="title" placeholder="e.g., Introduction to Programming" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:8px;" required />
          <div id="editCourseError" class="error-message" style="margin-top:6px;"></div>
          <div style="display:flex; gap:8px; margin-top:12px; align-items:center;">
            <button type="submit" class="action-btn" style="background:#1d9b3e;color:#fff;">Save</button>
            <button type="button" class="action-btn" style="background:#6c757d;color:#fff;" onclick="document.getElementById('editCourseModal').style.display='none'">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div id="assessments" class="section-content">
    <h2 class="section-title">Assessments</h2>
    <!-- Assessments content will go here -->
  </div>
  <!-- Reports Section - Hidden -->
  <div id="reports" class="section-content" style="display: none;">
    <h2 class="section-title">Reports</h2>
    <!-- Reports content will go here -->
  </div>
  <div id="audit" class="section-content">
    <h2 class="section-title">Audit Logs</h2>
    <!-- Filter Presets -->
    <div style="display:flex; gap:8px; align-items:center; margin-bottom:12px; flex-wrap:wrap;">
      <button id="auditFilterAll" class="audit-filter-btn active" data-action="">All Logs</button>
      <button id="auditFilterSecurity" class="audit-filter-btn" data-action="login">Security</button>
      <button id="auditFilterUsers" class="audit-filter-btn" data-action="user.">Users</button>
      <button id="auditFilterMaterials" class="audit-filter-btn" data-action="material.">Materials</button>
      <button id="auditFilterAuthIds" class="audit-filter-btn" data-action="auth_ids.">Authorized IDs</button>
      <button id="auditFilterToday" class="audit-filter-btn" data-date="today">Today</button>
      <button id="auditFilterWeek" class="audit-filter-btn" data-date="week">This Week</button>
    </div>
    
    <div style="display:flex; gap:10px; align-items:center; margin-bottom:12px; flex-wrap:wrap;">
      <input id="auditSearch" type="text" placeholder="Search action, entity, ID" style="padding:8px 12px; border:1px solid #ccc; border-radius:6px; min-width:220px;">
      <select id="auditAction" style="padding:8px 12px; border:1px solid #ccc; border-radius:6px;">
        <option value="">All Actions</option>
        <option value="user.">User actions</option>
        <option value="auth_ids.">Authorized IDs</option>
        <option value="material.">Materials</option>
      </select>
      <input id="auditUserId" type="number" placeholder="User ID" style="padding:8px 12px; border:1px solid #ccc; border-radius:6px; width:120px;">
      <input id="auditFrom" type="date" style="padding:8px 12px; border:1px solid #ccc; border-radius:6px;">
      <input id="auditTo" type="date" style="padding:8px 12px; border:1px solid #ccc; border-radius:6px;">
      <button id="auditRefresh" class="action-btn" style="background:#1d9b3e;color:#fff;">Refresh</button>
      <button id="auditExport" class="action-btn" style="background:#17a2b8;color:#fff;">Export CSV</button>
    </div>
    
    <!-- Pagination / Sorting Controls -->
    <div style="display:flex; gap:10px; align-items:center; margin-bottom:10px;">
      <label>Sort by
        <select id="auditSortBy" style="margin-left:6px; padding:4px 8px;">
          <option value="id">ID</option>
          <option value="created_at">Date</option>
          <option value="user_id">User ID</option>
          <option value="action">Action</option>
          <option value="entity_type">Entity Type</option>
          <option value="entity_id">Entity ID</option>
        </select>
      </label>
      <select id="auditSortDir" style="padding:4px 8px;">
        <option value="DESC">DESC</option>
        <option value="ASC">ASC</option>
      </select>
      <label style="margin-left:12px;">Page size
        <select id="auditPageSize" style="margin-left:6px; padding:4px 8px;">
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </label>
    </div>
    
    <div id="auditTableWrapper" style="overflow-x:auto; min-height: 120px;"></div>
    
    <!-- Pagination Controls -->
    <div id="auditPagination" style="display:flex;justify-content:space-between;align-items:center;margin-top:10px; display:none;">
      <div id="auditPaginationInfo" style="font-size:12px;color:#666;"></div>
      <div style="display:flex;gap:6px;align-items:center;">
        <button class="action-btn" id="auditPrevPage" disabled>Prev</button>
        <button class="action-btn" id="auditNextPage" disabled>Next</button>
      </div>
    </div>
  </div>
  
  <style>
  .audit-filter-btn {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 20px;
    background: #f8f9fa;
    color: #495057;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s ease;
  }
  .audit-filter-btn:hover {
    background: #e9ecef;
    border-color: #adb5bd;
  }
  .audit-filter-btn.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }
  .audit-filter-btn.active:hover {
    background: #0056b3;
    border-color: #0056b3;
  }
  </style>
  
  <div id="profile" class="section-content">
    <?php include 'includes/profile_section.php'; ?>
  </div>
  
  <div id="settings" class="section-content">
    <h2 class="section-title">System Settings</h2>
    
    <!-- Configuration Status Cards -->
    <div class="settings-overview" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
      <div class="config-card" style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #495057; display: flex; align-items: center; gap: 10px;">
          <i class="fas fa-envelope" style="color: #007bff;"></i>
          SMTP Configuration
        </h3>
        <div id="smtpStatus" style="margin-bottom: 15px;">
          <span class="status-indicator" style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #6c757d; margin-right: 8px;"></span>
          <span>Not tested</span>
        </div>
        <button id="testSmtpBtn" class="action-btn" style="background: #007bff; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">
          Test Connection
        </button>
      </div>
      
      <div class="config-card" style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #495057; display: flex; align-items: center; gap: 10px;">
          <i class="fas fa-code" style="color: #28a745;"></i>
          JDoodle API
        </h3>
        <div id="jdoodleStatus" style="margin-bottom: 15px;">
          <span class="status-indicator" style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #6c757d; margin-right: 8px;"></span>
          <span>Not tested</span>
        </div>
        <button id="testJDoodleBtn" class="action-btn" style="background: #28a745; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">
          Test Connection
        </button>
      </div>
      
      <div class="config-card" style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #495057; display: flex; align-items: center; gap: 10px;">
          <i class="fas fa-database" style="color: #17a2b8;"></i>
          Database
        </h3>
        <div id="dbStatus" style="margin-bottom: 15px;">
          <span class="status-indicator" style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #28a745; margin-right: 8px;"></span>
          <span>Connected</span>
        </div>
        <span style="color: #6c757d; font-size: 14px;">Database connection is active</span>
      </div>
    </div>
    
    <!-- Configuration Details -->
    <div class="config-details" style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px;">
      <h3 style="margin: 0 0 20px 0; color: #495057;">Current Configuration</h3>
      <div id="configDetails" style="font-family: monospace; font-size: 14px; line-height: 1.6;">
        <div style="margin-bottom: 10px;">
          <strong>SMTP Host:</strong> <span id="smtpHost">Loading...</span>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>SMTP Port:</strong> <span id="smtpPort">Loading...</span>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>SMTP Username:</strong> <span id="smtpUsername">Loading...</span>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>JDoodle Client ID:</strong> <span id="jdoodleClientId">Loading...</span>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>JDoodle Client Secret:</strong> <span id="jdoodleClientSecret">Loading...</span>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Database:</strong> <span id="dbName">Loading...</span>
        </div>
      </div>
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6;">
        <p style="color: #6c757d; margin: 0; font-size: 14px;">
          <i class="fas fa-info-circle" style="margin-right: 5px;"></i>
          Configuration is managed through environment variables. Contact your system administrator to modify settings.
        </p>
      </div>
    </div>

    <!-- Note moved to env.example for go-live steps -->
  </div>
</div>

<!-- Custom Confirmation Modal -->
<div id="confirmationModal" class="confirmation-modal" style="display: none;">
  <div class="confirmation-overlay"></div>
  <div class="confirmation-dialog">
    <div class="confirmation-header">
      <i class="fas fa-exclamation-triangle"></i>
      <h3 id="confirmationTitle">Confirm Action</h3>
    </div>
    <div class="confirmation-body">
      <p id="confirmationMessage">Are you sure you want to proceed?</p>
    </div>
    <div class="confirmation-actions">
      <button type="button" class="confirmation-btn confirmation-cancel" id="confirmationCancelBtn">
        <i class="fas fa-times"></i> Cancel
      </button>
      <button type="button" class="confirmation-btn confirmation-confirm" id="confirmationConfirmBtn">
        <i class="fas fa-check"></i> Confirm
      </button>
    </div>
  </div>
</div>

<?php require_once 'includes/footer.php'; ?>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0"></script>

