import { Ulid } from '../models/pgUtils'
import { captureException } from '@sentry/node'
import * as USMRepo from '../models/UserSessionMetrics'
import * as UPFRepo from '../models/UserProductFlags'
import * as UserRepo from '../models/User'
import * as StudentRepo from '../models/Student'
import * as VolunteerRepo from '../models/Volunteer'
import * as UserActionRepo from '../models/UserAction'
import * as FederatedCredentialRepo from '../models/FederatedCredential'
import { Certifications } from '../models/Volunteer'
import { createContact } from '../services/MailService'
import { hashPassword } from '../utils/auth-utils'
import { emitter } from '../services/EventsService'
import { ACCOUNT_USER_ACTIONS, STUDENT_EVENTS } from '../constants'

export async function checkReferral(
  referredByCode: string | undefined
): Promise<Ulid | undefined> {
  if (referredByCode) {
    try {
      const user = await UserRepo.getUserContactInfoByReferralCode(
        referredByCode
      )
      if (user) return user.id
    } catch (error) {
      captureException(error)
    }
  }
}

export async function createStudentWithPassword(
  studentData: StudentRepo.CreateStudentWithPasswordPayload,
  ip: string
) {
  studentData.password = await hashPassword(studentData.password)
  return createStudent(studentData, ip)
}

export async function createStudentWithFederatedCredential(
  studentData: StudentRepo.CreateStudentWithFedCredPayload,
  profileId: string,
  issuer: string,
  ip?: string
) {
  const student = await createStudent(studentData, ip)
  await FederatedCredentialRepo.insertFederatedCredential(
    profileId,
    issuer,
    student.id
  )
  return student
}

// TODO: duck type validation - studentData payload
async function createStudent(
  studentData: StudentRepo.CreateStudentPayload,
  ip?: string
): Promise<StudentRepo.CreatedStudent> {
  const student = await StudentRepo.createStudent(studentData)

  // Create a USM object for this new user
  try {
    await USMRepo.createUSMByUserId(student.id)
  } catch (err) {
    captureException(err)
  }

  // Create a UPF object for this new user
  try {
    await UPFRepo.createUPFByUserId(student.id)
  } catch (err) {
    captureException(err)
  }

  try {
    await UserActionRepo.createAccountAction({
      action: ACCOUNT_USER_ACTIONS.CREATED,
      userId: student.id,
      ipAddress: ip,
    })
  } catch (err) {
    captureException(err)
  }

  try {
    await createContact(student.id)
  } catch (err) {
    captureException(err)
  }

  emitter.emit(STUDENT_EVENTS.STUDENT_CREATED, student.id)

  return student
}

// TODO: duck type validation - volunteerData payload
export async function createVolunteer(
  volunteerData: VolunteerRepo.CreateVolunteerPayload,
  ip: string
): Promise<VolunteerRepo.CreatedVolunteer> {
  volunteerData.password = await hashPassword(volunteerData.password)
  // Replaced by VolunteerRepo.createVolunteer
  const volunteer = await VolunteerRepo.createVolunteer(volunteerData)

  // Create a USM object for this new user
  try {
    await USMRepo.createUSMByUserId(volunteer.id)
  } catch (err) {
    captureException(err)
  }

  // Create a UPF object for this new user
  try {
    await UPFRepo.createUPFByUserId(volunteer.id)
  } catch (err) {
    captureException(err)
  }

  try {
    await UserActionRepo.createAccountAction({
      action: ACCOUNT_USER_ACTIONS.CREATED,
      userId: volunteer.id,
      ipAddress: ip,
    })
  } catch (err) {
    captureException(err)
  }

  try {
    // needs id, firstname, lastname, email, isvolunteer, banned, testuser, admin, deactivated, createdat
    await createContact(volunteer.id)
  } catch (err) {
    captureException(err)
  }

  // needs to return id and partner org for frontend
  return volunteer
}

// TODO: I think we can nuke this pending reportutils finalization
export function isCertified(certifications: Certifications): boolean {
  let isCertified = false

  for (const subject in certifications) {
    if (
      Object.prototype.hasOwnProperty.call(certifications, subject) &&
      certifications[subject as keyof Certifications].passed
    ) {
      isCertified = true
      break
    }
  }

  return isCertified
}
