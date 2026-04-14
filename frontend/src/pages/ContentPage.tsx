import { useMemo, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { analyticsApi } from '../lib/analytics';
import { useApiData } from '../hooks/useApiData';
import { QueryTimeBadge } from '../components/QueryTimeBadge';
import { useGlobalFilters } from '../context/GlobalFiltersContext';

export function ContentPage() {
  const { filters } = useGlobalFilters();
  const [genreId, setGenreId] = useState('');

  const data = useApiData(
    () =>
      analyticsApi.getVideoPerformanceByGenre({
        ...(filters.startTs ? { start_ts: filters.startTs } : {}),
        ...(filters.endTs ? { end_ts: filters.endTs } : {}),
        limit: 15,
        offset: 0,
        ...(genreId ? { genre_id: Number(genreId) } : {}),
        ...(filters.deviceType ? { device_type_csv: filters.deviceType } : {})
      }),
    [filters.startTs, filters.endTs, filters.deviceType, genreId]
  );

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: 'video_id', headerName: 'Video ID', width: 100 },
      { field: 'title', headerName: 'Title', minWidth: 180, flex: 1 },
      { field: 'genre_name', headerName: 'Genre', width: 120 },
      { field: 'views', headerName: 'Views', width: 110 },
      { field: 'watch_time_seconds', headerName: 'Watch Time (s)', width: 150 },
      { field: 'engagement_actions', headerName: 'Engagement', width: 130 },
      { field: 'exit_events', headerName: 'Exits', width: 100 }
    ],
    []
  );

  return (
    <section className="surface-card p-4 sm:p-5">
      <div className="panel-heading mb-3">
        <div>
          <h2 className="text-lg font-semibold">Content Intelligence</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Video performance by genre with engagement and exit metrics.
          </p>
        </div>
        <QueryTimeBadge queryTimeMs={data.meta?.queryTimeMs} />
      </div>

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="form-control w-full">
          <span className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Genre ID (Local)
          </span>
          <input
            type="text"
            className="input input-bordered h-10 w-full bg-[var(--bg-surface)] text-[var(--text-primary)]"
            value={genreId}
            onChange={(e) => setGenreId(e.target.value)}
            placeholder="All genres"
          />
        </label>
      </div>

      {data.error ? (
        <p className="text-sm text-[var(--error)]">{data.error}</p>
      ) : (
        <div className="h-[560px]">
          <DataGrid
            rows={(data.data ?? []).map((row, index) => ({ id: index, ...row }))}
            columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 20, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          />
        </div>
      )}
    </section>
  );
}
