import { getClient, runInTransaction, TransactionClient } from '../db'
import {
  checkEmail,
  checkNames,
  checkPassword,
  createResetToken,
  getReferredBy,
  hashPassword,
  RegisterStudentPayload,
  RegisterStudentWithFedCredPayload,
  RegisterStudentWithPasswordPayload,
  RegisterStudentWithPGPayload,
  RegisterTeacherPayload,
} from '../utils/auth-utils'
import {
  sendRosterStudentSetPasswordEmail,
  sendStudentParentGuardianCreatedAccountEmail,
} from './MailService'
import * as UserRepo from '../models/User'
import * as StudentRepo from '../models/Student'
import * as StudentPartnerOrgRepo from '../models/StudentPartnerOrg'
import { createUPFByUserId } from '../models/UserProductFlags'
import { createAccountAction } from '../models/UserAction'
import * as SignUpSourceRepo from '../models/SignUpSource'
import { ACCOUNT_USER_ACTIONS, USER_ROLES_TYPE } from '../constants/user'
import { STUDENT_EVENTS, USER_EVENTS, USER_ROLES } from '../constants'
import { emitter } from './EventsService'
import { GetStudentPartnerOrgResult } from '../models/StudentPartnerOrg'
import { insertFederatedCredential } from '../models/FederatedCredential'
import { checkIpAddress, checkUser } from './AuthService'
import { verifyEligibility } from './EligibilityService'
import * as FederatedCredentialService from './FederatedCredentialService'
import * as TeacherService from './TeacherService'
import {
  createParentGuardian,
  linkParentGuardianToStudent,
} from '../models/ParentGuardian'
import { InputError } from '../models/Errors'
import { createTeacher } from '../models/Teacher'

export interface RosterStudentPayload {
  cleverId?: string
  email: string
  firstName: string
  gradeLevel: string
  lastName: string
  password?: string
  proxyEmail?: string
}
export interface CreateStudentFedCredPayload {
  email: string
  firstName: string
  gradeLevel?: string
  lastName: string
  schoolId?: string
  studentPartnerOrg?: string
  profileId: string
  issuer: string
}

export async function rosterPartnerStudents(
  students: RosterStudentPayload[],
  schoolId: string,
  shouldSendPasswordResetEmail = true
) {
  const newUsers: {
    id: string
    email: string
    firstName: string
    passwordResetToken?: string
    proxyEmail?: string
  }[] = []
  const updatedUsers: {
    id: string
    email: string
  }[] = []
  const failedUsers: {
    email: string
    firstName: string
  }[] = []

  const signUpSource = await SignUpSourceRepo.getSignUpSourceByName(
    'Roster',
    getClient()
  )

  for (const student of students) {
    try {
      await runInTransaction(async (tc: TransactionClient) => {
        checkNames(student.firstName, student.lastName)
        checkEmail(student.email)
        if (student.proxyEmail) checkEmail(student.proxyEmail)
        if (student.password) {
          student.password = await hashPassword(student.password)
        }

        const passwordResetToken =
          !student.password && shouldSendPasswordResetEmail
            ? createResetToken()
            : undefined
        const userData = {
          email: student.email,
          emailVerified: true,
          firstName: student.firstName,
          lastName: student.lastName,
          password: student.password,
          passwordResetToken,
          proxyEmail: student.proxyEmail,
          signupSourceId: signUpSource?.id,
          verified: true,
        }
        const user = await upsertUser(
          userData,
          undefined,
          USER_ROLES.STUDENT,
          tc
        )

        const studentData = {
          userId: user.id,
          gradeLevel: parseInt(student.gradeLevel).toFixed(0) + 'th',
          schoolId,
        }
        await upsertStudent(studentData, tc)

        if (student.cleverId) {
          await FederatedCredentialService.linkAccount(
            student.cleverId,
            FederatedCredentialService.Issuer.CLEVER,
            user.id,
            tc
          )
        }

        if (user.isCreated) {
          newUsers.push({ passwordResetToken, ...user })
        } else {
          updatedUsers.push(user)
        }
      })
    } catch {
      failedUsers.push({
        email: student.email,
        firstName: student.firstName,
      })
    }
  }

  if (shouldSendPasswordResetEmail) {
    for (const user of newUsers) {
      if (user.passwordResetToken) {
        await sendRosterStudentSetPasswordEmail(
          user.proxyEmail ?? user.email,
          user.firstName,
          user.passwordResetToken
        )
      }
    }
  }

  return { failed: failedUsers, updated: updatedUsers, created: newUsers }
}

