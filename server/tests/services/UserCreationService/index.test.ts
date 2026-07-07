import './mocks'
import { faker } from '@faker-js/faker'
import {
  registerStudent,
  registerTeacher,
  rosterPartnerStudents,
  upsertStudent,
} from '../../../services/UserCreationService'
import { ACCOUNT_USER_ACTIONS, USER_ROLES } from '../../../constants'
import { InputError } from '../../../models/Errors'
import {
  buildRosterStudent,
  buildStudent,
  buildTeacher,
  HASHED_PASSWORD_RESOLVED,
  installAuthAndSignupMocks,
  RESET_TOKEN,
  mockCreatedUser,
  mockUpsertedUser,
  mockedAuthService,
  mockedAuthUtils,
  mockedEligibilityService,
  mockedFedCredRepo,
  mockedMailService,
  mockedReferralService,
  mockedStudentPartnerOrgRepo,
  mockedStudentRepo,
  mockedTeacherRepo,
  mockedTeacherService,
  mockedUPFRepo,
  mockedUserActionRepo,
  mockedUserRepo,
  mockedUsersGradeLevelsRepo,
  mockedUsersSchoolsRepo,
  OTHER_SIGNUP_SOURCE_ID,
  ROSTER_SIGNUP_SOURCE_ID,
} from './fixtures'

describe('rosterPartnerStudents', () => {
  beforeAll(() => installAuthAndSignupMocks('Roster'))
  beforeEach(() => jest.clearAllMocks())

  test('validates input', async () => {
    const data = buildRosterStudent({ proxyEmail: faker.internet.email() })
    mockUpsertedUser(data, { id: 'abc', isCreated: true })

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
    const rosterStudent = buildRosterStudent({ gradeLevel: '8.0' })
    mockUpsertedUser(rosterStudent, { id: USER_ID, isCreated: true })

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
        gradeLevel: '8th',
        schoolId: SCHOOL_ID,
      },
      expect.toBeTransactionClient()
    )
  })

  test('hashes password if exists', async () => {
    const rosterStudent = buildRosterStudent({ gradeLevel: '10' })
    mockUpsertedUser(rosterStudent, { id: 'userId456', isCreated: true })

    await rosterPartnerStudents([rosterStudent], 'schoolId456')

    expect(mockedUserRepo.upsertUser).toHaveBeenCalledWith(
      expect.objectContaining({ password: HASHED_PASSWORD_RESOLVED }),
      expect.toBeTransactionClient()
    )
  })

  test('adds reset token if no password and sends email', async () => {
    const rosterStudent = buildRosterStudent({
      gradeLevel: '12',
      password: undefined,
      proxyEmail: faker.internet.email(),
    })
    mockUpsertedUser(rosterStudent, { id: 'userId789', isCreated: true })
    mockedAuthUtils.createResetToken.mockReturnValue(RESET_TOKEN)

    await rosterPartnerStudents([rosterStudent], 'schoolId789')

    expect(mockedUserRepo.upsertUser).toHaveBeenCalledWith(
      expect.objectContaining({
        password: undefined,
        passwordResetToken: RESET_TOKEN,
      }),
      expect.toBeTransactionClient()
    )
    expect(
      mockedMailService.sendRosterStudentSetPasswordEmail
    ).toHaveBeenCalledWith(
      rosterStudent.proxyEmail,
      rosterStudent.firstName,
      RESET_TOKEN
    )
  })

  describe('if student already exists', () => {
    test('upserts the user and student profile but not the metadata', async () => {
      const rosterStudent = buildRosterStudent({
        gradeLevel: '12',
        proxyEmail: faker.internet.email(),
      })
      mockUpsertedUser(rosterStudent, { id: 'userId789', isCreated: false })

      await rosterPartnerStudents([rosterStudent], 'schoolId789')

      expect(mockedUserRepo.upsertUser).toHaveBeenCalled()
      expect(mockedUserRepo.insertUserRoleByUserId).not.toHaveBeenCalled()
      expect(mockedUPFRepo.createUPFByUserId).not.toHaveBeenCalled()
      expect(mockedUserActionRepo.createAccountAction).not.toHaveBeenCalled()
      expect(mockedStudentRepo.upsertStudentProfile).toHaveBeenCalled()
    })
  })
})

