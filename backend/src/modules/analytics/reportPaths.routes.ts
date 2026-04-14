import { Router } from 'express';
import { asyncHandler } from '../../libs/util/asyncHandler';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

const repo = new AnalyticsRepository();
const service = new AnalyticsService(repo);
const controller = new AnalyticsController(service);

const kpiRouter = Router();
const tableRouter = Router();
const graphRouter = Router();

kpiRouter.get('/live-users', asyncHandler((req, res) => controller.runReportByKey('kpi-live-users', req, res)));
kpiRouter.get('/watch-time-today', asyncHandler((req, res) => controller.runReportByKey('kpi-watch-time-today', req, res)));
kpiRouter.get(
  '/avg-session-duration-last-7d',
  asyncHandler((req, res) => controller.runReportByKey('kpi-avg-session-duration-last-7d', req, res))
);
kpiRouter.get(
  '/engagement-per-100-views-last-7d',
  asyncHandler((req, res) => controller.runReportByKey('kpi-engagement-per-100-views-last-7d', req, res))
);
kpiRouter.get(
  '/binge-users-last-7d',
  asyncHandler((req, res) => controller.runReportByKey('kpi-binge-users-last-7d', req, res))
);

tableRouter.get(
  '/top-binge-watchers',
  asyncHandler((req, res) => controller.runReportByKey('tbl-top-binge-watchers', req, res))
);
tableRouter.get(
  '/most-viewed-genres-by-age',
  asyncHandler((req, res) => controller.runReportByKey('tbl-most-viewed-genres-by-age', req, res))
);
tableRouter.get(
  '/age-groups-watch-time-by-device',
  asyncHandler((req, res) => controller.runReportByKey('tbl-age-groups-watch-time-by-device', req, res))
);
tableRouter.get(
  '/video-performance-by-genre',
  asyncHandler((req, res) => controller.runReportByKey('tbl-video-performance-by-genre', req, res))
);
tableRouter.get(
  '/device-quality-friction',
  asyncHandler((req, res) => controller.runReportByKey('tbl-device-quality-friction', req, res))
);
tableRouter.get(
  '/time-spent-on-device',
  asyncHandler((req, res) => controller.runReportByKey('tbl-time-spent-on-device', req, res))
);
tableRouter.get(
  '/user-session-timeline',
  asyncHandler((req, res) => controller.runReportByKey('tbl-user-session-timeline', req, res))
);
tableRouter.get(
  '/video-audience-split',
  asyncHandler((req, res) => controller.runReportByKey('tbl-video-audience-split', req, res))
);

graphRouter.get(
  '/avg-session-duration-trend',
  asyncHandler((req, res) => controller.runReportByKey('grf-avg-session-duration-trend', req, res))
);
graphRouter.get(
  '/genre-watch-trend',
  asyncHandler((req, res) => controller.runReportByKey('grf-genre-watch-trend', req, res))
);
graphRouter.get(
  '/event-mix-trend',
  asyncHandler((req, res) => controller.runReportByKey('grf-event-mix-trend', req, res))
);
graphRouter.get(
  '/hourly-consumption-heatmap',
  asyncHandler((req, res) => controller.runReportByKey('grf-hourly-consumption-heatmap', req, res))
);
graphRouter.get(
  '/user-event-mix-trend',
  asyncHandler((req, res) => controller.runReportByKey('grf-user-event-mix-trend', req, res))
);
graphRouter.get(
  '/video-performance-trend',
  asyncHandler((req, res) => controller.runReportByKey('grf-video-performance-trend', req, res))
);

export { kpiRouter, tableRouter, graphRouter };
