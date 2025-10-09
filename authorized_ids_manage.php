<?php
session_start();
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/AuthorizedIdsService.php';
require_once __DIR__ . '/classes/AuditLogService.php';

header('Content-Type: application/json');

// Admin-only
if (!isset($_SESSION['user_role']) || strtoupper($_SESSION['user_role']) !== 'ADMIN') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    $db = (new Database())->getConnection();
    $service = new AuthorizedIdsService($db);
    $audit = new AuditLogService($db);

    $action = $_POST['action'] ?? '';
    switch ($action) {
        case 'create':
            $idnum = trim($_POST['id_number'] ?? '');
            $status = trim($_POST['status'] ?? 'active');
            if ($idnum !== '' && preg_match('/^KLD-\d{2}-\d{6}$/', $idnum)) {
                $service->create($idnum, $status !== '' ? $status : 'active');
                $audit->log($_SESSION['user_id'] ?? null, 'auth_ids.create', 'authorized_id', $idnum);
                echo json_encode(['success' => true]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid ID number']);
            }
            break;
        case 'update_status':
            $id = (int)($_POST['id'] ?? 0);
            $status = trim($_POST['status'] ?? 'active');
            $service->updateStatus($id, $status !== '' ? $status : 'active');
            $audit->log($_SESSION['user_id'] ?? null, 'auth_ids.update_status', 'authorized_id', (string)$id, ['status'=>$status]);
            echo json_encode(['success' => true]);
            break;
        case 'archive':
            $id = (int)($_POST['id'] ?? 0);
            // Force exact archived string; guard against DB enum truncation
            $service->updateStatus($id, 'archived');
            $audit->log($_SESSION['user_id'] ?? null, 'auth_ids.archive', 'authorized_id', (string)$id);
            echo json_encode(['success' => true]);
            break;
        case 'unarchive':
            $id = (int)($_POST['id'] ?? 0);
            $service->updateStatus($id, 'active');
            $audit->log($_SESSION['user_id'] ?? null, 'auth_ids.unarchive', 'authorized_id', (string)$id);
            echo json_encode(['success' => true]);
            break;
        case 'edit':
            $id = (int)($_POST['id'] ?? 0);
            $newId = trim($_POST['id_number'] ?? '');
            $service->updateIdNumber($id, $newId);
            $audit->log($_SESSION['user_id'] ?? null, 'auth_ids.edit', 'authorized_id', (string)$id, ['new_id'=>$newId]);
            echo json_encode(['success' => true]);
            break;
        case 'delete':
            $id = (int)($_POST['id'] ?? 0);
            $service->bulkDelete([$id]);
            $audit->log($_SESSION['user_id'] ?? null, 'auth_ids.delete', 'authorized_id', (string)$id);
            echo json_encode(['success' => true]);
            break;
        case 'bulk_delete':
            $ids = json_decode($_POST['ids'] ?? '[]', true);
            if (!is_array($ids)) $ids = [];
            $service->bulkDelete($ids);
            $audit->log($_SESSION['user_id'] ?? null, 'auth_ids.bulk_delete', 'authorized_id', null, ['ids'=>$ids]);
            echo json_encode(['success' => true]);
            break;
        case 'bulk_archive':
            $ids = json_decode($_POST['ids'] ?? '[]', true);
            if (!is_array($ids)) $ids = [];
            foreach ($ids as $rid) {
                $service->updateStatus((int)$rid, 'archived');
            }
            $audit->log($_SESSION['user_id'] ?? null, 'auth_ids.bulk_archive', 'authorized_id', null, ['count'=>count($ids)]);
            echo json_encode(['success' => true]);
            break;
        case 'bulk_unarchive':
            $ids = json_decode($_POST['ids'] ?? '[]', true);
            if (!is_array($ids)) $ids = [];
            foreach ($ids as $rid) {
                $service->updateStatus((int)$rid, 'active');
            }
            $audit->log($_SESSION['user_id'] ?? null, 'auth_ids.bulk_unarchive', 'authorized_id', null, ['count'=>count($ids)]);
            echo json_encode(['success' => true]);
            break;
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>

