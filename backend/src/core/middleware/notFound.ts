import { Request, Response } from 'express';
import { sendError } from '../http/response';

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 404, 'NOT_FOUND', 'Route not found', {
    requestId: req.requestId ?? 'unknown',
    generatedAt: new Date().toISOString()
  });
}
