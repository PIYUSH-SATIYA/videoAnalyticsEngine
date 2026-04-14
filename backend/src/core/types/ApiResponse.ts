export interface ApiMeta {
  requestId: string;
  generatedAt: string;
  queryId?: string;
  queryTimeMs?: number;
  rowCount?: number;
  [key: string]: unknown;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  data: T | null;
  meta: ApiMeta;
  error: ApiError | null;
}
