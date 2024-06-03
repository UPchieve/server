"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSocket = exports.getSocket = void 0;
const socket_io_client_1 = require("socket.io-client");
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../logger"));
/*
 * transport/upgrade options: https://github.com/socketio/socket.io-client/issues/1097
 */
let protocol;
if (config_1.default.NODE_ENV === 'dev') {
    protocol = 'http';
}
else {
    protocol = 'https';
}
const port = config_1.default.NODE_ENV === 'dev' ? `:${config_1.default.socketsPort}` : '';
const socketUri = `${protocol}://${config_1.default.clusterServerAddress}${port}`;
const socket = (0, socket_io_client_1.io)(socketUri, {
    query: { key: config_1.default.socketApiKey },
    autoConnect: false,
    reconnection: true,
    transports: ['websocket'],
    upgrade: false,
});
socket.on('connect', () => {
    logger_1.default.info('Worker socket connected');
});
socket.on('connect_error', error => {
    logger_1.default.error(`Worker socket connection error: ${error.message} - ${error}`);
});
socket.on('disconnect', reason => {
    if (reason === 'io server disconnect' || reason === 'transport close')
        socket.connect();
    logger_1.default.warn(`Worker socket disconnected: ${reason}`);
});
socket.on('reconnect_attempt', () => {
    logger_1.default.info(`Worker socket attempting to reconnect`);
});
socket.on('reconnect_failed', () => {
    logger_1.default.error('Worker socket failed to reconnect');
});
socket.on('reconnect_error', error => {
    logger_1.default.error(`Worker socket reconnection error: ${error.message} - ${error}`);
});
socket.on('error', error => {
    logger_1.default.error(`Worker socket general error: ${error.message} - ${error}`);
});
function getSocket() {
    return socket;
}
exports.getSocket = getSocket;
function startSocket() {
    socket.connect();
}
exports.startSocket = startSocket;
