-- Query ID: GRF-03
-- Purpose: Event type mix trend over time
-- Parameters:
--   @start_ts, @end_ts, @time_grain ('day'|'week'|'month'), @device_type (optional)

SET @q_start = NOW(6);

SET @as_of_ts = COALESCE(
  (SELECT MAX(event_timestamp) FROM events),
  (SELECT MAX(started_at) FROM sessions),
  UTC_TIMESTAMP()
);
SET @default_end_ts = DATE_ADD(DATE(@as_of_ts), INTERVAL 1 DAY);
SET @default_start_ts = DATE_SUB(@default_end_ts, INTERVAL 30 DAY);
SET @start_ts = COALESCE(@start_ts, @default_start_ts);
SET @end_ts = COALESCE(@end_ts, @default_end_ts);
SET @time_grain = COALESCE(@time_grain, 'day');
SET @device_type = NULLIF(@device_type, '');

START TRANSACTION;

SELECT
  CASE
    WHEN @time_grain = 'month' THEN DATE_FORMAT(e.event_timestamp, '%Y-%m-01 00:00:00')
    WHEN @time_grain = 'week' THEN DATE_FORMAT(DATE_SUB(DATE(e.event_timestamp), INTERVAL WEEKDAY(e.event_timestamp) DAY), '%Y-%m-%d 00:00:00')
    ELSE DATE_FORMAT(DATE(e.event_timestamp), '%Y-%m-%d 00:00:00')
  END AS period_start,
  e.event_type,
  COUNT(*) AS event_count
FROM events e
JOIN sessions s ON s.session_id = e.session_id
JOIN devices d ON d.device_id = s.device_id
WHERE e.event_timestamp >= @start_ts
  AND e.event_timestamp < @end_ts
  AND (@device_type IS NULL OR d.device_type = @device_type)
GROUP BY period_start, e.event_type
ORDER BY period_start ASC, e.event_type ASC;

SET @q_end = NOW(6);

SELECT
  'GRF-03' AS query_id,
  ROUND(TIMESTAMPDIFF(MICROSECOND, @q_start, @q_end) / 1000, 3) AS query_time_ms,
  UTC_TIMESTAMP(6) AS generated_at_utc,
  @time_grain AS applied_time_grain,
  @device_type AS applied_device_type;

COMMIT;
