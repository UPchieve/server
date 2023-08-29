import { getClient, runInTransaction, TransactionClient } from '../db'
import {
  checkEmail,
  checkNames,
  createResetToken,
  hashPassword,
} from '../utils/auth-utils'
import { sendRosterStudentSetPasswordEmail } from './MailService'
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
import { GetStudentPartnerOrgResult } from '../models/StudentPartnerOrg'

export interface RosterStudentPayload {
  email: string
  firstName: string
  gradeLevel: string
  lastName: string
  password?: string
  proxyEmail?: string
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
  const failedUsers: {
    email: string
    firstName: string
    lastName: string
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
        const user = await createUser(userData, USER_ROLES.STUDENT, tc)

        const studentData = {
          userId: user.id,
          gradeLevel: parseInt(student.gradeLevel).toFixed(0) + 'th',
          partnerSite,
          schoolId,
          studentPartnerOrg: partnerKey,
        }
        await createStudent(studentData, tc)

        newUsers.push({ passwordResetToken, ...user })
      })
    } catch {
      failedUsers.push({
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName,
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

  return failedUsers
}

async function createUser(
  userData: UserRepo.CreateUserPayload,
  role: USER_ROLES_TYPE,
  tc: TransactionClient
) {
  const user = await UserRepo.createUser(userData, tc)
  // TODO: Should any of these be moved to the listener?
  await Promise.all([
    UserRepo.insertUserRoleByUserId(user.id, role, tc),
    createUSMByUserId(user.id, tc),
    createUPFByUserId(user.id, tc),
    createAccountAction(
      {
        action: ACCOUNT_USER_ACTIONS.CREATED,
        userId: user.id,
      },
      tc
    ),
  ])
  emitter.emit(USER_EVENTS.USER_CREATED, user.id)
  return user
}

async function createStudent(
  studentData: StudentRepo.CreateStudentProfilePayload,
  tc: TransactionClient
) {
  if (studentData.studentPartnerOrg) {
    const spo = await StudentPartnerOrgRepo.getStudentPartnerOrgByKey(
      tc,
      studentData.studentPartnerOrg,
      studentData.partnerSite
    )
    await addUserStudentPartnerOrgInstance(spo)
  }

  if (studentData.schoolId) {
    const spo = await StudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId(
      tc,
      studentData.schoolId
    )
    await addUserStudentPartnerOrgInstance(spo)
  }

  await StudentRepo.createStudentProfile(studentData, tc)
  emitter.emit(STUDENT_EVENTS.STUDENT_CREATED, studentData.userId)

  async function addUserStudentPartnerOrgInstance(
    spo?: GetStudentPartnerOrgResult
  ) {
    if (spo) {
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
}
