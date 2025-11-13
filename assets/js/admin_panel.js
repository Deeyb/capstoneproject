// All admin panel JS moved here from admin_panel.php
// ... (full script content from admin_panel.php <script> blocks) ...
// (I will move all the logic for user CRUD, modals, notifications, dashboard updates, etc.) 

// Admin Panel JS - Restored core logic

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

(function(init){
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(function() {
    // Register Chart.js datalabels plugin FIRST before any chart initialization
    if (window.Chart && window.ChartDataLabels) {
        Chart.register(window.ChartDataLabels);
        console.log('ChartDataLabels plugin registered successfully');
    } else {
        console.error('ChartDataLabels plugin not found or Chart.js not loaded');
    }

    // Header controls: Dark Mode + Settings (with defensive guards)
    const themeToggle = document.getElementById('themeToggle');
    const settingsIcon = document.getElementById('settingsIcon');
    const settingsDropdown = document.getElementById('settingsDropdown');

    try {
        // Apply saved theme (shared key across dashboards)
        const savedTheme = localStorage.getItem('theme') || localStorage.getItem('adminTheme') || 'light';
        console.log('Saved theme found:', savedTheme);
        if (savedTheme === 'dark') {
            console.log('Applying saved dark theme');
            document.body.classList.add('dark-mode');
            if (themeToggle) {
                // Check if this is the <i> element itself or contains an <i> element
                if (themeToggle.tagName === 'I') {
                    // This IS the icon element (Coordinator dashboard case)
                    console.log('Theme toggle is <i> element, updating directly');
                    themeToggle.classList.remove('fa-moon');
                    themeToggle.classList.add('fa-sun');
                    console.log('Updated theme toggle to sun icon');
                } else {
                    // This contains an icon element (Admin dashboard case)
                    console.log('Theme toggle contains <i> element, updating child');
                    const icon = themeToggle.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-moon');
                        icon.classList.add('fa-sun');
                        console.log('Updated child icon to sun');
                    } else {
                        console.error('No <i> element found in theme toggle');
                    }
                }
            } else {
                console.error('Theme toggle element not found for saved theme');
            }
        } else {
            console.log('No saved dark theme, using light theme');
        }

        // Settings dropdown toggle (guard against double-binding)
        if (settingsIcon && settingsDropdown && !settingsIcon.__bound) {
            settingsIcon.__bound = true;
            settingsIcon.addEventListener('click', function(e) {
                e.stopPropagation();
                const current = settingsDropdown.style.display || window.getComputedStyle(settingsDropdown).display;
                settingsDropdown.style.display = current === 'none' ? 'block' : 'none';
            });

            // Close dropdown when clicking outside
            if (!window.__settingsOutsideCloseBound) {
                window.__settingsOutsideCloseBound = true;
                document.addEventListener('click', function(e) {
                    if (settingsDropdown && !settingsDropdown.contains(e.target) && e.target !== settingsIcon) {
                        settingsDropdown.style.display = 'none';
                    }
                });
            }
        }

        // Theme toggle functionality
        if (themeToggle && !themeToggle.__bound) {
            themeToggle.__bound = true;
            console.log('Setting up theme toggle for:', themeToggle.tagName, themeToggle.id);
            themeToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Theme toggle clicked! Element:', this.tagName, this.id);

                document.body.classList.toggle('dark-mode');
                const isDark = document.body.classList.contains('dark-mode');
                console.log('Dark mode:', isDark);

                // Check if this is the <i> element itself or contains an <i> element
                if (this.tagName === 'I') {
                    // This IS the icon element (Coordinator dashboard case)
                    console.log('This is an <i> element, updating classes directly');
                    if (isDark) {
                        this.classList.remove('fa-moon');
                        this.classList.add('fa-sun');
                        console.log('Switched to sun icon');
                    } else {
                        this.classList.remove('fa-sun');
                        this.classList.add('fa-moon');
                        console.log('Switched to moon icon');
                    }
                } else {
                    // This contains an icon element (Admin dashboard case)
                    console.log('This contains an <i> element, updating child icon');
                    const icon = this.querySelector('i');
                    if (icon) {
                        if (isDark) {
                            icon.classList.remove('fa-moon');
                            icon.classList.add('fa-sun');
                            console.log('Updated child icon to sun');
                        } else {
                            icon.classList.remove('fa-sun');
                            icon.classList.add('fa-moon');
                            console.log('Updated child icon to moon');
                        }
                    } else {
                        console.error('No <i> element found inside theme toggle');
                    }
                }
                
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                localStorage.setItem('adminTheme', isDark ? 'dark' : 'light');
                console.log('Theme saved to localStorage');

                // Re-initialize charts with new theme colors (if present)
                if (window.userRoleChart && typeof window.userRoleChart.refreshChart === 'function') {
                    window.userRoleChart.refreshChart();
                }
                if (window.userStatusChart && typeof window.userStatusChart.refreshChart === 'function') {
                    window.userStatusChart.refreshChart();
                }
                
                // Refresh analytics charts with new theme (if present)
                if (window.analyticsCharts) {
                    setTimeout(() => {
                        Object.values(window.analyticsCharts).forEach(chart => {
                            if (chart && chart.chart && typeof chart.refresh === 'function') {
                                chart.refresh();
                            }
                        });
                    }, 100);
                }
            });
        } else {
            console.error('Theme toggle element not found!');
        }
        // Fallback: delegate clicks in case icons are re-rendered
        document.addEventListener('click', function(ev){
            const t = ev.target;
            if (t && (t.id === 'themeToggle' || t.closest && t.closest('#themeToggle'))) {
                if (themeToggle) themeToggle.click();
            }
            if (t && (t.id === 'settingsIcon' || (t.closest && t.closest('#settingsIcon')))) {
                if (settingsIcon) settingsIcon.click();
            }
        });
    } catch (err) {
        console.error('Header controls init failed:', err);
    }

    // Expose CSRF token fetcher for other modules (e.g., Play Area)
    if (typeof window.getCSRFToken !== 'function') {
        window.getCSRFToken = async function(){
            try {
                const fd = new FormData();
                fd.append('action','get_csrf_token');
                const res = await fetch('course_outline_manage.php', { method:'POST', credentials:'same-origin', body: fd });
                const data = await res.json();
                return data && data.success ? data.token : null;
            } catch (e) { return null; }
        };
    }

    // Animated Stat Counter
    function animateCounter(element, to) {
        let start = 0;
        const duration = 900;
        const step = (timestamp, startTime) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const value = Math.floor(progress * (to - start) + start);
            element.textContent = value;
            if (progress < 1) {
                requestAnimationFrame(ts => step(ts, startTime));
            } else {
                element.textContent = to;
                element.classList.remove('animated');
            }
        };
        element.classList.add('animated');
        requestAnimationFrame(ts => step(ts));
    }
    // Animate all stat cards on load
    function animateAllStats(stats) {
        animateCounter(document.getElementById('statTotalUsers'), stats.totalUsers);
        animateCounter(document.getElementById('statTotalStudents'), stats.totalStudents);
        animateCounter(document.getElementById('statTotalTeachers'), stats.totalTeachers);
        animateCounter(document.getElementById('statTotalCoordinators'), stats.totalCoordinators);
        animateCounter(document.getElementById('statActiveCourses'), stats.activeCourses);
    }
    
    // Add click functionality to stat cards
    function addStatCardInteractions() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            card.addEventListener('click', function() {
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                ripple.style.left = '50%';
                ripple.style.top = '50%';
                this.appendChild(ripple);
                setTimeout(() => { ripple.remove(); }, 600);

                // Attribute-driven first
                const role = this.getAttribute('data-role');
                const target = this.getAttribute('data-target');
                if (role) {
                    const nav = document.querySelector('[data-section="users"]');
                    if (nav) nav.click();
                    setTimeout(() => {
                        // Ensure Users sub-tab is active
                        const tabUsersBtn = document.getElementById('tabUsers');
                        if (tabUsersBtn) tabUsersBtn.click();
                        // Reset filters and set role
                        const searchInp = document.getElementById('userSearchInput');
                        const statusSel = document.getElementById('userStatusSelect');
                        const roleSel = document.getElementById('userRoleSelect');
                        if (searchInp) searchInp.value = '';
                        if (statusSel) statusSel.value = '';
                        if (roleSel) roleSel.value = role;
                        window.__userTablePage = 1;
                        loadUsers();
                    }, 120);
                    return;
                }
                if (target) {
                    const nav = document.querySelector(`[data-section="${target}"]`);
                    if (nav) nav.click();
                    if (target === 'users') {
                        setTimeout(() => {
                            const tabUsersBtn = document.getElementById('tabUsers');
                            if (tabUsersBtn) tabUsersBtn.click();
                            const searchInp = document.getElementById('userSearchInput');
                            const statusSel = document.getElementById('userStatusSelect');
                            const roleSel = document.getElementById('userRoleSelect');
                            if (searchInp) searchInp.value = '';
                            if (statusSel) statusSel.value = '';
                            if (roleSel) roleSel.value = '';
                            window.__userTablePage = 1;
                            loadUsers();
                        }, 120);
                    }
                    return;
                }

                // Fallback to index mapping
                switch(index) {
                    case 0:
                        document.querySelector('[data-section="users"]').click();
                        break;
                    case 1:
                        document.querySelector('[data-section="users"]').click();
                        setTimeout(() => { document.getElementById('userRoleSelect').value = 'STUDENT'; loadUsers(); }, 120);
                        break;
                    case 2:
                        document.querySelector('[data-section="users"]').click();
                        setTimeout(() => { document.getElementById('userRoleSelect').value = 'TEACHER'; loadUsers(); }, 120);
                        break;
                    case 3:
                        document.querySelector('[data-section="users"]').click();
                        setTimeout(() => { document.getElementById('userRoleSelect').value = 'COORDINATOR'; loadUsers(); }, 120);
                        break;
                    case 4:
                        document.querySelector('[data-section="courses"]').click();
                        break;
                }
            });
        });
    }
    // Fade/slide-in for cards
    function animateDashboardCards() {
        document.querySelectorAll('.card-animate').forEach((el, i) => {
            el.style.opacity = 0;
            setTimeout(() => {
                el.style.opacity = 1;
                el.classList.add('card-animate');
            }, 100 + i * 120);
        });
    }
    // Animate list appearance
    function animateListItems(listId) {
        const list = document.getElementById(listId);
        if (!list) return;
        list.querySelectorAll('.activity-item').forEach((item, i) => {
            item.style.opacity = 0;
            item.style.transform = 'translateY(20px)';
            setTimeout(() => {
                item.style.transition = 'opacity 0.5s, transform 0.5s';
                item.style.opacity = 1;
                item.style.transform = 'translateY(0)';
            }, 80 + i * 80);
        });
    }
    // Dashboard widgets
    function updateDashboardStats() {
        // Only call this API if dashboard stats elements exist (admin/coordinator/teacher only)
        const statTotalUsers = document.getElementById('statTotalUsers');
        if (!statTotalUsers) {
            // Dashboard stats elements don't exist (likely student dashboard), skip silently
            return;
        }
        
        fetch('dashboard_stats_ajax.php', { credentials: 'same-origin' })
            .then(response => {
                // Handle 403 Forbidden silently (expected for students/unauthorized users)
                if (response.status === 403) {
                    return null; // Silently skip for unauthorized users
                }
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return response.json();
                } else {
                    return response.text().then(text => {
                        throw new Error('Server returned non-JSON response: ' + text.substring(0, 200));
                    });
                }
            })
            .then(data => {
                if (!data) return; // Skip if 403 was returned
                const statTotalUsers = document.getElementById('statTotalUsers');
                if (statTotalUsers) statTotalUsers.textContent = data.totalUsers;
                const statTotalStudents = document.getElementById('statTotalStudents');
                if (statTotalStudents) statTotalStudents.textContent = data.totalStudents;
                const statTotalTeachers = document.getElementById('statTotalTeachers');
                if (statTotalTeachers) statTotalTeachers.textContent = data.totalTeachers;
                const statTotalCoordinators = document.getElementById('statTotalCoordinators');
                if (statTotalCoordinators) statTotalCoordinators.textContent = data.totalCoordinators;
                const statActiveCourses = document.getElementById('statActiveCourses');
                if (statActiveCourses) statActiveCourses.textContent = data.activeCourses;
            })
            .catch(error => {
                // Only log to console, don't show notification (handled silently)
                console.log('Dashboard stats update skipped (not available for this role)');
            });
    }

    // Dashboard auto-refresh control
    let dashboardRefreshTimer = null;
    let dashboardRefreshRateSec = 10;

    function refreshDashboardOnce() {
        const dashboardElement = document.getElementById('dashboard');
        if (dashboardElement && dashboardElement.classList.contains('active')) {
            updateDashboardStats();
            // Refresh charts
            if (window.userRoleChartInstance) { window.userRoleChartInstance.refresh(); }
            if (window.userStatusChartInstance) { window.userStatusChartInstance.refresh(); }
            // Refresh widgets
            if (window.registeredWidgetInstance) { window.registeredWidgetInstance.init(); }
            if (window.loginWidgetInstance) { window.loginWidgetInstance.init(); }
        }
    }

    function applyDashboardRefreshRate(rateSec) {
        try { rateSec = parseInt(rateSec, 10); } catch(e) { rateSec = 10; }
        dashboardRefreshRateSec = Math.max(0, rateSec || 0);
        if (dashboardRefreshTimer) {
            clearInterval(dashboardRefreshTimer);
            dashboardRefreshTimer = null;
        }
        if (dashboardRefreshRateSec > 0) {
            dashboardRefreshTimer = setInterval(refreshDashboardOnce, dashboardRefreshRateSec * 1000);
        }
    }

    // Coordinator dashboard dynamic data - moved to main initCoordinatorDashboard function
    // Global function for creating course modal
    function ensureCreateCourseModal(){
        let modal = document.getElementById('createCourseModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'createCourseModal';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
              <div class="modal-card">
                <h3 class="modal-title">Create Course</h3>
                <form id="createCourseForm">
                  <label class="modal-label">Course Code</label>
                  <input type="text" id="createCourseCode" name="code" class="modal-input" placeholder="e.g., CS101" required />
                  <label class="modal-label" style="margin-top:10px;">Course Title</label>
                  <input type="text" id="createCourseTitle" name="title" class="modal-input" placeholder="e.g., Introduction to Programming" required />
                  
                  <div id="createCourseError" class="error-message" style="margin-top:6px;"></div>
                  <div class="modal-actions">
                    <button type="submit" class="action-btn" style="background:#1d9b3e;color:#fff;">Create</button>
                    <button type="button" id="createCourseCancel" class="action-btn" style="background:#6c757d;color:#fff;">Cancel</button>
                              </div>
                </form>
              </div>`;
            document.body.appendChild(modal);
            const cancelBtn = document.getElementById('createCourseCancel');
            if (cancelBtn) cancelBtn.onclick = function(){ modal.style.display = 'none'; };
            // Bind submit handler for dynamically created form
            const form = document.getElementById('createCourseForm');
            if (form) form.onsubmit = function(e){
                e.preventDefault();
                const code = (document.getElementById('createCourseCode')||{}).value || '';
                const title = (document.getElementById('createCourseTitle')||{}).value || '';
                if (!code || !title) {
                    const err = document.getElementById('createCourseError');
                    if (err) err.textContent = 'Please fill in all fields.';
                    return;
                }
                // Submit course creation
                fetch('coordinator_action.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `action=create_course&code=${encodeURIComponent(code)}&title=${encodeURIComponent(title)}`
                })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        modal.style.display = 'none';
                        if (typeof window.__coordLoadCourses === 'function') {
                            window.__coordLoadCourses();
                        }
                        if (typeof showNotification === 'function') {
                            showNotification('success', 'Success', 'Course created successfully!');
                        }
                    } else {
                        const err = document.getElementById('createCourseError');
                        if (err) err.textContent = data.message || 'Failed to create course.';
                    }
                })
                .catch(err => {
                    const errEl = document.getElementById('createCourseError');
                    if (errEl) errEl.textContent = 'Network error. Please try again.';
                });
            };
        }
        const codeInput = document.getElementById('createCourseCode');
        const titleInput = document.getElementById('createCourseTitle'); if (titleInput) titleInput.value = '';
        modal.style.display = 'flex';
        setTimeout(()=> codeInput && codeInput.focus(), 50);
    }

    // --- Coordinator Courses: list and actions ---
    (function initCoordinatorCourses(){
        const table = document.getElementById('coursesTableWrapper');
        if (!table) return;
        function renderRows(rows){
            if (!rows || !rows.length) { table.innerHTML = '<div class="empty-state">No courses found</div>'; return; }
            table.innerHTML = `
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Modules</th>
                    <th>Lessons</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows.map(c => `
                    <tr>
                      <td>${c.code || ''}</td>
                      <td>${c.title || ''}</td>
                      <td>${c.status}</td>
                      <td>${c.modules_count || 0}</td>
                      <td>${c.lessons_count || 0}</td>
                      <td>${c.updated_at ? new Date(c.updated_at).toLocaleString() : ''}</td>
                      <td>
                        <button class="action-btn edit-btn" data-id="${c.id}" data-code="${(c.code||'').replaceAll('"','&quot;')}" data-title="${(c.title||'').replaceAll('"','&quot;')}" data-act="edit">Edit</button>
                        <button class="action-btn" data-id="${c.id}" data-act="outline">Outline</button>
                        ${c.status !== 'published' ? `<button class="action-btn" data-id="${c.id}" data-act="publish">Publish</button>` : `<button class="action-btn" data-id="${c.id}" data-act="unpublish">Unpublish</button>`}
                        <button class="action-btn" data-id="${c.id}" data-act="archive" style="background:#ffc107;color:#000;">Archive</button>
                        <button class="action-btn delete-btn" data-id="${c.id}" data-act="delete">Delete</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `;
            attachCourseActions();
        }
        function loadCourses(){
            const q = document.getElementById('courseSearch')?.value || '';
            const status = document.getElementById('courseStatusFilter')?.value || '';
            table.innerHTML = '<div style="text-align:center;padding:30px 0;">Loading...</div>';
            const url = `courses_list_ajax.php?search=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}`;
            fetch(url, { credentials: 'same-origin' })
              .then(r => r.ok ? r.json() : Promise.reject())
              .then(res => { if (res && res.success) renderRows(res.data); else table.innerHTML = '<div class="empty-state">Failed to load</div>'; })
              .catch(()=> table.innerHTML = '<div class="empty-state">Failed to load</div>');
        }
        // Expose to global scope for other coordinator modules
        window.__coordLoadCourses = loadCourses;
        function attachCourseActions(){
            table.querySelectorAll('button[data-act]').forEach(btn => {
                btn.onclick = function(){
                    const id = this.getAttribute('data-id');
                    const act = this.getAttribute('data-act');
                    if (act === 'edit') {
                        ensureEditCourseModal();
                        const modal = document.getElementById('editCourseModal');
                        const codeInput = document.getElementById('editCourseCode');
                        const titleInput = document.getElementById('editCourseTitle');
                        const idInput = document.getElementById('editCourseId');
                        const err = document.getElementById('editCourseError');
                        if (err) err.textContent = '';
                        if (idInput) idInput.value = id || '';
                        if (codeInput) codeInput.value = this.getAttribute('data-code') || '';
                        if (titleInput) titleInput.value = this.getAttribute('data-title') || '';
                        if (modal) modal.style.display = 'flex';
                        setTimeout(()=> codeInput && codeInput.focus(), 50);
                        return;
                    }
                    if (act === 'outline') {
                        openCourseOutline(id);
                        return;
                    }
                    const form = new FormData();
                    form.append('id', id);
                    if (act === 'publish') form.append('status','published');
                    if (act === 'unpublish') form.append('status','draft');
                    if (act === 'archive') form.append('action','archive');
                    if (act === 'unarchive') form.append('action','unarchive');
                    if (act === 'delete') form.append('action','delete');
                    if (act === 'publish' || act === 'unpublish') form.append('action','status');
                    fetch('course_manage.php', { method:'POST', body: form, credentials: 'same-origin' })
                      .then(r => r.ok ? r.json() : Promise.reject())
                      .then(res => { if (res && res.success) { showNotification('success','Success','Updated'); loadCourses(); } else { showNotification('error','Error','Action failed'); } });
                };
            });
        }
        const search = document.getElementById('courseSearch');
        if (search) search.addEventListener('input', ()=>{ clearTimeout(window.__courseDeb); window.__courseDeb=setTimeout(window.__coordLoadCourses,300); });
        const filter = document.getElementById('courseStatusFilter');
        if (filter) filter.addEventListener('change', window.__coordLoadCourses);
        function ensureCreateCourseModal(){
            let modal = document.getElementById('createCourseModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'createCourseModal';
                modal.className = 'modal-overlay';
                modal.innerHTML = `
                  <div class="modal-card">
                    <h3 class="modal-title">Create Course</h3>
                    <form id="createCourseForm">
                      <label class="modal-label">Course Code</label>
                      <input type="text" id="createCourseCode" name="code" class="modal-input" placeholder="e.g., CS101" required />
                      <label class="modal-label" style="margin-top:10px;">Course Title</label>
                      <input type="text" id="createCourseTitle" name="title" class="modal-input" placeholder="e.g., Introduction to Programming" required />
                      
                      <div id="createCourseError" class="error-message" style="margin-top:6px;"></div>
                      <div class="modal-actions">
                        <button type="submit" class="action-btn" style="background:#1d9b3e;color:#fff;">Create</button>
                        <button type="button" id="createCourseCancel" class="action-btn" style="background:#6c757d;color:#fff;">Cancel</button>
                      </div>
                    </form>
                  </div>`;
                document.body.appendChild(modal);
                const cancelBtn = document.getElementById('createCourseCancel');
                if (cancelBtn) cancelBtn.onclick = function(){ modal.style.display = 'none'; };
                // Bind submit handler for dynamically created form
                const form = document.getElementById('createCourseForm');
                if (form) form.onsubmit = function(e){
                    e.preventDefault();
                    const code = (document.getElementById('createCourseCode')||{}).value || '';
                    const title = (document.getElementById('createCourseTitle')||{}).value || '';
                    const err = document.getElementById('createCourseError');
                    if (!code.trim() || !title.trim()) { if (err) err.textContent = 'Both code and title are required.'; return; }
                    const fd = new FormData();
                    fd.append('action','create');
                    fd.append('code', code.trim());
                    fd.append('title', title.trim());
                    fetch('course_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
                      .then(r => r.ok ? r.json() : Promise.reject())
                      .then(res => {
                        if (res && res.success) {
                            showNotification('success','Created','Course added');
                            modal.style.display = 'none';
                            loadCourses();
                        } else {
                            showNotification('error','Error', (res && res.message) || 'Create failed');
                        }
                      })
                      .catch(()=> showNotification('error','Error','Create failed'));
                };
            }
            // Reset fields each open
            const err = document.getElementById('createCourseError'); if (err) err.textContent = '';
            const codeInput = document.getElementById('createCourseCode'); if (codeInput) codeInput.value = '';
            const titleInput = document.getElementById('createCourseTitle'); if (titleInput) titleInput.value = '';
            modal.style.display = 'flex';
            setTimeout(()=> codeInput && codeInput.focus(), 50);
        }
        const createBtn = document.getElementById('createCourseBtn');
        if (createBtn) createBtn.onclick = ensureCreateCourseModal;

        function ensureEditCourseModal(){
            let modal = document.getElementById('editCourseModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'editCourseModal';
                modal.className = 'modal-overlay';
                modal.innerHTML = `
                  <div class="modal-card">
                    <h3 class="modal-title">Edit Course</h3>
                    <form id="editCourseForm">
                      <input type="hidden" id="editCourseId" name="id" />
                      <label class="modal-label">Course Code</label>
                      <input type="text" id="editCourseCode" name="code" class="modal-input" placeholder="e.g., CS101" required />
                      <label class="modal-label" style="margin-top:10px;">Course Title</label>
                      <input type="text" id="editCourseTitle" name="title" class="modal-input" placeholder="e.g., Introduction to Programming" required />
                      <div id="editCourseError" class="error-message" style="margin-top:6px;"></div>
                      <div class="modal-actions">
                        <button type="submit" class="action-btn" style="background:#1d9b3e;color:#fff;">Save</button>
                        <button type="button" id="editCourseCancel" class="action-btn" style="background:#6c757d;color:#fff;">Cancel</button>
                      </div>
                    </form>
                  </div>`;
                document.body.appendChild(modal);
                const cancelBtn = document.getElementById('editCourseCancel');
                if (cancelBtn) cancelBtn.onclick = function(){ modal.style.display = 'none'; };
                const form = document.getElementById('editCourseForm');
                if (form) form.onsubmit = function(e){
                    e.preventDefault();
                    const id = (document.getElementById('editCourseId')||{}).value || '';
                    const code = (document.getElementById('editCourseCode')||{}).value || '';
                    const title = (document.getElementById('editCourseTitle')||{}).value || '';
                    const err = document.getElementById('editCourseError');
                    if (!code.trim() || !title.trim()) { if (err) err.textContent = 'Both code and title are required.'; return; }
                    const fd = new FormData();
                    fd.append('action','update');
                    fd.append('id', id);
                    fd.append('code', code.trim());
                    fd.append('title', title.trim());
                    fetch('course_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
                      .then(r => r.ok ? r.json() : Promise.reject())
                      .then(res => {
                        if (res && res.success) {
                            showNotification('success','Saved','Course updated');
                            modal.style.display = 'none';
                            loadCourses();
                        } else {
                            showNotification('error','Error', (res && res.message) || 'Update failed');
                        }
                      })
                      .catch(()=> showNotification('error','Error','Update failed'));
                };
            }
            return modal;
        }

        // Create Course modal submit handler
        const createCourseForm = document.getElementById('createCourseForm');
        if (createCourseForm) createCourseForm.onsubmit = function(e){
            e.preventDefault();
            const code = (document.getElementById('createCourseCode')||{}).value || '';
            const title = (document.getElementById('createCourseTitle')||{}).value || '';
            const err = document.getElementById('createCourseError');
            if (!code.trim() || !title.trim()) {
                if (err) err.textContent = 'Both code and title are required.';
                return;
            }
            const fd = new FormData();
            fd.append('action','create');
            fd.append('code', code.trim());
            fd.append('title', title.trim());
            // visibility removed; handled server-side by role
            fetch('course_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
              .then(r => r.ok ? r.json() : Promise.reject())
              .then(res => {
                if (res && res.success) {
                    showNotification('success','Created','Course added');
                    const modal = document.getElementById('createCourseModal');
                    if (modal) modal.style.display = 'none';
                    loadCourses();
                } else {
                    showNotification('error','Error', (res && res.message) || 'Create failed');
                }
              })
              .catch(()=> showNotification('error','Error','Create failed'));
        };

        // Edit Course modal submit handler
        const editCourseForm = document.getElementById('editCourseForm');
        if (editCourseForm) editCourseForm.onsubmit = function(e){
            e.preventDefault();
            const id = (document.getElementById('editCourseId')||{}).value || '';
            const code = (document.getElementById('editCourseCode')||{}).value || '';
            const title = (document.getElementById('editCourseTitle')||{}).value || '';
            const err = document.getElementById('editCourseError');
            if (!code.trim() || !title.trim()) {
                if (err) err.textContent = 'Both code and title are required.';
                return;
            }
            const fd = new FormData();
            fd.append('action','update');
            fd.append('id', id);
            fd.append('code', code.trim());
            fd.append('title', title.trim());
            const visEdit = document.getElementById('editCourseVisibility');
            if (visEdit && visEdit.value) fd.append('visibility', visEdit.value);
            fetch('course_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
              .then(r => r.ok ? r.json() : Promise.reject())
              .then(res => {
                if (res && res.success) {
                    showNotification('success','Saved','Course updated');
                    const modal = document.getElementById('editCourseModal');
                    if (modal) modal.style.display = 'none';
                    loadCourses();
                } else {
                    showNotification('error','Error', (res && res.message) || 'Update failed');
                }
              })
              .catch(()=> showNotification('error','Error','Update failed'));
        };
        loadCourses();

        // Simple Outline drawer/modal
        function openCourseOutline(courseId){
            // Ensure container exists once
            let cont = document.getElementById('courseOutlineDrawer');
            if (!cont) {
                cont = document.createElement('div');
                cont.id = 'courseOutlineDrawer';
                cont.style.cssText = 'position:fixed;top:0;right:0;width:420px;max-width:95vw;height:100vh;background:#fff;box-shadow:-8px 0 24px rgba(0,0,0,.15);z-index:2200;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .25s ease';
                cont.innerHTML = `
                  <div style="padding:12px 14px;border-bottom:1px solid #e9ecef;display:flex;align-items:center;gap:8px;">
                    <strong style="flex:1">Course Outline</strong>
                    <button id="outlineCloseBtn" class="action-btn" style="background:#6c757d;color:#fff;">Close</button>
                  </div>
                  <div id="outlineBody" style="padding:12px 14px;overflow:auto;flex:1"></div>
                `;
                document.body.appendChild(cont);
                cont.querySelector('#outlineCloseBtn').onclick = ()=> cont.style.transform = 'translateX(100%)';
            }
            const body = cont.querySelector('#outlineBody');
            body.innerHTML = '<div class="loading-spinner">Loading...</div>';
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
                const renderModule = (m) => {
                    const lessons = (m.lessons||[]).map(l => {
                        const mats = (l.materials||[]).map(mat => `
                          <div data-mat-id="${mat.id}" style=\"display:flex;align-items:center;gap:6px;padding:6px 8px;border:1px dashed #ddd;border-radius:6px;margin:4px 0;\">
                            <span style=\"flex:1; font-size:12px; color:#555;\">${mat.type.toUpperCase()} • ${mat.filename || mat.url || ''}</span>
                            <button class=\"action-btn\" data-act=\"mat-edit\" data-id=\"${mat.id}\" style=\"background:#6c757d;color:#fff;\">Edit</button>
                            <button class=\"action-btn delete-btn\" data-act=\"mat-delete\" data-id=\"${mat.id}\">Delete</button>
                          </div>`).join('');
                        const activities = (l.activities||[]).map(a => `
                          <div data-activity-id="${a.id}" data-title="${(a.title||'').replace(/"/g,'&quot;')}" draggable="true" style=\"display:flex;align-items:center;gap:6px;padding:6px 8px;border:1px dotted #ccc;border-radius:6px;margin:4px 0;\">
                            <span style=\"flex:1; font-size:12px;\"><strong>${a.type.toUpperCase()}</strong>: ${a.title}</span>
                            <button class=\"action-btn\" data-act=\"act-run\" data-id=\"${a.id}\" style=\"background:#2196F3;color:#fff;\">Run</button>
                            <button class=\"action-btn\" data-act=\"act-edit\" data-id=\"${a.id}\" style=\"background:#6c757d;color:#fff;\">Edit</button>
                            <button class=\"action-btn delete-btn\" data-act=\"act-delete\" data-id=\"${a.id}\">Delete</button>
                          </div>`).join('');
                        return `
                          <li data-lesson-id="${l.id}" draggable="true" style="padding:6px 8px;border:1px solid #eee;border-radius:6px;margin:6px 0;">
                            <div style="display:flex;align-items:center;gap:6px;">
                              <span style="flex:1">${l.title}</span>
                              <button class="action-btn" data-act="lesson-edit" data-id="${l.id}" style="background:#6c757d;color:#fff;">Edit</button>
                              <button class="action-btn delete-btn" data-act="lesson-delete" data-id="${l.id}">Delete</button>
                            </div>
                            <div class="activities" data-lesson="${l.id}" style="margin:6px 0 0 0;">${activities}</div>
                            <div class="materials" data-lesson="${l.id}" style="margin:6px 0 0 0;">${mats}</div>
                            <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
                              <input type="text" placeholder="Material URL or filename" data-new-mat style="flex:1;padding:7px 10px;border:1px solid #ccc;border-radius:6px;min-width:180px;">
                              <select data-new-mat-type style="padding:7px 10px;border:1px solid #ccc;border-radius:6px;">
                                <option value="link">Link</option>
                                <option value="pdf">PDF</option>
                                <option value="video">Video</option>
                                <option value="file">File</option>
                                <option value="code">Code</option>
                              </select>
                              <button class="action-btn" data-act="mat-add" data-id="${l.id}" style="background:#1d9b3e;color:#fff;">Add Material</button>
                              <label class="action-btn" style="background:#6c757d;color:#fff;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">
                                <i class="fas fa-upload"></i> Upload File
                                <input type="file" data-mat-file style="display:none" />
                              </label>
                              <button class="action-btn" data-act="act-add" data-id="${l.id}" style="background:#17a2b8;color:#fff;">Add Coding Activity</button>
                            </div>
                          </li>`;
                    }).join('');
                    return `
                      <div data-module-id="${m.id}" draggable="true" style="padding:10px;border:1px solid #e9ecef;border-radius:10px;margin-bottom:10px;">
                        <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
                          <strong style="flex:1">${m.title}</strong>
                          <button class="action-btn" data-act="module-edit" data-id="${m.id}" style="background:#6c757d;color:#fff;">Rename</button>
                          <button class="action-btn delete-btn" data-act="module-delete" data-id="${m.id}">Delete</button>
                        </div>
                        <ul class="lessons" data-module="${m.id}" style="list-style:none;padding:0;margin:0 0 6px 0;">${lessons}</ul>
                        <div style="display:flex;gap:6px;">
                          <input type="text" placeholder="New lesson title" data-new-lesson style="flex:1;padding:7px 10px;border:1px solid #ccc;border-radius:6px;">
                          <button class="action-btn" data-act="lesson-add" data-id="${m.id}" style="background:#1d9b3e;color:#fff;">Add Lesson</button>
                        </div>
                      </div>`;
                };
                body.innerHTML = `
                  <div style="display:flex;gap:8px;margin-bottom:10px;">
                    <input id="newModuleTitle" type="text" placeholder="New module title" style="flex:1;padding:8px 10px;border:1px solid #ccc;border-radius:6px;">
                    <button id="addModuleBtn" class="action-btn" style="background:#1d9b3e;color:#fff;">Add Module</button>
                  </div>
                  <div id="modulesWrap">${(res.data||[]).map(renderModule).join('')}</div>
                `;

                // Wire outline actions
                const modulesWrap = body.querySelector('#modulesWrap');
                body.querySelector('#addModuleBtn').onclick = function(){
                    const title = (body.querySelector('#newModuleTitle')||{}).value || '';
                    if (!title.trim()) {
                        showNotification('error', 'Error', 'Please enter a module title');
                        return;
                    }
                    const fd = new FormData();
                    fd.append('action','module_create');
                    fd.append('course_id', courseId);
                    fd.append('title', title.trim());
                    fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
                      .then(r => r.json())
                      .then(rr => { 
                          if (rr && rr.success) {
                              showNotification('success', 'Success', 'Module created successfully');
                              openCourseOutline(courseId);
                          } else {
                              showNotification('error', 'Error', (rr && rr.message) || 'Failed to create module');
                          }
                      })
                      .catch(err => {
                          console.error('Module create error:', err);
                          showNotification('error', 'Error', 'Failed to create module');
                      });
                };
                // Seed button removed on request
                modulesWrap.addEventListener('click', function(e){
                    const btn = e.target.closest('button[action-btn]') || e.target.closest('button');
                    if (!btn) return;
                    const act = btn.getAttribute('data-act');
                    if (!act) return;
                    if (act === 'module-delete') {
                        const fd = new FormData(); fd.append('action','module_delete'); fd.append('id', btn.getAttribute('data-id'));
                        fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' }).then(()=> openCourseOutline(courseId));
                    }
                    if (act === 'module-edit') {
                        const current = btn.closest('[data-module-id]').querySelector('strong').textContent;
                        const title = prompt('Module title', current); if (!title) return;
                        const fd = new FormData(); fd.append('action','module_update'); fd.append('id', btn.getAttribute('data-id')); fd.append('title', title);
                        fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' }).then(()=> openCourseOutline(courseId));
                    }
                    if (act === 'lesson-delete') {
                        const fd = new FormData(); fd.append('action','lesson_delete'); fd.append('id', btn.getAttribute('data-id'));
                        fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' }).then(()=> openCourseOutline(courseId));
                    }
                    if (act === 'lesson-edit') {
                        const li = btn.closest('[data-lesson-id]');
                        const current = li.querySelector('span').textContent;
                        const title = prompt('Lesson title', current); if (!title) return;
                        const fd = new FormData(); fd.append('action','lesson_update'); fd.append('id', btn.getAttribute('data-id')); fd.append('title', title);
                        fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' }).then(()=> openCourseOutline(courseId));
                    }
                    if (act === 'lesson-add') {
                        const moduleId = btn.getAttribute('data-id');
                        const input = btn.parentElement.querySelector('[data-new-lesson]');
                        const title = (input && input.value) ? input.value : '';
                        if (!title.trim()) return;
                        const fd = new FormData();
                        fd.append('action','lesson_create');
                        fd.append('module_id', moduleId);
                        fd.append('title', title.trim());
                        fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
                          .then(r => r.json())
                          .then(() => openCourseOutline(courseId));
                    }
                    if (act === 'mat-add') {
                        const lessonId = btn.getAttribute('data-id');
                        const wrap = btn.parentElement;
                        const urlInp = wrap.querySelector('[data-new-mat]');
                        const typeSel = wrap.querySelector('[data-new-mat-type]');
                        const value = (urlInp && urlInp.value) ? urlInp.value.trim() : '';
                        const mtype = (typeSel && typeSel.value) ? typeSel.value : 'link';
                        if (!value) return;
                        const fd = new FormData();
                        fd.append('action','material_create');
                        fd.append('lesson_id', lessonId);
                        fd.append('type', mtype);
                        if (mtype === 'link' || mtype === 'video') fd.append('url', value); else fd.append('filename', value);
                        fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
                          .then(r => r.json())
                          .then(() => openCourseOutline(courseId));
                    }
                    if (act === 'mat-delete') {
                        const fd = new FormData(); fd.append('action','material_delete'); fd.append('id', btn.getAttribute('data-id'));
                        fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' }).then(()=> openCourseOutline(courseId));
                    }
                    if (act === 'mat-edit') {
                        const item = btn.closest('[data-mat-id]');
                        const current = item.querySelector('span').textContent || '';
                        const url = prompt('Update material (URL or filename)', current.replace(/^.*•\s*/,'').trim());
                        if (url === null) return;
                        const fd = new FormData();
                        fd.append('action','material_update');
                        fd.append('id', btn.getAttribute('data-id'));
                        // crude detection; in real UI, separate inputs by type
                        fd.append('url', url);
                        fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' }).then(()=> openCourseOutline(courseId));
                    }
                    // Activities
                    if (act === 'act-add') {
                        const lessonId = btn.getAttribute('data-id');
                        ensureActivityModal('create', { lessonId });
                        return;
                    }
                    if (act === 'act-delete') {
                        const fd = new FormData(); fd.append('action','activity_delete'); fd.append('id', btn.getAttribute('data-id'));
                        fetch('lesson_activity_manage.php', { method:'POST', body: fd, credentials:'same-origin' }).then(()=> openCourseOutline(courseId));
                    }
                    if (act === 'act-edit') {
                        const node = btn.closest('[data-activity-id]');
                        const id = btn.getAttribute('data-id');
                        const currentTitle = node ? (node.getAttribute('data-title')||'') : '';
                        ensureActivityModal('edit', { id, title: currentTitle });
                        return;
                    }
                    if (act === 'act-run') {
                        const activityId = btn.getAttribute('data-id');
                        const code = `#include <bits/stdc++.h>\nusing namespace std;\nint main(){ios::sync_with_stdio(false);cin.tie(nullptr);\nstring s; if(!getline(cin,s)) return 0; cout<<s<<"\\n"; return 0;}`;
                        const fd = new FormData(); fd.append('action','run_activity'); fd.append('activity_id', activityId); fd.append('source', code);
                        btn.disabled = true; btn.textContent = 'Running...';
                        fetch('lesson_activity_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
                          .then(r=>r.json())
                          .then(res=>{
                            btn.disabled=false; btn.textContent='Run';
                            if (res && res.success) { showNotification && showNotification('success','Run completed', 'JDoodle returned results'); console.log('RunResults', res.results); }
                            else { showNotification && showNotification('error','Run failed', res && res.message ? res.message : ''); }
                          })
                          .catch(()=>{ btn.disabled=false; btn.textContent='Run'; showNotification && showNotification('error','Run failed','Network error'); });
                    }
                });
                // Reorder activities per lesson
                (function setupActivityDnD(){
                    body.querySelectorAll('div.activities').forEach(box=>{
                        let dragEl=null; box.querySelectorAll('[data-activity-id]').forEach(card=> card.setAttribute('draggable','true'));
                        box.addEventListener('dragstart', e=>{ const card=e.target.closest('[data-activity-id]'); if (!card) return; dragEl=card; e.dataTransfer.effectAllowed='move'; });
                        box.addEventListener('dragover', e=>{ if (!dragEl) return; const over=e.target.closest('[data-activity-id]'); if (!over||over===dragEl) return; e.preventDefault(); const items=Array.from(box.querySelectorAll('[data-activity-id]')); const di=items.indexOf(dragEl); const oi=items.indexOf(over); if (di<oi) over.after(dragEl); else over.before(dragEl); });
                        box.addEventListener('drop', ()=>{
                            if (!dragEl) return; const ordered=Array.from(box.querySelectorAll('[data-activity-id]')).map(n=>parseInt(n.getAttribute('data-activity-id'),10)).filter(Boolean);
                            const lessonId=box.getAttribute('data-lesson');
                            const fd = new FormData(); fd.append('action','activity_reorder'); fd.append('lesson_id', lessonId); fd.append('ordered_ids', JSON.stringify(ordered));
                            fetch('lesson_activity_manage.php', { method:'POST', body: fd, credentials:'same-origin' });
                            dragEl=null;
                        });
                    });
                })();

                // Pretty modal for Add/Edit Coding Activity
                function ensureActivityModal(mode, opts){
                    let modal = document.getElementById('activityModal');
                    if (!modal) {
                        modal = document.createElement('div');
                        modal.id = 'activityModal';
                        modal.className = 'modal-overlay';
                        modal.innerHTML = `
                          <div class="modal-card" style="max-width:560px;">
                            <h3 class="modal-title">Coding Activity</h3>
                            <form id="activityForm">
                              <input type="hidden" id="activityId" />
                              <input type="hidden" id="activityLessonId" />
                              <label class="modal-label">Title</label>
                              <input type="text" id="activityTitle" class="modal-input" placeholder="e.g., Practice Problem" required />
                              <label class="modal-label" style="margin-top:10px;">Instructions</label>
                              <textarea id="activityInstructions" class="modal-input" rows="5" placeholder="Brief instructions for students (optional)"></textarea>
                              <div style="display:flex;gap:10px;margin-top:10px;">
                                <div style="flex:1;">
                                  <label class="modal-label">Due date</label>
                                  <input type="datetime-local" id="activityDueAt" class="modal-input" />
                                </div>
                                <div style="width:140px;">
                                  <label class="modal-label">Max score</label>
                                  <input type="number" id="activityMaxScore" class="modal-input" min="1" value="100" />
                                </div>
                              </div>
                              <div class="modal-actions">
                                <button type="submit" class="action-btn" style="background:#1d9b3e;color:#fff;">Save</button>
                                <button type="button" id="activityCancel" class="action-btn" style="background:#6c757d;color:#fff;">Cancel</button>
                              </div>
                            </form>
                          </div>`;
                        document.body.appendChild(modal);
                        modal.querySelector('#activityCancel').onclick = function(){ modal.style.display='none'; };
                        modal.querySelector('#activityForm').onsubmit = function(e){
                            e.preventDefault();
                            const id = document.getElementById('activityId').value;
                            const lessonId = document.getElementById('activityLessonId').value;
                            const title = document.getElementById('activityTitle').value.trim();
                            const instructions = document.getElementById('activityInstructions').value.trim();
                            const dueLocal = document.getElementById('activityDueAt').value; // yyyy-mm-ddThh:mm
                            const maxScore = parseInt(document.getElementById('activityMaxScore').value||'100',10);
                            const toMysql = (dl)=> dl ? dl.replace('T',' ') + ':00' : '';
                            const fd = new FormData();
                            if (document.getElementById('activityId').value) {
                                fd.append('action','activity_update');
                                fd.append('id', id);
                            } else {
                                fd.append('action','activity_create');
                                fd.append('lesson_id', lessonId);
                                fd.append('type','coding');
                            }
                            fd.append('title', title);
                            if (instructions) fd.append('instructions', instructions);
                            if (dueLocal) fd.append('due_at', toMysql(dueLocal));
                            fd.append('max_score', String(maxScore));
                            fetch('lesson_activity_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
                              .then(r=>r.json())
                              .then(res=>{
                                if (res && res.success) { modal.style.display='none'; openCourseOutline(courseId); }
                                else { showNotification && showNotification('error','Save failed', res && res.message ? res.message : ''); }
                              })
                              .catch(()=> showNotification && showNotification('error','Save failed','Network error'));
                        };
                    }
                    // Set values
                    const titleEl = document.getElementById('activityTitle');
                    const idEl = document.getElementById('activityId');
                    const lessonEl = document.getElementById('activityLessonId');
                    const instrEl = document.getElementById('activityInstructions');
                    const dueEl = document.getElementById('activityDueAt');
                    const scoreEl = document.getElementById('activityMaxScore');
                    idEl.value = mode === 'edit' ? (opts.id || '') : '';
                    lessonEl.value = mode === 'create' ? (opts.lessonId || '') : '';
                    titleEl.value = (opts && opts.title) ? opts.title : '';
                    instrEl.value = (opts && opts.instructions) ? opts.instructions : '';
                    dueEl.value = '';
                    scoreEl.value = 100;
                    modal.querySelector('.modal-title').textContent = mode === 'edit' ? 'Edit Coding Activity' : 'Add Coding Activity';
                    modal.style.display = 'flex';
                    modal.style.zIndex = '3500';
                    setTimeout(()=> titleEl && titleEl.focus(), 50);
                }
                // Upload file (delegate to change event on hidden file inputs)
                modulesWrap.addEventListener('change', function(e){
                    const inp = e.target.closest('input[type="file"][data-mat-file]');
                    if (!inp) return;
                    const li = inp.closest('[data-lesson-id]');
                    const lessonId = li ? li.getAttribute('data-lesson-id') : null;
                    if (!lessonId || !inp.files || inp.files.length === 0) return;
                    const fd = new FormData();
                    fd.append('action','material_upload');
                    fd.append('lesson_id', lessonId);
                    fd.append('file', inp.files[0]);
                    fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' })
                      .then(r => r.json())
                      .then(res => {
                        if (res && res.success) {
                            showNotification && showNotification('success','Uploaded','File uploaded');
                            openCourseOutline(courseId);
                        } else {
                            showNotification && showNotification('error','Upload failed', (res && res.message) || '');
                        }
                      })
                      .catch(()=> showNotification && showNotification('error','Upload failed','Server error'));
                });
                // Drag & Drop Reordering (modules, lessons, materials)
                // Helpers
                function collectIds(nodeList, attr) { return Array.from(nodeList).map(n => parseInt(n.getAttribute(attr),10)).filter(Boolean); }
                function setupModuleDnD(){
                    const container = body.querySelector('#modulesWrap');
                    let dragEl = null;
                    container.addEventListener('dragstart', e=>{ const el = e.target.closest('[data-module-id]'); if (!el) return; dragEl = el; e.dataTransfer.effectAllowed='move'; });
                    container.addEventListener('dragover', e=>{ if (!dragEl) return; const over = e.target.closest('[data-module-id]'); if (!over || over===dragEl) return; e.preventDefault(); const wrap = body.querySelector('#modulesWrap'); const list = Array.from(wrap.children); const dragIdx=list.indexOf(dragEl); const overIdx=list.indexOf(over); if (dragIdx<overIdx) over.after(dragEl); else over.before(dragEl); });
                    container.addEventListener('drop', ()=>{
                        if (!dragEl) return; const ordered = collectIds(container.querySelectorAll('[data-module-id]'), 'data-module-id');
                        const fd = new FormData(); fd.append('action','module_reorder'); fd.append('course_id', courseId); fd.append('ordered_ids', JSON.stringify(ordered));
                        fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' });
                        dragEl=null;
                    });
                }
                function setupLessonDnD(){
                    body.querySelectorAll('ul.lessons').forEach(list=>{
                        let dragEl=null; list.addEventListener('dragstart', e=>{ const li=e.target.closest('[data-lesson-id]'); if (!li) return; dragEl=li; e.dataTransfer.effectAllowed='move'; });
                        list.addEventListener('dragover', e=>{ if (!dragEl) return; const over=e.target.closest('[data-lesson-id]'); if (!over||over===dragEl) return; e.preventDefault(); const items=Array.from(list.children); const di=items.indexOf(dragEl); const oi=items.indexOf(over); if (di<oi) over.after(dragEl); else over.before(dragEl); });
                        list.addEventListener('drop', ()=>{
                            if (!dragEl) return; const ordered=collectIds(list.querySelectorAll('[data-lesson-id]'), 'data-lesson-id');
                            const moduleId=list.getAttribute('data-module');
                            const fd = new FormData(); fd.append('action','lesson_reorder'); fd.append('module_id', moduleId); fd.append('ordered_ids', JSON.stringify(ordered));
                            fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' });
                            dragEl=null;
                        });
                    });
                }
                function setupMaterialDnD(){
                    body.querySelectorAll('div.materials').forEach(box=>{
                        let dragEl=null; box.querySelectorAll('[data-mat-id]').forEach(card=> card.setAttribute('draggable','true'));
                        box.addEventListener('dragstart', e=>{ const card=e.target.closest('[data-mat-id]'); if (!card) return; dragEl=card; e.dataTransfer.effectAllowed='move'; });
                        box.addEventListener('dragover', e=>{ if (!dragEl) return; const over=e.target.closest('[data-mat-id]'); if (!over||over===dragEl) return; e.preventDefault(); const items=Array.from(box.querySelectorAll('[data-mat-id]')); const di=items.indexOf(dragEl); const oi=items.indexOf(over); if (di<oi) over.after(dragEl); else over.before(dragEl); });
                        box.addEventListener('drop', ()=>{
                            if (!dragEl) return; const ordered=collectIds(box.querySelectorAll('[data-mat-id]'), 'data-mat-id');
                            const lessonId=box.getAttribute('data-lesson');
                            const fd = new FormData(); fd.append('action','material_reorder'); fd.append('lesson_id', lessonId); fd.append('ordered_ids', JSON.stringify(ordered));
                            fetch('course_outline_manage.php', { method:'POST', body: fd, credentials:'same-origin' });
                            dragEl=null;
                        });
                    });
                }
                setupModuleDnD();
                setupLessonDnD();
                setupMaterialDnD();
                // Teacher assignment removed (feature deprecated)
              })
              .catch(()=> { body.innerHTML = '<div class="empty-state">Failed to load outline</div>'; });
            })();
            requestAnimationFrame(()=> cont.style.transform = 'translateX(0)');
        }
    })();

    // --- Coordinator Uploads & Archive (dynamic) ---
    (function initCoordinatorUploads(){
        const uploads = document.getElementById('uploads');
        const archive = document.getElementById('archive');
        if (!uploads && !archive) return;

        // Store load functions globally so they can be called from click handlers
        window.uploadsLoadFunction = null;
        window.archiveLoadFunction = null;

        function renderUploads(targetEl, opts){
            const { archived } = opts || {};
            
            // Check if toolbar already exists to prevent duplicates
            if (targetEl.querySelector('#umSearch')) {
                console.log('Uploads manager toolbar already exists, skipping creation');
                return;
            }
            
            const toolbar = `
              <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
                <input id="umSearch" type="text" placeholder="Search filename, lesson, course" style="padding:7px 10px;border:1px solid #ccc;border-radius:6px;min-width:220px;">
                <select id="umType" style="padding:7px 10px;border:1px solid #ccc;border-radius:6px;">
                  <option value="">All types</option>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="file">File</option>
                  <option value="code">Code</option>
                  <option value="link">Link</option>
                </select>
              </div>`;
            targetEl.innerHTML = toolbar + '<div id="umTable" style="overflow-x:auto;min-height:120px;"></div>';

            const table = targetEl.querySelector('#umTable');
            function load(){
                console.log('load() function called, archived:', archived);
                const q = targetEl.querySelector('#umSearch')?.value || '';
                const type = targetEl.querySelector('#umType')?.value || '';
                const url = `uploads_manager.php?action=list&search=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}&archived=${archived?1:0}`;
                console.log('Loading URL:', url);
                table.innerHTML = '<div class="empty-state">Loading...</div>';
                fetch(url, { credentials:'same-origin' })
                  .then(r=>r.ok?r.json():Promise.reject())
                  .then(res=>{
                    console.log('Load response:', res);
                    if (!res || !res.success) { table.innerHTML = '<div class="empty-state">Failed to load</div>'; return; }
                    const rows = res.data || [];
                    console.log('Materials found:', rows.length);
                    if (!rows.length) { table.innerHTML = '<div class="empty-state">No materials</div>'; return; }
                    table.innerHTML = `
                      <table>
                        <thead><tr>
                          <th>File</th><th>Type</th><th>Lesson</th><th>Module</th><th>Course</th><th>Size</th><th>Uploaded</th><th>Actions</th>
                        </tr></thead>
                        <tbody>
                        ${rows.map(r=>`<tr>
                          <td>${(r.filename||r.url||'').replace(/</g,'&lt;')}</td>
                          <td>${r.type}</td>
                          <td>${r.lesson_title||''}</td>
                          <td>${r.module_title||''}</td>
                          <td>${r.course_title||''}</td>
                          <td>${r.size_bytes? (Math.round(r.size_bytes/1024)+' KB'):''}</td>
                          <td>${r.created_at? new Date(r.created_at).toLocaleString():''}</td>
                          <td>
                            ${archived ? `<button class="action-btn" data-act="unarchive" data-id="${r.id}" style="background:#17a2b8;color:#fff;">Unarchive</button>` : `<button class="action-btn delete-btn" data-act="archive" data-id="${r.id}">Archive</button>`}
                          </td>
                        </tr>`).join('')}
                        </tbody>
                      </table>`;
                  })
                  .catch(()=> table.innerHTML = '<div class="empty-state">Failed to load</div>');
            }

            // Store the load function globally
            if (archived) {
                window.archiveLoadFunction = load;
            } else {
                window.uploadsLoadFunction = load;
            }

            targetEl.querySelector('#umSearch')?.addEventListener('input', ()=>{ clearTimeout(window.__umdeb); window.__umdeb=setTimeout(load,300); });
            targetEl.querySelector('#umType')?.addEventListener('change', load);
            targetEl.addEventListener('click', function(e){
                const btn = e.target.closest('button[data-act]'); if (!btn) return;
                const id = btn.getAttribute('data-id'); const act = btn.getAttribute('data-act');
                if (!id || !act) return;
                console.log(`Attempting to ${act} material ID: ${id}`);
                const fd = new FormData(); fd.append('action', act==='archive'?'archive':'unarchive'); fd.append('id', id);
                fetch('uploads_manager.php', { method:'POST', body: fd, credentials:'same-origin' })
                  .then(r=>r.json())
                  .then(res=>{
                    console.log(`${act} response:`, res);
                    if (res && res.success) {
                        showNotification('success', 'Success', `Material ${act}d successfully`);
                        console.log('Refreshing table...');
                        // Call the appropriate load function based on which tab we're on
                        if (archived) {
                            console.log('Calling archiveLoadFunction');
                            if (window.archiveLoadFunction) {
                                window.archiveLoadFunction();
                            } else {
                                console.error('archiveLoadFunction not found!');
                            }
                        } else {
                            console.log('Calling uploadsLoadFunction');
                            if (window.uploadsLoadFunction) {
                                window.uploadsLoadFunction();
                            } else {
                                console.error('uploadsLoadFunction not found!');
                            }
                        }
                        
                        // Also refresh the other tab to keep both in sync
                        setTimeout(() => {
                            if (archived && window.uploadsLoadFunction) {
                                console.log('Also refreshing uploads tab');
                                window.uploadsLoadFunction();
                            } else if (!archived && window.archiveLoadFunction) {
                                console.log('Also refreshing archive tab');
                                window.archiveLoadFunction();
                            }
                        }, 500);
                    } else {
                        showNotification('error', 'Error', (res && res.message) || `Failed to ${act} material`);
                    }
                  })
                  .catch(err=>{
                    console.error(`${act} error:`, err);
                    showNotification('error', 'Error', `Failed to ${act} material`);
                  });
            });
            load();
        }

        if (uploads) { renderUploads(uploads, { archived:false }); }
        if (archive) { renderUploads(archive, { archived:true }); }
    })();
    // --- OLD CODE FOR RECENTLY REGISTERED/LOGIN WIDGETS (BACKUP) ---
    /*
    function loadRecentlyRegistered() {
        const list = document.getElementById('recentlyRegisteredList');
        list.innerHTML = `<div class='skeleton skeleton-text' style='width: 90%; height: 22px;'></div><div class='skeleton skeleton-text' style='width: 70%; height: 22px;'></div><div class='skeleton skeleton-text' style='width: 80%; height: 22px;'></div>`;
        fetch('dashboard_recently_registered_ajax.php')
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    list.innerHTML = `<div class='empty-state'><i class='fas fa-user-plus'></i><p>No recent registrations</p></div>`;
                    return;
                }
                list.innerHTML = data.map((user, idx) => {
                    const role = (user.role || '').toLowerCase();
                    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
                    const icon = role === 'admin' ? 'user-shield' : role === 'teacher' ? 'chalkboard-teacher' : role === 'coordinator' ? 'user-tie' : 'user-graduate';
                    return `
                        <div class='activity-item'>
                            <div class='activity-avatar ${role}'><i class='fas fa-${icon}'></i></div>
                            <div class='activity-content'>
                                <div class='activity-title'>${user.name} <span class='activity-badge ${role}'>${user.role}</span></div>
                                <div class='activity-time'>${user.time}</div>
                            </div>
                        </div>
                        ${idx < data.length-1 ? "<div class='activity-divider'></div>" : ''}
                    `;
                }).join('');
            })
            .catch(() => {
                list.innerHTML = `<div class='empty-state'><i class='fas fa-exclamation-triangle'></i><p>Error loading data</p></div>`;
            });
    }
    function loadRecentlyLogin() {
        const list = document.getElementById('recentlyLoginList');
        list.innerHTML = `<div class='skeleton skeleton-text' style='width: 90%; height: 22px;'></div><div class='skeleton skeleton-text' style='width: 70%; height: 22px;'></div><div class='skeleton skeleton-text' style='width: 80%; height: 22px;'></div>`;
        fetch('dashboard_recently_login_ajax.php')
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    list.innerHTML = `<div class='empty-state'><i class='fas fa-sign-in-alt'></i><p>No recent logins</p></div>`;
                    return;
                }
                list.innerHTML = data.map((user, idx) => {
                    const role = (user.role || '').toLowerCase();
                    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
                    const icon = role === 'admin' ? 'user-shield' : role === 'teacher' ? 'chalkboard-teacher' : role === 'coordinator' ? 'user-tie' : 'user-graduate';
                    return `
                        <div class='activity-item'>
                            <div class='activity-avatar ${role}'><i class='fas fa-${icon}'></i></div>
                            <div class='activity-content'>
                                <div class='activity-title'>${user.name} <span class='activity-badge ${role}'>${user.role}</span></div>
                                <div class='activity-time'>${user.time}</div>
                            </div>
                        </div>
                        ${idx < data.length-1 ? "<div class='activity-divider'></div>" : ''}
                    `;
                }).join('');
            })
            .catch(() => {
                list.innerHTML = `<div class='empty-state'><i class='fas fa-exclamation-triangle'></i><p>Error loading data</p></div>`;
            });
    }
    */

    // --- NEW OOP DASHBOARD WIDGETS ---
    class DashboardWidget {
      constructor(containerId, dataUrl, renderItem) {
        this.containerId = containerId;
        this.dataUrl = dataUrl;
        this.renderItem = renderItem;
      }

      fetchData() {
        return fetch(this.dataUrl)
          .then(res => res.json());
      }

      render(data) {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        if (!data || data.length === 0) {
          container.innerHTML = `<div class="empty-state">No data available</div>`;
          return;
        }
        container.innerHTML = data.map(this.renderItem).join('');
      }

      init() {
        this.fetchData().then(data => this.render(data));
      }
    }

    function getRoleIcon(role) {
      switch (role.toLowerCase()) {
        case 'admin': return 'user-shield';
        case 'coordinator': return 'chalkboard-teacher';
        case 'teacher': return 'user-tie';
        case 'student': return 'user-graduate';
        default: return 'user';
      }
    }
    function getRoleColorClass(role) {
      switch (role.toLowerCase()) {
        case 'admin': return 'admin-red';
        case 'teacher': return 'teacher-yellow';
        case 'coordinator': return 'coordinator-grey';
        default: return 'student-green';
      }
    }
    function renderRegisteredItem(user) {
      const role = (user.role || '').toLowerCase();
      const icon = getRoleIcon(role);
      const colorClass = getRoleColorClass(role);
      const html = `
        <div class="activity-item">
          <div class="activity-avatar ${colorClass}">
            <i class="fas fa-${icon}"></i>
          </div>
          <div class="activity-content">
            <div class="activity-title">${user.name} <span class="activity-badge ${colorClass}">${user.role}</span></div>
            <div class="activity-time">${user.time}</div>
          </div>
        </div>
      `;
      console.log('RegisteredItem:', user.role, html); // DEBUG OUTPUT
      return html;
    }

    function renderLoginItem(user) {
      const role = (user.role || '').toLowerCase();
      const icon = getRoleIcon(role);
      const colorClass = getRoleColorClass(role);
      const html = `
        <div class="activity-item">
          <div class="activity-avatar ${colorClass}">
            <i class="fas fa-${icon}"></i>
          </div>
          <div class="activity-content">
            <div class="activity-title">${user.name} <span class="activity-badge ${colorClass}">${user.role}</span></div>
            <div class="activity-time">${user.time}</div>
          </div>
        </div>
      `;
      console.log('LoginItem:', user.role, html); // DEBUG OUTPUT
      return html;
    }

    // User table
    function loadUsers() {
        const wrapper = document.getElementById('userTableWrapper');
        if (!wrapper) return; // Not on Admin Users page (e.g., Coordinator)
        const search = document.getElementById('userSearchInput')?.value || '';
        const role = document.getElementById('userRoleSelect')?.value || '';
        const status = document.getElementById('userStatusSelect')?.value || '';
        const sortBy = document.getElementById('userSortBy')?.value || 'firstname';
        const sortDir = document.getElementById('userSortDir')?.value || 'ASC';
        const pageSize = document.getElementById('userPageSize')?.value || 10;
        const page = window.__userTablePage || 1;
        wrapper.innerHTML = '<div style="text-align:center;padding:30px 0;">Loading...</div>';
        const url = 'user_table_ajax.php?search=' + encodeURIComponent(search)
          + '&role=' + encodeURIComponent(role)
          + '&status=' + encodeURIComponent(status)
          + '&sortBy=' + encodeURIComponent(sortBy)
          + '&sortDir=' + encodeURIComponent(sortDir)
          + '&pageSize=' + encodeURIComponent(pageSize)
          + '&page=' + encodeURIComponent(page);
        fetch(url)
            .then(res => res.text())
            .then(html => { wrapper.innerHTML = html; attachUserActions(); })
            .catch(error => {
                wrapper.innerHTML = '<div style="text-align:center;padding:30px 0;color:#dc3545;">Failed to load users. Please try again.</div>';
                showErrorToast('Failed to load users');
            });
    }

    // Authorized IDs table loader
    function loadAuthorizedIds(queryString = '') {
        const wrapper = document.getElementById('authIdsWrapper');
        if (!wrapper) return;
        // Preserve typing focus/caret if user is in the search box
        const activeEl = document.activeElement;
        const wasTypingInSearch = activeEl && activeEl.id === 'authSearch';
        const preservedSearchValue = wasTypingInSearch ? activeEl.value : null;
        const preservedCaret = wasTypingInSearch && typeof activeEl.selectionStart === 'number' ? activeEl.selectionStart : null;
        wrapper.innerHTML = '<div style="text-align:center;padding:30px 0;">Loading...</div>';
        // persist params
        if (queryString) {
            try { window.__authParams = Object.fromEntries(new URLSearchParams(queryString).entries()); } catch(e) {}
        }
        const params = new URLSearchParams(window.__authParams || {});
        const url = 'authorized_ids_table_ajax.php' + (params.toString() ? ('?' + params.toString()) : '');
        console.log('Loading Authorized IDs URL:', url, 'params:', Object.fromEntries(params.entries()));
        fetch(url)
            .then(res => res.text())
            .then(html => {
                console.log('Authorized IDs HTML length:', html ? html.length : 0);
                wrapper.innerHTML = html;
                // Restore focus and caret to search input if user was typing
                if (wasTypingInSearch) {
                    const newSearch = wrapper.querySelector('#authSearch');
                    if (newSearch) {
                        if (preservedSearchValue !== null) newSearch.value = preservedSearchValue;
                        newSearch.focus();
                        try {
                            const pos = preservedCaret !== null ? preservedCaret : newSearch.value.length;
                            newSearch.setSelectionRange(pos, pos);
                        } catch(e) {}
                    }
                }
                attachAuthorizedIdsActions();
            });
    }

    function attachAuthorizedIdsActions() {
        const wrapper = document.getElementById('authIdsWrapper');
        if (!wrapper) return;

        const importBtn = wrapper.querySelector('#openImportAuthModalBtn');
        if (importBtn) {
            importBtn.onclick = function() {
                document.getElementById('importAuthIdsModal').style.display = 'flex';
                const res = document.getElementById('importAuthIdsResult');
                if (res) res.textContent = '';
            };
        }

        const search = wrapper.querySelector('#authSearch');
        if (search) {
            if (!window.__authSearchDebounce) window.__authSearchDebounce = null;
            search.oninput = function() {
                const params = new URLSearchParams(window.__authParams || {});
                params.set('search', search.value || '');
                window.__authParams = Object.fromEntries(params.entries());
                clearTimeout(window.__authSearchDebounce);
                window.__authSearchDebounce = setTimeout(function(){
                    loadAuthorizedIds(params.toString());
                }, 300);
            };
        }

        // Status filter
        const statusSel = wrapper.querySelector('#authStatusFilter');
        if (statusSel) {
            statusSel.onchange = function() {
                const params = new URLSearchParams(window.__authParams || {});
                if (this.value) params.set('status', this.value); else params.delete('status');
                window.__authParams = Object.fromEntries(params.entries());
                console.log('Status filter changed to:', this.value, 'params now:', Object.fromEntries(params.entries()));
                loadAuthorizedIds(params.toString());
            };
        }

        const selectAll = wrapper.querySelector('#authSelectAll');
        const rowCbs = wrapper.querySelectorAll('.auth-row');
        if (selectAll) {
            selectAll.onchange = function() {
                rowCbs.forEach(cb => { cb.checked = selectAll.checked; });
            };
        }

        wrapper.querySelectorAll('.auth-status').forEach(sel => {
            sel.onchange = function() {
                fetch('authorized_ids_manage.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'action=update_status&id=' + encodeURIComponent(this.getAttribute('data-id')) + '&status=' + encodeURIComponent(this.value)
                }).then(() => {
                    showNotification && showNotification('success', 'Updated', 'Status updated');
                }).catch(() => showNotification && showNotification('error', 'Error', 'Failed to update'));
            };
        });

        // Bulk archive/unarchive/delete/export
        const bulkArchiveBtn = wrapper.querySelector('#authBulkArchiveBtn');
        const bulkUnarchiveBtn = wrapper.querySelector('#authBulkUnarchiveBtn');
        const bulkDeleteBtn = wrapper.querySelector('#authBulkDeleteBtn');
        const exportBtn = wrapper.querySelector('#authExportCsvBtn');
        function getSelectedAuthIds() {
            return Array.from(wrapper.querySelectorAll('.auth-row:checked')).map(cb => cb.getAttribute('data-id'));
        }
        if (bulkArchiveBtn) {
            bulkArchiveBtn.onclick = function() {
                const ids = getSelectedAuthIds();
                if (ids.length === 0) return showNotification && showNotification('info', 'No selection', 'Select at least one ID');
                const proceed = typeof showConfirm === 'function' ? showConfirm('Archive selected IDs?', doIt) : (confirm('Archive selected IDs?') && doIt());
                function doIt(){
                    fetch('authorized_ids_manage.php', {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'action=bulk_archive&ids=' + encodeURIComponent(JSON.stringify(ids))
                    }).then(() => {
                        const params = new URLSearchParams(window.__authParams || {});
                        params.set('status', 'archived');
                        window.__authParams = Object.fromEntries(params.entries());
                        loadAuthorizedIds(params.toString());
                    });
                }
            };
        }
        if (bulkUnarchiveBtn) {
            bulkUnarchiveBtn.onclick = function() {
                const ids = getSelectedAuthIds();
                if (ids.length === 0) return showNotification && showNotification('info', 'No selection', 'Select at least one ID');
                const proceed = typeof showConfirm === 'function' ? showConfirm('Unarchive selected IDs?', doIt) : (confirm('Unarchive selected IDs?') && doIt());
                function doIt(){
                    fetch('authorized_ids_manage.php', {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'action=bulk_unarchive&ids=' + encodeURIComponent(JSON.stringify(ids))
                    }).then(() => {
                        const params = new URLSearchParams(window.__authParams || {});
                        params.delete('status');
                        window.__authParams = Object.fromEntries(params.entries());
                        loadAuthorizedIds(params.toString());
                    });
                }
            };
        }
        if (bulkDeleteBtn) {
            bulkDeleteBtn.id = 'authBulkDeleteBtn';
            bulkDeleteBtn.onclick = function() {
                const ids = getSelectedAuthIds();
                if (ids.length === 0) return showNotification && showNotification('info', 'No selection', 'Select at least one ID');
                const proceed = typeof showConfirm === 'function' ? showConfirm('Delete selected IDs? This cannot be undone.', doIt) : (confirm('Delete selected IDs? This cannot be undone.') && doIt());
                function doIt(){
                    fetch('authorized_ids_manage.php', {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'action=bulk_delete&ids=' + encodeURIComponent(JSON.stringify(ids))
                    }).then(() => {
                        const params = new URLSearchParams(window.__authParams || {});
                        loadAuthorizedIds(params.toString());
                    });
                }
            };
        }
        if (exportBtn) {
            exportBtn.onclick = function(){
                const params = new URLSearchParams(window.__authParams || {});
                const url = 'authorized_ids_export.php' + (params.toString() ? ('?' + params.toString()) : '');
                window.open(url, '_blank');
            };
        }

        wrapper.querySelectorAll('.auth-delete').forEach(btn => {
            btn.onclick = function() {
                fetch('authorized_ids_manage.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'action=delete&id=' + encodeURIComponent(this.getAttribute('data-id'))
                }).then(() => {
                    const params = new URLSearchParams(window.__authParams || {});
                    loadAuthorizedIds(params.toString());
                }).catch(() => showNotification && showNotification('error', 'Error', 'Delete failed'));
            };
        });

        // Archive
        const archiveBtns = wrapper.querySelectorAll('.auth-archive');
        console.log('Found archive buttons:', archiveBtns.length);
        archiveBtns.forEach(btn => {
            btn.onclick = function() {
                const id = this.getAttribute('data-id');
                console.log('Archive button clicked for ID:', id);
                if (typeof showConfirm === 'function') {
                    showConfirm('Archive this authorized ID?', () => doArchiveAuthorizedId(id));
                } else {
                    // Fallback
                    if (confirm('Archive this authorized ID?')) doArchiveAuthorizedId(id);
                }
            };
        });

        function doArchiveAuthorizedId(id) {
                fetch('authorized_ids_manage.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'action=archive&id=' + encodeURIComponent(id)
                })
                .then(async r => { try { return await r.json(); } catch(e){ return { success:false }; } })
                .then(res => {
                console.log('Archive response:', res);
                    if (res && res.success) {
                        showNotification && showNotification('success', 'Archived', 'ID archived');
                    // Switch to Archived IDs tab
                    const tabAuthorizedArchived = document.getElementById('tabAuthorizedArchived');
                        setTimeout(() => {
                            if (tabAuthorizedArchived) { 
                                console.log('Switching to Archived IDs tab');
                                tabAuthorizedArchived.click(); 
                                // Force refresh after tab switch
                                setTimeout(() => {
                        const params = new URLSearchParams(window.__authParams || {});
                                    params.set('status', 'archived');
                                    window.__authParams = Object.fromEntries(params.entries());
                        loadAuthorizedIds(params.toString());
                                }, 100);
                            } else {
                                const params = new URLSearchParams(window.__authParams || {});
                                params.set('status', 'archived');
                                window.__authParams = Object.fromEntries(params.entries());
                                loadAuthorizedIds(params.toString());
                            }
                        }, 150);
                    } else {
                        showNotification && showNotification('error', 'Error', res.message || 'Archive failed');
                    }
                })
            .catch((err) => {
                console.error('Archive error:', err);
                showNotification && showNotification('error', 'Error', 'Archive failed');
        });
        }

        // Unarchive
        wrapper.querySelectorAll('.auth-unarchive').forEach(btn => {
            btn.onclick = function() {
                const id = this.getAttribute('data-id');
                if (typeof showConfirm === 'function') {
                    showConfirm('Unarchive this authorized ID?', () => doUnarchiveAuthorizedId(id));
                } else {
                    if (confirm('Unarchive this authorized ID?')) doUnarchiveAuthorizedId(id);
                }
            };
        });

        function doUnarchiveAuthorizedId(id) {
                fetch('authorized_ids_manage.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'action=unarchive&id=' + encodeURIComponent(id)
                })
                .then(async r => { try { return await r.json(); } catch(e){ return { success:false }; } })
                .then(res => {
                    if (res && res.success) {
                        showNotification && showNotification('success', 'Unarchived', 'ID unarchived');
                    // Return to active Authorized IDs tab
                    const tabAuthorized = document.getElementById('tabAuthorized');
                    if (tabAuthorized) { tabAuthorized.click(); } else {
                        const params = new URLSearchParams(window.__authParams || {});
                        params.delete('status');
                        window.__authParams = Object.fromEntries(params.entries());
                        loadAuthorizedIds(params.toString());
                    }
                    } else {
                        showNotification && showNotification('error', 'Error', res.message || 'Unarchive failed');
                    }
                })
                .catch(() => showNotification && showNotification('error', 'Error', 'Unarchive failed'));
        }

        // Edit (prompt new ID)
        wrapper.querySelectorAll('.auth-edit').forEach(btn => {
            btn.onclick = function() {
                const rowId = this.getAttribute('data-id');
                const current = this.getAttribute('data-idnum') || '';
                const modal = document.getElementById('editAuthIdModal');
                if (!modal) return;
                document.getElementById('editAuthRowId').value = rowId;
                document.getElementById('editAuthIdInput').value = current;
                document.getElementById('editAuthIdError').textContent = '';
                modal.style.display = 'flex';
            };
        });

        const bulkBtn = wrapper.querySelector('#authBulkDeleteBtn');
        if (bulkBtn) {
            bulkBtn.onclick = function() {
                const ids = Array.from(wrapper.querySelectorAll('.auth-row:checked')).map(cb => cb.getAttribute('data-id'));
                if (ids.length === 0) return;
                fetch('authorized_ids_manage.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'action=bulk_delete&ids=' + encodeURIComponent(JSON.stringify(ids))
                }).then(() => {
                    const params = new URLSearchParams(window.__authParams || {});
                    loadAuthorizedIds(params.toString());
                }).catch(() => showNotification && showNotification('error', 'Error', 'Bulk delete failed'));
            };
        }

        const addBtn = wrapper.querySelector('#authAddRowBtn');
        const openAddModalBtn = wrapper.querySelector('#openAddAuthModalBtn');
        if (openAddModalBtn) {
            openAddModalBtn.onclick = function() {
                document.getElementById('addAuthIdModal').style.display = 'flex';
                const input = document.getElementById('addAuthIdInput');
                const error = document.getElementById('addAuthIdError');
                if (input) input.value = '';
                if (error) error.textContent = '';
            };
        }

        // Sorting for Authorized IDs
        wrapper.querySelectorAll('.auth-sortable').forEach(th => {
            th.style.cursor = 'pointer';
            th.onclick = function(){
                const key = th.getAttribute('data-sort');
                const params = new URLSearchParams(window.__authParams || {});
                const currentKey = params.get('sortBy') || 'id_number';
                const currentDir = params.get('sortDir') || 'ASC';
                params.set('sortBy', key);
                params.set('sortDir', (currentKey === key && currentDir === 'ASC') ? 'DESC' : 'ASC');
                window.__authParams = Object.fromEntries(params.entries());
                loadAuthorizedIds(params.toString());
            };
        });
    }
    const _userSearchInput = document.getElementById('userSearchInput');
    if (_userSearchInput) {
        _userSearchInput.addEventListener('input', function() { loadUsers(); });
    }
    const _userRoleSelect = document.getElementById('userRoleSelect');
    if (_userRoleSelect) {
        _userRoleSelect.addEventListener('change', function() { loadUsers(); });
    }
    const _userStatusSelect = document.getElementById('userStatusSelect');
    if (_userStatusSelect) {
        _userStatusSelect.addEventListener('change', function() { loadUsers(); });
    }
    const _userFilterBtn = document.getElementById('userFilterBtn');
    if (_userFilterBtn) {
        _userFilterBtn.addEventListener('click', function() { loadUsers(); });
    }

    // Sub-tabs switching (with Archived views)
    const tabUsers = document.getElementById('tabUsers');
    const tabUsersArchived = document.getElementById('tabUsersArchived');
    const tabAuthorized = document.getElementById('tabAuthorized');
    const tabAuthorizedArchived = document.getElementById('tabAuthorizedArchived');
    if (tabUsers && tabAuthorized) {
        tabUsers.onclick = function(){
            document.getElementById('usersToolbar').style.display = 'flex';
            document.getElementById('userTableWrapper').style.display = 'block';
            document.getElementById('authIdsWrapper').style.display = 'none';
            tabUsers.style.background = '#1d9b3e';
            if (tabUsersArchived) tabUsersArchived.style.background = '#6c757d';
            tabAuthorized.style.background = '#6c757d';
            if (tabAuthorizedArchived) tabAuthorizedArchived.style.background = '#6c757d';
            // Reset filters
            const statusSel = document.getElementById('userStatusSelect');
            if (statusSel) statusSel.value = '';
            window.__userTablePage = 1;
            loadUsers();
        };
        if (tabUsersArchived) {
            tabUsersArchived.onclick = function(){
                document.getElementById('usersToolbar').style.display = 'flex';
                document.getElementById('userTableWrapper').style.display = 'block';
                document.getElementById('authIdsWrapper').style.display = 'none';
                tabUsers.style.background = '#6c757d';
                tabUsersArchived.style.background = '#1d9b3e';
                tabAuthorized.style.background = '#6c757d';
                if (tabAuthorizedArchived) tabAuthorizedArchived.style.background = '#6c757d';
                const statusSel = document.getElementById('userStatusSelect');
                if (statusSel) statusSel.value = 'Archived';
                window.__userTablePage = 1;
                loadUsers();
            };
        }
        tabAuthorized.onclick = function(){
            document.getElementById('usersToolbar').style.display = 'none';
            document.getElementById('userTableWrapper').style.display = 'none';
            document.getElementById('authIdsWrapper').style.display = 'block';
            tabAuthorized.style.background = '#1d9b3e';
            tabUsers.style.background = '#6c757d';
            if (tabUsersArchived) tabUsersArchived.style.background = '#6c757d';
            if (tabAuthorizedArchived) tabAuthorizedArchived.style.background = '#6c757d';
            const params = new URLSearchParams(window.__authParams || {});
            params.delete('status');
            window.__authParams = Object.fromEntries(params.entries());
            loadAuthorizedIds(params.toString());
        };
        if (tabAuthorizedArchived) {
            tabAuthorizedArchived.onclick = function(){
                document.getElementById('usersToolbar').style.display = 'none';
                document.getElementById('userTableWrapper').style.display = 'none';
                document.getElementById('authIdsWrapper').style.display = 'block';
                tabAuthorized.style.background = '#6c757d';
                tabUsers.style.background = '#6c757d';
                if (tabUsersArchived) tabUsersArchived.style.background = '#6c757d';
                tabAuthorizedArchived.style.background = '#1d9b3e';
                const params = new URLSearchParams(window.__authParams || {});
                params.set('status', 'archived');
                window.__authParams = Object.fromEntries(params.entries());
                console.log('Switching to Archived IDs tab with params:', Object.fromEntries(params.entries()));
                loadAuthorizedIds(params.toString());
            };
        }
    }

    // Delegate pagination/sort/export controls
    document.addEventListener('change', function(e) {
        if (e.target && ['userSortBy','userSortDir','userPageSize'].includes(e.target.id)) {
            window.__userTablePage = 1;
        loadUsers();
        }
    });

    // Attach actions to Edit, Delete, Archive buttons
    function attachUserActions() {
        if (!window.__selectedUserIds) { window.__selectedUserIds = new Set(); }
        // Edit
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = function() {
                const user = JSON.parse(this.getAttribute('data-user'));
                document.getElementById('editUserId').value = user.id;
                document.getElementById('editFirstname').value = user.firstname || '';
                document.getElementById('editMiddlename').value = user.middlename || '';
                document.getElementById('editLastname').value = user.lastname || '';
                document.getElementById('editIdNumber').value = user.id_number || '';
                document.getElementById('editEmail').value = user.email || '';
                document.getElementById('editRole').value = (user.role || '').toUpperCase();
                document.getElementById('editUserModal').style.display = 'block';
            };
        });

        // Send Reset Password
        document.querySelectorAll('.reset-password-btn').forEach(btn => {
            btn.onclick = function() {
                const email = this.getAttribute('data-email');
                if (!email) { return; }
                showConfirm('Send password reset link to ' + email + '?', () => {
                    const params = new URLSearchParams();
                    params.set('action', 'send_reset_password');
                    params.set('email', email);
                    const originalText = this.textContent;
                    this.disabled = true; this.textContent = 'Sending...';
                    fetch('user_action_ajax.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: params.toString()
                    })
                    .then(r => r.json())
                    .then(data => {
                        if (data && data.success) {
                            showNotification('success', 'Email sent', 'Password reset link sent to ' + email);
                        } else {
                            showNotification('error', 'Failed', (data && data.message) ? data.message : 'Unable to send reset email');
                        }
                    })
                    .catch(() => {
                        showNotification('error', 'Failed', 'Network error while sending reset email');
                    })
                    .finally(() => { this.disabled = false; this.textContent = originalText; });
                });
            };
        });
        // Delete
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = function() {
                showConfirm('Are you sure you want to delete this user?', () => {
                    fetch('user_action_ajax.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'action=delete&id=' + encodeURIComponent(this.getAttribute('data-id'))
                    }).then(() => loadUsers());
                });
            };
        });
        // Archive
        document.querySelectorAll('.archive-btn').forEach(btn => {
            btn.onclick = function() {
                showConfirm('Archive this user? (Status will be set to Archived)', () => {
                    fetch('user_action_ajax.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'action=archive&id_number=' + encodeURIComponent(this.getAttribute('data-idnumber'))
                    }).then(() => {
                        showNotification('success', 'Success', 'User archived successfully');
                        // Switch to Archived Users tab
                        const statusSel = document.getElementById('userStatusSelect');
                        if (statusSel) statusSel.value = 'Archived';
                        const tabUsersArchived = document.getElementById('tabUsersArchived');
                        if (tabUsersArchived) { tabUsersArchived.click(); } else { loadUsers(); }
                    }).catch(() => {
                        showNotification('error', 'Error', 'Failed to archive user');
                    });
                });
            };
        });
        // Unarchive
        document.querySelectorAll('.unarchive-btn').forEach(btn => {
            btn.onclick = function() {
                showConfirm('Are you sure you want to unarchive this user?', () => {
                    fetch('user_action_ajax.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'action=unarchive&id_number=' + encodeURIComponent(this.getAttribute('data-idnumber'))
                    }).then(() => {
                        showNotification('success', 'Success', 'User unarchived successfully');
                        // Return to active users tab
                        const statusSel = document.getElementById('userStatusSelect');
                        if (statusSel) statusSel.value = 'Active';
                        const tabUsers = document.getElementById('tabUsers');
                        if (tabUsers) { tabUsers.click(); } else { loadUsers(); }
                    }).catch(() => {
                        showNotification('error', 'Error', 'Failed to unarchive user');
                    });
                });
            };
        });

        // Bulk selection controls
        const selectAll = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('.user-checkbox');
        const bar = document.getElementById('bulkActionsBar');
        const selectedCountEl = document.getElementById('selectedCount');
        const bulkArchiveBtn = document.getElementById('bulkArchiveBtn');
        const bulkUnarchiveBtn = document.getElementById('bulkUnarchiveBtn');
        const clearSelectionBtn = document.getElementById('clearSelectionBtn');

        // Initialize checked state from persisted selection
        checkboxes.forEach(cb => {
            const idNum = cb.getAttribute('data-idnumber');
            if (window.__selectedUserIds.has(idNum)) { cb.checked = true; }
        });

        function updateBulkBar() {
            const count = window.__selectedUserIds.size;
            if (selectedCountEl) selectedCountEl.textContent = count;
            if (bar) bar.style.display = count > 0 ? 'flex' : 'none';
            // Reflect selectAll if all visible are selected
            if (selectAll) {
                const allVisibleSelected = Array.from(checkboxes).every(cb => window.__selectedUserIds.has(cb.getAttribute('data-idnumber')));
                selectAll.checked = allVisibleSelected && checkboxes.length > 0;
            }
        }

        if (selectAll) {
            selectAll.onchange = function() {
                checkboxes.forEach(cb => {
                    cb.checked = selectAll.checked;
                    const idNum = cb.getAttribute('data-idnumber');
                    if (selectAll.checked) { window.__selectedUserIds.add(idNum); }
                    else { window.__selectedUserIds.delete(idNum); }
                });
                updateBulkBar();
            };
        }
        checkboxes.forEach(cb => cb.addEventListener('change', function(){
            const idNum = this.getAttribute('data-idnumber');
            if (this.checked) { window.__selectedUserIds.add(idNum); }
            else { window.__selectedUserIds.delete(idNum); }
            updateBulkBar();
        }));

        function performBulk(action) {
            const ids = Array.from(window.__selectedUserIds);
            if (ids.length === 0) return;
            showConfirm(`Are you sure you want to ${action} ${ids.length} user(s)?`, () => {
                fetch('user_action_ajax.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'action=' + encodeURIComponent('bulk_' + action) + '&id_numbers=' + encodeURIComponent(JSON.stringify(ids))
                }).then(() => {
                    showNotification('success', 'Success', `Users ${action}d successfully`);
                    // After bulk action, clear selection and reload
                    window.__selectedUserIds.clear();
                    loadUsers();
                }).catch(() => {
                    showNotification('error', 'Error', `Failed to ${action} users`);
                });
            });
        }
        if (bulkArchiveBtn) bulkArchiveBtn.onclick = () => performBulk('archive');
        if (bulkUnarchiveBtn) bulkUnarchiveBtn.onclick = () => performBulk('unarchive');
        if (clearSelectionBtn) clearSelectionBtn.onclick = () => {
            window.__selectedUserIds.clear();
            if (selectAll) selectAll.checked = false;
            checkboxes.forEach(cb => { cb.checked = false; });
            updateBulkBar();
        };

        // If a single delete occurs, drop it from the selection set
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const row = btn.closest('tr');
                const cb = row ? row.querySelector('.user-checkbox') : null;
                const idNum = cb ? cb.getAttribute('data-idnumber') : null;
                if (idNum) { window.__selectedUserIds.delete(idNum); }
            });
        });

        // Export CSV (bind here to avoid popup blockers and survive table reloads)
        const exportBtn = document.getElementById('exportCsvBtn');
        if (exportBtn) {
            exportBtn.onclick = function() {
                const search = encodeURIComponent(document.getElementById('userSearchInput').value || '');
                const role = encodeURIComponent(document.getElementById('userRoleSelect').value || '');
                const status = encodeURIComponent(document.getElementById('userStatusSelect').value || '');
                const sortBy = encodeURIComponent(document.getElementById('userSortBy')?.value || 'firstname');
                const sortDir = encodeURIComponent(document.getElementById('userSortDir')?.value || 'ASC');
                const url = 'user_table_export.php?search=' + search + '&role=' + role + '&status=' + status + '&sortBy=' + sortBy + '&sortDir=' + sortDir;
                window.location.href = url;
            };
        }

        // Open Import Authorized IDs modal (available in whichever tab the button appears)
        document.querySelectorAll('#openImportAuthModalBtn').forEach(btn => {
            btn.onclick = function() {
                document.getElementById('importAuthIdsModal').style.display = 'flex';
                const res = document.getElementById('importAuthIdsResult');
                if (res) res.textContent = '';
            };
        });

        // Sample CSV download
        const downloadSample = document.getElementById('downloadAuthSample');
        if (downloadSample) {
            downloadSample.onclick = function(e){
                e.preventDefault();
                const csv = 'id_number,status\nKLD-22-000123,active\nKLD-22-000124,active';
                const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
                const a = document.createElement('a');
                a.href = url; a.download = 'authorized_ids_sample.csv'; a.click();
                URL.revokeObjectURL(url);
            };
        }

        // Import Authorized IDs submit
        const importForm = document.getElementById('importAuthIdsForm');
        if (importForm) {
            importForm.onsubmit = function(e){
                e.preventDefault();
                const formData = new FormData(importForm);
                fetch('import_authorized_ids.php', { method: 'POST', body: formData })
                  .then(r => r.json())
                  .then(result => {
                      const res = document.getElementById('importAuthIdsResult');
                      if (res) res.textContent = result.message || 'Done';
                      if (result.success) {
                          showNotification('success', 'Import Complete', result.message || 'Authorized IDs imported');
                          document.getElementById('importAuthIdsModal').style.display = 'none';
                          // refresh whichever tab is active
                          if (document.getElementById('authIdsWrapper') && document.getElementById('authIdsWrapper').style.display !== 'none') {
                              loadAuthorizedIds();
                          } else {
                              loadUsers();
                          }
                      } else {
                          showNotification('error', 'Import Failed', result.message || 'Error importing file');
                      }
                  })
                  .catch(() => {
                      showNotification('error', 'Import Failed', 'Network or server error');
                  });
            };
        }

        // Quick filter pills
        const pillActive = document.getElementById('pillActive');
        const pillArchived = document.getElementById('pillArchived');
        if (pillActive) pillActive.onclick = () => { document.getElementById('userStatusSelect').value = 'Active'; loadUsers(); };
        if (pillArchived) pillArchived.onclick = () => { document.getElementById('userStatusSelect').value = 'Archived'; loadUsers(); };

        // Clickable sortable headers
        document.querySelectorAll('.users-table thead th.sortable').forEach(th => {
            th.onclick = () => {
                const currentSortBy = document.getElementById('userSortBy')?.value || 'firstname';
                const currentSortDir = document.getElementById('userSortDir')?.value || 'ASC';
                const newSortBy = th.getAttribute('data-sort');
                let newDir = 'ASC';
                if (newSortBy === currentSortBy) {
                    newDir = currentSortDir === 'ASC' ? 'DESC' : 'ASC';
                }
                if (document.getElementById('userSortBy')) document.getElementById('userSortBy').value = newSortBy;
                if (document.getElementById('userSortDir')) document.getElementById('userSortDir').value = newDir;
                window.__userTablePage = 1;
                loadUsers();
            };
        });
    }
    // Confirm modal logic
    function showConfirm(text, onYes) {
        document.getElementById('confirmText').innerText = text;
        document.getElementById('confirmModal').style.display = 'flex';
        document.getElementById('confirmYesBtn').onclick = function() {
            document.getElementById('confirmModal').style.display = 'none';
            onYes();
        };
        document.getElementById('confirmNoBtn').onclick = function() {
            document.getElementById('confirmModal').style.display = 'none';
        };
    }
    // Edit form submit
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.onsubmit = function(e) {
        e.preventDefault();
        const form = e.target;
        const data = new URLSearchParams(new FormData(form)).toString();
        fetch('user_action_ajax.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=edit&' + data
        }).then(() => {
            document.getElementById('editUserModal').style.display = 'none';
            loadUsers();
        });
    };
    }
    // Close modals on outside click
    window.onclick = function(event) {
        if (event.target === document.getElementById('addUserModal')) document.getElementById('addUserModal').style.display = 'none';
        if (event.target === document.getElementById('editUserModal')) document.getElementById('editUserModal').style.display = 'none';
        if (event.target === document.getElementById('confirmModal')) document.getElementById('confirmModal').style.display = 'none';
        if (event.target === document.getElementById('createCourseModal')) document.getElementById('createCourseModal').style.display = 'none';
    };

    // Notification function
    function showNotification(type, title, message) {
        // If a dedicated container exists (Coordinator layout), use it
        const container = document.getElementById('notification');
        if (container) {
            const iconElement = container.querySelector('i');
            const titleElement = container.querySelector('.notification-title');
            const messageElement = container.querySelector('.notification-message');

            container.className = 'notification';
            iconElement.className = 'fas';

            if (type === 'success') {
                container.classList.add('success');
                iconElement.classList.add('fa-check-circle');
            } else if (type === 'error') {
                container.classList.add('error');
                iconElement.classList.add('fa-exclamation-circle');
            } else if (type === 'warning') {
                container.classList.add('warning');
                iconElement.classList.add('fa-exclamation-triangle');
            } else {
                container.classList.add('info');
                iconElement.classList.add('fa-info-circle');
            }

            titleElement.textContent = title;
            messageElement.textContent = message;

            setTimeout(() => container.classList.add('show'), 100);
            setTimeout(() => { container.classList.remove('show'); }, 5000);
            return;
        }

        // Fallback: dynamically create a notification (Teacher layout or others)
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        let iconClass = 'fa-info-circle';
        if (type === 'success') iconClass = 'fa-check-circle';
        else if (type === 'error') iconClass = 'fa-exclamation-circle';
        else if (type === 'warning') iconClass = 'fa-exclamation-triangle';

        notification.innerHTML = `
            <i class="fas ${iconClass}"></i>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
        `;

        document.body.appendChild(notification);
        requestAnimationFrame(() => notification.classList.add('show'));
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => { if (notification.parentElement) notification.remove(); }, 300);
        }, 5000);
    }

    // Use unified notification system from notification_system.js if available
    // Otherwise, use the custom notification function
    if (typeof window !== 'undefined') {
        // Only set if notification_system.js hasn't already set it
        if (typeof window.showNotification === 'undefined') {
        window.showNotification = showNotification;
        }
    }

    // Password checklist logic (for Add User modal)
    function validatePassword(password) {
        const checks = {
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        };
        const pwLength = document.getElementById('pwLength');
        const pwUpper = document.getElementById('pwUpper');
        const pwLower = document.getElementById('pwLower');
        const pwNumber = document.getElementById('pwNumber');
        const pwSpecial = document.getElementById('pwSpecial');
        if (pwLength) pwLength.innerHTML = `<i class="fas fa-${checks.length ? 'check' : 'times'}"></i> At least 8 characters`;
        if (pwUpper) pwUpper.innerHTML = `<i class="fas fa-${checks.upper ? 'check' : 'times'}"></i> Uppercase letter`;
        if (pwLower) pwLower.innerHTML = `<i class="fas fa-${checks.lower ? 'check' : 'times'}"></i> Lowercase letter`;
        if (pwNumber) pwNumber.innerHTML = `<i class="fas fa-${checks.number ? 'check' : 'times'}"></i> Number`;
        if (pwSpecial) pwSpecial.innerHTML = `<i class="fas fa-${checks.special ? 'check' : 'times'}"></i> Special character`;
        return Object.values(checks).every(check => check === true);
    }
    const passwordInput = document.getElementById('addUserPassword');
    if (passwordInput) {
        passwordInput.addEventListener('focus', function() {
            const checklist = document.getElementById('passwordChecklist');
            if (checklist) checklist.style.display = 'block';
        });
        passwordInput.addEventListener('input', function() {
            validatePassword(this.value);
        });
    }
    // Password toggle
    window.toggleAddUserPassword = function() {
        const passwordInput = document.getElementById('addUserPassword');
        if (!passwordInput) return;
        const eyeIcon = passwordInput.nextElementSibling.querySelector('i');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
        }
    };

    // Navigation functionality (persist last section)
    function activateSection(sectionId) {
        if (!sectionId || !document.getElementById(sectionId)) return;
        console.log('🔄 Admin Dashboard: Switching to section:', sectionId);
        
        // Toggle active classes
        document.querySelectorAll('.sidebar li').forEach(i => {
            i.classList.toggle('active', i.getAttribute('data-section') === sectionId);
        });
        
        // AGGRESSIVE FIX: Force hide all sections and show only the target
        document.querySelectorAll('.section-content').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none'; // Force hide
            console.log(`  - Admin Dashboard: Hidden ${section.id}`);
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block'; // Force show
            console.log(`✅ Admin Dashboard: Section activated ${sectionId}`);
        } else {
            console.error(`❌ Admin Dashboard: Section not found ${sectionId}`);
        }
        // Persist selection and reflect in URL
        try {
            localStorage.setItem('adminLastSection', sectionId);
            const url = new URL(window.location.href);
            url.searchParams.set('section', sectionId);
            history.replaceState({}, '', url);
        } catch (e) {}
        // Section-specific init
            if (sectionId === 'dashboard') {
                updateDashboardStats();
        } else if (sectionId === 'analytics') {
            setTimeout(() => {
                initializeAnalyticsCharts();
                loadAllAnalytics();
            }, 100);
        } else if (sectionId === 'profile') {
            setTimeout(() => {
                loadPreferences();
            }, 100);
        } else if (sectionId === 'settings') {
            setTimeout(() => {
                initSettings();
            }, 100);
        }
    }

    document.querySelectorAll('.sidebar li').forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            activateSection(sectionId);
        });
    });

    // Restore last visited section on load (URL ?section=... takes priority)
    (function restoreSectionOnLoad() {
        const urlSection = new URLSearchParams(window.location.search).get('section');
        const savedSection = localStorage.getItem('adminLastSection');
        const initial = urlSection || savedSection;
        if (initial && initial !== 'dashboard') {
            activateSection(initial);
        } else {
            // Ensure URL reflects default
            try {
                const url = new URL(window.location.href);
                url.searchParams.set('section', 'dashboard');
                history.replaceState({}, '', url);
                localStorage.setItem('adminLastSection', 'dashboard');
            } catch (e) {}
        }
    })();

    // Settings dropdown functionality moved to dark mode section above

    // Initial loads
    updateDashboardStats();
    loadUsers();
    addStatCardInteractions();
    
    // Initialize dashboard refresh interval (overridden by preferences if set)
    applyDashboardRefreshRate(10);

    // Add User form validation and AJAX
    window.validateAddUserForm = function(event) {
        event.preventDefault();
        const form = event.target;
        let hasErrors = false;
        // Clear previous error messages
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        if (!form.firstname.value.trim()) {
            document.getElementById('firstnameError').textContent = 'First name is required';
            hasErrors = true;
        }
        if (!form.lastname.value.trim()) {
            document.getElementById('lastnameError').textContent = 'Last name is required';
            hasErrors = true;
        }
        if (!form.id_number.value.trim()) {
            document.getElementById('idNumberError').textContent = 'ID Number is required';
            hasErrors = true;
        } else if (!/^KLD-\d{2}-\d{6}$/.test(form.id_number.value.trim())) {
            document.getElementById('idNumberError').textContent = 'ID Number must be in format: KLD-YY-XXXXXX';
            hasErrors = true;
        }
        if (!form.email.value.trim()) {
            document.getElementById('emailError').textContent = 'Email is required';
            hasErrors = true;
        }
        const inviteChecked = document.getElementById('inviteUserCheckbox')?.checked;
        if (!inviteChecked) {
        if (!form.password.value.trim()) {
            document.getElementById('passwordError').textContent = 'Password is required';
            hasErrors = true;
        } else if (!validatePassword(form.password.value)) {
            document.getElementById('passwordError').textContent = 'Password does not meet requirements';
            hasErrors = true;
            }
        }
        if (!form.role.value) {
            showNotification('error', 'Validation Error', 'Please select a role');
            hasErrors = true;
        }
        if (!hasErrors) {
            const formData = new FormData(form);
            if (inviteChecked) {
                // When inviting, we do not require password
                formData.set('password', '');
            }
            formData.append('add_user', '1');
            fetch('?section=users', {
                method: 'POST',
                body: formData
            })
            .then(async response => {
                try { return await response.json(); } catch(e) { return { success:false, message:'Unexpected server response' }; }
            })
            .then(result => {
                if (result && result.success) {
                    showNotification('success', 'Success', result.message || 'User added successfully');
                    document.getElementById('addUserModal').style.display = 'none';
                    form.reset();
                    loadUsers();
                } else {
                    showNotification('error', 'Error', result.message || 'Failed to add user. Please try again.');
                }
            })
            .catch(error => {
                showNotification('error', 'Error', 'An unexpected error occurred');
            });
        } else {
            showNotification('error', 'Validation Error', 'Please check the form for errors');
        }
        return false;
    };

    // OOP User Role Doughnut Chart
    class UserRoleChart {
        constructor(canvasId, dataUrl) {
            this.canvasId = canvasId;
            this.dataUrl = dataUrl;
            this.chart = null;
        }

        fetchData() {
            return fetch(this.dataUrl)
            .then(response => response.json())
                .catch(err => {
                    console.error('Error fetching user role data:', err);
                    return null;
                });
        }

        renderChart(data) {
            const canvas = document.getElementById(this.canvasId);
            const ctx = canvas.getContext('2d');
            const labels = data ? Object.keys(data) : [];
            const counts = data ? Object.values(data) : [];
            console.log('UserRoleChart data:', data);
            if (!data || labels.length === 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
                ctx.fillStyle = "#888";
                ctx.fillText("No user role data to display", canvas.width / 2, canvas.height / 2);
                return;
            }
            
            // Destroy existing chart if it exists
            if (this.chart) {
                this.chart.destroy();
            }
            
            this.chart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: counts,
                        backgroundColor: [
                            '#dc3545', // Admin - Red
                            '#6c757d', // Coordinator - Grey
                            '#28a745', // Student - Green
                            '#ffc107'  // Teacher - Yellow
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    return `${label}: ${value}`;
                                }
                            }
                        },
                        datalabels: {
                            display: true,
                            color: '#222',
                            font: {
                                weight: 'bold',
                                size: 18
                            },
                            formatter: (value, context) => {
                                const data = context.chart.data.datasets[0].data;
                                const total = data.reduce((a, b) => a + b, 0);
                                const percent = total ? (value / total * 100) : 0;
                                return percent.toFixed(0) + '%';
                            },
                            anchor: 'center',
                            align: 'center'
                        }
                    }
                }
            });
        }

        init() {
            this.fetchData().then(data => this.renderChart(data));
        }
        
        // Method to refresh the chart
        refresh() {
            this.fetchData().then(data => this.renderChart(data));
        }
    }

    // Initialize the chart when the DOM is ready
    if (document.getElementById('userRoleChart')) {
        const userRoleChart = new UserRoleChart('userRoleChart', 'get_user_role_stats.php');
        userRoleChart.init();
        // Store reference for auto-refresh
        window.userRoleChartInstance = userRoleChart;
    }
    // Recently Registered Widget
    if (document.getElementById('recentlyRegisteredList')) {
        const registeredWidget = new DashboardWidget(
          'recentlyRegisteredList',
          'dashboard_recently_registered_ajax.php',
          renderRegisteredItem
        );
        registeredWidget.init();
        // Store reference for auto-refresh
        window.registeredWidgetInstance = registeredWidget;
    }
    // Recently Login Widget
    if (document.getElementById('recentlyLoginList')) {
        const loginWidget = new DashboardWidget(
          'recentlyLoginList',
          'dashboard_recently_login_ajax.php',
          renderLoginItem
        );
        loginWidget.init();
        // Store reference for auto-refresh
        window.loginWidgetInstance = loginWidget;
    }

    // Ensure chart resizes on window resize
    window.addEventListener('resize', function() {
        if (window.userRoleChartInstance) {
            // Removed explicit resize to avoid Chart.js error in some environments
        }
        if (window.registeredWidgetInstance) {
            window.registeredWidgetInstance.resize();
        }
        if (window.loginWidgetInstance) {
            window.loginWidgetInstance.resize();
        }
    });

    // OOP User Status Doughnut Chart
    class UserStatusChart {
      constructor(canvasId, dataUrl) {
        this.canvasId = canvasId;
        this.dataUrl = dataUrl;
        this.chart = null;
      }

      fetchData() {
        return fetch(this.dataUrl)
          .then(response => response.json())
          .catch(err => {
            console.error('Error fetching user status data:', err);
            return null;
          });
      }

      renderChart(data) {
        const canvas = document.getElementById(this.canvasId);
        const ctx = canvas.getContext('2d');
        const labels = data ? Object.keys(data) : [];
        const counts = data ? Object.values(data) : [];
        console.log('UserStatusChart data:', data);
        if (!data || labels.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = "#888";
            ctx.fillText("No user status data to display", canvas.width / 2, canvas.height / 2);
            return;
        }
                const colorMap = {
          'Active': '#28a745',
          'Pending': '#6c757d',
          'Suspended': '#6c757d',
          'Archived': '#6c757d',
          'Inactive': '#6c757d'
        };
        const colors = labels.map(label => colorMap[label] || '#B0BEC5');
        
        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }
        
        this.chart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
              data: counts,
                            backgroundColor: colors,
              borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
              legend: { position: 'bottom' },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    return `${label}: ${value}`;
                  }
                }
              },
                            datalabels: {
                display: true,
                color: '#222',
                font: {
                  weight: 'bold',
                  size: 18
                },
                                formatter: (value, context) => {
                  const data = context.chart.data.datasets[0].data;
                  const total = data.reduce((a, b) => a + b, 0);
                  const percent = total ? (value / total * 100) : 0;
                  return percent.toFixed(0) + '%';
                                },
                                anchor: 'center',
                align: 'center'
              }
            }
          }
        });
      }

      init() {
        this.fetchData().then(data => this.renderChart(data));
      }
      
      // Method to refresh the chart
      refresh() {
        this.fetchData().then(data => this.renderChart(data));
      }
    }

    // Initialize the chart when the DOM is ready
    if (document.getElementById('userStatusChart')) {
      const userStatusChart = new UserStatusChart('userStatusChart', 'get_user_status_stats.php');
      userStatusChart.init();
      // Store reference for auto-refresh
      window.userStatusChartInstance = userStatusChart;
    }

    // === USER ANALYTICS FUNCTIONALITY ===

    // Analytics Chart Classes
    class AnalyticsChart {
        constructor(canvasId, dataUrl, chartType = 'line') {
            this.canvasId = canvasId;
            this.dataUrl = dataUrl;
            this.chartType = chartType;
            this.chart = null;
        }

        fetchData(params = {}) {
            // Construct URL properly - use current pathname as base
            let urlStr = this.dataUrl;
            if (!urlStr.startsWith('http') && !urlStr.startsWith('/')) {
                // Relative URL - prepend current directory
                const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
                urlStr = basePath + urlStr;
            }
            const url = new URL(urlStr, window.location.origin);
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
            
            return fetch(url, { credentials: 'same-origin' })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        return response.json();
                    } else {
                        // Server returned HTML instead of JSON (likely an error page)
                        return response.text().then(text => {
                            throw new Error('Server returned HTML instead of JSON. Response: ' + text.substring(0, 200));
                        });
                    }
                })
                .catch(err => {
                    console.error(`Error fetching analytics data for ${this.canvasId}:`, err);
                    return null;
                });
        }

        getThemeColors() {
            const isDark = document.body.classList.contains('dark-mode');
            return {
                background: isDark ? '#2d2d2d' : '#ffffff',
                text: isDark ? '#e0e0e0' : '#333333',
                grid: isDark ? '#444444' : '#e0e0e0',
                border: isDark ? '#555555' : '#dee2e6'
            };
        }

        destroy() {
            if (this.chart) {
                this.chart.destroy();
                this.chart = null;
            }
        }

        refresh(params = {}) {
            this.fetchData(params).then(data => this.renderChart(data));
        }
    }

    class RegistrationTrendsChart extends AnalyticsChart {
        constructor(canvasId) {
            super(canvasId, 'get_user_analytics.php?type=registration_trends', 'line');
        }

        renderChart(data) {
            const canvas = document.getElementById(this.canvasId);
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const colors = this.getThemeColors();

            if (!data || data.length === 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
                ctx.fillStyle = colors.text;
                ctx.fillText("No registration data available", canvas.width / 2, canvas.height / 2);
                return;
            }

            this.destroy();

            const labels = data.map(item => new Date(item.date).toLocaleDateString());
            const counts = data.map(item => parseInt(item.count));

            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'New Registrations',
                        data: counts,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { 
                            display: true,
                            labels: { color: colors.text }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: colors.text },
                            grid: { color: colors.grid }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { 
                                color: colors.text,
                                stepSize: 1
                            },
                            grid: { color: colors.grid }
                        }
                    }
                }
            });
        }
    }

    class LoginActivityChart extends AnalyticsChart {
        constructor(canvasId) {
            super(canvasId, 'get_user_analytics.php?type=login_frequency', 'bar');
        }

        renderChart(data) {
            const canvas = document.getElementById(this.canvasId);
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const colors = this.getThemeColors();

            if (!data || data.length === 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
                ctx.fillStyle = colors.text;
                ctx.fillText("No login activity data available", canvas.width / 2, canvas.height / 2);
                return;
            }

            this.destroy();

            const labels = data.map(item => new Date(item.date).toLocaleDateString());
            const counts = data.map(item => parseInt(item.count));

            this.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Login Activity',
                        data: counts,
                        backgroundColor: '#17a2b8',
                        borderColor: '#138496',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { 
                            display: true,
                            labels: { color: colors.text }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: colors.text },
                            grid: { color: colors.grid }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { 
                                color: colors.text,
                                stepSize: 1
                            },
                            grid: { color: colors.grid }
                        }
                    }
                }
            });
        }
    }

    class MonthlyStatsChart extends AnalyticsChart {
        constructor(canvasId) {
            super(canvasId, 'get_user_analytics.php?type=monthly_stats', 'bar');
        }

        renderChart(data) {
            const canvas = document.getElementById(this.canvasId);
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const colors = this.getThemeColors();

            if (!data || data.length === 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
                ctx.fillStyle = colors.text;
                ctx.fillText("No monthly statistics available", canvas.width / 2, canvas.height / 2);
                return;
            }

            this.destroy();

            const labels = data.map(item => item.month);
            const students = data.map(item => parseInt(item.students));
            const teachers = data.map(item => parseInt(item.teachers));
            const coordinators = data.map(item => parseInt(item.coordinators));
            const admins = data.map(item => parseInt(item.admins));

            this.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Students',
                            data: students,
                            backgroundColor: '#28a745'
                        },
                        {
                            label: 'Teachers',
                            data: teachers,
                            backgroundColor: '#ffc107'
                        },
                        {
                            label: 'Coordinators',
                            data: coordinators,
                            backgroundColor: '#6c757d'
                        },
                        {
                            label: 'Admins',
                            data: admins,
                            backgroundColor: '#dc3545'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { 
                            display: true,
                            labels: { color: colors.text }
                        }
                    },
                    scales: {
                        x: {
                            stacked: true,
                            ticks: { color: colors.text },
                            grid: { color: colors.grid }
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            ticks: { 
                                color: colors.text,
                                stepSize: 1
                            },
                            grid: { color: colors.grid }
                        }
                    }
                }
            });
        }
    }

    class RoleActivityChart extends AnalyticsChart {
        constructor(canvasId) {
            super(canvasId, 'get_user_analytics.php?type=activity_summary', 'doughnut');
        }

        renderChart(data) {
            const canvas = document.getElementById(this.canvasId);
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const colors = this.getThemeColors();

            if (!data || data.length === 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
                ctx.fillStyle = colors.text;
                ctx.fillText("No role activity data available", canvas.width / 2, canvas.height / 2);
                return;
            }

            this.destroy();

            const labels = data.map(item => item.role);
            const activeCounts = data.map(item => parseInt(item.active_7_days));
            const roleColors = {
                'ADMIN': '#dc3545',
                'TEACHER': '#ffc107',
                'COORDINATOR': '#6c757d',
                'STUDENT': '#28a745'
            };

            this.chart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Active Users (7 days)',
                        data: activeCounts,
                        backgroundColor: labels.map(role => roleColors[role] || '#B0BEC5'),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { 
                            position: 'bottom',
                            labels: { color: colors.text }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    return `${label}: ${value} active users`;
                                }
                            }
                        },
                        datalabels: {
                            display: true,
                            color: '#fff',
                            font: {
                                weight: 'bold',
                                size: 14
                            },
                            formatter: (value, context) => {
                                const data = context.chart.data.datasets[0].data;
                                const total = data.reduce((a, b) => a + b, 0);
                                const percent = total ? (value / total * 100) : 0;
                                return percent.toFixed(0) + '%';
                            }
                        }
                    }
                }
            });
        }
    }

    // Analytics Data Loading Functions
    function loadAnalyticsOverview() {
        fetch('get_user_analytics.php?type=overview', { credentials: 'same-origin' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return response.json();
                } else {
                    return response.text().then(text => {
                        throw new Error('Server returned non-JSON response: ' + text.substring(0, 200));
                    });
                }
            })
            .then(data => {
                if (data.error) {
                    console.error('Analytics overview error:', data.error);
                    return;
                }
                
                // Update analytics cards
                const totalUsersEl = document.getElementById('totalUsersAnalytics');
                const activeUsers7El = document.getElementById('activeUsers7Days');
                const activeUsers30El = document.getElementById('activeUsers30Days');
                const neverLoggedInEl = document.getElementById('neverLoggedIn');
                
                if (totalUsersEl) totalUsersEl.textContent = data.total_users || 0;
                if (activeUsers7El) activeUsers7El.textContent = data.active_last_7_days || 0;
                if (activeUsers30El) activeUsers30El.textContent = data.active_last_30_days || 0;
                if (neverLoggedInEl) neverLoggedInEl.textContent = data.never_logged_in || 0;
            })
            .catch(error => {
                console.error('Error loading analytics overview:', error);
            });
    }

    function loadTopActiveUsers() {
        fetch('get_user_analytics.php?type=top_active&limit=10', { credentials: 'same-origin' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return response.json();
                } else {
                    return response.text().then(text => {
                        throw new Error('Server returned non-JSON response: ' + text.substring(0, 200));
                    });
                }
            })
            .then(data => {
                const container = document.getElementById('topActiveUsersList');
                if (!container) return;
                
                if (!data || data.length === 0) {
                    container.innerHTML = '<div class="empty-state">No active users found</div>';
                    return;
                }
                
                container.innerHTML = data.map(user => `
                    <div class="analytics-item">
                        <div class="analytics-item-content">
                            <div class="analytics-item-title">${user.name}</div>
                            <div class="analytics-item-subtitle">${user.role}</div>
                        </div>
                        <div class="analytics-item-value">
                            ${user.days_since_login ? user.days_since_login + ' days ago' : 'Today'}
                        </div>
                    </div>
                `).join('');
            })
            .catch(error => {
                console.error('Error loading top active users:', error);
                document.getElementById('topActiveUsersList').innerHTML = '<div class="empty-state">Error loading data</div>';
            });
    }

    function loadRoleActivitySummary() {
        const days = document.getElementById('analyticsTimeRange')?.value || 30;
        fetch('get_user_analytics.php?type=activity_summary&days=' + encodeURIComponent(days), { credentials: 'same-origin' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return response.json();
                } else {
                    return response.text().then(text => {
                        throw new Error('Server returned non-JSON response: ' + text.substring(0, 200));
                    });
                }
            })
            .then(data => {
                const container = document.getElementById('roleActivitySummary');
                if (!container) return;
                
                if (!data || data.length === 0) {
                    container.innerHTML = '<div class="empty-state">No activity data found</div>';
                    return;
                }
                
                container.innerHTML = data.map(role => {
                    const activePercentage = role.total_count > 0 ? (role.active_7_days / role.total_count * 100).toFixed(1) : 0;
                    return `
                        <div class="analytics-item">
                            <div class="analytics-item-content">
                                <div class="analytics-item-title">${role.role}</div>
                                <div class="analytics-item-subtitle">${role.active_7_days}/${role.total_count} active (${days} days)</div>
                            </div>
                            <div class="analytics-item-value">
                                ${activePercentage}%
                            </div>
                        </div>
                    `;
                }).join('');
            })
            .catch(error => {
                console.error('Error loading role activity summary:', error);
                document.getElementById('roleActivitySummary').innerHTML = '<div class="empty-state">Error loading data</div>';
            });
    }

    // Initialize Analytics Charts
    let analyticsCharts = {};

    function initializeAnalyticsCharts() {
        if (document.getElementById('registrationTrendsChart')) {
            analyticsCharts.registrationTrends = new RegistrationTrendsChart('registrationTrendsChart');
        }
        if (document.getElementById('loginActivityChart')) {
            analyticsCharts.loginActivity = new LoginActivityChart('loginActivityChart');
        }
        if (document.getElementById('monthlyStatsChart')) {
            analyticsCharts.monthlyStats = new MonthlyStatsChart('monthlyStatsChart');
        }
        if (document.getElementById('roleActivityChart')) {
            analyticsCharts.roleActivity = new RoleActivityChart('roleActivityChart');
        }
    }

    function loadAllAnalytics() {
        const timeRange = document.getElementById('analyticsTimeRange')?.value || 30;
        
        // Load overview data
        loadAnalyticsOverview();
        
        // Load charts with time range
        Object.values(analyticsCharts).forEach(chart => {
            if (chart instanceof RegistrationTrendsChart || chart instanceof LoginActivityChart) {
                chart.refresh({ days: timeRange });
            } else if (chart instanceof RoleActivityChart) {
                chart.refresh({ days: timeRange });
            } else {
                chart.refresh();
            }
        });
        
        // Load widgets
        loadTopActiveUsers();
        loadRoleActivitySummary();
    }

    // Analytics Event Listeners
    const analyticsTimeRange = document.getElementById('analyticsTimeRange');
    if (analyticsTimeRange) {
        analyticsTimeRange.addEventListener('change', loadAllAnalytics);
    }

    const refreshAnalyticsBtn = document.getElementById('refreshAnalytics');
    if (refreshAnalyticsBtn) {
        refreshAnalyticsBtn.addEventListener('click', loadAllAnalytics);
    }

    // Initialize analytics when analytics section is accessed
    document.querySelectorAll('.sidebar li').forEach(item => {
        if (item.getAttribute('data-section') === 'analytics') {
            item.addEventListener('click', function() {
                setTimeout(() => {
                    initializeAnalyticsCharts();
                    loadAllAnalytics();
                }, 100);
            });
        }
    });

    // Update theme toggle to refresh analytics charts
    // Note: This is now handled in the main theme toggle function to avoid conflicts

    // Make functions globally available
    window.loadTopActiveUsers = loadTopActiveUsers;
    window.loadRoleActivitySummary = loadRoleActivitySummary;
    window.loadAllAnalytics = loadAllAnalytics;

    // Add Authorized ID form handling (global once)
    const addAuthForm = document.getElementById('addAuthIdForm');
    if (addAuthForm) {
        addAuthForm.addEventListener('submit', function(e){
            e.preventDefault();
            const input = document.getElementById('addAuthIdInput');
            const error = document.getElementById('addAuthIdError');
            const value = (input?.value || '').trim();
            if (!/^KLD-\d{2}-\d{6}$/.test(value)) {
                if (error) error.textContent = 'Please enter a valid ID (KLD-YY-XXXXXX)';
                return;
            }
            fetch('authorized_ids_manage.php', {
                method:'POST',
                credentials: 'same-origin',
                headers:{'Content-Type':'application/x-www-form-urlencoded'},
                body: 'action=create&id_number=' + encodeURIComponent(value) + '&status=active'
            })
            .then(() => {
                document.getElementById('addAuthIdModal').style.display = 'none';
                loadAuthorizedIds();
                showNotification && showNotification('success', 'Added', 'Authorized ID added');
            })
            .catch(() => showNotification && showNotification('error', 'Error', 'Failed to add ID'));
        });
    }

    // Global: Edit Authorized ID modal submit
    const editAuthForm = document.getElementById('editAuthIdForm');
    if (editAuthForm) {
        editAuthForm.addEventListener('submit', function(e){
            e.preventDefault();
            const id = document.getElementById('editAuthRowId').value;
            const value = (document.getElementById('editAuthIdInput').value || '').trim();
            const error = document.getElementById('editAuthIdError');
            if (!/^KLD-\d{2}-\d{6}$/.test(value)) {
                if (error) error.textContent = 'Please enter a valid ID (KLD-YY-XXXXXX)';
                return;
            }
            fetch('authorized_ids_manage.php', {
                method:'POST',
                credentials: 'same-origin',
                headers:{'Content-Type':'application/x-www-form-urlencoded'},
                body: 'action=edit&id=' + encodeURIComponent(id) + '&id_number=' + encodeURIComponent(value)
            })
            .then(() => {
                document.getElementById('editAuthIdModal').style.display = 'none';
                loadAuthorizedIds();
                showNotification && showNotification('success', 'Saved', 'Authorized ID updated');
            })
            .catch(() => showNotification && showNotification('error', 'Error', 'Failed to save changes'));
        });
    }

    // === PROFILE SECTION FUNCTIONALITY ===

    // Profile photo upload functionality
    const profilePhotoInput = document.getElementById('profilePhotoInput');
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Show preview before upload and validate
                if (showPhotoPreview(file)) {
                uploadProfilePhoto(file);
                } else {
                    // Reset file input if validation failed
                    e.target.value = '';
                }
            }
        });
    }

    // Show photo preview before upload
    function showPhotoPreview(file) {
        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            showNotification('error', 'Error', 'File size too large. Maximum 5MB allowed.');
            return false;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            showNotification('error', 'Error', 'Invalid file type. Only JPG, PNG, and GIF allowed.');
            return false;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const avatar = document.querySelector('.profile-avatar-large');
            const preview = document.createElement('img');
            preview.src = e.target.result;
            preview.className = 'photo-preview';
            preview.alt = 'Preview';
            avatar.appendChild(preview);
        };
        reader.readAsDataURL(file);
        return true;
    }

    // Profile tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update active tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            const tabElement = document.getElementById(tabId);
            if (tabElement) {
                tabElement.classList.add('active');
            }
            
            // Load specific tab content
            if (tabId === 'security') {
                // no-op: login activity removed
            } else if (tabId === 'preferences') {
                loadPreferences();
            }
        });
    });

    // Update profile photos dynamically
    function updateProfilePhotos(filename) {
        // Update main profile photo
        const mainAvatar = document.querySelector('.profile-avatar-large');
        if (mainAvatar) {
            if (filename) {
        // Get the new photo URL with timestamp to avoid cache
        const timestamp = new Date().getTime();
        const photoUrl = `uploads/profile_photos/${filename}?t=${timestamp}`;
        
            const photoImg = mainAvatar.querySelector('.profile-photo');
            if (photoImg) {
                photoImg.src = photoUrl;
                    togglePhotoButtons(true);
            } else {
                // If no photo element exists, create one
                mainAvatar.innerHTML = `
                    <img src="${photoUrl}" alt="Profile Photo" class="profile-photo">
                    <div class="photo-upload-overlay">
                            <label for="profilePhotoInput" class="photo-upload-btn" title="Change Photo" style="display: none;">
                            <i class="fas fa-camera"></i>
                        </label>
                            <button type="button" class="photo-remove-btn" onclick="removeProfilePhoto()" title="Remove Photo">
                                <i class="fas fa-trash"></i>
                            </button>
                        <input type="file" id="profilePhotoInput" accept="image/*" style="display: none;">
                    </div>
                `;
                // Re-attach event listener
                const newPhotoInput = mainAvatar.querySelector('#profilePhotoInput');
                if (newPhotoInput) {
                    newPhotoInput.addEventListener('change', function(e) {
                        const file = e.target.files[0];
                        if (file) {
                            uploadProfilePhoto(file);
                        }
                    });
                }
                }
                togglePhotoButtons(true);
            } else {
                // Remove photo - show default icon
                mainAvatar.innerHTML = `
                    <i class="fas fa-user-circle"></i>
                    <div class="photo-upload-overlay">
                        <label for="profilePhotoInput" class="photo-upload-btn" title="Change Photo">
                            <i class="fas fa-camera"></i>
                        </label>
                        <button type="button" class="photo-remove-btn" onclick="removeProfilePhoto()" title="Remove Photo" style="display: none;">
                            <i class="fas fa-trash"></i>
                        </button>
                        <input type="file" id="profilePhotoInput" accept="image/*" style="display: none;">
                    </div>
                `;
                // Re-attach event listener
                const newPhotoInput = mainAvatar.querySelector('#profilePhotoInput');
                if (newPhotoInput) {
                    newPhotoInput.addEventListener('change', function(e) {
                        const file = e.target.files[0];
                        if (file) {
                            uploadProfilePhoto(file);
                        }
                    });
                }
                togglePhotoButtons(false);
            }
        }
        
        // Update sidebar photo
        const sidebarAvatar = document.querySelector('.user-avatar');
        if (sidebarAvatar) {
            if (filename) {
                const timestamp = new Date().getTime();
                const photoUrl = `uploads/profile_photos/${filename}?t=${timestamp}`;
            const sidebarPhoto = sidebarAvatar.querySelector('.profile-photo');
            if (sidebarPhoto) {
                sidebarPhoto.src = photoUrl;
            } else {
                // If no photo element exists, create one
                sidebarAvatar.innerHTML = `<img src="${photoUrl}" alt="Profile Photo" class="profile-photo">`;
                }
            } else {
                // Remove sidebar photo - show default icon
                sidebarAvatar.innerHTML = '<i class="fas fa-user-circle"></i>';
            }
        }
    }

    // Show/hide buttons based on photo presence
    function togglePhotoButtons(hasPhoto) {
        const uploadBtn = document.querySelector('.photo-upload-btn');
        const removeBtn = document.querySelector('.photo-remove-btn');
        
        if (hasPhoto) {
            // Show remove button, hide upload button
            if (uploadBtn) uploadBtn.style.display = 'none';
            if (removeBtn) removeBtn.style.display = 'flex';
        } else {
            // Show upload button, hide remove button
            if (uploadBtn) uploadBtn.style.display = 'flex';
            if (removeBtn) removeBtn.style.display = 'none';
        }
    }

    // Custom Confirmation Modal Functions
    function showConfirmation(title, message, onConfirm, onCancel = null) {
        const modal = document.getElementById('confirmationModal');
        const titleEl = document.getElementById('confirmationTitle');
        const messageEl = document.getElementById('confirmationMessage');
        const confirmBtn = document.getElementById('confirmationConfirmBtn');
        const cancelBtn = document.getElementById('confirmationCancelBtn');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        
        // Clear previous event listeners by cloning buttons
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        
        // Add event listeners to new buttons
        newConfirmBtn.addEventListener('click', function() {
            hideConfirmation();
            if (onConfirm) onConfirm();
        });
        
        newCancelBtn.addEventListener('click', function() {
            hideConfirmation();
            if (onCancel) onCancel();
        });
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    function hideConfirmation() {
        const modal = document.getElementById('confirmationModal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // Make hideConfirmation globally accessible
    window.hideConfirmation = hideConfirmation;
    
    // Close modal when clicking overlay
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('confirmation-overlay')) {
            hideConfirmation();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideConfirmation();
        }
    });
    
    // Fallback: Direct event listener for cancel button
    document.addEventListener('DOMContentLoaded', function() {
        const cancelBtn = document.getElementById('confirmationCancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                hideConfirmation();
            });
        }
    });

    // Make removeProfilePhoto globally accessible
    window.removeProfilePhoto = function() {
        showConfirmation(
            'Remove Profile Photo',
            'Are you sure you want to remove your profile photo? This action cannot be undone.',
            function() {
                // Proceed with removal
                removePhotoAction();
            }
        );
    }
    
    function removePhotoAction() {

        // Show loading state
        const avatar = document.querySelector('.profile-avatar-large');
        const originalContent = avatar.innerHTML;
        avatar.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        fetch('profile_action.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=remove_photo',
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update photos dynamically without page reload
                updateProfilePhotos(null);
                showNotification('success', 'Success', 'Profile photo removed successfully!');
            } else {
                showNotification('error', 'Error', data.message || 'Failed to remove photo');
                avatar.innerHTML = originalContent;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('error', 'Error', 'An unexpected error occurred');
            avatar.innerHTML = originalContent;
        });
    }

    // Profile photo upload function
    function uploadProfilePhoto(file) {
        const formData = new FormData();
        formData.append('action', 'upload_photo');
        formData.append('profile_photo', file);
        
        // Show loading state
        const avatar = document.querySelector('.profile-avatar-large');
        const originalContent = avatar.innerHTML;
        avatar.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        fetch('profile_action.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Clean up preview
                const preview = avatar.querySelector('.photo-preview');
                if (preview) preview.remove();
                
                // Update photos dynamically without page reload
                updateProfilePhotos(data.filename);
                // Reset file input so selecting the same file again triggers change
                const input = document.getElementById('profilePhotoInput');
                if (input) input.value = '';
                // Show success message
                showNotification('success', 'Success', 'Profile photo updated successfully!');
            } else {
                // Clean up preview on error
                const preview = avatar.querySelector('.photo-preview');
                if (preview) preview.remove();
                
                showNotification('error', 'Error', data.message || 'Failed to upload photo');
                avatar.innerHTML = originalContent;
                // Re-attach event listener lost after restoring HTML
                const input = document.getElementById('profilePhotoInput');
                if (input) {
                    input.value = '';
                    input.addEventListener('change', function(e) {
                        const file = e.target.files[0];
                        if (file) {
                            uploadProfilePhoto(file);
                        }
                    });
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Clean up preview on error
            const preview = avatar.querySelector('.photo-preview');
            if (preview) preview.remove();
            
            showNotification('error', 'Error', 'An unexpected error occurred');
            avatar.innerHTML = originalContent;
            // Re-attach listener and reset value after error
            const input = document.getElementById('profilePhotoInput');
            if (input) {
                input.value = '';
                input.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        uploadProfilePhoto(file);
                    }
                });
            }
        });
    }

    // Personal Information Form - DISABLED (handled by shared_profile.js)
    // This prevents conflicts with the centralized profile system
    const personalInfoForm = document.getElementById('personalInfoForm');
    if (personalInfoForm) {
        // Remove any existing event listeners to prevent conflicts
        const newForm = personalInfoForm.cloneNode(true);
        personalInfoForm.parentNode.replaceChild(newForm, personalInfoForm);
        console.log('Personal info form event listeners cleared to prevent conflicts with shared_profile.js');
    }

    // Change Password Form - handled exclusively by shared_profile.js
    // No-op here to avoid removing listeners attached by the shared module

    // Preferences Form - DISABLED (handled by shared_profile.js)
    // This prevents conflicts with the centralized profile system
    const preferencesForm = document.getElementById('preferencesForm');
    if (preferencesForm) {
        // Remove any existing event listeners to prevent conflicts
        const newForm = preferencesForm.cloneNode(true);
        preferencesForm.parentNode.replaceChild(newForm, preferencesForm);
        console.log('Preferences form event listeners cleared to prevent conflicts with shared_profile.js');
    }

    // Password toggle functionality
    window.togglePassword = function(inputId) {
        const input = document.getElementById(inputId);
        const icon = input.nextElementSibling.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    };

    // Password strength validation
    function validatePasswordStrength(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        return Object.values(requirements).every(req => req === true);
    }

    // Login activity removed in Security tab

    // Load preferences
    function loadPreferences() {
        // Only apply if the preferences form exists on this page/section
        if (!document.getElementById('preferencesForm')) {
            return;
        }
        fetch('profile_action.php?action=get_preferences', { credentials: 'same-origin' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return response.json();
                } else {
                    return response.text().then(text => {
                        throw new Error('Server returned non-JSON response: ' + text.substring(0, 200));
                    });
                }
            })
            .then(data => {
                if (data.success && data.preferences) {
                    const prefs = data.preferences;
                    const themeEl = document.getElementById('themePreference');
                    if (themeEl) themeEl.value = prefs.theme || 'light';
                    const refreshEl = document.getElementById('refreshRate');
                    if (refreshEl) refreshEl.value = prefs.refresh_rate || '10';
                    const showEl = document.getElementById('showNotifications');
                    if (showEl) showEl.checked = prefs.show_notifications !== false;
                    const emailEl = document.getElementById('emailNotifications');
                    if (emailEl) emailEl.checked = prefs.email_notifications !== false;
                    // Apply refresh rate when loading preferences (so dashboard respects user setting)
                    if (typeof applyDashboardRefreshRate === 'function') {
                    applyDashboardRefreshRate(prefs.refresh_rate || '10');
                    }
                    // Also apply theme once
                    applyThemePreference();
                }
            })
            .catch(error => {
                console.error('Error loading preferences:', error);
            });
    }

    // Update sidebar name
    function updateSidebarName() {
        const firstname = document.getElementById('profileFirstname').value;
        const lastname = document.getElementById('profileLastname').value;
        const middlename = document.getElementById('profileMiddlename').value;
        
        const middleInitial = middlename ? middlename.charAt(0).toUpperCase() + '.' : '';
        const fullName = `${lastname}, ${firstname} ${middleInitial}`.trim();
        
        document.querySelector('.user-name').textContent = fullName;
    }

    // Update sidebar photo
    function updateSidebarPhoto() {
        // This will be called when profile is updated
        // The photo will be updated when the page is refreshed or when photo is uploaded
    }

    // Apply theme preference
    function applyThemePreference() {
        const themeSelect = document.getElementById('themePreference');
        const theme = themeSelect ? themeSelect.value : (localStorage.getItem('adminTheme') || 'light');
        
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            const themeToggle = document.getElementById('themeToggle');
            const icon = themeToggle ? themeToggle.querySelector('i') : null;
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
            localStorage.setItem('adminTheme', 'dark');
        } else if (theme === 'light') {
            document.body.classList.remove('dark-mode');
            const themeToggle = document.getElementById('themeToggle');
            const icon = themeToggle ? themeToggle.querySelector('i') : null;
            if (icon) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
            localStorage.setItem('adminTheme', 'light');
        } else if (theme === 'auto') {
            // Auto theme based on system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.classList.add('dark-mode');
                const themeToggle = document.getElementById('themeToggle');
                const icon = themeToggle ? themeToggle.querySelector('i') : null;
                if (icon) {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                }
            } else {
                document.body.classList.remove('dark-mode');
                const themeToggle = document.getElementById('themeToggle');
                const icon = themeToggle ? themeToggle.querySelector('i') : null;
                if (icon) {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                }
            }
            localStorage.setItem('adminTheme', 'auto');
        }
    }

    // Expose for shared modules (real-time theme preview)
    if (typeof window !== 'undefined') {
        window.applyThemePreference = applyThemePreference;
    }

    // Initialize profile section when accessed
    document.querySelectorAll('.sidebar li').forEach(item => {
        if (item.getAttribute('data-section') === 'profile') {
            item.addEventListener('click', function() {
                setTimeout(() => {
                    loadPreferences();
                }, 100);
            });
        }
    });
}); 

