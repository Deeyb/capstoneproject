<?php
/**
 * List all files in materials folder
 */

$sourceDir = __DIR__ . '/materials';

echo "=== Files in materials/ folder ===\n\n";

if (!is_dir($sourceDir)) {
    echo "❌ Directory not found: {$sourceDir}\n";
    exit(1);
}

$files = scandir($sourceDir);
$imageFiles = [];
$otherFiles = [];

$imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];

foreach ($files as $file) {
    if ($file === '.' || $file === '..') continue;
    
    $fullPath = $sourceDir . '/' . $file;
    if (is_dir($fullPath)) {
        echo "📁 Folder: {$file}/\n";
        // Check subdirectory
        $subFiles = scandir($fullPath);
        foreach ($subFiles as $subFile) {
            if ($subFile === '.' || $subFile === '..') continue;
            echo "   └─ {$subFile}\n";
        }
    } else {
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (in_array($ext, $imageExtensions)) {
            $imageFiles[] = $file;
        } else {
            $otherFiles[] = $file;
        }
    }
}

echo "\n=== Image Files (" . count($imageFiles) . ") ===\n";
if (empty($imageFiles)) {
    echo "❌ No image files found!\n";
} else {
    foreach ($imageFiles as $file) {
        $size = filesize($sourceDir . '/' . $file);
        $sizeKB = round($size / 1024, 2);
        echo "✅ {$file} ({$sizeKB} KB)\n";
    }
}

if (!empty($otherFiles)) {
    echo "\n=== Other Files (" . count($otherFiles) . ") ===\n";
    foreach ($otherFiles as $file) {
        echo "📄 {$file}\n";
    }
}

echo "\n=== Instructions ===\n";
echo "1. Make sure all flowchart images are in: {$sourceDir}\n";
echo "2. Run: php prepare_flowchart_images.php\n";
echo "3. Copy the markdown syntax and update TOPIC_C_FLOWCHART.md\n";
?>


