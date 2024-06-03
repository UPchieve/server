"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLastActivity = void 0;
const moment_1 = __importDefault(require("moment"));
const queries_1 = require("../models/User/queries");
const extract_user_1 = require("../router/extract-user");
async function addLastActivity(req, res, next) {
    if (Object.prototype.hasOwnProperty.call(req, 'user')) {
        const { id, lastActivityAt } = (0, extract_user_1.extractUser)(req);
        // Convert all times to UTC for consistency
        const today = (0, moment_1.default)().utc();
        const lastActivityMoment = (0, moment_1.default)(lastActivityAt).utc();
        if (today.isAfter(lastActivityMoment, 'day')) {
            try {
                await (0, queries_1.updateUserLastActivityById)(id, today.toDate());
            }
            catch (err) {
                return next(err);
            }
        }
        next();
    }
    else {
        next();
    }
}
exports.addLastActivity = addLastActivity;
