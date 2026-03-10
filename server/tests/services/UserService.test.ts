import { mocked } from 'jest-mock'
import { mockApp, mockPassportMiddleware } from '../mock-app'
import * as UserRepo from '../../models/User/queries'
import { buildStudent } from '../mocks/generate'
import * as UserService from '../../services/UserService'
import * as UserRolesService from '../../services/UserRolesService'
import { getDbUlid, Ulid } from '../../models/pgUtils'
import { UserRole } from '../../models/User'
import { PrimaryUserRole } from '../../services/UserRolesService'
import * as StudentRepo from '../../models/Student'
import * as UsersSchoolsRepo from '../../models/UsersSchools'
import { beforeEach } from '@jest/globals'
import { getPartnerOrgsByStudent } from '../../models/Student'

jest.mock('../../models/User/queries')
jest.mock('../../services/UserRolesService')
jest.mock('../../models/Student/queries')
jest.mock('../../models/UsersSchools/queries')

const mockUserRepo = mocked(UserRepo)
const mockedUserRolesService = mocked(UserRolesService)
const mockedStudentRepo = jest.mocked(StudentRepo)
const mockedUsersSchoolsRepo = jest.mocked(UsersSchoolsRepo)
const mockGetUser = () => buildStudent()
const app = mockApp()
app.use(mockPassportMiddleware(mockGetUser))

