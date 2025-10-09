<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
// Admin-only view for server-rendered user table
if (!isset($_SESSION['user_role']) || strtoupper($_SESSION['user_role']) !== 'ADMIN') {
  http_response_code(403);
  echo '<div class="empty-state">Unauthorized</div>';
  exit;
}

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/UserManager.php';

$db = (new Database())->getConnection();
$userManager = new UserManager($db);

$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$role_filter = isset($_GET['role']) ? trim($_GET['role']) : '';
$status_filter = isset($_GET['status']) ? trim($_GET['status']) : '';
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$pageSize = isset($_GET['pageSize']) ? max(5, (int)$_GET['pageSize']) : 10;
$sortBy = isset($_GET['sortBy']) ? $_GET['sortBy'] : 'firstname';
$sortDir = isset($_GET['sortDir']) ? $_GET['sortDir'] : 'ASC';
$offset = ($page - 1) * $pageSize;

$totalCount = $userManager->getUsersCount($search, $role_filter, $status_filter);
$users = $userManager->getAllUsers($search, $role_filter, $status_filter, $offset, $pageSize, $sortBy, $sortDir);

// Count total and archived users
$totalUsers = count($users);
$archivedUsers = array_filter($users, function($user) {
    return strtolower($user['status']) === 'archived';
});
$archivedCount = count($archivedUsers);
$activeCount = $totalUsers - $archivedCount;

function highlight_term($text, $term) {
    $safe = htmlspecialchars($text ?? '', ENT_QUOTES, 'UTF-8');
    $term = trim($term ?? '');
    if ($term === '') return $safe;
    $pattern = '/' . preg_quote(htmlspecialchars($term, ENT_QUOTES, 'UTF-8'), '/') . '/i';
    return preg_replace($pattern, '<mark class="search-hit">$0</mark>', $safe);
}

function sort_arrow($key, $currentKey, $dir) {
    if ($key !== $currentKey) return '';
    return strtoupper($dir) === 'ASC' ? '▲' : '▼';
}
?>

<div class="filter-stats" style="margin-bottom: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
  <button id="pillActive" class="pill pill-active" title="Show Active" type="button">Active Users: <?php echo $activeCount; ?></button>
  <button id="pillArchived" class="pill pill-archived" title="Show Archived" type="button">Archived Users: <?php echo $archivedCount; ?></button>
</div>

<!-- Pagination / Sorting Controls -->
<div style="display:flex; gap:10px; align-items:center; margin-bottom:10px;">
  <label>Sort by
    <select id="userSortBy" style="margin-left:6px; padding:4px 8px;">
      <option value="firstname" <?= $sortBy==='firstname'?'selected':''; ?>>First name</option>
      <option value="lastname" <?= $sortBy==='lastname'?'selected':''; ?>>Last name</option>
      <option value="role" <?= $sortBy==='role'?'selected':''; ?>>Role</option>
      <option value="email" <?= $sortBy==='email'?'selected':''; ?>>Email</option>
      <option value="id_number" <?= $sortBy==='id_number'?'selected':''; ?>>ID Number</option>
      <option value="status" <?= $sortBy==='status'?'selected':''; ?>>Status</option>
      <option value="created_at" <?= $sortBy==='created_at'?'selected':''; ?>>Created</option>
    </select>
  </label>
  <select id="userSortDir" style="padding:4px 8px;">
    <option value="ASC" <?= strtoupper($sortDir)==='ASC'?'selected':''; ?>>ASC</option>
    <option value="DESC" <?= strtoupper($sortDir)==='DESC'?'selected':''; ?>>DESC</option>
  </select>
  <label style="margin-left:12px;">Page size
    <select id="userPageSize" style="margin-left:6px; padding:4px 8px;">
      <option <?= $pageSize==10?'selected':''; ?>>10</option>
      <option <?= $pageSize==20?'selected':''; ?>>20</option>
      <option <?= $pageSize==50?'selected':''; ?>>50</option>
    </select>
  </label>
  <div style="margin-left:auto; display:flex; gap:8px;">
    <button id="exportCsvBtn" class="action-btn" style="background:#17a2b8;color:#fff;">Export CSV</button>
  </div>
</div>

