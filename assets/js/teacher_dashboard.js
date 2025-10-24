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
			// REMOVED: bindCreateClassControls() - already called on page load
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
		tile.style.cssText = 'background:white;border:2px dashed #1d9b3e;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:200px;transition:all 0.3s ease;border-radius:16px;position:relative;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.1);padding:24px;margin-bottom:20px;height:200px;';
		tile.innerHTML = [
			'<div style="text-align:center;color:#1d9b3e;position:relative;z-index:2;height:100%;display:flex;flex-direction:column;justify-content:center;">',
				'<div style="background:#1d9b3e;width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 4px 12px rgba(29,155,62,0.3);">',
					'<i class="fas fa-plus" style="font-size:24px;color:white;font-weight:300;"></i>',
				'</div>',
				'<h3 style="margin:0 0 8px 0;font-size:20px;font-weight:700;color:#374151;">Create New Class</h3>',
				'<p style="margin:0 0 16px 0;font-size:14px;color:#6b7280;font-weight:500;">Start a new learning journey</p>',
				'<div style="background:#1d9b3e;color:white;padding:6px 12px;border-radius:16px;font-size:11px;font-weight:600;display:inline-block;">',
					'Click to begin',
				'</div>',
			'</div>'
		].join('');
		
		tile.addEventListener('click', function(){ if (typeof openForm === 'function') openForm(); });
		
		// Add hover effects
		tile.addEventListener('mouseenter', function(){
			this.style.transform = 'translateY(-8px) scale(1.02)';
			this.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
			this.style.borderColor = '#28a745';
		});
		
		tile.addEventListener('mouseleave', function(){
			this.style.transform = 'translateY(0) scale(1)';
			this.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
			this.style.borderColor = '#1d9b3e';
		});
		
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
            card.style.cssText = 'cursor:pointer;background:linear-gradient(135deg,#1d9b3e 0%,#28a745 100%);border-radius:16px;padding:24px;margin-bottom:20px;box-shadow:0 8px 32px rgba(29,155,62,0.15);transition:all 0.3s ease;position:relative;overflow:hidden;height:200px;';
            card.setAttribute('data-class-id', cls.id);
            
            // Add hover effects
            card.addEventListener('mouseenter', function(){
                this.style.transform = 'translateY(-8px) scale(1.02)';
                this.style.boxShadow = '0 20px 40px rgba(29,155,62,0.25)';
            });
            
            card.addEventListener('mouseleave', function(){
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '0 8px 32px rgba(29,155,62,0.15)';
            });
            
			card.innerHTML = [
                '<div style="position:relative;z-index:2;">',
                    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">',
                        '<div style="flex:1;">',
                            '<h3 style="color:white;font-size:24px;font-weight:700;margin:0 0 8px 0;text-shadow:0 2px 4px rgba(0,0,0,0.3);">' + (cls.name || 'Untitled Class') + '</h3>',
                            '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">',
                                '<span style="background:#ffffff;color:#1d9b3e;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:600;box-shadow:0 4px 12px rgba(255,255,255,0.3);">ACTIVE</span>',
				'</div>',
                        '</div>',
                        '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">',
                            '<div style="display:flex;gap:6px;">',
                                '<button style="background:rgba(255,255,255,0.2);color:white;border:none;padding:8px;border-radius:8px;cursor:pointer;font-size:12px;backdrop-filter:blur(10px);transition:all 0.2s;" title="Enter Class" onclick="enterClass(' + cls.id + ')">',
                                    '<i class="fas fa-door-open"></i>',
                                '</button>',
                                '<button style="background:rgba(255,255,255,0.2);color:white;border:none;padding:8px;border-radius:8px;cursor:pointer;font-size:12px;backdrop-filter:blur(10px);transition:all 0.2s;" title="Class Settings">',
                                    '<i class="fas fa-cog"></i>',
                                '</button>',
                            '</div>',
                        '</div>',
                    '</div>',
                    '<div style="display:flex;justify-content:space-between;align-items:center;color:rgba(255,255,255,0.9);font-size:14px;">',
                        '<div style="display:flex;align-items:center;gap:16px;">',
                            '<div style="display:flex;align-items:center;gap:6px;">',
                                '<i class="fas fa-users" style="font-size:14px;"></i>',
                                '<span>0 Students</span>',
                            '</div>',
                            '<div style="display:flex;align-items:center;gap:6px;">',
                                '<i class="fas fa-book" style="font-size:14px;"></i>',
                                '<span>0 Modules</span>',
                            '</div>',
                        '</div>',
                        '<div style="display:flex;align-items:center;gap:6px;color:rgba(255,255,255,0.7);font-size:12px;">',
                            '<i class="fas fa-clock"></i>',
                            '<span>Created recently</span>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div style="position:absolute;top:0;right:0;width:100px;height:100px;background:rgba(255,255,255,0.1);border-radius:50%;transform:translate(30px,-30px);"></div>',
                '<div style="position:absolute;bottom:0;left:0;width:60px;height:60px;background:rgba(255,255,255,0.05);border-radius:50%;transform:translate(-20px,20px);"></div>'
			].join('');
			
			// Add click event handler
			card.addEventListener('click', function(e) {
				e.preventDefault();
				var classId = this.getAttribute('data-class-id');
				if (classId) {
					enterClass(classId);
				}
			});
			
			// Add hover effects
			card.addEventListener('mouseenter', function() {
				this.style.transform = 'translateY(-2px)';
				this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
			});
			
			card.addEventListener('mouseleave', function() {
				this.style.transform = 'translateY(0)';
				this.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
			});
			
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
			bindMyClassesNavExit();
		});
	} else {
  loadActiveClasses();
		ensureCreateTile();
		bindCreateClassControls();
		loadPublishedCoursesForCreate();
		bindMyClassesNavExit();
	}

	// Expose for manual refresh if needed
	window.__teacherLoadActive = loadActiveClasses;
	
	// Function to enter a class
	function enterClass(classId) {
		// Set global class ID for teacher module creation
		window.currentClassId = classId;
		document.body.setAttribute('data-class-id', classId);
		// Try to open inside My Classes via iframe container
		var container = document.getElementById('classDetailContainer');
		var frame = document.getElementById('classDetailFrame');
		var grid = document.querySelector('.classes-grid');
		var sectionTitle = document.querySelector('#my-classes .section-title');
		var activeHeader = document.querySelector('.active-classes-header');
		if (container && frame) {
			if (grid) grid.style.display = 'none';
			if (sectionTitle) sectionTitle.style.display = 'none';
			if (activeHeader) activeHeader.style.display = 'none';
			container.classList.add('full-bleed');
			container.style.display = 'block';
			frame.src = 'class_dashboard.php?class_id=' + encodeURIComponent(classId) + '&embedded=1';
		} else {
			// Fallback: full page navigation
			window.location.href = 'class_dashboard.php?class_id=' + classId;
		}
	}

	// Expose back handler for embedded class view
	window.exitEmbeddedClass = function() {
		var container = document.getElementById('classDetailContainer');
		var frame = document.getElementById('classDetailFrame');
		var grid = document.querySelector('.classes-grid');
		var sectionTitle = document.querySelector('#my-classes .section-title');
		var activeHeader = document.querySelector('.active-classes-header');
		if (container) container.style.display = 'none';
		if (container) container.classList.remove('full-bleed');
		if (frame) frame.src = '';
		if (grid) grid.style.display = '';
		if (sectionTitle) sectionTitle.style.display = '';
		if (activeHeader) activeHeader.style.display = '';
	};



	// Expose open handler for inline buttons
	window.enterClass = enterClass;
})();

// Bind click on "My Classes" in sidebar to exit embedded view if open
function bindMyClassesNavExit(){
  try {
    var items = document.querySelectorAll('#sidebar .nav-item');
    items && items.forEach(function(li){
      var label = (li.textContent || '').trim().toLowerCase();
      if (label === 'my classes') {
        li.addEventListener('click', function(){
          if (typeof window.exitEmbeddedClass === 'function') {
            window.exitEmbeddedClass();
          }
        });
      }
    });
  } catch(_) {}
}

// ===== Create Class controls (moved) =====
function bindCreateClassControls(){
	// Prevent multiple event listener attachments
	if (window.createClassControlsBound) return;
	window.createClassControlsBound = true;
	
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
			if (!name) { showWarning('Validation Error', 'Please enter a class name.'); return; }
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
						showError('Class Creation Failed', (d && d.message) || 'Failed to create class');
					}
				})
				.catch(function(){ showError('Network Error', 'Network error occurred.'); });
		});
	}
}

// Attach handlers to material action buttons
function wireMaterialItemEvents(itemDiv){
    var downloadBtn = itemDiv.querySelector('.download-material-btn');
    var editBtn = itemDiv.querySelector('.edit-material-btn');
    var deleteBtn = itemDiv.querySelector('.delete-material-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e){
            var materialId = itemDiv.getAttribute('data-material-id');
            var url = itemDiv.getAttribute('data-url');
            var type = itemDiv.getAttribute('data-type');
            var filename = itemDiv.getAttribute('data-filename');
            
            if (materialId) {
                // Use material viewer instead of direct download
                const materialData = {
                    id: materialId,
                    url: 'material_download.php?id=' + encodeURIComponent(materialId),
                    filename: itemDiv.getAttribute('data-filename') || 'Material',
                    type: type
                };
                
                // Check if openMaterialViewer function exists
                if (typeof openMaterialViewer === 'function') {
                    openMaterialViewer(materialData);
                } else if (typeof window.openMaterialViewer === 'function') {
                    window.openMaterialViewer(materialData);
                } else {
                    window.open('material_download.php?id=' + encodeURIComponent(materialId), '_blank');
                }
            } else if (url) {
                // Use material viewer for external links
                if (typeof showLinkViewer === 'function') {
                    showLinkViewer(url);
                } else if (typeof window.showLinkViewer === 'function') {
                    window.showLinkViewer(url);
                } else {
                    // Fallback to opening in new tab
                    window.open(url, '_blank');
                }
            } else {
                showWarning('File Not Ready', 'File is not available yet. Please try again shortly.');
            }
        });
    }

    if (editBtn) {
        editBtn.addEventListener('click', function(){
            var materialId = itemDiv.getAttribute('data-material-id');
            var type = (itemDiv.getAttribute('data-type') || '').toLowerCase();
            if (!materialId) { showWarning('Material Not Saved', 'Please wait until the material is saved.'); return; }
            if (type !== 'link') { showWarning('Edit Not Allowed', 'Only external links can be edited here.'); return; }
            var currentUrl = itemDiv.getAttribute('data-url') || '';
            // Professional modal instead of prompt
            var overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
            overlay.innerHTML = '<div style="background:#ffffff;border-radius:12px;padding:20px;max-width:520px;width:94%;box-shadow:0 12px 30px rgba(0,0,0,0.2);">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid #e5e7eb;padding-bottom:10px;">' +
                    '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Edit Link</h3>' +
                    '<button id="closeEditLink" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280">&times;</button>' +
                '</div>' +
                '<label style="display:block;margin:0 0 6px;color:#374151;font-weight:600;">URL</label>' +
                '<input id="editLinkInput" type="url" value="' + escapeHtml(currentUrl) + '" placeholder="https://example.com" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;outline:none;" />' +
                '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">' +
                    '<button id="cancelEditLink" style="background:#6b7280;color:#fff;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;">Cancel</button>' +
                    '<button id="saveEditLink" style="background:#1d9b3e;color:#fff;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;">Save</button>' +
                '</div>' +
            '</div>';
            document.body.appendChild(overlay);
            var input = overlay.querySelector('#editLinkInput'); if (input) input.select();
            function close(){ if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); }
            overlay.addEventListener('click', function(e){ if (e.target === overlay) close(); });
            overlay.querySelector('#closeEditLink').onclick = close;
            overlay.querySelector('#cancelEditLink').onclick = close;
            overlay.querySelector('#saveEditLink').onclick = function(){
                var newUrl = (input.value || '').trim();
                if (!newUrl) { close(); return; }
                var form = new FormData();
                form.append('action', 'material_update');
                form.append('material_id', materialId);
                form.append('url', newUrl);
                if (typeof getCSRFToken === 'function') {
                    getCSRFToken().then(function(token){ if (token) form.append('csrf_token', token); submitMaterialUpdate(form, itemDiv, newUrl); });
                } else {
                    submitMaterialUpdate(form, itemDiv, newUrl);
                }
                close();
            };
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', function(){
            // Professional confirm modal
            showConfirm('Delete Material', 'Are you sure you want to delete this material?', function(){
            var materialId = itemDiv.getAttribute('data-material-id');
            if (!materialId) { itemDiv.remove(); return; }
            var form = new FormData();
            form.append('action', 'material_delete');
            form.append('material_id', materialId);
            if (typeof getCSRFToken === 'function') {
                getCSRFToken().then(function(token){ if (token) form.append('csrf_token', token); fetch('teacher_materials_api.php', { method:'POST', body: form, credentials:'same-origin' }).then(function(r){return r.json();}).then(function(d){ if (d && d.success){ itemDiv.remove(); showSuccess('Deleted','Material deleted.'); } else { showError('Delete Failed', 'Failed to delete material.'); } }); });
            } else {
                fetch('teacher_materials_api.php', { method:'POST', body: form, credentials:'same-origin' }).then(function(r){return r.json();}).then(function(d){ if (d && d.success){ itemDiv.remove(); showSuccess('Deleted','Material deleted.'); } else { showError('Delete Failed', 'Failed to delete material.'); } });
            }
            });
        });
    }
}

function submitMaterialUpdate(form, itemDiv, newUrl){
    fetch('teacher_materials_api.php', { method:'POST', body: form, credentials:'same-origin' })
        .then(function(r){ return r.json(); })
        .then(function(d){
            if (d && d.success){
                itemDiv.setAttribute('data-url', newUrl);
                var urlLine = itemDiv.querySelector('small');
                if (urlLine) urlLine.textContent = 'URL: ' + newUrl;
            } else {
                showError('Update Failed', 'Update failed.');
            }
        })
        .catch(function(){ showError('Network Error', 'Network error while updating.'); });
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
    
    // Clear any existing draft to ensure we get the correct order from database
    try { 
        localStorage.removeItem('cr_step5_draft_course_' + courseId); 
        } catch(_) {}
    
    var url = 'course_outline.php?course_id=' + encodeURIComponent(courseId);
    fetch(url, { credentials: 'same-origin' })
        .then(function(r){ return r.text(); })
        .then(function(t){
            try {
                var d = JSON.parse(t);
                if (d && d.success) {
                    populateStep5Outline(d.data || []);
                    // Don't apply draft - use database order
                    return;
                }
            } catch(e) {
                }
    populateStep5Outline([]);
          })
        .catch(function(err){ populateStep5Outline([]); });
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
	if (!title) { showWarning('Validation Error', 'Please enter lesson name'); return; }
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
            handle: '.lesson-drag',
      ghostClass: 'sortable-ghost',
            filter: '.non-draggable',
            onEnd: function(){ try { saveStep5Draft(); } catch(_) {} }
    });
  });
    // Sort topics within each lesson
    document.querySelectorAll('.lesson .topics').forEach(function(list){
        if (list.sortableInstance) list.sortableInstance.destroy();
        list.sortableInstance = new Sortable(list, {
            animation: 150,
            handle: '.topic-drag',
            ghostClass: 'sortable-ghost',
            filter: '.non-draggable',
            onEnd: function(){ try { saveStep5Draft(); } catch(_) {} }
        });
    });
}

