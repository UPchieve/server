"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketEmitter = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const uuid_1 = require("uuid");
const config_1 = __importDefault(require("../../config"));
const logger_1 = __importDefault(require("../../logger"));
const types_1 = require("./types");
class WebSocketEmitter {
    constructor(channel, options = {}) {
        this.rooms = {};
        this.PubClient = new ioredis_1.default(config_1.default.redisConnectionString);
        this.SubClient = new ioredis_1.default(config_1.default.redisConnectionString);
        this.channel = '';
        // @note: An encoder may take a data format and produce a representation that is suitable
        //        for transmitting over a WebSocket, e.g JSON into binary representations
        this.encoder = null;
        // @note: Use of arrow function to bind `this` to the class instead of Redis
        this.onMessage = (pattern, channel, message) => {
            const roomId = channel.slice(this.channel.length);
            let packet;
            try {
                packet = (0, types_1.asWebSocketPacket)(JSON.parse(message), `Unsuitable WebSocket packet shape for room ${roomId}`);
            }
            catch (error) {
                if (error instanceof Error)
                    logger_1.default.error(error.message);
                return;
            }
            // No WebSocket clients were initialized for the room
            if (!Array.isArray(this.rooms[roomId]))
                return;
            const websocketId = packet.socketId;
            for (const client of this.rooms[roomId]) {
                // Send to all clients except for the client who initiated the message
                if (websocketId === client.id)
                    continue;
                if (this.encoder)
                    client.send(this.encoder(packet.message));
                else
                    client.send(packet.message);
            }
        };
        this.channel = channel;
        if (options.encoder && typeof options.encoder === 'function')
            this.encoder = options.encoder;
        this.SubClient.psubscribe(this.channel + '*');
        this.SubClient.on('pmessage', this.onMessage);
    }
    addIdToWebSocket(ws) {
        const wsId = (0, uuid_1.v4)();
        ws.id = wsId;
        return ws;
    }
    addClientToRoom(ws, roomId) {
        const updatedWs = this.addIdToWebSocket(ws);
        if (!this.rooms[roomId])
            this.rooms[roomId] = [];
        this.rooms[roomId].push(updatedWs);
    }
    removeClientFromRoom(ws, roomId) {
        this.rooms[roomId] = this.rooms[roomId].filter(roomClients => roomClients.id !== ws.id);
        if (this.rooms[roomId].length === 0)
            delete this.rooms[roomId];
    }
    getRoomClients(roomId) {
        return this.rooms[roomId];
    }
    broadcast(path, packet) {
        this.PubClient.publish(this.channel + path, JSON.stringify(packet));
    }
}
exports.WebSocketEmitter = WebSocketEmitter;
