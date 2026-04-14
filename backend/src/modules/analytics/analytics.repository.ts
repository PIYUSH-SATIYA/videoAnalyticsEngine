import { loadSql } from '../../libs/db/sqlLoader';
import { executeAnalyticsSql } from '../../libs/db/query';
import { AnalyticsQueryResult } from './analytics.types';
import { buildPrefixedSql } from './analytics.paramBuilder';

export class AnalyticsRepository {
  async executeReportSql(
    reportKey: string,
    sqlFile: string,
    query: Record<string, unknown>
  ): Promise<AnalyticsQueryResult> {
    const sql = loadSql(sqlFile);
    const prefixed = buildPrefixedSql(reportKey, query, sql);
    const execution = await executeAnalyticsSql(prefixed.sql);

    return {
      rows: execution.dataRows as unknown as Record<string, unknown>[],
      metadata: execution.metadataRow,
      driverTimeMs: execution.queryTimeMs,
      appliedParams: prefixed.appliedParams
    };
  }
}
