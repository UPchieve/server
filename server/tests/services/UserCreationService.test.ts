import faker from 'faker'
import { mocked } from 'ts-jest/utils'
import * as UserRepo from '../../models/User'
import * as StudentRepo from '../../models/Student'
import * as StudentPartnerOrgRepo from '../../models/StudentPartnerOrg'
import * as SignUpSourceRepo from '../../models/SignUpSource'
import * as USMRepo from '../../models/UserSessionMetrics'
import * as UPFRepo from '../../models/UserProductFlags'
import * as UserActionRepo from '../../models/UserAction'
import * as MailService from '../../services/MailService'
import { rosterPartnerStudents } from '../../services/UserCreationService'
import { InputError } from '../../models/Errors'
import {
  hashPassword,
  RegistrationError,
  verifyPassword,
} from '../../utils/auth-utils'
import { ACCOUNT_USER_ACTIONS, USER_ROLES } from '../../constants'

jest.mock('../../models/User/queries')
jest.mock('../../models/Student/queries')
jest.mock('../../models/StudentPartnerOrg/queries')
jest.mock('../../models/SignUpSource/queries')
jest.mock('../../models/UserSessionMetrics/queries')
jest.mock('../../models/UserProductFlags/queries')
jest.mock('../../models/UserAction/queries')
jest.mock('../../services/MailService')

const mockedUserRepo = mocked(UserRepo, true)
const mockedStudentRepo = mocked(StudentRepo, true)
const mockedStudentPartnerOrgRepo = mocked(StudentPartnerOrgRepo, true)
const mockedSignUpSourceRepo = mocked(SignUpSourceRepo, true)
const mockedUSMRepo = mocked(USMRepo, true)
const mockedUPFRepo = mocked(UPFRepo, true)
const mockedUserActionRepo = mocked(UserActionRepo, true)
const mockedMailService = mocked(MailService, true)

const ROSTER_SIGNUP_SOURCE_ID = 7

