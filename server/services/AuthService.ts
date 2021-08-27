import { randomBytes } from 'crypto'
import { findKey } from 'lodash'
import validator from 'validator'

import mongoose from 'mongoose'
import UserModel from '../models/User'
import { StudentDocument } from '../models/Student'
import { VolunteerDocument } from '../models/Volunteer'
import SchoolModel, { School } from '../models/School'
import * as UserCtrl from '../controllers/UserCtrl'

import {
  volunteerPartnerManifests,
  studentPartnerManifests
} from '../partnerManifests'
import { IP_ADDRESS_STATUS } from '../constants'

import {
  asCredentialData,
  asStudentRegData,
  asPartnerStudentRegData,
  asVolunteerRegData,
  asPartnerVolunteerRegData,
  asResetConfirmData,
  RegistrationError,
  ResetError,
  checkPassword,
  checkPhone,
  hashPassword,
  getReferredBy
} from '../utils/auth-utils'
import { asString } from '../utils/type-utils'
import { NotAllowedError, InputError, LookupError } from '../models/Errors'
import { sessionStoreCollectionName } from '../router/api/session-store'
import logger from '../logger'
import * as VolunteerService from './VolunteerService'
import IpAddressService from './IpAddressService'
import MailService from './MailService'

// TODO: expose this in School repo
export const findByUpchieveId = async function(id: string): Promise<School> {
  return SchoolModel.findOne({ upchieveId: id })
    .lean()
    .exec()
}

async function checkIpAddress(ip: string): Promise<void> {
  const { country_code: countryCode } = await IpAddressService.getIpWhoIs(ip)

  if (countryCode && countryCode !== 'US') {
    throw new NotAllowedError(
      'Cannot register from an international IP address'
    )
  }
}

// Handlers
/**
 * In all the handlers below we do not wrap external service calls
 * in try/catch statements and let errors bubble up.
 * i.e. We only handle errors known by the Auth service
 * Other services should throw their own custom error types that'll get
 * caught by the generic error handler in the router
 */

// TODO: effective logging
// TODO: make registration functions return User instead of UserDocument types
// ^ once UserCtrl is refactored

// Registration handlers
// Handles /register/checkcred route
export async function checkCredential(data: unknown): Promise<boolean> {
  const { email, password } = asCredentialData(data)
  if (!email || !password)
    throw new InputError('Must supply an email and password for registration')

  if (!validator.isEmail(email))
    throw new RegistrationError('Must supply a valid email address')

  if (checkPassword(password)) {
    const users = await UserModel.find({ email: email })
      .lean()
      .exec()
    if (users.length === 0) {
      return true
    } else {
      throw new LookupError('The email address you entered is already in use')
    }
  }
}

// todo: remove upon merge of issue #764
// Handles /register/student route
export async function registerStudent(data: unknown): Promise<StudentDocument> {
  const {
    ip,
    email,
    password,
    highSchoolId: highSchoolUpchieveId,
    zipCode,
    terms,
    referredByCode,
    firstName,
    lastName
  } = asStudentRegData(data)
  const {
    studentPartnerOrg,
    partnerUserId,
    partnerSite,
    college
  } = asPartnerStudentRegData(data)

  await checkCredential({ email, password })
  await checkIpAddress(ip)

  if (!terms) {
    throw new RegistrationError('Must accept the user agreement')
  }

  // Student partner org check (if no high school or zip code provided)
  const isStudentPartnerSignup = !highSchoolUpchieveId && !zipCode
  if (isStudentPartnerSignup) {
    const studentPartnerManifest = studentPartnerManifests[studentPartnerOrg]
    if (!studentPartnerManifest) {
      throw new RegistrationError('Invalid student partner organization')
    }
  }

  const highSchoolProvided = !!highSchoolUpchieveId
  let school: School
  if (highSchoolProvided) school = await findByUpchieveId(highSchoolUpchieveId)

  const highSchoolApprovalRequired = !studentPartnerOrg && !zipCode
  if (highSchoolApprovalRequired) {
    if (!school || !school.isApproved)
      throw new RegistrationError(
        `School ${highSchoolUpchieveId} is not approved`
      )
  }

  const referredBy = await getReferredBy(referredByCode)

  const studentData = {
    firstname: firstName.trim(),
    lastname: lastName.trim(),
    email,
    zipCode,
    studentPartnerOrg,
    partnerUserId,
    partnerSite,
    approvedHighschool: school,
    college,
    isVolunteer: false,
    verified: false,
    referredBy,
    password,
    ipAddresses: [
      { createdAt: new Date(), ip, users: [], status: IP_ADDRESS_STATUS.OK }
    ]
  }

  const student = await UserCtrl.createStudent(studentData)
  return student
}

