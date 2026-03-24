<?php
// Admin backup endpoint: create, list, download, delete backups

$sessionPath = __DIR__ . '/sessions';
if (!is_dir($sessionPath)) {
    @mkdir($sessionPath, 0777, true);
}
if (is_dir($sessionPath) && is_writable($sessionPath)) {
    ini_set('session.save_path', $sessionPath);
}

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
    if (empty($_SESSION['user_id']) && !empty($_COOKIE[$legacy]) && session_name() !== $legacy) {
        @session_write_close();
        session_name($legacy);
        @session_id($_COOKIE[$legacy]);
        @session_start();
    }
}

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/auth_helpers.php';
require_once __DIR__ . '/classes/SystemBackupService.php';

Auth::requireAuth();
Auth::requireRole('admin');

$db = (new Database())->getConnection();
if (!$db) {
    jsonResponse(['success' => false, 'message' => 'Database connection failed.'], 500);
}

$service = new SystemBackupService($db);
$action = $_REQUEST['action'] ?? 'create';

switch ($action) {
    case 'list':
        $data = $service->listBackups();
        jsonResponse([
            'success' => true,
            'files' => $data['files'],
            'stats' => $data['stats'],
            'zip_supported' => class_exists('ZipArchive'),
        ]);
        break;

    case 'create':
        try {
            $result = $service->createBackup();
            jsonResponse([
                'success' => true,
                'message' => 'Backup created successfully.',
                'backup' => [
                    'name' => $result['file_name'],
                    'size_bytes' => $result['file_size_bytes'],
                    'size_readable' => $result['file_size_readable'],
                    'duration_ms' => $result['duration_ms'],
                    'tables' => $result['tables'],
                    'rows' => $result['rows'],
                    'zipped' => $result['zipped'],
                ],
            ]);
        } catch (Throwable $e) {
            jsonResponse([
                'success' => false,
                'message' => 'Backup failed: ' . $e->getMessage(),
            ], 500);
        }
        break;

    case 'delete':
        $file = $_POST['file'] ?? '';
        if (!$file) {
            jsonResponse(['success' => false, 'message' => 'Missing file parameter.'], 400);
        }
        $deleted = $service->deleteBackup($file);
        if ($deleted) {
            jsonResponse(['success' => true, 'message' => 'Backup deleted.']);
        }
        jsonResponse(['success' => false, 'message' => 'Backup not found.'], 404);
        break;

    case 'download':
        $file = $_GET['file'] ?? '';
        if (!$file) {
            http_response_code(400);
            exit('Missing file parameter.');
        }
        $path = $service->resolveBackupPath($file);
        if (!$path || !is_file($path)) {
            http_response_code(404);
            exit('Backup not found.');
        }
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($path) . '"');
        header('Content-Length: ' . filesize($path));
        header('Pragma: public');
        readfile($path);
        exit;

    default:
        jsonResponse(['success' => false, 'message' => 'Invalid action.'], 400);
}

function jsonResponse(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($payload);
    exit;
}


