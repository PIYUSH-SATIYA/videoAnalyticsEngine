"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const app = (0, app_1.buildApp)();
app.listen(env_1.env.port, () => {
    logger_1.logger.info({ port: env_1.env.port }, 'Backend server started');
});
