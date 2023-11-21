import { Server } from 'socket.io'

export async function getSocketsFromRoom(io: Server, room: string) {
  const sockets = await io.in(room).fetchSockets()
  return sockets
}

export async function getSocketIdsFromRoom(
  io: Server,
  room: string
): Promise<string[]> {
  const sockets = await getSocketsFromRoom(io, room)
  return sockets.map(socket => socket.id)
}

export function remoteJoinRoom(io: Server, socketId: string, room: string) {
  return io.in(socketId).socketsJoin(room)
}
