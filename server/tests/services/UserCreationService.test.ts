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
import { hashPassword, verifyPassword } from '../../utils/auth-utils'
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
  })

  test('creates user, student, and contact', async () => {
    const USER_ID = 'userId123'
    const SCHOOL_ID = 'schoolId123'
    const rosterStudent = {
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      gradeLevel: '8.0',
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
        gradeLevel: parseInt(rosterStudent.gradeLevel).toFixed(0) + 'th',
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
      gradeLevel: '10',
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
      gradeLevel: '12',
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
        gradeLevel: '6',
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
        gradeLevel: '9',
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
