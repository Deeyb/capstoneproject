<?php
/**
 * Leaderboard Controller
 * OOP controller for handling leaderboard data retrieval
 */
require_once __DIR__ . '/ActivityAttemptService.php';

class LeaderboardController {
    private $db;
    private $attemptService;
    
    public function __construct($database) {
        $this->db = $database;
        $this->attemptService = new ActivityAttemptService($database);
    }
    
    /**
     * Get leaderboard for an activity
     */
    public function getLeaderboard($activityId, $userId, $limit = 50) {
        // Get leaderboard data
        $leaderboard = $this->attemptService->getLeaderboard($activityId, $limit);
        
        // Get user's rank and best attempt
        $userBestAttempt = $this->attemptService->getUserBestAttempt($activityId, $userId);
        $userRank = null;
        $userScore = null;
        $userPercentage = null;
        
        // Find user's rank in leaderboard
        foreach ($leaderboard as $entry) {
            if ($entry['user_id'] == $userId) {
                $userRank = $entry['rank'];
                $userScore = $entry['score'];
                $userPercentage = $entry['percentage'];
                break;
            }
        }
        
        // If user not in top N, get their rank separately
        if ($userRank === null && $userBestAttempt) {
            $userRank = $this->calculateUserRank($activityId, $userBestAttempt);
            $userScore = $userBestAttempt['score'];
            $maxScore = $userBestAttempt['max_score'] ?? 0;
            $userPercentage = $maxScore > 0 ? ($userScore / $maxScore * 100) : 0;
        }
        
        return [
            'success' => true,
            'leaderboard' => $leaderboard,
            'user_rank' => $userRank,
            'user_score' => $userScore,
            'user_percentage' => $userPercentage ? round($userPercentage, 2) : null,
            'total_participants' => count($leaderboard)
        ];
    }
    
