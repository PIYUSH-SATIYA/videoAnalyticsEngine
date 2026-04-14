"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const response_1 = require("../../core/http/response");
const AppError_1 = require("../../core/errors/AppError");
const analytics_schemas_1 = require("./analytics.schemas");
class AnalyticsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async executeReportAndRespond(reportKey, req, res) {
        const started = performance.now();
        const result = await this.service.runReport(reportKey, req.query);
        const apiTimeMs = Number((performance.now() - started).toFixed(3));
        const metadata = result.metadata;
        (0, response_1.sendSuccess)(res, result.rows, {
            requestId: req.requestId ?? 'unknown',
            generatedAt: new Date().toISOString(),
            rowCount: result.rows.length,
            appliedFilters: result.appliedParams,
            queryId: typeof metadata.query_id === 'string' ? metadata.query_id : undefined,
            queryTimeMs: typeof metadata.query_time_ms === 'number'
                ? metadata.query_time_ms
                : result.driverTimeMs,
            queryGeneratedAtUtc: metadata.generated_at_utc instanceof Date
                ? metadata.generated_at_utc.toISOString()
                : typeof metadata.generated_at_utc === 'string'
                    ? metadata.generated_at_utc
                    : undefined,
            apiTimeMs,
            reportKey
        });
    }
    listReports = async (req, res) => {
        const reports = this.service.listReports();
        (0, response_1.sendSuccess)(res, reports, {
            requestId: req.requestId ?? 'unknown',
            generatedAt: new Date().toISOString(),
            rowCount: reports.length
        });
    };
    runReport = async (req, res) => {
        const reportKeyParam = req.params.reportKey;
        const reportKey = Array.isArray(reportKeyParam) ? reportKeyParam[0] : reportKeyParam;
        const parsed = analytics_schemas_1.reportKeySchema.safeParse({ reportKey });
        if (!parsed.success) {
            throw new AppError_1.ValidationError(parsed.error.message);
        }
        await this.executeReportAndRespond(parsed.data.reportKey, req, res);
    };
    runReportByKey = async (reportKey, req, res) => {
        await this.executeReportAndRespond(reportKey, req, res);
    };
}
exports.AnalyticsController = AnalyticsController;
