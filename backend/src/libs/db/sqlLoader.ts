import fs from 'fs';
import path from 'path';
import { env } from '../../config/env';

const cache = new Map<string, string>();

export function loadSql(fileName: string): string {
  if (cache.has(fileName)) {
    return cache.get(fileName) as string;
  }

  const filePath = path.resolve(env.analyticsSqlDir, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`SQL file not found: ${filePath}`);
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  cache.set(fileName, sql);
  return sql;
}
