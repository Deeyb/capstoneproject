<?php
/**
 * Activity Progress Service - OOP approach for activity progress operations
 */
class ActivityProgressService {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    /**
     * Get activity progress for a user
     */
    public function getActivityProgress($activityId, $userId) {
        $this->validateActivityId($activityId);
        $this->validateUserId($userId);
        
        $stmt = $this->db->prepare("
            SELECT 
                ap.*,
                la.title as activity_title,
                la.type as activity_type
            FROM activity_progress ap
            JOIN lesson_activities la ON ap.activity_id = la.id
            WHERE ap.activity_id = ? AND ap.user_id = ?
        ");
        $stmt->execute([$activityId, $userId]);
        $progress = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$progress) {
            return [
                'success' => true,
                'progress' => null,
                'message' => 'No progress found'
            ];
        }
        
        return [
            'success' => true,
            'progress' => [
                'id' => $progress['id'],
                'activity_id' => $progress['activity_id'],
                'user_id' => $progress['user_id'],
                'answers' => json_decode($progress['answers'], true),
                'score' => $progress['score'],
                'completed' => (bool)$progress['completed'],
                'attempts' => $progress['attempts'],
                'time_spent' => $progress['time_spent'],
                'last_updated' => $progress['last_updated'],
                'activity_title' => $progress['activity_title'],
                'activity_type' => $progress['activity_type']
            ]
        ];
    }
    
    /**
     * Save activity progress for a user
     */
    public function saveActivityProgress($activityId, $userId, $answers, $score = null, $completed = false) {
        $this->validateActivityId($activityId);
        $this->validateUserId($userId);
        $this->validateAnswers($answers);
        
        // Check if progress already exists
        $existingProgress = $this->getExistingProgress($activityId, $userId);
        
        if ($existingProgress) {
            return $this->updateProgress($existingProgress['id'], $answers, $score, $completed);
        } else {
            return $this->createProgress($activityId, $userId, $answers, $score, $completed);
        }
    }
    
