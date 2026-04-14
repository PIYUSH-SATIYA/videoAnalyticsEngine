-- Query ID: GRF-01
-- Purpose: Average session duration trend by age bucket
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
    WHEN @time_grain = 'month' THEN DATE_FORMAT(s.started_at, '%Y-%m-01 00:00:00')
    WHEN @time_grain = 'week' THEN DATE_FORMAT(DATE_SUB(DATE(s.started_at), INTERVAL WEEKDAY(s.started_at) DAY), '%Y-%m-%d 00:00:00')
    ELSE DATE_FORMAT(DATE(s.started_at), '%Y-%m-%d 00:00:00')
  END AS period_start,
  CASE
    WHEN TIMESTAMPDIFF(YEAR, u.dob, CURDATE()) BETWEEN 13 AND 17 THEN '13-17'
    WHEN TIMESTAMPDIFF(YEAR, u.dob, CURDATE()) BETWEEN 18 AND 24 THEN '18-24'
    WHEN TIMESTAMPDIFF(YEAR, u.dob, CURDATE()) BETWEEN 25 AND 34 THEN '25-34'
    WHEN TIMESTAMPDIFF(YEAR, u.dob, CURDATE()) BETWEEN 35 AND 44 THEN '35-44'
    WHEN TIMESTAMPDIFF(YEAR, u.dob, CURDATE()) BETWEEN 45 AND 54 THEN '45-54'
    ELSE '55+'
  END AS age_bucket,
  ROUND(AVG(GREATEST(TIMESTAMPDIFF(SECOND, s.started_at, s.ended_at), 0)), 2) AS avg_session_duration_seconds
FROM sessions s
JOIN users u ON u.user_id = s.user_id
JOIN devices d ON d.device_id = s.device_id
WHERE s.started_at >= @start_ts
  AND s.started_at < @end_ts
  AND s.ended_at IS NOT NULL
  AND (@device_type IS NULL OR d.device_type = @device_type)
GROUP BY period_start, age_bucket
ORDER BY period_start ASC, age_bucket ASC;

SET @q_end = NOW(6);

SELECT
  'GRF-01' AS query_id,
  ROUND(TIMESTAMPDIFF(MICROSECOND, @q_start, @q_end) / 1000, 3) AS query_time_ms,
  UTC_TIMESTAMP(6) AS generated_at_utc,
  @time_grain AS applied_time_grain,
  @device_type AS applied_device_type;

COMMIT;
