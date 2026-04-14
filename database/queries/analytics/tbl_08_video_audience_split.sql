-- Query ID: TBL-08
-- Purpose: Video audience split detail
-- Parameters:
--   @video_id (required), @start_ts (optional), @end_ts (optional), @limit, @offset

SET @q_start = NOW(6);

SET @start_ts = COALESCE(@start_ts, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 DAY));
SET @end_ts = COALESCE(@end_ts, UTC_TIMESTAMP());
SET @limit = LEAST(COALESCE(@limit, 50), 200);
SET @offset = COALESCE(@offset, 0);
SET @row_start = @offset + 1;
SET @row_end = @offset + @limit;

START TRANSACTION;

SELECT
  paged.age_bucket,
  paged.device_type,
  paged.viewer_count,
  paged.unique_view_sessions,
  ROUND(paged.watch_time_seconds, 2) AS watch_time_seconds,
  paged.engagement_actions,
  paged.exit_events
FROM (
  SELECT
    ranked.*,
    ROW_NUMBER() OVER (
      ORDER BY
        ranked.unique_view_sessions DESC,
        CASE ranked.age_bucket
          WHEN '13-17' THEN 1
          WHEN '18-24' THEN 2
          WHEN '25-34' THEN 3
          WHEN '35-44' THEN 4
          WHEN '45-54' THEN 5
          ELSE 6
        END ASC,
        ranked.device_type ASC
    ) AS rn
  FROM (
    SELECT
      CASE
        WHEN TIMESTAMPDIFF(YEAR, u.dob, CURDATE()) BETWEEN 13 AND 17 THEN '13-17'
        WHEN TIMESTAMPDIFF(YEAR, u.dob, CURDATE()) BETWEEN 18 AND 24 THEN '18-24'
        WHEN TIMESTAMPDIFF(YEAR, u.dob, CURDATE()) BETWEEN 25 AND 34 THEN '25-34'
        WHEN TIMESTAMPDIFF(YEAR, u.dob, CURDATE()) BETWEEN 35 AND 44 THEN '35-44'
        WHEN TIMESTAMPDIFF(YEAR, u.dob, CURDATE()) BETWEEN 45 AND 54 THEN '45-54'
        ELSE '55+'
      END AS age_bucket,
      d.device_type,
      COUNT(DISTINCT s.user_id) AS viewer_count,
      COUNT(DISTINCT CASE WHEN e.event_type = 'play' THEN CONCAT(e.session_id, ':', e.video_id) END) AS unique_view_sessions,
      SUM(
        CASE
          WHEN e.event_type = 'play' THEN GREATEST(TIMESTAMPDIFF(SECOND, s.started_at, s.ended_at), 0)
          ELSE 0
        END
      ) AS watch_time_seconds,
      SUM(CASE WHEN e.event_type IN ('like', 'share', 'comment') THEN 1 ELSE 0 END) AS engagement_actions,
      SUM(CASE WHEN e.event_type = 'exit' THEN 1 ELSE 0 END) AS exit_events
    FROM events e
    JOIN sessions s ON s.session_id = e.session_id
    JOIN users u ON u.user_id = s.user_id
    JOIN devices d ON d.device_id = s.device_id
    WHERE e.video_id = @video_id
      AND e.event_timestamp >= @start_ts
      AND e.event_timestamp < @end_ts
      AND s.ended_at IS NOT NULL
    GROUP BY age_bucket, d.device_type
  ) ranked
) paged
WHERE paged.rn BETWEEN @row_start AND @row_end
ORDER BY paged.rn;

SET @q_end = NOW(6);

SELECT
  'TBL-08' AS query_id,
  ROUND(TIMESTAMPDIFF(MICROSECOND, @q_start, @q_end) / 1000, 3) AS query_time_ms,
  UTC_TIMESTAMP(6) AS generated_at_utc,
  @video_id AS applied_video_id,
  @limit AS applied_limit,
  @offset AS applied_offset;

COMMIT;
