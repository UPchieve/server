import { captureException } from '@sentry/node'
import base64url from 'base64url'
import { DeleteWriteOpResultObject } from 'mongodb'
import User from '../models/User'
import Student, { StudentDocument } from '../models/Student'
import Volunteer, {
  Certifications,
  VolunteerDocument
} from '../models/Volunteer'
import { createContact } from '../services/MailService'
import { createByUserId } from '../models/UserSessionMetrics'
import { AccountActionCreator } from './UserActionCtrl'

const {
  createAvailabilitySnapshot
} = require('../services/AvailabilityService')

const generateReferralCode = userId => base64url(Buffer.from(userId, 'hex'))

export function deleteUserByEmail(
  userEmail: string
): Promise<DeleteWriteOpResultObject['result'] & { deletedCount?: number }> {
  return User.deleteOne({ email: userEmail }).exec()
}

export async function checkReferral(referredByCode: string): Promise<string> {
  let referredById

  if (referredByCode) {
    try {
      const referredBy = await User.findOne({ referralCode: referredByCode })
        .select('_id')
        .lean()
        .exec()

      referredById = referredBy._id
    } catch (error) {
      captureException(error)
    }
  }

  return referredById
}

export async function createStudent(
  studentData: Partial<StudentDocument>
): Promise<StudentDocument> {
  const { password, ipAddresses } = studentData
  const ip = ipAddresses && ipAddresses[0] && ipAddresses[0].ip
  studentData.ipAddresses = []
  const student = new Student(studentData)
  student.referralCode = generateReferralCode(student.id)

  try {
    student.password = await student.hashPassword(password)
    await student.save()
  } catch (error) {
    throw new Error(error)
  }

  // Create a USM object for this new user
  try {
    await createByUserId(student._id)
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

  return student
}

export async function createVolunteer(
  volunteerData: Partial<VolunteerDocument>
): Promise<VolunteerDocument> {
  const { password, ipAddresses } = volunteerData
  const ip = ipAddresses && ipAddresses[0] && ipAddresses[0].ip
  volunteerData.ipAddresses = []
  const volunteer = new Volunteer(volunteerData)
  volunteer.referralCode = generateReferralCode(volunteer.id)

  try {
    volunteer.password = await volunteer.hashPassword(password)
    await Promise.all([
      volunteer.save(),
      createAvailabilitySnapshot(volunteer._id)
    ])
  } catch (error) {
    throw new Error(error)
  }

  // Create a USM object for this new user
  try {
    await createByUserId(volunteer._id)
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

  return volunteer
}

export function isCertified(certifications: Certifications): boolean {
  let isCertified = false

  for (const subject in certifications) {
    if (
      Object.prototype.hasOwnProperty.call(certifications, subject) &&
      certifications[subject].passed
    ) {
      isCertified = true
      break
    }
  }

  return isCertified
}