describe('rosterPartnerStudents', () => {
  beforeAll(() => {
    mockedSignUpSourceRepo.getSignUpSourceByName.mockResolvedValue({
      id: ROSTER_SIGNUP_SOURCE_ID,
      name: 'Roster',
    })
  })
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  describe('validates input', () => {
    test('ensure firstName is valid', async () => {
      const invalidFirstName = {
        firstName: 'https://someurl.com',
        email: '',
        gradeLevel: '',
        lastName: faker.name.lastName(),
      }

      await expect(
        rosterPartnerStudents([invalidFirstName], '123')
      ).rejects.toThrow(
        new InputError('Names can only contain letters, spaces and hyphens')
      )
    })

    test('ensure lastName is valid', async () => {
      const invalidLastName = {
        firstName: faker.name.firstName(),
        email: '',
        gradeLevel: '',
        lastName: 'DELETE * FROM upchieve.users;',
      }

      await expect(
        rosterPartnerStudents([invalidLastName], '123')
      ).rejects.toThrow(
        new InputError('Names can only contain letters, spaces and hyphens')
      )
    })

    test('ensure email is valid', async () => {
      const invalidEmail = {
        firstName: faker.name.firstName(),
        email: 'isweariamemailATpromise.com',
        gradeLevel: '',
        lastName: faker.name.lastName(),
      }

      await expect(
        rosterPartnerStudents([invalidEmail], '123')
      ).rejects.toThrow(new InputError('Email is not a valid email format'))
    })

    test('ensure password is valid', async () => {
      const tooShort = {
        firstName: faker.name.firstName(),
        email: faker.internet.email(),
        gradeLevel: '',
        lastName: faker.name.lastName(),
        password: '1aA',
      }
      await expect(rosterPartnerStudents([tooShort], '123')).rejects.toThrow(
        new RegistrationError('Password must be 8 characters or longer')
      )

      const noCapital = {
        firstName: faker.name.firstName(),
        email: faker.internet.email(),
        gradeLevel: '',
        lastName: faker.name.lastName(),
        password: 'aaaa1234',
      }
      await expect(rosterPartnerStudents([noCapital], '123')).rejects.toThrow(
        new RegistrationError(
          'Password must contain at least one uppercase letter'
        )
      )

      const noLowercase = {
        firstName: faker.name.firstName(),
        email: faker.internet.email(),
        gradeLevel: '',
        lastName: faker.name.lastName(),
        password: '1234AAAA',
      }
      await expect(rosterPartnerStudents([noLowercase], '123')).rejects.toThrow(
        new RegistrationError(
          'Password must contain at least one lowercase letter'
        )
      )

      const noNumber = {
        firstName: faker.name.firstName(),
        email: faker.internet.email(),
        gradeLevel: '',
        lastName: faker.name.lastName(),
        password: 'aaaaAAAA',
      }
      await expect(rosterPartnerStudents([noNumber], '123')).rejects.toThrow(
        new RegistrationError('Password must contain at least one number')
      )
    })
  })

  test('creates user, student, and contact', async () => {
    const USER_ID = 'userId123'
    const SCHOOL_ID = 'schoolId123'
    const rosterStudent = {
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      gradeLevel: '8th',
      lastName: faker.name.lastName(),
      password: '123456Aa',
    }
    mockedUserRepo.createUser.mockResolvedValue({
      id: USER_ID,
      email: rosterStudent.email,
      firstName: rosterStudent.firstName,
      proxyEmail: undefined,
    })

    await rosterPartnerStudents([rosterStudent], SCHOOL_ID)

    expect(mockedUserRepo.createUser).toHaveBeenCalledWith(
      {
        email: rosterStudent.email,
        emailVerified: true,
        firstName: rosterStudent.firstName,
        lastName: rosterStudent.lastName,
        password: expect.any(String),
        passwordResetToken: undefined,
        proxyEmail: undefined,
        signupSourceId: ROSTER_SIGNUP_SOURCE_ID,
        verified: true,
      },
      expect.toBeTransactionClient()
    )
    expect(mockedUserRepo.insertUserRoleByUserId).toHaveBeenCalledWith(
      USER_ID,
      USER_ROLES.STUDENT,
      expect.toBeTransactionClient()
    )
    expect(mockedUSMRepo.createUSMByUserId).toHaveBeenCalledWith(
      USER_ID,
      expect.toBeTransactionClient()
    )
    expect(mockedUPFRepo.createUPFByUserId).toHaveBeenCalledWith(
      USER_ID,
      expect.toBeTransactionClient()
    )
    expect(mockedUserActionRepo.createAccountAction).toHaveBeenCalledWith(
      { action: ACCOUNT_USER_ACTIONS.CREATED, userId: USER_ID },
      expect.toBeTransactionClient()
    )
    expect(mockedStudentRepo.createStudentProfile).toHaveBeenCalledWith(
      {
        userId: USER_ID,
        gradeLevel: rosterStudent.gradeLevel,
        schoolId: SCHOOL_ID,
      },
      expect.toBeTransactionClient()
    )
  })

  test('hashes password if exists', async () => {
    const USER_ID = 'userId456'
    const SCHOOL_ID = 'schoolId456'
    const rosterStudent = {
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      gradeLevel: '10th',
      lastName: faker.name.lastName(),
      password: '123456Aa',
    }
    mockedUserRepo.createUser.mockResolvedValue({
      id: USER_ID,
      email: rosterStudent.email,
      firstName: rosterStudent.firstName,
      proxyEmail: undefined,
    })

    await rosterPartnerStudents([rosterStudent], SCHOOL_ID)

    const firstArg = mockedUserRepo.createUser.mock.calls[0][0]
    const hashedStudentPassword = await hashPassword(rosterStudent.password!)
    const isSame = await verifyPassword(
      firstArg.password!,
      hashedStudentPassword
    )
    expect(isSame).toBe(true)
  })

  test('adds reset token if no password and sends email', async () => {
    const USER_ID = 'userId789'
    const SCHOOL_ID = 'schoolId789'
    const rosterStudent = {
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      gradeLevel: '12th',
      lastName: faker.name.lastName(),
      proxyEmail: faker.internet.email(),
    }
    mockedUserRepo.createUser.mockResolvedValue({
      id: USER_ID,
      email: rosterStudent.email,
      firstName: rosterStudent.firstName,
      proxyEmail: rosterStudent.proxyEmail,
    })

    await rosterPartnerStudents([rosterStudent], SCHOOL_ID)

    const firstArg = mockedUserRepo.createUser.mock.calls[0][0]
    expect(firstArg.password).toBeFalsy()
    expect(firstArg.passwordResetToken).toBeTruthy()

    expect(
      mockedMailService.sendRosterStudentSetPasswordEmail
    ).toHaveBeenCalledWith(
      rosterStudent.proxyEmail,
      rosterStudent.firstName,
      firstArg.passwordResetToken
    )
  })

  describe('creates studentPartnerOrg instance', () => {
    test('if partner org', async () => {
      const USER_ID = 'userId000'
      const SCHOOL_ID = 'schoolId000'
      const PARTNER_ID = 'partnerId000'
      const PARTNER_KEY = 'partner-key'
      const SITE_ID = 'siteId000'
      const SITE = 'partner-site'

      const rosterStudent = {
        email: faker.internet.email(),
        firstName: faker.name.firstName(),
        gradeLevel: '6th',
        lastName: faker.name.lastName(),
        proxyEmail: faker.internet.email(),
      }
      mockedUserRepo.createUser.mockResolvedValue({
        id: USER_ID,
        email: rosterStudent.email,
        firstName: rosterStudent.firstName,
        proxyEmail: undefined,
      })
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgByKey.mockResolvedValue({
        partnerId: PARTNER_ID,
        partnerKey: PARTNER_KEY,
        partnerName: 'partner-name',
        siteId: SITE_ID,
        siteName: SITE,
      })

      await rosterPartnerStudents([rosterStudent], SCHOOL_ID, PARTNER_KEY, SITE)

      expect(
        mockedStudentPartnerOrgRepo.createUserStudentPartnerOrgInstance
      ).toHaveBeenCalledWith(
        {
          userId: USER_ID,
          studentPartnerOrgId: PARTNER_ID,
          studentPartnerOrgSiteId: SITE_ID,
        },
        expect.toBeTransactionClient()
      )
    })

    test('if partner school', async () => {
      const USER_ID = 'userId111'
      const SCHOOL_ID = 'schoolId111'
      const PARTNER_ID = 'partnerId111'

      const rosterStudent = {
        email: faker.internet.email(),
        firstName: faker.name.firstName(),
        gradeLevel: '9th',
        lastName: faker.name.lastName(),
        proxyEmail: faker.internet.email(),
      }
      mockedUserRepo.createUser.mockResolvedValue({
        id: USER_ID,
        email: rosterStudent.email,
        firstName: rosterStudent.firstName,
        proxyEmail: undefined,
      })
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId.mockResolvedValue(
        {
          partnerId: PARTNER_ID,
          partnerKey: 'partner-key',
          partnerName: 'partner-name',
        }
      )

      await rosterPartnerStudents([rosterStudent], SCHOOL_ID)

      expect(
        mockedStudentPartnerOrgRepo.createUserStudentPartnerOrgInstance
      ).toHaveBeenCalledWith(
        {
          userId: USER_ID,
          studentPartnerOrgId: PARTNER_ID,
        },
        expect.toBeTransactionClient()
      )
      expect(
        mockedStudentPartnerOrgRepo.getStudentPartnerOrgByKey
      ).not.toHaveBeenCalled()
    })
  })
})
