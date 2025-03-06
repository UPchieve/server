import { mocked } from 'jest-mock'

import * as UserRolesService from '../../services/UserRolesService'
import * as UserRepo from '../../models/User/queries'
import * as CacheService from '../../cache'
import { RoleContext } from '../../services/UserRolesService'
import config from '../../config'
import { UserRole } from '../../models/User'

jest.mock('../../models/User/queries')
jest.mock('../../cache')
const mockedUserRepo = mocked(UserRepo)
const mockedCacheService = mocked(CacheService)

beforeEach(() => {
  jest.resetAllMocks()
})

describe('RoleContext', () => {
  it('Determines whether the user has a role', () => {
    const roles: UserRole[] = ['volunteer']
    const activeRole = 'volunteer'
    const legacyRole = 'volunteer'
    const ctx = new RoleContext(roles, activeRole, legacyRole)
    expect(ctx.hasRole('volunteer')).toBeTruthy()
    expect(ctx.hasRole('student')).toBeFalsy()
    expect(ctx.hasRole('admin')).toBeFalsy()
  })

  it('Determines if the user is an admin', () => {
    const adminUserRoles: UserRole[] = ['admin', 'volunteer']
    const nonAdminUserRoles: UserRole[] = ['student', 'volunteer']
    const adminCtx = new RoleContext(adminUserRoles, 'volunteer', 'volunteer')
    const nonAdminCtx = new RoleContext(
      nonAdminUserRoles,
      'volunteer',
      'student'
    )

    expect(adminCtx.isAdmin()).toBeTruthy()
    expect(nonAdminCtx.isAdmin()).toBeFalsy()
  })

  it("Determines the user's active role", () => {
    const roles: UserRole[] = ['volunteer', 'student']
    const ctx = new RoleContext(roles, 'volunteer', 'volunteer')
    expect(ctx.isActiveRole('volunteer')).toBeTruthy()
    expect(ctx.isActiveRole('student')).toBeFalsy()
  })
})

describe('getRoleContext', () => {
  it('Returns the role context from the cache', async () => {
    const existingRoleContext = new RoleContext(
      ['student'],
      'student',
      'student'
    )
    mockedCacheService.getIfExists.mockResolvedValue(
      JSON.stringify(existingRoleContext)
    )
    const result = await UserRolesService.getRoleContext('some-key')
    expect(result.roles).toEqual(existingRoleContext.roles)
    expect(result.legacyRole).toEqual(existingRoleContext.legacyRole)
    expect(result.activeRole).toEqual(existingRoleContext.activeRole)
  })

  it('Generates role context from the DB if no entry in cache', async () => {
    mockedCacheService.getIfExists.mockResolvedValue(undefined)
    mockedUserRepo.getUserRolesById.mockResolvedValue(['volunteer', 'admin'])
    const result = await UserRolesService.getRoleContext('some-key')
    expect(result.legacyRole).toEqual('volunteer')
    expect(result.roles).toEqual(['volunteer', 'admin'])
    expect(result.activeRole).toEqual('volunteer')
  })
})

describe('switchActiveRole', () => {
  it('Calls the cache to save the data', async () => {
    const userId = 'some-user'
    const key = `${config.cacheKeys.userRoleContextPrefix}${userId}`
    const existingRoleContext = new RoleContext(
      ['student', 'volunteer'],
      'student',
      'student'
    )
    mockedCacheService.getIfExists.mockResolvedValue(
      JSON.stringify(existingRoleContext)
    )
    await UserRolesService.switchActiveRole(userId, 'volunteer')
    expect(mockedCacheService.getIfExists).toHaveBeenCalledTimes(1)
    expect(mockedCacheService.save).toHaveBeenCalledWith(
      key,
      JSON.stringify(
        new RoleContext(
          existingRoleContext.roles,
          'volunteer',
          existingRoleContext.legacyRole
        )
      )
    )
  })
})
