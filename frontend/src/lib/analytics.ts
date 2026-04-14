import { getReport } from './http';

export const analyticsApi = {
  getKpiLiveUsers: () => getReport<Array<{ live_users: number }>>('/analytics/kpis/live-users'),
  getKpiWatchTimeToday: () =>
    getReport<Array<{ watch_time_seconds: number | string; watch_time_hours: number | string }>>(
      '/analytics/kpis/watch-time-today'
    ),
  getKpiAvgSessionDuration: () =>
    getReport<Array<{ avg_session_duration_seconds: number | string }>>(
      '/analytics/kpis/avg-session-duration-last-7d'
    ),
  getKpiEngagementRate: () =>
    getReport<
      Array<{
        engagement_actions: number | string;
        raw_play_events: number | string;
        unique_view_sessions: number | string;
        engagement_per_100_views: number | string;
      }>
    >('/analytics/kpis/engagement-per-100-views-last-7d'),
  getKpiBingeUsers: () =>
    getReport<Array<{ binge_user_count: number | string }>>('/analytics/kpis/binge-users-last-7d'),
  getTopBingeWatchers: (params: Record<string, unknown>) =>
    getReport<Array<Record<string, unknown>>>('/analytics/tables/top-binge-watchers', params),
  getVideoPerformanceByGenre: (params: Record<string, unknown>) =>
    getReport<Array<Record<string, unknown>>>('/analytics/tables/video-performance-by-genre', params),
  getAgeGroupsWatchTimeByDevice: (params: Record<string, unknown>) =>
    getReport<Array<Record<string, unknown>>>('/analytics/tables/age-groups-watch-time-by-device', params),
  getMostViewedGenresByAge: (params: Record<string, unknown>) =>
    getReport<Array<Record<string, unknown>>>('/analytics/tables/most-viewed-genres-by-age', params),
  getDeviceQualityFriction: (params: Record<string, unknown>) =>
    getReport<Array<Record<string, unknown>>>('/analytics/tables/device-quality-friction', params),
  getSessionDurationTrend: (params: Record<string, unknown>) =>
    getReport<Array<Record<string, unknown>>>('/analytics/graphs/avg-session-duration-trend', params),
  getGenreWatchTrend: (params: Record<string, unknown>) =>
    getReport<Array<Record<string, unknown>>>('/analytics/graphs/genre-watch-trend', params),
  getHourlyConsumptionHeatmap: (params: Record<string, unknown>) =>
    getReport<Array<Record<string, unknown>>>('/analytics/graphs/hourly-consumption-heatmap', params),
  getUserEventMixTrend: (params: Record<string, unknown>) =>
    getReport<Array<Record<string, unknown>>>('/analytics/graphs/user-event-mix-trend', params),
  getVideoPerformanceTrend: (params: Record<string, unknown>) =>
    getReport<Array<Record<string, unknown>>>('/analytics/graphs/video-performance-trend', params),
  getEventMixTrend: (params: Record<string, unknown>) =>
    getReport<Array<Record<string, unknown>>>('/analytics/graphs/event-mix-trend', params)
};
