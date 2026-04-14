"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPrefixedSql = buildPrefixedSql;
const AppError_1 = require("../../core/errors/AppError");
const reportManifest_1 = require("./reports/reportManifest");
function toSqlLiteral(value) {
    return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}
function sanitizeValue(raw) {
    if (typeof raw === 'number' && Number.isFinite(raw)) {
        return raw;
    }
    if (typeof raw !== 'string') {
        throw new AppError_1.ValidationError('Unsupported query parameter type');
    }
    const numCandidate = Number(raw);
    if (!Number.isNaN(numCandidate) && raw.trim() !== '') {
        return numCandidate;
    }
    return raw;
}
function buildSetStatement(key, value) {
    const sqlValue = typeof value === 'number' ? String(value) : toSqlLiteral(value);
    return `SET @${key} = ${sqlValue};`;
}
function buildPrefixedSql(reportKey, query, sql) {
    const report = reportManifest_1.reportManifest[reportKey];
    if (!report) {
        throw new AppError_1.ValidationError(`Unknown report key: ${reportKey}`);
    }
    const providedKeys = Object.keys(query);
    const unknownParams = providedKeys.filter((key) => !report.allowedParams.includes(key));
    if (unknownParams.length > 0) {
        throw new AppError_1.ValidationError(`Unknown query params: ${unknownParams.join(', ')}`);
    }
    const missingRequired = (report.requiredParams ?? []).filter((key) => query[key] == null);
    if (missingRequired.length > 0) {
        throw new AppError_1.ValidationError(`Missing required query params: ${missingRequired.join(', ')}`);
    }
    const setStatements = [];
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
