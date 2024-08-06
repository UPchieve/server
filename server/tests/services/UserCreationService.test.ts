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
import * as IpAddressService from '../../services/IpAddressService'
import * as TeacherService from '../../services/TeacherService'
import {
  registerStudent,
  rosterPartnerStudents,
} from '../../services/UserCreationService'
import { hashPassword, verifyPassword } from '../../utils/auth-utils'
import { ACCOUNT_USER_ACTIONS, USER_ROLES } from '../../constants'
import { InputError, LookupError, NotAllowedError } from '../../models/Errors'

jest.mock('../../models/User/queries')
jest.mock('../../models/Student/queries')
jest.mock('../../models/StudentPartnerOrg/queries')
jest.mock('../../models/SignUpSource/queries')
jest.mock('../../models/UserSessionMetrics/queries')
jest.mock('../../models/UserProductFlags/queries')
jest.mock('../../models/UserAction/queries')
jest.mock('../../models/FederatedCredential/queries')
jest.mock('../../services/MailService')
jest.mock('../../services/IpAddressService')
jest.mock('../../services/TeacherService')

const mockedUserRepo = mocked(UserRepo)
const mockedStudentRepo = mocked(StudentRepo)
const mockedStudentPartnerOrgRepo = mocked(StudentPartnerOrgRepo)
const mockedSignUpSourceRepo = mocked(SignUpSourceRepo)
const mockedUSMRepo = mocked(USMRepo)
const mockedUPFRepo = mocked(UPFRepo)
const mockedUserActionRepo = mocked(UserActionRepo)
const mockedFedCredRepo = mocked(FedCredRepo)
const mockedMailService = mocked(MailService)
const mockedIpAddressService = mocked(IpAddressService)
const mockedTeacherService = mocked(TeacherService)
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

      const { failed } = await rosterPartnerStudents([invalidFirstName], '123')

      expect(failed.length).toBe(1)
      expect(failed[0].email).toBe(invalidFirstName.email)
      expect(failed[0].firstName).toBe(invalidFirstName.firstName)
    })

    test('ensure lastName is valid', async () => {
      const invalidLastName = {
        firstName: faker.name.firstName(),
        email: '',
        gradeLevel: '',
        lastName: 'DELETE * FROM upchieve.users;',
      }

      const { failed } = await rosterPartnerStudents([invalidLastName], '123')

      expect(failed.length).toBe(1)
      expect(failed[0].email).toBe(invalidLastName.email)
      expect(failed[0].firstName).toBe(invalidLastName.firstName)
    })

    test('ensure email is valid', async () => {
      const invalidEmail = {
        firstName: faker.name.firstName(),
        email: 'isweariamemailATpromise.com',
        gradeLevel: '',
        lastName: faker.name.lastName(),
      }

      const { failed } = await rosterPartnerStudents([invalidEmail], '123')

      expect(failed.length).toBe(1)
      expect(failed[0].email).toBe(invalidEmail.email)
      expect(failed[0].firstName).toBe(invalidEmail.firstName)
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
      firstName: faker.name.firstName(),
      gradeLevel: '10',
      lastName: faker.name.lastName(),
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

    const firstArg = mockedUserRepo.upsertUser.mock.calls[0][0]
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
    mockedUserRepo.upsertUser.mockResolvedValue({
      id: USER_ID,
      email: rosterStudent.email,
      firstName: rosterStudent.firstName,
      proxyEmail: rosterStudent.proxyEmail,
      isCreated: true,
    })

    await rosterPartnerStudents([rosterStudent], SCHOOL_ID)

    const firstArg = mockedUserRepo.upsertUser.mock.calls[0][0]
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

  describe('if student already exists', () => {
    test('upserts the user and student profile but not the metadata', async () => {
      const USER_ID = 'userId789'
      const SCHOOL_ID = 'schoolId789'
      const rosterStudent = {
        email: faker.internet.email(),
        firstName: faker.name.firstName(),
        gradeLevel: '12',
        lastName: faker.name.lastName(),
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
        firstName: faker.name.firstName(),
        gradeLevel: '9',
        lastName: faker.name.lastName(),
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
        firstName: faker.name.firstName(),
        gradeLevel: '6',
        lastName: faker.name.lastName(),
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
        firstName: faker.name.firstName(),
        gradeLevel: '9',
        lastName: faker.name.lastName(),
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
        firstName: faker.name.firstName(),
        gradeLevel: '9',
        lastName: faker.name.lastName(),
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
        firstName: faker.name.firstName(),
        gradeLevel: '9',
        lastName: faker.name.lastName(),
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
        firstName: faker.name.firstName(),
        gradeLevel: '9',
        lastName: faker.name.lastName(),
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
        firstName: faker.name.firstName(),
        gradeLevel: '9',
        lastName: faker.name.lastName(),
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

  test('creates user with linked class if class code available', async () => {
    const USER_ID = 'linkClassCode'
    const student = {
      classCode: 'ABC123',
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
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
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
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
    mockedUserRepo.getUserByReferralCode.mockResolvedValue(REFERRAL_USER)

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
    const student = {
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
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
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
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
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
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

  test('throws if user with email already exists', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(
      'id-of-user-that-already-exists'
    )
    await expect(
      registerStudent({
        email: faker.internet.email(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      })
    ).rejects.toThrow(
      new LookupError('The email address you entered is already in use')
    )
  })

  test('throws if no authentication method provided', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    await expect(
      registerStudent({
        email: faker.internet.email(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      })
    ).rejects.toThrow(new InputError('No authentication method provided.'))
  })

  test('throws if non-US ip', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    mockedIpAddressService.getIpWhoIs.mockResolvedValue({
      country_code: 'RU',
      org: 'example',
    })
    await expect(
      registerStudent({
        email: faker.internet.email(),
        ip: faker.internet.ip(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      })
    ).rejects.toThrow(
      new NotAllowedError('Cannot register from an international IP address')
    )
  })
})
