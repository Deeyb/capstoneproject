// ===== STUDENT DASHBOARD JAVASCRIPT - MIRROR DESIGN =====

// Global variables
let currentSection = 'myclasses';

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
    // Leaderboards content will be loaded here
  } else if (section === 'certification') {
    console.log('🏅 Loading Certification section...');
    // Certification content will be loaded here
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
