// Current class type filter (default lecture)
let currentClassTypeFilter = localStorage.getItem('teacherClassType') || 'lecture';

function setClassTypeFilter(type) {
  currentClassTypeFilter = type === 'laboratory' ? 'laboratory' : 'lecture';
  localStorage.setItem('teacherClassType', currentClassTypeFilter);
  // Toggle tab styles
  const tabLecture = document.getElementById('tabLecture');
  const tabLaboratory = document.getElementById('tabLaboratory');
  if (tabLecture && tabLaboratory) {
    tabLecture.classList.toggle('active', currentClassTypeFilter === 'lecture');
    tabLaboratory.classList.toggle('active', currentClassTypeFilter === 'laboratory');
  }
  // Reload classes using the filter
  loadActiveClasses();
  return false;
}

// Teacher Dashboard Specific JavaScript
// This file only contains Teacher-specific functionality that doesn't conflict with shared system

// ===== MY CLASSES FUNCTIONALITY (PRESERVE) =====
// All My Classes related functions - DO NOT REMOVE

// Sidebar toggle functionality
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  if (sidebar && mainContent) {
    sidebar.classList.toggle('closed');
    mainContent.classList.toggle('full');
  }
}

// Section navigation
function showSection(sectionName, clickedElement = null) {
  console.log('🔄 Teacher Dashboard: Switching to section:', sectionName);
  
  // Close any open forms when switching sections
  closeForm();
  
  // Hide all sections using direct style manipulation
  const sections = document.querySelectorAll('.section-content');
  sections.forEach(section => {
    section.classList.remove('active');
    section.style.display = 'none'; // Force hide
    console.log(`  - Teacher Dashboard: Hidden ${section.id}`);
  });
  
  // Remove active class from all nav items
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => item.classList.remove('active'));
  
  // Show selected section using direct style manipulation
  const targetSection = document.getElementById(sectionName);
  if (targetSection) {
    targetSection.classList.add('active');
    targetSection.style.display = 'block'; // Force show
    console.log(`✅ Teacher Dashboard: Section activated ${sectionName}`);
  } else {
    console.error(`❌ Teacher Dashboard: Section not found ${sectionName}`);
  }
  
  // Add active class to clicked nav item
  if (clickedElement) {
    clickedElement.classList.add('active');
  }
}

// Drawer open/close
function openForm() {
  const overlay = document.getElementById('overlay');
  const createClassForm = document.getElementById('createClassForm');
  if (overlay && createClassForm) {
    overlay.classList.add('show');
    createClassForm.classList.add('show');
    // Generate or fetch a class code when opening the form
    try { generateOrFetchClassCode(); } catch (e) { console.warn('Code gen failed', e); }
  }
}

function closeForm() {
  const overlay = document.getElementById('overlay');
  const createClassForm = document.getElementById('createClassForm');
  if (overlay && createClassForm) {
    overlay.classList.remove('show');
    createClassForm.classList.remove('show');
  }
}

// Close form when clicking sidebar items
function closeFormOnSidebarClick() {
  const sidebarItems = document.querySelectorAll('.sidebar li');
  sidebarItems.forEach(item => {
    item.addEventListener('click', function() {
      // Close the form if it's open
      closeForm();
    });
  });
}

// Lesson/Topic builder
function removeTopic(btn) { 
  btn.parentElement?.remove(); 
}

function removeLesson(btn) { 
  btn.closest('.lesson')?.remove(); 
}

function toggleTopicInput(btn) {
  const wrapper = btn.closest('.lesson').querySelector('.input-wrapper');
  const input = wrapper.querySelector('input');
  if (wrapper.classList.contains('hidden')) {
    wrapper.classList.remove('hidden');
    input.focus();
    btn.textContent = '✔ Add topic';
  } else {
    if (input.value.trim() !== '') {
      const newTopic = document.createElement('div');
      newTopic.className = 'topic';
      newTopic.innerHTML = `
        <div class="drag-handle"><div></div><div></div><div></div><div></div></div>
        <div contenteditable="true" class="editable-topic"></div>
        <button class="icon-btn" onclick="removeTopic(this)"><i class="fas fa-trash"></i></button>
      `;
      newTopic.querySelector('.editable-topic').textContent = input.value.trim();
      btn.closest('.lesson').querySelector('.topics').appendChild(newTopic);
      input.value = '';
      wrapper.classList.add('hidden');
      btn.textContent = '+ Add topic';
      initSortableTopics();
    }
  }
}

