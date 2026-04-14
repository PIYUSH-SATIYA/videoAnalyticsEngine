-- Query ID: KPI-01
-- Purpose: Global live users at latest observed activity timestamp (no filters)

SET @q_start = NOW(6);
SET @as_of_ts = COALESCE(
  (SELECT MAX(event_timestamp) FROM events),
  (SELECT MAX(started_at) FROM sessions),
  UTC_TIMESTAMP()
);

START TRANSACTION;

SELECT
  COUNT(DISTINCT s.user_id) AS live_users
FROM sessions s
WHERE s.started_at <= @as_of_ts
  AND s.ended_at >= @as_of_ts;

SET @q_end = NOW(6);

SELECT
  'KPI-01' AS query_id,
  ROUND(TIMESTAMPDIFF(MICROSECOND, @q_start, @q_end) / 1000, 3) AS query_time_ms,
  UTC_TIMESTAMP(6) AS generated_at_utc,
  @as_of_ts AS applied_as_of_ts;

COMMIT;
