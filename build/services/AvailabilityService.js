"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalElapsedAvailabilityForDateRange = exports.getElapsedAvailabilityForTelecomReport = exports.getElapsedAvailabilityForDay = void 0;
const moment_1 = __importDefault(require("moment"));
const lodash_1 = __importDefault(require("lodash"));
const Availability_1 = require("../models/Availability");
function getElapsedAvailabilityForDay(day) {
    let elapsedAvailability = 0;
    const availabileTimes = Object.values(day);
    for (const time of availabileTimes) {
        if (time)
            elapsedAvailability++;
    }
    return elapsedAvailability;
}
exports.getElapsedAvailabilityForDay = getElapsedAvailabilityForDay;
async function getElapsedAvailabilityForTelecomReport(volunteerId, fromDate, toDate) {
    const historyDocs = await (0, Availability_1.getAvailabilityHistoryForDatesByVolunteerId)(volunteerId, fromDate, toDate);
    const legacyDocs = await (0, Availability_1.getLegacyAvailabilityHistoryForDatesByVolunteerId)(volunteerId, fromDate, toDate);
    return historyDocs.concat(legacyDocs);
}
exports.getElapsedAvailabilityForTelecomReport = getElapsedAvailabilityForTelecomReport;
async function getTotalElapsedAvailabilityForDateRange(volunteerId, fromDate, toDate) {
    const historyDocs = await (0, Availability_1.getAvailabilityHistoryForDatesByVolunteerId)(volunteerId, fromDate, toDate);
    const legacyDocs = await (0, Availability_1.getLegacyAvailabilityHistoryForDatesByVolunteerId)(volunteerId, fromDate, toDate);
    let totalElapsedAvailability = 0;
    const allDocs = historyDocs.concat(legacyDocs);
    const byDay = lodash_1.default.groupBy(allDocs, doc => (0, moment_1.default)(doc.recordedAt).startOf('day'));
    for (const day in byDay) {
        const doc = byDay[day].sort((a, b) => a.recordedAt > b.recordedAt ? 1 : -1)[0];
        const dayOfWeek = (0, Availability_1.getAvailabilityDay)((0, moment_1.default)(doc.recordedAt).day());
        totalElapsedAvailability += getElapsedAvailabilityForDay(doc.availability[dayOfWeek]);
    }
    return totalElapsedAvailability;
}
exports.getTotalElapsedAvailabilityForDateRange = getTotalElapsedAvailabilityForDateRange;
