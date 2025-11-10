<?php
/**
 * STUDENT DASHBOARD - MIRROR DESIGN OF OTHER ROLES
 * Using exact same design as teacher/coordinator/admin dashboards
 */

// Configure session cookie parameters
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => '',
    'secure' => false,
    'httponly' => false,
    'samesite' => 'Lax'
]);

session_start();
require_once 'config.php';
require_once 'classes/auth_helpers.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/ProfileService.php';
require_once __DIR__ . '/classes/ClassEnrollmentService.php';

// Use original auth system
Auth::requireAuth();
Auth::requireRole('student');

// Get user profile data
$db = (new Database())->getConnection();
$profileService = new ProfileService($db);
$userProfile = $profileService->getUserProfile($_SESSION['user_id']);
$profilePhotoUrl = $profileService->getProfilePhotoUrl($_SESSION['user_id']);

// Get user's enrolled classes directly in PHP
$enrollmentService = new ClassEnrollmentService($db);
$enrollmentService->setStudent($_SESSION['user_id'], $_SESSION['user_role']);
$enrolledClasses = $enrollmentService->getStudentClasses();

// Format classes for display
$formattedClasses = [];
foreach ($enrolledClasses as $class) {
    $teacherName = trim($class['teacher_firstname'] . ' ' . $class['teacher_lastname']);
    if ($class['teacher_middlename']) {
        $middleInitial = strtoupper(substr(trim($class['teacher_middlename']), 0, 1)) . '.';
        $teacherName = trim($class['teacher_firstname'] . ' ' . $middleInitial . ' ' . $class['teacher_lastname']);
    }
    
    // Add "Prof." prefix to teacher name
    $teacherName = $teacherName ? 'Prof. ' . $teacherName : 'Unknown Teacher';
    
    $formattedClasses[] = [
        'id' => $class['id'],
        'name' => $class['class_name'],
        'code' => $class['class_code'],
        'teacher_name' => $teacherName,
        'student_count' => (int)$class['student_count'],
        'created_at' => $class['created_at']
    ];
}

// Get user name
$lastname = $_SESSION['user_lastname'] ?? '';
$firstname = $_SESSION['user_firstname'] ?? '';
$middlename = $_SESSION['user_middlename'] ?? '';
$middle_initial = $middlename ? strtoupper(mb_substr(trim($middlename), 0, 1)) . '.' : '';
$user_name = trim($lastname . ', ' . $firstname . ' ' . $middle_initial);
if (!$user_name || $user_name === ',') $user_name = 'Student';
$user_role = $_SESSION['user_role'] ?? 'STUDENT';

// Handle section parameter from URL
$current_section = $_GET['section'] ?? 'myclasses';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Student Dashboard - Interactive Learning Management System</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
  <!-- Shared UI Styles -->
  <link rel="stylesheet" href="assets/css/admin_panel.css">
  <!-- Font Awesome - Load after admin_panel.css to ensure it takes precedence -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
  <!-- Student-specific Styles -->
  <link rel="stylesheet" href="assets/css/student_dashboard.css">
  <!-- Shared Play Area styles -->
  <link rel="stylesheet" href="assets/css/play_area.css">
