import { useGlobalFilters } from '../context/GlobalFiltersContext';
import { useEffect, useState } from 'react';

export function GlobalFiltersBar() {
  const { filters, setFilters } = useGlobalFilters();
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const applyFilters = () => {
    setFilters(draft);
  };

  const resetFilters = () => {
    const reset = {
      startTs: '2026-03-01 00:00:00',
      endTs: '2026-04-01 00:00:00',
      deviceType: '',
      genreId: '',
      userId: '42',
      videoId: '120',
      heatmapMetric: 'watch_time_seconds' as const,
      timeGrain: 'day' as const
    };
    setDraft(reset);
    setFilters(reset);
  };

  return (
    <div className="surface-card p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Global Filters</h3>
        <span className="text-xs text-[var(--text-tertiary)]">Applied across all pages</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-8">
        <label className="form-control w-full">
          <span className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Start Time
          </span>
          <input
            type="text"
            className="input input-bordered h-10 w-full bg-[var(--bg-surface)] text-[var(--text-primary)]"
            value={draft.startTs}
            onChange={(e) => setDraft((prev) => ({ ...prev, startTs: e.target.value }))}
            placeholder="YYYY-MM-DD HH:mm:ss"
          />
        </label>

        <label className="form-control w-full">
          <span className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            End Time
          </span>
          <input
            type="text"
            className="input input-bordered h-10 w-full bg-[var(--bg-surface)] text-[var(--text-primary)]"
            value={draft.endTs}
            onChange={(e) => setDraft((prev) => ({ ...prev, endTs: e.target.value }))}
            placeholder="YYYY-MM-DD HH:mm:ss"
          />
        </label>

        <label className="form-control w-full">
          <span className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Device Type
          </span>
          <select
            className="select select-bordered h-10 w-full bg-[var(--bg-surface)] text-[var(--text-primary)]"
            value={draft.deviceType}
            onChange={(e) => setDraft((prev) => ({ ...prev, deviceType: e.target.value }))}
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
            value={draft.timeGrain}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, timeGrain: e.target.value as 'day' | 'week' | 'month' }))
            }
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </label>

        <label className="form-control w-full">
          <span className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Genre ID
          </span>
          <input
            type="text"
            className="input input-bordered h-10 w-full bg-[var(--bg-surface)] text-[var(--text-primary)]"
            value={draft.genreId}
            onChange={(e) => setDraft((prev) => ({ ...prev, genreId: e.target.value }))}
            placeholder="e.g. 1"
          />
        </label>

        <label className="form-control w-full">
          <span className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            User ID
          </span>
          <input
            type="text"
            className="input input-bordered h-10 w-full bg-[var(--bg-surface)] text-[var(--text-primary)]"
            value={draft.userId}
            onChange={(e) => setDraft((prev) => ({ ...prev, userId: e.target.value }))}
            placeholder="e.g. 42"
          />
        </label>

        <label className="form-control w-full">
          <span className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Video ID
          </span>
          <input
            type="text"
            className="input input-bordered h-10 w-full bg-[var(--bg-surface)] text-[var(--text-primary)]"
            value={draft.videoId}
            onChange={(e) => setDraft((prev) => ({ ...prev, videoId: e.target.value }))}
            placeholder="e.g. 120"
          />
        </label>

        <label className="form-control w-full">
          <span className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Heatmap Metric
          </span>
          <select
            className="select select-bordered h-10 w-full bg-[var(--bg-surface)] text-[var(--text-primary)]"
            value={draft.heatmapMetric}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                heatmapMetric: e.target.value as 'watch_time_seconds' | 'sessions_count'
              }))
            }
          >
            <option value="watch_time_seconds">Watch Time</option>
            <option value="sessions_count">Sessions Count</option>
          </select>
        </label>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button className="btn btn-sm btn-primary" onClick={applyFilters}>
          Apply Filters
        </button>
        <button className="btn btn-sm btn-outline" onClick={resetFilters}>
          Reset
        </button>
      </div>
    </div>
  );
}
