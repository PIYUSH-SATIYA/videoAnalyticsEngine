-- Query ID: KPI-04
-- Purpose: Global engagement actions per 100 unique view sessions over latest observed rolling 7 days (no filters)

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
  COALESCE(t.engagement_actions, 0) AS engagement_actions,
  COALESCE(t.raw_play_events, 0) AS raw_play_events,
  t.unique_view_sessions,
  CASE
    WHEN t.unique_view_sessions = 0 THEN 0
    ELSE ROUND((COALESCE(t.engagement_actions, 0) * 100.0) / t.unique_view_sessions, 3)
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
  UTC_TIMESTAMP(6) AS generated_at_utc,
  @window_start AS applied_window_start,
  @window_end AS applied_window_end;

COMMIT;