function cancelTopicInput(btn) {
  const wrapper = btn.closest('.input-wrapper');
  wrapper.querySelector('input').value = '';
  wrapper.classList.add('hidden');
  const addBtn = btn.closest('.lesson').querySelector('.add-buttons button');
  if (addBtn) addBtn.textContent = '+ Add topic';
}

function showLessonInput() {
  document.getElementById('newLessonWrapper').classList.remove('hidden');
}

function cancelLesson() {
  document.getElementById('newLessonWrapper').classList.add('hidden');
  document.getElementById('newLessonName').value = '';
}

function confirmAddLesson() {
  const lessonName = document.getElementById('newLessonName').value.trim();
  if (lessonName === '') { 
    alert('Please enter lesson name'); 
    return; 
  }
  
  const lessonsContainer = document.getElementById('lessons');
  const newLesson = document.createElement('div');
  newLesson.className = 'lesson';
  newLesson.innerHTML = `
    <div class="lesson-header">
      <div class="drag-handle"><div></div><div></div><div></div><div></div></div>
      <div contenteditable="true" class="editable-lesson"></div>
      <button class="icon-btn" onclick="removeLesson(this)"><i class="fas fa-trash"></i></button>
    </div>
    <div class="topics"></div>
    <div class="input-wrapper hidden">
      <div class="new-topic-input" style="display:flex; gap:10px; align-items:center;">
        <input type="text" class="topic-input" placeholder="New topic name..." />
        <button class="icon-btn" onclick="cancelTopicInput(this)"><i class="fas fa-trash"></i></button>
      </div>
    </div>
    <div class="add-buttons">
      <button class="green-btn" onclick="toggleTopicInput(this)">+ Add topic</button>
    </div>
  `;
  
  newLesson.querySelector('.editable-lesson').textContent = lessonName;
  lessonsContainer.appendChild(newLesson);
  cancelLesson();
  initSortableLessons();
  initSortableTopics();
}

// Sortable initializers
function initSortableLessons() {
  const lessonsContainer = document.getElementById('lessons');
  if (!lessonsContainer) return;
  
  if (lessonsContainer.sortableInstance) {
    lessonsContainer.sortableInstance.destroy();
  }
  
  lessonsContainer.sortableInstance = new Sortable(lessonsContainer, {
    animation: 150,
    handle: '.drag-handle',
    ghostClass: 'sortable-ghost',
    filter: '.non-draggable'
  });
}

function initSortableTopics() {
  const topicContainers = document.querySelectorAll('.lesson .topics');
  topicContainers.forEach(container => {
    if (container.sortableInstance) {
      container.sortableInstance.destroy();
    }
    
    container.sortableInstance = new Sortable(container, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      filter: '.non-draggable'
    });
  });
}

// ===== TEACHER-SPECIFIC INITIALIZATION =====
// Only Teacher-specific setup that doesn't conflict with shared system

// Initialize Teacher-specific functionality
let isCreatingClass = false;
function initializeTeacherDashboard() {
  console.log('Teacher Dashboard initializing...');
  
  // Initialize My Classes functionality
  closeFormOnSidebarClick();
  
  // Set default section
  showSection('my-classes');
  
  // Load active classes on page load
  loadActiveClasses();
  
  // Initialize sortable functionality
  initSortableLessons();
  initSortableTopics();
  
  // Set up overlay click to close form
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.addEventListener('click', closeForm);
  }

  // Class code controls
  const toggle = document.getElementById('customizeCodeToggle');
  const codeInput = document.getElementById('classCodeInput');
  const regenBtn = document.getElementById('regenCodeBtn');
  const copyBtn = document.getElementById('copyCodeBtn');
  const createBtn = document.getElementById('createClassBtn');

  if (toggle && codeInput) {
    toggle.addEventListener('change', () => {
      const enable = !!toggle.checked;
      codeInput.disabled = !enable;
      if (!enable) {
        // regenerate to ensure a valid auto code when disabling custom
        generateOrFetchClassCode();
      }
    });
  }
  if (regenBtn) {
    regenBtn.addEventListener('click', () => generateOrFetchClassCode());
  }
  if (copyBtn && codeInput) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeInput.value || '');
        if (typeof window.showNotification === 'function') {
          window.showNotification('Class code copied to clipboard', 'success');
        }
      } catch (e) {
        if (typeof window.showNotification === 'function') {
          window.showNotification('Failed to copy code', 'error');
        }
      }
    });
  }
  if (createBtn) {
    // Avoid duplicate bindings when navigating with history push/pop
    createBtn.onclick = null;
    createBtn.addEventListener('click', onCreateClassClick);
  }
  
  // Load published courses for class creation
  loadPublishedCourses();
  
  // Connect Step 2 course selection to Step 4 and Step 5
  connectStep2ToStep4Step5();
  
  console.log('Teacher Dashboard initialized successfully');
}

