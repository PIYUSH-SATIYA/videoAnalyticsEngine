"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const pino_http_1 = __importDefault(require("pino-http"));
const logger_1 = require("./config/logger");
const requestContext_1 = require("./core/middleware/requestContext");
const routes_1 = require("./routes");
const notFound_1 = require("./core/middleware/notFound");
const errorHandler_1 = require("./core/middleware/errorHandler");
function buildApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)());
    app.use((0, compression_1.default)());
    app.use(express_1.default.json({ limit: '1mb' }));
    app.use(requestContext_1.requestContext);
    app.use((0, pino_http_1.default)({
        logger: logger_1.logger
    }));
    app.use('/api/v1', routes_1.apiV1Router);
    app.use(notFound_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
}
