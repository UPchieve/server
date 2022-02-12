import { randomBytes } from 'crypto'
import { findKey } from 'lodash'
import validator from 'validator'

import mongoose from 'mongoose'
import {
  getUserByEmail,
  getUserByResetToken,
  updateUserResetTokenById,
  updateUserPasswordById,
  getUserIdByEmail,
} from '../models/User/queries'
import { Student } from '../models/Student'
import { Volunteer } from '../models/Volunteer'
import { School } from '../models/School'
import { findSchoolByUpchieveId } from '../models/School/queries'
import * as UserCtrl from '../controllers/UserCtrl'

import {
  VolunteerPartnerManifest,
  volunteerPartnerManifests,
  StudentPartnerManifest,
  studentPartnerManifests,
  SponsorOrgManifest,
  sponsorOrgManifests,
} from '../partnerManifests'

import {
  asCredentialData,
  asOpenStudentRegData,
  asPartnerStudentRegData,
  asVolunteerRegData,
  asPartnerVolunteerRegData,
  asResetConfirmData,
  RegistrationError,
  ResetError,
  checkPassword,
  checkPhone,
  hashPassword,
  getReferredBy,
  checkNames,
  checkEmail,
} from '../utils/auth-utils'
import { asString } from '../utils/type-utils'
import { NotAllowedError, InputError, LookupError } from '../models/Errors'
import { sessionStoreCollectionName } from '../router/api/session-store'
import logger from '../logger'
import * as VolunteerService from './VolunteerService'
import * as AnalyticsService from './AnalyticsService'
import { getIpWhoIs } from './IpAddressService'
import * as MailService from './MailService'
import { USER_ACTION } from '../constants'

async function checkIpAddress(ip: string): Promise<void> {
  const { country_code: countryCode } = await getIpWhoIs(ip)

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

// Registration handlers
// Handles /register/checkcred route
export async function checkCredential(data: unknown): Promise<boolean> {
  const { email, password } = asCredentialData(data)
  if (!email || !password)
    throw new InputError('Must supply an email and password for registration')

  if (!validator.isEmail(email))
    throw new RegistrationError('Must supply a valid email address')

  if (checkPassword(password)) {
    const user = await getUserIdByEmail(email)
    if (user) {
      throw new LookupError('The email address you entered is already in use')
    }
  }

  return true
}

// Handles /register/student/open route
export async function registerOpenStudent(data: unknown): Promise<Student> {
  const {
    ip,
    email,
    password,
    highSchoolId: highSchoolUpchieveId,
    zipCode,
    terms,
    referredByCode,
    firstName,
    lastName,
    currentGrade,
  } = asOpenStudentRegData(data)

  await Promise.all([
    checkCredential({ email, password }),
    checkIpAddress(ip),
    checkNames(firstName, lastName),
    checkEmail(email),
  ])

  if (!terms) {
    throw new RegistrationError('Must accept the user agreement')
  }

  const highSchoolProvided = !!highSchoolUpchieveId
  let school: School | undefined
  if (highSchoolProvided)
    school = await findSchoolByUpchieveId(highSchoolUpchieveId)

  const highSchoolApprovalRequired = !zipCode
  if (highSchoolApprovalRequired) {
    if (!school || !school.isApproved)
      throw new RegistrationError(
        `School ${highSchoolUpchieveId} is not approved`
      )
  }

  let referredBy: mongoose.Types.ObjectId | undefined
  if (referredByCode) referredBy = await getReferredBy(referredByCode)

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
    currentGrade,
  }

  const student = await UserCtrl.createStudent(studentData, ip)
  return student
}

// Handles /register/student/partner route
export async function registerPartnerStudent(data: unknown): Promise<Student> {
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
    partnerSite,
  } = asPartnerStudentRegData(data)

  await Promise.all([
    checkCredential({ email, password }),
    checkNames(firstName, lastName),
    checkEmail(email),
  ])

  if (!terms) {
    throw new RegistrationError('Must accept the user agreement')
  }

  const studentPartnerManifest = studentPartnerManifests[studentPartnerOrg]
  if (!studentPartnerManifest) {
    throw new RegistrationError('Invalid student partner organization')
  }

  let school: School | undefined
  if (highSchoolUpchieveId)
    school = await findSchoolByUpchieveId(highSchoolUpchieveId)

  let referredBy: mongoose.Types.ObjectId | undefined
  if (referredByCode) referredBy = await getReferredBy(referredByCode)

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
  }

  // borrowed from TwilioService.getAssociatedPartner
  // if (
  //   school &&
  //   sponsorOrgManifests[studentPartnerOrg] &&
  //   Array.isArray(sponsorOrgManifests[studentPartnerOrg].schools) &&
  //   sponsorOrgManifests[studentPartnerOrg].schools.some(school =>
  //     school.equals(school)
  //   )
  // )
 // AnalyticsService.captureEvent(, USER_ACTION.ACCOUNT.UPDATED_PROFILE, studentData)

  const student = await UserCtrl.createStudent(studentData, ip)
  return student
}

