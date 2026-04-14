export function formatPeriodLabel(value: string, grain: 'day' | 'week' | 'month') {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  if (grain === 'month') {
    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  }

  if (grain === 'week') {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
}
