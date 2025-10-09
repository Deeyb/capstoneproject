<?php
// CSV export for User Management table
ini_set('display_errors', 0);
error_reporting(E_ALL);

session_start();
if (!isset($_SESSION['user_role']) || strtoupper($_SESSION['user_role']) !== 'ADMIN') {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/UserManager.php';

$db = (new Database())->getConnection();
$userManager = new UserManager($db);

// Read filters
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$role_filter = isset($_GET['role']) ? trim($_GET['role']) : '';
$status_filter = isset($_GET['status']) ? trim($_GET['status']) : '';
$sortBy = isset($_GET['sortBy']) ? $_GET['sortBy'] : 'firstname';
$sortDir = isset($_GET['sortDir']) ? $_GET['sortDir'] : 'ASC';

// Fetch a large batch (adjust as needed)
$maxRows = 100000; // safety cap
$users = $userManager->getAllUsers($search, $role_filter, $status_filter, 0, $maxRows, $sortBy, $sortDir);

// Output headers
$filename = 'users_export_' . date('Ymd_His') . '.csv';
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=' . $filename);
header('Pragma: no-cache');
header('Expires: 0');

$out = fopen('php://output', 'w');

// Header row
fputcsv($out, [
    'Name',
    'Role',
    'Email',
    'ID Number',
    'Status',
    'Created At',
    'Last Login'
]);

// Helper: Title case a role value
$toTitle = function ($value) {
    $v = strtolower((string)$value);
    if ($v === '') return '';
    return ucfirst($v);
};

foreach ($users as $u) {
    $lastname = $u['lastname'] ?? '';
    $firstname = $u['firstname'] ?? '';
    $middlename = $u['middlename'] ?? '';
    $mi = $middlename ? strtoupper(mb_substr(trim($middlename), 0, 1)) . '.' : '';
    $name = trim($lastname . ', ' . $firstname . ' ' . $mi);

    fputcsv($out, [
        $name,
        $toTitle($u['role'] ?? ''),
        $u['email'] ?? '',
        $u['id_number'] ?? '',
        $u['status'] ?? '',
        $u['created_at'] ?? '',
        $u['last_login'] ?? ''
    ]);
}

fclose($out);
exit;
?>


