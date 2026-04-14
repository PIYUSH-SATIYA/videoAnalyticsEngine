import { createContext } from 'react';

export type GlobalFilters = {
  startTs: string;
  endTs: string;
  deviceType: string;
  genreId: string;
  userId: string;
  videoId: string;
  heatmapMetric: 'watch_time_seconds' | 'sessions_count';
  timeGrain: 'day' | 'week' | 'month';
};

export type GlobalFiltersContextValue = {
  filters: GlobalFilters;
  setFilters: (next: Partial<GlobalFilters>) => void;
};

export const defaultGlobalFilters: GlobalFilters = {
  startTs: '2026-03-01 00:00:00',
  endTs: '2026-04-01 00:00:00',
  deviceType: '',
  genreId: '',
  userId: '42',
  videoId: '120',
  heatmapMetric: 'watch_time_seconds',
  timeGrain: 'day'
};

export const GlobalFiltersContext = createContext<GlobalFiltersContextValue | null>(null);
