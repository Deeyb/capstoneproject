<?php
/**
 * UNIVERSAL ACTIVITY API
 * Works with ANY database structure and activity type
 * Handles all created activities regardless of how they were made
 */
require_once __DIR__ . '/unified_bootstrap.php';
require_once __DIR__ . '/config/Database.php';

try {
    $db = (new Database())->getConnection();
    if (!$db) { 
        http_response_code(500);
        echo json_encode(['success'=>false,'message'=>'Database unavailable']);
        exit;
    }

    $action = $_GET['action'] ?? 'get_activity';
    $activityId = (int)($_GET['id'] ?? 0);
    
    error_log("🔍 UNIVERSAL API: Request for activity ID: " . $activityId);
    
    if ($activityId <= 0) { 
        http_response_code(400); 
        echo json_encode(['success'=>false,'message'=>'Invalid activity id']); 
        exit; 
    }
    
    switch ($action) {
        case 'get_activity':
            echo json_encode(getUniversalActivity($db, $activityId));
            break;
        default:
            http_response_code(400);
            echo json_encode(['success'=>false,'message'=>'Unknown action']);
    }
    
} catch (Throwable $e) {
    error_log("❌ UNIVERSAL API ERROR: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Server error: ' . $e->getMessage()]);
}

/**
 * UNIVERSAL ACTIVITY GETTER
 * Automatically detects and retrieves activity from ANY table structure
 */
function getUniversalActivity($db, $activityId) {
    error_log("🔍 UNIVERSAL: Starting universal activity lookup for ID: " . $activityId);
    
    // Step 1: Detect all possible activity tables
    $activityTables = detectActivityTables($db);
    error_log("🔍 UNIVERSAL: Found activity tables: " . json_encode($activityTables));
    
    // Step 2: Try to find activity in any table
    $activity = findActivityInAnyTable($db, $activityId, $activityTables);
    
    if (!$activity) {
        error_log("❌ UNIVERSAL: Activity not found in any table for ID: " . $activityId);
        return ['success'=>false, 'message'=>'Activity not found in any table'];
    }
    
    error_log("✅ UNIVERSAL: Activity found: " . json_encode($activity));
    
    // Step 3: Get questions for this activity
    $questions = getQuestionsForActivity($db, $activityId, $activity['type']);
    error_log("🔍 UNIVERSAL: Questions found: " . count($questions));
    
    // Step 4: Get choices for each question
    foreach ($questions as &$question) {
        $question['choices'] = getChoicesForQuestion($db, $question['id']);
    }
    
    $activity['questions'] = $questions;
    
    error_log("✅ UNIVERSAL: Final activity data: " . json_encode($activity));
    
    return ['success'=>true, 'activity'=>$activity];
}

/**
 * DETECT ALL POSSIBLE ACTIVITY TABLES
 */
function detectActivityTables($db) {
    $tables = [];
    
    // Common activity table patterns
    $patterns = [
        'lesson_activities',
        'activities', 
        'class_activities',
        'course_activities',
        'module_activities',
        'topic_activities',
        'user_activities',
        'teacher_activities'
    ];
    
    foreach ($patterns as $pattern) {
        try {
            $stmt = $db->prepare("SHOW TABLES LIKE ?");
            $stmt->execute([$pattern]);
            if ($stmt->fetch()) {
                $tables[] = $pattern;
            }
        } catch (Exception $e) {
            // Table doesn't exist, continue
        }
    }
    
    // Also check for tables with 'activity' in the name
    try {
        $stmt = $db->prepare("SHOW TABLES LIKE '%activity%'");
        $stmt->execute();
        $activityTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $tables = array_merge($tables, $activityTables);
    } catch (Exception $e) {
        // Continue without this check
    }
    
    return array_unique($tables);
}

/**
 * FIND ACTIVITY IN ANY TABLE
 */
function findActivityInAnyTable($db, $activityId, $tables) {
    foreach ($tables as $table) {
        try {
            error_log("🔍 UNIVERSAL: Checking table: " . $table);
            
            // Get table structure to determine column names
            $stmt = $db->prepare("DESCRIBE `$table`");
            $stmt->execute();
            $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            // Build dynamic query based on available columns
            $selectFields = [];
            $fieldMap = [
                'id' => 'id',
                'title' => 'title', 
                'name' => 'title',
                'activity_title' => 'title',
                'type' => 'type',
                'activity_type' => 'type',
                'max_score' => 'max_score',
                'total_points' => 'max_score',
                'points' => 'max_score',
                'instructions' => 'instructions',
                'description' => 'instructions',
                'content' => 'instructions'
            ];
            
            foreach ($fieldMap as $dbColumn => $standardField) {
                if (in_array($dbColumn, $columns)) {
                    $selectFields[] = "`$dbColumn` as `$standardField`";
                }
            }
            
            if (empty($selectFields)) {
                continue; // Skip tables without required fields
            }
            
            $query = "SELECT " . implode(', ', $selectFields) . " FROM `$table` WHERE id = ?";
            error_log("🔍 UNIVERSAL: Query: " . $query);
            
            $stmt = $db->prepare($query);
            $stmt->execute([$activityId]);
            $activity = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($activity) {
                error_log("✅ UNIVERSAL: Found activity in table: " . $table);
                
                // Check if the activity type should be overridden from instructions JSON
                if (isset($activity['instructions']) && !empty($activity['instructions'])) {
                    try {
                        $instructions = json_decode($activity['instructions'], true);
                        if (is_array($instructions) && isset($instructions['kind'])) {
                            $correctType = $instructions['kind'];
                            error_log("🔍 UNIVERSAL: Overriding type from '{$activity['type']}' to '{$correctType}' based on instructions JSON");
                            $activity['type'] = $correctType;
                        }
                    } catch (Exception $e) {
                        error_log("🔍 UNIVERSAL: Could not parse instructions JSON: " . $e->getMessage());
                    }
                }
                
                return $activity;
            }
            
        } catch (Exception $e) {
            error_log("❌ UNIVERSAL: Error checking table $table: " . $e->getMessage());
            continue;
        }
    }
    
    return null;
}

/**
 * GET QUESTIONS FOR ACTIVITY
 */
function getQuestionsForActivity($db, $activityId, $activityType) {
    $questions = [];
    
    // Detect question tables
    $questionTables = detectQuestionTables($db);
    error_log("🔍 UNIVERSAL: Found question tables: " . json_encode($questionTables));
    
    foreach ($questionTables as $table) {
        try {
            // Get table structure
            $stmt = $db->prepare("DESCRIBE `$table`");
            $stmt->execute();
            $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            // Build dynamic query
            $selectFields = [];
            $fieldMap = [
                'id' => 'id',
                'question_text' => 'question_text',
                'question' => 'question_text',
                'content' => 'question_text',
                'text' => 'question_text',
                'points' => 'points',
                'score' => 'points',
                'position' => 'position',
                'order' => 'position',
                'type' => 'type',
                'question_type' => 'type'
            ];
            
            foreach ($fieldMap as $dbColumn => $standardField) {
                if (in_array($dbColumn, $columns)) {
                    $selectFields[] = "`$dbColumn` as `$standardField`";
                }
            }
            
            if (empty($selectFields)) {
                continue;
            }
            
            // Try different activity_id column names
            $activityIdColumns = ['activity_id', 'lesson_id', 'class_id', 'course_id', 'module_id'];
            $whereClause = '';
            
            foreach ($activityIdColumns as $col) {
                if (in_array($col, $columns)) {
                    $whereClause = "WHERE `$col` = ?";
                    break;
                }
            }
            
            if (!$whereClause) {
                continue; // Skip tables without activity_id column
            }
            
            $query = "SELECT " . implode(', ', $selectFields) . " FROM `$table` $whereClause ORDER BY position ASC, id ASC";
            error_log("🔍 UNIVERSAL: Question query: " . $query);
            
            $stmt = $db->prepare($query);
            $stmt->execute([$activityId]);
            $foundQuestions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (!empty($foundQuestions)) {
                error_log("✅ UNIVERSAL: Found " . count($foundQuestions) . " questions in table: " . $table);
                
                // Set question type from activity type if not set
                foreach ($foundQuestions as &$question) {
                    if (empty($question['type'])) {
                        $question['type'] = $activityType;
                    }
                    
                    // Also check if question has instructions JSON with correct type
                    if (isset($question['instructions']) && !empty($question['instructions'])) {
                        try {
                            $questionInstructions = json_decode($question['instructions'], true);
                            if (is_array($questionInstructions) && isset($questionInstructions['kind'])) {
                                $correctQuestionType = $questionInstructions['kind'];
                                error_log("🔍 UNIVERSAL: Overriding question type from '{$question['type']}' to '{$correctQuestionType}' based on question instructions JSON");
                                $question['type'] = $correctQuestionType;
                            }
                        } catch (Exception $e) {
                            // Continue with existing type
                        }
                    }
                }
                
                $questions = array_merge($questions, $foundQuestions);
            }
            
        } catch (Exception $e) {
            error_log("❌ UNIVERSAL: Error checking question table $table: " . $e->getMessage());
            continue;
        }
    }
    
    return $questions;
}

/**
 * DETECT QUESTION TABLES
 */
function detectQuestionTables($db) {
    $tables = [];
    
    $patterns = [
        'activity_questions',
        'questions',
        'class_questions', 
        'course_questions',
        'lesson_questions',
        'module_questions',
        'topic_questions'
    ];
    
    foreach ($patterns as $pattern) {
        try {
            $stmt = $db->prepare("SHOW TABLES LIKE ?");
            $stmt->execute([$pattern]);
            if ($stmt->fetch()) {
                $tables[] = $pattern;
            }
        } catch (Exception $e) {
            // Table doesn't exist, continue
        }
    }
    
    return $tables;
}

/**
 * GET CHOICES FOR QUESTION
 */
function getChoicesForQuestion($db, $questionId) {
    $choices = [];
    
    // Detect choice tables
    $choiceTables = detectChoiceTables($db);
    
    foreach ($choiceTables as $table) {
        try {
            $stmt = $db->prepare("DESCRIBE `$table`");
            $stmt->execute();
            $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            $selectFields = [];
            $fieldMap = [
                'id' => 'id',
                'choice_text' => 'choice_text',
                'text' => 'choice_text',
                'content' => 'choice_text',
                'option' => 'choice_text',
                'is_correct' => 'is_correct',
                'correct' => 'is_correct',
                'answer' => 'is_correct'
            ];
            
            foreach ($fieldMap as $dbColumn => $standardField) {
                if (in_array($dbColumn, $columns)) {
                    $selectFields[] = "`$dbColumn` as `$standardField`";
                }
            }
            
            if (empty($selectFields)) {
                continue;
            }
            
            // Try different question_id column names
            $questionIdColumns = ['question_id', 'q_id', 'question'];
            $whereClause = '';
            
            foreach ($questionIdColumns as $col) {
                if (in_array($col, $columns)) {
                    $whereClause = "WHERE `$col` = ?";
                    break;
                }
            }
            
            if (!$whereClause) {
                continue;
            }
            
            $query = "SELECT " . implode(', ', $selectFields) . " FROM `$table` $whereClause ORDER BY id ASC";
            $stmt = $db->prepare($query);
            $stmt->execute([$questionId]);
            $foundChoices = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (!empty($foundChoices)) {
                $choices = array_merge($choices, $foundChoices);
            }
            
        } catch (Exception $e) {
            continue;
        }
    }
    
    return $choices;
}

/**
 * DETECT CHOICE TABLES
 */
function detectChoiceTables($db) {
    $tables = [];
    
    $patterns = [
        'question_choices',
        'choices',
        'class_choices',
        'course_choices',
        'lesson_choices',
        'options',
        'question_options'
    ];
    
    foreach ($patterns as $pattern) {
        try {
            $stmt = $db->prepare("SHOW TABLES LIKE ?");
            $stmt->execute([$pattern]);
            if ($stmt->fetch()) {
                $tables[] = $pattern;
            }
        } catch (Exception $e) {
            // Table doesn't exist, continue
        }
    }
    
    return $tables;
}
?>
