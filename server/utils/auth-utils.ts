import bcrypt from 'bcrypt'
import { CustomError } from 'ts-custom-error'
import passport from 'passport'
import passportLocal from 'passport-local'
import { Ulid } from '../models/pgUtils'
import { Request, Response, NextFunction } from 'express'
import config from '../config'
import {
  getUserContactInfoById,
  getUserForPassport,
  getUserIdByPhone,
} from '../models/User/queries'
import { checkReferral } from '../controllers/UserCtrl'
import { captureEvent } from '../services/AnalyticsService'
import { EVENTS, GRADES } from '../constants'

import { InputError, LookupError } from '../models/Errors'
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
import { isEnabled } from 'unleash-client'
import { FEATURE_FLAGS } from '../constants'

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

interface UserRegData {
  ip: string
  email: string
  password: string
  terms: boolean
  referredByCode?: string
  firstName: string
  lastName: string
}
const userRegDataValidators = {
  ip: asString,
  email: asString,
  password: asString,
  terms: asBoolean,
  referredByCode: asOptional(asString),
  firstName: asString,
  lastName: asString,
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
  signupSourceId: asOptional(asNumber),
  otherSignupSource: asOptional(asString),
})

export interface PartnerStudentRegData extends StudentRegData {
  studentPartnerOrg: string
  partnerUserId?: string
  partnerSite?: string
  college?: string
  currentGrade?: GRADES
  signupSourceId?: number
  otherSignupSource?: string
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
  signupSourceId: asOptional(asNumber),
  otherSignupSource: asOptional(asString),
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

  let numUpper = 0
  let numLower = 0
  let numNumber = 0
  for (let i = 0; i < password.length; i++) {
    if (!isNaN(Number(password[i]))) {
      numNumber += 1
    } else if (password[i].toUpperCase() === password[i]) {
      numUpper += 1
    } else if (password[i].toLowerCase() === password[i]) {
      numLower += 1
    }
  }

  if (numUpper === 0) {
    throw new RegistrationError(
      'Password must contain at least one uppercase letter'
    )
  }
  if (numLower === 0) {
    throw new RegistrationError(
      'Password must contain at least one lowercase letter'
    )
  }
  if (numNumber === 0) {
    throw new RegistrationError('Password must contain at least one number')
  }
  return true
}

export async function checkPhone(phone: string): Promise<boolean> {
  if (!isValidInternationalPhoneNumber(phone))
    throw new RegistrationError('Must supply a valid phone number')

  const existingUser = await getUserIdByPhone(phone)
  if (existingUser)
    throw new LookupError('The phone number you entered is already in use')

  return true
}

export async function checkNames(first: string, last: string) {
  // https://stackoverflow.com/questions/10570286/check-if-string-contains-url-anywhere-in-string-using-javascript
  const internalUrlRegExp = new RegExp(
    '([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?'
  )
  if (internalUrlRegExp.test(first) || internalUrlRegExp.test(last))
    throw new InputError('Names can only contain letters, spaces and hyphens')
}

export async function checkEmail(email: string) {
  if (!validator.isEmail(email))
    throw new InputError('Email is not a valid email format')
}

export async function getReferredBy(
  referredByCode: string
): Promise<Ulid | undefined> {
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
const LocalStrategy = passportLocal.Strategy
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

export const authPassport = {
  setupPassport,
  isAuthenticated,
  isAdmin,
  isAuthenticatedRedirect,
  isAdminRedirect,
}
