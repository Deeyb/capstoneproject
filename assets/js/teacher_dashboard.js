(function initTeacherDashboardMain(){
	function qs(sel, root){ return (root||document).querySelector(sel); }
	function qsa(sel, root){ return Array.from((root||document).querySelectorAll(sel)); }

	// ===== Moved from teacher_dashboard_init.js =====
	// Section switching
	window.showSection = function(sectionId, clickedEl){
		const sections = qsa('.section-content');
		sections.forEach(s => { s.style.display = 'none'; s.classList.remove('active'); });
		const target = qs('#' + sectionId);
		if (target) { target.style.display = 'block'; target.classList.add('active'); }
		// Sidebar active state
		qsa('.sidebar .nav-item').forEach(li => li.classList.remove('active'));
		if (clickedEl) { clickedEl.classList.add('active'); }
	};

	// Sidebar toggle (mobile)
	window.toggleSidebar = function(){
		const sb = qs('#sidebar');
		if (!sb) return;
		const cur = getComputedStyle(sb).display;
		sb.style.display = (cur === 'none') ? 'block' : 'none';
	};

	// Drawer open/close
	window.openForm = function(){
		const overlay = qs('#overlay');
		const form = qs('#createClassForm');
		if (overlay) overlay.classList.add('show');
		if (form) form.classList.add('show');
		if (form) {
			const input = qs('#classNameInput', form);
			if (input) setTimeout(function(){ input.focus(); }, 50);
			try { bindCreateClassControls(); } catch(_) {}
			const codeInput = qs('#classCodeInput', form);
			if (codeInput && !codeInput.value) {
				fetch('class_manage.php?action=generate_code', { credentials: 'same-origin' })
					.then(r => r.json()).then(d => { if (d && d.success) codeInput.value = d.code || ''; })
					.catch(function(){});
			}
		}
	};
	window.closeForm = function(){
		const overlay = qs('#overlay');
		const form = qs('#createClassForm');
		if (overlay) overlay.classList.remove('show');
		if (form) form.classList.remove('show');
	};

	// No lecture/lab separation anymore
	window.setClassTypeFilter = function(){ return; };

	// Ensure Create Class tile exists on empty state
	function ensureCreateTile(){
		var grid = qs('.classes-grid');
		if (!grid) return;
		var hasCreate = grid.querySelector('.create-tile');
		var hasAnyCard = grid.children && grid.children.length > 0;
		if (!hasCreate && !hasAnyCard) {
			var div = document.createElement('div');
			div.className = 'create-tile';
			div.innerHTML = '<span>+ Create Class</span>';
			div.addEventListener('click', function(){ if (typeof openForm === 'function') openForm(); });
			grid.appendChild(div);
		}
	}

	// Dark mode (defensive)
	(function(){
		function applySavedTheme(){
			var saved = localStorage.getItem('theme') || localStorage.getItem('adminTheme') || 'light';
			var isDark = saved === 'dark';
			document.body.classList.toggle('dark-mode', isDark);
			var toggle = qs('#themeToggle');
			if (toggle) {
				if (toggle.tagName === 'I') {
					if (isDark) { toggle.classList.remove('fa-moon'); toggle.classList.add('fa-sun'); }
					else { toggle.classList.remove('fa-sun'); toggle.classList.add('fa-moon'); }
				} else {
					var icon = toggle.querySelector('i');
					if (icon) {
						if (isDark) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
						else { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
					}
				}
			}
		}
		function bindThemeToggle(){
			var toggle = qs('#themeToggle');
			if (!toggle) return;
			toggle.addEventListener('click', function(e){
				e.preventDefault(); e.stopPropagation();
				document.body.classList.toggle('dark-mode');
				var isDark = document.body.classList.contains('dark-mode');
				if (this.tagName === 'I') {
					if (isDark) { this.classList.remove('fa-moon'); this.classList.add('fa-sun'); }
					else { this.classList.remove('fa-sun'); this.classList.add('fa-moon'); }
  } else {
					var icon = this.querySelector('i');
					if (icon) {
						if (isDark) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
						else { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
					}
				}
				try {
					localStorage.setItem('theme', isDark ? 'dark' : 'light');
					localStorage.setItem('adminTheme', isDark ? 'dark' : 'light');
				} catch(_) {}
			});
		}
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', function(){ applySavedTheme(); bindThemeToggle(); });
		} else { applySavedTheme(); bindThemeToggle(); }
	})();

	// ===== Existing Active Classes logic =====
	function renderCreateTile(grid){
		var tile = document.createElement('div');
		tile.className = 'create-tile';
		tile.innerHTML = '<span>+ Create Class</span>';
		tile.addEventListener('click', function(){ if (typeof openForm === 'function') openForm(); });
		grid.appendChild(tile);
	}

	function renderActiveClasses(classes){
		var grid = qs('.classes-grid');
		if (!grid) return;
		grid.innerHTML = '';
		if (!classes || classes.length === 0) {
			renderCreateTile(grid);
    return; 
  }
		// Optional: show Create tile first
		renderCreateTile(grid);
		classes.forEach(function(cls){
			var card = document.createElement('div');
			card.className = 'class-item';
			card.innerHTML = [
				'<div class="class-header">',
					'<h3 class="class-title">' + (cls.name || 'Untitled') + '</h3>',
					'<span class="class-status status-active">Active</span>',
				'</div>',
				'<div class="class-body">',
					'<div><strong>Code:</strong> ' + (cls.code || '') + '</div>',
					(cls.course_id ? ('<div><strong>Course ID:</strong> ' + cls.course_id + '</div>') : ''),
				'</div>'
			].join('');
			grid.appendChild(card);
		});
	}

	function loadActiveClasses(){
		var grid = qs('.classes-grid');
		if (grid) grid.innerHTML = '<div class="empty-state">Loading...</div>';
		fetch('class_manage.php?action=list', { credentials: 'same-origin' })
			.then(function(r){ return r.json(); })
			.then(function(d){
				if (d && d.success) {
					renderActiveClasses(d.classes || []);
				} else {
					if (grid) grid.innerHTML = '';
					renderActiveClasses([]);
				}
			})
			.catch(function(){
				if (grid) grid.innerHTML = '';
				renderActiveClasses([]);
			});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function(){
			loadActiveClasses();
			ensureCreateTile();
			bindCreateClassControls();
			loadPublishedCoursesForCreate();
		});
	} else {
  loadActiveClasses();
		ensureCreateTile();
		bindCreateClassControls();
		loadPublishedCoursesForCreate();
	}

	// Expose for manual refresh if needed
	window.__teacherLoadActive = loadActiveClasses;
})();

// ===== Create Class controls (moved) =====
function bindCreateClassControls(){
	var regenBtn = document.getElementById('regenCodeBtn');
	var copyBtn = document.getElementById('copyCodeBtn');
	var codeInput = document.getElementById('classCodeInput');
	var customizeToggle = document.getElementById('customizeCodeToggle');
	var createBtn = document.getElementById('createClassBtn');
	var nameInput = document.getElementById('classNameInput');
	var courseHidden = document.getElementById('courseSelect');

	if (regenBtn) {
		regenBtn.addEventListener('click', function(e){
			e.preventDefault();
			fetch('class_manage.php?action=generate_code', { credentials: 'same-origin' })
				.then(r => r.json())
				.then(d => { if (d && d.success && codeInput) { codeInput.value = d.code || ''; } });
		});
	}
	if (copyBtn) {
		copyBtn.addEventListener('click', function(e){
			e.preventDefault();
			if (!codeInput || !codeInput.value) return;
			navigator.clipboard && navigator.clipboard.writeText(codeInput.value).catch(function(){});
		});
	}
	if (customizeToggle && codeInput) {
		customizeToggle.addEventListener('change', function(){
			codeInput.disabled = !this.checked;
			if (!this.checked) { codeInput.value = codeInput.value || ''; }
    });
  }
  if (createBtn) {
		createBtn.addEventListener('click', function(e){
			e.preventDefault();
			var name = nameInput ? nameInput.value.trim() : '';
			var courseId = courseHidden && courseHidden.value ? parseInt(courseHidden.value, 10) : null;
			var useCustom = customizeToggle ? customizeToggle.checked : false;
			var code = (codeInput && useCustom) ? (codeInput.value || '').trim().toUpperCase() : null;
			if (!name) { alert('Please enter a class name.'); return; }
			var fd = new FormData();
			fd.append('action','create');
			fd.append('name', name);
			if (courseId !== null && !isNaN(courseId)) fd.append('course_id', String(courseId));
			if (code) fd.append('code', code);
			fetch('class_manage.php', { method:'POST', body: fd, credentials: 'same-origin' })
				.then(r => r.json())
				.then(d => {
					if (d && d.success) {
						if (typeof closeForm === 'function') closeForm();
						window.location.reload();
  } else {
						alert((d && d.message) || 'Failed to create class');
					}
				})
				.catch(function(){ alert('Network error.'); });
		});
	}
}

// ===== Step 2: Published courses dropdown =====
function loadPublishedCoursesForCreate(){
	var selectedText = document.getElementById('courseSelectedText');
	var options = document.getElementById('courseOptions');
	if (!selectedText || !options) return;
	selectedText.textContent = 'Loading courses...';
	fetch('teacher_courses_api.php?action=get_published_courses', { method:'GET', credentials:'same-origin' })
		.then(r => r.json())
		.then(d => {
			if (d && d.success && Array.isArray(d.data) && d.data.length) {
				populateCourseSelect(d.data);
    } else {
				selectedText.textContent = 'No published courses available';
				options.innerHTML = '';
			}
		})
		.catch(() => { selectedText.textContent = 'Failed to load courses'; options.innerHTML=''; });
}

