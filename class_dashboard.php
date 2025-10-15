<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/auth_helpers.php';
Auth::requireAuth();

$classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);
if ($classId <= 0) { header('Location: teacher_dashboard.php'); exit; }
$embedded = isset($_GET['embedded']) ? (int)$_GET['embedded'] : 0;

// Basic page scaffold; data for header can be fetched later
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Class Dashboard</title>
  <link rel="stylesheet" href="assets/css/teacher_dashboard.css?v=<?php echo time(); ?>">
  <link rel="stylesheet" href="assets/css/class_dashboard.css?v=<?php echo time(); ?>">
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
    .nav-back-btn { background: none; border: none; padding: 8px 10px; color: #64748b; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
    .nav-back-btn:hover { background: #f1f5f9; }
  </style>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
</head>
<body>
  <div class="class-page">
    <!-- Top Navigation Bar -->
    <div class="top-nav">
      <div class="nav-left">
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
          <button class="nav-tab" data-tab="classrecord">Class Record</button>
          <button class="nav-tab" data-tab="newsfeed">Newsfeed</button>
          <button class="nav-tab" data-tab="leaderboards">Leaderboards</button>
        </div>
      </div>
      
      <div class="nav-right">
        <button class="btn-create-activity" id="createActivityBtn">
          <i class="fas fa-plus"></i> Create activity
        </button>
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
            <div class="sidebar-option">
              <i class="fas fa-star"></i>
              <span>Created by me</span>
            </div>
          </div>
        </div>
        
        
      </div>

      <!-- Main Content Area -->
      <div class="main-content">
        <section id="tab-classrecord" class="tab-section">
          <div class="card">
            <div class="card-header-row">
              <h3>Class Record</h3>
            </div>
            <div style="padding: 12px; color:#6b7280;">Coming soon.</div>
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
  <script src="assets/js/class_dashboard.js?v=<?php echo time(); ?>"></script>
  <script></script>
</body>
</html>

