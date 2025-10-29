<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/auth_helpers.php';
Auth::requireAuth();

$classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);
if ($classId <= 0) { 
    // Redirect based on user role
    $userRole = $_SESSION['user_role'] ?? 'student';
    if ($userRole === 'teacher') {
        header('Location: teacher_dashboard.php'); 
    } else {
        header('Location: student_dashboard.php?section=myclasses'); 
    }
    exit; 
}

$embedded = isset($_GET['embedded']) ? (int)$_GET['embedded'] : 0;
$userRole = $_SESSION['user_role'] ?? 'student';
$userId = $_SESSION['user_id'];

// If embedded, set proper headers to allow iframe loading
if ($embedded) {
  header('X-Frame-Options: SAMEORIGIN');
  header('Content-Security-Policy: frame-ancestors \'self\'');
}

// Check if user has access to this class
$db = (new Database())->getConnection();
if ($userRole === 'student') {
    // Check if student is enrolled in this class
    $stmt = $db->prepare("SELECT id FROM class_students WHERE class_id = ? AND student_user_id = ?");
    $stmt->execute([$classId, $userId]);
    if (!$stmt->fetch()) {
        header('Location: student_dashboard.php?section=myclasses&error=not_enrolled');
        exit;
    }
} else if ($userRole === 'teacher') {
    // Check if teacher owns this class
    $stmt = $db->prepare("SELECT id FROM classes WHERE id = ? AND owner_user_id = ? AND status = 'active'");
    $stmt->execute([$classId, $userId]);
    if (!$stmt->fetch()) {
        header('Location: teacher_dashboard.php?error=not_authorized');
        exit;
    }
}

