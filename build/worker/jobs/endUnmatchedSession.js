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
const SessionService = __importStar(require("../../services/SessionService"));
const sessionUtils = __importStar(require("../../utils/session-utils"));
const SessionRepo = __importStar(require("../../models/Session/queries"));
const logger_1 = require("../logger");
const _1 = require(".");
const type_utils_1 = require("../../utils/type-utils");
exports.default = async (job) => {
    const sessionId = (0, type_utils_1.asString)(job.data.sessionId);
    const session = await SessionRepo.getSessionById(sessionId);
    if (session) {
        const fulfilled = sessionUtils.isSessionFulfilled(session);
        if (fulfilled) {
            (0, logger_1.log)(`Cancel ${_1.Jobs.EndUnmatchedSession}: session ${sessionId} fulfilled`);
        }
        else {
            try {
                await SessionService.endSession(sessionId, null, true, undefined, undefined);
                (0, logger_1.log)(`Successfuly ${_1.Jobs.EndUnmatchedSession}: session ${sessionId}`);
            }
            catch (error) {
                throw new Error(`Failed to ${_1.Jobs.EndUnmatchedSession}: session ${sessionId}: ${error}`);
            }
        }
    }
};
