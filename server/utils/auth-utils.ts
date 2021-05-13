import bcrypt from 'bcrypt'
import { CustomError } from 'ts-custom-error'
import passport from 'passport'
import passportLocal from 'passport-local'
import { Types } from 'mongoose'

import config from '../config'
import User from '../models/User'
import { checkReferral } from '../controllers/UserCtrl'
import { captureEvent } from '../services/AnalyticsService'
import UserService from '../services/UserService'
import { EVENTS } from '../constants'
import isValidInternationalPhoneNumber from './is-valid-international-phone-number'
import {
  LookupError,
  asString,
  asBoolean,
  asFactory,
  asOptional
} from './type-utils'

// Custom errors
export class RegistrationError extends CustomError {}
export class ResetError extends CustomError {}

// Function signature interfaces
export interface CredentialData {
  email: string
  password: string
}

interface UserRegData {
  ip: string
  email: string
  password: string
  terms: boolean
  referredByCode?: string
  firstName: string
  lastName: string
}

export interface StudentRegData extends UserRegData {
  studentPartnerOrg?: string
  partnerUserId?: string
  highSchoolId?: string
  zipCode?: string
  partnerSite?: string
  college?: string
}

export interface VolunteerRegData extends UserRegData {
  phone: string
}

export interface PartnerVolunteerRegData extends VolunteerRegData {
  volunteerPartnerOrg: string
}

export interface ResetConfirmData {
  email: string
  password: string
  token: string
}

// Function signature interface type checks
export const asCredentialData = asFactory<CredentialData>({
  email: asString,
  password: asString
})

const userRegDataValidators = {
  ip: asString,
  email: asString,
  password: asString,
  terms: asBoolean,
  referredByCode: asOptional(asString),
  firstName: asString,
  lastName: asString
}

export const asStudentRegData = asFactory<StudentRegData>({
  ...userRegDataValidators,
  studentPartnerOrg: asOptional(asString),
  partnerUserId: asOptional(asString),
  highSchoolId: asOptional(asString),
  zipCode: asOptional(asString),
  partnerSite: asOptional(asString),
  college: asOptional(asString)
})

export const asVolunteerRegData = asFactory<VolunteerRegData>({
  ...userRegDataValidators,
  phone: asString
})

export const asPartnerVolunteerRegData = asFactory<PartnerVolunteerRegData>({
  ...userRegDataValidators,
  phone: asString,
  volunteerPartnerOrg: asString
})

export const asResetConfirmData = asFactory<ResetConfirmData>({
  email: asString,
  password: asString,
  token: asString
})

// Validation functions
export function checkPassword(password: string): boolean | RegistrationError {
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

export async function checkPhone(
  phone: string
): Promise<boolean | RegistrationError> {
  if (!isValidInternationalPhoneNumber(phone))
    throw new RegistrationError('Must supply a valid phone number')

  const existingUser = await UserService.getUser({ phone }, { _id: 1 })
  if (existingUser)
    throw new LookupError('The phone number you entered is already in use')

  return true
}

export async function getReferredBy(
  referredByCode: string
): Promise<Types.ObjectId> {
  const referredBy = await checkReferral(referredByCode)
  if (referredBy) {
    captureEvent(referredBy, EVENTS.FRIEND_REFERRED, {
      event: EVENTS.FRIEND_REFERRED
    })
    return Types.ObjectId(referredBy)
  } else return undefined
}

export const hashPassword = async function(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(config.saltRounds)
  const hash = await bcrypt.hash(password, salt)
  return hash
}

export function verifyPassword(
  candidatePassword,
  userPassword
): Promise<Error | boolean> {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, userPassword, (error, isMatch) => {
      if (error) {
        return reject(error)
      }

      return resolve(isMatch)
    })
  })
}

// Passport functions
const LocalStrategy = passportLocal.Strategy
function setupPassport() {
  passport.serializeUser(function(user, done) {
    done(null, user._id)
  })

  passport.deserializeUser(async function(id, done) {
    try {
      const user = await User.findById(id).lean()
      return done(null, user)
    } catch (error) {
      return done(error)
    }
  })

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async function(email, passwordGiven, done) {
        try {
          const user = await User.findOne({ email: email }, '+password')
            .lean()
            .exec()

          if (!user) {
            return done(null, false)
          }

          const isValidPassword = await verifyPassword(
            passwordGiven,
            user.password
          )

          user.password = undefined

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
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  return res.status(401).json({ err: 'Not authenticated' })
}

function isAdmin(req, res, next) {
  if (req.user.isAdmin) {
    return next()
  }
  return res.status(401).json({ err: 'Unauthorized' })
}

function isAuthenticatedRedirect(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  return res.redirect('/')
}

function isAdminRedirect(req, res, next) {
  if (req.user.isAdmin) {
    return next()
  }
  return res.redirect('/')
}

export const authPassport = {
  setupPassport,
  isAuthenticated,
  isAdmin,
  isAuthenticatedRedirect,
  isAdminRedirect
}
