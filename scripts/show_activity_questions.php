<?php
require_once __DIR__ . '/../config/Database.php';
$aid = isset($argv[1]) ? (int)$argv[1] : 0;
if ($aid <= 0) { echo "Usage: php scripts/show_activity_questions.php <activity_id>\n"; exit; }
$db = (new Database())->getConnection();
$rows = $db->query('SELECT id,question_text,explanation,points FROM activity_questions WHERE activity_id='.(int)$aid.' ORDER BY position,id')->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as $r) {
  echo $r['id'].'|'.$r['points'].'|'.str_replace("\n", ' ', (string)($r['explanation'] ?? ''))."\n";
}
?>



