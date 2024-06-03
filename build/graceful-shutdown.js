"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGracefulShutdownListeners = void 0;
require("newrelic");
const logger_1 = __importDefault(require("./logger"));
const promises_1 = require("timers/promises");
const util_1 = require("util");
const server_setup_1 = require("./server-setup");
const product_client_1 = require("./product-client");
function gracefulShutdown(server, pool, ioServer) {
    const shutDownSocketServer = (0, util_1.promisify)(ioServer.close).bind(ioServer);
    return async function (signal) {
        logger_1.default.info(`${signal} signal received`);
        // immediately stop accepting new connections to the server
        server.close(async (err) => {
            if (err) {
                logger_1.default.error(err);
                process.exit(1);
            }
            logger_1.default.info('api server closed');
            await shutDownSocketServer();
            logger_1.default.info('socket server closed');
            await product_client_1.client.shutdownAsync();
            logger_1.default.info('shutting down posthog');
            // allow time for events to finish processing and making db calls before exiting
            await (0, promises_1.setTimeout)(5000);
            await pool.end();
            process.exit(0);
        });
        /**
         *
         * The API server doesn't close until all connections are closed. When we
         * call `server.close()` above, we stop receiving new connections, but the
         * remaining connections are open indefinitely because of keep-alive connections.
         * In order to close the server, we have to terminate those remaining connections ourselves.
         *
         */
        // allow for existing connections to finish up their responses before forcibly closing them
        await (0, promises_1.setTimeout)(500);
        (0, server_setup_1.getConnections)().forEach(conn => conn.end());
        // destroy any running connections that may have not been ended
        await (0, promises_1.setTimeout)(5000, () => {
            (0, server_setup_1.getConnections)().forEach(conn => conn.destroy());
        });
    };
}
function registerGracefulShutdownListeners(server, pool, ioServer) {
    const shutdown = gracefulShutdown(server, pool, ioServer);
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    process.on('SIGQUIT', shutdown);
}
exports.registerGracefulShutdownListeners = registerGracefulShutdownListeners;