// === Audit Logs (Admin) ===
(function initAuditLogs(){
  var currentPage = 1;
  var currentPageSize = 20;
  var currentSortBy = 'id';
  var currentSortDir = 'DESC';
  
  function renderTable(data, pagination){
    var wrapper = document.getElementById('auditTableWrapper');
    if (!wrapper) return;
    
    var rows = data || [];
    if (!Array.isArray(rows) || rows.length===0) {
      wrapper.innerHTML = '<div class="empty-state">No logs found.</div>';
      var paginationEl = document.getElementById('auditPagination');
      if (paginationEl) paginationEl.style.display = 'none';
      return;
    }
    
    var html = '<table style="min-width:800px;width:100%"><thead><tr>'+
      '<th class="sortable" data-sort="id">ID <span class="sort-arrow">' + (currentSortBy==='id' ? (currentSortDir==='ASC'?'▲':'▼') : '') + '</span></th>'+
      '<th class="sortable" data-sort="created_at">Time <span class="sort-arrow">' + (currentSortBy==='created_at' ? (currentSortDir==='ASC'?'▲':'▼') : '') + '</span></th>'+
      '<th class="sortable" data-sort="user_id">User <span class="sort-arrow">' + (currentSortBy==='user_id' ? (currentSortDir==='ASC'?'▲':'▼') : '') + '</span></th>'+
      '<th class="sortable" data-sort="action">Action <span class="sort-arrow">' + (currentSortBy==='action' ? (currentSortDir==='ASC'?'▲':'▼') : '') + '</span></th>'+
      '<th class="sortable" data-sort="entity_type">Entity <span class="sort-arrow">' + (currentSortBy==='entity_type' ? (currentSortDir==='ASC'?'▲':'▼') : '') + '</span></th>'+
      '<th class="sortable" data-sort="entity_id">Entity ID <span class="sort-arrow">' + (currentSortBy==='entity_id' ? (currentSortDir==='ASC'?'▲':'▼') : '') + '</span></th>'+
      '<th>IP</th></tr></thead><tbody>';
    rows.forEach(function(r){
      html += '<tr>'+
        '<td>'+ (r.id||'') +'</td>'+
        '<td>'+ (r.created_at||'') +'</td>'+
        '<td>'+ (r.user_id||'') +'</td>'+
        '<td>'+ (r.action||'') +'</td>'+
        '<td>'+ (r.entity_type||'') +'</td>'+
        '<td>'+ (r.entity_id||'') +'</td>'+
        '<td>'+ (r.ip||'') +'</td>'+
      '</tr>';
    });
    html += '</tbody></table>';
    wrapper.innerHTML = html;
    
    // Update pagination
    if (pagination) {
      var paginationEl = document.getElementById('auditPagination');
      var infoEl = document.getElementById('auditPaginationInfo');
      var prevBtn = document.getElementById('auditPrevPage');
      var nextBtn = document.getElementById('auditNextPage');
      
      if (paginationEl) paginationEl.style.display = 'flex';
      if (infoEl) infoEl.textContent = 'Showing page ' + pagination.page + ' of ' + pagination.totalPages + ' • Total ' + pagination.totalCount + ' logs';
      if (prevBtn) prevBtn.disabled = pagination.page <= 1;
      if (nextBtn) nextBtn.disabled = pagination.page >= pagination.totalPages;
    }
  }
  
  function fetchLogs(){
    var q = (document.getElementById('auditSearch')||{}).value||'';
    var action = (document.getElementById('auditAction')||{}).value||'';
    var uid = (document.getElementById('auditUserId')||{}).value||'';
    var from = (document.getElementById('auditFrom')||{}).value||'';
    var to = (document.getElementById('auditTo')||{}).value||'';
    var sortBy = (document.getElementById('auditSortBy')||{}).value||'id';
    var sortDir = (document.getElementById('auditSortDir')||{}).value||'DESC';
    var pageSize = (document.getElementById('auditPageSize')||{}).value||'20';
    
    currentSortBy = sortBy;
    currentSortDir = sortDir;
    currentPageSize = parseInt(pageSize);
    
    var params = new URLSearchParams();
    if (q) params.set('q', q);
    if (action) params.set('action', action);
    if (uid) params.set('user_id', uid);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    params.set('page', currentPage);
    params.set('pageSize', currentPageSize);
    params.set('sortBy', sortBy);
    params.set('sortDir', sortDir);
    
    fetch('audit_logs_ajax.php?'+params.toString(), { credentials:'same-origin' })
      .then(function(r){ return r.json(); })
      .then(function(res){ 
        if (res && res.success) {
          renderTable(res.data, res.pagination);
} else {
          renderTable([]);
          if (res && res.message) {
            showErrorToast(res.message);
          }
        }
      })
      .catch(function(error){ 
        renderTable([]);
        showErrorToast('Failed to load audit logs');
      });
  }

  function exportCsv(){
    var q = (document.getElementById('auditSearch')||{}).value||'';
    var action = (document.getElementById('auditAction')||{}).value||'';
    var uid = (document.getElementById('auditUserId')||{}).value||'';
    var from = (document.getElementById('auditFrom')||{}).value||'';
    var to = (document.getElementById('auditTo')||{}).value||'';
    var params = new URLSearchParams();
    if (q) params.set('q', q);
    if (action) params.set('action', action);
    if (uid) params.set('user_id', uid);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    window.open('audit_logs_export.php?'+params.toString(), '_blank');
  }

  function bind(){
    var refresh = document.getElementById('auditRefresh');
    var exportBtn = document.getElementById('auditExport');
    var prevBtn = document.getElementById('auditPrevPage');
    var nextBtn = document.getElementById('auditNextPage');
    
    if (refresh) refresh.onclick = function(){ currentPage = 1; fetchLogs(); };
    if (exportBtn) exportBtn.onclick = exportCsv;
    if (prevBtn) prevBtn.onclick = function(){ if (currentPage > 1) { currentPage--; fetchLogs(); } };
    if (nextBtn) nextBtn.onclick = function(){ currentPage++; fetchLogs(); };
    
    // Handle filter preset buttons
    document.querySelectorAll('.audit-filter-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        // Remove active class from all buttons
        document.querySelectorAll('.audit-filter-btn').forEach(function(b){ b.classList.remove('active'); });
        // Add active class to clicked button
        this.classList.add('active');
        
        var action = this.getAttribute('data-action');
        var date = this.getAttribute('data-date');
        
        // Clear other filters
        document.getElementById('auditSearch').value = '';
        document.getElementById('auditUserId').value = '';
        
        if (action) {
          document.getElementById('auditAction').value = action;
        } else {
          document.getElementById('auditAction').value = '';
        }
        
        if (date === 'today') {
          var today = new Date().toISOString().split('T')[0];
          document.getElementById('auditFrom').value = today;
          document.getElementById('auditTo').value = today;
        } else if (date === 'week') {
          var today = new Date();
          var weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          document.getElementById('auditFrom').value = weekAgo.toISOString().split('T')[0];
          document.getElementById('auditTo').value = today.toISOString().split('T')[0];
        } else {
          document.getElementById('auditFrom').value = '';
          document.getElementById('auditTo').value = '';
        }
        
        currentPage = 1;
        fetchLogs();
      });
    });
    
    // Auto-refresh on filter changes
    ['auditSearch','auditUserId','auditAction','auditFrom','auditTo'].forEach(function(id){
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', function(){ 
        // Clear active state from preset buttons when manually changing filters
        document.querySelectorAll('.audit-filter-btn').forEach(function(b){ b.classList.remove('active'); });
        currentPage = 1; 
        setTimeout(fetchLogs, 300); 
      });
    });
    
    // Handle sorting changes
    ['auditSortBy','auditSortDir','auditPageSize'].forEach(function(id){
      var el = document.getElementById(id);
      if (el) el.addEventListener('change', function(){ currentPage = 1; fetchLogs(); });
    });
    
    // Handle column header clicks for sorting
    document.addEventListener('click', function(e){
      var th = e.target.closest('th.sortable');
      if (th) {
        var sortBy = th.getAttribute('data-sort');
        if (sortBy) {
          if (currentSortBy === sortBy) {
            currentSortDir = currentSortDir === 'ASC' ? 'DESC' : 'ASC';
          } else {
            currentSortBy = sortBy;
            currentSortDir = 'ASC';
          }
          var sortByEl = document.getElementById('auditSortBy');
          var sortDirEl = document.getElementById('auditSortDir');
          if (sortByEl) sortByEl.value = currentSortBy;
          if (sortDirEl) sortDirEl.value = currentSortDir;
          currentPage = 1;
          fetchLogs();
        }
      }
    });
    
    var sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.addEventListener('click', function(e){
      var li = e.target.closest('li[data-section]');
      if (li && li.getAttribute('data-section') === 'audit') setTimeout(fetchLogs, 0);
    });
    // Auto-fetch when arriving via URL (?section=audit) or when audit section exists
    var qs = new URLSearchParams(window.location.search);
    if ((qs.get('section')||'') === 'audit' || document.getElementById('auditTableWrapper')) {
      setTimeout(fetchLogs, 0);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();

// === Generic Error Toast System ===
(function initErrorToast(){
  var toastContainer = null;
  
  function createToastContainer(){
    if (toastContainer) return toastContainer;
    
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 10000;
      display: flex; flex-direction: column; gap: 10px;
    `;
    document.body.appendChild(toastContainer);
    return toastContainer;
  }
  
  function showToast(message, type, duration){
    type = type || 'error';
    duration = duration || 5000;
    
    var container = createToastContainer();
    var toast = document.createElement('div');
    
    var colors = {
      error: { bg: '#dc3545', color: 'white' },
      success: { bg: '#28a745', color: 'white' },
      warning: { bg: '#ffc107', color: '#212529' },
      info: { bg: '#17a2b8', color: 'white' }
    };
    
    var color = colors[type] || colors.error;
    
    toast.style.cssText = `
      background: ${color.bg}; color: ${color.color}; padding: 12px 20px;
      border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 400px; word-wrap: break-word; position: relative;
      transform: translateX(100%); transition: transform 0.3s ease;
      font-size: 14px; line-height: 1.4;
    `;
    
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="flex: 1;">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: none; border: none; color: inherit; cursor: pointer; font-size: 18px; opacity: 0.7; padding: 0; margin-left: 10px;">×</button>
      </div>
    `;
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(function(){ toast.style.transform = 'translateX(0)'; }, 10);
    
    // Auto remove
    setTimeout(function(){
      if (toast.parentElement) {
        toast.style.transform = 'translateX(100%)';
        setTimeout(function(){ toast.remove(); }, 300);
      }
    }, duration);
  }
  
  // Global error handler for AJAX failures
  window.showErrorToast = function(message){
    showToast(message || 'An error occurred. Please try again.', 'error');
  };
  
  window.showSuccessToast = function(message){
    showToast(message, 'success', 3000);
  };
  
  window.showWarningToast = function(message){
    showToast(message, 'warning');
  };
  
  window.showInfoToast = function(message){
    showToast(message, 'info');
  };
  
  // Override fetch to catch network errors
  var originalFetch = window.fetch;
  window.fetch = function(){
    return originalFetch.apply(this, arguments).catch(function(error){
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showToast('Network error. Please check your connection.', 'error');
      }
      throw error;
    });
  };
})();

