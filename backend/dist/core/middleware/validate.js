"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = validateQuery;
const AppError_1 = require("../errors/AppError");
function validateQuery(schema) {
    return (req, _res, next) => {
        const parsed = schema.safeParse(req.query);
        if (!parsed.success) {
            next(new AppError_1.ValidationError(parsed.error.message));
            return;
        }
        next();
    };
}
