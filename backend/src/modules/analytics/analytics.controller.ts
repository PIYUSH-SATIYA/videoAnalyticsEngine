import { Request, Response } from 'express';
import { sendSuccess } from '../../core/http/response';
import { AnalyticsService } from './analytics.service';
import { ValidationError } from '../../core/errors/AppError';
import { reportKeySchema } from './analytics.schemas';

export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  private async executeReportAndRespond(reportKey: string, req: Request, res: Response): Promise<void> {
    const started = performance.now();
    const result = await this.service.runReport(reportKey, req.query as Record<string, unknown>);
    const apiTimeMs = Number((performance.now() - started).toFixed(3));

    const metadata = result.metadata;

    sendSuccess(res, result.rows, {
      requestId: req.requestId ?? 'unknown',
      generatedAt: new Date().toISOString(),
      rowCount: result.rows.length,
      queryId: typeof metadata.query_id === 'string' ? metadata.query_id : undefined,
      queryTimeMs:
        typeof metadata.query_time_ms === 'number'
          ? metadata.query_time_ms
          : result.driverTimeMs,
      apiTimeMs,
      reportKey
    });
  }

  listReports = async (req: Request, res: Response): Promise<void> => {
    const reports = this.service.listReports();

    sendSuccess(res, reports, {
      requestId: req.requestId ?? 'unknown',
      generatedAt: new Date().toISOString(),
      rowCount: reports.length
    });
  };

  runReport = async (req: Request, res: Response): Promise<void> => {
    const reportKeyParam = req.params.reportKey;
    const reportKey = Array.isArray(reportKeyParam) ? reportKeyParam[0] : reportKeyParam;
    const parsed = reportKeySchema.safeParse({ reportKey });
    if (!parsed.success) {
      throw new ValidationError(parsed.error.message);
    }
    await this.executeReportAndRespond(parsed.data.reportKey, req, res);
  };

  runReportByKey = async (reportKey: string, req: Request, res: Response): Promise<void> => {
    await this.executeReportAndRespond(reportKey, req, res);
  };
}
