import { Express, Router, Request, Response } from 'express'
import passport from 'passport'

import * as AuthService from '../../services/AuthService'
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
import { Ulid } from '../../models/pgUtils'
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
    const isLogin = req.query.isLogin === 'true'
    if (!provider || !isSupportedSsoProvider(provider)) {
      res.redirect(AuthRedirect.failureRedirect(isLogin))
      return
    }
    if (!isLogin) {
      ;(req.session as SessionWithSsoData).studentData = {
        ...req.query,
        ip: req.ip,
      }
    }
    ;(req.session as SessionWithSsoData).provider = provider
    ;(req.session as SessionWithSsoData).isLogin = isLogin
    const strategy = provider
    passport.authenticate(strategy)(req, res)
  })
  // Redirect URI for SSO providers.
  router.route('/oauth2/redirect').get((req, res) => {
    const { provider, isLogin, studentData } = req.session as SessionWithSsoData
    if (!provider || !isSupportedSsoProvider(provider)) {
      res.redirect(AuthRedirect.failureRedirect(isLogin ?? false, studentData))
      return
    }
    const strategy = provider
    passport.authenticate(strategy, async function(_err, user, errorMsg) {
      if (user) {
        await req.asyncLogin(user)
        return res.redirect(AuthRedirect.successRedirect)
      } else {
        return res.redirect(
          AuthRedirect.failureRedirect(isLogin ?? false, studentData, errorMsg)
        )
      }
    })(req, res)
  })

  // == Remove after high-line clean-up.
  router.route('/login/google').get(passport.authenticate('google-login'))
  router.route('/oauth2/redirect/google/login').get(
    passport.authenticate('google-login', {
      successRedirect: AuthRedirect.successRedirect,
      failureRedirect: AuthRedirect.loginFailureRedirect,
    })
  )

  router.route('/register/google/student').get(function(req, res) {
    ;(req.session as any).studentData = req.query
    ;(req.session as any).studentData.ip = req.ip
    passport.authenticate('google-register-student')(req, res)
  })
  router
    .route('/oauth2/redirect/google/register/student')
    .get(function(req, res) {
      passport.authenticate('google-register-student', async function(
        _err,
        user,
        info
      ) {
        const studentData = (req.session as any).studentData
        delete (req.session as any).studentData
        if (user) {
          res.redirect(AuthRedirect.successRedirect)
          await req.asyncLogin(user)
        } else {
          res.redirect(AuthRedirect.registerFailureRedirect(studentData, info))
        }
      })(req, res)
    })

  router.route('/register/google/partner-student').get(function(req, res) {
    ;(req.session as any).studentData = req.query
    passport.authenticate('google-register-partner-student')(req, res)
  })
  router
    .route('/oauth2/redirect/google/register/partner-student')
    .get(function(req, res) {
      passport.authenticate('google-register-partner-student', async function(
        _err,
        user,
        info
      ) {
        const studentData = (req.session as any).studentData
        delete (req.session as any).studentData
        if (user) {
          res.redirect(AuthRedirect.successRedirect)
          await req.asyncLogin(user)
        } else {
          res.redirect(
            AuthRedirect.registerPartnerStudentFailureRedirect(
              studentData,
              info
            )
          )
        }
      })(req, res)
    })
  // == End remove.

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
      const data = registerStudentValidator({
        ...req.body,
        ip: req.ip,
      })
      const student = await UserCreationService.registerStudent(data)
      if (data.password) {
        await req.asyncLogin(student)
      }
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

  router.route('/register/student/open').post(async function(req, res) {
    try {
      const student = await AuthService.registerOpenStudent({
        ...req.body,
        ip: req.ip,
      } as unknown)
      await req.asyncLogin(student)
      res.json({ user: student })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/register/student/partner').post(async function(req, res) {
    try {
      const student = await AuthService.registerPartnerStudent({
        ...req.body,
        ip: req.ip,
      } as unknown)
      await req.asyncLogin(student)
      res.json({ user: student })
    } catch (err) {
      resError(res, err)
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
