import { Request } from 'express'
import { UserContactInfo } from '../models/User'
import { NotAuthenticatedError } from '../models/Errors'
import { SocketUser } from '../types/socket-types'
import { getRoleContext } from '../services/UserRolesService'

export function extractUser(req: Request): UserContactInfo {
  if (!req.user) throw new NotAuthenticatedError()
  return req.user as UserContactInfo
}

export function extractUserIfExists(req: Request): UserContactInfo | undefined {
  return req.user as UserContactInfo
}

// Non-existent user is handled by socket middleware
export async function extractSocketUser(
  socket: SocketUser
): Promise<UserContactInfo> {
  const {
    request: { user: socketUser },
  } = socket
  const latestRoleContext = await getRoleContext(socketUser!.id)
  return { ...socketUser, roleContext: latestRoleContext } as UserContactInfo
}
