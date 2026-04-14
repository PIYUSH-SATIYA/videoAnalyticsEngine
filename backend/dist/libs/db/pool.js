"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = getPool;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("../../config/env");
let pool = null;
function getPool() {
    if (pool) {
        return pool;
    }
    pool = promise_1.default.createPool({
        host: env_1.env.db.host,
        port: env_1.env.db.port,
        user: env_1.env.db.user,
        password: env_1.env.db.password,
        database: env_1.env.db.database,
        waitForConnections: true,
        connectionLimit: env_1.env.db.connectionLimit,
        namedPlaceholders: true,
        multipleStatements: true
    });
    return pool;
}
