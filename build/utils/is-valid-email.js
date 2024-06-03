"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
exports.default = isValidEmail;
