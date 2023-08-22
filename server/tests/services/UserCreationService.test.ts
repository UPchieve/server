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

      const failed = await rosterPartnerStudents([invalidFirstName], '123')

      expect(failed.length).toBe(1)
      expect(failed[0].email).toBe(invalidFirstName.email)
      expect(failed[0].firstName).toBe(invalidFirstName.firstName)
      expect(failed[0].lastName).toBe(invalidFirstName.lastName)
    })

    test('ensure lastName is valid', async () => {
      const invalidLastName = {
        firstName: faker.name.firstName(),
        email: '',
        gradeLevel: '',
        lastName: 'DELETE * FROM upchieve.users;',
      }

      const failed = await rosterPartnerStudents([invalidLastName], '123')

      expect(failed.length).toBe(1)
      expect(failed[0].email).toBe(invalidLastName.email)
      expect(failed[0].firstName).toBe(invalidLastName.firstName)
      expect(failed[0].lastName).toBe(invalidLastName.lastName)
    })

    test('ensure email is valid', async () => {
      const invalidEmail = {
        firstName: faker.name.firstName(),
        email: 'isweariamemailATpromise.com',
        gradeLevel: '',
        lastName: faker.name.lastName(),
      }

      const failed = await rosterPartnerStudents([invalidEmail], '123')

      expect(failed.length).toBe(1)
      expect(failed[0].email).toBe(invalidEmail.email)
      expect(failed[0].firstName).toBe(invalidEmail.firstName)
      expect(failed[0].lastName).toBe(invalidEmail.lastName)
    })

    test('ensure password is valid', async () => {
      const tooShort = {
        firstName: faker.name.firstName(),
        email: faker.internet.email(),
        gradeLevel: '',
        lastName: faker.name.lastName(),
        password: '1aA',
      }
      const tooShortFailed = await rosterPartnerStudents([tooShort], '123')
      expect(tooShortFailed.length).toBe(1)
      expect(tooShortFailed[0].email).toBe(tooShort.email)
      expect(tooShortFailed[0].firstName).toBe(tooShort.firstName)
      expect(tooShortFailed[0].lastName).toBe(tooShort.lastName)

      const noCapital = {
        firstName: faker.name.firstName(),
        email: faker.internet.email(),
        gradeLevel: '',
        lastName: faker.name.lastName(),
        password: 'aaaa1234',
      }
      const noCapitalFailed = await rosterPartnerStudents([noCapital], '123')
      expect(noCapitalFailed.length).toBe(1)
      expect(noCapitalFailed[0].email).toBe(noCapital.email)
      expect(noCapitalFailed[0].firstName).toBe(noCapital.firstName)
      expect(noCapitalFailed[0].lastName).toBe(noCapital.lastName)

      const noLowercase = {
        firstName: faker.name.firstName(),
        email: faker.internet.email(),
        gradeLevel: '',
        lastName: faker.name.lastName(),
        password: '1234AAAA',
      }
      const noLowercaseFailed = await rosterPartnerStudents(
        [noLowercase],
        '123'
      )
      expect(noLowercaseFailed.length).toBe(1)
      expect(noLowercaseFailed[0].email).toBe(noLowercase.email)
      expect(noLowercaseFailed[0].firstName).toBe(noLowercase.firstName)
      expect(noLowercaseFailed[0].lastName).toBe(noLowercase.lastName)

      const noNumber = {
        firstName: faker.name.firstName(),
        email: faker.internet.email(),
        gradeLevel: '',
        lastName: faker.name.lastName(),
        password: 'aaaaAAAA',
      }
      const noNumberFailed = await rosterPartnerStudents([noNumber], '123')
      expect(noNumberFailed.length).toBe(1)
      expect(noNumberFailed[0].email).toBe(noNumber.email)
      expect(noNumberFailed[0].firstName).toBe(noNumber.firstName)
      expect(noNumberFailed[0].lastName).toBe(noNumber.lastName)
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
