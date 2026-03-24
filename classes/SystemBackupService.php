<?php

/**
 * SystemBackupService
 *
 * Generates on-demand SQL snapshots of the active database and
 * manages the backup directory (listing, deleting, resolving downloads).
 */

require_once __DIR__ . '/EnvironmentLoader.php';

class SystemBackupService
{
    /** @var PDO */
    protected $db;

    /** @var string */
    protected $backupDir;

    /** @var string */
    protected $databaseName;

    public function __construct(PDO $db, ?string $backupDir = null)
    {
        $this->db = $db;
        $this->backupDir = $backupDir ?: __DIR__ . '/../storage/backups';
        if (!is_dir($this->backupDir)) {
            @mkdir($this->backupDir, 0775, true);
        }

        EnvironmentLoader::load();
        $this->databaseName = EnvironmentLoader::get('DB_NAME', $this->detectDatabaseName());
    }

    /**
     * Create a new SQL backup file (optionally zipped) and return metadata.
     */
    public function createBackup(): array
    {
        @set_time_limit(0);

        $start = microtime(true);
        $timestamp = date('Ymd_His');
        $sqlFilename = "coderegal_backup_{$timestamp}.sql";
        $sqlFilepath = $this->backupDir . '/' . $sqlFilename;

        $tables = $this->fetchTables();
        $tableCount = count($tables);
        $rowCount = 0;

        $sqlHeader = $this->buildHeaderComment();
        file_put_contents($sqlFilepath, $sqlHeader);

        foreach ($tables as $table) {
            $createStatement = $this->getCreateTableStatement($table);
            file_put_contents($sqlFilepath, $createStatement, FILE_APPEND);

            $rowsWritten = $this->exportTableRows($table, $sqlFilepath);
            $rowCount += $rowsWritten;
        }

        file_put_contents($sqlFilepath, "SET FOREIGN_KEY_CHECKS=1;\n", FILE_APPEND);

        $finalPath = $sqlFilepath;
        $finalName = $sqlFilename;
        $isZipped = false;

        if (class_exists('ZipArchive')) {
            $zipName = "coderegal_backup_{$timestamp}.zip";
            $zipPath = $this->backupDir . '/' . $zipName;

            $zip = new ZipArchive();
            if ($zip->open($zipPath, ZipArchive::CREATE) === true) {
                $zip->addFile($sqlFilepath, $sqlFilename);
                $zip->addFromString('manifest.json', json_encode([
                    'database' => $this->databaseName,
                    'generated_at' => date(DATE_ISO8601),
                    'tables' => $tableCount,
                    'rows' => $rowCount,
                ], JSON_PRETTY_PRINT));
                $zip->close();

                @unlink($sqlFilepath);
                $finalPath = $zipPath;
                $finalName = $zipName;
                $isZipped = true;
            }
        }

        $durationMs = (int) round((microtime(true) - $start) * 1000);

        return [
            'success' => true,
            'file_name' => $finalName,
            'file_size_bytes' => is_file($finalPath) ? filesize($finalPath) : 0,
            'file_size_readable' => $this->formatBytes(is_file($finalPath) ? filesize($finalPath) : 0),
            'file_path' => $finalPath,
            'duration_ms' => $durationMs,
            'tables' => $tableCount,
            'rows' => $rowCount,
            'zipped' => $isZipped,
            'directory' => $this->backupDir,
        ];
    }

    /**
     * Return an array of backup files with metadata plus summary stats.
     */
    public function listBackups(): array
    {
        $files = array_merge(
            glob($this->backupDir . '/*.zip') ?: [],
            glob($this->backupDir . '/*.sql') ?: []
        );

        $entries = [];
        $totalSize = 0;

        foreach ($files as $file) {
            $entries[] = [
                'name' => basename($file),
                'path' => $file,
                'size_bytes' => filesize($file),
                'size_readable' => $this->formatBytes(filesize($file)),
                'created_at' => filemtime($file),
                'created_human' => date('M d, Y h:i A', filemtime($file)),
                'type' => strtolower(pathinfo($file, PATHINFO_EXTENSION)),
            ];
            $totalSize += filesize($file);
        }

        usort($entries, function ($a, $b) {
            return $b['created_at'] <=> $a['created_at'];
        });

        return [
            'files' => $entries,
            'stats' => [
                'count' => count($entries),
                'total_size_bytes' => $totalSize,
                'total_size_readable' => $this->formatBytes($totalSize),
                'last_created_at' => $entries ? $entries[0]['created_at'] : null,
                'last_file' => $entries ? $entries[0] : null,
                'directory' => $this->backupDir,
                'database' => $this->databaseName,
            ],
        ];
    }

