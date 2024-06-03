"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanIpString = void 0;
function cleanIpString(rawIpString) {
    // Remove ipv6 prefix if present
    const ipString = rawIpString.indexOf('::ffff:') === 0 ? rawIpString.slice(7) : rawIpString;
    return ipString;
}
exports.cleanIpString = cleanIpString;
