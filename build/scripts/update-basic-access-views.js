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
const fs_1 = __importDefault(require("fs"));
const db = __importStar(require("../db"));
const REMOVED_COL_ERR = 'cannot drop columns from view';
async function updateBasicAccessViews() {
    try {
        const tables = JSON.parse(fs_1.default.readFileSync(`${__dirname}/../../database/db_init/upchieve_basic_access.json`, { encoding: 'utf-8' }));
        await db.connect();
        const dropFirst = [];
        for (const table in tables) {
            try {
                await db.getClient().query(getCreateQuery(table, tables[table]));
            }
            catch (err) {
                if (err.message === REMOVED_COL_ERR) {
                    dropFirst.push(table);
                }
            }
        }
        for (const table of dropFirst) {
            await db.getClient().query(getDropQuery(table));
            await db.getClient().query(getCreateQuery(table, tables[table]));
        }
    }
    catch (err) {
        throw new Error(`error updating basic access views: ${err}`);
    }
    finally {
        await db.closeClient();
    }
}
exports.default = updateBasicAccessViews;
function getCreateQuery(table, cols) {
    return `CREATE OR REPLACE VIEW basic_access.${table} AS SELECT ${cols.join(', ')} FROM ${table};`;
}
function getDropQuery(table) {
    return `DROP VIEW basic_access.${table};`;
}
