"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearSchedule = exports.updateSchedule = void 0;
const constants_1 = require("../constants");
const AnalyticsService_1 = require("../services/AnalyticsService");
const VolunteerService_1 = require("../services/VolunteerService");
const Availability_1 = require("../models/Availability");
const UserAction_1 = require("../models/UserAction");
const Volunteer_1 = require("../models/Volunteer");
async function updateSchedule(options) {
    const user = options.user;
    const newAvailability = options.availability;
    const newTimezone = options.tz;
    const ip = options.ip;
    const volunteer = await (0, Volunteer_1.getVolunteerForScheduleUpdate)(user.id);
    // an onboarded volunteer must have updated their availability, completed required training, and unlocked a subject
    let onboarded = volunteer.onboarded;
    if (!volunteer.onboarded &&
        volunteer.subjects &&
        volunteer.subjects.length > 0 &&
        volunteer.passedRequiredTraining) {
        onboarded = true;
        await (0, VolunteerService_1.queueOnboardingEventEmails)(volunteer.id);
        if (volunteer.volunteerPartnerOrg)
            await (0, VolunteerService_1.queuePartnerOnboardingEventEmails)(volunteer.id);
        await (0, UserAction_1.createAccountAction)({
            userId: volunteer.id,
            action: constants_1.ACCOUNT_USER_ACTIONS.ONBOARDED,
            ipAddress: ip,
        });
        (0, AnalyticsService_1.captureEvent)(volunteer.id, constants_1.EVENTS.ACCOUNT_ONBOARDED, {
            event: constants_1.EVENTS.ACCOUNT_ONBOARDED,
        });
    }
    await executeUpdate(volunteer, newTimezone, onboarded, newAvailability);
}
exports.updateSchedule = updateSchedule;
async function executeUpdate(user, 
// @note: this is set to optional to test the absence of an availability object
tz, // FIXME: constrain this to official timezones
onboarded, availability) {
    // verify that newAvailability is defined and not null
    if (!availability) {
        // early exit
        throw new Error('No availability object specified');
    }
    // verify that all of the day-of-week and time-of-day properties are defined on the
    // new availability object
    if (Object.keys(user.availability).some(key => {
        if (typeof availability[key] === 'undefined') {
            // day-of-week property needs to be defined
            return true;
        }
        // time-of-day properties also need to be defined
        return Object.keys(user.availability[key]).some(key2 => typeof availability[key][key2] === 'undefined');
    })) {
        throw new Error('Availability object missing required keys');
    }
    // TODO: run these with the same client
    await (0, Availability_1.saveCurrentAvailabilityAsHistory)(user.id);
    await (0, Availability_1.clearAvailabilityForVolunteer)(user.id);
    await Promise.all([
        (0, Availability_1.updateAvailabilityByVolunteerId)(user.id, availability, tz),
        (0, Volunteer_1.updateVolunteerThroughAvailability)(user.id, tz, onboarded),
    ]);
}
async function clearSchedule(user, tz // TODO: constrain this to official timezones
) {
    // TODO: run these with the same client
    await (0, Availability_1.saveCurrentAvailabilityAsHistory)(user.id);
    await (0, Availability_1.clearAvailabilityForVolunteer)(user.id);
    await (0, Volunteer_1.updateVolunteerThroughAvailability)(user.id, tz);
}
exports.clearSchedule = clearSchedule;
