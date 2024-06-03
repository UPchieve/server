"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
require("moment-timezone");
const queries_1 = require("../../models/Volunteer/queries");
const logger_1 = require("../logger");
const AvailabilityService_1 = require("../../services/AvailabilityService");
const Availability_1 = require("../../models/Availability");
const _1 = require(".");
const count_availability_selected_1 = __importDefault(require("../../utils/count-availability-selected"));
exports.default = async () => {
    const volunteerIds = await (0, queries_1.getVolunteerIdsForElapsedAvailability)();
    let totalUpdated = 0;
    const errors = [];
    for (const volunteerId of volunteerIds) {
        const availability = await (0, Availability_1.getAvailabilityForVolunteer)(volunteerId);
        if (!availability || (0, count_availability_selected_1.default)(availability) === 0)
            continue;
        const yesterday = (0, moment_1.default)()
            .utc()
            .subtract(1, 'days')
            .format('dddd');
        const availabilityDay = availability[yesterday];
        const elapsedAvailability = (0, AvailabilityService_1.getElapsedAvailabilityForDay)(availabilityDay);
        try {
            await (0, queries_1.updateVolunteerElapsedAvailabilityById)(volunteerId, elapsedAvailability);
        }
        catch (error) {
            errors.push(`Volunteer ${volunteerId} failed to update elapsed availability: ${error}`);
            continue;
        }
        try {
            await (0, Availability_1.saveCurrentAvailabilityAsHistory)(volunteerId);
        }
        catch (error) {
            errors.push(`Volunteer ${volunteerId} updated availability but failed to create availability history: ${error}`);
            continue;
        }
        totalUpdated += 1;
    }
    (0, logger_1.log)(`Successfully ${_1.Jobs.UpdateElapsedAvailability} for ${totalUpdated} volunteers`);
    if (errors.length) {
        throw new Error(`Failed to ${_1.Jobs.UpdateElapsedAvailability} for volunteers ${errors}`);
    }
};
