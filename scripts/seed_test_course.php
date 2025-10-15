<?php
// Quick seeder to create a Course with modules/lessons and all activity types
// Usage: php scripts/seed_test_course.php

if (php_sapi_name() !== 'cli') { echo "Run via CLI"; exit; }

require_once __DIR__ . '/../config/Database.php';

try {
    $db = (new Database())->getConnection();
    $db->beginTransaction();

    // Create course
    $db->prepare("INSERT INTO courses (title, code, description, created_at) VALUES ('Test Course - All Types', 'TEST-ALL', 'Seeded course for preview tests', NOW())")->execute();
    $courseId = (int)$db->lastInsertId();

    // Create module
    $db->prepare("INSERT INTO course_modules (course_id, title, position) VALUES (?, 'Module 1', 1)")->execute([$courseId]);
    $moduleId = (int)$db->lastInsertId();

    // Create lessons
    $db->prepare("INSERT INTO course_lessons (module_id, title, position) VALUES (?, 'Lesson 1', 1)")->execute([$moduleId]);
    $lesson1 = (int)$db->lastInsertId();
    $db->prepare("INSERT INTO course_lessons (module_id, title, position) VALUES (?, 'Lesson 2', 2)")->execute([$moduleId]);
    $lesson2 = (int)$db->lastInsertId();

    // Activities for lesson1: quiz, identification, essay
    $ins = function($lessonId, $title, $type, $instructions, $maxScore=100) use ($db) {
        // compute next position separately to avoid 1093 error
        $q = $db->prepare("SELECT IFNULL(MAX(position),0)+1 AS next_pos FROM lesson_activities WHERE lesson_id=?");
        $q->execute([$lessonId]);
        $row = $q->fetch(PDO::FETCH_ASSOC);
        $nextPos = (int)($row['next_pos'] ?? 1);
        $stmt = $db->prepare("INSERT INTO lesson_activities (lesson_id, title, type, instructions, max_score, position) VALUES (?,?,?,?,?, ?)");
        $stmt->execute([$lessonId, $title, $type, $instructions, $maxScore, $nextPos]);
        return (int)$db->lastInsertId();
    };

    // Quiz
    $quizId = $ins($lesson1, 'Sample Quiz', 'quiz', 'Basic quiz preview');
    $db->prepare("INSERT INTO activity_questions (activity_id, question_text, position, points) VALUES (?,?,1,1)")->execute([$quizId, 'What is 2 + 2?']);
    $q1 = (int)$db->lastInsertId();
    $db->prepare("INSERT INTO question_choices (question_id, choice_text, is_correct, position) VALUES (?,?,1,1)")->execute([$q1, '4']);
    $db->prepare("INSERT INTO question_choices (question_id, choice_text, is_correct, position) VALUES (?,?,0,2)")->execute([$q1, '5']);

    // Identification
    $identId = $ins($lesson1, 'Identification', 'identification', json_encode(['instructions'=>'Type the exact answer.']));
    $db->prepare("INSERT INTO activity_questions (activity_id, question_text, position, points) VALUES (?,?,1,1)")->execute([$identId, 'A primary color starting with R']);
    $qi = (int)$db->lastInsertId();
    // store expected answer in explanation field for preview grading
    $db->prepare("UPDATE activity_questions SET explanation = ? WHERE id = ?")->execute(['red', $qi]);

    // Essay
    $essayId = $ins($lesson1, 'Essay Response', 'essay', json_encode(['instructions'=>'Write a short paragraph.']));
    $db->prepare("INSERT INTO activity_questions (activity_id, question_text, position, points) VALUES (?,?,1,5)")->execute([$essayId, 'Explain what an algorithm is in your own words.']);

    // Activities for lesson2: upload_based, coding
    $uplId = $ins($lesson2, 'Upload Diagram', 'upload_based', json_encode(['instructions'=>'Upload a PNG or PDF diagram.','acceptedFiles'=>['PDF','PNG'],'maxFileSize'=>5]));

    $codeId = $ins($lesson2, 'Coding: Print Hello', 'coding', json_encode(['instructions'=>'Write code that outputs Hello','language'=>'python','starterCode'=>'print("")']));
    $db->prepare("INSERT INTO activity_test_cases (activity_id, is_sample, input_text, expected_output_text, position) VALUES (?,?,?, ?, 1)")->execute([$codeId, 1, '', "Hello\n"]);

    $db->commit();
    echo "Seeded course ID: $courseId\n";
} catch (Throwable $e) {
    if ($db && $db->inTransaction()) $db->rollBack();
    fwrite(STDERR, 'Error: ' . $e->getMessage() . "\n");
    exit(1);
}
?>

