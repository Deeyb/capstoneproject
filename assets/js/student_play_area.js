(function(){
  // If shared core is available, delegate and exit to avoid duplicate bindings
  try {
    if (window.PlayArea && typeof window.PlayArea.init === 'function') {
      if (!window.__PLAY_AREA_STUDENT_INIT__) {
        window.__PLAY_AREA_STUDENT_INIT__ = true;
        // Provide CSRF helper for student side (used by play_area_core)
        if (typeof window.getCSRFToken !== 'function') {
          window.getCSRFToken = function(){
            try {
              var fd = new FormData(); fd.append('action','get_csrf_token');
              return fetch('course_outline_manage.php', { method:'POST', credentials:'same-origin', body: fd })
                .then(function(r){ return r.ok ? r.json() : Promise.reject(); })
                .then(function(j){ return (j && (j.csrf_token || j.token)) ? (j.csrf_token || j.token) : null; })
                .catch(function(){ return null; });
            } catch(_) { return Promise.resolve(null); }
          };
        }
        window.PlayArea.init({ idPrefix: 'stuPlay', enableMonaco: false, languageId: 'stuPlayLanguage', sourceId: 'stuPlaySource' });
      }
      return; // Stop; shared core will manage everything
    }
  } catch(_) {}
})();
(function(){ /* Student-specific Play Area code is now fully delegated to shared core. */ })();




