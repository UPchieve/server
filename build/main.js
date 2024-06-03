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
require("newrelic");
const config_1 = __importDefault(require("./config"));
const config_type_1 = require("./config-type");
const app_1 = __importStar(require("./app"));
const logger_1 = __importDefault(require("./logger"));
const listeners_1 = require("./services/listeners");
const server_setup_1 = require("./server-setup");
const graceful_shutdown_1 = require("./graceful-shutdown");
const db_1 = require("./db");
async function main() {
    try {
        config_type_1.Config.check(config_1.default);
    }
    catch (err) {
        throw new Error(`error parsing config on startup: ${err}`);
    }
    await (0, db_1.setupDbConnection)();
    (0, listeners_1.registerListeners)();
    const port = config_1.default.apiPort;
    const server = app_1.default.listen(port, () => {
        logger_1.default.info('api server listening on port ' + port);
    });
    // avoid conflict with development tools that allow for restarts when a file changes
    if (config_1.default.NODE_ENV !== 'dev') {
        (0, server_setup_1.serverSetup)(server);
        (0, graceful_shutdown_1.registerGracefulShutdownListeners)(server, (0, db_1.getClient)(), app_1.io);
    }
}
try {
    main();
}
catch (err) {
    logger_1.default.error(err);
    process.exit(1);
}
