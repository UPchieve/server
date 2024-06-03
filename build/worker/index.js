"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bull_1 = __importDefault(require("bull"));
const newrelic_1 = __importDefault(require("newrelic"));
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = __importDefault(require("../config"));
const db = __importStar(require("../db"));
const logger_1 = __importDefault(require("../logger"));
const jobs_1 = require("./jobs");
const sockets_1 = require("./sockets");
const main = async () => {
    try {
        await db.connect();
        logger_1.default.info('Starting queue');
        const queue = new bull_1.default(config_1.default.workerQueueName, {
            createClient: () => new ioredis_1.default(config_1.default.redisConnectionString, {
                /**
                 *
                 * `enableReadyCheck: false` and `maxRetriesPerRequest: null` are defaults introduced in bull v4.0
                 * that allow for the queue to continue processing jobs after Redis reconnects. Without these options,
                 * jobs are stuck and not processed by the queue once Redis reconnects.
                 * The only solution when that happens is to restart the queue manually.
                 *
                 * You can read more about the reconnection issue and bull solution here:
                 * https://github.com/OptimalBits/bull/issues/890#issuecomment-430645188
                 *
                 *
                 * TODO: remove `enableReadyCheck` and `maxRetriesPerRequest` options once our version of `bull` is upgraded to v4.0+
                 *
                 */
                enableReadyCheck: false,
                maxRetriesPerRequest: null,
            }),
            settings: {
                // to prevent stalling long jobs
                stalledInterval: 1000 * 60 * 30,
                lockDuration: 1000 * 60 * 30,
            },
        });
        queue.on('error', error => {
            logger_1.default.error(`error in queue: ${error}`);
            newrelic_1.default.noticeError(error);
        });
        (0, sockets_1.startSocket)();
        (0, jobs_1.addJobProcessors)(queue);
    }
    catch (error) {
        newrelic_1.default.noticeError(error);
        // handle redis connection errors; for whatever reason Redis.ReplyError type is not in the declarations file
        if (error.code === 'ECONNREFUSED') {
            logger_1.default.error(`could not connect to redis server: ${config_1.default.redisConnectionString}`);
        }
        else {
            logger_1.default.error(`error from worker process: ${error}`);
        }
    }
};
main().catch(error => {
    logger_1.default.error(`error in worker main: ${error}`);
    newrelic_1.default.noticeError(error);
});