function populateCourseSelect(courses){
	var options = document.getElementById('courseOptions');
	var selectedText = document.getElementById('courseSelectedText');
	if (!options || !selectedText) return;
	selectedText.textContent = 'Select a course...';
	options.innerHTML = courses.map(function(c){
		var desc = c.description ? ('<div class="course-description">' + c.description + '</div>') : '';
		return '<div class="dropdown-option" data-value="' + c.id + '" onclick="selectCourse(' + c.id + ', \'' + (c.title||'').replace(/'/g,"\\'") + '\', \'' + (c.code||'').replace(/'/g,"\\'") + '\')">' +
			'<div class="course-title">' + (c.title||'') + ' (' + (c.code||'') + ')</div>' + desc + '</div>';
	}).join('');
}

function toggleCourseDropdown(){
	var dropdown = document.getElementById('courseDropdown');
	var options = document.getElementById('courseOptions');
	if (!dropdown || !options) return;
	var selected = dropdown.querySelector('.dropdown-selected');
	if (options.style.display === 'none' || !options.style.display) {
		options.style.display = 'block'; if (selected) selected.classList.add('open');
  } else {
		options.style.display = 'none'; if (selected) selected.classList.remove('open');
	}
}

function selectCourse(courseId, courseTitle, courseCode){
	var courseSelect = document.getElementById('courseSelect');
	var selectedText = document.getElementById('courseSelectedText');
	var options = document.getElementById('courseOptions');
	var dropdown = document.getElementById('courseDropdown');
	if (courseSelect) courseSelect.value = String(courseId);
	if (selectedText) selectedText.textContent = courseTitle + ' (' + courseCode + ')';
	if (options) options.style.display = 'none';
	if (dropdown) { var sel = dropdown.querySelector('.dropdown-selected'); if (sel) sel.classList.remove('open'); }

	// Reveal Step 4 and 5 and populate
  showStep4AndStep5(courseId, courseTitle);
	loadCourseOutlineForStep5(courseId);
}

function showStep4AndStep5(courseId, courseTitle){
	var step4Box = document.getElementById('step4Box');
	var step5Box = document.getElementById('step5Box');
  if (step4Box) step4Box.style.display = 'block';
  if (step5Box) step5Box.style.display = 'block';
  populateStep4WithSelectedCourse(courseId, courseTitle);
}

function populateStep4WithSelectedCourse(courseId, courseTitle){
	var courseSelection = document.getElementById('courseSelection');
  if (!courseSelection) return;
    courseSelection.innerHTML = '<label style="display:block;margin-bottom:10px;cursor:pointer;">' +
        '<input type="radio" name="step4course" value="' + String(courseId) + '" checked /> ' +
        courseTitle +
        ' <a href="#" style="margin-left:10px;color:#1d9b3e;" onclick="openCourseOutlineModal(' + String(courseId) + ', \'' + (courseTitle||'').replace(/'/g,"\\'") + '\');return false;">View course outline</a>' +
        '</label>';
}

function loadCourseOutlineForStep5(courseId){
    var lessonsContainer = document.getElementById('lessons');
    if (lessonsContainer) lessonsContainer.innerHTML = '<div class="empty-state">Loading outline...</div>';
    var url = 'course_outline.php?course_id=' + encodeURIComponent(courseId);
    fetch(url, { credentials: 'same-origin' })
        .then(function(r){ return r.text(); })
        .then(function(t){
            try {
                var d = JSON.parse(t);
                if (d && d.success) {
                    populateStep5Outline(d.data || []);
                    // Try applying any saved draft for this course
                    try { loadStep5DraftAndApply(); } catch(_) {}
                    return;
                }
            } catch(e) {
                console.error('Outline JSON parse failed:', e, 'Raw:', t);
            }
    populateStep5Outline([]);
          })
        .catch(function(err){ console.error('Outline fetch error', err); populateStep5Outline([]); });
}

function populateStep5Outline(outline){
    var lessonsContainer = document.getElementById('lessons');
  if (!lessonsContainer) return;
    if (!outline || !outline.length) {
        lessonsContainer.innerHTML = '<div class="empty-state" style="text-align:center;padding:40px;color:#6b7280;">' +
            '<i class="fas fa-folder-plus" style="font-size:48px;margin-bottom:16px;color:#d1d5db;"></i>' +
            '<h3 style="margin:0 0 8px 0;color:#374151;">No modules found in this course</h3>' +
            '<p style="margin:0 0 20px 0;color:#6b7280;">Start by adding your first module</p>' +
            '<button class="green-btn" data-action="add-module" type="button" style="padding:10px 20px;font-size:14px;">' +
                '<i class="fas fa-plus" style="margin-right:8px;"></i>Add First Module' +
            '</button>' +
        '</div>';
        return;
    }
    // Organized, read-only overview: Modules → Lessons → Materials
    var html = outline.map(function(module){
        var lessons = Array.isArray(module.lessons) ? module.lessons : [];
        var lessonCount = lessons.length;
        var lessonsHtml = lessons.map(function(lesson){
            var materials = Array.isArray(lesson.materials) ? lesson.materials : [];
            var matCount = materials.length;
            var matsHtml = matCount ? (
                '<div style="margin-top:4px;margin-left:12px;">' +
                  '<div style="font-size:11px;color:#374151;font-weight:600;margin:2px 0 2px;">Materials ('+ matCount +')</div>' +
                  materials.map(function(m){
                      var label = (String(m.type||'').toUpperCase());
                      var name = (m.filename || m.url || 'Untitled');
                      return '<div style="font-size:11px;color:#495057;">• ' + label + ': ' + name + '</div>';
                  }).join('') +
                '</div>'
            ) : '<div style="font-size:11px;color:#6c757d;margin-left:12px;">No materials</div>';
            // Lesson card with topics container
            return '<div class="lesson" data-lesson-id="'+ (lesson.id||'') +'" style="margin-bottom:10px;padding:8px 10px;border-left:3px solid #1d9b3e;background:#f8f9fa;border-radius:6px;">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">' +
                    '<div style="display:flex;align-items:center;gap:8px;">' +
                      '<span class="drag-handle" title="Drag to reorder"><div></div><div></div><div></div><div></div></span>' +
                      '<div class="lesson-title" style="font-weight:600;">' + (lesson.title||'') + '</div>' +
                    '</div>' +
                    '<span style="font-size:11px;background:#e9f5ee;color:#137b30;border:1px solid #ccebd9;padding:1px 6px;border-radius:999px;">' + matCount + ' items</span>' +
                '</div>' +
                matsHtml +
                '<div class="topics" style="margin-top:6px;"></div>' +
            '</div>';
        }).join('');
        return '<div class="module" data-module-id="'+ (module.id||'') +'" style="margin-bottom:16px;border:1px solid #e9ecef;border-radius:8px;overflow:hidden;">' +
            '<div class="module-header" style="background:#f8f9fa;padding:10px;display:flex;justify-content:space-between;align-items:center;font-weight:700;">' +
                '<span style="display:flex;align-items:center;gap:8px;"><span class="drag-handle module-drag" title="Drag to reorder modules"><div></div><div></div><div></div><div></div></span>' + (module.title||'') + '</span>' +
                '<span style="font-size:11px;background:#eef2ff;color:#374151;border:1px solid #dbeafe;padding:1px 6px;border-radius:999px;">' + lessonCount + ' lessons</span>' +
            '</div>' +
            '<div class="module-content" style="padding:10px;">' +
                '<div class="module-lessons">' + lessonsHtml + '</div>' +
                '<div class="add-buttons">' +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');
    lessonsContainer.innerHTML = html;
    initStep5Sortables();
}

// ===== Step 5 interactions =====
// Toggle Step 5 minimize/expand functionality
window.toggleStep5 = function(){
    const step5Content = document.getElementById('step5Content');
    const toggleIcon = document.getElementById('step5ToggleIcon');
    
    if (!step5Content || !toggleIcon) return;
    
    const isVisible = step5Content.style.display !== 'none';
    
    if (isVisible) {
        step5Content.style.display = 'none';
        toggleIcon.style.transform = 'rotate(-90deg)';
        toggleIcon.classList.remove('fa-chevron-down');
        toggleIcon.classList.add('fa-chevron-right');
    } else {
        step5Content.style.display = 'block';
        toggleIcon.style.transform = 'rotate(0deg)';
        toggleIcon.classList.remove('fa-chevron-right');
        toggleIcon.classList.add('fa-chevron-down');
    }
};

function removeTopic(btn){ var el = btn && btn.parentElement; if (el) el.remove(); }
function removeLesson(btn){ var el = btn && btn.closest && btn.closest('.lesson'); if (el) el.remove(); }
function toggleTopicInput(btn){
	var lesson = btn && btn.closest && btn.closest('.lesson');
	if (!lesson) return;
	var wrapper = lesson.querySelector('.input-wrapper');
	var input = wrapper ? wrapper.querySelector('input') : null;
	if (!wrapper || !input) return;
  if (wrapper.classList.contains('hidden')) {
    wrapper.classList.remove('hidden');
    input.focus();
    btn.textContent = '✔ Add topic';
  } else {
		var val = (input.value || '').trim();
		if (!val) { wrapper.classList.add('hidden'); btn.textContent = '+ Add topic'; return; }
		var topic = document.createElement('div');
		topic.className = 'topic';
		topic.innerHTML = '<div class="drag-handle"><div></div><div></div><div></div><div></div></div>' +
			'<div contenteditable="true" class="editable-topic"></div>' +
			'<button class="icon-btn" onclick="removeTopic(this)"><i class="fas fa-trash"></i></button>';
		topic.querySelector('.editable-topic').textContent = val;
		(lesson.querySelector('.topics')||lesson).appendChild(topic);
      input.value = '';
      wrapper.classList.add('hidden');
      btn.textContent = '+ Add topic';
      initSortableTopics();
    }
  }
function cancelTopicInput(btn){ var w = btn && btn.closest && btn.closest('.input-wrapper'); if (!w) return; var i=w.querySelector('input'); if(i) i.value=''; w.classList.add('hidden'); var add= w.parentElement && w.parentElement.querySelector('.add-buttons button'); if(add) add.textContent = '+ Add topic'; }

function showLessonInput(){ var w = document.getElementById('newLessonWrapper'); if (w) w.classList.remove('hidden'); }
function cancelLesson(){ var w = document.getElementById('newLessonWrapper'); if (w) w.classList.add('hidden'); var i=document.getElementById('newLessonName'); if(i) i.value=''; }
function confirmAddLesson(){
	var nameEl = document.getElementById('newLessonName');
	var lessonsContainer = document.getElementById('lessons');
	if (!nameEl || !lessonsContainer) return;
	var title = (nameEl.value || '').trim();
	if (!title) { alert('Please enter lesson name'); return; }
	var div = document.createElement('div');
	div.className = 'lesson';
	div.innerHTML = '<div class="lesson-header">' +
		'<div class="drag-handle"><div></div><div></div><div></div><div></div></div>' +
		'<div contenteditable="true" class="editable-lesson"></div>' +
		'<button class="icon-btn" onclick="removeLesson(this)"><i class="fas fa-trash"></i></button>' +
		'</div>' +
		'<div class="topics"></div>' +
		'<div class="input-wrapper hidden">' +
		  '<div class="new-topic-input" style="display:flex; gap:10px; align-items:center;">' +
		    '<input type="text" class="topic-input" placeholder="New topic name..." />' +
		    '<button class="icon-btn" onclick="cancelTopicInput(this)"><i class="fas fa-trash"></i></button>' +
		  '</div>' +
		'</div>' +
		'<div class="add-buttons">' +
		  '<button class="green-btn" onclick="toggleTopicInput(this)">+ Add topic</button>' +
		'</div>';
	div.querySelector('.editable-lesson').textContent = title;
	lessonsContainer.appendChild(div);
  cancelLesson();
  initSortableLessons();
  initSortableTopics();
}

function initSortableLessons(){
	var container = document.getElementById('lessons');
	if (!container || typeof Sortable === 'undefined') return;
	if (container.sortableInstance) { container.sortableInstance.destroy(); }
	container.sortableInstance = new Sortable(container, { animation:150, handle:'.drag-handle', ghostClass:'sortable-ghost', filter:'.non-draggable' });
}
function initSortableTopics(){
	var containers = document.querySelectorAll('.lesson .topics');
	if (typeof Sortable === 'undefined') return;
	containers.forEach(function(c){
		if (c.sortableInstance) c.sortableInstance.destroy();
		c.sortableInstance = new Sortable(c, { animation:150, handle:'.drag-handle', ghostClass:'sortable-ghost', filter:'.non-draggable' });
	});
}

// Step 5: Sortables for module lessons and topics
function initStep5Sortables(){
    if (typeof Sortable === 'undefined') return;
    // Sort modules
    var modulesWrap = document.getElementById('lessons');
    if (modulesWrap) {
        if (modulesWrap.sortableInstance) modulesWrap.sortableInstance.destroy();
        modulesWrap.sortableInstance = new Sortable(modulesWrap, {
    animation: 150,
            handle: '.module-drag',
    ghostClass: 'sortable-ghost',
            filter: '.non-draggable',
            onEnd: function(){ try { saveStep5Draft(); } catch(_) {} }
        });
    }
    // Sort lessons within each module
    document.querySelectorAll('.module .module-lessons').forEach(function(list){
        if (list.sortableInstance) list.sortableInstance.destroy();
        list.sortableInstance = new Sortable(list, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
            onEnd: function(){ try { saveStep5Draft(); } catch(_) {} }
    });
  });
    // Sort topics inside lessons
  initSortableTopics();
}

// Step 5: Add handlers for add-lesson/add-topic buttons
document.addEventListener('click', function(e){
    var t = e.target;
    if (!t) return;
    if (t.getAttribute('data-action') === 'add-module') {
        showAddModuleModal();
    }
    if (t.getAttribute('data-action') === 'add-lesson') {
        var moduleEl = t.closest('.module');
        if (!moduleEl) return;
        showAddLessonModal(moduleEl);
    }
    if (t.getAttribute('data-action') === 'add-topic') {
        console.log('🔧 Add Topic button clicked!');
        var lessonEl = t.closest('.lesson');
        var moduleEl = t.closest('.module');
        console.log('🔧 Lesson found:', lessonEl);
        console.log('🔧 Module found:', moduleEl);
        if (lessonEl) {
            console.log('🔧 Opening topic modal for lesson');
            showAddTopicToLessonModal(lessonEl);
        } else if (moduleEl) {
            console.log('🔧 Opening topic modal for module');
            showAddTopicToModuleModal(moduleEl);
        }
    }
    if (t.getAttribute('data-action') === 'add-material') {
        console.log('🔧 Add Material button clicked!');
        var lessonEl = t.closest('.lesson');
        if (!lessonEl) {
            console.log('🔧 No lesson found!');
    return; 
  }
        console.log('🔧 Lesson found:', lessonEl);
        showCoordinatorMaterialModal(lessonEl);
    }
    if (t.getAttribute('data-action') === 'add-activity') {
        console.log('🔧 Add Activity button clicked!');
        var lessonEl = t.closest('.lesson');
        if (!lessonEl) {
            console.log('🔧 No lesson found!');
            return;
        }
        console.log('🔧 Lesson found:', lessonEl);
        showCoordinatorActivityModal(lessonEl);
    }
    if (t.getAttribute('data-action') === 'edit-module') {
        var moduleEl = t.closest('.module');
        if (!moduleEl) return;
        editModuleName(moduleEl);
    }
    if (t.getAttribute('data-action') === 'delete-module') {
        var moduleEl = t.closest('.module');
        if (!moduleEl) return;
        if (confirm('Are you sure you want to delete this module?')) {
            moduleEl.remove();
            try { saveStep5Draft(); } catch(_) {}
        }
    }
    if (t.getAttribute('data-action') === 'edit-lesson') {
        var lessonEl = t.closest('.lesson');
        if (!lessonEl) return;
        editLessonName(lessonEl);
    }
    if (t.getAttribute('data-action') === 'delete-lesson') {
        var lessonEl = t.closest('.lesson');
        if (!lessonEl) return;
        if (confirm('Are you sure you want to delete this lesson?')) {
            lessonEl.remove();
            try { saveStep5Draft(); } catch(_) {}
        }
    }
    if (t.getAttribute('data-action') === 'remove-topic') {
        var row = t.closest('.topic');
        if (row) row.remove();
        try { saveStep5Draft(); } catch(_) {}
    }
});

// ===== Step 5 draft save/load (per-course, local only) =====
function getCurrentCourseIdForStep5(){
    var hidden = document.getElementById('courseSelect');
    var v = hidden && hidden.value ? parseInt(hidden.value,10) : null;
    return (v && !isNaN(v)) ? v : null;
}

function saveStep5Draft(){
    var cid = getCurrentCourseIdForStep5();
    if (!cid) return;
    var modules = Array.prototype.map.call(document.querySelectorAll('#lessons > .module'), function(mod){
        var mid = mod.getAttribute('data-module-id') || null;
        var title = (mod.querySelector('.module-header span:not(.module-drag)') || {}).textContent || '';
        var lessons = Array.prototype.map.call(mod.querySelectorAll('.module-lessons > .lesson'), function(les){
            var lid = les.getAttribute('data-lesson-id') || null;
            var ltitleEl = les.querySelector('.lesson-title');
            var ltitle = ltitleEl ? ltitleEl.textContent.trim() : '';
            var topics = Array.prototype.map.call(les.querySelectorAll('.topics .editable-topic'), function(t){ return (t.textContent||'').trim(); });
            return { id: lid, title: ltitle, topics: topics };
        });
        return { id: mid, title: title, lessons: lessons };
    });
    var draft = { modules: modules, savedAt: Date.now() };
    try { localStorage.setItem('cr_step5_draft_course_'+cid, JSON.stringify(draft)); } catch(_) {}
}

function loadStep5DraftAndApply(){
    var cid = getCurrentCourseIdForStep5();
    if (!cid) return;
    var raw = null; try { raw = localStorage.getItem('cr_step5_draft_course_'+cid); } catch(_) {}
    if (!raw) return;
    var draft; try { draft = JSON.parse(raw); } catch(_) { return; }
    if (!draft || !Array.isArray(draft.modules)) return;
    // Reorder modules by draft order
    var wrap = document.getElementById('lessons'); if (!wrap) return;
    var byId = {}; Array.prototype.forEach.call(wrap.children, function(ch){ var id = ch.getAttribute && ch.getAttribute('data-module-id'); if (id) byId[id]=ch; });
    draft.modules.forEach(function(dm){ if (dm && dm.id && byId[dm.id]) wrap.appendChild(byId[dm.id]); });
    // Reorder lessons
    draft.modules.forEach(function(dm){
        if (!dm || !dm.id || !Array.isArray(dm.lessons)) return;
        var modEl = byId[dm.id]; if (!modEl) return;
        var list = modEl.querySelector('.module-lessons'); if (!list) return;
        var lById = {}; Array.prototype.forEach.call(list.children, function(ch){ var id = ch.getAttribute && ch.getAttribute('data-lesson-id'); if (id) lById[id]=ch; });
        dm.lessons.forEach(function(dl){ if (dl && dl.id && lById[dl.id]) list.appendChild(lById[dl.id]); });
    });
    initStep5Sortables();
}

// ===== Outline Modal (Step 4 link) =====
function ensureOutlineModal(){
    var modal = document.getElementById('courseOutlineModal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'courseOutlineModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = '<div class="modal-card" style="max-width:800px;width:95%;padding:0;">' +
        '<div class="modal-header" style="padding:15px;border-bottom:1px solid #e9ecef;display:flex;justify-content:space-between;align-items:center;">' +
        '<h3 id="outlineModalTitle" style="margin:0;">Course Outline</h3>' +
        '<button id="outlineModalClose" style="background:none;border:none;font-size:20px;cursor:pointer">&times;</button>' +
        '</div>' +
        '<div class="modal-body" style="padding:15px;max-height:60vh;overflow-y:auto;">' +
        '<div id="courseOutlineContent">Loading...</div>' +
        '</div>' +
        '</div>';
    document.body.appendChild(modal);
    var closeBtn = document.getElementById('outlineModalClose');
    if (closeBtn) closeBtn.onclick = function(){ modal.style.display = 'none'; };
    modal.addEventListener('click', function(e){ if (e.target === modal) modal.style.display = 'none'; });
    return modal;
}

function openCourseOutlineModal(courseId, courseTitle){
    var modal = ensureOutlineModal();
    var title = document.getElementById('outlineModalTitle');
    var content = document.getElementById('courseOutlineContent');
    if (title) title.textContent = 'Course Outline: ' + (courseTitle || '');
    if (content) content.textContent = 'Loading...';
  modal.style.display = 'flex';
    fetch('course_outline.php?course_id=' + encodeURIComponent(courseId), { credentials:'same-origin' })
        .then(function(r){ return r.text(); })
        .then(function(t){
            try {
                var data = JSON.parse(t);
                if (data && data.success) { content.innerHTML = renderCourseOutlineHTML(data.data); return; }
            } catch(e) {}
        content.innerHTML = '<div class="error">Failed to load course outline</div>';
        })
        .catch(function(){ content.innerHTML = '<div class="error">Network error loading course outline</div>'; });
}

function renderCourseOutlineHTML(outline){
    if (!Array.isArray(outline) || !outline.length) return '<div class="empty-state">No modules found</div>';
    return outline.map(function(module){
        var lessons = Array.isArray(module.lessons) && module.lessons.length ? module.lessons.map(function(lesson){
            var mats = Array.isArray(lesson.materials) && lesson.materials.length ? '<div style="margin-left:10px;">' +
                '<div style="font-size:11px;color:#374151;font-weight:600;margin:2px 0 2px;">Materials</div>' +
                lesson.materials.map(function(m){
                    return '<div style="font-size:11px;color:#495057;">• ' + String(m.type||'').toUpperCase() + ': ' + (m.filename || m.url || 'Untitled') + '</div>';
                }).join('') + '</div>' : '';
            return '<div class="lesson" style="margin-bottom:8px;padding:6px;border-left:3px solid #1d9b3e;background:#f8f9fa;">' +
                '<div style="font-weight:600;margin-bottom:6px;font-size:14px;">' + (lesson.title||'') + '</div>' +
                (mats || '<div style="color:#6c757d;font-style:italic;font-size:11px;">No materials</div>') +
            '</div>';
        }).join('') : '<div style="color:#6c757d;font-style:italic;font-size:12px;">No lessons</div>';
        return '<div class="module" style="margin-bottom:16px;border:1px solid #e9ecef;border-radius:8px;overflow:hidden;">' +
            '<div class="module-header" style="background:#f8f9fa;padding:10px;font-weight:700;">' + (module.title||'') + '</div>' +
            '<div class="module-content" style="padding:10px;">' + lessons + '</div>' +
        '</div>';
    }).join('');
}

// ===== Play Area bindings =====
(function initPlayArea(){
    function onClick(e){
        if (!e || !e.target) return;
        if (e.target.id === 'playTemplateBtn') { insertTemplate(); return; }
        if (e.target.id === 'playSaveBtn') { saveSnippet(); return; }
        if (e.target.id === 'playRecentSelect') { return; }
        if (e.target.id === 'playRecentSelect' && e.type === 'change') { loadSelectedSnippet(); return; }
        if (e.target.id !== 'playRunBtn') return;
        try {
            var src = document.getElementById('playSource');
            var langSel = document.getElementById('playLanguage');
            var out = document.getElementById('playOutput');
            // out may not exist after UI simplification; guard
            if (!src || !langSel) return;
            var language = langSel.value || 'cpp';
            var code = src.value || '';
            if (out) out.textContent = '';
            var term = ensureCodeRegalTerminal();
            term.body.textContent = '';
            term.modal.style.display = 'flex';
            if (!code.trim()) { term.body.textContent = 'Please write some code first.'; if (out) out.textContent='Please write some code first.'; return; }
            if (out) out.textContent = 'Running...';
            term.body.textContent = 'Running...';
            var fd = new FormData();
            fd.append('action','run_snippet');
            fd.append('language', language);
            fd.append('source', code);
            fd.append('stdin', '');
            function send(body){
                fetch('course_outline_manage.php', { method:'POST', credentials:'same-origin', body: body })
                  .then(function(r){ return r.text(); })
                  .then(function(t){
                      var d; try { d = JSON.parse(t); } catch(e) { d = { success:false, message:'Non-JSON response', raw:t }; }
                      return d;
                  })
                  .then(function(d){
                      var text = '';
                      if (d && d.success && d.results) {
                          try {
                              var res = Array.isArray(d.results) ? d.results : [d.results];
                              text = res.map(function(x){
                                  var inner = (x.data ? x.data : x) || {};
                                  var t = (inner.output || inner.stdout || inner.outputText || inner.result || '').toString();
                                  var err = (inner.stderr || inner.error || inner.cmpinfo || '').toString();
                                  return [t, err].filter(Boolean).join('\n');
                              }).join('\n');
                          } catch (e) { text = JSON.stringify(d.results || d, null, 2); }
    } else {
                          text = (d && d.message) ? ('Error: ' + d.message) : 'Run failed';
                          if (d && d.raw) { text += '\n' + String(d.raw); }
                      }
                      text = (text || '').trim();
                      if (out) out.textContent = text || '(no output)';
                      term.body.textContent = text || '(no output)';
                  })
                  .catch(function(err){ var t='Network error: ' + err; if (out) out.textContent=t; term.body.textContent=t; });
            }
            if (typeof window.getCSRFToken === 'function') {
                window.getCSRFToken().then(function(tok){ if (tok && !fd.has('csrf_token')) fd.append('csrf_token', tok); send(fd); }).catch(function(){ send(fd); });
            } else { send(fd); }
        } catch (err) {
            var term = ensureCodeRegalTerminal();
            term.modal.style.display = 'flex';
            term.body.textContent = 'Runtime error: ' + err;
        }
    }
    document.addEventListener('click', onClick);
    document.addEventListener('change', function(e){ if (e && e.target && e.target.id==='playRecentSelect') loadSelectedSnippet(); });
    // Keyboard shortcut: Ctrl/Cmd + Enter
    document.addEventListener('keydown', function(ev){
        var isEnter = (ev.key === 'Enter');
        var withCtrl = ev.ctrlKey || ev.metaKey;
        if (isEnter && withCtrl) {
            var runBtn = document.getElementById('playRunBtn');
            if (runBtn) runBtn.click();
            ev.preventDefault();
        }
        // Ctrl/Cmd + S to save
        if ((ev.key === 's' || ev.key === 'S') && (ev.ctrlKey || ev.metaKey)) {
            saveSnippet(); ev.preventDefault();
        }
    });
})();

function ensureCodeRegalTerminal(){
	var modal = document.getElementById('crTerminalModal');
  if (!modal) {
    modal = document.createElement('div');
		modal.id = 'crTerminalModal';
		modal.style.cssText = 'position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);z-index:4000;';
		modal.innerHTML = '<div style="width:90%;max-width:900px;background:#0b1220;color:#e5e7eb;border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.35);overflow:hidden;">' +
			'<div style="display:flex;align-items:center;justify-content:space-between;background:#0f172a;padding:10px 14px;border-bottom:1px solid #1f2937;">' +
			  '<div style="font-weight:700;">CodeRegal Terminal</div>' +
			  '<button id="crTermClose" style="background:#1f2937;color:#e5e7eb;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;">Close</button>' +
			'</div>' +
			'<pre id="crTermBody" style="margin:0;white-space:pre-wrap;padding:14px;min-height:220px;max-height:60vh;overflow:auto;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", monospace;"></pre>' +
		'</div>';
    document.body.appendChild(modal);
		modal.addEventListener('click', function(e){ if (e.target === modal) modal.style.display = 'none'; });
		var c = modal.querySelector('#crTermClose'); if (c) c.onclick = function(){ modal.style.display = 'none'; };
	}
	return { modal: modal, body: modal.querySelector('#crTermBody') };
}

function insertTemplate(){
    var langSel = document.getElementById('playLanguage');
    var src = document.getElementById('playSource');
    if (!langSel || !src) return;
    var lang = langSel.value || 'cpp';
    var code = '';
    if (lang === 'cpp') {
        code = '#include <iostream>\nusing namespace std;\nint main(){\n  cout << "Hello, World!" << endl;\n  return 0;\n}\n';
    } else if (lang === 'java') {
        code = 'public class Main {\n  public static void main(String[] args){\n    System.out.println("Hello, World!");\n  }\n}\n';
  } else {
        code = 'print("Hello, World!")\n';
    }
    src.value = code;
}

// Snippet persistence (localStorage)
function loadRecentSnippets(){
    try {
        var raw = localStorage.getItem('cr_play_snippets');
        var list = raw ? JSON.parse(raw) : [];
        var sel = document.getElementById('playRecentSelect');
        if (!sel) return;
        // reset options
        sel.innerHTML = '<option value="">Recent snippets…</option>' +
          list.map(function(s, i){ return '<option value="'+i+'">'+escapeHtml(s.title||('Snippet '+(i+1)))+' ('+ (s.lang||'') +')</option>'; }).join('');
    } catch(_) {}
}

function saveSnippet(){
    try {
        var langSel = document.getElementById('playLanguage');
        var src = document.getElementById('playSource');
        if (!langSel || !src) return;
        var title = prompt('Snippet title:', 'My snippet');
        if (title === null) return;
        var item = { title: (title||'Untitled'), lang: langSel.value||'', code: src.value||'' };
        var raw = localStorage.getItem('cr_play_snippets');
        var list = raw ? JSON.parse(raw) : [];
        list.unshift(item);
        list = list.slice(0, 10);
        localStorage.setItem('cr_play_snippets', JSON.stringify(list));
        loadRecentSnippets();
    } catch(_) {}
}

function loadSelectedSnippet(){
    try {
        var sel = document.getElementById('playRecentSelect');
        var idx = sel ? parseInt(sel.value,10) : -1;
        if (isNaN(idx) || idx < 0) return;
        var raw = localStorage.getItem('cr_play_snippets');
        var list = raw ? JSON.parse(raw) : [];
        var s = list[idx];
        if (!s) return;
        var langSel = document.getElementById('playLanguage');
        var src = document.getElementById('playSource');
        if (langSel) langSel.value = s.lang || langSel.value;
        if (src) src.value = s.code || '';
        sel.selectedIndex = 0;
    } catch(_) {}
}

function escapeHtml(str){ return String(str).replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]); }); }

// Dynamic Add Module Modal
function showAddModuleModal(){
    // Create modal
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:400px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<h3 style="margin:0 0 15px 0;color:#374151;font-weight:700;">Create New Module</h3>' +
        '<div style="margin-bottom:15px;">' +
            '<label style="display:block;margin-bottom:5px;color:#374151;font-weight:600;">Module Title</label>' +
            '<input type="text" id="moduleTitleInput" placeholder="e.g., Module 1 - Introduction to Programming" style="width:100%;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;transition:border-color 0.2s;" />' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
            '<button id="cancelModuleBtn" style="background:#6b7280;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;transition:background 0.2s;">Cancel</button>' +
            '<button id="createModuleBtn" style="background:#1d9b3e;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;transition:background 0.2s;">OK</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Focus on input
    var input = modal.querySelector('#moduleTitleInput');
    if (input) {
        input.focus();
        
        // Add focus effect
        input.addEventListener('focus', function(){
            this.style.borderColor = '#1d9b3e';
            this.style.boxShadow = '0 0 0 2px rgba(29, 155, 62, 0.2)';
        });
        
        input.addEventListener('blur', function(){
            this.style.borderColor = '#1d9b3e';
            this.style.boxShadow = 'none';
        });
    }
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelModuleBtn');
    var createBtn = modal.querySelector('#createModuleBtn');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(){
            modal.remove();
        });
        
        // Add hover effects
        cancelBtn.addEventListener('mouseenter', function(){
            this.style.background = '#4b5563';
        });
        cancelBtn.addEventListener('mouseleave', function(){
            this.style.background = '#6b7280';
        });
    }
    
    if (createBtn) {
        createBtn.addEventListener('click', function(){
            var title = input.value.trim();
            if (title) {
                createNewModule(title);
                modal.remove();
            } else {
                alert('Please enter a module title.');
            }
        });
        
        // Add hover effects
        createBtn.addEventListener('mouseenter', function(){
            this.style.background = '#16a34a';
        });
        createBtn.addEventListener('mouseleave', function(){
            this.style.background = '#1d9b3e';
        });
    }
    
    // Enter key support
    if (input) {
        input.addEventListener('keypress', function(e){
            if (e.key === 'Enter') {
                var title = input.value.trim();
                if (title) {
                    createNewModule(title);
                    modal.remove();
    } else {
                    alert('Please enter a module title.');
        }
      }
    });
  }

    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
      }
    });
  }

