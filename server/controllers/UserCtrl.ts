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
import { AccountActionCreator } from './UserActionCtrl'
import { Types } from 'mongoose'

import {
  createAvailabilitySnapshot
} from '../services/AvailabilityService'
import IpAddressModel, { IpAddress } from '../models/IpAddress'

const generateReferralCode = (userId: string) => base64url(Buffer.from(userId, 'hex'))

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

      if (referredBy === null) {
        throw new Error('user was not referred by anyone')
      }
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

  let ip: string
  if (ipAddresses instanceof Types.ObjectId) {
    const ipAddress = await IpAddressModel.findOne({ _id: ipAddresses })
    ipAddress? ip = ipAddress.ip : ip = '0.0.0.0/0'
  } else if (ipAddresses && (ipAddresses as IpAddress[]).length > 0) {
    ip = (ipAddresses as IpAddress[])[0].ip
  } else {
    ip = '0.0.0.0/0'
  }

  studentData.ipAddresses = []
  const student = new Student(studentData)
  student.referralCode = generateReferralCode(student.id)

  try {
    student.password = student.hashPassword!(password!)
    await student.save()
  } catch (error) {
    throw new Error(error)
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

  let ip: string
  if (ipAddresses instanceof Types.ObjectId) {
    const ipAddress = await IpAddressModel.findOne({ _id: ipAddresses })
    ipAddress? ip = ipAddress.ip : ip = '0.0.0.0/0'
  } else if (ipAddresses && (ipAddresses as IpAddress[]).length > 0) {
    ip = (ipAddresses as IpAddress[])[0].ip
  } else {
    ip = '0.0.0.0/0'
  }

  volunteerData.ipAddresses = []
  const volunteer = new Volunteer(volunteerData)
  volunteer.referralCode = generateReferralCode(volunteer.id)

  try {
    volunteer.password = volunteer.hashPassword!(password!)
    await Promise.all([
      volunteer.save(),
      createAvailabilitySnapshot(volunteer._id)
    ])
  } catch (error) {
    throw new Error(error)
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
      (certifications as Record<string, any>)[subject].passed
    ) {
      isCertified = true
      break
    }
  }

  return isCertified
}
