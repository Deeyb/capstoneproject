// ===== STUDENT DASHBOARD JAVASCRIPT - MIRROR DESIGN =====

// ===== SESSION KEEP-ALIVE MECHANISM =====
// Prevent session timeout by updating last_activity every 60 seconds
(function initSessionKeepAlive() {
    function keepSessionAlive() {
        // Make a lightweight request to update session activity
        fetch('check_login_status.php?ping=1', {
            method: 'GET',
            credentials: 'same-origin',
            cache: 'no-cache'
        }).catch(function(err) {
            console.warn('Session keep-alive failed:', err);
        });
    }
    
    // Start keep-alive every 60 seconds (before 2-3 minute timeout)
    setInterval(keepSessionAlive, 60000);
    
    // Also update on user activity (mouse movement, clicks, keyboard)
    let activityTimeout;
    function onUserActivity() {
        clearTimeout(activityTimeout);
        activityTimeout = setTimeout(keepSessionAlive, 30000); // Update after 30 seconds of activity
    }
    
    document.addEventListener('mousemove', onUserActivity);
    document.addEventListener('click', onUserActivity);
    document.addEventListener('keypress', onUserActivity);
    
    console.log('✅ Session keep-alive mechanism initialized');
})();

// Global variables
let currentSection = 'myclasses';

// Utility function to escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===== SIDEBAR FUNCTIONALITY =====

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  if (sidebar && mainContent) {
    // For mobile, use 'open' class
    if (window.innerWidth <= 900) {
      sidebar.classList.toggle('open');
    } else {
      // For desktop, use the admin panel behavior
      sidebar.classList.toggle('closed');
      mainContent.classList.toggle('full');
    }
  }
}

// Global sidebar minimize/collapse function
function toggleSidebarMinimize() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  
  sidebar.classList.toggle('collapsed');
  
  // Save state to localStorage
  const isCollapsed = sidebar.classList.contains('collapsed');
  try {
    localStorage.setItem('sidebarCollapsed', isCollapsed ? 'true' : 'false');
  } catch (e) {
    console.warn('Could not save sidebar state to localStorage');
  }
  
  // Update main content margin
  updateMainContentMargin();
}

// Update main content margin based on sidebar state
function updateMainContentMargin() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  
  const isCollapsed = sidebar.classList.contains('collapsed');
  const mainContent = document.querySelector('.main-content, .student-main-content, #mainContent');
  
  if (mainContent) {
    if (isCollapsed) {
      mainContent.style.marginLeft = '70px';
    } else {
      mainContent.style.marginLeft = '250px';
    }
  }
}

// Restore sidebar state on page load
document.addEventListener('DOMContentLoaded', function() {
  try {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        sidebar.classList.add('collapsed');
        updateMainContentMargin();
      }
    }
  } catch (e) {
    console.warn('Could not restore sidebar state from localStorage');
  }
});

// Section navigation
function showSection(sectionName, clickedElement = null) {
  console.log('🔄 Switching to section:', sectionName);
  console.log('🎯 Clicked element:', clickedElement);
  
  // Hide all sections (using BOTH CSS classes AND inline styles like coordinator)
  const sections = document.querySelectorAll('.section-content');
  console.log('📋 Found sections:', sections.length);
  sections.forEach(section => {
    section.classList.remove('active');
    section.style.display = 'none';  // ADD THIS LINE - FORCE HIDE
    console.log('❌ Removed active from:', section.id);
  });
  
  // Remove active class from all nav items
  const navItems = document.querySelectorAll('.nav-item');
  console.log('📋 Found nav items:', navItems.length);
  navItems.forEach(item => {
    item.classList.remove('active');
  });
  
  // Show selected section (using BOTH CSS classes AND inline styles)
  const targetSection = document.getElementById(sectionName);
  console.log('🎯 Target section:', targetSection);
  if (targetSection) {
    targetSection.classList.add('active');
    targetSection.style.display = 'block';  // ADD THIS LINE - FORCE SHOW
    console.log('✅ Added active to:', sectionName);
    console.log('📊 Section display style:', window.getComputedStyle(targetSection).display);
  } else {
    console.error('❌ Section not found:', sectionName);
  }
  
  // Add active class to clicked nav item
  if (clickedElement) {
    clickedElement.classList.add('active');
    console.log('✅ Added active to nav item');
  }
  
  // Update current section
  currentSection = sectionName;
  
  // Update URL without page reload
  const url = new URL(window.location);
  url.searchParams.set('section', sectionName);
  window.history.pushState({}, '', url);
  console.log('🔗 URL updated to:', url.toString());
  
  // Initialize section-specific functionality
  if (sectionName === 'profile') {
    console.log('👤 Loading Profile section...');
    // Initialize shared profile functionality
    if (typeof initSharedProfile === 'function') {
      try { 
        initSharedProfile(); 
        console.log('✅ Profile section initialized');
      } catch (e) { 
        console.error('❌ Error initializing profile:', e);
      }
    } else {
      console.log('⚠️ initSharedProfile function not available');
    }
  } else if (sectionName === 'leaderboards') {
    console.log('🏆 Loading Leaderboards section...');
    // Leaderboards are per-class, so we just show a message directing users to select a class
    // The actual leaderboards are shown in the class dashboard's Leaderboards tab
  }
}

