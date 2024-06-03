"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bull_1 = __importDefault(require("bull"));
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = __importDefault(require("../config"));
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
});
exports.default = queue;
