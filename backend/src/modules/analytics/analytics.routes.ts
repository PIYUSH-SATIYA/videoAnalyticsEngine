import { Router } from 'express';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { asyncHandler } from '../../libs/util/asyncHandler';
import { validateQuery } from '../../core/middleware/validate';
import { listReportsSchema } from './analytics.schemas';

const router = Router();

const repository = new AnalyticsRepository();
const service = new AnalyticsService(repository);
const controller = new AnalyticsController(service);

router.get('/reports', validateQuery(listReportsSchema), asyncHandler(controller.listReports));
router.get('/reports/:reportKey', asyncHandler(controller.runReport));

export { router as analyticsRouter };
