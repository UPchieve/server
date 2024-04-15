import { Request } from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GoogleStrategy } from 'passport-google-oidc'
import { getFederatedCredential } from '../../models/FederatedCredential/queries'
import { getUserForPassport, getUserIdByEmail } from '../../models/User/queries'
import {
  registerStudent,
  createPartnerStudent,
} from '../../services/UserCreationService'
import { SessionWithStudentData, verifyPassword } from '../../utils/auth-utils'
import config from '../../config'

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
              'Google account already used with another UPchieve account.'
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

  // TODO: Remove in favour of `google-register-student`.
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
