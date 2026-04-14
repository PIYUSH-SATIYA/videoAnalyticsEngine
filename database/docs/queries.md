## Analytics Query Plan

This file defines the exact analytics questions, metric terms, output shape, and filters to implement next.

## Data assumptions

- Base schema: `users`, `videos`, `devices`, `sessions`, `events`.
- Extended dimensions (age + genre) require migration `008` (`users.dob`, `genre`, `video_genre`).
- Current event stream supports: `play`, `pause`, `seek`, `like`, `share`, `comment`, `quality_change`, `exit`.

## Shared filter contract (for SQL + future APIs)

- Endpoint base version: `/v1/analytics/*`.
- Multi-select encoding: repeated query params (`device_type=mobile&device_type=tv`, `genre_id=1&genre_id=5`).
- Time semantics:
  - `start_ts`, `end_ts` in ISO-8601 UTC.
  - default window for non-live queries: last 30 days.
  - window logic: `event_timestamp >= start_ts AND event_timestamp < end_ts`.
  - `time_grain`: `day|week|month` (graph queries).
- Segment filters:
  - `age_min`, `age_max` (requires `users.dob`).
  - `device_type` (`mobile|desktop|tablet|tv`).
  - `operating_system` (multi-select).
  - `browser` (multi-select).
  - `genre_id` (multi-select, requires migration `008`).
- Threshold filters: `min_watch_seconds`, `max_watch_seconds`, `min_sessions`, `min_events`.
- Table controls: `limit` (default 25, max 200), `offset` (default 0), `sort_by`, `sort_order` (`asc|desc`).
- KPI policy: KPI cards are global rollups and do not accept filters.
- Graph policy: each graph supports only 1 optional segment filter in addition to the time window.

## Metric terms (must remain consistent)

- `watch_time_seconds`: sum of non-negative session durations (`GREATEST(TIMESTAMPDIFF(SECOND, started_at, ended_at), 0)`), excluding rows with `ended_at IS NULL`.
- `raw_play_events`: count of events where `event_type = 'play'`.
- `unique_view_sessions`: count of distinct `(session_id, video_id)` with at least one `play`.
- `view_count`: reporting alias for `unique_view_sessions` unless explicitly labeled as raw plays.
- `engagement_actions`: count of events where `event_type IN ('like','share','comment')`.
- `live_user`: distinct user with `sessions.started_at <= NOW()` and `sessions.ended_at >= NOW()`; one user counted once even with multiple live sessions.
- `age_bucket`: fixed buckets `13-17`, `18-24`, `25-34`, `35-44`, `45-54`, `55+`.

## KPI queries

### KPI-01 Live users now
- Business question: how many users are currently active right now?
- Output: single number `live_users`.
- Filters: none.
- API-ready params: `GET /v1/analytics/kpi/live-users?...`.

### KPI-02 Watch time in period
- Business question: how much total watch time did we generate in a selected period?
- Output: `watch_time_seconds`, `watch_time_hours`.
- Filters: none (fixed window: current UTC day).
- API-ready params: `GET /v1/analytics/kpi/watch-time?...`.

### KPI-03 Average session duration
- Business question: are sessions getting longer or shorter?
- Output: `avg_session_duration_seconds`.
- Filters: none (fixed window: rolling last 7 days).
- API-ready params: `GET /v1/analytics/kpi/avg-session-duration?...`.

### KPI-04 Engagement actions per 100 views
- Business question: how engaging is content relative to views?
- Output: `engagement_per_100_views`, plus raw `engagement_actions`, `raw_play_events`, `unique_view_sessions`.
- Filters: none (fixed window: rolling last 7 days).
- API-ready params: `GET /v1/analytics/kpi/engagement-rate?...`.

### KPI-05 Binge watcher count
- Business question: how many users cross binge thresholds?
- Output: `binge_user_count`.
- Filters: none (fixed window: rolling last 7 days, thresholds fixed in query).
- API-ready params: `GET /v1/analytics/kpi/binge-users?...`.

## Tabular queries

### TBL-01 Top binge watchers (ranked users)
- Business question: who are the heaviest consumers in the selected period?
- Output columns: `user_id`, `age`, `sessions_count`, `watch_time_seconds`, `avg_session_duration_seconds`, `device_mix_json`.
- Filters: `start_ts`, `end_ts`, `min_watch_seconds`, `device_type`, `age_min/age_max`.
- Sort/paging: default `watch_time_seconds DESC, user_id ASC`; supports `limit/offset`.
- Drill-down key: `user_id` (future user detail page).

### TBL-02 Most viewed genres by age range
- Business question: which genres dominate specific age segments?
- Output columns: `age_bucket`, `genre_id`, `genre_name`, `view_count`, `watch_time_seconds`, `engagement_actions`.
- Filters: `start_ts`, `end_ts`, `age_min/age_max`, `genre_id`, `device_type`.
- Sort/paging: default `view_count DESC, genre_id ASC`, supports `limit/offset`.
- Requires: migration `008`.

