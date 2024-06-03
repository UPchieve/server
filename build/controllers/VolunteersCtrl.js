"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVolunteersAvailability = void 0;
const Availability_1 = require("../models/Availability");
/**
 * Helper function that, given a single users's
 * availability, adds when they are free to the
 * aggAvailabilities object
 * @param {*} availability
 */
function aggregateAvailabilities(availability, aggAvailabilities) {
    Object.keys(availability).map(day => {
        Object.keys(availability[day]).map(time => {
            // create headers based on the user's availability object
            if (!aggAvailabilities.daysOfWeek) {
                aggAvailabilities.daysOfWeek = Object.keys(availability);
            }
            if (!aggAvailabilities.timesOfDay) {
                aggAvailabilities.timesOfDay = Object.keys(availability[day]);
            }
            // gets corresponding day and time index inorder to store in aggAvailabilities table
            let dayIndex = aggAvailabilities.daysOfWeek.indexOf(day);
            let timeIndex = aggAvailabilities.timesOfDay.indexOf(time);
            if (availability[day][time]) {
                aggAvailabilities.table[dayIndex][timeIndex]++;
            }
        });
    });
    return aggAvailabilities;
}
/**
 * Helper function that finds the minimum and maxmimum number of
 * volunteers who signed up that week
 * @param {*} aggAvailabilities
 */
function findMinAndMax(aggAvailabilities) {
    let flatTable = aggAvailabilities.table.flat();
    aggAvailabilities.min = Math.min.apply(Math, flatTable);
    aggAvailabilities.max = Math.max.apply(Math, flatTable);
    return aggAvailabilities;
}
/**
 * Gets all users who are volunteers, and who are certified in the
 * subject passed in, and aggregates their availability tables into
 * aggAvailabilities.table
 * @param {*} certifiedSubject
 */
async function getVolunteersAvailability(certifiedSubject) {
    const availabilities = await (0, Availability_1.getAvailabilityForVolunteerHeatmap)(certifiedSubject);
    const check = availabilities.find(v => v.availability.Sunday['12a'] === true);
    let aggAvailabilities = {
        table: Array(7)
            .fill(0)
            .map(() => Array(24).fill(0)),
    };
    aggAvailabilities.min = undefined;
    aggAvailabilities.max = 0;
    aggAvailabilities = availabilities.reduce((aggAvailabilities, doc) => {
        return aggregateAvailabilities(doc.availability, aggAvailabilities);
    }, aggAvailabilities);
    aggAvailabilities = findMinAndMax(aggAvailabilities);
    return aggAvailabilities;
}
exports.getVolunteersAvailability = getVolunteersAvailability;
