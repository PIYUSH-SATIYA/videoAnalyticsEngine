-- Read-only execution examples for analytics queries
-- NOTE: Do not run write SQL. All queries in this folder are SELECT-based with metadata result sets.

-- KPI examples (no filters)
SOURCE database/queries/analytics/kpi_01_live_users.sql;
SOURCE database/queries/analytics/kpi_02_watch_time_today.sql;
SOURCE database/queries/analytics/kpi_03_avg_session_duration_last_7d.sql;
SOURCE database/queries/analytics/kpi_04_engagement_per_100_views_last_7d.sql;
SOURCE database/queries/analytics/kpi_05_binge_users_last_7d.sql;

-- TBL-01 example
SET @start_ts = '2026-03-01 00:00:00';
SET @end_ts = '2026-04-01 00:00:00';
SET @min_watch_seconds = 3600;
SET @min_sessions = 2;
SET @age_min = 18;
SET @age_max = 44;
SET @device_type_csv = 'mobile,desktop';
SET @limit = 25;
SET @offset = 0;
SET @sort_by = 'watch_time_seconds';
SET @sort_order = 'desc';
SOURCE database/queries/analytics/tbl_01_top_binge_watchers.sql;

-- TBL-02 example
SET @start_ts = '2026-03-01 00:00:00';
SET @end_ts = '2026-04-01 00:00:00';
SET @age_min = 18;
SET @age_max = 34;
SET @genre_id_csv = '1,2,3';
SET @device_type_csv = 'mobile';
SET @limit = 25;
SET @offset = 0;
SOURCE database/queries/analytics/tbl_02_most_viewed_genres_by_age.sql;

-- TBL-03 example
SET @start_ts = '2026-03-01 00:00:00';
SET @end_ts = '2026-04-01 00:00:00';
SET @age_min = 18;
SET @age_max = 54;
SET @device_type_csv = 'mobile,desktop,tv';
SET @operating_system_csv = 'Android,iOS,Windows';
SET @sort_by = 'watch_time_seconds';
SET @sort_order = 'desc';
SET @limit = 25;
SET @offset = 0;
SOURCE database/queries/analytics/tbl_03_age_groups_watch_time_by_device.sql;

-- TBL-04 example
SET @start_ts = '2026-03-01 00:00:00';
SET @end_ts = '2026-04-01 00:00:00';
SET @genre_id_csv = '1,4,8';
SET @device_type_csv = 'mobile,desktop';
SET @min_events = 50;
SET @sort_by = 'views';
SET @sort_order = 'desc';
SET @limit = 25;
SET @offset = 0;
SOURCE database/queries/analytics/tbl_04_video_performance_by_genre.sql;

-- TBL-05 example
SET @start_ts = '2026-03-01 00:00:00';
SET @end_ts = '2026-04-01 00:00:00';
SET @device_type_csv = 'mobile,desktop';
SET @operating_system_csv = 'Android,iOS,Windows,macOS';
SET @browser_csv = 'Chrome,Safari,Edge,Firefox';
SET @genre_id_csv = '1,2';
SET @sort_by = 'quality_change_events';
SET @sort_order = 'desc';
SET @limit = 25;
SET @offset = 0;
SOURCE database/queries/analytics/tbl_05_device_quality_friction.sql;

-- TBL-06 example
SET @start_ts = '2026-03-01 00:00:00';
SET @end_ts = '2026-04-01 00:00:00';
SET @age_min = 18;
SET @age_max = 54;
SET @device_type_csv = 'mobile,desktop,tv';
SET @genre_id_csv = '2,3,9';
SET @sort_by = 'watch_time_seconds';
SET @sort_order = 'desc';
SET @limit = 25;
SET @offset = 0;
SOURCE database/queries/analytics/tbl_06_time_spent_on_device.sql;

-- TBL-07 example (required user_id)
SET @user_id = 42;
SET @start_ts = '2026-03-01 00:00:00';
SET @end_ts = '2026-04-01 00:00:00';
SET @limit = 50;
SET @offset = 0;
SOURCE database/queries/analytics/tbl_07_user_session_timeline.sql;

-- TBL-08 example (required video_id)
SET @video_id = 120;
SET @start_ts = '2026-03-01 00:00:00';
SET @end_ts = '2026-04-01 00:00:00';
SET @limit = 50;
SET @offset = 0;
SOURCE database/queries/analytics/tbl_08_video_audience_split.sql;

-- GRF-01 example (single optional segment filter: device_type)
SET @start_ts = '2026-03-01 00:00:00';
SET @end_ts = '2026-04-01 00:00:00';
SET @time_grain = 'day';
SET @device_type = 'mobile';
SOURCE database/queries/analytics/grf_01_avg_session_duration_trend.sql;

-- GRF-02 example (single optional segment filter: genre_id)
SET @start_ts = '2026-03-01 00:00:00';
SET @end_ts = '2026-04-01 00:00:00';
SET @time_grain = 'week';
SET @genre_id = 1;
SOURCE database/queries/analytics/grf_02_genre_watch_trend.sql;

-- GRF-03 example (single optional segment filter: device_type)
SET @start_ts = '2026-03-01 00:00:00';
SET @end_ts = '2026-04-01 00:00:00';
SET @time_grain = 'day';
SET @device_type = 'desktop';
SOURCE database/queries/analytics/grf_03_event_mix_trend.sql;

-- GRF-04 example (single optional segment filter: device_type)
SET @start_ts = '2026-03-01 00:00:00';
SET @end_ts = '2026-04-01 00:00:00';
SET @device_type = 'mobile';
SET @metric = 'watch_time_seconds';
SOURCE database/queries/analytics/grf_04_hourly_consumption_heatmap.sql;

-- GRF-05 example (required user_id)
SET @user_id = 42;
SET @start_ts = '2026-03-01 00:00:00';
SET @end_ts = '2026-04-01 00:00:00';
SET @time_grain = 'day';
SET @device_type = 'mobile';
SOURCE database/queries/analytics/grf_05_user_event_mix_trend.sql;

-- GRF-06 example (required video_id)
SET @video_id = 120;
SET @start_ts = '2026-03-01 00:00:00';
SET @end_ts = '2026-04-01 00:00:00';
SET @time_grain = 'week';
SET @device_type = 'desktop';
SOURCE database/queries/analytics/grf_06_video_performance_trend.sql;
