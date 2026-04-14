-- Query ID: TBL-06
-- Purpose: Time spent distribution by device type
-- Requires migration 008 if genre filter is used
-- Parameters (optional):
--   @start_ts, @end_ts, @age_min, @age_max, @device_type_csv, @genre_id_csv,
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
SET @sort_by = COALESCE(@sort_by, 'watch_time_seconds');
SET @sort_order = COALESCE(@sort_order, 'desc');
SET @device_type_csv = NULLIF(@device_type_csv, '');
SET @genre_id_csv = NULLIF(@genre_id_csv, '');
SET @row_start = @offset + 1;
SET @row_end = @offset + @limit;

START TRANSACTION;

SELECT
  paged.device_type,
  paged.sessions_count,
  ROUND(paged.watch_time_seconds, 2) AS watch_time_seconds,
  CASE
    WHEN paged.total_watch_time_seconds = 0 THEN 0
    ELSE ROUND((paged.watch_time_seconds * 100.0) / paged.total_watch_time_seconds, 3)
  END AS watch_time_share_percent
FROM (
  SELECT
    ranked.*,
    ROW_NUMBER() OVER (
      ORDER BY
        CASE WHEN @sort_by = 'sessions_count' AND @sort_order = 'asc' THEN ranked.sessions_count END ASC,
        CASE WHEN @sort_by = 'sessions_count' AND @sort_order = 'desc' THEN ranked.sessions_count END DESC,
        CASE WHEN @sort_by = 'watch_time_share_percent' AND @sort_order = 'asc' THEN (CASE WHEN ranked.total_watch_time_seconds = 0 THEN 0 ELSE (ranked.watch_time_seconds * 100.0) / ranked.total_watch_time_seconds END) END ASC,
        CASE WHEN @sort_by = 'watch_time_share_percent' AND @sort_order = 'desc' THEN (CASE WHEN ranked.total_watch_time_seconds = 0 THEN 0 ELSE (ranked.watch_time_seconds * 100.0) / ranked.total_watch_time_seconds END) END DESC,
        CASE WHEN @sort_by = 'watch_time_seconds' AND @sort_order = 'asc' THEN ranked.watch_time_seconds END ASC,
        CASE WHEN @sort_by = 'watch_time_seconds' AND @sort_order = 'desc' THEN ranked.watch_time_seconds END DESC,
        ranked.watch_time_seconds DESC,
        ranked.device_type ASC
    ) AS rn
  FROM (
    SELECT
      x.device_type,
      x.sessions_count,
      x.watch_time_seconds,
      totals.total_watch_time_seconds
    FROM (
      SELECT
        d.device_type,
        COUNT(*) AS sessions_count,
        SUM(GREATEST(TIMESTAMPDIFF(SECOND, s.started_at, s.ended_at), 0)) AS watch_time_seconds
      FROM sessions s
      JOIN users u ON u.user_id = s.user_id
      JOIN devices d ON d.device_id = s.device_id
      WHERE s.started_at >= @start_ts
        AND s.started_at < @end_ts
        AND s.ended_at IS NOT NULL
        AND (@age_min IS NULL OR TIMESTAMPDIFF(YEAR, u.dob, CURDATE()) >= @age_min)
        AND (@age_max IS NULL OR TIMESTAMPDIFF(YEAR, u.dob, CURDATE()) <= @age_max)
        AND (@device_type_csv IS NULL OR FIND_IN_SET(d.device_type, @device_type_csv) > 0)
        AND (
          @genre_id_csv IS NULL
          OR EXISTS (
            SELECT 1
            FROM events e
            JOIN video_genre vg ON vg.video_id = e.video_id
            WHERE e.session_id = s.session_id
              AND FIND_IN_SET(CAST(vg.genre_id AS CHAR), @genre_id_csv) > 0
          )
        )
      GROUP BY d.device_type
    ) x
    CROSS JOIN (
      SELECT
        COALESCE(SUM(y.watch_time_seconds), 0) AS total_watch_time_seconds
      FROM (
        SELECT
          d.device_type,
          SUM(GREATEST(TIMESTAMPDIFF(SECOND, s.started_at, s.ended_at), 0)) AS watch_time_seconds
        FROM sessions s
        JOIN users u ON u.user_id = s.user_id
        JOIN devices d ON d.device_id = s.device_id
        WHERE s.started_at >= @start_ts
          AND s.started_at < @end_ts
          AND s.ended_at IS NOT NULL
          AND (@age_min IS NULL OR TIMESTAMPDIFF(YEAR, u.dob, CURDATE()) >= @age_min)
          AND (@age_max IS NULL OR TIMESTAMPDIFF(YEAR, u.dob, CURDATE()) <= @age_max)
          AND (@device_type_csv IS NULL OR FIND_IN_SET(d.device_type, @device_type_csv) > 0)
          AND (
            @genre_id_csv IS NULL
            OR EXISTS (
              SELECT 1
              FROM events e
              JOIN video_genre vg ON vg.video_id = e.video_id
              WHERE e.session_id = s.session_id
                AND FIND_IN_SET(CAST(vg.genre_id AS CHAR), @genre_id_csv) > 0
            )
          )
        GROUP BY d.device_type
      ) y
    ) totals
  ) ranked
) paged
WHERE paged.rn BETWEEN @row_start AND @row_end
ORDER BY paged.rn;

SET @q_end = NOW(6);

SELECT
  'TBL-06' AS query_id,
  ROUND(TIMESTAMPDIFF(MICROSECOND, @q_start, @q_end) / 1000, 3) AS query_time_ms,
  UTC_TIMESTAMP(6) AS generated_at_utc,
  @limit AS applied_limit,
  @offset AS applied_offset;

COMMIT;
