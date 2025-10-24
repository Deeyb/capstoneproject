<?php
require_once 'config.php';

try {
    $pdo = new PDO('mysql:host=localhost;dbname=coderegal_db', 'root', '');
    
    // Check if TEST1-TEST6 activities exist
    echo "Checking for TEST activities in database:\n";
    $stmt = $pdo->query("SELECT la.id, la.title, la.type, cl.title as lesson_title, cl.id as lesson_id FROM lesson_activities la JOIN course_lessons cl ON la.lesson_id = cl.id WHERE cl.title LIKE '%TEST%' ORDER BY la.id LIMIT 10");
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($activities)) {
        echo "❌ NO TEST activities found in database!\n";
    } else {
        foreach($activities as $act) {
            echo "Activity: {$act['title']} (ID: {$act['id']}, Type: {$act['type']}, Lesson: {$act['lesson_title']}, Lesson ID: {$act['lesson_id']})\n";
        }
    }
    
    // Check what lessons exist with TEST in the name
    echo "\nChecking lessons with TEST in name:\n";
    $stmt = $pdo->query("SELECT id, title FROM course_lessons WHERE title LIKE '%TEST%' ORDER BY id");
    $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($lessons)) {
        echo "❌ NO lessons with TEST in name found!\n";
    } else {
        foreach($lessons as $lesson) {
            echo "Lesson: {$lesson['title']} (ID: {$lesson['id']})\n";
        }
    }
    
    // Check what activities exist in those lessons
    if (!empty($lessons)) {
        echo "\nChecking activities in TEST lessons:\n";
        foreach($lessons as $lesson) {
            $stmt = $pdo->prepare("SELECT id, title, type FROM lesson_activities WHERE lesson_id = ?");
            $stmt->execute([$lesson['id']]);
            $lessonActivities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "Lesson {$lesson['title']} (ID: {$lesson['id']}) has " . count($lessonActivities) . " activities:\n";
            foreach($lessonActivities as $act) {
                echo "  - {$act['title']} (ID: {$act['id']}, Type: {$act['type']})\n";
            }
        }
    }
    
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>