describe('registerStudent', () => {
  beforeAll(() => installAuthAndSignupMocks('Roster'))
  beforeEach(() => jest.clearAllMocks())

  test('adds user, student_profile, and other user-related rows', async () => {
    const USER_ID = 'registerStudentAll'
    const student = buildStudent({
      gradeLevel: '10th',
      schoolId: '01859800-bc76-3420-c3c5-2c46ccf409c4',
      zipCode: '00501',
    })
    mockCreatedUser(student, { id: USER_ID })

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
    const student = buildStudent({
      password: undefined,
      profileId: 'profile-id',
      issuer: 'google',
    })
    mockCreatedUser(student, { id: USER_ID })

    await registerStudent(student)

    expect(mockedUserRepo.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        issuer: student.issuer,
        profileId: student.profileId,
        emailVerified: true,
        verified: true,
      }),
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
    const student = buildStudent({ classCode: 'ABC123' })
    mockCreatedUser(student, { id: USER_ID })
    mockedTeacherService.getTeacherSchoolIdFromClassCode.mockResolvedValue(
      undefined
    )

    await registerStudent(student)

    expect(
      mockedTeacherService.addStudentToTeacherClassByClassCode
    ).toHaveBeenCalledWith(
      USER_ID,
      student.classCode,
      expect.toBeTransactionClient()
    )
  })

  test(`uses teacher's school if have a class code and no schoolId was provided`, async () => {
    const USER_ID = 'useTeacherSchool'
    const teacherSchoolId = 'teacherSchoolId'
    const student = buildStudent({ classCode: '987ZYX' })
    mockCreatedUser(student, { id: USER_ID })
    mockedTeacherService.getTeacherSchoolIdFromClassCode.mockResolvedValue(
      teacherSchoolId
    )

    await registerStudent(student)

    expect(mockedStudentRepo.upsertStudentProfile).toHaveBeenCalledWith(
      { userId: USER_ID, schoolId: teacherSchoolId },
      expect.toBeTransactionClient()
    )
    expect(
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId
    ).toHaveBeenCalled()
  })

  test('creates user with referral', async () => {
    const USER_ID = 'registerStudentWithReferral'
    const student = buildStudent({ referredByCode: 'A' })
    mockCreatedUser(student, { id: USER_ID })

    await registerStudent(student)

    expect(mockedUserRepo.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ referredByCode: 'A' }),
      expect.toBeTransactionClient()
    )
    expect(mockedReferralService.addReferralForUserByCode).toHaveBeenCalledWith(
      USER_ID,
      'A',
      expect.toBeTransactionClient()
    )
  })

  test('creates user with password', async () => {
    const student = buildStudent()
    mockCreatedUser(student, { id: 'registerStudentWithPassword' })

    await registerStudent(student)

    expect(mockedUserRepo.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ password: HASHED_PASSWORD_RESOLVED }),
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
    const student = buildStudent({ studentPartnerOrgKey: PARTNER_ORG.key })
    mockCreatedUser(student, { id: USER_ID })
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
      { userId: USER_ID, studentPartnerOrgId: PARTNER_ORG.id },
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
    const student = buildStudent({ studentPartnerOrgKey: PARTNER_ORG.key })
    mockCreatedUser(student, { id: USER_ID })

    await registerStudent(student)

    expect(
      mockedStudentPartnerOrgRepo.createUserStudentPartnerOrgInstance
    ).toHaveBeenCalledWith(
      { userId: USER_ID, studentPartnerOrgId: PARTNER_ORG.id },
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
    const student = buildStudent({ studentPartnerOrgKey: PARTNER_ORG.key })
    mockCreatedUser(student, { id: USER_ID })

    await registerStudent(student)

    expect(mockedStudentRepo.upsertStudentProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        schoolId: PARTNER_ORG.schoolId,
        studentPartnerOrgKey: PARTNER_ORG.key,
        userId: USER_ID,
      }),
      expect.toBeTransactionClient()
    )
    expect(
      mockedStudentPartnerOrgRepo.createUserStudentPartnerOrgInstance
    ).toHaveBeenCalledTimes(1)
  })

  test('validates input', async () => {
    const data = buildStudent({
      ip: faker.internet.ip(),
      gradeLevel: '8th',
      schoolId: 'iamschoolidiswear',
      zipCode: '92010',
    })
    mockCreatedUser(data, { id: 'zzzyyyxxx' })

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
      registerStudent(buildStudent({ password: undefined }))
    ).rejects.toThrow(new InputError('No authentication method provided.'))
  })
})

