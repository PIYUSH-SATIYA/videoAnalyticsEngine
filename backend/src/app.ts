import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import pinoHttp from 'pino-http';
import { logger } from './config/logger';
import { requestContext } from './core/middleware/requestContext';
import { apiV1Router } from './routes';
import { notFoundHandler } from './core/middleware/notFound';
import { errorHandler } from './core/middleware/errorHandler';

export function buildApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(requestContext);
  app.use(
    pinoHttp({
      logger
    })
  );

  app.use('/api/v1', apiV1Router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
