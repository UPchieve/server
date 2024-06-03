"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIpAddress = exports.findOrCreateIpAddress = exports.getIpWhoIs = void 0;
const axios_1 = __importDefault(require("axios"));
const node_1 = __importDefault(require("@sentry/node"));
const IpAddress_1 = require("../models/IpAddress");
const Errors_1 = require("../models/Errors");
const type_utils_1 = require("../utils/type-utils");
const net_1 = __importDefault(require("net"));
const clean_ip_string_1 = require("../utils/clean-ip-string");
const config_1 = __importDefault(require("../config"));
async function getIpWhoIs(rawIpString) {
    const ipString = (0, clean_ip_string_1.cleanIpString)(rawIpString);
    const ipWhoIs = config_1.default.NODE_ENV === 'dev'
        ? `http://free.ipwhois.io/json/${ipString}`
        : `http://ipwhois.pro/json/${ipString}?key=${config_1.default.ipWhoIsApiKey}`;
    try {
        const { data } = (await axios_1.default.get(ipWhoIs, {
            timeout: 1500,
        }));
        return data;
    }
    catch (err) {
        node_1.default.captureException(err);
        // TODO: should we just throw here?
        return {};
    }
}
exports.getIpWhoIs = getIpWhoIs;
async function findOrCreateIpAddress(rawIpString) {
    const ipString = (0, clean_ip_string_1.cleanIpString)(rawIpString);
    const existingIpAddress = await (0, IpAddress_1.getIpByRawString)(ipString);
    if (existingIpAddress)
        return existingIpAddress;
    const newIpAddress = await (0, IpAddress_1.insertIpByRawString)(ipString);
    return newIpAddress;
}
exports.findOrCreateIpAddress = findOrCreateIpAddress;
function isValidIp(ip) {
    // net.isIp return 0 for non-IPs, 4 for ipv4, and 6 for ipv6
    return net_1.default.isIP(ip) > 0;
}
async function checkIpAddress(data) {
    const ip = (0, type_utils_1.asString)(data);
    if (!isValidIp(ip))
        throw new Error('Not a valid IP address');
    const { country_code: countryCode } = await getIpWhoIs(ip);
    if (countryCode && countryCode !== 'US')
        throw new Errors_1.NotAllowedError();
}
exports.checkIpAddress = checkIpAddress;
