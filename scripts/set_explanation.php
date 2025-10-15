<?php
if (php_sapi_name() !== 'cli') { echo "Run via CLI"; exit; }
require_once __DIR__ . '/../config/Database.php';
$db = (new Database())->getConnection();
$qid = isset($argv[1]) ? (int)$argv[1] : 0;
$text = isset($argv[2]) ? $argv[2] : '';
if ($qid <= 0) { echo "Usage: php scripts/set_explanation.php <question_id> <text>\n"; exit; }
$stmt = $db->prepare('UPDATE activity_questions SET explanation=? WHERE id=?');
$stmt->execute([$text, $qid]);
echo "Updated question $qid.\n";
?>


