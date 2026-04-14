"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const EnvSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().int().positive().default(4000),
    DB_HOST: zod_1.z.string().min(1).default('127.0.0.1'),
    DB_PORT: zod_1.z.coerce.number().int().positive().default(3306),
    DB_USER: zod_1.z.string().min(1).default('video_analytics_readonly'),
    DB_PASSWORD: zod_1.z.string().default(''),
    DB_NAME: zod_1.z.string().min(1).default('video_analytics'),
    DB_CONNECTION_LIMIT: zod_1.z.coerce.number().int().positive().default(10),
    ANALYTICS_SQL_DIR: zod_1.z.string().default('../database/queries/analytics')
});
const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}
const cfg = parsed.data;
exports.env = {
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
    analyticsSqlDir: path_1.default.resolve(process.cwd(), cfg.ANALYTICS_SQL_DIR)
};
