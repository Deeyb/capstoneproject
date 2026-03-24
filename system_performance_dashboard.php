<?php
// Ensure dedicated session directory exists before starting session
$sessionPath = __DIR__ . '/sessions';
if (!is_dir($sessionPath)) {
    @mkdir($sessionPath, 0777, true);
}
if (is_dir($sessionPath) && is_writable($sessionPath)) {
    ini_set('session.save_path', $sessionPath);
}

// Set a consistent session name (supports legacy cookie fallback)
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
require_once __DIR__ . '/classes/ActivityTrackingService.php';

Auth::requireAuth();

$userRole = strtoupper($_SESSION['user_role'] ?? '');
$allowedRoles = ['ADMIN', 'COORDINATOR', 'TEACHER'];
if (!in_array($userRole, $allowedRoles, true)) {
    http_response_code(403);
    echo "Access denied.";
    exit;
}

$scriptStart = microtime(true);
$db = (new Database())->getConnection();
if (!$db) {
    die('Database connection failed.');
}

// Ensure the activity_tracking table exists for metrics (legacy students counter fallback)
new ActivityTrackingService($db);

/**
 * Convert shorthand php.ini values (e.g. 512M) to bytes
 */
function iniValueToBytes($value)
{
    if ($value === false) {
        return null;
    }

    $value = trim((string)$value);
    if ($value === '' || $value === '-1') {
        return null;
    }

    $lastChar = strtolower($value[strlen($value) - 1]);
    $number = (float)$value;

    switch ($lastChar) {
        case 'g':
            $number *= 1024;
        // no break
        case 'm':
            $number *= 1024;
        // no break
        case 'k':
            $number *= 1024;
            break;
        default:
            if (!is_numeric($lastChar)) {
                $number = (float)substr($value, 0, -1);
            }
            break;
    }

    return (int)round($number);
}

/**
 * Collect PHP session activity within configurable windows.
 * Counts every active session file (so multiple browsers per user are counted separately).
 *
 * @param array $windows Minutes windows to evaluate (e.g., [5,15,60])
 * @return array
 */
