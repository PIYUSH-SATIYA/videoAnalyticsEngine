"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReportsSchema = exports.reportKeySchema = void 0;
const zod_1 = require("zod");
exports.reportKeySchema = zod_1.z.object({
    reportKey: zod_1.z.string().min(1)
});
exports.listReportsSchema = zod_1.z.object({}).passthrough();
