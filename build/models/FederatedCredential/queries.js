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
exports.insertFederatedCredential = exports.getFederatedCredential = void 0;
const db_1 = require("../../db");
const pgQueries = __importStar(require("./pg.queries"));
const pgUtils_1 = require("../pgUtils");
const Errors_1 = require("../Errors");
async function getFederatedCredential(id, issuer) {
    try {
        const result = await pgQueries.getFederatedCredential.run({ id, issuer }, (0, db_1.getClient)());
        if (result.length) {
            return (0, pgUtils_1.makeRequired)(result[0]);
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getFederatedCredential = getFederatedCredential;
async function insertFederatedCredential(id, issuer, userId, tc) {
    try {
        await pgQueries.insertFederatedCredential.run({ id, issuer, userId }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.insertFederatedCredential = insertFederatedCredential;