function createNewModule(title){
    var lessonsContainer = document.getElementById('lessons');
  if (!lessonsContainer) return;
  
    // Create new module with dynamic ID
    var moduleId = 'new_' + Date.now();
    var div = document.createElement('div');
    div.className = 'module';
    div.setAttribute('data-module-id', moduleId);
    div.innerHTML = '<div class="module-header" style="background:#f8f9fa;padding:12px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e5e7eb;">' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
            '<span class="drag-handle module-drag" title="Drag to reorder modules" style="color:#6b7280;cursor:grab;">' +
                '<i class="fas fa-chevron-down"></i>' +
            '</span>' +
            '<i class="fas fa-layer-group" style="color:#6b7280;font-size:16px;"></i>' +
            '<span style="font-weight:700;color:#374151;text-transform:uppercase;">' + escapeHtml(title) + '</span>' +
        '</div>' +
        '<div style="display:flex;gap:8px;">' +
            '<button class="topic-btn" data-action="add-topic" style="background:#1d9b3e;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;">' +
                '<i class="fas fa-plus"></i>Topic' +
            '</button>' +
            '<button class="edit-module-btn" data-action="edit-module" style="background:#6b7280;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;">' +
                '<i class="fas fa-pencil-alt"></i>Edit' +
            '</button>' +
            '<button class="delete-module-btn" data-action="delete-module" style="background:#ef4444;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;">' +
                '<i class="fas fa-trash"></i>Delete' +
            '</button>' +
        '</div>' +
    '</div>' +
    '<div class="module-content" style="padding:20px;text-align:center;">' +
        '<div style="color:#9ca3af;font-style:italic;font-size:14px;">No lessons</div>' +
    '</div>';
    
    // Add the new module to the container
    lessonsContainer.appendChild(div);
    
    // Initialize sortables for the new module
    initStep5Sortables();
    
    // Save the draft to localStorage
    try { saveStep5Draft(); } catch(_) {}
    
    // Show success message using native notification
    if (typeof showNotification === 'function') {
        showNotification('success', 'Success', 'Module "' + title + '" added successfully!');
    } else {
        // Fallback to alert if native notification not available
        alert('Module "' + title + '" added successfully!');
    }
    
    console.log('New module added:', title);
}

// Dynamic Add Lesson Modal
function showAddLessonModal(moduleEl){
    // Create modal
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:400px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<h3 style="margin:0 0 15px 0;color:#1d9b3e;font-weight:700;">Add New Lesson</h3>' +
        '<div style="margin-bottom:15px;">' +
            '<label style="display:block;margin-bottom:5px;color:#374151;font-weight:600;">Lesson title:</label>' +
            '<input type="text" id="lessonTitleInput" placeholder="Enter lesson title..." style="width:100%;padding:8px 12px;border:1px solid #1d9b3e;border-radius:6px;font-size:14px;outline:none;transition:border-color 0.2s;" />' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
            '<button id="cancelLessonBtn" style="background:#6b7280;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;transition:background 0.2s;">Cancel</button>' +
            '<button id="createLessonBtn" style="background:#1d9b3e;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;transition:background 0.2s;">Create Lesson</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Focus on input
    var input = modal.querySelector('#lessonTitleInput');
    if (input) {
        input.focus();
        
        // Add focus effect
        input.addEventListener('focus', function(){
            this.style.borderColor = '#1d9b3e';
            this.style.boxShadow = '0 0 0 2px rgba(29, 155, 62, 0.2)';
        });
        
        input.addEventListener('blur', function(){
            this.style.borderColor = '#1d9b3e';
            this.style.boxShadow = 'none';
        });
    }
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelLessonBtn');
    var createBtn = modal.querySelector('#createLessonBtn');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(){
            modal.remove();
        });
        
        // Add hover effects
        cancelBtn.addEventListener('mouseenter', function(){
            this.style.background = '#4b5563';
        });
        cancelBtn.addEventListener('mouseleave', function(){
            this.style.background = '#6b7280';
        });
    }
    
    if (createBtn) {
        createBtn.addEventListener('click', function(){
            var title = input.value.trim();
            if (title) {
                createNewLesson(moduleEl, title);
                modal.remove();
    } else {
                alert('Please enter a lesson title.');
            }
        });
        
        // Add hover effects
        createBtn.addEventListener('mouseenter', function(){
            this.style.background = '#16a34a';
        });
        createBtn.addEventListener('mouseleave', function(){
            this.style.background = '#1d9b3e';
        });
    }
    
    // Enter key support
    if (input) {
        input.addEventListener('keypress', function(e){
            if (e.key === 'Enter') {
                var title = input.value.trim();
                if (title) {
                    createNewLesson(moduleEl, title);
                    modal.remove();
  } else {
                    alert('Please enter a lesson title.');
        }
      }
    });
  }

    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function createNewLesson(moduleEl, title){
    var lessonsContainer = moduleEl.querySelector('.module-lessons');
  if (!lessonsContainer) return;
  
    // Create new lesson
    var div = document.createElement('div');
    div.className = 'lesson';
    div.setAttribute('data-lesson-id', 'new_' + Date.now());
    div.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
        '<div style="font-weight:600;color:#374151;">' + escapeHtml(title) + '</div>' +
        '<div style="display:flex;gap:8px;">' +
            '<button class="add-topic-btn" data-action="add-topic" style="background:#10b981;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Add topic">' +
                '<i class="fas fa-plus" style="font-size:12px;"></i>Topic' +
            '</button>' +
            '<button class="add-material-btn" data-action="add-material" style="background:#1d9b3e;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Add material">' +
                '<i class="fas fa-paperclip" style="font-size:12px;"></i>Material' +
            '</button>' +
            '<button class="add-activity-btn" data-action="add-activity" style="background:#1d9b3e;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Add activity">' +
                '<i class="fas fa-list" style="font-size:12px;"></i>Activity' +
            '</button>' +
            '<button class="edit-lesson-btn" data-action="edit-lesson" style="background:#6b7280;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Edit lesson">' +
                '<i class="fas fa-pencil-alt" style="font-size:12px;"></i>Edit' +
            '</button>' +
            '<button class="delete-lesson-btn" data-action="delete-lesson" style="background:#ef4444;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Delete lesson">' +
                '<i class="fas fa-trash" style="font-size:12px;"></i>Delete' +
            '</button>' +
        '</div>' +
    '</div>' +
    '<div style="margin-top:4px;margin-left:12px;">' +
        '<div style="font-size:11px;color:#6c757d;margin-left:12px;">No materials</div>' +
    '</div>';
    
    // Add the new lesson to the module
    lessonsContainer.appendChild(div);
    
    // Update lesson count in module header
    updateModuleLessonCount(moduleEl);
    
    // Initialize sortables
    initStep5Sortables();
    
    // Save the draft to localStorage
    try { saveStep5Draft(); } catch(_) {}
    
    // Show success message using native notification
    if (typeof showNotification === 'function') {
        showNotification('success', 'Success', 'Lesson "' + title + '" added successfully!');
    } else {
        alert('Lesson "' + title + '" added successfully!');
    }
    
    console.log('New lesson added:', title);
}

// Dynamic Add Topic Modal
function showAddTopicModal(moduleEl){
    var lessons = moduleEl.querySelectorAll('.module-lessons .lesson');
    if (!lessons || !lessons.length) {
        // Show native notification if no lessons
        if (typeof showNotification === 'function') {
            showNotification('warning', 'Warning', 'Add a lesson first before adding topics.');
                    } else {
            alert('Add a lesson first before adding topics.');
        }
    return;
  }
  
    // Create modal
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:500px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<h3 style="margin:0 0 15px 0;color:#1d9b3e;font-weight:700;">Select Lesson to Add Topic</h3>' +
        '<div style="max-height:300px;overflow-y:auto;">' +
            Array.from(lessons).map(function(el, idx){
                var titleEl = el.querySelector('div[style*="font-weight:600"]');
                var title = titleEl ? titleEl.textContent.trim() : ('Lesson ' + (idx+1));
                return '<div style="padding:10px;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:8px;cursor:pointer;transition:background 0.2s;" ' +
                       'onmouseover="this.style.background=\'#f3f4f6\'" onmouseout="this.style.background=\'white\'" ' +
                       'onclick="selectLessonForTopic(' + idx + ', \'' + escapeHtml(title) + '\')">' +
                    '<strong>' + (idx + 1) + '.</strong> ' + escapeHtml(title) +
                '</div>';
            }).join('') +
        '</div>' +
        '<div style="margin-top:15px;text-align:right;">' +
            '<button onclick="closeTopicModal()" style="background:#6b7280;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">Cancel</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Store reference for cleanup
    window.currentTopicModal = modal;
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Dynamic Add Topic to Lesson Modal
function showAddTopicToLessonModal(lessonEl){
    // Create modal
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:400px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<h3 style="margin:0 0 15px 0;color:#1d9b3e;font-weight:700;">Add New Topic</h3>' +
        '<div style="margin-bottom:15px;">' +
            '<label style="display:block;margin-bottom:5px;color:#374151;font-weight:600;">Topic title:</label>' +
            '<input type="text" id="topicTitleInput" placeholder="Enter topic title..." style="width:100%;padding:8px 12px;border:1px solid #1d9b3e;border-radius:6px;font-size:14px;outline:none;transition:border-color 0.2s;" />' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
            '<button id="cancelTopicBtn" style="background:#6b7280;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;transition:background 0.2s;">Cancel</button>' +
            '<button id="createTopicBtn" style="background:#1d9b3e;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;transition:background 0.2s;">Create Topic</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Focus on input
    var input = modal.querySelector('#topicTitleInput');
    if (input) {
        input.focus();
        
        // Add focus effect
        input.addEventListener('focus', function(){
            this.style.borderColor = '#1d9b3e';
            this.style.boxShadow = '0 0 0 2px rgba(29, 155, 62, 0.2)';
        });
        
        input.addEventListener('blur', function(){
            this.style.borderColor = '#1d9b3e';
            this.style.boxShadow = 'none';
        });
    }
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelTopicBtn');
    var createBtn = modal.querySelector('#createTopicBtn');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(){
            modal.remove();
        });
        
        // Add hover effects
        cancelBtn.addEventListener('mouseenter', function(){
            this.style.background = '#4b5563';
        });
        cancelBtn.addEventListener('mouseleave', function(){
            this.style.background = '#6b7280';
        });
    }
    
  if (createBtn) {
        createBtn.addEventListener('click', function(){
            var title = input.value.trim();
            if (title) {
                createNewTopic(lessonEl, title);
                modal.remove();
    } else {
                alert('Please enter a topic title.');
            }
        });
        
        // Add hover effects
        createBtn.addEventListener('mouseenter', function(){
            this.style.background = '#16a34a';
        });
        createBtn.addEventListener('mouseleave', function(){
            this.style.background = '#1d9b3e';
        });
    }
    
    // Enter key support
    if (input) {
        input.addEventListener('keypress', function(e){
            if (e.key === 'Enter') {
                var title = input.value.trim();
                if (title) {
                    createNewTopic(lessonEl, title);
                    modal.remove();
                    } else {
                    alert('Please enter a topic title.');
                }
            }
        });
    }
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function createNewTopic(lessonEl, title){
    console.log('🔧 Creating new topic:', title, 'for lesson:', lessonEl);
    
    var topicsContainer = lessonEl.querySelector('.topics');
    if (!topicsContainer) {
        console.log('🔧 Creating topics container');
        // Create topics container if it doesn't exist
        topicsContainer = document.createElement('div');
        topicsContainer.className = 'topics';
        topicsContainer.style.cssText = 'margin-top:8px;';
        lessonEl.appendChild(topicsContainer);
    }
    
    // Create new topic
    var topicItem = document.createElement('div');
    topicItem.className = 'topic-item';
    topicItem.setAttribute('data-topic-id', 'new_' + Date.now());
    topicItem.style.cssText = 'margin-bottom:12px;padding:12px;background:white;border:1px solid #e5e7eb;border-radius:6px;';
    
    topicItem.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
        '<div style="font-weight:600;color:#374151;font-size:16px;">' + escapeHtml(title) + '</div>' +
        '<div style="display:flex;gap:8px;">' +
            '<button class="add-material-btn" data-action="add-material" style="background:none;border:none;color:#1d9b3e;cursor:pointer;padding:4px;" title="Add material">' +
                '<i class="fas fa-paperclip" style="font-size:16px;"></i>' +
            '</button>' +
            '<button class="add-activity-btn" data-action="add-activity" style="background:none;border:none;color:#1d9b3e;cursor:pointer;padding:4px;" title="Add activity">' +
                '<i class="fas fa-tasks" style="font-size:16px;"></i>' +
            '</button>' +
            '<button class="edit-topic-btn" data-action="edit-topic" style="background:none;border:none;color:#6b7280;cursor:pointer;padding:4px;" title="Edit topic">' +
                '<i class="fas fa-pencil-alt" style="font-size:16px;"></i>' +
            '</button>' +
            '<button class="delete-topic-btn" data-action="delete-topic" style="background:none;border:none;color:#ef4444;cursor:pointer;padding:4px;" title="Delete topic">' +
                '<i class="fas fa-trash" style="font-size:16px;"></i>' +
            '</button>' +
        '</div>' +
    '</div>' +
    '<div style="margin-top:8px;padding:8px;background:#f8f9fa;border-radius:4px;border:1px solid #e5e7eb;">' +
        '<div style="margin-bottom:4px;">' +
            '<span style="font-weight:600;color:#374151;font-size:12px;">Materials:</span> ' +
            '<span style="color:#6b7280;font-style:italic;font-size:12px;">No materials</span>' +
        '</div>' +
        '<div>' +
            '<span style="font-weight:600;color:#374151;font-size:12px;">Activities:</span> ' +
            '<span style="color:#6b7280;font-style:italic;font-size:12px;">No activities</span>' +
        '</div>' +
    '</div>';
    
    topicsContainer.appendChild(topicItem);
    console.log('🔧 Topic created and appended:', topicItem);
    
    // Debug: Check if icons are visible
    var materialIcon = topicItem.querySelector('.fa-paperclip');
    var activityIcon = topicItem.querySelector('.fa-tasks');
    var editIcon = topicItem.querySelector('.fa-pencil-alt');
    var deleteIcon = topicItem.querySelector('.fa-trash');
    console.log('🔧 Material icon found:', !!materialIcon);
    console.log('🔧 Activity icon found:', !!activityIcon);
    console.log('🔧 Edit icon found:', !!editIcon);
    console.log('🔧 Delete icon found:', !!deleteIcon);
    
    // Add event listeners for all buttons
    var addMaterialBtn = topicItem.querySelector('.add-material-btn');
    var addActivityBtn = topicItem.querySelector('.add-activity-btn');
    var editBtn = topicItem.querySelector('.edit-topic-btn');
    var deleteBtn = topicItem.querySelector('.delete-topic-btn');
    
    if (addMaterialBtn) {
        addMaterialBtn.addEventListener('click', function(){
            console.log('🔧 Material button clicked for topic:', title);
            if (typeof showCoordinatorMaterialModal === 'function') {
                showCoordinatorMaterialModal(topicItem, title);
    } else {
                console.error('🔧 showCoordinatorMaterialModal function not found!');
                alert('Material functionality not available yet');
            }
        });
    }
    
    if (addActivityBtn) {
        addActivityBtn.addEventListener('click', function(){
            console.log('🔧 Activity button clicked for topic:', title);
            if (typeof showCoordinatorActivityModal === 'function') {
                showCoordinatorActivityModal(topicItem, title);
            } else {
                console.error('🔧 showCoordinatorActivityModal function not found!');
                alert('Activity functionality not available yet');
            }
        });
    }
    
    if (editBtn) {
        editBtn.addEventListener('click', function(){
            editTopicName(topicItem, title);
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function(){
            if (confirm('Are you sure you want to delete this topic?')) {
                topicItem.remove();
                // Update lesson item count after deletion
                updateLessonItemCount(lessonEl);
                try { saveStep5Draft(); } catch(_) {}
    }
  });
}

    // Update lesson item count
    updateLessonItemCount(lessonEl);
    
    // Initialize sortables for topics
    initStep5Sortables();
    
    // Save draft
    try { saveStep5Draft(); } catch(_) {}
    
    // Show success message using native notification
    if (typeof showNotification === 'function') {
        showNotification('success', 'Success', 'Topic "' + title + '" added successfully!');
  } else {
        alert('Topic "' + title + '" added successfully!');
    }
    
    console.log('New topic added:', title);
}

// Update module lesson count
function updateModuleLessonCount(moduleEl){
    var lessonsContainer = moduleEl.querySelector('.module-lessons');
    var lessonCount = lessonsContainer ? lessonsContainer.children.length : 0;
    var countBadge = moduleEl.querySelector('.module-header span[style*="background:#eef2ff"]');
    if (countBadge) {
        countBadge.textContent = lessonCount + ' lessons';
    }
}

// Update lesson item count
function updateLessonItemCount(lessonEl){
    var topicsContainer = lessonEl.querySelector('.topics');
    var topicCount = topicsContainer ? topicsContainer.children.length : 0;
    var countBadge = lessonEl.querySelector('span[style*="background:#e9f5ee"]');
    if (countBadge) {
        countBadge.textContent = topicCount + ' items';
    }
}

// Helper functions for topic management
window.selectLessonForTopic = function(lessonIndex, lessonTitle){
    closeTopicModal();
    
    // Find the lesson element from the current module
    var moduleEl = document.querySelector('.module');
    if (!moduleEl) {
        alert('No module found. Please add a module first.');
    return;
  }
  
    var lessons = moduleEl.querySelectorAll('.module-lessons .lesson');
    var lessonEl = lessons[lessonIndex];
    
    if (!lessonEl) {
        alert('Lesson not found. Please try again.');
    return;
  }
  
    // Find or create topics container
    var topicsContainer = lessonEl.querySelector('.topics');
    if (!topicsContainer) {
        // Create topics container if it doesn't exist
        topicsContainer = document.createElement('div');
        topicsContainer.className = 'topics';
        topicsContainer.style.cssText = 'margin-top:8px;';
        lessonEl.appendChild(topicsContainer);
    }
    
    // Show topic input interface
    showTopicInputInterface(topicsContainer, lessonTitle);
};

window.closeTopicModal = function(){
    if (window.currentTopicModal) {
        window.currentTopicModal.remove();
        window.currentTopicModal = null;
    }
};

function showTopicInputInterface(topicsContainer, lessonTitle){
    // Create topic input interface like in the picture
    var inputWrapper = document.createElement('div');
    inputWrapper.className = 'topic-input-wrapper';
    inputWrapper.style.cssText = 'margin-top:10px;padding:10px;background:#f8f9fa;border-radius:6px;border:1px solid #e5e7eb;';
    
    inputWrapper.innerHTML = '<div style="display:flex;align-items:center;gap:8px;">' +
        '<span class="drag-handle" style="color:#9ca3af;cursor:grab;"><i class="fas fa-grip-vertical"></i></span>' +
        '<input type="text" class="topic-name-input" placeholder="New topic name..." style="flex:1;padding:8px 12px;border:1px solid #d1d5db;border-radius:4px;font-size:14px;" />' +
        '<button class="add-topic-btn" style="background:#10b981;color:white;border:none;padding:8px 12px;border-radius:4px;cursor:pointer;font-size:12px;">Add</button>' +
        '<button class="cancel-topic-btn" style="background:#ef4444;color:white;border:none;padding:8px 12px;border-radius:4px;cursor:pointer;font-size:12px;">Cancel</button>' +
    '</div>';
    
    topicsContainer.appendChild(inputWrapper);
    
    // Focus on input
    var input = inputWrapper.querySelector('.topic-name-input');
    if (input) input.focus();
    
    // Add event listeners
    var addBtn = inputWrapper.querySelector('.add-topic-btn');
    var cancelBtn = inputWrapper.querySelector('.cancel-topic-btn');
    
    if (addBtn) {
        addBtn.addEventListener('click', function(){
            var topicName = input.value.trim();
            if (topicName) {
                addTopicToList(topicsContainer, topicName);
                inputWrapper.remove();
    }
  });
}

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(){
            inputWrapper.remove();
        });
    }
    
    // Add on Enter key
    if (input) {
        input.addEventListener('keypress', function(e){
            if (e.key === 'Enter') {
                var topicName = input.value.trim();
                if (topicName) {
                    addTopicToList(topicsContainer, topicName);
                    inputWrapper.remove();
                }
            }
        });
    }
}

