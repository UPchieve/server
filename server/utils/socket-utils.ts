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
  return sockets.map((socket) => socket.id)
}

export function remoteJoinRoom(io: Server, socketId: string, room: string) {
  return io.in(socketId).socketsJoin(room)
}

export async function emitSessionPresence(
  io: Server,
  socketId: string,
  userId: string,
  room: string,
  isLeaving: boolean = false
) {
  const sessionSocketIds = await getSocketIdsFromRoom(io, room)
  let userSocketIds = await getSocketIdsFromRoom(io, userId)
  // If handling a disconnection or session leave, exclude the leaving socket ID
  if (isLeaving) userSocketIds = userSocketIds.filter((id) => id !== socketId)

  const userHasSocketsInSession = userSocketIds.some((id) =>
    sessionSocketIds.includes(id)
  )

  io.to(room)
    .except(userId)
    .emit('sessions/partner:in-session', userHasSocketsInSession)

  // If the socket is joining, let the joining user know if their partner is present
  if (!isLeaving) {
    const isPartnerInSession = sessionSocketIds.some(
      (id) => !userSocketIds.includes(id)
    )
    io.to(socketId).emit('sessions/partner:in-session', !!isPartnerInSession)
  }
}
