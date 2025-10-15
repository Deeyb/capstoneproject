<?php
// Ensure Essay activity has a question populated with expected answer
if (php_sapi_name() !== 'cli') { echo "Run via CLI"; exit; }
require_once __DIR__ . '/../config/Database.php';

try {
    $db = (new Database())->getConnection();
    $db->beginTransaction();

    $cid = (int)$db->query("SELECT id FROM courses WHERE code='TEST-ALL' OR title LIKE 'Test Course - All Types' ORDER BY id DESC LIMIT 1")->fetchColumn();
    if ($cid <= 0) throw new Exception('Course not found');

    $aid = (int)$db->query("SELECT a.id FROM lesson_activities a JOIN course_lessons l ON l.id=a.lesson_id JOIN course_modules m ON m.id=l.module_id WHERE m.course_id={$cid} AND a.type IN ('essay','multiple_choice','quiz') AND a.title LIKE 'Essay Response' ORDER BY a.id DESC LIMIT 1")->fetchColumn();
    if ($aid <= 0) throw new Exception('Essay activity not found');

    // Ensure at least one question exists
    $qCount = (int)$db->query("SELECT COUNT(*) FROM activity_questions WHERE activity_id={$aid}")->fetchColumn();
    if ($qCount === 0) {
        $db->exec("INSERT INTO activity_questions (activity_id, question_text, explanation, position, points) VALUES ({$aid}, 'Explain what an algorithm is in your own words.', 'Steps to solve a problem', 1, 5)");
    } else {
        // Update the first question's explanation as expected answer
        $qid = (int)$db->query("SELECT id FROM activity_questions WHERE activity_id={$aid} ORDER BY position ASC, id ASC LIMIT 1")->fetchColumn();
        $stmt = $db->prepare("UPDATE activity_questions SET question_text=?, explanation=?, points=? WHERE id=?");
        $stmt->execute(['Explain what an algorithm is in your own words.', 'Steps to solve a problem', 5, $qid]);
    }

    // Mark activity type explicitly as essay
    $stmt2 = $db->prepare("UPDATE lesson_activities SET type='essay' WHERE id=?");
    $stmt2->execute([$aid]);

    $db->commit();
    echo "Essay activity fixed and populated.\n";
} catch (Throwable $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    fwrite(STDERR, 'Error: ' . $e->getMessage() . "\n");
    exit(1);
}
?>