// Handles /register/student/open route
export async function registerOpenStudent(
  data: unknown
): Promise<StudentDocument> {
  const {
    ip,
    email,
    password,
    highSchoolId: highSchoolUpchieveId,
    zipCode,
    terms,
    referredByCode,
    firstName,
    lastName
  } = asStudentRegData(data)

  await checkCredential({ email, password })
  await checkIpAddress(ip)

  if (!terms) {
    throw new RegistrationError('Must accept the user agreement')
  }

  const highSchoolProvided = !!highSchoolUpchieveId
  let school: School
  if (highSchoolProvided) school = await findByUpchieveId(highSchoolUpchieveId)

  const highSchoolApprovalRequired = !zipCode
  if (highSchoolApprovalRequired) {
    if (!school || !school.isApproved)
      throw new RegistrationError(
        `School ${highSchoolUpchieveId} is not approved`
      )
  }

  const referredBy = await getReferredBy(referredByCode)

  const studentData = {
    firstname: firstName.trim(),
    lastname: lastName.trim(),
    email,
    zipCode,
    approvedHighschool: school,
    isVolunteer: false,
    verified: false,
    referredBy,
    password,
    ipAddresses: [
      { createdAt: new Date(), ip, users: [], status: IP_ADDRESS_STATUS.OK }
    ]
  }

  const student = await UserCtrl.createStudent(studentData)
  return student
}

// Handles /register/student/partner route
export async function registerPartnerStudent(
  data: unknown
): Promise<StudentDocument> {
  const {
    ip,
    email,
    password,
    studentPartnerOrg,
    partnerUserId,
    highSchoolId: highSchoolUpchieveId,
    zipCode,
    terms,
    referredByCode,
    firstName,
    lastName,
    college,
    partnerSite
  } = asPartnerStudentRegData(data)

  await checkCredential({ email, password })

  if (!terms) {
    throw new RegistrationError('Must accept the user agreement')
  }

  const studentPartnerManifest = studentPartnerManifests[studentPartnerOrg]
  if (!studentPartnerManifest) {
    throw new RegistrationError('Invalid student partner organization')
  }

  let school: School
  if (highSchoolUpchieveId)
    school = await findByUpchieveId(highSchoolUpchieveId)

  const referredBy = await getReferredBy(referredByCode)

  const studentData = {
    firstname: firstName.trim(),
    lastname: lastName.trim(),
    email,
    zipCode,
    studentPartnerOrg,
    partnerUserId,
    partnerSite,
    approvedHighschool: school,
    college,
    isVolunteer: false,
    verified: false,
    referredBy,
    password,
    ipAddresses: [
      { createdAt: new Date(), ip, users: [], status: IP_ADDRESS_STATUS.OK }
    ]
  }

  const student = await UserCtrl.createStudent(studentData)
  return student
}

// Handles /register/volunteer/open route
export async function registerVolunteer(
  data: unknown
): Promise<VolunteerDocument> {
  const {
    ip,
    email,
    password,
    phone,
    terms,
    referredByCode,
    firstName,
    lastName
  } = asVolunteerRegData(data)

  await checkCredential({ email, password })

  await checkPhone(phone)

  if (!terms) {
    throw new RegistrationError('Must accept the user agreement')
  }

  const referredBy = await getReferredBy(referredByCode)

  const volunteerData = {
    email,
    isVolunteer: true,
    isApproved: false,
    phone,
    firstname: firstName.trim(),
    lastname: lastName.trim(),
    verified: false,
    referredBy,
    password,
    ipAddresses: [
      { createdAt: new Date(), ip, users: [], status: IP_ADDRESS_STATUS.OK }
    ]
  }

  const volunteer = await UserCtrl.createVolunteer(volunteerData)
  VolunteerService.queueOnboardingReminderOneEmail(volunteer._id)

  return volunteer
}

