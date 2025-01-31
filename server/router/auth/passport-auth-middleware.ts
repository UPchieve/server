import { Request } from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GoogleStrategy } from 'passport-google-oidc'
import CleverStrategy, { TCleverPassportProfile } from './clever-strategy'
import {
  getFederatedCredential,
  insertFederatedCredential,
} from '../../models/FederatedCredential/queries'
import { getUserForPassport, getUserIdByEmail } from '../../models/User/queries'
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
    const existingFedCred = await getFederatedCredential(profileId, issuer)
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
    const existingFedCred = await getFederatedCredential(profile.id, issuer)
    if (existingFedCred) {
      return done(null, { id: existingFedCred.userId })
    }

    const firstName = profile.name?.givenName
    const lastName = profile.name?.familyName
    const email = profile.emails?.[0]?.value
    if (!firstName || !lastName || !email) {
      return done(null, false)
    }

    const existingUser = await getUserIdByEmail(email)
    if (existingUser) {
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
      async function(
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
    new CleverStrategy({ callbackURL: getRedirectURI() }, async function(
      req: Request,
      _accessToken: string,
      _refreshToken: string,
      profile: TCleverPassportProfile,
      done: Function
    ) {
      const { userData } = (req.session as SessionWithSsoData).sso ?? {}

      // Check if the user has already used Clever SSO.
      const existingFedCred = await getFederatedCredential(
        profile.id,
        profile.issuer
      )
      if (existingFedCred) {
        if (userData && isStudent(profile)) {
          const data = {
            schoolId: userData.schoolId,
            studentPartnerOrgKey: (userData as RegisterStudentPayload)
              .studentPartnerOrgKey,
            studentPartnerOrgSiteName: (userData as RegisterStudentPayload)
              .studentPartnerOrgSiteName,
            userId: existingFedCred.userId,
          }
          await UserCreationService.upsertStudent(data)
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

      const profileEmail = profile.emails?.[0]?.value
      const email = profileEmail ?? userData?.email
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
      const existingUserId = await getUserIdByEmail(email)
      if (existingUserId) {
        if (userData && isStudent(profile)) {
          const data = {
            schoolId: userData.schoolId,
            studentPartnerOrgKey: (userData as RegisterStudentPayload)
              .studentPartnerOrgKey,
            studentPartnerOrgSiteName: (userData as RegisterStudentPayload)
              .studentPartnerOrgSiteName,
            userId: existingUserId,
          }
          await UserCreationService.upsertStudent(data)
        }
        await insertFederatedCredential(
          profile.id,
          profile.issuer,
          existingUserId
        )
        return done(null, { id: existingUserId })
      }

      // If the user hadn't previously used Clever SSO and didn't
      // exist, register them.
      const data = {
        ...userData,
        email,
        firstName,
        issuer: profile.issuer,
        lastName,
        profileId: profile.id,
        schoolId: profile.schoolId,
      }
      if (isStudent(profile)) {
        const student = await UserCreationService.registerStudent(data)
        return done(null, student)
      } else if (isTeacher(profile)) {
        const teacher = await UserCreationService.registerTeacher(data)
        return done(null, teacher)
      }
    })
  )

  function isStudent(profile: TCleverPassportProfile) {
    return profile.userType === 'student'
  }

  function isTeacher(profile: TCleverPassportProfile) {
    return profile.userType === 'teacher'
  }
}

function getRedirectURI() {
  const host =
    config.NODE_ENV === 'dev'
      ? 'http://localhost:3000'
      : `https://${config.host}`
  return `${host}/auth/oauth2/redirect`
}
