// ===== STUDENT DASHBOARD JAVASCRIPT =====

// Global variables
let currentSection = 'myclasses';
let currentLeaderboardTab = 'overall';

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

// Section navigation
function showSection(sectionName, clickedElement = null) {
  console.log('🔄 Switching to section:', sectionName);
  
  // Hide all sections using direct style manipulation
  const sections = document.querySelectorAll('.section-content');
  sections.forEach(section => {
    section.classList.remove('active');
    section.style.display = 'none'; // Force hide
    console.log(`  - Hidden: ${section.id}`);
  });
  
  // Remove active class from all nav items
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => item.classList.remove('active'));
  
  // Show selected section using direct style manipulation
  const targetSection = document.getElementById(sectionName);
  if (targetSection) {
    targetSection.classList.add('active');
    targetSection.style.display = 'block'; // Force show
    console.log(`✅ Section activated: ${sectionName}`);
  } else {
    console.error(`❌ Section not found: ${sectionName}`);
  }
  
  // Add active class to clicked nav item
  if (clickedElement) {
    clickedElement.classList.add('active');
  }
  
  // Update current section
  currentSection = sectionName;
  
  // Load section-specific content
  loadSectionContent(sectionName);
}

// ===== SECTION CONTENT LOADING =====

function loadSectionContent(sectionName) {
  switch(sectionName) {
    case 'myclasses':
      loadMyClasses();
      break;
    case 'newsfeed':
      loadNewsfeed();
      break;
    case 'leaderboards':
      loadLeaderboards();
      break;
    case 'certification':
      loadCertification();
      break;
    case 'profile':
      // Profile section is handled by shared_profile.js
      console.log('Profile section loaded');
      
      // Debug profile section visibility
      const profileSection = document.getElementById('profile');
      if (profileSection) {
        console.log('Profile section found:', profileSection);
        console.log('Profile section classes:', profileSection.className);
        console.log('Profile section display:', window.getComputedStyle(profileSection).display);
        console.log('Profile section visibility:', window.getComputedStyle(profileSection).visibility);
        console.log('Profile section height:', window.getComputedStyle(profileSection).height);
        console.log('Profile section content:', profileSection.innerHTML.substring(0, 200));
      } else {
        console.error('Profile section not found!');
      }
      break;
  }
}

// ===== MY CLASSES FUNCTIONALITY =====

function loadMyClasses() {
  console.log('Loading My Classes...');
  // Placeholder fetch in the future; render empty panel for now
  renderMyClasses([]);
}