</head>
<body class="student-dashboard">
  <!-- Header (match Teacher/Coordinator/Admin exactly) -->
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

  <!-- Mobile Menu Toggle (separate from header) -->
  <button class="menu-toggle" onclick="toggleSidebar()" style="position: fixed; top: 20px; left: 20px; z-index: 1000; background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 8px; cursor: pointer; display: none;">
    <i class="fas fa-bars"></i>
  </button>

  <!-- Sidebar -->
  <div class="sidebar" id="sidebar">
    <button class="sidebar-toggle-btn" onclick="toggleSidebarMinimize()" title="Minimize sidebar">
      <i class="fas fa-chevron-left"></i>
    </button>
    <div class="user-profile">
      <div class="user-avatar">
        <?php if ($profilePhotoUrl): ?>
          <img src="<?php echo htmlspecialchars($profilePhotoUrl); ?>" alt="Profile Photo" class="profile-photo">
        <?php else: ?>
          <i class="fas fa-user"></i>
        <?php endif; ?>
      </div>
      <div class="user-name"><?php echo htmlspecialchars($user_name); ?></div>
    </div>
    
    <nav class="sidebar-nav">
      <ul>
        <li class="nav-item active" onclick="showSection('myclasses', this)">
          <i class="fas fa-book-open"></i>
          <span>My Classes</span>
        </li>
        <!-- Hidden until implementation -->
        <!-- <li class="nav-item" onclick="showSection('newsfeed', this)">
          <i class="fas fa-newspaper"></i>
          <span>Newsfeed</span>
        </li>
        <li class="nav-item" onclick="showSection('leaderboards', this)">
          <i class="fas fa-trophy"></i>
          <span>Leaderboards</span>
        </li> -->
        <li class="nav-item" onclick="showSection('play-area', this)">
          <i class="fas fa-terminal"></i>
          <span>Play Area</span>
        </li>
        <li class="nav-item" onclick="showSection('certification', this)">
          <i class="fas fa-star"></i>
          <span>Certification</span>
        </li>
        <li class="nav-item" onclick="showSection('profile', this)">
          <i class="fas fa-user"></i>
          <span>Profile</span>
        </li>
      </ul>
    </nav>
  </div>

  <!-- Main Content -->
  <div class="main-content" id="mainContent">
    
    <!-- My Classes Section -->
    <div id="myclasses" class="section-content <?php echo $current_section === 'myclasses' ? 'active' : ''; ?>">
      <div class="section-title">My Classes</div>
      <div class="active-classes">
        
        <div class="active-classes-header">
          <h2>Active Classes</h2>
        </div>
        <div class="classes-grid">
        <!-- Join Class Card -->
        <div class="class-item create-tile" onclick="openJoinClassModal()">
          <div class="create-icon">
            <i class="fas fa-plus"></i>
          </div>
          <div class="create-text">
            <h3>Join Class</h3>
            <p>Enter a class code to join</p>
          </div>
        </div>
        
        <!-- Enrolled Classes -->
        <?php if (count($formattedClasses) > 0): ?>
          <?php foreach ($formattedClasses as $class): ?>
            <div class="class-item" data-class-id="<?php echo $class['id']; ?>" onclick="enterClass(<?php echo $class['id']; ?>)">
              <div class="class-header">
                <div class="class-title"><?php echo htmlspecialchars($class['name']); ?></div>
              </div>
              
              <div class="class-details">
                <div class="class-detail-item">
                  <i class="fas fa-chalkboard-teacher"></i>
                  <span><?php echo htmlspecialchars($class['teacher_name']); ?></span>
                </div>
                <div class="class-detail-item">
                  <i class="fas fa-users"></i>
                  <span><?php echo $class['student_count']; ?> Students</span>
                </div>
                <div class="class-detail-item">
                  <i class="fas fa-calendar"></i>
                  <span><?php 
                    if (!empty($class['created_at'])) {
                      try {
                        $enrolledDate = new DateTime($class['created_at']);
                        $now = new DateTime();
                        $diff = $now->diff($enrolledDate);
                        
                        if ($diff->days == 0) {
                          echo 'Enrolled today';
                        } else if ($diff->days == 1) {
                          echo 'Enrolled yesterday';
                        } else if ($diff->days < 7) {
                          echo 'Enrolled ' . $diff->days . ' days ago';
                        } else if ($diff->days < 30) {
                          $weeks = floor($diff->days / 7);
                          echo 'Enrolled ' . $weeks . ' week' . ($weeks > 1 ? 's' : '') . ' ago';
                        } else {
                          echo 'Enrolled ' . $enrolledDate->format('M d, Y');
                        }
                      } catch (Exception $e) {
                        echo 'Enrolled recently';
                      }
                    } else {
                      echo 'Enrolled recently';
                    }
                  ?></span>
                </div>
              </div>
              
              <div class="class-actions">
                <button class="btn-enter">
                  <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          <?php endforeach; ?>
        <?php else: ?>
          <div class="empty-state">
            <i class="fas fa-book-open"></i>
            <h3>No Classes Yet</h3>
            <p>Join a class to get started with your learning journey!</p>
          </div>
        <?php endif; ?>
        </div>
        
        <!-- Class Detail Container for Embedded Class Dashboard -->
        <div id="classDetailContainer" class="class-detail-container" style="display:none;">
          <iframe id="classDetailFrame" class="class-detail-frame" src="" frameborder="0"></iframe>
        </div>
      </div>
    </div>

    <!-- Newsfeed Section -->
    <div id="newsfeed" class="section-content">
      <div class="section-header">
        <h2 class="section-title">Newsfeed</h2>
      </div>
      <div class="newsfeed-content">
        <p>Newsfeed content will be here...</p>
      </div>
    </div>

    <!-- Leaderboards Section -->
    <div id="leaderboards" class="section-content">
      <div class="section-header">
        <h2 class="section-title">Leaderboards</h2>
      </div>
      <div class="leaderboards-content">
        <p>Leaderboards content will be here...</p>
      </div>
    </div>

    <!-- Certification Section -->
    <div id="certification" class="section-content">
      <div class="section-header">
        <h2 class="section-title">Certification</h2>
      </div>
      <div class="certification-content">
        <p>Certification content will be here...</p>
      </div>
    </div>

    <!-- Play Area Section -->
    <div id="play-area" class="section-content">
      <div class="section-title">Play Area</div>
      <div class="play-card">
        <div class="play-toolbar">
          <div class="play-title">
            <i class="fas fa-terminal"></i>
            <span>CodeRegal Playground</span>
          </div>
          <div class="play-controls">
            <label class="play-label">Language</label>
            <select id="stuPlayLanguage" class="play-select">
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python3">Python</option>
            </select>
            <button id="stuPlaySaveBtn" class="play-secondary-btn" type="button" title="Save snippet (Ctrl/Cmd+S)">
              <i class="fas fa-save"></i>
              <span>Save</span>
            </button>
            <button id="stuPlayStopBtn" class="play-stop-btn" type="button" style="display:none;" title="Stop execution">
              <i class="fas fa-stop"></i>
              <span>Stop</span>
            </button>
            <button id="stuPlayRunBtn" class="play-run-btn" type="button">
              <i class="fas fa-play"></i>
              <span>Run Code</span>
            </button>
          </div>
        </div>
        <div class="play-ide-container">
          <div class="play-editor-wrapper">
            <div class="play-file-tabs">
              <div class="play-file-tab active">
                <span class="play-file-name">main.cpp</span>
                <span class="play-file-close">+</span>
              </div>
            </div>
            <div id="stuPlayEditor" class="play-editor-monaco"></div>
            <textarea id="stuPlaySource" class="play-textarea" placeholder="Write your code here..." style="display:none;"></textarea>
          </div>
        </div>
        <div class="play-hint">
          <i class="fas fa-lightbulb"></i>
          <span>Tip: Press Ctrl/Cmd + Enter to run quickly.</span>
        </div>
      </div>
    </div>

    <!-- Profile Section -->
    <div id="profile" class="section-content">
      <?php include 'includes/profile_section.php'; ?>
    </div>
  </div>

  <!-- Join Class Modal -->
  <div id="joinClassModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Join Class</h3>
        <span class="close" onclick="closeJoinClassModal()">&times;</span>
      </div>
      <div class="modal-body">
        <form id="joinClassForm">
          <div class="form-group">
            <label for="classCode">Class Code</label>
            <input type="text" id="classCode" name="classCode" placeholder="Enter class code" required>
          </div>
          <div id="joinClassError" class="error-message" style="display: none;"></div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeJoinClassModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="handleJoinClass()">Join Class</button>
      </div>
    </div>
  </div>

  <!-- Confirmation Modal -->
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

  <!-- Scripts -->
  <!-- Unified Notification System - Load BEFORE other scripts -->
  <script src="assets/js/notification_system.js?v=<?php echo time(); ?>"></script>
  <script src="assets/js/admin_panel.js"></script>
  <!-- Shared Play Area terminal (reusable) -->
  <script src="assets/js/play_area_terminal.js?v=<?php echo time(); ?>"></script>
  <script src="assets/js/play_area_monaco.js?v=<?php echo time(); ?>"></script>
  <script src="assets/js/play_area_core.js?v=<?php echo time(); ?>"></script>
  <script src="assets/js/student_play_area.js?v=<?php echo time(); ?>"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function(){
      if (window.PlayArea && typeof PlayArea.initMonaco === 'function') {
        PlayArea.initMonaco({ editorId: 'stuPlayEditor', textareaId: 'stuPlaySource', languageSelectId: 'stuPlayLanguage' });
      }
      if (window.PlayArea && typeof PlayArea.init === 'function') {
        PlayArea.init({ idPrefix: 'stuPlay', enableMonaco: true, languageId: 'stuPlayLanguage', sourceId: 'stuPlaySource', autoFullscreen: true });
      }
    });
  </script>
  <script src="assets/js/shared_profile.js"></script>
  <script src="assets/js/student_dashboard.js"></script>
</body>
</html>
