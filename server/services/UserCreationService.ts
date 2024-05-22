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
import { sendReset, sendRosterStudentSetPasswordEmail } from './MailService'
import * as UserRepo from '../models/User'
import * as StudentRepo from '../models/Student'
import * as StudentPartnerOrgRepo from '../models/StudentPartnerOrg'
import { createUSMByUserId } from '../models/UserSessionMetrics'
import { createUPFByUserId } from '../models/UserProductFlags'
import { createAccountAction } from '../models/UserAction'
import * as SignUpSourceRepo from '../models/SignUpSource'
import { ACCOUNT_USER_ACTIONS, USER_ROLES_TYPE } from '../constants/user'
import { STUDENT_EVENTS, USER_EVENTS, USER_ROLES } from '../constants'
import { emitter } from './EventsService'
import {
  getStudentPartnerOrgByKey,
  GetStudentPartnerOrgResult,
} from '../models/StudentPartnerOrg'
import { insertFederatedCredential } from '../models/FederatedCredential'
import { checkIpAddress, checkUser } from './AuthService'
import { verifyEligibility } from './EligibilityService'
import {
  createParentGuardian,
  linkParentGuardianToStudent,
} from '../models/ParentGuardian'
import { InputError } from '../models/Errors'
import { createTeacher } from '../models/Teacher'

export interface RosterStudentPayload {
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
  partnerKey?: string,
  partnerSite?: string
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

        const passwordResetToken = !student.password
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
          studentPartnerOrgKey: partnerKey,
          studentPartnerOrgSiteName: partnerSite,
        }
        await upsertStudent(studentData, tc)

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

  for (const user of newUsers) {
    if (user.passwordResetToken) {
      await sendRosterStudentSetPasswordEmail(
        user.proxyEmail ?? user.email,
        user.firstName,
        user.passwordResetToken
      )
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
  if (!data.studentPartnerOrg) {
    await verifyEligibility(data.zipCode, data.schoolId)
  }
  if (data.ip) {
    await checkIpAddress(data.ip)
  }
  if (!usePassword(data) && !useResetToken(data) && !useFedCred(data)) {
    throw new InputError('No authentication method provided.')
  }
}

export async function registerStudent(data: RegisterStudentPayload) {
  await verifyStudentData(data)
  const newStudent = await runInTransaction(async (tc: TransactionClient) => {
    const passwordResetToken = useResetToken(data)
      ? createResetToken()
      : undefined
    const userData = {
      email: data.email,
      emailVerified: useFedCred(data),
      firstName: data.firstName,
      lastName: data.lastName,
      otherSignupSource: data.otherSignupSource,
      password: usePassword(data)
        ? await hashPassword(data.password)
        : undefined,
      passwordResetToken,
      referredBy: await getReferredBy(data.referredByCode),
      signupSourceId: data.signupSourceId,
      verified: useFedCred(data),
    }
    const user = await createUser(userData, data.ip, USER_ROLES.STUDENT, tc)

    // == Remove after high-line clean-up.
    const studentData = {
      college: data.college,
      userId: user.id,
      gradeLevel: data.currentGrade ?? data.gradeLevel,
      schoolId: data.highSchoolId ?? data.schoolId,
      studentPartnerOrgKey: data.studentPartnerOrg ?? data.studentPartnerOrgKey,
      studentPartnerOrgSiteName:
        data.partnerSite ?? data.studentPartnerOrgSiteName,
      zipCode: data.zipCode,
    }
    await upsertStudent(studentData, tc)

    if (useFedCred(data)) {
      await insertFederatedCredential(data.profileId, data.issuer, user.id, tc)
    }

    if (useParentGuardianEmail(data) && passwordResetToken) {
      const parentGuardian = await createParentGuardian(
        data.parentGuardianEmail,
        tc
      )
      await linkParentGuardianToStudent(parentGuardian.id, user.id, tc)
      await sendReset(data.email, passwordResetToken)
    }

    return user
  })

  emitter.emit(USER_EVENTS.USER_CREATED, newStudent.id)
  emitter.emit(STUDENT_EVENTS.STUDENT_CREATED, newStudent.id)

  return {
    ...newStudent,
    isAdmin: false,
    isVolunteer: false,
  }
}

// == Remove after high-line clean-up.
export async function createPartnerStudent(data: CreateStudentFedCredPayload) {
  let user
  await runInTransaction(async (tc: TransactionClient) => {
    if (!data.studentPartnerOrg) {
      throw new Error('Student Partner Org key unexpectedly null.')
    }

    const hasFederatedCredential = !!data.profileId && !!data.issuer

    const userData = {
      email: data.email,
      emailVerified: hasFederatedCredential,
      firstName: data.firstName,
      lastName: data.lastName,
      verified: hasFederatedCredential,
    }
    user = await createUser(userData, undefined, USER_ROLES.STUDENT, tc)

    const spo = await getStudentPartnerOrgByKey(tc, data.studentPartnerOrg)
    const studentData = {
      userId: user.id,
      studentPartnerOrgKey: data.studentPartnerOrg,
      schoolId: spo?.schoolId,
    }
    await upsertStudent(studentData, tc)

    if (hasFederatedCredential) {
      await insertFederatedCredential(data.profileId, data.issuer, user.id, tc)
    }
  })
  return user
}
// == End remove.

async function createUser(
  userData: UserRepo.CreateUserPayload,
  ip: string | undefined,
  role: USER_ROLES_TYPE,
  tc: TransactionClient
) {
  const user = await UserRepo.createUser(userData, tc)
  await createUserMetadata(user.id, ip, role, tc)
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
    createUSMByUserId(userId, tc),
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

async function upsertStudent(
  studentData: StudentRepo.CreateStudentProfilePayload,
  tc: TransactionClient
) {
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
}

export async function registerTeacher(data: RegisterTeacherPayload) {
  checkEmail(data.email)
  checkNames(data.firstName, data.lastName)
  checkPassword(data.password)
  await checkUser(data.email)

  const newTeacher = await runInTransaction(async (tc: TransactionClient) => {
    const userData = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      // TODO: Include signup source?
      password: await hashPassword(data.password),
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
  }
}

function useFedCred(object: any): object is RegisterStudentWithFedCredPayload {
  return 'profileId' in object && 'issuer' in object
}

function usePassword(
  object: any
): object is RegisterStudentWithPasswordPayload {
  return 'password' in object && object.password
}

function useResetToken(object: any): object is RegisterStudentWithPGPayload {
  return 'parentGuardianEmail' in object && object.parentGuardianEmail
}

function useParentGuardianEmail(
  object: any
): object is RegisterStudentWithPGPayload {
  return 'parentGuardianEmail' in object && object.parentGuardianEmail
}
