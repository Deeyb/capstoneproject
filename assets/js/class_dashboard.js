// class_dashboard.js - Activity management system

// ======================== ROLE-AWARE INITIALIZATION ========================

// Initialize role-aware features
document.addEventListener('DOMContentLoaded', function() {
  const userRole = window.__USER_ROLE__ || 'student';
  const classId = window.__CLASS_ID__;
  
  console.log('Class Dashboard initialized for role:', userRole);
  
  if (userRole && userRole.toLowerCase() === 'student') {
    initializeStudentView();
    // Initialize improvements after a delay to ensure content is loaded
    setTimeout(function() {
      initializeActivityImprovements();
    }, 2000);
  } else {
    initializeTeacherView();
  }
});

function initializeStudentView() {
  console.log('Initializing student view for class:', window.__CLASS_ID__);
  
  // Hide teacher-only elements
  const teacherOnlyElements = document.querySelectorAll('[data-teacher-only]');
  teacherOnlyElements.forEach(el => {
    el.style.display = 'none';
  });
  
  // Show student-specific elements
  const studentElements = document.querySelectorAll('[data-student-only]');
  studentElements.forEach(el => {
    el.style.display = 'block';
  });
  
  // Update page title
  document.title = 'Class - Student View';
  
  // Load student-specific data
  loadStudentProgress();
}

function initializeTeacherView() {
  console.log('Initializing teacher view for class:', window.__CLASS_ID__);
  
  // Hide student-only elements
  const studentOnlyElements = document.querySelectorAll('[data-student-only]');
  studentOnlyElements.forEach(el => {
    el.style.display = 'none';
  });
  
  // Show teacher-specific elements
  const teacherElements = document.querySelectorAll('[data-teacher-only]');
  teacherElements.forEach(el => {
    el.style.display = 'block';
  });
  
  // Update page title
  document.title = 'Class Dashboard - Teacher View';
}

function loadStudentProgress() {
  // Load student's progress in this class
  console.log('Loading student progress for class:', window.__CLASS_ID__);
  // TODO: Implement student progress loading
}

// Shared helper: detect required construct usage (copied from coordinator toolkit)
function detectConstructUsage(source, language, required) {
  try {
    const lang = String(language || '').toLowerCase();
    let code = String(source || '');
    try {
      code = code
        .replace(/\/\*[^]*?\*\//g, '')
        .replace(/(^|\s)\/\/.*$/gm, '')
        .replace(/(^|\s)#.*$/gm, '');
    } catch (_){ }

    const isPython = lang.includes('py');
    const rx = {
      while_c: /\bwhile\s*\(/,
      for_c: /\bfor\s*\(/,
      if_else_c: /\bif\s*\([^)]*\)[^]*?\belse\b/,
      do_while_c: /\bdo\b[^]*?\bwhile\s*\(/,
      switch_c: /\bswitch\s*\(/,

      while_py: /\bwhile\s+.+:/,
      for_py: /\bfor\s+.+\s+in\s+.+:/,
      if_else_py: /\bif\s+.+:[^]*?\belse\s*:/
    };

    const used = {
      while: isPython ? rx.while_py.test(code) : rx.while_c.test(code),
      for: isPython ? rx.for_py.test(code) : rx.for_c.test(code),
      if_else: isPython ? rx.if_else_py.test(code) : rx.if_else_c.test(code),
      do_while: !isPython && rx.do_while_c.test(code),
      switch: !isPython && rx.switch_c.test(code)
    };

    const needs = String(required || '').toLowerCase();
    if (!needs) return { ok: true, used };
    return { ok: !!used[needs], used };
  } catch (_){
    return { ok: true, used: {} };
  }
}

// ======================== ACTIVITY MANAGER CLASS (OOP) ========================

class ActivityManager {
  constructor() {
    this.currentActivity = null;
    this.modal = null;
  }

  // Show reschedule/retakers modal
  showRescheduleModal(activityId, activityData) {
    this.currentActivity = { id: activityId, ...activityData };
    this.checkActivityStatus();
  }

  // Check if activity has been taken by students
  async checkActivityStatus() {
    try {
      // This would typically fetch from an API to check submission status
      const activityStatus = await this.getActivitySubmissions(this.currentActivity.id);
      
      if (activityStatus.hasSubmissions) {
        // Activity has been taken, show retaker selection
        this.createModal('retakers');
      } else {
        // No submissions yet, show simple reschedule modal
        this.createModal('reschedule');
      }
    } catch (error) {
      // Default to retaker modal if we can't determine status
      this.createModal('retakers');
    }
  }

  // Simulate API call to get activity submissions
  async getActivitySubmissions(activityId) {
    // This would be a real API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate different scenarios
        const scenarios = [
          { hasSubmissions: false, submissions: [] }, // No one has taken it
          { hasSubmissions: true, submissions: [1, 2] }, // Some have taken it
          { hasSubmissions: true, submissions: [1, 2, 3, 4] } // All have taken it
        ];
        
        // Randomly pick a scenario for demo
        const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        resolve(randomScenario);
      }, 500);
    });
  }

  // Create the modal structure
  createModal(mode = 'retakers') {
    // Remove existing modal if any
    if (this.modal) {
      this.modal.remove();
    }

    this.modal = document.createElement('div');
    this.modal.className = 'modal';
    this.modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;';
    
    const isRetakerMode = mode === 'retakers';
    const modalTitle = isRetakerMode ? 'Set Due Date & Retakers' : 'Set Due Date';
    const modalIcon = isRetakerMode ? 'fa-calendar-alt' : 'fa-calendar';
    
    const fontStack = "'Inter', sans-serif";
    
    this.modal.innerHTML = `
      <div class="modal-card" style="background:#fff;border-radius:12px;padding:24px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 40px rgba(0,0,0,0.15);font-family:${fontStack};">
        <div class="modal-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #e5e7eb;">
          <h3 style="margin:0;color:#1f2937;font-size:20px;font-weight:700;font-family:${fontStack};">
            <i class="fas ${modalIcon}" style="color:#1d9b3e;margin-right:8px;"></i>
            ${modalTitle}
          </h3>
          <button id="closeRescheduleModal" style="background:none;border:none;font-size:20px;color:#6b7280;cursor:pointer;padding:4px;font-family:${fontStack};">&times;</button>
        </div>
        
        <div class="modal-body" style="font-family:${fontStack};">
          <div class="activity-info" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:20px;">
            <h4 style="margin:0 0 8px 0;color:#374151;font-size:16px;font-weight:600;font-family:${fontStack};">Activity: ${this.currentActivity.title || 'Untitled Activity'}</h4>
            <p style="margin:0;color:#6b7280;font-size:14px;font-family:${fontStack};">Current due date: ${this.currentActivity.dueDate || 'Not set'}</p>
            ${isRetakerMode ? '' : `<div style="margin-top:8px;padding:8px;background:#fef3c7;border:1px solid #f59e0b;border-radius:4px;color:#92400e;font-size:13px;font-family:${fontStack};"><i class="fas fa-info-circle" style="margin-right:4px;"></i>No students have taken this activity yet. This will reschedule for all students.</div>`}
          </div>

          <div class="reschedule-section" style="margin-bottom:24px;">
            <label style="display:block;margin-bottom:8px;color:#374151;font-weight:600;font-size:14px;font-family:${fontStack};">
              <i class="fas fa-clock" style="color:#1d9b3e;margin-right:6px;"></i>
              New Due Date & Time
            </label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <input type="date" id="newDueDate" style="padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;font-family:${fontStack};">
              <input type="time" id="newDueTime" style="padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;font-family:${fontStack};">
            </div>
          </div>

          ${isRetakerMode ? `
          <div class="retakers-section" style="margin-bottom:24px;">
            <label style="display:block;margin-bottom:8px;color:#374151;font-weight:600;font-size:14px;font-family:${fontStack};">
              <i class="fas fa-users" style="color:#1d9b3e;margin-right:6px;"></i>
              Select Students for Retake
            </label>
            <div class="student-selection" style="max-height:200px;overflow-y:auto;border:1px solid #d1d5db;border-radius:6px;padding:12px;">
              <div id="studentList" style="display:flex;flex-direction:column;gap:8px;">
                <!-- Students will be loaded here -->
              </div>
            </div>
            <div style="margin-top:8px;">
              <button id="selectAllStudents" style="background:#f3f4f6;color:#374151;border:1px solid #d1d5db;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;margin-right:8px;font-family:${fontStack};font-weight:500;">Select All</button>
              <button id="clearAllStudents" style="background:#f3f4f6;color:#374151;border:1px solid #d1d5db;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;font-family:${fontStack};font-weight:500;">Clear All</button>
            </div>
          </div>
          ` : ''}

          <div class="notification-section" style="margin-bottom:24px;">
            <label style="display:flex;align-items:center;gap:8px;color:#374151;font-weight:600;font-size:14px;cursor:pointer;font-family:${fontStack};">
              <input type="checkbox" id="sendNotification" checked style="transform:scale(1.1);">
              <i class="fas fa-bell" style="color:#1d9b3e;"></i>
              Send notification to ${isRetakerMode ? 'selected students' : 'all students'}
            </label>
          </div>
        </div>

        <div class="modal-footer" style="display:flex;gap:12px;justify-content:flex-end;padding-top:16px;border-top:1px solid #e5e7eb;">
          <button id="cancelReschedule" style="background:#f3f4f6;color:#374151;border:1px solid #d1d5db;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;font-family:${fontStack};">Cancel</button>
          <button id="saveReschedule" style="background:#1d9b3e;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;font-family:${fontStack};">
            <i class="fas fa-save" style="margin-right:6px;"></i>
            Save Changes
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    
    if (isRetakerMode) {
      this.loadStudents();
    }
    
    this.bindEvents();
  }

  // Load students for selection
  async loadStudents() {
    try {
      // This would typically fetch from an API
      const students = [
        { id: 1, name: 'John Doe', email: 'john@example.com', selected: false },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', selected: false },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', selected: false },
        { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', selected: false }
      ];

      const fontStack = "'Inter', sans-serif";
      const studentList = document.getElementById('studentList');
      studentList.innerHTML = students.map(student => `
        <label style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:4px;cursor:pointer;transition:background-color 0.2s;font-family:${fontStack};" 
               onmouseover="this.style.backgroundColor='#f3f4f6'" 
               onmouseout="this.style.backgroundColor='transparent'">
          <input type="checkbox" class="student-checkbox" data-student-id="${student.id}" style="transform:scale(1.1);">
          <div style="flex:1;">
            <div style="font-weight:600;color:#374151;font-size:14px;font-family:${fontStack};">${student.name}</div>
            <div style="color:#6b7280;font-size:12px;font-family:${fontStack};">${student.email}</div>
          </div>
        </label>
      `).join('');
    } catch (error) {
      const fontStack = "'Inter', sans-serif";
      document.getElementById('studentList').innerHTML = `<p style="color:#ef4444;text-align:center;font-family:${fontStack};">Error loading students</p>`;
    }
  }

  // Bind event listeners
  bindEvents() {
    // Close modal
    document.getElementById('closeRescheduleModal').addEventListener('click', () => this.closeModal());
    document.getElementById('cancelReschedule').addEventListener('click', () => this.closeModal());
    
    // Click outside to close
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    // Only bind student selection events if in retaker mode
    const selectAllBtn = document.getElementById('selectAllStudents');
    const clearAllBtn = document.getElementById('clearAllStudents');
    
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.student-checkbox').forEach(checkbox => {
          checkbox.checked = true;
        });
      });
    }

    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.student-checkbox').forEach(checkbox => {
          checkbox.checked = false;
        });
      });
    }

    // Save changes
    document.getElementById('saveReschedule').addEventListener('click', () => this.saveChanges());
  }

  // Save reschedule changes
  async saveChanges() {
    const dueDate = document.getElementById('newDueDate').value;
    const dueTime = document.getElementById('newDueTime').value;
    const sendNotification = document.getElementById('sendNotification').checked;
    
    // Check if we're in retaker mode (has student checkboxes)
    const isRetakerMode = document.querySelector('.student-checkbox') !== null;
    
    let selectedStudents = [];
    if (isRetakerMode) {
      // Get selected students for retake
      selectedStudents = Array.from(document.querySelectorAll('.student-checkbox:checked'))
        .map(checkbox => parseInt(checkbox.getAttribute('data-student-id')));
    }

    if (!dueDate) {
      this.showNotification('error', 'Please select a due date');
      return;
    }

    if (isRetakerMode && selectedStudents.length === 0) {
      this.showNotification('warning', 'Please select at least one student for retake');
      return;
    }

    try {
      // Show loading state
      const saveBtn = document.getElementById('saveReschedule');
      const originalText = saveBtn.innerHTML;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:6px;"></i>Saving...';
      saveBtn.disabled = true;

      // Combine date and time into proper format (YYYY-MM-DD HH:MM:SS)
      const dueDateTime = dueTime 
        ? `${dueDate} ${dueTime}:00`
        : `${dueDate} 23:59:59`; // Default to end of day if no time specified

      // Get CSRF token
      let csrfToken;
      if (typeof window.getCSRFToken === 'function') {
        csrfToken = await window.getCSRFToken();
      } else {
        const res = await fetch('course_outline_manage.php?action=get_csrf_token', { credentials: 'same-origin' });
        const data = await res.json();
        csrfToken = data.token || null;
      }
      if (!csrfToken) {
        this.showNotification('error', 'Failed to get security token. Please refresh the page and try again.');
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
        return;
      }

      // Make actual API call to update activity due date
      const formData = new FormData();
      formData.append('action', 'activity_update');
      formData.append('id', this.currentActivity.id);
      formData.append('due_at', dueDateTime);
      formData.append('csrf_token', csrfToken);

      const response = await fetch('course_outline_manage.php', {
        method: 'POST',
        credentials: 'same-origin',
        body: formData
      });

      const result = await response.json();

      if (result && result.success) {
        const successMessage = isRetakerMode 
          ? `Due date set for ${selectedStudents.length} student(s)!`
          : 'Due date set successfully!';
        
        this.showNotification('success', successMessage);
        this.closeModal();
        
        // Reload activities to show updated due date
        if (typeof loadTopicsFromCourse === 'function') {
          loadTopicsFromCourse();
        } else {
          location.reload();
        }
      } else {
        throw new Error(result?.message || 'Failed to save due date');
      }

    } catch (error) {
      console.error('Error saving due date:', error);
      this.showNotification('error', error.message || 'Failed to save changes. Please try again.');
      
      // Reset button
      const saveBtn = document.getElementById('saveReschedule');
      saveBtn.innerHTML = originalText;
      saveBtn.disabled = false;
    }
  }

  // Close modal
  closeModal() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
      this.currentActivity = null;
    }
  }

  // Show notification using unified notification system
  showNotification(type, message) {
    if (typeof window.showNotification === 'function') {
      // Use unified notification system
      const title = type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info';
      window.showNotification(type, title, message);
    } else {
      // Fallback to console if notification system not available
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
}

// ===== CLEAN ACTIVITY SYSTEM =====
class CleanActivitySystem {
    constructor() {
        this.debugMode = true;
        this.apiBase = 'universal_activity_api.php'; // Use universal API
        this.currentClassId = window.__CLASS_ID__;
        
        console.log('🔍 DEBUG: CleanActivitySystem initialized with:', {
            apiBase: this.apiBase,
            currentClassId: this.currentClassId,
            debugMode: this.debugMode
        });
    }

    // Single method to fetch activity data
    async fetchActivity(activityId) {
        console.log('🔍 DEBUG: fetchActivity() called with ID:', activityId);
        console.log('🔍 DEBUG: API Base:', this.apiBase);
        console.log('🔍 DEBUG: Full API URL:', `${this.apiBase}?action=get_activity&id=${activityId}`);
        
        // Validate inputs
        if (!activityId || activityId <= 0) {
            throw new Error('Invalid activity ID provided');
        }
        
        if (!this.apiBase) {
            throw new Error('API base URL not configured');
        }
        
        try {
            console.log('🔍 DEBUG: Making API request...');
            const response = await fetch(`${this.apiBase}?action=get_activity&id=${activityId}`, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            console.log('🔍 DEBUG: API Response received');
            console.log('🔍 DEBUG: Response status:', response.status);
            console.log('🔍 DEBUG: Response ok:', response.ok);
            console.log('🔍 DEBUG: Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('🔍 DEBUG: API Error Response:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }

            const responseText = await response.text();
            console.log('🔍 DEBUG: Raw API Response:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('🔍 DEBUG: Parsed API Response data:', data);
            } catch (parseError) {
                console.error('🔍 DEBUG: JSON Parse Error:', parseError);
                console.error('🔍 DEBUG: Raw response that failed to parse:', responseText);
                throw new Error('Invalid JSON response from server');
            }
            
            if (data.success && data.activity) {
                console.log('🔍 DEBUG: Activity data received successfully:', data.activity);
                return data.activity;
            } else {
                console.error('🔍 DEBUG: API returned failure:', data);
                throw new Error(data.message || 'Activity not found');
            }
        } catch (error) {
            console.error('🔍 DEBUG: Error in fetchActivity:', error);
            console.error('🔍 DEBUG: Error name:', error.name);
            console.error('🔍 DEBUG: Error message:', error.message);
            console.error('🔍 DEBUG: Error stack:', error.stack);
            throw error;
        }
    }

    // Single method to show Try Answering modal
    async showTryAnswering(activityId, activityTitle = 'Activity', options = {}) {
        console.log('🔍 DEBUG: showTryAnswering() called with:', { activityId, activityTitle, options });
        
        try {
            console.log('🔍 DEBUG: Fetching activity data...');
            const activityData = await this.fetchActivity(activityId);
            console.log('🔍 DEBUG: Activity data fetched successfully:', activityData);
            
            console.log('🔍 DEBUG: Calling showTryAnsweringModal...');
            window.activityTester.showTryAnsweringModal(activityId, activityData, options);
            console.log('🔍 DEBUG: showTryAnsweringModal called successfully!');
            
        } catch (error) {
            console.error('🔍 DEBUG: Error in showTryAnswering:', error);
            console.error('🔍 DEBUG: Error stack:', error.stack);
            
            // Show error to user and DO NOT create modal
            if (window.showError) {
                window.showError('Error', 'Failed to load activity. Please try again.');
            } else {
                alert('Error: Failed to load activity. Please try again.');
            }
            
            // DO NOT create modal if API call fails
            console.log('🔍 DEBUG: API call failed, NOT creating modal');
            return;
        }
    }

    // Single method to show Reschedule modal
    showReschedule(activityId, activityTitle = 'Activity', dueDate = 'Not set') {
        if (this.debugMode) window.activityManager.showRescheduleModal(activityId, {
            title: activityTitle,
            dueDate: dueDate
        });
    }
}

// Create global clean system
window.cleanActivitySystem = new CleanActivitySystem();

// Create global instance
window.activityManager = new ActivityManager();

// ======================== END ACTIVITY MANAGER CLASS ========================

// ======================== ACTIVITY TESTER CLASS (OOP) ========================

class ActivityTester {
  constructor() {
    this.currentActivity = null;
    this.modal = null;
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.startTime = null;
    this.options = {}; // Store preview options
    this.codingContext = null;
    
    // Two-tier storage system
    this.attemptId = null; // For final submission
    this.saveTimeout = null; // For debouncing
    this.debounceDelay = 2000; // 2 seconds
    this.isStudent = false; // Track if this is student view
    this.retryQueue = []; // For failed saves
  }

  // Show try answering modal
  showTryAnsweringModal(activityId, activityData, options = {}) {
    console.log('🔍 [TEACHER PREVIEW] showTryAnsweringModal() called with:', { activityId, activityData, options });
    
    // Validate that we have proper activity data
    if (!activityData || !activityData.id) {
      console.error('🔍 DEBUG: Invalid activity data provided:', activityData);
      alert('Error: Invalid activity data. Please try again.');
      return;
    }
    
    try {
      // Show Try Answering modal
      this.currentActivity = { id: activityId, ...activityData };
      this.options = options; // Store options for preview mode
      console.log('🔍 [TEACHER PREVIEW] Current activity set:', this.currentActivity);
      console.log('🔍 [TEACHER PREVIEW] Options:', this.options);
      console.log('🔍 [TEACHER PREVIEW] options.preview:', this.options?.preview);
      console.log('🔍 [TEACHER PREVIEW] Activity type:', this.currentActivity?.type || this.currentActivity?.activity_type);
      
      this.currentQuestionIndex = 0;
      this.answers = {};
      this.startTime = new Date();
      
      console.log('🔍 DEBUG: Creating modal...');
      this.createModal();
      console.log('🔍 DEBUG: Modal created, binding events...');
      this.bindEvents();
      console.log('🔍 DEBUG: Try Answering modal setup complete!');
      
    } catch (error) {
      console.error('🔍 DEBUG: Error in showTryAnsweringModal:', error);
      console.error('🔍 DEBUG: Error stack:', error.stack);
      throw error;
    }
  }

  // Create the modal structure - EXACT STUDENT INTERFACE
  createModal() {
    // Remove existing modal if any
    if (this.modal) {
      this.modal.remove();
    }

    this.modal = document.createElement('div');
    this.modal.className = 'modal';
    this.modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;';

    const isCoding = this.isCodingActivity(this.currentActivity);
    if (isCoding) {
      // Redirect to full-page Codestem preview
      const aid = this.currentActivity && (this.currentActivity.id || this.currentActivity.activity_id);
      if (aid) {
        window.location.assign('coding_preview_full.php?activity_id=' + encodeURIComponent(aid));
        return;
      }
    }
    
    this.modal.innerHTML = `
      <div class="modal-card" style="background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden;max-width:1400px;width:98%;max-height:95vh;display:flex;flex-direction:column;font-family:'Inter',sans-serif;">
        <!-- STUDENT TEST HEADER -->
        <div style="background:linear-gradient(135deg, #28a745 0%, #20c997 100%);color:white;padding:16px;font-family:'Inter',sans-serif;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <h2 style="margin:0;font-size:20px;font-weight:600;line-height:1.2;font-family:'Inter',sans-serif;">${this.currentActivity.title || 'Activity'}</h2>
            <div style="text-align:right;font-family:'Inter',sans-serif;">
              <div style="font-size:12px;opacity:0.9;font-family:'Inter',sans-serif;">Total Points</div>
              <div style="font-size:18px;font-weight:700;font-family:'Inter',sans-serif;" id="totalPoints">0</div>
            </div>
          </div>
          <div style="display:flex;gap:12px;font-size:13px;opacity:0.95;font-family:'Inter',sans-serif;align-items:center;flex-wrap:wrap;">
            <span id="activityTypeDisplay" style="font-family:'Inter',sans-serif;">📝 UPLOAD BASED</span>
            <span style="font-family:'Inter',sans-serif;">⏱️ <span id="timer">No time limit</span></span>
            <span id="questionCountDisplay" style="font-family:'Inter',sans-serif;">📊 1 question</span>
          </div>
        </div>
        
        <!-- PROGRESS BAR (Hidden for upload-based activities) -->
        <div id="progress-section" style="padding:12px 16px;background:#f8f9fa;border-bottom:1px solid #e9ecef;font-family:'Inter',sans-serif;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-size:14px;color:#333;font-weight:600;font-family:'Inter',sans-serif;">⭐ Progress</span>
            <span id="progress-counter" style="font-size:14px;color:#28a745;font-weight:600;font-family:'Inter',sans-serif;">0 / 1 answered</span>
          </div>
          <div style="background:#e9ecef;border-radius:10px;height:6px;overflow:hidden;">
            <div id="progress-bar" style="background:linear-gradient(135deg, #28a745 0%, #20c997 100%);height:100%;width:0%;transition:width 0.3s ease;"></div>
          </div>
        </div>
        
        <!-- INSTRUCTIONS SECTION -->
        <div id="instructionsSection" style="padding:20px;border-bottom:1px solid #e9ecef;background:#f8f9fa;font-family:'Inter',sans-serif;">
          <h3 style="margin:0 0 12px 0;color:#333;font-size:16px;font-family:'Inter',sans-serif;">📋 Instructions</h3>
          <p id="instructionsText" style="margin:0;color:#555;line-height:1.6;font-family:'Inter',sans-serif;">Loading instructions...</p>
        </div>
        
        <!-- MAIN CONTENT AREA -->
        <div style="display:flex;flex:1;overflow:hidden;">
        <!-- QUESTIONS CONTENT - FULL WIDTH -->
        <div style="flex:1;padding:30px;overflow-y:auto;font-family:'Inter',sans-serif;" id="questionsContent">
          <!-- Questions will be loaded here -->
        </div>
        </div>
        
        <!-- QUESTION NAVIGATION -->
        <div id="questionNavigation" style="padding:15px 20px;background:#f8f9fa;border-top:1px solid #e9ecef;display:grid;grid-template-columns:repeat(auto-fit,40px);gap:8px;justify-content:center;font-family:'Inter',sans-serif;">
          <!-- Question navigation buttons will be loaded here -->
        </div>
        
        <!-- SUBMIT SECTION (sticks to bottom) -->
        <div id="submitSection" style="position:sticky;bottom:0;margin:0;padding:16px 25px;background:#f8f9fa;border-top:1px solid #e9ecef;font-family:'Inter',sans-serif;z-index:5;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:14px;color:#6c757d;margin-bottom:4px;font-family:'Inter',sans-serif;">Ready to submit?</div>
              <div style="font-size:12px;color:#6c757d;font-family:'Inter',sans-serif;">Make sure you've answered all questions</div>
            </div>
            <div style="display:flex;gap:12px;">
              ${(() => {
                // DEEP DEBUG: Log all relevant values
                console.log('🔍 [TEACHER PREVIEW] Rendering submit section:');
                console.log('  - this.options:', this.options);
                console.log('  - this.options?.preview:', this.options?.preview);
                console.log('  - this.currentActivity:', this.currentActivity);
                const activityType = this.currentActivity?.type || this.currentActivity?.activity_type || '';
                console.log('  - activityType:', activityType);
                const isPreview = !!(this.options && this.options.preview);
                console.log('  - isPreview:', isPreview);
                const isAutoGradable = activityType !== 'coding' && activityType !== 'upload_based' && activityType !== 'essay';
                console.log('  - isAutoGradable:', isAutoGradable);
                
                // In preview mode, show Test button for auto-gradable activities (like Coordinator side)
                if (isPreview) {
                  if (isAutoGradable) {
                    console.log('🔍 [TEACHER PREVIEW] ✅ Rendering Test button for activityType:', activityType);
                    return `
                      <button id="preview-test-btn" style="background:linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);color:white;border:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 2px 4px rgba(14,165,233,0.3);" onclick="window.testPreviewActivityTeacher('${activityType}')">
                        <i class="fas fa-check-circle"></i> Test
                      </button>
                    `;
                  } else if (activityType === 'essay' || activityType === 'upload_based') {
                    console.log('🔍 [TEACHER PREVIEW] Rendering manual grading message for activityType:', activityType);
                    return `
                      <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:6px;padding:10px 16px;font-size:12px;color:#856404;">
                        <i class="fas fa-info-circle"></i> This activity requires manual grading by the teacher.
                      </div>
                    `;
                  } else {
                    console.log('🔍 [TEACHER PREVIEW] ⚠️ Preview mode but activityType not auto-gradable:', activityType);
                  }
                } else {
                  console.log('🔍 [TEACHER PREVIEW] ⚠️ NOT in preview mode, skipping Test button');
                }
                return '';
              })()}
              <button id="finish-attempt-btn" style="background:linear-gradient(135deg, #28a745 0%, #20c997 100%);color:white;border:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 2px 4px rgba(40,167,69,0.3);font-family:'Inter',sans-serif;">
                ${this.options && this.options.preview ? 'Close Preview' : 'Finish Attempt'}
              </button>
            </div>
          </div>
        </div>
        
        <!-- CLOSE BUTTON -->
        <div style="position:absolute;top:10px;right:10px;">
          <button id="closeTryAnsweringModal" style="background:rgba(0,0,0,0.5);color:white;border:none;padding:8px;border-radius:50%;font-size:16px;cursor:pointer;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">&times;</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      // Track if this is student view
      this.isStudent = (window.__USER_ROLE__ || '').toLowerCase() === 'student';
      
      // Initialize start time for leaderboard
      if (!this.startTime) {
        this.startTime = new Date();
      }
      
      this.loadQuestions();
      this.startTimer();
      
      // Load existing progress (draft + localStorage)
      this.loadExistingProgress();
      
      // In preview mode, add answer tracking for progress
      if (this.options && this.options.preview) {
        this.bindPreviewAnswerTracking();
      }
      
      // Retry any failed saves on page load
      this.retryFailedSaves();
    });
  }

  isCodingActivity(activity) {
    if (!activity) return false;
    const typeCandidates = [activity.type, activity.activity_type, activity.kind, activity.category];
    for (const t of typeCandidates) {
      if (t && String(t).toLowerCase().includes('coding')) {
        return true;
      }
    }
    if (activity.meta && typeof activity.meta === 'object') {
      const metaType = activity.meta.type || activity.meta.kind;
      if (metaType && String(metaType).toLowerCase().includes('coding')) {
        return true;
      }
    }
    return false;
  }

  // Load questions for the activity
  async loadQuestions() {
    try {
      console.log('🔍 DEBUG: loadQuestions() called');
      console.log('🔍 DEBUG: Current activity:', this.currentActivity);
      
      // Ensure modal elements exist before proceeding
      const totalPointsEl = document.getElementById('totalPoints');
      const instructionsEl = document.getElementById('instructionsText');
      const questionsContent = document.getElementById('questionsContent');
      
      console.log('🔍 DEBUG: Modal elements found:', {
        totalPointsEl: !!totalPointsEl,
        instructionsEl: !!instructionsEl,
        questionsContent: !!questionsContent
      });
      
      if (!totalPointsEl || !instructionsEl || !questionsContent) {
        console.log('🔍 DEBUG: Modal elements not ready, retrying in 200ms...');
        setTimeout(() => this.loadQuestions(), 200);
        return;
      }

      // Check if currentActivity exists
      if (!this.currentActivity) {
        throw new Error('No activity data available');
      }

      // Use the activity data that was passed from the dropdown click
      // CRITICAL: Ensure questions are properly extracted from activity object
      let questions = this.currentActivity.questions || this.currentActivity.question || [];
      
      console.log('🔍 DEBUG: Initial questions check:', {
        'this.currentActivity.questions': this.currentActivity.questions,
        'this.currentActivity.question': this.currentActivity.question,
        'questions length': questions.length,
        'activity type': this.currentActivity.type,
        'activity id': this.currentActivity.id
      });
      
      // If no questions found and it's not a coding/upload activity, try fetching from API
      if (questions.length === 0 && this.currentActivity.id) {
        const activityType = String(this.currentActivity.type || '').toLowerCase();
        if (activityType !== 'coding' && activityType !== 'upload_based' && activityType !== 'laboratory') {
          console.log('🔍 DEBUG: No questions found, attempting to fetch from API...');
          try {
            const apiData = await this.getActivityQuestions(this.currentActivity.id);
            if (apiData && apiData.questions && apiData.questions.length > 0) {
              questions = apiData.questions;
              console.log('🔍 DEBUG: Successfully fetched questions from API:', questions.length);
              // Update currentActivity with fetched questions
              this.currentActivity.questions = questions;
            }
          } catch (apiError) {
            console.error('🔍 DEBUG: Failed to fetch questions from API:', apiError);
          }
        }
      }
      
      console.log('🔍 DEBUG: Final questions array:', {
        'questions length': questions.length,
        'first question': questions[0] || null
      });
      
      const activityData = {
        activity: this.currentActivity,
        questions: questions,
        settings: this.currentActivity.settings || {}
      };
      
      console.log('🔍 DEBUG: Activity data prepared:', {
        activity: activityData.activity,
        questionsCount: activityData.questions.length,
        settings: activityData.settings,
        activityType: activityData.activity.type
      });
      
      // Store the complete activity data
      this.activityData = activityData;
      this.questions = activityData.questions;
      this.settings = activityData.settings;
      
      console.log('🔍 DEBUG: About to update activity info...');
      // Update activity info in modal
      this.updateActivityInfo(activityData.activity);
      console.log('🔍 DEBUG: Activity info updated successfully!');
      
      const activityType = String(activityData.activity.type || '').toLowerCase();

      if (activityType === 'coding') {
        // Force coding preview (regardless of questions array)
        this.questions = [];
        this.displayActivityWithoutQuestions();
        return;
      }

      // For upload-based activities, show the upload interface
      if (this.questions.length === 0 && (activityType === 'upload_based' || !activityType)) {
        console.log('🔍 DEBUG: Showing upload-based activity interface...');
        this.displayActivityWithoutQuestions();
      } else if (this.questions.length === 0) {
        // If no questions but not upload-based, show error
        console.error('🔍 DEBUG: No questions found for activity type:', activityType);
        const questionsContent = document.getElementById('questionsContent');
        if (questionsContent) {
          questionsContent.innerHTML = `
            <div style="text-align:center;padding:40px;color:#ef4444;">
              <i class="fas fa-exclamation-triangle" style="font-size:48px;margin-bottom:16px;"></i>
              <h3 style="margin:0 0 8px 0;">No Questions Found</h3>
              <p style="margin:0;color:#6b7280;">This activity doesn't have any questions configured yet.</p>
            </div>
          `;
        }
      } else {
        console.log('🔍 DEBUG: Showing all questions at once...', {
          questionsCount: this.questions.length,
          firstQuestion: this.questions[0]
        });
        this.displayAllQuestions();
      }
      
      console.log('🔍 DEBUG: loadQuestions completed successfully!');
      
    } catch (error) {
      console.error('🔍 DEBUG: Error in loadQuestions:', error);
      console.error('🔍 DEBUG: Error stack:', error.stack);
      
      const questionsContent = document.getElementById('questionsContent');
      if (questionsContent) {
        questionsContent.innerHTML = `
          <div style="text-align:center;padding:40px;color:#ef4444;">
            <i class="fas fa-exclamation-triangle" style="font-size:48px;margin-bottom:16px;"></i>
            <h3 style="margin:0 0 8px 0;">Error loading activity</h3>
            <p style="margin:0;color:#6b7280;">${error.message}</p>
            <details style="margin-top:16px;text-align:left;background:#f8f9fa;padding:12px;border-radius:4px;">
              <summary style="cursor:pointer;font-weight:600;">Debug Details</summary>
              <pre style="margin:8px 0 0 0;font-size:12px;color:#6c757d;">${error.stack}</pre>
            </details>
          </div>
        `;
      }
    }
  }

  // Update activity info in modal header - STUDENT INTERFACE
  updateActivityInfo(activity) {
    // Update total points
    const totalPointsEl = document.getElementById('totalPoints');
    if (totalPointsEl) {
      totalPointsEl.textContent = activity.max_score || 10; // Default to 10 points
      } else {
      }

    // Update activity type display
    const activityTypeEl = document.getElementById('activityTypeDisplay');
    if (activityTypeEl) {
      const typeIcon = this.getActivityIcon(activity.type || 'upload_based');
      const typeLabel = this.getActivityTypeLabel(activity.type || 'upload_based').toUpperCase();
      activityTypeEl.innerHTML = `<i class="fas fa-${typeIcon}"></i> ${typeLabel}`;
    }

    // Update question count
    const questionCountEl = document.getElementById('questionCountDisplay');
    if (questionCountEl) {
      const questionCount = this.questions && this.questions.length > 0 ? this.questions.length : 1;
      questionCountEl.textContent = `📊 ${questionCount} question${questionCount !== 1 ? 's' : ''}`;
    }

    // Update instructions
    const instructionsEl = document.getElementById('instructionsText');
    if (instructionsEl) {
      let instructions = 'No instructions provided';
      if (activity.instructions) {
        try {
          const meta = JSON.parse(activity.instructions);
          instructions = meta.instructions || activity.instructions;
        } catch (e) {
          instructions = activity.instructions;
        }
      } else if (activity.description) {
        instructions = activity.description;
      }
      instructionsEl.textContent = instructions;
      } else {
      }

    // Update progress counter
    const progressEl = document.getElementById('progress-counter');
    if (progressEl) {
      const questionCount = this.questions && this.questions.length > 0 ? this.questions.length : 1;
      progressEl.textContent = `0 / ${questionCount} answered`;
      } else {
      }
  }

  // Get activity type label
  getActivityTypeLabel(type) {
    const labels = {
      'multiple_choice': 'Multiple Choice Quiz',
      'true_false': 'True/False Quiz',
      'identification': 'Identification Quiz',
      'essay': 'Essay Test',
      'upload_based': 'Upload-Based Activity',
      'laboratory': 'Laboratory Exercise',
      'coding': 'Coding Challenge'
    };
    return labels[type] || type;
  }

  // Get real activity data from API (same as student test interface)
  async getActivityQuestions(activityId) {
    try {
      // Try using the universal activity API first
      const response = await fetch(`universal_activity_api.php?action=get_activity&id=${activityId}`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('🔍 DEBUG: Failed to parse API response:', parseError);
        throw new Error('Invalid response from server');
      }
      
      if (data.success && data.activity) {
        console.log('🔍 DEBUG: Activity data from API:', {
          activityId: data.activity.id,
          type: data.activity.type,
          questionsCount: data.activity.questions ? data.activity.questions.length : 0,
          questions: data.activity.questions
        });
        
        // Return the activity data in the same format as student test
        return {
          activity: data.activity,
          questions: data.activity.questions || [],
          settings: data.activity.settings || {}
        };
      } else {
        throw new Error(data.message || 'Failed to load activity');
      }
    } catch (error) {
      console.error('🔍 DEBUG: Error in getActivityQuestions:', error);
      
      // Fallback: Try to get activity data from the current activity object
      if (this.currentActivity && this.currentActivity.questions) {
        console.log('🔍 DEBUG: Using fallback - current activity questions:', this.currentActivity.questions);
        return {
          activity: this.currentActivity,
          questions: this.currentActivity.questions,
          settings: this.currentActivity.settings || {}
        };
      }
      
      // If no real data available, show appropriate message
      throw new Error('Unable to load activity data. Please check if the activity has been properly configured.');
    }
  }

  // Handle progress display based on activity type
  handleProgressDisplay() {
    const progressSection = document.getElementById('progress-section');
    
    if (progressSection) {
      // Hide progress for upload-based activities
      if (this.currentActivity.type === 'upload_based' || this.currentActivity.type === 'UPLOAD_BASED') {
        progressSection.style.display = 'none';
        console.log('🔍 DEBUG: Progress section hidden for upload-based activity');
      } else {
        progressSection.style.display = 'block';
        console.log('🔍 DEBUG: Progress section shown for question-based activity');
      }
    }
  }

  // Display all questions at once
  displayAllQuestions() {
    const questionsContent = document.getElementById('questionsContent');
    if (!questionsContent) return;
    
    // Reset answers for fresh start
    this.answers = {};
    console.log('🔍 DEBUG: Answers reset to empty object:', this.answers);
    
    let allQuestionsHtml = '';
    
    this.questions.forEach((question, index) => {
      allQuestionsHtml += `
        <div id="question-${index}" style="border:1px solid #e9ecef;border-radius:8px;padding:30px;margin-bottom:30px;background:white;box-shadow:0 1px 3px rgba(0,0,0,0.1);font-family:'Inter',sans-serif;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h3 style="margin:0;color:#333;font-size:18px;font-weight:500;font-family:'Inter',sans-serif;">Question ${index + 1}</h3>
            <div style="background:#e9ecef;color:#495057;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;font-family:'Inter',sans-serif;">
              ${question.points || 1} point${(question.points || 1) !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div style="margin-bottom:20px;">
            <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333;font-weight:600;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">${question.question_text || question.question || 'Question text not available'}</p>
          </div>
          
          ${this.renderQuestionInput(question, question.id || question._id || index)}
        </div>
      `;
    });
    
    questionsContent.innerHTML = allQuestionsHtml;
    
    // Hide progress section for upload-based activities
    this.handleProgressDisplay();
    
    // Add event delegation for choice clicks
    this.setupChoiceEventListeners();
    
    // Update progress counter and bar (only for non-upload activities)
    if (this.currentActivity.type !== 'upload_based' && this.currentActivity.type !== 'UPLOAD_BASED') {
      this.updateProgress();
      // Don't load existing progress automatically - let user start fresh
      // this.loadExistingProgress();
    }
  }

  // Display current question - STUDENT INTERFACE
  displayCurrentQuestion() {
    const questionsContent = document.getElementById('questionsContent');
    const questionNavigation = document.getElementById('questionNavigation');
    
    // Handle activities with no questions (like upload-based activities)
    if (!this.questions || this.questions.length === 0) {
      this.displayActivityWithoutQuestions();
      return;
    }
    
    const question = this.questions[this.currentQuestionIndex];
    
    // Render question navigation
    if (questionNavigation) {
      let navHtml = '';
      for (let i = 0; i < this.questions.length; i++) {
        const isActive = i === this.currentQuestionIndex;
        navHtml += `
          <div id="nav-${i}" style="width:32px;height:32px;border:2px solid ${isActive ? '#28a745' : '#dee2e6'};border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:${isActive ? '#28a745' : 'white'};font-size:12px;font-weight:600;color:${isActive ? 'white' : '#495057'};transition:all 0.2s;" onclick="window.activityTester.goToQuestion(${i})">
            ${i + 1}
          </div>
        `;
      }
      questionNavigation.innerHTML = navHtml;
    }
    
    // Render the question content
    let questionHtml = `
      <div style="border:1px solid #e9ecef;border-radius:8px;padding:30px;margin-bottom:30px;background:white;box-shadow:0 1px 3px rgba(0,0,0,0.1);font-family:'Inter',sans-serif;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h3 style="margin:0;color:#333;font-size:18px;font-weight:500;font-family:'Inter',sans-serif;">Question ${this.currentQuestionIndex + 1}</h3>
          <div style="background:#e9ecef;color:#495057;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;font-family:'Inter',sans-serif;">
            ${question.points || 1} point${(question.points || 1) !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div style="margin-bottom:20px;">
          <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333;font-weight:600;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">${question.question_text || question.question || 'Question text not available'}</p>
        </div>
        
        ${this.renderQuestionInput(question, this.currentQuestionIndex)}
      </div>
    `;

    if (questionsContent) {
      questionsContent.innerHTML = questionHtml;
    }
    
    this.updateNavigation();
  }

  // Render question input based on question type
  renderQuestionInput(question, questionIndex) {
    // Use actual question ID if available, otherwise fallback to index
    const questionId = question.id || question._id || questionIndex;
    
    // Check for question type from multiple possible sources
    const questionType = question.type || question.activity_type || this.currentActivity?.type || 'multiple_choice';
    
    let result;
    switch (questionType) {
      case 'multiple_choice':
        result = this.renderMultipleChoiceInput(question, questionId);
        break;
      case 'true_false':
        result = this.renderTrueFalseInput(question, questionId);
        break;
      case 'identification':
        result = this.renderIdentificationInput(question, questionId);
        break;
      case 'essay':
        result = this.renderEssayInput(question, questionId);
        break;
      case 'upload_based':
      case 'UPLOAD_BASED':
        result = this.renderUploadInput(question, questionId);
        break;
      default:
        result = this.renderMultipleChoiceInput(question, questionId);
    }
    
    return result;
  }

  // Render multiple choice input
  renderMultipleChoiceInput(question, questionId) {
    const choices = question.choices || [];
    console.log('🔍 [TEACHER] renderMultipleChoiceInput called:', {
      questionId: questionId,
      question: question,
      choices: choices,
      choicesCount: choices.length
    });
    
    let choicesHtml = '';
    
    choices.forEach((choice, index) => {
      const choiceLabel = String.fromCharCode(65 + index); // A, B, C, D, E, etc.
      
      // Handle multiple possible field names for choice text
      const rawText = choice.choice_text || choice.text || choice.content || choice.option || '';
      const choiceText = (rawText && String(rawText).trim()) ? String(rawText).trim() : `Choice ${index + 1}`;
      
      console.log('🔍 [TEACHER] Rendering choice', index, ':', {
        choice_object: choice,
        has_choice_text: !!choice.choice_text,
        has_text: !!choice.text,
        choice_text_value: choice.choice_text,
        text_value: choice.text,
        rawText: rawText,
        final_choiceText: choiceText,
        choiceId: choice.id
      });
      
      choicesHtml += `
        <div class="choice-container" data-question="${questionId}" data-choice="${choice.id}" 
             style="margin-bottom:16px;padding:16px;border:1px solid #e9ecef;border-radius:8px;background:#f8f9fa;cursor:pointer;transition:all 0.2s ease;">
          <label style="display:flex;align-items:center;cursor:pointer;margin:0;">
            <input type="radio" name="question_${questionId}" value="${choice.id}" 
                   style="margin-right:16px;transform:scale(1.3);">
            <span style="flex:1;font-size:15px;line-height:1.6;">
              <strong>${choiceLabel}.</strong> ${choiceText}
            </span>
          </label>
        </div>
      `;
    });
    
    return `
      <div style="margin-top:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h4 style="margin:0;color:#333;font-size:16px;">Select your answer:</h4>
          <button type="button" onclick="window.activityTester.clearAnswer(${questionId})" 
                  style="background:#f8f9fa;color:#6c757d;border:1px solid #dee2e6;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;transition:all 0.2s;"
                  onmouseover="this.style.background='#e9ecef';this.style.borderColor='#adb5bd';"
                  onmouseout="this.style.background='#f8f9fa';this.style.borderColor='#dee2e6';">
            🗑️ Clear Answer
          </button>
        </div>
        ${choicesHtml}
      </div>
    `;
  }

  // Render true/false input
  // CRITICAL: Use choice IDs like Multiple Choice, not boolean values
  renderTrueFalseInput(question, questionId) {
    const choices = question.choices || [];
    
    // Find True and False choices
    let trueChoice = null;
    let falseChoice = null;
    
    choices.forEach((choice) => {
      const choiceText = String(choice.choice_text || choice.text || '').toLowerCase().trim();
      if (choiceText === 'true' || choiceText === '1') {
        trueChoice = choice;
      } else if (choiceText === 'false' || choiceText === '0') {
        falseChoice = choice;
      }
    });
    
    // Fallback: if choices not found, use first two choices (assume first is True, second is False)
    if (!trueChoice && choices.length > 0) {
      trueChoice = choices[0];
    }
    if (!falseChoice && choices.length > 1) {
      falseChoice = choices[1];
    }
    
    // If still no choices, create placeholder IDs (shouldn't happen, but safety fallback)
    const trueChoiceId = trueChoice ? trueChoice.id : 'true';
    const falseChoiceId = falseChoice ? falseChoice.id : 'false';
    
    // Get current answer (might be choice ID or boolean)
    const currentAnswer = this.answers[questionId];
    const trueChecked = (currentAnswer === trueChoiceId || currentAnswer === true || currentAnswer === 'true') ? 'checked' : '';
    const falseChecked = (currentAnswer === falseChoiceId || currentAnswer === false || currentAnswer === 'false') ? 'checked' : '';
    
    // CRITICAL: Ensure choice IDs are numbers (not strings) for proper submission
    const trueId = typeof trueChoiceId === 'number' ? trueChoiceId : parseInt(trueChoiceId, 10);
    const falseId = typeof falseChoiceId === 'number' ? falseChoiceId : parseInt(falseChoiceId, 10);
    
    return `
      <div style="margin-top:20px;">
        <h4 style="margin:0 0 16px 0;color:#333;font-size:16px;">Select your answer:</h4>
        <div style="display:flex;gap:16px;">
          <div class="choice-container" data-question="${questionId}" data-choice="${trueId}" 
               style="display:flex;align-items:center;padding:12px 24px;border:1px solid #e9ecef;border-radius:6px;background:#f8f9fa;cursor:pointer;flex:1;justify-content:center;transition:all 0.2s ease;"
               onclick="window.activityTester.saveAnswer(${questionId}, ${trueId})">
            <input type="radio" name="question_${questionId}" value="${trueId}" ${trueChecked} style="margin-right:8px;transform:scale(1.2);"
                   onchange="window.activityTester.saveAnswer(${questionId}, ${trueId})">
            <span style="font-size:16px;font-weight:600;color:#28a745;">TRUE</span>
          </div>
          <div class="choice-container" data-question="${questionId}" data-choice="${falseId}" 
               style="display:flex;align-items:center;padding:12px 24px;border:1px solid #e9ecef;border-radius:6px;background:#f8f9fa;cursor:pointer;flex:1;justify-content:center;transition:all 0.2s ease;"
               onclick="window.activityTester.saveAnswer(${questionId}, ${falseId})">
            <input type="radio" name="question_${questionId}" value="${falseId}" ${falseChecked} style="margin-right:8px;transform:scale(1.2);"
                   onchange="window.activityTester.saveAnswer(${questionId}, ${falseId})">
            <span style="font-size:16px;font-weight:600;color:#dc3545;">FALSE</span>
          </div>
        </div>
      </div>
    `;
  }

  // Render identification input
  renderIdentificationInput(question, questionId) {
    const value = this.answers[questionId] || '';
    return `
      <div style="margin-top:20px;">
        <h4 style="margin:0 0 16px 0;color:#333;font-size:16px;">Type your answer:</h4>
        <input type="text" name="question_${questionId}" value="${escapeHtml(value)}"
               style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;font-size:16px;font-family:'Inter',sans-serif;"
               placeholder="Enter your answer here..."
               oninput="window.activityTester.saveAnswer(${questionId}, this.value)">
      </div>
    `;
  }

  // Render essay input
  renderEssayInput(question, questionId) {
    const value = this.answers[questionId] || '';
    return `
      <div style="margin-top:20px;">
        <h4 style="margin:0 0 16px 0;color:#333;font-size:16px;">Write your answer:</h4>
        <textarea name="question_${questionId}" rows="6" 
                  style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;font-size:16px;font-family:'Inter',sans-serif;resize:vertical;"
                  placeholder="Write your essay answer here..."
                  oninput="window.activityTester.saveAnswer(${questionId}, this.value)">${escapeHtml(value)}</textarea>
      </div>
    `;
  }

  // Render upload input
  renderUploadInput(question, questionIndex) {
    return `
      <div style="margin-top:20px;">
        <h4 style="margin:0 0 16px 0;color:#333;font-size:16px;">Upload your work:</h4>
        <div style="border:2px dashed #d1d5db;border-radius:8px;padding:30px;text-align:center;background:#f9fafb;">
          <input type="file" id="fileInput_${questionIndex}" name="question_${questionIndex}" 
                 accept=".pdf,.docx,.jpg,.png"
                 style="display:none;" 
                 onchange="window.activityTester.handleFileUpload('${questionIndex}', this)">
          
          <!-- Paperclip Icon -->
          <div style="font-size:48px;color:#333;margin-bottom:15px;">📎</div>
          
          <!-- Main Text -->
          <h3 style="margin:0 0 8px 0;color:#333;font-size:18px;font-weight:600;">Upload Your File</h3>
          
          <!-- File Info -->
          <div style="margin:16px 0;font-size:14px;color:#6b7280;">
            <div style="margin-bottom:8px;">Accepted formats: PDF, DOCX, JPG, PNG</div>
            <div>Maximum file size: 10MB</div>
          </div>
          
          <!-- Choose File Button -->
          <button type="button" onclick="document.getElementById('fileInput_${questionIndex}').click()" 
                  style="background:#1d9b3e;color:#fff;border:none;padding:12px 24px;border-radius:6px;cursor:pointer;font-size:16px;font-weight:600;">
            Choose File
          </button>
          
          <!-- File Status -->
          <div id="fileStatus_${questionIndex}" style="margin-top:12px;font-size:14px;color:#6b7280;">No file selected</div>
        </div>
      </div>
    `;
  }

  // Go to specific question
  goToQuestion(index) {
    if (index >= 0 && index < this.questions.length) {
      this.currentQuestionIndex = index;
      this.displayCurrentQuestion();
    }
  }

  // Display activity without questions (like upload-based activities) - STUDENT INTERFACE
  displayActivityWithoutQuestions() {
    const questionsContent = document.getElementById('questionsContent');
    const questionNavigation = document.getElementById('questionNavigation');
    const activity = this.activityData?.activity;
    
    // Hide progress section for upload-based activities
    this.handleProgressDisplay();
    
    let activityHtml = `
      <div class="activity-content" style="text-align:center;padding:40px 20px;">
        <div style="font-size:64px;color:#1d9b3e;margin-bottom:24px;">
          <i class="fas fa-${this.getActivityIcon(activity?.type)}"></i>
        </div>
        <h3 style="margin:0 0 16px 0;color:#374151;font-size:24px;font-weight:700;">${activity?.title || 'Activity'}</h3>
        <p style="margin:0 0 24px 0;color:#6b7280;font-size:16px;line-height:1.6;max-width:600px;margin-left:auto;margin-right:auto;">
          ${activity?.description || 'Complete this activity as instructed.'}
        </p>
    `;

    // Add activity-specific content based on type
    if (activity?.type === 'upload_based' || !activity?.type) {
      // Simple upload interface for upload-based activities
      activityHtml += `
        <div style="border:2px dashed #d1d5db;border-radius:12px;padding:32px;background:#f9fafb;text-align:center;font-family:'Inter',sans-serif;">
          <div style="font-size:48px;margin-bottom:16px;color:#6b7280;">📎</div>
          <h4 style="margin:0 0 16px 0;color:#374151;font-size:18px;font-family:'Inter',sans-serif;">Upload Your Work</h4>
          <p style="margin:0 0 24px 0;color:#6b7280;font-size:14px;font-family:'Inter',sans-serif;">
            ${activity?.instructions || 'Complete this activity as instructed.'}
          </p>
          
          <div style="margin-bottom:20px;">
            <input type="file" id="activityUpload" 
                   accept=".pdf,.docx,.pptx,.jpg,.png,.txt,.zip"
                   style="display:none;"
                   onchange="alert('File selected: ' + this.files[0].name)">
            <button onclick="document.getElementById('activityUpload').click()" 
                    style="background:#1d9b3e;color:#fff;border:none;padding:16px 32px;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(29,155,62,0.3);font-family:'Inter',sans-serif;">
              <i class="fas fa-upload" style="margin-right:8px;"></i>
              Choose File
            </button>
          </div>
          
          <div style="margin-top:20px;font-size:12px;color:#6b7280;font-family:'Inter',sans-serif;">
            <div>Accepted formats: PDF, DOCX, PPTX, JPG, PNG, TXT, ZIP</div>
            <div>Maximum file size: 10MB</div>
          </div>
        </div>
      `;
    } else if (activity?.type === 'laboratory') {
      activityHtml += this.renderLaboratoryActivity(activity);
    } else if (activity?.type === 'coding') {
      activityHtml += this.renderCodingActivity(activity);
    } else {
      activityHtml += this.renderGenericActivity(activity);
    }

    activityHtml += `</div>`;
    
    if (questionsContent) {
      questionsContent.innerHTML = activityHtml;
    }

    if (activity && String(activity.type || '').toLowerCase() === 'coding') {
      this.initializeCodingPreview(activity);
    }
    
    // Hide question navigation for activities without questions
    if (questionNavigation) {
      questionNavigation.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#6c757d;font-size:12px;padding:8px;">No questions</div>';
    }
    
    this.updateNavigationForNoQuestions();
  }

  // Get activity icon
  getActivityIcon(type) {
    const icons = {
      'upload_based': 'cloud-upload-alt',
      'laboratory': 'flask',
      'coding': 'code',
      'multiple_choice': 'list-ul',
      'true_false': 'check-circle',
      'identification': 'question-circle',
      'essay': 'edit'
    };
    return icons[type] || 'tasks';
  }

  // Render upload-based activity - EXACT STUDENT INTERFACE
  renderUploadBasedActivity(activity) {
    // Parse activity instructions
    let instructions = 'Please upload your completed work file.';
    let acceptedFiles = ['pdf', 'docx', 'pptx', 'jpg', 'png', 'txt', 'zip'];
    let maxFileSize = 10;
    
    if (activity.instructions) {
      try {
        const meta = JSON.parse(activity.instructions);
        instructions = meta.instructions || activity.instructions;
        acceptedFiles = activity.acceptedFiles || acceptedFiles;
        maxFileSize = activity.maxFileSize || maxFileSize;
      } catch (e) {
        instructions = activity.instructions;
      }
    }
    
    return `
      <div style="border:2px dashed #d1d5db;border-radius:12px;padding:32px;background:#f9fafb;text-align:center;font-family:'Inter',sans-serif;">
        <div style="font-size:48px;margin-bottom:16px;color:#6b7280;">📎</div>
        <h4 style="margin:0 0 16px 0;color:#374151;font-size:18px;font-family:'Inter',sans-serif;">Upload Your Work</h4>
        <p style="margin:0 0 24px 0;color:#6b7280;font-size:14px;font-family:'Inter',sans-serif;">
          ${instructions}
        </p>
        
        <div style="margin-bottom:20px;">
          <input type="file" id="activityUpload" 
                 accept="${acceptedFiles.map(f => '.' + f).join(',')}"
                 style="display:none;"
                 onchange="window.activityTester.handleActivityUpload(this.files[0])">
          <button onclick="document.getElementById('activityUpload').click()" 
                  style="background:#1d9b3e;color:#fff;border:none;padding:16px 32px;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(29,155,62,0.3);font-family:'Inter',sans-serif;">
            <i class="fas fa-upload" style="margin-right:8px;"></i>
            Choose File
          </button>
        </div>
        
        <div style="margin-top:20px;font-size:12px;color:#6b7280;font-family:'Inter',sans-serif;">
          <div>Accepted formats: ${acceptedFiles.join(', ').toUpperCase()}</div>
          <div>Maximum file size: ${maxFileSize}MB</div>
        </div>
        
        <div id="uploadStatus" style="margin-top:16px;font-size:14px;font-family:'Inter',sans-serif;">
          <div id="fileName" style="color:#374151;font-weight:600;font-family:'Inter',sans-serif;"></div>
          <div id="fileSize" style="color:#6b7280;font-family:'Inter',sans-serif;"></div>
        </div>
      </div>
    `;
  }

  // Render laboratory activity
  renderLaboratoryActivity(activity) {
    return `
      <div class="laboratory-interface" style="border:1px solid #e5e7eb;border-radius:12px;padding:32px;background:#f8fafc;max-width:600px;margin:0 auto;">
        <h4 style="margin:0 0 16px 0;color:#374151;font-size:18px;">Laboratory Exercise</h4>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:24px;">
          <h5 style="margin:0 0 12px 0;color:#374151;font-size:16px;">Instructions:</h5>
          <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">${activity.instructions || 'Complete the laboratory exercise as described.'}</p>
        </div>
        
        <div style="display:flex;gap:16px;justify-content:center;">
          <button onclick="window.activityTester.openLabEnvironment()" 
                  style="background:#3b82f6;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">
            <i class="fas fa-external-link-alt" style="margin-right:8px;"></i>
            Open Lab Environment
          </button>
          <button onclick="document.getElementById('labUpload').click()" 
                  style="background:#1d9b3e;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">
            <i class="fas fa-upload" style="margin-right:8px;"></i>
            Upload Results
          </button>
        </div>
        
        <input type="file" id="labUpload" style="display:none;" 
               onchange="window.activityTester.handleActivityUpload(this.files[0])">
      </div>
    `;
  }

  // Render coding activity
  renderCodingActivity(activity) {
    const testCases = Array.isArray(activity.test_cases) ? activity.test_cases : (Array.isArray(activity.testCases) ? activity.testCases : []);
    const meta = this.extractCodingMeta(activity);
    const languageLabel = (meta.language || meta.lang || 'cpp').toString().toUpperCase();
    const requiredConstruct = meta.requiredConstruct || meta.required_construct || '';
    const totalPoints = this.computeCodingTotalPoints(activity, testCases);
    const starterCode = this.answers['code'] || meta.starterCode || meta.starter_code || '';
    const problemStatement = meta.problemStatement || meta.problem || activity.problem || activity.description || 'Complete the coding challenge.';
    const moreInstructions = meta.instructions && typeof meta.instructions === 'string' ? meta.instructions : '';

    const testCaseBlocks = testCases.length ? testCases.map((tc, idx) => {
      const inputText = tc.input_text || tc.inputText || tc.input || '';
      const expectedOutput = tc.expected_output || tc.expectedOutput || tc.expected_output_text || '';
      const points = parseInt(tc.points || 0, 10) || 0;
      const sampleBadge = tc.is_sample ? '<span style="margin-left:8px;background:#d1fae5;color:#047857;border-radius:999px;padding:2px 8px;font-size:11px;font-weight:600;">Sample</span>' : '';
      return `
        <div class="coding-testcase" data-testcase-index="${idx}" style="border:1px solid #e5e7eb;border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <label style="display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;color:#1f2937;cursor:pointer;">
              <input type="radio" name="coding-testcase" value="${idx}" ${idx === 0 ? 'checked' : ''}>
              Test Case ${idx + 1} ${sampleBadge}
              ${points ? `<span style="font-size:11px;color:#64748b;font-weight:500;">(${points} pts)</span>` : ''}
            </label>
            <span id="codingStatus-${idx}" style="font-size:12px;color:#6b7280;font-weight:600;">Not run</span>
          </div>
          <div style="display:grid;gap:10px;font-size:12px;color:#111827;">
            <div>
              <div style="font-weight:600;color:#6b7280;">Input</div>
              <pre style="margin:4px 0 0 0;padding:8px;background:#f9fafb;border-radius:6px;border:1px solid #e5e7eb;white-space:pre-wrap;font-family:'Courier New',monospace;">${escapeHtml(inputText)}</pre>
            </div>
            <div>
              <div style="font-weight:600;color:#6b7280;">Expected Output</div>
              <pre style="margin:4px 0 0 0;padding:8px;background:#f3f4f6;border-radius:6px;border:1px solid #e5e7eb;white-space:pre-wrap;font-family:'Courier New',monospace;">${escapeHtml(expectedOutput)}</pre>
            </div>
            <div>
              <div style="font-weight:600;color:#6b7280;">Your Output</div>
              <pre id="codingOutput-${idx}" style="margin:4px 0 0 0;padding:8px;background:#0f172a;color:#e5e7eb;border-radius:6px;border:1px solid #1f2937;white-space:pre-wrap;font-family:'Courier New',monospace;">(not run)</pre>
            </div>
          </div>
        </div>
      `;
    }).join('') : '<div style="padding:12px;border:1px dashed #e5e7eb;border-radius:8px;color:#6b7280;font-size:13px;">No test cases configured for this activity.</div>';

    return `
      <div class="teacher-coding-preview" style="display:flex;flex-direction:column;gap:24px;">
        <div style="display:flex;flex-wrap:wrap;gap:24px;">
          <div class="coding-main" style="flex:2 1 520px;background:#ffffff;border-radius:12px;padding:24px;box-shadow:0 4px 16px rgba(15,23,42,0.08);min-width:320px;">
            <div style="margin-bottom:20px;">
              <h4 style="margin:0 0 12px 0;font-size:20px;font-weight:700;color:#111827;">${escapeHtml(activity.title || 'Coding Challenge')}</h4>
              <div style="font-size:14px;color:#374151;font-weight:600;line-height:1.7;white-space:pre-wrap;">${escapeHtml(problemStatement)}</div>
              ${moreInstructions ? `<div style="margin-top:12px;padding:12px;border-radius:8px;background:#f8fafc;color:#4b5563;line-height:1.6;">${escapeHtml(moreInstructions)}</div>` : ''}
            </div>
            <div>
              <label for="activityCode" style="display:block;margin-bottom:8px;font-size:13px;font-weight:600;color:#1f2937;">Your Code</label>
              <textarea id="activityCode" style="width:100%;min-height:260px;padding:16px;border:1px solid #d1d5db;border-radius:10px;font-family:'Courier New',monospace;font-size:14px;background:#0f172a;color:#e5e7eb;resize:vertical;">${escapeHtml(starterCode)}</textarea>
            </div>
            <div style="margin-top:16px;">
              <label for="codingCustomInput" style="display:block;margin-bottom:6px;font-size:12px;font-weight:600;color:#6b7280;">Custom Input (used when running code)</label>
              <textarea id="codingCustomInput" style="width:100%;min-height:60px;padding:10px;border:1px solid #d1d5db;border-radius:8px;font-family:'Courier New',monospace;font-size:13px;resize:vertical;" placeholder="Optional input..."></textarea>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:18px;">
              <button id="codingRunBtn" onclick="window.activityTester.runCodingQuick()" style="background:#16a34a;color:#fff;border:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;">
                <i class="fas fa-play"></i> Run Code
              </button>
              <button id="codingCheckBtn" onclick="window.activityTester.checkCodingTest()" style="background:#10b981;color:#fff;border:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;">
                <i class="fas fa-check-circle"></i> Check Test
              </button>
              <button id="codingTestAllBtn" onclick="window.activityTester.testCodingAll()" style="background:#fbbf24;color:#1f2937;border:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;">
                <i class="fas fa-vial"></i> Test (All Cases)
              </button>
              <button id="codingResetBtn" onclick="window.activityTester.resetCodingPreview()" style="background:#6b7280;color:#fff;border:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;">
                <i class="fas fa-undo"></i> Reset
              </button>
              <button onclick="window.activityTester.saveCodingDraft()" style="background:#1d9b3e;color:#fff;border:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;">
                <i class="fas fa-save"></i> Save Draft
              </button>
            </div>
            <div id="codingStatusMessage" style="margin-top:16px;font-size:13px;font-weight:600;color:#2563eb;">Ready to run tests.</div>
            <div id="codingTerminalOutput" style="display:none;margin-top:16px;padding:14px;border-radius:8px;background:#0f172a;color:#e5e7eb;font-family:'Courier New',monospace;white-space:pre-wrap;max-height:240px;overflow:auto;"></div>
          </div>
          <div class="coding-sidebar" style="flex:1 1 320px;background:#ffffff;border-radius:12px;padding:20px;box-shadow:0 4px 16px rgba(15,23,42,0.08);min-width:260px;max-height:80vh;overflow-y:auto;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
              <div>
                <div style="font-size:12px;color:#6b7280;">Language</div>
                <div style="font-size:16px;font-weight:700;color:#111827;">${escapeHtml(languageLabel)}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:12px;color:#6b7280;">Total Points</div>
                <div id="codingScoreValue" style="font-size:16px;font-weight:700;color:#111827;">0 / ${totalPoints}</div>
              </div>
            </div>
            ${requiredConstruct ? `<div style="margin-bottom:16px;padding:12px;border-radius:10px;background:#fef3c7;color:#92400e;font-size:13px;display:flex;gap:8px;align-items:center;"><i class=\"fas fa-lightbulb\"></i><span>Required construct: <strong>${escapeHtml(requiredConstruct)}</strong></span></div>` : ''}
            <div>
              <h5 style="margin:0 0 12px 0;font-size:14px;font-weight:600;color:#1f2937;">Test Cases</h5>
              <div id="codingTestCasesList" style="display:flex;flex-direction:column;gap:12px;">
                ${testCaseBlocks}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderCodingPreviewModal() {
    const ctx = this.buildCodingContext(this.currentActivity);
    const meta = ctx?.meta || {};
    const languageLabel = (meta.language || meta.lang || 'cpp').toString().toUpperCase();
    const requiredConstruct = meta.requiredConstruct || meta.required_construct || '';
    const totalPoints = ctx ? ctx.totalPoints : 0;
    const testCaseBlocks = this.buildCodingTestCaseBlocks(ctx);

    const activity = this.currentActivity || {};
    const problemStatement = meta.problemStatement || meta.problem || activity.problem || activity.description || '';
    const instructions = meta.instructions && typeof meta.instructions === 'string' ? meta.instructions : (activity.description || 'Complete this activity as instructed.');
    const sampleOutputs = (ctx?.testCases || []).filter(tc => tc.is_sample).map((tc, idx) => {
      const expected = tc.expected_output || tc.expectedOutput || tc.expected_output_text || '';
      return `
        <div style="padding:12px;border-radius:8px;border:1px solid #e5e7eb;background:#f9fafb;margin-bottom:10px;">
          <div style="font-size:11px;font-weight:600;color:#059669;margin-bottom:6px;">Sample Output ${idx + 1}</div>
          <pre style="margin:0;font-size:12px;color:#111827;white-space:pre-wrap;font-family:'Courier New',monospace;">${escapeHtml(expected)}</pre>
        </div>
      `;
    }).join('');

    const sampleOutputsSection = sampleOutputs ? `
      <div style="margin-top:20px;">
        <h5 style="margin:0 0 12px 0;font-size:14px;font-weight:600;color:#1f2937;">Sample Outputs</h5>
        ${sampleOutputs}
      </div>
    ` : '';

    const starterCode = meta.starterCode || meta.starter_code || '';

    return `
      <div class="coding-preview-card" style="background:#ffffff;border-radius:16px;padding:28px;max-width:1200px;width:94%;max-height:92vh;overflow-y:auto;position:relative;box-shadow:0 24px 60px rgba(15,23,42,0.35);">
        <button class="coding-preview-close" style="position:absolute;top:18px;right:18px;background:#0f172a;color:#fff;border:none;border-radius:999px;width:32px;height:32px;cursor:pointer;font-weight:700;font-size:16px;">✕</button>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;">
          <div>
            <div style="font-size:24px;font-weight:700;color:#0f172a;">${escapeHtml(activity.title || 'Coding Challenge')}</div>
            <div style="font-size:13px;color:#6b7280;margin-top:6px;">Coding Challenge · ${ctx?.testCases.length || 0} test case${(ctx?.testCases.length || 0) === 1 ? '' : 's'}</div>
          </div>
          <div style="display:flex;align-items:flex-end;gap:16px;">
            <div style="text-align:right;">
              <div style="font-size:12px;color:#6b7280;">Total Points</div>
              <div id="codingScoreValue" style="font-size:20px;font-weight:700;color:#0f172a;">0 / ${totalPoints}</div>
            </div>
          </div>
        </div>
        ${requiredConstruct ? `<div style="margin-top:16px;padding:12px;border-radius:10px;background:#fef3c7;color:#92400e;font-size:13px;display:flex;gap:8px;align-items:center;"><i class=\"fas fa-lightbulb\"></i><span>Required construct: <strong>${escapeHtml(requiredConstruct)}</strong></span></div>` : ''}
        <div style="margin-top:24px;display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start;">
          <div style="flex:0 0 320px;min-width:260px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:18px;">
            <h5 style="margin:0 0 12px 0;font-size:15px;font-weight:700;color:#1f2937;">Problem Description</h5>
            <div style="font-size:13px;color:#374151;font-weight:600;line-height:1.7;white-space:pre-wrap;">${escapeHtml(problemStatement)}</div>
            ${instructions ? `<div style="margin-top:16px;font-size:13px;color:#4b5563;line-height:1.6;white-space:pre-wrap;">${escapeHtml(instructions)}</div>` : ''}
            ${sampleOutputsSection}
            <div style="margin-top:20px;padding:12px;border-radius:10px;background:#eef2ff;color:#312e81;font-size:12px;font-weight:600;">Language: ${escapeHtml(languageLabel)}</div>
          </div>
          <div style="flex:1 1 420px;min-width:360px;background:#0f172a;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:16px;">
            <div>
              <div style="font-size:13px;font-weight:600;color:#e5e7eb;margin-bottom:8px;">Your Code</div>
              <textarea id="activityCode" style="width:100%;min-height:260px;padding:16px;border:none;border-radius:10px;font-family:'Courier New',monospace;font-size:14px;background:#111827;color:#f8fafc;resize:vertical;">${escapeHtml(this.answers['code'] || starterCode)}</textarea>
            </div>
            <div>
              <label for="codingCustomInput" style="display:block;margin-bottom:6px;font-size:12px;font-weight:600;color:#93c5fd;">Custom Input (used when running code)</label>
              <textarea id="codingCustomInput" style="width:100%;min-height:60px;padding:10px;border:none;border-radius:8px;font-family:'Courier New',monospace;font-size:13px;background:#1f2937;color:#f8fafc;resize:vertical;" placeholder="Optional input..."></textarea>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:10px;">
              <button id="codingRunBtn" onclick="window.activityTester.runCodingQuick()" style="background:#10b981;color:#fff;border:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;"><i class="fas fa-play"></i> Run Code</button>
              <button id="codingCheckBtn" onclick="window.activityTester.checkCodingTest()" style="background:#22c55e;color:#fff;border:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;"><i class="fas fa-check-circle"></i> Check Test</button>
              <button id="codingTestAllBtn" onclick="window.activityTester.testCodingAll()" style="background:#facc15;color:#1f2937;border:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;"><i class="fas fa-vial"></i> Test (All Cases)</button>
              <button id="codingResetBtn" onclick="window.activityTester.resetCodingPreview()" style="background:#6b7280;color:#fff;border:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;"><i class="fas fa-undo"></i> Reset</button>
              <button onclick="window.activityTester.saveCodingDraft()" style="background:#2563eb;color:#fff;border:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;"><i class="fas fa-save"></i> Save Draft</button>
            </div>
            <div id="codingStatusMessage" style="font-size:13px;font-weight:600;color:#60a5fa;">Ready to run tests.</div>
            <div id="codingTerminalOutput" style="display:none;padding:14px;border-radius:10px;background:#111827;color:#f8fafc;font-family:'Courier New',monospace;white-space:pre-wrap;max-height:220px;overflow:auto;"></div>
          </div>
          <div style="flex:0 0 280px;min-width:260px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;display:flex;flex-direction:column;gap:16px;">
            <div style="padding:12px;border-radius:10px;background:#f8fafc;border:1px solid #e2e8f0;">
              <div style="font-size:12px;color:#6b7280;">Score</div>
              <div style="font-size:18px;font-weight:700;color:#0f172a;" id="codingScoreSummary">0 / ${totalPoints}</div>
            </div>
            <div>
              <h5 style="margin:0 0 10px 0;font-size:14px;font-weight:600;color:#1f2937;">Test Cases</h5>
              <div id="codingTestCasesList" style="display:flex;flex-direction:column;gap:12px;max-height:55vh;overflow:auto;">
                ${testCaseBlocks}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  buildCodingTestCaseBlocks(ctx) {
    const testCases = ctx?.testCases || [];
    if (!testCases.length) {
      return '<div style="padding:12px;border:1px dashed #e5e7eb;border-radius:8px;color:#6b7280;font-size:13px;">No test cases configured for this activity.</div>';
    }

    return testCases.map((tc, idx) => {
      const inputText = tc.input_text || tc.inputText || tc.input || '';
      const expectedOutput = tc.expected_output || tc.expectedOutput || tc.expected_output_text || '';
      const points = parseInt(tc.points || 0, 10) || 0;
      const sampleBadge = tc.is_sample ? '<span style="margin-left:8px;background:#d1fae5;color:#047857;border-radius:999px;padding:2px 8px;font-size:11px;font-weight:600;">Sample</span>' : '';
      return `
        <div class="coding-testcase" data-testcase-index="${idx}" style="border:1px solid #e5e7eb;border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <label style="display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;color:#1f2937;cursor:pointer;">
              <input type="radio" name="coding-testcase" value="${idx}" ${idx === 0 ? 'checked' : ''}>
              Test Case ${idx + 1} ${sampleBadge}
              ${points ? `<span style="font-size:11px;color:#64748b;font-weight:500;">(${points} pts)</span>` : ''}
            </label>
            <span id="codingStatus-${idx}" style="font-size:12px;color:#6b7280;font-weight:600;">Not run</span>
          </div>
          <div style="display:grid;gap:10px;font-size:12px;color:#111827;">
            <div>
              <div style="font-weight:600;color:#6b7280;">Input</div>
              <pre style="margin:4px 0 0 0;padding:8px;background:#f9fafb;border-radius:6px;border:1px solid #e5e7eb;white-space:pre-wrap;font-family:'Courier New',monospace;">${escapeHtml(inputText)}</pre>
            </div>
            <div>
              <div style="font-weight:600;color:#6b7280;">Expected Output</div>
              <pre style="margin:4px 0 0 0;padding:8px;background:#f3f4f6;border-radius:6px;border:1px solid #e5e7eb;white-space:pre-wrap;font-family:'Courier New',monospace;">${escapeHtml(expectedOutput)}</pre>
            </div>
            <div>
              <div style="font-weight:600;color:#6b7280;">Your Output</div>
              <pre id="codingOutput-${idx}" style="margin:4px 0 0 0;padding:8px;background:#0f172a;color:#e5e7eb;border-radius:6px;border:1px solid #1f2937;white-space:pre-wrap;font-family:'Courier New',monospace;">(not run)</pre>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render generic activity
  renderGenericActivity(activity) {
    return `
      <div class="generic-interface" style="border:1px solid #e5e7eb;border-radius:12px;padding:32px;background:#f8fafc;max-width:500px;margin:0 auto;">
        <div style="text-align:center;color:#6b7280;">
          <i class="fas fa-question-circle" style="font-size:48px;margin-bottom:16px;"></i>
          <h4 style="margin:0 0 12px 0;color:#374151;">Activity Preview</h4>
          <p style="margin:0;font-size:14px;">This activity type is not yet supported in preview mode.</p>
          <p style="margin:8px 0 0 0;font-size:12px;">Type: ${activity?.type || 'Unknown'}</p>
        </div>
      </div>
    `;
  }

  // Handle activity upload
  handleActivityUpload(file) {
    if (!file) return;
    
    this.answers['upload'] = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      file: file
    };
    
    // Update UI
    const fileNameEl = document.getElementById('fileName');
    if (fileNameEl) fileNameEl.textContent = `File: ${file.name}`;
    const fileSizeEl = document.getElementById('fileSize');
    if (fileSizeEl) fileSizeEl.textContent = `Size: ${this.formatFileSize(file.size)}`;
    
    }

  // Backwards compatibility wrappers
  runActivityCode() {
    return this.runCodingQuick();
  }

  saveActivityCode() {
    return this.saveCodingDraft();
  }

  // === Coding preview helpers ===
  runCodingQuick() {
    const ctx = this.ensureCodingContext();
    if (!ctx) return;

    const code = this.getCodingCode();
    if (!code) {
      this.setCodingStatus('Please write some code before running a test.', 'error');
      return;
    }

    const selectedIndex = this.getSelectedCodingTestIndex();
    const manualInputEl = document.getElementById('codingCustomInput');
    const stdin = manualInputEl ? manualInputEl.value : '';

    this.setCodingStatus(`Running test case ${selectedIndex + 1}...`, 'info');
    this.setCodingButtonsDisabled('run', true);

    this.executeCodingRequest({ code, stdin, quick: true })
      .then(res => {
        this.applyCodingQuickResult(res, selectedIndex, code, stdin);
        this.setCodingStatus(`Finished running test case ${selectedIndex + 1}.`, 'success');
      })
      .catch(err => {
        console.error('❌ Run code error:', err);
        this.setCodingStatus(`Run failed: ${err && err.message ? err.message : err}`, 'error');
      })
      .finally(() => {
        this.setCodingButtonsDisabled('run', false);
      });
  }

  checkCodingTest() {
    const ctx = this.ensureCodingContext();
    if (!ctx) return;
    const code = this.getCodingCode();
    if (!code) {
      this.setCodingStatus('Please write some code before checking a test case.', 'error');
      return;
    }

    const index = this.getSelectedCodingTestIndex();
    const testCase = ctx.testCases[index];
    if (!testCase) {
      this.setCodingStatus('No test case selected.', 'error');
      return;
    }

    const stdin = testCase.input_text || testCase.inputText || testCase.input || '';
    this.setCodingStatus(`Checking test case ${index + 1}...`, 'info');
    this.setCodingButtonsDisabled('check', true);

    this.executeCodingRequest({ code, stdin, quick: true })
      .then(res => {
        this.applyCodingCheckResult(res, index, code, stdin);
      })
      .catch(err => {
        console.error('❌ Check test error:', err);
        this.setCodingStatus(`Check Test failed: ${err && err.message ? err.message : err}`, 'error');
      })
      .finally(() => {
        this.setCodingButtonsDisabled('check', false);
      });
  }

  testCodingAll() {
    const ctx = this.ensureCodingContext();
    if (!ctx) return;
    const code = this.getCodingCode();
    if (!code) {
      this.setCodingStatus('Please write some code before running all test cases.', 'error');
      return;
    }

    if (!ctx.testCases.length) {
      this.setCodingStatus('No test cases available for this activity.', 'error');
      return;
    }

    this.setCodingStatus('Running all test cases...', 'info');
    this.setCodingButtonsDisabled('all', true);

    this.executeCodingRequest({ code })
      .then(res => {
        this.applyCodingAllResult(res, code);
      })
      .catch(err => {
        console.error('❌ Test all error:', err);
        this.setCodingStatus(`Test (All Cases) failed: ${err && err.message ? err.message : err}`, 'error');
      })
      .finally(() => {
        this.setCodingButtonsDisabled('all', false);
      });
  }

  resetCodingPreview() {
    const ctx = this.ensureCodingContext();
    if (!ctx) return;

    ctx.results = ctx.testCases.map(() => ({ status: 'not_run', earned: 0, output: '' }));
    ctx.score = 0;

    ctx.testCases.forEach((_, idx) => {
      const outEl = document.getElementById(`codingOutput-${idx}`);
      if (outEl) outEl.textContent = '(not run)';
      const statusEl = document.getElementById(`codingStatus-${idx}`);
      if (statusEl) {
        statusEl.textContent = 'Not run';
        statusEl.style.color = '#6b7280';
      }
    });

    const customInputEl = document.getElementById('codingCustomInput');
    if (customInputEl) {
      const selectedIndex = this.getSelectedCodingTestIndex();
      const selectedCase = ctx.testCases[selectedIndex];
      const defaultInput = selectedCase ? (selectedCase.input_text || selectedCase.inputText || selectedCase.input || '') : '';
      customInputEl.value = defaultInput;
    }

    const terminalEl = document.getElementById('codingTerminalOutput');
    if (terminalEl) {
      terminalEl.style.display = 'none';
      terminalEl.textContent = '';
    }

    this.updateCodingScoreDisplay();
    this.setCodingStatus('Ready to run tests.', 'info');
  }

  saveCodingDraft() {
    const code = this.getCodingCode();
    this.answers['code'] = code;
    this.showNotification('success', 'Code saved locally for this preview.');
  }

  initializeCodingPreview(activity) {
    const ctx = this.buildCodingContext(activity || this.currentActivity);
    if (!ctx) return;

    const codeTextarea = document.getElementById('activityCode');
    if (codeTextarea && (!codeTextarea.value || !codeTextarea.value.trim())) {
      codeTextarea.value = ctx.meta.starterCode || ctx.meta.starter_code || '';
    }

    const customInputEl = document.getElementById('codingCustomInput');
    if (customInputEl) {
      const firstCase = ctx.testCases[0];
      customInputEl.value = firstCase ? (firstCase.input_text || firstCase.inputText || firstCase.input || '') : '';
    }

    // Bind radio change events
    const radios = document.querySelectorAll('input[name="coding-testcase"]');
    radios.forEach(radio => {
      radio.addEventListener('change', () => this.handleCodingTestcaseChange());
    });

    this.resetCodingPreview();
    this.handleCodingTestcaseChange();
  }

  buildCodingContext(activity) {
    if (!activity) return null;
    const testCases = Array.isArray(activity.test_cases) ? activity.test_cases : (Array.isArray(activity.testCases) ? activity.testCases : []);
    const meta = this.extractCodingMeta(activity);

    let points = testCases.map(tc => parseInt(tc.points || 0, 10) || 0);
    let total = points.reduce((sum, v) => sum + v, 0);
    if (total === 0) {
      const maxScore = parseInt(activity.max_score || activity.maxScore || 0, 10) || (testCases.length * 10);
      const perCase = testCases.length ? Math.max(1, Math.floor(maxScore / Math.max(testCases.length, 1))) : 0;
      points = testCases.map(() => perCase);
      total = points.reduce((sum, v) => sum + v, 0);
    }

    this.codingContext = {
      activity,
      activityId: activity.id || activity.activity_id,
      meta,
      testCases,
      points,
      totalPoints: total,
      results: testCases.map(() => ({ status: 'not_run', earned: 0, output: '' })),
      score: 0
    };

    return this.codingContext;
  }

  ensureCodingContext(activity) {
    if (!this.currentActivity && activity) {
      this.currentActivity = activity;
    }
    if (!this.codingContext || (activity && (activity.id || activity.activity_id) !== this.codingContext.activityId)) {
      return this.buildCodingContext(activity || this.currentActivity);
    }
    return this.codingContext;
  }

  extractCodingMeta(activity) {
    if (!activity) return {};
    if (activity.__codingMeta) return activity.__codingMeta;
    let meta = {};

    if (activity.meta && typeof activity.meta === 'object') {
      meta = { ...meta, ...activity.meta };
    }
    if (activity.settings && typeof activity.settings === 'object') {
      meta = { ...meta, ...activity.settings };
    }
    if (activity.instructions && typeof activity.instructions === 'string') {
      try {
        const parsed = JSON.parse(activity.instructions);
        if (parsed && typeof parsed === 'object') {
          meta = { ...meta, ...parsed };
        }
      } catch (_){
        // ignore plain string instructions
      }
    }

    activity.__codingMeta = meta;
    return meta;
  }

  computeCodingTotalPoints(activity, testCases) {
    const ctx = this.ensureCodingContext(activity);
    return ctx ? ctx.totalPoints : 0;
  }

  getCodingCode() {
    const textarea = document.getElementById('activityCode');
    const value = textarea ? textarea.value : '';
    this.answers['code'] = value;
    return value;
  }

  getSelectedCodingTestIndex() {
    const radios = document.querySelectorAll('input[name="coding-testcase"]');
    for (const radio of radios) {
      if (radio.checked) {
        const idx = parseInt(radio.value, 10);
        return Number.isFinite(idx) ? idx : 0;
      }
    }
    return 0;
  }

  setCodingButtonsDisabled(scope, disabled) {
    const map = {
      run: document.getElementById('codingRunBtn'),
      check: document.getElementById('codingCheckBtn'),
      all: document.getElementById('codingTestAllBtn')
    };
    if (scope === 'run') {
      if (map.run) map.run.disabled = disabled;
    } else if (scope === 'check') {
      if (map.check) map.check.disabled = disabled;
    } else if (scope === 'all') {
      Object.values(map).forEach(btn => { if (btn) btn.disabled = disabled; });
    } else {
      Object.values(map).forEach(btn => { if (btn) btn.disabled = disabled; });
    }
  }

  setCodingStatus(message, type = 'info') {
    const statusEl = document.getElementById('codingStatusMessage');
    if (!statusEl) return;
    statusEl.textContent = message;
    let color = '#2563eb';
    if (type === 'success') color = '#16a34a';
    else if (type === 'error') color = '#dc2626';
    statusEl.style.color = color;
  }

  updateCodingScoreDisplay() {
    const ctx = this.codingContext;
    const scoreEls = [document.getElementById('codingScoreValue'), document.getElementById('codingScoreSummary')];
    if (ctx) {
      scoreEls.forEach(el => {
        if (el) el.textContent = `${ctx.score} / ${ctx.totalPoints}`;
      });
    }
  }

  executeCodingRequest({ code, stdin, quick }) {
    const ctx = this.ensureCodingContext();
    if (!ctx) return Promise.reject(new Error('Context not ready'));

    const fd = new FormData();
    fd.append('action', 'run_activity');
    fd.append('activity_id', String(ctx.activity.id || ctx.activity.activity_id || ''));
    fd.append('source', code);
    if (quick) fd.append('quick', '1');
    if (typeof stdin === 'string') {
      fd.append('stdin', stdin);
    }

    return fetch('course_outline_manage.php', {
      method: 'POST',
      body: fd,
      credentials: 'same-origin'
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        return r.json();
      })
      .then(res => {
        if (!res || !res.success) {
          throw new Error(res && res.message ? res.message : 'Execution failed');
        }
        return res;
      });
  }

  applyCodingQuickResult(res, index, code, stdin) {
    const ctx = this.ensureCodingContext();
    if (!ctx) return;
    const results = Array.isArray(res.results) ? res.results : [];
    const result = results[0] || {};
    const output = this.extractCodingOutput(result);

    this.updateCodingCaseOutput(index, output);

    const terminalEl = document.getElementById('codingTerminalOutput');
    if (terminalEl) {
      terminalEl.style.display = 'block';
      let terminalText = '';
      if (stdin) {
        terminalText += `> Input\n${stdin}\n\n`;
      }
      terminalText += output || '(no output)';
      terminalEl.textContent = terminalText;
    }
  }

  applyCodingCheckResult(res, index, code, stdin) {
    const ctx = this.ensureCodingContext();
    if (!ctx) return;
    const result = (Array.isArray(res.results) ? res.results : [])[0] || {};
    const output = this.extractCodingOutput(result);

    const evaluation = this.evaluateCodingCase(index, output, code);
    ctx.results[index] = {
      status: evaluation.passed ? 'passed' : (evaluation.hasError ? 'error' : 'failed'),
      earned: evaluation.earned,
      output
    };

    ctx.score = ctx.results.reduce((sum, c) => sum + (c.earned || 0), 0);

    this.updateCodingCaseOutput(index, output, evaluation);
    this.updateCodingScoreDisplay();

    if (evaluation.passed) {
      this.setCodingStatus(`Great! Test case ${index + 1} passed.`, 'success');
    } else if (evaluation.hasError) {
      this.setCodingStatus(`Runtime error on test case ${index + 1}.`, 'error');
    } else {
      this.setCodingStatus(`Output did not match for test case ${index + 1}.`, 'error');
    }
  }

  applyCodingAllResult(res, code) {
    const ctx = this.ensureCodingContext();
    if (!ctx) return;
    const results = Array.isArray(res.results) ? res.results : [];
    const constructCheck = this.evaluateConstructUsage(code);

    ctx.results = ctx.testCases.map((tc, idx) => {
      const result = results[idx] || {};
      const output = this.extractCodingOutput(result);
      const evaluation = this.evaluateCodingCase(idx, output, code, constructCheck);
      this.updateCodingCaseOutput(idx, output, evaluation);
      return {
        status: evaluation.passed ? 'passed' : (evaluation.hasError ? 'error' : 'failed'),
        earned: evaluation.earned,
        output
      };
    });

    ctx.score = ctx.results.reduce((sum, c) => sum + (c.earned || 0), 0);
    this.updateCodingScoreDisplay();

    const passedCount = ctx.results.filter(r => r.status === 'passed').length;
    if (passedCount === ctx.results.length && ctx.results.length > 0) {
      this.setCodingStatus(`Perfect! All ${ctx.results.length} test cases passed.`, 'success');
    } else {
      this.setCodingStatus(`Completed testing. Passed ${passedCount} of ${ctx.results.length} test cases.`, passedCount > 0 ? 'info' : 'error');
    }
  }

  updateCodingCaseOutput(index, output, evaluation = null) {
    const outEl = document.getElementById(`codingOutput-${index}`);
    if (outEl) {
      outEl.textContent = output || '(no output)';
    }
    const statusEl = document.getElementById(`codingStatus-${index}`);
    if (!statusEl) return;

    if (!evaluation) {
      statusEl.textContent = 'Output ready';
      statusEl.style.color = '#2563eb';
      return;
    }

    if (evaluation.passed) {
      statusEl.textContent = `Passed (+${evaluation.earned} pts)`;
      statusEl.style.color = '#16a34a';
    } else if (evaluation.hasError) {
      statusEl.textContent = 'Runtime error';
      statusEl.style.color = '#dc2626';
    } else {
      statusEl.textContent = 'Wrong answer';
      statusEl.style.color = '#dc2626';
    }
  }

  extractCodingOutput(result) {
    if (!result) return '';
    const err = result.error || result.stderr || (result.data && result.data.error);
    if (err) {
      return `Error: ${err}`;
    }
    return (result.output || result.stdout || result.outputText || (result.data && result.data.output) || '').toString();
  }

  evaluateConstructUsage(code) {
    const ctx = this.ensureCodingContext();
    if (!ctx) return { ok: true };
    const required = ctx.meta.requiredConstruct || ctx.meta.required_construct;
    if (!required) return { ok: true };
    return detectConstructUsage(code, ctx.meta.language || 'cpp', required);
  }

  evaluateCodingCase(index, output, code, constructCheckOverride) {
    const ctx = this.ensureCodingContext();
    if (!ctx) return { passed: false, earned: 0, hasError: true };
    const testCase = ctx.testCases[index];
    const points = ctx.points[index] || 0;
    const norm = s => String(s == null ? '' : s).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    const expected = norm(testCase && (testCase.expected_output || testCase.expectedOutput || testCase.expected_output_text || ''));
    const actual = norm(output || '');
    const hasError = typeof output === 'string' && output.startsWith('Error:');
    const passed = !hasError && (expected === '' ? actual !== '' : actual === expected);

    let earned = passed ? points : 0;
    const constructCheck = constructCheckOverride || this.evaluateConstructUsage(code);
    const requiredConstruct = ctx.meta.requiredConstruct || ctx.meta.required_construct;
    if (requiredConstruct && passed && constructCheck && constructCheck.ok === false && earned > 0) {
      earned = Math.max(1, Math.round(points * 0.5));
    }

    return { passed, earned, hasError, expected, actual };
  }

  handleCodingTestcaseChange() {
    const ctx = this.ensureCodingContext();
    if (!ctx) return;
    const selectedIndex = this.getSelectedCodingTestIndex();
    const testCase = ctx.testCases[selectedIndex];
    const inputValue = testCase ? (testCase.input_text || testCase.inputText || testCase.input || '') : '';
    const customInputEl = document.getElementById('codingCustomInput');
    if (customInputEl) {
      customInputEl.value = inputValue;
    }
  }

  // Update navigation for activities without questions
  updateNavigationForNoQuestions() {
    const prevBtn = document.getElementById('prevQuestion');
    const nextBtn = document.getElementById('nextQuestion');
    const submitBtn = document.getElementById('submitActivity');
    
    // Hide navigation buttons for single-activity interfaces
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (submitBtn) submitBtn.style.display = 'block';
    
    // Update question counter
    const currentQuestionElInit = document.getElementById('currentQuestion');
    if (currentQuestionElInit) currentQuestionElInit.textContent = '1';
    const totalQuestionsElInit = document.getElementById('totalQuestions');
    if (totalQuestionsElInit) totalQuestionsElInit.textContent = '1';
  }

  // Render multiple choice question
  renderMultipleChoice(question) {
    let html = '<div class="options" style="display:flex;flex-direction:column;gap:12px;">';
    question.options.forEach((option, index) => {
      const isChecked = this.answers[question.id] === index ? 'checked' : '';
      html += `
        <label style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;transition:all 0.2s;" 
               onmouseover="this.style.backgroundColor='#f8fafc'" 
               onmouseout="this.style.backgroundColor='transparent'">
          <input type="radio" name="question_${question.id}" value="${index}" ${isChecked} 
                 onchange="window.activityTester.saveAnswer(${question.id}, ${index})" 
                 style="transform:scale(1.2);">
          <span style="color:#374151;font-size:15px;">${option}</span>
        </label>
      `;
    });
    html += '</div>';
    return html;
  }

  // Render true/false question
  // CRITICAL: Use choice IDs like Multiple Choice, not boolean values
  renderTrueFalse(question) {
    const choices = question.choices || question.options || [];
    
    // Find True and False choices
    let trueChoice = null;
    let falseChoice = null;
    
    choices.forEach((choice) => {
      const choiceText = String(choice.choice_text || choice.text || choice || '').toLowerCase().trim();
      if (choiceText === 'true' || choiceText === '1') {
        trueChoice = choice;
      } else if (choiceText === 'false' || choiceText === '0') {
        falseChoice = choice;
      }
    });
    
    // Fallback: if choices not found, use first two choices (assume first is True, second is False)
    if (!trueChoice && choices.length > 0) {
      trueChoice = choices[0];
    }
    if (!falseChoice && choices.length > 1) {
      falseChoice = choices[1];
    }
    
    // If still no choices, create placeholder IDs (shouldn't happen, but safety fallback)
    const trueChoiceId = trueChoice ? (trueChoice.id || trueChoice) : 'true';
    const falseChoiceId = falseChoice ? (falseChoice.id || falseChoice) : 'false';
    
    // CRITICAL: Ensure choice IDs are numbers (not strings) for proper submission
    const trueId = typeof trueChoiceId === 'number' ? trueChoiceId : (typeof trueChoiceId === 'string' && /^\d+$/.test(trueChoiceId) ? parseInt(trueChoiceId, 10) : trueChoiceId);
    const falseId = typeof falseChoiceId === 'number' ? falseChoiceId : (typeof falseChoiceId === 'string' && /^\d+$/.test(falseChoiceId) ? parseInt(falseChoiceId, 10) : falseChoiceId);
    
    // Get current answer (might be choice ID or boolean)
    const currentAnswer = this.answers[question.id];
    const trueChecked = (currentAnswer === trueId || currentAnswer === true || currentAnswer === 'true' || String(currentAnswer) === String(trueId)) ? 'checked' : '';
    const falseChecked = (currentAnswer === falseId || currentAnswer === false || currentAnswer === 'false' || String(currentAnswer) === String(falseId)) ? 'checked' : '';
    
    return `
      <div class="options" style="display:flex;gap:20px;">
        <label style="display:flex;align-items:center;gap:8px;padding:12px 20px;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;transition:all 0.2s;" 
               onmouseover="this.style.backgroundColor='#f8fafc'" 
               onmouseout="this.style.backgroundColor='transparent'">
          <input type="radio" name="question_${question.id}" value="${trueId}" ${trueChecked} 
                 onchange="window.activityTester.saveAnswer(${question.id}, ${trueId})" 
                 style="transform:scale(1.2);">
          <span style="color:#374151;font-size:15px;font-weight:600;">True</span>
        </label>
        <label style="display:flex;align-items:center;gap:8px;padding:12px 20px;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;transition:all 0.2s;" 
               onmouseover="this.style.backgroundColor='#f8fafc'" 
               onmouseout="this.style.backgroundColor='transparent'">
          <input type="radio" name="question_${question.id}" value="${falseId}" ${falseChecked} 
                 onchange="window.activityTester.saveAnswer(${question.id}, ${falseId})" 
                 style="transform:scale(1.2);">
          <span style="color:#374151;font-size:15px;font-weight:600;">False</span>
        </label>
      </div>
    `;
  }

  // Render identification question
  renderIdentification(question) {
    const value = this.answers[question.id] || '';
    return `
      <div class="answer-input">
        <input type="text" id="answer_${question.id}" value="${value}" 
               placeholder="Type your answer here..." 
               onchange="window.activityTester.saveAnswer(${question.id}, this.value)"
               style="width:100%;padding:12px 16px;border:1px solid #d1d5db;border-radius:8px;font-size:15px;outline:none;focus:border-1d9b3e;">
      </div>
    `;
  }

  // Render essay question
  renderEssay(question) {
    const value = this.answers[question.id] || '';
    return `
      <div class="answer-input">
        <textarea id="answer_${question.id}" placeholder="Write your answer here..." 
                  onchange="window.activityTester.saveAnswer(${question.id}, this.value)"
                  style="width:100%;min-height:150px;padding:12px 16px;border:1px solid #d1d5db;border-radius:8px;font-size:15px;outline:none;focus:border-1d9b3e;resize:vertical;">${value}</textarea>
        <div style="margin-top:8px;color:#6b7280;font-size:12px;">
          Character count: <span id="charCount_${question.id}">${value.length}</span>${question.maxLength ? ` / ${question.maxLength}` : ''}
        </div>
      </div>
    `;
  }

  // Render upload-based question
  renderUploadBased(question) {
    return `
      <div class="upload-section" style="border:2px dashed #d1d5db;border-radius:8px;padding:24px;text-align:center;background:#f9fafb;">
        <div style="font-size:48px;color:#6b7280;margin-bottom:16px;">
          <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <h4 style="margin:0 0 8px 0;color:#374151;font-size:16px;">Upload Your Work</h4>
        <p style="margin:0 0 16px 0;color:#6b7280;font-size:14px;">${question.instructions || 'Please upload your completed work file.'}</p>
        
        <div style="margin-bottom:16px;">
          <input type="file" id="upload_${question.id}" 
                 accept="${question.acceptedFormats || '.pdf,.doc,.docx,.jpg,.jpeg,.png'}"
                 style="display:none;"
                 onchange="window.activityTester.handleFileUpload(${question.id}, this.files[0])">
          <button onclick="document.getElementById('upload_${question.id}').click()" 
                  style="background:#1d9b3e;color:#fff;border:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;">
            <i class="fas fa-upload" style="margin-right:8px;"></i>
            Choose File
          </button>
        </div>
        
        <div id="uploadStatus_${question.id}" style="margin-top:12px;font-size:13px;">
          <div id="fileName_${question.id}" style="color:#374151;font-weight:600;"></div>
          <div id="fileSize_${question.id}" style="color:#6b7280;"></div>
        </div>
      </div>
    `;
  }

  // Render laboratory question
  renderLaboratory(question) {
    return `
      <div class="laboratory-section" style="border:1px solid #e5e7eb;border-radius:8px;padding:20px;background:#f8fafc;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <i class="fas fa-flask" style="color:#1d9b3e;font-size:20px;"></i>
          <h4 style="margin:0;color:#374151;font-size:16px;">Laboratory Exercise</h4>
        </div>
        
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin-bottom:16px;">
          <h5 style="margin:0 0 8px 0;color:#374151;font-size:14px;">Instructions:</h5>
          <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.5;">${question.instructions || 'Complete the laboratory exercise as described.'}</p>
        </div>
        
        <div class="lab-actions" style="display:flex;gap:12px;">
          <button onclick="window.activityTester.openLabEnvironment(${question.id})" 
                  style="background:#3b82f6;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;">
            <i class="fas fa-external-link-alt" style="margin-right:6px;"></i>
            Open Lab Environment
          </button>
          <button onclick="document.getElementById('labUpload_${question.id}').click()" 
                  style="background:#1d9b3e;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;">
            <i class="fas fa-upload" style="margin-right:6px;"></i>
            Upload Results
          </button>
        </div>
        
        <input type="file" id="labUpload_${question.id}" style="display:none;" 
               onchange="window.activityTester.handleFileUpload(${question.id}, this.files[0])">
      </div>
    `;
  }

  // Render coding question
  renderCoding(question) {
    return `
      <div class="coding-section" style="border:1px solid #e5e7eb;border-radius:8px;padding:20px;background:#f8fafc;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <i class="fas fa-code" style="color:#1d9b3e;font-size:20px;"></i>
          <h4 style="margin:0;color:#374151;font-size:16px;">Coding Exercise</h4>
        </div>
        
        <div style="background:#1f2937;border-radius:6px;padding:16px;margin-bottom:16px;">
          <h5 style="margin:0 0 8px 0;color:#f9fafb;font-size:14px;">Problem Statement:</h5>
          <p style="margin:0;color:#d1d5db;font-size:14px;line-height:1.5;">${question.problem || 'Complete the coding challenge.'}</p>
        </div>
        
        <div class="code-editor" style="margin-bottom:16px;">
          <textarea id="code_${question.id}" 
                    placeholder="Write your code here..." 
                    style="width:100%;min-height:200px;padding:12px;border:1px solid #d1d5db;border-radius:6px;font-family:'Courier New',monospace;font-size:14px;background:#fff;resize:vertical;">${this.answers[question.id] || ''}</textarea>
        </div>
        
        <div class="coding-actions" style="display:flex;gap:12px;">
          <button onclick="window.activityTester.runCode(${question.id})" 
                  style="background:#f59e0b;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;">
            <i class="fas fa-play" style="margin-right:6px;"></i>
            Run Code
          </button>
          <button onclick="window.activityTester.saveCode(${question.id})" 
                  style="background:#1d9b3e;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;">
            <i class="fas fa-save" style="margin-right:6px;"></i>
            Save Code
          </button>
        </div>
      </div>
    `;
  }

  // Render generic question (fallback)
  renderGeneric(question) {
    return `
      <div class="generic-section" style="border:1px solid #e5e7eb;border-radius:8px;padding:20px;background:#f8fafc;">
        <div style="text-align:center;color:#6b7280;">
          <i class="fas fa-question-circle" style="font-size:32px;margin-bottom:12px;"></i>
          <p style="margin:0;font-size:14px;">This question type is not yet supported in the preview mode.</p>
          <p style="margin:8px 0 0 0;font-size:12px;">Type: ${question.type}</p>
        </div>
      </div>
    `;
  }

  // Handle file upload
  handleFileUpload(questionId, file) {
    if (!file) return;
    
    this.answers[questionId] = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      file: file
    };
    
    // Update UI
    document.getElementById(`fileName_${questionId}`).textContent = `File: ${file.name}`;
    document.getElementById(`fileSize_${questionId}`).textContent = `Size: ${this.formatFileSize(file.size)}`;
    
    }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Open lab environment
  openLabEnvironment(questionId) {
    // This would open the lab environment (e.g., Jupyter, CodePen, etc.)
    this.showNotification('info', 'Lab environment would open here');
  }

  // Run code
  runCode(questionId) {
    const code = document.getElementById(`code_${questionId}`).value;
    this.showNotification('info', 'Code execution would happen here');
  }

  // Save code
  saveCode(questionId) {
    const code = document.getElementById(`code_${questionId}`).value;
    this.answers[questionId] = code;
    this.showNotification('success', 'Code saved successfully!');
  }

  // Get question type label
  getQuestionTypeLabel(type) {
    const labels = {
      'multiple_choice': 'Multiple Choice',
      'true_false': 'True or False',
      'identification': 'Identification',
      'essay': 'Essay',
      'upload_based': 'Upload Based',
      'laboratory': 'Laboratory',
      'coding': 'Coding Exercise'
    };
    return labels[type] || type;
  }

  // Setup event listeners for choice clicks
  setupChoiceEventListeners() {
    // Remove any existing listeners
    const existingListeners = document.querySelectorAll('.choice-container');
    existingListeners.forEach(container => {
      container.removeEventListener('click', this.handleChoiceClick);
    });
    
    // Add new event listeners using event delegation
    document.addEventListener('click', (event) => {
      const choiceContainer = event.target.closest('.choice-container');
      if (choiceContainer) {
        event.preventDefault();
        event.stopPropagation();
        
        const questionIndex = choiceContainer.dataset.question;
        const choiceId = choiceContainer.dataset.choice;
        
        this.handleChoiceClick(choiceContainer, questionIndex, choiceId);
      }
    });
    
    console.log('🔍 DEBUG: Choice event listeners setup complete');
  }

  // Handle choice click (more reliable)
  handleChoiceClick(container, questionIndex, choiceId) {
    console.log('🔍 DEBUG: Choice clicked:', questionIndex, choiceId);
    
    const radioInput = container.querySelector('input[type="radio"]');
    const isCurrentlySelected = radioInput.checked;
    
    if (isCurrentlySelected) {
      // If already selected, deselect it
      radioInput.checked = false;
      container.style.background = '#f8f9fa';
      container.style.borderColor = '#e9ecef';
      
      // Remove answer from answers object
      delete this.answers[questionIndex];
      this.updateProgress();
      this.saveProgressToDatabase();
      
      console.log('🔍 DEBUG: Choice deselected for question', questionIndex);
    } else {
      // If not selected, select it and deselect others
      radioInput.checked = true;
      container.style.background = '#e3f2fd';
      container.style.borderColor = '#2196f3';
      
      // Deselect other choices in the same question
      const allChoices = document.querySelectorAll(`input[name="question_${questionIndex}"]`);
      allChoices.forEach(choice => {
        if (choice.value !== choiceId) {
          choice.checked = false;
          const otherContainer = choice.closest('.choice-container');
          if (otherContainer) {
            otherContainer.style.background = '#f8f9fa';
            otherContainer.style.borderColor = '#e9ecef';
          }
        }
      });
      
      // Save the new answer
      this.saveAnswer(questionIndex, choiceId);
      
      console.log('🔍 DEBUG: Choice selected for question', questionIndex, ':', choiceId);
    }
  }

  // Clear answer for a specific question
  clearAnswer(questionIndex) {
    // Uncheck all radio buttons for this question
    const allChoices = document.querySelectorAll(`input[name="question_${questionIndex}"]`);
    allChoices.forEach(choice => {
      choice.checked = false;
      const container = choice.closest('div[onclick]');
      if (container) {
        container.style.background = '#f8f9fa';
        container.style.borderColor = '#e9ecef';
      }
    });
    
    // Remove answer from answers object
    delete this.answers[questionIndex];
    this.updateProgress();
    this.saveProgressToDatabase();
    
    console.log('🔍 DEBUG: Answer cleared for question', questionIndex);
  }

  // Handle file upload
  handleFileUpload(questionIndex, input) {
    const file = input.files[0];
    const fileStatus = document.getElementById(`fileStatus_${questionIndex}`);
    
    if (file) {
      if (fileStatus) {
        fileStatus.textContent = `Selected: ${file.name}`;
        fileStatus.style.color = '#1d9b3e';
      }
      this.saveAnswer(questionIndex, file.name);
      console.log('🔍 DEBUG: File uploaded for question', questionIndex, ':', file.name);
    } else {
      if (fileStatus) {
        fileStatus.textContent = 'No file selected';
        fileStatus.style.color = '#6b7280';
      }
      this.saveAnswer(questionIndex, '');
    }
  }

  // Handle file drop
  handleFileDrop(event, questionIndex) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const input = document.getElementById(`fileInput_${questionIndex}`);
      input.files = event.dataTransfer.files;
      this.handleFileUpload(questionIndex, input);
    }
  }

  // Handle drag over
  handleDragOver(event) {
    event.preventDefault();
  }

  // Handle drag enter
  handleDragEnter(event, questionIndex) {
    event.preventDefault();
    const uploadArea = document.getElementById(`uploadArea_${questionIndex}`);
    uploadArea.style.borderColor = '#20c997';
    uploadArea.style.background = 'linear-gradient(135deg, #f0fff4 0%, #d4edda 100%)';
  }

  // Handle drag leave
  handleDragLeave(event, questionIndex) {
    event.preventDefault();
    const uploadArea = document.getElementById(`uploadArea_${questionIndex}`);
    uploadArea.style.borderColor = '#28a745';
    uploadArea.style.background = 'linear-gradient(135deg, #f8fff9 0%, #e8f5e8 100%)';
  }

  // Show file status
  showFileStatus(questionIndex, fileName) {
    const fileStatus = document.getElementById(`fileStatus_${questionIndex}`);
    const fileNameSpan = document.getElementById(`fileName_${questionIndex}`);
    
    if (fileStatus && fileNameSpan) {
      fileNameSpan.textContent = fileName;
      fileStatus.style.display = 'block';
    }
  }

  // Remove file
  removeFile(questionIndex) {
    const input = document.getElementById(`fileInput_${questionIndex}`);
    const fileStatus = document.getElementById(`fileStatus_${questionIndex}`);
    
    if (input) {
      input.value = '';
    }
    
    if (fileStatus) {
      fileStatus.style.display = 'none';
    }
    
    this.saveAnswer(questionIndex, '');
    console.log('🔍 DEBUG: File removed for question', questionIndex);
  }

  // Save answer
  saveAnswer(questionId, answer) {
    // Normalize answer based on type
    let processedAnswer = answer;
    
    if (processedAnswer === null || processedAnswer === undefined) {
      delete this.answers[questionId];
      console.log('🔍 DEBUG: Empty answer removed for question', questionId);
      this.updateProgress();
      this.saveToLocalStorage();
      this.debouncedSaveProgress();
      return;
    }
    
    if (typeof processedAnswer === 'string') {
      processedAnswer = processedAnswer.trim();
      if (processedAnswer === '') {
        delete this.answers[questionId];
        console.log('🔍 DEBUG: Blank string answer removed for question', questionId);
        this.updateProgress();
        this.saveToLocalStorage();
        this.debouncedSaveProgress();
        return;
      }
    }
    
    // CRITICAL: For choice-based questions (MCQ, True/False), answer should be a number (choice ID)
    // Convert string numbers to actual numbers to ensure consistency
    if (typeof processedAnswer === 'string' && /^\d+$/.test(processedAnswer)) {
      // String that looks like a number - convert to number (for choice IDs)
      processedAnswer = parseInt(processedAnswer, 10);
      console.log('🔍 DEBUG: Converted string choice ID to number:', processedAnswer);
    }
    
    // For booleans, ensure the value is strictly true/false
    if (typeof processedAnswer === 'boolean') {
      this.answers[questionId] = processedAnswer;
    } else if (typeof processedAnswer === 'number') {
      // Numbers: store as number (useful for numeric identification answers and choice IDs)
      this.answers[questionId] = processedAnswer;
    } else {
      // Default: store the normalized string
      this.answers[questionId] = processedAnswer;
    }
    
    console.log('🔍 DEBUG: Answer saved for question', questionId, ':', this.answers[questionId], '(type:', typeof this.answers[questionId], ')');
    
    this.updateProgress();
    
    // Instant localStorage backup (no delay)
    this.saveToLocalStorage();
    
    // Debounced auto-save to database (draft storage)
    this.debouncedSaveProgress();
  }

  // Save to localStorage (instant backup)
  saveToLocalStorage() {
    try {
      if (!this.currentActivity || !this.currentActivity.id) {
        return;
      }
      
      const backup = {
        activity_id: this.currentActivity.id,
        attempt_id: this.attemptId,
        answers: this.answers,
        start_time: this.startTime,
        timestamp: Date.now(),
        progress_percentage: this.calculateProgressPercentage()
      };
      
      const key = `activity_progress_${this.currentActivity.id}_${window.__USER_ID__ || 0}`;
      localStorage.setItem(key, JSON.stringify(backup));
      
      console.log('💾 Saved to localStorage:', key);
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
    }
  }
  
  // Load from localStorage (restore on page load)
  loadFromLocalStorage() {
    try {
      if (!this.currentActivity || !this.currentActivity.id) {
        return;
      }
      
      const key = `activity_progress_${this.currentActivity.id}_${window.__USER_ID__ || 0}`;
      const saved = localStorage.getItem(key);
      
      if (saved) {
        const backup = JSON.parse(saved);
        
        // Only restore if less than 24 hours old
        const age = Date.now() - (backup.timestamp || 0);
        if (age < 24 * 60 * 60 * 1000) {
          this.answers = backup.answers || {};
          this.attemptId = backup.attempt_id || null;
          if (backup.start_time) {
            this.startTime = new Date(backup.start_time);
          }
          
          console.log('📂 Restored from localStorage:', key);
          this.restoreFormValues();
          this.updateProgress();
        } else {
          // Too old, remove it
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('❌ Error loading from localStorage:', error);
    }
  }
  
  // Debounced save to database (draft storage)
  debouncedSaveProgress() {
    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    // Set new timeout
    this.saveTimeout = setTimeout(() => {
      this.saveProgressToDatabase();
    }, this.debounceDelay);
  }
  
  // Save progress to database (draft storage - activity_progress table)
  async saveProgressToDatabase() {
    try {
      if (!this.currentActivity || !this.currentActivity.id) {
        console.log('🔍 DEBUG: No activity ID available for saving progress');
        return;
      }
      
      const progressData = {
        activity_id: this.currentActivity.id,
        user_id: window.__USER_ID__ || null,
        answers: this.answers,
        progress_percentage: this.calculateProgressPercentage(),
        last_updated: new Date().toISOString()
      };
      
      console.log('💾 Saving draft progress to database:', progressData);
      
      const response = await fetch('save_activity_progress.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Draft progress saved successfully:', result);
        
        // Clear retry queue on success
        this.clearRetryQueue();
      } else {
        console.error('❌ Failed to save progress:', response.statusText);
        // Add to retry queue
        this.addToRetryQueue(progressData);
      }
      
    } catch (error) {
      console.error('❌ Error saving progress:', error);
      // Add to retry queue
      const progressData = {
        activity_id: this.currentActivity.id,
        user_id: window.__USER_ID__ || null,
        answers: this.answers,
        progress_percentage: this.calculateProgressPercentage()
      };
      this.addToRetryQueue(progressData);
    }
  }
  
  // Add failed save to retry queue
  addToRetryQueue(progressData) {
    try {
      const queue = JSON.parse(localStorage.getItem('retry_queue') || '[]');
      queue.push({
        ...progressData,
        timestamp: Date.now(),
        retries: 0
      });
      localStorage.setItem('retry_queue', JSON.stringify(queue));
      console.log('🔄 Added to retry queue');
    } catch (error) {
      console.error('❌ Error adding to retry queue:', error);
    }
  }
  
  // Clear retry queue
  clearRetryQueue() {
    try {
      localStorage.removeItem('retry_queue');
    } catch (error) {
      // Ignore
    }
  }
  
  // Retry failed saves
  async retryFailedSaves() {
    try {
      const queue = JSON.parse(localStorage.getItem('retry_queue') || '[]');
      if (queue.length === 0) return;
      
      console.log(`🔄 Retrying ${queue.length} failed saves...`);
      
      const remaining = [];
      for (const item of queue) {
        if (item.retries >= 3) {
          // Too many retries, skip
          continue;
        }
        
        try {
          const response = await fetch('save_activity_progress.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
          
          if (response.ok) {
            console.log('✅ Retry successful for activity:', item.activity_id);
          } else {
            item.retries = (item.retries || 0) + 1;
            remaining.push(item);
          }
        } catch (error) {
          item.retries = (item.retries || 0) + 1;
          remaining.push(item);
        }
      }
      
      if (remaining.length > 0) {
        localStorage.setItem('retry_queue', JSON.stringify(remaining));
      } else {
        localStorage.removeItem('retry_queue');
      }
    } catch (error) {
      console.error('❌ Error retrying saves:', error);
    }
  }
  
  // Load existing progress from database and localStorage
  async loadExistingProgress() {
    try {
      if (!this.currentActivity || !this.currentActivity.id) {
        console.log('🔍 DEBUG: No activity ID available for loading progress');
        return;
      }
      
      // First, try localStorage (fastest)
      this.loadFromLocalStorage();
      
      // Then, load from database (more reliable)
      const response = await fetch(`get_activity_progress.php?activity_id=${this.currentActivity.id}&user_id=${window.__USER_ID__ || 0}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.progress) {
          console.log('✅ Loaded existing progress from database:', result.progress);
          
          // Restore answers (database takes precedence)
          if (result.progress.answers) {
            this.answers = result.progress.answers;
            
            // Restore form values
            this.restoreFormValues();
            
            // Update progress display
            this.updateProgress();
          }
        }
      } else {
        console.log('🔍 DEBUG: No existing progress found in database');
      }
      
      // Initialize attempt if student view
      if (this.isStudent && (!this.options || !this.options.preview)) {
        await this.initializeAttempt();
      }
      
    } catch (error) {
      console.error('❌ Error loading existing progress:', error);
    }
  }
  
  // Initialize attempt (for student submissions)
  async initializeAttempt() {
    try {
      if (!this.currentActivity || !this.currentActivity.id) {
        return;
      }
      
      // Start or get existing attempt
      const response = await fetch('submit_activity.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          activity_id: this.currentActivity.id,
          action: 'start_attempt'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.attempt_id) {
          this.attemptId = result.attempt_id;
          console.log('✅ Attempt initialized:', this.attemptId);
        }
      }
      
    } catch (error) {
      console.error('❌ Error initializing attempt:', error);
    }
  }
  
  // Restore form values from saved answers
  restoreFormValues() {
    Object.keys(this.answers).forEach(questionIndex => {
      const answer = this.answers[questionIndex];
      
      // Try to find and restore radio button
      const radioInput = document.querySelector(`input[name="question_${questionIndex}"][value="${answer}"]`);
      if (radioInput) {
        radioInput.checked = true;
        // Also update the visual state of the container
        const container = radioInput.closest('div[onclick]');
        if (container) {
          container.style.background = '#e3f2fd';
          container.style.borderColor = '#2196f3';
        }
      }
      
      // Try to find and restore text input
      const textInput = document.querySelector(`input[name="question_${questionIndex}"]`);
      if (textInput && textInput.type === 'text') {
        textInput.value = answer;
      }
      
      // Try to find and restore textarea
      const textarea = document.querySelector(`textarea[name="question_${questionIndex}"]`);
      if (textarea) {
        textarea.value = answer;
      }
    });
  }

  // Calculate progress percentage
  calculateProgressPercentage() {
    const answeredCount = Object.keys(this.answers).length;
    const totalQuestions = this.questions ? this.questions.length : 1;
    return totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  }

  // Update progress bar and counter
  updateProgress() {
    const progressCounter = document.getElementById('progress-counter');
    const progressBar = document.getElementById('progress-bar');
    
    if (progressCounter && progressBar) {
      const answeredCount = Object.keys(this.answers).length;
      const totalQuestions = this.questions ? this.questions.length : 1;
      const percentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
      
      progressCounter.textContent = `${answeredCount} / ${totalQuestions} answered`;
      progressBar.style.width = `${percentage}%`;
      
      console.log('🔍 DEBUG: Progress updated:', `${answeredCount}/${totalQuestions} (${percentage.toFixed(1)}%)`);
    }
  }

  // Update navigation buttons
  updateNavigation() {
    console.log('🔍 DEBUG: updateNavigation() called');
    
    // The modal uses different element IDs - let's find the correct ones
    const finishBtn = document.getElementById('finish-attempt-btn');
    const progressCounter = document.getElementById('progress-counter');
    
    console.log('🔍 DEBUG: Modal elements found:', {
      finishBtn: !!finishBtn,
      progressCounter: !!progressCounter
    });
    
    // Update progress counter
    if (progressCounter) {
      const answeredCount = Object.keys(this.answers).length;
      const totalQuestions = this.questions ? this.questions.length : 0;
      progressCounter.textContent = `${answeredCount} / ${totalQuestions} answered`;
      console.log('🔍 DEBUG: Progress updated:', `${answeredCount} / ${totalQuestions} answered`);
    }
    
    // Update question navigation buttons
    const questionNav = document.getElementById('questionNavigation');
    if (questionNav && this.questions) {
      questionNav.innerHTML = '';
      this.questions.forEach((question, index) => {
        const btn = document.createElement('button');
        btn.textContent = index + 1;
        btn.style.cssText = `
          width: 32px; height: 32px; border-radius: 6px; border: 1px solid #e9ecef;
          background: ${index === this.currentQuestionIndex ? '#28a745' : '#f8f9fa'};
          color: ${index === this.currentQuestionIndex ? 'white' : '#6c757d'};
          cursor: pointer; font-size: 12px; font-weight: 600;
        `;
        btn.onclick = () => this.goToQuestion(index);
        questionNav.appendChild(btn);
      });
      console.log('🔍 DEBUG: Question navigation updated with', this.questions.length, 'questions');
    }
    
    console.log('🔍 DEBUG: Navigation updated successfully');
  }

  // Start timer
  startTimer() {
    this.timerInterval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now - this.startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      
      const timerEl = document.getElementById('timer');
      if (timerEl) {
        timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    }, 1000);
  }

  // Stop timer
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Bind event listeners
  bindEvents() {
    if (this.modal && this.modal.getAttribute('data-coding-preview') === '1') {
      return;
    }
    // Close modal
    const closeBtn = document.getElementById('closeTryAnsweringModal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }
    
    // Click outside to close
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    // Finish attempt button
    const finishBtn = document.getElementById('finish-attempt-btn');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        if (this.options && this.options.preview) {
          this.closeModal(); // Just close in preview mode
        } else {
          this.submitActivity(); // Normal submission
        }
      });
    }
    
    console.log('🔍 DEBUG: Events bound successfully');
  }

  // Previous question
  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.displayCurrentQuestion();
    }
  }

  // Next question
  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.displayCurrentQuestion();
    }
  }

  // Save progress
  async saveProgress() {
    try {
      const saveBtn = document.getElementById('saveProgress');
      const originalText = saveBtn.innerHTML;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:6px;"></i>Saving...';
      saveBtn.disabled = true;

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Progress saved:', {
        activityId: this.currentActivity.id,
        answers: this.answers,
        currentQuestion: this.currentQuestionIndex,
        timeSpent: new Date() - this.startTime
      });

      this.showNotification('success', 'Progress saved successfully!');
      
      // Reset button
      saveBtn.innerHTML = originalText;
      saveBtn.disabled = false;
    } catch (error) {
      this.showNotification('error', 'Failed to save progress. Please try again.');
    }
  }

  // Submit activity (FINAL SUBMISSION - moves from draft to final)
  async submitActivity() {
    try {
      const submitBtn = document.getElementById('submitActivity') || document.getElementById('finish-attempt-btn');
      if (!submitBtn) {
        console.error('Submit button not found');
        return;
      }
      
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:6px;"></i>Submitting...';
      submitBtn.disabled = true;

      // Check if this is student view (not preview)
      const isStudent = this.isStudent && (!this.options || !this.options.preview);
      
      if (!isStudent) {
        // Teacher preview mode - just close
        this.showNotification('success', 'Preview completed');
        this.closeModal();
        return;
      }
      
      // Calculate time spent
      const timeSpentMs = this.startTime ? (Date.now() - this.startTime.getTime()) : null;
      
      // Prepare submission data
      // Ensure answers is an object (not array) and has valid question IDs
      const answersToSubmit = {};
      Object.keys(this.answers).forEach(key => {
        const answer = this.answers[key];
        // CRITICAL: Include all valid answers (including 0, false, and empty strings for some question types)
        // Only exclude null and undefined
        // For choice-based questions (MCQ, True/False), answer is a choice ID (number)
        // For identification, answer is a string (can be empty, but we'll allow it)
        // For essay/upload, answer might be empty initially
        if (answer !== null && answer !== undefined) {
          // Convert to appropriate type: preserve numbers, strings, booleans
          // Don't filter out 0 (valid choice ID) or false (valid boolean answer)
          answersToSubmit[key] = answer;
        }
      });
      
      // Log detailed answer information for debugging
      console.log('📤 Raw answers object:', this.answers);
      console.log('📤 Filtered answers to submit:', answersToSubmit);
      console.log('📤 Answers count:', Object.keys(answersToSubmit).length);
      console.log('📤 Answers keys:', Object.keys(answersToSubmit));
      console.log('📤 Answers values:', Object.values(answersToSubmit));
      
      // Validate that we have at least one answer
      if (Object.keys(answersToSubmit).length === 0) {
        console.error('❌ No answers to submit! Raw answers:', this.answers);
        throw new Error('Please answer at least one question before submitting');
      }
      
      const submissionData = {
        action: 'submit', // Explicitly set action
        activity_id: this.currentActivity.id,
        attempt_id: this.attemptId || null,
        answers: answersToSubmit,
        time_spent_ms: timeSpentMs
      };
      
      console.log('📤 Submitting activity (final submission):', submissionData);
      console.log('📤 Answers count:', Object.keys(answersToSubmit).length);
      console.log('📤 Answers keys:', Object.keys(answersToSubmit));
      
      // Submit to final submission endpoint
      const response = await fetch('submit_activity.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(submissionData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to submit activity');
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Activity submitted successfully:', result);
        
        // Store activity ID and score BEFORE closing modal (currentActivity might be cleared)
        const activityId = this.currentActivity ? this.currentActivity.id : submissionData.activity_id;
        const finalScore = result.score || 0;
        const attemptId = result.attempt_id || null;
        
        // Clear localStorage backup
        if (activityId) {
          const key = `activity_progress_${activityId}_${window.__USER_ID__ || 0}`;
          localStorage.removeItem(key);
        }
        
        // Clear retry queue
        this.clearRetryQueue();
        
        // No notification - Test Results modal will show the score instead
        
        // Close activity modal
        this.closeModal();
        
        // Update activity card score immediately (REAL-TIME UPDATE) - use score from submission response
        if (activityId && typeof updateActivityCardScore === 'function') {
          updateActivityCardScore(activityId, finalScore);
        }
        
        // Show Test Results modal first (question-by-question breakdown)
        setTimeout(() => {
          if (attemptId) {
            // Fetch attempt results and show Test Results modal
            showTestResultsModal(attemptId, activityId, finalScore);
          } else {
            console.error('❌ Cannot show test results: attempt ID is missing');
            // Silent fallback - just reload to show updated score (no notifications)
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        }, 500);
        
        // CRITICAL: Delayed score refresh to ensure score is saved and displayed correctly
        // This handles cases where the immediate update might fail or the score isn't saved yet
        setTimeout(() => {
          if (activityId && typeof loadAllStudentScores === 'function') {
            console.log('🔄 Refreshing scores from server to ensure accuracy...');
            loadAllStudentScores();
          } else if (activityId && typeof getStudentScore === 'function') {
            // Fallback: refresh just this activity's score
            getStudentScore(activityId).then(score => {
              if (typeof updateActivityCardScore === 'function') {
                updateActivityCardScore(activityId, score);
              }
            });
          }
        }, 3000); // Wait 3 seconds for database to be updated
        
        // Reload page to show updated scores after leaderboard is closed
        // setTimeout(() => {
        //   window.location.reload();
        // }, 1500);
      } else {
        throw new Error(result.message || 'Submission failed');
      }
      
    } catch (error) {
      // Log error to console only (no user-facing error notifications)
      console.error('❌ Error submitting activity:', error);
      
      // Re-enable submit button
      const submitBtn = document.getElementById('submitActivity') || document.getElementById('finish-attempt-btn');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit';
      }
    }
  }

  // Bind answer tracking for preview mode
  bindPreviewAnswerTracking() {
    console.log('🔍 DEBUG: Binding preview answer tracking');
    
    // Track radio button changes
    document.addEventListener('change', (e) => {
      if (e.target.type === 'radio' && e.target.name && e.target.name.startsWith('question-')) {
        const questionIndex = parseInt(e.target.name.split('-')[1]);
        this.answers[questionIndex] = e.target.value;
        this.updateProgress();
        console.log('🔍 DEBUG: Preview answer recorded:', { questionIndex, answer: e.target.value });
      }
    });
    
    // Track text input changes
    document.addEventListener('input', (e) => {
      if (e.target.type === 'text' && e.target.name && e.target.name.startsWith('question-')) {
        const questionIndex = parseInt(e.target.name.split('-')[1]);
        if (e.target.value.trim()) {
          this.answers[questionIndex] = e.target.value;
        } else {
          delete this.answers[questionIndex];
        }
        this.updateProgress();
        console.log('🔍 DEBUG: Preview text answer recorded:', { questionIndex, answer: e.target.value });
      }
    });
    
    // Track textarea changes
    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'TEXTAREA' && e.target.name && e.target.name.startsWith('question-')) {
        const questionIndex = parseInt(e.target.name.split('-')[1]);
        if (e.target.value.trim()) {
          this.answers[questionIndex] = e.target.value;
        } else {
          delete this.answers[questionIndex];
        }
        this.updateProgress();
        console.log('🔍 DEBUG: Preview textarea answer recorded:', { questionIndex, answer: e.target.value });
      }
    });
  }

  // Close modal
  closeModal() {
    this.stopTimer();
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
      this.currentActivity = null;
      this.questions = null;
      this.answers = {};
      this.currentQuestionIndex = 0;
      this.codingContext = null;
    }
  }

  // Show notification using unified notification system
  showNotification(type, message) {
    if (typeof window.showNotification === 'function') {
      // Use unified notification system
      const title = type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info';
      window.showNotification(type, title, message);
    } else {
      // Fallback to console if notification system not available
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
}

// Create global instance
window.activityTester = new ActivityTester();
// ======================== END ACTIVITY TESTER CLASS ========================

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
    if (e.target.textContent && e.target.textContent.includes('Try answering')) {
      // Handler for "Try answering" clicks
      }
  });
  
  // Wire navigation tabs
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-section').forEach(sec => sec.classList.remove('active'));
      const target = document.getElementById('tab-' + tab);
      if (target) target.classList.add('active');

      if (tab === 'lessons') {
        loadLessons();
      }
      if (tab === 'classrecord') {
        // placeholder: could load attendance/grades summary
      }
      if (tab === 'newsfeed') {
        // placeholder
      }
      if (tab === 'leaderboards') {
        loadClassLeaderboards();
      }
    });
  });

  // Topic headers (will be re-bound when topics are rendered)
  const topicHeaders = document.querySelectorAll('.topic-header');
  topicHeaders.forEach((header, index) => {
    header.addEventListener('click', () => {
      toggleTopic(header.closest('.topic-item'));
    });
  });

  // Action buttons
  const click = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
  click('createActivityBtn', () => (window.showInfo ? window.showInfo('Coming Soon','Create Activity functionality coming soon!') : alert('Create Activity functionality coming soon!')));
  // Menu dropdown toggle
  click('menuBtn', () => {
    const dd = document.getElementById('navMenuDropdown');
    if (!dd) return;
    dd.style.display = (dd.style.display === 'none' || dd.style.display === '') ? 'block' : 'none';
  });
  const copyMenu = document.getElementById('copyClassCodeMenu');
  if (copyMenu) copyMenu.addEventListener('click', () => { hideMenu(); copyClassCode(); });
  click('startLessonBtn', () => switchToTab('lessons'));
  click('openGradesBtn', () => switchToTab('classrecord'));
  click('reviewDraftsBtn', () => switchToTab('activities'));

  // fetch class details and populate header
  loadDetails();
  loadOverview();
  loadTopicsFromCourse();
  
  // Force center the lesson header (backup solution)
  setTimeout(() => {
    const lessonHeader = document.querySelector('.lesson-header');
    const lessonTitle = document.querySelector('.lesson-title');
    const lessonMainTitle = document.querySelector('.lesson-main-title');
    
    if (lessonHeader) {
      lessonHeader.style.textAlign = 'center';
      lessonHeader.style.display = 'flex';
      lessonHeader.style.flexDirection = 'column';
      lessonHeader.style.alignItems = 'center';
    }
    if (lessonTitle) {
      lessonTitle.style.textAlign = 'center';
      lessonTitle.style.margin = '0 0 8px 0';
    }
    if (lessonMainTitle) {
      lessonMainTitle.style.textAlign = 'center';
      lessonMainTitle.style.margin = '0';
    }
  }, 100);
});

function loadDetails() {
  const id = window.__CLASS_ID__;
  fetch('class_view_api.php?action=get_details&id=' + encodeURIComponent(id), { credentials: 'same-origin' })
    .then(r => r.json()).then(data => {
      if (!data || !data.success) return;
      const cls = data.class;
      
      // Top-left title uses class name
      const codeEl = document.getElementById('courseCode');
      if (codeEl) {
        codeEl.textContent = cls.name || 'Class';
      }

      // Fetch first module of the assigned course and show as main header.
      const lessonTitle = document.querySelector('.lesson-main-title');
      fetch('class_view_api.php?action=get_first_module&id=' + encodeURIComponent(id), { credentials: 'same-origin' })
        .then(r => r.json()).then(modRes => {
          if (modRes && modRes.success && modRes.module) {
            if (lessonTitle) lessonTitle.textContent = modRes.module.title || 'Module';
          } else {
            if (lessonTitle) lessonTitle.textContent = cls.name || 'Class';
          }
        }).catch(() => { if (lessonTitle) lessonTitle.textContent = cls.name || 'Class'; });
      
      // Update class type in logo
      const logoIcon = document.querySelector('.logo-icon i');
      if (logoIcon) {
        if (cls.name && cls.name.toLowerCase().includes('lab')) {
          logoIcon.className = 'fas fa-flask';
        } else {
          logoIcon.className = 'fas fa-graduation-cap';
        }
      }
      
    }).catch(()=>{});
}

// Populate all modules and their lessons from the teacher's selected course
function loadTopicsFromCourse() {
  const id = window.__CLASS_ID__;
  if (!id) {
    return;
  }
  
  fetch('class_view_api.php?action=list_topics&id=' + encodeURIComponent(id), { credentials: 'same-origin' })
    .then(r => r.json())
    .then(res => {
      if (!res || !res.success) {
        return;
      }
      const modules = Array.isArray(res.modules) ? res.modules : [];
      const container = document.querySelector('.lesson-topics');
      if (!container) {
        return;
      }
      if (!modules.length) { 
        container.innerHTML = ''; 
        return; 
      }
      
      // Generate HTML for all modules
      const generatedHTML = modules.map((module, moduleIdx) => {
        const moduleTitle = escapeHtml(module.title || 'Untitled Module');
        const lessons = Array.isArray(module.lessons) ? module.lessons : [];
        
        const lessonsHtml = lessons.map((lesson, lessonIdx) => {
          const title = escapeHtml(lesson.title || 'Untitled');
          const lessonNum = lessonIdx + 1;
          const activities = Array.isArray(lesson.activities) ? lesson.activities : [];
          console.log('🔍 [LOAD TOPICS] Lesson "' + title + '" has ' + activities.length + ' activities');
          
          // Generate activity cards for each real activity
          
          const activitiesHtml = activities.map((activity, activityIdx) => {
            console.log('🔍 [LOAD TOPICS] Processing activity:', activity.title || 'Untitled', 'ID:', activity.id);
            console.log('🔍 [LOAD TOPICS] Full activity object:', JSON.stringify(activity, null, 2));
            const activityTitle = escapeHtml(activity.title || 'Untitled Activity');
            const activityType = activity.type || 'upload_based';
            const maxScore = activity.max_score || 10;
            
            // SUPER DEEP DEBUGGING
            console.log('🔍 SUPER DEBUG - Activity:', activityTitle);
            console.log('🔍 SUPER DEBUG - User Role:', window.__USER_ROLE__);
            console.log('🔍 SUPER DEBUG - Role Type:', typeof window.__USER_ROLE__);
            console.log('🔍 SUPER DEBUG - Role Lowercase:', window.__USER_ROLE__?.toLowerCase());
            console.log('🔍 SUPER DEBUG - Is Student Check:', window.__USER_ROLE__?.toLowerCase() === 'student');
            
            // ROLE-BASED RENDERING - Single file approach
            const isStudent = window.__USER_ROLE__?.toLowerCase() === 'student';
            console.log('🔍 SUPER DEBUG - isStudent variable:', isStudent);
            
            if (isStudent) {
              console.log('🎓 SUPER DEBUG - GENERATING STUDENT FORMAT for:', activityTitle);
              
              // Check availability - CRITICAL: Ensure availability object is properly structured
              const availability = activity.availability || { 
                available: false, 
                status: 'locked', 
                reason: 'Activity is locked. Teacher will open it soon.' 
              };
              // Double-check: If availability object exists but missing properties, fill them
              const isAvailable = availability.available === true;
              const isLocked = availability.status === 'locked' || !isAvailable;
              const isClosed = availability.status === 'closed';
              
              console.log(`🎓 loadTopicsFromCourse: Activity ${activity.id} - availability:`, availability);
              console.log(`🎓 loadTopicsFromCourse: Activity ${activity.id} - isAvailable:`, isAvailable, 'isLocked:', isLocked, 'isClosed:', isClosed);
              
              // Format dates - show "-" if not set (like in the reference image)
              // CRITICAL: Treat dates as Manila time (UTC+8) if no timezone info
              const formatDate = (dateStr) => {
                if (!dateStr) return '-';
                // If date string has no timezone indicator, assume it's Manila time (UTC+8)
                let dateStrFixed = dateStr;
                // Check if it's MySQL DATETIME format (YYYY-MM-DD HH:MM:SS) without timezone
                if (dateStr && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
                  // Convert to ISO format with Manila timezone: "2025-11-07 16:34:00" -> "2025-11-07T16:34:00+08:00"
                  dateStrFixed = dateStr.replace(' ', 'T') + '+08:00';
                }
                const d = new Date(dateStrFixed);
                return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) + ', ' + 
                       d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              };
              
              const startDate = formatDate(activity.start_at);
              const dueDate = formatDate(activity.due_at);
              
              // Determine status badge
              let statusBadge = '';
              let statusClass = '';
              if (isLocked) {
                statusBadge = '<span class="activity-status-badge badge-locked"><i class="fas fa-lock"></i> Locked</span>';
                statusClass = 'activity-locked';
              } else if (isClosed) {
                statusBadge = '<span class="activity-status-badge badge-closed"><i class="fas fa-clock"></i> Closed</span>';
                statusClass = 'activity-closed';
              } else if (isAvailable) {
                statusBadge = '<span class="activity-status-badge badge-open"><i class="fas fa-check-circle"></i> Open</span>';
                statusClass = 'activity-open';
              } else {
                statusBadge = '<span class="activity-status-badge badge-upcoming"><i class="fas fa-hourglass-half"></i> Upcoming</span>';
                statusClass = 'activity-upcoming';
              }
              
              // Calculate time remaining for countdown
              let timeRemainingHtml = '';
              if (activity.due_at && !isLocked) {
                const dueDateObj = new Date(activity.due_at.replace(' ', 'T') + '+08:00');
                const now = new Date();
                if (dueDateObj > now) {
                  timeRemainingHtml = `<div class="time-remaining" data-due-date="${activity.due_at}" data-activity-id="${activity.id}">
                    <i class="fas fa-hourglass-half"></i> <span class="countdown-text">Calculating...</span>
                  </div>`;
                }
              }
              
              // STUDENT FORMAT - Enhanced interactive design
              return `
                <div class="activity-card student-format ${statusClass}" data-activity-id="${activity.id}" data-max-score="${maxScore}">
                  <div class="activity-left-border ${isLocked ? 'border-locked' : isClosed ? 'border-closed' : isAvailable ? 'border-open' : 'border-upcoming'}"></div>
                  ${statusBadge ? `<div class="activity-status-badge-top-right">${statusBadge}</div>` : ''}
                  <div class="activity-content">
                    <div class="activity-header-row">
                      <div class="activity-title">
                        ${activityTitle}
                      </div>
                    </div>
                    <div class="activity-info-grid">
                      <div class="activity-dates">
                        <div class="activity-date start">
                          <i class="fas fa-calendar-check"></i>
                          <span class="date-label">Opens:</span>
                          <span class="date-value">${startDate}</span>
                        </div>
                        <div class="activity-date end">
                          <i class="fas fa-calendar-times"></i>
                          <span class="date-label">Due:</span>
                          <span class="date-value">${dueDate}</span>
                        </div>
                      </div>
                      ${timeRemainingHtml ? `<div class="countdown-wrapper">${timeRemainingHtml}</div>` : ''}
                    </div>
                    ${!isAvailable ? `<div class="activity-status-message">
                      <i class="fas fa-info-circle"></i> ${availability.reason || 'Activity not available'}
                    </div>` : ''}
                  </div>
                  <div class="activity-stats">
                    <div class="student-score" data-activity-id="${activity.id}">
                      <div class="score-value">-/${maxScore}</div>
                      <div class="score-label">Score</div>
                    </div>
                    ${isAvailable ? 
                      `<button class="start-activity-btn" onclick="startStudentActivity(${activity.id})" style="position: absolute; right: 24px; top: 50%; transform: translateY(-50%); z-index: 10;">
                        <i class="fas fa-play"></i> Start
                      </button>` :
                      `<button class="start-activity-btn" disabled style="position: absolute; right: 24px; top: 50%; transform: translateY(-50%); z-index: 10;">
                        <i class="fas fa-lock"></i> ${isLocked ? 'Locked' : isClosed ? 'Closed' : 'Unavailable'}
                      </button>`
                    }
                  </div>
                </div>
              `;
            } else {
              console.log('👨‍🏫 SUPER DEBUG - GENERATING TEACHER FORMAT for:', activityTitle);
              console.log('👨‍🏫 DEBUG - Activity data:', {
                id: activity.id,
                start_at: activity.start_at,
                due_at: activity.due_at,
                hasStartAt: !!activity.start_at,
                startAtType: typeof activity.start_at,
                startAtValue: activity.start_at
              });
              
              // Check if activity is locked - use availability status from API (more reliable)
              const availability = activity.availability || { 
                available: false, 
                status: !activity.start_at ? 'locked' : 'open', 
                reason: !activity.start_at ? 'Activity is locked. Teacher will open it soon.' : 'Activity is available'
              };
              const isLocked = availability.status === 'locked' || !availability.available;
              console.log('👨‍🏫 DEBUG - isLocked:', isLocked, 'start_at:', activity.start_at, 'availability:', availability);
              console.log('👨‍🏫 DEBUG - Will render Unlock button:', isLocked);
              
              // Format dates for teacher view
              // CRITICAL: Treat dates as Manila time (UTC+8) if no timezone info
              const formatDate = (dateStr) => {
                if (!dateStr) return 'Not set';
                // If date string has no timezone indicator, assume it's Manila time (UTC+8)
                let dateStrFixed = dateStr;
                // Check if it's MySQL DATETIME format (YYYY-MM-DD HH:MM:SS) without timezone
                if (dateStr && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
                  // Convert to ISO format with Manila timezone: "2025-11-07 16:34:00" -> "2025-11-07T16:34:00+08:00"
                  dateStrFixed = dateStr.replace(' ', 'T') + '+08:00';
                }
                const d = new Date(dateStrFixed);
                // Format using Philippine timezone (Asia/Manila)
                return d.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric',
                  timeZone: 'Asia/Manila'
                }) + ', ' + 
                d.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  timeZone: 'Asia/Manila'
                });
              };
              
              const startDate = formatDate(activity.start_at);
              const dueDate = formatDate(activity.due_at);
              
              // TEACHER FORMAT - Enhanced interactive design with stats
              console.log('👨‍🏫 DEBUG - Rendering teacher format, isLocked:', isLocked, 'Button will be:', isLocked ? 'Unlock...' : 'Dropdown menu');
              const teacherStatusBadge = isLocked ? 
                '<span class="activity-status-badge badge-locked"><i class="fas fa-lock"></i> Locked</span>' :
                '<span class="activity-status-badge badge-open"><i class="fas fa-check-circle"></i> Open</span>';
              
              // Determine activity status (closed/open) - Functional check
              let activityStatus = 'Open';
              let activityStatusTime = '00:00';
              if (activity.due_at && activity.start_at) {
                // Parse dates with Manila timezone
                let dueDateFixed = activity.due_at;
                if (dueDateFixed && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dueDateFixed)) {
                  dueDateFixed = dueDateFixed.replace(' ', 'T') + '+08:00';
                }
                const dueDateObj = new Date(dueDateFixed);
                const now = new Date();
                
                if (now > dueDateObj) {
                  activityStatus = 'Closed';
                  // Show the time when it closed (due date time)
                  const hours = String(dueDateObj.getHours()).padStart(2, '0');
                  const minutes = String(dueDateObj.getMinutes()).padStart(2, '0');
                  activityStatusTime = `${hours}:${minutes}`;
                } else {
                  // Still open - show current time or "00:00"
                  activityStatus = 'Open';
                  activityStatusTime = '00:00';
                }
              } else if (!activity.start_at) {
                // Not yet unlocked
                activityStatus = 'Locked';
                activityStatusTime = '00:00';
              }
              
              return `
                <div class="activity-card teacher-format ${isLocked ? 'activity-locked' : 'activity-open'}" data-activity-id="${activity.id}" data-max-score="${maxScore}">
                  <div class="activity-left-border ${isLocked ? 'border-locked' : 'border-open'}"></div>
                  ${teacherStatusBadge ? `<div class="activity-status-badge-top-right">${teacherStatusBadge}</div>` : ''}
                  <div class="activity-content">
                    <div class="activity-header-row">
                      <div class="activity-title">${activityTitle}</div>
                    </div>
                    <div class="activity-info-grid">
                      <div class="activity-dates">
                        <div class="activity-date start">
                          <i class="fas fa-calendar-check"></i>
                          <span class="date-label">Opens:</span>
                          <span class="date-value">${startDate}</span>
                        </div>
                        <div class="activity-date end">
                          <i class="fas fa-calendar-times"></i>
                          <span class="date-label">Due:</span>
                          <span class="date-value">${dueDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="activity-stats">
                    <div class="teacher-stat-circles">
                      <div class="stat-circle avg-score" data-activity-id="${activity.id}">
                        <div class="stat-value">0/${maxScore}</div>
                        <div class="stat-label">Avg. overall score</div>
                      </div>
                      <div class="stat-circle activity-status">
                        <div class="stat-value">${activityStatusTime}</div>
                        <div class="stat-label">Activity ${activityStatus.toLowerCase()}</div>
                      </div>
                    </div>
                    ${isLocked ? 
                      `<button class="btn-unlock" onclick="unlockActivity(${activity.id}, '${escapeHtml(activityTitle)}')">
                        <i class="fas fa-unlock"></i> Unlock...
                      </button>` :
                      `<div class="activity-menu">
                        <i class="fas fa-ellipsis-v"></i>
                        <div class="activity-dropdown" style="display: none;">
                          <div class="dropdown-item" onclick="lockActivity(${activity.id}, '${escapeHtml(activityTitle)}')">
                            <i class="fas fa-lock"></i> Lock Activity
                          </div>
                          <div class="dropdown-item" onclick="handleTryAnswering(${activity.id})">
                            <i class="fas fa-play"></i> Try answering
                          </div>
                        </div>
                      </div>`
                    }
                  </div>
                </div>
              `;
            }
          }).join('');
          
          // Return lesson wrapper with activities
          return (
            '<div class="topic-item" data-lesson-id="' + (lesson.id||'') + '">' +
              '<div class="topic-header">' +
                '<i class="fas fa-chevron-down topic-toggle"></i>' +
                '<div class="topic-title-section">' +
                  '<div class="topic-number">Topic ' + lessonNum + '</div>' +
                  '<div class="topic-title">' + title + '</div>' +
                '</div>' +
                '<div class="topic-meta">' +
                  (function() {
                    console.log('🔍 JS Debug - User Role:', window.__USER_ROLE__);
                    console.log('🔍 JS Debug - Is Student:', window.__USER_ROLE__.toLowerCase() === 'student');
                    if (window.__USER_ROLE__.toLowerCase() !== 'student') {
                      const lessonId = lesson.id || '';
                      return '<div class="topic-status">Students currently here</div>' +
                          '<div class="topic-count" data-lesson-id="' + lessonId + '" id="active-students-' + lessonId + '">0</div>';
                    }
                    return '';
                  })() +
                '</div>' +
              '</div>' +
              '<div class="topic-body">' +
                '<div class="topic-content-row">' +
                  '<div class="topic-doc-icon"><i class="fas fa-file-alt"></i></div>' +
                  '<div class="topic-content-link">' +
                    '<span>Topic Content</span>' +
                    '<span class="topic-content-count"></span>' +
                  '</div>' +
                '</div>' +
                activitiesHtml +
              '</div>' +
            '</div>'
          );
        }).join('');
        
        const moduleNum = moduleIdx + 1;
        return (
          '<div class="module-section">' +
            '<div class="module-header">' +
              '<div class="module-number">MODULE ' + moduleNum + '</div>' +
              '<div class="module-title">' + moduleTitle + '</div>' +
            '</div>' +
            '<div class="module-lessons">' + lessonsHtml + '</div>' +
          '</div>'
        );
      }).join('');
      
      container.innerHTML = generatedHTML;
      
      // Start polling for active students count after rendering
      setTimeout(function() {
        updateActiveStudentsCounts();
        
        // Initialize improvements after content loads
        const userRole = (window.__USER_ROLE__ || '').toLowerCase();
        if (userRole === 'student') {
          setTimeout(function() {
            loadAllStudentScores();
            cleanupCountdownTimers();
            initializeCountdownTimers();
          }, 500);
        } else if (userRole === 'teacher' || userRole === 'coordinator') {
          setTimeout(function() {
            loadAllAvgScores();
          }, 500);
        }
        
        // Ensure real-time polling is running
        if (!activityStatusPollingInterval) {
          startActivityStatusPolling();
        }
        
        // Poll every 30 seconds
        if (window.__activeStudentsInterval) {
          clearInterval(window.__activeStudentsInterval);
        }
        window.__activeStudentsInterval = setInterval(updateActiveStudentsCounts, 30000);
      }, 1000);
      
      // Rebind headers for expand/collapse and lazy load
      const newTopicHeaders = document.querySelectorAll('.topic-header');
      
      newTopicHeaders.forEach((header, index) => {
        header.addEventListener('click', () => {
          toggleTopic(header.closest('.topic-item'));
        });
      });
      
      // Bind event listeners for main dashboard activity menus using event delegation
      // IMMEDIATE binding - no setTimeout delay for instant response
      (function bindActivityMenus() {
        // Remove any existing handlers to prevent duplicates
        const existingHandler = window.__activityMenuClickHandler;
        if (existingHandler) {
          document.removeEventListener('click', existingHandler, true);
        }
        
        // Create a single delegated event handler for all activity menus
        const activityMenuClickHandler = (e) => {
          // Check if click is on ellipsis icon or menu
          const icon = e.target.closest('.fa-ellipsis-v');
          const menu = e.target.closest('.activity-menu');
          
          if (!menu) return;
          
          // CRITICAL: Check if dropdown exists BEFORE handling click
          const dropdown = menu.querySelector('.activity-dropdown');
          if (!dropdown) {
            // Silently return - this menu doesn't have a dropdown (might be student view or different state)
            return;
          }
          
          // Only handle clicks on icon or menu container itself (not on dropdown items)
          const clickedDropdownItem = e.target.closest('.dropdown-item');
          if (clickedDropdownItem) {
            // Let dropdown item handler deal with it - don't toggle here
            return;
          }
          
          if (icon || e.target === menu) {
            e.stopPropagation();
            e.preventDefault();
            
            const isOpen = dropdown.classList.contains('dropdown-open');
            
            // Close all other dropdowns first
            document.querySelectorAll('.activity-dropdown.dropdown-open').forEach(d => {
              if (d !== dropdown) {
                d.classList.remove('dropdown-open');
                d.style.display = 'none';
              }
            });
            
            if (isOpen) {
              dropdown.classList.remove('dropdown-open');
              dropdown.style.display = 'none';
            } else {
              dropdown.classList.add('dropdown-open');
              dropdown.style.display = 'block';
            }
          }
        };
        
        // Store handler reference for cleanup
        window.__activityMenuClickHandler = activityMenuClickHandler;
        
        // Use capture phase to ensure we catch the event early
        document.addEventListener('click', activityMenuClickHandler, true);
        
        console.log('✅ Activity menu event delegation bound (IMMEDIATE)');
      })();
      
      // Bind dropdown items using event delegation
      setTimeout(() => {
        // Remove any existing handlers to prevent duplicates
        const existingItemHandler = window.__dropdownItemClickHandler;
        if (existingItemHandler) {
          document.removeEventListener('click', existingItemHandler, true);
        }
        
        // Create a single delegated event handler for all dropdown items
        const dropdownItemClickHandler = (e) => {
          const dropdownItem = e.target.closest('.dropdown-item');
          if (!dropdownItem) return;
          
          e.stopPropagation();
          const text = dropdownItem.textContent.trim();
          const dropdown = dropdownItem.closest('.activity-dropdown');
          const menu = dropdownItem.closest('.activity-menu');
          
          console.log('🔍 Dropdown item clicked:', text);
          
          if (dropdown) {
            closeActivityDropdown(dropdown);
          }
          
          // Handle different menu items
          let activityCard = dropdownItem.closest('.activity-card');
          
          if (!activityCard && menu) {
            activityCard = menu.closest('.activity-card');
          }
          
          if (!activityCard) {
            console.error('❌ No activity card found for dropdown item:', dropdownItem);
            return;
          }
          
          const activityId = activityCard.getAttribute('data-activity-id');
          if (!activityId) {
            console.error('❌ No data-activity-id found on activity card:', activityCard);
            return;
          }
          
          const activityTitle = activityCard.querySelector('.activity-title')?.textContent || 'Activity';
          
          if (text.includes('Lock Activity')) {
            if (typeof lockActivity === 'function') {
              lockActivity(activityId, activityTitle);
            } else {
              alert('Lock Activity function not available. Please refresh the page.');
            }
          } else if (text.includes('Reschedule/Set retakers')) {
            const dueDate = activityCard.querySelector('.due-date')?.textContent || 'Not set';
            if (window.cleanActivitySystem && window.cleanActivitySystem.showReschedule) {
              window.cleanActivitySystem.showReschedule(activityId, activityTitle, dueDate);
            } else {
              alert('Reschedule function not available. Please refresh the page.');
            }
          } else if (text.includes('Try answering') || text.includes('Start Activity')) {
            console.log('🔍 Try Answering clicked for activity:', {
          activityId: activityId,
          activityTitle: activityTitle,
          element: activityCard
        });
        
        // Validate activity ID before making API call
        if (!activityId || activityId === 'undefined' || activityId === 'null') {
          console.error('🔍 DEBUG: Invalid activity ID detected:', activityId);
          alert('Error: Invalid activity ID. Please try again.');
          return;
        }
        
            if (window.cleanActivitySystem && window.cleanActivitySystem.showTryAnswering) {
        // CRITICAL: For Teacher side, always use preview mode (testing only, no save)
        console.log('🔍 [TEACHER PREVIEW] Calling showTryAnswering with preview: true');
        window.cleanActivitySystem.showTryAnswering(activityId, activityTitle, { preview: true });
            } else {
              alert('Try Answering function not available. Please refresh the page.');
            }
          }
        };
        
        // Store handler reference for cleanup
        window.__dropdownItemClickHandler = dropdownItemClickHandler;
        
        // Use capture phase to ensure we catch the event early
        document.addEventListener('click', dropdownItemClickHandler, true);
        
        console.log('✅ Dropdown item event delegation bound (IMMEDIATE)');
      })();
      
      // Close dropdowns when clicking outside (use event delegation)
      // Remove old handler if exists
      if (window.__closeDropdownsHandler) {
        document.removeEventListener('click', window.__closeDropdownsHandler, true);
      }
      
      const closeDropdownsHandler = (e) => {
        // Check if click is outside all activity menus and dropdowns
        const clickedMenu = e.target.closest('.activity-menu');
        const clickedDropdown = e.target.closest('.activity-dropdown');
        const clickedIcon = e.target.closest('.fa-ellipsis-v');
        const clickedDropdownItem = e.target.closest('.dropdown-item');
        
        // Only close if clicking outside menu, dropdown, dropdown items, and not on icon
        if (!clickedMenu && !clickedDropdown && !clickedIcon && !clickedDropdownItem) {
          document.querySelectorAll('.activity-dropdown').forEach(dropdown => {
            closeActivityDropdown(dropdown);
          });
        }
      };
      
      // Store handler reference for cleanup
      window.__closeDropdownsHandler = closeDropdownsHandler;
      document.addEventListener('click', closeDropdownsHandler, true);
    }).catch(error => {
      });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"]+/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
}

function toggleTopic(item) {
  if (!item) {
    return;
  }
  
  const icon = item.querySelector('.topic-toggle');
  const isExpanded = item.classList.contains('expanded');
  const body = item.querySelector('.topic-body');
  
  if (isExpanded) {
    item.classList.remove('expanded');
    if (icon) icon.style.transform = 'rotate(0deg)';
    if (body) body.style.display = 'none';
    return;
  }
  
  // Expand and load lesson details
  item.classList.add('expanded');
  if (icon) icon.style.transform = 'rotate(180deg)';
  if (body) {
    body.style.display = 'block';
    // Only load content if not already loaded
    if (!body.hasAttribute('data-loaded')) {
      const lessonId = item.getAttribute('data-lesson-id') ? parseInt(item.getAttribute('data-lesson-id'),10) : 0;
      if (!lessonId) { 
        body.innerHTML = '<div style="color:#64748b;">No details available.</div>'; 
        body.setAttribute('data-loaded', 'true');
        return; 
      }
      loadTopicContent(item, lessonId);
      body.setAttribute('data-loaded', 'true');
    }
  }
}

function loadTopicContent(item, lessonId) {
  const body = item.querySelector('.topic-body');
  if (!body) {
    return;
  }
  
  // Show loading state
  body.innerHTML = '<div style="text-align:center;padding:20px;color:#64748b;"><i class="fas fa-spinner fa-spin" style="margin-right:8px"></i>Loading contents…</div>';
  
  if (!lessonId) { 
    body.innerHTML = '<div style="color:#64748b;">No details available.</div>'; 
    return; 
  }
  
  fetch('class_view_api.php?action=get_lesson_details&lesson_id=' + encodeURIComponent(lessonId), { credentials: 'same-origin' })
    .then(r=>r.json()).then(res => {
      if (!res || !res.success) { 
        body.innerHTML = '<div style="color:#ef4444;">Failed to load lesson details.</div>'; 
        return; 
      }
      
      const materials = Array.isArray(res.materials) ? res.materials : [];
      const activities = Array.isArray(res.activities) ? res.activities : [];
      
      // Build content HTML
      let contentHtml = '';
      
      // Topic Content section - Simple but Interactive
      if (materials.length > 0) {
        const materialCount = materials.length;
        const materialText = materialCount === 1 ? 'material' : 'materials';
        contentHtml += '<div class="topic-content-row" data-material-count="' + materialCount + '">' +
          '<div class="topic-doc-icon"><i class="fas fa-file-alt"></i></div>' +
          '<div class="topic-content-link">' +
            '<span>Topic Content</span>' +
            '<span class="topic-content-count">(' + materialCount + ' ' + materialText + ')</span>' +
          '</div>' +
        '</div>';
      }
      
      // Activity cards - Use same logic as loadTopicsFromCourse for teacher view
      if (activities.length > 0) {
        const isStudent = window.__USER_ROLE__.toLowerCase() === 'student';
        
        activities.forEach((activity, i) => {
          const title = escapeHtml(activity.title || 'Activity');
          console.log(`🔍 loadTopicContent: Generating activity card for: ${title} (ID: ${activity.id}, Type: ${activity.type})`);
          console.log(`🔍 loadTopicContent: Activity start_at:`, activity.start_at, 'type:', typeof activity.start_at);
          
          // Format dates
          // CRITICAL: Treat dates as Manila time (UTC+8) if no timezone info
          const formatDate = (dateStr) => {
            if (!dateStr) return 'Not set';
            // If date string has no timezone indicator, assume it's Manila time (UTC+8)
            let dateStrFixed = dateStr;
            // Check if it's MySQL DATETIME format (YYYY-MM-DD HH:MM:SS) without timezone
            if (dateStr && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
              // Convert to ISO format with Manila timezone: "2025-11-07 16:34:00" -> "2025-11-07T16:34:00+08:00"
              dateStrFixed = dateStr.replace(' ', 'T') + '+08:00';
            }
            const d = new Date(dateStrFixed);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + 
                   d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          };
          
          const startDate = formatDate(activity.start_at);
          const dueDate = formatDate(activity.due_at);
          
          if (isStudent) {
            // Student format - same as loadTopicsFromCourse
            // CRITICAL: Ensure availability object exists and is properly structured
            const availability = activity.availability || { 
              available: false, 
              status: 'locked', 
              reason: 'Activity is locked. Teacher will open it soon.' 
            };
            // Double-check: If availability object exists but missing properties, fill them
            const isAvailable = availability.available === true;
            const isLocked = availability.status === 'locked' || !isAvailable;
            const isClosed = availability.status === 'closed';
            
            console.log(`🎓 loadTopicContent: Activity ${activity.id} - availability:`, availability);
            console.log(`🎓 loadTopicContent: Activity ${activity.id} - isAvailable:`, isAvailable, 'isLocked:', isLocked, 'isClosed:', isClosed);
            
            // Determine status badge
            let statusBadge = '';
            let statusClass = '';
            if (isLocked) {
              statusBadge = '<span class="activity-status-badge badge-locked"><i class="fas fa-lock"></i> Locked</span>';
              statusClass = 'activity-locked';
            } else if (isClosed) {
              statusBadge = '<span class="activity-status-badge badge-closed"><i class="fas fa-clock"></i> Closed</span>';
              statusClass = 'activity-closed';
            } else if (isAvailable) {
              statusBadge = '<span class="activity-status-badge badge-open"><i class="fas fa-check-circle"></i> Open</span>';
              statusClass = 'activity-open';
            } else {
              statusBadge = '<span class="activity-status-badge badge-upcoming"><i class="fas fa-hourglass-half"></i> Upcoming</span>';
              statusClass = 'activity-upcoming';
            }
            
            // Calculate time remaining for countdown
            let timeRemainingHtml = '';
            if (activity.due_at && !isLocked) {
              const dueDateObj = new Date(activity.due_at.replace(' ', 'T') + '+08:00');
              const now = new Date();
              if (dueDateObj > now) {
                timeRemainingHtml = `<div class="time-remaining" data-due-date="${activity.due_at}" data-activity-id="${activity.id}">
                  <i class="fas fa-hourglass-half"></i> <span class="countdown-text">Calculating...</span>
                </div>`;
              }
            }
            
            contentHtml += `
              <div class="activity-card student-format ${statusClass}" data-activity-id="${activity.id}" data-max-score="${activity.max_score || 0}">
                <div class="activity-left-border ${isLocked ? 'border-locked' : isClosed ? 'border-closed' : isAvailable ? 'border-open' : 'border-upcoming'}"></div>
                ${statusBadge ? `<div class="activity-status-badge-top-right">${statusBadge}</div>` : ''}
                <div class="activity-content">
                  <div class="activity-header-row">
                    <div class="activity-title">
                      ${title}
                    </div>
                  </div>
                  <div class="activity-info-grid">
                    <div class="activity-dates">
                      <div class="activity-date start">
                        <i class="fas fa-calendar-check"></i>
                        <span class="date-label">Opens:</span>
                        <span class="date-value">${startDate}</span>
                      </div>
                      <div class="activity-date end">
                        <i class="fas fa-calendar-times"></i>
                        <span class="date-label">Due:</span>
                        <span class="date-value">${dueDate}</span>
                      </div>
                    </div>
                    ${timeRemainingHtml ? `<div class="countdown-wrapper">${timeRemainingHtml}</div>` : ''}
                  </div>
                  ${!isAvailable && availability.reason ? `<div class="activity-status-message">${escapeHtml(availability.reason)}</div>` : ''}
                </div>
                <div class="activity-stats">
                  <div class="student-score" data-activity-id="${activity.id}">
                    <div class="score-value">-/${activity.max_score || 0}</div>
                    <div class="score-label">Score</div>
                  </div>
                  <button class="btn-start" ${isLocked || isClosed ? 'disabled' : ''} onclick="startStudentActivity(${activity.id})" style="background: ${isLocked || isClosed ? '#9ca3af' : '#1d9b3e'}; color: white; border: none; border-radius: 6px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: ${isLocked || isClosed ? 'not-allowed' : 'pointer'};">
                    <i class="fas ${isLocked ? 'fa-lock' : isClosed ? 'fa-clock' : 'fa-play'}"></i> ${isLocked ? 'Locked' : isClosed ? 'Closed' : 'Start'}
                  </button>
                </div>
              </div>
            `;
          } else {
            // Teacher format - check for locked state using availability status from API
            const availability = activity.availability || { 
              available: false, 
              status: (!activity.start_at || activity.start_at === 'null' || activity.start_at === '' || activity.start_at === null || activity.start_at === undefined) ? 'locked' : 'open', 
              reason: 'Activity status'
            };
            const isLocked = availability.status === 'locked' || !availability.available;
            console.log(`👨‍🏫 loadTopicContent: Activity ${activity.id} isLocked:`, isLocked, 'start_at:', activity.start_at, 'availability:', availability);
            
            const teacherStatusBadge = isLocked ? 
              '<span class="activity-status-badge badge-locked"><i class="fas fa-lock"></i> Locked</span>' :
              '<span class="activity-status-badge badge-open"><i class="fas fa-check-circle"></i> Open</span>';
            
            // Determine activity status (closed/open) - Functional check
            let activityStatus = 'Open';
            let activityStatusTime = '00:00';
            const maxScore = activity.max_score || 0;
            if (activity.due_at && activity.start_at) {
              // Parse dates with Manila timezone
              let dueDateFixed = activity.due_at;
              if (dueDateFixed && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dueDateFixed)) {
                dueDateFixed = dueDateFixed.replace(' ', 'T') + '+08:00';
              }
              const dueDateObj = new Date(dueDateFixed);
              const now = new Date();
              
              if (now > dueDateObj) {
                activityStatus = 'Closed';
                // Show the time when it closed (due date time)
                const hours = String(dueDateObj.getHours()).padStart(2, '0');
                const minutes = String(dueDateObj.getMinutes()).padStart(2, '0');
                activityStatusTime = `${hours}:${minutes}`;
              } else {
                // Still open - show current time or "00:00"
                activityStatus = 'Open';
                activityStatusTime = '00:00';
              }
            } else if (!activity.start_at) {
              // Not yet unlocked
              activityStatus = 'Locked';
              activityStatusTime = '00:00';
            }
            
            contentHtml += `
              <div class="activity-card teacher-format ${isLocked ? 'activity-locked' : 'activity-open'}" data-activity-id="${activity.id}" data-max-score="${maxScore}">
                <div class="activity-left-border ${isLocked ? 'border-locked' : 'border-open'}"></div>
                ${teacherStatusBadge ? `<div class="activity-status-badge-top-right">${teacherStatusBadge}</div>` : ''}
                <div class="activity-content">
                  <div class="activity-header-row">
                    <div class="activity-title">${title}</div>
                  </div>
                  <div class="activity-info-grid">
                    <div class="activity-dates">
                      <div class="activity-date start">
                        <i class="fas fa-calendar-check"></i>
                        <span class="date-label">Opens:</span>
                        <span class="date-value">${startDate}</span>
                      </div>
                      <div class="activity-date end">
                        <i class="fas fa-calendar-times"></i>
                        <span class="date-label">Due:</span>
                        <span class="date-value">${dueDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="activity-stats">
                  <div class="teacher-stat-circles">
                    <div class="stat-circle avg-score" data-activity-id="${activity.id}">
                      <div class="stat-value">0/${maxScore}</div>
                      <div class="stat-label">Avg. overall score</div>
                    </div>
                    <div class="stat-circle activity-status">
                      <div class="stat-value">${activityStatusTime}</div>
                      <div class="stat-label">Activity ${activityStatus.toLowerCase()}</div>
                    </div>
                  </div>
                  ${isLocked ? 
                    `<button class="btn-unlock" onclick="unlockActivity(${activity.id}, '${escapeHtml(title)}')">
                      <i class="fas fa-unlock"></i> Unlock...
                    </button>` :
                    `<div class="activity-menu">
                      <i class="fas fa-ellipsis-v"></i>
                      <div class="activity-dropdown" style="display: none;">
                        <div class="dropdown-item" onclick="lockActivity(${activity.id}, '${escapeHtml(title)}')">
                          <i class="fas fa-lock"></i> Lock Activity
                        </div>
                        <div class="dropdown-item" onclick="handleTryAnswering(${activity.id})">
                          <i class="fas fa-play"></i> Try answering
                        </div>
                      </div>
                    </div>`
                  }
                </div>
              </div>
            `;
          }
        });
      }
      
      // If no content, show message
      if (!contentHtml) {
        contentHtml = '<div style="text-align:center;padding:20px;color:#64748b;">No content available for this topic.</div>';
      }
      
      body.innerHTML = contentHtml;
      
      // Bind event listeners
      bindTopicContentEvents(item, materials, activities);
      
      // Initialize improvements after content loads
      const userRole = (window.__USER_ROLE__ || '').toLowerCase();
      if (userRole === 'student') {
        setTimeout(function() {
          loadAllStudentScores();
          cleanupCountdownTimers();
          initializeCountdownTimers();
        }, 500);
      } else if (userRole === 'teacher' || userRole === 'coordinator') {
        setTimeout(function() {
          loadAllAvgScores();
        }, 500);
      }
      
      // Trigger activity status check after loading topic content
      setTimeout(function() {
        checkAndUpdateActivityStatuses();
      }, 1000);
      }).catch(() => {
      body.innerHTML = '<div style="color:#ef4444;">Failed to load lesson details.</div>';
    });
}

function bindTopicContentEvents(item, materials, activities) {
  // Bind topic content link - make entire row clickable
  const contentRow = item.querySelector('.topic-content-row');
  if (contentRow && materials.length > 0) {
    // Update material count if not already set
    const countSpan = contentRow.querySelector('.topic-content-count');
    if (countSpan && !countSpan.textContent) {
      const materialCount = materials.length;
      const materialText = materialCount === 1 ? 'material' : 'materials';
      countSpan.textContent = '(' + materialCount + ' ' + materialText + ')';
    }
    
    contentRow.addEventListener('click', () => {
      if (materials.length > 0) {
        const firstMaterial = materials[0];
        if (materials.length > 1) {
          if (window.showInfo) window.showInfo('Multiple Materials', 'Opening first material. ' + (materials.length - 1) + ' more available.');
        }
        openMaterialViewer(firstMaterial);
      }
    });
  }
  
  // Bind activity menu dropdowns using event delegation (same handler as main view)
  // The global event delegation handler will handle these too
  // Ensure menus have IDs for proper restoration
  setTimeout(() => {
    const menus = item.querySelectorAll('.activity-menu');
    menus.forEach(menu => {
      // Ensure each menu has a unique ID
      if (!menu.getAttribute('data-menu-id')) {
        menu.setAttribute('data-menu-id', 'menu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
      }
      // Verify dropdown exists (silent check - no console spam)
      const dropdown = menu.querySelector('.activity-dropdown');
      // No warning needed - some menus legitimately don't have dropdowns
    });
  }, 50);
  
  // Add click handlers for dropdown items
  const dropdownItems = item.querySelectorAll('.dropdown-item');
  item.querySelectorAll('.dropdown-item').forEach((dropdownItem, index) => {
    console.log(`🔍 Binding dropdown item ${index}:`, dropdownItem.textContent.trim());
    dropdownItem.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = dropdownItem.textContent.trim();
      // Helper function to find activity card with multiple fallback methods
      const findActivityCard = () => {
        let activityCard = dropdownItem.closest('.activity-card');
        let activityId = null;
        
        // Method 1: Try closest (works if dropdown is still in original parent)
        if (!activityCard) {
          // Method 2: Try finding via dropdown's stored activity ID
          const dropdown = dropdownItem.closest('.activity-dropdown');
          if (dropdown) {
            const storedActivityId = dropdown.getAttribute('data-activity-id');
            if (storedActivityId) {
              activityCard = document.querySelector(`[data-activity-id="${storedActivityId}"]`);
              activityId = storedActivityId;
              console.log('✅ Found activity card via stored ID:', storedActivityId);
            }
          }
        }
        
        // Method 3: Try finding via onclick attribute (fallback)
        if (!activityCard) {
          const onclickAttr = dropdownItem.getAttribute('onclick');
          if (onclickAttr) {
            const match = onclickAttr.match(/\((\d+)/);
            if (match && match[1]) {
              activityId = match[1];
              activityCard = document.querySelector(`[data-activity-id="${activityId}"]`);
              console.log('✅ Found activity card via onclick attribute:', activityId);
            }
          }
        }
        
        if (!activityCard) {
          console.error('❌ No activity card found for dropdown item:', dropdownItem);
          return null;
        }
        
        if (!activityId) {
          activityId = activityCard.getAttribute('data-activity-id');
        }
        
        if (!activityId) {
          console.error('❌ No data-activity-id found on activity card:', activityCard);
          return null;
        }
        
        return { activityCard, activityId };
      };
      
      const result = findActivityCard();
      if (!result) return;
      
      const { activityCard, activityId } = result;
      const activityTitle = activityCard.querySelector('.activity-title')?.textContent || 'Activity';
      
      if (text.includes('Lock Activity')) {
        if (typeof lockActivity === 'function') {
          lockActivity(activityId, activityTitle);
        } else {
          alert('Lock Activity function not available. Please refresh the page.');
        }
      } else if (text.includes('Reschedule/Set retakers')) {
        const dueDate = activityCard.querySelector('.due-date')?.textContent || 'Not set';
        
        // Show reschedule modal
        window.activityManager.showRescheduleModal(activityId, {
          title: activityTitle,
          dueDate: dueDate
        });
      } else if (text.includes('Try answering') || text.includes('Start Activity')) {
        
        console.log('🔍 Try Answering clicked for activity:', {
          activityId: activityId,
          activityTitle: activityTitle,
          element: activityCard
        });
        
        // Validate activity ID before making API call
        if (!activityId || activityId === 'undefined' || activityId === 'null') {
          console.error('🔍 DEBUG: Invalid activity ID detected:', activityId);
          alert('Error: Invalid activity ID. Please try again.');
          return;
        }
        
        // CRITICAL: For Teacher side, always use preview mode (testing only, no save)
        // This enables the "Test" button for auto-grading
        console.log('🔍 [TEACHER PREVIEW] Calling showTryAnswering with preview: true');
        window.cleanActivitySystem.showTryAnswering(activityId, activityTitle, { preview: true });
      }
      
      // SIMPLE CLOSE - Like old working version
      item.querySelectorAll('.activity-dropdown').forEach(dropdown => {
        closeActivityDropdown(dropdown);
      });
    });
  });
  
  // Close dropdowns handler is already set up globally in loadTopicsFromCourse
  // No need to add another one here
}

function showModal(title, innerHtml) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;';
  const dialog = document.createElement('div');
  dialog.style.cssText = 'background:#fff;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,0.25);width:92%;max-width:720px;';
  dialog.innerHTML = '<div style="padding:14px 16px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-weight:700;color:#0f172a;">' + title + '</div>' +
    '<button id="modalCloseBtn" style="background:none;border:none;font-size:18px;color:#64748b;cursor:pointer;">&times;</button>' +
  '</div>' +
  '<div style="padding:16px;max-height:70vh;overflow:auto;">' + innerHtml + '</div>';
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  const close = () => { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); };
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  dialog.querySelector('#modalCloseBtn').addEventListener('click', close);
}

function openMaterialsModal(materials) {
  if (!Array.isArray(materials) || !materials.length) { showModal('Materials','<div style="color:#64748b;">No materials for this lesson.</div>'); return; }
  const list = materials.map(m => {
    const label = escapeHtml(m.filename || m.url || m.type || 'file');
    const url = m.url || '#';
    return '<div style="display:flex;align-items:center;justify-content:space-between;border:1px solid #eef2f7;padding:10px 12px;border-radius:8px;margin-bottom:8px;">' +
      '<div style="display:flex;align-items:center;gap:10px;"><i class="fas fa-file" style="color:#1d9b3e;"></i><span>' + label + '</span></div>' +
      '<a href="' + url + '" target="_blank" class="chip">Open</a>' +
    '</div>';
  }).join('');
  showModal('Lesson Materials', list);
}

function openActivityModal(activity) {
  const title = escapeHtml(activity.title || 'Activity');
  const type = escapeHtml(activity.type || '');
  const instructions = escapeHtml(activity.instructions || '');
  const html = '<div style="display:flex;flex-direction:column;gap:10px;">' +
    '<div class="meta-chips"><span class="chip">' + type + '</span><span class="chip chip-muted">Preview</span></div>' +
    '<div style="white-space:pre-wrap;color:#334155;font-size:14px;">' + instructions + '</div>' +
  '</div>';
  showModal(title, html);
}

// Full-screen material viewer overlay (PDF/video/image/link)
function openMaterialViewer(material) {
  try {
    let url = (material && (material.url || material.link || material.href)) || '';
    const title = escapeHtml((material && (material.filename || material.title)) || 'Material');
    if (!url) { openMaterialsModal([material]); return; }
    // Normalize relative URL and add inline view for our download endpoint
    try {
      if (/^material_download\.php/i.test(url)) {
        url += (url.indexOf('?') === -1 ? '?' : '&') + 'view=true';
      }
      url = new URL(url, window.location.href).toString();
    } catch (_) {}

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;';
    const wrap = document.createElement('div');
    wrap.style.cssText = 'background:#fff;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,0.25);width:96%;height:90vh;display:flex;flex-direction:column;overflow:hidden;';
    let altUrl = '';
    try {
      const m = url.match(/material_download\.php\?([^#]+)/i);
      if (m) {
        const params = new URLSearchParams(m[1]);
        const f = params.get('f');
        if (f) altUrl = new URL('uploads/materials/' + f, window.location.href).toString();
      }
    } catch(_) {}
    wrap.innerHTML = ''+
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #e5e7eb;background:linear-gradient(135deg,#ffffff 0%,#f8fafc 100%);">'+
        '<div style="display:flex;align-items:center;gap:10px;">'+
          '<div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#1d9b3e,#28a745);display:flex;align-items:center;justify-content:center;color:#fff;"><i class="fas fa-file"></i></div>'+
          '<div style="font-weight:700;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:40vw;">'+ title +'</div>'+
        '</div>'+
        '<div style="display:flex;gap:8px;">'+
          '<button id="matCloseBtn" style="background:#6b7280;color:#fff;border:none;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:600;">Close</button>'+
        '</div>'+
      '</div>'+
      '<div id="matViewerBody" style="flex:1;background:#f8fafc;"></div>';
    overlay.appendChild(wrap);
    document.body.appendChild(overlay);

  // If viewing our markdown page viewer, expand to true fullscreen for a reading experience
  try {
    if (/material_page_view\.php/i.test(url)) {
      overlay.style.alignItems = 'stretch';
      overlay.style.justifyContent = 'stretch';
      wrap.style.width = '100%';
      wrap.style.height = '100vh';
      wrap.style.borderRadius = '0';
      wrap.style.boxShadow = 'none';
    }
  } catch(_) {}

    const close = () => { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); };
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    wrap.querySelector('#matCloseBtn').addEventListener('click', close);
    const esc = (e)=>{ if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } };
    document.addEventListener('keydown', esc);

    const body = wrap.querySelector('#matViewerBody');
    const lower = url.toLowerCase();
    const materialType = (material && material.type) ? material.type.toLowerCase() : '';
    const materialFilename = (material && material.filename) ? material.filename.toLowerCase() : '';
    
    console.log('🔍 URL type detection:', {
      isPdf: lower.endsWith('.pdf'),
      isVideo: lower.endsWith('.mp4') || lower.endsWith('.webm'),
      isImage: lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif'),
      isOffice: /(\.pptx?|\.docx?|\.xlsx?)$/.test(lower),
      isYouTube: /youtube\.com\/watch\?v=|youtu\.be\//.test(lower),
      isGoogleDrive: /drive\.google\.com/.test(lower),
      isGoogleDriveFolder: /drive\.google\.com\/drive\/folders\//.test(lower)
    });
    
    // Check file type by material type and filename, not just URL
    const isPdf = lower.endsWith('.pdf') || materialType === 'pdf' || materialFilename.endsWith('.pdf');
    const isVideo = lower.endsWith('.mp4') || lower.endsWith('.webm') || materialType === 'video' || materialFilename.match(/\.(mp4|webm)$/);
    const isImage = lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif') || materialFilename.match(/\.(png|jpg|jpeg|gif)$/);
    const isYouTube = /youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\//.test(lower);
    const isGoogleDrive = /drive\.google\.com/.test(lower);
    const isGoogleDriveFolder = /drive\.google\.com\/drive\/folders\//.test(lower);
    
    console.log('🔍 File type detection (FIXED):', {
      isPdf, isVideo, isImage, isYouTube, isGoogleDrive, isGoogleDriveFolder
    });

    if (isPdf) {
      const iframe = document.createElement('iframe');
      const src = (altUrl || url) + ((altUrl || url).indexOf('#') === -1 ? '#toolbar=1&navpanes=0' : '');
      iframe.src = src;
      iframe.style.cssText = 'width:100%;height:100%;border:0;background:#fff;';
      body.appendChild(iframe);
    } else if (isVideo) {
      const video = document.createElement('video');
      video.controls = true;
      video.style.cssText = 'width:100%;height:100%;background:#000;';
      const source = document.createElement('source');
      source.src = altUrl || url;
      source.type = lower.endsWith('.mp4') ? 'video/mp4' : 'video/webm';
      video.appendChild(source);
      body.appendChild(video);
    } else if (isImage) {
      body.style.display = 'flex';
      body.style.alignItems = 'center';
      body.style.justifyContent = 'center';
      body.style.background = '#fff';
      const img = document.createElement('img');
      img.src = altUrl || url;
      img.alt = title;
      img.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;display:block;';
      body.appendChild(img);
    } else if (isGoogleDriveFolder) {
      // Handle Google Drive folder links - cannot be embedded
      body.style.display = 'flex';
      body.style.alignItems = 'center';
      body.style.justifyContent = 'center';
      body.style.background = '#fff';
      const folderCard = document.createElement('div');
      folderCard.style.cssText = 'background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;max-width:520px;width:92%;text-align:center;box-shadow:0 12px 30px rgba(0,0,0,0.08)';
      folderCard.innerHTML = '<div style="font-size:42px;color:#1d9b3e;margin-bottom:10px;"><i class="fas fa-folder"></i></div>'+
        '<div style="font-weight:700;color:#0f172a;margin-bottom:6px;">Google Drive Folder</div>'+
        '<div style="color:#64748b;margin-bottom:14px;">Folders cannot be embedded directly. Please use individual file links instead.</div>'+
        '<div style="display:flex;gap:10px;justify-content:center;">'+
          '<a href="'+url+'" target="_blank" style="text-decoration:none;background:#1d9b3e;color:#fff;padding:8px 12px;border-radius:8px;font-weight:600;">Open Folder</a>'+
        '</div>';
      body.appendChild(folderCard);
    } else if (isGoogleDrive) {
      // Handle Google Drive file links by converting to embed format
      try {
        let embedUrl = '';
        
        // Extract file ID from various Google Drive URL formats
        let fileId = null;
        
        // Format 1: drive.google.com/file/d/FILE_ID/view
        let match = url.match(/drive\.google\.com\/file\/d\/([^\/\?]+)/);
        if (match && match[1]) {
          fileId = match[1];
        }
        
        // Format 2: drive.google.com/open?id=FILE_ID
        if (!fileId) {
          match = url.match(/drive\.google\.com\/open\?id=([^&\n?#]+)/);
          if (match && match[1]) {
            fileId = match[1];
          }
        }
        
        // Format 3: drive.google.com/uc?id=FILE_ID
        if (!fileId) {
          match = url.match(/drive\.google\.com\/uc\?id=([^&\n?#]+)/);
          if (match && match[1]) {
            fileId = match[1];
          }
        }
        
        if (fileId) {
          // Convert to Google Drive embed URL
          embedUrl = 'https://drive.google.com/file/d/' + fileId + '/preview';
          const iframe = document.createElement('iframe');
          iframe.src = embedUrl;
          iframe.style.cssText = 'width:100%;height:100%;border:0;background:#fff;';
          body.appendChild(iframe);
        } else {
          throw new Error('Invalid Google Drive URL - no file ID found');
        }
      } catch (e) {
        // Fallback: show error message with original link
        body.style.display = 'flex';
        body.style.alignItems = 'center';
        body.style.justifyContent = 'center';
        body.style.background = '#fff';
        const errorCard = document.createElement('div');
        errorCard.style.cssText = 'background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;max-width:520px;width:92%;text-align:center;box-shadow:0 12px 30px rgba(0,0,0,0.08)';
        errorCard.innerHTML = '<div style="font-size:42px;color:#ef4444;margin-bottom:10px;"><i class="fas fa-exclamation-triangle"></i></div>'+
          '<div style="font-weight:700;color:#0f172a;margin-bottom:6px;">Google Drive Access Issue</div>'+
          '<div style="color:#64748b;margin-bottom:14px;">Unable to embed this Google Drive file. It may be private or require special permissions.</div>'+
          '<div style="display:flex;gap:10px;justify-content:center;">'+
            '<p style="color:#64748b;font-size:14px;">Please check file permissions</p>'+
          '</div>';
        body.appendChild(errorCard);
      }
    } else if (isYouTube) {
      // Handle YouTube links by converting to embed URL
      let embedUrl = '';
      try {
        // Handle multiple YouTube URL formats
        let videoId = null;
        
        // Format 1: youtube.com/watch?v=VIDEO_ID
        let match = url.match(/youtube\.com\/watch\?v=([^&\n?#]+)/);
        if (match && match[1]) {
          videoId = match[1];
        }
        
        // Format 2: youtu.be/VIDEO_ID
        if (!videoId) {
          match = url.match(/youtu\.be\/([^&\n?#]+)/);
          if (match && match[1]) {
            videoId = match[1];
          }
        }
        
        // Format 3: youtube.com/embed/VIDEO_ID (already embed format)
        if (!videoId) {
          match = url.match(/youtube\.com\/embed\/([^&\n?#]+)/);
          if (match && match[1]) {
            videoId = match[1];
          }
        }
        
        if (videoId) {
          embedUrl = 'https://www.youtube.com/embed/' + videoId;
          } else {
          throw new Error('Invalid YouTube URL - no video ID found');
        }
      } catch (e) {
        // Fallback: show error message
        body.style.display = 'flex';
        body.style.alignItems = 'center';
        body.style.justifyContent = 'center';
        body.style.background = '#fff';
        const errorCard = document.createElement('div');
        errorCard.style.cssText = 'background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;max-width:520px;width:92%;text-align:center;box-shadow:0 12px 30px rgba(0,0,0,0.08)';
        errorCard.innerHTML = '<div style="font-size:42px;color:#ef4444;margin-bottom:10px;"><i class="fas fa-exclamation-triangle"></i></div>'+
          '<div style="font-weight:700;color:#0f172a;margin-bottom:6px;">Invalid YouTube URL</div>'+
          '<div style="color:#64748b;margin-bottom:14px;">Unable to parse YouTube video ID from the provided URL.</div>'+
          '<div style="display:flex;gap:10px;justify-content:center;">'+
            '<p style="color:#64748b;font-size:14px;">Please check the URL format</p>'+
          '</div>';
        body.appendChild(errorCard);
        return;
      }
      
      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.style.cssText = 'width:100%;height:100%;border:0;background:#fff;';
      body.appendChild(iframe);
    } else {
      // Final fallback: check if URL contains "youtube" anywhere (more aggressive detection)
      if (lower.includes('youtube') || lower.includes('youtu.be')) {
        try {
          // Try to extract video ID with more flexible regex
          let videoId = null;
          const patterns = [
            /[?&]v=([^&\n?#]+)/,  // ?v= or &v=
            /youtu\.be\/([^&\n?#]+)/,  // youtu.be/
            /youtube\.com\/embed\/([^&\n?#]+)/,  // embed format
            /youtube\.com\/watch\?.*v=([^&\n?#]+)/  // watch format
          ];
          
          for (let pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
              videoId = match[1];
              break;
            }
          }
          
          if (videoId) {
            const embedUrl = 'https://www.youtube.com/embed/' + videoId;
            const iframe = document.createElement('iframe');
            iframe.src = embedUrl;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.style.cssText = 'width:100%;height:100%;border:0;background:#fff;';
            body.appendChild(iframe);
            return;
          }
        } catch (e) {
          }
      }
      
      // Default iframe for other URLs
      const iframe = document.createElement('iframe');
      iframe.src = altUrl || url;
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.style.cssText = 'width:100%;height:100%;border:0;background:#fff;';
      body.appendChild(iframe);
    }
  } catch (_) {
    if (typeof window.showError === 'function') { window.showError('Preview error', 'Unable to open material preview.'); }
  }
}

function loadOverview() {
  const id = window.__CLASS_ID__;
  fetch('class_view_api.php?action=get_overview&id=' + encodeURIComponent(id), { credentials: 'same-origin' })
    .then(r => r.json()).then(data => {
      if (!data || !data.success) return;
      const ov = data.overview || {};
      const progress = document.getElementById('overviewProgress');
      if (progress) progress.style.width = (ov.progress_percent || 0) + '%';
      // Teaching today
      const teaching = document.getElementById('teachingToday');
      if (teaching) teaching.textContent = ov.today_title ? (ov.today_title + ' • ' + (ov.today_time || '')) : 'No lesson planned for today.';
      // Needs grading
      const needList = document.getElementById('needsGradingList');
      if (needList) {
        const arr = Array.isArray(ov.needs_grading) ? ov.needs_grading : [];
        needList.innerHTML = arr.length ? arr.map(a => `<li>${a.activity}: ${a.count} submission(s)</li>`).join('') : '<li>Nothing pending</li>';
      }
      // Unpublished
      const drafts = document.getElementById('unpublishedList');
      if (drafts) {
        const arr = Array.isArray(ov.unpublished) ? ov.unpublished : [];
        drafts.innerHTML = arr.length ? arr.map(d => `<li>${d.type}: ${d.title}</li>`).join('') : '<li>No drafts</li>';
      }
    }).catch(()=>{});
}

// Settings tab: delete class (dev only)
function deleteCurrentClass() {
  const id = window.__CLASS_ID__;
  if (!id) return;
  if (window.showConfirm) { window.showConfirm('Delete Class','Delete this class? This cannot be undone.', doDelete); return; } else { if (!confirm('Delete this class? This cannot be undone.')) return; }
  fetch('class_manage.php?action=delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    credentials: 'same-origin',
    body: 'id=' + encodeURIComponent(id)
  }).then(r => r.json()).then(data => {
    if (data && data.success) {
      if (window.showSuccess) window.showSuccess('Deleted','Class deleted'); else alert('Class deleted');
      // If inside iframe, navigate parent back to list
      if (window.top && window.top.exitEmbeddedClass) {
        window.top.exitEmbeddedClass();
      } else {
        window.location.href = 'teacher_dashboard.php?section=dashboard';
      }
    } else {
      if (typeof showError === 'function') {
        showError('Delete Failed', data.message || 'Failed to delete class');
      }
    }
  }).catch(() => {
    if (typeof showError === 'function') {
      showError('Network Error', 'Network error occurred.');
    }
  });
}

        function loadLessons() {
          const id = window.__CLASS_ID__;
          const container = document.querySelector('#tab-lessons .card');
          
          // Show loading state
          if (container) {
            container.innerHTML = '<div style="text-align:center;padding:40px;color:#6b7280;"><i class="fas fa-spinner fa-spin" style="font-size:24px;margin-bottom:16px;"></i><br>Loading lessons...</div>';
          }
          
          // Show loading notification
          if (typeof showInfo === 'function') {
            showInfo('Loading', 'Loading lessons...');
          }
  
  // Lessons workspace uses panes; we can populate modules tree later
  fetch('class_view_api.php?action=list_lessons&id=' + encodeURIComponent(id), { credentials: 'same-origin' })
    .then(r => r.json()).then(data => {
      if (!data || !data.success) { 
        if (container) {
          container.innerHTML = '<div style="text-align:center;padding:40px;color:#ef4444;"><i class="fas fa-exclamation-triangle" style="font-size:24px;margin-bottom:16px;"></i><br>Failed to load lessons.</div>';
        }
        if (typeof showError === 'function') {
          showError('Load Failed', 'Failed to load lessons.');
        }
        return; 
      }
      const list = data.lessons || [];
      const tree = document.getElementById('modulesTree');
      if (tree) {
        if (list.length === 0) {
          tree.innerHTML = '<div style="text-align:center;padding:40px;color:#6b7280;"><i class="fas fa-book-open" style="font-size:48px;margin-bottom:16px;opacity:0.5;"></i><br><h3 style="margin:0 0 8px 0;color:#374151;">No lessons yet</h3><p style="margin:0;color:#6b7280;">This class doesn\'t have any lessons yet.<br>Lessons will appear here when the coordinator adds them to the course.</p></div>';
        } else {
          tree.innerHTML = '<ul class="simple-list">' + list.map(l => `<li>${l.title}</li>`).join('') + '</ul>';
        }
      }
    }).catch(() => { 
      if (container) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#ef4444;"><i class="fas fa-exclamation-triangle" style="font-size:24px;margin-bottom:16px;"></i><br>Network error loading lessons.</div>';
      }
      if (typeof showError === 'function') {
        showError('Network Error', 'Network error loading lessons.');
      }
    });
}

function switchToTab(tab) {
  const btn = document.querySelector(`.nav-tab[data-tab="${tab}"]`);
  if (btn) btn.click();
}

function copyJoinCode() {
  const codeEl = document.getElementById('courseCode');
  const text = codeEl ? codeEl.textContent : '';
  if (!text) return;
  navigator.clipboard && navigator.clipboard.writeText(text).then(() => {
    if (window.showSuccess) window.showSuccess('Copied','Class name copied'); else alert('Class name copied');
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); if (window.showSuccess) window.showSuccess('Copied','Class name copied'); else alert('Class name copied'); } catch (e) {}
    document.body.removeChild(ta);
  });
}

// Copy actual class code from API then notify
function copyClassCode() {
  const id = window.__CLASS_ID__;
  fetch('class_view_api.php?action=get_details&id=' + encodeURIComponent(id), { credentials: 'same-origin' })
    .then(r => r.json())
    .then(data => {
      if (!data || !data.success || !data.class) return;
      const code = data.class.code || '';
      if (!code) return;
      (navigator.clipboard && navigator.clipboard.writeText(code)
        .then(() => { if (window.showSuccess) window.showSuccess('Copied','Class code copied'); })
        .catch(() => {
          const ta = document.createElement('textarea');
          ta.value = code; document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); if (window.showSuccess) window.showSuccess('Copied','Class code copied'); } catch (e) {}
          document.body.removeChild(ta);
        }));
    });
}

function hideMenu() {
  const dd = document.getElementById('navMenuDropdown');
  if (dd) dd.style.display = 'none';
}

function loadSubmissions() {
  const tbody = document.querySelector('#submissionsTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#6c757d;">Loading…</td></tr>';
  try {
    const activityId = window.__currentActivityId || 0;
    fetch('submissions_api.php?action=list_attempts&activity_id=' + encodeURIComponent(activityId) + '&limit=25', { credentials:'same-origin' })
      .then(r => r.json())
      .then(res => {
        if (!res || !res.success) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#dc3545;">Failed to load submissions</td></tr>'; return; }
        const rows = res.data || [];
        if (!rows.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#6c757d;">No submissions yet</td></tr>'; return; }
        tbody.innerHTML = rows.map(r => `
          <tr>
            <td>${(r.student_user_id||'')}</td>
            <td>${(r.activity_id||'')}</td>
            <td><span class="status-chip chip-${(r.verdict||'').toString().toLowerCase()}">${labelForStatus(r.verdict||'')}</span></td>
            <td>${(r.duration_ms!=null?r.duration_ms+' ms':'—')}</td>
            <td>${(r.score!=null?r.score:'—')}</td>
            <td>${(r.created_at||'')}</td>
          </tr>
        `).join('');
      })
      .catch(() => { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#dc3545;">Network error</td></tr>'; });
  } catch (_) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#dc3545;">Unexpected error</td></tr>';
  }
}

function labelForStatus(s) {
  switch (s) {
    case 'passed': return 'Passed';
    case 'failed': return 'Failed';
    case 'timeout': return 'Timeout';
    case 'compile_error': return 'Compile Error';
    default: return s;
  }
}

// Exercise Functions (Placeholder)
function startSelfCheck() {
  if (window.showInfo) window.showInfo('Coming Soon','Self-Check Questions coming soon!'); else alert('Self-Check Questions - Coming Soon!\n\n15 multiple choice questions covering all 7 topics');
}

function startMainQuiz() {
  if (window.showInfo) window.showInfo('Coming Soon','30-Item Quiz coming soon!'); else alert('30-Item Quiz - Coming Soon!\n\nComprehensive assessment of all module topics');
}

function startBoardRecitation() {
  if (window.showInfo) window.showInfo('Coming Soon','Board Recitation coming soon!'); else alert('Board Recitation - Coming Soon!\n\nInteractive number system conversion practice');
}

function startHardwareID() {
  if (window.showInfo) window.showInfo('Coming Soon','Hardware Identification coming soon!'); else alert('Hardware Identification - Coming Soon!\n\nIdentify and match computer hardware components');
}

function startNumberConverter() {
  if (window.showInfo) window.showInfo('Coming Soon','Number System Converter coming soon!'); else alert('Number System Converter - Coming Soon!\n\nPractice converting between different number systems');
}

function startHardwareWorksheet() {
  if (window.showInfo) window.showInfo('Coming Soon','Hardware Worksheet coming soon!'); else alert('Hardware Worksheet - Coming Soon!\n\nMatch hardware components with their functions');
}

// Expose functions globally
window.startSelfCheck = startSelfCheck;
window.startMainQuiz = startMainQuiz;
window.startBoardRecitation = startBoardRecitation;
window.startHardwareID = startHardwareID;
window.startNumberConverter = startNumberConverter;
window.startHardwareWorksheet = startHardwareWorksheet;

// STUDENT-SPECIFIC FUNCTIONS
function initializeStudentView() {
  console.log('🎓 Initializing Student View');
  
  // Wait for content to be fully loaded
  setTimeout(() => {
    console.log('🎓 Starting student view transformation');
    
    // Transform existing cards
    const activityCards = document.querySelectorAll('.activity-card');
    console.log('🎓 Found activity cards:', activityCards.length);
    activityCards.forEach(card => transformActivityCard(card));

    // Observe future cards (e.g., when expanding lessons)
    const observer = new MutationObserver(function(mutations){
      mutations.forEach(function(m){
        m.addedNodes && m.addedNodes.forEach(function(node){
          if (!(node instanceof HTMLElement)) return;
          if (node.classList && node.classList.contains('activity-card')) {
            transformActivityCard(node);
          }
          // also scan descendants
          node.querySelectorAll && node.querySelectorAll('.activity-card').forEach(function(child){
            transformActivityCard(child);
          });
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('🎓 Student view initialization complete');
  }, 2000); // Increased timeout to ensure content is loaded
}

// Transform a single activity card for student view, idempotent
function transformActivityCard(card) {
  try {
    // CRITICAL: Skip if already enhanced OR if already in student format (from loadTopicsFromCourse)
    if (!card || card.getAttribute('data-student-enhanced') === '1') return;
    if (card.classList.contains('student-format')) {
      console.log('🎓 transformActivityCard: Card already in student format, skipping transformation');
      card.setAttribute('data-student-enhanced','1');
      return;
    }
    
    const activityId = card.getAttribute('data-activity-id');
    if (!activityId) return;

    // CRITICAL: Check availability BEFORE transforming
    fetch(`class_view_api.php?action=get_activity&id=${activityId}`, { credentials: 'same-origin' })
      .then(r => r.json())
      .then(res => {
        if (!res || !res.success || !res.data) {
          console.error('❌ transformActivityCard: Failed to get activity data');
          return;
        }
        
        const activity = res.data;
        
        // Get availability status
        fetch(`class_view_api.php?action=list_topics&id=${window.__CLASS_ID__}`, { credentials: 'same-origin' })
          .then(r => r.json())
          .then(topicsRes => {
            let availability = { available: false, status: 'locked', reason: 'Activity is locked. Teacher will open it soon.' };
            
            // Find activity in topics response to get availability
            if (topicsRes && topicsRes.success && topicsRes.modules) {
              for (const module of topicsRes.modules || []) {
                for (const lesson of module.lessons || []) {
                  const foundAct = (lesson.activities || []).find(a => a.id == activityId);
                  if (foundAct && foundAct.availability) {
                    availability = foundAct.availability;
                    break;
                  }
                }
                if (availability.status !== 'locked') break;
              }
            }
            
            // Fallback: Check availability directly
            if (availability.status === 'locked' && !activity.start_at) {
              availability = { available: false, status: 'locked', reason: 'Activity is locked. Teacher will open it soon.' };
            } else if (activity.start_at) {
              const now = new Date();
              const startAt = new Date(activity.start_at);
              const dueAt = activity.due_at ? new Date(activity.due_at) : null;
              
              // CRITICAL: Require both start_at AND due_at to be set
              if (!dueAt) {
                availability = { available: false, status: 'locked', reason: 'Activity is not yet configured. Teacher needs to set the end date.' };
              } else if (now < startAt) {
                availability = { available: false, status: 'locked', reason: `Activity opens on ${startAt.toLocaleString()}` };
              } else if (now > dueAt) {
                availability = { available: false, status: 'closed', reason: `Deadline passed on ${dueAt.toLocaleString()}` };
              } else {
                availability = { available: true, status: 'open', reason: '' };
              }
            }
            
            const isAvailable = availability.available === true;
            const isLocked = availability.status === 'locked' || !isAvailable;
            const isClosed = availability.status === 'closed';
            
            console.log(`🎓 transformActivityCard: Activity ${activityId} - availability:`, availability);
            console.log(`🎓 transformActivityCard: isAvailable:`, isAvailable, 'isLocked:', isLocked, 'isClosed:', isClosed);

            // Remove teacher stats/menu if present
            const statCircles = card.querySelectorAll('.stat-circle');
            const activityMenu = card.querySelector('.activity-menu');
            statCircles.forEach(function(c){ c.remove(); });
            if (activityMenu) activityMenu.remove();

            // Ensure stats container exists
            let activityStats = card.querySelector('.activity-stats');
            if (!activityStats) {
              activityStats = document.createElement('div');
              activityStats.className = 'activity-stats';
              card.appendChild(activityStats);
            }

            // Add locked/closed classes
            if (isLocked) {
              card.classList.add('activity-locked');
              const leftBorder = card.querySelector('.activity-left-border');
              if (leftBorder) leftBorder.classList.add('border-locked');
            }
            if (isClosed) {
              card.classList.add('activity-closed');
              const leftBorder = card.querySelector('.activity-left-border');
              if (leftBorder) leftBorder.classList.add('border-closed');
            }

            // Populate score + Start button (with availability check)
            Promise.all([
              getActivityMaxPoints(activityId),
              getStudentScore(activityId)
            ]).then(async function([maxPoints, studentScore]){
              const safeMax = Number(maxPoints) > 0 ? Number(maxPoints) : 0;
              const safeScore = Math.max(0, Math.min(Number(studentScore) || 0, safeMax || Infinity));
              
              // Check if student has already submitted this activity
              let isSubmitted = false;
              try {
                const scoreResponse = await fetch(`get_student_score.php?activity_id=${activityId}`, {
                  credentials: 'same-origin'
                });
                if (scoreResponse.ok) {
                  const scoreData = await scoreResponse.json();
                  isSubmitted = scoreData.success && scoreData.attempt_id && scoreData.submitted_at;
                }
              } catch (e) {
                // If check fails, assume not submitted
                console.log('Could not check submission status:', e);
              }
              
              activityStats.innerHTML = `
                <div class="student-score">
                  <div class="score-value">${isLocked ? '-' : safeScore}/${safeMax || 0}</div>
                  <div class="score-label">Score</div>
                </div>
                ${isSubmitted ? 
                  `<button class="start-activity-btn" disabled style="position: absolute; right: 24px; top: 50%; transform: translateY(-50%); z-index: 10; background: #9ca3af !important; cursor: not-allowed;">
                    <i class="fas fa-check-circle"></i> Completed
                  </button>` :
                  isAvailable ? 
                    `<button class="start-activity-btn" onclick="startStudentActivity(${activityId})" style="position: absolute; right: 24px; top: 50%; transform: translateY(-50%); z-index: 10;">
                      <i class="fas fa-play"></i> Start
                    </button>` :
                    `<button class="start-activity-btn" disabled style="position: absolute; right: 24px; top: 50%; transform: translateY(-50%); z-index: 10;">
                      <i class="fas fa-lock"></i> ${isLocked ? 'Locked' : isClosed ? 'Closed' : 'Unavailable'}
                    </button>`
                }`;
              
              // Add status message if not available (text only, no background)
              if (!isAvailable) {
                const content = card.querySelector('.activity-content');
                if (content) {
                  const existingMsg = content.querySelector('.activity-status-message');
                  if (!existingMsg) {
                    const msgDiv = document.createElement('div');
                    msgDiv.className = 'activity-status-message';
                    msgDiv.innerHTML = `<i class="fas fa-info-circle"></i> ${availability.reason || 'Activity not available'}`;
                    content.appendChild(msgDiv);
                  }
                }
              }
              
              card.setAttribute('data-student-enhanced','1');
            }).catch(function(err){
              console.error('Error enhancing activity card', err);
              activityStats.innerHTML = `
                <div class="student-score">
                  <div class="score-value">${isLocked ? '-' : '0'}/0</div>
                  <div class="score-label">Score</div>
                </div>
                <button class="start-activity-btn" disabled style="position: absolute; right: 24px; top: 50%; transform: translateY(-50%); z-index: 10;">
                  <i class="fas fa-lock"></i> ${isLocked ? 'Locked' : isClosed ? 'Closed' : 'Unavailable'}
                </button>`;
              card.setAttribute('data-student-enhanced','1');
            });
          }).catch(err => {
            console.error('❌ transformActivityCard: Error getting topics:', err);
          });
      }).catch(err => {
        console.error('❌ transformActivityCard: Error getting activity:', err);
      });
  } catch(e) { console.error('transformActivityCard error', e); }
}

async function startStudentActivity(activityId) {
  console.log('🎯 Student starting activity:', activityId);
  
  // Check if activity exists and is available
  if (!activityId) {
    alert('Error: Activity not found');
    return;
  }
  
  // CRITICAL: Check if student has already submitted this activity
  try {
    const scoreResponse = await fetch(`get_student_score.php?activity_id=${activityId}`, {
      credentials: 'same-origin'
    });
    
    if (scoreResponse.ok) {
      const scoreData = await scoreResponse.json();
      // If student has a submitted attempt (score > 0 or attempt_id exists), prevent resubmission
      if (scoreData.success && scoreData.attempt_id && scoreData.submitted_at) {
        alert('You have already submitted this activity. You cannot submit again.');
        return;
      }
    }
  } catch (e) {
    // If check fails, continue (don't block user)
    console.log('Could not check submission status:', e);
  }
  
  // CRITICAL: Check availability before allowing start
  try {
    const classId = window.__CLASS_ID__;
    if (!classId) {
      alert('Error: Class ID not found');
      return;
    }
    
    // Fetch activity availability
    const topicsRes = await fetch(`class_view_api.php?action=list_topics&id=${encodeURIComponent(classId)}`, { credentials: 'same-origin' });
    const topicsData = await topicsRes.json();
    
    let availability = { available: false, status: 'locked', reason: 'Activity is locked. Teacher will open it soon.' };
    
    // Find activity in topics response to get availability
    if (topicsData && topicsData.success && topicsData.modules) {
      for (const module of topicsData.modules || []) {
        for (const lesson of module.lessons || []) {
          const foundAct = (lesson.activities || []).find(a => a.id == activityId);
          if (foundAct && foundAct.availability) {
            availability = foundAct.availability;
            break;
          }
        }
        if (availability.status !== 'locked') break;
      }
    }
    
    // If still locked, check activity directly
    if (availability.status === 'locked') {
      const actRes = await fetch(`class_view_api.php?action=get_activity&id=${activityId}`, { credentials: 'same-origin' });
      const actData = await actRes.json();
      
      if (actData && actData.success && actData.data) {
        const activity = actData.data;
        if (!activity.start_at) {
          alert('This activity is locked. The teacher will open it soon.');
          return;
        }
        
        // CRITICAL: Require both start_at AND due_at to be set
        if (!activity.due_at) {
          alert('This activity is not yet configured. The teacher needs to set the end date.');
          return;
        }
        
        const now = new Date();
        const startAt = new Date(activity.start_at);
        const dueAt = new Date(activity.due_at);
        
        if (now < startAt) {
          alert(`This activity opens on ${startAt.toLocaleString()}`);
          return;
        }
        
        if (now > dueAt) {
          alert(`The deadline for this activity has passed (${dueAt.toLocaleString()}).`);
          return;
        }
      }
    }
    
    // Check if activity is available
    if (!availability.available && availability.status !== 'open') {
      alert(availability.reason || 'This activity is not available.');
      return;
    }
    
    // Use the same function that teachers use for "Try answering"
    const activityCard = document.querySelector(`[data-activity-id="${activityId}"]`);
    const activityTitle = activityCard?.querySelector('.activity-title')?.textContent || 'Activity';
    
    console.log('🎯 Using cleanActivitySystem.showTryAnswering for:', { activityId, activityTitle });
    
    // Call the same function teachers use
    if (window.cleanActivitySystem && window.cleanActivitySystem.showTryAnswering) {
      // CRITICAL: For Teacher side, always use preview mode (testing only, no save)
      // Check if we're in teacher context
      const isTeacherContext = window.location.href.includes('teacher_dashboard') || document.querySelector('.teacher-badge');
      if (isTeacherContext) {
        console.log('🔍 [TEACHER PREVIEW] Calling showTryAnswering with preview: true');
        window.cleanActivitySystem.showTryAnswering(activityId, activityTitle, { preview: true });
      } else {
        // For students, use normal mode (they can submit)
        window.cleanActivitySystem.showTryAnswering(activityId, activityTitle);
      }
    } else {
      console.error('❌ cleanActivitySystem not available');
      alert('Activity system not available. Please try again.');
    }
  } catch (error) {
    console.error('❌ Error checking activity availability:', error);
    alert('Error checking activity availability. Please try again.');
  }
}

// Function to get real student score from database (from final submissions - activity_attempts)
async function getStudentScore(activityId) {
  try {
    console.log('🔍 Getting student score for activity:', activityId);
    
    // Try new endpoint first (gets score from activity_attempts - final submissions)
    try {
      const response = await fetch(`get_student_score.php?activity_id=${activityId}`, {
        credentials: 'same-origin'
      });
      
      // Check if response is JSON (not HTML redirect)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        if (response.ok) {
          const data = await response.json();
          if (data && data.success && data.score !== null && data.score !== undefined) {
            const score = Number(data.score || 0);
            console.log('🔍 Student final score (from attempts):', score);
            return isFinite(score) ? score : 0;
          }
        } else {
          // Response not OK, but still JSON - log to console only (no user notification)
          const errorData = await response.json().catch(() => ({}));
          // Silent error - just log to console for debugging
          console.log('⚠️ Score endpoint returned error (silent):', errorData.message || 'Unknown error');
        }
      } else {
        console.warn('⚠️ Score endpoint returned non-JSON response (likely HTML redirect)');
      }
    } catch (e) {
      console.log('⚠️ New score endpoint error:', e.message, '- falling back to progress endpoint');
    }
    
    // Fallback to old endpoint (gets score from activity_progress - draft storage)
    const response = await fetch(`get_activity_progress.php?activity_id=${activityId}&user_id=${window.__USER_ID__ || 0}`);
    const data = await response.json();
    
    console.log('🔍 Student progress data:', data);
    
    if (data && data.success && data.progress) {
      const score = Number(data.progress.score || 0);
      console.log('🔍 Student score (from progress):', score);
      return isFinite(score) ? score : 0;
    } else {
      console.log('🔍 No progress data found, returning 0');
      return 0;
    }
  } catch (error) {
    console.error('❌ Error getting student score:', error);
    return 0;
  }
}

// Function to compute accurate max points for an activity
async function getActivityMaxPoints(activityId) {
  try {
    // Fast path: dedicated endpoint
    const fast = await fetch('get_activity_points.php?activity_id=' + encodeURIComponent(activityId), { credentials: 'same-origin' });
    if (fast.ok) {
      const fj = await fast.json();
      if (fj && fj.success && isFinite(Number(fj.points))) {
        const v = Number(fj.points);
        if (v > 0) return v;
      }
    }
    // Fallback to full activity API
    const r = await fetch('class_view_api.php?action=get_activity&id=' + encodeURIComponent(activityId), { credentials: 'same-origin' });
    const j = await r.json();
    if (!j || !j.success || !j.activity) return 0;
    const a = j.activity;
    const type = String(a.type || '').toLowerCase();
    if (type === 'coding' || type === 'upload_based') {
      return Number(a.max_score || 0) || 0;
    }
    const questions = Array.isArray(a.questions) ? a.questions : [];
    if (questions.length) {
      return questions.reduce(function(sum, q){
        const pts = Number(q.points || 1);
        return sum + (isFinite(pts) ? pts : 0);
      }, 0);
    }
    return Number(a.max_score || 0) || 0;
  } catch (e) {
    console.error('❌ Failed to get activity max points:', e);
    // Fallback 1: look up from list_topics (has max_score)
    try {
      if (window.__CLASS_ID__) {
        const rr = await fetch('class_view_api.php?action=list_topics&id=' + encodeURIComponent(window.__CLASS_ID__), { credentials: 'same-origin' });
        const jj = await rr.json();
        if (jj && jj.success && Array.isArray(jj.modules)) {
          for (var i = 0; i < jj.modules.length; i++) {
            const lessons = Array.isArray(jj.modules[i].lessons) ? jj.modules[i].lessons : [];
            for (var k = 0; k < lessons.length; k++) {
              const acts = Array.isArray(lessons[k].activities) ? lessons[k].activities : [];
              for (var m = 0; m < acts.length; m++) {
                if (String(acts[m].id) === String(activityId)) {
                  const ms = Number(acts[m].max_score || 0);
                  if (isFinite(ms) && ms > 0) return ms;
                }
              }
            }
          }
        }
      }
    } catch(_){ }
    // Fallback 1.5: direct question points endpoint
    try {
      const qr = await fetch('scripts/show_activity_questions.php?aid=' + encodeURIComponent(activityId), { credentials: 'same-origin' });
      const rows = await qr.json();
      if (Array.isArray(rows) && rows.length) {
        const total = rows.reduce(function(sum, q){
          const pts = Number(q.points || 1);
          return sum + (isFinite(pts) ? pts : 0);
        }, 0);
        if (isFinite(total) && total > 0) return total;
      }
    } catch(_){ }
    // Fallback 2: parse from DOM (teacher stat-value like 0/10)
    try {
      const card = document.querySelector('[data-activity-id="' + activityId + '"]');
      const statVal = card && card.querySelector('.stat-value') ? card.querySelector('.stat-value').textContent : null;
      if (statVal && statVal.includes('/')) {
        const parts = statVal.split('/');
        const parsed = Number(parts[1]);
        if (isFinite(parsed) && parsed > 0) return parsed;
      }
    } catch(_){ }
    // Final fallback: 10
    return 10;
  }
}

// Make functions globally available
window.initializeStudentView = initializeStudentView;
window.startStudentActivity = startStudentActivity;
window.getStudentScore = getStudentScore;
window.getActivityMaxPoints = getActivityMaxPoints;

// Lock activity function - sets start_at to NULL
async function lockActivity(activityId, activityTitle) {
  const confirmed = await showCustomConfirm(
    `Lock "${activityTitle}"?`,
    'This will close the activity for students. They will not be able to access it until you unlock it again.',
    'Lock',
    'Cancel',
    '#ef4444'
  );
  if (!confirmed) {
    return;
  }
  
  // Get CSRF token
  const csrfToken = await getCSRFToken();
  if (!csrfToken) {
    alert('Error: Failed to get security token. Please refresh the page and try again.');
    return;
  }
  
  const formData = new FormData();
  formData.append('action', 'activity_update');
  formData.append('id', activityId);
  formData.append('start_at', ''); // Empty string = NULL in database (locks activity)
  formData.append('due_at', ''); // Also clear due_at when locking
  formData.append('csrf_token', csrfToken); // Add CSRF token
  
  fetch('course_outline_manage.php', {
    method: 'POST',
    credentials: 'same-origin',
    body: formData
  })
  .then(r => r.json())
  .then(res => {
    if (res && res.success) {
      if (typeof window.showNotification === 'function') {
        window.showNotification('success', 'Activity Locked', `"${activityTitle}" is now locked and unavailable for students.`);
      } else {
        alert(`Activity "${activityTitle}" locked successfully!`);
      }
      // Force immediate status check and reload activities
      setTimeout(() => {
        if (typeof checkAndUpdateActivityStatuses === 'function') {
          checkAndUpdateActivityStatuses();
        }
        if (typeof loadTopicsFromCourse === 'function') {
          loadTopicsFromCourse();
        } else {
          location.reload();
        }
      }, 500); // Small delay to ensure database is updated
    } else {
      alert(`Failed to lock activity: ${res?.message || 'Unknown error'}`);
    }
  })
  .catch(err => {
    console.error('Error locking activity:', err);
    alert('Error locking activity. Please try again.');
  });
}

// Unlock activity function - shows modal to set start date and due date
async function unlockActivity(activityId, activityTitle) {
  // Get current activity data to show existing dates
  let currentStartDate = '';
  let currentDueDate = '';
  
  try {
    const classId = window.__CLASS_ID__;
    if (classId) {
      const topicsRes = await fetch(`class_view_api.php?action=list_topics&id=${encodeURIComponent(classId)}`, { credentials: 'same-origin' });
      const topicsData = await topicsRes.json();
      
      if (topicsData && topicsData.success && topicsData.modules) {
        for (const module of topicsData.modules || []) {
          for (const lesson of module.lessons || []) {
            const activity = (lesson.activities || []).find(a => a.id == activityId);
            if (activity) {
              currentStartDate = activity.start_at || '';
              currentDueDate = activity.due_at || '';
              break;
            }
          }
          if (currentStartDate || currentDueDate) break;
        }
      }
    }
  } catch (error) {
    console.error('Error fetching activity data:', error);
  }
  
  // Show unlock modal with date pickers
  showUnlockModal(activityId, activityTitle, currentStartDate, currentDueDate);
}

// Show unlock modal to set start date and due date
function showUnlockModal(activityId, activityTitle, currentStartDate = '', currentDueDate = '') {
  const fontStack = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  
  // Remove existing modal if any
  const existingModal = document.getElementById('unlockActivityModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'unlockActivityModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;';
  
  // Get current Philippine time as default
  const now = new Date();
  const phFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const phParts = phFormatter.formatToParts(now);
  const phDateObj = {};
  phParts.forEach(part => {
    phDateObj[part.type] = part.value;
  });
  
  const defaultStartDate = currentStartDate 
    ? formatDateForInput(currentStartDate)
    : `${phDateObj.year}-${phDateObj.month}-${phDateObj.day}`;
  const defaultStartTime = currentStartDate 
    ? formatTimeForInput(currentStartDate)
    : `${phDateObj.hour}:${phDateObj.minute}`;
  const defaultDueDate = currentDueDate 
    ? formatDateForInput(currentDueDate)
    : '';
  const defaultDueTime = currentDueDate 
    ? formatTimeForInput(currentDueDate)
    : '';
  
  modal.innerHTML = `
    <div class="modal-card" style="background:#fff;border-radius:12px;padding:24px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 40px rgba(0,0,0,0.15);font-family:${fontStack};">
      <div class="modal-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #e5e7eb;">
        <h3 style="margin:0;color:#1f2937;font-size:20px;font-weight:700;font-family:${fontStack};">
          <i class="fas fa-unlock" style="color:#1d9b3e;margin-right:8px;"></i>
          Unlock Activity
        </h3>
        <button id="closeUnlockModal" style="background:none;border:none;font-size:20px;color:#6b7280;cursor:pointer;padding:4px;font-family:${fontStack};">&times;</button>
      </div>
      
      <div class="modal-body" style="font-family:${fontStack};">
        <div class="activity-info" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:20px;">
          <h4 style="margin:0 0 8px 0;color:#374151;font-size:16px;font-weight:600;font-family:${fontStack};">Activity: ${escapeHtml(activityTitle)}</h4>
        </div>

        <div class="start-date-section" style="margin-bottom:24px;">
          <label style="display:block;margin-bottom:8px;color:#374151;font-weight:600;font-size:14px;font-family:${fontStack};">
            <i class="fas fa-calendar-check" style="color:#1d9b3e;margin-right:6px;"></i>
            Start Date & Time (When to unlock)
          </label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <input type="date" id="unlockStartDate" value="${defaultStartDate}" style="padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;font-family:${fontStack};">
            <input type="time" id="unlockStartTime" value="${defaultStartTime}" style="padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;font-family:${fontStack};">
          </div>
        </div>

        <div class="due-date-section" style="margin-bottom:24px;">
          <label style="display:block;margin-bottom:8px;color:#374151;font-weight:600;font-size:14px;font-family:${fontStack};">
            <i class="fas fa-calendar-times" style="color:#ef4444;margin-right:6px;"></i>
            Due Date & Time (Deadline)
          </label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <input type="date" id="unlockDueDate" value="${defaultDueDate}" style="padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;font-family:${fontStack};">
            <input type="time" id="unlockDueTime" value="${defaultDueTime}" style="padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;font-family:${fontStack};">
          </div>
          <p style="margin:8px 0 0 0;color:#6b7280;font-size:12px;font-family:${fontStack};">
            <i class="fas fa-info-circle" style="margin-right:4px;"></i>
            Both start date and due date are required for students to access this activity.
          </p>
        </div>
      </div>

      <div class="modal-footer" style="display:flex;gap:12px;justify-content:flex-end;padding-top:16px;border-top:1px solid #e5e7eb;">
        <button id="cancelUnlock" style="background:#f3f4f6;color:#374151;border:1px solid #d1d5db;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;font-family:${fontStack};">Cancel</button>
        <button id="saveUnlock" style="background:#1d9b3e;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;font-family:${fontStack};">
          <i class="fas fa-unlock" style="margin-right:6px;"></i>
          Unlock Activity
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Bind events
  document.getElementById('closeUnlockModal').addEventListener('click', () => modal.remove());
  document.getElementById('cancelUnlock').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  
  document.getElementById('saveUnlock').addEventListener('click', async () => {
    await saveUnlockActivity(activityId, activityTitle, modal);
  });
}

// Helper function to format date for input
function formatDateForInput(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper function to format time for input
function formatTimeForInput(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Save unlock activity with start and due dates
async function saveUnlockActivity(activityId, activityTitle, modal) {
  const startDate = document.getElementById('unlockStartDate').value;
  const startTime = document.getElementById('unlockStartTime').value;
  const dueDate = document.getElementById('unlockDueDate').value;
  const dueTime = document.getElementById('unlockDueTime').value;
  
  if (!startDate) {
    if (typeof window.showNotification === 'function') {
      window.showNotification('error', 'Error', 'Please select a start date.');
    } else {
      alert('Please select a start date.');
    }
    return;
  }
  
  if (!dueDate) {
    if (typeof window.showNotification === 'function') {
      window.showNotification('error', 'Error', 'Please select a due date. Both dates are required.');
    } else {
      alert('Please select a due date. Both dates are required.');
    }
    return;
  }
  
  try {
    const saveBtn = document.getElementById('saveUnlock');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:6px;"></i>Saving...';
    saveBtn.disabled = true;
    
    // Combine date and time into proper format (YYYY-MM-DD HH:MM:SS)
    const startDateTime = startTime 
      ? `${startDate} ${startTime}:00`
      : `${startDate} 00:00:00`;
    
    const dueDateTime = dueTime 
      ? `${dueDate} ${dueTime}:00`
      : `${dueDate} 23:59:59`;
    
    // Get CSRF token
    let csrfToken;
    if (typeof window.getCSRFToken === 'function') {
      csrfToken = await window.getCSRFToken();
    } else {
      const res = await fetch('course_outline_manage.php?action=get_csrf_token', { credentials: 'same-origin' });
      const data = await res.json();
      csrfToken = data.token || null;
    }
    if (!csrfToken) {
      if (typeof window.showNotification === 'function') {
        window.showNotification('error', 'Error', 'Failed to get security token. Please refresh the page and try again.');
      } else {
        alert('Error: Failed to get security token. Please refresh the page and try again.');
      }
      saveBtn.innerHTML = originalText;
      saveBtn.disabled = false;
      return;
    }
    
    // Update both start_at and due_at
    const formData = new FormData();
    formData.append('action', 'activity_update');
    formData.append('id', activityId);
    formData.append('start_at', startDateTime);
    formData.append('due_at', dueDateTime);
    formData.append('csrf_token', csrfToken);
    
    const response = await fetch('course_outline_manage.php', {
      method: 'POST',
      credentials: 'same-origin',
      body: formData
    });
    
    const result = await response.json();
    
    if (result && result.success) {
      if (typeof window.showNotification === 'function') {
        window.showNotification('success', 'Success', `"${activityTitle}" has been unlocked with the selected dates.`);
      } else {
        alert(`Activity "${activityTitle}" unlocked successfully!`);
      }
      modal.remove();
      
      // Preserve expanded topics before reloading
      const expandedTopics = new Set();
      document.querySelectorAll('.topic-item').forEach(topic => {
        const body = topic.querySelector('.topic-body');
        if (body && body.style.display !== 'none' && body.innerHTML.trim() !== '') {
          const topicId = topic.getAttribute('data-topic-id') || topic.getAttribute('data-lesson-id');
          if (topicId) {
            expandedTopics.add(topicId);
          }
        }
      });
      
      // Force immediate status check and update only the specific activity card
      setTimeout(() => {
        if (typeof checkAndUpdateActivityStatuses === 'function') {
          checkAndUpdateActivityStatuses();
        }
        
        // Try to update just the specific activity card instead of reloading everything
        const activityCard = document.querySelector(`[data-activity-id="${activityId}"]`);
        if (activityCard) {
          // Fetch fresh activity data and update just this card
          const classId = window.__CLASS_ID__;
          if (classId) {
            fetch(`class_view_api.php?action=list_topics&id=${encodeURIComponent(classId)}`, { credentials: 'same-origin' })
              .then(r => r.json())
              .then(res => {
                if (res && res.success && res.modules) {
                  // Find the updated activity data
                  for (const module of res.modules || []) {
                    for (const lesson of module.lessons || []) {
                      const activity = (lesson.activities || []).find(a => a.id == activityId);
                      if (activity) {
                        // Update just this activity card
                        const availability = activity.availability || {};
                        const newStatus = {
                          status: availability.status || 'locked',
                          startAt: activity.start_at || null,
                          dueAt: activity.due_at || null
                        };
                        if (typeof updateActivityCardStatus === 'function') {
                          updateActivityCardStatus(activityCard, newStatus);
                        }
                        break;
                      }
                    }
                  }
                }
              })
              .catch(err => {
                console.error('Error updating activity card:', err);
                // Fallback to full reload if update fails
                if (typeof loadTopicsFromCourse === 'function') {
                  loadTopicsFromCourse();
                  // Restore expanded topics after reload (wait for DOM to update)
                  setTimeout(() => {
                    expandedTopics.forEach(topicId => {
                      const topic = document.querySelector(`[data-topic-id="${topicId}"], [data-lesson-id="${topicId}"]`);
                      if (topic) {
                        const header = topic.querySelector('.topic-header');
                        if (header) header.click();
                      }
                    });
                  }, 1000);
                }
              });
          }
        } else {
          // If card not found, do full reload but preserve expanded state
          if (typeof loadTopicsFromCourse === 'function') {
            loadTopicsFromCourse();
            // Restore expanded topics after reload (wait for DOM to update)
            setTimeout(() => {
              expandedTopics.forEach(topicId => {
                const topic = document.querySelector(`[data-topic-id="${topicId}"], [data-lesson-id="${topicId}"]`);
                if (topic) {
                  const header = topic.querySelector('.topic-header');
                  if (header) header.click();
                }
              });
            }, 1000);
          } else {
            location.reload();
          }
        }
      }, 500); // Small delay to ensure database is updated
    } else {
      throw new Error(result?.message || 'Failed to unlock activity');
    }
  } catch (error) {
    console.error('Error unlocking activity:', error);
    if (typeof window.showNotification === 'function') {
      window.showNotification('error', 'Error', error.message || 'Failed to unlock activity. Please try again.');
    } else {
      alert(error.message || 'Error unlocking activity. Please try again.');
    }
    
    const saveBtn = document.getElementById('saveUnlock');
    saveBtn.innerHTML = '<i class="fas fa-unlock" style="margin-right:6px;"></i>Unlock Activity';
    saveBtn.disabled = false;
  }
}

// View activity items
function viewActivityItems(activityId) {
  // Redirect to activity view or open modal
  if (typeof window.cleanActivitySystem !== 'undefined' && window.cleanActivitySystem.showTryAnswering) {
    // CRITICAL: For Teacher side, always use preview mode (testing only, no save)
    console.log('🔍 [TEACHER PREVIEW] Calling showTryAnswering with preview: true');
    window.cleanActivitySystem.showTryAnswering(activityId, 'Activity', { preview: true });
  } else {
    console.log('View items for activity:', activityId);
  }
}

// Handle reschedule
function handleReschedule(activityId) {
  const activityCard = document.querySelector(`[data-activity-id="${activityId}"]`);
  if (!activityCard) return;
  const activityTitle = activityCard.querySelector('.activity-title')?.textContent || 'Activity';
  
  if (window.activityManager && typeof window.activityManager.showRescheduleModal === 'function') {
    window.activityManager.showRescheduleModal(activityId, { title: activityTitle });
  } else {
    console.log('Reschedule activity:', activityId);
  }
}

// Handle try answering
function handleTryAnswering(activityId) {
  if (typeof window.cleanActivitySystem !== 'undefined' && window.cleanActivitySystem.showTryAnswering) {
    const activityCard = document.querySelector(`[data-activity-id="${activityId}"]`);
    const activityTitle = activityCard?.querySelector('.activity-title')?.textContent || 'Activity';
    window.cleanActivitySystem.showTryAnswering(activityId, activityTitle);
  } else {
    console.log('Try answering activity:', activityId);
  }
}

// Toggle activity menu dropdown - DEPRECATED: Use event delegation instead
// This function is kept for backward compatibility but should not be used
function toggleActivityMenu(icon) {
  console.warn('⚠️ toggleActivityMenu is deprecated. Use event delegation instead.');
  // Do nothing - let event delegation handle it
  return;
}

// CSRF token helper functions
async function getCSRFToken() {
  try {
    const fd = new FormData();
    fd.append('action', 'get_csrf_token');
    const response = await fetch('course_outline_manage.php', {
      method: 'POST',
      body: fd,
      credentials: 'same-origin'
    });
    const data = await response.json();
    if (data.success && data.token) {
      return data.token;
    }
  } catch (e) {
    console.error('Error fetching CSRF token:', e);
  }
  return null;
}

async function addCSRFToken(formData) {
  const token = await getCSRFToken();
  if (token) {
    formData.append('csrf_token', token);
    console.log('✅ CSRF token added to FormData');
  } else {
    console.warn('⚠️ Failed to get CSRF token');
  }
  return formData;
}

// Lock all activities for the current class
async function lockAllActivities() {
  const confirmed = await showCustomConfirm(
    'Lock ALL Activities?',
    'This will close all unlocked activities for students immediately.\n\nStudents will not be able to access them until you unlock them again.',
    'Lock All',
    'Cancel',
    '#ef4444'
  );
  if (!confirmed) {
    return;
  }
  
  const classId = window.__CLASS_ID__;
  if (!classId) {
    alert('Error: Class ID not found');
    return;
  }
  
  // Show loading notification
  if (typeof window.showNotification === 'function') {
    window.showNotification('info', 'Locking Activities', 'Please wait while we lock all activities...');
  }
  
  try {
    // Get all activities for this class
    const topicsRes = await fetch(`class_view_api.php?action=list_topics&id=${encodeURIComponent(classId)}`, { credentials: 'same-origin' });
    const res = await topicsRes.json();
    
    if (!res || !res.success || !res.modules) {
      alert('Failed to load activities. Please try again.');
      return;
    }
    
    // Collect all unlocked activities (have start_at)
    const unlockedActivities = [];
    res.modules.forEach(module => {
      (module.lessons || []).forEach(lesson => {
        (lesson.activities || []).forEach(activity => {
          // Check if activity is unlocked (has start_at)
          if (activity.start_at && activity.start_at !== null && activity.start_at !== 'null' && activity.start_at !== '') {
            unlockedActivities.push({
              id: activity.id,
              title: activity.title || 'Untitled Activity'
            });
          }
        });
      });
    });
    
    if (unlockedActivities.length === 0) {
      if (typeof window.showNotification === 'function') {
        window.showNotification('info', 'No Unlocked Activities', 'All activities are already locked.');
      } else {
        alert('All activities are already locked.');
      }
      return;
    }
    
    // Get CSRF token once for all requests
    console.log('🔐 Fetching CSRF token...');
    const csrfToken = await getCSRFToken();
    if (!csrfToken) {
      alert('Error: Failed to get security token. Please refresh the page and try again.');
      return;
    }
    console.log('✅ CSRF token obtained');
    
    // Lock all activities
    const lockPromises = unlockedActivities.map(async activity => {
      const formData = new FormData();
      formData.append('action', 'activity_update');
      formData.append('id', activity.id);
      formData.append('start_at', ''); // Empty string = NULL in database
      formData.append('csrf_token', csrfToken); // Add CSRF token
      
      console.log(`🔒 Locking activity ${activity.id}: "${activity.title}"`);
      
      try {
        const r = await fetch('course_outline_manage.php', {
          method: 'POST',
          credentials: 'same-origin',
          body: formData
        });
        
        if (!r.ok) {
          console.error(`❌ HTTP error for activity ${activity.id}:`, r.status, r.statusText);
          return { success: false, activity, error: `HTTP ${r.status}: ${r.statusText}` };
        }
        
        const response = await r.json();
        if (!response || !response.success) {
          console.error(`❌ Failed to lock activity ${activity.id}:`, response);
          return { success: false, activity, error: response?.message || 'Unknown error' };
        }
        
        console.log(`✅ Successfully locked activity ${activity.id}: "${activity.title}"`);
        return { success: true, activity };
      } catch (err) {
        console.error(`❌ Exception locking activity ${activity.id}:`, err);
        return { success: false, activity, error: err.message || 'Network error' };
      }
    });
    
    // Wait for all locks to complete
    const results = await Promise.all(lockPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success);
    
    // Log detailed error information
    if (failed.length > 0) {
      console.error('❌ Failed locks:', failed);
      failed.forEach(f => {
        console.error(`  - Activity ${f.activity.id} ("${f.activity.title}"): ${f.error || 'Unknown error'}`);
      });
    }
    
    if (typeof window.showNotification === 'function') {
      if (failed.length === 0) {
        window.showNotification('success', 'All Activities Locked', `Successfully locked ${successful} ${successful === 1 ? 'activity' : 'activities'}.`);
      } else {
        window.showNotification('warning', 'Partial Success', 
          `Locked ${successful} ${successful === 1 ? 'activity' : 'activities'}, but ${failed.length} ${failed.length === 1 ? 'failed' : 'failed'}.\n\nCheck console for details.`);
      }
    } else {
      alert(`Locked ${successful} ${successful === 1 ? 'activity' : 'activities'}${failed.length > 0 ? ` (${failed.length} failed - check console for details)` : ''}.`);
    }
    
    // Reload activities
    if (typeof loadTopicsFromCourse === 'function') {
      loadTopicsFromCourse();
    } else {
      location.reload();
    }
  } catch (err) {
    console.error('❌ Error in lockAllActivities:', err);
    if (typeof window.showNotification === 'function') {
      window.showNotification('error', 'Lock Failed', 'An error occurred while locking activities. Please try again.');
    } else {
      alert('Error locking activities. Please try again.');
    }
  }
}

// Unlock all activities for the current class (for testing purposes)
async function unlockAllActivities() {
  const confirmed = await showCustomConfirm(
    'Unlock ALL Activities?',
    'This will open all locked activities for students immediately.\n\nThis is useful for testing purposes.',
    'Unlock All',
    'Cancel',
    '#1d9b3e'
  );
  if (!confirmed) {
    return;
  }
  
  const classId = window.__CLASS_ID__;
  if (!classId) {
    alert('Error: Class ID not found');
    return;
  }
  
  // Show loading notification
  if (typeof window.showNotification === 'function') {
    window.showNotification('info', 'Unlocking Activities', 'Please wait while we unlock all activities...');
  }
  
  try {
    // Get all activities for this class
    const topicsRes = await fetch(`class_view_api.php?action=list_topics&id=${encodeURIComponent(classId)}`, { credentials: 'same-origin' });
    const res = await topicsRes.json();
    
    if (!res || !res.success || !res.modules) {
      alert('Failed to load activities. Please try again.');
      return;
    }
    
    // Collect all locked activities
    const lockedActivities = [];
    res.modules.forEach(module => {
      (module.lessons || []).forEach(lesson => {
        (lesson.activities || []).forEach(activity => {
          // Check if activity is locked (no start_at)
          if (!activity.start_at || activity.start_at === null || activity.start_at === 'null' || activity.start_at === '') {
            lockedActivities.push({
              id: activity.id,
              title: activity.title || 'Untitled Activity'
            });
          }
        });
      });
    });
    
    if (lockedActivities.length === 0) {
      if (typeof window.showNotification === 'function') {
        window.showNotification('info', 'No Locked Activities', 'All activities are already unlocked.');
      } else {
        alert('All activities are already unlocked.');
      }
      return;
    }
    
    // Set start_at to current time in Philippine timezone (UTC+8)
    const now = new Date();
    // Get Philippine time components using Intl.DateTimeFormat
    const phFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const phParts = phFormatter.formatToParts(now);
    const phDateObj = {};
    phParts.forEach(part => {
      phDateObj[part.type] = part.value;
    });
    
    // Format as YYYY-MM-DD HH:mm:ss for database (Philippine time)
    const startAt = `${phDateObj.year}-${phDateObj.month}-${phDateObj.day} ${phDateObj.hour}:${phDateObj.minute}:00`;
    
    // Set due_at to 7 days from now (default deadline)
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 7); // Add 7 days
    const duePhFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const duePhParts = duePhFormatter.formatToParts(dueDate);
    const duePhDateObj = {};
    duePhParts.forEach(part => {
      duePhDateObj[part.type] = part.value;
    });
    const dueAt = `${duePhDateObj.year}-${duePhDateObj.month}-${duePhDateObj.day} ${duePhDateObj.hour}:${duePhDateObj.minute}:00`;
    
    // Get CSRF token once for all requests
    console.log('🔐 Fetching CSRF token...');
    const csrfToken = await getCSRFToken();
    if (!csrfToken) {
      alert('Error: Failed to get security token. Please refresh the page and try again.');
      return;
    }
    console.log('✅ CSRF token obtained');
    
    // Unlock all activities
    const unlockPromises = lockedActivities.map(async activity => {
      const formData = new FormData();
      formData.append('action', 'activity_update');
      formData.append('id', activity.id);
      formData.append('start_at', startAt);
      formData.append('due_at', dueAt); // CRITICAL: Also set due_at (7 days from now)
      formData.append('csrf_token', csrfToken); // Add CSRF token
      
      console.log(`🔓 Unlocking activity ${activity.id}: "${activity.title}"`);
      
      try {
        const r = await fetch('course_outline_manage.php', {
          method: 'POST',
          credentials: 'same-origin',
          body: formData
        });
        
        if (!r.ok) {
          console.error(`❌ HTTP error for activity ${activity.id}:`, r.status, r.statusText);
          return { success: false, activity, error: `HTTP ${r.status}: ${r.statusText}` };
        }
        
        const response = await r.json();
        if (!response || !response.success) {
          console.error(`❌ Failed to unlock activity ${activity.id}:`, response);
          return { success: false, activity, error: response?.message || 'Unknown error' };
        }
        
        console.log(`✅ Successfully unlocked activity ${activity.id}: "${activity.title}"`);
        return { success: true, activity };
      } catch (err) {
        console.error(`❌ Exception unlocking activity ${activity.id}:`, err);
        return { success: false, activity, error: err.message || 'Network error' };
      }
    });
    
    // Wait for all unlocks to complete
    const results = await Promise.all(unlockPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success);
    
    // Log detailed error information
    if (failed.length > 0) {
      console.error('❌ Failed unlocks:', failed);
      failed.forEach(f => {
        console.error(`  - Activity ${f.activity.id} ("${f.activity.title}"): ${f.error || 'Unknown error'}`);
      });
    }
    
    if (typeof window.showNotification === 'function') {
      if (failed.length === 0) {
        window.showNotification('success', 'All Activities Unlocked', `Successfully unlocked ${successful} ${successful === 1 ? 'activity' : 'activities'}.`);
      } else {
        const errorDetails = failed.length <= 3 
          ? failed.map(f => `"${f.activity.title}"`).join(', ')
          : `${failed.length} activities`;
        window.showNotification('warning', 'Partial Success', 
          `Unlocked ${successful} ${successful === 1 ? 'activity' : 'activities'}, but ${failed.length} ${failed.length === 1 ? 'failed' : 'failed'}.\n\nCheck console for details.`);
      }
    } else {
      alert(`Unlocked ${successful} ${successful === 1 ? 'activity' : 'activities'}${failed.length > 0 ? ` (${failed.length} failed - check console for details)` : ''}.`);
    }
    
    // Reload activities
    if (typeof loadTopicsFromCourse === 'function') {
      loadTopicsFromCourse();
    } else {
      location.reload();
    }
  } catch (err) {
    console.error('❌ Error in unlockAllActivities:', err);
    if (typeof window.showNotification === 'function') {
      window.showNotification('error', 'Unlock Failed', 'An error occurred while unlocking activities. Please try again.');
    } else {
      alert('Error unlocking activities. Please try again.');
    }
  }
}

// Make functions globally available
window.lockActivity = lockActivity;

// ===== TEACHER PREVIEW AUTO-GRADING FUNCTION (Same as Coordinator side) =====
// This function is called when Teacher clicks "Test" button in preview mode
// IMPORTANT: This is for testing/preview only. Scores are calculated and displayed but NOT saved to database.
window.testPreviewActivityTeacher = function(activityType) {
  console.log('🔍 [TEACHER TEST PREVIEW] Testing activity:', activityType);
  
  // Essay and Upload-based activities require manual grading by teacher
  if (activityType === 'essay' || activityType === 'upload_based') {
    alert('This activity type requires manual grading by the teacher. Auto-grading is not available for Essay and Upload-based activities.');
    return;
  }
  
  // Get activity data from activityTester (Teacher side uses activityTester.currentActivity)
  const activityTester = window.activityTester;
  if (!activityTester || !activityTester.currentActivity) {
    alert('Activity data not found. Please try again.');
    return;
  }
  
  const activity = activityTester.currentActivity;
  const questions = activity.questions || activity.question || [];
  
  if (questions.length === 0) {
    alert('No questions found in this activity.');
    return;
  }
  
  // Collect student answers from DOM (same as Coordinator side)
  const studentAnswers = {};
  const questionElements = document.querySelectorAll('[id^="question-"]');
  
  console.log('🔍 [TEACHER TEST PREVIEW] Found question elements:', questionElements.length);
  console.log('🔍 [TEACHER TEST PREVIEW] Questions from activity:', questions.length);
  
  questionElements.forEach((questionEl, index) => {
    const question = questions[index];
    if (!question) {
      console.log(`🔍 [TEACHER TEST PREVIEW] ⚠️ No question data for index ${index}`);
      return;
    }
    
    console.log(`🔍 [TEACHER TEST PREVIEW] Processing question ${index + 1}:`, {
      questionId: question.id || question._id,
      questionText: question.question_text || question.text,
      activityType: activityType
    });
    
    if (activityType === 'multiple_choice') {
      // Get selected radio button
      const selectedRadio = questionEl.querySelector('input[type="radio"]:checked');
      if (selectedRadio) {
        studentAnswers[index] = selectedRadio.value; // choice ID
        console.log(`🔍 [TEACHER TEST PREVIEW] ✅ Found answer for question ${index + 1}:`, selectedRadio.value);
      } else {
        console.log(`🔍 [TEACHER TEST PREVIEW] ⚠️ No answer selected for question ${index + 1}`);
      }
    } else if (activityType === 'true_false') {
      // Get selected radio button (true/false)
      const selectedRadio = questionEl.querySelector('input[type="radio"]:checked');
      if (selectedRadio) {
        studentAnswers[index] = selectedRadio.value; // "true" or "false"
        console.log(`🔍 [TEACHER TEST PREVIEW] ✅ Found answer for question ${index + 1}:`, selectedRadio.value);
      } else {
        console.log(`🔍 [TEACHER TEST PREVIEW] ⚠️ No answer selected for question ${index + 1}`);
      }
    } else if (activityType === 'identification') {
      // Get text input value
      const textInput = questionEl.querySelector('input[type="text"]');
      if (textInput && textInput.value.trim()) {
        studentAnswers[index] = textInput.value.trim();
        console.log(`🔍 [TEACHER TEST PREVIEW] ✅ Found answer for question ${index + 1}:`, textInput.value);
      } else {
        console.log(`🔍 [TEACHER TEST PREVIEW] ⚠️ No answer entered for question ${index + 1}`);
      }
    }
  });
  
  console.log('🔍 [TEACHER TEST PREVIEW] Collected student answers:', studentAnswers);
  const answeredCount = Object.keys(studentAnswers).length;
  console.log('🔍 [TEACHER TEST PREVIEW] Answered count:', answeredCount);
  
  if (answeredCount === 0) {
    console.error('🔍 [TEACHER TEST PREVIEW] ❌ No answers found!');
    alert('Please answer at least one question before testing.');
    return;
  }
  
  // Set loading state
  const testBtn = document.getElementById('preview-test-btn');
  if (testBtn) {
    testBtn.disabled = true;
    testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
  }
  
  // Grade the answers (SAME LOGIC AS COORDINATOR SIDE)
  let totalScore = 0;
  let maxScore = 0;
  const results = [];
  
  questions.forEach((question, index) => {
    const points = parseFloat(question.points || 1);
    maxScore += points;
    
    const studentAnswer = studentAnswers[index];
    let isCorrect = false;
    let earnedPoints = 0;
    let correctAnswer = '';
    let explanation = '';
    
    let studentAnswerDisplay = studentAnswer || '(No answer)'; // For display
    
    if (activityType === 'multiple_choice') {
      // Check if selected choice is correct
      const choices = question.choices || [];
      const selectedChoiceId = studentAnswer;
      
      const selectedChoice = choices.find(c => String(c.id) === String(selectedChoiceId));
      const correctChoice = choices.find(c => !!c.is_correct);
      
      // Get the actual choice text for display
      if (selectedChoice) {
        studentAnswerDisplay = selectedChoice.choice_text || selectedChoice.text || `Choice ${selectedChoiceId}`;
      } else {
        studentAnswerDisplay = '(No answer)';
      }
      
      if (correctChoice) {
        correctAnswer = correctChoice.choice_text || correctChoice.text || '';
      }
      
      if (selectedChoice && selectedChoice.is_correct) {
        isCorrect = true;
        earnedPoints = points;
      }
      
      explanation = question.explanation || '';
    } else if (activityType === 'true_false') {
      // Check if answer matches correct choice
      const choices = question.choices || [];
      const studentValue = studentAnswer ? String(studentAnswer).toLowerCase().trim() : '';
      
      // Display "True" or "False" instead of "true" or "false"
      studentAnswerDisplay = studentValue === 'true' ? 'True' : (studentValue === 'false' ? 'False' : '(No answer)');
      
      // Find correct choice - check both is_correct flag and correct flag
      let correctChoice = choices.find(c => {
        const isCorrect = !!c.is_correct || !!c.correct || c.is_correct === 1 || c.correct === 1 || c.is_correct === '1' || c.correct === '1';
        return isCorrect;
      });
      
      // If no choice marked as correct, try to find by choice_text
      if (!correctChoice && choices.length > 0) {
        correctChoice = choices.find(c => {
          const choiceText = String(c.choice_text || c.text || '').toLowerCase().trim();
          return choiceText === 'true' || choiceText === 'false';
        });
      }
      
      if (correctChoice) {
        let correctValue = String(correctChoice.choice_text || correctChoice.text || '').toLowerCase().trim();
        
        if (!correctValue || correctValue === '') {
          const correctIndex = choices.indexOf(correctChoice);
          correctValue = correctIndex === 0 ? 'true' : 'false';
        }
        
        // Normalize to "true" or "false"
        if (correctValue === 'true' || correctValue === '1') {
          correctValue = 'true';
          correctAnswer = 'True';
        } else if (correctValue === 'false' || correctValue === '0') {
          correctValue = 'false';
          correctAnswer = 'False';
        } else {
          const choiceText = correctChoice.choice_text || correctChoice.text || '';
          correctAnswer = choiceText ? (choiceText.charAt(0).toUpperCase() + choiceText.slice(1).toLowerCase()) : 'N/A';
          correctValue = String(choiceText).toLowerCase().trim();
        }
        
        // Compare student answer with correct answer
        if (studentValue && (studentValue === correctValue || studentValue === String(correctValue))) {
          isCorrect = true;
          earnedPoints = points;
        }
      } else {
        // Fallback: check question.answer field
        if (question.answer) {
          const answerValue = String(question.answer).toLowerCase().trim();
          correctAnswer = answerValue === 'true' ? 'True' : 'False';
          if (studentValue === answerValue) {
            isCorrect = true;
            earnedPoints = points;
          }
        } else {
          correctAnswer = 'N/A';
        }
      }
      
      explanation = question.explanation || '';
    } else if (activityType === 'identification') {
      // Check against correct answer (supports multiple acceptable answers)
      const studentValue = String(studentAnswer || '').trim().toLowerCase();
      
      // Get acceptable answers - check multiple sources
      const acceptableAnswers = [];
      
      // PRIORITY 1: Check choices with is_correct flag
      const choices = question.choices || [];
      if (choices.length > 0) {
        const correctChoices = choices.filter(c => {
          const isCorrect = !!c.is_correct || !!c.correct || c.is_correct === 1 || c.correct === 1 || c.is_correct === '1' || c.correct === '1';
          return isCorrect;
        });
        
        correctChoices.forEach(c => {
          const choiceText = String(c.choice_text || c.text || '').trim();
          if (choiceText) {
            const normalized = choiceText.toLowerCase();
            if (!acceptableAnswers.includes(normalized)) {
              acceptableAnswers.push(normalized);
            }
          }
        });
      }
      
      // PRIORITY 2: Check explanation (JSON format with primary/alternatives)
      if (question.explanation) {
        try {
          const parsed = JSON.parse(question.explanation);
          if (parsed && typeof parsed === 'object' && parsed !== null) {
            if (parsed.primary && String(parsed.primary).trim()) {
              const normalized = String(parsed.primary).trim().toLowerCase();
              if (!acceptableAnswers.includes(normalized)) {
                acceptableAnswers.push(normalized);
              }
            }
            if (parsed.alternatives && Array.isArray(parsed.alternatives)) {
              parsed.alternatives.forEach(alt => {
                if (alt && String(alt).trim()) {
                  const normalizedAlt = String(alt).trim().toLowerCase();
                  if (!acceptableAnswers.includes(normalizedAlt)) {
                    acceptableAnswers.push(normalizedAlt);
                  }
                }
              });
            }
          }
        } catch(e) {
          const explanationText = String(question.explanation).trim();
          if (explanationText) {
            const normalized = explanationText.toLowerCase();
            if (!acceptableAnswers.includes(normalized)) {
              acceptableAnswers.push(normalized);
            }
          }
        }
      }
      
      // PRIORITY 3: Fallback to answer field
      if (question.answer) {
        const answerText = String(question.answer).trim();
        if (answerText) {
          const normalized = answerText.toLowerCase();
          if (!acceptableAnswers.includes(normalized)) {
            acceptableAnswers.push(normalized);
          }
        }
      }
      
      // Grade the answer
      if (acceptableAnswers.length > 0 && studentValue) {
        const primaryAnswer = acceptableAnswers[0];
        correctAnswer = primaryAnswer ? (primaryAnswer.charAt(0).toUpperCase() + primaryAnswer.slice(1)) : 'N/A';
        
        // Check if student answer matches any acceptable answer
        isCorrect = acceptableAnswers.some(acceptable => {
          const normalizedAcceptable = acceptable.toLowerCase().trim();
          const normalizedStudent = studentValue.toLowerCase().trim();
          
          // Exact match
          if (normalizedStudent === normalizedAcceptable) {
            return true;
          }
          
          // Handle common variations (remove extra spaces, punctuation)
          const cleanAcceptable = normalizedAcceptable.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
          const cleanStudent = normalizedStudent.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
          
          return cleanStudent === cleanAcceptable;
        });
        
        if (isCorrect) {
          earnedPoints = points;
        }
      } else if (studentValue) {
        correctAnswer = 'N/A';
        isCorrect = false;
        earnedPoints = 0;
      } else {
        correctAnswer = acceptableAnswers.length > 0 ? (acceptableAnswers[0].charAt(0).toUpperCase() + acceptableAnswers[0].slice(1)) : 'N/A';
      }
      
      // Get explanation (if not already used as answer)
      if (question.explanation) {
        try {
          const parsed = JSON.parse(question.explanation);
          if (parsed && typeof parsed === 'object' && parsed.explanation) {
            explanation = parsed.explanation;
          } else {
            explanation = '';
          }
        } catch(e) {
          if (!acceptableAnswers.includes(String(question.explanation).trim().toLowerCase())) {
            explanation = question.explanation;
          }
        }
      }
    }
    
    totalScore += earnedPoints;
    
    results.push({
      questionIndex: index + 1,
      questionText: question.question_text || question.text || `Question ${index + 1}`,
      studentAnswer: studentAnswerDisplay,
      correctAnswer: correctAnswer,
      isCorrect: isCorrect,
      points: points,
      earnedPoints: earnedPoints,
      explanation: explanation
    });
  });
  
  // Display results in modal (SAME MODAL AS COORDINATOR SIDE)
  const percentage = maxScore > 0 ? ((totalScore / maxScore) * 100).toFixed(1) : 0;
  const passedCount = results.filter(r => r.isCorrect).length;
  
  // Create results modal (use same HTML as Coordinator side)
  const modal = document.createElement('div');
  modal.id = 'previewTestResultsModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn 0.3s ease;';
  
  // Add smooth animations (same as Coordinator side)
  if (!document.getElementById('previewTestModalStyles')) {
    const style = document.createElement('style');
    style.id = 'previewTestModalStyles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.03); }
      }
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
      .preview-result-item {
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
      }
      .preview-result-item:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.12) !important;
      }
      .preview-result-item.correct {
        border-left: 3px solid #10b981 !important;
      }
      .preview-result-item.incorrect {
        border-left: 3px solid #ef4444 !important;
      }
      .preview-progress-bar {
        position: relative;
        overflow: hidden;
      }
      .preview-progress-bar::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: shimmer 2s infinite;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Calculate score color and styling
  const scoreColor = percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444';
  const scoreBg = percentage >= 80 ? 'rgba(16,185,129,0.08)' : percentage >= 60 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)';
  
  // Use same modal HTML as Coordinator side (copy from coordinator.js lines 11176-11295)
  // CRITICAL: Use consistent modern font stack across all sides
  const fontStack = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  modal.innerHTML = `
    <div style="background:white;border-radius:16px;max-width:850px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.15);animation:slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);font-family:${fontStack};">
      <!-- Clean Header -->
      <div style="padding:28px 32px;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;background:#ffffff;font-family:${fontStack};">
        <div>
          <h2 style="margin:0 0 4px 0;color:#1e293b;font-size:22px;font-weight:600;font-family:${fontStack};">Test Results</h2>
          <p style="margin:0;color:#64748b;font-size:13px;font-family:${fontStack};">Preview Mode • No data saved</p>
        </div>
        <button onclick="const modal = document.getElementById('previewTestResultsModal'); if(modal) { modal.style.opacity='0'; modal.style.transform='scale(0.95)'; setTimeout(() => modal.remove(), 200); } const btn = document.getElementById('preview-test-btn'); if(btn) { btn.disabled = false; btn.innerHTML = '<i class=\\'fas fa-check-circle\\'></i> Test'; }" 
                style="background:#f8fafc;border:none;font-size:20px;color:#64748b;cursor:pointer;padding:8px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:8px;transition:all 0.2s;font-family:${fontStack};" 
                onmouseover="this.style.background='#f1f5f9';this.style.color='#ef4444';" 
                onmouseout="this.style.background='#f8fafc';this.style.color='#64748b';">&times;</button>
      </div>
      
      <div style="padding:32px;font-family:${fontStack};">
        <!-- Simple Score Card -->
        <div style="background:${scoreBg};border-radius:16px;padding:32px;margin-bottom:32px;text-align:center;position:relative;overflow:hidden;animation:scaleIn 0.5s ease;font-family:${fontStack};">
          <div style="position:absolute;top:-50px;right:-50px;width:200px;height:200px;background:${scoreColor};opacity:0.05;border-radius:50%;"></div>
          <div style="position:relative;z-index:1;">
            <div style="font-size:64px;font-weight:700;color:${scoreColor};margin-bottom:8px;line-height:1;font-family:${fontStack};">
              ${totalScore}<span style="font-size:32px;color:#94a3b8;font-weight:400;font-family:${fontStack};">/${maxScore}</span>
            </div>
            <div style="font-size:18px;color:#64748b;margin-bottom:20px;font-weight:500;font-family:${fontStack};">${percentage}% Score</div>
            
            <!-- Animated Progress Bar -->
            <div class="preview-progress-bar" style="background:#e2e8f0;border-radius:12px;height:8px;overflow:hidden;margin:0 auto 20px;max-width:400px;">
              <div style="background:${scoreColor};height:100%;width:${percentage}%;transition:width 1s cubic-bezier(0.4, 0, 0.2, 1);border-radius:12px;"></div>
            </div>
            
            <!-- Stats -->
            <div style="display:flex;justify-content:center;gap:32px;margin-top:24px;font-family:${fontStack};">
              <div>
                <div style="font-size:24px;font-weight:600;color:${scoreColor};font-family:${fontStack};">${passedCount}</div>
                <div style="font-size:12px;color:#64748b;margin-top:4px;font-family:${fontStack};">Correct</div>
              </div>
              <div style="width:1px;background:#e2e8f0;"></div>
              <div>
                <div style="font-size:24px;font-weight:600;color:#64748b;font-family:${fontStack};">${questions.length - passedCount}</div>
                <div style="font-size:12px;color:#64748b;margin-top:4px;font-family:${fontStack};">Incorrect</div>
              </div>
              <div style="width:1px;background:#e2e8f0;"></div>
              <div>
                <div style="font-size:24px;font-weight:600;color:#64748b;font-family:${fontStack};">${questions.length}</div>
                <div style="font-size:12px;color:#64748b;margin-top:4px;font-family:${fontStack};">Total</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Clean Question Results -->
        <div style="font-family:${fontStack};">
          <h3 style="margin:0 0 20px 0;color:#1e293b;font-size:16px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;font-family:${fontStack};">Questions</h3>
          <div style="display:flex;flex-direction:column;gap:16px;">
            ${results.map((r, idx) => `
              <div class="preview-result-item ${r.isCorrect ? 'correct' : 'incorrect'}" 
                   style="border:1px solid ${r.isCorrect ? '#d1fae5' : '#fee2e2'};border-radius:12px;padding:20px;background:${r.isCorrect ? '#f0fdf4' : '#fef2f2'};animation:slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.05}s both;"
                   onclick="const questionEl = document.getElementById('question-${r.questionIndex - 1}'); if(questionEl) { questionEl.scrollIntoView({behavior:'smooth',block:'center'}); questionEl.style.animation='pulse 0.5s ease'; setTimeout(() => questionEl.style.animation='', 500); }">
                <div style="display:flex;gap:16px;">
                  <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:start;justify-content:space-between;gap:12px;margin-bottom:12px;font-family:${fontStack};">
                      <div style="flex:1;">
                        <div style="font-size:13px;color:#64748b;margin-bottom:6px;font-weight:500;font-family:${fontStack};">Question ${r.questionIndex}</div>
                        <div style="font-size:15px;color:#1e293b;font-weight:600;line-height:1.5;font-family:${fontStack};">${r.questionText}</div>
                      </div>
                      <div style="text-align:right;flex-shrink:0;">
                        <div style="font-size:16px;font-weight:600;color:${r.isCorrect ? '#10b981' : '#ef4444'};font-family:${fontStack};">${r.earnedPoints}/${r.points}</div>
                        <div style="font-size:11px;color:#94a3b8;margin-top:2px;font-family:${fontStack};">pts</div>
                      </div>
                    </div>
                    
                    <!-- Answers -->
                    <div style="display:flex;flex-direction:column;gap:8px;font-family:${fontStack};">
                      <div style="display:flex;align-items:start;gap:8px;">
                        <div style="width:6px;height:6px;background:${r.isCorrect ? '#10b981' : '#ef4444'};border-radius:50%;margin-top:6px;flex-shrink:0;"></div>
                        <div style="flex:1;">
                          <div style="font-size:12px;color:#64748b;margin-bottom:4px;font-family:${fontStack};">Your Answer</div>
                          <div style="font-size:14px;color:#1e293b;padding:10px 14px;background:white;border-radius:8px;border:1px solid ${r.isCorrect ? '#d1fae5' : '#fee2e2'};font-family:${fontStack};">
                            ${escapeHtml(r.studentAnswer)}
                          </div>
                        </div>
                      </div>
                      ${!r.isCorrect && r.correctAnswer ? `
                        <div style="display:flex;align-items:start;gap:8px;">
                          <div style="width:6px;height:6px;background:#10b981;border-radius:50%;margin-top:6px;flex-shrink:0;"></div>
                          <div style="flex:1;">
                            <div style="font-size:12px;color:#64748b;margin-bottom:4px;font-family:${fontStack};">Correct Answer</div>
                            <div style="font-size:14px;color:#1e293b;padding:10px 14px;background:white;border-radius:8px;border:1px solid #d1fae5;font-family:${fontStack};">
                              ${escapeHtml(r.correctAnswer)}
                            </div>
                          </div>
                        </div>
                      ` : ''}
                    </div>
                    
                    ${r.explanation ? `
                      <div style="margin-top:12px;padding:12px;background:white;border-radius:8px;border-left:3px solid #3b82f6;font-family:${fontStack};">
                        <div style="font-size:12px;color:#64748b;margin-bottom:4px;font-weight:500;font-family:${fontStack};">Explanation</div>
                        <div style="font-size:13px;color:#475569;line-height:1.6;font-family:${fontStack};">${r.explanation}</div>
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Simple Close Button -->
        <div style="margin-top:32px;text-align:center;padding-top:24px;border-top:1px solid #f1f5f9;font-family:${fontStack};">
          <button onclick="const modal = document.getElementById('previewTestResultsModal'); if(modal) { modal.style.opacity='0'; modal.style.transform='scale(0.95)'; setTimeout(() => modal.remove(), 200); } const btn = document.getElementById('preview-test-btn'); if(btn) { btn.disabled = false; btn.innerHTML = '<i class=\\'fas fa-check-circle\\'></i> Test'; }" 
                  style="background:linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);color:white;border:none;padding:12px 32px;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 12px rgba(14,165,233,0.3);font-family:${fontStack};" 
                  onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 16px rgba(14,165,233,0.4)';" 
                  onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 12px rgba(14,165,233,0.3)';">
            Close
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Reset button state
  if (testBtn) {
    testBtn.disabled = false;
    testBtn.innerHTML = '<i class="fas fa-check-circle"></i> Test';
  }
  
  console.log('🔍 [TEACHER TEST PREVIEW] Results:', { totalScore, maxScore, percentage, results });
};

/**
 * Show Test Results modal for students after submission
 * Displays question-by-question breakdown with score, correct/incorrect answers, and explanations
 */
async function showTestResultsModal(attemptId, activityId, userScore) {
  // Get max score from activity card if available (for fallback)
  let fallbackMaxScore = 10; // Default fallback
  if (activityId) {
    const activityCard = document.querySelector(`.activity-card[data-activity-id="${activityId}"]`);
    if (activityCard) {
      const cardMaxScore = parseInt(activityCard.getAttribute('data-max-score') || 0);
      if (cardMaxScore > 0) {
        fallbackMaxScore = cardMaxScore;
      }
    }
  }
  
  try {
    console.log('📊 Showing Test Results modal for attempt:', attemptId);
    
    // Fetch attempt results from API
    const response = await fetch(`get_attempt_results.php?attempt_id=${attemptId}`, {
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // Check if response is JSON (not HTML redirect)
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Try to get error message from response
      const text = await response.text();
      console.error('❌ Non-JSON response:', text.substring(0, 200));
      throw new Error('Server returned non-JSON response. Please check your session.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('❌ API error:', errorData);
      throw new Error(errorData.message || `Failed to fetch attempt results (${response.status})`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.results) {
      throw new Error(data.message || 'Failed to load results');
    }
    
    const { results, summary, activity } = data;
    const { totalScore, maxScore, percentage, correctCount, totalCount } = summary;
    
    // Remove any existing modal
    const existing = document.getElementById('studentTestResultsModal');
    if (existing) existing.remove();
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'studentTestResultsModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn 0.3s ease;';
    
    // Use EXACT SAME styles as coordinator (previewTestModalStyles)
    // Check if coordinator styles already exist, if not add them
    if (!document.getElementById('previewTestModalStyles')) {
      const style = document.createElement('style');
      style.id = 'previewTestModalStyles';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .preview-result-item {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .preview-result-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12) !important;
        }
        .preview-result-item.correct {
          border-left: 3px solid #10b981 !important;
        }
        .preview-result-item.incorrect {
          border-left: 3px solid #ef4444 !important;
        }
        .preview-progress-bar {
          position: relative;
          overflow: hidden;
        }
        .preview-progress-bar::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Calculate score color
    const scoreColor = percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444';
    const scoreBg = percentage >= 80 ? 'rgba(16,185,129,0.08)' : percentage >= 60 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)';
    const fontStack = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
    
    // Helper to escape HTML
    const escapeHtml = (text) => {
      if (text === null || text === undefined) return '';
      const div = document.createElement('div');
      div.textContent = String(text);
      return div.innerHTML;
    };

    // Normalize answer display (capitalize booleans, handle blanks)
    const formatAnswerDisplay = (text) => {
      if (text === null || text === undefined) return '(No answer)';
      let value = String(text).trim();
      if (value === '') return '(No answer)';
      const lower = value.toLowerCase();
      if (lower === 'true') return 'True';
      if (lower === 'false') return 'False';
      return value;
    };
    
    // Build modal HTML (EXACT SAME AS COORDINATOR'S TEST RESULTS MODAL)
    modal.innerHTML = `
      <div style="background:white;border-radius:16px;max-width:850px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.15);animation:slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);font-family:${fontStack};">
        <!-- Clean Header -->
        <div style="padding:28px 32px;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;background:#ffffff;font-family:${fontStack};">
          <div>
            <h2 style="margin:0;color:#1e293b;font-size:22px;font-weight:700;font-family:${fontStack};">${escapeHtml(activity.title || 'Activity')}</h2>
          </div>
          <button id="closeTestResultsModalX" 
                  style="background:#f8fafc;border:none;font-size:20px;color:#64748b;cursor:pointer;padding:8px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:8px;transition:all 0.2s;font-family:${fontStack};" 
                  onmouseover="this.style.background='#f1f5f9';this.style.color='#ef4444';" 
                  onmouseout="this.style.background='#f8fafc';this.style.color='#64748b';">&times;</button>
        </div>
        
        <div style="padding:32px;font-family:${fontStack};">
          <!-- Simple Score Card -->
          <div style="background:${scoreBg};border-radius:16px;padding:32px;margin-bottom:32px;text-align:center;position:relative;overflow:hidden;animation:scaleIn 0.5s ease;font-family:${fontStack};">
            <div style="position:absolute;top:-50px;right:-50px;width:200px;height:200px;background:${scoreColor};opacity:0.05;border-radius:50%;"></div>
            <div style="position:relative;z-index:1;">
              <div style="font-size:64px;font-weight:700;color:${scoreColor};margin-bottom:8px;line-height:1;font-family:${fontStack};">
                ${totalScore}<span style="font-size:32px;color:#94a3b8;font-weight:400;font-family:${fontStack};">/${maxScore}</span>
              </div>
              <div style="font-size:18px;color:#64748b;margin-bottom:20px;font-weight:500;font-family:${fontStack};">${percentage}% Score</div>
              
              <!-- Animated Progress Bar -->
              <div class="preview-progress-bar" style="background:#e2e8f0;border-radius:12px;height:8px;overflow:hidden;margin:0 auto 20px;max-width:400px;">
                <div style="background:${scoreColor};height:100%;width:${percentage}%;transition:width 1s cubic-bezier(0.4, 0, 0.2, 1);border-radius:12px;"></div>
              </div>
              
              <!-- Stats -->
              <div style="display:flex;justify-content:center;gap:32px;margin-top:24px;font-family:${fontStack};">
                <div>
                  <div style="font-size:24px;font-weight:600;color:${scoreColor};font-family:${fontStack};">${correctCount}</div>
                  <div style="font-size:12px;color:#64748b;margin-top:4px;font-family:${fontStack};">Correct</div>
                </div>
                <div style="width:1px;background:#e2e8f0;"></div>
                <div>
                  <div style="font-size:24px;font-weight:600;color:#64748b;font-family:${fontStack};">${totalCount - correctCount}</div>
                  <div style="font-size:12px;color:#64748b;margin-top:4px;font-family:${fontStack};">Incorrect</div>
                </div>
                <div style="width:1px;background:#e2e8f0;"></div>
                <div>
                  <div style="font-size:24px;font-weight:600;color:#64748b;font-family:${fontStack};">${totalCount}</div>
                  <div style="font-size:12px;color:#64748b;margin-top:4px;font-family:${fontStack};">Total</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Clean Question Results -->
          <div style="font-family:${fontStack};">
            <h3 style="margin:0 0 20px 0;color:#1e293b;font-size:16px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;font-family:${fontStack};">Questions</h3>
            <div style="display:flex;flex-direction:column;gap:16px;">
              ${results.map((r, idx) => `
                <div class="preview-result-item ${r.isCorrect ? 'correct' : 'incorrect'}" 
                     style="border:1px solid ${r.isCorrect ? '#d1fae5' : '#fee2e2'};border-radius:12px;padding:20px;background:${r.isCorrect ? '#f0fdf4' : '#fef2f2'};animation:slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.05}s both;"
                     onclick="const questionEl = document.getElementById('question-${r.questionIndex - 1}'); if(questionEl) { questionEl.scrollIntoView({behavior:'smooth',block:'center'}); questionEl.style.animation='pulse 0.5s ease'; setTimeout(() => questionEl.style.animation='', 500); }">
                  <div style="display:flex;gap:16px;">
                    <!-- Content (Status Icon removed - using color coding instead) -->
                    <div style="flex:1;min-width:0;">
                      <div style="display:flex;align-items:start;justify-content:space-between;gap:12px;margin-bottom:12px;font-family:${fontStack};">
                        <div style="flex:1;">
                          <div style="font-size:13px;color:#64748b;margin-bottom:6px;font-weight:500;font-family:${fontStack};">Question ${r.questionIndex}</div>
                          <div style="font-size:15px;color:#1e293b;font-weight:600;line-height:1.5;font-family:${fontStack};">${r.questionText}</div>
                        </div>
                        <div style="text-align:right;flex-shrink:0;">
                          <div style="font-size:16px;font-weight:600;color:${r.isCorrect ? '#10b981' : '#ef4444'};font-family:${fontStack};">${r.earnedPoints}/${r.points}</div>
                          <div style="font-size:11px;color:#94a3b8;margin-top:2px;font-family:${fontStack};">pts</div>
                        </div>
                      </div>
                      
                      <!-- Answers -->
                      <div style="display:flex;flex-direction:column;gap:8px;font-family:${fontStack};">
                        <div style="display:flex;align-items:start;gap:8px;">
                          <div style="width:6px;height:6px;background:${r.isCorrect ? '#10b981' : '#ef4444'};border-radius:50%;margin-top:6px;flex-shrink:0;"></div>
                          <div style="flex:1;">
                            <div style="font-size:12px;color:#64748b;margin-bottom:4px;font-family:${fontStack};">Your Answer</div>
                            <div style="font-size:14px;color:#1e293b;padding:10px 14px;background:white;border-radius:8px;border:1px solid ${r.isCorrect ? '#d1fae5' : '#fee2e2'};font-family:${fontStack};">
                              ${escapeHtml(formatAnswerDisplay(r.studentAnswer))}
                            </div>
                          </div>
                        </div>
                        ${!r.isCorrect ? `
                          <div style="display:flex;align-items:start;gap:8px;">
                            <div style="width:6px;height:6px;background:#10b981;border-radius:50%;margin-top:6px;flex-shrink:0;"></div>
                            <div style="flex:1;">
                              <div style="font-size:12px;color:#64748b;margin-bottom:4px;font-family:${fontStack};">Correct Answer</div>
                              <div style="font-size:14px;color:#1e293b;padding:10px 14px;background:white;border-radius:8px;border:1px solid #d1fae5;font-family:${fontStack};">
                                ${escapeHtml(formatAnswerDisplay(r.correctAnswer || 'N/A'))}
                              </div>
                            </div>
                          </div>
                        ` : ''}
                      </div>
                      
                      ${r.explanation ? `
                        <div style="margin-top:12px;padding:12px;background:white;border-radius:8px;border-left:3px solid #3b82f6;font-family:${fontStack};">
                          <div style="font-size:12px;color:#64748b;margin-bottom:4px;font-weight:500;font-family:${fontStack};">Explanation</div>
                          <div style="font-size:13px;color:#475569;line-height:1.6;font-family:${fontStack};">${r.explanation}</div>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- Simple Close Button -->
          <div style="margin-top:32px;text-align:center;padding-top:24px;border-top:1px solid #f1f5f9;font-family:${fontStack};">
            <button id="closeTestResultsModalBtn" 
                    style="background:linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);color:white;border:none;padding:12px 32px;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 12px rgba(14,165,233,0.3);font-family:${fontStack};" 
                    onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 16px rgba(14,165,233,0.4)';" 
                    onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 12px rgba(14,165,233,0.3)';">
              Close
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.95)';
        setTimeout(() => {
          modal.remove();
          // Refresh activity card scores after modal closes
          if (activityId && typeof loadAllStudentScores === 'function') {
            console.log('🔄 Modal closed - Refreshing activity card scores...');
            setTimeout(() => {
              loadAllStudentScores();
            }, 500);
          }
          // DO NOT show leaderboard automatically - user can access it from Leaderboards tab
        }, 200);
      }
    });
    
    // Add refresh trigger to close button handlers
    const closeModalAndRefresh = function() {
      modal.style.opacity = '0';
      modal.style.transform = 'scale(0.95)';
      setTimeout(() => {
        modal.remove();
        // Refresh activity card scores after modal closes
        if (activityId && typeof loadAllStudentScores === 'function') {
          console.log('🔄 Modal closed - Refreshing activity card scores for activity:', activityId);
          setTimeout(() => {
            loadAllStudentScores();
            // Also try to update the specific card
            if (typeof updateActivityCardScore === 'function') {
              // Get fresh score from server
              if (typeof getStudentScore === 'function') {
                getStudentScore(activityId).then(score => {
                  updateActivityCardScore(activityId, score);
                });
              }
            }
          }, 500);
        }
      }, 200);
    };
    
    // Bind close button handlers
    const closeXBtn = modal.querySelector('#closeTestResultsModalX');
    const closeBtn = modal.querySelector('#closeTestResultsModalBtn');
    if (closeXBtn) {
      closeXBtn.addEventListener('click', closeModalAndRefresh);
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModalAndRefresh);
    }
    
    console.log('✅ Test Results modal displayed');
    
  } catch (error) {
    // Log error to console only (no user-facing error notifications)
    console.error('❌ Error showing test results:', error);
    
    // Show a simplified Test Results modal with just the score if API fails
    // This ensures user still sees their score even if detailed results can't be loaded
    // NO ERROR NOTIFICATIONS - just show the score silently
    try {
      const modal = document.createElement('div');
      modal.id = 'studentTestResultsModal';
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn 0.3s ease;';
      
      const fontStack = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
      const scoreColor = '#10b981';
      const scoreBg = 'rgba(16,185,129,0.08)';
      
      // Use fallback max score (already calculated above)
      const maxScore = fallbackMaxScore;
      
      modal.innerHTML = `
        <div style="background:white;border-radius:16px;max-width:500px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.15);animation:slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);font-family:${fontStack};">
          <div style="padding:28px 32px;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <h2 style="margin:0;color:#1e293b;font-size:22px;font-weight:700;">Activity Results</h2>
            </div>
            <button onclick="const modal = document.getElementById('studentTestResultsModal'); if(modal) { modal.style.opacity='0'; setTimeout(() => modal.remove(), 200); }" 
                    style="background:#f8fafc;border:none;font-size:20px;color:#64748b;cursor:pointer;padding:8px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:8px;">&times;</button>
          </div>
          <div style="padding:32px;text-align:center;">
            <div style="background:${scoreBg};border-radius:16px;padding:32px;margin-bottom:24px;">
              <div style="font-size:64px;font-weight:700;color:${scoreColor};margin-bottom:8px;">
                ${userScore || 0}<span style="font-size:32px;color:#94a3b8;">/${maxScore}</span>
              </div>
              <div style="font-size:18px;color:#64748b;margin-bottom:20px;">Score</div>
            </div>
            <p style="color:#64748b;font-size:14px;margin-bottom:24px;">Your score has been recorded successfully.</p>
            <button onclick="const modal = document.getElementById('studentTestResultsModal'); if(modal) { modal.style.opacity='0'; setTimeout(() => modal.remove(), 200); }" 
                    style="background:linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);color:white;border:none;padding:12px 32px;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;">
              Close
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Close on outside click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.opacity = '0';
          setTimeout(() => modal.remove(), 200);
        }
      });
      
      console.log('✅ Simplified Test Results modal displayed with score:', userScore);
    } catch (modalError) {
      // Silent fallback - just reload to show updated score
      console.error('❌ Error creating fallback modal:', modalError);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }
}

window.unlockActivity = unlockActivity;
window.lockAllActivities = lockAllActivities;
window.unlockAllActivities = unlockAllActivities;
window.viewActivityItems = viewActivityItems;
window.handleReschedule = handleReschedule;
window.handleTryAnswering = handleTryAnswering;
window.toggleActivityMenu = toggleActivityMenu;

function closeActivityDropdown(dropdown) {
  if (!dropdown) return;
  dropdown.classList.remove('dropdown-open');
  dropdown.style.display = 'none';
}

// Custom styled confirmation modal
function showCustomConfirm(title, message, confirmText = 'OK', cancelText = 'Cancel', confirmColor = '#1d9b3e') {
  return new Promise((resolve) => {
    // Remove existing modal if any
    const existingModal = document.getElementById('customConfirmModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'customConfirmModal';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease;
    `;
    
    // Add fadeIn animation if not exists
    if (!document.getElementById('customConfirmStyles')) {
      const style = document.createElement('style');
      style.id = 'customConfirmStyles';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Create modal content
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 0;
      max-width: 480px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease;
      font-family: 'Inter', sans-serif;
      overflow: hidden;
    `;
    
    modal.innerHTML = `
      <div style="padding: 28px 32px 24px 32px;">
        <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1e293b; line-height: 1.4;">
          ${escapeHtml(title)}
        </h3>
        <p style="margin: 0; font-size: 15px; color: #64748b; line-height: 1.6; white-space: pre-line;">
          ${escapeHtml(message)}
        </p>
      </div>
      <div style="padding: 16px 32px 24px 32px; background: #f8fafc; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #e2e8f0;">
        <button class="custom-confirm-cancel" style="
          background: white;
          color: #64748b;
          border: 1px solid #e2e8f0;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        " onmouseover="this.style.background='#f1f5f9';this.style.borderColor='#cbd5e1';" onmouseout="this.style.background='white';this.style.borderColor='#e2e8f0';">
          ${escapeHtml(cancelText)}
        </button>
        <button class="custom-confirm-ok" style="
          background: ${confirmColor};
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        " onmouseover="this.style.background='${confirmColor === '#1d9b3e' ? '#178832' : confirmColor === '#ef4444' ? '#dc2626' : confirmColor}';this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.15)';" onmouseout="this.style.background='${confirmColor}';this.style.boxShadow='0 2px 4px rgba(0, 0, 0, 0.1)';">
          ${escapeHtml(confirmText)}
        </button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Handle button clicks
    const okBtn = modal.querySelector('.custom-confirm-ok');
    const cancelBtn = modal.querySelector('.custom-confirm-cancel');
    
    const close = (result) => {
      overlay.style.animation = 'fadeIn 0.2s ease reverse';
      setTimeout(() => {
        overlay.remove();
        resolve(result);
      }, 200);
    };
    
    okBtn.addEventListener('click', () => close(true));
    cancelBtn.addEventListener('click', () => close(false));
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        close(false);
      }
    });
    
    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        close(false);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  });
}

// Function to update active students counts for all lessons
function updateActiveStudentsCounts() {
  const countElements = document.querySelectorAll('.topic-count[data-lesson-id]');
  
  countElements.forEach(function(el) {
    const lessonId = el.getAttribute('data-lesson-id');
    if (!lessonId || lessonId === '0' || lessonId === '') return;
    
    fetch('get_active_students.php?lesson_id=' + encodeURIComponent(lessonId), {
      credentials: 'same-origin'
    })
    .then(function(r) {
      // Check if response is OK and content type is JSON
      if (!r.ok) {
        throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      }
      const contentType = r.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      return r.json();
    })
    .then(function(data) {
      if (data && data.success !== false) {
        const count = data.count || 0;
        el.textContent = count;
        // Update color based on count
        if (count > 0) {
          el.style.color = '#10b981'; // Green for active students
        } else {
          el.style.color = '#6b7280'; // Gray for zero
        }
      } else {
        el.textContent = '0';
        el.style.color = '#6b7280';
      }
    })
    .catch(function(err) {
      // Silently fail - don't spam console with errors for this non-critical feature
      // Only log if it's not a common error (like 403 for students)
      if (err.message && !err.message.includes('403') && !err.message.includes('Unauthorized')) {
        console.warn('Error fetching active students count for lesson ' + lessonId + ':', err.message);
      }
      el.textContent = '0';
      el.style.color = '#6b7280';
    });
  });
}

// Track student activity when viewing a lesson
function trackStudentActivity(lessonId) {
  if (!lessonId || lessonId <= 0) return;
  
  const userRole = (window.__USER_ROLE__ || '').toLowerCase();
  if (userRole !== 'student') return;
  
  // Send activity ping
  fetch('get_active_students.php?lesson_id=' + encodeURIComponent(lessonId), {
    credentials: 'same-origin',
    method: 'GET'
  }).catch(function(err) {
    console.error('Error tracking student activity:', err);
  });
  
  // Ping every 2 minutes to keep activity active
  if (window.__activityTrackingInterval) {
    clearInterval(window.__activityTrackingInterval);
  }
  
  window.__activityTrackingInterval = setInterval(function() {
    fetch('get_active_students.php?lesson_id=' + encodeURIComponent(lessonId), {
      credentials: 'same-origin',
      method: 'GET'
    }).catch(function(err) {
      console.error('Error tracking student activity:', err);
    });
  }, 120000); // 2 minutes
}

// ==================== REAL-TIME PROGRESS & COUNTDOWN FUNCTIONS ====================

// Update activity card score immediately (after submission)
function updateActivityCardScore(activityId, newScore) {
  try {
    console.log('📊 Updating activity card score:', activityId, '→', newScore);
    
    // Find all activity cards with this ID
    let activityCards = document.querySelectorAll(`.activity-card[data-activity-id="${activityId}"]`);
    
    // If not found, try alternative selectors
    if (activityCards.length === 0) {
      activityCards = document.querySelectorAll(`[data-activity-id="${activityId}"]`);
    }
    
    if (activityCards.length === 0) {
      console.warn('⚠️ No activity cards found for activity ID:', activityId);
      // Force reload scores from server after a delay (score might not be saved yet)
      setTimeout(() => {
        if (typeof loadAllStudentScores === 'function') {
          console.log('🔄 Reloading all student scores as fallback...');
          loadAllStudentScores();
        } else {
          // Last resort: reload the page
          console.log('🔄 Reloading page to show updated score...');
          window.location.reload();
        }
      }, 2000);
      return;
    }
    
    let updateSuccess = false;
    activityCards.forEach(function(card) {
      const maxScore = parseInt(card.getAttribute('data-max-score') || 0);
      
      // Try multiple selectors to find the score element
      let scoreElement = card.querySelector(`.student-score[data-activity-id="${activityId}"]`);
      if (!scoreElement) {
        // Try without data-activity-id attribute
        scoreElement = card.querySelector('.student-score');
      }
      if (!scoreElement) {
        // Try finding in activity-stats
        const statsElement = card.querySelector('.activity-stats');
        if (statsElement) {
          scoreElement = statsElement.querySelector('.student-score');
        }
      }
      
      // Try finding score-value directly as fallback
      let scoreValueEl = null;
      if (scoreElement) {
        scoreValueEl = scoreElement.querySelector('.score-value');
      }
      if (!scoreValueEl) {
        // Last resort: search for score-value anywhere in card
        scoreValueEl = card.querySelector('.score-value');
      }
      
      if (scoreValueEl) {
        const safeScore = Math.max(0, Math.min(Number(newScore) || 0, maxScore || Infinity));
        scoreValueEl.textContent = `${safeScore}/${maxScore || 0}`;
        
        // Update color based on score percentage
        const percentage = maxScore > 0 ? (safeScore / maxScore) * 100 : 0;
        if (percentage >= 80) {
          scoreValueEl.style.color = '#059669'; // Green for high score
        } else if (percentage >= 60) {
          scoreValueEl.style.color = '#f59e0b'; // Orange for medium score
        } else {
          scoreValueEl.style.color = '#dc2626'; // Red for low score
        }
        
        // Add visual feedback (brief highlight)
        if (scoreElement) {
          scoreElement.style.transition = 'all 0.3s ease';
          scoreElement.style.borderColor = '#10b981';
          scoreElement.style.transform = 'scale(1.05)';
          setTimeout(() => {
            scoreElement.style.borderColor = '';
            scoreElement.style.transform = '';
          }, 500);
        }
        
        console.log('✅ Updated score display:', `${safeScore}/${maxScore}`);
        updateSuccess = true;
      } else {
        console.warn('⚠️ Score value element not found in card for activity:', activityId);
      }
    });
    
    // CRITICAL: Multiple refresh attempts to ensure score is updated
    // Even if immediate update succeeded, also refresh from server to ensure consistency
    if (typeof loadAllStudentScores === 'function') {
      // Immediate refresh attempt
      setTimeout(() => {
        console.log('🔄 Refresh attempt 1 - Reloading all student scores...');
        loadAllStudentScores();
      }, 1000);
      
      // Additional refresh attempts with increasing delays
      setTimeout(() => {
        console.log('🔄 Refresh attempt 2 - Reloading all student scores...');
        loadAllStudentScores();
      }, 3000);
      
      setTimeout(() => {
        console.log('🔄 Refresh attempt 3 - Reloading all student scores...');
        loadAllStudentScores();
      }, 5000);
    }
    
    // If update failed, force page reload as last resort
    if (!updateSuccess && activityCards.length === 0) {
      setTimeout(() => {
        console.log('🔄 No cards found, reloading page as last resort...');
        window.location.reload();
      }, 6000);
    }
  } catch (error) {
    console.error('❌ Error updating activity card score:', error);
  }
}

// Load real student scores for all activity cards
async function loadAllStudentScores() {
  const userRole = (window.__USER_ROLE__ || '').toLowerCase();
  if (userRole !== 'student') return;
  
  const scoreElements = document.querySelectorAll('.student-score[data-activity-id]');
  const promises = [];
  
  scoreElements.forEach(function(scoreEl) {
    const activityId = scoreEl.getAttribute('data-activity-id');
    if (!activityId) return;
    
    const activityCard = scoreEl.closest('.activity-card');
    const maxScore = activityCard ? (activityCard.getAttribute('data-max-score') || 0) : 0;
    const promise = getStudentScore(activityId).then(function(score) {
      const scoreValueEl = scoreEl.querySelector('.score-value');
      if (scoreValueEl) {
        const safeScore = Math.max(0, Math.min(Number(score) || 0, Number(maxScore) || Infinity));
        scoreValueEl.textContent = `${safeScore}/${maxScore || 0}`;
        
        // Update color based on score percentage
        const percentage = maxScore > 0 ? (safeScore / maxScore) * 100 : 0;
        if (percentage >= 80) {
          scoreValueEl.style.color = '#059669'; // Green for high score
        } else if (percentage >= 60) {
          scoreValueEl.style.color = '#f59e0b'; // Orange for medium score
        } else {
          scoreValueEl.style.color = '#dc2626'; // Red for low score
        }
      }
    }).catch(function(err) {
      console.error('Error loading score for activity', activityId, ':', err);
    });
    
    promises.push(promise);
  });
  
  await Promise.all(promises);
  console.log('✅ Loaded all student scores');
}

// Initialize countdown timers for all activities
function initializeCountdownTimers() {
  const countdownElements = document.querySelectorAll('.time-remaining[data-due-date]');
  
  countdownElements.forEach(function(el) {
    // Skip if already initialized
    if (el.getAttribute('data-countdown-initialized') === 'true') {
      return;
    }
    
    const dueDateStr = el.getAttribute('data-due-date');
    if (!dueDateStr) return;
    
    // Clean up any existing interval first
    const existingInterval = el.getAttribute('data-countdown-interval');
    if (existingInterval) {
      clearInterval(parseInt(existingInterval));
    }
    
    // Parse due date (assume Manila timezone if no timezone info)
    let dueDateFixed = dueDateStr;
    if (dueDateStr && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dueDateStr)) {
      dueDateFixed = dueDateStr.replace(' ', 'T') + '+08:00';
    }
    const dueDate = new Date(dueDateFixed);
    
    // Validate date
    if (isNaN(dueDate.getTime())) {
      console.error('Invalid due date:', dueDateStr);
      return;
    }
    
    const countdownText = el.querySelector('.countdown-text');
    if (!countdownText) return;
    
    function updateCountdown() {
      const now = new Date();
      const diff = dueDate - now;
      
      if (diff <= 0) {
        countdownText.textContent = 'Time\'s up!';
        countdownText.style.color = '#dc2626';
        el.style.background = '#fee2e2';
        el.style.borderColor = '#fecaca';
        // Clear interval when time is up
        const intervalId = el.getAttribute('data-countdown-interval');
        if (intervalId) {
          clearInterval(parseInt(intervalId));
          el.removeAttribute('data-countdown-interval');
        }
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      let timeStr = '';
      if (days > 0) {
        timeStr = `${days}d ${hours}h ${minutes}m`;
      } else if (hours > 0) {
        timeStr = `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        timeStr = `${minutes}m ${seconds}s`;
      } else {
        timeStr = `${seconds}s`;
      }
      
      countdownText.textContent = `Due in ${timeStr}`;
      
      // Color coding based on time remaining
      if (days > 1) {
        countdownText.style.color = '#059669'; // Green - plenty of time
        el.style.background = '#f0fdf4';
        el.style.borderColor = '#bbf7d0';
      } else if (hours > 6) {
        countdownText.style.color = '#f59e0b'; // Orange - moderate urgency
        el.style.background = '#fffbeb';
        el.style.borderColor = '#fde68a';
      } else {
        countdownText.style.color = '#dc2626'; // Red - urgent
        el.style.background = '#fee2e2';
        el.style.borderColor = '#fecaca';
      }
    }
    
    // Update immediately
    updateCountdown();
    
    // Update every second
    const intervalId = setInterval(updateCountdown, 1000);
    
    // Store interval ID for cleanup
    el.setAttribute('data-countdown-interval', intervalId);
    el.setAttribute('data-countdown-initialized', 'true');
  });
  
  console.log('✅ Initialized countdown timers for', countdownElements.length, 'activities');
}

// Clean up countdown timers
function cleanupCountdownTimers() {
  const countdownElements = document.querySelectorAll('.time-remaining[data-countdown-interval]');
  countdownElements.forEach(function(el) {
    const intervalId = el.getAttribute('data-countdown-interval');
    if (intervalId) {
      clearInterval(parseInt(intervalId));
      el.removeAttribute('data-countdown-interval');
      el.removeAttribute('data-countdown-initialized');
    }
  });
  console.log('🧹 Cleaned up countdown timers');
}

// Get average score for an activity (for teachers)
async function getActivityAvgScore(activityId) {
  try {
    const response = await fetch(`get_activity_avg_score.php?activity_id=${activityId}`, {
      credentials: 'same-origin'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (data && data.success) {
        return Number(data.avg_score || 0);
      }
      return 0;
    } else {
      const text = await response.text();
      throw new Error('Server returned non-JSON response: ' + text.substring(0, 200));
    }
  } catch (error) {
    console.error('Error getting average score:', error);
    return 0;
  }
}

// Load average scores for all teacher activity cards
async function loadAllAvgScores() {
  const userRole = (window.__USER_ROLE__ || '').toLowerCase();
  if (userRole !== 'teacher' && userRole !== 'coordinator') return;
  
  const avgScoreElements = document.querySelectorAll('.stat-circle.avg-score[data-activity-id]');
  const promises = [];
  
  avgScoreElements.forEach(function(scoreEl) {
    const activityId = scoreEl.getAttribute('data-activity-id');
    if (!activityId) return;
    
    const activityCard = scoreEl.closest('.activity-card');
    const maxScore = activityCard ? (activityCard.getAttribute('data-max-score') || 0) : 0;
    
    const promise = getActivityAvgScore(activityId).then(function(avgScore) {
      const statValueEl = scoreEl.querySelector('.stat-value');
      if (statValueEl) {
        const safeAvg = Math.max(0, Math.min(Number(avgScore) || 0, Number(maxScore) || Infinity));
        statValueEl.textContent = `${safeAvg}/${maxScore || 0}`;
        
        // Update color based on average score percentage
        const percentage = maxScore > 0 ? (safeAvg / maxScore) * 100 : 0;
        if (percentage >= 80) {
          statValueEl.style.color = '#059669'; // Green for high average
        } else if (percentage >= 60) {
          statValueEl.style.color = '#f59e0b'; // Orange for medium average
        } else {
          statValueEl.style.color = '#dc2626'; // Red for low average
        }
      }
    }).catch(function(err) {
      console.error('Error loading average score for activity', activityId, ':', err);
    });
    
    promises.push(promise);
  });
  
  await Promise.all(promises);
  console.log('✅ Loaded all average scores');
}

// Initialize improvements after content loads
function initializeActivityImprovements() {
  const userRole = (window.__USER_ROLE__ || '').toLowerCase();
  
  if (userRole === 'student') {
    // Load real student scores
    setTimeout(function() {
      loadAllStudentScores();
    }, 500);
    
    // Initialize countdown timers
    setTimeout(function() {
      initializeCountdownTimers();
    }, 1000);
  } else if (userRole === 'teacher' || userRole === 'coordinator') {
    // Load average scores for teachers
    setTimeout(function() {
      loadAllAvgScores();
    }, 500);
  }
  
  // Re-initialize when new content is loaded (e.g., when expanding lessons)
  const observer = new MutationObserver(function(mutations) {
    let shouldReload = false;
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node instanceof HTMLElement) {
          if (node.classList && node.classList.contains('activity-card')) {
            shouldReload = true;
          }
          if (node.querySelector && node.querySelector('.activity-card')) {
            shouldReload = true;
          }
        }
      });
    });
    
    if (shouldReload) {
      setTimeout(function() {
        if (userRole === 'student') {
          loadAllStudentScores();
          cleanupCountdownTimers();
          initializeCountdownTimers();
        } else if (userRole === 'teacher' || userRole === 'coordinator') {
          loadAllAvgScores();
        }
      }, 300);
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Start real-time activity status polling
  startActivityStatusPolling();
  
  // REMOVED: Leaderboard buttons should NOT be on activity cards
  // Leaderboards are only accessible from the Leaderboards tab/section
  
  console.log('✅ Activity improvements initialized');
}

/**
 * Add leaderboard buttons to all activity cards
 */
function addLeaderboardButtonsToCards() {
  const activityCards = document.querySelectorAll('.activity-card.student-format[data-activity-id]');
  activityCards.forEach(card => {
    const activityId = card.getAttribute('data-activity-id');
    if (activityId) {
      addLeaderboardButton(card, parseInt(activityId));
    }
  });
}

// ==================== LEADERBOARD FUNCTIONALITY ====================

/**
 * Show leaderboard modal for an activity
 */
async function showLeaderboardModal(activityId, userScore = null) {
  try {
    console.log('🏆 Loading leaderboard for activity:', activityId, 'with user score:', userScore);
    
    // Initialize variables
    let leaderboard = [];
    let userRank = null;
    let userScoreData = null;
    let userPercentage = null;
    
    // Try to fetch leaderboard data (but don't fail if it doesn't work)
    try {
      const response = await fetch(`get_leaderboard.php?activity_id=${activityId}&limit=50`, {
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Check if response is JSON (not HTML redirect)
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json') && response.ok) {
        const data = await response.json();
        if (data.success) {
          leaderboard = data.leaderboard || [];
          userRank = data.user_rank;
          userScoreData = data.user_score;
          userPercentage = data.user_percentage;
        }
      } else {
        // Silent error - just log to console
        console.log('⚠️ Leaderboard endpoint returned non-JSON (likely auth error)');
      }
    } catch (error) {
      // Silent error - just log to console
      console.log('⚠️ Could not load leaderboard data (silent):', error.message || error);
      // Continue with just the userScore - still show the modal
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'leaderboard-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;font-family:"Inter",sans-serif;';
    
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
    
    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
    // Get medal emoji for top 3
    const getMedal = (rank) => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return `#${rank}`;
    };
    
    // Build leaderboard HTML
    let leaderboardHTML = '';
    if (leaderboard.length === 0) {
      leaderboardHTML = `
        <div style="text-align:center;padding:40px;color:#6b7280;">
          <i class="fas fa-trophy" style="font-size:48px;color:#d1d5db;margin-bottom:16px;"></i>
          <p style="font-size:16px;margin:0;">No submissions yet. Be the first!</p>
        </div>
      `;
    } else {
      leaderboardHTML = `
        <div style="max-height:400px;overflow-y:auto;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f8f9fa;border-bottom:2px solid #e9ecef;">
                <th style="padding:12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;">Rank</th>
                <th style="padding:12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;">Student</th>
                <th style="padding:12px;text-align:right;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;">Score</th>
                <th style="padding:12px;text-align:right;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;">Time</th>
                <th style="padding:12px;text-align:right;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;">Date</th>
              </tr>
            </thead>
            <tbody>
              ${leaderboard.map((entry, index) => {
                const isCurrentUser = entry.user_id === (window.__USER_ID__ || 0);
                const rowStyle = isCurrentUser 
                  ? 'background:#e3f2fd;border-left:3px solid #2196f3;font-weight:600;' 
                  : '';
                return `
                  <tr style="${rowStyle}border-bottom:1px solid #f3f4f6;">
                    <td style="padding:12px;font-size:14px;color:#374151;">
                      <span style="display:inline-flex;align-items:center;gap:4px;">
                        ${getMedal(entry.rank)}
                      </span>
                    </td>
                    <td style="padding:12px;font-size:14px;color:#374151;">
                      ${escapeHtml(entry.name || 'Unknown')}
                      ${isCurrentUser ? '<span style="margin-left:8px;color:#2196f3;font-size:12px;">(You)</span>' : ''}
                    </td>
                    <td style="padding:12px;text-align:right;font-size:14px;color:#374151;">
                      <span style="font-weight:600;">${entry.score || 0}</span>
                      <span style="color:#9ca3af;font-size:12px;margin-left:4px;">/ ${entry.max_score || 0}</span>
                      <span style="color:#059669;font-size:12px;margin-left:8px;">(${entry.percentage ? entry.percentage.toFixed(1) : 0}%)</span>
                    </td>
                    <td style="padding:12px;text-align:right;font-size:12px;color:#6b7280;">
                      ${formatTime(entry.time_spent_ms)}
                    </td>
                    <td style="padding:12px;text-align:right;font-size:12px;color:#6b7280;">
                      ${formatDate(entry.submitted_at)}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    
    // User's rank display - Always show prominently if userScore is provided (from submission)
    let userRankHTML = '';
    const displayScore = userScore !== null && userScore !== undefined ? userScore : (userScoreData || 0);
    const displayRank = userRank !== null && userRank !== undefined ? userRank : null;
    const displayPercentage = userPercentage || null;
    
    // Show user's score prominently if provided (from submission)
    if (userScore !== null && userScore !== undefined) {
      userRankHTML = `
        <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;padding:24px;border-radius:12px;margin-bottom:20px;text-align:center;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="font-size:16px;opacity:0.95;margin-bottom:12px;font-weight:600;">🎉 Your Score</div>
          <div style="font-size:48px;font-weight:700;margin-bottom:8px;line-height:1;">${displayScore}</div>
          ${displayRank !== null ? `
            <div style="font-size:18px;opacity:0.95;margin-bottom:8px;">Rank: ${getMedal(displayRank)}</div>
          ` : ''}
          ${displayPercentage !== null ? `
            <div style="font-size:14px;opacity:0.9;">
              Percentage: <strong>${displayPercentage.toFixed(1)}%</strong>
            </div>
          ` : ''}
        </div>
      `;
    } else if (displayRank !== null) {
      // Show rank if available from API
      userRankHTML = `
        <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;padding:20px;border-radius:12px;margin-bottom:20px;text-align:center;">
          <div style="font-size:14px;opacity:0.9;margin-bottom:8px;">Your Rank</div>
          <div style="font-size:36px;font-weight:700;margin-bottom:4px;">${getMedal(displayRank)}</div>
          <div style="font-size:14px;opacity:0.9;">
            Score: <strong>${displayScore}</strong> 
            ${displayPercentage ? `(${displayPercentage.toFixed(1)}%)` : ''}
          </div>
        </div>
      `;
    }
    
    modal.innerHTML = `
      <div style="background:white;border-radius:16px;max-width:800px;width:95%;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04);">
        <div style="padding:24px;border-bottom:1px solid #e9ecef;display:flex;align-items:center;justify-content:space-between;">
          <div>
            <h2 style="margin:0;font-size:24px;font-weight:700;color:#111827;display:flex;align-items:center;gap:12px;">
              <i class="fas fa-trophy" style="color:#f59e0b;"></i>
              Leaderboard
            </h2>
            <p style="margin:4px 0 0 0;font-size:14px;color:#6b7280;">Top performers for this activity</p>
          </div>
          <button onclick="this.closest('.leaderboard-modal').remove(); window.location.reload();" 
                  style="background:none;border:none;font-size:24px;color:#6b7280;cursor:pointer;padding:4px 8px;border-radius:4px;transition:all 0.2s;"
                  onmouseover="this.style.background='#f3f4f6';this.style.color='#374151';"
                  onmouseout="this.style.background='none';this.style.color='#6b7280';">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div style="padding:24px;overflow-y:auto;flex:1;">
          ${userRankHTML}
          ${leaderboardHTML}
        </div>
        <div style="padding:16px 24px;border-top:1px solid #e9ecef;background:#f8f9fa;display:flex;justify-content:flex-end;gap:12px;">
          <button onclick="this.closest('.leaderboard-modal').remove(); window.location.reload();" 
                  style="background:#1d9b3e;color:white;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;"
                  onmouseover="this.style.background='#15803d';this.style.transform='translateY(-1px)';"
                  onmouseout="this.style.background='#1d9b3e';this.style.transform='translateY(0)';">
            Close
          </button>
        </div>
      </div>
    `;
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        window.location.reload();
      }
    });
    
    document.body.appendChild(modal);
    
  } catch (error) {
    console.error('❌ Error showing leaderboard:', error);
    
    // Even if there's an error, show a simple score modal if userScore was provided
    if (userScore !== null && userScore !== undefined) {
      const modal = document.createElement('div');
      modal.className = 'leaderboard-modal';
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;font-family:"Inter",sans-serif;';
      
      modal.innerHTML = `
        <div style="background:white;border-radius:16px;max-width:500px;width:95%;padding:32px;text-align:center;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);">
          <div style="font-size:64px;margin-bottom:16px;">🎉</div>
          <h2 style="margin:0 0 16px 0;font-size:28px;font-weight:700;color:#111827;">Activity Submitted!</h2>
          <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;padding:24px;border-radius:12px;margin:24px 0;">
            <div style="font-size:16px;opacity:0.95;margin-bottom:12px;font-weight:600;">Your Score</div>
            <div style="font-size:48px;font-weight:700;line-height:1;">${userScore}</div>
          </div>
          <p style="color:#6b7280;font-size:14px;margin:24px 0;">Your submission has been recorded successfully.</p>
          <button onclick="this.closest('.leaderboard-modal').remove(); window.location.reload();" 
                  style="background:#1d9b3e;color:white;border:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;margin-top:16px;">
            Close
          </button>
        </div>
      `;
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
          window.location.reload();
        }
      });
      
      document.body.appendChild(modal);
    } else {
      // No score to show, just reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }
}

/**
 * Add leaderboard button to a single activity card
 */
function addLeaderboardButton(activityCard, activityId) {
  // Check if button already exists
  if (activityCard.querySelector('.leaderboard-btn')) {
    return;
  }
  
  const statsContainer = activityCard.querySelector('.activity-stats');
  if (!statsContainer) return;
  
  const leaderboardBtn = document.createElement('button');
  leaderboardBtn.className = 'leaderboard-btn';
  leaderboardBtn.innerHTML = '<i class="fas fa-trophy"></i> Leaderboard';
  leaderboardBtn.style.cssText = `
    position: absolute;
    right: 140px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
    font-family: 'Inter', sans-serif;
  `;
  
  leaderboardBtn.addEventListener('mouseenter', () => {
    leaderboardBtn.style.transform = 'translateY(calc(-50% - 2px))';
    leaderboardBtn.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
  });
  
  leaderboardBtn.addEventListener('mouseleave', () => {
    leaderboardBtn.style.transform = 'translateY(-50%)';
    leaderboardBtn.style.boxShadow = 'none';
  });
  
  leaderboardBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showLeaderboardModal(activityId);
  });
  
  // Insert before the start button or at the end
  const startBtn = activityCard.querySelector('.start-activity-btn');
  if (startBtn && startBtn.parentElement === statsContainer) {
    statsContainer.insertBefore(leaderboardBtn, startBtn);
  } else {
    statsContainer.appendChild(leaderboardBtn);
  }
}

// ==================== CLASS LEADERBOARDS FUNCTIONALITY ====================

/**
 * Load leaderboards for the current class
 */
async function loadClassLeaderboards() {
  const classId = window.__CLASS_ID__;
  console.log('🏆 loadClassLeaderboards called, classId:', classId);
  
  if (!classId) {
    console.error('❌ No class ID available');
    const leaderboardsContent = document.getElementById('class-leaderboards-content');
    if (leaderboardsContent) {
      leaderboardsContent.innerHTML = `
        <div style="text-align:center;padding:40px;color:#dc2626;">
          <i class="fas fa-exclamation-triangle" style="font-size:48px;margin-bottom:16px;"></i>
          <p style="font-size:16px;margin:0;">Error: Class ID not found. Please refresh the page.</p>
        </div>
      `;
    }
    return;
  }
  
  const leaderboardsContent = document.getElementById('class-leaderboards-content');
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
    console.log('🏆 Fetching class details for classId:', classId);
    // Get class details to get course name
    const classResponse = await fetch(`class_view_api.php?action=get_details&id=${encodeURIComponent(classId)}`, {
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    let className = 'Course';
    if (classResponse.ok) {
      const classData = await classResponse.json();
      console.log('🏆 Class details response:', classData);
      if (classData.success && classData.class) {
        className = classData.class.name || classData.class.course_name || 'Course';
      }
    } else {
      console.log('⚠️ Failed to fetch class details:', classResponse.status);
    }
    
    console.log('🏆 Fetching leaderboard for classId:', classId);
    // Load course-level leaderboard (aggregates all activities)
    const leaderboardResponse = await fetch(`get_leaderboard.php?class_id=${classId}&limit=50`, {
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('🏆 Leaderboard response status:', leaderboardResponse.status);
    console.log('🏆 Leaderboard response headers:', {
      'content-type': leaderboardResponse.headers.get('content-type'),
      'ok': leaderboardResponse.ok
    });
    
    // Check if response is JSON (not HTML redirect)
    const contentType = leaderboardResponse.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await leaderboardResponse.text();
      console.error('❌ Leaderboard endpoint returned non-JSON:', text.substring(0, 200));
      leaderboardsContent.innerHTML = `
        <div style="text-align:center;padding:40px;color:#6b7280;">
          <i class="fas fa-trophy" style="font-size:48px;color:#d1d5db;margin-bottom:16px;"></i>
          <p style="font-size:16px;margin:0;">No leaderboards available yet. Submit activities to see rankings!</p>
        </div>
      `;
      return;
    }
    
    if (!leaderboardResponse.ok) {
      const errorData = await leaderboardResponse.json().catch(() => ({}));
      console.error('❌ Leaderboard error:', errorData);
      leaderboardsContent.innerHTML = `
        <div style="text-align:center;padding:40px;color:#6b7280;">
          <i class="fas fa-trophy" style="font-size:48px;color:#d1d5db;margin-bottom:16px;"></i>
          <p style="font-size:16px;margin:0;">No leaderboards available yet. Submit activities to see rankings!</p>
          <p style="font-size:12px;margin:8px 0 0 0;color:#9ca3af;">Error: ${errorData.message || 'Unknown error'}</p>
        </div>
      `;
      return;
    }
    
    const leaderboardData = await leaderboardResponse.json();
    console.log('🏆 Leaderboard data received:', leaderboardData);
    
    if (!leaderboardData.success) {
      console.error('❌ Leaderboard API returned success=false:', leaderboardData);
      leaderboardsContent.innerHTML = `
        <div style="text-align:center;padding:40px;color:#6b7280;">
          <i class="fas fa-trophy" style="font-size:48px;color:#d1d5db;margin-bottom:16px;"></i>
          <p style="font-size:16px;margin:0;">No leaderboards available yet. Submit activities to see rankings!</p>
          <p style="font-size:12px;margin:8px 0 0 0;color:#9ca3af;">${leaderboardData.message || 'No data available'}</p>
        </div>
      `;
      return;
    }
    
    if (!leaderboardData.leaderboard || leaderboardData.leaderboard.length === 0) {
      console.log('⚠️ Leaderboard is empty');
      leaderboardsContent.innerHTML = `
        <div style="text-align:center;padding:40px;color:#6b7280;">
          <i class="fas fa-trophy" style="font-size:48px;color:#d1d5db;margin-bottom:16px;"></i>
          <p style="font-size:16px;margin:0;">No leaderboards available yet. Submit activities to see rankings!</p>
        </div>
      `;
      return;
    }
    
    const leaderboard = leaderboardData.leaderboard || [];
    const userRank = leaderboardData.user_rank;
    const userScore = leaderboardData.user_score || 0;
    const userPercentage = leaderboardData.user_percentage || 0;
    const totalPossibleScore = leaderboardData.total_possible_score || 0;
    
    // Get medal emoji
    const getMedal = (rank) => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return `#${rank}`;
    };
    
    // Render course-level leaderboard
    let html = `
      <div style="border:1px solid #e9ecef;border-radius:12px;padding:24px;background:white;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid #e9ecef;">
          <h4 style="margin:0;font-size:20px;font-weight:700;color:#111827;">
            ${escapeHtml(className)}
          </h4>
          ${userRank !== null && userRank !== undefined ? `
            <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;">
              Your Rank: ${getMedal(userRank)} (${userPercentage.toFixed(1)}%)
            </div>
          ` : ''}
        </div>
        
        <div style="max-height:600px;overflow-y:auto;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f8f9fa;border-bottom:2px solid #e9ecef;">
                <th style="padding:12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;">Rank</th>
                <th style="padding:12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;">Student</th>
                <th style="padding:12px;text-align:right;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;">Total Score</th>
                <th style="padding:12px;text-align:right;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;">Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${leaderboard.map((entry) => {
                const isCurrentUser = entry.user_id === (window.__USER_ID__ || 0);
                const rowStyle = isCurrentUser 
                  ? 'background:#e3f2fd;border-left:3px solid #2196f3;font-weight:600;' 
                  : 'background:white;';
                return `
                  <tr style="${rowStyle}border-bottom:1px solid #f3f4f6;">
                    <td style="padding:12px;font-size:14px;color:#374151;">
                      ${getMedal(entry.rank)}
                    </td>
                    <td style="padding:12px;font-size:14px;color:#374151;">
                      ${escapeHtml(entry.name || 'Unknown')}
                      ${isCurrentUser ? '<span style="margin-left:8px;color:#2196f3;font-size:12px;">(You)</span>' : ''}
                    </td>
                    <td style="padding:12px;text-align:right;font-size:14px;color:#374151;">
                      <span style="font-weight:600;">${entry.score || 0}</span>
                      <span style="color:#9ca3af;font-size:12px;margin-left:4px;">/ ${totalPossibleScore}</span>
                    </td>
                    <td style="padding:12px;text-align:right;font-size:14px;color:#374151;">
                      <span style="color:#059669;font-weight:600;">${entry.percentage ? entry.percentage.toFixed(1) : 0}%</span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    leaderboardsContent.innerHTML = html;
    
  } catch (error) {
    console.error('❌ Error loading class leaderboards:', error);
    leaderboardsContent.innerHTML = `
      <div style="text-align:center;padding:40px;color:#dc2626;">
        <i class="fas fa-exclamation-triangle" style="font-size:48px;margin-bottom:16px;"></i>
        <p style="font-size:16px;margin:0;">Error loading leaderboards. Please try again later.</p>
        <p style="font-size:14px;margin:8px 0 0 0;color:#6b7280;">${escapeHtml(error.message || 'Unknown error')}</p>
      </div>
    `;
  }
}

// ==================== REAL-TIME ACTIVITY STATUS POLLING ====================
let activityStatusPollingInterval = null;

function startActivityStatusPolling() {
  // Clear any existing interval
  if (activityStatusPollingInterval) {
    clearInterval(activityStatusPollingInterval);
  }
  
  // Poll every 30 seconds to check for activity unlock/lock status changes
  // Reduced frequency to minimize unnecessary updates and console spam
  activityStatusPollingInterval = setInterval(function() {
    checkAndUpdateActivityStatuses();
  }, 30000); // 30 seconds (balanced between responsiveness and performance)
  
  // Also check immediately on page load
  setTimeout(function() {
    checkAndUpdateActivityStatuses();
  }, 2000); // Wait 2 seconds after page load
  
  console.log('✅ Started real-time activity status polling (every 30 seconds)');
}

function stopActivityStatusPolling() {
  if (activityStatusPollingInterval) {
    clearInterval(activityStatusPollingInterval);
    activityStatusPollingInterval = null;
    console.log('✅ Stopped activity status polling');
  }
}

async function checkAndUpdateActivityStatuses() {
  const classId = window.__CLASS_ID__;
  if (!classId) {
    return;
  }
  
  try {
    // Fetch latest activity statuses from API
    const response = await fetch(`class_view_api.php?action=list_topics&id=${encodeURIComponent(classId)}`, { 
      credentials: 'same-origin' 
    });
    
    if (!response.ok) {
      return;
    }
    
    const data = await response.json();
    if (!data || !data.success || !data.modules) {
      return;
    }
    
    // Collect all activities with their current status
    const activityStatusMap = new Map();
    
    data.modules.forEach(function(module) {
      (module.lessons || []).forEach(function(lesson) {
        (lesson.activities || []).forEach(function(activity) {
          if (activity.id && activity.availability) {
            activityStatusMap.set(activity.id, {
              status: activity.availability.status,
              available: activity.availability.available,
              start_at: activity.start_at,
              due_at: activity.due_at
            });
          }
        });
      });
    });
    
    // Check each activity card on the page
    const activityCards = document.querySelectorAll('.activity-card[data-activity-id]');
    
    activityCards.forEach(function(card) {
      const activityId = parseInt(card.getAttribute('data-activity-id'));
      if (!activityId) return;
      
      const latestStatus = activityStatusMap.get(activityId);
      if (!latestStatus) return;
      
      // Get current status from card (check stored status first, then fallback to DOM)
      const storedStatus = card.getAttribute('data-last-status');
      const currentStatus = storedStatus || getCurrentActivityStatus(card);
      
      // Only update if status actually changed (prevents unnecessary UI updates and console spam)
      if (currentStatus !== latestStatus.status) {
        console.log(`🔄 Activity ${activityId} status changed: ${currentStatus || 'unknown'} → ${latestStatus.status}`);
        updateActivityCardStatus(card, latestStatus);
      }
      // If status hasn't changed, skip the update to avoid unnecessary DOM manipulation
    });
    
  } catch (error) {
    console.error('❌ Error checking activity statuses:', error);
  }
}

function getCurrentActivityStatus(card) {
  // Check for status classes
  if (card.classList.contains('activity-locked')) {
    return 'locked';
  }
  if (card.classList.contains('activity-closed')) {
    return 'closed';
  }
  if (card.classList.contains('activity-open')) {
    return 'open';
  }
  if (card.classList.contains('activity-upcoming')) {
    return 'upcoming';
  }
  
  // Check for status badge
  const statusBadge = card.querySelector('.activity-status-badge');
  if (statusBadge) {
    if (statusBadge.classList.contains('badge-locked')) return 'locked';
    if (statusBadge.classList.contains('badge-closed')) return 'closed';
    if (statusBadge.classList.contains('badge-open')) return 'open';
    if (statusBadge.classList.contains('badge-upcoming')) return 'upcoming';
  }
  
  // Check for locked button
  const startButton = card.querySelector('.start-activity-btn, .btn-start');
  if (startButton && startButton.disabled) {
    const buttonText = startButton.textContent || '';
    if (buttonText.includes('Locked')) return 'locked';
    if (buttonText.includes('Closed')) return 'closed';
  }
  
  return null;
}

function updateActivityCardStatus(card, newStatus) {
  const activityId = parseInt(card.getAttribute('data-activity-id'));
  const userRole = (window.__USER_ROLE__ || '').toLowerCase();
  const isStudent = userRole === 'student';
  
  // Remove old status classes
  card.classList.remove('activity-locked', 'activity-closed', 'activity-open', 'activity-upcoming');
  
  // Update border color
  const leftBorder = card.querySelector('.activity-left-border');
  if (leftBorder) {
    leftBorder.classList.remove('border-locked', 'border-closed', 'border-open', 'border-upcoming');
    if (newStatus.status === 'locked') {
      leftBorder.classList.add('border-locked');
    } else if (newStatus.status === 'closed') {
      leftBorder.classList.add('border-closed');
    } else if (newStatus.status === 'open') {
      leftBorder.classList.add('border-open');
    } else {
      leftBorder.classList.add('border-upcoming');
    }
  }
  
  // Add new status class
  if (newStatus.status === 'locked') {
    card.classList.add('activity-locked');
  } else if (newStatus.status === 'closed') {
    card.classList.add('activity-closed');
  } else if (newStatus.status === 'open') {
    card.classList.add('activity-open');
  } else {
    card.classList.add('activity-upcoming');
  }
  
  if (isStudent) {
    // Update student view
    updateStudentActivityCard(card, newStatus);
  } else {
    // Update teacher view
    updateTeacherActivityCard(card, newStatus);
  }
  
  // Show notification ONLY if activity status changed from locked/closed to open
  // Use a global map to track which activities have already shown notifications (prevents duplicates)
  if (!window.__activityNotificationShown) {
    window.__activityNotificationShown = new Map();
  }
  
  const previousStatus = card.getAttribute('data-last-status') || getCurrentActivityStatus(card) || 'unknown';
  const statusChanged = previousStatus !== newStatus.status;
  const justUnlocked = statusChanged && newStatus.status === 'open' && newStatus.available && previousStatus !== 'open';
  
  // Only show notification if:
  // 1. Status actually changed to 'open'
  // 2. Previous status was not 'open'
  // 3. We haven't shown a notification for this activity in the last 5 seconds
  if (justUnlocked) {
    const lastNotificationTime = window.__activityNotificationShown.get(activityId) || 0;
    const now = Date.now();
    const timeSinceLastNotification = now - lastNotificationTime;
    
    // Only show if we haven't shown a notification for this activity in the last 5 seconds
    if (timeSinceLastNotification > 5000) {
      const activityTitle = card.querySelector('.activity-title')?.textContent || 'Activity';
      if (typeof window.showNotification === 'function') {
        window.showNotification('success', 'Activity Unlocked', `"${activityTitle}" is now available!`);
        window.__activityNotificationShown.set(activityId, now);
      }
    }
  }
  
  // Store current status in data attribute for next comparison
  card.setAttribute('data-last-status', newStatus.status);
}

function updateStudentActivityCard(card, newStatus) {
  // Update status badge (top right) - same structure as teacher view
  let statusBadgeContainer = card.querySelector('.activity-status-badge-top-right');
  if (!statusBadgeContainer) {
    // Create the container if it doesn't exist
    statusBadgeContainer = document.createElement('div');
    statusBadgeContainer.className = 'activity-status-badge-top-right';
    const content = card.querySelector('.activity-content');
    if (content) {
      content.insertBefore(statusBadgeContainer, content.firstChild);
    } else {
      card.insertBefore(statusBadgeContainer, card.firstChild);
    }
  }
  
  // Update the badge content
  if (newStatus.status === 'locked') {
    statusBadgeContainer.innerHTML = '<span class="activity-status-badge badge-locked"><i class="fas fa-lock"></i> Locked</span>';
  } else if (newStatus.status === 'closed') {
    statusBadgeContainer.innerHTML = '<span class="activity-status-badge badge-closed"><i class="fas fa-clock"></i> Closed</span>';
  } else if (newStatus.status === 'open') {
    statusBadgeContainer.innerHTML = '<span class="activity-status-badge badge-open"><i class="fas fa-check-circle"></i> Open</span>';
  } else {
    statusBadgeContainer.innerHTML = '<span class="activity-status-badge badge-upcoming"><i class="fas fa-hourglass-half"></i> Upcoming</span>';
  }
  
  // Remove any existing leaderboard buttons (they should not be on activity cards)
  const existingLeaderboardBtn = card.querySelector('.leaderboard-btn');
  if (existingLeaderboardBtn) {
    existingLeaderboardBtn.remove();
  }
  
  // Update start button
  const startButton = card.querySelector('.start-activity-btn, .btn-start');
  if (startButton) {
    const isLocked = newStatus.status === 'locked' || !newStatus.available;
    const isClosed = newStatus.status === 'closed';
    
    startButton.disabled = isLocked || isClosed;
    
    if (isLocked) {
      startButton.innerHTML = '<i class="fas fa-lock"></i> Locked';
      startButton.style.background = '#9ca3af';
      startButton.style.cursor = 'not-allowed';
    } else if (isClosed) {
      startButton.innerHTML = '<i class="fas fa-clock"></i> Closed';
      startButton.style.background = '#9ca3af';
      startButton.style.cursor = 'not-allowed';
    } else {
      startButton.innerHTML = '<i class="fas fa-play"></i> Start';
      startButton.style.background = '#1d9b3e';
      startButton.style.cursor = 'pointer';
    }
  }
  
  // Update status message
  const statusMessage = card.querySelector('.activity-status-message');
  if (statusMessage && newStatus.status !== 'open') {
    const reason = newStatus.status === 'locked' 
      ? 'Activity is locked. Teacher will open it soon.'
      : newStatus.status === 'closed'
      ? 'Deadline has passed.'
      : 'Activity not available.';
    statusMessage.innerHTML = `<i class="fas fa-info-circle"></i> ${reason}`;
  }
}

function updateTeacherActivityCard(card, newStatus) {
  const activityId = parseInt(card.getAttribute('data-activity-id'));
  const isLocked = newStatus.status === 'locked';
  
  // Update unlock/lock button visibility
  const unlockBtn = card.querySelector('.btn-unlock');
  const activityMenu = card.querySelector('.activity-menu');
  
  if (isLocked) {
    // Show unlock button, hide menu
    if (unlockBtn) {
      unlockBtn.style.display = 'block';
    }
    if (activityMenu) {
      activityMenu.style.display = 'none';
    }
  } else {
    // Hide unlock button, show menu
    if (unlockBtn) {
      unlockBtn.style.display = 'none';
    }
    if (activityMenu) {
      activityMenu.style.display = 'block';
    }
  }
  
  // Update status badge (top right)
  let statusBadgeContainer = card.querySelector('.activity-status-badge-top-right');
  if (!statusBadgeContainer) {
    // Create the container if it doesn't exist
    statusBadgeContainer = document.createElement('div');
    statusBadgeContainer.className = 'activity-status-badge-top-right';
    const content = card.querySelector('.activity-content');
    if (content) {
      content.insertBefore(statusBadgeContainer, content.firstChild);
    } else {
      card.insertBefore(statusBadgeContainer, card.firstChild);
    }
  }
  
  // Update the badge content
  if (newStatus.status === 'locked') {
    statusBadgeContainer.innerHTML = '<span class="activity-status-badge badge-locked"><i class="fas fa-lock"></i> Locked</span>';
  } else if (newStatus.status === 'closed') {
    statusBadgeContainer.innerHTML = '<span class="activity-status-badge badge-closed"><i class="fas fa-clock"></i> Closed</span>';
  } else if (newStatus.status === 'open') {
    statusBadgeContainer.innerHTML = '<span class="activity-status-badge badge-open"><i class="fas fa-check-circle"></i> Open</span>';
  } else {
    statusBadgeContainer.innerHTML = '<span class="activity-status-badge badge-upcoming"><i class="fas fa-hourglass-half"></i> Upcoming</span>';
  }
  
  // Update activity status circle (for teacher view)
  const activityStatusCircle = card.querySelector('.stat-circle.activity-status');
  if (activityStatusCircle) {
    const statusValue = activityStatusCircle.querySelector('.stat-value');
    const statusLabel = activityStatusCircle.querySelector('.stat-label');
    
    if (newStatus.status === 'closed' && newStatus.due_at) {
      const dueDate = new Date(newStatus.due_at);
      const hours = String(dueDate.getHours()).padStart(2, '0');
      const minutes = String(dueDate.getMinutes()).padStart(2, '0');
      if (statusValue) statusValue.textContent = `${hours}:${minutes}`;
      if (statusLabel) statusLabel.textContent = 'Activity closed';
    } else if (newStatus.status === 'open') {
      if (statusValue) statusValue.textContent = '00:00';
      if (statusLabel) statusLabel.textContent = 'Activity open';
    } else if (newStatus.status === 'locked') {
      if (statusValue) statusValue.textContent = '00:00';
      if (statusLabel) statusLabel.textContent = 'Activity locked';
    }
  }
}




