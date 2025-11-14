<?php
/**
 * Fix Content Migration Issues
 * This script diagnoses and fixes issues with content files after migration
 */

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/auth_helpers.php';

// Start session for authentication check
if (session_status() === PHP_SESSION_NONE) {
    $sessionPath = __DIR__ . '/sessions';
    if (!is_dir($sessionPath)) {
        @mkdir($sessionPath, 0777, true);
    }
    if (is_dir($sessionPath) && is_writable($sessionPath)) {
        ini_set('session.save_path', $sessionPath);
    }
    @session_start();
}

$db = (new Database())->getConnection();
$pagesDir = __DIR__ . '/uploads/materials/pages';

// Get all page materials from database
$stmt = $db->query("SELECT id, lesson_id, filename, url, type FROM lesson_materials WHERE (type = 'page' OR url LIKE 'material_page_view.php%') ORDER BY id");
$materials = $stmt->fetchAll(PDO::FETCH_ASSOC);

$issues = [];
$fixed = [];
$totalMaterials = count($materials);

echo "<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Fix Content Migration Issues</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #28a745; margin-bottom: 10px; }
        h2 { color: #333; margin-top: 30px; margin-bottom: 15px; }
        .issue { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 10px 0; border-radius: 4px; }
        .fixed { background: #d1fae5; border-left: 4px solid #28a745; padding: 15px; margin: 10px 0; border-radius: 4px; }
        .error { background: #fee; border-left: 4px solid #f44336; padding: 15px; margin: 10px 0; border-radius: 4px; }
        .info { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 10px 0; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: 600; color: #333; }
        .file-path { font-family: monospace; font-size: 12px; color: #666; }
        .status-ok { color: #4caf50; font-weight: bold; }
        .status-error { color: #f44336; font-weight: bold; }
        .btn { background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; margin: 10px 5px; }
        .btn:hover { background: #218838; }
        .btn-secondary { background: #6c757d; }
        .btn-secondary:hover { background: #5a6268; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class='container'>
        <h1>🔧 Fix Content Migration Issues</h1>
        <p>Diagnosing and fixing content file issues after migration...</p>";

// Check directory
if (!is_dir($pagesDir)) {
    echo "<div class='error'>
        <h3>❌ Directory Missing</h3>
        <p>The directory <code>uploads/materials/pages/</code> does not exist!</p>
        <p>Creating directory...</p>";
    if (@mkdir($pagesDir, 0755, true)) {
        echo "<p class='status-ok'>✅ Directory created successfully!</p>";
    } else {
        echo "<p class='status-error'>❌ Failed to create directory. Check permissions.</p>";
    }
    echo "</div>";
} else {
    echo "<div class='info'><p>✅ Directory exists: <code>" . htmlspecialchars($pagesDir) . "</code></p></div>";
}

// Check each material
foreach ($materials as $mat) {
    $url = $mat['url'] ?? '';
    $materialId = $mat['id'];
    $filename = $mat['filename'] ?? 'Untitled';
    
    // Extract filename from URL
    if (preg_match('/material_page_view\.php\?f=([^&]+)/', $url, $matches)) {
        $fileId = urldecode($matches[1]);
        $filePath = $pagesDir . '/' . $fileId;
        
        // Check if file exists
        if (!file_exists($filePath)) {
            $issues[] = [
                'id' => $materialId,
                'title' => $filename,
                'file' => $fileId,
                'issue' => 'File not found',
                'path' => $filePath
            ];
        } else {
            // Check file permissions
            if (!is_readable($filePath)) {
                $issues[] = [
                    'id' => $materialId,
                    'title' => $filename,
                    'file' => $fileId,
                    'issue' => 'File not readable (permission issue)',
                    'path' => $filePath
                ];
                
                // Try to fix permissions
                if (@chmod($filePath, 0644)) {
                    $fixed[] = [
                        'id' => $materialId,
                        'title' => $filename,
                        'file' => $fileId,
                        'fix' => 'Fixed file permissions'
                    ];
                }
            } else {
                // Check if file is empty
                $content = @file_get_contents($filePath);
                if ($content === false || trim($content) === '') {
                    $issues[] = [
                        'id' => $materialId,
                        'title' => $filename,
                        'file' => $fileId,
                        'issue' => 'File is empty or cannot be read',
                        'path' => $filePath
                    ];
                } else {
                    // File exists and has content - check URL encoding
                    $testUrl = 'material_page_view.php?f=' . rawurlencode($fileId);
                    if ($url !== $testUrl) {
                        $issues[] = [
                            'id' => $materialId,
                            'title' => $filename,
                            'file' => $fileId,
                            'issue' => 'URL encoding mismatch',
                            'current_url' => $url,
                            'expected_url' => $testUrl
                        ];
                        
                        // Fix URL in database
                        $updateStmt = $db->prepare("UPDATE lesson_materials SET url = ? WHERE id = ?");
                        if ($updateStmt->execute([$testUrl, $materialId])) {
                            $fixed[] = [
                                'id' => $materialId,
                                'title' => $filename,
                                'file' => $fileId,
                                'fix' => 'Fixed URL encoding in database'
                            ];
                        }
                    }
                }
            }
        }
    } else {
        $issues[] = [
            'id' => $materialId,
            'title' => $filename,
            'file' => 'N/A',
            'issue' => 'Invalid URL format',
            'url' => $url
        ];
    }
}

// Display results
echo "<h2>📊 Summary</h2>
<div class='info'>
    <p><strong>Total Materials:</strong> {$totalMaterials}</p>
    <p><strong>Issues Found:</strong> " . count($issues) . "</p>
    <p><strong>Issues Fixed:</strong> " . count($fixed) . "</p>
</div>";

// Show fixed issues
if (count($fixed) > 0) {
    echo "<h2>✅ Fixed Issues</h2>";
    foreach ($fixed as $fix) {
        echo "<div class='fixed'>
            <p><strong>Material ID {$fix['id']}:</strong> {$fix['title']}</p>
            <p><strong>File:</strong> <code>{$fix['file']}</code></p>
            <p><strong>Fix Applied:</strong> {$fix['fix']}</p>
        </div>";
    }
}

// Show remaining issues
if (count($issues) > 0) {
    echo "<h2>⚠️ Remaining Issues</h2>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Title</th>
                <th>File</th>
                <th>Issue</th>
                <th>Details</th>
            </tr>
        </thead>
        <tbody>";
    
    foreach ($issues as $issue) {
        echo "<tr>
            <td>{$issue['id']}</td>
            <td>" . htmlspecialchars($issue['title']) . "</td>
            <td class='file-path'>" . htmlspecialchars($issue['file']) . "</td>
            <td class='status-error'>{$issue['issue']}</td>
            <td>";
        
        if (isset($issue['path'])) {
            echo "<code>" . htmlspecialchars($issue['path']) . "</code>";
        } elseif (isset($issue['current_url'])) {
            echo "<p><strong>Current:</strong> <code>" . htmlspecialchars($issue['current_url']) . "</code></p>";
            echo "<p><strong>Expected:</strong> <code>" . htmlspecialchars($issue['expected_url']) . "</code></p>";
        } elseif (isset($issue['url'])) {
            echo "<code>" . htmlspecialchars($issue['url']) . "</code>";
        }
        
        echo "</td></tr>";
    }
    
    echo "</tbody></table>";
} else {
    echo "<div class='info'>
        <h3>✅ No Issues Found!</h3>
        <p>All content files are present and accessible.</p>
        <p>If you're still seeing 'not found' errors, try:</p>
        <ul>
            <li>Hard refresh (Ctrl + F5)</li>
            <li>Clear browser cache</li>
            <li>Check browser console (F12) for JavaScript errors</li>
            <li>Check Apache error log: <code>C:\\xampp\\apache\\logs\\error.log</code></li>
        </ul>
    </div>";
}

// Test direct access
echo "<h2>🧪 Test Direct Access</h2>
<div class='info'>
    <p>Try accessing these URLs directly in your browser:</p>
    <ul>";

$testCount = 0;
foreach ($materials as $mat) {
    if ($testCount >= 3) break; // Show only first 3
    $url = $mat['url'] ?? '';
    if (preg_match('/material_page_view\.php\?f=([^&]+)/', $url, $matches)) {
        $fileId = urldecode($matches[1]);
        $testUrl = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/material_page_view.php?f=' . rawurlencode($fileId);
        echo "<li><a href='" . htmlspecialchars($testUrl) . "' target='_blank'>" . htmlspecialchars($mat['filename']) . "</a></li>";
        $testCount++;
    }
}

echo "</ul>
    <p>If these links work, the issue is in the frontend JavaScript code.</p>
    <p>If these links don't work, check:</p>
    <ul>
        <li>File permissions</li>
        <li>Apache/XAMPP configuration</li>
        <li>PHP error log</li>
    </ul>
</div>";

echo "</div></body></html>";
?>



