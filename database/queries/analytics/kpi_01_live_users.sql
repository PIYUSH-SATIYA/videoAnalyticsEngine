-- Query ID: KPI-01
-- Purpose: Global live users right now (no filters)

SET @q_start = NOW(6);

START TRANSACTION;

SELECT
  COUNT(DISTINCT s.user_id) AS live_users
FROM sessions s
WHERE s.started_at <= NOW()
  AND s.ended_at >= NOW();

SET @q_end = NOW(6);

SELECT
  'KPI-01' AS query_id,
  ROUND(TIMESTAMPDIFF(MICROSECOND, @q_start, @q_end) / 1000, 3) AS query_time_ms,
  UTC_TIMESTAMP(6) AS generated_at_utc;

COMMIT;
