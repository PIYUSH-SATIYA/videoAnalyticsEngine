import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { useMemo } from 'react';
import { analyticsApi } from '../lib/analytics';
import { useApiData } from '../hooks/useApiData';
import { QueryTimeBadge } from '../components/QueryTimeBadge';
import { useGlobalFilters } from '../context/GlobalFiltersContext';

export function AudiencePage() {
  const { filters } = useGlobalFilters();

  const data = useApiData(
    () =>
      analyticsApi.getAgeGroupsWatchTimeByDevice({
        start_ts: filters.startTs,
        end_ts: filters.endTs,
        limit: 20,
        offset: 0,
        ...(filters.deviceType ? { device_type_csv: filters.deviceType } : {})
      }),
    [filters.startTs, filters.endTs, filters.deviceType]
  );

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: 'age_bucket', headerName: 'Age Bucket', width: 130 },
      { field: 'device_type', headerName: 'Device', width: 110 },
      { field: 'users_count', headerName: 'Users', width: 110 },
      { field: 'watch_time_seconds', headerName: 'Watch Time (s)', width: 150 },
      { field: 'avg_watch_time_per_user', headerName: 'Avg / User (s)', width: 140 }
    ],
    []
  );

  return (
    <section className="surface-card p-4 sm:p-5">
      <div className="panel-heading mb-3">
        <div>
          <h2 className="text-lg font-semibold">Audience Cohorts</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Age-bucket watch behavior by device with query runtime badge.
          </p>
        </div>
        <QueryTimeBadge queryTimeMs={data.meta?.queryTimeMs} />
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
