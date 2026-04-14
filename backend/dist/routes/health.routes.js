"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const response_1 = require("../core/http/response");
const router = (0, express_1.Router)();
exports.healthRouter = router;
router.get('/', (req, res) => {
    (0, response_1.sendSuccess)(res, {
        status: 'ok'
    }, {
        requestId: req.requestId ?? 'unknown',
        generatedAt: new Date().toISOString()
    });
});
