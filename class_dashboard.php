<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/auth_helpers.php';
Auth::requireAuth();

$classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);
if ($classId <= 0) { header('Location: teacher_dashboard.php'); exit; }

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
          <button class="nav-tab" data-tab="overview">Overview</button>
          <button class="nav-tab active" data-tab="activities">Activities</button>
          <button class="nav-tab" data-tab="students">Students</button>
          <button class="nav-tab" data-tab="grades">Grades</button>
        </div>
      </div>
      
      <div class="nav-right">
        <button class="btn-create-activity" id="createActivityBtn">
          <i class="fas fa-plus"></i> Create activity
        </button>
        <button class="nav-menu-btn" id="menuBtn">
          <i class="fas fa-ellipsis-v"></i>
        </button>
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
        
        <div class="sidebar-section">
          <h3 class="sidebar-title">
            <i class="fas fa-lock"></i>
            Class code
          </h3>
          <div class="class-code-info">
            <p>You need to partner with us first to invite students.</p>
            <button class="btn-partner">
              <i class="fas fa-phone"></i>
              Book a call to partner
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="main-content">
        <section id="tab-overview" class="tab-section">
          <div class="overview-grid">
            <div class="card">
              <div class="card-header-row">
                <h3>Teaching today</h3>
                <button class="btn tiny" id="startLessonBtn"><i class="fas fa-play"></i> Start</button>
              </div>
              <div id="teachingToday">No lesson planned for today.</div>
            </div>
            <div class="card">
              <div class="card-header-row">
                <h3>Needs grading</h3>
                <button class="btn tiny" id="openGradesBtn"><i class="fas fa-arrow-right"></i></button>
              </div>
              <ul class="simple-list" id="needsGradingList"><li>Nothing pending</li></ul>
            </div>
            <div class="card">
              <div class="card-header-row">
                <h3>Unpublished items</h3>
                <button class="btn tiny" id="reviewDraftsBtn"><i class="fas fa-eye"></i></button>
              </div>
              <ul class="simple-list" id="unpublishedList"><li>No drafts</li></ul>
            </div>
          </div>
        </section>

        <section id="tab-activities" class="tab-section active">
          <div class="lesson-header" style="text-align: center !important; display: flex; flex-direction: column; align-items: center;">
            <h2 class="lesson-title" style="text-align: center !important; margin: 0 0 8px 0; font-size: 16px; font-weight: 500; color: #64748b;">MODULE 1</h2>
            <h1 class="lesson-main-title" style="text-align: center !important; margin: 0; font-size: 32px; font-weight: 700; color: #1e293b; line-height: 1.2;">Introduction to Computer Programming</h1>
          </div>
          
          <!-- Module Topics Section -->
          <div class="module-section">
            <h3 class="section-title">📚 Module Topics</h3>
            <div class="lesson-topics">
              <div class="topic-item">
                <div class="topic-header">
                  <i class="fas fa-chevron-down topic-toggle"></i>
                  <span class="topic-title">TOPIC 1: The Computer Systems</span>
                  <div class="topic-meta">
                    <span class="topic-status">Hardware & Software</span>
                    <span class="topic-count">Lecture + Lab</span>
                  </div>
                </div>
              </div>
              
              <div class="topic-item">
                <div class="topic-header">
                  <i class="fas fa-chevron-down topic-toggle"></i>
                  <span class="topic-title">TOPIC 2: Analog vs. Digital Computers</span>
                  <div class="topic-meta">
                    <span class="topic-status">Characteristics & Applications</span>
                    <span class="topic-count">Lecture Only</span>
                  </div>
                </div>
              </div>
              
              <div class="topic-item">
                <div class="topic-header">
                  <i class="fas fa-chevron-down topic-toggle"></i>
                  <span class="topic-title">TOPIC 3: Programming Languages</span>
                  <div class="topic-meta">
                    <span class="topic-status">Machine, Assembly, High-level</span>
                    <span class="topic-count">Lecture Only</span>
                  </div>
                </div>
              </div>
              
              <div class="topic-item">
                <div class="topic-header">
                  <i class="fas fa-chevron-down topic-toggle"></i>
                  <span class="topic-title">TOPIC 4: Scripting Languages</span>
                  <div class="topic-meta">
                    <span class="topic-status">Python, JavaScript, Bash</span>
                    <span class="topic-count">Lecture Only</span>
                  </div>
                </div>
              </div>
              
              <div class="topic-item">
                <div class="topic-header">
                  <i class="fas fa-chevron-down topic-toggle"></i>
                  <span class="topic-title">TOPIC 5: Programming Paradigm</span>
                  <div class="topic-meta">
                    <span class="topic-status">OOP, Functional, Procedural</span>
                    <span class="topic-count">Lecture Only</span>
                  </div>
                </div>
              </div>
              
              <div class="topic-item">
                <div class="topic-header">
                  <i class="fas fa-chevron-down topic-toggle"></i>
                  <span class="topic-title">TOPIC 6: Number Systems</span>
                  <div class="topic-meta">
                    <span class="topic-status">Binary, Octal, Hex, Decimal</span>
                    <span class="topic-count">Lecture + Lab</span>
                  </div>
                </div>
              </div>
              
              <div class="topic-item">
                <div class="topic-header">
                  <i class="fas fa-chevron-down topic-toggle"></i>
                  <span class="topic-title">TOPIC 7: Number System Conversion</span>
                  <div class="topic-meta">
                    <span class="topic-status">Conversion Methods & Shortcuts</span>
                    <span class="topic-count">Lecture + Lab</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Exercises Section -->
          <div class="module-section">
            <h3 class="section-title">📚 Exercises</h3>
            <div class="exercise-grid">
              <div class="exercise-card">
                <div class="exercise-header">
                  <i class="fas fa-question-circle exercise-icon"></i>
                  <h4>Self-Check Questions</h4>
                </div>
                <div class="exercise-content">
                  <p class="exercise-description">15 multiple choice questions covering all 7 topics</p>
                  <div class="exercise-meta">
                    <span class="exercise-count">15 Questions</span>
                    <span class="exercise-type">Multiple Choice</span>
                  </div>
                  <button class="exercise-btn" onclick="startSelfCheck()">
                    <i class="fas fa-play"></i> Start Quiz
                  </button>
                </div>
              </div>

              <div class="exercise-card">
                <div class="exercise-header">
                  <i class="fas fa-clipboard-list exercise-icon"></i>
                  <h4>30-Item Quiz</h4>
                </div>
                <div class="exercise-content">
                  <p class="exercise-description">Comprehensive assessment of all module topics</p>
                  <div class="exercise-meta">
                    <span class="exercise-count">30 Questions</span>
                    <span class="exercise-type">Timed Assessment</span>
                  </div>
                  <button class="exercise-btn" onclick="startMainQuiz()">
                    <i class="fas fa-play"></i> Start Quiz
                  </button>
                </div>
              </div>

              <div class="exercise-card">
                <div class="exercise-header">
                  <i class="fas fa-chalkboard exercise-icon"></i>
                  <h4>Board Recitation</h4>
                </div>
                <div class="exercise-content">
                  <p class="exercise-description">Interactive number system conversion practice</p>
                  <div class="exercise-meta">
                    <span class="exercise-count">3 Problems</span>
                    <span class="exercise-type">Step-by-Step</span>
                  </div>
                  <button class="exercise-btn" onclick="startBoardRecitation()">
                    <i class="fas fa-play"></i> Start Practice
                  </button>
                </div>
              </div>
              <div class="exercise-card">
                <div class="exercise-header">
                  <i class="fas fa-desktop exercise-icon"></i>
                  <h4>Hardware Identification</h4>
                </div>
                <div class="exercise-content">
                  <p class="exercise-description">Identify and match computer hardware components</p>
                  <div class="exercise-meta">
                    <span class="exercise-count">8 Components</span>
                    <span class="exercise-type">Matching Game</span>
                  </div>
                  <button class="exercise-btn" onclick="startHardwareID()">
                    <i class="fas fa-play"></i> Start Activity
                  </button>
                </div>
              </div>

              <div class="exercise-card">
                <div class="exercise-header">
                  <i class="fas fa-calculator exercise-icon"></i>
                  <h4>Number System Converter</h4>
                </div>
                <div class="exercise-content">
                  <p class="exercise-description">Practice converting between different number systems</p>
                  <div class="exercise-meta">
                    <span class="exercise-count">Multiple Conversions</span>
                    <span class="exercise-type">Interactive Tool</span>
                  </div>
                  <button class="exercise-btn" onclick="startNumberConverter()">
                    <i class="fas fa-play"></i> Start Tool
                  </button>
                </div>
              </div>

              <div class="exercise-card">
                <div class="exercise-header">
                  <i class="fas fa-list-check exercise-icon"></i>
                  <h4>Hardware Worksheet</h4>
                </div>
                <div class="exercise-content">
                  <p class="exercise-description">Match hardware components with their functions</p>
                  <div class="exercise-meta">
                    <span class="exercise-count">8 Matches</span>
                    <span class="exercise-type">Drag & Drop</span>
                  </div>
                  <button class="exercise-btn" onclick="startHardwareWorksheet()">
                    <i class="fas fa-play"></i> Start Worksheet
                  </button>
                </div>
              </div>
            </div>
          </div>
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
        
        <section id="tab-students" class="tab-section">
          <div class="card">Students will appear here.</div>
        </section>
        
        <section id="tab-grades" class="tab-section">
          <div class="card">Grades will appear here.</div>
        </section>
      </div>
    </div>
  </div>

  <script>window.__CLASS_ID__ = <?php echo json_encode($classId); ?>;</script>
  <script src="assets/js/class_dashboard.js?v=<?php echo time(); ?>"></script>
</body>
</html>

