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
  <link href="https://unpkg.com/prismjs@1.29.0/themes/prism.min.css" rel="stylesheet" />
  <style>
    body { 
      margin:0; 
      font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif; 
      background: #f8fafc;
      color:#1f2937; 
      min-height: 100vh;
    }
    .container { 
      max-width: 900px; 
      margin: 0 auto; 
      padding: 40px 24px; 
    }
    .card { 
      background:#fff; 
      border-radius:8px; 
      box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
      padding: 40px; 
      border: 1px solid #e5e7eb;
    }
    h1 { 
      color:#1f2937; 
      font-size: 2.25rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 0.75rem;
    }
    h2 { 
      color:#374151; 
      font-size: 1.75rem;
      font-weight: 600;
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
    h3 { 
      color:#4b5563; 
      font-size: 1.375rem;
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }
    p { 
      color:#4b5563; 
      line-height: 1.7; 
      margin-bottom: 1.25rem;
      font-size: 1.1rem;
    }
    ul, ol { 
      margin-bottom: 1.5rem; 
      padding-left: 2rem; 
    }
    li { 
      margin-bottom: 0.5rem; 
      color:#4b5563; 
      line-height: 1.6;
    }
    blockquote { 
      border-left: 3px solid #3b82f6; 
      background: #f8fafc;
      padding: 1rem 1.5rem; 
      margin: 1.5rem 0; 
      border-radius: 0 4px 4px 0; 
      color: #475569;
      font-style: italic;
    }
    pre { 
      background: #1f2937; 
      color:#e5e7eb; 
      padding: 1rem; 
      border-radius: 6px; 
      overflow:auto; 
      margin: 1.5rem 0;
      border: 1px solid #374151;
    }
    code { 
      font-family: 'Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace; 
      background: #f1f5f9;
      color: #e11d48;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.9em;
    }
    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }
    a { 
      color: #3b82f6; 
      text-decoration: none; 
      border-bottom: 1px solid transparent;
      transition: all 0.2s;
      font-weight: 500;
    }
    a:hover { 
      border-bottom-color: #3b82f6;
      color: #1d4ed8;
    }
    .run-toolbar { 
      display:flex; 
      gap:8px; 
      align-items:center; 
      justify-content:flex-end; 
      margin:1rem 0 1.5rem; 
      padding: 0.75rem;
      background: #f8fafc;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
    }
    .btn { 
      border:1px solid #d1d5db; 
      border-radius:4px; 
      padding:8px 12px; 
      cursor:pointer; 
      font-weight:500; 
      font-size: 13px;
      transition: all 0.15s;
      background: #fff;
      color: #374151;
    }
    .btn-primary { 
      background: #3b82f6; 
      color:#fff; 
      border-color: #2563eb;
    }
    .btn-primary:hover {
      background: #2563eb;
    }
    .btn-ghost { 
      background:#fff; 
      color:#6b7280; 
      border: 1px solid #d1d5db;
    }
    .btn-ghost:hover {
      background: #f9fafb;
      color: #374151;
    }
    .terminal-modal { 
      position:fixed; 
      inset:0; 
      background:rgba(0,0,0,0.5); 
      display:flex; 
      align-items:center; 
      justify-content:center; 
      z-index:9999; 
    }
    .terminal-card { 
      width:90vw; 
      max-width:1000px; 
      height:70vh; 
      background:#111827; 
      color:#e5e7eb; 
      border-radius:8px; 
      box-shadow:0 4px 20px rgba(0,0,0,0.3); 
      display:flex; 
      flex-direction:column; 
      overflow:hidden;
      border: 1px solid #374151;
    }
    .terminal-header { 
      padding:12px 16px; 
      background:#1f2937; 
      display:flex; 
      align-items:center; 
      justify-content:space-between;
      border-bottom: 1px solid #374151;
    }
    .terminal-body { 
      flex:1; 
      padding:16px; 
      font-family: 'Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace; 
      white-space:pre-wrap; 
      overflow:auto;
      background: #0f172a;
    }
    .terminal-close { 
      background:#ef4444; 
      color:#fff; 
      border:0; 
      border-radius:4px; 
      width:28px; 
      height:28px; 
      cursor:pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      transition: all 0.15s;
    }
    .terminal-close:hover {
      background: #dc2626;
    }
    /* header/meta intentionally removed for clean content view */
    @media (max-width: 768px) {
      .container { padding: 20px 16px; }
      .card { padding: 24px; }
      h1 { font-size: 2rem; }
      h2 { font-size: 1.5rem; }
      h3 { font-size: 1.25rem; }
      .content-meta { flex-direction: column; gap: 0.5rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div id="content"></div>
    </div>
  </div>
  <script src="https://unpkg.com/marked@12.0.2/marked.min.js"></script>
  <script src="https://unpkg.com/prismjs@1.29.0/prism.js"></script>
  <script>
    // Attach run buttons to fenced code blocks (cpp, python, java)
    function enhanceCodeBlocks() {
      document.querySelectorAll('pre code[class^="language-"]').forEach(function(code){
        const cls = code.className || '';
        const m = cls.match(/language-([a-zA-Z0-9]+)/);
        const lang = m ? m[1].toLowerCase() : '';
        if (!['cpp','c++','cxx','python','py','python3','java'].includes(lang)) return;
        const pre = code.parentElement;
        const wrap = document.createElement('div');
        pre.parentNode.insertBefore(wrap, pre);
        wrap.appendChild(pre);
        const bar = document.createElement('div');
        bar.className = 'run-toolbar';
        const runBtn = document.createElement('button'); runBtn.className = 'btn btn-primary'; runBtn.textContent = '▶ Execute code';
        const resetBtn = document.createElement('button'); resetBtn.className = 'btn btn-ghost'; resetBtn.textContent = '↺ Reset';
        bar.appendChild(resetBtn); bar.appendChild(runBtn); wrap.appendChild(bar);
        const original = code.innerText || code.textContent || '';
        resetBtn.onclick = function(){ code.textContent = original; Prism && Prism.highlightElement(code); };
        runBtn.onclick = function(){ openTerminalAndRun(lang, code.innerText || code.textContent || ''); };
      });
    }

    async function addCSRF(fd){
      try {
        const tfd = new FormData(); tfd.append('action','get_csrf_token');
        const r = await fetch('course_outline_manage.php', { method:'POST', credentials:'same-origin', body: tfd });
        const j = await r.json(); if (j && j.success && j.token) fd.append('csrf_token', j.token);
      } catch(_) {}
      return fd;
    }

    function openTerminalAndRun(lang, source){
      const modal = document.createElement('div');
      modal.className = 'terminal-modal';
      modal.innerHTML = `
        <div class="terminal-card">
          <div class="terminal-header"><div>CodeRegal Terminal</div><button class="terminal-close">✕</button></div>
          <div class="terminal-body" id="terminalBody">Running...</div>
        </div>`;
      document.body.appendChild(modal);
      modal.querySelector('.terminal-close').onclick = function(){ modal.remove(); };
      runSnippet(lang, source, modal.querySelector('#terminalBody'));
    }

    function showOutput(container, text){ container.textContent = text; }

    async function runSnippet(lang, source, outEl){
      let fd = new FormData();
      fd.append('action','run_snippet');
      fd.append('language', lang);
      fd.append('source', source);
      try { fd = await addCSRF(fd); } catch(_){ }
      try {
        const res = await fetch('course_outline_manage.php', { method:'POST', credentials:'same-origin', body: fd });
        const j = await res.json();
        if (!j || !j.success) { if (outEl) showOutput(outEl, 'Run failed: ' + (j && j.message || '')); return; }
        const r = (j.results && j.results[0]) || {};
        const payload = r && (r.output || r.raw || r.error || r.data) ? (r.data || r) : r; // support both shapes
        const stdout = (typeof payload === 'string') ? payload : (payload.output || payload.raw || payload.error || '');
        if (outEl) showOutput(outEl, stdout || '(no output)');
      } catch(e){ if (outEl) showOutput(outEl, 'Run failed'); }
    }
  </script>
  <script>
    const md = <?php echo json_encode($content); ?>;
    const html = window.marked.parse(md);
    document.getElementById('content').innerHTML = html;
    window.Prism && window.Prism.highlightAll();
    enhanceCodeBlocks();
    
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
  </script>
</body>
</html>