// ===== JOIN CLASS FUNCTIONALITY =====

function openJoinClassModal() {
  const modal = document.getElementById('joinClassModal');
  if (modal) {
    modal.style.display = 'block';
    // Focus on input
    setTimeout(() => {
      const input = document.getElementById('classCode');
      if (input) input.focus();
    }, 100);
  }
}

function closeJoinClassModal() {
  const modal = document.getElementById('joinClassModal');
  if (modal) {
    modal.style.display = 'none';
    // Clear form
    const form = document.getElementById('joinClassForm');
    if (form) form.reset();
    // Hide error
    const error = document.getElementById('joinClassError');
    if (error) error.style.display = 'none';
  }
}

function handleJoinClass() {
  const classCode = document.getElementById('classCode').value.trim();
  const errorDiv = document.getElementById('joinClassError');
  
  if (!classCode) {
    errorDiv.textContent = 'Please enter a class code';
    errorDiv.style.display = 'block';
    return;
  }
  
  // Show loading state
  errorDiv.style.display = 'none';
  const joinBtn = document.querySelector('#joinClassModal .btn-primary');
  const originalText = joinBtn.textContent;
  joinBtn.textContent = 'Joining...';
  joinBtn.disabled = true;
  
  // Make API call
  fetch('join_class.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      class_code: classCode
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      if (typeof window.showNotification === 'function') {
        window.showNotification('success', 'Success', `Successfully joined ${data.class ? data.class.name : 'the class'}!`);
      } else {
        alert(`Successfully joined ${data.class ? data.class.name : 'the class'}!`);
      }
      closeJoinClassModal();
      // Reload page to show new class
      setTimeout(() => {
        location.reload();
      }, 1000);
    } else {
      errorDiv.textContent = data.message || 'Failed to join class';
      errorDiv.style.display = 'block';
    }
  })
  .catch(error => {
    console.error('Join class error:', error);
    errorDiv.textContent = 'Network error. Please try again.';
    errorDiv.style.display = 'block';
  })
  .finally(() => {
    // Reset button
    joinBtn.textContent = originalText;
    joinBtn.disabled = false;
  });
}

// ===== ENTER CLASS FUNCTIONALITY =====

function enterClass(classId) {
  console.log('🎯 Entering class:', classId);
  
  // Set global class ID for student module access
  window.currentClassId = classId;
  document.body.setAttribute('data-class-id', classId);
  
  // Try to open inside My Classes via iframe container
  var container = document.getElementById('classDetailContainer');
  var frame = document.getElementById('classDetailFrame');
  var grid = document.querySelector('.classes-grid');
  var sectionTitle = document.querySelector('#myclasses .section-title');
  var activeHeader = document.querySelector('.active-classes-header');
  
  if (container && frame) {
    console.log('✅ Found iframe container, showing embedded class dashboard');
    
    // Hide classes grid and show iframe
    if (grid) grid.style.display = 'none';
    if (sectionTitle) sectionTitle.style.display = 'none';
    if (activeHeader) activeHeader.style.display = 'none';
    
    // Show iframe container
    container.style.display = 'block';
    
        // Set iframe source to class dashboard with embedded parameter and cache-busting
        const iframeUrl = `class_dashboard.php?class_id=${classId}&embedded=1&v=${Date.now()}&super_debug=1`;
        console.log('🔍 Loading iframe with URL:', iframeUrl);
        frame.src = iframeUrl;
    
    // Add error handling for iframe
    frame.onload = function() {
      console.log('✅ Iframe loaded successfully');
    };
    
    frame.onerror = function() {
      console.log('❌ Iframe failed to load, trying direct redirect');
      // If iframe fails, redirect directly
      window.location.href = `class_dashboard.php?class_id=${classId}`;
    };
    
    // Timeout fallback
    setTimeout(function() {
      if (frame.src && !frame.contentDocument) {
        console.log('❌ Iframe timeout, trying direct redirect');
        window.location.href = `class_dashboard.php?class_id=${classId}`;
      }
    }, 5000);
    
  } else {
    console.log('❌ No iframe container found, redirecting to class dashboard');
    // Fallback: redirect to class dashboard
    window.location.href = `class_dashboard.php?class_id=${classId}`;
  }
}


