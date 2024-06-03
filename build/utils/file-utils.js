"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readCsvFromFilePath = exports.readCsvFromBuffer = void 0;
const fs_1 = __importDefault(require("fs"));
const sync_1 = __importDefault(require("csv-parse/lib/sync"));
const Errors_1 = require("../models/Errors");
function readCsvFromBuffer(buffer, requiredColumns) {
    return readCsv(buffer, requiredColumns);
}
exports.readCsvFromBuffer = readCsvFromBuffer;
function readCsvFromFilePath(filePath, requiredColumns) {
    const file = fs_1.default.readFileSync(filePath);
    return readCsv(file, requiredColumns);
}
exports.readCsvFromFilePath = readCsvFromFilePath;
function readCsv(input, requiredColumns) {
    try {
        const contents = (0, sync_1.default)(input, {
            delimiter: ',',
            columns: true,
        });
        if (!contents.length) {
            throw new Errors_1.InputError(`No content in the CSV.`);
        }
        if (!hasRequiredColumns(requiredColumns, contents[0])) {
            throw new Errors_1.InputError(`Missing a required column. Required: ${requiredColumns}`);
        }
        return contents;
    }
    catch (e) {
        if (e instanceof Error && e.message.includes('Invalid Record Length')) {
            throw new Errors_1.InputError('Number of columns to headers does not match.');
        }
        else {
            throw e;
        }
    }
}
function hasRequiredColumns(requiredColumns, sample) {
    for (const col of requiredColumns) {
        if (!(col in sample)) {
            return false;
        }
    }
    return true;
}
