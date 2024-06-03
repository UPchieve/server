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
const ZCRepo = __importStar(require("../models/ZipCode"));
const fs_1 = __importDefault(require("fs"));
const sync_1 = __importDefault(require("csv-parse/lib/sync"));
async function upsertPostalCodes() {
    try {
        const zipFile = fs_1.default.readFileSync(`${__dirname}/../../database/seeds/static/geography/postal-codes/aggregated_data.csv`);
        const zipRecords = await (0, sync_1.default)(zipFile, {
            delimiter: ',',
            columns: true,
        });
        await ZCRepo.upsertZipcodes(zipRecords);
    }
    catch (err) {
        throw new Error(`error upserting postal code records: ${err}`);
    }
}
exports.default = upsertPostalCodes;
