"use strict";
/**
 * Cache
 * @module cache
 * The cache module is a wrapper around some fast key/value store,
 * (currently Redis).
 * It exposes a couple of CRUD type functions to abstract cache methods
 * so that if we want to swap the backend in the future we can do
 * so in one place.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smembers = exports.sadd = exports.lock = exports.lpop = exports.rpush = exports.append = exports.remove = exports.get = exports.getTimeToExpiration = exports.saveWithExpiration = exports.save = exports.KeyDeletionFailureError = exports.AppendLengthZeroError = exports.KeyNotFoundError = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const ts_custom_error_1 = require("ts-custom-error");
const config_1 = __importDefault(require("../config"));
const redlock_1 = __importDefault(require("redlock"));
const redisClient = new ioredis_1.default(config_1.default.redisConnectionString);
const redisLock = new redlock_1.default([redisClient]);
// TODO: we should just return undefiend on KeyNotFound
class KeyNotFoundError extends ts_custom_error_1.CustomError {
    constructor(attemptedKey) {
        super(`key ${attemptedKey} was not found in the cache`);
    }
}
exports.KeyNotFoundError = KeyNotFoundError;
class AppendLengthZeroError extends ts_custom_error_1.CustomError {
    constructor(attemptedKey) {
        super(`length of doucment ${attemptedKey} after append was 0`);
    }
}
exports.AppendLengthZeroError = AppendLengthZeroError;
class KeyDeletionFailureError extends ts_custom_error_1.CustomError {
    constructor(attemptedKey) {
        super(`deletion of key ${attemptedKey} failed`);
    }
}
exports.KeyDeletionFailureError = KeyDeletionFailureError;
async function save(key, value) {
    await redisClient.set(key, value);
}
exports.save = save;
/**
 *
 * @param key
 * @param value
 * @param seconds defaults to 1 day
 */
async function saveWithExpiration(key, value, seconds = 86400) {
    // possible expiryMode values: https://redis.io/commands/set
    await redisClient.set(key, value, 'EX', seconds);
}
exports.saveWithExpiration = saveWithExpiration;
async function getTimeToExpiration(key) {
    return await redisClient.ttl(key);
}
exports.getTimeToExpiration = getTimeToExpiration;
async function get(key) {
    const value = await redisClient.get(key);
    if (value === null) {
        throw new KeyNotFoundError(key);
    }
    return value;
}
exports.get = get;
async function remove(key) {
    return await redisClient.del(key);
}
exports.remove = remove;
async function append(key, addition) {
    const docLength = await redisClient.append(key, addition);
    if (docLength === 0)
        throw new AppendLengthZeroError(key);
}
exports.append = append;
async function rpush(key, addition) {
    return await redisClient.rpush(key, [addition]);
}
exports.rpush = rpush;
async function lpop(key) {
    return await redisClient.lpop(key);
}
exports.lpop = lpop;
async function lock(key, lockDuration) {
    return await redisLock.lock(`lock:${key}`, lockDuration);
}
exports.lock = lock;
async function sadd(key, member) {
    return await redisClient.sadd(key, member);
}
exports.sadd = sadd;
async function smembers(key) {
    return await redisClient.smembers(key);
}
exports.smembers = smembers;
