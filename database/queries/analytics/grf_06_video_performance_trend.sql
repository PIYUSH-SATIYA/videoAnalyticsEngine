-- Query ID: GRF-06
-- Purpose: Video performance trend (detail)
-- Parameters:
--   @video_id (required), @start_ts, @end_ts,
--   @time_grain ('day'|'week'|'month'), @device_type (optional)

SET @q_start = NOW(6);

SET @start_ts = COALESCE(@start_ts, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 DAY));
SET @end_ts = COALESCE(@end_ts, UTC_TIMESTAMP());
SET @time_grain = COALESCE(@time_grain, 'day');
SET @device_type = NULLIF(@device_type, '');

START TRANSACTION;

SELECT
  x.period_start,
  x.unique_view_sessions,
  ROUND(x.watch_time_seconds, 2) AS watch_time_seconds,
  x.engagement_actions
FROM (
  SELECT
    CASE
      WHEN @time_grain = 'month' THEN DATE_FORMAT(e.event_timestamp, '%Y-%m-01 00:00:00')
      WHEN @time_grain = 'week' THEN DATE_FORMAT(DATE_SUB(DATE(e.event_timestamp), INTERVAL WEEKDAY(e.event_timestamp) DAY), '%Y-%m-%d 00:00:00')
      ELSE DATE_FORMAT(DATE(e.event_timestamp), '%Y-%m-%d 00:00:00')
    END AS period_start,
    COUNT(DISTINCT CASE WHEN e.event_type = 'play' THEN CONCAT(e.session_id, ':', e.video_id) END) AS unique_view_sessions,
    SUM(
      CASE
        WHEN e.event_type = 'play' THEN GREATEST(TIMESTAMPDIFF(SECOND, s.started_at, s.ended_at), 0)
        ELSE 0
      END
    ) AS watch_time_seconds,
    SUM(CASE WHEN e.event_type IN ('like', 'share', 'comment') THEN 1 ELSE 0 END) AS engagement_actions
  FROM events e
  JOIN sessions s ON s.session_id = e.session_id
  JOIN devices d ON d.device_id = s.device_id
  WHERE e.video_id = @video_id
    AND e.event_timestamp >= @start_ts
    AND e.event_timestamp < @end_ts
    AND s.ended_at IS NOT NULL
    AND (@device_type IS NULL OR d.device_type = @device_type)
  GROUP BY period_start
) x
ORDER BY x.period_start ASC;

SET @q_end = NOW(6);

SELECT
  'GRF-06' AS query_id,
  ROUND(TIMESTAMPDIFF(MICROSECOND, @q_start, @q_end) / 1000, 3) AS query_time_ms,
  UTC_TIMESTAMP(6) AS generated_at_utc,
  @video_id AS applied_video_id,
  @time_grain AS applied_time_grain,
  @device_type AS applied_device_type;

COMMIT;
