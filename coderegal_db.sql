-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 13, 2025 at 03:32 AM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `coderegal_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_attempts`
--

CREATE TABLE `activity_attempts` (
  `id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` varchar(32) NOT NULL DEFAULT 'student',
  `is_preview` tinyint(1) NOT NULL DEFAULT 0,
  `started_at` datetime NOT NULL DEFAULT current_timestamp(),
  `submitted_at` datetime DEFAULT NULL,
  `time_spent_ms` int(11) DEFAULT NULL,
  `meta` text DEFAULT NULL,
  `student_user_id` int(11) NOT NULL,
  `language` varchar(32) NOT NULL,
  `source_code` longtext DEFAULT NULL,
  `verdict` enum('passed','failed','compile_error','runtime_error') DEFAULT NULL,
  `results_json` longtext DEFAULT NULL,
  `score` decimal(6,2) DEFAULT NULL,
  `duration_ms` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_attempts`
--

INSERT INTO `activity_attempts` (`id`, `activity_id`, `user_id`, `role`, `is_preview`, `started_at`, `submitted_at`, `time_spent_ms`, `meta`, `student_user_id`, `language`, `source_code`, `verdict`, `results_json`, `score`, `duration_ms`, `created_at`) VALUES
(1, 264, 20, 'student', 0, '2025-11-08 08:35:39', NULL, 5684, NULL, 20, 'cpp', '#include <iostream>\r\nusing namespace std;\r\n\r\nint main() {\r\n    int N;\r\n    cin >> N;\r\n\r\n    int sum = N * (N + 1) / 2;\r\n\r\n    cout << sum << endl;\r\n\r\n    return 0;\r\n}', '', '[{\"output\":\"0\",\"error\":null,\"statusCode\":200,\"memory\":\"3072\",\"cpuTime\":\"0.00\",\"compilationStatus\":null,\"projectKey\":null,\"isExecutionSuccess\":true,\"isCompiled\":true},{\"output\":\"15\",\"error\":null,\"statusCode\":200,\"memory\":\"3072\",\"cpuTime\":\"0.00\",\"compilationStatus\":null,\"projectKey\":null,\"isExecutionSuccess\":true,\"isCompiled\":true},{\"output\":\"55\",\"error\":null,\"statusCode\":200,\"memory\":\"3200\",\"cpuTime\":\"0.00\",\"compilationStatus\":null,\"projectKey\":null,\"isExecutionSuccess\":true,\"isCompiled\":true}]', '26.00', 5684, '2025-11-08 08:35:39'),
(2, 264, 20, 'student', 0, '2025-11-08 08:56:15', NULL, 7210, NULL, 20, 'cpp', '#include <iostream>\r\nusing namespace std;\r\n\r\nint main() {\r\n    int N;\r\n    cin >> N;\r\n\r\n    int sum = 0;\r\n    int i = 1;\r\n\r\n    while (i <= N) {\r\n        sum += i;\r\n        i++;\r\n    }\r\n\r\n    cout << sum << endl;\r\n\r\n    return 0;\r\n}', '', '[{\"output\":\"0\",\"error\":null,\"statusCode\":200,\"memory\":\"3200\",\"cpuTime\":\"0.00\",\"compilationStatus\":null,\"projectKey\":null,\"isExecutionSuccess\":true,\"isCompiled\":true},{\"output\":\"15\",\"error\":null,\"statusCode\":200,\"memory\":\"3200\",\"cpuTime\":\"0.00\",\"compilationStatus\":null,\"projectKey\":null,\"isExecutionSuccess\":true,\"isCompiled\":true},{\"output\":\"55\",\"error\":null,\"statusCode\":200,\"memory\":\"3200\",\"cpuTime\":\"0.00\",\"compilationStatus\":null,\"projectKey\":null,\"isExecutionSuccess\":true,\"isCompiled\":true}]', '50.00', 7210, '2025-11-08 08:56:15'),
(3, 262, 20, 'student', 0, '2025-11-10 07:59:56', NULL, 4799, NULL, 20, 'cpp', '#include <iostream>\r\nusing namespace std;\r\n\r\nint main(){\r\n  cout << \"Hello, World!\" << endl;\r\n  return 0;\r\n}', '', '[{\"output\":\"Hello, World!\",\"error\":null,\"statusCode\":200,\"memory\":\"3072\",\"cpuTime\":\"0.00\",\"compilationStatus\":null,\"projectKey\":null,\"isExecutionSuccess\":true,\"isCompiled\":true},{\"output\":\"Hello, World!\",\"error\":null,\"statusCode\":200,\"memory\":\"3072\",\"cpuTime\":\"0.00\",\"compilationStatus\":null,\"projectKey\":null,\"isExecutionSuccess\":true,\"isCompiled\":true},{\"output\":\"Hello, World!\",\"error\":null,\"statusCode\":200,\"memory\":\"3200\",\"cpuTime\":\"0.00\",\"compilationStatus\":null,\"projectKey\":null,\"isExecutionSuccess\":true,\"isCompiled\":true}]', '0.00', 4799, '2025-11-10 07:59:56'),
(4, 264, 21, 'student', 0, '2025-11-11 02:37:21', '2025-11-13 07:43:53', 5234, '{\"submitted_at\":\"2025-11-13 07:43:53\",\"answer_count\":1}', 21, 'cpp', '#include <iostream>\r\nusing namespace std;\r\n\r\nint main() {\r\n    int N;\r\n    cin >> N;\r\n\r\n    int sum = 0;\r\n    int i = 1;\r\n\r\n    while (i <= N) {\r\n        sum += i;\r\n        i++;\r\n    }\r\n\r\n    cout << sum << endl;\r\n\r\n    return 0;\r\n}', '', '[{\"output\":\"0\",\"error\":null,\"statusCode\":200,\"memory\":\"3200\",\"cpuTime\":\"0.00\",\"compilationStatus\":null,\"projectKey\":null,\"isExecutionSuccess\":true,\"isCompiled\":true},{\"output\":\"15\",\"error\":null,\"statusCode\":200,\"memory\":\"3200\",\"cpuTime\":\"0.00\",\"compilationStatus\":null,\"projectKey\":null,\"isExecutionSuccess\":true,\"isCompiled\":true},{\"output\":\"55\",\"error\":null,\"statusCode\":200,\"memory\":\"3072\",\"cpuTime\":\"0.00\",\"compilationStatus\":null,\"projectKey\":null,\"isExecutionSuccess\":true,\"isCompiled\":true}]', '50.00', 5015, '2025-11-11 02:37:21'),
(54, 255, 87, 'student', 0, '2025-11-12 01:03:28', '2025-11-12 01:03:34', 5347, '{\"submitted_at\":\"2025-11-12 01:03:34\",\"answer_count\":5}', 0, '', NULL, NULL, NULL, NULL, NULL, '2025-11-12 01:03:28'),
(55, 255, 87, 'student', 0, '2025-11-12 01:04:41', '2025-11-12 01:08:23', 295113, '{\"submitted_at\":\"2025-11-12 01:08:23\",\"answer_count\":5}', 0, '', NULL, NULL, NULL, '6.00', NULL, '2025-11-12 01:04:41'),
(56, 248, 87, 'student', 0, '2025-11-12 01:08:38', '2025-11-12 01:09:02', 23944, '{\"submitted_at\":\"2025-11-12 01:09:02\",\"answer_count\":5}', 0, '', NULL, NULL, NULL, '10.00', NULL, '2025-11-12 01:08:38'),
(71, 260, 86, 'student', 0, '2025-11-12 09:40:23', '2025-11-12 09:40:28', 4684, '{\"submitted_at\":\"2025-11-12 09:40:28\",\"answer_count\":1}', 0, '', NULL, NULL, NULL, '20.00', NULL, '2025-11-12 09:40:23'),
(72, 249, 86, 'student', 0, '2025-11-12 09:40:35', '2025-11-12 09:40:40', 4202, '{\"submitted_at\":\"2025-11-12 09:40:40\",\"answer_count\":1}', 0, '', NULL, NULL, NULL, '10.00', NULL, '2025-11-12 09:40:35'),
(73, 249, 86, 'student', 0, '2025-11-12 09:47:01', NULL, NULL, NULL, 0, '', NULL, NULL, NULL, NULL, NULL, '2025-11-12 09:47:01'),
(74, 248, 86, 'student', 0, '2025-11-12 13:11:23', '2025-11-12 13:11:34', 10717, '{\"submitted_at\":\"2025-11-12 13:11:34\",\"answer_count\":5}', 0, '', NULL, NULL, NULL, '10.00', NULL, '2025-11-12 13:11:23'),
(75, 250, 86, 'student', 0, '2025-11-12 13:11:47', '2025-11-12 13:11:58', 10791, '{\"submitted_at\":\"2025-11-12 13:11:58\",\"answer_count\":1}', 0, '', NULL, NULL, NULL, '20.00', NULL, '2025-11-12 13:11:47'),
(76, 252, 86, 'student', 0, '2025-11-12 13:12:01', '2025-11-12 13:12:09', 7788, '{\"submitted_at\":\"2025-11-12 13:12:09\",\"answer_count\":1}', 0, '', NULL, NULL, NULL, '20.00', NULL, '2025-11-12 13:12:01'),
(77, 253, 86, 'student', 0, '2025-11-12 13:12:21', '2025-11-12 13:12:32', 11131, '{\"submitted_at\":\"2025-11-12 13:12:32\",\"answer_count\":5}', 0, '', NULL, NULL, NULL, '10.00', NULL, '2025-11-12 13:12:21'),
(78, 255, 86, 'student', 0, '2025-11-12 13:12:39', '2025-11-12 13:12:44', 5284, '{\"submitted_at\":\"2025-11-12 13:12:44\",\"answer_count\":5}', 0, '', NULL, NULL, NULL, '10.00', NULL, '2025-11-12 13:12:39'),
(79, 258, 86, 'student', 0, '2025-11-12 13:12:56', '2025-11-12 13:13:20', 24925, '{\"submitted_at\":\"2025-11-12 13:13:20\",\"answer_count\":5}', 0, '', NULL, NULL, NULL, '2.00', NULL, '2025-11-12 13:12:56'),
(80, 248, 88, 'student', 0, '2025-11-13 01:45:55', NULL, NULL, NULL, 0, '', NULL, NULL, NULL, NULL, NULL, '2025-11-13 01:45:55'),
(81, 248, 89, 'student', 0, '2025-11-13 01:57:31', NULL, NULL, NULL, 0, '', NULL, NULL, NULL, NULL, NULL, '2025-11-13 01:57:31'),
(82, 264, 21, 'student', 0, '2025-11-13 07:46:26', '2025-11-13 07:46:26', 3574, '{\"submitted_at\":\"2025-11-13 07:46:26\",\"answer_count\":1}', 0, '', NULL, NULL, NULL, '30.00', NULL, '2025-11-13 07:46:26'),
(83, 248, 95, 'student', 0, '2025-11-13 07:57:48', '2025-11-13 07:57:57', 9086, '{\"submitted_at\":\"2025-11-13 07:57:57\",\"answer_count\":5}', 0, '', NULL, NULL, NULL, '10.00', NULL, '2025-11-13 07:57:48'),
(84, 260, 97, 'student', 0, '2025-11-13 10:29:31', '2025-11-13 10:30:35', 63812, '{\"submitted_at\":\"2025-11-13 10:30:35\",\"answer_count\":1}', 0, '', NULL, NULL, NULL, '20.00', NULL, '2025-11-13 10:29:31');

-- --------------------------------------------------------

--
-- Table structure for table `activity_attempt_items`
--

CREATE TABLE `activity_attempt_items` (
  `id` int(11) NOT NULL,
  `attempt_id` int(11) NOT NULL,
  `question_id` int(11) DEFAULT NULL,
  `response_text` longtext DEFAULT NULL,
  `choice_ids` text DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT NULL,
  `points_awarded` decimal(10,2) DEFAULT NULL,
  `extra` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_attempt_items`
--

INSERT INTO `activity_attempt_items` (`id`, `attempt_id`, `question_id`, `response_text`, `choice_ids`, `is_correct`, `points_awarded`, `extra`) VALUES
(207, 55, 241, '530', '530', 0, '0.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(208, 55, 242, '532', '532', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(209, 55, 243, '534', '534', 0, '0.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(210, 55, 244, '536', '536', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(211, 55, 245, '538', '538', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(212, 56, 219, '488', '488', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(213, 56, 220, '491', '491', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(214, 56, 221, '494', '494', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(215, 56, 222, '499', '499', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(216, 56, 223, '502', '502', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(237, 71, 262, 'Explain the complete program translation pipeline from source code to executable. Describe each major stage (Lexical Analysis, Syntax Analysis, Semantic Analysis, Code Generation/Optimization) and the types of errors detected at each phase. Also discuss the difference between a compiler and an interpreter.', 'Explain the complete program translation pipeline from source code to executable. Describe each major stage (Lexical Analysis, Syntax Analysis, Semantic Analysis, Code Generation/Optimization) and the types of errors detected at each phase. Also discuss the difference between a compiler and an interpreter.', 0, '0.00', '{\"question_type\":\"multiple_choice\",\"question_points\":20}'),
(238, 72, 224, '{\"fileName\":\"TCW Module 4.pdf\",\"fileSize\":2874694,\"fileType\":\"application\\/pdf\",\"filePath\":\"download_activity_file.php?f=20251112_094040_24be86fe_86_249_TCW_Module_4.pdf\"}', NULL, NULL, NULL, '{\"type\":\"upload_based\"}'),
(239, 74, 219, '488', '488', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(240, 74, 220, '491', '491', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(241, 74, 221, '494', '494', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(242, 74, 222, '499', '499', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(243, 74, 223, '502', '502', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(244, 75, 229, '{\"fileName\":\"Green Achievement Certificate.jpg\",\"fileSize\":688041,\"fileType\":\"image\\/jpeg\",\"filePath\":\"download_activity_file.php?f=20251112_131158_98410a8e_86_250_Green_Achievement_Certificate.jpg\"}', NULL, NULL, NULL, '{\"type\":\"upload_based\"}'),
(245, 76, 230, '{\"fileName\":\"TCW Module 4.pdf\",\"fileSize\":2874694,\"fileType\":\"application\\/pdf\",\"filePath\":\"download_activity_file.php?f=20251112_131209_3cb248e6_86_252_TCW_Module_4.pdf\"}', NULL, NULL, NULL, '{\"type\":\"upload_based\"}'),
(246, 77, 231, 'RAM', 'RAM', 0, '0.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(247, 77, 232, 'ROM', 'ROM', 0, '0.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(248, 77, 233, 'ALU', 'ALU', 0, '0.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(249, 77, 234, 'MONITOR', 'MONITOR', 0, '0.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(250, 77, 235, 'USB', 'USB', 0, '0.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(251, 78, 241, '531', '531', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(252, 78, 242, '532', '532', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(253, 78, 243, '535', '535', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(254, 78, 244, '536', '536', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(255, 78, 245, '538', '538', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(256, 79, 252, '541', '541', 0, '0.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(257, 79, 253, '542', '542', 0, '0.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(258, 79, 254, '544', '544', 0, '0.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(259, 79, 255, '546', '546', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(260, 79, 256, '548', '548', 0, '0.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(261, 4, 0, '#include <iostream>\nusing namespace std;\n\nint main() {\n    int N;\n    cin >> N;\n\n    int sum = 0;\n    int i = 1;\n\n    while (i <= N) {\n        sum += i;\n        i++;\n    }\n\n    cout << sum << endl;\n    return 0;\n}', NULL, 1, '50.00', '{\"code\":\"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int N;\\n    cin >> N;\\n\\n    int sum = 0;\\n    int i = 1;\\n\\n    while (i <= N) {\\n        sum += i;\\n        i++;\\n    }\\n\\n    cout << sum << endl;\\n    return 0;\\n}\",\"language\":\"cpp\",\"results\":[{\"output\":\"0\",\"error\":null,\"statusCode\":200,\"memory\":\"3200\",\"cpuTime\":\"0.00\",\"compilationStatus\":null,\"projectKey\":null,\"isExecutionSuccess\":true,\"isCompiled\":true},{\"output\":\"15\",\"error\":null,\"statusCode\":200,\"memory\":\"3200\",\"cpuTime\":\"0.00\",\"compilationStatus\":null,\"projectKey\":null,\"isExecutionSuccess\":true,\"isCompiled\":true},{\"output\":\"55\",\"error\":null,\"statusCode\":200,\"memory\":\"3200\",\"cpuTime\":\"0.00\",\"compilationStatus\":null,\"projectKey\":null,\"isExecutionSuccess\":true,\"isCompiled\":true}],\"testCases\":[{\"name\":\"Test Case 1\",\"expected\":\"0\",\"stdout\":\"0\",\"status\":\"AC\",\"earned\":15,\"points\":15},{\"name\":\"Test Case 2\",\"expected\":\"15\",\"stdout\":\"15\",\"status\":\"AC\",\"earned\":15,\"points\":15},{\"name\":\"Test Case 3\",\"expected\":\"55\",\"stdout\":\"55\",\"status\":\"AC\",\"earned\":20,\"points\":20}],\"verdict\":\"AC\",\"constructCheck\":{\"ok\":true,\"used\":{\"while\":true,\"for\":false,\"if_else\":false,\"do_while\":false,\"switch\":false}},\"type\":\"coding\"}'),
(262, 82, 0, '#include <iostream>\nusing namespace std;\n\nint main() {\n    int N;\n    cin >> N;\n\n    int sum = 0;\n    int i = 1;\n\n    while (i <= N) {\n        sum += i;\n        i++;\n    }\n\n    cout << sum << endl;\n    return 0;\n}', NULL, 0, '30.00', '{\"code\":\"#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int N;\\n    cin >> N;\\n\\n    int sum = 0;\\n    int i = 1;\\n\\n    while (i <= N) {\\n        sum += i;\\n        i++;\\n    }\\n\\n    cout << sum << endl;\\n    return 0;\\n}\",\"language\":\"cpp\",\"results\":[{\"output\":\"0\",\"error\":null,\"statusCode\":200,\"memory\":\"3072\",\"cpuTime\":\"0.00\",\"compilationStatus\":null,\"projectKey\":null,\"isExecutionSuccess\":true,\"isCompiled\":true},{\"output\":\"15\",\"error\":null,\"statusCode\":200,\"memory\":\"3072\",\"cpuTime\":\"0.00\",\"compilationStatus\":null,\"projectKey\":null,\"isExecutionSuccess\":true,\"isCompiled\":true},{\"error\":\"Daily limit reached\",\"statusCode\":429}],\"testCases\":[{\"name\":\"Test Case 1\",\"expected\":\"0\",\"stdout\":\"0\",\"status\":\"AC\",\"earned\":15,\"points\":15},{\"name\":\"Test Case 2\",\"expected\":\"15\",\"stdout\":\"15\",\"status\":\"AC\",\"earned\":15,\"points\":15},{\"name\":\"Test Case 3\",\"expected\":\"55\",\"stdout\":\"\\u274c Error\\nDaily limit reached\",\"status\":\"RE\",\"earned\":0,\"points\":20}],\"verdict\":\"PA\",\"constructCheck\":{\"ok\":true,\"used\":{\"while\":true,\"for\":false,\"if_else\":false,\"do_while\":false,\"switch\":false}},\"type\":\"coding\"}'),
(263, 83, 219, '488', '488', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(264, 83, 220, '491', '491', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(265, 83, 221, '494', '494', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(266, 83, 222, '499', '499', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(267, 83, 223, '502', '502', 1, '2.00', '{\"question_type\":\"multiple_choice\",\"question_points\":2}'),
(268, 84, 262, 'Explain the complete program translation pipeline from source code to executable. Describe each major stage (Lexical Analysis, Syntax Analysis, Semantic Analysis, Code Generation/Optimization) and the types of errors detected at each phase. Also discuss the difference between a compiler and an interpreter.', 'Explain the complete program translation pipeline from source code to executable. Describe each major stage (Lexical Analysis, Syntax Analysis, Semantic Analysis, Code Generation/Optimization) and the types of errors detected at each phase. Also discuss the difference between a compiler and an interpreter.', 0, '0.00', '{\"question_type\":\"multiple_choice\",\"question_points\":20}');

-- --------------------------------------------------------

--
-- Table structure for table `activity_progress`
--

CREATE TABLE `activity_progress` (
  `id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`answers`)),
  `progress_percentage` int(11) DEFAULT 0,
  `last_updated` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_progress`
--

INSERT INTO `activity_progress` (`id`, `activity_id`, `user_id`, `answers`, `progress_percentage`, `last_updated`, `created_at`, `updated_at`) VALUES
(1, 223, 0, '[\"ASDASDASD\"]', 100, '2025-10-24 06:41:23', '2025-10-24 06:41:23', '2025-10-24 06:41:23'),
(2, 221, 0, '[]', 0, '2025-10-24 07:17:55', '2025-10-24 06:41:31', '2025-10-24 07:17:55'),
(319, 229, 0, '[\"false\",\"true\"]', 100, '2025-10-24 07:20:21', '2025-10-24 07:20:17', '2025-10-24 07:20:21'),
(327, 237, 0, '[]', 0, '2025-10-24 07:24:00', '2025-10-24 07:20:38', '2025-10-24 07:24:00');

-- --------------------------------------------------------

--
-- Table structure for table `activity_questions`
--

CREATE TABLE `activity_questions` (
  `id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  `question_text` mediumtext NOT NULL,
  `explanation` mediumtext DEFAULT NULL,
  `position` int(11) NOT NULL DEFAULT 1,
  `points` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_questions`
--

INSERT INTO `activity_questions` (`id`, `activity_id`, `question_text`, `explanation`, `position`, `points`) VALUES
(180, 223, 'TEST2', 'TEST2', 1, 1),
(198, 237, 'TEST4', 'TEST4', 1, 1),
(199, 237, 'TEST4', 'TEST41', 2, 1),
(200, 238, 'TEST5', 'TEST4', 1, 1),
(201, 221, 'TEST1', NULL, 1, 1),
(202, 221, 'TEST1', NULL, 2, 1),
(211, 229, 'TEST3', 'TEST3', 1, 1),
(212, 229, 'TEST3', 'TEST3', 2, 1),
(219, 248, 'Which phase gathers user needs, constraints, and success criteria?', NULL, 1, 2),
(220, 248, 'What is the main output of the Design phase?', NULL, 2, 2),
(221, 248, 'Which phase converts the design into working code?', NULL, 3, 2),
(222, 248, 'What is the primary purpose of the Testing phase?', NULL, 4, 2),
(223, 248, 'Arrange the PDLC phases in the correct order.', NULL, 5, 2),
(224, 249, 'Flowchart with correct symbols, connectors, I/O blocks, and computation.', '', 1, 20),
(229, 250, 'Upload your algorithm + pseudocode (include READ, decision, and PRINT).', '', 1, 20),
(230, 252, 'Upload algorithm + pseudocode with correct formula and I/O (variables named LFT and LCM).', '', 1, 20),
(231, 253, 'Temporary working memory used by the CPU.', 'RAM', 1, 2),
(232, 253, 'Permanent firmware storage on the motherboard.', 'ROM', 2, 2),
(233, 253, 'Performs arithmetic and logic operations in CPU.', 'ALU', 3, 2),
(234, 253, 'Device that displays visual output.', 'MONITOR', 4, 2),
(235, 253, 'Interface used to connect peripherals (e.g., mouse/keyboard).', 'USB', 5, 2),
(241, 255, 'RAM retains data when power is off.', NULL, 1, 2),
(242, 255, 'SSDs have no moving parts.', NULL, 2, 2),
(243, 255, 'The Control Unit executes arithmetic operations.', NULL, 3, 2),
(244, 255, 'A scanner is an input device.', NULL, 4, 2),
(245, 255, 'The PSU converts AC to DC for components.', NULL, 5, 2),
(252, 258, 'System software manages hardware resources and provides services to application programs.', NULL, 1, 2),
(253, 258, 'Application software includes antivirus programs and disk cleanup utilities.', NULL, 2, 2),
(254, 258, 'Python is a compiled language that requires a compiler before execution.', NULL, 3, 2),
(255, 258, 'Text: Java uses bytecode that is executed by a virtual machine (JVM).', NULL, 4, 2),
(256, 258, 'High-level languages are closer to machine code than low-level languages.', NULL, 5, 2),
(262, 260, 'Explain the complete program translation pipeline from source code to executable. Describe each major stage (Lexical Analysis, Syntax Analysis, Semantic Analysis, Code Generation/Optimization) and the types of errors detected at each phase. Also discuss the difference between a compiler and an interpreter.', 'Lexical Analysis: Converts source code into tokens (keywords, identifiers, operators, literals). Detects invalid characters/symbols.\nSyntax Analysis (Parsing): Builds an abstract syntax tree (AST) from tokens. Detects syntax errors (missing brackets, incorrect operator usage).\nSemantic Analysis: Checks type compatibility, variable declarations, scope rules. Detects semantic errors (type mismatches, undeclared variables, logical inconsistencies).\nCode Generation: Produces optimized machine code or intermediate code. May include optimizations for performance.\nCompiler vs Interpreter: Compiler translates entire program before execution; interpreter executes line-by-line. Compiler produces standalone executable; interpreter needs runtime environment.', 1, 20),
(263, 259, 'The set of rules that define the structure and grammar of code in a programming language.', 'Syntax', 1, 2),
(264, 259, 'The meaning or behavior of code—what the program does when executed.', 'Semantics', 2, 2),
(265, 259, 'The stage of compilation that converts source code characters into tokens (keywords, identifiers, operators).', '{\"alternatives\":[\"Lexer\",\"Lexical Analyzer\"]}', 3, 2),
(266, 259, 'The compilation phase that checks for type mismatches, undeclared variables, and logical errors.', 'Semantic Analysis', 4, 2),
(267, 259, 'The final stage that produces optimized machine code or executable code from intermediate representation.', '{\"alternatives\":[\"Code Generator\",\"Code Generation Phase\"]}', 5, 2);

-- --------------------------------------------------------

--
-- Table structure for table `activity_test_cases`
--

CREATE TABLE `activity_test_cases` (
  `id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  `is_sample` tinyint(1) DEFAULT 0,
  `input_text` text NOT NULL,
  `expected_output_text` text NOT NULL,
  `time_limit_ms` int(11) DEFAULT 2000,
  `position` int(11) NOT NULL DEFAULT 1,
  `description` varchar(500) DEFAULT NULL,
  `weight` int(11) DEFAULT 10,
  `points` int(11) DEFAULT 0
) ;

--
-- Dumping data for table `activity_test_cases`
--

INSERT INTO `activity_test_cases` (`id`, `activity_id`, `is_sample`, `input_text`, `expected_output_text`, `time_limit_ms`, `position`, `description`, `weight`, `points`) VALUES
(66, 240, 1, 'TEST6', 'TEST6', 2000, 1, NULL, 10, 0),
(67, 245, 1, '', '1 2 3 4 5', 2000, 1, NULL, 10, 0),
(68, 247, 1, '', '1 2 3 4 5', 2000, 1, NULL, 10, 0),
(136, 261, 1, '2 3', '5', 2000, 1, NULL, 10, 10),
(137, 261, 1, '10\\n-4\\n', '6', 2000, 2, NULL, 10, 10),
(138, 261, 1, '0 0', '0', 2000, 3, NULL, 10, 10),
(139, 261, 1, '1\\n2\\n', '3', 2000, 4, NULL, 10, 10),
(140, 261, 1, '1000000000 1000000000', '2000000000', 2000, 5, NULL, 10, 10),
(141, 263, 1, '3 3 3', 'Equilateral', 2000, 1, NULL, 10, 20),
(142, 263, 1, '3 4 5', 'Scalene', 2000, 2, NULL, 10, 20),
(143, 263, 1, '1 2 3', 'Invalid', 2000, 3, NULL, 10, 10),
(147, 265, 1, '48 18', '6', 2000, 1, NULL, 10, 15),
(148, 265, 1, '0 5', '5', 2000, 2, NULL, 10, 15),
(149, 265, 1, '270', '192', 2000, 3, NULL, 10, 20),
(150, 262, 1, '2 3', '5', 2000, 1, NULL, 10, 15),
(151, 262, 1, '0 0', '0', 2000, 2, NULL, 10, 15),
(152, 262, 1, '2 -3', 'Invalid', 2000, 3, NULL, 10, 20),
(156, 264, 1, '0', '0', 2000, 1, NULL, 10, 15),
(157, 264, 1, '5', '15', 2000, 2, NULL, 10, 15),
(158, 264, 1, '10', '55', 2000, 3, NULL, 10, 20),
(162, 278, 1, '0', '0', 2000, 1, NULL, 10, 10);

-- --------------------------------------------------------

--
-- Table structure for table `activity_tracking`
--

CREATE TABLE `activity_tracking` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `lesson_id` int(11) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `last_activity` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(64) NOT NULL,
  `entity_type` varchar(64) DEFAULT NULL,
  `entity_id` varchar(64) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip`, `user_agent`, `created_at`) VALUES
(1, 22, 'user.send_reset_password', 'user', 'dzescotinia@kld.edu.ph', '{\"admin_initiated\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 02:53:10'),
(2, 22, 'user.send_reset_password', 'user', 'dzescotinia@kld.edu.ph', '{\"admin_initiated\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 02:53:59'),
(3, 22, 'user.delete', 'user', '81', '{\"payload_keys\":[\"action\",\"id\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 02:55:09'),
(4, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 02:58:59'),
(5, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 02:59:44'),
(6, 82, 'auth.login_success', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 02:59:53'),
(7, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 02:59:58'),
(8, 22, 'auth_ids.create', 'authorized_id', 'KLD-22-000137', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:01:10'),
(9, 22, 'auth_ids.archive', 'authorized_id', '1', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:01:34'),
(10, 22, 'auth_ids.archive', 'authorized_id', '30', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:02:07'),
(11, 22, 'auth_ids.archive', 'authorized_id', '30', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:09:35'),
(12, 22, 'user.archive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:13:17'),
(13, 22, 'user.unarchive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:13:24'),
(14, 22, 'auth_ids.archive', 'authorized_id', '30', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:13:28'),
(15, 22, 'user.archive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:14:03'),
(16, 22, 'user.unarchive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:18:06'),
(17, 22, 'user.archive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:18:08'),
(18, 22, 'auth_ids.archive', 'authorized_id', '30', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:18:13'),
(19, 22, 'user.unarchive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:18:21'),
(20, 22, 'auth_ids.archive', 'authorized_id', '30', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:18:30'),
(21, 22, 'auth_ids.archive', 'authorized_id', '30', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:18:55'),
(22, 22, 'user.archive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:20:58'),
(23, 22, 'user.unarchive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:21:06'),
(24, 22, 'auth_ids.archive', 'authorized_id', '31', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:21:09'),
(25, 22, 'auth_ids.archive', 'authorized_id', '31', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:21:16'),
(26, 22, 'auth_ids.archive', 'authorized_id', '30', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:21:29'),
(27, 22, 'auth_ids.delete', 'authorized_id', '31', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:21:43'),
(28, 22, 'auth_ids.archive', 'authorized_id', '28', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:21:49'),
(29, 22, 'auth_ids.archive', 'authorized_id', '30', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:23:15'),
(30, 22, 'auth_ids.archive', 'authorized_id', '30', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:23:29'),
(31, 22, 'auth_ids.archive', 'authorized_id', '30', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:23:59'),
(32, 22, 'auth_ids.archive', 'authorized_id', '30', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:27:17'),
(33, 22, 'user.archive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:27:42'),
(34, 22, 'auth_ids.archive', 'authorized_id', '28', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:27:45'),
(35, 22, 'user.unarchive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:27:54'),
(36, 22, 'auth_ids.archive', 'authorized_id', '30', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:28:14'),
(37, 22, 'auth_ids.archive', 'authorized_id', '30', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:30:01'),
(38, 22, 'auth_ids.archive', 'authorized_id', '30', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:30:09'),
(39, 22, 'auth_ids.archive', 'authorized_id', '30', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:30:16'),
(40, 22, 'auth_ids.create', 'authorized_id', 'KLD-22-000138', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:35:54'),
(41, 22, 'auth_ids.archive', 'authorized_id', '32', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:36:13'),
(42, 22, 'user.archive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:37:58'),
(43, 22, 'auth_ids.archive', 'authorized_id', '32', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:39:15'),
(44, 22, 'user.unarchive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:41:00'),
(45, 22, 'auth_ids.archive', 'authorized_id', '32', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:41:05'),
(46, 22, 'auth_ids.unarchive', 'authorized_id', '32', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:41:16'),
(47, 22, 'auth_ids.bulk_archive', 'authorized_id', NULL, '{\"count\":2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:52:06'),
(48, 22, 'auth_ids.bulk_unarchive', 'authorized_id', NULL, '{\"count\":2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 03:52:10'),
(49, 22, 'user.bulk_archive', 'user', 'KLD-22-000123', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 04:01:13'),
(50, 22, 'user.bulk_archive', 'user', 'KLD-22-000126', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 04:01:13'),
(51, 22, 'user.bulk_unarchive', 'user', 'KLD-22-000123', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 04:01:24'),
(52, 22, 'user.bulk_unarchive', 'user', 'KLD-22-000126', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 04:01:24'),
(53, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 06:27:38'),
(54, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 12:06:53'),
(55, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 12:32:54'),
(56, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 12:33:02'),
(57, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 12:40:52'),
(58, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 12:50:39'),
(59, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 12:50:47'),
(60, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 12:57:01'),
(61, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 12:57:07'),
(62, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 13:14:02'),
(63, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 13:14:09'),
(64, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 13:20:40'),
(65, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 13:23:38'),
(66, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 13:23:50'),
(67, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 13:50:45'),
(68, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 13:50:51'),
(69, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 13:51:18'),
(70, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 13:51:25'),
(71, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 13:54:40'),
(72, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 13:54:46'),
(73, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:00:10'),
(74, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:00:15'),
(75, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:00:45'),
(76, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:00:52'),
(77, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:03:48'),
(78, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:03:51'),
(79, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:03:58'),
(80, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:08:38'),
(81, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:08:45'),
(82, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:09:10'),
(83, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:09:17'),
(84, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:13:42'),
(85, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:13:47'),
(86, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:13:51'),
(87, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:13:58'),
(88, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:14:29'),
(89, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:14:38'),
(90, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:18:29'),
(91, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:18:36'),
(92, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:18:39'),
(93, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:18:49'),
(94, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:22:07'),
(95, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:22:16'),
(96, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:25:27'),
(97, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:25:37'),
(98, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:27:49'),
(99, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:27:57'),
(100, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:30:55'),
(101, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:31:03'),
(102, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:35:46'),
(103, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:35:53'),
(104, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:36:50'),
(105, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:36:56'),
(106, 22, 'user.archive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:42:27'),
(107, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:51:19'),
(108, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 14:51:26'),
(109, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 15:28:56'),
(110, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 15:29:02'),
(111, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 15:29:26'),
(112, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 15:29:32'),
(113, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 15:56:32'),
(114, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 16:21:44'),
(115, 22, 'user.unarchive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 16:22:31'),
(116, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 16:23:24'),
(117, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 16:23:35'),
(118, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 16:44:29'),
(119, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 16:44:39'),
(120, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 16:55:20'),
(121, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 16:55:30'),
(122, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 17:08:09'),
(123, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 17:08:16'),
(124, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 17:09:49'),
(125, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 22:36:19'),
(126, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 22:36:19'),
(127, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 22:38:28'),
(128, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 22:56:57'),
(129, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 23:16:30'),
(130, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 23:16:37'),
(131, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 23:16:51'),
(132, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 23:17:01'),
(133, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 23:20:16'),
(134, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 23:20:22'),
(135, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 23:20:39'),
(136, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 23:20:47'),
(137, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 23:21:19'),
(138, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 23:21:24'),
(139, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 23:21:39'),
(140, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 23:21:45'),
(141, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 23:22:13'),
(142, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 23:22:21'),
(143, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 23:48:56'),
(144, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 23:49:06'),
(145, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-13 02:44:09'),
(146, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-13 02:56:55'),
(147, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-13 03:04:31'),
(148, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-13 03:04:38'),
(149, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-13 03:14:19'),
(150, 82, 'auth.login_success', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-13 03:14:25'),
(151, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-13 07:19:41'),
(152, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-13 07:19:41'),
(153, 1, 'auth.logout', 'user', '1', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:00:29'),
(154, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:03:56'),
(155, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:05:51'),
(156, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:06:34'),
(157, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:06:45'),
(158, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:07:05'),
(159, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:07:13'),
(160, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:08:11'),
(161, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:08:21'),
(162, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:08:53'),
(163, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:09:05'),
(164, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:15:09'),
(165, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:15:17'),
(166, 1, 'auth.logout', 'user', '1', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:17:26'),
(167, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:20:24'),
(168, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:20:31'),
(169, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:21:01'),
(170, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:21:08'),
(171, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:29:08'),
(172, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:29:19'),
(173, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:29:38'),
(174, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:30:58'),
(175, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:31:27'),
(176, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:31:43'),
(177, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 05:31:48'),
(178, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:01:54'),
(179, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:17:46'),
(180, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:17:55'),
(181, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:18:24'),
(182, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:18:34'),
(183, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:19:30'),
(184, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:19:38'),
(185, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:31:11'),
(186, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:31:23'),
(187, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:32:18'),
(188, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:32:28'),
(189, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:39:06'),
(190, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:39:16'),
(191, 1, 'auth.logout', 'user', '1', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:39:30'),
(192, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:39:37'),
(193, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:40:17'),
(194, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:40:26'),
(195, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:41:02'),
(196, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:41:18'),
(197, 1, 'auth.logout', 'user', '1', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:49:05'),
(198, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:49:53'),
(199, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:50:12'),
(200, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:50:27'),
(201, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:50:36'),
(202, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 06:50:46'),
(203, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 07:15:26'),
(204, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 11:50:31'),
(205, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 11:50:31'),
(206, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 20:44:24'),
(207, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 20:53:55'),
(208, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 21:18:46'),
(209, 1, 'auth.logout', 'user', '1', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 21:47:58'),
(210, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 21:48:04'),
(211, 1, 'auth.logout', 'user', '1', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 21:52:34'),
(212, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 21:53:01'),
(213, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 23:16:35'),
(214, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 23:16:44'),
(215, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-15 22:57:04'),
(216, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-15 23:58:38'),
(217, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 00:46:40'),
(218, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 03:29:09'),
(219, 22, 'user.archive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 03:29:24'),
(220, 22, 'user.unarchive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 03:29:27'),
(221, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 04:07:17'),
(222, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 13:51:14'),
(223, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 13:51:25'),
(224, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 14:08:02'),
(225, 22, 'user.archive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 14:08:16'),
(226, 22, 'user.unarchive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 14:08:18'),
(227, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 14:08:47'),
(228, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 14:08:53'),
(229, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 14:09:27'),
(230, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 14:09:35'),
(231, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 14:18:35'),
(232, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 14:19:03'),
(233, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 14:19:13'),
(234, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 14:20:15'),
(235, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 14:20:22'),
(236, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 14:21:38'),
(237, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 14:22:05'),
(238, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 14:22:46'),
(239, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 15:29:24'),
(240, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 15:57:18'),
(241, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 16:38:56'),
(242, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 21:17:11'),
(243, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 21:17:11'),
(244, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 21:18:26'),
(245, 82, 'auth.login_success', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 21:18:46'),
(246, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 21:21:29'),
(247, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 21:21:38'),
(248, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 21:28:51'),
(249, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 21:39:15'),
(250, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 21:39:23'),
(251, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 22:05:24');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip`, `user_agent`, `created_at`) VALUES
(252, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 22:05:24'),
(253, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 00:24:10'),
(254, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 01:03:57'),
(255, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 01:04:02'),
(256, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 01:04:09'),
(257, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 01:04:15'),
(258, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 01:15:54'),
(259, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 01:16:10'),
(260, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 01:44:44'),
(261, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 01:44:52'),
(262, 82, 'auth.login_success', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 01:50:43'),
(263, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 01:52:21'),
(264, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 01:52:27'),
(265, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 01:52:55'),
(266, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 01:53:02'),
(267, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 01:57:03'),
(268, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 01:57:09'),
(269, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 02:04:24'),
(270, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 02:04:31'),
(271, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 02:05:02'),
(272, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 02:05:12'),
(273, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 17:57:46'),
(274, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 18:28:23'),
(275, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 19:08:47'),
(276, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 19:08:55'),
(277, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 19:27:25'),
(278, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 21:52:15'),
(279, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 22:00:45'),
(280, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 23:13:25'),
(281, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 23:37:55'),
(282, 20, 'material.create', 'lesson_material', '13', '{\"lesson_id\":\"21\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 23:38:14'),
(283, 20, 'material.delete', 'lesson_material', '13', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 23:38:23'),
(284, 20, 'material.delete', 'lesson_material', '13', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 23:38:24'),
(285, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":21,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 23:44:20'),
(286, 20, 'material.create', 'lesson_material', '15', '{\"lesson_id\":\"21\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 23:44:37'),
(287, 20, 'material.delete', 'lesson_material', '14', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-18 03:22:20'),
(288, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":21,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-18 03:23:09'),
(289, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":22,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-18 04:08:20'),
(290, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-18 04:10:39'),
(291, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-18 04:15:49'),
(292, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-18 04:16:17'),
(293, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-18 04:16:22'),
(294, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-18 04:17:49'),
(295, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-18 04:17:56'),
(296, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-18 04:18:37'),
(297, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-18 04:18:43'),
(298, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-19 03:53:41'),
(299, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":22,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-19 04:19:22'),
(300, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-19 04:27:25'),
(301, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-19 08:10:15'),
(302, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-19 08:11:22'),
(303, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-19 08:11:36'),
(304, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-19 08:12:33'),
(305, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-19 08:12:47'),
(306, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-19 08:26:38'),
(307, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":24,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-19 09:29:28'),
(308, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":24,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-19 09:29:36'),
(309, 20, 'material.delete', 'lesson_material', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-19 09:29:48'),
(310, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":25,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-19 09:30:16'),
(311, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-19 10:23:05'),
(312, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-19 10:27:05'),
(313, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-19 14:36:47'),
(314, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-19 17:08:05'),
(315, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-19 17:16:41'),
(316, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-19 19:14:05'),
(317, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-19 22:36:58'),
(318, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-20 00:10:04'),
(319, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-20 03:23:43'),
(320, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-21 02:29:50'),
(321, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-21 02:29:57'),
(322, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-21 03:38:21'),
(323, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-21 03:38:36'),
(324, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-21 05:10:33'),
(325, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-21 05:10:49'),
(326, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-21 07:02:05'),
(327, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 02:45:07'),
(328, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 03:25:57'),
(329, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 03:26:17'),
(330, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 03:26:31'),
(331, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 03:26:50'),
(332, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 03:26:56'),
(333, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 03:27:13'),
(334, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 03:27:18'),
(335, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 04:32:04'),
(336, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 17:09:26'),
(337, 20, 'material.create', 'lesson_material', '22', '{\"lesson_id\":\"27\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 17:46:10'),
(338, 20, 'material.delete', 'lesson_material', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 17:46:16'),
(339, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":26,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 18:10:07'),
(340, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":27,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 18:10:13'),
(341, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":28,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 18:10:19'),
(342, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":28,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 18:10:25'),
(343, 20, 'material.delete', 'lesson_material', '26', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 18:10:29'),
(344, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":29,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 18:10:36'),
(345, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":30,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 18:10:48'),
(346, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":31,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 18:12:39'),
(347, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":32,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 18:12:49'),
(348, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 19:00:24'),
(349, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 19:10:18'),
(350, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 22:05:15'),
(351, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 22:07:20'),
(352, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 22:56:36'),
(353, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 22:56:49'),
(354, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 23:08:58'),
(355, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 23:09:05'),
(356, 20, 'material.reorder', 'lesson_material', NULL, '{\"lesson_id\":\"26\",\"order\":[\"23\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 23:49:28'),
(357, 20, 'material.reorder', 'lesson_material', NULL, '{\"lesson_id\":\"26\",\"order\":[\"23\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-22 23:49:29'),
(358, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":33,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 00:23:06'),
(359, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 00:44:54'),
(360, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 00:45:00'),
(361, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 00:48:18'),
(362, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 00:48:23'),
(363, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 00:55:48'),
(364, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 00:55:57'),
(365, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 01:12:21'),
(366, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 01:12:44'),
(367, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 01:13:20'),
(368, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 01:19:13'),
(369, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":34,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 01:42:13'),
(370, 20, 'activity.create', 'lesson_activity', '2', '{\"lesson_id\":34,\"title\":\"New Activity\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 01:50:15'),
(371, 20, 'activity.create', 'lesson_activity', '3', '{\"lesson_id\":26,\"title\":\"New Activity\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 01:50:42'),
(372, 20, 'activity.create', 'lesson_activity', '4', '{\"lesson_id\":34,\"title\":\"New Activity\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 01:53:45'),
(373, 20, 'activity.create', 'lesson_activity', '5', '{\"lesson_id\":35,\"title\":\"New Activity\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 01:54:48'),
(374, 20, 'activity.create', 'lesson_activity', '6', '{\"lesson_id\":35,\"title\":\"Coding Exercise\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 02:05:06'),
(375, 20, 'activity.create', 'lesson_activity', '7', '{\"lesson_id\":35,\"title\":\"New Activity\",\"type\":\"quiz\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 02:05:15'),
(376, 20, 'activity.create', 'lesson_activity', '8', '{\"lesson_id\":35,\"title\":\"New Activity\",\"type\":\"true_false\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 02:05:20'),
(377, 20, 'activity.create', 'lesson_activity', '9', '{\"lesson_id\":35,\"title\":\"New Activity\",\"type\":\"matching\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 02:05:25'),
(378, 20, 'activity.create', 'lesson_activity', '10', '{\"lesson_id\":35,\"title\":\"New Activity\",\"type\":\"identification\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 02:05:31'),
(379, 20, 'activity.update', 'lesson_activity', '7', '{\"keys\":[\"action\",\"id\",\"title\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 02:08:58'),
(380, 20, 'activity.delete', 'lesson_activity', '5', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 02:16:15'),
(381, 20, 'activity.delete', 'lesson_activity', '11', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 02:20:13'),
(382, 20, 'activity.create', 'lesson_activity', '12', '{\"lesson_id\":35,\"title\":\"Test\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 02:37:43'),
(383, 20, 'activity.delete', 'lesson_activity', '6', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 02:38:27'),
(384, 20, 'activity.delete', 'lesson_activity', '7', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 02:38:28'),
(385, 20, 'activity.delete', 'lesson_activity', '8', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 02:38:29'),
(386, 20, 'activity.delete', 'lesson_activity', '9', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 02:38:30'),
(387, 20, 'activity.delete', 'lesson_activity', '10', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 02:38:31'),
(388, 20, 'activity.delete', 'lesson_activity', '12', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 02:38:34'),
(389, 20, 'activity.create', 'lesson_activity', '13', '{\"lesson_id\":35,\"title\":\"Test\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 02:38:41'),
(390, 20, 'activity.delete', 'lesson_activity', '15', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:22:19'),
(391, 20, 'activity.delete', 'lesson_activity', '14', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:22:29'),
(392, 20, 'activity.delete', 'lesson_activity', '16', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:22:31'),
(393, 20, 'activity.delete', 'lesson_activity', '17', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:22:35'),
(394, 20, 'activity.delete', 'lesson_activity', '18', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:22:37'),
(395, 20, 'activity.delete', 'lesson_activity', '30', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:22:39'),
(396, 20, 'activity.delete', 'lesson_activity', '29', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:22:41'),
(397, 20, 'activity.delete', 'lesson_activity', '28', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:22:42'),
(398, 20, 'activity.delete', 'lesson_activity', '27', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:22:43'),
(399, 20, 'activity.delete', 'lesson_activity', '26', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:22:44'),
(400, 20, 'activity.delete', 'lesson_activity', '25', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:22:45'),
(401, 20, 'activity.delete', 'lesson_activity', '23', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:22:46'),
(402, 20, 'activity.delete', 'lesson_activity', '24', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:22:47'),
(403, 20, 'activity.delete', 'lesson_activity', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:22:49'),
(404, 20, 'activity.delete', 'lesson_activity', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:22:50'),
(405, 20, 'activity.delete', 'lesson_activity', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:22:51'),
(406, 20, 'activity.delete', 'lesson_activity', '19', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:22:52'),
(407, 20, 'activity.delete', 'lesson_activity', '66', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:03'),
(408, 20, 'activity.delete', 'lesson_activity', '49', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:05'),
(409, 20, 'activity.delete', 'lesson_activity', '50', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:07'),
(410, 20, 'activity.delete', 'lesson_activity', '51', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:08'),
(411, 20, 'activity.delete', 'lesson_activity', '52', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:10'),
(412, 20, 'activity.delete', 'lesson_activity', '55', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:12'),
(413, 20, 'activity.delete', 'lesson_activity', '40', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:14'),
(414, 20, 'activity.delete', 'lesson_activity', '41', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:15'),
(415, 20, 'activity.delete', 'lesson_activity', '42', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:16'),
(416, 20, 'activity.delete', 'lesson_activity', '43', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:17'),
(417, 20, 'activity.delete', 'lesson_activity', '65', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:20'),
(418, 20, 'activity.delete', 'lesson_activity', '64', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:40'),
(419, 20, 'activity.delete', 'lesson_activity', '31', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:42'),
(420, 20, 'activity.delete', 'lesson_activity', '32', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:43'),
(421, 20, 'activity.delete', 'lesson_activity', '33', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:45'),
(422, 20, 'activity.delete', 'lesson_activity', '34', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:46'),
(423, 20, 'activity.delete', 'lesson_activity', '35', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:48'),
(424, 20, 'activity.delete', 'lesson_activity', '36', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:49'),
(425, 20, 'activity.delete', 'lesson_activity', '37', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:50'),
(426, 20, 'activity.delete', 'lesson_activity', '38', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:53'),
(427, 20, 'activity.delete', 'lesson_activity', '39', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:55'),
(428, 20, 'activity.delete', 'lesson_activity', '44', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:56'),
(429, 20, 'activity.delete', 'lesson_activity', '45', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:57'),
(430, 20, 'activity.delete', 'lesson_activity', '46', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:58'),
(431, 20, 'activity.delete', 'lesson_activity', '47', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:23:59'),
(432, 20, 'activity.delete', 'lesson_activity', '48', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:24:00'),
(433, 20, 'activity.delete', 'lesson_activity', '53', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:24:01'),
(434, 20, 'activity.delete', 'lesson_activity', '54', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:24:03'),
(435, 20, 'activity.delete', 'lesson_activity', '56', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:24:04'),
(436, 20, 'activity.delete', 'lesson_activity', '57', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:24:05'),
(437, 20, 'activity.delete', 'lesson_activity', '58', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:24:06'),
(438, 20, 'activity.delete', 'lesson_activity', '59', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:24:07'),
(439, 20, 'activity.delete', 'lesson_activity', '60', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:24:08'),
(440, 20, 'activity.delete', 'lesson_activity', '61', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:24:09'),
(441, 20, 'activity.delete', 'lesson_activity', '62', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:24:09'),
(442, 20, 'activity.delete', 'lesson_activity', '63', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:24:11'),
(443, 20, 'activity.delete', 'lesson_activity', '67', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:26:17'),
(444, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:27:05'),
(445, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:27:11'),
(446, 22, 'user.archive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:27:23'),
(447, 22, 'user.unarchive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:27:25'),
(448, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:28:05'),
(449, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:28:20'),
(450, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:46:39'),
(451, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 22:46:45'),
(452, 20, 'activity.delete', 'lesson_activity', '68', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 00:12:40'),
(453, 20, 'activity.delete', 'lesson_activity', '13', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 00:16:45'),
(454, 20, 'activity.create', 'lesson_activity', '69', '{\"lesson_id\":35,\"title\":\"[Laboratory] test\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 00:52:21'),
(455, 20, 'activity.create', 'lesson_activity', '70', '{\"lesson_id\":35,\"title\":\"[Laboratory] test\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 00:52:23'),
(456, 20, 'activity.delete', 'lesson_activity', '70', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 00:53:37'),
(457, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 00:58:12'),
(458, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 00:59:52'),
(459, 20, 'activity.create', 'lesson_activity', '71', '{\"lesson_id\":35,\"title\":\"[Laboratory] test\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 01:00:35'),
(460, 20, 'activity.delete', 'lesson_activity', '71', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 01:10:39'),
(461, 20, 'activity.delete', 'lesson_activity', '69', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 01:10:40'),
(462, 20, 'activity.create', 'lesson_activity', '72', '{\"lesson_id\":35,\"title\":\"[Laboratory] Sum of Two Integers\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 01:34:38'),
(463, 20, 'activity.create', 'lesson_activity', '73', '{\"lesson_id\":35,\"title\":\"[Laboratory] Sum of Two Integers\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 01:34:42'),
(464, 20, 'activity.create', 'lesson_activity', '74', '{\"lesson_id\":35,\"title\":\"[Laboratory] Sum of Two Integers\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 01:34:56'),
(465, 20, 'activity.update', 'lesson_activity', '72', '{\"keys\":[\"action\",\"id\",\"instructions\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 01:40:49'),
(466, 20, 'activity.delete', 'lesson_activity', '73', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 01:41:36'),
(467, 20, 'activity.delete', 'lesson_activity', '74', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 01:41:37'),
(468, 20, 'activity.delete', 'lesson_activity', '72', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 01:44:10'),
(469, 20, 'activity.create', 'lesson_activity', '75', '{\"lesson_id\":35,\"title\":\"[Laboratory] sum\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 01:52:07'),
(470, 20, 'activity.create', 'lesson_activity', '76', '{\"lesson_id\":35,\"title\":\"[Laboratory] sum\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 01:52:12'),
(471, 20, 'activity.create', 'lesson_activity', '77', '{\"lesson_id\":35,\"title\":\"[Laboratory] sum\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 01:55:21'),
(472, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 02:23:25'),
(473, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 14:08:34'),
(474, 20, 'activity.delete', 'lesson_activity', '75', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 14:16:13'),
(475, 20, 'activity.delete', 'lesson_activity', '76', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 14:16:14'),
(476, 20, 'activity.delete', 'lesson_activity', '77', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 14:16:15'),
(477, 20, 'activity.create', 'lesson_activity', '78', '{\"lesson_id\":35,\"title\":\"[Laboratory] SUM\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 14:16:49'),
(478, 20, 'activity.update', 'lesson_activity', '78', '{\"keys\":[\"action\",\"id\",\"instructions\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 14:16:54'),
(479, 20, 'activity.create', 'lesson_activity', '79', '{\"lesson_id\":35,\"title\":\"[Laboratory] SUM\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 15:10:45'),
(480, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 23:37:18'),
(481, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-27 04:13:39'),
(482, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-27 04:13:47'),
(483, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-27 04:14:15'),
(484, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-27 04:14:24'),
(485, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-27 04:14:34'),
(486, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-27 04:14:48'),
(487, 20, 'activity.delete', 'lesson_activity', '78', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-27 19:16:58'),
(488, 20, 'activity.delete', 'lesson_activity', '79', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-27 19:17:13'),
(489, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-27 20:37:09');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip`, `user_agent`, `created_at`) VALUES
(490, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-27 21:39:36'),
(491, 20, 'activity.create', 'lesson_activity', '85', '{\"lesson_id\":35,\"title\":\"[LECTURE] test\",\"type\":\"lecture\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-27 22:54:24'),
(492, 20, 'activity.delete', 'lesson_activity', '86', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-27 23:03:27'),
(493, 20, 'activity.create', 'lesson_activity', '87', '{\"lesson_id\":35,\"title\":\"[LECTURE] test\",\"type\":\"lecture\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-27 23:11:38'),
(494, 20, 'activity.delete', 'lesson_activity', '85', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-27 23:27:19'),
(495, 20, 'activity.delete', 'lesson_activity', '87', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-27 23:27:20'),
(496, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 00:13:45'),
(497, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 00:14:02'),
(498, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 00:16:59'),
(499, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 02:06:55'),
(500, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 02:07:21'),
(501, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 02:07:29'),
(502, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 02:09:36'),
(503, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 02:09:42'),
(504, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 02:09:52'),
(505, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 02:16:57'),
(506, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 02:50:09'),
(507, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 02:58:50'),
(508, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 03:57:02'),
(509, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 03:59:21'),
(510, 20, 'activity.create', 'lesson_activity', '88', '{\"lesson_id\":35,\"title\":\"test\",\"type\":\"quiz\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:05:15'),
(511, 20, 'activity.create', 'lesson_activity', '89', '{\"lesson_id\":35,\"title\":\"test\",\"type\":\"quiz\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:05:56'),
(512, 20, 'activity.create', 'lesson_activity', '90', '{\"lesson_id\":35,\"title\":\"test\",\"type\":\"quiz\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:07:53'),
(513, 20, 'activity.delete', 'lesson_activity', '88', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:08:07'),
(514, 20, 'activity.delete', 'lesson_activity', '89', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:08:08'),
(515, 20, 'activity.delete', 'lesson_activity', '90', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:08:09'),
(516, 20, 'activity.create', 'lesson_activity', '91', '{\"lesson_id\":35,\"title\":\"test\",\"type\":\"quiz\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:08:19'),
(517, 20, 'activity.delete', 'lesson_activity', '91', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:08:41'),
(518, 20, 'activity.create', 'lesson_activity', '92', '{\"lesson_id\":35,\"title\":\"test\",\"type\":\"quiz\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:08:54'),
(519, 20, 'activity.delete', 'lesson_activity', '92', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:19:07'),
(520, 20, 'activity.create', 'lesson_activity', '94', '{\"lesson_id\":35,\"title\":\"test\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:19:38'),
(521, 20, 'activity.create', 'lesson_activity', '95', '{\"lesson_id\":35,\"title\":\"test\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:22:51'),
(522, 20, 'activity.delete', 'lesson_activity', '94', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:23:02'),
(523, 20, 'activity.delete', 'lesson_activity', '95', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:23:04'),
(524, 20, 'activity.create', 'lesson_activity', '96', '{\"lesson_id\":35,\"title\":\"test\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:41:15'),
(525, 20, 'activity.delete', 'lesson_activity', '96', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:41:28'),
(526, 20, 'activity.create', 'lesson_activity', '97', '{\"lesson_id\":35,\"title\":\"test\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:41:41'),
(527, 20, 'activity.create', 'lesson_activity', '98', '{\"lesson_id\":35,\"title\":\"test\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:46:45'),
(528, 20, 'activity.create', 'lesson_activity', '99', '{\"lesson_id\":35,\"title\":\"test\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:50:50'),
(529, 20, 'activity.delete', 'lesson_activity', '97', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:50:55'),
(530, 20, 'activity.delete', 'lesson_activity', '98', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:50:56'),
(531, 20, 'activity.delete', 'lesson_activity', '99', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:50:57'),
(532, 20, 'activity.create', 'lesson_activity', '100', '{\"lesson_id\":35,\"title\":\"test\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:51:08'),
(533, 20, 'activity.create', 'lesson_activity', '101', '{\"lesson_id\":35,\"title\":\"test\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:55:11'),
(534, 20, 'activity.create', 'lesson_activity', '102', '{\"lesson_id\":35,\"title\":\"test\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 04:59:38'),
(535, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 05:09:35'),
(536, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 05:31:20'),
(537, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 05:37:44'),
(538, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 05:39:03'),
(539, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 05:39:41'),
(540, 20, 'activity.delete', 'lesson_activity', '100', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 05:54:04'),
(541, 20, 'activity.delete', 'lesson_activity', '101', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 05:54:07'),
(542, 20, 'activity.delete', 'lesson_activity', '102', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 05:54:09'),
(543, 20, 'activity.create', 'lesson_activity', '103', '{\"lesson_id\":35,\"title\":\"test\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 05:54:25'),
(544, 20, 'activity.delete', 'lesson_activity', '103', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 05:59:59'),
(545, 20, 'activity.create', 'lesson_activity', '104', '{\"lesson_id\":35,\"title\":\"test\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 06:00:14'),
(546, 20, 'activity.create', 'lesson_activity', '105', '{\"lesson_id\":35,\"title\":\"test\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 06:04:28'),
(547, 20, 'activity.delete', 'lesson_activity', '104', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 06:05:30'),
(548, 20, 'activity.delete', 'lesson_activity', '105', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 06:05:31'),
(549, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 06:09:37'),
(550, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 06:09:54'),
(551, 20, 'activity.create', 'lesson_activity', '106', '{\"lesson_id\":26,\"title\":\"Test Activity 2025-09-27T22:10:09.070Z\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 06:10:09'),
(552, 20, 'activity.create', 'lesson_activity', '107', '{\"lesson_id\":26,\"title\":\"Test Activity 2025-09-27T22:12:22.592Z\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 06:12:22'),
(553, 20, 'activity.create', 'lesson_activity', '108', '{\"lesson_id\":26,\"title\":\"New Activity\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 06:17:27'),
(554, 20, 'activity.create', 'lesson_activity', '109', '{\"lesson_id\":26,\"title\":\"test1\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 06:20:20'),
(555, 20, 'activity.create', 'lesson_activity', '110', '{\"lesson_id\":35,\"title\":\"test1\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 06:21:36'),
(556, 20, 'activity.create', 'lesson_activity', '111', '{\"lesson_id\":35,\"title\":\"test12\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 06:29:56'),
(557, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 00:12:33'),
(558, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 00:13:52'),
(559, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 00:14:05'),
(560, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 00:14:44'),
(561, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 00:14:50'),
(562, 20, 'activity.delete', 'lesson_activity', '110', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 00:15:14'),
(563, 20, 'activity.delete', 'lesson_activity', '111', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 00:15:16'),
(564, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 01:14:23'),
(565, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 01:58:23'),
(566, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 02:20:12'),
(567, 20, 'activity.create', 'lesson_activity', '112', '{\"lesson_id\":35,\"title\":\"test1\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 03:22:55'),
(568, 20, 'activity.update', 'lesson_activity', '112', '{\"keys\":[\"action\",\"lesson_id\",\"type\",\"title\",\"max_score\",\"id\",\"instructions\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 03:57:49'),
(569, 20, 'activity.update', 'lesson_activity', '112', '{\"keys\":[\"action\",\"lesson_id\",\"type\",\"title\",\"max_score\",\"id\",\"instructions\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 03:58:03'),
(570, 20, 'activity.create', 'lesson_activity', '113', '{\"lesson_id\":35,\"title\":\"test2\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 04:06:42'),
(571, 20, 'activity.create', 'lesson_activity', '114', '{\"lesson_id\":35,\"title\":\"test2\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 04:06:51'),
(572, 20, 'activity.create', 'lesson_activity', '115', '{\"lesson_id\":35,\"title\":\"test2\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 04:07:09'),
(573, 20, 'activity.delete', 'lesson_activity', '112', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 04:54:58'),
(574, 20, 'activity.delete', 'lesson_activity', '113', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 04:55:08'),
(575, 20, 'activity.delete', 'lesson_activity', '114', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 04:55:09'),
(576, 20, 'activity.delete', 'lesson_activity', '115', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 04:55:10'),
(577, 20, 'activity.create', 'lesson_activity', '116', '{\"lesson_id\":35,\"title\":\"Sum of Two Integers\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 04:56:38'),
(578, 20, 'activity.create', 'lesson_activity', '117', '{\"lesson_id\":35,\"title\":\"Sum of Two Integers\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 04:58:44'),
(579, 20, 'activity.create', 'lesson_activity', '118', '{\"lesson_id\":35,\"title\":\"Sum of Two Integers\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 04:58:56'),
(580, 20, 'activity.delete', 'lesson_activity', '117', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 05:08:44'),
(581, 20, 'activity.delete', 'lesson_activity', '118', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 05:08:45'),
(582, 20, 'activity.delete', 'lesson_activity', '116', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 05:18:20'),
(583, 20, 'activity.create', 'lesson_activity', '119', '{\"lesson_id\":35,\"title\":\"Sum of Two Integers1\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 05:29:53'),
(584, 20, 'material.reorder', 'lesson_material', NULL, '{\"lesson_id\":\"26\",\"order\":[\"23\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 22:39:30'),
(585, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 22:41:47'),
(586, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 22:42:04'),
(587, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 22:44:02'),
(588, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 22:44:57'),
(589, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 22:45:06'),
(590, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 22:47:30'),
(591, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 22:47:37'),
(592, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 22:48:51'),
(593, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 22:51:00'),
(594, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 22:51:41'),
(595, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 23:16:25'),
(596, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 23:16:35'),
(597, 20, 'activity.create', 'lesson_activity', '120', '{\"lesson_id\":35,\"title\":\"SUM\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 23:53:02'),
(598, 20, 'activity.delete', 'lesson_activity', '120', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 23:53:54'),
(599, 20, 'activity.create', 'lesson_activity', '121', '{\"lesson_id\":35,\"title\":\"SUM\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 23:54:46'),
(600, 20, 'activity.create', 'lesson_activity', '122', '{\"lesson_id\":35,\"title\":\"SUM1\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 23:55:49'),
(601, 20, 'activity.delete', 'lesson_activity', '122', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 23:56:19'),
(602, 20, 'activity.delete', 'lesson_activity', '121', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 23:56:21'),
(603, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 00:22:21'),
(604, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 01:38:13'),
(605, 20, 'activity.create', 'lesson_activity', '123', '{\"lesson_id\":35,\"title\":\"TEST\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 01:41:11'),
(606, 20, 'activity.delete', 'lesson_activity', '123', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 01:44:19'),
(607, 20, 'activity.create', 'lesson_activity', '124', '{\"lesson_id\":35,\"title\":\"TEST2\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 01:44:43'),
(608, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 02:32:29'),
(609, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 02:32:37'),
(610, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 03:21:34'),
(611, 82, 'auth.login_success', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 03:24:48'),
(612, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 03:49:09'),
(613, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 03:49:20'),
(614, 20, 'activity.create', 'lesson_activity', '125', '{\"lesson_id\":35,\"title\":\"ACT1\",\"type\":\"quiz\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 03:57:28'),
(615, 20, 'activity.create', 'lesson_activity', '126', '{\"lesson_id\":35,\"title\":\"ACT2\",\"type\":\"quiz\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 04:07:58'),
(616, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 04:33:21'),
(617, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 14:25:33'),
(618, 20, 'activity.create', 'lesson_activity', '127', '{\"lesson_id\":35,\"title\":\"A3\",\"type\":\"quiz\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 14:27:41'),
(619, 20, 'activity.delete', 'lesson_activity', '127', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 14:27:44'),
(620, 20, 'activity.delete', 'lesson_activity', '126', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 14:59:06'),
(621, 20, 'activity.delete', 'lesson_activity', '125', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 14:59:14'),
(622, 20, 'activity.delete', 'lesson_activity', '124', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 14:59:29'),
(623, 20, 'activity.delete', 'lesson_activity', '119', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 14:59:30'),
(624, 20, 'activity.create', 'lesson_activity', '128', '{\"lesson_id\":35,\"title\":\"TEST1\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 14:59:48'),
(625, 20, 'activity.delete', 'lesson_activity', '128', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 15:05:17'),
(626, 20, 'activity.create', 'lesson_activity', '129', '{\"lesson_id\":35,\"title\":\"TEST1\",\"type\":\"quiz\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 15:05:26'),
(627, 20, 'activity.create', 'lesson_activity', '130', '{\"lesson_id\":35,\"title\":\"TEST2\",\"type\":\"quiz\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 15:08:17'),
(628, 20, 'activity.delete', 'lesson_activity', '130', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 15:30:16'),
(629, 20, 'activity.delete', 'lesson_activity', '129', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 15:30:17'),
(630, 20, 'activity.create', 'lesson_activity', '131', '{\"lesson_id\":35,\"title\":\"lab1\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 15:30:44'),
(631, 20, 'activity.create', 'lesson_activity', '132', '{\"lesson_id\":35,\"title\":\"MC1\",\"type\":\"quiz\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 15:31:58'),
(632, 20, 'activity.delete', 'lesson_activity', '131', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 15:41:25'),
(633, 20, 'activity.delete', 'lesson_activity', '132', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 15:41:26'),
(634, 20, 'activity.create', 'lesson_activity', '133', '{\"lesson_id\":35,\"title\":\"LAB1\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 15:41:52'),
(635, 20, 'activity.create', 'lesson_activity', '134', '{\"lesson_id\":35,\"title\":\"MC1\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 15:43:03'),
(636, 20, 'activity.delete', 'lesson_activity', '134', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 15:47:26'),
(637, 20, 'activity.delete', 'lesson_activity', '133', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 15:47:38'),
(638, 20, 'activity.create', 'lesson_activity', '135', '{\"lesson_id\":35,\"title\":\"MC1\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 15:48:13'),
(639, 20, 'activity.create', 'lesson_activity', '136', '{\"lesson_id\":35,\"title\":\"LAB1\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 15:50:40'),
(640, 20, 'activity.create', 'lesson_activity', '137', '{\"lesson_id\":35,\"title\":\"mc2\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 15:52:15'),
(641, 20, 'activity.update', 'lesson_activity', '137', '{\"keys\":[\"action\",\"lesson_id\",\"type\",\"title\",\"max_score\",\"id\",\"instructions\",\"csrf_token\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 15:57:47'),
(642, 20, 'activity.create', 'lesson_activity', '138', '{\"lesson_id\":35,\"title\":\"MC3\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 15:58:28'),
(643, 20, 'activity.delete', 'lesson_activity', '135', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:02:05'),
(644, 20, 'activity.delete', 'lesson_activity', '136', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:02:06'),
(645, 20, 'activity.delete', 'lesson_activity', '137', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:02:07'),
(646, 20, 'activity.delete', 'lesson_activity', '138', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:02:08'),
(647, 20, 'activity.create', 'lesson_activity', '139', '{\"lesson_id\":35,\"title\":\"MC1\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:02:27'),
(648, 20, 'activity.delete', 'lesson_activity', '139', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:09:20'),
(649, 20, 'activity.create', 'lesson_activity', '140', '{\"lesson_id\":35,\"title\":\"MC1\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:09:52'),
(650, 20, 'activity.delete', 'lesson_activity', '140', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:14:58'),
(651, 20, 'activity.create', 'lesson_activity', '141', '{\"lesson_id\":35,\"title\":\"MC1\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:15:13'),
(652, 20, 'activity.update', 'lesson_activity', '141', '{\"keys\":[\"action\",\"lesson_id\",\"type\",\"title\",\"max_score\",\"id\",\"instructions\",\"csrf_token\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:15:40'),
(653, 20, 'activity.create', 'lesson_activity', '142', '{\"lesson_id\":35,\"title\":\"MC2\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:21:05'),
(654, 20, 'activity.delete', 'lesson_activity', '141', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:24:21'),
(655, 20, 'activity.delete', 'lesson_activity', '142', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:24:23'),
(656, 20, 'activity.create', 'lesson_activity', '143', '{\"lesson_id\":35,\"title\":\"MC1\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:24:46'),
(657, 20, 'activity.delete', 'lesson_activity', '143', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:35:14'),
(658, 20, 'activity.create', 'lesson_activity', '144', '{\"lesson_id\":35,\"title\":\"MC1\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:35:29'),
(659, 20, 'activity.create', 'lesson_activity', '145', '{\"lesson_id\":35,\"title\":\"MC2\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:46:35'),
(660, 20, 'activity.delete', 'lesson_activity', '145', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:47:04'),
(661, 20, 'activity.delete', 'lesson_activity', '144', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:47:05'),
(662, 20, 'activity.create', 'lesson_activity', '146', '{\"lesson_id\":35,\"title\":\"MC1\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:47:27'),
(663, 20, 'activity.update', 'lesson_activity', '146', '{\"keys\":[\"action\",\"lesson_id\",\"type\",\"title\",\"max_score\",\"id\",\"instructions\",\"csrf_token\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:48:54'),
(664, 20, 'activity.create', 'lesson_activity', '147', '{\"lesson_id\":35,\"title\":\"LAB1\",\"type\":\"coding\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:49:36'),
(665, 20, 'activity.create', 'lesson_activity', '148', '{\"lesson_id\":35,\"title\":\"MC2\",\"type\":\"multiple_choice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:53:34'),
(666, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 17:47:20'),
(667, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 18:17:53'),
(668, 20, 'activity.delete', 'lesson_activity', '146', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 18:18:08'),
(669, 20, 'activity.delete', 'lesson_activity', '147', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 18:18:09'),
(670, 20, 'activity.delete', 'lesson_activity', '148', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 18:18:10'),
(671, 20, 'activity.delete', 'lesson_activity', '149', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 18:18:12'),
(672, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 18:44:20'),
(673, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 02:15:31'),
(674, 20, 'activity.delete', 'lesson_activity', '152', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 02:33:23'),
(675, 20, 'activity.delete', 'lesson_activity', '156', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 02:49:58'),
(676, 20, 'activity.delete', 'lesson_activity', '153', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 02:50:03'),
(677, 20, 'activity.delete', 'lesson_activity', '154', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 02:50:04'),
(678, 20, 'activity.delete', 'lesson_activity', '150', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 02:56:22'),
(679, 20, 'activity.delete', 'lesson_activity', '157', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 02:56:24'),
(680, 20, 'activity.delete', 'lesson_activity', '158', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 02:56:26'),
(681, 20, 'activity.delete', 'lesson_activity', '159', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 03:02:00'),
(682, 20, 'activity.delete', 'lesson_activity', '160', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 03:14:58'),
(683, 20, 'activity.delete', 'lesson_activity', '162', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 03:20:40'),
(684, 20, 'activity.delete', 'lesson_activity', '161', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 03:20:42'),
(685, 20, 'activity.delete', 'lesson_activity', '151', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 03:32:56'),
(686, 20, 'activity.delete', 'lesson_activity', '155', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 03:32:57'),
(687, 20, 'activity.delete', 'lesson_activity', '163', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 03:32:59'),
(688, 20, 'activity.delete', 'lesson_activity', '164', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 03:33:00'),
(689, 20, 'activity.delete', 'lesson_activity', '165', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 03:33:01'),
(690, 20, 'activity.delete', 'lesson_activity', '166', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 03:33:02'),
(691, 20, 'activity.delete', 'lesson_activity', '167', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 03:45:18'),
(692, 20, 'activity.delete', 'lesson_activity', '168', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 03:45:19'),
(693, 20, 'activity.delete', 'lesson_activity', '169', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 04:22:19'),
(694, 20, 'activity.delete', 'lesson_activity', '170', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 04:28:54'),
(695, 20, 'activity.delete', 'lesson_activity', '171', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 04:28:56'),
(696, 20, 'activity.delete', 'lesson_activity', '172', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 04:28:57'),
(697, 20, 'activity.delete', 'lesson_activity', '173', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 04:28:58'),
(698, 20, 'activity.delete', 'lesson_activity', '175', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 04:32:12'),
(699, 20, 'activity.delete', 'lesson_activity', '174', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 04:32:13'),
(700, 20, 'activity.delete', 'lesson_activity', '177', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 04:35:35'),
(701, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":35,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 05:02:20'),
(702, 20, 'material.delete', 'lesson_material', '33', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 05:06:51'),
(703, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":35,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 05:06:56'),
(704, 20, 'material.create', 'lesson_material', '35', '{\"lesson_id\":\"35\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 22:01:20'),
(705, 20, 'material.create', 'lesson_material', '36', '{\"lesson_id\":\"35\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 22:02:51'),
(706, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":35,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 22:04:09'),
(707, 20, 'material.page_create', 'lesson_material', '38', '{\"lesson_id\":35}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 22:43:31'),
(708, 20, 'material.reorder', 'lesson_material', NULL, '{\"lesson_id\":\"35\",\"order\":[\"34\",\"35\",\"36\",\"37\",\"38\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 23:02:54'),
(709, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 03:24:21'),
(710, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 03:24:27'),
(711, 20, 'material.page_create', 'lesson_material', '39', '{\"lesson_id\":35}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 03:41:41'),
(712, 20, 'material.reorder', 'lesson_material', NULL, '{\"lesson_id\":\"35\",\"order\":[\"34\",\"35\",\"36\",\"37\",\"38\",\"39\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 03:41:45');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip`, `user_agent`, `created_at`) VALUES
(713, 20, 'material.reorder', 'lesson_material', NULL, '{\"lesson_id\":\"35\",\"order\":[\"34\",\"35\",\"36\",\"37\",\"38\",\"39\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 11:57:13'),
(714, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 12:03:59'),
(715, 20, 'material.reorder', 'lesson_material', NULL, '{\"lesson_id\":\"35\",\"order\":[\"34\",\"35\",\"36\",\"37\",\"38\",\"39\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 12:04:05'),
(716, 20, 'material.reorder', 'lesson_material', NULL, '{\"lesson_id\":\"35\",\"order\":[\"34\",\"35\",\"36\",\"37\",\"38\",\"39\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 12:18:47'),
(717, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 12:26:14'),
(718, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 12:27:12'),
(719, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 12:27:24'),
(720, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 12:29:11'),
(721, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 12:32:12'),
(722, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 12:32:26'),
(723, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 13:15:30'),
(724, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 13:15:39'),
(725, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 13:51:13'),
(726, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 13:51:54'),
(727, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 13:52:03'),
(728, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-03 15:31:17'),
(729, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-03 15:31:51'),
(730, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-03 15:32:01'),
(731, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-03 15:32:55'),
(732, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-03 15:33:29'),
(733, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-03 15:34:01'),
(734, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-03 15:34:15'),
(735, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-03 15:58:19'),
(736, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-03 16:05:24'),
(737, 82, 'auth.login_success', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-03 16:05:41'),
(738, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-03 16:20:05'),
(739, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-03 16:56:25'),
(740, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-03 17:01:25'),
(741, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-03 17:03:52'),
(742, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-04 00:08:25'),
(743, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-04 04:30:44'),
(744, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-04 04:30:53'),
(745, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":37,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-04 04:48:49'),
(746, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":38,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-04 04:48:55'),
(747, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":39,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-04 04:49:00'),
(748, 20, 'material.reorder', 'lesson_material', NULL, '{\"lesson_id\":\"38\",\"order\":[\"42\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 02:31:18'),
(749, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 05:12:48'),
(750, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 06:02:56'),
(751, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 06:05:58'),
(752, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 06:16:33'),
(753, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":40,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 06:21:36'),
(754, 20, 'material.create', 'lesson_material', '45', '{\"lesson_id\":\"41\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 06:22:16'),
(755, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":42,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 06:25:35'),
(756, 20, 'material.delete', 'lesson_material', '46', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 06:26:10'),
(757, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":42,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 06:27:23'),
(758, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 06:39:41'),
(759, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 07:40:52'),
(760, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 08:06:00'),
(761, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 08:31:49'),
(762, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 10:09:54'),
(763, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 10:09:54'),
(764, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 10:14:41'),
(765, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 10:14:52'),
(766, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 10:15:03'),
(767, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 10:16:17'),
(768, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 10:16:24'),
(769, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 15:29:18'),
(770, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 15:29:30'),
(771, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 19:16:07'),
(772, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 07:48:08'),
(773, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 08:20:20'),
(774, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 09:11:43'),
(775, 82, 'auth.logout', 'user', '82', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 09:12:07'),
(776, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 09:12:13'),
(777, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 09:13:43'),
(778, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 09:13:51'),
(779, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 09:19:10'),
(780, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 09:19:17'),
(781, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 09:26:54'),
(782, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 09:27:02'),
(783, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 13:40:02'),
(784, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 13:41:40'),
(785, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 14:04:19'),
(786, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 22:33:41'),
(787, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-08 12:13:42'),
(788, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-08 13:07:22'),
(789, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-08 13:08:22'),
(790, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-08 13:10:17'),
(791, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-08 13:11:01'),
(792, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-08 13:12:08'),
(793, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-08 13:12:16'),
(794, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-08 13:49:22'),
(795, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-08 14:06:53'),
(796, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-08 15:23:22'),
(797, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-09 07:47:33'),
(798, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-09 08:59:21'),
(799, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-09 12:16:43'),
(800, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-10 00:37:33'),
(801, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-10 00:37:49'),
(802, 22, 'user.delete', 'user', '82', '{\"payload_keys\":[\"action\",\"id\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-10 00:37:57'),
(803, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-10 00:38:10'),
(804, 83, 'auth.login_success', 'user', '83', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-10 00:39:43'),
(805, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-10 00:39:59'),
(806, 22, 'user.edit', 'user', '83', '{\"payload_keys\":[\"action\",\"id\",\"firstname\",\"middlename\",\"lastname\",\"id_number\",\"email\",\"role\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-10 00:40:12'),
(807, 83, 'auth.logout', 'user', '83', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-10 00:40:53'),
(808, 83, 'auth.logout', 'user', '83', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-10 00:53:23'),
(809, 22, 'user.delete', 'user', '83', '{\"payload_keys\":[\"action\",\"id\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-10 00:53:27'),
(810, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-10 00:56:30'),
(811, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-10 12:16:04'),
(812, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-10 13:29:22'),
(813, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-11 14:38:19'),
(814, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-11 14:38:56'),
(815, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-11 15:53:22'),
(816, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-11 16:32:39'),
(817, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-11 16:53:01'),
(818, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-11 16:57:03'),
(819, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-11 17:29:58'),
(820, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 23:30:13'),
(821, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 23:37:40'),
(822, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 23:37:48'),
(823, 20, 'activity.delete', 'lesson_activity', '215', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 00:32:59'),
(824, 20, 'activity.delete', 'lesson_activity', '219', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 00:33:01'),
(825, 20, 'activity.delete', 'lesson_activity', '213', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 00:33:50'),
(826, 20, 'activity.delete', 'lesson_activity', '214', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 00:33:51'),
(827, 20, 'activity.delete', 'lesson_activity', '220', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 00:33:52'),
(828, 20, 'activity.delete', 'lesson_activity', '216', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 00:33:54'),
(829, 20, 'activity.delete', 'lesson_activity', '217', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 00:33:55'),
(830, 20, 'activity.delete', 'lesson_activity', '218', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 00:33:57'),
(831, 20, 'activity.delete', 'lesson_activity', '222', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 00:37:09'),
(832, 20, 'activity.delete', 'lesson_activity', '227', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 00:38:33'),
(833, 20, 'activity.delete', 'lesson_activity', '226', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 00:38:34'),
(834, 20, 'activity.delete', 'lesson_activity', '225', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 00:43:35'),
(835, 20, 'activity.delete', 'lesson_activity', '224', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 00:46:04'),
(836, 20, 'activity.delete', 'lesson_activity', '228', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 00:46:06'),
(837, 20, 'activity.delete', 'lesson_activity', '230', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 00:52:22'),
(838, 20, 'activity.delete', 'lesson_activity', '231', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 00:55:22'),
(839, 20, 'activity.delete', 'lesson_activity', '232', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 00:57:28'),
(840, 20, 'activity.delete', 'lesson_activity', '233', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 00:59:36'),
(841, 20, 'activity.delete', 'lesson_activity', '234', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 01:10:38'),
(842, 20, 'activity.delete', 'lesson_activity', '235', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 01:22:15'),
(843, 20, 'activity.delete', 'lesson_activity', '236', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 01:22:30'),
(844, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 01:24:50'),
(845, 20, 'activity.delete', 'lesson_activity', '239', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 01:25:56'),
(846, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 04:10:26'),
(847, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 04:11:35'),
(848, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 05:29:11'),
(849, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 11:27:26'),
(850, 20, 'activity.delete', 'lesson_activity', '241', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-19 20:23:00'),
(851, 20, 'activity.delete', 'lesson_activity', '242', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-19 20:28:43'),
(852, 20, 'activity.delete', 'lesson_activity', '243', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-19 20:29:15'),
(853, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-20 11:00:43'),
(854, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-20 21:27:53'),
(855, 20, 'material.page_create', 'lesson_material', '48', '{\"lesson_id\":56}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-20 21:36:46'),
(856, 20, 'material.delete', 'lesson_material', '48', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-20 21:36:57'),
(857, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-20 21:55:06'),
(858, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-20 21:55:16'),
(859, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-20 22:18:33'),
(860, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":37,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-20 22:21:46'),
(861, 20, 'material.create', 'lesson_material', '50', '{\"lesson_id\":\"37\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-20 22:31:33'),
(862, 20, 'material.reorder', 'lesson_material', NULL, '{\"lesson_id\":\"37\",\"order\":[\"49\",\"50\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-20 22:31:54'),
(863, 20, 'material.delete', 'lesson_material', '50', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-20 22:31:56'),
(864, 20, 'material.create', 'lesson_material', '51', '{\"lesson_id\":\"38\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-20 22:32:01'),
(865, 20, 'material.create', 'lesson_material', '52', '{\"lesson_id\":\"40\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-20 22:34:14'),
(866, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":39,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-20 23:04:46'),
(867, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-21 03:27:56'),
(868, 20, 'material.delete', 'lesson_material', '52', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-21 03:28:11'),
(869, 20, 'material.create', 'lesson_material', '54', '{\"lesson_id\":\"40\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-21 03:28:19'),
(870, 20, 'material.delete', 'lesson_material', '54', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-21 03:30:50'),
(871, 20, 'material.create', 'lesson_material', '55', '{\"lesson_id\":\"40\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-21 03:30:56'),
(872, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 23:34:52'),
(873, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":44,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 23:36:26'),
(874, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 00:51:50'),
(875, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 01:03:12'),
(876, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 01:03:19'),
(877, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 02:11:11'),
(878, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 02:11:21'),
(879, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 02:12:12'),
(880, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 02:13:34'),
(881, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 03:48:08'),
(882, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 15:06:47'),
(883, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 15:12:53'),
(884, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 17:19:43'),
(885, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 01:09:31'),
(886, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 01:56:46'),
(887, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:25:19'),
(888, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:30:34'),
(889, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:31:39'),
(890, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:31:52'),
(891, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:32:39'),
(892, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:33:24'),
(893, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:34:24'),
(894, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:34:31'),
(895, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:35:03'),
(896, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:36:29'),
(897, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:36:46'),
(898, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:46:00'),
(899, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:46:08'),
(900, 22, 'user.archive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:47:08'),
(901, 22, 'user.unarchive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:47:13'),
(902, 22, 'auth_ids.archive', 'authorized_id', '32', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:47:21'),
(903, 22, 'auth_ids.unarchive', 'authorized_id', '32', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:47:24'),
(904, 22, 'auth_ids.delete', 'authorized_id', '32', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:47:25'),
(905, 22, 'auth_ids.delete', 'authorized_id', '30', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:47:31'),
(906, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:49:48'),
(907, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:50:06'),
(908, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:51:08'),
(909, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 02:51:18'),
(910, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 13:53:24'),
(911, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 14:46:45'),
(912, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 14:46:59'),
(913, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 22:33:23'),
(914, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 23:17:21'),
(915, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 23:18:43'),
(916, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 23:23:56'),
(917, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 23:35:16'),
(918, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 23:37:55'),
(919, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 23:38:33'),
(920, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 07:52:14'),
(921, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 07:54:53'),
(922, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 07:55:01'),
(923, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 09:00:21'),
(924, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 09:00:27'),
(925, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 09:00:41'),
(926, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 09:16:59'),
(927, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 09:17:10'),
(928, 22, 'user.edit', 'user', '84', '{\"payload_keys\":[\"action\",\"id\",\"firstname\",\"middlename\",\"lastname\",\"id_number\",\"email\",\"role\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 09:17:31'),
(929, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 09:17:52'),
(930, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 09:18:09'),
(931, 22, 'user.edit', 'user', '84', '{\"payload_keys\":[\"action\",\"id\",\"firstname\",\"middlename\",\"lastname\",\"id_number\",\"email\",\"role\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 09:18:17'),
(932, 22, 'user.edit', 'user', '84', '{\"payload_keys\":[\"action\",\"id\",\"firstname\",\"middlename\",\"lastname\",\"id_number\",\"email\",\"role\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 09:18:21'),
(933, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 09:26:41'),
(934, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 09:26:54'),
(935, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 09:41:08'),
(936, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 17:42:00'),
(937, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 17:43:02'),
(938, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 17:48:44'),
(939, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 17:52:49'),
(940, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 17:53:18'),
(941, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 17:56:17'),
(942, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 17:59:29'),
(943, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:00:17'),
(944, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:00:23'),
(945, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:00:30'),
(946, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:00:37'),
(947, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:00:46'),
(948, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:00:52'),
(949, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:04:39'),
(950, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:04:51'),
(951, 84, 'auth.login_success', 'user', '84', NULL, NULL, NULL, '2025-10-25 18:09:41'),
(952, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:10:00'),
(953, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:10:26'),
(954, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:14:45'),
(955, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:14:56'),
(956, 20, 'auth.login_success', 'user', '20', NULL, NULL, NULL, '2025-10-25 18:16:27'),
(957, 21, 'auth.login_success', 'user', '21', NULL, NULL, NULL, '2025-10-25 18:16:27'),
(958, 22, 'auth.login_success', 'user', '22', NULL, NULL, NULL, '2025-10-25 18:16:27'),
(959, 84, 'auth.login_success', 'user', '84', NULL, NULL, NULL, '2025-10-25 18:16:27'),
(960, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:17:50'),
(961, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:23:01'),
(962, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:23:11'),
(963, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:23:43');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip`, `user_agent`, `created_at`) VALUES
(964, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:23:50'),
(965, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:23:58'),
(966, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:24:04'),
(967, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:24:08'),
(968, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:24:18'),
(969, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:24:21'),
(970, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:27:15'),
(971, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 18:27:24'),
(972, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 19:21:05'),
(973, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 19:30:05'),
(974, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 01:21:18'),
(975, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 01:26:10'),
(976, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 01:28:05'),
(977, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 01:28:14'),
(978, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:11:57'),
(979, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:17:15'),
(980, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:17:40'),
(981, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:17:52'),
(982, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:18:18'),
(983, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:18:23'),
(984, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:18:27'),
(985, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:18:45'),
(986, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:19:05'),
(987, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:19:13'),
(988, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:19:20'),
(989, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:19:28'),
(990, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:20:03'),
(991, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:25:09'),
(992, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:34:55'),
(993, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:35:32'),
(994, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:52:45'),
(995, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:53:01'),
(996, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:53:20'),
(997, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:53:54'),
(998, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 00:58:40'),
(999, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:00:04'),
(1000, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:11:34'),
(1001, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:11:52'),
(1002, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:12:34'),
(1003, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:13:09'),
(1004, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:13:19'),
(1005, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:13:52'),
(1006, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:14:09'),
(1007, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:18:40'),
(1008, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:20:44'),
(1009, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:21:12'),
(1010, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:21:22'),
(1011, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:21:42'),
(1012, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:22:09'),
(1013, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:22:20'),
(1014, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:23:06'),
(1015, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:23:21'),
(1016, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:32:27'),
(1017, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:32:35'),
(1018, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:33:47'),
(1019, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 01:38:38'),
(1020, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 12:23:54'),
(1021, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 12:24:02'),
(1022, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 13:09:03'),
(1023, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 13:33:03'),
(1024, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 16:36:04'),
(1025, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 23:02:53'),
(1026, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 23:03:01'),
(1027, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 23:45:14'),
(1028, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 23:45:29'),
(1029, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 23:46:28'),
(1030, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 23:46:41'),
(1031, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 23:50:53'),
(1032, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 23:51:07'),
(1033, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 23:59:01'),
(1034, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 23:59:14'),
(1035, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 23:59:40'),
(1036, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-28 00:00:53'),
(1037, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-28 00:01:03'),
(1038, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-28 00:01:27'),
(1039, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-28 18:31:28'),
(1040, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-28 22:12:54'),
(1041, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-28 22:12:54'),
(1042, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-28 23:12:32'),
(1043, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-28 23:12:42'),
(1044, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-28 23:15:43'),
(1045, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-28 23:15:55'),
(1046, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 00:18:03'),
(1047, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 00:38:03'),
(1048, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 01:07:24'),
(1049, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 01:36:03'),
(1050, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 01:36:42'),
(1051, 20, 'activity.delete', 'lesson_activity', '246', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 16:40:08'),
(1052, 20, 'material.delete', 'lesson_material', '57', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 18:01:41'),
(1053, 20, 'material.delete', 'lesson_material', '58', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 18:02:34'),
(1054, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 18:05:18'),
(1055, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 18:05:48'),
(1056, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 18:06:02'),
(1057, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 19:10:04'),
(1058, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 01:07:12'),
(1059, 20, 'material.page_create', 'lesson_material', '59', '{\"lesson_id\":66}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 01:18:19'),
(1060, 20, 'material.reorder', 'lesson_material', NULL, '{\"lesson_id\":\"66\",\"order\":[\"59\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 01:18:49'),
(1061, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 01:23:30'),
(1062, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 01:37:27'),
(1063, 20, 'material.page_update', 'lesson_material', '59', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 01:52:45'),
(1064, 20, 'material.page_update', 'lesson_material', '59', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 01:52:51'),
(1065, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 01:53:13'),
(1066, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 01:53:43'),
(1067, 20, 'material.page_update', 'lesson_material', '59', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 02:25:58'),
(1068, 20, 'material.page_update', 'lesson_material', '59', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 02:26:24'),
(1069, 20, 'material.page_update', 'lesson_material', '59', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 02:28:57'),
(1070, 20, 'material.page_create', 'lesson_material', '60', '{\"lesson_id\":66}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 02:29:41'),
(1071, 20, 'material.delete', 'lesson_material', '59', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 02:32:02'),
(1072, 20, 'material.page_update', 'lesson_material', '60', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 03:05:02'),
(1073, 20, 'material.page_update', 'lesson_material', '60', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 03:07:54'),
(1074, 20, 'material.page_update', 'lesson_material', '60', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 03:08:19'),
(1075, 20, 'material.page_update', 'lesson_material', '60', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 03:08:39'),
(1076, 20, 'material.page_update', 'lesson_material', '60', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 03:09:08'),
(1077, 20, 'material.page_update', 'lesson_material', '60', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 03:09:22'),
(1078, 20, 'material.page_update', 'lesson_material', '60', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 03:09:38'),
(1079, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 03:14:00'),
(1080, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 03:35:00'),
(1081, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-30 03:54:13'),
(1082, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-31 16:11:21'),
(1083, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-31 16:12:45'),
(1084, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-31 16:12:55'),
(1085, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-31 16:14:05'),
(1086, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-31 16:15:00'),
(1087, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-31 16:15:14'),
(1088, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-31 16:16:12'),
(1089, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-31 16:16:19'),
(1090, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-31 16:17:58'),
(1091, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-31 16:29:23'),
(1092, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-31 16:54:16'),
(1093, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 00:10:09'),
(1094, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 00:10:14'),
(1095, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 00:45:07'),
(1096, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 00:45:35'),
(1097, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 00:45:49'),
(1098, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 22:35:28'),
(1099, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 22:35:40'),
(1100, 20, 'material.page_create', 'lesson_material', '61', '{\"lesson_id\":67}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 22:38:34'),
(1101, 20, 'material.delete', 'lesson_material', '61', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 22:42:35'),
(1102, 20, 'material.page_create', 'lesson_material', '62', '{\"lesson_id\":67}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 22:43:02'),
(1103, 20, 'material.delete', 'lesson_material', '60', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 22:50:12'),
(1104, 20, 'material.delete', 'lesson_material', '62', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 22:50:13'),
(1105, 20, 'material.page_create', 'lesson_material', '63', '{\"lesson_id\":66}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 22:50:33'),
(1106, 20, 'material.page_create', 'lesson_material', '64', '{\"lesson_id\":67}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 22:51:45'),
(1107, 20, 'material.page_create', 'lesson_material', '65', '{\"lesson_id\":68}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 22:52:19'),
(1108, 20, 'material.page_update', 'lesson_material', '65', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 22:54:29'),
(1109, 20, 'material.delete', 'lesson_material', '65', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 22:59:35'),
(1110, 20, 'material.page_create', 'lesson_material', '66', '{\"lesson_id\":68}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 22:59:46'),
(1111, 20, 'material.delete', 'lesson_material', '66', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 23:06:12'),
(1112, 20, 'material.page_create', 'lesson_material', '67', '{\"lesson_id\":68}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 23:06:26'),
(1113, 20, 'material.delete', 'lesson_material', '63', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 23:23:03'),
(1114, 20, 'material.delete', 'lesson_material', '64', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 23:23:05'),
(1115, 20, 'material.delete', 'lesson_material', '67', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 23:23:06'),
(1116, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 23:23:31'),
(1117, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 23:23:42'),
(1118, 20, 'material.page_create', 'lesson_material', '68', '{\"lesson_id\":68}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 23:28:39'),
(1119, 20, 'material.page_update', 'lesson_material', '68', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 23:29:51'),
(1120, 20, 'material.page_update', 'lesson_material', '68', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 23:32:01'),
(1121, 20, 'material.page_update', 'lesson_material', '68', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 23:33:44'),
(1122, 20, 'material.page_update', 'lesson_material', '68', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 23:34:49'),
(1123, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 23:57:31'),
(1124, 20, 'material.page_create', 'lesson_material', '69', '{\"lesson_id\":66}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 00:43:40'),
(1125, 20, 'material.page_create', 'lesson_material', '70', '{\"lesson_id\":67}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 00:44:34'),
(1126, 20, 'material.delete', 'lesson_material', '68', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 00:45:31'),
(1127, 20, 'material.page_create', 'lesson_material', '71', '{\"lesson_id\":68}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 00:45:41'),
(1128, 20, 'material.page_update', 'lesson_material', '71', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 00:47:10'),
(1129, 20, 'material.page_update', 'lesson_material', '71', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 00:48:32'),
(1130, 20, 'material.page_update', 'lesson_material', '71', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 00:58:15'),
(1131, 20, 'material.page_update', 'lesson_material', '71', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 00:59:09'),
(1132, 20, 'material.page_update', 'lesson_material', '71', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 01:06:12'),
(1133, 20, 'material.page_update', 'lesson_material', '71', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 01:14:16'),
(1134, 20, 'material.reorder', 'lesson_material', NULL, '{\"lesson_id\":\"68\",\"order\":[\"71\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 01:34:19'),
(1135, 20, 'material.page_update', 'lesson_material', '71', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 01:34:30'),
(1136, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 01:39:57'),
(1137, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 01:40:09'),
(1138, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 01:49:34'),
(1139, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 01:49:50'),
(1140, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-02 02:02:31'),
(1141, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 02:03:55'),
(1142, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 02:04:09'),
(1143, 20, 'material.page_create', 'lesson_material', '72', '{\"lesson_id\":69}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 02:05:56'),
(1144, 20, 'material.page_update', 'lesson_material', '71', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 02:23:12'),
(1145, 20, 'material.page_create', 'lesson_material', '73', '{\"lesson_id\":70}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 02:24:57'),
(1146, 20, 'material.page_create', 'lesson_material', '74', '{\"lesson_id\":71}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 02:25:54'),
(1147, 20, 'material.page_update', 'lesson_material', '72', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 02:38:26'),
(1148, 20, 'material.page_update', 'lesson_material', '73', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 02:38:42'),
(1149, 20, 'material.page_update', 'lesson_material', '73', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 02:39:48'),
(1150, 20, 'material.page_update', 'lesson_material', '74', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 02:40:02'),
(1151, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 03:16:32'),
(1152, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 03:47:21'),
(1153, 20, 'material.page_update', 'lesson_material', '73', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 03:48:08'),
(1154, 20, 'material.page_update', 'lesson_material', '74', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 03:54:20'),
(1155, 20, 'material.page_update', 'lesson_material', '74', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 03:57:12'),
(1156, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 22:44:11'),
(1157, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 22:50:32'),
(1158, 20, 'material.page_create', 'lesson_material', '75', '{\"lesson_id\":72}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 23:22:31'),
(1159, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 23:48:32'),
(1160, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 01:15:04'),
(1161, 20, 'material.delete', 'lesson_material', '75', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 01:15:35'),
(1162, 20, 'material.page_create', 'lesson_material', '76', '{\"lesson_id\":72}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 01:15:55'),
(1163, 20, 'material.page_create', 'lesson_material', '77', '{\"lesson_id\":73}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 01:16:14'),
(1164, 20, 'material.page_update', 'lesson_material', '76', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 01:18:30'),
(1165, 20, 'material.page_update', 'lesson_material', '77', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 01:21:02'),
(1166, 20, 'material.delete', 'lesson_material', '76', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 01:31:44'),
(1167, 20, 'material.page_create', 'lesson_material', '78', '{\"lesson_id\":72}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 01:31:55'),
(1168, 20, 'material.delete', 'lesson_material', '77', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 01:32:27'),
(1169, 20, 'material.page_create', 'lesson_material', '79', '{\"lesson_id\":73}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 01:32:43'),
(1170, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 01:45:33'),
(1171, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 01:45:51'),
(1172, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-03 01:59:36'),
(1173, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-03 02:47:32'),
(1174, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 18:22:16'),
(1175, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-03 21:40:28'),
(1176, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 21:40:28'),
(1177, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-03 22:49:31'),
(1178, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 01:47:23'),
(1179, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 01:52:52'),
(1180, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 01:58:00'),
(1181, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 02:00:37'),
(1182, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 02:10:42'),
(1183, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 21:32:19'),
(1184, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 21:34:14'),
(1185, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 21:34:20'),
(1186, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 21:35:17'),
(1187, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 21:35:31'),
(1188, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 21:47:41'),
(1189, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 21:48:08'),
(1190, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-04 21:49:43'),
(1191, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 21:50:47'),
(1192, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 21:50:57'),
(1193, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-04 22:36:37'),
(1194, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 23:15:31'),
(1195, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 23:25:27'),
(1196, 20, 'activity.delete', 'lesson_activity', '251', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 23:43:18'),
(1197, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-04 23:59:50'),
(1198, 20, 'activity.delete', 'lesson_activity', '254', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 01:43:21'),
(1199, 20, 'activity.delete', 'lesson_activity', '256', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 01:50:14'),
(1200, 20, 'activity.delete', 'lesson_activity', '257', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 01:59:18'),
(1201, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-06 02:03:13'),
(1202, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 02:13:09'),
(1203, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 02:19:48'),
(1204, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 02:19:56'),
(1205, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-06 02:30:33'),
(1206, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 16:18:07'),
(1207, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 18:28:31'),
(1208, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 19:25:53'),
(1209, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 19:26:22'),
(1210, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 19:26:32'),
(1211, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 21:02:49'),
(1212, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 21:04:34'),
(1213, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 21:57:20');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip`, `user_agent`, `created_at`) VALUES
(1214, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 22:20:07'),
(1215, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 23:37:32'),
(1216, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 23:38:08'),
(1217, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-06 23:43:01'),
(1218, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 03:02:02'),
(1219, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 03:02:02'),
(1220, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 03:02:29'),
(1221, 20, 'activity.delete', 'lesson_activity', '266', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 03:04:35'),
(1222, 20, 'activity.delete', 'lesson_activity', '267', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 03:09:16'),
(1223, 20, 'activity.delete', 'lesson_activity', '268', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 03:21:34'),
(1224, 20, 'activity.delete', 'lesson_activity', '269', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 03:42:57'),
(1225, 20, 'activity.delete', 'lesson_activity', '270', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 03:44:22'),
(1226, 20, 'activity.delete', 'lesson_activity', '271', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 04:00:11'),
(1227, 20, 'activity.delete', 'lesson_activity', '272', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 04:03:34'),
(1228, 20, 'activity.delete', 'lesson_activity', '273', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 04:09:28'),
(1229, 20, 'activity.delete', 'lesson_activity', '274', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 04:44:11'),
(1230, 20, 'activity.delete', 'lesson_activity', '276', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 04:52:06'),
(1231, 20, 'activity.delete', 'lesson_activity', '275', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 04:52:09'),
(1232, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 07:16:23'),
(1233, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 07:19:10'),
(1234, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 09:13:24'),
(1235, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 09:13:59'),
(1236, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 12:08:36'),
(1237, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 12:08:36'),
(1238, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 12:09:45'),
(1239, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:08:02'),
(1240, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:08:02'),
(1241, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:08:02'),
(1242, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:08:02'),
(1243, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:08:02'),
(1244, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:08:02'),
(1245, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:08:02'),
(1246, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:08:02'),
(1247, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:08:02'),
(1248, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:08:03'),
(1249, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:08:03'),
(1250, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:08:03'),
(1251, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:08:03'),
(1252, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:20:59'),
(1253, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:20:59'),
(1254, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:20:59'),
(1255, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:20:59'),
(1256, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:20:59'),
(1257, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:20:59'),
(1258, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:20:59'),
(1259, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:21:00'),
(1260, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:21:00'),
(1261, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:21:00'),
(1262, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:21:00'),
(1263, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:21:00'),
(1264, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:21:00'),
(1265, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:21:12'),
(1266, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:21:12'),
(1267, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:21:12'),
(1268, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:21:12'),
(1269, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:21:12'),
(1270, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:21:12'),
(1271, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:21:12'),
(1272, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:21:13'),
(1273, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:21:13'),
(1274, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:21:13'),
(1275, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:21:13'),
(1276, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:21:13'),
(1277, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 13:21:13'),
(1278, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 14:36:19'),
(1279, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 15:07:11'),
(1280, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 15:07:22'),
(1281, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 15:40:15'),
(1282, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 15:40:32'),
(1283, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 16:29:42'),
(1284, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 17:00:33'),
(1285, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 17:00:43'),
(1286, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 17:44:16'),
(1287, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 18:53:19'),
(1288, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 23:18:33'),
(1289, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 23:19:55'),
(1290, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 00:03:19'),
(1291, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 00:30:36'),
(1292, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 00:33:56'),
(1293, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 00:34:23'),
(1294, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 00:34:23'),
(1295, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 00:34:23'),
(1296, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 00:34:23'),
(1297, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 00:34:23'),
(1298, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 00:34:23'),
(1299, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 00:34:23'),
(1300, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 00:34:23'),
(1301, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 00:34:23'),
(1302, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 00:34:23'),
(1303, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 00:34:23'),
(1304, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 00:34:23'),
(1305, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 00:34:23'),
(1306, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 00:34:56'),
(1307, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 02:55:02'),
(1308, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 02:55:10'),
(1309, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 02:55:44'),
(1310, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 02:56:00'),
(1311, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 02:56:00'),
(1312, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 02:56:00'),
(1313, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 02:56:00'),
(1314, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 02:56:00'),
(1315, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 02:56:00'),
(1316, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 02:56:00'),
(1317, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 02:56:00'),
(1318, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 02:56:00'),
(1319, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 02:56:00'),
(1320, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 02:56:00'),
(1321, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 02:56:00'),
(1322, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 07:34:52'),
(1323, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 07:35:01'),
(1324, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 07:37:30'),
(1325, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 09:06:04'),
(1326, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 09:06:18'),
(1327, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 09:06:31'),
(1328, 20, 'activity.delete', 'lesson_activity', '277', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 10:05:46'),
(1329, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-08 10:32:18'),
(1330, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 10:33:18'),
(1331, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 05:47:11'),
(1332, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 05:50:21'),
(1333, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 07:30:36'),
(1334, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 07:42:52'),
(1335, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 08:08:18'),
(1336, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 08:08:28'),
(1337, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 08:08:50'),
(1338, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 08:08:50'),
(1339, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 08:08:50'),
(1340, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 08:08:51'),
(1341, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 08:17:07'),
(1342, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 08:17:20'),
(1343, 20, 'material.page_update', 'lesson_material', '69', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 08:30:37'),
(1344, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:03:00'),
(1345, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:03:50'),
(1346, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:04:12'),
(1347, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:13:16'),
(1348, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:13:32'),
(1349, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:23:37'),
(1350, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:23:37'),
(1351, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:23:37'),
(1352, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:23:37'),
(1353, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:23:37'),
(1354, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:23:37'),
(1355, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:23:37'),
(1356, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:23:37'),
(1357, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:23:37'),
(1358, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:23:37'),
(1359, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:23:37'),
(1360, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:23:37'),
(1361, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:23:37'),
(1362, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:26:18'),
(1363, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:26:18'),
(1364, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:26:18'),
(1365, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:26:18'),
(1366, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:26:18'),
(1367, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:26:18'),
(1368, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:26:18'),
(1369, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:26:18'),
(1370, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:26:18'),
(1371, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:26:18'),
(1372, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:26:18'),
(1373, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:26:18'),
(1374, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:26:18'),
(1375, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:33:31'),
(1376, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:33:31'),
(1377, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:33:31'),
(1378, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:33:31'),
(1379, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:33:31'),
(1380, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:33:31'),
(1381, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:33:31'),
(1382, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:33:31'),
(1383, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:33:31'),
(1384, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:33:31'),
(1385, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:33:31'),
(1386, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:33:31'),
(1387, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:33:32'),
(1388, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:33:51'),
(1389, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:33:55'),
(1390, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:34:05'),
(1391, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:34:16'),
(1392, 22, 'user.archive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:34:36'),
(1393, 22, 'user.unarchive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:34:45'),
(1394, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:34:57'),
(1395, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:34:57'),
(1396, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:34:57'),
(1397, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:34:57'),
(1398, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:34:57'),
(1399, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:34:57'),
(1400, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:34:57'),
(1401, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:34:57'),
(1402, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:34:58'),
(1403, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:34:58'),
(1404, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:34:58'),
(1405, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:34:58'),
(1406, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:34:58'),
(1407, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:21'),
(1408, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:21'),
(1409, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:21'),
(1410, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:21');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip`, `user_agent`, `created_at`) VALUES
(1411, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:21'),
(1412, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:21'),
(1413, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:21'),
(1414, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:21'),
(1415, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:21'),
(1416, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:21'),
(1417, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:21'),
(1418, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:21'),
(1419, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:21'),
(1420, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:34'),
(1421, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:34'),
(1422, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:34'),
(1423, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:34'),
(1424, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:34'),
(1425, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:34'),
(1426, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:34'),
(1427, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:34'),
(1428, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:34'),
(1429, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:34'),
(1430, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:34'),
(1431, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:34'),
(1432, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:35'),
(1433, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:51'),
(1434, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:51'),
(1435, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:51'),
(1436, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:51'),
(1437, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:51'),
(1438, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:51'),
(1439, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:51'),
(1440, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:51'),
(1441, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:51'),
(1442, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:51'),
(1443, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:51'),
(1444, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:51'),
(1445, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:37:52'),
(1446, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:38:02'),
(1447, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:38:02'),
(1448, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:38:02'),
(1449, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:38:02'),
(1450, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:38:02'),
(1451, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:38:03'),
(1452, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:38:03'),
(1453, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:38:03'),
(1454, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:38:03'),
(1455, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:38:03'),
(1456, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:38:03'),
(1457, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:38:03'),
(1458, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:38:03'),
(1459, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:42:50'),
(1460, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:42:50'),
(1461, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:42:50'),
(1462, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:42:50'),
(1463, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:42:50'),
(1464, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:42:50'),
(1465, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:42:50'),
(1466, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:42:50'),
(1467, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:42:50'),
(1468, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:42:50'),
(1469, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:42:50'),
(1470, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:42:50'),
(1471, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:42:51'),
(1472, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:05'),
(1473, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:05'),
(1474, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:05'),
(1475, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:05'),
(1476, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:05'),
(1477, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:05'),
(1478, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:06'),
(1479, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:06'),
(1480, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:06'),
(1481, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:06'),
(1482, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:06'),
(1483, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:06'),
(1484, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:06'),
(1485, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:54'),
(1486, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:54'),
(1487, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:54'),
(1488, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:55'),
(1489, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:55'),
(1490, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:55'),
(1491, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:55'),
(1492, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:55'),
(1493, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:55'),
(1494, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:55'),
(1495, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:55'),
(1496, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:55'),
(1497, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:43:55'),
(1498, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:44:01'),
(1499, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:44:21'),
(1500, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:50:00'),
(1501, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:50:14'),
(1502, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:50:22'),
(1503, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 10:02:42'),
(1504, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 10:03:13'),
(1505, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 10:03:48'),
(1506, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 11:01:50'),
(1507, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 11:01:54'),
(1508, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 11:02:10'),
(1509, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 14:05:20'),
(1510, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 01:23:38'),
(1511, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 01:25:42'),
(1512, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:35:31'),
(1513, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:35:31'),
(1514, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:35:31'),
(1515, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:35:31'),
(1516, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:35:32'),
(1517, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:35:32'),
(1518, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:35:32'),
(1519, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:35:32'),
(1520, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:35:32'),
(1521, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:35:32'),
(1522, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:35:32'),
(1523, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:35:32'),
(1524, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:37:37'),
(1525, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:37:37'),
(1526, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:37:37'),
(1527, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:37:37'),
(1528, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:37:37'),
(1529, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:37:37'),
(1530, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:37:37'),
(1531, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:37:37'),
(1532, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:37:37'),
(1533, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:37:37'),
(1534, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:37:37'),
(1535, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:37:37'),
(1536, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:37:37'),
(1537, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 03:02:57'),
(1538, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 03:03:06'),
(1539, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 03:28:34'),
(1540, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 07:49:16'),
(1541, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 07:53:19'),
(1542, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 07:56:33'),
(1543, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 07:56:55'),
(1544, 85, 'auth.login_success', 'user', '85', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:09:25'),
(1545, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:10:43'),
(1546, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:11:58'),
(1547, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:12:05'),
(1548, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:12:05'),
(1549, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:12:05'),
(1550, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:12:05'),
(1551, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:12:06'),
(1552, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:12:06'),
(1553, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:12:06'),
(1554, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:12:06'),
(1555, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:12:06'),
(1556, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:12:06'),
(1557, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:12:06'),
(1558, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:12:06'),
(1559, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:12:06'),
(1560, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:17:48'),
(1561, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:17:48'),
(1562, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:17:48'),
(1563, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:17:48'),
(1564, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:17:48'),
(1565, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:17:48'),
(1566, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:17:48'),
(1567, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:17:48'),
(1568, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:17:49'),
(1569, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:17:49'),
(1570, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:17:49'),
(1571, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:17:49'),
(1572, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:17:49'),
(1573, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:18:11'),
(1574, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:18:11'),
(1575, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:18:11'),
(1576, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:18:11'),
(1577, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:18:11'),
(1578, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:18:11'),
(1579, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:18:11'),
(1580, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:18:11'),
(1581, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:18:11'),
(1582, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:18:11'),
(1583, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:18:11'),
(1584, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:18:12'),
(1585, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:18:12'),
(1586, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:26:22'),
(1587, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:36:05'),
(1588, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:38:03'),
(1589, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:38:55'),
(1590, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 09:36:06'),
(1591, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 09:41:10');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip`, `user_agent`, `created_at`) VALUES
(1592, 85, 'auth.login_success', 'user', '85', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 09:41:58'),
(1593, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 09:44:38'),
(1594, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 09:44:56'),
(1595, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 09:45:33'),
(1596, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 09:45:57'),
(1597, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 09:46:22'),
(1598, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 09:48:24'),
(1599, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 09:48:51'),
(1600, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 09:49:26'),
(1601, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 09:49:49'),
(1602, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 10:00:03'),
(1603, 85, 'auth.logout', 'user', '85', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 10:24:34'),
(1604, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 10:25:35'),
(1605, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 12:38:04'),
(1606, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 12:59:36'),
(1607, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 12:59:44'),
(1608, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 13:03:54'),
(1609, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 13:03:58'),
(1610, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 13:04:10'),
(1611, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 13:11:55'),
(1612, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 13:12:04'),
(1613, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 13:15:27'),
(1614, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 13:15:39'),
(1615, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 13:17:01'),
(1616, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 13:17:13'),
(1617, 22, 'user.archive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 13:29:46'),
(1618, 22, 'user.unarchive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 13:29:48'),
(1619, 22, 'user.archive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 13:33:20'),
(1620, 22, 'user.unarchive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 13:33:22'),
(1621, 22, 'auth_ids.archive', 'authorized_id', '28', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 13:37:41'),
(1622, 22, 'auth_ids.unarchive', 'authorized_id', '28', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 13:37:45'),
(1623, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 13:42:24'),
(1624, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 13:42:30'),
(1625, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 13:57:22'),
(1626, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 13:57:42'),
(1627, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:07'),
(1628, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:07'),
(1629, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:07'),
(1630, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:07'),
(1631, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:07'),
(1632, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:07'),
(1633, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:07'),
(1634, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:08'),
(1635, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:08'),
(1636, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:08'),
(1637, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:08'),
(1638, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:08'),
(1639, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:20'),
(1640, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:20'),
(1641, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:20'),
(1642, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:20'),
(1643, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:20'),
(1644, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:20'),
(1645, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:20'),
(1646, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:20'),
(1647, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:20'),
(1648, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:20'),
(1649, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:20'),
(1650, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:20'),
(1651, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:20'),
(1652, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:50'),
(1653, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:50'),
(1654, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:50'),
(1655, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:50'),
(1656, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:50'),
(1657, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:50'),
(1658, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:50'),
(1659, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:50'),
(1660, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:50'),
(1661, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:50'),
(1662, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:50'),
(1663, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:50'),
(1664, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:01:50'),
(1665, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:02:05'),
(1666, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:02:23'),
(1667, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:02:43'),
(1668, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:03:52'),
(1669, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:03:59'),
(1670, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:04:07'),
(1671, 85, 'auth.login_success', 'user', '85', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:04:18'),
(1672, 84, 'auth.logout', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:09:00'),
(1673, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:09:10'),
(1674, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:09:53'),
(1675, 85, 'auth.logout', 'user', '85', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:38:34'),
(1676, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:41:01'),
(1677, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 21:45:29'),
(1678, 20, 'material.reorder', 'lesson_material', NULL, '{\"lesson_id\":\"66\",\"order\":[\"69\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 21:45:39'),
(1679, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:25:37'),
(1680, 22, 'user.archive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:25:49'),
(1681, 22, 'auth_ids.unarchive', 'authorized_id', '1', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:25:51'),
(1682, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:26:30'),
(1683, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:26:36'),
(1684, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:27:22'),
(1685, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:27:33'),
(1686, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:28:10'),
(1687, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:28:10'),
(1688, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:28:10'),
(1689, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:28:10'),
(1690, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:28:10'),
(1691, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:28:10'),
(1692, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:28:10'),
(1693, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:28:10'),
(1694, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:28:10'),
(1695, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:28:10'),
(1696, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:29:57'),
(1697, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:33:56'),
(1698, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:33:56'),
(1699, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:33:56'),
(1700, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:33:56'),
(1701, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:33:56'),
(1702, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:33:56'),
(1703, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:33:56'),
(1704, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:33:56'),
(1705, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:33:56'),
(1706, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:33:56'),
(1707, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:33:56'),
(1708, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:33:56'),
(1709, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:33:57'),
(1710, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:37:13'),
(1711, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:37:56'),
(1712, 84, 'auth.login_success', 'user', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:38:02'),
(1713, 22, 'user.unarchive', 'user', 'KLD-22-000123', '{\"payload_keys\":[\"action\",\"id_number\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:38:28'),
(1714, 22, 'user.edit', 'user', '84', '{\"payload_keys\":[\"action\",\"id\",\"firstname\",\"middlename\",\"lastname\",\"id_number\",\"email\",\"role\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:38:35'),
(1715, 22, 'user.send_reset_password', 'user', 'dzescotinia@kld.edu.ph', '{\"admin_initiated\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:38:47'),
(1716, 22, 'user.delete', 'user', '84', '{\"payload_keys\":[\"action\",\"id\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:39:02'),
(1717, 86, 'auth.login_success', 'user', '86', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:40:09'),
(1718, 86, 'auth.logout', 'user', '86', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:41:32'),
(1719, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:41:48'),
(1720, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:58:07'),
(1721, 86, 'auth.login_success', 'user', '86', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:58:21'),
(1722, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:58:38'),
(1723, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 22:59:04'),
(1724, 86, 'auth.logout', 'user', '86', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:07:31'),
(1725, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:07:41'),
(1726, 22, 'user.delete', 'user', '85', '{\"payload_keys\":[\"action\",\"id\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:07:48'),
(1727, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:08:22'),
(1728, 87, 'auth.login_success', 'user', '87', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:08:43'),
(1729, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:09:24'),
(1730, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:12:18'),
(1731, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:12:23'),
(1732, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:12:40'),
(1733, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:19:19'),
(1734, 87, 'auth.logout', 'user', '87', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:26:25'),
(1735, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:26:32'),
(1736, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:26:36'),
(1737, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:26:42'),
(1738, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:26:47'),
(1739, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:29:51'),
(1740, 86, 'auth.logout', 'user', '86', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:30:06'),
(1741, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:30:15'),
(1742, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:30:25'),
(1743, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:30:38'),
(1744, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:31:31'),
(1745, 87, 'auth.login_success', 'user', '87', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:31:41'),
(1746, 86, 'auth.logout', 'user', '86', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:32:27'),
(1747, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:32:36'),
(1748, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:33:36'),
(1749, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:33:36'),
(1750, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:33:36'),
(1751, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:33:36'),
(1752, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:33:36'),
(1753, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:33:36'),
(1754, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:33:36'),
(1755, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:33:36'),
(1756, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:33:36'),
(1757, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:33:36'),
(1758, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:33:36'),
(1759, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:33:36'),
(1760, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:33:36'),
(1761, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:41:27'),
(1762, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 23:41:43'),
(1763, 87, 'auth.logout', 'user', '87', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 01:09:12'),
(1764, 86, 'auth.login_success', 'user', '86', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 01:09:30'),
(1765, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 01:13:25'),
(1766, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 01:13:33'),
(1767, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 01:13:44'),
(1768, 86, 'auth.logout', 'user', '86', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 01:14:16'),
(1769, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 01:14:26'),
(1770, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 01:57:28'),
(1771, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 01:57:36'),
(1772, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 02:13:37'),
(1773, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 02:20:04'),
(1774, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 02:25:31'),
(1775, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 02:37:47'),
(1776, 86, 'auth.logout', 'user', '86', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 02:43:27'),
(1777, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 08:22:15'),
(1778, 86, 'auth.login_success', 'user', '86', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 08:32:03'),
(1779, 86, 'auth.logout', 'user', '86', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 08:35:14'),
(1780, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 08:35:21'),
(1781, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 08:38:17'),
(1782, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 08:58:24'),
(1783, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 09:16:13'),
(1784, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 09:20:34'),
(1785, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 09:20:51'),
(1786, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 09:27:03'),
(1787, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 09:53:30'),
(1788, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 10:28:27'),
(1789, 86, 'auth.logout', 'user', '86', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 10:28:27'),
(1790, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 12:28:24'),
(1791, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 12:29:05'),
(1792, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 12:55:52'),
(1793, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 13:36:21'),
(1794, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 13:36:30'),
(1795, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 22:15:19'),
(1796, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 22:16:43'),
(1797, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 22:16:56'),
(1798, 20, 'material.page_create', 'lesson_material', '80', '{\"lesson_id\":56}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 22:17:30'),
(1799, 20, 'material.page_create', 'lesson_material', '81', '{\"lesson_id\":56}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 22:17:30'),
(1800, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 22:47:26'),
(1801, 86, 'auth.logout', 'user', '86', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 22:50:26'),
(1802, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 23:21:37'),
(1803, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 00:00:54'),
(1804, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 00:01:09');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip`, `user_agent`, `created_at`) VALUES
(1805, 86, 'auth.login_success', 'user', '86', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 00:05:41'),
(1806, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 00:13:02'),
(1807, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 00:35:40'),
(1808, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:07:54'),
(1809, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:08:27'),
(1810, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:08:33'),
(1811, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:11:40'),
(1812, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:11:52'),
(1813, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:12:05'),
(1814, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:12:17'),
(1815, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:15:51'),
(1816, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:15:57'),
(1817, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:17:01'),
(1818, 86, 'auth.logout', 'user', '86', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:32:58'),
(1819, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:33:15'),
(1820, 20, 'material.upload', 'lesson_material', NULL, '{\"lesson_id\":56,\"success\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:33:32'),
(1821, 20, 'material.create', 'lesson_material', '83', '{\"lesson_id\":\"56\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:33:38'),
(1822, 20, 'material.page_create', 'lesson_material', '84', '{\"lesson_id\":56}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:34:17'),
(1823, 20, 'material.page_create', 'lesson_material', '85', '{\"lesson_id\":56}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:34:42'),
(1824, 20, 'material.delete', 'lesson_material', '85', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:34:58'),
(1825, 20, 'material.delete', 'lesson_material', '84', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:34:59'),
(1826, 20, 'material.reorder', 'lesson_material', NULL, '{\"lesson_id\":\"56\",\"order\":[\"80\",\"81\",\"82\",\"83\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:35:02'),
(1827, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:35:48'),
(1828, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:35:57'),
(1829, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:44:37'),
(1830, 22, 'user.delete', 'user', '87', '{\"payload_keys\":[\"action\",\"id\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:44:43'),
(1831, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:45:18'),
(1832, 88, 'auth.login_success', 'user', '88', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:45:26'),
(1833, 88, 'auth.logout', 'user', '88', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:55:06'),
(1834, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:55:28'),
(1835, 22, 'user.delete', 'user', '88', '{\"payload_keys\":[\"action\",\"id\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:55:36'),
(1836, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:55:49'),
(1837, 89, 'auth.login_success', 'user', '89', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:55:58'),
(1838, 89, 'auth.logout', 'user', '89', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 02:02:24'),
(1839, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 02:02:43'),
(1840, 22, 'user.delete', 'user', '89', '{\"payload_keys\":[\"action\",\"id\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 02:02:50'),
(1841, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 02:02:59'),
(1842, 90, 'auth.login_success', 'user', '90', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 02:03:09'),
(1843, 90, 'auth.logout', 'user', '90', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 02:06:15'),
(1844, 86, 'auth.logout', 'user', '86', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 02:07:40'),
(1845, 90, 'auth.login_success', 'user', '90', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 02:07:50'),
(1846, 90, 'auth.logout', 'user', '90', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 02:45:01'),
(1847, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 02:45:10'),
(1848, 22, 'user.delete', 'user', '90', '{\"payload_keys\":[\"action\",\"id\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 02:45:21'),
(1849, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 02:45:47'),
(1850, 91, 'auth.login_success', 'user', '91', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 02:45:57'),
(1851, 91, 'auth.logout', 'user', '91', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 02:53:09'),
(1852, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 02:53:42'),
(1853, 86, 'auth.logout', 'user', '86', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 02:59:02'),
(1854, 91, 'auth.login_success', 'user', '91', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 02:59:10'),
(1855, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 03:22:42'),
(1856, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 03:33:15'),
(1857, 91, 'auth.logout', 'user', '91', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 03:36:28'),
(1858, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 03:36:42'),
(1859, 22, 'user.delete', 'user', '91', '{\"payload_keys\":[\"action\",\"id\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 03:36:56'),
(1860, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 03:37:12'),
(1861, 92, 'auth.login_success', 'user', '92', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 03:37:20'),
(1862, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 03:38:05'),
(1863, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 03:48:50'),
(1864, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:05:48'),
(1865, 92, 'auth.logout', 'user', '92', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:06:20'),
(1866, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:06:50'),
(1867, 22, 'user.delete', 'user', '92', '{\"payload_keys\":[\"action\",\"id\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:06:58'),
(1868, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:07:07'),
(1869, 93, 'auth.login_success', 'user', '93', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:07:15'),
(1870, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:09:01'),
(1871, 21, 'activity.update', 'lesson_activity', '250', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:09:01'),
(1872, 21, 'activity.update', 'lesson_activity', '252', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:09:01'),
(1873, 21, 'activity.update', 'lesson_activity', '249', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:09:01'),
(1874, 21, 'activity.update', 'lesson_activity', '253', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:09:01'),
(1875, 21, 'activity.update', 'lesson_activity', '255', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:09:01'),
(1876, 21, 'activity.update', 'lesson_activity', '258', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:09:02'),
(1877, 21, 'activity.update', 'lesson_activity', '259', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:09:02'),
(1878, 21, 'activity.update', 'lesson_activity', '260', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:09:02'),
(1879, 21, 'activity.update', 'lesson_activity', '262', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:09:02'),
(1880, 21, 'activity.update', 'lesson_activity', '263', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:09:02'),
(1881, 21, 'activity.update', 'lesson_activity', '264', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:09:02'),
(1882, 21, 'activity.update', 'lesson_activity', '265', '{\"keys\":[\"action\",\"id\",\"start_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:09:02'),
(1883, 21, 'activity.update', 'lesson_activity', '248', '{\"keys\":[\"action\",\"id\",\"start_at\",\"due_at\",\"csrf_token\"],\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:09:26'),
(1884, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:16:10'),
(1885, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:33:34'),
(1886, 93, 'auth.logout', 'user', '93', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:34:06'),
(1887, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:34:16'),
(1888, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:35:35'),
(1889, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 04:43:53'),
(1890, 86, 'auth.logout', 'user', '86', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 05:01:26'),
(1891, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 05:14:41'),
(1892, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 05:43:03'),
(1893, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 05:43:13'),
(1894, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 06:10:26'),
(1895, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 06:25:36'),
(1896, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 06:38:41'),
(1897, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:04:26'),
(1898, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:07:26'),
(1899, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:24:42'),
(1900, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:30:43'),
(1901, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:30:50'),
(1902, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:31:00'),
(1903, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:36:07'),
(1904, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:37:22'),
(1905, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:49:44'),
(1906, 93, 'auth.login_success', 'user', '93', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:50:49'),
(1907, 93, 'auth.logout', 'user', '93', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:51:49'),
(1908, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:52:02'),
(1909, 22, 'user.delete', 'user', '86', '{\"payload_keys\":[\"action\",\"id\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:52:14'),
(1910, 22, 'user.delete', 'user', '93', '{\"payload_keys\":[\"action\",\"id\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:52:18'),
(1911, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:52:57'),
(1912, 94, 'auth.login_success', 'user', '94', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:54:52'),
(1913, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:58:34'),
(1914, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:58:56'),
(1915, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:00:18'),
(1916, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:19:18'),
(1917, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:19:28'),
(1918, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:19:54'),
(1919, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:20:14'),
(1920, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:20:59'),
(1921, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:21:05'),
(1922, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:21:15'),
(1923, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:21:26'),
(1924, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:21:44'),
(1925, 95, 'auth.login_success', 'user', '95', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:21:56'),
(1926, 95, 'auth.logout', 'user', '95', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:43:31'),
(1927, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:43:38'),
(1928, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:43:52'),
(1929, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:43:59'),
(1930, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:44:14'),
(1931, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:44:19'),
(1932, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 09:59:35'),
(1933, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:01:46'),
(1934, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:01:54'),
(1935, 20, 'material.page_update', 'lesson_material', '80', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:02:10'),
(1936, 20, 'material.page_create', 'lesson_material', '86', '{\"lesson_id\":56}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:02:37'),
(1937, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:06:16'),
(1938, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:06:56'),
(1939, 95, 'auth.logout', 'user', '95', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:12:08'),
(1940, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:12:21'),
(1941, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:15:29'),
(1942, 22, 'auth.login_success', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:15:39'),
(1943, 22, 'user.delete', 'user', '94', '{\"payload_keys\":[\"action\",\"id\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:16:07'),
(1944, 22, 'user.delete', 'user', '95', '{\"payload_keys\":[\"action\",\"id\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:16:10'),
(1945, 22, 'auth.logout', 'user', '22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:16:17'),
(1946, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:19:58'),
(1947, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:20:15'),
(1948, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:24:20'),
(1949, 20, 'auth.login_success', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:25:03'),
(1950, 97, 'auth.logout', 'user', '97', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:25:27'),
(1951, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:25:37'),
(1952, 21, 'auth.logout', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:29:14'),
(1953, 97, 'auth.login_success', 'user', '97', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:29:21'),
(1954, 20, 'auth.logout', 'user', '20', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:29:36'),
(1955, 21, 'auth.login_success', 'user', '21', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:29:50');

-- --------------------------------------------------------

--
-- Table structure for table `authorized_ids`
--

CREATE TABLE `authorized_ids` (
  `id` int(11) NOT NULL,
  `id_number` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `authorized_ids`
--

INSERT INTO `authorized_ids` (`id`, `id_number`, `status`, `created_at`, `updated_at`) VALUES
(1, 'KLD-22-000123', 'used', '2025-06-06 09:42:01', '2025-11-13 02:18:04'),
(2, 'KLD-22-000124', 'used', '2025-06-06 09:42:01', '2025-06-16 16:49:17'),
(3, 'KLD-22-000125', 'used', '2025-06-06 09:42:01', '2025-06-16 16:52:34'),
(4, 'KLD-22-000126', 'used', '2025-06-06 11:13:38', '2025-09-11 20:01:24'),
(5, 'KLD-22-000128', 'active', '2025-06-17 06:58:27', '2025-09-11 19:33:31'),
(6, 'KLD-22-000129', 'active', '2025-06-17 07:52:28', '2025-08-19 17:28:26'),
(7, 'KLD-22-000130', 'active', '2025-06-17 07:52:28', '2025-08-19 17:28:26'),
(8, 'KLD-22-000131', 'active', '2025-06-17 07:52:28', '2025-08-19 17:28:26'),
(9, 'KLD-22-000132', 'active', '2025-06-17 07:52:28', '2025-06-17 07:52:28'),
(10, 'KLD-22-000133', 'active', '2025-06-17 07:52:28', '2025-06-17 07:52:28'),
(25, 'KLD-22-000134', 'active', '2025-08-20 10:00:00', '2025-09-11 19:41:02'),
(27, 'KLD-22-000135', 'active', '2025-09-05 17:47:21', '2025-09-05 17:47:21'),
(28, 'KLD-22-000136', 'active', '2025-09-05 17:47:21', '2025-11-11 05:37:45'),
(33, 'KLD-22-000137', 'active', '2025-11-13 02:15:06', '2025-11-13 02:15:06'),
(34, 'KLD-22-000138', 'active', '2025-11-13 02:15:06', '2025-11-13 02:15:06');

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `owner_user_id` int(11) NOT NULL,
  `status` enum('active','archived') DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `code`, `name`, `course_id`, `owner_user_id`, `status`, `created_at`, `updated_at`) VALUES
(20, 'CR-T8NB7YC', 'TEST1', 30, 21, 'archived', '2025-10-24 01:26:20', '2025-11-04 21:32:47'),
(21, 'CR-WHB29EB', 'BSIS101', 32, 21, 'active', '2025-10-30 01:54:36', '2025-11-08 03:11:24'),
(22, 'CR-5JF9FJ8', 'BSIS102', 32, 21, 'active', '2025-11-13 04:52:11', '2025-11-13 04:52:11');

-- --------------------------------------------------------

--
-- Table structure for table `class_activity_schedules`
--

CREATE TABLE `class_activity_schedules` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  `start_at` datetime DEFAULT NULL,
  `due_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `class_activity_schedules`
--

INSERT INTO `class_activity_schedules` (`id`, `class_id`, `activity_id`, `start_at`, `due_at`) VALUES
(1, 21, 250, '2025-11-13 10:27:00', '2025-11-20 10:27:00'),
(2, 21, 252, '2025-11-13 10:27:00', '2025-11-20 10:27:00'),
(3, 21, 249, '2025-11-13 10:27:00', '2025-11-20 10:27:00'),
(4, 21, 253, '2025-11-13 10:27:00', '2025-11-20 10:27:00'),
(5, 21, 255, '2025-11-13 10:27:00', '2025-11-20 10:27:00'),
(6, 21, 258, '2025-11-13 10:27:00', '2025-11-20 10:27:00'),
(7, 21, 259, '2025-11-13 10:27:00', '2025-11-20 10:27:00'),
(8, 21, 260, '2025-11-13 10:27:00', '2025-11-20 10:27:00'),
(9, 21, 262, '2025-11-13 10:27:00', '2025-11-20 10:27:00'),
(10, 21, 263, '2025-11-13 10:27:00', '2025-11-20 10:27:00'),
(11, 21, 264, '2025-11-13 10:27:00', '2025-11-20 10:27:00'),
(12, 21, 265, '2025-11-13 10:27:00', '2025-11-20 10:27:00'),
(13, 21, 248, '2025-11-13 07:55:00', '2025-11-13 23:59:00'),
(14, 22, 250, NULL, NULL),
(15, 22, 252, NULL, NULL),
(16, 22, 253, NULL, NULL),
(17, 22, 255, NULL, NULL),
(18, 22, 249, NULL, NULL),
(19, 22, 258, NULL, NULL),
(20, 22, 259, NULL, NULL),
(21, 22, 260, NULL, NULL),
(22, 22, 262, NULL, NULL),
(23, 22, 263, NULL, NULL),
(24, 22, 264, NULL, NULL),
(25, 22, 265, NULL, NULL),
(27, 22, 248, '2025-11-13 10:28:00', '2025-11-14 23:59:00');

-- --------------------------------------------------------

--
-- Table structure for table `class_lessons`
--

CREATE TABLE `class_lessons` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `position` int(11) DEFAULT 1,
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `class_materials`
--

CREATE TABLE `class_materials` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `topic_id` int(11) DEFAULT NULL,
  `lesson_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('pdf','link','code','file','pptx','page') DEFAULT NULL,
  `url` text DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_size` int(11) DEFAULT 0,
  `position` int(11) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `class_modules`
--

CREATE TABLE `class_modules` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `position` int(11) DEFAULT 1,
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `class_outline_overrides`
--

CREATE TABLE `class_outline_overrides` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `overrides` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`overrides`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `class_posts`
--

CREATE TABLE `class_posts` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `class_posts`
--

INSERT INTO `class_posts` (`id`, `class_id`, `user_id`, `content`, `created_at`, `updated_at`) VALUES
(1, 21, 21, 'Hello, BSIS101', '2025-11-12 20:35:25', '2025-11-12 20:35:25');

-- --------------------------------------------------------

--
-- Table structure for table `class_post_comments`
--

CREATE TABLE `class_post_comments` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `class_post_reactions`
--

CREATE TABLE `class_post_reactions` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `reaction_type` enum('like','heart') NOT NULL DEFAULT 'like',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `class_students`
--

CREATE TABLE `class_students` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `student_user_id` int(11) NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `joined_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `class_students`
--

INSERT INTO `class_students` (`id`, `class_id`, `student_user_id`, `status`, `joined_at`) VALUES
(3, 20, 84, 'accepted', '2025-10-27 01:45:51'),
(5, 21, 84, 'accepted', '2025-11-07 09:19:39'),
(6, 21, 85, 'accepted', '2025-11-11 08:09:43'),
(7, 21, 86, 'accepted', '2025-11-11 23:05:18'),
(8, 21, 87, 'accepted', '2025-11-11 23:10:06'),
(9, 21, 88, 'accepted', '2025-11-13 01:45:45'),
(10, 21, 89, 'rejected', '2025-11-13 01:56:19'),
(11, 21, 90, 'rejected', '2025-11-13 02:03:22'),
(12, 21, 91, 'accepted', '2025-11-13 02:46:08'),
(13, 21, 92, 'rejected', '2025-11-13 03:38:28'),
(14, 21, 93, 'accepted', '2025-11-13 04:07:30'),
(15, 21, 95, 'accepted', '2025-11-13 07:54:09'),
(16, 22, 94, 'accepted', '2025-11-13 07:55:08'),
(17, 21, 97, 'accepted', '2025-11-13 10:20:54');

-- --------------------------------------------------------

--
-- Table structure for table `class_topics`
--

CREATE TABLE `class_topics` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `lesson_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `position` int(11) DEFAULT 1,
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `cover_url` varchar(255) DEFAULT NULL,
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `owner_user_id` int(11) DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` datetime DEFAULT current_timestamp(),
  `visibility` enum('assigned','all_teachers') DEFAULT 'assigned',
  `archived` tinyint(1) NOT NULL DEFAULT 0,
  `course_type` enum('lecture','laboratory') DEFAULT 'lecture',
  `language` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `code`, `title`, `description`, `cover_url`, `status`, `owner_user_id`, `published_at`, `updated_at`, `created_at`, `visibility`, `archived`, `course_type`, `language`) VALUES
(30, 'TEST-ALL', 'Test Course - All Types', 'Seeded course for preview tests', NULL, 'draft', NULL, NULL, '2025-11-11 22:28:46', '2025-10-13 23:31:25', 'assigned', 0, 'lecture', NULL),
(32, 'CCIS1102L', 'Computer Programming 1', 'Course Description', NULL, 'published', 20, NULL, '2025-11-01 00:23:14', '2025-10-29 18:07:22', 'assigned', 0, 'lecture', 'C++');

-- --------------------------------------------------------

--
-- Table structure for table `course_lessons`
--

CREATE TABLE `course_lessons` (
  `id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `summary` text DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `position` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_lessons`
--

INSERT INTO `course_lessons` (`id`, `module_id`, `title`, `summary`, `duration_minutes`, `position`) VALUES
(56, 60, 'Lesson 1', NULL, NULL, 1),
(66, 62, 'Program Development Life Cycle', NULL, NULL, 1),
(67, 62, 'Algorithm and Pseudocode', NULL, NULL, 2),
(68, 62, 'Flowchart', NULL, NULL, 3),
(69, 63, 'Computer Fundamentals and Hardware', NULL, NULL, 1),
(70, 63, 'Software and Programming Languages', NULL, NULL, 2),
(71, 63, 'Syntax, Semantics, and Program Translation', NULL, NULL, 3),
(72, 64, 'Selection Control Structures', NULL, NULL, 1),
(73, 64, 'Repetition Control Structures', NULL, NULL, 2);

-- --------------------------------------------------------

--
-- Table structure for table `course_modules`
--

CREATE TABLE `course_modules` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `position` int(11) NOT NULL DEFAULT 1,
  `description` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_modules`
--

INSERT INTO `course_modules` (`id`, `course_id`, `title`, `position`, `description`) VALUES
(60, 30, 'Module 1', 1, NULL),
(62, 32, 'Program Design and Development', 1, ''),
(63, 32, 'Computer Fundamentals and Programming Basics', 2, ''),
(64, 32, 'C++ Programming Structures', 3, '');

-- --------------------------------------------------------

--
-- Table structure for table `course_teachers`
--

CREATE TABLE `course_teachers` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exercises`
--

CREATE TABLE `exercises` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `module_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `exercise_type` enum('lecture','laboratory','both') DEFAULT 'both',
  `content_type` enum('quiz','coding','assignment','presentation','discussion') DEFAULT 'quiz',
  `instructions` mediumtext DEFAULT NULL,
  `max_score` int(11) DEFAULT 100,
  `time_limit_minutes` int(11) DEFAULT NULL,
  `position` int(11) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exercise_questions`
--

CREATE TABLE `exercise_questions` (
  `id` int(11) NOT NULL,
  `exercise_id` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('multiple_choice','true_false','short_answer','essay') DEFAULT 'multiple_choice',
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `correct_answer` text DEFAULT NULL,
  `points` int(11) DEFAULT 1,
  `position` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exercise_test_cases`
--

CREATE TABLE `exercise_test_cases` (
  `id` int(11) NOT NULL,
  `exercise_id` int(11) NOT NULL,
  `input_data` text DEFAULT NULL,
  `expected_output` text DEFAULT NULL,
  `is_sample` tinyint(1) DEFAULT 0,
  `points` int(11) DEFAULT 1,
  `position` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lesson_activities`
--

CREATE TABLE `lesson_activities` (
  `id` int(11) NOT NULL,
  `lesson_id` int(11) NOT NULL,
  `type` enum('lecture','laboratory','quiz','assignment','coding','multiple_choice','true_false','matching','identification','upload_based','essay') DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `instructions` mediumtext DEFAULT NULL,
  `start_at` datetime DEFAULT NULL,
  `due_at` datetime DEFAULT NULL,
  `max_score` int(11) DEFAULT 100,
  `required_construct` varchar(32) DEFAULT NULL,
  `position` int(11) NOT NULL DEFAULT 1,
  `estimated_time` int(11) DEFAULT NULL,
  `learning_objectives` text DEFAULT NULL,
  `prerequisites` text DEFAULT NULL,
  `solution_code` longtext DEFAULT NULL,
  `submission_limit` int(11) DEFAULT 5,
  `visibility_status` enum('draft','published','archived') DEFAULT 'draft',
  `tags` varchar(500) DEFAULT NULL,
  `memory_limit` int(11) DEFAULT 128,
  `cpu_time_limit` int(11) DEFAULT 5
) ;

--
-- Dumping data for table `lesson_activities`
--

INSERT INTO `lesson_activities` (`id`, `lesson_id`, `type`, `title`, `instructions`, `start_at`, `due_at`, `max_score`, `required_construct`, `position`, `estimated_time`, `learning_objectives`, `prerequisites`, `solution_code`, `submission_limit`, `visibility_status`, `tags`, `memory_limit`, `cpu_time_limit`) VALUES
(221, 56, 'multiple_choice', 'TEST1', '{\"kind\":\"multiple_choice\",\"instructions\":\"TEST1\"}', NULL, NULL, 2, NULL, 1, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(223, 56, 'identification', 'TEST2', '{\"kind\":\"identification\",\"instructions\":\"TEST2\"}', NULL, NULL, 100, NULL, 2, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(229, 56, 'quiz', 'TEST3', '{\"kind\":\"true_false\",\"instructions\":\"TEST3\"}', NULL, NULL, 2, NULL, 3, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(237, 56, 'essay', 'TEST4', '{\"kind\":\"essay\",\"instructions\":\"TEST4\"}', NULL, NULL, 2, NULL, 4, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(238, 56, 'upload_based', 'TEST5', '{\"kind\":\"upload_based\",\"instructions\":\"TEST5\",\"acceptedFiles\":[\"PDF\",\"DOCX\",\"JPG\",\"PNG\",\"TXT\",\"XML\",\"SVG\"],\"maxFileSize\":5}', NULL, NULL, 1, NULL, 5, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(240, 56, 'coding', 'TEST6', '{\"language\":\"cpp\",\"instructions\":\"TEST6\",\"problemStatement\":\"TEST6\",\"starterCode\":\"#include <iostream>\\nusing namespace std;\\nint main(){\\n  cout << \\\"Hello, World!\\\" << endl;\\n  return 0;\\n}\\n\",\"difficulty\":\"beginner\",\"expectedOutput\":\"TEST6\",\"additionalRequirements\":\"TEST6\",\"hints\":\"TEST6\",\"timeLimit\":60}', NULL, NULL, 100, NULL, 6, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(245, 56, 'coding', 'WHILE LOOP', '{\"language\":\"cpp\",\"instructions\":\"“Print numbers 1..5 using a while loop.”\",\"problemStatement\":\"“Print numbers 1..5 using a while loop.”\",\"starterCode\":\"\",\"difficulty\":\"beginner\",\"expectedOutput\":\"\",\"additionalRequirements\":\"\",\"hints\":\"\",\"timeLimit\":60}', NULL, NULL, 5, NULL, 7, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(247, 56, 'coding', 'TORF', '{\"language\":\"cpp\",\"instructions\":\"WHIILE LOOPER\",\"problemStatement\":\"WHIILE LOOPER\",\"starterCode\":\"\",\"difficulty\":\"beginner\",\"expectedOutput\":\"\",\"additionalRequirements\":\"\",\"hints\":\"\",\"timeLimit\":60}', NULL, NULL, 5, NULL, 8, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(248, 66, 'multiple_choice', 'PDLC Knowledge Check', '{\"kind\":\"multiple_choice\",\"instructions\":\"Answer all items based on the Program Development Life Cycle (PDLC). Choose the best answer.\"}', '2025-11-13 04:09:00', '2025-11-13 04:15:00', 10, NULL, 1, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(249, 68, 'upload_based', 'Rectangle Area: Flowchart', '{\"kind\":\"upload_based\",\"instructions\":\"Draw a flowchart that reads Width (W) and Length (L), computes A = L × W, and outputs A. Upload your flowchart.\",\"acceptedFiles\":[\"PDF\",\"DOCX\",\"JPG\",\"PNG\",\"TXT\",\"XML\",\"SVG\"],\"maxFileSize\":5}', NULL, NULL, 20, NULL, 1, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(250, 67, 'upload_based', 'Odd or Even: Algorithm and Pseudocode', '{\"kind\":\"upload_based\",\"instructions\":\"Submit a single file/photo containing BOTH (1) the algorithm steps and (2) the pseudocode to determine if a number is ODD or EVEN. Show clear Input, Process, and Output.\",\"acceptedFiles\":[\"PDF\",\"DOCX\",\"JPG\",\"PNG\",\"TXT\",\"XML\",\"SVG\"],\"maxFileSize\":5}', NULL, NULL, 20, NULL, 1, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(252, 67, 'upload_based', 'Feet to Centimeters: Algorithm and Pseudocode', '{\"kind\":\"upload_based\",\"instructions\":\"Submit a file/photo with algorithm + pseudocode that reads LFT, computes LCM = LFT × 30, and prints LCM.\",\"acceptedFiles\":[\"PDF\",\"DOCX\",\"JPG\",\"PNG\",\"TXT\",\"XML\",\"SVG\"],\"maxFileSize\":5}', NULL, NULL, 20, NULL, 2, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(253, 69, 'identification', 'Hardware Basics', '{\"kind\":\"identification\",\"instructions\":\"Provide the exact term. Answer it in CAPITAL LETTER.\"}', NULL, NULL, 10, NULL, 1, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(255, 69, 'quiz', 'Hardware Concepts', '{\"kind\":\"true_false\",\"instructions\":\"Mark if the statement is true or false.\"}', NULL, NULL, 10, NULL, 2, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(258, 70, 'quiz', 'Software & Languages', '{\"kind\":\"true_false\",\"instructions\":\"Mark each statement as True or False based on software and programming language concepts.\"}', NULL, NULL, 10, NULL, 1, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(259, 71, 'identification', 'Syntax & Translation', '{\"kind\":\"identification\",\"instructions\":\"Provide the exact term for each definition.\"}', NULL, NULL, 10, NULL, 1, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(260, 71, 'essay', 'Translation Pipeline Explanation', '{\"kind\":\"essay\",\"instructions\":\"Write a 3–4 paragraph explanation of the program translation pipeline. Include all major stages and explain what happens in each stage, as well as the types of errors detected at each phase.\"}', NULL, NULL, 20, NULL, 2, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(261, 56, 'coding', 'Sum of Two Numbers', '{\"language\":\"cpp\",\"instructions\":\"Read two integers A and B from standard input. Inputs may be separated by space or newline.\",\"problemStatement\":\"Read two integers A and B from standard input. Inputs may be separated by space or newline.\",\"starterCode\":\"#include <iostream>\\r\\nusing namespace std;\\r\\n\\r\\nint main() {\\r\\n    int A, B;\\r\\n    \\r\\n    // Input: maaaring space o newline ang pagitan\\r\\n    cin >> A >> B;\\r\\n\\r\\n    // Output: ipakita ang sum\\r\\n    cout << A + B << endl;\\r\\n\\r\\n    return 0;\\r\\n}\\r\\n\",\"expectedOutput\":\"The program should print only the numeric sum. No labels, no trailing spaces. A single newline at end is acceptable.\",\"additionalRequirements\":\"\",\"hints\":\"\",\"requiredConstruct\":\"if_else\"}', NULL, NULL, 50, 'if_else', 9, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(262, 72, 'coding', 'Sum or Invalid', '{\"language\":\"cpp\",\"instructions\":\"Read two integers A and B from standard input. If both A and B are greater than or equal to 0, output their sum. Otherwise, print the exact word \\\"Invalid\\\".\\n\\nInput Format:\\nTwo integers A and B, separated by a space or newline.\\n\\nOutput Format:\\nA single line containing either the integer sum (if both are non-negative) or the word \\\"Invalid\\\" (if either is negative).\\n\\nConstraints:\\n-10^9 ≤ A, B ≤ 10^9\\n\\nExample:\\nInput: 2 3\\nOutput: 5\\n\\nInput: 2 -3\\nOutput: Invalid\",\"problemStatement\":\"Read two integers A and B from standard input. If both A and B are greater than or equal to 0, output their sum. Otherwise, print the exact word \\\"Invalid\\\".\\n\\nInput Format:\\nTwo integers A and B, separated by a space or newline.\\n\\nOutput Format:\\nA single line containing either the integer sum (if both are non-negative) or the word \\\"Invalid\\\" (if either is negative).\\n\\nConstraints:\\n-10^9 ≤ A, B ≤ 10^9\\n\\nExample:\\nInput: 2 3\\nOutput: 5\\n\\nInput: 2 -3\\nOutput: Invalid\",\"starterCode\":\"#include <iostream>\\r\\nusing namespace std;\\r\\n\\r\\nint main(){\\r\\n  cout << \\\"Hello, World!\\\" << endl;\\r\\n  return 0;\\r\\n}\",\"expectedOutput\":\"\",\"additionalRequirements\":\"\",\"hints\":\"\",\"requiredConstruct\":\"if_else\"}', NULL, NULL, 50, 'if_else', 1, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(263, 72, 'coding', 'Triangle Type', '{\"language\":\"cpp\",\"instructions\":\"Read three positive integers a, b, and c representing the lengths of the sides of a triangle. Determine and print the triangle type:\\n- \\\"Equilateral\\\" if all three sides are equal\\n- \\\"Isosceles\\\" if exactly two sides are equal\\n- \\\"Scalene\\\" if all three sides are different\\n- \\\"Invalid\\\" if the sides cannot form a valid triangle\\n\\nA triangle is valid if the sum of any two sides is greater than the third side.\\n\\nInput Format:\\nThree integers a, b, c separated by spaces or newlines.\\n\\nOutput Format:\\nA single line containing one of: \\\"Equilateral\\\", \\\"Isosceles\\\", \\\"Scalene\\\", or \\\"Invalid\\\".\\n\\nConstraints:\\n1 ≤ a, b, c ≤ 1000\\n\\nExample:\\nInput: 3 3 3\\nOutput: Equilateral\\n\\nInput: 1 2 3\\nOutput: Invalid\",\"problemStatement\":\"Read three positive integers a, b, and c representing the lengths of the sides of a triangle. Determine and print the triangle type:\\n- \\\"Equilateral\\\" if all three sides are equal\\n- \\\"Isosceles\\\" if exactly two sides are equal\\n- \\\"Scalene\\\" if all three sides are different\\n- \\\"Invalid\\\" if the sides cannot form a valid triangle\\n\\nA triangle is valid if the sum of any two sides is greater than the third side.\\n\\nInput Format:\\nThree integers a, b, c separated by spaces or newlines.\\n\\nOutput Format:\\nA single line containing one of: \\\"Equilateral\\\", \\\"Isosceles\\\", \\\"Scalene\\\", or \\\"Invalid\\\".\\n\\nConstraints:\\n1 ≤ a, b, c ≤ 1000\\n\\nExample:\\nInput: 3 3 3\\nOutput: Equilateral\\n\\nInput: 1 2 3\\nOutput: Invalid\",\"starterCode\":\"#include <iostream>\\r\\nusing namespace std;\\r\\n\\r\\nint main(){\\r\\n  cout << \\\"Hello, World!\\\" << endl;\\r\\n  return 0;\\r\\n}\",\"expectedOutput\":\"\",\"additionalRequirements\":\"\",\"hints\":\"\",\"requiredConstruct\":\"if_else\"}', NULL, NULL, 50, 'if_else', 2, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(264, 73, 'coding', 'Sum 1 to N', '{\"language\":\"cpp\",\"instructions\":\"Read a non-negative integer N. Calculate and print the sum of all integers from 1 to N (inclusive) using a while loop.\\n\\nIf N is 0, the sum is 0.\\n\\nInput Format:\\nA single integer N.\\n\\nOutput Format:\\nA single integer representing the sum 1 + 2 + ... + N.\\n\\nConstraints:\\n0 ≤ N ≤ 1000\\n\\nExample:\\nInput: 5\\nOutput: 15\\n(Explanation: 1 + 2 + 3 + 4 + 5 = 15)\\n\\nInput: 0\\nOutput: 0\",\"problemStatement\":\"Read a non-negative integer N. Calculate and print the sum of all integers from 1 to N (inclusive) using a while loop.\\n\\nIf N is 0, the sum is 0.\\n\\nInput Format:\\nA single integer N.\\n\\nOutput Format:\\nA single integer representing the sum 1 + 2 + ... + N.\\n\\nConstraints:\\n0 ≤ N ≤ 1000\\n\\nExample:\\nInput: 5\\nOutput: 15\\n(Explanation: 1 + 2 + 3 + 4 + 5 = 15)\\n\\nInput: 0\\nOutput: 0\",\"starterCode\":\"#include <iostream>\\r\\nusing namespace std;\\r\\n\\r\\nint main(){\\r\\n  cout << \\\"Hello, World!\\\" << endl;\\r\\n  return 0;\\r\\n}\",\"expectedOutput\":\"\",\"additionalRequirements\":\"\",\"hints\":\"\",\"requiredConstruct\":\"while\"}', NULL, NULL, 50, 'while', 1, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(265, 73, 'coding', 'GCD', '{\"language\":\"cpp\",\"instructions\":\"Read two non-negative integers A and B. Calculate and print their Greatest Common Divisor (GCD) using the iterative Euclidean algorithm with a while loop.\\n\\nThe Euclidean algorithm:\\n- While B is not 0:\\n  - Let R = A % B\\n  - Set A = B\\n  - Set B = R\\n- The GCD is the final value of A\\n\\nIf both A and B are 0, the GCD is 0.\\n\\nInput Format:\\nTwo integers A and B, separated by a space or newline.\\n\\nOutput Format:\\nA single integer representing GCD(A, B).\\n\\nConstraints:\\n0 ≤ A, B ≤ 10^9\\n\\nExample:\\nInput: 48 18\\nOutput: 6\\n\\nInput: 0 5\\nOutput: 5\",\"problemStatement\":\"Read two non-negative integers A and B. Calculate and print their Greatest Common Divisor (GCD) using the iterative Euclidean algorithm with a while loop.\\n\\nThe Euclidean algorithm:\\n- While B is not 0:\\n  - Let R = A % B\\n  - Set A = B\\n  - Set B = R\\n- The GCD is the final value of A\\n\\nIf both A and B are 0, the GCD is 0.\\n\\nInput Format:\\nTwo integers A and B, separated by a space or newline.\\n\\nOutput Format:\\nA single integer representing GCD(A, B).\\n\\nConstraints:\\n0 ≤ A, B ≤ 10^9\\n\\nExample:\\nInput: 48 18\\nOutput: 6\\n\\nInput: 0 5\\nOutput: 5\",\"starterCode\":\"#include <iostream>\\r\\nusing namespace std;\\r\\n\\r\\nint main(){\\r\\n  cout << \\\"Hello, World!\\\" << endl;\\r\\n  return 0;\\r\\n}\",\"expectedOutput\":\"\",\"additionalRequirements\":\"You MUST use a while loop. Do not use recursion. Handle edge cases where one input is 0.\",\"hints\":\"The algorithm continues while B != 0. Use modulo operator (%) to get remainder. Swap values: A becomes B, B becomes remainder.\",\"requiredConstruct\":\"while\"}', NULL, NULL, 50, 'while', 2, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5),
(278, 56, 'coding', 'PYTHON TEST', '{\"language\":\"python\",\"instructions\":\"PYTHON TEST\",\"problemStatement\":\"PYTHON TEST\",\"starterCode\":\"N = int(input(\\\"Enter a number: \\\"))\\r\\n\\r\\nsum = 0\\r\\ni = 1\\r\\n\\r\\nwhile i <= N:\\r\\n    sum += i\\r\\n    i += 1\\r\\n\\r\\nprint(sum)\\r\\n\",\"expectedOutput\":\"\",\"additionalRequirements\":\"QWE\",\"hints\":\"QWE\",\"requiredConstruct\":\"while\"}', NULL, NULL, 10, 'while', 10, NULL, NULL, NULL, NULL, 5, 'draft', NULL, 128, 5);

-- --------------------------------------------------------

--
-- Table structure for table `lesson_materials`
--

CREATE TABLE `lesson_materials` (
  `id` int(11) NOT NULL,
  `lesson_id` int(11) NOT NULL,
  `type` enum('pdf','link','code','file') DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `size_bytes` bigint(20) DEFAULT NULL,
  `status` enum('ok','processing','failed') DEFAULT 'ok',
  `position` int(11) NOT NULL DEFAULT 1,
  `archived` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lesson_materials`
--

INSERT INTO `lesson_materials` (`id`, `lesson_id`, `type`, `url`, `filename`, `size_bytes`, `status`, `position`, `archived`, `created_at`) VALUES
(69, 66, '', 'material_page_view.php?f=20251102_004340_1e075ae3_page.md', 'Program Development Life Cycle', 3251, 'ok', 1, 0, '2025-11-02 00:43:40'),
(70, 67, '', 'material_page_view.php?f=20251102_004434_89aa18b8_page.md', 'Algorithm and Pseudocode', 4025, 'ok', 1, 0, '2025-11-02 00:44:34'),
(71, 68, '', 'material_page_view.php?f=20251102_004541_6287d785_page.md', 'Flowchart', 8293, 'ok', 1, 0, '2025-11-02 00:45:41'),
(72, 69, '', 'material_page_view.php?f=20251102_020556_81e3a5a1_page.md', 'Computer Fundamentals and Hardware', 4295, 'ok', 1, 0, '2025-11-02 02:05:56'),
(73, 70, '', 'material_page_view.php?f=20251102_022457_32f0b6f9_page.md', 'Software and Programming Languages', 3302, 'ok', 1, 0, '2025-11-02 02:24:57'),
(74, 71, '', 'material_page_view.php?f=20251102_022554_f91ceff7_page.md', 'Syntax, Semantics, and Program Translation', 4892, 'ok', 1, 0, '2025-11-02 02:25:54'),
(78, 72, '', 'material_page_view.php?f=20251103_013155_4b5d4694_page.md', 'Selection Control Structures', 15113, 'ok', 1, 0, '2025-11-03 01:31:55'),
(79, 73, '', 'material_page_view.php?f=20251103_013243_8d108a8a_page.md', 'Repetition Control Structures', 21845, 'ok', 1, 0, '2025-11-03 01:32:43'),
(80, 56, '', 'material_page_view.php?f=20251112_221730_2b1fb212_page.md', 'TEST', 3253, 'ok', 1, 0, '2025-11-12 22:17:30'),
(81, 56, '', 'material_page_view.php?f=20251112_221730_482be9ed_page.md', 'TEST', 3253, 'ok', 2, 0, '2025-11-12 22:17:30'),
(82, 56, 'pdf', 'material_download.php?f=20251113_013332_82935dc1_TCW_Module_4.pdf', 'TCW Module 4.pdf', 2874694, 'ok', 3, 0, '2025-11-13 01:33:32'),
(83, 56, 'link', '', NULL, 0, 'ok', 4, 0, '2025-11-13 01:33:38'),
(86, 56, '', 'material_page_view.php?f=20251113_100237_83d8b5fa_page.md', 'TEST123', 3253, 'ok', 5, 0, '2025-11-13 10:02:37');

-- --------------------------------------------------------

--
-- Table structure for table `login_logs`
--

CREATE TABLE `login_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `login_method` varchar(32) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `login_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login_logs`
--

INSERT INTO `login_logs` (`id`, `user_id`, `login_method`, `ip_address`, `user_agent`, `login_time`) VALUES
(1, 54, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-30 19:21:41'),
(2, 55, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-30 19:21:56'),
(3, 54, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-30 19:22:14'),
(4, 54, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-30 19:27:56'),
(5, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-06-30 19:28:44'),
(6, 54, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-30 19:29:17'),
(7, 54, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-30 19:33:58'),
(8, 54, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-30 19:34:43'),
(9, 54, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-30 19:39:32'),
(10, 54, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-30 19:43:17'),
(11, 54, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-30 20:04:04'),
(12, 54, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-30 20:06:30'),
(13, 54, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-30 20:16:30'),
(14, 56, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-07-01 05:46:34'),
(15, 57, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-07-01 05:51:03'),
(16, 58, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-07-01 05:55:47'),
(17, 58, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-07-01 08:57:56'),
(18, 59, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-07-01 09:09:37'),
(19, 59, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-07-01 09:23:14'),
(20, 59, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-07-03 06:50:21'),
(21, 60, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-07-03 06:52:21'),
(22, 61, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-07-03 07:39:26'),
(23, 61, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-07-03 08:08:31'),
(24, 62, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-07-03 08:50:15'),
(25, 68, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-10 13:57:00'),
(26, 68, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-14 04:56:13'),
(27, 69, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-15 19:00:40'),
(28, 70, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-16 06:21:30'),
(29, 70, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-15 07:27:06'),
(30, 75, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 13:54:43'),
(31, 76, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 13:56:41'),
(32, 77, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 10:09:19'),
(33, 78, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-26 07:45:51'),
(34, 80, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-05 10:42:01'),
(35, 81, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-05 17:01:13'),
(36, 81, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-11 17:05:23'),
(37, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-12 18:44:25'),
(38, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-13 20:48:51'),
(39, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-13 21:00:37'),
(40, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-13 21:04:04'),
(41, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-13 21:17:56'),
(42, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-13 21:31:19'),
(43, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 06:23:15'),
(44, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 07:33:05'),
(45, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 13:29:00'),
(46, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 15:56:05'),
(47, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-17 20:16:02'),
(48, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-21 19:26:07'),
(49, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 20:13:27'),
(50, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-27 18:07:04'),
(51, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-27 21:38:01'),
(52, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 16:13:43'),
(53, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 14:44:26'),
(54, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 04:29:28'),
(55, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 05:51:22'),
(56, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-03 07:33:09'),
(57, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-03 07:33:52'),
(58, 82, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 01:11:52'),
(59, 83, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-09 16:41:01'),
(60, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 18:36:21'),
(61, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 15:38:55'),
(62, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 01:00:52'),
(63, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 01:18:01'),
(64, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 01:19:03'),
(65, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 09:43:16'),
(66, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 09:48:53'),
(67, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 09:49:08'),
(68, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 09:52:58'),
(69, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 09:53:30'),
(70, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 10:04:35'),
(71, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 10:04:49'),
(72, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 10:05:05'),
(73, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 10:10:10'),
(74, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 10:12:57'),
(75, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 10:14:53'),
(76, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 10:27:35'),
(77, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 10:47:14'),
(78, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 17:27:59'),
(79, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 17:28:11'),
(80, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 17:28:20'),
(81, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 17:29:39'),
(82, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 16:35:03'),
(83, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 16:52:30'),
(84, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 17:12:42'),
(85, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 17:18:55'),
(86, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 17:20:54'),
(87, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 17:22:32'),
(88, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 17:23:44'),
(89, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 17:33:57'),
(90, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 17:34:14'),
(91, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 17:38:47'),
(92, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 17:44:06'),
(93, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 18:13:03'),
(94, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 04:20:09'),
(95, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 06:22:26'),
(96, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 06:52:15'),
(97, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 07:03:58'),
(98, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 15:17:02'),
(99, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 15:59:49'),
(100, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 16:09:58'),
(101, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-28 14:15:06'),
(102, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-28 14:15:21'),
(103, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-28 15:45:45'),
(104, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-28 17:59:16'),
(105, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 10:05:30'),
(106, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 17:53:51'),
(107, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-31 08:11:29'),
(108, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-31 08:29:53'),
(109, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-31 16:45:22'),
(110, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 14:35:24'),
(111, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 15:30:59'),
(112, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 17:36:23'),
(113, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-02 14:51:03'),
(114, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 10:22:24'),
(115, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-03 10:28:15'),
(116, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 13:40:46'),
(117, 21, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-03 13:43:39'),
(118, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 17:47:33'),
(119, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 17:53:00'),
(120, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 17:58:07'),
(121, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 18:13:34'),
(122, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 11:26:03'),
(123, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 01:14:09'),
(124, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 04:14:17'),
(125, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 01:03:09'),
(126, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 23:57:10'),
(127, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 02:00:13'),
(128, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 04:55:29'),
(129, 84, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 06:10:28'),
(130, 86, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 15:30:02'),
(131, 86, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 15:31:51'),
(132, 86, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 17:15:02'),
(133, 86, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 00:38:29'),
(134, 86, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 04:42:20'),
(135, 86, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 17:13:01'),
(136, 86, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 17:17:17'),
(137, 86, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 18:06:23'),
(138, 86, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 18:53:17'),
(139, 86, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 20:35:52'),
(140, 95, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 23:53:43'),
(141, 97, 'google_oauth', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 02:18:55');

-- --------------------------------------------------------

--
-- Table structure for table `question_choices`
--

CREATE TABLE `question_choices` (
  `id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `choice_text` mediumtext NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `position` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `question_choices`
--

INSERT INTO `question_choices` (`id`, `question_id`, `choice_text`, `is_correct`, `position`) VALUES
(416, 200, 'acceptedFiles:PDF,XML,DOCX,GIF,PPTX,BMP,SVG,JPG,PNG,TXT,ZIP', 1, 1),
(417, 200, 'maxFileSize:5', 1, 2),
(418, 201, 'TEST1', 1, 1),
(419, 201, 'TEST1', 0, 2),
(420, 201, 'TEST1', 0, 3),
(421, 201, 'TEST1', 0, 4),
(422, 202, 'TEST1', 1, 1),
(423, 202, 'TEST1', 1, 2),
(424, 202, 'TEST1', 0, 3),
(425, 202, 'TEST1', 0, 4),
(460, 211, 'True', 1, 1),
(461, 211, 'False', 0, 2),
(462, 212, 'True', 0, 1),
(463, 212, 'False', 1, 2),
(486, 219, 'Design', 0, 1),
(487, 219, 'Implementation', 0, 2),
(488, 219, 'Requirements', 1, 3),
(489, 219, 'Maintenance', 0, 4),
(490, 220, 'Deployed application', 0, 1),
(491, 220, 'System/technical design (architecture, algorithms, data design)', 1, 2),
(492, 220, 'Test execution repor', 0, 3),
(493, 220, 'Budget plan', 0, 4),
(494, 221, 'Implementation', 1, 1),
(495, 221, 'Testing', 0, 2),
(496, 221, 'Deployment', 0, 3),
(497, 221, 'Requirements', 0, 4),
(498, 222, 'Add new features', 0, 1),
(499, 222, 'Validate that the system meets requirements and is defect‑free', 1, 2),
(500, 222, 'Plan budgets', 0, 3),
(501, 222, 'Promote to users', 0, 4),
(502, 223, 'Requirements → Design → Implementation → Testing → Deployment → Maintenance', 1, 1),
(503, 223, 'Design → Requirements → Implementation → Testing → Maintenance → Deployment', 0, 2),
(504, 223, 'Implementation → Requirements → Testing → Design → Deployment → Maintenance', 0, 3),
(505, 223, 'Requirements → Implementation → Design → Testing → Deployment → Maintenance', 0, 4),
(506, 224, 'acceptedFiles:PDF,JPG,PNG,XML', 1, 1),
(507, 224, 'maxFileSize:5', 1, 2),
(516, 229, 'acceptedFiles:PDF,DOCX,JPG,PNG,XML', 1, 1),
(517, 229, 'maxFileSize:10', 1, 2),
(518, 230, 'acceptedFiles:PDF,DOCX,JPG,PNG,XML', 1, 1),
(519, 230, 'maxFileSize:10', 1, 2),
(530, 241, 'True', 0, 1),
(531, 241, 'False', 1, 2),
(532, 242, 'True', 1, 1),
(533, 242, 'False', 0, 2),
(534, 243, 'True', 0, 1),
(535, 243, 'False', 1, 2),
(536, 244, 'True', 1, 1),
(537, 244, 'False', 0, 2),
(538, 245, 'True', 1, 1),
(539, 245, 'False', 0, 2),
(540, 252, 'True', 1, 1),
(541, 252, 'False', 0, 2),
(542, 253, 'True', 0, 1),
(543, 253, 'False', 1, 2),
(544, 254, 'True', 0, 1),
(545, 254, 'False', 1, 2),
(546, 255, 'True', 1, 1),
(547, 255, 'False', 0, 2),
(548, 256, 'True', 0, 1),
(549, 256, 'False', 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `rate_limits`
--

CREATE TABLE `rate_limits` (
  `id` int(11) NOT NULL,
  `identifier` varchar(255) NOT NULL,
  `action` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rate_limits`
--

INSERT INTO `rate_limits` (`id`, `identifier`, `action`, `created_at`) VALUES
(488, '20_::1', 'run_activity', '2025-11-12 15:25:03'),
(489, '20_::1', 'run_activity', '2025-11-12 15:26:44'),
(490, '20_::1', 'run_activity', '2025-11-12 15:27:34'),
(491, '20_::1', 'run_activity', '2025-11-12 15:30:57'),
(492, '20_::1', 'run_activity', '2025-11-12 15:31:53'),
(493, '20_::1', 'run_activity', '2025-11-12 15:31:54'),
(494, '20_::1', 'run_activity', '2025-11-12 15:33:42'),
(495, '20_::1', 'run_activity', '2025-11-12 15:40:02'),
(496, '20_::1', 'run_activity', '2025-11-12 15:48:08'),
(497, '20_::1', 'run_activity', '2025-11-12 15:53:46'),
(498, '20_::1', 'run_activity', '2025-11-12 15:53:53'),
(499, '20_::1', 'run_activity', '2025-11-12 15:54:01'),
(500, '20_::1', 'run_activity', '2025-11-12 15:54:10'),
(501, '20_::1', 'run_activity', '2025-11-12 15:54:57'),
(503, '21_::1', 'run_activity', '2025-11-12 23:43:29'),
(504, '21_::1', 'run_activity', '2025-11-12 23:43:35'),
(505, '21_::1', 'run_activity', '2025-11-12 23:43:42'),
(506, '21_::1', 'run_activity', '2025-11-12 23:43:53'),
(507, '21_::1', 'run_activity', '2025-11-12 23:45:03'),
(508, '21_::1', 'run_activity', '2025-11-12 23:45:45'),
(509, '21_::1', 'run_activity', '2025-11-12 23:45:53'),
(510, '21_::1', 'run_activity', '2025-11-12 23:46:00'),
(511, '21_::1', 'run_activity', '2025-11-12 23:46:26'),
(512, '::1', 'verification_code', '2025-11-12 23:53:15'),
(513, 'dzescotinia@kld.edu.ph', 'verification_email', '2025-11-12 23:53:15'),
(514, '20_::1', 'run_activity', '2025-11-13 02:09:23'),
(515, '20_::1', 'run_activity', '2025-11-13 02:09:33'),
(516, '20_::1', 'run_activity', '2025-11-13 02:09:40'),
(517, '20_::1', 'run_activity', '2025-11-13 02:10:03'),
(518, '::1', 'verification_code', '2025-11-13 02:16:47'),
(519, 'dzescotinia@kld.edu.ph', 'verification_email', '2025-11-13 02:16:47'),
(520, '::1', 'verification_code', '2025-11-13 02:17:55'),
(521, 'dzescotinia@kld.edu.ph', 'verification_email', '2025-11-13 02:17:55'),
(522, '97_::1', 'run_snippet', '2025-11-13 02:19:24');

-- --------------------------------------------------------

--
-- Table structure for table `remember_me_tokens`
--

CREATE TABLE `remember_me_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `middlename` varchar(50) DEFAULT NULL,
  `lastname` varchar(50) NOT NULL,
  `id_number` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'student',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Active',
  `reset_token` varchar(128) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `google_id` varchar(64) DEFAULT NULL,
  `login_method` varchar(32) DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `firstname`, `middlename`, `lastname`, `id_number`, `email`, `profile_photo`, `password`, `role`, `created_at`, `updated_at`, `last_login`, `status`, `reset_token`, `reset_token_expires`, `google_id`, `login_method`, `email_verified`) VALUES
(20, 'Marrion Dave', 'Coso', 'Lorejas', 'KLD-22-000124', 'mdclorejas@kld.edu.ph', NULL, '$2y$10$pPOKj67o9GW50bANUtw0TODF2W6A3wyctn3sPVyEnY2ynWHrtLolO', 'Coordinator', '2025-06-17 00:49:17', '2025-11-13 10:25:03', '2025-11-13 10:25:03', 'Active', NULL, NULL, NULL, NULL, 0),
(21, 'Martin Johns', '', 'Hangad', 'KLD-22-000125', 'mjshangad@kld.edu.ph', 'profile_21_1762980407.jpg', '$2y$10$ErJcnGpHpVZ4d8P0Vyv3neuYLzG15rgQA/frC/reRrscY0hGBIb9a', 'Teacher', '2025-06-17 00:52:34', '2025-11-13 10:29:50', '2025-11-13 10:29:50', 'Active', NULL, NULL, '114988505679724334051', NULL, 0),
(22, 'Ellysar', 'Arroyo', 'Espadera', 'KLD-22-000126', 'eaespadera@kld.edu.ph', NULL, '$2y$10$5SWQ5BPJPRp0W9OcdOICPeaNGLZ8o822EjteJSYSKVdFW3VVtkqy6', 'Admin', '2025-06-19 01:09:36', '2025-11-13 10:15:39', '2025-11-13 10:15:39', 'Active', NULL, NULL, NULL, NULL, 0),
(96, 'Test', 'Student', 'Account', 'KLD-25-999999', 'test.student@kld.edu.ph', NULL, '$2y$12$Z9uloXmB3/nlcHPih2I5kOLaej.3XTodzZtsalAAVVRsug7X9miNm', 'Student', '2025-11-13 10:16:13', '2025-11-13 10:16:13', NULL, 'Active', NULL, NULL, NULL, NULL, 0),
(97, 'Dave', 'Zulueta', 'Escotinia', 'KLD-22-000123', 'dzescotinia@kld.edu.ph', NULL, '$2y$12$5n7P.Jaamq.2n0ZTQHcABeOaA/h9.mYUm3GAbQRvbg3Q6uJfoVckS', 'Student', '2025-11-13 10:18:04', '2025-11-13 10:29:21', '2025-11-13 10:29:21', 'Active', NULL, NULL, '116614124092704758034', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_preferences`
--

CREATE TABLE `user_preferences` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `theme` varchar(20) DEFAULT 'light',
  `refresh_rate` int(11) DEFAULT 10,
  `show_notifications` tinyint(1) DEFAULT 1,
  `email_notifications` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_preferences`
--

INSERT INTO `user_preferences` (`id`, `user_id`, `theme`, `refresh_rate`, `show_notifications`, `email_notifications`, `created_at`, `updated_at`) VALUES
(1, 22, 'light', 10, 1, 1, '2025-08-15 07:51:38', '2025-11-10 01:34:31'),
(16, 20, 'light', 10, 1, 1, '2025-08-26 15:16:10', '2025-10-27 15:59:29'),
(58, 21, 'light', 10, 1, 1, '2025-09-03 20:28:39', '2025-11-12 17:16:55');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_attempts`
--
ALTER TABLE `activity_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_attempts_activity` (`activity_id`),
  ADD KEY `idx_attempts_student` (`student_user_id`);

--
-- Indexes for table `activity_attempt_items`
--
ALTER TABLE `activity_attempt_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_attempt_items_attempt_id` (`attempt_id`);

--
-- Indexes for table `activity_progress`
--
ALTER TABLE `activity_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_activity_user` (`activity_id`,`user_id`),
  ADD KEY `idx_activity_id` (`activity_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_progress_percentage` (`progress_percentage`);

--
-- Indexes for table `activity_questions`
--
ALTER TABLE `activity_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_activity_questions_activity_id` (`activity_id`);

--
-- Indexes for table `activity_test_cases`
--
ALTER TABLE `activity_test_cases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_activity_test_cases_activity_id` (`activity_id`);

--
-- Indexes for table `activity_tracking`
--
ALTER TABLE `activity_tracking`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_user_lesson` (`user_id`,`lesson_id`),
  ADD KEY `idx_lesson_user` (`lesson_id`,`user_id`),
  ADD KEY `idx_lesson_time` (`lesson_id`,`last_activity`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `authorized_ids`
--
ALTER TABLE `authorized_ids`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_number` (`id_number`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `class_activity_schedules`
--
ALTER TABLE `class_activity_schedules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_class_activity` (`class_id`,`activity_id`),
  ADD KEY `idx_activity_id` (`activity_id`);

--
-- Indexes for table `class_lessons`
--
ALTER TABLE `class_lessons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `module_id` (`module_id`);

--
-- Indexes for table `class_materials`
--
ALTER TABLE `class_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `topic_id` (`topic_id`),
  ADD KEY `lesson_id` (`lesson_id`);

--
-- Indexes for table `class_modules`
--
ALTER TABLE `class_modules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `class_outline_overrides`
--
ALTER TABLE `class_outline_overrides`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_class_course` (`class_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `class_posts`
--
ALTER TABLE `class_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_class_id` (`class_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `class_post_comments`
--
ALTER TABLE `class_post_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_post_id` (`post_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `class_post_reactions`
--
ALTER TABLE `class_post_reactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_post_reaction` (`post_id`,`user_id`,`reaction_type`),
  ADD KEY `idx_post_id` (`post_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `class_students`
--
ALTER TABLE `class_students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_class_student` (`class_id`,`student_user_id`);

--
-- Indexes for table `class_topics`
--
ALTER TABLE `class_topics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `lesson_id` (`lesson_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `course_lessons`
--
ALTER TABLE `course_lessons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `module_id` (`module_id`);

--
-- Indexes for table `course_modules`
--
ALTER TABLE `course_modules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `course_teachers`
--
ALTER TABLE `course_teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_course_user` (`course_id`,`user_id`);

--
-- Indexes for table `exercises`
--
ALTER TABLE `exercises`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `module_id` (`module_id`);

--
-- Indexes for table `exercise_questions`
--
ALTER TABLE `exercise_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exercise_id` (`exercise_id`);

--
-- Indexes for table `exercise_test_cases`
--
ALTER TABLE `exercise_test_cases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exercise_id` (`exercise_id`);

--
-- Indexes for table `lesson_activities`
--
ALTER TABLE `lesson_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lesson_activities_lesson_id` (`lesson_id`);

--
-- Indexes for table `lesson_materials`
--
ALTER TABLE `lesson_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lesson_id` (`lesson_id`);

--
-- Indexes for table `login_logs`
--
ALTER TABLE `login_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `question_choices`
--
ALTER TABLE `question_choices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_question_choices_question_id` (`question_id`);

--
-- Indexes for table `rate_limits`
--
ALTER TABLE `rate_limits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_identifier_action` (`identifier`,`action`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `remember_me_tokens`
--
ALTER TABLE `remember_me_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_token` (`token`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_users_profile_photo` (`profile_photo`);

--
-- Indexes for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_preferences` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_attempts`
--
ALTER TABLE `activity_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `activity_attempt_items`
--
ALTER TABLE `activity_attempt_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=269;

--
-- AUTO_INCREMENT for table `activity_progress`
--
ALTER TABLE `activity_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=348;

--
-- AUTO_INCREMENT for table `activity_questions`
--
ALTER TABLE `activity_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=268;

--
-- AUTO_INCREMENT for table `activity_test_cases`
--
ALTER TABLE `activity_test_cases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `activity_tracking`
--
ALTER TABLE `activity_tracking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1956;

--
-- AUTO_INCREMENT for table `authorized_ids`
--
ALTER TABLE `authorized_ids`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `class_activity_schedules`
--
ALTER TABLE `class_activity_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `class_lessons`
--
ALTER TABLE `class_lessons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `class_materials`
--
ALTER TABLE `class_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `class_modules`
--
ALTER TABLE `class_modules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `class_outline_overrides`
--
ALTER TABLE `class_outline_overrides`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `class_posts`
--
ALTER TABLE `class_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `class_post_comments`
--
ALTER TABLE `class_post_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `class_post_reactions`
--
ALTER TABLE `class_post_reactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `class_students`
--
ALTER TABLE `class_students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `class_topics`
--
ALTER TABLE `class_topics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `course_lessons`
--
ALTER TABLE `course_lessons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `course_modules`
--
ALTER TABLE `course_modules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT for table `course_teachers`
--
ALTER TABLE `course_teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `exercises`
--
ALTER TABLE `exercises`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exercise_questions`
--
ALTER TABLE `exercise_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exercise_test_cases`
--
ALTER TABLE `exercise_test_cases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lesson_activities`
--
ALTER TABLE `lesson_activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lesson_materials`
--
ALTER TABLE `lesson_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT for table `login_logs`
--
ALTER TABLE `login_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=142;

--
-- AUTO_INCREMENT for table `question_choices`
--
ALTER TABLE `question_choices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=550;

--
-- AUTO_INCREMENT for table `rate_limits`
--
ALTER TABLE `rate_limits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=524;

--
-- AUTO_INCREMENT for table `remember_me_tokens`
--
ALTER TABLE `remember_me_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- AUTO_INCREMENT for table `user_preferences`
--
ALTER TABLE `user_preferences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=554;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_attempts`
--
ALTER TABLE `activity_attempts`
  ADD CONSTRAINT `activity_attempts_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `lesson_activities` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `activity_attempt_items`
--
ALTER TABLE `activity_attempt_items`
  ADD CONSTRAINT `activity_attempt_items_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `activity_attempts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_attempt_items_attempt` FOREIGN KEY (`attempt_id`) REFERENCES `activity_attempts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `activity_questions`
--
ALTER TABLE `activity_questions`
  ADD CONSTRAINT `activity_questions_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `lesson_activities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_questions_activity` FOREIGN KEY (`activity_id`) REFERENCES `lesson_activities` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `activity_test_cases`
--
ALTER TABLE `activity_test_cases`
  ADD CONSTRAINT `activity_test_cases_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `lesson_activities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_test_cases_activity` FOREIGN KEY (`activity_id`) REFERENCES `lesson_activities` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `class_activity_schedules`
--
ALTER TABLE `class_activity_schedules`
  ADD CONSTRAINT `class_activity_schedules_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_activity_schedules_ibfk_2` FOREIGN KEY (`activity_id`) REFERENCES `lesson_activities` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `class_lessons`
--
ALTER TABLE `class_lessons`
  ADD CONSTRAINT `class_lessons_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_lessons_ibfk_2` FOREIGN KEY (`module_id`) REFERENCES `class_modules` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `class_materials`
--
ALTER TABLE `class_materials`
  ADD CONSTRAINT `class_materials_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_materials_ibfk_2` FOREIGN KEY (`topic_id`) REFERENCES `class_topics` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_materials_ibfk_3` FOREIGN KEY (`lesson_id`) REFERENCES `class_lessons` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `class_modules`
--
ALTER TABLE `class_modules`
  ADD CONSTRAINT `class_modules_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `class_outline_overrides`
--
ALTER TABLE `class_outline_overrides`
  ADD CONSTRAINT `class_outline_overrides_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_outline_overrides_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `class_posts`
--
ALTER TABLE `class_posts`
  ADD CONSTRAINT `class_posts_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_posts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `class_post_comments`
--
ALTER TABLE `class_post_comments`
  ADD CONSTRAINT `class_post_comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `class_posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_post_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `class_post_reactions`
--
ALTER TABLE `class_post_reactions`
  ADD CONSTRAINT `class_post_reactions_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `class_posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_post_reactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `class_students`
--
ALTER TABLE `class_students`
  ADD CONSTRAINT `class_students_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `class_topics`
--
ALTER TABLE `class_topics`
  ADD CONSTRAINT `class_topics_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_topics_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `class_lessons` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_lessons`
--
ALTER TABLE `course_lessons`
  ADD CONSTRAINT `course_lessons_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `course_modules` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_modules`
--
ALTER TABLE `course_modules`
  ADD CONSTRAINT `course_modules_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_teachers`
--
ALTER TABLE `course_teachers`
  ADD CONSTRAINT `course_teachers_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exercises`
--
ALTER TABLE `exercises`
  ADD CONSTRAINT `exercises_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exercises_ibfk_2` FOREIGN KEY (`module_id`) REFERENCES `course_modules` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `exercise_questions`
--
ALTER TABLE `exercise_questions`
  ADD CONSTRAINT `exercise_questions_ibfk_1` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exercise_test_cases`
--
ALTER TABLE `exercise_test_cases`
  ADD CONSTRAINT `exercise_test_cases_ibfk_1` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lesson_activities`
--
ALTER TABLE `lesson_activities`
  ADD CONSTRAINT `lesson_activities_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `course_lessons` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lesson_materials`
--
ALTER TABLE `lesson_materials`
  ADD CONSTRAINT `lesson_materials_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `course_lessons` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `question_choices`
--
ALTER TABLE `question_choices`
  ADD CONSTRAINT `fk_choices_question` FOREIGN KEY (`question_id`) REFERENCES `activity_questions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `question_choices_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `activity_questions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `remember_me_tokens`
--
ALTER TABLE `remember_me_tokens`
  ADD CONSTRAINT `remember_me_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
