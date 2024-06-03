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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertZipcodes = exports.getZipCodeByZipCode = void 0;
const Errors_1 = require("../Errors");
const pgUtils_1 = require("../pgUtils");
const db_1 = require("../../db");
const pgQueries = __importStar(require("./pg.queries"));
const config_1 = __importDefault(require("../../config"));
async function getZipCodeByZipCode(zipCode) {
    try {
        const medianIncomeThreshold = config_1.default.eligibleIncomeThreshold;
        const result = await pgQueries.getZipCodeByZipCode.run({ zipCode, medianIncomeThreshold }, (0, db_1.getClient)());
        if (result.length) {
            return (0, pgUtils_1.makeSomeOptional)(result[0], ['cbsaIncome', 'stateIncome']);
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getZipCodeByZipCode = getZipCodeByZipCode;
async function upsertZipcodes(zipRecords) {
    const transactionClient = await (0, db_1.getClient)().connect();
    try {
        await transactionClient.query('BEGIN');
        for (const record of zipRecords) {
            // The parsing library has an open issue where empty values in the csv
            // are given a string value of 'null' instead of just null.
            // See https://github.com/adaltas/node-csv/issues/307.
            if (record.cbsa_income === 'null') {
                record.cbsa_income = null;
            }
            if (record.state_income === 'null') {
                record.state_income = null;
            }
            const typedRecord = record;
            await pgQueries.upsertZipCode.run({
                code: typedRecord.zipcode,
                usStateCode: typedRecord.state,
                income: typedRecord.income,
                cbsaIncome: typedRecord.cbsa_income,
                stateIncome: typedRecord.state_income,
                latitude: typedRecord.latitude,
                longitude: typedRecord.longitude,
            }, transactionClient);
        }
        await pgQueries.upsertZipCode.run({
            code: '00000',
            usStateCode: 'NA',
            income: 0,
            cbsaIncome: 0,
            stateIncome: 0,
            latitude: 0,
            longitude: 0,
        }, transactionClient);
        await transactionClient.query('COMMIT');
    }
    catch (err) {
        await transactionClient.query('ROLLBACK');
        if (err instanceof Errors_1.RepoCreateError)
            throw err;
        throw new Errors_1.RepoTransactionError(err);
    }
    finally {
        transactionClient.release();
    }
}
exports.upsertZipcodes = upsertZipcodes;
