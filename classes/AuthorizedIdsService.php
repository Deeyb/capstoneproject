<?php

class AuthorizedIdsService
{
    /** @var PDO */
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->ensureSchema();
    }

    private function ensureSchema(): void
    {
        try {
            // Make sure status column can store 'archived' (avoid ENUM truncation to empty string)
            $this->db->exec("ALTER TABLE authorized_ids MODIFY status VARCHAR(20) NOT NULL DEFAULT 'active'");
        } catch (Throwable $e) {
            // Ignore if cannot alter (no-op on hosts without permissions)
        }
        try {
            // Normalize any blank statuses to 'active' so they become visible again for re-archive
            $this->db->exec("UPDATE authorized_ids SET status = 'active' WHERE status IS NULL OR TRIM(status) = ''");
        } catch (Throwable $e) {
            // Ignore
        }
    }

    public function search(string $search = '', string $sortBy = 'id_number', string $sortDir = 'ASC', int $limit = 200, ?string $status = null): array
    {
        $allowedSort = [
            'id_number' => 'id_number',
            'status' => 'status',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
        ];
        $column = $allowedSort[strtolower($sortBy)] ?? 'id_number';
        $direction = strtoupper($sortDir) === 'DESC' ? 'DESC' : 'ASC';

        // Normalize blank statuses to 'active' at read time so the UI reflects a sensible default
        $sql = "SELECT id, id_number, COALESCE(NULLIF(TRIM(status), ''), 'active') AS status, created_at, updated_at FROM authorized_ids WHERE 1=1";
        $params = [];
        if ($search !== '') {
            $sql .= " AND (id_number LIKE ? OR status LIKE ?)";
            $term = "%$search%"; $params[] = $term; $params[] = $term;
        }
        if ($status !== null && $status !== '') {
            $sql .= " AND LOWER(TRIM(status)) = LOWER(TRIM(?))";
            $params[] = $status;
        }
        $sql .= " ORDER BY $column $direction LIMIT " . max(1, (int)$limit);

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(string $idNumber, string $status = 'active'): void
    {
        $status = $status !== '' ? $status : 'active';
        $stmt = $this->db->prepare(
            'INSERT INTO authorized_ids (id_number, status) VALUES (?, ?) 
             ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = NOW()'
        );
        $stmt->execute([$idNumber, $status]);
    }

    public function updateStatus(int $id, string $status): void
    {
        $status = trim($status);
        if ($status === '') {
            $status = 'active';
        }
        $stmt = $this->db->prepare('UPDATE authorized_ids SET status = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$status, $id]);
    }

    public function updateIdNumber(int $id, string $newIdNumber): void
    {
        if ($newIdNumber === '' || !preg_match('/^KLD-\d{2}-\d{6}$/', $newIdNumber)) {
            throw new InvalidArgumentException('Invalid ID number format');
        }
        $stmt = $this->db->prepare('UPDATE authorized_ids SET id_number = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$newIdNumber, $id]);
    }

    public function bulkDelete(array $ids): void
    {
        if (empty($ids)) { return; }
        $ids = array_values(array_map('intval', $ids));
        $in = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $this->db->prepare("DELETE FROM authorized_ids WHERE id IN ($in)");
        $stmt->execute($ids);
    }

    public function importFromCsv(string $tmpFile): array
    {
        $fh = fopen($tmpFile, 'r');
        if (!$fh) {
            throw new RuntimeException('Failed to read file');
        }

        $header = fgetcsv($fh);
        if (!$header) {
            throw new InvalidArgumentException('Empty CSV');
        }

        $normalize = function ($s) {
            $s = preg_replace('/^\xEF\xBB\xBF/', '', $s ?? '');
            $s = strtolower(trim($s));
            $s = preg_replace('/[^a-z0-9]+/', '', $s);
            return $s;
        };
        $normalized = array_map($normalize, $header);
        $colId = array_search('idnumber', $normalized);
        $colStatus = array_search('status', $normalized);
        if ($colId === false) {
            throw new InvalidArgumentException('CSV must have an id_number column');
        }

        $insert = $this->db->prepare(
            'INSERT INTO authorized_ids (id_number, status) VALUES (?, ?) 
             ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = NOW()'
        );

        $count = 0; $invalid = 0; $inserted = 0; $updated = 0; $unchanged = 0;
        while (($row = fgetcsv($fh)) !== false) {
            if (count($row) == 1 && trim($row[0]) === '') { continue; }
            $id = trim($row[$colId] ?? '');
            if ($id === '' || !preg_match('/^KLD-\d{2}-\d{6}$/', $id)) { $invalid++; continue; }
            $status = trim($row[$colStatus] ?? 'active');
            if ($status === '') { $status = 'active'; }
            $insert->execute([$id, $status]);
            $count++;
            $affected = $insert->rowCount();
            if ($affected === 1) { $inserted++; }
            elseif ($affected === 2) { $updated++; }
            else { $unchanged++; }
        }
        fclose($fh);

        return [
            'processed' => $count,
            'inserted' => $inserted,
            'updated' => $updated,
            'unchanged' => $unchanged,
            'invalid' => $invalid,
        ];
    }
}

?>


