import faker from 'faker'
import { mocked } from 'jest-mock'
import * as UserRepo from '../../models/User'
import * as StudentRepo from '../../models/Student'
import * as StudentPartnerOrgRepo from '../../models/StudentPartnerOrg'
import * as SignUpSourceRepo from '../../models/SignUpSource'
import * as USMRepo from '../../models/UserSessionMetrics'
import * as UPFRepo from '../../models/UserProductFlags'
import * as UserActionRepo from '../../models/UserAction'
import * as FedCredRepo from '../../models/FederatedCredential'
import * as MailService from '../../services/MailService'
import * as EligibilityService from '../../services/EligibilityService'
import {
  registerStudent,
  rosterPartnerStudents,
} from '../../services/UserCreationService'
import { hashPassword, verifyPassword } from '../../utils/auth-utils'
import { ACCOUNT_USER_ACTIONS, USER_ROLES } from '../../constants'

jest.mock('../../models/User/queries')
jest.mock('../../models/Student/queries')
jest.mock('../../models/StudentPartnerOrg/queries')
jest.mock('../../models/SignUpSource/queries')
jest.mock('../../models/UserSessionMetrics/queries')
jest.mock('../../models/UserProductFlags/queries')
jest.mock('../../models/UserAction/queries')
jest.mock('../../models/FederatedCredential/queries')
jest.mock('../../services/MailService')

const mockedUserRepo = mocked(UserRepo)
const mockedStudentRepo = mocked(StudentRepo)
const mockedStudentPartnerOrgRepo = mocked(StudentPartnerOrgRepo)
const mockedSignUpSourceRepo = mocked(SignUpSourceRepo)
const mockedUSMRepo = mocked(USMRepo)
const mockedUPFRepo = mocked(UPFRepo)
const mockedUserActionRepo = mocked(UserActionRepo)
const mockedFedCredRepo = mocked(FedCredRepo)
const mockedMailService = mocked(MailService)
jest.spyOn(EligibilityService, 'verifyEligibility').mockResolvedValue(true)

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

