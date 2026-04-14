-- Query ID: KPI-05
-- Purpose: Global binge watcher count over rolling 7 days (no filters)
-- Fixed thresholds:
--   min_watch_seconds = 7200 (2 hours)
--   min_sessions = 3

SET @q_start = NOW(6);
SET @window_start = DATE_SUB(UTC_TIMESTAMP(), INTERVAL 7 DAY);
SET @window_end = UTC_TIMESTAMP();
SET @min_watch_seconds = 7200;
SET @min_sessions = 3;

START TRANSACTION;

SELECT
  COUNT(*) AS binge_user_count
FROM (
  SELECT
    s.user_id,
    COUNT(*) AS sessions_count,
    SUM(GREATEST(TIMESTAMPDIFF(SECOND, s.started_at, s.ended_at), 0)) AS watch_time_seconds
  FROM sessions s
  WHERE s.started_at >= @window_start
    AND s.started_at < @window_end
    AND s.ended_at IS NOT NULL
  GROUP BY s.user_id
  HAVING COUNT(*) >= @min_sessions
     AND SUM(GREATEST(TIMESTAMPDIFF(SECOND, s.started_at, s.ended_at), 0)) >= @min_watch_seconds
) u;

SET @q_end = NOW(6);

SELECT
  'KPI-05' AS query_id,
  ROUND(TIMESTAMPDIFF(MICROSECOND, @q_start, @q_end) / 1000, 3) AS query_time_ms,
  UTC_TIMESTAMP(6) AS generated_at_utc;

COMMIT;