// === Idle Timeout Warning (Admin) ===
(function initIdleTimeout(){
  var idleTimeout = 25 * 60 * 1000; // 25 minutes
  var warningTimeout = 5 * 60 * 1000; // 5 minutes before timeout
  var warningShown = false;
  var warningModal = null;
  var lastActivity = Date.now();
  
  function resetTimer(){
    lastActivity = Date.now();
    warningShown = false;
    if (warningModal) {
      warningModal.remove();
      warningModal = null;
    }
  }
  
  function showWarning(){
    if (warningShown) return;
    warningShown = true;
    
    warningModal = document.createElement('div');
    warningModal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
      background: rgba(0,0,0,0.7); z-index: 9999; display: flex; 
      align-items: center; justify-content: center;
    `;
    
    warningModal.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        <h3 style="margin: 0 0 15px 0; color: #dc3545;">Session Timeout Warning</h3>
        <p style="margin: 0 0 20px 0; color: #666;">Your session will expire in 5 minutes due to inactivity.</p>
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #888;">Click "Stay Logged In" to continue or you'll be automatically logged out.</p>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button id="stayLoggedIn" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">Stay Logged In</button>
          <button id="logoutNow" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">Logout Now</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(warningModal);
    
    document.getElementById('stayLoggedIn').onclick = function(){
      resetTimer();
      // Send a ping to the server to refresh the session
      fetch('login_process.php', { method: 'POST', body: new FormData() }).catch(function(){});
    };
    
    document.getElementById('logoutNow').onclick = function(){
      window.location.href = 'logout.php';
    };
  }
  
  function checkIdle(){
    var now = Date.now();
    var timeSinceActivity = now - lastActivity;
    
    if (timeSinceActivity >= idleTimeout) {
      // Session expired, redirect to logout
      window.location.href = 'logout.php?reason=timeout';
    } else if (timeSinceActivity >= (idleTimeout - warningTimeout) && !warningShown) {
      showWarning();
    }
  }
  
  function bind(){
    // Track user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(function(event){
      document.addEventListener(event, resetTimer, true);
    });
    
    // Check every minute
    setInterval(checkIdle, 60000);
  }
  
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();

// Auto-initialize Coordinator Dashboard when DOM is loaded - moved to end of file

// Final safety: bind header controls even if earlier code aborted
(function forceBindHeaderControls(){
  function bind(){
    const settingsIcon = document.getElementById('settingsIcon');
    const settingsDropdown = document.getElementById('settingsDropdown');
    // Note: Theme toggle is now handled by the main function to avoid conflicts
    if (settingsIcon && settingsDropdown && !settingsIcon.__bound) {
      settingsIcon.__bound = true;
      settingsIcon.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        const cur = settingsDropdown.style.display || getComputedStyle(settingsDropdown).display;
        settingsDropdown.style.display = (cur === 'none') ? 'block' : 'none';
        console.log('Settings toggled ->', settingsDropdown.style.display);
      });
      document.addEventListener('click', function(e){
        if (!settingsDropdown.contains(e.target) && e.target !== settingsIcon) {
          settingsDropdown.style.display = 'none';
        }
      });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();

// ===== SIDEBAR MINIMIZE FUNCTIONALITY =====

// Global sidebar minimize/collapse function
window.toggleSidebarMinimize = function() {
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
  const mainContent = document.querySelector('.main-content, .student-main-content, #mainContent');
  if (mainContent) {
    if (isCollapsed) {
      mainContent.style.marginLeft = '70px';
    } else {
      mainContent.style.marginLeft = '250px';
    }
  }
};

// Restore sidebar state on page load
(function restoreSidebarState() {
  try {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') {
      const sidebar = document.querySelector('.sidebar');
      const mainContent = document.querySelector('.main-content, .student-main-content, #mainContent');
      if (sidebar) {
        sidebar.classList.add('collapsed');
        if (mainContent) {
          mainContent.style.marginLeft = '70px';
        }
      }
    }
  } catch (e) {
    console.warn('Could not restore sidebar state from localStorage');
  }
})();

// ===== COORDINATOR DASHBOARD SPECIFIC FUNCTIONS =====

// Initialize Coordinator Dashboard functionality
function initCoordinatorDashboard() {
  // If the Coordinator v2 script controls the dashboard, skip legacy init
  if (window.__CR_COORDINATOR_V2 === true) return;
  
  // Only initialize coordinator dashboard if coordinator-specific elements exist
  // Admins don't have these elements, so this prevents unnecessary API calls
  const sidebarNav = document.getElementById('coordinatorSidebarNav');
  if (!sidebarNav) {
    // Not a coordinator dashboard, skip initialization
    return;
  }
  
  // Initialize sidebar navigation
  if (sidebarNav) {
    sidebarNav.addEventListener('click', function(e) {
      const li = e.target.closest('li[data-section]');
      if (!li) return;
      // Remove active from all
      sidebarNav.querySelectorAll('li').forEach(item => item.classList.remove('active'));
      li.classList.add('active');
      activateCoordinatorSection(li.dataset.section);
      // Close sidebar on mobile
      if (window.innerWidth <= 900) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('open');
      }
    });
  }

  // Initialize settings dropdown (guard against double-binding)
  const settingsIcon = document.getElementById('settingsIcon');
  const settingsDropdown = document.getElementById('settingsDropdown');
  if (settingsIcon && settingsDropdown && !settingsIcon.__bound) {
    settingsIcon.__bound = true;
    settingsIcon.addEventListener('click', function(e) {
      e.stopPropagation();
      const currentDisplay = settingsDropdown.style.display || getComputedStyle(settingsDropdown).display;
      settingsDropdown.style.display = currentDisplay === 'block' ? 'none' : 'block';
    });
  }
  if (settingsDropdown && !window.__settingsOutsideCloseBound) {
    window.__settingsOutsideCloseBound = true;
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!settingsDropdown.contains(e.target) && e.target !== settingsIcon) {
        settingsDropdown.style.display = 'none';
      }
    });
    // Close dropdown when pressing Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        settingsDropdown.style.display = 'none';
      }
    });
  }

  // Initialize theme toggle
  initCoordinatorThemeToggle();

  // Initialize profile functionality
  initCoordinatorProfile();

  // Initialize course management functionality
  // Note: Courses are already initialized by the earlier self-executing block.
  // Guard against duplicate bindings by checking a flag.
  if (!window.__coordCoursesInitOnce) {
    window.__coordCoursesInitOnce = true;
    initCoordinatorCourses();
  }

  // Load dashboard data
  loadCoordinatorDashboardData();
}

// Activate Coordinator section
function activateCoordinatorSection(section) {
  console.log('🔄 Coordinator: Switching to section:', section);
  
  // Hide all sections using direct style manipulation
  document.querySelectorAll('.section-content').forEach(el => {
    el.classList.remove('active');
    el.style.display = 'none'; // Force hide
    console.log(`  - Coordinator: Hidden ${el.id}`);
  });
  
  // Show selected section using direct style manipulation
  const el = document.getElementById(section);
  if (el) {
    el.classList.add('active');
    el.style.display = 'block'; // Force show
    console.log(`✅ Coordinator: Section activated ${section}`);
  } else {
    console.error(`❌ Coordinator: Section not found ${section}`);
  }
}

// Theme toggle functionality for Coordinator Dashboard
// Note: This is now handled by the main theme toggle function to avoid conflicts
function initCoordinatorThemeToggle() {
  console.log('Coordinator theme toggle init - now handled by main function');
  // The main theme toggle function handles everything now
}

// Initialize Coordinator Course Management
function initCoordinatorCourses() {
  // Load courses when courses section is activated
  const coursesSection = document.getElementById('courses');
  if (coursesSection) {
    // Load courses initially
    if (typeof window.__coordLoadCourses === 'function') {
      window.__coordLoadCourses();
    } else {
      console.log('loadCourses function not available yet');
    }
    
    // Set up search functionality
    const searchInput = document.getElementById('courseSearch');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(window.__courseDeb);
        window.__courseDeb = setTimeout(() => {
          if (typeof window.__coordLoadCourses === 'function') {
            window.__coordLoadCourses();
          }
        }, 300);
      });
    }
    
    // Set up status filter
    const statusFilter = document.getElementById('courseStatusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => {
        if (typeof window.__coordLoadCourses === 'function') {
          window.__coordLoadCourses();
        }
      });
    }
    
    // Set up create course button
    const createBtn = document.getElementById('createCourseBtn');
    if (createBtn) {
      console.log('Create Course button found, setting up click handler');
      createBtn.onclick = function() {
        ensureCreateCourseModal();
      };
    } else {
      console.error('Create Course button NOT found!');
    }
    
    // Set up cancel button functionality
    const cancelBtn = document.getElementById('createCourseCancel');
    if (cancelBtn) {
      console.log('Cancel button found, setting up click handler');
      cancelBtn.onclick = function() {
        const modal = document.getElementById('createCourseModal');
        if (modal) modal.style.display = 'none';
      };
    } else {
      console.error('Cancel button NOT found!');
    }
  }
}

// Initialize Coordinator Profile functionality
function initCoordinatorProfile() {
  // Profile photo upload functionality - use the same implementation as admin
  const profilePhotoInput = document.getElementById('profilePhotoInput');
  if (profilePhotoInput) {
    profilePhotoInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        // Show preview before upload and validate
        if (showPhotoPreview(file)) {
          uploadProfilePhoto(file);
            } else {
          // Reset file input if validation failed
          e.target.value = '';
            }
      }
    });
  }

  // Profile form submissions (coordinator legacy hook) - DISABLED (handled by shared_profile.js)
  // This prevents conflicts with the centralized profile system
  const personalInfoForm = document.getElementById('personalInfoForm');
  if (personalInfoForm) {
    // Remove any existing event listeners to prevent conflicts
    const newForm = personalInfoForm.cloneNode(true);
    personalInfoForm.parentNode.replaceChild(newForm, personalInfoForm);
    console.log('Coordinator legacy personal info form event listeners cleared to prevent conflicts with shared_profile.js');
  }

  // Change Password Form - handled exclusively by shared_profile.js
  // Intentionally left blank to avoid interfering with shared handler

  // Preferences Form - DISABLED (handled by shared_profile.js)
  // This prevents conflicts with the centralized profile system
  const preferencesForm = document.getElementById('preferencesForm');
  if (preferencesForm) {
    // Remove any existing event listeners to prevent conflicts
    const newForm = preferencesForm.cloneNode(true);
    preferencesForm.parentNode.replaceChild(newForm, preferencesForm);
    console.log('Coordinator legacy preferences form event listeners cleared to prevent conflicts with shared_profile.js');
  }

  // Tab functionality (use coordinator-specific classes)
  const tabButtons = document.querySelectorAll('.coordinator-tab-btn');
  const tabContents = document.querySelectorAll('.coordinator-tab-content');

  if (tabButtons.length && tabContents.length) {
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        this.classList.add('active');
        const target = document.getElementById(tabName);
        if (target) target.classList.add('active');
      });
    });
  }

  // Password toggle functionality
  window.togglePassword = function(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.nextElementSibling.querySelector('i');
    if (!input || !toggle) return;
    if (input.type === 'password') {
      input.type = 'text';
      toggle.classList.remove('fa-eye');
      toggle.classList.add('fa-eye-slash');
    } else {
      input.type = 'password';
      toggle.classList.remove('fa-eye-slash');
      toggle.classList.add('fa-eye');
    }
  };
}

// Load Coordinator Dashboard data
function loadCoordinatorDashboardData() {
  // If the Coordinator v2 script controls the dashboard, skip legacy rendering
  if (window.__CR_COORDINATOR_V2 === true) return;
  
  // Only load coordinator data if user is actually a coordinator
  // Check if coordinator-specific elements exist (they won't exist for admins)
  const coordContainer = document.getElementById('coordRecentlyRegistered');
  if (!coordContainer) {
    // Not a coordinator dashboard, skip loading coordinator data
    return;
  }
  
  // Load dashboard stats
  fetch('coordinator_dashboard_counts.php', { credentials: 'same-origin' })
    .then(r => {
      if (!r.ok) {
        // If 403 or other error, don't try to parse JSON
        throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      }
      return r.json();
    })
    .then(data => {
      if (data.success) {
        const elements = {
          'coordTotalStudents': data.data.total_students || 0,
          'coordTotalTeachers': data.data.total_teachers || 0,
          'coordActiveCourses': data.data.active_courses || 0,
          'coordDraftCourses': data.data.draft_courses || 0,
          'coordMaterialsUploaded': data.data.materials_uploaded || 0
        };
        
        Object.keys(elements).forEach(id => {
          const element = document.getElementById(id);
          if (element) element.textContent = elements[id];
        });
      }
    })
    .catch(err => console.error('Failed to load dashboard stats:', err));

  // Load recently registered
  fetch('coordinator_recent_registrations.php', { credentials: 'same-origin' })
    .then(r => {
      if (!r.ok) {
        // If 403 or other error, don't try to parse JSON
        throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      }
      return r.json();
    })
    .then(data => {
      const container = document.getElementById('coordRecentlyRegistered');
      if (container) {
        if (data.success && data.data.length > 0) {
          container.innerHTML = data.data.map(user => `
            <div class="coordinator-activity-item">
              <div class="coordinator-activity-info">
                <div class="coordinator-activity-name">${user.name}</div>
                <div class="coordinator-activity-meta">${user.role} • ${user.created_at}</div>
              </div>
            </div>
          `).join('');
        } else {
          container.innerHTML = '<div class="coordinator-empty-state">No recent registrations</div>';
        }
      }
    })
    .catch(err => {
      console.error('Failed to load recent registrations:', err);
      const container = document.getElementById('coordRecentlyRegistered');
      if (container) container.innerHTML = '<div class="coordinator-empty-state">Failed to load</div>';
    });

  // Load recently login
  fetch('coordinator_recent_logins.php', { credentials: 'same-origin' })
    .then(r => {
      if (!r.ok) {
        // If 403 or other error, don't try to parse JSON
        throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      }
      return r.json();
    })
    .then(data => {
      const container = document.getElementById('coordRecentlyLogin');
      if (container) {
        if (data.success && data.data.length > 0) {
          container.innerHTML = data.data.map(user => `
            <div class="coordinator-activity-item">
              <div class="coordinator-activity-info">
                <div class="coordinator-activity-name">${user.name}</div>
                <div class="coordinator-activity-meta">${user.role} • ${user.last_login}</div>
              </div>
            </div>
          `).join('');
        } else {
          container.innerHTML = '<div class="coordinator-empty-state">No recent logins</div>';
        }
      }
    })
    .catch(err => {
      console.error('Failed to load recent logins:', err);
      const container = document.getElementById('coordRecentlyLogin');
      if (container) container.innerHTML = '<div class="coordinator-empty-state">Failed to load</div>';
    });
}

// Settings functionality
function initSettings() {
  const testSmtpBtn = document.getElementById('testSmtpBtn');
  const testJudge0Btn = document.getElementById('testJudge0Btn');
  
  // Load current configuration on page load
  loadCurrentConfig();
  
  if (testSmtpBtn) {
    testSmtpBtn.addEventListener('click', testSMTPConnection);
  }
  
  if (testJudge0Btn) {
    // Backward-compat: if legacy button exists, use JDoodle test instead
    testJudge0Btn.addEventListener('click', testJDoodleConnection);
  }
}

function loadCurrentConfig() {
  fetch('settings_ajax.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'action=get_config'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success && data.config) {
      const config = data.config;
      
      // Update SMTP details
      document.getElementById('smtpHost').textContent = config.smtp.host;
      document.getElementById('smtpPort').textContent = config.smtp.port;
      document.getElementById('smtpUsername').textContent = config.smtp.username || 'Not configured';
      
      // Update JDoodle details
      document.getElementById('jdoodleClientId').textContent = config.jdoodle.clientId;
      document.getElementById('jdoodleClientSecret').textContent = config.jdoodle.clientSecret;
      
      // Update database details
      document.getElementById('dbName').textContent = config.database.name || 'Not configured';
    }
  })
  .catch(error => {
    console.error('Failed to load configuration:', error);
  });
}

function testSMTPConnection() {
  const btn = document.getElementById('testSmtpBtn');
  const statusDiv = document.getElementById('smtpStatus');
  const indicator = statusDiv.querySelector('.status-indicator');
  const text = statusDiv.querySelector('span:last-child');
  
  // Update UI to show testing state
  btn.disabled = true;
  btn.textContent = 'Testing...';
  indicator.style.background = '#ffc107';
  text.textContent = 'Testing connection...';
  
  fetch('settings_ajax.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'action=test_smtp'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      indicator.style.background = '#28a745';
      text.textContent = 'Connection successful';
      if (data.details) {
        text.textContent += ` (${data.details.host}:${data.details.port})`;
      }
    } else {
      indicator.style.background = '#dc3545';
      text.textContent = data.message || 'Connection failed';
    }
  })
  .catch(error => {
    console.error('SMTP test error:', error);
    indicator.style.background = '#dc3545';
    text.textContent = 'Test failed - check console for details';
  })
  .finally(() => {
    btn.disabled = false;
    btn.textContent = 'Test Connection';
  });
}

function testJDoodleConnection() {
  const btn = document.getElementById('testJDoodleBtn');
  const statusDiv = document.getElementById('jdoodleStatus');
  const indicator = statusDiv.querySelector('.status-indicator');
  const text = statusDiv.querySelector('span:last-child');
  
  // Update UI to show testing state
  btn.disabled = true;
  btn.textContent = 'Testing...';
  indicator.style.background = '#ffc107';
  text.textContent = 'Testing connection...';
  
  fetch('settings_ajax.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'action=test_jdoodle'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      indicator.style.background = '#28a745';
      text.textContent = 'Connection successful';
      if (data.details) {
        text.textContent += ` (${data.details.languages_available} languages available)`;
      }
    } else {
      indicator.style.background = '#dc3545';
      text.textContent = data.message || 'Connection failed';
    }
  })
  .catch(error => {
    console.error('JDoodle test error:', error);
    indicator.style.background = '#dc3545';
    text.textContent = 'Test failed - check console for details';
  })
  .finally(() => {
    btn.disabled = false;
    btn.textContent = 'Test Connection';
    });
}

// Auto-initialize Coordinator Dashboard when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCoordinatorDashboard);
} else {
  initCoordinatorDashboard();
}

// Hide "Unauthorized" notifications/banners
(function hideUnauthorizedNotifications() {
  function hideUnauthorized() {
    // Hide elements containing "Unauthorized" text
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      if (el.textContent && el.textContent.trim() === 'Unauthorized') {
        el.style.display = 'none';
      }
    });
    
    // Hide .empty-state elements that contain "Unauthorized"
    const emptyStates = document.querySelectorAll('.empty-state');
    emptyStates.forEach(el => {
      if (el.textContent && el.textContent.includes('Unauthorized')) {
        el.style.display = 'none';
      }
    });
  }
  
  // Run immediately and on DOM ready
  hideUnauthorized();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideUnauthorized);
  } else {
    setTimeout(hideUnauthorized, 100);
  }
  
  // Also hide on any dynamic content updates
  const observer = new MutationObserver(hideUnauthorized);
  observer.observe(document.body, { childList: true, subtree: true });
})();

