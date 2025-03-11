import { getClient, runInTransaction, TransactionClient } from '../db'
import * as UserRepo from '../models/User'
import * as VolunteerRepo from '../models/Volunteer'
import { UserRole } from '../models/User'
import * as CacheService from '../cache'
import config from '../config'
import { InputError } from '../models/Errors'

export type PrimaryUserRole = Exclude<UserRole, 'admin'>

export class RoleContext {
  readonly roles: UserRole[]
  readonly activeRole: PrimaryUserRole
  /** @deprecated */
  readonly legacyRole: PrimaryUserRole

  constructor(
    roles: UserRole[],
    activeRole: PrimaryUserRole,
    legacyRole: PrimaryUserRole
  ) {
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
      activeRole: PrimaryUserRole
      roles: UserRole[]
      legacyRole?: PrimaryUserRole
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
    const activeRole = roles.filter((r) => r !== 'admin')[0] as PrimaryUserRole
    const roleContext = new RoleContext(roles, activeRole, activeRole)
    await updateRoleContext(userId, roleContext)
    return roleContext
  }
}

export async function switchActiveRole(
  userId: string,
  newActiveRole: Exclude<UserRole, 'admin' | 'teacher'>
): Promise<Exclude<UserRole, 'admin' | 'teacher'>> {
  const existingRoleContext = await getRoleContext(userId)
  if (!existingRoleContext.hasRole(newActiveRole))
    throw new InputError('User does not have the requested role')
  if (existingRoleContext.activeRole === newActiveRole)
    return existingRoleContext.activeRole
  const newRoleContext = new RoleContext(
    existingRoleContext.roles,
    newActiveRole,
    existingRoleContext.legacyRole
  )
  await updateRoleContext(userId, newRoleContext)
  return newActiveRole
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

export async function addVolunteerRoleToUser(userId: string): Promise<void> {
  const tc = getClient()
  const existingRoleContext = await getRoleContext(userId, tc)
  if (existingRoleContext.roles.includes('volunteer'))
    throw new InputError('User already has volunteer role')

  await runInTransaction(async (tc) => {
    await UserRepo.insertUserRoleByUserId(userId, 'volunteer', tc)
    await VolunteerRepo.createVolunteerProfile(
      userId,
      { timezone: null, partnerOrgId: null },
      tc
    )
  }, tc)
  await updateRoleContext(
    userId,
    new RoleContext(
      [...existingRoleContext.roles, 'volunteer'],
      existingRoleContext.activeRole,
      existingRoleContext.legacyRole
    )
  )
}