// Handles /register/volunteer/partner route
export async function registerPartnerVolunteer(
  data: unknown
): Promise<VolunteerDocument> {
  const {
    ip,
    email,
    password,
    volunteerPartnerOrg,
    phone,
    terms,
    referredByCode,
    firstName,
    lastName
  } = asPartnerVolunteerRegData(data)
  await checkCredential({ email, password })

  await checkPhone(phone)

  if (!terms) {
    throw new RegistrationError('Must accept the user agreement')
  }

  const referredBy = await getReferredBy(referredByCode)

  // Volunteer partner org check
  const volunteerPartnerManifest =
    volunteerPartnerManifests[volunteerPartnerOrg]

  if (!volunteerPartnerManifest)
    throw new RegistrationError('Invalid volunteer partner organization')

  const volunteerPartnerDomains = volunteerPartnerManifest.requiredEmailDomains

  // Confirm email has one of volunteer partner's required domains
  if (volunteerPartnerDomains && volunteerPartnerDomains.length) {
    const userEmailDomain = email.split('@')[1]
    if (volunteerPartnerDomains.indexOf(userEmailDomain) === -1)
      throw new RegistrationError(
        'Invalid email domain for volunteer partner organization'
      )
  }

  const volunteerData = {
    email,
    isApproved: false,
    isVolunteer: true,
    volunteerPartnerOrg,
    phone,
    firstname: firstName.trim(),
    lastname: lastName.trim(),
    verified: false,
    referredBy,
    password,
    ip
  }

  const volunteer = await UserCtrl.createVolunteer(volunteerData)
  VolunteerService.queueOnboardingReminderOneEmail(volunteer._id)

  return volunteer
}

// Partner lookup handlers
// Handles /partner/volunteer route
export async function lookupPartnerVolunteer(data: unknown): Promise<string> {
  const volunteerPartnerId = asString(data)
  // If missing master manifest error will bubble up
  const partnerManifest = volunteerPartnerManifests[volunteerPartnerId]

  if (!partnerManifest)
    throw new LookupError(
      `No manifest found for volunteerPartnerId "${volunteerPartnerId}"`
    )

  return partnerManifest
}

// Handles /partner/student route
export async function lookupPartnerStudent(data: unknown): Promise<string> {
  const studentPartnerId = asString(data)
  // If missing master manifest error will bubble up
  const partnerManifest = studentPartnerManifests[studentPartnerId]

  if (!partnerManifest)
    throw new LookupError(
      `No manifest found for studentPartnerId "${studentPartnerId}"`
    )

  return partnerManifest
}

// Handles /partner/student/code route
export async function lookupPartnerStudentCode(data: unknown): Promise<string> {
  const partnerSignupCode = asString(data)
  const studentPartnerKey = findKey(studentPartnerManifests, {
    signupCode: partnerSignupCode.toUpperCase()
  })

  if (!studentPartnerKey)
    throw new LookupError(
      `No partner key found for partnerSignupCode "${partnerSignupCode}"`
    )

  return studentPartnerKey
}

interface PartnerOrg {
  key: string
  displayName: string
  sties: string[]
}

// Handles /partner/student-partners route (admin only)
export async function lookupStudentPartners(): Promise<PartnerOrg[]> {
  const partnerOrgs = []
  for (const [key, value] of Object.entries(studentPartnerManifests) as [
    string,
    any
  ]) {
    partnerOrgs.push({
      key,
      displayName: value.name ? value.name : key,
      sites: value.sites ? value.sites : null
    })
  }
  return partnerOrgs
}

// Handles /partner/volunteer-partners route (admin only)
export async function lookupVolunteerPartners(): Promise<PartnerOrg[]> {
  const partnerOrgs = []
  for (const [key, value] of Object.entries(volunteerPartnerManifests) as [
    string,
    any
  ]) {
    partnerOrgs.push({
      key,
      displayName: value.name ? value.name : key,
      sites: value.sites ? value.sites : null
    })
  }
  return partnerOrgs
}

// Password reset handlers
// Handles /reset/send route
export async function sendReset(data: unknown): Promise<void> {
  const email = asString(data)
  const user = await UserModel.findOne({ email })
  if (!user) throw new LookupError(`No account with ${email} found`)

  const buffer: Buffer = randomBytes(16)
  const token = buffer.toString('hex')
  user.passwordResetToken = token
  await user.save()

  await MailService.sendReset({ email, token })
}

export async function confirmReset(data: unknown): Promise<void> {
  const { email, password, token } = asResetConfirmData(data)
  // make sure token is a valid 16-byte hex string
  if (!token.match(/^[a-f0-9]{32}$/)) {
    // early exit
    throw new ResetError('Invalid password reset token')
  }

  const user = await UserModel.findOne({ passwordResetToken: token })

  if (!user)
    throw new LookupError('No account found with provided password reset token')

  // case match strings
  if (user.email !== email.toLowerCase())
    throw new ResetError('Email did not match the password reset token')

  checkPassword(password)

  user.passwordResetToken = undefined
  user.password = await hashPassword(password)
  await user.save()
}

export async function deleteAllUserSessions(userId: string) {
  try {
    await mongoose.connection.db
      .collection(sessionStoreCollectionName)
      .deleteMany({ $text: { $search: userId } })
  } catch (err) {
    logger.error(
      `Unable to invalidate all user sessions on password reset: ${err}`
    )
  }
}