// Handles /register/volunteer/open route
export async function registerVolunteer(data: unknown): Promise<Volunteer> {
  const {
    ip,
    email,
    password,
    phone,
    terms,
    referredByCode,
    firstName,
    lastName,
  } = asVolunteerRegData(data)

  await Promise.all([
    checkCredential({ email, password }),
    checkNames(firstName, lastName),
    checkPhone(phone),
    checkEmail(email),
  ])

  if (!terms) {
    throw new RegistrationError('Must accept the user agreement')
  }

  let referredBy: mongoose.Types.ObjectId | undefined
  if (referredByCode) referredBy = await getReferredBy(referredByCode)

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
  }

  const volunteer = await UserCtrl.createVolunteer(volunteerData, ip)
  VolunteerService.queueOnboardingReminderOneEmail(volunteer._id)

  return volunteer
}

// Handles /register/volunteer/partner route
export async function registerPartnerVolunteer(
  data: unknown
): Promise<Volunteer> {
  const {
    ip,
    email,
    password,
    volunteerPartnerOrg,
    phone,
    terms,
    referredByCode,
    firstName,
    lastName,
  } = asPartnerVolunteerRegData(data)
  await Promise.all([
    checkCredential({ email, password }),
    checkNames(firstName, lastName),
    checkPhone(phone),
    checkEmail(email),
  ])

  if (!terms) {
    throw new RegistrationError('Must accept the user agreement')
  }

  let referredBy: mongoose.Types.ObjectId | undefined
  if (referredByCode) referredBy = await getReferredBy(referredByCode)

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
  }

  const volunteer = await UserCtrl.createVolunteer(volunteerData, ip)
  VolunteerService.queueOnboardingReminderOneEmail(volunteer._id)

  return volunteer
}

// Partner lookup handlers
// Handles /partner/volunteer route
export async function lookupPartnerVolunteer(
  data: unknown
): Promise<VolunteerPartnerManifest> {
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
export async function lookupPartnerStudent(
  data: unknown
): Promise<StudentPartnerManifest> {
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
    signupCode: partnerSignupCode.toUpperCase(),
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
  sties?: string[]
}

// Handles /partner/student-partners route (admin only)
export async function lookupStudentPartners(): Promise<PartnerOrg[]> {
  const partnerOrgs = []
  for (const [key, value] of Object.entries(studentPartnerManifests) as [
    string,
    StudentPartnerManifest
  ][]) {
    partnerOrgs.push({
      key,
      displayName: value.name ? value.name : key,
      sites: value.sites ? value.sites : undefined,
    })
  }
  return partnerOrgs
}

// Handles /partner/volunteer-partners route (admin only)
export async function lookupVolunteerPartners(): Promise<PartnerOrg[]> {
  const partnerOrgs = []
  for (const [key, value] of Object.entries(volunteerPartnerManifests) as [
    string,
    VolunteerPartnerManifest
  ][]) {
    partnerOrgs.push({
      key,
      displayName: value.name ? value.name : key,
    })
  }
  return partnerOrgs
}

// Handles /partner/sponsor-orgs route (admin only)
export async function lookupSponsorOrgs(): Promise<PartnerOrg[]> {
  const sponsorOrgs = []
  for (const [key, value] of Object.entries(sponsorOrgManifests) as [
    string,
    SponsorOrgManifest
  ][]) {
    sponsorOrgs.push({
      key,
      displayName: value.name ? value.name : key,
    })
  }
  return sponsorOrgs
}

// Password reset handlers
// Handles /reset/send route
export async function sendReset(data: unknown): Promise<void> {
  const email = asString(data)
  const user = await getUserByEmail(email)
  if (!user) throw new LookupError(`No account with ${email} found`)

  const buffer: Buffer = randomBytes(16)
  const token = buffer.toString('hex')
  await updateUserResetTokenById(user._id, token)

  await MailService.sendReset(email, token)
}

export async function confirmReset(data: unknown): Promise<void> {
  const { email, password, token } = asResetConfirmData(data)
  // make sure token is a valid 16-byte hex string
  if (!token.match(/^[a-f0-9]{32}$/)) {
    // early exit
    throw new ResetError('Invalid password reset token')
  }

  const user = await getUserByResetToken(token)

  if (!user)
    throw new LookupError('No account found with provided password reset token')

  // case match strings
  if (user.email !== email.toLowerCase())
    throw new ResetError('Email did not match the password reset token')

  checkPassword(password)

  await updateUserPasswordById(user._id, await hashPassword(password))
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
