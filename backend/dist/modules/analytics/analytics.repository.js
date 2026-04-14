"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRepository = void 0;
const sqlLoader_1 = require("../../libs/db/sqlLoader");
const query_1 = require("../../libs/db/query");
const analytics_paramBuilder_1 = require("./analytics.paramBuilder");
class AnalyticsRepository {
    async executeReportSql(reportKey, sqlFile, query) {
        const sql = (0, sqlLoader_1.loadSql)(sqlFile);
        const executableSql = (0, analytics_paramBuilder_1.buildPrefixedSql)(reportKey, query, sql);
        const execution = await (0, query_1.executeAnalyticsSql)(executableSql);
        return {
            rows: execution.dataRows,
            metadata: execution.metadataRow,
            driverTimeMs: execution.queryTimeMs
        };
    }
}
exports.AnalyticsRepository = AnalyticsRepository;
