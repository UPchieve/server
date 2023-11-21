import validator from 'validator'

import {
  getUserForPassport,
  getUserContactInfoByResetToken,
  updateUserResetTokenById,
  updateUserPasswordById,
  getUserIdByEmail,
} from '../models/User/queries'
import * as StudentRepo from '../models/Student'
import * as VolunteerRepo from '../models/Volunteer'
import * as FederatedCredentialRepo from '../models/FederatedCredential'
import { School } from '../models/School'
import { getSchoolById } from '../models/School/queries'
import * as UserCtrl from '../controllers/UserCtrl'
import {
  getVolunteerPartnerOrgForRegistrationByKey,
  getVolunteerPartnerOrgs,
  getFullVolunteerPartnerOrgByKey,
  VolunteerPartnerOrg,
  VolunteerPartnerOrgForRegistration,
} from '../models/VolunteerPartnerOrg'
import {
  getStudentPartnerOrgForRegistrationByKey,
  getStudentPartnerOrgs,
  getFullStudentPartnerOrgByKey,
  StudentPartnerOrgForRegistration,
  StudentPartnerOrg,
  getStudentPartnerOrgKeyByCode,
} from '../models/StudentPartnerOrg'
import { SponsorOrg, getSponsorOrgs } from '../models/SponsorOrg'

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
  createResetToken,
} from '../utils/auth-utils'
import { asString } from '../utils/type-utils'
import { NotAllowedError, InputError, LookupError } from '../models/Errors'
import logger from '../logger'
import * as VolunteerService from './VolunteerService'
import { getIpWhoIs } from './IpAddressService'
import * as MailService from './MailService'
import { Ulid } from '../models/pgUtils'
import * as AuthRepo from '../models/Auth'
import config from '../config'
import { FederatedCredential } from '../models/FederatedCredential'
import { verifyEligibility } from './EligibilityService'

export async function checkIpAddress(ip: string): Promise<void> {
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

  checkPassword(password)
  await checkUser(email)

  return true
}

export async function checkUser(email: string) {
  const user = await getUserIdByEmail(email)
  if (user) {
    throw new LookupError('The email address you entered is already in use')
  }
}

// Handles /register/student/open route
export async function registerOpenStudent(
  data: unknown
): Promise<StudentRepo.CreatedStudent> {
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
    signupSourceId,
    otherSignupSource,
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

  if (!(await verifyEligibility(zipCode, highSchoolUpchieveId))) {
    throw new RegistrationError('Not eligible.')
  }

  const referredBy = await getReferredBy(referredByCode)

  const studentData = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email,
    zipCode,
    approvedHighschool: highSchoolUpchieveId,
    referredBy,
    password,
    currentGrade,
    signupSourceId,
    otherSignupSource,
  }

  const student = await UserCtrl.createStudentWithPassword(studentData, ip)
  return student
}

// Handles /register/student/partner route
export async function registerPartnerStudent(
  data: unknown
): Promise<StudentRepo.CreatedStudent> {
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
    currentGrade,
    signupSourceId,
    otherSignupSource,
  } = asPartnerStudentRegData(data)

  await Promise.all([
    checkCredential({ email, password }),
    checkNames(firstName, lastName),
    checkEmail(email),
  ])

  if (!terms) {
    throw new RegistrationError('Must accept the user agreement')
  }

  let studentPartnerManifest: StudentPartnerOrgForRegistration
  try {
    studentPartnerManifest = await getStudentPartnerOrgForRegistrationByKey(
      studentPartnerOrg
    )
  } catch (err) {
    throw new RegistrationError('Invalid student partner organization')
  }

  let school: School | undefined
  if (highSchoolUpchieveId) {
    school = await getSchoolById(highSchoolUpchieveId)
  } else if (studentPartnerManifest.schoolSignupRequired && !college) {
    throw new RegistrationError(
      'Student partner organization requires school, but none provided'
    )
  }

  let referredBy: Ulid | undefined
  if (referredByCode) referredBy = await getReferredBy(referredByCode)

  const studentData = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email,
    zipCode,
    studentPartnerOrg,
    partnerUserId,
    partnerSite,
    approvedHighschool: school?.id,
    college,
    isVolunteer: false,
    verified: false,
    referredBy,
    password,
    currentGrade,
    signupSourceId:
      studentPartnerOrg === config.customManualStudentPartnerOrg
        ? signupSourceId
        : undefined,
    otherSignupSource:
      studentPartnerOrg === config.customManualStudentPartnerOrg
        ? otherSignupSource
        : undefined,
  }

  const student = await UserCtrl.createStudentWithPassword(studentData, ip)
  return student
}

