"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isValidInternationalPhoneNumber = (phoneNumber) => phoneNumber.match(/^\+\d{10,14}$/);
exports.default = isValidInternationalPhoneNumber;
