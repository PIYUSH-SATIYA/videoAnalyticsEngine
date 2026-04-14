-- Query ID: KPI-03
-- Purpose: Global average session duration over latest observed rolling 7 days (no filters)

SET @q_start = NOW(6);
SET @ref_ts = COALESCE(
  (SELECT MAX(event_timestamp) FROM events),
  (SELECT MAX(started_at) FROM sessions),
  UTC_TIMESTAMP()
);
SET @window_start = DATE_SUB(@ref_ts, INTERVAL 7 DAY);
SET @window_end = @ref_ts;

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
  UTC_TIMESTAMP(6) AS generated_at_utc,
  @window_start AS applied_window_start,
  @window_end AS applied_window_end;

COMMIT;
