<?php
/**
 * Get attempt results (question-by-question breakdown)
 * Returns detailed results for displaying Test Results modal
 */

// CRITICAL: Set session path BEFORE any session_start() calls
$sessionPath = __DIR__ . '/sessions';
if (!is_dir($sessionPath)) {
    @mkdir($sessionPath, 0777, true);
}
if (is_dir($sessionPath) && is_writable($sessionPath)) {
    ini_set('session.save_path', $sessionPath);
}

// Start session if not already started - use same logic as main app
if (session_status() === PHP_SESSION_NONE) {
    // Try to use the same session name as the main app
    $preferred = 'CodeRegalSession';
    $legacy = 'PHPSESSID';
    if (!empty($_COOKIE[$preferred])) { 
        session_name($preferred); 
    } elseif (!empty($_COOKIE[$legacy])) { 
        session_name($legacy); 
    } else { 
        session_name($preferred); 
    }
    @session_start();
    
    // If still no user_id, try alternate session name
    if (empty($_SESSION['user_id'])) {
        $current = session_name();
        $alt = ($current === $preferred) ? $legacy : $preferred;
        if (!empty($_COOKIE[$alt])) {
            @session_write_close();
            session_name($alt);
            @session_id($_COOKIE[$alt]);
            @session_start();
        }
    }
}

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/classes/auth_helpers.php';
require_once __DIR__ . '/classes/ActivityAttemptService.php';
require_once __DIR__ . '/classes/CourseService.php';

