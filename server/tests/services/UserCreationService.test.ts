import { faker } from '@faker-js/faker'
import { mocked } from 'jest-mock'
import * as UserRepo from '../../models/User'
import * as StudentRepo from '../../models/Student'
import * as TeacherRepo from '../../models/Teacher'
import * as StudentPartnerOrgRepo from '../../models/StudentPartnerOrg'
import * as SignUpSourceRepo from '../../models/SignUpSource'
import * as USMRepo from '../../models/UserSessionMetrics'
import * as UPFRepo from '../../models/UserProductFlags'
import * as UserActionRepo from '../../models/UserAction'
import * as FedCredRepo from '../../models/FederatedCredential'
import * as AuthService from '../../services/AuthService'
import * as MailService from '../../services/MailService'
import * as EligibilityService from '../../services/EligibilityService'
import * as TeacherService from '../../services/TeacherService'
import * as AuthUtils from '../../utils/auth-utils'
import {
  registerStudent,
  registerTeacher,
  rosterPartnerStudents,
} from '../../services/UserCreationService'
import { ACCOUNT_USER_ACTIONS, USER_ROLES } from '../../constants'
import { InputError } from '../../models/Errors'

jest.mock('../../models/User/queries')
jest.mock('../../models/Student/queries')
jest.mock('../../models/Teacher/queries')
jest.mock('../../models/StudentPartnerOrg/queries')
jest.mock('../../models/SignUpSource/queries')
jest.mock('../../models/UserSessionMetrics/queries')
jest.mock('../../models/UserProductFlags/queries')
jest.mock('../../models/UserAction/queries')
jest.mock('../../models/FederatedCredential/queries')
jest.mock('../../services/AuthService')
jest.mock('../../services/EligibilityService')
jest.mock('../../services/MailService')
jest.mock('../../services/TeacherService')
jest.mock('../../utils/auth-utils')

const mockedUserRepo = mocked(UserRepo)
const mockedStudentRepo = mocked(StudentRepo)
const mockedTeacherRepo = mocked(TeacherRepo)
const mockedStudentPartnerOrgRepo = mocked(StudentPartnerOrgRepo)
const mockedSignUpSourceRepo = mocked(SignUpSourceRepo)
const mockedUSMRepo = mocked(USMRepo)
const mockedUPFRepo = mocked(UPFRepo)
const mockedUserActionRepo = mocked(UserActionRepo)
const mockedFedCredRepo = mocked(FedCredRepo)
const mockedAuthService = mocked(AuthService)
const mockedEligibilityService = mocked(EligibilityService)
const mockedMailService = mocked(MailService)
const mockedTeacherService = mocked(TeacherService)
const mockedAuthUtils = mocked(AuthUtils)

const ROSTER_SIGNUP_SOURCE_ID = 7
const OTHER_SIGNUP_SOURCE_ID = 6
const HASHED_PASSWORD_RESOLVED = 'iamnowhashedhehe'

