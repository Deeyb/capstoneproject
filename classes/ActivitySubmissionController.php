<?php
/**
 * Activity Submission Controller
 * OOP controller for handling activity submissions (draft and final)
 */
require_once __DIR__ . '/ActivityAttemptService.php';
require_once __DIR__ . '/ActivityProgressService.php';
require_once __DIR__ . '/CourseService.php';

class ActivitySubmissionController {
    private $db;
    private $attemptService;
    private $progressService;
    private $courseService;
    
    public function __construct($database) {
        $this->db = $database;
        $this->attemptService = new ActivityAttemptService($database);
        $this->progressService = new ActivityProgressService($database);
        $this->courseService = new CourseService($database);
    }
    
    /**
     * Handle request - routes to appropriate method
     */
    public function handleRequest($input, $userId) {
        $action = $input['action'] ?? 'submit';
        
        switch ($action) {
            case 'start_attempt':
                return $this->startAttempt($input, $userId);
            case 'submit':
                return $this->submitActivity($input, $userId);
            default:
                throw new InvalidArgumentException('Unknown action: ' . $action);
        }
    }
    
    /**
     * Start a new attempt
     */
    private function startAttempt($input, $userId) {
        $activityId = (int)($input['activity_id'] ?? 0);
        
        if ($activityId <= 0) {
            throw new InvalidArgumentException('Invalid activity ID');
        }
        
        $result = $this->attemptService->startAttempt($activityId, $userId);
        
        return [
            'success' => true,
            'attempt_id' => $result['attempt_id'],
            'started_at' => $result['started_at'],
            'message' => $result['message']
        ];
    }
    
