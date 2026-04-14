import { Response } from 'express';
import { ApiMeta, ApiResponse } from '../types/ApiResponse';

export function sendSuccess<T>(res: Response, data: T, meta: ApiMeta): void {
  const payload: ApiResponse<T> = {
    data,
    meta,
    error: null
  };
  res.status(200).json(payload);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  meta: ApiMeta
): void {
  const payload: ApiResponse<null> = {
    data: null,
    meta,
    error: {
      code,
      message
    }
  };
  res.status(statusCode).json(payload);
}
