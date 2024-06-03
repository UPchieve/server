"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressReportNotFoundError = exports.FavoriteLimitReachedError = void 0;
const ts_custom_error_1 = require("ts-custom-error");
class FavoriteLimitReachedError extends ts_custom_error_1.CustomError {
}
exports.FavoriteLimitReachedError = FavoriteLimitReachedError;
class ProgressReportNotFoundError extends ts_custom_error_1.CustomError {
}
exports.ProgressReportNotFoundError = ProgressReportNotFoundError;
