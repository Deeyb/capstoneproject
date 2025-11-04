(function(){
  if (!window.PlayArea) window.PlayArea = {};

  // Shared open-terminal used by Teacher and Student pages
  window.PlayArea.openTerminal = function(needsInput, promptsAndInputs){
    var existing = document.getElementById('playCodeRegalTerminalModal');
    if (existing) existing.remove();

    var modal = document.createElement('div');
    modal.id = 'playCodeRegalTerminalModal';
    modal.className = 'play-terminal-modal';
    modal.style.display = 'flex';

    var terminalBodyId = 'playTerminalBody_' + Date.now();
    var firstPromptText = '';
    var bodyInitial = 'Executing';
    if (needsInput){
      if (Array.isArray(promptsAndInputs) && promptsAndInputs.length){
        firstPromptText = (promptsAndInputs[0].prompt || 'Enter value:');
      } else {
        firstPromptText = 'Enter value:';
      }
      try { window.playTerminalPromptText = firstPromptText; } catch(_) {}
      bodyInitial = '<span class="play-terminal-prompt-text">' + escapeHtml(firstPromptText) + '</span> ' +
                    '<input type="text" id="playTerminalInputField" class="terminal-inline-input" autocomplete="off" spellcheck="false" />';
    }

    modal.innerHTML = '\n      <div class="play-terminal-card">\n        <div class="play-terminal-header">\n          <div class="play-terminal-header-text">CodeRegal Terminal</div>\n          <button class="play-terminal-close" id="playTerminalClose">✕</button>\n        </div>\n        <div class="play-terminal-body" id="' + terminalBodyId + '">' + bodyInitial + '</div>\n      </div>\n    ';
    document.body.appendChild(modal);

    var closeBtn = modal.querySelector('#playTerminalClose');
    if (closeBtn) closeBtn.onclick = function(){ modal.remove(); };
    modal.addEventListener('click', function(e){ if (e.target === modal) modal.remove(); });

    var inputField = modal.querySelector('#playTerminalInputField');
    // Reset any previous input for a fresh interaction
    try { window.playAreaTerminalInputValue = ''; } catch(_) {}
    if (inputField){
      setTimeout(function(){ inputField.focus(); }, 50);
      inputField.addEventListener('keydown', function(e){
        if (e.key === 'Enter'){
          e.preventDefault();
          var val = inputField.value.trim();
          if (!val) { inputField.focus(); return; }
          window.playAreaTerminalInputValue = val;
          var tb = document.getElementById(terminalBodyId);
          if (tb) tb.textContent = (firstPromptText || 'Enter value:') + ' ' + val + '\nExecuting...';
          var runBtn = document.getElementById('playRunBtn');
          if (runBtn) runBtn.click();
        }
      });
    }

    window.playTerminalBodyId = terminalBodyId;
    return modal;
  };

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]); });
  }
})();




