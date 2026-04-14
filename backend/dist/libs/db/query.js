"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeAnalyticsSql = executeAnalyticsSql;
const AppError_1 = require("../../core/errors/AppError");
const pool_1 = require("./pool");
function isRowSet(value) {
    return Array.isArray(value);
}
async function executeAnalyticsSql(sql) {
    const pool = (0, pool_1.getPool)();
    const startedNs = process.hrtime.bigint();
    try {
        const [results] = await pool.query(sql);
        const elapsedNs = process.hrtime.bigint() - startedNs;
        const elapsedMs = Number(elapsedNs) / 1_000_000;
        const sets = Array.isArray(results) ? results : [results];
        const rowSets = sets.filter((set) => isRowSet(set));
        const meaningfulRowSets = rowSets.filter((set) => set.length > 0);
        if (meaningfulRowSets.length === 0) {
            return {
                dataRows: [],
                metadataRow: {},
                queryTimeMs: Number(elapsedMs.toFixed(3))
            };
        }
        const metadataSet = meaningfulRowSets[meaningfulRowSets.length - 1];
        const dataSet = meaningfulRowSets.length > 1 ? (meaningfulRowSets[0] ?? []) : [];
        return {
            dataRows: dataSet,
            metadataRow: (metadataSet?.[0] ?? {}),
            queryTimeMs: Number(elapsedMs.toFixed(3))
        };
    }
    catch (error) {
        throw new AppError_1.DatabaseError(`Failed to execute analytics query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
