import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

declare module 'express-serve-static-core' {
  interface Request {
    requestId?: string;
    requestStartMs?: number;
  }
}

export function requestContext(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.header('x-request-id') ?? randomUUID();
  req.requestId = requestId;
  req.requestStartMs = Date.now();
  res.setHeader('x-request-id', requestId);
  next();
}