function addTopicToList(topicsContainer, topicName){
    // Create topic item like in the picture
    var topicItem = document.createElement('div');
    topicItem.className = 'topic-item';
    topicItem.style.cssText = 'margin-bottom:12px;padding:12px;background:white;border:1px solid #e5e7eb;border-radius:6px;';
    
    topicItem.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
        '<div style="font-weight:600;color:#374151;font-size:16px;">' + escapeHtml(topicName) + '</div>' +
        '<div style="display:flex;gap:8px;">' +
            '<button class="add-material-btn" data-action="add-material" style="background:none;border:none;color:#1d9b3e;cursor:pointer;padding:4px;" title="Add material">' +
                '<i class="fas fa-paperclip" style="font-size:16px;"></i>' +
            '</button>' +
            '<button class="add-activity-btn" data-action="add-activity" style="background:none;border:none;color:#1d9b3e;cursor:pointer;padding:4px;" title="Add activity">' +
                '<i class="fas fa-tasks" style="font-size:16px;"></i>' +
            '</button>' +
            '<button class="edit-topic-btn" data-action="edit-topic" style="background:none;border:none;color:#6b7280;cursor:pointer;padding:4px;" title="Edit topic">' +
                '<i class="fas fa-pencil-alt" style="font-size:16px;"></i>' +
            '</button>' +
            '<button class="delete-topic-btn" data-action="delete-topic" style="background:none;border:none;color:#ef4444;cursor:pointer;padding:4px;" title="Delete topic">' +
                '<i class="fas fa-trash" style="font-size:16px;"></i>' +
            '</button>' +
        '</div>' +
    '</div>' +
    '<div style="margin-top:8px;padding:8px;background:#f8f9fa;border-radius:4px;border:1px solid #e5e7eb;">' +
        '<div style="margin-bottom:4px;">' +
            '<span style="font-weight:600;color:#374151;font-size:12px;">Materials:</span> ' +
            '<span style="color:#6b7280;font-style:italic;font-size:12px;">No materials</span>' +
        '</div>' +
        '<div>' +
            '<span style="font-weight:600;color:#374151;font-size:12px;">Activities:</span> ' +
            '<span style="color:#6b7280;font-style:italic;font-size:12px;">No activities</span>' +
        '</div>' +
    '</div>';
    
    topicsContainer.appendChild(topicItem);
    
    // Add event listeners for all buttons
    var addMaterialBtn = topicItem.querySelector('.add-material-btn');
    var addActivityBtn = topicItem.querySelector('.add-activity-btn');
    var editBtn = topicItem.querySelector('.edit-topic-btn');
    var deleteBtn = topicItem.querySelector('.delete-topic-btn');
    
    if (addMaterialBtn) {
        addMaterialBtn.addEventListener('click', function(){
            console.log('🔧 Material button clicked for topic:', topicName);
            if (typeof showCoordinatorMaterialModal === 'function') {
                showCoordinatorMaterialModal(topicItem, topicName);
  } else {
                console.error('🔧 showCoordinatorMaterialModal function not found!');
                alert('Material functionality not available yet');
            }
        });
    }
    
    if (addActivityBtn) {
        addActivityBtn.addEventListener('click', function(){
            console.log('🔧 Activity button clicked for topic:', topicName);
            if (typeof showCoordinatorActivityModal === 'function') {
                showCoordinatorActivityModal(topicItem, topicName);
            } else {
                console.error('🔧 showCoordinatorActivityModal function not found!');
                alert('Activity functionality not available yet');
            }
        });
    }
    
    if (editBtn) {
        editBtn.addEventListener('click', function(){
            editTopicName(topicItem, topicName);
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function(){
            if (confirm('Are you sure you want to delete this topic?')) {
                topicItem.remove();
                try { saveStep5Draft(); } catch(_) {}
            }
        });
    }
    
    // Initialize sortables for topics
    initStep5Sortables();
    
    // Save draft
    try { saveStep5Draft(); } catch(_) {}
}

function editTopicName(topicItem, currentName){
    var topicNameSpan = topicItem.querySelector('.topic-name');
    var editBtn = topicItem.querySelector('.edit-topic-btn');
    
    // Create input field
    var input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.style.cssText = 'flex:1;padding:4px 8px;border:1px solid #d1d5db;border-radius:4px;font-size:14px;';
    
    // Replace span with input
    topicNameSpan.style.display = 'none';
    topicNameSpan.parentNode.insertBefore(input, topicNameSpan);
    
    // Focus and select
    input.focus();
    input.select();
    
    // Handle save/cancel
    function saveEdit(){
        var newName = input.value.trim();
        if (newName && newName !== currentName) {
            topicNameSpan.textContent = newName;
        }
        input.remove();
        topicNameSpan.style.display = 'block';
        try { saveStep5Draft(); } catch(_) {}
    }
    
    function cancelEdit(){
        input.remove();
        topicNameSpan.style.display = 'block';
    }
    
    input.addEventListener('keypress', function(e){
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    });
    
    input.addEventListener('blur', saveEdit);
}

// Add Material Modal for Topics (Integrated with Coordinator System)
function showAddMaterialModal(topicItem, topicTitle){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:500px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<h3 style="margin:0 0 15px 0;color:#1d9b3e;font-weight:700;">Add Material to "' + escapeHtml(topicTitle) + '"</h3>' +
        '<div style="margin-bottom:15px;">' +
            '<label style="display:block;margin-bottom:5px;color:#374151;font-weight:600;">Material type:</label>' +
            '<select id="materialTypeSelect" style="width:100%;padding:8px 12px;border:1px solid #1d9b3e;border-radius:6px;font-size:14px;outline:none;">' +
                '<option value="pdf">PDF Document</option>' +
                '<option value="video">Video</option>' +
                '<option value="link">External Link</option>' +
                '<option value="code">Code File</option>' +
                '<option value="file">General File</option>' +
                '<option value="page">Page Content</option>' +
            '</select>' +
        '</div>' +
        '<div id="materialUrlSection" style="margin-bottom:15px;display:none;">' +
            '<label style="display:block;margin-bottom:5px;color:#374151;font-weight:600;">URL:</label>' +
            '<input type="url" id="materialUrlInput" placeholder="https://example.com" style="width:100%;padding:8px 12px;border:1px solid #1d9b3e;border-radius:6px;font-size:14px;outline:none;" />' +
        '</div>' +
        '<div id="materialFileSection" style="margin-bottom:15px;display:none;">' +
            '<label style="display:block;margin-bottom:5px;color:#374151;font-weight:600;">Select file:</label>' +
            '<input type="file" id="materialFileInput" style="width:100%;padding:8px 12px;border:1px solid #1d9b3e;border-radius:6px;font-size:14px;" />' +
        '</div>' +
        '<div style="margin-bottom:15px;">' +
            '<label style="display:block;margin-bottom:5px;color:#374151;font-weight:600;">Material title:</label>' +
            '<input type="text" id="materialTitleInput" placeholder="Enter material title..." style="width:100%;padding:8px 12px;border:1px solid #1d9b3e;border-radius:6px;font-size:14px;outline:none;" />' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
            '<button id="cancelMaterialBtn" style="background:#6b7280;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">Cancel</button>' +
            '<button id="addMaterialBtn" style="background:#1d9b3e;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">Add Material</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Show/hide sections based on material type
    var typeSelect = modal.querySelector('#materialTypeSelect');
    var urlSection = modal.querySelector('#materialUrlSection');
    var fileSection = modal.querySelector('#materialFileSection');
    
    function updateSections(){
        var type = typeSelect.value;
        if (type === 'link') {
            urlSection.style.display = 'block';
            fileSection.style.display = 'none';
        } else if (['pdf', 'video', 'code', 'file'].includes(type)) {
            urlSection.style.display = 'none';
            fileSection.style.display = 'block';
            // Set file input accept attribute
            var fileInput = modal.querySelector('#materialFileInput');
            if (type === 'pdf') fileInput.accept = '.pdf,application/pdf';
            else if (type === 'video') fileInput.accept = 'video/*';
            else if (type === 'code') fileInput.accept = '.js,.py,.java,.cpp,.c,.html,.css,.php,.sql,.json,.xml';
            else fileInput.accept = '*/*';
  } else {
            urlSection.style.display = 'none';
            fileSection.style.display = 'none';
        }
    }
    
    typeSelect.addEventListener('change', updateSections);
    updateSections(); // Initial call
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelMaterialBtn');
    var addBtn = modal.querySelector('#addMaterialBtn');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(){
            modal.remove();
        });
    }
    
    if (addBtn) {
        addBtn.addEventListener('click', function(){
            var type = typeSelect.value;
            var title = modal.querySelector('#materialTitleInput').value.trim();
            var url = modal.querySelector('#materialUrlInput').value.trim();
            var file = modal.querySelector('#materialFileInput').files[0];
            
            if (!title) {
                alert('Please enter a material title.');
    return;
  }
  
            if (type === 'link' && !url) {
                alert('Please enter a URL for the link.');
                return;
            }
            
            if (['pdf', 'video', 'code', 'file'].includes(type) && !file) {
                alert('Please select a file.');
                return;
            }
            
            // Store material data in topic for now (will integrate with coordinator API later)
            addMaterialToTopic(topicItem, type, title, url, file);
            modal.remove();
        });
    }
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
    }
  });
}

// Add Activity Modal for Topics (Integrated with Coordinator System)
function showAddActivityModal(topicItem, topicTitle){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:600px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<h3 style="margin:0 0 15px 0;color:#1d9b3e;font-weight:700;">Add Activity to "' + escapeHtml(topicTitle) + '"</h3>' +
        '<div style="margin-bottom:15px;">' +
            '<label style="display:block;margin-bottom:5px;color:#374151;font-weight:600;">Activity type:</label>' +
            '<select id="activityTypeSelect" style="width:100%;padding:8px 12px;border:1px solid #1d9b3e;border-radius:6px;font-size:14px;outline:none;">' +
                '<option value="multiple_choice">Multiple Choice Quiz</option>' +
                '<option value="true_false">True/False Quiz</option>' +
                '<option value="identification">Identification Quiz</option>' +
                '<option value="essay">Essay Question</option>' +
                '<option value="coding">Coding Exercise</option>' +
                '<option value="upload_based">Upload-based Activity</option>' +
                '<option value="laboratory">Laboratory Exercise</option>' +
                '<option value="lecture">Lecture Activity</option>' +
            '</select>' +
        '</div>' +
        '<div style="margin-bottom:15px;">' +
            '<label style="display:block;margin-bottom:5px;color:#374151;font-weight:600;">Activity title:</label>' +
            '<input type="text" id="activityTitleInput" placeholder="Enter activity title..." style="width:100%;padding:8px 12px;border:1px solid #1d9b3e;border-radius:6px;font-size:14px;outline:none;" />' +
        '</div>' +
        '<div style="margin-bottom:15px;">' +
            '<label style="display:block;margin-bottom:5px;color:#374151;font-weight:600;">Instructions:</label>' +
            '<textarea id="activityInstructionsInput" placeholder="Enter activity instructions..." style="width:100%;padding:8px 12px;border:1px solid #1d9b3e;border-radius:6px;font-size:14px;outline:none;min-height:80px;resize:vertical;"></textarea>' +
        '</div>' +
        '<div style="margin-bottom:15px;">' +
            '<label style="display:block;margin-bottom:5px;color:#374151;font-weight:600;">Max Score:</label>' +
            '<input type="number" id="activityMaxScoreInput" value="100" min="1" max="1000" style="width:100%;padding:8px 12px;border:1px solid #1d9b3e;border-radius:6px;font-size:14px;outline:none;" />' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
            '<button id="cancelActivityBtn" style="background:#6b7280;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">Cancel</button>' +
            '<button id="addActivityBtn" style="background:#1d9b3e;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">Add Activity</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelActivityBtn');
    var addBtn = modal.querySelector('#addActivityBtn');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(){
            modal.remove();
        });
    }
    
    if (addBtn) {
        addBtn.addEventListener('click', function(){
            var type = modal.querySelector('#activityTypeSelect').value;
            var title = modal.querySelector('#activityTitleInput').value.trim();
            var instructions = modal.querySelector('#activityInstructionsInput').value.trim();
            var maxScore = parseInt(modal.querySelector('#activityMaxScoreInput').value) || 100;
            
            if (!title) {
                alert('Please enter an activity title.');
        return;
      }
      
            if (!instructions) {
                alert('Please enter activity instructions.');
                return;
            }
            
            // Store activity data in topic for now (will integrate with coordinator API later)
            addActivityToTopic(topicItem, type, title, instructions, maxScore);
            modal.remove();
        });
    }
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Add material to topic (Enhanced with Coordinator Integration)
function addMaterialToTopic(topicItem, type, title, url, file){
    // Create material display with enhanced info
    var materialDiv = document.createElement('div');
    materialDiv.className = 'topic-material';
    materialDiv.style.cssText = 'margin-top:8px;padding:8px 10px;background:#f0f9ff;border:1px solid #0ea5e9;border-radius:6px;font-size:12px;color:#0c4a6e;';
    
    var icon = 'fa-file';
    if (type === 'pdf') icon = 'fa-file-pdf';
    else if (type === 'video') icon = 'fa-video';
    else if (type === 'code') icon = 'fa-code';
    else if (type === 'link') icon = 'fa-link';
    else if (type === 'page') icon = 'fa-file-alt';
    
    var extraInfo = '';
    if (url) extraInfo = '<br><small style="color:#64748b;">URL: ' + escapeHtml(url) + '</small>';
    else if (file) extraInfo = '<br><small style="color:#64748b;">File: ' + escapeHtml(file.name) + ' (' + formatFileSize(file.size) + ')</small>';
    
    materialDiv.innerHTML = '<i class="fas ' + icon + '" style="margin-right:4px;"></i>' + 
        '<strong>' + type.toUpperCase() + ':</strong> ' + escapeHtml(title) + extraInfo +
        '<button class="remove-material-btn" style="float:right;background:none;border:none;color:#ef4444;cursor:pointer;padding:2px;" title="Delete material">' +
            '<i class="fas fa-trash"></i>' +
        '</button>';
    
    // Insert after topic name
    var topicName = topicItem.querySelector('.topic-name');
    topicName.parentNode.insertBefore(materialDiv, topicName.nextSibling);
    
    // Add remove functionality
    var removeBtn = materialDiv.querySelector('.remove-material-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', function(){
            if (confirm('Are you sure you want to delete this material?')) {
                // Delete from database if it has an ID
                var materialId = materialDiv.getAttribute('data-material-id');
                if (materialId) {
                    deleteMaterialFromDatabase(materialId);
                }
                materialDiv.remove();
                try { saveStep5Draft(); } catch(_) {}
            }
        });
    }
    
    // Save draft
    try { saveStep5Draft(); } catch(_) {}
    
    // Show success notification
    if (typeof showNotification === 'function') {
        showNotification('success', 'Success', 'Material "' + title + '" added to topic!');
    }
    
    // Wire with coordinator API to actually save to database
    saveMaterialToCoordinator(topicItem, type, title, url, file);
}

// Add activity to topic (Enhanced with Coordinator Integration)
function addActivityToTopic(topicItem, type, title, instructions, maxScore){
    // Create activity display with enhanced info
    var activityDiv = document.createElement('div');
    activityDiv.className = 'topic-activity';
    activityDiv.style.cssText = 'margin-top:8px;padding:8px 10px;background:#f0f9ff;border:1px solid #3b82f6;border-radius:6px;font-size:12px;color:#1e40af;';
    
    var icon = 'fa-tasks';
    if (type === 'multiple_choice') icon = 'fa-list-ul';
    else if (type === 'true_false') icon = 'fa-check-circle';
    else if (type === 'identification') icon = 'fa-question-circle';
    else if (type === 'essay') icon = 'fa-edit';
    else if (type === 'coding') icon = 'fa-code';
    else if (type === 'upload_based') icon = 'fa-upload';
    else if (type === 'laboratory') icon = 'fa-flask';
    else if (type === 'lecture') icon = 'fa-chalkboard-teacher';
    
    var extraInfo = '<br><small style="color:#64748b;">Max Score: ' + maxScore + ' | Instructions: ' + escapeHtml(instructions.substring(0, 50)) + (instructions.length > 50 ? '...' : '') + '</small>';
    
    activityDiv.innerHTML = '<i class="fas ' + icon + '" style="margin-right:4px;"></i>' + 
        '<strong>' + type.replace('_', ' ').toUpperCase() + ':</strong> ' + escapeHtml(title) + extraInfo +
        '<button class="remove-activity-btn" style="float:right;background:none;border:none;color:#ef4444;cursor:pointer;padding:2px;" title="Remove activity">' +
            '<i class="fas fa-times"></i>' +
        '</button>';
    
    // Insert after topic name
    var topicName = topicItem.querySelector('.topic-name');
    topicName.parentNode.insertBefore(activityDiv, topicName.nextSibling);
    
    // Add remove functionality
    var removeBtn = activityDiv.querySelector('.remove-activity-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', function(){
            if (confirm('Are you sure you want to delete this activity?')) {
                // Delete from database if it has an ID
                var activityId = activityDiv.getAttribute('data-activity-id');
                if (activityId) {
                    deleteActivityFromDatabase(activityId);
                }
                activityDiv.remove();
                try { saveStep5Draft(); } catch(_) {}
            }
        });
    }
    
    // Save draft
    try { saveStep5Draft(); } catch(_) {}
    
    // Show success notification
    if (typeof showNotification === 'function') {
        showNotification('success', 'Success', 'Activity "' + title + '" added to topic!');
    }
    
    // Wire with coordinator API to actually save to database
    saveActivityToCoordinator(topicItem, type, title, instructions, maxScore);
}

