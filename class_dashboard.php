<?php
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
    @session_start();
}
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/auth_helpers.php';
Auth::requireAuth();

$classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);
$userRoleRaw = $_SESSION['user_role'] ?? 'student';
$userRole = strtolower((string)$userRoleRaw);
if ($classId <= 0) { 
    // Redirect based on user role
    if ($userRole === 'teacher') {
        header('Location: teacher_dashboard.php'); 
    } else {
        header('Location: student_dashboard.php?section=myclasses'); 
    }
    exit; 
}

$embedded = isset($_GET['embedded']) ? (int)$_GET['embedded'] : 0;
$userId = $_SESSION['user_id'];

// If embedded, set proper headers to allow iframe loading
if ($embedded) {
  header('X-Frame-Options: SAMEORIGIN');
  header('Content-Security-Policy: frame-ancestors \'self\'');
}

// Check if user has access to this class
$db = (new Database())->getConnection();
if ($userRole === 'student') {
    // Check if student is enrolled in this class and if status column exists
    $hasStatus = false;
    try {
        $checkStmt = $db->query("SHOW COLUMNS FROM class_students LIKE 'status'");
        $hasStatus = $checkStmt->rowCount() > 0;
    } catch (Exception $e) {
        // Column doesn't exist
    }
    
    if ($hasStatus) {
        // Check enrollment and status (must be accepted to access)
        $stmt = $db->prepare("SELECT id, status FROM class_students WHERE class_id = ? AND student_user_id = ?");
        $stmt->execute([$classId, $userId]);
        $enrollment = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$enrollment) {
            header('Location: student_dashboard.php?section=myclasses&error=not_enrolled');
            exit;
        }
        
        // Store enrollment status for frontend
        $studentStatus = $enrollment['status'] ?? 'accepted';
        // CRITICAL: Log status for debugging
        error_log("🔍 [class_dashboard.php] Student {$userId} in class {$classId} - Status: {$studentStatus}");
        error_log("🔍 [class_dashboard.php] Raw enrollment data: " . json_encode($enrollment));
        if ($studentStatus !== 'accepted') {
            // Student is pending or rejected - show full-page notification
            error_log("🔒 [class_dashboard.php] Student {$userId} is {$studentStatus} - Will show locked sections");
        } else {
            error_log("🔓 [class_dashboard.php] Student {$userId} is {$studentStatus} - Will show normal content");
        }
    } else {
        // Fallback for old schema - just check enrollment
        $stmt = $db->prepare("SELECT id FROM class_students WHERE class_id = ? AND student_user_id = ?");
        $stmt->execute([$classId, $userId]);
        if (!$stmt->fetch()) {
            header('Location: student_dashboard.php?section=myclasses&error=not_enrolled');
            exit;
        }
        $studentStatus = 'accepted'; // Default to accepted for old schema
    }
} else if ($userRole === 'teacher') {
    // Check if teacher owns this class
    $stmt = $db->prepare("SELECT id FROM classes WHERE id = ? AND owner_user_id = ? AND status = 'active'");
    $stmt->execute([$classId, $userId]);
    if (!$stmt->fetch()) {
        header('Location: teacher_dashboard.php?error=not_authorized');
        exit;
    }
    // Teacher doesn't have studentStatus
    $studentStatus = null;
}