<!-- Bulk Actions -->
<div id="bulkActionsBar" style="display: none; margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px; align-items: center; gap: 10px;">
  <span style="margin-right: 10px;"><span id="selectedCount">0</span> users selected</span>
  <button id="bulkArchiveBtn" class="action-btn" style="background: #f0ad4e; color: white;">Archive Selected</button>
  <button id="bulkUnarchiveBtn" class="action-btn" style="background: #5bc0de; color: white;">Unarchive Selected</button>
  <button id="clearSelectionBtn" class="action-btn" style="background: #6c757d; color: white;">Clear Selection</button>
</div>

<table class="users-table" style="min-width:600px;width:100%;">
  <thead>
    <tr>
      <th style="width: 40px;">
        <input type="checkbox" id="selectAll" style="transform: scale(1.2);">
      </th>
      <th class="sortable" data-sort="firstname">Name <span class="sort-arrow"><?php echo sort_arrow('firstname', $sortBy, $sortDir); ?></span></th>
      <th class="sortable" data-sort="role">Role <span class="sort-arrow"><?php echo sort_arrow('role', $sortBy, $sortDir); ?></span></th>
      <th class="sortable" data-sort="email">Email <span class="sort-arrow"><?php echo sort_arrow('email', $sortBy, $sortDir); ?></span></th>
      <th class="sortable" data-sort="id_number">ID Number <span class="sort-arrow"><?php echo sort_arrow('id_number', $sortBy, $sortDir); ?></span></th>
      <th class="sortable" data-sort="status">Status <span class="sort-arrow"><?php echo sort_arrow('status', $sortBy, $sortDir); ?></span></th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <?php if (count($users) === 0): ?>
      <tr><td colspan="7" style="text-align:center; color:#888;">No users found.</td></tr>
    <?php else: ?>
      <?php foreach ($users as $user): 
        $isArchived = strtolower($user['status']) === 'archived';
        $rowStyle = $isArchived ? 'opacity:0.7;' : '';
        $statusBadgeClass = $isArchived ? 'background:#6c757d' : 'background:#28a745';
      ?>
        <tr style="<?php echo $rowStyle; ?>">
          <td>
            <input type="checkbox" class="user-checkbox" data-idnumber="<?= htmlspecialchars($user['id_number']) ?>" 
                   data-status="<?= htmlspecialchars($user['status']) ?>" style="transform: scale(1.2);" <?= $isArchived ? 'disabled' : '' ?>>
          </td>
          <td><?php 
            $lastname = $user['lastname'] ?? '';
            $firstname = $user['firstname'] ?? '';
            $middlename = $user['middlename'] ?? '';
            $middle_initial = $middlename ? strtoupper(mb_substr(trim($middlename), 0, 1)) . '.' : '';
            // Display order follows the current sortBy for better UX
            if ($sortBy === 'firstname') {
                $nameText = trim($firstname . ' ' . $middle_initial . ' ' . $lastname);
            } else {
                $nameText = trim($lastname . ', ' . $firstname . ' ' . $middle_initial);
            }
            echo highlight_term($nameText, $search);
          ?></td>
          <td><?= htmlspecialchars(ucfirst(strtolower($user['role'] ?? 'N/A'))) ?></td>
          <td><?= highlight_term($user['email'] ?? 'N/A', $search) ?></td>
          <td><?= htmlspecialchars($user['id_number'] ?? 'N/A') ?></td>
          <td>
            <span style="padding:3px 8px;border-radius:12px;color:white;font-size:12px;<?php echo $statusBadgeClass; ?>">
              <?= htmlspecialchars($user['status']) ?>
            </span>
          </td>
          <td style="display:flex;gap:5px;flex-wrap:wrap;">
            <?php if (!$isArchived): ?>
              <button class="action-btn edit-btn" data-id="<?= $user['id'] ?>" data-user='<?= htmlspecialchars(json_encode($user), ENT_QUOTES, 'UTF-8') ?>'>Edit</button>
              <button class="action-btn reset-password-btn" style="background:#17a2b8; color:#fff;" data-email="<?= htmlspecialchars($user['email']) ?>" title="Send Reset Password Link">Reset</button>
              <button class="action-btn delete-btn" data-id="<?= $user['id'] ?>">Delete</button>
              <button class="action-btn archive-btn" style="background:#f0ad4e; color:#fff;" data-idnumber="<?= htmlspecialchars($user['id_number']) ?>">Archive</button>
            <?php else: ?>
              <button class="action-btn unarchive-btn" style="background:#5bc0de; color:#fff;" data-idnumber="<?= htmlspecialchars($user['id_number']) ?>">Unarchive</button>
            <?php endif; ?>
          </td>
        </tr>
      <?php endforeach; ?>
    <?php endif; ?>
  </tbody>
