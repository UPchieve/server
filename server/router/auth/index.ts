import { Express, Router, Request, Response } from 'express'
import passport from 'passport'
import * as AuthService from '../../services/AuthService'
import * as FedCredService from '../../services/FederatedCredentialService'
import * as StudentService from '../../services/StudentService'
import * as UserCreationService from '../../services/UserCreationService'
import {
  authPassport,
  isSupportedSsoProvider,
  registerStudentValidator,
  registerTeacherValidator,
  SessionWithSsoData,
} from '../../utils/auth-utils'
import { InputError, LookupError } from '../../models/Errors'
import { resError } from '../res-error'
import { getUserIdByEmail } from '../../models/User/queries'
import { asString } from '../../utils/type-utils'
import { getUuid, Ulid } from '../../models/pgUtils'
import logger from '../../logger'
import { getLegacyUserObject } from '../../models/User/legacy-user'
import { extractUser } from '../extract-user'
import config from '../../config'
import { ACCOUNT_USER_ACTIONS } from '../../constants'
import { createAccountAction } from '../../models/UserAction'
import { AuthRedirect } from './auth-redirect'

async function trackLoggedIn(userId: Ulid, ipAddress: string) {
  await createAccountAction({
    userId,
    action: ACCOUNT_USER_ACTIONS.LOGGED_IN,
    ipAddress,
  })
}

