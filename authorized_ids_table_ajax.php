<?php
// CRITICAL: Set session path BEFORE any session_start() calls
$sessionPath = __DIR__ . '/sessions';
if (!is_dir($sessionPath)) {
    @mkdir($sessionPath, 0777, true);
}
if (is_dir($sessionPath) && is_writable($sessionPath)) {
    ini_set('session.save_path', $sessionPath);
}

// Set session name before starting
if (session_status() === PHP_SESSION_NONE) {
    $preferred = 'CodeRegalSession';
    $legacy = 'PHPSESSID';
    if (!empty($_COOKIE[$preferred])) { 
        session_name($preferred); 
    } elseif (!empty($_COOKIE[$legacy])) { 
        session_name($legacy); 
    } else { 
        session_name($preferred); 
    }
    @session_start();
}

// Admin-only view
if (!isset($_SESSION['user_role']) || strtoupper($_SESSION['user_role']) !== 'ADMIN') {
  http_response_code(403);
  echo '<div class="empty-state">Unauthorized</div>';
  exit;
}

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/AuthorizedIdsService.php';
$db = (new Database())->getConnection();
$service = new AuthorizedIdsService($db);

$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$sortBy = isset($_GET['sortBy']) ? $_GET['sortBy'] : 'id_number';
$sortDir = isset($_GET['sortDir']) ? $_GET['sortDir'] : 'ASC';

$statusFilter = isset($_GET['status']) ? trim($_GET['status']) : '';
$rows = $service->search($search, $sortBy, $sortDir, 200, $statusFilter !== '' ? $statusFilter : null);
// Debug header to help diagnose filtering
header('X-AuthIDs-Filter: ' . ($statusFilter !== '' ? $statusFilter : 'all'));

function sort_arrow($key, $currentKey, $dir) {
  if ($key !== $currentKey) return '';
  return strtoupper($dir) === 'ASC' ? '▲' : '▼';
}
?>
<div style="display:flex; gap:8px; align-items:center; margin-bottom:10px; flex-wrap:wrap;">
  <input id="authSearch" type="text" value="<?= htmlspecialchars($search) ?>" placeholder="Search ID or status..." style="padding:7px 12px;border:1px solid #ccc;border-radius:5px;min-width:220px;">
  <select id="authStatusFilter" style="padding:7px 12px;border:1px solid #ccc;border-radius:5px;min-width:160px;">
    <?php $opts = ['', 'active', 'used', 'archived']; $labels = ['All Status','Active','Used','Archived'];
      foreach ($opts as $i => $opt) { $label = $labels[$i]; ?>
        <option value="<?= $opt ?>" <?= strtolower($statusFilter)===strtolower($opt)?'selected':'' ?>><?= $label ?></option>
    <?php } ?>
  </select>
  <button id="openImportAuthModalBtn" class="action-btn" style="background:#6f42c1;color:#fff;">Import IDs</button>
  <button id="openAddAuthModalBtn" class="action-btn" style="background:#2196F3;color:#fff;">Add ID</button>
  <button id="authBulkArchiveBtn" class="action-btn" style="background:#f0ad4e;color:#fff;">Archive Selected</button>
  <button id="authBulkUnarchiveBtn" class="action-btn" style="background:#5bc0de;color:#fff;">Unarchive Selected</button>
  <button id="authBulkDeleteBtn" class="action-btn" style="background:#dc3545;color:#fff;">Delete Selected</button>
  <button id="authExportCsvBtn" class="action-btn" style="background:#17a2b8;color:#fff;">Export CSV</button>
</div>
<table class="auth-table" style="min-width:600px;width:100%;">
  <thead>
    <tr>
      <th style="width:40px"><input type="checkbox" id="authSelectAll" style="transform:scale(1.2)"></th>
      <th class="auth-sortable" data-sort="id_number">ID Number <span class="sort-arrow"><?php echo sort_arrow('id_number', $sortBy, $sortDir); ?></span></th>
      <th class="auth-sortable" data-sort="status">Status <span class="sort-arrow"><?php echo sort_arrow('status', $sortBy, $sortDir); ?></span></th>
      <th class="auth-sortable" data-sort="created_at">Created <span class="sort-arrow"><?php echo sort_arrow('created_at', $sortBy, $sortDir); ?></span></th>
      <th class="auth-sortable" data-sort="updated_at">Updated <span class="sort-arrow"><?php echo sort_arrow('updated_at', $sortBy, $sortDir); ?></span></th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <?php if (!$rows): ?>
      <tr><td colspan="6" style="text-align:center;color:#888;">No authorized IDs (filter: <?= htmlspecialchars($statusFilter ?: 'all') ?>)</td></tr>
    <?php else: foreach ($rows as $r): ?>
      <?php $isArchived = strtolower(trim($r['status'])) === 'archived'; ?>
      <tr style="<?= $isArchived ? 'opacity:0.85;' : '' ?>">
        <td><input type="checkbox" class="auth-row" data-id="<?= (int)$r['id'] ?>" style="transform:scale(1.2)" <?= $isArchived ? 'disabled' : '' ?>></td>
        <td><?= htmlspecialchars($r['id_number']) ?></td>
        <td>
          <?php if ($isArchived): ?>
            <span class="auth-badge-archived">Archived</span>
          <?php else: ?>
            <select class="auth-status" data-id="<?= (int)$r['id'] ?>" style="padding:4px 8px;border:1px solid #ccc;border-radius:5px;">
              <?php foreach (['active','used'] as $st): ?>
                <option value="<?= $st ?>" <?= strtolower($r['status'])===$st?'selected':'' ?>><?= $st ?></option>
              <?php endforeach; ?>
            </select>
          <?php endif; ?>
        </td>
        <td><?= htmlspecialchars($r['created_at'] ?? '') ?></td>
        <td><?= htmlspecialchars($r['updated_at'] ?? '') ?></td>
        <td>
          <?php if ($isArchived): ?>
            <button class="action-btn auth-unarchive" data-id="<?= (int)$r['id'] ?>" style="background:#5bc0de;color:#fff;">Unarchive</button>
          <?php else: ?>
            <button class="action-btn auth-edit" data-id="<?= (int)$r['id'] ?>" data-idnum="<?= htmlspecialchars($r['id_number']) ?>" style="background:#28a745;color:#fff;">Edit</button>
            <button class="action-btn auth-delete" data-id="<?= (int)$r['id'] ?>" style="background:#dc3545;color:#fff;">Delete</button>
            <button class="action-btn auth-archive" data-id="<?= (int)$r['id'] ?>" style="background:#f0ad4e;color:#fff;">Archive</button>
          <?php endif; ?>
        </td>
      </tr>
    <?php endforeach; endif; ?>
  </tbody>
</table>
 
<style>
/* Dark mode for Authorized IDs table */
body.dark-mode .auth-table thead th { background: #3a3a3a; color: #e0e0e0; }
body.dark-mode .auth-table tbody tr:hover { background: #2b2b2b; }
body.dark-mode .sort-arrow { color: #bbb; opacity: 0.9; }
.auth-badge-archived { background:#6c757d; color:#fff; padding:3px 8px; border-radius:12px; font-size:12px; }
</style>

