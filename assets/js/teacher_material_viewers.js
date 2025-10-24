// ======================== MATERIAL VIEWERS FOR TEACHER DASHBOARD ========================

(function initTeacherMaterialViewers() {
  // Material viewer functions following the existing functional pattern
  
  function showLinkViewer(url) {
  // Detect provider
  const provider = (function(u){
    if (/youtube\.com\/watch\?v=|youtu\.be\//i.test(u)) return 'youtube';
    if (/drive\.google\.com/i.test(u)) return 'drive';
    return 'generic';
  })(url);
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;';
  
  let embedUrl = url;
  let title = '🔗 Link Viewer';
  
  if (provider === 'youtube') {
    const videoId = (url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/))?.[1];
    if (videoId) {
      embedUrl = 'https://www.youtube.com/embed/' + videoId;
      title = '📺 YouTube Video';
      }
  }
  
  modal.innerHTML = '<div class="modal-card" style="max-width:95%;width:95%;height:90%;display:flex;flex-direction:column;background:#fff;border-radius:8px;overflow:hidden;font-family:\'Inter\',sans-serif;">' +
    '<div style="padding:10px 12px;border-bottom:1px solid #ddd;display:flex;align-items:center;justify-content:space-between;background:#f8f9fa;font-family:\'Inter\',sans-serif;">' +
      '<strong style="font-size:16px;color:#333;font-family:\'Inter\',sans-serif;">' + title + '</strong>' +
      '<div style="display:flex;gap:8px;">' +
        '<button class="action-btn" onclick="window.open(\'' + url + '\', \'_blank\')" style="padding:6px 12px;background:#17a2b8;color:#fff;border:none;border-radius:4px;cursor:pointer;font-family:\'Inter\',sans-serif;">🔗 Open Original</button>' +
        '<button class="action-btn" id="linkViewerClose" style="padding:6px 12px;background:#dc3545;color:#fff;border:none;border-radius:4px;cursor:pointer;font-family:\'Inter\',sans-serif;">Close</button>' +
      '</div>' +
    '</div>' +
    '<div style="flex:1;position:relative;background:#f5f5f5;font-family:\'Inter\',sans-serif;">' +
      (provider === 'generic' ? 
        '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;color:#6c757d;font-family:\'Inter\',sans-serif;">' +
          '<div style="font-size:48px;margin-bottom:16px;">🔗</div>' +
          '<h3 style="font-family:\'Inter\',sans-serif;">External Link</h3>' +
          '<p style="font-family:\'Inter\',sans-serif;">This link cannot be embedded in the viewer.</p>' +
          '<button onclick="window.open(\'' + url + '\', \'_blank\')" style="padding:8px 16px;background:#007bff;color:#fff;border:none;border-radius:4px;margin-top:12px;cursor:pointer;font-family:\'Inter\',sans-serif;">Open in New Tab</button>' +
        '</div>' : 
        '<iframe src="' + embedUrl + '" style="width:100%;height:100%;border:none;" frameborder="0" allowfullscreen></iframe>'
      ) +
    '</div>' +
  '</div>';
  
  document.body.appendChild(modal);
  
  const closeBtn = modal.querySelector('#linkViewerClose');
  if (closeBtn) closeBtn.onclick = function() { modal.remove(); };
  modal.addEventListener('click', function(e) { 
    if (e.target === modal) modal.remove(); 
  });
}

  function showPDFViewer(url) {
  alert('PDF Viewer: ' + url);
};

  function showCodeViewer(url) {
  alert('Code Viewer: ' + url);
};

  // Material viewer function (copied from class_dashboard.js)
  function openMaterialViewer(material) {
    try {
      let url = (material && (material.url || material.link || material.href)) || '';
      const title = escapeHtml((material && (material.filename || material.title)) || 'Material');
      if (!url) { 
        return; 
      }
      
      // Normalize relative URL and add inline view for our download endpoint
      try {
        if (/^material_download\.php/i.test(url)) {
          url += (url.indexOf('?') === -1 ? '?' : '&') + 'view=true';
        }
        url = new URL(url, window.location.href).toString();
      } catch (_) {}

      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;';
      const wrap = document.createElement('div');
      wrap.style.cssText = 'background:#fff;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,0.25);width:96%;height:90vh;display:flex;flex-direction:column;overflow:hidden;';
      
      wrap.innerHTML = ''+
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #e5e7eb;background:linear-gradient(135deg,#ffffff 0%,#f8fafc 100%);font-family:\'Inter\',sans-serif;">'+
          '<div style="display:flex;align-items:center;gap:10px;">'+
            '<div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#1d9b3e,#28a745);display:flex;align-items:center;justify-content:center;color:#fff;"><i class="fas fa-file"></i></div>'+
            '<div style="font-weight:700;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:40vw;font-family:\'Inter\',sans-serif;">'+ title +'</div>'+
          '</div>'+
          '<div style="display:flex;gap:8px;">'+
            '<button id="matCloseBtn" style="background:#6b7280;color:#fff;border:none;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:600;font-family:\'Inter\',sans-serif;">Close</button>'+
          '</div>'+
        '</div>'+
        '<div id="matViewerBody" style="flex:1;background:#f8fafc;font-family:\'Inter\',sans-serif;"></div>';
      overlay.appendChild(wrap);
      document.body.appendChild(overlay);

      const close = () => { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); };
      overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
      wrap.querySelector('#matCloseBtn').addEventListener('click', close);
      const esc = (e)=>{ if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } };
      document.addEventListener('keydown', esc);

      const body = wrap.querySelector('#matViewerBody');
      const lower = url.toLowerCase();
      const materialType = (material && material.type) ? material.type.toLowerCase() : '';
      const materialFilename = (material && material.filename) ? material.filename.toLowerCase() : '';
      
      // Check file type by material type and filename, not just URL
      const isPdf = lower.endsWith('.pdf') || materialType === 'pdf' || materialFilename.endsWith('.pdf');
      const isVideo = lower.endsWith('.mp4') || lower.endsWith('.webm') || materialType === 'video' || materialFilename.match(/\.(mp4|webm)$/);
      const isImage = lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif') || materialFilename.match(/\.(png|jpg|jpeg|gif)$/);
      const isYouTube = /youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\//.test(lower);
      const isGoogleDrive = /drive\.google\.com/.test(lower);
      const isGoogleDriveFolder = /drive\.google\.com\/drive\/folders\//.test(lower);
      
      if (isPdf) {
        const iframe = document.createElement('iframe');
        const src = url + (url.indexOf('#') === -1 ? '#toolbar=1&navpanes=0' : '');
        iframe.src = src;
        iframe.style.cssText = 'width:100%;height:100%;border:0;background:#fff;';
        body.appendChild(iframe);
      } else if (isVideo) {
        const video = document.createElement('video');
        video.controls = true;
        video.style.cssText = 'width:100%;height:100%;background:#000;';
        const source = document.createElement('source');
        source.src = url;
        source.type = lower.endsWith('.mp4') ? 'video/mp4' : 'video/webm';
        video.appendChild(source);
        body.appendChild(video);
      } else if (isImage) {
        body.style.display = 'flex';
        body.style.alignItems = 'center';
        body.style.justifyContent = 'center';
        body.style.background = '#fff';
        const img = document.createElement('img');
        img.src = url;
        img.alt = title;
        img.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;display:block;';
        body.appendChild(img);
      } else if (isGoogleDriveFolder) {
        // Handle Google Drive folder links - cannot be embedded
        body.style.display = 'flex';
        body.style.alignItems = 'center';
        body.style.justifyContent = 'center';
        body.style.background = '#fff';
        const folderCard = document.createElement('div');
        folderCard.style.cssText = 'background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;max-width:520px;width:92%;text-align:center;box-shadow:0 12px 30px rgba(0,0,0,0.08)';
        folderCard.innerHTML = '<div style="font-size:42px;color:#1d9b3e;margin-bottom:10px;"><i class="fas fa-folder"></i></div>'+
          '<div style="font-weight:700;color:#0f172a;margin-bottom:6px;">Google Drive Folder</div>'+
          '<div style="color:#64748b;margin-bottom:14px;">Folders cannot be embedded directly. Please use individual file links instead.</div>'+
          '<div style="display:flex;gap:10px;justify-content:center;">'+
            '<a href="'+url+'" target="_blank" style="text-decoration:none;background:#1d9b3e;color:#fff;padding:8px 12px;border-radius:8px;font-weight:600;">Open Folder</a>'+
          '</div>';
        body.appendChild(folderCard);
      } else if (isGoogleDrive) {
        // Handle Google Drive file links by converting to embed format
        try {
          let embedUrl = '';
          let fileId = null;
          
          // Extract file ID from various Google Drive URL formats
          if (/\/file\/d\/([a-zA-Z0-9_-]+)/.test(url)) {
            fileId = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)[1];
          } else if (/[?&]id=([a-zA-Z0-9_-]+)/.test(url)) {
            fileId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)[1];
          }
          
          if (fileId) {
            embedUrl = 'https://drive.google.com/file/d/' + fileId + '/preview';
            const iframe = document.createElement('iframe');
            iframe.src = embedUrl;
            iframe.style.cssText = 'width:100%;height:100%;border:0;background:#fff;';
            iframe.onerror = function() {
              body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#fff;">'+
                '<div style="text-align:center;padding:20px;">'+
                  '<div style="font-size:48px;color:#dc3545;margin-bottom:16px;"><i class="fas fa-exclamation-triangle"></i></div>'+
                  '<h3 style="color:#0f172a;margin-bottom:8px;">Google Drive Access Issue</h3>'+
                  '<p style="color:#64748b;margin-bottom:16px;">This file may be private or restricted. Please check the sharing settings.</p>'+
                  '<a href="'+url+'" target="_blank" style="text-decoration:none;background:#1d9b3e;color:#fff;padding:8px 16px;border-radius:8px;font-weight:600;">Open in Google Drive</a>'+
                '</div>'+
              '</div>';
            };
            body.appendChild(iframe);
          } else {
            throw new Error('Could not extract file ID from Google Drive URL');
          }
        } catch (error) {
          body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#fff;">'+
            '<div style="text-align:center;padding:20px;">'+
              '<div style="font-size:48px;color:#dc3545;margin-bottom:16px;"><i class="fas fa-exclamation-triangle"></i></div>'+
              '<h3 style="color:#0f172a;margin-bottom:8px;">Invalid Google Drive Link</h3>'+
              '<p style="color:#64748b;margin-bottom:16px;">Could not process this Google Drive URL. Please check the link format.</p>'+
              '<a href="'+url+'" target="_blank" style="text-decoration:none;background:#1d9b3e;color:#fff;padding:8px 16px;border-radius:8px;font-weight:600;">Open in Google Drive</a>'+
            '</div>'+
          '</div>';
        }
      } else if (isYouTube) {
        // Handle YouTube links by converting to embed format
        try {
          let videoId = null;
          let embedUrl = '';
          
          // Extract video ID from various YouTube URL formats
          if (/[?&]v=([^&]+)/.test(url)) {
            videoId = url.match(/[?&]v=([^&]+)/)[1];
          } else if (/youtu\.be\/([^?]+)/.test(url)) {
            videoId = url.match(/youtu\.be\/([^?]+)/)[1];
          } else if (/youtube\.com\/embed\/([^?]+)/.test(url)) {
            videoId = url.match(/youtube\.com\/embed\/([^?]+)/)[1];
          }
          
          if (videoId) {
            embedUrl = 'https://www.youtube.com/embed/' + videoId;
            const iframe = document.createElement('iframe');
            iframe.src = embedUrl;
            iframe.style.cssText = 'width:100%;height:100%;border:0;background:#fff;';
            iframe.allowFullscreen = true;
            body.appendChild(iframe);
          } else {
            throw new Error('Could not extract video ID from YouTube URL');
          }
        } catch (error) {
          body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#fff;">'+
            '<div style="text-align:center;padding:20px;">'+
              '<div style="font-size:48px;color:#dc3545;margin-bottom:16px;"><i class="fas fa-exclamation-triangle"></i></div>'+
              '<h3 style="color:#0f172a;margin-bottom:8px;">Invalid YouTube Link</h3>'+
              '<p style="color:#64748b;margin-bottom:16px;">Could not process this YouTube URL. Please check the link format.</p>'+
              '<a href="'+url+'" target="_blank" style="text-decoration:none;background:#dc3545;color:#fff;padding:8px 16px;border-radius:8px;font-weight:600;">Open in YouTube</a>'+
            '</div>'+
          '</div>';
        }
      } else {
        // Generic link - show fallback card
        body.style.display = 'flex';
        body.style.alignItems = 'center';
        body.style.justifyContent = 'center';
        body.style.background = '#fff';
        const card = document.createElement('div');
        card.style.cssText = 'background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;max-width:520px;width:92%;text-align:center;box-shadow:0 12px 30px rgba(0,0,0,0.08)';
        card.innerHTML = '<div style="font-size:42px;color:#1d9b3e;margin-bottom:10px;"><i class="fas fa-link"></i></div>'+
          '<div style="font-weight:700;color:#0f172a;margin-bottom:6px;">External Link</div>'+
          '<div style="color:#64748b;margin-bottom:14px;">This link cannot be embedded in the viewer.</div>'+
          '<div style="display:flex;gap:10px;justify-content:center;">'+
            '<p style="color:#64748b;font-size:14px;">Link will open automatically</p>'+
          '</div>';
        body.appendChild(card);
      }
    } catch (error) {
      }
  }

  // Expose functions globally following the existing pattern
  window.showLinkViewer = showLinkViewer;
  window.showPDFViewer = showPDFViewer;
  window.showCodeViewer = showCodeViewer;
  window.openMaterialViewer = openMaterialViewer;
  
  // Test function to verify material viewer functions are working
  window.testMaterialViewer = function() {
    if (typeof showLinkViewer === 'function') {
      } else {
      }
  };
  
  // Test if the function is actually callable
  if (typeof window.openMaterialViewer === 'function') {
    } else {
    }
  
    ;
    
    if (typeof window.openMaterialViewer === 'function') {
      try {
        window.openMaterialViewer(testMaterial);
        } catch (error) {
        }
    } else {
      }
  };
  
})();

