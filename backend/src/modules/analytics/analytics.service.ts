import { NotFoundError } from '../../core/errors/AppError';
import { reportManifest } from './reports/reportManifest';
import { AnalyticsRepository } from './analytics.repository';

export class AnalyticsService {
  constructor(private readonly repository: AnalyticsRepository) {}

  listReports() {
    return Object.values(reportManifest).map((report) => ({
      key: report.key,
      sqlFile: report.sqlFile,
      category: report.category,
      path: report.path,
      allowedParams: report.allowedParams,
      requiredParams: report.requiredParams ?? []
    }));
  }

  async runReport(reportKey: string, query: Record<string, unknown>) {
    const report = reportManifest[reportKey];
    if (!report) {
      throw new NotFoundError(`Report not found: ${reportKey}`);
    }

    const result = await this.repository.executeReportSql(reportKey, report.sqlFile, query);

    return {
      reportKey,
      ...result
    };
  }
}
