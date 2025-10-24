<?php
/**
 * STUDENT DASHBOARD
 * Using original auth system to avoid redirect loops
 */
session_start();
require_once 'config.php';
require_once 'classes/auth_helpers.php';
require_once 'classes/ProfileService.php';
require_once 'config/Database.php';

// Use original auth system
Auth::requireAuth();
Auth::requireRole('student');

// Get user profile data
$db = (new Database())->getConnection();
$profileService = new ProfileService($db);
$userProfile = $profileService->getUserProfile($_SESSION['user_id']);
$profilePhotoUrl = $profileService->getProfilePhotoUrl($_SESSION['user_id']);

$lastname = $userProfile['lastname'] ?? $_SESSION['user_lastname'] ?? '';
$firstname = $userProfile['firstname'] ?? $_SESSION['user_firstname'] ?? '';
$middlename = $userProfile['middlename'] ?? $_SESSION['user_middlename'] ?? '';
$middle_initial = $middlename ? strtoupper(mb_substr(trim($middlename), 0, 1)) . '.' : '';
$user_name = trim($lastname . ', ' . $firstname . ' ' . $middle_initial);
if (!$lastname && !$firstname) $user_name = 'Student';
$user_role = $_SESSION['user_role'] ?? 'Student';

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
  <!-- Theme Variables (must load first) -->
  <link rel="stylesheet" href="assets/css/theme.css">
  <!-- Shared UI Styles -->
  <link rel="stylesheet" href="assets/css/admin_panel.css">
  <!-- Font Awesome 5 - cache-busted to avoid stale CDN cache during development -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css?v=<?php echo time(); ?>">
  <!-- Student-specific Styles -->
  <link rel="stylesheet" href="assets/css/student_dashboard.css">
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
  <button class="menu-toggle" onclick="toggleSidebar()">
    <i class="fas fa-bars"></i>
  </button>

  <!-- Sidebar -->
    <div class="sidebar" id="sidebar">
    <div class="user-profile">
      <div class="user-avatar">
        <?php if ($profilePhotoUrl): ?>
          <img src="<?php echo htmlspecialchars($profilePhotoUrl); ?>" alt="Profile Photo" class="profile-photo">
        <?php else: ?>
          <i class="fas fa-user-circle"></i>
        <?php endif; ?>
      </div>
        <div class="user-name"><?php echo htmlspecialchars($user_name); ?></div>
    </div>
    
    <nav class="sidebar-nav">
      <ul>
        <li class="nav-item <?php echo $current_section === 'myclasses' ? 'active' : ''; ?>" data-section="myclasses" onclick="showSection('myclasses', this)">
          <i class="fas fa-book-open"></i>
          <span>My Classes</span>
        </li>
        <li class="nav-item <?php echo $current_section === 'newsfeed' ? 'active' : ''; ?>" data-section="newsfeed" onclick="showSection('newsfeed', this)">
          <i class="fas fa-newspaper"></i>
          <span>Newsfeed</span>
        </li>
        <li class="nav-item <?php echo $current_section === 'leaderboards' ? 'active' : ''; ?>" data-section="leaderboards" onclick="showSection('leaderboards', this)">
          <i class="fas fa-trophy"></i>
          <span>Leaderboards</span>
        </li>
        <li class="nav-item <?php echo $current_section === 'certification' ? 'active' : ''; ?>" data-section="certification" onclick="showSection('certification', this)">
          <i class="fas fa-certificate"></i>
          <span>Certification</span>
        </li>
        <li class="nav-item <?php echo $current_section === 'profile' ? 'active' : ''; ?>" data-section="profile" onclick="showSection('profile', this)">
          <i class="fas fa-user"></i>
          <span>Profile</span>
        </li>
      </ul>
    </nav>
  </div>

  <!-- Main Content -->
  <div class="main-content student-main-content" id="mainContent">
    <!-- My Classes Section -->
    <div id="myclasses" class="section-content <?php echo $current_section === 'myclasses' ? 'active' : ''; ?>">
      <div class="section-title">My Classes</div>
            <p>View and manage your enrolled classes here.</p>
        </div>

    <!-- Newsfeed Section -->
    <div id="newsfeed" class="section-content <?php echo $current_section === 'newsfeed' ? 'active' : ''; ?>">
      <div class="section-title">Newsfeed</div>
            <p>See the latest updates and announcements.</p>
        </div>

    <!-- Leaderboards Section -->
    <div id="leaderboards" class="section-content <?php echo $current_section === 'leaderboards' ? 'active' : ''; ?>">
      <div class="section-title">Leaderboards</div>
            <p>Check your ranking and achievements.</p>
        </div>

    <!-- Certification Section -->
    <div id="certification" class="section-content <?php echo $current_section === 'certification' ? 'active' : ''; ?>">
      <div class="section-title">Certification</div>
            <p>View and download your certificates.</p>
    </div>

    <!-- Profile Section -->
    <div id="profile" class="section-content <?php echo $current_section === 'profile' ? 'active' : ''; ?>">
      <?php include 'includes/profile_section.php'; ?>
    </div>
  </div>

  <!-- Confirmation Modal (required for profile photo functionality) -->
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
        <button id="confirmationCancelBtn" class="confirmation-btn confirmation-cancel">
          <i class="fas fa-times"></i> Cancel
        </button>
        <button id="confirmationConfirmBtn" class="confirmation-btn confirmation-confirm">
          <i class="fas fa-check"></i> Confirm
        </button>
        </div>
    </div>
  </div>

  <!-- Scripts -->
  <!-- Load all scripts in proper order -->
  <script src="assets/js/admin_panel.js"></script>
  <script src="assets/js/shared_profile.js"></script>
  <script src="assets/js/student_dashboard.js"></script>
  
    <script>
    // Immediate section visibility fix - runs before other scripts
    document.addEventListener('DOMContentLoaded', function() {
      console.log('🚀 Student Dashboard: Immediate section fix running...');
      
      // Force hide all sections immediately
      const sections = document.querySelectorAll('.section-content');
      sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
        console.log(`  - Hidden: ${section.id}`);
      });
      
      // AGGRESSIVE FIX: Hide any profile content outside of profile section
      const profileContainers = document.querySelectorAll('.profile-container');
      profileContainers.forEach(container => {
        const profileSection = document.getElementById('profile');
        if (profileSection && !profileSection.contains(container)) {
          container.style.display = 'none';
          console.log('🚫 Hidden profile content outside profile section');
        }
      });
      
      // Show only the current section
      const currentSection = '<?php echo $current_section; ?>';
      const targetSection = document.getElementById(currentSection);
      if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
        console.log(`✅ Student Dashboard: Showing ${currentSection}`);
      } else {
        // Default to myclasses
        const defaultSection = document.getElementById('myclasses');
        if (defaultSection) {
          defaultSection.style.display = 'block';
          defaultSection.classList.add('active');
          console.log('✅ Student Dashboard: Defaulted to myclasses');
        }
      }
    });
    
    // Initialize everything after DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
      console.log('🚀 Student Dashboard: Initializing all functionality...');
      
      // Wait a bit for all scripts to load
      setTimeout(function() {
        console.log('🔧 Student Dashboard: Starting initialization...');
        
        // Check if showNotification is available
        if (typeof window.showNotification === 'function') {
          console.log('✅ showNotification is available');
        } else {
          console.error('❌ showNotification is NOT available');
          // Create fallback
          window.showNotification = function(type, title, message) {
            console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
            alert(`${title}: ${message}`);
          };
        }
        
        // Initialize shared profile functionality
        if (typeof initSharedProfile === 'function') {
          console.log('🔧 Initializing shared profile...');
          initSharedProfile();
          console.log('✅ Shared profile functionality initialized');
        } else {
          console.error('❌ initSharedProfile function not found');
        }
        
        // Initialize student dashboard
        if (typeof initializeStudentDashboard === 'function') {
          console.log('🔧 Initializing student dashboard...');
          initializeStudentDashboard();
          console.log('✅ Student dashboard initialized');
        } else {
          console.error('❌ initializeStudentDashboard function not found');
        }
        
        // Test if functions are working
        console.log('🧪 Testing function availability:');
        const testFunctions = ['showNotification', 'initSharedProfile', 'initializeStudentDashboard', 'uploadProfilePhoto', 'removeProfilePhoto', 'updatePersonalInfo', 'changePassword'];
        testFunctions.forEach(funcName => {
          if (typeof window[funcName] === 'function') {
            console.log(`✅ ${funcName} is available`);
          } else {
            console.log(`❌ ${funcName} is NOT available`);
          }
        });
        
      }, 1000);
    });
  </script>
  <script>
    // Student-only guard: ensure remove photo works reliably on this page without affecting other roles
    (function(){
      document.addEventListener('DOMContentLoaded', function(){
        // Override only on student dashboard page
        window.removeProfilePhoto = function() {
          console.log('[Student] removeProfilePhoto override invoked');
          if (typeof window.showConfirmation === 'function') {
            window.showConfirmation(
              'Remove Profile Photo',
              'Are you sure you want to remove your profile photo? This action cannot be undone.',
              function(){}
            );
            // One-time handler bound after modal opens to avoid other role logic swallowing the event
            setTimeout(function(){
              const btn = document.getElementById('confirmationConfirmBtn');
              if (!btn) { console.warn('[Student] Confirm button not found'); return; }
              if (btn.__studentRemoveBound) { console.log('[Student] Confirm already bound'); return; }
              btn.__studentRemoveBound = true;
              btn.addEventListener('click', function onConfirm(){
                // Ensure handler runs only once
                btn.removeEventListener('click', onConfirm);
                btn.__studentRemoveBound = false;
                console.log('[Student] Confirm clicked, sending remove request...');
                const formData = new FormData();
                formData.append('action', 'remove_photo');
                fetch('profile_action.php', { method: 'POST', body: formData, credentials: 'same-origin' })
                  .then(r=>r.json())
                  .then(data=>{
                    console.log('[Student] Remove response:', data);
                    if (data && data.success) {
                      if (typeof window.updateProfilePhotos === 'function') window.updateProfilePhotos(null);
                      const sidebarAvatar = document.querySelector('.user-avatar');
                      if (sidebarAvatar) sidebarAvatar.innerHTML = '<i class=\"fas fa-user-circle\"></i>';
                      if (typeof window.showNotification === 'function') window.showNotification('success','Success','Profile photo removed successfully!');
                    } else {
                      if (typeof window.showNotification === 'function') window.showNotification('error','Error', (data && data.message) || 'Failed to remove photo');
                    }
                    if (typeof window.hideConfirmation === 'function') window.hideConfirmation();
                  })
                  .catch(function(err){ console.error('[Student] Remove error:', err); if (typeof window.showNotification === 'function') window.showNotification('error','Error','Network error.'); });
              });
              console.log('[Student] One-time confirm handler attached');
            }, 0);
          } else {
            if (window.confirm('Remove your profile photo? This action cannot be undone.')) {
              console.log('[Student] Fallback confirm accepted, sending request...');
              const formData = new FormData();
              formData.append('action','remove_photo');
              fetch('profile_action.php', { method:'POST', body: formData, credentials:'same-origin' })
                .then(r=>r.json())
                .then(function(data){ console.log('[Student] Remove response (fallback):', data); if (data && data.success) { if (typeof window.updateProfilePhotos==='function') window.updateProfilePhotos(null); if (typeof window.showNotification==='function') window.showNotification('success','Success','Profile photo removed successfully!'); } else { if (typeof window.showNotification==='function') window.showNotification('error','Error',(data&&data.message)||'Failed to remove photo'); } })
                .catch(function(err){ console.error('[Student] Remove error (fallback):', err); });
            }
          }
        };

        // Safety net: if modal confirm is clicked and title matches, run removal (student page only)
        document.addEventListener('click', function(e){
          const confirmBtn = e.target && (e.target.id === 'confirmationConfirmBtn' ? e.target : e.target.closest && e.target.closest('#confirmationConfirmBtn'));
          if (!confirmBtn) return;
          const titleEl = document.getElementById('confirmationTitle');
          if (!titleEl) return;
          if (titleEl.textContent && titleEl.textContent.indexOf('Remove Profile Photo') !== -1) {
            e.preventDefault();
            console.log('[Student] Safety net confirm handler fired');
            const formData = new FormData();
            formData.append('action','remove_photo');
            fetch('profile_action.php', { method:'POST', body: formData, credentials:'same-origin' })
              .then(r=>r.json())
              .then(function(data){
                console.log('[Student] Safety net remove response:', data);
                if (data && data.success) {
                  if (typeof window.updateProfilePhotos==='function') window.updateProfilePhotos(null);
                  const sidebarAvatar = document.querySelector('.user-avatar');
                  if (sidebarAvatar) sidebarAvatar.innerHTML = '<i class="fas fa-user-circle"></i>';
                  if (typeof window.showNotification==='function') window.showNotification('success','Success','Profile photo removed successfully!');
                } else {
                  if (typeof window.showNotification==='function') window.showNotification('error','Error',(data&&data.message)||'Failed to remove photo');
                }
                if (typeof window.hideConfirmation==='function') window.hideConfirmation();
              })
              .catch(function(err){ console.error('[Student] Safety net remove error:', err); if (typeof window.showNotification==='function') window.showNotification('error','Error','Network error.'); });
          }
        }, true);
      });
    })();
    </script>
</body>
</html> 