    /**
     * Get existing progress
     */
    private function getExistingProgress($activityId, $userId) {
        $stmt = $this->db->prepare("
            SELECT id, attempts, score, completed 
            FROM activity_progress 
            WHERE activity_id = ? AND user_id = ?
        ");
        $stmt->execute([$activityId, $userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Update existing progress
     */
    private function updateProgress($progressId, $answers, $score, $completed) {
        $stmt = $this->db->prepare("
            UPDATE activity_progress 
            SET answers = ?, score = ?, completed = ?, attempts = attempts + 1, 
                last_updated = NOW(), time_spent = time_spent + 1
            WHERE id = ?
        ");
        $result = $stmt->execute([
            json_encode($answers),
            $score,
            $completed ? 1 : 0,
            $progressId
        ]);
        
        if (!$result) {
            throw new RuntimeException('Failed to update progress');
        }
        
        return [
            'success' => true,
            'message' => 'Progress updated successfully',
            'progress_id' => $progressId
        ];
    }
    
    /**
     * Create new progress
     */
    private function createProgress($activityId, $userId, $answers, $score, $completed) {
        $stmt = $this->db->prepare("
            INSERT INTO activity_progress 
            (activity_id, user_id, answers, score, completed, attempts, time_spent, created_at, last_updated)
            VALUES (?, ?, ?, ?, ?, 1, 1, NOW(), NOW())
        ");
        $result = $stmt->execute([
            $activityId,
            $userId,
            json_encode($answers),
            $score,
            $completed ? 1 : 0
        ]);
        
        if (!$result) {
            throw new RuntimeException('Failed to create progress');
        }
        
        $progressId = $this->db->lastInsertId();
        
        return [
            'success' => true,
            'message' => 'Progress saved successfully',
            'progress_id' => $progressId
        ];
    }
    
    /**
     * Get user's progress summary
     */
    public function getUserProgressSummary($userId) {
        $this->validateUserId($userId);
        
        $stmt = $this->db->prepare("
            SELECT 
                COUNT(*) as total_activities,
                SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_activities,
                AVG(score) as average_score,
                SUM(time_spent) as total_time_spent
            FROM activity_progress 
            WHERE user_id = ?
        ");
        $stmt->execute([$userId]);
        $summary = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'summary' => [
                'total_activities' => (int)$summary['total_activities'],
                'completed_activities' => (int)$summary['completed_activities'],
                'completion_rate' => $summary['total_activities'] > 0 ? 
                    round(($summary['completed_activities'] / $summary['total_activities']) * 100, 2) : 0,
                'average_score' => $summary['average_score'] ? round($summary['average_score'], 2) : 0,
                'total_time_spent' => (int)$summary['total_time_spent']
            ]
        ];
    }
    
    /**
     * Validate activity ID
     */
    private function validateActivityId($activityId) {
        if (!is_numeric($activityId) || $activityId <= 0) {
            throw new InvalidArgumentException('Invalid activity ID');
        }
    }
    
    /**
     * Validate user ID
     */
    private function validateUserId($userId) {
        if (!is_numeric($userId) || $userId <= 0) {
            throw new InvalidArgumentException('Invalid user ID');
        }
    }
    
    /**
     * Validate answers
     */
    private function validateAnswers($answers) {
        if (!is_array($answers)) {
            throw new InvalidArgumentException('Answers must be an array');
        }
    }
    
    /**
     * Calculate score for identification activity (supports multiple correct answers)
     * @param int $activityId Activity ID
     * @param array $studentAnswers Student answers array (question_id => answer)
     * @return float Calculated score
     */
    public function calculateIdentificationScore($activityId, $studentAnswers) {
        $this->validateActivityId($activityId);
        if (!is_array($studentAnswers)) {
            return 0.0;
        }
        
        // Get all questions for this activity
        $stmt = $this->db->prepare("
            SELECT id, question_text, points, explanation
            FROM activity_questions 
            WHERE activity_id = ? 
            ORDER BY position ASC, id ASC
        ");
        $stmt->execute([$activityId]);
        $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $totalScore = 0.0;
        
        foreach ($questions as $question) {
            $questionId = (int)$question['id'];
            $points = (float)$question['points'];
            $studentAnswer = isset($studentAnswers[$questionId]) ? trim((string)$studentAnswers[$questionId]) : '';
            
            if ($studentAnswer === '') {
                continue; // No answer, skip
            }
            
            // Get all acceptable answers (primary + alternatives)
            $acceptableAnswers = [];
            
            // Try to parse explanation as JSON (new format: {"primary": "...", "alternatives": [...]})
            if (!empty($question['explanation'])) {
                try {
                    $parsed = json_decode($question['explanation'], true);
                    if (is_array($parsed)) {
                        // New format with primary + alternatives
                        if (isset($parsed['primary']) && !empty($parsed['primary'])) {
                            $acceptableAnswers[] = trim(strtolower((string)$parsed['primary']));
                        }
                        if (isset($parsed['alternatives']) && is_array($parsed['alternatives'])) {
                            foreach ($parsed['alternatives'] as $alt) {
                                if (!empty($alt)) {
                                    $acceptableAnswers[] = trim(strtolower((string)$alt));
                                }
                            }
                        }
                    } else {
                        // Legacy format: plain text (old single answer)
                        $acceptableAnswers[] = trim(strtolower((string)$question['explanation']));
                    }
                } catch (Exception $e) {
                    // Not JSON, treat as plain text (legacy format)
                    $acceptableAnswers[] = trim(strtolower((string)$question['explanation']));
                }
            }
            
            // Fallback: check question_choices for correct answer (legacy storage)
            if (empty($acceptableAnswers)) {
                $choiceStmt = $this->db->prepare("SELECT choice_text FROM question_choices WHERE question_id = ? AND is_correct = 1 LIMIT 1");
                $choiceStmt->execute([$questionId]);
                $primaryAnswer = $choiceStmt->fetchColumn();
                if ($primaryAnswer) {
                    $acceptableAnswers[] = trim(strtolower($primaryAnswer));
                }
            }
            
            // Normalize student answer
            $normalizedStudent = trim(strtolower($studentAnswer));
            
            // Check if student answer matches any acceptable answer
            $isCorrect = false;
            foreach ($acceptableAnswers as $acceptable) {
                if ($normalizedStudent === $acceptable) {
                    $isCorrect = true;
                    break;
                }
            }
            
            if ($isCorrect) {
                $totalScore += $points;
            }
        }
        
        return $totalScore;
    }
}
?>

