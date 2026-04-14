"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const AppError_1 = require("../../core/errors/AppError");
const reportManifest_1 = require("./reports/reportManifest");
class AnalyticsService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    listReports() {
        return Object.values(reportManifest_1.reportManifest).map((report) => ({
            key: report.key,
            sqlFile: report.sqlFile,
            category: report.category,
            path: report.path,
            allowedParams: report.allowedParams,
            requiredParams: report.requiredParams ?? []
        }));
    }
    async runReport(reportKey, query) {
        const report = reportManifest_1.reportManifest[reportKey];
        if (!report) {
            throw new AppError_1.NotFoundError(`Report not found: ${reportKey}`);
        }
        const result = await this.repository.executeReportSql(reportKey, report.sqlFile, query);
        return {
            reportKey,
            ...result
        };
    }
}
exports.AnalyticsService = AnalyticsService;
