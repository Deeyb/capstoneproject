<?php
/**
 * TEACHER DASHBOARD
 * Using original auth system to avoid redirect loops
 */
session_start();
require_once 'config.php';
require_once 'classes/auth_helpers.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/ProfileService.php';

// Use original auth system
Auth::requireAuth();
Auth::requireRole('teacher');
$lastname = $_SESSION['user_lastname'] ?? '';
$firstname = $_SESSION['user_firstname'] ?? '';
$middlename = $_SESSION['user_middlename'] ?? '';
$middle_initial = $middlename ? strtoupper(mb_substr(trim($middlename), 0, 1)) . '.' : '';
$user_name = trim($lastname . ', ' . $firstname . ' ' . $middle_initial);
if (!$user_name || $user_name === ',') $user_name = 'Teacher';
$user_role = $_SESSION['user_role'] ?? 'TEACHER';

// Get current section from URL parameter
$current_section = $_GET['section'] ?? 'my-classes';

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
  <title>Instructor Homepage</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
  <!-- Shared UI Styles -->
  <link rel="stylesheet" href="assets/css/admin_panel.css">
  <!-- Font Awesome - Load after admin_panel.css to ensure it takes precedence -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
  <!-- Teacher-specific Styles -->
  <link rel="stylesheet" href="assets/css/teacher_dashboard.css">
