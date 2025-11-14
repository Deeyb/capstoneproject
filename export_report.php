<?php
/**
 * EXPORT REPORT API
 * Exports reports to PDF or Excel format
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Session handling
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

require_once __DIR__ . '/classes/auth_helpers.php';
require_once __DIR__ . '/config/Database.php';

Auth::requireAuth();

$db = (new Database())->getConnection();
$userId = $_SESSION['user_id'] ?? 0;
$userRole = strtolower(trim($_SESSION['user_role'] ?? ''));

// Permission check
if (!in_array($userRole, ['admin', 'coordinator', 'teacher'])) {
    http_response_code(403);
    die('Access denied');
}

$format = $_GET['format'] ?? 'pdf'; // pdf or excel
$reportType = $_GET['type'] ?? 'overview';
$classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : 0;
$studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : 0;
$activityId = isset($_GET['activity_id']) ? (int)$_GET['activity_id'] : 0;
$dateFrom = $_GET['date_from'] ?? null;
$dateTo = $_GET['date_to'] ?? null;

// Get report data functions (define constant to prevent API execution)
define('REPORTS_INCLUDED', true);
require_once __DIR__ . '/get_reports_data.php';

try {
    $reportData = null;
    
    switch ($reportType) {
        case 'overview':
            $result = getOverviewReport($db, $userId, $userRole, $classId, $dateFrom, $dateTo);
            if ($result['success']) {
                $reportData = $result['data'];
            }
            break;
        case 'class':
            if ($classId <= 0) {
                die('Class ID required');
            }
            $result = getClassReport($db, $userId, $userRole, $classId, $dateFrom, $dateTo);
            if ($result['success']) {
                $reportData = $result['data'];
            }
            break;
        case 'student':
            if ($studentId <= 0) {
                die('Student ID required');
            }
            $result = getStudentReport($db, $userId, $userRole, $studentId, $classId, $dateFrom, $dateTo);
            if ($result['success']) {
                $reportData = $result['data'];
            }
            break;
        case 'activity':
            if ($activityId <= 0) {
                die('Activity ID required');
            }
            $result = getActivityReport($db, $userId, $userRole, $activityId, $classId, $dateFrom, $dateTo);
            if ($result['success']) {
                $reportData = $result['data'];
            }
            break;
    }
    
    if (!$reportData) {
        die('Failed to generate report data');
    }
    
    // Log report download
    try {
        $stmt = $db->prepare("
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, ip_address, user_agent, created_at)
            VALUES (?, 'report.export', 'report', ?, ?, ?, ?, NOW())
        ");
        $metadata = json_encode([
            'format' => $format,
            'type' => $reportType,
            'class_id' => $classId,
            'student_id' => $studentId,
            'activity_id' => $activityId,
            'date_from' => $dateFrom,
            'date_to' => $dateTo
        ]);
        $stmt->execute([
            $userId,
            $reportType,
            $metadata,
            $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);
    } catch (Throwable $e) {
        error_log("Failed to log report download: " . $e->getMessage());
    }
    
    if ($format === 'excel') {
        exportToExcel($reportData, $reportType, $dateFrom, $dateTo);
    } else {
        exportToPDF($reportData, $reportType, $dateFrom, $dateTo);
    }
    
} catch (Throwable $e) {
    error_log("❌ [export_report] Error: " . $e->getMessage());
    die('Export failed: ' . $e->getMessage());
}

/**
 * Export to PDF (HTML-based, browser will convert to PDF)
 */
function exportToPDF($data, $type, $dateFrom, $dateTo) {
    // Clean any output buffers first
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    // Set headers for HTML that can be printed to PDF
    header('Content-Type: text/html; charset=utf-8');
    header('Content-Disposition: inline; filename="report_' . $type . '_' . date('Y-m-d') . '.html"');
    
    // Output HTML that can be printed to PDF via browser
    echo generateReportHTML($data, $type, $dateFrom, $dateTo);
    exit;
}

/**
 * Export to Excel (CSV format for simplicity)
 */
