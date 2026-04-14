-- Query ID: KPI-04
-- Purpose: Global engagement actions per 100 unique view sessions over rolling 7 days (no filters)

SET @q_start = NOW(6);
SET @window_start = DATE_SUB(UTC_TIMESTAMP(), INTERVAL 7 DAY);
SET @window_end = UTC_TIMESTAMP();

START TRANSACTION;

SELECT
  t.engagement_actions,
  t.raw_play_events,
  t.unique_view_sessions,
  CASE
    WHEN t.unique_view_sessions = 0 THEN 0
    ELSE ROUND((t.engagement_actions * 100.0) / t.unique_view_sessions, 3)
  END AS engagement_per_100_views
FROM (
  SELECT
    SUM(CASE WHEN e.event_type IN ('like', 'share', 'comment') THEN 1 ELSE 0 END) AS engagement_actions,
    SUM(CASE WHEN e.event_type = 'play' THEN 1 ELSE 0 END) AS raw_play_events,
    COUNT(DISTINCT CASE WHEN e.event_type = 'play' THEN CONCAT(e.session_id, ':', e.video_id) END) AS unique_view_sessions
  FROM events e
  WHERE e.event_timestamp >= @window_start
    AND e.event_timestamp < @window_end
) t;

SET @q_end = NOW(6);

SELECT
  'KPI-04' AS query_id,
  ROUND(TIMESTAMPDIFF(MICROSECOND, @q_start, @q_end) / 1000, 3) AS query_time_ms,
  UTC_TIMESTAMP(6) AS generated_at_utc;

COMMIT;
