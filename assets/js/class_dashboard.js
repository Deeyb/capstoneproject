document.addEventListener('DOMContentLoaded', () => {
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
      if (tab === 'submissions') {
        loadSubmissions();
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

  // Topic toggles
  document.querySelectorAll('.topic-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const icon = toggle;
      const isExpanded = icon.classList.contains('expanded');
      
      if (isExpanded) {
        icon.classList.remove('expanded');
        icon.style.transform = 'rotate(0deg)';
      } else {
        icon.classList.add('expanded');
        icon.style.transform = 'rotate(180deg)';
      }
    });
  });

  // Action buttons
  const click = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
  click('createActivityBtn', () => (window.showInfo ? window.showInfo('Coming Soon','Create Activity functionality coming soon!') : alert('Create Activity functionality coming soon!')));
  click('menuBtn', () => (window.showInfo ? window.showInfo('Coming Soon','Menu options coming soon!') : alert('Menu options coming soon!')));
  click('startLessonBtn', () => switchToTab('lessons'));
  click('openGradesBtn', () => switchToTab('grades'));
  click('reviewDraftsBtn', () => switchToTab('lessons'));

  // fetch class details and populate header
  loadDetails();
  loadOverview();
  
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
      
      // Update class name in top navigation (main display)
      const codeEl = document.getElementById('courseCode');
      if (codeEl) {
        // Show "Introduction to Computer Programming" as the main title
        codeEl.textContent = 'Introduction to Computer Programming';
      }
      
      // Update lesson title with module name (secondary display)
      const lessonTitle = document.querySelector('.lesson-main-title');
      if (lessonTitle) {
        lessonTitle.textContent = 'Introduction to Computer Programming';
      }
      
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