### TBL-03 Age groups spending most time on device
- Business question: which age buckets consume the most watch time per device type?
- Output columns: `age_bucket`, `device_type`, `users_count`, `watch_time_seconds`, `avg_watch_time_per_user`.
- Filters: `start_ts`, `end_ts`, `device_type`, `operating_system`, `age_min/age_max`.
- Sort/paging: default `watch_time_seconds DESC, age_bucket ASC`.

### TBL-04 Video performance by genre
- Business question: which videos and genres drive both usage and engagement?
- Output columns: `video_id`, `title`, `genre_name`, `views`, `watch_time_seconds`, `engagement_actions`, `exit_events`.
- Filters: `start_ts`, `end_ts`, `genre_id`, `device_type`, `min_events`.
- Sort/paging: default `views DESC, video_id ASC`; alternate sort by `engagement_actions`.
- Drill-down key: `video_id` (future content detail page).

### TBL-05 Device quality friction table
- Business question: where are quality issues concentrated?
- Output columns: `device_type`, `operating_system`, `browser`, `quality_change_events`, `quality_change_per_100_views`.
- Filters: `start_ts`, `end_ts`, `device_type`, `operating_system`, `browser`, `genre_id`.
- Sort/paging: default `quality_change_events DESC, browser ASC`.

### TBL-06 Time spent on device
- Business question: how does watch time distribute across device categories?
- Output columns: `device_type`, `sessions_count`, `watch_time_seconds`, `watch_time_share_percent`.
- Filters: `start_ts`, `end_ts`, `device_type`, `age_min/age_max`, `genre_id`.
- Sort/paging: default `watch_time_seconds DESC, device_type ASC`.

### TBL-07 User session detail timeline
- Business question: what exact session-level behavior does one user show over time?
- Output columns: `session_id`, `started_at`, `ended_at`, `session_duration_seconds`, `device_type`, `operating_system`, `browser`, `events_count`, `unique_videos`, `plays`, `engagement_actions`.
- Filters: required `user_id`; optional `start_ts`, `end_ts`.
- Sort/paging: default `started_at DESC, session_id DESC`, supports `limit/offset`.

### TBL-08 Video audience split detail
- Business question: which audience cohorts and devices drive performance for one video?
- Output columns: `age_bucket`, `device_type`, `viewer_count`, `unique_view_sessions`, `watch_time_seconds`, `engagement_actions`, `exit_events`.
- Filters: required `video_id`; optional `start_ts`, `end_ts`.
- Sort/paging: default `unique_view_sessions DESC, age_bucket ASC`.

## Graph queries

### GRF-01 Average session duration trend by age bucket
- Visual: multi-line chart (`x = day/week`, `y = avg_session_duration_seconds`, one line per age bucket).
- Filters: `start_ts`, `end_ts`, optional `device_type`, `time_grain`.
- Use case: retention and engagement trend monitoring.

### GRF-02 Genre watch trend over time
- Visual: stacked area or multi-line (`x = day/week`, `y = watch_time_seconds`, split by genre).
- Filters: `start_ts`, `end_ts`, optional `genre_id`, `time_grain`.
- Requires: migration `008`.

### GRF-03 Event mix trend
- Visual: stacked bar (`x = day/week`, series = event types).
- Filters: `start_ts`, `end_ts`, optional `device_type`, `time_grain`.
- Use case: behavior-shift detection.

### GRF-04 Hour-of-day consumption heatmap
- Visual: heatmap (`x = hour`, `y = day_of_week`, value = watch_time_seconds or sessions_count).
- Filters: `start_ts`, `end_ts`, optional `device_type`.
- Use case: scheduling + peak load insight.

### GRF-05 User event mix trend (detail)
- Visual: stacked bar (`x = day/week`, series = event types) for one user.
- Filters: required `user_id`; optional `start_ts`, `end_ts`, `time_grain`, optional `device_type`.
- Use case: user-level behavior evolution.

### GRF-06 Video performance trend (detail)
- Visual: multi-line (`x = day/week`, `y = views/watch_time/engagement`) for one video.
- Filters: required `video_id`; optional `start_ts`, `end_ts`, `time_grain`, optional `device_type`.
- Use case: content trajectory and stability analysis.

## Standard response envelope (for all future endpoints)

- `data`: metric, table rows, or graph series payload.
- `applied_filters`: validated filters actually used in query execution.
- `meta`: `query_id`, `generated_at_utc`, `time_grain` (if graph), and pagination/sort metadata (if table).
- `warnings`: optional array for partial-data or fallback notices.

## Query runtime contract (for DBMS evaluation + frontend)

- Every analytics SQL script should return two result sets:
  1. primary data result,
  2. metadata result with `query_id`, `query_time_ms`, `generated_at_utc`.
- Runtime is measured in SQL using `NOW(6)` + `TIMESTAMPDIFF(MICROSECOND, ...)`.
- Backend should map metadata result into API response `meta.query_time_ms` so frontend can display runtime under each card/table/chart.

## Query implementation sequence (recommended)

1. Implement KPI queries first (`KPI-01` to `KPI-05`) for stable summary cards.
2. Implement tabular queries (`TBL-01` to `TBL-08`) with pagination and sorting.
3. Implement graph queries (`GRF-01` to `GRF-06`) with `time_grain` support.
4. Keep each query as a standalone SQL artifact so APIs can map one endpoint to one query.
