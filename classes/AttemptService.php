<?php
class AttemptService {
    /** @var PDO */
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function startPreviewAttempt(int $activityId, int $userId, string $role = 'teacher') : array {
        $stmt = $this->db->prepare("INSERT INTO activity_attempts (activity_id, user_id, role, is_preview, started_at) VALUES (?, ?, ?, 1, NOW())");
        $stmt->execute([$activityId, $userId, $role]);
        $attemptId = (int)$this->db->lastInsertId();
        return [ 'id' => $attemptId ];
    }

    public function submitAttempt(int $attemptId, ?float $score = null, ?int $timeSpentMs = null) : bool {
        $stmt = $this->db->prepare("UPDATE activity_attempts SET submitted_at = NOW(), score = ?, time_spent_ms = ? WHERE id = ?");
        return $stmt->execute([$score, $timeSpentMs, $attemptId]);
    }

    public function getResult(int $attemptId) : ?array {
        $stmt = $this->db->prepare("SELECT * FROM activity_attempts WHERE id = ?");
        $stmt->execute([$attemptId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }
}
?>



