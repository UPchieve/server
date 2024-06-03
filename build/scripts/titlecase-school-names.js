"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SchoolService_1 = require("../services/SchoolService");
/**
 * This is a one-time script to titlecase any school names that are
 * all uppercased.
 */
async function main() {
    await (0, SchoolService_1.titlecaseSchoolNames)();
}
exports.default = main;