describe('rosterPartnerStudents', () => {
  beforeAll(() => {
    mockedSignUpSourceRepo.getSignUpSourceByName.mockResolvedValue({
      id: ROSTER_SIGNUP_SOURCE_ID,
      name: 'Roster',
    })
    mockedAuthUtils.hashPassword.mockResolvedValue(HASHED_PASSWORD_RESOLVED)
  })
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('validates input', async () => {
    const data = {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      gradeLevel: '8th',
      lastName: faker.person.lastName(),
      password: 'Password123',
      proxyEmail: faker.internet.email(),
    }
    mockedUserRepo.upsertUser.mockResolvedValue({
      id: 'abc',
      email: data.email,
      firstName: data.firstName,
      proxyEmail: data.proxyEmail,
      isCreated: true,
    })

    await rosterPartnerStudents([data], 'school-id')

    expect(mockedAuthUtils.checkEmail).toHaveBeenNthCalledWith(1, data.email)
    expect(mockedAuthUtils.checkEmail).toHaveBeenNthCalledWith(
      2,
      data.proxyEmail
    )
    expect(mockedAuthUtils.checkNames).toHaveBeenCalledWith(
      data.firstName,
      data.lastName
    )
  })

  test('creates user, student, and contact', async () => {
    const USER_ID = 'userId123'
    const SCHOOL_ID = 'schoolId123'
    const rosterStudent = {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      gradeLevel: '8.0',
      lastName: faker.person.lastName(),
      password: '123456Aa',
    }
    mockedUserRepo.upsertUser.mockResolvedValue({
      id: USER_ID,
      email: rosterStudent.email,
      firstName: rosterStudent.firstName,
      proxyEmail: undefined,
      isCreated: true,
    })

    await rosterPartnerStudents([rosterStudent], SCHOOL_ID)

    expect(mockedUserRepo.upsertUser).toHaveBeenCalledWith(
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
    expect(mockedStudentRepo.upsertStudentProfile).toHaveBeenCalledWith(
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
      firstName: faker.person.firstName(),
      gradeLevel: '10',
      lastName: faker.person.lastName(),
      password: '123456Aa',
    }
    mockedUserRepo.upsertUser.mockResolvedValue({
      id: USER_ID,
      email: rosterStudent.email,
      firstName: rosterStudent.firstName,
      proxyEmail: undefined,
      isCreated: true,
    })

    await rosterPartnerStudents([rosterStudent], SCHOOL_ID)

    expect(mockedUserRepo.upsertUser).toHaveBeenCalledWith(
      {
        email: rosterStudent.email,
        emailVerified: true,
        firstName: rosterStudent.firstName,
        lastName: rosterStudent.lastName,
        password: HASHED_PASSWORD_RESOLVED,
        passwordResetToken: undefined,
        proxyEmail: undefined,
        signupSourceId: ROSTER_SIGNUP_SOURCE_ID,
        verified: true,
      },
      expect.toBeTransactionClient()
    )
  })

  test('adds reset token if no password and sends email', async () => {
    const USER_ID = 'userId789'
    const SCHOOL_ID = 'schoolId789'
    const rosterStudent = {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      gradeLevel: '12',
      lastName: faker.person.lastName(),
      proxyEmail: faker.internet.email(),
    }
    mockedUserRepo.upsertUser.mockResolvedValue({
      id: USER_ID,
      email: rosterStudent.email,
      firstName: rosterStudent.firstName,
      proxyEmail: rosterStudent.proxyEmail,
      isCreated: true,
    })
    mockedAuthUtils.createResetToken.mockReturnValue('resettoken')

    await rosterPartnerStudents([rosterStudent], SCHOOL_ID)

    const firstArg = mockedUserRepo.upsertUser.mock.calls[0][0]
    expect(firstArg.password).toBeFalsy()
    expect(firstArg.passwordResetToken).toBe('resettoken')

    expect(
      mockedMailService.sendRosterStudentSetPasswordEmail
    ).toHaveBeenCalledWith(
      rosterStudent.proxyEmail,
      rosterStudent.firstName,
      firstArg.passwordResetToken
    )
  })

  describe('if student already exists', () => {
    test('upserts the user and student profile but not the metadata', async () => {
      const USER_ID = 'userId789'
      const SCHOOL_ID = 'schoolId789'
      const rosterStudent = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        gradeLevel: '12',
        lastName: faker.person.lastName(),
        password: faker.internet.password(),
        proxyEmail: faker.internet.email(),
      }
      mockedUserRepo.upsertUser.mockResolvedValue({
        id: USER_ID,
        email: rosterStudent.email,
        firstName: rosterStudent.firstName,
        proxyEmail: rosterStudent.proxyEmail,
        isCreated: false,
      })

      await rosterPartnerStudents([rosterStudent], SCHOOL_ID)

      expect(mockedUserRepo.upsertUser).toHaveBeenCalled()
      expect(mockedUserRepo.insertUserRoleByUserId).not.toHaveBeenCalled()
      expect(mockedUSMRepo.createUSMByUserId).not.toHaveBeenCalled()
      expect(mockedUPFRepo.createUPFByUserId).not.toHaveBeenCalled()
      expect(mockedUserActionRepo.createAccountAction).not.toHaveBeenCalled()
      expect(mockedStudentRepo.upsertStudentProfile).toHaveBeenCalled()
    })
  })

  describe('creates and/or deactivates studentPartnerOrg instance', () => {
    test('gets the active non-school and school partners with the correct parameters', async () => {
      const USER_ID = 'userId555'
      const PARTNER_ID = 'partner-id'
      const PARTNER_KEY = 'partner-key'
      const SITE_ID = 'site-id'
      const SCHOOL_ID = 'school-id'

      const rosterStudent = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        gradeLevel: '9',
        lastName: faker.person.lastName(),
        proxyEmail: faker.internet.email(),
      }
      mockedUserRepo.upsertUser.mockResolvedValue({
        id: USER_ID,
        email: rosterStudent.email,
        firstName: rosterStudent.firstName,
        proxyEmail: undefined,
        isCreated: true,
      })
      mockedStudentRepo.getActivePartnersForStudent.mockResolvedValue(undefined)
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId.mockResolvedValue(
        undefined
      )
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgByKey.mockResolvedValue({
        partnerId: PARTNER_ID,
        partnerKey: PARTNER_KEY,
        partnerName: 'partner-name',
        siteId: SITE_ID,
      })

      await rosterPartnerStudents(
        [rosterStudent],
        SCHOOL_ID,
        PARTNER_KEY,
        SITE_ID
      )

      expect(
        mockedStudentRepo.getActivePartnersForStudent
      ).toHaveBeenCalledWith(USER_ID, expect.toBeTransactionClient())
      expect(
        mockedStudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId
      ).toHaveBeenCalledWith(expect.toBeTransactionClient(), SCHOOL_ID)
      expect(
        mockedStudentPartnerOrgRepo.getStudentPartnerOrgByKey
      ).toHaveBeenCalledWith(
        expect.toBeTransactionClient(),
        PARTNER_KEY,
        SITE_ID
      )
    })

    test('creates non-school partner org instance when none active', async () => {
      const USER_ID = 'userId000'
      const NEW_PARTNER_ID = 'new-partner-id'
      const NEW_PARTNER_KEY = 'new-partner-key'
      const NEW_SITE_ID = 'new-site-id'

      const rosterStudent = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        gradeLevel: '6',
        lastName: faker.person.lastName(),
        proxyEmail: faker.internet.email(),
      }
      mockedUserRepo.upsertUser.mockResolvedValue({
        id: USER_ID,
        email: rosterStudent.email,
        firstName: rosterStudent.firstName,
        proxyEmail: undefined,
        isCreated: true,
      })
      mockedStudentRepo.getActivePartnersForStudent.mockResolvedValue(undefined)
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId.mockResolvedValue(
        undefined
      )
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgByKey.mockResolvedValue({
        partnerId: NEW_PARTNER_ID,
        partnerKey: NEW_PARTNER_KEY,
        partnerName: 'new-partner-name',
        siteId: NEW_SITE_ID,
      })

      await rosterPartnerStudents([rosterStudent], 'school-id', NEW_PARTNER_KEY)

      expect(
        mockedStudentPartnerOrgRepo.createUserStudentPartnerOrgInstance
      ).toHaveBeenCalledWith(
        {
          userId: USER_ID,
          studentPartnerOrgId: NEW_PARTNER_ID,
          studentPartnerOrgSiteId: NEW_SITE_ID,
        },
        expect.toBeTransactionClient()
      )
    })

    test('creates school partner org instance when none active', async () => {
      const USER_ID = 'userId111'
      const SCHOOL_ID = 'schoolId111'
      const NEW_SCHOOL_PARTNER_ID = 'new-school-partner-id'

      const rosterStudent = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        gradeLevel: '9',
        lastName: faker.person.lastName(),
        proxyEmail: faker.internet.email(),
      }
      mockedUserRepo.upsertUser.mockResolvedValue({
        id: USER_ID,
        email: rosterStudent.email,
        firstName: rosterStudent.firstName,
        proxyEmail: undefined,
        isCreated: true,
      })
      mockedStudentRepo.getActivePartnersForStudent.mockResolvedValue(undefined)
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId.mockResolvedValue(
        {
          partnerId: NEW_SCHOOL_PARTNER_ID,
          partnerKey: 'new-school-partner-key',
          partnerName: 'new-school-partner-name',
        }
      )

      await rosterPartnerStudents([rosterStudent], SCHOOL_ID)

      expect(
        mockedStudentPartnerOrgRepo.createUserStudentPartnerOrgInstance
      ).toHaveBeenCalledWith(
        {
          userId: USER_ID,
          studentPartnerOrgId: NEW_SCHOOL_PARTNER_ID,
        },
        expect.toBeTransactionClient()
      )
      expect(
        mockedStudentPartnerOrgRepo.getStudentPartnerOrgByKey
      ).not.toHaveBeenCalled()
    })

    test('do nothing if student partner org instance to add is already active', async () => {
      const USER_ID = 'partnerOrgAlreadyActive'
      const PARTNER_ID = 'existing-partner-id'
      const PARTNER_KEY = 'existing-partner-key'

      const rosterStudent = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        gradeLevel: '9',
        lastName: faker.person.lastName(),
        proxyEmail: faker.internet.email(),
      }
      mockedUserRepo.upsertUser.mockResolvedValue({
        id: USER_ID,
        email: rosterStudent.email,
        firstName: rosterStudent.firstName,
        proxyEmail: undefined,
        isCreated: true,
      })
      mockedStudentRepo.getActivePartnersForStudent.mockResolvedValue([
        {
          id: PARTNER_ID,
          name: PARTNER_KEY,
        },
      ])
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgByKey.mockResolvedValue({
        partnerId: PARTNER_ID,
        partnerKey: PARTNER_KEY,
        partnerName: 'new-partner-name',
      })
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId.mockResolvedValue(
        undefined
      )

      await rosterPartnerStudents(
        [rosterStudent],
        'spo-already-active',
        PARTNER_KEY
      )

      expect(
        mockedStudentPartnerOrgRepo.createUserStudentPartnerOrgInstance
      ).not.toHaveBeenCalled()
    })

    test('deactivates and adds new instance if student partner org to add is different than active', async () => {
      const USER_ID = 'deactivate-existing-spo'
      const EXISTING_PARTNER_ID = 'existing-partner-id'
      const NEW_PARTNER_ID = 'new-partner-id'
      const NEW_PARTNER_KEY = 'new-partner-key'

      const rosterStudent = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        gradeLevel: '9',
        lastName: faker.person.lastName(),
        proxyEmail: faker.internet.email(),
      }
      mockedUserRepo.upsertUser.mockResolvedValue({
        id: USER_ID,
        email: rosterStudent.email,
        firstName: rosterStudent.firstName,
        proxyEmail: undefined,
        isCreated: true,
      })
      mockedStudentRepo.getActivePartnersForStudent.mockResolvedValue([
        {
          id: EXISTING_PARTNER_ID,
          name: EXISTING_PARTNER_ID,
        },
      ])
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgByKey.mockResolvedValue({
        partnerId: NEW_PARTNER_ID,
        partnerKey: NEW_PARTNER_KEY,
        partnerName: 'new-partner-name',
      })
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId.mockResolvedValue(
        undefined
      )

      await rosterPartnerStudents(
        [rosterStudent],
        'deactivate',
        NEW_PARTNER_KEY
      )

      expect(
        mockedStudentPartnerOrgRepo.deactivateUserStudentPartnerOrgInstance
      ).toHaveBeenCalledWith(
        expect.toBeTransactionClient(),
        USER_ID,
        EXISTING_PARTNER_ID
      )
      expect(
        mockedStudentPartnerOrgRepo.createUserStudentPartnerOrgInstance
      ).toHaveBeenCalledWith(
        {
          userId: USER_ID,
          studentPartnerOrgId: NEW_PARTNER_ID,
        },
        expect.toBeTransactionClient()
      )
    })

    test('do nothing if school student partner org to add is already active', async () => {
      const EXISTING_SCHOOL_PARTNER_ID = 'existing-school-partner-id'
      const EXISTING_SCHOOL_PARTNER_KEY = 'existing-school-partner-key'
      const rosterStudent = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        gradeLevel: '9',
        lastName: faker.person.lastName(),
        proxyEmail: faker.internet.email(),
      }
      mockedUserRepo.upsertUser.mockResolvedValue({
        id: 'school-spo-already-active',
        email: rosterStudent.email,
        firstName: rosterStudent.firstName,
        proxyEmail: undefined,
        isCreated: true,
      })
      mockedStudentRepo.getActivePartnersForStudent.mockResolvedValue([
        {
          id: EXISTING_SCHOOL_PARTNER_ID,
          name: EXISTING_SCHOOL_PARTNER_KEY,
        },
      ])
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId.mockResolvedValue(
        {
          partnerId: EXISTING_SCHOOL_PARTNER_ID,
          partnerKey: EXISTING_SCHOOL_PARTNER_KEY,
          partnerName: 'existing-school-partner-name',
        }
      )

      await rosterPartnerStudents([rosterStudent], 'school-spo-already-active')

      expect(
        mockedStudentPartnerOrgRepo.createUserStudentPartnerOrgInstance
      ).not.toHaveBeenCalled()
    })

    test('deactivates and adds new instance if school student partner org to add is different than active', async () => {
      const USER_ID = 'deactivates-existing-school-partner-instance'
      const EXISTING_SCHOOL_PARTNER_ID = 'existing-school-partner-id'
      const NEW_SCHOOL_PARTNER_ID = 'new-school-partner-id'

      const rosterStudent = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        gradeLevel: '9',
        lastName: faker.person.lastName(),
        proxyEmail: faker.internet.email(),
      }
      mockedUserRepo.upsertUser.mockResolvedValue({
        id: USER_ID,
        email: rosterStudent.email,
        firstName: rosterStudent.firstName,
        proxyEmail: undefined,
        isCreated: false,
      })
      mockedStudentRepo.getActivePartnersForStudent.mockResolvedValue([
        {
          id: EXISTING_SCHOOL_PARTNER_ID,
          name: 'existing-school-partner-id',
        },
      ])
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId.mockResolvedValue(
        {
          partnerId: NEW_SCHOOL_PARTNER_ID,
          partnerKey: 'new-school-parnter-key',
          partnerName: 'new-school-partner-name',
        }
      )

      await rosterPartnerStudents([rosterStudent], 'replaces')

      expect(
        mockedStudentPartnerOrgRepo.deactivateUserStudentPartnerOrgInstance
      ).toHaveBeenCalledWith(
        expect.toBeTransactionClient(),
        USER_ID,
        EXISTING_SCHOOL_PARTNER_ID
      )
      expect(
        mockedStudentPartnerOrgRepo.createUserStudentPartnerOrgInstance
      ).toHaveBeenCalledWith(
        {
          userId: USER_ID,
          studentPartnerOrgId: NEW_SCHOOL_PARTNER_ID,
        },
        expect.toBeTransactionClient()
      )
    })
  })
})

