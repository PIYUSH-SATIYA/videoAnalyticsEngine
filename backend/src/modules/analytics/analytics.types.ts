export interface ReportDefinition {
  key: string;
  sqlFile: string;
  category: 'kpi' | 'table' | 'graph';
  path: string;
  allowedParams: string[];
  requiredParams?: string[];
}

export interface AnalyticsQueryResult {
  rows: Record<string, unknown>[];
  metadata: Record<string, unknown>;
  driverTimeMs: number;
}
