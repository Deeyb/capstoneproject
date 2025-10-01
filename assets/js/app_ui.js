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
