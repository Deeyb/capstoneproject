(function(){
  if (!window.PlayArea) window.PlayArea = {};

  var monacoLoaded = false;
  var editorInstance = null;

  function loadMonaco(){
    if (monacoLoaded && window.monaco) return Promise.resolve();
    if (monacoLoaded) return Promise.resolve();
    return new Promise(function(resolve, reject){
      window.MonacoEnvironment = {
        getWorkerUrl: function(moduleId, label){
          var path = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs';
          var workers = { json:'language/json/json.worker.js', css:'language/css/css.worker.js', html:'language/html/html.worker.js', ts:'language/typescript/ts.worker.js', cpp:'language/cpp/cpp.worker.js', java:'language/java/java.worker.js', python:'language/python/python.worker.js', default:'editor/editor.worker.js' };
          var file = workers[label] || workers.default; return path + '/' + file;
        },
        getWorker: function(workerId, label){
          var path = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs';
          var workers = { json:'language/json/json.worker.js', css:'language/css/css.worker.js', html:'language/html/html.worker.js', ts:'language/typescript/ts.worker.js', cpp:'language/cpp/cpp.worker.js', java:'language/java/java.worker.js', python:'language/python/python.worker.js', default:'editor/editor.worker.js' };
          var file = workers[label] || workers.default; try { return new Worker(path + '/' + file, { type:'module' }); } catch(e) { return null; }
        }
      };

      if (!document.querySelector('link[href*="monaco-editor"]')){
        var link = document.createElement('link'); link.rel='stylesheet';
        link.href='https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs/editor/editor.main.min.css';
        document.head.appendChild(link);
      }

      function done(){ monacoLoaded = true; resolve(); }
      if (!window.require){
        var s=document.createElement('script');
        s.src='https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs/loader.min.js';
        s.onload=function(){
          window.require.config({ paths:{ vs:'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs' }});
          window.require(['vs/editor/editor.main'], done);
        }; s.onerror=reject; document.head.appendChild(s);
      } else { window.require(['vs/editor/editor.main'], done); }
    });
  }

  window.PlayArea.initMonaco = function(opts){
    opts = opts || {}; var editorId = opts.editorId; var textareaId = opts.textareaId; var languageSelectId = opts.languageSelectId;
    var container = document.getElementById(editorId);
    var textarea = document.getElementById(textareaId);
    if (!container) return;
    loadMonaco().then(function(){
      if (editorInstance) editorInstance.dispose();
      var langSel = document.getElementById(languageSelectId);
      var lang = langSel ? (langSel.value || 'cpp') : 'cpp';
      var langMap = { cpp:'cpp', java:'java', python3:'python' };
      var monacoLang = langMap[lang] || 'cpp';
      var initial = textarea ? textarea.value : '';
      var templates = {
        cpp: '#include <iostream>\nusing namespace std;\n\nint main(){\n  cout << "Hello, World!" << endl;\n  return 0;\n}\n',
        java: 'public class Main {\n  public static void main(String[] args){\n    System.out.println("Hello, World!");\n  }\n}\n',
        python3: 'print("Hello, World!")\n'
      };
      function updateFilename(langValue){
        var ext = (langValue === 'cpp') ? 'main.cpp' : (langValue === 'java' ? 'Main.java' : 'main.py');
        try {
          var nameEls = document.querySelectorAll('.play-file-name');
          nameEls.forEach(function(el){ el.textContent = ext; });
        } catch(_) {}
      }
      function applyTemplateFor(langValue){
        var tpl = templates[langValue] || templates.cpp;
        if (editorInstance) { editorInstance.setValue(tpl); }
        if (textarea) textarea.value = tpl;
        updateFilename(langValue);
      }
      if (!initial) {
        initial = templates[lang] || templates.cpp;
        if (textarea) textarea.value = initial;
      }
      var themeName = document.body.classList.contains('dark-mode') ? 'vs-dark' : 'vs';
      editorInstance = window.monaco.editor.create(container, {
        value: initial, language: monacoLang, theme: themeName, fontSize:14, automaticLayout:true, minimap:{ enabled:false }, scrollBeyondLastLine:false, wordWrap:'on', lineNumbers:'on', folding:true, renderWhitespace:'selection', formatOnPaste:true, tabSize:4
      });
      if (textarea){ editorInstance.onDidChangeModelContent(function(){ textarea.value = editorInstance.getValue(); }); }
      if (langSel){
        updateFilename(langSel.value || 'cpp');
        langSel.addEventListener('change', function(){
          var l = langMap[langSel.value] || 'cpp';
          if (window.monaco && editorInstance){ window.monaco.editor.setModelLanguage(editorInstance.getModel(), l); }
          // Replace content with Hello World template when language changes
          applyTemplateFor(langSel.value || 'cpp');
        });
      }
      // Ensure filename matches on first load
      updateFilename(lang);
      // expose instance
      try { window.playMonacoEditor = editorInstance; } catch(_) {}
      // Listen for theme changes dispatched by PlayArea core
      document.addEventListener('playarea-theme-changed', function(e){
        var isDark = e && e.detail && e.detail.dark;
        try { window.monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs'); } catch(_) {}
      });
    }).catch(function(err){ console.error('Monaco init failed:', err); if (textarea) textarea.style.display='block'; });
  };
})();






