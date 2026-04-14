export interface ReportDefinition {
  key: string;
  sqlFile: string;
  category: 'kpi' | 'table' | 'graph';
  path: string;
  allowedParams: string[];
  requiredParams?: string[];
  sqlParamMap?: Record<string, string>;
  legacyParamAliases?: Record<string, string>;
}

export interface AnalyticsQueryResult {
  rows: Record<string, unknown>[];
  metadata: Record<string, unknown>;
  driverTimeMs: number;
  appliedParams: Record<string, string | number>;
}