function exportToExcel($data, $type, $dateFrom, $dateTo) {
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="report_' . $type . '_' . date('Y-m-d') . '.xlsx"');
    
    // For now, output CSV
    // In production, use PhpSpreadsheet library
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="report_' . $type . '_' . date('Y-m-d') . '.csv"');
    
    $output = fopen('php://output', 'w');
    
    switch ($type) {
        case 'overview':
            fputcsv($output, ['Metric', 'Value']);
            fputcsv($output, ['Total Students', $data['total_students'] ?? 0]);
            fputcsv($output, ['Total Classes', $data['total_classes'] ?? 0]);
            fputcsv($output, ['Activities Completed', $data['total_activities_completed'] ?? 0]);
            fputcsv($output, ['Average Score', $data['average_score'] ?? 0]);
            break;
        case 'class':
            if (isset($data['student_performance'])) {
                fputcsv($output, ['Student Name', 'ID Number', 'Activities Completed', 'Average Score', 'Highest Score', 'Lowest Score']);
                foreach ($data['student_performance'] as $student) {
                    $name = trim(($student['lastname'] ?? '') . ', ' . ($student['firstname'] ?? '') . ' ' . ($student['middlename'] ? substr($student['middlename'], 0, 1) . '.' : ''));
                    fputcsv($output, [
                        $name,
                        $student['id_number'] ?? '',
                        $student['activities_completed'] ?? 0,
                        round($student['avg_score'] ?? 0, 2),
                        $student['highest_score'] ?? 0,
                        $student['lowest_score'] ?? 0
                    ]);
                }
            }
            break;
    }
    
    fclose($output);
}

/**
 * Generate HTML for PDF export
 */
