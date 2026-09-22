import { Request } from 'express'
import { UserContactInfo } from '../models/User'
import { NotAuthenticatedError } from '../models/Errors'
import { SocketUser } from '../types/socket-types'
import { getRoleContext } from '../services/UserRolesService'
import { getUserContactInfo } from '../services/UserService'

export function extractUser(req: Request): UserContactInfo {
  if (!req.user) throw new NotAuthenticatedError()
  return req.user as UserContactInfo
}

export function extractUserIfExists(req: Request): UserContactInfo | undefined {
  return req.user as UserContactInfo
}

// Non-existent user is handled by socket middleware
export async function extractSocketUser(
  socket: SocketUser,
  refresh = false
): Promise<UserContactInfo> {
  const {
    request: { user: socketUser },
  } = socket
  if (!socketUser) throw new NotAuthenticatedError()

  if (refresh) {
    // `socket.request.user` is the state of the user _when their socket connects_.
    // If something changes about that user while they are actively on
    // the app, their user object on the socket is stale.
    // Allow for a force refresh of the `socket.request.user`.
    const user = await getUserContactInfo(socketUser.id)
    if (!user) throw new NotAuthenticatedError()
    return user
  }

  const latestRoleContext = await getRoleContext(socketUser.id)
  return { ...socketUser, roleContext: latestRoleContext }
}