// Basic page scaffold; data for header can be fetched later
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Class Dashboard</title>
  <style>
    /* Prevent layout jumps by setting initial dimensions */
    body {
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }
    .class-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .top-nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .main-content {
      margin-top: 80px;
      min-height: calc(100vh - 80px);
    }
  </style>
  <?php if ($userRole === 'student'): ?>
  <link rel="stylesheet" href="assets/css/student_dashboard.css?v=<?php echo time(); ?>">
  <?php else: ?>
  <link rel="stylesheet" href="assets/css/teacher_dashboard.css?v=<?php echo time(); ?>">
  <?php endif; ?>
  <link rel="stylesheet" href="assets/css/class_dashboard.css?v=<?php echo time(); ?>&cache=<?php echo uniqid(); ?>&student_fix=4">
  <script src="assets/js/notification_system.js?v=<?php echo time(); ?>"></script>
  <style>
    /* Force centering for class dashboard */
    .class-page .lesson-header {
      text-align: center !important;
    }
    .class-page .lesson-title {
      text-align: center !important;
    }
    .class-page .lesson-main-title {
      text-align: center !important;
    }
    .nav-back-btn { 
      background: linear-gradient(135deg, #1d9b3e 0%, #28a745 100%); 
      border: none; 
      padding: 12px; 
      color: white; 
      border-radius: 12px; 
      cursor: pointer; 
      display: inline-flex; 
      align-items: center; 
      justify-content: center;
      width: 44px;
      height: 44px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(29, 155, 62, 0.3);
      transition: all 0.3s ease;
    }
    .nav-back-btn:hover { 
      background: linear-gradient(135deg, #28a745 0%, #1d9b3e 100%); 
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(29, 155, 62, 0.4);
    }
    
    /* Loading animation */
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
</head>
<body class="<?php echo strtolower($userRole) === 'student' ? 'student-view' : 'teacher-view'; ?>">
  <!-- Loading overlay to prevent layout jumps -->
  <div id="loadingOverlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: white; z-index: 9999; display: flex; align-items: center; justify-content: center; transition: opacity 0.3s ease;">
    <div style="text-align: center;">
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #1d9b3e; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
      <p style="margin-top: 20px; color: #666;">Loading Class Dashboard...</p>
    </div>
  </div>
  
  <div class="class-page">
    <!-- Top Navigation Bar -->
    <div class="top-nav">
      <div class="nav-left">
        <button class="nav-back-btn" onclick="goBack()" title="Go Back to Active Classes">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="course-logo">
          <div class="logo-icon">
            <i class="fas fa-graduation-cap"></i>
            <div class="status-dot"></div>
          </div>
          <span class="course-code" id="courseCode">Introduction to Computer Programming</span>
        </div>
      </div>
      
      <div class="nav-center">
        <div class="nav-tabs">
          <button class="nav-tab active" data-tab="activities">Activities</button>
          <?php if (strtolower($userRole) !== 'student'): ?>
          <button class="nav-tab" data-tab="classrecord">Class Record</button>
          <?php endif; ?>
          <button class="nav-tab" data-tab="newsfeed">Newsfeed</button>
          <button class="nav-tab" data-tab="leaderboards">Leaderboards</button>
        </div>
      </div>
      
      <div class="nav-right">
        <?php if (strtolower($userRole) !== 'student'): ?>
        <button class="btn-create-activity" id="createActivityBtn">
          <i class="fas fa-plus"></i> Create activity
        </button>
        <?php endif; ?>
        <div style="position: relative; display:inline-block;">
          <button class="nav-menu-btn" id="menuBtn" title="Menu">
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <div id="navMenuDropdown" style="display:none; position:absolute; right:0; top:36px; background:#fff; border:1px solid #e5e7eb; box-shadow:0 8px 16px rgba(0,0,0,0.08); border-radius:8px; min-width:180px; z-index:1000;">
            <button id="copyClassCodeMenu" style="width:100%; background:none; border:none; padding:10px 12px; text-align:left; cursor:pointer; font-size:14px; color:#374151;">
              <i class="fas fa-copy" style="margin-right:8px;"></i> Copy Class Code
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-layout">
      <!-- Left Sidebar -->
      <div class="sidebar">
        <div class="sidebar-section">
          <h3 class="sidebar-title">Activities</h3>
          <div class="sidebar-options">
            <div class="sidebar-option active">
              <i class="fas fa-star"></i>
              <span>Course</span>
            </div>
            <?php if ($userRole === 'teacher'): ?>
            <div class="sidebar-option" data-teacher-only>
              <i class="fas fa-plus"></i>
              <span>Create Activity</span>
            </div>
            <div class="sidebar-option" data-teacher-only>
              <i class="fas fa-cog"></i>
              <span>Manage</span>
            </div>
            <?php else: ?>
            <div class="sidebar-option" data-student-only>
              <i class="fas fa-trophy"></i>
              <span>My Progress</span>
            </div>
            <div class="sidebar-option" data-student-only>
              <i class="fas fa-chart-line"></i>
              <span>Leaderboard</span>
            </div>
            <?php endif; ?>
          </div>
        </div>
        
        
      </div>

      <!-- Main Content Area -->
      <div class="main-content">
        <section id="tab-classrecord" class="tab-section">
          <div class="card">
            <div class="card-header-row">
              <h3><?php echo $userRole === 'student' ? 'My Progress' : 'Class Record'; ?></h3>
            </div>
            <div style="padding: 12px; color:#6b7280;">
              <?php if ($userRole === 'student'): ?>
                <p>Track your progress and see your achievements in this class.</p>
                <div style="margin-top: 20px;">
                  <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #1d9b3e;">
                    <h4 style="margin: 0 0 10px 0; color: #1d9b3e;">Your Progress</h4>
                    <p style="margin: 0; color: #666;">Complete activities to track your learning journey!</p>
                  </div>
                </div>
              <?php else: ?>
                <p>View and manage student records and grades.</p>
                <div style="margin-top: 20px;">
                  <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #1d9b3e;">
                    <h4 style="margin: 0 0 10px 0; color: #1d9b3e;">Class Management</h4>
                    <p style="margin: 0; color: #666;">Monitor student performance and manage class records.</p>
                  </div>
                </div>
              <?php endif; ?>
            </div>
          </div>
        </section>

        <section id="tab-activities" class="tab-section active">
          <!-- Dynamic Modules Section -->
          <div class="lesson-topics">
            <!-- Modules and lessons will be loaded dynamically here -->
          </div>

          <!-- Exercises Section removed per request -->
        </section>

        <section id="tab-lessons" class="tab-section">
          <div class="workspace">
            <aside class="pane pane-left">
              <div class="pane-header">Modules & Lessons</div>
              <div class="pane-body" id="modulesTree">
                <div class="empty-state">No modules yet. Click "Add Lesson" to start.</div>
              </div>
            </aside>
            <main class="pane pane-center">
              <div class="pane-header">Lesson Editor</div>
              <div class="pane-body" id="lessonEditor">
                <div class="empty-state">Select a lesson to edit content, code samples, and notes.</div>
              </div>
            </main>
            <aside class="pane pane-right">
              <div class="pane-header">Checks & Metadata</div>
              <div class="pane-body">
                <div class="field"><label>Language</label><div class="pill">Java</div></div>
                <div class="field"><label>Difficulty</label><div class="pill">Beginner</div></div>
                <div class="field"><label>Tags</label><div class="pill">loops</div> <div class="pill">conditions</div></div>
                <div class="divider"></div>
                <div class="field">
                  <label>Test Cases</label>
                  <ul class="simple-list small">
                    <li>Public: Input A → Output B</li>
                    <li>Hidden: Edge cases</li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </section>
        
        <section id="tab-newsfeed" class="tab-section">
          <div class="card">
            <div class="card-header-row">
              <h3>Newsfeed</h3>
            </div>
            <div style="padding: 12px; color:#6b7280;">Coming soon.</div>
          </div>
        </section>
        
        <section id="tab-leaderboards" class="tab-section">
          <div class="card">
            <div class="card-header-row">
              <h3>Leaderboards</h3>
            </div>
            <div style="padding: 12px; color:#6b7280;">Coming soon.</div>
          </div>
        </section>
      </div>
    </div>
  </div>

  <script>window.__CLASS_ID__ = <?php echo json_encode($classId); ?>;</script>
  <script>window.__USER_ROLE__ = <?php echo json_encode($userRole); ?>;</script>
  <script>window.__USER_ID__ = <?php echo json_encode($userId); ?>;</script>
  <script>console.log('🔍 PHP DEBUG - User Role:', <?php echo json_encode($userRole); ?>);</script>
  <script>console.log('🔍 PHP DEBUG - User Role Type:', <?php echo json_encode(gettype($userRole)); ?>);</script>
  <script>console.log('🔍 PHP DEBUG - Is Student Check:', <?php echo json_encode(strtolower($userRole) === 'student'); ?>);</script>
  <script>console.log('🔍 PHP DEBUG - Embedded:', <?php echo json_encode($embedded); ?>);</script>
          <script src="assets/js/class_dashboard.js?v=<?php echo time(); ?>&cache=<?php echo uniqid(); ?>&super_debug=1"></script>
  <script>
    // Auto-initialize student view if needed
    document.addEventListener('DOMContentLoaded', function() {
      console.log('🔍 DOM Loaded - User Role:', window.__USER_ROLE__);
      if (window.__USER_ROLE__ && window.__USER_ROLE__.toLowerCase() === 'student') {
        console.log('🎓 Auto-initializing student view');
        setTimeout(() => {
          if (window.initializeStudentView) {
            window.initializeStudentView();
          }
        }, 1000); // Wait for content to load
      }
    });
    
    // Role-aware functionality
    function goBack() {
      console.log('🔙 Back button clicked');
      const userRole = window.__USER_ROLE__;
      console.log('👤 User role:', userRole);
      
      // Check if we're in an iframe
      if (window.parent !== window) {
        console.log('🖼️ In iframe, calling parent exit function');
        // We're in an iframe, call the parent's exit function
        try {
          if (window.parent.exitEmbeddedClass) {
            window.parent.exitEmbeddedClass();
            console.log('✅ Called parent exitEmbeddedClass function');
          } else {
            console.log('❌ Parent exitEmbeddedClass function not available');
            window.location.href = 'student_dashboard.php?section=myclasses';
          }
        } catch (e) {
          console.log('❌ Error calling parent function:', e);
          window.location.href = 'student_dashboard.php?section=myclasses';
        }
      } else {
        console.log('📄 Not in iframe, redirecting directly');
        // We're not in an iframe, redirect directly
        if (userRole === 'student') {
          console.log('🎓 Redirecting student to Active Classes');
          // Force redirect to My Classes section
          window.location.href = 'student_dashboard.php?section=myclasses';
        } else {
          console.log('👨‍🏫 Redirecting teacher to My Classes');
          window.location.href = 'teacher_dashboard.php?section=my-classes';
        }
      }
    }
    
    // Hide loading overlay when page is ready
    function hideLoadingOverlay() {
      const overlay = document.getElementById('loadingOverlay');
      if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.style.display = 'none';
        }, 300);
      }
    }
    
    // Initialize role-specific features
    document.addEventListener('DOMContentLoaded', function() {
      // Hide loading overlay after a short delay to ensure everything is loaded
      setTimeout(hideLoadingOverlay, 500);
      
      const userRole = window.__USER_ROLE__;
      
      if (userRole === 'student') {
        // Hide teacher-only features
        const teacherOnlyElements = document.querySelectorAll('[data-teacher-only]');
        teacherOnlyElements.forEach(el => el.style.display = 'none');
        
        // Show student-specific features
        const studentElements = document.querySelectorAll('[data-student-only]');
        studentElements.forEach(el => el.style.display = 'block');
        
        // Update page title for students
        document.title = 'Class - Student View';
      } else {
        // Hide student-only features
        const studentOnlyElements = document.querySelectorAll('[data-student-only]');
        studentOnlyElements.forEach(el => el.style.display = 'none');
        
        // Show teacher-specific features
        const teacherElements = document.querySelectorAll('[data-teacher-only]');
        teacherElements.forEach(el => el.style.display = 'block');
        
        // Update page title for teachers
        document.title = 'Class Dashboard - Teacher View';
      }
    });
  </script>
</body>
</html>

