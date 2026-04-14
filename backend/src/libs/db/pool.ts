import mysql, { Pool } from 'mysql2/promise';
import { env } from '../../config/env';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool) {
    return pool;
  }

  pool = mysql.createPool({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    waitForConnections: true,
    connectionLimit: env.db.connectionLimit,
    namedPlaceholders: true,
    multipleStatements: true
  });

  return pool;
}