</table>
<?php
  $totalPages = max(1, (int)ceil($totalCount / $pageSize));
?>
<div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
  <div style="font-size:12px;color:#666;">Showing page <?= $page ?> of <?= $totalPages ?> • Total <?= $totalCount ?> users</div>
  <div style="display:flex;gap:6px;align-items:center;">
    <button class="action-btn" id="userPrevPage" <?= $page<=1?'disabled':''; ?>>Prev</button>
    <button class="action-btn" id="userNextPage" <?= $page>=$totalPages?'disabled':''; ?>>Next</button>
  </div>
</div>

<script>
  (function(){
    const prev = document.getElementById('userPrevPage');
    const next = document.getElementById('userNextPage');
    if (prev) prev.onclick = function(){ window.__userTablePage = (window.__userTablePage||<?= $page ?>) - 1; if (window.__userTablePage < 1) window.__userTablePage = 1; loadUsers(); };
    if (next) next.onclick = function(){ window.__userTablePage = (window.__userTablePage||<?= $page ?>) + 1; loadUsers(); };
    const exportBtn = document.getElementById('exportCsvBtn');
    if (exportBtn) exportBtn.onclick = function(){
      const search = encodeURIComponent(document.getElementById('userSearchInput').value);
      const role = encodeURIComponent(document.getElementById('userRoleSelect').value);
      const status = encodeURIComponent(document.getElementById('userStatusSelect').value);
      const sortBy = encodeURIComponent(document.getElementById('userSortBy').value);
      const sortDir = encodeURIComponent(document.getElementById('userSortDir').value);
      const url = 'user_table_export.php?search=' + search + '&role=' + role + '&status=' + status + '&sortBy=' + sortBy + '&sortDir=' + sortDir;
      window.open(url, '_blank');
    };
    
    // Handle reset password buttons
    document.querySelectorAll('.reset-password-btn').forEach(btn => {
      btn.onclick = function() {
        const email = this.getAttribute('data-email');
        if (!email) return;
        
        if (!confirm(`Send password reset link to ${email}?`)) return;
        
        const formData = new FormData();
        formData.append('action', 'send_reset_password');
        formData.append('email', email);
        
        fetch('user_action_ajax.php', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('Password reset link sent successfully!');
          } else {
            alert('Error: ' + (data.message || 'Failed to send reset link'));
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Error sending reset link. Please try again.');
        });
      };
    });
  })();
</script>
<style>
.pill {
  background: #e9f7ef;
  color: #1d9b3e;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  border: 1px solid #d2eedb;
  cursor: pointer;
}
.pill-archived { background:#f3f4f6; color:#6c757d; border-color:#e2e3e5; }
.pill:active { transform: translateY(1px); }

.users-table thead th { position: sticky; top: 0; background: #f4f6f9; z-index: 1; }
.users-table tbody tr { transition: background-color 0.2s ease; }
.users-table tbody tr:hover { background: #f9fbfd; }

.sortable { cursor: pointer; user-select: none; }
.sort-arrow { margin-left: 6px; font-size: 11px; opacity: 0.7; }

.search-hit { background: #fff59d; padding: 0 2px; border-radius: 2px; }

/* Dark mode overrides */
body.dark-mode .users-table thead th { background: #3a3a3a; color: #e0e0e0; }
body.dark-mode .users-table tbody tr:hover { background: #2b2b2b; }
body.dark-mode .pill { background: #233526; color: #4CAF50; border-color: #2f4a38; }
body.dark-mode .pill-archived { background: #2d2d2d; color: #bbb; border-color: #444; }
body.dark-mode .search-hit { background: #705f00; color: #fff; }
body.dark-mode .sort-arrow { color: #bbb; opacity: 0.9; }

.action-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.edit-btn {
  background: #1d9b3e;
  color: white;
}
.delete-btn {
  background: #dc3545;
  color: white;
}
.archive-btn:hover {
  background: #ec971f !important;
}
.unarchive-btn:hover {
  background: #31b0d5 !important;
}
</style>