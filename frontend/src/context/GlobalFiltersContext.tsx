import { useContext, useMemo, useState } from 'react';
import {
  defaultGlobalFilters,
  GlobalFiltersContext,
  type GlobalFiltersContextValue
} from './globalFiltersStore';

export function GlobalFiltersProvider({ children }: { children: React.ReactNode }) {
  const [filters, setState] = useState(defaultGlobalFilters);

  const value = useMemo<GlobalFiltersContextValue>(
    () => ({
      filters,
      setFilters: (next) => setState((prev) => ({ ...prev, ...next }))
    }),
    [filters]
  );

  return <GlobalFiltersContext.Provider value={value}>{children}</GlobalFiltersContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGlobalFilters() {
  const context = useContext(GlobalFiltersContext);
  if (!context) {
    throw new Error('useGlobalFilters must be used within GlobalFiltersProvider');
  }
  return context;
}
