// class_dashboard.js - Activity management system

// ======================== ROLE-AWARE INITIALIZATION ========================

// Initialize role-aware features
document.addEventListener('DOMContentLoaded', function() {
  const userRole = window.__USER_ROLE__ || 'student';
  const classId = window.__CLASS_ID__;
  
  console.log('Class Dashboard initialized for role:', userRole);
  
  if (userRole && userRole.toLowerCase() === 'student') {
    initializeStudentView();
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
    const modalTitle = isRetakerMode ? 'Reschedule Activity & Set Retakers' : 'Reschedule Activity';
    const modalIcon = isRetakerMode ? 'fa-calendar-alt' : 'fa-clock';
    
    this.modal.innerHTML = `
      <div class="modal-card" style="background:#fff;border-radius:12px;padding:24px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 40px rgba(0,0,0,0.15);">
        <div class="modal-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #e5e7eb;">
          <h3 style="margin:0;color:#1f2937;font-size:20px;font-weight:700;">
            <i class="fas ${modalIcon}" style="color:#1d9b3e;margin-right:8px;"></i>
            ${modalTitle}
          </h3>
          <button id="closeRescheduleModal" style="background:none;border:none;font-size:20px;color:#6b7280;cursor:pointer;padding:4px;">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="activity-info" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:20px;">
            <h4 style="margin:0 0 8px 0;color:#374151;font-size:16px;">Activity: ${this.currentActivity.title || 'Untitled Activity'}</h4>
            <p style="margin:0;color:#6b7280;font-size:14px;">Current due date: ${this.currentActivity.dueDate || 'Not set'}</p>
            ${isRetakerMode ? '' : '<div style="margin-top:8px;padding:8px;background:#fef3c7;border:1px solid #f59e0b;border-radius:4px;color:#92400e;font-size:13px;"><i class="fas fa-info-circle" style="margin-right:4px;"></i>No students have taken this activity yet. This will reschedule for all students.</div>'}
          </div>

          <div class="reschedule-section" style="margin-bottom:24px;">
            <label style="display:block;margin-bottom:8px;color:#374151;font-weight:600;font-size:14px;">
              <i class="fas fa-clock" style="color:#1d9b3e;margin-right:6px;"></i>
              New Due Date & Time
            </label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <input type="date" id="newDueDate" style="padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;focus:border-1d9b3e;">
              <input type="time" id="newDueTime" style="padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;focus:border-1d9b3e;">
            </div>
          </div>

          ${isRetakerMode ? `
          <div class="retakers-section" style="margin-bottom:24px;">
            <label style="display:block;margin-bottom:8px;color:#374151;font-weight:600;font-size:14px;">
              <i class="fas fa-users" style="color:#1d9b3e;margin-right:6px;"></i>
              Select Students for Retake
            </label>
            <div class="student-selection" style="max-height:200px;overflow-y:auto;border:1px solid #d1d5db;border-radius:6px;padding:12px;">
              <div id="studentList" style="display:flex;flex-direction:column;gap:8px;">
                <!-- Students will be loaded here -->
              </div>
            </div>
            <div style="margin-top:8px;">
              <button id="selectAllStudents" style="background:#f3f4f6;color:#374151;border:1px solid #d1d5db;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;margin-right:8px;">Select All</button>
              <button id="clearAllStudents" style="background:#f3f4f6;color:#374151;border:1px solid #d1d5db;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;">Clear All</button>
            </div>
          </div>
          ` : ''}

          <div class="notification-section" style="margin-bottom:24px;">
            <label style="display:flex;align-items:center;gap:8px;color:#374151;font-weight:600;font-size:14px;cursor:pointer;">
              <input type="checkbox" id="sendNotification" checked style="transform:scale(1.1);">
              <i class="fas fa-bell" style="color:#1d9b3e;"></i>
              Send notification to ${isRetakerMode ? 'selected students' : 'all students'}
            </label>
          </div>
        </div>

        <div class="modal-footer" style="display:flex;gap:12px;justify-content:flex-end;padding-top:16px;border-top:1px solid #e5e7eb;">
          <button id="cancelReschedule" style="background:#f3f4f6;color:#374151;border:1px solid #d1d5db;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;">Cancel</button>
          <button id="saveReschedule" style="background:#1d9b3e;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;">
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

      const studentList = document.getElementById('studentList');
      studentList.innerHTML = students.map(student => `
        <label style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:4px;cursor:pointer;transition:background-color 0.2s;" 
               onmouseover="this.style.backgroundColor='#f3f4f6'" 
               onmouseout="this.style.backgroundColor='transparent'">
          <input type="checkbox" class="student-checkbox" data-student-id="${student.id}" style="transform:scale(1.1);">
          <div style="flex:1;">
            <div style="font-weight:600;color:#374151;font-size:14px;">${student.name}</div>
            <div style="color:#6b7280;font-size:12px;">${student.email}</div>
          </div>
        </label>
      `).join('');
    } catch (error) {
      document.getElementById('studentList').innerHTML = '<p style="color:#ef4444;text-align:center;">Error loading students</p>';
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

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Here you would make the actual API call
      const successMessage = isRetakerMode 
        ? `Activity rescheduled for ${selectedStudents.length} student(s)!`
        : 'Activity rescheduled for all students!';
      
      this.showNotification('success', successMessage);
      this.closeModal();

    } catch (error) {
      this.showNotification('error', 'Failed to save changes. Please try again.');
      
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

  // Show notification
  showNotification(type, message) {
    // You can integrate with your existing notification system
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Simple notification display
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 10000;
      padding: 12px 20px; border-radius: 6px; color: white; font-weight: 600;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
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
    async showTryAnswering(activityId, activityTitle = 'Activity') {
        console.log('🔍 DEBUG: showTryAnswering() called with:', { activityId, activityTitle });
        
        try {
            console.log('🔍 DEBUG: Fetching activity data...');
            const activityData = await this.fetchActivity(activityId);
            console.log('🔍 DEBUG: Activity data fetched successfully:', activityData);
            
            console.log('🔍 DEBUG: Calling showTryAnsweringModal...');
            window.activityTester.showTryAnsweringModal(activityId, activityData);
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
  }

  // Show try answering modal
  showTryAnsweringModal(activityId, activityData) {
    console.log('🔍 DEBUG: showTryAnsweringModal() called with:', { activityId, activityData });
    
    // Validate that we have proper activity data
    if (!activityData || !activityData.id) {
      console.error('🔍 DEBUG: Invalid activity data provided:', activityData);
      alert('Error: Invalid activity data. Please try again.');
      return;
    }
    
    try {
      // Show Try Answering modal
      this.currentActivity = { id: activityId, ...activityData };
      console.log('🔍 DEBUG: Current activity set:', this.currentActivity);
      
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
    
    this.modal.innerHTML = `
      <div class="modal-card" style="background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden;max-width:1400px;width:98%;max-height:95vh;display:flex;flex-direction:column;font-family:'Inter',sans-serif;">
        <!-- STUDENT TEST HEADER -->
        <div style="background:linear-gradient(135deg, #28a745 0%, #20c997 100%);color:white;padding:25px;font-family:'Inter',sans-serif;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <h2 style="margin:0;font-size:24px;font-weight:600;font-family:'Inter',sans-serif;">${this.currentActivity.title || 'Activity'}</h2>
            <div style="text-align:right;font-family:'Inter',sans-serif;">
              <div style="font-size:14px;opacity:0.9;font-family:'Inter',sans-serif;">Total Points</div>
              <div style="font-size:20px;font-weight:700;font-family:'Inter',sans-serif;" id="totalPoints">0</div>
            </div>
          </div>
          <div style="display:flex;gap:20px;font-size:14px;opacity:0.9;font-family:'Inter',sans-serif;">
            <span id="activityTypeDisplay" style="font-family:'Inter',sans-serif;">📝 UPLOAD BASED</span>
            <span style="font-family:'Inter',sans-serif;">⏱️ <span id="timer">No time limit</span></span>
            <span id="questionCountDisplay" style="font-family:'Inter',sans-serif;">📊 1 question</span>
          </div>
        </div>
        
        <!-- PROGRESS BAR (Hidden for upload-based activities) -->
        <div id="progress-section" style="padding:15px 20px;background:#f8f9fa;border-bottom:1px solid #e9ecef;font-family:'Inter',sans-serif;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-size:14px;color:#333;font-weight:600;font-family:'Inter',sans-serif;">⭐ Progress</span>
            <span id="progress-counter" style="font-size:14px;color:#28a745;font-weight:600;font-family:'Inter',sans-serif;">0 / 1 answered</span>
          </div>
          <div style="background:#e9ecef;border-radius:10px;height:8px;overflow:hidden;">
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
        
        <!-- SUBMIT SECTION -->
        <div id="submitSection" style="margin-top:30px;padding:25px;background:#f8f9fa;border-radius:8px;border:1px solid #e9ecef;margin:25px;font-family:'Inter',sans-serif;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:14px;color:#6c757d;margin-bottom:4px;font-family:'Inter',sans-serif;">Ready to submit?</div>
              <div style="font-size:12px;color:#6c757d;font-family:'Inter',sans-serif;">Make sure you've answered all questions</div>
            </div>
            <button id="finish-attempt-btn" style="background:linear-gradient(135deg, #28a745 0%, #20c997 100%);color:white;border:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 2px 4px rgba(40,167,69,0.3);font-family:'Inter',sans-serif;">
              Finish Attempt
            </button>
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
      this.loadQuestions();
      this.startTimer();
    });
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
      const activityData = {
        activity: this.currentActivity,
        questions: this.currentActivity.questions || [],
        settings: this.currentActivity.settings || {}
      };
      
      console.log('🔍 DEBUG: Activity data prepared:', {
        activity: activityData.activity,
        questionsCount: activityData.questions.length,
        settings: activityData.settings
      });
      
      // Store the complete activity data
      this.activityData = activityData;
      this.questions = activityData.questions;
      this.settings = activityData.settings;
      
      console.log('🔍 DEBUG: About to update activity info...');
      // Update activity info in modal
      this.updateActivityInfo(activityData.activity);
      console.log('🔍 DEBUG: Activity info updated successfully!');
      
      // For upload-based activities, show the upload interface
      if (this.questions.length === 0 && (activityData.activity.type === 'upload_based' || !activityData.activity.type)) {
        console.log('🔍 DEBUG: Showing upload-based activity interface...');
        this.displayActivityWithoutQuestions();
      } else {
        console.log('🔍 DEBUG: Showing all questions at once...');
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
      // Make real API call to get activity data (same endpoint as student test)
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.activity) {
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
      // Fallback: Try to get activity data from the current activity object
      if (this.currentActivity && this.currentActivity.questions) {
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
        <div style="border:1px solid #e9ecef;border-radius:8px;padding:30px;margin-bottom:30px;background:white;box-shadow:0 1px 3px rgba(0,0,0,0.1);font-family:'Inter',sans-serif;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h3 style="margin:0;color:#333;font-size:18px;font-weight:600;font-family:'Inter',sans-serif;">Question ${index + 1}</h3>
            <div style="background:#e9ecef;color:#495057;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;font-family:'Inter',sans-serif;">
              ${question.points || 1} point${(question.points || 1) !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div style="margin-bottom:20px;">
            <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333;font-family:'Inter',sans-serif;">${question.question_text || question.question || 'Question text not available'}</p>
          </div>
          
          ${this.renderQuestionInput(question, index)}
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
          <h3 style="margin:0;color:#333;font-size:18px;font-weight:600;font-family:'Inter',sans-serif;">Question ${this.currentQuestionIndex + 1}</h3>
          <div style="background:#e9ecef;color:#495057;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;font-family:'Inter',sans-serif;">
            ${question.points || 1} point${(question.points || 1) !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div style="margin-bottom:20px;">
          <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333;font-family:'Inter',sans-serif;">${question.question_text || question.question || 'Question text not available'}</p>
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
    // Check for question type from multiple possible sources
    const questionType = question.type || question.activity_type || this.currentActivity?.type || 'multiple_choice';
    
    let result;
    switch (questionType) {
      case 'multiple_choice':
        result = this.renderMultipleChoiceInput(question, questionIndex);
        break;
      case 'true_false':
        result = this.renderTrueFalseInput(question, questionIndex);
        break;
      case 'identification':
        result = this.renderIdentificationInput(question, questionIndex);
        break;
      case 'essay':
        result = this.renderEssayInput(question, questionIndex);
        break;
      case 'upload_based':
      case 'UPLOAD_BASED':
        result = this.renderUploadInput(question, questionIndex);
        break;
      default:
        result = this.renderMultipleChoiceInput(question, questionIndex);
    }
    
    return result;
  }

  // Render multiple choice input
  renderMultipleChoiceInput(question, questionIndex) {
    const choices = question.choices || [];
    let choicesHtml = '';
    
    choices.forEach((choice, index) => {
      const choiceLabel = String.fromCharCode(65 + index); // A, B, C, D, E, etc.
      choicesHtml += `
        <div class="choice-container" data-question="${questionIndex}" data-choice="${choice.id}" 
             style="margin-bottom:16px;padding:16px;border:1px solid #e9ecef;border-radius:8px;background:#f8f9fa;cursor:pointer;transition:all 0.2s ease;">
          <label style="display:flex;align-items:center;cursor:pointer;margin:0;">
            <input type="radio" name="question_${questionIndex}" value="${choice.id}" 
                   style="margin-right:16px;transform:scale(1.3);">
            <span style="flex:1;font-size:15px;line-height:1.6;">
              <strong>${choiceLabel}.</strong> ${choice.choice_text || choice.text || 'Choice ' + (index + 1)}
            </span>
          </label>
        </div>
      `;
    });
    
    return `
      <div style="margin-top:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h4 style="margin:0;color:#333;font-size:16px;">Select your answer:</h4>
          <button type="button" onclick="window.activityTester.clearAnswer('${questionIndex}')" 
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
  renderTrueFalseInput(question, questionIndex) {
    return `
      <div style="margin-top:20px;">
        <h4 style="margin:0 0 16px 0;color:#333;font-size:16px;">Select your answer:</h4>
        <div style="display:flex;gap:16px;">
          <div class="choice-container" data-question="${questionIndex}" data-choice="true" 
               style="display:flex;align-items:center;padding:12px 24px;border:1px solid #e9ecef;border-radius:6px;background:#f8f9fa;cursor:pointer;flex:1;justify-content:center;transition:all 0.2s ease;">
            <input type="radio" name="question_${questionIndex}" value="true" style="margin-right:8px;transform:scale(1.2);">
            <span style="font-size:16px;font-weight:600;color:#28a745;">TRUE</span>
          </div>
          <div class="choice-container" data-question="${questionIndex}" data-choice="false" 
               style="display:flex;align-items:center;padding:12px 24px;border:1px solid #e9ecef;border-radius:6px;background:#f8f9fa;cursor:pointer;flex:1;justify-content:center;transition:all 0.2s ease;">
            <input type="radio" name="question_${questionIndex}" value="false" style="margin-right:8px;transform:scale(1.2);">
            <span style="font-size:16px;font-weight:600;color:#dc3545;">FALSE</span>
          </div>
        </div>
      </div>
    `;
  }

  // Render identification input
  renderIdentificationInput(question, questionIndex) {
    return `
      <div style="margin-top:20px;">
        <h4 style="margin:0 0 16px 0;color:#333;font-size:16px;">Type your answer:</h4>
        <input type="text" name="question_${questionIndex}" 
               style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;font-size:16px;font-family:'Inter',sans-serif;"
               placeholder="Enter your answer here..."
               oninput="window.activityTester.saveAnswer('${questionIndex}', this.value)">
      </div>
    `;
  }

  // Render essay input
  renderEssayInput(question, questionIndex) {
    return `
      <div style="margin-top:20px;">
        <h4 style="margin:0 0 16px 0;color:#333;font-size:16px;">Write your answer:</h4>
        <textarea name="question_${questionIndex}" rows="6" 
                  style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;font-size:16px;font-family:'Inter',sans-serif;resize:vertical;"
                  placeholder="Write your essay answer here..."
                  oninput="window.activityTester.saveAnswer('${questionIndex}', this.value)"></textarea>
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
    return `
      <div class="coding-interface" style="border:1px solid #e5e7eb;border-radius:12px;padding:32px;background:#f8fafc;max-width:700px;margin:0 auto;">
        <h4 style="margin:0 0 16px 0;color:#374151;font-size:18px;">Coding Challenge</h4>
        
        <div style="background:#1f2937;border-radius:8px;padding:20px;margin-bottom:24px;">
          <h5 style="margin:0 0 12px 0;color:#f9fafb;font-size:16px;">Problem Statement:</h5>
          <p style="margin:0;color:#d1d5db;font-size:14px;line-height:1.6;">${activity.problem || 'Complete the coding challenge.'}</p>
        </div>
        
        <div class="code-editor" style="margin-bottom:24px;">
          <textarea id="activityCode" 
                    placeholder="Write your code here..." 
                    style="width:100%;min-height:300px;padding:16px;border:1px solid #d1d5db;border-radius:8px;font-family:'Courier New',monospace;font-size:14px;background:#fff;resize:vertical;">${this.answers['code'] || ''}</textarea>
        </div>
        
        <div style="display:flex;gap:16px;justify-content:center;">
          <button onclick="window.activityTester.runActivityCode()" 
                  style="background:#f59e0b;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">
            <i class="fas fa-play" style="margin-right:8px;"></i>
            Run Code
          </button>
          <button onclick="window.activityTester.saveActivityCode()" 
                  style="background:#1d9b3e;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">
            <i class="fas fa-save" style="margin-right:8px;"></i>
            Save Code
          </button>
        </div>
      </div>
    `;
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

  // Run activity code
  runActivityCode() {
    const code = document.getElementById('activityCode').value;
    this.showNotification('info', 'Code execution would happen here');
  }

  // Save activity code
  saveActivityCode() {
    const code = document.getElementById('activityCode').value;
    this.answers['code'] = code;
    this.showNotification('success', 'Code saved successfully!');
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
  renderTrueFalse(question) {
    const trueChecked = this.answers[question.id] === true ? 'checked' : '';
    const falseChecked = this.answers[question.id] === false ? 'checked' : '';
    
    return `
      <div class="options" style="display:flex;gap:20px;">
        <label style="display:flex;align-items:center;gap:8px;padding:12px 20px;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;transition:all 0.2s;" 
               onmouseover="this.style.backgroundColor='#f8fafc'" 
               onmouseout="this.style.backgroundColor='transparent'">
          <input type="radio" name="question_${question.id}" value="true" ${trueChecked} 
                 onchange="window.activityTester.saveAnswer(${question.id}, true)" 
                 style="transform:scale(1.2);">
          <span style="color:#374151;font-size:15px;font-weight:600;">True</span>
        </label>
        <label style="display:flex;align-items:center;gap:8px;padding:12px 20px;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;transition:all 0.2s;" 
               onmouseover="this.style.backgroundColor='#f8fafc'" 
               onmouseout="this.style.backgroundColor='transparent'">
          <input type="radio" name="question_${question.id}" value="false" ${falseChecked} 
                 onchange="window.activityTester.saveAnswer(${question.id}, false)" 
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
    // If answer is empty or just whitespace, remove it from answers
    if (!answer || answer.trim() === '') {
      delete this.answers[questionId];
      console.log('🔍 DEBUG: Empty answer removed for question', questionId);
    } else {
      this.answers[questionId] = answer;
      console.log('🔍 DEBUG: Answer saved for question', questionId, ':', answer);
    }
    
    this.updateProgress();
    
    // Auto-save progress to database
    this.saveProgressToDatabase();
  }

  // Save progress to database
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
      
      console.log('🔍 DEBUG: Saving progress to database:', progressData);
      
      const response = await fetch('save_activity_progress.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Progress saved successfully:', result);
      } else {
        console.error('❌ Failed to save progress:', response.statusText);
      }
      
    } catch (error) {
      console.error('❌ Error saving progress:', error);
    }
  }
  
  // Load existing progress from database
  async loadExistingProgress() {
    try {
      if (!this.currentActivity || !this.currentActivity.id) {
        console.log('🔍 DEBUG: No activity ID available for loading progress');
        return;
      }
      
      const response = await fetch(`get_activity_progress.php?activity_id=${this.currentActivity.id}&user_id=${window.__USER_ID__ || 0}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          console.log('✅ Loaded existing progress:', result.data);
          
          // Restore answers
          if (result.data.answers) {
            this.answers = result.data.answers;
            
            // Restore form values
            this.restoreFormValues();
            
            // Update progress display
            this.updateProgress();
          }
        }
      } else {
        console.log('🔍 DEBUG: No existing progress found');
      }
      
    } catch (error) {
      console.error('❌ Error loading existing progress:', error);
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
      finishBtn.addEventListener('click', () => this.submitActivity());
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

  // Submit activity
  async submitActivity() {
    try {
      const submitBtn = document.getElementById('submitActivity');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:6px;"></i>Submitting...';
      submitBtn.disabled = true;

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const timeSpent = new Date() - this.startTime;
      console.log('Activity submitted:', {
        activityId: this.currentActivity.id,
        answers: this.answers,
        timeSpent: timeSpent,
        completedAt: new Date()
      });

      this.showNotification('success', 'Activity submitted successfully!');
      this.closeModal();
    } catch (error) {
      this.showNotification('error', 'Failed to submit activity. Please try again.');
    }
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
    }
  }

  // Show notification
  showNotification(type, message) {
    console.log(`${type.toUpperCase()}: ${message}`);
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 10000;
      padding: 12px 20px; border-radius: 6px; color: white; font-weight: 600;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Create global instance
window.activityTester = new ActivityTester();
// ======================== END ACTIVITY TESTER CLASS ========================

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
    if (e.target.textContent && e.target.textContent.includes('Try answering')) {
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
        // placeholder
      }
    });
  });

  // Sidebar options
  document.querySelectorAll('.sidebar-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-option').forEach(o => o.classList.remove('active'));
      option.classList.add('active');
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
          
          // Generate activity cards for each real activity
          
          const activitiesHtml = activities.map((activity, activityIdx) => {
            const activityTitle = escapeHtml(activity.title || 'Untitled Activity');
            const activityType = activity.type || 'upload_based';
            const maxScore = activity.max_score || 10;
            
            return (
              '<div class="activity-card" data-activity-id="' + activity.id + '">' +
                '<div class="activity-left-border"></div>' +
                '<div class="activity-content">' +
                  '<div class="activity-title">' + activityTitle + '</div>' +
                  '<div class="activity-dates">' +
                    '<div class="activity-date start"><i class="fas fa-calendar-check"></i> 03 May 2025 06:24PM</div>' +
                    '<div class="activity-date end"><i class="fas fa-calendar-times"></i> 04 May 2025 12:00AM</div>' +
                  '</div>' +
                '</div>' +
                '<div class="activity-stats">' +
                  '<div class="stat-circle">' +
                    '<div class="stat-value">0/' + maxScore + '</div>' +
                    '<div class="stat-label">Avg. overall s</div>' +
                  '</div>' +
                  '<div class="stat-circle">' +
                    '<div class="stat-value">00:00</div>' +
                    '<div class="stat-label">Activity Actions</div>' +
                  '</div>' +
                  '<div class="activity-menu">' +
                    '<i class="fas fa-ellipsis-v"></i>' +
                    '<div class="activity-dropdown">' +
                      '<div class="dropdown-item"><i class="fas fa-calendar"></i> Reschedule/Set retakers</div>' +
                      '<div class="dropdown-item"><i class="fas fa-play"></i> Try answering</div>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>'
            );
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
                  '<div class="topic-status">Students currently here</div>' +
                  '<div class="topic-count">N/A</div>' +
                '</div>' +
              '</div>' +
              '<div class="topic-body" style="display: none;">' +
                '<div class="topic-content-row">' +
                  '<div class="topic-doc-icon"><i class="fas fa-file-alt"></i></div>' +
                  '<div class="topic-content-link">Topic Content</div>' +
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
      
      // Rebind headers for expand/collapse and lazy load
      const newTopicHeaders = document.querySelectorAll('.topic-header');
      
      newTopicHeaders.forEach((header, index) => {
        header.addEventListener('click', () => {
          toggleTopic(header.closest('.topic-item'));
        });
      });
      
      // Bind event listeners for main dashboard activity menus
      const mainActivityMenus = document.querySelectorAll('.activity-menu');
      mainActivityMenus.forEach((menu, index) => {
        // Bind dropdown toggle
        menu.addEventListener('click', (e) => {
          e.stopPropagation();
          const dropdown = menu.querySelector('.activity-dropdown');
          if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
          }
        });
        
        // Bind dropdown items
        const dropdownItems = menu.querySelectorAll('.dropdown-item');
        dropdownItems.forEach((dropdownItem, itemIndex) => {
          console.log(`🔍 Binding dropdown item ${itemIndex}:`, dropdownItem.textContent.trim());
          dropdownItem.addEventListener('click', (e) => {
            e.stopPropagation();
            const text = dropdownItem.textContent.trim();
            if (text.includes('Reschedule/Set retakers')) {
              // CLEAN: Use the clean activity system
              const activityCard = menu.closest('.activity-card');
              const activityId = activityCard?.getAttribute('data-activity-id');
              if (!activityId) {
                console.error('❌ No data-activity-id found on activity card:', activityCard);
                return;
              }
              const activityTitle = activityCard?.querySelector('.activity-title')?.textContent || 'Activity';
              const dueDate = activityCard?.querySelector('.due-date')?.textContent || 'Not set';
              
              window.cleanActivitySystem.showReschedule(activityId, activityTitle, dueDate);
            } else if (text.includes('Try answering')) {
              // CLEAN: Use the clean activity system
              const activityCard = menu.closest('.activity-card');
              const activityId = activityCard?.getAttribute('data-activity-id');
              if (!activityId) {
                console.error('❌ No data-activity-id found on activity card:', activityCard);
                return;
              }
              const activityTitle = activityCard?.querySelector('.activity-title')?.textContent || 'Activity';
              
        console.log('🔍 Main dashboard Try Answering clicked for activity:', {
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
        
        window.cleanActivitySystem.showTryAnswering(activityId, activityTitle);
            }
            
            // Close dropdown after action
            const dropdown = menu.querySelector('.activity-dropdown');
            if (dropdown) {
              dropdown.style.display = 'none';
            }
          });
        });
      });
      
      // Close dropdowns when clicking outside
      document.addEventListener('click', () => {
        mainActivityMenus.forEach(menu => {
          const dropdown = menu.querySelector('.activity-dropdown');
          if (dropdown) {
            dropdown.style.display = 'none';
          }
        });
      });
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
      loadTopicContent(item, lessonId);
      body.setAttribute('data-loaded', 'true');
    } else {
      }
  } else {
    }
  if (!lessonId) { body.innerHTML = '<div style="color:#64748b;">No details available.</div>'; return; }
  fetch('class_view_api.php?action=get_lesson_details&lesson_id=' + encodeURIComponent(lessonId), { credentials: 'same-origin' })
    .then(r=>r.json()).then(res => {
      if (!res || !res.success) { body.innerHTML = '<div style="color:#ef4444;">Failed to load lesson details.</div>'; return; }
      const materials = Array.isArray(res.materials) ? res.materials : [];
      const activities = Array.isArray(res.activities) ? res.activities : [];
      const matRow = '<div class="topic-content-row">' +
        '<div class="topic-doc-badge"><i class="fas fa-file-alt"></i></div>' +
        '<div class="topic-content-badge">Lesson Content</div>' +
      '</div>';

      let actCards = '';
      if (activities.length) {
        actCards = activities.map((a, i) => {
          const title = escapeHtml(a.title || 'Activity');
          return (
            '<div class="activity-card-lite" data-activity-index="' + i + '">' +
              '<div style="flex:1 1 auto; min-width:0;">' +
                '<div class="topic-activity-title">' + title + '</div>' +
                '<div class="meta-chips">' +
                  '<span class="chip">Activity</span>' +
                  '<span class="chip chip-muted">Static preview</span>' +
                '</div>' +
              '</div>' +
            '</div>'
          );
        }).join('');
      } else {
        actCards = '<div class="activity-card-lite"><div class="topic-activity-title">No activities</div><div class="meta-chips"><span class="chip chip-muted">Static preview</span></div></div>';
      }

      body.innerHTML = matRow + actCards;
      const badge = item.querySelector('.topic-content-badge');
      if (badge) {
        badge.style.cursor = 'pointer';
        badge.addEventListener('click', () => {
          if (!Array.isArray(materials) || materials.length === 0) { openMaterialsModal(materials); return; }
          const first = materials[0] || {};
          if (materials.length > 1 && typeof window.showInfo === 'function') {
            window.showInfo('Opening material', 'Multiple materials found; opening the first one.');
          }
          openMaterialViewer(first);
        });
      }
      body.querySelectorAll('.activity-card-lite').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
          const idx = parseInt(card.getAttribute('data-activity-index')||'0',10);
          const act = activities[idx];
          if (!act) return;
          if (act.launch_url) { window.open(act.launch_url, '_blank'); return; }
          openActivityModal(act);
        });
      });
    }).catch(()=>{ body.innerHTML = '<div style="color:#ef4444;">Network error.</div>'; });
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
      
      // Topic Content section
      if (materials.length > 0) {
        contentHtml += '<div class="topic-content-row">' +
          '<div class="topic-doc-icon"><i class="fas fa-file-alt"></i></div>' +
          '<div class="topic-content-link">Topic Content</div>' +
        '</div>';
      }
      
      // Activity cards
      activities.forEach((activity, idx) => {
        });
      
      if (activities.length > 0) {
        activities.forEach((activity, i) => {
          const title = escapeHtml(activity.title || 'Activity');
          console.log(`🔍 loadTopicContent: Generating activity card for: ${title} (ID: ${activity.id}, Type: ${activity.type})`);
          contentHtml += '<div class="activity-card" data-activity-id="' + activity.id + '">' +
            '<div class="activity-left-border"></div>' +
            '<div class="activity-content">' +
              '<div class="activity-title">' + title + '</div>' +
              '<div class="activity-dates">' +
                '<div class="activity-date start"><i class="fas fa-calendar-check"></i> 03 May 2025 06:24PM</div>' +
                '<div class="activity-date end"><i class="fas fa-calendar-times"></i> 04 May 2025 12:00AM</div>' +
              '</div>' +
            '</div>' +
            '<div class="activity-stats">' +
              '<div class="stat-circle">' +
                '<div class="stat-value">0/10</div>' +
                '<div class="stat-label">Avg. overall s</div>' +
              '</div>' +
              '<div class="stat-circle">' +
                '<div class="stat-value">00:00</div>' +
                '<div class="stat-label">Activity Actions</div>' +
              '</div>' +
              '<div class="activity-menu">' +
                '<i class="fas fa-ellipsis-v"></i>' +
                '<div class="activity-dropdown">' +
                  '<div class="dropdown-item"><i class="fas fa-calendar"></i> Reschedule/Set retakers</div>' +
                  '<div class="dropdown-item"><i class="fas fa-play"></i> Try answering</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>';
        });
      }
      
      // If no content, show message
      if (!contentHtml) {
        contentHtml = '<div style="text-align:center;padding:20px;color:#64748b;">No content available for this topic.</div>';
      }
      
      body.innerHTML = contentHtml;
      
      // Bind event listeners
      bindTopicContentEvents(item, materials, activities);
      }).catch(() => {
      body.innerHTML = '<div style="color:#ef4444;">Failed to load lesson details.</div>';
    });
}

