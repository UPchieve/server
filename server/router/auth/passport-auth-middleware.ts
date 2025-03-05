import { Request } from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GoogleStrategy } from 'passport-google-oidc'
import CleverStrategy, { TCleverPassportProfile } from './clever-strategy'
import * as UserRepo from '../../models/User/queries'
import * as CleverAPIService from '../../services/CleverAPIService'
import * as CleverRosterService from '../../services/CleverRosterService'
import * as FedCredService from '../../services/FederatedCredentialService'
import * as UserCreationService from '../../services/UserCreationService'
import {
  RegisterStudentPayload,
  SessionWithSsoData,
  verifyPassword,
} from '../../utils/auth-utils'
import config from '../../config'

async function passportLoginUser(
  profileId: string,
  issuer: string,
  done: Function
) {
  try {
    const existingFedCred = await FedCredService.getFedCredForUser(
      profileId,
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

async function passportRegisterUser(
  profile: passport.Profile,
  issuer: string,
  providerName: string,
  data: Partial<RegisterStudentPayload> = {},
  done: Function
) {
  try {
    const existingFedCred = await FedCredService.getFedCredForUser(
      profile.id,
      issuer
    )
    if (existingFedCred) {
      return done(null, { id: existingFedCred.userId })
    }

    const firstName = profile.name?.givenName
    const lastName = profile.name?.familyName
    const email = profile.emails?.[0]?.value
    if (!firstName || !lastName || !email) {
      return done(null, false)
    }

    const existingUser = await getUserVerificationByEmails(email, data?.email)
    if (existingUser) {
      // We will link this SSO account if the email matches an existing user
      // who has the same email and that email was verified.
      if (existingUser.verified && existingUser.emailVerified) {
        await FedCredService.linkAccount(profile.id, issuer, existingUser.id)
        return done(null, { id: existingUser.id })
      }
      return done(null, false, {
        errorMessage: `Account with ${providerName} email already exists.`,
      })
    }

    const studentData = {
      email,
      firstName,
      issuer,
      lastName,
      profileId: profile.id,
      ...data,
    }
    const student = await UserCreationService.registerStudent(studentData)
    return done(null, student)
  } catch (err) {
    return done(err)
  }
}

export function addPassportAuthMiddleware() {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async function (email: string, passwordGiven: string, done: Function) {
        try {
          const user = await UserRepo.getUserForPassport(email)

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
    'google',
    new GoogleStrategy(
      {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: getRedirectURI(),
        scope: ['profile', 'email'],
        prompt: 'select_account',
        passReqToCallback: true,
      },
      async function (
        req: Request,
        issuer: string,
        profile: passport.Profile,
        done: Function
      ) {
        const { isLogin } = (req.session as SessionWithSsoData).sso ?? {}
        if (isLogin) {
          return passportLoginUser(profile.id, issuer, done)
        } else {
          const { userData } = (req.session as SessionWithSsoData).sso ?? {}
          return passportRegisterUser(profile, issuer, 'Google', userData, done)
        }
      }
    )
  )

  passport.use(
    'clever',
    new CleverStrategy({ callbackURL: getRedirectURI() }, async function (
      req: Request,
      _accessToken: string,
      _refreshToken: string,
      profile: TCleverPassportProfile,
      done: Function
    ) {
      const { userData } = (req.session as SessionWithSsoData).sso ?? {}
      // Check if the user has already used Clever SSO.
      const existingFedCred = await FedCredService.getFedCredForUser(
        profile.id,
        profile.issuer
      )
      if (existingFedCred) {
        if (userData && CleverAPIService.isStudent(profile.userType)) {
          const data = {
            schoolId: userData.schoolId,
            studentPartnerOrgKey: (userData as RegisterStudentPayload)
              .studentPartnerOrgKey,
            studentPartnerOrgSiteName: (userData as RegisterStudentPayload)
              .studentPartnerOrgSiteName,
            userId: existingFedCred.userId,
          }
          // Always upsert the student if there is data.
          await UserCreationService.upsertStudent(data)
        } else if (
          CleverAPIService.isTeacher(profile.userType) &&
          profile.teacher
        ) {
          // Always update the teacher's classes whenever they sign in.
          await CleverRosterService.rosterTeacherClasses(
            existingFedCred.userId,
            profile.teacher.classes,
            profile.teacher.students
          )
        }
        return done(null, { id: existingFedCred.userId })
      }

      const firstName = profile.name?.givenName
      const lastName = profile.name?.familyName
      if (!firstName || !lastName) {
        return done(null, false, {
          errorMessage: 'Missing required field in passport.Profile',
        })
      }

      const email = profile.emails?.[0]?.value ?? userData?.email
      if (!email) {
        // Redirect to get the email from the user so we can link
        // their account if an account already exists, or create an
        // account.
        return done(null, false, {
          profileId: profile.id,
          issuer: profile.issuer,
          firstName,
          lastName,
        })
      }

      // Check if the user already exists, but just hadn't used
      // Clever SSO before.
      const existingUser = await getUserVerificationByEmails(
        email,
        userData?.email
      )
      if (existingUser) {
        if (userData && CleverAPIService.isStudent(profile.userType)) {
          const data = {
            schoolId: userData.schoolId,
            studentPartnerOrgKey: (userData as RegisterStudentPayload)
              .studentPartnerOrgKey,
            studentPartnerOrgSiteName: (userData as RegisterStudentPayload)
              .studentPartnerOrgSiteName,
            userId: existingUser.id,
          }
          await UserCreationService.upsertStudent(data)
        } else if (
          CleverAPIService.isTeacher(profile.userType) &&
          profile.teacher
        ) {
          await CleverRosterService.rosterTeacherClasses(
            existingUser.id,
            profile.teacher.classes,
            profile.teacher.students
          )
        }
        await FedCredService.linkAccount(
          profile.id,
          profile.issuer,
          existingUser.id
        )
        return done(null, { id: existingUser.id })
      }

      // If the user doesn't exist, register them.
      const data = {
        ...userData,
        email,
        firstName,
        issuer: profile.issuer,
        lastName,
        profileId: profile.id,
        schoolId: profile.schoolId,
      }
      if (CleverAPIService.isStudent(profile.userType)) {
        const student = await UserCreationService.registerStudent(data)
        return done(null, student)
      } else if (
        CleverAPIService.isTeacher(profile.userType) &&
        profile.teacher
      ) {
        const teacher = await UserCreationService.registerTeacher(data)
        await CleverRosterService.rosterTeacherClasses(
          teacher.id,
          profile.teacher.classes,
          profile.teacher.students
        )
        return done(null, teacher)
      }
    })
  )
}

async function getUserVerificationByEmails(
  ...emails: Array<string | undefined>
) {
  for (const e of emails) {
    if (!e) continue

    const user = await UserRepo.getUserVerificationByEmail(e)
    if (user) return user
  }
}

function getRedirectURI() {
  const host =
    config.NODE_ENV === 'dev'
      ? 'http://localhost:3000'
      : `https://${config.host}`
  return `${host}/auth/oauth2/redirect`
}