// Load published courses for class creation
function loadPublishedCourses() {
  console.log('📚 Loading published courses for class creation...');
  
  const url = `teacher_courses_api.php?action=get_published_courses`;
  console.log('📚 Loading courses, URL:', url);
  
  fetch(url, {
    method: 'GET',
    credentials: 'same-origin'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('✅ Published courses loaded:', data.data);
      populateCourseSelect(data.data);
    } else {
      console.error('❌ Failed to load published courses:', data.message);
      populateCourseSelect([]);
    }
  })
  .catch(error => {
    console.error('❌ Network error loading published courses:', error);
    populateCourseSelect([]);
  });
}

// Populate course select dropdown
function populateCourseSelect(courses) {
  const courseOptions = document.getElementById('courseOptions');
  const courseSelectedText = document.getElementById('courseSelectedText');
  if (!courseOptions || !courseSelectedText) return;
  
  if (!courses || courses.length === 0) {
    courseSelectedText.textContent = 'No published courses available';
    courseOptions.innerHTML = '';
    return;
  }
  
  courseSelectedText.textContent = 'Select a course...';
  
  const optionsHTML = courses.map(course => `
    <div class="dropdown-option" data-value="${course.id}" onclick="selectCourse(${course.id}, '${course.title}', '${course.code}', '${course.description || ''}')">
      <div class="course-title">${course.title} (${course.code})</div>
      ${course.description ? `<div class="course-description">${course.description}</div>` : ''}
    </div>
  `).join('');
  
  courseOptions.innerHTML = optionsHTML;
}

// Toggle course dropdown
function toggleCourseDropdown() {
  const dropdown = document.getElementById('courseDropdown');
  const options = document.getElementById('courseOptions');
  const selected = dropdown.querySelector('.dropdown-selected');
  
  if (options.style.display === 'none') {
    options.style.display = 'block';
    selected.classList.add('open');
  } else {
    options.style.display = 'none';
    selected.classList.remove('open');
  }
}

// Select course from dropdown
function selectCourse(courseId, courseTitle, courseCode, courseDescription) {
  const courseSelect = document.getElementById('courseSelect');
  const courseSelectedText = document.getElementById('courseSelectedText');
  const courseOptions = document.getElementById('courseOptions');
  const dropdown = document.getElementById('courseDropdown');
  const selected = dropdown.querySelector('.dropdown-selected');
  
  // Update hidden input
  courseSelect.value = courseId;
  
  // Update displayed text
  courseSelectedText.textContent = `${courseTitle} (${courseCode})`;
  
  // Close dropdown
  courseOptions.style.display = 'none';
  selected.classList.remove('open');
  
  console.log('📋 Course selected in Step 2:', courseId, courseTitle);
  
  // Show Step 4 and Step 5
  showStep4AndStep5(courseId, courseTitle);
}

// Connect Step 2 course selection to Step 4 and Step 5
function connectStep2ToStep4Step5() {
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('courseDropdown');
    if (dropdown && !dropdown.contains(event.target)) {
      const options = document.getElementById('courseOptions');
      const selected = dropdown.querySelector('.dropdown-selected');
      options.style.display = 'none';
      selected.classList.remove('open');
    }
  });
}

// Show Step 4 and Step 5 with selected course
function showStep4AndStep5(courseId, courseTitle) {
  // Show the step boxes
  const step4Box = document.getElementById('step4Box');
  const step5Box = document.getElementById('step5Box');
  
  if (step4Box) step4Box.style.display = 'block';
  if (step5Box) step5Box.style.display = 'block';
  
  // Populate Step 4 with selected course
  populateStep4WithSelectedCourse(courseId, courseTitle);
  
  // Load course outline for Step 5
  loadCourseOutlineForStep5(courseId);
}

