import { mocked } from 'jest-mock'

import * as UserRolesService from '../../services/UserRolesService'
import * as UserRepo from '../../models/User/queries'
import { UserRole } from '../../models/User'
import { getDbUlid } from '../../../database/seeds/utils'

jest.mock('../../models/User/queries')
const mockedUserRepo = mocked(UserRepo)

describe('getUserRolesById', () => {
  test.each(['student', 'teacher', 'volunteer'])(
    'returns %s as the correct userType',
    async expectedUserType => {
      mockedUserRepo.getUserRolesById.mockResolvedValueOnce([
        expectedUserType as UserRole,
      ])
      const result = await UserRolesService.getUserRolesById(getDbUlid())
      expect(result.userType).toBe(expectedUserType)
    }
  )

  test.each([true, false])(
    'returns whether someone is/is not admin',
    async isAdmin => {
      mockedUserRepo.getUserRolesById.mockResolvedValueOnce(
        isAdmin ? ['admin', 'volunteer'] : ['volunteer']
      )
      const result = await UserRolesService.getUserRolesById(getDbUlid())
      expect(result.isAdmin).toBe(isAdmin)
    }
  )

  test.each([{ returnValue: [] }, { returnValue: ['admin'] }])(
    'throws if no user types other than admin',
    async mockedReturnValue => {
      mockedUserRepo.getUserRolesById.mockResolvedValueOnce(
        mockedReturnValue.returnValue as UserRole[]
      )
      await expect(
        UserRolesService.getUserRolesById(getDbUlid())
      ).rejects.toThrow()
    }
  )

  test.each([
    { returnValue: ['student', 'volunteer'] },
    { returnValue: ['student', 'teacher'] },
    { returnValue: ['teacher', 'volunteer'] },
    { returnValue: ['student', 'volunteer', 'teacher'] },
  ])(
    'throws if more than user type other than admin',
    async mockedReturnValue => {
      mockedUserRepo.getUserRolesById.mockResolvedValueOnce(
        mockedReturnValue.returnValue as UserRole[]
      )
      await expect(
        UserRolesService.getUserRolesById(getDbUlid())
      ).rejects.toThrow()
    }
  )
})