// Helper function to format file size
function formatFileSize(bytes){
    if (bytes === 0) return '0 Bytes';
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Save material to coordinator system
function saveMaterialToCoordinator(topicItem, type, title, url, file){
    // Get the current course ID
    var courseId = getCurrentCourseIdForStep5();
    if (!courseId) {
        console.error('No course ID found');
        return;
    }
    
    // Find the lesson that contains this topic
    var lessonEl = topicItem.closest('.lesson');
    if (!lessonEl) {
        console.error('No lesson found for topic');
        return;
    }
    
    var lessonId = lessonEl.getAttribute('data-lesson-id');
    if (!lessonId) {
        console.error('No lesson ID found');
    return;
  }
    
    // Prepare material data
    var materialData = {
        action: 'material_create',
        lesson_id: lessonId,
        type: type,
        title: title
    };
    
    if (type === 'link' && url) {
        materialData.url = url;
    }
    
    // Handle file upload
    if (file && ['pdf', 'video', 'code', 'file'].includes(type)) {
        var formData = new FormData();
        formData.append('action', 'material_upload');
        formData.append('lesson_id', lessonId);
        formData.append('file', file);
        
        // Add CSRF token if available
        if (typeof getCSRFToken === 'function') {
            getCSRFToken().then(function(token){
                if (token) formData.append('csrf_token', token);
                uploadMaterialFile(formData, topicItem, type, title);
            }).catch(function(){
                uploadMaterialFile(formData, topicItem, type, title);
            });
    } else {
            uploadMaterialFile(formData, topicItem, type, title);
        }
      } else {
        // Handle non-file materials
        createMaterialRecord(materialData, topicItem, type, title);
    }
}

// Upload material file
function uploadMaterialFile(formData, topicItem, type, title){
    fetch('course_outline_manage.php', {
        method: 'POST',
        body: formData,
          credentials: 'same-origin'
        })
    .then(function(response){
        return response.json();
    })
    .then(function(data){
    if (data && data.success) {
            console.log('Material uploaded successfully:', data);
            // Update the material display with actual ID
            updateMaterialDisplay(topicItem, data.id, type, title);
                    } else {
            console.error('Material upload failed:', data);
            showErrorNotification('Failed to upload material: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(function(error){
        console.error('Material upload error:', error);
        showErrorNotification('Network error uploading material');
    });
}

// Create material record
function createMaterialRecord(materialData, topicItem, type, title){
    // Add CSRF token if available
    if (typeof getCSRFToken === 'function') {
        getCSRFToken().then(function(token){
            if (token) materialData.csrf_token = token;
            sendMaterialRequest(materialData, topicItem, type, title);
        }).catch(function(){
            sendMaterialRequest(materialData, topicItem, type, title);
        });
      } else {
        sendMaterialRequest(materialData, topicItem, type, title);
    }
}

// Send material request
function sendMaterialRequest(materialData, topicItem, type, title){
    var formData = new FormData();
    Object.keys(materialData).forEach(function(key){
        formData.append(key, materialData[key]);
    });
    
    fetch('course_outline_manage.php', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
    })
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        if (data && data.success) {
            console.log('Material created successfully:', data);
            // Update the material display with actual ID
            updateMaterialDisplay(topicItem, data.id, type, title);
  } else {
            console.error('Material creation failed:', data);
            showErrorNotification('Failed to create material: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(function(error){
        console.error('Material creation error:', error);
        showErrorNotification('Network error creating material');
    });
}

// Update material display with database ID
function updateMaterialDisplay(topicItem, materialId, type, title){
    var materialDiv = topicItem.querySelector('.topic-material');
    if (materialDiv) {
        materialDiv.setAttribute('data-material-id', materialId);
        console.log('Material display updated with ID:', materialId);
    }
}

// Save activity to coordinator system
function saveActivityToCoordinator(topicItem, type, title, instructions, maxScore){
    // Get the current course ID
    var courseId = getCurrentCourseIdForStep5();
    if (!courseId) {
        console.error('No course ID found');
    return;
  }
  
    // Find the lesson that contains this topic
    var lessonEl = topicItem.closest('.lesson');
    if (!lessonEl) {
        console.error('No lesson found for topic');
    return;
  }
    
    var lessonId = lessonEl.getAttribute('data-lesson-id');
    if (!lessonId) {
        console.error('No lesson ID found');
        return;
    }
    
    // Prepare activity data
    var activityData = {
        action: 'activity_create',
        lesson_id: lessonId,
        type: type,
        title: title,
        instructions: instructions,
        max_score: maxScore
    };
    
    // Add CSRF token if available
    if (typeof getCSRFToken === 'function') {
        getCSRFToken().then(function(token){
            if (token) activityData.csrf_token = token;
            sendActivityRequest(activityData, topicItem, type, title);
        }).catch(function(){
            sendActivityRequest(activityData, topicItem, type, title);
        });
    } else {
        sendActivityRequest(activityData, topicItem, type, title);
    }
}

// Send activity request
function sendActivityRequest(activityData, topicItem, type, title){
    var formData = new FormData();
    Object.keys(activityData).forEach(function(key){
        formData.append(key, activityData[key]);
    });
    
    fetch('course_outline_manage.php', {
    method: 'POST',
        body: formData,
        credentials: 'same-origin'
    })
    .then(function(response){
        return response.json();
    })
    .then(function(data){
    if (data && data.success) {
            console.log('Activity created successfully:', data);
            // Update the activity display with actual ID
            updateActivityDisplay(topicItem, data.id, type, title);
  } else {
            console.error('Activity creation failed:', data);
            showErrorNotification('Failed to create activity: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(function(error){
        console.error('Activity creation error:', error);
        showErrorNotification('Network error creating activity');
    });
}

// Save activity to coordinator system with dynamic data
function saveActivityToCoordinatorWithData(element, category, name, type, instructions, maxScore, dynamicData){
    // Get the current course ID
    var courseId = getCurrentCourseIdForStep5();
    if (!courseId) {
        console.error('No course ID found');
        showErrorNotification('No course selected');
        return;
    }
    
    // Create enhanced activity data with dynamic fields
    var activityData = {
        action: 'create_activity',
        course_id: courseId,
        type: type,
        title: name,
        instructions: instructions,
        max_score: maxScore,
        category: category,
        dynamic_data: dynamicData
    };
    
    // Send request to coordinator system
    sendActivityRequestWithData(activityData, element, type, name);
}

// Send activity request with dynamic data
function sendActivityRequestWithData(activityData, element, type, title){
    var formData = new FormData();
    formData.append('action', activityData.action);
    formData.append('course_id', activityData.course_id);
    formData.append('type', activityData.type);
    formData.append('title', activityData.title);
    formData.append('instructions', activityData.instructions);
    formData.append('max_score', activityData.max_score);
    formData.append('category', activityData.category);
    formData.append('dynamic_data', JSON.stringify(activityData.dynamic_data));
    
    fetch('course_outline_manage.php', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
    })
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        if (data && data.success) {
            console.log('Activity with dynamic data created successfully:', data);
            updateActivityDisplay(element, data.id, type, title);
        } else {
            console.error('Activity creation with dynamic data failed:', data);
            showErrorNotification('Failed to create activity: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(function(error){
        console.error('Activity creation with dynamic data error:', error);
        showErrorNotification('Network error creating activity');
    });
}

// Update activity display with database ID
function updateActivityDisplay(topicItem, activityId, type, title){
    var activityDiv = topicItem.querySelector('.topic-activity');
    if (activityDiv) {
        activityDiv.setAttribute('data-activity-id', activityId);
        console.log('Activity display updated with ID:', activityId);
    }
}

// Show error notification
function showErrorNotification(message){
    if (typeof showNotification === 'function') {
        showNotification('error', 'Error', message);
    } else {
        alert('Error: ' + message);
    }
}

// Delete material from database
function deleteMaterialFromDatabase(materialId){
    var deleteData = {
        action: 'material_delete',
        id: materialId
    };
    
    // Add CSRF token if available
    if (typeof getCSRFToken === 'function') {
        getCSRFToken().then(function(token){
            if (token) deleteData.csrf_token = token;
            sendDeleteRequest(deleteData, 'material');
        }).catch(function(){
            sendDeleteRequest(deleteData, 'material');
        });
    } else {
        sendDeleteRequest(deleteData, 'material');
    }
}

// Delete activity from database
function deleteActivityFromDatabase(activityId){
    var deleteData = {
        action: 'activity_delete',
        id: activityId
    };
    
    // Add CSRF token if available
    if (typeof getCSRFToken === 'function') {
        getCSRFToken().then(function(token){
            if (token) deleteData.csrf_token = token;
            sendDeleteRequest(deleteData, 'activity');
        }).catch(function(){
            sendDeleteRequest(deleteData, 'activity');
        });
    } else {
        sendDeleteRequest(deleteData, 'activity');
    }
}

// Send delete request
function sendDeleteRequest(deleteData, type){
    var formData = new FormData();
    Object.keys(deleteData).forEach(function(key){
        formData.append(key, deleteData[key]);
    });
    
    fetch('course_outline_manage.php', {
        method: 'POST',
        body: formData,
    credentials: 'same-origin'
    })
    .then(function(response){
        return response.json();
    })
    .then(function(data){
    if (data && data.success) {
            console.log(type + ' deleted successfully:', data);
            if (typeof showNotification === 'function') {
                showNotification('success', 'Success', type.charAt(0).toUpperCase() + type.slice(1) + ' deleted successfully!');
            }
          } else {
            console.error(type + ' deletion failed:', data);
            showErrorNotification('Failed to delete ' + type + ': ' + (data.message || 'Unknown error'));
        }
    })
    .catch(function(error){
        console.error(type + ' deletion error:', error);
        showErrorNotification('Network error deleting ' + type);
    });
}

// Add Material Modal for Lessons
function showAddMaterialToLessonModal(lessonEl){
    var lessonTitle = lessonEl.querySelector('div[style*="font-weight:600"]');
    var title = lessonTitle ? lessonTitle.textContent.trim() : 'Lesson';
    
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:500px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<h3 style="margin:0 0 15px 0;color:#1d9b3e;font-weight:700;">Add Material to "' + escapeHtml(title) + '"</h3>' +
        '<div style="margin-bottom:15px;">' +
            '<label style="display:block;margin-bottom:5px;color:#374151;font-weight:600;">Material type:</label>' +
            '<select id="lessonMaterialTypeSelect" style="width:100%;padding:8px 12px;border:1px solid #1d9b3e;border-radius:6px;font-size:14px;outline:none;">' +
                '<option value="pdf">PDF Document</option>' +
                '<option value="video">Video</option>' +
                '<option value="link">External Link</option>' +
                '<option value="code">Code File</option>' +
                '<option value="file">General File</option>' +
                '<option value="page">Page Content</option>' +
            '</select>' +
        '</div>' +
        '<div id="lessonMaterialUrlSection" style="margin-bottom:15px;display:none;">' +
            '<label style="display:block;margin-bottom:5px;color:#374151;font-weight:600;">URL:</label>' +
            '<input type="url" id="lessonMaterialUrlInput" placeholder="https://example.com" style="width:100%;padding:8px 12px;border:1px solid #1d9b3e;border-radius:6px;font-size:14px;outline:none;" />' +
        '</div>' +
        '<div id="lessonMaterialFileSection" style="margin-bottom:15px;display:none;">' +
            '<label style="display:block;margin-bottom:5px;color:#374151;font-weight:600;">Select file:</label>' +
            '<input type="file" id="lessonMaterialFileInput" style="width:100%;padding:8px 12px;border:1px solid #1d9b3e;border-radius:6px;font-size:14px;" />' +
        '</div>' +
        '<div style="margin-bottom:15px;">' +
            '<label style="display:block;margin-bottom:5px;color:#374151;font-weight:600;">Material title:</label>' +
            '<input type="text" id="lessonMaterialTitleInput" placeholder="Enter material title..." style="width:100%;padding:8px 12px;border:1px solid #1d9b3e;border-radius:6px;font-size:14px;outline:none;" />' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
            '<button id="cancelLessonMaterialBtn" style="background:#6b7280;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">Cancel</button>' +
            '<button id="addLessonMaterialBtn" style="background:#1d9b3e;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">Add Material</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Show/hide sections based on material type
    var typeSelect = modal.querySelector('#lessonMaterialTypeSelect');
    var urlSection = modal.querySelector('#lessonMaterialUrlSection');
    var fileSection = modal.querySelector('#lessonMaterialFileSection');
    
    function updateSections(){
        var type = typeSelect.value;
        if (type === 'link') {
            urlSection.style.display = 'block';
            fileSection.style.display = 'none';
        } else if (['pdf', 'video', 'code', 'file'].includes(type)) {
            urlSection.style.display = 'none';
            fileSection.style.display = 'block';
            // Set file input accept attribute
            var fileInput = modal.querySelector('#lessonMaterialFileInput');
            if (type === 'pdf') fileInput.accept = '.pdf,application/pdf';
            else if (type === 'video') fileInput.accept = 'video/*';
            else if (type === 'code') fileInput.accept = '.js,.py,.java,.cpp,.c,.html,.css,.php,.sql,.json,.xml';
            else fileInput.accept = '*/*';
  } else {
            urlSection.style.display = 'none';
            fileSection.style.display = 'none';
        }
    }
    
    typeSelect.addEventListener('change', updateSections);
    updateSections(); // Initial call
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelLessonMaterialBtn');
    var addBtn = modal.querySelector('#addLessonMaterialBtn');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(){
            modal.remove();
        });
    }
    
    if (addBtn) {
        addBtn.addEventListener('click', function(){
            var type = typeSelect.value;
            var title = modal.querySelector('#lessonMaterialTitleInput').value.trim();
            var url = modal.querySelector('#lessonMaterialUrlInput').value.trim();
            var file = modal.querySelector('#lessonMaterialFileInput').files[0];
            
            if (!title) {
                alert('Please enter a material title.');
        return;
      }
      
            if (type === 'link' && !url) {
                alert('Please enter a URL for the link.');
                return;
            }
            
            if (['pdf', 'video', 'code', 'file'].includes(type) && !file) {
                alert('Please select a file.');
                return;
            }
            
            // Add material directly to lesson
            addMaterialToLesson(lessonEl, type, title, url, file);
            modal.remove();
        });
    }
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// ===== COORDINATOR-STYLE MATERIAL CREATION =====
function showCoordinatorMaterialModal(element, elementTitle){
    var title = elementTitle || 'Element';
    
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:600px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Add Material to "' + escapeHtml(title) + '"</h3>' +
            '<button id="closeMaterialModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div id="materialFormBody" style="max-height:70vh;overflow-y:auto;">' +
            '<div style="margin-bottom:20px;">' +
                '<label style="display:block;margin-bottom:8px;color:#374151;font-weight:600;">Material Type</label>' +
                '<select id="materialTypeSelect" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;background:white;">' +
                    '<option value="pdf">PDF Document</option>' +
                    '<option value="video">Video</option>' +
                    '<option value="link">External Link</option>' +
                    '<option value="code">Code File</option>' +
                    '<option value="file">General File</option>' +
                    '<option value="page">Page Content</option>' +
                    '<option value="pptx">PowerPoint (.pptx)</option>' +
                '</select>' +
            '</div>' +
            '<div id="materialUrlSection" style="margin-bottom:20px;display:none;">' +
                '<label style="display:block;margin-bottom:8px;color:#374151;font-weight:600;">URL</label>' +
                '<input type="url" id="materialUrlInput" placeholder="https://example.com" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;" />' +
            '</div>' +
            '<div id="materialFileSection" style="margin-bottom:20px;display:none;">' +
                '<label style="display:block;margin-bottom:8px;color:#374151;font-weight:600;">Select File</label>' +
                '<input type="file" id="materialFileInput" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;" />' +
                '<div id="filePreview" style="margin-top:8px;padding:8px;background:#f8f9fa;border-radius:4px;font-size:12px;color:#6b7280;display:none;"></div>' +
            '</div>' +
            '<div style="margin-bottom:20px;">' +
                '<label style="display:block;margin-bottom:8px;color:#374151;font-weight:600;">Material Title</label>' +
                '<input type="text" id="materialTitleInput" placeholder="Enter material title..." style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;" />' +
            '</div>' +
            '<div style="margin-bottom:20px;">' +
                '<label style="display:block;margin-bottom:8px;color:#374151;font-weight:600;">Description (Optional)</label>' +
                '<textarea id="materialDescriptionInput" placeholder="Brief description of the material..." style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;min-height:80px;resize:vertical;"></textarea>' +
            '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelMaterialBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
            '<button id="addMaterialBtn" style="background:#1d9b3e;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Add Material</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Show/hide sections based on material type
    var typeSelect = modal.querySelector('#materialTypeSelect');
    var urlSection = modal.querySelector('#materialUrlSection');
    var fileSection = modal.querySelector('#materialFileSection');
    var fileInput = modal.querySelector('#materialFileInput');
    var filePreview = modal.querySelector('#filePreview');
    
    function updateSections(){
        var type = typeSelect.value;
        if (type === 'link') {
            urlSection.style.display = 'block';
            fileSection.style.display = 'none';
        } else if (['pdf', 'video', 'code', 'file', 'pptx'].includes(type)) {
            urlSection.style.display = 'none';
            fileSection.style.display = 'block';
            // Set file input accept attribute
            if (type === 'pdf') fileInput.accept = '.pdf,application/pdf';
            else if (type === 'video') fileInput.accept = 'video/*';
            else if (type === 'code') fileInput.accept = '.js,.py,.java,.cpp,.c,.html,.css,.php,.sql,.json,.xml';
            else if (type === 'pptx') fileInput.accept = '.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation';
            else fileInput.accept = '*/*';
      } else {
            urlSection.style.display = 'none';
            fileSection.style.display = 'none';
        }
    }
    
    typeSelect.addEventListener('change', updateSections);
    updateSections(); // Initial call
    
    // File preview
    fileInput.addEventListener('change', function(){
        var file = this.files[0];
        if (file) {
            filePreview.style.display = 'block';
            filePreview.innerHTML = '<strong>Selected:</strong> ' + escapeHtml(file.name) + ' (' + formatFileSize(file.size) + ')';
          } else {
            filePreview.style.display = 'none';
        }
    });
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelMaterialBtn');
    var addBtn = modal.querySelector('#addMaterialBtn');
    var closeBtn = modal.querySelector('#closeMaterialModal');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(){
            modal.remove();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function(){
            modal.remove();
        });
    }
    
    if (addBtn) {
        addBtn.addEventListener('click', function(){
            var type = typeSelect.value;
            var title = modal.querySelector('#materialTitleInput').value.trim();
            var description = modal.querySelector('#materialDescriptionInput').value.trim();
            var url = modal.querySelector('#materialUrlInput').value.trim();
            var file = modal.querySelector('#materialFileInput').files[0];
            
            if (!title) {
                alert('Please enter a material title.');
    return;
  }
            
            if (type === 'link' && !url) {
                alert('Please enter a URL for the link.');
                return;
            }
            
            if (['pdf', 'video', 'code', 'file', 'pptx'].includes(type) && !file) {
                alert('Please select a file.');
                return;
            }
            
            // Add material with enhanced info
            addCoordinatorStyleMaterial(lessonEl, type, title, description, url, file);
            modal.remove();
        });
    }
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Add coordinator-style material
function addCoordinatorStyleMaterial(lessonEl, type, title, description, url, file){
    // Create material display in lesson
    var materialsSection = lessonEl.querySelector('div[style*="margin-top:4px;margin-left:12px;"]');
    if (materialsSection) {
        // Check if materials already exist
        var existingMaterials = materialsSection.querySelectorAll('div[style*="font-size:11px;color:#495057;"]');
        var materialCount = existingMaterials.length;
        
        // Create new material info with enhanced display
        var materialInfo = '';
        var icon = 'fa-file';
        if (type === 'pdf') icon = 'fa-file-pdf';
        else if (type === 'video') icon = 'fa-video';
        else if (type === 'code') icon = 'fa-code';
        else if (type === 'link') icon = 'fa-link';
        else if (type === 'pptx') icon = 'fa-file-powerpoint';
        else if (type === 'page') icon = 'fa-file-alt';
        
        if (url) {
            materialInfo = '<i class="fas ' + icon + '" style="margin-right:4px;color:#1d9b3e;"></i>' + 
                '<strong>' + type.toUpperCase() + ':</strong> ' + escapeHtml(title) + 
                '<br><small style="color:#64748b;">URL: ' + escapeHtml(url) + '</small>';
        } else if (file) {
            materialInfo = '<i class="fas ' + icon + '" style="margin-right:4px;color:#1d9b3e;"></i>' + 
                '<strong>' + type.toUpperCase() + ':</strong> ' + escapeHtml(title) + 
                '<br><small style="color:#64748b;">File: ' + escapeHtml(file.name) + ' (' + formatFileSize(file.size) + ')</small>';
      } else {
            materialInfo = '<i class="fas ' + icon + '" style="margin-right:4px;color:#1d9b3e;"></i>' + 
                '<strong>' + type.toUpperCase() + ':</strong> ' + escapeHtml(title);
        }
        
        if (description) {
            materialInfo += '<br><small style="color:#64748b;font-style:italic;">' + escapeHtml(description) + '</small>';
        }
        
        // Add action buttons
        materialInfo += '<div style="float:right;margin-top:-20px;">' +
            '<button class="download-material-btn" style="background:#1d9b3e;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;margin-right:2px;" title="Download">' +
                '<i class="fas fa-download"></i>' +
            '</button>' +
            '<button class="edit-material-btn" style="background:#6b7280;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;margin-right:2px;" title="Edit">' +
                '<i class="fas fa-pencil-alt"></i>' +
            '</button>' +
            '<button class="delete-material-btn" style="background:#ef4444;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;" title="Delete">' +
                '<i class="fas fa-trash"></i>' +
            '</button>' +
        '</div>';
        
        // Update materials section
        if (materialCount === 0) {
            // First material - replace "No materials"
            materialsSection.innerHTML = '<div style="font-size:11px;color:#374151;font-weight:600;margin:2px 0 2px;">Materials (1)</div>' +
                '<div style="font-size:11px;color:#495057;padding:8px;background:#f8f9fa;border-radius:4px;border:1px solid #e5e7eb;">' + materialInfo + '</div>';
      } else {
            // Add to existing materials
            var materialsHeader = materialsSection.querySelector('div[style*="font-size:11px;color:#374151;font-weight:600;"]');
            if (materialsHeader) {
                materialsHeader.textContent = 'Materials (' + (materialCount + 1) + ')';
            }
            
            // Add new material
            var newMaterialDiv = document.createElement('div');
            newMaterialDiv.style.cssText = 'font-size:11px;color:#495057;padding:8px;background:#f8f9fa;border-radius:4px;border:1px solid #e5e7eb;margin-top:4px;';
            newMaterialDiv.innerHTML = materialInfo;
            materialsSection.appendChild(newMaterialDiv);
        }
    }
    
    // Save to coordinator system
    saveMaterialToCoordinator(lessonEl, type, title, url, file);
    
    // Show success notification
    if (typeof showNotification === 'function') {
        showNotification('success', 'Success', 'Material "' + title + '" added to lesson!');
    }
}

// ===== COORDINATOR-STYLE ACTIVITY CREATION =====
function showCoordinatorActivityModal(element, elementTitle){
    var title = elementTitle || 'Element';
    
    // Create the complete activity creation modal
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:900px;width:95%;max-height:90vh;box-shadow:0 10px 25px rgba(0,0,0,0.2);display:flex;flex-direction:column;">' +
        '<div style="padding:12px 14px;border-bottom:1px solid #e9ecef;display:flex;align-items:center;gap:8px;">' +
            '<strong style="flex:1;color:#1d9b3e;font-size:18px;">Create Activity</strong>' +
            '<button id="closeActivityModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div id="activityFormBody" style="padding:12px 14px;overflow:auto;flex:1;">' +
            '<div style="display:grid;grid-template-columns:1fr;gap:16px;">' +
                // Step 1: Lecture or Laboratory
                '<div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">' +
                    '<div style="font-weight:600;margin-bottom:12px;color:#333;">Step 1 · Choose Activity Type</div>' +
                    '<div style="display:flex;gap:12px;">' +
                        '<label class="ca-radio-tile" style="flex:1;border:2px solid #28a745;border-radius:8px;padding:16px;cursor:pointer;background:#f8fff9;transition:all 0.2s;">' +
                            '<input type="radio" name="activityCategory" value="lecture" checked style="margin-right:8px;" />' +
                            '<div style="font-weight:600;color:#333;margin-bottom:4px;">📚 Lecture</div>' +
                            '<div style="font-size:13px;color:#666;">Interactive lessons with questions and assessments</div>' +
                        '</label>' +
                        '<label class="ca-radio-tile" style="flex:1;border:2px solid #e3e6ea;border-radius:8px;padding:16px;cursor:pointer;background:white;transition:all 0.2s;">' +
                            '<input type="radio" name="activityCategory" value="laboratory" style="margin-right:8px;" />' +
                            '<div style="font-weight:600;color:#333;margin-bottom:4px;">🔬 Laboratory</div>' +
                            '<div style="font-size:13px;color:#666;">Hands-on coding exercises and practical work</div>' +
                        '</label>' +
                    '</div>' +
                '</div>' +
                
                // Step 2: Activity Name
                '<div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">' +
                    '<div style="font-weight:600;margin-bottom:12px;color:#333;">Step 2 · Activity Name <span style="color:red;">*</span></div>' +
                    '<input id="activityNameInput" type="text" placeholder="Enter activity name (e.g., Introduction to Variables)" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;font-size:14px;" required />' +
                '</div>' +
                
                // Step 3: Activity Type
                '<div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">' +
                    '<div style="font-weight:600;margin-bottom:12px;color:#333;">Step 3 · Activity Type</div>' +
                    '<select id="activityTypeSelect" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;font-size:14px;background:white;">' +
                        '<option value="">Select activity type...</option>' +
                        '<option value="multiple_choice" selected>📝 Multiple Choice</option>' +
                        '<option value="identification">🔍 Identification</option>' +
                        '<option value="true_false">✅ True/False</option>' +
                        '<option value="essay">📄 Essay</option>' +
                        '<option value="upload_based">📎 Upload-based</option>' +
                        '<option value="coding">💻 Coding Exercise</option>' +
                    '</select>' +
                    '<div style="margin-top:8px;font-size:12px;color:#666;">Current selection: <strong>multiple_choice</strong></div>' +
                '</div>' +
                
                // Instructions
                '<div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">' +
                    '<div style="font-weight:600;margin-bottom:12px;color:#333;">Instructions</div>' +
                    '<textarea id="activityInstructionsInput" rows="4" placeholder="Enter instructions for students..." style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;font-size:14px;resize:vertical;"></textarea>' +
                '</div>' +
                
                // Dynamic Fields Based on Activity Type
                '<div id="dynamicFieldsContainer" style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">' +
                    '<div id="dynamicFieldsContent">' +
                        '<!-- Dynamic content will be inserted here based on activity type -->' +
                    '</div>' +
                '</div>' +
                
                // Max Score
                '<div style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">' +
                    '<div style="font-weight:600;margin-bottom:12px;color:#333;">Max Score</div>' +
                    '<input id="activityMaxScoreInput" type="number" value="100" min="1" max="1000" style="width:150px;padding:12px;border:1px solid #ddd;border-radius:6px;font-size:14px;" />' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div style="padding:10px 14px;border-top:1px solid #e9ecef;display:flex;gap:8px;justify-content:flex-end;align-items:center;">' +
            '<button id="cancelActivityBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
            '<button id="createActivityBtn" style="background:#1d9b3e;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Create Item</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    console.log('🔧 Activity modal created and appended to body');
    
    // Add interactivity
    var categoryRadios = modal.querySelectorAll('input[name="activityCategory"]');
    var typeSelect = modal.querySelector('#activityTypeSelect');
    var currentSelection = modal.querySelector('div[style*="Current selection"]');
    console.log('🔧 Found typeSelect element:', typeSelect);
    console.log('🔧 Found currentSelection element:', currentSelection);
    
    // Update category styling
    categoryRadios.forEach(function(radio){
        radio.addEventListener('change', function(){
            categoryRadios.forEach(function(r){
                var label = r.closest('label');
                if (r.checked) {
                    label.style.borderColor = '#28a745';
                    label.style.background = '#f8fff9';
                } else {
                    label.style.borderColor = '#e3e6ea';
                    label.style.background = 'white';
                }
            });
        });
    });
    
    // Update current selection display
    function updateCurrentSelection(){
        currentSelection.innerHTML = 'Current selection: <strong>' + typeSelect.value + '</strong>';
    }
    
    // Update dynamic fields based on activity type
    function updateDynamicFields(){
        console.log('🔧 updateDynamicFields called');
        var type = typeSelect.value;
        var dynamicContent = modal.querySelector('#dynamicFieldsContent');
        console.log('🔧 Activity type:', type);
        console.log('🔧 Dynamic content element:', dynamicContent);
        
        if (type === 'multiple_choice') {
            console.log('🔧 Rendering multiple choice fields');
            dynamicContent.innerHTML = `
                <div style="font-weight:600;margin-bottom:12px;color:#333;">📝 Multiple Choice Questions</div>
                <div id="questionsList">
                    <div class="question-item" style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;margin-bottom:16px;background:white;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                            <h4 style="margin:0;color:#333;">Question 1</h4>
                        </div>
                        <div style="margin-bottom:16px;">
                            <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Question Text:</label>
                            <textarea class="question-text" rows="3" placeholder="Enter your question here..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;"></textarea>
                        </div>
                        <div style="margin-bottom:16px;">
                            <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Score for this question:</label>
                            <input type="number" class="question-points" min="1" value="1" style="max-width:100px;padding:8px;border:1px solid #ddd;border-radius:6px;" />
                        </div>
                        <div>
                            <label style="display:block;margin-bottom:8px;font-weight:500;color:#333;">Choices (Select the correct answer):</label>
                            <div class="choices-container">
                                <div class="choice-item" style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding:12px;background:#f8f9fa;border-radius:6px;border:1px solid #e3e6ea;">
                                    <input type="radio" name="correct-0" value="0" checked style="margin-right:8px;" />
                                    <span style="font-weight:600;color:#333;min-width:20px;">A.</span>
                                    <input type="text" class="choice-text" placeholder="Enter choice text..." style="flex:1;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;" />
                                </div>
                                <div class="choice-item" style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding:12px;background:#f8f9fa;border-radius:6px;border:1px solid #e3e6ea;">
                                    <input type="radio" name="correct-0" value="1" style="margin-right:8px;" />
                                    <span style="font-weight:600;color:#333;min-width:20px;">B.</span>
                                    <input type="text" class="choice-text" placeholder="Enter choice text..." style="flex:1;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;" />
                                </div>
                                <div class="choice-item" style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding:12px;background:#f8f9fa;border-radius:6px;border:1px solid #e3e6ea;">
                                    <input type="radio" name="correct-0" value="2" style="margin-right:8px;" />
                                    <span style="font-weight:600;color:#333;min-width:20px;">C.</span>
                                    <input type="text" class="choice-text" placeholder="Enter choice text..." style="flex:1;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;" />
                                </div>
                                <div class="choice-item" style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding:12px;background:#f8f9fa;border-radius:6px;border:1px solid #e3e6ea;">
                                    <input type="radio" name="correct-0" value="3" style="margin-right:8px;" />
                                    <span style="font-weight:600;color:#333;min-width:20px;">D.</span>
                                    <input type="text" class="choice-text" placeholder="Enter choice text..." style="flex:1;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button id="addQuestionBtn" style="background:#1d9b3e;color:white;border:none;padding:10px 16px;border-radius:6px;cursor:pointer;font-size:14px;margin-top:12px;">+ Add Question</button>
            `;
        } else if (type === 'identification') {
            dynamicContent.innerHTML = `
                <div style="font-weight:600;margin-bottom:12px;color:#333;">🔍 Identification Questions</div>
                <div id="questionsList">
                    <div class="question-item" style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;margin-bottom:16px;background:white;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                            <h4 style="margin:0;color:#333;">Question 1</h4>
                        </div>
                        <div style="margin-bottom:16px;">
                            <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Question Text:</label>
                            <textarea class="question-text" rows="3" placeholder="Enter your question here..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;"></textarea>
                        </div>
                        <div style="margin-bottom:16px;">
                            <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Score for this question:</label>
                            <input type="number" class="question-points" min="1" value="1" style="max-width:100px;padding:8px;border:1px solid #ddd;border-radius:6px;" />
                        </div>
                        <div>
                            <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Correct Answer:</label>
                            <input type="text" class="question-answer" placeholder="Enter the correct answer..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;" />
                        </div>
                    </div>
                </div>
                <button id="addQuestionBtn" style="background:#1d9b3e;color:white;border:none;padding:10px 16px;border-radius:6px;cursor:pointer;font-size:14px;margin-top:12px;">+ Add Question</button>
            `;
        } else if (type === 'true_false') {
            dynamicContent.innerHTML = `
                <div style="font-weight:600;margin-bottom:12px;color:#333;">✅ True/False Questions</div>
                <div id="questionsList">
                    <div class="question-item" style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;margin-bottom:16px;background:white;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                            <h4 style="margin:0;color:#333;">Question 1</h4>
                        </div>
                        <div style="margin-bottom:16px;">
                            <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Question Text:</label>
                            <textarea class="question-text" rows="3" placeholder="Enter your question here..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;"></textarea>
                        </div>
                        <div style="margin-bottom:16px;">
                            <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Score for this question:</label>
                            <input type="number" class="question-points" min="1" value="1" style="max-width:100px;padding:8px;border:1px solid #ddd;border-radius:6px;" />
                        </div>
                        <div>
                            <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Correct Answer:</label>
                            <select class="question-answer" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;">
                                <option value="true">True</option>
                                <option value="false">False</option>
                            </select>
                        </div>
                    </div>
                </div>
                <button id="addQuestionBtn" style="background:#1d9b3e;color:white;border:none;padding:10px 16px;border-radius:6px;cursor:pointer;font-size:14px;margin-top:12px;">+ Add Question</button>
            `;
        } else if (type === 'essay') {
            dynamicContent.innerHTML = `
                <div style="font-weight:600;margin-bottom:12px;color:#333;">📄 Essay Questions</div>
                <div id="questionsList">
                    <div class="question-item" style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;margin-bottom:16px;background:white;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                            <h4 style="margin:0;color:#333;">Question 1</h4>
                        </div>
                        <div style="margin-bottom:16px;">
                            <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Question Text:</label>
                            <textarea class="question-text" rows="3" placeholder="Enter your question here..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;"></textarea>
                        </div>
                        <div style="margin-bottom:16px;">
                            <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Score for this question:</label>
                            <input type="number" class="question-points" min="1" value="1" style="max-width:100px;padding:8px;border:1px solid #ddd;border-radius:6px;" />
                        </div>
                        <div>
                            <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Sample Answer (Optional):</label>
                            <textarea class="question-answer" rows="3" placeholder="Enter sample answer or grading criteria..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;"></textarea>
                        </div>
                    </div>
                </div>
                <button id="addQuestionBtn" style="background:#1d9b3e;color:white;border:none;padding:10px 16px;border-radius:6px;cursor:pointer;font-size:14px;margin-top:12px;">+ Add Question</button>
            `;
        } else if (type === 'coding') {
            dynamicContent.innerHTML = `
                <div style="font-weight:600;margin-bottom:12px;color:#333;">💻 Coding Exercise</div>
                <div style="margin-bottom:16px;">
                    <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Problem Statement:</label>
                    <textarea id="codingProblem" rows="4" placeholder="Describe the coding problem..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;"></textarea>
                </div>
                <div style="margin-bottom:16px;">
                    <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Programming Language:</label>
                    <select id="codingLanguage" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;">
                        <option value="java">Java</option>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="cpp">C++</option>
                        <option value="c">C</option>
                    </select>
                </div>
                <div style="margin-bottom:16px;">
                    <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Starter Code (Optional):</label>
                    <textarea id="codingStarter" rows="6" placeholder="Enter starter code..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;font-family:monospace;"></textarea>
                </div>
                <div style="margin-bottom:16px;">
                    <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Expected Output (Optional):</label>
                    <textarea id="codingExpected" rows="3" placeholder="Enter expected output..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;font-family:monospace;"></textarea>
                </div>
                <div>
                    <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Time Limit (minutes):</label>
                    <input type="number" id="codingTimeLimit" min="1" max="300" value="60" style="width:150px;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;" />
                </div>
            `;
        } else if (type === 'upload_based') {
            dynamicContent.innerHTML = `
                <div style="font-weight:600;margin-bottom:12px;color:#333;">📎 Upload-based Activity</div>
                <div style="margin-bottom:16px;">
                    <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Task Description:</label>
                    <textarea id="uploadTask" rows="4" placeholder="Describe what students need to upload..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;"></textarea>
                </div>
                <div style="margin-bottom:16px;">
                    <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Accepted File Types:</label>
                    <div style="display:flex;gap:12px;flex-wrap:wrap;">
                        <label style="display:flex;align-items:center;gap:6px;">
                            <input type="checkbox" value="pdf" checked />
                            <span>PDF</span>
                        </label>
                        <label style="display:flex;align-items:center;gap:6px;">
                            <input type="checkbox" value="doc" />
                            <span>Word</span>
                        </label>
                        <label style="display:flex;align-items:center;gap:6px;">
                            <input type="checkbox" value="ppt" />
                            <span>PowerPoint</span>
                        </label>
                        <label style="display:flex;align-items:center;gap:6px;">
                            <input type="checkbox" value="image" />
                            <span>Images</span>
                        </label>
                        <label style="display:flex;align-items:center;gap:6px;">
                            <input type="checkbox" value="video" />
                            <span>Video</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Max File Size (MB):</label>
                    <input type="number" id="uploadMaxSize" min="1" max="100" value="10" style="width:150px;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;" />
                </div>
            `;
        } else {
            dynamicContent.innerHTML = '<div style="text-align:center;color:#6b7280;padding:20px;">Select an activity type to see specific fields</div>';
        }
    }
    
    typeSelect.addEventListener('change', function(){
        console.log('🔧 Activity type changed to:', typeSelect.value);
        updateCurrentSelection();
        updateDynamicFields();
    });
    console.log('🔧 Making initial calls...');
    updateCurrentSelection(); // Initial call
    updateDynamicFields(); // Initial call
    console.log('🔧 Initial calls completed');
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelActivityBtn');
    var createBtn = modal.querySelector('#createActivityBtn');
    var closeBtn = modal.querySelector('#closeActivityModal');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(){
            modal.remove();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function(){
            modal.remove();
        });
    }
    
    if (createBtn) {
        createBtn.addEventListener('click', function(){
            var category = modal.querySelector('input[name="activityCategory"]:checked').value;
            var name = modal.querySelector('#activityNameInput').value.trim();
            var type = modal.querySelector('#activityTypeSelect').value;
            var instructions = modal.querySelector('#activityInstructionsInput').value.trim();
            var maxScore = parseInt(modal.querySelector('#activityMaxScoreInput').value) || 100;
            
            if (!name) {
                alert('Please enter an activity name.');
                return;
            }
            
            if (!type) {
                alert('Please select an activity type.');
                return;
            }
            
            if (!instructions) {
                alert('Please enter activity instructions.');
                return;
            }
            
            // Collect dynamic field data based on activity type
            var dynamicData = {};
            
            if (type === 'multiple_choice') {
                var questions = [];
                var questionItems = modal.querySelectorAll('.question-item');
                questionItems.forEach(function(item, index){
                    var questionText = item.querySelector('.question-text').value.trim();
                    var questionPoints = parseInt(item.querySelector('.question-points').value) || 1;
                    var choices = [];
                    var choiceItems = item.querySelectorAll('.choice-item');
                    var correctAnswer = -1;
                    
                    choiceItems.forEach(function(choiceItem, choiceIndex){
                        var choiceText = choiceItem.querySelector('.choice-text').value.trim();
                        var isCorrect = choiceItem.querySelector('input[type="radio"]').checked;
                        if (isCorrect) correctAnswer = choiceIndex;
                        if (choiceText) {
                            choices.push({
                                text: choiceText,
                                correct: isCorrect
                            });
                        }
                    });
                    
                    if (questionText && choices.length >= 2 && correctAnswer >= 0) {
                        questions.push({
                            text: questionText,
                            points: questionPoints,
                            choices: choices,
                            correctAnswer: correctAnswer
                        });
                    }
                });
                
                if (questions.length === 0) {
                    alert('Please add at least one question with valid choices.');
                    return;
                }
                
                dynamicData.questions = questions;
            } else if (type === 'identification') {
                var questions = [];
                var questionItems = modal.querySelectorAll('.question-item');
                questionItems.forEach(function(item){
                    var questionText = item.querySelector('.question-text').value.trim();
                    var questionPoints = parseInt(item.querySelector('.question-points').value) || 1;
                    var answer = item.querySelector('.question-answer').value.trim();
                    
                    if (questionText && answer) {
                        questions.push({
                            text: questionText,
                            points: questionPoints,
                            answer: answer
                        });
                    }
                });
                
                if (questions.length === 0) {
                    alert('Please add at least one question with an answer.');
                    return;
                }
                
                dynamicData.questions = questions;
            } else if (type === 'true_false') {
                var questions = [];
                var questionItems = modal.querySelectorAll('.question-item');
                questionItems.forEach(function(item){
                    var questionText = item.querySelector('.question-text').value.trim();
                    var questionPoints = parseInt(item.querySelector('.question-points').value) || 1;
                    var answer = item.querySelector('.question-answer').value;
                    
                    if (questionText) {
                        questions.push({
                            text: questionText,
                            points: questionPoints,
                            answer: answer
                        });
                    }
                });
                
                if (questions.length === 0) {
                    alert('Please add at least one question.');
                    return;
                }
                
                dynamicData.questions = questions;
            } else if (type === 'essay') {
                var questions = [];
                var questionItems = modal.querySelectorAll('.question-item');
                questionItems.forEach(function(item){
                    var questionText = item.querySelector('.question-text').value.trim();
                    var questionPoints = parseInt(item.querySelector('.question-points').value) || 1;
                    var answer = item.querySelector('.question-answer').value.trim();
                    
                    if (questionText) {
                        questions.push({
                            text: questionText,
                            points: questionPoints,
                            answer: answer
                        });
                    }
                });
                
                if (questions.length === 0) {
                    alert('Please add at least one question.');
                    return;
                }
                
                dynamicData.questions = questions;
            } else if (type === 'coding') {
                var problem = modal.querySelector('#codingProblem').value.trim();
                var language = modal.querySelector('#codingLanguage').value;
                var starter = modal.querySelector('#codingStarter').value.trim();
                var expected = modal.querySelector('#codingExpected').value.trim();
                var timeLimit = parseInt(modal.querySelector('#codingTimeLimit').value) || 60;
                
                if (!problem) {
                    alert('Please enter a problem statement.');
                    return;
                }
                
                dynamicData = {
                    problem: problem,
                    language: language,
                    starter: starter,
                    expected: expected,
                    timeLimit: timeLimit
                };
            } else if (type === 'upload_based') {
                var task = modal.querySelector('#uploadTask').value.trim();
                var fileTypes = [];
                var checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');
                checkboxes.forEach(function(cb){
                    fileTypes.push(cb.value);
                });
                var maxSize = parseInt(modal.querySelector('#uploadMaxSize').value) || 10;
                
                if (!task) {
                    alert('Please enter a task description.');
                    return;
                }
                
                if (fileTypes.length === 0) {
                    alert('Please select at least one file type.');
                    return;
                }
                
                dynamicData = {
                    task: task,
                    fileTypes: fileTypes,
                    maxSize: maxSize
                };
            }
            
            // Create activity with complete data including dynamic fields
            createCompleteActivityWithData(element, category, name, type, instructions, maxScore, dynamicData);
            modal.remove();
        });
    }
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Add test function for debugging
    window.testDynamicFields = function(){
        console.log('🔧 Testing dynamic fields...');
        var typeSelect = document.querySelector('#activityTypeSelect');
        var dynamicContent = document.querySelector('#dynamicFieldsContent');
        console.log('🔧 TypeSelect found:', !!typeSelect);
        console.log('🔧 DynamicContent found:', !!dynamicContent);
        if (typeSelect && dynamicContent) {
            console.log('🔧 Current value:', typeSelect.value);
            updateDynamicFields();
        }
    };
}

// ===== COMPLETE ACTIVITY CREATION =====
function createCompleteActivity(element, category, name, type, instructions, maxScore){
    console.log('🚀 Creating complete activity:', {category, name, type, instructions, maxScore});
    
    // Determine if this is a lesson or topic
    var isLesson = element.classList.contains('lesson');
    var isTopic = element.classList.contains('topic-item');
    
    if (isLesson) {
        console.log('🚀 Adding activity to lesson');
        addActivityToLesson(element, category, name, type, instructions, maxScore);
    } else if (isTopic) {
        console.log('🚀 Adding activity to topic');
        addActivityToTopic(element, category, name, type, instructions, maxScore);
    }
}

// ===== COMPLETE ACTIVITY CREATION WITH DYNAMIC DATA =====
function createCompleteActivityWithData(element, category, name, type, instructions, maxScore, dynamicData){
    console.log('🚀 Creating complete activity with dynamic data:', {category, name, type, instructions, maxScore, dynamicData});
    
    // Determine if this is a lesson or topic
    var isLesson = element.classList.contains('lesson');
    var isTopic = element.classList.contains('topic-item');
    
    if (isLesson) {
        console.log('🚀 Adding activity to lesson');
        addActivityToLessonWithData(element, category, name, type, instructions, maxScore, dynamicData);
    } else if (isTopic) {
        console.log('🚀 Adding activity to topic');
        addActivityToTopicWithData(element, category, name, type, instructions, maxScore, dynamicData);
    }
}

// ===== ADD ACTIVITY TO LESSON =====
function addActivityToLesson(lessonEl, category, name, type, instructions, maxScore){
    // Update lesson display to show activity
    var materialsSection = lessonEl.querySelector('div[style*="margin-top:4px;margin-left:12px;"]');
    if (materialsSection) {
        // Check if activities already exist
        var existingActivities = materialsSection.querySelectorAll('div[style*="font-size:11px;color:#495057;"]');
        var activityCount = existingActivities.length;
        
        // Create new activity info
        var activityInfo = '• ' + type.replace('_', ' ').toUpperCase() + ': ' + escapeHtml(name);
        
        // Update materials section
        if (activityCount === 0) {
            // First activity - replace "No materials"
            materialsSection.innerHTML = '<div style="font-size:11px;color:#374151;font-weight:600;margin:2px 0 2px;">Activities (1)</div>' +
                '<div style="font-size:11px;color:#495057;">' + activityInfo + '</div>';
    } else {
            // Add to existing activities
            var activitiesHeader = materialsSection.querySelector('div[style*="font-size:11px;color:#374151;font-weight:600;"]');
            if (activitiesHeader) {
                activitiesHeader.textContent = 'Activities (' + (activityCount + 1) + ')';
            }
            
            // Add new activity
            var newActivityDiv = document.createElement('div');
            newActivityDiv.style.cssText = 'font-size:11px;color:#495057;';
            newActivityDiv.innerHTML = activityInfo;
            materialsSection.appendChild(newActivityDiv);
        }
    }
    
    // Save to coordinator system
    saveActivityToCoordinator(lessonEl, category, name, type, instructions, maxScore);
    
    // Show success notification
    if (typeof showNotification === 'function') {
        showNotification('success', 'Success', 'Activity "' + name + '" added to lesson!');
    }
}

// ===== ADD ACTIVITY TO TOPIC =====
function addActivityToTopic(topicEl, category, name, type, instructions, maxScore){
    // Update topic display to show activity
    var statusSection = topicEl.querySelector('div[style*="margin-top:8px;padding:8px;background:#f8f9fa"]');
    if (statusSection) {
        var activitiesSpan = statusSection.querySelector('span[style*="color:#6b7280;font-style:italic"]');
        if (activitiesSpan && activitiesSpan.textContent.includes('No activities')) {
            activitiesSpan.textContent = '1 activity: ' + escapeHtml(name);
        }
    }
    
    // Save to coordinator system
    saveActivityToCoordinator(topicEl, category, name, type, instructions, maxScore);
    
    // Show success notification
    if (typeof showNotification === 'function') {
        showNotification('success', 'Success', 'Activity "' + name + '" added to topic!');
    }
}

// ===== ADD ACTIVITY TO LESSON WITH DYNAMIC DATA =====
function addActivityToLessonWithData(lessonEl, category, name, type, instructions, maxScore, dynamicData){
    // Update lesson display to show activity with enhanced info
    var materialsSection = lessonEl.querySelector('div[style*="margin-top:4px;margin-left:12px;"]');
    if (materialsSection) {
        // Check if activities already exist
        var existingActivities = materialsSection.querySelectorAll('div[style*="font-size:11px;color:#495057;"]');
        var activityCount = existingActivities.length;
        
        // Create enhanced activity info
        var activityInfo = '• ' + type.replace('_', ' ').toUpperCase() + ': ' + escapeHtml(name);
        
        // Add dynamic data info
        if (dynamicData.questions && dynamicData.questions.length > 0) {
            activityInfo += '<br><small style="color:#64748b;">Questions: ' + dynamicData.questions.length + '</small>';
        }
        if (dynamicData.problem) {
            activityInfo += '<br><small style="color:#64748b;">Problem: ' + escapeHtml(dynamicData.problem.substring(0, 50)) + (dynamicData.problem.length > 50 ? '...' : '') + '</small>';
        }
        if (dynamicData.task) {
            activityInfo += '<br><small style="color:#64748b;">Task: ' + escapeHtml(dynamicData.task.substring(0, 50)) + (dynamicData.task.length > 50 ? '...' : '') + '</small>';
        }
        
        // Update materials section
        if (activityCount === 0) {
            // First activity - replace "No materials" with activities section
            materialsSection.innerHTML = '<div style="font-size:11px;color:#374151;font-weight:600;margin:2px 0 2px;">Activities (1)</div>' +
                '<div style="font-size:11px;color:#495057;padding:8px;background:#f0f9ff;border-radius:4px;border:1px solid #1d9b3e;margin-top:4px;">' + activityInfo + '</div>';
        } else {
            // Add to existing activities
            var activitiesHeader = materialsSection.querySelector('div[style*="font-size:11px;color:#374151;font-weight:600;"]');
            if (activitiesHeader) {
                activitiesHeader.textContent = 'Activities (' + (activityCount + 1) + ')';
            }
            
            // Add new activity
            var newActivityDiv = document.createElement('div');
            newActivityDiv.style.cssText = 'font-size:11px;color:#495057;padding:8px;background:#f0f9ff;border-radius:4px;border:1px solid #1d9b3e;margin-top:4px;';
            newActivityDiv.innerHTML = activityInfo;
            materialsSection.appendChild(newActivityDiv);
        }
    }
    
    // Save to coordinator system with dynamic data
    saveActivityToCoordinatorWithData(lessonEl, category, name, type, instructions, maxScore, dynamicData);
    
    // Show success notification
    if (typeof showNotification === 'function') {
        showNotification('success', 'Success', 'Activity "' + name + '" added to lesson!');
    }
}

// ===== ADD ACTIVITY TO TOPIC WITH DYNAMIC DATA =====
function addActivityToTopicWithData(topicEl, category, name, type, instructions, maxScore, dynamicData){
    // Update topic display to show activity with enhanced info
    var statusSection = topicEl.querySelector('div[style*="margin-top:8px;padding:8px;background:#f8f9fa"]');
    if (statusSection) {
        var activitiesSpan = statusSection.querySelector('span[style*="color:#6b7280;font-style:italic"]');
        if (activitiesSpan && activitiesSpan.textContent.includes('No activities')) {
            var activityText = '1 activity: ' + escapeHtml(name);
            if (dynamicData.questions && dynamicData.questions.length > 0) {
                activityText += ' (' + dynamicData.questions.length + ' questions)';
            }
            activitiesSpan.textContent = activityText;
        }
    }
    
    // Save to coordinator system with dynamic data
    saveActivityToCoordinatorWithData(topicEl, category, name, type, instructions, maxScore, dynamicData);
    
    // Show success notification
    if (typeof showNotification === 'function') {
        showNotification('success', 'Success', 'Activity "' + name + '" added to topic!');
    }
}

// ===== COMPLETE MATERIAL CREATION =====
function createCompleteMaterial(element, type, title, description, url, file){
    console.log('🚀 Creating complete material:', {type, title, description, url, file});
    
    // Determine if this is a lesson or topic
    var isLesson = element.classList.contains('lesson');
    var isTopic = element.classList.contains('topic-item');
    
    if (isLesson) {
        console.log('🚀 Adding material to lesson');
        addMaterialToLesson(element, type, title, description, url, file);
    } else if (isTopic) {
        console.log('🚀 Adding material to topic');
        addMaterialToTopic(element, type, title, description, url, file);
    }
}

// ===== ADD MATERIAL TO LESSON (ENHANCED) =====
function addMaterialToLesson(lessonEl, type, title, description, url, file){
    // Update lesson display to show material
    var materialsSection = lessonEl.querySelector('div[style*="margin-top:4px;margin-left:12px;"]');
    if (materialsSection) {
        // Check if materials already exist
        var existingMaterials = materialsSection.querySelectorAll('div[style*="font-size:11px;color:#495057;"]');
        var materialCount = existingMaterials.length;
        
        // Create new material info
        var materialInfo = '• ' + type.toUpperCase() + ': ' + escapeHtml(title);
        if (description) {
            materialInfo += '<br><small style="color:#64748b;">' + escapeHtml(description) + '</small>';
        }
        if (url) {
            materialInfo += '<br><small style="color:#64748b;">URL: ' + escapeHtml(url) + '</small>';
        }
        if (file) {
            materialInfo += '<br><small style="color:#64748b;">File: ' + escapeHtml(file.name) + ' (' + formatFileSize(file.size) + ')</small>';
        }
        
        // Update materials section
        if (materialCount === 0) {
            // First material - replace "No materials"
            materialsSection.innerHTML = '<div style="font-size:11px;color:#374151;font-weight:600;margin:2px 0 2px;">Materials (1)</div>' +
                '<div style="font-size:11px;color:#495057;">' + materialInfo + '</div>';
      } else {
            // Add to existing materials
            var materialsHeader = materialsSection.querySelector('div[style*="font-size:11px;color:#374151;font-weight:600;"]');
            if (materialsHeader) {
                materialsHeader.textContent = 'Materials (' + (materialCount + 1) + ')';
            }
            
            // Add new material
            var newMaterialDiv = document.createElement('div');
            newMaterialDiv.style.cssText = 'font-size:11px;color:#495057;';
            newMaterialDiv.innerHTML = materialInfo;
            materialsSection.appendChild(newMaterialDiv);
        }
    }
    
    // Save to coordinator system
    saveMaterialToCoordinator(lessonEl, type, title, description, url, file);
    
    // Show success notification
    if (typeof showNotification === 'function') {
        showNotification('success', 'Success', 'Material "' + title + '" added to lesson!');
    }
}

// ===== ADD MATERIAL TO TOPIC (ENHANCED) =====
function addMaterialToTopic(topicEl, type, title, description, url, file){
    // Update topic display to show material
    var statusSection = topicEl.querySelector('div[style*="margin-top:8px;padding:8px;background:#f8f9fa"]');
    if (statusSection) {
        var materialsSpan = statusSection.querySelector('span[style*="color:#6b7280;font-style:italic"]');
        if (materialsSpan && materialsSpan.textContent.includes('No materials')) {
            materialsSpan.textContent = '1 material: ' + escapeHtml(title);
        }
    }
    
    // Save to coordinator system
    saveMaterialToCoordinator(topicEl, type, title, description, url, file);
    
    // Show success notification
    if (typeof showNotification === 'function') {
        showNotification('success', 'Success', 'Material "' + title + '" added to topic!');
    }
}


// ===== !IMPORTANT FORCE FIX FUNCTION =====

// Add topic to module (creates a lesson first)
function showAddTopicToModuleModal(moduleEl){
    var moduleTitle = moduleEl.querySelector('span[style*="text-transform:uppercase"]');
    var title = moduleTitle ? moduleTitle.textContent.trim() : 'Module';
    
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:500px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<h3 style="margin:0 0 15px 0;color:#1d9b3e;font-weight:700;">Add Topic to "' + escapeHtml(title) + '"</h3>' +
        '<div style="margin-bottom:15px;">' +
            '<label style="display:block;margin-bottom:5px;color:#374151;font-weight:600;">Topic title:</label>' +
            '<input type="text" id="moduleTopicTitleInput" placeholder="Enter topic title..." style="width:100%;padding:8px 12px;border:1px solid #1d9b3e;border-radius:6px;font-size:14px;outline:none;" />' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
            '<button id="cancelModuleTopicBtn" style="background:#6b7280;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">Cancel</button>' +
            '<button id="addModuleTopicBtn" style="background:#1d9b3e;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">Add Topic</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Focus on input
    var input = modal.querySelector('#moduleTopicTitleInput');
    if (input) {
        input.focus();
        input.addEventListener('keypress', function(e){
            if (e.key === 'Enter') {
                modal.querySelector('#addModuleTopicBtn').click();
            }
        });
    }
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelModuleTopicBtn');
    var addBtn = modal.querySelector('#addModuleTopicBtn');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(){
            modal.remove();
        });
    }
    
    if (addBtn) {
        addBtn.addEventListener('click', function(){
            var title = input.value.trim();
            if (!title) {
                alert('Please enter a topic title.');
                return;
            }
            
            // Create a lesson first, then add the topic
            createNewLessonForTopic(moduleEl, title);
            modal.remove();
        });
    }
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Create new lesson for topic
function createNewLessonForTopic(moduleEl, topicTitle){
    var lessonId = 'new_lesson_' + Date.now();
    var lessonEl = document.createElement('div');
    lessonEl.className = 'lesson';
    lessonEl.setAttribute('data-lesson-id', lessonId);
    lessonEl.style.cssText = 'margin:8px 0;padding:10px;background:white;border:1px solid #e5e7eb;border-radius:6px;';
    
    lessonEl.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
        '<div style="font-weight:600;color:#374151;">' + escapeHtml(topicTitle) + '</div>' +
        '<div style="display:flex;gap:4px;">' +
            '<button class="add-activity-btn" data-action="add-activity" style="background:none;border:none;color:#1d9b3e;cursor:pointer;padding:4px;" title="Add activity">' +
                '<i class="fas fa-tasks"></i>' +
            '</button>' +
            '<button class="add-material-btn" data-action="add-material" style="background:none;border:none;color:#1d9b3e;cursor:pointer;padding:4px;font-size:14px;" title="Add material">' +
                '<i class="fas fa-file-plus" style="font-size:14px;"></i>' +
            '</button>' +
            '<button class="edit-topic-btn" style="background:none;border:none;color:#6b7280;cursor:pointer;padding:4px;" title="Edit topic">' +
                '<i class="fas fa-pencil-alt"></i>' +
            '</button>' +
            '<button class="delete-topic-btn" style="background:none;border:none;color:#ef4444;cursor:pointer;padding:4px;" title="Delete topic">' +
                '<i class="fas fa-trash"></i>' +
            '</button>' +
        '</div>' +
    '</div>' +
    '<div style="margin-top:4px;margin-left:12px;">' +
        '<div style="font-size:11px;color:#6c757d;margin-left:12px;">No materials</div>' +
    '</div>';
    
    // Add to module
    var moduleContent = moduleEl.querySelector('.module-content');
    if (moduleContent) {
        // Remove "No lessons" if it exists
        var noLessons = moduleContent.querySelector('div[style*="color:#9ca3af"]');
        if (noLessons) {
            noLessons.remove();
        }
        
        // Add lesson
        moduleContent.appendChild(lessonEl);
        
        // Update module header to show lesson count
        var moduleHeader = moduleEl.querySelector('.module-header');
        if (moduleHeader) {
            var existingLessons = moduleContent.querySelectorAll('.lesson');
            var lessonCount = existingLessons.length;
            
            // Update or add lesson count badge
            var countBadge = moduleHeader.querySelector('span[style*="font-size:11px"]');
            if (countBadge) {
                countBadge.textContent = lessonCount + ' lessons';
  } else {
                var newBadge = document.createElement('span');
                newBadge.style.cssText = 'font-size:11px;background:#eef2ff;color:#374151;border:1px solid #dbeafe;padding:1px 6px;border-radius:999px;';
                newBadge.textContent = lessonCount + ' lessons';
                moduleHeader.appendChild(newBadge);
            }
        }
    }
    
    // Initialize sortables
    initStep5Sortables();
    
    // Save draft
    try { saveStep5Draft(); } catch(_) {}
    
    // Show success notification
    if (typeof showNotification === 'function') {
        showNotification('success', 'Success', 'Topic "' + topicTitle + '" added to module!');
    }
}

