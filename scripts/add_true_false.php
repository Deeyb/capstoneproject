<?php
// Usage: php scripts/add_true_false.php
if (php_sapi_name() !== 'cli') { echo "Run via CLI"; exit; }
require_once __DIR__ . '/../config/Database.php';

try {
    $db = (new Database())->getConnection();
    $db->beginTransaction();

    // Find the test course (by code or title)
    $stmt = $db->prepare("SELECT id FROM courses WHERE code='TEST-ALL' OR title LIKE 'Test Course - All Types' ORDER BY id DESC LIMIT 1");
    $stmt->execute();
    $courseId = (int)($stmt->fetchColumn() ?: 0);
    if ($courseId <= 0) { throw new Exception('Test course not found'); }

    // Find Module 1 id
    $stmt = $db->prepare("SELECT id FROM course_modules WHERE course_id=? ORDER BY position ASC, id ASC LIMIT 1");
    $stmt->execute([$courseId]);
    $moduleId = (int)($stmt->fetchColumn() ?: 0);
    if ($moduleId <= 0) { throw new Exception('Module not found'); }

    // Find Lesson 2 id
    $stmt = $db->prepare("SELECT id FROM course_lessons WHERE module_id=? ORDER BY position ASC, id ASC");
    $stmt->execute([$moduleId]);
    $lessons = $stmt->fetchAll(PDO::FETCH_COLUMN);
    if (!$lessons || count($lessons) < 2) { throw new Exception('Lesson 2 not found'); }
    $lesson2 = (int)$lessons[1];

    // Compute next position in lesson_activities
    $pos = (int)$db->query("SELECT COALESCE(MAX(position),0)+1 FROM lesson_activities WHERE lesson_id=" . $lesson2)->fetchColumn();

    // Insert true/false activity
    $title = 'True or False: Basics';
    $instructions = json_encode(['kind'=>'true_false','instructions'=>'Answer true or false.']);
    $stmt = $db->prepare("INSERT INTO lesson_activities (lesson_id, type, title, instructions, max_score, position) VALUES (?,?,?,?,?,?)");
    $stmt->execute([$lesson2, 'true_false', $title, $instructions, 1, $pos]);
    $activityId = (int)$db->lastInsertId();

    // Add a single TF question (store as two choices)
    $stmt = $db->prepare("INSERT INTO activity_questions (activity_id, question_text, explanation, position, points) VALUES (?,?,?,?,?)");
    $stmt->execute([$activityId, 'The Earth orbits the Sun.', null, 1, 1]);
    $qid = (int)$db->lastInsertId();

    $ch = $db->prepare("INSERT INTO question_choices (question_id, choice_text, is_correct, position) VALUES (?,?,?,?)");
    $ch->execute([$qid, 'True', 1, 1]);
    $ch->execute([$qid, 'False', 0, 2]);

    $db->commit();
    echo "Added True/False activity (ID: $activityId) to Lesson 2.\n";
} catch (Throwable $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    fwrite(STDERR, 'Error: ' . $e->getMessage() . "\n");
    exit(1);
}
?>



