import { useMemo, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { ScatterChart } from '@mui/x-charts/ScatterChart';
import { analyticsApi } from '../lib/analytics';
import { useApiData } from '../hooks/useApiData';
import { QueryTimeBadge } from '../components/QueryTimeBadge';
import { useGlobalFilters } from '../context/GlobalFiltersContext';
import { compactNumber, formatPeriodLabel } from '../lib/chartFormat';

type ExplorerReport =
  | 'eventMix'
  | 'sessionTrend'
  | 'genreTrend'
  | 'heatmap'
  | 'userEventMix'
  | 'videoPerformance';

export function ExplorerPage() {
  const { filters } = useGlobalFilters();
  const [report, setReport] = useState<ExplorerReport>('eventMix');

  const active = useApiData(
    () => {
      const commonParams = {
        start_ts: filters.startTs,
        end_ts: filters.endTs,
        time_grain: filters.timeGrain,
        ...(filters.deviceType ? { device_type: filters.deviceType } : {})
      };

      if (report === 'eventMix') {
        return analyticsApi.getEventMixTrend(commonParams);
      }

      if (report === 'sessionTrend') {
        return analyticsApi.getSessionDurationTrend(commonParams);
      }

      if (report === 'genreTrend') {
        return analyticsApi.getGenreWatchTrend({
          ...commonParams,
          ...(filters.genreId ? { genre_id: Number(filters.genreId) } : {})
        });
      }

      if (report === 'heatmap') {
        return analyticsApi.getHourlyConsumptionHeatmap({
          start_ts: filters.startTs,
          end_ts: filters.endTs,
          metric: filters.heatmapMetric,
          ...(filters.deviceType ? { device_type: filters.deviceType } : {})
        });
      }

      if (report === 'userEventMix') {
        return analyticsApi.getUserEventMixTrend({
          ...commonParams,
          user_id: Number(filters.userId || 42)
        });
      }

      return analyticsApi.getVideoPerformanceTrend({
        ...commonParams,
        video_id: Number(filters.videoId || 120)
      });
    },
    [
      report,
      filters.startTs,
      filters.endTs,
      filters.timeGrain,
      filters.deviceType,
      filters.genreId,
      filters.heatmapMetric,
      filters.userId,
      filters.videoId
    ]
  );

  const rows = (active.data ?? []) as Array<Record<string, unknown>>;

  const ageBuckets = Array.from(
    new Set(rows.map((row) => String(row.age_bucket ?? '')).filter(Boolean))
  );
  const singleBucketWarning =
    report === 'sessionTrend' && ageBuckets.length === 1 && ageBuckets[0] === '55+'
      ? 'Only age bucket 55+ detected. This usually means users.dob is not backfilled in DB.'
      : '';

  const columns = useMemo<GridColDef[]>(() => {
    if (report === 'eventMix' || report === 'userEventMix') {
      return [
        { field: 'period_start', headerName: 'Period', width: 170 },
        { field: 'event_type', headerName: 'Event Type', width: 140 },
        { field: 'event_count', headerName: 'Count', width: 110 }
      ];
    }

    if (report === 'sessionTrend') {
      return [
        { field: 'period_start', headerName: 'Period', width: 170 },
        { field: 'age_bucket', headerName: 'Age Bucket', width: 130 },
        { field: 'avg_session_duration_seconds', headerName: 'Avg Session (s)', width: 160 }
      ];
    }

    if (report === 'genreTrend') {
      return [
        { field: 'period_start', headerName: 'Period', width: 170 },
        { field: 'genre_name', headerName: 'Genre', width: 150 },
        { field: 'watch_time_seconds', headerName: 'Watch Time (s)', width: 160 }
      ];
    }

    if (report === 'heatmap') {
      return [
        { field: 'day_of_week', headerName: 'Day', width: 90 },
        { field: 'hour_of_day', headerName: 'Hour', width: 90 },
        { field: 'metric_value', headerName: 'Metric', width: 130 }
      ];
    }

    return [
      { field: 'period_start', headerName: 'Period', width: 170 },
      { field: 'unique_view_sessions', headerName: 'Sessions', width: 130 },
      { field: 'watch_time_seconds', headerName: 'Watch Time (s)', width: 150 },
      { field: 'engagement_actions', headerName: 'Engagement', width: 130 }
    ];
  }, [report]);

  const chartPanel = buildChart(report, rows, filters.timeGrain, filters.heatmapMetric);

  return (
    <section className="surface-card p-4 sm:p-5">
      <div className="panel-heading mb-3">
        <div>
          <h2 className="text-lg font-semibold">Data Explorer</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Multi-shape chart explorer backed by graph queries, plus raw result table.
          </p>
        </div>
        <QueryTimeBadge queryTimeMs={active.meta?.queryTimeMs} />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <ExplorerButton label="Event Mix" active={report === 'eventMix'} onClick={() => setReport('eventMix')} />
        <ExplorerButton
          label="Session Trend"
          active={report === 'sessionTrend'}
          onClick={() => setReport('sessionTrend')}
        />
        <ExplorerButton label="Genre Trend" active={report === 'genreTrend'} onClick={() => setReport('genreTrend')} />
        <ExplorerButton label="Heatmap" active={report === 'heatmap'} onClick={() => setReport('heatmap')} />
        <ExplorerButton
          label="User Event Mix"
          active={report === 'userEventMix'}
          onClick={() => setReport('userEventMix')}
        />
        <ExplorerButton
          label="Video Performance"
          active={report === 'videoPerformance'}
          onClick={() => setReport('videoPerformance')}
        />
      </div>

      {active.error ? <p className="text-sm text-[var(--error)]">{active.error}</p> : null}
      {singleBucketWarning ? (
        <p className="mt-1 text-sm text-[var(--warning)]">{singleBucketWarning}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <article className="surface-card p-3 xl:col-span-3">
          <div className="mb-2 text-xs text-[var(--text-tertiary)]">
            Chart view ({rows.length} rows, grain: {filters.timeGrain})
          </div>
          <div className="h-[360px]">{chartPanel}</div>
        </article>

        <article className="surface-card p-3 xl:col-span-2">
          <div className="mb-2 text-xs text-[var(--text-tertiary)]">Raw rows</div>
          <div className="h-[360px]">
            <DataGrid
              rows={rows.map((row, index) => ({ id: index, ...row }))}
              columns={columns}
              disableRowSelectionOnClick
              hideFooter
            />
          </div>
        </article>
      </div>
    </section>
  );
}

function ExplorerButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button className={`btn btn-sm ${active ? 'btn-primary' : 'btn-outline'}`} onClick={onClick}>
      {label}
    </button>
  );
}

function buildChart(
  report: ExplorerReport,
  rows: Array<Record<string, unknown>>,
  timeGrain: 'day' | 'week' | 'month',
  heatmapMetric: 'watch_time_seconds' | 'sessions_count'
) {
  if (rows.length === 0) {
    return <div className="text-sm text-[var(--text-tertiary)]">No data for selected filters.</div>;
  }

  if (report === 'heatmap') {
    const points = rows.map((row) => ({
      x: Number(row.hour_of_day ?? 0),
      y: Number(row.day_of_week ?? 0),
      id: Number(row.metric_value ?? 0)
    }));

    return (
      <ScatterChart
        series={[
          {
            label: heatmapMetric === 'sessions_count' ? 'Sessions Count' : 'Watch Time',
            data: points,
            markerSize: 8,
            color: '#2f6f67'
          }
        ]}
        xAxis={[{ min: 0, max: 23, label: 'Hour of Day' }]}
        yAxis={[{ min: 1, max: 7, label: 'Day of Week' }]}
      />
    );
  }

  if (report === 'eventMix' || report === 'userEventMix') {
    const labels = rows.map((row) => formatPeriodLabel(String(row.period_start ?? ''), timeGrain));
    const values = rows.map((row) => Number(row.event_count ?? 0));

    return (
      <BarChart
        xAxis={[{ data: labels, scaleType: 'band' }]}
        yAxis={[{ valueFormatter: (v: number) => compactNumber(Number(v)) }]}
        series={[{ data: values, label: 'Events', color: '#4d5f5c' }]}
      />
    );
  }

  if (report === 'sessionTrend') {
    const labels = rows.map((row) => formatPeriodLabel(String(row.period_start ?? ''), timeGrain));
    const values = rows.map((row) => Number(row.avg_session_duration_seconds ?? 0));

    return (
      <LineChart
        xAxis={[{ data: labels, scaleType: 'point' }]}
        yAxis={[{ valueFormatter: (v: number) => `${compactNumber(Number(v))}s` }]}
        series={[{ data: values, label: 'Avg Session', color: '#2f6f67' }]}
      />
    );
  }

  if (report === 'genreTrend') {
    const labels = rows.map((row) => formatPeriodLabel(String(row.period_start ?? ''), timeGrain));
    const values = rows.map((row) => Number(row.watch_time_seconds ?? 0));

    return (
      <LineChart
        xAxis={[{ data: labels, scaleType: 'point' }]}
        yAxis={[{ valueFormatter: (v: number) => `${compactNumber(Number(v))}s` }]}
        series={[{ data: values, label: 'Genre Watch Time', color: '#7a8f59' }]}
      />
    );
  }

  const labels = rows.map((row) => formatPeriodLabel(String(row.period_start ?? ''), timeGrain));
  const sessions = rows.map((row) => Number(row.unique_view_sessions ?? 0));
  const engagement = rows.map((row) => Number(row.engagement_actions ?? 0));

  return (
    <LineChart
      xAxis={[{ data: labels, scaleType: 'point' }]}
      yAxis={[{ valueFormatter: (v: number) => compactNumber(Number(v)) }]}
      series={[
        { data: sessions, label: 'Unique View Sessions', color: '#2f6f67' },
        { data: engagement, label: 'Engagement', color: '#7a8f59' }
      ]}
    />
  );
}
