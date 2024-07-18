import { Express, Router } from 'express'
import { extractUser } from '../extract-user'
import * as TeacherService from '../../services/TeacherService'
import { resError } from '../res-error'

export function routeTeachers(app: Express, router: Router): void {
  router.route('/class').post(async function(req, res) {
    try {
      const user = extractUser(req)
      const className = req.body.className as string
      const teacherClass = await TeacherService.createTeacherClass(
        user.id,
        className
      )
      res.json({ teacherClass })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/classes').get(async function(req, res) {
    try {
      const user = extractUser(req)
      const teacherClasses = await TeacherService.getTeacherClasses(user.id)
      res.json({ teacherClasses })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/class/:classId').get(async function(req, res) {
    try {
      const classId = req.params.classId as string
      const students = await TeacherService.getStudentsInTeacherClass(classId)
      res.json({ students })
    } catch (err) {
      resError(res, err)
    }
  })

  app.use('/api/teachers', router)
}
