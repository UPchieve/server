import { getClient, runInTransaction, TransactionClient } from '../db'
import * as UserRepo from '../models/User'
import { UserRole } from '../models/User'
import * as VolunteerRepo from '../models/Volunteer'
import * as CacheService from '../cache'
import config from '../config'
import { InputError } from '../models/Errors'

/*
 * - Right now, most of the app experience is driven by whether a user is a student, volunteer, or teacher, and
 * these are what we serve to the client to use as the userType/activeRole.
 * - But technically users can have other roles, like admin and ambassador, which don't dictate the overall in-app
 * experience like the other 3 do. Furthermore, admins and ambassadors are also both volunteers.
 * - So you can think of PrimaryUserRole as referring to the "main user types"
 */
export type PrimaryUserRole = Exclude<UserRole, 'admin' | 'ambassador'>
export type SessionUserRole = 'student' | 'volunteer'

export class RoleContext {
  readonly roles: UserRole[]
  readonly activeRole: PrimaryUserRole
  /**
   * @deprecated Use activeRole instead. Before users were allowed to have multiple user types/roles (i.e. student
   * AND volunteer), they had just one role. legacyRole is here just for backwards compatibility with clients, and we
   * should rip it out once all clients are updated.
   * */
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
  forceRefetch = false,
  tc: TransactionClient = getClient()
): Promise<RoleContext> {
  const key = getRoleContextCacheKey(userId)
  const roleContextStr = await CacheService.getIfExists(key)
  if (!roleContextStr || forceRefetch) {
    // On cache miss: Create RoleContext from DB and save to cache
    const roles = await UserRepo.getUserRolesById(userId, tc)
    if (!roles.length) {
      throw new Error('User is missing roles')
    }
    const legacyRole = roles.filter(
      (r) => r !== 'admin' && r !== 'ambassador'
    )[0] as PrimaryUserRole
    let activeRole = legacyRole
    if (roleContextStr) {
      // Maintain activeRole if there is one
      const cachedRoleContext = JSON.parse(roleContextStr)
      activeRole = cachedRoleContext?.activeRole ?? legacyRole
    }

    const roleContext = new RoleContext(roles, activeRole, legacyRole)
    await updateRoleContextCache(userId, roleContext)
    return roleContext
  } else {
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
  }
}

export async function switchActiveRole(
  userId: string,
  newActiveRole: PrimaryUserRole
): Promise<{ newRoleContext: RoleContext }> {
  const existingRoleContext = await getRoleContext(userId)
  if (!existingRoleContext.hasRole(newActiveRole))
    throw new InputError('User does not have the requested role')
  if (existingRoleContext.activeRole === newActiveRole)
    return {
      newRoleContext: existingRoleContext,
    }
  const newRoleContext = new RoleContext(
    existingRoleContext.roles,
    newActiveRole,
    existingRoleContext.legacyRole
  )
  await updateRoleContextCache(userId, newRoleContext)
  return { newRoleContext }
}

async function updateRoleContextCache(
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
  const existingRoleContext = await getRoleContext(userId, false)
  if (existingRoleContext.roles.includes('volunteer'))
    throw new InputError('User already has volunteer role')

  await runInTransaction(async (tc) => {
    await UserRepo.insertUserRoleByUserId(userId, 'volunteer', tc)
    await VolunteerRepo.createVolunteerProfile(
      userId,
      { timezone: null, partnerOrgId: null },
      tc
    )
  })
  await updateRoleContextCache(
    userId,
    new RoleContext(
      [...existingRoleContext.roles, 'volunteer'],
      existingRoleContext.activeRole,
      existingRoleContext.legacyRole
    )
  )
}
