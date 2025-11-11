<?php
/**
 * Activity Progress Controller
 * OOP controller for handling activity progress (draft storage)
 */
require_once __DIR__ . '/ActivityProgressService.php';
require_once __DIR__ . '/CourseService.php';

class ActivityProgressController {
    private $db;
    private $progressService;
    private $courseService;
    
    public function __construct($database) {
        $this->db = $database;
        $this->progressService = new ActivityProgressService($database);
        $this->courseService = new CourseService($database);
    }
    
    /**
     * Save progress (draft storage)
     */
    public function saveProgress($input) {
        $activityId = (int)($input['activity_id'] ?? 0);
        $userId = (int)($input['user_id'] ?? 0);
        $answers = $input['answers'] ?? [];
        $score = $input['score'] ?? null;
        $completed = (bool)($input['completed'] ?? false);
        
        // Auto-calculate score for identification activities if not provided
        if ($score === null) {
            $score = $this->calculateScoreIfNeeded($activityId, $answers);
        }
        
        // Save progress using OOP service
        $result = $this->progressService->saveActivityProgress($activityId, $userId, $answers, $score, $completed);
        
        return $result;
    }
    
    /**
     * Get progress
     */
    public function getProgress($activityId, $userId) {
        $result = $this->progressService->getActivityProgress($activityId, $userId);
        return $result;
    }
    
    /**
     * Calculate score if needed based on activity type
     */
    private function calculateScoreIfNeeded($activityId, $answers) {
        // Get activity type
        $activity = $this->courseService->getActivity($activityId);
        if (!$activity) {
            return null;
        }
        
        $activityType = strtolower($activity['type'] ?? '');
        
        // If identification activity, auto-calculate score
        if ($activityType === 'identification') {
            return $this->progressService->calculateIdentificationScore($activityId, $answers);
        }
        
        // Check if it's identification by checking instructions
        if ($activityType === 'quiz' && isset($activity['instructions'])) {
            $instructions = json_decode($activity['instructions'] ?? '{}', true);
            $kind = strtolower($instructions['kind'] ?? '');
            
            if ($kind === 'identification') {
                return $this->progressService->calculateIdentificationScore($activityId, $answers);
            }
        }
        
        return null;
    }
}
?>

