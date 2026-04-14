import { ReportDefinition } from '../analytics.types';

export const reportManifest: Record<string, ReportDefinition> = {
  'kpi-live-users': {
    key: 'kpi-live-users',
    sqlFile: 'kpi_01_live_users.sql',
    category: 'kpi',
    path: '/v1/analytics/kpis/live-users',
    allowedParams: []
  },
  'kpi-watch-time-today': {
    key: 'kpi-watch-time-today',
    sqlFile: 'kpi_02_watch_time_today.sql',
    category: 'kpi',
    path: '/v1/analytics/kpis/watch-time-today',
    allowedParams: []
  },
  'kpi-avg-session-duration-last-7d': {
    key: 'kpi-avg-session-duration-last-7d',
    sqlFile: 'kpi_03_avg_session_duration_last_7d.sql',
    category: 'kpi',
    path: '/v1/analytics/kpis/avg-session-duration-last-7d',
    allowedParams: []
  },
  'kpi-engagement-per-100-views-last-7d': {
    key: 'kpi-engagement-per-100-views-last-7d',
    sqlFile: 'kpi_04_engagement_per_100_views_last_7d.sql',
    category: 'kpi',
    path: '/v1/analytics/kpis/engagement-per-100-views-last-7d',
    allowedParams: []
  },
  'kpi-binge-users-last-7d': {
    key: 'kpi-binge-users-last-7d',
    sqlFile: 'kpi_05_binge_users_last_7d.sql',
    category: 'kpi',
    path: '/v1/analytics/kpis/binge-users-last-7d',
    allowedParams: []
  },
  'tbl-top-binge-watchers': {
    key: 'tbl-top-binge-watchers',
    sqlFile: 'tbl_01_top_binge_watchers.sql',
    category: 'table',
    path: '/v1/analytics/tables/top-binge-watchers',
    allowedParams: [
      'start_ts',
      'end_ts',
      'min_watch_seconds',
      'min_sessions',
      'age_min',
      'age_max',
      'device_type_csv',
      'limit',
      'offset',
      'sort_by',
      'sort_order'
    ]
  },
  'tbl-most-viewed-genres-by-age': {
    key: 'tbl-most-viewed-genres-by-age',
    sqlFile: 'tbl_02_most_viewed_genres_by_age.sql',
    category: 'table',
    path: '/v1/analytics/tables/most-viewed-genres-by-age',
    allowedParams: [
      'start_ts',
      'end_ts',
      'age_min',
      'age_max',
      'genre_id_csv',
      'device_type_csv',
      'limit',
      'offset'
    ]
  },
  'tbl-age-groups-watch-time-by-device': {
    key: 'tbl-age-groups-watch-time-by-device',
    sqlFile: 'tbl_03_age_groups_watch_time_by_device.sql',
    category: 'table',
    path: '/v1/analytics/tables/age-groups-watch-time-by-device',
    allowedParams: [
      'start_ts',
      'end_ts',
      'age_min',
      'age_max',
      'device_type_csv',
      'operating_system_csv',
      'limit',
      'offset',
      'sort_by',
      'sort_order'
    ]
  },
  'tbl-video-performance-by-genre': {
    key: 'tbl-video-performance-by-genre',
    sqlFile: 'tbl_04_video_performance_by_genre.sql',
    category: 'table',
    path: '/v1/analytics/tables/video-performance-by-genre',
    allowedParams: [
      'start_ts',
      'end_ts',
      'genre_id_csv',
      'device_type_csv',
      'min_events',
      'limit',
      'offset',
      'sort_by',
      'sort_order'
    ]
  },
  'tbl-device-quality-friction': {
    key: 'tbl-device-quality-friction',
    sqlFile: 'tbl_05_device_quality_friction.sql',
    category: 'table',
    path: '/v1/analytics/tables/device-quality-friction',
    allowedParams: [
      'start_ts',
      'end_ts',
      'device_type_csv',
      'operating_system_csv',
      'browser_csv',
      'genre_id_csv',
      'limit',
      'offset',
      'sort_by',
      'sort_order'
    ]
  },
  'tbl-time-spent-on-device': {
    key: 'tbl-time-spent-on-device',
    sqlFile: 'tbl_06_time_spent_on_device.sql',
    category: 'table',
    path: '/v1/analytics/tables/time-spent-on-device',
    allowedParams: [
      'start_ts',
      'end_ts',
      'age_min',
      'age_max',
      'device_type_csv',
      'genre_id_csv',
      'limit',
      'offset',
      'sort_by',
      'sort_order'
    ]
  },
  'tbl-user-session-timeline': {
    key: 'tbl-user-session-timeline',
    sqlFile: 'tbl_07_user_session_timeline.sql',
    category: 'table',
    path: '/v1/analytics/tables/user-session-timeline',
    allowedParams: ['user_id', 'start_ts', 'end_ts', 'limit', 'offset'],
    requiredParams: ['user_id']
  },
  'tbl-video-audience-split': {
    key: 'tbl-video-audience-split',
    sqlFile: 'tbl_08_video_audience_split.sql',
    category: 'table',
    path: '/v1/analytics/tables/video-audience-split',
    allowedParams: ['video_id', 'start_ts', 'end_ts', 'limit', 'offset'],
    requiredParams: ['video_id']
  },
  'grf-avg-session-duration-trend': {
    key: 'grf-avg-session-duration-trend',
    sqlFile: 'grf_01_avg_session_duration_trend.sql',
    category: 'graph',
    path: '/v1/analytics/graphs/avg-session-duration-trend',
    allowedParams: ['start_ts', 'end_ts', 'time_grain', 'device_type']
  },
  'grf-genre-watch-trend': {
    key: 'grf-genre-watch-trend',
    sqlFile: 'grf_02_genre_watch_trend.sql',
    category: 'graph',
    path: '/v1/analytics/graphs/genre-watch-trend',
    allowedParams: ['start_ts', 'end_ts', 'time_grain', 'genre_id']
  },
  'grf-event-mix-trend': {
    key: 'grf-event-mix-trend',
    sqlFile: 'grf_03_event_mix_trend.sql',
    category: 'graph',
    path: '/v1/analytics/graphs/event-mix-trend',
    allowedParams: ['start_ts', 'end_ts', 'time_grain', 'device_type']
  },
  'grf-hourly-consumption-heatmap': {
    key: 'grf-hourly-consumption-heatmap',
    sqlFile: 'grf_04_hourly_consumption_heatmap.sql',
    category: 'graph',
    path: '/v1/analytics/graphs/hourly-consumption-heatmap',
    allowedParams: ['start_ts', 'end_ts', 'device_type', 'metric']
  },
  'grf-user-event-mix-trend': {
    key: 'grf-user-event-mix-trend',
    sqlFile: 'grf_05_user_event_mix_trend.sql',
    category: 'graph',
    path: '/v1/analytics/graphs/user-event-mix-trend',
    allowedParams: ['user_id', 'start_ts', 'end_ts', 'time_grain', 'device_type'],
    requiredParams: ['user_id']
  },
  'grf-video-performance-trend': {
    key: 'grf-video-performance-trend',
    sqlFile: 'grf_06_video_performance_trend.sql',
    category: 'graph',
    path: '/v1/analytics/graphs/video-performance-trend',
    allowedParams: ['video_id', 'start_ts', 'end_ts', 'time_grain', 'device_type'],
    requiredParams: ['video_id']
  }
};
