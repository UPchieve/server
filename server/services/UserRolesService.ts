import { getClient, TransactionClient } from '../db'
import * as UserRepo from '../models/User'
import { UserRole } from '../models/User'
import * as CacheService from '../cache'
import config from '../config'
import { InputError } from '../models/Errors'

export class RoleContext {
  readonly roles: UserRole[]
  readonly activeRole: UserRole
  /** @deprecated */
  readonly legacyRole: UserRole

  constructor(roles: UserRole[], activeRole: UserRole, legacyRole: UserRole) {
    this.roles = roles
    this.activeRole = activeRole
    this.legacyRole = legacyRole
  }

  isActiveRole(role: UserRole) {
    return this.activeRole === role
  }

  hasRole(role: UserRole) {
    return this.roles.includes(role)
  }

  isAdmin() {
    return this.hasRole('admin')
  }
}

export async function getRoleContext(
  userId: string,
  tc?: TransactionClient
): Promise<RoleContext> {
  const key = getRoleContextCacheKey(userId)
  const roleContextStr = await CacheService.getIfExists(key)
  if (roleContextStr) {
    const data: {
      activeRole: UserRole
      roles: UserRole[]
      legacyRole?: UserRole
    } = JSON.parse(roleContextStr)
    return new RoleContext(
      data.roles,
      data.activeRole,
      data.legacyRole ?? data.activeRole
    )
  } else {
    // On cache miss: Create RoleContext from DB and save to cache
    const roles = await UserRepo.getUserRolesById(userId, tc ?? getClient())
    if (!roles.length) {
      throw new Error('User is missing roles')
    }
    const activeRole = roles.filter((r) => r !== 'admin')[0]
    const roleContext = new RoleContext(roles, activeRole, roles[0])
    await updateRoleContext(
      userId,
      new RoleContext(roles, activeRole, roles[0])
    )
    return roleContext
  }
}

export async function switchActiveRole(
  userId: string,
  newActiveRole: Exclude<UserRole, 'admin' | 'teacher'>
): Promise<void> {
  const existingRoleContext = await getRoleContext(userId)
  if (!existingRoleContext.hasRole(newActiveRole))
    throw new InputError('User does not have the requested role')
  const newRoleContext = new RoleContext(
    existingRoleContext.roles,
    newActiveRole,
    existingRoleContext.legacyRole
  )
  await updateRoleContext(userId, newRoleContext)
}

async function updateRoleContext(
  userId: string,
  newRoleContext: RoleContext
): Promise<void> {
  const key = getRoleContextCacheKey(userId)
  const value = JSON.stringify(newRoleContext)
  await CacheService.save(key, value)
}

function getRoleContextCacheKey(userId: string): string {
  return `${config.cacheKeys.userRoleContextPrefix}${userId}`
}
