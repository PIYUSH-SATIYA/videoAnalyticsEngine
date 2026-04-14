-- Query ID: KPI-03
-- Purpose: Global average session duration over rolling 7 days (no filters)

SET @q_start = NOW(6);
SET @window_start = DATE_SUB(UTC_TIMESTAMP(), INTERVAL 7 DAY);
SET @window_end = UTC_TIMESTAMP();

START TRANSACTION;

SELECT
  COALESCE(AVG(GREATEST(TIMESTAMPDIFF(SECOND, s.started_at, s.ended_at), 0)), 0) AS avg_session_duration_seconds
FROM sessions s
WHERE s.started_at >= @window_start
  AND s.started_at < @window_end
  AND s.ended_at IS NOT NULL;

SET @q_end = NOW(6);

SELECT
  'KPI-03' AS query_id,
  ROUND(TIMESTAMPDIFF(MICROSECOND, @q_start, @q_end) / 1000, 3) AS query_time_ms,
  UTC_TIMESTAMP(6) AS generated_at_utc;

COMMIT;
