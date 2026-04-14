"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, data, meta) {
    const payload = {
        data,
        meta,
        error: null
    };
    res.status(200).json(payload);
}
function sendError(res, statusCode, code, message, meta) {
    const payload = {
        data: null,
        meta,
        error: {
            code,
            message
        }
    };
    res.status(statusCode).json(payload);
}
