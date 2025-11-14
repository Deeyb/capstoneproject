<?php
/**
 * Activity Attempt Service
 * Handles final submissions for student activities (leaderboard-ready)
 */
class ActivityAttemptService {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
        $this->ensureTablesExist();
    }
    
    /**
     * Ensure required tables exist and have correct schema
     */
    private function ensureTablesExist() {
        try {
            // Check if table exists
            $stmt = $this->db->query("SHOW TABLES LIKE 'activity_attempts'");
            if ($stmt->rowCount() == 0) {
                // Table doesn't exist, create it with new schema
                $this->db->exec("
                    CREATE TABLE activity_attempts (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        activity_id INT NOT NULL,
                        user_id INT NOT NULL,
                        role VARCHAR(32) NOT NULL DEFAULT 'student',
                        is_preview TINYINT(1) NOT NULL DEFAULT 0,
                        started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        submitted_at DATETIME NULL,
                        score DECIMAL(10,2) NULL,
                        time_spent_ms INT NULL,
                        meta TEXT NULL,
                        INDEX idx_attempts_activity_id (activity_id),
                        INDEX idx_attempts_user_id (user_id),
                        FOREIGN KEY (activity_id) REFERENCES lesson_activities(id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                ");
                return;
            }
            
            // Table exists, check and add missing columns
            $columns = $this->db->query("SHOW COLUMNS FROM activity_attempts")->fetchAll(PDO::FETCH_COLUMN);
            $columns = array_map('strtolower', $columns);
            
            // Migrate from old schema to new schema if needed
            if (in_array('student_user_id', $columns) && !in_array('user_id', $columns)) {
                // Old schema detected - migrate
                $this->db->exec("ALTER TABLE activity_attempts ADD COLUMN user_id INT NULL AFTER activity_id");
                $this->db->exec("UPDATE activity_attempts SET user_id = student_user_id WHERE user_id IS NULL");
                $this->db->exec("ALTER TABLE activity_attempts MODIFY COLUMN user_id INT NOT NULL");
            }
            
            if (!in_array('role', $columns)) {
                $this->db->exec("ALTER TABLE activity_attempts ADD COLUMN role VARCHAR(32) NOT NULL DEFAULT 'student' AFTER user_id");
            }
            
            if (!in_array('is_preview', $columns)) {
                $this->db->exec("ALTER TABLE activity_attempts ADD COLUMN is_preview TINYINT(1) NOT NULL DEFAULT 0 AFTER role");
            }
            
            if (!in_array('started_at', $columns)) {
                // Check if created_at exists (old schema)
                if (in_array('created_at', $columns)) {
                    $this->db->exec("ALTER TABLE activity_attempts ADD COLUMN started_at DATETIME NULL AFTER is_preview");
                    $this->db->exec("UPDATE activity_attempts SET started_at = created_at WHERE started_at IS NULL");
                    $this->db->exec("ALTER TABLE activity_attempts MODIFY COLUMN started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP");
                } else {
                    $this->db->exec("ALTER TABLE activity_attempts ADD COLUMN started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER is_preview");
                }
            }
            
            if (!in_array('submitted_at', $columns)) {
                $this->db->exec("ALTER TABLE activity_attempts ADD COLUMN submitted_at DATETIME NULL AFTER started_at");
            }
            
            if (!in_array('time_spent_ms', $columns)) {
                // Check if duration_ms exists (old schema)
                if (in_array('duration_ms', $columns)) {
                    $this->db->exec("ALTER TABLE activity_attempts ADD COLUMN time_spent_ms INT NULL AFTER submitted_at");
                    $this->db->exec("UPDATE activity_attempts SET time_spent_ms = duration_ms WHERE time_spent_ms IS NULL");
                } else {
                    $this->db->exec("ALTER TABLE activity_attempts ADD COLUMN time_spent_ms INT NULL AFTER submitted_at");
                }
            }
            
            if (!in_array('meta', $columns)) {
                $this->db->exec("ALTER TABLE activity_attempts ADD COLUMN meta TEXT NULL AFTER time_spent_ms");
            }
            
            // Ensure activity_attempt_items table exists (CRITICAL for storing individual answers)
            $itemsTableCheck = $this->db->query("SHOW TABLES LIKE 'activity_attempt_items'");
            if ($itemsTableCheck->rowCount() == 0) {
                // Table doesn't exist, create it
                $this->db->exec("
                    CREATE TABLE activity_attempt_items (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        attempt_id INT NOT NULL,
                        question_id INT NULL,
                        response_text LONGTEXT NULL,
                        choice_ids TEXT NULL,
                        is_correct TINYINT(1) NULL,
                        points_awarded DECIMAL(10,2) NULL,
                        extra TEXT NULL,
                        INDEX idx_attempt_items_attempt_id (attempt_id),
                        FOREIGN KEY (attempt_id) REFERENCES activity_attempts(id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                ");
            } else {
                // Table exists, check and add missing columns
                $itemsColumns = $this->db->query("SHOW COLUMNS FROM activity_attempt_items")->fetchAll(PDO::FETCH_COLUMN);
                $itemsColumns = array_map('strtolower', $itemsColumns);
                
                if (!in_array('attempt_id', $itemsColumns)) {
                    $this->db->exec("ALTER TABLE activity_attempt_items ADD COLUMN attempt_id INT NOT NULL AFTER id");
                }
                if (!in_array('question_id', $itemsColumns)) {
                    $this->db->exec("ALTER TABLE activity_attempt_items ADD COLUMN question_id INT NULL AFTER attempt_id");
                }
                if (!in_array('response_text', $itemsColumns)) {
                    $this->db->exec("ALTER TABLE activity_attempt_items ADD COLUMN response_text LONGTEXT NULL AFTER question_id");
                }
                if (!in_array('choice_ids', $itemsColumns)) {
                    $this->db->exec("ALTER TABLE activity_attempt_items ADD COLUMN choice_ids TEXT NULL AFTER response_text");
                }
                if (!in_array('is_correct', $itemsColumns)) {
                    $this->db->exec("ALTER TABLE activity_attempt_items ADD COLUMN is_correct TINYINT(1) NULL AFTER choice_ids");
                }
                if (!in_array('points_awarded', $itemsColumns)) {
                    $this->db->exec("ALTER TABLE activity_attempt_items ADD COLUMN points_awarded DECIMAL(10,2) NULL AFTER is_correct");
                }
                if (!in_array('extra', $itemsColumns)) {
                    $this->db->exec("ALTER TABLE activity_attempt_items ADD COLUMN extra TEXT NULL AFTER points_awarded");
                }
                
                // Ensure foreign key exists
                try {
                    $fkCheck = $this->db->query("
                        SELECT CONSTRAINT_NAME 
                        FROM information_schema.KEY_COLUMN_USAGE 
                        WHERE TABLE_SCHEMA = DATABASE() 
                        AND TABLE_NAME = 'activity_attempt_items' 
                        AND CONSTRAINT_NAME = 'fk_attempt_items_attempt'
                    ");
                    if ($fkCheck->rowCount() == 0) {
                        $this->db->exec("
                            ALTER TABLE activity_attempt_items 
                            ADD CONSTRAINT fk_attempt_items_attempt 
                            FOREIGN KEY (attempt_id) REFERENCES activity_attempts(id) ON DELETE CASCADE
                        ");
                    }
                } catch (Exception $e) {
                    // Foreign key might already exist or table might not support it
                    error_log("Could not add foreign key to activity_attempt_items: " . $e->getMessage());
                }
                
                // Ensure index exists
                try {
                    $indexCheck = $this->db->query("SHOW INDEX FROM activity_attempt_items WHERE Key_name = 'idx_attempt_items_attempt_id'");
                    if ($indexCheck->rowCount() == 0) {
                        $this->db->exec("CREATE INDEX idx_attempt_items_attempt_id ON activity_attempt_items(attempt_id)");
                    }
                } catch (Exception $e) {
                    // Index might already exist
                    error_log("Could not add index to activity_attempt_items: " . $e->getMessage());
                }
            }
            
        } catch (Exception $e) {
            // Log error but don't fail - table might be in use
            error_log("ActivityAttemptService::ensureTablesExist error: " . $e->getMessage());
        }
    }
    
    /**
     * Start a new attempt (when student opens activity)
     */
    public function startAttempt($activityId, $userId) {
        $this->validateActivityId($activityId);
        $this->validateUserId($userId);
        
        // Check if there's an existing unsubmitted attempt
        $stmt = $this->db->prepare("
            SELECT id, started_at 
            FROM activity_attempts 
            WHERE activity_id = ? AND user_id = ? AND role = 'student' AND is_preview = 0 AND submitted_at IS NULL
            ORDER BY started_at DESC 
            LIMIT 1
        ");
        $stmt->execute([$activityId, $userId]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existing) {
            // Return existing attempt
            return [
                'success' => true,
                'attempt_id' => $existing['id'],
                'started_at' => $existing['started_at'],
                'message' => 'Resuming existing attempt'
            ];
        }
        
        // Create new attempt
        $stmt = $this->db->prepare("
            INSERT INTO activity_attempts 
            (activity_id, user_id, role, is_preview, started_at)
            VALUES (?, ?, 'student', 0, NOW())
        ");
        $result = $stmt->execute([$activityId, $userId]);
        
        if (!$result) {
            throw new RuntimeException('Failed to create attempt');
        }
        
        $attemptId = (int)$this->db->lastInsertId();
        
        return [
            'success' => true,
            'attempt_id' => $attemptId,
            'started_at' => date('Y-m-d H:i:s'),
            'message' => 'New attempt started'
        ];
    }
    
    /**
     * Submit final answers (move from draft to final)
     */
    public function submitAttempt($attemptId, $answers, $score = null, $timeSpentMs = null) {
        $this->validateAttemptId($attemptId);
        $this->validateAnswers($answers);
        
        // Get attempt details - check if it exists and is not yet submitted
        $stmt = $this->db->prepare("
            SELECT activity_id, user_id, started_at, submitted_at
            FROM activity_attempts 
            WHERE id = ?
        ");
        $stmt->execute([$attemptId]);
        $attempt = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$attempt) {
            throw new RuntimeException('Attempt not found');
        }
        
        // Check if already submitted
        if ($attempt['submitted_at'] !== null) {
            throw new RuntimeException('Attempt already submitted');
        }
        
        // Calculate time spent if not provided
        if ($timeSpentMs === null && $attempt['started_at']) {
            $startTime = new DateTime($attempt['started_at']);
            $now = new DateTime();
            $timeSpentMs = ($now->getTimestamp() - $startTime->getTimestamp()) * 1000;
        }
        
        // Update attempt with submission data
        $stmt = $this->db->prepare("
            UPDATE activity_attempts 
            SET submitted_at = NOW(), 
                score = ?, 
                time_spent_ms = ?,
                meta = ?
            WHERE id = ?
        ");
        
        $meta = json_encode([
            'submitted_at' => date('Y-m-d H:i:s'),
            'answer_count' => count($answers)
        ]);
        
        $result = $stmt->execute([
            $score,
            $timeSpentMs,
            $meta,
            $attemptId
        ]);
        
        if (!$result) {
            throw new RuntimeException('Failed to submit attempt');
        }
        
        // Save individual answers to activity_attempt_items
        $this->saveAttemptItems($attemptId, $attempt['activity_id'], $answers);
        
        return [
            'success' => true,
            'attempt_id' => $attemptId,
            'score' => $score,
            'time_spent_ms' => $timeSpentMs,
            'message' => 'Attempt submitted successfully'
        ];
    }
    
    /**
     * Save individual question answers to attempt_items
     */
    private function saveAttemptItems($attemptId, $activityId, $answers) {
        // Determine activity type (fallback to multiple_choice if not available)
        $activityType = 'multiple_choice';
        try {
            $activityTypeStmt = $this->db->prepare("SELECT type FROM lesson_activities WHERE id = ? LIMIT 1");
            $activityTypeStmt->execute([$activityId]);
            $activityTypeValue = $activityTypeStmt->fetchColumn();
            if (!empty($activityTypeValue)) {
                $activityType = strtolower((string)$activityTypeValue);
            }
        } catch (Exception $e) {
            error_log("ActivityAttemptService::saveAttemptItems - Failed to determine activity type for activity {$activityId}: " . $e->getMessage());
        }
        if (!in_array($activityType, ['multiple_choice','mcq','quiz','true_false','identification','matching','essay','upload_based','coding'], true)) {
            $activityType = 'multiple_choice';
        }

        // Get questions for this activity
        // Check if 'type' column exists in activity_questions
        $hasTypeColumn = false;
        try {
            $colCheck = $this->db->query("SHOW COLUMNS FROM activity_questions LIKE 'type'");
            $hasTypeColumn = $colCheck->rowCount() > 0;
        } catch (Exception $e) {
            // Column check failed, assume it doesn't exist
        }
        
        $selectFields = ['id', 'points'];
        if ($hasTypeColumn) {
            $selectFields[] = 'type';
        }
        
        $stmt = $this->db->prepare("
            SELECT " . implode(', ', $selectFields) . "
            FROM activity_questions 
            WHERE activity_id = ? 
            ORDER BY position ASC, id ASC
        ");
        $stmt->execute([$activityId]);
        $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Ensure 'type' field exists for each question (default to 'multiple_choice' if column doesn't exist)
        foreach ($questions as &$q) {
            if (!isset($q['type'])) {
                $q['type'] = 'multiple_choice';
            }
        }
        unset($q); // Unset reference
        
        // Delete existing items for this attempt
        $deleteStmt = $this->db->prepare("DELETE FROM activity_attempt_items WHERE attempt_id = ?");
        $deleteStmt->execute([$attemptId]);
        
        // CRITICAL: Handle coding activities differently - they don't have questions, they have code and test case results
        if ($activityType === 'coding') {
            // For coding activities, save the code and results as a single attempt item
            if (isset($answers['coding']) && is_array($answers['coding'])) {
                $codingData = $answers['coding'];
                $code = $codingData['code'] ?? '';
                $language = $codingData['language'] ?? 'cpp';
                $results = $codingData['results'] ?? [];
                $testCases = $codingData['testCases'] ?? [];
                $verdict = $codingData['verdict'] ?? 'failed';
                $constructCheck = $codingData['constructCheck'] ?? null;
                
                // Calculate total score from test cases
                $totalScore = 0.0;
                foreach ($testCases as $tc) {
                    if (isset($tc['earned']) && is_numeric($tc['earned'])) {
                        $totalScore += (float)$tc['earned'];
                    }
                }
                
                // Save coding submission as a single attempt item
                // Use a special question_id of 0 or -1 to indicate it's a coding submission
                $extra = json_encode([
                    'code' => $code,
                    'language' => $language,
                    'results' => $results,
                    'testCases' => $testCases,
                    'verdict' => $verdict,
                    'constructCheck' => $constructCheck,
                    'type' => 'coding'
                ]);
                
                $stmt = $this->db->prepare("
                    INSERT INTO activity_attempt_items 
                    (attempt_id, question_id, response_text, is_correct, points_awarded, extra)
                    VALUES (?, 0, ?, ?, ?, ?)
                ");
                
                $isCorrect = ($verdict === 'AC' || $verdict === 'passed');
                $stmt->execute([
                    $attemptId,
                    $code, // Store code in response_text
                    $isCorrect ? 1 : 0,
                    $totalScore,
                    $extra
                ]);
                
                error_log("Coding activity saved - Attempt {$attemptId}, Score: {$totalScore}, Verdict: {$verdict}");
            }
            return; // Don't process questions for coding activities
        }
        
        // CRITICAL: Handle upload-based activities - they have file uploads instead of question-based answers
        if ($activityType === 'upload_based') {
            error_log("=== UPLOAD-BASED ACTIVITY DETECTED ===");
            error_log("Activity ID: {$activityId}, Attempt ID: {$attemptId}");
            error_log("Answers keys: " . implode(', ', array_keys($answers)));
            error_log("Answers full: " . json_encode($answers));
            
            // For upload-based activities, save the file info as a single attempt item
            if (isset($answers['upload'])) {
                $uploadData = $answers['upload'];
                
                error_log("Upload-based activity - Raw upload data type: " . gettype($uploadData));
                error_log("Upload-based activity - Raw upload data: " . var_export($uploadData, true));
                
                // If upload is a JSON string, decode it
                if (is_string($uploadData)) {
                    $decoded = json_decode($uploadData, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $uploadData = $decoded;
                        error_log("Upload-based activity - Decoded JSON successfully");
                    } else {
                        error_log("Upload-based activity - JSON decode error: " . json_last_error_msg());
                    }
                }
                
                if (is_array($uploadData) || is_object($uploadData)) {
                    $fileName = $uploadData['fileName'] ?? $uploadData['file_name'] ?? 'uploaded_file';
                    $fileSize = $uploadData['fileSize'] ?? $uploadData['file_size'] ?? 0;
                    $fileType = $uploadData['fileType'] ?? $uploadData['file_type'] ?? '';
                    $filePath = $uploadData['filePath'] ?? $uploadData['file_path'] ?? '';
                    
                    error_log("Upload-based activity - Extracted file info: fileName={$fileName}, fileSize={$fileSize}, fileType={$fileType}, filePath={$filePath}");
                    
                    // Store file info in response_text as JSON
                    $fileInfo = json_encode([
                        'fileName' => $fileName,
                        'fileSize' => $fileSize,
                        'fileType' => $fileType,
                        'filePath' => $filePath
                    ]);
                    
                    // Get first question ID (upload-based activities typically have one question)
                    $firstQuestionId = !empty($questions) ? (int)$questions[0]['id'] : 0;
                    
                    $stmt = $this->db->prepare("
                        INSERT INTO activity_attempt_items 
                        (attempt_id, question_id, response_text, is_correct, points_awarded, extra)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ");
                    
                    // For upload-based: is_correct and points_awarded are null (manual grading)
                    $executeResult = $stmt->execute([
                        $attemptId,
                        $firstQuestionId,
                        $fileInfo, // Store file info JSON in response_text
                        null, // is_correct = null (teacher will grade)
                        null, // points_awarded = null (teacher will grade)
                        json_encode(['type' => 'upload_based'])
                    ]);
                    
                    if (!$executeResult) {
                        $errorInfo = $stmt->errorInfo();
                        error_log("ERROR: Failed to insert upload item for attempt {$attemptId}: " . json_encode($errorInfo));
                    } else {
                        $insertedId = $this->db->lastInsertId();
                        error_log("SUCCESS: Upload-based activity saved - Attempt {$attemptId}, Item ID: {$insertedId}, File: {$fileName}, Path: {$filePath}, Response text length: " . strlen($fileInfo));
                        
                        // Verify the insert worked
                        $verifyStmt = $this->db->prepare("SELECT id, response_text FROM activity_attempt_items WHERE id = ?");
                        $verifyStmt->execute([$insertedId]);
                        $verified = $verifyStmt->fetch(PDO::FETCH_ASSOC);
                        if ($verified) {
                            error_log("VERIFIED: Item {$insertedId} exists in database, response_text length: " . strlen($verified['response_text'] ?? ''));
                        } else {
                            error_log("ERROR: Item {$insertedId} NOT FOUND in database after insert!");
                        }
                    }
                } else {
                    error_log("Upload-based activity - Upload data is not array/object, storing as-is. Type: " . gettype($uploadData));
                    // Fallback: store as plain text or JSON
                    $stmt = $this->db->prepare("
                        INSERT INTO activity_attempt_items 
                        (attempt_id, question_id, response_text, is_correct, points_awarded, extra)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ");
                    $firstQuestionId = !empty($questions) ? (int)$questions[0]['id'] : 0;
                    $responseText = is_string($uploadData) ? $uploadData : json_encode($uploadData);
                    $stmt->execute([
                        $attemptId,
                        $firstQuestionId,
                        $responseText,
                        null,
                        null,
                        json_encode(['type' => 'upload_based'])
                    ]);
                    error_log("Upload-based activity saved (fallback) - Attempt {$attemptId}, Response text: {$responseText}");
                }
            } else {
                error_log("ERROR: Upload-based activity - No 'upload' key found in answers!");
                error_log("Available keys: " . implode(', ', array_keys($answers)));
                error_log("Answers structure: " . json_encode($answers, JSON_PRETTY_PRINT));
                error_log("This means the file was not uploaded or answers were not structured correctly!");
            }
            return; // Don't process questions for upload-based activities (file is the answer)
        }
        
        // Insert each answer (for non-coding activities)
        foreach ($questions as $question) {
            $questionId = (int)$question['id'];
            $points = (float)$question['points'];
            $answer = isset($answers[$questionId]) ? $answers[$questionId] : null;
            
            if ($answer === null || $answer === '') {
                continue; // Skip unanswered questions
            }
            
            // Get question type (with fallback). If type column missing or empty, fall back to activity type.
            $questionType = $question['type'] ?? null;
            if (!$questionType) {
                $questionType = $activityType;
            }
            $questionType = strtolower((string)$questionType);
            if (!in_array($questionType, ['multiple_choice','mcq','quiz','true_false','identification','matching','essay','upload_based'], true)) {
                $questionType = 'multiple_choice';
            }
            
            // Determine if answer is correct and calculate points
            $isCorrect = null;
            $pointsAwarded = 0.0;
            
            // For MCQ/Quiz/True-False: check if choice is correct
            // CRITICAL: True/False now works EXACTLY like Multiple Choice - answer is a choice ID
            if (in_array($questionType, ['multiple_choice', 'mcq', 'quiz', 'true_false'], true)) {
                // For all choice-based questions (including True/False), answer should be choice ID
                // CRITICAL: Only select choice_text (not text) - the table doesn't have a 'text' column
                $choiceStmt = $this->db->prepare("
                    SELECT id, is_correct, choice_text
                    FROM question_choices 
                    WHERE id = ? AND question_id = ?
                ");
                $choiceStmt->execute([$answer, $questionId]);
                $choice = $choiceStmt->fetch(PDO::FETCH_ASSOC);
                
                if ($choice) {
                    // Check is_correct flag - handle multiple possible formats
                    $isCorrectFlag = false;
                    if (isset($choice['is_correct'])) {
                        $isCorrectFlag = (bool)$choice['is_correct'] || $choice['is_correct'] === 1 || $choice['is_correct'] === '1';
                    } elseif (isset($choice['correct'])) {
                        $isCorrectFlag = (bool)$choice['correct'] || $choice['correct'] === 1 || $choice['correct'] === '1';
                    }
                    
                    $isCorrect = $isCorrectFlag;
                    $pointsAwarded = $isCorrect ? $points : 0.0;
                    
                    // CRITICAL: Ensure points are awarded if answer is correct
                    if ($isCorrect && ($pointsAwarded === null || $pointsAwarded <= 0) && $points > 0) {
                        $pointsAwarded = (float)$points;
                        error_log("Choice-based scoring - Question {$questionId}: CRITICAL FIX - Correct answer but points_awarded was 0/null, setting to {$pointsAwarded}");
                    }
                    
                    error_log("Choice-based scoring - Question {$questionId} (type: {$questionType}): choice ID={$answer}, is_correct=" . ($isCorrect ? 'true' : 'false') . ", points={$points}, points_awarded={$pointsAwarded}");
                } else {
                    // Choice not found - mark as incorrect
                    $isCorrect = false;
                    $pointsAwarded = 0.0;
                    error_log("Choice-based scoring - Question {$questionId} (type: {$questionType}): Choice ID {$answer} not found, marking incorrect");
                }
            }
            // For Identification: check against explanation field (or answer field as fallback)
            elseif ($questionType === 'identification') {
                // Ensure answer is a string
                $answerText = is_string($answer) ? trim($answer) : trim((string)$answer);
                
                if (empty($answerText)) {
                    $isCorrect = false;
                    $pointsAwarded = 0.0;
                    error_log("Identification scoring - Question {$questionId}: Empty answer, marking incorrect");
                } else {
                    // Try explanation field first, then answer field as fallback
                    $qStmt = $this->db->prepare("SELECT explanation, answer FROM activity_questions WHERE id = ?");
                    $qStmt->execute([$questionId]);
                    $qData = $qStmt->fetch(PDO::FETCH_ASSOC);
                    
                    $correctAnswerSource = null;
                    if ($qData && !empty($qData['explanation'])) {
                        $correctAnswerSource = $qData['explanation'];
                        error_log("Identification scoring - Question {$questionId}: Using explanation field as correct answer source");
                    } elseif ($qData && !empty($qData['answer'])) {
                        // Fallback to answer field if explanation is empty
                        $correctAnswerSource = $qData['answer'];
                        error_log("Identification scoring - Question {$questionId}: Using answer field as correct answer source (explanation was empty)");
                    } else {
                        // Try question_choices as final fallback
                        // CRITICAL: Only select choice_text (not text) - the table doesn't have a 'text' column
                        $choiceStmt = $this->db->prepare("SELECT choice_text FROM question_choices WHERE question_id = ? AND is_correct = 1 LIMIT 1");
                        $choiceStmt->execute([$questionId]);
                        $choiceData = $choiceStmt->fetch(PDO::FETCH_ASSOC);
                        if ($choiceData) {
                            $correctAnswerSource = $choiceData['choice_text'] ?? null;
                            error_log("Identification scoring - Question {$questionId}: Using question_choices as correct answer source");
                        }
                    }
                    
                    if ($correctAnswerSource) {
                        $isCorrect = $this->checkIdentificationAnswer($answerText, $correctAnswerSource);
                        $pointsAwarded = $isCorrect ? $points : 0.0;
                        if ($isCorrect && ($pointsAwarded === null || $pointsAwarded <= 0) && $points > 0) {
                            $pointsAwarded = $points;
                        }
                        error_log("Identification scoring - Question {$questionId}: student_answer='{$answerText}', is_correct=" . ($isCorrect ? 'true' : 'false') . ", points_awarded={$pointsAwarded}");
                    } else {
                        // If no correct answer found in any field, mark as incorrect
                        error_log("Identification scoring - Question {$questionId}: No correct answer found in explanation, answer, or question_choices fields. Marking incorrect.");
                        $isCorrect = false;
                        $pointsAwarded = 0.0;
                    }
                }
            }
            // For Essay/Upload-based: manual grading (score = null, will be set by teacher later)
            elseif (in_array($questionType, ['essay', 'upload_based'], true)) {
                // Essay and upload-based activities require manual grading
                // Set is_correct and points_awarded to null - teacher will grade later
                $isCorrect = null;
                $pointsAwarded = null;
            }
            // For Matching: check if answer matches correct choice
            elseif ($questionType === 'matching') {
                // Matching works similar to MCQ - check if selected choice is correct
                $choiceStmt = $this->db->prepare("
                    SELECT is_correct 
                    FROM question_choices 
                    WHERE id = ? AND question_id = ?
                ");
                $choiceStmt->execute([$answer, $questionId]);
                $choice = $choiceStmt->fetch(PDO::FETCH_ASSOC);
                
                if ($choice) {
                    $isCorrect = (bool)$choice['is_correct'];
                    $pointsAwarded = $isCorrect ? $points : 0.0;
                }
            }
            // Default: treat as text answer (for unknown types)
            else {
                // For unknown types, store answer but don't auto-grade
                $isCorrect = null;
                $pointsAwarded = null;
            }
            
            // Insert attempt item
            $itemStmt = $this->db->prepare("
                INSERT INTO activity_attempt_items 
                (attempt_id, question_id, response_text, choice_ids, is_correct, points_awarded, extra)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $responseText = is_string($answer) ? $answer : json_encode($answer);
            // Set choice_ids for choice-based questions (MCQ, quiz, true_false, matching)
            $choiceIds = in_array($questionType, ['multiple_choice', 'mcq', 'quiz', 'true_false', 'matching'], true) 
                ? (string)$answer 
                : null;
            
            $extra = json_encode([
                'question_type' => $questionType,
                'question_points' => $points
            ]);
            
            // CRITICAL: Log before inserting attempt item
            if ($questionType === 'true_false') {
                error_log("True/False - Question {$questionId}: Inserting attempt item - is_correct=" . var_export($isCorrect, true) . ", points_awarded=" . var_export($pointsAwarded, true) . ", points={$points}");
            }
            
            $itemStmt->execute([
                $attemptId,
                $questionId,
                $responseText,
                $choiceIds,
                $isCorrect,
                $pointsAwarded,
                $extra
            ]);
            
            // CRITICAL: Verify the item was inserted correctly
            if ($questionType === 'true_false') {
                $verifyStmt = $this->db->prepare("SELECT is_correct, points_awarded FROM activity_attempt_items WHERE attempt_id = ? AND question_id = ? ORDER BY id DESC LIMIT 1");
                $verifyStmt->execute([$attemptId, $questionId]);
                $verified = $verifyStmt->fetch(PDO::FETCH_ASSOC);
                if ($verified) {
                    error_log("True/False - Question {$questionId}: VERIFIED in DB - is_correct=" . var_export($verified['is_correct'], true) . ", points_awarded=" . var_export($verified['points_awarded'], true));
                } else {
                    error_log("True/False - Question {$questionId}: ERROR - Item not found in database after insert!");
                }
            }
        }
    }
    
    /**
     * Check if identification answer is correct
     */
    private function checkIdentificationAnswer($studentAnswer, $correctAnswerJson) {
        if (empty($studentAnswer)) {
            return false;
        }
        
        $normalizedStudent = trim(strtolower((string)$studentAnswer));
        if (empty($normalizedStudent)) {
            return false;
        }
        
        // If correct answer source is empty, return false
        if (empty($correctAnswerJson)) {
            error_log("checkIdentificationAnswer: Empty correct answer source for student answer: " . $studentAnswer);
            return false;
        }
        
        // Try to parse as JSON (new format with primary + alternatives)
        try {
            $parsed = json_decode($correctAnswerJson, true);
            // Check if parsed is an associative array (object-like array) or regular array
            if ($parsed !== null && (is_array($parsed) || is_object($parsed))) {
                $parsedArray = (array)$parsed; // Convert object to array if needed
                if (!empty($parsedArray)) {
                    $acceptable = [];
                    
                    // Get primary answer
                    if (isset($parsedArray['primary']) && !empty($parsedArray['primary'])) {
                        $primary = trim(strtolower((string)$parsedArray['primary']));
                        if (!empty($primary)) {
                            $acceptable[] = $primary;
                        }
                    }
                    
                    // Get alternatives
                    if (isset($parsedArray['alternatives']) && is_array($parsedArray['alternatives'])) {
                        foreach ($parsedArray['alternatives'] as $alt) {
                            $altNormalized = trim(strtolower((string)$alt));
                            if (!empty($altNormalized) && !in_array($altNormalized, $acceptable, true)) {
                                $acceptable[] = $altNormalized;
                            }
                        }
                    }
                    
                    // Only proceed if we have at least one acceptable answer
                    if (!empty($acceptable)) {
                        // Check if student answer matches any acceptable answer
                        foreach ($acceptable as $acc) {
                            // Exact match (case-insensitive, trimmed)
                            if ($normalizedStudent === $acc) {
                                error_log("checkIdentificationAnswer: MATCH found (exact) - student: '$normalizedStudent' matches acceptable: '$acc'");
                                return true;
                            }
                            
                            // Handle common variations (remove extra spaces, punctuation)
                            $cleanAcceptable = preg_replace('/[^\w\s]/u', '', $acc);
                            $cleanAcceptable = preg_replace('/\s+/', ' ', $cleanAcceptable);
                            $cleanStudent = preg_replace('/[^\w\s]/u', '', $normalizedStudent);
                            $cleanStudent = preg_replace('/\s+/', ' ', $cleanStudent);
                            
                            if (trim($cleanStudent) === trim($cleanAcceptable)) {
                                error_log("checkIdentificationAnswer: MATCH found (cleaned) - student: '$normalizedStudent' matches acceptable: '$acc'");
                                return true;
                            }
                        }
                        
                        // Log if no match found
                        error_log("checkIdentificationAnswer: NO MATCH - student: '$normalizedStudent', acceptable: " . json_encode($acceptable));
                    } else {
                        error_log("checkIdentificationAnswer: No acceptable answers found in JSON: " . $correctAnswerJson);
                    }
                    
                    // If JSON format but no acceptable answers found, fall through to legacy
                }
            }
        } catch (Exception $e) {
            // Not JSON, treat as plain text (fall through to legacy format)
            error_log("checkIdentificationAnswer: JSON parse error (treating as plain text): " . $e->getMessage());
        }
        
        // Legacy format: plain text (explanation IS the correct answer)
        $normalizedCorrect = trim(strtolower((string)$correctAnswerJson));
        if (empty($normalizedCorrect)) {
            error_log("checkIdentificationAnswer: Empty normalized correct answer");
            return false;
        }
        
        // Exact match
        if ($normalizedStudent === $normalizedCorrect) {
            error_log("checkIdentificationAnswer: MATCH found (legacy exact) - student: '$normalizedStudent' matches correct: '$normalizedCorrect'");
            return true;
        }
        
        // Handle common variations (remove extra spaces, punctuation)
        $cleanCorrect = preg_replace('/[^\w\s]/u', '', $normalizedCorrect);
        $cleanCorrect = preg_replace('/\s+/', ' ', $cleanCorrect);
        $cleanStudent = preg_replace('/[^\w\s]/u', '', $normalizedStudent);
        $cleanStudent = preg_replace('/\s+/', ' ', $cleanStudent);
        
        $isMatch = trim($cleanStudent) === trim($cleanCorrect);
        if ($isMatch) {
            error_log("checkIdentificationAnswer: MATCH found (legacy cleaned) - student: '$normalizedStudent' matches correct: '$normalizedCorrect'");
        } else {
            error_log("checkIdentificationAnswer: NO MATCH (legacy) - student: '$normalizedStudent' vs correct: '$normalizedCorrect'");
        }
        
        return $isMatch;
    }
    
    /**
     * Get attempt details
     */
    public function getAttempt($attemptId) {
        $this->validateAttemptId($attemptId);
        
        // Check if 'type' column exists in lesson_activities table (handle gracefully if missing)
        $hasTypeColumn = false;
        try {
            $columns = $this->db->query("SHOW COLUMNS FROM lesson_activities")->fetchAll(PDO::FETCH_COLUMN);
            $hasTypeColumn = in_array('type', $columns);
        } catch (Exception $e) {
            // Table might not exist or error accessing it - continue without type column
            error_log("ActivityAttemptService::getAttempt - Could not check lesson_activities.type: " . $e->getMessage());
        }
        
        // Build SELECT query dynamically based on available columns
        $selectFields = ['aa.*', 'la.title as activity_title', 'la.max_score'];
        if ($hasTypeColumn) {
            $selectFields[] = 'la.type as activity_type';
        }
        
        $stmt = $this->db->prepare("
            SELECT " . implode(', ', $selectFields) . "
            FROM activity_attempts aa
            JOIN lesson_activities la ON aa.activity_id = la.id
            WHERE aa.id = ?
        ");
        $stmt->execute([$attemptId]);
        $attempt = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$attempt) {
            return null;
        }
        
        // Get attempt items (answers)
        $itemsStmt = $this->db->prepare("
            SELECT * FROM activity_attempt_items 
            WHERE attempt_id = ? 
            ORDER BY id ASC
        ");
        $itemsStmt->execute([$attemptId]);
        $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $attempt['items'] = $items;
        
        return $attempt;
    }
    
    /**
     * Get leaderboard data for an activity
     */
    public function getLeaderboard($activityId, $limit = 50) {
        $this->validateActivityId($activityId);
        
        // LIMIT cannot be bound as a parameter in PDO - must be an integer literal
        // Sanitize limit to prevent SQL injection
        $limit = (int)$limit;
        if ($limit <= 0) {
            $limit = 50; // Default to 50 if invalid
        }
        if ($limit > 1000) {
            $limit = 1000; // Cap at 1000 for performance
        }
        
        $stmt = $this->db->prepare("
            SELECT 
                aa.id,
                aa.user_id,
                aa.score,
                aa.time_spent_ms,
                aa.submitted_at,
                u.firstname,
                u.lastname,
                u.middlename,
                la.max_score,
                CASE 
                    WHEN la.max_score > 0 THEN (aa.score / la.max_score * 100)
                    ELSE 0
                END as percentage
            FROM activity_attempts aa
            JOIN users u ON aa.user_id = u.id
            JOIN lesson_activities la ON aa.activity_id = la.id
            WHERE aa.activity_id = ? 
                AND aa.role = 'student' 
                AND aa.is_preview = 0 
                AND aa.submitted_at IS NOT NULL
                AND aa.score IS NOT NULL
            ORDER BY 
                aa.score DESC,
                aa.time_spent_ms ASC,
                aa.submitted_at ASC
            LIMIT " . $limit . "
        ");
        $stmt->execute([$activityId]);
        $leaderboard = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Add rank and format data
        $rank = 1;
        foreach ($leaderboard as &$entry) {
            $entry['rank'] = $rank++;
            $entry['name'] = trim(($entry['lastname'] ?? '') . ', ' . ($entry['firstname'] ?? '') . ' ' . ($entry['middlename'] ?? ''));
            // Ensure percentage is a number
            $entry['percentage'] = (float)($entry['percentage'] ?? 0);
            // Ensure score is a number
            $entry['score'] = (float)($entry['score'] ?? 0);
            // Ensure max_score is a number
            $entry['max_score'] = (float)($entry['max_score'] ?? 0);
        }
        
        return $leaderboard;
    }
    
    /**
     * Get user's best attempt for an activity
     * @param int $activityId
     * @param int $userId
     * @param int|null $classId Optional class ID to filter attempts by joined_at date
     * @return array|null
     */
    public function getUserBestAttempt($activityId, $userId, $classId = null) {
        $this->validateActivityId($activityId);
        $this->validateUserId($userId);
        
        $params = [$activityId, $userId];
        $whereClause = "
            WHERE activity_id = ? 
                AND user_id = ? 
                AND role = 'student' 
                AND is_preview = 0 
                AND submitted_at IS NOT NULL
        ";
        
        // CRITICAL: If class_id is provided, filter attempts by joined_at date
        // Only count attempts submitted AFTER the student joined this class
        if ($classId !== null && $classId > 0) {
            // Get student's joined_at date for this class
            $joinedStmt = $this->db->prepare("
                SELECT joined_at 
                FROM class_students 
                WHERE class_id = ? AND student_user_id = ?
                LIMIT 1
            ");
            $joinedStmt->execute([$classId, $userId]);
            $joinedAt = $joinedStmt->fetchColumn();
            
            if ($joinedAt) {
                $whereClause .= " AND DATE(submitted_at) >= DATE(?)";
                $params[] = $joinedAt;
                error_log("getUserBestAttempt - Activity {$activityId}, User {$userId}, Class {$classId}: Filtering by joined_at = {$joinedAt}");
            }
        }
        
        // Get best attempt - prioritize non-NULL scores, then by highest score
        $stmt = $this->db->prepare("
            SELECT * FROM activity_attempts 
            $whereClause
            ORDER BY 
                CASE WHEN score IS NULL THEN 1 ELSE 0 END,  -- NULL scores last
                score DESC,  -- Highest score first
                submitted_at DESC  -- Most recent first (if scores are equal)
            LIMIT 1
        ");
        $stmt->execute($params);
        $attempt = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Log for debugging
        if ($attempt) {
            error_log("getUserBestAttempt - Activity {$activityId}, User {$userId}, Class " . ($classId ?? 'null') . ": Found attempt {$attempt['id']} with score = " . var_export($attempt['score'], true));
        } else {
            error_log("getUserBestAttempt - Activity {$activityId}, User {$userId}, Class " . ($classId ?? 'null') . ": No submitted attempts found");
        }
        
        return $attempt;
    }
    
    /**
     * Validation methods
     */
    private function validateActivityId($activityId) {
        if (!is_numeric($activityId) || $activityId <= 0) {
            throw new InvalidArgumentException('Invalid activity ID');
        }
    }
    
    private function validateUserId($userId) {
        if (!is_numeric($userId) || $userId <= 0) {
            throw new InvalidArgumentException('Invalid user ID');
        }
    }
    
    private function validateAttemptId($attemptId) {
        if (!is_numeric($attemptId) || $attemptId <= 0) {
            throw new InvalidArgumentException('Invalid attempt ID');
        }
    }
    
    private function validateAnswers($answers) {
        if (!is_array($answers)) {
            throw new InvalidArgumentException('Answers must be an array');
        }
    }
}
?>


