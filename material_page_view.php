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
    body { margin:0; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif; background:#f4f7fb; color:#222; }
    .container { max-width: 980px; margin: 0 auto; padding: 24px; }
    h1,h2,h3 { color:#152238; }
    pre { background:#0b1220; color:#e6edf3; padding:12px 14px; border-radius:8px; overflow:auto; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; }
    .card { background:#fff; border-radius:12px; box-shadow: 0 8px 24px rgba(0,0,0,0.06); padding: 24px; }
    .run-toolbar { display:flex; gap:10px; align-items:center; justify-content:flex-end; margin:6px 0 12px; }
    .btn { border:0; border-radius:999px; padding:8px 14px; cursor:pointer; font-weight:600; }
    .btn-primary { background:#0ea5e9; color:#fff; }
    .btn-ghost { background:transparent; color:#94a3b8; }
    .terminal-modal { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:9999; }
    .terminal-card { width:90vw; max-width:1100px; height:70vh; background:#111827; color:#e5e7eb; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,0.5); display:flex; flex-direction:column; overflow:hidden; }
    .terminal-header { padding:10px 14px; background:#1f2937; display:flex; align-items:center; justify-content:space-between; }
    .terminal-body { flex:1; padding:14px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; white-space:pre-wrap; overflow:auto; }
    .terminal-close { background:#ef4444; color:#fff; border:0; border-radius:50%; width:28px; height:28px; cursor:pointer; }
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
        const data = r.data || r.raw || r.error || '';
        const stdout = (data && data.output) ? data.output : (typeof data === 'string' ? data : JSON.stringify(data));
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
  </script>
</body>
</html>


