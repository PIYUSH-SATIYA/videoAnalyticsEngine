export interface ApiMeta {
  requestId: string;
  generatedAt: string;
  queryId?: string;
  queryTimeMs?: number;
  apiTimeMs?: number;
  rowCount?: number;
  reportKey?: string;
  [key: string]: unknown;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
  error: ApiError | null;
}
