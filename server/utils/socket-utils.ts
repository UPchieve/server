import { Server } from 'socket.io'

export async function getSocketsFromRoom(io: Server, room: string) {
  // Normally we'd just do: `return await io.in(room).fetchSockets()`
  // However this doesn't seem to work with Valkey on our redis stream adapter, so this is a workaround
  // More info: https://github.com/socketio/socket.io/issues/4183#issuecomment-982181865
  const sockets = Array.from(io.sockets.sockets.values())
  return sockets.filter((s) => s.rooms.has(room))
}

export async function getSocketIdsFromRoom(
  io: Server,
  room: string
): Promise<string[]> {
  const sockets = await getSocketsFromRoom(io, room)
  return sockets.map((socket) => socket.id)
}

export function remoteJoinRoom(io: Server, socketId: string, room: string) {
  return io.in(socketId).socketsJoin(room)
}

/**
 *
 * Emit to all other sockets that are not the users and are connected
 * to the session room that we're now online.
 *
 * This handles cases where a user has
 * multiple tabs of the session view open
 *
 */
export async function emitSessionPresence(
  io: Server,
  socketId: string,
  userId: string,
  room: string
) {
  const userSocketIds = await getSocketIdsFromRoom(io, userId)
  io.to(room).except(userId).emit('sessions/partner:in-session', true)
  const sessionSocketIds = await getSocketIdsFromRoom(io, room)
  const partnerSocketIds = sessionSocketIds.filter(
    (id) => !userSocketIds.includes(id)
  )
  // Emit to self if session partner is in session or not
  io.to(socketId).emit('sessions/partner:in-session', !!partnerSocketIds.length)
}