    /**
     * Get course-level leaderboard (aggregates scores from all activities in a class)
     */
    public function getCourseLeaderboard($classId, $userId, $limit = 50) {
        // Get all activities for this class
        $stmt = $this->db->prepare("
            SELECT la.id, la.max_score
            FROM lesson_activities la
            JOIN course_lessons cl ON la.lesson_id = cl.id
            JOIN course_modules cm ON cl.module_id = cm.id
            JOIN classes c ON cm.course_id = c.course_id
            WHERE c.id = ?
        ");
        $stmt->execute([$classId]);
        $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($activities)) {
            return [
                'success' => true,
                'leaderboard' => [],
                'user_rank' => null,
                'user_score' => 0,
                'user_percentage' => 0,
                'total_participants' => 0,
                'total_possible_score' => 0
            ];
        }
        
        $activityIds = array_column($activities, 'id');
        $totalPossibleScore = array_sum(array_column($activities, 'max_score'));
        
        // Get best attempt for each student for each activity, then aggregate
        $placeholders = implode(',', array_fill(0, count($activityIds), '?'));
        
        // Aggregate scores: SUM of best scores per student across all activities
        // Use subquery to get best score per student per activity
        $stmt = $this->db->prepare("
            SELECT 
                best.user_id,
                SUM(best.score) as total_score,
                u.firstname,
                u.lastname,
                u.middlename
            FROM (
                SELECT 
                    aa1.user_id,
                    aa1.activity_id,
                    MAX(aa1.score) as score
                FROM activity_attempts aa1
                WHERE aa1.activity_id IN ($placeholders)
                    AND aa1.role = 'student'
                    AND aa1.is_preview = 0
                    AND aa1.submitted_at IS NOT NULL
                    AND aa1.score IS NOT NULL
                GROUP BY aa1.user_id, aa1.activity_id
            ) best
            JOIN class_students cs ON cs.student_user_id = best.user_id
            JOIN users u ON cs.student_user_id = u.id
            WHERE cs.class_id = ?
            GROUP BY best.user_id, u.firstname, u.lastname, u.middlename
            ORDER BY total_score DESC
            LIMIT " . (int)$limit . "
        ");
        $stmt->execute(array_merge($activityIds, [$classId]));
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Add rank and format
        $rank = 1;
        $leaderboard = [];
        $userRank = null;
        $userTotalScore = 0;
        
        foreach ($results as $row) {
            $totalScore = (float)($row['total_score'] ?? 0);
            $totalMaxScore = (float)($row['total_max_score'] ?? 0);
            $percentage = $totalPossibleScore > 0 ? ($totalScore / $totalPossibleScore * 100) : 0;
            
            $entry = [
                'rank' => $rank++,
                'user_id' => (int)$row['user_id'],
                'name' => trim(($row['lastname'] ?? '') . ', ' . ($row['firstname'] ?? '') . ' ' . ($row['middlename'] ?? '')),
                'score' => $totalScore,
                'max_score' => $totalPossibleScore,
                'percentage' => round($percentage, 2)
            ];
            
            $leaderboard[] = $entry;
            
            // Check if this is the current user
            if ($row['user_id'] == $userId) {
                $userRank = $entry['rank'];
                $userTotalScore = $totalScore;
            }
        }
        
        // If user not in top N, calculate their rank separately
        if ($userRank === null) {
            $userStmt = $this->db->prepare("
                SELECT SUM(best.score) as total_score
                FROM (
                    SELECT 
                        aa1.user_id,
                        aa1.activity_id,
                        MAX(aa1.score) as score
                    FROM activity_attempts aa1
                    WHERE aa1.activity_id IN ($placeholders)
                        AND aa1.user_id = ?
                        AND aa1.role = 'student'
                        AND aa1.is_preview = 0
                        AND aa1.submitted_at IS NOT NULL
                        AND aa1.score IS NOT NULL
                    GROUP BY aa1.user_id, aa1.activity_id
                ) best
                JOIN class_students cs ON cs.student_user_id = best.user_id
                WHERE cs.class_id = ?
            ");
            $userStmt->execute(array_merge($activityIds, [$userId, $classId]));
            $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
            $userTotalScore = (float)($userData['total_score'] ?? 0);
            
            // Calculate rank
            $rankStmt = $this->db->prepare("
                SELECT COUNT(*) + 1 as rank
                FROM (
                    SELECT 
                        best.user_id,
                        SUM(best.score) as total_score
                    FROM (
                        SELECT 
                            aa2.user_id,
                            aa2.activity_id,
                            MAX(aa2.score) as score
                        FROM activity_attempts aa2
                        WHERE aa2.activity_id IN ($placeholders)
                            AND aa2.role = 'student'
                            AND aa2.is_preview = 0
                            AND aa2.submitted_at IS NOT NULL
                            AND aa2.score IS NOT NULL
                        GROUP BY aa2.user_id, aa2.activity_id
                    ) best
                    JOIN class_students cs ON cs.student_user_id = best.user_id
                    WHERE cs.class_id = ?
                    GROUP BY best.user_id
                    HAVING total_score > ?
                ) ranked
            ");
            $rankStmt->execute(array_merge($activityIds, [$classId, $userTotalScore]));
            $rankData = $rankStmt->fetch(PDO::FETCH_ASSOC);
            $userRank = (int)($rankData['rank'] ?? null);
        }
        
        $userPercentage = $totalPossibleScore > 0 ? ($userTotalScore / $totalPossibleScore * 100) : 0;
        
        return [
            'success' => true,
            'leaderboard' => $leaderboard,
            'user_rank' => $userRank,
            'user_score' => $userTotalScore,
            'user_percentage' => round($userPercentage, 2),
            'total_participants' => count($leaderboard),
            'total_possible_score' => $totalPossibleScore
        ];
    }
    
    /**
     * Calculate user's rank if not in top N
     */
    private function calculateUserRank($activityId, $userBestAttempt) {
        // Handle null values safely
        $userScore = (float)($userBestAttempt['score'] ?? 0);
        $userTimeSpent = (int)($userBestAttempt['time_spent_ms'] ?? 0);
        $userSubmittedAt = $userBestAttempt['submitted_at'] ?? date('Y-m-d H:i:s');
        
        $stmt = $this->db->prepare("
            SELECT COUNT(*) + 1 as rank
            FROM activity_attempts aa
            WHERE aa.activity_id = ? 
                AND aa.role = 'student' 
                AND aa.is_preview = 0 
                AND aa.submitted_at IS NOT NULL
                AND (
                    (aa.score > ?) OR 
                    (aa.score = ? AND aa.time_spent_ms < ?) OR
                    (aa.score = ? AND aa.time_spent_ms = ? AND aa.submitted_at < ?)
                )
        ");
        $stmt->execute([
            $activityId,
            $userScore,
            $userScore,
            $userTimeSpent,
            $userScore,
            $userTimeSpent,
            $userSubmittedAt
        ]);
        $rankData = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($rankData['rank'] ?? null);
    }
}
?>


