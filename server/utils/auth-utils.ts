import { randomBytes } from 'crypto'
import bcrypt from 'bcrypt'
import { CustomError } from 'ts-custom-error'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
const GoogleStrategy = require('passport-google-oidc')
import { Ulid } from '../models/pgUtils'
import { Request, Response, NextFunction } from 'express'
import config from '../config'
import {
  getUserContactInfoById,
  getUserForPassport,
  getUserIdByEmail,
  getUserIdByPhone,
} from '../models/User/queries'
import { checkReferral } from '../controllers/UserCtrl'
import { captureEvent } from '../services/AnalyticsService'
import { EVENTS, GRADES } from '../constants'

import {
  InputError,
  LookupError,
  LowRecaptchaScoreError,
  MissingRecaptchaTokenError,
} from '../models/Errors'
import isValidInternationalPhoneNumber from './is-valid-international-phone-number'
import {
  asString,
  asBoolean,
  asFactory,
  asOptional,
  asEnum,
  asNumber,
} from './type-utils'
import validator from 'validator'
import session from 'express-session'
import { getFederatedCredential } from '../models/FederatedCredential/queries'
import {
  registerStudent,
  createPartnerStudent,
} from '../services/UserCreationService'
import { validateRequestRecaptcha } from '../services/RecaptchaService'

// Custom errors
export class RegistrationError extends CustomError {}
export class ResetError extends CustomError {}

// Function signature interfaces
export interface CredentialData {
  email: string
  password: string
}
export const asCredentialData = asFactory<CredentialData>({
  email: asString,
  password: asString,
})

export interface SessionWithStudentData extends session.Session {
  studentData?: StudentDataParams
}
export interface StudentDataParams {
  email?: string
  highSchoolId?: string
  zipCode?: string
  currentGrade?: string
  referredByCode?: string | undefined
  ip?: string
  studentPartnerOrg?: string
}

export interface RegisterStudentPayload {
  college?: string
  email: string
  firstName: string
  gradeLevel?: string
  ip?: string
  issuer?: string
  lastName: string
  password?: string
  parentGuardianEmail?: string
  profileId?: string
  referredByCode?: string
  schoolId?: string
  studentPartnerOrg?: string
  studentPartnerSite?: string
  zipCode?: string
}
export const registerStudentValidator = asFactory<RegisterStudentPayload>({
  college: asOptional(asString),
  email: asString,
  firstName: asString,
  gradeLevel: asOptional(asEnum(GRADES)),
  ip: asOptional(asString),
  issuer: asOptional(asString),
  lastName: asString,
  password: asOptional(asString),
  parentGuardianEmail: asOptional(asString),
  profileId: asOptional(asString),
  referredByCode: asOptional(asString),
  schoolId: asOptional(asString),
  studentPartnerOrg: asOptional(asString),
  studentPartnerSite: asOptional(asString),
  zipCode: asOptional(asString),
})
export interface RegisterStudentWithPasswordPayload
  extends Omit<
    RegisterStudentPayload,
    'parentGuardianEmail' | 'issuer' | 'profileId'
  > {
  password: string
}
export interface RegisterStudentWithPGPayload
  extends Omit<RegisterStudentPayload, 'password' | 'issuer' | 'profileId'> {
  parentGuardianEmail: string
}
export interface RegisterStudentWithFedCredPayload
  extends Omit<RegisterStudentPayload, 'password' | 'parentGuardianEmail'> {
  issuer: string
  profileId: string
}

interface UserRegData {
  ip: string
  email: string
  password: string
  terms: boolean
  referredByCode?: string
  firstName: string
  lastName: string
  signupSourceId?: number
  otherSignupSource?: string
}
const userRegDataValidators = {
  ip: asString,
  email: asString,
  password: asString,
  terms: asBoolean,
  referredByCode: asOptional(asString),
  firstName: asString,
  lastName: asString,
  signupSourceId: asOptional(asNumber),
  otherSignupSource: asOptional(asString),
}

export interface StudentRegData extends UserRegData {
  highSchoolId?: string
  zipCode?: string
}

export interface OpenStudentRegData extends StudentRegData {
  currentGrade: GRADES
  signupSourceId?: number
  otherSignupSource?: string
}
export const asOpenStudentRegData = asFactory<OpenStudentRegData>({
  ...userRegDataValidators,
  highSchoolId: asOptional(asString),
  zipCode: asOptional(asString),
  currentGrade: asEnum(GRADES),
})

