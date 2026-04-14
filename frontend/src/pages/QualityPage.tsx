import { useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { analyticsApi } from '../lib/analytics';
import { useApiData } from '../hooks/useApiData';
import { QueryTimeBadge } from '../components/QueryTimeBadge';
import { useGlobalFilters } from '../context/GlobalFiltersContext';

export function QualityPage() {
  const { filters } = useGlobalFilters();

  const data = useApiData(
    () =>
      analyticsApi.getDeviceQualityFriction({
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
      { field: 'device_type', headerName: 'Device', width: 110 },
      { field: 'operating_system', headerName: 'OS', width: 150 },
      { field: 'browser', headerName: 'Browser', width: 150 },
      { field: 'quality_change_events', headerName: 'Quality Changes', width: 160 },
      { field: 'quality_change_per_100_views', headerName: 'Per 100 Views', width: 150 }
    ],
    []
  );

  return (
    <section className="surface-card p-4 sm:p-5">
      <div className="panel-heading mb-3">
        <div>
          <h2 className="text-lg font-semibold">Quality & Device Friction</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Detect platform-level playback quality friction.
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
