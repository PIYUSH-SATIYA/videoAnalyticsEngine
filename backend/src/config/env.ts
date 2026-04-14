import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DB_HOST: z.string().min(1).default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().min(1).default('video_analytics_readonly'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().min(1).default('video_analytics'),
  DB_CONNECTION_LIMIT: z.coerce.number().int().positive().default(10),
  ANALYTICS_SQL_DIR: z.string().default('../database/queries/analytics')
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

const cfg = parsed.data;

export const env = {
  nodeEnv: cfg.NODE_ENV,
  port: cfg.PORT,
  db: {
    host: cfg.DB_HOST,
    port: cfg.DB_PORT,
    user: cfg.DB_USER,
    password: cfg.DB_PASSWORD,
    database: cfg.DB_NAME,
    connectionLimit: cfg.DB_CONNECTION_LIMIT
  },
  analyticsSqlDir: path.resolve(process.cwd(), cfg.ANALYTICS_SQL_DIR)
};
