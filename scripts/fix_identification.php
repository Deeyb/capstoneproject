<?php
// Update the Identification activity in the seeded test course: set correct answers and add another question
// Usage: php scripts/fix_identification.php
if (php_sapi_name() !== 'cli') { echo "Run via CLI"; exit; }
require_once __DIR__ . '/../config/Database.php';

try {
    $db = (new Database())->getConnection();
    $db->beginTransaction();

    // Locate course
    $cidStmt = $db->prepare("SELECT id FROM courses WHERE code='TEST-ALL' OR title LIKE 'Test Course - All Types' ORDER BY id DESC LIMIT 1");
    $cidStmt->execute();
    $courseId = (int)($cidStmt->fetchColumn() ?: 0);
    if ($courseId <= 0) throw new Exception('Test course not found');

    // Find identification activity id
    $aidStmt = $db->prepare(
        "SELECT a.id FROM lesson_activities a
         JOIN course_lessons l ON l.id = a.lesson_id
         JOIN course_modules m ON m.id = l.module_id
         WHERE m.course_id = ? AND a.type = 'identification'
         ORDER BY a.id ASC LIMIT 1"
    );
    $aidStmt->execute([$courseId]);
    $activityId = (int)($aidStmt->fetchColumn() ?: 0);
    if ($activityId <= 0) throw new Exception('Identification activity not found');

    // Set answer (store in explanation column) for first question
    $qStmt = $db->prepare("SELECT id FROM activity_questions WHERE activity_id=? ORDER BY position ASC, id ASC");
    $qStmt->execute([$activityId]);
    $questions = $qStmt->fetchAll(PDO::FETCH_COLUMN);
    if ($questions) {
        $firstQ = (int)$questions[0];
        $upd = $db->prepare("UPDATE activity_questions SET explanation = ? WHERE id = ?");
        $upd->execute(['red', $firstQ]);
    }

    // Add another identification question with correct answer stored in explanation
    $pos = (int)$db->query("SELECT COALESCE(MAX(position),0)+1 FROM activity_questions WHERE activity_id=".$activityId)->fetchColumn();
    $insQ = $db->prepare("INSERT INTO activity_questions (activity_id, question_text, explanation, position, points) VALUES (?,?,?,?,?)");
    $insQ->execute([$activityId, 'First planet in the Solar System', 'mercury', $pos, 1]);

    $db->commit();
    echo "Identification activity updated: answers set and second question added.\n";
} catch (Throwable $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    fwrite(STDERR, 'Error: ' . $e->getMessage() . "\n");
    exit(1);
}
?>