export async function verifyStudentData(data: RegisterStudentPayload) {
  checkEmail(data.email)
  checkNames(data.firstName, data.lastName)
  await checkUser(data.email)
  if (usePassword(data)) {
    checkPassword(data.password)
  }
  if (!data.studentPartnerOrgKey) {
    await verifyEligibility(data.zipCode, data.schoolId)
  }
  if (data.ip && !data.studentPartnerOrgKey) {
    await checkIpAddress(data.ip)
  }
  if (!usePassword(data) && !useResetToken(data) && !useFedCred(data)) {
    throw new InputError('No authentication method provided.')
  }
}

export async function registerStudent(
  data: RegisterStudentPayload,
  tc?: TransactionClient
) {
  await verifyStudentData(data)
  const newStudent = await runInTransaction(async (tc: TransactionClient) => {
    const passwordResetToken = useResetToken(data)
      ? createResetToken()
      : undefined
    const userData = {
      email: data.email,
      emailVerified: useFedCred(data),
      firstName: data.firstName,
      issuer: data.issuer,
      lastName: data.lastName,
      otherSignupSource: data.otherSignupSource,
      password: usePassword(data)
        ? await hashPassword(data.password)
        : undefined,
      passwordResetToken,
      profileId: data.profileId,
      referredBy: await getReferredBy(data.referredByCode),
      signupSourceId: data.signupSourceId,
      verified: useFedCred(data),
    }
    const user = await createUser(userData, data.ip, USER_ROLES.STUDENT, tc)

    let teacherSchoolId
    if (data.classCode) {
      teacherSchoolId = await TeacherService.getTeacherSchoolIdFromClassCode(
        data.classCode,
        tc
      )
    }

    const studentData = {
      userId: user.id,
      gradeLevel: data.gradeLevel,
      schoolId: data.schoolId ?? teacherSchoolId,
      studentPartnerOrgKey: data.studentPartnerOrgKey,
      studentPartnerOrgSiteName: data.studentPartnerOrgSiteName,
      zipCode: data.zipCode,
    }
    await upsertStudent(studentData, tc)

    if (data.classCode) {
      await TeacherService.addStudentToTeacherClassByClassCode(
        user.id,
        data.classCode,
        tc
      )
    }

    if (useParentGuardianEmail(data) && passwordResetToken) {
      const parentGuardian = await createParentGuardian(
        data.parentGuardianEmail,
        tc
      )
      await linkParentGuardianToStudent(parentGuardian.id, user.id, tc)
      await sendStudentParentGuardianCreatedAccountEmail(
        data.email,
        passwordResetToken
      )
    }

    return user
  }, tc)

  emitter.emit(USER_EVENTS.USER_CREATED, newStudent.id)
  emitter.emit(STUDENT_EVENTS.STUDENT_CREATED, newStudent.id)

  return {
    ...newStudent,
    isAdmin: false,
    isVolunteer: false,
    userType: 'student',
  }
}

async function createUser(
  userData: UserRepo.CreateUserPayload & {
    issuer?: string
    profileId?: string
  },
  ip: string | undefined,
  role: USER_ROLES_TYPE,
  tc: TransactionClient
) {
  const user = await UserRepo.createUser(userData, tc)
  await createUserMetadata(user.id, ip, role, tc)
  if (useFedCred(userData)) {
    await insertFederatedCredential(
      userData.profileId,
      userData.issuer,
      user.id,
      tc
    )
  }
  return user
}

async function upsertUser(
  userData: UserRepo.CreateUserPayload,
  ip: string | undefined,
  role: USER_ROLES_TYPE,
  tc: TransactionClient
) {
  const user = await UserRepo.upsertUser(userData, tc)

  if (user.isCreated) {
    await createUserMetadata(user.id, ip, role, tc)
  }

  return user
}

async function createUserMetadata(
  userId: string,
  ip: string | undefined,
  role: USER_ROLES_TYPE,
  tc: TransactionClient
) {
  // TODO: Should any of these be moved to the listener?
  await Promise.all([
    UserRepo.insertUserRoleByUserId(userId, role, tc),
    createUPFByUserId(userId, tc),
    createAccountAction(
      {
        action: ACCOUNT_USER_ACTIONS.CREATED,
        userId: userId,
        ipAddress: ip,
      },
      tc
    ),
  ])
}

