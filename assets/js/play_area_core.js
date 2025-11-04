(function(){
  if (!window.PlayArea) window.PlayArea = {};

  // Mark navigation intent into Play Area so loader shows only on click
  try {
    document.addEventListener('click', function(e){
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (/section=play-area/i.test(href)){
        try { sessionStorage.setItem('cr_play_entry_loader', '1'); } catch(_){ }
        // Show immediate overlay feedback while navigating into Play Area
        try {
          if (!document.querySelector('.play-preloader')){
            var pre = document.createElement('div');
            pre.className = 'play-preloader';
            pre.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(pre);
          }
        } catch(_){}
      }
    }, true);
  } catch(_) {}

  function hasInputStatements(code){
    var c = code || '';
    return /\bcin\s*>>/.test(c) || /Scanner\s*\(/.test(c) || /input\s*\(/.test(c) || /raw_input\s*\(/.test(c);
  }

  function extractPromptsAndInputs(code){
    var lines = (code || '').split(/\r?\n/);
    var prompts = [];
    for (var i = 0; i < lines.length; i++){
      if (/\bcin\s*>>/.test(lines[i])){
        for (var j = i - 1; j >= 0 && j >= i - 3; j--){
          var m = lines[j].match(/cout\s*<<\s*(?:"([\s\S]*?)"|'([^']*)')/);
          if (m){
            var text = (m[1] || m[2] || '').replace(/\\n/g,'').trim();
            if (text) prompts.push({ prompt: text });
            break;
          }
        }
        if (prompts.length === 0) prompts.push({ prompt: 'Enter value:' });
      }
    }
    return prompts;
  }

  function bindRunHandlers(cfg){
    var idPrefix = cfg.idPrefix;
    var runBtnId = idPrefix === 'play' ? 'playRunBtn' : (cfg.runBtnId || 'stuPlayRunBtn');
    var langId   = cfg.languageId || (idPrefix === 'play' ? 'playLanguage' : 'stuPlayLanguage');
    var sourceId = cfg.sourceId || (idPrefix === 'play' ? 'playSource' : 'stuPlaySource');

    // Prevent duplicate bindings per runBtnId
    window.__PLAY_AREA_BOUND__ = window.__PLAY_AREA_BOUND__ || {};
    if (window.__PLAY_AREA_BOUND__[runBtnId]) {
      return; // already bound
    }
    window.__PLAY_AREA_BOUND__[runBtnId] = true;

    function getCode(){
      var code = '';
      if (cfg.enableMonaco && window.playMonacoEditor){
        code = window.playMonacoEditor.getValue();
      } else {
        var src = document.getElementById(sourceId);
        code = src ? src.value : '';
      }
      return code || '';
    }

    function run(){
      // Clear stale input value before a fresh run
      if (!cfg.reuseInput) { try { window.playAreaTerminalInputValue = window.playAreaTerminalInputValue || ''; } catch(_) {} }
      var code = getCode();
      var langSel = document.getElementById(langId);
      var language = langSel ? (langSel.value || 'cpp') : 'cpp';
      if (!code.trim()) return;

      var needs = hasInputStatements(code);
      var prompts = needs && language === 'cpp' ? extractPromptsAndInputs(code) : [];

      var stdin = window.playAreaTerminalInputValue || '';
      if (needs && !stdin.trim() && window.PlayArea && typeof window.PlayArea.openTerminal === 'function'){
        window.PlayArea.openTerminal(true, prompts);
        return;
      }

      if (window.PlayArea && typeof window.PlayArea.openTerminal === 'function'){
        window.PlayArea.openTerminal(false, prompts);
      }
      var terminalBody = document.getElementById(window.playTerminalBodyId || 'playTerminalBody');
      if (terminalBody) terminalBody.textContent = 'Executing...';

      var fd = new FormData();
      fd.append('action','run_snippet');
      fd.append('language', language);
      fd.append('source', code);
      fd.append('stdin', stdin || '');

      function send(body, token){
        var opts = { method:'POST', credentials:'same-origin', body: body };
        if (token) {
          try { opts.headers = { 'X-CSRF-Token': token }; } catch(_) {}
        }
        return fetch('course_outline_manage.php', opts)
          .then(function(r){ return r.json().catch(function(){ return {}; }); });
      }

      function getToken(){
        if (typeof window.getCSRFToken === 'function') {
          return window.getCSRFToken();
        }
        try {
          var tfd = new FormData(); tfd.append('action','get_csrf_token');
          return fetch('course_outline_manage.php', { method:'POST', credentials:'same-origin', body: tfd })
            .then(function(r){ return r.ok ? r.json() : Promise.reject(); })
            .then(function(j){ return (j && (j.csrf_token || j.token)) ? (j.csrf_token || j.token) : null; })
            .catch(function(){ return null; });
        } catch(_) { return Promise.resolve(null); }
      }

      getToken().then(function(tok){
        if (tok) { try { fd.append('csrf_token', tok); fd.append('csrf', tok); fd.append('token', tok); } catch(_) {} }
        return send(fd, tok);
      })
        .then(function(d){
          var text = '';
          if (d && d.success && d.results){
            try {
              var res = Array.isArray(d.results) ? d.results : [d.results];
              text = res.map(function(x){ var inner = (x.data ? x.data : x) || {}; return [inner.output || inner.stdout || '', inner.stderr || inner.cmpinfo || ''].filter(Boolean).join('\n'); }).join('\n');
            } catch(_){ text = JSON.stringify(d.results || d); }
          } else {
            text = (d && d.message) ? ('Error: ' + d.message) : 'Run failed';
          }
          text = (text || '').trim();
          var tb = document.getElementById(window.playTerminalBodyId || 'playTerminalBody');
          if (tb){
            var lines = [];
            var promptText = (window.playTerminalPromptText || 'Enter value:');
            if (stdin && stdin.trim()) lines.push(promptText + ' ' + stdin);
            if (text) { lines.push(text); lines.push('>>> Program Terminated'); }
            else { lines.push('(no output)'); lines.push('>>> Program Terminated'); }
            tb.textContent = lines.join('\n');
          }
          window.playAreaTerminalInputValue = '';
        })
        .catch(function(err){
          var tb = document.getElementById(window.playTerminalBodyId || 'playTerminalBody');
          if (tb) tb.textContent = 'Network error: ' + (err && err.message ? err.message : err);
        });
    }

    // Button
    document.addEventListener('click', function(e){
      var el = e.target.closest('#' + runBtnId);
      if (!el) return;
      e.preventDefault();
      run();
    }, true);

    // Keyboard shortcut
    document.addEventListener('keydown', function(e){
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter'){
        var btn = document.getElementById(runBtnId);
        if (btn) btn.click();
      }
    });

    // Alias re-run used by modal Enter
    var alias = document.getElementById('playRunBtn');
    if (!alias){
      var hiddenBtn = document.createElement('button');
      hiddenBtn.id = 'playRunBtn';
      hiddenBtn.style.display = 'none';
      document.body.appendChild(hiddenBtn);
      hiddenBtn.addEventListener('click', run);
    }
  }

  window.PlayArea.init = function(cfg){
    cfg = cfg || {}; cfg.idPrefix = cfg.idPrefix || 'play';
    // Sync theme with site preference on load
    try {
      var siteDark = document.body.classList.contains('dark') ||
                     document.body.classList.contains('dark-theme') ||
                     document.body.getAttribute('data-theme') === 'dark' ||
                     document.body.classList.contains('dark-mode') ||
                     (function(){ try { return (localStorage.getItem('theme')||'').toLowerCase()==='dark'; } catch(_){ return false; } })();
      if (siteDark && !document.body.classList.contains('dark-mode')){
        document.body.classList.add('dark-mode');
      }
      var isDarkInit = document.body.classList.contains('dark-mode');
      try { document.dispatchEvent(new CustomEvent('playarea-theme-changed', { detail: { dark: isDarkInit } })); } catch(_) {}
    } catch(_) {}
    // Wire templates/save/recent for this prefix
    try {
      var prefix = cfg.idPrefix;
      var key = 'cr_play_snippets_' + prefix;
      var templates = {
        cpp: '#include <iostream>\nusing namespace std;\n\nint main(){\n  cout << "Hello, CodeRegal!" << endl;\n  return 0;\n}\n',
        java: 'import java.util.*;\npublic class Main {\n  public static void main(String[] args){\n    System.out.println("Hello, CodeRegal!");\n  }\n}\n',
        python3: 'print("Hello, CodeRegal!")\n'
      };

      var langId = cfg.languageId || (prefix === 'play' ? 'playLanguage' : 'stuPlayLanguage');
      var sourceId = cfg.sourceId || (prefix === 'play' ? 'playSource' : 'stuPlaySource');

      function downloadSnippet(){
        try{
          var code = '';
          if (cfg.enableMonaco && window.playMonacoEditor){
            code = window.playMonacoEditor.getValue();
          } else {
            code = (document.getElementById(sourceId) || { value: '' }).value || '';
          }
          var langSel = document.getElementById(langId);
          var lang = langSel ? (langSel.value || 'cpp') : 'cpp';
          if (!code.trim()) return;
          var filename = (lang === 'cpp') ? 'main.cpp' : (lang === 'java' ? 'Main.java' : 'main.py');
          var blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a'); a.href = url; a.download = filename;
          document.body.appendChild(a); a.click();
          setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 100);
        } catch(_) {}
      }

      function loadRecentSnippets(){
        try{
          var sel = document.getElementById(prefix + 'RecentSelect');
          if (!sel) return;
          var raw = localStorage.getItem(key); var list = raw ? JSON.parse(raw) : [];
          sel.innerHTML = '<option value="">Recent snippets…</option>' + list.map(function(s, idx){
            var d = new Date(s.ts || Date.now());
            var label = (s.lang || 'cpp').toUpperCase() + ' • ' + d.toLocaleString();
            return '<option value="' + idx + '">' + label + '</option>';
          }).join('');
        } catch(_) {}
      }

      function loadSelectedSnippet(){
        try{
          var sel = document.getElementById(prefix + 'RecentSelect');
          var idx = sel ? parseInt(sel.value,10) : -1;
          if (isNaN(idx) || idx < 0) return;
          var raw = localStorage.getItem(key); var list = raw ? JSON.parse(raw) : [];
          var s = list[idx]; if (!s) return;
          var langSel = document.getElementById(langId);
          if (langSel && s.lang) langSel.value = s.lang;
          var src = document.getElementById(sourceId); if (src) src.value = s.code || '';
          sel.selectedIndex = 0;
        } catch(_) {}
      }

      // Bind buttons (if present) with one-time guard per prefix
      window.__PLAY_AREA_UI_BOUND__ = window.__PLAY_AREA_UI_BOUND__ || {};
      if (!window.__PLAY_AREA_UI_BOUND__[prefix]){
        window.__PLAY_AREA_UI_BOUND__[prefix] = true;
        document.addEventListener('click', function(e){
        var tBtn = e.target.closest('#' + prefix + 'TemplateBtn');
        if (tBtn){
          var lang = (document.getElementById(langId) || { value: 'cpp' }).value || 'cpp';
          var src = document.getElementById(sourceId); if (src) src.value = templates[lang] || templates.cpp;
          return;
        }
        var sBtn = e.target.closest('#' + prefix + 'SaveBtn');
        if (sBtn){ downloadSnippet(); return; }
        }, true);
      }

      // Remove recent snippets feature; save now downloads code
      document.addEventListener('change', function(e){ /* noop */ }, true);
    } catch(_) {}

    bindRunHandlers(cfg);

    // Optional fullscreen on init
    try {
      // Show a brief preloader only if user navigated here via Play Area link
      (function(){
        try {
          var shouldShow = false;
          try { shouldShow = sessionStorage.getItem('cr_play_entry_loader') === '1'; } catch(_){ shouldShow = false; }
          if (!shouldShow) return;
          try { sessionStorage.removeItem('cr_play_entry_loader'); } catch(_){}
          var pre = document.createElement('div');
          pre.className = 'play-preloader';
          pre.innerHTML = '<div class="spinner"></div>';
          document.body.appendChild(pre);
          setTimeout(function(){ try { pre.remove(); } catch(_){} }, 1000);
        } catch(_){}
      })();

      if (cfg.autoFullscreen) {
        var card = document.querySelector('.play-card');
        if (card && !card.classList.contains('fullscreen')) {
          card.classList.add('fullscreen');
          // add exit button
          var exitBtn = document.createElement('button');
          exitBtn.className = 'play-fullscreen-exit';
          exitBtn.textContent = 'Exit Fullscreen';
          exitBtn.addEventListener('click', function(){ card.classList.remove('fullscreen'); exitBtn.remove(); });
          card.appendChild(exitBtn);
          // header with back + dark mode
          var header = document.createElement('div');
          header.className = 'play-fullscreen-header';
          // Build robust back URL (strip ?section=play-area; normalize dashboard path)
          var backUrl = (function(){
            try {
              var u = new URL(window.location.href);
              if (u.searchParams.has('section')) u.searchParams.delete('section');
              var p = u.pathname || '';
              if (p.indexOf('student_dashboard.php') !== -1) u.pathname = p.substring(0, p.lastIndexOf('/') + 1) + 'student_dashboard.php';
              if (p.indexOf('teacher_dashboard.php') !== -1) u.pathname = p.substring(0, p.lastIndexOf('/') + 1) + 'teacher_dashboard.php';
              return u.toString();
            } catch(_){
              return (window.location.href.indexOf('student_') !== -1 ? 'student_dashboard.php' : 'teacher_dashboard.php');
            }
          })();
          header.innerHTML = '<a href="' + backUrl + '" class="back-link">\u2190 Back to main page</a>' +
                              '<button class="theme-btn" id="playDarkModeToggle"><i class="fas fa-moon"></i></button>';
          card.insertBefore(header, card.firstChild);
          // Hard navigate for back link to avoid any global preventDefault
          var back = header.querySelector('.back-link');
          if (back){
            try { back.setAttribute('onclick', "event.preventDefault();event.stopPropagation();window.location.assign(this.getAttribute('href'));return false;"); } catch(_){ }
            back.addEventListener('click', function(ev){
              ev.preventDefault(); ev.stopPropagation();
              var href = back.getAttribute('href');
              try { window.location.assign(href); } catch(_) { window.location.href = href; }
            }, true);
            back.addEventListener('auxclick', function(ev){ // middle click fallback
              ev.preventDefault(); ev.stopPropagation();
              var href = back.getAttribute('href');
              try { window.location.assign(href); } catch(_) { window.location.href = href; }
            }, true);
            back.addEventListener('pointerdown', function(ev){ // some extensions cancel click; act early
              if (ev.button !== 0) return; // left button
              ev.preventDefault(); ev.stopPropagation();
              var href = back.getAttribute('href');
              try { window.location.assign(href); } catch(_) { window.location.href = href; }
            }, true);
            back.addEventListener('keydown', function(ev){
              if (ev.key !== 'Enter') return; ev.preventDefault(); ev.stopPropagation();
              var href = back.getAttribute('href');
              try { window.location.assign(href); } catch(_) { window.location.href = href; }
            }, true);
          }

          // Global safety: capture clicks anywhere on the back link and force navigation
          document.addEventListener('click', function(ev){
            var a = ev.target && ev.target.closest ? ev.target.closest('.play-fullscreen-header .back-link') : null;
            if (!a) return;
            ev.preventDefault(); ev.stopPropagation();
            var href = a.getAttribute('href');
            try { window.location.assign(href); } catch(_) { window.location.href = href; }
          }, true);
          document.addEventListener('pointerdown', function(ev){
            var a = ev.target && ev.target.closest ? ev.target.closest('.play-fullscreen-header .back-link') : null;
            if (!a) return;
            ev.preventDefault(); ev.stopPropagation();
            var href = a.getAttribute('href');
            try { window.location.assign(href); } catch(_) { window.location.href = href; }
          }, true);
          var toggle = header.querySelector('#playDarkModeToggle');
          if (toggle) {
            toggle.addEventListener('click', function(){
              document.body.classList.toggle('dark-mode');
              var isDark = document.body.classList.contains('dark-mode');
              try { document.dispatchEvent(new CustomEvent('playarea-theme-changed', { detail: { dark: isDark } })); } catch(_) {}
            });
          }
          // ESC to exit
          document.addEventListener('keydown', function escHandler(e){
            if (e.key === 'Escape') { card.classList.remove('fullscreen'); if (exitBtn) exitBtn.remove(); document.removeEventListener('keydown', escHandler); }
          });
        }
      }
    } catch(_) {}
  };
})();