// Edit module name
function editModuleName(moduleEl){
    var titleSpan = moduleEl.querySelector('span[style*="text-transform:uppercase"]');
    if (!titleSpan) return;
    
    var currentTitle = titleSpan.textContent.trim();
    var newTitle = prompt('Enter new module name:', currentTitle);
    
    if (newTitle && newTitle.trim() && newTitle.trim() !== currentTitle) {
        titleSpan.textContent = newTitle.trim().toUpperCase();
        try { saveStep5Draft(); } catch(_) {}
        
        if (typeof showNotification === 'function') {
            showNotification('success', 'Success', 'Module name updated!');
        }
    }
}

// Edit lesson name
function editLessonName(lessonEl){
    var titleDiv = lessonEl.querySelector('div[style*="font-weight:600;color:#374151;"]');
    if (!titleDiv) return;
    
    var currentTitle = titleDiv.textContent.trim();
    var newTitle = prompt('Enter new lesson name:', currentTitle);
    
    if (newTitle && newTitle.trim() && newTitle.trim() !== currentTitle) {
        titleDiv.textContent = newTitle.trim();
        try { saveStep5Draft(); } catch(_) {}
        
        if (typeof showNotification === 'function') {
            showNotification('success', 'Success', 'Lesson name updated!');
        }
    }
}

