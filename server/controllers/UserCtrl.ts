import { Types } from 'mongoose'
import { captureException } from '@sentry/node'
import base64url from 'base64url'
import { getUserByReferralCode } from '../models/User/queries'
import StudentModel, { Student } from '../models/Student'
import VolunteerModel, { Certifications, Volunteer } from '../models/Volunteer'
import { createContact } from '../services/MailService'
import { createUSMByUserId } from '../models/UserSessionMetrics/queries'
import { createUPFByUserId } from '../models/UserProductFlags/queries'
import { AccountActionCreator } from './UserActionCtrl'
import { createSnapshotByVolunteerId } from '../models/Availability/queries'
import { hashPassword } from '../utils/auth-utils'

function generateReferralCode(userId: Types.ObjectId) {
  return base64url(Buffer.from(userId.toString(), 'hex'))
}

export async function checkReferral(
  referredByCode: string
): Promise<Types.ObjectId | undefined> {
  if (referredByCode) {
    try {
      const user = await getUserByReferralCode(referredByCode)
      if (user) return user._id
    } catch (error) {
      captureException(error)
    }
  }
}

// TODO: duck type validation - studentData payload
export async function createStudent(
  studentData: Partial<Student> & Pick<Student, 'email' | 'password'>,
  ip: string
): Promise<Student> {
  studentData.password = await hashPassword(studentData.password)
  // TODO: repo pattern
  const student = new StudentModel(studentData)
  student.referralCode = generateReferralCode(student._id)

  await student.save()

  // Create a USM object for this new user
  try {
    await createUSMByUserId(student._id)
  } catch (err) {
    captureException(err)
  }

  // Create a UPF object for this new user
  try {
    await createUPFByUserId(student._id)
  } catch (err) {
    captureException(err)
  }

  try {
    await new AccountActionCreator(student._id, ip).createdAccount()
  } catch (err) {
    captureException(err)
  }

  try {
    await createContact(student)
  } catch (err) {
    captureException(err)
  }

  return student.toObject()
}

// TODO: duck type validation - volunteerData payload
export async function createVolunteer(
  volunteerData: Partial<Volunteer> & Pick<Volunteer, 'email' | 'password'>,
  ip: string
): Promise<Volunteer> {
  volunteerData.password = await hashPassword(volunteerData.password)
  // TODO: repo pattern
  const volunteer = new VolunteerModel(volunteerData)
  volunteer.referralCode = generateReferralCode(volunteer.id)

  await Promise.all([
    volunteer.save(),
    createSnapshotByVolunteerId(volunteer._id),
  ])

  // Create a USM object for this new user
  try {
    await createUSMByUserId(volunteer._id)
  } catch (err) {
    captureException(err)
  }

  // Create a UPF object for this new user
  try {
    await createUPFByUserId(volunteer._id)
  } catch (err) {
    captureException(err)
  }

  try {
    await new AccountActionCreator(volunteer._id, ip).createdAccount()
  } catch (err) {
    captureException(err)
  }

  try {
    await createContact(volunteer)
  } catch (err) {
    captureException(err)
  }

  return volunteer.toObject()
}

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