describe('registerStudent', () => {
  beforeAll(async () => {
    mockedAuthUtils.hashPassword.mockResolvedValue(HASHED_PASSWORD_RESOLVED)
  })
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('adds user, student_profile, and other user-related rows', async () => {
    const USER_ID = 'registerStudentAll'
    const student = {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      gradeLevel: '10th',
      lastName: faker.person.lastName(),
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
        password: HASHED_PASSWORD_RESOLVED,
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
    expect(mockedStudentRepo.upsertStudentProfile).toHaveBeenCalledWith(
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
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
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

  test('creates user with linked class if class code available', async () => {
    const USER_ID = 'linkClassCode'
    const student = {
      classCode: 'ABC123',
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: 'this-is-my-PASSword999',
    }
    mockedUserRepo.createUser.mockResolvedValue({
      id: USER_ID,
      email: student.email,
      firstName: student.firstName,
    })
    mockedTeacherService.getTeacherSchoolIdFromClassCode.mockResolvedValue(
      undefined
    )

    await registerStudent(student)

    expect(mockedTeacherService.addStudentToTeacherClass).toHaveBeenCalledWith(
      USER_ID,
      student.classCode,
      expect.toBeTransactionClient()
    )
  })

  test(`uses teacher's school if have a class code and no schoolId was provided`, async () => {
    const USER_ID = 'useTeacherSchool'
    const teacherSchoolId = 'teacherSchoolId'

    const student = {
      classCode: '987ZYX',
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: 'purpleEleph@nt5',
    }
    mockedUserRepo.createUser.mockResolvedValue({
      id: USER_ID,
      email: student.email,
      firstName: student.firstName,
    })
    mockedTeacherService.getTeacherSchoolIdFromClassCode.mockResolvedValue(
      teacherSchoolId
    )

    await registerStudent(student)

    expect(mockedStudentRepo.upsertStudentProfile).toHaveBeenCalledWith(
      {
        userId: USER_ID,
        schoolId: teacherSchoolId,
      },
      expect.toBeTransactionClient()
    )
    expect(
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId
    ).toHaveBeenCalled()
  })

  test('creates user with referral', async () => {
    const USER_ID = 'registerStudentWithPassword'
    const REFERRAL_USER = {
      id: '01859800-be4b-685f-4130-8709193d461c',
      code: 'A',
      deactivated: false,
      email: faker.internet.email(),
      isVolunteer: false,
      isAdmin: false,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phoneVerified: false,
      smsConsent: false,
    }
    const student = {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: 'Password123!',
      referredByCode: REFERRAL_USER.code,
    }
    mockedUserRepo.createUser.mockResolvedValue({
      id: USER_ID,
      email: student.email,
      firstName: student.firstName,
    })
    mockedAuthUtils.getReferredBy.mockResolvedValue(REFERRAL_USER.id)

    await registerStudent(student)

    expect(mockedUserRepo.createUser).toHaveBeenCalledWith(
      {
        email: student.email,
        emailVerified: false,
        firstName: student.firstName,
        lastName: student.lastName,
        password: HASHED_PASSWORD_RESOLVED,
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
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: 'sUper-$ecuRe-p@s$w0rd',
    }
    mockedUserRepo.createUser.mockResolvedValue({
      id: USER_ID,
      email: student.email,
      firstName: student.firstName,
    })
    mockedAuthUtils.getReferredBy.mockResolvedValue(undefined)

    await registerStudent(student)

    expect(mockedUserRepo.createUser).toHaveBeenCalledWith(
      {
        email: student.email,
        emailVerified: false,
        firstName: student.firstName,
        lastName: student.lastName,
        otherSignupSource: undefined,
        password: HASHED_PASSWORD_RESOLVED,
        passwordResetToken: undefined,
        signupSourceId: undefined,
        verified: false,
      },
      expect.toBeTransactionClient()
    )
  })

  test('creates non-school partner org instance', async () => {
    const USER_ID = 'registerStudentWithPartnerOrg'
    const PARTNER_ORG = {
      id: 'partnerOrgId',
      key: 'partnerOrgKey',
      name: 'Partner Org Name',
    }
    const student = {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: 'Password123!',
      studentPartnerOrgKey: PARTNER_ORG.key,
    }
    mockedUserRepo.createUser.mockResolvedValue({
      id: USER_ID,
      email: student.email,
      firstName: student.firstName,
    })
    mockedStudentPartnerOrgRepo.getStudentPartnerOrgByKey.mockResolvedValue({
      partnerId: PARTNER_ORG.id,
      partnerKey: PARTNER_ORG.key,
      partnerName: PARTNER_ORG.name,
    })
    mockedStudentRepo.getActivePartnersForStudent.mockResolvedValue(undefined)

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
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: 'Password123!',
      studentPartnerOrgKey: PARTNER_ORG.key,
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
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: 'Password123!',
      studentPartnerOrgKey: PARTNER_ORG.key,
    }
    mockedUserRepo.createUser.mockResolvedValue({
      id: USER_ID,
      email: student.email,
      firstName: student.firstName,
    })

    await registerStudent(student)

    expect(mockedStudentRepo.upsertStudentProfile).toHaveBeenCalledWith(
      {
        college: undefined,
        gradeLevel: undefined,
        schoolId: PARTNER_ORG.schoolId,
        studentPartnerOrgKey: PARTNER_ORG.key,
        studentPartnerOrgSiteName: undefined,
        userId: USER_ID,
        zipCode: undefined,
      },
      expect.toBeTransactionClient()
    )
    expect(
      mockedStudentPartnerOrgRepo.createUserStudentPartnerOrgInstance
    ).toHaveBeenCalledTimes(1)
  })

  test('validates input', async () => {
    const data = {
      email: faker.internet.email(),
      ip: faker.internet.ip(),
      firstName: faker.person.firstName(),
      gradeLevel: '8th',
      lastName: faker.person.lastName(),
      password: 'Password123',
      schoolId: 'iamschoolidiswear',
      zipCode: '92010',
    }
    mockedUserRepo.createUser.mockResolvedValue({
      id: 'zzzyyyxxx',
      email: data.email,
      firstName: data.firstName,
    })

    await registerStudent(data)

    expect(mockedAuthUtils.checkEmail).toHaveBeenCalledWith(data.email)
    expect(mockedAuthUtils.checkNames).toHaveBeenCalledWith(
      data.firstName,
      data.lastName
    )
    expect(mockedAuthService.checkUser).toHaveBeenCalledWith(data.email)
    expect(mockedEligibilityService.verifyEligibility).toHaveBeenCalledWith(
      data.zipCode,
      data.schoolId
    )
    expect(mockedAuthService.checkIpAddress).toHaveBeenCalledWith(data.ip)
  })

  test('throws if no authentication method provided', async () => {
    await expect(
      registerStudent({
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      })
    ).rejects.toThrow(new InputError('No authentication method provided.'))
  })
})

describe('registerTeacher', () => {
  beforeAll(() => {
    mockedSignUpSourceRepo.getSignUpSourceByName.mockResolvedValue({
      id: OTHER_SIGNUP_SOURCE_ID,
      name: 'Other',
    })
    mockedAuthUtils.hashPassword.mockResolvedValue(HASHED_PASSWORD_RESOLVED)
  })

  test('validates input', async () => {
    const data = {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      ip: faker.internet.ip(),
      lastName: faker.person.lastName(),
      password: 'Password123',
      schoolId: 'school-id',
      signupSource: 'Another teacher at my school',
    }
    mockedUserRepo.createUser.mockResolvedValue({
      id: '123',
      firstName: data.firstName,
      email: data.email,
    })

    await registerTeacher(data)

    expect(mockedAuthUtils.checkEmail).toHaveBeenCalledWith(data.email)
    expect(mockedAuthUtils.checkNames).toHaveBeenCalledWith(
      data.firstName,
      data.lastName
    )
    expect(mockedAuthUtils.checkPassword).toHaveBeenCalledWith(data.password)
    expect(mockedAuthService.checkUser).toHaveBeenCalledWith(data.email)
  })

  test('creates teacher', async () => {
    const USER_ID = '456'
    const data = {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      ip: faker.internet.ip(),
      lastName: faker.person.lastName(),
      password: 'p@sSw0rb666',
      schoolId: 'another-school-id',
      signupSource: 'Kagi search',
    }
    mockedUserRepo.createUser.mockResolvedValue({
      id: USER_ID,
      firstName: data.firstName,
      email: data.email,
    })

    const teacher = await registerTeacher(data)

    expect(mockedUserRepo.createUser).toHaveBeenCalledWith(
      {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        otherSignupSource: data.signupSource,
        password: HASHED_PASSWORD_RESOLVED,
        signupSourceId: OTHER_SIGNUP_SOURCE_ID,
      },
      expect.toBeTransactionClient()
    )
    expect(mockedUserRepo.insertUserRoleByUserId).toHaveBeenCalledWith(
      USER_ID,
      USER_ROLES.TEACHER,
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
        ipAddress: data.ip,
      },
      expect.toBeTransactionClient()
    )
    expect(mockedTeacherRepo.createTeacher).toHaveBeenCalledWith(
      {
        userId: USER_ID,
        schoolId: data.schoolId,
      },
      expect.toBeTransactionClient()
    )

    expect(teacher.email).toBe(data.email)
    expect(teacher.firstName).toBe(data.firstName)
    expect(teacher.userType).toBe('teacher')
    expect(teacher.isAdmin).toBe(false)
    expect(teacher.isVolunteer).toBe(false)
  })
})
