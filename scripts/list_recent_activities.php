<?php
require_once __DIR__ . '/../config/Database.php';
$db = (new Database())->getConnection();
$rows = $db->query('SELECT a.id,a.title,a.type, l.id as lesson_id FROM lesson_activities a JOIN course_lessons l ON l.id=a.lesson_id ORDER BY a.id DESC LIMIT 20')->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as $r) {
  echo $r['id'] . '|' . $r['type'] . '|' . $r['title'] . '|lesson:' . $r['lesson_id'] . "\n";
}
?>


