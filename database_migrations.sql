-- Database migrations for coordinator necessary items
-- Run these SQL commands to add constraints and indexes

-- Use a named unique index for idempotence
DROP INDEX IF EXISTS unique_activity_per_lesson ON lesson_activities;
CREATE UNIQUE INDEX unique_activity_per_lesson ON lesson_activities(lesson_id, type, title);

-- Add foreign key constraints with CASCADE
ALTER TABLE activity_test_cases 
ADD CONSTRAINT fk_test_cases_activity 
FOREIGN KEY (activity_id) REFERENCES lesson_activities(id) 
ON DELETE CASCADE;

-- Add FKs; ignore if they already exist
ALTER TABLE activity_questions 
ADD CONSTRAINT fk_questions_activity 
FOREIGN KEY (activity_id) REFERENCES lesson_activities(id) 
ON DELETE CASCADE;

-- Your schema uses `question_choices`, not `activity_choices`
ALTER TABLE question_choices 
ADD CONSTRAINT fk_choices_question 
FOREIGN KEY (question_id) REFERENCES activity_questions(id) 
ON DELETE CASCADE;

-- Drop existing indexes if present to avoid duplicate errors, then recreate
DROP INDEX IF EXISTS idx_lesson_activities_lesson_id ON lesson_activities;
CREATE INDEX idx_lesson_activities_lesson_id ON lesson_activities(lesson_id);

DROP INDEX IF EXISTS idx_activity_test_cases_activity_id ON activity_test_cases;
CREATE INDEX idx_activity_test_cases_activity_id ON activity_test_cases(activity_id);

DROP INDEX IF EXISTS idx_activity_questions_activity_id ON activity_questions;
CREATE INDEX idx_activity_questions_activity_id ON activity_questions(activity_id);

-- Index for faster join/filter on choices per question
DROP INDEX IF EXISTS idx_question_choices_question_id ON question_choices;
CREATE INDEX idx_question_choices_question_id ON question_choices(question_id);

-- Add check constraints for data integrity
-- CHECK constraints work on MySQL 8.0.16+; on older MariaDB they may be parsed but ignored
ALTER TABLE lesson_activities 
ADD CONSTRAINT chk_activity_type 
CHECK (type IN ('coding', 'quiz', 'multiple_choice', 'identification', 'essay'));

ALTER TABLE lesson_activities 
ADD CONSTRAINT chk_activity_max_score 
CHECK (max_score >= 1 AND max_score <= 1000);

ALTER TABLE activity_test_cases 
ADD CONSTRAINT chk_test_case_time_limit 
CHECK (time_limit_ms >= 100 AND time_limit_ms <= 30000);

ALTER TABLE activity_test_cases 
ADD CONSTRAINT chk_test_case_input_length 
CHECK (LENGTH(input_text) <= 2000);

ALTER TABLE activity_test_cases 
ADD CONSTRAINT chk_test_case_output_length 
CHECK (LENGTH(expected_output_text) <= 2000);

-- Add NOT NULL constraints where appropriate
-- Safe MODIFYs (skip if your column types differ)
ALTER TABLE lesson_activities 
MODIFY COLUMN title VARCHAR(255) NOT NULL;

ALTER TABLE lesson_activities 
MODIFY COLUMN type VARCHAR(50) NOT NULL;

ALTER TABLE lesson_activities 
MODIFY COLUMN lesson_id INT NOT NULL;

ALTER TABLE activity_test_cases 
MODIFY COLUMN activity_id INT NOT NULL;

ALTER TABLE activity_test_cases 
MODIFY COLUMN input_text TEXT NOT NULL;

ALTER TABLE activity_test_cases 
MODIFY COLUMN expected_output_text TEXT NOT NULL;