// Basic page scaffold; data for header can be fetched later
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Class Dashboard</title>
  <link rel="icon" type="image/svg+xml" href="Photos/CodeRegalWB.svg">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    /* Prevent layout jumps by setting initial dimensions */
    * {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    body {
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    /* Full-page lock overlay - ensure it covers everything */
    .full-page-lock {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: #000000 !important;
      z-index: 999999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
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
  <script>
    // Resilient global toggler for the kebab menu; defined early to avoid dependency on other scripts
    window.toggleNavMenu = function(ev){
      try { if (ev) { ev.preventDefault(); ev.stopPropagation(); } } catch(_){ }
      try {
        var menu = document.getElementById('navMenuDropdown');
        if (!menu) return;
        menu.style.display = (menu.style.display==='block' ? 'none' : 'block');
      } catch(_){ }
    };
    // Close on outside click (capture)
    (function(){ try { document.addEventListener('click', function(e){ var m = document.getElementById('navMenuDropdown'); var b = document.getElementById('menuBtn'); if (!m) return; var t=e.target; var inside = m.contains(t) || (b && b.contains(t)); if (m.style.display==='block' && !inside) m.style.display='none'; }, true); } catch(_){ }})();
  </script>
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
          <?php if (!($userRole === 'student' && isset($studentStatus) && $studentStatus !== 'accepted')): ?>
          <button class="nav-tab active" data-tab="activities">Activities</button>
          <?php if (strtolower($userRole) !== 'student'): ?>
          <button class="nav-tab" data-tab="classrecord">Class Record</button>
          <?php endif; ?>
          <button class="nav-tab" data-tab="newsfeed">Newsfeed</button>
          <button class="nav-tab" data-tab="leaderboards">Leaderboards</button>
          <?php endif; ?>
        </div>
      </div>
      
      <div class="nav-right">
        <?php if (strtolower($userRole) !== 'student' && strtolower($userRole) !== 'coordinator' && strtolower($userRole) !== 'teacher'): ?>
        <button class="btn-create-activity" id="createActivityBtn">
          <i class="fas fa-plus"></i> Create activity
        </button>
        <?php endif; ?>
        <div style="position: relative; display:inline-block;">
          <button class="nav-menu-btn" id="menuBtn" title="Menu" type="button" onclick="toggleNavMenu(event)" style="position:relative; z-index:3001;">
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <div id="navMenuDropdown" style="display:none; position:absolute; right:0; top:36px; background:#fff; border:1px solid #e5e7eb; box-shadow:0 12px 28px rgba(0,0,0,0.15); border-radius:8px; min-width:200px; z-index:3000;">
            <button id="copyClassCodeMenu" style="width:100%; background:none; border:none; padding:10px 12px; text-align:left; cursor:pointer; font-size:14px; color:#374151;">
              <i class="fas fa-copy" style="margin-right:8px;"></i> Copy Class Code
            </button>
            <?php if (strtolower($userRole) === 'teacher'): ?>
            <button id="unlockAllActivitiesMenu" style="width:100%; background:none; border:none; padding:10px 12px; text-align:left; cursor:pointer; font-size:14px; color:#374151; border-top:1px solid #e5e7eb;">
              <i class="fas fa-unlock-alt" style="margin-right:8px;color:#1d9b3e;"></i> Unlock All Activities
            </button>
            <button id="lockAllActivitiesMenu" style="width:100%; background:none; border:none; padding:10px 12px; text-align:left; cursor:pointer; font-size:14px; color:#374151; border-top:1px solid #e5e7eb;">
              <i class="fas fa-lock" style="margin-right:8px;color:#f59e0b;"></i> Lock All Activities
            </button>
            <button id="archiveClassMenu" style="width:100%; background:none; border:none; padding:10px 12px; text-align:left; cursor:pointer; font-size:14px; color:#374151; border-top:1px solid #e5e7eb;">
              <i class="fas fa-archive" style="margin-right:8px;color:#6b7280;"></i> Archive Class
            </button>
            <?php endif; ?>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-layout">
      <!-- Main Content Area -->
      <div class="main-content">
        <?php 
        // CRITICAL: Debug logging and ensure variable is set
        if ($userRole === 'student') {
            // Ensure studentStatus is always set for students
            if (!isset($studentStatus)) {
                error_log("⚠️ [class_dashboard.php] WARNING: studentStatus not set for student {$userId} in class {$classId}");
                // Try to get it again
                try {
                    $checkStmt = $db->query("SHOW COLUMNS FROM class_students LIKE 'status'");
                    $hasStatus = $checkStmt->rowCount() > 0;
                    if ($hasStatus) {
                        $stmt = $db->prepare("SELECT status FROM class_students WHERE class_id = ? AND student_user_id = ?");
                        $stmt->execute([$classId, $userId]);
                        $enrollment = $stmt->fetch(PDO::FETCH_ASSOC);
                        $studentStatus = $enrollment['status'] ?? 'accepted';
                    } else {
                        $studentStatus = 'accepted';
                    }
                } catch (Exception $e) {
                    $studentStatus = 'accepted';
                }
            }
            error_log("🔍 [class_dashboard.php] Rendering check - userRole: {$userRole}, studentStatus: " . ($studentStatus ?? 'NOT SET'));
            error_log("🔍 [class_dashboard.php] Condition check - userRole === 'student': " . ($userRole === 'student' ? 'YES' : 'NO'));
            error_log("🔍 [class_dashboard.php] Condition check - isset(studentStatus): " . (isset($studentStatus) ? 'YES' : 'NO'));
            error_log("🔍 [class_dashboard.php] Condition check - studentStatus !== 'accepted': " . (($studentStatus ?? '') !== 'accepted' ? 'YES' : 'NO'));
        }
        // Note: We'll show locked content in each section instead of full-page lock
        $isStudentPending = ($userRole === 'student' && isset($studentStatus) && $studentStatus !== 'accepted');
        
        // CRITICAL: Debug output
        if ($userRole === 'student') {
            error_log("🔍 [FINAL CHECK] userRole: {$userRole}, studentStatus: " . ($studentStatus ?? 'NOT SET') . ", isStudentPending: " . ($isStudentPending ? 'YES' : 'NO'));
        }
        ?>
        <section id="tab-classrecord" class="tab-section">
          <div class="card">
            <div class="card-header-row">
              <h3><?php echo $userRole === 'student' ? 'My Progress' : 'Class Record'; ?></h3>
            </div>
            <div style="padding: 20px;">
              <?php if ($userRole === 'student'): ?>
                <p style="color:#6b7280; margin-bottom: 20px;">Track your progress and see your achievements in this class.</p>
                <div style="margin-top: 20px;">
                  <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #1d9b3e;">
                    <h4 style="margin: 0 0 10px 0; color: #1d9b3e;">Your Progress</h4>
                    <p style="margin: 0; color: #666;">Complete activities to track your learning journey!</p>
                  </div>
                </div>
              <?php else: ?>
                <!-- Statistics Cards -->
                <div id="classStatisticsCards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 24px;">
                  <!-- Loading state -->
                  <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6b7280;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
                    <p>Loading statistics...</p>
                  </div>
                </div>
                
                <!-- Student Performance Table -->
                <div style="margin-top: 32px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h4 style="margin: 0; color: #1d9b3e; font-size: 18px; font-weight: 600;">Student Performance</h4>
                    <div style="display: flex; gap: 12px; align-items: center;">
                      <input type="text" id="studentSearchInput" placeholder="Search students..." 
                             style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; width: 200px;"
                             onkeyup="filterStudents()">
                      <select id="sortStudentsSelect" onchange="sortStudents()" 
                              style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; cursor: pointer;">
                        <option value="name">Sort by Name</option>
                        <option value="grade">Sort by Grade</option>
                        <option value="completed">Sort by Completion</option>
                      </select>
                    </div>
                  </div>
                  
                  <div id="studentPerformanceTable" style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <!-- Loading state -->
                    <div style="padding: 40px; text-align: center; color: #6b7280;">
                      <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
                      <p>Loading student performance data...</p>
                    </div>
                  </div>
                </div>
              <?php endif; ?>
            </div>
          </div>
        </section>

        <section id="tab-activities" class="tab-section active">
          <?php if ($isStudentPending): ?>
          <!-- Locked content for pending/rejected students -->
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; padding: 60px 20px; text-align: center;">
            <div style="width: 100px; height: 100px; margin: 0 auto 30px; background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3);">
              <i class="fas fa-lock" style="font-size: 50px; color: white;"></i>
            </div>
            <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 28px; font-weight: 600;">
              <?php echo $studentStatus === 'pending' ? 'Activities Locked' : 'Access Denied'; ?>
            </h2>
            <p style="margin: 0 0 30px 0; color: #6b7280; font-size: 16px; line-height: 1.6; max-width: 500px;">
              <?php if ($studentStatus === 'pending'): ?>
                Your enrollment is pending approval from the teacher. Once accepted, you will be able to access all activities.
              <?php else: ?>
                Your enrollment has been rejected. Please contact the teacher for assistance.
              <?php endif; ?>
            </p>
            <div style="background: <?php echo $studentStatus === 'pending' ? '#fef3c7' : '#fee2e2'; ?>; border-left: 4px solid <?php echo $studentStatus === 'pending' ? '#f59e0b' : '#ef4444'; ?>; padding: 16px 20px; border-radius: 8px; max-width: 500px;">
              <p style="margin: 0; color: <?php echo $studentStatus === 'pending' ? '#92400e' : '#991b1b'; ?>; font-size: 14px; line-height: 1.5;">
                <i class="fas fa-<?php echo $studentStatus === 'pending' ? 'info-circle' : 'exclamation-triangle'; ?>" style="margin-right: 8px;"></i>
                <?php echo $studentStatus === 'pending' ? 'Please wait for the teacher to accept your enrollment request.' : 'You do not have access to this class\'s content.'; ?>
              </p>
            </div>
          </div>
          <?php else: ?>
          <!-- Dynamic Modules Section -->
          <div class="lesson-topics">
            <!-- Modules and lessons will be loaded dynamically here -->
          </div>
          <?php endif; ?>
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
            <?php 
            // CRITICAL: Re-check condition here to ensure it's correct
            // DEBUG: Log all variables before condition check
            error_log("🔍 [NEWSFEED CHECK] userRole: " . ($userRole ?? 'NOT SET') . ", studentStatus: " . ($studentStatus ?? 'NOT SET') . ", isset(studentStatus): " . (isset($studentStatus) ? 'YES' : 'NO'));
            $newsfeedIsLocked = ($userRole === 'student' && isset($studentStatus) && $studentStatus !== 'accepted');
            error_log("🔍 [NEWSFEED CHECK] newsfeedIsLocked result: " . ($newsfeedIsLocked ? 'TRUE (WILL LOCK)' : 'FALSE (WILL NOT LOCK)'));
            if ($newsfeedIsLocked): 
                error_log("🔒 [NEWSFEED] Rendering locked content - Status: " . ($studentStatus ?? 'NOT SET'));
            ?>
            <!-- DEBUG: This section should be visible for pending students -->
            <!-- Status: <?php echo htmlspecialchars($studentStatus ?? 'NOT SET'); ?> | Locked: YES -->
            <!-- Locked content for pending/rejected students -->
            <div id="newsfeed-locked-content" data-locked="true" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; padding: 60px 20px; text-align: center;">
              <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);">
                <i class="fas fa-lock" style="font-size: 40px; color: white;"></i>
              </div>
              <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 22px; font-weight: 600;">Newsfeed Locked</h3>
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; max-width: 400px;">
                <?php echo $studentStatus === 'pending' ? 'Your enrollment is pending approval. Once accepted, you will be able to access the newsfeed.' : 'Your enrollment has been rejected. Please contact the teacher.'; ?>
              </p>
            </div>
            <?php else: 
                error_log("🔓 [NEWSFEED] Rendering normal content - Status: " . ($studentStatus ?? 'NOT SET'));
            ?>
            <!-- DEBUG: This section should be visible for accepted students -->
            <!-- Status: <?php echo htmlspecialchars($studentStatus ?? 'NOT SET'); ?> | Locked: NO -->
            <div id="newsfeed-content" style="padding: 32px; color:#6b7280;">Coming soon.</div>
            <?php endif; ?>
          </div>
        </section>
        
        <section id="tab-leaderboards" class="tab-section">
          <div class="card">
            <div class="card-header-row">
              <h3>Leaderboards</h3>
            </div>
            <div id="class-leaderboards-content" style="padding: 12px;">
              <?php 
              // CRITICAL: Re-check condition here to ensure it's correct
              // DEBUG: Log all variables before condition check
              error_log("🔍 [LEADERBOARDS CHECK] userRole: " . ($userRole ?? 'NOT SET') . ", studentStatus: " . ($studentStatus ?? 'NOT SET') . ", isset(studentStatus): " . (isset($studentStatus) ? 'YES' : 'NO'));
              $leaderboardsIsLocked = ($userRole === 'student' && isset($studentStatus) && $studentStatus !== 'accepted');
              error_log("🔍 [LEADERBOARDS CHECK] leaderboardsIsLocked result: " . ($leaderboardsIsLocked ? 'TRUE (WILL LOCK)' : 'FALSE (WILL NOT LOCK)'));
              if ($leaderboardsIsLocked): 
                  error_log("🔒 [LEADERBOARDS] Rendering locked content - Status: " . ($studentStatus ?? 'NOT SET'));
              ?>
              <!-- DEBUG: This section should be visible for pending students -->
              <!-- Status: <?php echo htmlspecialchars($studentStatus ?? 'NOT SET'); ?> | Locked: YES -->
              <!-- Locked content for pending/rejected students -->
              <div id="leaderboards-locked-content" data-locked="true" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; padding: 60px 20px; text-align: center;">
                <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);">
                  <i class="fas fa-lock" style="font-size: 40px; color: white;"></i>
                </div>
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 22px; font-weight: 600;">Leaderboards Locked</h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; max-width: 400px;">
                  <?php echo $studentStatus === 'pending' ? 'Your enrollment is pending approval. Once accepted, you will be able to view the leaderboards.' : 'Your enrollment has been rejected. Please contact the teacher.'; ?>
                </p>
              </div>
              <?php else: 
                  error_log("🔓 [LEADERBOARDS] Rendering normal content - Status: " . ($studentStatus ?? 'NOT SET'));
              ?>
              <!-- DEBUG: This section should be visible for accepted students -->
              <!-- Status: <?php echo htmlspecialchars($studentStatus ?? 'NOT SET'); ?> | Locked: NO -->
              <div id="leaderboards-loading" style="text-align:center;padding:40px;color:#6b7280;">
                <i class="fas fa-spinner fa-spin" style="font-size:32px;color:#1d9b3e;margin-bottom:16px;"></i>
                <p style="color:#6b7280;font-size:14px;">Loading leaderboards...</p>
              </div>
              <?php endif; ?>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>

  <script>window.__CLASS_ID__ = <?php echo json_encode($classId); ?>;</script>
  <script>window.__USER_ROLE__ = <?php echo json_encode($userRole); ?>;</script>
  <script>window.__USER_ID__ = <?php echo json_encode($userId); ?>;</script>
  <?php
  // Get user's name for newsfeed
  $userNameStmt = $db->prepare("SELECT firstname, middlename, lastname FROM users WHERE id = ?");
  $userNameStmt->execute([$userId]);
  $userNameData = $userNameStmt->fetch(PDO::FETCH_ASSOC);
  $userFirstName = $userNameData['firstname'] ?? '';
  $userFullName = trim(($userNameData['firstname'] ?? '') . ' ' . ($userNameData['middlename'] ?? '') . ' ' . ($userNameData['lastname'] ?? ''));
  if (empty(trim($userFullName))) {
    $userFullName = 'User';
  }
  ?>
  <script>window.__USER_FIRSTNAME__ = <?php echo json_encode($userFirstName); ?>;</script>
  <script>window.__USER_FULLNAME__ = <?php echo json_encode($userFullName); ?>;</script>
  <?php 
  // CRITICAL: Always set studentStatus for students, default to 'accepted' for others
  if ($userRole === 'student') {
      $jsStudentStatus = isset($studentStatus) ? $studentStatus : 'accepted';
      error_log("🔍 [class_dashboard.php] Setting window.__STUDENT_STATUS__ = " . $jsStudentStatus);
  ?>
  <script>window.__STUDENT_STATUS__ = <?php echo json_encode($jsStudentStatus); ?>;</script>
  <script>console.log('🔍 [JS] window.__STUDENT_STATUS__ =', window.__STUDENT_STATUS__);</script>
  <?php } else { ?>
  <script>window.__STUDENT_STATUS__ = 'accepted';</script>
  <?php } ?>
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

      // Kebab menu actions
      function toggleNavMenu(ev){
        var menu = document.getElementById('navMenuDropdown');
        if (!menu) return; if (ev){ ev.preventDefault(); ev.stopPropagation(); }
        menu.style.display = (menu.style.display==='block' ? 'none' : 'block');
      }
      (function(){
        var menuBtn = document.getElementById('menuBtn');
        var menu = document.getElementById('navMenuDropdown');
        if (menuBtn && menu){
          function toggleMenu(ev){ ev && ev.stopPropagation(); toggleNavMenu(ev); }
          menuBtn.addEventListener('click', toggleMenu);
          menuBtn.addEventListener('pointerdown', function(e){ e.stopPropagation(); });
          document.addEventListener('click', function(e){ var inside = menu.contains(e.target) || (menuBtn && menuBtn.contains(e.target)); if (menu.style.display==='block' && !inside) menu.style.display='none'; }, true);
        }
        var copyBtn = document.getElementById('copyClassCodeMenu');
        if (copyBtn){ copyBtn.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); menu.style.display='none'; try { navigator.clipboard.writeText(document.getElementById('courseCode').textContent || ''); } catch(_){} }); }
        var unlockAllBtn = document.getElementById('unlockAllActivitiesMenu');
        if (unlockAllBtn){
          unlockAllBtn.addEventListener('click', function(e){ 
            e.preventDefault(); 
            e.stopPropagation(); 
            menu.style.display='none';
            if (typeof unlockAllActivities === 'function') {
              unlockAllActivities();
            } else {
              alert('Unlock All Activities function not available. Please refresh the page.');
            }
          });
        }
        var lockAllBtn = document.getElementById('lockAllActivitiesMenu');
        if (lockAllBtn){
          lockAllBtn.addEventListener('click', function(e){ 
            e.preventDefault(); 
            e.stopPropagation(); 
            menu.style.display='none';
            if (typeof lockAllActivities === 'function') {
              lockAllActivities();
            } else {
              alert('Lock All Activities function not available. Please refresh the page.');
            }
          });
        }
        var archiveBtn = document.getElementById('archiveClassMenu');
        if (archiveBtn){
          archiveBtn.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); menu.style.display='none';
            var id = window.__CLASS_ID__;
            var fd = new FormData(); fd.append('action','archive'); fd.append('id', id);
            fetch('class_manage.php', { method:'POST', credentials:'same-origin', body: fd })
              .then(function(r){ return r.json().catch(function(){ return {}; }); })
              .then(function(j){ if (j && j.success){
                  try { 
                    if (window.parent && typeof window.parent.showNotification === 'function') {
                      window.parent.showNotification('success', 'Archived', 'Class archived successfully');
                    } else if (typeof window.showNotification === 'function') {
                      window.showNotification('success', 'Archived', 'Class archived successfully');
                    }
                  } catch(_){ }
                  try { if (window.parent && window.parent.loadArchivedForSection) window.parent.loadArchivedForSection(); } catch(_){ }
                  try { if (window.parent && window.parent.__teacherLoadActive) window.parent.__teacherLoadActive(); } catch(_){ }
                  try { if (window.parent && window.parent.exitEmbeddedClass) window.parent.exitEmbeddedClass(); else window.location.href='teacher_dashboard.php?section=my-classes'; } catch(_){ window.location.href='teacher_dashboard.php?section=my-classes'; }
                } else { 
                  try {
                    if (window.parent && typeof window.parent.showNotification === 'function') {
                      window.parent.showNotification('error', 'Error', 'Failed to archive class');
                    } else if (typeof window.showNotification === 'function') {
                      window.showNotification('error', 'Error', 'Failed to archive class');
                    } else {
                      alert('Archive failed');
                    }
                  } catch(_){ alert('Archive failed'); }
                }
              })
              .catch(function(){ 
                try {
                  if (window.parent && typeof window.parent.showNotification === 'function') {
                    window.parent.showNotification('error', 'Error', 'Network error. Failed to archive class');
                  } else if (typeof window.showNotification === 'function') {
                    window.showNotification('error', 'Error', 'Network error. Failed to archive class');
                  } else {
                    alert('Archive failed');
                  }
                } catch(_){ alert('Archive failed'); }
              });
          });
        }
      })();
    });
  </script>
</body>
</html>