// Handles /register/volunteer/open route
export async function registerVolunteer(
  data: unknown
): Promise<VolunteerRepo.CreatedVolunteer> {
  const {
    ip,
    email,
    password,
    phone,
    terms,
    referredByCode,
    firstName,
    lastName,
    timezone,
    signupSourceId,
    otherSignupSource,
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

  let referredBy: Ulid | undefined
  if (referredByCode) referredBy = await getReferredBy(referredByCode)

  const volunteerData = {
    email,
    phone,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    referredBy,
    password,
    timezone,
    volunteerPartnerOrg: undefined,
    signupSourceId,
    otherSignupSource,
  }

  const volunteer = await UserCtrl.createVolunteer(volunteerData, ip)
  VolunteerService.queueOnboardingReminderOneEmail(volunteer.id)

  return volunteer
}

// Handles /register/volunteer/partner route
export async function registerPartnerVolunteer(
  data: unknown
): Promise<VolunteerRepo.CreatedVolunteer> {
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
    timezone,
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

  let referredBy: Ulid | undefined
  if (referredByCode) referredBy = await getReferredBy(referredByCode)

  // Volunteer partner org check
  let volunteerPartnerManifest: VolunteerPartnerOrgForRegistration
  try {
    volunteerPartnerManifest = await getVolunteerPartnerOrgForRegistrationByKey(
      volunteerPartnerOrg
    )
  } catch (err) {
    throw new RegistrationError('Invalid volunteer partner organization')
  }

  const volunteerPartnerDomains = volunteerPartnerManifest.domains

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
    volunteerPartnerOrg,
    phone,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    verified: false,
    referredBy,
    password,
    timezone,
  }

  const volunteer = await UserCtrl.createVolunteer(volunteerData, ip)
  VolunteerService.queueOnboardingReminderOneEmail(volunteer.id)

  return volunteer
}

// Partner lookup handlers
// Handles /partner/volunteer route
export async function lookupPartnerVolunteer(
  data: unknown
): Promise<VolunteerPartnerOrg> {
  const volunteerPartnerKey = asString(data)
  // If missing master manifest error will bubble up
  let partnerOrg: VolunteerPartnerOrg
  try {
    partnerOrg = await getFullVolunteerPartnerOrgByKey(volunteerPartnerKey)
  } catch (err) {
    throw new LookupError(
      `No manifest found for volunteerPartnerId "${volunteerPartnerKey}"`
    )
  }

  return partnerOrg
}

// Handles /partner/student route
export async function lookupPartnerStudent(
  data: unknown
): Promise<StudentPartnerOrg> {
  const studentPartnerKey = asString(data)
  // If missing master manifest error will bubble up
  let partnerOrg: StudentPartnerOrg
  try {
    partnerOrg = await getFullStudentPartnerOrgByKey(studentPartnerKey)
  } catch (err) {
    throw new LookupError(
      `No manifest found for studentPartnerId "${studentPartnerKey}"`
    )
  }

  return partnerOrg
}

// Handles /partner/student/code route
export async function lookupPartnerStudentCode(data: unknown): Promise<string> {
  const partnerSignupCode = asString(data)
  const studentPartnerKey = getStudentPartnerOrgKeyByCode(
    partnerSignupCode.toUpperCase()
  )

  if (!studentPartnerKey)
    throw new LookupError(
      `no partner key found for partnerSignupCode "${partnerSignupCode}"`
    )

  return studentPartnerKey
}

// Handles /partner/student-partners route (admin only)
export async function lookupStudentPartners(): Promise<StudentPartnerOrg[]> {
  const partnerOrgs = await getStudentPartnerOrgs()
  return partnerOrgs
}

// Handles /partner/volunteer-partners route (admin only)
export async function lookupVolunteerPartners(): Promise<
  VolunteerPartnerOrg[]
> {
  const partnerOrgs = await getVolunteerPartnerOrgs()
  return partnerOrgs
}

// Handles /partner/sponsor-orgs route (admin only)
export async function lookupSponsorOrgs(): Promise<SponsorOrg[]> {
  const sponsorOrgs = await getSponsorOrgs()
  return sponsorOrgs
}

// Password reset handlers
// Handles /reset/send route
export async function sendReset(email: unknown): Promise<void> {
  const userEmail = asString(email)
  const user = await getUserForPassport(userEmail)
  if (!user) throw new LookupError(`No account with ${userEmail} found`)

  const token = createResetToken()
  await updateUserResetTokenById(user.id, token)

  const toEmail = user.proxyEmail ?? user.email
  await MailService.sendReset(toEmail, token)
}

export async function confirmReset(data: unknown): Promise<void> {
  const {
    email,
    password,
    newpassword: reenteredPassword,
    token,
  } = asResetConfirmData(data)
  // make sure token is a valid 16-byte hex string
  if (!token.match(/^[a-f0-9]{32}$/)) {
    // early exit
    throw new ResetError('Invalid password reset token')
  }

  if (password !== reenteredPassword)
    throw new ResetError('The passwords you entered do not match')

  const user = await getUserContactInfoByResetToken(token)

  if (!user)
    throw new LookupError('No account found with provided password reset token')

  // case match strings
  if (user.email.toLowerCase() !== email.toLowerCase())
    throw new ResetError('Email did not match the password reset token')

  checkPassword(password)

  await updateUserPasswordById(user.id, await hashPassword(password))
}

export async function deleteAllUserSessions(userId: string) {
  try {
    await AuthRepo.deleteAuthSessionsByUserId(userId)
  } catch (err) {
    logger.error(
      `Unable to invalidate all user sessions on password reset: ${err}`
    )
  }
}

export async function getFederatedCredential(
  id: string,
  issuer: string
): Promise<FederatedCredential | undefined> {
  try {
    return FederatedCredentialRepo.getFederatedCredential(id, issuer)
  } catch (err) {
    logger.error(`Failed to get federated credential.`)
  }
}