// Hide Step 4 and Step 5
function hideStep4AndStep5() {
  const step4Box = document.getElementById('step4Box');
  const step5Box = document.getElementById('step5Box');
  
  if (step4Box) step4Box.style.display = 'none';
  if (step5Box) step5Box.style.display = 'none';
}

// Populate Step 4 with selected course
function populateStep4WithSelectedCourse(courseId, courseTitle) {
  const courseSelection = document.getElementById('courseSelection');
  if (!courseSelection) return;
  
  courseSelection.innerHTML = `
    <label style="display: block; margin-bottom: 10px; cursor: pointer;">
      <input type="radio" name="step4course" value="${courseId}" checked />
      ${courseTitle}
      <a href="#" onclick="viewCourseOutline(${courseId}, '${courseTitle}'); return false;" 
         style="margin-left:10px; color:#1d9b3e;">View course outline</a>
    </label>
  `;
}

// Handle course selection change (now triggered from Step 2)
function onCourseSelectionChange(courseId, courseTitle) {
  console.log('📋 Course selected:', courseId, courseTitle);
  loadCourseOutlineForStep5(courseId);
}

// Load course outline for Step 5
function loadCourseOutlineForStep5(courseId) {
  console.log('📚 Loading course outline for Step 5:', courseId);
  
  fetch(`course_outline.php?course_id=${courseId}`, {
    method: 'GET',
          credentials: 'same-origin'
        })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
      console.log('✅ Course outline loaded for Step 5:', data.data);
      populateStep5Outline(data.data);
                    } else {
      console.error('❌ Failed to load course outline for Step 5:', data.message);
      populateStep5Outline([]);
            }
          })
          .catch(error => {
    console.error('❌ Network error loading course outline for Step 5:', error);
    populateStep5Outline([]);
  });
}

// Populate Step 5 with course outline
function populateStep5Outline(outline) {
  const lessonsContainer = document.getElementById('lessons');
  if (!lessonsContainer) return;
  
  if (!outline || outline.length === 0) {
    lessonsContainer.innerHTML = '<div class="empty-state">No modules found in this course</div>';
    return;
  }
  
  // Flatten modules and lessons for Step 5 display
  let allLessons = [];
  outline.forEach(module => {
    if (module.lessons && module.lessons.length > 0) {
      module.lessons.forEach(lesson => {
        allLessons.push({
          ...lesson,
          moduleTitle: module.title
        });
    });
    }
  });
  
  if (allLessons.length === 0) {
    lessonsContainer.innerHTML = '<div class="empty-state">No lessons found in this course</div>';
        return;
      }
      
  const lessonsHTML = allLessons.map((lesson, index) => `
    <div class="lesson" data-lesson-id="${lesson.id}">
      <div class="lesson-header">
        <div class="drag-handle"><div></div><div></div><div></div><div></div></div>
        <div contenteditable="true" class="editable-lesson">${lesson.title}</div>
        <button class="icon-btn" onclick="removeLesson(this)"><i class="fas fa-trash"></i></button>
      </div>
      <div class="topics">
        ${lesson.materials ? lesson.materials.map(material => `
          <div class="topic" data-material-id="${material.id}">
            <div class="drag-handle"><div></div><div></div><div></div><div></div></div>
            <div contenteditable="true" class="editable-topic">${material.type.toUpperCase()}: ${material.filename || material.url || 'Untitled'}</div>
            <button class="icon-btn" onclick="removeTopic(this)"><i class="fas fa-trash"></i></button>
          </div>
        `).join('') : ''}
      </div>
      <div class="input-wrapper hidden">
        <div class="new-topic-input" style="display:flex; gap:10px; align-items:center;">
          <input type="text" class="topic-input" placeholder="New topic name..." />
          <button class="icon-btn" onclick="cancelTopicInput(this)"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div class="add-buttons">
        <button class="green-btn" onclick="toggleTopicInput(this)">+ Add topic</button>
      </div>
    </div>
  `).join('');
  
  lessonsContainer.innerHTML = lessonsHTML;
}

