"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const countAvailabilitySelected = (availability) => {
    let selectedHours = 0;
    for (const day in availability) {
        if (Object.prototype.hasOwnProperty.call(availability, day)) {
            const hours = availability[day];
            for (const hour in hours) {
                if (Object.prototype.hasOwnProperty.call(hours, hour)) {
                    const isSelected = hours[hour];
                    if (isSelected)
                        selectedHours++;
                }
            }
        }
    }
    return selectedHours;
};
exports.default = countAvailabilitySelected;
