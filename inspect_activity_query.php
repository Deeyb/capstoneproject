<?php
/**
 * Quick CLI script to inspect the activity report query output.
 *
 * Usage:
 *   php inspect_activity_query.php [activity_id] [class_id]
 */

require_once __DIR__ . '/config/Database.php';

$activityId = $argc > 1 ? (int)$argv[1] : 248;
$classId = $argc > 2 ? (int)$argv[2] : 22;

$db = (new Database())->getConnection();
if (!$db) {
    echo "Failed to connect to database.\n";
    exit(1);
}

$params = [$activityId];
$where = "WHERE aa.activity_id = ?
    AND aa.submitted_at IS NOT NULL
    AND aa.is_preview = 0
    AND aa.role = 'student'
    AND cm.course_id = c.course_id
    AND cs.status = 'accepted'";

if ($classId > 0) {
    $where .= " AND cs.class_id = ?";
    $params[] = $classId;
}

$sql = "
    SELECT 
        aa.id as attempt_id,
        aa.user_id,
        aa.score,
        aa.submitted_at,
        u.firstname,
        u.lastname,
        cs.class_id,
        cs.status
    FROM activity_attempts aa
    INNER JOIN users u ON aa.user_id = u.id
    INNER JOIN class_students cs ON aa.user_id = cs.student_user_id
    INNER JOIN classes c ON cs.class_id = c.id
    INNER JOIN lesson_activities la ON aa.activity_id = la.id
    INNER JOIN course_lessons cl ON la.lesson_id = cl.id
    INNER JOIN course_modules cm ON cl.module_id = cm.id
    $where
";

echo "SQL:\n$sql\n\n";
echo "Params:\n" . json_encode($params) . "\n\n";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Row count: " . count($rows) . "\n\n";
print_r($rows);