header('Content-Type: application/json');

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        throw new Exception('Database connection failed');
    }
    
    // Check authentication without redirecting (for API endpoints)
    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized'
        ]);
        exit;
    }
    
    $userId = (int)($_SESSION['user_id'] ?? 0);
    if ($userId <= 0) {
        throw new Exception('User not authenticated');
    }
    
    $attemptId = (int)($_GET['attempt_id'] ?? 0);
    if ($attemptId <= 0) {
        throw new Exception('Invalid attempt ID');
    }
    
    $attemptService = new ActivityAttemptService($db);
    $courseService = new CourseService($db);
    
    // Get attempt details
    $attempt = $attemptService->getAttempt($attemptId);
    if (!$attempt) {
        throw new Exception('Attempt not found');
    }
    
    // Verify ownership (only the student who submitted can view their results)
    if ((int)$attempt['user_id'] !== $userId) {
        // Check if user is teacher/coordinator (they can view any attempt)
        $userRole = strtoupper($_SESSION['user_role'] ?? '');
        if ($userRole !== 'TEACHER' && $userRole !== 'COORDINATOR') {
            throw new Exception('Unauthorized: You can only view your own attempt results');
        }
    }
    
    // Get activity details
    $activity = $courseService->getActivity($attempt['activity_id']);
    if (!$activity) {
        throw new Exception('Activity not found');
    }
    
    // Get questions for this activity
    $questions = $activity['questions'] ?? [];
    
    // Build results array with question-by-question breakdown
    $results = [];
    $totalScore = 0;
    $maxScore = 0;
    $correctCount = 0;
    
    $activityType = strtolower($activity['type'] ?? 'multiple_choice');
    if (!in_array($activityType, ['multiple_choice','mcq','quiz','true_false','identification','matching','essay','upload_based'], true)) {
        $activityType = 'multiple_choice';
    }

    foreach ($questions as $index => $question) {
        $questionId = (int)$question['id'];
        $points = (float)($question['points'] ?? 1);
        $maxScore += $points;
        
        // Find corresponding attempt item
        $attemptItem = null;
        foreach ($attempt['items'] ?? [] as $item) {
            if ((int)$item['question_id'] === $questionId) {
                $attemptItem = $item;
                break;
            }
        }
        
        // Get student answer and correctness
        $studentAnswer = null;
        $studentAnswerDisplay = '(No answer)';
        $isCorrect = false;
        $earnedPoints = 0;
        $correctAnswer = '';
        $explanation = '';
        
        if ($attemptItem) {
            // Get student answer from attempt item
            $responseText = $attemptItem['response_text'] ?? '';
            $choiceIds = $attemptItem['choice_ids'] ?? null;
            // CRITICAL: Use is_correct and points_awarded from attempt item (these are the actual graded values)
            $isCorrectFromAttempt = (bool)($attemptItem['is_correct'] ?? false);
            $earnedPointsRaw = $attemptItem['points_awarded'] ?? null;
            $earnedPoints = is_null($earnedPointsRaw) ? 0.0 : (float)$earnedPointsRaw;
            // Trust is_correct; if is_correct and points_awarded is null/0, award full question points as fallback
            $isCorrect = $isCorrectFromAttempt;
            if ($isCorrectFromAttempt && ($earnedPoints <= 0)) {
                $earnedPoints = $points;
            }
            
            // Format student answer for display
            $questionType = $question['type'] ?? null;
            if (!$questionType) {
                $questionType = $activityType;
            }
            $questionType = strtolower($questionType);
            
            if (in_array($questionType, ['multiple_choice', 'mcq', 'quiz', 'true_false'], true)) {
                // For choice-based questions, get the choice text
                if ($choiceIds) {
                    $choiceId = (int)$choiceIds;
                    $choices = $question['choices'] ?? [];
                    $selectedChoice = null;
                    foreach ($choices as $choice) {
                        if ((int)$choice['id'] === $choiceId) {
                            $selectedChoice = $choice;
                            break;
                        }
                    }
                    if ($selectedChoice) {
                        $choiceText = $selectedChoice['choice_text'] ?? $selectedChoice['text'] ?? '';
                        // For True/False, format the display text
                        if ($questionType === 'true_false') {
                            $choiceTextLower = strtolower(trim($choiceText));
                            if ($choiceTextLower === 'true' || $choiceTextLower === '1') {
                                $studentAnswerDisplay = 'True';
                            } elseif ($choiceTextLower === 'false' || $choiceTextLower === '0') {
                                $studentAnswerDisplay = 'False';
                            } else {
                                $studentAnswerDisplay = ucfirst($choiceText) ?: `Choice ${choiceId}`;
                            }
                        } else {
                            $studentAnswerDisplay = $choiceText ?: `Choice ${choiceId}`;
                        }
                    } else {
                        $studentAnswerDisplay = $responseText ?: '(No answer)';
                    }
                } else {
                    $studentAnswerDisplay = $responseText ?: '(No answer)';
                }
                
                // Get correct answer - ALWAYS show correct answer (even if student got it right)
                $correctChoice = null;
                $correctChoiceText = '';
                
                // PRIORITY 1: Try to get from loaded choices array
                foreach ($question['choices'] ?? [] as $choice) {
                    // Check multiple formats for is_correct flag
                    $choiceIsCorrect = false;
                    if (isset($choice['is_correct'])) {
                        $choiceIsCorrect = !!$choice['is_correct'] || $choice['is_correct'] === 1 || $choice['is_correct'] === '1';
                    } elseif (isset($choice['correct'])) {
                        $choiceIsCorrect = !!$choice['correct'] || $choice['correct'] === 1 || $choice['correct'] === '1';
                    }
                    
                    if ($choiceIsCorrect) {
                        $correctChoice = $choice;
                        $correctChoiceText = $correctChoice['choice_text'] ?? $correctChoice['text'] ?? '';
                        break;
                    }
                }
                
                // PRIORITY 2: If no correct choice found in loaded data, query database directly
                if (empty($correctChoiceText)) {
                    try {
                        $db = (new Database())->getConnection();
                        $choiceStmt = $db->prepare("
                            SELECT choice_text, text, is_correct, correct 
                            FROM question_choices 
                            WHERE question_id = ? AND (is_correct = 1 OR correct = 1)
                            LIMIT 1
                        ");
                        $choiceStmt->execute([$questionId]);
                        $dbChoice = $choiceStmt->fetch(PDO::FETCH_ASSOC);
                        if ($dbChoice) {
                            $correctChoiceText = $dbChoice['choice_text'] ?? $dbChoice['text'] ?? '';
                        }
                    } catch (Exception $e) {
                        error_log("Error fetching correct choice for question $questionId: " . $e->getMessage());
                    }
                }
                
                // Format the correct answer
                if (!empty($correctChoiceText)) {
                    // For True/False, format the display text
                    if ($questionType === 'true_false') {
                        $correctTextLower = strtolower(trim($correctChoiceText));
                        if ($correctTextLower === 'true' || $correctTextLower === '1') {
                            $correctAnswer = 'True';
                        } elseif ($correctTextLower === 'false' || $correctTextLower === '0') {
                            $correctAnswer = 'False';
                        } else {
                            $correctAnswer = ucfirst($correctChoiceText);
                        }
                    } else {
                        $correctAnswer = $correctChoiceText;
                    }
                } else {
                    // Final fallback if no correct choice found
                    $correctAnswer = 'N/A';
                }
            } elseif ($questionType === 'identification') {
                // For identification, use response_text directly
                $studentAnswerDisplay = $responseText ?: '(No answer)';
                
                // Initialize correct answer
                $correctAnswer = '';
                
                // Get explanation from question data first
                $explanationRaw = isset($question['explanation']) ? trim((string)$question['explanation']) : '';
                
                // If explanation is empty in question data, query database directly
                if (empty($explanationRaw)) {
                    try {
                        $db = (new Database())->getConnection();
                        $expStmt = $db->prepare("SELECT explanation, answer FROM activity_questions WHERE id = ?");
                        $expStmt->execute([$questionId]);
                        $expData = $expStmt->fetch(PDO::FETCH_ASSOC);
                        if ($expData) {
                            $explanationRaw = isset($expData['explanation']) ? trim((string)$expData['explanation']) : '';
                            // Also get answer field as fallback
                            if (empty($explanationRaw) && isset($expData['answer']) && !empty($expData['answer'])) {
                                $explanationRaw = trim((string)$expData['answer']);
                            }
                        }
                    } catch (Exception $e) {
                        error_log("Error fetching explanation for question $questionId: " . $e->getMessage());
                    }
                }
                
                // PRIORITY 1: Try to get from explanation field (JSON format with primary/alternatives)
                if (!empty($explanationRaw)) {
                    // Try parsing as JSON first
                    $explanationData = json_decode($explanationRaw, true);
                    
                    if (json_last_error() === JSON_ERROR_NONE && is_array($explanationData)) {
                        // JSON format: {"primary": "...", "alternatives": [...]}
                        if (isset($explanationData['primary']) && !empty($explanationData['primary'])) {
                            $primaryAnswer = trim((string)$explanationData['primary']);
                            if (!empty($primaryAnswer)) {
                                $correctAnswer = ucfirst($primaryAnswer);
                            }
                        }
                        
                        // If primary is empty, try alternatives
                        if (empty($correctAnswer) && isset($explanationData['alternatives']) && is_array($explanationData['alternatives'])) {
                            foreach ($explanationData['alternatives'] as $alt) {
                                $altText = trim((string)$alt);
                                if (!empty($altText)) {
                                    $correctAnswer = ucfirst($altText);
                                    break;
                                }
                            }
                        }
                    } else {
                        // Not JSON - treat as plain text (legacy format where explanation IS the answer)
                        $correctAnswer = ucfirst($explanationRaw);
                    }
                }
                
                // PRIORITY 2: Fallback to answer field if explanation didn't yield a result
                if (empty($correctAnswer)) {
                    // Try answer field from question data
                    if (isset($question['answer']) && !empty($question['answer'])) {
                        $answerText = trim((string)$question['answer']);
                        if (!empty($answerText)) {
                            $correctAnswer = ucfirst($answerText);
                        }
                    }
                    
                    // If still empty, try direct database query for answer field
                    if (empty($correctAnswer)) {
                        try {
                            $db = (new Database())->getConnection();
                            $ansStmt = $db->prepare("SELECT answer FROM activity_questions WHERE id = ?");
                            $ansStmt->execute([$questionId]);
                            $ansData = $ansStmt->fetch(PDO::FETCH_ASSOC);
                            if ($ansData && isset($ansData['answer']) && !empty($ansData['answer'])) {
                                $correctAnswer = ucfirst(trim((string)$ansData['answer']));
                            }
                        } catch (Exception $e) {
                            error_log("Error fetching answer field for question $questionId: " . $e->getMessage());
                        }
                    }
                }
                
                // Final fallback - show N/A only if we truly couldn't find the answer
                if (empty($correctAnswer)) {
                    $correctAnswer = 'N/A';
                }
                
                // If server-side grading flagged incorrect but normalized answers match, treat as correct
                if (!$isCorrect && !empty($correctAnswer) && !empty($responseText)) {
                    $normalizedStudent = preg_replace('/\s+/u', ' ', preg_replace('/[^\w\s]/u', '', mb_strtolower($responseText)));
                    $normalizedCorrect = preg_replace('/\s+/u', ' ', preg_replace('/[^\w\s]/u', '', mb_strtolower($correctAnswer)));
                    if (!empty($normalizedStudent) && $normalizedStudent === $normalizedCorrect) {
                        $isCorrect = true;
                        $earnedPoints = $points;
                    }
                }
            } else {
                // For other types (essay, upload_based, etc.)
                $studentAnswerDisplay = $responseText ?: '(No answer)';
                $correctAnswer = 'N/A (Manual grading)';
            }
            
            // Get explanation
            if (isset($question['explanation']) && $questionType !== 'identification') {
                try {
                    $explanationData = json_decode($question['explanation'], true);
                    if (is_array($explanationData) && isset($explanationData['explanation'])) {
                        $explanation = $explanationData['explanation'];
                    } else {
                        $explanation = $question['explanation'];
                    }
                } catch (Exception $e) {
                    $explanation = $question['explanation'] ?? '';
                }
            }
        }
        
        // Final normalization fallback: if displayed answer matches correct answer text, mark correct
        if (
            !$isCorrect &&
            !empty($correctAnswer) &&
            !empty($studentAnswerDisplay) &&
            strtolower(trim((string)$correctAnswer)) !== 'n/a'
        ) {
            $normalizedStudentDisplay = strtolower(trim(preg_replace('/\s+/u', ' ', (string)$studentAnswerDisplay)));
            $normalizedCorrectDisplay = strtolower(trim(preg_replace('/\s+/u', ' ', (string)$correctAnswer)));
            if ($normalizedStudentDisplay !== '' && $normalizedStudentDisplay === $normalizedCorrectDisplay) {
                $isCorrect = true;
                if ($earnedPoints <= 0) {
                    $earnedPoints = $points;
                }
            }
        }
        
        // Count as correct if marked correct in attempt (points may be missing in some legacy attempts)
        if ($isCorrect) {
            $correctCount++;
        }
        $totalScore += $earnedPoints;
        
        $results[] = [
            'questionIndex' => $index + 1,
            'questionId' => $questionId,
            'questionText' => $question['question_text'] ?? $question['text'] ?? `Question ${index + 1}`,
            'questionType' => $question['type'] ?? 'multiple_choice',
            'studentAnswer' => $studentAnswerDisplay,
            'correctAnswer' => $correctAnswer,
            'isCorrect' => $isCorrect,
            'points' => $points,
            'earnedPoints' => $earnedPoints,
            'explanation' => $explanation
        ];
    }
    
    // Calculate percentage
    // CRITICAL: Use attempt score as primary source, fallback to computed totalScore
    // The attempt score is the authoritative source (saved during submission)
    $finalTotalScore = $totalScore;
    if (isset($attempt['score']) && $attempt['score'] !== null) {
        $attemptScore = (float)$attempt['score'];
        // If attempt score exists and is different from computed, trust attempt score
        // (This handles cases where computed score might be wrong due to legacy data)
        if ($attemptScore > 0 || ($attemptScore == 0 && $totalScore > 0)) {
            $finalTotalScore = $attemptScore;
            error_log("get_attempt_results - Using attempt score {$attemptScore} instead of computed {$totalScore} for attempt {$attemptId}");
        }
    }
    
    // If both are 0 or null, that's a valid score (student got everything wrong)
    $percentage = $maxScore > 0 ? (($finalTotalScore / $maxScore) * 100) : 0;
    
    error_log("get_attempt_results - Attempt {$attemptId}: finalTotalScore={$finalTotalScore}, maxScore={$maxScore}, percentage={$percentage}, correctCount={$correctCount}");
    
    echo json_encode([
        'success' => true,
        'attempt' => [
            'id' => $attempt['id'],
            'activity_id' => $attempt['activity_id'],
            'score' => $attempt['score'],
            'submitted_at' => $attempt['submitted_at']
        ],
        'activity' => [
            'id' => $activity['id'],
            'title' => $activity['title'],
            'max_score' => $activity['max_score'] ?? $maxScore
        ],
        'results' => $results,
        'summary' => [
            'totalScore' => $finalTotalScore,
            'maxScore' => $maxScore,
            'percentage' => round($percentage, 1),
            'correctCount' => $correctCount,
            'totalCount' => count($questions)
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Get attempt results error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>

