<?php
/**
 * COORDINATOR DASHBOARD
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
require_once __DIR__ . '/classes/ProfileService.php';

// Use original auth system
Auth::requireAuth();
Auth::requireRole('coordinator');
$lastname = $_SESSION['user_lastname'] ?? '';
$firstname = $_SESSION['user_firstname'] ?? '';
$middlename = $_SESSION['user_middlename'] ?? '';
$middle_initial = $middlename ? strtoupper(mb_substr(trim($middlename), 0, 1)) . '.' : '';
$user_name = trim($lastname . ', ' . $firstname . ' ' . $middle_initial);
if (!$user_name || $user_name === ',') $user_name = 'Coordinator';
$user_role = $_SESSION['user_role'] ?? 'COORDINATOR';

// Load profile from DB for accurate details & photo
$db = (new Database())->getConnection();
$profileService = new ProfileService($db);
$userProfile = $profileService->getUserProfile($_SESSION['user_id']);
$profilePhotoUrl = $profileService->getProfilePhotoUrl($_SESSION['user_id']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Coordinator Dashboard - Interactive Learning Management System</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
  <!-- Shared UI Styles -->
  <link rel="stylesheet" href="assets/css/admin_panel.css">
  <!-- Font Awesome - Load after admin_panel.css to ensure it takes precedence -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
  <!-- Coordinator-specific Styles -->
  <link rel="stylesheet" href="assets/css/coordinator.css?v=<?php echo time(); ?>">
</head>
<body>
  
  <!-- Header (match Teacher/Admin exactly) -->
  <div class="header">
    <div class="logo">
      <img src="Photos/CodeRegal.svg" alt="CodeRegal" style="height: 80px; width: auto;">
    </div>
    <div class="settings">
      <div class="badge"><?php echo strtoupper(htmlspecialchars($user_role)); ?></div>
      <div><i class="fas fa-moon" id="themeToggle" style="cursor:pointer;"></i></div>
      <div class="dropdown">
        <i class="fas fa-cog settings-icon" id="settingsIcon"></i>
        <div id="settingsDropdown" class="settings-dropdown">
          <a href="logout.php" class="dropdown-item logout-item">
            <i class="fas fa-sign-out-alt"></i> Logout
          </a>
        </div>
      </div>
    </div>
  </div>

  <?php require_once 'includes/sidebar_coordinator.php'; ?>
 
  <div class="main-content" id="mainContent">
    <div id="dashboard" class="section-content active">
      <h2 class="section-title">Dashboard</h2>
            <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-user-graduate"></i></div>
          <h3>Total Students</h3>
          <div class="number" id="coordTotalStudents">0</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-chalkboard-teacher"></i></div>
          <h3>Total Teachers</h3>
          <div class="number" id="coordTotalTeachers">0</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-book-open"></i></div>
          <h3>Active Courses</h3>
          <div class="number" id="coordActiveCourses">0</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-pencil-alt"></i></div>
          <h3>Draft Courses</h3>
          <div class="number" id="coordDraftCourses">0</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-upload"></i></div>
          <h3>Materials Uploaded</h3>
          <div class="number" id="coordMaterialsUploaded">0</div>
        </div>
      </div>

      <div class="dashboard-widgets" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
        <!-- Recently Registered -->
        <div class="widget-panel">
          <h3 class="widget-title"><i class="fas fa-user-plus"></i> Recently Registered (Students & Teachers)</h3>
          <div class="activity-list" id="coordRecentlyRegistered">
            <div class="loading-spinner">Loading...</div>
          </div>
        </div>
        <!-- Recently Login -->
        <div class="widget-panel">
          <h3 class="widget-title"><i class="fas fa-sign-in-alt"></i> Recently Login (Students & Teachers)</h3>
          <div class="activity-list" id="coordRecentlyLogin">
            <div class="loading-spinner">Loading...</div>
          </div>
        </div>
      </div>
    </div>

    <div id="courses" class="section-content">
      <h2 class="section-title">Courses</h2>
      <div class="course-controls">
        <input id="courseSearch" type="text" placeholder="Search title or code" class="course-search">
        <select id="courseStatusFilter" class="course-filter">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <button id="createCourseBtn" class="coordinator-create-course-btn">+ Create Course</button>
      </div>
      <div id="coursesTableWrapper" style="overflow-x:auto; min-height:120px;"></div>
  </div>

    <div id="uploads" class="section-content">
      <h2 class="section-title">Uploads</h2>
      <div class="widget-panel">
        <div class="course-controls">
          <input type="text" id="uploadsSearch" class="course-search" placeholder="Search filename, lesson, course">
          <select id="uploadsFilter" class="course-filter">
            <option value="">All Types</option>
            <option value="pdf">PDF</option>
            <option value="video">Video</option>
            <option value="file">File</option>
            <option value="code">Code</option>
            <option value="link">Link</option>
          </select>
        </div>
        <h3 class="widget-title"><i class="fas fa-upload"></i> Materials</h3>
        <div class="activity-list" id="uploadsList">
          <div class="loading-spinner">Loading...</div>
        </div>
      </div>
    </div>

    <div id="archiveCoord" class="section-content">
      <h2 class="section-title">Archive</h2>
      <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
        <button id="tabArchiveMaterials" class="action-btn" style="background:#1d9b3e;color:#fff;">Materials</button>
        <button id="tabArchiveCourses" class="action-btn" style="background:#6c757d;color:#fff;">Courses</button>
      </div>
      <div id="archiveMaterials" class="widget-panel" style="display:block;">
        <h3 class="widget-title"><i class="fas fa-archive"></i> Archived Materials</h3>
        <div class="activity-list" id="archiveMaterialsList">
          <div class="loading-spinner">Loading...</div>
        </div>
      </div>
      <div id="archiveCourses" class="widget-panel" style="display:none;">
        <h3 class="widget-title"><i class="fas fa-archive"></i> Archived Courses</h3>
        <div class="activity-list" id="archiveCoursesList">
          <div class="loading-spinner">Loading...</div>
        </div>
      </div>
    </div>

    <div id="importExport" class="section-content">
      <h2 class="section-title">Import/Export</h2>
      <p style="color:#555;">Bulk import/export of course content. Coming next.</p>
    </div>

    <div id="profile" class="section-content">
      <?php include 'includes/profile_section.php'; ?>
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
 
  <!-- Load shared UI script (loads admin_panel.js) -->
  <script src="assets/js/app_ui.js"></script>
  <!-- Unified Notification System - Load BEFORE other scripts -->
  <script src="assets/js/notification_system.js?v=<?php echo time(); ?>"></script>
  <!-- Load shared profile and coordinator scripts -->
  <script src="assets/js/shared_profile.js?v=<?php echo time(); ?>"></script>
  <script>window.__CR_COORDINATOR_V2 = true;</script>
  <script src="assets/js/coordinator.js?v=<?php echo time(); ?>"></script>
  <script>
    // Initialize coordinator dashboard when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
      console.log('🔄 Initializing Coordinator Dashboard...');
      
      // Initialize coordinator tabs
      if (typeof initCoordinatorTabs === 'function') {
        initCoordinatorTabs();
        console.log('✅ Coordinator tabs initialized');
      } else {
        console.error('❌ initCoordinatorTabs not available');
      }
      
      // Initialize coordinator settings
      if (typeof initCoordinatorSettings === 'function') {
        initCoordinatorSettings();
        console.log('✅ Coordinator settings initialized');
      } else {
        console.error('❌ initCoordinatorSettings not available');
      }
      
      // Initialize shared profile
      if (typeof initSharedProfile === 'function') {
        initSharedProfile();
        console.log('✅ Coordinator Dashboard initialized');
      } else {
        console.error('❌ initSharedProfile not available');
      }
      
      // Test if action button functions are available
      console.log('🔍 Testing action button functions:');
      console.log('editCourse:', typeof editCourse);
      console.log('viewOutline:', typeof viewOutline);
      console.log('publishCourse:', typeof publishCourse);
      console.log('archiveCourse:', typeof archiveCourse);
      console.log('deleteCourse:', typeof deleteCourse);
    });
  </script>
</body>
</html> 