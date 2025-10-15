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
  document.querySelectorAll('.topic-header').forEach(header => {
    header.addEventListener('click', () => toggleTopic(header.closest('.topic-item')));
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
  fetch('class_view_api.php?action=list_topics&id=' + encodeURIComponent(id), { credentials: 'same-origin' })
    .then(r => r.json())
    .then(res => {
      if (!res || !res.success) return;
      const modules = Array.isArray(res.modules) ? res.modules : [];
      const container = document.querySelector('.lesson-topics');
      if (!container) return;
      if (!modules.length) { container.innerHTML = ''; return; }
      
      // Generate HTML for all modules
      container.innerHTML = modules.map((module, moduleIdx) => {
        const moduleTitle = escapeHtml(module.title || 'Untitled Module');
        const lessons = Array.isArray(module.lessons) ? module.lessons : [];
        
        const lessonsHtml = lessons.map((lesson, lessonIdx) => {
          const title = escapeHtml(lesson.title || 'Untitled');
          const lessonNum = lessonIdx + 1;
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
                '<div class="activity-card">' +
                  '<div class="activity-left-border"></div>' +
                  '<div class="activity-content">' +
                    '<div class="activity-title">' + title + ' Activity</div>' +
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
                        '<div class="dropdown-item"><i class="fas fa-download"></i> Export</div>' +
                        '<div class="dropdown-item"><i class="fas fa-copy"></i> Copy link</div>' +
                        '<div class="dropdown-item"><i class="fas fa-play"></i> Try answering</div>' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
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
      
      // Rebind headers for expand/collapse and lazy load
      document.querySelectorAll('.topic-header').forEach(header => {
        header.addEventListener('click', () => toggleTopic(header.closest('.topic-item')));
      });
    }).catch(() => {});
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"]+/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
}

function toggleTopic(item) {
  if (!item) return;
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
    }
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
  if (!body) return;
  
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
      if (activities.length > 0) {
        activities.forEach((activity, i) => {
          const title = escapeHtml(activity.title || 'Activity');
          contentHtml += '<div class="activity-card">' +
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
                  '<div class="dropdown-item"><i class="fas fa-download"></i> Export</div>' +
                  '<div class="dropdown-item"><i class="fas fa-copy"></i> Copy link</div>' +
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
          '<a href="'+ url +'" target="_blank" style="text-decoration:none;background:#1d9b3e;color:#fff;border:none;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:600;">Open in new tab</a>'+
          (altUrl ? '<a href="'+ altUrl +'" target="_blank" style="text-decoration:none;background:#16a34a;color:#fff;border:none;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:600;">Try fallback</a>' : '')+
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
    const isPdf = lower.endsWith('.pdf');
    const isVideo = lower.endsWith('.mp4') || lower.endsWith('.webm');
    const isImage = lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif');
    const isOffice = /(\.pptx?|\.docx?|\.xlsx?)$/.test(lower);

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
    } else if (isOffice) {
      // Office files typically can't render inline locally; show friendly card with actions
      body.style.display = 'flex';
      body.style.alignItems = 'center';
      body.style.justifyContent = 'center';
      const card = document.createElement('div');
      card.style.cssText = 'background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;max-width:520px;width:92%;text-align:center;box-shadow:0 12px 30px rgba(0,0,0,0.08)';
      card.innerHTML = '<div style="font-size:42px;color:#1d9b3e;margin-bottom:10px;"><i class="fas fa-file-powerpoint"></i></div>'+
        '<div style="font-weight:700;color:#0f172a;margin-bottom:6px;">Preview not supported</div>'+
        '<div style="color:#64748b;margin-bottom:14px;">This file type cannot be previewed inline. Open or download instead.</div>'+
        '<div style="display:flex;gap:10px;justify-content:center;">'+
          '<a href="'+url+'" target="_blank" style="text-decoration:none;background:#1d9b3e;color:#fff;padding:8px 12px;border-radius:8px;font-weight:600;">Open in new tab</a>'+
          '<a href="'+url.replace(/([?&])view=true(&|$)/,'$1')+'" download style="text-decoration:none;background:#6b7280;color:#fff;padding:8px 12px;border-radius:8px;font-weight:600;">Download</a>'+
        '</div>';
      body.appendChild(card);
    } else {
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


