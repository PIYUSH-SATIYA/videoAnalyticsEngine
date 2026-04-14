type QueryTimeBadgeProps = {
  queryTimeMs?: number;
};

export function QueryTimeBadge({ queryTimeMs }: QueryTimeBadgeProps) {
  const ms = typeof queryTimeMs === 'number' ? queryTimeMs : null;

  if (ms === null) {
    return <span className="timing-badge timing-medium">Runtime N/A</span>;
  }

  const cls = ms < 100 ? 'timing-fast' : ms <= 500 ? 'timing-medium' : 'timing-slow';
  return <span className={`timing-badge ${cls}`}>{`Query ${ms.toFixed(1)} ms`}</span>;
}