function bindTopicContentEvents(item, materials, activities) {
  // Bind topic content link
  const contentLink = item.querySelector('.topic-content-link');
  if (contentLink && materials.length > 0) {
    contentLink.addEventListener('click', () => {
      if (materials.length > 0) {
        const firstMaterial = materials[0];
        if (materials.length > 1) {
          if (window.showInfo) window.showInfo('Multiple Materials', 'Opening first material. ' + (materials.length - 1) + ' more available.');
        }
        openMaterialViewer(firstMaterial);
      }
    });
  }
  
  // Bind activity menu dropdowns
  item.querySelectorAll('.activity-menu').forEach((menu, idx) => {
    menu.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = menu.querySelector('.activity-dropdown');
      if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
      }
    });
  });
  
  // Add click handlers for dropdown items
  const dropdownItems = item.querySelectorAll('.dropdown-item');
  item.querySelectorAll('.dropdown-item').forEach((dropdownItem, index) => {
    console.log(`🔍 Binding dropdown item ${index}:`, dropdownItem.textContent.trim());
    dropdownItem.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = dropdownItem.textContent.trim();
      if (text.includes('Reschedule/Set retakers')) {
        // Find the activity card that contains this dropdown
        const activityCard = dropdownItem.closest('.activity-card');
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
        const dueDate = activityCard.querySelector('.due-date')?.textContent || 'Not set';
        
        // Show reschedule modal
        window.activityManager.showRescheduleModal(activityId, {
          title: activityTitle,
          dueDate: dueDate
        });
      } else if (text.includes('Try answering')) {
        // Find the activity card that contains this dropdown
        const activityCard = dropdownItem.closest('.activity-card');
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
        
        // Use the clean activity system to fetch REAL data from database
        window.cleanActivitySystem.showTryAnswering(activityId, activityTitle);
      }
      
      // Close dropdown after action
      item.querySelectorAll('.activity-dropdown').forEach(dropdown => {
        dropdown.style.display = 'none';
      });
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    item.querySelectorAll('.activity-dropdown').forEach(dropdown => {
      dropdown.style.display = 'none';
    });
  });
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


