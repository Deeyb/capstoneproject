// ===== COORDINATOR DASHBOARD FUNCTIONS =====

// Initialize coordinator tabs
function initCoordinatorTabs() {
  console.log('🔄 Initializing coordinator tabs...');
  
  // Handle URL section parameter
  const urlParams = new URLSearchParams(window.location.search);
  const section = urlParams.get('section');
  
  if (section) {
    console.log('📍 URL section parameter:', section);
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
  console.log('🔄 Coordinator Dashboard: Switching to section:', sectionId);
  
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
    console.log(`✅ Coordinator Dashboard: Section ${sectionId} activated`);
    
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
        try { initSharedProfile(); } catch (e) { console.error('Profile init error:', e); }
      }
    }
  } else {
    console.error(`❌ Coordinator Dashboard: Section ${sectionId} not found`);
  }
}

// Load coordinator dashboard statistics
function loadCoordinatorDashboardStats() {
  console.log('📊 Loading coordinator dashboard statistics...');
  
  fetch('coordinator_dashboard_counts.php', { credentials: 'same-origin' })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        console.log('✅ Dashboard stats loaded:', data);
        
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
            console.error(`❌ Error fetching dashboard stats: Element ${id} not found`);
          }
        });
        
        // Load recent registrations
        loadRecentRegistrations();
        loadRecentLogins();
      } else {
        console.error('❌ Error fetching dashboard stats:', data.message);
      }
    })
    .catch(err => {
      console.error('❌ Error fetching dashboard stats:', err);
    });
}

// Load recent registrations
function loadRecentRegistrations() {
  fetch('coordinator_recent_registrations.php', { credentials: 'same-origin' })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        console.log('✅ Recent registrations loaded:', data.data);
        updateRecentRegistrations(data.data);
      } else {
        console.error('❌ Error loading recent registrations:', data.message);
      }
    })
    .catch(err => {
      console.error('❌ Error loading recent registrations:', err);
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
        console.log('✅ Recent logins loaded:', data.data);
        updateRecentLogins(data.data);
      } else {
        console.error('❌ Error loading recent logins:', data.message);
      }
    })
    .catch(err => {
      console.error('❌ Error loading recent logins:', err);
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
  console.log('📚 Initializing coordinator course management...');
  
  // Set up create course button
  const createBtn = document.getElementById('createCourseBtn');
  if (createBtn) {
    console.log('✅ Create Course button found, setting up click handler');
    createBtn.onclick = function() {
      ensureCreateCourseModal();
    };
  } else {
    console.error('❌ Create Course button NOT found!');
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
  console.log('📚 Loading coordinator courses...');
  
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
        console.log('✅ Courses loaded:', data.data);
        renderCoordinatorCourses(data.data);
      } else {
        console.error('❌ Error loading courses:', data.message);
      }
    })
    .catch(err => {
      console.error('❌ Error loading courses:', err);
    });
}