// View course outline in modal
function viewCourseOutline(courseId, courseTitle) {
  console.log('📋 Opening course outline modal for:', courseId, courseTitle);
  
  // Create modal if it doesn't exist
  let modal = document.getElementById('courseOutlineModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'courseOutlineModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card" style="max-width: 800px; width: 95%; padding: 0;">
        <div class="modal-header" style="padding: 15px; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0;">Course Outline: ${courseTitle}</h3>
          <button onclick="closeCourseOutlineModal()" style="background: none; border: none; font-size: 20px; cursor: pointer;">&times;</button>
        </div>
        <div class="modal-body" style="padding: 15px; max-height: 60vh; overflow-y: auto;">
          <div id="courseOutlineContent">Loading...</div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  // Load and display course outline
  const content = modal.querySelector('#courseOutlineContent');
  content.innerHTML = 'Loading course outline...';
  modal.style.display = 'flex';
  
  fetch(`course_outline.php?course_id=${courseId}`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
        content.innerHTML = renderCourseOutlineHTML(data.data);
          } else {
        content.innerHTML = '<div class="error">Failed to load course outline</div>';
          }
        })
        .catch(error => {
      content.innerHTML = '<div class="error">Network error loading course outline</div>';
    });
}

// Close course outline modal
function closeCourseOutlineModal() {
  const modal = document.getElementById('courseOutlineModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Render course outline HTML
function renderCourseOutlineHTML(outline) {
  if (!outline || outline.length === 0) {
    return '<div class="empty-state">No modules found</div>';
  }
  
  return outline.map(module => `
    <div class="module" style="margin-bottom: 20px; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden;">
      <div class="module-header" style="background: #f8f9fa; padding: 12px; font-weight: bold;">
        <i class="fas fa-layer-group" style="margin-right: 8px; color: #6c757d;"></i>
        ${module.title}
      </div>
      <div class="module-content" style="padding: 12px;">
        ${module.lessons && module.lessons.length > 0 ? 
          module.lessons.map(lesson => `
            <div class="lesson" style="margin-bottom: 12px; padding: 8px; border-left: 3px solid #1d9b3e; background: #f8f9fa;">
              <div style="font-weight: 500; margin-bottom: 8px;">${lesson.title}</div>
              ${lesson.materials && lesson.materials.length > 0 ? `
                <div style="font-size: 12px; color: #6c757d; margin-bottom: 4px;">Materials:</div>
                <div style="margin-left: 12px;">
                  ${lesson.materials.map(material => `
                    <div style="font-size: 12px; color: #495057;">• ${material.type.toUpperCase()}: ${material.filename || material.url || 'Untitled'}</div>
                  `).join('')}
                </div>
              ` : ''}
		</div>
          `).join('') : 
          '<div style="color: #6c757d; font-style: italic;">No lessons</div>'
        }
      </div>
    </div>
  `).join('');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeTeacherDashboard();
});

// Make functions globally available
window.toggleSidebar = toggleSidebar;
window.showSection = showSection;
window.openForm = openForm;
window.closeForm = closeForm;
window.removeTopic = removeTopic;
window.removeLesson = removeLesson;
window.toggleTopicInput = toggleTopicInput;
window.cancelTopicInput = cancelTopicInput;
window.showLessonInput = showLessonInput;
window.cancelLesson = cancelLesson;
window.confirmAddLesson = confirmAddLesson;
window.onCourseSelectionChange = onCourseSelectionChange;
window.viewCourseOutline = viewCourseOutline;
window.closeCourseOutlineModal = closeCourseOutlineModal;
window.showStep4AndStep5 = showStep4AndStep5;
window.hideStep4AndStep5 = hideStep4AndStep5;
window.toggleCourseDropdown = toggleCourseDropdown;
window.selectCourse = selectCourse;

// ===== Class create helpers =====
function generateOrFetchClassCode() {
  const codeInput = document.getElementById('classCodeInput');
  if (!codeInput) return;
  // Prefer server generation to guarantee uniqueness
  fetch('class_manage.php?action=generate_code', { credentials: 'same-origin' })
    .then(r => r.json())
    .then(data => {
      if (data && data.success && data.code) {
        codeInput.value = data.code;
      } else {
        // Fallback local generation
        codeInput.value = localGenerateCode();
      }
    })
    .catch(() => { codeInput.value = localGenerateCode(); });
}

function localGenerateCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const length = 7;
  let out = 'CR-';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * alphabet.length);
    out += alphabet[idx];
  }
  return out;
}

