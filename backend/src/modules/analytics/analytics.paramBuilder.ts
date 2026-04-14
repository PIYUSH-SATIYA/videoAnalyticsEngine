import { ValidationError } from '../../core/errors/AppError';
import { reportManifest } from './reports/reportManifest';

function toSqlLiteral(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function sanitizeScalarValue(raw: unknown): string | number {
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

function isCsvParam(paramName: string): boolean {
  return paramName.endsWith('_csv');
}

function normalizeCsvValue(raw: unknown): string {
  const values = Array.isArray(raw) ? raw : [raw];
  const normalized = values
    .map((item) => {
      if (typeof item === 'number' && Number.isFinite(item)) {
        return String(item);
      }

      if (typeof item === 'string') {
        return item.trim();
      }

      throw new ValidationError('Unsupported query parameter type');
    })
    .filter((item) => item.length > 0);

  return normalized.join(',');
}

function mergeRawValues(previous: unknown, next: unknown): unknown {
  const prevArray = Array.isArray(previous) ? previous : [previous];
  const nextArray = Array.isArray(next) ? next : [next];
  return [...prevArray, ...nextArray];
}

function resolveTargetParamKey(allowedParams: string[], incomingKey: string): string | null {
  if (allowedParams.includes(incomingKey)) {
    return incomingKey;
  }

  if (incomingKey.endsWith('_csv')) {
    const scalarKey = incomingKey.slice(0, -4);
    if (allowedParams.includes(scalarKey)) {
      return scalarKey;
    }
  }

  const csvKey = `${incomingKey}_csv`;
  if (allowedParams.includes(csvKey)) {
    return csvKey;
  }

  return null;
}

function buildSetStatement(key: string, value: string | number): string {
  const sqlValue = typeof value === 'number' ? String(value) : toSqlLiteral(value);
  return `SET @${key} = ${sqlValue};`;
}

export function buildPrefixedSql(
  reportKey: string,
  query: Record<string, unknown>,
  sql: string
): { sql: string; appliedParams: Record<string, string | number> } {
  const report = reportManifest[reportKey];
  if (!report) {
    throw new ValidationError(`Unknown report key: ${reportKey}`);
  }

  const normalizedQuery = new Map<string, unknown>();
  const unknownParams: string[] = [];

  for (const [incomingKey, rawValue] of Object.entries(query)) {
    const targetKey = resolveTargetParamKey(report.allowedParams, incomingKey);
    if (!targetKey) {
      unknownParams.push(incomingKey);
      continue;
    }

    if (normalizedQuery.has(targetKey)) {
      if (!isCsvParam(targetKey)) {
        throw new ValidationError(`Duplicate query param: ${incomingKey}`);
      }

      const merged = mergeRawValues(normalizedQuery.get(targetKey), rawValue);
      normalizedQuery.set(targetKey, merged);
      continue;
    }

    normalizedQuery.set(targetKey, rawValue);
  }

  if (unknownParams.length > 0) {
    throw new ValidationError(`Unknown query params: ${unknownParams.join(', ')}`);
  }

  const missingRequired = (report.requiredParams ?? []).filter((key) => {
    const raw = normalizedQuery.get(key);
    return raw == null || (typeof raw === 'string' && raw.trim() === '');
  });

  if (missingRequired.length > 0) {
    throw new ValidationError(`Missing required query params: ${missingRequired.join(', ')}`);
  }

  const setStatements: string[] = [];
  const appliedParams: Record<string, string | number> = {};

  for (const [key, raw] of normalizedQuery.entries()) {
    if (raw == null) {
      continue;
    }

    if (isCsvParam(key)) {
      const csvValue = normalizeCsvValue(raw);
      setStatements.push(buildSetStatement(key, csvValue));
      appliedParams[key] = csvValue;
      continue;
    }

    if (Array.isArray(raw)) {
      if (raw.length !== 1) {
        throw new ValidationError(`Parameter ${key} expects a single value`);
      }
      const sanitizedSingle = sanitizeScalarValue(raw[0]);
      setStatements.push(buildSetStatement(key, sanitizedSingle));
      appliedParams[key] = sanitizedSingle;
      continue;
    }

    const sanitized = sanitizeScalarValue(raw);
    setStatements.push(buildSetStatement(key, sanitized));
    appliedParams[key] = sanitized;
  }

  return {
    sql: `${setStatements.join('\n')}\n${sql}`,
    appliedParams
  };
}
