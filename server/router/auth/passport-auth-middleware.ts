import { Request } from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GoogleStrategy } from 'passport-google-oidc'
import CleverStrategy from './clever-strategy'
import { getFederatedCredential } from '../../models/FederatedCredential/queries'
import { getUserForPassport, getUserIdByEmail } from '../../models/User/queries'
import { registerStudent } from '../../services/UserCreationService'
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
  done: Function,
  data?: Partial<RegisterStudentPayload>
) {
  try {
    const existingFedCred = await getFederatedCredential(profile.id, issuer)
    if (existingFedCred) {
      return done(
        null,
        false,
        `${providerName} account already used with another UPchieve account.`
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
        `Account with ${providerName} email already exists.`
      )
    }

    if (!data) {
      return done(null, false, 'Internal Error: Please try again.')
    }

    const studentData = {
      email,
      firstName,
      issuer,
      lastName,
      profileId: profile.id,
      ...data,
    }
    const student = await registerStudent(studentData)
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
        callbackURL: '/auth/oauth2/redirect',
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
        const { isLogin } = req.session as SessionWithSsoData
        if (isLogin) {
          return passportLoginUser(profile.id, issuer, done)
        } else {
          const { studentData } = req.session as SessionWithSsoData
          return passportRegisterUser(
            profile,
            issuer,
            'Google',
            done,
            studentData
          )
        }
      }
    )
  )

  passport.use(
    'clever',
    new CleverStrategy({ callbackURL: '/auth/oauth2/redirect' }, async function(
      req: Request,
      _accessToken: string,
      _refreshToken: string,
      profile: passport.Profile & { issuer: string },
      done: Function
    ) {
      const { isLogin } = req.session as SessionWithSsoData
      if (isLogin) {
        return passportLoginUser(profile.id, profile.issuer, done)
      } else {
        const { studentData } = req.session as SessionWithSsoData
        return passportRegisterUser(
          profile,
          profile.issuer,
          'Clever',
          done,
          studentData
        )
      }
    })
  )
}