beforeEach(() => {
  jest.resetAllMocks()
})

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

  describe('updateStudentPartnerOrgInstance', () => {
    const userId = '123'
    const mockPartnerOrg = {
      partnerId: 'mock-partner-org',
      partnerKey: 'Partner Org',
      partnerName: 'Partner Org',
    }
    const mockPartnerSchool = {
      partnerId: 'mock-partner-school',
      partnerKey: 'Partner School',
      partnerName: 'Partner School',
      schoolId: 'school-0',
    }
    it('Throws an error if the partner org or school does not exist', async () => {
      const newStudentPartnerOrgKey = 'some-partner-org-key'
      const newSchoolPartnerOrgKey = 'some-school-partner-org-key'
      async function test() {
        return UserService.updateStudentPartnerOrgInstance(
          userId,
          newStudentPartnerOrgKey,
          'some-site',
          newSchoolPartnerOrgKey
        )
      }

      // Throws if the partner org does not exist
      mockedStudentRepo.getPartnerOrgByKey.mockResolvedValue(undefined)
      await expect(() => test()).rejects.toThrow(
        `New partner org ${newStudentPartnerOrgKey} does not exist`
      )

      // Throws if the school org does not exist
      jest.resetAllMocks()
      mockedStudentRepo.getPartnerOrgByKey.mockResolvedValueOnce(mockPartnerOrg)
      mockedStudentRepo.getPartnerOrgByKey.mockResolvedValueOnce(undefined)
      await expect(() => test()).rejects.toThrow(
        `New school org ${newSchoolPartnerOrgKey} does not exist`
      )
    })

    it('Deactivates old partnerships', async () => {
      const existingStuPartnerOrg = { ...mockPartnerOrg }
      const existingPartnerSchool = { ...mockPartnerSchool }
      const newPartnerSchool = {
        name: 'existing partner school',
        id: 'existing-school',
        schoolId: 'school-1',
        siteName: 'Boston',
      }
      mockedStudentRepo.getPartnerOrgByKey.mockResolvedValueOnce(undefined)
      mockedStudentRepo.getPartnerOrgByKey.mockResolvedValueOnce({
        partnerId: newPartnerSchool.id,
        partnerKey: 'school key',
        partnerName: newPartnerSchool.name,
        schoolId: newPartnerSchool.schoolId,
      })

      // Same as existingStuPartnerOrg, existingStuPartnerSchool but using different property names
      mockedStudentRepo.getPartnerOrgsByStudent.mockResolvedValueOnce([
        {
          name: existingStuPartnerOrg.partnerName,
          id: existingStuPartnerOrg.partnerId,
          siteName: '',
          schoolId: null,
        },
        {
          name: existingPartnerSchool.partnerName,
          id: existingPartnerSchool.partnerId,
          schoolId: existingPartnerSchool.schoolId,
          siteName: '',
        },
      ])

      // Unset partner org partnership
      // Change school partnership (meaning, deactivate the old one and activate a new one)
      await UserService.updateStudentPartnerOrgInstance(
        userId,
        undefined,
        undefined,
        'school-2'
      )
      expect(
        mockedStudentRepo.deactivateStudentPartnershipInstance
      ).toHaveBeenNthCalledWith(
        1,
        userId,
        existingStuPartnerOrg.partnerId,
        expect.anything()
      )
      expect(
        mockedStudentRepo.deactivateStudentPartnershipInstance
      ).toHaveBeenNthCalledWith(
        2,
        userId,
        existingPartnerSchool.partnerId,
        expect.anything()
      )

      // New school partnership should have been activated
      expect(mockedUsersSchoolsRepo.deleteUsersSchool).not.toHaveBeenCalled()
      expect(mockedUsersSchoolsRepo.upsertUsersSchool).toHaveBeenCalledTimes(1)
      expect(mockedUsersSchoolsRepo.upsertUsersSchool).toHaveBeenCalledWith(
        userId,
        newPartnerSchool.schoolId,
        'student_at_school',
        expect.anything()
      )
    })

    it('Activates new partnerships', async () => {
      mockedStudentRepo.getPartnerOrgByKey.mockResolvedValueOnce({
        ...mockPartnerOrg,
      })
      mockedStudentRepo.getPartnerOrgByKey.mockResolvedValueOnce({
        ...mockPartnerSchool,
      })
      mockedStudentRepo.getPartnerOrgsByStudent.mockResolvedValue([])

      await UserService.updateStudentPartnerOrgInstance(
        userId,
        mockPartnerOrg.partnerKey,
        undefined,
        mockPartnerSchool.partnerKey
      )
      expect(
        mockedStudentRepo.deactivateStudentPartnershipInstance
      ).not.toHaveBeenCalled()
      expect(
        mockedStudentRepo.activateStudentPartnershipInstance
      ).toHaveBeenCalledTimes(2)
      expect(
        mockedStudentRepo.activateStudentPartnershipInstance
      ).toHaveBeenNthCalledWith(
        1,
        userId,
        mockPartnerOrg.partnerId,
        undefined,
        expect.anything()
      )
      expect(
        mockedStudentRepo.activateStudentPartnershipInstance
      ).toHaveBeenNthCalledWith(
        2,
        userId,
        mockPartnerSchool.partnerId,
        undefined,
        expect.anything()
      )
      expect(mockedUsersSchoolsRepo.deleteUsersSchool).not.toHaveBeenCalled()
    })

    it('When the partner org stays the same but the site changes, it deactivates the partnership for the old site and activates a partnership for the new site', async () => {
      const existingPartnerOrg = {
        ...mockPartnerOrg,
        siteName: 'site-1',
      }
      const newPartnerOrg = {
        partnerId: existingPartnerOrg.partnerId,
        partnerKey: existingPartnerOrg.partnerKey,
        partnerName: existingPartnerOrg.partnerName,
        siteId: 'site-2-id',
        siteName: 'site-2',
      }

      mockedStudentRepo.getPartnerOrgByKey.mockResolvedValueOnce(newPartnerOrg)
      mockedStudentRepo.getPartnerOrgByKey.mockResolvedValueOnce(undefined)
      mockedStudentRepo.getPartnerOrgsByStudent.mockResolvedValue([
        {
          id: existingPartnerOrg.partnerId,
          name: existingPartnerOrg.partnerName,
          siteName: existingPartnerOrg.siteName,
          schoolId: null,
        },
      ])

      await UserService.updateStudentPartnerOrgInstance(
        userId,
        newPartnerOrg.partnerKey,
        undefined,
        undefined
      )
      expect(
        mockedStudentRepo.deactivateStudentPartnershipInstance
      ).toHaveBeenCalledTimes(1)
      expect(
        mockedStudentRepo.deactivateStudentPartnershipInstance
      ).toHaveBeenNthCalledWith(
        1,
        userId,
        existingPartnerOrg.partnerId,
        expect.anything()
      )
      expect(
        mockedStudentRepo.activateStudentPartnershipInstance
      ).toHaveBeenCalledTimes(1)
      expect(
        mockedStudentRepo.activateStudentPartnershipInstance
      ).toHaveBeenNthCalledWith(
        1,
        userId,
        newPartnerOrg.partnerId,
        newPartnerOrg.siteId,
        expect.anything()
      )
    })
  })
})
