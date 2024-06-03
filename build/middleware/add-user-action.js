"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUserAction = void 0;
const node_1 = require("@sentry/node");
const extract_user_1 = require("../router/extract-user");
const UserActionRepo = __importStar(require("../models/UserAction"));
const constants_1 = require("../constants");
async function addUserAction(req, res, next) {
    if (Object.prototype.hasOwnProperty.call(req, 'user')) {
        const { id } = (0, extract_user_1.extractUser)(req);
        const { ip: ipAddress } = req;
        if (req.url === '/api/calendar/save') {
            try {
                await UserActionRepo.createAccountAction({
                    action: constants_1.ACCOUNT_USER_ACTIONS.UPDATED_AVAILABILITY,
                    userId: id,
                    ipAddress,
                });
            }
            catch (err) {
                (0, node_1.captureException)(err);
            }
        }
        if (req.url === '/api/training/questions') {
            const { category } = req.body;
            try {
                await UserActionRepo.createQuizAction({
                    action: constants_1.QUIZ_USER_ACTIONS.STARTED,
                    quizSubcategory: category,
                    userId: id,
                    ipAddress,
                });
            }
            catch (err) {
                (0, node_1.captureException)(err);
            }
        }
        if (req.url === '/api/user' && req.method === 'PUT') {
            try {
                await UserActionRepo.createAccountAction({
                    action: constants_1.ACCOUNT_USER_ACTIONS.UPDATED_PROFILE,
                    userId: id,
                    ipAddress,
                });
            }
            catch (err) {
                (0, node_1.captureException)(err);
            }
        }
    }
    next();
}
exports.addUserAction = addUserAction;
