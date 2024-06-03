"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPgid = exports.getUuid = exports.getDbUlid = exports.makeSomeRequired = exports.makeSomeOptional = exports.makeRequired = exports.generateReferralCode = void 0;
const lodash_1 = __importDefault(require("lodash"));
const id128_1 = require("id128");
const uuid_1 = require("uuid");
const ts_custom_error_1 = require("ts-custom-error");
const base64url_1 = __importDefault(require("base64url"));
function generateReferralCode(userId) {
    return (0, base64url_1.default)(Buffer.from(userId, 'hex'));
}
exports.generateReferralCode = generateReferralCode;
/**
 * pgTyped DOES NOT actually modify the incoming data to use camelCase keys even
 * though it does do so for the return type. As such we must manually convert the
 * keys to camelCase at runtime. This function is invoked at the start of
 * makeRequired and makeSomeOptional which themselves are necessary for parsing
 * incoming postgres data to convert null->undefined and, with the inclusion of
 * this function, convert snake_case keys to camelCase keys.
 *
 * Note that the below types/functions only work for flat objects, i.e. no
 * arrays or nesting. With SQL queries this should fit the return type anyways
 */
function camelCaseKeys(obj) {
    const temp = {};
    for (const key in obj) {
        temp[lodash_1.default.camelCase(key)] = obj[key];
    }
    return temp;
}
class UnexpectedNullError extends ts_custom_error_1.CustomError {
}
function makeRequired(obj) {
    const temp = camelCaseKeys(obj);
    for (const [key, value] of Object.entries(temp)) {
        if (value === null || value === undefined) {
            throw new UnexpectedNullError(`Key ${key} was unexpectedly null or undefined`);
        }
    }
    return temp;
}
exports.makeRequired = makeRequired;
function makeSomeOptional(obj, optionals) {
    const temp = camelCaseKeys(obj);
    for (const [key, value] of Object.entries(temp)) {
        if (value === null || value === undefined) {
            if (optionals.includes(key))
                temp[key] = undefined;
            else
                throw new UnexpectedNullError(`Key ${key} was unexpectedly null or undefined`);
        }
    }
    return temp;
}
exports.makeSomeOptional = makeSomeOptional;
function makeSomeRequired(obj, requireds) {
    const temp = camelCaseKeys(obj);
    for (const [key, value] of Object.entries(temp)) {
        if (value === null || value === undefined) {
            if (requireds.includes(key))
                throw new UnexpectedNullError(`Key ${key} was unexpectedly null or undefined`);
            temp[key] = undefined;
        }
    }
    return temp;
}
exports.makeSomeRequired = makeSomeRequired;
function getDbUlid() {
    return id128_1.Ulid.generate().toRaw();
}
exports.getDbUlid = getDbUlid;
function getUuid() {
    return (0, uuid_1.v4)().toString();
}
exports.getUuid = getUuid;
function getPgid() {
    return Math.floor(Math.random() * 8 ** 4); // int4
}
exports.getPgid = getPgid;
