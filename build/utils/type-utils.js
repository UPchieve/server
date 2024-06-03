"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPgId = exports.asUnion = exports.asFactory = exports.asEnum = exports.asAny = exports.asFunction = exports.asDate = exports.asArray = exports.asBoolean = exports.asNumber = exports.asString = exports.asUlid = exports.asOptional = void 0;
const Errors_1 = require("../models/Errors");
const id128_1 = require("id128");
// Typecheck framework taken from https://stackoverflow.com/a/58861766
// Use via asOptional(asPrimitive)
function asOptional(as) {
    return function (s, errMsg) {
        if (s === undefined || s === null)
            return undefined;
        return as(s, errMsg);
    };
}
exports.asOptional = asOptional;
function asUlid(s, errMsg = '') {
    if (typeof s === 'string')
        return s;
    throw new Errors_1.InputError(`${errMsg} ${s} is not a string`);
}
exports.asUlid = asUlid;
// Primitive typechecks
function asString(s, errMsg = '') {
    if (typeof s === 'string')
        return s;
    throw new Errors_1.InputError(`${errMsg} ${s} is not a string`);
}
exports.asString = asString;
function asNumber(s, errMsg) {
    if (typeof s === 'number')
        return s;
    else {
        const coerced = isNaN(parseInt(s))
            ? parseFloat(s)
            : parseInt(s);
        if (!isNaN(coerced))
            return coerced;
    }
    throw new Errors_1.InputError(`${errMsg} : ${s} is not a number`);
}
exports.asNumber = asNumber;
function asBoolean(s, errMsg) {
    if (typeof s === 'boolean')
        return s;
    if (s === 'true')
        return true;
    if (s === 'false')
        return false;
    throw new Errors_1.InputError(`${errMsg} : ${s} is not a boolean`);
}
exports.asBoolean = asBoolean;
// Use via asArray(asPrimitive)
function asArray(as) {
    return function (s, errMsg) {
        if (Array.isArray(s)) {
            const maybeT = s;
            if (maybeT.every(item => {
                as(item, errMsg); // running `asFoo` validator will throw if it fails
                return true;
            }))
                return maybeT;
        }
        throw new Errors_1.InputError(`${errMsg} : ${s} is not an array of the given type`);
    };
}
exports.asArray = asArray;
function asDate(s, errMsg) {
    if (s instanceof Date)
        return s;
    throw new Errors_1.InputError(`${errMsg} : ${s} is not a Date`);
}
exports.asDate = asDate;
function asFunction(s, errMsg) {
    if (typeof s === 'function')
        return s;
    throw new Errors_1.InputError(`${errMsg} : ${s} is not a function`);
}
exports.asFunction = asFunction;
function asAny(s) {
    return s;
}
exports.asAny = asAny;
/**
 * asEnum<T>(enum)
 * example usage: asEnum<USER_BAN_REASON>(USER_BAN_REASON)
 *
 * @todo: create better usage -> asEnum<USER_BAN_REASON>(USER_BAN_REASON.ADMIN)
 **/
function asEnum(e) {
    return function (s, errMsg) {
        for (const value of Object.values(e)) {
            if (value === s)
                return s;
        }
        throw new Errors_1.InputError(`${errMsg} : ${s} is not a type of the given enum`);
    };
}
exports.asEnum = asEnum;
/**
 * Typecheck Factory use:
 *
 * interface Foo {
 *     bar: string,
 *     baz?: number
 * }
 * interface Fizz {
 *     buzz: Foo
 * }
 *
 * const asFoo = asFactory<Foo>({
 *     bar: asString,
 *     baz: asOptional(asNumber)
 * })
 *
 * const asFizz = asFactory<Fizz>({
 *     buzz: asFoo
 * })
 */
function asFactory(keyValidators) {
    return function (data, errMsg = '') {
        if (typeof data === 'object' && data !== null) {
            const maybeT = data;
            for (const key of Object.keys(keyValidators)) {
                keyValidators[key](maybeT[key], errMsg + key + ':');
            }
            return maybeT;
        }
        throw new Errors_1.InputError(`${errMsg}: data is not compatible with type`);
    };
}
exports.asFactory = asFactory;
// @note: proof of concept
function asUnion(fns) {
    return function (s, errMsg) {
        if (Array.isArray(fns)) {
            const errors = [];
            const isUnion = false;
            for (const fn of fns) {
                try {
                    const maybeT = fn(s, errMsg);
                    return maybeT;
                }
                catch (error) {
                    errors.push(error);
                }
            }
            if (!isUnion)
                throw new Error(errors.join(', '));
        }
        else
            throw new Errors_1.InputError(`${errMsg} : ${fns} is not an array of validators`);
    };
}
exports.asUnion = asUnion;
// helper to check if the incoming ID is a PG id or mongo id
// TODO: remove once mongo ids are no longer stored in cached jobs
function isPgId(id) {
    try {
        id128_1.Uuid4.fromCanonical(id);
        return true;
    }
    catch (err) {
        if (err instanceof id128_1.Exception.InvalidEncoding)
            return false;
        throw err;
    }
}
exports.isPgId = isPgId;