    /**
     * Delete a backup file by name.
     */
    public function deleteBackup(string $fileName): bool
    {
        $filePath = $this->resolveBackupPath($fileName);
        if (!$filePath || !file_exists($filePath)) {
            return false;
        }
        return @unlink($filePath);
    }

    /**
     * Resolve a safe absolute path for a backup file name.
     */
    public function resolveBackupPath(string $fileName): ?string
    {
        $cleanName = basename($fileName);
        if (!$cleanName) {
            return null;
        }
        $path = realpath($this->backupDir . '/' . $cleanName);
        if (!$path) {
            return null;
        }
        // Prevent directory traversal
        if (strpos($path, realpath($this->backupDir)) !== 0) {
            return null;
        }
        return $path;
    }

    /**
     * Build SQL header comment with metadata.
     */
    protected function buildHeaderComment(): string
    {
        $header = "-- ===============================================\n";
        $header .= "-- CodeRegal LMS Database Backup\n";
        $header .= "-- Generated: " . date('Y-m-d H:i:s') . "\n";
        $header .= "-- Database: " . $this->databaseName . "\n";
        $header .= "-- ===============================================\n";
        $header .= "SET FOREIGN_KEY_CHECKS=0;\n\n";
        return $header;
    }

    /**
     * Export all rows of a table into INSERT statements appended to the SQL file.
     */
    protected function exportTableRows(string $table, string $sqlFilepath): int
    {
        $rowCount = 0;
        $tableQuoted = $this->quoteIdentifier($table);
        $stmt = $this->db->query("SELECT * FROM {$tableQuoted}");
        if (!$stmt) {
            return 0;
        }

        while (($row = $stmt->fetch(PDO::FETCH_ASSOC)) !== false) {
            $columns = array_map([$this, 'quoteIdentifier'], array_keys($row));
            $values = array_map(function ($value) {
                if ($value === null) {
                    return 'NULL';
                }
                return $this->db->quote($value);
            }, array_values($row));

            $insert = sprintf(
                "INSERT INTO %s (%s) VALUES (%s);\n",
                $tableQuoted,
                implode(', ', $columns),
                implode(', ', $values)
            );

            file_put_contents($sqlFilepath, $insert, FILE_APPEND);
            $rowCount++;
        }

        file_put_contents($sqlFilepath, "\n", FILE_APPEND);
        return $rowCount;
    }

    /**
     * Get the table creation SQL plus drop statement.
     */
    protected function getCreateTableStatement(string $table): string
    {
        $tableQuoted = $this->quoteIdentifier($table);
        $stmt = $this->db->query("SHOW CREATE TABLE {$tableQuoted}");
        $row = $stmt ? $stmt->fetch(PDO::FETCH_ASSOC) : null;
        $create = $row ? ($row['Create Table'] ?? $row['Create Table ']) : '';
        $sql = "-- --------------------------------------------------\n";
        $sql .= "-- Structure for table {$tableQuoted}\n";
        $sql .= "-- --------------------------------------------------\n";
        $sql .= "DROP TABLE IF EXISTS {$tableQuoted};\n";
        $sql .= $create . ";\n\n";
        return $sql;
    }

    /**
     * Fetch all tables for the active database.
     */
    protected function fetchTables(): array
    {
        $tables = [];
        $stmt = $this->db->query('SHOW TABLES');
        if ($stmt) {
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        }
        return $tables ?: [];
    }

    /**
     * Quote an identifier (table/column name) with backticks.
     */
    protected function quoteIdentifier(string $identifier): string
    {
        return '`' . str_replace('`', '``', $identifier) . '`';
    }

    /**
     * Attempt to detect the database name from the current PDO connection.
     */
    protected function detectDatabaseName(): string
    {
        try {
            $stmt = $this->db->query('SELECT DATABASE()');
            return $stmt ? (string) $stmt->fetchColumn() : 'coderegal_db';
        } catch (Throwable $e) {
            return 'coderegal_db';
        }
    }

    /**
     * Convert bytes to human-readable formatting.
     */
    protected function formatBytes($bytes, int $precision = 2): string
    {
        if (!$bytes) {
            return '0 B';
        }
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $power = (int) floor(log($bytes, 1024));
        $power = min($power, count($units) - 1);
        $value = $bytes / pow(1024, $power);
        return round($value, $precision) . ' ' . $units[$power];
    }
}


