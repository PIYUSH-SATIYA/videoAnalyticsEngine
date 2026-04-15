import { useMemo, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { BarChart } from '@mui/x-charts/BarChart';
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip';
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

const heatmapColorRamp = ['#f3f8ff', '#dcecff', '#b7d9ff', '#85beff', '#4f9af5', '#2f6f67'];

export function ExplorerPage() {
  const { filters } = useGlobalFilters();
  const [report, setReport] = useState<ExplorerReport>('eventMix');
  const [genreId, setGenreId] = useState('');
  const [userId, setUserId] = useState('42');
  const [videoId, setVideoId] = useState('120');
  const [heatmapMetric, setHeatmapMetric] = useState<'watch_time_seconds' | 'sessions_count'>(
    'watch_time_seconds'
  );

  const active = useApiData(
    () => {
      const commonParams = {
        ...(filters.startTs ? { start_ts: filters.startTs } : {}),
        ...(filters.endTs ? { end_ts: filters.endTs } : {}),
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
          ...(genreId.trim() ? { genre_id: Number(genreId.trim()) } : {})
        });
      }

      if (report === 'heatmap') {
        return analyticsApi.getHourlyConsumptionHeatmap({
          ...(filters.startTs ? { start_ts: filters.startTs } : {}),
          ...(filters.endTs ? { end_ts: filters.endTs } : {}),
          metric: heatmapMetric,
          ...(filters.deviceType ? { device_type: filters.deviceType } : {})
        });
      }

      if (report === 'userEventMix') {
        return analyticsApi.getUserEventMixTrend({
          ...commonParams,
          user_id: Number(userId || 42)
        });
      }

      return analyticsApi.getVideoPerformanceTrend({
        ...commonParams,
        video_id: Number(videoId || 120)
      });
    },
    [
      report,
      filters.startTs,
      filters.endTs,
      filters.timeGrain,
      filters.deviceType,
      genreId,
      heatmapMetric,
      userId,
      videoId
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

  const chartPanel = buildChart(report, rows, filters.timeGrain, heatmapMetric);

  return (
    <section className="surface-card p-4 sm:p-5">
      <div className="panel-heading mb-3">
        <div>
          <h2 className="text-lg font-semibold">Data Explorer</h2>
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

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {report === 'genreTrend' ? (
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
        ) : null}

        {report === 'userEventMix' ? (
          <label className="form-control w-full">
            <span className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              User ID (Local)
            </span>
            <input
              type="text"
              className="input input-bordered h-10 w-full bg-[var(--bg-surface)] text-[var(--text-primary)]"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. 42"
            />
          </label>
        ) : null}

        {report === 'videoPerformance' ? (
          <label className="form-control w-full">
            <span className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              Video ID (Local)
            </span>
            <input
              type="text"
              className="input input-bordered h-10 w-full bg-[var(--bg-surface)] text-[var(--text-primary)]"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="e.g. 120"
            />
          </label>
        ) : null}

        {report === 'heatmap' ? (
          <label className="form-control w-full">
            <span className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              Heatmap Metric (Local)
            </span>
            <select
              className="select select-bordered h-10 w-full bg-[var(--bg-surface)] text-[var(--text-primary)]"
              value={heatmapMetric}
              onChange={(e) => setHeatmapMetric(e.target.value as 'watch_time_seconds' | 'sessions_count')}
            >
              <option value="watch_time_seconds">Watch Time</option>
              <option value="sessions_count">Sessions Count</option>
            </select>
          </label>
        ) : null}
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
          <div className="h-[360px] overflow-visible">{chartPanel}</div>
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
    const values = rows.map((row) => Number(row.metric_value ?? 0)).filter((v) => Number.isFinite(v));
    const min = values.length > 0 ? Math.min(...values) : 0;
    const max = values.length > 0 ? Math.max(...values) : 0;
    const spread = max - min;
    const seriesBuckets = heatmapColorRamp.map(() => [] as Array<{ x: number; y: number; id: number }>);

    rows.forEach((row) => {
      const value = Number(row.metric_value ?? 0);
      const ratio = spread <= 0 || !Number.isFinite(value) ? 0.5 : (value - min) / spread;
      const idx = Math.min(heatmapColorRamp.length - 1, Math.max(0, Math.floor(ratio * heatmapColorRamp.length)));

      seriesBuckets[idx]?.push({
        x: Number(row.hour_of_day ?? 0),
        y: Number(row.day_of_week ?? 0),
        id: Number.isFinite(value) ? value : 0
      });
    });

    const scatterSeries = seriesBuckets
      .map((bucket, idx) => ({
        label: `${heatmapMetric === 'sessions_count' ? 'Sessions' : 'Watch Time'} bucket ${idx + 1}`,
        data: bucket,
        markerSize: 10,
        color: heatmapColorRamp[idx]
      }))
      .filter((item) => item.data.length > 0);

    return (
      <ScatterChart
        series={scatterSeries}
        xAxis={[{ min: 0, max: 23, label: 'Hour of Day' }]}
        yAxis={[{ min: 1, max: 7, label: 'Day of Week' }]}
      />
    );
  }

  if (report === 'eventMix' || report === 'userEventMix') {
    const periodOrder = Array.from(new Set(rows.map((row) => String(row.period_start ?? '')).filter(Boolean))).sort();
    const eventTypes = Array.from(new Set(rows.map((row) => String(row.event_type ?? '')).filter(Boolean))).sort();

    const valueMap = new Map<string, number>();
    rows.forEach((row) => {
      const period = String(row.period_start ?? '');
      const eventType = String(row.event_type ?? '');
      const count = Number(row.event_count ?? 0);
      if (!period || !eventType || !Number.isFinite(count)) {
        return;
      }
      valueMap.set(`${period}__${eventType}`, count);
    });

    const labels = periodOrder.map((period) => formatPeriodLabel(period, timeGrain));
    const series = eventTypes.map((eventType, index) => ({
      label: eventType,
      stack: 'events',
      data: periodOrder.map((period) => valueMap.get(`${period}__${eventType}`) ?? 0),
      color: ['#2f6f67', '#4d5f5c', '#7a8f59', '#8e6f4d', '#5a7fb0', '#9a5f7a', '#b07a3f', '#6c8f8c'][
        index % 8
      ]
    }));

    return (
      <BarChart
        xAxis={[{ data: labels, scaleType: 'band' }]}
        yAxis={[{ valueFormatter: (v: number) => compactNumber(Number(v)) }]}
        series={series}
        slotProps={{ tooltip: { trigger: 'axis' } }}
        slots={{ tooltip: ChartsTooltip }}
      />
    );
  }

  if (report === 'sessionTrend') {
    const periodOrder = Array.from(new Set(rows.map((row) => String(row.period_start ?? '')).filter(Boolean))).sort();
    const ageBuckets = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'].filter((bucket) =>
      rows.some((row) => String(row.age_bucket ?? '') === bucket)
    );

    const valueMap = new Map<string, number>();
    rows.forEach((row) => {
      const period = String(row.period_start ?? '');
      const ageBucket = String(row.age_bucket ?? '');
      const value = Number(row.avg_session_duration_seconds ?? 0);
      if (!period || !ageBucket || !Number.isFinite(value)) {
        return;
      }
      valueMap.set(`${period}__${ageBucket}`, value);
    });

    const labels = periodOrder.map((period) => formatPeriodLabel(period, timeGrain));
    const series = ageBuckets.map((ageBucket, index) => ({
      label: ageBucket,
      data: periodOrder.map((period) => valueMap.get(`${period}__${ageBucket}`) ?? null),
      color: ['#2f6f67', '#4d5f5c', '#7a8f59', '#8e6f4d', '#5a7fb0', '#9a5f7a'][index % 6],
      showMark: false
    }));

    return (
      <LineChart
        xAxis={[{ data: labels, scaleType: 'point' }]}
        yAxis={[{ valueFormatter: (v: number) => `${compactNumber(Number(v))}s` }]}
        series={series}
        axisHighlight={{ x: 'line', y: 'line' }}
        slotProps={{ tooltip: { trigger: 'axis' } }}
        slots={{ tooltip: ChartsTooltip }}
      />
    );
  }

  if (report === 'genreTrend') {
    const periodOrder = Array.from(new Set(rows.map((row) => String(row.period_start ?? '')).filter(Boolean))).sort();
    const totalsByGenre = new Map<string, number>();
    rows.forEach((row) => {
      const genreName = String(row.genre_name ?? '');
      const value = Number(row.watch_time_seconds ?? 0);
      if (!genreName || !Number.isFinite(value)) {
        return;
      }
      totalsByGenre.set(genreName, (totalsByGenre.get(genreName) ?? 0) + value);
    });

    const topGenres = Array.from(totalsByGenre.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => name);

    const valueMap = new Map<string, number>();
    rows.forEach((row) => {
      const period = String(row.period_start ?? '');
      const genreName = String(row.genre_name ?? '');
      const value = Number(row.watch_time_seconds ?? 0);
      if (!period || !genreName || !Number.isFinite(value) || !topGenres.includes(genreName)) {
        return;
      }
      valueMap.set(`${period}__${genreName}`, value);
    });

    const labels = periodOrder.map((period) => formatPeriodLabel(period, timeGrain));
    const series = topGenres.map((genreName, index) => ({
      label: genreName,
      data: periodOrder.map((period) => valueMap.get(`${period}__${genreName}`) ?? null),
      color: ['#7a8f59', '#2f6f67', '#4d5f5c', '#8e6f4d', '#5a7fb0', '#9a5f7a'][index % 6],
      showMark: false
    }));

    return (
      <LineChart
        xAxis={[{ data: labels, scaleType: 'point' }]}
        yAxis={[{ valueFormatter: (v: number) => `${compactNumber(Number(v))}s` }]}
        series={series}
        axisHighlight={{ x: 'line', y: 'line' }}
        slotProps={{ tooltip: { trigger: 'axis' } }}
        slots={{ tooltip: ChartsTooltip }}
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
      axisHighlight={{ x: 'line', y: 'line' }}
      slotProps={{ tooltip: { trigger: 'axis' } }}
      slots={{ tooltip: ChartsTooltip }}
    />
  );
}
