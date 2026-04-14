"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const AppError_1 = require("../errors/AppError");
const response_1 = require("../http/response");
const logger_1 = require("../../config/logger");
function errorHandler(err, req, res, _next) {
    const requestId = req.requestId ?? 'unknown';
    if (err instanceof AppError_1.AppError) {
        (0, response_1.sendError)(res, err.statusCode, err.code, err.message, {
            requestId,
            generatedAt: new Date().toISOString()
        });
        return;
    }
    logger_1.logger.error({ err, requestId }, 'Unhandled error');
    (0, response_1.sendError)(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error', {
        requestId,
        generatedAt: new Date().toISOString()
    });
}