export interface PartnerStudentRegData extends StudentRegData {
  studentPartnerOrg: string
  partnerUserId?: string
  partnerSite?: string
  college?: string
  currentGrade?: GRADES
}
export const asPartnerStudentRegData = asFactory<PartnerStudentRegData>({
  ...userRegDataValidators,
  highSchoolId: asOptional(asString),
  zipCode: asOptional(asString),
  studentPartnerOrg: asString,
  partnerUserId: asOptional(asString),
  partnerSite: asOptional(asString),
  college: asOptional(asString),
  currentGrade: asOptional(asEnum(GRADES)),
})

export interface VolunteerRegData extends UserRegData {
  phone: string
  timezone?: string
}
export const asVolunteerRegData = asFactory<VolunteerRegData>({
  ...userRegDataValidators,
  phone: asString,
  timezone: asOptional(asString),
})

export interface PartnerVolunteerRegData extends VolunteerRegData {
  volunteerPartnerOrg: string
  timezone?: string
}
export const asPartnerVolunteerRegData = asFactory<PartnerVolunteerRegData>({
  ...userRegDataValidators,
  phone: asString,
  volunteerPartnerOrg: asString,
  timezone: asOptional(asString),
})

export interface ResetConfirmData {
  email: string
  password: string
  newpassword: string
  token: string
}
export const asResetConfirmData = asFactory<ResetConfirmData>({
  email: asString,
  password: asString,
  newpassword: asString,
  token: asString,
})

// Validation functions
export function checkPassword(password: string): boolean {
  if (password.length < 8) {
    throw new RegistrationError('Password must be 8 characters or longer')
  }

  const numberRegex = /[0-9]/
  if (!password.match(numberRegex))
    throw new RegistrationError('Password must contain at least one number')

  const uppercaseRegex = /[A-Z]/
  if (!password.match(uppercaseRegex))
    throw new RegistrationError(
      'Password must contain at least one uppercase letter'
    )

  const lowercaseRegex = /[a-z]/
  if (!password.match(lowercaseRegex))
    throw new RegistrationError(
      'Password must contain at least one lowercase letter'
    )

  return true
}

export function createResetToken() {
  const buffer: Buffer = randomBytes(16)
  return buffer.toString('hex')
}

export async function checkPhone(phone: string): Promise<boolean> {
  if (!isValidInternationalPhoneNumber(phone))
    throw new RegistrationError('Must supply a valid phone number')

  const existingUser = await getUserIdByPhone(phone)
  if (existingUser)
    throw new LookupError('The phone number you entered is already in use')

  return true
}

export function checkNames(first: string, last: string) {
  // https://stackoverflow.com/questions/10570286/check-if-string-contains-url-anywhere-in-string-using-javascript
  const internalUrlRegExp = new RegExp(
    '([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?'
  )
  if (internalUrlRegExp.test(first) || internalUrlRegExp.test(last))
    throw new InputError('Names can only contain letters, spaces and hyphens')
}

export function checkEmail(email: string) {
  if (!validator.isEmail(email))
    throw new InputError('Email is not a valid email format')
}

export async function getReferredBy(
  referredByCode?: string
): Promise<Ulid | undefined> {
  if (!referredByCode) return
  const referredBy = await checkReferral(referredByCode)
  if (referredBy) {
    captureEvent(referredBy, EVENTS.FRIEND_REFERRED, {
      event: EVENTS.FRIEND_REFERRED,
    })
    return referredBy
  }
}

export const hashPassword = async function(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(config.saltRounds)
  const hash = await bcrypt.hash(password, salt)
  return hash
}

export function verifyPassword(
  candidatePassword: string,
  userPassword: string
): Promise<boolean> {
  // TODO: is there an async bcrypt compare?
  return new Promise((resolve, reject) => {
    bcrypt.compare(
      candidatePassword,
      userPassword,
      (error: Error | undefined, isMatch: boolean): any => {
        if (error) {
          return reject(error)
        }

        return resolve(isMatch)
      }
    )
  })
}