function generateReportHTML($data, $type, $dateFrom, $dateTo) {
    // Set timezone to Philippine Time (PST/PH)
    date_default_timezone_set('Asia/Manila');
    $generatedDate = date('Y-m-d H:i:s');
    
    $html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Performance Report</title>';
    $html .= '<style>
        @media print {
            @page { margin: 1cm; }
            body { margin: 0; }
            .download-actions { display: none !important; }
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: "Inter", "Segoe UI", Arial, sans-serif;
            padding: 20px;
            color: #333;
            background: #f8f9fa;
            line-height: 1.6;
        }
        .report-container {
            max-width: 1200px;
            margin: 0 auto;
            background: #ffffff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .download-actions {
            text-align: center;
            margin-bottom: 30px;
            padding: 15px;
        }
        .download-btn {
            display: inline-block;
            padding: 10px 20px;
            background: #28a745;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
        }
        .download-btn:hover {
            background: #218838;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(40, 167, 69, 0.4);
        }
        .download-btn i {
            margin-right: 8px;
        }
        h1 {
            color: #07522A;
            border-bottom: 3px solid #28a745;
            padding-bottom: 15px;
            margin-bottom: 20px;
            font-size: 28px;
        }
        h2 {
            color: #1d9b3e;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 22px;
        }
        .meta-info {
            background: #e8f5e8;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #28a745;
        }
        .meta-info p {
            margin: 5px 0;
            color: #333;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 20px;
            font-size: 13px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        th, td {
            border: 1px solid #e9ecef;
            padding: 12px;
            text-align: left;
        }
        th {
            background: #28a745;
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.5px;
        }
        tr:nth-child(even) {
            background: #f8f9fa;
        }
        tr:hover {
            background: #e8f5e8;
            transition: background 0.2s;
        }
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .summary-card {
            background: #ffffff;
            border: 2px solid #28a745;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(40, 167, 69, 0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .summary-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
        }
        .summary-card h3 {
            margin: 0 0 12px 0;
            color: #07522A;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .summary-card .value {
            font-size: 32px;
            font-weight: bold;
            color: #28a745;
        }
        @media print {
            .summary-card {
                break-inside: avoid;
            }
        }
    </style>';
    $html .= '<script>
        function downloadPDF() {
            window.print();
        }
    </script>';
    $html .= '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">';
    $html .= '</head><body>';
    $html .= '<div class="report-container">';
    
    // Simple download button
    $html .= '<div class="download-actions">';
    $html .= '<a href="javascript:void(0)" onclick="downloadPDF()" class="download-btn"><i class="fas fa-file-pdf"></i> Download PDF</a>';
    $html .= '</div>';
    
    $html .= '<h1>Performance Report - ' . ucfirst($type) . '</h1>';
    
    $html .= '<div class="meta-info">';
    $html .= '<p><strong>Generated:</strong> ' . $generatedDate . ' (PHT)</p>';
    if ($dateFrom || $dateTo) {
        $html .= '<p><strong>Date Range:</strong> ' . ($dateFrom ?? 'Start') . ' to ' . ($dateTo ?? 'End') . '</p>';
    }
    $html .= '</div>';
    
    // Add report content based on type
    switch ($type) {
        case 'overview':
            $html .= '<div class="summary-cards">';
            $html .= '<div class="summary-card"><h3>Total Students</h3><div class="value">' . ($data['total_students'] ?? 0) . '</div></div>';
            $html .= '<div class="summary-card"><h3>Total Classes</h3><div class="value">' . ($data['total_classes'] ?? 0) . '</div></div>';
            $html .= '<div class="summary-card"><h3>Activities Completed</h3><div class="value">' . ($data['total_activities_completed'] ?? 0) . '</div></div>';
            $html .= '<div class="summary-card"><h3>Average Score</h3><div class="value">' . number_format($data['average_score'] ?? 0, 2) . '%</div></div>';
            $html .= '</div>';
            
            if (isset($data['top_performers']) && is_array($data['top_performers']) && count($data['top_performers']) > 0) {
                $html .= '<h2>Top Performers</h2>';
                $html .= '<table><tr><th>Rank</th><th>Student Name</th><th>ID Number</th><th>Average Score</th><th>Activities Completed</th></tr>';
                foreach ($data['top_performers'] as $index => $performer) {
                    $rank = $index + 1;
                    $name = trim(($performer['lastname'] ?? '') . ', ' . ($performer['firstname'] ?? '') . ' ' . 
                        ($performer['middlename'] ? substr($performer['middlename'], 0, 1) . '.' : ''));
                    $html .= '<tr>';
                    $html .= '<td>' . $rank . '</td>';
                    $html .= '<td>' . htmlspecialchars($name) . '</td>';
                    $html .= '<td>' . htmlspecialchars($performer['id_number'] ?? '') . '</td>';
                    $html .= '<td>' . number_format($performer['avg_score'] ?? 0, 2) . '%</td>';
                    $html .= '<td>' . ($performer['activities_completed'] ?? 0) . '</td>';
                    $html .= '</tr>';
                }
                $html .= '</table>';
            }
            break;
            
        case 'class':
            if (isset($data['class_info'])) {
                $html .= '<h2>Class Information</h2>';
                $html .= '<p><strong>Class:</strong> ' . htmlspecialchars($data['class_info']['name'] ?? '') . '</p>';
                $html .= '<p><strong>Course:</strong> ' . htmlspecialchars($data['class_info']['course_title'] ?? '') . ' (' . htmlspecialchars($data['class_info']['course_code'] ?? '') . ')</p>';
            }
            
            if (isset($data['statistics'])) {
                $html .= '<div class="summary-cards">';
                $html .= '<div class="summary-card"><h3>Students Enrolled</h3><div class="value">' . ($data['statistics']['students_enrolled'] ?? 0) . '</div></div>';
                $html .= '<div class="summary-card"><h3>Average Grade</h3><div class="value">' . number_format($data['statistics']['average_grade'] ?? 0, 2) . '%</div></div>';
                $html .= '<div class="summary-card"><h3>Activities Completed</h3><div class="value">' . ($data['statistics']['activities_completed'] ?? 0) . '</div></div>';
                $html .= '</div>';
            }
            
            if (isset($data['student_performance']) && is_array($data['student_performance']) && count($data['student_performance']) > 0) {
                $html .= '<h2>Student Performance</h2>';
                $html .= '<table><tr><th>Student Name</th><th>ID Number</th><th>Activities Completed</th><th>Average Score</th><th>Highest Score</th><th>Lowest Score</th></tr>';
                foreach ($data['student_performance'] as $student) {
                    $name = trim(($student['lastname'] ?? '') . ', ' . ($student['firstname'] ?? '') . ' ' . 
                        ($student['middlename'] ? substr($student['middlename'], 0, 1) . '.' : ''));
                    $html .= '<tr>';
                    $html .= '<td>' . htmlspecialchars($name) . '</td>';
                    $html .= '<td>' . htmlspecialchars($student['id_number'] ?? '') . '</td>';
                    $html .= '<td>' . ($student['activities_completed'] ?? 0) . '</td>';
                    $html .= '<td>' . number_format($student['avg_score'] ?? 0, 2) . '%</td>';
                    $html .= '<td>' . number_format($student['highest_score'] ?? 0, 2) . '</td>';
                    $html .= '<td>' . number_format($student['lowest_score'] ?? 0, 2) . '</td>';
                    $html .= '</tr>';
                }
                $html .= '</table>';
            }
            break;
            
        case 'student':
            if (isset($data['student_info'])) {
                $html .= '<h2>Student Information</h2>';
                $name = trim(($data['student_info']['lastname'] ?? '') . ', ' . 
                    ($data['student_info']['firstname'] ?? '') . ' ' . 
                    ($data['student_info']['middlename'] ? substr($data['student_info']['middlename'], 0, 1) . '.' : ''));
                $html .= '<p><strong>Name:</strong> ' . htmlspecialchars($name) . '</p>';
                $html .= '<p><strong>ID Number:</strong> ' . htmlspecialchars($data['student_info']['id_number'] ?? '') . '</p>';
                if (isset($data['student_info']['class_name'])) {
                    $html .= '<p><strong>Class:</strong> ' . htmlspecialchars($data['student_info']['class_name']) . '</p>';
                }
            }
            
            if (isset($data['performance']) && is_array($data['performance']) && count($data['performance']) > 0) {
                $html .= '<h2>Activity Performance</h2>';
                $html .= '<table><tr><th>Activity</th><th>Type</th><th>Score</th><th>Status</th><th>Submitted At</th></tr>';
                foreach ($data['performance'] as $perf) {
                    $html .= '<tr>';
                    $html .= '<td>' . htmlspecialchars($perf['activity_title'] ?? 'Unknown') . '</td>';
                    $html .= '<td>' . htmlspecialchars($perf['activity_type'] ?? 'N/A') . '</td>';
                    $html .= '<td>' . ($perf['score'] !== null ? number_format($perf['score'], 2) : 'Pending') . '</td>';
                    $html .= '<td>' . htmlspecialchars($perf['status'] ?? 'N/A') . '</td>';
                    $html .= '<td>' . ($perf['submitted_at'] ? date('Y-m-d H:i', strtotime($perf['submitted_at'])) : 'N/A') . '</td>';
                    $html .= '</tr>';
                }
                $html .= '</table>';
            }
            break;
            
        case 'activity':
            if (isset($data['activity_info'])) {
                $html .= '<h2>Activity Information</h2>';
                $html .= '<p><strong>Activity:</strong> ' . htmlspecialchars($data['activity_info']['title'] ?? '') . '</p>';
                $html .= '<p><strong>Type:</strong> ' . htmlspecialchars($data['activity_info']['type'] ?? '') . '</p>';
            }
            
            if (isset($data['performance']) && is_array($data['performance']) && count($data['performance']) > 0) {
                $html .= '<h2>Student Submissions</h2>';
                $html .= '<table><tr><th>Student Name</th><th>ID Number</th><th>Score</th><th>Status</th><th>Submitted At</th></tr>';
                foreach ($data['performance'] as $perf) {
                    $name = trim(($perf['lastname'] ?? '') . ', ' . ($perf['firstname'] ?? '') . ' ' . 
                        ($perf['middlename'] ? substr($perf['middlename'], 0, 1) . '.' : ''));
                    $html .= '<tr>';
                    $html .= '<td>' . htmlspecialchars($name) . '</td>';
                    $html .= '<td>' . htmlspecialchars($perf['id_number'] ?? '') . '</td>';
                    $html .= '<td>' . ($perf['score'] !== null ? number_format($perf['score'], 2) : 'Pending') . '</td>';
                    $html .= '<td>' . htmlspecialchars($perf['status'] ?? 'N/A') . '</td>';
                    $html .= '<td>' . ($perf['submitted_at'] ? date('Y-m-d H:i', strtotime($perf['submitted_at'])) : 'N/A') . '</td>';
                    $html .= '</tr>';
                }
                $html .= '</table>';
            }
            break;
    }
    
    $html .= '</div>'; // Close report-container
    $html .= '</body></html>';
    return $html;
}
?>