function collectSessionActivity(array $windows = [5, 15, 60]): array
{
    $result = [
        'counts' => array_fill_keys($windows, 0),
        'roles' => [],
        'samples' => [],
        'warnings' => []
    ];

    $maxWindow = max($windows);

    $savePath = session_save_path();
    if (strpos($savePath, ';') !== false) {
        $parts = explode(';', $savePath);
        $savePath = end($parts);
    }
    $savePath = trim($savePath);
    if ($savePath === '') {
        $savePath = sys_get_temp_dir();
    }
    if (!is_dir($savePath)) {
        $result['warnings'][] = "Session directory not found: {$savePath}";
        return $result;
    }

    $files = glob(rtrim($savePath, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'sess_*');
    if ($files === false) {
        $result['warnings'][] = "Unable to read session directory: {$savePath}";
        return $result;
    }

    $now = time();
    foreach ($files as $file) {
        $lastModified = @filemtime($file);
        if ($lastModified === false) {
            continue;
        }

        $minutesAgo = ($now - $lastModified) / 60;
        if ($minutesAgo > $maxWindow) {
            continue;
        }

        foreach ($windows as $window) {
            if ($minutesAgo <= $window) {
                $result['counts'][$window]++;
            }
        }

        $raw = @file_get_contents($file);
        $role = 'UNKNOWN';
        if ($raw !== false) {
            if (preg_match('/user_role\|s:\d+:"([^"]*)"/', $raw, $match)) {
                $role = strtoupper($match[1]);
            }
        }
        $result['roles'][$role] = ($result['roles'][$role] ?? 0) + 1;

        if (count($result['samples']) < 20) {
            $result['samples'][] = [
                'session' => basename($file),
                'role' => $role,
                'last_seen' => date('c', $lastModified),
                'minutes_ago' => round($minutesAgo, 1)
            ];
        }
    }

    return $result;
}

/**
 * Collect system and user-activity metrics for the dashboard
 */
function collectSystemMetrics(PDO $db): array
{
    $metrics = [
        'generated_at' => date('c'),
        'php' => [
            'version' => PHP_VERSION,
            'memory_usage_bytes' => memory_get_usage(true),
            'memory_peak_bytes' => memory_get_peak_usage(true),
            'memory_limit_bytes' => iniValueToBytes(ini_get('memory_limit')),
            'memory_limit_raw' => ini_get('memory_limit'),
            'max_execution_time' => (int)ini_get('max_execution_time')
        ],
        'server' => [
            'software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
            'hostname' => gethostname() ?: 'unknown',
            'load_average' => function_exists('sys_getloadavg') ? sys_getloadavg() : null
        ],
        'warnings' => []
    ];

    // Database metadata and ping time
    try {
        $pingStart = microtime(true);
        $db->query('SELECT 1')->fetchColumn();
        $metrics['database'] = [
            'version' => (string)$db->query('SELECT VERSION()')->fetchColumn(),
            'ping_ms' => round((microtime(true) - $pingStart) * 1000, 2)
        ];

        $statusStmt = $db->prepare("SHOW GLOBAL STATUS WHERE Variable_name IN ('Threads_connected','Threads_running','Slow_queries')");
        $statusStmt->execute();
        $statusRows = $statusStmt->fetchAll(PDO::FETCH_KEY_PAIR);
        $metrics['database']['threads_connected'] = isset($statusRows['Threads_connected']) ? (int)$statusRows['Threads_connected'] : null;
        $metrics['database']['threads_running'] = isset($statusRows['Threads_running']) ? (int)$statusRows['Threads_running'] : null;
        $metrics['database']['slow_queries'] = isset($statusRows['Slow_queries']) ? (int)$statusRows['Slow_queries'] : null;
        $metrics['database']['max_connections'] = (int)$db->query('SELECT @@max_connections')->fetchColumn();
    } catch (Throwable $e) {
        $metrics['warnings'][] = 'Limited database status visibility: ' . $e->getMessage();
    }

    // Collect per-session activity (all roles)
    $sessionStats = collectSessionActivity([5, 15, 60]);
    $metrics['active_users'] = [
        'window_5' => (int)($sessionStats['counts'][5] ?? 0),
        'window_15' => (int)($sessionStats['counts'][15] ?? 0),
        'window_60' => (int)($sessionStats['counts'][60] ?? 0),
        'roles' => $sessionStats['roles'],
        'sessions_sample' => $sessionStats['samples']
    ];
    $metrics['warnings'] = array_merge($metrics['warnings'], $sessionStats['warnings']);

    // Peak active count for the last hour (derived)
    $metrics['active_users']['window_60_peak'] = max(
        $metrics['active_users']['window_5'],
        $metrics['active_users']['window_15'],
        $metrics['active_users']['window_60']
    );

    // Derive a simple stress score
    $active5 = $metrics['active_users']['window_5'] ?? 0;
    $load1 = $metrics['server']['load_average'][0] ?? 0;
    $dbPing = $metrics['database']['ping_ms'] ?? 0;

    $score = min(100, round(($active5 * 1.2) + ($load1 * 25) + ($dbPing / 4)));
    $level = 'Low';
    if ($score >= 75) {
        $level = 'High';
    } elseif ($score >= 40) {
        $level = 'Medium';
    }
    $metrics['stress'] = [
        'score' => $score,
        'level' => $level,
        'details' => [
            'active_users_5m' => $active5,
            'load_avg_1m' => round($load1, 2),
            'db_ping_ms' => $dbPing
        ]
    ];

    return $metrics;
}

$metrics = collectSystemMetrics($db);
$metrics['generated_in_ms'] = round((microtime(true) - $scriptStart) * 1000, 2);

if (isset($_GET['format']) && strtolower((string)$_GET['format']) === 'json') {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'metrics' => $metrics
    ]);
    exit;
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Performance Monitor</title>
    <style>
        :root {
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: #0f172a;
        }
        body {
            margin: 0;
            padding: 20px;
            background: #f8fafc;
        }
        .page {
            max-width: 1200px;
            margin: 0 auto;
        }
        header {
            margin-bottom: 24px;
        }
        h1 {
            margin: 0 0 8px;
            font-size: 28px;
            color: #0f172a;
        }
        p.description {
            margin: 0;
            color: #475569;
        }
        .controls {
            margin-top: 16px;
            display: flex;
            gap: 12px;
            align-items: center;
            flex-wrap: wrap;
        }
        button {
            background: #2563eb;
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
        }
        button.secondary {
            background: #0f172a;
        }
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }
        .card {
            background: white;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 10px 25px rgba(15, 23, 42, 0.07);
        }
        .card h3 {
            margin: 0;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #94a3b8;
        }
        .card .value {
            margin-top: 8px;
            font-size: 32px;
            font-weight: 700;
            color: #0f172a;
        }
        .card .subtext {
            margin-top: 4px;
            color: #6b7280;
            font-size: 13px;
        }
        .section-title {
            font-size: 18px;
            margin: 32px 0 12px;
            color: #0f172a;
        }
        .trend-card {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
        }
        .sparkline {
            display: flex;
            align-items: flex-end;
            gap: 4px;
            height: 140px;
        }
        .sparkline-bar {
            flex: 1;
            background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
            border-radius: 4px 4px 0 0;
            min-width: 4px;
            transition: height 0.2s ease;
        }
        .sparkline-meta {
            display: flex;
            justify-content: space-between;
            margin-top: 12px;
            color: #475569;
            font-size: 13px;
        }
        .status-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            padding: 6px 12px;
            border-radius: 999px;
            font-weight: 600;
        }
        .status-low {
            background: #dcfce7;
            color: #166534;
        }
        .status-medium {
            background: #fef9c3;
            color: #854d0e;
        }
        .status-high {
            background: #fee2e2;
            color: #b91c1c;
        }
        pre {
            background: #0f172a;
            color: #e2e8f0;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            font-size: 12px;
        }
        .hero {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }
        .hero-card {
            background: #0f172a;
            color: white;
            border-radius: 18px;
            padding: 24px;
            box-shadow: 0 20px 45px rgba(15, 23, 42, 0.35);
        }
        .hero-card h2 {
            margin: 0;
            font-size: 16px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.7);
        }
        .hero-card .hero-value {
            font-size: 56px;
            font-weight: 700;
            margin-top: 12px;
        }
    </style>
