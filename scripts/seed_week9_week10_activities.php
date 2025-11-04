<?php
// Seed Week 9 & Week 10 coding activities for a given course_id
// Usage: /scripts/seed_week9_week10_activities.php?course_id=123

if (session_status() === PHP_SESSION_NONE) {
	session_start();
}

header('Content-Type: application/json');

try {
	$courseId = (int)($_GET['course_id'] ?? 0);
	if ($courseId <= 0) { echo json_encode(['success'=>false,'message'=>'Missing course_id']); exit; }

	require_once __DIR__ . '/../config/Database.php';
	require_once __DIR__ . '/../classes/CourseService.php';
	$db = (new Database())->getConnection();
	$svc = new CourseService($db);

	$outline = $svc->getCourseOutline($courseId);
	if (!$outline) { echo json_encode(['success'=>false,'message'=>'No outline found']); exit; }

	// Map lesson titles to IDs (case-insensitive contains match)
	$map = [];
	foreach ($outline as $m) {
		foreach (($m['lessons'] ?? []) as $l) {
			$t = strtolower(trim($l['title'] ?? ''));
			$map[$t] = (int)$l['id'];
		}
	}

	function findLessonId(array $map, array $candidates) {
		foreach ($map as $title => $id) {
			foreach ($candidates as $needle) {
				if (strpos($title, strtolower($needle)) !== false) return $id;
			}
		}
		return 0;
	}

	$results = [];

	// ==========================================
	// WEEK 9 - REPETITION CONTROL STRUCTURES
	// ==========================================

	// 1) WHILE LOOP - Count from 1 to N
	$lessonId = findLessonId($map, ['repetition control structures','while loop','while statement']);
	if ($lessonId > 0) {
		$actId = $svc->createActivity($lessonId, 'While Loop: Count from 1 to N', json_encode(['kind'=>'coding']), 'coding', null, 10);
		if ($actId > 0) {
			$svc->addQuestion($actId, 'Write a C++ program that uses a while loop to print numbers from 1 to N. The program should read an integer N from the user and display all numbers from 1 to N, each on a new line.', 10, 'Ensure you initialize the counter before the loop, use proper condition, and increment inside the loop.');
			// Test cases
			$svc->addTestCase($actId, false, '5', "1\n2\n3\n4\n5", 2000);
			$svc->addTestCase($actId, false, '10', "1\n2\n3\n4\n5\n6\n7\n8\n9\n10", 2000);
			$svc->addTestCase($actId, true, '3', "1\n2\n3", 2000); // Sample test case
			$results[] = ['title'=>'While Loop: Count from 1 to N','lesson_id'=>$lessonId,'id'=>$actId];
		}
	}

	// 2) DO-WHILE LOOP - Sum until user enters 0
	$lessonId = findLessonId($map, ['repetition control structures','do-while loop','do while']);
	if ($lessonId > 0) {
		$actId = $svc->createActivity($lessonId, 'Do-While Loop: Sum Numbers', json_encode(['kind'=>'coding']), 'coding', null, 10);
		if ($actId > 0) {
			$svc->addQuestion($actId, 'Write a C++ program using a do-while loop that repeatedly asks the user to enter a number. The program should keep adding numbers until the user enters 0. When 0 is entered, display the total sum.', 10, 'Remember: do-while executes at least once, then checks the condition.');
			// Test cases
			$svc->addTestCase($actId, true, "5\n3\n2\n0", "Enter a number: Enter a number: Enter a number: Enter a number: Sum: 10", 2000); // Sample
			$svc->addTestCase($actId, false, "10\n20\n0", "Enter a number: Enter a number: Enter a number: Sum: 30", 2000);
			$svc->addTestCase($actId, false, "0", "Enter a number: Sum: 0", 2000);
			$results[] = ['title'=>'Do-While Loop: Sum Numbers','lesson_id'=>$lessonId,'id'=>$actId];
		}
	}

	// 3) FOR LOOP - Sum of numbers from 1 to N
	$lessonId = findLessonId($map, ['repetition control structures','for loop','for statement']);
	if ($lessonId > 0) {
		$actId = $svc->createActivity($lessonId, 'For Loop: Sum of Numbers', json_encode(['kind'=>'coding']), 'coding', null, 10);
		if ($actId > 0) {
			$svc->addQuestion($actId, 'Write a C++ program using a for loop to calculate and display the sum of all numbers from 1 to N, where N is entered by the user. Display the result as "Sum: [result]".', 10, 'Initialize sum to 0, use for loop with counter from 1 to N, add counter to sum in each iteration.');
			// Test cases
			$svc->addTestCase($actId, true, '5', "Sum: 15", 2000); // Sample: 1+2+3+4+5 = 15
			$svc->addTestCase($actId, false, '10', "Sum: 55", 2000); // 1+2+...+10 = 55
			$svc->addTestCase($actId, false, '3', "Sum: 6", 2000); // 1+2+3 = 6
			$results[] = ['title'=>'For Loop: Sum of Numbers','lesson_id'=>$lessonId,'id'=>$actId];
		}
	}

	// 4) NESTED FOR LOOP - Star Pattern
	$lessonId = findLessonId($map, ['repetition control structures','nested for loop','nested loops']);
	if ($lessonId > 0) {
		$actId = $svc->createActivity($lessonId, 'Nested For Loop: Star Pattern', json_encode(['kind'=>'coding']), 'coding', null, 10);
		if ($actId > 0) {
			$svc->addQuestion($actId, 'Write a C++ program using nested for loops to print a right-angled triangle pattern of stars. The program should read an integer N and print N rows where the first row has 1 star, second row has 2 stars, and so on. Each row should be on a new line.', 10, 'Use outer loop for rows (1 to N), inner loop for stars (1 to row number), print newline after each row.');
			// Test cases
			$svc->addTestCase($actId, true, '5', "*\n**\n***\n****\n*****", 2000); // Sample
			$svc->addTestCase($actId, false, '3', "*\n**\n***", 2000);
			$svc->addTestCase($actId, false, '4', "*\n**\n***\n****", 2000);
			$results[] = ['title'=>'Nested For Loop: Star Pattern','lesson_id'=>$lessonId,'id'=>$actId];
		}
	}

	// ==========================================
	// WEEK 10 - SELECTION CONTROL STRUCTURES
	// ==========================================

	// 5) IF STATEMENT - Positive Number Check
	$lessonId = findLessonId($map, ['selection control structures','if statement','if']);
	if ($lessonId > 0) {
		$actId = $svc->createActivity($lessonId, 'If Statement: Positive Number Check', json_encode(['kind'=>'coding']), 'coding', null, 10);
		if ($actId > 0) {
			$svc->addQuestion($actId, 'Write a C++ program that reads an integer. If the number is positive (greater than 0), display "Positive number". If the number is 0 or negative, do not display anything.', 10, 'Use a simple if statement with condition (number > 0).');
			// Test cases
			$svc->addTestCase($actId, true, '5', "Positive number", 2000); // Sample
			$svc->addTestCase($actId, false, '10', "Positive number", 2000);
			$svc->addTestCase($actId, false, '0', "", 2000);
			$svc->addTestCase($actId, false, '-5', "", 2000);
			$results[] = ['title'=>'If Statement: Positive Number Check','lesson_id'=>$lessonId,'id'=>$actId];
		}
	}

	// 6) IF-ELSE - Even or Odd Checker
	$lessonId = findLessonId($map, ['selection control structures','if-else statement','if else']);
	if ($lessonId > 0) {
		$actId = $svc->createActivity($lessonId, 'If-Else: Even or Odd Checker', json_encode(['kind'=>'coding']), 'coding', null, 10);
		if ($actId > 0) {
			$svc->addQuestion($actId, 'Write a C++ program that reads an integer. If the number is even, display "Even Number". If the number is odd, display "ODD Number". Use if-else statement.', 10, 'Use modulo operator (%) to check if number % 2 == 0 for even, else odd.');
			// Test cases
			$svc->addTestCase($actId, true, '4', "Even Number", 2000); // Sample
			$svc->addTestCase($actId, false, '7', "ODD Number", 2000);
			$svc->addTestCase($actId, false, '10', "Even Number", 2000);
			$svc->addTestCase($actId, false, '3', "ODD Number", 2000);
			$results[] = ['title'=>'If-Else: Even or Odd Checker','lesson_id'=>$lessonId,'id'=>$actId];
		}
	}

	// 7) IF-ELSE IF - Grade Classifier
	$lessonId = findLessonId($map, ['selection control structures','if-else if','if else if']);
	if ($lessonId > 0) {
		$actId = $svc->createActivity($lessonId, 'If-Else If: Grade Classifier', json_encode(['kind'=>'coding']), 'coding', null, 10);
		if ($actId > 0) {
			$svc->addQuestion($actId, 'Write a C++ program that reads a score (0-100). Display "Excellent" if score >= 90, "Good" if score >= 70 and < 90, "Pass" if score >= 50 and < 70, otherwise display "Fail". Use if-else if statements.', 10, 'Check conditions from highest to lowest: >= 90, >= 70, >= 50, else.');
			// Test cases
			$svc->addTestCase($actId, true, '95', "Excellent", 2000); // Sample
			$svc->addTestCase($actId, false, '75', "Good", 2000);
			$svc->addTestCase($actId, false, '60', "Pass", 2000);
			$svc->addTestCase($actId, false, '40', "Fail", 2000);
			$results[] = ['title'=>'If-Else If: Grade Classifier','lesson_id'=>$lessonId,'id'=>$actId];
		}
	}

	// 8) NESTED IF - Age Category Checker
	$lessonId = findLessonId($map, ['selection control structures','nested if','nested']);
	if ($lessonId > 0) {
		$actId = $svc->createActivity($lessonId, 'Nested If: Age Category Checker', json_encode(['kind'=>'coding']), 'coding', null, 10);
		if ($actId > 0) {
			$svc->addQuestion($actId, 'Write a C++ program that reads an age. If age >= 18, check if age >= 65 and display "Senior Adult", otherwise display "Adult". If age < 18, check if age >= 13 and display "Teenager", otherwise display "Child". Use nested if statements.', 10, 'First check if age >= 18, then nest if-else inside for further classification.');
			// Test cases
			$svc->addTestCase($actId, true, '20', "Adult", 2000); // Sample
			$svc->addTestCase($actId, false, '70', "Senior Adult", 2000);
			$svc->addTestCase($actId, false, '15', "Teenager", 2000);
			$svc->addTestCase($actId, false, '8', "Child", 2000);
			$results[] = ['title'=>'Nested If: Age Category Checker','lesson_id'=>$lessonId,'id'=>$actId];
		}
	}

	// 9) SWITCH STATEMENT - Day of Week
	$lessonId = findLessonId($map, ['selection control structures','switch statement','switch']);
	if ($lessonId > 0) {
		$actId = $svc->createActivity($lessonId, 'Switch Statement: Day of Week', json_encode(['kind'=>'coding']), 'coding', null, 10);
		if ($actId > 0) {
			$svc->addQuestion($actId, 'Write a C++ program that reads a number (1-7) representing the day of the week. Use a switch statement to display: 1=Sunday, 2=Monday, 3=Tuesday, 4=Wednesday, 5=Thursday, 6=Friday, 7=Saturday. For invalid numbers, display "Invalid day".', 10, 'Use switch with cases 1-7, each with break statement. Add default case for invalid input.');
			// Test cases
			$svc->addTestCase($actId, true, '1', "Sunday", 2000); // Sample
			$svc->addTestCase($actId, false, '3', "Tuesday", 2000);
			$svc->addTestCase($actId, false, '7', "Saturday", 2000);
			$svc->addTestCase($actId, false, '10', "Invalid day", 2000);
			$results[] = ['title'=>'Switch Statement: Day of Week','lesson_id'=>$lessonId,'id'=>$actId];
		}
	}

	echo json_encode(['success'=>true,'created'=>$results]);
} catch (Throwable $e) {
	echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}

?>