export function routes(app: Express) {
  const router = Router()

  router.route('/logout').get(async function(req, res) {
    const userId = req.user?.id
    req.session.destroy(() => {
      /* do nothing */
    })

    // We do not remove all sessions from the database when users log out
    // because we have lots of students who share multiple devices. They may
    // want to log out of a laptop they share with a sibling, but stay logged
    // in on their mobile device, for example.

    req.logout()

    if (userId) {
      await createAccountAction({
        userId,
        action: ACCOUNT_USER_ACTIONS.LOGGED_OUT,
        ipAddress: req.ip,
      })
    }
    res.json({
      msg: 'You have been logged out',
    })
  })

  router.route('/login').post(
    // Delegate auth logic to passport middleware
    passport.authenticate('local'),
    // If successfully authed, return user object (otherwise 401 is returned from middleware)
    async function(req: Request, res: Response) {
      const legacyUser = await getLegacyUserObject(extractUser(req).id)
      await trackLoggedIn(legacyUser.id, req.ip)
      res.json({ user: legacyUser })
    }
  )

  router.route('/sso').get((req, res) => {
    const provider = req.query.provider as string
    const isLogin = req.query.isLogin === 'true' ?? true
    if (!provider || !isSupportedSsoProvider(provider)) {
      res.redirect(AuthRedirect.failureRedirect(isLogin, provider ?? ''))
      return
    }

    ;(req.session as SessionWithSsoData).sso = {
      studentData: !isLogin
        ? {
            ...req.query,
            ip: req.ip,
          }
        : undefined,
      provider,
      isLogin,
      redirect: req.query.redirect as string,
    }

    const strategy = provider
    passport.authenticate(strategy)(req, res)
  })
  // Redirect URI for SSO providers.
  router.route('/oauth2/redirect').get((req, res) => {
    const {
      provider = req.headers.referer?.includes('clever') ? 'clever' : '',
      isLogin = true,
      redirect = '',
      studentData = {},
    } = (req.session as SessionWithSsoData).sso ?? {}
    if (!provider || !isSupportedSsoProvider(provider)) {
      res.redirect(
        AuthRedirect.failureRedirect(
          isLogin,
          provider,
          studentData,
          `Unknown provider: ${provider}`
        )
      )
      return
    }
    const strategy = provider
    passport.authenticate(strategy, async function(_, user, data) {
      if (data.profileId && data.issuer) {
        const validator = getUuid()
        ;(req.session as SessionWithSsoData).sso = {
          fedCredData: {
            profileId: data.profileId,
            issuer: data.issuer,
            validator,
          },
          studentData: {
            ...studentData,
            firstName: data.firstName,
            lastName: data.lastName,
          },
        }
        return res.redirect(AuthRedirect.emailRedirect(validator))
      }

      delete (req.session as SessionWithSsoData).sso

      if (user) {
        await req.asyncLogin(user)
        return res.redirect(AuthRedirect.successRedirect(redirect))
      } else {
        req.logout()
        return res.redirect(
          AuthRedirect.failureRedirect(
            isLogin,
            provider,
            studentData,
            data.errorMessage
          )
        )
      }
    })(req, res)
  })

  router.route('/register/checkcred').post(async function(req, res) {
    try {
      const checked = await AuthService.checkCredential(req.body as unknown)
      return res.json({ checked })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/register/student').post(async function(req, res) {
    try {
      const { fedCredData } = (req.session as SessionWithSsoData).sso ?? {}
      if (fedCredData && req.body.validator === fedCredData.validator) {
        const existingStudent = await StudentService.getStudentByEmail(
          req.body.email
        )
        if (existingStudent) {
          await FedCredService.linkAccount(
            fedCredData.profileId,
            fedCredData.issuer,
            existingStudent.id
          )
          await req.asyncLogin({ id: existingStudent.id, isAdmin: false })
          delete (req.session as SessionWithSsoData).sso
          return res.json({ user: existingStudent })
        }
      } else {
        delete (req.session as SessionWithSsoData).sso
      }

      const data = registerStudentValidator({
        ...req.body,
        ...((req.session as SessionWithSsoData).sso?.fedCredData ?? {}),
        ...((req.session as SessionWithSsoData).sso?.studentData ?? {}),
        ip: req.ip,
      })
      const student = await UserCreationService.registerStudent(data)
      if (
        data.password ||
        (req.session as SessionWithSsoData).sso?.fedCredData
      ) {
        await req.asyncLogin(student)
      }
      delete (req.session as SessionWithSsoData).sso
      return res.json({ user: student })
    } catch (e) {
      resError(res, e)
    }
  })

  // == Remove once midtown clean-up.
  router.route('/register/student/open').post(async function(req, res) {
    try {
      const data = registerStudentValidator({
        ...req.body,
        gradeLevel: req.body.currentGrade,
        schoolId: req.body.highSchoolId,
        ip: req.ip,
      })
      const student = await UserCreationService.registerStudent(data)
      await req.asyncLogin(student)
      return res.json({ user: student })
    } catch (e) {
      resError(res, e)
    }
  })

  // == Remove once midtown clean-up.
  router.route('/register/student/partner').post(async function(req, res) {
    try {
      const data = registerStudentValidator({
        ...req.body,
        gradeLevel: req.body.currentGrade,
        schoolId: req.body.highSchoolId,
        studentPartnerOrgKey: req.body.studentPartnerOrg,
        studentPartnerOrgSiteName: req.body.partnerSite,
        ip: req.ip,
      })
      const student = await UserCreationService.registerStudent(data)
      await req.asyncLogin(student)
      return res.json({ user: student })
    } catch (e) {
      resError(res, e)
    }
  })

  router.route('/register/teacher').post(async function(req, res) {
    try {
      const data = registerTeacherValidator({
        ...req.body,
        ip: req.ip,
      })
      const teacher = await UserCreationService.registerTeacher(data)
      await req.asyncLogin(teacher)
      return res.json({ user: teacher })
    } catch (e) {
      resError(res, e)
    }
  })

  router.route('/register/volunteer/open').post(async function(req, res) {
    try {
      const volunteer = await AuthService.registerVolunteer({
        ...req.body,
        ip: req.ip,
      } as unknown)
      await req.asyncLogin(volunteer)
      await trackLoggedIn(volunteer.id, req.ip)
      res.json({ user: volunteer })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/register/volunteer/partner').post(async function(req, res) {
    try {
      const volunteer = await AuthService.registerPartnerVolunteer({
        ...req.body,
        ip: req.ip,
      } as unknown)
      await req.asyncLogin(volunteer)
      await trackLoggedIn(volunteer.id, req.ip)
      res.json({ user: volunteer })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/partner/volunteer').get(async function(req, res) {
    try {
      if (!req.query.hasOwnProperty('partnerId'))
        throw new InputError('Missing volunteerPartnerId query string')
      const partner = await AuthService.lookupPartnerVolunteer(
        req.query.partnerId as unknown
      )
      res.json({ volunteerPartner: partner })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/partner/student').get(async function(req, res) {
    try {
      if (!req.query.hasOwnProperty('partnerId'))
        throw new InputError('Missing studentPartnerId query string')
      const partner = await AuthService.lookupPartnerStudent(
        req.query.partnerId as unknown
      )
      res.json({
        studentPartner: {
          ...partner,
          isManuallyApproved:
            partner.key === config.customManualStudentPartnerOrg,
        },
      })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/partner/student/code').get(async function(req, res) {
    try {
      if (!req.query.hasOwnProperty('partnerSignupCode'))
        throw new InputError('Missing partnerSignupCode query string')
      const studentPartnerKey = await AuthService.lookupPartnerStudentCode(
        req.query.partnerSignupCode as unknown
      )
      res.json({ studentPartnerKey })
    } catch (err) {
      resError(res, err)
    }
  })

  router
    .route('/partner/student-partners')
    .all(authPassport.isAdmin)
    .get(async function(req, res) {
      try {
        const partnerOrgs = await AuthService.lookupStudentPartners()
        res.json({ partnerOrgs })
      } catch (err) {
        resError(res, err)
      }
    })

  router
    .route('/partner/volunteer-partners')
    .all(authPassport.isAdmin)
    .get(async function(req, res) {
      try {
        const partnerOrgs = await AuthService.lookupVolunteerPartners()
        res.json({ partnerOrgs })
      } catch (err) {
        resError(res, err)
      }
    })

  router
    .route('/partner/sponsor-orgs')
    .all(authPassport.isAdmin)
    .get(async function(req, res) {
      try {
        const sponsorOrgs = await AuthService.lookupSponsorOrgs()
        res.json({ sponsorOrgs })
      } catch (err) {
        resError(res, err)
      }
    })

  router.route('/reset/send').post(async function(req, res) {
    try {
      const reqEmail = asString(req.body.email)
      const email = reqEmail.toLowerCase()
      try {
        await AuthService.sendReset(email as unknown)
      } catch (err) {
        // do not respond with info about no email match
        if (!(err instanceof LookupError)) return resError(res, err) // will handle sending response with status/error
        logger.info(err) // log expected lookup errors
      }
      let userId: Ulid | undefined
      if (!req.user) {
        // user not logged in
        userId = await getUserIdByEmail(email)
      } // logged in
      else userId = req.user.id
      req.session.destroy(() => {
        /* do nothing */
      })
      // if account with given email exists then try to destroy its sessions
      if (userId) {
        await AuthService.deleteAllUserSessions(userId)
        req.logout()
      }
      res.status(200).json({
        msg:
          'If an account with this email address exists then we will send a password reset email',
      })
    } catch (err) {
      resError(res, err)
    }
  })

  router.post('/reset/confirm', authPassport.checkRecaptcha, async function(
    req: Request,
    res: Response
  ) {
    try {
      await AuthService.confirmReset(req.body as unknown)
      res.sendStatus(200)
    } catch (err) {
      resError(res, err)
    }
  })

  app.use('/auth', router)
}
