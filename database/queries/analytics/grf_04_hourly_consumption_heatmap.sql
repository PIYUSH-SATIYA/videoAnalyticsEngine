-- Query ID: GRF-04
-- Purpose: Hour-of-day vs day-of-week consumption heatmap
-- Parameters:
--   @start_ts, @end_ts, @device_type (optional), @metric ('watch_time_seconds'|'sessions_count')

SET @q_start = NOW(6);

SET @start_ts = COALESCE(@start_ts, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 DAY));
SET @end_ts = COALESCE(@end_ts, UTC_TIMESTAMP());
SET @device_type = NULLIF(@device_type, '');
SET @metric = COALESCE(@metric, 'watch_time_seconds');

START TRANSACTION;

SELECT
  DAYOFWEEK(s.started_at) AS day_of_week,
  HOUR(s.started_at) AS hour_of_day,
  SUM(
    CASE
      WHEN @metric = 'sessions_count' THEN 1
      ELSE GREATEST(TIMESTAMPDIFF(SECOND, s.started_at, s.ended_at), 0)
    END
  ) AS metric_value
FROM sessions s
JOIN devices d ON d.device_id = s.device_id
WHERE s.started_at >= @start_ts
  AND s.started_at < @end_ts
  AND s.ended_at IS NOT NULL
  AND (@device_type IS NULL OR d.device_type = @device_type)
GROUP BY DAYOFWEEK(s.started_at), HOUR(s.started_at)
ORDER BY day_of_week ASC, hour_of_day ASC;

SET @q_end = NOW(6);

SELECT
  'GRF-04' AS query_id,
  ROUND(TIMESTAMPDIFF(MICROSECOND, @q_start, @q_end) / 1000, 3) AS query_time_ms,
  UTC_TIMESTAMP(6) AS generated_at_utc,
  @metric AS applied_metric,
  @device_type AS applied_device_type;

COMMIT;
