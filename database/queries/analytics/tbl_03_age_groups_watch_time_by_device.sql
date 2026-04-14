-- Query ID: TBL-03
-- Purpose: Age groups spending most watch time by device
-- Parameters (optional):
--   @start_ts, @end_ts, @age_min, @age_max,
--   @device_type_csv, @operating_system_csv,
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
SET @operating_system_csv = NULLIF(@operating_system_csv, '');
SET @row_start = @offset + 1;
SET @row_end = @offset + @limit;

START TRANSACTION;

SELECT
  paged.age_bucket,
  paged.device_type,
  paged.users_count,
  ROUND(paged.watch_time_seconds, 2) AS watch_time_seconds,
  ROUND(paged.watch_time_seconds / NULLIF(paged.users_count, 0), 2) AS avg_watch_time_per_user
FROM (
  SELECT
    ranked.*,
    ROW_NUMBER() OVER (
      ORDER BY
        CASE WHEN @sort_by = 'users_count' AND @sort_order = 'asc' THEN ranked.users_count END ASC,
        CASE WHEN @sort_by = 'users_count' AND @sort_order = 'desc' THEN ranked.users_count END DESC,
        CASE WHEN @sort_by = 'avg_watch_time_per_user' AND @sort_order = 'asc' THEN (ranked.watch_time_seconds / NULLIF(ranked.users_count, 0)) END ASC,
        CASE WHEN @sort_by = 'avg_watch_time_per_user' AND @sort_order = 'desc' THEN (ranked.watch_time_seconds / NULLIF(ranked.users_count, 0)) END DESC,
        CASE WHEN @sort_by = 'watch_time_seconds' AND @sort_order = 'asc' THEN ranked.watch_time_seconds END ASC,
        CASE WHEN @sort_by = 'watch_time_seconds' AND @sort_order = 'desc' THEN ranked.watch_time_seconds END DESC,
        ranked.watch_time_seconds DESC,
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
      COUNT(DISTINCT s.user_id) AS users_count,
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
      AND (@operating_system_csv IS NULL OR FIND_IN_SET(d.operating_system, @operating_system_csv) > 0)
    GROUP BY age_bucket, d.device_type
  ) ranked
) paged
WHERE paged.rn BETWEEN @row_start AND @row_end
ORDER BY paged.rn;

SET @q_end = NOW(6);

SELECT
  'TBL-03' AS query_id,
  ROUND(TIMESTAMPDIFF(MICROSECOND, @q_start, @q_end) / 1000, 3) AS query_time_ms,
  UTC_TIMESTAMP(6) AS generated_at_utc,
  @limit AS applied_limit,
  @offset AS applied_offset;

COMMIT;
