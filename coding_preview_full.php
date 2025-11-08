<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }
$activityId = isset($_GET['activity_id']) ? (int)$_GET['activity_id'] : 0;
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CodeRegal Coding Preview</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
  <style>
    html, body { height:100%; margin:0; background:#0f172a; overflow:hidden; }
    .preview-wrap { position:fixed; inset:0; overflow:auto; }
    #root { height:100vh; padding:0; margin:0; }
    /* Ensure Monaco container has proper dimensions */
    #previewMonacoContainer { flex:1 !important; min-height:0 !important; position:relative !important; width:100% !important; height:100% !important; }
    /* Ensure Codestem interface fills viewport exactly */
    .codestem-coding-interface { height:100vh !important; min-height:100vh !important; max-height:100vh !important; margin:0 !important; padding:0 !important; }
    .back-btn { position:fixed; top:14px; right:14px; z-index:99999; width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:#0d1322; color:#e5e7eb; border:1px solid rgba(255,255,255,0.18); cursor:pointer; box-shadow:0 10px 24px rgba(0,0,0,0.45); transition:transform .12s ease, background .12s ease, box-shadow .12s ease; }
    .back-btn:hover { background:#121a2f; transform:scale(1.04); box-shadow:0 14px 32px rgba(0,0,0,0.5); }
    .back-btn:active { transform:scale(0.98); }
    .back-btn:focus { outline:2px solid #22c55e; outline-offset:2px; }
    .back-btn__icon { font-size:18px; line-height:1; }
  </style>
  <script src="assets/js/coordinator.js"></script>
</head>
<body>
  <button class="back-btn" onclick="history.back()" aria-label="Back (Esc)" title="Back (Esc)"><span class="back-btn__icon">×</span></button>
  <div class="preview-wrap"><div id="root"></div></div>
  <script>
  // Set user ID for submission saving
  window.__USER_ID__ = <?php echo isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0; ?>;
  
  (async function(){
    const aid = <?php echo $activityId; ?>;
    const mount = document.getElementById('root');
    try {
      const res = await fetch('universal_activity_api.php?action=get_activity&id=' + encodeURIComponent(aid), { credentials:'same-origin' });
      const data = await res.json();
      if (!data || !data.success || !data.activity) {
        mount.innerHTML = '<div style="color:#e5e7eb;padding:24px;">Failed to load activity.</div>';
        return;
      }
      if (typeof renderCodingPreview === 'function') {
        const html = renderCodingPreview(data.activity);
        mount.innerHTML = html;
        
        // CRITICAL: Extract and execute inline scripts (innerHTML doesn't execute <script> tags)
        const scripts = mount.querySelectorAll('script');
        scripts.forEach(function(oldScript) {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach(function(attr) {
            newScript.setAttribute(attr.name, attr.value);
          });
          newScript.textContent = oldScript.textContent;
          oldScript.parentNode.replaceChild(newScript, oldScript);
        });
        
        // Restore code from backend on load
        (async function restoreFromBackend() {
          try {
            const userId = <?php echo isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0; ?>;
            if (!userId || !aid) return;
            
            const progressRes = await fetch('get_activity_progress.php?activity_id=' + encodeURIComponent(aid) + '&user_id=' + encodeURIComponent(userId), { credentials: 'same-origin' });
            const progressData = await progressRes.json();
            
            if (progressData && progressData.success && progressData.progress && progressData.progress.answers) {
              try {
                const answers = typeof progressData.progress.answers === 'string' 
                  ? JSON.parse(progressData.progress.answers) 
                  : progressData.progress.answers;
                
                if (answers && answers.code) {
                  // Store saved code to restore after Monaco loads
                  window.__savedCodeFromBackend = answers.code;
                  console.log('✅ Found saved code in backend, will restore after editor loads');
                }
              } catch(e) {
                console.warn('Failed to parse saved answers:', e);
              }
            }
          } catch(e) {
            console.warn('Failed to load from backend:', e);
          }
        })();
        
        // Force Monaco initialization after scripts execute
        setTimeout(function(){
          try {
            const container = document.getElementById('previewMonacoContainer');
            const textarea = document.getElementById('previewCodeTextarea');
            
            if (container && textarea && typeof loadMonacoEditor === 'function') {
              // Ensure Monaco loads and initializes
              loadMonacoEditor().then(function(){
                if (window.monaco && window.monaco.editor && !window.__previewEditor) {
                  console.log('🎨 [FULL PAGE] Creating Monaco editor instance...');
                  const lang = (function(){ 
                    try { 
                      const meta = JSON.parse(data.activity.instructions||'{}'); 
                      return (meta.language||'cpp').toLowerCase(); 
                    } catch(_){ return 'cpp'; } 
                  })();
                  
                  const editor = window.monaco.editor.create(container, {
                    value: textarea.value,
                    language: lang,
                    theme: 'vs',
                    fontSize: 14,
                    automaticLayout: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    lineNumbers: 'on'
                  });
                  
                  // Auto-save system
                  const starterCode = textarea.value; // Get initial starter code
                  let lastSavedCode = starterCode;
                  let saveTimeout = null;
                  let backendSaveInterval = null;
                  let isSaving = false;
                  
                  // LocalStorage key for this activity
                  const storageKey = 'coding_draft_' + aid;
                  
                  // Restore code: backend first, then localStorage
                  let restoredCode = null;
                  
                  // Priority 1: Restore from backend (if available)
                  if (window.__savedCodeFromBackend) {
                    restoredCode = window.__savedCodeFromBackend;
                    editor.setValue(restoredCode);
                    textarea.value = restoredCode;
                    lastSavedCode = restoredCode;
                    console.log('✅ Restored code from backend');
                    delete window.__savedCodeFromBackend; // Clear after use
                  } else {
                    // Priority 2: Restore from localStorage
                    try {
                      const saved = localStorage.getItem(storageKey);
                      if (saved) {
                        const savedData = JSON.parse(saved);
                        if (savedData.code && savedData.code !== starterCode) {
                          restoredCode = savedData.code;
                          editor.setValue(restoredCode);
                          textarea.value = restoredCode;
                          lastSavedCode = restoredCode;
                          console.log('✅ Restored code from localStorage');
                        }
                      }
                    } catch(e) {
                      console.warn('Failed to restore from localStorage:', e);
                    }
                  }
                  
                  // Update indicator if code was restored
                  if (restoredCode) {
                    const indicator = document.getElementById('previewSavedIndicator');
                    if (indicator) {
                      indicator.innerHTML = '<i class="fas fa-check-circle" style="color:#10b981;margin-right:4px;"></i>Restored';
                      setTimeout(function() {
                        if (indicator) {
                          indicator.innerHTML = '<i class="fas fa-check-circle" style="color:#10b981;margin-right:4px;"></i>Ready';
                        }
                      }, 2000);
                    }
                  }
                  
                  // Update indicator and trigger auto-save
                  editor.onDidChangeModelContent(function(){ 
                    const currentCode = editor.getValue();
                    textarea.value = currentCode;
                    
                    const indicator = document.getElementById('previewSavedIndicator');
                    if (indicator) {
                      indicator.innerHTML = '<i class="fas fa-circle" style="color:#f59e0b;margin-right:4px;"></i>Modified';
                    }
                    
                    // Clear existing timeout
                    if (saveTimeout) clearTimeout(saveTimeout);
                    
                    // Save to localStorage after 2 seconds of no typing
                    saveTimeout = setTimeout(function() {
                      try {
                        localStorage.setItem(storageKey, JSON.stringify({
                          code: currentCode,
                          timestamp: Date.now(),
                          activityId: aid
                        }));
                        lastSavedCode = currentCode;
                        
                        if (indicator) {
                          indicator.innerHTML = '<i class="fas fa-save" style="color:#3b82f6;margin-right:4px;"></i>Saved locally';
                        }
                        console.log('💾 Auto-saved to localStorage');
                      } catch(e) {
                        console.warn('Failed to save to localStorage:', e);
                      }
                    }, 2000);
                  });
                  
                  // Backend auto-save every 10 seconds (only if code changed)
                  function saveToBackend() {
                    if (isSaving) return;
                    
                    const currentCode = editor.getValue();
                    if (currentCode === lastSavedCode) return; // No changes
                    
                    const userId = <?php echo isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0; ?>;
                    if (!userId || !aid) return;
                    
                    isSaving = true;
                    const indicator = document.getElementById('previewSavedIndicator');
                    if (indicator) {
                      indicator.innerHTML = '<i class="fas fa-spinner fa-spin" style="color:#3b82f6;margin-right:4px;"></i>Saving...';
                    }
                    
                    fetch('save_activity_progress.php', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'same-origin',
                      body: JSON.stringify({
                        activity_id: aid,
                        user_id: userId,
                        answers: { code: currentCode }, // Save code in answers field
                        score: null,
                        completed: false
                      })
                    })
                    .then(function(res) {
                      return res.json();
                    })
                    .then(function(result) {
                      if (result && result.success) {
                        lastSavedCode = currentCode;
                        if (indicator) {
                          indicator.innerHTML = '<i class="fas fa-check-circle" style="color:#10b981;margin-right:4px;"></i>Saved';
                        }
                        console.log('✅ Auto-saved to backend');
                        
                        // Clear localStorage after successful backend save
                        try {
                          localStorage.removeItem(storageKey);
                        } catch(_){}
                      } else {
                        throw new Error(result.message || 'Save failed');
                      }
                    })
                    .catch(function(err) {
                      console.warn('⚠️ Backend save failed:', err);
                      if (indicator) {
                        indicator.innerHTML = '<i class="fas fa-exclamation-circle" style="color:#ef4444;margin-right:4px;"></i>Save failed';
                      }
                    })
                    .finally(function() {
                      isSaving = false;
                    });
                  }
                  
                  // Start backend auto-save interval (every 10 seconds)
                  backendSaveInterval = setInterval(saveToBackend, 10000);
                  
                  // Save on page unload
                  window.addEventListener('beforeunload', function() {
                    const currentCode = editor.getValue();
                    if (currentCode !== lastSavedCode) {
                      try {
                        localStorage.setItem(storageKey, JSON.stringify({
                          code: currentCode,
                          timestamp: Date.now(),
                          activityId: aid
                        }));
                      } catch(_){}
                    }
                  });
                  
                  // Cleanup on page close
                  window.addEventListener('unload', function() {
                    if (saveTimeout) clearTimeout(saveTimeout);
                    if (backendSaveInterval) clearInterval(backendSaveInterval);
                  });
                  
                  window.__previewEditor = editor;
                  textarea.style.display = 'none';
                  console.log('✅ [FULL PAGE] Monaco editor created successfully');
                  
                  // Force layout
                  setTimeout(function(){
                    if (editor && typeof editor.layout === 'function') {
                      editor.layout();
                    }
                    editor.focus();
                  }, 100);
                } else if (window.__previewEditor) {
                  console.log('✅ [FULL PAGE] Monaco editor already exists');
                  setTimeout(function(){
                    if (window.__previewEditor && typeof window.__previewEditor.layout === 'function') {
                      window.__previewEditor.layout();
                    }
                    window.__previewEditor.focus();
                  }, 100);
                } else {
                  console.warn('⚠️ [FULL PAGE] Monaco not available, using textarea');
                  textarea.style.display = 'block';
                  
                  // Auto-save for textarea fallback
                  const storageKey = 'coding_draft_' + aid;
                  let lastSavedCode = textarea.value;
                  let saveTimeout = null;
                  
                  // Restore code: backend first, then localStorage
                  let restoredCode = null;
                  
                  // Priority 1: Restore from backend (if available)
                  if (window.__savedCodeFromBackend) {
                    restoredCode = window.__savedCodeFromBackend;
                    textarea.value = restoredCode;
                    lastSavedCode = restoredCode;
                    console.log('✅ Restored code from backend (textarea)');
                    delete window.__savedCodeFromBackend;
                  } else {
                    // Priority 2: Restore from localStorage
                    try {
                      const saved = localStorage.getItem(storageKey);
                      if (saved) {
                        const savedData = JSON.parse(saved);
                        if (savedData.code && savedData.code !== textarea.value) {
                          restoredCode = savedData.code;
                          textarea.value = restoredCode;
                          lastSavedCode = restoredCode;
                          console.log('✅ Restored code from localStorage (textarea)');
                        }
                      }
                    } catch(e) {
                      console.warn('Failed to restore from localStorage:', e);
                    }
                  }
                  
                  // Update indicator if code was restored
                  if (restoredCode) {
                    const indicator = document.getElementById('previewSavedIndicator');
                    if (indicator) {
                      indicator.innerHTML = '<i class="fas fa-check-circle" style="color:#10b981;margin-right:4px;"></i>Restored';
                      setTimeout(function() {
                        if (indicator) {
                          indicator.innerHTML = '<i class="fas fa-check-circle" style="color:#10b981;margin-right:4px;"></i>Ready';
                        }
                      }, 2000);
                    }
                  }
                  
                  // Auto-save on textarea change
                  textarea.addEventListener('input', function() {
                    const indicator = document.getElementById('previewSavedIndicator');
                    if (indicator) {
                      indicator.innerHTML = '<i class="fas fa-circle" style="color:#f59e0b;margin-right:4px;"></i>Modified';
                    }
                    
                    if (saveTimeout) clearTimeout(saveTimeout);
                    saveTimeout = setTimeout(function() {
                      try {
                        localStorage.setItem(storageKey, JSON.stringify({
                          code: textarea.value,
                          timestamp: Date.now(),
                          activityId: aid
                        }));
                        lastSavedCode = textarea.value;
                        if (indicator) {
                          indicator.innerHTML = '<i class="fas fa-save" style="color:#3b82f6;margin-right:4px;"></i>Saved locally';
                        }
                      } catch(e) {
                        console.warn('Failed to save to localStorage:', e);
                      }
                    }, 2000);
                  });
                  
                  textarea.focus();
                }
              }).catch(function(err){
                console.error('❌ [FULL PAGE] Monaco load failed:', err);
                if (textarea) {
                  textarea.style.display = 'block';
                  textarea.focus();
                }
              });
            } else {
              console.warn('⚠️ [FULL PAGE] Monaco container or textarea not found');
            }
          } catch(err) {
            console.error('❌ [FULL PAGE] Monaco init error:', err);
          }
        }, 200);
        
        // Re-layout on window resize
        window.addEventListener('resize', function(){
          try {
            if (window.__previewEditor && typeof window.__previewEditor.layout === 'function') {
              window.__previewEditor.layout();
            }
          } catch(_){}
        });
      } else {
        mount.innerHTML = '<div style="color:#e5e7eb;padding:24px;">Renderer not available.</div>';
      }
    } catch(e) {
      mount.innerHTML = '<div style="color:#e5e7eb;padding:24px;">Error: '+(e && e.message ? e.message : e)+'</div>';
    }
  })();
  // Esc = back
  (function(){
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') { history.back(); }
    });
  })();
  </script>
</body>
</html>


