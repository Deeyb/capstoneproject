<?php
/**
 * CLI helper script to run debug_activity_report.php with preset parameters.
 *
 * Usage (PowerShell):
 *   php run_debug_activity.php
 * or specify parameters:
 *   php run_debug_activity.php 248 22
 */

$activityId = $argc > 1 ? (int)$argv[1] : 248;
$classId = $argc > 2 ? (int)$argv[2] : 22;

parse_str(http_build_query([
    'activity_id' => $activityId,
    'class_id' => $classId,
]), $_GET);

require __DIR__ . '/debug_activity_report.php';