describe('registerStudent', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('adds user, student_profile, and other user-related rows', async () => {
    const USER_ID = 'registerStudentAll'
    const student = {
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      gradeLevel: '10th',
      lastName: faker.name.lastName(),
      password: 's0me-rAndom-paS$word',
      schoolId: '01859800-bc76-3420-c3c5-2c46ccf409c4', // 'Approved School' Id
      zipCode: '00501',
    }
    mockedUserRepo.createUser.mockResolvedValue({
      id: USER_ID,
      email: student.email,
      firstName: student.firstName,
    })

    await registerStudent(student)

    expect(mockedUserRepo.createUser).toHaveBeenCalledWith(
      {
        email: student.email,
        emailVerified: false,
        firstName: student.firstName,
        lastName: student.lastName,
        password: expect.any(String),
        verified: false,
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
      {
        action: ACCOUNT_USER_ACTIONS.CREATED,
        userId: USER_ID,
        ipAddress: undefined,
      },
      expect.toBeTransactionClient()
    )
    expect(mockedStudentRepo.createStudentProfile).toHaveBeenCalledWith(
      {
        userId: USER_ID,
        gradeLevel: student.gradeLevel,
        schoolId: student.schoolId,
        zipCode: student.zipCode,
      },
      expect.toBeTransactionClient()
    )
  })

  test('creates user with fed cred', async () => {
    const USER_ID = 'registerStudentWithFedCred'
    const student = {
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      profileId: 'profile-id',
      issuer: 'google',
    }
    mockedUserRepo.createUser.mockResolvedValue({
      id: USER_ID,
      email: student.email,
      firstName: student.firstName,
    })

    await registerStudent(student)

    expect(mockedUserRepo.createUser).toHaveBeenCalledWith(
      {
        email: student.email,
        emailVerified: true,
        firstName: student.firstName,
        lastName: student.lastName,
        verified: true,
      },
      expect.toBeTransactionClient()
    )
    expect(mockedFedCredRepo.insertFederatedCredential).toHaveBeenCalledWith(
      student.profileId,
      student.issuer,
      USER_ID,
      expect.toBeTransactionClient()
    )
  })

  test('creates user with referral', async () => {
    const USER_ID = 'registerStudentWithPassword'
    const REFERRAL_USER = {
      id: '01859800-be4b-685f-4130-8709193d461c',
      banned: false,
      code: 'A',
      deactivated: false,
      email: faker.internet.email(),
      isVolunteer: false,
      isAdmin: false,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phoneVerified: false,
      smsConsent: false,
    }
    const student = {
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: 'Password123!',
      referredByCode: REFERRAL_USER.code,
    }
    mockedUserRepo.createUser.mockResolvedValue({
      id: USER_ID,
      email: student.email,
      firstName: student.firstName,
    })
    mockedUserRepo.getUserContactInfoByReferralCode.mockResolvedValue(
      REFERRAL_USER
    )

    await registerStudent(student)

    expect(mockedUserRepo.createUser).toHaveBeenCalledWith(
      {
        email: student.email,
        emailVerified: false,
        firstName: student.firstName,
        lastName: student.lastName,
        password: expect.any(String),
        referredBy: REFERRAL_USER.id,
        verified: false,
      },
      expect.toBeTransactionClient()
    )
  })

  test('creates user with password', async () => {
    const USER_ID = 'registerStudentWithPassword'
    const student = {
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: 'sUper-$ecuRe-p@s$w0rd',
    }
    mockedUserRepo.createUser.mockResolvedValue({
      id: USER_ID,
      email: student.email,
      firstName: student.firstName,
    })

    await registerStudent(student)

    expect(mockedUserRepo.createUser).toHaveBeenCalledWith(
      {
        email: student.email,
        emailVerified: false,
        firstName: student.firstName,
        lastName: student.lastName,
        password: expect.any(String),
        verified: false,
      },
      expect.toBeTransactionClient()
    )

    const firstArg = mockedUserRepo.createUser.mock.calls[0][0]
    const isSame = await verifyPassword(student.password, firstArg.password!)
    expect(isSame).toBe(true)
  })

  test('creates non-school partner org instance', async () => {
    const USER_ID = 'registerStudentWithPartnerOrg'
    const PARTNER_ORG = {
      id: 'partnerOrgId',
      key: 'partnerOrgKey',
      name: 'Partner Org Name',
    }
    mockedStudentPartnerOrgRepo.getStudentPartnerOrgByKey.mockResolvedValue({
      partnerId: PARTNER_ORG.id,
      partnerKey: PARTNER_ORG.key,
      partnerName: PARTNER_ORG.name,
    })
    const student = {
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: 'Password123!',
      studentPartnerOrg: PARTNER_ORG.key,
    }
    mockedUserRepo.createUser.mockResolvedValue({
      id: USER_ID,
      email: student.email,
      firstName: student.firstName,
    })

    await registerStudent(student)

    expect(
      mockedStudentPartnerOrgRepo.createUserStudentPartnerOrgInstance
    ).toHaveBeenCalledWith(
      {
        userId: USER_ID,
        studentPartnerOrgId: PARTNER_ORG.id,
      },
      expect.toBeTransactionClient()
    )
  })

  test('creates school partner org instance', async () => {
    const USER_ID = 'registerStudentWithPartnerSchool'
    const PARTNER_ORG = {
      id: 'schoolPartnerOrgId',
      key: 'schoolPartnerOrgKey',
      name: 'School Partner Org Name',
    }
    mockedStudentPartnerOrgRepo.getStudentPartnerOrgByKey.mockResolvedValue({
      partnerId: PARTNER_ORG.id,
      partnerKey: PARTNER_ORG.key,
      partnerName: PARTNER_ORG.name,
    })
    const student = {
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: 'Password123!',
      studentPartnerOrg: PARTNER_ORG.key,
    }
    mockedUserRepo.createUser.mockResolvedValue({
      id: USER_ID,
      email: student.email,
      firstName: student.firstName,
    })

    await registerStudent(student)

    expect(
      mockedStudentPartnerOrgRepo.createUserStudentPartnerOrgInstance
    ).toHaveBeenCalledWith(
      {
        userId: USER_ID,
        studentPartnerOrgId: PARTNER_ORG.id,
      },
      expect.toBeTransactionClient()
    )
  })

  test('uses the partner org school id if no school id provided', async () => {
    const USER_ID = 'registerStudentMissingSchoolId'
    const PARTNER_ORG = {
      id: 'schoolPartnerOrgId',
      key: 'schoolPartnerOrgKey',
      name: 'School Partner Org Name',
      schoolId: 'schoolId',
    }
    mockedStudentPartnerOrgRepo.getStudentPartnerOrgByKey.mockResolvedValue({
      partnerId: PARTNER_ORG.id,
      partnerKey: PARTNER_ORG.key,
      partnerName: PARTNER_ORG.name,
      schoolId: PARTNER_ORG.schoolId,
    })
    const student = {
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: 'Password123!',
      studentPartnerOrg: PARTNER_ORG.key,
    }
    mockedUserRepo.createUser.mockResolvedValue({
      id: USER_ID,
      email: student.email,
      firstName: student.firstName,
    })

    await registerStudent(student)

    expect(mockedStudentRepo.createStudentProfile).toHaveBeenCalledWith(
      {
        college: undefined,
        gradeLevel: undefined,
        partnerSite: undefined,
        schoolId: PARTNER_ORG.schoolId,
        studentPartnerOrg: PARTNER_ORG.key,
        userId: USER_ID,
        zipCode: undefined,
      },
      expect.toBeTransactionClient()
    )
    expect(
      mockedStudentPartnerOrgRepo.createUserStudentPartnerOrgInstance
    ).toHaveBeenCalledTimes(1)
  })
})