function onCreateClassClick(event) {
  if (event) event.preventDefault();
  submitCreateClass();
}

function submitCreateClass() {
  if (isCreatingClass) { return; }
  const nameEl = document.getElementById('classNameInput');
  const courseEl = document.getElementById('courseSelect');
  const codeEl = document.getElementById('classCodeInput');
  const customize = document.getElementById('customizeCodeToggle');
  const name = nameEl ? nameEl.value.trim() : '';
  const courseId = courseEl && courseEl.value ? parseInt(courseEl.value, 10) : null;
  const code = (customize && customize.checked && codeEl) ? (codeEl.value || '').toUpperCase().trim() : (codeEl ? codeEl.value : '');
  if (!name) {
    alert('Please enter class name');
    return;
  }
  // lock and disable submit
  isCreatingClass = true;
  const createBtn = document.getElementById('createClassBtn');
  const originalBtnText = createBtn ? createBtn.textContent : '';
  if (createBtn) { createBtn.disabled = true; createBtn.textContent = 'Creating...'; }
  const payload = { action: 'create', name: name, course_id: courseId, code: customize && customize.checked ? code : '' };
  fetch('class_manage.php?action=create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(payload)
  }).then(r => r.json()).then(data => {
    if (data && data.success) {
      if (typeof window.showNotification === 'function') {
        window.showNotification('Class created. Code: ' + data.code, 'success');
      }
      closeForm();
      // Refresh Active Classes list
      loadActiveClasses();
    } else {
      if (typeof window.showNotification === 'function') {
        window.showNotification(data.message || 'Failed to create class', 'error');
      } else {
        alert(data.message || 'Failed to create class');
      }
    }
    // unlock
    isCreatingClass = false;
    if (createBtn) { createBtn.disabled = false; createBtn.textContent = originalBtnText || '✔ Create class'; }
  }).catch(() => {
    if (typeof window.showNotification === 'function') {
      window.showNotification('Network error creating class', 'error');
    }
    isCreatingClass = false;
    if (createBtn) { createBtn.disabled = false; createBtn.textContent = originalBtnText || '✔ Create class'; }
  });
}

// Load and display active classes
function loadActiveClasses() {
  const url = 'class_manage.php?action=list';
  fetch(url, {
    method: 'GET',
    credentials: 'same-origin'
  }).then(r => r.json()).then(data => {
    if (data && data.success) {
      const classes = data.classes || [];
      renderActiveClasses(classes);
    } else {
      console.error('Failed to load classes:', data.message);
    }
  }).catch(e => {
    console.error('Error loading classes:', e);
  });
}

