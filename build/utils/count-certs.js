"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const countCerts = (certifications) => {
    let numCerts = 0;
    for (const subject in certifications) {
        if (certifications[subject].passed) {
            numCerts += 1;
        }
    }
    return numCerts;
};
exports.default = countCerts;
