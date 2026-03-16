import multer from 'multer'
import { Router } from 'express'
import { authPassport } from '../../utils/auth-utils'
import { resError } from '../res-error'
import { readCsvFromBuffer } from '../../utils/file-utils'
import * as CleverRosterService from '../../services/CleverRosterService'
import * as SchoolService from '../../services/SchoolService'
import * as UserCreationService from '../../services/UserCreationService'
import {
  GetSchoolsQuerySchema,
  GetSchoolParamsSchema,
  AdminSchoolPublic,
  GetAdminSchoolsPublic,
  AdminPartnerSchoolPublic,
} from '../../contracts/schools'
import {
  CleverRosterBodySchema,
  CleverRosterResponsePublic,
  CleverSchoolBodySchema,
} from '../../contracts/clever'
import { RosterStudentsBodySchema } from '../../contracts/user-creation'
import { asOptional, asString } from '../../utils/type-utils'
import * as NTHSGroupsService from '../../services/NTHSGroupsService'
import { isValidStatus } from '../../models/NTHSGroups'
import { InputError } from '../../models/Errors'

export function routeAdmin(apiRouter: Router): void {
  const router = Router()
  const upload = multer()

  router.get('/schools', async function (req, res) {
    try {
      const query = GetSchoolsQuerySchema.parse(req.query)
      const resultInternal = await SchoolService.getSchools(query)
      const result: GetAdminSchoolsPublic = {
        isLastPage: resultInternal.isLastPage,
        totalCount: resultInternal.totalCount,
        schools: resultInternal.schools.map(SchoolService.toAdminSchoolPublic),
      }
      res.json(result)
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/school/:schoolId', async function (req, res) {
    try {
      const { schoolId } = GetSchoolParamsSchema.parse(req.params)
      const schoolInternal = await SchoolService.getSchool(schoolId)
      const school: AdminSchoolPublic =
        SchoolService.toAdminSchoolPublic(schoolInternal)
      res.json({ school })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/schools/partner-schools', async function (_req, res) {
    try {
      const schoolsInternal = await SchoolService.getPartnerSchools()
      const partnerSchools: AdminPartnerSchoolPublic[] = schoolsInternal.map(
        SchoolService.toAdminPartnerSchoolPublic
      )
      res.send(partnerSchools)
    } catch (error) {
      resError(res, error)
    }
  })

  router.post(
    '/roster-students',
    upload.single('studentsFile'),
    async function (req, res) {
      try {
        const body = RosterStudentsBodySchema.parse(req.body)
        if (!req.file) {
          res.status(500).json({
            err: 'Missing required data.',
          })
          return
        }
        const students =
          readCsvFromBuffer<UserCreationService.RosterStudentPayload>(
            req.file.buffer,
            ['firstName', 'lastName', 'email', 'gradeLevel']
          )
        const dataInternal = await UserCreationService.rosterPartnerStudents(
          students,
          body.schoolId
        )
        const { failed, updated } =
          UserCreationService.toRosterStudentsResultPublic(dataInternal)
        res.json({ failed, updated })
      } catch (error) {
        resError(res, error)
      }
    }
  )

  router.post('/clever/roster', async function (req, res) {
    req.clearTimeout()

    try {
      const { districtId } = CleverRosterBodySchema.parse(req.body)
      const reportInternal =
        await CleverRosterService.rosterDistrict(districtId)
      const report =
        CleverRosterService.toCleverRosterReportPublic(reportInternal)
      const response: CleverRosterResponsePublic = { report }
      res.json(response)
    } catch (error) {
      resError(res, error)
    }
  })

  router.post('/clever/school', async function (req, res) {
    try {
      const body = CleverSchoolBodySchema.parse(req.body)
      await CleverRosterService.addCleverSchoolMapping(
        body.cleverSchoolId,
        body.upchieveSchoolId
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

  apiRouter.use('/admin', authPassport.isAdmin, router)
}
