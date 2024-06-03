"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerListeners = void 0;
const SessionServiceListeners_1 = require("./SessionServiceListeners");
const USMServiceListeners_1 = require("./USMServiceListeners");
const StudentServiceListeners_1 = require("./StudentServiceListeners");
const UserCreationServiceListeners_1 = require("./UserCreationServiceListeners");
const ProgressReportsServiceListeners_1 = require("./ProgressReportsServiceListeners");
function registerListeners() {
    (0, SessionServiceListeners_1.listeners)();
    (0, USMServiceListeners_1.listeners)();
    (0, StudentServiceListeners_1.listeners)();
    (0, UserCreationServiceListeners_1.listeners)();
    (0, ProgressReportsServiceListeners_1.listeners)();
}
exports.registerListeners = registerListeners;
