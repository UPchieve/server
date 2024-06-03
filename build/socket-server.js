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
/**
 * Creates the socket server and returns the Server instance
 */
const http = __importStar(require("http"));
const socket_io_1 = require("socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./logger"));
const RedisService_1 = require("./services/RedisService");
const SocketService_1 = __importDefault(require("./services/SocketService"));
// Create an HTTPS server if in production, otherwise use HTTP.
const createServer = (app) => {
    return http.createServer(app);
};
function default_1(app) {
    const server = createServer(app);
    const port = process.env.NODE_ENV === 'test'
        ? // TODO: utilize the superagent port
            4000 + Math.floor(Math.random() * 5000) + 1
        : config_1.default.socketsPort;
    server.listen(port);
    logger_1.default.info('socket.io listening on port ' + port);
    const io = new socket_io_1.Server(server, {
        pingTimeout: 30000,
        cors: {
            origin: new RegExp(`^(${config_1.default.host})$`),
            credentials: true,
        },
        cookie: {
            name: 'subway-io',
            httpOnly: false,
        },
        allowEIO3: true,
    });
    if (process.env.NODE_ENV === 'test')
        return io;
    io.adapter((0, redis_adapter_1.createAdapter)(RedisService_1.socketIoPubClient, RedisService_1.socketIoSubClient));
    // Instantiate the SocketService singleton
    SocketService_1.default.getInstance(io);
    return io;
}
exports.default = default_1;
