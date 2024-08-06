import express, { Express, Router } from 'express'
import { extractUserIfExists } from '../extract-user'
import { resError } from '../res-error'
import * as StudentService from '../../services/StudentService'
import * as TeacherService from '../../services/TeacherService'
import { InputError } from '../../models/Errors'

export function routes(app: Express) {
  const router: Router = express.Router()

  router.post('/students/class', async function(req, res) {
    try {
      const classCode = req.body.classCode as string
      const email = req.body.email as string
      const authenticatedUser = extractUserIfExists(req)

      if (authenticatedUser?.email === email) {
        const teacherClass = await TeacherService.addStudentToTeacherClass(
          authenticatedUser.id,
          classCode
        )
        return res.json({ teacherClass })
      }

      const teacherClass = await TeacherService.getTeacherClassByClassCode(
        classCode
      )
      if (!teacherClass) {
        throw new InputError('Invalid class code.')
      }

      const isExistingStudent = await StudentService.doesStudentWithEmailExist(
        email
      )
      res.json({ isExistingStudent })
    } catch (err) {
      resError(res, err)
    }
  })

  app.use('/api-public', router)
}