// Render active classes in the UI
function renderActiveClasses(classes) {
  const activeClassesContainer = document.querySelector('.active-classes');
  if (!activeClassesContainer) return;

  // Find the classes grid container
  let classesGrid = activeClassesContainer.querySelector('.classes-grid');
  if (!classesGrid) return;

  // Clear existing class items
  classesGrid.innerHTML = '';

  // Add classes to the grid container
  if (classes.length === 0) {
    const noClassesMsg = document.createElement('div');
    noClassesMsg.className = 'no-classes';
    noClassesMsg.innerHTML = '<p>No active classes yet. Create your first class!</p>';
    classesGrid.appendChild(noClassesMsg);
  } else {
    classes.forEach(cls => {
      const classItem = document.createElement('div');
      classItem.className = 'class-item';
      
      // Determine status and progress
      const status = cls.status || 'active';
      const statusClass = status === 'active' ? 'status-active' : 
                         status === 'completed' ? 'status-completed' : 'status-pending';
      const statusText = status === 'active' ? 'ACTIVE' : 
                        status === 'completed' ? 'COMPLETED' : 'PENDING';
      
      // Format dates
      const createdDate = new Date(cls.created_at);
      const endDate = new Date(createdDate.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90 days later
      const dateRange = `${createdDate.toLocaleDateString('en-CA')} - ${endDate.toLocaleDateString('en-CA')}`;
      
      classItem.innerHTML = `
        <div class="class-header">
          <div class="class-title">${cls.name}</div>
          <span class="class-status ${statusClass}">${statusText}</span>
        </div>
        
        <div class="class-details">
          <div class="class-detail-item">
            <i class="fas fa-user class-detail-icon"></i>
            <span class="class-detail-text class-instructor">Prof. ${getCurrentUser().name || 'Current Teacher'}</span>
          </div>
          <div class="class-detail-item">
            <i class="fas fa-calendar class-detail-icon"></i>
            <span class="class-detail-text class-dates">${dateRange}</span>
          </div>
          <div class="class-detail-item">
            <i class="fas fa-list class-detail-icon"></i>
            <span class="class-detail-text">Lessons available</span>
          </div>
        </div>
        
        <div class="class-actions">
          <button class="btn btn-enter" onclick="enterClass('${cls.id}')">
            <i class="fas fa-play btn-icon"></i>
            Enter Class
          </button>
          <button class="btn btn-details" onclick="viewClassDetails('${cls.id}')">
            <i class="fas fa-info btn-icon"></i>
            Details
          </button>
        </div>
      `;
      classesGrid.appendChild(classItem);
    });

    // Append the Create Class tile as the last grid item
    const createTile = document.createElement('div');
    createTile.className = 'create-tile';
    createTile.innerHTML = '<i class="fas fa-plus"></i><span>Create Class</span>';
    createTile.addEventListener('click', () => openForm());
    classesGrid.appendChild(createTile);
  }
}

// On startup, activate correct tab
document.addEventListener('DOMContentLoaded', () => {
  setClassTypeFilter(currentClassTypeFilter);
});

// Helper function to get current user (you may need to adjust this)
function getCurrentUser() {
  // This is a placeholder - you might need to get this from your session or API
  return { name: 'Current Teacher' };
}

// Enter class (placeholder)
function enterClass(classId) {
  // Embed class dashboard inside My Classes via iframe
  const grid = document.querySelector('.classes-grid');
  const container = document.getElementById('classDetailContainer');
  const frame = document.getElementById('classDetailFrame');
  const sectionTitle = document.querySelector('#my-classes .section-title');
  const typeTabs = document.querySelector('.class-type-tabs');
  const headerH2 = document.querySelector('.active-classes-header');
  if (grid && container && frame) {
    grid.style.display = 'none';
    container.style.display = 'block';
    container.classList.add('full-bleed');
    frame.src = 'class_dashboard.php?id=' + encodeURIComponent(classId);
    if (sectionTitle) sectionTitle.style.display = 'none';
    if (typeTabs) typeTabs.style.display = 'none';
    if (headerH2) headerH2.style.display = 'none';
    history.pushState({ classId }, '', '?section=dashboard&class=' + classId);
  } else {
    // fallback full-page
    window.location.href = 'class_dashboard.php?id=' + encodeURIComponent(classId);
  }
}

// View class details (placeholder)
function viewClassDetails(classId) {
  console.log('View class details:', classId);
  // TODO: Implement class details modal
  if (typeof window.showNotification === 'function') {
    window.showNotification('Opening class details...', 'info');
  }
}

function exitEmbeddedClass() {
  const grid = document.querySelector('.classes-grid');
  const container = document.getElementById('classDetailContainer');
  const frame = document.getElementById('classDetailFrame');
  const sectionTitle = document.querySelector('#my-classes .section-title');
  const typeTabs = document.querySelector('.class-type-tabs');
  const headerH2 = document.querySelector('.active-classes-header');
  if (grid && container && frame) {
    frame.src = '';
    container.style.display = 'none';
    grid.style.display = 'grid';
    if (sectionTitle) sectionTitle.style.display = '';
    if (typeTabs) typeTabs.style.display = '';
    if (headerH2) headerH2.style.display = '';
    history.pushState({}, '', '?section=dashboard');
  }
}

window.addEventListener('popstate', () => {
  const params = new URLSearchParams(location.search);
  if (!params.get('class')) {
    exitEmbeddedClass();
  }
});

// Expose helpers
window.generateOrFetchClassCode = generateOrFetchClassCode;
window.submitCreateClass = submitCreateClass;
window.loadActiveClasses = loadActiveClasses;
window.enterClass = enterClass;
window.viewClassDetails = viewClassDetails;
window.exitEmbeddedClass = exitEmbeddedClass;