function exitEmbeddedClass() {
  console.log('🚪 Exiting embedded class view');
  
  // Hide iframe container
  const container = document.getElementById('classDetailContainer');
  if (container) {
    container.style.display = 'none';
    console.log('✅ Hidden iframe container');
  }
  
  // Show the entire My Classes section
  const myClassesSection = document.getElementById('myclasses');
  if (myClassesSection) {
    myClassesSection.style.display = 'block';
    myClassesSection.classList.add('active');
    console.log('✅ Showed My Classes section');
  }
  
  // Show classes grid and section elements
  const grid = document.querySelector('.classes-grid');
  const sectionTitle = document.querySelector('#myclasses .section-title');
  const activeHeader = document.querySelector('.active-classes-header');
  const activeClasses = document.querySelector('.active-classes');
  
  if (grid) {
    grid.style.display = 'grid'; // Use grid instead of block
    console.log('✅ Showed classes grid');
  }
  if (sectionTitle) {
    sectionTitle.style.display = 'block';
    console.log('✅ Showed section title');
  }
  if (activeHeader) {
    activeHeader.style.display = 'block';
    console.log('✅ Showed active classes header');
  }
  if (activeClasses) {
    activeClasses.style.display = 'block';
    console.log('✅ Showed active classes container');
  }
  
  // Update URL to reflect current section
  const url = new URL(window.location);
  url.searchParams.set('section', 'myclasses');
  window.history.pushState({}, '', url);
  console.log('🔗 URL updated to:', url.toString());
  
  // Clear global class ID
  window.currentClassId = null;
  document.body.removeAttribute('data-class-id');
  
  console.log('✅ Successfully exited embedded class view');
}

// ===== EVENT LISTENERS =====

// Add click event listeners to class items
function addClassItemEventListeners() {
  console.log('🔧 Adding event listeners to class items...');
  
  const classItems = document.querySelectorAll('.class-item[data-class-id]');
  console.log('🔍 Found class items:', classItems.length);
  
  if (classItems.length === 0) {
    console.log('❌ No class items found with data-class-id attribute');
    // Try to find all class items
    const allClassItems = document.querySelectorAll('.class-item');
    console.log('🔍 Total class items found:', allClassItems.length);
    
    // If still no elements, retry after a longer delay
    if (allClassItems.length === 0) {
      console.log('🔄 Retrying event listener attachment in 500ms...');
      setTimeout(function() {
        addClassItemEventListeners();
      }, 500);
      return;
    }
    
    // Log each class item
    allClassItems.forEach(function(item, index) {
      console.log('🔍 Class item ' + index + ':', item);
      console.log('🔍 Class item ' + index + ' attributes:', item.attributes);
    });
    return;
  }
  
  classItems.forEach(function(item, index) {
    console.log('🔧 Adding event listener to class item ' + index + ':', item);
    console.log('🔧 Class item ' + index + ' data-class-id:', item.getAttribute('data-class-id'));
    
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const classId = this.getAttribute('data-class-id');
      console.log('🎯 Class item clicked:', classId);
      if (classId) {
        enterClass(classId);
      } else {
        console.log('❌ No class ID found for clicked item');
      }
    });
    
    // Add hover effects
    item.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
    });
    
    item.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
    });
  });
  
  console.log('✅ Event listeners added to', classItems.length, 'class items');
}

// ===== EXPOSE FUNCTIONS TO GLOBAL SCOPE =====

// Expose enterClass function for HTML onclick attributes
window.enterClass = enterClass;

// Expose other functions if needed
window.openJoinClassModal = openJoinClassModal;
window.closeJoinClassModal = closeJoinClassModal;
window.handleJoinClass = handleJoinClass;
window.exitEmbeddedClass = exitEmbeddedClass;

// ===== NOTIFICATION SYSTEM =====

// Use unified notification system from notification_system.js
// If notification_system.js is not loaded, fallback to simple alert
if (typeof window.showNotification === 'undefined') {
    window.showNotification = function(type, title, message, duration) {
        console.warn('⚠️ notification_system.js not loaded, using alert fallback');
        alert(`${title}: ${message}`);
    };
}

// ===== GLOBAL FUNCTIONS =====

// Make showSection globally accessible for onclick attributes
window.showSection = showSection;

// Test function to verify navigation works
window.testNavigation = function() {
  console.log('🧪 Testing navigation...');
  console.log('📋 Available sections:', document.querySelectorAll('.section-content').length);
  console.log('📋 Available nav items:', document.querySelectorAll('.nav-item').length);
  
  // Test profile section
  const profileSection = document.getElementById('profile');
  const myClassesSection = document.getElementById('myclasses');
  
  console.log('🎯 Profile section:', profileSection);
  console.log('🎯 My Classes section:', myClassesSection);
  
  if (profileSection && myClassesSection) {
    console.log('✅ Both sections exist, testing switch...');
    showSection('profile', document.querySelector('[onclick*="profile"]'));
  } else {
    console.error('❌ Sections not found!');
  }
};

// ==================== LEADERBOARDS FUNCTIONALITY ====================

/**
 * Load all leaderboards for all activities across all enrolled classes
 */
