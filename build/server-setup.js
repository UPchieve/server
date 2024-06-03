"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnections = exports.serverSetup = void 0;
let connections = [];
function serverSetup(server) {
    server.on('connection', connection => {
        connections.push(connection);
        connection.on('close', () => (connections = connections.filter(curr => curr !== connection)));
    });
}
exports.serverSetup = serverSetup;
function getConnections() {
    return connections;
}
exports.getConnections = getConnections;
