-- Query ID: TBL-04
-- Purpose: Video performance by genre
-- Requires migration 008 (genre, video_genre)
-- Parameters (optional):
--   @start_ts, @end_ts, @genre_id_csv, @device_type_csv, @min_events,
--   @limit, @offset, @sort_by, @sort_order

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
SET @min_events = COALESCE(@min_events, 1);
SET @limit = LEAST(COALESCE(@limit, 25), 200);
SET @offset = COALESCE(@offset, 0);
SET @sort_by = COALESCE(@sort_by, 'views');
SET @sort_order = COALESCE(@sort_order, 'desc');
SET @genre_id_csv = NULLIF(@genre_id_csv, '');
SET @device_type_csv = NULLIF(@device_type_csv, '');
SET @row_start = @offset + 1;
SET @row_end = @offset + @limit;

START TRANSACTION;

WITH matched_video_genres AS (
  SELECT
    vg.video_id,
    vg.genre_id
  FROM video_genre vg
  WHERE @genre_id_csv IS NULL OR FIND_IN_SET(CAST(vg.genre_id AS CHAR), @genre_id_csv) > 0
),
display_genre AS (
  SELECT
    mvg.video_id,
    MIN(mvg.genre_id) AS genre_id
  FROM matched_video_genres mvg
  GROUP BY mvg.video_id
),
play_pairs AS (
  SELECT DISTINCT
    e.session_id,
    e.video_id
  FROM events e
  JOIN display_genre dg ON dg.video_id = e.video_id
  JOIN sessions s ON s.session_id = e.session_id
  JOIN devices d ON d.device_id = s.device_id
  WHERE e.event_timestamp >= @start_ts
    AND e.event_timestamp < @end_ts
    AND e.event_type = 'play'
    AND s.ended_at IS NOT NULL
    AND (@device_type_csv IS NULL OR FIND_IN_SET(d.device_type, @device_type_csv) > 0)
),
views_watch_rollup AS (
  SELECT
    pp.video_id,
    COUNT(*) AS views,
    SUM(GREATEST(TIMESTAMPDIFF(SECOND, s.started_at, s.ended_at), 0)) AS watch_time_seconds
  FROM play_pairs pp
  JOIN sessions s ON s.session_id = pp.session_id
  GROUP BY pp.video_id
),
action_rollup AS (
  SELECT
    e.video_id,
    SUM(CASE WHEN e.event_type IN ('like', 'share', 'comment') THEN 1 ELSE 0 END) AS engagement_actions,
    SUM(CASE WHEN e.event_type = 'exit' THEN 1 ELSE 0 END) AS exit_events,
    COUNT(*) AS action_event_count
  FROM events e
  JOIN display_genre dg ON dg.video_id = e.video_id
  JOIN sessions s ON s.session_id = e.session_id
  JOIN devices d ON d.device_id = s.device_id
  WHERE e.event_timestamp >= @start_ts
    AND e.event_timestamp < @end_ts
    AND e.event_type IN ('like', 'share', 'comment', 'exit')
    AND s.ended_at IS NOT NULL
    AND (@device_type_csv IS NULL OR FIND_IN_SET(d.device_type, @device_type_csv) > 0)
  GROUP BY e.video_id
),
video_rollup AS (
  SELECT
    dg.video_id,
    COALESCE(vwr.views, 0) AS views,
    COALESCE(vwr.watch_time_seconds, 0) AS watch_time_seconds,
    COALESCE(ar.engagement_actions, 0) AS engagement_actions,
    COALESCE(ar.exit_events, 0) AS exit_events,
    COALESCE(vwr.views, 0) + COALESCE(ar.action_event_count, 0) AS event_count
  FROM display_genre dg
  LEFT JOIN views_watch_rollup vwr ON vwr.video_id = dg.video_id
  LEFT JOIN action_rollup ar ON ar.video_id = dg.video_id
),
ranked AS (
  SELECT
    vr.video_id,
    v.title,
    TRIM(BOTH '\r' FROM g.name) AS genre_name,
    vr.views,
    vr.watch_time_seconds,
    vr.engagement_actions,
    vr.exit_events,
    ROW_NUMBER() OVER (
      ORDER BY
        CASE WHEN @sort_by = 'engagement_actions' AND @sort_order = 'asc' THEN vr.engagement_actions END ASC,
        CASE WHEN @sort_by = 'engagement_actions' AND @sort_order = 'desc' THEN vr.engagement_actions END DESC,
        CASE WHEN @sort_by = 'watch_time_seconds' AND @sort_order = 'asc' THEN vr.watch_time_seconds END ASC,
        CASE WHEN @sort_by = 'watch_time_seconds' AND @sort_order = 'desc' THEN vr.watch_time_seconds END DESC,
        CASE WHEN @sort_by = 'exit_events' AND @sort_order = 'asc' THEN vr.exit_events END ASC,
        CASE WHEN @sort_by = 'exit_events' AND @sort_order = 'desc' THEN vr.exit_events END DESC,
        CASE WHEN @sort_by = 'views' AND @sort_order = 'asc' THEN vr.views END ASC,
        CASE WHEN @sort_by = 'views' AND @sort_order = 'desc' THEN vr.views END DESC,
        vr.views DESC,
        vr.video_id ASC,
        TRIM(BOTH '\r' FROM g.name) ASC
    ) AS rn
  FROM video_rollup vr
  JOIN videos v ON v.video_id = vr.video_id
  JOIN display_genre dg ON dg.video_id = vr.video_id
  JOIN genre g ON g.genre_id = dg.genre_id
  WHERE vr.event_count >= @min_events
)
SELECT
  ranked.video_id,
  ranked.title,
  ranked.genre_name,
  ranked.views,
  ROUND(ranked.watch_time_seconds, 2) AS watch_time_seconds,
  ranked.engagement_actions,
  ranked.exit_events
FROM ranked
WHERE ranked.rn BETWEEN @row_start AND @row_end
ORDER BY ranked.rn;

SET @q_end = NOW(6);

SELECT
  'TBL-04' AS query_id,
  ROUND(TIMESTAMPDIFF(MICROSECOND, @q_start, @q_end) / 1000, 3) AS query_time_ms,
  UTC_TIMESTAMP(6) AS generated_at_utc,
  @limit AS applied_limit,
  @offset AS applied_offset;

COMMIT;
