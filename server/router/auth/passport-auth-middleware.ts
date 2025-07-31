import { Request } from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GoogleStrategy } from 'passport-google-oidc'
import ClassLinkStrategy, {
  ClassLinkPassportProfile,
} from './classlink-strategy'
import CleverStrategy, { TCleverPassportProfile } from './clever-strategy'
import * as UserRepo from '../../models/User/queries'
import * as CleverAPIService from '../../services/CleverAPIService'
import * as CleverRosterService from '../../services/CleverRosterService'
import * as FedCredService from '../../services/FederatedCredentialService'
import * as UserCreationService from '../../services/UserCreationService'
import {
  RegisterStudentPayload,
  SessionWithSsoData,
  SsoProviderNames,
  verifyPassword,
} from '../../utils/auth-utils'
import { isDevEnvironment } from '../../utils/environments'
import config from '../../config'
import logger from '../../logger'
import { Uuid } from '../../models/pgUtils'
import { USER_ROLES_TYPE } from '../../constants'

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

type SSOProfile = passport.Profile & {
  issuer: string
  userType: USER_ROLES_TYPE
  schoolId?: Uuid
  // TODO: When including ClassLink rostering, normalize to a similar type
  teacher?: {
    classes: CleverAPIService.TCleverSectionData[]
    students: CleverAPIService.TCleverStudentData[]
  }
}

type SSOHandlerOptions = {
  providerName: SsoProviderNames.CLEVER | SsoProviderNames.CLASSLINK
  isStudent: (userType: USER_ROLES_TYPE) => boolean
  isTeacher: (userType: USER_ROLES_TYPE) => boolean
  // TODO: When including ClassLink rostering, normalize to a similar type
  rosterTeacher?: (
    userId: Uuid,
    classes: CleverAPIService.TCleverSectionData[],
    students: CleverAPIService.TCleverStudentData[]
  ) => Promise<void>
}

async function handleSSOStrategy(
  req: Request,
  profile: SSOProfile,
  done: Function,
  options: SSOHandlerOptions
) {
  try {
    const { userData } = (req.session as SessionWithSsoData).sso ?? {}
    // Check if the user already has used SSO provider
    const existingFedCred = await FedCredService.getFedCredForUser(
      profile.id,
      profile.issuer
    )

    if (existingFedCred) {
      if (userData && options.isStudent(profile.userType)) {
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
        options.isTeacher(profile.userType) &&
        profile.teacher &&
        options.rosterTeacher
      ) {
        // Always update the teacher's classes whenever they sign in.
        await options.rosterTeacher(
          existingFedCred.userId,
          profile.teacher.classes,
          profile.teacher.students
        )
      }
      return done(null, { id: existingFedCred.userId })
    }

    const firstName = profile.name?.givenName
    const lastName = profile.name?.familyName
    const email = profile.emails?.[0]?.value ?? userData?.email
    if (!firstName || !lastName) {
      return done(null, false, {
        errorMessage: 'Missing required field in passport.Profile',
      })
    }

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
      if (userData && options.isStudent(profile.userType)) {
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
        options.isTeacher(profile.userType) &&
        profile.teacher &&
        options.rosterTeacher
      ) {
        await options.rosterTeacher(
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

    if (options.isStudent(profile.userType)) {
      const student = await UserCreationService.registerStudent(data)
      return done(null, student)
    } else if (options.isTeacher(profile.userType)) {
      const teacher = await UserCreationService.registerTeacher(data)
      if (profile.teacher && options.rosterTeacher) {
        await options.rosterTeacher(
          teacher.id,
          profile.teacher.classes,
          profile.teacher.students
        )
      }
      return done(null, teacher)
    }
  } catch (err) {
    logger.error(err, `Failed ${options.providerName} SSO.`)
    return done(null, false, {
      userType: profile.userType,
      errorMessage: `Failed ${options.providerName} SSO. Please try again or contact support.`,
    })
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
          // TODO: Consider passportLoginUser to support logging in users who haven't used Google SSO before,
          // but have an UPchieve account with a matching email similar to Clever/ClassLink SSO behavior
          return passportLoginUser(profile.id, issuer, done)
        } else {
          const { userData } = (req.session as SessionWithSsoData).sso ?? {}
          return passportRegisterUser(
            profile,
            issuer,
            SsoProviderNames.GOOGLE,
            userData,
            done
          )
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
      return handleSSOStrategy(req, profile, done, {
        providerName: SsoProviderNames.CLEVER,
        isStudent,
        isTeacher,
        rosterTeacher: CleverRosterService.rosterTeacherClasses,
      })
    })
  )

  passport.use(
    'classlink',
    new ClassLinkStrategy(
      {
        callbackURL: getRedirectURI(),
        clientID: config.classlinkClientId,
        clientSecret: config.classlinkClientSecret,
      },
      async function (
        req: Request,
        _accessToken: string,
        _refreshToken: string,
        profile: ClassLinkPassportProfile,
        done: Function
      ) {
        return handleSSOStrategy(req, profile, done, {
          providerName: SsoProviderNames.CLASSLINK,
          isStudent,
          isTeacher,
        })
      }
    )
  )

  passport.use(
    'classlink-launchpad',
    new ClassLinkStrategy(
      {
        callbackURL: getRedirectURI(),
        clientID: config.classLinkLaunchPadClientId,
        clientSecret: config.classLinkLaunchPadClientSecret,
      },
      async function (
        req: Request,
        _accessToken: string,
        _refreshToken: string,
        profile: ClassLinkPassportProfile,
        done: Function
      ) {
        return handleSSOStrategy(req, profile, done, {
          providerName: SsoProviderNames.CLASSLINK,
          isStudent,
          isTeacher,
        })
      }
    )
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

export function getClassLinkStrategy(
  req: Request
): 'classlink' | 'classlink-launchpad' {
  const connection = req.query.connection
  if (connection === 'launchpad') return 'classlink-launchpad'
  return 'classlink'
}

function getRedirectURI() {
  const host = isDevEnvironment()
    ? `http://localhost:3000`
    : `${config.protocol}://${config.host}`
  return `${host}/auth/oauth2/redirect`
}

function isStudent(userType: USER_ROLES_TYPE): boolean {
  return userType === 'student'
}

function isTeacher(userType: USER_ROLES_TYPE): boolean {
  return userType === 'teacher'
}
