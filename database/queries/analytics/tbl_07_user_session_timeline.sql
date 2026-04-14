-- Query ID: TBL-07
-- Purpose: User session detail timeline
-- Parameters:
--   @user_id (required), @start_ts (optional), @end_ts (optional), @limit, @offset

SET @q_start = NOW(6);

SET @start_ts = COALESCE(@start_ts, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 DAY));
SET @end_ts = COALESCE(@end_ts, UTC_TIMESTAMP());
SET @limit = LEAST(COALESCE(@limit, 50), 200);
SET @offset = COALESCE(@offset, 0);
SET @row_start = @offset + 1;
SET @row_end = @offset + @limit;

START TRANSACTION;

SELECT
  paged.session_id,
  paged.started_at,
  paged.ended_at,
  paged.session_duration_seconds,
  paged.device_type,
  paged.operating_system,
  paged.browser,
  paged.events_count,
  paged.unique_videos,
  paged.plays,
  paged.engagement_actions
FROM (
  SELECT
    ranked.*,
    ROW_NUMBER() OVER (ORDER BY ranked.started_at DESC, ranked.session_id DESC) AS rn
  FROM (
    SELECT
      s.session_id,
      s.started_at,
      s.ended_at,
      GREATEST(TIMESTAMPDIFF(SECOND, s.started_at, s.ended_at), 0) AS session_duration_seconds,
      d.device_type,
      d.operating_system,
      d.browser,
      COUNT(e.event_id) AS events_count,
      COUNT(DISTINCT e.video_id) AS unique_videos,
      SUM(CASE WHEN e.event_type = 'play' THEN 1 ELSE 0 END) AS plays,
      SUM(CASE WHEN e.event_type IN ('like', 'share', 'comment') THEN 1 ELSE 0 END) AS engagement_actions
    FROM sessions s
    JOIN devices d ON d.device_id = s.device_id
    LEFT JOIN events e ON e.session_id = s.session_id
    WHERE s.user_id = @user_id
      AND s.started_at >= @start_ts
      AND s.started_at < @end_ts
    GROUP BY
      s.session_id,
      s.started_at,
      s.ended_at,
      d.device_type,
      d.operating_system,
      d.browser
  ) ranked
) paged
WHERE paged.rn BETWEEN @row_start AND @row_end
ORDER BY paged.rn;

SET @q_end = NOW(6);

SELECT
  'TBL-07' AS query_id,
  ROUND(TIMESTAMPDIFF(MICROSECOND, @q_start, @q_end) / 1000, 3) AS query_time_ms,
  UTC_TIMESTAMP(6) AS generated_at_utc,
  @user_id AS applied_user_id,
  @limit AS applied_limit,
  @offset AS applied_offset;

COMMIT;
