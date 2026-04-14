-- Query ID: TBL-05
-- Purpose: Device quality friction metrics
-- Requires migration 008 (video_genre table used for genre filtering)
-- Parameters (optional):
--   @start_ts, @end_ts, @device_type_csv, @operating_system_csv, @browser_csv, @genre_id_csv,
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
SET @limit = LEAST(COALESCE(@limit, 25), 200);
SET @offset = COALESCE(@offset, 0);
SET @sort_by = COALESCE(@sort_by, 'quality_change_events');
SET @sort_order = COALESCE(@sort_order, 'desc');
SET @device_type_csv = NULLIF(@device_type_csv, '');
SET @operating_system_csv = NULLIF(@operating_system_csv, '');
SET @browser_csv = NULLIF(@browser_csv, '');
SET @genre_id_csv = NULLIF(@genre_id_csv, '');
SET @row_start = @offset + 1;
SET @row_end = @offset + @limit;

START TRANSACTION;

SELECT
  paged.device_type,
  paged.operating_system,
  paged.browser,
  paged.quality_change_events,
  CASE
    WHEN paged.unique_view_sessions = 0 THEN 0
    ELSE ROUND((paged.quality_change_events * 100.0) / paged.unique_view_sessions, 3)
  END AS quality_change_per_100_views
FROM (
  SELECT
    ranked.*,
    ROW_NUMBER() OVER (
      ORDER BY
        CASE WHEN @sort_by = 'quality_change_per_100_views' AND @sort_order = 'asc' THEN (CASE WHEN ranked.unique_view_sessions = 0 THEN 0 ELSE (ranked.quality_change_events * 100.0) / ranked.unique_view_sessions END) END ASC,
        CASE WHEN @sort_by = 'quality_change_per_100_views' AND @sort_order = 'desc' THEN (CASE WHEN ranked.unique_view_sessions = 0 THEN 0 ELSE (ranked.quality_change_events * 100.0) / ranked.unique_view_sessions END) END DESC,
        CASE WHEN @sort_by = 'quality_change_events' AND @sort_order = 'asc' THEN ranked.quality_change_events END ASC,
        CASE WHEN @sort_by = 'quality_change_events' AND @sort_order = 'desc' THEN ranked.quality_change_events END DESC,
        ranked.quality_change_events DESC,
        ranked.browser ASC
    ) AS rn
  FROM (
    SELECT
      d.device_type,
      d.operating_system,
      d.browser,
      SUM(CASE WHEN e.event_type = 'quality_change' THEN 1 ELSE 0 END) AS quality_change_events,
      COUNT(DISTINCT CASE WHEN e.event_type = 'play' THEN CONCAT(e.session_id, ':', e.video_id) END) AS unique_view_sessions
    FROM events e
    JOIN sessions s ON s.session_id = e.session_id
    JOIN devices d ON d.device_id = s.device_id
    WHERE e.event_timestamp >= @start_ts
      AND e.event_timestamp < @end_ts
      AND (@device_type_csv IS NULL OR FIND_IN_SET(d.device_type, @device_type_csv) > 0)
      AND (@operating_system_csv IS NULL OR FIND_IN_SET(d.operating_system, @operating_system_csv) > 0)
      AND (@browser_csv IS NULL OR FIND_IN_SET(d.browser, @browser_csv) > 0)
      AND (
        @genre_id_csv IS NULL
        OR EXISTS (
          SELECT 1
          FROM video_genre vg
          WHERE vg.video_id = e.video_id
            AND FIND_IN_SET(CAST(vg.genre_id AS CHAR), @genre_id_csv) > 0
        )
      )
    GROUP BY d.device_type, d.operating_system, d.browser
  ) ranked
) paged
WHERE paged.rn BETWEEN @row_start AND @row_end
ORDER BY paged.rn;

SET @q_end = NOW(6);

SELECT
  'TBL-05' AS query_id,
  ROUND(TIMESTAMPDIFF(MICROSECOND, @q_start, @q_end) / 1000, 3) AS query_time_ms,
  UTC_TIMESTAMP(6) AS generated_at_utc,
  @limit AS applied_limit,
  @offset AS applied_offset;

COMMIT;
