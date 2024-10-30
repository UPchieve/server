import multer from 'multer'
import { Express, Router } from 'express'
import { authPassport } from '../../utils/auth-utils'
import { resError } from '../res-error'
import { readCsvFromBuffer } from '../../utils/file-utils'
import * as CleverRosterService from '../../services/CleverRosterService'
import { getPartnerSchools } from '../../services/SchoolService'
import {
  RosterStudentPayload,
  rosterPartnerStudents,
} from '../../services/UserCreationService'
import { asString } from '../../utils/type-utils'

export function routeAdmin(app: Express, router: Router): void {
  const upload = multer()

  router.get('/schools/partner-schools', async function(_req, res) {
    try {
      const schools = await getPartnerSchools()
      res.send(schools)
    } catch (error) {
      resError(res, error)
    }
  })

  router.post('/roster-students', upload.single('studentsFile'), async function(
    req,
    res
  ) {
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
  })

  router.post('/clever/roster', async function(req, res) {
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

  app.use('/api/admin', authPassport.isAdmin, router)
}
