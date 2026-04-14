# Query Validation Report (MariaDB)

Date: 2026-04-13
Database: `video_analytics`
User: `readonly_pbs` (SELECT-only)

## Scope
- Validated all analytics SQL files under `database/queries/analytics/` except helper docs/examples files.
- Executed read-only query suite from `database/queries/analytics/run_examples.sql`.
- Confirmed no SQL execution errors in run output.

## Permission Check
- Current grants for readonly user:
  - `GRANT SELECT ON video_analytics.* TO 'readonly_pbs'@'localhost'`
- Attempt to self-grant `SHOW VIEW` from readonly account failed (expected: insufficient privilege).
- Action required from admin/root if needed:
  - `GRANT SHOW VIEW ON video_analytics.* TO 'readonly_pbs'@'localhost';`

## Execution Status Summary

Source: `query_validation_summary.txt`

| SQL File | Status | Query ID | query_time_ms |
|---|---|---:|---:|
| grf_01_avg_session_duration_trend.sql | OK | GRF-01 | 210.878 |
| grf_02_genre_watch_trend.sql | OK | GRF-02 | 2.676 |
| grf_03_event_mix_trend.sql | OK | GRF-03 | 1.402 |
| grf_04_hourly_consumption_heatmap.sql | OK | GRF-04 | 27.511 |
| grf_05_user_event_mix_trend.sql | OK | GRF-05 | 0.976 |
| grf_06_video_performance_trend.sql | OK | GRF-06 | 1.753 |
| kpi_01_live_users.sql | OK | KPI-01 | 45.475 |
| kpi_02_watch_time_today.sql | OK | KPI-02 | 17.592 |
| kpi_03_avg_session_duration_last_7d.sql | OK | KPI-03 | 29.641 |
| kpi_04_engagement_per_100_views_last_7d.sql | OK | KPI-04 | 0.948 |
| kpi_05_binge_users_last_7d.sql | OK | KPI-05 | 32.134 |
| tbl_01_top_binge_watchers.sql | OK | TBL-01 | 109.050 |
| tbl_02_most_viewed_genres_by_age.sql | OK | TBL-02 | 2.177 |
| tbl_03_age_groups_watch_time_by_device.sql | OK | TBL-03 | 124.731 |
| tbl_04_video_performance_by_genre.sql | OK | TBL-04 | 2.282 |
| tbl_05_device_quality_friction.sql | OK | TBL-05 | 2.104 |
| tbl_06_time_spent_on_device.sql | OK | TBL-06 | 126.536 |
| tbl_07_user_session_timeline.sql | OK | TBL-07 | 0.832 |
| tbl_08_video_audience_split.sql | OK | TBL-08 | 1.736 |

## Full Suite Run Output
- Raw output: `query_validation_raw_output.txt`
- Errors file: `query_validation_errors.txt` (empty)

## Fixes Applied During Validation
- Updated all table queries (`TBL-01`..`TBL-08`) to avoid MariaDB-incompatible `LIMIT @var OFFSET @var` syntax.
- Replaced variable-based LIMIT/OFFSET with `ROW_NUMBER()` pagination and `WHERE rn BETWEEN @row_start AND @row_end`.

## Backend Runtime Metadata Check
- Backend endpoint smoke checks passed:
  - `/api/v1/health`
  - `/api/v1/analytics/kpis/live-users`
  - `/api/v1/analytics/tables/top-binge-watchers`
  - `/api/v1/analytics/tables/user-session-timeline`
- Response includes runtime metadata fields:
  - `meta.queryId`
  - `meta.queryTimeMs`
  - `meta.apiTimeMs`
  - `meta.rowCount`

## Notes
- KPI and some table outputs are zero/empty for selected windows in the seeded dataset, which is valid for current data distribution.
