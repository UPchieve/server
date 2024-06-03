"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketIoSubClient = exports.socketIoPubClient = exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = __importDefault(require("../config"));
exports.redisClient = new ioredis_1.default(config_1.default.redisConnectionString);
exports.socketIoPubClient = new ioredis_1.default(config_1.default.redisConnectionString);
exports.socketIoSubClient = new ioredis_1.default(config_1.default.redisConnectionString);