function renderMyClasses(classes) {
  const container = document.getElementById('myclasses');
  if (!container) return;

  const panelHTML = `
    <h2 class="section-title">My Classes</h2>
    <div class="student-panel">
      <div class="panel-section-header">Active Classes</div>
      <div class="classes-area">
        <div class="create-class-tile" id="studentJoinClassTile">
          <span>+ Join Class</span>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = panelHTML;
  const joinTile = document.getElementById('studentJoinClassTile');
  if (joinTile) {
    joinTile.addEventListener('click', function() {
      if (typeof showNotification === 'function') {
        showNotification('info', 'Coming Soon', 'Join Class with code will be available here.');
      }
    });
  }
}

function enterClass(classId) {
  console.log(`Entering class ${classId}`);
  showNotification('info', 'Entering Class', 'Redirecting to class content...');
  // Add actual navigation logic here
}

function viewClassDetails(classId) {
  console.log(`Viewing details for class ${classId}`);
  showNotification('info', 'Class Details', 'Opening class details...');
  // Add modal or navigation logic here
}

// ===== NEWSFEED FUNCTIONALITY =====

function loadNewsfeed() {
  console.log('Loading Newsfeed...');
  
  // Sample data - replace with actual API calls
  const newsItems = [
    {
      id: 1,
      author: 'Prof. Martin Hangad',
      time: '2 hours ago',
      content: 'Welcome to the new semester! Please check your class schedules and assignments.',
      likes: 12,
      comments: 5
    },
    {
      id: 2,
      author: 'System Admin',
      time: '1 day ago',
      content: 'The LMS will be undergoing maintenance this weekend. Please save your work.',
      likes: 8,
      comments: 2
    },
    {
      id: 3,
      author: 'Dr. Sarah Johnson',
      time: '3 days ago',
      content: 'New coding exercises are now available in the Data Structures course.',
      likes: 15,
      comments: 7
    }
  ];
  
  renderNewsfeed(newsItems);
}

function renderNewsfeed(newsItems) {
  const container = document.getElementById('newsfeed');
  if (!container) return;
  
  const newsfeedHTML = `
    <h2 class="section-title">Newsfeed</h2>
    <div class="newsfeed-container">
      ${newsItems.map(item => `
        <div class="news-item">
          <div class="news-header">
            <div class="news-avatar">${item.author.charAt(0)}</div>
            <div class="news-meta">
              <h4 class="news-author">${item.author}</h4>
              <p class="news-time">${item.time}</p>
            </div>
          </div>
          <div class="news-content">
            <p>${item.content}</p>
          </div>
          <div class="news-actions">
            <button class="news-action" onclick="likeNews(${item.id})">
              <i class="fas fa-heart"></i> ${item.likes}
            </button>
            <button class="news-action" onclick="commentNews(${item.id})">
              <i class="fas fa-comment"></i> ${item.comments}
            </button>
            <button class="news-action" onclick="shareNews(${item.id})">
              <i class="fas fa-share"></i> Share
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  container.innerHTML = newsfeedHTML;
}

function likeNews(newsId) {
  console.log(`Liking news ${newsId}`);
  showNotification('success', 'Liked', 'You liked this post!');
}

function commentNews(newsId) {
  console.log(`Commenting on news ${newsId}`);
  showNotification('info', 'Comment', 'Opening comment section...');
}

function shareNews(newsId) {
  console.log(`Sharing news ${newsId}`);
  showNotification('info', 'Share', 'Opening share options...');
}

// ===== LEADERBOARDS FUNCTIONALITY =====

function loadLeaderboards() {
  console.log('Loading Leaderboards...');
  
  // Sample data - replace with actual API calls
  const leaderboardData = {
    overall: [
      { rank: 1, name: 'Alice Johnson', score: 2850, course: 'C++ Programming' },
      { rank: 2, name: 'Bob Smith', score: 2720, course: 'Data Structures' },
      { rank: 3, name: 'Charlie Brown', score: 2650, course: 'Web Development' },
      { rank: 4, name: 'Diana Prince', score: 2580, course: 'C++ Programming' },
      { rank: 5, name: 'Eve Wilson', score: 2450, course: 'Data Structures' }
    ],
    weekly: [
      { rank: 1, name: 'Eve Wilson', score: 450, course: 'Data Structures' },
      { rank: 2, name: 'Alice Johnson', score: 420, course: 'C++ Programming' },
      { rank: 3, name: 'Bob Smith', score: 380, course: 'Data Structures' },
      { rank: 4, name: 'Charlie Brown', score: 350, course: 'Web Development' },
      { rank: 5, name: 'Diana Prince', score: 320, course: 'C++ Programming' }
    ],
    monthly: [
      { rank: 1, name: 'Alice Johnson', score: 1850, course: 'C++ Programming' },
      { rank: 2, name: 'Bob Smith', score: 1720, course: 'Data Structures' },
      { rank: 3, name: 'Charlie Brown', score: 1650, course: 'Web Development' },
      { rank: 4, name: 'Diana Prince', score: 1580, course: 'C++ Programming' },
      { rank: 5, name: 'Eve Wilson', score: 1450, course: 'Data Structures' }
    ]
  };
  
  renderLeaderboards(leaderboardData);
}

function renderLeaderboards(data) {
  const container = document.getElementById('leaderboards');
  if (!container) return;
  
  const leaderboardHTML = `
    <h2 class="section-title">Leaderboards</h2>
    <div class="leaderboard-container">
      <div class="leaderboard-tabs">
        <button class="leaderboard-tab active" onclick="switchLeaderboardTab('overall')">
          Overall
        </button>
        <button class="leaderboard-tab" onclick="switchLeaderboardTab('weekly')">
          This Week
        </button>
        <button class="leaderboard-tab" onclick="switchLeaderboardTab('monthly')">
          This Month
        </button>
      </div>
      <div class="leaderboard-list" id="leaderboardList">
        ${renderLeaderboardList(data.overall)}
      </div>
    </div>
  `;
  
  container.innerHTML = leaderboardHTML;
}

function renderLeaderboardList(players) {
  return players.map(player => `
    <div class="leaderboard-item">
      <div class="rank ${getRankClass(player.rank)}">${player.rank}</div>
      <div class="user-info">
        <div class="user-avatar">${player.name.charAt(0)}</div>
        <div class="user-details">
          <h4>${player.name}</h4>
          <p>${player.course}</p>
        </div>
      </div>
      <div class="score">${player.score.toLocaleString()}</div>
    </div>
  `).join('');
}

function getRankClass(rank) {
  if (rank === 1) return 'first';
  if (rank === 2) return 'second';
  if (rank === 3) return 'third';
  return '';
}

function switchLeaderboardTab(tab) {
  currentLeaderboardTab = tab;
  
  // Update tab buttons
  document.querySelectorAll('.leaderboard-tab').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Update leaderboard content
  const leaderboardData = {
    overall: [
      { rank: 1, name: 'Alice Johnson', score: 2850, course: 'C++ Programming' },
      { rank: 2, name: 'Bob Smith', score: 2720, course: 'Data Structures' },
      { rank: 3, name: 'Charlie Brown', score: 2650, course: 'Web Development' },
      { rank: 4, name: 'Diana Prince', score: 2580, course: 'C++ Programming' },
      { rank: 5, name: 'Eve Wilson', score: 2450, course: 'Data Structures' }
    ],
    weekly: [
      { rank: 1, name: 'Eve Wilson', score: 450, course: 'Data Structures' },
      { rank: 2, name: 'Alice Johnson', score: 420, course: 'C++ Programming' },
      { rank: 3, name: 'Bob Smith', score: 380, course: 'Data Structures' },
      { rank: 4, name: 'Charlie Brown', score: 350, course: 'Web Development' },
      { rank: 5, name: 'Diana Prince', score: 320, course: 'C++ Programming' }
    ],
    monthly: [
      { rank: 1, name: 'Alice Johnson', score: 1850, course: 'C++ Programming' },
      { rank: 2, name: 'Bob Smith', score: 1720, course: 'Data Structures' },
      { rank: 3, name: 'Charlie Brown', score: 1650, course: 'Web Development' },
      { rank: 4, name: 'Diana Prince', score: 1580, course: 'C++ Programming' },
      { rank: 5, name: 'Eve Wilson', score: 1450, course: 'Data Structures' }
    ]
  };
  
  const leaderboardList = document.getElementById('leaderboardList');
  if (leaderboardList) {
    leaderboardList.innerHTML = renderLeaderboardList(leaderboardData[tab]);
  }
}

// ===== CERTIFICATION FUNCTIONALITY =====

function loadCertification() {
  console.log('Loading Certification...');
  
  // Sample data - replace with actual API calls
  const certificates = [
    {
      id: 1,
      title: 'C++ Programming Fundamentals',
      course: 'Complete C++ Programming Course',
      date: '2024-01-15',
      status: 'completed',
      score: 95
    },
    {
      id: 2,
      title: 'Data Structures Mastery',
      course: 'Advanced Data Structures and Algorithms',
      date: '2023-12-20',
      status: 'completed',
      score: 88
    },
    {
      id: 3,
      title: 'Web Development Bootcamp',
      course: 'Full-Stack Web Development',
      date: '2024-02-01',
      status: 'in-progress',
      score: 0
    }
  ];
  
  renderCertification(certificates);
}

function renderCertification(certificates) {
  const container = document.getElementById('certification');
  if (!container) return;
  
  const certificationHTML = `
    <h2 class="section-title">My Certificates</h2>
    <div class="certification-container">
      <div class="certificate-grid">
        ${certificates.map(cert => `
          <div class="certificate-card">
            <div class="certificate-icon">
              <i class="fas fa-certificate"></i>
            </div>
            <h3 class="certificate-title">${cert.title}</h3>
            <p class="certificate-course">${cert.course}</p>
            <p class="certificate-date">Completed: ${cert.date}</p>
            <div class="certificate-actions">
              ${cert.status === 'completed' ? `
                <button class="btn-download" onclick="downloadCertificate(${cert.id})">
                  <i class="fas fa-download"></i> Download
                </button>
                <button class="btn-view" onclick="viewCertificate(${cert.id})">
                  <i class="fas fa-eye"></i> View
                </button>
              ` : `
                <button class="btn-secondary" disabled>
                  <i class="fas fa-clock"></i> In Progress
                </button>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  container.innerHTML = certificationHTML;
}

function downloadCertificate(certId) {
  console.log(`Downloading certificate ${certId}`);
  showNotification('success', 'Download Started', 'Your certificate is being downloaded...');
}

function viewCertificate(certId) {
  console.log(`Viewing certificate ${certId}`);
  showNotification('info', 'Certificate View', 'Opening certificate viewer...');
}

// ===== NOTIFICATION SYSTEM =====

function showNotification(type, title, message) {
  // Use the global notification system if available
  if (typeof window.showNotification === 'function') {
    window.showNotification(type, title, message);
    return;
  }
  
  // Fallback notification
  console.log(`${type.toUpperCase()}: ${title} - ${message}`);
  
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <strong>${title}</strong>
      <p>${message}</p>
    </div>
  `;
  
  // Add toast styles if not already present
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 300px;
        animation: slideIn 0.3s ease;
      }
      .toast-success { border-left: 4px solid #28a745; }
      .toast-error { border-left: 4px solid #dc3545; }
      .toast-info { border-left: 4px solid #17a2b8; }
      .toast-warning { border-left: 4px solid #ffc107; }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Make showNotification globally available for shared_profile.js
if (typeof window !== 'undefined') {
  window.showNotification = showNotification;
}

// ===== HEADER FUNCTIONALITY =====

function initializeHeader() {
  console.log('🔧 Initializing header functionality...');
  
  // Settings dropdown functionality
  const settingsIcon = document.getElementById('settingsIcon');
  const settingsDropdown = document.getElementById('settingsDropdown');
  console.log('Settings elements found:', { settingsIcon: !!settingsIcon, settingsDropdown: !!settingsDropdown });
  if (settingsIcon && settingsDropdown) {
    // Remove any pre-existing listeners by cloning the node
    const newIcon = settingsIcon.cloneNode(true);
    settingsIcon.parentNode.replaceChild(newIcon, settingsIcon);
    // Ensure dropdown is initially hidden
    settingsDropdown.style.display = 'none';
    newIcon.addEventListener('click', function(e) {
      e.stopPropagation();
      settingsDropdown.style.display = settingsDropdown.style.display === 'block' ? 'none' : 'block';
    });
    // Close when clicking outside or pressing ESC
    document.addEventListener('click', function(e) {
      if (!settingsDropdown.contains(e.target) && e.target !== newIcon) {
        settingsDropdown.style.display = 'none';
      }
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') settingsDropdown.style.display = 'none';
    });
  }
  
  // Theme toggle functionality (Student Dashboard specific)
  const themeToggle = document.getElementById('themeToggle');
  console.log('Theme toggle element found:', !!themeToggle);
  if (themeToggle) {
    const newToggle = themeToggle.cloneNode(true);
    themeToggle.parentNode.replaceChild(newToggle, themeToggle);
    const applyTheme = (mode) => {
      document.body.classList.toggle('dark-mode', mode === 'dark');
      newToggle.className = mode === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      try { localStorage.setItem('adminTheme', mode); } catch(_) {}
    };
    const savedTheme = (localStorage.getItem('adminTheme') || 'light');
    applyTheme(savedTheme);
    console.log('Initial theme loaded:', savedTheme);
    newToggle.addEventListener('click', function() {
      const isDark = !document.body.classList.contains('dark-mode');
      applyTheme(isDark ? 'dark' : 'light');
      console.log('Theme toggled to:', isDark ? 'dark' : 'light');
    });
  }
}

// ===== INITIALIZATION =====

function initializeStudentDashboard() {
  console.log('Student Dashboard initializing...');
  
  // Use shared header (admin_panel.js) if available to avoid duplicate listeners
  if (typeof window.applyThemePreference === 'function') {
    try { window.applyThemePreference(); } catch (_) {}
  }
  console.log('✅ Using shared header handlers (student)');
  
  // Read desired section from URL if provided (e.g., ?section=profile)
  try {
    const urlSection = new URLSearchParams(window.location.search).get('section');
    if (urlSection) {
      console.log('🔎 URL section detected:', urlSection);
      currentSection = urlSection;
    }
  } catch (e) { /* ignore */ }

  // Force hide all sections first
  const sections = document.querySelectorAll('.section-content');
  sections.forEach(section => {
    section.style.display = 'none';
    section.classList.remove('active');
    console.log(`  - Force hidden: ${section.id}`);
  });
  
  // Show the target section determined by URL or fallback
  if (!currentSection) currentSection = 'myclasses';
  console.log('🚦 Initial section to show:', currentSection);
  showSection(currentSection);
  
  // Set up mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', toggleSidebar);
  }
  
  // Set up sidebar navigation (native structure)
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.addEventListener('click', function(e) {
      let li = e.target;
      if (li.tagName === 'I') li = li.parentElement;
      if (li.dataset.section) {
        showSection(li.dataset.section, li);
        // Close sidebar on mobile after navigation
        if (window.innerWidth <= 900) {
          sidebar.classList.remove('open');
        }
      }
    });
  }
  
  // Load initial section content (showSection already flips visibility). Avoid duplicate header init.
  loadSectionContent(currentSection);
  
  // Initialize shared profile functionality
  if (typeof initSharedProfile === 'function') {
    initSharedProfile();
  }
  
  console.log('Student Dashboard initialized successfully');
}

// ===== EVENT LISTENERS =====

// Note: Initialization is now handled by the HTML file to ensure proper script loading order

// Make functions globally available
window.toggleSidebar = toggleSidebar;
window.showSection = showSection;
window.enterClass = enterClass;
window.viewClassDetails = viewClassDetails;
window.likeNews = likeNews;
window.commentNews = commentNews;
window.shareNews = shareNews;
window.switchLeaderboardTab = switchLeaderboardTab;
window.downloadCertificate = downloadCertificate;
window.viewCertificate = viewCertificate;
