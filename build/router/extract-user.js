"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSocketUser = exports.extractUser = void 0;
const Errors_1 = require("../models/Errors");
function extractUser(req) {
    if (!req.user)
        throw new Errors_1.NotAuthenticatedError();
    return req.user;
}
exports.extractUser = extractUser;
// Non-existent user is handled by socket middleware
function extractSocketUser(socket) {
    const { request: { user: socketUser }, } = socket;
    return socketUser;
}
exports.extractSocketUser = extractSocketUser;