describe('upsertStudent', () => {
  beforeEach(() => jest.clearAllMocks())

  test('upserts the student with the correct params', async () => {
    const data = {
      college: 'some college',
      gradeLevel: '9th',
      studentPartnerOrgKey: 'spo-key',
      studentPartnerOrgSiteName: 'Site Name',
      userId: 'student-id',
      zipCode: '00000',
    }
    await upsertStudent(data)

    expect(mockedStudentRepo.upsertStudentProfile).toHaveBeenCalledWith(
      data,
      expect.toBeTransactionClient()
    )
  })

  test('upserts the school and grade level', async () => {
    const data = {
      gradeLevel: 'grade-level',
      schoolId: 'school-id',
      userId: 'student-id',
    }

    await upsertStudent(data)

    expect(mockedUsersSchoolsRepo.upsertUsersSchool).toHaveBeenLastCalledWith(
      data.userId,
      data.schoolId,
      'student_at_school',
      expect.toBeTransactionClient()
    )
    expect(
      mockedUsersGradeLevelsRepo.upsertUserGradeLevel
    ).toHaveBeenCalledWith(
      data.userId,
      data.gradeLevel,
      expect.toBeTransactionClient()
    )
  })

  describe('creates and/or deactivates studentPartnerOrg instance', () => {
    test('gets the active non-school and school partners with the correct parameters', async () => {
      const USER_ID = 'userId555'
      const PARTNER_KEY = 'partner-key'
      const SITE_ID = 'site-id'
      const SCHOOL_ID = 'school-id'

      mockedStudentRepo.getActivePartnersForStudent.mockResolvedValue(undefined)
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId.mockResolvedValue(
        undefined
      )
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgByKey.mockResolvedValue({
        partnerId: 'partner-id',
        partnerKey: PARTNER_KEY,
        partnerName: 'partner-name',
        siteId: SITE_ID,
      })

      await upsertStudent({
        schoolId: SCHOOL_ID,
        studentPartnerOrgKey: PARTNER_KEY,
        studentPartnerOrgSiteName: SITE_ID,
        userId: USER_ID,
      })

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

      await upsertStudent({
        studentPartnerOrgKey: NEW_PARTNER_KEY,
        studentPartnerOrgSiteName: NEW_SITE_ID,
        userId: USER_ID,
      })

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

      mockedStudentRepo.getActivePartnersForStudent.mockResolvedValue(undefined)
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId.mockResolvedValue(
        {
          partnerId: NEW_SCHOOL_PARTNER_ID,
          partnerKey: 'new-school-partner-key',
          partnerName: 'new-school-partner-name',
        }
      )

      await upsertStudent({ schoolId: SCHOOL_ID, userId: USER_ID })

      expect(
        mockedStudentPartnerOrgRepo.createUserStudentPartnerOrgInstance
      ).toHaveBeenCalledWith(
        { userId: USER_ID, studentPartnerOrgId: NEW_SCHOOL_PARTNER_ID },
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

      mockedStudentRepo.getActivePartnersForStudent.mockResolvedValue([
        { id: PARTNER_ID, name: PARTNER_KEY },
      ])
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgByKey.mockResolvedValue({
        partnerId: PARTNER_ID,
        partnerKey: PARTNER_KEY,
        partnerName: 'new-partner-name',
      })
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId.mockResolvedValue(
        undefined
      )

      await upsertStudent({
        studentPartnerOrgKey: PARTNER_KEY,
        userId: USER_ID,
      })

      expect(
        mockedStudentPartnerOrgRepo.createUserStudentPartnerOrgInstance
      ).not.toHaveBeenCalled()
    })

    test('deactivates and adds new instance if student partner org to add is different than active', async () => {
      const USER_ID = 'deactivate-existing-spo'
      const EXISTING_PARTNER_ID = 'existing-partner-id'
      const NEW_PARTNER_ID = 'new-partner-id'
      const NEW_PARTNER_KEY = 'new-partner-key'

      mockedStudentRepo.getActivePartnersForStudent.mockResolvedValue([
        { id: EXISTING_PARTNER_ID, name: EXISTING_PARTNER_ID },
      ])
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgByKey.mockResolvedValue({
        partnerId: NEW_PARTNER_ID,
        partnerKey: NEW_PARTNER_KEY,
        partnerName: 'new-partner-name',
      })
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId.mockResolvedValue(
        undefined
      )

      await upsertStudent({
        studentPartnerOrgKey: NEW_PARTNER_KEY,
        userId: USER_ID,
      })

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
        { userId: USER_ID, studentPartnerOrgId: NEW_PARTNER_ID },
        expect.toBeTransactionClient()
      )
    })

    test('do nothing if school student partner org to add is already active', async () => {
      const USER_ID = 'school-spo-already-active'
      const EXISTING_ID = 'existing-school-partner-id'
      const EXISTING_KEY = 'existing-school-partner-key'

      mockedStudentRepo.getActivePartnersForStudent.mockResolvedValue([
        { id: EXISTING_ID, name: EXISTING_KEY },
      ])
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId.mockResolvedValue(
        {
          partnerId: EXISTING_ID,
          partnerKey: EXISTING_KEY,
          partnerName: 'existing-school-partner-name',
        }
      )

      await upsertStudent({ userId: USER_ID })

      expect(
        mockedStudentPartnerOrgRepo.createUserStudentPartnerOrgInstance
      ).not.toHaveBeenCalled()
    })

    test('deactivates and adds new instance if school student partner org to add is different than active', async () => {
      const USER_ID = 'deactivates-existing-school-partner-instance'
      const EXISTING_ID = 'existing-school-partner-id'
      const NEW_ID = 'new-school-partner-id'

      mockedStudentRepo.getActivePartnersForStudent.mockResolvedValue([
        { id: EXISTING_ID, name: 'existing-school-partner-id' },
      ])
      mockedStudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId.mockResolvedValue(
        {
          partnerId: NEW_ID,
          partnerKey: 'new-school-parnter-key',
          partnerName: 'new-school-partner-name',
        }
      )

      await upsertStudent({
        schoolId: 'NEW_SCHOOL_PARTNER_ID',
        userId: USER_ID,
      })

      expect(
        mockedStudentPartnerOrgRepo.deactivateUserStudentPartnerOrgInstance
      ).toHaveBeenCalledWith(
        expect.toBeTransactionClient(),
        USER_ID,
        EXISTING_ID
      )
      expect(
        mockedStudentPartnerOrgRepo.createUserStudentPartnerOrgInstance
      ).toHaveBeenCalledWith(
        { userId: USER_ID, studentPartnerOrgId: NEW_ID },
        expect.toBeTransactionClient()
      )
    })
  })
})

