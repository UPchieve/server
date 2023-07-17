import { Express, Router } from 'express'
import passport from 'passport'

import * as AuthService from '../../services/AuthService'
import { authPassport, StudentDataParams } from '../../utils/auth-utils'
import { InputError, LookupError } from '../../models/Errors'
import { resError } from '../res-error'
import { getUserIdByEmail } from '../../models/User/queries'
import { asBoolean, asString } from '../../utils/type-utils'
import { Ulid } from '../../models/pgUtils'
import logger from '../../logger'
import { getLegacyUserObject } from '../../models/User/legacy-user'
import { extractUser } from '../extract-user'
import config from '../../config'

class GoogleAuthRedirect {
  private static _baseRedirect: string

  private static getBaseRedirect() {
    if (!this._baseRedirect) {
      let protocol
      if (config.NODE_ENV === 'dev') {
        protocol = 'http'
      } else {
        protocol = 'https'
      }
      this._baseRedirect = `${protocol}://${config.client.host}`
    }

    return this._baseRedirect
  }

  static get successRedirect() {
    return this.getBaseRedirect()
  }

  static get loginFailureRedirect() {
    return `${this.getBaseRedirect()}/login?400=true`
  }

  static registerFailureRedirect(
    studentData: StudentDataParams,
    errMsg?: string
  ) {
    const params = new URLSearchParams({
      email: studentData.email,
      highSchoolId: studentData.highSchoolId,
      zipCode: studentData.zipCode,
      currentGrade: studentData.currentGrade,
    })
    if (errMsg) {
      params.append('error', errMsg)
    }
    return `${this.getBaseRedirect()}/sign-up/student/account?${params.toString()}`
  }
}

export function routes(app: Express) {
  const router = Router()

  router.route('/logout').get(async function(req, res) {
    req.session.destroy(() => {
      /* do nothing */
    })

    // We do not remove all sessions from the database when users log out
    // because we have lots of students who share multiple devices. They may
    // want to log out of a laptop they share with a sibling, but stay logged
    // in on their mobile device, for example.

    req.logout()
    res.json({
      msg: 'You have been logged out',
    })
  })

  router.route('/login').post(
    // Delegate auth logic to passport middleware
    passport.authenticate('local'),
    // If successfully authed, return user object (otherwise 401 is returned from middleware)
    async function(req, res) {
      const legacyUser = await getLegacyUserObject(extractUser(req).id)
      res.json({ user: legacyUser })
    }
  )

  router.route('/login/google').get(passport.authenticate('google-login'))

  router.route('/oauth2/redirect/google/login').get(
    passport.authenticate('google-login', {
      successRedirect: GoogleAuthRedirect.successRedirect,
      failureRedirect: GoogleAuthRedirect.loginFailureRedirect,
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
          res.redirect(GoogleAuthRedirect.successRedirect)
          await req.asyncLogin(user)
        } else {
          res.redirect(
            GoogleAuthRedirect.registerFailureRedirect(studentData, info)
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
      let mobile: boolean | undefined
      if (req.body.mobile) mobile = asBoolean(req.body.mobile)
      try {
        await AuthService.sendReset(email as unknown, !!mobile)
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

  router.route('/reset/confirm').post(async function(req, res) {
    try {
      await AuthService.confirmReset(req.body as unknown)
      res.sendStatus(200)
    } catch (err) {
      resError(res, err)
    }
  })

  app.use('/auth', router)
}
