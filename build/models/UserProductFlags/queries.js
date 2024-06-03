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
exports.updatePaidTutorsPilotGroup = exports.updateFallIncentiveProgram = exports.updateSentInactiveNinetyDayEmail = exports.updateSentInactiveSixtyDayEmail = exports.updateSentInactiveThirtyDayEmail = exports.getPublicUPFByUserId = exports.getUPFByUserId = exports.createUPFByUserId = void 0;
const db_1 = require("../../db");
const Errors_1 = require("../Errors");
const pgUtils_1 = require("../pgUtils");
const pgQueries = __importStar(require("./pg.queries"));
async function createUPFByUserId(userId, tc) {
    try {
        const result = await pgQueries.createUpfByUserId.run({
            userId,
        }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (result.length) {
            return (0, pgUtils_1.makeSomeOptional)(result[0], ['paidTutorsPilotGroup']);
        }
        throw new Errors_1.RepoCreateError('Insert did not return new row');
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.createUPFByUserId = createUPFByUserId;
async function getUPFByUserId(userId) {
    try {
        const result = await pgQueries.getUpfByUserId.run({
            userId,
        }, (0, db_1.getClient)());
        if (result.length) {
            return (0, pgUtils_1.makeSomeOptional)(result[0], ['paidTutorsPilotGroup']);
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getUPFByUserId = getUPFByUserId;
async function getPublicUPFByUserId(userId) {
    try {
        const result = await pgQueries.getPublicUpfByUserId.run({
            userId,
        }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getPublicUPFByUserId = getPublicUPFByUserId;
async function updateSentInactiveThirtyDayEmail(userId, sentInactiveThirtyDayEmail) {
    try {
        const result = await pgQueries.updateSentInactiveThirtyDayEmail.run({ userId, sentInactiveThirtyDayEmail }, (0, db_1.getClient)());
        if (result.length && (0, pgUtils_1.makeRequired)(result[0].ok))
            return;
        throw new Errors_1.RepoUpdateError('Update query was not acknowledged');
    }
    catch (err) {
        if (err instanceof Errors_1.RepoUpdateError)
            throw err;
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateSentInactiveThirtyDayEmail = updateSentInactiveThirtyDayEmail;
async function updateSentInactiveSixtyDayEmail(userId, sentInactiveSixtyDayEmail) {
    try {
        const result = await pgQueries.updateSentInactiveSixtyDayEmail.run({ userId, sentInactiveSixtyDayEmail }, (0, db_1.getClient)());
        if (result.length && (0, pgUtils_1.makeRequired)(result[0].ok))
            return;
        throw new Errors_1.RepoUpdateError('Update query was not acknowledged');
    }
    catch (err) {
        if (err instanceof Errors_1.RepoUpdateError)
            throw err;
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateSentInactiveSixtyDayEmail = updateSentInactiveSixtyDayEmail;
async function updateSentInactiveNinetyDayEmail(userId, sentInactiveNinetyDayEmail) {
    try {
        const result = await pgQueries.updateSentInactiveNinetyDayEmail.run({ userId, sentInactiveNinetyDayEmail }, (0, db_1.getClient)());
        if (result.length && (0, pgUtils_1.makeRequired)(result[0].ok))
            return;
        throw new Errors_1.RepoUpdateError('Update query was not acknowledged');
    }
    catch (err) {
        if (err instanceof Errors_1.RepoUpdateError)
            throw err;
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateSentInactiveNinetyDayEmail = updateSentInactiveNinetyDayEmail;
async function updateFallIncentiveProgram(userId, status) {
    try {
        const result = await pgQueries.updateFallIncentiveProgram.run({ userId, status }, (0, db_1.getClient)());
        if (result.length && (0, pgUtils_1.makeRequired)(result[0].ok))
            return;
        throw new Errors_1.RepoUpdateError('Update query was not acknowledged');
    }
    catch (err) {
        if (err instanceof Errors_1.RepoUpdateError)
            throw err;
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateFallIncentiveProgram = updateFallIncentiveProgram;
async function updatePaidTutorsPilotGroup(userId, group) {
    try {
        const result = await pgQueries.updatePaidTutorsPilotGroup.run({ userId, group }, (0, db_1.getClient)());
        if (result.length && (0, pgUtils_1.makeRequired)(result[0].ok))
            return;
        throw new Errors_1.RepoUpdateError('Update query was not acknowledged');
    }
    catch (err) {
        if (err instanceof Errors_1.RepoUpdateError)
            throw err;
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updatePaidTutorsPilotGroup = updatePaidTutorsPilotGroup;
