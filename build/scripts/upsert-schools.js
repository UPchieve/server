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
exports.SCHOOL_RECORD_TRUE_VALUE = void 0;
const fs_1 = __importDefault(require("fs"));
const sync_1 = __importDefault(require("csv-parse/lib/sync"));
const SchoolRepo = __importStar(require("../models/School"));
exports.SCHOOL_RECORD_TRUE_VALUE = '1-Yes';
async function upsertSchools(job) {
    try {
        const schoolRecordFile = fs_1.default.readFileSync(`${__dirname}/../../database/seeds/static/schools/schools.csv`);
        const schoolRecords = await (0, sync_1.default)(schoolRecordFile, {
            delimiter: ',',
            columns: true,
        });
        await SchoolRepo.upsertSchools(job.data.schoolYear, schoolRecords);
    }
    catch (err) {
        throw new Error(`Error upserting school record: ${err}`);
    }
}
exports.default = upsertSchools;