// Ensure all lessons have proper buttons
function ensureLessonButtons(){
    var lessons = document.querySelectorAll('.lesson');
    lessons.forEach(function(lessonEl){
        // Check if lesson has old format (with add-buttons at bottom)
        var oldButtons = lessonEl.querySelector('.add-buttons');
        if (oldButtons) {
            // Convert old format to new format
            var titleDiv = lessonEl.querySelector('div[style*="font-weight:600"]');
            if (titleDiv) {
                // Create new header with buttons
                var newHeader = document.createElement('div');
                newHeader.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;';
                newHeader.innerHTML = '<div style="font-weight:600;color:#374151;">' + titleDiv.textContent + '</div>' +
                    '<div style="display:flex;gap:8px;">' +
                        '<button class="add-material-btn" data-action="add-material" style="background:#1d9b3e;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Add material">' +
                            '<i class="fas fa-paperclip" style="font-size:12px;"></i>Material' +
                        '</button>' +
                        '<button class="add-activity-btn" data-action="add-activity" style="background:#1d9b3e;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Add activity">' +
                            '<i class="fas fa-list" style="font-size:12px;"></i>Activity' +
                        '</button>' +
                        '<button class="edit-lesson-btn" data-action="edit-lesson" style="background:#6b7280;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Edit lesson">' +
                            '<i class="fas fa-pencil-alt" style="font-size:12px;"></i>Edit' +
                        '</button>' +
                        '<button class="delete-lesson-btn" data-action="delete-lesson" style="background:#ef4444;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Delete lesson">' +
                            '<i class="fas fa-trash" style="font-size:12px;"></i>Delete' +
                        '</button>' +
                    '</div>';
                
                // Replace the old header with new one
                var oldHeader = lessonEl.querySelector('div[style*="display:flex;align-items:center;justify-content:space-between"]');
                if (oldHeader) {
                    oldHeader.replaceWith(newHeader);
                }
                
                // Remove old buttons
                oldButtons.remove();
            }
        }
        
        // Check if lesson has new format but missing buttons
        var buttonContainer = lessonEl.querySelector('div[style*="display:flex;gap:4px;"]');
        if (buttonContainer) {
            // Check if add-material button exists
            var materialBtn = buttonContainer.querySelector('.add-material-btn');
            if (!materialBtn) {
                // Add the missing material button
                var activityBtn = buttonContainer.querySelector('.add-activity-btn');
                if (activityBtn) {
                    var materialBtnHtml = '<button class="add-material-btn" data-action="add-material" style="background:#1d9b3e;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Add material">' +
                        '<i class="fas fa-paperclip" style="font-size:12px;"></i>Material' +
                    '</button>';
                    activityBtn.insertAdjacentHTML('afterend', materialBtnHtml);
                }
            }
        }
    });
}

