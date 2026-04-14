import { Router } from 'express';
import { healthRouter } from './health.routes';
import { analyticsRouter } from '../modules/analytics/analytics.routes';
import {
  graphRouter,
  kpiRouter,
  tableRouter
} from '../modules/analytics/reportPaths.routes';

const router = Router();

router.use('/health', healthRouter);
router.use('/analytics', analyticsRouter);
router.use('/analytics/kpis', kpiRouter);
router.use('/analytics/tables', tableRouter);
router.use('/analytics/graphs', graphRouter);

export { router as apiV1Router };
