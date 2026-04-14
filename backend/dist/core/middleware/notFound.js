"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
const response_1 = require("../http/response");
function notFoundHandler(req, res) {
    (0, response_1.sendError)(res, 404, 'NOT_FOUND', 'Route not found', {
        requestId: req.requestId ?? 'unknown',
        generatedAt: new Date().toISOString()
    });
}
