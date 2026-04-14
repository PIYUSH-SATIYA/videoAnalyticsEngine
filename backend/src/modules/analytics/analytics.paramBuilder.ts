import { ValidationError } from '../../core/errors/AppError';
import { reportManifest } from './reports/reportManifest';

function toSqlLiteral(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function sanitizeValue(raw: unknown): string | number {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw;
  }

  if (typeof raw !== 'string') {
    throw new ValidationError('Unsupported query parameter type');
  }

  const numCandidate = Number(raw);
  if (!Number.isNaN(numCandidate) && raw.trim() !== '') {
    return numCandidate;
  }

  return raw;
}

function buildSetStatement(key: string, value: string | number): string {
  const sqlValue = typeof value === 'number' ? String(value) : toSqlLiteral(value);
  return `SET @${key} = ${sqlValue};`;
}

export function buildPrefixedSql(reportKey: string, query: Record<string, unknown>, sql: string): string {
  const report = reportManifest[reportKey];
  if (!report) {
    throw new ValidationError(`Unknown report key: ${reportKey}`);
  }

  const providedKeys = Object.keys(query);
  const unknownParams = providedKeys.filter((key) => !report.allowedParams.includes(key));
  if (unknownParams.length > 0) {
    throw new ValidationError(`Unknown query params: ${unknownParams.join(', ')}`);
  }

  const missingRequired = (report.requiredParams ?? []).filter((key) => query[key] == null);
  if (missingRequired.length > 0) {
    throw new ValidationError(`Missing required query params: ${missingRequired.join(', ')}`);
  }

  const setStatements: string[] = [];
  for (const [key, raw] of Object.entries(query)) {
    if (raw == null) {
      continue;
    }

    if (Array.isArray(raw)) {
      const csvValue = raw.join(',');
      setStatements.push(buildSetStatement(key, csvValue));
      continue;
    }

    const sanitized = sanitizeValue(raw);
    setStatements.push(buildSetStatement(key, sanitized));
  }

  return `${setStatements.join('\n')}\n${sql}`;
}
