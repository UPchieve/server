"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jobs_1 = require("../worker/jobs");
const type_utils_1 = require("../utils/type-utils");
const logger_1 = require("../worker/logger");
const AvailabilityService_1 = require("../services/AvailabilityService");
const Availability_1 = require("../models/Availability");
const queries_1 = require("../models/Volunteer/queries");
const moment_1 = __importDefault(require("moment"));
require("moment-timezone");
const count_availability_selected_1 = __importDefault(require("../utils/count-availability-selected"));
async function backfillUpdateElapsedAvailability(job) {
    const outageDate = new Date((0, type_utils_1.asString)(job.data.outageDate));
    const volunteerIds = await (0, queries_1.getVolunteerIdsForElapsedAvailability)();
    let totalUpdated = 0;
    const errors = [];
    for (const volunteerId of volunteerIds) {
        const availability = await (0, Availability_1.getAvailabilityForVolunteerByDate)(volunteerId, outageDate);
        if (!availability || (0, count_availability_selected_1.default)(availability) === 0)
            continue;
        const dayBeforeOutage = (0, moment_1.default)(outageDate)
            .utc()
            .subtract(1, 'days')
            .format('dddd');
        const availabilityDay = availability[dayBeforeOutage];
        const elapsedAvailability = (0, AvailabilityService_1.getElapsedAvailabilityForDay)(availabilityDay);
        try {
            await (0, queries_1.updateVolunteerElapsedAvailabilityById)(volunteerId, elapsedAvailability);
        }
        catch (error) {
            errors.push(`Volunteer ${volunteerId} failed to update elapsed availability: ${error}`);
            continue;
        }
        try {
            await (0, Availability_1.saveAvailabilityAsHistoryByDate)(volunteerId, outageDate);
        }
        catch (error) {
            errors.push(`Volunteer ${volunteerId} updated availability but failed to create availability history: ${error}`);
            continue;
        }
        totalUpdated += 1;
    }
    (0, logger_1.log)(`Successfully ${jobs_1.Jobs.BackfillUpdateElapsedAvailability} for ${totalUpdated} volunteers`);
    if (errors.length) {
        throw new Error(`Failed to ${jobs_1.Jobs.BackfillUpdateElapsedAvailability} for volunteers ${errors}`);
    }
}
exports.default = backfillUpdateElapsedAvailability;
