// Shared UI script used by all roles.
// Load the main implementation and then initialize role-agnostic pieces.
document.write('<script src="assets/js/admin_panel.js"></' + 'script>');

(function initSharedAfterLoad(){
  function bind() {
    // If available, initialize shared profile logic (works for Coordinator and Teacher)
    if (typeof initCoordinatorProfile === 'function') {
      try { initCoordinatorProfile(); } catch(e) { console.error('Profile init failed:', e); }
    }
    // Initialize theme toggle if defined
    if (typeof initCoordinatorThemeToggle === 'function') {
      try { initCoordinatorThemeToggle(); } catch(e) { /* optional */ }
    }
    // Safety: ensure header controls (dark mode + settings dropdown) are bound for all roles
    try {
      var themeToggle = document.getElementById('themeToggle');
      var settingsIcon = document.getElementById('settingsIcon');
      var settingsDropdown = document.getElementById('settingsDropdown');
      // Apply saved theme on all roles (robust)
      try {
        var savedTheme = localStorage.getItem('theme') || localStorage.getItem('adminTheme') || 'light';
        var wantDark = (savedTheme === 'dark');
        document.body.classList[wantDark ? 'add' : 'remove']('dark-mode');
        var iconEl = themeToggle && (themeToggle.tagName === 'I' ? themeToggle : (themeToggle.querySelector && themeToggle.querySelector('i')));
        if (iconEl) {
          if (wantDark) { iconEl.classList.remove('fa-moon'); iconEl.classList.add('fa-sun'); }
          else { iconEl.classList.remove('fa-sun'); iconEl.classList.add('fa-moon'); }
        }
      } catch(_) {}
      // Dark mode toggle
      if (themeToggle && !themeToggle.__bound) {
        themeToggle.__bound = true;
        themeToggle.addEventListener('click', function(e){
          e.preventDefault(); e.stopPropagation();
          document.body.classList.toggle('dark-mode');
          var isDark = document.body.classList.contains('dark-mode');
          // Handle icon either self or child
          var icon = (this.tagName === 'I') ? this : this.querySelector && this.querySelector('i');
          if (icon) {
            if (isDark) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
            else { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
          }
          try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch(_){}
        });
      }
      // Delegated fallback (ensures teacher header also works even if element injected late)
      if (!window.__themeDelegationBound) {
        window.__themeDelegationBound = true;
        document.addEventListener('click', function(ev){
          var t = ev.target;
          if (!t) return;
          var isToggle = (t.id === 'themeToggle') || (t.closest && t.closest('#themeToggle'));
          if (isToggle) {
            ev.preventDefault(); ev.stopPropagation();
            // Mirror the same logic as direct binding
            document.body.classList.toggle('dark-mode');
            var isDark = document.body.classList.contains('dark-mode');
            var el = document.getElementById('themeToggle');
            var icon = el && (el.tagName === 'I' ? el : (el.querySelector && el.querySelector('i')));
            if (icon) {
              if (isDark) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
              else { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
            }
            try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch(_){}
          }
        }, true);
      }
      // Settings dropdown
      if (settingsIcon && settingsDropdown && !settingsIcon.__bound) {
        settingsIcon.__bound = true;
        settingsIcon.addEventListener('click', function(e){
          e.preventDefault(); e.stopPropagation();
          var cur = settingsDropdown.style.display || getComputedStyle(settingsDropdown).display;
          settingsDropdown.style.display = (cur === 'none') ? 'block' : 'none';
        });
        document.addEventListener('click', function(e){
          if (!settingsDropdown.contains(e.target) && e.target !== settingsIcon) {
            settingsDropdown.style.display = 'none';
          }
        });
      }
    } catch(_) {}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();

// Global fetch wrapper to ensure CSRF token is appended to POSTs
(function installGlobalCsrfFetchWrapper(){
  try {
    if (window.__crCsrfFetchWrapperInstalled) return; window.__crCsrfFetchWrapperInstalled = true;
    var originalFetch = window.fetch;
    // Helper to get token if coordinator.js provided it
    async function ensureCsrfOnFormData(fd) {
      try {
        if (!fd || typeof fd.has !== 'function') return fd;
        if (fd.has('csrf_token')) return fd;
        if (typeof window.getCSRFToken === 'function') {
          var token = await window.getCSRFToken();
          if (token) { try { fd.append('csrf_token', token); } catch(_){} }
        }
      } catch(_) {}
      return fd;
    }
    window.fetch = async function(input, init){
      try {
        var url = (typeof input === 'string') ? input : ((input && input.url) || '');
        var isPost = init && (String(init.method||'').toUpperCase() === 'POST');
        var targetsCsrf = url.indexOf('course_outline_manage.php') !== -1 || url.indexOf('submissions_api.php') !== -1;
        if (isPost && targetsCsrf && init.body && (typeof FormData !== 'undefined') && (init.body instanceof FormData)) {
          try {
            // If this is the CSRF token fetch itself, bypass wrapper to avoid recursion
            var act = init.body.get && init.body.get('action');
            if (act && String(act) === 'get_csrf_token') {
              // Call the original fetch directly with same args
              if (!init.credentials) init.credentials = 'same-origin';
              return originalFetch.apply(this, arguments);
            }
          } catch(_) {}
          init.body = await ensureCsrfOnFormData(init.body);
          if (!init.credentials) init.credentials = 'same-origin';
        }
      } catch(_) {}
      return originalFetch.apply(this, arguments);
    };
  } catch(_) { /* no-op */ }
})();

// Optional: lightweight CodeMirror loader for enhanced code editing
window.enableCodeEditor = function(textarea){
  try {
    if (!textarea || textarea.__cm) return textarea;
    if (!window.CodeMirror) {
      var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/lib/codemirror.css'; document.head.appendChild(css);
      var s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/lib/codemirror.js';
      s.onload = function(){
        // Load modes after core is present
        var modeList = ['https://cdn.jsdelivr.net/npm/codemirror@5.65.16/mode/clike/clike.js', 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/mode/python/python.js'];
        var idx = 0; var loadNext = function(){
          if (idx >= modeList.length) { window.enableCodeEditor(textarea); return; }
          var m = document.createElement('script'); m.src = modeList[idx++]; m.onload = loadNext; document.head.appendChild(m);
        };
        loadNext();
      };
      document.head.appendChild(s);
      return textarea;
    }
    var cm = window.CodeMirror.fromTextArea(textarea, { lineNumbers:true, matchBrackets:true, tabSize:2, indentUnit:2 });
    textarea.__cm = cm;
    return cm.getTextArea();
  } catch(_) { return textarea; }
};