// Status normalization utility
function normalizeStatus(rawStatus) {
  const status = String(rawStatus || '').toLowerCase().trim();
  const validStatuses = ['draft', 'published', 'archived'];
  const result = validStatuses.includes(status) ? status : 'draft';
  console.log('🔍 normalizeStatus:', { rawStatus, status, result });
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
          <th>Class Type</th>
          <th>Status</th>
          <th>Modules</th>
          <th>Lessons</th>
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
          console.log('🎨 Rendering course:', { id, code, title, rawStatus, statusKey, statusLabel });
          const modulesCount = course.modules_count != null ? course.modules_count : (course.modulesCount || course.modules || 0);
          const lessonsCount = course.lessons_count != null ? course.lessons_count : (course.lessonsCount || course.lessons || 0);
          const updatedRaw = course.updated_at || course.updated || course.last_updated;
          const updatedTxt = updatedRaw ? new Date(updatedRaw).toLocaleString() : '';
          const description = course.description || '';
          const language = course.language || '';
          const classType = course.course_type || 'lecture';
          const classTypeLabel = classType === 'laboratory' ? 'Laboratory' : 'Lecture';
          const classTypeClass = classType === 'laboratory' ? 'lab-type' : 'lecture-type';
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
            <td class="course-type">
              <span class="class-type-badge ${classTypeClass}">${classTypeLabel}</span>
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
                <option value="Java">Java</option>
                <option value="Python">Python</option>
                <option value="C++">C++</option>
                <option value="C#">C#</option>
                <option value="JavaScript">JavaScript</option>
                <option value="PHP">PHP</option>
                <option value="C">C</option>
                <option value="Swift">Swift</option>
                <option value="Kotlin">Kotlin</option>
                <option value="Go">Go</option>
                <option value="Rust">Rust</option>
                <option value="Ruby">Ruby</option>
                <option value="Other">Other</option>
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
          console.error('Course creation error:', err);
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
                <option value="Java">Java</option>
                <option value="Python">Python</option>
                <option value="C++">C++</option>
                <option value="C#">C#</option>
                <option value="JavaScript">JavaScript</option>
                <option value="PHP">PHP</option>
                <option value="C">C</option>
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
  console.log('✏️ Edit course:', courseId);
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
  console.log('📋 View outline:', courseId);
  
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
      if (!r.ok) { body.innerHTML = '<div class="empty-state">Failed to load outline</div>'; return null; }
      const text = await r.text();
      try {
        return JSON.parse(text);
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
        body.innerHTML = '<div class="empty-state">Failed to load outline</div>';
        return null;
      }
    })
    .then(res => {
      if (!res || !res.success) {
        const msg = res && res.message ? String(res.message) : '';
        console.warn('Outline load failed', { url, res });
        body.innerHTML = '<div class="empty-state">Failed to load outline</div>' + (msg ? '<div style="color:#6c757d;margin-top:6px;">' + msg + '</div>' : '');
        return;
      }
      renderOutline(res.data, body);
      initOutlineSortables(courseId, body);

      // Wire basic actions (delete/edit) similar to admin implementation
      const modulesWrap = body;
      // Use a single-click handler to avoid stacking multiple listeners across re-renders
      modulesWrap.onclick = function(e){
        const btn = e.target.closest('button');
        if (!btn) return;
        const act = btn.getAttribute('data-act');
        if (!act) return;

        // Helper to POST and refresh
        function postAndRefresh(endpoint, fd) {
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
          outlinePrompt({ title: 'Material type', label: 'Type', options: [
            {value:'pdf',label:'PDF'}, {value:'video',label:'Video'}, {value:'link',label:'Link'}, {value:'code',label:'Code'}, {value:'file',label:'General File'}
          ], value: 'pdf' }, function(val){
            type = (val||'link').toLowerCase();
            if (!type) return;

          if (type === 'file' || type === 'pdf' || type === 'video') {
            // Use a file picker and upload to backend
            const input = document.createElement('input');
            input.type = 'file';
            if (type === 'pdf') input.accept = '.pdf,application/pdf';
            else if (type === 'video') input.accept = 'video/*';
            input.onchange = function() {
              const file = input.files && input.files[0];
              if (!file) return;
              const fd = new FormData();
              fd.append('action','material_upload');
              fd.append('lesson_id', lessonId);
              fd.append('file', file);
              fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
                .then(r=>r.json())
                .then(()=> viewOutline(courseId))
                .catch(()=> { if (typeof window.showNotification === 'function') window.showNotification('error','Error','Upload failed'); });
            };
            input.click();
            return;
          }
          outlinePrompt({ title: 'Material URL', label: 'URL' }, function(value){
            if (value === null || value === undefined) return;
            const fd = new FormData();
            fd.append('action','material_create');
            fd.append('lesson_id', lessonId);
            fd.append('type', type);
            fd.append('url', value);
            postAndRefresh('course_outline_manage.php', fd);
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
          outlinePrompt({ title: 'Rename Lesson', label: 'Lesson title', value: current }, function(title){
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
        if (act === 'mat-edit') {
          const item = btn.closest('[data-mat-id]');
          const current = item ? (item.querySelector('span')?.textContent || '') : '';
          outlinePrompt({ title: 'Update material', label: 'URL or filename', value: current.replace(/^.*•\s*/,'').trim() }, function(value){
            if (value === null) return;
            const fd = new FormData();
            fd.append('action','material_update');
            fd.append('id', btn.getAttribute('data-id'));
            fd.append('url', value);
            postAndRefresh('course_outline_manage.php', fd);
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
          showCreateActivityForm(lessonId);
          return;
        }
        if (act === 'act-edit') {
          const item = btn.closest('[data-activity-id]');
          const current = item?.getAttribute('data-title') || '';
          const aType = (item?.getAttribute('data-type') || '').toLowerCase();
          const aId = btn.getAttribute('data-id');
          if (aType === 'multiple_choice') {
            openMcqEditor(aId);
            return;
          }
          outlinePrompt({ title: 'Edit activity', label: 'Title', value: current }, function(title){
            if (title === null) return;
            const fd = new FormData();
            fd.append('action','activity_update');
            fd.append('id', aId);
            fd.append('title', title);
            postAndRefresh('course_outline_manage.php', fd);
          });
          return;
        }
        if (act === 'act-test') {
          console.log('🔍 DEEP DEBUG - Test button clicked!');
          console.log('🔍 DEEP DEBUG - Button element:', btn);
          console.log('🔍 DEEP DEBUG - Button attributes:', {
            'data-id': btn.getAttribute('data-id'),
            'data-act': btn.getAttribute('data-act'),
            'id': btn.getAttribute('id'),
            'class': btn.getAttribute('class')
          });
          
          const activityId = btn.getAttribute('data-id');
          console.log('🔍 DEEP DEBUG - Activity ID:', activityId);
          
          const activityContainer = btn.closest('[data-activity-id]');
          console.log('🔍 DEEP DEBUG - Activity container:', activityContainer);
          console.log('🔍 DEEP DEBUG - Container attributes:', {
            'data-activity-id': activityContainer?.getAttribute('data-activity-id'),
            'data-title': activityContainer?.getAttribute('data-title'),
            'data-type': activityContainer?.getAttribute('data-type')
          });
          
          const activityType = activityContainer?.getAttribute('data-type') || 'lecture';
          const activityTitle = activityContainer?.getAttribute('data-title') || 'Activity';
          
          console.log('🔍 DEEP DEBUG - Final activity details:', { activityId, activityType, activityTitle });
          
          // Create the student test modal directly
          console.log('🔍 DEEP DEBUG - Creating student test modal directly');
          
          const testModal = document.createElement('div');
          console.log('🔍 DEEP DEBUG - Modal element created:', testModal);
          
          testModal.className = 'modal-overlay';
          console.log('🔍 DEEP DEBUG - Modal className set:', testModal.className);
          
          const modalHTML = `
            <div class="modal-card" style="max-width:800px;width:95%;max-height:90vh;display:flex;flex-direction:column;">
              <div style="padding:12px 14px;border-bottom:1px solid #e9ecef;display:flex;align-items:center;gap:8px;">
                <strong style="flex:1">📝 Student Test: ${activityTitle}</strong>
                <button class="action-btn btn-gray" id="testClose">Close</button>
              </div>
              <div id="testBody" style="padding:12px 14px;overflow:auto;flex:1"></div>
              <div style="padding:10px 14px;border-top:1px solid #e9ecef;display:flex;gap:8px;justify-content:flex-end;align-items:center;">
                <button class="action-btn btn-green" id="testSubmit">Submit Test</button>
              </div>
            </div>`;
          
          console.log('🔍 DEEP DEBUG - Modal HTML:', modalHTML);
          testModal.innerHTML = modalHTML;
          console.log('🔍 DEEP DEBUG - Modal innerHTML set');
          
          document.body.appendChild(testModal);
          console.log('🔍 DEEP DEBUG - Modal appended to body');
          
          // Add a simple visual indicator
          testModal.style.zIndex = '9999';
          testModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
          console.log('🔍 DEEP DEBUG - Modal styling applied');
          
          // Close button handler
          console.log('🔍 DEEP DEBUG - Setting up close button handler');
          const closeBtn = testModal.querySelector('#testClose');
          console.log('🔍 DEEP DEBUG - Close button found:', closeBtn);
          if (closeBtn) {
            closeBtn.onclick = function() {
              console.log('🔍 DEEP DEBUG - Close button clicked');
              testModal.remove();
            };
          } else {
            console.error('🔍 DEEP DEBUG - Close button not found!');
          }
          
          // Click outside to close
          console.log('🔍 DEEP DEBUG - Setting up click outside handler');
          testModal.addEventListener('click', function(e) {
            console.log('🔍 DEEP DEBUG - Modal clicked, target:', e.target);
            if (e.target === testModal) {
              console.log('🔍 DEEP DEBUG - Clicked outside modal, closing');
              testModal.remove();
            }
          });
          
          // Load activity data and show student interface
          console.log('🔍 DEEP DEBUG - Setting up test body');
          const testBody = testModal.querySelector('#testBody');
          console.log('🔍 DEEP DEBUG - Test body found:', testBody);
          if (testBody) {
            testBody.innerHTML = '<div style="text-align:center;padding:40px;"><div class="loading-spinner">Loading activity...</div></div>';
            console.log('🔍 DEEP DEBUG - Loading spinner set');
          } else {
            console.error('🔍 DEEP DEBUG - Test body not found!');
          }
          
          // Fetch activity data
          console.log('🔍 DEEP DEBUG - Creating FormData for activity fetch');
          const fd = new FormData();
          fd.append('action', 'activity_get');
          fd.append('id', activityId);
          console.log('🔍 DEEP DEBUG - FormData created with action=activity_get, id=' + activityId);
          
          console.log('🔍 DEEP DEBUG - Starting fetch request to course_outline_manage.php');
          fetch('course_outline_manage.php', { method: 'POST', body: fd, credentials: 'same-origin' })
            .then(r => {
              console.log('🔍 DEEP DEBUG - Fetch response received:', r);
              console.log('🔍 DEEP DEBUG - Response status:', r.status);
              console.log('🔍 DEEP DEBUG - Response ok:', r.ok);
              return r.json();
            })
            .then(data => {
              console.log('🔍 DEEP DEBUG - Activity data received:', data);
              console.log('🔍 DEEP DEBUG - Data success:', data?.success);
              console.log('🔍 DEEP DEBUG - Data data:', data?.data);
              
              if (data && data.success && data.data) {
                const activity = data.data;
                console.log('🔍 DEEP DEBUG - Activity object:', activity);
                console.log('🔍 DEEP DEBUG - Calling renderStudentTestInterface');
                
                const studentHTML = renderStudentTestInterface(activity, activityType);
                console.log('🔍 DEEP DEBUG - Student HTML generated:', studentHTML);
                
                if (testBody) {
                  testBody.innerHTML = studentHTML;
                  console.log('🔍 DEEP DEBUG - Student interface rendered');
                } else {
                  console.error('🔍 DEEP DEBUG - Test body not available for rendering!');
                }
                
                // Handle test submission
                console.log('🔍 DEEP DEBUG - Setting up submit button handler');
                const submitBtn = testModal.querySelector('#testSubmit');
                console.log('🔍 DEEP DEBUG - Submit button found:', submitBtn);
                if (submitBtn) {
                  submitBtn.onclick = function() {
                    console.log('🔍 DEEP DEBUG - Submit button clicked');
                    const results = collectStudentAnswers();
                    console.log('🔍 DEEP DEBUG - Student answers collected:', results);
                    showTestResults(results, activityTitle);
                    testModal.remove();
                  };
                } else {
                  console.error('🔍 DEEP DEBUG - Submit button not found!');
                }
              } else {
                console.log('🔍 DEEP DEBUG - Data fetch failed or no data');
                if (testBody) {
                  testBody.innerHTML = '<div style="padding:40px;text-align:center;color:#6c757d;">❌ Failed to load activity data</div>';
                }
              }
            })
            .catch(err => {
              console.error('🔍 DEEP DEBUG - Fetch error:', err);
              if (testBody) {
                testBody.innerHTML = '<div style="padding:40px;text-align:center;color:#dc3545;">❌ Error loading activity</div>';
              }
            });
          return;
        }
        if (act === 'act-run') {
          const activityId = btn.getAttribute('data-id');
          const fd = new FormData();
          fd.append('action','run_activity');
          fd.append('activity_id', activityId);
          fd.append('source', '#include <bits/stdc++.h>\nint main(){return 0;}');
          btn.disabled = true; btn.textContent = 'Running...';
          fetch('lesson_activity_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
            .then(r=>r.json())
            .then(()=> { btn.disabled=false; btn.textContent='Run'; })
            .catch(()=> { btn.disabled=false; btn.textContent='Run'; if (typeof window.showNotification === 'function') window.showNotification('error','Run failed','Network error'); });
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
  if (!Array.isArray(outline) || outline.length === 0) {
    mount.innerHTML = '<div class="empty-state">No modules yet</div>';
    return;
  }
  
  const renderModule = (m) => {
    const lessons = (m.lessons||[]).map(l => {
      const mats = (l.materials||[]).map(mat => `
        <div data-mat-id="${mat.id}" class="outline-material-item" style="display:flex;align-items:center;gap:6px;padding:6px 8px;border:1px dashed #ddd;border-radius:6px;margin:4px 0;">
          <span style="flex:1; font-size:12px; color:#555;">${mat.type.toUpperCase()} • ${mat.filename || mat.url || ''}</span>
          <button class="action-btn" data-act="mat-edit" data-id="${mat.id}" style="background:#6c757d;color:#fff;">Edit</button>
          <button class="action-btn delete-btn" data-act="mat-delete" data-id="${mat.id}">Delete</button>
        </div>`).join('');
      const activities = (l.activities||[]).map(a => `
        <div data-activity-id="${a.id}" data-title="${(a.title||'').replace(/"/g,'&quot;')}" data-type="${(a.type||'').toLowerCase()}" draggable="true" style="display:flex;align-items:center;gap:6px;padding:6px 8px;border:1px dotted #ccc;border-radius:6px;margin:4px 0;">
          <button class="action-btn" data-act="act-edit" data-id="${a.id}" style="flex:1;text-align:left;background:transparent;border:0;color:#212529;padding:0;cursor:pointer;font-size:12px;"><strong>${a.type.toUpperCase()}</strong>: ${a.title}</button>
          <button class="action-btn" data-act="act-test" data-id="${a.id}" style="background:#28a745;color:#fff;">Test</button>
          ${String(a.type||'').toLowerCase()==='coding' ? '<button class=\"action-btn\" data-act=\"act-run\" data-id=\"'+a.id+'\" style=\"background:#2196F3;color:#fff;\">Run</button>' : ''}
          <button class="action-btn" data-act="act-duplicate" data-id="${a.id}" style="background:#17a2b8;color:#fff;">Duplicate</button>
          <button class="action-btn" data-act="act-edit" data-id="${a.id}" style="background:#6c757d;color:#fff;">Edit</button>
          <button class="action-btn delete-btn" data-act="act-delete" data-id="${a.id}">Delete</button>
        </div>`).join('');
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
            <button class="action-btn icon btn-green" data-act="lesson-add"><i class="fas fa-plus"></i>Lesson</button>
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
  mount.querySelectorAll('[data-module-id]').forEach(function(mod){
    var header = mod.querySelector('.module-header');
    var content = mod.querySelector('.module-content');
    if (!header || !content) return;
    if (!header.querySelector('.module-toggle')) {
      var t = document.createElement('button');
      t.type = 'button'; t.className = 'module-toggle';
      t.style.marginRight = '8px'; t.style.background = 'transparent'; t.style.border = '0'; t.style.cursor = 'pointer';
      t.innerHTML = '<i class="fas fa-chevron-down"></i>';
      header.insertBefore(t, header.firstChild);
      t.onclick = function(ev){
        ev.preventDefault(); ev.stopPropagation();
        var isOpen = content.style.display !== 'none';
        content.style.display = isOpen ? 'none' : '';
        t.innerHTML = isOpen ? '<i class="fas fa-chevron-right"></i>' : '<i class="fas fa-chevron-down"></i>';
      };
    }
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
    console.error('Error in optimistic UI update:', e);
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
        console.log('✅ Status updated successfully, keeping optimistic UI');
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
    console.error('Error reverting status change:', e);
  }
}

// Archive course function
function archiveCourse(courseId, btnEl, ev) {
  console.log('📦 Archive course:', courseId);
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
  console.log('🗑️ Delete course:', courseId);
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
  console.log('⚙️ Initializing coordinator settings...');
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
    modal = document.createElement('div');
    modal.id = 'outlinePromptModal';
    modal.className = 'modal-overlay';
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
  
  // Add focus styles
  inputEl.addEventListener('focus', function() {
    this.style.borderColor = '#28a745';
    this.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
  });
  inputEl.addEventListener('blur', function() {
    this.style.borderColor = '#e1e5e9';
    this.style.boxShadow = 'none';
  });
  
  selectEl.addEventListener('focus', function() {
    this.style.borderColor = '#28a745';
    this.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
  });
  selectEl.addEventListener('blur', function() {
    this.style.borderColor = '#e1e5e9';
    this.style.boxShadow = 'none';
  });
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
  function cleanup(){
    okBtn.onclick = null; cancelBtn.onclick = null; inputEl.onkeydown = null;
  }
  okBtn.onclick = function(){ const v = (selectEl.style.display !== 'none') ? selectEl.value : inputEl.value.trim(); cleanup(); modal.style.display='none'; if (onSubmit) onSubmit(v); };
  cancelBtn.onclick = function(){ cleanup(); modal.style.display='none'; };
  inputEl.onkeydown = function(e){ if (e.key === 'Enter') { okBtn.click(); } };
  modal.style.display = 'flex';
  setTimeout(function(){ (selectEl.style.display !== 'none' ? selectEl : inputEl).focus(); }, 30);
}

// ===== Auto-bootstrap (defensive) =====
(function bootstrapCoordinator(){
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){
      try { if (typeof initCoordinatorTabs === 'function') initCoordinatorTabs(); } catch(e) { console.error(e); }
    });
  } else {
    try { if (typeof initCoordinatorTabs === 'function') initCoordinatorTabs(); } catch(e) { console.error(e); }
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
  fetch(url, { credentials:'same-origin' })
    .then(r=>r.json())
    .then(data=>{
      if (data.success && Array.isArray(data.data) && data.data.length) {
        list.innerHTML = `
          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>Type</th>
                <th>Lesson</th>
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
        list.innerHTML = '<div class="empty-state"><i class="fas fa-upload"></i>No materials found</div>';
      }
    })
    .catch(()=>{ list.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i>Failed to load</div>'; });
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
                <th>Lessons</th>
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
                <th>Lesson</th>
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
                  <option value="Java">Java</option>
                  <option value="Python">Python</option>
                  <option value="C++">C++</option>
                  <option value="C#">C#</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="PHP">PHP</option>
                  <option value="C">C</option>
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
          console.error('Content separation error:', err);
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

// ===== Bulk Create Lessons Modal (restored) =====
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
        const fd = new FormData();
        fd.append('action','bulk_lesson_create');
        fd.append('module_id', String(moduleId));
        fd.append('titles', JSON.stringify(titles));
        const btn = document.getElementById('bulkLessonSubmit');
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...'; }
        fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
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
      .then(r=>r.json())
      .then(function(data){
        if (!data || !data.success || !data.id){ alert('Failed to create activity'); return; }
        const actId = data.id;
        if (state.type==='questionnaire' && state.questions.length){
          const promises = [];
          state.questions.forEach(function(q){
            const f = new FormData(); f.append('action','question_create'); f.append('activity_id', String(actId)); f.append('question_text', q.text||'Question'); f.append('points','1');
            promises.push(
              fetch('course_outline_manage.php', { method:'POST', body: f, credentials:'same-origin' })
                .then(r=>r.json())
                .then(function(res){ if (res && res.id){
                  const qid = res.id;
                  if (q.type==='mcq'){
                    (q.choices||[]).forEach(function(c){ const fc = new FormData(); fc.append('action','choice_create'); fc.append('question_id', String(qid)); fc.append('choice_text', c.text||'Option'); if (c.correct) fc.append('is_correct','1'); promises.push(fetch('course_outline_manage.php', { method:'POST', body: fc, credentials:'same-origin' })); });
                  } else if (q.type==='ident') {
                    if (q.answer){ const fc = new FormData(); fc.append('action','choice_create'); fc.append('question_id', String(qid)); fc.append('choice_text', q.answer); fc.append('is_correct','1'); promises.push(fetch('course_outline_manage.php', { method:'POST', body: fc, credentials:'same-origin' })); }
                  } // essay: no choices
                }}));
          });
          Promise.all(promises).then(function(){ viewOutline(getCurrentCourseId()); modal.style.display='none'; });
        } else {
          viewOutline(getCurrentCourseId()); modal.style.display='none';
        }
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

// ===== Create Activity Open Form (all steps visible) =====
function showCreateActivityForm(lessonId){
  let modal = document.getElementById('createActivityForm');
  if (!modal){
    modal = document.createElement('div');
    modal.id = 'createActivityForm';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card" style="max-width:900px;width:95%;max-height:90vh;display:flex;flex-direction:column;">
        <div style="padding:12px 14px;border-bottom:1px solid #e9ecef;display:flex;align-items:center;gap:8px;">
          <strong style="flex:1">Create Activity</strong>
          <button class="action-btn btn-gray" id="cafClose">Close</button>
        </div>
        <div id="cafBody" style="padding:12px 14px;overflow:auto;flex:1"></div>
        <div style="padding:10px 14px;border-top:1px solid #e9ecef;display:flex;gap:8px;justify-content:flex-end;align-items:center;">
          <button class="action-btn btn-green" id="cafCreate">Create item</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e){ if (e.target===modal) modal.style.display='none'; });
    modal.querySelector('#cafClose').onclick=function(){ modal.style.display='none'; };
  }
  modal.style.display='flex';

  const state = { type:'coding', name:'', language:'', instructionsText:'', maxScore:100, questions:[], quizSettings:{attempts:1, timeLimit:0, shuffleQuestions:false, shuffleChoices:true} };
  const body = modal.querySelector('#cafBody');

  function render(){
    body.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr;gap:14px;">
        <div style="border:1px solid #e3e6ea;border-radius:8px;padding:12px;">
          <div style="font-weight:600;margin-bottom:8px;">Step 1 · Choose type</div>
          <div style="display:flex;gap:12px;">
            <label class="ca-radio-tile" style="flex:1;border:1px solid #e3e6ea;border-radius:8px;padding:10px;cursor:pointer;${state.type==='coding'?'outline:2px solid #1d9b3e;':''}">
              <input type="radio" name="cafType" value="coding" ${state.type==='coding'?'checked':''} />
              <div style="font-weight:600;">Console application</div>
              <div style="font-size:12px;color:#666;">Run-and-check coding activity.</div>
            </label>
            <label class="ca-radio-tile" style="flex:1;border:1px solid #e3e6ea;border-radius:8px;padding:10px;cursor:pointer;${state.type==='questionnaire'?'outline:2px solid #1d9b3e;':''}">
              <input type="radio" name="cafType" value="questionnaire" ${state.type==='questionnaire'?'checked':''} />
              <div style="font-weight:600;">Questionnaire</div>
              <div style="font-size:12px;color:#666;">Multiple choice / Identification / Essay.</div>
            </label>
          </div>
        </div>
        <div style="border:1px solid #e3e6ea;border-radius:8px;padding:12px;">
          <div style="font-weight:600;margin-bottom:8px;">Step 2 · Activity name</div>
          <input id="cafName" type="text" class="modal-input" placeholder="e.g., Coding Exercise or Quiz" />
        </div>
        <div style="border:1px solid #e3e6ea;border-radius:8px;padding:12px;">
          <div style="font-weight:600;margin-bottom:8px;">Instructions & Score</div>
          <textarea id="cafInstr" class="modal-input" rows="3" placeholder="Instructions (shown to students)"></textarea>
          <div style="margin-top:8px;display:flex;gap:12px;align-items:center;">
            <label style="font-size:12px;color:#666;">Max score</label>
            <input id="cafScore" type="number" class="modal-input" min="1" value="${state.maxScore}" style="max-width:140px;" />
          </div>
        </div>
        <div id="cafLangWrap" style="border:1px solid #e3e6ea;border-radius:8px;padding:12px;${state.type==='coding'?'':'display:none;'}">
          <div style="font-weight:600;margin-bottom:8px;">Step 3 · Language (optional)</div>
          <select id="cafLang" class="modal-input"><option value="">Select language</option><option>Java</option><option>Python</option><option>C++</option><option>C</option></select>
        </div>
        <div id="cafQWrap" style="border:1px solid #e3e6ea;border-radius:8px;padding:12px;${state.type==='questionnaire'?'':'display:none;'}">
          <div style="font-weight:600;margin-bottom:8px;">${state.type==='coding' ? 'Step 4 · Add questions' : 'Step 3 · Add questions'}</div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:10px;">
            <div style="min-width:180px;">
              <label style="display:block;font-size:12px;color:#666;margin-bottom:6px;">Attempts</label>
              <input id="cafAttempts" type="number" class="modal-input" min="1" value="${state.quizSettings.attempts}" />
            </div>
            <div style="min-width:180px;">
              <label style="display:block;font-size:12px;color:#666;margin-bottom:6px;">Time limit (minutes)</label>
              <input id="cafTimeLimit" type="number" class="modal-input" min="0" value="${state.quizSettings.timeLimit}" />
            </div>
            <div style="display:flex;gap:10px;align-items:center;min-width:300px;">
              <label style="display:flex;gap:6px;align-items:center;"><input id="cafShuffleQ" type="checkbox" ${state.quizSettings.shuffleQuestions?'checked':''} /> Shuffle questions</label>
              <label style="display:flex;gap:6px;align-items:center;"><input id="cafShuffleC" type="checkbox" ${state.quizSettings.shuffleChoices?'checked':''} /> Shuffle choices</label>
            </div>
          </div>
          <div id="cafQList"></div>
          <button class="action-btn btn-green" id="cafAddQ" style="margin-top:8px;">+ Add question</button>
        </div>
      </div>`;

    body.querySelectorAll('input[name="cafType"]').forEach(function(r){ r.onchange=function(){ state.type=this.value; render(); }; });
    body.querySelector('#cafName').oninput=function(){ state.name=this.value; };
    const lang = body.querySelector('#cafLang'); if (lang){ lang.onchange=function(){ state.language=this.value; }; }
    const instr = body.querySelector('#cafInstr'); if (instr){ instr.oninput=function(){ state.instructionsText=this.value; }; }
    const score = body.querySelector('#cafScore'); if (score){ score.oninput=function(){ const n=parseInt(this.value,10); if(!isNaN(n)&&n>0) state.maxScore=n; }; }

    // bind settings
    const att = body.querySelector('#cafAttempts'); if (att) att.oninput=function(){ const n=parseInt(this.value,10); if(!isNaN(n)&&n>0) state.quizSettings.attempts=n; };
    const tl = body.querySelector('#cafTimeLimit'); if (tl) tl.oninput=function(){ const n=parseInt(this.value,10); if(!isNaN(n)&&n>=0) state.quizSettings.timeLimit=n; };
    const shQ = body.querySelector('#cafShuffleQ'); if (shQ) shQ.onchange=function(){ state.quizSettings.shuffleQuestions=this.checked; };
    const shC = body.querySelector('#cafShuffleC'); if (shC) shC.onchange=function(){ state.quizSettings.shuffleChoices=this.checked; };

    // questions rendering
    const list = body.querySelector('#cafQList');
    const addQ = body.querySelector('#cafAddQ');
    if (addQ){ addQ.onclick=function(){ state.questions.push({type:'mcq', text:'', choices:[{text:'',correct:false}], answer:''}); render(); }; }
    if (list){
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
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:8px;">
            <input type="text" class="modal-input" data-role="qtags" placeholder="Tags (comma-separated)" value="${(q.tags||'').replace(/"/g,'&quot;')}" style="min-width:220px;" />
            <select class="modal-input" data-role="qdifficulty" style="min-width:160px;">
              <option value="easy" ${q.difficulty==='easy'?'selected':''}>Easy</option>
              <option value="medium" ${!q.difficulty||q.difficulty==='medium'?'selected':''}>Medium</option>
              <option value="hard" ${q.difficulty==='hard'?'selected':''}>Hard</option>
            </select>
          </div>
          <div data-role="mcq" style="${qType==='mcq'?'':'display:none;'}">
            ${(q.choices||[]).map(function(c,ci){
              return `<div data-ci="${ci}" style=\"display:flex;gap:6px;align-items:center;margin-bottom:6px;\">
                <input type=\"checkbox\" ${c.correct?'checked':''} />
                <input type=\"text\" class=\"modal-input\" placeholder=\"Option\" value=\"${(c.text||'').replace(/"/g,'&quot;')}\" style=\"flex:1;\" />
                <input type=\"text\" class=\"modal-input\" data-role=\"cfeedback\" placeholder=\"Feedback (optional)\" value=\"${(c.feedback||'').replace(/"/g,'&quot;')}\" style=\"flex:1;\" />
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

      list.querySelectorAll('[data-qi]').forEach(function(qEl){
        const qi = parseInt(qEl.getAttribute('data-qi'),10);
        const q = state.questions[qi];
        qEl.querySelector('input.modal-input').oninput=function(){ q.text=this.value; };
        qEl.querySelector('[data-role="qtype"]').onchange=function(){ q.type=this.value; if (q.type==='mcq' && !q.choices) q.choices=[{text:'',correct:false}]; render(); };
        const tagInput = qEl.querySelector('[data-role="qtags"]'); if (tagInput){ tagInput.oninput=function(){ q.tags=this.value; }; }
        const diffSel = qEl.querySelector('[data-role="qdifficulty"]'); if (diffSel){ diffSel.onchange=function(){ q.difficulty=this.value; }; }
        const mcqWrap = qEl.querySelector('[data-role="mcq"]');
        if (mcqWrap){
          mcqWrap.querySelectorAll('[data-ci]').forEach(function(cEl){
            const ci = parseInt(cEl.getAttribute('data-ci'),10); const c = q.choices[ci];
            cEl.querySelector('input[type="checkbox"]').onchange=function(){ c.correct=this.checked; };
            cEl.querySelector('input.modal-input').oninput=function(){ c.text=this.value; };
            const fb = cEl.querySelector('[data-role="cfeedback"]'); if (fb) fb.oninput=function(){ c.feedback=this.value; };
            cEl.querySelector('[data-act="delChoice"]').onclick=function(){ q.choices.splice(ci,1); render(); };
          });
          const addBtn = mcqWrap.querySelector('[data-act="addChoice"]'); if (addBtn) addBtn.onclick=function(){ q.choices.push({text:'',correct:false,feedback:''}); render(); };
        }
        const identInput = qEl.querySelector('[data-role="identAnswer"]'); if (identInput){ identInput.oninput=function(){ q.answer=this.value; }; }
        qEl.querySelector('[data-act="delQ"]').onclick=function(){ state.questions.splice(qi,1); render(); };
      });
    }
  }

  render();
  modal.querySelector('#cafCreate').onclick=function(){
    const fd = new FormData();
    fd.append('action','activity_create');
    fd.append('lesson_id', String(lessonId));
    fd.append('type', state.type==='coding' ? 'coding' : 'quiz');
    fd.append('title', state.name || (state.type==='coding'?'Coding Exercise':'Quiz'));
    fd.append('max_score', String(state.maxScore||100));
    // save instructions
    if (state.type==='questionnaire'){
      const meta = { instructions: state.instructionsText||'', settings: state.quizSettings, questionsMeta: state.questions.map(function(q){ return { tags:q.tags||'', difficulty:q.difficulty||'medium' }; }) };
      fd.append('instructions', JSON.stringify(meta));
    } else {
      fd.append('instructions', state.instructionsText||'');
    }
    fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
      .then(r=>r.json())
      .then(function(data){
        if (!data || !data.success || !data.id){ alert('Failed to create activity'); return; }
        const actId = data.id;
        if (state.type==='questionnaire' && state.questions.length){
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
                  }
                }}));
          });
          Promise.all(promises).then(function(){ viewOutline(getCurrentCourseId()); modal.style.display='none'; });
        } else { viewOutline(getCurrentCourseId()); modal.style.display='none'; }
      })
      .catch(function(){ alert('Network error'); });
  };
}
