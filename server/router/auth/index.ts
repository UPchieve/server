import { Express, Router, Response } from 'express'
import passport from 'passport'
import { CustomError } from 'ts-custom-error'

import * as AuthService from '../../services/AuthService'
import {
  authPassport,
  RegistrationError,
  ResetError
} from '../../utils/auth-utils'
import { LookupError } from '../../services/Errors'
import {
  RequestError,
  errorHandler as genericHandler
} from '../Errors'

function errorHandler(res: Response, err: CustomError, status?: number): void {
  if (status) {
    /* keep provided status */
  }
  else if (err instanceof RegistrationError) status = 422
  else if (err instanceof ResetError) status = 422

  genericHandler(res, err, status)
}

// TODO: type passport request member methods/variable correctly (login, logout, user)
export function routes(app: Express) {
  const router = Router()

  router.route('/logout').get(function(req, res) {
    req.session.destroy(() => {
      /* do nothing */
    })
    // @ts-expect-error
    req.logout()
    res.json({
      msg: 'You have been logged out'
    })
  })

  router.route('/login').post(
    // Delegate auth logic to passport middleware
    passport.authenticate('local'),
    // If successfully authed, return user object (otherwise 401 is returned from middleware)
    function(req, res) {
      // @ts-expect-error
      res.json({ user: req.user })
    }
  )

  router.route('/register/checkcred').post(async function(req, res) {
    try {
      const checked = await AuthService.checkCredential(req.body as unknown)
      return res.json({ checked })
    } catch (err) {
      errorHandler(res, err)
    }
  })

  router.route('/register/student').post(async function(req, res) {
    try {
      const student = await AuthService.registerStudent({
        ...req.body,
        ip: req.ip
      } as unknown)
      // @ts-expect-error
      await req.login(student)
      res.json({ user: student })
    } catch (err) {
      errorHandler(res, err)
    }
  })

  router.route('/register/volunteer/open').post(async function(req, res) {
    try {
      const volunteer = await AuthService.registerVolunteer({
        ...req.body,
        ip: req.ip
      } as unknown)
      // @ts-expect-error
      await req.login(volunteer)
      res.json({ user: volunteer })
    } catch (err) {
      errorHandler(res, err)
    }
  })

  router.route('/register/volunteer/partner').post(async function(req, res) {
    try {
      const volunteer = await AuthService.registerPartnerVolunteer({
        ...req.body,
        ip: req.ip
      } as unknown)
      // @ts-expect-error
      await req.login(volunteer)
      res.json({ user: volunteer })
    } catch (err) {
      errorHandler(res, err)
    }
  })

  router.route('/partner/volunteer').get(async function(req, res) {
    try {
      if (!req.query.hasOwnProperty('partnerId'))
        throw new RequestError('Missing volunteerPartnerId query string')
      const partner = await AuthService.lookupPartnerVolunteer(
        req.query.partnerId as unknown
      )
      res.json({ volunteerPartner: partner })
    } catch (err) {
      errorHandler(res, err)
    }
  })

  router.route('/partner/student').get(async function(req, res) {
    try {
      if (!req.query.hasOwnProperty('partnerId'))
        throw new RequestError('Missing studentPartnerId query string')
      const partner = await AuthService.lookupPartnerStudent(
        req.query.partnerId as unknown
      )
      res.json({ studentPartner: partner })
    } catch (err) {
      errorHandler(res, err)
    }
  })

  router.route('/partner/student/code').get(async function(req, res) {
    try {
      if (!req.query.hasOwnProperty('partnerSignupCode'))
        throw new RequestError('Missing partnerSignupCode query string')
      const studentPartnerKey = await AuthService.lookupPartnerStudentCode(
        req.query.partnerSignupCode as unknown
      )
      res.json({ studentPartnerKey })
    } catch (err) {
      errorHandler(res, err)
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
        errorHandler(res, err)
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
        errorHandler(res, err)
      }
    })

  router.route('/reset/send').post(async function(req, res) {
    try {
      if (!req.body.hasOwnProperty('email'))
        throw new RequestError('Missing email body string')
      await AuthService.sendReset(req.body.email as unknown)
    } catch (err) {
      // Only return error if it is not from db lookup
      if (!(err instanceof LookupError)) return errorHandler(res, err) // will handle sending response with status/error
    }
    // do not respond with info about no email match
    res.status(200).json({
      msg:
        'If an account with this email address exists then we will send a password reset email'
    })
  })

  router.route('/reset/confirm').post(async function(req, res) {
    try {
      await AuthService.confirmReset(req.body as unknown)
      res.sendStatus(200)
    } catch (err) {
      errorHandler(res, err)
    }
  })

  app.use('/auth', router)
}
