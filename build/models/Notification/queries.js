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
exports.getNotificationsForGentleWarning = exports.getSessionNotificationsWithSessionId = exports.getNotificationsByVolunteerId = void 0;
const Errors_1 = require("../Errors");
const db_1 = require("../../db");
const pgQueries = __importStar(require("./pg.queries"));
const pgUtils_1 = require("../pgUtils");
async function getNotificationsByVolunteerId(userId) {
    try {
        const result = await pgQueries.getNotificationsByVolunteerId.run({ userId }, (0, db_1.getClient)());
        return result.map(v => (0, pgUtils_1.makeSomeOptional)(v, ['sentAt', 'messageId', 'wasSuccessful']));
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getNotificationsByVolunteerId = getNotificationsByVolunteerId;
async function getSessionNotificationsWithSessionId(sessionId) {
    try {
        const result = await pgQueries.getSessionNotificationsWithSessionId.run({ sessionId }, (0, db_1.getClient)());
        return result.map(v => {
            const row = (0, pgUtils_1.makeSomeOptional)(v, [
                'sentAt',
                'messageId',
                'wasSuccessful',
                'volunteerPartnerOrg',
            ]);
            row.volunteer = {
                firstname: row.firstName,
                volunteerPartnerOrg: row.volunteerPartnerOrg
                    ? row.volunteerPartnerOrg
                    : '',
            };
            delete row.firstName;
            delete row.volunteerPartnerOrg;
            return row;
        });
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSessionNotificationsWithSessionId = getSessionNotificationsWithSessionId;
async function getNotificationsForGentleWarning(sessionId) {
    try {
        const result = await pgQueries.getNotificationsForGentleWarning.run({ sessionId }, (0, db_1.getClient)());
        return result.map(v => {
            const ret = (0, pgUtils_1.makeRequired)(v);
            ret.email = ret.email.toLowerCase();
            return ret;
        });
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getNotificationsForGentleWarning = getNotificationsForGentleWarning;
