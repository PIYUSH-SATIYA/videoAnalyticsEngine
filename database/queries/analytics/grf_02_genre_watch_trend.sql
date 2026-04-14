-- Query ID: GRF-02
-- Purpose: Genre watch-time trend over time
-- Requires migration 008 (genre, video_genre)
-- Parameters:
--   @start_ts, @end_ts, @time_grain ('day'|'week'|'month'), @genre_id (optional)

SET @q_start = NOW(6);

SET @start_ts = COALESCE(@start_ts, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 DAY));
SET @end_ts = COALESCE(@end_ts, UTC_TIMESTAMP());
SET @time_grain = COALESCE(@time_grain, 'day');
SET @genre_id = NULLIF(@genre_id, '');

START TRANSACTION;

SELECT
  CASE
    WHEN @time_grain = 'month' THEN DATE_FORMAT(e.event_timestamp, '%Y-%m-01 00:00:00')
    WHEN @time_grain = 'week' THEN DATE_FORMAT(DATE_SUB(DATE(e.event_timestamp), INTERVAL WEEKDAY(e.event_timestamp) DAY), '%Y-%m-%d 00:00:00')
    ELSE DATE_FORMAT(DATE(e.event_timestamp), '%Y-%m-%d 00:00:00')
  END AS period_start,
  g.genre_id,
  g.name AS genre_name,
  ROUND(
    SUM(
      GREATEST(TIMESTAMPDIFF(SECOND, s.started_at, s.ended_at), 0)
      /
      NULLIF(vc.video_count_per_session, 0)
    ),
    2
  ) AS watch_time_seconds
FROM events e
JOIN sessions s ON s.session_id = e.session_id
JOIN video_genre vg ON vg.video_id = e.video_id
JOIN genre g ON g.genre_id = vg.genre_id
JOIN (
  SELECT
    e2.session_id,
    COUNT(DISTINCT e2.video_id) AS video_count_per_session
  FROM events e2
  WHERE e2.event_timestamp >= @start_ts
    AND e2.event_timestamp < @end_ts
  GROUP BY e2.session_id
) vc ON vc.session_id = e.session_id
WHERE e.event_timestamp >= @start_ts
  AND e.event_timestamp < @end_ts
  AND s.ended_at IS NOT NULL
  AND (@genre_id IS NULL OR g.genre_id = CAST(@genre_id AS UNSIGNED))
GROUP BY period_start, g.genre_id, g.name
ORDER BY period_start ASC, g.genre_id ASC;

SET @q_end = NOW(6);

SELECT
  'GRF-02' AS query_id,
  ROUND(TIMESTAMPDIFF(MICROSECOND, @q_start, @q_end) / 1000, 3) AS query_time_ms,
  UTC_TIMESTAMP(6) AS generated_at_utc,
  @time_grain AS applied_time_grain,
  @genre_id AS applied_genre_id;

COMMIT;
