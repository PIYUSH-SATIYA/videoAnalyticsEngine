-- Query ID: KPI-02
-- Purpose: Global watch time for current UTC day (no filters)

SET @q_start = NOW(6);
SET @day_start_utc = DATE(UTC_TIMESTAMP());
SET @day_end_utc = DATE_ADD(@day_start_utc, INTERVAL 1 DAY);

START TRANSACTION;

SELECT
  COALESCE(SUM(GREATEST(TIMESTAMPDIFF(SECOND, s.started_at, s.ended_at), 0)), 0) AS watch_time_seconds,
  ROUND(COALESCE(SUM(GREATEST(TIMESTAMPDIFF(SECOND, s.started_at, s.ended_at), 0)), 0) / 3600, 3) AS watch_time_hours
FROM sessions s
WHERE s.started_at >= @day_start_utc
  AND s.started_at < @day_end_utc
  AND s.ended_at IS NOT NULL;

SET @q_end = NOW(6);

SELECT
  'KPI-02' AS query_id,
  ROUND(TIMESTAMPDIFF(MICROSECOND, @q_start, @q_end) / 1000, 3) AS query_time_ms,
  UTC_TIMESTAMP(6) AS generated_at_utc;

COMMIT;
