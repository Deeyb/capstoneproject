<?php
require_once __DIR__ . '/../config/Database.php';
$id = isset($argv[1]) ? (int)$argv[1] : 0;
if ($id <= 0) { echo "Usage: php scripts/debug_activity.php <activity_id>\n"; exit; }
$db = (new Database())->getConnection();
$a = $db->prepare('SELECT * FROM lesson_activities WHERE id=?');
$a->execute([$id]);
$act = $a->fetch(PDO::FETCH_ASSOC);
echo "Activity: "; var_export($act); echo "\n";
$q = $db->prepare('SELECT * FROM activity_questions WHERE activity_id=? ORDER BY position,id');
$q->execute([$id]);
$questions = $q->fetchAll(PDO::FETCH_ASSOC);
echo "Questions: "; var_export($questions); echo "\n";
if ($questions) {
  $c = $db->prepare('SELECT * FROM question_choices WHERE question_id=? ORDER BY position,id');
  foreach ($questions as $qq) { $c->execute([$qq['id']]); echo "Choices for Q{$qq['id']}: "; var_export($c->fetchAll(PDO::FETCH_ASSOC)); echo "\n"; }
}
?>



