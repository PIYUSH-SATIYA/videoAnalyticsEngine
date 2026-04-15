import { useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip';
import { LineChart } from '@mui/x-charts/LineChart';
import { analyticsApi } from '../lib/analytics';
import { useApiData } from '../hooks/useApiData';
import { QueryTimeBadge } from '../components/QueryTimeBadge';
import { useGlobalFilters } from '../context/GlobalFiltersContext';
import { compactNumber, formatPeriodLabel } from '../lib/chartFormat';

export function OverviewPage() {
  const { filters } = useGlobalFilters();

  const watch = useApiData(() => analyticsApi.getKpiWatchTimeToday(), []);
  const session = useApiData(() => analyticsApi.getKpiAvgSessionDuration(), []);
  const engagement = useApiData(() => analyticsApi.getKpiEngagementRate(), []);
  const binge = useApiData(() => analyticsApi.getKpiBingeUsers(), []);

  const chart = useApiData(
    () =>
      analyticsApi.getSessionDurationTrend({
        ...(filters.startTs ? { start_ts: filters.startTs } : {}),
        ...(filters.endTs ? { end_ts: filters.endTs } : {}),
        time_grain: filters.timeGrain,
        ...(filters.deviceType ? { device_type: filters.deviceType } : {})
      }),
    [filters.startTs, filters.endTs, filters.timeGrain, filters.deviceType]
  );

  const table = useApiData(
    () =>
      analyticsApi.getTopBingeWatchers({
        ...(filters.startTs ? { start_ts: filters.startTs } : {}),
        ...(filters.endTs ? { end_ts: filters.endTs } : {}),
        limit: 10,
        offset: 0,
        sort_by: 'watch_time_seconds',
        sort_order: 'desc',
        ...(filters.deviceType ? { device_type_csv: filters.deviceType } : {})
      }),
    [filters.startTs, filters.endTs, filters.deviceType]
  );

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'user_id', headerName: 'User ID', width: 110 },
      { field: 'sessions_count', headerName: 'Sessions', width: 120 },
      { field: 'watch_time_seconds', headerName: 'Watch Time (s)', width: 150 },
      { field: 'avg_session_duration_seconds', headerName: 'Avg Session (s)', width: 150 },
      { field: 'device_mix_json', headerName: 'Device Mix', flex: 1, minWidth: 170 }
    ],
    []
  );

  const chartRows = (chart.data ?? []) as Array<Record<string, unknown>>;
  const grouped = chartRows.reduce<Record<string, { total: number; count: number }>>((acc, row) => {
    const period = String(row.period_start ?? '');
    const val = Number(row.avg_session_duration_seconds ?? 0);
    if (!period || !Number.isFinite(val)) {
      return acc;
    }

    if (!acc[period]) {
      acc[period] = { total: 0, count: 0 };
    }

    acc[period].total += val;
    acc[period].count += 1;
    return acc;
  }, {});

  const xLabels = Object.keys(grouped).sort();
  const yValues = xLabels.map((period) => {
    const item = grouped[period];
    return item.count > 0 ? item.total / item.count : 0;
  });

  const chartTitle = filters.deviceType
    ? `Session duration trend (${filters.deviceType})`
    : 'Session duration trend (all devices)';

  const overviewErrors = [watch.error, session.error, engagement.error, binge.error]
    .filter(Boolean)
    .join(' | ');

  return (
    <div className="space-y-4">
      <section className="surface-card p-4 sm:p-5">
        <div className="panel-heading mb-4">
          <div>
            <h2 className="text-xl font-semibold">Overview</h2>
          </div>
          <span className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-2.5 py-1 text-xs text-[var(--text-secondary)]">
            Updated live from /api/v1/analytics
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Binge watchers (7d)"
            value={String(
              Number((binge.data?.[0] as { binge_user_count?: number | string } | undefined)?.binge_user_count ?? 0)
            )}
            metaTime={binge.meta?.queryTimeMs}
            loading={binge.isLoading}
          />
          <KpiCard
            title="Watch time today"
            value={`${Number((watch.data?.[0] as { watch_time_hours?: number | string } | undefined)?.watch_time_hours ?? 0).toFixed(2)} h`}
            metaTime={watch.meta?.queryTimeMs}
            loading={watch.isLoading}
          />
          <KpiCard
            title="Avg session duration"
            value={`${Number((session.data?.[0] as { avg_session_duration_seconds?: number | string } | undefined)?.avg_session_duration_seconds ?? 0).toFixed(1)} s`}
            metaTime={session.meta?.queryTimeMs}
            loading={session.isLoading}
          />
          <KpiCard
            title="Engagement / 100 views"
            value={String(
              Number(
                (engagement.data?.[0] as { engagement_per_100_views?: number | string } | undefined)
                  ?.engagement_per_100_views ?? 0
              ).toFixed(2)
            )}
            metaTime={engagement.meta?.queryTimeMs}
            loading={engagement.isLoading}
          />
        </div>

        {overviewErrors ? (
          <p className="mt-3 text-sm text-[var(--error)]">{overviewErrors}</p>
        ) : null}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <article className="surface-card p-4 sm:p-5 xl:col-span-3">
          <div className="panel-heading mb-3">
            <h3 className="text-base font-semibold">{chartTitle}</h3>
            <QueryTimeBadge queryTimeMs={chart.meta?.queryTimeMs} />
          </div>
          {chart.error ? (
            <p className="text-sm text-[var(--error)]">{chart.error}</p>
          ) : (
            <LineChart
              xAxis={[{ data: xLabels, scaleType: 'point' }]}
              yAxis={[{ valueFormatter: (v: number) => `${compactNumber(Number(v))}s` }]}
              series={[{ data: yValues, label: 'Avg session (s)', color: '#2f6f67' }]}
              axisHighlight={{ x: 'line', y: 'line' }}
              slotProps={{ tooltip: { trigger: 'axis' } }}
              slots={{ tooltip: ChartsTooltip }}
              height={300}
              margin={{ top: 20, right: 20, bottom: 50, left: 45 }}
            />
          )}
          <p className="mt-2 text-xs text-[var(--text-tertiary)]">
            {xLabels.length > 0
              ? `Range starts ${formatPeriodLabel(xLabels[0], filters.timeGrain)} and ends ${formatPeriodLabel(
                  xLabels[xLabels.length - 1],
                  filters.timeGrain
                )}.`
              : 'No trend data for selected filters.'}
          </p>
        </article>

        <article className="surface-card p-4 sm:p-5 xl:col-span-2">
          <div className="panel-heading mb-3">
            <h3 className="text-base font-semibold">Top binge watchers</h3>
            <QueryTimeBadge queryTimeMs={table.meta?.queryTimeMs} />
          </div>
          {table.error ? (
            <p className="text-sm text-[var(--error)]">{table.error}</p>
          ) : (
            <div className="h-[360px]">
              <DataGrid
                rows={(table.data ?? []).map((row, index) => ({ id: index, ...row }))}
                columns={columns}
                disableRowSelectionOnClick
                hideFooter
                sx={{
                  border: 0,
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f6f6f5'
                  }
                }}
              />
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

function KpiCard({
  title,
  value,
  metaTime,
  loading
}: {
  title: string;
  value: string;
  metaTime?: number;
  loading: boolean;
}) {
  return (
    <article className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-3.5">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)]">{title}</h3>
        <QueryTimeBadge queryTimeMs={metaTime} />
      </div>
      <p className="text-2xl font-semibold tracking-tight">{loading ? '...' : value}</p>
    </article>
  );
}
