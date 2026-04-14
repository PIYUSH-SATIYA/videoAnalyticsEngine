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

SELECT
  paged.video_id,
  paged.title,
  paged.genre_name,
  paged.views,
  ROUND(paged.watch_time_seconds, 2) AS watch_time_seconds,
  paged.engagement_actions,
  paged.exit_events
FROM (
  SELECT
    ranked.*,
    ROW_NUMBER() OVER (
      ORDER BY
        CASE WHEN @sort_by = 'engagement_actions' AND @sort_order = 'asc' THEN ranked.engagement_actions END ASC,
        CASE WHEN @sort_by = 'engagement_actions' AND @sort_order = 'desc' THEN ranked.engagement_actions END DESC,
        CASE WHEN @sort_by = 'watch_time_seconds' AND @sort_order = 'asc' THEN ranked.watch_time_seconds END ASC,
        CASE WHEN @sort_by = 'watch_time_seconds' AND @sort_order = 'desc' THEN ranked.watch_time_seconds END DESC,
        CASE WHEN @sort_by = 'exit_events' AND @sort_order = 'asc' THEN ranked.exit_events END ASC,
        CASE WHEN @sort_by = 'exit_events' AND @sort_order = 'desc' THEN ranked.exit_events END DESC,
        CASE WHEN @sort_by = 'views' AND @sort_order = 'asc' THEN ranked.views END ASC,
        CASE WHEN @sort_by = 'views' AND @sort_order = 'desc' THEN ranked.views END DESC,
        ranked.views DESC,
        ranked.video_id ASC,
        ranked.genre_name ASC
    ) AS rn
  FROM (
    SELECT
      v.video_id,
      v.title,
      g.name AS genre_name,
      COUNT(DISTINCT CASE WHEN e.event_type = 'play' THEN CONCAT(e.session_id, ':', e.video_id) END) AS views,
      SUM(
        GREATEST(TIMESTAMPDIFF(SECOND, s.started_at, s.ended_at), 0)
        /
        NULLIF(vc.video_count_per_session, 0)
      ) AS watch_time_seconds,
      SUM(CASE WHEN e.event_type IN ('like', 'share', 'comment') THEN 1 ELSE 0 END) AS engagement_actions,
      SUM(CASE WHEN e.event_type = 'exit' THEN 1 ELSE 0 END) AS exit_events,
      COUNT(*) AS event_count
    FROM events e
    JOIN sessions s ON s.session_id = e.session_id
    JOIN devices d ON d.device_id = s.device_id
    JOIN videos v ON v.video_id = e.video_id
    JOIN video_genre vg ON vg.video_id = v.video_id
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
      AND (@genre_id_csv IS NULL OR FIND_IN_SET(CAST(g.genre_id AS CHAR), @genre_id_csv) > 0)
      AND (@device_type_csv IS NULL OR FIND_IN_SET(d.device_type, @device_type_csv) > 0)
    GROUP BY v.video_id, v.title, g.name
    HAVING COUNT(*) >= @min_events
  ) ranked
) paged
WHERE paged.rn BETWEEN @row_start AND @row_end
ORDER BY paged.rn;

SET @q_end = NOW(6);

SELECT
  'TBL-04' AS query_id,
  ROUND(TIMESTAMPDIFF(MICROSECOND, @q_start, @q_end) / 1000, 3) AS query_time_ms,
  UTC_TIMESTAMP(6) AS generated_at_utc,
  @limit AS applied_limit,
  @offset AS applied_offset;

COMMIT;