async function loadAllLeaderboards() {
  const leaderboardsContent = document.querySelector('.leaderboards-content');
  if (!leaderboardsContent) {
    console.error('❌ Leaderboards content container not found');
    return;
  }
  
  // Show loading state
  leaderboardsContent.innerHTML = `
    <div style="text-align:center;padding:40px;">
      <i class="fas fa-spinner fa-spin" style="font-size:32px;color:#1d9b3e;margin-bottom:16px;"></i>
      <p style="color:#6b7280;font-size:14px;">Loading leaderboards...</p>
    </div>
  `;
  
  try {
    // Get all enrolled classes
    const classesResponse = await fetch('get_my_classes.php', { credentials: 'same-origin' });
    if (!classesResponse.ok) {
      throw new Error('Failed to load classes');
    }
    
    const classesData = await classesResponse.json();
    if (!classesData.success || !classesData.classes || classesData.classes.length === 0) {
      leaderboardsContent.innerHTML = `
        <div style="text-align:center;padding:40px;color:#6b7280;">
          <i class="fas fa-trophy" style="font-size:48px;color:#d1d5db;margin-bottom:16px;"></i>
          <p style="font-size:16px;margin:0;">No classes enrolled yet. Join a class to see leaderboards!</p>
        </div>
      `;
      return;
    }
    
    // Collect all activities from all classes
    const allActivities = [];
    const classPromises = classesData.classes.map(async (classItem) => {
      try {
        const topicsResponse = await fetch(`class_view_api.php?action=list_topics&id=${classItem.id}`, {
          credentials: 'same-origin'
        });
        if (!topicsResponse.ok) return;
        
        const topicsData = await topicsResponse.json();
        if (!topicsData.success || !topicsData.modules) return;
        
        // Extract all activities
        topicsData.modules.forEach(module => {
          (module.lessons || []).forEach(lesson => {
            (lesson.activities || []).forEach(activity => {
              if (activity.id) {
                allActivities.push({
                  ...activity,
                  class_id: classItem.id,
                  class_name: classItem.name,
                  class_code: classItem.code
                });
              }
            });
          });
        });
      } catch (error) {
        console.error(`Error loading activities for class ${classItem.id}:`, error);
      }
    });
    
    await Promise.all(classPromises);
    
    if (allActivities.length === 0) {
      leaderboardsContent.innerHTML = `
        <div style="text-align:center;padding:40px;color:#6b7280;">
          <i class="fas fa-trophy" style="font-size:48px;color:#d1d5db;margin-bottom:16px;"></i>
          <p style="font-size:16px;margin:0;">No activities found. Activities will appear here once created by your teacher.</p>
        </div>
      `;
      return;
    }
    
    // Load leaderboard for each activity
    const leaderboardPromises = allActivities.map(async (activity) => {
      try {
        const leaderboardResponse = await fetch(`get_leaderboard.php?activity_id=${activity.id}&limit=10`, {
          credentials: 'same-origin'
        });
        if (!leaderboardResponse.ok) return null;
        
        const leaderboardData = await leaderboardResponse.json();
        if (!leaderboardData.success) return null;
        
        return {
          activity: activity,
          leaderboard: leaderboardData.leaderboard || [],
          user_rank: leaderboardData.user_rank,
          user_score: leaderboardData.user_score,
          user_percentage: leaderboardData.user_percentage,
          total_participants: leaderboardData.total_participants || 0
        };
      } catch (error) {
        console.error(`Error loading leaderboard for activity ${activity.id}:`, error);
        return null;
      }
    });
    
    const leaderboardResults = await Promise.all(leaderboardPromises);
    const validLeaderboards = leaderboardResults.filter(r => r !== null && r.leaderboard.length > 0);
    
    // Group by class
    const leaderboardsByClass = {};
    validLeaderboards.forEach(result => {
      const classId = result.activity.class_id;
      if (!leaderboardsByClass[classId]) {
        leaderboardsByClass[classId] = {
          class_name: result.activity.class_name,
          class_code: result.activity.class_code,
          leaderboards: []
        };
      }
      leaderboardsByClass[classId].leaderboards.push(result);
    });
    
    // Render leaderboards
    if (Object.keys(leaderboardsByClass).length === 0) {
      leaderboardsContent.innerHTML = `
        <div style="text-align:center;padding:40px;color:#6b7280;">
          <i class="fas fa-trophy" style="font-size:48px;color:#d1d5db;margin-bottom:16px;"></i>
          <p style="font-size:16px;margin:0;">No leaderboards available yet. Submit activities to see rankings!</p>
        </div>
      `;
      return;
    }
    
    let html = '<div style="display:flex;flex-direction:column;gap:24px;">';
    
    Object.values(leaderboardsByClass).forEach(classData => {
      html += `
        <div style="background:white;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <div style="margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid #e9ecef;">
            <h3 style="margin:0;font-size:20px;font-weight:700;color:#111827;display:flex;align-items:center;gap:12px;">
              <i class="fas fa-graduation-cap" style="color:#1d9b3e;"></i>
              ${escapeHtml(classData.class_name)} (${escapeHtml(classData.class_code)})
            </h3>
          </div>
          <div style="display:flex;flex-direction:column;gap:20px;">
      `;
      
      classData.leaderboards.forEach(result => {
        const activity = result.activity;
        const leaderboard = result.leaderboard;
        const userRank = result.user_rank;
        const userScore = result.user_score;
        const userPercentage = result.user_percentage;
        
        // Format time
        const formatTime = (ms) => {
          if (!ms) return 'N/A';
          const seconds = Math.floor(ms / 1000);
          const minutes = Math.floor(seconds / 60);
          const secs = seconds % 60;
          if (minutes > 0) {
            return `${minutes}m ${secs}s`;
          }
          return `${secs}s`;
        };
        
        // Get medal emoji
        const getMedal = (rank) => {
          if (rank === 1) return '🥇';
          if (rank === 2) return '🥈';
          if (rank === 3) return '🥉';
          return `#${rank}`;
        };
        
        html += `
          <div style="border:1px solid #e9ecef;border-radius:8px;padding:20px;background:#f8f9fa;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <h4 style="margin:0;font-size:16px;font-weight:600;color:#374151;">
                ${escapeHtml(activity.title || 'Untitled Activity')}
              </h4>
              ${userRank !== null && userRank !== undefined ? `
                <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;padding:8px 16px;border-radius:8px;font-size:14px;font-weight:600;">
                  Your Rank: ${getMedal(userRank)}
                </div>
              ` : ''}
            </div>
            
            <div style="max-height:300px;overflow-y:auto;">
              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr style="background:white;border-bottom:2px solid #e9ecef;">
                    <th style="padding:10px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;">Rank</th>
                    <th style="padding:10px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;">Student</th>
                    <th style="padding:10px;text-align:right;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;">Score</th>
                    <th style="padding:10px;text-align:right;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;">Time</th>
                  </tr>
                </thead>
                <tbody>
                  ${leaderboard.slice(0, 10).map((entry, index) => {
                    const isCurrentUser = entry.user_id === (window.__USER_ID__ || 0);
                    const rowStyle = isCurrentUser 
                      ? 'background:#e3f2fd;border-left:3px solid #2196f3;font-weight:600;' 
                      : 'background:white;';
                    return `
                      <tr style="${rowStyle}border-bottom:1px solid #f3f4f6;">
                        <td style="padding:10px;font-size:14px;color:#374151;">
                          ${getMedal(entry.rank)}
                        </td>
                        <td style="padding:10px;font-size:14px;color:#374151;">
                          ${escapeHtml(entry.name || 'Unknown')}
                          ${isCurrentUser ? '<span style="margin-left:8px;color:#2196f3;font-size:12px;">(You)</span>' : ''}
                        </td>
                        <td style="padding:10px;text-align:right;font-size:14px;color:#374151;">
                          <span style="font-weight:600;">${entry.score || 0}</span>
                          <span style="color:#9ca3af;font-size:12px;margin-left:4px;">/ ${entry.max_score || 0}</span>
                          <span style="color:#059669;font-size:12px;margin-left:8px;">(${entry.percentage ? entry.percentage.toFixed(1) : 0}%)</span>
                        </td>
                        <td style="padding:10px;text-align:right;font-size:12px;color:#6b7280;">
                          ${formatTime(entry.time_spent_ms)}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
            
            ${leaderboard.length >= 10 ? `
              <div style="margin-top:12px;text-align:center;">
                <button onclick="window.showLeaderboardModal ? window.showLeaderboardModal(${activity.id}) : alert('Full leaderboard feature coming soon!')" 
                        style="background:#1d9b3e;color:white;border:none;padding:8px 16px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;"
                        onmouseover="this.style.background='#15803d';this.style.transform='translateY(-1px)';"
                        onmouseout="this.style.background='#1d9b3e';this.style.transform='translateY(0)';">
                  View Full Leaderboard
                </button>
              </div>
            ` : ''}
          </div>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    leaderboardsContent.innerHTML = html;
    
  } catch (error) {
    console.error('❌ Error loading leaderboards:', error);
    leaderboardsContent.innerHTML = `
      <div style="text-align:center;padding:40px;color:#dc2626;">
        <i class="fas fa-exclamation-triangle" style="font-size:48px;margin-bottom:16px;"></i>
        <p style="font-size:16px;margin:0;">Error loading leaderboards. Please try again later.</p>
      </div>
    `;
  }
}

/**
 * Open full leaderboard modal (reuse from class_dashboard.js if available, otherwise create simple modal)
 */
function openFullLeaderboard(activityId) {
  // Try to use the function from class_dashboard.js if available
  if (typeof window.showLeaderboardModal === 'function') {
    window.showLeaderboardModal(activityId);
    return;
  }
  
  // Fallback: Create a simple modal
  fetch(`get_leaderboard.php?activity_id=${activityId}&limit=50`, { credentials: 'same-origin' })
    .then(r => r.json())
    .then(data => {
      if (!data.success) {
        alert('Failed to load leaderboard');
        return;
      }
      
      const leaderboard = data.leaderboard || [];
      const userRank = data.user_rank;
      
      const formatTime = (ms) => {
        if (!ms) return 'N/A';
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
      };
      
      const getMedal = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
      };
      
      let html = `
        <div style="background:white;border-radius:16px;max-width:800px;width:95%;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);">
          <div style="padding:24px;border-bottom:1px solid #e9ecef;display:flex;justify-content:space-between;align-items:center;">
            <h2 style="margin:0;font-size:24px;font-weight:700;color:#111827;">
              <i class="fas fa-trophy" style="color:#f59e0b;"></i> Full Leaderboard
            </h2>
            <button onclick="this.closest('.leaderboard-modal').remove()" 
                    style="background:none;border:none;font-size:24px;color:#6b7280;cursor:pointer;">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div style="padding:24px;overflow-y:auto;flex:1;">
            ${userRank !== null ? `
              <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;padding:20px;border-radius:12px;margin-bottom:20px;text-align:center;">
                <div style="font-size:14px;opacity:0.9;margin-bottom:8px;">Your Rank</div>
                <div style="font-size:36px;font-weight:700;">${getMedal(userRank)}</div>
              </div>
            ` : ''}
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#f8f9fa;border-bottom:2px solid #e9ecef;">
                  <th style="padding:12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;">Rank</th>
                  <th style="padding:12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;">Student</th>
                  <th style="padding:12px;text-align:right;font-size:12px;font-weight:600;color:#6b7280;">Score</th>
                  <th style="padding:12px;text-align:right;font-size:12px;font-weight:600;color:#6b7280;">Time</th>
                </tr>
              </thead>
              <tbody>
                ${leaderboard.map(entry => {
                  const isCurrentUser = entry.user_id === (window.__USER_ID__ || 0);
                  const rowStyle = isCurrentUser ? 'background:#e3f2fd;border-left:3px solid #2196f3;font-weight:600;' : '';
                  return `
                    <tr style="${rowStyle}border-bottom:1px solid #f3f4f6;">
                      <td style="padding:12px;font-size:14px;color:#374151;">${getMedal(entry.rank)}</td>
                      <td style="padding:12px;font-size:14px;color:#374151;">
                        ${escapeHtml(entry.name || 'Unknown')}
                        ${isCurrentUser ? '<span style="color:#2196f3;font-size:12px;">(You)</span>' : ''}
                      </td>
                      <td style="padding:12px;text-align:right;font-size:14px;color:#374151;">
                        <strong>${entry.score || 0}</strong> / ${entry.max_score || 0}
                        <span style="color:#059669;font-size:12px;">(${entry.percentage ? entry.percentage.toFixed(1) : 0}%)</span>
                      </td>
                      <td style="padding:12px;text-align:right;font-size:12px;color:#6b7280;">${formatTime(entry.time_spent_ms)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          <div style="padding:16px 24px;border-top:1px solid #e9ecef;text-align:right;">
            <button onclick="this.closest('.leaderboard-modal').remove()" 
                    style="background:#1d9b3e;color:white;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">
              Close
            </button>
          </div>
        </div>
      `;
      
      const modal = document.createElement('div');
      modal.className = 'leaderboard-modal';
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;';
      modal.innerHTML = html;
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
      });
      
      document.body.appendChild(modal);
    })
    .catch(err => {
      console.error('Error loading leaderboard:', err);
      alert('Failed to load leaderboard');
    });
}

// ===== CERTIFICATION FUNCTIONALITY =====

async function loadCertifications() {
  const contentDiv = document.getElementById('certificationContent');
  if (!contentDiv) return;
  
  try {
    // Show loading state
    contentDiv.innerHTML = `
      <div style="text-align:center;padding:40px;color:#6b7280;">
        <i class="fas fa-spinner fa-spin" style="font-size:32px;color:#1d9b3e;margin-bottom:16px;"></i>
        <p style="font-size:16px;margin:0;">Loading certifications...</p>
      </div>
    `;
    
    console.log('🏅 [Certification] Fetching certification data...');
    const response = await fetch('get_certification_data.php', {
      credentials: 'same-origin'
    });
    
    console.log('🏅 [Certification] Response status:', response.status, response.statusText);
    console.log('🏅 [Certification] Response headers:', response.headers.get('content-type'));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🏅 [Certification] HTTP Error:', response.status, errorText.substring(0, 500));
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('🏅 [Certification] Non-JSON response:', text.substring(0, 500));
      throw new Error('Server returned non-JSON response: ' + text.substring(0, 200));
    }
    
    const data = await response.json();
    console.log('🏅 [Certification] Response data:', data);
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to load certifications');
    }
    
    const certifications = data.certifications || [];
    
    if (certifications.length === 0) {
      contentDiv.innerHTML = `
        <div style="text-align:center;padding:60px 40px;color:#6b7280;">
          <i class="fas fa-certificate" style="font-size:64px;color:#d1d5db;margin-bottom:20px;"></i>
          <h3 style="font-size:20px;font-weight:600;color:#374151;margin:0 0 12px 0;">No Certifications Available</h3>
          <p style="font-size:16px;margin:0 0 24px 0;color:#6b7280;">
            You need to be enrolled in a class with activities to track your certification progress.
          </p>
          <p style="font-size:14px;margin:0;color:#9ca3af;">
            Join a class from "My Classes" to get started.
          </p>
        </div>
      `;
      return;
    }
    
    // Render certification cards
    renderCertificationCards(certifications, contentDiv);
    
  } catch (error) {
    console.error('Error loading certifications:', error);
    contentDiv.innerHTML = `
      <div style="text-align:center;padding:60px 40px;color:#ef4444;">
        <i class="fas fa-exclamation-circle" style="font-size:48px;margin-bottom:16px;"></i>
        <h3 style="font-size:18px;font-weight:600;margin:0 0 8px 0;">Error Loading Certifications</h3>
        <p style="font-size:14px;margin:0;color:#6b7280;">${escapeHtml(error.message || 'Unknown error')}</p>
      </div>
    `;
  }
}

function renderCertificationCards(certifications, container) {
  const cardsHTML = certifications.map(cert => {
    const progressColor = cert.progress >= 100 ? '#10b981' : cert.progress >= 50 ? '#f59e0b' : '#ef4444';
    const progressBg = cert.progress >= 100 ? '#d1fae5' : cert.progress >= 50 ? '#fef3c7' : '#fee2e2';
    
    // Get language icon/emoji
    const languageIcon = getLanguageIcon(cert.language);
    
    return `
      <div class="certification-card" 
           style="background:white;border-radius:16px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,0.1);transition:all 0.3s ease;border:2px solid #e5e7eb;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;"
           onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 16px rgba(0,0,0,0.15)';this.style.borderColor='#1d9b3e';"
           onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)';this.style.borderColor='#e5e7eb';">
        <!-- Header -->
        <div style="display:flex;align-items:start;justify-content:space-between;margin-bottom:20px;">
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
              <div style="width:48px;height:48px;background:linear-gradient(135deg, #1d9b3e 0%, #16a34a 100%);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;color:white;font-weight:700;flex-shrink:0;">
                ${languageIcon}
              </div>
              <div style="flex:1;">
                <h3 style="margin:0 0 4px 0;font-size:18px;font-weight:700;color:#111827;font-family:inherit;">
                  ${escapeHtml(cert.course_title || cert.language)}
                </h3>
                <p style="margin:0;font-size:13px;color:#6b7280;font-family:inherit;">
                  ${escapeHtml(cert.class_name)} • ${escapeHtml(cert.course_code || '')}
                </p>
              </div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:24px;font-weight:700;color:${progressColor};font-family:inherit;">
              ${cert.progress}%
            </div>
            <div style="font-size:12px;color:#9ca3af;margin-top:4px;font-family:inherit;">
              ${cert.progress_text}
            </div>
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div style="margin-bottom:16px;">
          <div style="width:100%;height:12px;background:#f3f4f6;border-radius:6px;overflow:hidden;">
            <div style="width:${cert.progress}%;height:100%;background:linear-gradient(90deg, ${progressColor} 0%, ${progressColor}dd 100%);border-radius:6px;transition:width 0.5s ease;box-shadow:0 2px 4px rgba(0,0,0,0.1);"></div>
          </div>
        </div>
        
        <!-- Stats -->
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:16px;border-top:1px solid #f3f4f6;">
          <div style="text-align:center;flex:1;">
            <div style="font-size:20px;font-weight:700;color:#111827;font-family:inherit;">
              ${cert.completed_activities}
            </div>
            <div style="font-size:12px;color:#6b7280;margin-top:4px;font-family:inherit;">
              Completed
            </div>
          </div>
          <div style="width:1px;height:32px;background:#e5e7eb;"></div>
          <div style="text-align:center;flex:1;">
            <div style="font-size:20px;font-weight:700;color:#111827;font-family:inherit;">
              ${cert.total_activities}
            </div>
            <div style="font-size:12px;color:#6b7280;margin-top:4px;font-family:inherit;">
              Total
            </div>
          </div>
          <div style="width:1px;height:32px;background:#e5e7eb;"></div>
          <div style="text-align:center;flex:1;">
            <div style="font-size:20px;font-weight:700;color:#111827;font-family:inherit;">
              ${cert.total_activities - cert.completed_activities}
            </div>
            <div style="font-size:12px;color:#6b7280;margin-top:4px;font-family:inherit;">
              Remaining
            </div>
          </div>
        </div>
        
        <!-- Completion Badge and Download Certificate Button -->
        ${cert.progress >= 100 ? `
          <div style="margin-top:16px;padding:16px;background:#d1fae5;border-radius:8px;text-align:center;">
            <div style="margin-bottom:12px;">
              <i class="fas fa-check-circle" style="color:#10b981;margin-right:8px;font-size:18px;"></i>
              <span style="font-size:14px;font-weight:600;color:#065f46;font-family:inherit;">Course Completed!</span>
            </div>
            <button onclick="downloadCertificate(${cert.class_id}, ${cert.course_id}, '${escapeHtml(cert.course_title || cert.language)}', event, true, false)" 
                    style="background:#10b981;color:white;border:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;font-family:inherit;width:100%;display:flex;align-items:center;justify-content:center;gap:8px;"
                    onmouseover="this.style.background='#059669';this.style.transform='scale(1.02)';"
                    onmouseout="this.style.background='#10b981';this.style.transform='scale(1)';">
              <i class="fas fa-download"></i>
              Download Certificate
            </button>
          </div>
        ` : `
          <div style="margin-top:16px;padding:16px;background:#fef3c7;border-radius:8px;text-align:center;">
            <div style="margin-bottom:12px;">
              <i class="fas fa-info-circle" style="color:#f59e0b;margin-right:8px;font-size:18px;"></i>
              <span style="font-size:14px;font-weight:600;color:#92400e;font-family:inherit;">Progress: ${cert.progress}%</span>
            </div>
            <p style="margin:0;font-size:13px;color:#78350f;font-family:inherit;">
              Complete all activities to earn your certificate
            </p>
          </div>
        `}
      </div>
    `;
  }).join('');
  
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(380px, 1fr));gap:24px;padding:24px;">
      ${cardsHTML}
    </div>
  `;
}

function getLanguageIcon(language) {
  const lang = (language || '').toLowerCase();
  if (lang.includes('c++') || lang.includes('cpp')) return 'C++';
  if (lang.includes('python')) return '🐍';
  if (lang.includes('java')) return '☕';
  if (lang.includes('javascript') || lang.includes('js')) return 'JS';
  if (lang.includes('html')) return '🌐';
  if (lang.includes('css')) return '🎨';
  if (lang.includes('php')) return '🐘';
  if (lang.includes('sql')) return '🗄️';
  return '📜'; // Default icon
}

async function downloadCertificate(classId, courseId, courseTitle, event, isComplete = true) {
  if (event) {
    event.stopPropagation();
  }
  
  try {
    // Show loading state
    const button = event?.target?.closest('button') || event?.target;
    if (button) {
      const originalHTML = button.innerHTML;
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
      
      // Generate and download certificate
      const url = `generate_certificate.php?class_id=${classId}&course_id=${courseId}`;
      
      // Open in new window for download (since it's an image)
      window.open(url, '_blank');
      
      // Restore button after a delay
      setTimeout(() => {
        button.disabled = false;
        button.innerHTML = originalHTML;
      }, 2000);
    } else {
      // Fallback: direct download
      const url = `generate_certificate.php?class_id=${classId}&course_id=${courseId}`;
      window.location.href = url;
    }
  } catch (error) {
    console.error('Error downloading certificate:', error);
    alert('Failed to download certificate. Please try again.');
  }
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
  console.log('🎓 Student Dashboard initialized');
  
  // Add event listeners to class items with a small delay to ensure elements are loaded
  console.log('🔧 Calling addClassItemEventListeners...');
  setTimeout(function() {
    addClassItemEventListeners();
  }, 100);
  
  // Get section from URL
  const urlParams = new URLSearchParams(window.location.search);
  const section = urlParams.get('section') || 'myclasses';
  
  // Show appropriate section
  if (section === 'myclasses') {
    console.log('📚 Loading My Classes section...');
    // Classes are already rendered in PHP, no need to load
  } else if (section === 'newsfeed') {
    console.log('📰 Loading Newsfeed section...');
    // Newsfeed content will be loaded here
  } else if (section === 'leaderboards') {
    console.log('🏆 Loading Leaderboards section...');
    // Leaderboards are per-class, shown in the class dashboard
  } else if (section === 'certification') {
    console.log('🏅 Loading Certification section...');
    loadCertifications();
  } else if (section === 'profile') {
    console.log('👤 Loading Profile section...');
    // Initialize shared profile functionality
    if (typeof initSharedProfile === 'function') {
      try { 
        initSharedProfile(); 
        console.log('✅ Profile section initialized');
      } catch (e) { 
        console.error('❌ Error initializing profile:', e);
      }
    } else {
      console.log('⚠️ initSharedProfile function not available');
    }
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    const modal = document.getElementById('joinClassModal');
    if (event.target === modal) {
      closeJoinClassModal();
    }
  });
  
  // Handle Enter key in class code input
  document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && event.target.id === 'classCode') {
      handleJoinClass();
    }
  });
  
  // Handle Escape key to close modal
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeJoinClassModal();
    }
  });
});

// ===== RESPONSIVE HANDLING =====

window.addEventListener('resize', function() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  
  if (window.innerWidth <= 900) {
    // Mobile view
    sidebar.classList.remove('closed');
    mainContent.classList.remove('full');
  } else {
    // Desktop view
    sidebar.classList.remove('open');
  }
});

// ===== THEME TOGGLE =====

document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      // Toggle theme functionality
      document.body.classList.toggle('dark-theme');
      // Save preference
      const isDark = document.body.classList.contains('dark-theme');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
    }
  }
});

// ===== SETTINGS DROPDOWN =====

document.addEventListener('DOMContentLoaded', function() {
  const settingsIcon = document.getElementById('settingsIcon');
  const settingsDropdown = document.getElementById('settingsDropdown');
  
  if (settingsIcon && settingsDropdown) {
    settingsIcon.addEventListener('click', function(event) {
      event.stopPropagation();
      settingsDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
      settingsDropdown.classList.remove('show');
    });
  }
});