    /**
     * Submit activity (final submission)
     */
    private function submitActivity($input, $userId) {
        $activityId = (int)($input['activity_id'] ?? 0);
        $attemptId = (int)($input['attempt_id'] ?? 0);
        $answers = $input['answers'] ?? [];
        $timeSpentMs = isset($input['time_spent_ms']) ? (int)$input['time_spent_ms'] : null;
        
        // CRITICAL: Log incoming answers for True/False debugging
        error_log("SUBMIT ACTIVITY - Activity ID: {$activityId}, Attempt ID: {$attemptId}");
        error_log("SUBMIT ACTIVITY - Answers received: " . json_encode($answers));
        foreach ($answers as $qId => $ans) {
            error_log("SUBMIT ACTIVITY - Question {$qId}: type=" . gettype($ans) . ", value=" . var_export($ans, true));
        }
        
        // Validate input
        if ($activityId <= 0) {
            throw new InvalidArgumentException('Invalid activity ID');
        }
        
        if (empty($answers)) {
            throw new InvalidArgumentException('No answers provided');
        }
        
        // Get or create attempt
        if ($attemptId <= 0) {
            $attemptResult = $this->attemptService->startAttempt($activityId, $userId);
            $attemptId = $attemptResult['attempt_id'];
        }
        
        // Get activity details
        $activity = $this->courseService->getActivity($activityId);
        if (!$activity) {
            throw new RuntimeException('Activity not found');
        }
        
        // Ensure activity has 'type' field (handle missing column gracefully)
        if (!isset($activity['type'])) {
            $activity['type'] = 'multiple_choice'; // Default type if column doesn't exist
            error_log("Warning: Activity {$activityId} missing 'type' column, defaulting to 'multiple_choice'");
        }
        
        // Calculate score based on activity type
        $score = $this->calculateScore($activity, $answers);
        
        // Determine activity type
        $activityType = strtolower($activity['type'] ?? '');
        
        // For Identification: use the calculated score (don't recalculate from items)
        // For other auto-graded activities (MCQ, True/False, Matching), recalculate from items
        $shouldRecalculateFromItems = in_array($activityType, ['multiple_choice', 'mcq', 'quiz', 'true_false', 'matching'], true);
        
        // Submit the attempt (with retry logic if attempt not found)
        try {
            $result = $this->attemptService->submitAttempt($attemptId, $answers, $score, $timeSpentMs);
        } catch (RuntimeException $e) {
            // If attempt not found, try to create a new one and resubmit
            if (strpos($e->getMessage(), 'Attempt not found') !== false || strpos($e->getMessage(), 'already submitted') !== false) {
                error_log("Attempt {$attemptId} issue detected: " . $e->getMessage() . " - Creating new attempt for activity {$activityId}");
                $newAttemptResult = $this->attemptService->startAttempt($activityId, $userId);
                $attemptId = $newAttemptResult['attempt_id'];
                error_log("Created new attempt {$attemptId} for activity {$activityId}, retrying submission");
                $result = $this->attemptService->submitAttempt($attemptId, $answers, $score, $timeSpentMs);
            } else {
                throw $e; // Re-throw if it's a different error
            }
        }
        
        // Recalculate score from attempt items for auto-graded activities (except Identification)
        // For Identification, use the pre-calculated score to avoid overwriting with incorrect item-based calculation
        if ($shouldRecalculateFromItems || ($result['score'] === null && $activityType !== 'identification')) {
            error_log("Activity {$activityId} (type: {$activityType}): Starting score recalculation from items for attempt {$attemptId}");
            $recalculatedScore = $this->recalculateScoreFromItems($attemptId);
            if ($recalculatedScore !== null) {
                $result['score'] = $recalculatedScore;
                $score = $recalculatedScore;
                error_log("Activity {$activityId} (type: {$activityType}): Recalculated score from items = {$recalculatedScore} for attempt {$attemptId}");
            } else {
                error_log("Warning: Activity {$activityId} (type: {$activityType}): Recalculated score is NULL for attempt {$attemptId}");
                // For True/False, if recalculation returns NULL, try manual calculation
                if ($activityType === 'true_false') {
                    error_log("True/False - Attempt {$attemptId}: Recalculation returned NULL, trying manual sum...");
                    $manualStmt = $this->db->prepare("SELECT SUM(points_awarded) as total FROM activity_attempt_items WHERE attempt_id = ? AND points_awarded IS NOT NULL");
                    $manualStmt->execute([$attemptId]);
                    $manualTotal = $manualStmt->fetchColumn();
                    if ($manualTotal !== null && $manualTotal > 0) {
                        error_log("True/False - Attempt {$attemptId}: Manual sum = {$manualTotal}, updating score...");
                        $updateStmt = $this->db->prepare("UPDATE activity_attempts SET score = ? WHERE id = ?");
                        $updateStmt->execute([$manualTotal, $attemptId]);
                        $result['score'] = $manualTotal;
                        $score = $manualTotal;
                    }
                }
            }
        } elseif ($activityType === 'identification' && $score !== null) {
            // For Identification, ensure the calculated score is saved (don't let it be overwritten)
            $updateStmt = $this->db->prepare("UPDATE activity_attempts SET score = ? WHERE id = ?");
            $updateResult = $updateStmt->execute([$score, $attemptId]);
            if (!$updateResult) {
                error_log("Error: Failed to update score for Identification attempt {$attemptId}");
            }
            $result['score'] = $score;
            error_log("Identification activity {$activityId}: Using pre-calculated score {$score} for attempt {$attemptId}");
        }
        
        // CRITICAL: Ensure score is saved to database (final verification)
        // For auto-graded activities, score should always be a number (even if 0)
        // Only NULL is acceptable for manual grading activities (essay, upload_based)
        $finalScore = $result['score'];
        $isManualGrading = in_array($activityType, ['essay', 'upload_based'], true);
        
        if (!$isManualGrading && ($finalScore === null || $finalScore === '')) {
            // For auto-graded activities, if score is NULL, try to recalculate one more time
            error_log("CRITICAL: Final score is NULL for auto-graded activity {$activityId} (type: {$activityType}). Attempting emergency recalculation...");
            $emergencyScore = $this->recalculateScoreFromItems($attemptId);
            if ($emergencyScore !== null) {
                $finalScore = $emergencyScore;
                $result['score'] = $finalScore;
                error_log("Emergency recalculation successful: {$finalScore}");
            } else {
                // Last resort: sum points_awarded directly
                $lastResortStmt = $this->db->prepare("SELECT COALESCE(SUM(points_awarded), 0) as total FROM activity_attempt_items WHERE attempt_id = ?");
                $lastResortStmt->execute([$attemptId]);
                $lastResortScore = (float)$lastResortStmt->fetchColumn();
                if ($lastResortScore > 0) {
                    $finalScore = $lastResortScore;
                    $result['score'] = $finalScore;
                    $updateStmt = $this->db->prepare("UPDATE activity_attempts SET score = ? WHERE id = ?");
                    $updateStmt->execute([$finalScore, $attemptId]);
                    error_log("Last resort calculation successful: {$finalScore}");
                } else {
                    error_log("CRITICAL ERROR: Could not calculate score for attempt {$attemptId}. All methods failed.");
                }
            }
        }
        
        // Verify the score is actually saved in the database
        $verifyStmt = $this->db->prepare("SELECT score FROM activity_attempts WHERE id = ?");
        $verifyStmt->execute([$attemptId]);
        $savedScore = $verifyStmt->fetchColumn();
        
        if ($savedScore != $finalScore && !$isManualGrading) {
            // Score mismatch - update it
            error_log("Warning: Score mismatch detected for attempt {$attemptId}. Saved: " . var_export($savedScore, true) . ", Expected: " . var_export($finalScore, true) . ". Updating...");
            $fixStmt = $this->db->prepare("UPDATE activity_attempts SET score = ? WHERE id = ?");
            $fixResult = $fixStmt->execute([$finalScore, $attemptId]);
            if ($fixResult) {
                error_log("Fixed score for attempt {$attemptId}: {$finalScore}");
            } else {
                error_log("ERROR: Failed to fix score for attempt {$attemptId}");
            }
        } else {
            error_log("Score verification passed for attempt {$attemptId}: " . var_export($savedScore, true));
        }
        
        // Final check: log if score is still problematic
        if (!$isManualGrading && $finalScore === null) {
            error_log("WARNING: Final score for attempt {$attemptId} is still NULL after all fixes. Activity type: {$activityType}");
        }
        
        // Cleanup draft
        $this->cleanupDraft($activityId, $userId);
        
        // Get final attempt details (handle gracefully if getAttempt fails)
        $finalAttempt = null;
        try {
            $finalAttempt = $this->attemptService->getAttempt($attemptId);
        } catch (Exception $e) {
            error_log("Warning: Could not get final attempt details: " . $e->getMessage());
            // Create minimal attempt data
            $finalAttempt = [
                'id' => $attemptId,
                'submitted_at' => date('Y-m-d H:i:s'),
                'score' => $result['score']
            ];
        }
        
        // CRITICAL: Ensure score is always a number (not null) for auto-graded activities
        $responseScore = $result['score'];
        if (!$isManualGrading && ($responseScore === null || $responseScore === '')) {
            // Use finalScore which we verified above
            $responseScore = $finalScore !== null ? $finalScore : 0;
            error_log("Using finalScore for response: {$responseScore}");
        }
        
        // Ensure score is numeric
        if ($responseScore !== null) {
            $responseScore = (float)$responseScore;
        }
        
        error_log("FINAL RESPONSE - Activity {$activityId}, Attempt {$attemptId}, Score: " . var_export($responseScore, true));
        
        return [
            'success' => true,
            'message' => 'Activity submitted successfully',
            'attempt_id' => $attemptId,
            'score' => $responseScore,
            'time_spent_ms' => $result['time_spent_ms'],
            'submitted_at' => $finalAttempt['submitted_at'] ?? date('Y-m-d H:i:s'),
            'attempt' => $finalAttempt
        ];
    }
    
