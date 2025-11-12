<?php
/**
 * GENERATE CERTIFICATE PDF
 * Generates a PDF certificate for students who completed 100% of course activities
 */

// CRITICAL: Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Manual session handling
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
    
    if (empty($_SESSION['user_id'])) {
        $current = session_name();
        $alt = ($current === $preferred) ? $legacy : $preferred;
        if (!empty($_COOKIE[$alt])) {
            @session_write_close();
            session_name($alt);
            @session_id($_COOKIE[$alt]);
            @session_start();
        }
    }
}

require_once __DIR__ . '/config/Database.php';

// Check authentication
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    http_response_code(401);
    die('Unauthorized - Please log in');
}

$userId = (int)($_SESSION['user_id'] ?? 0);
$userRole = strtolower($_SESSION['user_role'] ?? '');

if ($userId <= 0 || $userRole !== 'student') {
    http_response_code(403);
    die('Access denied - Student role required');
}

$classId = (int)($_GET['class_id'] ?? 0);
$courseId = (int)($_GET['course_id'] ?? 0);

if ($classId <= 0 || $courseId <= 0) {
    http_response_code(400);
    die('Invalid class or course ID');
}

try {
    $db = (new Database())->getConnection();
    
    // Verify student is enrolled in this class
    $enrollmentStmt = $db->prepare("
        SELECT id FROM class_students 
        WHERE class_id = ? AND student_user_id = ?
    ");
    $enrollmentStmt->execute([$classId, $userId]);
    if (!$enrollmentStmt->fetch()) {
        http_response_code(403);
        die('You are not enrolled in this class');
    }
    
    // Get course information
    $courseStmt = $db->prepare("
        SELECT 
            c.id,
            c.title as course_title,
            c.code as course_code,
            c.language,
            c.description
        FROM courses c
        WHERE c.id = ?
        LIMIT 1
    ");
    $courseStmt->execute([$courseId]);
    $course = $courseStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$course) {
        http_response_code(404);
        die('Course not found');
    }
    
    // Count total activities
    $totalActivitiesStmt = $db->prepare("
        SELECT COUNT(DISTINCT la.id) as total
        FROM lesson_activities la
        INNER JOIN course_lessons cl ON la.lesson_id = cl.id
        INNER JOIN course_modules cm ON cl.module_id = cm.id
        INNER JOIN classes c ON cm.course_id = c.course_id
        WHERE c.id = ?
    ");
    $totalActivitiesStmt->execute([$classId]);
    $totalActivities = (int)$totalActivitiesStmt->fetchColumn();
    
    // Count completed activities
    $completedActivitiesStmt = $db->prepare("
        SELECT COUNT(DISTINCT aa.activity_id) as completed
        FROM activity_attempts aa
        INNER JOIN lesson_activities la ON aa.activity_id = la.id
        INNER JOIN course_lessons cl ON la.lesson_id = cl.id
        INNER JOIN course_modules cm ON cl.module_id = cm.id
        INNER JOIN classes c ON cm.course_id = c.course_id
        WHERE c.id = ? 
        AND aa.user_id = ?
        AND aa.submitted_at IS NOT NULL
        AND (aa.score IS NOT NULL OR EXISTS (
            SELECT 1 FROM activity_attempt_items aai 
            WHERE aai.attempt_id = aa.id 
            AND aai.points_awarded IS NOT NULL
        ))
    ");
    $completedActivitiesStmt->execute([$classId, $userId]);
    $completedActivities = (int)$completedActivitiesStmt->fetchColumn();
    
    // Verify 100% completion
    $progress = $totalActivities > 0 ? round(($completedActivities / $totalActivities) * 100, 1) : 0;
    
    // Certificate is only available when progress is 100%
    if ($progress < 100) {
        http_response_code(403);
        die('Certificate can only be downloaded after completing 100% of activities. Current progress: ' . $progress . '%');
    }
    
    // Get student information
    $userStmt = $db->prepare("
        SELECT 
            firstname,
            middlename,
            lastname,
            id_number
        FROM users
        WHERE id = ?
        LIMIT 1
    ");
    $userStmt->execute([$userId]);
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        die('User not found');
    }
    
    // Format student name
    $middleInitial = !empty($user['middlename']) ? ' ' . strtoupper(substr(trim($user['middlename']), 0, 1)) . '.' : '';
    $studentName = trim($user['firstname'] . $middleInitial . ' ' . $user['lastname']);
    
    // Get class information
    $classStmt = $db->prepare("
        SELECT name as class_name, code as class_code
        FROM classes
        WHERE id = ?
        LIMIT 1
    ");
    $classStmt->execute([$classId]);
    $class = $classStmt->fetch(PDO::FETCH_ASSOC);
    
    // Generate certificate date
    $certificateDate = date('F d, Y');
    
    // Path to certificate template image
    $certificateTemplatePath = __DIR__ . '/Green Achievement Certificate.jpg';
    
    // Check if template exists
    if (!file_exists($certificateTemplatePath)) {
        http_response_code(404);
        die('Certificate template not found. Please ensure "Green Achievement Certificate.jpg" exists in the project root.');
    }
    
    // Generate certificate as PDF (downloadable, professional format)
    // This creates a PDF that embeds the certificate image with student name
    generateCertificatePDF($certificateTemplatePath, $studentName, $course, $class, $certificateDate);
    
} catch (Exception $e) {
    error_log("Generate certificate error: " . $e->getMessage());
    http_response_code(500);
    die('Error generating certificate: ' . $e->getMessage());
}

function generateCertificateImage($templatePath, $studentName, $course, $class, $date) {
    // Check if GD library is available
    if (!extension_loaded('gd')) {
        error_log("GD library is not loaded. Please enable GD extension in php.ini");
        
        // Show clear error message instead of HTML fallback
        header('Content-Type: text/html; charset=utf-8');
        echo '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Certificate Generation Error</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
        .error-box { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; }
        h1 { color: #dc2626; margin-top: 0; }
        .code { background: #f3f4f6; padding: 15px; border-radius: 4px; font-family: monospace; margin: 15px 0; }
        ol { line-height: 1.8; }
    </style>
</head>
<body>
    <div class="error-box">
        <h1>⚠️ GD Library Not Enabled</h1>
        <p>The PHP GD library is required to generate certificates from the image template.</p>
        <p><strong>To enable GD library in XAMPP:</strong></p>
        <ol>
            <li>Open <code>php.ini</code> file (usually in <code>C:\xampp\php\php.ini</code>)</li>
            <li>Find the line: <code>;extension=gd</code></li>
            <li>Remove the semicolon to uncomment it: <code>extension=gd</code></li>
            <li>Save the file</li>
            <li>Restart Apache in XAMPP Control Panel</li>
        </ol>
        <div class="code">
            <strong>Quick fix:</strong><br>
            1. Open: C:\xampp\php\php.ini<br>
            2. Search for: extension=gd<br>
            3. Remove the semicolon (;) before it<br>
            4. Restart Apache
        </div>
        <p><strong>After enabling GD library, try downloading the certificate again.</strong></p>
    </div>
</body>
</html>';
        return;
    }
    
    // Check if image file exists
    if (!file_exists($templatePath)) {
        error_log("Certificate template not found: " . $templatePath);
        http_response_code(404);
        die('Certificate template image not found: ' . basename($templatePath));
    }
    
    // Load the certificate template image
    $imageInfo = @getimagesize($templatePath);
    if (!$imageInfo) {
        $error = error_get_last();
        error_log("Failed to get image info: " . ($error['message'] ?? 'Unknown error'));
        http_response_code(500);
        die('Failed to read certificate template. Please check if the image file is valid.');
    }
    
    $imageType = $imageInfo[2];
    
    // Create image resource based on type
    $template = false;
    switch ($imageType) {
        case IMAGETYPE_JPEG:
        case IMAGETYPE_JPEG2000:
            $template = @imagecreatefromjpeg($templatePath);
            break;
        case IMAGETYPE_PNG:
            $template = @imagecreatefrompng($templatePath);
            break;
        case IMAGETYPE_GIF:
            $template = @imagecreatefromgif($templatePath);
            break;
        default:
            error_log("Unsupported image type: " . $imageType);
            http_response_code(500);
            die('Unsupported image type. Please use JPEG, PNG, or GIF.');
    }
    
    if (!$template) {
        $error = error_get_last();
        error_log("Failed to create image resource: " . ($error['message'] ?? 'Unknown error'));
        http_response_code(500);
        die('Failed to load certificate template image. Please check PHP GD library configuration.');
    }
    
    // Get image dimensions
    $width = imagesx($template);
    $height = imagesy($template);
    
    // Log image dimensions for debugging
    error_log("DEBUG: Image dimensions - Width: $width, Height: $height");
    
    // Set text color to black for student name
    $textColor = imagecolorallocate($template, 0, 0, 0); // Black color
    
    // Font settings - prioritize Great Vibes font (free Google Font)
    // Great Vibes: Elegant handwritten style, perfect for certificates
    $fontPaths = [
        // 1. Great Vibes (PRIORITY - free Google Font)
        __DIR__ . '/fonts/GreatVibes-Regular.ttf',
        __DIR__ . '/fonts/Great-Vibes-Regular.ttf',
        __DIR__ . '/fonts/greatvibes-regular.ttf',
        __DIR__ . '/fonts/GreatVibes.ttf',
        // 2. Fallback handwritten fonts
        'C:/Windows/Fonts/BRUSHSCI.TTF',
        'C:/Windows/Fonts/brushsc.ttf',
        'C:/Windows/Fonts/LHANDW.TTF',
        __DIR__ . '/fonts/Caveat-Regular.ttf',
        __DIR__ . '/fonts/Satisfy-Regular.ttf',
        __DIR__ . '/fonts/DancingScript-Regular.ttf',
        // 3. Other fallback fonts
        __DIR__ . '/fonts/arial.ttf',
        __DIR__ . '/fonts/times.ttf',
        'C:/Windows/Fonts/arial.ttf',
        'C:/Windows/Fonts/times.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf',
        '/System/Library/Fonts/Supplemental/Times New Roman.ttf',
    ];
    
    $fontPath = null;
    $fontFound = false;
    foreach ($fontPaths as $path) {
        if (file_exists($path)) {
            $fontPath = $path;
            $fontFound = true;
            // Log which font is being used (for debugging)
            error_log("Certificate font found: " . basename($path));
            break;
        }
    }
    
    // Log which font is being used
    if ($fontFound) {
        $fontName = basename($fontPath);
        error_log("Using font: $fontName");
    } else {
        error_log("WARNING: No handwritten font found! Using fallback font");
    }
    
    // Font size - adjust based on name length AND image resolution
    // imagettftext uses points (1/72 inch), so we need to scale based on image size
    // For high-resolution images, we need larger font sizes
    $nameLength = strlen($studentName);
    
    // Base font size (increased significantly)
    if ($nameLength > 30) {
        $baseFontSize = 80; // Larger for long names
    } else if ($nameLength > 20) {
        $baseFontSize = 90;
    } else {
        $baseFontSize = 100; // Larger for shorter names - more prominent
    }
    
    // Scale font size based on image height (for high-res images)
    // Typical certificate is around 2000-3000px height, so scale accordingly
    // If image is very large, increase font size proportionally
    $scaleFactor = max(1.0, $height / 2000); // Scale up if image is larger than 2000px
    $fontSize = (int)($baseFontSize * $scaleFactor);
    
    // Log font size for debugging
    error_log("DEBUG: Student name: '$studentName', Length: $nameLength, Base font size: $baseFontSize, Scale factor: $scaleFactor, Final font size: $fontSize, Font path: " . ($fontPath ? basename($fontPath) : 'none'));
    
    // Calculate text position (center of image - FIXED alignment)
    // Based on the certificate template, position name in the blank space
    // Adjusted lower (pababa) for better positioning
    $textY = $height * 0.45; // 45% from top (moved down from 42%)
    
    // Add student name to image with PERFECT centering
    if ($fontPath && function_exists('imagettftext')) {
        $angle = 0;
        
        // Get accurate text bounding box
        $bbox = imagettfbbox($fontSize, $angle, $fontPath, $studentName);
        if ($bbox && is_array($bbox) && count($bbox) >= 8) {
            // Calculate actual text width (horizontal span)
            // bbox[4] = upper right X, bbox[0] = lower left X
            $textWidth = $bbox[4] - $bbox[0];
            
            // PERFECT horizontal centering
            $textX = ($width - $textWidth) / 2;
            
            // Calculate text height for vertical centering
            // bbox[1] = lower left Y (negative), bbox[5] = upper right Y (positive)
            $textHeight = $bbox[5] - $bbox[1];
            
            // For vertical centering: imagettftext uses baseline Y coordinate
            // We want the text centered at textY, so we need to adjust for baseline
            // The baseline is at bbox[1] (which is negative), so:
            // Desired center Y = textY
            // Baseline Y = textY - (textHeight / 2) - bbox[1]
            // But bbox[1] is negative, so we add it
            $baselineY = $textY - ($textHeight / 2) - $bbox[1];
            
            // Fine-tuning for better visual centering
            $baselineY = $baselineY - 3;
            
            // Log actual values being used for debugging
            error_log("DEBUG: Rendering text - Font size: $fontSize, X: " . (int)$textX . ", Y: " . (int)$baselineY . ", Width: $textWidth, Height: $textHeight");
            
            imagettftext($template, $fontSize, $angle, (int)$textX, (int)$baselineY, $textColor, $fontPath, $studentName);
        } else {
            // Fallback if bbox calculation fails - use simpler centering
            error_log("Bbox calculation failed, using fallback centering");
            $textX = $width / 2;
            error_log("DEBUG: Fallback rendering - Font size: $fontSize, X: " . (int)$textX . ", Y: " . (int)$textY);
            imagettftext($template, $fontSize, $angle, (int)$textX, (int)$textY, $textColor, $fontPath, $studentName);
        }
    } else {
        // Fallback to built-in font if TTF not available
        error_log("TTF font not available, using built-in font");
        $font = 5;
        $textWidth = imagefontwidth($font) * strlen($studentName);
        $textX = ($width - $textWidth) / 2;
        $textHeight = imagefontheight($font);
        $textY = $textY - ($textHeight / 2);
        imagestring($template, $font, (int)$textX, (int)$textY, $studentName, $textColor);
    }
    
    // Optional: Add course name or date if needed (adjust positions)
    // $courseText = $course['course_title'];
    // imagettftext($template, 24, 0, $width/2, $height*0.6, $textColor, $fontPath, $courseText);
    
    // Clear any output buffers before sending image
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    // Set headers for image download (MUST be before any output)
    header('Content-Type: image/jpeg');
    header('Content-Disposition: attachment; filename="Certificate_' . preg_replace('/[^a-z0-9]/i', '_', $course['course_title']) . '_' . preg_replace('/[^a-z0-9]/i', '_', $studentName) . '.jpg"');
    header('Cache-Control: no-cache, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    // Output the image
    $outputSuccess = @imagejpeg($template, null, 95); // 95 = high quality
    
    // Clean up
    imagedestroy($template);
    
    if (!$outputSuccess) {
        error_log("Failed to output JPEG image");
        http_response_code(500);
        die('Failed to generate certificate image.');
    }
    
    exit; // Stop execution after outputting image
}

/**
 * Generate PDF Certificate (Production-Ready)
 * Creates a downloadable PDF that embeds the certificate image with student name
 */
function generateCertificatePDF($templatePath, $studentName, $course, $class, $date) {
    // Check if GD library is available
    if (!extension_loaded('gd')) {
        error_log("GD library is not loaded. Please enable GD extension in php.ini");
        header('Content-Type: text/html; charset=utf-8');
        echo '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Certificate Generation Error</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
        .error-box { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; }
        h1 { color: #dc2626; margin-top: 0; }
        .code { background: #f3f4f6; padding: 15px; border-radius: 4px; font-family: monospace; margin: 15px 0; }
        ol { line-height: 1.8; }
    </style>
</head>
<body>
    <div class="error-box">
        <h1>⚠️ GD Library Not Enabled</h1>
        <p>The PHP GD library is required to generate certificates.</p>
        <p><strong>To enable GD library:</strong></p>
        <ol>
            <li>Open <code>php.ini</code> file</li>
            <li>Find: <code>;extension=gd</code></li>
            <li>Remove semicolon: <code>extension=gd</code></li>
            <li>Save and restart Apache</li>
        </ol>
    </div>
</body>
</html>';
        return;
    }
    
    // Check if image file exists
    if (!file_exists($templatePath)) {
        error_log("Certificate template not found: " . $templatePath);
        http_response_code(404);
        die('Certificate template image not found: ' . basename($templatePath));
    }
    
    // Step 1: Generate the certificate image with student name
    $certificateImage = generateCertificateImageData($templatePath, $studentName, $course, $class, $date);
    
    if (!$certificateImage) {
        error_log("Failed to generate certificate image");
        http_response_code(500);
        die('Failed to generate certificate image.');
    }
    
    // Step 2: Create PDF that embeds the certificate image
    generatePDFFromImageData($certificateImage, $studentName, $course);
}

/**
 * Generate certificate image data (returns image as string)
 */
function generateCertificateImageData($templatePath, $studentName, $course, $class, $date) {
    // Load the certificate template image
    $imageInfo = @getimagesize($templatePath);
    if (!$imageInfo) {
        error_log("Failed to get image info for: " . $templatePath);
        return false;
    }
    
    $imageType = $imageInfo[2];
    $template = false;
    
    switch ($imageType) {
        case IMAGETYPE_JPEG:
        case IMAGETYPE_JPEG2000:
            $template = @imagecreatefromjpeg($templatePath);
            break;
        case IMAGETYPE_PNG:
            $template = @imagecreatefrompng($templatePath);
            break;
        case IMAGETYPE_GIF:
            $template = @imagecreatefromgif($templatePath);
            break;
        default:
            error_log("Unsupported image type: " . $imageType);
            return false;
    }
    
    if (!$template) {
        error_log("Failed to create image resource");
        return false;
    }
    
    // Get image dimensions
    $width = imagesx($template);
    $height = imagesy($template);
    
    // Set text color to black for student name
    $textColor = imagecolorallocate($template, 0, 0, 0); // Black color
    
    // Font settings - prioritize Great Vibes font (free Google Font)
    // Great Vibes: Elegant handwritten style, perfect for certificates
    $fontPaths = [
        // 1. Great Vibes (PRIORITY - free Google Font)
        __DIR__ . '/fonts/GreatVibes-Regular.ttf',
        __DIR__ . '/fonts/Great-Vibes-Regular.ttf',
        __DIR__ . '/fonts/greatvibes-regular.ttf',
        __DIR__ . '/fonts/GreatVibes.ttf',
        // 2. Fallback handwritten fonts
        'C:/Windows/Fonts/BRUSHSCI.TTF',
        'C:/Windows/Fonts/brushsc.ttf',
        'C:/Windows/Fonts/LHANDW.TTF',
        __DIR__ . '/fonts/Caveat-Regular.ttf',
        __DIR__ . '/fonts/Satisfy-Regular.ttf',
        __DIR__ . '/fonts/DancingScript-Regular.ttf',
        // 3. Other fallback fonts
        __DIR__ . '/fonts/arial.ttf',
        __DIR__ . '/fonts/times.ttf',
        'C:/Windows/Fonts/arial.ttf',
        'C:/Windows/Fonts/times.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf',
        '/System/Library/Fonts/Supplemental/Times New Roman.ttf',
    ];
    
    $fontPath = null;
    $fontFound = false;
    foreach ($fontPaths as $path) {
        if (file_exists($path)) {
            $fontPath = $path;
            $fontFound = true;
            // Log which font is being used (for debugging)
            error_log("Certificate font found: " . basename($path));
            break;
        }
    }
    
    // Log which font is being used
    if ($fontFound) {
        $fontName = basename($fontPath);
        error_log("Using font: $fontName");
    } else {
        error_log("WARNING: No handwritten font found! Using fallback font");
    }
    
    // Font size based on name length (increased for better visibility)
    $nameLength = strlen($studentName);
    if ($nameLength > 30) {
        $fontSize = 80; // Larger for long names
    } else if ($nameLength > 20) {
        $fontSize = 90;
    } else {
        $fontSize = 100; // Larger for shorter names - more prominent
    }
    
    // Log font size for debugging
    error_log("DEBUG: Student name: '$studentName', Length: $nameLength, Font size: $fontSize, Font path: " . ($fontPath ? basename($fontPath) : 'none'));
    
    // Calculate text position (center of image - FIXED alignment)
    // Based on the certificate template, position name in the blank space
    // Adjusted lower (pababa) for better positioning
    $textY = $height * 0.45; // 45% from top (moved down from 42%)
    
    // Add student name to image with PERFECT centering
    if ($fontPath && function_exists('imagettftext')) {
        $angle = 0;
        
        // Get accurate text bounding box
        $bbox = imagettfbbox($fontSize, $angle, $fontPath, $studentName);
        if ($bbox && is_array($bbox) && count($bbox) >= 8) {
            // Calculate actual text width (horizontal span)
            // bbox[4] = upper right X, bbox[0] = lower left X
            $textWidth = $bbox[4] - $bbox[0];
            
            // PERFECT horizontal centering
            $textX = ($width - $textWidth) / 2;
            
            // Calculate text height for vertical centering
            // bbox[1] = lower left Y (negative), bbox[5] = upper right Y (positive)
            $textHeight = $bbox[5] - $bbox[1];
            
            // For vertical centering: imagettftext uses baseline Y coordinate
            // We want the text centered at textY, so we need to adjust for baseline
            // The baseline is at bbox[1] (which is negative), so:
            // Desired center Y = textY
            // Baseline Y = textY - (textHeight / 2) - bbox[1]
            // But bbox[1] is negative, so we add it
            $baselineY = $textY - ($textHeight / 2) - $bbox[1];
            
            // Fine-tuning for better visual centering
            $baselineY = $baselineY - 3;
            
            // Log actual values being used for debugging
            error_log("DEBUG: Rendering text - Font size: $fontSize, X: " . (int)$textX . ", Y: " . (int)$baselineY . ", Width: $textWidth, Height: $textHeight");
            
            imagettftext($template, $fontSize, $angle, (int)$textX, (int)$baselineY, $textColor, $fontPath, $studentName);
        } else {
            // Fallback if bbox calculation fails - use simpler centering
            error_log("Bbox calculation failed, using fallback centering");
            $textX = $width / 2;
            error_log("DEBUG: Fallback rendering - Font size: $fontSize, X: " . (int)$textX . ", Y: " . (int)$textY);
            imagettftext($template, $fontSize, $angle, (int)$textX, (int)$textY, $textColor, $fontPath, $studentName);
        }
    } else {
        // Fallback to built-in font if TTF not available
        error_log("TTF font not available, using built-in font");
        $font = 5;
        $textWidth = imagefontwidth($font) * strlen($studentName);
        $textX = ($width - $textWidth) / 2;
        $textHeight = imagefontheight($font);
        $textY = $textY - ($textHeight / 2);
        imagestring($template, $font, (int)$textX, (int)$textY, $studentName, $textColor);
    }
    
    // Capture image to string
    ob_start();
    imagejpeg($template, null, 95); // 95 = high quality
    $imageData = ob_get_clean();
    
    // Clean up
    imagedestroy($template);
    
    return $imageData;
}

/**
 * Generate PDF from image data
 * Creates a proper PDF document that embeds the certificate image
 */
function generatePDFFromImageData($imageData, $studentName, $course) {
    if (empty($imageData)) {
        error_log("Empty image data");
        http_response_code(500);
        die('Failed to generate certificate.');
    }
    
    // Get image dimensions from image data
    $imageInfo = @getimagesizefromstring($imageData);
    if (!$imageInfo) {
        error_log("Failed to get image info from string");
        http_response_code(500);
        die('Invalid image data.');
    }
    
    $imageWidth = $imageInfo[0];
    $imageHeight = $imageInfo[1];
    
    // PDF page size (A4 landscape: 842 x 595 points at 72 DPI)
    $pdfWidth = 842;
    $pdfHeight = 595;
    
    // Scale image to fit PDF page while maintaining aspect ratio
    $scaleX = $pdfWidth / $imageWidth;
    $scaleY = $pdfHeight / $imageHeight;
    $scale = min($scaleX, $scaleY);
    
    $scaledWidth = $imageWidth * $scale;
    $scaledHeight = $imageHeight * $scale;
    $xOffset = ($pdfWidth - $scaledWidth) / 2;
    $yOffset = ($pdfHeight - $scaledHeight) / 2;
    
    // Generate PDF structure
    $pdf = generateMinimalPDF($imageData, $scaledWidth, $scaledHeight, $xOffset, $yOffset, $imageWidth, $imageHeight);
    
    // Clear output buffers
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    // Set headers for PDF download
    $filename = 'Certificate_' . preg_replace('/[^a-z0-9]/i', '_', $course['course_title']) . '_' . preg_replace('/[^a-z0-9]/i', '_', $studentName) . '.pdf';
    
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: no-cache, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');
    header('Content-Length: ' . strlen($pdf));
    
    echo $pdf;
    exit;
}

/**
 * Generate minimal PDF structure that embeds JPEG image
 * This creates a valid PDF without external libraries
 */
function generateMinimalPDF($imageData, $width, $height, $x, $y, $imgWidth, $imgHeight) {
    // PDF objects
    $obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
    $obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
    $obj3 = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n";
    
    // Image object (JPEG embedded)
    $obj4 = "4 0 obj\n<< /Type /XObject /Subtype /Image /Width $imgWidth /Height $imgHeight /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " . strlen($imageData) . " >>\nstream\n" . $imageData . "\nendstream\nendobj\n";
    
    // Content stream - place image on page
    $content = sprintf("q\n%.2f 0 0 %.2f %.2f %.2f cm\n/Im1 Do\nQ\n", $width, $height, $x, $y);
    $obj5 = "5 0 obj\n<< /Length " . strlen($content) . " >>\nstream\n$content\nendstream\nendobj\n";
    
    // Calculate xref offset
    $pdfHeader = "%PDF-1.4\n";
    $offset = strlen($pdfHeader);
    
    // XREF table
    $xref = "xref\n0 6\n0000000000 65535 f \n";
    $xref .= sprintf("%010d 00000 n \n", $offset);
    $offset += strlen($obj1);
    $xref .= sprintf("%010d 00000 n \n", $offset);
    $offset += strlen($obj2);
    $xref .= sprintf("%010d 00000 n \n", $offset);
    $offset += strlen($obj3);
    $xref .= sprintf("%010d 00000 n \n", $offset);
    $offset += strlen($obj4);
    $xref .= sprintf("%010d 00000 n \n", $offset);
    
    // Trailer
    $allObjects = $obj1 . $obj2 . $obj3 . $obj4 . $obj5;
    $trailerOffset = strlen($pdfHeader . $allObjects . $xref);
    $trailer = "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n$trailerOffset\n%%EOF";
    
    // Combine all parts
    $pdf = $pdfHeader . $allObjects . $xref . $trailer;
    
    return $pdf;
}

function generateCertificateHTML($studentName, $course, $class, $date) {
    $courseTitle = htmlspecialchars($course['course_title']);
    $language = htmlspecialchars($course['language'] ?? 'Programming');
    $className = htmlspecialchars($class['class_name'] ?? '');
    
    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Completion</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: 'Times New Roman', serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .certificate-container {
            width: 11in;
            height: 8.5in;
            background: white;
            position: relative;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            padding: 60px;
            box-sizing: border-box;
        }
        .certificate-border {
            position: absolute;
            top: 30px;
            left: 30px;
            right: 30px;
            bottom: 30px;
            border: 8px solid #1d9b3e;
            border-radius: 20px;
        }
        .certificate-header {
            text-align: center;
            margin-bottom: 40px;
        }
        .certificate-title {
            font-size: 48px;
            font-weight: bold;
            color: #1d9b3e;
            margin: 0;
            letter-spacing: 3px;
            text-transform: uppercase;
        }
        .certificate-subtitle {
            font-size: 24px;
            color: #666;
            margin-top: 10px;
            font-style: italic;
        }
        .certificate-body {
            text-align: center;
            margin: 60px 0;
        }
        .certificate-text {
            font-size: 20px;
            color: #333;
            line-height: 1.8;
            margin: 30px 0;
        }
        .student-name {
            font-size: 36px;
            font-weight: bold;
            color: #1d9b3e;
            margin: 20px 0;
            text-decoration: underline;
            text-decoration-color: #1d9b3e;
            text-decoration-thickness: 3px;
        }
        .course-name {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin: 20px 0;
        }
        .certificate-footer {
            margin-top: 80px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        .signature-box {
            text-align: center;
            width: 250px;
        }
        .signature-line {
            border-top: 2px solid #333;
            margin-top: 60px;
            padding-top: 10px;
        }
        .signature-name {
            font-size: 16px;
            font-weight: bold;
            color: #333;
        }
        .signature-title {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }
        .certificate-date {
            text-align: center;
            margin-top: 40px;
            font-size: 18px;
            color: #666;
        }
        .certificate-seal {
            position: absolute;
            bottom: 40px;
            right: 60px;
            width: 120px;
            height: 120px;
            border: 4px solid #1d9b3e;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
        }
        .seal-text {
            font-size: 14px;
            font-weight: bold;
            color: #1d9b3e;
            text-align: center;
        }
        @media print {
            body {
                background: white;
            }
            .certificate-container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <div class="certificate-border"></div>
        
        <div class="certificate-header">
            <h1 class="certificate-title">Certificate of Completion</h1>
            <p class="certificate-subtitle">This is to certify that</p>
        </div>
        
        <div class="certificate-body">
            <p class="certificate-text">
                <span class="student-name">{$studentName}</span>
            </p>
            <p class="certificate-text">
                has successfully completed the course
            </p>
            <p class="course-name">{$courseTitle}</p>
            <p class="certificate-text">
                in <strong>{$language}</strong>
            </p>
            <p class="certificate-text" style="margin-top: 40px;">
                by completing all required activities and assessments
            </p>
        </div>
        
        <div class="certificate-footer">
            <div class="signature-box">
                <div class="signature-line">
                    <div class="signature-name">Code Regal</div>
                    <div class="signature-title">Learning Platform</div>
                </div>
            </div>
            
            <div class="certificate-date">
                <p style="margin: 0;">Date: <strong>{$date}</strong></p>
            </div>
            
            <div class="signature-box">
                <div class="signature-line">
                    <div class="signature-name">Certificate ID</div>
                    <div class="signature-title">CR-{$course['course_id']}-{$userId}</div>
                </div>
            </div>
        </div>
        
        <div class="certificate-seal">
            <div class="seal-text">
                CODE<br>REGAL<br>SEAL
            </div>
        </div>
    </div>
    
    <script>
        // Auto-print when loaded (optional)
        // window.onload = function() {
        //     window.print();
        // }
    </script>
</body>
</html>
HTML;
}

// Note: generatePDFWithTCPDF is replaced by generateCertificatePDF
// The new function creates proper PDF files without requiring external libraries
?>

