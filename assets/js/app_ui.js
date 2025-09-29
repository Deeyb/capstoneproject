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
