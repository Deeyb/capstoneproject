<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/classes/auth_helpers.php';
Auth::requireAuth();

header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$f = $_GET['f'] ?? '';
if (!preg_match('/^[0-9]{8}_[0-9]{6}_[0-9A-Fa-f]{8}_page\.md$/', $f)) {
  http_response_code(400);
  echo 'Invalid page id';
  exit;
}
$path = __DIR__ . '/uploads/materials/pages/' . $f;
if (!is_file($path)) { http_response_code(404); echo 'Not found'; exit; }
$content = @file_get_contents($path) ?: '';
?><!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Content Page</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <link href="https://unpkg.com/prismjs@1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="assets/css/material_page_view.css?v=<?php echo time(); ?>">
</head>
<body>
  <div class="container">
    <div class="card">
      <div id="content"></div>
    </div>
  </div>
  <script src="https://unpkg.com/marked@12.0.2/marked.min.js"></script>
  <script>window.Prism = window.Prism || {}; window.Prism.manual = true;</script>
  <script src="https://unpkg.com/prismjs@1.29.0/prism.js"></script>
  <script>
    // Load Prism components sequentially and mark when ready
    window.__prismComponentsLoading = true;
    window.__prismComponentsLoaded = false;
    
    (function() {
      console.log('[Prism] Loading language components (C++, Python, Java)...');
      const components = [
        'https://unpkg.com/prismjs@1.29.0/components/prism-cpp.min.js',
        'https://unpkg.com/prismjs@1.29.0/components/prism-python.min.js',
        'https://unpkg.com/prismjs@1.29.0/components/prism-java.min.js'
      ];
      let loaded = 0;
      let failed = 0;
      
      function checkComplete() {
        if (loaded + failed === components.length) {
          window.__prismComponentsLoaded = true;
          window.__prismComponentsLoading = false;
          if (failed > 0) {
            console.error('[Prism] Components: ' + loaded + ' loaded, ' + failed + ' failed');
          } else {
            console.log('[Prism] All components loaded successfully');
          }
          
          // Trigger highlighting if function is available
          if (window.waitForPrismAndHighlight) {
            setTimeout(function() {
              window.waitForPrismAndHighlight();
            }, 50);
          }
        }
      }
      
      components.forEach(function(src) {
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.onload = function() {
          loaded++;
          checkComplete();
        };
        script.onerror = function() {
          failed++;
          const name = src.split('/').pop();
          console.error('[Prism] Failed to load:', name);
          checkComplete();
        };
        document.head.appendChild(script);
      });
    })();
  </script>
  <script>
    // Finish Reading interactive toast
    (function(){
      var toast, shown = false; var revealOffset = 200; var lastY = window.scrollY;
      function ensureToast(){
        if (toast) return toast;
        toast = document.createElement('div');
        toast.className = 'finish-reading-toast';
        toast.innerHTML = '<span class="dot"></span><div class="msg">Finish reading?</div>';
        document.body.appendChild(toast);
        return toast;
      }
      function nearBottom(){ return (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - revealOffset); }
      function onScroll(){
        var goingUp = window.scrollY < lastY; lastY = window.scrollY;
        if (nearBottom()) { ensureToast().classList.add('show'); shown = true; }
        if (goingUp && toast) { toast.classList.remove('show'); }
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      // In case already at bottom on load
      setTimeout(onScroll, 300);
    })();
  </script>
  <script>
    // Attach run buttons to fenced code blocks (cpp, python, java)
    function enhanceCodeBlocks() {
      console.log('[Enhance] enhanceCodeBlocks called');
      const allCodeBlocks = document.querySelectorAll('pre code[class^="language-"]');
      console.log('[Enhance] Found code blocks:', allCodeBlocks.length);
      
      allCodeBlocks.forEach(function(code){
        if (code.getAttribute('data-enhanced') === '1') {
          console.log('[Enhance] Already enhanced, skipping');
          return; // prevent duplicates
        }
        const cls = code.className || '';
        const m = cls.match(/language-([a-zA-Z0-9]+)/);
        let lang = m ? m[1].toLowerCase() : '';
        console.log('[Enhance] Processing block with language:', lang, 'className:', cls);
        
        // Handle clike (used as fallback for C++)
        if (lang === 'clike') {
          lang = 'cpp'; // Treat clike as cpp for execution purposes
        }
        
        if (!['cpp','c++','cxx','clike','python','py','python3','java'].includes(lang)) {
          console.log('[Enhance] Language not supported:', lang);
          return;
        }
        const pre = code.parentElement;
        // If already wrapped with a toolbar, skip
        if (pre && pre.parentElement && pre.parentElement.classList && pre.parentElement.classList.contains('run-wrap')) {
          code.setAttribute('data-enhanced','1');
          return;
        }
        const wrap = document.createElement('div');
        wrap.className = 'run-wrap';
        pre.parentNode.insertBefore(wrap, pre);
        wrap.appendChild(pre);
        const bar = document.createElement('div');
        bar.className = 'run-toolbar';
        const runBtn = document.createElement('button'); 
        runBtn.className = 'btn btn-success'; 
        runBtn.style.cssText = 'background: #22c55e; color: #fff; border-color: #16a34a;';
        runBtn.textContent = '▶ Execute code';
        // Ensure green on hover
        runBtn.onmouseenter = function() { this.style.background = '#16a34a'; };
        runBtn.onmouseleave = function() { this.style.background = '#22c55e'; };
        const resetBtn = document.createElement('button'); resetBtn.className = 'btn btn-ghost'; resetBtn.textContent = '↺ Reset';
        bar.appendChild(resetBtn); bar.appendChild(runBtn); wrap.appendChild(bar);
        // Store original code HTML (with highlighting) and plain text version
        const originalHTML = code.innerHTML || '';
        const originalText = code.innerText || code.textContent || '';
        resetBtn.onclick = function(){ 
          code.innerHTML = originalHTML; 
          if (window.Prism) window.Prism.highlightElement(code); 
        };
        runBtn.onclick = function(){ openTerminalAndRun(lang, originalText); };
        code.setAttribute('data-enhanced','1');
        console.log('[Enhance] Created execute buttons for language:', lang);
      });
      
      const enhancedCount = document.querySelectorAll('pre code[data-enhanced="1"]').length;
      console.log('[Enhance] Total enhanced blocks:', enhancedCount);
    }

    async function addCSRF(fd){
      try {
        const tfd = new FormData(); tfd.append('action','get_csrf_token');
        const r = await fetch('course_outline_manage.php', { method:'POST', credentials:'same-origin', body: tfd });
        const j = await r.json(); if (j && j.success && j.token) fd.append('csrf_token', j.token);
      } catch(_) {}
      return fd;
    }

    function hasInputStatements(source){
      // Check if code uses cin, input(), raw_input(), Scanner, etc.
      const cppInput = /\bcin\s*>>/i.test(source);
      const pythonInput = /\binput\s*\(/i.test(source) || /\braw_input\s*\(/i.test(source);
      const javaInput = /new\s+Scanner\s*\(/i.test(source) || /\bSystem\.in/i.test(source);
      return cppInput || pythonInput || javaInput;
    }

    function openTerminalAndRun(lang, source){
      const needsInput = hasInputStatements(source);
      const modal = document.createElement('div');
      modal.className = 'terminal-modal';
      const outElId = 'terminalBody_' + Date.now();
      modal.innerHTML = `
        <div class="terminal-card" style="max-width: 700px;">
          <div class="terminal-header"><div>CodeRegal Terminal</div><button class="terminal-close">✕</button></div>
          ${needsInput ? `
          <div style="padding: 12px; background: #f8f9fa; border-bottom: 1px solid #dee2e6;">
            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #495057; font-size: 13px;">Program Input (stdin):</label>
            <textarea id="terminalStdin" placeholder="Enter input values here (one per line, e.g., for cin >> mark; enter: 85)" 
              style="width: 100%; min-height: 60px; padding: 8px; border: 1px solid #ced4da; border-radius: 4px; font-family: monospace; font-size: 13px; resize: vertical;"></textarea>
            <div style="margin-top: 8px; display: flex; gap: 8px;">
              <button id="runWithInputBtn" style="background: #28a745; color: white; border: none; padding: 6px 16px; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500;">▶ Run with Input</button>
              <div style="flex: 1; font-size: 11px; color: #6c757d; line-height: 1.5; padding-top: 6px;">Tip: Multiple inputs? Enter each value on a new line or separated by spaces.</div>
            </div>
          </div>
          ` : ''}
          <div class="terminal-body" id="${outElId}">${needsInput ? 'Enter input above and click "Run with Input" button.' : 'Running...'}</div>
        </div>`;
      document.body.appendChild(modal);
      modal.querySelector('.terminal-close').onclick = function(){ modal.remove(); };
      
      const stdinEl = modal.querySelector('#terminalStdin');
      const outEl = modal.querySelector('#' + outElId);
      const runBtn = modal.querySelector('#runWithInputBtn');
      
      if (needsInput) {
        // Auto-focus input
        setTimeout(() => stdinEl.focus(), 100);
        
        // Run button click handler
        if (runBtn) {
          runBtn.onclick = function(){
            runBtn.disabled = true;
            runBtn.textContent = 'Running...';
            outEl.textContent = 'Running...';
            runSnippet(lang, source, outEl, stdinEl.value, function(){
              runBtn.disabled = false;
              runBtn.textContent = '▶ Run with Input';
            });
          };
        }
        
        // Ctrl+Enter to run
        stdinEl.addEventListener('keydown', function(e){
          if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            if (runBtn) runBtn.click();
          }
        });
      } else {
        // No input needed, run immediately
        runSnippet(lang, source, outEl, '');
      }
    }

    function showOutput(container, text){ container.textContent = text; }

    async function runSnippet(lang, source, outEl, stdin, onComplete){
      let fd = new FormData();
      fd.append('action','run_snippet');
      fd.append('language', lang);
      fd.append('source', source);
      fd.append('stdin', stdin || '');
      try { fd = await addCSRF(fd); } catch(_){ }
      try {
        const res = await fetch('course_outline_manage.php', { method:'POST', credentials:'same-origin', body: fd });
        const j = await res.json();
        if (!j || !j.success) { 
          if (outEl) showOutput(outEl, 'Run failed: ' + (j && j.message || '')); 
          if (onComplete) onComplete();
          return;
        }
        const r = (j.results && j.results[0]) || {};
        const payload = r && (r.output || r.raw || r.error || r.data) ? (r.data || r) : r; // support both shapes
        const stdout = (typeof payload === 'string') ? payload : (payload.output || payload.raw || payload.error || '');
        if (outEl) showOutput(outEl, stdout || '(no output)');
        if (onComplete) onComplete();
      } catch(e){ 
        if (outEl) showOutput(outEl, 'Run failed'); 
        if (onComplete) onComplete();
      }
    }
  </script>
  <script>
    // Configure Marked.js to NOT highlight (let Prism.js do it after DOM is ready)
    if (window.marked) {
      window.marked.setOptions({
        highlight: null, // Disable Marked's built-in highlighting
        langPrefix: 'language-'
      });
    } else {
      console.error('[MaterialPage] Marked.js not found!');
    }
    
    const md = <?php echo json_encode($content); ?>;
    const html = window.marked ? window.marked.parse(md) : md;
    document.getElementById('content').innerHTML = html;
    
    // Extract CLEAN plain text from code element (unescape entities, strip HTML tags)
    function getCleanCodeText(codeEl) {
      // Method 1: Try textContent first (should give us plain text)
      let text = codeEl.textContent || codeEl.innerText || '';
      
      // If textContent contains HTML entities (like &lt; or &amp;), we need to decode them
      if (text.includes('&lt;') || text.includes('&gt;') || text.includes('&amp;')) {
        const temp = document.createElement('div');
        temp.innerHTML = text;
        text = temp.textContent || temp.innerText || '';
      }
      
      // Strip any HTML tags (in case someone pasted already-highlighted HTML)
      text = text.replace(/<[^>]*>/g, '');
      
      // If still contains entities after stripping tags, decode again
      if (text.includes('&') && (text.includes('lt;') || text.includes('gt;') || text.includes('amp;'))) {
        const temp2 = document.createElement('div');
        temp2.innerHTML = text;
        text = temp2.textContent || temp2.innerText || '';
        text = text.replace(/<[^>]*>/g, '');
      }
      
      // Remove any leftover entity references that weren't decoded
      text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      
      return text.trim();
    }

    // Sanitize a code block by resetting to plain text if token HTML is visible
    function sanitizeCodeBlock(codeEl) {
      const clean = getCleanCodeText(codeEl);
      if (!clean) return false;
      const html = codeEl.innerHTML || '';
      if (/token\s+keyword|token\s+string|&lt;\s*span|&lt;span\s+class=/.test(html)) {
        codeEl.textContent = clean;
        return true;
      }
      return false;
    }

    // FORCE HIGHLIGHT - Comprehensive approach
    window.highlightAllCode = function highlightAllCode() {
      if (!window.Prism) {
        // Fallback: ensure blocks are plain text (no visible token HTML)
        const blocks = document.querySelectorAll('pre code');
        let count = 0;
        blocks.forEach(function(codeEl){
          if (sanitizeCodeBlock(codeEl)) count++;
        });
        return count > 0;
      }
      
      // Find ALL code blocks
      const allCodeBlocks = document.querySelectorAll('pre code');
      
      if (allCodeBlocks.length === 0) {
        return false;
      }
      
      let highlighted = 0;
      
      // FORCE highlight each code block individually
      allCodeBlocks.forEach(function(codeEl, index) {
        // Get language from class
        let langMatch = (codeEl.className || '').match(/language-([a-zA-Z0-9+\-]+)/);
        let lang = langMatch ? langMatch[1] : null;
        
        // Normalize language names
        if (lang) {
          const normalized = lang.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (normalized === 'cpp' || normalized === 'cxx' || lang.toLowerCase() === 'c++') {
            // Use clike as fallback if cpp not available
            if (window.Prism.languages.cpp) {
              lang = 'cpp';
            } else if (window.Prism.languages.clike) {
              lang = 'clike';
              console.log('[Prism] Using clike as fallback for C++');
            } else {
              lang = null;
            }
          } else if (normalized === 'python' || normalized === 'py') {
            lang = 'python';
          } else if (normalized === 'java') {
            lang = 'java';
          }
          if (lang) {
            codeEl.className = 'language-' + lang;
          }
        }
        
        // Check if language is available in Prism
        if (!lang || !window.Prism.languages[lang]) {
          if (sanitizeCodeBlock(codeEl)) highlighted++;
          return;
        }
        
        // Get CLEAN plain text (unescape entities, strip HTML tags)
        let plainText = getCleanCodeText(codeEl);
        if (!plainText) {
          console.warn('[Prism] Empty code block after cleaning');
          return;
        }
        
        // Debug: log first 100 chars to verify it's clean code, not HTML
        if (plainText.includes('&lt;') || plainText.includes('<span')) {
          console.error('[Prism] WARNING: Code still contains HTML after cleaning! First 200 chars:', plainText.substring(0, 200));
          // Try one more aggressive clean
          const temp3 = document.createElement('div');
          temp3.innerHTML = plainText.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
          const finalText = temp3.textContent || temp3.innerText || '';
          if (finalText && !finalText.includes('&lt;') && !finalText.includes('<span')) {
            // Use this cleaned version
            plainText = finalText.trim();
          }
        }
        
        // FORCE highlight using Prism
        try {
          // Verify language grammar exists
          const grammar = window.Prism.languages[lang];
          if (!grammar) {
            console.error('[Prism] Grammar not found for language:', lang);
            return;
          }
          
          // Wrap in try-catch to handle Prism internal errors
          let highlightedHTML;
          try {
            highlightedHTML = window.Prism.highlight(plainText, grammar, lang);
          } catch(prismError) {
            console.error('[Prism] Internal error during highlight:', prismError);
            // Try with just the grammar, no lang param
            try {
              highlightedHTML = window.Prism.highlight(plainText, grammar);
            } catch(e2) {
              console.error('[Prism] Fallback highlight also failed:', e2);
              return;
            }
          }
          
          // Check if highlighting actually produced tokens
          if (highlightedHTML && highlightedHTML !== plainText && highlightedHTML.includes('token')) {
            codeEl.innerHTML = highlightedHTML;
            
            // ALWAYS FORCE APPLY COLORS - Override any Prism theme
            setTimeout(function() {
              const tokens = codeEl.querySelectorAll('.token');
              if (tokens.length > 0) {
                console.log('[Prism] Force-applying colors to', tokens.length, 'tokens');
                
                // Check if this is in a C++ code block
                const isCpp = codeEl.className.includes('language-cpp') || codeEl.className.includes('language-c++');
                
                // ALWAYS apply our colors - don't check, just apply
                let colorMap = { purple: 0, orange: 0, green: 0, cyan: 0, gray: 0, black: 0 };
                let colorMismatches = [];
                
                tokens.forEach(function(tok, idx) {
                  const classes = tok.className || '';
                  const textContent = (tok.textContent || '').trim();
                  const innerHTML = tok.innerHTML || '';
                  
                  // Reset any existing inline styles and set weight
                  tok.style.removeProperty('color');
                  tok.style.removeProperty('font-weight');
                  tok.style.setProperty('font-weight', '400', 'important');
                  
                  // Determine color based on token type
                  // PRIORITY ORDER: Most specific first to prevent wrong matches
                  let targetColor = null;
                  let targetStyle = null;
                  let matchedRule = '';
                  
                  // 1. Numbers/Constants - Orange (check FIRST - most specific)
                  if (classes.includes('number') || classes.includes('constant') || classes.includes('numeric')) {
                    targetColor = '#FF9800'; // Orange for numbers
                    matchedRule = 'number/constant';
                  }
                  // 2. Strings - Dark Green (AGGRESSIVE DETECTION)
                  // Check classes first, then check if content is a string literal
                  else if (classes.includes('string') || classes.includes('char') ||
                          (textContent.startsWith('"') && textContent.endsWith('"')) ||
                          (textContent.startsWith("'") && textContent.endsWith("'")) ||
                          textContent.includes('"') || textContent.includes("'")) {
                    // But only if it's not a number or operator
                    if (!classes.includes('number') && !classes.includes('operator') && 
                        !classes.includes('punctuation') && !textContent.match(/^[+\-*/=<>&|!;:,.(){}[\]]+$/)) {
                      targetColor = '#4CAF50'; // Dark Green for strings
                      matchedRule = 'string';
                    }
                  }
                  // 3. Booleans - Orange
                  else if (classes.includes('boolean')) {
                    targetColor = '#FF9800'; // Orange for booleans
                    matchedRule = 'boolean';
                  }
                  // 4. Comments - Light Gray, italic
                  else if (classes.includes('comment')) {
                    targetColor = '#9E9E9E'; // Light Gray for comments
                    targetStyle = 'italic';
                    matchedRule = 'comment';
                  }
                  // 5. Keywords/Directives - Purple (check BEFORE functions so #include is purple)
                  else if (classes.includes('keyword') || classes.includes('directive') || 
                          classes.includes('atrule') || classes.includes('attr-value') || 
                          classes.includes('type') || classes.includes('storage-type') ||
                          classes.includes('storage-modifier') ||
                          textContent === 'include' || textContent.startsWith('#')) {
                    targetColor = '#9C27B0'; // Purple for keywords
                    matchedRule = 'keyword';
                  }
                  // 6. C++ Built-ins and Standard Library - Purple
                  // Check for specific C++ identifiers that should be purple
                  else if (isCpp) {
                    const cppBuiltins = ['cout', 'cin', 'cerr', 'clog', 'endl', 'printf', 'scanf', 
                                       'assert', 'malloc', 'free', 'new', 'delete', 'sizeof',
                                       'static_cast', 'dynamic_cast', 'const_cast', 'reinterpret_cast',
                                       'size', 'length']; // Add size/length as built-ins
                    const cppTypes = ['vector', 'string', 'map', 'set', 'list', 'deque', 'queue', 
                                    'stack', 'pair', 'tuple', 'array', 'unordered_map', 'unordered_set',
                                    'bool', 'int', 'long', 'double', 'float', 'char'];
                    const cppNamespaces = ['std', 'namespace'];
                    const cppStdTypes = ['vector', 'string', 'map', 'set', 'list', 'deque', 'queue',
                                        'stack', 'pair', 'tuple', 'array', 'unordered_map', 'unordered_set',
                                        'shared_ptr', 'unique_ptr', 'weak_ptr', 'optional', 'variant'];
                    
                    // Check if it's a C++ std type or builtin first
                    if (classes.includes('builtin') || 
                        cppBuiltins.includes(textContent) || 
                        cppTypes.includes(textContent) ||
                        cppNamespaces.includes(textContent) ||
                        classes.includes('namespace') ||
                        (classes.includes('class-name') && cppStdTypes.includes(textContent))) {
                      targetColor = '#9C27B0'; // Purple for C++ builtins/types
                      matchedRule = 'cpp-builtin';
                    }
                    // If class-name but NOT a std type, it's likely a function (cyan)
                    else if (classes.includes('class-name')) {
                      targetColor = '#00BCD4'; // Cyan for user-defined functions
                      matchedRule = 'cpp-function';
                    }
                  }
                  // 7. Functions - Light Blue/Cyan (AFTER keywords so functions are cyan)
                  else if (classes.includes('function') || classes.includes('method') || 
                          classes.includes('class-name')) {
                    targetColor = '#00BCD4'; // Light Blue/Cyan for functions
                    matchedRule = 'function';
                  }
                  // 9. Operators/Punctuation - Black
                  else if (classes.includes('operator') || classes.includes('punctuation')) {
                    targetColor = '#000000'; // Black for operators/punctuation
                    matchedRule = 'operator';
                  }
                  // 10. Default - Black for variables/identifiers
                  else {
                    targetColor = '#000000'; // Black for variables/identifiers
                    matchedRule = 'default';
                  }
                  
                  // Apply the color with maximum specificity using setProperty
                  tok.style.setProperty('color', targetColor, 'important');
                  if (targetStyle) {
                    tok.style.setProperty('font-style', targetStyle, 'important');
                  }
                  
                  // VERIFY: Check if color was actually applied
                  setTimeout(function() {
                    const computed = window.getComputedStyle(tok);
                    const computedColor = computed.color;
                    const expectedRGB = hexToRgb(targetColor);
                    
                    if (expectedRGB && computedColor !== expectedRGB) {
                      colorMismatches.push({
                        text: textContent,
                        classes: classes,
                        expected: targetColor,
                        actual: computedColor,
                        rule: matchedRule
                      });
                      // Force re-apply
                      tok.style.setProperty('color', targetColor, 'important');
                    }
                  }, 10);
                  
                  // Track color distribution for debugging
                  if (targetColor === '#9C27B0') colorMap.purple++;
                  else if (targetColor === '#FF9800') colorMap.orange++;
                  else if (targetColor === '#4CAF50') colorMap.green++;
                  else if (targetColor === '#00BCD4') colorMap.cyan++;
                  else if (targetColor === '#9E9E9E') colorMap.gray++;
                  else if (targetColor === '#000000') colorMap.black++;
                  
                  // Debug first 10 tokens with full details
                  if (idx < 10) {
                    console.log('[Prism] Token', idx, {
                      text: textContent.substring(0, 30),
                      classes: classes,
                      expectedColor: targetColor,
                      rule: matchedRule,
                      isCpp: isCpp
                    });
                  }
                });
                
                // Helper function to convert hex to rgb
                function hexToRgb(hex) {
                  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                  return result ? 
                    `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
                }
                
                console.log('[Prism] Colors force-applied:', colorMap);
                
                // Report mismatches after a delay
                setTimeout(function() {
                  if (colorMismatches.length > 0) {
                    console.warn('[Prism] Color mismatches detected:', colorMismatches.length);
                    colorMismatches.slice(0, 5).forEach(function(m, i) {
                      console.warn('[Prism] Mismatch', i + ':', m);
                    });
                  } else {
                    console.log('[Prism] All colors verified - no mismatches!');
                  }
                }, 150);
              }
            }, 100); // Slightly longer delay to ensure Prism is done
            
            highlighted++;
          } else {
            console.warn('[Prism] Highlighting produced no tokens for', lang);
            codeEl.innerHTML = highlightedHTML;
          }
        } catch(e) {
          console.error('[Prism] Error highlighting code block:', e);
        }
      });
      
      if (highlighted > 0) {
        console.log('[Prism] Successfully highlighted', highlighted, 'code block(s)');
        
        // Final verification: ALWAYS FORCE APPLY COLORS - Override everything
        setTimeout(function() {
          const allTokens = document.querySelectorAll('pre code .token');
          if (allTokens.length > 0) {
            let colorsApplied = 0;
            // Helper function for hex to rgb (same as above)
            function hexToRgbFinal(hex) {
              const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
              return result ? 
                `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
            }
            
            allTokens.forEach(function(tok) {
              const classes = tok.className || '';
              const textContent = (tok.textContent || '').trim();
              
              // Reset styles
              tok.style.removeProperty('color');
              tok.style.removeProperty('font-weight');
              tok.style.setProperty('font-weight', '400', 'important');
              
              // Check if this is in a C++ code block
              const codeBlock = tok.closest('pre code');
              const isCpp = codeBlock && (codeBlock.className.includes('language-cpp') || codeBlock.className.includes('language-c++'));
              
              // Priority order: Check most specific first - SAME LOGIC AS INITIAL APPLICATION
              let targetColor = null;
              let targetStyle = null;
              
              // 1. Numbers/Constants - Orange (check first, most specific)
              if (classes.includes('number') || classes.includes('constant') || classes.includes('numeric')) {
                targetColor = '#FF9800';
              }
              // 2. Strings - Dark Green
              else if (classes.includes('string') || classes.includes('char')) {
                targetColor = '#4CAF50';
              }
              // 3. Booleans - Orange
              else if (classes.includes('boolean')) {
                targetColor = '#FF9800';
              }
              // 4. Comments - Light Gray, italic
              else if (classes.includes('comment')) {
                targetColor = '#9E9E9E';
                targetStyle = 'italic';
              }
              // 5. Keywords/Directives - Purple (check BEFORE functions so #include is purple)
              else if (classes.includes('keyword') || classes.includes('directive') || 
                      classes.includes('atrule') || classes.includes('attr-value') || 
                      classes.includes('type') || classes.includes('storage-type') ||
                      classes.includes('storage-modifier') ||
                      textContent === 'include' || textContent.startsWith('#')) {
                targetColor = '#9C27B0';
              }
              // 6. C++ Built-ins and Standard Library - Purple
              else if (isCpp) {
                const cppBuiltins = ['cout', 'cin', 'cerr', 'clog', 'endl', 'printf', 'scanf', 
                                   'assert', 'malloc', 'free', 'new', 'delete', 'sizeof',
                                   'static_cast', 'dynamic_cast', 'const_cast', 'reinterpret_cast',
                                   'size', 'length'];
                const cppTypes = ['vector', 'string', 'map', 'set', 'list', 'deque', 'queue', 
                                'stack', 'pair', 'tuple', 'array', 'unordered_map', 'unordered_set',
                                'bool', 'int', 'long', 'double', 'float', 'char'];
                const cppNamespaces = ['std', 'namespace'];
                const cppStdTypes = ['vector', 'string', 'map', 'set', 'list', 'deque', 'queue',
                                    'stack', 'pair', 'tuple', 'array', 'unordered_map', 'unordered_set',
                                    'shared_ptr', 'unique_ptr', 'weak_ptr', 'optional', 'variant'];
                
                if (classes.includes('builtin') || 
                    cppBuiltins.includes(textContent) || 
                    cppTypes.includes(textContent) ||
                    cppNamespaces.includes(textContent) ||
                    classes.includes('namespace') ||
                    (classes.includes('class-name') && cppStdTypes.includes(textContent))) {
                  targetColor = '#9C27B0';
                }
                // If class-name but NOT a std type, it's likely a function (cyan)
                else if (classes.includes('class-name')) {
                  targetColor = '#00BCD4'; // Cyan for user-defined functions
                }
              }
              // 7. Functions - Light Blue/Cyan (AFTER keywords so functions are cyan)
              else if (classes.includes('function') || classes.includes('method') || 
                      classes.includes('class-name')) {
                targetColor = '#00BCD4';
              }
              // 9. Operators/Punctuation - Black
              else if (classes.includes('operator') || classes.includes('punctuation')) {
                targetColor = '#000000';
              }
              // 10. Default - Black for variables/identifiers
              else {
                targetColor = '#000000';
              }
              
              // Apply with maximum specificity
              if (targetColor) {
                tok.style.setProperty('color', targetColor, 'important');
                colorsApplied++;
                
                // Verify the color was applied correctly
                setTimeout(function() {
                  const computed = window.getComputedStyle(tok);
                  const computedColor = computed.color;
                  const expectedRGB = hexToRgbFinal(targetColor);
                  
                  if (expectedRGB && computedColor !== expectedRGB) {
                    // Force re-apply if mismatch
                    tok.style.setProperty('color', targetColor, 'important');
                  }
                }, 5);
              }
              if (targetStyle) {
                tok.style.setProperty('font-style', targetStyle, 'important');
              }
            });
            
            console.log('[Prism] Force-applied colors to', colorsApplied, 'tokens via inline styles (final verification)');
            
            // Continuous monitoring: Re-apply colors if they get changed
            const observer = new MutationObserver(function(mutations) {
              let needsReapply = false;
              mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                  const tok = mutation.target;
                  if (tok.classList && tok.classList.contains('token')) {
                    const computed = window.getComputedStyle(tok);
                    const currentColor = computed.color;
                    // Check if color was changed to something wrong
                    const wrongColors = ['rgb(0, 123, 255)', 'rgb(0, 102, 204)', '#007bff', '#0066cc', 
                                        'rgb(138, 190, 183)', 'rgb(121, 107, 171)', 'rgb(197, 200, 198)'];
                    if (wrongColors.some(wc => currentColor.includes(wc) || currentColor === wc)) {
                      needsReapply = true;
                    }
                  }
                }
              });
              if (needsReapply) {
                console.warn('[Prism] Detected color changes, re-applying colors...');
                // Re-run the color application with FULL LOGIC
                const tokens = document.querySelectorAll('pre code .token');
                tokens.forEach(function(tok) {
                  const classes = tok.className || '';
                  const textContent = (tok.textContent || '').trim();
                  const codeBlock = tok.closest('pre code');
                  const isCpp = codeBlock && (codeBlock.className.includes('language-cpp') || codeBlock.className.includes('language-c++'));
                  
                  let targetColor = null;
                  
                  // SAME PRIORITY ORDER AS MAIN LOGIC
                  if (classes.includes('number') || classes.includes('constant') || classes.includes('numeric')) {
                    targetColor = '#FF9800';
                  } else if (classes.includes('string') || classes.includes('char') ||
                            (textContent.startsWith('"') && textContent.endsWith('"')) ||
                            (textContent.startsWith("'") && textContent.endsWith("'")) ||
                            textContent.includes('"') || textContent.includes("'")) {
                    if (!classes.includes('number') && !classes.includes('operator') && 
                        !classes.includes('punctuation') && !textContent.match(/^[+\-*/=<>&|!;:,.(){}[\]]+$/)) {
                      targetColor = '#4CAF50';
                    }
                  } else if (classes.includes('boolean')) {
                    targetColor = '#FF9800';
                  } else if (classes.includes('comment')) {
                    targetColor = '#9E9E9E';
                  } else if (classes.includes('keyword') || classes.includes('directive') || 
                            classes.includes('atrule') || classes.includes('attr-value') || 
                            classes.includes('type') || classes.includes('storage-type') ||
                            classes.includes('storage-modifier') ||
                            textContent === 'include' || textContent.startsWith('#')) {
                    targetColor = '#9C27B0';
                  } else if (isCpp) {
                    const cppBuiltins = ['cout', 'cin', 'cerr', 'clog', 'endl', 'printf', 'scanf', 
                                       'assert', 'malloc', 'free', 'new', 'delete', 'sizeof',
                                       'size', 'length'];
                    const cppTypes = ['vector', 'string', 'map', 'set', 'list', 'deque', 'queue', 
                                    'stack', 'pair', 'tuple', 'array', 'unordered_map', 'unordered_set',
                                    'bool', 'int', 'long', 'double', 'float', 'char'];
                    const cppNamespaces = ['std', 'namespace'];
                    const cppStdTypes = ['vector', 'string', 'map', 'set', 'list', 'deque', 'queue',
                                        'stack', 'pair', 'tuple', 'array', 'unordered_map', 'unordered_set',
                                        'shared_ptr', 'unique_ptr', 'weak_ptr', 'optional', 'variant'];
                    
                    if (classes.includes('builtin') || 
                        cppBuiltins.includes(textContent) || 
                        cppTypes.includes(textContent) ||
                        cppNamespaces.includes(textContent) ||
                        classes.includes('namespace') ||
                        (classes.includes('class-name') && cppTypes.includes(textContent))) {
                      targetColor = '#9C27B0';
                    } else if (classes.includes('class-name')) {
                      // C++ class-name tokens
                      if (cppStdTypes.includes(textContent)) {
                        targetColor = '#9C27B0'; // Purple for C++ std types
                      } else {
                        targetColor = '#00BCD4'; // Cyan for user-defined types/functions
                      }
                    }
                  } else if (classes.includes('function') || classes.includes('method') || 
                            classes.includes('class-name')) {
                    targetColor = '#00BCD4'; // Cyan for functions
                  } else if (classes.includes('operator') || classes.includes('punctuation')) {
                    targetColor = '#000000';
                  } else {
                    targetColor = '#000000';
                  }
                  
                  if (targetColor) {
                    tok.style.setProperty('color', targetColor, 'important');
                  }
                });
              }
            });
            
            // Observe all tokens for style changes
            allTokens.forEach(function(tok) {
              observer.observe(tok, { attributes: true, attributeFilter: ['style'] });
            });
            
            console.log('[Prism] MutationObserver set up to monitor', allTokens.length, 'tokens');
          }
        }, 300); // Longer delay for final check
      } else if (allCodeBlocks.length > 0) {
        console.warn('[Prism] No code blocks were highlighted. Available languages:', Object.keys(window.Prism.languages).filter(l => l !== 'extend' && l !== 'insertBefore'));
        // Still add execute buttons even if highlighting failed
        setTimeout(enhanceCodeBlocks, 100);
      }
      
      return highlighted > 0;
    };
    
    // Wait for Prism and components to be ready (with retry limit to prevent infinite loops)
    window.waitForPrismAndHighlight = function waitForPrismAndHighlight(retryCount) {
      retryCount = retryCount || 0;
      const MAX_RETRIES = 50; // Stop after 5 seconds (50 * 100ms)
      
      if (retryCount >= MAX_RETRIES) {
        console.error('[Prism] Timeout waiting for C++ component. Proceeding with available languages...');
        // Proceed anyway - might work with what we have
        const success = window.highlightAllCode();
        if (!success && window.Prism) {
          const langs = Object.keys(window.Prism.languages).filter(l => l !== 'extend' && l !== 'insertBefore');
          console.error('[Prism] Highlighting failed. Available languages:', langs.join(', '));
        }
        setTimeout(enhanceCodeBlocks, 100);
        return;
      }
      
      if (!window.Prism) {
        setTimeout(function() { waitForPrismAndHighlight(retryCount + 1); }, 100);
        return;
      }
      
      // Check if components are still loading
      if (window.__prismComponentsLoading) {
        setTimeout(function() { waitForPrismAndHighlight(retryCount + 1); }, 100);
        return;
      }
      
      // Check if C++ component is loaded - but also check what IS available
      if (!window.Prism.languages.cpp) {
        // Try to manually load C++ if components say they're loaded but language isn't available
        if (window.__prismComponentsLoaded && !window.__cppManuallyLoading && retryCount < 10) {
          console.log('[Prism] Components loaded but C++ not found. Attempting manual load...');
          window.__cppManuallyLoading = true;
          
          // Try multiple CDN sources
          const cdnSources = [
            'https://unpkg.com/prismjs@1.29.0/components/prism-cpp.min.js',
            'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-cpp.min.js'
          ];
          
          let attemptIndex = 0;
          function tryNextCDN() {
            if (attemptIndex >= cdnSources.length) {
              console.error('[Prism] All CDN sources failed for C++');
              window.__cppManuallyLoading = false;
              // Proceed with clike as fallback
              setTimeout(function() { waitForPrismAndHighlight(retryCount + 1); }, 100);
              return;
            }
            
            const script = document.createElement('script');
            script.src = cdnSources[attemptIndex];
            script.onload = function() {
              // Verify language actually registered
              setTimeout(function() {
                if (window.Prism && window.Prism.languages.cpp) {
                  console.log('[Prism] Manual C++ load succeeded and verified');
                  window.__cppManuallyLoading = false;
                  waitForPrismAndHighlight(retryCount + 1);
                } else {
                  console.warn('[Prism] C++ script loaded but language not registered, trying next CDN...');
                  attemptIndex++;
                  tryNextCDN();
                }
              }, 100);
            };
            script.onerror = function() {
              console.error('[Prism] CDN', attemptIndex + 1, 'failed, trying next...');
              attemptIndex++;
              tryNextCDN();
            };
            document.head.appendChild(script);
          }
          
          tryNextCDN();
          return;
        }
        
        // After 10 retries, give up on C++ and use clike as fallback
        if (retryCount >= 10 && window.Prism.languages.clike) {
          console.log('[Prism] C++ not available, using clike language as fallback');
          // Proceed with highlighting using clike
          const success = window.highlightAllCode();
          if (success) {
            setTimeout(enhanceCodeBlocks, 100);
            return;
          }
        }
        
        setTimeout(function() { waitForPrismAndHighlight(retryCount + 1); }, 100);
        return;
      }
      
      // Normalize language classes first
      document.querySelectorAll('pre code[class^="language-"]').forEach(function(codeEl) {
        let cls = codeEl.className || '';
        let lang = cls.match(/language-([a-zA-Z0-9+\-]+)/);
        if (lang && lang[1]) {
          let normalized = lang[1].toLowerCase().replace(/[^a-z0-9]/g, '');
          if (normalized === 'cpp' || normalized === 'cxx' || lang[1].toLowerCase() === 'c++') {
            // Use cpp if available, otherwise clike
            if (window.Prism.languages.cpp) {
              codeEl.className = 'language-cpp';
            } else if (window.Prism.languages.clike) {
              codeEl.className = 'language-clike';
            }
          } else if (normalized === 'python' || normalized === 'py') {
            codeEl.className = 'language-python';
          } else if (normalized === 'java') {
            codeEl.className = 'language-java';
          }
        }
      });
      
      // Force highlight
      const success = window.highlightAllCode();
      
      if (success) {
        // After highlighting is complete, enhance with run buttons
        setTimeout(function() {
    enhanceCodeBlocks();
        }, 150);
      } else {
        console.error('[Prism] Highlighting failed! Retrying...');
        setTimeout(function() {
          window.highlightAllCode();
          setTimeout(enhanceCodeBlocks, 100);
        }, 300);
      }
    }
    
    // Start the process
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        console.log('[MaterialPage] DOMContentLoaded');
        setTimeout(waitForPrismAndHighlight, 100);
      });
    } else {
      console.log('[MaterialPage] DOM already loaded');
      setTimeout(waitForPrismAndHighlight, 100);
    }
    
    // Extract title from markdown and update page title
    function extractTitle(markdown) {
      const lines = markdown.split('\n');
      for (let line of lines) {
        line = line.trim();
        if (line.startsWith('# ')) {
          return line.substring(2).trim();
        }
      }
      return 'Content Page';
    }
    
    // Calculate reading time
    function calculateReadingTime(markdown) {
      const words = markdown.split(/\s+/).length;
      const minutes = Math.ceil(words / 200); // Average reading speed: 200 words per minute
      return minutes;
    }
    
    // Update document title from markdown (no visible header)
    const title = extractTitle(md);
    document.title = title + ' - CodeRegal LMS';
    
    // Add smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
    
    // Table of contents disabled for cleaner view
    
    // Final fallback: Ensure execute buttons are added even if everything else failed
    setTimeout(function() {
      const enhanced = document.querySelectorAll('pre code[data-enhanced="1"]').length;
      const total = document.querySelectorAll('pre code[class^="language-"]').length;
      if (total > 0 && enhanced === 0) {
        console.log('[Enhance] Fallback: Running enhanceCodeBlocks (no buttons found)');
        enhanceCodeBlocks();
      }
    }, 1000);
  </script>
</body>
</html>


