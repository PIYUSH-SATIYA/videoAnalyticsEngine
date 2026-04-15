import fs from 'fs';
import path from 'path';
import { env } from '../../config/env';

type SqlCacheEntry = {
  sql: string;
  mtimeMs: number;
};

const cache = new Map<string, SqlCacheEntry>();

export function loadSql(fileName: string): string {
  const filePath = path.resolve(env.analyticsSqlDir, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`SQL file not found: ${filePath}`);
  }

  const stat = fs.statSync(filePath);
  const cached = cache.get(fileName);
  if (cached && cached.mtimeMs === stat.mtimeMs) {
    return cached.sql;
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  cache.set(fileName, {
    sql,
    mtimeMs: stat.mtimeMs
  });
  return sql;
}
