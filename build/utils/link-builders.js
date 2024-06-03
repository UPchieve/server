"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAppLink = void 0;
const config_1 = __importDefault(require("../config"));
function buildAppLink(path) {
    const { host } = config_1.default.client;
    const protocol = config_1.default.NODE_ENV === 'production' ? 'https' : 'http';
    return `${protocol}://${host}/${path}`;
}
exports.buildAppLink = buildAppLink;
