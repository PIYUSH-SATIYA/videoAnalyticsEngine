import { createContext } from 'react';

export type GlobalFilters = {
  startTs: string;
  endTs: string;
  deviceType: string;
  timeGrain: 'day' | 'week' | 'month';
};

export type GlobalFiltersContextValue = {
  filters: GlobalFilters;
  setFilters: (next: Partial<GlobalFilters>) => void;
};

export const defaultGlobalFilters: GlobalFilters = {
  startTs: '',
  endTs: '',
  deviceType: '',
  timeGrain: 'day'
};

export const GlobalFiltersContext = createContext<GlobalFiltersContextValue | null>(null);
