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

// Set session lifetime BEFORE starting session (must be before session_start)
ini_set('session.gc_maxlifetime', 7200); // 2 hours
@session_start();
// Update last activity to keep session alive
if (isset($_SESSION)) {
    $_SESSION['last_activity'] = time();
}
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
    <div class="users-header">
      <h2 class="section-title">User Management</h2>
      <div class="users-actions">
        <button onclick="document.getElementById('addUserModal').style.display='block'" class="users-btn users-btn-primary">
          <i class="fas fa-plus"></i> Add User
        </button>
      </div>
    </div>

    <!-- Tab Pills -->
    <div class="users-tabs-pills">
      <button id="tabUsers" class="users-tab-pill active">
        <i class="fas fa-users"></i> Users
      </button>
      <button id="tabUsersArchived" class="users-tab-pill">
        <i class="fas fa-archive"></i> Archived Users
      </button>
      <button id="tabAuthorized" class="users-tab-pill">
        <i class="fas fa-id-card"></i> Authorized IDs
      </button>
      <button id="tabAuthorizedArchived" class="users-tab-pill">
        <i class="fas fa-archive"></i> Archived IDs
      </button>
    </div>

    <!-- Quick Filter Pills - Simplified -->
    <div class="users-filters-pills">
      <button id="userFilterAll" class="users-filter-pill active" data-role="" data-status="">
        <i class="fas fa-list"></i> All
      </button>
      <button id="userFilterStudents" class="users-filter-pill" data-role="STUDENT" data-status="">
        <i class="fas fa-user-graduate"></i> Students
      </button>
      <button id="userFilterTeachers" class="users-filter-pill" data-role="TEACHER" data-status="">
        <i class="fas fa-chalkboard-teacher"></i> Teachers
      </button>
      <button id="userFilterCoordinators" class="users-filter-pill" data-role="COORDINATOR" data-status="">
        <i class="fas fa-user-tie"></i> Coordinators
      </button>
      <button id="userFilterAdmins" class="users-filter-pill" data-role="ADMIN" data-status="">
        <i class="fas fa-user-shield"></i> Admins
      </button>
    </div>

    <!-- Search and Filters - Simplified -->
    <div class="users-filters-advanced">
      <form id="userFilterForm" method="get" onsubmit="return false;" style="display: contents;">
        <input type="hidden" name="section" value="users" />
        <div class="users-filter-group">
          <i class="fas fa-search"></i>
          <input id="userSearchInput" type="text" name="search" placeholder="Search user..." value="<?= htmlspecialchars($search) ?>" class="users-input">
        </div>
        <div class="users-filter-group">
          <i class="fas fa-user-tag"></i>
          <select id="userRoleSelect" name="role" class="users-select">
            <option value="">All Roles</option>
            <?php foreach ($roles as $role): $label = ucfirst(strtolower($role)); ?>
              <option value="<?= htmlspecialchars($role) ?>" <?= $role_filter === $role ? 'selected' : '' ?>><?= htmlspecialchars($label) ?></option>
            <?php endforeach; ?>
          </select>
        </div>
        <div class="users-filter-group">
          <i class="fas fa-info-circle"></i>
          <select id="userStatusSelect" name="status" class="users-select">
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </form>
    </div>

    <!-- User Counts and Sorting - Simplified -->
    <div class="users-controls-bar">
      <div class="users-stats">
        <div class="users-stat-badge active">
          <i class="fas fa-check-circle"></i>
          <span id="activeUsersCount">0</span> Active
        </div>
        <div class="users-stat-badge archived">
          <i class="fas fa-archive"></i>
          <span id="archivedUsersCount">0</span> Archived
        </div>
      </div>
      <div class="users-sorting">
        <select id="userSortBy" class="users-select-small">
          <option value="firstname">Sort: First name</option>
          <option value="lastname">Sort: Last name</option>
          <option value="email">Sort: Email</option>
          <option value="role">Sort: Role</option>
          <option value="status">Sort: Status</option>
        </select>
        <select id="userSortDir" class="users-select-small">
          <option value="ASC">↑ Asc</option>
          <option value="DESC">↓ Desc</option>
        </select>
        <select id="userPageSize" class="users-select-small">
          <option value="10">10/page</option>
          <option value="20">20/page</option>
          <option value="50">50/page</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div id="usersLoading" class="users-loading" style="display: none;">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Loading users...</span>
    </div>

    <!-- Table Wrapper -->
    <div id="userTableWrapper" class="users-table-wrapper"></div>
    <div id="authIdsWrapper" class="users-table-wrapper" style="display:none;"></div>

    <!-- Pagination -->
    <div id="userPagination" class="users-pagination" style="display:none;">
      <div id="userPaginationInfo" class="users-pagination-info"></div>
      <div class="users-pagination-controls">
        <button class="users-btn users-btn-small" id="userPrevPage" disabled>
          <i class="fas fa-chevron-left"></i> Prev
        </button>
        <button class="users-btn users-btn-small" id="userNextPage" disabled>
          Next <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

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
  <!-- Reports Section -->
  <div id="reports" class="section-content" style="display: none;">
    <?php include 'includes/reports_section.php'; ?>
  </div>
  <div id="audit" class="section-content">
    <div class="audit-header">
      <h2 class="section-title">Audit Logs</h2>
      <div class="audit-actions">
        <button id="auditRefresh" class="audit-btn audit-btn-primary">
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
        <button id="auditExport" class="audit-btn audit-btn-secondary">
          <i class="fas fa-download"></i> Export CSV
        </button>
      </div>
    </div>

    <!-- Quick Filter Pills -->
    <div class="audit-filters-pills">
      <button id="auditFilterAll" class="audit-filter-pill active" data-action="">
        <i class="fas fa-list"></i> All Logs
      </button>
      <button id="auditFilterSecurity" class="audit-filter-pill" data-action="login">
        <i class="fas fa-shield-alt"></i> Security
      </button>
      <button id="auditFilterUsers" class="audit-filter-pill" data-action="user.">
        <i class="fas fa-users"></i> Users
      </button>
      <button id="auditFilterMaterials" class="audit-filter-pill" data-action="material.">
        <i class="fas fa-book"></i> Materials
      </button>
      <button id="auditFilterAuthIds" class="audit-filter-pill" data-action="auth_ids.">
        <i class="fas fa-id-card"></i> Authorized IDs
      </button>
      <button id="auditFilterToday" class="audit-filter-pill" data-date="today">
        <i class="fas fa-calendar-day"></i> Today
      </button>
      <button id="auditFilterWeek" class="audit-filter-pill" data-date="week">
        <i class="fas fa-calendar-week"></i> This Week
      </button>
    </div>

    <!-- Advanced Filters -->
    <div class="audit-filters-advanced">
      <div class="audit-filter-group">
        <i class="fas fa-search"></i>
        <input id="auditSearch" type="text" placeholder="Search action, entity, ID..." class="audit-input">
      </div>
      <div class="audit-filter-group">
        <i class="fas fa-filter"></i>
        <select id="auditAction" class="audit-select">
          <option value="">All Actions</option>
          <option value="user.">User Actions</option>
          <option value="auth_ids.">Authorized IDs</option>
          <option value="material.">Materials</option>
        </select>
      </div>
      <div class="audit-filter-group">
        <i class="fas fa-user"></i>
        <input id="auditUserId" type="number" placeholder="User ID" class="audit-input audit-input-small">
      </div>
      <div class="audit-filter-group">
        <i class="fas fa-calendar-alt"></i>
        <input id="auditFrom" type="date" class="audit-input audit-input-small">
        <span style="margin: 0 8px; color: #6b7280;">to</span>
        <input id="auditTo" type="date" class="audit-input audit-input-small">
      </div>
    </div>

    <!-- Sorting Controls -->
    <div class="audit-sorting">
      <div class="audit-sort-group">
        <label><i class="fas fa-sort"></i> Sort by</label>
        <select id="auditSortBy" class="audit-select-small">
          <option value="id">ID</option>
          <option value="created_at">Date</option>
          <option value="user_id">User ID</option>
          <option value="action">Action</option>
          <option value="entity_type">Entity Type</option>
          <option value="entity_id">Entity ID</option>
        </select>
      </div>
      <div class="audit-sort-group">
        <select id="auditSortDir" class="audit-select-small">
          <option value="DESC">Descending</option>
          <option value="ASC">Ascending</option>
        </select>
      </div>
      <div class="audit-sort-group">
        <label>Page size</label>
        <select id="auditPageSize" class="audit-select-small">
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div id="auditLoading" class="audit-loading" style="display: none;">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Loading audit logs...</span>
    </div>

    <!-- Table Wrapper -->
    <div id="auditTableWrapper" class="audit-table-wrapper"></div>
    
    <!-- Pagination -->
    <div id="auditPagination" class="audit-pagination" style="display:none;">
      <div id="auditPaginationInfo" class="audit-pagination-info"></div>
      <div class="audit-pagination-controls">
        <button class="audit-btn audit-btn-small" id="auditPrevPage" disabled>
          <i class="fas fa-chevron-left"></i> Prev
        </button>
        <button class="audit-btn audit-btn-small" id="auditNextPage" disabled>
          Next <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
  <div id="backup" class="section-content" style="display:none;">
    <div class="backup-hero">
      <div>
        <h2 class="section-title">System Backup & Recovery</h2>
        <p class="backup-subtitle">
          Generate on-demand database snapshots and keep copies on your server for disaster recovery.
        </p>
      </div>
      <div class="backup-actions">
        <button id="backupCreateBtn" class="backup-btn primary">
          <i class="fas fa-hdd"></i>
          Generate Backup
        </button>
        <button id="backupRefreshBtn" class="backup-btn ghost">
          <i class="fas fa-sync-alt"></i>
          Refresh List
        </button>
      </div>
    </div>
    <div id="backupAlert" class="backup-alert" style="display:none;"></div>
    <div class="backup-grid">
      <div class="backup-card">
        <h4><i class="fas fa-database"></i> Database</h4>
        <p id="backupDbName" class="backup-card-value">—</p>
        <span class="backup-card-note">Active schema</span>
      </div>
      <div class="backup-card">
        <h4><i class="fas fa-folder-open"></i> Backup Folder</h4>
        <p id="backupDirectory" class="backup-card-value">storage/backups</p>
        <span class="backup-card-note">Server path</span>
      </div>
      <div class="backup-card">
        <h4><i class="fas fa-save"></i> Stored Backups</h4>
        <p class="backup-card-value">
          <span id="backupCount">0</span>
          <small id="backupTotalSize">0 B total</small>
        </p>
        <span class="backup-card-note">Auto-sorted newest first</span>
      </div>
      <div class="backup-card">
        <h4><i class="fas fa-clock"></i> Last Backup</h4>
        <p id="backupLastRun" class="backup-card-value">No backups yet</p>
        <span class="backup-card-note" id="backupLastFileNote">—</span>
      </div>
    </div>
    <div class="backup-table-wrapper">
      <div id="backupLoading" class="backup-loading" style="display:none;">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Processing backup...</span>
      </div>
      <table class="backup-table">
        <thead>
          <tr>
            <th>Filename</th>
            <th>Created</th>
            <th>Size</th>
            <th>Type</th>
            <th style="width: 140px;">Actions</th>
          </tr>
        </thead>
        <tbody id="backupTableBody">
          <tr>
            <td colspan="5" class="backup-empty">
              <i class="fas fa-archive"></i>
              No backups yet. Click "Generate Backup" to create the first snapshot.
            </td>
          </tr>
        </tbody>
      </table>
      <p class="backup-footnote">
        <i class="fas fa-info-circle"></i>
        Backups contain the full database structure and data. Store a copy off-site to stay safe.
      </p>
    </div>
  </div>
 
  <style>
  /* Audit Logs Modern Styling */
  .audit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #e5e7eb;
  }

  .audit-actions {
    display: flex;
    gap: 10px;
  }

  .audit-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .audit-btn-primary {
    background: var(--color-primary-strong, #1d9b3e);
    color: white;
  }

  .audit-btn-primary:hover {
    background: var(--color-primary-alt, #168a36);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(29, 155, 62, 0.3);
  }

  .audit-btn-secondary {
    background: var(--color-info, #17a2b8);
    color: white;
  }

  .audit-btn-secondary:hover {
    background: var(--color-info-alt, #138496);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(23, 162, 184, 0.3);
  }

  .audit-btn-small {
    padding: 6px 12px;
    font-size: 13px;
  }

  .audit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .audit-filters-pills {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 20px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
  }

  .audit-filter-pill {
    padding: 8px 16px;
    border: 1px solid #d1d5db;
    border-radius: 20px;
    background: white;
    color: #6b7280;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .audit-filter-pill:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
    transform: translateY(-1px);
  }

  .audit-filter-pill.active {
    background: var(--color-primary-strong, #1d9b3e);
    color: white;
    border-color: var(--color-primary-strong, #1d9b3e);
    box-shadow: 0 2px 4px rgba(29, 155, 62, 0.3);
  }

  .audit-filter-pill.active:hover {
    background: var(--color-primary-alt, #168a36);
    border-color: var(--color-primary-alt, #168a36);
  }

  .audit-filters-advanced {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 16px;
    padding: 16px;
    background: white;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
  }

  .audit-filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 200px;
  }

  .audit-filter-group i {
    color: #6b7280;
    font-size: 14px;
  }

  .audit-input, .audit-select {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .audit-input:focus, .audit-select:focus {
    outline: none;
    border-color: var(--color-primary-strong, #1d9b3e);
    box-shadow: 0 0 0 3px rgba(29, 155, 62, 0.1);
  }

  .audit-input-small {
    min-width: 140px;
    flex: 0 0 auto;
  }

  .audit-sorting {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: #f9fafb;
    border-radius: 8px;
  }

  .audit-sort-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .audit-sort-group label {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .audit-select-small {
    padding: 6px 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
  }

  .audit-loading {
    text-align: center;
    padding: 40px;
    color: #6b7280;
  }

  .audit-loading i {
    font-size: 24px;
    margin-right: 12px;
    color: var(--color-primary-strong, #1d9b3e);
  }

  .audit-table-wrapper {
    background: white;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
    min-height: 200px;
  }

  .audit-table-wrapper table {
    width: 100%;
    border-collapse: collapse;
  }

  .audit-table-wrapper thead {
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
  }

  .audit-table-wrapper th {
    padding: 14px 16px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .audit-table-wrapper th.sortable {
    cursor: pointer;
    user-select: none;
    transition: background 0.2s ease;
  }

  .audit-table-wrapper th.sortable:hover {
    background: #f3f4f6;
  }

  .audit-table-wrapper .sort-arrow {
    margin-left: 6px;
    color: var(--color-primary-strong, #1d9b3e);
    font-size: 12px;
  }

  .audit-table-wrapper tbody tr {
    border-bottom: 1px solid #f3f4f6;
    transition: background 0.2s ease;
  }

  .audit-table-wrapper tbody tr:hover {
    background: #f9fafb;
  }

  .audit-table-wrapper tbody tr:last-child {
    border-bottom: none;
  }

  .audit-table-wrapper td {
    padding: 14px 16px;
    font-size: 14px;
    color: #374151;
  }

  .audit-action-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    text-transform: lowercase;
  }

  .audit-action-badge.auth { background: var(--color-lightblue, #e3f2fd); color: var(--color-blue-dark, #1976d2); }
  .audit-action-badge.user { background: var(--color-warning-light, #ffeb3b); color: var(--color-warning, #ffc107); }
  .audit-action-badge.material { background: var(--color-lightgreen, #e8f5e8); color: var(--color-primary-deep, #07522A); }
  .audit-action-badge.auth_ids { background: #e9d5ff; color: #6b21a8; }

  .audit-entity-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    background: #f3f4f6;
    color: #4b5563;
  }

  .audit-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
  }

  .audit-pagination-info {
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
  }

  .audit-pagination-controls {
    display: flex;
    gap: 8px;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #9ca3af;
  }

  .empty-state i {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-state p {
    font-size: 16px;
    margin: 0;
  }

  /* User Management Modern Styling (matching Audit Logs) */
  .users-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid var(--color-border-soft, #e5e7eb);
  }

  .users-actions {
    display: flex;
    gap: 10px;
  }

  .users-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .users-btn-primary {
    background: var(--color-primary-strong, #1d9b3e);
    color: white;
  }

  .users-btn-primary:hover {
    background: var(--color-primary-alt, #168a36);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(29, 155, 62, 0.3);
  }

  .users-btn-secondary {
    background: var(--color-info, #17a2b8);
    color: white;
  }

  .users-btn-secondary:hover {
    background: var(--color-info-alt, #138496);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(23, 162, 184, 0.3);
  }

  .users-btn-small {
    padding: 6px 12px;
    font-size: 13px;
  }

  .users-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .users-tabs-pills {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 12px;
    padding: 8px;
    background: var(--color-surface-muted, #f9fafb);
    border-radius: 8px;
  }

  .users-tab-pill {
    padding: 6px 12px;
    border: 1px solid var(--color-border, #d1d5db);
    border-radius: 6px;
    background: white;
    color: var(--color-text-muted, #6b7280);
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .users-tab-pill:hover {
    background: var(--color-surface-soft, #f3f4f6);
    border-color: var(--color-primary-strong, #1d9b3e);
  }

  .users-tab-pill.active {
    background: var(--color-primary-strong, #1d9b3e);
    color: white;
    border-color: var(--color-primary-strong, #1d9b3e);
  }

  .users-tab-pill.active:hover {
    background: var(--color-primary-alt, #168a36);
    border-color: var(--color-primary-alt, #168a36);
  }

  .users-filters-pills {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 12px;
    padding: 10px;
    background: var(--color-surface-muted, #f9fafb);
    border-radius: 8px;
  }

  .users-filter-pill {
    padding: 6px 12px;
    border: 1px solid var(--color-border, #d1d5db);
    border-radius: 6px;
    background: white;
    color: var(--color-text-muted, #6b7280);
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .users-filter-pill:hover {
    background: var(--color-surface-soft, #f3f4f6);
    border-color: var(--color-primary-strong, #1d9b3e);
  }

  .users-filter-pill.active {
    background: var(--color-primary-strong, #1d9b3e);
    color: white;
    border-color: var(--color-primary-strong, #1d9b3e);
  }

  .users-filter-pill.active:hover {
    background: var(--color-primary-alt, #168a36);
    border-color: var(--color-primary-alt, #168a36);
  }

  .users-filters-advanced {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 12px;
    padding: 12px;
    background: var(--color-surface, white);
    border-radius: 8px;
    border: 1px solid var(--color-border-soft, #e5e7eb);
  }

  .users-filter-group {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 180px;
  }

  .users-filter-group i {
    color: var(--color-text-muted, #6b7280);
    font-size: 13px;
  }

  .users-input, .users-select {
    flex: 1;
    padding: 8px 10px;
    border: 1px solid var(--color-border, #d1d5db);
    border-radius: 6px;
    font-size: 13px;
    transition: all 0.15s ease;
  }

  .users-input:focus, .users-select:focus {
    outline: none;
    border-color: var(--color-primary-strong, #1d9b3e);
    box-shadow: 0 0 0 2px rgba(29, 155, 62, 0.1);
  }

  .users-input-small {
    min-width: 120px;
    flex: 0 0 auto;
  }

  .users-controls-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: var(--color-surface-muted, #f9fafb);
    border-radius: 8px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .users-stats {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .users-stat-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    background: var(--color-surface, white);
    border: 1px solid var(--color-border-soft, #e5e7eb);
  }

  .users-stat-badge.active {
    background: var(--color-lightgreen, #e8f5e8);
    color: var(--color-primary-deep, #07522A);
    border-color: var(--color-primary, #28a745);
  }

  .users-stat-badge.archived {
    background: var(--color-surface-muted, #f9fafb);
    color: var(--color-text-muted, #6b7280);
  }

  .users-stat-badge i {
    font-size: 14px;
  }

  .users-stat-badge span {
    font-weight: 600;
    font-size: 14px;
  }

  .users-sorting {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .users-sort-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .users-sort-group label {
    font-size: 13px;
    color: var(--color-text-muted, #6b7280);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .users-select-small {
    padding: 5px 8px;
    border: 1px solid var(--color-border, #d1d5db);
    border-radius: 5px;
    font-size: 12px;
    background: white;
    cursor: pointer;
  }

  .users-select-small:hover {
    border-color: var(--color-primary-strong, #1d9b3e);
  }

  .users-loading {
    text-align: center;
    padding: 40px;
    color: var(--color-text-muted, #6b7280);
  }

  .users-loading i {
    font-size: 24px;
    margin-right: 12px;
    color: var(--color-primary-strong, #1d9b3e);
  }

  .users-table-wrapper {
    background: var(--color-surface, white);
    border-radius: 10px;
    border: 1px solid var(--color-border-soft, #e5e7eb);
    overflow: hidden;
    min-height: 200px;
  }

  .users-table-wrapper table {
    width: 100%;
    border-collapse: collapse;
  }

  .users-table-wrapper thead {
    background: var(--color-surface-muted, #f9fafb);
    border-bottom: 2px solid var(--color-border-soft, #e5e7eb);
  }

  .users-table-wrapper th {
    padding: 14px 16px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text, #374151);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .users-table-wrapper th.sortable {
    cursor: pointer;
    user-select: none;
    transition: background 0.2s ease;
  }

  .users-table-wrapper th.sortable:hover {
    background: var(--color-surface-soft, #f3f4f6);
  }

  .users-table-wrapper .sort-arrow {
    margin-left: 6px;
    color: var(--color-primary-strong, #1d9b3e);
    font-size: 12px;
  }

  .users-table-wrapper tbody tr {
    border-bottom: 1px solid var(--color-border-soft, #f3f4f6);
    transition: background 0.2s ease;
  }

  .users-table-wrapper tbody tr:hover {
    background: var(--color-surface-muted, #f9fafb);
  }

  .users-table-wrapper tbody tr:last-child {
    border-bottom: none;
  }

  .users-table-wrapper td {
    padding: 14px 16px;
    font-size: 14px;
    color: var(--color-text, #374151);
  }

  .users-role-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;
  }

  .users-role-badge.student { background: var(--color-lightgreen, #e8f5e8); color: var(--color-primary-deep, #07522A); }
  .users-role-badge.teacher { background: var(--color-lightorange, #fff3e0); color: var(--color-orange, #f57c00); }
  .users-role-badge.coordinator { background: #e9ecef; color: #495057; }
  .users-role-badge.admin { background: #fee2e2; color: #991b1b; }

  .users-status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .users-status-badge.active { background: var(--color-lightgreen, #e8f5e8); color: var(--color-primary-deep, #07522A); }
  .users-status-badge.archived { background: #e9ecef; color: #6c757d; }

  .users-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding: 16px;
    background: var(--color-surface-muted, #f9fafb);
    border-radius: 8px;
  }

  .users-pagination-info {
    font-size: 14px;
    color: var(--color-text-muted, #6b7280);
    font-weight: 500;
  }

  .users-pagination-controls {
    display: flex;
    gap: 8px;
  }
  /* Backup Section */
  #backup.section-content {
    display: none;
  }
  .backup-hero {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .backup-subtitle {
    margin: 8px 0 0;
    color: #6b7280;
    max-width: 560px;
  }
  .backup-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .backup-btn {
    border: none;
    border-radius: 10px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
  }
  .backup-btn.primary {
    background: #1d9b3e;
    color: #fff;
  }
  .backup-btn.primary:hover {
    background: #168a36;
    box-shadow: 0 6px 16px rgba(29, 155, 62, 0.25);
  }
  .backup-btn.ghost {
    background: transparent;
    border: 1px solid #d1d5db;
    color: #374151;
  }
  .backup-btn.ghost:hover {
    border-color: #1d9b3e;
    color: #1d9b3e;
  }
  .backup-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
  .backup-alert {
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 20px;
    font-weight: 500;
  }
  .backup-alert.success {
    background: #e8f5e8;
    color: #065f46;
    border: 1px solid #34d399;
  }
  .backup-alert.error {
    background: #fef2f2;
    color: #991b1b;
    border: 1px solid #f87171;
  }
  .backup-alert.info {
    background: #eff6ff;
    color: #1e40af;
    border: 1px solid #60a5fa;
  }
  .backup-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }
  .backup-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 18px;
  }
  .backup-card h4 {
    margin: 0 0 10px 0;
    color: #374151;
    font-size: 15px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .backup-card-value {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #111827;
  }
  .backup-card-value small {
    font-size: 12px;
    font-weight: 500;
    color: #6b7280;
    margin-left: 6px;
  }
  .backup-card-note {
    font-size: 12px;
    color: #9ca3af;
  }
  .backup-table-wrapper {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 0;
    overflow: hidden;
  }
  .backup-loading {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 18px;
    border-bottom: 1px solid #f3f4f6;
    color: #1d9b3e;
    font-weight: 500;
  }
  .backup-table {
    width: 100%;
    border-collapse: collapse;
  }
  .backup-table th,
  .backup-table td {
    padding: 14px 18px;
    text-align: left;
  }
  .backup-table thead {
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }
  .backup-table tbody tr + tr {
    border-top: 1px solid #f3f4f6;
  }
  .backup-empty {
    text-align: center;
    padding: 50px 20px;
    color: #9ca3af;
  }
  .backup-empty i {
    display: block;
    font-size: 36px;
    margin-bottom: 10px;
  }
  .backup-empty.error {
    color: #b91c1c;
  }
  .backup-actions-cell {
    display: flex;
    gap: 8px;
  }
  .backup-action-btn {
    border: none;
    border-radius: 8px;
    padding: 8px 12px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s ease;
  }
  .backup-action-btn.download {
    background: #1d4ed8;
    color: #fff;
  }
  .backup-action-btn.download:hover {
    background: #1e40af;
  }
  .backup-action-btn.delete {
    background: #fee2e2;
    color: #b91c1c;
  }
  .backup-action-btn.delete:hover {
    background: #fecaca;
  }
  .backup-footnote {
    margin: 0;
    padding: 14px 18px;
    font-size: 13px;
    color: #6b7280;
    background: #f9fafb;
    border-top: 1px solid #e5e7eb;
  }
  .backup-footnote i {
    margin-right: 6px;
    color: #2563eb;
  }
  @media (max-width: 640px) {
    .backup-actions {
      width: 100%;
    }
    .backup-actions .backup-btn {
      flex: 1;
      justify-content: center;
    }
    .backup-table th,
    .backup-table td {
      padding: 10px 12px;
    }
    .backup-actions-cell {
      flex-direction: column;
    }
    .backup-action-btn {
      width: 100%;
      justify-content: center;
    }
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
<script src="assets/js/reports_module.js?v=<?php echo time(); ?>"></script>

