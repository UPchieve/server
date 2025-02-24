import { getClient, TransactionClient } from '../db'
import { Ulid } from '../models/pgUtils'
import * as UserRepo from '../models/User'
import { UserRole } from '../models/User'
import * as CacheService from '../cache'
import { KeyNotFoundError } from '../cache'
import config from '../config'

/**
 * @deprecated Use {@link RoleContext} instead
 */
export async function getUserRolesById(
  userId: Ulid,
  tc: TransactionClient = getClient()
) {
  const roles = await UserRepo.getUserRolesById(userId, tc)
  return {
    userType: getUserTypeFromRoles(roles, userId),
    isAdmin: roles.includes('admin') ?? false,
    // TODO: Remove once no longer any references.
    isVolunteer: roles.includes('volunteer'),
  }
}

/**
 * @deprecated Use {@link RoleContext} instead
 */
export function getUserTypeFromRoles(roles: UserRole[] = [], userId: Ulid) {
  const userTypes = roles.filter(r => r !== 'admin')
  // For now, we assume all users have one role, not including admin.
  if (!userTypes.length) {
    throw new Error(`User with id ${userId} has no roles.`)
  } else if (userTypes.length > 1) {
    throw new Error(`Unexpected number of roles for user with id ${userId}.`)
  }

  return userTypes[0]
}

/**
 * @deprecated Use {@link RoleContext} instead
 */
export function isVolunteerUserType(userType: UserRole) {
  return userType === 'volunteer'
}

/**
 * @deprecated Use {@link RoleContext} instead
 */
export function isStudentUserType(userType: UserRole) {
  return userType === 'student'
}

/**
 * @deprecated Use {@link RoleContext} instead
 */
export function isTeacherUserType(userType: UserRole) {
  return userType === 'teacher'
}

export class RoleContext {
  readonly roles: UserRole[]
  readonly activeRole: UserRole

  constructor(roles: UserRole[], activeRole: UserRole) {
    this.roles = roles
    this.activeRole = activeRole
  }

  isActiveRole(role: UserRole) {
    return this.activeRole === role
  }

  hasRole(role: UserRole) {
    return this.roles.includes(role)
  }

  isAdmin() {
    // @TODO Can just use hasRole.
    return this.roles.includes('admin')
  }
}

export async function getRoleContext(
  userId: string,
  tc?: TransactionClient
): Promise<RoleContext | undefined> {
  try {
    const key = `${config.cacheKeys.userRoleContextPrefix}${userId}`
    const roleContextStr = await CacheService.get(key)
    const data: { activeRole: UserRole; roles: UserRole[] } = JSON.parse(
      roleContextStr
    )
    return new RoleContext(data.roles, data.activeRole)
  } catch (err) {
    if (!(err instanceof KeyNotFoundError)) {
      throw err
    }
    // On cache miss: Create RoleContext from DB and save to cache
    const roles = await UserRepo.getUserRolesById(userId, tc ?? getClient())
    const activeRole = roles.filter(
      r => r === 'volunteer' || r === 'student' || r === 'teacher'
    )[0] // @TODO Handle failure.
    const roleContext = new RoleContext(roles, activeRole)
    await updateRoleContext(userId, roles, activeRole)
    return roleContext
  }
}

export async function updateRoleContext(
  userId: string,
  roles: UserRole[],
  activeRole: UserRole
): Promise<void> {
  const key = `${config.cacheKeys.userRoleContextPrefix}${userId}`
  await CacheService.save(key, JSON.stringify({ roles, activeRole }))
}
