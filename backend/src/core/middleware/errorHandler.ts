import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { sendError } from '../http/response';
import { logger } from '../../config/logger';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.requestId ?? 'unknown';

  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message, {
      requestId,
      generatedAt: new Date().toISOString()
    });
    return;
  }

  logger.error({ err, requestId }, 'Unhandled error');
  sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error', {
    requestId,
    generatedAt: new Date().toISOString()
  });
}
