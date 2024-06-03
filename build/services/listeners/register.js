"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const newrelic_1 = __importDefault(require("newrelic"));
const logger_1 = __importDefault(require("../../logger"));
const EventsService_1 = require("../EventsService");
function eventObservabilityWrapper(event, handler, name) {
    return (...args) => {
        newrelic_1.default.startBackgroundTransaction(`event:${event}`, async () => {
            const transaction = newrelic_1.default.getTransaction();
            logger_1.default.info(`handling ${event} with ${name} on args ${JSON.stringify(args)}`);
            try {
                await handler(...args);
                logger_1.default.info(`${name} successfully handled event ${event}`);
            }
            catch (error) {
                logger_1.default.error(`${name} error handling event ${event}: ${error}`);
                newrelic_1.default.noticeError(error);
            }
            finally {
                transaction.end();
            }
        }).catch(error => {
            logger_1.default.error(`error in event handler newrelic transaction: ${error}`);
            newrelic_1.default.noticeError(error);
        });
    };
}
/**
 * Registers a handler for an event with standard observability patterns. Handlers
 * should throw errors to be logged by the wrapper instead of logging on their own
 *
 * @param event {string} event name
 * @param handler {Function} event handler
 */
function register(event, handler, name) {
    EventsService_1.emitter.on(event, eventObservabilityWrapper(event, handler, name));
}
exports.default = register;
