import express, { Express, Router } from 'express'
import * as Sentry from '@sentry/node'
import { authPassport } from '../../utils/auth-utils'
import * as SchoolService from '../../services/SchoolService'
import { getZipCodeByZipCode } from '../../models/ZipCode/queries'
import { getIneligibleStudentsPaginated } from '../../models/IneligibleStudent/queries'
import { resError } from '../res-error'
import * as IpAddressService from '../../services/IpAddressService'
import { asString, asUlid, asBoolean } from '../../utils/type-utils'
import {
  checkEligibility,
  checkZipCode,
} from '../../services/EligibilityService'
import { getStudentSignupSources } from '../../services/StudentService'

export function routes(app: Express) {
  const router: Router = express.Router()

  // Check if a student is eligible
  router.route('/check').post(async function(req, res) {
    try {
      const result = await checkEligibility(req.ip, req.body as unknown)
      return res.json(result)
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/school/search').get(async (req, res) => {
    const { q } = req.query

    try {
      const results = await SchoolService.search(q as string)
      res.json({
        results: results,
      })
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/school/:schoolId', authPassport.isAdmin, async function(
    req,
    res
  ) {
    try {
      const schoolId = asUlid(req.params.schoolId)
      const school = await SchoolService.getSchool(schoolId)
      res.json({
        school: {
          _id: school.id,
          ...school,
        },
      })
    } catch (err) {
      resError(res, err)
    }
  })
  router.put('/school/:schoolId', authPassport.isAdmin, async function(
    req,
    res
  ) {
    try {
      const schoolId = asUlid(req.params.schoolId)
      await SchoolService.adminUpdateSchool({
        schoolId,
        ...req.body,
      } as unknown)
      res.sendStatus(200)
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/schools', authPassport.isAdmin, async function(req, res) {
    try {
      const { schools, isLastPage } = await SchoolService.getSchools(
        req.query as unknown
      )
      res.json({ schools, isLastPage })
    } catch (err) {
      resError(res, err)
    }
  })

  router.post('/school/approval', authPassport.isAdmin, async function(
    req,
    res
  ) {
    try {
      const schoolId = asUlid(req.body.schoolId)
      const isApproved = asBoolean(req.body.isApproved)
      await SchoolService.updateApproval(schoolId, isApproved)
      res.sendStatus(200)
    } catch (err) {
      Sentry.captureException(err)
      res.sendStatus(500)
    }
  })

  router.post('/school/partner', authPassport.isAdmin, async function(
    req,
    res
  ) {
    try {
      const schoolId = asUlid(req.body.schoolId)
      const isPartner = asBoolean(req.body.isPartner)
      await SchoolService.updateIsPartner(schoolId, isPartner)
      res.sendStatus(200)
    } catch (err) {
      Sentry.captureException(err)
      res.sendStatus(500)
    }
  })

  router.get('/ineligible-students', authPassport.isAdmin, async function(
    req,
    res
  ) {
    try {
      const PER_PAGE = 15

      const page = req.query.page ? parseInt(req.query.page as string) : 1
      const skip = (page - 1) * PER_PAGE
      const ineligibleStudents = await getIneligibleStudentsPaginated(
        PER_PAGE,
        skip
      )
      const isLastPage = ineligibleStudents.length < PER_PAGE

      res.json({ ineligibleStudents, isLastPage })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/zip-codes/:zipCode', authPassport.isAdmin, async function(
    req,
    res
  ) {
    const zipCode = asString(req.params.zipCode)

    try {
      const result = await getZipCodeByZipCode(zipCode)
      if (!result) res.sendStatus(404)
      else
        res.json({
          zipCode: { ...result },
        })
    } catch (err) {
      Sentry.captureException(err)
      res.sendStatus(500)
    }
  })

  router.get('/ip-check', async function(req, res) {
    try {
      await IpAddressService.checkIpAddress(req.ip)
      res.sendStatus(200)
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/check-zip-code/:zipCode', async function(req, res) {
    try {
      const zipCode = asString(req.params.zipCode)
      const result = await checkZipCode(zipCode)
      res.json({ isValidZipCode: result })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/signup-sources/students', async function(req, res) {
    try {
      const signupSources = await getStudentSignupSources()
      res.json({ signupSources })
    } catch (err) {
      resError(res, err)
    }
  })

  app.use('/api-public/eligibility', router)
}
