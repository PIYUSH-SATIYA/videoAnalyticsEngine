-- Query ID: TBL-02
-- Purpose: Most viewed genres by age bucket
-- Requires migration 008 (users.dob, genre, video_genre)
-- Parameters (optional):
--   @start_ts, @end_ts, @age_min, @age_max, @genre_id_csv,
--   @device_type_csv, @limit, @offset

SET @q_start = NOW(6);

SET @start_ts = COALESCE(@start_ts, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 DAY));
SET @end_ts = COALESCE(@end_ts, UTC_TIMESTAMP());
SET @limit = LEAST(COALESCE(@limit, 25), 200);
SET @offset = COALESCE(@offset, 0);
SET @genre_id_csv = NULLIF(@genre_id_csv, '');
SET @device_type_csv = NULLIF(@device_type_csv, '');
SET @row_start = @offset + 1;
SET @row_end = @offset + @limit;

START TRANSACTION;

SELECT
  paged.age_bucket,
  paged.genre_id,
  paged.genre_name,
  paged.view_count,
  ROUND(paged.watch_time_seconds, 2) AS watch_time_seconds,
  paged.engagement_actions
FROM (
  SELECT
    ranked.*,
    ROW_NUMBER() OVER (ORDER BY ranked.view_count DESC, ranked.genre_id ASC) AS rn
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
      g.genre_id,
      g.name AS genre_name,
      COUNT(*) AS view_count,
      SUM(
        GREATEST(TIMESTAMPDIFF(SECOND, s.started_at, s.ended_at), 0)
        /
        NULLIF(vc.video_count_per_session, 0)
      ) AS watch_time_seconds,
      SUM(COALESCE(ea.engagement_actions, 0)) AS engagement_actions
    FROM (
      SELECT DISTINCT
        e.session_id,
        e.video_id
      FROM events e
      WHERE e.event_timestamp >= @start_ts
        AND e.event_timestamp < @end_ts
        AND e.event_type = 'play'
    ) pv
    JOIN sessions s ON s.session_id = pv.session_id
    JOIN users u ON u.user_id = s.user_id
    JOIN devices d ON d.device_id = s.device_id
    JOIN video_genre vg ON vg.video_id = pv.video_id
    JOIN genre g ON g.genre_id = vg.genre_id
    JOIN (
      SELECT
        p2.session_id,
        COUNT(*) AS video_count_per_session
      FROM (
        SELECT DISTINCT
          e2.session_id,
          e2.video_id
        FROM events e2
        WHERE e2.event_timestamp >= @start_ts
          AND e2.event_timestamp < @end_ts
          AND e2.event_type = 'play'
      ) p2
      GROUP BY p2.session_id
    ) vc ON vc.session_id = pv.session_id
    LEFT JOIN (
      SELECT
        e3.session_id,
        e3.video_id,
        SUM(CASE WHEN e3.event_type IN ('like', 'share', 'comment') THEN 1 ELSE 0 END) AS engagement_actions
      FROM events e3
      WHERE e3.event_timestamp >= @start_ts
        AND e3.event_timestamp < @end_ts
      GROUP BY e3.session_id, e3.video_id
    ) ea ON ea.session_id = pv.session_id
        AND ea.video_id = pv.video_id
    WHERE s.started_at >= @start_ts
      AND s.started_at < @end_ts
      AND s.ended_at IS NOT NULL
      AND (@age_min IS NULL OR TIMESTAMPDIFF(YEAR, u.dob, CURDATE()) >= @age_min)
      AND (@age_max IS NULL OR TIMESTAMPDIFF(YEAR, u.dob, CURDATE()) <= @age_max)
      AND (@genre_id_csv IS NULL OR FIND_IN_SET(CAST(g.genre_id AS CHAR), @genre_id_csv) > 0)
      AND (@device_type_csv IS NULL OR FIND_IN_SET(d.device_type, @device_type_csv) > 0)
    GROUP BY age_bucket, g.genre_id, g.name
  ) ranked
) paged
WHERE paged.rn BETWEEN @row_start AND @row_end
ORDER BY paged.rn;

SET @q_end = NOW(6);

SELECT
  'TBL-02' AS query_id,
  ROUND(TIMESTAMPDIFF(MICROSECOND, @q_start, @q_end) / 1000, 3) AS query_time_ms,
  UTC_TIMESTAMP(6) AS generated_at_utc,
  @limit AS applied_limit,
  @offset AS applied_offset;

COMMIT;
