"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestContext = requestContext;
const crypto_1 = require("crypto");
function requestContext(req, res, next) {
    const requestId = req.header('x-request-id') ?? (0, crypto_1.randomUUID)();
    req.requestId = requestId;
    req.requestStartMs = Date.now();
    res.setHeader('x-request-id', requestId);
    next();
}
