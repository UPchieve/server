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
const moment_1 = __importDefault(require("moment"));
require("moment-timezone");
const queries_1 = require("../../models/Volunteer/queries");
const logger_1 = require("../logger");
const reportUtils_1 = require("../../utils/reportUtils");
const config_1 = __importDefault(require("../../config"));
const cache = __importStar(require("../../cache"));
const index_1 = require("./index");
async function updateTotalVolunteerHours() {
    const startDate = (0, moment_1.default)(await cache.get(config_1.default.cacheKeys.updateTotalVolunteerHoursLastRun));
    const endDate = (0, moment_1.default)();
    const volunteers = await (0, queries_1.getVolunteersForTotalHours)();
    let totalUpdated = 0;
    const errors = [];
    for (const volunteer of volunteers) {
        try {
            const stats = await (0, reportUtils_1.telecomHourSummaryStats)(volunteer, startDate.toDate(), endDate.toDate());
            await (0, queries_1.updateVolunteerTotalHoursById)(volunteer.id, stats.totalVolunteerHours);
        }
        catch (error) {
            errors.push(`${volunteer.id}: ${error}\n`);
            continue;
        }
        totalUpdated += 1;
    }
    (0, logger_1.log)(`Successfully ${index_1.Jobs.UpdateTotalVolunteerHours} for ${totalUpdated} volunteers`);
    await cache.save(config_1.default.cacheKeys.updateTotalVolunteerHoursLastRun, endDate.format());
    if (errors.length) {
        throw new Error(`Failed to ${index_1.Jobs.UpdateTotalVolunteerHours} for volunteers:\n${errors}`);
    }
}
exports.default = updateTotalVolunteerHours;
