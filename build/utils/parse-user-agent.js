"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAgentInfo = void 0;
const ua_parser_js_1 = __importDefault(require("ua-parser-js"));
const getDeviceFromUserAgent_1 = __importDefault(require("./getDeviceFromUserAgent"));
function getUserAgentInfo(userAgent) {
    const userAgentParserResult = new ua_parser_js_1.default(userAgent).getResult();
    const { device, browser, os } = userAgentParserResult;
    return {
        device: device.vendor || (0, getDeviceFromUserAgent_1.default)(userAgent),
        browser: browser.name || '',
        browserVersion: browser.version || '',
        operatingSystem: os.name || '',
        operatingSystemVersion: os.version || '',
    };
}
exports.getUserAgentInfo = getUserAgentInfo;
