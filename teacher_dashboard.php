<?php
session_start();
require_once 'config.php';
require_once 'classes/auth_helpers.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/ProfileService.php';
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
        <li class="nav-item" onclick="showSection('calendar', this)">
          <i class="fas fa-calendar-alt"></i>
          <span>Calendar</span>
        </li>
        <li class="nav-item" onclick="showSection('assessment', this)">
          <i class="fas fa-chart-line"></i>
          <span>Assessment</span>
        </li>
        <li class="nav-item" onclick="showSection('reports', this)">
          <i class="fas fa-chart-bar"></i>
          <span>Reports</span>
        </li>
        <li class="nav-item" onclick="showSection('leaderboards', this)">
          <i class="fas fa-trophy"></i>
          <span>Leaderboards</span>
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
        <div class="class-type-tabs">
          <button type="button" id="tabLecture" class="tab-btn active" onclick="setClassTypeFilter('lecture'); return false;">Lecture</button>
          <button type="button" id="tabLaboratory" class="tab-btn" onclick="setClassTypeFilter('laboratory'); return false;">Laboratory</button>
        </div>
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

    <!-- Calendar Section -->
    <div id="calendar" class="section-content">
      <div class="section-title">Calendar</div>
      <p>Calendar features will be implemented here.</p>
    </div>

    <!-- Assessment Section -->
    <div id="assessment" class="section-content">
      <div class="section-title">Assessment</div>
      <p>Assessment features will be implemented here.</p>
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
      <label>Type of class</label>
      <div class="class-type-options">
        <label class="radio-option">
          <input type="radio" name="classType" value="lecture" checked />
          <span class="radio-label">Lecture</span>
        </label>
        <label class="radio-option">
          <input type="radio" name="classType" value="laboratory" />
          <span class="radio-label">Laboratory</span>
        </label>
      </div>
    </div>

    <div class="step-box">
      <h4>Step 3</h4>
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
      <h4>Step 4</h4>
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
      <h4>Step 5</h4>
      <div id="courseSelection">
        <div class="empty-state">Please select a course in Step 3 first</div>
      </div>
    </div>

    <div class="step-box" id="step5Box" style="display: none;">
      <h4>Step 6</h4>
      <p>Customize module</p>
      <div id="lessons">
        <div class="empty-state">Please select a course in Step 3 first</div>
      </div>
      <div id="newLessonWrapper" class="hidden">
        <div class="new-lesson-input">
          <input type="text" id="newLessonName" placeholder="New lesson name..." />
          <button class="icon-btn" onclick="cancelLesson()"><i class="fas fa-trash"></i></button>
        </div>
        <div class="add-buttons">
          <button class="green-btn" onclick="confirmAddLesson()">+ Add lesson</button>
        </div>
      </div>
      <div class="add-buttons">
        <button class="green-btn" onclick="showLessonInput()">+ Add lesson</button>
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
  <script>
    // Immediate section visibility fix - runs before other scripts
    document.addEventListener('DOMContentLoaded', function() {
      console.log('🚀 Teacher Dashboard: Immediate section fix running...');
      
      // Force hide all sections immediately
      const sections = document.querySelectorAll('.section-content');
      sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
      });
      
      // AGGRESSIVE FIX: Hide any profile content outside of profile section
      const profileContainers = document.querySelectorAll('.profile-container');
      profileContainers.forEach(container => {
        const profileSection = document.getElementById('profile');
        if (profileSection && !profileSection.contains(container)) {
          container.style.display = 'none';
          console.log('🚫 Teacher Dashboard: Hidden profile content outside profile section');
        }
      });
      
      // Show only the current section
      const currentSection = '<?php echo $current_section; ?>';
      const targetSection = document.getElementById(currentSection);
      if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
        console.log(`✅ Teacher Dashboard: Showing ${currentSection}`);
      } else {
        // Default to my-classes
        const defaultSection = document.getElementById('my-classes');
        if (defaultSection) {
          defaultSection.style.display = 'block';
          defaultSection.classList.add('active');
          console.log('✅ Teacher Dashboard: Defaulted to my-classes');
        }
      }
    });
  </script>
  <!-- Load scripts in correct order -->
  <script src="assets/js/admin_panel.js?v=<?php echo time(); ?>"></script>
  <script src="assets/js/shared_profile.js?v=<?php echo time(); ?>"></script>
  <script src="assets/js/teacher_dashboard.js?v=<?php echo time(); ?>"></script>
  <script>
    // Initialize after all scripts are loaded
    document.addEventListener('DOMContentLoaded', function() {
      console.log('🚀 Teacher Dashboard: Initializing...');
      
      // Check if required functions are available
      console.log('🔍 Function availability check:');
      console.log('  - showSection:', typeof window.showSection);
      console.log('  - openForm:', typeof window.openForm);
      console.log('  - showNotification:', typeof window.showNotification);
      console.log('  - initSharedProfile:', typeof initSharedProfile);
      console.log('  - initializeTeacherDashboard:', typeof initializeTeacherDashboard);
      
      // Initialize shared profile functionality
      if (typeof initSharedProfile === 'function') {
        initSharedProfile();
        console.log('✅ Teacher Dashboard: Shared profile initialized');
      } else {
        console.error('❌ initSharedProfile function not available');
      }
      
      // Initialize teacher-specific functionality
      if (typeof initializeTeacherDashboard === 'function') {
        initializeTeacherDashboard();
        console.log('✅ Teacher Dashboard: Teacher functionality initialized');
      } else {
        console.error('❌ initializeTeacherDashboard function not available');
      }
      
      console.log('✅ Teacher Dashboard: All systems ready');
    });
  </script>
</body>
</html>