describe('registerTeacher', () => {
  beforeAll(() => installAuthAndSignupMocks('Other'))
  beforeEach(() => jest.clearAllMocks())

  test('validates input', async () => {
    const data = buildTeacher({
      schoolId: 'school-id',
      signupSource: 'Another teacher at my school',
    })
    mockCreatedUser(data, { id: '123' })

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
    const data = buildTeacher({
      schoolId: 'another-school-id',
      signupSource: 'Kagi search',
    })
    mockCreatedUser(data, { id: USER_ID })

    const teacher = await registerTeacher(data)

    expect(mockedUserRepo.createUser).toHaveBeenCalledWith(
      {
        email: data.email,
        emailVerified: false,
        firstName: data.firstName,
        lastName: data.lastName,
        otherSignupSource: data.signupSource,
        password: HASHED_PASSWORD_RESOLVED,
        signupSourceId: OTHER_SIGNUP_SOURCE_ID,
        verified: false,
      },
      expect.toBeTransactionClient()
    )
    expect(mockedUserRepo.insertUserRoleByUserId).toHaveBeenCalledWith(
      USER_ID,
      USER_ROLES.TEACHER,
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
      { userId: USER_ID, schoolId: data.schoolId },
      expect.toBeTransactionClient()
    )
    expect(teacher.email).toBe(data.email)
    expect(teacher.firstName).toBe(data.firstName)
    expect(teacher.userType).toBe('teacher')
    expect(teacher.isAdmin).toBe(false)
  })
})
