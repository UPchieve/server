"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toTitleCase = void 0;
const case_1 = __importDefault(require("case"));
function toTitleCase(s) {
    if (!s) {
        return '';
    }
    return case_1.default.title(s);
}
exports.toTitleCase = toTitleCase;
