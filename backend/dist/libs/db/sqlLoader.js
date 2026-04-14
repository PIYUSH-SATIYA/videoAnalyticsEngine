"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSql = loadSql;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../../config/env");
const cache = new Map();
function loadSql(fileName) {
    if (cache.has(fileName)) {
        return cache.get(fileName);
    }
    const filePath = path_1.default.resolve(env_1.env.analyticsSqlDir, fileName);
    if (!fs_1.default.existsSync(filePath)) {
        throw new Error(`SQL file not found: ${filePath}`);
    }
    const sql = fs_1.default.readFileSync(filePath, 'utf8');
    cache.set(fileName, sql);
    return sql;
}
