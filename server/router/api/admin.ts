import multer from 'multer'
import { Express, Router } from 'express'
import { authPassport } from '../../utils/auth-utils'
import { getPartnerSchools } from '../../services/SchoolService'
import { resError } from '../res-error'
import { readCsvFromBuffer } from '../../utils/file-utils'
import {
  RosterStudentPayload,
  rosterPartnerStudents,
} from '../../services/UserCreationService'

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
      const failedUsers = await rosterPartnerStudents(
        students,
        req.body.schoolId,
        req.body.partnerKey,
        req.body.partnerSite
      )
      res.json({ failedUsers })
    } catch (error) {
      resError(res, error)
    }
  })

  app.use('/api/admin', authPassport.isAdmin, router)
}
