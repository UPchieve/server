"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
function createNewAvailability() {
    const availability = {};
    for (const day of constants_1.DAYS) {
        const currentDay = {};
        for (const hour of constants_1.HOURS) {
            currentDay[hour] = false;
        }
        availability[day] = currentDay;
    }
    return availability;
}
exports.default = createNewAvailability;