// Step 5: Add handlers for add-lesson/add-topic buttons
// Single delegated click handler (ensure only one is registered)
document.addEventListener('click', function(e){
    var t = e.target;
    if (!t) return;
    if (t.getAttribute('data-action') === 'add-module') {
        showAddModuleModal();
    }
    if (t.getAttribute('data-action') === 'add-lesson') {
        var moduleEl = t.closest('.module');
        if (!moduleEl) return;
        // Prevent duplicate modals: if one exists, do nothing
        if (document.querySelector('[data-modal="add-lesson"]')) return;
        showAddLessonModal(moduleEl);
    }
    if (t.getAttribute('data-action') === 'add-material') {
        console.log('🔧 Parent elements:', t.parentElement, t.closest('.topic'), t.closest('.lesson'));
        
        // Try to find the closest topic or lesson
        var topicEl = t.closest('.topic');
        var lessonEl = t.closest('.lesson');
        
        if (topicEl) {
            var topicTitle = topicEl.querySelector('.topic-name')?.textContent || 
                           topicEl.querySelector('div[style*="font-weight:600"]')?.textContent || 
                           'Unknown Topic';
            showAddMaterialModal(topicEl, topicTitle);
        } else if (lessonEl) {
        // Best UX: silently persist module and lesson, then open modal
        var moduleEl = lessonEl.closest('.module');
        ensureModuleSaved(moduleEl).then(function(){
            return ensureLessonSaved(lessonEl);
        }).then(function(){
            showAddMaterialModal(lessonEl, 'Lesson');
        }).catch(function(){ /* errors are surfaced via notifications */ });
        } else {
            showError('Material Error', 'Could not find the topic or lesson to add material to.');
    return; 
  }
    }
    if (t.getAttribute('data-action') === 'add-activity') {
        showInfo('Activity Disabled', 'Activity creation has been disabled.');
            return;
    }
    if (t.getAttribute('data-action') === 'edit-module') {
        var moduleEl = t.closest('.module');
        if (!moduleEl) return;
        editModule(moduleEl);
    }
    if (t.getAttribute('data-action') === 'delete-module') {
        var moduleEl = t.closest('.module');
        if (!moduleEl) return;
        deleteModule(moduleEl);
    }
    if (t.getAttribute('data-action') === 'edit-topic') {
        var topicEl = t.closest('.topic');
        if (!topicEl) return;
        editTopic(topicEl);
    }
    if (t.getAttribute('data-action') === 'delete-topic') {
        var topicEl = t.closest('.topic');
        if (!topicEl) return;
        deleteTopic(topicEl);
    }
    if (t.getAttribute('data-action') === 'edit-lesson') {
        var lessonEl = t.closest('.lesson');
        if (!lessonEl) return;
        editLesson(lessonEl);
    }
    if (t.getAttribute('data-action') === 'save-lesson') {
        var lessonEl = t.closest('.lesson');
        if (!lessonEl) return;
        saveLesson(lessonEl);
    }
    if (t.getAttribute('data-action') === 'delete-lesson') {
        var lessonEl = t.closest('.lesson');
        if (!lessonEl) return;
        deleteLesson(lessonEl);
    }
    if (t.getAttribute('data-action') === 'add-lesson') {
        var moduleEl = t.closest('.module');
        if (!moduleEl) return;
        showAddLessonModal(moduleEl);
    }
    if (t.getAttribute('data-action') === 'module-settings') {
        var moduleEl = t.closest('.module');
        if (!moduleEl) return;
        showModuleSettings(moduleEl);
    }
    if (t.getAttribute('data-action') === 'edit-lesson') {
        var lessonEl = t.closest('.lesson');
        if (!lessonEl) return;
        editLessonName(lessonEl);
    }
    if (t.getAttribute('data-action') === 'delete-lesson') {
        var lessonEl = t.closest('.lesson');
        if (!lessonEl) return;
        showConfirm('Delete Lesson', 'Are you sure you want to delete this lesson?', function(){
            lessonEl.remove();
            try { saveStep5Draft(); } catch(_) {}
            showSuccess('Deleted','Lesson deleted.');
        });
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

// NEW: Get current class ID for teacher-specific modules
function getCurrentClassIdForTeacher(){
    // Try to get from URL parameter first
    var urlParams = new URLSearchParams(window.location.search);
    var classId = urlParams.get('class_id');
    if (classId) return parseInt(classId, 10);
    
    // Try to get from global variable if set
    if (window.currentClassId) return parseInt(window.currentClassId, 10);
    
    // Try to get from data attribute on body
    var bodyClassId = document.body.getAttribute('data-class-id');
    if (bodyClassId) return parseInt(bodyClassId, 10);
    
    // Fallback: try to get from the first class card if we're on teacher dashboard
    var firstClassCard = document.querySelector('.class-item[data-class-id]');
    if (firstClassCard) {
        var cardClassId = firstClassCard.getAttribute('data-class-id');
        if (cardClassId) return parseInt(cardClassId, 10);
    }
    
    return null;
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
                fetch('teacher_materials_api.php', { method:'POST', credentials:'same-origin', body: body })
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

// CSRF token helper for teacher class materials API
function getCSRFToken(){
    try {
        return fetch('teacher_class_materials_api.php?action=get_csrf_token', { credentials:'same-origin' })
            .then(function(r){ return r.ok ? r.json() : Promise.reject(); })
            .then(function(d){ return (d && (d.csrf_token || d.token)) ? (d.csrf_token || d.token) : null; })
            .catch(function(){ return null; });
    } catch(_) { return Promise.resolve(null); }
}

// CSRF token helper for teacher outline API
function getTeacherCSRFToken(){
    try {
        return fetch('teacher_outline_api.php?action=get_csrf_token', { credentials:'same-origin' })
            .then(function(r){ return r.ok ? r.json() : Promise.reject(); })
            .then(function(d){ return (d && (d.csrf_token || d.token)) ? (d.csrf_token || d.token) : null; })
            .catch(function(){ return null; });
    } catch(_) { return Promise.resolve(null); }
}

// Dynamic Add Module Modal
function showAddModuleModal(){
    // Create modal
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:400px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);font-family:\'Inter\',sans-serif;">' +
        '<h3 style="margin:0 0 15px 0;color:#374151;font-weight:700;font-family:\'Inter\',sans-serif;">Create New Module</h3>' +
        '<div style="margin-bottom:15px;">' +
            '<label style="display:block;margin-bottom:5px;color:#374151;font-weight:600;font-family:\'Inter\',sans-serif;">Module Title</label>' +
            '<input type="text" id="moduleTitleInput" placeholder="e.g., Module 1 - Introduction to Programming" style="width:100%;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;transition:border-color 0.2s;font-family:\'Inter\',sans-serif;" />' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
            '<button id="cancelModuleBtn" style="background:#6b7280;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;transition:background 0.2s;font-family:\'Inter\',sans-serif;">Cancel</button>' +
            '<button id="createModuleBtn" style="background:#1d9b3e;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;transition:background 0.2s;font-family:\'Inter\',sans-serif;">OK</button>' +
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
                showWarning('Validation Error', 'Please enter a module title.');
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
                    showWarning('Validation Error', 'Please enter a module title.');
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
            '<span class="lessons-count-badge" style="background:#eef2ff;color:#1f2937;padding:2px 8px;border-radius:12px;font-size:12px;margin-left:8px;">0 lessons</span>' +
        '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
            '<button class="lesson-btn" data-action="add-lesson" style="background:#3b82f6;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;">' +
                '<i class="fas fa-book"></i>Lesson' +
            '</button>' +
            '<button class="edit-module-btn" data-action="edit-module" style="background:#6b7280;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;">' +
                '<i class="fas fa-pencil-alt"></i>Edit' +
            '</button>' +
            '<button class="settings-btn" data-action="module-settings" style="background:#8b5cf6;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;">' +
                '<i class="fas fa-cog"></i>Settings' +
            '</button>' +
            '<button class="delete-module-btn" data-action="delete-module" style="background:#ef4444;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;">' +
                '<i class="fas fa-trash"></i>Delete' +
            '</button>' +
        '</div>' +
    '</div>' +
    '<div class="module-content" style="padding:20px;text-align:center;">' +
        '<div class="module-empty" style="color:#9ca3af;font-style:italic;font-size:14px;">No lessons</div>' +
        '<div class="module-lessons" style="text-align:left;margin-top:8px;"></div>' +
        '<div class="module-footer-actions" style="display:flex;justify-content:flex-end;margin-top:12px;gap:8px;">' +
            '<button class="module-footer-save" data-action="module-footer-save" style="background:#1d9b3e;color:#fff;border:none;padding:8px 14px;border-radius:20px;cursor:pointer;display:flex;align-items:center;gap:6px;">' +
                '<i class="fas fa-save"></i><span>Save Module</span>' +
            '</button>' +
        '</div>' +
    '</div>';
    
    // Add the new module to the container
    lessonsContainer.appendChild(div);

    // Removed per-module save button logic
    var footerSave = div.querySelector('.module-footer-save');
    if (footerSave) {
        footerSave.addEventListener('click', function(){
            // Persist this module and its unsaved lessons
            ensureModuleSaved(div).then(function(){
                var chain = Promise.resolve();
                Array.from(div.querySelectorAll('.lesson')).forEach(function(lessonEl){
                    var lid = lessonEl.getAttribute('data-lesson-id');
                    if (!lid || lid.indexOf('new_') === 0){ chain = chain.then(function(){ return ensureLessonSaved(lessonEl); }); }
                });
                return chain;
            }).then(function(){ showSuccess('Saved','Module saved.'); })
            .catch(function(){ showError('Save Failed','Unable to save module.'); });
        });
    }
    
    // Initialize sortables for the new module
    initStep5Sortables();
    
    // Save the draft to localStorage
    try { saveStep5Draft(); } catch(_) {}
    
    // Show success message using native notification
    if (typeof showNotification === 'function') {
        showNotification('success', 'Success', 'Module "' + title + '" added successfully!');
    } else {
        // Fallback to alert if native notification not available
        showSuccess('Module Added', 'Module "' + title + '" added successfully!');
    }
    
    try { updateModuleLessonCount(div); } catch(_) {}
    }

// Dynamic Add Lesson Modal
function showAddLessonModal(moduleEl){
    // Guard against duplicate instances
    if (document.querySelector('[data-modal="add-lesson"]')) return;
    // Create modal
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.setAttribute('data-modal', 'add-lesson');
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
            if (!title) { showWarning('Validation Error', 'Please enter a lesson title.'); return; }
                createNewLesson(moduleEl, title);
                modal.remove();
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
                if (!title) { showWarning('Validation Error', 'Please enter a lesson title.'); return; }
                    createNewLesson(moduleEl, title);
                    modal.remove();
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

// Advanced Features
function showModuleTemplates(moduleEl){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:600px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Module Templates</h3>' +
            '<button id="closeTemplateModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px;">' +
            '<div class="template-card" data-template="programming" style="border:2px solid #e5e7eb;border-radius:8px;padding:15px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#3b82f6\';this.style.backgroundColor=\'#f8fafc\';" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.backgroundColor=\'white\';">' +
                '<div style="font-weight:600;color:#374151;margin-bottom:8px;">Programming Module</div>' +
                '<div style="color:#6b7280;font-size:12px;">Variables, Functions, Loops, Arrays</div>' +
            '</div>' +
            '<div class="template-card" data-template="web-dev" style="border:2px solid #e5e7eb;border-radius:8px;padding:15px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#3b82f6\';this.style.backgroundColor=\'#f8fafc\';" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.backgroundColor=\'white\';">' +
                '<div style="font-weight:600;color:#374151;margin-bottom:8px;">Web Development</div>' +
                '<div style="color:#6b7280;font-size:12px;">HTML, CSS, JavaScript, Responsive Design</div>' +
            '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelTemplateBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Template selection
    modal.querySelectorAll('.template-card').forEach(function(card){
        card.addEventListener('click', function(){
            var template = this.getAttribute('data-template');
            applyModuleTemplate(moduleEl, template);
            modal.remove();
        });
    });
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelTemplateBtn');
    var closeBtn = modal.querySelector('#closeTemplateModal');
    
    if (cancelBtn) cancelBtn.addEventListener('click', function(){ modal.remove(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.remove(); });

    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function applyModuleTemplate(moduleEl, template){
    var templates = {
        programming: [
            {type: 'lesson', title: 'Introduction to Programming', topics: ['What is Programming?', 'Programming Languages', 'Development Environment']},
            {type: 'lesson', title: 'Variables and Data Types', topics: ['Variables', 'Data Types', 'Constants', 'Type Conversion']},
            {type: 'lesson', title: 'Control Structures', topics: ['Conditional Statements', 'Loops', 'Switch Statements']}
        ],
        'web-dev': [
            {type: 'lesson', title: 'HTML Fundamentals', topics: ['HTML Structure', 'Tags and Elements', 'Attributes', 'Forms']},
            {type: 'lesson', title: 'CSS Styling', topics: ['Selectors', 'Properties', 'Layout', 'Responsive Design']},
            {type: 'lesson', title: 'JavaScript Basics', topics: ['DOM Manipulation', 'Events', 'AJAX']}
        ]
    };
    
    var templateData = templates[template];
    if (!templateData) return;
    
    // Clear existing content
    var moduleContent = moduleEl.querySelector('.module-content');
    if (moduleContent) {
        moduleContent.innerHTML = '';
    }
    
    // Apply template
    templateData.forEach(function(item){
        if (item.type === 'lesson') {
            createNewLesson(moduleEl, item.title);
            // Add topics to the lesson
            setTimeout(function(){
                var newLesson = moduleEl.querySelector('.lesson:last-child');
                if (newLesson && item.topics) {
                    item.topics.forEach(function(topicTitle){
                        createNewTopic(newLesson, topicTitle);
                    });
                }
            }, 100);
        }
    });
    
    showNotification('success', 'Template Applied', 'Module template applied successfully!');
}

function showBulkOperations(moduleEl){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:500px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Bulk Operations</h3>' +
            '<button id="closeBulkModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div style="margin-bottom:20px;">' +
            '<div style="color:#6b7280;font-style:italic;text-align:center;">Bulk operations allow you to perform actions on multiple items at once.</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelBulkBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelBulkBtn');
    var closeBtn = modal.querySelector('#closeBulkModal');
    
    if (cancelBtn) cancelBtn.addEventListener('click', function(){ modal.remove(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.remove(); });

    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function createNewLesson(moduleEl, title, persistedId){
    normalizeModuleLayout(moduleEl);
    var lessonsContainer = moduleEl.querySelector('.module-lessons');
  if (!lessonsContainer) return;
  
    // Create new lesson (standardized structure)
    var div = document.createElement('div');
    div.className = 'lesson';
    div.setAttribute('data-lesson-id', persistedId ? String(persistedId) : ('new_' + Date.now()));
    div.innerHTML = '' +
        '<div class="lesson-header" style="background:#f1f5f9;padding:10px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;">' +
            '<div style="display:flex;align-items:center;gap:8px;">' +
                '<span class="drag-handle lesson-drag" title="Drag to reorder lessons" style="color:#6b7280;cursor:grab;">' +
                    '<i class="fas fa-grip-vertical"></i>' +
                '</span>' +
                '<span style="font-weight:600;">' + escapeHtml(title) + '</span>' +
            '</div>' +
        '<div style="display:flex;gap:8px;">' +
            '<button class="add-material-btn" data-action="add-material" style="background:#1d9b3e;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Add material">' +
                '<i class="fas fa-paperclip" style="font-size:12px;"></i>Material' +
            '</button>' +
            '<button class="edit-lesson-btn" data-action="edit-lesson" style="background:#6b7280;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Edit lesson">' +
                '<i class="fas fa-pencil-alt" style="font-size:12px;"></i>Edit' +
            '</button>' +
            '<button class="delete-lesson-btn" data-action="delete-lesson" style="background:#ef4444;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Delete lesson">' +
                '<i class="fas fa-trash" style="font-size:12px;"></i>Delete' +
            '</button>' +
        '</div>' +
    '</div>' +
        '<div class="lesson-content" style="padding:15px;">' +
            '<div style="color:#9ca3af;font-style:italic;font-size:12px;">No materials added yet</div>' +
    '</div>';
    
    // Add the new lesson to the module
    lessonsContainer.appendChild(div);
    normalizeModuleLayout(moduleEl);
    
    // Update lesson count in module header
    updateModuleLessonCount(moduleEl);
    
    // Initialize any event handlers if necessary
    try { saveStep5Draft(); } catch(_) {}
}

// Dynamic Add Topic Modal
function showAddTopicModal(moduleEl){
    var lessons = moduleEl.querySelectorAll('.module-lessons .lesson');
    if (!lessons || !lessons.length) {
        // Show native notification if no lessons
        if (typeof showNotification === 'function') {
            showNotification('warning', 'Warning', 'Add a lesson first before adding topics.');
                    } else {
            showWarning('Lesson Required', 'Add a lesson first before adding topics.');
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

// Advanced Features
function showModuleTemplates(moduleEl){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:600px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Module Templates</h3>' +
            '<button id="closeTemplateModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px;">' +
            '<div class="template-card" data-template="programming" style="border:2px solid #e5e7eb;border-radius:8px;padding:15px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#3b82f6\';this.style.backgroundColor=\'#f8fafc\';" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.backgroundColor=\'white\';">' +
                '<div style="font-weight:600;color:#374151;margin-bottom:8px;">Programming Module</div>' +
                '<div style="color:#6b7280;font-size:12px;">Variables, Functions, Loops, Arrays</div>' +
            '</div>' +
            '<div class="template-card" data-template="web-dev" style="border:2px solid #e5e7eb;border-radius:8px;padding:15px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#3b82f6\';this.style.backgroundColor=\'#f8fafc\';" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.backgroundColor=\'white\';">' +
                '<div style="font-weight:600;color:#374151;margin-bottom:8px;">Web Development</div>' +
                '<div style="color:#6b7280;font-size:12px;">HTML, CSS, JavaScript, Responsive Design</div>' +
            '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelTemplateBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Template selection
    modal.querySelectorAll('.template-card').forEach(function(card){
        card.addEventListener('click', function(){
            var template = this.getAttribute('data-template');
            applyModuleTemplate(moduleEl, template);
            modal.remove();
        });
    });
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelTemplateBtn');
    var closeBtn = modal.querySelector('#closeTemplateModal');
    
    if (cancelBtn) cancelBtn.addEventListener('click', function(){ modal.remove(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.remove(); });
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function applyModuleTemplate(moduleEl, template){
    var templates = {
        programming: [
            {type: 'lesson', title: 'Introduction to Programming', topics: ['What is Programming?', 'Programming Languages', 'Development Environment']},
            {type: 'lesson', title: 'Variables and Data Types', topics: ['Variables', 'Data Types', 'Constants', 'Type Conversion']},
            {type: 'lesson', title: 'Control Structures', topics: ['Conditional Statements', 'Loops', 'Switch Statements']}
        ],
        'web-dev': [
            {type: 'lesson', title: 'HTML Fundamentals', topics: ['HTML Structure', 'Tags and Elements', 'Attributes', 'Forms']},
            {type: 'lesson', title: 'CSS Styling', topics: ['Selectors', 'Properties', 'Layout', 'Responsive Design']},
            {type: 'lesson', title: 'JavaScript Basics', topics: ['DOM Manipulation', 'Events', 'AJAX']}
        ]
    };
    
    var templateData = templates[template];
    if (!templateData) return;
    
    // Clear existing content
    var moduleContent = moduleEl.querySelector('.module-content');
    if (moduleContent) {
        moduleContent.innerHTML = '';
    }
    
    // Apply template
    templateData.forEach(function(item){
        if (item.type === 'lesson') {
            createNewLesson(moduleEl, item.title);
            // Add topics to the lesson
            setTimeout(function(){
                var newLesson = moduleEl.querySelector('.lesson:last-child');
                if (newLesson && item.topics) {
                    item.topics.forEach(function(topicTitle){
                        createNewTopic(newLesson, topicTitle);
                    });
                }
            }, 100);
        }
    });
    
    showNotification('success', 'Template Applied', 'Module template applied successfully!');
}

function showBulkOperations(moduleEl){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:500px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Bulk Operations</h3>' +
            '<button id="closeBulkModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div style="margin-bottom:20px;">' +
            '<div style="color:#6b7280;font-style:italic;text-align:center;">Bulk operations allow you to perform actions on multiple items at once.</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelBulkBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelBulkBtn');
    var closeBtn = modal.querySelector('#closeBulkModal');
    
    if (cancelBtn) cancelBtn.addEventListener('click', function(){ modal.remove(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.remove(); });
    
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
                showWarning('Validation Error', 'Please enter a topic title.');
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
                    showWarning('Validation Error', 'Please enter a topic title.');
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

// Advanced Features
function showModuleTemplates(moduleEl){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:600px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Module Templates</h3>' +
            '<button id="closeTemplateModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px;">' +
            '<div class="template-card" data-template="programming" style="border:2px solid #e5e7eb;border-radius:8px;padding:15px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#3b82f6\';this.style.backgroundColor=\'#f8fafc\';" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.backgroundColor=\'white\';">' +
                '<div style="font-weight:600;color:#374151;margin-bottom:8px;">Programming Module</div>' +
                '<div style="color:#6b7280;font-size:12px;">Variables, Functions, Loops, Arrays</div>' +
            '</div>' +
            '<div class="template-card" data-template="web-dev" style="border:2px solid #e5e7eb;border-radius:8px;padding:15px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#3b82f6\';this.style.backgroundColor=\'#f8fafc\';" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.backgroundColor=\'white\';">' +
                '<div style="font-weight:600;color:#374151;margin-bottom:8px;">Web Development</div>' +
                '<div style="color:#6b7280;font-size:12px;">HTML, CSS, JavaScript, Responsive Design</div>' +
            '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelTemplateBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Template selection
    modal.querySelectorAll('.template-card').forEach(function(card){
        card.addEventListener('click', function(){
            var template = this.getAttribute('data-template');
            applyModuleTemplate(moduleEl, template);
            modal.remove();
        });
    });
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelTemplateBtn');
    var closeBtn = modal.querySelector('#closeTemplateModal');
    
    if (cancelBtn) cancelBtn.addEventListener('click', function(){ modal.remove(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.remove(); });
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function applyModuleTemplate(moduleEl, template){
    var templates = {
        programming: [
            {type: 'lesson', title: 'Introduction to Programming', topics: ['What is Programming?', 'Programming Languages', 'Development Environment']},
            {type: 'lesson', title: 'Variables and Data Types', topics: ['Variables', 'Data Types', 'Constants', 'Type Conversion']},
            {type: 'lesson', title: 'Control Structures', topics: ['Conditional Statements', 'Loops', 'Switch Statements']}
        ],
        'web-dev': [
            {type: 'lesson', title: 'HTML Fundamentals', topics: ['HTML Structure', 'Tags and Elements', 'Attributes', 'Forms']},
            {type: 'lesson', title: 'CSS Styling', topics: ['Selectors', 'Properties', 'Layout', 'Responsive Design']},
            {type: 'lesson', title: 'JavaScript Basics', topics: ['DOM Manipulation', 'Events', 'AJAX']}
        ]
    };
    
    var templateData = templates[template];
    if (!templateData) return;
    
    // Clear existing content
    var moduleContent = moduleEl.querySelector('.module-content');
    if (moduleContent) {
        moduleContent.innerHTML = '';
    }
    
    // Apply template
    templateData.forEach(function(item){
        if (item.type === 'lesson') {
            createNewLesson(moduleEl, item.title);
            // Add topics to the lesson
            setTimeout(function(){
                var newLesson = moduleEl.querySelector('.lesson:last-child');
                if (newLesson && item.topics) {
                    item.topics.forEach(function(topicTitle){
                        createNewTopic(newLesson, topicTitle);
                    });
                }
            }, 100);
        }
    });
    
    showNotification('success', 'Template Applied', 'Module template applied successfully!');
}

function showBulkOperations(moduleEl){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:500px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Bulk Operations</h3>' +
            '<button id="closeBulkModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div style="margin-bottom:20px;">' +
            '<div style="color:#6b7280;font-style:italic;text-align:center;">Bulk operations allow you to perform actions on multiple items at once.</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelBulkBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelBulkBtn');
    var closeBtn = modal.querySelector('#closeBulkModal');
    
    if (cancelBtn) cancelBtn.addEventListener('click', function(){ modal.remove(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.remove(); });
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function createNewTopic(lessonEl, title){
    var topicsContainer = lessonEl.querySelector('.topics');
    if (!topicsContainer) {
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
        '<div style="display:flex;align-items:center;gap:8px;">' +
            '<span class="drag-handle topic-drag" title="Drag to reorder topics" style="color:#6b7280;cursor:grab;">' +
                '<i class="fas fa-grip-vertical"></i>' +
            '</span>' +
        '<div style="font-weight:600;color:#374151;font-size:16px;">' + escapeHtml(title) + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;">' +
            '<button class="add-material-btn" data-action="add-material" style="background:#28a745;color:white;border:none;padding:8px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.1);" title="Add material">' +
                '<i class="fas fa-plus" style="font-size:16px;"></i>' +
            '</button>' +
            '<button class="edit-topic-btn" data-action="edit-topic" style="background:#3b82f6;color:white;border:none;padding:6px 10px;border-radius:4px;font-size:11px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Edit topic">' +
                '<i class="fas fa-pencil-alt"></i>Edit' +
            '</button>' +
            '<button class="delete-topic-btn" data-action="delete-topic" style="background:#ef4444;color:white;border:none;padding:6px 10px;border-radius:4px;font-size:11px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Delete topic">' +
                '<i class="fas fa-trash"></i>Delete' +
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
            '<span style="color:#6b7280;font-style:italic;font-size:12px;">Activity creation disabled</span>' +
        '</div>' +
    '</div>';
    
    topicsContainer.appendChild(topicItem);
    // Debug: Check if icons are visible and Font Awesome is loaded
    var materialIcon = topicItem.querySelector('.fa-plus');
    var editIcon = topicItem.querySelector('.fa-pencil-alt');
    var deleteIcon = topicItem.querySelector('.fa-trash');
    console.log('🔧 Add Material button visible:', !!topicItem.querySelector('.add-material-btn'));
    
    // Test Font Awesome loading
    if (typeof window.FontAwesome === 'undefined' && !document.querySelector('link[href*="font-awesome"]')) {
        console.warn('🔧 Font Awesome not detected! Icons may not display properly.');
        // Add fallback text for buttons
        var materialBtn = topicItem.querySelector('.add-material-btn');
        if (materialBtn && !materialBtn.querySelector('span')) {
            materialBtn.innerHTML = '📎 Material';
        }
    } else {
        }
    
    // Add event listeners for all buttons
    var addMaterialBtn = topicItem.querySelector('.add-material-btn');
    var addActivityBtn = topicItem.querySelector('.add-activity-btn');
    var editBtn = topicItem.querySelector('.edit-topic-btn');
    var deleteBtn = topicItem.querySelector('.delete-topic-btn');
    
    if (addMaterialBtn) {
        addMaterialBtn.addEventListener('click', function(){
            if (typeof showAddMaterialModal === 'function') {
                showAddMaterialModal(topicItem, title);
    } else {
                showWarning('Feature Not Available', 'Material functionality not available yet');
            }
        });
    }
    
    if (addActivityBtn) {
        addActivityBtn.addEventListener('click', function(){
            if (typeof showCoordinatorActivityModal === 'function') {
                showCoordinatorActivityModal(topicItem, title);
            } else {
                showWarning('Feature Not Available', 'Activity functionality not available yet');
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
            showConfirm('Delete Topic', 'Are you sure you want to delete this topic?', function(){
                topicItem.remove();
                updateLessonItemCount(lessonEl);
                try { saveStep5Draft(); } catch(_) {}
                showSuccess('Deleted','Topic deleted.');
            });
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
        showSuccess('Topic Added', 'Topic "' + title + '" added successfully!');
    }
    
    }

// Update module lesson count
function updateModuleLessonCount(moduleEl){
    var lessonsContainer = moduleEl.querySelector('.module-lessons');
    var lessonCount = lessonsContainer ? lessonsContainer.children.length : 0;
    var empty = moduleEl.querySelector('.module-empty');
    if (empty) empty.style.display = lessonCount > 0 ? 'none' : '';
    var badge = moduleEl.querySelector('.lessons-count-badge');
    if (badge) {
        badge.textContent = lessonCount + (lessonCount === 1 ? ' lesson' : ' lessons');
    }
}

// Ensure module DOM has the expected containers and that lessons are grouped correctly
function normalizeModuleLayout(moduleEl){
    if (!moduleEl) return;
    var content = moduleEl.querySelector('.module-content');
    if (!content) return;
    var lessonsList = content.querySelector('.module-lessons');
    if (!lessonsList){
        lessonsList = document.createElement('div');
        lessonsList.className = 'module-lessons';
        lessonsList.style.textAlign = 'left';
        lessonsList.style.marginTop = '8px';
        var footer = content.querySelector('.module-footer-actions');
        if (footer) content.insertBefore(lessonsList, footer); else content.appendChild(lessonsList);
    }
    // Move stray lesson nodes into the list
    Array.from(content.children).forEach(function(child){
        if (child !== lessonsList && child !== content.querySelector('.module-empty') && child !== content.querySelector('.module-footer-actions')){
            if (child.classList && child.classList.contains('lesson')){
                lessonsList.appendChild(child);
            }
        }
    });
    // Toggle empty state
    var empty = content.querySelector('.module-empty');
    if (empty) empty.style.display = lessonsList.children.length > 0 ? 'none' : '';
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
        showWarning('Module Required', 'No module found. Please add a module first.');
    return;
  }
  
    var lessons = moduleEl.querySelectorAll('.module-lessons .lesson');
    var lessonEl = lessons[lessonIndex];
    
    if (!lessonEl) {
        showError('Lesson Not Found', 'Lesson not found. Please try again.');
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
            '<button class="add-material-btn" data-action="add-material" style="background:#28a745;color:white;border:none;padding:8px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.1);" title="Add material">' +
                '<i class="fas fa-plus" style="font-size:16px;"></i>' +
            '</button>' +
            '<button class="edit-topic-btn" data-action="edit-topic" style="background:#3b82f6;color:white;border:none;padding:6px 10px;border-radius:4px;font-size:11px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Edit topic">' +
                '<i class="fas fa-pencil-alt"></i>Edit' +
            '</button>' +
            '<button class="delete-topic-btn" data-action="delete-topic" style="background:#ef4444;color:white;border:none;padding:6px 10px;border-radius:4px;font-size:11px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Delete topic">' +
                '<i class="fas fa-trash"></i>Delete' +
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
            '<span style="color:#6b7280;font-style:italic;font-size:12px;">Activity creation disabled</span>' +
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
            if (typeof showAddMaterialModal === 'function') {
                showAddMaterialModal(topicItem, topicName);
  } else {
                showWarning('Feature Not Available', 'Material functionality not available yet');
            }
        });
    }
    
    if (addActivityBtn) {
        addActivityBtn.addEventListener('click', function(){
            if (typeof showCoordinatorActivityModal === 'function') {
                showCoordinatorActivityModal(topicItem, topicName);
            } else {
                showWarning('Feature Not Available', 'Activity functionality not available yet');
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
            showConfirm('Delete Topic', 'Are you sure you want to delete this topic?', function(){
                topicItem.remove();
                try { saveStep5Draft(); } catch(_) {}
                showSuccess('Deleted','Topic deleted.');
            });
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
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:600px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Add Material to "' + escapeHtml(topicTitle) + '"</h3>' +
            '<button id="closeMaterialModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div id="materialFormBody" style="max-height:70vh;overflow-y:auto;">' +
            '<div style="margin-bottom:20px;">' +
                '<label style="display:block;margin-bottom:8px;color:#374151;font-weight:600;">Material Type</label>' +
                '<select id="materialTypeSelect" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;background:white;">' +
                '<option value="pdf">PDF Document</option>' +
                '<option value="link">External Link</option>' +
                '<option value="page">Page Content</option>' +
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
    
    function updateSections(){
        var type = typeSelect.value;
        if (type === 'link') {
            urlSection.style.display = 'block';
            fileSection.style.display = 'none';
        } else if (['pdf', 'video', 'code', 'file', 'pptx'].includes(type)) {
            urlSection.style.display = 'none';
            fileSection.style.display = 'block';
            // Set file input accept attribute
            var fileInput = modal.querySelector('#materialFileInput');
            if (type === 'pdf') fileInput.accept = '.pdf,application/pdf';
            else fileInput.accept = '*/*';
  } else {
            urlSection.style.display = 'none';
            fileSection.style.display = 'none';
        }
    }
    
    typeSelect.addEventListener('change', updateSections);
    updateSections(); // Initial call
    
    // File preview functionality
    var fileInput = modal.querySelector('#materialFileInput');
    var filePreview = modal.querySelector('#filePreview');
    
    fileInput.addEventListener('change', function(){
        var file = this.files[0];
        if (file) {
            filePreview.style.display = 'block';
            filePreview.innerHTML = '<strong>Selected:</strong> ' + file.name + ' (' + formatFileSize(file.size) + ')';
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
            var url = modal.querySelector('#materialUrlInput').value.trim();
            var file = modal.querySelector('#materialFileInput').files[0];
  
            if (type === 'link' && !url) {
                        showWarning('Validation Error', 'Please enter a URL for the link.');
                return;
            }
            
                    if (['pdf', 'video', 'code', 'file', 'pptx'].includes(type) && !file) {
                        showWarning('Validation Error', 'Please select a file.');
                return;
            }
            
            // Unified entry point: handles lesson or topic automatically
            createCompleteMaterial(topicItem, type, url, file);
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

// Add Activity Modal for Topics (REMOVED - No longer needed)
function showAddActivityModal(topicItem, topicTitle){
    showNotification('info', 'Activity Creation Disabled', 'Create Activity functionality has been removed from the teacher dashboard.');
    return;
    
    // Fallback to original implementation
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
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function(){
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
                showWarning('Validation Error', 'Please enter an activity title.');
        return;
      }
      
            if (!instructions) {
                showWarning('Validation Error', 'Please enter activity instructions.');
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

// Advanced Features
function showModuleTemplates(moduleEl){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:600px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Module Templates</h3>' +
            '<button id="closeTemplateModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px;">' +
            '<div class="template-card" data-template="programming" style="border:2px solid #e5e7eb;border-radius:8px;padding:15px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#3b82f6\';this.style.backgroundColor=\'#f8fafc\';" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.backgroundColor=\'white\';">' +
                '<div style="font-weight:600;color:#374151;margin-bottom:8px;">Programming Module</div>' +
                '<div style="color:#6b7280;font-size:12px;">Variables, Functions, Loops, Arrays</div>' +
            '</div>' +
            '<div class="template-card" data-template="web-dev" style="border:2px solid #e5e7eb;border-radius:8px;padding:15px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#3b82f6\';this.style.backgroundColor=\'#f8fafc\';" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.backgroundColor=\'white\';">' +
                '<div style="font-weight:600;color:#374151;margin-bottom:8px;">Web Development</div>' +
                '<div style="color:#6b7280;font-size:12px;">HTML, CSS, JavaScript, Responsive Design</div>' +
            '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelTemplateBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Template selection
    modal.querySelectorAll('.template-card').forEach(function(card){
        card.addEventListener('click', function(){
            var template = this.getAttribute('data-template');
            applyModuleTemplate(moduleEl, template);
            modal.remove();
        });
    });
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelTemplateBtn');
    var closeBtn = modal.querySelector('#closeTemplateModal');
    
    if (cancelBtn) cancelBtn.addEventListener('click', function(){ modal.remove(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.remove(); });
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function applyModuleTemplate(moduleEl, template){
    var templates = {
        programming: [
            {type: 'lesson', title: 'Introduction to Programming', topics: ['What is Programming?', 'Programming Languages', 'Development Environment']},
            {type: 'lesson', title: 'Variables and Data Types', topics: ['Variables', 'Data Types', 'Constants', 'Type Conversion']},
            {type: 'lesson', title: 'Control Structures', topics: ['Conditional Statements', 'Loops', 'Switch Statements']}
        ],
        'web-dev': [
            {type: 'lesson', title: 'HTML Fundamentals', topics: ['HTML Structure', 'Tags and Elements', 'Attributes', 'Forms']},
            {type: 'lesson', title: 'CSS Styling', topics: ['Selectors', 'Properties', 'Layout', 'Responsive Design']},
            {type: 'lesson', title: 'JavaScript Basics', topics: ['DOM Manipulation', 'Events', 'AJAX']}
        ]
    };
    
    var templateData = templates[template];
    if (!templateData) return;
    
    // Clear existing content
    var moduleContent = moduleEl.querySelector('.module-content');
    if (moduleContent) {
        moduleContent.innerHTML = '';
    }
    
    // Apply template
    templateData.forEach(function(item){
        if (item.type === 'lesson') {
            createNewLesson(moduleEl, item.title);
            // Add topics to the lesson
            setTimeout(function(){
                var newLesson = moduleEl.querySelector('.lesson:last-child');
                if (newLesson && item.topics) {
                    item.topics.forEach(function(topicTitle){
                        createNewTopic(newLesson, topicTitle);
                    });
                }
            }, 100);
        }
    });
    
    showNotification('success', 'Template Applied', 'Module template applied successfully!');
}

function showBulkOperations(moduleEl){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:500px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Bulk Operations</h3>' +
            '<button id="closeBulkModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div style="margin-bottom:20px;">' +
            '<div style="color:#6b7280;font-style:italic;text-align:center;">Bulk operations allow you to perform actions on multiple items at once.</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelBulkBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelBulkBtn');
    var closeBtn = modal.querySelector('#closeBulkModal');
    
    if (cancelBtn) cancelBtn.addEventListener('click', function(){ modal.remove(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.remove(); });
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Add material to topic (Enhanced with Coordinator Integration)
function addMaterialToTopic(topicItem, type, url, file){
    // Create material display with enhanced info
    var materialDiv = document.createElement('div');
    materialDiv.className = 'topic-material';
    materialDiv.style.cssText = 'margin-top:8px;padding:8px 10px;background:#f0f9ff;border:1px solid #0ea5e9;border-radius:6px;font-size:12px;color:#0c4a6e;';
    
    var icon = 'fa-file';
    if (type === 'pdf') icon = 'fa-file-pdf';
    else if (type === 'link') icon = 'fa-link';
    else if (type === 'page') icon = 'fa-file-alt';
    
    var extraInfo = '';
    if (url) extraInfo = '<br><small style="color:#64748b;">URL: ' + escapeHtml(url) + '</small>';
    else if (file) extraInfo = '<br><small style="color:#64748b;">File: ' + escapeHtml(file.name) + ' (' + formatFileSize(file.size) + ')</small>';
    
    materialDiv.innerHTML = '<i class="fas ' + icon + '" style="margin-right:4px;"></i>' + 
        '<strong>' + type.toUpperCase() + ':</strong> ' + extraInfo +
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
            showConfirm('Delete Material', 'Are you sure you want to delete this material?', function(){
                var materialId = materialDiv.getAttribute('data-material-id');
                if (materialId) deleteMaterialFromDatabase(materialId);
                materialDiv.remove();
                try { saveStep5Draft(); } catch(_) {}
                showSuccess('Deleted','Material deleted.');
            });
        });
    }
    
    // Save draft
    try { saveStep5Draft(); } catch(_) {}
    
    // Show success notification
    if (typeof showNotification === 'function') {
        showNotification('success', 'Success', 'Material added to topic!');
    }
    
    // Wire with coordinator API to actually save to database
    saveMaterialToCoordinator(topicItem, type, url, file);
}

// Helper function to add activity to topic from reusable activity creator result
function addActivityToTopicFromResult(topicItem, result) {
    if (!result || !result.data) {
        return;
    }
    
    const activity = result.data;
    const type = activity.type || 'lecture';
    const title = activity.title || 'Untitled Activity';
    const instructions = activity.instructions || '';
    const maxScore = activity.max_score || 100;
    
    // Add the activity to the topic visually
    addActivityToTopic(topicItem, type, title, instructions, maxScore);
    
    // Store the activity ID for future reference
    const activityDiv = topicItem.querySelector('.topic-activity:last-child');
    if (activityDiv && activity.id) {
        activityDiv.setAttribute('data-activity-id', activity.id);
    }
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
            showConfirm('Delete Activity', 'Are you sure you want to delete this activity?', function(){
                var activityId = activityDiv.getAttribute('data-activity-id');
                if (activityId) deleteActivityFromDatabase(activityId);
                activityDiv.remove();
                try { saveStep5Draft(); } catch(_) {}
                showSuccess('Deleted','Activity deleted.');
            });
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

// Save material to class-specific system (no course requirement)
function saveMaterialToCoordinator(topicItem, type, url, file, rowForUpdate){
    
    // Find the lesson that contains this topic
    var lessonEl = topicItem.closest('.lesson');
    if (!lessonEl) {
        return;
    }
    
    var lessonId = lessonEl.getAttribute('data-lesson-id');
    if (!lessonId) {
        return;
  }
    
    // Auto-save lesson if temporary, then continue
    if (lessonId.startsWith('new_')) {
        var el = lessonEl; // preserve reference
        return ensureLessonSaved(el).then(function(){
            saveMaterialToCoordinator(topicItem, type, url, file); // retry after save
        }).catch(function(){ /* surfaced via notifications */ });
    }
    
    // Helper to generate a reasonable title when title input is removed
    function generateMaterialTitle(){
        if (file && file.name) return file.name;
        if (url) {
            try { var u = new URL(url); return (type.toUpperCase() + ': ' + (u.hostname || url)); } catch(_) { return type.toUpperCase() + ': ' + url; }
        }
        return type.toUpperCase();
    }
    var generatedTitle = generateMaterialTitle();
    
    // Prepare material data
    var materialData = {
        action: 'class_material_create',
        lesson_id: lessonId,
        type: type,
        title: generatedTitle
    };
    
    if (type === 'link' && url) {
        materialData.url = url;
    }
    
    // Handle file upload
    if (file && ['pdf', 'video', 'code', 'file', 'pptx'].includes(type)) {
        var formData = new FormData();
        formData.append('action', 'class_material_upload');
        formData.append('lesson_id', lessonId);
        formData.append('file', file);
        formData.append('type', type);
        formData.append('title', generatedTitle);
        
        // Add CSRF token if available
        if (typeof getCSRFToken === 'function') {
            getCSRFToken().then(function(token){
                if (token) formData.append('csrf_token', token);
                uploadMaterialFile(formData, topicItem, type, rowForUpdate);
            }).catch(function(){
                uploadMaterialFile(formData, topicItem, type, rowForUpdate);
            });
    } else {
            uploadMaterialFile(formData, topicItem, type, rowForUpdate);
        }
      } else {
        // Handle non-file materials
        createMaterialRecord(materialData, topicItem, type);
    }
}

// Upload material file
function uploadMaterialFile(formData, topicItem, type, rowForUpdate){
    fetch('teacher_class_materials_api.php', {
        method: 'POST',
        body: formData,
          credentials: 'same-origin'
        })
    .then(function(response){
        return response.json();
    })
    .then(function(data){
    if (data && data.success) {
            // Update the material display with actual ID
            updateMaterialDisplay(topicItem, data.id, type);
            if (rowForUpdate) {
                rowForUpdate.setAttribute('data-material-id', data.id);
                rowForUpdate.classList.remove('saving');
                var buttons = rowForUpdate.querySelectorAll('button');
                buttons.forEach(function(b){ b.disabled = false; });
            }
                    } else {
            showErrorNotification('Failed to upload material: ' + (data.message || 'Unknown error'));
            if (rowForUpdate) rowForUpdate.remove();
        }
    })
    .catch(function(error){
        showErrorNotification('Network error uploading material');
        if (rowForUpdate) rowForUpdate.remove();
    });
}

// Create material record
function createMaterialRecord(materialData, topicItem, type){
    // Add CSRF token if available
    if (typeof getCSRFToken === 'function') {
        getCSRFToken().then(function(token){
            if (token) materialData.csrf_token = token;
            sendMaterialRequest(materialData, topicItem, type);
        }).catch(function(){
            sendMaterialRequest(materialData, topicItem, type);
        });
      } else {
        sendMaterialRequest(materialData, topicItem, type);
    }
}

// Send material request
function sendMaterialRequest(materialData, topicItem, type){
    var formData = new FormData();
    Object.keys(materialData).forEach(function(key){
        formData.append(key, materialData[key]);
    });
    
    fetch('teacher_class_materials_api.php', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
    })
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        if (data && data.success) {
            // Update the material display with actual ID
            updateMaterialDisplay(topicItem, data.id, type);
  } else {
            showErrorNotification('Failed to create material: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(function(error){
        showErrorNotification('Network error creating material');
    });
}

// Update material display with database ID
function updateMaterialDisplay(topicItem, materialId, type){
    var materialDiv = topicItem.querySelector('.topic-material');
    if (materialDiv) {
        materialDiv.setAttribute('data-material-id', materialId);
        }
}

// Save activity to coordinator system
function saveActivityToCoordinator(topicItem, type, title, instructions, maxScore){
    // Get the current course ID
    var courseId = getCurrentCourseIdForStep5();
    if (!courseId) {
        return;
  }
  
    // Find the lesson that contains this topic
    var lessonEl = topicItem.closest('.lesson');
    if (!lessonEl) {
        return;
  }
    
    var lessonId = lessonEl.getAttribute('data-lesson-id');
    if (!lessonId) {
        return;
    }
    
    // Auto-save if needed
    if (lessonId.startsWith('new_')) {
        var el2 = lessonEl;
        return ensureLessonSaved(el2).then(function(){
            saveActivityToCoordinator(topicItem, type, title, instructions, maxScore);
        }).catch(function(){});
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
    
    fetch('teacher_materials_api.php', {
    method: 'POST',
        body: formData,
        credentials: 'same-origin'
    })
    .then(function(response){
        return response.json();
    })
    .then(function(data){
    if (data && data.success) {
            // Update the activity display with actual ID
            updateActivityDisplay(topicItem, data.id, type, title);
  } else {
            showErrorNotification('Failed to create activity: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(function(error){
        showErrorNotification('Network error creating activity');
    });
}

// Save activity to coordinator system with dynamic data
function saveActivityToCoordinatorWithData(element, category, name, type, instructions, maxScore, dynamicData){
    // Get the current course ID
    var courseId = getCurrentCourseIdForStep5();
    if (!courseId) {
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
    
    fetch('teacher_class_materials_api.php', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
    })
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        if (data && data.success) {
            updateActivityDisplay(element, data.id, type, title);
        } else {
            showErrorNotification('Failed to create activity: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(function(error){
        showErrorNotification('Network error creating activity');
    });
}

// Update activity display with database ID
function updateActivityDisplay(topicItem, activityId, type, title){
    var activityDiv = topicItem.querySelector('.topic-activity');
    if (activityDiv) {
        activityDiv.setAttribute('data-activity-id', activityId);
        }
}

// Notification functions following the existing functional pattern
function showSuccess(title, message){
    if (typeof showNotification === 'function') {
        showNotification('success', title, message);
    } else {
        alert(title + ': ' + message);
    }
}

function showError(title, message){
    if (typeof showNotification === 'function') {
        showNotification('error', title, message);
    } else {
        alert(title + ': ' + message);
    }
}

function showWarning(title, message){
    console.warn('Warning:', title, message);
    if (typeof showNotification === 'function') {
        showNotification('warning', title, message);
    } else {
        alert(title + ': ' + message);
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
    
    fetch('teacher_materials_api.php', {
        method: 'POST',
        body: formData,
    credentials: 'same-origin'
    })
    .then(function(response){
        return response.json();
    })
    .then(function(data){
    if (data && data.success) {
            if (typeof showNotification === 'function') {
                showNotification('success', 'Success', type.charAt(0).toUpperCase() + type.slice(1) + ' deleted successfully!');
            }
          } else {
            showErrorNotification('Failed to delete ' + type + ': ' + (data.message || 'Unknown error'));
        }
    })
    .catch(function(error){
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
                '<option value="link">External Link</option>' +
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
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function(){
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
                showWarning('Validation Error', 'Please enter a material title.');
        return;
      }
      
            if (type === 'link' && !url) {
                        showWarning('Validation Error', 'Please enter a URL for the link.');
                return;
            }
            
                    if (['pdf', 'video', 'code', 'file', 'pptx'].includes(type) && !file) {
                        showWarning('Validation Error', 'Please select a file.');
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

// Advanced Features
function showModuleTemplates(moduleEl){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:600px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Module Templates</h3>' +
            '<button id="closeTemplateModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px;">' +
            '<div class="template-card" data-template="programming" style="border:2px solid #e5e7eb;border-radius:8px;padding:15px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#3b82f6\';this.style.backgroundColor=\'#f8fafc\';" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.backgroundColor=\'white\';">' +
                '<div style="font-weight:600;color:#374151;margin-bottom:8px;">Programming Module</div>' +
                '<div style="color:#6b7280;font-size:12px;">Variables, Functions, Loops, Arrays</div>' +
            '</div>' +
            '<div class="template-card" data-template="web-dev" style="border:2px solid #e5e7eb;border-radius:8px;padding:15px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#3b82f6\';this.style.backgroundColor=\'#f8fafc\';" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.backgroundColor=\'white\';">' +
                '<div style="font-weight:600;color:#374151;margin-bottom:8px;">Web Development</div>' +
                '<div style="color:#6b7280;font-size:12px;">HTML, CSS, JavaScript, Responsive Design</div>' +
            '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelTemplateBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Template selection
    modal.querySelectorAll('.template-card').forEach(function(card){
        card.addEventListener('click', function(){
            var template = this.getAttribute('data-template');
            applyModuleTemplate(moduleEl, template);
            modal.remove();
        });
    });
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelTemplateBtn');
    var closeBtn = modal.querySelector('#closeTemplateModal');
    
    if (cancelBtn) cancelBtn.addEventListener('click', function(){ modal.remove(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.remove(); });
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function applyModuleTemplate(moduleEl, template){
    var templates = {
        programming: [
            {type: 'lesson', title: 'Introduction to Programming', topics: ['What is Programming?', 'Programming Languages', 'Development Environment']},
            {type: 'lesson', title: 'Variables and Data Types', topics: ['Variables', 'Data Types', 'Constants', 'Type Conversion']},
            {type: 'lesson', title: 'Control Structures', topics: ['Conditional Statements', 'Loops', 'Switch Statements']}
        ],
        'web-dev': [
            {type: 'lesson', title: 'HTML Fundamentals', topics: ['HTML Structure', 'Tags and Elements', 'Attributes', 'Forms']},
            {type: 'lesson', title: 'CSS Styling', topics: ['Selectors', 'Properties', 'Layout', 'Responsive Design']},
            {type: 'lesson', title: 'JavaScript Basics', topics: ['DOM Manipulation', 'Events', 'AJAX']}
        ]
    };
    
    var templateData = templates[template];
    if (!templateData) return;
    
    // Clear existing content
    var moduleContent = moduleEl.querySelector('.module-content');
    if (moduleContent) {
        moduleContent.innerHTML = '';
    }
    
    // Apply template
    templateData.forEach(function(item){
        if (item.type === 'lesson') {
            createNewLesson(moduleEl, item.title);
            // Add topics to the lesson
            setTimeout(function(){
                var newLesson = moduleEl.querySelector('.lesson:last-child');
                if (newLesson && item.topics) {
                    item.topics.forEach(function(topicTitle){
                        createNewTopic(newLesson, topicTitle);
                    });
                }
            }, 100);
        }
    });
    
    showNotification('success', 'Template Applied', 'Module template applied successfully!');
}

function showBulkOperations(moduleEl){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:500px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Bulk Operations</h3>' +
            '<button id="closeBulkModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div style="margin-bottom:20px;">' +
            '<div style="color:#6b7280;font-style:italic;text-align:center;">Bulk operations allow you to perform actions on multiple items at once.</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelBulkBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelBulkBtn');
    var closeBtn = modal.querySelector('#closeBulkModal');
    
    if (cancelBtn) cancelBtn.addEventListener('click', function(){ modal.remove(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.remove(); });
    
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
                    '<option value="link">External Link</option>' +
                    '<option value="page">Page Content</option>' +
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
            var url = modal.querySelector('#materialUrlInput').value.trim();
            var file = modal.querySelector('#materialFileInput').files[0];
            
            if (type === 'link' && !url) {
                        showWarning('Validation Error', 'Please enter a URL for the link.');
                return;
            }
            
            if (['pdf', 'video', 'code', 'file', 'pptx'].includes(type) && !file) {
                        showWarning('Validation Error', 'Please select a file.');
                return;
            }
            
            // Add material with enhanced info
            addCoordinatorStyleMaterial(element, type, url, file);
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

// Advanced Features
function showModuleTemplates(moduleEl){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:600px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Module Templates</h3>' +
            '<button id="closeTemplateModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px;">' +
            '<div class="template-card" data-template="programming" style="border:2px solid #e5e7eb;border-radius:8px;padding:15px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#3b82f6\';this.style.backgroundColor=\'#f8fafc\';" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.backgroundColor=\'white\';">' +
                '<div style="font-weight:600;color:#374151;margin-bottom:8px;">Programming Module</div>' +
                '<div style="color:#6b7280;font-size:12px;">Variables, Functions, Loops, Arrays</div>' +
            '</div>' +
            '<div class="template-card" data-template="web-dev" style="border:2px solid #e5e7eb;border-radius:8px;padding:15px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#3b82f6\';this.style.backgroundColor=\'#f8fafc\';" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.backgroundColor=\'white\';">' +
                '<div style="font-weight:600;color:#374151;margin-bottom:8px;">Web Development</div>' +
                '<div style="color:#6b7280;font-size:12px;">HTML, CSS, JavaScript, Responsive Design</div>' +
            '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelTemplateBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Template selection
    modal.querySelectorAll('.template-card').forEach(function(card){
        card.addEventListener('click', function(){
            var template = this.getAttribute('data-template');
            applyModuleTemplate(moduleEl, template);
            modal.remove();
        });
    });
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelTemplateBtn');
    var closeBtn = modal.querySelector('#closeTemplateModal');
    
    if (cancelBtn) cancelBtn.addEventListener('click', function(){ modal.remove(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.remove(); });
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function applyModuleTemplate(moduleEl, template){
    var templates = {
        programming: [
            {type: 'lesson', title: 'Introduction to Programming', topics: ['What is Programming?', 'Programming Languages', 'Development Environment']},
            {type: 'lesson', title: 'Variables and Data Types', topics: ['Variables', 'Data Types', 'Constants', 'Type Conversion']},
            {type: 'lesson', title: 'Control Structures', topics: ['Conditional Statements', 'Loops', 'Switch Statements']}
        ],
        'web-dev': [
            {type: 'lesson', title: 'HTML Fundamentals', topics: ['HTML Structure', 'Tags and Elements', 'Attributes', 'Forms']},
            {type: 'lesson', title: 'CSS Styling', topics: ['Selectors', 'Properties', 'Layout', 'Responsive Design']},
            {type: 'lesson', title: 'JavaScript Basics', topics: ['DOM Manipulation', 'Events', 'AJAX']}
        ]
    };
    
    var templateData = templates[template];
    if (!templateData) return;
    
    // Clear existing content
    var moduleContent = moduleEl.querySelector('.module-content');
    if (moduleContent) {
        moduleContent.innerHTML = '';
    }
    
    // Apply template
    templateData.forEach(function(item){
        if (item.type === 'lesson') {
            createNewLesson(moduleEl, item.title);
            // Add topics to the lesson
            setTimeout(function(){
                var newLesson = moduleEl.querySelector('.lesson:last-child');
                if (newLesson && item.topics) {
                    item.topics.forEach(function(topicTitle){
                        createNewTopic(newLesson, topicTitle);
                    });
                }
            }, 100);
        }
    });
    
    showNotification('success', 'Template Applied', 'Module template applied successfully!');
}

function showBulkOperations(moduleEl){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:500px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Bulk Operations</h3>' +
            '<button id="closeBulkModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div style="margin-bottom:20px;">' +
            '<div style="color:#6b7280;font-style:italic;text-align:center;">Bulk operations allow you to perform actions on multiple items at once.</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelBulkBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelBulkBtn');
    var closeBtn = modal.querySelector('#closeBulkModal');
    
    if (cancelBtn) cancelBtn.addEventListener('click', function(){ modal.remove(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.remove(); });
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Add coordinator-style material
function addCoordinatorStyleMaterial(lessonEl, type, url, file){
    // Create material display in lesson
    var materialsSection = lessonEl.querySelector('div[style*="margin-top:4px;margin-left:12px;"]');
    if (materialsSection) {
        // Check if materials already exist
        var existingMaterials = materialsSection.querySelectorAll('.material-item');
        var materialCount = existingMaterials.length;
        
        // Create new material info with enhanced display
        var materialInfo = '';
        var icon = 'fa-file';
        if (type === 'pdf') icon = 'fa-file-pdf';
        else if (type === 'link') icon = 'fa-link';
        else if (type === 'page') icon = 'fa-file-alt';
        
        if (url) {
            materialInfo = '<i class="fas ' + icon + '" style="margin-right:4px;color:#1d9b3e;"></i>' + 
                '<strong>' + type.toUpperCase() + ':</strong> ' + 
                '<br><small style="color:#64748b;">URL: ' + escapeHtml(url) + '</small>';
        } else if (file) {
            materialInfo = '<i class="fas ' + icon + '" style="margin-right:4px;color:#1d9b3e;"></i>' + 
                '<strong>' + type.toUpperCase() + ':</strong> ' + 
                '<br><small style="color:#64748b;">File: ' + escapeHtml(file.name) + ' (' + formatFileSize(file.size) + ')</small>';
      } else {
            materialInfo = '<i class="fas ' + icon + '" style="margin-right:4px;color:#1d9b3e;"></i>' + 
                '<strong>' + type.toUpperCase() + ':</strong>';
        }
        
        // No description field on teacher side
        
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
                '<div class="material-item" style="font-size:11px;color:#495057;padding:8px;background:#f8f9fa;border-radius:4px;border:1px solid #e5e7eb;">' + materialInfo + '</div>';
            
            // Wire events for the first material
            var firstMaterialDiv = materialsSection.querySelector('.material-item');
            if (firstMaterialDiv) {
                wireMaterialItemEvents(firstMaterialDiv);
            }
      } else {
            // Add to existing materials
            var materialsHeader = materialsSection.querySelector('div[style*="font-size:11px;color:#374151;font-weight:600;"]');
            if (materialsHeader) {
                materialsHeader.textContent = 'Materials (' + (materialCount + 1) + ')';
            }
            
            // Add new material
            var newMaterialDiv = document.createElement('div');
            newMaterialDiv.className = 'material-item';
            newMaterialDiv.style.cssText = 'font-size:11px;color:#495057;padding:8px;background:#f8f9fa;border-radius:4px;border:1px solid #e5e7eb;margin-top:4px;';
            newMaterialDiv.innerHTML = materialInfo;
            materialsSection.appendChild(newMaterialDiv);
            wireMaterialItemEvents(newMaterialDiv);
        }
    }
    
    // Save to coordinator system
    saveMaterialToCoordinator(lessonEl, type, url, file);
    
    // Show success notification
    if (typeof showNotification === 'function') {
        showNotification('success', 'Success', 'Material added to lesson!');
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
    // Add interactivity
    var categoryRadios = modal.querySelectorAll('input[name="activityCategory"]');
    var typeSelect = modal.querySelector('#activityTypeSelect');
    var currentSelection = modal.querySelector('div[style*="Current selection"]');
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
        var type = typeSelect.value;
        var dynamicContent = modal.querySelector('#dynamicFieldsContent');
        if (type === 'multiple_choice') {
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
        updateCurrentSelection();
        updateDynamicFields();
    });
    updateCurrentSelection(); // Initial call
    updateDynamicFields(); // Initial call
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
                showWarning('Validation Error', 'Please enter an activity name.');
                return;
            }
            
            if (!type) {
                showWarning('Validation Error', 'Please select an activity type.');
                return;
            }
            
            if (!instructions) {
                showWarning('Validation Error', 'Please enter activity instructions.');
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
                    showWarning('Validation Error', 'Please add at least one question with valid choices.');
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
                    showWarning('Validation Error', 'Please add at least one question with an answer.');
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
                    showWarning('Validation Error', 'Please add at least one question.');
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
                    showWarning('Validation Error', 'Please add at least one question.');
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
                    showWarning('Validation Error', 'Please enter a problem statement.');
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
                    showWarning('Validation Error', 'Please enter a task description.');
                    return;
                }
                
                if (fileTypes.length === 0) {
                    showWarning('Validation Error', 'Please select at least one file type.');
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
    
        window.testDynamicFields = function(){
        var typeSelect = document.querySelector('#activityTypeSelect');
        var dynamicContent = document.querySelector('#dynamicFieldsContent');
        if (typeSelect && dynamicContent) {
            updateDynamicFields();
        }
    };
}

// ===== COMPLETE ACTIVITY CREATION =====
function createCompleteActivity(element, category, name, type, instructions, maxScore){
    // Determine if this is a lesson or topic
    var isLesson = element.classList.contains('lesson');
    var isTopic = element.classList.contains('topic-item');
    
    if (isLesson) {
        addActivityToLesson(element, category, name, type, instructions, maxScore);
    } else if (isTopic) {
        addActivityToTopic(element, category, name, type, instructions, maxScore);
    }
}

// ===== COMPLETE ACTIVITY CREATION WITH DYNAMIC DATA =====
function createCompleteActivityWithData(element, category, name, type, instructions, maxScore, dynamicData){
    // Determine if this is a lesson or topic
    var isLesson = element.classList.contains('lesson');
    var isTopic = element.classList.contains('topic-item');
    
    if (isLesson) {
        addActivityToLessonWithData(element, category, name, type, instructions, maxScore, dynamicData);
    } else if (isTopic) {
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
function createCompleteMaterial(element, type, url, file){
    // Determine if this is a lesson or topic
    var isLesson = element.classList.contains('lesson');
    var isTopic = element.classList.contains('topic-item');
    
    if (isLesson) {
        addMaterialToLesson(element, type, url, file);
    } else if (isTopic) {
        addMaterialToTopic(element, type, url, file);
    }
}

// ===== ADD MATERIAL TO LESSON (ENHANCED) =====
function addMaterialToLesson(lessonEl, type, url, file){
    // Find lesson content container
    var materialsSection = lessonEl.querySelector('.lesson-content');
    if (!materialsSection) return;

    // Ensure list container exists (professional layout)
    var header = materialsSection.querySelector('.materials-header');
    var list = materialsSection.querySelector('.materials-list');
    if (!list) {
        materialsSection.innerHTML = '' +
        '<div class="materials-header" style="display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#374151;font-weight:600;margin:2px 0 10px;">' +
            '<span>Materials (0)</span>' +
        '</div>' +
        '<div class="materials-list"></div>';
        header = materialsSection.querySelector('.materials-header');
        list = materialsSection.querySelector('.materials-list');
    }

    var materialCount = list.children.length;

    // Build professional material row
    var row = document.createElement('div');
    row.className = 'material-row';
    row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;margin-bottom:6px;';

    var left = document.createElement('div');
    left.style.cssText = 'display:flex;align-items:center;gap:10px;color:#374151;font-size:12px;';
    var icon = document.createElement('span');
    icon.innerHTML = '<i class="fas ' + (type === 'pdf' ? 'fa-file-pdf' : type === 'link' ? 'fa-link' : type === 'page' ? 'fa-file-alt' : 'fa-file') + '"></i>';
    icon.style.cssText = 'color:#1d9b3e;';
    var meta = document.createElement('div');
    meta.innerHTML = '<div style="font-weight:600;text-transform:uppercase;">' + type + '</div>' +
                     (url ? '<div style="color:#64748b;">' + escapeHtml(url) + '</div>' : (file ? '<div style="color:#64748b;">' + escapeHtml(file.name) + ' (' + formatFileSize(file.size) + ')</div>' : ''));
    left.appendChild(icon);
    left.appendChild(meta);

    var right = document.createElement('div');
    right.style.cssText = 'display:flex;align-items:center;gap:6px;';
    var btnDownload = document.createElement('button');
    btnDownload.className = 'btn tiny';
    btnDownload.textContent = 'Download';
    btnDownload.addEventListener('click', function(e){
        var id = row.getAttribute('data-material-id');
        var type = row.getAttribute('data-type');
        var filename = row.getAttribute('data-filename');
        
        if (id) {
            // Use material viewer instead of direct download
            const materialData = {
                id: id,
                url: 'material_download.php?id=' + encodeURIComponent(id),
                filename: filename || 'Material',
                type: type
            };
            
            if (typeof openMaterialViewer === 'function') {
                openMaterialViewer(materialData);
            } else if (typeof window.openMaterialViewer === 'function') {
                window.openMaterialViewer(materialData);
      } else {
                window.open('material_download.php?id=' + encodeURIComponent(id), '_blank');
            }
        }
    });
    var btnDelete = document.createElement('button');
    btnDelete.className = 'btn tiny';
    btnDelete.style.background = '#fee2e2';
    btnDelete.style.color = '#b91c1c';
    btnDelete.textContent = 'Delete';
    btnDelete.addEventListener('click', function(){
        var id = row.getAttribute('data-material-id');
        if (!id) { showWarning('Not Saved', 'Please wait until the material is saved.'); return; }
        var form = new FormData();
        form.append('action','class_material_delete');
        form.append('material_id', id);
        getCSRFToken().then(function(tok){ if (tok) form.append('csrf_token', tok); return fetch('teacher_class_materials_api.php',{ method:'POST', body: form, credentials:'same-origin' }); })
        .then(function(r){ return r.json(); })
        .then(function(d){ if (d && d.success){ row.remove(); if (header){ var n = Math.max(0, materialCount); header.querySelector('span').textContent = 'Materials (' + n + ')'; } showSuccess('Deleted','Material deleted.'); } else { showError('Delete Failed', d && d.message ? d.message : 'Failed to delete.'); } });
    });

    right.appendChild(btnDownload);
    right.appendChild(btnDelete);
    row.appendChild(left);
    row.appendChild(right);
    list.appendChild(row);
    if (header) header.querySelector('span').textContent = 'Materials (' + (materialCount + 1) + ')';

    // Mark as saving and disable actions until persisted
    row.classList.add('saving');
    btnDownload.disabled = true;
    btnDelete.disabled = true;

    // Persist via API and attach row for update callbacks
    saveMaterialToCoordinator(lessonEl, type, url, file, row);

    // UX feedback
    if (typeof showNotification === 'function') showNotification('success','Success','Material added to lesson!');
}

// ===== ADD MATERIAL TO TOPIC (ENHANCED) =====
function addMaterialToTopic(topicEl, type, url, file){
    // Update topic display to show material
    var statusSection = topicEl.querySelector('div[style*="margin-top:8px;padding:8px;background:#f8f9fa"]');
    if (statusSection) {
        var materialsSpan = statusSection.querySelector('span[style*="color:#6b7280;font-style:italic"]');
        if (materialsSpan && materialsSpan.textContent.includes('No materials')) {
            materialsSpan.textContent = '1 material';
        }
    }
    
    // Save to coordinator system
    saveMaterialToCoordinator(topicEl, type, url, file);
    
    // Show success notification
    if (typeof showNotification === 'function') {
        showNotification('success', 'Success', 'Material added to topic!');
    }
}

// Floating Save Module removed per request


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
                showWarning('Validation Error', 'Please enter a topic title.');
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

// Advanced Features
function showModuleTemplates(moduleEl){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:600px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Module Templates</h3>' +
            '<button id="closeTemplateModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px;">' +
            '<div class="template-card" data-template="programming" style="border:2px solid #e5e7eb;border-radius:8px;padding:15px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#3b82f6\';this.style.backgroundColor=\'#f8fafc\';" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.backgroundColor=\'white\';">' +
                '<div style="font-weight:600;color:#374151;margin-bottom:8px;">Programming Module</div>' +
                '<div style="color:#6b7280;font-size:12px;">Variables, Functions, Loops, Arrays</div>' +
            '</div>' +
            '<div class="template-card" data-template="web-dev" style="border:2px solid #e5e7eb;border-radius:8px;padding:15px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#3b82f6\';this.style.backgroundColor=\'#f8fafc\';" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.backgroundColor=\'white\';">' +
                '<div style="font-weight:600;color:#374151;margin-bottom:8px;">Web Development</div>' +
                '<div style="color:#6b7280;font-size:12px;">HTML, CSS, JavaScript, Responsive Design</div>' +
            '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelTemplateBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Template selection
    modal.querySelectorAll('.template-card').forEach(function(card){
        card.addEventListener('click', function(){
            var template = this.getAttribute('data-template');
            applyModuleTemplate(moduleEl, template);
            modal.remove();
        });
    });
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelTemplateBtn');
    var closeBtn = modal.querySelector('#closeTemplateModal');
    
    if (cancelBtn) cancelBtn.addEventListener('click', function(){ modal.remove(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.remove(); });
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function applyModuleTemplate(moduleEl, template){
    var templates = {
        programming: [
            {type: 'lesson', title: 'Introduction to Programming', topics: ['What is Programming?', 'Programming Languages', 'Development Environment']},
            {type: 'lesson', title: 'Variables and Data Types', topics: ['Variables', 'Data Types', 'Constants', 'Type Conversion']},
            {type: 'lesson', title: 'Control Structures', topics: ['Conditional Statements', 'Loops', 'Switch Statements']}
        ],
        'web-dev': [
            {type: 'lesson', title: 'HTML Fundamentals', topics: ['HTML Structure', 'Tags and Elements', 'Attributes', 'Forms']},
            {type: 'lesson', title: 'CSS Styling', topics: ['Selectors', 'Properties', 'Layout', 'Responsive Design']},
            {type: 'lesson', title: 'JavaScript Basics', topics: ['DOM Manipulation', 'Events', 'AJAX']}
        ]
    };
    
    var templateData = templates[template];
    if (!templateData) return;
    
    // Clear existing content
    var moduleContent = moduleEl.querySelector('.module-content');
    if (moduleContent) {
        moduleContent.innerHTML = '';
    }
    
    // Apply template
    templateData.forEach(function(item){
        if (item.type === 'lesson') {
            createNewLesson(moduleEl, item.title);
            // Add topics to the lesson
            setTimeout(function(){
                var newLesson = moduleEl.querySelector('.lesson:last-child');
                if (newLesson && item.topics) {
                    item.topics.forEach(function(topicTitle){
                        createNewTopic(newLesson, topicTitle);
                    });
                }
            }, 100);
        }
    });
    
    showNotification('success', 'Template Applied', 'Module template applied successfully!');
}

function showBulkOperations(moduleEl){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:500px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Bulk Operations</h3>' +
            '<button id="closeBulkModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div style="margin-bottom:20px;">' +
            '<div style="color:#6b7280;font-style:italic;text-align:center;">Bulk operations allow you to perform actions on multiple items at once.</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelBulkBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelBulkBtn');
    var closeBtn = modal.querySelector('#closeBulkModal');
    
    if (cancelBtn) cancelBtn.addEventListener('click', function(){ modal.remove(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.remove(); });
    
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
            '<button class="add-material-btn" data-action="add-material" style="background:#28a745;color:white;border:none;padding:8px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.1);" title="Add material">' +
                '<i class="fas fa-plus" style="font-size:16px;"></i>' +
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

setTimeout(function(){
    var lessons = document.querySelectorAll('.lesson');
    lessons.forEach(function(lessonEl, index){
        var hasButtons = lessonEl.querySelector('div[style*="display:flex;gap:8px;"]');
        if (!hasButtons) {
            // Force convert this lesson
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
                    oldHeader.replaceWith(newHeader);
                } else {
                    lessonEl.insertBefore(newHeader, lessonEl.firstChild);
                }
                
                // Remove old buttons if they exist
                var oldButtons = lessonEl.querySelector('.add-buttons');
                if (oldButtons) {
                    oldButtons.remove();
                }
            }
        }
    });
}, 2000);

window.forceLessonButtons = function(){
    var lessons = document.querySelectorAll('.lesson');
    lessons.forEach(function(lessonEl, index){
        // Check if lesson has buttons
        var hasButtons = lessonEl.querySelector('div[style*="display:flex;gap:8px;"]');
        if (!hasButtons) {
            // Find title
            var titleDiv = lessonEl.querySelector('div[style*="font-weight:600"]');
            if (!titleDiv) {
                // Try alternative selectors
                titleDiv = lessonEl.querySelector('div[style*="font-weight"]');
            }
            
            if (titleDiv) {
                // Create new header with buttons
                var newHeader = document.createElement('div');
                newHeader.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;';
                newHeader.innerHTML = '<div style="font-weight:600;color:#374151;">' + titleDiv.textContent + '</div>' +
                    '<div style="display:flex;gap:8px;">' +
                        '<button class="add-material-btn" data-action="add-material" style="background:#1d9b3e;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Add material">' +
                            '<i class="fas fa-paperclip" style="font-size:12px;"></i>Material' +
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
                    oldHeader.replaceWith(newHeader);
  } else {
                    lessonEl.insertBefore(newHeader, lessonEl.firstChild);
                }
                
                // Remove old buttons
                var oldButtons = lessonEl.querySelector('.add-buttons');
                if (oldButtons) {
                    oldButtons.remove();
                }
                
                } else {
                }
        } else {
            }
    });
    
        };

window.testTopicCreation = function(){
    // Find first lesson
    var lesson = document.querySelector('.lesson');
    if (!lesson) {
        return;
    }
    
    // Test creating a topic
    createNewTopic(lesson, 'TEST TOPIC');
    };

// ===== FIX EXISTING TOPICS =====
window.fixExistingTopics = function(){
    var topics = document.querySelectorAll('.topic-item');
    topics.forEach(function(topic, index){
        // Check if topic has Material button
        var materialBtn = topic.querySelector('.add-material-btn');
        if (!materialBtn) {
            // Find the button container
            var buttonContainer = topic.querySelector('div[style*="display:flex;gap:8px;"]');
            if (buttonContainer) {
                // Add Material button as first button
                var materialBtnHtml = '<button class="add-material-btn" data-action="add-material" style="background:#28a745;color:white;border:none;padding:8px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.1);" title="Add material">' +
                    '<i class="fas fa-plus" style="font-size:16px;"></i>' +
                '</button>';
                
                // Insert at the beginning
                buttonContainer.insertAdjacentHTML('afterbegin', materialBtnHtml);
                
                // Add event listener
                var newMaterialBtn = topic.querySelector('.add-material-btn');
                if (newMaterialBtn) {
                    newMaterialBtn.addEventListener('click', function(){
                        var topicTitle = topic.querySelector('div[style*="font-weight:600"]').textContent.trim();
                        if (typeof showAddMaterialModal === 'function') {
                            showAddMaterialModal(topic, topicTitle);
                        } else {
                            showWarning('Feature Not Available', 'Material functionality not available yet');
                        }
                    });
                }
                
                } else {
                }
        }
    });
    
    console.log('🚨 !IMPORTANT: FORCE FIX COMPLETE!');
};

// ===== CHECK FONTAWESOME =====
window.checkFontAwesome = function(){
    // Check if FontAwesome CSS is loaded
    var faCSS = document.querySelector('link[href*="fontawesome"]') || document.querySelector('link[href*="font-awesome"]');
    // Check if FontAwesome JS is loaded
    var faJS = document.querySelector('script[src*="fontawesome"]') || document.querySelector('script[src*="font-awesome"]');
    // Test if icons work
    var testDiv = document.createElement('div');
    testDiv.innerHTML = '<i class="fas fa-paperclip"></i>';
    document.body.appendChild(testDiv);
    
    var computedStyle = window.getComputedStyle(testDiv.querySelector('i'));
    var fontFamily = computedStyle.fontFamily;
    console.log('🔧 FontAwesome working:', fontFamily.includes('Font Awesome') || fontFamily.includes('FontAwesome'));
    
    testDiv.remove();
    
    // Check if specific icons exist
    var materialIcon = document.querySelector('.fa-paperclip');
    var activityIcon = document.querySelector('.fa-tasks');
    };

// ===== INSPECT EXISTING TOPIC =====
window.inspectTopic = function(topicName){
    var topics = document.querySelectorAll('.topic-item');
    var targetTopic = null;
    
    topics.forEach(function(topic, index){
        var titleDiv = topic.querySelector('div[style*="font-weight:600"]');
        if (titleDiv && titleDiv.textContent.trim() === topicName) {
            targetTopic = topic;
            }
    });
    
    if (!targetTopic) {
        return;
    }
    
    // Check buttons
    var buttons = targetTopic.querySelectorAll('button');
    buttons.forEach(function(btn, index){
        var icon = btn.querySelector('i');
        if (icon) {
            }
    });
    
    // Check specifically for Material button
    var materialBtn = targetTopic.querySelector('.add-material-btn');
    if (materialBtn) {
        var materialIcon = materialBtn.querySelector('.fa-paperclip');
        }
};

window.testFullFlow = function(){
    // Step 1: Create module
    createNewModule('TEST MODULE');
    
    // Step 2: Create lesson
    setTimeout(function(){
        var module = document.querySelector('.module');
        if (module) {
            createNewLesson(module, 'TEST LESSON');
        }
    }, 1000);
    
    // Step 3: Create topic
    setTimeout(function(){
        var lesson = document.querySelector('.lesson');
        if (lesson) {
            createNewTopic(lesson, 'TEST TOPIC');
        }
    }, 2000);
};

// ===== TEST MATERIAL ICON =====
window.testMaterialIcon = function(){
    // Find any existing topic
    var topic = document.querySelector('.topic-item');
    if (topic) {
        var materialBtn = topic.querySelector('.add-material-btn');
        var materialIcon = topic.querySelector('.fa-paperclip');
        if (materialBtn) {
            console.log('Material button found');
        }
    } else {
        console.log('No topic found');
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
                '<button class="add-topic-btn" data-action="add-topic" style="background:#28a745;color:white;border:none;padding:8px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.1);" title="Add topic">' +
                '<i class="fas fa-plus" style="margin-right:4px;"></i>Add Topic</button>' +
                '<button class="add-material-btn" data-action="add-material" style="background:#17a2b8;color:white;border:none;padding:8px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.1);" title="Add material">' +
                '<i class="fas fa-paperclip" style="margin-right:4px;"></i>Add Material</button>' +
                '<button class="add-activity-btn" data-action="add-activity" style="background:#ffc107;color:white;border:none;padding:8px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.1);" title="Add activity">' +
                '<i class="fas fa-tasks" style="margin-right:4px;"></i>Add Activity</button>' +
                '</div>';
            
            // Replace the old header
            var oldHeader = lesson.querySelector('div[style*="display:flex;align-items:center;justify-content:space-between"]');
            if (oldHeader) {
                oldHeader.parentNode.replaceChild(newHeader, oldHeader);
            }
        }
    });
    
    // Step 2: Fix ALL topics to have Material button
    var topics = document.querySelectorAll('.topic-item');
    topics.forEach(function(topic, index){
        // Check if topic has Material button
        var materialBtn = topic.querySelector('.add-material-btn');
        if (!materialBtn) {
            // Find button container
            var buttonContainer = topic.querySelector('div[style*="display:flex;gap:8px;"]');
            if (buttonContainer) {
                // Add Material button as FIRST button
                var materialBtnHtml = '<button class="add-material-btn" data-action="add-material" style="background:#28a745;color:white;border:none;padding:8px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.1);" title="Add material">' +
                    '<i class="fas fa-plus" style="font-size:16px;"></i>' +
                '</button>';
                
                buttonContainer.insertAdjacentHTML('afterbegin', materialBtnHtml);
                
                // Add event listener
                var newMaterialBtn = topic.querySelector('.add-material-btn');
                if (newMaterialBtn) {
                    newMaterialBtn.addEventListener('click', function(){
                        var topicTitle = topic.querySelector('div[style*="font-weight:600"]').textContent.trim();
                        if (typeof showAddMaterialModal === 'function') {
                            showAddMaterialModal(topic, topicTitle);
                        } else {
                            showWarning('Feature Not Available', 'Material functionality not available yet');
                        }
                    });
                }
                
                }
        } else {
            }
    });
    
    // Step 3: Force refresh all event listeners
    // Re-attach all click handlers
    document.addEventListener('click', function(e){
        var t = e.target;
        if (t.getAttribute('data-action') === 'add-material') {
            var lessonEl = t.closest('.lesson');
            var topicEl = t.closest('.topic-item');
            if (lessonEl) {
                showAddMaterialModal(lessonEl, 'Lesson');
            } else if (topicEl) {
                var topicTitle = topicEl.querySelector('div[style*="font-weight:600"]').textContent.trim();
                showAddMaterialModal(topicEl, topicTitle);
            }
        }
    });
    
    };

// Test function to check button functionality
window.testLessonButtons = function(){
    var lessons = document.querySelectorAll('.lesson');
    lessons.forEach(function(lessonEl, index){
        // Check for buttons
        var materialBtn = lessonEl.querySelector('.add-material-btn');
        var activityBtn = lessonEl.querySelector('.add-activity-btn');
        var editBtn = lessonEl.querySelector('.edit-lesson-btn');
        var deleteBtn = lessonEl.querySelector('.delete-lesson-btn');
        
        // Test click events
        if (materialBtn) {
            materialBtn.click();
        }
        
        if (activityBtn) {
            activityBtn.click();
        }
    });
    
    };

// ===== COMPREHENSIVE MODULE MANAGEMENT SYSTEM =====

// Module Management Functions
function editModule(moduleEl){
    var currentTitle = moduleEl.querySelector('.module-header span[style*="font-weight:700"]').textContent.trim();
    // Build professional modal instead of prompt
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    overlay.innerHTML = '<div style="background:#ffffff;border-radius:12px;padding:20px;max-width:420px;width:92%;box-shadow:0 12px 30px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid #e5e7eb;padding-bottom:10px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Edit Module</h3>' +
            '<button id="closeEditModule" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280">&times;</button>' +
        '</div>' +
        '<label style="display:block;margin:0 0 6px;color:#374151;font-weight:600;">Module title</label>' +
        '<input id="editModuleInput" type="text" value="' + escapeHtml(currentTitle) + '" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;outline:none;" />' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">' +
            '<button id="cancelEditModule" style="background:#6b7280;color:#fff;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;">Cancel</button>' +
            '<button id="saveEditModule" style="background:#1d9b3e;color:#fff;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;">Save</button>' +
        '</div>' +
    '</div>';
    document.body.appendChild(overlay);
    var input = overlay.querySelector('#editModuleInput');
    if (input) input.select();
    function close(){ if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); }
    overlay.addEventListener('click', function(e){ if (e.target === overlay) close(); });
    overlay.querySelector('#closeEditModule').onclick = close;
    overlay.querySelector('#cancelEditModule').onclick = close;
    overlay.querySelector('#saveEditModule').onclick = function(){
        var newTitle = (input.value || '').trim();
        if (!newTitle || newTitle === currentTitle) { close(); return; }
        var titleSpan = moduleEl.querySelector('.module-header span[style*="font-weight:700"]');
        if (titleSpan) titleSpan.textContent = newTitle;
        var moduleId = moduleEl.getAttribute('data-module-id');
        if (moduleId && !moduleId.startsWith('new_')) { updateModuleOnServer(moduleEl, newTitle); }
        showNotification('success', 'Updated', 'Module title updated successfully!');
        try { saveStep5Draft(); } catch(_) {}
        close();
    };
}

function deleteModule(moduleEl){
    var moduleId = moduleEl.getAttribute('data-module-id');
    var title = moduleEl.querySelector('.module-header span[style*="font-weight:700"]').textContent.trim();
    
    showConfirm('Delete Module', 'Are you sure you want to delete the module "' + title + '"? This action cannot be undone.', function(){
        if (moduleId && !moduleId.startsWith('new_')) {
            deleteModuleFromServer(moduleId).then(function(success){
                if (success) {
                    moduleEl.remove();
                    showSuccess('Deleted','Module deleted successfully!');
                } else {
                    showError('Delete Failed','Failed to delete module from server.');
                }
            });
        } else {
            moduleEl.remove();
            showSuccess('Deleted','Module deleted successfully!');
        }
    });
}

function updateModuleOnServer(moduleEl, newTitle){
    var moduleId = moduleEl.getAttribute('data-module-id');
    var formData = new FormData();
    formData.append('action', 'module_update');
    formData.append('module_id', moduleId);
    formData.append('title', newTitle);
    
    getTeacherCSRFToken().then(function(token){
        if (token) formData.append('csrf_token', token);
        return fetch('teacher_outline_api.php', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });
    })
    .then(function(response){ return response.json(); })
    .then(function(data){
        if (!data.success) {
            showErrorNotification('Failed to update module: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(function(error){
        showErrorNotification('Network error updating module.');
    });
}

function deleteModuleFromServer(moduleId){
    var formData = new FormData();
    formData.append('action', 'module_delete');
    formData.append('module_id', moduleId);
    
    return getTeacherCSRFToken().then(function(token){
        if (token) formData.append('csrf_token', token);
        return fetch('teacher_outline_api.php', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });
    })
    .then(function(response){ return response.json(); })
    .then(function(data){
        return data.success;
    })
    .catch(function(error){
        return false;
    });
}

// Topic Management Functions
function editTopic(topicEl){
    var currentTitle = topicEl.querySelector('div[style*="font-weight:600"]').textContent.trim();
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    overlay.innerHTML = '<div style="background:#ffffff;border-radius:12px;padding:20px;max-width:420px;width:92%;box-shadow:0 12px 30px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid #e5e7eb;padding-bottom:10px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Edit Topic</h3>' +
            '<button id="closeEditTopic" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280">&times;</button>' +
        '</div>' +
        '<label style="display:block;margin:0 0 6px;color:#374151;font-weight:600;">Topic title</label>' +
        '<input id="editTopicInput" type="text" value="' + escapeHtml(currentTitle) + '" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;outline:none;" />' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">' +
            '<button id="cancelEditTopic" style="background:#6b7280;color:#fff;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;">Cancel</button>' +
            '<button id="saveEditTopic" style="background:#1d9b3e;color:#fff;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;">Save</button>' +
        '</div>' +
    '</div>';
    document.body.appendChild(overlay);
    var input = overlay.querySelector('#editTopicInput'); if (input) input.select();
    function close(){ if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); }
    overlay.addEventListener('click', function(e){ if (e.target === overlay) close(); });
    overlay.querySelector('#closeEditTopic').onclick = close;
    overlay.querySelector('#cancelEditTopic').onclick = close;
    overlay.querySelector('#saveEditTopic').onclick = function(){
        var newTitle = (input.value || '').trim();
        if (!newTitle || newTitle === currentTitle) { close(); return; }
        var titleDiv = topicEl.querySelector('div[style*="font-weight:600"]');
        if (titleDiv) titleDiv.textContent = newTitle;
        var topicId = topicEl.getAttribute('data-topic-id');
        if (topicId && !topicId.startsWith('new_')) { updateTopicOnServer(topicEl, newTitle); }
        showNotification('success', 'Updated', 'Topic title updated successfully!');
        try { saveStep5Draft(); } catch(_) {}
        close();
    };
}

function deleteTopic(topicEl){
    var topicId = topicEl.getAttribute('data-topic-id');
    var title = topicEl.querySelector('div[style*="font-weight:600"]').textContent.trim();
    
    showConfirm('Delete Topic', 'Are you sure you want to delete the topic "' + title + '"? This action cannot be undone.', function(){
        if (topicId && !topicId.startsWith('new_')) {
            deleteTopicFromServer(topicId).then(function(success){
                if (success) {
                    topicEl.remove();
                    showSuccess('Deleted','Topic deleted successfully!');
                } else {
                    showError('Delete Failed','Failed to delete topic from server.');
                }
            });
        } else {
            topicEl.remove();
            showSuccess('Deleted','Topic deleted successfully!');
        }
    });
}

function updateTopicOnServer(topicEl, newTitle){
    var topicId = topicEl.getAttribute('data-topic-id');
    var formData = new FormData();
    formData.append('action', 'topic_update');
    formData.append('topic_id', topicId);
    formData.append('title', newTitle);
    
    getTeacherCSRFToken().then(function(token){
        if (token) formData.append('csrf_token', token);
        return fetch('teacher_outline_api.php', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });
    })
    .then(function(response){ return response.json(); })
    .then(function(data){
        if (!data.success) {
            showErrorNotification('Failed to update topic: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(function(error){
        showErrorNotification('Network error updating topic.');
    });
}

function deleteTopicFromServer(topicId){
    var formData = new FormData();
    formData.append('action', 'topic_delete');
    formData.append('topic_id', topicId);
    
    return getTeacherCSRFToken().then(function(token){
        if (token) formData.append('csrf_token', token);
        return fetch('teacher_outline_api.php', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });
    })
    .then(function(response){ return response.json(); })
    .then(function(data){
        return data.success;
    })
    .catch(function(error){
        return false;
    });
}

// Lesson Management Functions
function createNewLesson(moduleEl, title){
    var lessonId = 'new_' + Date.now();
    var lessonEl = document.createElement('div');
    lessonEl.className = 'lesson';
    lessonEl.setAttribute('data-lesson-id', lessonId);
    
    // Match the professional, clean card style with green left border
    lessonEl.innerHTML = '<div class="lesson-header" style="background:#ffffff;padding:10px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e5e7eb;border-left:3px solid #1d9b3e;">' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
            '<span class="drag-handle lesson-drag" title="Drag to reorder lessons" style="color:#6b7280;cursor:grab;">' +
                '<i class="fas fa-ellipsis-v"></i>' +
            '</span>' +
            '<i class="fas fa-book" style="color:#6b7280;font-size:14px;"></i>' +
            '<span style="font-weight:600;color:#374151;">' + escapeHtml(title) + '</span>' +
        '</div>' +
        '<span style="font-size:11px;background:#e9f5ee;color:#137b30;border:1px solid #ccebd9;padding:1px 6px;border-radius:999px;">Materials</span>' +
    '</div>' +
    '<div class="lesson-content" style="padding:12px 15px;">' +
        '<div class="materials-header" style="display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#374151;font-weight:600;margin:2px 0 10px;">' +
            '<span>Materials (0)</span>' +
            '<button class="add-material-btn" data-action="add-material" style="background:#1d9b3e;color:white;border:none;padding:4px 8px;border-radius:4px;font-size:11px;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Add material">' +
                '<i class="fas fa-plus"></i>Material' +
            '</button>' +
        '</div>' +
        '<div class="materials-list"></div>' +
    '</div>';
    
    // Add into the module's lessons container (inside created module)
    var content = moduleEl.querySelector('.module-content');
    if (content){
        var list = content.querySelector('.module-lessons');
        if (!list){
            list = document.createElement('div');
            list.className = 'module-lessons';
            list.style.textAlign = 'left';
            list.style.marginTop = '8px';
            var footer = content.querySelector('.module-footer-actions');
            if (footer) content.insertBefore(list, footer); else content.appendChild(list);
        }
        list.appendChild(lessonEl);
        var empty = content.querySelector('.module-empty');
        if (empty) empty.style.display = 'none';
    }
    
    // Initialize sortables
    initStep5Sortables();
    
    showNotification('success', 'Created', 'Lesson created successfully!');
    // Update count/empty state
    try { updateModuleLessonCount(moduleEl); } catch(_) {}
}

function editLesson(lessonEl){
    var currentTitle = lessonEl.querySelector('.lesson-header span[style*="font-weight:600"]').textContent.trim();
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    overlay.innerHTML = '<div style="background:#ffffff;border-radius:12px;padding:20px;max-width:420px;width:92%;box-shadow:0 12px 30px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid #e5e7eb;padding-bottom:10px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Edit Lesson</h3>' +
            '<button id="closeEditLesson" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280">&times;</button>' +
        '</div>' +
        '<label style="display:block;margin:0 0 6px;color:#374151;font-weight:600;">Lesson title</label>' +
        '<input id="editLessonInput" type="text" value="' + escapeHtml(currentTitle) + '" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;outline:none;" />' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">' +
            '<button id="cancelEditLesson" style="background:#6b7280;color:#fff;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;">Cancel</button>' +
            '<button id="saveEditLesson" style="background:#1d9b3e;color:#fff;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;">Save</button>' +
        '</div>' +
    '</div>';
    document.body.appendChild(overlay);
    var input = overlay.querySelector('#editLessonInput'); if (input) input.select();
    function close(){ if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); }
    overlay.addEventListener('click', function(e){ if (e.target === overlay) close(); });
    overlay.querySelector('#closeEditLesson').onclick = close;
    overlay.querySelector('#cancelEditLesson').onclick = close;
    overlay.querySelector('#saveEditLesson').onclick = function(){
        var newTitle = (input.value || '').trim();
        if (!newTitle || newTitle === currentTitle) { close(); return; }
        var titleSpan = lessonEl.querySelector('.lesson-header span[style*="font-weight:600"]');
        if (titleSpan) titleSpan.textContent = newTitle;
        var lessonId = lessonEl.getAttribute('data-lesson-id');
        if (lessonId && !lessonId.startsWith('new_')) { updateLessonOnServer(lessonEl, newTitle); }
        showNotification('success', 'Updated', 'Lesson title updated successfully!');
        try { saveStep5Draft(); } catch(_) {}
        close();
    };
}

function saveLesson(lessonEl){
    var lessonId = lessonEl.getAttribute('data-lesson-id');
    var title = lessonEl.querySelector('.lesson-header span[style*="font-weight:600"]').textContent.trim();
    
    // Check if already saved
    if (lessonId && !lessonId.startsWith('new_')) {
            showInfo('Lesson Status', 'Lesson is already saved.');
        return;
    }
    
    // Get module ID
    var moduleEl = lessonEl.closest('.module');
    if (!moduleEl) {
        showError('Module Error', 'Could not find parent module.');
        return;
    }
    
    var moduleId = moduleEl.getAttribute('data-module-id');
    // Allow auto-save of lesson even if module is not yet persisted.
    if (!moduleId || moduleId.startsWith('new_')) {
        moduleId = moduleId || 'temp';
    }
    
    // Save lesson to server
    var formData = new FormData();
    formData.append('action', 'class_lesson_create');
    var classIdForLesson = (typeof getCurrentClassIdForTeacher === 'function') ? getCurrentClassIdForTeacher() : null;
    if (!classIdForLesson) {
        showWarning('Class Not Selected', 'Please enter the class first.');
        return;
    }
    formData.append('class_id', String(classIdForLesson));
    formData.append('module_id', moduleId);
    formData.append('title', title);
    
    getTeacherCSRFToken().then(function(token){
        if (token) formData.append('csrf_token', token);
        
        fetch('teacher_class_api.php', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        })
        .then(function(response){ return response.json(); })
        .then(function(data){
            if (data && data.success && data.id) {
                // Update lesson ID
                lessonEl.setAttribute('data-lesson-id', data.id);
                
                // Update save button to show saved state
                var saveBtn = lessonEl.querySelector('.save-lesson-btn');
                if (saveBtn) {
                    saveBtn.outerHTML = '<span style="background:#e9f5ee;color:#1d9b3e;border:1px solid #dbeafe;padding:4px 8px;border-radius:4px;font-size:11px;display:flex;align-items:center;gap:4px;"><i class="fas fa-check"></i>Saved</span>';
                }
                
                if (typeof showNotification === 'function') {
                    showNotification('success', 'Success', 'Lesson saved successfully!');
                }
            } else {
                    showError('Lesson Save Failed', 'Failed to save lesson: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(function(error){
            showError('Network Error', 'Network error saving lesson.');
        });
    }).catch(function(error){
        showError('Security Error', 'Security error: Failed to get CSRF token.');
    });
}

// Save module (create if needed) and resolve with real module id
function ensureModuleSaved(moduleEl){
    return new Promise(function(resolve, reject){
        if (!moduleEl) return reject();
        var moduleId = moduleEl.getAttribute('data-module-id');
        if (moduleId && moduleId.indexOf('new_') !== 0) return resolve(moduleId);
        var titleNode = moduleEl.querySelector('.module-header span[style*="font-weight:700"]');
        var title = titleNode ? (titleNode.textContent || '').trim() : 'Untitled Module';
        var classId = (typeof getCurrentClassIdForTeacher === 'function') ? getCurrentClassIdForTeacher() : null;
        if (!classId) { showWarning('Class Not Selected', 'Please select a class first.'); return reject(); }
        var formData = new FormData();
        formData.append('action','class_module_create');
        formData.append('class_id', String(classId));
        formData.append('title', title);
        getCSRFToken().then(function(tok){ if (tok) formData.append('csrf_token', tok); return fetch('teacher_class_api.php',{ method:'POST', body: formData, credentials:'same-origin' }); })
        .then(function(r){ return r.json(); })
        .then(function(d){ if (d && d.success && d.id){ moduleEl.setAttribute('data-module-id', d.id); showNotification('success','Module Saved','Module saved automatically.'); resolve(d.id);} else { showError('Module Save Failed', (d && d.message) ? d.message : 'Failed to save module.'); reject(); } })
        .catch(function(err){ showError('Network Error', 'Could not save module.'); reject(); });
    });
}

// Ensure a lesson is persisted (auto-save if temporary), then resolve with real id
function ensureLessonSaved(lessonEl){
    return new Promise(function(resolve, reject){
        var existingId = lessonEl.getAttribute('data-lesson-id');
        if (existingId && existingId.indexOf('new_') !== 0) {
            return resolve(existingId);
        }
        var moduleEl = lessonEl.closest('.module');
        if (!moduleEl) { showError('Module Error', 'Could not find parent module.'); return reject(); }
        var moduleId = moduleEl.getAttribute('data-module-id');
        if (!moduleId || moduleId.indexOf('new_') === 0) { moduleId = moduleId || 'temp'; }
        var titleNode = lessonEl.querySelector('.lesson-header span[style*="font-weight:600"]');
        var title = titleNode ? (titleNode.textContent || '').trim() : 'Untitled Lesson';

        var formData = new FormData();
        formData.append('action', 'class_lesson_create');
        var clsId = (typeof getCurrentClassIdForTeacher === 'function') ? getCurrentClassIdForTeacher() : null;
        if (!clsId) { showWarning('Class Not Selected', 'Please enter the class first.'); return reject(); }
        formData.append('class_id', String(clsId));
        formData.append('module_id', moduleId);
        formData.append('title', title);

        getTeacherCSRFToken().then(function(token){ if (token) formData.append('csrf_token', token); return fetch('teacher_class_api.php', { method:'POST', body: formData, credentials:'same-origin' }); })
        .then(function(r){ return r.json(); })
        .then(function(d){
            if (d && d.success && d.id){
                lessonEl.setAttribute('data-lesson-id', d.id);
                var saveBtn = lessonEl.querySelector('.save-lesson-btn');
                if (saveBtn) saveBtn.outerHTML = '<span style="background:#e9f5ee;color:#1d9b3e;border:1px solid #dbeafe;padding:4px 8px;border-radius:4px;font-size:11px;display:flex;align-items:center;gap:4px;"><i class="fas fa-check"></i>Saved</span>';
                showNotification('success', 'Lesson Saved', 'Lesson saved automatically.');
                resolve(d.id);
            } else {
                showError('Lesson Save Failed', (d && d.message) ? d.message : 'Failed to save lesson.');
                reject();
            }
        }).catch(function(err){
            showError('Network Error', 'Could not save lesson.');
            reject();
        });
    });
}

function deleteLesson(lessonEl){
    var lessonId = lessonEl.getAttribute('data-lesson-id');
    var title = lessonEl.querySelector('.lesson-header span[style*="font-weight:600"]').textContent.trim();
    
    showConfirm('Delete Lesson', 'Are you sure you want to delete the lesson "' + title + '"? This action cannot be undone.', function(){
        if (lessonId && !lessonId.startsWith('new_')) {
            deleteLessonFromServer(lessonId).then(function(success){
                if (success) {
                    lessonEl.remove();
                    showSuccess('Deleted','Lesson deleted successfully!');
                } else {
                    showError('Delete Failed','Failed to delete lesson from server.');
                }
            });
        } else {
            lessonEl.remove();
            showSuccess('Deleted','Lesson deleted successfully!');
        }
    });
}

function updateLessonOnServer(lessonEl, newTitle){
    var lessonId = lessonEl.getAttribute('data-lesson-id');
    var formData = new FormData();
    formData.append('action', 'lesson_update');
    formData.append('lesson_id', lessonId);
    formData.append('title', newTitle);
    
    getTeacherCSRFToken().then(function(token){
        if (token) formData.append('csrf_token', token);
        return fetch('teacher_outline_api.php', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });
    })
    .then(function(response){ return response.json(); })
    .then(function(data){
        if (!data.success) {
            showErrorNotification('Failed to update lesson: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(function(error){
        showErrorNotification('Network error updating lesson.');
    });
}

function deleteLessonFromServer(lessonId){
    var formData = new FormData();
    formData.append('action', 'lesson_delete');
    formData.append('lesson_id', lessonId);
    
    return getTeacherCSRFToken().then(function(token){
        if (token) formData.append('csrf_token', token);
        return fetch('teacher_outline_api.php', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });
    })
    .then(function(response){ return response.json(); })
    .then(function(data){
        return data.success;
    })
    .catch(function(error){
        return false;
    });
}

// Advanced Features
function duplicateModule(moduleEl){
    var title = moduleEl.querySelector('.module-header span[style*="font-weight:700"]').textContent.trim();
    var newTitle = title + ' (Copy)';
    
    // Create new module with duplicated content
    createNewModule(newTitle);
    
    // Copy all lessons and topics
    var lessons = moduleEl.querySelectorAll('.lesson');
    lessons.forEach(function(lesson){
        var lessonTitle = lesson.querySelector('.lesson-header span[style*="font-weight:600"]').textContent.trim();
        var newModule = document.querySelector('.module:last-child');
        if (newModule) {
            createNewLesson(newModule, lessonTitle);
        }
    });
    
    showNotification('success', 'Duplicated', 'Module duplicated successfully!');
}

function exportModule(moduleEl){
    var title = moduleEl.querySelector('.module-header span[style*="font-weight:700"]').textContent.trim();
    var moduleData = {
        title: title,
        lessons: []
    };
    
    var lessons = moduleEl.querySelectorAll('.lesson');
    lessons.forEach(function(lesson){
        var lessonTitle = lesson.querySelector('.lesson-header span[style*="font-weight:600"]').textContent.trim();
        var lessonData = {
            title: lessonTitle,
            materials: []
        };
        
        var materials = lesson.querySelectorAll('.material-item');
        materials.forEach(function(material){
            var materialData = {
                type: material.getAttribute('data-type'),
                title: material.querySelector('.material-title').textContent.trim(),
                url: material.getAttribute('data-url') || null
            };
            lessonData.materials.push(materialData);
        });
        
        moduleData.lessons.push(lessonData);
    });
    
    // Download as JSON
    var dataStr = JSON.stringify(moduleData, null, 2);
    var dataBlob = new Blob([dataStr], {type: 'application/json'});
    var url = URL.createObjectURL(dataBlob);
    var link = document.createElement('a');
    link.href = url;
    link.download = title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_module.json';
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('success', 'Exported', 'Module exported successfully!');
}

// Enhanced UI Functions
function showModuleSettings(moduleEl){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:500px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Module Settings</h3>' +
            '<button id="closeSettingsModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div style="margin-bottom:20px;">' +
            '<label style="display:block;margin-bottom:8px;color:#374151;font-weight:600;">Module Title</label>' +
            '<input type="text" id="moduleTitleInput" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;" />' +
        '</div>' +
        '<div style="margin-bottom:20px;">' +
            '<label style="display:block;margin-bottom:8px;color:#374151;font-weight:600;">Description (Optional)</label>' +
            '<textarea id="moduleDescInput" rows="3" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;resize:vertical;" placeholder="Enter module description..."></textarea>' +
        '</div>' +
        '<div style="margin-bottom:20px;">' +
            '<label style="display:flex;align-items:center;gap:8px;color:#374151;font-weight:600;">' +
                '<input type="checkbox" id="moduleVisibleCheck" checked />' +
                'Make module visible to students' +
            '</label>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelSettingsBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
            '<button id="saveSettingsBtn" style="background:#1d9b3e;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Save Settings</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Populate current values
    var currentTitle = moduleEl.querySelector('.module-header span[style*="font-weight:700"]').textContent.trim();
    modal.querySelector('#moduleTitleInput').value = currentTitle;
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelSettingsBtn');
    var saveBtn = modal.querySelector('#saveSettingsBtn');
    var closeBtn = modal.querySelector('#closeSettingsModal');
    
    if (cancelBtn) cancelBtn.addEventListener('click', function(){ modal.remove(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.remove(); });
    
    if (saveBtn) {
        saveBtn.addEventListener('click', function(){
            var newTitle = modal.querySelector('#moduleTitleInput').value.trim();
            var description = modal.querySelector('#moduleDescInput').value.trim();
            var isVisible = modal.querySelector('#moduleVisibleCheck').checked;
            
            if (!newTitle) {
                showWarning('Validation Error', 'Please enter a module title.');
                return;
            }
            
            // Update module
            var titleSpan = moduleEl.querySelector('.module-header span[style*="font-weight:700"]');
            titleSpan.textContent = newTitle;
            
            // Save to server if needed
            var moduleId = moduleEl.getAttribute('data-module-id');
            if (moduleId && !moduleId.startsWith('new_')) {
                updateModuleOnServer(moduleEl, newTitle);
            }
            
            showNotification('success', 'Updated', 'Module settings saved successfully!');
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

// Advanced Features
function showModuleTemplates(moduleEl){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:600px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Module Templates</h3>' +
            '<button id="closeTemplateModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px;">' +
            '<div class="template-card" data-template="programming" style="border:2px solid #e5e7eb;border-radius:8px;padding:15px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#3b82f6\';this.style.backgroundColor=\'#f8fafc\';" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.backgroundColor=\'white\';">' +
                '<div style="font-weight:600;color:#374151;margin-bottom:8px;">Programming Module</div>' +
                '<div style="color:#6b7280;font-size:12px;">Variables, Functions, Loops, Arrays</div>' +
            '</div>' +
            '<div class="template-card" data-template="web-dev" style="border:2px solid #e5e7eb;border-radius:8px;padding:15px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#3b82f6\';this.style.backgroundColor=\'#f8fafc\';" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.backgroundColor=\'white\';">' +
                '<div style="font-weight:600;color:#374151;margin-bottom:8px;">Web Development</div>' +
                '<div style="color:#6b7280;font-size:12px;">HTML, CSS, JavaScript, Responsive Design</div>' +
            '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelTemplateBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Template selection
    modal.querySelectorAll('.template-card').forEach(function(card){
        card.addEventListener('click', function(){
            var template = this.getAttribute('data-template');
            applyModuleTemplate(moduleEl, template);
            modal.remove();
        });
    });
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelTemplateBtn');
    var closeBtn = modal.querySelector('#closeTemplateModal');
    
    if (cancelBtn) cancelBtn.addEventListener('click', function(){ modal.remove(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.remove(); });
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function applyModuleTemplate(moduleEl, template){
    var templates = {
        programming: [
            {type: 'lesson', title: 'Introduction to Programming', topics: ['What is Programming?', 'Programming Languages', 'Development Environment']},
            {type: 'lesson', title: 'Variables and Data Types', topics: ['Variables', 'Data Types', 'Constants', 'Type Conversion']},
            {type: 'lesson', title: 'Control Structures', topics: ['Conditional Statements', 'Loops', 'Switch Statements']}
        ],
        'web-dev': [
            {type: 'lesson', title: 'HTML Fundamentals', topics: ['HTML Structure', 'Tags and Elements', 'Attributes', 'Forms']},
            {type: 'lesson', title: 'CSS Styling', topics: ['Selectors', 'Properties', 'Layout', 'Responsive Design']},
            {type: 'lesson', title: 'JavaScript Basics', topics: ['DOM Manipulation', 'Events', 'AJAX']}
        ]
    };
    
    var templateData = templates[template];
    if (!templateData) return;
    
    // Clear existing content
    var moduleContent = moduleEl.querySelector('.module-content');
    if (moduleContent) {
        moduleContent.innerHTML = '';
    }
    
    // Apply template
    templateData.forEach(function(item){
        if (item.type === 'lesson') {
            createNewLesson(moduleEl, item.title);
            // Add topics to the lesson
            setTimeout(function(){
                var newLesson = moduleEl.querySelector('.lesson:last-child');
                if (newLesson && item.topics) {
                    item.topics.forEach(function(topicTitle){
                        createNewTopic(newLesson, topicTitle);
                    });
                }
            }, 100);
        }
    });
    
    showNotification('success', 'Template Applied', 'Module template applied successfully!');
}

function showBulkOperations(moduleEl){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:500px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Bulk Operations</h3>' +
            '<button id="closeBulkModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div style="margin-bottom:20px;">' +
            '<div style="color:#6b7280;font-style:italic;text-align:center;">Bulk operations allow you to perform actions on multiple items at once.</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelBulkBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelBulkBtn');
    var closeBtn = modal.querySelector('#closeBulkModal');
    
    if (cancelBtn) cancelBtn.addEventListener('click', function(){ modal.remove(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.remove(); });
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Notification System
function showNotification(type, title, message){
    var notification = document.createElement('div');
    notification.style.cssText = 'position:fixed;top:20px;right:20px;background:white;border-left:4px solid ' + 
        (type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6') + 
        ';padding:15px 20px;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:10000;max-width:400px;';
    
    notification.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">' +
        '<div>' +
            '<div style="font-weight:600;color:#374151;margin-bottom:4px;">' + title + '</div>' +
            '<div style="color:#6b7280;font-size:14px;">' + message + '</div>' +
        '</div>' +
        '<button onclick="this.parentElement.parentElement.parentElement.remove()" style="background:none;border:none;color:#9ca3af;cursor:pointer;font-size:18px;">&times;</button>' +
    '</div>';
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(function(){
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}


// Add Lesson Modal
function showAddLessonModal(moduleEl){
    // Guard against duplicate instances (second implementation)
    if (document.querySelector('[data-modal="add-lesson"]')) return;
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.setAttribute('data-modal', 'add-lesson');
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:500px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Add New Lesson</h3>' +
            '<button id="closeLessonModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div style="margin-bottom:20px;">' +
            '<label style="display:block;margin-bottom:8px;color:#374151;font-weight:600;">Lesson Title</label>' +
            '<input type="text" id="lessonTitleInput" placeholder="Enter lesson title..." style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;" />' +
        '</div>' +
        '<div style="margin-bottom:20px;">' +
            '<label style="display:block;margin-bottom:8px;color:#374151;font-weight:600;">Description (Optional)</label>' +
            '<textarea id="lessonDescInput" rows="3" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;resize:vertical;" placeholder="Enter lesson description..."></textarea>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelLessonBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
            '<button id="createLessonBtn" style="background:#1d9b3e;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Create Lesson</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Focus on input
    var input = modal.querySelector('#lessonTitleInput');
    if (input) {
        input.focus();
    }
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelLessonBtn');
    var createBtn = modal.querySelector('#createLessonBtn');
    var closeBtn = modal.querySelector('#closeLessonModal');
    
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
            var title = modal.querySelector('#lessonTitleInput').value.trim();
            var description = modal.querySelector('#lessonDescInput').value.trim();
            
            if (title) {
                createNewLesson(moduleEl, title);
                modal.remove();
            } else {
                if (typeof showWarning === 'function') showWarning('Validation Error', 'Please enter a lesson title.');
            }
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
                    showWarning('Validation', 'Please enter a lesson title.');
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

// Advanced Features
function showModuleTemplates(moduleEl){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:600px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Module Templates</h3>' +
            '<button id="closeTemplateModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px;">' +
            '<div class="template-card" data-template="programming" style="border:2px solid #e5e7eb;border-radius:8px;padding:15px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#3b82f6\';this.style.backgroundColor=\'#f8fafc\';" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.backgroundColor=\'white\';">' +
                '<div style="font-weight:600;color:#374151;margin-bottom:8px;">Programming Module</div>' +
                '<div style="color:#6b7280;font-size:12px;">Variables, Functions, Loops, Arrays</div>' +
            '</div>' +
            '<div class="template-card" data-template="web-dev" style="border:2px solid #e5e7eb;border-radius:8px;padding:15px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#3b82f6\';this.style.backgroundColor=\'#f8fafc\';" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.backgroundColor=\'white\';">' +
                '<div style="font-weight:600;color:#374151;margin-bottom:8px;">Web Development</div>' +
                '<div style="color:#6b7280;font-size:12px;">HTML, CSS, JavaScript, Responsive Design</div>' +
            '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelTemplateBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Template selection
    modal.querySelectorAll('.template-card').forEach(function(card){
        card.addEventListener('click', function(){
            var template = this.getAttribute('data-template');
            applyModuleTemplate(moduleEl, template);
            modal.remove();
        });
    });
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelTemplateBtn');
    var closeBtn = modal.querySelector('#closeTemplateModal');
    
    if (cancelBtn) cancelBtn.addEventListener('click', function(){ modal.remove(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.remove(); });
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function applyModuleTemplate(moduleEl, template){
    var templates = {
        programming: [
            {type: 'lesson', title: 'Introduction to Programming', topics: ['What is Programming?', 'Programming Languages', 'Development Environment']},
            {type: 'lesson', title: 'Variables and Data Types', topics: ['Variables', 'Data Types', 'Constants', 'Type Conversion']},
            {type: 'lesson', title: 'Control Structures', topics: ['Conditional Statements', 'Loops', 'Switch Statements']}
        ],
        'web-dev': [
            {type: 'lesson', title: 'HTML Fundamentals', topics: ['HTML Structure', 'Tags and Elements', 'Attributes', 'Forms']},
            {type: 'lesson', title: 'CSS Styling', topics: ['Selectors', 'Properties', 'Layout', 'Responsive Design']},
            {type: 'lesson', title: 'JavaScript Basics', topics: ['DOM Manipulation', 'Events', 'AJAX']}
        ]
    };
    
    var templateData = templates[template];
    if (!templateData) return;
    
    // Clear existing content
    var moduleContent = moduleEl.querySelector('.module-content');
    if (moduleContent) {
        moduleContent.innerHTML = '';
    }
    
    // Apply template
    templateData.forEach(function(item){
        if (item.type === 'lesson') {
            createNewLesson(moduleEl, item.title);
            // Add topics to the lesson
            setTimeout(function(){
                var newLesson = moduleEl.querySelector('.lesson:last-child');
                if (newLesson && item.topics) {
                    item.topics.forEach(function(topicTitle){
                        createNewTopic(newLesson, topicTitle);
                    });
                }
            }, 100);
        }
    });
    
    showNotification('success', 'Template Applied', 'Module template applied successfully!');
}

function showBulkOperations(moduleEl){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = '<div style="background:white;border-radius:8px;padding:20px;max-width:500px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">' +
            '<h3 style="margin:0;color:#1d9b3e;font-weight:700;">Bulk Operations</h3>' +
            '<button id="closeBulkModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button>' +
        '</div>' +
        '<div style="margin-bottom:20px;">' +
            '<div style="color:#6b7280;font-style:italic;text-align:center;">Bulk operations allow you to perform actions on multiple items at once.</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:15px;">' +
            '<button id="cancelBulkBtn" style="background:#6b7280;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>' +
        '</div>' +
    '</div>';
    
    document.body.appendChild(modal);
    
    // Event listeners
    var cancelBtn = modal.querySelector('#cancelBulkBtn');
    var closeBtn = modal.querySelector('#closeBulkModal');
    
    if (cancelBtn) cancelBtn.addEventListener('click', function(){ modal.remove(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.remove(); });
    
    // Close on backdrop click
    modal.addEventListener('click', function(e){
        if (e.target === modal) {
            modal.remove();
        }
    });
}