// Initialize recent list on load
loadRecentSnippets();

// Ensure lesson buttons are properly set up
document.addEventListener('DOMContentLoaded', function(){
    ensureLessonButtons();
});

// Also run when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureLessonButtons);
} else {
    ensureLessonButtons();
}

// Force run the conversion immediately
setTimeout(ensureLessonButtons, 100);
setTimeout(ensureLessonButtons, 500);
setTimeout(ensureLessonButtons, 1000);

// Add debugging and force conversion
console.log('🔧 Running lesson button conversion...');
setTimeout(function(){
    console.log('🔧 Checking lessons...');
    var lessons = document.querySelectorAll('.lesson');
    console.log('🔧 Found lessons:', lessons.length);
    
    lessons.forEach(function(lessonEl, index){
        console.log('🔧 Lesson', index, ':', lessonEl);
        var hasButtons = lessonEl.querySelector('div[style*="display:flex;gap:8px;"]');
        console.log('🔧 Has buttons:', !!hasButtons);
        
        if (!hasButtons) {
            console.log('🔧 Converting lesson', index);
            // Force convert this lesson
            var titleDiv = lessonEl.querySelector('div[style*="font-weight:600"]');
            if (titleDiv) {
                console.log('🔧 Found title:', titleDiv.textContent);
                // Create new header with buttons
                var newHeader = document.createElement('div');
                newHeader.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;';
                newHeader.innerHTML = '<div style="font-weight:600;color:#374151;">' + titleDiv.textContent + '</div>' +
                    '<div style="display:flex;gap:8px;">' +
                        '<button class="add-material-btn" data-action="add-material" style="background:#1d9b3e;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Add material">' +
                            '<i class="fas fa-paperclip" style="font-size:12px;"></i>Material' +
                        '</button>' +
                        '<button class="add-activity-btn" data-action="add-activity" style="background:#1d9b3e;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Add activity">' +
                            '<i class="fas fa-list" style="font-size:12px;"></i>Activity' +
                        '</button>' +
                        '<button class="edit-lesson-btn" data-action="edit-lesson" style="background:#6b7280;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Edit lesson">' +
                            '<i class="fas fa-pencil-alt" style="font-size:12px;"></i>Edit' +
                        '</button>' +
                        '<button class="delete-lesson-btn" data-action="delete-lesson" style="background:#ef4444;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Delete lesson">' +
                            '<i class="fas fa-trash" style="font-size:12px;"></i>Delete' +
                        '</button>' +
                    '</div>';
                
                // Replace the old header with new one
                var oldHeader = lessonEl.querySelector('div[style*="display:flex"]');
                if (oldHeader) {
                    console.log('🔧 Replacing old header');
                    oldHeader.replaceWith(newHeader);
                } else {
                    console.log('🔧 Adding new header');
                    lessonEl.insertBefore(newHeader, lessonEl.firstChild);
                }
                
                // Remove old buttons if they exist
                var oldButtons = lessonEl.querySelector('.add-buttons');
                if (oldButtons) {
                    console.log('🔧 Removing old buttons');
                    oldButtons.remove();
                }
            }
        }
    });
}, 2000);

// Manual trigger function for debugging
window.forceLessonButtons = function(){
    console.log('🔧 Manual trigger: Converting lesson buttons...');
    var lessons = document.querySelectorAll('.lesson');
    console.log('🔧 Found lessons:', lessons.length);
    
    lessons.forEach(function(lessonEl, index){
        console.log('🔧 Processing lesson', index);
        
        // Check if lesson has buttons
        var hasButtons = lessonEl.querySelector('div[style*="display:flex;gap:8px;"]');
        if (!hasButtons) {
            console.log('🔧 Converting lesson', index);
            
            // Find title
            var titleDiv = lessonEl.querySelector('div[style*="font-weight:600"]');
            if (!titleDiv) {
                // Try alternative selectors
                titleDiv = lessonEl.querySelector('div[style*="font-weight"]');
            }
            
            if (titleDiv) {
                console.log('🔧 Found title:', titleDiv.textContent);
                
                // Create new header with buttons
                var newHeader = document.createElement('div');
                newHeader.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;';
                newHeader.innerHTML = '<div style="font-weight:600;color:#374151;">' + titleDiv.textContent + '</div>' +
                    '<div style="display:flex;gap:8px;">' +
                        '<button class="add-material-btn" data-action="add-material" style="background:#1d9b3e;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Add material">' +
                            '<i class="fas fa-paperclip" style="font-size:12px;"></i>Material' +
                        '</button>' +
                        '<button class="add-activity-btn" data-action="add-activity" style="background:#1d9b3e;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Add activity">' +
                            '<i class="fas fa-list" style="font-size:12px;"></i>Activity' +
                        '</button>' +
                        '<button class="edit-lesson-btn" data-action="edit-lesson" style="background:#6b7280;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Edit lesson">' +
                            '<i class="fas fa-pencil-alt" style="font-size:12px;"></i>Edit' +
                        '</button>' +
                        '<button class="delete-lesson-btn" data-action="delete-lesson" style="background:#ef4444;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Delete lesson">' +
                            '<i class="fas fa-trash" style="font-size:12px;"></i>Delete' +
                        '</button>' +
                    '</div>';
                
                // Replace the old header
                var oldHeader = lessonEl.querySelector('div[style*="display:flex"]');
                if (oldHeader) {
                    console.log('🔧 Replacing old header');
                    oldHeader.replaceWith(newHeader);
  } else {
                    console.log('🔧 Adding new header');
                    lessonEl.insertBefore(newHeader, lessonEl.firstChild);
                }
                
                // Remove old buttons
                var oldButtons = lessonEl.querySelector('.add-buttons');
                if (oldButtons) {
                    console.log('🔧 Removing old buttons');
                    oldButtons.remove();
                }
                
                console.log('🔧 Lesson', index, 'converted successfully');
            } else {
                console.log('🔧 No title found for lesson', index);
            }
        } else {
            console.log('🔧 Lesson', index, 'already has buttons');
        }
    });
    
        console.log('🔧 Manual conversion complete');
    };

// ===== DEBUGGING FUNCTIONS =====
window.testTopicCreation = function(){
    console.log('🔧 Testing topic creation...');
    
    // Find first lesson
    var lesson = document.querySelector('.lesson');
    if (!lesson) {
        console.log('🔧 No lesson found! Create a lesson first.');
        return;
    }
    
    console.log('🔧 Found lesson:', lesson);
    
    // Test creating a topic
    createNewTopic(lesson, 'TEST TOPIC');
    console.log('🔧 Topic creation test complete');
};

// ===== FIX EXISTING TOPICS =====
window.fixExistingTopics = function(){
    console.log('🔧 Fixing existing topics...');
    
    var topics = document.querySelectorAll('.topic-item');
    console.log('🔧 Found topics:', topics.length);
    
    topics.forEach(function(topic, index){
        console.log('🔧 Processing topic', index, ':', topic);
        
        // Check if topic has Material button
        var materialBtn = topic.querySelector('.add-material-btn');
        if (!materialBtn) {
            console.log('🔧 Topic', index, 'missing Material button, adding it...');
            
            // Find the button container
            var buttonContainer = topic.querySelector('div[style*="display:flex;gap:8px;"]');
            if (buttonContainer) {
                // Add Material button as first button
                var materialBtnHtml = '<button class="add-material-btn" data-action="add-material" style="background:none;border:none;color:#1d9b3e;cursor:pointer;padding:4px;" title="Add material">' +
                    '<i class="fas fa-paperclip" style="font-size:16px;"></i>' +
                '</button>';
                
                // Insert at the beginning
                buttonContainer.insertAdjacentHTML('afterbegin', materialBtnHtml);
                
                // Add event listener
                var newMaterialBtn = topic.querySelector('.add-material-btn');
                if (newMaterialBtn) {
                    newMaterialBtn.addEventListener('click', function(){
                        console.log('🔧 Material button clicked for existing topic');
                        var topicTitle = topic.querySelector('div[style*="font-weight:600"]').textContent.trim();
                        if (typeof showCoordinatorMaterialModal === 'function') {
                            showCoordinatorMaterialModal(topic, topicTitle);
                        } else {
                            alert('Material functionality not available yet');
                        }
                    });
                }
                
                console.log('🔧 Added Material button to topic', index);
            } else {
                console.log('🔧 No button container found for topic', index);
            }
        } else {
            console.log('🔧 Topic', index, 'already has Material button');
        }
    });
    
    console.log('🔧 Fix complete');
};

// ===== CHECK FONTAWESOME =====
window.checkFontAwesome = function(){
    console.log('🔧 Checking FontAwesome...');
    
    // Check if FontAwesome CSS is loaded
    var faCSS = document.querySelector('link[href*="fontawesome"]') || document.querySelector('link[href*="font-awesome"]');
    console.log('🔧 FontAwesome CSS loaded:', !!faCSS);
    
    // Check if FontAwesome JS is loaded
    var faJS = document.querySelector('script[src*="fontawesome"]') || document.querySelector('script[src*="font-awesome"]');
    console.log('🔧 FontAwesome JS loaded:', !!faJS);
    
    // Test if icons work
    var testDiv = document.createElement('div');
    testDiv.innerHTML = '<i class="fas fa-paperclip"></i>';
    document.body.appendChild(testDiv);
    
    var computedStyle = window.getComputedStyle(testDiv.querySelector('i'));
    var fontFamily = computedStyle.fontFamily;
    console.log('🔧 Icon font family:', fontFamily);
    console.log('🔧 FontAwesome working:', fontFamily.includes('Font Awesome') || fontFamily.includes('FontAwesome'));
    
    testDiv.remove();
    
    // Check if specific icons exist
    var materialIcon = document.querySelector('.fa-paperclip');
    var activityIcon = document.querySelector('.fa-tasks');
    console.log('🔧 Material icon in DOM:', !!materialIcon);
    console.log('🔧 Activity icon in DOM:', !!activityIcon);
};

// ===== INSPECT EXISTING TOPIC =====
window.inspectTopic = function(topicName){
    console.log('🔧 Inspecting topic:', topicName);
    
    var topics = document.querySelectorAll('.topic-item');
    var targetTopic = null;
    
    topics.forEach(function(topic, index){
        var titleDiv = topic.querySelector('div[style*="font-weight:600"]');
        if (titleDiv && titleDiv.textContent.trim() === topicName) {
            targetTopic = topic;
            console.log('🔧 Found topic at index:', index);
        }
    });
    
    if (!targetTopic) {
        console.log('🔧 Topic not found!');
        return;
    }
    
    console.log('🔧 Topic HTML:', targetTopic.innerHTML);
    
    // Check buttons
    var buttons = targetTopic.querySelectorAll('button');
    console.log('🔧 Number of buttons:', buttons.length);
    
    buttons.forEach(function(btn, index){
        console.log('🔧 Button', index, ':', btn.className, btn.title);
        var icon = btn.querySelector('i');
        if (icon) {
            console.log('🔧 Icon classes:', icon.className);
        }
    });
    
    // Check specifically for Material button
    var materialBtn = targetTopic.querySelector('.add-material-btn');
    console.log('🔧 Material button found:', !!materialBtn);
    
    if (materialBtn) {
        console.log('🔧 Material button HTML:', materialBtn.outerHTML);
        var materialIcon = materialBtn.querySelector('.fa-paperclip');
        console.log('🔧 Material icon found:', !!materialIcon);
    }
};

window.testFullFlow = function(){
    console.log('🔧 Testing full flow...');
    
    // Step 1: Create module
    console.log('🔧 Step 1: Creating module...');
    createNewModule('TEST MODULE');
    
    // Step 2: Create lesson
    setTimeout(function(){
        console.log('🔧 Step 2: Creating lesson...');
        var module = document.querySelector('.module');
        if (module) {
            createNewLesson(module, 'TEST LESSON');
        }
    }, 1000);
    
    // Step 3: Create topic
    setTimeout(function(){
        console.log('🔧 Step 3: Creating topic...');
        var lesson = document.querySelector('.lesson');
        if (lesson) {
            createNewTopic(lesson, 'TEST TOPIC');
        }
    }, 2000);
};

// ===== TEST MATERIAL ICON =====
window.testMaterialIcon = function(){
    console.log('🔧 Testing Material icon...');
    
    // Find any existing topic
    var topic = document.querySelector('.topic-item');
    if (topic) {
        console.log('🔧 Found existing topic:', topic);
        var materialBtn = topic.querySelector('.add-material-btn');
        var materialIcon = topic.querySelector('.fa-paperclip');
        console.log('🔧 Material button found:', !!materialBtn);
        console.log('🔧 Material icon found:', !!materialIcon);
        
        if (materialBtn) {
            console.log('🔧 Material button HTML:', materialBtn.outerHTML);
        }
    } else {
        console.log('🔧 No existing topics found');
    }
};

// ===== !IMPORTANT FORCE FIX FUNCTION =====
window.FORCE_FIX_ALL_BUTTONS = function(){
    console.log('🚨 !IMPORTANT: FORCE FIXING ALL BUTTONS...');
    
    // Step 1: Fix ALL lessons to have proper buttons
    var lessons = document.querySelectorAll('.lesson');
    console.log('🚨 Found lessons:', lessons.length);
    
    lessons.forEach(function(lesson, index){
        console.log('🚨 Processing lesson', index);
        
        // Check if lesson has the old format
        var hasOldFormat = lesson.querySelector('div[style*="display:flex;align-items:center;justify-content:space-between"]');
        var hasNewFormat = lesson.querySelector('div[style*="display:flex;gap:8px;"]');
        
        console.log('🚨 Lesson', index, 'has old format:', !!hasOldFormat);
        console.log('🚨 Lesson', index, 'has new format:', !!hasNewFormat);
        
        if (hasOldFormat && !hasNewFormat) {
            console.log('🚨 Converting lesson', index, 'to new format...');
            
            // Get the title
            var titleDiv = lesson.querySelector('div[style*="font-weight:600"]');
            var title = titleDiv ? titleDiv.textContent.trim() : 'Lesson';
            
            // Create new header with ALL buttons
            var newHeader = document.createElement('div');
            newHeader.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;';
            newHeader.innerHTML = '<div style="font-weight:600;color:#374151;">' + title + '</div>' +
                '<div style="display:flex;gap:8px;">' +
                    '<button class="add-topic-btn" data-action="add-topic" style="background:#10b981;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Add topic">' +
                        '<i class="fas fa-plus" style="font-size:12px;"></i>Topic' +
                    '</button>' +
                    '<button class="add-material-btn" data-action="add-material" style="background:#1d9b3e;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Add material">' +
                        '<i class="fas fa-paperclip" style="font-size:12px;"></i>Material' +
                    '</button>' +
                    '<button class="add-activity-btn" data-action="add-activity" style="background:#1d9b3e;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Add activity">' +
                        '<i class="fas fa-list" style="font-size:12px;"></i>Activity' +
                    '</button>' +
                    '<button class="edit-lesson-btn" data-action="edit-lesson" style="background:#6b7280;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Edit lesson">' +
                        '<i class="fas fa-pencil-alt" style="font-size:12px;"></i>Edit' +
                    '</button>' +
                    '<button class="delete-lesson-btn" data-action="delete-lesson" style="background:#ef4444;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Delete lesson">' +
                        '<i class="fas fa-trash" style="font-size:12px;"></i>Delete' +
                    '</button>' +
                '</div>';
            
            // Replace the old header
            hasOldFormat.replaceWith(newHeader);
            
            // Remove old buttons if they exist
            var oldButtons = lesson.querySelector('.add-buttons');
            if (oldButtons) {
                oldButtons.remove();
            }
            
            console.log('🚨 Lesson', index, 'converted successfully');
        }
    });
    
    // Step 2: Fix ALL topics to have Material button
    var topics = document.querySelectorAll('.topic-item');
    console.log('🚨 Found topics:', topics.length);
    
    topics.forEach(function(topic, index){
        console.log('🚨 Processing topic', index);
        
        // Check if topic has Material button
        var materialBtn = topic.querySelector('.add-material-btn');
        if (!materialBtn) {
            console.log('🚨 Topic', index, 'missing Material button, FORCE ADDING...');
            
            // Find button container
            var buttonContainer = topic.querySelector('div[style*="display:flex;gap:8px;"]');
            if (buttonContainer) {
                // Add Material button as FIRST button
                var materialBtnHtml = '<button class="add-material-btn" data-action="add-material" style="background:none;border:none;color:#1d9b3e;cursor:pointer;padding:4px;" title="Add material">' +
                    '<i class="fas fa-paperclip" style="font-size:16px;"></i>' +
                '</button>';
                
                buttonContainer.insertAdjacentHTML('afterbegin', materialBtnHtml);
                
                // Add event listener
                var newMaterialBtn = topic.querySelector('.add-material-btn');
                if (newMaterialBtn) {
                    newMaterialBtn.addEventListener('click', function(){
                        console.log('🚨 Material button clicked!');
                        var topicTitle = topic.querySelector('div[style*="font-weight:600"]').textContent.trim();
                        if (typeof showCoordinatorMaterialModal === 'function') {
                            showCoordinatorMaterialModal(topic, topicTitle);
                        } else {
                            alert('Material functionality not available yet');
                        }
                    });
                }
                
                console.log('🚨 Material button FORCE ADDED to topic', index);
            }
        } else {
            console.log('🚨 Topic', index, 'already has Material button');
        }
    });
    
    // Step 3: Force refresh all event listeners
    console.log('🚨 Refreshing all event listeners...');
    
    // Re-attach all click handlers
    document.addEventListener('click', function(e){
        var t = e.target;
        if (t.getAttribute('data-action') === 'add-material') {
            console.log('🚨 Material button clicked via event delegation!');
            var lessonEl = t.closest('.lesson');
            var topicEl = t.closest('.topic-item');
            if (lessonEl) {
                showCoordinatorMaterialModal(lessonEl, 'Lesson');
            } else if (topicEl) {
                var topicTitle = topicEl.querySelector('div[style*="font-weight:600"]').textContent.trim();
                showCoordinatorMaterialModal(topicEl, topicTitle);
            }
        }
    });
    
    console.log('🚨 !IMPORTANT FIX COMPLETE!');
    console.log('🚨 All lessons and topics should now have Material buttons!');
};

// Test function to check button functionality
window.testLessonButtons = function(){
    console.log('🔧 Testing lesson buttons...');
    var lessons = document.querySelectorAll('.lesson');
    console.log('🔧 Found lessons:', lessons.length);
    
    lessons.forEach(function(lessonEl, index){
        console.log('🔧 Testing lesson', index);
        
        // Check for buttons
        var materialBtn = lessonEl.querySelector('.add-material-btn');
        var activityBtn = lessonEl.querySelector('.add-activity-btn');
        var editBtn = lessonEl.querySelector('.edit-lesson-btn');
        var deleteBtn = lessonEl.querySelector('.delete-lesson-btn');
        
        console.log('🔧 Material button:', !!materialBtn, materialBtn);
        console.log('🔧 Activity button:', !!activityBtn, activityBtn);
        console.log('🔧 Edit button:', !!editBtn, editBtn);
        console.log('🔧 Delete button:', !!deleteBtn, deleteBtn);
        
        // Test click events
        if (materialBtn) {
            console.log('🔧 Testing material button click...');
            materialBtn.click();
        }
        
        if (activityBtn) {
            console.log('🔧 Testing activity button click...');
            activityBtn.click();
        }
    });
    
    console.log('🔧 Button test complete');
};