</head>
<body class="teacher-dashboard">
  <!-- Header (match Coordinator/Admin exactly) -->
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
        <li class="nav-item active" onclick="showSection('my-classes', this)">
          <i class="fas fa-book-open"></i>
          <span>My Classes</span>
        </li>
        <li class="nav-item" onclick="showSection('my-students', this)">
          <i class="fas fa-user-graduate"></i>
          <span>My Students</span>
        </li>
        
        <li class="nav-item" onclick="showSection('reports', this)">
          <i class="fas fa-chart-bar"></i>
          <span>Reports</span>
        </li>
        <li class="nav-item" onclick="showSection('leaderboards', this)">
          <i class="fas fa-trophy"></i>
          <span>Leaderboards</span>
        </li>
        <li class="nav-item" onclick="showSection('play-area', this)">
          <i class="fas fa-terminal"></i>
          <span>Play Area</span>
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
    <div id="my-classes" class="section-content active">
      <div class="section-title">My Classes</div>
      <div class="active-classes">
        
        <div class="active-classes-header">
          <h2>Active Classes</h2>
        </div>
        <div class="classes-grid"><!-- dynamically filled via JS --></div>
        <div id="classDetailContainer" class="class-detail-container" style="display:none;">
          <div class="detail-toolbar">
            <button class="btn back-btn" onclick="exitEmbeddedClass()"><i class="fas fa-arrow-left"></i> Back</button>
          </div>
          <iframe id="classDetailFrame" class="class-detail-frame" src="" frameborder="0"></iframe>
        </div>
      </div>
    </div>

    <!-- My Students Section -->
    <div id="my-students" class="section-content">
      <div class="section-title">My Students</div>
      <p>Student management features will be implemented here.</p>
    </div>

    

    <!-- Reports Section -->
    <div id="reports" class="section-content">
      <div class="section-title">Reports</div>
      <p>Reporting features will be implemented here.</p>
    </div>

    <!-- Leaderboards Section -->
    <div id="leaderboards" class="section-content">
      <div class="section-title">Leaderboards</div>
      <p>Leaderboard features will be implemented here.</p>
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
            <select id="playLanguage" class="play-select">
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python3">Python</option>
            </select>
            <button id="playTemplateBtn" class="play-secondary-btn" type="button">
              <i class="fas fa-file-code"></i>
              <span>Insert template</span>
            </button>
            <button id="playSaveBtn" class="play-secondary-btn" type="button" title="Save snippet (Ctrl/Cmd+S)">
              <i class="fas fa-save"></i>
              <span>Save</span>
            </button>
            <select id="playRecentSelect" class="play-select" title="Load recent snippet">
              <option value="">Recent snippets…</option>
            </select>
            <button id="playStopBtn" class="play-stop-btn" type="button" style="display:none;" title="Stop execution">
              <i class="fas fa-stop"></i>
              <span>Stop</span>
            </button>
            <button id="playRunBtn" class="play-run-btn" type="button">
              <i class="fas fa-play"></i>
              <span>Run Code</span>
            </button>
          </div>
        </div>
        <div class="play-ide-container">
          <!-- Left: Code Editor -->
          <div class="play-editor-wrapper">
            <div class="play-file-tabs">
              <div class="play-file-tab active">
                <span class="play-file-name">main.cpp</span>
                <span class="play-file-close">+</span>
              </div>
            </div>
            <div id="playEditor" class="play-editor-monaco"></div>
            <!-- Fallback textarea for when Monaco is not loaded -->
            <textarea id="playSource" class="play-textarea" placeholder="Write your code here..." style="display:none;"></textarea>
          </div>
          
          <!-- Right: CodeRegal Terminal (hidden initially, appears after Run Code) -->
          <div id="playTerminalSidebar" class="play-terminal-sidebar" style="display:none;">
            <div class="play-terminal-header-bar">
              <div class="play-terminal-title">
                <span class="play-terminal-icon"><></span>
                <span>CodeRegal Terminal</span>
              </div>
              <button id="playClearTerminal" class="play-terminal-clear-btn" title="Clear terminal">
                <i class="fas fa-trash"></i>
              </button>
            </div>
            <div id="playTerminalBody" class="play-terminal-body-content">
              <div class="terminal-placeholder">Executing...</div>
            </div>
            <!-- Input field (hidden by default, shown when program needs input) -->
            <div id="playTerminalInputWrapper" class="play-terminal-input-wrapper" style="display:none;">
              <div class="play-terminal-prompt-line">
                <span id="playTerminalPrompt" class="play-terminal-prompt-text"></span>
                <input type="text" id="playTerminalInputField" class="play-terminal-input-inline" 
                  autocomplete="off" spellcheck="false" placeholder="Enter input..." />
              </div>
            </div>
          </div>
        </div>
        <div class="play-hint">
          <i class="fas fa-lightbulb"></i>
          <span>Tip: Press Ctrl/Cmd + Enter to run quickly. Use Ctrl/Cmd + / to comment/uncomment lines.</span>
        </div>
      </div>
    </div>

    <!-- Profile Section -->
    <div id="profile" class="section-content">
      <?php include 'includes/profile_section.php'; ?>
    </div>

  <!-- Overlay and Create Class Drawer -->
  <div class="overlay" id="overlay"></div>
  
  <div class="create-class-form" id="createClassForm">
    <div class="form-header">
      <h3>Create New Class</h3>
      <button class="close-btn" onclick="closeForm()" title="Close form">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <a href="#" class="close-link" onclick="closeForm()">← Back to My Classes</a>

    <div class="step-box">
      <h4>Step 1</h4>
      <label>Give your class a name</label>
      <input type="text" id="classNameInput" placeholder="Class name *" />
    </div>

    

    <div class="step-box">
      <h4>Step 2</h4>
      <label>Choose the course your class will follow</label>
      <div class="custom-dropdown" id="courseDropdown">
        <div class="dropdown-selected" onclick="toggleCourseDropdown()">
          <span id="courseSelectedText">Loading courses...</span>
          <i class="fas fa-chevron-down"></i>
        </div>
        <div class="dropdown-options" id="courseOptions" style="display: none;">
          <!-- Options will be populated by JavaScript -->
        </div>
        <input type="hidden" id="courseSelect" name="course_id" value="">
      </div>
    </div>

    <div class="step-box">
      <h4>Step 3</h4>
      <label>Class code</label>
      <div style="display:flex; gap:10px; align-items:center; margin-top:8px;">
        <input type="text" id="classCodeInput" placeholder="Auto-generated..." disabled />
        <button class="green-btn" id="regenCodeBtn" type="button" title="Generate new code">Generate</button>
        <button class="green-btn" id="copyCodeBtn" type="button" title="Copy code">Copy</button>
      </div>
      <div style="margin-top:8px; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="customizeCodeToggle" />
        <label for="customizeCodeToggle" style="font-weight:400;">Customize code (format: CR-XXXXX)</label>
      </div>
    </div>

    <div class="step-box" id="step4Box" style="display: none;">
      <h4>Step 4</h4>
      <div id="courseSelection">
        <div class="empty-state">Please select a course in Step 2 first</div>
      </div>
    </div>

    <div class="step-box" id="step5Box" style="display: none;">
      <div class="step-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="toggleStep5()">
        <h4>Step 5</h4>
        <i class="fas fa-chevron-down" id="step5ToggleIcon" style="transition: transform 0.3s ease;"></i>
      </div>
      <div id="step5Content" style="display: block;">
        <p>Customize module</p>
        <div id="lessons">
          <div class="empty-state">Please select a course in Step 2 first</div>
        </div>
        
        <div class="add-module-section" style="margin-top: 20px; text-align: center;">
          <button class="green-btn" data-action="add-module" type="button" style="padding: 10px 20px; font-size: 14px;">
            <i class="fas fa-plus" style="margin-right: 8px;"></i>Add New Module
          </button>
        </div>
        
        <div class="step5-actions" style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
          <button class="secondary-btn" id="discardChangesBtn" type="button" style="display: none;">
            <i class="fas fa-undo"></i> Discard Changes
          </button>
          <button class="green-btn" id="saveChangesBtn" type="button" style="display: none;">
            <i class="fas fa-save"></i> Save Changes
          </button>
        </div>
      </div>
    </div>

    <button class="green-btn" id="createClassBtn">✔ Create class</button>
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

  <!-- Scripts -->
  <!-- Load shared system first (like Coordinator) -->
  <script src="assets/js/app_ui.js"></script>
  <!-- Reusable Activity Creator System -->
        <link rel="stylesheet" href="assets/css/reusable_activity_creator.css">
        <!-- notification_system.js removed - using admin_panel.css notifications instead -->
        <script src="assets/js/reusable_activity_creator.js"></script>
        <script src="assets/js/teacher_activity_integration.js"></script>
        <!-- Load scripts in correct order -->
        <!-- REMOVED: admin_panel.js - causes 403 errors for teachers -->
        <script src="assets/js/teacher_dashboard.js?v=<?php echo time(); ?>"></script>
        <script src="assets/js/shared_profile.js?v=<?php echo time(); ?>"></script>
        <script src="assets/js/teacher_material_viewers.js?v=<?php echo time(); ?>"></script>
  <script>
    // Verify showSection AFTER scripts are loaded (using setTimeout to ensure scripts execute first)
    setTimeout(function() {
      if (typeof window.showSection === 'function') {
        console.log('✅ showSection is available and properly loaded');
      } else {
        console.error('❌ showSection is NOT available! Function not found after script load.');
        console.error('This means the IIFE in teacher_dashboard.js did not execute properly.');
        // Fallback: Define a minimal showSection if missing
        window.showSection = function(sectionId, clickedEl) {
          console.warn('[FALLBACK] showSection fallback being used - main function not loaded!');
          console.log('Attempting to show section:', sectionId);
          const sections = document.querySelectorAll('.section-content');
          sections.forEach(s => { s.style.display = 'none'; s.classList.remove('active'); });
          const target = document.getElementById(sectionId);
          if (target) { 
            target.style.display = 'block'; 
            target.classList.add('active');
          }
          document.querySelectorAll('.sidebar .nav-item').forEach(li => li.classList.remove('active'));
          if (clickedEl) { clickedEl.classList.add('active'); }
        };
        console.log('⚠️ Fallback showSection function has been defined');
      }
    }, 100);
    
    document.addEventListener('DOMContentLoaded', function(){
      // Verify showSection again after DOM loads
      if (typeof window.showSection !== 'function') {
        console.error('❌ CRITICAL: showSection still not available after DOMContentLoaded!');
      } else {
        console.log('✅ showSection verified after DOMContentLoaded');
      }
      
      // Initialize reusable activity creator system
      if (typeof initTeacherActivitySystem === 'function') {
        try { initTeacherActivitySystem(); } catch(e) { console.error('Activity system init error:', e); }
      }
      
      // Initialize teacher dashboard
      if (typeof initializeTeacherDashboard === 'function') {
        try { initializeTeacherDashboard(); } catch(e) { console.error('Init error:', e); }
      }
    });
  </script>
</body>
</html>
