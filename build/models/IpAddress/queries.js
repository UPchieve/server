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
exports.updateIpStatusByUserId = exports.updateIpUserById = exports.insertIpByRawString = exports.getIpByRawString = void 0;
const Errors_1 = require("../Errors");
const db_1 = require("../../db");
const pgQueries = __importStar(require("./pg.queries"));
const pgUtils_1 = require("../pgUtils");
const clean_ip_string_1 = require("../../utils/clean-ip-string");
const constants_1 = require("../../constants");
async function getIpByRawString(ip) {
    try {
        const result = await pgQueries.getIpByRawString.run({ ip: (0, clean_ip_string_1.cleanIpString)(ip) }, (0, db_1.getClient)());
        if (!result.length)
            return;
        return (0, pgUtils_1.makeRequired)(result[0]);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getIpByRawString = getIpByRawString;
async function insertIpByRawString(ip) {
    try {
        const result = await pgQueries.insertIpByRawString.run({
            id: (0, pgUtils_1.getDbUlid)(),
            ip: (0, clean_ip_string_1.cleanIpString)(ip),
        }, (0, db_1.getClient)());
        if (!result.length)
            throw new Error('Insert did not return new row');
        return (0, pgUtils_1.makeSomeOptional)(result[0], ['status']);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.insertIpByRawString = insertIpByRawString;
async function updateIpUserById(ipId, userId) {
    try {
        const result = await pgQueries.insertUsersIpById.run({
            id: (0, pgUtils_1.getDbUlid)(),
            ipId,
            userId,
        }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Error('Insert query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.updateIpUserById = updateIpUserById;
async function updateIpStatusByUserId(userId, status = constants_1.IP_ADDRESS_STATUS.OK) {
    try {
        const result = await pgQueries.updateIpStatusByUserId.run({
            userId,
            status,
        }, (0, db_1.getClient)());
        // We're ok not unbanning an IP if none are recorded for the user
        if (!result.length)
            return;
        if (!(0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Error('Update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateIpStatusByUserId = updateIpStatusByUserId;
