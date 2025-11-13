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

// ===== CSRF TOKEN MANAGEMENT =====

// ===== Construct Usage Detection (language-agnostic heuristics) =====
function detectConstructUsage(source, language, required) {
  try {
    const lang = String(language || '').toLowerCase();
    let code = String(source || '');
    // Strip comments (C/Java/C++ // and /* */, Python #)
    try {
      code = code.replace(/\/\*[^]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '').replace(/(^|\s)#.*$/gm, '');
    } catch(_){}

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
    const ok = !!used[needs];
    return { ok, used };
  } catch(_) {
    return { ok: true, used: {} };
  }
}
let csrfToken = null;
let csrfTokenTs = 0; // epoch ms when fetched

async function getCSRFToken() {
  // Refresh token if missing or older than 5 minutes
  try {
    if (csrfToken && (Date.now() - csrfTokenTs) < 5 * 60 * 1000) {
      console.log('🔐 [CSRF] Using cached token');
      return csrfToken;
    }
  } catch(_) {}
  
  try {
    let fd = new FormData();
    fd.append('action','get_csrf_token');
    const response = await fetch('course_outline_manage.php', {
      method: 'POST',
      body: fd,
      credentials: 'same-origin'
    });
    const data = await response.json();
    if (data.success && data.token) {
      csrfToken = data.token;
      csrfTokenTs = Date.now();
      console.log('🔐 [CSRF] Fetched new token', csrfToken.substring(0, 12) + '...');
      return csrfToken;
    } else {
      console.warn('⚠️ [CSRF] Token fetch response invalid', data);
    }
  } catch (e) {
    console.error('❌ [CSRF] Token fetch failed', e);
  }
  return null;
}

async function addCSRFToken(formData) {
  const token = await getCSRFToken();
  if (token) {
    formData.append('csrf_token', token);
    console.log('🔐 [CSRF] Token appended to FormData');
  } else {
    console.warn('⚠️ [CSRF] No token available to append');
  }
  return formData;
}

// ===== COORDINATOR DASHBOARD FUNCTIONS =====

// ===== Generic autosave for Create Activity modal (all types) =====
function cafMakeDraftKey(lessonId, type){
  try { return 'cr_caf_draft_' + String(lessonId) + '_' + String(type||'any'); } catch(_){ return 'cr_caf_draft_any'; }
}

function cafSnapshot(modal){
  const data = { values:{}, checked:{}, htmlLists:{} };
  try {
    const fields = modal.querySelectorAll('input, textarea, select');
    fields.forEach(function(el){
      const key = el.id || el.name || el.getAttribute('data-key');
      if (!key) return;
      if (el.type === 'checkbox' || el.type === 'radio') {
        data.checked[key] = el.checked;
      } else {
        data.values[key] = el.value;
      }
    });
    // Capture simple lists text (like dynamically added choices with no stable ids) by index using data-field="choice_text"
    const listInputs = modal.querySelectorAll('[data-field]');
    listInputs.forEach(function(el, idx){
      const name = el.getAttribute('data-field');
      const k = name + ':' + idx;
      if (el.type === 'checkbox' || el.type === 'radio') data.checked[k] = el.checked; else data.values[k] = el.value;
    });
    data.ts = Date.now();
  } catch(_){ }
  return data;
}

function cafRestore(modal, snap){
  if (!snap || typeof snap !== 'object') return;
  try {
    Object.keys(snap.values||{}).forEach(function(key){
      const el = modal.querySelector('#'+CSS.escape(key)) || modal.querySelector('[name="'+CSS.escape(key)+'"]') || modal.querySelector('[data-key="'+CSS.escape(key)+'"]');
      if (el && (el.tagName==='INPUT' || el.tagName==='TEXTAREA' || el.tagName==='SELECT')) { el.value = snap.values[key]; el.dispatchEvent(new Event('input', { bubbles:true })); }
    });
    Object.keys(snap.checked||{}).forEach(function(key){
      const el = modal.querySelector('#'+CSS.escape(key)) || modal.querySelector('[name="'+CSS.escape(key)+'"]') || modal.querySelector('[data-key="'+CSS.escape(key)+'"]');
      if (el && (el.type==='checkbox' || el.type==='radio')) { el.checked = !!snap.checked[key]; el.dispatchEvent(new Event('change', { bubbles:true })); }
    });
    // Restore data-field indexed items
    const listInputs = modal.querySelectorAll('[data-field]');
    listInputs.forEach(function(el, idx){
      const name = el.getAttribute('data-field');
      const k = name + ':' + idx;
      if (k in (snap.values||{})) { el.value = snap.values[k]; el.dispatchEvent(new Event('input', { bubbles:true })); }
      if (k in (snap.checked||{})) { el.checked = !!snap.checked[k]; el.dispatchEvent(new Event('change', { bubbles:true })); }
    });
  } catch(_){ }
}

function cafEnableAutosave(modal, lessonId, type){
  const key = cafMakeDraftKey(lessonId, type);
  // Try restore existing snapshot
  try { const raw = localStorage.getItem(key); if (raw) cafRestore(modal, JSON.parse(raw)); } catch(_){ }
  let saveTimer = null;
  function scheduleSave(){
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function(){
      try { localStorage.setItem(key, JSON.stringify(cafSnapshot(modal))); } catch(_){ }
    }, 250);
  }
  modal.addEventListener('input', scheduleSave, true);
  modal.addEventListener('change', scheduleSave, true);
  return function clearDraft(){ try { localStorage.removeItem(key); } catch(_){ } };
}

// Initialize coordinator tabs
function initCoordinatorTabs() {
  // Handle URL section parameter
  const urlParams = new URLSearchParams(window.location.search);
  const section = urlParams.get('section');
  
  if (section) {
    showSection(section);
  }
  
  // Set up sidebar navigation
  const sidebarNav = document.getElementById('coordinatorSidebarNav');
  if (sidebarNav) {
    sidebarNav.addEventListener('click', function(e) {
      const li = e.target.closest('li[data-section]');
      if (!li) return;
      
      // Remove active from all
      sidebarNav.querySelectorAll('li').forEach(item => item.classList.remove('active'));
      li.classList.add('active');
      
      // Show the selected section
      showSection(li.dataset.section);
      
      // Close sidebar on mobile
      if (window.innerWidth <= 900) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('open');
      }
    });
  }
}

// Function to show a specific section
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section-content').forEach(section => {
    section.classList.remove('active');
    section.style.display = 'none';
  });
  
  // Show the selected section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
    targetSection.style.display = 'block';
    // Load section-specific content
    if (sectionId === 'dashboard') {
      loadCoordinatorDashboardStats();
    } else if (sectionId === 'courses') {
      initCoordinatorCourses();
    } else if (sectionId === 'archiveCoord') {
      initCoordinatorArchive();
    } else if (sectionId === 'uploads') {
      initCoordinatorUploads();
    } else if (sectionId === 'profile') {
      if (typeof initSharedProfile === 'function') {
        try { initSharedProfile(); } catch (e) { }
      }
    }
  } else {
  }
}

// Load coordinator dashboard statistics
function loadCoordinatorDashboardStats() {
  fetch('coordinator_dashboard_counts.php', { credentials: 'same-origin' })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        // Update dashboard statistics
        const elements = {
          'coordTotalStudents': data.data.total_students || 0,
          'coordTotalTeachers': data.data.total_teachers || 0,
          'coordActiveCourses': data.data.active_courses || 0,
          'coordDraftCourses': data.data.draft_courses || 0,
          'coordMaterialsUploaded': data.data.materials_uploaded || 0
        };
        
        Object.keys(elements).forEach(id => {
          const element = document.getElementById(id);
          if (element) {
            element.textContent = elements[id];
          } else {
          }
        });
        
        // Load recent registrations
        loadRecentRegistrations();
        loadRecentLogins();
      } else {
      }
    })
    .catch(err => {
    });
}

// Load recent registrations
function loadRecentRegistrations() {
  fetch('coordinator_recent_registrations.php', { credentials: 'same-origin' })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        updateRecentRegistrations(data.data);
      } else {
      }
    })
    .catch(err => {
    });
}

// Update recent registrations display
function updateRecentRegistrations(registrations) {
  const container = document.getElementById('coordRecentlyRegistered');
  if (!container) return;
  
  if (registrations && registrations.length > 0) {
    container.innerHTML = registrations.map(user => {
      const role = (user.role || '').toLowerCase();
      const icon = role === 'admin' ? 'user-shield' : role === 'teacher' ? 'user-tie' : role === 'coordinator' ? 'chalkboard-teacher' : 'user-graduate';
      const colorClass = role === 'admin' ? 'admin-red' : role === 'teacher' ? 'teacher-yellow' : role === 'coordinator' ? 'coordinator-grey' : 'student-green';
      return `
        <div class="activity-item">
          <div class="activity-avatar ${colorClass}"><i class="fas fa-${icon}"></i></div>
          <div class="activity-content">
            <div class="activity-title">${user.name} <span class="activity-badge ${colorClass}">${(user.role||'').toUpperCase()}</span></div>
            <div class="activity-time">${user.time || ''}</div>
          </div>
        </div>
      `;
    }).join('');
  } else {
    container.innerHTML = '<div class="coordinator-empty-state">No recent registrations</div>';
  }
}

// Load recent logins
function loadRecentLogins() {
  fetch('coordinator_recent_logins.php', { credentials: 'same-origin' })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        updateRecentLogins(data.data);
      } else {
      }
    })
    .catch(err => {
    });
}

// Update recent logins display
function updateRecentLogins(logins) {
  const container = document.getElementById('coordRecentlyLogin');
  if (!container) return;
  
  if (logins && logins.length > 0) {
    container.innerHTML = logins.map(user => {
      const role = (user.role || '').toLowerCase();
      const icon = role === 'admin' ? 'user-shield' : role === 'teacher' ? 'user-tie' : role === 'coordinator' ? 'chalkboard-teacher' : 'user-graduate';
      const colorClass = role === 'admin' ? 'admin-red' : role === 'teacher' ? 'teacher-yellow' : role === 'coordinator' ? 'coordinator-grey' : 'student-green';
      return `
        <div class="activity-item">
          <div class="activity-avatar ${colorClass}"><i class="fas fa-${icon}"></i></div>
          <div class="activity-content">
            <div class="activity-title">${user.name} <span class="activity-badge ${colorClass}">${(user.role||'').toUpperCase()}</span></div>
            <div class="activity-time">${user.time || ''}</div>
          </div>
        </div>
      `;
    }).join('');
  } else {
    container.innerHTML = '<div class="coordinator-empty-state">No recent logins</div>';
  }
}
// Initialize coordinator courses
function initCoordinatorCourses() {
  // Set up create course button
  const createBtn = document.getElementById('createCourseBtn');
  if (createBtn) {
    createBtn.onclick = function() {
      ensureCreateCourseModal();
    };
  } else {
  }

  // Optional search/filter wiring if elements exist
  const searchInput = document.getElementById('courseSearch');
  const statusFilter = document.getElementById('courseStatusFilter');
  if (searchInput) {
    let searchTimer = null;
    searchInput.oninput = function() {
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(() => loadCoordinatorCourses(), 250);
    };
  }
  if (statusFilter) {
    statusFilter.onchange = function() { loadCoordinatorCourses(); };
  }
  
  // Load courses
  loadCoordinatorCourses();
}
// Load coordinator courses
function loadCoordinatorCourses() {
  // Build query from optional search/filter
  const params = new URLSearchParams();
  const s = document.getElementById('courseSearch');
  const f = document.getElementById('courseStatusFilter');
  if (s && s.value) params.set('search', s.value.trim());
  if (f && f.value) params.set('status', f.value);

  fetch('courses_list_ajax.php' + (params.toString() ? ('?' + params.toString()) : ''), { credentials: 'same-origin' })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        renderCoordinatorCourses(data.data);
      } else {
      }
    })
    .catch(err => {
    });
}

// Status normalization utility
function normalizeStatus(rawStatus) {
  const status = String(rawStatus || '').toLowerCase().trim();
  const validStatuses = ['draft', 'published', 'archived'];
  const result = validStatuses.includes(status) ? status : 'draft';
  return result;
}

function getStatusLabel(status) {
  const labels = {
    'draft': 'DRAFT',
    'published': 'PUBLISHED', 
    'archived': 'ARCHIVED'
  };
  return labels[status] || 'DRAFT';
}

// Render coordinator courses
function renderCoordinatorCourses(courses) {
  const table = document.getElementById('coursesTableWrapper');
  if (!table) return;
  
  if (!courses || courses.length === 0) {
    table.innerHTML = '<div class="empty-state">No courses found</div>';
    return;
  }
  
  table.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Code</th>
          <th>Title</th>
          <th>Language</th>
          <th>Status</th>
          <th>Modules</th>
          <th>Topics</th>
          <th>Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${courses.map(course => {
          const id = course.id || course.course_id || course.ID || course.Id;
          const code = course.code || course.course_code || '';
          const title = course.title || course.course_title || '';
          const rawStatus = course.status || course.course_status || '';
          const statusKey = normalizeStatus(rawStatus);
          const statusLabel = getStatusLabel(statusKey);
          const modulesCount = course.modules_count != null ? course.modules_count : (course.modulesCount || course.modules || 0);
          const lessonsCount = course.lessons_count != null ? course.lessons_count : (course.lessonsCount || course.lessons || 0);
          const updatedRaw = course.updated_at || course.updated || course.last_updated;
          const updatedTxt = updatedRaw ? new Date(updatedRaw).toLocaleString() : '';
          const description = course.description || '';
          const language = course.language || '';
          return `
          <tr>
            <td class="course-code">${code}</td>
            <td class="course-title">
              <div class="course-title-main">${title}</div>
              ${description ? `<div class="course-description">${description}</div>` : ''}
            </td>
            <td class="course-language">
              ${language ? `<span class="language-badge">${language}</span>` : '<span class="no-language">Not specified</span>'}
            </td>
            <td><span class="course-status ${statusKey}">${statusLabel}</span></td>
            <td class="course-stats">${modulesCount}</td>
            <td class="course-stats">${lessonsCount}</td>
            <td class="course-updated">${updatedTxt}</td>
            <td class="course-actions">
              <button class="action-btn edit" onclick="editCourse(${id}); return false;" data-id="${id}" data-code="${code}" data-title="${title}">Edit</button>
              <button class="action-btn outline" onclick="viewOutline(${id}); return false;">Outline</button>
              ${statusKey !== 'published' ? 
                `<button class=\"action-btn publish\" onclick=\"publishCourse(${id}, 'published', this, event); return false;\">Publish</button>` : 
                `<button class=\"action-btn publish\" onclick=\"publishCourse(${id}, 'draft', this, event); return false;\">Unpublish</button>`
              }
              <button class="action-btn archive" onclick="archiveCourse(${id}, this, event); return false;">Archive</button>
              <button class="action-btn delete" onclick="deleteCourse(${id}); return false;">Delete</button>
            </td>
          </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}
// Create course modal
function ensureCreateCourseModal() {
  let modal = document.getElementById('createCourseModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'createCourseModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <h3 class="modal-title">Create New Course</h3>
          <button type="button" class="modal-close" onclick="closeCreateCourseModal()">&times;</button>
        </div>
        <form id="createCourseForm">
          <div class="form-section">
            <h4 class="section-title">Basic Information</h4>
            
            <div class="form-group">
              <label class="modal-label">Course Code *</label>
              <input type="text" id="createCourseCode" name="code" class="modal-input" 
                     placeholder="e.g., COMP102, CCIS1102L" required 
                     pattern="[A-Z0-9]{3,10}" 
                     title="3-10 characters, letters and numbers only" />
            </div>
            
            <div class="form-group">
              <label class="modal-label">Course Title *</label>
              <input type="text" id="createCourseTitle" name="title" class="modal-input" 
                     placeholder="e.g., Computer Programming 1" required 
                     maxlength="255" />
            </div>
            
            <div class="form-group">
              <label class="modal-label">Programming Language</label>
              <select id="createCourseLanguage" name="language" class="modal-input">
                <option value="">Select Programming Language</option>
                <option value="C++">C++</option>
                <option value="Java">Java</option>
                <option value="Python">Python</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="modal-label">Course Description</label>
              <textarea id="createCourseDescription" name="description" class="modal-input" 
                        placeholder="Brief description of the course content and learning objectives..." 
                        rows="3" style="resize: vertical; min-height: 60px;" maxlength="500"></textarea>
            </div>
          </div>
          
          <div id="createCourseError" class="error-message" style="margin-top:16px;"></div>
          <div class="modal-actions">
            <button type="button" id="createCourseCancel" class="action-btn secondary">Cancel</button>
            <button type="submit" id="createCourseSubmit" class="action-btn primary">
              <i class="fas fa-plus"></i> Create Course
            </button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);
    
    // Set up form submission
    const form = document.getElementById('createCourseForm');
    if (form) {
      form.onsubmit = function(e) {
        e.preventDefault();
        const errorDiv = document.getElementById('createCourseError');
        const submitBtn = document.getElementById('createCourseSubmit');
        
        // Get form data
        const code = document.getElementById('createCourseCode').value.trim().toUpperCase();
        const title = document.getElementById('createCourseTitle').value.trim();
        const language = document.getElementById('createCourseLanguage').value;
        const description = document.getElementById('createCourseDescription').value.trim();
        
        // Validation
        if (!code || !title) {
          if (errorDiv) errorDiv.textContent = 'Course code and title are required.';
          return;
        }
        
        if (!/^[A-Z0-9]{3,10}$/.test(code)) {
          if (errorDiv) errorDiv.textContent = 'Course code must be 3-10 characters, letters and numbers only.';
          return;
        }
        
        if (title.length < 5) {
          if (errorDiv) errorDiv.textContent = 'Course title must be at least 5 characters long.';
          return;
        }
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        
        // Submit course creation (simplified)
        const formData = new FormData();
        formData.append('action', 'create');
        formData.append('code', code);
        formData.append('title', title);
        formData.append('language', language);
        formData.append('description', description);
        
        fetch('course_manage.php', {
          method: 'POST',
          body: formData,
          credentials: 'same-origin'
        })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            showNotification('success', 'Success', `Course "${title}" created successfully!`);
            modal.style.display = 'none';
            loadCoordinatorCourses();
          } else {
            if (errorDiv) errorDiv.textContent = data.message || 'Failed to create course.';
          }
        })
        .catch(err => {
          if (errorDiv) errorDiv.textContent = 'Network error. Please try again.';
        })
        .finally(() => {
          // Re-enable submit button
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-plus"></i> Create Course';
        });
      };
    }
    
    // Set up cancel button
    const cancelBtn = document.getElementById('createCourseCancel');
    if (cancelBtn) {
      cancelBtn.onclick = function() {
        closeCreateCourseModal();
      };
    }
    
    // Set up close button
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.onclick = function() {
        closeCreateCourseModal();
      };
    }
    
    // Close modal when clicking outside
    modal.onclick = function(e) {
      if (e.target === modal) {
        closeCreateCourseModal();
      }
    };
  }
  
  // Reset form
  resetCreateCourseForm();
  
  modal.style.display = 'flex';
  setTimeout(() => {
    const codeInput = document.getElementById('createCourseCode');
    if (codeInput) codeInput.focus();
  }, 50);
}

// Close create course modal
function closeCreateCourseModal() {
  const modal = document.getElementById('createCourseModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Reset create course form
function resetCreateCourseForm() {
  const codeInput = document.getElementById('createCourseCode');
  const titleInput = document.getElementById('createCourseTitle');
  const languageSelect = document.getElementById('createCourseLanguage');
  const descriptionInput = document.getElementById('createCourseDescription');
  const errorDiv = document.getElementById('createCourseError');
  
  if (codeInput) codeInput.value = '';
  if (titleInput) titleInput.value = '';
  if (languageSelect) languageSelect.value = '';
  if (descriptionInput) descriptionInput.value = '';
  if (errorDiv) errorDiv.textContent = '';
}

// Add module input
function addModule() {
  const container = document.getElementById('initialModules');
  if (container) {
    const moduleCount = container.children.length + 1;
    const moduleGroup = document.createElement('div');
    moduleGroup.className = 'module-input-group';
    moduleGroup.innerHTML = `
      <input type="text" class="modal-input module-input" placeholder="Module ${moduleCount}: New Module" />
      <button type="button" class="btn-remove-module" onclick="removeModule(this)">&times;</button>
    `;
    container.appendChild(moduleGroup);
    
    // Focus on the new input
    const newInput = moduleGroup.querySelector('.module-input');
    if (newInput) newInput.focus();
  }
}
// Remove module input
function removeModule(button) {
  const container = document.getElementById('initialModules');
  if (container && container.children.length > 1) {
    button.parentElement.remove();
    
    // Update placeholders
    const modules = container.querySelectorAll('.module-input');
    modules.forEach((input, index) => {
      input.placeholder = `Module ${index + 1}: ${input.placeholder.split(': ')[1] || 'New Module'}`;
    });
  }
}
// Create or ensure edit course modal and populate
function ensureEditCourseModal() {
  let modal = document.getElementById('editCourseModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'editCourseModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card" style="max-width: 500px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <h3 class="modal-title">Edit Course</h3>
          <button type="button" class="modal-close" onclick="closeEditCourseModal()">×</button>
        </div>
        <form id="editCourseForm">
          <input type="hidden" id="editCourseId" />
          <div class="form-section">
            <div class="form-group">
              <label class="modal-label">Course Code *</label>
              <input type="text" id="editCourseCode" class="modal-input" required />
            </div>
            <div class="form-group">
              <label class="modal-label">Course Title *</label>
              <input type="text" id="editCourseTitle" class="modal-input" required />
            </div>
            <div class="form-group">
              <label class="modal-label">Programming Language</label>
              <select id="editCourseLanguage" class="modal-input">
                <option value="">Select Programming Language</option>
                <option value="C++">C++</option>
                <option value="Java">Java</option>
                <option value="Python">Python</option>
              </select>
            </div>
            <div class="form-group">
              <label class="modal-label">Course Description</label>
              <textarea id="editCourseDescription" class="modal-input" rows="3" style="resize: vertical; min-height: 60px;"></textarea>
            </div>
          </div>
          <div id="editCourseError" class="error-message" style="margin-top:6px;"></div>
          <div class="modal-actions">
            <button type="button" id="editCourseCancel" class="action-btn secondary">Cancel</button>
            <button type="submit" id="editCourseSave" class="action-btn primary"><i class="fas fa-save"></i> Save Changes</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);

    const form = document.getElementById('editCourseForm');
    if (form) {
      form.onsubmit = function(e) {
        e.preventDefault();
        const id = document.getElementById('editCourseId').value;
        const code = document.getElementById('editCourseCode').value.trim();
        const title = document.getElementById('editCourseTitle').value.trim();
        const language = document.getElementById('editCourseLanguage').value;
        const description = document.getElementById('editCourseDescription').value.trim();
        const err = document.getElementById('editCourseError');
        if (!code || !title) { if (err) err.textContent = 'Both code and title are required.'; return; }

        const fd = new FormData();
        fd.append('action','update');
        fd.append('id', id);
        fd.append('code', code);
        fd.append('title', title);
        fd.append('language', language);
        fd.append('description', description);
        fetch('course_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
          .then(r=>r.json())
          .then(data=>{
            if (data.success) {
              if (typeof window.showNotification === 'function') window.showNotification('success','Updated','Course updated successfully');
              modal.style.display = 'none';
              loadCoordinatorCourses();
            } else { if (err) err.textContent = data.message || 'Update failed'; }
          })
          .catch(()=>{ if (err) err.textContent = 'Network error'; if (typeof window.showNotification === 'function') window.showNotification('error','Error','Network error'); });
      };
    }

    const cancel = document.getElementById('editCourseCancel');
    if (cancel) cancel.onclick = function(){ modal.style.display = 'none'; };
  }
  return modal;
}

function closeEditCourseModal() {
  const modal = document.getElementById('editCourseModal');
  if (modal) modal.style.display = 'none';
}

// Edit course function
function editCourse(courseId) {
  const modal = ensureEditCourseModal();
  const idInput = document.getElementById('editCourseId');
  const codeInput = document.getElementById('editCourseCode');
  const titleInput = document.getElementById('editCourseTitle');
  const descriptionInput = document.getElementById('editCourseDescription');
  const err = document.getElementById('editCourseError');
  if (err) err.textContent = '';

  // Fetch current course data
  fetch(`course_manage.php?action=get&id=${courseId}`, { credentials: 'same-origin' })
    .then(r => r.json())
    .then(data => {
      if (data.success && data.course) {
        if (idInput) idInput.value = data.course.id;
        if (codeInput) codeInput.value = data.course.code || '';
        if (titleInput) titleInput.value = data.course.title || '';
        if (descriptionInput) descriptionInput.value = data.course.description || '';
        
        modal.style.display = 'flex';
      } else {
        if (err) err.textContent = 'Failed to load course data';
      }
    })
    .catch(e => {
      if (err) err.textContent = 'Network error loading course';
    });
}
// View outline function (copied from admin_panel.js)
function viewOutline(courseId) {
  // Allow callers to omit courseId; derive from modal/global
  if (!courseId) {
    try {
      const contProbe = document.getElementById('courseOutlineModal');
      const attr = contProbe ? contProbe.getAttribute('data-course-id') : null;
      if (attr) courseId = attr;
      if (!courseId && typeof window.__currentCourseId !== 'undefined') courseId = window.__currentCourseId;
    } catch(_){}
  }
  // Ensure container exists once
  let cont = document.getElementById('courseOutlineModal');
  if (!cont) {
    cont = document.createElement('div');
    cont.id = 'courseOutlineModal';
    cont.className = 'modal-overlay';
    cont.innerHTML = `
      <div class="modal-card" style="max-width: 980px; width: 95%; padding: 0; display:flex; flex-direction:column; max-height: 90vh;">
        <div class="outline-header" style="padding:12px 14px; border-bottom:1px solid #e9ecef; display:flex; align-items:center; gap:8px;">
          <strong class="outline-title" style="flex:1">Course Outline</strong>
          <div class="outline-toolbar">
            <button id="outlineAddModuleBtn" class="action-btn icon" style="background:#1d9b3e;color:#fff;"><i class="fas fa-plus"></i>Module</button>
            <button id="outlineCloseBtn" class="action-btn icon" style="background:#6c757d;color:#fff;"><i class="fas fa-times"></i>Close</button>
          </div>
        </div>
        <div id="outlineBody" style="padding:12px 14px; overflow:auto; flex:1"></div>
      </div>
    `;
    document.body.appendChild(cont);
    const closeBtn = cont.querySelector('#outlineCloseBtn');
    if (closeBtn) closeBtn.onclick = ()=> { cont.style.display = 'none'; };
    // Click on overlay background to close
    cont.addEventListener('click', function(e){ if (e.target === cont) cont.style.display='none'; });
  }
  
  const body = cont.querySelector('#outlineBody');
  body.innerHTML = '<div class="loading-spinner">Loading...</div>';
  
  // Show the modal
  cont.style.display = 'flex';
  cont.setAttribute('data-course-id', courseId);
  try { window.__currentCourseId = courseId; } catch(_){}
  
  (function(){
    function buildUrl() {
      try {
        const u = new URL('course_outline.php', window.location.href);
        u.searchParams.set('course_id', String(courseId));
        u.searchParams.set('_', String(Date.now()));
        return u.toString();
      } catch (_) {
        const basePath = window.location.pathname.replace(/\/[^\/]*$/, '');
        return basePath + '/course_outline.php?course_id=' + encodeURIComponent(courseId) + '&_=' + Date.now();
      }
    }
    let url = buildUrl();
    fetch(url, { credentials:'same-origin' })
    .then(async r => {
      if (!r.ok) { 
        body.innerHTML = '<div class="empty-state">Failed to load outline</div>'; 
        return null; 
      }
      const text = await r.text();
      try {
        const json = JSON.parse(text);
        return json;
      } catch (e) {
        const looksHtml = /^\s*<!DOCTYPE|^\s*<html/i.test(text);
        if (looksHtml) {
          const parts = window.location.pathname.split('/').filter(Boolean);
          if (parts.length) {
            const root = '/' + parts[0];
            url = root + '/course_outline.php?course_id=' + encodeURIComponent(courseId) + '&_=' + Date.now();
            return fetch(url, { credentials:'same-origin' }).then(rr => rr.json()).catch(()=>null);
          }
        }
        body.innerHTML = '<div class="empty-state">Failed to load outline</div><div style="color:#6c757d;margin-top:6px;">Parse error</div>';
        return null;
      }
    })
    .then(res => {
      const ok = !!(res && (res.success === true || res.success === 'true'));
      if (!ok) {
        const msg = res && (res.message || JSON.stringify(res));
        console.warn('📋 Outline load failed', { url, res });
        body.innerHTML = '<div class="empty-state">Failed to load outline</div>' + (msg ? '<div style="color:#6c757d;margin-top:6px;max-width:90%;word-break:break-word;">' + String(msg) + '</div>' : '');
        return;
      }
      if (!Array.isArray(res.data)) { res.data = []; }
      // OPTIMIZED: Store outline data for points calculation (avoid refetch)
      try { window.__lastOutlineData = res.data; } catch(_){}
      try {
      renderOutline(res.data, body);
      initOutlineSortables(courseId, body);
      } catch (e) {
        body.innerHTML = '<div class="empty-state">Failed to load outline</div><div style="color:#6c757d;margin-top:6px;">Render error: ' + (e && e.message ? e.message : e) + '</div>';
      }

      // Wire basic actions (delete/edit) similar to admin implementation
      const modulesWrap = body;
      // OPTIMIZED: Remove old handler before adding new one to prevent memory leaks
      const oldHandler = modulesWrap.onclick;
      if (oldHandler) modulesWrap.onclick = null;
      // Use a single-click handler to avoid stacking multiple listeners across re-renders
      modulesWrap.onclick = function(e){
        const btn = e.target.closest('button');
        if (!btn) return;
        const act = btn.getAttribute('data-act');
        if (!act) return;

        // Helper to POST and refresh
        async function postAndRefresh(endpoint, fd) {
          // Attach CSRF to all outline actions
          try { fd = await addCSRFToken(fd); } catch(_){ }
          fetch(endpoint, { method:'POST', body: fd, credentials:'same-origin' })
            .then(r => r.json())
            .then(() => viewOutline(courseId))
            .catch(() => { if (typeof window.showNotification === 'function') window.showNotification('error','Error','Action failed'); });
        }

        if (act === 'module-add') {
          outlinePrompt({ title: 'Create Module', label: 'Module title', placeholder: 'e.g., Module 1' }, function(title){
            if (!title) return;
            const fd = new FormData();
            fd.append('action','module_create');
            fd.append('course_id', String(courseId));
            fd.append('title', title);
            postAndRefresh('course_outline_manage.php', fd);
          });
          return;
        }
        if (act === 'module-delete') {
          coordinatorConfirm('Delete this module?', function(){
            const fd = new FormData();
            fd.append('action','module_delete');
            fd.append('id', btn.getAttribute('data-id'));
            postAndRefresh('course_outline_manage.php', fd);
          });
          return;
        }
        if (act === 'module-edit') {
          const current = btn.closest('[data-module-id]').querySelector('span').textContent;
          outlinePrompt({ title: 'Rename Module', label: 'Module title', value: current }, function(title){
            if (!title) return;
            const fd = new FormData();
            fd.append('action','module_update');
            fd.append('id', btn.getAttribute('data-id'));
            fd.append('title', title);
            postAndRefresh('course_outline_manage.php', fd);
          });
          return;
        }
        if (act === 'lesson-add') {
          const mod = btn.closest('[data-module-id]');
          const moduleId = mod ? mod.getAttribute('data-module-id') : null;
          if (!moduleId) return;
          showBulkLessonModal(moduleId);
          return;
        }
        if (act === 'mat-add') {
          const lessonEl = btn.closest('[data-lesson-id]');
          const lessonId = lessonEl ? lessonEl.getAttribute('data-lesson-id') : null;
          if (!lessonId) return;
          let type;
          // OPTIMIZED: Show prompt immediately with default options, fetch types in background
          // Matches backend material_types response exactly: PDF, Link, Page
          const defaultOpts = [
            {value:'pdf',label:'PDF'}, 
            {value:'link',label:'Link'}, 
            {value:'page',label:'Page'}
          ];
          // Fetch types in background for future use (non-blocking) - DO THIS BEFORE PROMPT
          (async function(){
            let fd = new FormData();
            fd.append('action','material_types');
            try { fd = await addCSRFToken(fd); } catch(_){ }
            fetch('course_outline_manage.php', { method:'POST', credentials:'same-origin', body: fd })
              .then(r=>r.json())
              .catch(()=>null);
          })();
          
          outlinePrompt({ title: 'Material type', label: 'Type', options: defaultOpts, value: 'pdf' }, function(val){
            type = (val||'link').toLowerCase();
            if (!type) return;

          if (type === 'file' || type === 'pdf' || type === 'code' || type === 'pptx') {
            // Use a file picker and upload to backend
            const input = document.createElement('input');
            input.type = 'file';
            if (type === 'pdf') input.accept = '.pdf,application/pdf';
            else if (type === 'pptx') input.accept = '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation';
            else if (type === 'code') input.accept = '.txt,.md,.c,.cpp,.h,.hpp,.java,.py,.js,.ts,.tsx,.jsx,.html,.css,.scss,.json,.xml,.yml,.yaml,.sql,.sh,.bash,.bat,.ps1,.rb,.go,.php,.cs,.kt,.swift,.r,.ipynb,text/plain,application/json';
            input.onchange = function() {
              const file = input.files && input.files[0];
              if (!file) return;
              (async function(){
                let fd = new FormData();
              fd.append('action','material_upload');
              fd.append('lesson_id', lessonId);
              fd.append('file', file);
                try { fd = await addCSRFToken(fd); } catch(_){ }
                return fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' });
              })()
                .then(r=>r.json())
                .then(function(response){
                  if (response && response.success) {
                    viewOutline(courseId);
                    if (typeof window.showNotification === 'function') {
                      window.showNotification('success','Success','Material uploaded successfully!');
                    }
                  } else {
                    if (typeof window.showNotification === 'function') {
                      window.showNotification('error','Error','Upload failed: ' + (response.message || 'Unknown error'));
                    }
                  }
                })
                .catch(function(error){
                  if (typeof window.showNotification === 'function') window.showNotification('error','Error','Upload failed'); 
                });
            };
            input.click();
            return;
          }
          if (type === 'page') {
            // Minimalist page editor with title inside and live preview
              const modal = document.createElement('div');
              modal.className = 'modal';
              modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
              modal.innerHTML = `
              <div class="modal-card" style="max-width:1100px;width:95%;height:85vh;display:flex;flex-direction:column;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.12);">
                <div style="padding:16px 18px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;background:#fff;">
                  <div>
                    <div style="font-size:18px;color:#111827;font-weight:600;">Create Content Page</div>
                    <div style="font-size:13px;color:#6b7280;margin-top:4px;">Clean editor with professional features</div>
                    </div>
                  <div style="display:flex;gap:10px;align-items:center;">
                    <button id="pagePreview" class="action-btn btn-gray" style="padding:8px 14px;border:1px solid #d1d5db;border-radius:6px;background:#f9fafb;color:#111827;">Preview</button>
                    <button id="pageCancel" class="action-btn btn-gray" style="padding:8px 14px;border:1px solid #d1d5db;border-radius:6px;background:#f9fafb;color:#111827;">Cancel</button>
                    <button id="pageSave" class="action-btn" style="padding:8px 14px;border:none;border-radius:6px;background:#28a745;color:#fff;font-weight:600;">Save Page</button>
                  </div>
                </div>
                <div style="flex:1;display:flex;background:#f8fafc;">
                  <div id="editorPanel" style="flex:1;display:flex;flex-direction:column;border-right:1px solid #e5e7eb;background:#fff;">
                    <div style="padding:14px 16px;border-bottom:1px solid #e5e7eb;background:#fff;">
                      <label for="peTitle" style="display:block;font-size:13px;color:#374151;margin-bottom:6px;">Page Title</label>
                      <input id="peTitle" type="text" placeholder="e.g., Introduction to Programming" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:15px;outline:none;" />
                    </div>
                    <div id="editorToolbar" style="padding:10px 12px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;gap:8px;flex-wrap:wrap;">
                      <button type="button" class="tb" data-action="bold">Bold</button>
                      <button type="button" class="tb" data-action="italic">Italic</button>
                      <button type="button" class="tb" data-action="h1">Heading 1</button>
                      <button type="button" class="tb" data-action="h2">Heading 2</button>
                      <button type="button" class="tb" data-action="ul">List</button>
                      <button type="button" class="tb" data-action="ol">Numbered</button>
                      <button type="button" class="tb" data-action="code">Code</button>
                      <button type="button" class="tb" data-action="link">Link</button>
                      <button type="button" class="tb" data-action="template">Templates</button>
                    </div>
                    <textarea id="peContent" style="flex:1;width:100%;height:100%;border:0;padding:16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;font-size:14px;line-height:1.6;outline:none;resize:none;" placeholder="# Welcome to your Page\n\nWrite content in Markdown.\n\n## Tips\n- Use headings and lists\n- Insert code blocks\n- Add links and images"></textarea>
                  </div>
                  <div id="previewPanel" style="flex:1;display:none;flex-direction:column;background:#fff;">
                    <div style="padding:14px 16px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;">
                      <span style="font-size:13px;color:#374151;font-weight:500;">Live Preview</span>
                      <button id="closePreview" class="action-btn btn-gray" style="padding:6px 12px;border:1px solid #d1d5db;border-radius:6px;background:#f9fafb;color:#111827;">Close</button>
                    </div>
                    <div id="previewContent" style="flex:1;padding:18px;overflow:auto;">
                      <div style="text-align:center;color:#9ca3af;padding:40px 20px;">Start typing to see preview</div>
                    </div>
                  </div>
                  </div>
                </div>`;
              document.body.appendChild(modal);

            // styling for toolbar buttons and focus
                  (function(){
                      const style = document.createElement('style');
              style.textContent = '.tb{background:#fff;border:1px solid #d1d5db;border-radius:6px;padding:6px 10px;font-size:13px;cursor:pointer} .tb:hover{background:#f9fafb;border-color:#9ca3af} #peTitle:focus{border-color:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.1)} #previewContent h1{font-size:28px;margin:14px 0;border-bottom:2px solid #e5e7eb;padding-bottom:6px} #previewContent h2{font-size:22px;margin:12px 0} #previewContent p, #previewContent li{color:#374151} #previewContent pre{background:#111827;color:#e5e7eb;padding:12px;border-radius:8px;overflow:auto} #previewContent code{background:#f3f4f6;color:#111827;padding:2px 6px;border-radius:4px} #previewContent pre code{background:transparent;color:inherit;padding:0;border-radius:0}';
                      document.head.appendChild(style);
                  })();

            // load marked for preview
            const loadScript = (src) => new Promise((res, rej)=>{ const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.body.appendChild(s); });
            let markedReady = false;
            (async function(){
              try { await loadScript('https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js'); markedReady = true; } catch(_) {}
              })();

            const textarea = modal.querySelector('#peContent');
            const previewPanel = modal.querySelector('#previewPanel');
            const previewContent = modal.querySelector('#previewContent');

            function balanceCodeFences(markdown){
              try {
                const fences = (markdown.match(/```/g) || []).length;
                if (fences % 2 === 1) {
                  return { text: markdown + '\n```', fixed: true };
                }
              } catch(_) {}
              return { text: markdown, fixed: false };
            }

            function updatePreview(){
              if (!markedReady) return;
              const val = textarea.value || '';
              if (!val.trim()) {
                previewContent.innerHTML = '<div style="text-align:center;color:#9ca3af;padding:40px 20px;">Start typing to see preview</div>';
                return;
              }
              const balanced = balanceCodeFences(val);
              const html = window.marked.parse(balanced.text);
              const hint = balanced.fixed ? '<div style="margin-top:8px;font-size:12px;color:#6b7280;">Note: Unclosed code block was auto-closed for preview only.</div>' : '';
              previewContent.innerHTML = html + hint;
            }
            textarea.addEventListener('input', updatePreview);

            // toolbar handlers - using event delegation for reliability
            const toolbar = modal.querySelector('#editorToolbar');
            if (toolbar) {
              toolbar.addEventListener('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                const btn = e.target.closest('.tb');
                if (!btn) return;
                const act = btn.getAttribute('data-action');
                if (!act) return;
                
                // Ensure textarea is focused
                textarea.focus();
                
                const start = textarea.selectionStart; 
                const end = textarea.selectionEnd; 
                const text = textarea.value; 
                const sel = text.substring(start, end);
                let insert = '';
                
                if (act==='bold') insert = `**${sel||'bold text'}**`;
                else if (act==='italic') insert = `*${sel||'italic'}*`;
                else if (act==='h1') insert = `# ${sel||'Heading 1'}`;
                else if (act==='h2') insert = `## ${sel||'Heading 2'}`;
                else if (act==='ul') insert = `- ${sel||'List item'}`;
                else if (act==='ol') insert = `1. ${sel||'List item'}`;
                else if (act==='code') insert = `\n\n\`\`\`cpp\n${sel||'// code'}\n\`\`\`\n`;
                else if (act==='link') insert = `[${sel||'link'}](https://)`;
                else if (act==='template') insert = `# Lesson Introduction\n\n## Objectives\n- Objective 1\n- Objective 2\n\n## Content\nWrite here...`;
                
                if (insert) {
                  textarea.value = text.substring(0, start) + insert + text.substring(end);
                  textarea.focus();
                  // Set cursor position after inserted text
                  const newPos = start + insert.length;
                  textarea.setSelectionRange(newPos, newPos);
                  updatePreview();
                }
              });
            }

            // preview toggles
            modal.querySelector('#pagePreview').onclick = function(){ previewPanel.style.display='flex'; updatePreview(); };
            modal.querySelector('#closePreview').onclick = function(){ previewPanel.style.display='none'; };
              modal.querySelector('#pageCancel').onclick = function(){ modal.remove(); };

            // save handler
              modal.querySelector('#pageSave').onclick = function(){
              const title = (modal.querySelector('#peTitle').value||'').trim();
              const content = modal.querySelector('#peContent').value || '';
              if (!title){ if (typeof window.showNotification==='function') window.showNotification('warning','Missing title','Please enter a page title'); modal.querySelector('#peTitle').focus(); return; }
                (async function(){
                  let fd = new FormData();
                  fd.append('action','material_page_create');
                  fd.append('lesson_id', lessonId);
                  fd.append('title', title);
                fd.append('content', content);
                  try { fd = await addCSRFToken(fd); } catch(_){ }
                  fetch('course_outline_manage.php', { method:'POST', credentials:'same-origin', body: fd })
                    .then(r=>r.json())
                    .then(resp => {
                      if (resp && resp.success) {
                        if (typeof window.showNotification === 'function') {
                          window.showNotification('success', 'Success', 'Content page created successfully!');
                        }
                        modal.remove();
                        viewOutline(courseId);
                      } else {
                        if (typeof window.showNotification === 'function') {
                          window.showNotification('error', 'Error', resp && resp.message ? resp.message : 'Failed to create content page');
                        }
                      }
                    })
                    .catch(()=> { if (typeof window.showNotification === 'function') window.showNotification('error','Error','Save failed'); });
                })();
              };
            return;
          }
          outlinePrompt({ title: 'Material URL', label: 'URL' }, function(value){
            if (value === null || value === undefined) return;
            (async function(){
              let fd = new FormData();
            fd.append('action','material_create');
            fd.append('lesson_id', lessonId);
            fd.append('type', type);
            fd.append('url', value);
              try { fd = await addCSRFToken(fd); } catch(_){ }
            postAndRefresh('course_outline_manage.php', fd);
            })();
          });
          });
          return;
        }
        if (act === 'lesson-delete') {
          coordinatorConfirm('Delete this lesson?', function(){
            const fd = new FormData();
            fd.append('action','lesson_delete');
            fd.append('id', btn.getAttribute('data-id'));
            postAndRefresh('course_outline_manage.php', fd);
          });
          return;
        }
        if (act === 'lesson-edit') {
          const li = btn.closest('[data-lesson-id]');
          const current = li ? (li.querySelector('span')?.textContent || '') : '';
          outlinePrompt({ title: 'Rename Topic', label: 'Topic title', value: current }, function(title){
            if (!title) return;
            const fd = new FormData();
            fd.append('action','lesson_update');
            fd.append('id', btn.getAttribute('data-id'));
            fd.append('title', title);
            postAndRefresh('course_outline_manage.php', fd);
          });
          return;
        }
        if (act === 'mat-delete') {
          coordinatorConfirm('Delete this material?', function(){
            const fd = new FormData();
            fd.append('action','material_delete');
            fd.append('id', btn.getAttribute('data-id'));
            postAndRefresh('course_outline_manage.php', fd);
          });
          return;
        }
        if (act === 'mat-open-editor' || act === 'mat-edit') {
          // If it's a Page material, open the rich editor with current content loaded
          // Open material editor
          try {
            const row = btn.closest('[data-mat-id]');
            const mid = row ? row.getAttribute('data-mat-id') : btn.getAttribute('data-id');
            if (row) {
              const id = mid;
              const fd = new FormData(); fd.append('action','material_get'); fd.append('id', id);
              fetch('course_outline_manage.php', { method:'POST', credentials:'same-origin', body: fd })
                .then(r=>r.json())
                .then(function(j){
                  const m = j && j.data ? j.data : null;
                  if (!m) { btn.setAttribute('data-act','mat-edit'); btn.click(); return; }
                  const t = String(m.type||'').toLowerCase();
                  const url = m.url || '';
                  // Treat materials that use material_page_view.php as editable pages,
                  // even if the DB type isn't strictly 'page' (legacy rows may be 'link').
                  const isPageLike = /material_page_view\.php\?f=/.test(url);
                  if (t !== 'page' && !isPageLike) { btn.setAttribute('data-act','mat-edit'); btn.click(); return; }
                  const match = url.match(/f=([^&]+)/);
                  const fileId = match ? decodeURIComponent(match[1]) : null;
                  if (!fileId) { btn.setAttribute('data-act','mat-edit'); btn.click(); return; }
                  fetch('uploads/materials/pages/' + fileId, { credentials:'same-origin' })
                    .then(r=>{
                      return r.text();
                    })
                    .then(function(md){
                      // File content loaded
                      const modal = document.createElement('div');
                      modal.className = 'modal';
                      modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
                      modal.innerHTML = `
                        <div class="modal-card" style="max-width:1280px;width:98%;height:88vh;display:flex;flex-direction:column;background:#fff;border-radius:8px;overflow:hidden;">\n\
                          <div style="padding:10px 12px;border-bottom:1px solid #ddd;display:flex;align-items:center;justify-content:space-between;background:#f8f9fa;">\n\
                            <strong style="font-size:16px;color:#333;">Edit Page</strong>\n\
                            <div style="display:flex;gap:8px;align-items:center;">\n\
                              <button class="action-btn btn-gray" id="pgCancel" style="padding:6px 12px;">Cancel</button>\n\
                              <button class="action-btn" id="pgSave" style="padding:6px 12px;background:#28a745;color:#fff;">Save</button>\n\
                            </div>\n\
                          </div>\n\
                          <div style="flex:1;display:flex;min-height:0;">\n\
                            <textarea id="pgContent" style="flex:1;width:100%;height:100%;border:0;padding:12px;font-family:monospace;font-size:14px;outline:none;overflow:auto;resize:none;"></textarea>\n\
                          </div>\n\
                        </div>`;
                      document.body.appendChild(modal);
                      const ta = modal.querySelector('#pgContent'); ta.value = md || '';
                      // Enhance with EasyMDE if CDN available
                      (function(){
                        const loadScript = (src) => new Promise((res, rej)=>{ const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.body.appendChild(s); });
                        const loadCSS = (href) => { const l=document.createElement('link'); l.rel='stylesheet'; l.href=href; document.head.appendChild(l); };
                        loadCSS('https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.css');
                        loadScript('https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.js').then(function(){
                          try {
                            const em = new window.EasyMDE({
                              element: ta,
                              spellChecker: false,
                              autofocus: true,
                              forceSync: true,
                              minHeight: '100%',
                              autosave: { enabled: false },
                              toolbar: [
                                'bold','italic','heading','|',
                                'quote','unordered-list','ordered-list','|',
                                'link','image','table','code','|',
                                'preview','side-by-side','fullscreen'
                              ],
                              status: ['lines','words']
                            });
                            // Expose instance to the modal so Save can read the live value
                            try { modal.__mde = em; } catch(_) {}
                            const style = document.createElement('style'); style.textContent='\
.EasyMDEContainer{height:100%;display:flex;flex-direction:column;min-height:0;flex:1 1 auto;}\
.EasyMDEContainer .editor-toolbar{flex:0 0 auto;}\
.EasyMDEContainer .CodeMirror{flex:1 1 auto;height:100%;min-height:0;font-family: monospace;}\
.EasyMDEContainer .CodeMirror-scroll{height:100%;}\
.EasyMDEContainer .editor-statusbar{flex:0 0 22px;line-height:22px;}\
#pgContent{display:none !important;}'; document.head.appendChild(style);
                            // Normalize markdown token styles inside editor to avoid perceived auto-resize
                            const style2 = document.createElement('style');
                            style2.textContent = '\
.EasyMDEContainer .CodeMirror .cm-header{ font-size: 1em; font-weight: bold; }\
.EasyMDEContainer .CodeMirror .cm-strong{ font-weight: bold; }\
.EasyMDEContainer .CodeMirror .cm-em{ font-style: italic; }\
';
                            document.head.appendChild(style2);
                          } catch(_) {}
                        }).catch(function(){});
                      })();
                      // Keep session alive while editing (ping every 4 minutes)
                      try {
                        const ping = () => { fetch('check_login_status.php?ping=1', { credentials:'same-origin', cache:'no-store' }).catch(()=>{}); };
                        ping();
                        modal.__keepAlive = setInterval(ping, 240000);
                        const cleanup = () => { if (modal.__keepAlive) { clearInterval(modal.__keepAlive); modal.__keepAlive = null; } };
                        modal.querySelector('#pgCancel').addEventListener('click', cleanup);
                        modal.querySelector('#pgSave').addEventListener('click', cleanup);
                      } catch(_) {}
                      modal.querySelector('#pgCancel').onclick = function(){ modal.remove(); };
                      modal.querySelector('#pgSave').onclick = function(){
                        let content = ta.value;
                        // Prefer live EasyMDE content; fallback to textarea
                        try {
                          if (modal.__mde && typeof modal.__mde.value === 'function') {
                            content = modal.__mde.value();
                          } else if (window.easyMDE && typeof window.easyMDE.value === 'function') {
                            content = window.easyMDE.value();
                          }
                        } catch(_) {}
                        const btn = modal.querySelector('#pgSave');
                        const showToast = (type, title, msg) => {
                          if (typeof window.showNotification === 'function') return window.showNotification(type, title, msg);
                          try { console[type === 'error' ? 'error' : 'log']('[PageEdit]', title, msg); } catch(_) {}
                        };
                        const getToken = () => fetch('course_outline_manage.php', { method:'POST', credentials:'same-origin', body: (()=>{ const fd=new FormData(); fd.append('action','get_csrf_token'); return fd; })() }).then(r=>r.json()).then(j=>j && j.token ? j.token : null).catch(()=>null);
                        const doSave = (token, attempt) => {
                        const saveFd = new FormData();
                        saveFd.append('action','material_page_update');
                        saveFd.append('id', id);
                        saveFd.append('content', content || '');
                          if (token) { saveFd.append('csrf_token', token); }
                          return fetch('course_outline_manage.php', { method:'POST', credentials:'same-origin', body: saveFd })
                            .then(r => r.json().catch(()=>({ success:false, message:'Invalid JSON response'})))
                            .then(resp => {
                              if (resp && resp.success === true) return resp;
                              // Auto-retry once on CSRF failure
                              const msg = (resp && String(resp.message||'')).toLowerCase();
                              if (!attempt && msg.includes('csrf')) {
                                return getToken().then(t => doSave(t, true));
                              }
                              throw new Error((resp && resp.message) || 'Save failed');
                            });
                        };
                        btn.disabled = true; btn.textContent = 'Saving…';
                        getToken()
                          .then(t => doSave(t, false))
                          .then(() => { showToast('success','Saved','Page updated'); modal.remove(); viewOutline(courseId); })
                          .catch(err => { showToast('error','Save failed', String(err && err.message || 'Network error')); })
                          .finally(() => { btn.disabled = false; btn.textContent = 'Save'; });
                      };
                    });
                })
                .catch(function(e){ btn.setAttribute('data-act','mat-edit'); btn.click(); });
              return;
            }
          } catch(e) { }
          const item = btn.closest('[data-mat-id]');
          const current = item ? (item.querySelector('span')?.textContent || '') : '';
          outlinePrompt({ title: 'Update material', label: 'URL or filename', value: current.replace(/^.*•\\s*/,'').trim() }, function(value){
            if (value === null) return;
            const fd = new FormData();
            fd.append('action','material_update');
            fd.append('id', btn.getAttribute('data-id'));
            fd.append('url', value);
            postAndRefresh('course_outline_manage.php', fd);
          });
          return;
        }
        if (act === 'mat-view') {
          const url = btn.getAttribute('data-url');
          const type = btn.getAttribute('data-type');
          if (!url) return;
          
          // Convert relative URLs to absolute URLs
          let absoluteUrl = url;
          if (!url.startsWith('http')) {
            // Handle relative URLs - if it starts with material_download.php or material_page_view.php, it's relative to project root
            if (url.startsWith('material_download.php') || url.startsWith('material_page_view.php')) {
              // Get the current path and use it as base
              const currentPath = window.location.pathname;
              const projectPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
              absoluteUrl = window.location.origin + projectPath + url;
            } else {
              absoluteUrl = window.location.origin + '/' + url.replace(/^\.\//, '');
            }
          }
          
          if (type === 'link') {
            // Open external link in a new tab (original behavior)
            window.open(absoluteUrl, '_blank');
          } else if (type === 'pdf') {
            // Open PDF in modal viewer (add view=true parameter)
            const viewUrl = absoluteUrl + (absoluteUrl.includes('?') ? '&' : '?') + 'view=true';
            showPDFViewer(viewUrl);
          } else if (type === 'page' || /material_page_view\.php/i.test(url)) {
            // Open material page in fullscreen iframe viewer (clean header, X close button)
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.6);z-index:10000;display:flex;align-items:stretch;justify-content:stretch;';
            const wrap = document.createElement('div');
            wrap.style.cssText = 'background:#fff;width:100%;height:100vh;display:flex;flex-direction:column;overflow:hidden;border-radius:0;box-shadow:none;position:relative;';
            wrap.innerHTML = ''+
              '<button id="coordMatCloseBtn" aria-label="Close" title="Close" '+
              'style="position:absolute;top:10px;right:12px;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:#6b7280;border:none;color:#fff;cursor:pointer;z-index:10001;">' +
              '<span style="font-size:16px;line-height:1;">&#10005;</span></button>' +
              '<iframe src="' + absoluteUrl + '" style="flex:1;width:100%;border:0;background:#fff;"></iframe>';
            overlay.appendChild(wrap);
            document.body.appendChild(overlay);
            const close = () => { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); };
            overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
            wrap.querySelector('#coordMatCloseBtn').addEventListener('click', close);
            const esc = (e)=>{ if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } };
            document.addEventListener('keydown', esc);
          } else if (type === 'code') {
            // Open code in modal viewer
            showCodeViewer(absoluteUrl);
          } else {
            // Download file
            window.open(absoluteUrl, '_blank');
          }
          return;
        }
        if (act === 'mat-import') {
          const url = btn.getAttribute('data-url');
          const lessonEl = btn.closest('[data-lesson-id]');
          const lessonId = lessonEl ? lessonEl.getAttribute('data-lesson-id') : null;
          if (!url || !lessonId) return;
          coordinatorConfirm('Import this link into LMS storage? (max 50MB, allowed types only)', function(){
            (async function(){
              let fd = new FormData();
              fd.append('action','material_import');
              fd.append('lesson_id', lessonId);
              fd.append('url', url);
              try { fd = await addCSRFToken(fd); } catch(_){ }
              fetch('course_outline_manage.php', { method:'POST', credentials:'same-origin', body: fd })
                .then(r=>r.json())
                .then(function(resp){
                  if (!resp || !resp.success) {
                    if (typeof window.showNotification === 'function') window.showNotification('error','Import failed', (resp && resp.message) ? String(resp.message) : '');
                  } else {
                    if (typeof window.showNotification === 'function') window.showNotification('success','Imported','Material saved');
                    viewOutline(courseId);
                  }
                })
                .catch(function(){ if (typeof window.showNotification === 'function') window.showNotification('error','Import failed','Network error'); });
            })();
          });
          return;
        }
        if (act === 'act-delete') {
          coordinatorConfirm('Delete this activity?', function(){
            const fd = new FormData();
            fd.append('action','activity_delete');
            fd.append('id', btn.getAttribute('data-id'));
            postAndRefresh('course_outline_manage.php', fd);
          });
          return;
        }
        if (act === 'act-duplicate') {
          const fd = new FormData();
          fd.append('action','activity_duplicate');
          fd.append('id', btn.getAttribute('data-id'));
          postAndRefresh('course_outline_manage.php', fd);
          return;
        }
        if (act === 'act-instr') {
          const current = (btn.closest('[data-activity-id]')?.getAttribute('data-title') || '');
          outlinePrompt({ title: 'Edit instructions', label: 'Instructions (plain text)', value: '' }, function(text){
            if (text === null) return;
            const fd = new FormData(); fd.append('action','activity_update'); fd.append('id', btn.getAttribute('data-id')); fd.append('instructions', text);
            postAndRefresh('course_outline_manage.php', fd);
          });
          return;
        }
        if (act === 'act-score') {
          outlinePrompt({ title: 'Max score', label: 'Points', value: '100' }, function(val){
            if (val === null) return; const num = parseInt(val,10); if (isNaN(num) || num<=0) return;
            const fd = new FormData(); fd.append('action','activity_update'); fd.append('id', btn.getAttribute('data-id')); fd.append('max_score', String(num));
            postAndRefresh('course_outline_manage.php', fd);
          });
          return;
        }
        if (act === 'act-due') {
          outlinePrompt({ title: 'Schedule (YYYY-MM-DD HH:MM)', label: 'Due at', value: '' }, function(val){
            if (val === null) return;
            const fd = new FormData(); fd.append('action','activity_update'); fd.append('id', btn.getAttribute('data-id')); fd.append('due_at', val);
            postAndRefresh('course_outline_manage.php', fd);
          });
          return;
        }
        if (act === 'act-add') {
          const lessonEl = btn.closest('[data-lesson-id]');
          const lessonId = lessonEl ? lessonEl.getAttribute('data-lesson-id') : null;
          if (!lessonId) return;
          // OPTIMIZED: Show modal immediately, initialize in background
          showCreateActivityForm(lessonId);
          // Use requestAnimationFrame to defer heavy rendering
          requestAnimationFrame(function() {
            try {
              const modal = document.getElementById('createActivityForm');
              if (modal && modal.style.display !== 'none') {
                // Render will be triggered by showCreateActivityForm
              }
            } catch(_) {}
          });
          return;
        }
        if (act === 'act-open-editor') {
          const item = btn.closest('[data-activity-id]');
          const lessonEl = btn.closest('[data-lesson-id]');
          const aId = btn.getAttribute('data-id');
          const lessonId = lessonEl ? lessonEl.getAttribute('data-lesson-id') : null;
          const aType = (item?.getAttribute('data-type') || '').toLowerCase();
          if (!lessonId) return;
          // DEPRECATED: This old code path should not be used anymore
          // The new edit handler (act-edit) fetches data FIRST and passes it as preloadedData
          // This code is kept for backward compatibility but should be removed
          console.warn('🔍 [DEPRECATED] Using old edit path - this should use the new act-edit handler instead');
          // Open the unified editor modal in edit mode for ALL activity types
          showCreateActivityForm(lessonId, { editActivityId: aId });
          // Prefill from server
          try {
            const fd = new FormData(); fd.append('action','activity_get'); fd.append('id', aId);
            // Add cache-busting parameter to force fresh data
            fd.append('_t', Date.now());
            fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
              .then(r=>r.json()).then(function(res){
                if (!res || !res.success || !res.data) return;
                const data = res.data;
                const meta = (function(){ try { return JSON.parse(data.instructions||'{}')||{}; } catch(_) { return {}; } })();
                if (!window.createActivityState) return;
                const st = window.createActivityState;
                // Map backend types -> UI questionType
                const t = String((data.type||'').toLowerCase());
                // Force refresh the form if type detection changes
                if (t === 'upload_based' && st.questionType !== 'upload_based') {
                  // Set the correct question type
                  st.questionType = 'upload_based';
                  st.type = 'lecture';
                  // Trigger form re-render
                  window.dispatchEvent(new CustomEvent('createActivityRender'));
                }
                if (t === 'coding') {
                  st.type = 'laboratory'; st.questionType = 'coding';
                  st.language = (meta.language||'cpp');
                  st.problemStatement = meta.problemStatement||'';
                  st.starterCode = meta.starterCode||'';
                  st.codingDifficulty = meta.difficulty||'beginner';
                  st.expectedOutput = meta.expectedOutput || '';
                  st.additionalRequirements = meta.additionalRequirements || '';
                  st.hints = meta.hints || '';
                  st.timeLimit = meta.timeLimit || st.timeLimit;
                  // CRITICAL: Include points when mapping test cases
                  const dbValue = data.required_construct || data.requiredConstruct || null;
                  const metaValue = meta && (meta.requiredConstruct || meta.required_construct) ? (meta.requiredConstruct || meta.required_construct) : null;
                  st.requiredConstruct = (dbValue && dbValue !== 'null' && dbValue !== '') ? String(dbValue) : (metaValue && metaValue !== 'null' && metaValue !== '') ? String(metaValue) : '';
                  st.testCases = (data.test_cases||[]).map(function(tc){ 
                    let pointsValue = 0;
                    if (tc.points !== null && tc.points !== undefined && tc.points !== '') {
                      pointsValue = parseInt(String(tc.points), 10);
                      if (isNaN(pointsValue)) pointsValue = 0;
                    }
                    return { 
                      input: tc.input_text||'', 
                      output: tc.expected_output_text||'', 
                      isSample: !!tc.is_sample,
                      points: pointsValue,
                      timeLimitMs: parseInt(tc.time_limit_ms || 2000, 10) || 2000
                    }; 
                  });
                } else if (t === 'upload_based') {
                  st.type = 'lecture';
                  st.questionType = 'upload_based';
                  st.instructionsText = meta.instructions || '';
                  
                  // Parse questions from database or create default from instructions
                  if (data.questions && data.questions.length > 0) {
                    st.questions = data.questions.map(function(q){ 
                      // Parse acceptedFiles and maxFileSize from choices
                      let acceptedFiles = ['PDF','DOCX','JPG','PNG','TXT','XML'];
                      let maxFileSize = 5;
                      
                      if (q.choices && q.choices.length > 0) {
                        q.choices.forEach(function(choice) {
                          if (choice.choice_text && choice.choice_text.startsWith('acceptedFiles:')) {
                            acceptedFiles = choice.choice_text.replace('acceptedFiles:', '').split(',');
                          } else if (choice.choice_text && choice.choice_text.startsWith('maxFileSize:')) {
                            maxFileSize = parseInt(choice.choice_text.replace('maxFileSize:', '')) || 5;
                          }
                        });
                      }
                      
                      return { 
                        text: q.question_text || '', 
                        points: q.points || 1, 
                        acceptedFiles: acceptedFiles, 
                        maxFileSize: maxFileSize 
                      }; 
                    });
                  } else {
                    // Create default task from instructions JSON
                    const defaultAcceptedFiles = meta.acceptedFiles || ['PDF','DOCX','JPG','PNG','TXT','XML'];
                    const defaultMaxFileSize = meta.maxFileSize || 5;
                    st.questions = [{ 
                      text: meta.instructions || '', 
                      points: 10, 
                      acceptedFiles: defaultAcceptedFiles, 
                      maxFileSize: defaultMaxFileSize 
                    }];
                  }
                } else {
                  st.type = 'lecture';
                  // Determine subtype using instructions.meta.kind if present (applies to legacy saved activities too)
                  let subtype = null;
                  if (meta && typeof meta.kind === 'string' && meta.kind.trim() !== '') {
                    subtype = meta.kind.toLowerCase();
                  }
                  // Fallback from DB type
                  if (!subtype) subtype = (t==='multiple_choice') ? 'multiple_choice' : (t==='true_false' ? 'true_false' : (t==='identification' ? 'identification' : (t==='essay' ? 'essay' : 'multiple_choice')));
                  st.questionType = subtype;
                  // Convert server questions -> state.questions shape
                  const qs = Array.isArray(data.questions) ? data.questions : [];
                  st._originalQuestionIds = qs.map(function(q){ return q.id; });
                  st.questions = qs.map(function(q){
                    const base = { _id: q.id, text: q.question_text||'', points: q.points||1, explanation: q.explanation||'', answer: q.answer||'' };
                    const choices = Array.isArray(q.choices) ? q.choices : [];
                    console.log('🔍 [LOAD DATA] Question choices from DB:', {
                      questionId: q.id,
                      choicesCount: choices.length,
                      rawChoices: choices
                    });
                    if (subtype === 'multiple_choice') {
                      base._originalChoiceIds = choices.map(function(c){ return c.id; });
                      base.choices = choices.map(function(c){ 
                        // CRITICAL: Get the raw choice_text from database
                        const rawChoiceText = c.choice_text || '';
                        const choiceText = String(rawChoiceText).trim();
                        
                        console.log('🔍 [LOAD DATA] Mapping choice from DB:', {
                          id: c.id,
                          raw_choice_text: c.choice_text,
                          raw_choice_text_type: typeof c.choice_text,
                          raw_choice_text_is_null: c.choice_text === null,
                          raw_choice_text_is_undefined: c.choice_text === undefined,
                          raw_choice_text_is_empty_string: c.choice_text === '',
                          raw_choice_text_length: c.choice_text ? String(c.choice_text).length : 0,
                          final_text: choiceText,
                          final_text_length: choiceText.length,
                          final_text_is_empty: choiceText === '',
                          is_correct: c.is_correct,
                          full_choice_object: c
                        });
                        
                        // CRITICAL: If choice_text is empty from DB, log a warning
                        if (!choiceText || choiceText === '') {
                          console.warn('🔍 [LOAD DATA] ⚠️ WARNING: Empty choice_text for choice ID', c.id, 'from database!');
                        }
                        
                        // CRITICAL: Store BOTH text and choice_text to ensure compatibility
                        // Use the trimmed value, but preserve original if needed
                        return { 
                          _id: c.id, 
                          text: choiceText, // Store trimmed value
                          choice_text: choiceText, // Also store as choice_text for compatibility (SAME AS TEACHER SIDE)
                          correct: !!c.is_correct 
                        }; 
                      });
                      console.log('🔍 [LOAD DATA] Final mapped choices for question:', base.choices);
                    } else if (subtype === 'true_false') {
                      // Prefer q.answer; fallback to choices
                      if (!base.answer) {
                        const trueChoice = choices.find(function(c){ return String(c.choice_text||'').toLowerCase()==='true' && c.is_correct; });
                        const falseChoice = choices.find(function(c){ return String(c.choice_text||'').toLowerCase()==='false' && c.is_correct; });
                        base.answer = trueChoice ? 'true' : (falseChoice ? 'false' : '');
                      } else {
                        base.answer = (String(base.answer).toLowerCase()==='true') ? 'true' : (String(base.answer).toLowerCase()==='false' ? 'false' : '');
                      }
                    } else if (subtype === 'identification') {
                      // Prefer q.answer; fallback to the first correct choice text
                      if (!base.answer) {
                        const correct = choices.find(function(c){ return !!c.is_correct; });
                        base.answer = correct ? (correct.choice_text||'') : '';
                      }
                    // Fallback to explanation field if still empty (legacy storage)
                    if (!base.answer && base.explanation) {
                        // Check if explanation contains JSON with primary + alternatives
                        try {
                          const parsed = JSON.parse(base.explanation);
                          if (parsed && typeof parsed === 'object' && parsed !== null) {
                            // New format: {"primary": "...", "alternatives": [...]}
                            if (parsed.primary) {
                              base.answer = String(parsed.primary).trim();
                            }
                            if (parsed.alternatives && Array.isArray(parsed.alternatives)) {
                              base.alternativeAnswers = parsed.alternatives.filter(a => a && String(a).trim()).map(a => String(a).trim());
                            }
                            base.explanation = ''; // Clear explanation since we've extracted the data
                          } else {
                            // Not object, treat as legacy single answer
                      base.answer = base.explanation;
                          }
                        } catch(e) {
                          // Not JSON, treat as legacy single answer
                          base.answer = base.explanation;
                        }
                      } else if (base.explanation) {
                        // Check if explanation contains JSON with primary + alternatives (even if answer exists)
                        try {
                          const parsed = JSON.parse(base.explanation);
                          if (parsed && typeof parsed === 'object' && parsed !== null) {
                            // New format: {"primary": "...", "alternatives": [...]}
                            if (parsed.primary && !base.answer) {
                              base.answer = String(parsed.primary).trim();
                            }
                            if (parsed.alternatives && Array.isArray(parsed.alternatives)) {
                              base.alternativeAnswers = parsed.alternatives.filter(a => a && String(a).trim()).map(a => String(a).trim());
                            }
                            base.explanation = '';
                          }
                        } catch(e) {
                          // Not JSON, ignore
                        }
                      }
                    } else if (subtype === 'essay') {
                      if (!base.answer && base.explanation) { base.answer = base.explanation; }
                    }
                    return base;
                  });
                  // Heuristic: if subtype ended up as multiple_choice but there are no choices at all, treat as essay
                  if (subtype === 'multiple_choice') {
                    const anyChoices = st.questions.some(function(q){ return Array.isArray(q.choices) && q.choices.length > 0; });
                    if (!anyChoices) { st.questionType = 'essay'; subtype = 'essay'; }
                  }
                  if (!st.questions || !st.questions.length) {
                    if (subtype === 'multiple_choice') {
                      st.questions = [{ text:'', points:1, choices:[{text:'',correct:false},{text:'',correct:false}], answer:'', explanation:'' }];
                    } else if (subtype === 'true_false') {
                      st.questions = [{ text:'', points:1, answer:'true', explanation:'' }];
                    } else if (subtype === 'identification') {
                      st.questions = [{ text:'', points:1, answer:'', explanation:'' }];
                    } else if (subtype === 'essay') {
                      st.questions = [{ text:'', points:1, answer:'', explanation:'' }];
                    }
                  }
                }
                // Common fields
                st.name = data.title || st.name;
                // For coding, instructions are JSON meta.instructions; for others, read from JSON envelope if available
                st.instructionsText = (t==='coding') ? (meta.instructions || '') : (meta && typeof meta.instructions === 'string' ? meta.instructions : (typeof data.instructions === 'string' ? data.instructions : ''));
                st.maxScore = data.max_score ? parseInt(data.max_score,10) : st.maxScore;
                // Re-render
                window.dispatchEvent(new CustomEvent('createActivityRender'));
              });
          } catch(_){}
          return;
        }
        if (act === 'act-edit') {
          const item = btn.closest('[data-activity-id]');
          const current = item?.getAttribute('data-title') || '';
          const aType = (item?.getAttribute('data-type') || '').toLowerCase();
          const aId = btn.getAttribute('data-id');
          const lessonEl = btn.closest('[data-lesson-id]');
          const lessonId = lessonEl ? lessonEl.getAttribute('data-lesson-id') : null;
          
          // Use unified editor for ALL activity types
          if (lessonId) {
            // CRITICAL: Fetch activity data FIRST before opening form (same as act-test)
            console.log('🔍 [EDIT BUTTON] Fetching activity data for ID:', aId);
            const fd = new FormData();
            fd.append('action', 'activity_get');
            fd.append('id', aId);
            
            fetch('course_outline_manage.php', { method: 'POST', body: fd, credentials: 'same-origin' })
              .then(r => r.json())
              .then(res => {
                if (res && res.success && res.data) {
                  const activityData = res.data;
                  console.log('🔍 [EDIT BUTTON] Raw activity data from backend:', activityData);
                  console.log('🔍 [EDIT BUTTON] All keys in activityData:', Object.keys(activityData));
                  console.log('🔍 [EDIT BUTTON] required_construct:', activityData.required_construct, 'type:', typeof activityData.required_construct);
                  console.log('🔍 [EDIT BUTTON] test_cases:', activityData.test_cases);
                  
                  // CRITICAL: Load data into preloadedState (same logic as act-test)
                  const preloadedState = {
                    name: activityData.title || 'Untitled Activity',
                    type: activityData.type === 'coding' ? 'laboratory' : 'lecture',
                    questionType: activityData.type,
                    instructionsText: activityData.instructions || '',
                    max_score: activityData.max_score || 0,
                    startAt: activityData.start_at || '',
                    dueAt: activityData.due_at || '',
                    requiredConstruct: '',
                    testCases: [],
                    editActivityId: aId,
                    viewMode: 'edit'
                  };
                  
                  // For coding activities, parse the instructions and load test cases
                  if (activityData.type === 'coding' && activityData.instructions) {
                    try {
                      const meta = JSON.parse(activityData.instructions);
                      preloadedState.language = meta.language || 'cpp';
                      preloadedState.starterCode = meta.starterCode || '';
                      preloadedState.problemStatement = meta.problemStatement || '';
                      preloadedState.expectedOutput = meta.expectedOutput || '';
                      preloadedState.additionalRequirements = meta.additionalRequirements || '';
                      preloadedState.hints = meta.hints || '';
                      
                      // CRITICAL: Load required_construct from DB field FIRST
                      const dbValue = activityData.required_construct || activityData.requiredConstruct || null;
                      const metaValue = meta && (meta.requiredConstruct || meta.required_construct) ? (meta.requiredConstruct || meta.required_construct) : null;
                      preloadedState.requiredConstruct = (dbValue && dbValue !== 'null' && dbValue !== '') ? String(dbValue) : (metaValue && metaValue !== 'null' && metaValue !== '') ? String(metaValue) : '';
                      console.log('🔍 [EDIT BUTTON] Pre-loaded requiredConstruct:', preloadedState.requiredConstruct);
                      
                      // Map test cases properly
                      const dbTestCases = activityData.test_cases || [];
                      console.log('🔍 [EDIT BUTTON] Raw test cases from backend:', JSON.stringify(dbTestCases));
                      preloadedState.testCases = dbTestCases.map(function(tc, idx) {
                        let pointsValue = 0;
                        if (tc.points !== null && tc.points !== undefined && tc.points !== '') {
                          pointsValue = parseInt(String(tc.points), 10);
                          if (isNaN(pointsValue)) pointsValue = 0;
                        }
                        const mapped = {
                          input: tc.input_text || '',
                          output: tc.expected_output_text || '',
                          isSample: !!tc.is_sample,
                          points: pointsValue,
                          timeLimitMs: parseInt(tc.time_limit_ms || 2000, 10) || 2000
                        };
                        console.log(`🔍 [EDIT BUTTON] Mapped TC ${idx}:`, mapped);
                        return mapped;
                      });
                      console.log('🔍 [EDIT BUTTON] Pre-loaded', preloadedState.testCases.length, 'test cases');
                    } catch (e) {
                      console.error('🔍 [EDIT BUTTON] Failed to parse coding instructions:', e);
                    }
                  }
                  
                  // NOW open the form with pre-loaded data
                  console.log('🔍 [EDIT BUTTON] Opening form with preloadedData:', preloadedState);
                  showCreateActivityForm(lessonId, { editActivityId: aId, preloadedData: preloadedState });
                } else {
                  console.error('🔍 [EDIT BUTTON] Failed to load activity data');
                  alert('Failed to load activity data for editing');
                }
              })
              .catch(err => {
                console.error('🔍 [EDIT BUTTON] Error loading activity:', err);
                alert('Error loading activity for editing');
              });
          } else {
            // Fallback to simple title edit if lessonId not available
            outlinePrompt({ title: 'Edit activity', label: 'Title', value: current }, function(title){
              if (title === null) return;
              const fd = new FormData();
              fd.append('action','activity_update');
              fd.append('id', aId);
              fd.append('title', title);
              postAndRefresh('course_outline_manage.php', fd);
            });
          }
          return;
        }
        if (act === 'act-test') {
          const activityId = btn.getAttribute('data-id');
          const lessonEl = btn.closest('[data-lesson-id]');
          const lessonId = lessonEl ? lessonEl.getAttribute('data-lesson-id') : null;
          
          if (!lessonId) {
            return;
          }
          
          // CRITICAL: Fetch from universal_activity_api.php FIRST (same as Teacher side)
          // This ensures we get questions with choices in the correct format (choice_text property)
          console.log('🔍 [TEST BUTTON] Fetching activity data from universal_activity_api.php...');
          fetch(`universal_activity_api.php?action=get_activity&id=${activityId}`, {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          })
            .then(r => r.text())
            .then(responseText => {
              let activityData = null;
              try {
                const apiData = JSON.parse(responseText);
                if (apiData.success && apiData.activity) {
                  console.log('🔍 [TEST BUTTON] ✅ Successfully fetched from universal_activity_api.php');
                  activityData = apiData.activity;
                  console.log('🔍 [TEST BUTTON] Activity data from API:', {
                    id: activityData.id,
                    type: activityData.type,
                    questionsCount: activityData.questions ? activityData.questions.length : 0,
                    firstQuestionChoices: activityData.questions && activityData.questions[0] ? activityData.questions[0].choices : null
                  });
                } else {
                  throw new Error('API returned failure');
                }
              } catch (e) {
                console.warn('🔍 [TEST BUTTON] Failed to fetch from universal_activity_api.php, falling back to activity_get:', e);
                // Fallback to activity_get
                const fd = new FormData();
                fd.append('action', 'activity_get');
                fd.append('id', activityId);
                return fetch('course_outline_manage.php', { method: 'POST', body: fd, credentials: 'same-origin' })
                  .then(r => r.json())
                  .then(res => {
                    if (res && res.success && res.data) {
                      return res.data;
                    }
                    throw new Error('Failed to load activity data');
                  });
              }
              
              if (!activityData) {
                throw new Error('No activity data loaded');
              }
              
              return activityData;
            })
            .then(activityData => {
              if (activityData) {
                console.log('🔍 [EDIT LOAD] Raw activity data from backend:', activityData);
                console.log('🔍 [EDIT LOAD] All keys in activityData:', Object.keys(activityData));
                console.log('🔍 [EDIT LOAD] required_construct:', activityData.required_construct, 'type:', typeof activityData.required_construct, 'isset:', activityData.hasOwnProperty('required_construct'));
                console.log('🔍 [EDIT LOAD] test_cases:', activityData.test_cases);
                if (activityData.test_cases) {
                  activityData.test_cases.forEach((tc, i) => {
                    console.log(`🔍 [EDIT LOAD] TC ${i}: points=${tc.points}, is_sample=${tc.is_sample}, input="${tc.input_text}", output="${tc.expected_output_text}"`);
                  });
                }
                // CRITICAL: Load data into a temporary object FIRST, then open form with pre-loaded data
                const preloadedState = {
                  name: activityData.title || 'Untitled Activity',
                  type: activityData.type === 'coding' ? 'laboratory' : 'lecture',
                  questionType: activityData.type,
                  instructionsText: activityData.instructions || '',
                  max_score: activityData.max_score || 0,
                  requiredConstruct: '', // Will be set below
                  testCases: [], // Will be set below
                  editActivityId: activityId,
                  viewMode: 'edit'
                };
                
                // For coding activities, parse the instructions and load test cases
                if (activityData.type === 'coding' && activityData.instructions) {
                  try {
                    const meta = JSON.parse(activityData.instructions);
                    preloadedState.language = meta.language || 'cpp';
                    preloadedState.starterCode = meta.starterCode || '';
                    preloadedState.problemStatement = meta.problemStatement || '';
                    preloadedState.expectedOutput = meta.expectedOutput || '';
                    preloadedState.additionalRequirements = meta.additionalRequirements || '';
                    preloadedState.hints = meta.hints || '';
                    // CRITICAL: Load required_construct from DB field FIRST (more reliable), then fallback to meta
                    // Check both snake_case and camelCase field names (backend might return either)
                    const dbValue = activityData.required_construct || activityData.requiredConstruct || null;
                    const metaValue = meta && (meta.requiredConstruct || meta.required_construct) ? (meta.requiredConstruct || meta.required_construct) : null;
                    // Use the first non-null/non-empty value found
                    preloadedState.requiredConstruct = (dbValue && dbValue !== 'null' && dbValue !== '') ? String(dbValue) : (metaValue && metaValue !== 'null' && metaValue !== '') ? String(metaValue) : '';
                    console.log('🔍 [EDIT LOAD] Pre-loaded requiredConstruct:', preloadedState.requiredConstruct, 'from DB (snake_case):', activityData.required_construct, 'from DB (camelCase):', activityData.requiredConstruct, 'DB type:', typeof activityData.required_construct, 'from meta:', metaValue);
                    
                    // Map test cases properly: DB format -> form format
                    const dbTestCases = activityData.test_cases || [];
                    console.log('🔍 [EDIT LOAD] Raw test cases from backend:', JSON.stringify(dbTestCases));
                    preloadedState.testCases = dbTestCases.map(function(tc, idx) {
                      // CRITICAL: Log the raw test case object to see all properties
                      console.log(`🔍 [EDIT LOAD] Raw TC ${idx} object:`, tc);
                      console.log(`🔍 [EDIT LOAD] Raw TC ${idx} keys:`, Object.keys(tc));
                      console.log(`🔍 [EDIT LOAD] Raw TC ${idx} points value:`, tc.points, 'type:', typeof tc.points, 'isNull:', tc.points === null, 'isUndefined:', tc.points === undefined);
                      
                      // CRITICAL: Handle points explicitly - check for null, undefined, or empty
                      let pointsValue = 0;
                      if (tc.points !== null && tc.points !== undefined && tc.points !== '') {
                        pointsValue = parseInt(String(tc.points), 10);
                        if (isNaN(pointsValue)) pointsValue = 0;
                      }
                      
                      const mapped = {
                        input: tc.input_text || '',
                        output: tc.expected_output_text || '',
                        isSample: !!tc.is_sample,
                        points: pointsValue,
                        timeLimitMs: parseInt(tc.time_limit_ms || 2000, 10) || 2000
                      };
                      console.log(`🔍 [EDIT LOAD] Mapped TC ${idx}:`, mapped, 'points:', mapped.points, 'type:', typeof mapped.points);
                      return mapped;
                    });
                    console.log('🔍 [EDIT LOAD] Pre-loaded', preloadedState.testCases.length, 'test cases');
                  } catch (e) {
                    console.error('🔍 [EDIT LOAD] Failed to parse coding instructions:', e);
                  }
                }
                // CRITICAL: Map questions from API format to state format
                // API returns questions with choices having 'choice_text' property (same as Teacher side)
                if (activityData.questions && Array.isArray(activityData.questions)) {
                  console.log('🔍 [TEST BUTTON] Mapping questions from API format to state format...');
                  preloadedState.questions = activityData.questions.map(function(q) {
                    const base = {
                      _id: q.id,
                      id: q.id,
                      text: q.question_text || q.text || '',
                      question_text: q.question_text || q.text || '',
                      points: q.points || 1,
                      // CRITICAL: Include answer and explanation fields for Identification activities
                      explanation: q.explanation || '',
                      answer: q.answer || ''
                    };
                    
                    // Map choices - API format has 'choice_text', state format needs both 'text' and 'choice_text'
                    if (q.choices && Array.isArray(q.choices)) {
                      base.choices = q.choices.map(function(c) {
                        const choiceText = c.choice_text || c.text || '';
                        console.log('🔍 [TEST BUTTON] Mapping choice:', {
                          id: c.id,
                          choice_text: c.choice_text,
                          text: c.text,
                          final: choiceText
                        });
                        return {
                          _id: c.id,
                          text: choiceText, // State format
                          choice_text: choiceText, // Also keep choice_text for compatibility
                          correct: !!c.is_correct
                        };
                      });
                    }
                    
                    return base;
                  });
                  console.log('🔍 [TEST BUTTON] Mapped questions:', preloadedState.questions);
                } else {
                  console.warn('🔍 [TEST BUTTON] No questions found in API response');
                  preloadedState.questions = [];
                }
                
                // CRITICAL: For Test button, open in PREVIEW mode (not edit mode)
                // This allows coordinator to test the activity as students would see it
                preloadedState.viewMode = 'preview';
                // NOW open the form with pre-loaded data in PREVIEW mode
                showCreateActivityForm(lessonId, { editActivityId: activityId, preloadedData: preloadedState });
                
                // CRITICAL: Wait for form to be fully initialized before applying pre-loaded data
                const loadDataIntoForm = () => {
                  try {
                    if (!window.createActivityState) {
                      console.warn('🔍 [TEST LOAD] State not ready, retrying...');
                      setTimeout(loadDataIntoForm, 50);
                      return;
                    }
                    
                    console.log('🔍 [TEST LOAD] Data already pre-loaded, just verifying state...');
                    console.log('🔍 [TEST LOAD] Current state:', {
                      requiredConstruct: window.createActivityState.requiredConstruct,
                      testCases: window.createActivityState.testCases,
                      testCasesCount: window.createActivityState.testCases ? window.createActivityState.testCases.length : 0,
                      viewMode: window.createActivityState.viewMode
                    });
                    
                    // CRITICAL: Set to PREVIEW mode so coordinator can test the activity
                    window.createActivityState.viewMode = 'preview';
                    try { 
                      const formModal = document.getElementById('createActivityForm')||document.querySelector('#createActivityModal');
                      if (formModal) {
                        formModal.classList.add('is-preview'); // Add preview class for preview mode
                        const footer = formModal.querySelector('#cafFooter');
                        if (footer) footer.style.display = 'none'; // Hide footer in preview mode
                        const editBtn = formModal.querySelector('#cafEditMode');
                        const previewBtn = formModal.querySelector('#cafPreviewMode');
                        if (previewBtn) previewBtn.classList.add('active');
                        if (editBtn) editBtn.classList.remove('active');
                        // Update modal title
                        const titleEl = formModal.querySelector('#cafTitle');
                        if (titleEl) titleEl.textContent = `Preview: ${preloadedState.name || 'Activity'}`;
                      }
                    } catch(_){ }
                    
                    // CRITICAL: Trigger render immediately since data is already in state
                    console.log('🔍 [EDIT LOAD] Triggering render with pre-loaded data, state.requiredConstruct:', window.createActivityState.requiredConstruct);
                    window.dispatchEvent(new CustomEvent('createActivityRender'));
                    
                    // CRITICAL: Also explicitly set dropdown and render test cases after render completes
                    setTimeout(() => {
                      try {
                        // CRITICAL: Check viewMode - dropdown only exists in edit mode, not preview mode
                        const viewMode = window.createActivityState ? window.createActivityState.viewMode : 'edit';
                        const isPreviewMode = viewMode === 'preview';
                        
                        const activityType = window.createActivityState.type || '';
                        const questionType = window.createActivityState.questionType || '';
                        // CRITICAL: Check both type and questionType for coding activities
                        const isCodingActivity = activityType === 'coding' || activityType === 'laboratory' || questionType === 'coding';
                        
                        console.log('🔍 [EDIT LOAD] Activity type:', activityType, 'questionType:', questionType, 'isCoding:', isCodingActivity, 'viewMode:', viewMode, 'isPreview:', isPreviewMode);
                        
                        // Only set required construct dropdown and render test cases for coding activities
                        // AND only if we're in edit mode (dropdown doesn't exist in preview mode)
                        if (isCodingActivity && !isPreviewMode) {
                          console.log('🔍 [EDIT LOAD] Attempting to set dropdown value...');
                          console.log('🔍 [EDIT LOAD] State requiredConstruct:', window.createActivityState.requiredConstruct);
                          console.log('🔍 [EDIT LOAD] State questionType:', window.createActivityState.questionType);
                          // Set required construct dropdown value
                          const rcDropdown = document.getElementById('cafRequiredConstruct');
                          console.log('🔍 [EDIT LOAD] Dropdown found:', !!rcDropdown);
                          if (rcDropdown) {
                            console.log('🔍 [EDIT LOAD] Dropdown current value:', rcDropdown.value);
                            console.log('🔍 [EDIT LOAD] State requiredConstruct value:', window.createActivityState.requiredConstruct);
                            if (window.createActivityState.requiredConstruct) {
                              rcDropdown.value = window.createActivityState.requiredConstruct;
                              console.log('🔍 [EDIT LOAD] Set dropdown value to:', window.createActivityState.requiredConstruct, 'new value:', rcDropdown.value);
                            } else {
                              console.warn('🔍 [EDIT LOAD] WARNING: State requiredConstruct is empty!');
                            }
                          } else {
                            console.warn('🔍 [EDIT LOAD] WARNING: Required Construct dropdown not found in DOM (this is normal if form is still rendering or in preview mode)');
                            // Try again after a longer delay if dropdown not found
                            setTimeout(() => {
                              const rcDropdownRetry = document.getElementById('cafRequiredConstruct');
                              if (rcDropdownRetry && window.createActivityState && window.createActivityState.requiredConstruct) {
                                rcDropdownRetry.value = window.createActivityState.requiredConstruct;
                                console.log('🔍 [EDIT LOAD] Retry: Set dropdown value to:', window.createActivityState.requiredConstruct);
                              }
                            }, 1000);
                          }
                          
                          // Render test cases (only for coding activities in edit mode)
                          if (typeof renderTestCases === 'function') {
                            console.log('🔍 [EDIT LOAD] Calling renderTestCases() explicitly');
                            renderTestCases();
                          } else {
                            console.warn('🔍 [EDIT LOAD] renderTestCases function not found!');
                          }
                        } else if (isPreviewMode) {
                          console.log('🔍 [EDIT LOAD] In preview mode - skipping dropdown setup (dropdown only exists in edit mode)');
                        } else {
                          console.log('🔍 [EDIT LOAD] Skipping Required Construct dropdown and test cases (not a coding activity)');
                        }
                      } catch(e) {
                        console.error('🔍 [EDIT LOAD] Error setting form values:', e);
                        console.error('🔍 [EDIT LOAD] Error stack:', e.stack);
                      }
                    }, 500); // Increased timeout to ensure render completes
                  } catch (e) {
                    console.error('🔍 [EDIT LOAD] Error loading data:', e);
                  }
                };
                
                // Start loading after form is initialized
                setTimeout(loadDataIntoForm, 150);
              } else {
                alert('Failed to load activity data for preview');
              }
            })
            .catch(err => {
              alert('Error loading activity for preview');
            });
          
          return;
        }
        if (act === 'act-run') {
          const activityId = btn.getAttribute('data-id');
          // Try to find the activity card to infer language from data if present later
          const card = btn.closest('[data-activity-id]');
          let defaultSource = '';
          try {
            // Fallbacks per language; we will default to C++ if we cannot detect language from activity metadata
            // We'll fetch the activity first to determine language
          } catch (_) {}
          btn.disabled = true; btn.textContent = 'Running...';
          // Fetch activity data to detect language and build a minimal correct program
          const metaFd = new FormData(); metaFd.append('action','activity_get'); metaFd.append('id', activityId);
          fetch('course_outline_manage.php', { method:'POST', body: metaFd, credentials:'same-origin' })
            .then(function(r){ return r.json(); })
            .then(function(res){
              let lang = 'cpp';
              if (res && res.success && res.data && res.data.instructions){
                try { const meta = JSON.parse(res.data.instructions||'{}'); if (meta && typeof meta.language === 'string'){ const l = meta.language.toLowerCase(); if (l==='java') lang='java'; else if (l==='python'||l==='python3'||l==='py') lang='python3'; else if (l==='c++'||l==='cpp'||l==='cxx') lang='cpp'; } } catch(e){}
              }
              if (!defaultSource){
                if (lang==='java') defaultSource = 'public class Main { public static void main(String[] args) { System.out.print("OK"); } }';
                else if (lang==='python3') defaultSource = 'print("OK")';
                else defaultSource = '#include <iostream>\nint main(){ std::cout<<"OK"; return 0; }';
              }
          let fd = new FormData();
          fd.append('action','run_activity');
          fd.append('activity_id', activityId);
              fd.append('source', defaultSource);
              fd.append('quick','1');
              return fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' });
            })
            .then(function(r){ return r ? r.json() : { success:false, message:'No response' }; })
            .then(function(data){
              btn.disabled=false; btn.textContent='Run';
              // Show JDoodle results
              const results = (data && data.results) ? data.results : null;
              let content = '';
              if (Array.isArray(results)){
                content = results.map(function(r, i){
                  const ok = r && (r.success===true || r.status===200);
                  const out = (r && r.data && r.data.output) ? r.data.output : (r && r.data && r.data.stdout) ? r.data.stdout : (r && r.raw) ? r.raw : '';
                  const err = (r && r.data && r.data.stderr) ? r.data.stderr : (r && r.error) ? r.error : '';
                  return '<div style="margin-bottom:10px;">'+
                         '<div style="font-weight:600;">Case '+(i+1)+(ok?' ✅':' ❌')+'</div>'+
                         (out?('<pre style="white-space:pre-wrap;background:#f7f7f7;padding:8px;border-radius:4px;">'+out.replace(/</g,'&lt;')+'</pre>'):'')+
                         (err?('<pre style="white-space:pre-wrap;background:#fff3f3;padding:8px;border-radius:4px;color:#b30000;">'+String(err).replace(/</g,'&lt;')+'</pre>'):'')+
                         '</div>';
                }).join('');
              } else {
                content = '<div>'+ (data && data.message ? String(data.message) : 'No results') +'</div>';
              }
              const modal = document.createElement('div');
              modal.className = 'modal-overlay';
              modal.innerHTML = '<div class="modal-card" style="max-width:800px;width:95%;max-height:80vh;display:flex;flex-direction:column;">'+
                                 '<div style="padding:12px 14px;border-bottom:1px solid #e9ecef;display:flex;align-items:center;gap:8px;"><strong style="flex:1">Run Results</strong><button class="action-btn btn-gray" id="rrClose">Close</button></div>'+
                                 '<div style="padding:12px 14px;overflow:auto;flex:1">'+content+'</div>'+
                                 '</div>';
              document.body.appendChild(modal);
              const close = function(){ if (modal && modal.parentNode) modal.parentNode.removeChild(modal); };
              modal.addEventListener('click', function(e){ if (e.target===modal) close(); });
              const btnClose = modal.querySelector('#rrClose'); if (btnClose) btnClose.onclick = close;
            })
            .catch(function(){ btn.disabled=false; btn.textContent='Run'; if (typeof window.showNotification === 'function') window.showNotification('error','Run failed','Network error'); });
          return;
        }
      };
    })
    .catch(() => {
      body.innerHTML = '<div class="empty-state">Failed to load outline</div>';
    });
  })();
  // Wire top-level Add Module button
  const addModuleBtn = cont.querySelector('#outlineAddModuleBtn');
  if (addModuleBtn) {
    addModuleBtn.onclick = function(){
      outlinePrompt({ 
        title: 'Create New Module', 
        label: 'Module Title', 
        placeholder: 'e.g., Module 1 - Introduction to Programming',
        value: ''
      }, function(title){
        if (!title) return;
        const fd = new FormData();
        fd.append('action','module_create');
        fd.append('course_id', String(courseId));
        fd.append('title', title);
        fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
          .then(r=>r.json())
          .then(()=> viewOutline(courseId))
          .catch(()=> { if (typeof window.showNotification === 'function') window.showNotification('error','Error','Failed to add module'); });
      });
    };
  }
}

// Render outline JSON into HTML (copied from admin_panel.js)
function renderOutline(outline, mount) {
  // OPTIMIZED: Store outline data globally for points calculation
  try { window.__lastOutlineData = outline; } catch(_){}
  if (!Array.isArray(outline) || outline.length === 0) {
    mount.innerHTML = '<div class="empty-state">No modules yet</div>';
    return;
  }
  const renderModule = (m) => {
    const lessons = (m.lessons||[]).map(l => {
      // Rendering lesson
      const mats = (l.materials||[]).map(mat => {
        const matType = String(mat.type||'').toLowerCase();
        const matUrl = mat.url || '';
        const matFilename = mat.filename || '';
        // Determine if this material can be viewed/opened
        const isPage = (matType === 'page') || (/^material_page_view\.php/i.test(matUrl));
        let viewBtn = '';
        if (matUrl) {
          if (matType === 'pdf') {
            viewBtn = `<button class="action-btn" data-act="mat-view" data-url="${matUrl}" data-type="pdf" style="background:#007bff;color:#fff;">📄 View PDF</button>`;
          } else if (matType === 'link') {
            viewBtn = `<div style="display:flex;gap:6px;">
              <button class="action-btn" data-act="mat-view" data-url="${matUrl}" data-type="link" style="background:#17a2b8;color:#fff;">🔗 Open Link</button>
              <button class="action-btn" data-act="mat-import" data-url="${matUrl}" data-type="link" style="background:#6f42c1;color:#fff;">⬇️ Import</button>
            </div>`;
          } else if (isPage) {
              viewBtn = `<button class="action-btn" data-act="mat-view" data-url="${matUrl}" data-type="page" style="background:#0d6efd;color:#fff;">📘 Open Content</button>`;
          } else if (matType === 'code') {
            viewBtn = `<button class="action-btn" data-act="mat-view" data-url="${matUrl}" data-type="code" style="background:#6f42c1;color:#fff;">👁️ View Code</button>`;
          } else {
            viewBtn = `<button class="action-btn" data-act="mat-view" data-url="${matUrl}" data-type="file" style="background:#28a745;color:#fff;">⬇️ Download</button>`;
          }
        }
        const displayName = (function(){
          if (isPage) {
            return (mat.filename && mat.filename.trim()) ? mat.filename : 'Page';
          }
          return matFilename || (matUrl || '');
        })();
        return `
        <div data-mat-id="${mat.id}" class="outline-material-item" style="display:flex;align-items:center;gap:6px;padding:6px 8px;border:1px dashed #ddd;border-radius:6px;margin:4px 0;">
          <button class="action-btn" data-act="mat-open-editor" data-id="${mat.id}" data-url="${matUrl}" style="flex:1;text-align:left;background:transparent;border:0;color:#212529;padding:0;cursor:pointer;font-size:12px;"><strong>${isPage ? 'PAGE' : (mat.type||'').toUpperCase()}</strong> • ${displayName}</button>
          ${viewBtn}
          <button class="action-btn" data-act="mat-edit" data-id="${mat.id}" style="background:#6c757d;color:#fff;">Edit</button>
          <button class="action-btn delete-btn" data-act="mat-delete" data-id="${mat.id}">Delete</button>
        </div>`;
      }).join('');
      const activities = (l.activities||[]).map(a => {
        const t = String(a.type||'').toLowerCase();
        // Prefer explicit DB type
        let label = (String(a.type||'').trim() || '').toUpperCase();
        // Fallback to instructions.kind
        if ((!label || label === 'QUIZ') && a && a.instructions) {
          try {
            const meta = JSON.parse(a.instructions||'{}');
            if (meta && meta.kind) label = String(meta.kind).toUpperCase();
          } catch(_) {}
        }
        // Heuristics if still empty or generic
        if (!label || label === 'QUIZ') {
          try {
            const qs = Array.isArray(a.questions) ? a.questions : [];
            if (Array.isArray(a.test_cases) && a.test_cases.length) label = 'CODING';
            else if (qs.length) {
              if (qs.every(q => Array.isArray(q.choices) && q.choices.length > 0)) label = 'MULTIPLE_CHOICE';
              else if (qs.every(q => !Array.isArray(q.choices) || q.choices.length === 0)) {
                // No choices: treat as textual responses
                const hasLong = qs.some(q => ((q.explanation||'').length > 50) || ((q.answer||'').length > 50));
                // If there is any configured short answer, it's identification; otherwise assume ESSAY
                const hasShortAns = qs.some(q => (q.answer && String(q.answer).length > 0) || (q.explanation && String(q.explanation).length > 0));
                label = hasShortAns ? (hasLong ? 'ESSAY' : 'IDENTIFICATION') : 'ESSAY';
              }
            }
          } catch(_) {}
        }
        if ((!label || label === '') && a && a.title && /essay/i.test(String(a.title))) label = 'ESSAY';
        // Keep TRUE_FALSE label as-is
        return `
        <div data-activity-id="${a.id}" data-title="${(a.title||'').replace(/"/g,'&quot;')}" data-type="${(a.type||'').toLowerCase()}" draggable="true" style="display:flex;align-items:center;gap:6px;padding:6px 8px;border:1px dotted #ccc;border-radius:6px;margin:4px 0;">
          <button class="action-btn" data-act="act-open-editor" data-id="${a.id}" style="flex:1;text-align:left;background:transparent;border:0;color:#212529;padding:0;cursor:pointer;font-size:12px;"><strong>${label}</strong>: ${a.title}</button>
          <span data-points-for="${a.id}" style="display:inline-block;min-width:48px;text-align:center;background:#f1f3f5;color:#495057;border:1px solid #dee2e6;border-radius:999px;padding:2px 8px;font-size:11px;">...</span>
          <button class="action-btn" data-act="act-test" data-id="${a.id}" style="background:#28a745;color:#fff;">Test</button>
          ${String(a.type||'').toLowerCase()==='coding' ? '<button class=\"action-btn\" data-act=\"act-run\" data-id=\"'+a.id+'\" style=\"background:#2196F3;color:#fff;\">Run</button>' : ''}
          <button class="action-btn" data-act="act-duplicate" data-id="${a.id}" style="background:#17a2b8;color:#fff;">Duplicate</button>
          <button class="action-btn" data-act="act-edit" data-id="${a.id}" style="background:#6c757d;color:#fff;">Edit</button>
          <button class="action-btn delete-btn" data-act="act-delete" data-id="${a.id}">Delete</button>
        </div>`; }).join('');
      return `
        <li data-lesson-id="${l.id}" class="outline-lesson-item" draggable="true" style="padding:6px 8px;border:1px solid #eee;border-radius:6px;margin:6px 0;">
          <div class="outline-header" style="display:flex;align-items:center;gap:6px;">
            <span class="outline-title" style="flex:1">${l.title}</span>
            <div class="outline-toolbar">
              <button class="action-btn icon btn-green" data-act="mat-add"><i class="fas fa-paperclip"></i>Material</button>
              <button class="action-btn icon btn-green" data-act="act-add"><i class="fas fa-tasks"></i>Activity</button>
              <button class="action-btn icon btn-gray" data-act="lesson-edit" data-id="${l.id}"><i class="fas fa-edit"></i>Edit</button>
              <button class="action-btn icon btn-red" data-act="lesson-delete" data-id="${l.id}"><i class="fas fa-trash"></i>Delete</button>
            </div>
          </div>
          <div style="margin-top:8px;">
            <div style="font-size:11px;color:#666;margin-bottom:4px;">Materials:</div>
            <div class="outline-materials" data-lesson-id="${l.id}">${mats || '<div style="color:#999;font-size:11px;font-style:italic;">No materials</div>'}</div>
            <div style="font-size:11px;color:#666;margin:8px 0 4px;">Activities:</div>
            <div>${activities || '<div style="color:#999;font-size:11px;font-style:italic;">No activities</div>'}</div>
          </div>
        </li>`;
    }).join('');
    return `
      <div data-module-id="${m.id}" class="outline-module" style="margin-bottom:16px;border:1px solid #e9ecef;border-radius:8px;overflow:hidden;">
        <div class="outline-header module-header" style="font-weight:600;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-layer-group" style="color:#6c757d;"></i>
          <span class="outline-title" style="flex:1">${m.title || 'Untitled Module'}</span>
          <div class="outline-toolbar">
            <button class="action-btn icon btn-green" data-act="lesson-add"><i class="fas fa-plus"></i>Topic</button>
            <button class="action-btn icon btn-gray" data-act="module-edit" data-id="${m.id}"><i class="fas fa-edit"></i>Edit</button>
            <button class="action-btn icon btn-red" data-act="module-delete" data-id="${m.id}"><i class="fas fa-trash"></i>Delete</button>
          </div>
        </div>
        <div class="module-content" style="padding:8px 12px;">
          <ul class="outline-lessons" data-module-id="${m.id}" style="list-style:none;margin:0;padding:0;">${lessons || '<li style="color:#999;font-style:italic;padding:8px;">No lessons</li>'}</ul>
        </div>
      </div>`;
  };
  
  const html = outline.map(renderModule).join('');
  mount.innerHTML = html;
  
  // Add collapse/expand toggles per module
  // Get course ID for localStorage key (use current courseId from context)
  var courseId = (typeof window.__CURRENT_COURSE_ID__ !== 'undefined') ? window.__CURRENT_COURSE_ID__ : 
                 (mount.closest('[data-course-id]') && mount.closest('[data-course-id]').getAttribute('data-course-id')) || 
                 'default';
  var storageKey = 'module_collapse_state_' + courseId;
  
  // Load saved collapse state
  var savedState = {};
  try {
    var saved = localStorage.getItem(storageKey);
    if (saved) savedState = JSON.parse(saved);
  } catch(e) {}
  
  mount.querySelectorAll('[data-module-id]').forEach(function(mod){
    var moduleId = mod.getAttribute('data-module-id');
    var header = mod.querySelector('.module-header');
    var content = mod.querySelector('.module-content');
    if (!header || !content) return;
    
    // Check saved state for this module
    var moduleKey = 'module_' + moduleId;
    var isCollapsed = savedState[moduleKey] === true;
    
    // Apply saved state on load
    if (isCollapsed) {
      content.style.display = 'none';
    }
    
    if (!header.querySelector('.module-toggle')) {
      var t = document.createElement('button');
      t.type = 'button'; t.className = 'module-toggle';
      t.style.marginRight = '8px'; t.style.background = 'transparent'; t.style.border = '0'; t.style.cursor = 'pointer';
      t.innerHTML = isCollapsed ? '<i class="fas fa-chevron-right"></i>' : '<i class="fas fa-chevron-down"></i>';
      header.insertBefore(t, header.firstChild);
      t.onclick = function(ev){
        ev.preventDefault(); ev.stopPropagation();
        var isOpen = content.style.display !== 'none';
        content.style.display = isOpen ? 'none' : '';
        t.innerHTML = isOpen ? '<i class="fas fa-chevron-right"></i>' : '<i class="fas fa-chevron-down"></i>';
        
        // Save state to localStorage
        try {
          savedState[moduleKey] = isOpen; // true = collapsed, false = expanded
          localStorage.setItem(storageKey, JSON.stringify(savedState));
        } catch(e) {
          console.warn('Failed to save module collapse state:', e);
        }
      };
    }
  });

  // OPTIMIZED: Compute and render total points per activity - DEFERRED to avoid blocking modal display
  // Load points AFTER modal is visible for better perceived performance
  requestAnimationFrame(function(){
    try {
      const pointBadges = Array.from(mount.querySelectorAll('[data-points-for]'));
      if (!pointBadges.length) return;
      
      // OPTIMIZED: Extract all activity IDs and calculate points from already-loaded outline data
      // Instead of making separate fetch requests, use the data we already have!
      const activityDataMap = new Map();
      
      // Find all activities in the outline data and map them by ID
      const findActivities = (outline) => {
        outline.forEach(mod => {
          (mod.lessons || []).forEach(lesson => {
            (lesson.activities || []).forEach(act => {
              if (act && act.id) activityDataMap.set(String(act.id), act);
            });
          });
        });
      };
      
      // Try to get outline data from the closure or window
      let outlineData = null;
      try {
        if (typeof window.__lastOutlineData !== 'undefined') {
          outlineData = window.__lastOutlineData;
        }
      } catch(_){}
      
      // If we have outline data, use it directly - NO FETCH REQUESTS!
      if (outlineData && Array.isArray(outlineData)) {
        findActivities(outlineData);
      pointBadges.forEach(function(badge){
        const actId = badge.getAttribute('data-points-for');
        if (!actId) return;
          const a = activityDataMap.get(actId);
          if (!a) { badge.textContent = '—'; return; }
          
          const t = String(a.type||'').toLowerCase();
          if (t === 'coding') {
            const ms = Number(a.max_score || 0);
            badge.textContent = (isFinite(ms) ? ms : 0) + ' pts';
              return; 
            }
          const questions = Array.isArray(a.questions) ? a.questions : [];
          const total = questions.reduce(function(sum,q){
            const p = Number(q.points||1);
            return sum + (isFinite(p) ? p : 0);
          }, 0);
          if (total > 0) {
            badge.textContent = total + ' pts';
          } else {
            const ms = Number(a.max_score || 0);
            badge.textContent = (isFinite(ms) ? ms : 0) + ' pts';
          }
        });
        return; // Done! No network requests needed
      }
      
      // Fallback: If outline data not available, fetch points (but batch them)
      // Collect all IDs first
      const actIds = pointBadges.map(b => b.getAttribute('data-points-for')).filter(Boolean);
      if (!actIds.length) return;
      
      // OPTIMIZED: Batch fetch all activities at once instead of individual requests
      const fd = new FormData();
      fd.append('action','activities_batch_get');
      fd.append('ids', JSON.stringify(actIds));
      
      fetch('course_outline_manage.php', { method:'POST', credentials:'same-origin', body: fd })
        .then(r=>r.json())
        .then(function(resp){
          if (!resp || !resp.success || !Array.isArray(resp.data)) return;
          
          // Create map from response
          resp.data.forEach(function(a){
            if (a && a.id) activityDataMap.set(String(a.id), a);
          });
          
          // Update badges
          pointBadges.forEach(function(badge){
            const actId = badge.getAttribute('data-points-for');
            if (!actId) return;
            const a = activityDataMap.get(actId);
            if (!a) { badge.textContent = '—'; return; }
            
            const t = String(a.type||'').toLowerCase();
            if (t === 'coding') {
              const ms = Number(a.max_score || 0);
              badge.textContent = (isFinite(ms) ? ms : 0) + ' pts';
              return;
            }
            const questions = Array.isArray(a.questions) ? a.questions : [];
            const total = questions.reduce(function(sum,q){
              const p = Number(q.points||1);
              return sum + (isFinite(p) ? p : 0);
            }, 0);
            if (total > 0) { 
              badge.textContent = total + ' pts';
            } else {
              const ms = Number(a.max_score || 0);
              badge.textContent = (isFinite(ms) ? ms : 0) + ' pts';
            }
          });
          })
          .catch(function(err){ 
          pointBadges.forEach(b => b.textContent = '—');
      });
    } catch(_) {}
  });
}
// Initialize SortableJS on modules, lessons, and materials and persist order
function initOutlineSortables(courseId, mount) {
  if (typeof Sortable === 'undefined') return;
  try {
    // Modules reorder
    const modulesContainer = mount;
    const moduleItems = Array.from(modulesContainer.querySelectorAll('.outline-module'));
    if (moduleItems.length) {
      new Sortable(modulesContainer, {
        animation: 150,
        handle: '.outline-module > div',
        draggable: '.outline-module',
        onEnd: function() {
          const orderedIds = Array.from(mount.querySelectorAll('.outline-module')).map(el => el.getAttribute('data-module-id'));
          const fd = new FormData();
          fd.append('action','module_reorder');
          fd.append('course_id', String(courseId));
          fd.append('ordered_ids', JSON.stringify(orderedIds));
          fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' }).then(()=>{}).catch(()=>{});
        }
      });
    }

    // Lessons reorder per module
    mount.querySelectorAll('.outline-lessons').forEach(list => {
      new Sortable(list, {
        animation: 150,
        handle: '.outline-lesson-item > div',
        draggable: '.outline-lesson-item',
        onEnd: function() {
          const moduleId = list.getAttribute('data-module-id');
          const orderedIds = Array.from(list.querySelectorAll('.outline-lesson-item')).map(li => li.getAttribute('data-lesson-id'));
          const fd = new FormData();
          fd.append('action','lesson_reorder');
          fd.append('module_id', moduleId);
          fd.append('ordered_ids', JSON.stringify(orderedIds));
          fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' }).then(()=>{}).catch(()=>{});
        }
      });
    });

    // Materials reorder per lesson
    mount.querySelectorAll('.outline-materials').forEach(list => {
      new Sortable(list, {
        animation: 150,
        draggable: '.outline-material-item',
        onEnd: function() {
          const lessonId = list.getAttribute('data-lesson-id');
          const orderedIds = Array.from(list.querySelectorAll('.outline-material-item')).map(el => el.getAttribute('data-mat-id'));
          const fd = new FormData();
          fd.append('action','material_reorder');
          fd.append('lesson_id', lessonId);
          fd.append('ordered_ids', JSON.stringify(orderedIds));
          fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' }).then(()=>{}).catch(()=>{});
        }
      });
    });
  } catch (_) {}
}

// Set course status (publish/unpublish)
function publishCourse(courseId, nextStatus, btnEl, ev) {
  if (ev && ev.preventDefault) ev.preventDefault();
  if (ev && ev.stopPropagation) ev.stopPropagation();

  // Normalize the target status
  const targetStatus = normalizeStatus(nextStatus);
  const isPublishing = targetStatus === 'published';

  // Optimistic UI: switch badge and button immediately
  try {
    const row = btnEl ? btnEl.closest('tr') : null;
    const badge = row ? row.querySelector('.course-status') : null;
    
    // Store previous state for revert
    const previousStatus = badge ? normalizeStatus(badge.textContent) : 'draft';
    const previousButtonLabel = btnEl ? btnEl.textContent : '';
    
    if (btnEl) {
      btnEl.__prevStatus = previousStatus;
      btnEl.__prevLabel = previousButtonLabel;
    }
    
    if (badge) {
      // Remove all possible status classes
      badge.classList.remove('draft','published','archived');
      // Add the correct class and label
      badge.classList.add(targetStatus);
      badge.textContent = getStatusLabel(targetStatus);
    }
    
    if (btnEl) {
      btnEl.textContent = isPublishing ? 'Unpublish' : 'Publish';
      const nextToggle = isPublishing ? 'draft' : 'published';
      btnEl.setAttribute('onclick', `publishCourse(${courseId}, '${nextToggle}', this, event); return false;`);
    }
  } catch (e) {
  }

  const fd = new FormData();
  fd.append('action','status');
  fd.append('id', courseId);
  fd.append('status', targetStatus);
  
  fetch('course_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
    .then(r=>r.json())
    .then(data=>{
      if (data.success) {
        if (typeof window.showNotification === 'function') window.showNotification('success','Success','Course status updated');
        // Don't reload the table - keep the optimistic UI since it's already correct
      } else {
        if (typeof window.showNotification === 'function') window.showNotification('error','Error', data.message || 'Failed to update status');
        // Revert UI on failure
        revertStatusChange(btnEl, courseId);
      }
    })
    .catch(()=>{ 
      if (typeof window.showNotification === 'function') window.showNotification('error','Error','Network error');
      // Revert UI on network error
      revertStatusChange(btnEl, courseId);
    });
}

// Helper function to revert status change
function revertStatusChange(btnEl, courseId) {
  try {
    if (!btnEl) return;
    
    const row = btnEl.closest('tr');
    const badge = row ? row.querySelector('.course-status') : null;
    const prevStatus = btnEl.__prevStatus || 'draft';
    const prevLabel = btnEl.__prevLabel || (prevStatus === 'published' ? 'Unpublish' : 'Publish');
    
    if (badge) {
      badge.classList.remove('draft','published','archived');
      badge.classList.add(prevStatus);
      badge.textContent = getStatusLabel(prevStatus);
    }
    
    btnEl.textContent = prevLabel;
    const nextToggle = prevStatus === 'published' ? 'draft' : 'published';
    btnEl.setAttribute('onclick', `publishCourse(${courseId}, '${nextToggle}', this, event); return false;`);
  } catch (e) {
  }
}
// Archive course function
function archiveCourse(courseId, btnEl, ev) {
  if (ev && ev.preventDefault) ev.preventDefault();
  if (ev && ev.stopPropagation) ev.stopPropagation();
  coordinatorConfirm('Archive this course?', function(){
    const fd = new FormData();
    fd.append('action','archive');
    fd.append('id', courseId);
    // Optimistic UI: fade out quickly, then remove on success
    let trRef = btnEl && btnEl.closest ? btnEl.closest('tr') : null;
    if (trRef) {
      trRef.style.transition = 'opacity 150ms ease';
      trRef.style.opacity = '0.4';
    }
    fetch('course_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
      .then(r=>r.json())
      .then(data=>{
        if (data.success) {
          if (typeof window.showNotification === 'function') window.showNotification('success','Archived','Course archived');
          if (trRef && trRef.parentElement) trRef.parentElement.removeChild(trRef);
          // Also reload to keep counts and pagination correct
          loadCoordinatorCourses();
          // Always refresh archive list so it reflects without tab switching
          if (typeof loadArchivedCourses === 'function') loadArchivedCourses();
        } else {
          if (typeof window.showNotification === 'function') window.showNotification('error','Error', data.message || 'Failed to archive');
          // Revert fade if failed
          if (trRef) { trRef.style.opacity = ''; trRef.style.transition = ''; }
        }
      })
      .catch(()=>{ if (typeof window.showNotification === 'function') window.showNotification('error','Error','Network error'); if (trRef) { trRef.style.opacity=''; trRef.style.transition=''; } });
  });
}

// Delete course function
function deleteCourse(courseId) {
  coordinatorConfirm('Delete this course?', function(){
    const fd = new FormData();
    fd.append('action','delete');
    fd.append('id', courseId);
    fetch('course_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
      .then(r=>r.json())
      .then(data=>{
        if (data.success) {
          window.showNotification('success','Deleted','Course deleted');
          loadCoordinatorCourses();
        } else {
          window.showNotification('error','Error', data.message || 'Failed to delete');
        }
      })
      .catch(()=>{ window.showNotification('error','Error','Network error'); });
  });
}
// Get role icon
function getRoleIcon(role) {
  const roleIcons = {
    'admin': 'fas fa-user-shield',
    'coordinator': 'fas fa-user-tie',
    'teacher': 'fas fa-chalkboard-teacher',
    'student': 'fas fa-user-graduate'
  };
  return roleIcons[role.toLowerCase()] || 'fas fa-user';
}

// Get role color class
function getRoleColorClass(role) {
  const roleColors = {
    'admin': 'role-admin',
    'coordinator': 'role-coordinator',
    'teacher': 'role-teacher',
    'student': 'role-student'
  };
  return roleColors[role.toLowerCase()] || 'role-default';
}

// Note: Use global window.showNotification from admin_panel.js directly to avoid overrides

// Initialize coordinator settings
function initCoordinatorSettings() {
  // Settings functionality will be handled by admin panel functions
}
// Helper: confirmation dialog with graceful fallbacks
function coordinatorConfirm(message, onConfirm) {
  // Create custom confirmation modal
  let modal = document.getElementById('coordinatorConfirmModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'coordinatorConfirmModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card" style="max-width: 400px; width: 90%;">
        <div class="confirmation-header" style="padding: 16px 20px 12px; border-bottom: 1px solid #e9ecef; display: flex; align-items: center; gap: 10px;">
          <i class="fas fa-exclamation-triangle" style="color: #f39c12; font-size: 18px;"></i>
          <h3 style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">Confirm Action</h3>
        </div>
        <div class="confirmation-body" style="padding: 16px 20px;">
          <p style="margin: 0; color: #555; line-height: 1.5;" id="confirmMessage"></p>
        </div>
        <div class="confirmation-actions" style="padding: 12px 20px 16px; display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" id="confirmCancel" class="action-btn btn-gray" style="padding: 8px 16px; font-size: 14px;">
            <i class="fas fa-times"></i> Cancel
          </button>
          <button type="button" id="confirmOk" class="action-btn btn-red" style="padding: 8px 16px; font-size: 14px;">
            <i class="fas fa-check"></i> Confirm
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Close on overlay click
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
  
  // Update message and show modal
  const messageEl = modal.querySelector('#confirmMessage');
  const okBtn = modal.querySelector('#confirmOk');
  const cancelBtn = modal.querySelector('#confirmCancel');
  
  messageEl.textContent = message;
  modal.style.display = 'flex';
  
  // Clean up previous handlers
  const newOkBtn = okBtn.cloneNode(true);
  const newCancelBtn = cancelBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newOkBtn, okBtn);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
  
  // Add new handlers
  newOkBtn.onclick = function() {
    modal.style.display = 'none';
    if (onConfirm) onConfirm();
  };
  
  newCancelBtn.onclick = function() {
    modal.style.display = 'none';
  };
}

// Reusable input modal for Outline actions
function outlinePrompt(options, onSubmit) {
  const cfg = Object.assign({ title: 'Input', label: 'Value', placeholder: '', value: '', options: null }, options||{});
  let modal = document.getElementById('outlinePromptModal');
  if (!modal) {
    // OPTIMIZED: Pre-create modal on page load to avoid lag
    modal = document.createElement('div');
    modal.id = 'outlinePromptModal';
    modal.className = 'modal-overlay';
    modal.style.display = 'none'; // Hidden initially
    modal.innerHTML = `
      <div class="modal-card" style="max-width:460px;width:92%;padding:18px 20px;border-radius:10px;box-shadow:0 10px 24px rgba(0,0,0,0.18);background:#fff;">
        <h3 class="modal-title" id="opTitle" style="margin:0 0 10px 0;font-size:16px;font-weight:700;color:#333;">Title</h3>
        <label class="modal-label" id="opLabel" style="display:block;font-weight:500;color:#444;margin-bottom:6px;font-size:13px;">Label</label>
        <input type="text" id="opInput" class="modal-input" style="width:100%;padding:10px 12px;border:1px solid #d7dce1;border-radius:8px;font-size:14px;background:#fff;outline:none;margin-bottom:14px;" />
        <select id="opSelect" class="modal-input" style="display:none;width:100%;padding:10px 12px;border:1px solid #d7dce1;border-radius:8px;font-size:14px;background:#fff;outline:none;margin-bottom:14px;"></select>
        <div class="modal-actions" style="display:flex;gap:8px;justify-content:flex-end;">
          <button type="button" id="opCancel" class="action-btn btn-gray" style="padding:8px 14px;border-radius:8px;">Cancel</button>
          <button type="button" id="opOk" class="action-btn btn-green" style="padding:8px 14px;border-radius:8px;">OK</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e){ if (e.target === modal) modal.style.display = 'none'; });
    // OPTIMIZED: Attach focus/blur styles once, not every call
    const inputEl = modal.querySelector('#opInput');
    const selectEl = modal.querySelector('#opSelect');
    const focusHandler = function() { this.style.borderColor = '#28a745'; this.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)'; };
    const blurHandler = function() { this.style.borderColor = '#e1e5e9'; this.style.boxShadow = 'none'; };
    inputEl.addEventListener('focus', focusHandler);
    inputEl.addEventListener('blur', blurHandler);
    selectEl.addEventListener('focus', focusHandler);
    selectEl.addEventListener('blur', blurHandler);
  }
  const titleEl = modal.querySelector('#opTitle');
  const labelEl = modal.querySelector('#opLabel');
  const inputEl = modal.querySelector('#opInput');
  const selectEl = modal.querySelector('#opSelect');
  const okBtn = modal.querySelector('#opOk');
  const cancelBtn = modal.querySelector('#opCancel');
  
  titleEl.textContent = cfg.title;
  labelEl.textContent = cfg.label;
  inputEl.placeholder = cfg.placeholder || '';
  inputEl.value = cfg.value || '';
  
  if (Array.isArray(cfg.options) && cfg.options.length) {
    selectEl.innerHTML = cfg.options.map(function(opt){
      var val = typeof opt === 'string' ? opt : (opt.value || '');
      var label = typeof opt === 'string' ? opt : (opt.label || opt.value || '');
      var sel = (cfg.value && (String(cfg.value).toLowerCase() === String(val).toLowerCase())) ? 'selected' : '';
      return '<option value="' + val + '" ' + sel + '>' + label + '</option>';
    }).join('');
    inputEl.style.display = 'none';
    selectEl.style.display = '';
  } else {
    inputEl.style.display = '';
    selectEl.style.display = 'none';
  }
  
  // OPTIMIZED: Clean up old handlers before adding new ones
  const oldOkHandler = okBtn.onclick;
  const oldCancelHandler = cancelBtn.onclick;
  const oldKeyHandler = inputEl.onkeydown;
  
  function cleanup(){
    if (oldOkHandler) okBtn.onclick = null;
    if (oldCancelHandler) cancelBtn.onclick = null;
    if (oldKeyHandler) inputEl.onkeydown = null;
  }
  
  okBtn.onclick = function(){ 
    const v = (selectEl.style.display !== 'none') ? selectEl.value : inputEl.value.trim(); 
    cleanup(); 
    modal.style.display='none'; 
    if (onSubmit) onSubmit(v); 
  };
  cancelBtn.onclick = function(){ 
    cleanup(); 
    modal.style.display='none'; 
  };
  inputEl.onkeydown = function(e){ 
    if (e.key === 'Enter') { 
      e.preventDefault();
      okBtn.click(); 
    } 
  };
  
  modal.style.display = 'flex';
  // OPTIMIZED: Use requestAnimationFrame for smoother focus
  requestAnimationFrame(function(){ 
    (selectEl.style.display !== 'none' ? selectEl : inputEl).focus(); 
  });
}

// ===== Auto-bootstrap (defensive) =====
(function bootstrapCoordinator(){
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){
      try { if (typeof initCoordinatorTabs === 'function') initCoordinatorTabs(); } catch(e) { }
      // Ensure dashboard widgets load once on initial view
      try { if (typeof loadCoordinatorDashboardStats === 'function') loadCoordinatorDashboardStats(); } catch(e) { }
    });
  } else {
    try { if (typeof initCoordinatorTabs === 'function') initCoordinatorTabs(); } catch(e) { }
    try { if (typeof loadCoordinatorDashboardStats === 'function') loadCoordinatorDashboardStats(); } catch(e) { }
  }
})();

// ===== Archive (Coordinator) =====
function initCoordinatorArchive() {
  // Tabs behavior
  const tabMat = document.getElementById('tabArchiveMaterials');
  const tabCrs = document.getElementById('tabArchiveCourses');
  const paneMat = document.getElementById('archiveMaterials');
  const paneCrs = document.getElementById('archiveCourses');
  if (tabMat && tabCrs && paneMat && paneCrs) {
    tabMat.onclick = function(){
      tabMat.style.background = '#1d9b3e'; tabMat.style.color = '#fff';
      tabCrs.style.background = '#6c757d'; tabCrs.style.color = '#fff';
      paneMat.style.display = 'block'; paneCrs.style.display = 'none';
      loadArchivedMaterials();
    };
    tabCrs.onclick = function(){
      tabCrs.style.background = '#1d9b3e'; tabCrs.style.color = '#fff';
      tabMat.style.background = '#6c757d'; tabMat.style.color = '#fff';
      paneCrs.style.display = 'block'; paneMat.style.display = 'none';
      loadArchivedCourses();
    };
  }
  // Load both lazily; start with materials by default
  loadArchivedMaterials();
}

// ===== Uploads (Coordinator) =====
function initCoordinatorUploads() {
  loadCoordinatorUploads();
  
  // Wire search and filter
  const searchInput = document.getElementById('uploadsSearch');
  const filterSelect = document.getElementById('uploadsFilter');
  
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      loadCoordinatorUploads();
    });
  }
  
  if (filterSelect) {
    filterSelect.addEventListener('change', function() {
      loadCoordinatorUploads();
    });
  }
}
function loadCoordinatorUploads() {
  const list = document.getElementById('uploadsList');
  if (!list) return;
  list.innerHTML = '<div class="loading-spinner">Loading...</div>';
  
  // Get search and filter values
  const searchInput = document.getElementById('uploadsSearch');
  const filterSelect = document.getElementById('uploadsFilter');
  const search = searchInput ? searchInput.value : '';
  const type = filterSelect ? filterSelect.value : '';
  
  // Build URL with parameters
  let url = 'materials_list_ajax.php?archived=0';
  if (search) url += '&search=' + encodeURIComponent(search);
  if (type) url += '&type=' + encodeURIComponent(type);
  
  // Reuse materials listing for active (archived=0)
  console.log('🔍 [Uploads] Fetching from:', url);
  fetch(url, { credentials:'same-origin' })
    .then(r => {
      console.log('🔍 [Uploads] Response status:', r.status, r.statusText);
      console.log('🔍 [Uploads] Response headers:', r.headers.get('content-type'));
      if (!r.ok) {
        return r.text().then(text => {
          console.error('❌ [Uploads] HTTP Error:', r.status, text.substring(0, 500));
          throw new Error(`HTTP ${r.status}: ${r.statusText} - ${text.substring(0, 200)}`);
        });
      }
      const contentType = r.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return r.json();
      } else {
        return r.text().then(text => {
          console.error('❌ [Uploads] Non-JSON response:', text.substring(0, 500));
          throw new Error('Server returned non-JSON response: ' + text.substring(0, 200));
        });
      }
    })
    .then(data=>{
      console.log('🔍 [Uploads] Response data:', data);
      if (data && data.success && Array.isArray(data.data)) {
        if (data.data.length > 0) {
        list.innerHTML = `
          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>Type</th>
                <th>Topic</th>
                <th>Module</th>
                <th>Course</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${data.data.map(m => {
                const filename = m.filename || m.url || 'Material';
                const type = (m.type || 'file').toLowerCase();
                const courseTitle = m.course_title || '';
                const moduleTitle = m.module_title || '';
                const lessonTitle = m.lesson_title || '';
                const size = m.size_bytes ? (Math.round(m.size_bytes/1024) + ' KB') : '';
                const uploaded = m.created_at ? new Date(m.created_at).toLocaleString() : '';
                return `
                <tr>
                  <td class="material-filename">${filename}</td>
                  <td><span class="material-type ${type}">${type.toUpperCase()}</span></td>
                  <td class="material-lesson">${lessonTitle}</td>
                  <td class="material-module">${moduleTitle}</td>
                  <td class="material-course">${courseTitle}</td>
                  <td class="material-size">${size}</td>
                  <td class="material-uploaded">${uploaded}</td>
                  <td class="material-actions">
                    <button class="action-btn archive" onclick="archiveMaterial(${m.id}, this, event); return false;">Archive</button>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>`;
        } else {
          console.log('ℹ️ [Uploads] No materials found (empty array)');
          list.innerHTML = '<div class="empty-state"><i class="fas fa-upload"></i>No materials found</div>';
        }
      } else {
        console.warn('⚠️ [Uploads] Invalid response format:', data);
        list.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i>Invalid response format</div>';
      }
    })
    .catch(err => {
      console.error('❌ [Uploads] Error loading uploads:', err);
      list.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i>Failed to load: ' + (err.message || 'Unknown error') + '</div>';
    });
}
function archiveMaterial(id, btnEl, ev) {
  if (ev && ev.preventDefault) ev.preventDefault();
  if (ev && ev.stopPropagation) ev.stopPropagation();
  coordinatorConfirm('Archive this material?', function(){
    const itemRef = btnEl && btnEl.closest ? btnEl.closest('tr') : null;
    if (itemRef) { itemRef.style.transition = 'opacity 150ms ease'; itemRef.style.opacity = '0.4'; }
    const fd = new FormData();
    fd.append('id', id);
    fd.append('archived', '1');
    fetch('material_archive_toggle.php', { method:'POST', body: fd, credentials:'same-origin' })
      .then(r=>r.json())
      .then(data=>{
        if (data.success) {
          if (typeof window.showNotification === 'function') window.showNotification('success','Archived','Material archived');
          if (itemRef && itemRef.parentElement) itemRef.parentElement.removeChild(itemRef);
          loadCoordinatorUploads();
          if (typeof loadArchivedMaterials === 'function') loadArchivedMaterials();
        } else {
          if (typeof window.showNotification === 'function') window.showNotification('error','Error', data.message || 'Failed to archive material');
          if (itemRef) { itemRef.style.opacity=''; itemRef.style.transition=''; }
        }
      })
      .catch(()=>{ if (typeof window.showNotification === 'function') window.showNotification('error','Error','Network error'); if (itemRef) { itemRef.style.opacity=''; itemRef.style.transition=''; } });
  });
}
function loadArchivedCourses() {
  const list = document.getElementById('archiveCoursesList');
  if (list) list.innerHTML = '<div class="loading-spinner">Loading...</div>';
  fetch('courses_list_ajax.php?status=&search=&owner=&archived=1', { credentials: 'same-origin' })
    .then(r=>r.json())
    .then(data=>{
      if (!list) return;
      if (data.success && Array.isArray(data.data) && data.data.length) {
        list.innerHTML = `
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Status</th>
                <th>Modules</th>
                <th>Topics</th>
                <th>Archived</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${data.data.map(c => {
                const id = c.id || c.course_id || c.Id;
                const title = c.title || c.course_title || '';
                const code = c.code || c.course_code || '';
                const status = c.status || 'archived';
                const modulesCount = c.modules_count != null ? c.modules_count : (c.modulesCount || c.modules || 0);
                const lessonsCount = c.lessons_count != null ? c.lessons_count : (c.lessonsCount || c.lessons || 0);
                const updated = (c.updated_at || c.updated || '') ? new Date(c.updated_at || c.updated).toLocaleString() : '';
                return `
                <tr>
                  <td class="course-code">${code}</td>
                  <td class="course-title">${title}</td>
                  <td><span class="course-status ${status}">${status}</span></td>
                  <td class="course-stats">${modulesCount}</td>
                  <td class="course-stats">${lessonsCount}</td>
                  <td class="course-updated">${updated}</td>
                  <td class="course-actions">
                    <button class="action-btn outline" onclick="viewOutline(${id})">Outline</button>
                    <button class="action-btn unarchive" onclick="unarchiveCourse(${id}, this, event); return false;">Unarchive</button>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>`;
      } else {
        list.innerHTML = '<div class="empty-state"><i class="fas fa-archive"></i>No archived courses</div>';
      }
    })
    .catch(()=>{ if (list) list.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i>Failed to load</div>'; });
}
function unarchiveCourse(courseId, btnEl, ev) {
  if (ev && ev.preventDefault) ev.preventDefault();
  if (ev && ev.stopPropagation) ev.stopPropagation();
  coordinatorConfirm('Unarchive this course?', function(){
    const itemRef = btnEl && btnEl.closest ? btnEl.closest('tr') : null;
    if (itemRef) { itemRef.style.transition = 'opacity 150ms ease'; itemRef.style.opacity = '0.4'; }
    const fd = new FormData();
    fd.append('action','unarchive');
    fd.append('id', courseId);
    fetch('course_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
      .then(r=>r.json())
      .then(data=>{
        if (data.success) {
          window.showNotification('success','Restored','Course unarchived');
          if (itemRef && itemRef.parentElement) itemRef.parentElement.removeChild(itemRef);
          loadArchivedCourses();
          loadCoordinatorCourses();
          // Navigate to Courses to reflect change in real time
          if (typeof showSection === 'function') { showSection('courses'); }
          // Also mark sidebar active if present
          const nav = document.getElementById('coordinatorSidebarNav');
          if (nav) {
            nav.querySelectorAll('li').forEach(li => li.classList.remove('active'));
            const coursesLi = Array.from(nav.querySelectorAll('li')).find(li => li.getAttribute('data-section') === 'courses');
            if (coursesLi) coursesLi.classList.add('active');
          }
        } else { window.showNotification('error','Error', data.message || 'Failed to unarchive'); if (itemRef) { itemRef.style.opacity=''; itemRef.style.transition=''; } }
      })
      .catch(()=>{ window.showNotification('error','Error','Network error'); if (itemRef) { itemRef.style.opacity=''; itemRef.style.transition=''; } });
  });
}

function loadArchivedMaterials() {
  const list = document.getElementById('archiveMaterialsList');
  if (list) list.innerHTML = '<div class="loading-spinner">Loading...</div>';
  // Endpoint: reuse listAllMaterials with archived=1 via new ajax endpoint
  fetch('materials_list_ajax.php?archived=1', { credentials:'same-origin' })
    .then(r=>r.json())
    .then(data=>{
      if (!list) return;
      if (data.success && Array.isArray(data.data) && data.data.length) {
        list.innerHTML = `
          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>Type</th>
                <th>Topic</th>
                <th>Module</th>
                <th>Course</th>
                <th>Size</th>
                <th>Archived</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${data.data.map(m => {
                const filename = m.filename || m.url || 'Material';
                const type = m.type || 'file';
                const courseTitle = m.course_title || '';
                const moduleTitle = m.module_title || '';
                const lessonTitle = m.lesson_title || '';
                const size = m.size_bytes ? (Math.round(m.size_bytes/1024) + ' KB') : '';
                const archived = m.updated_at ? new Date(m.updated_at).toLocaleString() : '';
                return `
                <tr>
                  <td class="material-filename">${filename}</td>
                  <td><span class="material-type ${type}">${type}</span></td>
                  <td class="material-lesson">${lessonTitle}</td>
                  <td class="material-module">${moduleTitle}</td>
                  <td class="material-course">${courseTitle}</td>
                  <td class="material-size">${size}</td>
                  <td class="material-uploaded">${archived}</td>
                  <td class="material-actions">
                    <button class="action-btn unarchive" onclick="unarchiveMaterial(${m.id}, this, event); return false;">Unarchive</button>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>`;
      } else {
        list.innerHTML = '<div class="empty-state"><i class="fas fa-archive"></i>No archived materials</div>';
      }
    })
    .catch(()=>{ if (list) list.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i>Failed to load</div>'; });
}

function unarchiveMaterial(id, btnEl, ev) {
  if (ev && ev.preventDefault) ev.preventDefault();
  if (ev && ev.stopPropagation) ev.stopPropagation();
  coordinatorConfirm('Unarchive this material?', function(){
    const itemRef = btnEl && btnEl.closest ? btnEl.closest('tr') : null;
    if (itemRef) { itemRef.style.transition = 'opacity 150ms ease'; itemRef.style.opacity = '0.4'; }
    const fd = new FormData();
    fd.append('id', id);
    fd.append('archived', '0');
    fetch('material_archive_toggle.php', { method:'POST', body: fd, credentials:'same-origin' })
      .then(r=>r.json())
      .then(data=>{
        if (data.success) {
          if (typeof window.showNotification === 'function') window.showNotification('success','Restored','Material unarchived');
          if (itemRef && itemRef.parentElement) itemRef.parentElement.removeChild(itemRef);
          // Refresh both Archive (materials) and Uploads for real-time reflect
          if (typeof loadArchivedMaterials === 'function') loadArchivedMaterials();
          if (typeof loadCoordinatorUploads === 'function') loadCoordinatorUploads();
        } else {
          if (typeof window.showNotification === 'function') window.showNotification('error','Error', data.message || 'Failed to unarchive material'); if (itemRef) { itemRef.style.opacity=''; itemRef.style.transition=''; }
        }
      })
      .catch(()=>{ if (typeof window.showNotification === 'function') window.showNotification('error','Error','Network error'); if (itemRef) { itemRef.style.opacity=''; itemRef.style.transition=''; } });
  });
}

// Content Separation Functions
function showContentSeparationModal() {
  let modal = document.getElementById('contentSeparationModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'contentSeparationModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <h3 class="modal-title">Separate Module Content</h3>
          <button type="button" class="modal-close" onclick="closeContentSeparationModal()">&times;</button>
        </div>
        <form id="contentSeparationForm">
          <div class="form-section">
            <h4 class="section-title">Module Information</h4>
            
            <div class="form-row">
              <div class="form-group">
                <label class="modal-label">Base Course Code *</label>
                <input type="text" id="baseCode" name="base_code" class="modal-input" 
                       placeholder="e.g., COMP102" required 
                       pattern="[A-Z0-9]{3,10}" 
                       title="3-10 characters, letters and numbers only" />
                <small class="form-hint">Base code for both courses (Lecture: COMP102, Lab: COMP102L)</small>
              </div>
              
              <div class="form-group">
                <label class="modal-label">Programming Language *</label>
                <select id="separationLanguage" name="language" class="modal-input" required>
                  <option value="C++">C++</option>
                  <option value="Java">Java</option>
                  <option value="Python">Python</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label class="modal-label">Module Title *</label>
              <input type="text" id="separationTitle" name="title" class="modal-input" 
                     placeholder="e.g., Introduction to Computer Programming" required 
                     maxlength="255" />
            </div>
            
            <div class="form-group">
              <label class="modal-label">Module Description</label>
              <textarea id="separationDescription" name="description" class="modal-input" 
                        placeholder="Brief description of the module content..." 
                        rows="3" style="resize: vertical; min-height: 60px;" maxlength="500"></textarea>
            </div>
          </div>
          
          <div class="form-section">
            <h4 class="section-title">Content Separation</h4>
            <div class="separation-info">
              <div class="info-card lecture-card">
                <div class="info-header">
                  <i class="fas fa-chalkboard-teacher"></i>
                  <h5>Lecture Course</h5>
                </div>
                <div class="info-content">
                  <p>• Theoretical concepts and principles</p>
                  <p>• Knowledge-based learning</p>
                  <p>• Quizzes and assessments</p>
                  <p>• Reading materials and presentations</p>
                </div>
              </div>
              
              <div class="info-card laboratory-card">
                <div class="info-header">
                  <i class="fas fa-flask"></i>
                  <h5>Laboratory Course</h5>
                </div>
                <div class="info-content">
                  <p>• Hands-on exercises and practice</p>
                  <p>• Coding activities and projects</p>
                  <p>• Interactive tools and simulations</p>
                  <p>• Practical applications</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h4 class="section-title">Module 1 Topics</h4>
            <div class="topics-preview">
              <p>This will create courses with the following Module 1 topics:</p>
              <div class="topics-list">
                <div class="topic-item">
                  <span class="topic-number">1</span>
                  <span class="topic-title">The Computer Systems</span>
                  <div class="topic-types">
                    <span class="type-badge lecture">Lecture</span>
                    <span class="type-badge laboratory">Laboratory</span>
                  </div>
                </div>
                <div class="topic-item">
                  <span class="topic-number">2</span>
                  <span class="topic-title">Analog vs. Digital Computers</span>
                  <div class="topic-types">
                    <span class="type-badge lecture">Lecture</span>
                  </div>
                </div>
                <div class="topic-item">
                  <span class="topic-number">3</span>
                  <span class="topic-title">Programming Languages</span>
                  <div class="topic-types">
                    <span class="type-badge lecture">Lecture</span>
                  </div>
                </div>
                <div class="topic-item">
                  <span class="topic-number">4</span>
                  <span class="topic-title">Scripting Languages</span>
                  <div class="topic-types">
                    <span class="type-badge lecture">Lecture</span>
                  </div>
                </div>
                <div class="topic-item">
                  <span class="topic-number">5</span>
                  <span class="topic-title">Programming Paradigm</span>
                  <div class="topic-types">
                    <span class="type-badge lecture">Lecture</span>
                  </div>
                </div>
                <div class="topic-item">
                  <span class="topic-number">6</span>
                  <span class="topic-title">Number Systems</span>
                  <div class="topic-types">
                    <span class="type-badge lecture">Lecture</span>
                    <span class="type-badge laboratory">Laboratory</span>
                  </div>
                </div>
                <div class="topic-item">
                  <span class="topic-number">7</span>
                  <span class="topic-title">Number System Conversion</span>
                  <div class="topic-types">
                    <span class="type-badge lecture">Lecture</span>
                    <span class="type-badge laboratory">Laboratory</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div id="separationError" class="error-message" style="margin-top:16px;"></div>
          <div class="modal-actions">
            <button type="button" id="separationCancel" class="action-btn secondary">Cancel</button>
            <button type="submit" id="separationSubmit" class="action-btn primary">
              <i class="fas fa-code-branch"></i> Create Separated Courses
            </button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);
    // Set up form submission
    const form = document.getElementById('contentSeparationForm');
    if (form) {
      form.onsubmit = function(e) {
        e.preventDefault();
        const errorDiv = document.getElementById('separationError');
        const submitBtn = document.getElementById('separationSubmit');
        
        // Get form data
        const baseCode = document.getElementById('baseCode').value.trim().toUpperCase();
        const title = document.getElementById('separationTitle').value.trim();
        const description = document.getElementById('separationDescription').value.trim();
        const language = document.getElementById('separationLanguage').value;
        
        // Validation
        if (!baseCode || !title) {
          if (errorDiv) errorDiv.textContent = 'Base code and title are required.';
          return;
        }
        
        if (!/^[A-Z0-9]{3,10}$/.test(baseCode)) {
          if (errorDiv) errorDiv.textContent = 'Base code must be 3-10 characters, letters and numbers only.';
          return;
        }
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        
        // Submit content separation
        const formData = new FormData();
        formData.append('action', 'separate_module');
        formData.append('base_code', baseCode);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('language', language);
        formData.append('topics', JSON.stringify(getModule1Topics()));
        formData.append('exercises', JSON.stringify(getModule1Exercises()));
        
        fetch('content_separation_api.php', {
          method: 'POST',
          body: formData,
          credentials: 'same-origin'
        })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            showNotification('success', 'Success', `Created Lecture and Laboratory courses for ${title}!`);
            modal.style.display = 'none';
            loadCoordinatorCourses();
          } else {
            if (errorDiv) errorDiv.textContent = data.message || 'Failed to create separated courses.';
          }
        })
        .catch(err => {
          if (errorDiv) errorDiv.textContent = 'Network error. Please try again.';
        })
        .finally(() => {
          // Re-enable submit button
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-code-branch"></i> Create Separated Courses';
        });
      };
    }
    
    // Set up cancel button
    const cancelBtn = document.getElementById('separationCancel');
    if (cancelBtn) {
      cancelBtn.onclick = function() {
        closeContentSeparationModal();
      };
    }
    // Set up close button
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.onclick = function() {
        closeContentSeparationModal();
      };
    }
    
    // Close modal when clicking outside
    modal.onclick = function(e) {
      if (e.target === modal) {
        closeContentSeparationModal();
      }
    };
  }
  modal.style.display = 'flex';
  setTimeout(() => {
    const baseCodeInput = document.getElementById('baseCode');
    if (baseCodeInput) baseCodeInput.focus();
  }, 50);
}

function closeContentSeparationModal() {
  const modal = document.getElementById('contentSeparationModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function getModule1Topics() {
  return [
    {id: 1, title: 'The Computer Systems'},
    {id: 2, title: 'Analog vs. Digital Computers'},
    {id: 3, title: 'Programming Languages'},
    {id: 4, title: 'Scripting Languages'},
    {id: 5, title: 'Programming Paradigm'},
    {id: 6, title: 'Number Systems'},
    {id: 7, title: 'Number System Conversion'}
  ];
}

function getModule1Exercises() {
  return {
    1: {title: 'Hardware Identification', instructions: 'Identify and match computer hardware components'},
    6: {title: 'Number System Converter', instructions: 'Create a program to convert between number systems'},
    7: {title: 'Number System Practice', instructions: 'Practice converting between binary, octal, decimal, and hexadecimal'}
  };
}

// Expose new course creation functions globally
window.closeCreateCourseModal = closeCreateCourseModal;
window.resetCreateCourseForm = resetCreateCourseForm;window.addModule = addModule;
window.removeModule = removeModule;
window.showContentSeparationModal = showContentSeparationModal;
window.closeContentSeparationModal = closeContentSeparationModal;

// ==== MCQ Editor Modal (re-added) ====
function openMcqEditor(activityId) {
  let modal = document.getElementById('mcqEditorModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'mcqEditorModal';
    modal.className = 'modal-overlay';
    modal.style.zIndex = '10000';
    modal.innerHTML = `
      <div class="modal-card" style="max-width:900px;width:95%;max-height:90vh;display:flex;flex-direction:column;">
        <div style="padding:12px 14px;border-bottom:1px solid #e9ecef;display:flex;align-items:center;gap:8px;">
          <strong style="flex:1">Multiple Choice Editor</strong>
          <button id="mcqCloseBtn" class="action-btn btn-gray">Close</button>
        </div>
        <div id="mcqBody" style="padding:12px 14px;overflow:auto;flex:1"></div>
        <div style="padding:10px 14px;border-top:1px solid #e9ecef;display:flex;gap:8px;justify-content:space-between;align-items:center;">
          <button id="mcqValidate" class="action-btn btn-gray">Validate</button>
          <div><button id="mcqAddQuestion" class="action-btn btn-green">Add Question</button></div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e){ if (e.target === modal) modal.style.display='none'; });
    modal.querySelector('#mcqCloseBtn').onclick = function(){ modal.style.display='none'; };
  }
  modal.style.display = 'flex';
  modal.setAttribute('data-activity-id', String(activityId));
  const body = modal.querySelector('#mcqBody');
  body.innerHTML = '<div class="loading-spinner">Loading...</div>';

  const fd = new FormData(); fd.append('action','activity_get'); fd.append('id', activityId);
  fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
    .then(r=>r.json())
    .then(data=>{
      if (!data || !data.success) { body.innerHTML = '<div class="empty-state">Failed to load</div>'; return; }
      renderMcqEditor(activityId, data.data, body);
    })
    .catch(()=>{ body.innerHTML = '<div class="empty-state">Failed to load</div>'; });
}

function renderMcqEditor(activityId, activity, mount) {
  const questions = Array.isArray(activity.questions) ? activity.questions : [];
  const html = questions.map(q => renderQuestion(q)).join('') || '<div style="color:#999;">No questions yet</div>';
  mount.innerHTML = `<div id="mcqQuestions">${html}</div>`;
  const addBtn = document.getElementById('mcqAddQuestion');
  if (addBtn) addBtn.onclick = function(){ createQuestion(activityId, mount); };
  const valBtn = document.getElementById('mcqValidate');
  if (valBtn) valBtn.onclick = function(){ validateMcq(activityId, mount); };
}

function renderQuestion(q) {
  const choices = (q.choices||[]).map(c => `
    <div data-choice-id="${c.id}" style="display:flex;align-items:center;gap:8px;margin:4px 0;">
      <input type="checkbox" ${c.is_correct? 'checked':''} data-role="choice-correct" />
      <input type="text" value="${(c.choice_text||'').replace(/\"/g,'&quot;')}" data-role="choice-text" style="flex:1;padding:6px 8px;border:1px solid #dde2e6;border-radius:6px;" />
      <button class="action-btn btn-gray" data-role="choice-save">Save</button>
      <button class="action-btn" data-role="choice-up" style="background:#e9ecef;color:#333;">▲</button>
      <button class="action-btn" data-role="choice-down" style="background:#e9ecef;color:#333;">▼</button>
      <button class="action-btn btn-red" data-role="choice-delete">Delete</button>
    </div>`).join('');
  return `
    <div data-question-id="${q.id}" style="border:1px solid #e9ecef;border-radius:8px;padding:10px 12px;margin-bottom:10px;">
      <div style="display:flex;gap:8px;align-items:center;">
        <input type="text" value="${(q.question_text||'').replace(/\"/g,'&quot;')}" data-role="question-text" style="flex:1;padding:8px 10px;border:1px solid #dde2e6;border-radius:8px;" />
        <input type="number" value="${q.points||1}" min="1" data-role="question-points" style="width:80px;padding:8px 10px;border:1px solid #dde2e6;border-radius:8px;" />
        <button class="action-btn btn-gray" data-role="question-save">Save</button>
        <button class="action-btn" data-role="question-up" style="background:#e9ecef;color:#333;">▲</button>
        <button class="action-btn" data-role="question-down" style="background:#e9ecef;color:#333;">▼</button>
        <button class="action-btn btn-red" data-role="question-delete">Delete</button>
      </div>
      <div style="margin-top:8px;">
        ${choices || '<div style="color:#999;">No choices</div>'}
        <div style="margin-top:6px;"><button class="action-btn btn-green" data-role="choice-add">Add Choice</button></div>
      </div>
    </div>`;
}

function createQuestion(activityId, mount){
  const fd = new FormData(); fd.append('action','question_create'); fd.append('activity_id', activityId); fd.append('question_text','New question'); fd.append('points','1');
  fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
    .then(r=>r.json()).then(()=>{ openMcqEditor(activityId); });
}

// Delegate editor actions
document.addEventListener('click', function(e){
  const btn = e.target.closest('button'); if (!btn) return;
  const modal = btn.closest('#mcqEditorModal'); if (!modal) return;
  const activityId = parseInt(modal.getAttribute('data-activity-id') || '0', 10);
  if (!activityId) return;

  if (btn.getAttribute('data-role') === 'choice-add') {
    const qEl = btn.closest('[data-question-id]'); if (!qEl) return;
    const qid = qEl.getAttribute('data-question-id');
    const fd = new FormData(); fd.append('action','choice_create'); fd.append('question_id', qid); fd.append('choice_text','New choice');
    fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
      .then(r=>r.json()).then(()=>{ openMcqEditor(activityId); });
    return;
  }

  if (btn.getAttribute('data-role') === 'question-save' || btn.getAttribute('data-role') === 'question-delete' || btn.getAttribute('data-role') === 'question-up' || btn.getAttribute('data-role') === 'question-down') {
    const qEl = btn.closest('[data-question-id]'); if (!qEl) return;
    const qid = qEl.getAttribute('data-question-id');
    if (btn.getAttribute('data-role') === 'question-up' || btn.getAttribute('data-role') === 'question-down') {
      const list = document.getElementById('mcqQuestions'); if (!list) return;
      if (btn.getAttribute('data-role') === 'question-up' && qEl.previousElementSibling) list.insertBefore(qEl, qEl.previousElementSibling);
      if (btn.getAttribute('data-role') === 'question-down' && qEl.nextElementSibling) list.insertBefore(qEl.nextElementSibling, qEl);
      const ordered = Array.from(list.querySelectorAll('[data-question-id]')).map(el => el.getAttribute('data-question-id'));
      const fdOrder = new FormData(); fdOrder.append('action','question_reorder'); fdOrder.append('activity_id', String(activityId)); fdOrder.append('ordered_ids', JSON.stringify(ordered));
      fetch('course_outline_manage.php', { method:'POST', body: fdOrder, credentials:'same-origin' }).then(()=>{}).catch(()=>{});
      return;
    }
    if (btn.getAttribute('data-role') === 'question-delete') {
      const fd = new FormData(); fd.append('action','question_delete'); fd.append('id', qid);
      fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
        .then(r=>r.json()).then(()=>{ openMcqEditor(activityId); });
      return;
    }
    const text = qEl.querySelector('[data-role="question-text"]').value;
    const points = qEl.querySelector('[data-role="question-points"]').value || '1';
    const fd = new FormData(); fd.append('action','question_update'); fd.append('id', qid); fd.append('question_text', text); fd.append('points', points);
    fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
      .then(r=>r.json()).then(()=>{ openMcqEditor(activityId); });
    return;
  }

  if (btn.getAttribute('data-role') === 'choice-save' || btn.getAttribute('data-role') === 'choice-delete' || btn.getAttribute('data-role') === 'choice-up' || btn.getAttribute('data-role') === 'choice-down') {
    const cEl = btn.closest('[data-choice-id]'); if (!cEl) return;
    const cid = cEl.getAttribute('data-choice-id');
    if (btn.getAttribute('data-role') === 'choice-up' || btn.getAttribute('data-role') === 'choice-down') {
      const qEl = btn.closest('[data-question-id]'); if (!qEl) return;
      const parent = cEl.parentElement; if (!parent) return;
      if (btn.getAttribute('data-role') === 'choice-up' && cEl.previousElementSibling) parent.insertBefore(cEl, cEl.previousElementSibling);
      if (btn.getAttribute('data-role') === 'choice-down' && cEl.nextElementSibling) parent.insertBefore(cEl.nextElementSibling, cEl);
      const ordered = Array.from(qEl.querySelectorAll('[data-choice-id]')).map(el => el.getAttribute('data-choice-id'));
      const fdOrder = new FormData(); fdOrder.append('action','choice_reorder'); fdOrder.append('question_id', qEl.getAttribute('data-question-id')); fdOrder.append('ordered_ids', JSON.stringify(ordered));
      fetch('course_outline_manage.php', { method:'POST', body: fdOrder, credentials:'same-origin' }).then(()=>{}).catch(()=>{});
      return;
    }
    if (btn.getAttribute('data-role') === 'choice-delete') {
      const fd = new FormData(); fd.append('action','choice_delete'); fd.append('id', cid);
      fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
        .then(r=>r.json()).then(()=>{ openMcqEditor(activityId); });
      return;
    }
    const text = cEl.querySelector('[data-role="choice-text"]').value;
    const correct = cEl.querySelector('[data-role="choice-correct"]').checked ? '1' : '0';
    const fd = new FormData(); fd.append('action','choice_update'); fd.append('id', cid); fd.append('choice_text', text); fd.append('is_correct', correct);
    fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
      .then(r=>r.json()).then(()=>{ openMcqEditor(activityId); });
    return;
  }
});

function validateMcq(activityId, mount) {
  const container = mount.querySelector('#mcqQuestions'); if (!container) { alert('No questions'); return; }
  const questions = Array.from(container.querySelectorAll('[data-question-id]'));
  let errors = [];
  questions.forEach(function(qEl, idx){
    const qText = (qEl.querySelector('[data-role="question-text"]').value || '').trim();
    const choices = Array.from(qEl.querySelectorAll('[data-choice-id]'));
    const correct = choices.filter(function(cEl){ return cEl.querySelector('[data-role="choice-correct"]').checked; }).length;
    if (!qText) errors.push('Question ' + (idx+1) + ' text is empty');
    if (choices.length < 2) errors.push('Question ' + (idx+1) + ' must have at least 2 choices');
    if (correct < 1) errors.push('Question ' + (idx+1) + ' must have at least 1 correct choice');
    choices.forEach(function(cEl, cIdx){
      const t = (cEl.querySelector('[data-role="choice-text"]').value || '').trim();
      if (!t) errors.push('Question ' + (idx+1) + ' choice ' + (cIdx+1) + ' is empty');
    });
  });
  alert(errors.length ? errors.join('\n') : 'Looks good!');
}
// ===== Bulk Create Topics Modal (restored) =====
function showBulkLessonModal(moduleId) {
  let modal = document.getElementById('bulkLessonModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'bulkLessonModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <h3 class="modal-title">Create Topics</h3>
          <button type="button" class="modal-close" onclick="closeBulkLessonModal()">×</button>
        </div>
        <form id="bulkLessonForm">
          <div class="form-section">
            <h4 class="section-title">Add Multiple Topics</h4>
            <p style="color:#666;margin-bottom:16px;">Add topics one by one. Click + to add more.</p>
            <div id="lessonFieldsContainer">
              <div class="lesson-field-group" data-lesson-number="1">
                <div class="form-group">
                  <label class="modal-label">Topic 1 *</label>
                  <div style="display:flex;gap:8px;align-items:center;">
                    <input type="text" class="lesson-title-input modal-input" placeholder="e.g., Introduction to Programming" maxlength="255" style="flex:1;" />
                    <button type="button" class="add-lesson-btn action-btn primary" style="padding:8px 12px;min-width:auto;">
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" id="bulkLessonCancel" class="action-btn secondary">Cancel</button>
            <button type="submit" id="bulkLessonSubmit" class="action-btn primary"><i class="fas fa-plus"></i> Create Topics</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);

    // Submit handler
    const form = document.getElementById('bulkLessonForm');
    if (form) {
      form.onsubmit = function(e){
        e.preventDefault();
        const inputs = document.querySelectorAll('.lesson-title-input');
        const titles = Array.from(inputs).map(i => (i.value||'').trim()).filter(Boolean);
        if (!titles.length) { alert('Please enter at least one topic.'); return; }
        if (titles.length > 20) { alert('Maximum 20 topics can be created at once.'); return; }
        let fd = new FormData();
        fd.append('action','bulk_lesson_create');
        fd.append('module_id', String(moduleId));
        fd.append('titles', JSON.stringify(titles));
        const btn = document.getElementById('bulkLessonSubmit');
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...'; }
        ;(async function(){ try { fd = await addCSRFToken(fd); } catch(_){ } return fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' }); })()
          .then(r=>r.json())
          .then(data=>{
            if (data && data.success) {
              if (typeof window.showNotification === 'function') window.showNotification('success','Success', (data.created_count||titles.length) + ' topic(s) created');
              modal.style.display = 'none';
              resetBulkLessonForm();
              const outline = document.getElementById('courseOutlineModal');
              const courseId = outline ? outline.getAttribute('data-course-id') : null;
              if (courseId) viewOutline(courseId);
            } else { alert((data && data.message) || 'Failed to create topics'); }
          })
          .catch(()=>{ alert('Network error.'); })
          .finally(()=>{ if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-plus"></i> Create Topics'; } });
      };
    }

    // Add button wiring
    setupAddLessonButtons();

    // Cancel/close handlers
    const cancelBtn = document.getElementById('bulkLessonCancel');
    if (cancelBtn) cancelBtn.onclick = function(){ closeBulkLessonModal(); };
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.onclick = function(){ closeBulkLessonModal(); };
    modal.onclick = function(e){ if (e.target === modal) closeBulkLessonModal(); };
  }
  // Show
  modal.style.display = 'flex';
  setTimeout(function(){ const first = document.querySelector('.lesson-title-input'); if (first) first.focus(); }, 50);
}

function closeBulkLessonModal(){ const m = document.getElementById('bulkLessonModal'); if (m) { m.style.display='none'; resetBulkLessonForm(); } }
function resetBulkLessonForm(){ const c = document.getElementById('lessonFieldsContainer'); if (c) { c.innerHTML = `
  <div class="lesson-field-group" data-lesson-number="1">
    <div class="form-group">
      <label class="modal-label">Topic 1 *</label>
      <div style="display:flex;gap:8px;align-items:center;">
        <input type="text" class="lesson-title-input modal-input" placeholder="e.g., Introduction to Programming" maxlength="255" style="flex:1;" />
        <button type="button" class="add-lesson-btn action-btn primary" style="padding:8px 12px;min-width:auto;">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    </div>
  </div>`; setupAddLessonButtons(); } }
function setupAddLessonButtons(){ document.querySelectorAll('.add-lesson-btn').forEach(function(b){ b.onclick = function(){ addNewLessonField(); }; }); }
function addNewLessonField(){ const c = document.getElementById('lessonFieldsContainer'); if (!c) return; const n = c.querySelectorAll('.lesson-field-group').length + 1; if (n>20) { alert('Maximum 20 topics.'); return; } const el = document.createElement('div'); el.className='lesson-field-group'; el.setAttribute('data-lesson-number', String(n)); el.innerHTML = `
  <div class="form-group"> 
    <label class="modal-label">Topic ${n} *</label>
    <div style="display:flex;gap:8px;align-items:center;"> 
      <input type="text" class="lesson-title-input modal-input" placeholder="e.g., Topic ${n} Title" maxlength="255" style="flex:1;" />
      <button type="button" class="add-lesson-btn action-btn primary" style="padding:8px 12px;min-width:auto;"><i class="fas fa-plus"></i></button>
      <button type="button" class="remove-lesson-btn action-btn secondary" style="padding:8px 12px;min-width:auto;background:#dc3545;color:#fff;"><i class="fas fa-minus"></i></button>
    </div>
  </div>`; c.appendChild(el); setupAddLessonButtons(); const rem = el.querySelector('.remove-lesson-btn'); if (rem) rem.onclick = function(){ removeLessonField(el); }; const inp = el.querySelector('.lesson-title-input'); if (inp) inp.focus(); }
function removeLessonField(el){ const c = document.getElementById('lessonFieldsContainer'); if (!c) return; const groups = c.querySelectorAll('.lesson-field-group'); if (groups.length<=1) { alert('At least one topic is required.'); return; } el.remove(); Array.from(c.querySelectorAll('.lesson-field-group')).forEach(function(g,i){ const lbl = g.querySelector('.modal-label'); if (lbl) lbl.textContent = 'Topic ' + (i+1) + ' *'; }); }
// ===== Monaco Editor Integration for Coding Activities =====
let monacoEditor = null;
let monacoLoaded = false;

// Load Monaco Editor (lazy load)
function loadMonacoEditor() {
  if (monacoLoaded) return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    // Set up Monaco environment for workers using a same-origin Blob URL to avoid CORS
    // CRITICAL FIX: Disable worker loading to avoid CORS issues with CDN scripts
    window.MonacoEnvironment = {
      getWorkerUrl: function (moduleId, label) {
        // Disable workers for now - use editor in main thread
        // This avoids CORS issues with CDN worker scripts
        return 'data:text/javascript;charset=utf-8,' + encodeURIComponent(`
          self.MonacoEnvironment = { baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs/' };
          self.importScripts = function() {
            // Silently ignore worker script imports to avoid CORS errors
            console.warn('Monaco worker script import ignored:', arguments[0]);
          };
          // Minimal worker stub
          self.postMessage = function() {};
          self.onmessage = null;
        `);
      },
      getWorker: function(moduleId, label) {
        // Return null to disable workers and use main thread
        return null;
      }
    };

    // Load Monaco CSS
    if (!document.querySelector('link[href*="monaco-editor"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs/editor/editor.main.min.css';
      document.head.appendChild(link);
    }

    // Load Monaco JS
    if (!window.require) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs/loader.min.js';
      script.onload = () => {
        window.require.config({ 
          paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs' } 
        });
        window.require(['vs/editor/editor.main'], () => {
          monacoLoaded = true;
          console.log('✅ Monaco Editor loaded successfully');
          resolve();
        }, (err) => {
          console.error('❌ Monaco Editor load error:', err);
          // Still resolve to allow fallback to textarea
          monacoLoaded = false;
          resolve();
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    } else {
      window.require(['vs/editor/editor.main'], () => {
        monacoLoaded = true;
        console.log('✅ Monaco Editor loaded successfully (require already exists)');
        resolve();
      }, (err) => {
        console.error('❌ Monaco Editor load error (require exists):', err);
        monacoLoaded = false;
        resolve();
      });
    }
  });
}

// Initialize Monaco editor in coding form
function initMonacoEditor(container, language = 'javascript', initialValue = '') {
  if (!container) return;
  
  loadMonacoEditor().then(() => {
    if (monacoEditor) {
      monacoEditor.dispose();
    }
    
    // Hide fallback textarea when Monaco is ready
    try { const ta = container.querySelector('textarea'); if (ta) ta.style.display = 'none'; } catch(_){ }

    monacoEditor = window.monaco.editor.create(container, {
      value: initialValue,
      language: language,
      theme: 'vs',
      fontSize: 14,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      lineNumbers: 'on',
      folding: true,
      renderWhitespace: 'selection'
    });
    
    // Update form state when editor content changes
    monacoEditor.onDidChangeModelContent(() => {
      const value = monacoEditor.getValue();
      const starterCodeInput = document.getElementById('cafStarterCode');
      if (starterCodeInput) {
        starterCodeInput.value = value;
      }
    try { if (window.createActivityState) { window.createActivityState.starterCode = value; if (window.__cafScheduleSave) window.__cafScheduleSave(); } } catch(_){ }
    });
  }).catch(err => {
    console.error('Failed to load Monaco editor:', err);
    // Fallback to textarea
    const textarea = container.querySelector('textarea');
    if (textarea) textarea.style.display = 'block';
  });
}

// Update Monaco language when language selection changes
function updateMonacoLanguage(language) {
  if (monacoEditor && window.monaco) {
    const langMap = {
      'java': 'java',
      'python': 'python', 
      'cpp': 'cpp',
      'c': 'c',
      'javascript': 'javascript'
    };
    const monacoLang = langMap[language] || 'javascript';
    window.monaco.editor.setModelLanguage(monacoEditor.getModel(), monacoLang);
  }
}
// ===== Create Activity Wizard (non-disruptive) =====
function showCreateActivityWizard(lessonId){
  let modal = document.getElementById('createActivityWizard');
  if (!modal){
    modal = document.createElement('div');
    modal.id = 'createActivityWizard';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card" style="max-width:900px;width:95%;max-height:90vh;display:flex;flex-direction:column;">
        <div style="padding:12px 14px;border-bottom:1px solid #e9ecef;display:flex;align-items:center;gap:8px;">
          <strong style="flex:1">Create Activity</strong>
          <button class="action-btn btn-gray" id="caClose">Close</button>
        </div>
        <div id="caBody" style="padding:12px 14px;overflow:auto;flex:1"></div>
        <div style="padding:10px 14px;border-top:1px solid #e9ecef;display:flex;gap:8px;justify-content:space-between;align-items:center;">
          <div id="caStepIndicator" style="font-size:12px;color:#666;">Step 1 of 4</div>
          <div>
            <button class="action-btn btn-gray" id="caBack">Back</button>
            <button class="action-btn btn-green" id="caNext">Next</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e){ if (e.target===modal) modal.style.display='none'; });
    modal.querySelector('#caClose').onclick=function(){ modal.style.display='none'; };
  }
  modal.style.display='flex';
  try {
    const btnInit = modal.querySelector('#cafCreate');
    if (btnInit) {
      btnInit.disabled = false;
      btnInit.textContent = (opts && opts.editActivityId) ? 'Save Changes' : 'Create item';
    }
  } catch(_){ }

  const state = {
    step: 1,
    type: 'coding',
    name: '',
    language: '',
    questions: [] // [{text:'', choices:[{text:'', correct:false}], multiple:false}]
  };

  const body = modal.querySelector('#caBody');
  const stepEl = modal.querySelector('#caStepIndicator');
  const backBtn = modal.querySelector('#caBack');
  const nextBtn = modal.querySelector('#caNext');

  function render(){
    stepEl.textContent = 'Step ' + state.step + ' of ' + (state.type==='coding' ? 3 : 4);
    backBtn.style.display = state.step===1 ? 'none' : '';
    nextBtn.textContent = (state.type==='coding' ? (state.step===3?'Create':'Next') : (state.step===4?'Create':'Next'));
    if (state.step===1){
      body.innerHTML = `
        <div style="margin-bottom:12px;font-weight:600;">Step 1</div>
        <div style="display:flex;gap:12px;">
          <div data-opt="coding" class="ca-tile" style="flex:1;border:1px solid #e3e6ea;border-radius:8px;padding:12px;cursor:pointer;${state.type==='coding'?'outline:2px solid #1d9b3e;':''}">
            <div style="font-weight:600;">Console application</div>
            <div style="font-size:12px;color:#666;margin-top:6px;">Create a console-based item to run and auto-check.</div>
          </div>
          <div data-opt="questionnaire" class="ca-tile" style="flex:1;border:1px solid #e3e6ea;border-radius:8px;padding:12px;cursor:pointer;${state.type==='questionnaire'?'outline:2px solid #1d9b3e;':''}">
            <div style="font-weight:600;">Questionnaire</div>
            <div style="font-size:12px;color:#666;margin-top:6px;">Multiple-choice questionnaire with auto-checking.</div>
          </div>
        </div>`;
      body.querySelectorAll('.ca-tile').forEach(t=>{ t.onclick=function(){ state.type = this.getAttribute('data-opt'); render(); }; });
      return;
    }
    if (state.step===2){
      body.innerHTML = `
        <div style="margin-bottom:12px;font-weight:600;">Step 2</div>
        <label style="display:block;font-size:12px;color:#666;margin-bottom:6px;">Activity name</label>
        <input id="caName" type="text" class="modal-input" placeholder="e.g., Coding Exercise or Quiz" value="${state.name.replace(/"/g,'&quot;')}" />`;
      body.querySelector('#caName').oninput = function(){ state.name = this.value; };
      return;
    }
    if (state.step===3 && state.type==='coding'){
      body.innerHTML = `
        <div style="margin-bottom:12px;font-weight:600;">Step 3</div>
        <label style="display:block;font-size:12px;color:#666;margin-bottom:6px;">Language (optional)</label>
        <select id="caLang" class="modal-input"><option value="">Select language</option><option>Java</option><option>Python</option><option>C++</option><option>C</option></select>`;
      body.querySelector('#caLang').value = state.language; 
      body.querySelector('#caLang').onchange = function(){ state.language = this.value; };
      return;
    }
    if (state.step===3 && state.type==='questionnaire' || state.step===4){
      // questions UI (MCQ, Identification, Essay)
      body.innerHTML = `
        <div style="margin-bottom:12px;font-weight:600;">Step 4</div>
        <div style="margin-bottom:8px;color:#666;font-size:12px;">Add questions (Multiple Choice, Identification, or Essay)</div>
        <div id="caQList"></div>
        <button class="action-btn btn-green" id="caAddQ" style="margin-top:8px;">+ Add question</button>`;
      const list = body.querySelector('#caQList');
      function renderQ(){
        list.innerHTML = state.questions.map(function(q,qi){
          const qType = q.type || 'mcq';
          return `
          <div data-qi="${qi}" style="border:1px solid #e9ecef;border-radius:8px;padding:10px;margin-bottom:10px;">
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
              <input type="text" class="modal-input" placeholder="Question *" value="${(q.text||'').replace(/"/g,'&quot;')}" style="flex:1;" />
              <select class="modal-input" data-role="qtype" style="width:180px;">
                <option value="mcq" ${qType==='mcq'?'selected':''}>Multiple choice</option>
                <option value="ident" ${qType==='ident'?'selected':''}>Identification</option>
                <option value="essay" ${qType==='essay'?'selected':''}>Essay</option>
              </select>
            </div>
            <div data-role="mcq" style="${qType==='mcq'?'':'display:none;'}">
              ${(q.choices||[]).map(function(c,ci){
                return `<div data-ci="${ci}" style=\"display:flex;gap:6px;align-items:center;margin-bottom:6px;\">
                  <input type=\"checkbox\" ${c.correct?'checked':''} />
                  <input type=\"text\" class=\"modal-input\" placeholder=\"Option\" value=\"${(c.text||'').replace(/"/g,'&quot;')}\" />
                  <button class=\"action-btn btn-gray\" data-act=\"delChoice\">-</button>
                </div>`;
              }).join('')}
              <button class="action-btn btn-gray" data-act="addChoice">+ Add option</button>
            </div>
            <div data-role="ident" style="${qType==='ident'?'':'display:none;'}">
              <label style="display:block;font-size:12px;color:#666;margin:6px 0;">Correct answer</label>
              <input type="text" class="modal-input" data-role="identAnswer" placeholder="Type the correct answer" value="${(q.answer||'').replace(/"/g,'&quot;')}" />
            </div>
            <div data-role="essay" style="${qType==='essay'?'':'display:none;'};font-size:12px;color:#666;margin-top:6px;">Free text response (no auto-check).</div>
            <div style="display:flex;gap:8px;margin-top:8px;">
              <button class="action-btn btn-red" data-act="delQ">Delete question</button>
            </div>
          </div>`;
        }).join('');
        // bind question item events
        list.querySelectorAll('[data-qi]').forEach(function(qEl){
          const qi = parseInt(qEl.getAttribute('data-qi'),10);
          const q = state.questions[qi];
          qEl.querySelector('input.modal-input').oninput = function(){ q.text = this.value; };
          const typeSel = qEl.querySelector('[data-role="qtype"]');
          typeSel.onchange=function(){ q.type = this.value; if (q.type==='mcq' && !q.choices) q.choices=[{text:'',correct:false}]; renderQ(); };
          // MCQ handlers
          const mcqWrap = qEl.querySelector('[data-role="mcq"]');
          if (mcqWrap){
            mcqWrap.querySelectorAll('[data-ci]').forEach(function(cEl){
              const ci = parseInt(cEl.getAttribute('data-ci'),10); const c = q.choices[ci];
              cEl.querySelector('input[type="checkbox"]').onchange=function(){ c.correct = this.checked; };
              cEl.querySelector('input.modal-input').oninput=function(){ c.text = this.value; };
              cEl.querySelector('[data-act="delChoice"]').onclick=function(){ q.choices.splice(ci,1); renderQ(); };
            });
            const addBtn = mcqWrap.querySelector('[data-act="addChoice"]'); if (addBtn) addBtn.onclick=function(){ q.choices.push({text:'',correct:false}); renderQ(); };
          }
          // Identification handler
          const identInput = qEl.querySelector('[data-role="identAnswer"]');
          if (identInput){ identInput.oninput=function(){ q.answer = this.value; }; }
          qEl.querySelector('[data-act="delQ"]').onclick=function(){ state.questions.splice(qi,1); renderQ(); };
        });
      }
      renderQ();
      body.querySelector('#caAddQ').onclick=function(){ state.questions.push({type:'mcq', text:'',choices:[{text:'',correct:false}]}); renderQ(); };
      return;
    }
  }

  function create(){
    const fd = new FormData();
    fd.append('action','activity_create');
    fd.append('lesson_id', String(lessonId));
    fd.append('type', state.type==='coding' ? 'coding' : 'quiz');
    fd.append('title', state.name || (state.type==='coding'?'Coding Exercise':'Quiz'));
    fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
      .then(function(r){ return r.json().catch(function(){ return { success:false, message:'Invalid JSON' }; }); })
      .then(function(data){
        if (!data || !data.success || !data.id){
          const dbg = data && (data.error || data.message) ? ('\n'+(data.error || data.message)) : '';
          alert('Failed to create activity' + dbg);
          return;
        }
        const actId = data.id;
        if (!isCoding && state.questions && state.questions.length){
          const promises = [];
          state.questions.forEach(function(q){
            const f = new FormData(); f.append('action','question_create'); f.append('activity_id', String(actId)); f.append('question_text', q.text||'Question'); f.append('points','1');
            promises.push(
              fetch('course_outline_manage.php', { method:'POST', body: f, credentials:'same-origin' })
                .then(r=>r.json())
                .then(function(res){ if (res && res.id){
                  const qid = res.id;
                  if (q.type==='mcq'){
                    (q.choices||[]).forEach(function(c){ const fc = new FormData(); fc.append('action','choice_create'); fc.append('question_id', String(qid)); fc.append('choice_text', c.text||'Option'); if (c.correct) fc.append('is_correct','1'); /* optionally store feedback: not persisted by backend currently */ promises.push(fetch('course_outline_manage.php', { method:'POST', body: fc, credentials:'same-origin' })); });
                  } else if (q.type==='ident') {
                    if (q.answer){ const fc = new FormData(); fc.append('action','choice_create'); fc.append('question_id', String(qid)); fc.append('choice_text', q.answer); fc.append('is_correct','1'); promises.push(fetch('course_outline_manage.php', { method:'POST', body: fc, credentials:'same-origin' })); }
                  } // essay: no choices
                }}));
          });
          Promise.all(promises).then(function(){ viewOutline(getCurrentCourseId()); modal.style.display='none'; });
        } else { viewOutline(getCurrentCourseId()); modal.style.display='none'; }
      })
      .catch(function(){ alert('Network error'); });
  }

  backBtn.onclick=function(){ if (state.step>1) { state.step--; render(); } };
  nextBtn.onclick=function(){
    if (state.step===1){ state.step=2; render(); return; }
    if (state.step===2){ if (!state.name) { alert('Enter a name'); return; } state.step = (state.type==='coding'?3:3); render(); return; }
    if (state.type==='coding') { if (state.step===3) { create(); } }
    else { if (state.step===3) { state.step=4; render(); } else if (state.step===4) { if (!state.questions.length){ alert('Add at least one question'); return; } create(); } }
  };

  render();
}
// ===== Update Modal Title =====
function updateModalTitle(mode) {
  const titleEl = document.getElementById('cafModalTitle');
  if (!titleEl) return;
  
  const state = window.createActivityState;
  if (!state) return;
  
  if (mode === 'preview') {
    titleEl.textContent = state.title ? `Preview: ${state.title}` : 'Preview Activity';
  } else if (mode === 'edit') {
    titleEl.textContent = state.title ? `Edit: ${state.title}` : 'Create Activity';
  }
}

// ===== Create Activity Open Form (all steps visible) =====
function showCreateActivityForm(lessonId, opts){
  // OPTIMIZED: Pre-create modal on first page load to avoid lag
  let modal = document.getElementById('createActivityForm');
  if (!modal){
    modal = document.createElement('div');
    modal.id = 'createActivityForm';
    modal.className = 'modal-overlay';
    modal.style.display = 'none'; // Hidden initially
    // Ensure preview CSS is present once
    try {
      if (!document.getElementById('cafPreviewCSS')) {
        const style = document.createElement('style');
        style.id = 'cafPreviewCSS';
        style.textContent = '#createActivityForm.is-preview #cafFooter{display:none !important;}\n#createActivityForm.is-preview #cafCreate{display:none !important;}';
        document.head.appendChild(style);
      }
    } catch(_){}
    modal.innerHTML = `
      <div class="modal-card" style="max-width:1400px;width:98%;max-height:95vh;display:flex;flex-direction:column;">
        <div style="padding:12px 14px;border-bottom:1px solid #e9ecef;display:flex;align-items:center;gap:8px;">
          <strong style="flex:1" id="cafModalTitle">Create Activity</strong>
          <div id="cafMode" style="display:flex;gap:6px;align-items:center;">
            <button class="action-btn btn-gray" id="cafEditMode">Edit</button>
            <button class="action-btn btn-gray" id="cafPreviewMode">Preview</button>
          </div>
          <button class="action-btn btn-gray" id="cafClose">Close</button>
        </div>
        <div id="cafBody" style="padding:12px 14px;overflow:auto;flex:1"></div>
        <div id="cafFooter" style="padding:10px 14px;border-top:1px solid #e9ecef;display:flex;gap:8px;justify-content:flex-end;align-items:center;">
          <button class="action-btn btn-green" id="cafCreate">Create item</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e){ if (e.target===modal) modal.style.display='none'; });
    modal.querySelector('#cafClose').onclick=function(){ modal.style.display='none'; };
    // Mode toggle buttons - OPTIMIZED: Attach once
    try {
      const editBtn = modal.querySelector('#cafEditMode');
      const previewBtn = modal.querySelector('#cafPreviewMode');
      if (editBtn) editBtn.onclick = function(){ 
        try { 
          if (window.createActivityState) window.createActivityState.viewMode = 'edit'; 
          updateModalTitle('edit'); 
          const footer = modal.querySelector('#cafFooter');
          if (footer) footer.style.display = 'flex';
          try { modal.classList.remove('is-preview'); } catch(_){ }
          window.dispatchEvent(new CustomEvent('createActivityRender')); 
        } catch(_){ } 
      };
      if (previewBtn) previewBtn.onclick = function(){ 
        try { 
          if (window.createActivityState) window.createActivityState.viewMode = 'preview'; 
          updateModalTitle('preview'); 
          const footer = modal.querySelector('#cafFooter');
          if (footer) footer.style.display = 'none';
          try { modal.classList.add('is-preview'); } catch(_){ }
          window.dispatchEvent(new CustomEvent('createActivityRender')); 
        } catch(_){ } 
      };
    } catch(_){ }
  }
  // OPTIMIZED: Show modal immediately with loading state
  modal.style.display='flex';
  
  // OPTIMIZED: Get body reference immediately and show loading
  const body = modal.querySelector('#cafBody');
  body.innerHTML = '<div style="text-align:center;padding:40px;color:#6c757d;">Loading form...</div>';

  const state = { 
    type:'lecture', 
    name:'', 
    language:'', 
    instructionsText:'', 
    maxScore:100,
    startAt: '',
    dueAt: '', 
    requiredConstruct: '',
    questions:[{
      text: '',
      points: 1,
      choices: [
        { text: '', correct: false },
        { text: '', correct: false },
        { text: '', correct: false },
        { text: '', correct: false }
      ],
      answer: '',
      explanation: '',
      matchingPairs: []
    }], 
    quizSettings:{attempts:1, timeLimit:0, shuffleQuestions:false, shuffleChoices:true},
    questionType: 'multiple_choice',
    difficulty: 'Easy',
    category: '',
    tags: '',
    problemStatement: '',
    starterCode: '',
    expectedOutput: '',
    timeLimit: 60,
    codingDifficulty: 'beginner',
    testCases: [],
    additionalRequirements: '',
    hints: '',
    viewMode: 'edit'
  };
  
  // Attach editActivityId if provided
  if (opts && opts.editActivityId) { state.editActivityId = String(opts.editActivityId); }
  
  // CRITICAL: Merge preloadedData if provided (for editing activities)
  if (opts && opts.preloadedData) {
    console.log('🔍 [SHOW_FORM] ========== MERGING PRELOADED DATA ==========');
    console.log('🔍 [SHOW_FORM] PreloadedData object:', JSON.stringify(opts.preloadedData, null, 2));
    console.log('🔍 [SHOW_FORM] PreloadedData.requiredConstruct:', opts.preloadedData.requiredConstruct, 'type:', typeof opts.preloadedData.requiredConstruct, 'truthy:', !!opts.preloadedData.requiredConstruct);
    console.log('🔍 [SHOW_FORM] PreloadedData.testCases:', opts.preloadedData.testCases, 'count:', opts.preloadedData.testCases ? opts.preloadedData.testCases.length : 0);
    if (opts.preloadedData.testCases && opts.preloadedData.testCases.length > 0) {
      opts.preloadedData.testCases.forEach((tc, i) => {
        console.log(`🔍 [SHOW_FORM] PreloadedData.testCases[${i}]:`, {
          points: tc.points,
          pointsType: typeof tc.points,
          isSample: tc.isSample,
          input: tc.input,
          output: tc.output
        });
      });
    }
    
    // CRITICAL: Manually copy each property to ensure proper assignment
    // This is more reliable than Object.assign for nested objects/arrays
    Object.keys(opts.preloadedData).forEach(key => {
      const value = opts.preloadedData[key];
      if (value !== null && value !== undefined) {
        // CRITICAL: For arrays (like testCases), create a DEEP copy with ALL properties
        if (Array.isArray(value)) {
          state[key] = value.map((item, idx) => {
            if (typeof item === 'object' && item !== null) {
              // CRITICAL: Use spread operator to ensure ALL properties are copied
              const copied = { ...item };
              // CRITICAL: Explicitly verify points property exists
              if (key === 'testCases') {
                console.log(`🔍 [SHOW_FORM] Copying TC ${idx} - Original:`, item, 'Has points?', 'points' in item, 'points value:', item.points);
                console.log(`🔍 [SHOW_FORM] Copying TC ${idx} - Copied:`, copied, 'Has points?', 'points' in copied, 'points value:', copied.points);
                // CRITICAL: Ensure points is explicitly set (handle undefined/null)
                if (!('points' in copied) || copied.points === null || copied.points === undefined) {
                  copied.points = item.points !== null && item.points !== undefined ? item.points : 0;
                  console.log(`🔍 [SHOW_FORM] TC ${idx} points was missing/null/undefined, set to:`, copied.points);
                }
              }
              return copied;
            }
            return item;
          });
          console.log(`🔍 [SHOW_FORM] Copied array key "${key}" with ${state[key].length} items`);
          // CRITICAL: Verify testCases after copy
          if (key === 'testCases' && state[key].length > 0) {
            state[key].forEach((tc, i) => {
              console.log(`🔍 [SHOW_FORM] VERIFIED TC ${i} after copy:`, {
                hasPoints: 'points' in tc,
                points: tc.points,
                pointsType: typeof tc.points,
                allKeys: Object.keys(tc)
              });
            });
          }
        } else {
          state[key] = value;
          if (key === 'requiredConstruct') {
            console.log(`🔍 [SHOW_FORM] CRITICAL: Copied requiredConstruct: "${value}" (type: ${typeof value}, truthy: ${!!value})`);
          } else {
            console.log(`🔍 [SHOW_FORM] Copied key "${key}":`, typeof value === 'string' ? value.substring(0, 50) : value);
          }
        }
      }
    });
    
    // CRITICAL: Explicitly verify critical fields after merge
    console.log('🔍 [SHOW_FORM] ========== AFTER MERGE VERIFICATION ==========');
    console.log('🔍 [SHOW_FORM] state.requiredConstruct:', state.requiredConstruct, 'type:', typeof state.requiredConstruct, 'truthy:', !!state.requiredConstruct);
    console.log('🔍 [SHOW_FORM] state.testCases:', state.testCases, 'count:', state.testCases ? state.testCases.length : 0);
    if (state.testCases && state.testCases.length > 0) {
      state.testCases.forEach((tc, i) => {
        console.log(`🔍 [SHOW_FORM] state.testCases[${i}]:`, {
          points: tc.points,
          pointsType: typeof tc.points,
          isSample: tc.isSample,
          input: tc.input ? tc.input.substring(0, 20) + '...' : 'empty',
          output: tc.output ? tc.output.substring(0, 20) + '...' : 'empty',
          fullObject: tc
        });
      });
    }
    console.log('🔍 [SHOW_FORM] ============================================');
  }
  
  // Make state globally accessible
  window.createActivityState = state;
  // CRITICAL: Log immediately after making global to verify state
  console.log('🔍 [SHOW_FORM] ========== GLOBAL STATE SET ==========');
  console.log('🔍 [SHOW_FORM] window.createActivityState.requiredConstruct:', window.createActivityState.requiredConstruct, 'type:', typeof window.createActivityState.requiredConstruct, 'truthy:', !!window.createActivityState.requiredConstruct);
  console.log('🔍 [SHOW_FORM] window.createActivityState.testCases count:', window.createActivityState.testCases ? window.createActivityState.testCases.length : 0);
  if (window.createActivityState.testCases && window.createActivityState.testCases.length > 0) {
    window.createActivityState.testCases.forEach((tc, i) => {
      console.log(`🔍 [SHOW_FORM] window.createActivityState.testCases[${i}].points:`, tc.points, 'type:', typeof tc.points);
    });
  }
  console.log('🔍 [SHOW_FORM] =====================================');
  // === AUTOSAVE/RESTORE (localStorage) ===
  try {
    const key = 'cr_createActivityDraft_' + String(lessonId);
    // CRITICAL: Do NOT restore from localStorage if preloadedData is provided (editing mode)
    if (opts && opts.preloadedData) {
      console.log('🔍 [SHOW_FORM] Skipping initial localStorage restore because preloadedData is provided');
      // Clear any existing draft when editing
      try { localStorage.removeItem(key); } catch(_){ }
    } else if (!opts || !opts.editActivityId) {
      // Do NOT restore drafts in edit mode; they can corrupt the loaded record's type
      const raw = localStorage.getItem(key);
      if (raw) {
        try { 
          const saved = JSON.parse(raw); 
          if (saved && typeof saved === 'object') { 
            delete saved.editActivityId;
            Object.assign(state, saved); 
          } 
        } catch(e){}
      }
    } else {
      try { localStorage.removeItem(key); } catch(_){ }
    }
    // Debounced autosave function
    let saveTimer = null;
    const scheduleSave = function(){
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(function(){ 
        try { 
          const snapshot = Object.assign({}, state);
          // Do not persist editActivityId in drafts
          delete snapshot.editActivityId;
          localStorage.setItem(key, JSON.stringify(snapshot)); 
        } catch(_){} 
      }, 400);
    };
    // Expose to inner handlers
    window.__cafScheduleSave = scheduleSave;
  } catch(_){}
  
  // Listen for re-render events (ensure single handler)
  try { if (window.__cafRenderHandler) { window.removeEventListener('createActivityRender', window.__cafRenderHandler); } } catch(_){ }
  window.__cafRenderHandler = function(){ 
    // OPTIMIZED: Use requestAnimationFrame for render to avoid blocking
    requestAnimationFrame(function(){ try { render(); } catch(_){ } });
  };
  window.addEventListener('createActivityRender', window.__cafRenderHandler);
  
  // OPTIMIZED: Defer localStorage operations to avoid blocking UI
  requestAnimationFrame(function(){
    try {
      const key = 'cr_createActivityDraft_' + String(lessonId);
      // CRITICAL: Do NOT restore from localStorage if preloadedData is provided (editing mode)
      if (opts && opts.preloadedData) {
        console.log('🔍 [SHOW_FORM] Skipping localStorage restore because preloadedData is provided');
      } else {
        // Restore draft if available and state is fresh
        const raw = localStorage.getItem(key);
        if (raw) {
          try { 
            const saved = JSON.parse(raw); 
            if (saved && typeof saved === 'object') { 
              // Never restore editActivityId from a draft; drafts are for new items only
              if (!opts || !opts.editActivityId) { delete saved.editActivityId; }
              Object.assign(state, saved);
              // Trigger render after restore
              requestAnimationFrame(function(){ try { render(); } catch(_){ } });
            } 
          } catch(e){}
        }
      }
      // Debounced autosave function
      let saveTimer = null;
      const scheduleSave = function(){
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(function(){ 
          try { 
            const snapshot = Object.assign({}, state);
            // Do not persist editActivityId in drafts
            delete snapshot.editActivityId;
            localStorage.setItem(key, JSON.stringify(snapshot)); 
          } catch(_){} 
        }, 400);
      };
      // Expose to inner handlers
      window.__cafScheduleSave = scheduleSave;
    } catch(_){}
  });
  
  // OPTIMIZED: Defer initial render to avoid blocking modal display
  // CRITICAL: If preloadedData is provided, ensure it's merged before render
  if (opts && opts.preloadedData) {
    console.log('🔍 [SHOW_FORM] PreloadedData provided, ensuring state is ready before render');
    console.log('🔍 [SHOW_FORM] State BEFORE render:', {
      requiredConstruct: state.requiredConstruct,
      testCases: state.testCases ? state.testCases.length : 0,
      questionType: state.questionType
    });
    // Small delay to ensure preloadedData merge is complete
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        try { 
          console.log('🔍 [SHOW_FORM] Rendering with preloadedData, state.requiredConstruct:', state.requiredConstruct, 'type:', typeof state.requiredConstruct, 'truthy:', !!state.requiredConstruct);
          console.log('🔍 [SHOW_FORM] State object reference check:', state === window.createActivityState);
          render(); 
        } catch(e){
          console.error('🔍 [SHOW_FORM] Render error:', e);
        }
      });
    });
  } else {
    requestAnimationFrame(function(){
      try { render(); } catch(_){}
    });
  }
  // Test if elements exist
  function render(){
    try {
      // CRITICAL: Always use the current global state, not the closure variable
      const currentState = window.createActivityState || state;
      console.log('🔍 [RENDER] ========== RENDER START ==========');
      console.log('🔍 [RENDER] currentState.requiredConstruct:', currentState.requiredConstruct, 'type:', typeof currentState.requiredConstruct, 'truthy:', !!currentState.requiredConstruct);
      console.log('🔍 [RENDER] State object reference check:', currentState === window.createActivityState, 'currentState === state:', currentState === state);
      console.log('🔍 [RENDER] currentState.testCases count:', currentState.testCases ? currentState.testCases.length : 0);
      console.log('🔍 [RENDER] currentState.viewMode:', currentState.viewMode);
      console.log('🔍 [RENDER] currentState.questionType:', currentState.questionType);
      if (currentState.testCases && currentState.testCases.length > 0) {
        currentState.testCases.forEach((tc, i) => {
          console.log(`🔍 [RENDER] currentState.testCases[${i}].points:`, tc.points, 'type:', typeof tc.points, 'isSample:', tc.isSample);
        });
      }
      console.log('🔍 [RENDER] =================================');
      
      // CRITICAL: Check if body element exists
      if (!body) {
        console.error('🔍 [RENDER] ❌ Body element not found!');
        return;
      }
      
      // Preserve scroll position within the modal body across renders
      var prevScrollTop = body ? body.scrollTop : 0;
      
      // Update mode button visuals
    try {
      const editBtn = modal.querySelector('#cafEditMode');
      const previewBtn = modal.querySelector('#cafPreviewMode');
      if (editBtn) { editBtn.style.background = (currentState.viewMode==='edit') ? '#28a745' : ''; editBtn.style.color = (currentState.viewMode==='edit') ? '#fff' : ''; }
      if (previewBtn) { previewBtn.style.background = (currentState.viewMode==='preview') ? '#28a745' : ''; previewBtn.style.color = (currentState.viewMode==='preview') ? '#fff' : ''; }
    } catch(_){ }

    // Render PREVIEW mode using professional test interface
    if (currentState.viewMode === 'preview') {
      console.log('🔍 DEBUG: Rendering preview mode, currentState:', currentState);
      console.log('🔍 DEBUG: instructionsText:', currentState.instructionsText);
      
      // Determine activity type - handle true_false stored as 'quiz' in database
      // CRITICAL: Check both questionType and type for coding activities
      // type can be 'laboratory' and questionType can be 'coding'
      let activityType = state.questionType || state.type || 'multiple_choice';
      // If type is 'laboratory', it's definitely a coding activity
      if (state.type === 'laboratory' && !activityType) {
        activityType = 'coding';
      }
      console.log('🔍 DEBUG: Initial activityType:', activityType, 'state.questionType:', state.questionType, 'state.type:', state.type);
      
      // Check instructions for true_false kind
      if (state.instructionsText && typeof state.instructionsText === 'string') {
        try {
          const instructionsObj = JSON.parse(state.instructionsText);
          if (instructionsObj.kind === 'true_false') {
            activityType = 'true_false';
            console.log('🔍 DEBUG: Detected as true_false from instructions kind');
          }
        } catch (e) {
          console.log('🔍 DEBUG: Could not parse instructions:', e);
        }
      }
      
      // If stored as 'quiz', check if it's actually true_false based on questions
      if (activityType === 'quiz' && state.questions && state.questions.length > 0) {
        const firstQuestion = state.questions[0];
        console.log('🔍 DEBUG: Checking quiz type, first question:', firstQuestion);
        if (firstQuestion.choices && firstQuestion.choices.length === 2) {
          // CRITICAL: Check both 'text' and 'choice_text' properties (API format uses choice_text)
          const choiceTexts = firstQuestion.choices.map(c => {
            const text = c.choice_text || c.text || '';
            return String(text).toLowerCase().trim();
          });
          console.log('🔍 DEBUG: Choice texts:', choiceTexts);
          if (choiceTexts.includes('true') && choiceTexts.includes('false')) {
            activityType = 'true_false';
            console.log('🔍 DEBUG: Detected as true_false based on choices');
          } else {
            activityType = 'multiple_choice';
            console.log('🔍 DEBUG: Detected as multiple_choice based on choices');
          }
        }
      }
      
      console.log('🔍 DEBUG: Final activityType:', activityType);
        const activity = { 
          id: state.editActivityId ? parseInt(state.editActivityId,10) : 0, 
          title: state.name || 'Untitled Activity', 
          instructions: '', 
          questions: state.questions || [],
          max_score: state.max_score || 0
        };
      if (activityType === 'coding') {
        const meta = { 
          language: state.language || 'cpp', 
          starterCode: state.starterCode || '', 
          instructions: state.instructionsText || '',
          problemStatement: state.problemStatement || '',
          expectedOutput: state.expectedOutput || '',
          additionalRequirements: state.additionalRequirements || '',
          hints: state.hints || '',
          requiredConstruct: state.requiredConstruct || ''
        };
        activity.instructions = JSON.stringify(meta);
        // CRITICAL: Map test cases to the format expected by renderCodingPreview
        activity.testCases = Array.isArray(state.testCases) ? state.testCases.map(tc => ({
          input_text: tc.input || '',
          expected_output_text: tc.output || '',
          is_sample: !!tc.isSample,
          points: tc.points || 0,
          time_limit_ms: tc.timeLimitMs || 2000
        })) : [];
        activity.test_cases = activity.testCases; // Also set test_cases for compatibility
        // CRITICAL: Ensure requiredConstruct is properly set from state
        activity.required_construct = state.requiredConstruct || '';
        // Also ensure it's in the meta for renderCodingPreview
        if (!meta.requiredConstruct && state.requiredConstruct) {
          meta.requiredConstruct = state.requiredConstruct;
          activity.instructions = JSON.stringify(meta);
        }
        activity.max_score = state.max_score || 0;
        console.log('🔍 [CODING PREVIEW] Setting requiredConstruct:', state.requiredConstruct, 'activity.required_construct:', activity.required_construct);
        
        // CRITICAL: Render coding preview directly (like upload_based)
        console.log('🔍 [CODING PREVIEW] Rendering coding preview directly, activity:', {
          id: activity.id,
          title: activity.title,
          required_construct: activity.required_construct,
          testCases: activity.testCases,
          instructions: activity.instructions ? JSON.parse(activity.instructions) : null
        });
        try {
          body.innerHTML = renderCodingPreview(activity);
          if (body) { try { body.scrollTop = prevScrollTop; } catch(_){ } }
          
          // Ensure Monaco initializes
          setTimeout(function(){
            try {
              const container = document.getElementById('previewMonacoContainer');
              const textarea = document.getElementById('previewCodeTextarea');
              if (container && textarea) {
                loadMonacoEditor().then(function(){
                  if (window.monaco && window.monaco.editor) {
                    const existing = window.__previewEditor; if (existing && typeof existing.dispose === 'function') existing.dispose();
                    const lang = (function(){ try { const meta = JSON.parse(activity.instructions||'{}'); return (meta.language||'cpp'); } catch(_){ return 'cpp'; } })();
                    const editor = window.monaco.editor.create(container, {
                      value: textarea.value,
                      language: String(lang||'cpp').toLowerCase(),
                      theme: 'vs',
                      fontSize: 14,
                      automaticLayout: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      lineNumbers: 'on'
                    });
                    editor.onDidChangeModelContent(function(){ textarea.value = editor.getValue(); });
                    window.__previewEditor = editor;
                    try { textarea.style.display = 'none'; } catch(_){ }
                  } else {
                    textarea.style.display = 'block';
                  }
                }).catch(function(){ if (textarea) textarea.style.display='block'; });
              }
            } catch(_){ }
          }, 0);
        } catch (renderError) {
          console.error('🔍 [CODING PREVIEW] Error rendering coding preview:', renderError);
          console.error('🔍 [CODING PREVIEW] Error stack:', renderError.stack);
          if (body) {
            body.innerHTML = `
              <div style="text-align:center;padding:40px;color:#dc3545;">
                <h3 style="color:#dc3545;margin-bottom:16px;">⚠️ Error Rendering Coding Preview</h3>
                <p style="color:#666;margin-bottom:16px;">${renderError.message || 'Unknown error'}</p>
                <button onclick="window.createActivityState.viewMode = 'edit'; window.dispatchEvent(new CustomEvent('createActivityRender'));" 
                        style="background:#28a745;color:white;border:none;padding:10px 20px;border-radius:6px;margin-top:16px;cursor:pointer;">
                  Switch to Edit Mode
                </button>
              </div>
            `;
          }
        }
        return; // Exit - don't process through the else block
      } else if (activityType === 'upload_based') {
        const meta = { kind: 'upload_based', instructions: state.instructionsText || '' };
        activity.instructions = JSON.stringify(meta);
        const q0 = state.questions && state.questions[0] ? state.questions[0] : {};
        activity.acceptedFiles = q0.acceptedFiles || ['pdf','docx','pptx','jpg','png','txt','zip'];
        activity.maxFileSize = q0.maxFileSize || 10;
        // CRITICAL: For upload_based, set questions from state and render directly (no API fetch needed)
        activity.questions = Array.isArray(state.questions) ? state.questions.map(function(q, idx){
          return {
            id: q.id || q._id || undefined,
            _id: q.id || q._id || undefined,
            question_text: q.question_text || q.text || ('Question ' + (idx+1)),
            points: parseInt(q.points||1,10),
            acceptedFiles: q.acceptedFiles || activity.acceptedFiles,
            maxFileSize: q.maxFileSize || activity.maxFileSize
          };
        }) : [];
        
        // Store activity data for Test button functionality
        window.__previewActivityData = activity;
        window.__previewActivityType = activityType;
        
        // Calculate total points
        let totalPoints = activity.max_score || 0;
        if (activity.questions && activity.questions.length > 0) {
          totalPoints = activity.questions.reduce((sum, q) => sum + (q.points || 1), 0);
        }
        
        // Render upload_based preview directly (inline rendering since continuePreviewRender is in else block)
        // Use the same rendering logic as continuePreviewRender but inline
        const uploadBasedHtml = `
        <div style="background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden;display:flex;flex-direction:column;min-height:60vh;">
          <!-- Test Header -->
          <div style="background:linear-gradient(135deg, #28a745 0%, #20c997 100%);color:white;padding:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <h2 style="margin:0;font-size:24px;font-weight:600;">${activity.title}</h2>
              <div style="text-align:right;">
                <div style="font-size:14px;opacity:0.9;">Total Points</div>
                <div style="font-size:20px;font-weight:700;">${totalPoints}</div>
              </div>
            </div>
            <div style="display:flex;gap:20px;font-size:14px;opacity:0.9;">
              <span>📝 ${getActivityTypeDisplay(activityType)}</span>
              <span>⏱️ No time limit</span>
              <span>📊 ${activity.questions ? activity.questions.length : 0} question${(activity.questions ? activity.questions.length : 0) !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          <!-- Instructions -->
          ${(() => {
            let instructionsText = state.displayInstructions || state.instructionsText || '';
            if (instructionsText && typeof instructionsText === 'string') {
              try {
                const parsed = JSON.parse(instructionsText);
                if (parsed && typeof parsed === 'object' && parsed.instructions) {
                  instructionsText = parsed.instructions;
                }
              } catch (e) {}
            }
            return instructionsText ? `
            <div style="padding:20px;border-bottom:1px solid #e9ecef;background:#f8f9fa;">
              <h3 style="margin:0 0 12px 0;color:#333;font-size:16px;">📋 Instructions</h3>
              <p style="margin:0;color:#555;line-height:1.6;">${instructionsText}</p>
            </div>
          ` : '';
          })()}
          
          <!-- Main content -->
          <div style="flex:1;overflow:auto;padding:24px;">
              ${activity.questions && activity.questions.length > 0 ? 
                renderProfessionalTestQuestions(activity, activityType) : 
                `
              <div style="text-align:center;padding:40px;color:#6c757d;">No Questions Added</div>
              `}
          </div>

          <!-- Sticky submit -->
          ${activity.questions && activity.questions.length > 0 ? `
          <div id="submitSection" style="position:sticky;bottom:0;padding:15px 25px;background:#f8f9fa;border-top:1px solid #e9ecef;z-index:5;">
            <div style="display:flex;justify-content:space-between;align-items:center;max-width:1100px;margin:0 auto;">
              <div>
                <div style="font-size:13px;color:#6c757d;margin-bottom:2px;">Ready to submit?</div>
                <div style="font-size:11px;color:#6c757d;">Make sure you've answered all questions</div>
              </div>
              <div style="display:flex;gap:12px;">
                <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:6px;padding:10px 16px;font-size:12px;color:#856404;">
                  <i class="fas fa-info-circle"></i> This activity requires manual grading by the teacher.
                </div>
                <button id="finish-attempt-btn" style="background:linear-gradient(135deg, #28a745 0%, #20c997 100%);color:white;border:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 2px 4px rgba(40,167,69,0.3);" onclick="window.finishPreviewAttempt()">Finish Attempt</button>
              </div>
            </div>
          </div>
          ` : ''}
        </div>
      `;
        body.innerHTML = uploadBasedHtml;
        if (body) { try { body.scrollTop = prevScrollTop; } catch(_){ } }
        return; // Exit - don't process through the else block
      } else {
        const meta = { kind: activityType, instructions: state.instructionsText || '' };
        activity.instructions = JSON.stringify(meta);
        
        // CRITICAL: For preview mode, try to fetch fresh data from universal_activity_api.php
        // This ensures we get the same data structure as Teacher side (with choice_text property)
        const activityId = state.editActivityId || activity.id || 0;
        let qs = Array.isArray(state.questions) ? state.questions : [];
        
        console.log('🔍 [PREVIEW] ========== STARTING PREVIEW RENDER ==========');
        console.log('🔍 [PREVIEW] Activity ID:', activityId);
        console.log('🔍 [PREVIEW] Activity Type:', activityType);
        console.log('🔍 [PREVIEW] State.questions from state:', state.questions);
        console.log('🔍 [PREVIEW] Questions count from state:', qs.length);
        
        // CRITICAL: Check if we need to fetch from API
        // 1. If choices have wrong format (text instead of choice_text)
        // 2. If choices are missing/empty for activities that need them (multiple_choice, true_false, identification)
        const hasChoicesWithWrongFormat = activityId > 0 && qs.length > 0 && qs[0] && qs[0].choices && qs[0].choices.length > 0 && 
                                          qs[0].choices[0] && !qs[0].choices[0].choice_text && qs[0].choices[0].text;
        
        const needsChoicesButMissing = activityId > 0 && (activityType === 'multiple_choice' || activityType === 'true_false' || activityType === 'identification') &&
                                       qs.length > 0 && (!qs[0].choices || !Array.isArray(qs[0].choices) || qs[0].choices.length === 0);
        
        const needsApiFetch = hasChoicesWithWrongFormat || needsChoicesButMissing;
        
        if (needsApiFetch) {
          if (hasChoicesWithWrongFormat) {
            console.log('🔍 [PREVIEW] ⚠️ State has choices with "text" property, will map to "choice_text"');
          }
          if (needsChoicesButMissing) {
            console.log('🔍 [PREVIEW] ⚠️ CRITICAL: Activity type', activityType, 'needs choices but they are missing! Will fetch from API.');
          }
          
          // Fetch from API to get complete data with choices
          console.log('🔍 [PREVIEW] Fetching from universal_activity_api.php to get choices...');
          fetch(`universal_activity_api.php?action=get_activity&id=${activityId}`)
            .then(r => r.json())
            .then(apiRes => {
              if (apiRes && apiRes.success && apiRes.activity && apiRes.activity.questions) {
                console.log('🔍 [PREVIEW] ✅ Successfully fetched from API, questions with choices:', apiRes.activity.questions);
                qs = apiRes.activity.questions; // Use API data instead of state
                // Continue with mapping using API data
                processQuestionsForPreview();
              } else {
                console.warn('🔍 [PREVIEW] ⚠️ API fetch failed or incomplete, using state data');
                processQuestionsForPreview();
              }
            })
            .catch(e => {
              console.warn('🔍 [PREVIEW] ⚠️ API fetch error:', e);
              processQuestionsForPreview();
            });
        } else {
          processQuestionsForPreview();
        }
        
        function processQuestionsForPreview() {
          console.log('🔍 [PREVIEW] Processing questions for preview:', {
            questionsCount: qs.length,
            firstQuestion: qs[0] || null,
            firstQuestionChoices: qs[0] ? qs[0].choices : null,
            firstQuestionChoicesCount: qs[0] && qs[0].choices ? qs[0].choices.length : 0,
            activityType: activityType
          });
          console.log('🔍 [PREVIEW] Full first question JSON:', JSON.stringify(qs[0] || null, null, 2));
          
          activity.questions = qs.map(function(q, idx){
          // Handle both editor format (q.text) and database format (q.question_text)
          const questionText = q.question_text || q.text || ('Question ' + (idx+1));
          const base = { 
            id: q.id || q._id || undefined,
            _id: q.id || q._id || undefined,
            question_text: questionText, 
            points: parseInt(q.points||1,10),
            // CRITICAL: Include answer and explanation fields for Identification activities
            answer: q.answer || '',
            explanation: q.explanation || ''
          };
          
          console.log('🔍 [PREVIEW] Processing question', idx, ':', {
            question: q,
            hasChoices: !!(q.choices && Array.isArray(q.choices)),
            choicesCount: q.choices ? q.choices.length : 0,
            choices: q.choices,
            hasAnswer: !!q.answer,
            answer: q.answer,
            hasExplanation: !!q.explanation,
            explanation: q.explanation
          });
          
          // CRITICAL: Map choices for activity types that use choices (multiple_choice, true_false)
          // NOTE: Identification activities don't use choices - they use explanation field for correct answer
          if (activityType === 'multiple_choice' || activityType === 'true_false') { 
            const choicesArray = q.choices || [];
            console.log('🔍 [PREVIEW] Question', idx, 'RAW choices array:', JSON.stringify(choicesArray, null, 2));
            console.log('🔍 [PREVIEW] Question', idx, 'choices array type:', typeof choicesArray, 'isArray:', Array.isArray(choicesArray), 'length:', choicesArray.length);
            console.log('🔍 [PREVIEW] Question', idx, 'activityType:', activityType);
            
            if (choicesArray.length === 0) {
              console.warn('🔍 [PREVIEW] ⚠️ WARNING: No choices found for question', idx, '! Question object:', q);
              console.warn('🔍 [PREVIEW] ⚠️ Full question object:', JSON.stringify(q, null, 2));
            }
            
            base.choices = choicesArray.map(function(c, ci){ 
              // CRITICAL: Handle both formats - API format (choice_text) and state format (text)
              // API format (from universal_activity_api.php): has 'choice_text' property directly from DB
              // State format (from activity_get): has 'text' property (mapped from choice_text in line 1661)
              // Check choice_text FIRST (API format), then text (state format) - SAME AS TEACHER SIDE
              const rawText = c.choice_text || c.text || c.content || c.option || '';
              const choiceText = (rawText && String(rawText).trim()) ? String(rawText).trim() : ('Choice ' + (ci+1));
              
              console.log('🔍 [PREVIEW] Mapping choice', ci, 'for', activityType, ':', { 
                original: c,
                has_text: !!c.text,
                has_choice_text: !!c.choice_text,
                has_content: !!c.content,
                has_option: !!c.option,
                raw_text_value: c.text,
                raw_choice_text_value: c.choice_text,
                rawText: rawText,
                final: choiceText,
                is_correct: c.is_correct,
                correct: c.correct,
                isCorrectFlag: !!c.is_correct || !!c.correct || c.is_correct === 1 || c.correct === 1
              });
              
              // CRITICAL: Always return with choice_text property (same format as API and Teacher side)
              // This ensures renderQuestionInput receives the correct format
              return { 
                id: c.id || c._id || (ci+1), 
                choice_text: choiceText, 
                text: choiceText, // Also include for compatibility
                is_correct: !!c.is_correct || !!c.correct || c.is_correct === 1 || c.correct === 1 || c.is_correct === '1' || c.correct === '1',
                correct: !!c.is_correct || !!c.correct || c.is_correct === 1 || c.correct === 1 || c.is_correct === '1' || c.correct === '1'
              }; 
            }); 
            
            console.log('🔍 [PREVIEW] Question', idx, 'FINAL mapped choices:', JSON.stringify(base.choices, null, 2));
          } else if (activityType === 'identification') {
            // Identification activities don't use choices - they use explanation field for correct answer
            // No need to map choices, just ensure explanation is available
            console.log('🔍 [PREVIEW] Question', idx, 'is Identification type - using explanation field for correct answer');
            if (!base.explanation && q.explanation) {
              base.explanation = q.explanation;
            }
            // Set empty choices array for consistency
            base.choices = [];
          } else {
            // For other activity types (essay, upload_based, etc.), still try to map choices if they exist
            if (q.choices && Array.isArray(q.choices) && q.choices.length > 0) {
              base.choices = q.choices.map(function(c, ci){
                const rawText = c.choice_text || c.text || '';
                return {
                  id: c.id || c._id || (ci+1),
                  choice_text: rawText,
                  text: rawText,
                  is_correct: !!c.is_correct || !!c.correct || c.is_correct === 1 || c.correct === 1,
                  correct: !!c.is_correct || !!c.correct || c.is_correct === 1 || c.correct === 1
                };
              });
            } else {
              base.choices = [];
            }
          }
          return base;
        });
        
        console.log('🔍 [PREVIEW] Final activity.questions:', activity.questions);
        
        // CRITICAL: Store activity data for Test button functionality (like coding activity)
        // Ensure choices have is_correct flag properly set
        if (activity.questions && Array.isArray(activity.questions)) {
          activity.questions.forEach(q => {
            if (q.choices && Array.isArray(q.choices)) {
              q.choices.forEach(c => {
                // Ensure is_correct is properly set (handle both 'is_correct' and 'correct' properties)
                if (c.correct !== undefined && c.is_correct === undefined) {
                  c.is_correct = !!c.correct;
                }
                // Also ensure it's a boolean or 1/0
                if (c.is_correct !== undefined) {
                  c.is_correct = !!c.is_correct || c.is_correct === 1 || c.is_correct === '1';
                }
              });
            }
          });
        }
        
        window.__previewActivityData = activity;
        window.__previewActivityType = activityType;
        console.log('🔍 [PREVIEW] Stored activity data for Test button:', {
          activityId: activity.id || activity.activity_id,
          activityType: activityType,
          questionsCount: activity.questions ? activity.questions.length : 0,
          sampleQuestion: activity.questions && activity.questions[0] ? {
            id: activity.questions[0].id || activity.questions[0]._id,
            choices: activity.questions[0].choices ? activity.questions[0].choices.map(c => ({
              id: c.id || c._id,
              choice_text: c.choice_text,
              is_correct: c.is_correct,
              correct: c.correct
            })) : []
          } : null
        });
        
        // Continue with rendering
        continuePreviewRender();
      }
      
      function continuePreviewRender() {
        // Professional test interface
        // Note: activityType is from outer scope
        
        // Calculate total points - use max_score for upload_based and coding activities
        let totalPoints = 0;
        if (activityType === 'upload_based' || activityType === 'coding') {
          totalPoints = activity.max_score || 0;
        } else if (activity.questions && activity.questions.length > 0) {
          totalPoints = activity.questions.reduce((sum, q) => sum + (q.points || 1), 0);
        } else {
          totalPoints = activity.max_score || 0;
        }
        
        if (activityType === 'coding') {
        // Render dedicated coding preview
        try {
          console.log('🔍 [CODING PREVIEW] Rendering coding preview, activity:', {
            id: activity.id,
            title: activity.title,
            required_construct: activity.required_construct,
            instructions: activity.instructions ? JSON.parse(activity.instructions) : null,
            state_requiredConstruct: state.requiredConstruct
          });
          body.innerHTML = renderCodingPreview(activity);
          if (body) { try { body.scrollTop = prevScrollTop; } catch(_){ } }
        } catch (renderError) {
          console.error('🔍 [CODING PREVIEW] Error rendering coding preview:', renderError);
          console.error('🔍 [CODING PREVIEW] Error stack:', renderError.stack);
          if (body) {
            body.innerHTML = `
              <div style="text-align:center;padding:40px;color:#dc3545;">
                <h3 style="color:#dc3545;margin-bottom:16px;">⚠️ Error Rendering Coding Preview</h3>
                <p style="color:#666;margin-bottom:16px;">${renderError.message || 'Unknown error'}</p>
                <button onclick="window.createActivityState.viewMode = 'edit'; window.dispatchEvent(new CustomEvent('createActivityRender'));" 
                        style="background:#28a745;color:white;border:none;padding:10px 20px;border-radius:6px;margin-top:16px;cursor:pointer;">
                  Switch to Edit Mode
                </button>
              </div>
            `;
          }
        }
        // Ensure Monaco initializes (avoid relying on inline <script> execution)
        setTimeout(function(){
          try {
            const container = document.getElementById('previewMonacoContainer');
            const textarea = document.getElementById('previewCodeTextarea');
            if (container && textarea) {
              loadMonacoEditor().then(function(){
                if (window.monaco && window.monaco.editor) {
                  const existing = window.__previewEditor; if (existing && typeof existing.dispose === 'function') existing.dispose();
                  const lang = (function(){ try { const meta = JSON.parse(activity.instructions||'{}'); return (meta.language||'cpp'); } catch(_){ return 'cpp'; } })();
                  const editor = window.monaco.editor.create(container, {
                    value: textarea.value,
                    language: String(lang||'cpp').toLowerCase(),
                    theme: 'vs',
                    fontSize: 14,
                    automaticLayout: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    lineNumbers: 'on'
                  });
                  editor.onDidChangeModelContent(function(){ textarea.value = editor.getValue(); });
                  window.__previewEditor = editor;
                  try { textarea.style.display = 'none'; } catch(_){ }
                } else {
                  // Fallback: show textarea
                  textarea.style.display = 'block';
                }
              }).catch(function(){ if (textarea) textarea.style.display='block'; });
            }
          } catch(_){ }
        }, 0);
        if (body) { try { body.scrollTop = prevScrollTop; } catch(_){ } }
        return;
      }
      

      // Use the same Try Answering modal as teacher/student
      console.log('🔍 DEBUG: Checking cleanActivitySystem availability:', {
        cleanActivitySystem: !!window.cleanActivitySystem,
        showTryAnswering: !!(window.cleanActivitySystem && window.cleanActivitySystem.showTryAnswering),
        editActivityId: state.editActivityId,
        activityId: state.editActivityId || 0
      });
      
      if (window.cleanActivitySystem && window.cleanActivitySystem.showTryAnswering) {
        const activityId = state.editActivityId || 0;
        console.log('🔍 DEBUG: Attempting to use shared modal with activityId:', activityId);
        if (activityId > 0) {
          window.cleanActivitySystem.showTryAnswering(activityId, activity.title, { preview: true });
          return;
        } else {
          console.log('🔍 DEBUG: ActivityId is 0, falling back to custom preview');
        }
      } else {
        console.log('🔍 DEBUG: cleanActivitySystem not available, falling back to custom preview');
      }
      // Fallback to custom preview if cleanActivitySystem not available
      body.innerHTML = `
        <div style="background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden;display:flex;flex-direction:column;min-height:60vh;">
          <!-- Test Header (match student modal) -->
          <div style="background:linear-gradient(135deg, #28a745 0%, #20c997 100%);color:white;padding:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <h2 style="margin:0;font-size:24px;font-weight:600;">${activity.title}</h2>
              <div style="text-align:right;">
                <div style="font-size:14px;opacity:0.9;">Total Points</div>
                <div style="font-size:20px;font-weight:700;">${totalPoints}</div>
              </div>
            </div>
            <div style="display:flex;gap:20px;font-size:14px;opacity:0.9;">
              <span>📝 ${getActivityTypeDisplay(activityType)}</span>
              <span>⏱️ No time limit</span>
              <span>📊 ${activity.questions ? activity.questions.length : 0} question${(activity.questions ? activity.questions.length : 0) !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          <!-- Instructions (match student modal) -->
          ${(() => {
            // CRITICAL: Parse instructions JSON to extract actual instructions text
            let instructionsText = state.displayInstructions || state.instructionsText || '';
            if (instructionsText && typeof instructionsText === 'string') {
              try {
                // Try to parse as JSON (e.g., {"kind":"multiple_choice","instructions":"..."})
                const parsed = JSON.parse(instructionsText);
                if (parsed && typeof parsed === 'object' && parsed.instructions) {
                  instructionsText = parsed.instructions;
                }
              } catch (e) {
                // Not JSON, use as-is
              }
            }
            return instructionsText ? `
            <div style="padding:20px;border-bottom:1px solid #e9ecef;background:#f8f9fa;">
              <h3 style="margin:0 0 12px 0;color:#333;font-size:16px;">📋 Instructions</h3>
              <p style="margin:0;color:#555;line-height:1.6;">${instructionsText}</p>
            </div>
          ` : '';
          })()}
          
          <!-- Progress Bar (hidden for upload-based activities like teacher side) -->
          ${activityType !== 'upload_based' ? `
          <div id="progress-section" style="padding:12px 16px;background:#f8f9fa;border-bottom:1px solid #e9ecef;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="font-size:14px;color:#333;font-weight:600;">⭐ Progress</span>
              <div style="display:flex;gap:20px;align-items:center;">
                <span id="progress-counter" style="font-size:14px;color:#28a745;font-weight:600;">0 / ${activity.questions ? activity.questions.length : 0} answered</span>
                <span id="timer" style="font-size:14px;color:#6c757d;font-weight:600;">⏱️ 00:00</span>
                  </div>
              </div>
            <div style="background:#e9ecef;border-radius:10px;height:6px;overflow:hidden;">
              <div id="progress-bar" style="background:linear-gradient(135deg, #28a745 0%, #20c997 100%);height:100%;width:0%;transition:width 0.3s ease;"></div>
              </div>
            </div>
          ` : ''}
            
          <!-- Main content -->
          <div style="flex:1;overflow:auto;padding:24px;">
              <style>
              /* Hide any check/x icons in question headers */
              [id^="question-"] h3::before,
              [id^="question-"] h3::after,
              [id^="question-"] h3 i,
              [id^="question-"] h3 .fa-check,
              [id^="question-"] h3 .fa-times,
              [id^="question-"] h3 .fa-check-circle,
              [id^="question-"] h3 .fa-times-circle {
                display: none !important;
              }
              </style>
              ${activity.questions && activity.questions.length > 0 ? 
                renderProfessionalTestQuestions(activity, activityType) : 
                `
              <div style=\"text-align:center;padding:40px;color:#6c757d;\">No Questions Added</div>
              `}
          </div>

          <!-- No pagination - show all questions at once like teacher side -->

          <!-- Sticky submit (match student modal) -->
              ${activity.questions && activity.questions.length > 0 ? `
          <div id="submitSection" style="position:sticky;bottom:0;padding:15px 25px;background:#f8f9fa;border-top:1px solid #e9ecef;z-index:5;">
            <div style="display:flex;justify-content:space-between;align-items:center;max-width:1100px;margin:0 auto;">
                  <div>
                <div style="font-size:13px;color:#6c757d;margin-bottom:2px;">Ready to submit?</div>
                <div style="font-size:11px;color:#6c757d;">Make sure you've answered all questions</div>
                  </div>
              <div style="display:flex;gap:12px;">
                ${activityType !== 'coding' && activityType !== 'upload_based' && activityType !== 'essay' ? `
                <button id="preview-test-btn" style="background:linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);color:white;border:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 2px 4px rgba(14,165,233,0.3);" onclick="window.testPreviewActivity('${activityType}')">
                  <i class="fas fa-check-circle"></i> Test
                </button>
                ` : activityType === 'essay' || activityType === 'upload_based' ? `
                <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:6px;padding:10px 16px;font-size:12px;color:#856404;">
                  <i class="fas fa-info-circle"></i> This activity requires manual grading by the teacher.
                </div>
                ` : ''}
                <button id="finish-attempt-btn" style="background:linear-gradient(135deg, #28a745 0%, #20c997 100%);color:white;border:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 2px 4px rgba(40,167,69,0.3);" onclick="window.finishPreviewAttempt()">Finish Attempt</button>
              </div>
                </div>
              </div>
              ` : ''}
        </div>
      `;
      if (body) { try { body.scrollTop = prevScrollTop; } catch(_){ } }
      
      // Initialize interactive features
      setTimeout(() => {
        try {
            // Initialize progress tracking for fallback preview (only for non-upload activities)
            if (activityType !== 'upload_based') {
              initializePreviewProgressTracking();
              // Note: updatePreviewProgress() is now called inside initializePreviewProgressTracking()
              // No need to call window.updateProgress() here as it uses DOM queries which may be inaccurate
            }
          } catch (e) {
            console.error('Error initializing preview features:', e);
          }
      }, 100);
      
      return;
      } // End of continuePreviewRender function
    } // End of else block (non-coding activities)
    return; // Exit preview mode - don't render the form
    } // End of preview mode block

    body.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr;gap:16px;">
        <!-- STEP 1: Lecture or Laboratory -->
        <div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">
          <div style="font-weight:600;margin-bottom:12px;color:#333;">Step 1 · Choose Activity Type</div>
          <div style="display:flex;gap:12px;">
            <label class="ca-radio-tile" style="flex:1;border:2px solid ${state.type==='lecture'?'#28a745':'#e3e6ea'};border-radius:8px;padding:16px;cursor:pointer;background:${state.type==='lecture'?'#f8fff9':'white'};transition:all 0.2s;">
              <input type="radio" name="cafType" value="lecture" ${state.type==='lecture'?'checked':''} style="margin-right:8px;" />
              <div style="font-weight:600;color:#333;margin-bottom:4px;">📚 Lecture</div>
              <div style="font-size:13px;color:#666;">Interactive lessons with questions and assessments</div>
            </label>
            <label class="ca-radio-tile" style="flex:1;border:2px solid ${state.type==='laboratory'?'#28a745':'#e3e6ea'};border-radius:8px;padding:16px;cursor:pointer;background:${state.type==='laboratory'?'#f8fff9':'white'};transition:all 0.2s;">
              <input type="radio" name="cafType" value="laboratory" ${state.type==='laboratory'?'checked':''} style="margin-right:8px;" />
              <div style="font-weight:600;color:#333;margin-bottom:4px;">🔬 Laboratory</div>
              <div style="font-size:13px;color:#666;">Hands-on coding exercises and practical work</div>
            </label>
          </div>
        </div>
        
        <!-- STEP 2: Activity Name -->
        <div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">
          <div style="font-weight:600;margin-bottom:12px;color:#333;">Step 2 · Activity Name <span style="color:red;">*</span></div>
          <input id="cafName" type="text" class="modal-input" placeholder="Enter activity name (e.g., Introduction to Variables)" value="${((currentState && currentState.name)||'').replace(/"/g,'&quot;')}" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;font-size:14px;" required />
        </div>
        
        <!-- STEP 3: Activity Type Dropdown -->
        <div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">
          <div style="font-weight:600;margin-bottom:12px;color:#333;">Step 3 · Activity Type</div>
          <select id="cafActivityType" class="modal-input" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;font-size:14px;background:white;">
            <option value="">Select activity type...</option>
            <option value="multiple_choice" ${state.questionType==='multiple_choice'?'selected':''}>📝 Multiple Choice</option>
            <option value="identification" ${state.questionType==='identification'?'selected':''}>🔍 Identification</option>
            <option value="true_false" ${state.questionType==='true_false'?'selected':''}>✅ True/False</option>
            <option value="essay" ${state.questionType==='essay'?'selected':''}>📄 Essay</option>
            <option value="upload_based" ${state.questionType==='upload_based'?'selected':''}>📎 Upload-based</option>
            ${state.type === 'laboratory' ? `<option value="coding" ${state.questionType==='coding'?'selected':''}>💻 Coding Exercise</option>` : ''}
          </select>
          <div style="margin-top:8px;font-size:12px;color:#666;">
            Current selection: <strong>${state.questionType || 'None'}</strong>
            ${state.type === 'laboratory' ? '<br><span style="color: #28a745;">💡 Laboratory automatically selects Coding Exercise</span>' : ''}
          </div>
        </div>
        
        <!-- Instructions Only -->
        <div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">
          <div style="font-weight:600;margin-bottom:12px;color:#333;">Instructions</div>
          <textarea id="cafInstr" class="modal-input" rows="4" placeholder="Enter instructions for students..." style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;font-size:14px;resize:vertical;">${state.instructionsText||''}</textarea>
        </div>
        
        <!-- Dynamic Fields Based on Activity Type -->
        ${(() => {
          // Normalize deprecated type 'matching' to 'multiple_choice'
          if (state.questionType === 'matching') { state.questionType = 'multiple_choice'; }
          if (state.questionType === 'multiple_choice') {
            return `
            <div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">
              <div style="font-weight:600;margin-bottom:12px;color:#333;">📝 Multiple Choice Questions</div>
              <div id="cafQList">
                ${state.questions.map((q, index) => `
                  <div class="question-item" style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;margin-bottom:16px;background:white;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                      <h4 style="margin:0;color:#333;">Question ${index + 1}</h4>
                      <button class="action-btn btn-red" onclick="deleteQuestion(${index})" style="padding:8px 12px;font-size:12px;">Delete question</button>
                    </div>
                    
                    <div style="margin-bottom:16px;">
                      <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Question Text:</label>
                      <textarea class="modal-input" rows="3" placeholder="Enter your question here..." onchange="updateQuestion(${index}, 'text', this.value)" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;">${q.text || ''}</textarea>
                    </div>
                    
                    <div style="margin-bottom:16px;">
                      <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Score for this question:</label>
                      <input type="number" class="modal-input" min="1" value="${q.points || 1}" style="max-width:100px;padding:8px;border:1px solid #ddd;border-radius:6px;" onchange="updateQuestion(${index}, 'points', this.value)" />
                    </div>
                    
                    <div>
                      <label style="display:block;margin-bottom:8px;font-weight:500;color:#333;">Choices (Select the correct answer):</label>
                      <div id="choices-${index}">
                        ${(q.choices || []).map((choice, choiceIndex) => `
                          <div class="choice-item" style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding:12px;background:#f8f9fa;border-radius:6px;border:1px solid #e3e6ea;">
                            <input type="radio" name="correct-${index}" value="${choiceIndex}" ${choice.correct ? 'checked' : ''} onchange="updateChoice(${index}, ${choiceIndex}, 'correct', this.checked)" style="margin-right:8px;" />
                            <span style="font-weight:600;color:#333;min-width:20px;">${String.fromCharCode(65 + choiceIndex)}.</span>
                            <input type="text" class="modal-input" value="${choice.text || ''}" placeholder="Enter choice text..." style="flex:1;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;" onchange="updateChoice(${index}, ${choiceIndex}, 'text', this.value)" />
                            <button class="action-btn btn-red" onclick="deleteChoice(${index}, ${choiceIndex})" style="padding:8px 12px;font-size:12px;">Delete</button>
                          </div>
                        `).join('')}
                      </div>
                      <button class="action-btn btn-green" onclick="addChoice(${index})" style="margin-top:8px;padding:10px 16px;font-size:14px;">+ Add Choice</button>
                    </div>
                  </div>
                `).join('')}
              </div>
              <button class="action-btn btn-green" id="cafAddQ" style="margin-top:12px;padding:10px 16px;font-size:14px;">+ Add Question</button>
            </div>
            `;
          } else if (state.questionType === 'identification') {
            return `
            <div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">
              <div style="font-weight:600;margin-bottom:12px;color:#333;">🔍 Identification Questions</div>
              <div id="cafQList">
                ${state.questions.map((q, index) => `
                  <div class="question-item" style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;margin-bottom:16px;background:white;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                      <h4 style="margin:0;color:#333;">Question ${index + 1}</h4>
                      <button class="action-btn btn-red" onclick="deleteQuestion(${index})" style="padding:8px 12px;font-size:12px;">Delete question</button>
                    </div>
                    
                    <div style="margin-bottom:16px;">
                      <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Question Text:</label>
                      <textarea class="modal-input" rows="3" placeholder="Enter your question here..." onchange="updateQuestion(${index}, 'text', this.value)" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;">${q.text || ''}</textarea>
                    </div>
                    
                    <div style="margin-bottom:16px;">
                      <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Score for this question:</label>
                      <input type="number" class="modal-input" min="1" value="${q.points || 1}" style="max-width:100px;padding:8px;border:1px solid #ddd;border-radius:6px;" onchange="updateQuestion(${index}, 'points', this.value)" />
                    </div>
                    
                    <div style="margin-bottom:16px;">
                      <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Primary Correct Answer:</label>
                      <input type="text" class="modal-input" value="${q.answer || q.explanation || ''}" placeholder="Enter the primary correct answer..." onchange="updateQuestion(${index}, 'answer', this.value)" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;" />
                    </div>
                    <div>
                      <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Alternative Answers (Optional):</label>
                      <textarea class="modal-input" rows="2" placeholder="Enter alternative acceptable answers, one per line (e.g., Lexer&#10;Lexical Analyzer&#10;Lexical Analysis)" onchange="updateQuestion(${index}, 'alternativeAnswers', this.value)" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;resize:vertical;">${(q.alternativeAnswers || []).join('\n') || ''}</textarea>
                      <div style="margin-top:4px;font-size:11px;color:#666;">Separate multiple acceptable answers with new lines. All will be accepted as correct.</div>
                    </div>
                  </div>
                `).join('')}
              </div>
              <button class="action-btn btn-green" id="cafAddQ" style="margin-top:12px;padding:10px 16px;font-size:14px;">+ Add Question</button>
            </div>
            `;
          } else if (state.questionType === 'essay') {
            return `
            <div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">
              <div style="font-weight:600;margin-bottom:12px;color:#333;">📄 Essay Questions</div>
              <div id="cafQList">
                ${state.questions.map((q, index) => `
                  <div class="question-item" style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;margin-bottom:16px;background:white;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                      <h4 style="margin:0;color:#333;">Question ${index + 1}</h4>
                      <button class="action-btn btn-red" onclick="deleteQuestion(${index})" style="padding:8px 12px;font-size:12px;">Delete question</button>
                    </div>
                    
                    <div style="margin-bottom:16px;">
                      <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Question Text:</label>
                      <textarea class="modal-input" rows="3" placeholder="Enter your question here..." onchange="updateQuestion(${index}, 'text', this.value)" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;">${q.text || ''}</textarea>
                    </div>
                    
                    <div style="margin-bottom:16px;">
                      <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Score for this question:</label>
                      <input type="number" class="modal-input" min="1" value="${q.points || 1}" style="max-width:100px;padding:8px;border:1px solid #ddd;border-radius:6px;" onchange="updateQuestion(${index}, 'points', this.value)" />
                    </div>
                    
                    <div>
                      <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Expected Answer (for reference):</label>
                      <textarea class="modal-input" rows="4" placeholder="Enter expected answer or key points..." onchange="updateQuestion(${index}, 'answer', this.value)" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;">${q.answer || q.explanation || ''}</textarea>
                    </div>
                  </div>
                `).join('')}
              </div>
              <button class="action-btn btn-green" id="cafAddQ" style="margin-top:12px;padding:10px 16px;font-size:14px;">+ Add Question</button>
            </div>
            `;
          } else if (state.questionType === 'upload_based') {
            return `
            <div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">
              <div style="font-weight:600;margin-bottom:12px;color:#333;">📎 Upload-based Activity</div>
              
              <!-- Upload Questions -->
              <div style="margin-bottom:20px;">
                <div style="font-weight:600;margin-bottom:12px;color:#333;">📎 Upload Tasks</div>
                <div id="cafQList">
                  ${state.questions.map((q, index) => `
                    <div class="question-item" style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;margin-bottom:16px;background:white;">
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                        <h4 style="margin:0;color:#333;">Upload Task ${index + 1}</h4>
                        <button class="action-btn btn-red" onclick="deleteQuestion(${index})" style="padding:8px 12px;font-size:12px;">Delete task</button>
                      </div>
                      
                      <div style="margin-bottom:16px;">
                        <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Task Description:</label>
                        <textarea class="modal-input" rows="3" placeholder="Describe what students need to upload..." onchange="updateQuestion(${index}, 'text', this.value)" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;">${q.text || ''}</textarea>
                      </div>
                      
                      <div style="margin-bottom:16px;">
                        <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Score for this task:</label>
                        <input type="number" class="modal-input" min="1" value="${q.points || 1}" style="max-width:100px;padding:8px;border:1px solid #ddd;border-radius:6px;" onchange="updateQuestion(${index}, 'points', this.value)" />
                      </div>
                      
                      <div style="margin-bottom:16px;">
                        <label style="display:block;margin-bottom:8px;font-weight:500;color:#333;">Accepted File Types:</label>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:6px;">
                          <label style="display:flex;align-items:center;gap:6px;padding:6px;border:1px solid #ddd;border-radius:4px;cursor:pointer;background:white;font-size:12px;">
                            <input type="checkbox" ${(q.acceptedFiles||[]).includes('PDF')?'checked':''} onchange="updateQuestionFileTypes(${index}, 'PDF', this.checked)" style="margin:0;" />
                            <span>📄 PDF</span>
                          </label>
                          <label style="display:flex;align-items:center;gap:6px;padding:6px;border:1px solid #ddd;border-radius:4px;cursor:pointer;background:white;font-size:12px;">
                            <input type="checkbox" ${(q.acceptedFiles||[]).includes('DOCX')?'checked':''} onchange="updateQuestionFileTypes(${index}, 'DOCX', this.checked)" style="margin:0;" />
                            <span>📝 DOCX</span>
                          </label>
                          <label style="display:flex;align-items:center;gap:6px;padding:6px;border:1px solid #ddd;border-radius:4px;cursor:pointer;background:white;font-size:12px;">
                            <input type="checkbox" ${(q.acceptedFiles||[]).includes('PPTX')?'checked':''} onchange="updateQuestionFileTypes(${index}, 'PPTX', this.checked)" style="margin:0;" />
                            <span>📊 PPTX</span>
                          </label>
                          <label style="display:flex;align-items:center;gap:6px;padding:6px;border:1px solid #ddd;border-radius:4px;cursor:pointer;background:white;font-size:12px;">
                            <input type="checkbox" ${(q.acceptedFiles||[]).includes('JPG')?'checked':''} onchange="updateQuestionFileTypes(${index}, 'JPG', this.checked)" style="margin:0;" />
                            <span>🖼️ JPG</span>
                          </label>
                          <label style="display:flex;align-items:center;gap:6px;padding:6px;border:1px solid #ddd;border-radius:4px;cursor:pointer;background:white;font-size:12px;">
                            <input type="checkbox" ${(q.acceptedFiles||[]).includes('PNG')?'checked':''} onchange="updateQuestionFileTypes(${index}, 'PNG', this.checked)" style="margin:0;" />
                            <span>🖼️ PNG</span>
                          </label>
                          <label style="display:flex;align-items:center;gap:6px;padding:6px;border:1px solid #ddd;border-radius:4px;cursor:pointer;background:white;font-size:12px;">
                            <input type="checkbox" ${(q.acceptedFiles||[]).includes('TXT')?'checked':''} onchange="updateQuestionFileTypes(${index}, 'TXT', this.checked)" style="margin:0;" />
                            <span>📄 TXT</span>
                          </label>
                          <label style="display:flex;align-items:center;gap:6px;padding:6px;border:1px solid #ddd;border-radius:4px;cursor:pointer;background:white;font-size:12px;">
                            <input type="checkbox" ${(q.acceptedFiles||[]).includes('ZIP')?'checked':''} onchange="updateQuestionFileTypes(${index}, 'ZIP', this.checked)" style="margin:0;" />
                            <span>📦 ZIP</span>
                          </label>
                          <label style="display:flex;align-items:center;gap:6px;padding:6px;border:1px solid #ddd;border-radius:4px;cursor:pointer;background:white;font-size:12px;">
                            <input type="checkbox" ${(q.acceptedFiles||[]).includes('XML')?'checked':''} onchange="updateQuestionFileTypes(${index}, 'XML', this.checked)" style="margin:0;" />
                            <span>📄 XML</span>
                          </label>
                          <label style="display:flex;align-items:center;gap:6px;padding:6px;border:1px solid #ddd;border-radius:4px;cursor:pointer;background:white;font-size:12px;">
                            <input type="checkbox" ${(q.acceptedFiles||[]).includes('GIF')?'checked':''} onchange="updateQuestionFileTypes(${index}, 'GIF', this.checked)" style="margin:0;" />
                            <span>🖼️ GIF</span>
                          </label>
                          <label style="display:flex;align-items:center;gap:6px;padding:6px;border:1px solid #ddd;border-radius:4px;cursor:pointer;background:white;font-size:12px;">
                            <input type="checkbox" ${(q.acceptedFiles||[]).includes('BMP')?'checked':''} onchange="updateQuestionFileTypes(${index}, 'BMP', this.checked)" style="margin:0;" />
                            <span>🖼️ BMP</span>
                          </label>
                          <label style="display:flex;align-items:center;gap:6px;padding:6px;border:1px solid #ddd;border-radius:4px;cursor:pointer;background:white;font-size:12px;">
                            <input type="checkbox" ${(q.acceptedFiles||[]).includes('SVG')?'checked':''} onchange="updateQuestionFileTypes(${index}, 'SVG', this.checked)" style="margin:0;" />
                            <span>🎨 SVG</span>
                          </label>
                        </div>
                      </div>
                      
                      <div style="margin-bottom:16px;">
                        <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Maximum File Size (MB):</label>
                        <input type="number" class="modal-input" min="1" max="100" value="${q.maxFileSize || 10}" style="max-width:100px;padding:8px;border:1px solid #ddd;border-radius:6px;" onchange="updateQuestionMaxFileSize(${index}, this.value)" />
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <div style="background:#e8f4fd;border:1px solid #b3d9ff;border-radius:6px;padding:12px;margin-top:16px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                  <i class="fas fa-info-circle" style="color:#0066cc;"></i>
                  <span style="font-weight:500;color:#0066cc;">Upload-based Activity</span>
                </div>
                <p style="margin:0;font-size:13px;color:#555;">Students will upload files for manual grading. Teachers can set due dates and review submissions through the teacher dashboard.</p>
              </div>
              <button class="action-btn btn-green" id="cafAddQ" style="margin-top:12px;padding:10px 16px;font-size:14px;">+ Add Upload Task</button>
            </div>
            `;
          } else if (state.questionType === 'true_false') {
            return `
            <div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">
              <div style="font-weight:600;margin-bottom:12px;color:#333;">✅ True/False Questions</div>
              <div id="cafQList">
                ${state.questions.map((q, index) => `
                  <div class="question-item" style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;margin-bottom:16px;background:white;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                      <h4 style="margin:0;color:#333;">Question ${index + 1}</h4>
                      <button class="action-btn btn-red" onclick="deleteQuestion(${index})" style="padding:8px 12px;font-size:12px;">Delete question</button>
                    </div>
                    
                    <div style="margin-bottom:16px;">
                      <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Question Text:</label>
                      <textarea class="modal-input" rows="3" placeholder="Enter your statement here..." onchange="updateQuestion(${index}, 'text', this.value)" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;">${q.text || ''}</textarea>
                    </div>
                    
                    <div style="margin-bottom:16px;">
                      <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Score for this question:</label>
                      <input type="number" class="modal-input" min="1" value="${q.points || 1}" style="max-width:100px;padding:8px;border:1px solid #ddd;border-radius:6px;" onchange="updateQuestion(${index}, 'points', this.value)" />
                    </div>
                    
                    <div style="margin-bottom:16px;">
                      <label style="display:block;margin-bottom:8px;font-weight:500;color:#333;">Correct Answer:</label>
                      <div style="display:flex;gap:16px;">
                        <label style="display:flex;align-items:center;gap:8px;padding:12px;border:1px solid #ddd;border-radius:6px;cursor:pointer;background:white;flex:1;">
                          <input type="radio" name="correct-${index}" value="true" ${q.answer === 'true' ? 'checked' : ''} onchange="updateQuestion(${index}, 'answer', 'true')" style="margin:0;" />
                          <span style="font-weight:500;color:#333;">True</span>
                        </label>
                        <label style="display:flex;align-items:center;gap:8px;padding:12px;border:1px solid #ddd;border-radius:6px;cursor:pointer;background:white;flex:1;">
                          <input type="radio" name="correct-${index}" value="false" ${q.answer === 'false' ? 'checked' : ''} onchange="updateQuestion(${index}, 'answer', 'false')" style="margin:0;" />
                          <span style="font-weight:500;color:#333;">False</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Explanation (optional):</label>
                      <textarea class="modal-input" rows="2" placeholder="Explain why this statement is true or false..." onchange="updateQuestion(${index}, 'explanation', this.value)" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;">${q.explanation || ''}</textarea>
                    </div>
                  </div>
                `).join('')}
              </div>
              <button class="action-btn btn-green" id="cafAddQ" style="margin-top:12px;padding:10px 16px;font-size:14px;">+ Add Question</button>
            </div>
            `;
          } else if (state.questionType === 'matching') {
            return `
            <div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">
              <div style="font-weight:600;margin-bottom:12px;color:#333;">🔗 Matching Questions</div>
              <div id="cafQList">
                ${state.questions.map((q, index) => `
                  <div class="question-item" style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;margin-bottom:16px;background:white;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                      <h4 style="margin:0;color:#333;">Question ${index + 1}</h4>
                      <button class="action-btn btn-red" onclick="deleteQuestion(${index})" style="padding:8px 12px;font-size:12px;">Delete question</button>
                    </div>
                    
                    <div style="margin-bottom:16px;">
                      <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Question Text:</label>
                      <textarea class="modal-input" rows="3" placeholder="Enter your question here..." onchange="updateQuestion(${index}, 'text', this.value)" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;">${q.text || ''}</textarea>
                    </div>
                    
                    <div style="margin-bottom:16px;">
                      <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Score for this question:</label>
                      <input type="number" class="modal-input" min="1" value="${q.points || 1}" style="max-width:100px;padding:8px;border:1px solid #ddd;border-radius:6px;" onchange="updateQuestion(${index}, 'points', this.value)" />
                    </div>
                    
                    <div style="margin-bottom:16px;">
                      <label style="display:block;margin-bottom:8px;font-weight:500;color:#333;">Matching Pairs:</label>
                      <div id="matching-pairs-${index}">
                        ${(q.matchingPairs || []).map((pair, pairIndex) => `
                          <div class="matching-pair" style="display:flex;gap:12px;align-items:center;margin-bottom:12px;padding:12px;background:#f8f9fa;border-radius:6px;border:1px solid #e3e6ea;">
                            <div style="flex:1;">
                              <label style="display:block;margin-bottom:4px;font-size:12px;color:#666;font-weight:500;">Left Item:</label>
                              <input type="text" class="modal-input" value="${pair.left || ''}" placeholder="Enter left item..." onchange="updateMatchingPair(${index}, ${pairIndex}, 'left', this.value)" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
                            </div>
                            <div style="flex:1;">
                              <label style="display:block;margin-bottom:4px;font-size:12px;color:#666;font-weight:500;">Right Item:</label>
                              <input type="text" class="modal-input" value="${pair.right || ''}" placeholder="Enter right item..." onchange="updateMatchingPair(${index}, ${pairIndex}, 'right', this.value)" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
                            </div>
                            <button class="action-btn btn-red" onclick="deleteMatchingPair(${index}, ${pairIndex})" style="padding:8px 12px;font-size:12px;">Delete</button>
                          </div>
                        `).join('')}
                      </div>
                      <button class="action-btn btn-green" onclick="addMatchingPair(${index})" style="margin-top:8px;padding:10px 16px;font-size:14px;">+ Add Matching Pair</button>
                    </div>
                  </div>
                `).join('')}
              </div>
              <button class="action-btn btn-green" id="cafAddQ" style="margin-top:12px;padding:10px 16px;font-size:14px;">+ Add Question</button>
            </div>
            `;
          } else if (state.questionType === 'coding' || state.type === 'laboratory') {
            return `
            <div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">
              <div style="font-weight:600;margin-bottom:16px;color:#333;">💻 Coding Exercise Configuration</div>
              
              <!-- Programming Language Selection -->
              <div style="margin-bottom:20px;">
                <label style="display:block;margin-bottom:8px;font-weight:600;color:#333;">Programming Language *</label>
                <select id="cafLang" class="modal-input" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;font-size:14px;background:white;">
                  <option value="">Select programming language...</option>
                  <option value="java" ${(currentState && currentState.language)==='java'?'selected':''}>☕ Java</option>
                  <option value="python" ${(currentState && currentState.language)==='python'?'selected':''}>🐍 Python</option>
                  <option value="cpp" ${(currentState && currentState.language)==='cpp'?'selected':''}>⚡ C++</option>
                </select>
              </div>

              <!-- Required Construct -->
              <div style="margin-bottom:20px;">
                <label style="display:block;margin-bottom:8px;font-weight:600;color:#333;">Required Construct (Optional)</label>
                <select id="cafRequiredConstruct" class="modal-input" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;font-size:14px;background:white;">
                  <option value="" ${!currentState.requiredConstruct?'selected':''}>None</option>
                  <option value="if_else" ${currentState.requiredConstruct==='if_else'?'selected':''}>if / else</option>
                  <option value="while" ${currentState.requiredConstruct==='while'?'selected':''}>while</option>
                  <option value="for" ${currentState.requiredConstruct==='for'?'selected':''}>for</option>
                  <option value="do_while" ${currentState.requiredConstruct==='do_while'?'selected':''}>do...while</option>
                  <option value="switch" ${currentState.requiredConstruct==='switch'?'selected':''}>switch</option>
                </select>
                <div style="margin-top:4px;font-size:12px;color:#666;">If set, students must use this construct; otherwise their score is gated.</div>
              </div>
              
              <!-- Problem Statement -->
              <div style="margin-bottom:20px;">
                <label style="display:block;margin-bottom:8px;font-weight:600;color:#333;">Problem Statement *</label>
                <textarea id="cafProblem" class="modal-input" rows="5" placeholder="Describe the coding problem, requirements, and what students need to implement..." style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;font-size:14px;resize:vertical;">${(currentState && currentState.problemStatement) || ''}</textarea>
                <div style="margin-top:4px;font-size:12px;color:#666;">Provide clear instructions and requirements for the coding task</div>
              </div>
              
              <!-- Difficulty Level removed -->
              
              <!-- Starter Code -->
              <div style="margin-bottom:20px;">
                <label style="display:block;margin-bottom:8px;font-weight:600;color:#333;">Starter Code (Optional)</label>
                <div id="monacoContainer" style="height:300px;border:1px solid #ddd;border-radius:6px;margin-top:8px;">
                  <textarea id="cafStarterCode" class="modal-input" rows="8" placeholder="Provide starter code, function signatures, or class templates for students..." style="width:100%;height:100%;padding:12px;border:0;font-size:14px;font-family:monospace;resize:vertical;">${(currentState && currentState.starterCode) || ''}</textarea>
                </div>
                <div style="margin-top:4px;font-size:12px;color:#666;">💡 Monaco editor will load automatically. Fallback to textarea if needed.</div>
                <div style="margin-top:4px;font-size:12px;color:#666;">Include function signatures, class templates, or partial code to help students get started</div>
              </div>
              
              <!-- Expected Output -->
              <div style="margin-bottom:20px;">
                <label style="display:block;margin-bottom:8px;font-weight:600;color:#333;">Expected Output/Result</label>
                <textarea id="cafExpectedOutput" class="modal-input" rows="4" placeholder="Describe the expected output, test cases, or success criteria..." style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;font-size:14px;resize:vertical;">${(currentState && currentState.expectedOutput) || ''}</textarea>
                <div style="margin-top:4px;font-size:12px;color:#666;">Include sample outputs, test cases, or success criteria for evaluation</div>
              </div>
              <!-- Test Cases -->
              <div style="margin-bottom:20px;">
                <label style="display:block;margin-bottom:8px;font-weight:600;color:#333;">Test Cases (Optional)</label>
                <div id="testCasesContainer">
                  ${((currentState && currentState.testCases) || []).map((testCase, index) => {
                    const safeIn = (testCase.input||'').replace(/"/g,'&quot;');
                    const safeOut = (testCase.output||'').replace(/"/g,'&quot;');
                    // CRITICAL: Handle points explicitly - check for undefined, null, or empty
                    let pts = 0;
                    if (testCase.points !== null && testCase.points !== undefined && testCase.points !== '') {
                      pts = parseInt(String(testCase.points), 10);
                      if (isNaN(pts)) pts = 0;
                    }
                    console.log(`🔍 [RENDER TEMPLATE] TC ${index} - testCase.points:`, testCase.points, 'type:', typeof testCase.points, 'parsed pts:', pts, 'full testCase:', testCase);
                    return `
                    <div class="test-case" style="display:flex;gap:12px;align-items:center;margin-bottom:12px;padding:12px;background:white;border-radius:6px;border:1px solid #e3e6ea;">
                      <div style="flex:1;">
                        <label style="display:block;margin-bottom:4px;font-size:12px;color:#666;font-weight:500;">Input:</label>
                        <input type="text" class="modal-input" data-tc-index="${index}" data-tc-field="input" value="${safeIn}" placeholder="Test input..." oninput="updateTestCase(${index}, 'input', this.value)" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
                      </div>
                      <div style="flex:1;">
                        <label style="display:block;margin-bottom:4px;font-size:12px;color:#666;font-weight:500;">Expected Output:</label>
                        <input type="text" class="modal-input" data-tc-index="${index}" data-tc-field="output" value="${safeOut}" placeholder="Expected output..." oninput="updateTestCase(${index}, 'output', this.value)" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
                      </div>
                      <div style="width:110px;">
                        <label style="display:block;margin-bottom:4px;font-size:12px;color:#666;font-weight:500;">Points</label>
                        <input type="number" min="0" step="1" class="modal-input" data-tc-index="${index}" data-tc-field="points" value="${pts}" oninput="updateTestCase(${index}, 'points', this.value)" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
                      </div>
                      <div style="display:flex;align-items:center;gap:6px;">
                        <label style="font-size:12px;color:#666;">Sample</label>
                        <input type="checkbox" data-tc-index="${index}" data-tc-field="isSample" ${testCase.isSample? 'checked':''} onchange="updateTestCase(${index}, 'isSample', this.checked)" />
                      </div>
                      <button class="action-btn btn-red" onclick="deleteTestCase(${index})" style="padding:8px 12px;font-size:12px;">Delete</button>
                    </div>
                  `;
                  }).join('')}
                </div>
                <button class="action-btn btn-green" onclick="addTestCase()" style="margin-top:8px;padding:10px 16px;font-size:14px;">+ Add Test Case</button>
              </div>
              
              <!-- Scoring (Time limit removed) -->
              <div style="margin-bottom:20px;">
                  <label style="display:block;margin-bottom:8px;font-weight:600;color:#333;">Maximum Score</label>
                  <input type="number" id="cafMaxScore" class="modal-input" min="1" value="${state.maxScore || 100}" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;" />
                <div style="margin-top:4px;font-size:12px;color:#666;">💡 For coding activities, this will be auto-calculated from the sum of test case points when you save.</div>
              </div>
              
              <!-- Activity Schedule -->
              <div style="margin-bottom:20px;">
                <label style="display:block;margin-bottom:8px;font-weight:600;color:#333;">Activity Schedule</label>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div>
                    <label style="display:block;margin-bottom:4px;font-size:13px;color:#555;">Start Date & Time (When activity opens)</label>
                    <input type="datetime-local" id="cafStartAt" class="modal-input" value="${state.startAt || ''}" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;" />
                    <div style="margin-top:4px;font-size:11px;color:#999;">Leave empty to keep activity locked</div>
                  </div>
                  <div>
                    <label style="display:block;margin-bottom:4px;font-size:13px;color:#555;">End Date & Time (Deadline)</label>
                    <input type="datetime-local" id="cafDueAt" class="modal-input" value="${state.dueAt || ''}" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;" />
                    <div style="margin-top:4px;font-size:11px;color:#999;">Leave empty for no deadline</div>
                  </div>
                </div>
              </div>
              
              <!-- Additional Requirements -->
              <div style="margin-bottom:20px;">
                <label style="display:block;margin-bottom:8px;font-weight:600;color:#333;">Additional Requirements (Optional)</label>
                <textarea id="cafAdditionalReq" class="modal-input" rows="3" placeholder="Any additional requirements, constraints, or special instructions..." style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;font-size:14px;resize:vertical;">${state.additionalRequirements || ''}</textarea>
              </div>
              
              <!-- Hints (Optional) -->
              <div style="margin-bottom:20px;">
                <label style="display:block;margin-bottom:8px;font-weight:600;color:#333;">Hints (Optional)</label>
                <textarea id="cafHints" class="modal-input" rows="3" placeholder="Provide hints or tips to help students if they get stuck..." style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;font-size:14px;resize:vertical;">${state.hints || ''}</textarea>
              </div>
            </div>
            `;
          } else {
            // Rendering default activity
            return `
            <div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">
              <div style="text-align:center;padding:20px;color:#666;">
                <p style="margin:0;">Please select an activity type to see the question fields.</p>
              </div>
            </div>
            `;
          }
        })()}
      </div>`;

    // Restore scroll position after rebuilding DOM
    try { body.scrollTop = prevScrollTop; } catch(_){}
    
    body.querySelectorAll('input[name="cafType"]').forEach(function(r){ 
      r.onchange=function(){ 
        state.type=this.value;
        
        // Auto-select Coding Exercise for Laboratory
        if (state.type === 'laboratory') {
          state.questionType = 'coding';
        } else if (state.type === 'lecture') {
          state.questionType = 'multiple_choice';
        }
        
        render(); 
        if (window.__cafScheduleSave) window.__cafScheduleSave();
      }; 
    });
    
    const nameInput = body.querySelector('#cafName');
    if (nameInput) {
      // CRITICAL: Set value from currentState FIRST
      if (currentState.name && nameInput.value !== currentState.name) {
        nameInput.value = currentState.name;
        console.log('🔍 [RENDER] Set activity name to:', currentState.name);
      }
      nameInput.oninput=function(){ 
        const updateState = window.createActivityState || currentState;
        updateState.name=this.value; 
        if (window.__cafScheduleSave) window.__cafScheduleSave();
      };
    }
    
    // New activity type dropdown handler
    const activityType = body.querySelector('#cafActivityType'); 
    if (activityType){ 
      activityType.onchange=function(){ 
        state.questionType=this.value; 
        render();
        if (window.__cafScheduleSave) window.__cafScheduleSave();
      }; 
    } else {
    }
    
    const lang = body.querySelector('#cafLang'); if (lang){ 
      // CRITICAL: Set value from currentState FIRST
      const langValue = currentState.language || '';
      if (langValue && lang.value !== langValue) {
        lang.value = langValue;
        console.log('🔍 [RENDER] Set language dropdown to:', langValue);
      }
      lang.onchange=function(){ 
        const updateState = window.createActivityState || currentState;
        updateState.language=this.value; 
        if (window.__cafScheduleSave) window.__cafScheduleSave(); 
        // Update Monaco language
        updateMonacoLanguage(this.value);
      };
    }
    const rcSel = body.querySelector('#cafRequiredConstruct'); 
    if (rcSel){ 
      // CRITICAL: Set value from currentState FIRST, before attaching handler
      // Check both currentState and window.createActivityState to be absolutely sure
      const rcValueFromCurrent = currentState.requiredConstruct;
      const rcValueFromGlobal = window.createActivityState ? window.createActivityState.requiredConstruct : null;
      const rcValue = rcValueFromCurrent || rcValueFromGlobal || '';
      console.log('🔍 [RENDER] RequiredConstruct dropdown found.');
      console.log('🔍 [RENDER] currentState.requiredConstruct:', rcValueFromCurrent, 'type:', typeof rcValueFromCurrent, 'truthy:', !!rcValueFromCurrent);
      console.log('🔍 [RENDER] window.createActivityState.requiredConstruct:', rcValueFromGlobal, 'type:', typeof rcValueFromGlobal);
      console.log('🔍 [RENDER] Final rcValue to use:', rcValue, 'type:', typeof rcValue, 'truthy:', !!rcValue);
      console.log('🔍 [RENDER] CurrentState object:', currentState === window.createActivityState ? 'GLOBAL' : 'CLOSURE');
      console.log('🔍 [RENDER] Dropdown current value before setting:', rcSel.value);
      
      // CRITICAL: Set the value even if it's empty string (to clear any previous value)
      // But only set non-empty values to avoid clearing valid empty states
      if (rcValue && rcValue !== '' && rcValue !== 'null' && rcValue !== 'undefined') {
        // CRITICAL: Force set both value and selectedIndex to ensure it's applied
        rcSel.value = String(rcValue);
        const options = Array.from(rcSel.options);
        const matchingIndex = options.findIndex(opt => opt.value === String(rcValue));
        if (matchingIndex >= 0) {
          rcSel.selectedIndex = matchingIndex;
        }
        console.log('🔍 [RENDER] ✅ Set requiredConstruct dropdown to:', rcValue, 'dropdown now has:', rcSel.value, 'selectedIndex:', rcSel.selectedIndex);
      } else {
        // If currentState is empty, ensure dropdown shows "None"
        rcSel.value = '';
        rcSel.selectedIndex = 0; // First option is "None"
        console.log('🔍 [RENDER] ⚠️ RequiredConstruct is empty, setting dropdown to "None".');
        console.log('🔍 [RENDER] Debug - currentState.requiredConstruct:', currentState.requiredConstruct);
        console.log('🔍 [RENDER] Debug - window.createActivityState:', window.createActivityState ? window.createActivityState.requiredConstruct : 'NULL');
        console.log('🔍 [RENDER] Debug - CurrentState keys:', Object.keys(currentState));
      }
      
      rcSel.onchange=function(){ 
        const newValue = this.value || '';
        const updateState = window.createActivityState || currentState;
        updateState.requiredConstruct = newValue;
        console.log('🔍 [REQUIRED CONSTRUCT] Changed to:', newValue, 'state updated:', updateState.requiredConstruct);
        if (window.__cafScheduleSave) window.__cafScheduleSave(); 
      }; 
    } else {
      // Only warn if we're in coding mode - otherwise it's expected
      if (currentState.questionType === 'coding') {
        console.warn('🔍 [RENDER] RequiredConstruct dropdown not found in DOM! questionType:', currentState.questionType);
        console.warn('🔍 [RENDER] Debug: body.innerHTML length:', body ? body.innerHTML.length : 0);
        console.warn('🔍 [RENDER] Debug: Searching for #cafRequiredConstruct in body...');
        const allSelects = body.querySelectorAll('select');
        console.warn('🔍 [RENDER] Debug: Found', allSelects.length, 'select elements in body');
        allSelects.forEach((sel, i) => {
          console.warn('🔍 [RENDER] Debug: Select', i, 'id:', sel.id, 'name:', sel.name);
        });
      }
    }
    const instr = body.querySelector('#cafInstr'); if (instr){ 
      // CRITICAL: Set value from currentState FIRST
      if (currentState.instructionsText && instr.value !== currentState.instructionsText) {
        instr.value = currentState.instructionsText;
        console.log('🔍 [RENDER] Set instructions textarea to:', currentState.instructionsText.substring(0, 50) + '...');
      }
      instr.oninput=function(){ 
        const updateState = window.createActivityState || currentState;
        updateState.instructionsText=this.value; 
        if (window.__cafScheduleSave) window.__cafScheduleSave(); 
      }; 
    }
    // Coding-specific field bindings to preserve user input across re-renders
    const prob = body.querySelector('#cafProblem'); if (prob){ 
      // CRITICAL: Set value from currentState FIRST
      if (currentState.problemStatement && prob.value !== currentState.problemStatement) {
        prob.value = currentState.problemStatement;
        console.log('🔍 [RENDER] Set problem statement to:', currentState.problemStatement.substring(0, 50) + '...');
      }
      prob.oninput=function(){ 
        const updateState = window.createActivityState || currentState;
        updateState.problemStatement=this.value; 
        if (window.__cafScheduleSave) window.__cafScheduleSave(); 
      }; 
    }
    const starter = body.querySelector('#cafStarterCode'); if (starter){
      // CRITICAL: Set value from currentState FIRST
      if (currentState.starterCode && starter.value !== currentState.starterCode) {
        starter.value = currentState.starterCode;
        console.log('🔍 [RENDER] Set starter code to:', currentState.starterCode.substring(0, 50) + '...');
      }
      starter.oninput=function(){ 
        const updateState = window.createActivityState || currentState;
        updateState.starterCode=this.value; 
        if (window.__cafScheduleSave) window.__cafScheduleSave(); 
      };
      
      // Initialize Monaco editor for coding activities
      const monacoContainer = body.querySelector('#monacoContainer');
      if (monacoContainer && currentState.questionType === 'coding') {
        const language = currentState.language || 'javascript';
        const initialCode = currentState.starterCode || '';
        initMonacoEditor(monacoContainer, language, initialCode);
      }
    }
    const expect = body.querySelector('#cafExpectedOutput'); if (expect){ 
      // CRITICAL: Set value from currentState FIRST
      if (currentState.expectedOutput && expect.value !== currentState.expectedOutput) {
        expect.value = currentState.expectedOutput;
        console.log('🔍 [RENDER] Set expected output to:', currentState.expectedOutput.substring(0, 50) + '...');
      }
      expect.oninput=function(){ 
        const updateState = window.createActivityState || currentState;
        updateState.expectedOutput=this.value; 
        if (window.__cafScheduleSave) window.__cafScheduleSave(); 
      }; 
    }
    // Difficulty radios
    // Difficulty removed: no bindings required

    // bind settings
    const att = body.querySelector('#cafAttempts'); if (att) att.oninput=function(){ const n=parseInt(this.value,10); if(!isNaN(n)&&n>0) { state.quizSettings.attempts=n; if (window.__cafScheduleSave) window.__cafScheduleSave(); } };
    // Time limit removed: no binding required
    const shQ = body.querySelector('#cafShuffleQ'); if (shQ) shQ.onchange=function(){ state.quizSettings.shuffleQuestions=this.checked; };
    const shC = body.querySelector('#cafShuffleC'); if (shC) shC.onchange=function(){ state.quizSettings.shuffleChoices=this.checked; };
    const max = body.querySelector('#cafMaxScore'); if (max) { 
      // CRITICAL: Set value from currentState FIRST
      const maxScoreValue = currentState.maxScore || currentState.max_score || 100;
      if (max.value !== String(maxScoreValue)) {
        max.value = String(maxScoreValue);
        console.log('🔍 [RENDER] Set max score to:', maxScoreValue);
      }
      max.oninput=function(){ 
        const n=parseInt(this.value,10); 
        if(!isNaN(n)&&n>0){ 
          const updateState = window.createActivityState || currentState;
          updateState.maxScore=n; 
          if (window.__cafScheduleSave) window.__cafScheduleSave(); 
        }
      };
    }
    
    // Start date handler
    const startAt = body.querySelector('#cafStartAt'); if (startAt) {
      const startAtValue = currentState.startAt || currentState.start_at || '';
      // Convert datetime-local format
      if (startAtValue && startAt.value !== startAtValue) {
        // If value is in ISO format, convert to datetime-local format (YYYY-MM-DDTHH:mm)
        let dateValue = startAtValue;
        if (startAtValue.includes('T')) {
          const parts = startAtValue.split('T');
          dateValue = parts[0] + 'T' + (parts[1] || '').substring(0,5);
        } else if (startAtValue.includes(' ')) {
          const parts = startAtValue.split(' ');
          dateValue = parts[0] + 'T' + (parts[1] || '').substring(0,5);
        }
        startAt.value = dateValue;
        console.log('🔍 [RENDER] Set start date to:', dateValue);
      }
      startAt.onchange=function(){ 
        const updateState = window.createActivityState || currentState;
        updateState.startAt=this.value; 
        if (window.__cafScheduleSave) window.__cafScheduleSave();
      };
    }
    
    // Due date handler
    const dueAt = body.querySelector('#cafDueAt'); if (dueAt) {
      const dueAtValue = currentState.dueAt || currentState.due_at || '';
      // Convert datetime-local format
      if (dueAtValue && dueAt.value !== dueAtValue) {
        // If value is in ISO format, convert to datetime-local format (YYYY-MM-DDTHH:mm)
        let dateValue = dueAtValue;
        if (dueAtValue.includes('T')) {
          const parts = dueAtValue.split('T');
          dateValue = parts[0] + 'T' + (parts[1] || '').substring(0,5);
        } else if (dueAtValue.includes(' ')) {
          const parts = dueAtValue.split(' ');
          dateValue = parts[0] + 'T' + (parts[1] || '').substring(0,5);
        }
        dueAt.value = dateValue;
        console.log('🔍 [RENDER] Set due date to:', dateValue);
      }
      dueAt.onchange=function(){ 
        const updateState = window.createActivityState || currentState;
        updateState.dueAt=this.value; 
        if (window.__cafScheduleSave) window.__cafScheduleSave();
      };
    }
    const addReq = body.querySelector('#cafAdditionalReq'); if (addReq) { 
      // CRITICAL: Set value from currentState FIRST
      if (currentState.additionalRequirements && addReq.value !== currentState.additionalRequirements) {
        addReq.value = currentState.additionalRequirements;
        console.log('🔍 [RENDER] Set additional requirements to:', currentState.additionalRequirements.substring(0, 50) + '...');
      }
      addReq.oninput=function(){ 
        const updateState = window.createActivityState || currentState;
        updateState.additionalRequirements=this.value; 
        if (window.__cafScheduleSave) window.__cafScheduleSave(); 
      }; 
    }
    const hints = body.querySelector('#cafHints'); if (hints) { 
      // CRITICAL: Set value from currentState FIRST
      if (currentState.hints && hints.value !== currentState.hints) {
        hints.value = currentState.hints;
        console.log('🔍 [RENDER] Set hints to:', currentState.hints.substring(0, 50) + '...');
      }
      hints.oninput=function(){ 
        const updateState = window.createActivityState || currentState;
        updateState.hints=this.value; 
        if (window.__cafScheduleSave) window.__cafScheduleSave(); 
      }; 
    }

    // questions rendering
    const list = body.querySelector('#cafQList');
    const addQ = body.querySelector('#cafAddQ');
    if (addQ){ 
      addQ.onclick=function(){ 
        addQuestion(); 
      }; 
    } else {
    }
    
    // CRITICAL: After render completes, explicitly call renderTestCases for coding activities
    // This ensures test cases are rendered with the correct data from currentState
    if (currentState.questionType === 'coding') {
      setTimeout(() => {
        console.log('🔍 [RENDER] Calling renderTestCases() after render for coding activity');
        if (typeof renderTestCases === 'function') {
          renderTestCases();
        }
      }, 100);
    }
    } catch (e) {
      console.error('🔍 [RENDER] ❌ CRITICAL ERROR in render function:', e);
      console.error('🔍 [RENDER] Error stack:', e.stack);
      if (body) {
        body.innerHTML = `
          <div style="text-align:center;padding:40px;color:#dc3545;">
            <h3 style="color:#dc3545;margin-bottom:16px;">⚠️ Error Loading Form</h3>
            <p style="color:#666;margin-bottom:16px;">An error occurred while rendering the form.</p>
            <p style="color:#999;font-size:12px;">Error: ${e.message || 'Unknown error'}</p>
            <button onclick="window.createActivityState.viewMode = 'edit'; window.dispatchEvent(new CustomEvent('createActivityRender'));" 
                    style="background:#28a745;color:white;border:none;padding:10px 20px;border-radius:6px;margin-top:16px;cursor:pointer;">
              Try Again
            </button>
          </div>
        `;
      }
      return; // Exit render function on error
    }
  } // End of render function

  render();
  // SAFETY: Always re-attach create handler to ensure it works after save/close
  const createBtn = modal.querySelector('#cafCreate');
  if (createBtn) {
    createBtn.onclick = async function(){
    const btn = this;
    if (btn.disabled) return; // Prevent double-clicks
      
      // Re-check state exists (might be null if modal opened stale)
      if (!window.createActivityState) {
        if (typeof window.showNotification === 'function') window.showNotification('error', 'Error', 'Form state lost. Please close and reopen the form.');
        else alert('Form state lost. Please close and reopen.');
        return;
      }
      const state = window.createActivityState;
    
    // Required field validation
    const isCodingActivity = (state.questionType==='coding') || ((document.getElementById('cafActivityType')||{}).value==='coding');
    const isUploadBasedActivity = (state.questionType==='upload_based') || ((document.getElementById('cafActivityType')||{}).value==='upload_based');
    const hasName = state.name && state.name.trim().length > 0;
    const hasLanguage = !isCodingActivity || (state.language && state.language.trim().length > 0);
    const hasTestCases = !isCodingActivity || (Array.isArray(state.testCases) && state.testCases.length > 0);
    const hasUploadTasks = !isUploadBasedActivity || (Array.isArray(state.questions) && state.questions.length > 0);
    
    if (!hasName) {
      if (typeof window.showNotification === 'function') window.showNotification('error', 'Validation Error', 'Activity name is required');
      else alert('Activity name is required');
      return;
    }
    
    if (!hasLanguage) {
      if (typeof window.showNotification === 'function') window.showNotification('error', 'Validation Error', 'Programming language is required for coding activities');
      else alert('Programming language is required for coding activities');
      return;
    }
    
    if (!hasTestCases) {
      if (typeof window.showNotification === 'function') window.showNotification('error', 'Validation Error', 'At least one test case is required for coding activities');
      else alert('At least one test case is required for coding activities');
      return;
    }
    
    if (!hasUploadTasks) {
      if (typeof window.showNotification === 'function') window.showNotification('error', 'Validation Error', 'At least one upload task is required for upload-based activities');
      else alert('At least one upload task is required for upload-based activities');
      return;
    }
    
    const isEdit = !!state.editActivityId;
    btn.disabled = true;
    btn.textContent = isEdit ? 'Saving...' : 'Creating...';

    // Build single payload for activity_sync
    const isCoding = (state.questionType==='coding') || ((document.getElementById('cafActivityType')||{}).value==='coding');
    let backendType = 'multiple_choice';
    if (isCoding) backendType = 'coding';
    else {
      const qt = String(state.questionType||'').toLowerCase();
      // Persist the exact type for all supported kinds
      if (qt==='multiple_choice' || qt==='upload_based' || qt==='identification' || qt==='essay' || qt==='true_false') {
        backendType = qt;
      } else {
        backendType = 'quiz';
      }
    }

    // Ensure latest CodeMirror value is captured for coding starter code
    if (isCoding) {
      try { const starter = modal.querySelector('#cafStarterCode'); if (starter && starter.__cm) { state.starterCode = starter.__cm.getValue(); } } catch(_){ }
    }
    // Snapshot current state before building payload
    try { console.log('🔍 BUILD PAYLOAD STATE SNAPSHOT:', JSON.stringify(state)); } catch(_){ }

    const payload = {
      id: isEdit ? Number(state.editActivityId) : undefined,
      lesson_id: Number(lessonId),
      type: backendType,
      title: state.name || (isCoding ? 'Coding Exercise' : 'Activity'),
      instructions: isCoding ? JSON.stringify({
        language: (modal.querySelector('#cafLang') && modal.querySelector('#cafLang').value ? modal.querySelector('#cafLang').value : (state.language||'')).toLowerCase(),
        instructions: state.instructionsText||'',
        problemStatement: state.problemStatement||'',
        starterCode: state.starterCode||'',
        expectedOutput: state.expectedOutput || '',
        additionalRequirements: state.additionalRequirements || '',
        hints: state.hints || '',
        requiredConstruct: (modal.querySelector('#cafRequiredConstruct') && modal.querySelector('#cafRequiredConstruct').value ? modal.querySelector('#cafRequiredConstruct').value : (state.requiredConstruct || ''))
        // timeLimit removed
      }) : (function(){
        // For non-coding, persist a small JSON envelope with kind for better labeling
        const qt = String(state.questionType||'multiple_choice').toLowerCase();
        if (qt === 'upload_based') {
          return JSON.stringify({ 
            kind: 'upload_based', 
            instructions: state.instructionsText||'',
            acceptedFiles: ['PDF','DOCX','JPG','PNG','TXT','XML','SVG'],
            maxFileSize: 5
          });
        }
        const kind = (qt==='multiple_choice' ? 'multiple_choice' : (qt==='true_false' ? 'true_false' : (qt==='identification' ? 'identification' : (qt==='essay' ? 'essay' : 'quiz'))));
        return JSON.stringify({ kind: kind, instructions: state.instructionsText||'' });
      })(),
      max_score: Number(state.maxScore||100),
      start_at: state.startAt || null,
      due_at: state.dueAt || null
    };
    if (isCoding) {
      // CRITICAL: Read test case data from DOM inputs FIRST (most up-to-date), then fallback to state
      const testCasesContainer = modal.querySelector('#testCasesContainer');
      const testCasesFromDOM = [];
      if (testCasesContainer) {
        const testCaseElements = testCasesContainer.querySelectorAll('.test-case');
        console.log('🔍 [PAYLOAD] Found', testCaseElements.length, 'test case elements in DOM');
        testCaseElements.forEach((tcEl, idx) => {
          const inputEl = tcEl.querySelector('input[data-tc-field="input"]');
          const outputEl = tcEl.querySelector('input[data-tc-field="output"]');
          const pointsEl = tcEl.querySelector('input[data-tc-field="points"]');
          // CRITICAL: Use more specific selector for checkbox to ensure we get the correct element
          const sampleEl = tcEl.querySelector('input[type="checkbox"][data-tc-field="isSample"]') || tcEl.querySelector('input[data-tc-field="isSample"]');
          const input = inputEl ? inputEl.value : '';
          const output = outputEl ? outputEl.value : '';
          const points = pointsEl ? parseInt(pointsEl.value || 0, 10) : 0;
          const isSample = sampleEl ? sampleEl.checked : false;
          console.log('🔍 [PAYLOAD] DOM TC', idx, 'input:', input, 'output:', output, 'points:', points, 'isSample:', isSample, 'checkbox found:', !!sampleEl, 'checkbox checked:', isSample);
          testCasesFromDOM.push({ input, output, points, isSample });
        });
      }
      
      // Use DOM data if available, otherwise fallback to state
      const finalTestCases = testCasesFromDOM.length > 0 ? testCasesFromDOM : (Array.isArray(state.testCases) ? state.testCases : []);
      console.log('🔍 [PAYLOAD] Using', finalTestCases.length, 'test cases (DOM:', testCasesFromDOM.length, ', state:', (state.testCases || []).length, ')');
      
      // Auto-derive max_score from sum of test case points when provided
      try {
        const sumPts = finalTestCases.reduce((s, tc) => s + (parseInt(tc.points || 0, 10) || 0), 0);
        if (sumPts > 0) { 
          state.maxScore = sumPts;
          payload.max_score = sumPts;
        }
        console.log('🔍 [PAYLOAD] Calculated max_score from points:', sumPts);
      } catch(_){ }
      
      payload.test_cases = finalTestCases.map(function(tc, idx){ 
        const points = tc.points != null ? parseInt(tc.points, 10) : 0;
        const mapped = {
          is_sample: !!tc.isSample,
          input_text: tc.input || '',
          expected_output_text: tc.output || '',
          time_limit_ms: tc.timeLimitMs ? parseInt(tc.timeLimitMs, 10) : 2000,
          points: points
        };
        console.log('🔍 [PAYLOAD] Test case', idx, 'mapped:', JSON.stringify(mapped), 'original tc.points:', tc.points, 'parsed:', points);
        return mapped;
      });
      console.log('🔍 [PAYLOAD] Total test cases in payload:', payload.test_cases.length);
      // CRITICAL: Get required_construct from dropdown FIRST (most up-to-date), then fallback to state
      const rcDropdown = modal.querySelector('#cafRequiredConstruct');
      let rcValue = '';
      if (rcDropdown) {
        rcValue = rcDropdown.value || '';
        console.log('🔍 [PAYLOAD] Reading from dropdown, value:', rcValue, 'dropdown exists: YES');
        // Update state to keep it in sync
        if (rcValue !== state.requiredConstruct) {
          console.log('🔍 [PAYLOAD] Syncing state.requiredConstruct from', state.requiredConstruct, 'to', rcValue);
          state.requiredConstruct = rcValue;
        }
      } else {
        rcValue = state.requiredConstruct || '';
        console.log('🔍 [PAYLOAD] Dropdown not found in DOM! Using state:', rcValue, 'state.requiredConstruct:', state.requiredConstruct);
        console.warn('🔍 [PAYLOAD] WARNING: Required Construct dropdown not found! Form might not be fully rendered or questionType is not "coding"');
        console.log('🔍 [PAYLOAD] Debug: state.questionType =', state.questionType, ', isCoding =', isCoding);
      }
      payload.required_construct = rcValue;
      console.log('🔍 [PAYLOAD] Final required_construct:', rcValue, 'dropdown exists:', !!rcDropdown, 'state value:', state.requiredConstruct);
      console.log('🔍 [PAYLOAD] Full payload keys:', Object.keys(payload));
      console.log('🔍 [PAYLOAD] Payload.required_construct value:', payload.required_construct);
    } else {
      payload.questions = (Array.isArray(state.questions)?state.questions:[]).map(function(q){
        const qt = String(state.questionType||'multiple_choice').toLowerCase();
        const item = { text: q.text||'', points: Number(q.points||1), explanation: q.explanation || '' };
        if (qt==='essay' && !item.explanation) { item.explanation = q.answer || ''; }
        if (qt==='multiple_choice' || qt==='quiz') {
          item.choices = (Array.isArray(q.choices)?q.choices:[]).map(function(c){ return { text: c.text||'', is_correct: !!c.correct }; });
        } else if (qt==='identification') {
          item.answer = q.answer || '';
          // Store primary answer + alternatives in explanation field as JSON (new format: {"primary": "...", "alternatives": [...]})
          const primaryAnswer = String(q.answer || '').trim();
          const alternatives = Array.isArray(q.alternativeAnswers) ? q.alternativeAnswers.filter(a => a && String(a).trim()).map(a => String(a).trim()) : [];
          if (primaryAnswer || alternatives.length > 0) {
            item.explanation = JSON.stringify({
              primary: primaryAnswer,
              alternatives: alternatives
            });
          } else {
            item.explanation = '';
          }
        } else if (qt==='essay') {
          // Store expected answer into explanation column to persist
          item.explanation = (q.answer || q.explanation || '');
        } else if (qt==='true_false') {
          var ans = (String(q.answer||'').toLowerCase()==='true') ? 'true' : (String(q.answer||'').toLowerCase()==='false' ? 'false' : '');
          item.choices = [
            { text:'True', is_correct: ans==='true' },
            { text:'False', is_correct: ans==='false' }
          ];
          // Store as quiz in DB (some schemas disallow 'true_false' type)
          payload.type = 'quiz';
        } else if (qt==='upload_based') {
          // Add upload-based specific fields
          item.acceptedFiles = Array.isArray(q.acceptedFiles) ? q.acceptedFiles : ['PDF','DOCX','JPG','PNG','TXT','XML'];
          item.maxFileSize = Number(q.maxFileSize || 5);
        }
        return item;
      });
    }

    // CRITICAL: Log the full payload structure before stringifying
    try { 
      console.log('🔍 [SYNC] Full payload object keys:', Object.keys(payload));
      console.log('🔍 [SYNC] Full payload:', JSON.stringify(payload, null, 2)); 
      console.log('🔍 [SYNC] Required construct in payload:', payload.required_construct, 'type:', typeof payload.required_construct, 'hasOwnProperty:', payload.hasOwnProperty('required_construct'));
      console.log('🔍 [SYNC] Test cases in payload:', payload.test_cases);
      if (payload.test_cases) {
        payload.test_cases.forEach((tc, i) => {
          console.log(`🔍 [SYNC] TC ${i}: points=${tc.points}, is_sample=${tc.is_sample}, input="${tc.input_text}", output="${tc.expected_output_text}"`);
        });
      }
    } catch(e){ 
      console.error('🔍 [SYNC] Error logging payload:', e);
      console.log('🔍 [SYNC] Payload (object)', payload); 
    }
    let handledSuccess = false;
    const syncFd = new FormData();
    syncFd.append('action','activity_sync');
    const payloadJson = JSON.stringify(payload);
    syncFd.append('activity', payloadJson);
    console.log('🔍 [SYNC] FormData activity field (first 500 chars):', payloadJson.substring(0, 500));
    console.log('🔍 [SYNC] FormData activity field (full length):', payloadJson.length, 'chars');
    console.log('🔍 [SYNC] FormData keys:', Array.from(syncFd.keys()));
    // CRITICAL: Verify required_construct is in the JSON string
    if (payloadJson.includes('required_construct')) {
      const rcMatch = payloadJson.match(/"required_construct"\s*:\s*"([^"]*)"/);
      console.log('🔍 [SYNC] Found required_construct in JSON string:', rcMatch ? rcMatch[1] : 'NOT_FOUND');
    } else {
      console.error('🔍 [SYNC] ERROR: required_construct NOT FOUND in JSON string!');
      console.error('🔍 [SYNC] Payload JSON preview:', payloadJson.substring(0, 1000));
    }
    const fdWithCSRF = await addCSRFToken(syncFd);
    // Add timeout so we can detect stalled requests
    const controller = new AbortController();
    const timeoutId = setTimeout(function(){ try { controller.abort(); } catch(_){} }, 15000);
    fetch('course_outline_manage.php', { method:'POST', body: fdWithCSRF, credentials:'same-origin', signal: controller.signal })
      .then(function(r){ 
        return r.json().catch(function(e){ 
          return { success:false, message:'Invalid JSON' }; 
        }); 
      })
      .then(function(data){
        try { clearTimeout(timeoutId); } catch(_){}
        console.log('🔍 [SYNC RESPONSE] Server response:', data);
        if (!data || !data.success){
          var msg = (data && (data.message || data.error)) ? (String(data.message||'') + (data.error?(' - '+String(data.error)):'') ) : 'Unknown error';
          console.error('🔍 [SYNC RESPONSE] Save failed:', msg);
          if (typeof window.showNotification === 'function') window.showNotification('error', isEdit?'Update failed':'Create failed', msg);
          else alert((isEdit?'Failed to update activity: ':'Failed to create activity: ') + msg);
          btn.disabled = false;
          btn.textContent = (window.createActivityState && window.createActivityState.editActivityId) ? 'Save Changes' : 'Create Item';
          return;
        }
        handledSuccess = true;
        const actId = data.id || state.editActivityId;
        console.log('🔍 [SYNC RESPONSE] Save successful! Activity ID:', actId);
        console.log('🔍 [SYNC RESPONSE] Response data:', data.data);
        if (data.data) {
          console.log('🔍 [SYNC RESPONSE] Response required_construct:', data.data.required_construct);
          console.log('🔍 [SYNC RESPONSE] Response test_cases count:', data.data.test_cases ? data.data.test_cases.length : 0);
          if (data.data.test_cases) {
            data.data.test_cases.forEach((tc, i) => {
              console.log(`🔍 [SYNC RESPONSE] Response TC ${i}: points=${tc.points}, is_sample=${tc.is_sample}`);
            });
          }
        }
        try {
          if (typeof window.showNotification === 'function') window.showNotification('success', isEdit?'Activity updated':'Activity created', 'Item #' + actId);
        } catch(_) {}
        try { localStorage.removeItem('cr_createActivityDraft_' + String(lessonId)); } catch(_){ }
        // FULL RESET: Clear state and ensure modal is ready for next use
        if (window.createActivityState) {
          window.createActivityState = null;
        }
        // Clear any disabled state on button for next creation
        try { btn.disabled = false; btn.textContent = 'Create Item'; } catch(_){ }
        const outline = document.getElementById('courseOutlineModal');
        const prevScroll = outline ? (outline.querySelector('#outlineBody')?.scrollTop || 0) : 0;
        viewOutline();
        setTimeout(function(){ try { const b = outline?.querySelector('#outlineBody'); if (b) b.scrollTop = prevScroll; } catch(_){ } }, 0);
        // Close modal and ensure it's fully reset
        modal.style.display='none';
        // Clear modal body to prevent stale content
        try { const body = modal.querySelector('#cafBody'); if (body) body.innerHTML = ''; } catch(_){ }
      })
      .catch(function(e){ 
        try { clearTimeout(timeoutId); } catch(_){}
        if (!handledSuccess) {
          if (typeof window.showNotification === 'function') window.showNotification('error', isEdit?'Update failed':'Create failed', 'Network error'); 
          else alert('Network error'); 
        }
        btn.disabled = false;
        btn.textContent = (window.createActivityState && window.createActivityState.editActivityId) ? 'Save Changes' : 'Create Item';
      });
  };
    // Store handler reference for fallback click listener
    try { window.__cafHandleCreate = createBtn.onclick; } catch(_){ }
  }
  // Hide footer in preview mode - Force update on every render and set class flag
  setTimeout(() => {
    const footer = modal.querySelector('#cafFooter');
    const createBtn = modal.querySelector('#cafCreate');
    if (footer || createBtn) {
      const isPreview = (window.createActivityState && window.createActivityState.viewMode === 'preview');
      if (isPreview) {
        if (footer) footer.style.display = 'none';
        if (createBtn) { createBtn.style.display = 'none'; createBtn.style.visibility = 'hidden'; }
        try { (document.getElementById('createActivityForm')||modal).classList.add('is-preview'); } catch(_){ }
      } else {
        if (footer) footer.style.display = 'flex';
        if (createBtn) { createBtn.style.display = 'inline-block'; createBtn.style.visibility = 'visible'; createBtn.textContent = (window.createActivityState && window.createActivityState.editActivityId) ? 'Save Changes' : 'Create Item'; }
        try { (document.getElementById('createActivityForm')||modal).classList.remove('is-preview'); } catch(_){ }
      }
    }
  }, 50);
}
// Global listener to hide Save Changes button in preview mode
try {
  if (!window.__cafPreviewButtonBound) {
    window.__cafPreviewButtonBound = true;
    document.addEventListener('click', function(e) {
      if (e.target && (e.target.id === 'cafPreviewMode' || e.target.id === 'cafEditMode')) {
        setTimeout(() => {
          const modal = document.getElementById('createActivityForm') || document.querySelector('#createActivityModal');
          if (modal) {
            const footer = modal.querySelector('#cafFooter');
            const createBtn = modal.querySelector('#cafCreate');
            if (footer || createBtn) {
              const isPreview = (window.createActivityState && window.createActivityState.viewMode === 'preview');
              if (isPreview) { if (footer) footer.style.display = 'none'; if (createBtn) { createBtn.style.display='none'; createBtn.style.visibility='hidden'; } }
              else { if (footer) footer.style.display = 'flex'; if (createBtn) { createBtn.style.display='inline-block'; createBtn.style.visibility='visible'; } }
            }
          }
        }, 100);
      }
    });
  }
} catch(_){}

// Fallback: ensure Save/Create handler always fires even if onclick got detached by re-render
try {
  if (!window.__cafGlobalClickBound) {
    window.__cafGlobalClickBound = true;
    document.addEventListener('click', function(e){
      try {
        const btn = e.target && e.target.closest ? e.target.closest('#cafCreate') : null;
        if (!btn) return;
        // If native onclick exists, let it handle
        if (typeof btn.onclick === 'function') return;
        if (typeof window.__cafHandleCreate === 'function') {
          e.preventDefault();
          window.__cafHandleCreate.call(btn, e);
        }
      } catch(_){ }
    }, true);
  }
} catch(_){ }

// ===== STUDENT TEST INTERFACE FUNCTIONS =====

// Function to render student test interface
function renderStudentTestInterface(activity, activityType) {
  if (activityType === 'coding' || activityType === 'laboratory') {
    return renderStudentCodingTest(activity);
  } else if (activityType === 'multiple_choice' || activityType === 'quiz') {
    return renderStudentMultipleChoiceTest(activity);
  } else if (activityType === 'identification') {
    return renderStudentIdentificationTest(activity);
  } else if (activityType === 'true_false') {
    return renderStudentTrueFalseTest(activity);
  } else if (activityType === 'essay') {
    return renderStudentEssayTest(activity);
  } else if (activityType === 'upload_based') {
    return renderStudentUploadBasedTest(activity);
  } else if (activityType === 'matching') {
    return renderStudentMatchingTest(activity);
  } else {
    // Default to a generic test interface
    return renderGenericTestInterface(activity);
  }
}

// Function to render coding test interface (Codestem-style layout)
function renderStudentCodingTest(activity) {
  try {
    const meta = JSON.parse(activity.instructions || '{}');
    const language = meta.language || 'cpp';
    const starterCode = meta.starterCode || '';
    let problemDescription = activity.problem || meta.instructions || meta.problemStatement || 'Complete the coding challenge.';
    try { if (typeof problemDescription === 'string' && problemDescription.trim().startsWith('{')) { const pd = JSON.parse(problemDescription); if (pd && (pd.instructions || pd.problemStatement)) { problemDescription = pd.instructions || pd.problemStatement; } } } catch(_) {}
    // Normalize test cases - handle both frontend format and database format
    let testCases = Array.isArray(activity.testCases) ? activity.testCases : (Array.isArray(activity.test_cases) ? activity.test_cases : []);
    // Normalize field names: expected_output_text -> expected_output, input_text -> input_text (keep as is)
    testCases = testCases.map(function(tc) {
      return {
        id: tc.id,
        input_text: tc.input_text || tc.inputText || tc.input || '',
        expected_output: tc.expected_output_text || tc.expectedOutput || tc.expected_output || tc.output || '',
        is_sample: tc.is_sample !== undefined ? tc.is_sample : (tc.isSample !== undefined ? tc.isSample : false),
        points: tc.points || 0,
        time_limit_ms: tc.time_limit_ms || tc.timeLimitMs || 2000
      };
    });
    
    // Store activity metadata and test cases for grading
    window.__CURRENT_ACTIVITY_ID__ = activity.id || activity.activity_id || 0;
    window.__CURRENT_ACTIVITY_META__ = meta;
    window.__CURRENT_ACTIVITY_TEST_CASES__ = testCases;
    window.__CURRENT_ACTIVITY_TITLE__ = activity.title || 'Coding Activity';
    window.__CURRENT_ACTIVITY_STARTER_CODE__ = starterCode;
    const __sumPoints = Array.isArray(testCases) ? testCases.reduce((s, tc) => s + (parseInt(tc.points||0,10)||0), 0) : 0;
    const maxScore = __sumPoints > 0 ? __sumPoints : (activity.max_score || 0);
    window.__CURRENT_ACTIVITY_MAX_SCORE__ = maxScore;
    
    // Get user info for profile section
    const userName = (window.__USER_NAME__ || 'Student').split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
    const timeLeft = activity.timeLimit ? `${Math.floor(activity.timeLimit / 60)}:${String(activity.timeLimit % 60).padStart(2, '0')}` : 'No limit';
    
    return `
      <div class="codestem-coding-interface" style="display:flex;height:calc(100vh - 200px);min-height:600px;gap:0;background:#f8fafc;font-family:'Inter',sans-serif;">
        <!-- LEFT PANEL: Problem Description -->
        <div class="codestem-left-panel" style="width:350px;background:#fff;border-right:1px solid #e5e7eb;overflow-y:auto;display:flex;flex-direction:column;">
          <div style="padding:24px;border-bottom:1px solid #e5e7eb;">
            <h3 style="margin:0 0 8px 0;font-size:18px;font-weight:600;color:#1f2937;">${activity.title || 'Coding Challenge'}</h3>
            <p style="margin:0;font-size:12px;color:#6b7280;">by CodeRegal Admin</p>
        </div>
          <div style="padding:24px;flex:1;">
            <h4 style="margin:0 0 16px 0;font-size:16px;font-weight:600;color:#374151;">Problem Description</h4>
            <div style="color:#4b5563;line-height:1.7;font-size:14px;font-weight:600;white-space:pre-wrap;">${escapeHtml(problemDescription)}</div>
            
            ${testCases.length > 0 ? `
              <div style="margin-top:32px;">
                <h4 style="margin:0 0 16px 0;font-size:16px;font-weight:600;color:#374151;">Sample Output</h4>
                ${testCases.filter(tc => tc.is_sample).map((tc, idx) => `
                  <div style="margin-bottom:16px;padding:12px;background:#f9fafb;border-radius:6px;border-left:3px solid #10b981;">
                    <div style="font-size:12px;font-weight:600;color:#059669;margin-bottom:8px;">Sample Output ${idx + 1}</div>
                    <pre style="margin:0;font-size:13px;color:#1f2937;white-space:pre-wrap;font-family:'Courier New',monospace;">${escapeHtml(tc.expected_output || tc.expectedOutput || '')}</pre>
                  </div>
                `).join('')}
          </div>
        ` : ''}
          </div>
          <div style="padding:16px 24px;border-top:1px solid #e5e7eb;background:#f9fafb;">
            <div style="font-size:14px;font-weight:600;color:#374151;">Score: <span id="codingActivityScore">0</span>/${maxScore}</div>
          </div>
        </div>
        
        <!-- MIDDLE PANEL: Code Editor -->
        <div class="codestem-middle-panel" style="flex:1;display:flex;flex-direction:column;background:#fff;">
          <div style="padding:12px 16px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;background:#f9fafb;">
            <div style="display:flex;align-items:center;gap:12px;">
              <span style="font-size:13px;font-weight:600;color:#6b7280;">${language.toUpperCase()}</span>
              <span style="font-size:12px;color:#9ca3af;" id="codingSavedIndicator">
                <i class="fas fa-check-circle" style="color:#10b981;margin-right:4px;"></i>Saved
              </span>
            </div>
        <div style="display:flex;gap:8px;">
              <button onclick="toggleCodingDarkMode()" style="background:none;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px;color:#6b7280;">
                <i class="fas fa-moon"></i>
              </button>
        </div>
      </div>
          <div id="codestemMonacoContainer" style="flex:1;min-height:0;position:relative;">
            <textarea id="codestemCodeTextarea" 
                      placeholder="Write your code here..." 
                      style="width:100%;height:100%;padding:16px;border:none;font-family:'Courier New',monospace;font-size:14px;resize:none;outline:none;background:#fff;color:#1f2937;">${escapeHtml(starterCode)}</textarea>
          </div>
          <div style="padding:16px;border-top:1px solid #e5e7eb;background:#f9fafb;display:flex;gap:12px;">
            <button id="codestemRunBtn" 
                    onclick="runCodestemCode()" 
                   style="background:#10b981;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;">
              <i class="fas fa-play"></i> Run Code
            </button>
            <button id="codestemCheckBtn" 
                    onclick="checkCodestemTests()" 
                    style="background:#10b981;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;"
                    title="Test all cases and submit your solution (score will be recorded)">
              <i class="fas fa-check"></i> Test & Submit
            </button>
          </div>
        </div>
        
        <!-- RIGHT PANEL: Profile Details & Test Cases -->
        <div class="codestem-right-panel" style="width:320px;background:#fff;border-left:1px solid #e5e7eb;display:flex;flex-direction:column;">
          <!-- Profile Details Section -->
          <div style="padding:20px;border-bottom:1px solid #e5e7eb;background:#f9fafb;">
            <div style="margin-bottom:16px;">
              <div style="font-size:14px;font-weight:600;color:#374151;margin-bottom:4px;">${escapeHtml(userName)}</div>
              <div style="font-size:12px;color:#6b7280;">Time Left: <span id="codestemTimeLeft">${timeLeft}</span></div>
            </div>
            <div style="margin-bottom:12px;">
              <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">Overall Score</div>
              <div style="font-size:18px;font-weight:700;color:#10b981;" id="codestemOverallScore">0/${maxScore}</div>
            </div>
            <div>
              <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">Current Rank</div>
              <div style="font-size:14px;font-weight:600;color:#374151;" id="codestemRank">-</div>
            </div>
          </div>
          
          <!-- Test Cases Section -->
          <div style="flex:1;overflow-y:auto;padding:16px;">
            <div style="display:flex;gap:8px;margin-bottom:16px;border-bottom:1px solid #e5e7eb;padding-bottom:12px;">
              <button class="codestem-tab active" onclick="switchCodestemTab('testcases')" style="background:none;border:none;padding:6px 12px;font-size:13px;font-weight:600;color:#10b981;cursor:pointer;border-bottom:2px solid #10b981;">Test Cases</button>
              <button class="codestem-tab" onclick="switchCodestemTab('executions')" style="background:none;border:none;padding:6px 12px;font-size:13px;font-weight:600;color:#6b7280;cursor:pointer;">Executions</button>
            </div>
            
            <div id="codestemTestCasesTab" class="codestem-tab-content">
              ${testCases.length > 0 ? testCases.map((tc, idx) => `
                <div class="codestem-test-case" data-test-id="${tc.id || idx}" style="margin-bottom:12px;padding:12px;background:#f9fafb;border-radius:6px;border:1px solid #e5e7eb;cursor:pointer;" onclick="toggleTestCaseDetails(${idx})">
                  <div style="display:flex;align-items:center;justify-content:space-between;">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <input type="radio" ${tc.is_sample ? 'checked' : ''} disabled style="margin:0;">
                      <span style="font-size:13px;font-weight:600;color:#374151;">Test Case ${idx + 1}</span>
                    </div>
                    <i class="fas fa-chevron-down" style="font-size:10px;color:#9ca3af;"></i>
                  </div>
                  <div class="test-case-details" style="display:none;margin-top:12px;padding-top:12px;border-top:1px solid #e5e7eb;">
                    ${tc.input_text || tc.inputText ? `<div style="margin-bottom:8px;"><span style="font-size:11px;color:#6b7280;">Input:</span><pre style="margin:4px 0 0 0;font-size:12px;color:#1f2937;white-space:pre-wrap;">${escapeHtml(tc.input_text || tc.inputText || '')}</pre></div>` : ''}
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:flex-start;">
                      <div>
                        <div style="font-size:11px;color:#6b7280;">Your Output</div>
                        <pre id="codestemTcYour-${idx}" style="margin:4px 0 0 0;font-size:12px;color:#1f2937;white-space:pre-wrap;background:#111827;color:#e5e7eb;padding:8px;border-radius:6px;">(not run)</pre>
                      </div>
                      <div>
                        <div style="font-size:11px;color:#6b7280;">Expected Output</div>
                        <pre style="margin:4px 0 0 0;font-size:12px;color:#1f2937;white-space:pre-wrap;background:#f3f4f6;padding:8px;border-radius:6px;">${escapeHtml(tc.expected_output || tc.expectedOutput || '')}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              `).join('') : '<div style="color:#9ca3af;font-size:13px;">No test cases available</div>'}
            </div>
            
            <div id="codestemExecutionsTab" class="codestem-tab-content" style="display:none;">
              <div style="color:#9ca3af;font-size:13px;">Execution history will appear here</div>
            </div>
          </div>
        </div>
      </div>
      
      <script>
        // Initialize Monaco Editor for Codestem interface
        (function() {
          const container = document.getElementById('codestemMonacoContainer');
          const textarea = document.getElementById('codestemCodeTextarea');
          if (!container || !textarea) return;
          
          // Load Monaco editor
          loadMonacoEditor().then(() => {
            if (window.monaco && window.monaco.editor) {
              const editor = window.monaco.editor.create(container, {
                value: textarea.value,
                language: '${language}',
                theme: 'vs',
                fontSize: 14,
                automaticLayout: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on'
              });
              
              // Sync with textarea
              editor.onDidChangeModelContent(() => {
                textarea.value = editor.getValue();
                document.getElementById('codingSavedIndicator').innerHTML = '<i class="fas fa-circle" style="color:#f59e0b;margin-right:4px;"></i>Unsaved';
              });
              
              // Store editor reference
              window.__codestemEditor = editor;
            }
          }).catch(() => {
            // Fallback: show textarea
            textarea.style.display = 'block';
          });
        })();
      </script>
    `;
  } catch (e) {
    console.error('Error rendering Codestem coding interface:', e);
    return '<div class="empty-state">Invalid coding activity data</div>';
  }
}

// Codestem-style coding interface helper functions
window.runCodestemCode = function() {
  const editor = window.__codestemEditor;
  const textarea = document.getElementById('codestemCodeTextarea');
  const code = editor ? editor.getValue() : (textarea ? textarea.value : '');
  
  if (!code.trim()) {
    alert('Please write some code first!');
    return;
  }
  
  // Open terminal modal (reuse Play Area terminal)
  if (window.PlayArea && window.PlayArea.openTerminal) {
    window.PlayArea.openTerminal(false, []);
  } else {
    // Fallback: show output in alert or create simple output div
    alert('Terminal feature not available. Use "Check Tests" to run against test cases.');
  }
};

window.checkCodestemTests = async function() {
  const editor = window.__codestemEditor;
  const textarea = document.getElementById('codestemCodeTextarea');
  const code = editor ? editor.getValue() : (textarea ? textarea.value : '');
  
  if (!code.trim()) {
    alert('Please write some code first!');
    return;
  }
  
  // Get current activity data
  const activityId = window.__CURRENT_ACTIVITY_ID__ || 0;
  if (!activityId) {
    alert('Activity ID not found. Please refresh and try again.');
    return;
  }
  
  // Disable button
  const btn = document.getElementById('codestemCheckBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
  }
  
  try {
    // Get activity metadata and test cases
    const activityMeta = window.__CURRENT_ACTIVITY_META__ || {};
    const language = activityMeta.language || 'cpp';
    const testCases = window.__CURRENT_ACTIVITY_TEST_CASES__ || [];
    const requiredConstruct = window.__CURRENT_ACTIVITY_REQUIRED_CONSTRUCT__ || (activityMeta.requiredConstruct || '');
    
    // Run code against ALL test cases (not quick mode)
    let fd = new FormData();
    fd.append('action', 'run_activity');
    fd.append('activity_id', String(activityId));
    fd.append('source', code);
    // Don't append 'quick' - this runs all test cases
    
    const startTime = Date.now();
    const response = await fetch('course_outline_manage.php', {
      method: 'POST',
      body: fd,
      credentials: 'same-origin'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const res = await response.json();
    if (!res || !res.success) {
      throw new Error(res && res.message ? res.message : 'Run failed');
    }
    
    const results = Array.isArray(res.results) ? res.results : [];
    const durationMs = Date.now() - startTime;
    
    // Calculate score based on test case points
    const norm = s => String(s == null ? '' : s).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    
    // CRITICAL FIX: Check if test cases have points. If not, distribute evenly from max_score
    const sumExistingPoints = (testCases || []).reduce((s, tc) => s + (parseInt(tc.points || 0, 10) || 0), 0);
    const maxScoreFromActivity = window.__CURRENT_ACTIVITY_MAX_SCORE__ || 0;
    const needsPointDistribution = sumExistingPoints === 0 && maxScoreFromActivity > 0 && testCases.length > 0;
    const pointsPerCase = needsPointDistribution ? Math.floor(maxScoreFromActivity / testCases.length) : 0;
    
    console.log('🔍 [STUDENT MODE] Points check:', {
      sumExistingPoints,
      maxScoreFromActivity,
      testCasesCount: testCases.length,
      needsPointDistribution,
      pointsPerCase,
      testCasesWithPoints: (testCases || []).map((tc, i) => ({
        index: i + 1,
        points: parseInt(tc.points || 0, 10) || 0
      }))
    });
    
    // Detect construct usage once per run
    const constructCheck = (function(){
      try {
        if (!requiredConstruct) return { ok: true, required: '' };
        return detectConstructUsage(code, language, requiredConstruct);
      } catch(_){ return { ok: true, required: '' }; }
    })();

    const cases = (testCases || []).map((tc, i) => {
      const expected = norm(tc.expected_output || tc.expectedOutput || tc.expected_output_text || '');
      const result = results[i] || {};
      const out = norm(result.output || result.stdout || result.outputText || (result.data && result.data.output) || '');
      const err = result.error || result.stderr || (result.data && result.data.error) || '';
      const statusCode = result.statusCode || (result.data && result.data.statusCode) || 0;
      
      // Check if passed (no error, output matches expected)
      const hasError = err || (statusCode !== 200 && statusCode !== 0);
      const passed = !hasError && (expected === '' ? out !== '' : (out === expected));
      
      // CRITICAL FIX: Use distributed points if test case has no points
      const tcPoints = parseInt(tc.points || 0, 10) || 0;
      const actualPoints = tcPoints > 0 ? tcPoints : (needsPointDistribution ? pointsPerCase : 0);
      let pts = passed ? actualPoints : 0;
      if (requiredConstruct && constructCheck && constructCheck.ok === false && pts > 0) { pts = Math.max(1, Math.round(actualPoints * 0.5)); }
      
      return {
        name: `Test Case ${i + 1}`,
        expected: expected,
        stdout: out || (err ? `Error: ${err}` : ''),
        status: passed ? 'AC' : (hasError ? 'RE' : 'WA'),
        earned: pts,
        points: actualPoints
      };
    });
    
    let totalPts = cases.reduce((s, c) => s + c.earned, 0);
    const totalMax = sumExistingPoints > 0 ? sumExistingPoints : (needsPointDistribution ? maxScoreFromActivity : maxScoreFromActivity);
    const passedCount = cases.filter(c => c.status === 'AC').length;
    const totalCount = cases.length;
    
    // Determine verdict
    let verdict = 'AC';
    if (passedCount === 0) {
      verdict = 'WA'; // All wrong
    } else if (passedCount < totalCount) {
      verdict = 'PA'; // Partially accepted
    }
    
    // CRITICAL: Submit through unified submission system (submit_activity.php)
    // This ensures coding activities are integrated with leaderboards and activity cards
    try {
      // Prepare answers object for unified submission system
      // For coding activities, we store the code and results in a special format
      const codingAnswers = {
        code: code,
        language: language,
        results: results,
        testCases: cases,
        verdict: verdict,
        constructCheck: constructCheck
      };
      
      // Get or create attempt ID
      let attemptId = window.__CURRENT_ATTEMPT_ID__ || null;
      if (!attemptId) {
        // Start a new attempt
        try {
          const startResponse = await fetch('submit_activity.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
              action: 'start_attempt',
              activity_id: activityId
            })
          });
          if (startResponse.ok) {
            const startData = await startResponse.json();
            if (startData.success && startData.attempt_id) {
              attemptId = startData.attempt_id;
              window.__CURRENT_ATTEMPT_ID__ = attemptId;
            }
          }
        } catch (e) {
          console.warn('Could not start attempt:', e);
        }
      }
      
      // Submit through unified system
      // CRITICAL: Include score in codingAnswers so backend can extract it
      codingAnswers.score = totalPts;
      
      const submissionData = {
        action: 'submit',
        activity_id: activityId,
        attempt_id: attemptId,
        answers: { 'coding': codingAnswers }, // Store coding data in answers object
        time_spent_ms: durationMs
        // Note: score is included in codingAnswers.score, backend will extract it
      };
      
      console.log('📤 Submitting coding activity through unified system:', submissionData);
      
      const submitResponse = await fetch('submit_activity.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(submissionData)
      });
      
      if (submitResponse.ok) {
        const submitResult = await submitResponse.json();
        if (submitResult.success) {
          console.log('✅ Coding activity submitted successfully:', submitResult);
          
          // Update activity card score
          if (typeof updateActivityCardScore === 'function') {
            updateActivityCardScore(activityId, totalPts);
          }
          
          // Refresh scores after a delay
          setTimeout(() => {
            if (typeof loadAllStudentScores === 'function') {
              loadAllStudentScores();
            }
          }, 2000);
        } else {
          console.warn('⚠️ Submission returned success=false:', submitResult);
        }
      } else {
        console.warn('⚠️ Submission failed with status:', submitResponse.status);
      }
    } catch (submitErr) {
      console.error('❌ Failed to submit coding activity:', submitErr);
      // Don't block the UI - still show results even if submission fails
    }
    
    // Build optional construct banner
    let noteHtml = '';
    if (requiredConstruct) {
      const ok = constructCheck && constructCheck.ok !== false ? true : false;
      const constructDisplayName = window.getConstructDisplayName ? window.getConstructDisplayName(requiredConstruct) : requiredConstruct.replace('_',' / ');
      noteHtml = `<div style="margin-top:8px;padding:10px;background:${ok ? '#ecfdf5' : '#fffbeb'};border-left:3px solid ${ok ? '#10b981' : '#f59e0b'};border-radius:6px;">
        <strong style="font-size:12px;color:${ok ? '#065f46' : '#991b1b'};">Construct Required:</strong>
        <span style="font-size:12px;color:${ok ? '#065f46' : '#991b1b'};"> ${constructDisplayName} — ${ok ? 'used ✔' : 'missing ✖ (50% deduction applied)'} </span>
      </div>`;
    }

    // Show results modal (like Codestem)
    showCodestemResultsModal(cases, totalPts, totalMax, passedCount, totalCount, noteHtml);
    
    // Update score display
    const overallScoreEl = document.getElementById('codestemOverallScore');
    if (overallScoreEl) overallScoreEl.textContent = `${totalPts}/${totalMax}`;
    
    // Update test case outputs
    cases.forEach((c, i) => {
      const your = document.getElementById(`codestemTcYour-${i}`);
      if (your) your.textContent = c.stdout || '(no output)';
    });
    
    // Mark as saved
    const savedIndicator = document.getElementById('codingSavedIndicator');
    if (savedIndicator) {
      savedIndicator.innerHTML = '<i class="fas fa-check-circle" style="color:#10b981;margin-right:4px;"></i>Saved';
    }
  } catch (error) {
    console.error('Error checking tests:', error);
    alert('Error checking tests: ' + (error.message || 'Please try again.'));
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check"></i> Check Tests';
    }
  }
};

// Show results modal (Codestem-style with "Perfect!" celebration)
function showCodestemResultsModal(cases, totalPts, totalMax, passedCount, totalCount, noteHtml) {
  // Remove any existing modal first
  const existing = document.getElementById('codestemResultsModal');
  if (existing) existing.remove();
  
  const modal = document.createElement('div');
  modal.id = 'codestemResultsModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;';
  
  const isPerfect = passedCount === totalCount;
  
  // Codestem-style modal with celebration illustration
  modal.innerHTML = `
    <div style="width:90%;max-width:700px;background:white;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden;display:flex;">
      <!-- Left: Results Content -->
      <div style="flex:1;padding:40px 32px;display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div style="font-size:32px;font-weight:700;color:${isPerfect ? '#10b981' : (passedCount > 0 ? '#f59e0b' : '#6b7280')};margin-bottom:12px;">
            ${isPerfect ? 'Perfect!' : (passedCount > 0 ? 'Good Job!' : 'Try Again')}
          </div>
          <div style="font-size:16px;color:#6b7280;margin-bottom:24px;" id="codestemActivityTitle">Coding Activity</div>
          <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="font-size:14px;color:#6b7280;">Test Cases:</span>
              <span style="font-size:16px;font-weight:700;color:#374151;">${passedCount}/${totalCount}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:14px;color:#6b7280;">Score:</span>
              <span style="font-size:16px;font-weight:700;color:#374151;">${totalPts}/${totalMax}</span>
            </div>
          </div>
          ${noteHtml ? noteHtml : ''}
          ${!isPerfect && cases.length > 0 ? `
            <div style="max-height:200px;overflow-y:auto;margin-top:16px;">
              <div style="font-size:12px;font-weight:600;color:#6b7280;margin-bottom:8px;">Test Case Results:</div>
              ${cases.map((c, i) => {
                const color = c.status === 'AC' ? '#10b981' : (c.status === 'RE' ? '#6b7280' : '#f59e0b');
                const icon = c.status === 'AC' ? '✅' : (c.status === 'RE' ? '❌' : '⚠️');
                return `
                  <div style="padding:8px;background:#f9fafb;border-radius:6px;margin-bottom:6px;font-size:12px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="color:#374151;">${c.name}</span>
                      <span style="color:${color};font-weight:600;">${icon} ${c.status}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;margin-top:24px;">
          <button id="codestemProceedBtn" style="background:#10b981;color:white;border:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:background 0.2s;">
            Proceed
          </button>
          <button id="codestemResolveBtn" style="background:#f3f4f6;color:#374151;border:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:background 0.2s;">
            Re-Solve
          </button>
        </div>
      </div>
      <!-- Right: Celebration Illustration (only show if perfect) -->
      ${isPerfect ? `
        <div style="width:280px;background:linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;">
          <div style="text-align:center;">
            <div style="font-size:120px;line-height:1;">🤖</div>
            <div style="position:absolute;top:20%;left:10%;font-size:24px;">🎉</div>
            <div style="position:absolute;top:30%;right:15%;font-size:20px;">✨</div>
            <div style="position:absolute;bottom:25%;left:15%;font-size:22px;">🎊</div>
            <div style="position:absolute;bottom:30%;right:10%;font-size:18px;">⭐</div>
          </div>
        </div>
      ` : `
        <div style="width:280px;background:linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);display:flex;align-items:center;justify-content:center;position:relative;">
          <div style="text-align:center;">
            <div style="font-size:120px;line-height:1;">📊</div>
          </div>
        </div>
      `}
    </div>
  `;
  
  console.log('📝 [MODAL] Modal HTML created, appending to body...');
  document.body.appendChild(modal);
  console.log('✅ [MODAL] Modal appended to body. Checking if visible...');
  
  // Verify modal is in DOM and visible
  const checkModal = document.getElementById('codestemResultsModal');
  if (checkModal) {
    console.log('✅ [MODAL] Modal found in DOM!', {
      display: window.getComputedStyle(checkModal).display,
      zIndex: window.getComputedStyle(checkModal).zIndex,
      visibility: window.getComputedStyle(checkModal).visibility
    });
  } else {
    console.error('❌ [MODAL] Modal NOT found in DOM after append!');
  }
  
  // CRITICAL: Update score BEFORE showing modal (in case modal interferes)
  console.log('🔍 [MODAL] Updating score before showing modal:', totalPts, '/', totalMax);
  const scoreElBeforeModal = document.getElementById('previewScoreValue');
  if (scoreElBeforeModal) {
    scoreElBeforeModal.textContent = String(totalPts);
    console.log('✅ [MODAL] Score updated before modal:', totalPts);
    // Also update parent
    const scoreParentBeforeModal = scoreElBeforeModal.parentElement;
    if (scoreParentBeforeModal && scoreParentBeforeModal.textContent.includes('Score:')) {
      const maxScoreText = scoreParentBeforeModal.textContent.match(/\/(\d+)/);
      if (maxScoreText) {
        const maxScore = maxScoreText[1];
        scoreParentBeforeModal.innerHTML = `Score: <span id="previewScoreValue">${totalPts}</span>/${maxScore}`;
      }
    }
  }
  
  // Get activity title if available
  const activityTitleEl = modal.querySelector('#codestemActivityTitle');
  if (activityTitleEl) {
    const activityTitle = window.__CURRENT_ACTIVITY_TITLE__ || window.__previewActivityData?.title || 'Coding Activity';
    activityTitleEl.textContent = activityTitle;
    console.log('📋 [MODAL] Activity title set:', activityTitle);
  }
  
  // CRITICAL: Function to update score after modal closes
  const updateScoreAfterModal = function() {
    setTimeout(() => {
      console.log('🔍 [MODAL] Updating score after modal closed:', totalPts, '/', totalMax);
      const scoreElAfterModal = document.getElementById('previewScoreValue');
      if (scoreElAfterModal) {
        scoreElAfterModal.textContent = String(totalPts);
        console.log('✅ [MODAL] Score updated after modal:', totalPts);
        // Also update parent
        const scoreParentAfterModal = scoreElAfterModal.parentElement;
        if (scoreParentAfterModal && scoreParentAfterModal.textContent.includes('Score:')) {
          const maxScoreText = scoreParentAfterModal.textContent.match(/\/(\d+)/);
          if (maxScoreText) {
            const maxScore = maxScoreText[1];
            scoreParentAfterModal.innerHTML = `Score: <span id="previewScoreValue">${totalPts}</span>/${maxScore}`;
            console.log('✅ [MODAL] Score parent updated after modal');
          }
        }
      } else {
        console.warn('⚠️ [MODAL] Score element not found after modal closed');
      }
    }, 100);
  };
  
  // Button handlers
  const proceedBtn = modal.querySelector('#codestemProceedBtn');
  if (proceedBtn) {
    proceedBtn.onmouseover = function() { this.style.background = '#059669'; };
    proceedBtn.onmouseout = function() { this.style.background = '#10b981'; };
    proceedBtn.onclick = function() {
      modal.remove();
      updateScoreAfterModal(); // CRITICAL: Update score after modal closes
      // Optionally redirect or show next activity
    };
  }
  
  const resolveBtn = modal.querySelector('#codestemResolveBtn');
  if (resolveBtn) {
    resolveBtn.onmouseover = function() { this.style.background = '#e5e7eb'; };
    resolveBtn.onmouseout = function() { this.style.background = '#f3f4f6'; };
    resolveBtn.onclick = function() {
      modal.remove();
      updateScoreAfterModal(); // CRITICAL: Update score after modal closes
      // Reset code editor if needed
      if (window.__codestemEditor && typeof window.__codestemEditor.setValue === 'function') {
        const starterCode = window.__CURRENT_ACTIVITY_STARTER_CODE__ || '';
        window.__codestemEditor.setValue(starterCode);
      }
    };
  }
  
  // Close on background click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.remove();
      updateScoreAfterModal(); // CRITICAL: Update score after modal closes
    }
  });
}

window.switchCodestemTab = function(tab, evt) {
  // Update tab buttons (handle both student and preview tabs)
  const target = evt && evt.target ? evt.target : (typeof event !== 'undefined' ? event.target : null);
  if (!target) return;
  
  const container = target.closest('.codestem-right-panel');
  if (!container) return;
  
  container.querySelectorAll('.codestem-tab').forEach(t => {
    t.classList.remove('active');
    t.style.color = '#6b7280';
    t.style.borderBottom = 'none';
  });
  
  const activeTab = target;
  activeTab.classList.add('active');
  activeTab.style.color = '#10b981';
  activeTab.style.borderBottom = '2px solid #10b981';
  
  // Show/hide tab content (handle both student and preview tabs)
  const testCasesTab = container.querySelector('#codestemTestCasesTab') || container.querySelector('#previewTestCasesTab');
  const executionsTab = container.querySelector('#codestemExecutionsTab') || container.querySelector('#previewExecutionsTab');
  
  if (testCasesTab) testCasesTab.style.display = 'none';
  if (executionsTab) executionsTab.style.display = 'none';
  
  if (tab === 'testcases' && testCasesTab) {
    testCasesTab.style.display = 'block';
  } else if (tab === 'executions' && executionsTab) {
    executionsTab.style.display = 'block';
  }
};

window.toggleTestCaseDetails = function(idx, evt) {
  if (evt) {
    evt.preventDefault();
    evt.stopPropagation();
  }
  
  // CRITICAL: Store last clicked test case for smart detection in "Run Code" and "Check Test"
  window.__previewLastClickedTestIndex = idx;
  console.log('🔍 [SMART DETECTION] Test case', idx + 1, 'clicked - stored for Run Code & Check Test');
  
  // Find test case container by index
  const allCases = document.querySelectorAll('.codestem-test-case');
  if (!allCases || allCases.length <= idx) {
    console.warn('Test case not found at index:', idx);
    return;
  }
  
  const testCaseEl = allCases[idx];
  const details = testCaseEl.querySelector(`#tcDetails-${idx}`);
  const chevronBtn = testCaseEl.querySelector('button[onclick*="toggleTestCaseDetails"]');
  const chevronIcon = chevronBtn ? chevronBtn.querySelector('i') : null;
  const radio = testCaseEl.querySelector(`input[name="preview-tc"][value="${idx}"]`);
  
  if (!details) {
    console.warn('Test case details not found for index:', idx);
    return;
  }
  
  // Determine current state
  const isCurrentlyExpanded = details.style.display !== 'none' && details.style.display !== '';
  const shouldExpand = !isCurrentlyExpanded;
  
  // Toggle this test case
  details.style.display = shouldExpand ? 'block' : 'none';
  
  // Update chevron icon (rotate and change class)
  if (chevronIcon) {
    if (shouldExpand) {
      chevronIcon.classList.remove('fa-chevron-down');
      chevronIcon.classList.add('fa-chevron-up');
      chevronIcon.style.transform = 'rotate(0deg)';
    } else {
      chevronIcon.classList.remove('fa-chevron-up');
      chevronIcon.classList.add('fa-chevron-down');
      chevronIcon.style.transform = 'rotate(0deg)';
    }
  }
  
  // Visual highlighting: Remove highlight from all, add to clicked one
  allCases.forEach((otherCase, otherIdx) => {
    if (otherIdx === idx) {
      // Highlight selected test case
      otherCase.style.borderColor = '#10b981';
      otherCase.style.borderWidth = '2px';
      otherCase.style.background = '#f0fdf4';
    } else {
      // Remove highlight from others
      otherCase.style.borderColor = '#e5e7eb';
      otherCase.style.borderWidth = '1px';
      otherCase.style.background = '#f9fafb';
    }
  });
  
  // Handle radio selection (if clicking on radio button OR chevron button) - keep for fallback
  const isRadioClick = radio && evt && evt.target === radio;
  const isChevronClick = evt && evt.target && (evt.target.closest('button[onclick*="toggleTestCaseDetails"]') || evt.target.closest('i'));
  
  if (isRadioClick || isChevronClick) {
    if (radio) {
      radio.checked = true;
    }
    
    // If expanding this test case, optionally collapse others (only if clicking radio)
    if (isRadioClick && shouldExpand) {
      allCases.forEach((otherCase, otherIdx) => {
        if (otherIdx !== idx) {
          const otherDetails = otherCase.querySelector(`#tcDetails-${otherIdx}`);
          const otherChevronBtn = otherCase.querySelector('button[onclick*="toggleTestCaseDetails"]');
          const otherChevronIcon = otherChevronBtn ? otherChevronBtn.querySelector('i') : null;
          const otherRadio = otherCase.querySelector(`input[name="preview-tc"][value="${otherIdx}"]`);
          
          if (otherDetails) {
            otherDetails.style.display = 'none';
          }
          if (otherChevronIcon) {
            otherChevronIcon.classList.remove('fa-chevron-up');
            otherChevronIcon.classList.add('fa-chevron-down');
            otherChevronIcon.style.transform = 'rotate(0deg)';
          }
          if (otherRadio) {
            otherRadio.checked = false;
          }
        }
      });
    }
  }
};

// Helper function to parse and format error messages
window.formatErrorMessage = function(errorText, language) {
  if (!errorText || typeof errorText !== 'string') {
    return { type: 'unknown', message: 'An error occurred', lineNumber: null };
  }
  
  const err = errorText.trim();
  const lang = (language || 'cpp').toLowerCase();
  
  // Timeout errors
  if (err.includes('timeout') || err.includes('Time limit exceeded') || err.includes('execution timeout')) {
    return {
      type: 'timeout',
      message: '⏱️ Time Limit Exceeded\nYour code took too long to execute. Try optimizing your algorithm or checking for infinite loops.',
      lineNumber: null,
      icon: '⏱️',
      color: '#f59e0b'
    };
  }
  
  // Syntax/Compilation errors (C++/C)
  if (lang === 'cpp' || lang === 'c') {
    // Match patterns like: "error: ..." or "filename.cpp:line:column: error: ..."
    const syntaxMatch = err.match(/(?:error|Error)[:\s]+(.+?)(?:\n|$)/i) || err.match(/(.+?):(\d+):(\d+):\s*(?:error|warning):\s*(.+)/);
    if (syntaxMatch) {
      const lineNum = syntaxMatch[2] ? parseInt(syntaxMatch[2], 10) : null;
      const errorMsg = syntaxMatch[4] || syntaxMatch[1] || err;
      return {
        type: 'syntax',
        message: `❌ Syntax Error\n${errorMsg}${lineNum ? `\n\n📍 Line ${lineNum}` : ''}`,
        lineNumber: lineNum,
        icon: '❌',
        color: '#ef4444'
      };
    }
    
    // Segmentation fault
    if (err.includes('Segmentation fault') || err.includes('segfault')) {
      return {
        type: 'runtime',
        message: '💥 Segmentation Fault\nYour code tried to access memory it doesn\'t have permission to access. Check for:\n• Array out of bounds\n• Null pointer dereference\n• Uninitialized variables',
        lineNumber: null,
        icon: '💥',
        color: '#ef4444'
      };
    }
  }
  
  // Python errors
  if (lang === 'python' || lang === 'python3') {
    // Match patterns like: "File \"<stdin>\", line X, in ..." or "SyntaxError: ..."
    const pythonMatch = err.match(/(?:File\s+[^,]+,\s+line\s+(\d+)|SyntaxError|IndentationError|NameError|TypeError|ValueError|RuntimeError)[:\s]+(.+?)(?:\n|$)/i);
    if (pythonMatch) {
      const lineNum = pythonMatch[1] ? parseInt(pythonMatch[1], 10) : null;
      const errorMsg = pythonMatch[2] || err;
      return {
        type: 'syntax',
        message: `❌ Python Error\n${errorMsg}${lineNum ? `\n\n📍 Line ${lineNum}` : ''}`,
        lineNumber: lineNum,
        icon: '❌',
        color: '#ef4444'
      };
    }
  }
  
  // Java errors
  if (lang === 'java') {
    const javaMatch = err.match(/(?:error|Error)[:\s]+(.+?)(?:\n|$)/i) || err.match(/(.+?)\.java:(\d+):\s*(.+)/);
    if (javaMatch) {
      const lineNum = javaMatch[2] ? parseInt(javaMatch[2], 10) : null;
      const errorMsg = javaMatch[3] || javaMatch[1] || err;
      return {
        type: 'syntax',
        message: `❌ Compilation Error\n${errorMsg}${lineNum ? `\n\n📍 Line ${lineNum}` : ''}`,
        lineNumber: lineNum,
        icon: '❌',
        color: '#ef4444'
      };
    }
  }
  
  // Runtime errors (generic)
  if (err.includes('Runtime Error') || err.includes('runtime error') || err.includes('Exception')) {
    return {
      type: 'runtime',
      message: `⚠️ Runtime Error\n${err}\n\nCheck for:\n• Division by zero\n• Array index out of bounds\n• Null pointer access\n• Invalid input handling`,
      lineNumber: null,
      icon: '⚠️',
      color: '#f59e0b'
    };
  }
  
  // Generic error fallback
  return {
    type: 'error',
    message: `❌ Error\n${err}`,
    lineNumber: null,
    icon: '❌',
    color: '#ef4444'
  };
};

// Helper function to update test case visual status
window.updateTestCaseStatus = function(testCaseIndex, status, earned, points) {
  const container = document.getElementById(`tcContainer-${testCaseIndex}`);
  const statusIcon = document.getElementById(`tcStatusIcon-${testCaseIndex}`);
  const statusBadge = document.getElementById(`tcStatusBadge-${testCaseIndex}`);
  
  if (!container) return;
  
  // Determine status colors and icons
  let iconClass, iconColor, badgeText, badgeBg, badgeColor, borderColor, bgColor;
  
  if (status === 'AC' || status === 'PASSED') {
    // Passed - Green
    iconClass = 'fa-check-circle';
    iconColor = '#10b981';
    badgeText = 'PASSED';
    badgeBg = '#d1fae5';
    badgeColor = '#047857';
    borderColor = '#10b981';
    bgColor = '#f0fdf4';
  } else if (status === 'WA' || status === 'FAILED') {
    // Wrong Answer - Red
    iconClass = 'fa-times-circle';
    iconColor = '#ef4444';
    badgeText = 'FAILED';
    badgeBg = '#fee2e2';
    badgeColor = '#991b1b';
    borderColor = '#ef4444';
    bgColor = '#fef2f2';
  } else if (status === 'RE' || status === 'ERROR') {
    // Runtime Error - Orange
    iconClass = 'fa-exclamation-triangle';
    iconColor = '#f59e0b';
    badgeText = 'ERROR';
    badgeBg = '#fef3c7';
    badgeColor = '#92400e';
    borderColor = '#f59e0b';
    bgColor = '#fffbeb';
  } else {
    // Not run - Gray
    iconClass = 'fa-circle';
    iconColor = '#9ca3af';
    badgeText = '';
    badgeBg = '';
    badgeColor = '';
    borderColor = container.dataset.testIndex === '0' ? '#10b981' : '#e5e7eb';
    bgColor = container.dataset.testIndex === '0' ? '#f0fdf4' : '#f9fafb';
  }
  
  // Update icon
  if (statusIcon) {
    statusIcon.innerHTML = `<i class="fas ${iconClass}" style="color:${iconColor};font-size:14px;"></i>`;
    statusIcon.title = badgeText || 'Not run';
  }
  
  // Update badge
  if (statusBadge) {
    if (badgeText) {
      statusBadge.textContent = badgeText;
      statusBadge.style.background = badgeBg;
      statusBadge.style.color = badgeColor;
      statusBadge.style.display = 'inline-block';
    } else {
      statusBadge.style.display = 'none';
    }
  }
  
  // Update container styling
  container.style.borderColor = borderColor;
  container.style.borderWidth = status === 'AC' || status === 'WA' || status === 'RE' ? '2px' : (container.dataset.testIndex === '0' ? '2px' : '1px');
  container.style.background = bgColor;
  
  // Add points info if available
  if (earned !== undefined && points !== undefined && statusBadge && badgeText) {
    statusBadge.textContent = `${badgeText} (${earned}/${points} pts)`;
  }
};

window.toggleCodingDarkMode = function() {
  const editor = window.__codestemEditor;
  if (!editor) return;
  
  const currentTheme = editor._themeService._theme;
  const newTheme = currentTheme === 'vs-dark' ? 'vs' : 'vs-dark';
  window.monaco.editor.setTheme(newTheme);
  
  // Update button icon
  const btn = event.target.closest('button');
  if (btn) {
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = newTheme === 'vs-dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }
};

// Helper function for HTML escaping (if not already available)
if (typeof escapeHtml === 'undefined') {
  window.escapeHtml = function(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };
}

// Helper function to get proper display name for required construct
if (typeof getConstructDisplayName === 'undefined') {
  window.getConstructDisplayName = function(construct) {
    if (!construct) return '';
    const constructMap = {
      'if_else': 'If-Else Statement',
      'while': 'While Loop',
      'for': 'For Loop',
      'do_while': 'Do-While Loop',
      'switch': 'Switch Statement'
    };
    return constructMap[construct.toLowerCase()] || construct.replace(/_/g, ' / ').replace(/\b\w/g, l => l.toUpperCase());
  };
}

// Coordinator preview helper functions
window.runPreviewCode = function() {
  // Directly trigger the assigned handler without recursion
  const runBtn = document.getElementById('previewRunBtn');
  if (!runBtn) return;
  const evt = new Event('click', { bubbles: true });
  runBtn.dispatchEvent(evt);
};

window.testPreviewCode = function() {
  const testBtn = document.getElementById('previewTestBtn');
  if (!testBtn) return;
  const evt = new Event('click', { bubbles: true });
  testBtn.dispatchEvent(evt);
};

window.resetPreviewCode = function() {
  const resetBtn = document.getElementById('previewResetBtn');
  if (!resetBtn) return;
  const evt = new Event('click', { bubbles: true });
  resetBtn.dispatchEvent(evt);
};
// Submit handler for student coding test (runs JDoodle then saves attempt)
document.addEventListener('click', function(e){
  const btn = e.target && e.target.id === 'codingSubmitBtn' ? e.target : null;
  if (!btn) return;
  const mount = document.getElementById('codingRunOut');
  const codeEl = document.querySelector('textarea[name="test-code"]');
  const activity = window.__currentActivityData || window.currentActivity || null;
  if (!activity) { if (mount) mount.innerHTML = '<div style="color:#dc3545;">No activity context</div>'; return; }
  let lang = 'cpp';
  try { const meta = JSON.parse(activity.instructions||'{}'); if (meta.language) lang = String(meta.language).toLowerCase(); } catch(_){ }
  const source = (codeEl && codeEl.value) ? codeEl.value : '';
  if (!source) { if (mount) mount.innerHTML = '<div style="color:#dc3545;">Write code first</div>'; return; }
  btn.disabled = true; btn.textContent = 'Submitting...';
  if (mount) mount.innerHTML = '<div class="loading-spinner">Running…</div>';

  // Quick run first against sample/all to get verdict
  let fd = new FormData();
  fd.append('action','run_activity');
  fd.append('activity_id', String(activity.id||activity.activity_id||''));
  fd.append('source', source);
  // full run for submission
  fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
    .then(r=>r.json())
    .then(res=>{
      const results = res && res.results ? res.results : (res && res.data ? res.data : []);
      // crude verdict: if all have output matching expected then passed else failed (backend may include statuses)
      let verdict = 'failed';
      try {
        // If JDoodle results include statusCode or memory/time, keep as-is; fallback to simple success check
        const allOk = Array.isArray(results) && results.length > 0 && results.every(x => String(x.status||x.statusCode||'').toLowerCase().includes('success'));
        verdict = allOk ? 'passed' : 'failed';
      } catch(_){}
      const sfd = new FormData();
      sfd.append('action','submit_attempt');
      sfd.append('activity_id', String(activity.id||activity.activity_id||''));
      sfd.append('language', lang);
      sfd.append('source', source);
      sfd.append('results', JSON.stringify(results));
      sfd.append('verdict', verdict);
      return fetch('submissions_api.php', { method:'POST', body: sfd, credentials:'same-origin' })
        .then(r=>r.json())
        .then(save=>{
          if (save && save.success) {
            if (mount) mount.innerHTML = '<div style="color:#28a745;">Submitted successfully</div>';
          } else {
            if (mount) mount.innerHTML = '<div style="color:#dc3545;">Submit failed</div>';
          }
        });
    })
    .catch(()=>{ if (mount) mount.innerHTML = '<div style="color:#dc3545;">Network error</div>'; })
    .finally(()=>{ btn.disabled = false; btn.textContent = 'Submit'; });
});
// Function to render multiple choice test interface
function renderStudentMultipleChoiceTest(activity) {
  if (!activity.questions || !Array.isArray(activity.questions)) {
    return '<div class="empty-state">No questions available</div>';
  }
  
  let html = '';
  activity.questions.forEach((question, index) => {
    html += `
      <div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;margin-bottom:16px;background:white;">
        <h4 style="margin:0 0 12px 0;font-weight:500;">Question ${index + 1}</h4>
        <p style="margin:0 0 16px 0;font-weight:600;font-family: 'Inter', sans-serif;">${question.question_text || 'Question text not available'}</p>
        <div style="font-size:14px;color:#495057;margin:0 0 12px 0;font-weight:500;">Select your answer:</div>
        <div style="space-y:8px;">
    `;
    
    if (question.choices && Array.isArray(question.choices)) {
      question.choices.forEach((choice, choiceIndex) => {
        html += `
          <label style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid #ddd;border-radius:6px;cursor:pointer;background:white;transition:all 0.2s;margin-bottom:8px;">
            <input type="radio" name="student-q${index + 1}" value="${choice.id}" style="margin:0;">
            <span style="flex:1;font-size:14px;">${choice.choice_text || 'Choice not available'}</span>
          </label>
        `;
      });
    }
    
    html += `
        </div>
      </div>
    `;
  });
  
  return html;
}

// Function to render identification test interface
function renderStudentIdentificationTest(activity) {
  if (!activity.questions || !Array.isArray(activity.questions)) {
    return '<div class="empty-state">No questions available</div>';
  }
  
  let html = '';
  activity.questions.forEach((question, index) => {
    html += `
      <div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;margin-bottom:16px;background:white;">
        <h4 style="margin:0 0 12px 0;font-weight:500;">Question ${index + 1}</h4>
        <p style="margin:0 0 16px 0;font-weight:600;font-family: 'Inter', sans-serif;">${question.question_text || 'Question text not available'}</p>
        <div style="margin-bottom:12px;">
          <label style="display:block;margin-bottom:4px;font-weight:500;">Your Answer:</label>
          <input type="text" name="student-q${index + 1}" placeholder="Enter your answer here..." style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;">
        </div>
      </div>
    `;
  });
  
  return html;
}

// Helper function to check if identification answer is correct (supports multiple acceptable answers)
// Usage: checkIdentificationAnswer(studentAnswer, question)
// Returns: { isCorrect: boolean, matchedAnswer: string|null }
window.checkIdentificationAnswer = function(studentAnswer, question) {
  if (!studentAnswer || !question) return { isCorrect: false, matchedAnswer: null };
  
  // Normalize student answer (trim, lowercase)
  const normalized = String(studentAnswer).trim().toLowerCase();
  if (normalized === '') return { isCorrect: false, matchedAnswer: null };
  
  // Get all acceptable answers (primary + alternatives)
  const acceptableAnswers = [];
  
  // Try to parse explanation as JSON (new format: {"primary": "...", "alternatives": [...]})
  if (question.explanation) {
    try {
      const parsed = JSON.parse(question.explanation);
      if (parsed && typeof parsed === 'object' && parsed !== null) {
        // New format with primary + alternatives
        if (parsed.primary && String(parsed.primary).trim()) {
          acceptableAnswers.push({ text: String(parsed.primary).trim(), isPrimary: true });
        }
        if (parsed.alternatives && Array.isArray(parsed.alternatives)) {
          parsed.alternatives.forEach(alt => {
            if (alt && String(alt).trim()) {
              acceptableAnswers.push({ text: String(alt).trim(), isPrimary: false });
            }
          });
        }
      }
    } catch(e) {
      // Not JSON, treat as plain text (legacy format)
      if (question.explanation.trim()) {
        acceptableAnswers.push({ text: question.explanation.trim(), isPrimary: true });
      }
    }
  }
  
  // Fallback: use question.answer if available and no explanation found
  if (acceptableAnswers.length === 0 && question.answer) {
    acceptableAnswers.push({ text: String(question.answer).trim(), isPrimary: true });
  }
  
  // Check if student answer matches any acceptable answer (case-insensitive, trimmed)
  for (const acceptable of acceptableAnswers) {
    const acceptableNormalized = String(acceptable.text).trim().toLowerCase();
    if (acceptableNormalized === normalized) {
      return { isCorrect: true, matchedAnswer: acceptable.text, isPrimary: acceptable.isPrimary };
    }
  }
  
  return { isCorrect: false, matchedAnswer: null };
};

// Function to render true/false test interface
function renderStudentTrueFalseTest(activity) {
  if (!activity.questions || !Array.isArray(activity.questions)) {
    return '<div class="empty-state">No questions available</div>';
  }
  
  let html = '';
  activity.questions.forEach((question, index) => {
    html += `
      <div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;margin-bottom:16px;background:white;">
        <h4 style="margin:0 0 12px 0;">Question ${index + 1}</h4>
        <p style="margin:0 0 16px 0;font-weight:600;font-family: 'Inter', sans-serif;">${question.question_text || 'Question text not available'}</p>
        <div style="space-y:8px;">
          <label style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid #ddd;border-radius:6px;cursor:pointer;background:white;transition:all 0.2s;margin-bottom:8px;">
            <input type="radio" name="student-q${index + 1}" value="true" style="margin:0;">
            <span style="flex:1;font-size:14px;">True</span>
          </label>
          <label style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid #ddd;border-radius:6px;cursor:pointer;background:white;transition:all 0.2s;margin-bottom:8px;">
            <input type="radio" name="student-q${index + 1}" value="false" style="margin:0;">
            <span style="flex:1;font-size:14px;">False</span>
          </label>
        </div>
      </div>
    `;
  });
  
  return html;
}

// Function to render essay test interface
function renderStudentEssayTest(activity) {
  if (!activity.questions || !Array.isArray(activity.questions)) {
    return '<div class="empty-state">No questions available</div>';
  }
  
  let html = '';
  activity.questions.forEach((question, index) => {
    html += `
      <div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;margin-bottom:16px;background:white;">
        <h4 style="margin:0 0 12px 0;font-weight:500;">Question ${index + 1}</h4>
        <p style="margin:0 0 16px 0;font-weight:600;font-family: 'Inter', sans-serif;">${question.question_text || 'Question text not available'}</p>
        <div style="margin-bottom:12px;">
          <label style="display:block;margin-bottom:4px;font-weight:500;">Your Answer:</label>
          <textarea name="student-q${index + 1}" rows="6" placeholder="Write your essay here..." style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;resize:vertical;"></textarea>
        </div>
      </div>
    `;
  });
  
  return html;
}
// Function to render matching test interface
function renderStudentMatchingTest(activity) {
  if (!activity.questions || !Array.isArray(activity.questions)) {
    return '<div class="empty-state">No questions available</div>';
  }
  
  let html = '';
  activity.questions.forEach((question, index) => {
    html += `
      <div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;margin-bottom:16px;background:white;">
        <h4 style="margin:0 0 12px 0;font-weight:500;">Question ${index + 1}</h4>
        <p style="margin:0 0 16px 0;font-weight:600;font-family: 'Inter', sans-serif;">${question.question_text || 'Question text not available'}</p>
        <div style="margin-bottom:12px;">
          <label style="display:block;margin-bottom:4px;font-weight:500;">Your Answer:</label>
          <input type="text" name="student-q${index + 1}" placeholder="Enter your answer here..." style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;">
        </div>
      </div>
    `;
  });
  
  return html;
}

// Function to render generic test interface
function renderGenericTestInterface(activity) {
  return `
    <div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;margin-bottom:16px;background:#f8f9fa;">
      <h4 style="margin:0 0 12px 0;">${activity.title || 'Activity'}</h4>
      <p style="margin:0 0 16px 0;color:#666;">This is a preview of the activity. The actual student interface would be customized based on the activity type.</p>
      <div style="margin-bottom:12px;">
        <label style="display:block;margin-bottom:4px;font-weight:500;">Your Response:</label>
        <textarea name="student-response" rows="4" placeholder="Enter your response here..." style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;resize:vertical;"></textarea>
      </div>
    </div>
  `;
}

// Function to get proper activity type display name
function getActivityTypeDisplay(activityType) {
  const typeMap = {
    'multiple_choice': 'MULTIPLE CHOICE',
    'true_false': 'TRUE/FALSE',
    'identification': 'IDENTIFICATION', 
    'essay': 'ESSAY',
    'upload_based': 'UPLOAD BASED',
    'coding': 'CODING EXERCISE',
    'quiz': 'QUIZ' // Fallback for database stored as 'quiz'
  };
  return typeMap[activityType] || activityType.toUpperCase().replace('_', ' ');
}

// Function to render professional test questions for coordinator preview
function renderProfessionalTestQuestions(activity, activityType) {
  console.log('🔍 DEBUG: renderProfessionalTestQuestions called with:', { activity, activityType });
  
  if (!activity.questions || !Array.isArray(activity.questions) || activity.questions.length === 0) {
    console.log('🔍 DEBUG: No questions found');
    return `
      <div style="text-align:center;padding:40px;color:#6c757d;">
        <div style="font-size:48px;margin-bottom:16px;">📝</div>
        <h3 style="margin:0 0 8px 0;color:#495057;">No Questions Added</h3>
        <p style="margin:0;font-size:14px;">Add questions in Edit mode to see the preview</p>
      </div>
    `;
  }
  
  console.log('🔍 DEBUG: Questions found:', activity.questions);
  
  let html = '';
  activity.questions.forEach((question, index) => {
    console.log('🔍 DEBUG: Processing question', index, ':', question);
    html += `
      <div id="question-${index}" style="border:1px solid #e9ecef;border-radius:8px;padding:24px;margin-bottom:24px;background:white;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h3 style="margin:0;color:#333;font-size:18px;font-weight:500;">Question ${index + 1}</h3>
          <div style="background:#e9ecef;color:#495057;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">
            ${question.points || 1} point${(question.points || 1) !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div style="margin-bottom:20px;">
          <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333;font-weight:600;font-family: 'Inter', sans-serif;">${question.question_text || question.text || 'Question text not available'}</p>
        </div>
        ${activityType === 'multiple_choice' ? '<div style="font-size:14px;color:#495057;margin:0 0 8px 0;">Select your answer:</div>' : ''}
        ${renderQuestionInput(question, index, activityType)}
      </div>
    `;
  });
  
  console.log('🔍 DEBUG: Generated HTML:', html);
  return html;
}
// Coordinator preview for coding activities (Codestem-style layout)
function renderCodingPreview(activity){
  let meta = {};
  try { meta = JSON.parse(activity.instructions||'{}'); } catch(_){ meta = {}; }
  const language = (meta.language || 'cpp').toString();
  const starterCode = meta.starterCode || '';
  let problemDescription = activity.problem || meta.instructions || meta.problemStatement || meta.displayInstructions || 'Complete the coding challenge.';
  try {
    if (typeof problemDescription === 'string' && problemDescription.trim().startsWith('{')) {
      const parsedPD = JSON.parse(problemDescription);
      if (parsedPD && (parsedPD.instructions || parsedPD.problemStatement)) {
        problemDescription = parsedPD.instructions || parsedPD.problemStatement;
      }
    }
  } catch(_) {}
  // Normalize test cases - handle both frontend format and database format
  let testCases = Array.isArray(activity.testCases) ? activity.testCases : (Array.isArray(activity.test_cases) ? activity.test_cases : []);
  // Normalize field names: expected_output_text -> expected_output, input_text -> input_text (keep as is)
  testCases = testCases.map(function(tc) {
    return {
      id: tc.id,
      input_text: tc.input_text || tc.inputText || tc.input || '',
      expected_output: tc.expected_output_text || tc.expectedOutput || tc.expected_output || tc.output || '',
      is_sample: tc.is_sample !== undefined ? tc.is_sample : (tc.isSample !== undefined ? tc.isSample : false),
      points: tc.points || 0,
      time_limit_ms: tc.time_limit_ms || tc.timeLimitMs || 2000
    };
  });
  const __sumPoints = Array.isArray(testCases) ? testCases.reduce((s, tc) => s + (parseInt(tc.points||0,10)||0), 0) : 0;
  const maxScore = __sumPoints > 0 ? __sumPoints : (activity.max_score || 0);
  
  // Store activity ID for later use
  window.__CURRENT_ACTIVITY_ID__ = activity.id || activity.activity_id || 0;
  window.__CURRENT_ACTIVITY_MAX_SCORE__ = maxScore;
  // Required construct from DB or meta
  let requiredConstruct = '';
  try { const metaRC = (meta && meta.requiredConstruct) ? String(meta.requiredConstruct) : ''; requiredConstruct = activity.required_construct || metaRC || ''; } catch(_){}
  window.__CURRENT_ACTIVITY_REQUIRED_CONSTRUCT__ = requiredConstruct;
  
  // Use global helper function for construct display name
  const getConstructDisplayName = window.getConstructDisplayName || function(construct) {
    if (!construct) return '';
    const constructMap = {
      'if_else': 'If-Else Statement',
      'while': 'While Loop',
      'for': 'For Loop',
      'do_while': 'Do-While Loop',
      'switch': 'Switch Statement'
    };
    return constructMap[construct.toLowerCase()] || construct.replace(/_/g, ' / ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // CRITICAL: Create handlers IMMEDIATELY before returning HTML
  // This ensures handlers are available as soon as HTML is rendered
  (function() {
    // Store preview activity data IMMEDIATELY
    window.__previewActivityData = activity;
    try {
      window.__codingPreviewCtx = { 
        meta: meta || {}, 
        starter: starterCode || '', 
        expected: '', 
        activity: activity || {} 
      };
    } catch(_){}
    
    // Create RUN handler - FULLY FUNCTIONAL
    // CREDIT FIX: Prevent duplicate execution
    window.__previewRunHandler = function(e) {
      // CREDIT FIX: Prevent duplicate execution
      if (window.__previewRunHandlerExecuting) {
        console.warn('⚠️ [CREDIT TRACK] Run handler already executing, preventing duplicate call');
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        return false;
      }
      window.__previewRunHandlerExecuting = true;
      
      console.log('🔴 [CREDIT TRACK] Run handler called (window.__previewRunHandler)', {
        timestamp: new Date().toISOString(),
        handler: 'window.__previewRunHandler'
      });
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      const runBtn = document.getElementById('previewRunBtn');
      const outputDiv = document.getElementById('previewRunOutput');
      
      if (!outputDiv) {
        console.error('❌ previewRunOutput div not found!');
        window.__previewRunHandlerExecuting = false; // Reset flag on error
        alert('Error: Output area not found. Please refresh the page.');
        return false;
      }
      
      // Get code from Monaco or textarea
      let code = '';
      try {
        if (window.__previewEditor && typeof window.__previewEditor.getValue === 'function') {
          code = window.__previewEditor.getValue();
        } else {
          const textarea = document.getElementById('previewCodeTextarea');
          if (textarea) code = textarea.value;
        }
      } catch(err) {
        console.error('Code extraction error:', err);
        window.__previewRunHandlerExecuting = false; // Reset flag on error
        return false;
      }
      
      code = code.trim();
      console.log('📝 Code extracted:', code ? (code.length + ' chars') : 'EMPTY');
      
      if (!code) {
        outputDiv.style.display = 'block';
        outputDiv.innerHTML = '<div style="color:#dc3545;">❌ Please write some code first</div>';
        window.__previewRunHandlerExecuting = false; // Reset flag on validation error
        return false;
      }
      
      // Set loading state using helper
      if (window.setPreviewButtonLoading) {
        window.setPreviewButtonLoading('previewRunBtn', true, 'Running...');
      } else if (runBtn) {
        runBtn.disabled = true;
        runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
      }
      
      // Don't show "Running code..." in outputDiv - terminal modal will show it
      // outputDiv.style.display = 'block';
      // outputDiv.innerHTML = '<div style="color:#007bff;">🔄 Running code...</div>';
      
      // Get activity data
      const activity = window.__previewActivityData || {};
      const meta = window.__codingPreviewCtx && window.__codingPreviewCtx.meta ? window.__codingPreviewCtx.meta : {};
      const language = (meta && meta.language) ? String(meta.language).toLowerCase() : 'cpp';
      
      // CRITICAL FIX: Check if code needs input BEFORE API call
      var needsInput = false;
      if (language === 'cpp' || language === 'c++') {
        needsInput = /\bcin\s*>>/i.test(code);
      } else if (language === 'python' || language === 'python3' || language === 'py') {
        needsInput = /\binput\s*\(/i.test(code) || /\braw_input\s*\(/i.test(code);
      } else if (language === 'java') {
        needsInput = /new\s+Scanner\s*\(/i.test(code) || /\bSystem\.in/i.test(code);
      }
      
      // Extract prompts for C++
      var promptsAndInputs = [];
      if (needsInput && (language === 'cpp' || language === 'c++')) {
        var lines = code.split('\n');
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          var trimmedLine = line.trim();
          var cinMatch = trimmedLine.match(/cin\s*>>\s*(\w+)/);
          if (cinMatch) {
            var prompt = '';
            var sameLineCout = line.match(/cout\s*<<\s*["']([^"']+)["']/);
            if (sameLineCout) {
              prompt = sameLineCout[1];
            } else {
              for (var j = Math.max(0, i - 5); j < i; j++) {
                var prevLine = lines[j];
                var coutMatch = prevLine.match(/cout\s*<<\s*["']([^"']+)["']/);
                if (coutMatch) {
                  prompt = coutMatch[1];
                  break;
                }
              }
            }
            promptsAndInputs.push({
              prompt: prompt || 'Enter value:',
              variable: cinMatch[1]
            });
          }
        }
      }
      
      // Open CodeRegal Terminal Modal IMMEDIATELY (before API call)
      var terminalModal = null;
      var terminalBodyId = null;
      
      // Create terminal modal manually (always, for full control)
      var existing = document.getElementById('previewCodeRegalTerminalModal');
      if (existing) existing.remove();
      
      terminalBodyId = 'previewTerminalBody_' + Date.now();
      var firstPromptText = '';
      var bodyInitial = 'Executing...';
      
      if (needsInput && promptsAndInputs.length > 0) {
        firstPromptText = promptsAndInputs[0].prompt || 'Enter value:';
        bodyInitial = '<span style="color:#e5e7eb;">' + escapeHtml(firstPromptText) + '</span> ' +
                      '<input type="text" id="previewTerminalInputField" style="background:transparent;border:none !important;outline:none !important;box-shadow:none !important;color:#e5e7eb;font-family:inherit;font-size:inherit;padding:2px 4px;width:200px;" autocomplete="off" spellcheck="false" />';
      }
      
      terminalModal = document.createElement('div');
      terminalModal.id = 'previewCodeRegalTerminalModal';
      terminalModal.className = 'play-terminal-modal';
      terminalModal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;';
      terminalModal.innerHTML = '<div class="play-terminal-card" style="width:90vw;max-width:980px;height:70vh;min-height:420px;background:#0f172a;color:#e5e7eb;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.5);display:flex;flex-direction:column;overflow:hidden;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;background:#0f172a;padding:10px 14px;border-bottom:1px solid #1f2937;">' +
        '<div style="font-weight:700;">CodeRegal Terminal</div>' +
        '<button id="previewTermClose" style="background:#1f2937;color:#e5e7eb;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;">✕</button>' +
        '</div>' +
        '<pre id="' + terminalBodyId + '" style="margin:0;white-space:pre-wrap;padding:14px;flex:1;overflow:auto;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,monospace;background:#0b1220;color:#e5e7eb;">' + bodyInitial + '</pre>' +
        '</div>';
      document.body.appendChild(terminalModal);
      var closeBtn = terminalModal.querySelector('#previewTermClose');
      if (closeBtn) closeBtn.onclick = function(){ 
        // Ensure output is recorded before closing terminal
        console.log('🔴 Terminal closed - output already recorded in test case panel');
        // CRITICAL: Reset execution flag so user can run code again
        window.__previewRunHandlerExecuting = false;
        // CRITICAL: Reset button loading state when terminal is closed
        if (window.setPreviewButtonLoading) {
          window.setPreviewButtonLoading('previewRunBtn', false);
        } else {
          const runBtnEl = document.getElementById('previewRunBtn');
          if (runBtnEl) {
            runBtnEl.disabled = false;
            const btnText = runBtnEl.querySelector('.btn-text');
            if (btnText) {
              btnText.textContent = 'Run Code';
            } else {
              runBtnEl.innerHTML = '<i class="fas fa-play"></i> Run Code';
            }
          }
        }
        terminalModal.remove(); 
      };
      terminalModal.addEventListener('click', function(e){ 
        if (e.target === terminalModal) {
          // Ensure output is recorded before closing terminal
          console.log('🔴 Terminal closed (clicked outside) - output already recorded in test case panel');
          // CRITICAL: Reset execution flag so user can run code again
          window.__previewRunHandlerExecuting = false;
          // CRITICAL: Reset button loading state when terminal is closed
          if (window.setPreviewButtonLoading) {
            window.setPreviewButtonLoading('previewRunBtn', false);
          } else {
            const runBtnEl = document.getElementById('previewRunBtn');
            if (runBtnEl) {
              runBtnEl.disabled = false;
              const btnText = runBtnEl.querySelector('.btn-text');
              if (btnText) {
                btnText.textContent = 'Run Code';
              } else {
                runBtnEl.innerHTML = '<i class="fas fa-play"></i> Run Code';
              }
            }
          }
          terminalModal.remove(); 
        }
      });
      
      // CRITICAL: Smart detection - use last clicked test case OR selected radio button
      // Priority: 1) Last clicked test case (stored in window), 2) Selected radio button, 3) First test case
      let selectedTestIndex = 0;
      
      // Check if there's a last clicked test case (smart detection)
      if (window.__previewLastClickedTestIndex !== undefined) {
        selectedTestIndex = parseInt(window.__previewLastClickedTestIndex, 10) || 0;
        console.log('🔍 [RUN CODE] Using last clicked test case (smart detection):', selectedTestIndex + 1);
      } else {
        // Fallback to radio button selection
        const selectedRadio = document.querySelector('input[name="preview-tc"]:checked');
        if (selectedRadio && selectedRadio.value !== undefined) {
          selectedTestIndex = parseInt(selectedRadio.value, 10) || 0;
          console.log('🔍 [RUN CODE] Using selected radio button test case:', selectedTestIndex + 1);
        } else {
          // If no radio selected, use first test case (default)
          selectedTestIndex = 0;
          console.log('ℹ️ [RUN CODE] No test case selected, using first test case');
        }
      }
      
      // Get the selected test case for input
      const testCases = activity.testCases || activity.test_cases || [];
      const selectedTestCase = testCases[selectedTestIndex] || {};
      const selectedInput = selectedTestCase.input_text || selectedTestCase.inputText || selectedTestCase.input || '';
      
      console.log('🔍 [RUN CODE] Using test case', selectedTestIndex + 1, 'with input:', selectedInput);
      
      // Setup input field handler if needed (BEFORE API call)
      if (needsInput && promptsAndInputs.length > 0) {
        var inputField = terminalModal.querySelector('#previewTerminalInputField');
        if (inputField) {
          // CRITICAL: Remove any green border/outline on focus
          inputField.style.border = 'none';
          inputField.style.outline = 'none';
          inputField.style.boxShadow = 'none';
          
          // CRITICAL: Ensure no border on focus
          inputField.addEventListener('focus', function() {
            this.style.border = 'none';
            this.style.outline = 'none';
            this.style.boxShadow = 'none';
          });
          
          // CRITICAL: DO NOT pre-fill - let user type manually for interactivity
          // User should type the input themselves to make it interactive
          inputField.value = ''; // Always start empty
          console.log('🔍 [RUN CODE] Input field left empty for user to type manually');
          
          setTimeout(function(){ inputField.focus(); }, 50);
          inputField.addEventListener('keydown', function(e){
            if (e.key === 'Enter'){
              e.preventDefault();
              // CRITICAL: Get value directly from input field, don't rely on stored values
              var val = String(inputField.value || '').trim();
              
              // CRITICAL: Log the actual value being read
              console.log('🔍 [INPUT HANDLER] Input field value:', inputField.value);
              console.log('🔍 [INPUT HANDLER] Trimmed value:', val);
              console.log('🔍 [INPUT HANDLER] Value type:', typeof val);
              
              // CRITICAL: Check if value is empty or just whitespace
              if (!val || val === '') {
                console.warn('⚠️ [INPUT HANDLER] Empty input detected, focusing input field');
                inputField.focus();
                return;
              }
              
              // CRITICAL: Show input value in terminal immediately
              var terminalBody = document.getElementById(terminalBodyId);
              if (terminalBody) {
                terminalBody.innerHTML = '<span style="color:#e5e7eb;">' + escapeHtml(firstPromptText) + '</span> <span style="color:#e5e7eb;">' + escapeHtml(val) + '</span><br/>Executing...';
              }
              
              // CRITICAL: Store input value for API call (as string, not number)
              window.__previewTerminalInputValue = val;
              window.playTerminalPromptText = firstPromptText;
              window.__previewSelectedTestIndex = selectedTestIndex; // Store selected test index
              
              console.log('✅ [INPUT HANDLER] Calling runCodeWithInput with value:', val, 'type:', typeof val);
              
              // Run code with user input
              runCodeWithInput(code, val, activity, meta, language, terminalBodyId, runBtn, selectedTestIndex);
            }
          });
        }
        // Don't proceed with API call - wait for user input
        return false;
      }
      
      // If no input needed, proceed with API call
      // Execute API call
      let fd = new FormData();
      fd.append('action','run_activity');
      fd.append('activity_id', String(activity.id || activity.activity_id || ''));
      fd.append('source', code);
      fd.append('quick','1');
      // CRITICAL: Use selected test case input if available
      if (selectedInput) {
        fd.append('stdin', selectedInput);
        console.log('🔍 [RUN CODE] Using selected test case input:', selectedInput);
      }
      
      console.log('🚀 Sending API request...', {
        activity_id: activity.id || activity.activity_id,
        code_length: code.length,
        language: language
      });
      
      // CRITICAL: Add CSRF token before sending (using proven pattern from line 3638)
      (async function(){ 
        try { 
          fd = await addCSRFToken(fd); 
        } catch(e){ 
          console.warn('⚠️ [CSRF] addCSRFToken failed, trying manual fetch:', e);
          try {
            const token = await getCSRFToken();
            if (token) {
              fd.append('csrf_token', token);
              console.log('✅ [CSRF] Manual token added');
            }
          } catch(e2) {
            console.error('❌ [CSRF] Manual token fetch failed:', e2);
          }
        } 
        return fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' }); 
      })()
        .then(function(r) {
          console.log('📡 API Response status:', r.status, r.statusText);
          if (!r || !r.ok) {
            throw new Error('HTTP ' + (r ? r.status : 'unknown') + ': ' + (r ? r.statusText : 'No response'));
          }
          return r.json ? r.json() : Promise.reject(new Error('Response is not JSON'));
        })
        .then(function(res) {
          if (!res) {
            throw new Error('Empty response from server');
          }
          console.log('✅ Run Code Response:', res);
          const ok = !!(res && res.success);
          if (!ok) {
            const msg = res && res.message ? res.message : 'Run failed';
            throw new Error(msg);
          }
          
          const results = Array.isArray(res.results) ? res.results : [];
          console.log('Results:', results);
          
          // Get test cases for input display
          const activity = window.__previewActivityData || {};
          const testCases = activity.testCases || activity.test_cases || [];
          
          // Get language from activity metadata
          let language = 'cpp';
          try {
            const meta = activity.instructions ? (typeof activity.instructions === 'string' ? JSON.parse(activity.instructions || '{}') : activity.instructions) : {};
            language = (meta.language || 'cpp').toLowerCase();
          } catch(_) {
            language = 'cpp';
          }
          
          if (results.length === 0) {
            var terminalBody = document.getElementById(terminalBodyId);
            if (terminalBody) {
              terminalBody.textContent = '⚠️ No test cases found. Code compiled successfully but no output to display.';
            }
            return;
          }
          
          // CRITICAL: Get the selected test case index (from radio button or stored value)
          let targetTestIndex = selectedTestIndex;
          if (window.__previewSelectedTestIndex !== undefined) {
            targetTestIndex = window.__previewSelectedTestIndex;
            delete window.__previewSelectedTestIndex; // Clean up
          }
          
          // Process first result (Run Code uses quick mode - selected test case only)
          const firstResult = results[0] || {};
          const targetTestCase = testCases[targetTestIndex] || {};
          const inputText = targetTestCase.input_text || targetTestCase.inputText || targetTestCase.input || '';
          const out = firstResult.output || firstResult.stdout || firstResult.outputText || (firstResult.data && firstResult.data.output) || '';
          const err = firstResult.error || firstResult.stderr || (firstResult.data && firstResult.data.error) || '';
          const statusCode = firstResult.statusCode || (firstResult.data && firstResult.data.statusCode) || 0;
          
          const hasError = err || (statusCode !== 200 && statusCode !== 0);
          
          // Format error message if there's an error
          let outputText = '';
          if (hasError && err) {
            const errorInfo = window.formatErrorMessage ? window.formatErrorMessage(err, language) : null;
            if (errorInfo) {
              outputText = errorInfo.message;
            } else {
              outputText = 'Error: ' + err;
            }
          } else {
            outputText = String(out || '').trim();
          }
          
          // CRITICAL: Smart output matching - check if output matches any test case's expected output
          const norm = s => String(s == null ? '' : s).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
          const normalizedOutput = norm(outputText);
          
          let finalTargetIndex = targetTestIndex; // Default to selected test case
          let matchedTestCase = null;
          
          if (!hasError && normalizedOutput !== '') {
            // Check all test cases to see if output matches any expected output
            for (let i = 0; i < testCases.length; i++) {
              const tc = testCases[i] || {};
              const expected = norm(tc.expected_output || tc.expectedOutput || tc.expected_output_text || '');
              
              if (expected !== '' && normalizedOutput === expected) {
                finalTargetIndex = i;
                matchedTestCase = i + 1;
                console.log(`🎯 [SMART MATCH] Output "${normalizedOutput}" matches Test Case ${i + 1} expected output! Auto-detected.`);
                break; // Use first match
              }
            }
            
            if (matchedTestCase) {
              console.log(`✅ [SMART MATCH] Output will be recorded to Test Case ${matchedTestCase} (matched expected output)`);
            } else {
              console.log(`ℹ️ [RUN CODE] Output "${normalizedOutput}" doesn't match any expected output, using selected Test Case ${targetTestIndex + 1}`);
            }
          }
          
          console.log('🔍 [RUN CODE] Updating test case', finalTargetIndex + 1, 'with output:', outputText);
          
          // CRITICAL: Update the MATCHED or SELECTED test case's "Your Output" field
          try {
            const yourOutputEl = document.getElementById(`tcYour-${finalTargetIndex}`);
            if (yourOutputEl) {
              yourOutputEl.textContent = outputText || '(no output)';
              console.log('✅ [RUN CODE] Updated test case', finalTargetIndex + 1, 'output field');
              
              // Update visual status based on output match
              if (window.updateTestCaseStatus) {
                const expectedEl = document.getElementById(`tcExpected-${finalTargetIndex}`);
                const expectedText = expectedEl ? expectedEl.textContent.trim() : '';
                const norm = s => String(s == null ? '' : s).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
                const normalizedOutput = norm(outputText);
                const normalizedExpected = norm(expectedText);
                const matches = !hasError && normalizedOutput !== '' && normalizedExpected !== '' && normalizedOutput === normalizedExpected;
                const status = hasError ? 'RE' : (matches ? 'AC' : (normalizedOutput !== '' ? 'WA' : ''));
                window.updateTestCaseStatus(finalTargetIndex, status);
                console.log(`✅ [RUN CODE] TC ${finalTargetIndex + 1} visual status updated: ${status}`);
              }
              
              // If smart matched, also update the visual selection
              if (matchedTestCase && finalTargetIndex !== targetTestIndex) {
                // Update visual highlight to matched test case
                const allCases = document.querySelectorAll('.codestem-test-case');
                allCases.forEach((testCaseEl, idx) => {
                  if (idx === finalTargetIndex) {
                    testCaseEl.style.borderColor = '#10b981';
                    testCaseEl.style.borderWidth = '2px';
                    testCaseEl.style.background = '#f0fdf4';
                    // Also update radio button for consistency
                    const radio = testCaseEl.querySelector(`input[name="preview-tc"][value="${finalTargetIndex}"]`);
                    if (radio) radio.checked = true;
                    window.__previewLastClickedTestIndex = finalTargetIndex;
                  } else if (idx === targetTestIndex) {
                    // Remove highlight from originally selected
                    testCaseEl.style.borderColor = '#e5e7eb';
                    testCaseEl.style.borderWidth = '1px';
                    testCaseEl.style.background = '#f9fafb';
                  }
                });
                console.log(`🎯 [SMART MATCH] Visual selection updated to Test Case ${finalTargetIndex + 1}`);
              }
            } else {
              console.warn('⚠️ [RUN CODE] Output element not found for test case', finalTargetIndex + 1, '(`tcYour-${finalTargetIndex}`)');
            }
          } catch(e) {
            console.warn('Could not update test case output:', e);
          }
          
          // Display output in terminal (terminal already exists)
          var terminalBody = document.getElementById(terminalBodyId);
          if (terminalBody) {
            var terminalOutput = '';
            if (outputText) {
              terminalOutput = outputText;
            } else {
              terminalOutput = '(no output)';
            }
            terminalOutput += '\n\n>>> Program Terminated';
            terminalBody.textContent = terminalOutput;
          }
        })
        .catch(function(err) {
          console.error('❌ Run Code Error:', err);
          
          // Format error message
          const activity = window.__previewActivityData || {};
          const meta = activity.instructions ? (typeof activity.instructions === 'string' ? JSON.parse(activity.instructions || '{}') : activity.instructions) : {};
          const language = (meta.language || 'cpp').toLowerCase();
          const errorText = String(err && err.message ? err.message : err);
          const errorInfo = window.formatErrorMessage ? window.formatErrorMessage(errorText, language) : null;
          
          const safeErr = errorText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
          const formattedErr = errorInfo ? errorInfo.message.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;') : safeErr;
          
          // Show error in terminal modal (not outputDiv)
          var terminalBody = document.getElementById(terminalBodyId);
          if (terminalBody) {
            terminalBody.textContent = formattedErr + '\n\n>>> Program Terminated';
          }
        })
        .finally(function() { 
          // CREDIT FIX: Reset execution flag
          window.__previewRunHandlerExecuting = false;
          // Reset loading state using helper
          if (window.setPreviewButtonLoading) {
            window.setPreviewButtonLoading('previewRunBtn', false);
          } else if (runBtn) {
            runBtn.disabled = false; 
            runBtn.innerHTML = '<i class="fas fa-play"></i> Run Code';
          }
        });
      
      return false;
    };
    
    // Helper function to run code with user input
    function runCodeWithInput(code, userInput, activity, meta, language, terminalBodyId, runBtn, selectedTestIndex) {
      // CRITICAL: Ensure userInput is a string, not a number
      const stdinValue = String(userInput || '').trim();
      
      console.log('🔍 [RUN CODE WITH INPUT] Received userInput:', userInput);
      console.log('🔍 [RUN CODE WITH INPUT] userInput type:', typeof userInput);
      console.log('🔍 [RUN CODE WITH INPUT] Processed stdinValue:', stdinValue);
      console.log('🔍 [RUN CODE WITH INPUT] stdinValue type:', typeof stdinValue);
      
      var fd = new FormData();
      fd.append('action','run_activity');
      fd.append('activity_id', String(activity.id || activity.activity_id || ''));
      fd.append('source', code);
      fd.append('quick','1');
      fd.append('stdin', stdinValue); // Use processed value
      
      console.log('🚀 Running code with stdin:', stdinValue, '| Original userInput:', userInput);
      
      // CRITICAL: Add CSRF token before sending
      ;(async function(){ 
        try { 
          fd = await addCSRFToken(fd); 
        } catch(e){ 
          console.warn('⚠️ [CSRF] addCSRFToken failed, trying manual fetch:', e);
          try {
            const token = await getCSRFToken();
            if (token) fd.append('csrf_token', token);
          } catch(e2) {}
        } 
        return fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' }); 
      })()
        .then(function(r) {
          if (!r || !r.ok) {
            throw new Error('HTTP ' + (r ? r.status : 'unknown') + ': ' + (r ? r.statusText : 'No response'));
          }
          return r.json ? r.json() : Promise.reject(new Error('Response is not JSON'));
        })
        .then(function(res) {
          if (!res) {
            throw new Error('Empty response from server');
          }
          
          var results = Array.isArray(res.results) ? res.results : [];
          
          // CRITICAL: Log detailed response for debugging
          console.log('🔍 [RUN CODE WITH INPUT] API Response:', {
            success: res.success,
            resultsCount: results.length,
            results: results,
            message: res.message,
            stdinUsed: stdinValue
          });
          
          if (results.length === 0) {
            var terminalBody = document.getElementById(terminalBodyId);
            if (terminalBody) {
              // CRITICAL: Show more detailed error message
              let errorMsg = '⚠️ No output received';
              if (res.message) {
                errorMsg += '\n\nServer message: ' + res.message;
              }
              if (!res.success) {
                errorMsg += '\n\nRequest failed. Check console for details.';
              }
              errorMsg += '\n\nInput used: ' + (stdinValue || '(empty)');
              terminalBody.textContent = errorMsg;
            }
            console.error('❌ [RUN CODE WITH INPUT] No results returned from API. Response:', res);
            console.error('❌ [RUN CODE WITH INPUT] stdinValue sent:', stdinValue);
            return;
          }
          
          var firstResult = results[0] || {};
          var out = firstResult.output || firstResult.stdout || firstResult.outputText || (firstResult.data && firstResult.data.output) || '';
          var err = firstResult.error || firstResult.stderr || (firstResult.data && firstResult.data.error) || '';
          // Format error message if there's an error
          let outputText = '';
          if (err) {
            const activity = window.__previewActivityData || {};
            const meta = activity.instructions ? (typeof activity.instructions === 'string' ? JSON.parse(activity.instructions || '{}') : activity.instructions) : {};
            const language = (meta.language || 'cpp').toLowerCase();
            const errorInfo = window.formatErrorMessage ? window.formatErrorMessage(err, language) : null;
            if (errorInfo) {
              outputText = errorInfo.message;
            } else {
              outputText = 'Error: ' + err;
            }
          } else {
            outputText = String(out || '').trim();
          }
          
          // CRITICAL: Get the selected test case index (from parameter or stored value)
          let targetTestIndex = selectedTestIndex !== undefined ? selectedTestIndex : 0;
          if (window.__previewSelectedTestIndex !== undefined) {
            targetTestIndex = window.__previewSelectedTestIndex;
            delete window.__previewSelectedTestIndex; // Clean up
          }
          
          // CRITICAL: Smart output matching - check if output matches any test case's expected output
          const activity = window.__previewActivityData || {};
          const testCases = activity.testCases || activity.test_cases || [];
          const norm = s => String(s == null ? '' : s).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
          const normalizedOutput = norm(outputText);
          
          let finalTargetIndex = targetTestIndex; // Default to selected test case
          let matchedTestCase = null;
          
          if (!err && normalizedOutput !== '') {
            // Check all test cases to see if output matches any expected output
            for (let i = 0; i < testCases.length; i++) {
              const tc = testCases[i] || {};
              const expected = norm(tc.expected_output || tc.expectedOutput || tc.expected_output_text || '');
              
              if (expected !== '' && normalizedOutput === expected) {
                finalTargetIndex = i;
                matchedTestCase = i + 1;
                console.log(`🎯 [SMART MATCH] Output "${normalizedOutput}" matches Test Case ${i + 1} expected output! Auto-detected.`);
                break; // Use first match
              }
            }
            
            if (matchedTestCase) {
              console.log(`✅ [SMART MATCH] Output will be recorded to Test Case ${matchedTestCase} (matched expected output)`);
            } else {
              console.log(`ℹ️ [RUN CODE WITH INPUT] Output "${normalizedOutput}" doesn't match any expected output, using selected Test Case ${targetTestIndex + 1}`);
            }
          }
          
          console.log('🔍 [RUN CODE WITH INPUT] Updating test case', finalTargetIndex + 1, 'with output:', outputText);
          
          // CRITICAL: Update the MATCHED or SELECTED test case's "Your Output" field
          try {
            var yourOutputEl = document.getElementById(`tcYour-${finalTargetIndex}`);
            if (yourOutputEl) {
              yourOutputEl.textContent = outputText || '(no output)';
              console.log('✅ [RUN CODE WITH INPUT] Updated test case', finalTargetIndex + 1, 'output field');
              
              // Update visual status based on output match
              if (window.updateTestCaseStatus) {
                const expectedEl = document.getElementById(`tcExpected-${finalTargetIndex}`);
                const expectedText = expectedEl ? expectedEl.textContent.trim() : '';
                const normalizedOutput = norm(outputText);
                const normalizedExpected = norm(expectedText);
                const matches = !err && normalizedOutput !== '' && normalizedExpected !== '' && normalizedOutput === normalizedExpected;
                const status = err ? 'RE' : (matches ? 'AC' : (normalizedOutput !== '' ? 'WA' : ''));
                window.updateTestCaseStatus(finalTargetIndex, status);
                console.log(`✅ [RUN CODE WITH INPUT] TC ${finalTargetIndex + 1} visual status updated: ${status}`);
              }
              
              // If smart matched, also update the visual selection
              if (matchedTestCase && finalTargetIndex !== targetTestIndex) {
                // Update visual highlight to matched test case
                const allCases = document.querySelectorAll('.codestem-test-case');
                allCases.forEach((testCaseEl, idx) => {
                  if (idx === finalTargetIndex) {
                    testCaseEl.style.borderColor = '#10b981';
                    testCaseEl.style.borderWidth = '2px';
                    testCaseEl.style.background = '#f0fdf4';
                    // Also update radio button for consistency
                    const radio = testCaseEl.querySelector(`input[name="preview-tc"][value="${finalTargetIndex}"]`);
                    if (radio) radio.checked = true;
                    window.__previewLastClickedTestIndex = finalTargetIndex;
                  } else if (idx === targetTestIndex) {
                    // Remove highlight from originally selected
                    testCaseEl.style.borderColor = '#e5e7eb';
                    testCaseEl.style.borderWidth = '1px';
                    testCaseEl.style.background = '#f9fafb';
                  }
                });
                console.log(`🎯 [SMART MATCH] Visual selection updated to Test Case ${finalTargetIndex + 1}`);
              }
            } else {
              console.warn('⚠️ [RUN CODE WITH INPUT] Output element not found for test case', finalTargetIndex + 1, '(`tcYour-${finalTargetIndex}`)');
            }
          } catch(e) {
            console.warn('Could not update test case output:', e);
          }
          
          // Display output in terminal
          var terminalBody = document.getElementById(terminalBodyId);
          if (terminalBody) {
            var terminalOutput = '';
            if (userInput) {
              var firstPrompt = window.playTerminalPromptText || 'Enter value:';
              terminalOutput = firstPrompt + ' ' + userInput + '\n\n';
            }
            terminalOutput += outputText || '(no output)';
            terminalOutput += '\n\n>>> Program Terminated';
            terminalBody.textContent = terminalOutput;
          }
        })
        .catch(function(err) {
          console.error('❌ Run Code Error:', err);
          var terminalBody = document.getElementById(terminalBodyId);
          if (terminalBody) {
            terminalBody.textContent = '❌ Error: ' + (err && err.message ? err.message : err);
          }
        })
        .finally(function() {
          // CRITICAL: Reset execution flag so user can run code again
          window.__previewRunHandlerExecuting = false;
          // Reset loading state using helper
          if (window.setPreviewButtonLoading) {
            window.setPreviewButtonLoading('previewRunBtn', false);
          } else if (runBtn) {
            runBtn.disabled = false;
            runBtn.innerHTML = '<i class="fas fa-play"></i> Run Code';
          }
        });
    }
    
    // Helper function to escape HTML
    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, function(c) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c];
      });
    }
    
    // CRITICAL: Create REAL test handler IMMEDIATELY (before HTML is returned)
    // This prevents "Test handler not ready" error
    window.__previewTestHandler = function(e) {
      console.log('🔴 [PREVIEW MODE] Test button clicked via window.__previewTestHandler!');
      
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      const activity = window.__previewActivityData || {};
      const testCases = activity.test_cases || activity.testCases || [];
      const testBtn = document.getElementById('previewTestBtn');
      const testDiv = document.getElementById('previewTestResults');
      
      // Get code function (same as in bindPreviewHandlers)
      const getCode = () => {
        try {
          if (window.__previewEditor && typeof window.__previewEditor.getValue === 'function') {
            const code = window.__previewEditor.getValue();
            if (code && code.trim()) return code;
          }
        } catch(e) {
          console.warn('Monaco editor getValue failed:', e);
        }
        
        try {
          const textarea = document.getElementById('previewCodeTextarea');
          if (textarea && textarea.value) {
            return textarea.value;
          }
        } catch(e) {
          console.warn('Textarea read failed:', e);
        }
        
        return '';
      };
      
      const code = getCode().trim();
      console.log('📝 [PREVIEW MODE] Code extracted:', code ? `${code.length} chars` : 'EMPTY');
      
      if (!code) {
        console.warn('⚠️ [PREVIEW MODE] No code found!');
        if (testDiv) {
          testDiv.style.display = 'block';
          testDiv.innerHTML = '<div style="color:#dc3545;">❌ Please write some code first</div>';
        }
        return false;
      }

      // Store test start time for duration calculation
      window.__previewTestStartTime = Date.now();
      
      // Set loading state using helper
      if (window.setPreviewButtonLoading) {
        window.setPreviewButtonLoading('previewTestBtn', true, 'Testing...');
      } else if (testBtn) {
        testBtn.disabled = true;
        testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
      }
      // Don't show "Running all test cases..." message - modal will show results directly
      // if (testDiv) {
      //   testDiv.style.display = 'block';
      //   testDiv.innerHTML = '<div style="color:#0ea5e9;">🔄 Running all test cases... <span style="font-size:11px;color:#6b7280;">(Preview Mode - No Save)</span></div>';
      // }

      console.log('🚀 [PREVIEW MODE] Sending API request to run all test cases...');
      let fd = new FormData();
      fd.append('action','run_activity');
      fd.append('activity_id', String(activity.id || activity.activity_id || ''));
      fd.append('source', code);
      
      // CRITICAL: Add CSRF token before sending
      ;(async function(){ 
        try { 
          fd = await addCSRFToken(fd); 
        } catch(e){ 
          console.warn('⚠️ [CSRF] addCSRFToken failed, trying manual fetch:', e);
          try {
            const token = await getCSRFToken();
            if (token) fd.append('csrf_token', token);
          } catch(e2) {}
        } 
        return fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' }); 
      })()
        .then(r => {
          console.log('📡 [PREVIEW MODE] API Response status:', r.status);
          if (!r.ok) {
            throw new Error(`HTTP ${r.status}: ${r.statusText}`);
          }
          return r.json();
        })
        .then(res => {
          console.log('📊 [PREVIEW MODE] API Response:', {
            success: res && res.success,
            resultsCount: Array.isArray(res.results) ? res.results.length : 0,
            message: res && res.message
          });
          
          if (!res || !res.success) throw new Error(res && res.message ? res.message : 'Run failed');
          const results = Array.isArray(res.results) ? res.results : [];
          console.log('✅ [PREVIEW MODE] Test results received:', results.length, 'results');
          console.log('🔍 [PREVIEW MODE] Test cases count:', testCases.length);
          
          // CRITICAL: Validate that we received results for all test cases
          if (results.length !== testCases.length) {
            console.warn(`⚠️ [PREVIEW MODE] MISMATCH: Expected ${testCases.length} results but got ${results.length}!`);
            console.warn(`⚠️ [PREVIEW MODE] This might indicate the backend only ran some test cases.`);
            console.warn(`⚠️ [PREVIEW MODE] Missing results will be treated as empty/failed.`);
          }
          
          console.log('🔍 [PREVIEW MODE] Results array:', results.map((r, idx) => ({
            index: idx,
            hasOutput: !!(r.output || r.stdout || r.outputText || (r.data && r.data.output)),
            output: r.output || r.stdout || r.outputText || (r.data && r.data.output) || '(no output)',
            hasError: !!(r.error || r.stderr || (r.data && r.data.error)),
            statusCode: r.statusCode || (r.data && r.data.statusCode) || 0
          })));
          
          // CRITICAL: Use EXACT same grading logic as student view
          const norm = s => String(s == null ? '' : s).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
          
          // CRITICAL FIX: Check if test cases have points. If not, distribute evenly from max_score
          const sumExistingPoints = (testCases || []).reduce((s, tc) => s + (parseInt(tc.points || 0, 10) || 0), 0);
          const maxScoreFromActivity = activity.max_score || 0;
          const needsPointDistribution = sumExistingPoints === 0 && maxScoreFromActivity > 0 && testCases.length > 0;
          const pointsPerCase = needsPointDistribution ? Math.floor(maxScoreFromActivity / testCases.length) : 0;
          
          // CRITICAL: Check required construct usage (once per run, not per test case)
          const requiredConstruct = activity.required_construct || activity.requiredConstruct || (activity.meta && (activity.meta.requiredConstruct || activity.meta.required_construct)) || '';
          const testLanguage = activity.language || (activity.meta && activity.meta.language) || 'cpp';
          const constructCheck = (function(){
            try {
              if (!requiredConstruct) return { ok: true, required: '' };
              return detectConstructUsage(code, testLanguage, requiredConstruct);
            } catch(e){ 
              console.warn('⚠️ [PREVIEW MODE] Construct detection error:', e);
              return { ok: true, required: '' }; 
            }
          })();
          
          console.log('🔍 [PREVIEW MODE] Required construct check:', {
            requiredConstruct,
            language,
            constructOk: constructCheck.ok,
            constructRequired: constructCheck.required
          });
          console.log('🔍 [PREVIEW MODE] Points check:', {
            sumExistingPoints,
            maxScoreFromActivity,
            testCasesCount: testCases.length,
            needsPointDistribution,
            pointsPerCase,
            testCasesWithPoints: (testCases || []).map((tc, i) => ({
              index: i + 1,
              points: parseInt(tc.points || 0, 10) || 0,
              rawPoints: tc.points
            }))
          });
          
          // CRITICAL: Ensure results array matches test cases array length
          console.log('🔍 [PREVIEW MODE] Mapping test cases to results...');
          console.log('🔍 [PREVIEW MODE] Test cases length:', testCases.length);
          console.log('🔍 [PREVIEW MODE] Results length:', results.length);
          
          if (results.length < testCases.length) {
            console.warn(`⚠️ [PREVIEW MODE] WARNING: Results array (${results.length}) is shorter than test cases (${testCases.length})!`);
            console.warn(`⚠️ [PREVIEW MODE] This might cause some test cases to not have outputs.`);
          }
          
          // CRITICAL: Ensure we have results for all test cases
          if (results.length < testCases.length) {
            console.warn(`⚠️ [PREVIEW MODE] WARNING: Only ${results.length} results for ${testCases.length} test cases!`);
            console.warn(`⚠️ [PREVIEW MODE] Missing results will be treated as failed test cases.`);
          }
          
          const cases = (testCases || []).map((tc, i) => {
            const expected = norm(tc.expected_output || tc.expectedOutput || tc.expected_output_text || '');
            const result = results[i] || {};
            
            // CRITICAL: Log the RAW result object to see what we're getting
            console.log(`🔍 [PREVIEW MODE] TC ${i + 1} RAW result object:`, {
              resultExists: !!result,
              resultIndex: i,
              hasResult: i < results.length,
              resultKeys: result ? Object.keys(result) : [],
              resultOutput: result.output,
              resultStdout: result.stdout,
              resultOutputText: result.outputText,
              resultData: result.data,
              resultError: result.error,
              resultStderr: result.stderr,
              resultStatusCode: result.statusCode,
              fullResult: JSON.stringify(result)
            });
            
            // CRITICAL: If no result for this test case, mark as failed
            if (i >= results.length) {
              console.warn(`⚠️ [PREVIEW MODE] TC ${i + 1}: No result found (index ${i} >= results.length ${results.length})`);
            }
            
            const out = norm(result.output || result.stdout || result.outputText || (result.data && result.data.output) || '');
            const err = result.error || result.stderr || (result.data && result.data.error) || '';
            const statusCode = result.statusCode || (result.data && result.data.statusCode) || 0;
            
            console.log(`🔍 [PREVIEW MODE] TC ${i + 1} mapping:`, {
              hasResult: !!result,
              resultIndex: i,
              output: out || '(no output)',
              outputLength: out ? out.length : 0,
              expected: expected,
              expectedLength: expected ? expected.length : 0,
              hasError: !!(err || (statusCode !== 200 && statusCode !== 0)),
              error: err || 'none',
              statusCode: statusCode
            });
            
            const hasError = err || (statusCode !== 200 && statusCode !== 0);
            const passed = !hasError && (expected === '' ? out !== '' : (out === expected));
            
            // CRITICAL: Log pass/fail status for debugging
            console.log(`🔍 [PREVIEW MODE] TC ${i + 1} pass check:`, {
              hasError,
              output: out || '(no output)',
              expected: expected,
              passed,
              outputMatches: (expected === '' ? out !== '' : (out === expected))
            });
            
            // CRITICAL FIX: Use distributed points if test case has no points
            const tcPoints = parseInt(tc.points || 0, 10) || 0;
            const actualPoints = tcPoints > 0 ? tcPoints : (needsPointDistribution ? pointsPerCase : 0);
            // CRITICAL: Apply required construct deduction (50% if construct not used)
            let pts = passed ? actualPoints : 0;
            if (passed && requiredConstruct && constructCheck && constructCheck.ok === false && pts > 0) {
              pts = Math.max(1, Math.round(actualPoints * 0.5));
              console.log(`⚠️ [PREVIEW MODE] TC ${i + 1}: Required construct "${requiredConstruct}" not found! Deducting 50%: ${actualPoints} → ${pts}`);
            }
            
            // CRITICAL: Log points calculation for debugging
            console.log(`🔍 [PREVIEW MODE] TC ${i + 1} points:`, {
              tcPoints,
              actualPoints,
              passed,
              earned: pts,
              constructOk: constructCheck.ok,
              requiredConstruct: requiredConstruct || 'none'
            });
            
            // Format error message if there's an error
            let formattedStdout = out || '';
            if (hasError && err) {
              const errorInfo = window.formatErrorMessage ? window.formatErrorMessage(err, testLanguage) : null;
              if (errorInfo) {
                formattedStdout = errorInfo.message;
              } else {
                formattedStdout = `Error: ${err}`;
              }
            }
            
            const caseResult = {
              name: `Test Case ${i + 1}`,
              expected: expected,
              stdout: formattedStdout,
              status: passed ? 'AC' : (hasError ? 'RE' : 'WA'),
              earned: pts,
              points: actualPoints
            };
            
            // CRITICAL: Log the final case result to verify stdout is set correctly
            console.log(`🔍 [PREVIEW MODE] TC ${i + 1} final case result:`, {
              name: caseResult.name,
              stdout: caseResult.stdout,
              stdoutLength: caseResult.stdout ? caseResult.stdout.length : 0,
              status: caseResult.status,
              earned: caseResult.earned,
              points: caseResult.points
            });
            
            return caseResult;
          });
          
          // CRITICAL: Calculate total points with detailed logging
          console.log('🔍 [PREVIEW MODE] ========== CALCULATING SCORE ==========');
          console.log('🔍 [PREVIEW MODE] Cases array:', cases.map((c, idx) => ({
            index: idx + 1,
            name: c.name,
            status: c.status,
            earned: c.earned,
            points: c.points,
            stdout: c.stdout || '(no output)',
            expected: c.expected
          })));
          
          const totalPts = cases.reduce((s, c) => {
            const sum = s + c.earned;
            console.log(`🔍 [PREVIEW MODE] Adding ${c.earned} points from ${c.name} (status: ${c.status}), running total: ${sum}`);
            return sum;
          }, 0);
          
          const totalMax = sumExistingPoints > 0 ? sumExistingPoints : (needsPointDistribution ? maxScoreFromActivity : maxScoreFromActivity);
          const passedCount = cases.filter(c => c.status === 'AC').length;
          const totalCount = cases.length;
          
          console.log('📊 [PREVIEW MODE] ========== FINAL SCORE CALCULATION ==========');
          console.log('📊 [PREVIEW MODE] Total Points (earned):', totalPts);
          console.log('📊 [PREVIEW MODE] Total Max Score:', totalMax);
          console.log('📊 [PREVIEW MODE] Passed Count:', passedCount, '/', totalCount);
          console.log('📊 [PREVIEW MODE] Used Distributed Points:', needsPointDistribution);
          console.log('📊 [PREVIEW MODE] Individual Case Details:', cases.map(c => ({ 
            name: c.name, 
            status: c.status, 
            earned: c.earned, 
            points: c.points 
          })));
          console.log('📊 [PREVIEW MODE] ============================================');
          
          // Determine verdict
          let verdict = 'AC';
          if (passedCount === 0) {
            verdict = 'WA'; // All wrong
          } else if (passedCount < totalCount) {
            verdict = 'PA'; // Partially accepted
          }
          
          // CRITICAL: Submit through unified submission system (submit_activity.php)
          // BUT ONLY IF USER IS A STUDENT - Coordinator/Teacher are just previewing
          const testStartTime = window.__previewTestStartTime || Date.now();
          const durationMs = Date.now() - testStartTime;
          const activityId = activity.id || activity.activity_id || 0;
          const meta = window.__codingPreviewCtx && window.__codingPreviewCtx.meta ? window.__codingPreviewCtx.meta : {};
          const submissionLanguage = (meta && meta.language) ? String(meta.language).toLowerCase() : testLanguage || 'cpp';
          
          // CRITICAL: Check user role - only students should record scores
          const userRole = (window.__USER_ROLE__ || '').toLowerCase();
          const isStudent = userRole === 'student';
          
          console.log('🔍 [PREVIEW MODE] User role:', userRole, '| Is Student:', isStudent);
          
          // Save attempt asynchronously (don't block UI) - ONLY FOR STUDENTS
          if (isStudent) {
            (async function saveSubmission() {
              try {
                console.log('💾 [PREVIEW MODE] Saving submission to database via unified system (STUDENT MODE)...');
              
              // Prepare answers object for unified submission system
              // For coding activities, we store the code and results in a special format
              const codingAnswers = {
                code: code,
                language: submissionLanguage,
                results: results,
                testCases: cases,
                verdict: verdict,
                constructCheck: constructCheck
              };
              
              // Get or create attempt ID
              let attemptId = window.__CURRENT_ATTEMPT_ID__ || null;
              if (!attemptId) {
                // Start a new attempt
                try {
                  const startResponse = await fetch('submit_activity.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                      action: 'start_attempt',
                      activity_id: activityId
                    })
                  });
                  if (startResponse.ok) {
                    const startData = await startResponse.json();
                    if (startData.success && startData.attempt_id) {
                      attemptId = startData.attempt_id;
                      window.__CURRENT_ATTEMPT_ID__ = attemptId;
                    }
                  }
                } catch (e) {
                  console.warn('⚠️ [PREVIEW MODE] Could not start attempt:', e);
                }
              }
              
              // Submit through unified system
              // CRITICAL: Include score in codingAnswers so backend can extract it
              codingAnswers.score = totalPts;
              
              const submissionData = {
                action: 'submit',
                activity_id: activityId,
                attempt_id: attemptId,
                answers: { 'coding': codingAnswers }, // Store coding data in answers object
                time_spent_ms: durationMs
                // Note: score is included in codingAnswers.score, backend will extract it
              };
              
              console.log('📤 [PREVIEW MODE] Submitting coding activity through unified system:', submissionData);
              
              const submitResponse = await fetch('submit_activity.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(submissionData)
              });
              
              if (submitResponse.ok) {
                const submitResult = await submitResponse.json();
                if (submitResult.success) {
                  console.log('✅ [PREVIEW MODE] Coding activity submitted successfully:', submitResult);
                  
                  // CRITICAL: Update score display immediately
                  const scoreEl = document.getElementById('previewScoreValue');
                  if (scoreEl) {
                    scoreEl.textContent = String(totalPts);
                    console.log('✅ [PREVIEW MODE] Score display updated to:', totalPts);
                  }
                  
                  // Update activity card score (if function available)
                  if (typeof updateActivityCardScore === 'function') {
                    try {
                      updateActivityCardScore(activityId, totalPts);
                      console.log('✅ [PREVIEW MODE] Activity card score updated');
                    } catch (e) {
                      console.warn('⚠️ [PREVIEW MODE] updateActivityCardScore error:', e);
                    }
                  } else {
                    console.log('ℹ️ [PREVIEW MODE] updateActivityCardScore not available (may be in full-page preview)');
                  }
                  
                  // Refresh scores after a delay (if function available)
                  setTimeout(() => {
                    if (typeof loadAllStudentScores === 'function') {
                      try {
                        loadAllStudentScores();
                        console.log('✅ [PREVIEW MODE] Student scores refreshed');
                      } catch (e) {
                        console.warn('⚠️ [PREVIEW MODE] loadAllStudentScores error:', e);
                      }
                    } else {
                      console.log('ℹ️ [PREVIEW MODE] loadAllStudentScores not available (may be in full-page preview)');
                    }
                  }, 2000);
                  
                  // Show success notification
                  if (typeof showNotification === 'function') {
                    showNotification('success', `Score recorded: ${totalPts}/${totalMax} points!`);
                  } else if (typeof window.showNotification === 'function') {
                    window.showNotification('success', `Score recorded: ${totalPts}/${totalMax} points!`);
                  }
                } else {
                  console.error('❌ [PREVIEW MODE] Submission returned success=false:', submitResult);
                  const errorMsg = submitResult.message || 'Submission failed';
                  if (typeof showNotification === 'function') {
                    showNotification('error', `Failed to record score: ${errorMsg}`);
                  } else if (typeof window.showNotification === 'function') {
                    window.showNotification('error', `Failed to record score: ${errorMsg}`);
                  } else {
                    alert(`Failed to record score: ${errorMsg}`);
                  }
                }
              } else {
                const errorText = await submitResponse.text();
                console.error('❌ [PREVIEW MODE] Submission failed with status:', submitResponse.status, errorText);
                if (typeof showNotification === 'function') {
                  showNotification('error', `Failed to record score: HTTP ${submitResponse.status}`);
                } else if (typeof window.showNotification === 'function') {
                  window.showNotification('error', `Failed to record score: HTTP ${submitResponse.status}`);
                } else {
                  alert(`Failed to record score: HTTP ${submitResponse.status}`);
                }
              }
            } catch (submitErr) {
              console.error('❌ [PREVIEW MODE] Error saving submission:', submitErr);
              const errorMsg = submitErr && submitErr.message ? submitErr.message : 'Unknown error';
              if (typeof showNotification === 'function') {
                showNotification('error', `Error recording score: ${errorMsg}`);
              } else if (typeof window.showNotification === 'function') {
                window.showNotification('error', `Error recording score: ${errorMsg}`);
              } else {
                alert(`Error recording score: ${errorMsg}`);
              }
            }
          })();
          } else {
            console.log('ℹ️ [PREVIEW MODE] User is ' + userRole + ' - NOT recording score (preview only)');
          }
          
          // CRITICAL: Show results modal
          console.log('🎯 [PREVIEW MODE] About to show results modal');
          try {
            showCodestemResultsModal(cases, totalPts, totalMax, passedCount, totalCount);
            console.log('✅ [PREVIEW MODE] Results modal should be displayed');
          } catch (modalErr) {
            console.error('❌ [PREVIEW MODE] Error showing results modal:', modalErr);
            if (testDiv) {
              testDiv.innerHTML = '<div style="color:#dc3545;">Error showing results modal. Check console.</div>';
            }
          }
          
          // CRITICAL: Update score and test case outputs
          console.log('🔍 [PREVIEW MODE] ========== UPDATING SCORE DISPLAY ==========');
          console.log('🔍 [PREVIEW MODE] Score to display:', totalPts, '/', totalMax);
          
          // CRITICAL: Use setTimeout to ensure DOM is ready and modal is not interfering
          setTimeout(() => {
            const scoreEl = document.getElementById('previewScoreValue');
            console.log('🔍 [PREVIEW MODE] Score element lookup:', scoreEl ? 'FOUND' : 'NOT FOUND');
            
            if (scoreEl) {
              const oldValue = scoreEl.textContent;
              scoreEl.textContent = String(totalPts);
              console.log(`✅ [PREVIEW MODE] Score element updated: "${oldValue}" → "${totalPts}"`);
              console.log(`✅ [PREVIEW MODE] Score element ID:`, scoreEl.id);
              console.log(`✅ [PREVIEW MODE] Score element parent:`, scoreEl.parentElement ? scoreEl.parentElement.textContent : 'NO PARENT');
              
              // CRITICAL: Also update parent if it shows "Score: X/Y" format
              const scoreParent = scoreEl.parentElement;
              if (scoreParent && scoreParent.textContent.includes('Score:')) {
                const maxScoreText = scoreParent.textContent.match(/\/(\d+)/);
                if (maxScoreText) {
                  const maxScore = maxScoreText[1];
                  scoreParent.innerHTML = `Score: <span id="previewScoreValue">${totalPts}</span>/${maxScore}`;
                  console.log('✅ [PREVIEW MODE] Updated score parent element:', scoreParent.textContent);
                  
                  // CRITICAL: Verify the update worked
                  const verifyEl = document.getElementById('previewScoreValue');
                  if (verifyEl && verifyEl.textContent === String(totalPts)) {
                    console.log('✅ [PREVIEW MODE] Score update verified successfully!');
                  } else {
                    console.error('❌ [PREVIEW MODE] Score update verification FAILED!', {
                      expected: totalPts,
                      actual: verifyEl ? verifyEl.textContent : 'ELEMENT NOT FOUND'
                    });
                  }
                } else {
                  console.warn('⚠️ [PREVIEW MODE] Could not extract max score from parent text:', scoreParent.textContent);
                }
              } else {
                console.warn('⚠️ [PREVIEW MODE] Score parent does not contain "Score:" or has no parent');
              }
            } else {
              console.error('❌ [PREVIEW MODE] Score element NOT FOUND! Searching for alternatives...');
              // Try alternative selectors
              const altScoreEl = document.querySelector('[id*="Score"]') || 
                                document.querySelector('[id*="score"]') ||
                                document.querySelector('span[id*="Score"]') ||
                                document.querySelector('span[id*="score"]');
              if (altScoreEl) {
                console.log('✅ [PREVIEW MODE] Found alternative score element:', altScoreEl.id);
                altScoreEl.textContent = String(totalPts);
              } else {
                console.error('❌ [PREVIEW MODE] Could not find score element with any selector!');
                // Try to find all elements that might be the score
                const allScoreElements = document.querySelectorAll('[id*="score"], [id*="Score"]');
                console.error(`❌ [PREVIEW MODE] Found ${allScoreElements.length} potential score elements:`, 
                  Array.from(allScoreElements).map(el => ({ id: el.id, text: el.textContent, tag: el.tagName })));
              }
            }
            console.log('✅ [PREVIEW MODE] ========== SCORE UPDATE COMPLETE ==========');
          }, 200); // Increased delay to ensure modal and DOM are ready
          
          // CRITICAL: Update all test case outputs AND expand test case details
          console.log('🔍 [PREVIEW MODE] ========== UPDATING TEST CASE OUTPUTS ==========');
          console.log('🔍 [PREVIEW MODE] Total cases to update:', cases.length);
          console.log('🔍 [PREVIEW MODE] Cases data:', cases.map((c, idx) => ({
            index: idx,
            name: c.name,
            stdout: c.stdout,
            stdoutLength: c.stdout ? c.stdout.length : 0,
            stdoutIsEmpty: !c.stdout || c.stdout === '',
            status: c.status,
            expected: c.expected
          })));
          
          // CRITICAL: Use setTimeout to ensure DOM is ready, but use a longer delay to ensure modal doesn't interfere
          // Use a longer delay (500ms) to ensure modal is fully rendered and doesn't block DOM updates
          setTimeout(() => {
            console.log('🔍 [PREVIEW MODE] Starting test case output updates (after modal delay)...');
            cases.forEach((c, i) => {
              console.log(`🔍 [PREVIEW MODE] ========== Processing TC ${i + 1} ==========`);
              console.log(`🔍 [PREVIEW MODE] TC ${i + 1} case data:`, {
                name: c.name,
                stdout: c.stdout,
                stdoutLength: c.stdout ? c.stdout.length : 0,
                stdoutIsEmpty: !c.stdout || c.stdout === '',
                status: c.status,
                expected: c.expected
              });
              
              // CRITICAL: Find and update "Your Output" field - try multiple selectors
              let your = document.getElementById(`tcYour-${i}`);
              console.log(`🔍 [PREVIEW MODE] TC ${i + 1} element lookup (tcYour-${i}):`, your ? 'FOUND' : 'NOT FOUND');
              
              if (!your) {
                console.warn(`⚠️ [PREVIEW MODE] Element tcYour-${i} not found, trying alternatives...`);
                // Try alternative selectors
                your = document.querySelector(`pre[id="tcYour-${i}"]`) || 
                       document.querySelector(`#tcYour-${i}`) ||
                       document.querySelector(`[id*="tcYour"][id*="${i}"]`) ||
                       document.querySelector(`pre[id*="tcYour"][id*="${i}"]`);
                console.log(`🔍 [PREVIEW MODE] TC ${i + 1} alternative lookup:`, your ? 'FOUND' : 'STILL NOT FOUND');
              }
              
              if (your) {
                // CRITICAL: ALWAYS update with the result from "Test All Cases" - don't preserve old outputs
                // This ensures all test cases show their results after "Test All Cases" is run
                // Use formatted error message if available, otherwise use stdout or default
                const outputText = c.stdout || (c.status === 'RE' ? 'Error: Runtime Error' : '(no output)');
                
                console.log(`🔍 [PREVIEW MODE] TC ${i + 1} output decision:`, {
                  caseStdout: c.stdout,
                  caseStdoutLength: c.stdout ? c.stdout.length : 0,
                  status: c.status,
                  finalOutput: outputText
                });
                
                // CRITICAL: ALWAYS update the output - this is from "Test All Cases" so it's the authoritative result
                your.textContent = outputText;
                console.log(`✅ [PREVIEW MODE] TC ${i + 1} output updated to:`, outputText);
                
                console.log(`✅ [PREVIEW MODE] TC ${i + 1} element found:`, your.id, 'tag:', your.tagName, 'final text:', your.textContent);
                
                // CRITICAL: Update visual status based on test case result
                if (window.updateTestCaseStatus) {
                  window.updateTestCaseStatus(i, c.status, c.earned, c.points);
                  console.log(`✅ [PREVIEW MODE] TC ${i + 1} visual status updated: ${c.status}`);
                }
                
                // CRITICAL: Auto-expand test case details if output matches expected (smart detection)
                const expectedEl = document.getElementById(`tcExpected-${i}`);
                const expectedText = expectedEl ? expectedEl.textContent.trim() : '';
                const normalizedOutput = norm(outputText);
                const normalizedExpected = norm(expectedText);
                const matches = normalizedOutput === normalizedExpected && normalizedOutput !== '';
                
                if (matches) {
                  // CRITICAL: Auto-expand this test case to show the match
                  const tcDetails = document.getElementById(`tcDetails-${i}`);
                  if (tcDetails) {
                    tcDetails.style.display = 'block';
                    console.log(`✅ [PREVIEW MODE] Auto-expanded TC ${i + 1} because output matches expected`);
                  }
                  // Also check the radio button to show it's selected
                  const radioBtn = document.querySelector(`input[name="preview-tc"][value="${i}"]`);
                  if (radioBtn) {
                    radioBtn.checked = true;
                  }
                }
              } else {
                console.error(`❌ [PREVIEW MODE] CRITICAL: Output element NOT FOUND for TC ${i + 1} (tcYour-${i})`);
                // Try to find all elements with "tcYour" in their ID
                const allYourElements = document.querySelectorAll('[id*="tcYour"]');
                console.error(`❌ [PREVIEW MODE] Found ${allYourElements.length} elements with "tcYour" in ID:`, 
                  Array.from(allYourElements).map(el => ({ id: el.id, tag: el.tagName })));
              }
              
              // CRITICAL: Update differences field
              const diff = document.getElementById(`tcDiff-${i}`);
              if (diff) {
                if (c.status === 'AC') {
                  diff.textContent = 'No differences. Output matched expected.';
                  diff.style.background = '#f0fdf4';
                  diff.style.borderColor = '#86efac';
                } else {
                  diff.textContent = `Expected:\n${c.expected}\n\nActual:\n${c.stdout}`;
                  diff.style.background = '#fff7ed';
                  diff.style.borderColor = '#fed7aa';
                }
                console.log(`✅ [PREVIEW MODE] TC ${i + 1} differences field updated`);
              } else {
                console.warn(`⚠️ [PREVIEW MODE] Differences element not found for TC ${i + 1} (tcDiff-${i})`);
              }
            });
            console.log('✅ [PREVIEW MODE] ========== ALL TEST CASE OUTPUTS UPDATED ==========');
            // CRITICAL: Verify all outputs were updated correctly
            console.log('🔍 [PREVIEW MODE] ========== VERIFYING OUTPUTS ==========');
            cases.forEach((c, i) => {
              const verifyEl = document.getElementById(`tcYour-${i}`);
              if (verifyEl) {
                console.log(`🔍 [PREVIEW MODE] TC ${i + 1} verification:`, {
                  elementFound: true,
                  elementText: verifyEl.textContent,
                  expectedStdout: c.stdout,
                  matches: verifyEl.textContent === c.stdout
                });
              } else {
                console.error(`❌ [PREVIEW MODE] TC ${i + 1} verification FAILED: Element not found!`);
              }
            });
            console.log('✅ [PREVIEW MODE] ========== VERIFICATION COMPLETE ==========');
          }, 500); // Longer delay to ensure modal doesn't interfere with DOM updates
        })
        .catch(err => {
          console.error('❌ [PREVIEW MODE] Test failed:', err);
          if (testDiv) {
            testDiv.innerHTML = `<div style="color:#dc3545;">❌ Test failed: ${err && err.message ? err.message : err}</div>`;
          }
        })
        .finally(() => {
          // Reset loading state using helper
          if (window.setPreviewButtonLoading) {
            window.setPreviewButtonLoading('previewTestBtn', false);
          } else if (testBtn) {
            testBtn.disabled = false;
            testBtn.innerHTML = '<i class="fas fa-vial"></i> Test & Submit';
          }
        });
      
      return false;
    };
    
    // CRITICAL: Create Check Test handler (tests ONE test case and shows input/output clearly)
    window.__previewCheckTestHandler = function(e) {
      console.log('🔍 [CHECK TEST] Check Test button clicked!');
      
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      // Guard to avoid duplicate requests/credits
      if (window.__previewCheckExecuting) {
        console.warn('⏳ [CHECK TEST] Already running; skipping duplicate click');
        return false;
      }
      window.__previewCheckExecuting = true;
      
      const activity = window.__previewActivityData || {};
      const testCases = activity.test_cases || activity.testCases || [];
      
      // CRITICAL: Smart detection - use last clicked test case OR selected radio button
      // Priority: 1) Last clicked test case (stored in window), 2) Selected radio button, 3) Last test case
      let selectedIndex = 0;
      
      // Check if there's a last clicked test case (smart detection)
      if (window.__previewLastClickedTestIndex !== undefined) {
        selectedIndex = parseInt(window.__previewLastClickedTestIndex, 10) || 0;
        console.log('✅ [CHECK TEST] Using last clicked test case (smart detection):', selectedIndex + 1);
      } else {
        // Fallback to radio button selection
        const selectedRadio = document.querySelector('input[name="preview-tc"]:checked');
        if (selectedRadio && selectedRadio.value !== undefined) {
          selectedIndex = parseInt(selectedRadio.value, 10) || 0;
          console.log('✅ [CHECK TEST] Using selected radio button test case:', selectedIndex + 1);
        } else {
          // If no radio selected, use the LAST test case (as user requested)
          selectedIndex = testCases.length > 0 ? testCases.length - 1 : 0;
          console.log('ℹ️ [CHECK TEST] No test case selected, using LAST test case:', selectedIndex + 1);
        }
      }
      
      // Get the selected test case
      const selectedTestCase = testCases[selectedIndex] || {};
      
      if (!selectedTestCase || !selectedTestCase.input_text) {
        alert('No test case available to check.');
        return false;
      }
      
      console.log('🔍 [CHECK TEST] Testing test case:', selectedIndex + 1, selectedTestCase);
      
      const checkBtn = document.getElementById('previewCheckTestBtn');
      
      // Get code function
      const getCode = () => {
        try {
          if (window.__previewEditor && typeof window.__previewEditor.getValue === 'function') {
            const code = window.__previewEditor.getValue();
            if (code && code.trim()) return code;
          }
        } catch(e) {
          console.warn('Monaco editor getValue failed:', e);
        }
        
        try {
          const textarea = document.getElementById('previewCodeTextarea');
          if (textarea && textarea.value) {
            return textarea.value;
          }
        } catch(e) {
          console.warn('Textarea read failed:', e);
        }
        
        return '';
      };
      
      const code = getCode().trim();
      if (!code) {
        alert('Please write some code first.');
        return false;
      }
      
      // Set loading state using helper
      if (window.setPreviewButtonLoading) {
        window.setPreviewButtonLoading('previewCheckTestBtn', true, 'Checking...');
      } else if (checkBtn) {
        checkBtn.disabled = true;
        checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
      }
      
      // Run code with SELECTED test case (quick mode - 1 credit)
      // Use stdin parameter to override the input with selected test case
      const stdinValue = selectedTestCase.input_text || selectedTestCase.inputText || '';
      
      // DEEP DEBUG: Log what we're sending
      console.log('🔍 [CHECK TEST DEBUG] ============================================');
      console.log('🔍 [CHECK TEST DEBUG] Selected test case index:', selectedIndex);
      console.log('🔍 [CHECK TEST DEBUG] Selected test case object:', selectedTestCase);
      console.log('🔍 [CHECK TEST DEBUG] stdin value (raw):', JSON.stringify(stdinValue));
      console.log('🔍 [CHECK TEST DEBUG] stdin value (display):', stdinValue);
      console.log('🔍 [CHECK TEST DEBUG] Code length:', code.length);
      console.log('🔍 [CHECK TEST DEBUG] Activity ID:', activity.id || activity.activity_id);
      
      let fd = new FormData();
      fd.append('action','run_activity');
      fd.append('activity_id', String(activity.id || activity.activity_id || ''));
      fd.append('source', code);
      fd.append('quick','1'); // Quick mode (single test case)
      fd.append('stdin', stdinValue); // Use selected test case input
      
      console.log('🔍 [CHECK TEST DEBUG] FormData prepared, sending API request...');
      
      // CRITICAL: Add CSRF token before sending
      ;(async function(){ 
        try { 
          fd = await addCSRFToken(fd); 
        } catch(e){ 
          console.warn('⚠️ [CSRF] addCSRFToken failed, trying manual fetch:', e);
          try {
            const token = await getCSRFToken();
            if (token) fd.append('csrf_token', token);
          } catch(e2) {}
        } 
        return fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' }); 
      })()
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
          return r.json();
        })
        .then(res => {
          if (!res || !res.success) {
            throw new Error(res && res.message ? res.message : 'Check failed');
          }
          
          const results = Array.isArray(res.results) ? res.results : [];
          const firstResult = results[0] || {};
          
          console.log('🔍 [CHECK TEST DEBUG] API Response received:');
          console.log('🔍 [CHECK TEST DEBUG] Results array length:', results.length);
          console.log('🔍 [CHECK TEST DEBUG] First result object:', firstResult);
          
          const actualOutput = firstResult.output || firstResult.stdout || firstResult.outputText || (firstResult.data && firstResult.data.output) || '';
          const error = firstResult.error || firstResult.stderr || (firstResult.data && firstResult.data.error) || '';
          const statusCode = firstResult.statusCode || (firstResult.data && firstResult.data.statusCode) || 0;
          
          console.log('🔍 [CHECK TEST DEBUG] actualOutput (raw):', JSON.stringify(actualOutput));
          console.log('🔍 [CHECK TEST DEBUG] error:', JSON.stringify(error));
          console.log('🔍 [CHECK TEST DEBUG] statusCode:', statusCode);
          
          const hasError = error || (statusCode !== 200 && statusCode !== 0);
          const outputText = hasError ? ('Error: ' + error) : String(actualOutput || '').trim();
          
          console.log('🔍 [CHECK TEST DEBUG] outputText (final):', JSON.stringify(outputText));
          
          // Normalize for comparison
          const norm = s => String(s == null ? '' : s).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
          const normalizedActual = norm(outputText);
          
          // DEEP DEBUG: Log all test cases and their expected outputs for debugging
          console.log('🔍 [CHECK TEST DEBUG] Selected test case:', selectedIndex + 1);
          console.log('🔍 [CHECK TEST DEBUG] Selected test case input:', selectedTestCase.input_text || selectedTestCase.inputText);
          console.log('🔍 [CHECK TEST DEBUG] Actual output (normalized):', JSON.stringify(normalizedActual));
          
          const allTestCases = activity.test_cases || activity.testCases || [];
          console.log('🔍 [CHECK TEST DEBUG] Total test cases:', allTestCases.length);
          
          // SMART DETECTION: Compare output with ALL test cases (frontend only, no extra credits!)
          const matchingTestCases = [];
          const isError = hasError || outputText.startsWith('Error:');
          
          if (!isError) {
            // Only do smart detection if output is NOT an error
            allTestCases.forEach((tc, idx) => {
              const tcInput = tc.input_text || tc.inputText || '';
              const tcExpected = tc.expected_output_text || tc.expected_output || tc.expectedOutput || '';
              const normalizedTcExpected = norm(tcExpected);
              const matches = normalizedTcExpected === '' ? normalizedActual !== '' : (normalizedActual === normalizedTcExpected);
              
              console.log(`  Test Case ${idx + 1}: input="${JSON.stringify(tcInput)}", expected="${JSON.stringify(normalizedTcExpected)}", matches=${matches}`);
              
              if (matches) {
                matchingTestCases.push({
                  index: idx,
                  testCase: tc,
                  points: parseInt(tc.points || 0, 10) || 0
                });
              }
            });
            console.log('✅ [CHECK TEST DEBUG] Smart detection found', matchingTestCases.length, 'matching test case(s):', matchingTestCases.map(m => `TC ${m.index + 1}`));
          } else {
            console.log('⚠️ [CHECK TEST DEBUG] Output is an error, skipping smart detection');
          }
          
          // Use the selected test case info for display
          const inputText = selectedTestCase.input_text || selectedTestCase.inputText || '(no input)';
          const expectedOutput = selectedTestCase.expected_output_text || selectedTestCase.expected_output || selectedTestCase.expectedOutput || '(no expected output)';
          const normalizedExpected = norm(expectedOutput);
          const passed = !isError && (normalizedExpected === '' ? normalizedActual !== '' : (normalizedActual === normalizedExpected));
          
          // Get points for selected test case
          const selectedPoints = parseInt(selectedTestCase.points || 0, 10) || 0;
  // Required construct gating
  const reqConstruct = window.__CURRENT_ACTIVITY_REQUIRED_CONSTRUCT__ || ((window.__CURRENT_ACTIVITY_META__||{}).requiredConstruct || '');
  let constructOk = true;
  try { if (reqConstruct) { constructOk = detectConstructUsage(code, (window.__CURRENT_ACTIVITY_META__||{}).language || 'cpp', reqConstruct).ok; } } catch(_){}
  let earnedPoints = (passed ? selectedPoints : 0);
  if (passed && !constructOk && earnedPoints > 0) {
    earnedPoints = Math.max(1, Math.round(selectedPoints * 0.5));
  }
          
          console.log('🔍 [CHECK TEST DEBUG] Selected TC expected (normalized):', JSON.stringify(normalizedExpected));
          console.log('🔍 [CHECK TEST DEBUG] Selected TC points:', selectedPoints);
          console.log('🔍 [CHECK TEST DEBUG] Earned points:', earnedPoints);
          console.log('🔍 [CHECK TEST DEBUG] Passed:', passed);
          
          // CRITICAL: If smart detection found ALL test cases match, show "Perfect!" modal like Test (All Cases)
          const totalTestCases = allTestCases.length;
          const allMatch = !isError && matchingTestCases.length === totalTestCases && totalTestCases > 0;
          
          if (allMatch) {
            console.log('🎉 [CHECK TEST] All test cases match! Showing Perfect! modal...');
            
            // Calculate total score
            const totalMax = allTestCases.reduce((sum, tc) => sum + (parseInt(tc.points || 0, 10) || 0), 0);
            const totalEarned = allMatch ? (constructOk ? totalMax : Math.max(1, Math.round(totalMax * 0.5))) : 0;
            
            // Create cases array for the modal (similar to Test All Cases)
            const cases = allTestCases.map((tc, idx) => {
              const tcExpected = tc.expected_output_text || tc.expected_output || tc.expectedOutput || '';
              const normalizedTcExpected = norm(tcExpected);
              const tcPassed = normalizedTcExpected === '' ? normalizedActual !== '' : (normalizedActual === normalizedTcExpected);
              const tcPoints = parseInt(tc.points || 0, 10) || 0;
              const tcEarned = tcPassed ? (constructOk ? tcPoints : Math.max(1, Math.round(tcPoints * 0.5))) : 0;
              
              return {
                name: `Test Case ${idx + 1}${tc.is_sample ? ' (Sample)' : ''}`,
                expected: normalizedTcExpected,
                stdout: normalizedActual,
                status: tcPassed ? 'AC' : 'WA',
                earned: tcEarned,
                points: tcPoints
              };
            });
            
            // Show the same "Perfect!" modal as Test (All Cases)
            showCodestemResultsModal(cases, totalEarned, totalMax, totalTestCases, totalTestCases);
            
            // Reset button state
            if (checkBtn) {
              checkBtn.disabled = false;
              checkBtn.innerHTML = '<i class="fas fa-check"></i> Check Test';
            }
            window.__previewCheckExecuting = false;
            return false;
          }
          
          // Show result in modal (only if not all match)
          const modalHtml = `
            <div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10001;">
              <div style="background:#fff;border-radius:12px;padding:24px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.3);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #e5e7eb;">
                  <h3 style="margin:0;font-size:20px;font-weight:700;color:#1f2937;">
                    <i class="fas fa-check-circle" style="color:${passed ? '#10b981' : '#f59e0b'};margin-right:8px;"></i>
                    Check Test Result - Test Case ${selectedIndex + 1}
                  </h3>
                  <button id="checkTestModalClose" style="background:#f3f4f6;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;font-size:18px;color:#6b7280;">✕</button>
                </div>
                
                <div style="margin-bottom:20px;">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
                    <span style="font-weight:600;color:#374151;">Status:</span>
                    <span style="padding:4px 12px;border-radius:6px;font-weight:600;font-size:14px;background:${passed ? '#d1fae5' : '#fee2e2'};color:${passed ? '#065f46' : '#991b1b'};">
                      ${passed ? '✅ PASSED' : '❌ FAILED'}
                    </span>
                    ${selectedPoints > 0 ? `
                    <span style="padding:4px 12px;border-radius:6px;font-weight:600;font-size:14px;background:${passed ? '#dbeafe' : '#f3f4f6'};color:${passed ? '#1e40af' : '#6b7280'};">
                      ${earnedPoints}/${selectedPoints} pts
                    </span>
                    ` : ''}
                  </div>
                  
                  ${!isError && matchingTestCases.length > 0 ? `
                  <div style="padding:10px;background:#ecfdf5;border-radius:6px;border-left:3px solid #10b981;margin-bottom:12px;">
                    <div style="font-size:12px;font-weight:600;color:#065f46;margin-bottom:4px;">🔍 Smart Detection Result:</div>
                    <div style="font-size:11px;color:#047857;">
                      ${matchingTestCases.length === 1 ? 
                        `Output matches Test Case ${selectedIndex + 1} only.` :
                        `Your output matches ${matchingTestCases.length} test case(s): ${matchingTestCases.map(m => `Test Case ${m.index + 1}`).join(', ')}`
                      }
                      <br/><span style="font-size:10px;color:#059669;font-style:italic;">(Code ran with Test Case ${selectedIndex + 1} input, output compared against all test cases - 1 credit used)</span>
                    </div>
                  </div>
                  ` : ''}

                  ${reqConstruct ? `
                  <div style="padding:10px;background:${constructOk ? '#ecfdf5' : '#fffbeb'};border-radius:6px;border-left:3px solid ${constructOk ? '#10b981' : '#f59e0b'};margin-bottom:12px;">
                    <div style="font-size:12px;font-weight:600;color:${constructOk ? '#065f46' : '#991b1b'};">Construct Required:</div>
                    <div style="font-size:11px;color:${constructOk ? '#065f46' : '#991b1b'};">${window.getConstructDisplayName ? window.getConstructDisplayName(reqConstruct) : reqConstruct.replace('_',' / ')} — ${constructOk ? 'used ✔' : 'missing ✖ (50% deduction applied)'}
                    </div>
                  </div>
                  ` : ''}
                  
                  ${isError ? `
                  <div style="padding:10px;background:#fef3c7;border-radius:6px;border-left:3px solid #f59e0b;margin-bottom:12px;">
                    <div style="font-size:12px;font-weight:600;color:#92400e;margin-bottom:4px;">⚠️ Smart Detection Disabled:</div>
                    <div style="font-size:11px;color:#78350f;">
                      Code execution failed (${outputText}). Smart detection only works with valid output. Fix the error and try again.
                    </div>
                  </div>
                  ` : ''}
                  
                  <div style="margin-bottom:16px;padding:12px;background:#f9fafb;border-radius:8px;border-left:4px solid #10b981;">
                    <div style="font-weight:600;color:#374151;margin-bottom:8px;font-size:14px;">Input:</div>
                    <pre style="margin:0;padding:8px;background:#fff;border:1px solid #e5e7eb;border-radius:6px;font-family:monospace;font-size:13px;color:#1f2937;white-space:pre-wrap;word-wrap:break-word;">${escapeHtml(inputText)}</pre>
                  </div>
                  
                  <div style="margin-bottom:16px;padding:12px;background:#f9fafb;border-radius:8px;border-left:4px solid ${passed ? '#10b981' : '#f59e0b'};">
                    <div style="font-weight:600;color:#374151;margin-bottom:8px;font-size:14px;">Your Output:</div>
                    <pre style="margin:0;padding:8px;background:#fff;border:1px solid #e5e7eb;border-radius:6px;font-family:monospace;font-size:13px;color:#1f2937;white-space:pre-wrap;word-wrap:break-word;">${escapeHtml(outputText || '(no output)')}</pre>
                  </div>
                  
                  <div style="margin-bottom:16px;padding:12px;background:#f9fafb;border-radius:8px;border-left:4px solid #6b7280;">
                    <div style="font-weight:600;color:#374151;margin-bottom:8px;font-size:14px;">Expected Output:</div>
                    <pre style="margin:0;padding:8px;background:#fff;border:1px solid #e5e7eb;border-radius:6px;font-family:monospace;font-size:13px;color:#1f2937;white-space:pre-wrap;word-wrap:break-word;">${escapeHtml(expectedOutput || '(no expected output)')}</pre>
                  </div>
                  ${!passed && normalizedExpected !== '' ? `
                  <div style="padding:12px;background:#fef3c7;border-radius:8px;border-left:4px solid #f59e0b;">
                    <div style="font-weight:600;color:#92400e;margin-bottom:8px;font-size:14px;">Difference:</div>
                    <div style="font-size:13px;color:#78350f;">
                      Expected: <code style="background:#fff;padding:2px 6px;border-radius:4px;">${escapeHtml(normalizedExpected)}</code><br/>
                      Got: <code style="background:#fff;padding:2px 6px;border-radius:4px;">${escapeHtml(normalizedActual)}</code>
                    </div>
                  </div>
                  ` : ''}
                </div>
                
                <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;">
                  <button id="checkTestModalOk" style="background:#10b981;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;">
                    OK
                  </button>
                </div>
              </div>
            </div>
          `;
          
          const modal = document.createElement('div');
          modal.innerHTML = modalHtml;
          document.body.appendChild(modal);
          
          const closeModal = function() {
            modal.remove();
          };
          
          const closeBtn = modal.querySelector('#checkTestModalClose');
          const okBtn = modal.querySelector('#checkTestModalOk');
          if (closeBtn) closeBtn.onclick = closeModal;
          if (okBtn) okBtn.onclick = closeModal;
          
          modal.addEventListener('click', function(e) {
            if (e.target === modal.querySelector('div > div')) {
              closeModal();
            }
          });
          
          // Update the SELECTED test case "Your Output" field
          try {
            const yourOutputEl = document.getElementById(`tcYour-${selectedIndex}`);
            if (yourOutputEl) {
              yourOutputEl.textContent = outputText || '(no output)';
              console.log('✅ [CHECK TEST] Updated test case', selectedIndex + 1, 'output field');
            }
          } catch(e) {
            console.warn('Could not update test case output:', e);
          }
        })
        .catch(err => {
          console.error('❌ Check Test Error:', err);
          alert('Check Test failed: ' + (err && err.message ? err.message : err));
        })
        .finally(() => {
          // Reset loading state using helper
          if (window.setPreviewButtonLoading) {
            window.setPreviewButtonLoading('previewCheckTestBtn', false);
          } else if (checkBtn) {
            checkBtn.disabled = false;
            checkBtn.innerHTML = '<i class="fas fa-check-circle"></i> Check Test';
          }
          window.__previewCheckExecuting = false;
        });
      
      return false;
    };
    
    // Create RESET handler placeholder (will be replaced later)
    window.__previewResetHandler = function(e) {
      if (window.__previewResetHandlerReal) {
        window.__previewResetHandlerReal(e);
      } else {
        console.error('Reset handler not ready');
      }
    };
    
    console.log('✅ Preview handlers created IMMEDIATELY (Test handler is REAL, not placeholder)');
  })();
  
  return `
    <div class="codestem-coding-interface" style="display:flex;height:calc(100vh - 200px);min-height:600px;gap:0;background:#f8fafc;font-family:'Inter',sans-serif;">
      <!-- LEFT PANEL: Problem Description -->
      <div class="codestem-left-panel" style="width:350px;background:#fff;border-right:1px solid #e5e7eb;overflow-y:auto;display:flex;flex-direction:column;">
        <div style="padding:24px;border-bottom:1px solid #e5e7eb;">
          <h3 style="margin:0 0 8px 0;font-size:18px;font-weight:600;color:#1f2937;">${activity.title || 'Coding Challenge'}</h3>
          <p style="margin:0;font-size:12px;color:#6b7280;">by CodeRegal Admin</p>
        </div>
        <div style="padding:24px;flex:1;">
          <h4 style="margin:0 0 16px 0;font-size:16px;font-weight:600;color:#374151;">Problem Description</h4>
          ${requiredConstruct ? `
            <div style="margin-bottom:16px;padding:12px;background:linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);border-left:4px solid #f59e0b;border-radius:8px;box-shadow:0 2px 4px rgba(245,158,11,0.1);">
              <div style="display:flex;align-items:center;gap:10px;">
                <i class="fas fa-exclamation-circle" style="color:#d97706;font-size:16px;"></i>
                <div style="flex:1;">
                  <div style="font-weight:600;color:#92400e;font-size:13px;margin-bottom:4px;">Required Construct</div>
                  <div style="color:#78350f;font-size:14px;font-weight:700;">${escapeHtml(getConstructDisplayName(requiredConstruct))}</div>
                  <div style="color:#92400e;font-size:11px;margin-top:4px;font-style:italic;">You must use this construct in your solution (50% deduction if missing)</div>
                </div>
              </div>
            </div>
          ` : ''}
          <div style="color:#4b5563;line-height:1.7;font-size:14px;font-weight:600;white-space:pre-wrap;">${escapeHtml(problemDescription)}</div>
          
          ${testCases.length > 0 ? `
            <div style="margin-top:32px;">
              <h4 style="margin:0 0 16px 0;font-size:16px;font-weight:600;color:#374151;">Sample Output</h4>
              ${testCases.filter(tc => tc.is_sample).map((tc, idx) => `
                <div style="margin-bottom:16px;padding:12px;background:#f9fafb;border-radius:6px;border-left:3px solid #10b981;">
                  <div style="font-size:12px;font-weight:600;color:#059669;margin-bottom:8px;">Sample Output ${idx + 1}</div>
                  <pre style="margin:0;font-size:13px;color:#1f2937;white-space:pre-wrap;font-family:'Courier New',monospace;">${escapeHtml(tc.expected_output || tc.expectedOutput || '')}</pre>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        <div style="padding:16px 24px;border-top:1px solid #e5e7eb;background:#f9fafb;">
          <div style="font-size:14px;font-weight:600;color:#374151;">Total Points: ${maxScore}</div>
        </div>
      </div>
      
      <!-- MIDDLE PANEL: Code Editor -->
      <div class="codestem-middle-panel" style="flex:1;display:flex;flex-direction:column;background:#fff;">
        <div style="padding:12px 16px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;background:#f9fafb;">
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:13px;font-weight:600;color:#6b7280;">${language.toUpperCase()}</span>
            <span style="font-size:12px;color:#9ca3af;" id="previewSavedIndicator">
              <i class="fas fa-check-circle" style="color:#10b981;margin-right:4px;"></i>Ready
            </span>
          </div>
          <div style="display:flex;gap:8px;">
            <button onclick="toggleCodingDarkMode()" style="background:none;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px;color:#6b7280;">
              <i class="fas fa-moon"></i>
            </button>
          </div>
        </div>
        <div id="previewMonacoContainer" style="flex:1;min-height:0;position:relative;">
          <textarea id="previewCodeTextarea" 
                    placeholder="Write your code here..." 
                    style="width:100%;height:100%;padding:16px;border:none;font-family:'Courier New',monospace;font-size:14px;resize:none;outline:none;background:#fff;color:#1f2937;">${escapeHtml(starterCode)}</textarea>
        </div>
        <div style="padding:16px;border-top:1px solid #e5e7eb;background:#f9fafb;display:flex;gap:12px;align-items:center;">
          <button id="previewRunBtn" 
                  onclick="if(window.__previewRunHandler){window.__previewRunHandler(event||window.event);return false;}else{console.error('Handler not ready');return false;}"
                  style="background:#10b981;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all 0.2s;position:relative;"
                  title="Run Code (Ctrl/Cmd + Enter)">
            <i class="fas fa-play"></i> <span class="btn-text">Run Code</span>
          </button>
          <button id="previewTestBtn" 
                  onclick="if(window.__previewTestHandler){window.__previewTestHandler(event||window.event);return false;}else{console.error('Test handler not ready');return false;}"
                  style="background:#f59e0b;color:#1f2937;border:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all 0.2s;"
                  title="Test all cases and submit your solution (score will be recorded)">
            <i class="fas fa-vial"></i> <span class="btn-text">Test & Submit</span>
          </button>
          <button id="previewResetBtn" 
                  onclick="(function(){try{const h=window.__previewResetHandler||window.__previewResetHandlerReal;if(h){h(event||window.event);}else{console.error('Reset handler not found!');}}catch(e){console.error('Reset handler error:',e);}})();return false;"
                  style="background:#6b7280;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all 0.2s;"
                  title="Reset Code to Starter">
            <i class="fas fa-undo"></i> <span class="btn-text">Reset</span>
          </button>
          <div style="margin-left:auto;color:#374151;font-weight:600;">Score: <span id="previewScoreValue">0</span>/${maxScore}</div>
        </div>
        <div id="previewRunOutput" style="padding:16px;border-top:1px solid #e5e7eb;background:#fff;max-height:200px;overflow-y:auto;display:none;font-family:monospace;font-size:13px;"></div>
        <div id="previewTestResults" style="padding:16px;border-top:1px solid #e5e7eb;background:#fff;max-height:300px;overflow-y:auto;display:none;"></div>
      </div>
      
      <!-- RIGHT PANEL: Test Cases -->
      <div class="codestem-right-panel" style="width:320px;background:#fff;border-left:1px solid #e5e7eb;display:flex;flex-direction:column;">
        <!-- Test Cases Section -->
        <div style="flex:1;overflow-y:auto;padding:16px;">
          <div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #e5e7eb;">
            <h4 style="margin:0;font-size:14px;font-weight:600;color:#374151;">Test Cases</h4>
          </div>
          
          <div id="previewTestCasesTab" class="codestem-tab-content">
            ${testCases.length > 0 ? testCases.map((tc, idx) => `
              <div class="codestem-test-case" id="tcContainer-${idx}" data-test-id="${tc.id || idx}" data-test-index="${idx}" onclick="if(event.target.closest('input') || event.target.closest('button')) return; window.__previewLastClickedTestIndex = ${idx}; toggleTestCaseDetails(${idx}, event);" style="margin-bottom:12px;padding:12px;background:${idx===0?'#f0fdf4':'#f9fafb'};border-radius:6px;border:${idx===0?'2px solid #10b981':'1px solid #e5e7eb'};cursor:pointer;transition:all 0.2s;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <div style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                    <input type="radio" name="preview-tc" value="${idx}" ${idx===0?'checked':''} onchange="toggleTestCaseDetails(${idx}, event)" onclick="window.__previewLastClickedTestIndex = ${idx};" style="margin:0;opacity:0;position:absolute;pointer-events:none;" tabindex="-1" aria-hidden="true">
                    <span id="tcStatusIcon-${idx}" style="font-size:14px;width:20px;display:flex;align-items:center;justify-content:center;" title="Not run">
                      <i class="fas fa-circle" style="color:#9ca3af;font-size:10px;"></i>
                    </span>
                    <span style="font-size:13px;font-weight:600;color:#374151;">
                      Test Case ${idx + 1}
                      ${tc.points ? `<span style="color:#6b7280;font-weight:500;margin-left:6px;">${tc.points} pts</span>` : ''}
                    </span>
                    <span id="tcStatusBadge-${idx}" style="margin-left:8px;font-size:11px;font-weight:600;padding:2px 6px;border-radius:4px;display:none;"></span>
                  </div>
                  <button type="button" onclick="toggleTestCaseDetails(${idx}, event)" style="background:none;border:none;color:#6b7280;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center;transition:transform 0.2s;"><i class="fas fa-chevron-${idx===0?'up':'down'}" style="transition:transform 0.2s;"></i></button>
                </div>
                <div class="test-case-details" id="tcDetails-${idx}" style="display:${idx===0?'block':'none'};margin-top:12px;padding-top:12px;border-top:1px solid #e5e7eb;">
                  ${tc.inputText || tc.input_text ? `<div style=\"margin-bottom:8px;\"><span style=\"font-size:11px;color:#6b7280;\">Input:</span><pre style=\"margin:4px 0 0 0;font-size:12px;color:#1f2937;white-space:pre-wrap;\">${escapeHtml(tc.inputText || tc.input_text || '')}</pre></div>` : ''}
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:flex-start;">
        <div>
                      <div style="font-size:11px;color:#6b7280;">Your Output</div>
                      <pre id="tcYour-${idx}" style="margin:4px 0 0 0;font-size:12px;color:#1f2937;white-space:pre-wrap;background:#111827;color:#e5e7eb;padding:8px;border-radius:6px;">(not run)</pre>
        </div>
                    <div>
                      <div style="font-size:11px;color:#6b7280;">Expected Output</div>
                      <pre id="tcExpected-${idx}" style="margin:4px 0 0 0;font-size:12px;color:#1f2937;white-space:pre-wrap;background:#f3f4f6;padding:8px;border-radius:6px;">${escapeHtml(tc.expected_output || tc.expectedOutput || '')}</pre>
        </div>
      </div>
          </div>
        </div>
            `).join('') : '<div style="color:#9ca3af;font-size:13px;">No test cases available</div>'}
        </div>
          
    </div>
      </div>
    </div>
    
    <script>
      // Handlers are already created BEFORE this script runs (see function scope above)
      // This script just verifies and initializes Monaco
      (function() {
        // Verify handler exists
        if (window.__previewRunHandler) {
          console.log('✅ Run handler verified - ready to use');
        } else {
          console.error('❌ CRITICAL: Run handler not found in script tag!');
        }
        
        // Re-export data to ensure it's available (backup)
        try {
          window.__previewActivityData = ${JSON.stringify(activity)};
          window.__codingPreviewCtx = { meta: ${JSON.stringify(meta || {})}, starter: ${JSON.stringify(starterCode || '')}, expected: '', activity: ${JSON.stringify(activity || {})} };
        } catch(e) {
          console.error('Error re-exporting data:', e);
        }
        
        // Backup handler if main one doesn't exist (shouldn't happen but safety)
        if (!window.__previewRunHandler) {
          console.error('❌ Creating backup handler - this should not happen!');
          window.__previewRunHandler = function(e) {
            console.log('🔴 Backup run handler called');
            alert('Handler not ready. Please refresh the page.');
            return false;
          };
        }
      })();
      
      // Initialize Monaco Editor for Coordinator preview
      (function() {
        const container = document.getElementById('previewMonacoContainer');
        const textarea = document.getElementById('previewCodeTextarea');
        if (!container || !textarea) return;
        
        // Load Monaco editor with error handling
        loadMonacoEditor().then(() => {
          try {
            if (window.monaco && window.monaco.editor) {
              console.log('🎨 Creating Monaco editor instance in preview...');
              const editor = window.monaco.editor.create(container, {
                value: textarea.value,
                language: '${language}',
                theme: 'vs',
                fontSize: 14,
                automaticLayout: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on'
              });
              
              // Sync with textarea
              editor.onDidChangeModelContent(() => {
                try {
                  textarea.value = editor.getValue();
                  const indicator = document.getElementById('previewSavedIndicator');
                  if (indicator) {
                    indicator.innerHTML = '<i class="fas fa-circle" style="color:#f59e0b;margin-right:4px;"></i>Modified';
                  }
                } catch(e) {
                  console.warn('Monaco sync error:', e);
                }
              });
              
              // Store editor reference
              window.__previewEditor = editor;
              console.log('✅ Monaco editor created successfully in preview');
              
              // Hide textarea if Monaco loaded
              textarea.style.display = 'none';
            } else {
              console.warn('⚠️ Monaco not available, using textarea fallback');
              textarea.style.display = 'block';
            }
          } catch(err) {
            console.error('❌ Monaco editor creation failed:', err);
            textarea.style.display = 'block';
          }
        }).catch((err) => {
          console.error('❌ Monaco editor load failed:', err);
          // Fallback: show textarea
          textarea.style.display = 'block';
        });
      })();
      
      // ===== KEYBOARD SHORTCUTS =====
      (function() {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const ctrlKey = isMac ? '⌘' : 'Ctrl';
        
        // Keyboard shortcuts handler
        document.addEventListener('keydown', function(e) {
          // Don't trigger if user is typing in input/textarea
          const activeEl = document.activeElement;
          if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
            // Allow shortcuts in Monaco editor
            if (activeEl.id !== 'previewCodeTextarea' && !activeEl.closest('#previewMonacoContainer')) {
              return;
            }
          }
          
          // Ctrl/Cmd + Enter → Run Code
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            const runBtn = document.getElementById('previewRunBtn');
            if (runBtn && !runBtn.disabled) {
              console.log('⌨️ Keyboard shortcut: Run Code');
              runBtn.click();
            }
            return false;
          }
          
          // Ctrl/Cmd + Shift + Enter → Test (All Cases)
          if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            const testBtn = document.getElementById('previewTestBtn');
            if (testBtn && !testBtn.disabled) {
              console.log('⌨️ Keyboard shortcut: Test All Cases');
              testBtn.click();
            }
            return false;
          }
          
          // Ctrl/Cmd + S → Save Draft (prevent default browser save)
          if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
            // Only prevent if we're in the coding interface
            const codingInterface = document.querySelector('.codestem-coding-interface');
            if (codingInterface) {
              e.preventDefault();
              e.stopPropagation();
              // Trigger auto-save indicator update
              const indicator = document.getElementById('previewSavedIndicator');
              if (indicator) {
                indicator.innerHTML = '<i class="fas fa-save" style="color:#3b82f6;margin-right:4px;"></i>Saving...';
                setTimeout(function() {
                  if (indicator) {
                    indicator.innerHTML = '<i class="fas fa-check-circle" style="color:#10b981;margin-right:4px;"></i>Saved';
                    setTimeout(function() {
                      if (indicator) {
                        indicator.innerHTML = '<i class="fas fa-check-circle" style="color:#10b981;margin-right:4px;"></i>Ready';
                      }
                    }, 1000);
                  }
                }, 500);
              }
              console.log('⌨️ Keyboard shortcut: Save Draft');
            }
            return false;
          }
        });
        
        console.log('✅ Keyboard shortcuts initialized');
      })();
      
      // ===== LOADING STATE HELPERS =====
      window.setPreviewButtonLoading = function(buttonId, isLoading, loadingText) {
        const btn = document.getElementById(buttonId);
        if (!btn) return;
        
        if (isLoading) {
          btn.disabled = true;
          btn.style.opacity = '0.7';
          btn.style.cursor = 'not-allowed';
          const btnText = btn.querySelector('.btn-text');
          if (btnText) {
            btnText.textContent = loadingText || 'Loading...';
          } else {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (loadingText || 'Loading...');
          }
        } else {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.style.cursor = 'pointer';
          // Restore original text
          if (buttonId === 'previewRunBtn') {
            const btnText = btn.querySelector('.btn-text');
            if (btnText) {
              btnText.textContent = 'Run Code';
            } else {
              btn.innerHTML = '<i class="fas fa-play"></i> Run Code';
            }
          } else if (buttonId === 'previewTestBtn') {
            const btnText = btn.querySelector('.btn-text');
            if (btnText) {
              btnText.textContent = 'Test & Submit';
            } else {
              btn.innerHTML = '<i class="fas fa-vial"></i> Test (All Cases)';
            }
          } else if (buttonId === 'previewResetBtn') {
            const btnText = btn.querySelector('.btn-text');
            if (btnText) {
              btnText.textContent = 'Reset';
            } else {
              btn.innerHTML = '<i class="fas fa-undo"></i> Reset';
            }
          }
        }
      };
      
      window.setAllPreviewButtonsLoading = function(isLoading) {
        ['previewRunBtn', 'previewTestBtn', 'previewResetBtn'].forEach(function(btnId) {
          window.setPreviewButtonLoading(btnId, isLoading);
        });
      };
    </script>
  `;
  // expose preview context for delegated handlers - ALREADY SET IN SCRIPT TAG ABOVE
  // This is just a backup
  try { 
    if (!window.__codingPreviewCtx) {
      window.__codingPreviewCtx = { meta: meta || {}, starter: starterCode || '', expected: expected || '', activity: activity || {} };
    }
  } catch(_){ }
  
  // CRITICAL: Bind handlers immediately and also in setTimeout as backup
  function bindPreviewHandlers() {
    console.log('🔧 Binding preview handlers...');
    const runBtn = document.getElementById('previewRunBtn');
    const testBtn = document.getElementById('previewTestBtn');
    const resetBtn = document.getElementById('previewResetBtn');
    const outputDiv = document.getElementById('previewRunOutput');
    const testDiv = document.getElementById('previewTestResults');
    
    console.log('🔍 Elements found:', {
      runBtn: !!runBtn,
      testBtn: !!testBtn,
      resetBtn: !!resetBtn,
      outputDiv: !!outputDiv,
      testDiv: !!testDiv
    });
    
    if (!runBtn || !outputDiv) {
      console.error('❌ CRITICAL: Run button or output div not found!');
      return false;
    }
    
    // Get code from Monaco editor or textarea fallback - ROBUST VERSION
    const getCode = () => {
      try {
        // Try Monaco editor first
        if (window.__previewEditor && typeof window.__previewEditor.getValue === 'function') {
          const code = window.__previewEditor.getValue();
          if (code && code.trim()) return code;
        }
      } catch(e) {
        console.warn('Monaco editor getValue failed:', e);
      }
      
      // Fallback to textarea
      try {
        const textarea = document.getElementById('previewCodeTextarea');
        if (textarea && textarea.value) {
          return textarea.value;
        }
      } catch(e) {
        console.warn('Textarea read failed:', e);
      }
      
      // Last resort: try to find any code in the container
      try {
        const container = document.getElementById('previewMonacoContainer');
        if (container) {
          const codeEl = container.querySelector('textarea') || container.querySelector('[contenteditable="true"]');
          if (codeEl && codeEl.value) return codeEl.value;
        }
      } catch(e) {
        console.warn('Container code read failed:', e);
      }
      
      return '';
    };
    // CRITICAL: Define the run handler function - COMPLETE VERSION
    // CREDIT FIX: Check if window.__previewRunHandler already executed
    const runHandler = function(e) {
      // CREDIT FIX: If window.__previewRunHandler is executing, skip this handler
      if (window.__previewRunHandlerExecuting) {
        console.warn('⚠️ [CREDIT TRACK] runHandler skipped - window.__previewRunHandler already executing');
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        return false;
      }
      
      console.log('🔴 [CREDIT TRACK] Run Code button clicked! (runHandler)', {
        timestamp: new Date().toISOString(),
        handler: 'runHandler (bindPreviewHandlers)'
      });
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      const runBtn = document.getElementById('previewRunBtn');
      const outputDiv = document.getElementById('previewRunOutput');
      
      if (!outputDiv) {
        console.error('❌ previewRunOutput div not found!');
        alert('Error: Output area not found. Please refresh the page.');
        return false;
      }
      
      const code = getCode().trim();
      console.log('📝 Code extracted:', code ? `${code.length} chars` : 'EMPTY');
      
      if (!code) {
        outputDiv.style.display = 'block';
        outputDiv.innerHTML = '<div style="color:#dc3545;">❌ Please write some code first</div>';
        return false;
      }
      
      // Set loading state using helper
      if (window.setPreviewButtonLoading) {
        window.setPreviewButtonLoading('previewRunBtn', true, 'Running...');
      } else if (runBtn) {
        runBtn.disabled = true;
        runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
      }
      
      // Don't show "Running code..." in outputDiv - terminal modal will show it
      // outputDiv.style.display = 'block';
      // outputDiv.innerHTML = '<div style="color:#007bff;">🔄 Running code...</div>';
      
      // Get activity data from window
      const activity = window.__previewActivityData || {};
      const meta = window.__codingPreviewCtx?.meta || {};
      const language = (meta && meta.language) ? String(meta.language).toLowerCase() : 'cpp';
      
      // For JavaScript, run locally. For C++/Java/Python, use server runner (JDoodle)
      if (language === 'javascript') {
        const expected = window.__codingPreviewCtx?.expected || '';
        testCodingActivity(code, language, expected, outputDiv, runBtn);
      } else {
        try {
          let fd = new FormData();
          fd.append('action','run_activity');
          fd.append('activity_id', String(activity.id || activity.activity_id || ''));
          fd.append('source', code);
          fd.append('quick','1');
          
          const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          console.log('🚀 [CREDIT TRACK] Sending API request #' + requestId, {
            activity_id: activity.id || activity.activity_id,
            code_length: code.length,
            language: language,
            timestamp: new Date().toISOString(),
            request_id: requestId,
            handler: 'runHandler (bindPreviewHandlers)'
          });
          
          fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
            .then(r => {
              console.log('📡 API Response status:', r.status, r.statusText);
              if (!r.ok) {
                throw new Error(`HTTP ${r.status}: ${r.statusText}`);
              }
              return r.json();
            })
            .then(res => {
              console.log('✅ Run Code Response:', res);
              const ok = !!(res && res.success);
              if (!ok) {
                const msg = res && res.message ? res.message : 'Run failed';
                throw new Error(msg);
              }
              
              const results = Array.isArray(res.results) ? res.results : [];
              console.log('Results:', results);
              
              if (results.length === 0) {
                outputDiv.innerHTML = '<div style="color:#ffc107;">⚠️ No test cases found. Code compiled successfully but no output to display.</div>';
                return;
              }
              
              // Extract output from JDoodle response structure
              const outputs = results.map(r => {
                const out = r.output || r.stdout || r.outputText || r.data?.output || '';
                const err = r.error || r.stderr || r.data?.error || '';
                const statusCode = r.statusCode || r.data?.statusCode || 0;
                
                if (err) return `Error: ${err}`;
                if (statusCode && statusCode !== 200) return `Exit code ${statusCode}: ${out || '(no output)'}`;
                return String(out || '').trim();
              });
              
              const combined = outputs.filter(o => o).join('\n').trim();
              const firstResult = results[0] || {};
              const hasError = firstResult.error || (firstResult.statusCode !== 200 && firstResult.statusCode !== 0);
              
              let html = '';
              if (hasError) {
                html = `<div style="color:#dc3545;margin-bottom:8px;">❌ <strong>ERROR</strong></div>`;
              } else {
                html = `<div style="color:#28a745;margin-bottom:8px;">✅ <strong>COMPLETED</strong></div>`;
              }
              
              html += `<div style="margin-bottom:6px;"><strong>Output:</strong></div>`;
              const safeOutput = (combined || '(no output)').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
              html += `<pre style="background:#f1f3f4;padding:8px;border-radius:4px;white-space:pre-wrap;font-family:monospace;font-size:13px;">${safeOutput}</pre>`;
              
              if (firstResult.error) {
                html += `<div style="margin-top:8px;"><strong>Error Details:</strong></div>`;
                const safeError = String(firstResult.error).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
                html += `<pre style="background:#fee;padding:8px;border-radius:4px;white-space:pre-wrap;font-family:monospace;font-size:13px;color:#c33;">${safeError}</pre>`;
              }
              
              outputDiv.innerHTML = html;
            })
            .catch(err => {
              console.error('❌ Run Code Error:', err);
              const safeErr = String(err && err.message ? err.message : err).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
              outputDiv.innerHTML = `<div style="color:#dc3545;">❌ Run failed: ${safeErr}</div>`;
            })
            .finally(() => { 
              // Reset loading state using helper
              if (window.setPreviewButtonLoading) {
                window.setPreviewButtonLoading('previewRunBtn', false);
              } else if (runBtn) {
                runBtn.disabled = false; 
                runBtn.innerHTML = '<i class="fas fa-play"></i> Run Code';
              }
            });
        } catch (err) {
          console.error('❌ Run Code Exception:', err);
          const safeErr = String(err && err.message ? err.message : err).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
          outputDiv.innerHTML = `<div style="color:#dc3545;">❌ Run error: ${safeErr}</div>`;
          // Reset loading state using helper
          if (window.setPreviewButtonLoading) {
            window.setPreviewButtonLoading('previewRunBtn', false);
          } else if (runBtn) {
            runBtn.disabled = false; 
            runBtn.innerHTML = '<i class="fas fa-play"></i> Run Code';
          }
        }
      }
      return false;
    };
    
    // Attach handler to Run button - MULTIPLE METHODS + GLOBAL EXPORT
    if (runBtn) {
      console.log('✅ Attaching onclick handler to Run button');
      runBtn.onclick = runHandler;
      runBtn.addEventListener('click', runHandler, true); // Capture phase
      runBtn.addEventListener('click', runHandler, false); // Bubble phase
      // Also expose globally for inline onclick fallback - REAL HANDLER
      window.__previewRunHandlerReal = runHandler;
      // DON'T replace window.__previewRunHandler - it's already set above in renderCodingPreview
      // This prevents duplicate handler execution (which causes 2 API calls = 2 credits)
      console.log('✅ Run handler attached (runHandler) - NOT replacing window.__previewRunHandler to prevent duplicate calls');
      // Also add as data attribute for debugging
      runBtn.setAttribute('data-handler-attached', 'true');
      console.log('✅ Run button handlers attached (4 methods: onclick, addEventListener x2, inline fallback)');
    } else {
      console.error('❌ Run button not found during binding!');
    }
    
    // Test button handler - COORDINATOR PREVIEW MODE (DISPLAY ONLY, NO DATABASE SAVE)
    // IMPORTANT: This is for testing/preview only. Scores are calculated and displayed but NOT saved to database.
    const testHandler = function() {
      console.log('🔴 [PREVIEW MODE] Test button clicked!');
      
      const activity = window.__previewActivityData || {};
      const testCases = activity.test_cases || activity.testCases || [];
      console.log('📋 [PREVIEW MODE] Activity data:', {
        activityId: activity.id || activity.activity_id,
        testCasesCount: testCases.length,
        hasTestCases: testCases.length > 0
      });
      
      const code = getCode().trim();
      console.log('📝 [PREVIEW MODE] Code extracted:', code ? `${code.length} chars` : 'EMPTY');
      
        if (!code) {
          console.warn('⚠️ [PREVIEW MODE] No code found!');
          if (testDiv) {
            testDiv.style.display = 'block';
            testDiv.innerHTML = '<div style="color:#dc3545;">❌ Please write some code first</div>';
          }
          return;
        }

        // Set loading state using helper
        if (window.setPreviewButtonLoading) {
          window.setPreviewButtonLoading('previewTestBtn', true, 'Testing...');
        } else {
          testBtn.disabled = true;
          testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
        }
        // Don't show "Running all test cases..." message - modal will show results directly
        // if (testDiv) {
        //   testDiv.style.display = 'block';
        //   testDiv.innerHTML = '<div style="color:#0ea5e9;">🔄 Running all test cases... <span style="font-size:11px;color:#6b7280;">(Preview Mode - No Save)</span></div>';
        // }

        console.log('🚀 [PREVIEW MODE] Sending API request to run all test cases...');
        let fd = new FormData();
        fd.append('action','run_activity');
        fd.append('activity_id', String(activity.id || activity.activity_id || ''));
        fd.append('source', code);
        // NOTE: Not appending 'quick' - this runs ALL test cases for full grading preview
        fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
          .then(r => {
            console.log('📡 [PREVIEW MODE] API Response status:', r.status);
            if (!r.ok) {
              throw new Error(`HTTP ${r.status}: ${r.statusText}`);
            }
            return r.json();
          })
          .then(res => {
            console.log('📊 [PREVIEW MODE] API Response:', {
              success: res && res.success,
              resultsCount: Array.isArray(res.results) ? res.results.length : 0,
              message: res && res.message
            });
            
            if (!res || !res.success) throw new Error(res && res.message ? res.message : 'Run failed');
            const results = Array.isArray(res.results) ? res.results : [];
            console.log('✅ [PREVIEW MODE] Test results received:', results.length, 'results');
            // CRITICAL: Use EXACT same grading logic as student view for accurate preview
            const norm = s => String(s == null ? '' : s).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
            
            // CRITICAL FIX: Check if test cases have points. If not, distribute evenly from max_score
            const sumExistingPoints = (testCases || []).reduce((s, tc) => s + (parseInt(tc.points || 0, 10) || 0), 0);
            const maxScoreFromActivity = activity.max_score || 0;
            const needsPointDistribution = sumExistingPoints === 0 && maxScoreFromActivity > 0 && testCases.length > 0;
            const pointsPerCase = needsPointDistribution ? Math.floor(maxScoreFromActivity / testCases.length) : 0;
            
            console.log('🔍 [PREVIEW MODE] Points check (bindPreviewHandlers):', {
              sumExistingPoints,
              maxScoreFromActivity,
              testCasesCount: testCases.length,
              needsPointDistribution,
              pointsPerCase
            });
            
            const cases = (testCases || []).map((tc, i) => {
              const expected = norm(tc.expected_output || tc.expectedOutput || tc.expected_output_text || '');
              const result = results[i] || {};
              // Use same robust output extraction as student view
              const out = norm(result.output || result.stdout || result.outputText || (result.data && result.data.output) || '');
              const err = result.error || result.stderr || (result.data && result.data.error) || '';
              const statusCode = result.statusCode || (result.data && result.data.statusCode) || 0;
              
              // EXACT same pass/fail logic as student view
              const hasError = err || (statusCode !== 200 && statusCode !== 0);
              const passed = !hasError && (expected === '' ? out !== '' : (out === expected));
              
              // CRITICAL FIX: Use distributed points if test case has no points
              const tcPoints = parseInt(tc.points || 0, 10) || 0;
              const actualPoints = tcPoints > 0 ? tcPoints : (needsPointDistribution ? pointsPerCase : 0);
              const pts = passed ? actualPoints : 0;
              
              return {
                name: `Test Case ${i + 1}`,
                expected: expected,
                stdout: out || (err ? `Error: ${err}` : ''),
                status: passed ? 'AC' : (hasError ? 'RE' : 'WA'),
                earned: pts,
                points: actualPoints
              };
            });
            // EXACT same score calculation as student view
            const totalPts = cases.reduce((s, c) => s + c.earned, 0);
            const totalMax = sumExistingPoints > 0 ? sumExistingPoints : (needsPointDistribution ? maxScoreFromActivity : maxScoreFromActivity);
            const passedCount = cases.filter(c => c.status === 'AC').length;
            const totalCount = cases.length;
            
            // PREVIEW MODE: Display score but DO NOT save to database
            // CRITICAL: This calculation is IDENTICAL to student view for accurate preview
            console.log('📊 [PREVIEW MODE] Grading calculated (IDENTICAL to student view):', {
              score: totalPts,
              maxScore: totalMax,
              passed: passedCount,
              total: totalCount,
              cases: cases.map(c => ({ name: c.name, status: c.status, earned: c.earned, points: c.points })),
              note: 'Score displayed for testing only - NOT saved to database. Calculation matches student view exactly.'
            });
            
            // CRITICAL: Show results modal (like student view)
            console.log('🎯 [PREVIEW MODE] About to show results modal:', {
              cases: cases.length,
              totalPts,
              totalMax,
              passedCount,
              totalCount
            });
            
            try {
              // Show the same "Perfect!" modal as student view
              showCodestemResultsModal(cases, totalPts, totalMax, passedCount, totalCount);
              console.log('✅ [PREVIEW MODE] Results modal should be displayed');
            } catch (modalErr) {
              console.error('❌ [PREVIEW MODE] Error showing results modal:', modalErr);
              // Fallback to inline display
              if (testDiv) {
                testDiv.innerHTML = '<div style="color:#dc3545;">Error showing results modal. Check console for details.</div>';
              }
            }
            
            // Update left score
            const scoreEl = document.getElementById('previewScoreValue'); if (scoreEl) scoreEl.textContent = String(totalPts);
            // Fill per-case panels
            cases.forEach((c, i) => {
              const your = document.getElementById(`tcYour-${i}`); if (your) your.textContent = c.stdout || '(no output)';
              const diff = document.getElementById(`tcDiff-${i}`);
              if (diff) {
                diff.textContent = (c.status==='AC') ? 'No differences. Output matched expected.' : `Expected:\n${c.expected}\n\nActual:\n${c.stdout}`;
              }
            });
            
            // Also show inline results in testDiv (for reference)
            const header = `<div style="margin-bottom:12px;">
              <div style="display:flex;gap:12px;align-items:center;margin-bottom:8px;">
                <span style="background:#10b981;color:white;padding:4px 8px;border-radius:999px;font-weight:700;">${passedCount}/${totalCount} passed</span>
                <span style="background:#6366f1;color:white;padding:4px 8px;border-radius:999px;font-weight:700;">Score ${totalPts}/${totalMax}</span>
              </div>
              <div style="background:#fef3c7;border:1px solid #fbbf24;color:#92400e;padding:8px 12px;border-radius:6px;font-size:12px;display:flex;align-items:center;gap:8px;">
                <i class="fas fa-info-circle"></i>
                <span><strong>Preview Mode:</strong> This score is for testing only and will NOT be saved to the database. <strong>Grading calculation is identical to student view.</strong></span>
              </div>
            </div>`;
            const rows = cases.map(c => {
              // Use same color coding as student view: AC=green, RE=gray, WA=yellow
              const color = c.status === 'AC' ? '#10b981' : (c.status === 'RE' ? '#6b7280' : '#f59e0b');
              const icon = c.status === 'AC' ? '✅' : (c.status === 'RE' ? '❌' : '⚠️');
              return `<div style="border:1px solid #e5e7eb;border-radius:8px;padding:10px;margin-top:8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <div style="font-weight:600;color:#374151;">${c.name}</div>
                  <div style="color:${color};font-weight:700;display:flex;align-items:center;gap:6px;">
                    ${icon} ${c.status} ${c.earned ? `(+${c.earned} pts)` : ''}
                  </div>
                </div>
                <div style="margin-top:6px;display:${c.status==='AC'?'none':'block'};">
                  <div style="font-size:12px;color:#374151;margin-bottom:4px;">Expected vs Actual</div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <pre style="background:#f3f4f6;padding:8px;border-radius:6px;white-space:pre-wrap;">${(c.expected||'').replace(/</g,'&lt;')}</pre>
                    <pre style="background:#111827;color:#e5e7eb;padding:8px;border-radius:6px;white-space:pre-wrap;">${(c.stdout||'').replace(/</g,'&lt;')}</pre>
                  </div>
                </div>
              </div>`;
            }).join('');
            testDiv.innerHTML = header + rows;
            // Success modal
            if (cases.every(c=>c.status==='AC')) {
              try {
                const modal = document.createElement('div');
                modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;z-index:9999;';
                modal.innerHTML = `<div style="background:#fff;padding:24px 28px;border-radius:12px;max-width:360px;width:90%;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.2);">
                  <div style="font-size:20px;font-weight:700;color:#10b981;margin-bottom:8px;">Perfect!</div>
                  <div style="color:#374151;margin-bottom:16px;">Test Cases: ${cases.length}/${cases.length}<br/>Score: ${totalPts}/${totalMax}</div>
                  <button id="pvOK" style="background:#10b981;color:#fff;border:none;padding:10px 16px;border-radius:8px;font-weight:600;cursor:pointer;">OK</button>
                </div>`;
                document.body.appendChild(modal);
                modal.querySelector('#pvOK').onclick = ()=> document.body.removeChild(modal);
              } catch(_){ }
            }
          })
          .catch(err => {
            testDiv.innerHTML = `<div style="color:#dc3545;">❌ Test failed: ${err && err.message ? err.message : err}</div>`;
          })
          .finally(() => { 
            // Reset loading state using helper
            if (window.setPreviewButtonLoading) {
              window.setPreviewButtonLoading('previewTestBtn', false);
            } else {
              testBtn.disabled=false; 
              testBtn.innerHTML='<i class="fas fa-vial"></i> Test (All Cases)'; 
            }
          });
    };
    
    if (testBtn) {
      testBtn.onclick = testHandler;
      testBtn.addEventListener('click', testHandler, true);
      testBtn.addEventListener('click', testHandler, false);
      window.__previewTestHandlerReal = testHandler;
      window.__previewTestHandler = testHandler; // Replace placeholder
      testBtn.setAttribute('data-handler-attached', 'true');
      console.log('✅ Test button handlers attached');
    }
    

    // Reset button handler
    const resetHandler = function() {
      const starterCode = window.__codingPreviewCtx?.starter || '';
      const editor = window.__previewEditor;
      const textarea = document.getElementById('previewCodeTextarea');
      const originalCode = starterCode;
      
      // Reset all test case statuses to "not run"
      const activity = window.__previewActivityData || {};
      const testCases = activity.testCases || activity.test_cases || [];
      for (let i = 0; i < testCases.length; i++) {
        // Reset output
        const yourOutputEl = document.getElementById(`tcYour-${i}`);
        if (yourOutputEl) {
          yourOutputEl.textContent = '(not run)';
        }
        // Reset visual status
        if (window.updateTestCaseStatus) {
          window.updateTestCaseStatus(i, '');
        }
      }
      console.log('✅ [RESET] All test case statuses reset');
        
        if (editor) {
          editor.setValue(originalCode);
        } else if (textarea) {
          textarea.value = originalCode;
        }
        
        if (outputDiv) {
          outputDiv.style.display = 'none';
          outputDiv.innerHTML = '';
        }
        if (testDiv) {
          testDiv.style.display = 'none';
          testDiv.innerHTML = '';
        }
        
        // Reset saved indicator
        const indicator = document.getElementById('previewSavedIndicator');
        if (indicator) {
          indicator.innerHTML = '<i class="fas fa-check-circle" style="color:#10b981;margin-right:4px;"></i>Ready';
        }
    };
    
    if (resetBtn) {
      resetBtn.onclick = resetHandler;
      resetBtn.addEventListener('click', resetHandler, true);
      resetBtn.addEventListener('click', resetHandler, false);
      window.__previewResetHandlerReal = resetHandler;
      window.__previewResetHandler = resetHandler; // Replace placeholder
      resetBtn.setAttribute('data-handler-attached', 'true');
      console.log('✅ Reset button handlers attached');
    }
    
    return true;
  }
  
  // Call bindPreviewHandlers immediately and also in setTimeout as backup
  console.log('🔧 Initializing preview handlers...');
  
  // Try immediate binding
  let bound = false;
  try {
    bound = bindPreviewHandlers();
    if (bound) {
      console.log('✅ Initial binding successful!');
    } else {
      console.warn('⚠️ Initial binding returned false');
    }
  } catch(err) {
    console.error('❌ Initial binding error:', err);
  }
  
  // Retry with setTimeout as backup (faster)
  setTimeout(() => {
    try {
      if (bindPreviewHandlers()) {
        console.log('✅ Binding successful on retry (50ms)!');
      }
    } catch(err) {
      console.error('❌ Retry binding error:', err);
    }
  }, 50);
  
  // Also try after a longer delay as final fallback
  setTimeout(() => {
    const runBtn = document.getElementById('previewRunBtn');
    if (runBtn) {
      const hasHandler = runBtn.getAttribute('data-handler-attached') === 'true' || 
                        typeof runBtn.onclick === 'function' ||
                        window.__previewRunHandler || 
                        window.__previewRunHandlerReal;
      if (!hasHandler) {
        console.warn('⚠️ Button found but handler not attached after 500ms, final retry...');
        try {
          bindPreviewHandlers();
        } catch(err) {
          console.error('❌ Final retry error:', err);
        }
      } else {
        console.log('✅ Handler confirmed attached after 500ms');
      }
    } else {
      console.error('❌ Run button still not found after 500ms!');
    }
  }, 500);
  
  // Additional safety check after 1 second
  setTimeout(() => {
    const runBtn = document.getElementById('previewRunBtn');
    if (runBtn && !window.__previewRunHandler && !window.__previewRunHandlerReal) {
      console.error('❌ CRITICAL: Handler still not available after 1 second!');
      console.log('Available handlers:', {
        __previewRunHandler: !!window.__previewRunHandler,
        __previewRunHandlerReal: !!window.__previewRunHandlerReal,
        onclick: typeof runBtn.onclick,
        hasAttribute: runBtn.getAttribute('data-handler-attached')
      });
    }
  }, 1000);
}

// Global delegated handlers for preview footer buttons (capture-phase to avoid interference)
// NOTE: This is a fallback - the buttons should have onclick handlers set directly
// This delegation ensures clicks work even if handlers aren't set yet
if (!window.__CODING_PREVIEW_BUTTONS_BOUND__) {
  window.__CODING_PREVIEW_BUTTONS_BOUND__ = true;
  document.addEventListener('click', function(e){
    try {
      const runBtn = e.target && (e.target.id==='previewRunBtn' ? e.target : e.target.closest && e.target.closest('#previewRunBtn'));
      const testBtn = e.target && (e.target.id==='previewTestBtn' ? e.target : e.target.closest && e.target.closest('#previewTestBtn'));
      const resetBtn = e.target && (e.target.id==='previewResetBtn' ? e.target : e.target.closest && e.target.closest('#previewResetBtn'));
      if (runBtn) {
        e.stopPropagation();
        e.preventDefault();
        const btn = document.getElementById('previewRunBtn');
        if (btn) {
          // Try direct onclick first
          if (typeof btn.onclick === 'function') { 
            btn.onclick(e); 
          } else {
            // Fallback: trigger click event
            btn.click();
          }
        }
        return;
      }
      if (testBtn) {
        e.stopPropagation();
        e.preventDefault();
        const btn = document.getElementById('previewTestBtn');
        if (btn) {
          if (typeof btn.onclick === 'function') { 
            btn.onclick(e); 
          } else {
            btn.click();
          }
        }
        return;
      }
      if (resetBtn) {
        e.stopPropagation();
        e.preventDefault();
        const btn = document.getElementById('previewResetBtn');
        if (btn) {
          if (typeof btn.onclick === 'function') { 
            btn.onclick(e); 
          } else {
            btn.click();
          }
        }
        return;
      }
    } catch(err){ 
      console.error('Delegated button handler error:', err);
    }
  }, true);
}

// Test coding activity for coordinator preview
function testCodingActivity(code, language, expectedOutput, outputDiv, runBtn) {
  try {
    let result = '';
    let passed = false;
    
    if (language.toLowerCase() === 'javascript') {
      // Capture console.log output
      const originalLog = console.log;
      const logs = [];
      console.log = function(...args) {
        logs.push(args.join(' '));
      };
      
      try {
        // Execute the code
        eval(code);
        result = logs.join('\n').trim();
        
        // Check if it matches expected output
        if (expectedOutput && result === expectedOutput.trim()) {
          passed = true;
        }
      } catch (error) {
        result = `Error: ${error.message}`;
      } finally {
        console.log = originalLog;
      }
    } else {
      // For other languages, show a message that they need a code runner
      result = `Language "${language}" requires a code runner (Judge0/JDoodle). JavaScript testing only available in preview.`;
    }
    
    // Display results
    if (outputDiv) {
      const statusIcon = passed ? '✅' : (result.includes('Error') ? '❌' : '⚠️');
      const statusColor = passed ? '#28a745' : (result.includes('Error') ? '#dc3545' : '#ffc107');
      
      outputDiv.innerHTML = `
        <div style="color:${statusColor};margin-bottom:8px;">
          ${statusIcon} <strong>${passed ? 'PASSED' : 'FAILED'}</strong>
        </div>
        <div style="margin-bottom:6px;"><strong>Output:</strong></div>
        <pre style="background:#f1f3f4;padding:8px;border-radius:4px;white-space:pre-wrap;">${result || '(no output)'}</pre>
        ${expectedOutput ? `
          <div style="margin-top:6px;"><strong>Expected:</strong></div>
          <pre style="background:#e8f5e8;padding:8px;border-radius:4px;white-space:pre-wrap;">${expectedOutput}</pre>
        ` : ''}
      `;
    }
    
  } catch (error) {
    if (outputDiv) {
      outputDiv.innerHTML = `<div style="color:#dc3545;">❌ Test failed: ${error.message}</div>`;
    }
  } finally {
    if (runBtn) {
      runBtn.disabled = false;
      runBtn.innerHTML = '<i class="fas fa-play"></i> Run Code';
    }
  }
}
// Function to render question input based on activity type
function renderQuestionInput(question, index, activityType) {
  console.log('🔍 DEBUG: renderQuestionInput called with:', { question, index, activityType });
  
  if (activityType === 'multiple_choice') {
    if (!question.choices || !Array.isArray(question.choices)) {
      console.log('🔍 DEBUG: No choices available for multiple choice');
      return '<div style="color:#dc3545;font-size:14px;">No choices available</div>';
    }
    
    console.log('🔍 [RENDER INPUT] Rendering multiple choice, question object:', question);
    console.log('🔍 [RENDER INPUT] Choices array:', question.choices);
    console.log('🔍 [RENDER INPUT] Choices type:', typeof question.choices, 'isArray:', Array.isArray(question.choices), 'length:', question.choices ? question.choices.length : 0);
    
    if (!question.choices || question.choices.length === 0) {
      console.error('🔍 [RENDER INPUT] ⚠️ ERROR: No choices array or empty choices!');
      return '<div style="color:#dc3545;font-size:14px;">No choices available</div>';
    }
    
    return `
      <div style="space-y:12px;">
        ${question.choices.map((choice, choiceIndex) => {
          // Handle multiple possible field names for choice text
          // CRITICAL: The activity.questions mapping creates choices with 'choice_text' property
          const rawText = choice.choice_text || choice.text || choice.content || choice.option || '';
          const choiceText = (rawText && String(rawText).trim()) ? String(rawText).trim() : `Choice ${choiceIndex + 1}`;
          const choiceId = choice.id || choice.choice_id || choiceIndex;
          
          console.log('🔍 [RENDER INPUT] Rendering choice', choiceIndex, ':', { 
            choice_object: choice,
            has_choice_text: !!choice.choice_text,
            has_text: !!choice.text,
            choice_text_value: choice.choice_text,
            text_value: choice.text,
            rawText: rawText,
            final_choiceText: choiceText,
            choiceId: choiceId
          });
          
          return `
          <label style="display:flex;align-items:center;gap:12px;padding:16px;border:2px solid #e9ecef;border-radius:8px;cursor:pointer;background:white;transition:all 0.2s;hover:border-color:#28a745;hover:background:#f8fff9;">
            <input type="radio" name="preview-q${index + 1}" value="${choiceId}" style="margin:0;width:18px;height:18px;accent-color:#28a745;">
            <span style="flex:1;font-size:15px;color:#333;">${choiceText}</span>
          </label>
        `;
        }).join('')}
      </div>
    `;
  } else if (activityType === 'identification') {
    return `
      <div style="margin-bottom:16px;">
        <label style="display:block;margin-bottom:8px;font-weight:500;color:#333;font-size:14px;">Your Answer:</label>
        <input type="text" name="preview-q${index + 1}" placeholder="Enter your answer here..." style="width:100%;padding:12px;border:2px solid #e9ecef;border-radius:6px;font-size:15px;transition:border-color 0.2s;focus:outline:none;focus:border-color:#28a745;" oninput="window.updateProgress()">
      </div>
    `;
  } else if (activityType === 'true_false') {
    console.log('🔍 DEBUG: Rendering true_false question');
    const trueFalseHtml = `
      <div style="display:flex;gap:12px;">
        <label style="flex:1;display:flex;align-items:center;gap:12px;padding:16px;border:2px solid #e9ecef;border-radius:8px;cursor:pointer;background:white;transition:all 0.2s;hover:border-color:#28a745;hover:background:#f8fff9;">
          <input type="radio" name="preview-q${index + 1}" value="true" style="margin:0;width:18px;height:18px;accent-color:#28a745;">
          <span style="font-size:15px;color:#333;font-weight:500;">True</span>
        </label>
        <label style="flex:1;display:flex;align-items:center;gap:12px;padding:16px;border:2px solid #e9ecef;border-radius:8px;cursor:pointer;background:white;transition:all 0.2s;hover:border-color:#28a745;hover:background:#f8fff9;">
          <input type="radio" name="preview-q${index + 1}" value="false" style="margin:0;width:18px;height:18px;accent-color:#28a745;">
          <span style="font-size:15px;color:#333;font-weight:500;">False</span>
        </label>
      </div>
    `;
    console.log('🔍 DEBUG: True/False HTML generated:', trueFalseHtml);
    return trueFalseHtml;
  } else if (activityType === 'essay') {
    return `
      <div style="margin-bottom:16px;">
        <label style="display:block;margin-bottom:8px;font-weight:500;color:#333;font-size:14px;">Your Answer:</label>
        <textarea name="preview-q${index + 1}" rows="6" placeholder="Write your essay here..." style="width:100%;padding:12px;border:2px solid #e9ecef;border-radius:6px;font-size:15px;resize:vertical;transition:border-color 0.2s;focus:outline:none;focus:border-color:#28a745;" oninput="window.updateProgress()"></textarea>
      </div>
    `;
  } else if (activityType === 'upload_based') {
    return `
      <div style="border:2px dashed #dee2e6;border-radius:8px;padding:24px;text-align:center;background:#f8f9fa;">
        <div style="font-size:32px;margin-bottom:12px;">📎</div>
        <h4 style="margin:0 0 8px 0;color:#333;">Upload Your File</h4>
        <p style="margin:0 0 16px 0;color:#6c757d;font-size:14px;">Accepted formats: ${(question.acceptedFiles || ['PDF', 'DOCX', 'JPG', 'PNG']).join(', ')}</p>
        <p style="margin:0 0 16px 0;color:#6c757d;font-size:14px;">Maximum file size: ${question.maxFileSize || 10}MB</p>
        <button style="background:#28a745;color:white;border:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;" onclick="window.updateProgress()">
          Choose File
        </button>
      </div>
    `;
  } else if (activityType === 'coding') {
    return `
      <div style="margin-bottom:16px;">
        <label style="display:block;margin-bottom:8px;font-weight:500;color:#333;font-size:14px;">Your Code:</label>
        <textarea name="preview-q${index + 1}" rows="12" placeholder="Write your code here..." style="width:100%;padding:12px;border:2px solid #e9ecef;border-radius:6px;font-family:monospace;font-size:14px;resize:vertical;transition:border-color 0.2s;focus:outline:none;focus:border-color:#28a745;" oninput="window.updateProgress()"></textarea>
        <div style="margin-top:12px;display:flex;gap:8px;">
          <button style="background:#28a745;color:white;border:none;padding:8px 16px;border-radius:4px;font-size:12px;cursor:pointer;">
            Run Code
          </button>
          <button style="background:#6c757d;color:white;border:none;padding:8px 16px;border-radius:4px;font-size:12px;cursor:pointer;">
            Clear
          </button>
        </div>
      </div>
    `;
  }
  
  console.log('🔍 DEBUG: No matching activity type, returning default');
  return '<div style="color:#6c757d;font-size:14px;">Question type not supported</div>';
}

// Function to scroll to question (for navigation) - Global scope
window.scrollToQuestion = function(index) {
  const questionElement = document.getElementById('question-' + index);
  if (questionElement) {
    questionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Update navigation visual state
    document.querySelectorAll('[id^="nav-"]').forEach(nav => {
      nav.style.background = 'white';
      nav.style.borderColor = '#dee2e6';
      nav.style.color = '#495057';
    });
    
    const currentNav = document.getElementById('nav-' + index);
    if (currentNav) {
      currentNav.style.background = '#e3f2fd';
      currentNav.style.borderColor = '#2196f3';
      currentNav.style.color = '#1976d2';
    }
  }
}

// Function to test preview activity (auto-grade without saving) - Global scope
window.testPreviewActivity = function(activityType) {
  console.log('🔍 [TEST PREVIEW] Testing activity:', activityType);
  
  // Essay and Upload-based activities require manual grading by teacher
  if (activityType === 'essay' || activityType === 'upload_based') {
    alert('This activity type requires manual grading by the teacher. Auto-grading is not available for Essay and Upload-based activities.');
    return;
  }
  
  const activity = window.__previewActivityData || {};
  const questions = activity.questions || [];
  
  if (questions.length === 0) {
    alert('No questions found in this activity.');
    return;
  }
  
  // Collect student answers from DOM
  const studentAnswers = {};
  const questionElements = document.querySelectorAll('[id^="question-"]');
  
  questionElements.forEach((questionEl, index) => {
    const question = questions[index];
    if (!question) return;
    
    if (activityType === 'multiple_choice') {
      // Get selected radio button
      const selectedRadio = questionEl.querySelector('input[type="radio"]:checked');
      if (selectedRadio) {
        studentAnswers[index] = selectedRadio.value; // choice ID
      }
    } else if (activityType === 'true_false') {
      // Get selected radio button (true/false)
      const selectedRadio = questionEl.querySelector('input[type="radio"]:checked');
      if (selectedRadio) {
        studentAnswers[index] = selectedRadio.value; // "true" or "false"
      }
    } else if (activityType === 'identification') {
      // Get text input value
      const textInput = questionEl.querySelector('input[type="text"]');
      if (textInput && textInput.value.trim()) {
        studentAnswers[index] = textInput.value.trim();
      }
    }
  });
  
  const answeredCount = Object.keys(studentAnswers).length;
  if (answeredCount === 0) {
    alert('Please answer at least one question before testing.');
    return;
  }
  
  // Set loading state
  const testBtn = document.getElementById('preview-test-btn');
  if (testBtn) {
    testBtn.disabled = true;
    testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
  }
  
  // Grade the answers
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
      
      // FIX: Get the actual choice text for display
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
      const studentValue = studentAnswer ? String(studentAnswer).toLowerCase().trim() : ''; // "true" or "false"
      
      console.log('🔍 [TEST TRUE/FALSE] Question', index + 1, ':', {
        questionId: question.id || question._id,
        studentValue: studentValue,
        choices: choices.map(c => ({
          id: c.id || c._id,
          choice_text: c.choice_text,
          text: c.text,
          is_correct: c.is_correct,
          correct: c.correct,
          isCorrectFlag: !!c.is_correct || !!c.correct || c.is_correct === 1 || c.correct === 1
        }))
      });
      
      // FIX: Display "True" or "False" instead of "true" or "false"
      studentAnswerDisplay = studentValue === 'true' ? 'True' : (studentValue === 'false' ? 'False' : '(No answer)');
      
      // Find correct choice - check both is_correct flag and correct flag (handle both formats)
      // Also handle numeric values (1/0) and boolean values
      let correctChoice = choices.find(c => {
        const isCorrect = !!c.is_correct || !!c.correct || c.is_correct === 1 || c.correct === 1 || c.is_correct === '1' || c.correct === '1';
        return isCorrect;
      });
      
      console.log('🔍 [TEST TRUE/FALSE] Found correct choice:', correctChoice);
      
      // If no choice marked as correct, try to find by choice_text matching "True" or "False"
      if (!correctChoice && choices.length > 0) {
        // For True/False, typically first choice is True, second is False
        // But we should check the actual text
        correctChoice = choices.find(c => {
          const choiceText = String(c.choice_text || c.text || '').toLowerCase().trim();
          // If it says "true" or "false", assume it might be correct (fallback)
          return choiceText === 'true' || choiceText === 'false';
        });
        console.log('🔍 [TEST TRUE/FALSE] Fallback correct choice by text:', correctChoice);
      }
      
      if (correctChoice) {
        // Get correct value from choice_text or text field
        let correctValue = String(correctChoice.choice_text || correctChoice.text || '').toLowerCase().trim();
        
        // If choice_text is empty, infer from position (first = True, second = False)
        if (!correctValue || correctValue === '') {
          const correctIndex = choices.indexOf(correctChoice);
          correctValue = correctIndex === 0 ? 'true' : 'false';
          console.log('🔍 [TEST TRUE/FALSE] Inferred correct value from position:', correctValue);
        }
        
        // Normalize to "true" or "false"
        if (correctValue === 'true' || correctValue === '1') {
          correctValue = 'true';
          correctAnswer = 'True';
        } else if (correctValue === 'false' || correctValue === '0') {
          correctValue = 'false';
          correctAnswer = 'False';
        } else {
          // Fallback: use the choice text as-is, but capitalize first letter
          const choiceText = correctChoice.choice_text || correctChoice.text || '';
          correctAnswer = choiceText ? (choiceText.charAt(0).toUpperCase() + choiceText.slice(1).toLowerCase()) : 'N/A';
          correctValue = String(choiceText).toLowerCase().trim();
        }
        
        console.log('🔍 [TEST TRUE/FALSE] Final correct answer:', {
          correctValue: correctValue,
          correctAnswer: correctAnswer,
          studentValue: studentValue,
          willMatch: studentValue === correctValue
        });
        
        // Compare student answer with correct answer
        if (studentValue && (studentValue === correctValue || studentValue === String(correctValue))) {
          isCorrect = true;
          earnedPoints = points;
          console.log('🔍 [TEST TRUE/FALSE] ✅ Answer is CORRECT');
        } else {
          console.log('🔍 [TEST TRUE/FALSE] ❌ Answer is INCORRECT');
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
          console.log('🔍 [TEST TRUE/FALSE] Using question.answer fallback:', {
            answerValue: answerValue,
            correctAnswer: correctAnswer,
            studentValue: studentValue,
            isCorrect: isCorrect
          });
        } else {
          console.warn('🔍 [TEST TRUE/FALSE] ⚠️ No correct choice found and no question.answer!');
          correctAnswer = 'N/A';
        }
      }
      
      explanation = question.explanation || '';
    } else if (activityType === 'identification') {
      // Check against correct answer (supports multiple acceptable answers)
      const studentValue = String(studentAnswer || '').trim().toLowerCase();
      
      console.log('🔍 [TEST IDENTIFICATION] Question', index + 1, ':', {
        questionId: question.id || question._id,
        studentValue: studentValue,
        hasChoices: !!(question.choices && question.choices.length > 0),
        choicesCount: question.choices ? question.choices.length : 0,
        choices: question.choices ? question.choices.map(c => ({
          id: c.id || c._id,
          choice_text: c.choice_text,
          text: c.text,
          is_correct: c.is_correct,
          correct: c.correct
        })) : [],
        hasAnswer: !!question.answer,
        answer: question.answer,
        hasExplanation: !!question.explanation
      });
      
      // Get acceptable answers - check multiple sources
      const acceptableAnswers = [];
      
      // PRIORITY 1: Check choices with is_correct flag (most reliable for identification)
      const choices = question.choices || [];
      if (choices.length > 0) {
        // Get all correct choices (identification can have multiple correct answers)
        const correctChoices = choices.filter(c => {
          const isCorrect = !!c.is_correct || !!c.correct || c.is_correct === 1 || c.correct === 1 || c.is_correct === '1' || c.correct === '1';
          return isCorrect;
        });
        
        console.log('🔍 [TEST IDENTIFICATION] Found correct choices:', correctChoices);
        
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
      
      // PRIORITY 2: Check explanation (JSON format with primary/alternatives) - supports multiple answers
      if (question.explanation) {
        try {
          const parsed = JSON.parse(question.explanation);
          if (parsed && typeof parsed === 'object' && parsed !== null) {
            // New format with primary + alternatives
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
          // Not JSON, treat as plain text (legacy format)
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
      
      console.log('🔍 [TEST IDENTIFICATION] Final acceptable answers:', acceptableAnswers);
      
      // Grade the answer
      if (acceptableAnswers.length > 0 && studentValue) {
        // Show primary answer for display (capitalize first letter for better readability)
        const primaryAnswer = acceptableAnswers[0];
        correctAnswer = primaryAnswer ? (primaryAnswer.charAt(0).toUpperCase() + primaryAnswer.slice(1)) : 'N/A';
        
        console.log('🔍 [TEST IDENTIFICATION] Grading:', {
          studentValue: studentValue,
          acceptableAnswers: acceptableAnswers,
          correctAnswer: correctAnswer
        });
        
        // Check if student answer matches any acceptable answer (case-insensitive, trimmed)
        // Also handle partial matches for common variations
        isCorrect = acceptableAnswers.some(acceptable => {
          const normalizedAcceptable = acceptable.toLowerCase().trim();
          const normalizedStudent = studentValue.toLowerCase().trim();
          
          // Exact match
          if (normalizedStudent === normalizedAcceptable) {
            console.log('🔍 [TEST IDENTIFICATION] ✅ Exact match found:', normalizedStudent);
            return true;
          }
          
          // Handle common variations (remove extra spaces, punctuation)
          const cleanAcceptable = normalizedAcceptable.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
          const cleanStudent = normalizedStudent.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
          
          if (cleanStudent === cleanAcceptable) {
            console.log('🔍 [TEST IDENTIFICATION] ✅ Clean match found:', cleanStudent);
            return true;
          }
          
          return false;
        });
        
        if (isCorrect) {
          earnedPoints = points;
          console.log('🔍 [TEST IDENTIFICATION] ✅ Answer is CORRECT');
        } else {
          console.log('🔍 [TEST IDENTIFICATION] ❌ Answer is INCORRECT');
        }
      } else if (studentValue) {
        // Student answered but no correct answer found - mark as incorrect
        console.warn('🔍 [TEST IDENTIFICATION] ⚠️ Student answered but no correct answer found!');
        correctAnswer = 'N/A';
        isCorrect = false;
        earnedPoints = 0;
      } else {
        // No student answer
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
          // If explanation was used as answer, don't show it again
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
      studentAnswer: studentAnswerDisplay, // Use display text instead of ID
      correctAnswer: correctAnswer,
      isCorrect: isCorrect,
      points: points,
      earnedPoints: earnedPoints,
      explanation: explanation
    });
  });
  
  // Display results in modal
  const percentage = maxScore > 0 ? ((totalScore / maxScore) * 100).toFixed(1) : 0;
  const passedCount = results.filter(r => r.isCorrect).length;
  
  // Create results modal with interactive features
  const modal = document.createElement('div');
  modal.id = 'previewTestResultsModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn 0.3s ease;';
  
  // Add smooth animations
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
  
  // Calculate score color and styling (icons removed - using color coding only)
  const scoreColor = percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444';
  const scoreBg = percentage >= 80 ? 'rgba(16,185,129,0.08)' : percentage >= 60 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)';
  
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
                            ${r.studentAnswer}
                          </div>
                        </div>
                      </div>
                      ${!r.isCorrect ? `
                        <div style="display:flex;align-items:start;gap:8px;">
                          <div style="width:6px;height:6px;background:#10b981;border-radius:50%;margin-top:6px;flex-shrink:0;"></div>
                          <div style="flex:1;">
                            <div style="font-size:12px;color:#64748b;margin-bottom:4px;font-family:${fontStack};">Correct Answer</div>
                            <div style="font-size:14px;color:#1e293b;padding:10px 14px;background:white;border-radius:8px;border:1px solid #d1fae5;font-family:${fontStack};">
                              ${r.correctAnswer || 'N/A'}
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
  
  console.log('🔍 [TEST PREVIEW] Results:', { totalScore, maxScore, percentage, results });
};

// Function to finish preview attempt - Global scope
window.finishPreviewAttempt = function() {
  // Use the answers from previewState for accurate counting
  const answeredCount = Object.keys(window.previewState.answers).length;
  const totalQuestions = window.previewState.totalQuestions;
  
  console.log('🔍 DEBUG: Finishing preview attempt:', { answeredCount, totalQuestions, answers: window.previewState.answers });
  
  if (answeredCount === 0) {
    alert('Please answer at least one question before submitting.');
    return;
  }
  
  if (answeredCount < totalQuestions) {
    const confirmSubmit = confirm(`You have answered ${answeredCount} out of ${totalQuestions} questions. Are you sure you want to submit?`);
    if (!confirmSubmit) return;
  }
  
  // Stop timer
  stopPreviewTimer();
  
  // Calculate time spent
  const timeSpent = Math.floor((new Date() - window.previewState.startTime) / 1000);
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;
  
  // Show results
  const body = document.querySelector('#cafBody');
  if (body) {
    body.innerHTML = `
      <div style="text-align:center;padding:40px;background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <div style="font-size:64px;margin-bottom:20px;">🎉</div>
        <h2 style="margin:0 0 16px 0;color:#28a745;font-size:28px;">Preview Submitted!</h2>
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;">
          <div style="font-size:18px;color:#333;margin-bottom:8px;">Preview Results</div>
          <div style="font-size:14px;color:#6c757d;">Answered: ${answeredCount} / ${totalQuestions} questions</div>
          <div style="font-size:14px;color:#6c757d;margin-top:4px;">Time spent: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</div>
          <div style="font-size:14px;color:#6c757d;margin-top:4px;">This is a preview - no actual submission was made</div>
        </div>
        <button onclick="window.createActivityState.viewMode = 'edit'; window.dispatchEvent(new CustomEvent('createActivityRender'));" style="background:#28a745;color:white;border:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;margin-top:16px;">
          Back to Edit
        </button>
      </div>
    `;
  }
}

// Global variables for coordinator preview
window.previewState = {
  startTime: null,
  timerInterval: null,
  answers: {},
  totalQuestions: 0
};

// Initialize progress tracking for coordinator preview
function initializePreviewProgressTracking() {
  console.log('🔍 DEBUG: Initializing preview progress tracking');
  
  // CRITICAL: Reset answers object to ensure it starts empty
  window.previewState.answers = {};
  console.log('🔍 DEBUG: Reset previewState.answers to empty object');
  
  // Initialize timer
  window.previewState.startTime = new Date();
  startPreviewTimer();
  
  // Count total questions
  const questionElements = document.querySelectorAll('[id^="question-"]');
  window.previewState.totalQuestions = questionElements.length;
  console.log('🔍 DEBUG: Found question elements:', questionElements.length);
  console.log('🔍 DEBUG: Question elements:', questionElements);
  
  // CRITICAL: Update progress immediately after initialization to show 0/5
  setTimeout(() => {
    updatePreviewProgress();
  }, 50);
  
  // Setup choice click handlers for deselection (like teacher side)
  setupPreviewChoiceClickHandlers();
  
  // CRITICAL: Remove old text input listeners if they exist to prevent duplicates
  if (window.__previewTextInputHandler) {
    document.removeEventListener('input', window.__previewTextInputHandler);
    console.log('🔍 DEBUG: Removed old preview text input handler');
  }
  
  // Track text input changes
  window.__previewTextInputHandler = (e) => {
    if (e.target.type === 'text' && e.target.name && e.target.name.startsWith('preview-q')) {
      const questionIndex = parseInt(e.target.name.replace('preview-q', '')) - 1;
      console.log('🔍 DEBUG: Parsed text question index (FIXED):', questionIndex, 'from name:', e.target.name);
      if (e.target.value.trim()) {
        window.previewState.answers[questionIndex] = e.target.value;
      } else {
        delete window.previewState.answers[questionIndex];
      }
      updatePreviewProgress();
      debouncedAutosave();
      console.log('🔍 DEBUG: Preview text answer recorded:', e.target.value);
    }
  };
  document.addEventListener('input', window.__previewTextInputHandler);
  
  // CRITICAL: Remove old textarea listeners if they exist to prevent duplicates
  if (window.__previewTextareaHandler) {
    document.removeEventListener('input', window.__previewTextareaHandler);
    console.log('🔍 DEBUG: Removed old preview textarea handler');
  }
  
  // Track textarea changes
  window.__previewTextareaHandler = (e) => {
    if (e.target.tagName === 'TEXTAREA' && e.target.name && e.target.name.startsWith('preview-q')) {
      const questionIndex = parseInt(e.target.name.replace('preview-q', '')) - 1;
      console.log('🔍 DEBUG: Parsed textarea question index (FIXED):', questionIndex, 'from name:', e.target.name);
      if (e.target.value.trim()) {
        window.previewState.answers[questionIndex] = e.target.value;
      } else {
        delete window.previewState.answers[questionIndex];
      }
      updatePreviewProgress();
      debouncedAutosave();
      console.log('🔍 DEBUG: Preview textarea answer recorded:', e.target.value);
    }
  };
  document.addEventListener('input', window.__previewTextareaHandler);
  
  // Bind keyboard shortcuts (no navigation needed for continuous scroll)
  bindPreviewKeyboardShortcuts();
}

// Start timer for coordinator preview
function startPreviewTimer() {
  window.previewState.timerInterval = setInterval(() => {
    const now = new Date();
    const elapsed = Math.floor((now - window.previewState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    const timerEl = document.getElementById('timer');
    if (timerEl) {
      timerEl.textContent = `⏱️ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }, 1000);
}

// Stop timer for coordinator preview
function stopPreviewTimer() {
  if (window.previewState.timerInterval) {
    clearInterval(window.previewState.timerInterval);
    window.previewState.timerInterval = null;
  }
}

// Debounced autosave function
let autosaveTimeout;
function debouncedAutosave() {
  clearTimeout(autosaveTimeout);
  autosaveTimeout = setTimeout(() => {
    savePreviewProgress();
  }, 2000); // Save after 2 seconds of inactivity
}

// Save preview progress (simulated)
function savePreviewProgress() {
  console.log('🔍 DEBUG: Autosaving preview progress:', window.previewState.answers);
  // No notification for preview mode - just silent tracking
}
// Bind keyboard shortcuts for coordinator preview (simplified for continuous scroll)
function bindPreviewKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Only handle shortcuts when preview modal is open
    if (!document.getElementById('progress-section')) return;
    
    // Only keep Ctrl+Enter for submission
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      window.finishPreviewAttempt();
    }
  });
}

// Show notification for coordinator preview
function showPreviewNotification(type, message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 10000;
    padding: 12px 20px; border-radius: 6px; font-size: 14px; font-weight: 600;
    background: ${type === 'success' ? '#28a745' : '#dc3545'}; color: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Setup choice click handlers for coordinator preview (like teacher side)
// CRITICAL: Store the handler function so we can remove it before adding a new one
window.__previewChoiceClickHandler = null;

function setupPreviewChoiceClickHandlers() {
  console.log('🔍 DEBUG: Setting up preview choice click handlers');
  
  // CRITICAL: Remove old listener if it exists to prevent duplicates
  if (window.__previewChoiceClickHandler) {
    document.removeEventListener('click', window.__previewChoiceClickHandler);
    console.log('🔍 DEBUG: Removed old preview choice click handler');
  }
  
  // Create the event handler function
  window.__previewChoiceClickHandler = (event) => {
    // Look for label elements that contain radio inputs with preview-q names
    const label = event.target.closest('label');
    if (label && label.querySelector('input[type="radio"][name^="preview-q"]')) {
      event.preventDefault();
      event.stopPropagation();
      
      const radioInput = label.querySelector('input[type="radio"]');
      const questionIndex = parseInt(radioInput.name.replace('preview-q', '')) - 1; // Convert to 0-based index
      console.log('🔍 DEBUG: Parsed question index (FIXED):', questionIndex, 'from name:', radioInput.name);
      const isCurrentlySelected = radioInput.checked;
      
      console.log('🔍 DEBUG: Label clicked, question:', questionIndex, 'currently selected:', isCurrentlySelected);
      
      if (isCurrentlySelected) {
        // If already selected, deselect it
        radioInput.checked = false;
        label.style.background = 'white';
        label.style.borderColor = '#e9ecef';
        
        // Remove answer from answers object
        delete window.previewState.answers[questionIndex];
        console.log('🔍 DEBUG: Removed answer from previewState:', questionIndex);
        console.log('🔍 DEBUG: Current answers after removal:', window.previewState.answers);
        updatePreviewProgress();
        debouncedAutosave();
        
        console.log('🔍 DEBUG: Preview choice deselected for question', questionIndex);
      } else {
        // If not selected, select it and deselect others
        radioInput.checked = true;
        label.style.background = '#e3f2fd';
        label.style.borderColor = '#2196f3';
        
        // Deselect other choices in the same question
        const allChoices = document.querySelectorAll(`input[name="${radioInput.name}"]`);
        allChoices.forEach(choice => {
          if (choice !== radioInput) {
            const otherLabel = choice.closest('label');
            if (otherLabel) {
              otherLabel.style.background = 'white';
              otherLabel.style.borderColor = '#e9ecef';
            }
          }
        });
        
        // CRITICAL: Only add answer if it doesn't already exist (prevent duplicates)
        if (!window.previewState.answers[questionIndex]) {
          window.previewState.answers[questionIndex] = radioInput.value;
          console.log('🔍 DEBUG: Added answer to previewState:', questionIndex, radioInput.value);
        } else {
          // Update existing answer
          window.previewState.answers[questionIndex] = radioInput.value;
          console.log('🔍 DEBUG: Updated answer in previewState:', questionIndex, radioInput.value);
        }
        console.log('🔍 DEBUG: Current answers:', window.previewState.answers);
        console.log('🔍 DEBUG: Radio input name:', radioInput.name);
        updatePreviewProgress();
        debouncedAutosave();
        
        console.log('🔍 DEBUG: Preview choice selected for question', questionIndex, radioInput.value);
      }
    }
  };
  
  // Add the new event listener
  document.addEventListener('click', window.__previewChoiceClickHandler);
  console.log('🔍 DEBUG: Added new preview choice click handler');
}
// Update progress for coordinator preview
function updatePreviewProgress() {
  const progressCounter = document.getElementById('progress-counter');
  const progressBar = document.getElementById('progress-bar');
  
  if (!progressCounter || !progressBar) {
    console.log('🔍 DEBUG: Progress elements not found:', { progressCounter: !!progressCounter, progressBar: !!progressBar });
    return;
  }
  
  // Use the answers from previewState instead of DOM queries
  const answeredCount = Object.keys(window.previewState.answers).length;
  const totalQuestions = window.previewState.totalQuestions;
  
  console.log('🔍 DEBUG: updatePreviewProgress called:', { answeredCount, totalQuestions, answers: window.previewState.answers });
  
  // Update progress counter
  progressCounter.textContent = `${answeredCount} / ${totalQuestions} answered`;
  
  // Update progress bar
  const percentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  progressBar.style.width = `${percentage}%`;
  
  console.log('🔍 DEBUG: Preview progress updated:', `${answeredCount}/${totalQuestions} (${percentage.toFixed(1)}%)`);
}

// Question navigation removed - using continuous scroll like teacher side

// Function to update progress counter - Global scope
window.updateProgress = function() {
  // Count answered questions more accurately
  let answeredQuestions = 0;
  const questionElements = document.querySelectorAll('[id^="question-"]');
  
  questionElements.forEach(questionEl => {
    const hasRadioAnswer = questionEl.querySelector('input[type="radio"]:checked');
    
    // FIX: Check actual .value property instead of CSS selector for text inputs
    const textInput = questionEl.querySelector('input[type="text"]');
    const hasTextAnswer = textInput && textInput.value && textInput.value.trim() !== '';
    
    // FIX: Check actual .value property instead of CSS selector for textareas
    const textareaInput = questionEl.querySelector('textarea');
    const hasTextareaAnswer = textareaInput && textareaInput.value && textareaInput.value.trim() !== '';
    
    if (hasRadioAnswer || hasTextAnswer || hasTextareaAnswer) {
      answeredQuestions++;
    }
  });
  
  const totalQuestions = questionElements.length;
  const progressCounter = document.getElementById('progress-counter');
  
  if (progressCounter) {
    progressCounter.textContent = `${answeredQuestions} / ${totalQuestions} answered`;
    
    // Update navigation buttons
    document.querySelectorAll('[id^="nav-"]').forEach((nav, index) => {
      const questionElement = document.getElementById('question-' + index);
      if (questionElement) {
        const hasRadioAnswer = questionElement.querySelector('input[type="radio"]:checked');
        
        // FIX: Check actual .value property instead of CSS selector
        const textInput = questionElement.querySelector('input[type="text"]');
        const hasTextAnswer = textInput && textInput.value && textInput.value.trim() !== '';
        
        const textareaInput = questionElement.querySelector('textarea');
        const hasTextareaAnswer = textareaInput && textareaInput.value && textareaInput.value.trim() !== '';
        
        const hasAnswer = hasRadioAnswer || hasTextAnswer || hasTextareaAnswer;
        
        if (hasAnswer) {
          nav.style.background = '#d4edda';
          nav.style.borderColor = '#28a745';
          nav.style.color = '#155724';
        } else {
          nav.style.background = 'white';
          nav.style.borderColor = '#dee2e6';
          nav.style.color = '#495057';
        }
      }
    });
  }
}

// Function to collect student answers
function collectStudentAnswers() {
  const answers = {};
  const form = document.querySelector('#testBody');
  
  if (!form) {
    return answers;
  }
  
  // Collect radio button answers
  form.querySelectorAll('input[type="radio"]:checked').forEach(input => {
    answers[input.name] = {
      value: input.value,
      type: 'radio'
    };
  });
  
  // Collect text inputs
  form.querySelectorAll('input[type="text"]').forEach(input => {
    if (input.value.trim()) {
      answers[input.name] = {
        value: input.value.trim(),
        type: 'text'
      };
    }
  });
  
  // Collect textareas
  form.querySelectorAll('textarea').forEach(textarea => {
    if (textarea.value.trim()) {
      answers[textarea.name] = {
        value: textarea.value.trim(),
        type: 'textarea',
        wordCount: textarea.value.trim().split(/\s+/).filter(word => word.length > 0).length
      };
      console.log('🔍 DEEP DEBUG - Textarea answer collected:', textarea.name, textarea.value.substring(0, 50) + '...');
    }
  });
  
  return answers;
}

// Function to show test results
function showTestResults(results, activityTitle) {
  // Create a professional results modal
  const resultsModal = document.createElement('div');
  resultsModal.className = 'modal-overlay';
  resultsModal.innerHTML = `
    <div class="modal-card" style="max-width:700px;width:95%;max-height:80vh;display:flex;flex-direction:column;">
      <div style="padding:16px;border-bottom:1px solid #e9ecef;background:#f8f9fa;">
        <h3 style="margin:0;color:#333;font-size:18px;">📊 Quiz Results</h3>
        <p style="margin:4px 0 0 0;color:#666;font-size:14px;">Your answers have been recorded</p>
      </div>
      <div style="padding:20px;overflow:auto;flex:1;">
        ${generateResultsContent(results)}
      </div>
      <div style="padding:16px;border-top:1px solid #e9ecef;background:#f8f9fa;text-align:right;">
        <button onclick="this.closest('.modal-overlay').remove()" style="background:#007bff;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;">Close</button>
      </div>
    </div>`;
  
  document.body.appendChild(resultsModal);
  resultsModal.addEventListener('click', function(e) {
    if (e.target === resultsModal) resultsModal.remove();
  });
}
// Function to generate results content
function generateResultsContent(results) {
  let html = '';
  
  if (Object.keys(results).length === 0) {
    html += '<div style="text-align:center;padding:40px;color:#6c757d;">No answers provided</div>';
  } else {
    html += '<div style="margin-bottom:20px;">';
    html += '<h4 style="margin:0 0 16px 0;color:#333;">Your Answers:</h4>';
    
    Object.entries(results).forEach(([questionName, answer], index) => {
      html += `
        <div style="margin-bottom:16px;padding:16px;background:white;border:1px solid #e9ecef;border-radius:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <strong style="color:#333;">Question ${index + 1}</strong>
            <span style="background:#e9ecef;padding:2px 8px;border-radius:4px;font-size:12px;color:#666;">Answered</span>
          </div>
          <div style="color:#666;font-size:14px;">
            <strong>Your Answer:</strong> ${answer.value}
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    
    // Summary
    html += `
      <div style="background:#d4edda;border:1px solid #c3e6cb;border-radius:8px;padding:16px;color:#155724;">
        <h4 style="margin:0 0 8px 0;">✅ Quiz Completed!</h4>
        <p style="margin:0;font-size:14px;">You answered ${Object.keys(results).length} question(s). In the actual system, your answers would be automatically graded and your score would be calculated.</p>
      </div>
    `;
  }
  
  return html;
}

// ===== CREATE ACTIVITY QUESTION MANAGEMENT FUNCTIONS =====

// Function to add a new question
function addQuestion() {
  const state = window.createActivityState;
  if (!state) {
    return;
  }
  
  const newQuestion = {
    text: '',
    points: 1,
    choices: state.questionType === 'multiple_choice' ? [
      { text: '', correct: false },
      { text: '', correct: false },
      { text: '', correct: false },
      { text: '', correct: false }
    ] : [],
    answer: '',
    explanation: '',
    matchingPairs: state.questionType === 'matching' ? [{ left: '', right: '' }] : [],
    // Upload-based specific fields
    acceptedFiles: state.questionType === 'upload_based' ? ['pdf', 'docx', 'xml', 'jpg', 'png'] : [],
    maxFileSize: state.questionType === 'upload_based' ? 10 : null,
    // Identification: multiple correct answers support
    alternativeAnswers: state.questionType === 'identification' ? [] : undefined
  };
  
  state.questions.push(newQuestion);
  // Trigger re-render by dispatching a custom event
  window.dispatchEvent(new CustomEvent('createActivityRender'));
  if (window.__cafScheduleSave) window.__cafScheduleSave();
}

  // Make functions globally accessible
  window.addQuestion = addQuestion;
  window.deleteQuestion = deleteQuestion;
  window.moveQuestion = moveQuestion;
  window.updateQuestion = updateQuestion;
  window.addChoice = addChoice;
  window.deleteChoice = deleteChoice;
  window.updateChoice = updateChoice;
  window.addTestCase = addTestCase;
  window.updateTestCase = updateTestCase;
  window.deleteTestCase = deleteTestCase;

// Function to delete a question
function deleteQuestion(index) {
  const state = window.createActivityState;
  if (!state) {
    return;
  }
  
  state.questions.splice(index, 1);
  
  // Trigger re-render by dispatching a custom event
  window.dispatchEvent(new CustomEvent('createActivityRender'));
  if (window.__cafScheduleSave) window.__cafScheduleSave();
}

// Function to move a question up or down
function moveQuestion(index, direction) {
  const state = window.createActivityState;
  if (!state) {
    return;
  }
  
  if (direction === 'up' && index > 0) {
    [state.questions[index], state.questions[index - 1]] = [state.questions[index - 1], state.questions[index]];
  } else if (direction === 'down' && index < state.questions.length - 1) {
    [state.questions[index], state.questions[index + 1]] = [state.questions[index + 1], state.questions[index]];
  }
  
  // Trigger re-render by dispatching a custom event
  window.dispatchEvent(new CustomEvent('createActivityRender'));
  if (window.__cafScheduleSave) window.__cafScheduleSave();
}

// Function to update question properties
function updateQuestion(index, property, value) {
  const state = window.createActivityState;
  if (!state) {
    return;
  }
  
  if (state.questions[index]) {
    // Convert alternativeAnswers textarea (newline-separated) to array
    if (property === 'alternativeAnswers') {
      state.questions[index].alternativeAnswers = value ? value.split('\n').map(a => a.trim()).filter(a => a.length > 0) : [];
    } else {
    state.questions[index][property] = value;
    }
  }
  if (window.__cafScheduleSave) window.__cafScheduleSave();
}

// Function to add a choice to a multiple choice question
function addChoice(questionIndex) {
  const state = window.createActivityState;
  if (!state) {
    return;
  }
  
  if (state.questions[questionIndex] && state.questionType === 'multiple_choice') {
    if (!state.questions[questionIndex].choices) {
      state.questions[questionIndex].choices = [];
    }
    state.questions[questionIndex].choices.push({ text: '', correct: false });
    // Trigger re-render by dispatching a custom event
    window.dispatchEvent(new CustomEvent('createActivityRender'));
    if (window.__cafScheduleSave) window.__cafScheduleSave();
  } else {
  }
}

// Function to delete a choice
function deleteChoice(questionIndex, choiceIndex) {
  const state = window.createActivityState;
  if (!state) {
    return;
  }
  
  if (state.questions[questionIndex] && state.questions[questionIndex].choices) {
    state.questions[questionIndex].choices.splice(choiceIndex, 1);
    
    // Trigger re-render by dispatching a custom event
    window.dispatchEvent(new CustomEvent('createActivityRender'));
    if (window.__cafScheduleSave) window.__cafScheduleSave();
  }
}

// Function to update choice properties
function updateChoice(questionIndex, choiceIndex, property, value) {
  const state = window.createActivityState;
  if (!state) {
    return;
  }
  
  if (state.questions[questionIndex] && state.questions[questionIndex].choices[choiceIndex]) {
    state.questions[questionIndex].choices[choiceIndex][property] = value;
  }
  if (window.__cafScheduleSave) window.__cafScheduleSave();
}

// ===== Coding test cases (for create form) =====
function addTestCase(){
  const state = window.createActivityState; if (!state) return;
  if (!Array.isArray(state.testCases)) state.testCases = [];
  // Auto-assign default points by difficulty order
  const idx = state.testCases.length;
  let points = 0; if (idx <= 1) points = 10; else if (idx <= 3) points = 20; else points = 40;
  state.testCases.push({ input:'', output:'', isSample: state.testCases.length===0, points: points });
  renderTestCases();
  if (window.__cafScheduleSave) window.__cafScheduleSave();
}
function updateTestCase(index, field, value){
  const state = window.createActivityState; if (!state || !state.testCases || !state.testCases[index]) return;
  if (field === 'isSample') {
    state.testCases[index].isSample = !!value;
  } else if (field === 'input') {
    state.testCases[index].input = value;
  } else if (field === 'output') {
    state.testCases[index].output = value;
  } else if (field === 'points') {
    // Ensure points is always a number
    state.testCases[index].points = parseInt(value || 0, 10) || 0;
    console.log('🔍 [TEST CASE] Updated points for TC', index + 1, 'to', state.testCases[index].points);
  } else {
    state.testCases[index][field] = value;
  }
  if (window.__cafScheduleSave) window.__cafScheduleSave();
}
function deleteTestCase(index){
  const state = window.createActivityState; if (!state || !state.testCases) return;
  state.testCases.splice(index,1);
  renderTestCases();
  if (window.__cafScheduleSave) window.__cafScheduleSave();
}
// Re-render only the Test Cases container to avoid wiping other inputs
function renderTestCases(){
  const state = window.createActivityState; if (!state) return;
  const cont = document.getElementById('testCasesContainer');
  if (!cont) return;
  console.log('🔍 [RENDER TEST CASES] Rendering', state.testCases ? state.testCases.length : 0, 'test cases');
  if (state.testCases) {
    console.log('🔍 [RENDER TEST CASES] Raw state.testCases:', JSON.stringify(state.testCases));
    state.testCases.forEach((tc, i) => {
      console.log(`🔍 [RENDER TEST CASES] TC ${i} raw object:`, tc);
      console.log(`🔍 [RENDER TEST CASES] TC ${i} keys:`, Object.keys(tc));
      console.log(`🔍 [RENDER TEST CASES] TC ${i}: points=${tc.points}, pointsType=${typeof tc.points}, isSample=${tc.isSample}, input="${tc.input}", output="${tc.output}"`);
    });
  } else {
    console.warn('🔍 [RENDER TEST CASES] WARNING: state.testCases is null/undefined!');
  }
  // Preserve active field and caret before update
  let active = document.activeElement;
  let preserve = null;
  try {
    if (active && cont.contains(active)) {
      preserve = {
        field: active.getAttribute('data-tc-field') || '',
        index: parseInt(active.getAttribute('data-tc-index') || '-1', 10),
        caret: typeof active.selectionStart === 'number' ? active.selectionStart : null
      };
    }
  } catch(_){}

  cont.innerHTML = (state.testCases || []).map(function(testCase, index){
    // CRITICAL: Log the EXACT testCase object BEFORE any processing
    console.log(`🔍 [RENDER_TEST_CASES] ========== TC ${index} RAW OBJECT ==========`);
    console.log(`🔍 [RENDER_TEST_CASES] TC ${index} full object:`, testCase);
    console.log(`🔍 [RENDER_TEST_CASES] TC ${index} keys:`, Object.keys(testCase));
    console.log(`🔍 [RENDER_TEST_CASES] TC ${index} hasOwnProperty('points'):`, testCase.hasOwnProperty('points'));
    console.log(`🔍 [RENDER_TEST_CASES] TC ${index} 'points' in testCase:`, 'points' in testCase);
    console.log(`🔍 [RENDER_TEST_CASES] TC ${index} testCase.points:`, testCase.points, 'type:', typeof testCase.points);
    console.log(`🔍 [RENDER_TEST_CASES] TC ${index} JSON.stringify:`, JSON.stringify(testCase));
    console.log(`🔍 [RENDER_TEST_CASES] ==========================================`);
    
    const safeIn = (testCase.input||'').replace(/"/g,'&quot;');
    const safeOut = (testCase.output||'').replace(/"/g,'&quot;');
    // CRITICAL: Handle points explicitly - check for undefined, null, or empty
    let pts = 0;
    if (testCase.points !== null && testCase.points !== undefined && testCase.points !== '') {
      pts = parseInt(String(testCase.points), 10);
      if (isNaN(pts)) pts = 0;
    } else {
      console.warn(`🔍 [RENDER_TEST_CASES] ⚠️ TC ${index} points is null/undefined/empty! Using 0 as fallback.`);
    }
    console.log(`🔍 [RENDER_TEST_CASES] TC ${index} FINAL parsed pts:`, pts);
    return '\n      <div class="test-case" style="display:flex;gap:12px;align-items:center;margin-bottom:12px;padding:12px;background:white;border-radius:6px;border:1px solid #e3e6ea;">\n        <div style="flex:1;">\n          <label style="display:block;margin-bottom:4px;font-size:12px;color:#666;font-weight:500;">Input:</label>\n          <input type="text" class="modal-input" data-tc-index="'+index+'" data-tc-field="input" value="'+safeIn+'" placeholder="Test input..." oninput="updateTestCase('+index+', \'input\', this.value)" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />\n        </div>\n        <div style="flex:1;">\n          <label style="display:block;margin-bottom:4px;font-size:12px;color:#666;font-weight:500;">Expected Output:</label>\n          <input type="text" class="modal-input" data-tc-index="'+index+'" data-tc-field="output" value="'+safeOut+'" placeholder="Expected output..." oninput="updateTestCase('+index+', \'output\', this.value)" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />\n        </div>\n        <div style="width:110px;">\n          <label style="display:block;margin-bottom:4px;font-size:12px;color:#666;font-weight:500;">Points</label>\n          <input type="number" min="0" step="1" class="modal-input" data-tc-index="'+index+'" data-tc-field="points" value="'+pts+'" oninput="updateTestCase('+index+', \'points\', this.value)" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />\n        </div>\n        <div style="display:flex;align-items:center;gap:6px;">\n          <label style="font-size:12px;color:#666;">Sample</label>\n          <input type="checkbox" data-tc-index="'+index+'" data-tc-field="isSample" '+(testCase.isSample?'checked':'')+' onchange="updateTestCase('+index+', \'isSample\', this.checked)" />\n        </div>\n        <button class="action-btn btn-red" onclick="deleteTestCase('+index+')" style="padding:8px 12px;font-size:12px;">Delete</button>\n      </div>';
  }).join('');

  // Initialize sortable if available
  try {
    if (typeof Sortable !== 'undefined' && !cont.__sortableBound) {
      cont.__sortableBound = true;
      Sortable.create(cont, {
        animation: 120,
        handle: '.test-case',
        onEnd: function(evt){
          try {
            const from = evt.oldIndex; const to = evt.newIndex;
            if (typeof from === 'number' && typeof to === 'number' && from !== to) {
              const moved = state.testCases.splice(from, 1)[0];
              state.testCases.splice(to, 0, moved);
              if (window.__cafScheduleSave) window.__cafScheduleSave();
              renderTestCases();
            }
          } catch(_){}
        }
      });
    }
  } catch(_){ }

  // Restore active field and caret after update
  if (preserve && preserve.index >= 0) {
    try {
      const sel = 'input[data-tc-index="'+preserve.index+'"][data-tc-field="'+preserve.field+'"]';
      const el = cont.querySelector(sel);
      if (el) {
        el.focus();
        if (typeof preserve.caret === 'number') { el.setSelectionRange(preserve.caret, preserve.caret); }
      }
    } catch(_){}
  }
}
// Function to add matching pair
function addMatchingPair(questionIndex) {
  const state = window.createActivityState;
  if (!state) {
    return;
  }
  if (!state.questions[questionIndex].matchingPairs) {
    state.questions[questionIndex].matchingPairs = [];
  }
  state.questions[questionIndex].matchingPairs.push({ left: '', right: '' });
  window.dispatchEvent(new CustomEvent('createActivityRender'));
  if (window.__cafScheduleSave) window.__cafScheduleSave();
}

// Function to delete matching pair
function deleteMatchingPair(questionIndex, pairIndex) {
  const state = window.createActivityState;
  if (!state) {
    return;
  }
  if (state.questions[questionIndex].matchingPairs && state.questions[questionIndex].matchingPairs[pairIndex]) {
    state.questions[questionIndex].matchingPairs.splice(pairIndex, 1);
    window.dispatchEvent(new CustomEvent('createActivityRender'));
    if (window.__cafScheduleSave) window.__cafScheduleSave();
  }
}

// Function to update matching pair
function updateMatchingPair(questionIndex, pairIndex, field, value) {
  const state = window.createActivityState;
  if (!state) {
    return;
  }
  if (state.questions[questionIndex].matchingPairs && state.questions[questionIndex].matchingPairs[pairIndex]) {
    state.questions[questionIndex].matchingPairs[pairIndex][field] = value;
    window.dispatchEvent(new CustomEvent('createActivityRender'));
    if (window.__cafScheduleSave) window.__cafScheduleSave();
  }
}

// ======================== MATERIAL VIEWERS ========================

function showPDFViewer(url) {
  // Create download URL (remove view=true parameter)
  const downloadUrl = url.replace(/[?&]view=true/, '').replace(/[?&]$/, '');
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;';
  modal.innerHTML = `
    <div class="modal-card" style="max-width:98%;width:98%;height:96vh;display:flex;flex-direction:column;background:#fff;border-radius:8px;overflow:hidden;">
      <div style="padding:10px 12px;border-bottom:1px solid #ddd;display:flex;align-items:center;justify-content:space-between;background:#f8f9fa;">
        <strong style="font-size:16px;color:#333;">📄 PDF Viewer</strong>
        <div style="display:flex;gap:8px;align-items:center;">
          <button class="action-btn" id="pdfViewerFullscreen" title="Fullscreen (F)" style="padding:6px 12px;background:#343a40;color:#fff;">Fullscreen</button>
          <a href="${downloadUrl}" target="_blank" style="padding:6px 12px;background:#007bff;color:#fff;text-decoration:none;border-radius:4px;font-size:12px;">Download</a>
          <button class="action-btn btn-gray" id="pdfViewerClose" style="padding:6px 12px;">Close</button>
        </div>
      </div>
      <div id="pdfContainer" style="flex:1;overflow:hidden;background:#525659;position:relative;">
        <iframe id="pdfFrame" src="${url}" style="width:100%;height:100%;border:0;" title="PDF Viewer" onload="console.log('PDF iframe loaded successfully')" onerror="console.error('PDF iframe failed to load')"></iframe>
        <div id="pdfError" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;text-align:center;display:none;">
          <p>Unable to display PDF in browser.</p>
          <a href="${downloadUrl}" target="_blank" style="color:#4fc3f7;text-decoration:underline;">Click here to download</a>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Show error message if iframe fails to load after 5 seconds
  setTimeout(() => {
    const iframe = modal.querySelector('#pdfFrame');
    const errorDiv = modal.querySelector('#pdfError');
    if (iframe && iframe.contentDocument && iframe.contentDocument.body && iframe.contentDocument.body.textContent.includes('Invalid file')) {
      errorDiv.style.display = 'block';
      iframe.style.display = 'none';
    }
  }, 5000);
  
  const closeBtn = modal.querySelector('#pdfViewerClose');
  const fsBtn = modal.querySelector('#pdfViewerFullscreen');
  const card = modal.querySelector('.modal-card');
  const container = modal.querySelector('#pdfContainer');
  const iframe = modal.querySelector('#pdfFrame');

  function isFullscreenActive() {
    return document.fullscreenElement === card || document.fullscreenElement === container;
  }

  async function toggleFullscreen() {
    try {
      if (!isFullscreenActive()) {
        // Prefer putting the inner container into fullscreen to maximize the PDF area
        if (container.requestFullscreen) await container.requestFullscreen();
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
      }
    } catch (_err) {
      // noop
    }
  }

  function updateFsButton() {
    fsBtn.textContent = isFullscreenActive() ? 'Exit Fullscreen' : 'Fullscreen';
  }

  if (fsBtn) fsBtn.onclick = function(){ toggleFullscreen().then(updateFsButton); };
  document.addEventListener('fullscreenchange', updateFsButton);

  // Keyboard shortcut: F toggles fullscreen, Esc closes
  function onKey(e){
    if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFullscreen().then(updateFsButton); }
    if (e.key === 'Escape') { e.preventDefault(); cleanup(); }
  }

  function cleanup(){
    document.removeEventListener('fullscreenchange', updateFsButton);
    document.removeEventListener('keydown', onKey);
    if (document.fullscreenElement) { try { document.exitFullscreen(); } catch(_){} }
    modal.remove();
  }

  if (closeBtn) closeBtn.onclick = cleanup;
  document.addEventListener('keydown', onKey);
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}


function showCodeViewer(url) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;';
  modal.innerHTML = `
    <div class="modal-card" style="max-width:95%;width:1000px;height:80vh;display:flex;flex-direction:column;background:#fff;border-radius:8px;overflow:hidden;">
      <div style="padding:12px 16px;border-bottom:1px solid #ddd;display:flex;align-items:center;justify-content:space-between;background:#f8f9fa;">
        <strong style="font-size:16px;color:#333;">👁️ Code Viewer</strong>
        <button class="action-btn btn-gray" id="codeViewerClose" style="padding:6px 12px;">Close</button>
      </div>
      <div style="flex:1;overflow:auto;padding:16px;background:#282c34;color:#abb2bf;font-family:monospace;font-size:14px;line-height:1.5;">
        <pre id="codeViewerContent" style="margin:0;white-space:pre-wrap;word-wrap:break-word;">Loading...</pre>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Fetch and display code content
  fetch(url, { credentials: 'same-origin' })
    .then(r => r.text())
    .then(code => {
      modal.querySelector('#codeViewerContent').textContent = code;
    })
    .catch(() => {
      modal.querySelector('#codeViewerContent').textContent = 'Error loading code file.';
    });
  
  modal.querySelector('#codeViewerClose').onclick = () => modal.remove();
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// Lightweight Link Viewer that tries to embed common providers (YouTube, Drive) and falls back gracefully
function showLinkViewer(url) {
  const provider = (function(u){
    if (/youtube\.com\/watch\?v=|youtu\.be\//i.test(u)) return 'youtube';
    if (/drive\.google\.com\//i.test(u)) return 'gdrive';
    return 'generic';
  })(url);

  let embedHtml = '';
  if (provider === 'youtube') {
    // Convert to embed URL
    let vid = '';
    try {
      const u = new URL(url, window.location.origin);
      if (u.hostname.includes('youtu.be')) vid = u.pathname.replace('/', '');
      else vid = u.searchParams.get('v') || '';
    } catch(_){ }
    if (vid) {
      embedHtml = `<iframe src="https://www.youtube.com/embed/${vid}" allowfullscreen style="width:100%;height:100%;border:0;"></iframe>`;
    }
  } else if (provider === 'gdrive') {
    // Try to extract file id and use preview
    let id = '';
    const m = url.match(/\/d\/([A-Za-z0-9_-]+)/);
    if (m) id = m[1];
    if (id) {
      embedHtml = `<iframe src="https://drive.google.com/file/d/${id}/preview" allow="autoplay" style="width:100%;height:100%;border:0;"></iframe>`;
    }
  }

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;';
  modal.innerHTML = `
    <div class="modal-card" style="max-width:98%;width:98%;height:90vh;display:flex;flex-direction:column;background:#fff;border-radius:8px;overflow:hidden;">
      <div style="padding:10px 12px;border-bottom:1px solid #ddd;display:flex;align-items:center;justify-content:space-between;background:#f8f9fa;">
        <strong style="font-size:16px;color:#333;">🔗 Link Viewer</strong>
        <div style="display:flex;gap:8px;align-items:center;">
          <a href="${url}" target="_blank" style="padding:6px 12px;background:#17a2b8;color:#fff;text-decoration:none;border-radius:4px;font-size:12px;">Open in new tab</a>
          <button class="action-btn btn-gray" id="linkViewerClose" style="padding:6px 12px;">Close</button>
        </div>
      </div>
      <div style="flex:1;position:relative;background:#000;">
        ${embedHtml || `<iframe src="${url}" style="width:100%;height:100%;border:0;"></iframe>`}
        <div style="position:absolute;left:0;right:0;bottom:0;padding:8px 12px;color:#ddd;font-size:12px;background:linear-gradient(transparent, rgba(0,0,0,0.6));">
          If the site blocks embedding, use "Open in new tab".
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const closeBtn = modal.querySelector('#linkViewerClose');
  if (closeBtn) closeBtn.onclick = function(){ modal.remove(); };
  modal.addEventListener('click', function(e){ if (e.target === modal) modal.remove(); });
}

// ===== Upload-based Activity Functions =====
function updateAcceptedFiles(fileType, isChecked) {
  if (!window.cafState) return;
  
  if (!window.cafState.acceptedFiles) {
    window.cafState.acceptedFiles = [];
  }
  
  if (isChecked) {
    if (!window.cafState.acceptedFiles.includes(fileType)) {
      window.cafState.acceptedFiles.push(fileType);
    }
  } else {
    window.cafState.acceptedFiles = window.cafState.acceptedFiles.filter(f => f !== fileType);
  }
  
}

function updateMaxFileSize(value) {
  if (!window.cafState) return;
  window.cafState.maxFileSize = parseInt(value) || 10;
}

function updateMaxScore(value) {
  if (!window.cafState) return;
  window.cafState.maxScore = parseInt(value) || 10;
}


function updateInstructions(value) {
  if (!window.cafState) return;
  window.cafState.instructions = value;
}
// ===== Upload-based Activity Question Management Functions =====
function updateQuestionFileTypes(questionIndex, fileType, isChecked) {
  const state = window.createActivityState;
  if (!state || !state.questions) return;
  const question = state.questions[questionIndex];
  if (!question) return;
  
  if (!question.acceptedFiles) question.acceptedFiles = [];
  
  if (isChecked) {
    if (!question.acceptedFiles.includes(fileType)) {
      question.acceptedFiles.push(fileType);
    }
  } else {
    question.acceptedFiles = question.acceptedFiles.filter(type => type !== fileType);
  }
  
  if (window.__cafScheduleSave) window.__cafScheduleSave();
}

function updateQuestionMaxFileSize(questionIndex, value) {
  const state = window.createActivityState;
  if (!state || !state.questions) return;
  const question = state.questions[questionIndex];
  if (!question) return;
  
  question.maxFileSize = parseInt(value) || 10;
  if (window.__cafScheduleSave) window.__cafScheduleSave();
}

// ===== Student Upload-based Test Interface =====
function renderStudentUploadBasedTest(activity) {
  const dueDate = activity.dueDate ? new Date(activity.dueDate).toLocaleString() : 'No due date';
  const acceptedFiles = activity.acceptedFiles || ['pdf', 'docx', 'pptx', 'jpg', 'png', 'txt', 'zip', 'xml', 'gif', 'bmp', 'svg'];
  const maxFileSize = activity.maxFileSize || 10;
  const instructions = activity.instructions || 'Please upload your file according to the activity requirements.';
  
  return `
    <div style="max-width:800px;margin:0 auto;padding:20px;background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <div style="margin-bottom:24px;">
        <h3 style="margin:0 0 8px 0;color:#333;font-size:20px;">📎 ${activity.title || 'Upload Activity'}</h3>
        <p style="margin:0;color:#666;font-size:14px;">Due: ${dueDate}</p>
      </div>
      
      <div style="margin-bottom:24px;padding:16px;background:#f8f9fa;border-radius:6px;border-left:4px solid #007bff;">
        <h4 style="margin:0 0 12px 0;color:#333;font-size:16px;">📋 Instructions</h4>
        <p style="margin:0;color:#555;line-height:1.5;">${instructions}</p>
      </div>
      
      <div style="margin-bottom:24px;">
        <h4 style="margin:0 0 12px 0;color:#333;font-size:16px;">📁 File Upload</h4>
        <div id="uploadArea" style="border:2px dashed #007bff;border-radius:8px;padding:32px;text-align:center;background:#f8f9fa;cursor:pointer;transition:all 0.3s ease;" 
             onmouseover="this.style.background='#e3f2fd'" 
             onmouseout="this.style.background='#f8f9fa'">
          <i class="fas fa-cloud-upload-alt" style="font-size:48px;color:#007bff;margin-bottom:16px;"></i>
          <p style="margin:0 0 8px 0;color:#333;font-size:16px;font-weight:500;">Click to upload or drag and drop your file here</p>
          <p style="margin:0;color:#666;font-size:14px;">Accepted formats: ${acceptedFiles.map(f => f.toUpperCase()).join(', ')}</p>
          <p style="margin:4px 0 0 0;color:#999;font-size:12px;">Maximum file size: ${maxFileSize}MB</p>
          <input type="file" id="fileInput" style="display:none;" accept="${acceptedFiles.map(f => '.' + f).join(',')}" onchange="handleFileSelect(this)" />
        </div>
      </div>
      
      <div id="filePreview" style="display:none;margin-bottom:24px;padding:16px;background:#e8f5e8;border-radius:6px;border-left:4px solid #28a745;">
        <div style="display:flex;align-items:center;gap:12px;">
          <i class="fas fa-file" style="font-size:24px;color:#28a745;"></i>
          <div style="flex:1;">
            <p style="margin:0 0 4px 0;color:#333;font-weight:500;" id="fileName">File selected</p>
            <p style="margin:0;color:#666;font-size:14px;" id="fileSize">Size: 0 KB</p>
          </div>
          <button onclick="removeFile()" style="background:#dc3545;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px;">
            <i class="fas fa-times"></i> Remove
          </button>
        </div>
      </div>
      
      <div style="margin-bottom:24px;">
        <label style="display:block;margin-bottom:8px;color:#333;font-weight:500;">Comments (Optional):</label>
        <textarea id="submissionComments" placeholder="Add any comments or notes about your submission..." style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;font-size:14px;resize:vertical;min-height:80px;"></textarea>
      </div>
      
      <div style="display:flex;gap:12px;justify-content:flex-end;">
        <button onclick="saveDraft()" style="background:#6c757d;color:white;border:none;padding:12px 24px;border-radius:6px;cursor:pointer;font-size:14px;">
          <i class="fas fa-save"></i> Save Draft
        </button>
        <button onclick="submitUpload()" id="submitBtn" style="background:#28a745;color:white;border:none;padding:12px 24px;border-radius:6px;cursor:pointer;font-size:14px;display:none;">
          <i class="fas fa-upload"></i> Submit Upload
        </button>
      </div>
    </div>
    
    <script>
      let selectedFile = null;
      
      // Make upload area clickable
      document.getElementById('uploadArea').onclick = function() {
        document.getElementById('fileInput').click();
      };
      
      function handleFileSelect(input) {
        const file = input.files[0];
        if (!file) return;
        
        // Check file type
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const acceptedTypes = ${JSON.stringify(acceptedFiles)};
        
        if (!acceptedTypes.includes(fileExtension)) {
          alert('File type not accepted. Please select a file with one of these extensions: ' + acceptedTypes.map(t => t.toUpperCase()).join(', '));
    return;
  }
        
        // Check file size
        const maxSize = ${maxFileSize} * 1024 * 1024; // Convert MB to bytes
        if (file.size > maxSize) {
          alert('File size exceeds the maximum limit of ${maxFileSize}MB');
          return;
        }
        
        selectedFile = file;
        showFilePreview(file);
      }
      
      function showFilePreview(file) {
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = 'Size: ' + formatFileSize(file.size);
        document.getElementById('filePreview').style.display = 'block';
        document.getElementById('submitBtn').style.display = 'inline-block';
      }
      
      function removeFile() {
        selectedFile = null;
        document.getElementById('fileInput').value = '';
        document.getElementById('filePreview').style.display = 'none';
        document.getElementById('submitBtn').style.display = 'none';
      }
      
      function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      }
      
      function saveDraft() {
        alert('Draft saved! (This is a demo - actual implementation would save to database)');
      }
      
      function submitUpload() {
        if (!selectedFile) {
          alert('Please select a file to upload');
          return;
        }
        
        const comments = document.getElementById('submissionComments').value;
        
        // Here you would implement the actual file upload
        alert('File uploaded successfully! (This is a demo - actual implementation would upload to server)');
      }
    </script>
  `;
}