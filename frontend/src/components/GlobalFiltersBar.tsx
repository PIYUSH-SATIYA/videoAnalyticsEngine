import { useGlobalFilters } from '../context/GlobalFiltersContext';

const RESET_FILTERS = {
  startTs: '',
  endTs: '',
  deviceType: '',
  timeGrain: 'day' as const
};

export function GlobalFiltersBar() {
  const { filters, setFilters } = useGlobalFilters();

  const resetFilters = () => {
    setFilters(RESET_FILTERS);
  };

  const updateFilter = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
    setFilters({ [key]: value });
  };

  return (
    <div className="surface-card p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Global Filters</h3>
        <span className="text-xs text-[var(--text-tertiary)]">Applies instantly on change</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="form-control w-full">
          <span className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Start Time
          </span>
          <input
            type="text"
            className="input input-bordered h-10 w-full bg-[var(--bg-surface)] text-[var(--text-primary)]"
            value={filters.startTs}
            onChange={(e) => updateFilter('startTs', e.target.value)}
            placeholder="Auto (dataset-aware)"
          />
        </label>

        <label className="form-control w-full">
          <span className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            End Time
          </span>
          <input
            type="text"
            className="input input-bordered h-10 w-full bg-[var(--bg-surface)] text-[var(--text-primary)]"
            value={filters.endTs}
            onChange={(e) => updateFilter('endTs', e.target.value)}
            placeholder="Auto (dataset-aware)"
          />
        </label>

        <label className="form-control w-full">
          <span className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Device Type
          </span>
          <select
            className="select select-bordered h-10 w-full bg-[var(--bg-surface)] text-[var(--text-primary)]"
            value={filters.deviceType}
            onChange={(e) => updateFilter('deviceType', e.target.value)}
          >
            <option value="">All</option>
            <option value="mobile">Mobile</option>
            <option value="desktop">Desktop</option>
            <option value="tablet">Tablet</option>
            <option value="tv">TV</option>
          </select>
        </label>

        <label className="form-control w-full">
          <span className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Time Grain
          </span>
          <select
            className="select select-bordered h-10 w-full bg-[var(--bg-surface)] text-[var(--text-primary)]"
            value={filters.timeGrain}
            onChange={(e) => updateFilter('timeGrain', e.target.value as 'day' | 'week' | 'month')}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </label>

      </div>

      <div className="mt-3 flex items-center gap-2">
        <button className="btn btn-sm btn-outline" onClick={resetFilters}>
          Reset
        </button>
      </div>
    </div>
  );
}