// Passport functions
function setupPassport() {
  passport.serializeUser(function(user: Express.User, done: Function) {
    done(null, user.id)
  })

  passport.deserializeUser(async function(id: Ulid, done: Function) {
    try {
      const user = await getUserContactInfoById(id)
      if (!user) throw new Error('User not found for authenticated session')
      return done(null, user)
    } catch (error) {
      return done(error)
    }
  })

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async function(email: string, passwordGiven: string, done: Function) {
        try {
          const user = await getUserForPassport(email)

          if (!user) {
            return done(null, false)
          }

          if (!user.password) {
            return done(null, false)
          }

          const isValidPassword = await verifyPassword(
            passwordGiven,
            user.password
          )

          user.password = ''

          if (isValidPassword) {
            return done(null, user)
          } else {
            return done(null, false)
          }
        } catch (error) {
          return done(error)
        }
      }
    )
  )

  passport.use(
    'google-login',
    new GoogleStrategy(
      {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: '/auth/oauth2/redirect/google/login',
        scope: ['email'],
        prompt: 'select_account',
      },
      async function(
        issuer: string,
        profile: passport.Profile,
        done: Function
      ) {
        try {
          const existingFedCred = await getFederatedCredential(
            profile.id,
            issuer
          )
          if (!existingFedCred) {
            return done(null, false)
          }

          return done(null, { id: existingFedCred.userId })
        } catch (error) {
          return done(error)
        }
      }
    )
  )

  passport.use(
    'google-register-student',
    new GoogleStrategy(
      {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: '/auth/oauth2/redirect/google/register/student',
        passReqToCallback: true,
        scope: ['profile', 'email'],
        prompt: 'select_account',
      },
      async function(
        req: Request,
        issuer: string,
        profile: passport.Profile,
        done: Function
      ) {
        try {
          const existingFedCred = await getFederatedCredential(
            profile.id,
            issuer
          )
          if (existingFedCred) {
            return done(
              null,
              false,
              'Google account already associated with an account.'
            )
          }

          const firstName = profile.name?.givenName
          const lastName = profile.name?.familyName
          const email = profile.emails?.[0]?.value
          if (!firstName || !lastName || !email) {
            return done(null, false)
          }

          const existingUser = await getUserIdByEmail(email)
          if (existingUser) {
            return done(
              null,
              false,
              'Account with Google email already exists.'
            )
          }

          const session = req.session as SessionWithStudentData
          if (!session.studentData) {
            return done(null, false)
          }

          const data = {
            email,
            emailVerified: true,
            firstName,
            gradeLevel: session.studentData.currentGrade,
            ip: session.studentData.ip,
            issuer,
            lastName,
            profileId: profile.id,
            schoolId: session.studentData.highSchoolId,
            studentPartnerOrg: session.studentData.studentPartnerOrg,
            referredByCode: session.studentData.referredByCode,
            verified: true,
            zipCode: session.studentData.zipCode,
          }
          const student = await registerStudent(data)
          return done(null, student)
        } catch (err) {
          return done(err)
        }
      }
    )
  )

  passport.use(
    'google-register-partner-student',
    new GoogleStrategy(
      {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: '/auth/oauth2/redirect/google/register/partner-student',
        passReqToCallback: true,
        scope: ['profile', 'email'],
        prompt: 'select_account',
      },
      async function(
        req: Request,
        issuer: string,
        profile: passport.Profile,
        done: Function
      ) {
        try {
          const existingFedCred = await getFederatedCredential(
            profile.id,
            issuer
          )
          if (existingFedCred) {
            return done(
              null,
              false,
              'Google account already associated with an account.'
            )
          }

          const firstName = profile.name?.givenName
          const lastName = profile.name?.familyName
          const email = profile.emails?.[0]?.value
          if (!firstName || !lastName || !email) {
            return done(null, false)
          }

          const existingUser = await getUserIdByEmail(email)
          if (existingUser) {
            return done(
              null,
              false,
              'Account with Google email already exists.'
            )
          }

          const session = req.session as SessionWithStudentData
          if (!session.studentData) {
            return done(null, false)
          }

          const student = await createPartnerStudent({
            email,
            firstName,
            lastName,
            gradeLevel: session.studentData.currentGrade,
            studentPartnerOrg: session.studentData.studentPartnerOrg,
            profileId: profile.id,
            issuer,
          })

          return done(null, student)
        } catch (err) {
          return done(err)
        }
      }
    )
  )
}

// Login Required middleware
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next()
  }
  return res.status(401).json({ err: 'Not authenticated' })
}

function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user && req.user.isAdmin) {
    return next()
  }
  return res.status(403).json({ err: 'Unauthorized' })
}

function isAuthenticatedRedirect(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.isAuthenticated()) {
    return next()
  }
  return res.redirect('/')
}

function isAdminRedirect(
  req: Express.Request,
  res: Response,
  next: NextFunction
) {
  if (req.user && req.user.isAdmin) {
    return next()
  }
  return res.redirect('/')
}

async function checkRecaptcha(req: Request, res: Response, next: NextFunction) {
  try {
    await validateRequestRecaptcha(req)
    return next()
  } catch (err) {
    if (
      err instanceof MissingRecaptchaTokenError ||
      err instanceof LowRecaptchaScoreError
    ) {
      res.status(500).json({
        err: err.message,
      })
    } else {
      res.status(500).json({
        err:
          'Something went wrong. Please contact the UPchieve team at support@upchieve.org for help.',
      })
    }
  }
}

export const authPassport = {
  setupPassport,
  isAuthenticated,
  isAdmin,
  isAuthenticatedRedirect,
  isAdminRedirect,
  checkRecaptcha,
}