    /**
     * Calculate score based on activity type
     * Returns null for manual grading types (essay, upload_based) or auto-gradable types (score calculated from items)
     */
    private function calculateScore($activity, $answers) {
        $activityType = strtolower($activity['type'] ?? '');
        
        // Auto-calculate score for identification activities
        if ($activityType === 'identification') {
            return $this->progressService->calculateIdentificationScore($activity['id'], $answers);
        }
        
        // For essay and upload_based: manual grading required (return null)
        if (in_array($activityType, ['essay', 'upload_based'], true)) {
            return null; // Teacher will grade manually
        }
        
        // For MCQ, quiz, true_false, matching: score will be calculated from attempt items
        // For coding: handled separately (not through this submission flow)
        // For lecture, laboratory, assignment: typically don't have submissions
        return null; // Score calculated from attempt items in recalculateScoreFromItems()
    }
    
    /**
     * Recalculate score from attempt items
     * Handles both auto-graded (sum of points_awarded) and manual-graded (null) items
     */
    private function recalculateScoreFromItems($attemptId) {
        // Get all attempt items with their points and extra data
        $stmt = $this->db->prepare("
            SELECT points_awarded, is_correct, question_id, extra
            FROM activity_attempt_items
            WHERE attempt_id = ?
        ");
        $stmt->execute([$attemptId]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($items)) {
            error_log("Warning: No attempt items found for attempt {$attemptId}");
            return 0.0; // Return 0 if no items found
        }
        
        // Check if any items require manual grading (points_awarded is NULL)
        $hasManualGrading = false;
        $autoGradedTotal = 0.0;
        $nullCount = 0;
        $zeroCount = 0;
        
        foreach ($items as $item) {
            $pointsAwarded = $item['points_awarded'];
            $isCorrect = $item['is_correct'];
            $questionId = $item['question_id'];
            
            if ($pointsAwarded === null) {
                $hasManualGrading = true;
                $nullCount++;
                error_log("Manual grading required for attempt {$attemptId}, question {$questionId}");
            } else {
                $points = (float)$pointsAwarded;
                
                // CRITICAL FIX: If is_correct is true but points_awarded is 0, we need to get the question points and award them
                if ($isCorrect && $points == 0) {
                    error_log("Warning: Question {$questionId} marked correct but points_awarded is 0 for attempt {$attemptId}. Fixing...");
                    // Get question points from the extra field or query the question
                    try {
                        $extraData = json_decode($item['extra'] ?? '{}', true);
                        $questionPoints = isset($extraData['question_points']) ? (float)$extraData['question_points'] : 0;
                        
                        if ($questionPoints > 0) {
                            // Update the attempt item with correct points
                            $fixItemStmt = $this->db->prepare("UPDATE activity_attempt_items SET points_awarded = ? WHERE attempt_id = ? AND question_id = ?");
                            $fixItemStmt->execute([$questionPoints, $attemptId, $questionId]);
                            $points = $questionPoints;
                            error_log("Fixed points_awarded for question {$questionId}: {$points}");
                        } else {
                            // Fallback: query question directly
                            $qStmt = $this->db->prepare("SELECT points FROM activity_questions WHERE id = ?");
                            $qStmt->execute([$questionId]);
                            $questionPoints = (float)$qStmt->fetchColumn();
                            if ($questionPoints > 0) {
                                $fixItemStmt = $this->db->prepare("UPDATE activity_attempt_items SET points_awarded = ? WHERE attempt_id = ? AND question_id = ?");
                                $fixItemStmt->execute([$questionPoints, $attemptId, $questionId]);
                                $points = $questionPoints;
                                error_log("Fixed points_awarded for question {$questionId} (from DB): {$points}");
                            }
                        }
                    } catch (Exception $e) {
                        error_log("Error fixing points for question {$questionId}: " . $e->getMessage());
                    }
                }
                
                $autoGradedTotal += $points;
                if ($points == 0) {
                    $zeroCount++;
                }
            }
        }
        
        // If all items are auto-graded, return the sum
        // If any items require manual grading, return null (teacher will set score later)
        $calculatedScore = $hasManualGrading ? null : $autoGradedTotal;
        
        // CRITICAL: For True/False and other auto-graded activities, ensure we always have a numeric score
        // Even if total is 0, that's a valid score (student got everything wrong)
        if (!$hasManualGrading && $calculatedScore === null) {
            // This shouldn't happen, but if it does, use the total we calculated
            $calculatedScore = $autoGradedTotal;
            error_log("Warning: Calculated score was NULL but no manual grading, using total: {$calculatedScore}");
        }
        
        // Log the calculation for debugging
        error_log("Recalculated score for attempt {$attemptId}: " . var_export($calculatedScore, true) . " (items: " . count($items) . ", null: {$nullCount}, zero: {$zeroCount}, total: {$autoGradedTotal})");
        
        // Update attempt with calculated score (or null for manual grading)
        // CRITICAL: Always save the score, even if it's 0 (valid score for wrong answers)
        $updateStmt = $this->db->prepare("UPDATE activity_attempts SET score = ? WHERE id = ?");
        $updateResult = $updateStmt->execute([$calculatedScore, $attemptId]);
        
        if (!$updateResult) {
            error_log("Error: Failed to update score for attempt {$attemptId}");
        } else {
            // Verify the update worked
            $verifyStmt = $this->db->prepare("SELECT score FROM activity_attempts WHERE id = ?");
            $verifyStmt->execute([$attemptId]);
            $verifiedScore = $verifyStmt->fetchColumn();
            error_log("Score update verified for attempt {$attemptId}: " . var_export($verifiedScore, true));
        }
        
        return $calculatedScore;
    }
    
    /**
     * Cleanup draft from activity_progress
     */
    private function cleanupDraft($activityId, $userId) {
        try {
            $deleteStmt = $this->db->prepare("DELETE FROM activity_progress WHERE activity_id = ? AND user_id = ?");
            $deleteStmt->execute([$activityId, $userId]);
        } catch (Exception $e) {
            // Ignore errors in cleanup
            error_log("Warning: Could not delete draft progress: " . $e->getMessage());
        }
    }
}
?>

