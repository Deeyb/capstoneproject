<?php
// Minimal embed page to render the exact Codestem preview using coordinator.js
if (session_status() === PHP_SESSION_NONE) { session_start(); }
$activityId = isset($_GET['activity_id']) ? (int)$_GET['activity_id'] : 0;
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CodeRegal Coding Preview</title>
  <style>
    html, body { height:100%; margin:0; background:#0f172a; }
    .embed-root { height:100%; display:flex; align-items:center; justify-content:center; }
    .embed-wrap { width:96%; max-width:1200px; max-height:92vh; overflow:auto; }
    /* Allow the coordinator preview to control visuals */
  </style>
  <!-- Load coordinator script (contains renderCodingPreview + handlers) -->
  <script src="assets/js/coordinator.js"></script>
</head>
<body>
  <div class="embed-root">
    <div class="embed-wrap" id="embedTarget"></div>
  </div>
  <script>
  (async function(){
    // Fetch the activity data via the shared universal API
    const aid = <?php echo $activityId; ?>;
    try {
      const res = await fetch('universal_activity_api.php?action=get_activity&id=' + encodeURIComponent(aid), { credentials: 'same-origin' });
      const data = await res.json();
      if (!data || !data.success || !data.activity) {
        document.getElementById('embedTarget').innerHTML = '<div style="color:#e5e7eb;padding:24px;">Failed to load activity.</div>';
        return;
      }
      // Use exact coordinator renderer if available
      if (typeof renderCodingPreview === 'function') {
        document.getElementById('embedTarget').innerHTML = renderCodingPreview(data.activity);
      } else {
        document.getElementById('embedTarget').innerHTML = '<div style="color:#e5e7eb;padding:24px;">Renderer not available.</div>';
      }
    } catch(e) {
      document.getElementById('embedTarget').innerHTML = '<div style="color:#e5e7eb;padding:24px;">Error: '+(e && e.message ? e.message : e)+'</div>';
    }
  })();
  </script>
</body>
</html>