</head>
<body>
    <div class="page">
        <header>
            <h1>Concurrent Users Analytics</h1>
            <p class="description">
                Focused dashboard showing how many people are inside the LMS right now plus the essential server stats for load testing.
            </p>
            <div class="controls">
                <button id="refreshBtn">Manual Refresh</button>
                <button id="downloadBtn" class="secondary">Download JSON Snapshot</button>
                <span id="lastUpdated" style="color:#475569;font-size:13px;">Last update: --</span>
            </div>
        </header>

        <section class="hero">
            <div class="hero-card">
                <h2>Live Concurrent Users</h2>
                <div class="hero-value" id="currentActive">--</div>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">
                    Based on users with activity in the last 5 minutes.
                </p>
            </div>
            <div class="hero-card" style="background:#14532d;">
                <h2>Peak (Last 60 min)</h2>
                <div class="hero-value" id="peakActive">--</div>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                    Highest concurrent user count captured in the last hour.
                </p>
            </div>
        </section>

        <section class="metrics-grid">
            <div class="card">
                <h3>Active Users (5 min)</h3>
                <div class="value" id="activeUsers5">--</div>
                <div class="subtext">Unique users with activity in the last 5 minutes</div>
            </div>
            <div class="card">
                <h3>Active Users (15 min)</h3>
                <div class="value" id="activeUsers15">--</div>
                <div class="subtext">Rolling 15-minute window</div>
            </div>
            <div class="card">
                <h3>Active Users (60 min)</h3>
                <div class="value" id="activeUsers60">--</div>
                <div class="subtext">Users seen in the last hour</div>
            </div>
            <div class="card">
                <h3>Stress Level</h3>
                <div class="value" id="stressScore">--</div>
                <div class="subtext">
                    <span id="stressLabel" class="status-pill status-low">--</span>
                </div>
            </div>
            <div class="card">
                <h3>Server Load (1 / 5 / 15 min)</h3>
                <div class="value" id="serverLoad">--</div>
                <div class="subtext">Relative CPU load averages</div>
            </div>
            <div class="card">
                <h3>DB Ping</h3>
                <div class="value" id="dbLatency">--</div>
                <div class="subtext">Round-trip to database (ms)</div>
            </div>
            <div class="card">
                <h3>PHP Memory Usage</h3>
                <div class="value" id="memoryUsage">--</div>
                <div class="subtext">Current / Peak / Limit</div>
            </div>
        </section>

        <h2 class="section-title">Active Users Trend (snapshot every 5 seconds)</h2>
        <div class="trend-card">
            <div id="trendBars" class="sparkline">
                <span style="color:#94a3b8;">Gathering samples...</span>
            </div>
            <div class="sparkline-meta">
                <span>History window: <strong>last 2 minutes</strong></span>
                <span>Peak in view: <strong id="trendPeak">0</strong> users</span>
            </div>
        </div>

        <h2 class="section-title">Raw Metrics Payload</h2>
        <pre id="rawMetrics">Loading...</pre>
    </div>

    <script>
        const metricsEndpoint = window.location.pathname + '?format=json';
        const refreshBtn = document.getElementById('refreshBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const lastUpdatedEl = document.getElementById('lastUpdated');
        const rawMetricsEl = document.getElementById('rawMetrics');
        const trendBarsEl = document.getElementById('trendBars');
        const trendPeakEl = document.getElementById('trendPeak');
        const trendHistory = [];
        const TREND_LIMIT = 24; // last 2 minutes (24 samples * 5s)

        function formatBytes(bytes) {
            if (bytes === null || bytes === undefined || isNaN(bytes)) {
                return '--';
            }
            const units = ['B', 'KB', 'MB', 'GB', 'TB'];
            let value = bytes;
            let unitIndex = 0;
            while (value >= 1024 && unitIndex < units.length - 1) {
                value /= 1024;
                unitIndex++;
            }
            return value.toFixed(unitIndex === 0 ? 0 : 2) + ' ' + units[unitIndex];
        }

        function setText(id, value) {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = value;
            }
        }

        function renderTrend(value) {
            if (!trendBarsEl) return;
            trendHistory.push(value);
            if (trendHistory.length > TREND_LIMIT) {
                trendHistory.shift();
            }
            const max = trendHistory.length ? Math.max(...trendHistory) : 0;
            const safeMax = max === 0 ? 1 : max;
            trendPeakEl.textContent = max;
            trendBarsEl.innerHTML = trendHistory.map(val => {
                const height = Math.max(8, (val / safeMax) * 100);
                return `<span class="sparkline-bar" title="${val} users" style="height:${height}%"></span>`;
            }).join('');
        }

        function updateStressBadge(stress) {
            const badge = document.getElementById('stressLabel');
            if (!badge || !stress) return;
            const level = (stress.level || 'Low').toLowerCase();
            badge.classList.remove('status-low', 'status-medium', 'status-high');
            if (level === 'high') {
                badge.classList.add('status-high');
            } else if (level === 'medium') {
                badge.classList.add('status-medium');
            } else {
                badge.classList.add('status-low');
            }
            badge.textContent = stress.level || 'Low';
        }

        function renderMetricsPayload(payload) {
            if (!payload) return;

            const active = payload.active_users || {};
            const current = active.window_5 ?? 0;
            setText('activeUsers5', current.toString());
            setText('currentActive', current.toString());
            setText('activeUsers15', (active.window_15 ?? 0).toString());
            setText('activeUsers60', (active.window_60 ?? 0).toString());
            const peak = active.window_60_peak ?? active.window_60 ?? 0;
            setText('peakActive', peak.toString());
            renderTrend(current);

            const load = payload.server?.load_average;
            if (Array.isArray(load)) {
                setText('serverLoad', load.map(v => (typeof v === 'number' ? v.toFixed(2) : '--')).join(' / '));
            } else {
                setText('serverLoad', 'N/A');
            }

            const dbLatency = payload.database?.ping_ms;
            setText('dbLatency', dbLatency !== undefined ? dbLatency + ' ms' : 'N/A');

            const memUsage = payload.php?.memory_usage_bytes;
            const memPeak = payload.php?.memory_peak_bytes;
            const memLimit = payload.php?.memory_limit_bytes;
            const memoryLabel = [
                formatBytes(memUsage),
                formatBytes(memPeak),
                memLimit ? formatBytes(memLimit) : payload.php?.memory_limit_raw || 'Unlimited'
            ].join(' / ');
            setText('memoryUsage', memoryLabel);

            if (payload.stress) {
                setText('stressScore', payload.stress.score + ' / 100');
                updateStressBadge(payload.stress);
            } else {
                setText('stressScore', '--');
                updateStressBadge({ level: 'Low' });
            }

            rawMetricsEl.textContent = JSON.stringify(payload, null, 2);
            lastUpdatedEl.textContent = 'Last update: ' + new Date(payload.generated_at || Date.now()).toLocaleString();
        }

        async function refreshMetrics() {
            refreshBtn.disabled = true;
            try {
                const response = await fetch(metricsEndpoint, { cache: 'no-store' });
                if (!response.ok) {
                    throw new Error('Failed to load metrics (HTTP ' + response.status + ')');
                }
                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.message || 'Unknown metrics error');
                }
                renderMetricsPayload(data.metrics);
            } catch (error) {
                alert('Unable to refresh metrics: ' + error.message);
            } finally {
                refreshBtn.disabled = false;
            }
        }

        function downloadSnapshot() {
            const blob = new Blob([rawMetricsEl.textContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.href = url;
            link.download = 'system-metrics-' + timestamp + '.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }

        refreshBtn.addEventListener('click', refreshMetrics);
        downloadBtn.addEventListener('click', downloadSnapshot);

        // Render initial payload from PHP
        const initialMetrics = <?php echo json_encode($metrics, JSON_UNESCAPED_UNICODE); ?>;
        renderMetricsPayload(initialMetrics);

        // Poll every 5 seconds
        setInterval(refreshMetrics, 5000);
    </script>
</body>
</html>

