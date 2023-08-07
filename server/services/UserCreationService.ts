import { runInTransaction, TransactionClient } from '../db'
import {
  checkEmail,
  checkNames,
  checkPassword,
  createResetToken,
  hashPassword,
} from '../utils/auth-utils'
import { createContact, sendRosterStudentSetPasswordEmail } from './MailService'
import * as UserRepo from '../models/User'
import * as StudentRepo from '../models/Student'
import * as StudentPartnerOrgRepo from '../models/StudentPartnerOrg'
import { createUSMByUserId } from '../models/UserSessionMetrics'
import { createUPFByUserId } from '../models/UserProductFlags'
import { createAccountAction } from '../models/UserAction'
import * as SignUpSourceRepo from '../models/SignUpSource'
import { ACCOUNT_USER_ACTIONS, USER_ROLES_TYPE } from '../constants/user'
import { STUDENT_EVENTS, USER_ROLES } from '../constants'
import { emitter } from './EventsService'

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

  await runInTransaction(async (tc: TransactionClient) => {
    const signUpSource = await SignUpSourceRepo.getSignUpSourceByName('Roster', tc)

    for (const student of students) {
      checkNames(student.firstName, student.lastName)
      checkEmail(student.email)
      if (student.proxyEmail) checkEmail(student.proxyEmail)
      if (student.password) {
        checkPassword(student.password)
        student.password = await hashPassword(student.password)
      }

      const passwordResetToken = !student.password ? createResetToken() : undefined
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
      newUsers.push({ passwordResetToken, ...user })

      const studentData = {
        userId: user.id,
        gradeLevel: student.gradeLevel,
        partnerSite,
        schoolId,
        studentPartnerOrg: partnerKey,
      }
      await createStudent(studentData, tc)
    }
  })

  for (const user of newUsers) {
    await createContact(user.id)
    if (user.passwordResetToken) {
      await sendRosterStudentSetPasswordEmail(
        user.proxyEmail ?? user.email,
        user.firstName,
        user.passwordResetToken
      )
    }
  }
}

async function createUser(
  userData: UserRepo.CreateUserPayload,
  role: USER_ROLES_TYPE,
  tc: TransactionClient
) {
  const user = await UserRepo.createUser(userData, tc)
  await UserRepo.insertUserRoleByUserId(user.id, role, tc)
  await createUSMByUserId(user.id, tc)
  await createUPFByUserId(user.id, tc)
  await createAccountAction(
    {
      action: ACCOUNT_USER_ACTIONS.CREATED,
      userId: user.id,
    },
    tc
  )
  return user
}

async function createStudent(
  studentData: StudentRepo.CreateStudentProfilePayload,
  tc: TransactionClient
) {
  await Promise.all([
    StudentRepo.createStudentProfile(studentData, tc),
    addUserStudentPartnerOrgInstance(),
  ])
  emitter.emit(STUDENT_EVENTS.STUDENT_CREATED, studentData.userId)

  async function addUserStudentPartnerOrgInstance() {
    let partnerOrg

    if (studentData.studentPartnerOrg) {
      partnerOrg = await StudentPartnerOrgRepo.getStudentPartnerOrgByKey(
        tc,
        studentData.studentPartnerOrg,
        studentData.partnerSite
      )
    } else if (studentData.schoolId) {
      partnerOrg = await StudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId(
        tc,
        studentData.schoolId
      )
    }

    if (partnerOrg) {
      return StudentPartnerOrgRepo.createUserStudentPartnerOrgInstance(
        {
          userId: studentData.userId,
          studentPartnerOrgId: partnerOrg.partnerId,
          studentPartnerOrgSiteId: partnerOrg.siteId,
        },
        tc
      )
    }
  }
}
