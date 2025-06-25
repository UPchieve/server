import { mocked } from 'jest-mock'
import request from 'supertest'
import { mockApp, mockPassportMiddleware } from '../mock-app'
import * as UserRepo from '../../models/User/queries'
import { buildStudent } from '../mocks/generate'
import * as UserService from '../../services/UserService'
import * as UserRolesService from '../../services/UserRolesService'
import { getDbUlid } from '../../models/pgUtils'
import { UserRole } from '../../models/User'
import { PrimaryUserRole } from '../../services/UserRolesService'

jest.mock('../../models/User/queries')
jest.mock('../../services/UserRolesService')
jest.mock('../../models/Student/queries')

const mockUserRepo = mocked(UserRepo)
const mockedUserRolesService = mocked(UserRolesService)
const mockGetUser = () => buildStudent()
const app = mockApp()
app.use(mockPassportMiddleware(mockGetUser))
const agent = request.agent(app)
describe('User Service', () => {
  describe('deletePhoneFromAccount', () => {
    it('Should throw an error if it is a volunteer account', async () => {
      const userId = getDbUlid()
      const mockRoleContext = {
        roles: ['volunteer'] as UserRole[],
        activeRole: 'volunteer' as PrimaryUserRole,
        legacyRole: 'volunteer' as PrimaryUserRole,
        hasRole: jest.fn().mockReturnValue(true),
        isActiveRole: jest.fn(),
        isAdmin: jest.fn(),
      }
      mockedUserRolesService.getRoleContext.mockResolvedValue(mockRoleContext)
      await expect(UserService.deletePhoneFromAccount(userId)).rejects.toThrow(
        'Phone information is required for UPchieve volunteers'
      )
    })

    it('Should throw an error if the account has the volunteer role', async () => {
      const userId = getDbUlid()
      const mockRoleContext = {
        roles: ['volunteer'] as UserRole[],
        activeRole: 'volunteer' as PrimaryUserRole,
        legacyRole: 'volunteer' as PrimaryUserRole,
        hasRole: jest.fn().mockReturnValue(true),
        isActiveRole: jest.fn(),
        isAdmin: jest.fn(),
      }
      mockedUserRolesService.getRoleContext.mockResolvedValue(mockRoleContext)
      await expect(UserService.deletePhoneFromAccount(userId)).rejects.toThrow(
        'Phone information is required for UPchieve volunteers'
      )
    })

    it('Should call deleteUserPhoneInfo', async () => {
      const userId = getDbUlid()
      const mockRoleContext = {
        roles: ['student'] as UserRole[],
        activeRole: 'student' as PrimaryUserRole,
        legacyRole: 'student' as PrimaryUserRole,
        hasRole: jest.fn().mockReturnValue(false),
        isActiveRole: jest.fn(),
        isAdmin: jest.fn(),
      }
      mockedUserRolesService.getRoleContext.mockResolvedValue(mockRoleContext)
      await UserService.deletePhoneFromAccount(userId)
      expect(mockUserRepo.deleteUserPhoneInfo).toHaveBeenCalledWith(userId)
    })
  })
})
