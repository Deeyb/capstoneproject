<?php
/**
 * Diagnostic script to check for missing content files
 * This helps identify why existing content shows "not found" after moving to a new laptop
 */

require_once __DIR__ . '/config/Database.php';

$db = (new Database())->getConnection();

// Get all page materials from database
// Note: Some old entries have type = '' but URL contains material_page_view.php
$stmt = $db->query("SELECT id, lesson_id, filename, url, type FROM lesson_materials WHERE (type = 'page' OR url LIKE 'material_page_view.php%') ORDER BY id");
$materials = $stmt->fetchAll(PDO::FETCH_ASSOC);

$pagesDir = __DIR__ . '/uploads/materials/pages';
$missingFiles = [];
$foundFiles = [];
$totalMaterials = count($materials);

echo "<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Content File Diagnostic</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #28a745; margin-bottom: 10px; }
        h2 { color: #333; margin-top: 30px; margin-bottom: 15px; }
        .stats { display: flex; gap: 20px; margin: 20px 0; }
        .stat-box { flex: 1; padding: 15px; border-radius: 6px; text-align: center; }
        .stat-box.total { background: #e3f2fd; border: 2px solid #2196f3; }
        .stat-box.found { background: #e8f5e9; border: 2px solid #4caf50; }
        .stat-box.missing { background: #ffebee; border: 2px solid #f44336; }
        .stat-number { font-size: 32px; font-weight: bold; margin: 10px 0; }
        .stat-label { color: #666; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: 600; color: #333; }
        .status-found { color: #4caf50; font-weight: bold; }
        .status-missing { color: #f44336; font-weight: bold; }
        .file-path { font-family: monospace; font-size: 12px; color: #666; }
        .info-box { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .info-box h3 { margin-top: 0; color: #856404; }
        .info-box ul { margin: 10px 0; padding-left: 20px; }
        .info-box li { margin: 5px 0; }
        .action-btn { background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; margin-top: 20px; }
        .action-btn:hover { background: #218838; }
    </style>
</head>
<body>
    <div class='container'>
        <h1>🔍 Content File Diagnostic</h1>
        <p>Checking for missing content files after project migration...</p>";

// Check if pages directory exists
if (!is_dir($pagesDir)) {
    echo "<div class='info-box'>
        <h3>⚠️ Directory Missing</h3>
        <p>The directory <code>uploads/materials/pages/</code> does not exist!</p>
        <p>This directory should contain all the .md files for page materials.</p>
    </div>";
} else {
    echo "<p>✅ Directory exists: <code>" . htmlspecialchars($pagesDir) . "</code></p>";
}

// Extract filename from URL and check if file exists
foreach ($materials as $mat) {
    $url = $mat['url'] ?? '';
    
    // Extract filename from URL like: material_page_view.php?f=20251102_004340_1e075ae3_page.md
    if (preg_match('/material_page_view\.php\?f=([^&]+)/', $url, $matches)) {
        $filename = urldecode($matches[1]);
        $filePath = $pagesDir . '/' . $filename;
        
        if (file_exists($filePath)) {
            $foundFiles[] = [
                'id' => $mat['id'],
                'filename' => $mat['filename'],
                'file' => $filename,
                'size' => filesize($filePath),
                'path' => $filePath
            ];
        } else {
            $missingFiles[] = [
                'id' => $mat['id'],
                'filename' => $mat['filename'],
                'file' => $filename,
                'url' => $url,
                'expected_path' => $filePath
            ];
        }
    } else {
        // Invalid URL format
        $missingFiles[] = [
            'id' => $mat['id'],
            'filename' => $mat['filename'],
            'file' => 'INVALID_URL',
            'url' => $url,
            'expected_path' => 'N/A - Invalid URL format'
        ];
    }
}

// Display statistics
echo "<div class='stats'>
    <div class='stat-box total'>
        <div class='stat-number'>{$totalMaterials}</div>
        <div class='stat-label'>Total Materials</div>
    </div>
    <div class='stat-box found'>
        <div class='stat-number'>" . count($foundFiles) . "</div>
        <div class='stat-label'>Files Found</div>
    </div>
    <div class='stat-box missing'>
        <div class='stat-number'>" . count($missingFiles) . "</div>
        <div class='stat-label'>Files Missing</div>
    </div>
</div>";

// Show missing files
if (count($missingFiles) > 0) {
    echo "<h2>❌ Missing Files (" . count($missingFiles) . ")</h2>
    <div class='info-box'>
        <h3>Why are these files missing?</h3>
        <p>When you moved the project to a new laptop, the database was copied but the actual files in <code>uploads/materials/pages/</code> were not copied.</p>
        <p><strong>Solution:</strong></p>
        <ul>
            <li>Copy the <code>uploads/materials/pages/</code> folder from your old laptop to the new laptop</li>
            <li>OR recreate these content pages manually</li>
            <li>The files should be placed in: <code>" . htmlspecialchars($pagesDir) . "</code></li>
        </ul>
    </div>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Expected Filename</th>
                <th>Expected Path</th>
            </tr>
        </thead>
        <tbody>";
    
    foreach ($missingFiles as $missing) {
        echo "<tr>
            <td>{$missing['id']}</td>
            <td>" . htmlspecialchars($missing['filename']) . "</td>
            <td class='file-path'>" . htmlspecialchars($missing['file']) . "</td>
            <td class='file-path'>" . htmlspecialchars($missing['expected_path']) . "</td>
        </tr>";
    }
    
    echo "</tbody></table>";
} else {
    echo "<h2>✅ All Files Found!</h2>
    <p>All content files are present. If you're still seeing 'not found' errors, check:</p>
    <ul>
        <li>File permissions (files should be readable)</li>
        <li>Apache/XAMPP configuration</li>
        <li>Browser cache (try hard refresh: Ctrl+F5)</li>
    </ul>";
}

// Show found files (optional, for verification)
if (count($foundFiles) > 0 && count($missingFiles) > 0) {
    echo "<h2>✅ Found Files (" . count($foundFiles) . ")</h2>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Filename</th>
                <th>Size</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>";
    
    foreach ($foundFiles as $found) {
        echo "<tr>
            <td>{$found['id']}</td>
            <td>" . htmlspecialchars($found['filename']) . "</td>
            <td class='file-path'>" . htmlspecialchars($found['file']) . "</td>
            <td>" . number_format($found['size']) . " bytes</td>
            <td class='status-found'>✅ Found</td>
        </tr>";
    }
    
    echo "</tbody></table>";
}

echo "<div class='info-box'>
    <h3>📋 Summary</h3>
    <p><strong>Total Materials in Database:</strong> {$totalMaterials}</p>
    <p><strong>Files Found:</strong> " . count($foundFiles) . "</p>
    <p><strong>Files Missing:</strong> " . count($missingFiles) . "</p>
    <p><strong>Pages Directory:</strong> <code>" . htmlspecialchars($pagesDir) . "</code></p>
</div>";

echo "</div></body></html>";
?>

