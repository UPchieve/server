"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remoteJoinRoom = exports.getSocketIdsFromRoom = exports.getSocketsFromRoom = void 0;
async function getSocketsFromRoom(io, room) {
    const sockets = await io.in(room).fetchSockets();
    return sockets;
}
exports.getSocketsFromRoom = getSocketsFromRoom;
async function getSocketIdsFromRoom(io, room) {
    const sockets = await getSocketsFromRoom(io, room);
    return sockets.map(socket => socket.id);
}
exports.getSocketIdsFromRoom = getSocketIdsFromRoom;
function remoteJoinRoom(io, socketId, room) {
    return io.in(socketId).socketsJoin(room);
}
exports.remoteJoinRoom = remoteJoinRoom;
