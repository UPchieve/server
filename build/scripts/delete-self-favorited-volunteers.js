"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Student_1 = require("../models/Student");
const UserAction_1 = require("../models/UserAction");
/**
 *
 * This is a one-time script that removes volunteers who were able to favorite themselves
 * via a bug on the platform. This script also removes the associated user actions
 * that are created when a user is favorited.
 *
 */
async function main() {
    await (0, Student_1.deleteSelfFavoritedVolunteers)();
    await (0, UserAction_1.deleteSelfFavoritedVolunteersActions)();
}
exports.default = main;
