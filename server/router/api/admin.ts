import multer from 'multer'
import { Router } from 'express'
import { authPassport } from '../../utils/auth-utils'
import { resError } from '../res-error'
import { readCsvFromBuffer } from '../../utils/file-utils'
import * as CleverRosterService from '../../services/CleverRosterService'
import * as SchoolService from '../../services/SchoolService'
import { getPartnerSchools } from '../../services/SchoolService'
import { insertTextModerationPattern } from '../../services/TextModerationPatternService'
import {
  RosterStudentPayload,
  rosterPartnerStudents,
} from '../../services/UserCreationService'
import {
  asArray,
  asBoolean,
  asNumber,
  asOptional,
  asString,
  asUlid,
} from '../../utils/type-utils'
import * as NTHSGroupsService from '../../services/NTHSGroupsService'
import { isValidStatus } from '../../models/NTHSGroups'
import { InputError } from '../../models/Errors'

export function routeAdmin(apiRouter: Router): void {
  const router = Router()
  const upload = multer()

  router.get('/schools', async function (req, res) {
    try {
      const payload = {
        name: asString(req.query.name),
        state: asString(req.query.state),
        city: asString(req.query.city),
        ncesId: asString(req.query.ncesId),
        isPartner: req.query.isPartner
          ? asBoolean(req.query.isPartner)
          : undefined,
        page: asNumber(req.query.page),
      }
      const result = await SchoolService.getSchools(payload)
      res.json(result)
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/school/:schoolId', async function (req, res) {
    try {
      const schoolId = asUlid(req.params.schoolId)
      const school = await SchoolService.getSchool(schoolId)
      res.json({ school })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/schools/partner-schools', async function (_req, res) {
    try {
      const schools = await getPartnerSchools()
      res.send(schools)
    } catch (error) {
      resError(res, error)
    }
  })

  router.post(
    '/roster-students',
    upload.single('studentsFile'),
    async function (req, res) {
      try {
        if (!req.body.schoolId || !req.file) {
          res.status(500).json({
            err: 'Missing required data.',
          })
          return
        }
        const students = readCsvFromBuffer<RosterStudentPayload>(
          req.file.buffer,
          ['firstName', 'lastName', 'email', 'gradeLevel']
        )
        const { failed, updated } = await rosterPartnerStudents(
          students,
          req.body.schoolId
        )
        res.json({ failed, updated })
      } catch (error) {
        resError(res, error)
      }
    }
  )

  router.post('/clever/roster', async function (req, res) {
    req.clearTimeout()
    const districtId = asString(req.body.districtId)

    if (!districtId) {
      res.status(422).json({
        err: 'Missing district id.',
      })
    }

    try {
      const report = await CleverRosterService.rosterDistrict(districtId)
      res.json({ report })
    } catch (error) {
      resError(res, error)
    }
  })

  router.post('/clever/school', async function (req, res) {
    try {
      await CleverRosterService.addCleverSchoolMapping(
        asString(req.body.cleverSchoolId),
        asString(req.body.upchieveSchoolId)
      )
      res.status(200).send()
    } catch (error) {
      resError(res, error)
    }
  })

  router.post('/nths/candidate-applications', async function (req, res) {
    try {
      const status = asString(req.body.status)
      const userId = asString(req.body.userId)
      const deniedNotes = asOptional(asString)(req.body.deniedNotes)
      if (isValidStatus(status)) {
        const result = await NTHSGroupsService.createCandidateApplication({
          status,
          userId,
          deniedNotes,
        })
        res.json(result)
      } else {
        throw new InputError(
          `Invalid NTHS Candidate status: ${status}. must be: 'applied', 'denied', or 'approved'`
        )
      }
    } catch (err) {
      resError(res, err)
    }
  })

  router.post('/nths/school-affiliation', async function (req, res) {
    try {
      const groupIds = asArray(asString)(req.body.chapterIds)
      if (!groupIds.length) {
        throw new InputError('No chapter IDs provided')
      }
      await NTHSGroupsService.makeChaptersSchoolOfficial(groupIds)
      res.status(201).send()
    } catch (err) {
      resError(res, err)
    }
  })

  router.post('/moderation/text-patterns', async function (req, res) {
    try {
      await insertTextModerationPattern(
        req.body.regex,
        req.body.flags,
        req.body.rules
      )
      res.status(201).send()
    } catch (err) {
      resError(res, err)
    }
  })

  apiRouter.use('/admin', authPassport.isAdmin, router)
}