export async function upsertStudent(
  studentData: StudentRepo.CreateStudentProfilePayload,
  tc?: TransactionClient
) {
  await runInTransaction(async (tc: TransactionClient) => {
    const activeInstances = await StudentRepo.getActivePartnersForStudent(
      studentData.userId,
      tc
    )

    let spoOrgToAdd = studentData.studentPartnerOrgKey
      ? await StudentPartnerOrgRepo.getStudentPartnerOrgByKey(
          tc,
          studentData.studentPartnerOrgKey,
          studentData.studentPartnerOrgSiteName
        )
      : null
    let spoSchoolToAdd =
      // Don't add a school student partner org from the school id if
      // the non-school student partner org to add is that already school.
      studentData.schoolId && spoOrgToAdd?.schoolId !== studentData.schoolId
        ? await StudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId(
            tc,
            studentData.schoolId
          )
        : null

    for (const a of activeInstances ?? []) {
      if (spoOrgToAdd && spoOrgToAdd.partnerId === a.id) {
        // The non-school student partner org we want to add for the student
        // already has an active instance.
        spoOrgToAdd = null
      } else if (spoSchoolToAdd && spoSchoolToAdd.partnerId === a.id) {
        // The school student partner org we want to add for the student
        // already has an active instance.
        spoSchoolToAdd = null
      } else {
        // This active instance doesn't match any of the ones we want to add
        // for that student. We can deactivate it.
        await StudentPartnerOrgRepo.deactivateUserStudentPartnerOrgInstance(
          tc,
          studentData.userId,
          a.id
        )
      }
    }

    if (spoOrgToAdd) {
      await addUserStudentPartnerOrgInstance(spoOrgToAdd)
    }

    if (spoSchoolToAdd) {
      await addUserStudentPartnerOrgInstance(spoSchoolToAdd)
    }

    if (spoOrgToAdd?.schoolId && !studentData.schoolId) {
      studentData.schoolId = spoOrgToAdd.schoolId
    }

    await StudentRepo.upsertStudentProfile(studentData, tc)

    async function addUserStudentPartnerOrgInstance(
      spo: GetStudentPartnerOrgResult
    ) {
      await StudentPartnerOrgRepo.createUserStudentPartnerOrgInstance(
        {
          userId: studentData.userId,
          studentPartnerOrgId: spo.partnerId,
          studentPartnerOrgSiteId: spo.siteId,
        },
        tc
      )
    }
  }, tc)
}

export async function registerTeacher(data: RegisterTeacherPayload) {
  checkEmail(data.email)
  checkNames(data.firstName, data.lastName)
  if (usePassword(data)) {
    checkPassword(data.password)
  }
  await checkUser(data.email)

  const newTeacher = await runInTransaction(async (tc: TransactionClient) => {
    const signupSource = await SignUpSourceRepo.getSignUpSourceByName(
      'Other',
      tc
    )

    const userData = {
      email: data.email,
      emailVerified: useFedCred(data),
      firstName: data.firstName,
      issuer: data.issuer,
      lastName: data.lastName,
      password: usePassword(data)
        ? await hashPassword(data.password)
        : undefined,
      profileId: data.profileId,
      signupSourceId: signupSource?.id,
      otherSignupSource: data.signupSource,
      verified: useFedCred(data),
    }
    const user = await createUser(userData, data.ip, USER_ROLES.TEACHER, tc)

    const teacherData = {
      userId: user.id,
      schoolId: data.schoolId,
    }
    await createTeacher(teacherData, tc)

    return user
  })

  return {
    ...newTeacher,
    isAdmin: false,
    isVolunteer: false,
    userType: 'teacher',
  }
}

function useFedCred(object: any): object is RegisterStudentWithFedCredPayload {
  return (
    'profileId' in object &&
    !!object.profileId &&
    'issuer' in object &&
    !!object.issuer
  )
}

function usePassword(
  object: any
): object is RegisterStudentWithPasswordPayload {
  return 'password' in object && !!object.password
}

function useResetToken(object: any): object is RegisterStudentWithPGPayload {
  return 'parentGuardianEmail' in object && !!object.parentGuardianEmail
}

function useParentGuardianEmail(
  object: any
): object is RegisterStudentWithPGPayload {
  return 'parentGuardianEmail' in object && object.parentGuardianEmail
}
